"""ドミノで絵が出る。usage: python3 domino.py SEED PIC OUT [--dur 秒]
--dur を20秒未満にすると短尺モード：端から倒れ始め、倒れた面は仮の色（虹色）で、
最後の約2.8秒でタイルが裏返って絵が出る（答えを最後まで隠す）。"""
import sys, colorsys
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from collections import deque
ARGS = sys.argv[1:]
DUR_ = 26.0
if '--dur' in ARGS:
    _i = ARGS.index('--dur'); DUR_ = float(ARGS[_i + 1]); del ARGS[_i:_i + 2]
SHORT = DUR_ < 20
import lib
lib.DUR = DUR_; lib.NF = int(DUR_ * 60)
from lib import *
DUR = lib.DUR; NF = lib.NF

SEED = int(ARGS[0]) if len(ARGS) > 0 else 2
PIC = ARGS[1] if len(ARGS) > 1 else 'sunset'
OUT = ARGS[2] if len(ARGS) > 2 else 'domino_short.mp4'
import pics
rng = np.random.default_rng(SEED)
GW_, GH_ = 44, 66
CS = 22
X0 = (W - GW_ * CS) // 2
Y0 = 390
# random spanning tree over grid (randomized BFS-ish growth from start) -> each domino has a parent direction
S = (GW_ // 2, GH_ - 1) if SHORT else (GW_ // 2, int(GH_ * 0.4))
parent = -np.ones((GH_, GW_, 2), int)
depth = np.full((GH_, GW_), -1)
depth[S[1], S[0]] = 0
frontier = [S]
while frontier:
    i = rng.integers(len(frontier)) if rng.random() < 0.6 else len(frontier) - 1
    x, y = frontier[i]
    nb = [(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < GW_ and 0 <= y + dy < GH_ and depth[y + dy, x + dx] < 0]
    if not nb:
        frontier.pop(i); continue
    nx, ny = nb[rng.integers(len(nb))]
    depth[ny, nx] = depth[y, x] + 1
    parent[ny, nx] = (x, y)
    frontier.append((nx, ny))
DMAX = depth.max()
START = 0.04 if SHORT else 0.3
REVEAL = 2.8                      # short mode: seconds left after the last domino falls
TF = (DUR - REVEAL - 0.18) / (1 - START ** 0.85) if SHORT else 29.0
# accelerate; shift so START fraction of depth is already down at t=0
fall_t = TF * ((depth / DMAX) ** 0.85 - START ** 0.85)
FALL_DUR = 0.18
TEND = fall_t.max() + FALL_DUR
# short mode: flip wave reveals the picture after everything has fallen
FLIP_DUR = 0.22
_yy, _xx = np.mgrid[0:GH_, 0:GW_]
flip_t = TEND + 0.08 + 0.6 * (GH_ - 1 - _yy) / (GH_ - 1) + 0.04 * np.abs(_xx - GW_ / 2) / GW_
TDONE = flip_t.max() + FLIP_DUR if SHORT else TEND
hue_d = (0.48 + 0.55 * depth / DMAX) % 1
hid_bgr = np.zeros((GH_, GW_, 3), np.uint8); std_bgr = np.zeros((GH_, GW_, 3), np.uint8)
for _y in range(GH_):
    for _x in range(GW_):
        hid_bgr[_y, _x] = hsv(hue_d[_y, _x], 0.55, 0.62)
        std_bgr[_y, _x] = hsv(hue_d[_y, _x], 0.6, 1.0)
print('dominoes', GW_ * GH_, 'depth', DMAX, 'end', round(TEND, 1))

img_src = pics.pic(PIC, GW_, GH_, SEED)
img_bgr = (img_src[..., ::-1] * 255).astype(np.uint8)

# audio: clicks by number of dominoes hitting per small window
au = Audio(61)
tk = np.arange(int(0.03 * SR)) / SR
from scipy.signal import butter, lfilter
b, a = butter(2, [1800 / (SR / 2), 7000 / (SR / 2)], 'band')
clicks = [lfilter(b, a, rng.normal(0, 1, len(tk))) * np.exp(-tk * 160) for _ in range(6)]
hits = np.sort((fall_t + FALL_DUR).ravel())
binw = 0.012
hits = hits[hits >= 0]
cnt = np.bincount((hits / binw).astype(int))
for k, c in enumerate(cnt):
    if c == 0: continue
    t = k * binw
    au.add(clicks[k % 6] * (1 + rng.normal(0, 0.1)), t, float(rng.uniform(0.3, 0.7)), min(0.55, 0.12 * np.sqrt(c)))
PENT = [0, 2, 4, 7, 9]
for k in range(0, 40):
    t = TF * (max(k / 40, START) ** 0.85 - START ** 0.85)
    if t < 0: continue
    au.add(au.pluck(220 * 2 ** ((PENT[k % 5] + 12 * (k // 10)) / 12), decay=6, dur=0.7, bright=0.2), t, 0.5, 0.18)
if SHORT:
    for k in range(14):
        au.add(au.pluck(784 * 2 ** ((PENT[k % 5] + 12 * (k // 5)) / 12), decay=18, dur=0.3, bright=0.1), TEND + 0.08 + k * 0.045, 0.2 + 0.6 * (k % 2), 0.12)
au.riser(TDONE, 3.0 if SHORT else 4.0, 0.6)
au.add(au.smash(7), TDONE, 0.5, 0.85)
for j, m in enumerate((1, 1.25, 1.5, 2)):
    au.add(au.pluck(392 * m, decay=1.5, dur=3), TDONE + 0.15 + 0.06 * j, 0.5, 0.3)
n = int(DUR * SR)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
from scipy.io import wavfile
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

# video
bg = make_bg(960, (26, 22, 30))
enc = Enc(OUT + '.v.mp4')
first_img = None
flash = 0.0
standing_col = (235, 225, 210)
for f in range(NF):
    t = f / FPS
    lay = np.zeros((H, W, 3), np.uint8)
    prog = np.clip((t - fall_t) / FALL_DUR, 0, 1)
    fallen = prog >= 1
    # fallen tiles: full cell with picture colour
    fp = np.clip((t - flip_t) / FLIP_DUR, 0, 1) if SHORT else np.zeros((GH_, GW_))
    if SHORT and 0 < fp.max() and fp.min() < 1:
        # flipping: draw each tile squashed vertically, colour switches at half-turn
        for y in range(GH_):
            for x in range(GW_):
                p = fp[y, x]
                c = img_bgr[y, x] if p >= 0.5 else hid_bgr[y, x]
                hh = (CS / 2 - 1) * abs(np.cos(np.pi * p))
                cx, cy = X0 + x * CS + CS // 2, Y0 + y * CS + CS // 2
                lift = 1 + 0.25 * np.sin(np.pi * p)
                hw = (CS / 2 - 1) * lift
                cv2.rectangle(lay, (int(cx - hw), int(cy - max(1, hh * lift))), (int(cx + hw) - 1, int(cy + max(1, hh * lift)) - 1),
                              tuple(int(v) for v in c), -1)
    elif fallen.any():
        src = img_bgr if (SHORT and fp.min() >= 1) or not SHORT else hid_bgr
        big = cv2.resize(np.where(fallen[..., None], src, 0).astype(np.uint8), (GW_ * CS, GH_ * CS), interpolation=cv2.INTER_NEAREST)
        gridmask = np.ones((GH_ * CS, GW_ * CS, 1), np.uint8)
        gridmask[::CS] = 0; gridmask[:, ::CS] = 0
        lay[Y0:Y0 + GH_ * CS, X0:X0 + GW_ * CS] = big * gridmask
    # standing and falling dominoes
    ys, xs = np.where(~fallen)
    for y, x in zip(ys, xs):
        cx, cy = X0 + x * CS + CS // 2, Y0 + y * CS + CS // 2
        px, py = parent[y, x]
        if px < 0: dx, dy = 0, -1
        else: dx, dy = x - px, y - py
        p = prog[y, x]
        # standing domino: thin bar perpendicular to fall direction
        L = CS * 0.42; th = 2 + int(8 * p)
        ex, ey = -dy * L, dx * L
        off = p * CS * 0.3
        if SHORT:
            c = tuple(int(v) for v in (hid_bgr[y, x] * p + std_bgr[y, x] * (1 - p)))
        else:
            c = standing_col if p == 0 else tuple(int(v) for v in (img_bgr[y, x] * p + np.array(standing_col) * (1 - p)))
        cv2.line(lay, (int(cx - ex + dx * off), int(cy - ey + dy * off)), (int(cx + ex + dx * off), int(cy + ey + dy * off)), c, max(2, int(3 + 9 * p)))
    if abs(t - TDONE) < 0.5 / FPS: flash = 0.15 if SHORT else 0.6
    flash *= 0.9
    img = glow(bg, lay, 0.5 if t < TDONE else (0.3 + 0.05 * np.sin(t * 4) if SHORT else 0.9 + 0.2 * np.sin(t * 4)), 4)
    if t < TDONE:
        put(img, f'ドミノ {GW_ * GH_:,}枚', 540, 190, 90)
        put(img, '倒し切ると何の絵が出る？', 540, 300, 56, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
        put(img, f'{int(fallen.sum()):,} / {GW_ * GH_:,}', 540, 1880, 60)
    else:
        s = 1 + 1.4 * np.exp(-(t - TDONE) * 7)
        put(img, pics.TITLES[PIC] + 'でした', 540, 230, 96, (255, 226, 60), s)
        put(img, '何の絵か当てられた？', 540, 1880, 60)
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
