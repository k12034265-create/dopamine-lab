"""砂を流し込むと絵になる。usage: python3 sand.py SEED PIC OUT [--dur 秒]
--dur を20秒未満にすると短尺モード：砂は注ぎ口ごとの仮の色で積もり、
満杯になった最後の約2.8秒で下から色が変わって絵が出る（答えを最後まで隠す）。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
ARGS = sys.argv[1:]
DUR_ = 26.0
if '--dur' in ARGS:
    _i = ARGS.index('--dur'); DUR_ = float(ARGS[_i + 1]); del ARGS[_i:_i + 2]
SHORT = DUR_ < 20
import lib
lib.DUR = DUR_; lib.NF = int(DUR_ * 60)
from lib import *
import pics
DUR = lib.DUR; NF = lib.NF

SEED = int(ARGS[0]) if len(ARGS) > 0 else 1
PIC = ARGS[1] if len(ARGS) > 1 else 'fuji'
OUT = ARGS[2] if len(ARGS) > 2 else 'sand_short.mp4'
GWc, GHc = (96, 144) if SHORT else (120, 180)
CS = 10 if SHORT else 8
X0 = (W - GWc * CS) // 2
Y0 = 330
STEPS = 4 if SHORT else 3
SPREAD = 4 if SHORT else 2
PRE = 70 if SHORT else 240   # frames simulated before the video starts (start mid-pour)
TOTAL = PRE + NF
REVEAL = 2.8                 # short mode: seconds left after the box is full
RATE = 24.0 if SHORT else 32.0


def simulate(record_final=None):
    rng = np.random.default_rng(SEED)
    G = -np.ones((GHc, GWc), np.int32)
    nid = 0
    final = {}
    frames = []
    phase = rng.uniform(0, 6, 3)
    full_at = None
    src = []
    acc = 0.0
    for f in range(TOTAL):
        t = f / FPS
        # nozzles
        fill = (G >= 0).mean()
        acc += RATE if fill < 0.955 else 0
        rate = int(acc); acc -= rate
        for k in range(3):
            cx = int((0.5 + 0.42 * np.sin(t * (0.6 + 0.25 * k) + phase[k])) * (GWc - 4)) + 2
            for _ in range(rate // 3 + (1 if k < rate % 3 else 0)):
                x = int(np.clip(cx + rng.integers(-SPREAD, SPREAD + 1), 0, GWc - 1))
                for yy in ((0, 1) if SHORT else (0,)):
                    if G[yy, x] < 0:
                        G[yy, x] = nid; nid += 1; src.append(k); break
        for s in range(STEPS):
            for y in range(GHc - 2, -1, -1):
                row = G[y]; below = G[y + 1]
                occ = row >= 0
                if not occ.any():
                    continue
                down = occ & (below < 0)
                if down.any():
                    G[y + 1][down] = row[down]; row[down] = -1
                occ = row >= 0
                if not occ.any():
                    continue
                dirs = rng.integers(0, 2, GWc)
                for d, sh in ((0, -1), (1, 1)):
                    cand = occ & (dirs == d)
                    idx = np.where(cand)[0]
                    tx = idx + sh
                    ok = (tx >= 0) & (tx < GWc)
                    idx, tx = idx[ok], tx[ok]
                    ok = (G[y + 1, tx] < 0) & (G[y, tx] < 0)
                    idx, tx = idx[ok], tx[ok]
                    tx, first = np.unique(tx, return_index=True); idx = idx[first]
                    G[y + 1, tx] = G[y, idx]; G[y, idx] = -1
                    occ = row >= 0
        if full_at is None and (G >= 0).mean() >= 0.95:
            full_at = f
        if record_final is not None and f >= PRE:
            frames.append(G.copy())
    ys, xs = np.where(G >= 0)
    for y, x in zip(ys, xs):
        final[int(G[y, x])] = (y, x)
    return final, frames, full_at, nid, np.array(src)


final, _, full_at, nid, src = simulate()
if SHORT:
    # tune pour rate so the box is full REVEAL seconds before the end
    for _ in range(4):
        want = PRE + (DUR - REVEAL) * FPS
        if full_at is not None and abs(full_at - want) < 6:
            break
        RATE *= 1.6 if full_at is None else (full_at / want) ** 1.1
        final, _, full_at, nid, src = simulate()
        print('rate', round(RATE, 1), 'full at', full_at and round((full_at - PRE) / FPS, 2))
print('grains', nid, 'full at', full_at and (full_at - PRE) / FPS)
picture = pics.pic(PIC, GWc, GHc, SEED)
cols = np.zeros((nid + 1, 3), np.uint8)
rng = np.random.default_rng(99)
for gid, (y, x) in final.items():
    c = picture[y, x] * (0.9 + 0.1 * rng.random())
    cols[gid] = (np.clip(c[::-1], 0, 1) * 255).astype(np.uint8)
cols[nid] = (0, 0, 0)
# short mode: hidden colours = one bright sand colour per nozzle
NOZ = np.array([(1.0, 0.42, 0.45), (0.3, 0.85, 0.95), (1.0, 0.82, 0.25)])
hid = np.zeros((nid + 1, 3), np.uint8)
for gid in range(nid):
    c = NOZ[src[gid]] * (0.82 + 0.18 * rng.random())
    hid[gid] = (np.clip(c[::-1], 0, 1) * 255).astype(np.uint8)
gy = np.full(nid + 1, GHc, np.int32)
for gid, (y, x) in final.items():
    gy[gid] = y
_, frames, full_at, _, _ = simulate(record_final=True)
TEND = (full_at - PRE) / FPS if full_at else DUR - 3
WAVE = 0.7
TDONE = TEND + 0.1 + WAVE if SHORT else TEND

# audio: sand hiss scaled by pour, chimes as level rises
au = Audio(71)
from scipy.signal import butter, lfilter
b, a = butter(2, [2500 / (SR / 2), 9000 / (SR / 2)], 'band')
n = int(DUR * SR)
hiss = lfilter(b, a, np.random.default_rng(3).normal(0, 1, n)) * 0.10
env = np.ones(n); env[int(TEND * SR):] = np.exp(-np.arange(n - int(TEND * SR)) / SR * 4)
au.add(hiss * env, 0, 0.5, 1.0)
PENT = [0, 2, 4, 7, 9]
for k in range(24):
    t = k / 24 * TEND
    au.add(au.pluck(196 * 2 ** ((PENT[k % 5] + 12 * (k // 5 % 3)) / 12), decay=5, dur=0.9, bright=0.2), t, 0.5, 0.22)
if SHORT:
    for k in range(14):
        au.add(au.pluck(784 * 2 ** ((PENT[k % 5] + 12 * (k // 5)) / 12), decay=18, dur=0.3, bright=0.1), TEND + 0.1 + k * WAVE / 14, 0.2 + 0.6 * (k % 2), 0.12)
au.riser(TDONE, 3.0 if SHORT else 3.5, 0.6)
au.add(au.smash(2), TDONE, 0.5, 0.8)
for j, m in enumerate((1, 1.25, 1.5, 2)):
    au.add(au.pluck(392 * m, decay=1.5, dur=3), TDONE + 0.15 + 0.06 * j, 0.5, 0.3)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
from scipy.io import wavfile
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

bg = make_bg(960, (30, 24, 34))
enc = Enc(OUT + '.v.mp4')
first_img = None
flash = 0.0
for f in range(NF):
    t = f / FPS
    G = frames[f]
    idx = np.where(G >= 0, G, nid)
    if SHORT:
        # wave rises from the bottom: rows below the wave line show the picture
        wl = GHc - (t - TEND - 0.1) / WAVE * (GHc + 6)
        cell = np.where((gy[idx] >= wl)[..., None], cols[idx], hid[idx])
        edge = (np.abs(gy[idx] - wl) < 3) & (G >= 0)
        cell[edge] = np.minimum(255, cell[edge].astype(int) + 70).astype(np.uint8)
        cell[G < 0] = 0
    else:
        cell = cols[idx]
    big = cv2.resize(cell, (GWc * CS, GHc * CS), interpolation=cv2.INTER_NEAREST)
    lay = np.zeros((H, W, 3), np.uint8)
    lay[Y0:Y0 + GHc * CS, X0:X0 + GWc * CS] = big
    cv2.rectangle(lay, (X0 - 6, Y0 - 6), (X0 + GWc * CS + 6, Y0 + GHc * CS + 6), (90, 80, 100), 3)
    if abs(t - TDONE) < 0.5 / FPS: flash = 0.15 if SHORT else 0.6
    flash *= 0.9
    img = glow(bg, lay, 0.3 if t < TDONE else (0.3 + 0.05 * np.sin(t * 4) if SHORT else 0.4 + 0.1 * np.sin(t * 4)), 4)
    if t < TDONE:
        put(img, '砂を流し込むと…', 540, 175, 90)
        put(img, '何の絵になる？', 540, 280, 60, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
    else:
        s = 1 + 1.4 * np.exp(-(t - TDONE) * 7)
        put(img, pics.TITLES[PIC] + 'でした！', 540, 220, 96, (255, 226, 60), s)
        put(img, '何の絵か当てられた？', 540, 1840, 60)
    if flash > 0.02:
        img = cv2.addWeighted(img, 1.0, np.full_like(img, 255), flash, 0)
    if f == 0: first_img = img.copy()
    XF = 24
    if f >= NF - XF:
        k2 = (f - (NF - XF)) / XF
        img = cv2.addWeighted(img, 1 - k2, first_img, k2, 0)
    enc.write(img)
enc.close()
mux(OUT + '.v.mp4', OUT + '.wav', OUT); os.remove(OUT + '.v.mp4'); os.remove(OUT + '.wav')
