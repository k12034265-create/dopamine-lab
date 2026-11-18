import sys
sys.path.insert(0, '/home/claude')
import numpy as np
import lib
lib.DUR = 34.0; lib.NF = int(34.0 * 60)
from lib import *

DUR = lib.DUR; NF = lib.NF
CX, CY = 540.0, 960.0
RH = 430.0           # hexagon circumradius
N = 30
BR = 25.0
G_ = 900.0
SUB = 6
GAPF = float(sys.argv[2]) if len(sys.argv) > 2 else 0.42   # fraction of one side open
WROT = float(sys.argv[3]) if len(sys.argv) > 3 else 0.9    # rad/s
SEED = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1] != 'tune' else 1


def walls(ang):
    """list of (a,b) segments of hexagon at rotation ang; side 0 has a gap in the middle"""
    vs = [np.array([CX + RH * np.cos(ang + k * np.pi / 3), CY + RH * np.sin(ang + k * np.pi / 3)]) for k in range(7)]
    segs = []
    for k in range(6):
        a, b = vs[k], vs[k + 1]
        if k == 0:
            g = (1 - GAPF) / 2
            segs.append((a, a + (b - a) * g)); segs.append((b + (a - b) * g, b))
        else:
            segs.append((a, b))
    return segs


def sim(seed, record=False):
    rng = np.random.default_rng(seed)
    a = rng.uniform(0, 2 * np.pi, N); r = np.sqrt(rng.uniform(0, 1, N)) * 300
    P = np.stack([CX + r * np.cos(a), CY + r * np.sin(a)], 1)
    V = rng.normal(0, 380, (N, 2))
    alive = np.ones(N, bool); out_t = np.full(N, np.nan)
    dt = 1 / FPS / SUB
    frames, ev = [], []
    for f in range(NF):
        hits = []
        for s in range(SUB):
            t = f / FPS + s * dt
            ang = WROT * t
            V[:, 1] += G_ * dt
            P += V * dt
            for (A, B) in walls(ang):
                ab = B - A; L2 = ab @ ab
                u = np.clip(((P - A) @ ab) / L2, 0, 1)
                C = A + u[:, None] * ab
                D = P - C; dist = np.hypot(D[:, 0], D[:, 1])
                m = alive & (dist < BR) & (dist > 1e-6)
                if m.any():
                    n = D[m] / dist[m, None]
                    wv = np.stack([-(C[m, 1] - CY), C[m, 0] - CX], 1) * WROT
                    rel = V[m] - wv
                    vn = (rel * n).sum(1)
                    imp = vn < 0
                    rel[imp] -= 1.9 * vn[imp, None] * n[imp]
                    V[m] = rel + wv
                    P[m] = C[m] + n * BR
                    for i in np.where(m)[0][imp][:3]:
                        if -vn[np.where(np.where(m)[0] == i)[0][0]] > 120:
                            hits.append(('w', i, P[i, 0]))
            # ball-ball
            idx = np.where(alive)[0]
            if len(idx) > 1:
                d = P[idx][:, None, :] - P[idx][None, :, :]
                dd = np.hypot(d[..., 0], d[..., 1]) + np.eye(len(idx)) * 1e9
                ii, jj = np.where(np.triu(dd < 2 * BR))
                for a_, b_ in zip(ii, jj):
                    i, j = idx[a_], idx[b_]
                    dv = P[i] - P[j]; dist = np.hypot(*dv)
                    if dist < 1e-6: continue
                    n = dv / dist; ov = 2 * BR - dist
                    P[i] += n * ov / 2; P[j] -= n * ov / 2
                    rv = (V[i] - V[j]) @ n
                    if rv < 0:
                        V[i] -= rv * n; V[j] += rv * n
            sp = np.hypot(V[:, 0], V[:, 1])
            fast = sp > 1300
            V[fast] *= (1300 / sp[fast])[:, None]
            slow = alive & (sp < 250)
            V[slow] *= 1.01
            esc = alive & (np.hypot(P[:, 0] - CX, P[:, 1] - CY) > RH + 3 * BR)
            if esc.any():
                for i in np.where(esc)[0]:
                    if alive.sum() > 1:
                        alive[i] = False; out_t[i] = t; hits.append(('e', i, P[i, 0]))
                    else:
                        d = np.array([P[i, 0] - CX, P[i, 1] - CY]); P[i] -= d / np.hypot(*d) * 60; V[i] *= -0.5
        if record:
            frames.append((P.copy(), alive.copy(), WROT * f / FPS, hits))
        ev += [(f / FPS,) + h for h in hits]
        if alive.sum() == 1 and not record:
            return dict(last=f / FPS, out_t=out_t)
    return dict(frames=frames, ev=ev, out_t=out_t, alive=alive, last=np.nanmax(out_t))


