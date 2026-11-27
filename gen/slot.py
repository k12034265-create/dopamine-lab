"""スロットのリーチ演出（非ボール型・試作）。
3本のリールが0秒から回っている。1回目はハズレ、2回目はリーチ→1コマ通り過ぎてハズレ、
3回目はリーチ→じわじわ減速して1コマ手前で止まる→ガコンと1コマ進んで★が3つ揃う→光が一斉に連鎖する。
玉は使わない。点滅は「流れる光」「広がる波」にして、画面全体のフラッシュは大当たりの1回だけ（光過敏対策）。
絵柄はオリジナル（星・宝石・ハート・クローバー・王冠）。
使い方: python gen/slot.py SEED 出力.mp4 [--dur 26]
  SEED はリールの並びと背景の色味を変える。FRAMES=120 でテスト用に先頭だけ描く。
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
from scipy.signal import butter, lfilter
from scipy.io import wavfile

SEED = int(ARGS[0]) if len(ARGS) > 0 else 1
OUT = ARGS[1] if len(ARGS) > 1 else 'slot.mp4'
rng = np.random.default_rng(SEED)

STAR, GEM, HEART, CLOVER, CROWN = range(5)
NSYM = 5
CELL = 250
RW = 270                    # reel window width
WH = 3 * CELL               # 3 rows visible
CY = 950                    # payline y
WY0 = CY - WH // 2
RX = [270, 540, 810]        # reel centers
L = 14                      # strip length
V0 = 17.0                   # cells / s


# ---------------------------------------------------------------- symbols
def draw_symbol(kind):
    S = CELL * 2
    im = np.full((S, S, 3), (222, 238, 248), np.uint8)
    c = np.array([S / 2, S / 2])

    def P(pts):
        return np.array([c + np.array(p) * S for p in pts], np.int32)
    dark = (40, 30, 30)
    if kind == STAR:
        pts = []
        for k in range(10):
            a = -np.pi / 2 + k * np.pi / 5
            r = 0.40 if k % 2 == 0 else 0.17
            pts.append((r * np.cos(a), r * np.sin(a) + 0.02))
        cv2.fillPoly(im, [P(pts)], (30, 190, 255), cv2.LINE_AA)
        cv2.polylines(im, [P(pts)], True, (10, 90, 170), 14, cv2.LINE_AA)
        hp = [(x * 0.55, y * 0.55 - 0.03) for x, y in pts]
        cv2.fillPoly(im, [P(hp)], (130, 235, 255), cv2.LINE_AA)
    elif kind == GEM:
        pts = [(-0.24, -0.22), (0.24, -0.22), (0.40, -0.04), (0, 0.38), (-0.40, -0.04)]
        cv2.fillPoly(im, [P(pts)], (235, 190, 40), cv2.LINE_AA)
        cv2.fillPoly(im, [P([(-0.24, -0.22), (0.24, -0.22), (0.40, -0.04), (-0.40, -0.04)])], (255, 230, 140), cv2.LINE_AA)
        for a, b in [((-0.12, -0.04), (0, 0.38)), ((0.12, -0.04), (0, 0.38)), ((-0.12, -0.04), (-0.24, -0.22)),
                     ((0.12, -0.04), (0.24, -0.22)), ((-0.12, -0.04), (0, -0.22)), ((0.12, -0.04), (0, -0.22))]:
            cv2.line(im, tuple(P([a])[0]), tuple(P([b])[0]), (255, 250, 220), 5, cv2.LINE_AA)
        cv2.polylines(im, [P(pts)], True, (130, 70, 10), 14, cv2.LINE_AA)
    elif kind == HEART:
        col = (90, 50, 235)
        for sx in (-1, 1):
            cv2.circle(im, tuple(P([(sx * 0.17, -0.10)])[0]), int(0.20 * S), col, -1, cv2.LINE_AA)
        cv2.fillPoly(im, [P([(-0.365, -0.03), (0.365, -0.03), (0, 0.38)])], col, cv2.LINE_AA)
        cv2.ellipse(im, tuple(P([(-0.17, -0.16)])[0]), (int(0.07 * S), int(0.045 * S)), -30, 0, 360, (210, 200, 255), -1, cv2.LINE_AA)
        # outline: draw by edge of mask
        m = np.zeros((S, S), np.uint8)
        for sx in (-1, 1):
            cv2.circle(m, tuple(P([(sx * 0.17, -0.10)])[0]), int(0.20 * S), 255, -1)
        cv2.fillPoly(m, [P([(-0.365, -0.03), (0.365, -0.03), (0, 0.38)])], 255)
        cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cv2.drawContours(im, cnts, -1, (30, 20, 120), 14, cv2.LINE_AA)
    elif kind == CLOVER:
        col = (60, 175, 40)
        cv2.line(im, tuple(P([(0, 0.05)])[0]), tuple(P([(0.10, 0.40)])[0]), (30, 110, 20), 22, cv2.LINE_AA)
        for a in (-np.pi / 2, np.pi / 6, 5 * np.pi / 6):
            for da in (-0.5, 0.5):
                q = (0.15 * np.cos(a + da * 0.9), 0.15 * np.sin(a + da * 0.9) - 0.03)
                cv2.circle(im, tuple(P([q])[0]), int(0.12 * S), col, -1, cv2.LINE_AA)
        cv2.circle(im, tuple(P([(0, -0.03)])[0]), int(0.08 * S), (110, 215, 90), -1, cv2.LINE_AA)
    elif kind == CROWN:
        pts = [(-0.36, 0.26), (-0.38, -0.20), (-0.18, 0.02), (0, -0.30), (0.18, 0.02), (0.38, -0.20), (0.36, 0.26)]
        cv2.fillPoly(im, [P(pts)], (200, 70, 160), cv2.LINE_AA)
        cv2.polylines(im, [P(pts)], True, (90, 20, 70), 14, cv2.LINE_AA)
        cv2.rectangle(im, tuple(P([(-0.36, 0.16)])[0]), tuple(P([(0.36, 0.26)])[0]), (240, 170, 230), -1)
        for q in [(-0.38, -0.22), (0, -0.32), (0.38, -0.22)]:
            cv2.circle(im, tuple(P([q])[0]), int(0.045 * S), (40, 200, 255), -1, cv2.LINE_AA)
    return cv2.resize(im, (CELL, CELL), interpolation=cv2.INTER_AREA)


SYM = [draw_symbol(k) for k in range(NSYM)]


# ---------------------------------------------------------------- timeline
# rounds: (stop start times per reel)
R1 = dict(stops=[0.85, 1.25, 1.65], respin=2.7)
R2 = dict(stops=[3.7, 4.2, 4.6], reach_d=3.4, respin=9.0)
R3 = dict(stops=[10.0, 10.5, 10.9], reach_d=5.6, pause=0.95, nudge_d=0.24)
D_STOP = 0.32

U = np.linspace(0, 1, 2001)


def profile(kind):
    if kind == 'normal':
        sh = (1 - U) ** 2
    else:
        sh = 0.82 * np.exp(-5 * U) * (1 - U) + 0.18 * (1 - U) ** 0.55
    C = np.concatenate([[0], np.cumsum((sh[1:] + sh[:-1]) / 2 * np.diff(U))])
    return C[-1], C / C[-1]


PROF = {k: profile(k) for k in ('normal', 'reach')}

strips = [dict() for _ in range(3)]
segs = [[] for _ in range(3)]   # (t0, t1, kind, data)
bounces = [[] for _ in range(3)]  # times of landing (for display wobble)


def spin_pos(t0, p0, from_rest, t):
    x = t - t0
    if not from_rest:
        return p0 + V0 * x
    if x < 0.3:
        return p0 + V0 * x ** 3 / (3 * 0.09)
    return p0 + V0 * (0.1 + (x - 0.3))


def assign(r, pe, req):
    for off, s in req.items():
        idx = (pe + off) % L
        if strips[r].get(idx, s) != s:
            return False
    for off, s in req.items():
        strips[r][(pe + off) % L] = s
    return True


def plan(r, p0, events):
    """events: list of ('spin', t, from_rest) / ('stop', t, d, prof, req) / ('nudge', t, d)"""
    p, cur = p0, None
    out = []
    for ev in events:
        if ev[0] == 'spin':
            cur = (ev[1], p, ev[2])
        elif ev[0] == 'stop':
            _, ts, d, pk, req = ev
            ps = spin_pos(*cur, ts)
            I, C = PROF[pk]
            Dn = V0 * d * I
            pe = int(np.ceil(ps + Dn))
            while not assign(r, pe, req):
                pe += 1
            out.append((cur[0], ts, 'spin', cur))
            out.append((ts, ts + d, 'ease', (ps, pe, C)))
            bounces[r].append(ts + d)
            p = pe; cur = None
        elif ev[0] == 'nudge':
            _, tn, d = ev
            C = 1 - (1 - U) ** 3
            out.append((tn, tn + d, 'ease', (p, p + 1, C)))
            bounces[r].append(tn + d)
            p = p + 1
        out.append(None)  # marker
    segs[r] = [s for s in out if s is not None]


def pos_at(r, t):
    last = None
    for (t0, t1, kind, data) in segs[r]:
        if t < t0:
            break
        last = (t0, t1, kind, data)
        if t < t1:
            if kind == 'spin':
                return spin_pos(*data, t)
            ps, pe, C = data
            u = (t - t0) / (t1 - t0)
            return ps + (pe - ps) * float(np.interp(u, U, C))
    if last is None:
        return 0.0
    t0, t1, kind, data = last
    if kind == 'spin':
        return spin_pos(*data, t)
    return data[1]


ODD = [HEART, CLOVER, CROWN]
p0s = rng.uniform(0, L, 3)
for r in range(3):
    ev = [('spin', 0.0, False)]
    ev.append(('stop', R1['stops'][r], D_STOP, 'normal', {0: ODD[r]}))
    ev.append(('spin', R1['respin'] + 0.08 * r, True))
    if r < 2:
        ev.append(('stop', R2['stops'][r], D_STOP, 'normal', {0: GEM}))
    else:
        ev.append(('stop', R2['stops'][r], R2['reach_d'], 'reach', {-1: GEM, 0: CROWN, 1: HEART}))
    ev.append(('spin', R2['respin'] + 0.08 * r, True))
    if r < 2:
        ev.append(('stop', R3['stops'][r], D_STOP, 'normal', {0: STAR}))
    else:
        ev.append(('stop', R3['stops'][r], R3['reach_d'], 'reach', {1: STAR, 0: CLOVER, -1: GEM}))
        tn = R3['stops'][r] + R3['reach_d'] + R3['pause']
        ev.append(('nudge', tn, R3['nudge_d']))
    plan(r, p0s[r], ev)

# fill the rest of the strips randomly (no two identical neighbours)
for r in range(3):
    for i in range(L):
        if i not in strips[r]:
            opts = [s for s in range(NSYM) if s != strips[r].get((i - 1) % L) and s != strips[r].get((i + 1) % L)]
            strips[r][i] = int(rng.choice(opts))

T_REACH2 = R2['stops'][1] + D_STOP
T_MISS = R2['stops'][2] + R2['reach_d']
T_REACH3 = R3['stops'][1] + D_STOP
T_SHORT = R3['stops'][2] + R3['reach_d']
T_NUDGE = T_SHORT + R3['pause']
T_J = T_NUDGE + R3['nudge_d']


def phase(t):
    if t >= T_J: return 'jack'
    if t >= T_NUDGE: return 'nudge'
    if t >= T_SHORT: return 'pause'
    if t >= T_REACH3: return 'reach'
    if R2['respin'] <= t < T_REACH3: return 'normal'
    if t >= T_MISS: return 'miss'
    if t >= T_REACH2: return 'reach'
    return 'normal'


# strip image (2 tiles); item i is drawn so that larger i sits higher
strip_img = []
for r in range(3):
    col = np.zeros((L * CELL, RW, 3), np.uint8)
    col[:] = (222, 238, 248)
    for i in range(L):
        y0 = (L - 1 - i) * CELL
        col[y0:y0 + CELL, (RW - CELL) // 2:(RW - CELL) // 2 + CELL] = SYM[strips[r][i]]
        cv2.line(col, (0, y0), (RW, y0), (200, 214, 226), 2)
    strip_img.append(np.vstack([col, col]))
yy = np.arange(WH)
shade = (0.45 + 0.55 * np.cos((yy - WH / 2) / (WH / 2) * 1.05)).astype(np.float32)[:, None, None]


def reel_view(r, p, speed):
    # screen y of item i center = CY + (p - i) * CELL ; strip y of item i center = (L-1-i)*CELL + CELL/2
    off = (L - 1) * CELL + CELL / 2 - CY - p * CELL + WY0
    o = int(round(off)) % (L * CELL)
    v = strip_img[r][o:o + WH].copy()
    if speed > 2.5:
        k = int(min(81, speed * 4)) | 1
        v = cv2.blur(v, (1, k))
    return (v.astype(np.float32) * shade).astype(np.uint8)


def wobble(r, t):
    off = 0.0
    for tb in bounces[r]:
        x = t - tb
        if 0 <= x < 0.45:
            off += 0.10 * np.sin(x * 2 * np.pi / 0.3) * np.exp(-x * 9)
    return off


# ---------------------------------------------------------------- audio
au = Audio(SEED)
n = int(DUR * SR)
tt = np.arange(n) / SR
fine = np.arange(0, DUR, 1 / 600)
P = np.array([[pos_at(r, x) for x in fine] for r in range(3)])
V = np.gradient(P, axis=1) * 600
# whir
b, a = butter(2, [250 / (SR / 2), 1400 / (SR / 2)], 'band')
whir = lfilter(b, a, np.random.default_rng(3).normal(0, 1, n))
lvl_w = np.interp(tt, fine, np.clip(V, 0, V0).sum(0) / (3 * V0))
au.add(whir * lvl_w * 0.05 * (0.7 + 0.3 * np.sin(tt * 2 * np.pi * 40)), 0, 0.5, 1.0)
tk = np.arange(int(0.035 * SR)) / SR
bh, ah = butter(2, 3000 / (SR / 2), 'high')
click = (np.sin(2 * np.pi * 2300 * tk) * 0.6 + lfilter(bh, ah, np.random.default_rng(4).normal(0, 1, len(tk))) * 0.5) * np.exp(-tk * 140)
for r in range(3):
    cells = np.floor(P[r] + 0.5)
    ch = np.nonzero(np.diff(cells) != 0)[0]
    for i in ch:
        v = V[r, i]
        if v < 9:
            au.add(click, fine[i], 0.25 + 0.25 * r, 0.25 + 0.25 * (1 - v / 9))
th = np.arange(int(0.25 * SR)) / SR
thunk = np.sin(2 * np.pi * np.cumsum(180 * np.exp(-th * 30) + 70) / SR) * np.exp(-th * 18)
for r in range(3):
    for tb in bounces[r]:
        big = tb >= T_J - 0.01
        au.add(thunk, tb, 0.25 + 0.25 * r, 1.4 if big else 0.8)
        au.add(click, tb, 0.25 + 0.25 * r, 0.6)
# reach stingers + riser
for tr, dlen in ((T_REACH2, T_MISS - T_REACH2), (T_REACH3, T_SHORT - T_REACH3)):
    for j, f0 in enumerate((659.25, 987.77)):
        au.add(au.pluck(f0, decay=5, dur=0.8, bright=0.7), tr + 0.12 * j, 0.5, 0.35)
    au.riser(tr + dlen, dlen, 0.35)
# miss: descending
for j, f0 in enumerate((392.0, 311.13, 261.63)):
    au.add(au.pluck(f0, decay=4, dur=0.9, bright=0.3), T_MISS + 0.15 + 0.16 * j, 0.5, 0.35)
# pause heartbeat
x = T_SHORT + 0.1
while x < T_NUDGE - 0.05:
    for dx, g in ((0, 1.0), (0.16, 0.7)):
        au.add(au.kick, x + dx, 0.5, 0.9 * g)
    x += 0.5
# beat
def beat_level(t):
    ph = phase(t)
    return {'normal': 0.35, 'miss': 0.15, 'reach': 0.85, 'pause': -1, 'nudge': -1, 'jack': 1.0}[ph]
step = 60 / 128 / 2
x, k = 0.0, 0
while x < DUR - 0.3:
    lv = beat_level(x)
    if lv >= 0:
        g = 0.12 + 0.35 * lv
        au.add(au.kick if k % 2 == 0 else au.hat, x, 0.5, g * (1.4 if k % 2 == 0 else 0.5))
        if lv > 0.6:
            au.add(au.hat, x + step / 2, 0.6, g * 0.3)
    x += step; k += 1
# jackpot fanfare (own arpeggio)
au.add(au.smash(0), T_J, 0.5, 0.75)
arp = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]
for j, f0 in enumerate(arp):
    au.add(au.pluck(f0, decay=3, dur=1.2, bright=0.6), T_J + 0.05 + 0.07 * j, 0.3 + 0.07 * j, 0.3)
for j, f0 in enumerate((523.25, 659.25, 783.99)):
    au.add(au.pluck(f0, decay=0.9, dur=3.5, bright=0.4), T_J + 0.6, 0.5, 0.18)
PENT = [0, 2, 4, 7, 9]
for j in range(26):
    tj = T_J + 0.9 + j * 0.13
    f0 = 1046.5 * 2 ** (PENT[rng.integers(5)] / 12)
    au.add(au.pluck(f0, decay=9, dur=0.4, bright=0.2), tj, rng.uniform(0.2, 0.8), 0.12)
# counter ticks
C_T0, C_T1, C_MAX = T_J + 0.7, T_J + 3.8, 77777
def counter(t):
    u = np.clip((t - C_T0) / (C_T1 - C_T0), 0, 1)
    return int(round(C_MAX * (1 - (1 - u) ** 2.2)))
x = C_T0
while x < C_T1:
    au.add(click, x, 0.5, 0.18)
    x += 0.05 + 0.08 * ((x - C_T0) / (C_T1 - C_T0)) ** 2
au.add(au.pluck(1567.98, decay=4, dur=0.8, bright=0.5), C_T1, 0.5, 0.25)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.4, fd)[:, None]
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

# ---------------------------------------------------------------- static scene
tint = [(60, 10, 40), (50, 20, 60), (70, 25, 20)][SEED % 3]
bg = make_bg(CY, tint)
MX0, MX1, MY0, MY1 = 60, 1020, 470, 1440


def rrect(img, x0, y0, x1, y1, rad, col):
    cv2.rectangle(img, (x0 + rad, y0), (x1 - rad, y1), col, -1)
    cv2.rectangle(img, (x0, y0 + rad), (x1, y1 - rad), col, -1)
    for cx, cy in ((x0 + rad, y0 + rad), (x1 - rad, y0 + rad), (x0 + rad, y1 - rad), (x1 - rad, y1 - rad)):
        cv2.circle(img, (cx, cy), rad, col, -1, cv2.LINE_AA)


machine = np.zeros((H, W, 3), np.uint8)
mmask = np.zeros((H, W), np.uint8)
rrect(machine, MX0, MY0, MX1, MY1, 60, (40, 150, 200))
rrect(machine, MX0 + 14, MY0 + 14, MX1 - 14, MY1 - 14, 48, (25, 90, 140))
rrect(machine, MX0 + 34, MY0 + 34, MX1 - 34, MY1 - 34, 36, (40, 18, 34))
rrect(mmask, MX0, MY0, MX1, MY1, 60, 255)
for cx in RX:
    cv2.rectangle(machine, (cx - RW // 2 - 8, WY0 - 8), (cx + RW // 2 + 8, WY0 + WH + 8), (60, 170, 220), -1)
    cv2.rectangle(machine, (cx - RW // 2 - 3, WY0 - 3), (cx + RW // 2 + 3, WY0 + WH + 3), (20, 20, 20), -1)
mm = mmask > 0

# border bulbs along the perimeter
perim = []
inset = 34
x0b, y0b, x1b, y1b = MX0 + inset - 10, MY0 + inset - 10, MX1 - inset + 10, MY1 - inset + 10
side = [((x0b, y0b), (x1b, y0b)), ((x1b, y0b), (x1b, y1b)), ((x1b, y1b), (x0b, y1b)), ((x0b, y1b), (x0b, y0b))]
for (a_, b_) in side:
    a_, b_ = np.array(a_, float), np.array(b_, float)
    nseg = int(np.linalg.norm(b_ - a_) / 52)
    for k in range(nseg):
        perim.append(a_ + (b_ - a_) * k / nseg)
perim = np.array(perim)
NB = len(perim)
# but bulbs at inset would overlap the reels? keep them on the gold frame instead
perim[:, 0] = np.clip(perim[:, 0], MX0 + 7, MX1 - 7)
for i in range(NB):
    x_, y_ = perim[i]
    # snap to frame ring (between MX0 and MX0+14 etc.)
    if abs(x_ - x0b) < 1: perim[i, 0] = MX0 + 7
    if abs(x_ - x1b) < 1: perim[i, 0] = MX1 - 7
    if abs(y_ - y0b) < 1: perim[i, 1] = MY0 + 7
    if abs(y_ - y1b) < 1: perim[i, 1] = MY1 - 7
for (x_, y_) in perim:
    cv2.circle(machine, (int(x_), int(y_)), 11, (30, 50, 70), -1, cv2.LINE_AA)
# lamp row on top panel and bottom panel
top_lamps = [(int(MX0 + 120 + i * (MX1 - MX0 - 240) / 8), (MY0 + WY0) // 2 - 4) for i in range(9)]
bot_lamps = [(int(MX0 + 120 + i * (MX1 - MX0 - 240) / 8), (WY0 + WH + MY1) // 2 + 4) for i in range(9)]
for q in top_lamps + bot_lamps:
    cv2.circle(machine, q, 16, (30, 40, 60), -1, cv2.LINE_AA)

# background light dots (outside machine)
dots = []
for j, y_ in enumerate(range(40, H, 80)):
    for x_ in range(40 + (40 if j % 2 else 0), W, 80):
        if not (MX0 - 30 < x_ < MX1 + 30 and MY0 - 30 < y_ < MY1 + 30) and not (60 < y_ < 360):
            dots.append((x_, y_))
dots = np.array(dots)
DD = np.hypot(dots[:, 0] - 540, dots[:, 1] - CY)
DANG = np.arctan2(dots[:, 1] - CY, dots[:, 0] - 540)
for (x_, y_) in dots:
    cv2.circle(bg, (int(x_), int(y_)), 6, (40, 30, 45), -1, cv2.LINE_AA)

sparks = []


def chase(j, t, speed, period=6, width=2):
    return ((j - speed * t) % period) < width


# ---------------------------------------------------------------- render
enc = Enc(OUT + '.v.mp4')
LOOP_XF = 24
LIMIT = int(os.environ.get('FRAMES', NF))
first = None
flash = 0.0
for f in range(min(NF, LIMIT)):
    t = f / FPS
    ph = phase(t)
    tj = t - T_J
    # ---- background lights
    blay = np.zeros((H, W, 3), np.uint8)
    if ph == 'jack':
        # rainbow ripples from the center (~2 Hz per dot)
        w_ = 0.5 + 0.5 * np.cos((DD - 650 * tj) / 330 * 2 * np.pi)
        w_ *= np.clip(650 * tj - DD + 200, 0, 200) / 200
        for i in np.nonzero(w_ > 0.15)[0]:
            c_ = hsv(DD[i] / 1400 - tj * 0.25, 0.85, w_[i])
            cv2.circle(blay, (int(dots[i, 0]), int(dots[i, 1])), 8, c_, -1, cv2.LINE_AA)
        # slow rotating rays
        for k in range(8):
            a_ = k * np.pi / 4 + tj * 0.9
            e = (int(540 + 2400 * np.cos(a_)), int(CY + 2400 * np.sin(a_)))
            cv2.line(blay, (540, CY), e, hsv(k / 8 + tj * 0.1, 0.6, 0.22), 60, cv2.LINE_AA)
    elif ph == 'reach':
        w_ = 0.5 + 0.5 * np.cos((dots[:, 1] + 500 * t) / 400 * 2 * np.pi)
        for i in np.nonzero(w_ > 0.5)[0]:
            cv2.circle(blay, (int(dots[i, 0]), int(dots[i, 1])), 7, (60, 40, int(255 * w_[i])), -1, cv2.LINE_AA)
    elif ph in ('pause', 'nudge'):
        pass
    else:
        w_ = 0.5 + 0.5 * np.cos((DANG * 3 - t * 2.0))
        for i in np.nonzero(w_ > 0.85)[0]:
            cv2.circle(blay, (int(dots[i, 0]), int(dots[i, 1])), 6, (110, 90, 70), -1, cv2.LINE_AA)
    blay[mm] = 0
    img = glow(bg, blay, 0.6, 4) if blay.any() else bg.copy()
    img[mm] = machine[mm]
    # ---- reels
    for r in range(3):
        p = pos_at(r, t)
        sp = abs(pos_at(r, t + 1 / FPS) - p) * FPS
        view = reel_view(r, p + wobble(r, t), sp)
        cx = RX[r]
        if ph == 'pause' and r == 2:
            view = view  # tension: tiny shake below
        x0 = cx - RW // 2
        img[WY0:WY0 + WH, x0:x0 + RW] = view
    if ph in ('pause',):
        q = t - T_SHORT
        jit = int(round(3 * np.sin(q * 60))) if q > 0.3 else 0
        if jit:
            x0 = RX[2] - RW // 2
            img[WY0:WY0 + WH, x0:x0 + RW] = np.roll(img[WY0:WY0 + WH, x0:x0 + RW], jit, axis=0)
    # payline
    col_pl = (60, 60, 230) if ph != 'jack' else (60, 220, 255)
    cv2.line(img, (RX[0] - RW // 2 - 30, CY), (RX[2] + RW // 2 + 30, CY), col_pl, 3, cv2.LINE_AA)
    for sx, xx_ in ((1, RX[0] - RW // 2 - 34), (-1, RX[2] + RW // 2 + 34)):
        cv2.fillPoly(img, [np.array([(xx_, CY - 18), (xx_, CY + 18), (xx_ + sx * 26, CY)], np.int32)], col_pl, cv2.LINE_AA)
    # ---- machine lights
    lay = np.zeros((H, W, 3), np.uint8)
    for j, (x_, y_) in enumerate(perim):
        if ph == 'jack':
            on, c_ = True, hsv(j / NB * 2 - tj * 0.5, 0.9, 1.0)
        elif ph == 'reach':
            on, c_ = chase(j, t, 12, 6, 3), (90, 70, 255)
        elif ph == 'pause' or ph == 'nudge':
            v_ = 0.35 + 0.35 * np.sin((t - T_SHORT) * 2 * np.pi * 1.0)
            on, c_ = True, (int(40 * v_), int(40 * v_), int(255 * v_))
        elif ph == 'miss':
            on, c_ = chase(j, t, 4, 6, 2), (160, 110, 60)
        else:
            on, c_ = chase(j, t, 8, 6, 2), (120, 220, 255)
        if on:
            cv2.circle(lay, (int(x_), int(y_)), 11, c_, -1, cv2.LINE_AA)
    # top / bottom lamps: one per stopped reel in the current round + all in jackpot
    stopped = sum(1 for r in range(3) if abs(pos_at(r, t + 0.02) - pos_at(r, t)) < 1e-6)
    for i, q in enumerate(top_lamps + bot_lamps):
        ii = i % 9
        if ph == 'jack':
            c_ = hsv(ii / 9 + tj * 0.4, 0.9, 0.8 + 0.2 * np.cos(tj * 2 * np.pi * 1.5 - ii * 0.7))
        elif ph == 'reach':
            c_ = (90, 70, 255) if ii % 2 == int(t * 4) % 2 else (30, 20, 90)
        elif ph in ('pause', 'nudge'):
            c_ = (30, 20, 120) if ii == 4 else None
        else:
            c_ = (120, 220, 255) if ii < stopped * 3 else None
        if c_ is not None:
            cv2.circle(lay, q, 16, c_, -1, cv2.LINE_AA)
    # payline highlight
    if ph == 'jack':
        pulse = 0.6 + 0.4 * np.cos(tj * 2 * np.pi * 1.2)
        for cx in RX:
            cv2.rectangle(lay, (cx - RW // 2 + 4, CY - CELL // 2 + 4), (cx + RW // 2 - 4, CY + CELL // 2 - 4),
                          tuple(int(v * pulse) for v in (60, 220, 255)), 8)
    if ph == 'pause':
        pulse = 0.5 + 0.5 * np.sin((t - T_SHORT) * 2 * np.pi * 1.0)
        cv2.rectangle(lay, (RX[2] - RW // 2 + 4, CY - 3 * CELL // 2 + 6), (RX[2] + RW // 2 - 4, CY - CELL // 2 - 4),
                      (int(60 * pulse), int(200 * pulse), int(255 * pulse)), 6)
    # sparks
    if ph == 'jack':
        nsp = int(14 * np.exp(-tj * 0.6)) if tj < 4.5 else 0
        for _ in range(nsp):
            r_ = rng.integers(3)
            a_ = rng.uniform(0, 2 * np.pi); s_ = rng.uniform(300, 1300)
            sparks.append([RX[r_] + rng.uniform(-80, 80), CY + rng.uniform(-60, 60), s_ * np.cos(a_), s_ * np.sin(a_) - 400, t,
                           rng.uniform(0.8, 1.8), hsv(rng.uniform(0, 1), 0.5, 1.0)])
    alive = []
    for s in sparks:
        age = t - s[4]
        if age > s[5]:
            continue
        alive.append(s)
        x_ = s[0] + s[2] * age; y_ = s[1] + s[3] * age + 500 * age ** 2
        fade = 1 - age / s[5]
        L_ = int(5 + 12 * fade)
        c_ = tuple(int(v * fade) for v in s[6])
        cv2.line(lay, (int(x_ - L_), int(y_)), (int(x_ + L_), int(y_)), c_, 3, cv2.LINE_AA)
        cv2.line(lay, (int(x_), int(y_ - L_)), (int(x_), int(y_ + L_)), c_, 3, cv2.LINE_AA)
    sparks = alive
    img = glow(img, lay, 0.9, 4)
    # ---- telops
    if ph != 'jack':
        put(img, '3つ揃う？', 540, 210, 120, (255, 226, 60), 1 + 0.03 * np.sin(t * 5))
    else:
        s_ = 1 + 0.9 * np.exp(-tj * 7)
        put(img, '大当たり！', 540, 210, 140, (255, 226, 60), s_ * (1 + 0.04 * np.sin(tj * 6)))
    if ph == 'reach':
        t0 = T_REACH2 if t < T_MISS else T_REACH3
        s_ = 1 + 0.8 * np.exp(-(t - t0) * 8)
        put(img, 'リーチ！', 540, 1600, 120, (255, 90, 110), s_ * (1 + 0.05 * np.sin(t * 8)))
    elif ph == 'miss':
        put(img, 'おしい…！', 540, 1600, 110, (150, 200, 255))
    elif ph in ('pause', 'nudge'):
        put(img, 'あと1コマ…', 540, 1600, 110, (255, 255, 255), 1 + 0.03 * np.sin((t - T_SHORT) * 6))
    elif ph == 'jack':
        cval = counter(t)
        if t >= C_T0:
            bump = 1 + 0.25 * np.exp(-(t - C_T1) * 8) if t >= C_T1 else 1.0
            put(img, f'ボーナス {cval:,}', 540, 1620, 100, (255, 255, 255), bump)
        put(img, '★ ★ ★', 540, 1770, 80, (255, 226, 60), 1 + 0.06 * np.sin(tj * 4))
    if 0 <= tj < 1 / FPS:
        flash = 0.32
    if flash > 0.02:
        img = cv2.addWeighted(img, 1.0, np.full_like(img, 255), flash, 0)
        flash *= 0.88
    if f == 0:
        first = img.copy()
    if f >= NF - LOOP_XF:
        k2 = (f - (NF - LOOP_XF)) / LOOP_XF
        img = cv2.addWeighted(img, 1 - k2, first, k2, 0)
    enc.write(img)
enc.close()
mux(OUT + '.v.mp4', OUT + '.wav', OUT); os.remove(OUT + '.v.mp4'); os.remove(OUT + '.wav')
print('T_REACH2', round(T_REACH2, 2), 'T_MISS', round(T_MISS, 2), 'T_SHORT', round(T_SHORT, 2), 'T_J', round(T_J, 2), 'strips', [list(strips[r][i] for i in range(L)) for r in range(3)])
