import sys
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import lib
lib.DUR = 26.0; lib.NF = int(26.0 * 60)
from lib import *
DUR = lib.DUR; NF = lib.NF

NB = 48
SEED = int(sys.argv[1]) if len(sys.argv) > 1 else 3
rng = np.random.default_rng(SEED)
base = rng.permutation(NB) + 1


def bubble(a):
    a = a.copy(); n = len(a)
    for i in range(n):
        sw = False
        for j in range(n - 1 - i):
            yield a.copy(), (j, j + 1)
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]; sw = True
        if not sw: break


def insertion(a):
    a = a.copy()
    for i in range(1, len(a)):
        j = i
        while j > 0:
            yield a.copy(), (j - 1, j)
            if a[j - 1] > a[j]:
                a[j - 1], a[j] = a[j], a[j - 1]; j -= 1
            else:
                break


def quick(a):
    a = a.copy()
    st = [(0, len(a) - 1)]
    while st:
        lo, hi = st.pop()
        if lo >= hi: continue
        p = a[hi]; i = lo
        for j in range(lo, hi):
            yield a.copy(), (j, hi)
            if a[j] < p:
                a[i], a[j] = a[j], a[i]; i += 1
        a[i], a[hi] = a[hi], a[i]
        st.append((lo, i - 1)); st.append((i + 1, hi))


def merge(a):
    a = a.copy(); n = len(a); w = 1
    while w < n:
        for lo in range(0, n, 2 * w):
            mid = min(lo + w, n); hi = min(lo + 2 * w, n)
            L = list(a[lo:mid]); R = list(a[mid:hi]); k = lo; i = j = 0
            while i < len(L) and j < len(R):
                yield a.copy(), (k, mid + j if mid + j < n else k)
                if L[i] <= R[j]: a[k] = L[i]; i += 1
                else: a[k] = R[j]; j += 1
                k += 1
            while i < len(L): a[k] = L[i]; i += 1; k += 1
            while j < len(R): a[k] = R[j]; j += 1; k += 1
        w *= 2


ALGS = [('バブルソート', bubble), ('挿入ソート', insertion), ('クイックソート', quick), ('マージソート', merge)]
traces = []
for name, fn in ALGS:
    tr = list(fn(base))
    traces.append(tr)
    print(name, len(tr))
TEND = 22.5
OPF = max(len(t) for t in traces) / (TEND * FPS)
print('ops/frame', OPF)
fin_t = [len(t) / OPF / FPS for t in traces]
order = list(np.argsort(fin_t))
print('finish', [round(x, 1) for x in fin_t])

# ---------- audio
au = Audio(41)


def tone(v, dur=0.07):
    fq = 220 * 2 ** (v / NB * 2.5)
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * fq * t) * np.exp(-t * 30) * np.minimum(1, t * 900)


tones = {v: tone(v) for v in range(1, NB + 1)}
PANS = [0.25, 0.75, 0.25, 0.75]
for f in range(int(TEND * FPS) + 2):
    for k, tr in enumerate(traces):
        idx = int(f * OPF)
        if idx < len(tr) and f % 2 == k % 2:
            a, (i, j) = tr[idx]
            au.add(tones[int(a[i])], f / FPS, PANS[k], 0.13)
for rank, k in enumerate(order):
    t0 = fin_t[k]
    for s in range(NB):
        if s % 3 == 0:
            au.add(tones[s + 1], t0 + s * 0.006, PANS[k], 0.12)
    au.add(au.pluck([784, 659, 587, 523][rank], decay=4, dur=1.0), t0 + 0.32, PANS[k], 0.45)
au.beat(126, lambda t: 0.35, 0.5, TEND)
au.add(au.smash(0), fin_t[order[-1]] + 0.35, 0.5, 0.7)
n = int(DUR * SR)
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
fd = int(0.4 * SR); outw[-fd:] *= np.linspace(1, 0.3, fd)[:, None]
from scipy.io import wavfile
wavfile.write('sort.wav', SR, (outw * 32767).astype(np.int16))

# ---------- video
bg = make_bg(960, (30, 22, 30))
PANELS = [(40, 470), (560, 470), (40, 1130), (560, 1130)]
PW, PH = 480, 520
BW = PW / NB
COL = [hsv(0.0 + v / NB * 0.83, 0.85) for v in range(1, NB + 1)]
RANKC = [(60, 210, 255), (220, 220, 220), (80, 140, 205), (150, 150, 150)]
enc = Enc('sort_v.mp4')
first_img = None
done_at = [None] * 4
for f in range(NF):
    t = f / FPS
    img = bg.copy()
    lay = np.zeros((H, W, 3), np.uint8)
    for k, tr in enumerate(traces):
        x0, y0 = PANELS[k]
        idx = int(f * OPF)
        fin = idx >= len(tr)
        if fin:
            a = np.sort(base); hl = ()
            if done_at[k] is None: done_at[k] = t
        else:
            a, hl = tr[idx]
        sweep = (t - done_at[k]) / 0.35 if fin else -1
        for s, v in enumerate(a):
            h = int(v / NB * (PH - 20))
            c = COL[v - 1]
            if s in hl: c = (255, 255, 255)
            if 0 <= sweep and s / NB < min(1, sweep): c = tuple(int(cc * 0.5 + 127) for cc in c) if sweep < 1.3 else c
            cv2.rectangle(lay, (int(x0 + s * BW + 1), int(y0 + PH - h)), (int(x0 + (s + 1) * BW - 1), int(y0 + PH)), c, -1)
        cv2.rectangle(img, (x0 - 8, y0 - 70), (x0 + PW + 8, y0 + PH + 10), (60, 50, 60), 2)
    img = glow(img, lay, 0.6, 4)
    for k in range(4):
        x0, y0 = PANELS[k]
        put(img, ALGS[k][0], x0 + PW / 2, y0 - 36, 40)
        if done_at[k] is not None:
            rank = order.index(k)
            s = 1 + 1.2 * np.exp(-(t - done_at[k]) * 8)
            put(img, f'{rank + 1}位', x0 + PW / 2, y0 + PH / 2 - 40, 110, tuple(RANKC[rank][::-1]), s)
            put(img, f'{done_at[k]:.1f}秒', x0 + PW / 2, y0 + PH / 2 + 55, 46, (255, 255, 255), s)
    if t < fin_t[order[-1]] + 0.2:
        put(img, 'どれが一番速い？', 540, 190, 92)
        put(img, '4つの並べ替え方で勝負', 540, 300, 54, (255, 226, 60), 1 + 0.04 * np.sin(t * 5))
    else:
        put(img, f'優勝：{ALGS[order[0]][0]}', 540, 230, 86, (255, 226, 60), 1 + 1.2 * np.exp(-(t - fin_t[order[-1]]) * 7))
    put(img, '予想はコメントで！', 540, 1760, 58)
    if f == 0: first_img = img.copy()
    XF = 24
    if f >= NF - XF:
        k2 = (f - (NF - XF)) / XF
        img = cv2.addWeighted(img, 1 - k2, first_img, k2, 0)
    enc.write(img)
enc.close()
mux('sort_v.mp4', 'sort.wav', 'sort_race_short.mp4')
