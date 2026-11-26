"""歯車の連鎖（非ボール型・新しい6型の2）。
画面の下から上へ、うねうね並んだ歯車の「影」がはじめから見えている。1個目がハンドルで回っていて、
次の歯車が1個ずつストンとはまるたびに連動して回り出す（はまるペースはだんだん加速）。
かみ合う歯車は回る向きが交互に逆になるので、最後の大きな歯車の向き（右回り／左回り）は途中で数えれば予想できる。
最後の歯車がはまると、大きな矢印と「右回り！」で答え合わせ（物理の結果そのものがオチ）。
使い方: python gen/gears.py SEED 出力.mp4 [--dur 26]
  SEED で歯車の並び（道すじ・大きさ・個数）が変わる。
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

SEED = int(ARGS[0]) if len(ARGS) > 0 else 1
OUT = ARGS[1] if len(ARGS) > 1 else 'gears.mp4'
rng = np.random.default_rng(SEED)
MOD = 7.0
X0, X1, YTOP, YBOT = 60, 1020, 470, 1660
TEETH = [12, 14, 16, 18, 20, 24, 28]


def rad(n): return MOD * n / 2


def build():
    for attempt in range(4000):
        n0 = 20
        g = [(160 + rng.uniform(-40, 40), YBOT - rad(n0) - 10, n0, 0.0)]  # x, y, teeth, phi(from parent)
        sx = 1
        ok = True
        while True:
            x, y, n, _ = g[-1]
            if y - rad(n) < YTOP + 120:
                break
            if len(g) > 40:
                ok = False; break
            placed = False
            for tr in range(60):
                nn = int(rng.choice(TEETH))
                if (x > X1 - 170 and sx > 0) or (x < X0 + 170 and sx < 0):
                    phi = np.radians(-90 + rng.uniform(-35, 35)) if tr < 30 else np.radians(-90 - sx * rng.uniform(20, 70))
                    flip = True
                else:
                    phi = np.radians(rng.uniform(-35, 15)) if sx > 0 else np.radians(180 - rng.uniform(-35, 15))
                    flip = False
                d = rad(n) + rad(nn)
                nx, ny = x + d * np.cos(phi), y + d * np.sin(phi)
                R = rad(nn) + MOD
                if nx - R < X0 or nx + R > X1 or ny + R > YBOT + 20 or ny - R < YTOP:
                    continue
                if any(np.hypot(nx - a, ny - b) < rad(nn) + rad(m) + 3 * MOD for (a, b, m, _) in g[:-1]):
                    continue
                g.append((nx, ny, nn, phi)); placed = True
                if flip and abs(np.degrees(phi) + 90) < 50:
                    sx = -sx
                break
            if not placed:
                ok = False; break
        if not ok or len(g) < 22:
            continue
        # final big gear on top
        x, y, n, _ = g[-1]
        nn = 40
        for tr in range(200):
            phi = np.radians(-90 + rng.uniform(-70, 70))
            d = rad(n) + rad(nn)
            nx, ny = x + d * np.cos(phi), y + d * np.sin(phi)
            R = rad(nn) + MOD
            if nx - R < X0 or nx + R > X1 or ny - R < YTOP - 40:
                continue
            if any(np.hypot(nx - a, ny - b) < rad(nn) + rad(m) + 3 * MOD for (a, b, m, _) in g[:-1]):
                continue
            g.append((nx, ny, nn, phi))
            return g
    raise SystemExit('no layout')


G = build()
NG = len(G)
# angle relations: theta_j = A_j * theta_0 + B_j
A = [1.0]; B = [0.0]
for j in range(1, NG):
    ni, nj = G[j - 1][2], G[j][2]; phi = G[j][3]
    r_ = ni / nj
    A.append(-r_ * A[-1])
    B.append(phi + np.pi - np.pi / nj - r_ * (B[-1] - phi))
OMEGA = 1.6
LOOP_XF = 24
T_END = DUR - 4.2
PRE = 3
w = np.array([0.94 ** j for j in range(NG - PRE)])
tk = np.concatenate([np.zeros(PRE), 0.35 + np.cumsum(w) / np.sum(w) * (T_END - 0.35 - 1.3)])
tk[-1] = T_END   # last one a bit later (suspense)
DROP = 0.28


def gear_poly(n):
    r = rad(n); ro = r + MOD; rr = r - 1.25 * MOD
    pts = []
    for k in range(n):
        a = 2 * np.pi * k / n; s = 2 * np.pi / n
        for (da, rad_) in ((-0.5 * s, rr), (-0.27 * s, rr), (-0.17 * s, ro), (0.17 * s, ro), (0.27 * s, rr)):
            pts.append((rad_ * np.cos(a + da), rad_ * np.sin(a + da)))
    return np.array(pts)


POLY = [gear_poly(n) for (_, _, n, _) in G]
CW_LAST = A[-1] > 0   # image coords (y down): increasing angle = clockwise on screen
ANS = '右回り' if CW_LAST else '左回り'

# ---------------- audio
au = Audio(SEED)
from scipy.signal import butter, lfilter
from scipy.io import wavfile
n_ = int(DUR * SR)
PENT = [0, 2, 4, 7, 9]
for j in range(PRE, NG):
    t_ = tk[j]
    note = 220 * 2 ** ((PENT[(j - PRE) % 5] + 12 * ((j - PRE) // 5)) / 12)
    au.add(au.kick, t_, 0.5, 0.7 if j < NG - 1 else 1.3)
    au.add(au.pluck(note, decay=9, dur=0.6, bright=0.8), t_, 0.3 + 0.4 * ((G[j][0] - X0) / (X1 - X0)), 0.25)
    au.add(au.pluck(note * 2.76, decay=25, dur=0.2, bright=0.1), t_ + 0.005, 0.5, 0.08)
# tooth ticks of gear 0 (count grows with engaged gears)
th = np.arange(int(0.02 * SR)) / SR
b, a = butter(2, 3500 / (SR / 2), 'high')
tick = lfilter(b, a, np.random.default_rng(3).normal(0, 1, len(th))) * np.exp(-th * 250)
period = 2 * np.pi / G[0][2] / OMEGA
tt = 0.0
while tt < DUR:
    ne = np.sum(tk <= tt)
    au.add(tick, tt, 0.3 + 0.4 * rng.random(), 0.05 + 0.006 * ne)
    tt += period * 2
au.riser(T_END, 2.5, 0.45)
au.add(au.smash(2), T_END, 0.5, 0.75)
for j, m in enumerate((1, 1.25, 1.5, 2)):
    au.add(au.pluck(440 * m, decay=1.5, dur=3), T_END + 0.1 + 0.07 * j, 0.5, 0.24)
outw = np.tanh(np.stack([au.L[:n_], au.R[:n_]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

# ---------------- video
bg = make_bg(1000, (40, 26, 20))
for j, (x, y, n, _) in enumerate(G):   # silhouettes are part of the background
    p = (POLY[j] + [x, y]).astype(np.int32)
    cv2.polylines(bg, [p], True, (70, 66, 74), 2, cv2.LINE_AA)
    cv2.circle(bg, (int(x), int(y)), 6, (70, 66, 74), -1, cv2.LINE_AA)
LAST = G[-1]
enc = Enc(OUT + '.v.mp4')
first = None
flash = 0.0
LIMIT = int(os.environ.get('FRAMES', NF))
for f in range(min(NF, LIMIT)):
    t = f / FPS
    th0 = OMEGA * t
    lay = np.zeros((H, W, 3), np.uint8)
    neng = int(np.sum(tk <= t))
    for j, (x, y, n, _) in enumerate(G):
        dtj = t - tk[j]
        if dtj < -DROP:
            continue
        if dtj < 0:
            q = 1 + dtj / DROP
            e = q * q
            yo = -90 * (1 - e); sc = 1.25 - 0.25 * e; ang = A[j] * OMEGA * tk[j] + B[j]
            alpha = 0.4 + 0.6 * q
        else:
            yo = 0; sc = 1.0; ang = A[j] * th0 + B[j]
            alpha = 1.0
            bounce = np.exp(-dtj * 14) * np.sin(dtj * 40) * 6
            yo = -abs(bounce)
        hue = 0.02 + 0.85 * j / (NG - 1)
        col = hsv(hue, 0.6, 0.95); dark = hsv(hue, 0.75, 0.55)
        if dtj < 0:
            col = tuple(int(c * alpha) for c in (170, 165, 175)); dark = tuple(int(c * alpha) for c in (90, 88, 95))
        ca, sa = np.cos(ang), np.sin(ang)
        P = POLY[j] @ np.array([[ca, sa], [-sa, ca]]) * sc + [x, y + yo]
        cv2.fillPoly(lay, [P.astype(np.int32)], col, cv2.LINE_AA)
        r = rad(n) * sc
        cv2.circle(lay, (int(x), int(y + yo)), int(r - 2.2 * MOD), dark, -1, cv2.LINE_AA)
        # spokes (show rotation clearly)
        ns = 3 if n < 20 else (4 if n < 30 else 5)
        for k in range(ns):
            a2 = ang + 2 * np.pi * k / ns
            cv2.line(lay, (int(x), int(y + yo)), (int(x + (r - 2.4 * MOD) * np.cos(a2)), int(y + yo + (r - 2.4 * MOD) * np.sin(a2))), col, max(6, int(r * 0.16)), cv2.LINE_AA)
        cv2.circle(lay, (int(x), int(y + yo)), int(max(10, r * 0.22)), col, -1, cv2.LINE_AA)
        cv2.circle(lay, (int(x), int(y + yo)), 6, (40, 40, 40), -1, cv2.LINE_AA)
        if 0 <= dtj < 0.3:
            k2 = 1 - dtj / 0.3
            cv2.circle(lay, (int(x), int(y)), int(rad(n) + MOD + 30 * (1 - k2)), tuple(int(255 * k2) for _ in range(3)), 3, cv2.LINE_AA)
        if j == 0:   # crank handle
            hx, hy = x + rad(n) * 0.55 * np.cos(ang), y + rad(n) * 0.55 * np.sin(ang)
            cv2.circle(lay, (int(hx), int(hy)), 16, (230, 230, 240), -1, cv2.LINE_AA)
    # "?" on the last gear's silhouette until it lands
    lx, ly, ln_, _ = LAST
    if t < tk[-1] - DROP:
        put(lay, '?', lx, ly, 120, (255, 226, 60), 1 + 0.06 * np.sin(t * 6))
    if t >= T_END and t - 1 / FPS < T_END:
        flash = 0.5
    flash *= 0.9
    img = glow(bg, lay, 0.3, 5)
    if t >= T_END:
        # big direction arrow around the last gear
        q = min(1.0, (t - T_END) / 0.6)
        R = int(rad(ln_) + MOD + 28)
        sweep = 300 * q
        base = np.degrees(A[-1] * OMEGA * t) % 360
        if CW_LAST:
            a0, a1 = base, base + sweep
        else:
            a0, a1 = base - sweep, base
        cv2.ellipse(img, (int(lx), int(ly)), (R, R), 0, a0, a1, (60, 226, 255), 14, cv2.LINE_AA)
        tipa = np.radians(a1 if CW_LAST else a0)
        tx, ty = lx + R * np.cos(tipa), ly + R * np.sin(tipa)
        tdir = np.array([-np.sin(tipa), np.cos(tipa)]) * (1 if CW_LAST else -1)
        nrm = np.array([np.cos(tipa), np.sin(tipa)])
        tri = np.array([[tx, ty] + tdir * 42, [tx, ty] + nrm * 30, [tx, ty] - nrm * 30], np.int32)
        cv2.fillPoly(img, [tri], (60, 226, 255), cv2.LINE_AA)
    if t < T_END:
        put(img, '最後の歯車は', 540, 150, 74)
        put(img, '右回り？左回り？', 540, 260, 84, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
        bump = 1.0
        for v in tk[PRE:]:
            if 0 <= t - v < 0.35:
                bump = 1 + 0.35 * np.exp(-(t - v) * 10)
        put(img, f'{neng} / {NG} 個', 540, 1800, 80, (255, 255, 255), bump)
    else:
        s_ = 1 + 1.3 * np.exp(-(t - T_END) * 7)
        put(img, f'{ANS}でした！', 540, 220, 96, (255, 226, 60), s_)
        put(img, f'{NG} / {NG} 個！', 540, 1800, 80, (255, 255, 255), s_)
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
print('gears', NG, 'answer', ANS, 'T_END', round(T_END, 2))
