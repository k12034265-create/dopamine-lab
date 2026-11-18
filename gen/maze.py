import sys
sys.path.insert(0, '/home/claude')
import numpy as np
from collections import deque
import lib
lib.DUR = 28.0; lib.NF = int(28.0 * 60)
from lib import *
DUR = lib.DUR; NF = lib.NF

SEED = int(sys.argv[1]) if len(sys.argv) > 1 else 5
rng = np.random.default_rng(SEED)
CW, CH = 25, 35          # cells
CS = 38                   # px per cell (wall grid 2x+1)
GW, GH = 2 * CW + 1, 2 * CH + 1
PX = CS // 2
X0 = (W - GW * PX) // 2
Y0 = 400
grid = np.zeros((GH, GW), np.int8)   # 0 wall, 1 open
carve_t = np.full((GH, GW), np.inf)

# randomized Prim maze (many short branches), record carve order
seen = np.zeros((CH, CW), bool); seen[0, 0] = True
order = [(1, 1)]
walls = [((0, 0), (1, 0)), ((0, 0), (0, 1))]
while walls:
    i = rng.integers(len(walls)); (ax, ay), (bx, by) = walls[i]; walls[i] = walls[-1]; walls.pop()
    if seen[by, bx]: continue
    seen[by, bx] = True
    order.append((ax + bx + 1, ay + by + 1)); order.append((2 * bx + 1, 2 * by + 1))
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = bx + dx, by + dy
        if 0 <= nx < CW and 0 <= ny < CH and not seen[ny, nx]:
            walls.append(((bx, by), (nx, ny)))
# a few extra openings to create loops
for _ in range(int(CW * CH * 0.06)):
    x, y = rng.integers(1, 2 * CW), rng.integers(1, 2 * CH)
    if (x + y) % 2 == 1 and 0 < x < 2 * CW and 0 < y < 2 * CH:
        order.append((x, y))
GEN_T = 6.0
for k, (gx, gy) in enumerate(order):
    carve_t[gy, gx] = k / len(order) * GEN_T
    grid[gy, gx] = 1
# BFS flood from start
S = (1, 1); G = (GW - 2, GH - 2)
dist = np.full((GH, GW), -1)
par = {}
dist[S[1], S[0]] = 0
q = deque([S])
while q:
    x, y = q.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if grid[ny, nx] and dist[ny, nx] < 0:
            dist[ny, nx] = dist[y, x] + 1; par[(nx, ny)] = (x, y); q.append((nx, ny))
DMAX = dist.max()
FL0, FL_T = GEN_T + 0.8, 15.0
flood_t = np.where(dist >= 0, FL0 + dist / DMAX * FL_T, np.inf)
goal_t = flood_t[G[1], G[0]]
path = [G]
while path[-1] != S: path.append(par[path[-1]])
path = path[::-1]
PATH_T = 1.6
END_FLOOD = FL0 + FL_T
print('goal reached at', round(goal_t, 1), 'flood ends', END_FLOOD, 'path len', len(path))

# audio
au = Audio(51)
PENT = [0, 2, 4, 7, 9]
for k in range(0, len(order), 6):
    t = k / len(order) * GEN_T
    au.add(au.pluck(880 * 2 ** (PENT[(k // 6) % 5] / 12), decay=40, dur=0.1, bright=0.1), t, 0.5, 0.08)
for d in range(0, DMAX + 1, 3):
    t = FL0 + d / DMAX * FL_T
    deg = PENT[(d // 3) % 5] + 12 * ((d // 15) % 3)
    au.add(au.pluck(196 * 2 ** (deg / 12), decay=10, dur=0.35, bright=0.3), t, 0.5, 0.2)
au.add(au.smash(4), goal_t, 0.5, 0.8)
for k in range(0, len(path), 4):
    au.add(au.pluck(523 * 2 ** ((k / len(path)) * 2), decay=12, dur=0.3), goal_t + 0.2 + k / len(path) * PATH_T, 0.5, 0.25)
au.beat(118, lambda t: 0.25 + 0.4 * min(1, max(0, t - FL0) / FL_T), FL0, END_FLOOD)
au.riser(goal_t, 3.0, 0.5)
n = int(DUR * SR)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
from scipy.io import wavfile
wavfile.write('maze.wav', SR, (outw * 32767).astype(np.int16))

# video
bg = make_bg(960, (40, 26, 18))
hue = np.where(dist >= 0, 0.55 + dist / DMAX * 0.95, 0)
enc = Enc('maze_v.mp4')
first_img = None
ys, xs = np.mgrid[0:GH, 0:GW]
for f in range(NF):
    t = f / FPS
    cell = np.zeros((GH, GW, 3), np.float32)
    carved = carve_t <= t
    cell[carved] = (70, 60, 55)
    fl = flood_t <= t
    if fl.any():
        hh = hue[fl] % 1
        age = np.clip(t - flood_t[fl], 0, 1)
        import colorsys
        rgb = np.array([colorsys.hsv_to_rgb(h, 0.8, 1.0) for h in hh])[:, ::-1] * 255
        bright = 1.0 + 0.8 * np.exp(-age * 6)[:, None]
        cell[fl] = np.clip(rgb * 0.75 * bright, 0, 255)
    if t >= goal_t:
        dimk = min(1, (t - goal_t) / 0.4)
        cell *= (1 - 0.65 * dimk)
        k = int(min(1, (t - goal_t) / PATH_T) * len(path))
        for (px, py) in path[:k]:
            cell[py, px] = (255, 255, 255)
    # generation head
    if t < GEN_T:
        k = min(len(order) - 1, int(t / GEN_T * len(order)))
        hx, hy = order[k]; cell[hy, hx] = (80, 230, 255)
    big = cv2.resize(cell, (GW * PX, GH * PX), interpolation=cv2.INTER_NEAREST).astype(np.uint8)
    lay = np.zeros((H, W, 3), np.uint8)
    lay[Y0:Y0 + GH * PX, X0:X0 + GW * PX] = big
    img = glow(bg, lay, 0.9, 4)
    # start / goal marks
    put(img, 'S', X0 + 1.5 * PX, Y0 + 1.5 * PX, 34, (255, 255, 255))
    put(img, 'G', X0 + (GW - 1.5) * PX, Y0 + (GH - 1.5) * PX, 34, (255, 226, 60), 1 + 0.15 * np.sin(t * 8))
    if t < GEN_T:
        put(img, '迷路に水を流すと…', 540, 200, 86)
        put(img, '迷路を作成中', 540, 310, 50, (120, 230, 255))
    elif t < goal_t:
        put(img, '迷路に水を流すと…', 540, 200, 86)
        put(img, 'ゴールまで何秒？', 540, 310, 56, (255, 226, 60), 1 + 0.05 * np.sin(t * 6))
        put(img, f'{t - FL0:.1f}秒', 540, 1830, 80)
    else:
        s = 1 + 1.4 * np.exp(-(t - goal_t) * 7)
        put(img, '最短ルート発見！', 540, 230, 100, (255, 226, 60), s)
        put(img, f'{goal_t - FL0:.1f}秒でゴール', 540, 1830, 72)
    if f == 0: first_img = img.copy()
    XF = 24
    if f >= NF - XF:
        k2 = (f - (NF - XF)) / XF
        img = cv2.addWeighted(img, 1 - k2, first_img, k2, 0)
    enc.write(img)
enc.close()
mux('maze_v.mp4', 'maze.wav', 'maze_short.mp4')
