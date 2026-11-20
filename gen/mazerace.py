"""迷路レース：3色の水が3つの角から同時に流れ込み、真ん中のゴールに先に着いた色の勝ち。
水同士はぶつかると止まる（先に来た色が通路を取る）。説明なしで「どの色が勝つ？」が分かる型。
使い方: python gen/mazerace.py SEED 出力.mp4 [--dur 26]
"""
import sys
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from collections import deque
import colorsys
args = [a for a in sys.argv[1:] if not a.startswith('--')]
DUR_ARG = 26.0
if '--dur' in sys.argv:
    DUR_ARG = float(sys.argv[sys.argv.index('--dur') + 1]); args = [a for a in args if a != sys.argv[sys.argv.index('--dur') + 1]]
import lib
lib.DUR = DUR_ARG; lib.NF = int(DUR_ARG * 60)
from lib import *
DUR = lib.DUR; NF = lib.NF

SEED = int(args[0]) if len(args) > 0 else 1
OUT = args[1] if len(args) > 1 else 'mazerace.mp4'
rng = np.random.default_rng(SEED)
CW, CH = 25, 35
CS = 38
GW, GH = 2 * CW + 1, 2 * CH + 1
PX = CS // 2
X0 = (W - GW * PX) // 2
Y0 = 400
grid = np.zeros((GH, GW), np.int8)

# Prim maze + some loops
# 真ん中のセルから掘る（角のどれかが有利にならないように）
cx0, cy0 = CW // 2, CH // 2
seen = np.zeros((CH, CW), bool); seen[cy0, cx0] = True
grid[2 * cy0 + 1, 2 * cx0 + 1] = 1
walls = [((cx0, cy0), (cx0 + dx, cy0 + dy)) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))]
while walls:
    i = rng.integers(len(walls)); (ax, ay), (bx, by) = walls[i]; walls[i] = walls[-1]; walls.pop()
    if seen[by, bx]: continue
    seen[by, bx] = True
    grid[ay + by + 1, ax + bx + 1] = 1; grid[2 * by + 1, 2 * bx + 1] = 1
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = bx + dx, by + dy
        if 0 <= nx < CW and 0 <= ny < CH and not seen[ny, nx]:
            walls.append(((bx, by), (nx, ny)))
for _ in range(int(CW * CH * 0.08)):
    x, y = rng.integers(1, 2 * CW), rng.integers(1, 2 * CH)
    if (x + y) % 2 == 1: grid[y, x] = 1

