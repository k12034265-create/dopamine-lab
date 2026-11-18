import sys
sys.path.insert(0, '/home/claude')
from lib import *

SEED = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1] != 'tune' else 3
NAMES = ['赤', '青', '緑', '黄', '紫', '白']
BGR = [(70, 70, 255), (255, 150, 60), (90, 220, 80), (50, 215, 255), (230, 90, 200), (235, 235, 235)]
BR = 16.0
XL, XR = 70.0, 1010.0
G_ = 1100.0
SUB = 6


def build_course(h_sections, seed):
    rng = np.random.default_rng(seed)
    pegs, segs, spins = [], [], []
    y = 500.0
    kinds = ['peg', 'zig', 'spin', 'peg', 'zig', 'funnel']
    for i in range(h_sections):
        k = kinds[i % len(kinds)] if i else 'peg'
        if k == 'peg':
            for row in range(7):
                off = 0 if row % 2 == 0 else 55
                for x in np.arange(XL + 40 + off, XR - 30, 110):
                    pegs.append((x + rng.normal(0, 6), y + row * 95, 11.0))
            y += 7 * 95 + 80
        elif k == 'zig':
            for j in range(3):
                if j % 2 == 0:
                    segs.append((XL, y, XR - 120, y + 220))
                else:
                    segs.append((XR, y, XL + 120, y + 220))
                y += 260
            y += 40
        elif k == 'spin':
            for j, x in enumerate(np.linspace(XL + 160, XR - 160, 3)):
                spins.append((x, y + 120, 130.0, (1.6 + rng.random()) * (1 if j % 2 else -1), rng.random() * 6))
            y += 300
            for j, x in enumerate(np.linspace(XL + 260, XR - 260, 2)):
                spins.append((x, y + 120, 140.0, (1.4 + rng.random()) * (-1 if j % 2 else 1), rng.random() * 6))
            y += 330
        elif k == 'funnel':
            segs.append((XL, y, 480, y + 260)); segs.append((XR, y, 600, y + 260))
            y += 380
    return pegs, segs, spins, y + 150


def seg_hit(p, v, a, b, wv=None):
    ab = b - a
    t = np.clip(((p - a) @ ab) / (ab @ ab), 0, 1)
    c = a + ab * t
    d = p - c
    dist = np.hypot(*d)
    if dist < BR and dist > 1e-6:
        n = d / dist
        rel = v - (wv(c) if wv else 0)
        vn = rel @ n
        p = c + n * BR
        if vn < 0:
            vt = rel - vn * n
            rel = vt * 0.9993 - 0.45 * vn * n
            v = rel + (wv(c) if wv else 0)
        return p, v, True
    return p, v, False


