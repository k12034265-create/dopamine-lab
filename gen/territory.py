"""陣取り対決（非ボール型・CLAUDE.md の新6型の3番目）。
2色のインクがマス目を塗り広げ合う。前半は空きマスを取り合い、全部埋まったあとは境界で押し合い。
途中で何度かリードが入れ替わり、最後に勝った色が光って「○○の勝ち！」。
0秒で両側からもう色が広がっていて、下に「赤 ○% | ○% 青」の綱引きバーが見えている。
使い方: python gen/territory.py SEED 出力.mp4 [--dur 26]
  SEED で勝つ色・逆転の回数とタイミング・地形が変わる。
テスト: FRAMES=120 python gen/territory.py 1 /tmp/x.mp4 （先頭120フレームだけ描く）
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
ARGS = sys.argv[1:]
DUR_ = 26.0
if '--dur' in ARGS:
    _i = ARGS.index('--dur'); DUR_ = float(ARGS[_i + 1]); del ARGS[_i:_i + 2]
import lib
lib.DUR = DUR_; lib.NF = int(DUR_ * 60)
from lib import *
DUR = lib.DUR; NF = lib.NF

SEED = int(ARGS[0]) if len(ARGS) > 0 else 1
OUT = ARGS[1] if len(ARGS) > 1 else 'territory.mp4'
rng = np.random.default_rng(SEED)

GC, GR = 48, 64                      # grid
CELL = 20
BX = (W - GC * CELL) // 2
BY = 1010 - GR * CELL // 2
# side 1 = 赤（左上から）, side 2 = 青（右下から）
NAMES = {1: '赤', 2: '青'}
COL = {1: (70, 70, 255), 2: (255, 170, 40)}           # BGR
COL_RGB = {1: (255, 80, 80), 2: (60, 180, 255)}

LOOP_XF = 24
T_FULL = 6.5                         # 空きマスが無くなる目安
T_END = DUR - 3.6                    # 決着
WIN = 1 if rng.random() < 0.5 else 2
FINAL = 0.57 + 0.06 * rng.random()   # 勝った色の最終シェア
# 目標の推移（赤のシェア）。リードが2〜3回入れ替わる
nsw = int(rng.integers(2, 4))
knots_t = np.linspace(T_FULL, T_END, nsw + 2)
lead = 1 if (nsw % 2 == 0) == (WIN == 1) else 2       # 最初にリードする色（最後にWINになるように交互）
vals = []
for i in range(nsw + 1):
    who = lead if i % 2 == 0 else 3 - lead
    m = 0.55 + 0.07 * rng.random()
    vals.append(m if who == 1 else 1 - m)
vals.append(FINAL if WIN == 1 else 1 - FINAL)
vals[0] = 0.5 + (vals[0] - 0.5) * 0.4   # 埋まった直後はほぼ互角
knots_v = np.array(vals)


def target(t):
    return float(np.interp(t, knots_t, knots_v))


# ---------------- simulation (precompute one grid per frame)
g = np.zeros((GR, GC), np.uint8)
born = np.full((GR, GC), -9.0, np.float32)
# 少しだけ地形のゆらぎ（塗りやすさ）
noise = cv2.GaussianBlur(rng.random((GR, GC)).astype(np.float32), (0, 0), 3)
noise = (noise - noise.min()) / (np.ptp(noise) + 1e-6)
# 2色の種を盤面にばらまく（上半分に赤が多め・下半分に青が多め、ただし入り組ませる）
seeds = {1: [], 2: []}
for k in range(10):
    s_ = 1 if k % 2 == 0 else 2
    for _try in range(50):
        r = int(rng.integers(3, GR - 3)); c = int(rng.integers(3, GC - 3))
        if (s_ == 1) == (r < GR * (0.5 + 0.25 * (rng.random() - 0.5))) or rng.random() < 0.25:
            break
    seeds[s_].append((r, c))
for s, pts in seeds.items():
    for r, c in pts:
        g[max(0, r - 1):r + 2, max(0, c - 1):c + 2] = s

K8 = np.array([[1, 1, 1], [1, 0, 1], [1, 1, 1]], np.float32)


def counts(gg):
    a = cv2.filter2D((gg == 1).astype(np.float32), -1, K8, borderType=cv2.BORDER_CONSTANT)
    b = cv2.filter2D((gg == 2).astype(np.float32), -1, K8, borderType=cv2.BORDER_CONSTANT)
    return a, b


def grow_step(gg, tt, rate):
    a, b = counts(gg)
    emp = gg == 0
    pa = 1 - (1 - rate * (0.6 + 0.8 * noise)) ** a
    pb = 1 - (1 - rate * (0.6 + 0.8 * (1 - noise))) ** b
    ra = rng.random(gg.shape) < pa
    rb = rng.random(gg.shape) < pb
    both = ra & rb
    pick = rng.random(gg.shape) < 0.5
    newa = emp & ra & (~both | pick)
    newb = emp & rb & (~both | ~pick)
    gg[newa] = 1; gg[newb] = 2
    born[newa | newb] = tt
    return int(newa.sum() + newb.sum())


def battle_step(gg, tt, bias, heat):
    a, b = counts(gg)
    # 赤マスが青になる確率 ∝ 周りの青の数^2、bias>0 なら赤が有利
    pa2b = heat * (b / 8) ** 2 * np.exp(-bias)
    pb2a = heat * (a / 8) ** 2 * np.exp(bias)
    fa = (gg == 1) & (rng.random(gg.shape) < pa2b)
    fb = (gg == 2) & (rng.random(gg.shape) < pb2a)
    gg[fa] = 2; gg[fb] = 1
    born[fa | fb] = tt
    return int(fa.sum() + fb.sum())


RATE0 = float(os.environ.get('RATE0', 0.0036))
PRE = 1.4                    # 0秒の時点で、すでにこの秒数ぶん広がっている
SUB = 3
frames = []
shares = []
events = []                  # 1フレームあたりの塗り替え数（音用）
tot = GR * GC
t = -PRE
f = -int(PRE * FPS)
bias_i = 0.0
while f < NF:
    t = f / FPS
    nchg = 0
    for _ in range(SUB):
        if (g == 0).any():
            # 埋まるのが T_FULL ごろになるよう、速さを少しずつ上げる
            rate = RATE0 * (0.6 + 1.2 * max(0.0, (t + PRE) / (T_FULL + PRE)) ** 1.5)
            nchg += grow_step(g, t, rate)
        if t < T_END and (t > T_FULL * 0.6):
            sh = (g == 1).sum() / max(1, ((g == 1) | (g == 2)).sum())
            err = target(max(t, T_FULL)) - sh
            bias_i = np.clip(bias_i + err * 0.02, -0.6, 0.6)
            bias = np.clip(err * 9 + bias_i, -2.2, 2.2)
            heat = 0.10 if (g == 0).any() else 0.16
            nchg += battle_step(g, t, bias, heat)
    if f >= 0:
        frames.append(g.copy())
        filled = ((g == 1) | (g == 2)).sum()
        if filled == tot and 'T_FILLED' not in globals():
            T_FILLED = t; print('filled at', round(t, 2))
        shares.append(((g == 1).sum() / tot, (g == 2).sum() / tot, filled / tot))
        events.append(nchg)
    f += 1
# リード（ヒステリシス付き：2%以上離れたら入れ替わり）
LEAD = []
cur = None
for r_, b_, _ in shares:
    if cur is None:
        cur = 1 if r_ >= b_ else 2
    elif cur == 1 and b_ - r_ > 0.02:
        cur = 2
    elif cur == 2 and r_ - b_ > 0.02:
        cur = 1
    LEAD.append(cur)
# born を各フレームで使うため、フレームごとに保存し直す（軽いので再シミュせず、変化からフラッシュを計算）
fin = frames[int(T_END * FPS)]
r_fin = (fin == 1).sum() / tot
WINNER = 1 if r_fin > 0.5 else 2
print('target win', WIN, 'actual', WINNER, 'final red %.3f' % r_fin)

# ---------------- audio
au = Audio(SEED)
au.beat(100, lambda tt: min(1.0, 0.25 + 0.75 * tt / T_END), 0.0, T_END)
PENT = [0, 2, 4, 7, 9]
last_lead = None
for fi in range(0, min(len(frames), int(T_END * FPS)), 3):
    tt = fi / FPS
    n_ = sum(events[fi:fi + 3])
    if n_ > 0:
        k = int(rng.integers(5))
        vol = min(0.12, 0.012 * np.sqrt(n_))
        au.add(au.pluck(523 * 2 ** (PENT[k] / 12) * (1 if rng.random() < 0.5 else 0.5), decay=30, dur=0.15, bright=0.1),
               tt, rng.random(), vol)
    ld = LEAD[fi]
    if tt > T_FULL * 0.8 and last_lead is not None and ld != last_lead:
        au.add(au.pluck(392 if ld == 1 else 494, decay=4, dur=0.8), tt, 0.5, 0.35)
        au.add(au.pluck(587 if ld == 1 else 740, decay=4, dur=0.8), tt + 0.05, 0.5, 0.25)
    last_lead = ld
au.riser(T_END, 4.0, 0.6)
au.add(au.smash(5 if WINNER == 1 else 9), T_END, 0.5, 0.85)
for j, mm in enumerate((1, 1.25, 1.5, 2, 2.5)):
    au.add(au.pluck(330 * mm, decay=1.4, dur=3), T_END + 0.1 + 0.07 * j, 0.5, 0.25)
n = int(DUR * SR)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
from scipy.io import wavfile
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

# ---------------- video
bg = make_bg(1010, (30, 18, 34))
enc = Enc(OUT + '.v.mp4')
first = None
flash = 0.0
LIMIT = int(os.environ.get('FRAMES', NF))
lastchg = np.full((GR, GC), -9.0, np.float32)
prev = frames[0].copy()
cellmask = np.zeros((GR * CELL, GC * CELL), np.float32)
for i in range(GR):
    for j in range(GC):
        cellmask[i * CELL + 1:(i + 1) * CELL - 1, j * CELL + 1:(j + 1) * CELL - 1] = 1
cellmask = cellmask[..., None]
pal = np.zeros((3, 3), np.float32)
pal[0] = (40, 32, 44); pal[1] = COL[1]; pal[2] = COL[2]
lead_prev = None
lead_pop = 0.0
for f in range(min(NF, LIMIT)):
    t = f / FPS
    gg = frames[f]
    lastchg[gg != prev] = t
    prev = gg
    small = pal[gg].copy()
    age = t - lastchg
    hot = np.exp(-np.maximum(age, 0) * 5)[..., None]
    small = small + (255 - small) * hot * 0.55
    if t >= T_END:
        q = t - T_END
        lose = 3 - WINNER
        dim = min(1.0, q * 2.5)
        small[gg == lose] *= (1 - 0.6 * dim)
        # 勝った色にキラッと光の帯
        yy, xx = np.mgrid[0:GR, 0:GC]
        band = np.exp(-(((xx / GC + yy / GR) - q * 1.4) ** 2) * 18)
        m = (gg == WINNER)
        small[m] = small[m] + (255 - small[m]) * band[m][:, None] * 0.7
    big = cv2.resize(small, (GC * CELL, GR * CELL), interpolation=cv2.INTER_NEAREST) * cellmask
    lay = np.zeros((H, W, 3), np.uint8)
    lay[BY:BY + GR * CELL, BX:BX + GC * CELL] = np.clip(big, 0, 255).astype(np.uint8)
    cv2.rectangle(lay, (BX - 6, BY - 6), (BX + GC * CELL + 5, BY + GR * CELL + 5), (90, 80, 100), 3)
    img = glow(bg, lay, 0.25, 5)
    r_, b_, _ = shares[f]
    # 綱引きバー
    bx0, bx1, byc = 90, W - 90, 1760
    tot_ = max(1e-6, r_ + b_)
    split = int(bx0 + (bx1 - bx0) * r_ / tot_)
    cv2.rectangle(img, (bx0, byc - 28), (split, byc + 28), COL[1], -1)
    cv2.rectangle(img, (split, byc - 28), (bx1, byc + 28), COL[2], -1)
    cv2.line(img, (W // 2, byc - 40), (W // 2, byc + 40), (255, 255, 255), 3)
    cv2.rectangle(img, (bx0, byc - 28), (bx1, byc + 28), (255, 255, 255), 3)
    put(img, f'{NAMES[1]} {round(100 * r_)}%', 250, byc - 95, 70, COL_RGB[1])
    put(img, f'{round(100 * b_)}% {NAMES[2]}', W - 250, byc - 95, 70, COL_RGB[2])
    ld = LEAD[f]
    if lead_prev is not None and ld != lead_prev and t > 1:
        lead_pop = 1.0
        flash = max(flash, 0.12)
    lead_prev = ld
    lead_pop *= 0.93
    if t < T_END:
        put(img, '赤と青、塗り合ったら…', 540, 180, 74)
        put(img, '最後に勝つのはどっち？', 540, 285, 70, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
        if lead_pop > 0.05 and t > T_FULL * 0.8:
            put(img, '逆転！', 540, BY + GR * CELL // 2, 150, COL_RGB[ld], 1 + 0.5 * lead_pop, min(1.0, lead_pop * 1.5))
    else:
        if t - 1 / FPS < T_END:
            flash = 0.5
        s_ = 1 + 1.4 * np.exp(-(t - T_END) * 7)
        put(img, f'{NAMES[WINNER]}の勝ち！', 540, 240, 120, COL_RGB[WINNER], s_)
    flash *= 0.88
    if flash > 0.02:
        img = cv2.addWeighted(img, 1.0, np.full_like(img, 255), flash, 0)
    if f == 0:
        first = img.copy()
    if f >= NF - LOOP_XF:
        k2 = (f - (NF - LOOP_XF)) / LOOP_XF
        img = cv2.addWeighted(img, 1 - k2, first, k2, 0)
    enc.write(img)
enc.close()
mux(OUT + '.v.mp4', OUT + '.wav', OUT); os.remove(OUT + '.v.mp4'); os.remove(OUT + '.wav')
lead_changes = sum(1 for i in range(1, int(T_END * FPS)) if LEAD[i] != LEAD[i - 1])
print('T_FULL', T_FULL, 'T_END', round(T_END, 2), 'winner', NAMES[WINNER], 'final', [round(x, 3) for x in shares[int(T_END * FPS)]], 'lead changes', lead_changes)
