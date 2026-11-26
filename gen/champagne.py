"""シャンパンタワー（非ボール型・新しい6型の1）。
8段36個のグラスのてっぺんに注ぎ続けると、あふれた分が左右半分ずつ下の段へ流れ落ちる。
真ん中のグラスほど早く満タンになり、最後に満タンになるのは一番下の両端（物理の結果そのものがオチ）。
0秒で一番上のグラスがもう半分まで注がれている状態から始まる。
使い方: python gen/champagne.py SEED 出力.mp4 [--dur 26] [--rows 8]
  SEED は泡の位置・液体の色味（シャンパン/ロゼ/ブルー）・背景の色を変える。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
ARGS = sys.argv[1:]
DUR_ = 26.0
ROWS = 8
if '--dur' in ARGS:
    _i = ARGS.index('--dur'); DUR_ = float(ARGS[_i + 1]); del ARGS[_i:_i + 2]
if '--rows' in ARGS:
    _i = ARGS.index('--rows'); ROWS = int(ARGS[_i + 1]); del ARGS[_i:_i + 2]
import lib
lib.DUR = DUR_; lib.NF = int(DUR_ * 60)
from lib import *
DUR = lib.DUR; NF = lib.NF

SEED = int(ARGS[0]) if len(ARGS) > 0 else 1
OUT = ARGS[1] if len(ARGS) > 1 else 'champagne.mp4'
rng = np.random.default_rng(SEED)
LIQ = [((70, 200, 255), (30, 140, 220)),      # champagne gold (BGR light, dark)
       ((170, 140, 255), (110, 70, 220)),     # rose
       ((255, 220, 90), (220, 150, 30))][SEED % 3]

# ---------------- simulation (capacity 1, pour rate 1)
N = ROWS * (ROWS + 1) // 2
def idx(r, i): return r * (r + 1) // 2 + i
dt = 0.002
fill = np.zeros(N); full_t = np.full(N, np.inf)
hist_s, hist = [], []
s = 0.0
inflow_hist = []
while np.isinf(full_t).any():
    inflow = np.zeros(N); inflow[0] = 1.0
    for r in range(ROWS):
        for i in range(r + 1):
            k = idx(r, i)
            if fill[k] >= 1.0 and r < ROWS - 1:
                inflow[idx(r + 1, i)] += inflow[k] / 2; inflow[idx(r + 1, i + 1)] += inflow[k] / 2
    newly = (fill < 1.0) & (fill + inflow * dt >= 1.0)
    fill = np.minimum(1.0, fill + inflow * dt)
    s += dt
    full_t[newly] = s
    if len(hist_s) == 0 or s - hist_s[-1] >= 0.01:
        hist_s.append(s); hist.append(fill.copy()); inflow_hist.append(inflow.copy())
hist_s.append(s); hist.append(fill.copy()); inflow_hist.append(inflow.copy())
hist_s = np.array(hist_s); hist = np.array(hist); inflow_hist = np.array(inflow_hist)
S_END = full_t.max()

# ---------------- timeline: map video time -> sim time so "full" events come at a steady, accelerating beat
LOOP_XF = 24
T_END = DUR - 4.0
uniq = np.unique(np.round(full_t, 3))
nU = len(uniq)
# video times for each unique full event: first at 0.55s, last-but-one at T_END-2.4, last at T_END (suspense gap)
w = np.array([0.93 ** j for j in range(nU - 1)])
tv = np.concatenate([[0], np.cumsum(w[:-1])])
tv = 0.55 + tv / tv[-1] * (T_END - 2.4 - 0.55) if nU > 2 else np.array([0.55])
tv = np.concatenate([tv, [T_END]])
KT = np.concatenate([[0.0], tv]); KS = np.concatenate([[0.5], uniq])
def sim_time(t): return float(np.interp(t, KT, KS))
def state(t):
    sv = sim_time(min(t, T_END))
    j = min(len(hist_s) - 1, int(np.searchsorted(hist_s, sv)))
    return hist[j], inflow_hist[j], sv

# ---------------- geometry
DX = min(128, 1020 // ROWS)
GW = int(DX * 0.94); BH = int(DX * 0.42); STEM = int(DX * 0.36); PITCH = BH + STEM + 6
Y0 = 1560 - ROWS * PITCH          # rim y of the top glass; table at 1560
TABLE = 1560
pos = []
for r in range(ROWS):
    for i in range(r + 1):
        pos.append((540 + (i - r / 2) * DX, Y0 + r * PITCH, r))
# fill fraction (volume) -> liquid height for a half-ellipsoid bowl
hh = np.linspace(0, 1, 200); vv = (3 * hh ** 2 - hh ** 3) / 2
def lvl(f): return float(np.interp(f, vv, hh))

# bowl mask patch (lower half ellipse)
PW, PHh = GW + 4, BH + 4
bowl = np.zeros((PHh, PW), np.uint8)
cv2.ellipse(bowl, (PW // 2, 0), (GW // 2, BH), 0, 0, 180, 255, -1)
bowl = bowl > 0
BUB = rng.uniform(0, 1, (N, 6, 3))

# ---------------- audio
au = Audio(SEED)
from scipy.signal import butter, lfilter
from scipy.io import wavfile
n = int(DUR * SR)
b, a = butter(2, [500 / (SR / 2), 3000 / (SR / 2)], 'band')
pour = lfilter(b, a, np.random.default_rng(5).normal(0, 1, n))
b2, a2 = butter(2, [3000 / (SR / 2), 9000 / (SR / 2)], 'band')
fizz = lfilter(b2, a2, np.random.default_rng(6).normal(0, 1, n))
tt = np.arange(n) / SR
envp = np.where(tt < T_END, 0.07, 0.0)
envp = np.convolve(envp, np.ones(3000) / 3000, 'same')
nstream = np.array([np.sum(state(x)[1] > 0) for x in np.arange(0, DUR, 0.1)])
envf = np.interp(tt, np.arange(0, DUR, 0.1), 0.01 + 0.0025 * nstream)
au.add(pour * envp + fizz * envf * (0.6 + 0.4 * np.sin(tt * 37) ** 2), 0, 0.5, 1.0)
PENT = [0, 2, 4, 7, 9]
order = np.argsort(full_t)
full_video = {}
for k in range(N):
    full_video[k] = float(np.interp(full_t[k], KS, KT))
evs = sorted(set(round(v, 3) for v in full_video.values()))
for j, tv_ in enumerate(evs):
    if tv_ < 0.05:
        continue
    note = 392 * 2 ** ((PENT[j % 5] + 12 * (j // 5)) / 12 - 1)
    ks = [k for k in range(N) if abs(full_video[k] - tv_) < 0.002]
    pan = 0.5 + 0.35 * np.clip((np.mean([pos[k][0] for k in ks]) - 540) / 500, -1, 1)
    au.add(au.pluck(note, decay=7, dur=0.9, bright=0.6), tv_, pan, 0.32)
    au.add(au.pluck(note * 2, decay=12, dur=0.5, bright=0.2), tv_ + 0.01, 1 - pan, 0.12)
au.riser(T_END, 2.4, 0.45)
au.add(au.smash(7), T_END, 0.5, 0.7)
for j, m in enumerate((1, 1.25, 1.5, 2, 2.5)):
    au.add(au.pluck(523.25 * m, decay=1.3, dur=3), T_END + 0.1 + 0.07 * j, 0.3 + 0.1 * j, 0.22)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

# ---------------- video
tint = [(46, 14, 30), (40, 18, 46), (50, 26, 18)][SEED % 3]
bg = make_bg(1100, tint)
cv2.rectangle(bg, (0, TABLE), (W, H), (26, 20, 30), -1)
cv2.line(bg, (0, TABLE), (W, TABLE), (90, 80, 100), 3)
enc = Enc(OUT + '.v.mp4')
first = None
flash = 0.0
GL = (235, 225, 240)
LIMIT = int(os.environ.get('FRAMES', NF))
sparks = []
for f in range(min(NF, LIMIT)):
    t = f / FPS
    fl, infl, sv = state(t)
    lay = np.zeros((H, W, 3), np.uint8)
    pour_on = t < T_END
    sfade = 1.0 if pour_on else max(0.0, 1 - (t - T_END) / 0.6)
    # bottle + pour stream onto the top glass
    bx, by = 540, Y0 - 150 - 40 * (0 if pour_on else min(1, (t - T_END) * 2))
    ang = np.radians(38)
    d_ = np.array([np.cos(ang), -np.sin(ang)]); p_ = np.array([np.sin(ang), np.cos(ang)])
    tip = np.array([bx, by])
    prof = [(0, 15), (75, 15), (125, 44), (330, 44), (340, 30)]
    pts = [tip + a_ * d_ + b_ * p_ for a_, b_ in prof] + [tip + a_ * d_ - b_ * p_ for a_, b_ in prof[::-1]]
    cv2.fillPoly(lay, [np.array(pts, np.int32)], (50, 95, 40))
    lab = [tip + a_ * d_ + b_ * p_ for a_, b_ in ((170, 40), (270, 40), (270, -40), (170, -40))]
    cv2.fillPoly(lay, [np.array(lab, np.int32)], (90, 200, 235))
    foil = [tip + a_ * d_ + b_ * p_ for a_, b_ in ((0, 16), (55, 16), (55, -16), (0, -16))]
    cv2.fillPoly(lay, [np.array(foil, np.int32)], (60, 170, 220))
    hl = [tip + 140 * d_ + 28 * p_, tip + 320 * d_ + 28 * p_]
    cv2.line(lay, tuple(int(v) for v in hl[0]), tuple(int(v) for v in hl[1]), (140, 190, 130), 4)
    if sfade > 0:
        cv2.line(lay, (int(bx), int(by + 8)), (540, int(Y0 + BH * 0.6)), tuple(int(c * sfade) for c in LIQ[0]), 7)
    # glasses
    for k, (cx, ry, r) in enumerate(pos):
        x0 = int(cx - PW / 2); y0 = int(ry)
        lv = lvl(fl[k])
        cut = int(round(BH * (1 - lv)))
        m = bowl.copy(); m[:cut] = False
        sub = lay[y0:y0 + PHh, x0:x0 + PW]
        sub[m] = LIQ[1]
        if lv > 0.02:
            band = bowl.copy(); band[:cut] = False; band[cut + max(3, BH // 6):] = False
            sub[band] = LIQ[0]
            # bubbles
            for (u, ph, sp) in BUB[k]:
                yy_ = int(BH - ((t * (0.4 + 0.5 * sp) + ph) % 1) * BH * lv)
                xx_ = int(PW / 2 + (u - 0.5) * GW * 0.7 * np.sqrt(max(0.05, 1 - (yy_ / BH) ** 2)))
                if 0 <= yy_ < PHh and 0 <= xx_ < PW and m[min(PHh - 1, yy_), xx_]:
                    cv2.circle(sub, (xx_, yy_), 2, (230, 250, 255), -1)
        # glass outline
        cg = GL
        age = t - full_video[k]
        if 0 <= age < 0.5:
            cg = (255, 255, 255)
        cv2.ellipse(lay, (int(cx), y0), (GW // 2, BH), 0, 0, 180, cg, 2)
        cv2.ellipse(lay, (int(cx), y0), (GW // 2, max(4, BH // 6)), 0, 0, 360, cg, 2)
        cv2.line(lay, (int(cx), y0 + BH), (int(cx), y0 + BH + STEM), cg, 3)
        cv2.ellipse(lay, (int(cx), y0 + BH + STEM), (GW // 4, 5), 0, 0, 360, cg, -1)
        if 0 <= age < 0.6:
            q = age / 0.6
            cv2.circle(lay, (int(cx), y0 + BH // 3), int(GW * (0.3 + 0.5 * q)), tuple(int(c * (1 - q)) for c in (255, 255, 255)), 2)
        # overflow streams down both rim edges
        if fl[k] >= 1.0 and infl[k] > 0 and sfade > 0:
            thick = max(2, min(6, int(1 + 8 * infl[k])))
            yend = (ry + PITCH + BH * 0.5) if r < ROWS - 1 else TABLE
            for sgn in (-1, 1):
                ex = int(cx + sgn * GW / 2 * 0.97)
                col = tuple(int(c * sfade) for c in LIQ[0])
                cv2.line(lay, (ex, int(ry)), (ex, int(yend)), col, thick)
                ph = (t * 3 + k * 0.37) % 1
                yd = int(ry + (yend - ry) * ph)
                cv2.line(lay, (ex, yd), (ex, min(int(yend), yd + 12)), (240, 250, 255), max(1, thick - 1))
    # finale sparkles
    if t >= T_END and t - 1 / FPS < T_END:
        flash = 0.5
        for k, (cx, ry, r) in enumerate(pos):
            for _ in range(3):
                sparks.append([cx + rng.uniform(-GW / 2, GW / 2), ry + rng.uniform(-10, BH), rng.uniform(0.3, 1.2), rng.uniform(0, 6)])
    for sp in sparks:
        x_, y_, life, ph = sp
        a_ = max(0.0, 1 - (t - T_END) / (life + 1.8))
        tw = (0.5 + 0.5 * np.sin(t * 12 + ph)) * a_
        if tw > 0.05:
            L_ = int(6 + 10 * tw)
            c_ = tuple(int(v * tw) for v in (255, 255, 255))
            cv2.line(lay, (int(x_ - L_), int(y_)), (int(x_ + L_), int(y_)), c_, 2)
            cv2.line(lay, (int(x_), int(y_ - L_)), (int(x_), int(y_ + L_)), c_, 2)
    flash *= 0.9
    img = glow(bg, lay, 0.45, 5)
    nfull = int(np.sum(fl >= 1.0))
    if t < T_END:
        put(img, '最後に満タンになるのは', 540, 170, 74)
        put(img, 'どのグラス？', 540, 280, 84, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
        bump = 1.0
        for v in evs:
            if 0 <= t - v < 0.35:
                bump = 1 + 0.35 * np.exp(-(t - v) * 10)
        rem = N - nfull
        put(img, f'満タン {nfull} / {N}', 540, 1700, 80, (255, 255, 255), bump)
        if rem <= 2 and rem > 0:
            put(img, f'あと{rem}個…！', 540, 1820, 64, (255, 160, 120), 1 + 0.06 * np.sin(t * 9))
    else:
        s_ = 1 + 1.2 * np.exp(-(t - T_END) * 7)
        put(img, '一番下の両はしでした！', 540, 225, 76, (255, 226, 60), s_)
        put(img, f'満タン {N} / {N}！', 540, 1700, 84, (255, 255, 255), s_)
        put(img, '予想は当たった？', 540, 1820, 60)
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
print('T_END', round(T_END, 2), 'unique events', nU, 'S_END', round(S_END, 2))