def simulate(sections, seed, record=False):
    pegs, segs, spins, FIN = build_course(sections, seed)
    pg = np.array(pegs)
    rng = np.random.default_rng(seed + 100)
    n = len(NAMES)
    P = np.stack([np.linspace(XL + 180, XR - 180, n) + rng.normal(0, 10, n), np.full(n, 300.0)], 1)
    V = np.stack([rng.normal(0, 60, n), np.zeros(n)], 1)
    finish = [None] * n
    order = []
    dt = 1 / FPS / SUB
    frames = []; ev = []
    for f in range(NF):
        tt = f / FPS
        hits = []
        for s in range(SUB):
            ts = tt + s * dt
            for i in range(n):
                if finish[i] is not None:
                    continue
                p, v = P[i], V[i]
                v[1] += G_ * dt
                p += v * dt
                # walls
                if p[0] < XL + BR: p[0] = XL + BR; v[0] = abs(v[0]) * 0.5
                if p[0] > XR - BR: p[0] = XR - BR; v[0] = -abs(v[0]) * 0.5
                # pegs
                near = np.where(np.abs(pg[:, 1] - p[1]) < 40)[0]
                for j in near:
                    d = p - pg[j, :2]; dist = np.hypot(*d)
                    if dist < BR + pg[j, 2]:
                        nn = d / dist; p[:] = pg[j, :2] + nn * (BR + pg[j, 2])
                        vn = v @ nn
                        if vn < 0:
                            v -= 1.5 * vn * nn; v[0] += rng.normal(0, 25)
                            if vn < -150: hits.append(('p', i, p[0]))
                for (x1, y1, x2, y2) in segs:
                    if min(y1, y2) - 30 < p[1] < max(y1, y2) + 30:
                        p2, v2, h = seg_hit(p, v, np.array([x1, y1]), np.array([x2, y2]))
                        P[i], V[i] = p2, v2; p, v = P[i], V[i]
                for (cx, cy, L, w, ph) in spins:
                    if abs(p[1] - cy) < L + 30 and abs(p[0] - cx) < L + 30:
                        ang = ph + w * ts
                        e = np.array([np.cos(ang), np.sin(ang)]) * L
                        wv = lambda c, cx=cx, cy=cy, w=w: np.array([-(c[1] - cy), c[0] - cx]) * w
                        p2, v2, h = seg_hit(p, v, np.array([cx, cy]) - e, np.array([cx, cy]) + e, wv)
                        if h and np.hypot(*(v2 - v)) > 200: hits.append(('s', i, p[0]))
                        P[i], V[i] = p2, v2; p, v = P[i], V[i]
                sp = np.hypot(*v)
                if sp > 900: V[i] *= 900 / sp
                if p[1] > FIN:
                    finish[i] = ts; order.append(i); hits.append(('f', i, p[0]))
            # ball-ball
            for i in range(n):
                for j in range(i + 1, n):
                    if finish[i] is not None or finish[j] is not None: continue
                    d = P[i] - P[j]; dist = np.hypot(*d)
                    if 0 < dist < 2 * BR:
                        nn = d / dist; ov = 2 * BR - dist
                        P[i] += nn * ov / 2; P[j] -= nn * ov / 2
                        rv = (V[i] - V[j]) @ nn
                        if rv < 0:
                            V[i] -= rv * nn * 0.9; V[j] += rv * nn * 0.9
        if record:
            frames.append((P.copy(), list(order), hits))
        ev += [(tt,) + h for h in hits]
        if len(order) == n and not record:
            break
    return dict(frames=frames, finish=finish, order=order, FIN=FIN, pegs=pegs, segs=segs, spins=spins, ev=ev)


if sys.argv[1:2] == ['tune']:
    for sec in (10, 14, 18):
        for sd in range(2):
            r = simulate(sec, sd)
            fs = [x for x in r['finish'] if x]
            print(sec, sd, 'first', fs and round(min(fs), 1), 'last', fs and round(max(fs), 1), 'n', len(fs), flush=True)
    sys.exit()

SECT = int(sys.argv[2]) if len(sys.argv) > 2 else 10
r = simulate(SECT, SEED, record=True)
frames, order, FIN = r['frames'], r['order'], r['FIN']
win = order[0]
TW = r['finish'][win]
print('winner', NAMES[win], TW, [NAMES[i] for i in order], [x and round(x, 1) for x in r['finish']])

au = Audio(9)
PENT = [0, 2, 4, 7, 9]
cnt = 0
for (t, k, i, x) in r['ev']:
    if t > DUR - 0.5: continue
    if k == 'p':
        cnt += 1
        if cnt % 2: au.add(au.pluck(523 * 2 ** (PENT[cnt % 5] / 12) * (1 + (i % 3) * 0.5), decay=30, dur=0.15), t, float(np.clip(x / W, .15, .85)), 0.09)
    elif k == 's':
        au.add(au.pluck(196 * (1 + i * 0.12), decay=14, dur=0.3), t, 0.5, 0.18)
    elif k == 'f':
        rank = order.index(i)
        if rank == 0:
            au.add(au.smash(0), t, 0.5, 1.0)
        else:
            au.add(au.pluck(392 * 2 ** (-rank / 12), decay=6, dur=0.6), t, 0.5, 0.3)
au.beat(140, lambda t: min(1, t / TW) * 0.9 + 0.1, 0, min(TW, DUR - 0.3))
au.riser(TW, 4.0, 0.7)
au.save('race.wav')

