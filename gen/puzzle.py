"""隙間ゼロのパズル（非ボール型・CLAUDE.md の新6型の4番目）。
9×14マスの箱に、形のちがうピースが上から1個ずつ落ちてきて、すき間なく積み上がっていく。
最後に1個分の穴だけが残り、最後のピースがくるっと回って向きを合わせ、ストンと落ちてぴったり埋まる。
オチは「途中で穴の形が見えて予想できて、最後に答え合わせ」。
0秒でもう数個が積まれていて、1個が落ちている途中から始まる。
使い方: python gen/puzzle.py SEED 出力.mp4 [--dur 26] [--cols 9 --rows 14]
  SEED でピースの分け方・色・落ちる順番が変わる。
テスト: FRAMES=120 python gen/puzzle.py 1 /tmp/x.mp4 （先頭120フレームだけ描く）
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
ARGS = sys.argv[1:]
DUR_ = 26.0
GC, GR = 9, 14
for key in ('--dur', '--cols', '--rows'):
    if key in ARGS:
        _i = ARGS.index(key); v = ARGS[_i + 1]; del ARGS[_i:_i + 2]
        if key == '--dur': DUR_ = float(v)
        elif key == '--cols': GC = int(v)
        else: GR = int(v)
import lib
lib.DUR = DUR_; lib.NF = int(DUR_ * 60)
from lib import *
DUR = lib.DUR; NF = lib.NF

SEED = int(ARGS[0]) if len(ARGS) > 0 else 1
OUT = ARGS[1] if len(ARGS) > 1 else 'puzzle.mp4'
rng = np.random.default_rng(SEED)


# ---------------- tiling + drop order (rows: 0 = bottom)
def make_tiling(rng):
    lab = -np.ones((GR, GC), int)
    pieces = []
    cells = [(r, c) for r in range(GR) for c in range(GC)]
    rng.shuffle(cells)
    for (r, c) in cells:
        if lab[r, c] >= 0:
            continue
        target = rng.choice([3, 4, 4, 4, 5, 5])
        pc = [(r, c)]; lab[r, c] = len(pieces)
        while len(pc) < target:
            fr = [(rr + dr, cc + dc) for rr, cc in pc for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1))
                  if 0 <= rr + dr < GR and 0 <= cc + dc < GC and lab[rr + dr, cc + dc] < 0]
            if not fr:
                break
            nr, nc = fr[rng.integers(len(fr))]
            lab[nr, nc] = len(pieces); pc.append((nr, nc))
        pieces.append(pc)
    # merge tiny pieces (1-2 cells) into a neighbour
    changed = True
    while changed:
        changed = False
        for k, pc in enumerate(pieces):
            if 0 < len(pc) <= 2:
                nb = set()
                for rr, cc in pc:
                    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        if 0 <= rr + dr < GR and 0 <= cc + dc < GC and lab[rr + dr, cc + dc] != k:
                            nb.add(lab[rr + dr, cc + dc])
                nb = sorted(nb, key=lambda j: len(pieces[j]))
                if nb and len(pieces[nb[0]]) + len(pc) <= 6:
                    j = nb[0]
                    for rr, cc in pc:
                        lab[rr, cc] = j
                    pieces[j] += pc; pieces[k] = []; changed = True
    pieces = [p for p in pieces if p]
    lab = -np.ones((GR, GC), int)
    for k, p in enumerate(pieces):
        for rr, cc in p:
            lab[rr, cc] = k
    return lab, pieces


def col_convex(p):
    cols = {}
    for r, c in p:
        cols.setdefault(c, []).append(r)
    return all(max(v) - min(v) + 1 == len(v) for v in cols.values())


def drop_order(lab, pieces, rng):
    filled = np.zeros((GR, GC), bool)
    left = set(range(len(pieces))); order = []
    while left:
        cand = []
        for k in left:
            ok = True
            for r, c in pieces[k]:
                if r > 0 and not filled[r - 1, c] and lab[r - 1, c] != k:
                    ok = False; break
            if ok:
                cand.append(k)
        if not cand:
            return None
        # prefer low pieces, a little random
        cand.sort(key=lambda k: min(r for r, c in pieces[k]) + rng.uniform(0, 1.6))
        k = cand[0]
        order.append(k); left.discard(k)
        for r, c in pieces[k]:
            filled[r, c] = True
    return order


for attempt in range(5000):
    lab, pieces = make_tiling(rng)
    if not all(col_convex(p) for p in pieces) or not all(3 <= len(p) <= 6 for p in pieces):
        continue
    order = drop_order(lab, pieces, rng)
    if order is None:
        continue
    last = pieces[order[-1]]
    # the last hole should be a clear, non-straight shape of 4-5 cells touching the top row
    rs = [r for r, c in last]; cs = [c for r, c in last]
    if len(last) in (4, 5) and max(rs) == GR - 1 and len(set(rs)) > 1 and len(set(cs)) > 1 \
            and len(last) < (max(rs) - min(rs) + 1) * (max(cs) - min(cs) + 1):
        break
NP = len(pieces)

# ---------------- geometry
C = min(96, 960 // GC, 1340 // GR)
BW, BH_ = GC * C, GR * C
BX = (W - BW) // 2
BY = 360
FLOOR = BY + BH_


def cell_xy(r, c):  # top-left pixel of cell
    return BX + c * C, BY + (GR - 1 - r) * C


# piece colours (BGR)
hue0 = rng.uniform(0, 1)
cols = [hsv(hue0 + 0.618 * k, 0.62, 0.95) for k in range(NP)]
rng.shuffle(cols)


def sprite(k):
    p = pieces[k]
    r0, r1 = min(r for r, c in p), max(r for r, c in p)
    c0, c1 = min(c for r, c in p), max(c for r, c in p)
    h, w = (r1 - r0 + 1) * C, (c1 - c0 + 1) * C
    m = np.zeros((h, w), np.uint8)
    for r, c in p:
        x, y = (c - c0) * C, (r1 - r) * C
        m[y:y + C, x:x + C] = 255
    m = cv2.erode(m, np.ones((5, 5), np.uint8))           # thin gap between pieces
    inner = cv2.erode(m, np.ones((15, 15), np.uint8))
    col = np.array(cols[k], np.float32)
    img = np.zeros((h, w, 3), np.float32)
    img[m > 0] = col * 0.62
    img[inner > 0] = col
    # top-left highlight
    hl = cv2.erode(m, np.ones((5, 5), np.uint8)) & ~inner
    sh = np.roll(np.roll(inner, -4, 0), -4, 1)
    edge_tl = (hl > 0) & (sh == 0)
    img[edge_tl] = np.minimum(255, col * 0.9 + 70)
    # cell seams inside a piece (subtle)
    for r, c in p:
        x, y = (c - c0) * C, (r1 - r) * C
        if (r, c + 1) in p:
            img[y + 10:y + C - 10, x + C - 1:x + C + 1] *= 0.86
        if (r - 1, c) in p:
            img[y + C - 1:y + C + 1, x + 10:x + C - 10] *= 0.86
    return img.astype(np.uint8), (m > 0), (c0, r1), (w, h)


SPR = [sprite(k) for k in range(NP)]

# ---------------- timeline
LOOP_XF = 24
T_LAST = DUR - 4.0           # last piece lands
G = 9000.0                   # px/s^2
SPAWN_Y = BY - 2 * C         # sprites appear (fade in) above the board
PRE = 4                      # pieces already in place at t=0
nreg = NP - 1
# landing times of pieces 0..NP-2: PRE before 0, then accelerating to ~T_LAST-4.6
w_ = np.array([0.955 ** j for j in range(nreg - PRE)])
tl = np.cumsum(w_); tl = 0.35 + (tl - tl[0]) / (tl[-1] - tl[0]) * (T_LAST - 4.6 - 0.35)
land = list(np.linspace(-2.0, -0.6, PRE)) + list(tl)
starts = []
for j in range(nreg):
    k = order[j]
    x0, ytop = cell_xy(SPR[k][2][1], SPR[k][2][0])
    d = ytop - SPAWN_Y
    ts = land[j] - np.sqrt(2 * d / G)
    # never start before an earlier overlapping piece (keeps falling pieces from passing through each other)
    if starts:
        ts = max(ts, max(starts[i] for i in range(j)) + 0.02)
        land[j] = ts + np.sqrt(2 * d / G)
    starts.append(ts)
# last piece: appears, rotates twice, then drops
kL = order[-1]
T_APPEAR = T_LAST - 3.8
T_ROT = [T_LAST - 2.9, T_LAST - 2.0]
xL, ytopL = cell_xy(SPR[kL][2][1], SPR[kL][2][0])
HOVER_Y = BY - SPR[kL][3][1] - 30
dL = ytopL - HOVER_Y
T_DROP = T_LAST - np.sqrt(2 * dL / G) - 0.0
land.append(T_LAST); starts.append(T_DROP)


def piece_y(j, t):
    k = order[j]
    x0, ytop = cell_xy(SPR[k][2][1], SPR[k][2][0])
    if j == NP - 1:
        if t < T_DROP:
            return HOVER_Y
        return min(ytop, HOVER_Y + 0.5 * G * (t - T_DROP) ** 2)
    if t < starts[j]:
        return None
    return min(ytop, SPAWN_Y + 0.5 * G * (t - starts[j]) ** 2)


def last_angle(t):
    a = 180.0
    for tr in T_ROT:
        u = np.clip((t - tr) / 0.28, 0, 1)
        u = 1 - (1 - u) ** 3
        a -= 90 * u
    return a


# ---------------- audio
au = Audio(SEED)
PENT = [0, 2, 4, 7, 9]
tok_b, tok_a = butter(2, [1500 / (SR / 2), 6000 / (SR / 2)], 'band')


def tok(freq, vol=1.0):
    t = np.arange(int(0.35 * SR)) / SR
    body = np.sin(2 * np.pi * freq * t) * np.exp(-t * 26) + 0.4 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * 40)
    click = lfilter(tok_b, tok_a, au.rng.normal(0, 1, len(t))) * np.exp(-t * 160) * 0.6
    thump = np.sin(2 * np.pi * np.cumsum(140 * np.exp(-t * 30) + 55) / SR) * np.exp(-t * 18) * 0.7
    return (body * 0.5 + click + thump) * vol


cnt_cells = np.cumsum([len(pieces[k]) for k in order])
for j in range(NP - 1):
    if land[j] < 0:
        continue
    k = order[j]
    q = cnt_cells[j] / (GR * GC)
    step = int(q * 14)
    note = 220 * 2 ** ((PENT[step % 5] + 12 * (step // 5)) / 12)
    cx = np.mean([c for r, c in pieces[k]]) / (GC - 1)
    au.add(tok(note, 0.55), land[j], 0.25 + 0.5 * cx)
au.beat(118, lambda t: min(1.0, t / (T_LAST - 4.6)) if t < T_LAST - 4.4 else 0.0, 0.0, T_LAST - 4.4)
for tr in T_ROT:
    au.add(au.pluck(880, decay=30, dur=0.2, bright=0.8), tr, 0.5, 0.25)
    au.add(au.pluck(1320, decay=40, dur=0.15, bright=0.5), tr + 0.12, 0.5, 0.18)
au.riser(T_LAST, 3.0, 0.5)
au.add(tok(330, 1.0), T_LAST, 0.5)
au.add(au.smash(5), T_LAST, 0.5, 0.75)
for j, m in enumerate((1, 1.25, 1.5, 2, 2.5)):
    au.add(au.pluck(523.25 * m, decay=1.3, dur=3), T_LAST + 0.08 + 0.07 * j, 0.3 + 0.1 * j, 0.22)
n = int(DUR * SR)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
from scipy.io import wavfile
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

# ---------------- video
tint = [(46, 14, 30), (40, 18, 46), (50, 26, 18)][SEED % 3]
bg = make_bg(1000, tint)
# board well
cv2.rectangle(bg, (BX - 14, BY - 6), (BX + BW + 14, FLOOR + 14), (60, 50, 66), -1)
cv2.rectangle(bg, (BX, BY - 6), (BX + BW, FLOOR), (22, 16, 24), -1)
for c in range(GC + 1):
    cv2.line(bg, (BX + c * C, BY), (BX + c * C, FLOOR), (40, 32, 44), 1)
for r in range(GR + 1):
    cv2.line(bg, (BX, BY + r * C), (BX + BW, BY + r * C), (40, 32, 44), 1)

# hole mask of the last piece (for the pulsing outline)
hole = np.zeros((H, W), np.uint8)
for r, c in pieces[kL]:
    x, y = cell_xy(r, c)
    hole[y:y + C, x:x + C] = 255
hole_cnts, _ = cv2.findContours(hole, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)


def paste(img, k, x0, y0, alpha=1.0, gain=1.0):
    spr, m, _, (w, h) = SPR[k]
    xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
    if xa >= xb or ya >= yb:
        return
    sub = img[ya:yb, xa:xb]
    sm = m[ya - y0:yb - y0, xa - x0:xb - x0]
    ss = spr[ya - y0:yb - y0, xa - x0:xb - x0].astype(np.float32) * gain
    sub[sm] = (sub[sm] * (1 - alpha) + np.minimum(255, ss[sm]) * alpha).astype(np.uint8)


def paste_rot(img, k, cx, cy, ang):
    spr, m, _, (w, h) = SPR[k]
    S = int(np.hypot(w, h)) + 4
    big = np.zeros((S, S, 3), np.uint8); bm = np.zeros((S, S), np.uint8)
    ox, oy = (S - w) // 2, (S - h) // 2
    big[oy:oy + h, ox:ox + w] = spr; bm[oy:oy + h, ox:ox + w] = m * 255
    M = cv2.getRotationMatrix2D((S / 2, S / 2), ang, 1.0)
    big = cv2.warpAffine(big, M, (S, S)); bm = cv2.warpAffine(bm, M, (S, S))
    x0, y0 = int(cx - S / 2), int(cy - S / 2)
    xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + S), min(H, y0 + S)
    a = bm[ya - y0:yb - y0, xa - x0:xb - x0, None].astype(np.float32) / 255
    sub = img[ya:yb, xa:xb]
    img[ya:yb, xa:xb] = (sub * (1 - a) + big[ya - y0:yb - y0, xa - x0:xb - x0] * a).astype(np.uint8)


enc = Enc(OUT + '.v.mp4')
first = None
LIMIT = int(os.environ.get('FRAMES', NF))
TOTAL = GR * GC
sparks = []
flash = 0.0
for f in range(min(NF, LIMIT)):
    t = f / FPS
    img = bg.copy()
    placed = 0
    # finale wave: brightness ripple from the last piece outward
    lcx = BX + (np.mean([c for r, c in pieces[kL]]) + 0.5) * C
    lcy = BY + (GR - 0.5 - np.mean([r for r, c in pieces[kL]])) * C
    for j in range(NP):
        k = order[j]
        x0, ytop = cell_xy(SPR[k][2][1], SPR[k][2][0])
        if j == NP - 1:
            continue
        y = piece_y(j, t)
        if y is None:
            continue
        done = t >= land[j]
        if done:
            placed += len(pieces[k])
        gain = 1.0
        age = t - land[j]
        if 0 <= age < 0.25:
            gain = 1 + 0.5 * (1 - age / 0.25)
        if t >= T_LAST:
            pcx = x0 + SPR[k][3][0] / 2; pcy = ytop + SPR[k][3][1] / 2
            dd = np.hypot(pcx - lcx, pcy - lcy)
            wt = (t - T_LAST) * 1500 - dd
            if 0 < wt < 260:
                gain = max(gain, 1 + 0.55 * np.sin(np.pi * wt / 260))
        alpha = min(1.0, (t - starts[j]) / 0.12) if not done else 1.0
        # squash on landing
        if 0 <= age < 0.12:
            y = ytop + int(4 * np.sin(np.pi * age / 0.12))
        paste(img, k, x0, int(y), alpha, gain)
    # last piece
    remaining = TOTAL - placed
    if t >= T_APPEAR:
        if t < T_LAST:
            # pulsing outline of the hole
            pul = 0.5 + 0.5 * np.sin((t - T_APPEAR) * 7)
            col = tuple(int(v * (0.4 + 0.6 * pul)) for v in (120, 230, 255))
            hm = hole > 0
            img[hm] = (img[hm] * 0.5 + np.array(col) * 0.22 * pul).astype(np.uint8)
            cv2.drawContours(img, hole_cnts, -1, col, 6)
        y = piece_y(NP - 1, t)
        w, h = SPR[kL][3]
        ang = last_angle(t)
        a_in = min(1.0, (t - T_APPEAR) / 0.3)
        if t < T_DROP or abs(ang) > 0.5:
            paste_rot(img, kL, xL + w / 2, y + h / 2 - 20 * (1 - a_in), ang)
        else:
            gain = 1.0
            if t >= T_LAST:
                gain = 1 + 0.6 * np.exp(-(t - T_LAST) * 3)
            paste(img, kL, xL, int(y), 1.0, gain)
        if t >= T_LAST:
            placed += len(pieces[kL])
    # finale sparkles + flash
    if t >= T_LAST and t - 1 / FPS < T_LAST:
        flash = 0.45
        for _ in range(90):
            sparks.append([rng.uniform(BX, BX + BW), rng.uniform(BY, FLOOR), rng.uniform(0.4, 1.4), rng.uniform(0, 6)])
    for sp in sparks:
        x_, y_, life, ph = sp
        a_ = max(0.0, 1 - (t - T_LAST) / (life + 1.6))
        tw = (0.5 + 0.5 * np.sin(t * 12 + ph)) * a_
        if tw > 0.05:
            L_ = int(6 + 12 * tw)
            c_ = tuple(int(v * tw) for v in (255, 255, 255))
            cv2.line(img, (int(x_ - L_), int(y_)), (int(x_ + L_), int(y_)), c_, 2)
            cv2.line(img, (int(x_), int(y_ - L_)), (int(x_), int(y_ + L_)), c_, 2)
    if flash > 0.02:
        img = cv2.addWeighted(img, 1.0, np.full_like(img, 255), flash, 0)
    flash *= 0.9
    # texts
    if t < T_LAST:
        if t < T_APPEAR:
            put(img, '最後の1個、', 540, 120, 76)
            put(img, 'ぴったりハマる？', 540, 225, 86, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
        else:
            put(img, '最後の1個…この穴に入る？', 540, 1865, 62, (255, 226, 60), 1 + 0.05 * np.sin(t * 8))
        bump = 1.0
        for v in land[:-1]:
            if 0 <= t - v < 0.3:
                bump = 1 + 0.25 * np.exp(-(t - v) * 10)
        if t < T_APPEAR:
            put(img, f'{placed} / {TOTAL} マス', 540, 1765, 80, (255, 255, 255), bump)
        else:
            put(img, f'あと{remaining}マス', 540, 1765, 80, (255, 160, 120), 1 + 0.06 * np.sin(t * 9))

    else:
        s_ = 1 + 1.2 * np.exp(-(t - T_LAST) * 7)
        put(img, 'ぴったり！', 540, 120, 90, (255, 226, 60), s_)
        put(img, 'すき間ゼロ！', 540, 230, 80, (255, 255, 255), s_)
        put(img, f'{TOTAL} / {TOTAL} マス', 540, 1765, 84, (255, 255, 255), s_)
    if f == 0:
        first = img.copy()
    if f >= NF - LOOP_XF:
        k2 = (f - (NF - LOOP_XF)) / LOOP_XF
        img = cv2.addWeighted(img, 1 - k2, first, k2, 0)
    enc.write(img)
enc.close()
mux(OUT + '.v.mp4', OUT + '.wav', OUT); os.remove(OUT + '.v.mp4'); os.remove(OUT + '.wav')
print('pieces', NP, 'last piece cells', len(pieces[kL]), 'attempts', attempt, 'T_LAST', T_LAST)
