"""満タンになるたびに2つに分かれる（非ボール型）。
1つの箱に色水が注がれ、満タンになると箱が2つに割れて水は半分ずつに。また注がれて満タン→分裂…を
繰り返し、最後は256個の箱が虹色のモザイクになる。0秒で水がすでに注がれている状態から始まる。
使い方: python gen/fillsplit.py SEED 出力.mp4 [--dur 26] [--levels 8] [--pic 絵の名前]
  --pic を付けると、分裂が進むほど箱の色が pics.py の絵に近づき、最後のモザイクが絵になる（絵当て版）。
  SEED は色の並び（色相の回転・向き）と水面の揺れだけを変える。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
ARGS = sys.argv[1:]
DUR_ = 26.0
LEVELS = 8
if '--dur' in ARGS:
    _i = ARGS.index('--dur'); DUR_ = float(ARGS[_i + 1]); del ARGS[_i:_i + 2]
if '--levels' in ARGS:
    _i = ARGS.index('--levels'); LEVELS = int(ARGS[_i + 1]); del ARGS[_i:_i + 2]
PIC = None
if '--pic' in ARGS:
    _i = ARGS.index('--pic'); PIC = ARGS[_i + 1]; del ARGS[_i:_i + 2]
import lib
lib.DUR = DUR_; lib.NF = int(DUR_ * 60)
from lib import *
DUR = lib.DUR; NF = lib.NF

SEED = int(ARGS[0]) if len(ARGS) > 0 else 1
OUT = ARGS[1] if len(ARGS) > 1 else 'fillsplit.mp4'
rng = np.random.default_rng(SEED)
HUE0 = rng.uniform(0, 1)
HDIR = 1 if rng.random() < 0.5 else -1

AX, AY, AWd, AHt = 70, 400, 940, 1360   # area of the boxes
SPLIT = 0.42                             # seconds of split animation
START_FILL = 0.5                         # level-0 box is already half full at 0s
HOLD = 3.6                               # seconds after the last split is full (celebration)

# --- timeline: fill durations shrink each level so it accelerates
LOOP_XF = 24
avail = DUR - HOLD - LEVELS * SPLIT - LOOP_XF / FPS
base = [0.87 ** L for L in range(LEVELS + 1)]
base[0] *= (1 - START_FILL)
k = avail / sum(base)
FILL = [b * k for b in base]
events = []   # (t_start_fill, t_full, level)
t = 0.0
for L in range(LEVELS + 1):
    events.append((t, t + FILL[L], L))
    t += FILL[L] + (SPLIT if L < LEVELS else 0)
T_END = events[-1][1]


def grid_dims(L):
    return 2 ** ((L + 1) // 2), 2 ** (L // 2)   # rows, cols (first split is horizontal: area is tall)


def rects(L):
    rows, cols = grid_dims(L)
    gap = max(3, 16 - 2 * L)
    bw, bh = AWd / cols, AHt / rows
    out = []
    for r in range(rows):
        for c in range(cols):
            out.append((AX + c * bw + gap / 2, AY + r * bh + gap / 2, bw - gap, bh - gap, r, c))
    return out


PICIMG = None
if PIC:
    import pics
    _p = pics.pic(PIC, AWd // 4, AHt // 4)          # RGB 0..1
    PICIMG = np.pad(np.cumsum(np.cumsum(_p, 0), 1), ((1, 0), (1, 0), (0, 0)))


def pic_col(x, y, w, h):
    """mean picture colour (BGR uint8 tuple) over a box"""
    a0 = int(np.clip((x - AX) / 4, 0, AWd // 4 - 1)); b0 = int(np.clip((y - AY) / 4, 0, AHt // 4 - 1))
    a1 = int(np.clip((x + w - AX) / 4, a0 + 1, AWd // 4)); b1 = int(np.clip((y + h - AY) / 4, b0 + 1, AHt // 4))
    S = PICIMG
    m = (S[b1, a1] - S[b0, a1] - S[b1, a0] + S[b0, a0]) / ((a1 - a0) * (b1 - b0))
    return np.array([m[2], m[1], m[0]]) * 255


def parent_index(L, r, c):
    """index in level L-1 of the parent of cell (r,c) in level L"""
    rows_p, cols_p = grid_dims(L - 1)
    rows, cols = grid_dims(L)
    pr = r // (rows // rows_p); pc = c // (cols // cols_p)
    return pr * cols_p + pc


def hue_at(x, y):
    u = (x - AX) / AWd; v = (y - AY) / AHt
    return HUE0 + HDIR * (0.55 * v + 0.30 * u)


def state(t):
    """returns (level, list of (x,y,w,h,fill,hue)), pour on/off"""
    for (ts, tf, L) in events:
        if t < tf:
            f0 = START_FILL if L == 0 else 0.5
            fill = f0 + (1 - f0) * max(0.0, (t - ts) / (tf - ts))
            return L, [(x, y, w, h, fill, hue_at(x + w / 2, y + h / 2)) for (x, y, w, h, r, c) in rects(L)], True, None
        if L < LEVELS and t < tf + SPLIT:
            p = (t - tf) / SPLIT
            e = 1 - (1 - p) ** 3
            prev = rects(L)
            out = []
            for (x, y, w, h, r, c) in rects(L + 1):
                px, py, pw, ph, _, _ = prev[parent_index(L + 1, r, c)]
                rows, cols = grid_dims(L + 1)
                rp, cp = grid_dims(L)
                # start rect = matching half of the parent box (no gap)
                if rows > rp:
                    half = r % 2
                    sx, sy, sw, sh = px, py + half * ph / 2, pw, ph / 2
                else:
                    half = c % 2
                    sx, sy, sw, sh = px + half * pw / 2, py, pw / 2, ph
                X = sx + (x - sx) * e; Y = sy + (y - sy) * e; Wd = sw + (w - sw) * e; Hh = sh + (h - sh) * e
                fill = 1.0 - 0.5 * min(1.0, p * 1.6)
                out.append((X, Y, Wd, Hh, fill, hue_at(X + Wd / 2, Y + Hh / 2)))
            return L, out, False, p
    return LEVELS, [(x, y, w, h, 1.0, hue_at(x + w / 2, y + h / 2)) for (x, y, w, h, r, c) in rects(LEVELS)], False, None


def count_at(t):
    n = 1
    for (ts, tf, L) in events:
        if L < LEVELS and t >= tf + SPLIT * 0.25:
            n = 2 ** (L + 1)
    return n


# ---------------- audio
au = Audio(SEED)
from scipy.signal import butter, lfilter
n = int(DUR * SR)
b, a = butter(2, [400 / (SR / 2), 2600 / (SR / 2)], 'band')
pour = lfilter(b, a, np.random.default_rng(5).normal(0, 1, n))
b2, a2 = butter(2, [2600 / (SR / 2), 7000 / (SR / 2)], 'band')
pour += 0.5 * lfilter(b2, a2, np.random.default_rng(6).normal(0, 1, n))
env = np.zeros(n)
for (ts, tf, L) in events:
    i0, i1 = int(ts * SR), int(tf * SR)
    env[i0:i1] = 0.08 + 0.02 * L
env = np.convolve(env, np.ones(2000) / 2000, 'same')
au.add(pour * env, 0, 0.5, 1.0)
PENT = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]
for (ts, tf, L) in events:
    # small "gulp" notes while filling (rising)
    m = 3 + L
    for j in range(m):
        tt = ts + (tf - ts) * (j + 0.5) / m
        au.add(au.pluck(330 * 2 ** ((PENT[j % 5] + 12 * (j * 2 // m)) / 12), decay=16, dur=0.3, bright=0.1), tt, 0.3 + 0.4 * (j % 2), 0.07)
    if L < LEVELS:
        root = 196 * 2 ** (PENT[L] / 12)
        au.add(au.kick, tf, 0.5, 0.9)
        au.add(au.pluck(root, decay=6, dur=0.8), tf, 0.35, 0.35)
        au.add(au.pluck(root * 1.5, decay=6, dur=0.8), tf + 0.04, 0.65, 0.3)
au.riser(T_END, 3.0, 0.5)
au.add(au.smash(4), T_END, 0.5, 0.8)
for j, m in enumerate((1, 1.25, 1.5, 2)):
    au.add(au.pluck(392 * m, decay=1.4, dur=3), T_END + 0.12 + 0.06 * j, 0.5, 0.28)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
from scipy.io import wavfile
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

# ---------------- video
bg = make_bg(1080, (40, 22, 30))
enc = Enc(OUT + '.v.mp4')
first = None
flash = 0.0
PH = rng.uniform(0, 6, 4096)
LIMIT = int(os.environ.get('FRAMES', NF))
for f in range(min(NF, LIMIT)):
    t = f / FPS
    L, boxes, pouring, sp = state(t)
    lay = np.zeros((H, W, 3), np.uint8)
    nb = len(boxes)
    lw = 3 if nb <= 16 else (2 if nb <= 64 else 1)
    for i, (x, y, w, h, fill, hu) in enumerate(boxes):
        col = hsv(hu, 0.78, 1.0)
        dark = hsv(hu, 0.85, 0.55)
        if PIC:
            # picture emerges as the boxes get smaller (fully the picture at the last level)
            lv = L + (sp if sp is not None else 0.0)
            wgt = min(1.0, (lv / LEVELS) ** 1.6)
            pc = pic_col(x, y, w, h)
            col = tuple(int(v_) for v_ in np.array(col, float) * (1 - wgt) + pc * wgt)
            dark = tuple(int(v_) for v_ in np.array(dark, float) * (1 - wgt) + pc * 0.72 * wgt)
        x0, y0, x1, y1 = int(x), int(y), int(x + w), int(y + h)
        cv2.rectangle(lay, (x0, y0), (x1, y1), (38, 34, 44), -1)
        # water with a wobbly surface
        amp = min(10, h * 0.04) * (1.6 if sp is not None else 1.0)
        sy = y1 - fill * h
        xs = np.linspace(x0, x1, 9)
        ys = sy + amp * np.sin(xs / max(20, w) * 6.3 + t * 7 + PH[i % 4096]) * (0.3 if fill >= 0.999 else 1.0)
        ys = np.clip(ys, y0, y1)
        poly = np.array([[x0, y1]] + [[int(a_), int(b_)] for a_, b_ in zip(xs, ys)] + [[x1, y1]], np.int32)
        # gradient-ish: dark body + bright top band
        cv2.fillPoly(lay, [poly], dark)
        poly2 = np.array([[int(a_), int(b_)] for a_, b_ in zip(xs, ys)] + [[int(a_), int(min(y1, b_ + max(3, h * 0.12)))] for a_, b_ in zip(xs[::-1], ys[::-1])], np.int32)
        cv2.fillPoly(lay, [poly2], col)
        cv2.rectangle(lay, (x0, y0), (x1, y1), (200, 190, 210), lw)
        if pouring and fill < 0.999:
            sw = max(2, int(w * 0.06))
            cxs = int((x0 + x1) / 2 + 0.15 * w * np.sin(t * 2 + PH[i % 4096]))
            top = AY - 60 if nb == 1 else y0 - 2
            cv2.rectangle(lay, (cxs - sw // 2, top), (cxs + sw // 2, int(sy)), hsv(hu, 0.5, 1.0), -1)
    if sp is not None and sp < 0.15:
        flash = max(flash, 0.18)
    if t >= T_END and t - 1 / FPS < T_END:
        flash = 0.55
    flash *= 0.88
    # celebration: diagonal shimmer over the mosaic
    if t >= T_END:
        q = (t - T_END) * 1.3
        yy, xx = np.mgrid[0:H:8, 0:W:8]
        band = np.exp(-(((xx + yy) / (W + H) * 2.2 - q) ** 2) * 30).astype(np.float32)
        band = cv2.resize(band, (W, H))[..., None]
        lay = np.clip(lay.astype(np.float32) * (1 + 0.9 * band), 0, 255).astype(np.uint8)
    img = glow(bg, lay, 0.35, 5)
    cnt = count_at(t)
    put(img, '満タンになるたび分裂…', 540, 170, 80)
    if t < T_END:
        put(img, '最後は何の絵になる？' if PIC else '最後は何個になる？', 540, 280, 66, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
        bump = 1.0
        for (ts, tf, LL) in events:
            if LL < LEVELS and 0 <= t - tf - SPLIT * 0.25 < 0.4:
                bump = 1 + 0.5 * np.exp(-(t - tf - SPLIT * 0.25) * 10)
        put(img, f'{cnt}個', 540, 1835, 84, (255, 255, 255), bump)
    else:
        s = 1 + 1.4 * np.exp(-(t - T_END) * 7)
        put(img, f'{cnt}個！', 540, 280, 96, (255, 226, 60), s)
        put(img, '何の絵か当たった？' if PIC else '予想は当たった？', 540, 1835, 66)
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
print('T_END', round(T_END, 2), 'fills', [round(x, 2) for x in FILL])