bg = make_bg(960, (30, 20, 30))
enc = Enc('race_v.mp4')
rng = np.random.default_rng(0)
cam = 0.0
flash = 0.0; shake = 0.0
pegs, segs, spins = r['pegs'], r['segs'], r['spins']
trail = np.zeros((H, W, 3), np.uint8)
for f in range(NF):
    t = f / FPS
    P, od, hits = frames[f]
    alive = [i for i in range(6) if i not in od]
    if alive:
        lead_y = max(P[i, 1] for i in alive) if not od else max(P[i, 1] for i in alive)
        target = min(lead_y - 820, FIN - 1100)
    else:
        target = FIN - 1100
    cam += (target - cam) * 0.12
    if any(h[0] == 'f' and od and h[1] == od[0] for h in hits) and len(od) == 1:
        flash = 0.7; shake = 26
    flash *= 0.86; shake *= 0.86
    oy = -cam + 0
    trail = cv2.convertScaleAbs(trail, alpha=0.7)
    lay = np.zeros((H, W, 3), np.uint8)
    for (x, y, rr) in pegs:
        yy = y + oy
        if -20 < yy < H + 20:
            cv2.circle(lay, (int(x * 16), int(yy * 16)), int(rr * 16), (150, 140, 130), -1, cv2.LINE_AA, 4)
    for (x1, y1, x2, y2) in segs:
        cv2.line(lay, (int(x1), int(y1 + oy)), (int(x2), int(y2 + oy)), (200, 170, 120), 10, cv2.LINE_AA)
    for (cx, cy, L, w, ph) in spins:
        yy = cy + oy
        if -200 < yy < H + 200:
            ang = ph + w * t
            e = np.array([np.cos(ang), np.sin(ang)]) * L
            cv2.line(lay, (int(cx - e[0]), int(yy - e[1])), (int(cx + e[0]), int(yy + e[1])), hsv(0.5, 0.7), 12, cv2.LINE_AA)
            cv2.circle(lay, (int(cx), int(yy)), 10, (255, 255, 255), -1, cv2.LINE_AA)
    cv2.line(lay, (int(XL), 0), (int(XL), H), (120, 110, 100), 6)
    cv2.line(lay, (int(XR), 0), (int(XR), H), (120, 110, 100), 6)
    fy = FIN + oy
    if -20 < fy < H:
        for k in range(0, int(XR - XL), 40):
            c = (255, 255, 255) if (k // 40) % 2 == 0 else (30, 30, 30)
            cv2.rectangle(lay, (int(XL + k), int(fy)), (int(XL + k + 40), int(fy + 20)), c, -1)
    for i in range(6):
        if i in od: continue
        x, y = P[i, 0], P[i, 1] + oy
        cv2.circle(trail, (int(x * 16), int(y * 16)), int(BR * 0.8 * 16), BGR[i], -1, cv2.LINE_AA, 4)
        cv2.circle(lay, (int(x * 16), int(y * 16)), int((BR + 9) * 16), (0, 0, 0), -1, cv2.LINE_AA, 4)
        cv2.circle(lay, (int(x * 16), int(y * 16)), int((BR + 6) * 16), BGR[i], -1, cv2.LINE_AA, 4)
    img = glow(bg, cv2.add(trail, lay), 0.7)
    for i in range(6):
        if i in od: continue
        x, y = P[i, 0], P[i, 1] + oy
        if 0 < y < H: put(img, NAMES[i], x, y - 50, 40, tuple(BGR[i][::-1]))
    # ranking panel
    rank = list(od) + sorted(alive, key=lambda i: -P[i, 1])
    cv2.rectangle(img, (0, 0), (W, 175), (12, 10, 14), -1)
    for k, i in enumerate(rank):
        x = 95 + k * 178
        cv2.circle(img, (x, 120), 30, BGR[i], -1, cv2.LINE_AA)
        put(img, NAMES[i], x, 120, 34, (0, 0, 0) if i in (3, 5) else (255, 255, 255))
        put(img, f'{k + 1}位', x, 58, 30, (255, 226, 60) if k == 0 else (200, 200, 210))
    if not od:
        put(img, '1位はどの色？コメントで予想！', 540, 1790, 56, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
    else:
        s = 1 + 1.4 * np.exp(-(t - TW) * 7)
        put(img, f'{NAMES[od[0]]}の優勝！', 540, 330, 120, tuple(BGR[od[0]][::-1]), s)
        put(img, '予想当たった？', 540, 1790, 56)
    img = post(img, f, flash, shake, rng)
    enc.write(img)
enc.close()
mux('race_v.mp4', 'race.wav', 'race_short.mp4')