if sys.argv[1:2] == ['tune']:
    for g in (0.3, 0.38, 0.46):
        for w in (0.8, 1.2):
            GAPF, WROT = g, w
            for sd in range(3):
                r = sim(sd)
                ot = np.sort(r['out_t'][~np.isnan(r['out_t'])])
                print(g, w, sd, 'last', round(r['last'], 1), 'n_out', len(ot), 'half at', ot[len(ot) // 2].round(1) if len(ot) else None, flush=True)
    sys.exit()

r = sim(SEED, True)
frames = r['frames']
win = int(np.where(r['alive'])[0][0]) if r['alive'].sum() == 1 else None
TW = r['last']
print('winner', win, 'at', TW, 'alive', r['alive'].sum())

# audio: Turkish March melody on wall hits
TM = [71, 69, 68, 69, 72, 74, 72, 71, 72, 76, 77, 76, 75, 76, 83, 81, 80, 81, 83, 81, 80, 81, 84,
      81, 84, 83, 81, 79, 81, 83, 81, 79, 81, 83, 81, 79, 78, 76]
au = Audio(31)


def piano(midi, dur=0.6):
    fq = 440 * 2 ** ((midi - 69) / 12)
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 6) * np.minimum(1, t * 600)
    return (np.sin(2 * np.pi * fq * t) + 0.4 * np.sin(4 * np.pi * fq * t) * np.exp(-t * 8)) * env


notes = {m: piano(m) for m in set(TM)}
last = -1; k = 0
for (t, kind, i, x) in r['ev']:
    if t > DUR - 0.4: continue
    if kind == 'e':
        au.add(au.pluck(1046 * 2 ** (-(np.isnan(r['out_t']).sum()) / 24), decay=9, dur=0.4, bright=0.8), t, 0.5, 0.35)
        continue
    if t - last < 0.13: continue
    last = t
    au.add(notes[TM[k % len(TM)]], t, float(np.clip(x / W, .25, .75)), 0.4); k += 1
au.beat(124, lambda t: min(1, t / TW) * 0.55, 1.5, TW)
au.riser(TW, 3.5, 0.6)
au.add(au.smash(5), TW, 0.5, 0.9)
n = int(DUR * SR)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.25) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.25, fd)[:, None]
from scipy.io import wavfile
wavfile.write('hex.wav', SR, (outw * 32767).astype(np.int16))

COLS = [hsv((i * 0.6180339) % 1, 0.65) for i in range(N)]
bg = make_bg(960, (44, 20, 18))
enc = Enc('hex_v.mp4')
trail = np.zeros((H, W, 3), np.uint8)
popfx = []
flash = 0.0; pop = 0.0; prev_alive = N
first_img = None
for f in range(NF):
    t = f / FPS
    P, al, ang, hits = frames[f]
    na = int(al.sum())
    if na < prev_alive: pop = 1.0
    prev_alive = na
    if abs(t - TW) < 0.5 / FPS: flash = 0.7
    flash *= 0.88; pop *= 0.88
    for h in hits:
        if h[0] == 'e': popfx.append([P[h[1]].copy(), 0.0, COLS[h[1]]])
    trail = cv2.convertScaleAbs(trail, alpha=0.75)
    lay = np.zeros((H, W, 3), np.uint8)
    for (A, B) in walls(ang):
        cv2.line(lay, (int(A[0] * 16), int(A[1] * 16)), (int(B[0] * 16), int(B[1] * 16)), hsv(0.08 + 0.1 * np.sin(t), 0.8), 14, cv2.LINE_AA, 4)
    for e in popfx:
        e[1] += 1 / FPS
        rr = int((30 + 260 * e[1]) * 16)
        c = tuple(int(v * max(0, 1 - e[1] / 0.5)) for v in e[2])
        cv2.circle(lay, (int(e[0][0] * 16), int(e[0][1] * 16)), rr, c, 5, cv2.LINE_AA, 4)
    popfx = [e for e in popfx if e[1] < 0.5]
    for i in range(N):
        if not al[i] and (P[i, 1] > H + 50): continue
        ctr = (int(P[i, 0] * 16), int(P[i, 1] * 16))
        dim = 1.0 if al[i] else 0.35
        cv2.circle(trail, ctr, int(BR * 0.8 * 16), tuple(int(v * 0.6 * dim) for v in COLS[i]), -1, cv2.LINE_AA, 4)
        cv2.circle(lay, ctr, int(BR * 16), tuple(int(v * dim) for v in COLS[i]), -1, cv2.LINE_AA, 4)
    img = glow(bg, cv2.add(trail, lay), 0.8)
    for i in range(N):
        if not al[i]: continue
        put(img, str(i + 1), P[i, 0], P[i, 1], 30, (20, 20, 20))
    if na > 1:
        put(img, '最後に残るのは何番？', 540, 215, 84)
        put(img, 'コメントで予想して！', 540, 320, 56, (255, 226, 60), 1 + 0.05 * np.sin(t * 5))
        put(img, f'残り {na}', 540, 1640, 120, (255, 90, 90) if na <= 3 else (255, 255, 255), 1 + 0.5 * pop)
    else:
        s = 1 + 1.5 * np.exp(-(t - TW) * 7)
        put(img, f'{win + 1}番の勝ち！', 540, 250, 130, tuple(COLS[win][::-1]), s)
        put(img, '予想当たった？', 540, 1640, 80)
    if f == 0: first_img = img.copy()
    XF = 24
    if f >= NF - XF:
        k2 = (f - (NF - XF)) / XF
        img = cv2.addWeighted(img, 1 - k2, first_img, k2, 0)
    if flash > 0.02:
        img = cv2.addWeighted(img, 1.0, np.full_like(img, 255), flash, 0)
    enc.write(img)
enc.close()
mux('hex_v.mp4', 'hex.wav', 'hex_survival_short.mp4')
