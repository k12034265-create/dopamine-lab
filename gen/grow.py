import sys
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

CX, CY, R = 540.0, 960.0, 470.0
G_ = 1400.0
SUB = 8


def sim(g, r0=14.0, record=False, seed=0):
    rng = np.random.default_rng(seed)
    p = np.array([CX + 60, CY - 200.0]); v = np.array([320.0, 0.0]); r = r0
    dt = 1 / FPS / SUB
    frames, ev = [], []
    fin = None
    for f in range(NF):
        hit = False
        if fin is None:
            for s in range(SUB):
                v[1] += G_ * dt; p += v * dt
                d = p - (CX, CY); dist = np.hypot(*d)
                if dist + r >= R:
                    n = d / dist
                    vn = v @ n
                    if vn > 0:
                        v -= 2 * vn * n
                        v += rng.normal(0, 8, 2)
                        r = min(R - 1, r + g)
                        hit = True
                        ev.append((f / FPS, r, float(p[0])))
                    p = np.array((CX, CY)) + n * (R - r)
                sp = np.hypot(*v)
                if sp < 900: v *= 900 / sp
                if r >= R - 3:
                    fin = f
                    break
        frames.append((p.copy(), r, hit))
    return frames, ev, fin


if __name__ == '__main__' and sys.argv[1:] == ['tune']:
    for g in (1.6, 1.9, 2.2, 2.6):
        _, ev, fin = sim(g)
        print(g, len(ev), fin and fin / FPS)
    sys.exit()

g = float(sys.argv[1]) if len(sys.argv) > 1 else 2.0
frames, ev, fin = sim(g, record=True)
TF = fin / FPS
print('finish', TF, 'bounces', len(ev))

au = Audio(5)
PENT = [0, 2, 4, 7, 9]
for i, (t, r, x) in enumerate(ev):
    k = int((r - 14) / (R - 14) * 24)
    note = 130.81 * 2 ** ((PENT[k % 5] + 12 * (k // 5)) / 12)
    au.add(au.pluck(note, decay=10, dur=0.5), t, float(np.clip(x / W, .15, .85)), 0.35 / (1 + i / 300))
au.beat(124, lambda t: min(1, t / TF) * 0.8, 0, TF)
au.riser(TF, 4.0, 0.8)
au.add(au.smash(4), TF, 0.5, 1.0)
au.save('grow.wav')

bg = make_bg(960, (40, 16, 46))
enc = Enc('grow_v.mp4')
trail = np.zeros((H, W, 3), np.uint8)
fl = 0.0; flash = 0.0
for f in range(NF):
    t = f / FPS
    p, r, hit = frames[f]
    fl = max(fl * 0.85, 1.0 if hit else 0)
    hue = 0.55 + 0.45 * (r - 14) / (R - 14)
    col = hsv(hue, 0.75)
    if fin and f == fin: flash = 0.8
    flash *= 0.88
    trail = cv2.convertScaleAbs(trail, alpha=0.86)
    if fin is None or f < fin:
        cv2.circle(trail, (int(p[0] * 16), int(p[1] * 16)), int(r * 16), tuple(int(c * 0.35) for c in col), -1, cv2.LINE_AA, 4)
    sharp = np.zeros((H, W, 3), np.uint8)
    rc = tuple(int(c + (255 - c) * fl * 0.7) for c in hsv(hue + 0.3, 0.8))
    cv2.circle(sharp, (int(CX), int(CY)), int(R + 8), rc, 8 + int(6 * fl), cv2.LINE_AA)
    bc = tuple(int(c + (255 - c) * fl * 0.5) for c in col)
    cv2.circle(sharp, (int(p[0] * 16), int(p[1] * 16)), int(r * 16), bc, -1, cv2.LINE_AA, 4)
    img = glow(bg, cv2.add(trail, sharp), 1.0)
    pct = int(100 * (r * r) / (R * R))
    if fin is None or f < fin:
        put(img, '跳ねるたびに大きくなる', 540, 230, 80)
        put(img, '円がいっぱいになるまで見て', 540, 330, 52, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
        put(img, f'{pct}%', 540, 1640, 130, (255, 255, 255), 1 + 0.25 * fl)
    else:
        s = 1 + 1.5 * np.exp(-(t - TF) * 7)
        put(img, '満タン！', 540, 260, 140, (255, 226, 60), s)
        put(img, '100%', 540, 1640, 130)
        put(img, 'もう1回 →', 540, 1790, 60)
    img = post(img, f, flash)
    enc.write(img)
enc.close()
mux('grow_v.mp4', 'grow.wav', 'grow_short.mp4')