# 3 starts (top-left, top-right, bottom-center), goal in the middle
STARTS = [(1, 1), (GW - 2, 1), (2 * (CW // 2) + 1, GH - 2)]
G = (2 * (CW // 2) + 1, 2 * (CH // 2) + 1)
COLS = [(255, 70, 90), (60, 170, 255), (90, 230, 110)]  # RGB 赤・青・緑
NAMES = ['赤', '青', '緑']
owner = np.full((GH, GW), -1)
dist = np.full((GH, GW), -1.0)
par = {}
q = deque()
ORDER = rng.permutation(3)   # どの色がどの角かはシードで変わる
STARTS = [STARTS[i] for i in ORDER]
for c, s in enumerate(STARTS):
    owner[s[1], s[0]] = c; dist[s[1], s[0]] = 0; q.append(s)
while q:
    x, y = q.popleft()
    dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    rng.shuffle(dirs)
    for dx, dy in dirs:
        nx, ny = x + dx, y + dy
        if grid[ny, nx] and owner[ny, nx] < 0:
            owner[ny, nx] = owner[y, x]; dist[ny, nx] = dist[y, x] + 1; par[(nx, ny)] = (x, y); q.append((nx, ny))
dist[owner < 0] = np.inf
DMAX = dist[np.isfinite(dist)].max()
WIN = owner[G[1], G[0]]
FL0 = -3.0                       # 0秒の時点で3色がもう流れている（冒頭から色と動き）
FL_T = DUR - 4.5                 # 全部埋まるまで
# ゴール到達は終盤（DUR-7秒）に来るように時間を割り当てる。ゴール後は残りを速めに埋める
DG = dist[G[1], G[0]]
TG = DUR - 7.0
TEND = DUR - 1.8
dd = np.where(np.isfinite(dist), dist, 0)
flood_t = np.where(dd <= DG, FL0 + dd / DG * (TG - FL0), TG + (dd - DG) / max(1, DMAX - DG) * (TEND - TG))
flood_t = np.where(np.isfinite(dist), flood_t, np.inf)
goal_t = flood_t[G[1], G[0]]
path = [G]
while path[-1] not in STARTS: path.append(par[path[-1]])
path = path[::-1]
PATH_T = 1.2
print('winner', NAMES[WIN], 'goal at', round(goal_t, 1), 'cells', {NAMES[c]: int((owner == c).sum()) for c in range(3)})
if os.environ.get('DRY'): sys.exit()  # DRY=1 でシード選びだけ

# audio: each color its own register, plucks as the front advances
au = Audio(SEED + 7)
PENT = [0, 2, 4, 7, 9]
BASE = [262, 196, 330]
PAN = [0.2, 0.8, 0.5]
for c in range(3):
    dc = dist[owner == c]
    for d in range(0, int(dc.max()) + 1, 4):
        t = FL0 + d / DG * (TG - FL0) if d <= DG else TG + (d - DG) / max(1, DMAX - DG) * (TEND - TG)
        if t < 0: continue
        deg = PENT[(d // 4) % 5] + 12 * ((d // 20) % 2)
        au.add(au.pluck(BASE[c] * 2 ** (deg / 12), decay=11, dur=0.3, bright=0.3), t, PAN[c], 0.14)
au.add(au.smash(3), goal_t, 0.5, 0.8)
for k in range(0, len(path), 3):
    au.add(au.pluck(523 * 2 ** ((k / len(path)) * 2), decay=12, dur=0.3), goal_t + 0.15 + k / len(path) * PATH_T, 0.5, 0.22)
au.beat(120, lambda t: 0.25 + 0.4 * min(1, max(0, t) / max(1, goal_t)), 0.0, DUR - 0.3)
au.riser(goal_t, 3.0, 0.45)
n = int(DUR * SR)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
from scipy.io import wavfile
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

# video
bg = make_bg(960, (40, 26, 18))
colbgr = np.array([[c[2], c[1], c[0]] for c in COLS], np.float32)
enc = Enc(OUT + '.v.mp4')
first_img = None
pathset = path
for f in range(NF):
    t = f / FPS
    cell = np.zeros((GH, GW, 3), np.float32)
    cell[grid == 1] = (70, 60, 55)
    fl = flood_t <= t
    if fl.any():
        o = owner[fl]
        age = np.clip(t - flood_t[fl], 0, 2)
        shade = 0.62 + 0.15 * np.cos(dist[fl] * 0.25 - t * 3)  # 流れの縞
        bright = shade + 0.9 * np.exp(-age * 6)
        cell[fl] = np.clip(colbgr[o] * bright[:, None], 0, 255)
    if t >= goal_t:
        k = int(min(1, (t - goal_t) / PATH_T) * len(path))
        for (px, py) in path[:k]:
            cell[py, px] = (255, 255, 255)
    big = cv2.resize(cell, (GW * PX, GH * PX), interpolation=cv2.INTER_NEAREST).astype(np.uint8)
    lay = np.zeros((H, W, 3), np.uint8)
    lay[Y0:Y0 + GH * PX, X0:X0 + GW * PX] = big
    img = glow(bg, lay, 0.8, 4)
    put(img, 'G', X0 + (G[0] + 0.5) * PX, Y0 + (G[1] + 0.5) * PX, 64, (255, 226, 60), 1 + 0.15 * np.sin(t * 8))
    if t < goal_t:
        put(img, 'どの色がゴールする？', 540, 230, 84)
        for c in range(3):
            put(img, '●', 540 + (c - 1) * 150, 1840, 70, COLS[c], 1 + 0.12 * np.sin(t * 6 + c * 2))
    else:
        s = 1 + 1.4 * np.exp(-(t - goal_t) * 7)
        put(img, f'{NAMES[WIN]}の勝ち！', 540, 230, 110, COLS[WIN], s)
        put(img, f'{goal_t:.1f}秒でゴール', 540, 1840, 66)
    if f == 0: first_img = img.copy()
    XF = 24
    if f >= NF - XF:
        k2 = (f - (NF - XF)) / XF
        img = cv2.addWeighted(img, 1 - k2, first_img, k2, 0)
    enc.write(img)
enc.close()
mux(OUT + '.v.mp4', OUT + '.wav', OUT); os.remove(OUT + '.v.mp4'); os.remove(OUT + '.wav')
