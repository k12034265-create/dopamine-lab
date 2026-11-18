import sys
sys.path.insert(0, '/home/claude')
from lib import *

CX, CY, R = 540.0, 960.0, 470.0
TF = 54.0
rng = np.random.default_rng(11)
# bounce schedule: chord angle step drifts slowly -> rotating star patterns
D0 = 2 * np.pi * 0.3819
times, angs = [0.0], [-np.pi / 2]
t = 0.0
k = 0
while t < TF:
    d = D0 + 0.0009 * k
    L = 2 * R * abs(np.sin(d / 2))
    sp = 1400 + 5600 * (t / TF) ** 1.5
    t += L / sp
    times.append(t); angs.append(angs[-1] + d); k += 1
times = np.array(times); angs = np.array(angs)
pts = np.stack([CX + R * np.cos(angs), CY + R * np.sin(angs)], 1)
NB = int((times < TF).sum())
print('bounces', NB)

au = Audio(7)
PENT = [0, 2, 4, 7, 9]
for i in range(1, NB):
    deg = PENT[i % 5] + 12 * ((i // 5) % 3)
    au.add(au.pluck(196 * 2 ** (deg / 12), decay=12, dur=0.4, bright=0.2), times[i], float(np.clip(pts[i, 0] / W, .15, .85)), 0.28 / (1 + i / 250))
td = np.arange(int(TF * SR)) / SR
au.add(np.sin(2 * np.pi * 98 * td) * 0.05 * np.minimum(1, td / 3), 0, 0.5)
au.beat(118, lambda t: min(1, t / TF) * 0.7, 6, TF)
au.riser(TF, 4.0, 0.7)
for j, m in enumerate((1, 1.25, 1.5, 2)):
    au.add(au.pluck(261.6 * m, decay=1.8, dur=3), TF + 0.05 * j, 0.5, 0.35)
au.save('stringart.wav')

bg = make_bg(960, (36, 20, 40))
art = np.zeros((H, W, 3), np.uint8)
enc = Enc('stringart_v.mp4')
drawn = 0
fl = 0.0; flash = 0.0
for f in range(NF):
    t = min(f / FPS, TF)
    newb = 0
    while drawn + 1 < NB and times[drawn + 1] <= t:
        a, b = pts[drawn], pts[drawn + 1]
        col = hsv(0.55 + drawn / NB * 0.9, 0.7, 0.55)
        cv2.line(art, (int(a[0] * 16), int(a[1] * 16)), (int(b[0] * 16), int(b[1] * 16)), col, 2, cv2.LINE_AA, 4)
        drawn += 1; newb += 1
    fl = max(fl * 0.8, 1.0 if newb else 0)
    if f == int(TF * FPS): flash = 0.7
    flash *= 0.9
    layer = art.copy()
    if f / FPS < TF and drawn + 1 < len(times):
        u = (t - times[drawn]) / (times[drawn + 1] - times[drawn])
        p = pts[drawn] + (pts[drawn + 1] - pts[drawn]) * u
        cv2.line(layer, (int(pts[drawn][0]), int(pts[drawn][1])), (int(p[0]), int(p[1])), (255, 255, 255), 3, cv2.LINE_AA)
        cv2.circle(layer, (int(p[0] * 16), int(p[1] * 16)), 14 * 16, (255, 255, 255), -1, cv2.LINE_AA, 4)
        cv2.circle(layer, (int(pts[drawn][0] * 16), int(pts[drawn][1] * 16)), int((8 + 10 * fl) * 16), hsv(0.12, 0.6), -1, cv2.LINE_AA, 4)
    rc = tuple(int(90 + 120 * fl) for _ in range(3))
    cv2.circle(layer, (int(CX), int(CY)), int(R + 6), rc, 4, cv2.LINE_AA)
    end = f / FPS >= TF
    img = glow(bg, cv2.convertScaleAbs(layer, alpha=1.0 + (0.5 + 0.3 * np.sin(f / 9) if end else 0)), 1.2)
    if not end:
        put(img, '跳ねた線だけで描くと…', 540, 230, 78)
        put(img, '最後に何が浮かぶ？', 540, 330, 54, (255, 226, 60), 1 + 0.04 * np.sin(f / 12))
        put(img, f'{drawn} 本目', 540, 1640, 90, (255, 255, 255), 1 + 0.15 * fl)
    else:
        s = 1 + 1.4 * np.exp(-(f / FPS - TF) * 7)
        put(img, '完成', 540, 250, 140, (255, 226, 60), s)
        put(img, f'{drawn} 本の直線でできてます', 540, 1640, 60)
    img = post(img, f, flash)
    enc.write(img)
enc.close()
mux('stringart_v.mp4', 'stringart.wav', 'stringart_short.mp4')
