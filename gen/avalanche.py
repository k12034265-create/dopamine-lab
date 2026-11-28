"""砂山の大崩落（非ボール型・CLAUDE.md の新6型の5番目）。
台座の真ん中に、上から虹色の砂を1粒ずつ注いでいく。砂は「くっつく砂」なので普通よりずっと急な塔になる。
注ぐのが止まったあと、最後に白く光る1粒がゆっくり落ちてきて、てっぺんに乗った瞬間、塔が一気に崩れて
台座からあふれ落ち、床に低い砂山として広がる（オチ＝物理の結果そのもの）。下に「○粒」カウンター。
使い方: python3 gen/avalanche.py SEED 出力.mp4 [--dur 26]
  SEED で砂の色の始まり（色相）・崩れ方のゆらぎが変わる。
テスト: FRAMES=120 python3 gen/avalanche.py 1 /tmp/x.mp4 （先頭120フレームだけ描く）
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
from scipy.signal import butter, lfilter
from scipy.io import wavfile

SEED = int(ARGS[0]) if len(ARGS) > 0 else 1
OUT = ARGS[1] if len(ARGS) > 1 else 'avalanche.mp4'
NFR = int(os.environ.get('FRAMES', NF))

CS = 8
GW, GH = 135, 176
X0 = (W - GW * CS) // 2
Y0 = 330
PED_W, PED_H = 66, 30            # 台座（セル）
PX0 = (GW - PED_W) // 2
PX1 = PX0 + PED_W
PY0 = GH - PED_H
CXC = GW // 2
R_BUILD = 4                      # 積むときの急さ（斜めに落ちるのに必要な段差）
R_FALL = 1                       # 崩れたあと（ふつうの砂・45度）
T_STOP = 18.0                    # 注ぎ終わり（動画の秒）
T_LAND = T_STOP + 1.7            # 最後の1粒が着地
T_GO = T_LAND + 0.25             # 崩落開始
WALL = -2
rng0 = np.random.default_rng(SEED)
HUE0 = rng0.random()


def step(G, R, rng, lateral=0.0):
    # E[y,x] = (y,x) から下に続く空きマス数（崩れやすさの判定用）
    emp = (G == -1)
    E = np.zeros(G.shape, np.int16)
    run = np.zeros(GW, np.int16)
    for y in range(GH - 1, -1, -1):
        run = np.where(emp[y], run + 1, 0)
        E[y] = run
    for y in range(GH - 2, -1, -1):
        row = G[y]; below = G[y + 1]
        occ = row >= 0
        if not occ.any():
            continue
        down = occ & (below == -1)
        if down.any():
            below[down] = row[down]; row[down] = -1
        occ = row >= 0
        if not occ.any():
            continue
        dirs = rng.integers(0, 2, GW)
        for d, sh in ((0, -1), (1, 1)):
            idx = np.where(occ & (dirs == d))[0]
            tx = idx + sh
            ok = (tx >= 0) & (tx < GW)
            idx, tx = idx[ok], tx[ok]
            ok = (G[y + 1, tx] == -1) & (G[y, tx] == -1) & (E[y + 1, tx] >= R)
            idx, tx = idx[ok], tx[ok]
            tx, first = np.unique(tx, return_index=True); idx = idx[first]
            G[y + 1, tx] = G[y, idx]; G[y, idx] = -1
            occ = row >= 0
        if lateral > 0:
            # 崩落中は表面の粒が横にも滑る（勢い）
            for d, sh in ((0, -1), (1, 1)):
                idx = np.where(occ & (dirs == d) & (rng.random(GW) < lateral))[0]
                tx = idx + sh
                ok = (tx >= 0) & (tx < GW)
                idx, tx = idx[ok], tx[ok]
                ok = (G[y, tx] == -1) & (G[y + 1, tx] == -1)
                idx, tx = idx[ok], tx[ok]
                tx, first = np.unique(tx, return_index=True); idx = idx[first]
                G[y, tx] = G[y, idx]; G[y, idx] = -1
                occ = row >= 0


def surface(G, x):
    ys = np.where(G[:, x] != -1)[0]
    return ys[0] if len(ys) else GH


def relax(G, R, rng, iters=10 ** 9):
    # 隣の列より R 段以上高い列は、いちばん上の粒が隣へ滑る（1回に1列ぶん）
    for _ in range(iters):
        filled = (G != -1)
        ty = np.where(filled.any(0), filled.argmax(0), GH)
        moved = False
        tyl = np.r_[-1, ty[:-1]]; tyr = np.r_[ty[1:], -1]
        cand = np.where(((tyl - ty > R) | (tyr - ty > R)) & (ty < GH))[0]
        if len(cand) == 0:
            break
        for x in rng.permutation(cand):
            if ty[x] >= GH or G[ty[x], x] < 0:
                continue
            ds = (-1, 1) if rng.random() < 0.5 else (1, -1)
            for d in ds:
                nx = x + d
                if nx < 0 or nx >= GW:
                    continue
                if ty[nx] - ty[x] > R:
                    g = G[ty[x], x]; G[ty[x], x] = -1
                    G[ty[nx] - 1, nx] = g
                    ty[x] += 1; ty[nx] -= 1
                    moved = True
                    break
        if not moved:
            break


def base_halfwidth(G):
    top = G[PY0 - 1, PX0:PX1] >= 0
    if not top.any():
        return 0
    xs = np.where(top)[0] + PX0
    return max(CXC - xs.min(), xs.max() - CXC)


def simulate(pre, rate, record=False, stop_hw=PED_W // 2 - 3):
    rng = np.random.default_rng(SEED + 7)
    G = -np.ones((GH, GW), np.int32)
    G[PY0:, PX0:PX1] = WALL
    nid = 0
    birth = []
    frames, counts = [], []
    acc = 0.0
    stop_f = None
    f_stop_video = pre + int(T_STOP * FPS)
    total = pre + NFR if record else int(35 * FPS)
    for f in range(total):
        t = (f - pre) / FPS
        pouring = (stop_f is None) and (not record or f < f_stop_video)
        collapse = record and t >= T_GO
        steps = 4 if collapse else 3
        if pouring:
            # 注いだ粒はてっぺんに乗る（落ちてくる砂の線は描画で見せる）
            acc += rate
            k = int(acc); acc -= k
            for _ in range(k):
                y = surface(G, CXC) - 1
                G[y, CXC] = nid; nid += 1; birth.append(f)
        if record and abs(t - T_LAND) < 0.5 / FPS:
            # 最後の1粒をてっぺんに置く
            y = surface(G, CXC) - 1
            G[y, CXC] = nid; nid += 1; birth.append(-1)
        if not collapse:
            relax(G, R_BUILD, rng, 6)
        if not record and stop_f is None and base_halfwidth(G) >= stop_hw:
            stop_f = f
        if record and f >= pre:
            frames.append(G.copy()); counts.append(nid)
    return G, nid, stop_f, frames, counts, np.array(birth)


# 注ぐ速さを決める：台座のふちに届く直前（stop_hw）で T_STOP になるように
RATE = 2.5
WANT = int((T_STOP + 5.0) * FPS)   # 0秒の時点で約5秒分もう積もっている
for it in range(3):
    G_, n_, sf_, _, _, _ = simulate(0, RATE)
    if sf_ is None:
        RATE *= 1.5; continue
    if abs(sf_ - WANT) < 30:
        break
    RATE *= sf_ / WANT
    G_, n_, sf_, _, _, _ = simulate(0, RATE)
if sf_ is None:
    raise SystemExit('pile never reached the edge')
PRE = max(0, sf_ - int(T_STOP * FPS))
print('rate', RATE, 'edge frame', sf_, 'PRE sec', round(PRE / FPS, 2), 'grains at stop', n_)
G, nid, _, frames, counts, birth = simulate(PRE, RATE, record=True)
NFR = len(frames)
LAST = nid - 1
FGO = int(round(T_GO * FPS))
Ggo = frames[min(FGO, NFR - 1)].copy()
Gend = Ggo.copy()
relax(Gend, R_FALL, np.random.default_rng(SEED + 3))
P0 = np.zeros((nid, 2)); P1 = np.zeros((nid, 2))
for GG, P in ((Ggo, P0), (Gend, P1)):
    ys, xs = np.where(GG >= 0)
    P[GG[ys, xs]] = np.stack([xs, ys], 1)
crng = np.random.default_rng(SEED + 5)
dist = np.hypot(*(P1 - P0).T)
DELAY = crng.uniform(0, 0.25, nid) + (P0[:, 1] - P0[:, 1].min()) / GH * 0.35
DURM = 0.9 + 0.06 * np.sqrt(dist) + crng.uniform(0, 0.3, nid)
print('collapse ends', round(T_GO + (DELAY + DURM).max(), 2))
print('grains', nid)

# 色：注いだ順に虹色のしま（時間で色相が回る）
cols = np.zeros((nid + 2, 3), np.uint8)
rng = np.random.default_rng(99)
for gid in range(nid):
    bf = birth[gid]
    h = HUE0 + bf / FPS * 0.035
    band = 0.88 + 0.12 * np.sin(bf / FPS * 2.2)
    v = band * (0.86 + 0.14 * rng.random())
    cols[gid] = hsv(h, 0.62, v)
cols[LAST] = (255, 255, 255)
cols[nid] = (0, 0, 0)            # empty
cols[nid + 1] = (98, 84, 92)     # wall (BGR)

# 台座の模様（レンガ）
ped = np.zeros((PED_H * CS, PED_W * CS, 3), np.uint8)
ped[:] = (88, 74, 82)
for r in range(0, PED_H * CS, 36):
    cv2.line(ped, (0, r), (PED_W * CS, r), (60, 50, 58), 3)
    off = 0 if (r // 36) % 2 == 0 else 48
    for c in range(off, PED_W * CS, 96):
        cv2.line(ped, (c, r), (c, min(PED_H * CS, r + 36)), (60, 50, 58), 3)
cv2.rectangle(ped, (0, 0), (PED_W * CS - 1, PED_H * CS - 1), (130, 114, 124), 4)

# ---------------- audio ----------------
au = Audio(SEED)
n = int(DUR * SR)
b, a = butter(2, [2500 / (SR / 2), 9000 / (SR / 2)], 'band')
hiss = lfilter(b, a, np.random.default_rng(3).normal(0, 1, n)) * 0.10
env = np.ones(n)
i0 = int(T_STOP * SR)
env[i0:] = np.exp(-np.arange(n - i0) / SR * 6)
au.add(hiss * env, 0, 0.5, 1.0)
PENT = [0, 2, 4, 7, 9]
for k in range(20):
    t = k / 20 * T_STOP
    au.add(au.pluck(196 * 2 ** ((PENT[k % 5] + 12 * (k // 5)) / 12), decay=5, dur=0.9, bright=0.2), t, 0.5, 0.18 + 0.01 * k)
# 最後の1粒：静かになって、着地で「チン」
au.add(au.pluck(1568, decay=6, dur=1.5, bright=0.05), T_LAND, 0.5, 0.45)
au.riser(T_LAND, 1.6, 0.35)
# 崩落：地鳴り＋砂のザーッ
tt = np.arange(int(4.5 * SR)) / SR
bl, al = butter(2, 160 / (SR / 2), 'low')
rumble = lfilter(bl, al, np.random.default_rng(5).normal(0, 1, len(tt))) * np.minimum(1, tt * 6) * np.exp(-tt * 0.8) * 3.0
bh, ah = butter(2, [1200 / (SR / 2), 8000 / (SR / 2)], 'band')
whoosh = lfilter(bh, ah, np.random.default_rng(6).normal(0, 1, len(tt))) * np.minimum(1, tt * 4) * np.exp(-tt * 0.9) * 0.5
au.add(rumble + whoosh, T_GO, 0.5, 1.0)
au.add(au.smash(0), T_GO, 0.5, 0.7)
for j, m in enumerate((1, 1.25, 1.5, 2)):
    au.add(au.pluck(262 * m, decay=1.2, dur=3), T_GO + 3.2 + 0.07 * j, 0.5, 0.25)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

# ---------------- video ----------------
bg = make_bg(1150, (34, 26, 30))
enc = Enc(OUT + '.v.mp4')
first_img = None
flash = 0.0
srng = np.random.default_rng(1)
peak_y = None
for f in range(NFR):
    t = f / FPS
    G = frames[f]
    if t >= T_GO:
        G = np.where(G == WALL, WALL, -1)
    idx = np.where(G >= 0, G, np.where(G == WALL, nid + 1, nid))
    cell = cols[idx]
    big = cv2.resize(cell, (GW * CS, GH * CS), interpolation=cv2.INTER_NEAREST)
    big[PY0 * CS:, PX0 * CS:PX1 * CS] = ped
    if t >= T_GO:
        u = np.clip((t - T_GO - DELAY) / DURM, 0, 1)
        ux = u * u * (3 - 2 * u)         # 斜面をすべり落ちる（まっすぐ下向き）
        uy = np.minimum(1, ux + 0.12 * np.sin(np.pi * u) * (P1[:, 1] > P0[:, 1]))
        px = ((P0[:, 0] + (P1[:, 0] - P0[:, 0]) * ux) * CS).astype(int)
        py = ((P0[:, 1] + (P1[:, 1] - P0[:, 1]) * uy) * CS).astype(int)
        px = np.clip(px, 0, GW * CS - CS); py = np.clip(py, 0, GH * CS - CS)
        cc = cols[:nid]
        for dy in range(CS):
            for dx in range(CS):
                big[py + dy, px + dx] = cc
    lay = np.zeros((H, W, 3), np.uint8)
    lay[Y0:Y0 + GH * CS, X0:X0 + GW * CS] = big
    cv2.line(lay, (0, Y0 + GH * CS + 2), (W, Y0 + GH * CS + 2), (120, 104, 112), 4)
    # 上から落ちてくる砂の線（注いでいる間）
    if t < T_STOP:
        sy = surface(G, CXC)
        bf = PRE + f
        c = hsv(HUE0 + bf / FPS * 0.035, 0.62, 0.95)
        xx = X0 + CXC * CS
        for yy in range(Y0, Y0 + sy * CS, CS):
            if srng.random() < 0.8:
                jx = int(srng.integers(-1, 2))
                cv2.rectangle(lay, (xx + jx - 2, yy), (xx + jx + CS + 1, yy + CS - 1), c, -1)
    # 最後の1粒（落ちてくる途中は大きく光らせて描く）
    if T_STOP + 0.4 <= t < T_LAND:
        if peak_y is None:
            col = G[:, CXC]; ys = np.where(col != -1)[0]
            peak_y = Y0 + (ys[0] if len(ys) else GH) * CS
        k = (t - (T_STOP + 0.4)) / (T_LAND - T_STOP - 0.4)
        yy = int(Y0 - 40 + (peak_y - CS - (Y0 - 40)) * k ** 1.6)
        xx = X0 + CXC * CS + CS // 2
        cv2.circle(lay, (xx, yy), 9, (255, 255, 255), -1)
    if abs(t - T_LAND) < 0.5 / FPS: flash = 0.25
    if abs(t - T_GO) < 0.5 / FPS: flash = 0.45
    flash *= 0.88
    gl = 0.25
    if T_STOP + 0.4 <= t < T_GO + 0.6:
        gl = 0.45
    img = glow(bg, lay, gl, 4)
    # テロップ
    if t < T_STOP:
        put(img, '砂を1粒ずつ積んだら…', 540, 165, 80)
        put(img, '何粒目で崩れる？', 540, 265, 66, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
    elif t < T_GO:
        put(img, 'あと1粒で…？', 540, 215, 92, (255, 226, 60), 1 + 0.06 * np.sin(t * 9))
    else:
        s = 1 + 1.5 * np.exp(-(t - T_GO) * 7)
        put(img, '大崩落！', 540, 215, 120, (255, 120, 80), s)
    cnt = counts[f]
    label = f'{cnt:,}粒'
    if t >= T_GO:
        label = f'{counts[f]:,}粒目で崩れた！'
        put(img, label, 540, 1830, 70, (255, 226, 60))
    else:
        put(img, label, 540, 1830, 76)
    if t >= T_GO and t < T_GO + 2.2:
        sh = 9 * np.exp(-(t - T_GO) * 1.6)
        dx, dy = srng.normal(0, sh, 2)
        img = cv2.warpAffine(img, np.float32([[1, 0, dx], [0, 1, dy]]), (W, H), borderMode=cv2.BORDER_REFLECT)
    if flash > 0.02:
        img = cv2.addWeighted(img, 1.0, np.full_like(img, 255), flash, 0)
    if f == 0: first_img = img.copy()
    XF = 24
    if f >= NF - XF:
        k2 = (f - (NF - XF)) / XF
        img = cv2.addWeighted(img, 1 - k2, first_img, k2, 0)
    enc.write(img)
enc.close()
mux(OUT + '.v.mp4', OUT + '.wav', OUT); os.remove(OUT + '.v.mp4'); os.remove(OUT + '.wav')
