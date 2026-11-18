import sys, colorsys
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from collections import deque
import lib
lib.DUR = 30.0; lib.NF = int(30.0 * 60)
from lib import *
DUR = lib.DUR; NF = lib.NF

SEED = int(sys.argv[1]) if len(sys.argv) > 1 else 2
rng = np.random.default_rng(SEED)
GW_, GH_ = 44, 66
CS = 22
X0 = (W - GW_ * CS) // 2
Y0 = 390
# random spanning tree over grid (randomized BFS-ish growth from start) -> each domino has a parent direction
S = (GW_ // 2, GH_ - 1)
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
T0, TF = 1.2, 24.0
# accelerate: fall time = T0 + TF * (d/DMAX)^0.8
fall_t = T0 + TF * (depth / DMAX) ** 0.85
FALL_DUR = 0.18
TEND = fall_t.max() + FALL_DUR
print('dominoes', GW_ * GH_, 'depth', DMAX, 'end', round(TEND, 1))

# hidden picture: original sunset-over-sea landscape
img_src = np.zeros((GH_, GW_, 3), np.float32)
for y in range(GH_):
    for x in range(GW_):
        v = y / GH_
        if v < 0.55:  # sky
            h = 0.74 + 0.36 * (v / 0.55) ** 1.3
            c = colorsys.hsv_to_rgb(h % 1, 0.75, 0.55 + 0.45 * v / 0.55)
        else:  # sea
            c = colorsys.hsv_to_rgb(0.6, 0.8, 0.45 - 0.25 * (v - 0.55) / 0.45)
        img_src[y, x] = c
sx, sy, sr = GW_ / 2, GH_ * 0.47, 9.5
for y in range(GH_):
    for x in range(GW_):
        d = np.hypot(x + 0.5 - sx, (y + 0.5 - sy) * 1.0)
        if d < sr and y < GH_ * 0.55:
            img_src[y, x] = (1.0, 0.85 - 0.3 * (y - (sy - sr)) / (2 * sr), 0.35)
        # reflection stripes
        if y >= GH_ * 0.55 and abs(x + 0.5 - sx) < sr * (1 - (y - GH_ * 0.55) / (GH_ * 0.45)) * 1.2 and (y % 3 != 0):
            img_src[y, x] = (1.0, 0.65, 0.3)
# mountains silhouette
for x in range(GW_):
    hm = GH_ * 0.55 - (5 + 4 * np.sin(x * 0.35) + 3 * np.sin(x * 0.11 + 1)) * (1 if x < 14 or x > 30 else 0.25)
    for y in range(int(hm), int(GH_ * 0.55)):
        img_src[y, x] = (0.12, 0.08, 0.2)
img_bgr = (img_src[..., ::-1] * 255).astype(np.uint8)

# audio: clicks by number of dominoes hitting per small window
au = Audio(61)
tk = np.arange(int(0.03 * SR)) / SR
from scipy.signal import butter, lfilter
b, a = butter(2, [1800 / (SR / 2), 7000 / (SR / 2)], 'band')
clicks = [lfilter(b, a, rng.normal(0, 1, len(tk))) * np.exp(-tk * 160) for _ in range(6)]
hits = np.sort((fall_t + FALL_DUR).ravel())
binw = 0.012
cnt = np.bincount((hits / binw).astype(int))
for k, c in enumerate(cnt):
    if c == 0: continue
    t = k * binw
    au.add(clicks[k % 6] * (1 + rng.normal(0, 0.1)), t, float(rng.uniform(0.3, 0.7)), min(0.55, 0.12 * np.sqrt(c)))
PENT = [0, 2, 4, 7, 9]
for k in range(0, 40):
    t = T0 + TF * (k / 40) ** 0.85 * 1.0
    au.add(au.pluck(220 * 2 ** ((PENT[k % 5] + 12 * (k // 10)) / 12), decay=6, dur=0.7, bright=0.2), t, 0.5, 0.18)
au.riser(TEND, 4.0, 0.6)
au.add(au.smash(7), TEND, 0.5, 0.85)
for j, m in enumerate((1, 1.25, 1.5, 2)):
    au.add(au.pluck(392 * m, decay=1.5, dur=3), TEND + 0.15 + 0.06 * j, 0.5, 0.3)
n = int(DUR * SR)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
from scipy.io import wavfile
wavfile.write('domino.wav', SR, (outw * 32767).astype(np.int16))

# video
bg = make_bg(960, (26, 22, 30))
enc = Enc('domino_v.mp4')
first_img = None
flash = 0.0
standing_col = (215, 210, 200)
for f in range(NF):
    t = f / FPS
    lay = np.zeros((H, W, 3), np.uint8)
    prog = np.clip((t - fall_t) / FALL_DUR, 0, 1)
    fallen = prog >= 1
    # fallen tiles: full cell with picture colour
    if fallen.any():
        big = cv2.resize(np.where(fallen[..., None], img_bgr, 0).astype(np.uint8), (GW_ * CS, GH_ * CS), interpolation=cv2.INTER_NEAREST)
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
        c = standing_col if p == 0 else tuple(int(v) for v in (img_bgr[y, x] * p + np.array(standing_col) * (1 - p)))
        cv2.line(lay, (int(cx - ex + dx * off), int(cy - ey + dy * off)), (int(cx + ex + dx * off), int(cy + ey + dy * off)), c, max(2, int(3 + 9 * p)))
    if abs(t - TEND) < 0.5 / FPS: flash = 0.6
    flash *= 0.9
    img = glow(bg, lay, 0.5 if t < TEND else 0.9 + 0.2 * np.sin(t * 4), 4)
    if t < TEND:
        put(img, f'ドミノ {GW_ * GH_:,}枚', 540, 190, 90)
        put(img, '倒し切ると何の絵が出る？', 540, 300, 56, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
        put(img, f'{int(fallen.sum()):,} / {GW_ * GH_:,}', 540, 1880, 60)
    else:
        s = 1 + 1.4 * np.exp(-(t - TEND) * 7)
        put(img, '夕焼けの海でした', 540, 230, 96, (255, 226, 60), s)
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
mux('domino_v.mp4', 'domino.wav', 'domino_short.mp4')
