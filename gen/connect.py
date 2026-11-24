"""同じ色の点を線でつなぐ（非ボール型・「colors connection」系）。
マス目に色の点が2つずつ置いてあり、同じ色どうしが線で1本ずつつながっていく。
線は交差せず、最後は盤面のマスが全部埋まって完成→キラッと光ってループ。
0秒で点が全部見えていて、1本目の線がもう半分まで伸びている状態から始まる。
使い方: python gen/connect.py SEED 出力.mp4 [--dur 26] [--n 8]
  SEED で盤面（線の形・色の並び）が変わる。N はマス目の数（8なら8×8）。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
ARGS = sys.argv[1:]
DUR_ = 26.0
N = 8
if '--dur' in ARGS:
    _i = ARGS.index('--dur'); DUR_ = float(ARGS[_i + 1]); del ARGS[_i:_i + 2]
if '--n' in ARGS:
    _i = ARGS.index('--n'); N = int(ARGS[_i + 1]); del ARGS[_i:_i + 2]
import lib
lib.DUR = DUR_; lib.NF = int(DUR_ * 60)
from lib import *
DUR = lib.DUR; NF = lib.NF

SEED = int(ARGS[0]) if len(ARGS) > 0 else 1
OUT = ARGS[1] if len(ARGS) > 1 else 'connect.mp4'
rng = np.random.default_rng(SEED)

# ---------------- puzzle: random Hamiltonian path (backbite moves) cut into segments
path = []
for r in range(N):
    row = [(r, c) for c in range(N)]
    path += row if r % 2 == 0 else row[::-1]


def nbrs(p):
    r, c = p
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        if 0 <= r + dr < N and 0 <= c + dc < N:
            yield (r + dr, c + dc)


for _ in range(N * N * 60):
    if rng.random() < 0.5:
        path.reverse()
    end = path[-1]
    cand = [q for q in nbrs(end) if q != path[-2]]
    q = cand[rng.integers(len(cand))]
    i = path.index(q)
    path = path[:i + 1] + path[i + 1:][::-1]

segs = []
i = 0
while i < len(path):
    rest = len(path) - i
    L = int(rng.integers(5, 10))
    if rest - L < 5:
        L = rest if rest <= 10 else rest // 2
    segs.append(path[i:i + L]); i += L
NS = len(segs)
# distinct colors: spread hues, alternate brightness
PAL = [(0.0, .85, 1), (0.08, .9, 1), (0.15, .85, 1), (0.33, .8, .9), (0.5, .8, 1), (0.63, .85, 1),
       (0.76, .7, 1), (0.9, .55, 1), (0.25, .9, .7), (0.0, 0.0, 0.95), (0.07, .75, .6), (0.55, .45, .65)]
order = rng.permutation(len(PAL))
COLS = []
for k in range(NS):
    h_, s_, v_ = PAL[order[k % len(PAL)]]
    COLS.append((h_, s_, v_ * (1.0 if k < len(PAL) else 0.6)))

# draw order: shortest first is boring; random but end with the longest for a finale
idx = list(rng.permutation(NS))
longest = max(range(NS), key=lambda k: len(segs[k]))
idx.remove(longest); idx.append(longest)
for k in range(NS):           # random direction for each line
    if rng.random() < 0.5:
        segs[k] = segs[k][::-1]

# ---------------- timeline (accelerating, overlapping)
LOOP_XF = 24
HOLD = 3.4
PRE = 0.0
dur_cells = []
t = 0.0
sched = {}
avail = DUR - HOLD - LOOP_XF / FPS
spd0 = 1.0
# raw schedule then scale to fit
raw = []
for n_, k in enumerate(idx):
    sp = 1.0 + 1.6 * n_ / max(1, NS - 1)     # cells per unit, increases
    d = (len(segs[k]) - 1) / sp
    raw.append((t, d, k))
    t += d * 0.55                             # next line starts before this one ends
total = max(a + b for a, b, _ in raw)
PRE_RAW = raw[0][1] * 0.5                     # first line already half drawn at 0s
scale = avail / (total - PRE_RAW)
SCHED = [((a - PRE_RAW) * scale, b * scale, k) for a, b, k in raw]
T_END = max(a + b for a, b, _ in SCHED)

CELL = 116 if N == 8 else int(940 / N)
BX = (W - CELL * N) // 2
BY = 1000 - CELL * N // 2


def cxy(p):
    r, c = p
    return BX + c * CELL + CELL / 2, BY + r * CELL + CELL / 2


def progress(k, t):
    for a, b, kk in SCHED:
        if kk == k:
            return float(np.clip((t - a) / b, 0, 1)), a, b
    return 0.0, 0, 1


# ---------------- audio
au = Audio(SEED)
PENT = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]
au.beat(96, lambda tt: min(1.0, 0.2 + tt / T_END), 0.0, T_END)
for n_, (a, b, k) in enumerate(SCHED):
    m = len(segs[k]) - 1
    base = 262 * 2 ** (PENT[n_ % 5] / 12)
    for j in range(1, m + 1):
        tt = a + b * j / m
        if tt < 0:
            continue
        au.add(au.pluck(base * 2 ** (PENT[min(j, 10)] / 12 / 2), decay=18, dur=0.25, bright=0.15), tt, 0.3 + 0.4 * (j % 2), 0.08)
    te = a + b
    if te > 0:
        au.add(au.pluck(base, decay=5, dur=0.9), te, 0.4, 0.3)
        au.add(au.pluck(base * 1.5, decay=5, dur=0.9), te + 0.03, 0.6, 0.25)
        au.add(au.pluck(base * 2, decay=5, dur=0.9), te + 0.06, 0.5, 0.2)
au.riser(T_END, 3.0, 0.5)
au.add(au.smash(7), T_END, 0.5, 0.8)
for j, mm in enumerate((1, 1.25, 1.5, 2, 2.5)):
    au.add(au.pluck(392 * mm, decay=1.4, dur=3), T_END + 0.1 + 0.07 * j, 0.5, 0.25)
n = int(DUR * SR)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
from scipy.io import wavfile
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

# ---------------- video
bg = make_bg(1000, (34, 20, 40))
enc = Enc(OUT + '.v.mp4')
first = None
flash = 0.0
LW = int(CELL * 0.36)
DOT = int(CELL * 0.33)
LIMIT = int(os.environ.get('FRAMES', NF))
for f in range(min(NF, LIMIT)):
    t = f / FPS
    lay = np.zeros((H, W, 3), np.uint8)
    # board
    cv2.rectangle(lay, (BX - 6, BY - 6), (BX + CELL * N + 6, BY + CELL * N + 6), (70, 60, 80), 3)
    ndone = 0
    for k in range(NS):
        p, a, b = progress(k, t)
        h, s, v = COLS[k]
        if p >= 1:
            ndone += 1
            age = t - (a + b)
            tint = 0.30 + 0.35 * np.exp(-age * 6)
            for q in segs[k]:
                x, y = cxy(q)
                cv2.rectangle(lay, (int(x - CELL / 2 + 2), int(y - CELL / 2 + 2)), (int(x + CELL / 2 - 2), int(y + CELL / 2 - 2)),
                              hsv(h, s, v * tint), -1)
    # grid lines
    for i in range(N + 1):
        cv2.line(lay, (BX + i * CELL, BY), (BX + i * CELL, BY + CELL * N), (60, 52, 66), 2)
        cv2.line(lay, (BX, BY + i * CELL), (BX + CELL * N, BY + i * CELL), (60, 52, 66), 2)
    for k in range(NS):
        p, a, b = progress(k, t)
        h, s, v = COLS[k]
        col = hsv(h, s, v)
        seg = segs[k]
        m = len(seg) - 1
        if p > 0:
            pos = p * m
            j = int(pos)
            pts = [cxy(q) for q in seg[:j + 1]]
            if j < m:
                (x0, y0), (x1, y1) = cxy(seg[j]), cxy(seg[j + 1])
                fr = pos - j
                pts.append((x0 + (x1 - x0) * fr, y0 + (y1 - y0) * fr))
            arr = np.array([[int(x), int(y)] for x, y in pts], np.int32)
            cv2.polylines(lay, [arr], False, col, LW, cv2.LINE_AA)
            for x, y in pts:
                cv2.circle(lay, (int(x), int(y)), LW // 2, col, -1, cv2.LINE_AA)
            if p < 1:
                hx, hy = pts[-1]
                cv2.circle(lay, (int(hx), int(hy)), int(LW * 0.75), hsv(h, 0.25, 1.0), -1, cv2.LINE_AA)
        # endpoints
        pop = 1.0
        if p >= 1:
            age = t - (a + b)
            pop = 1 + 0.45 * np.exp(-age * 9)
        elif p > 0 and t - a < 0.25 and t > 0:
            pop = 1 + 0.25 * np.exp(-(t - a) * 12)
        for q in (seg[0], seg[-1]):
            x, y = cxy(q)
            cv2.circle(lay, (int(x), int(y)), int(DOT * pop), col, -1, cv2.LINE_AA)
            cv2.circle(lay, (int(x - DOT * 0.3), int(y - DOT * 0.3)), max(3, int(DOT * 0.22)), hsv(h, 0.2, 1.0), -1, cv2.LINE_AA)
        if p >= 1 and t - (a + b) < 0.06:
            flash = max(flash, 0.06)
    if t >= T_END and t - 1 / FPS < T_END:
        flash = 0.5
    flash *= 0.88
    if t >= T_END:
        q = (t - T_END) * 1.3
        yy, xx = np.mgrid[0:H:8, 0:W:8]
        band = np.exp(-(((xx + yy) / (W + H) * 2.2 - q) ** 2) * 30).astype(np.float32)
        band = cv2.resize(band, (W, H))[..., None]
        lay = np.clip(lay.astype(np.float32) * (1 + 0.8 * band), 0, 255).astype(np.uint8)
    img = glow(bg, lay, 0.3, 5)
    put(img, '同じ色を全部つなげる…', 540, 190, 76)
    if t < T_END:
        put(img, 'マスは全部埋まる？', 540, 300, 66, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
        put(img, f'{ndone} / {NS}', 540, 1720, 84)
    else:
        s_ = 1 + 1.4 * np.exp(-(t - T_END) * 7)
        put(img, '全部埋まった！', 540, 300, 92, (255, 226, 60), s_)
        put(img, f'{NS} / {NS}', 540, 1720, 84)
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
print('T_END', round(T_END, 2), 'lines', NS, 'lens', [len(s) for s in segs])
