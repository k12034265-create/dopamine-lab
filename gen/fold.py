"""絵の具を垂らして紙を折ると…（デカルコマニー・非ボール型）。
紙の右半分に絵の具がポタポタ落ちる → 左半分をパタンと折って押す → 開くと左右対称の絵（蝶）が出る。
これを2回（大きな色の滴→細かい模様の滴）繰り返し、最後に絵が完成する。0秒で絵の具がもう落ちている。
使い方: python gen/fold.py SEED 出力.mp4 [--dur 26]
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, colorsys
ARGS = sys.argv[1:]
DUR_ = 26.0
if '--dur' in ARGS:
    _i = ARGS.index('--dur'); DUR_ = float(ARGS[_i + 1]); del ARGS[_i:_i + 2]
import lib
lib.DUR = DUR_; lib.NF = int(DUR_ * 60)
from lib import *
DUR = lib.DUR; NF = lib.NF

SEED = int(ARGS[0]) if len(ARGS) > 0 else 1
OUT = ARGS[1] if len(ARGS) > 1 else 'fold.mp4'
rng = np.random.default_rng(SEED)

PW, PH = 960, 1300
HW = PW // 2
CX, PY0 = W // 2, 400
PX0 = CX - HW
S = DUR / 26.0
# timeline (seconds)
R1_END, F1, P1, U1 = 7.2 * S, 8.2 * S, 8.8 * S, 9.8 * S       # drops until, folded at, press until, open at
R2_END, F2, P2, U2 = 17.6 * S, 18.6 * S, 19.2 * S, 20.4 * S
FALL = 0.32
XF = 24

# ---------------- target picture: butterfly, right half (x=0 is the fold) ----------------
yy, xx = np.mgrid[0:PH, 0:HW].astype(np.float32)
HUE = rng.uniform(0, 1)


def ell(cx, cy, ax, ay, ang):
    c, s = np.cos(np.radians(ang)), np.sin(np.radians(ang))
    dx, dy = xx - cx, yy - cy
    u = (dx * c + dy * s) / ax; v = (-dx * s + dy * c) / ay
    return u * u + v * v


up = ell(215, 470, 250, 215, -28)
lo = ell(165, 840, 165, 200, 22)
wing = ((up < 1) | (lo < 1)) & (xx > 18)
wing_u8 = wing.astype(np.uint8)
dist = cv2.distanceTransform(wing_u8, cv2.DIST_L2, 5)
tgt = np.zeros((PH, HW, 3), np.float32)
r_in = np.clip(np.hypot(xx, yy - 640) / 520, 0, 1)
base_up = np.stack([np.array(colorsys.hsv_to_rgb((HUE + 0.12 * k) % 1, 0.85, 1.0)) for k in np.linspace(0, 1, 32)])
base_lo = np.stack([np.array(colorsys.hsv_to_rgb((HUE + 0.45 + 0.12 * k) % 1, 0.8, 0.95)) for k in np.linspace(0, 1, 32)])
ki = np.clip((r_in * 31).astype(int), 0, 31)
in_up = (up < 1)
tgt[:] = np.where(in_up[..., None], base_up[ki], base_lo[ki])
basecol = tgt.copy()
band = wing & (dist < 34)
tgt[band] = (0.07, 0.05, 0.08)
# white spots in the band
spots = []
for k in range(9):
    a = np.radians(-80 + k * 20)
    spots.append((215 + 250 * 0.93 * np.cos(a - np.radians(28)), 470 + 215 * 0.93 * np.sin(a - np.radians(28))))
spot_mask = np.zeros((PH, HW), bool)
for sx, sy in spots:
    m = np.hypot(xx - sx, yy - sy) < 11
    m &= band
    spot_mask |= m
tgt[spot_mask] = (1, 1, 0.95)
# eye spot on the lower wing
ex, ey = 190, 880
de = np.hypot(xx - ex, yy - ey)
tgt[(de < 58) & wing] = (1.0, 0.85, 0.2)
tgt[(de < 34) & wing] = (0.07, 0.05, 0.08)
tgt[(de < 12) & wing] = (1, 1, 1)
# veins
for a in (-60, -35, -10, 15, 45, 75):
    ra = np.radians(a)
    d = np.abs((xx - 20) * np.sin(ra) - (yy - 650) * np.cos(ra))
    along = (xx - 20) * np.cos(ra) + (yy - 650) * np.sin(ra)
    tgt[(d < 3.5) & (along > 40) & wing & (dist > 20)] *= 0.45
# body + head + antenna
body = ((xx < 22) & (np.abs(yy - 680) < 300) & ((xx / 22) ** 2 + ((yy - 680) / 300) ** 2 < 1)) | (np.hypot(xx, yy - 345) < 34)
ant = np.zeros((PH, HW), bool)
for tt in np.linspace(0, 1, 120):
    ax_, ay_ = 10 + 150 * tt, 320 - 210 * tt - 40 * np.sin(tt * 3.1)
    ant |= np.hypot(xx - ax_, yy - ay_) < 4.5
ant |= np.hypot(xx - 160, yy - 110 + 40 * np.sin(3.1)) < 13
fullmask = wing | body | ant
tgt[body | ant] = (0.12, 0.09, 0.1)


def noise(seed, scale, octaves=3):
    r = np.random.default_rng(seed)
    out = np.zeros((PH, HW), np.float32)
    for o in range(octaves):
        s = scale / 2 ** o
        sm = r.normal(0, 1, (int(PH / s) + 2, int(HW / s) + 2)).astype(np.float32)
        out += cv2.resize(sm, (HW, PH), interpolation=cv2.INTER_CUBIC) * 0.5 ** o
    return out / 1.75


N1, N2, N3 = noise(SEED + 1, 60), noise(SEED + 2, 18), noise(SEED + 3, 140)

# ---------------- drops ----------------
drops = []   # (t_land, x, y, R, color RGB, round)
cand = np.argwhere(wing & (dist > 40))
pts = [cand[rng.integers(len(cand))]]
dd = np.hypot(*(cand - pts[0]).T)
for _ in range(13):
    i = int(np.argmax(dd)); pts.append(cand[i]); dd = np.minimum(dd, np.hypot(*(cand - cand[i]).T))
pts = [pts[i] for i in rng.permutation(len(pts))]
n1 = len(pts)
for i, (py, px) in enumerate(pts):
    tl = -2.4 + (R1_END - 0.4 + 2.4) * (i / (n1 - 1)) ** 0.8   # ~4 drops already landed at 0s
    drops.append((tl, float(px), float(py), float(rng.uniform(78, 112)), basecol[py, px], 1))
d2 = []
bc = np.argwhere(band & ~spot_mask)
for k in range(26):
    py, px = bc[rng.integers(len(bc))]; d2.append((px, py, rng.uniform(16, 26), (0.07, 0.05, 0.08)))
d2.append((ex, ey, 52, (1.0, 0.85, 0.2))); d2.append((ex, ey, 30, (0.07, 0.05, 0.08)))
for sx, sy in spots[::2]:
    d2.append((sx, sy, 12, (1, 1, 0.95)))
for yb in np.linspace(400, 950, 6):
    d2.append((6, yb, 22, (0.12, 0.09, 0.1)))
d2.append((4, 345, 32, (0.12, 0.09, 0.1)))
for tt in np.linspace(0.2, 1, 5):
    d2.append((10 + 150 * tt, 320 - 210 * tt - 40 * np.sin(tt * 3.1), 9, (0.12, 0.09, 0.1)))
order = rng.permutation(len(d2))
eye = [26, 27]   # yellow then black: keep this order
seq = [i for i in order if i not in eye]
seq = seq[:len(seq) // 2] + eye + seq[len(seq) // 2:]
for j, i in enumerate(seq):
    px, py, R, c = d2[i]
    tl = U1 + 0.6 + (R2_END - U1 - 1.0) * (j / (len(seq) - 1)) ** 0.85
    drops.append((tl, float(px), float(py), float(R), np.array(c, np.float32), 2))
drops.sort(key=lambda d: d[0])


def blob(x, y, R, ph, k):
    x0, x1 = int(max(0, x - R * 1.4)), int(min(HW, x + R * 1.4 + 1))
    y0, y1 = int(max(0, y - R * 1.4)), int(min(PH, y + R * 1.4 + 1))
    if x0 >= x1 or y0 >= y1:
        return None
    sx, sy = xx[y0:y1, x0:x1], yy[y0:y1, x0:x1]
    ang = np.arctan2(sy - y, sx - x)
    rr = R * (1 + 0.10 * np.sin(k * ang + ph) + 0.06 * np.sin((k + 3) * ang + 2 * ph))
    d = np.hypot(sx - x, sy - y) / np.maximum(rr, 1)
    a = np.clip((1 - d) * R * 0.35, 0, 1)
    return (y0, y1, x0, x1), a


def paint(C, A, drop, prog):
    tl, x, y, R, c, rd = drop
    ph = (x * 7 + y * 3) % 6.28
    b = blob(x, y, R * (0.25 + 0.75 * prog), ph, 5 + int(x) % 3)
    if b is None:
        return
    (y0, y1, x0, x1), a = b
    C[y0:y1, x0:x1] = C[y0:y1, x0:x1] * (1 - a[..., None]) + np.asarray(c, np.float32) * a[..., None]
    A[y0:y1, x0:x1] = np.maximum(A[y0:y1, x0:x1], a)


def spread(C, A, amount):
    """pressing spreads paint: blur colour where paint is, grow alpha with veiny noise edge"""
    Ab = cv2.GaussianBlur(A, (0, 0), amount)
    Cb = cv2.GaussianBlur(C * A[..., None], (0, 0), amount * 0.6) / np.maximum(cv2.GaussianBlur(A, (0, 0), amount * 0.6), 1e-3)[..., None]
    A2 = np.clip((Ab + 0.18 * N2 * (Ab > 0.05) - 0.25) * 4, 0, 1)   # no specks on bare paper
    A2 = np.maximum(A2, A)
    C2 = np.where((A > 0.5)[..., None], C, Cb)
    return np.clip(C2, 0, 1), A2


# precompute paint state per round
C0 = np.zeros((PH, HW, 3), np.float32); A0 = np.zeros((PH, HW), np.float32)
CR, AR = C0.copy(), A0.copy()           # right half wet paint (baked drops)
baked = set()


def bake_until(t):
    for i, d in enumerate(drops):
        if i not in baked and d[0] + 0.35 <= t:
            paint(CR, AR, d, 1.0); baked.add(i)


bake_until(U1 - 0.01)
C1, A1 = spread(CR, AR, 10)
# final picture: pressed twice -> paint fills the picture, edges organic
bake_until(R2_END + 1)
C2s, A2s = spread(CR, AR, 8)
warp_x = (xx + N1 * 10).astype(np.float32); warp_y = (yy + N3 * 10).astype(np.float32)
fm = cv2.remap(fullmask.astype(np.float32), warp_x, warp_y, cv2.INTER_LINEAR)
fm = np.clip((cv2.GaussianBlur(fm, (0, 0), 2) - 0.5) * 3 + 0.5, 0, 1)
tw = cv2.remap(tgt, warp_x, warp_y, cv2.INTER_LINEAR)
tw = tw * (1 + 0.08 * N2[..., None]) * (1 + 0.05 * N1[..., None])
AF = np.maximum(fm, A2s * 0.85)
CF = np.where((fm > 0.05)[..., None], tw * 0.8 + C2s * 0.2 * (A2s[..., None] > 0.3) + tw * 0.2 * (A2s[..., None] <= 0.3), C2s)
CF = np.clip(CF, 0, 1)
# reset for rendering
CR[:], AR[:] = 0, 0
baked.clear()

# ---------------- paper rendering ----------------
paper = np.ones((PH, HW, 3), np.float32) * np.array([0.95, 0.93, 0.88], np.float32)
paper *= (1 + 0.015 * N2[..., None])
back = paper * 0.82


def wet(C, A):
    """composite paint on paper with a glossy wet highlight"""
    Ab = cv2.GaussianBlur(A, (0, 0), 3)
    gx = cv2.Sobel(Ab, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(Ab, cv2.CV_32F, 0, 1, ksize=3)
    sh = np.clip(-(gx + gy) * 0.9, -0.25, 0.35)
    img = paper * (1 - A[..., None]) + C * A[..., None]
    img = img + (sh * A)[..., None] * 0.6
    return np.clip(img, 0, 1)


def to_bgr(rgb):
    return (rgb[..., ::-1] * 255).astype(np.uint8)


bg = make_bg(1000, (30, 22, 36))


def state(t):
    """returns (left_half_rgb or None, right_half_rgb, flap) flap=(theta, image_front, image_back)"""
    bake_until(t)
    if t < U1:
        Cc, Ac = CR.copy(), AR.copy()
        for i, d in enumerate(drops):
            if i not in baked and d[0] <= t < d[0] + 0.35:
                paint(Cc, Ac, d, 1 - np.exp(-(t - d[0]) / 0.07))
        right = wet(Cc, Ac); left = paper; leftimg = None
        if t >= R1_END:
            leftimg = paper
    if R1_END <= t < U1:
        th = np.pi * min(1, max(0, (t - R1_END) / (F1 - R1_END)) ** 1.6) if t < P1 else np.pi * (1 - min(1, (t - P1) / (U1 - P1)) ** 0.7)
        front = paper if t < P1 else wet(C1[:, ::-1], A1[:, ::-1])
        return paper, right if t < P1 else wet(C1, A1), (th, front)
    if t < U1:
        return paper, right, None
    # round 2
    if t < R2_END + 0.4:
        Cc, Ac = C1.copy(), A1.copy()
        for i, d in enumerate(drops):
            if d[5] == 2 and d[0] <= t:
                paint(Cc, Ac, d, min(1, 1 - np.exp(-(t - d[0]) / 0.07)))
        return wet(C1[:, ::-1], A1[:, ::-1]), wet(Cc, Ac), None
    if t < U2:
        Cc, Ac = C1.copy(), A1.copy()
        for d in drops:
            if d[5] == 2:
                paint(Cc, Ac, d, 1)
        th = np.pi * min(1, max(0, (t - R2_END - 0.4) / (F2 - R2_END - 0.4)) ** 1.6) if t < P2 else np.pi * (1 - min(1, (t - P2) / (U2 - P2)) ** 0.7)
        front = wet(C1[:, ::-1], A1[:, ::-1]) if t < P2 else wet(CF[:, ::-1], AF[:, ::-1])
        return None, wet(Cc, Ac) if t < P2 else wet(CF, AF), (th, front)
    return wet(CF[:, ::-1], AF[:, ::-1]), wet(CF, AF), None


def render(t):
    left, right, flap = state(t)
    img = bg.copy()
    # shadow under paper
    cv2.rectangle(img, (PX0 + 14, PY0 + 20), (PX0 + PW + 14, PY0 + PH + 20), (8, 6, 10), -1)
    img[PY0:PY0 + PH, CX:CX + HW] = to_bgr(right)
    if flap is None:
        img[PY0:PY0 + PH, PX0:CX] = to_bgr(left)
    else:
        th, front = flap
        w = int(round(HW * abs(np.cos(th))))
        if th < np.pi / 2:
            if w > 1:
                sq = cv2.resize(to_bgr(front), (w, PH), interpolation=cv2.INTER_AREA)
                shade = 0.75 + 0.25 * np.cos(th)
                img[PY0:PY0 + PH, CX - w:CX] = (sq * shade).astype(np.uint8)
        else:
            # right half gets darker as the flap closes over it
            if w > 1:
                sq = cv2.resize(to_bgr(back), (w, PH), interpolation=cv2.INTER_AREA)
                shade = 0.8 + 0.2 * abs(np.cos(th))
                img[PY0:PY0 + PH, CX:CX + w] = (sq * shade).astype(np.uint8)
                cv2.line(img, (CX + w, PY0), (CX + w, PY0 + PH), (40, 40, 40), 2)
    # fold crease
    cv2.line(img, (CX, PY0), (CX, PY0 + PH), (150, 150, 160), 1)
    # falling drops
    for d in drops:
        if d[0] - FALL <= t < d[0]:
            k = (t - (d[0] - FALL)) / FALL
            sx, sy = CX + int(d[1]), PY0 + int(d[2])
            y = int(sy - (1 - k * k) * 700)
            r = max(6, int(d[3] * 0.22))
            col = tuple(int(v * 255) for v in np.asarray(d[4])[::-1])
            cv2.ellipse(img, (sx, y), (r, int(r * 1.35)), 0, 0, 360, col, -1, cv2.LINE_AA)
            cv2.circle(img, (sx - r // 3, y - r // 3), max(2, r // 4), (255, 255, 255), -1, cv2.LINE_AA)
    return img


# ---------------- audio ----------------
au = Audio(SEED + 5)
from scipy.signal import butter, lfilter


def plop(R):
    tt = np.arange(int(0.14 * SR)) / SR
    f0 = 900 - R * 4
    s = np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-tt * 28) + 160) / SR) * np.exp(-tt * 30)
    return s


bb, ab = butter(2, [300 / (SR / 2), 3000 / (SR / 2)], 'band')


def whoosh(d=0.9):
    tt = np.arange(int(d * SR)) / SR
    return lfilter(bb, ab, au.rng.normal(0, 1, len(tt))) * np.sin(np.pi * tt / d) ** 2 * 0.5


PENT = [0, 2, 4, 7, 9]
for d in drops:
    if d[0] >= 0:
        au.add(plop(d[3]), d[0], 0.5 + (d[1] / HW) * 0.4, 0.5 if d[5] == 1 else 0.3)
for (r0, fo, pr, un, big) in ((R1_END, F1, P1, U1, False), (R2_END + 0.4, F2, P2, U2, True)):
    au.add(whoosh(fo - r0 + 0.2), r0, 0.35, 0.8)
    au.add(au.kick, fo, 0.5, 1.6)
    au.add(whoosh(un - pr + 0.2), pr, 0.65, 0.7)
    if big:
        au.riser(un, 2.5, 0.5)
        au.add(au.smash(2), un, 0.5, 0.75)
        for j, m in enumerate((1, 1.25, 1.5, 2)):
            au.add(au.pluck(392 * m, decay=1.5, dur=3), un + 0.1 + 0.07 * j, 0.5, 0.28)
    else:
        for j in range(6):
            au.add(au.pluck(523 * 2 ** (PENT[j % 5] / 12 + j // 5), decay=8, dur=0.6), un + 0.06 * j, 0.3 + 0.08 * j, 0.25)
au.beat(96, lambda t: 0.25 if t < U1 else (0.5 if t < U2 else 0.6), 0.0, DUR - 0.2)
n = int(DUR * SR)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.2) * 0.9
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
from scipy.io import wavfile
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

# ---------------- video ----------------
enc = Enc(OUT + '.v.mp4')
first_img = None
for f in range(NF):
    t = f / FPS
    img = render(t)
    if t >= U2:
        z = 1 + 0.05 * min(1, (t - U2) / 4)
        M = cv2.getRotationMatrix2D((CX, PY0 + PH / 2), 0, z)
        img = cv2.warpAffine(img, M, (W, H), borderMode=cv2.BORDER_REPLICATE)
        if t - U2 < 0.6:
            img = cv2.addWeighted(img, 1, np.full_like(img, 255), 0.35 * (1 - (t - U2) / 0.6), 0)
    if t < 3.2:
        put(img, '紙を折って開いたら…', 540, 190, 80, alpha=min(1, (3.2 - t) / 0.4))
        put(img, '何が出る？', 540, 300, 76, (255, 226, 60), 1 + 0.04 * np.sin(t * 5), alpha=min(1, (3.2 - t) / 0.4))
    if f == 0:
        first_img = img.copy()
    if f >= NF - XF:
        k2 = (f - (NF - XF)) / XF
        img = cv2.addWeighted(img, 1 - k2, first_img, k2, 0)
    enc.write(img)
enc.close()
mux(OUT + '.v.mp4', OUT + '.wav', OUT); os.remove(OUT + '.v.mp4'); os.remove(OUT + '.wav')
print('done', OUT)
