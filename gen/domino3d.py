"""斜め上から見た立体風ドミノ。倒れたドミノが最後に裏返って絵が出る。
usage: python3 domino3d.py SEED PIC OUT [--dur 秒]   (既定 14秒)
- 0秒：並んだ全体が見え、手前中央の1枚が倒れ始めている
- 倒れた面は仮の色（虹色）。全部倒れたら奥→手前ではなく手前→奥へ裏返しの波が走り、絵が完成する
- 最後の0.4秒で最初の画面にクロスフェードしてループ
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
ARGS = sys.argv[1:]
DUR_ = 14.0
if '--dur' in ARGS:
    _i = ARGS.index('--dur'); DUR_ = float(ARGS[_i + 1]); del ARGS[_i:_i + 2]
import lib
lib.DUR = DUR_; lib.NF = int(DUR_ * 60)
from lib import *
import pics
DUR = lib.DUR; NF = lib.NF

SEED = int(ARGS[0]) if len(ARGS) > 0 else 3
PIC = ARGS[1] if len(ARGS) > 1 else 'snowman'
OUT = ARGS[2] if len(ARGS) > 2 else 'domino3d.mp4'
rng = np.random.default_rng(SEED)

GX, GY = 22, 34                 # grid (columns, rows); row 0 = far = top of picture
N = GX * GY
REVEAL = 3.0                    # seconds left after the last domino lands
FALL_DUR = 0.26
FLIP_DUR = 0.32
T_TH, W_D, H_D = 0.17, 0.82, 0.9   # domino thickness, width, height (cell = 1)

# ---- cascade tree (randomised growth from the near-centre cell) ----
S = (GX // 2, GY - 1)
depth = np.full((GY, GX), -1); parent = -np.ones((GY, GX, 2), int)
depth[S[1], S[0]] = 0
frontier = [S]
while frontier:
    i = rng.integers(len(frontier)) if rng.random() < 0.6 else len(frontier) - 1
    x, y = frontier[i]
    nb = [(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < GX and 0 <= y + dy < GY and depth[y + dy, x + dx] < 0]
    if not nb:
        frontier.pop(i); continue
    nx, ny = nb[rng.integers(len(nb))]
    depth[ny, nx] = depth[y, x] + 1; parent[ny, nx] = (x, y)
    frontier.append((nx, ny))
DMAX = depth.max()
START = 0.0
TF = DUR - REVEAL - FALL_DUR - 0.05
fall_t = TF * (depth / DMAX) ** 1.3   # fast spread at the start, slower near the end (front gets wider)
fall_t[S[1], S[0]] = -0.08
TEND = fall_t.max() + FALL_DUR
jj, ii = np.mgrid[0:GY, 0:GX]
flip_t = TEND + 0.1 + 0.75 * ((GY - 1 - jj) / (GY - 1)) + 0.08 * np.abs(ii - GX / 2) / GX
TDONE = flip_t.max() + FLIP_DUR
print('dominoes', N, 'depth', DMAX, 'fall end', round(TEND, 2), 'reveal done', round(TDONE, 2))

# flatten per-domino data
fx = ii.ravel().astype(float); fy = jj.ravel().astype(float)
cxw = fx - (GX - 1) / 2                     # world X
cyw = (GY - 1) - fy                         # world Y (0 = near)
dirx = np.zeros(N); diry = np.zeros(N)
for k in range(N):
    x, y = int(fx[k]), int(fy[k])
    px, py = parent[y, x]
    if px < 0: dirx[k], diry[k] = 0, 1      # first one falls away from camera
    else: dirx[k], diry[k] = x - px, -(y - py)
FT = fall_t.ravel(); FL = flip_t.ravel()
pic_rgb = pics.pic(PIC, GX, GY, SEED).reshape(-1, 3)
hue = (0.5 + 0.55 * depth.ravel() / DMAX) % 1
import colorsys
body = np.array([colorsys.hsv_to_rgb(h, 0.6, 0.95) for h in hue])
pic_c = pic_rgb * 0.92 + 0.03

# ---- camera ----
CAM = np.array([0.0, -9.0, 33.0]); TGT = np.array([0.0, 15.0, 0.0])
fwd = TGT - CAM; fwd /= np.linalg.norm(fwd)
right = np.cross(fwd, [0, 0, 1.0]); right /= np.linalg.norm(right)
down = np.cross(fwd, right)
FOC = 1455.0; CX, CY = W / 2, 930
LIGHT = np.array([-0.4, -0.5, 0.9]); LIGHT /= np.linalg.norm(LIGHT)


def project(P):
    d = P - CAM
    z = d @ fwd
    return np.stack([CX + FOC * (d @ right) / z, CY + FOC * (d @ down) / z], -1), z


# local box corners (u: fall dir, w: side, z: up). pivot = front-bottom edge at u = UP
UP = -H_D / 2
cu = np.array([UP - T_TH, UP]); cw = np.array([-W_D / 2, W_D / 2]); cz = np.array([0, H_D])
LOC = np.array([[u, w, z] for u in cu for w in cw for z in cz])   # index = 4*iu + 2*iw + iz
# faces as corner index loops (outward normal order doesn't matter: we cull with 2D winding after checking normals)
FACES = {
    'back': ([0, 1, 3, 2], [-1, 0, 0]),   # u = UP - T  -> faces up after falling (hidden colour)
    'front': ([4, 6, 7, 5], [1, 0, 0]),   # u = UP      -> faces up after the flip (picture)
    'top': ([1, 5, 7, 3], [0, 0, 1]),
    'bot': ([0, 2, 6, 4], [0, 0, -1]),
    'l': ([0, 4, 5, 1], [0, -1, 0]),
    'r': ([2, 3, 7, 6], [0, 1, 0]),
}


def rot_u(P, th):
    """rotate (N,K,3) local points about the pivot edge (u=UP, z=0) by th (N,) forward"""
    u = P[..., 0] - UP; z = P[..., 2]
    c = np.cos(th)[:, None]; s = np.sin(th)[:, None]
    return np.stack([UP + u * c + z * s, P[..., 1], -u * s + z * c], -1)


def flip(P, ph):
    """flip a lying domino 180deg about its centre line (along w), lifting it"""
    cu_, cz_ = 0.0, T_TH / 2
    u = P[..., 0] - cu_; z = P[..., 2] - cz_
    c = np.cos(ph)[:, None]; s = np.sin(ph)[:, None]
    lift = 0.55 * np.sin(ph)[:, None]
    return np.stack([cu_ + u * c - z * s, P[..., 1], cz_ + u * s + z * c + lift], -1)


def to_world(P):
    X = cxw[:, None] + P[..., 0] * dirx[:, None] - P[..., 1] * diry[:, None]
    Y = cyw[:, None] + P[..., 0] * diry[:, None] + P[..., 1] * dirx[:, None]
    return np.stack([X, Y, P[..., 2]], -1)


def frame_geom(t):
    p = np.clip((t - FT) / FALL_DUR, 0, 1)
    th = np.pi / 2 * p ** 1.7
    # small settle bounce
    th = np.where(p >= 1, np.pi / 2, th)
    ph = np.pi * np.clip((t - FL) / FLIP_DUR, 0, 1) ** 1.0
    ph = 0.5 - 0.5 * np.cos(ph)  # ease
    ph = ph * np.pi
    P = np.repeat(LOC[None], N, 0)
    P = rot_u(P, th)
    # after the fall the slab lies on u in [UP, UP+H]; move flip centre there
    Pf = P.copy(); Pf[..., 0] -= (UP + H_D / 2)
    Pf = flip(Pf, ph); Pf[..., 0] += (UP + H_D / 2)
    P = np.where((ph > 0)[:, None, None], Pf, P)
    # normals
    nrm = {}
    for name, (_, n) in FACES.items():
        n0 = np.repeat(np.array(n, float)[None, None], N, 0)
        nn = rot_u(n0 + np.array([UP, 0, 0]), th) - np.array([UP, 0, 0])
        nf = flip(nn + np.array([0, 0, T_TH / 2]), ph) - np.array([0, 0, T_TH / 2]) - (0.55 * np.sin(ph))[:, None, None] * np.array([0, 0, 1])
        nn = np.where((ph > 0)[:, None, None], nf, nn)
        nw = to_world(nn) - to_world(np.zeros_like(nn))
        nrm[name] = nw[:, 0]
    return to_world(P), nrm, p, ph


# floor
floor_c = np.array([[-GX / 2 - 0.6, -0.8, 0], [GX / 2 + 0.6, -0.8, 0], [GX / 2 + 0.6, GY - 0.2, 0], [-GX / 2 - 0.6, GY - 0.2, 0]])
fl2d, _ = project(floor_c)
bg = make_bg(900, (34, 26, 40))
cv2.fillConvexPoly(bg, np.round(fl2d * 16).astype(np.int32), (38, 30, 34), cv2.LINE_AA, 4)
cv2.polylines(bg, [np.round(fl2d * 16).astype(np.int32)], True, (70, 58, 66), 2, cv2.LINE_AA, 4)
c0, _ = project(np.array([[-GX / 2, 0, 0], [GX / 2, 0, 0], [-GX / 2, GY - 1, 0], [GX / 2, GY - 1, 0]]))
print('screen corners near/far', c0.round())
s0, _ = project(np.array([[S[0] - (GX - 1) / 2, -0.6, 0.0]]))
MX, MY = int(s0[0, 0]), int(s0[0, 1])

# ---- audio ----
au = Audio(83)
from scipy.signal import butter, lfilter
b, a = butter(2, [1500 / (SR / 2), 6500 / (SR / 2)], 'band')
tk = np.arange(int(0.04 * SR)) / SR
clacks = [lfilter(b, a, rng.normal(0, 1, len(tk))) * np.exp(-tk * 140) * 0.8 + np.sin(2 * np.pi * f0 * tk) * np.exp(-tk * 90) * 0.5
          for f0 in (900, 1050, 1200, 1350, 1500, 1700)]
hits = np.sort(FT + FALL_DUR); hits = hits[hits >= 0]
binw = 0.015
cnt = np.bincount((hits / binw).astype(int))
for k, c in enumerate(cnt):
    if c:
        au.add(clacks[k % 6], k * binw, float(rng.uniform(0.3, 0.7)), min(0.6, 0.2 * np.sqrt(c)))
PENT = [0, 2, 4, 7, 9]
for k in range(32):
    t = TF * (k / 32) ** 1.3
    au.add(au.pluck(220 * 2 ** ((PENT[k % 5] + 12 * (k // 10)) / 12), decay=6, dur=0.7, bright=0.2), t, 0.5, 0.16)
for k in range(16):  # flip sparkle
    au.add(au.pluck(784 * 2 ** ((PENT[k % 5] + 12 * (k // 5)) / 12), decay=18, dur=0.3, bright=0.1), TEND + 0.1 + k * 0.05, 0.2 + 0.6 * (k % 2), 0.13)
au.riser(TDONE, 3.0, 0.55)
au.add(au.smash(5), TDONE, 0.5, 0.8)
for j, m in enumerate((1, 1.25, 1.5, 2)):
    au.add(au.pluck(392 * m, decay=1.5, dur=3), TDONE + 0.15 + 0.06 * j, 0.5, 0.3)
n = int(DUR * SR)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
from scipy.io import wavfile
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

# ---- video ----
enc = Enc(OUT + '.v.mp4')
first_img = None
flash = 0.0
camdir = fwd
# 確認用: ONLY=0,30,600 のように指定するとそのフレームだけ描く
FR = [int(x) for x in os.environ.get("ONLY", "").split(",") if x]
for f in (FR or range(NF)):
    t = f / FPS
    Pw, nrm, p, ph = frame_geom(t)
    P2, zc = project(Pw.reshape(-1, 3))
    P2 = P2.reshape(N, 8, 2)
    ctr = Pw.mean(1)
    order = np.argsort(-((ctr - CAM) @ camdir))     # far first
    lay = np.zeros((H, W, 3), np.uint8)
    # per face shade + colour
    fdat = []
    for name, (idx, _) in FACES.items():
        nw = nrm[name]
        vis = ((Pw[:, idx[0]] - CAM) * nw).sum(1) < 0
        lam = 0.45 + 0.55 * np.clip(nw @ LIGHT, 0, 1)
        if name == 'front':
            col = np.where((ph > np.pi / 2)[:, None], pic_c, body * 0.75)
            lam = np.where(ph > np.pi / 2, 0.75 + 0.25 * np.clip(nw @ LIGHT, 0, 1), lam)
        elif name == 'back':
            col = body * 0.8
        else:
            col = body * 0.9
        cbgr = np.clip(col * lam[:, None], 0, 1)[:, ::-1] * 255
        fdat.append((idx, vis, cbgr))
    pts16 = np.round(P2 * 16).astype(np.int32)
    for k in order:
        for idx, vis, cbgr in fdat:
            if vis[k]:
                cv2.fillConvexPoly(lay, pts16[k, idx], (float(cbgr[k, 0]), float(cbgr[k, 1]), float(cbgr[k, 2])), cv2.LINE_AA, 4)
    if abs(t - TDONE) < 0.5 / FPS: flash = 0.15
    flash *= 0.9
    mask = lay.any(2)
    img = bg.copy(); img[mask] = lay[mask]
    small = cv2.GaussianBlur(cv2.resize(lay, (W // 6, H // 6), interpolation=cv2.INTER_AREA), (0, 0), 4)
    img = cv2.add(img, cv2.convertScaleAbs(cv2.resize(small, (W, H)), alpha=0.25 if t < TDONE else 0.3))
    if t < TDONE:
        put(img, f'ドミノ {N}枚', 540, 150, 92)
        put(img, '倒し切ると何の絵が出る？', 540, 262, 58, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
        put(img, f'{int((p >= 1).sum())} / {N}', 540, 1850, 58)
        if t < 1.4:
            al = min(1.0, (1.4 - t) / 0.4)
            bob = int(10 * abs(np.sin(t * 7)))
            tri = np.array([[MX, MY + 14 + bob], [MX - 22, MY + 50 + bob], [MX + 22, MY + 50 + bob]], np.int32)
            ov = img.copy(); cv2.fillConvexPoly(ov, tri, (60, 226, 255), cv2.LINE_AA)
            img = cv2.addWeighted(ov, al, img, 1 - al, 0)
            put(img, 'ここから！', MX, MY + 100 + bob, 54, (255, 226, 60), 1.0, al)
    else:
        s = 1 + 0.9 * np.exp(-(t - TDONE) * 7)
        put(img, pics.TITLES[PIC] + 'でした', 540, 200, 100, (255, 226, 60), s)
        put(img, '何の絵か当てられた？', 540, 1850, 58)
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
