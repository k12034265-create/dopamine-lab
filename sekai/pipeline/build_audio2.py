# ナレーション + BGM（合成、声の下でダッキング）+ 効果音（紙芝居の sfx きっかけ）→ work/final_audio2.wav（ステレオ48k）
# EP=<episode> python3 build_audio2.py [clips_dir...]
import numpy as np, wave, json, os, sys, glob
from common import W
from timeline import build
TL = build(); SR = 48000; FPS = 30
total = sum(x['frames'] for x in TL) / FPS; N = int(total * SR)
rng = np.random.default_rng(7)

# ---- ナレーション ----
nar = np.zeros(N + SR)
for x in TL:
    with wave.open(f"{W}/audio/{x['i']+1:02d}.wav") as w:
        sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    a = np.interp(np.arange(0, len(a) * SR / sr) / (SR / sr), np.arange(len(a)), a)
    s = int(x['start'] * SR); nar[s:s + len(a)] += a
nar = nar[:N]; t = np.arange(N) / SR

# ---- BGM：柔らかいピアノ風の分散和音（96BPM、1小節2.5秒）＋薄いパッド ----
def pluck(f, dur, amp):
    n = int(dur * SR); tt = np.arange(n) / SR
    env = np.exp(-tt * 3.2) * np.minimum(1, tt / .006)
    return amp * env * (np.sin(2*np.pi*f*tt) + .35*np.sin(2*np.pi*2*f*tt) * np.exp(-tt*4) + .12*np.sin(2*np.pi*3*f*tt) * np.exp(-tt*7))
PROG = {  # パートごとに和音進行を変える（Am系＝静かな謎解き）
    0: [[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7],[164.8,207.7,246.9]],
    1: [[220,261.6,329.6],[196,246.9,293.7],[174.6,220,261.6],[196,246.9,329.6]],
}
bar = 2.5; beat = bar / 8
bgm = np.zeros(N + SR * 4); pad = np.zeros_like(bgm)
parts = []; last = None
for x in TL:
    if x['part'] != last: parts.append(x['start']); last = x['part']
k = 0; b0 = 0.0
while b0 < total:
    pi = sum(1 for p in parts if p <= b0); prog = PROG[pi % 2]; ch = prog[k % 4]
    pat = [0, 1, 2, 1, 0, 2, 1, 2]
    for j, idx in enumerate(pat):
        f = ch[idx] * (2 if j in (2, 5) else 1)
        s = int((b0 + j * beat) * SR); p = pluck(f, 1.6, .5 if j == 0 else .3)
        bgm[s:s + len(p)] += p
    bass = pluck(ch[0] / 2, 2.4, .6); s = int(b0 * SR); bgm[s:s + len(bass)] += bass
    n = int(bar * SR); tt = np.arange(n) / SR; e = np.sin(np.pi * tt / bar) ** .5
    for f in ch: pad[s:s + n] += .12 * e * np.sin(2*np.pi*f/2*tt)
    k += 1; b0 += bar
bgm = (bgm + pad)[:N]
bgm = np.convolve(bgm, np.ones(6) / 6, mode='same')
bgm = bgm / np.max(np.abs(bgm))
# ダッキング：声があるときは小さく（-24dB相当）、間では少し上がる
env = np.convolve(np.abs(nar), np.ones(int(SR * .05)) / (SR * .05), mode='same')
speak = (env > .01).astype(float)
sm = int(SR * .35); speak = np.convolve(speak, np.ones(sm) / sm, mode='same'); speak = np.clip(speak * 1.5, 0, 1)
duck = .085 - .045 * speak
fade = np.clip(np.minimum(t / 2.5, (total - t) / 3), 0, 1)
bgm = bgm * duck * fade

# ---- 効果音 ----
def tone(f0, f1, dur, dec, amp=1):
    n = int(dur * SR); tt = np.arange(n) / SR; f = np.linspace(f0, f1, n); ph = 2*np.pi*np.cumsum(f)/SR
    return amp * np.sin(ph) * np.exp(-tt * dec) * np.minimum(1, tt / .003)
def noise(dur, dec, lp=8):
    n = int(dur * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n); x = np.convolve(x, np.ones(lp) / lp, mode='same')
    return x * np.exp(-tt * dec) * np.minimum(1, tt / .003)
def add(a, b):
    n = max(len(a), len(b)); o = np.zeros(n); o[:len(a)] += a; o[:len(b)] += b; return o
def sfx(kind):
    if kind == 'pop': return add(tone(900, 520, .12, 30, .8), .2 * noise(.03, 120, 3))
    if kind == 'tick': return tone(2200, 2000, .04, 90, .5)
    if kind == 'stamp': return add(tone(130, 60, .25, 14, 1.0), .5 * noise(.12, 30, 20))
    if kind == 'chime':
        return sum(tone(f, f, 1.6, 2.4, a) for f, a in [(1318.5, .35), (1975.5, .2), (2637, .1), (659.3, .25)])
    if kind == 'swish':
        n = int(.35 * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n)
        out = np.zeros(n); lp = np.linspace(40, 4, n).astype(int)
        cs = np.cumsum(np.insert(x, 0, 0))
        for i in range(n): L = lp[i]; out[i] = (cs[i + 1] - cs[max(0, i + 1 - L)]) / L
        return .9 * out * np.sin(np.pi * tt / .35)
    if kind == 'count':
        out = np.zeros(int(1.0 * SR))
        for j in range(12):
            s = int(j * (.04 + .006 * j) * SR); p = tone(1800, 1700, .03, 110, .35)
            if s + len(p) < len(out): out[s:s + len(p)] += p
        return out
    return np.zeros(10)
VOL = {'pop': .16, 'tick': .12, 'stamp': .22, 'chime': .12, 'swish': .10, 'count': .10}
fx = np.zeros(N + SR * 3); used = []
dirs = sys.argv[1:] or [f'{W}/clips_k']
manual = {3: [(0.3, 'chime')], 13: [(0.2, 'swish')], 37: [(0.2, 'swish')], 44: [(0.2, 'swish')], 48: [(0.2, 'swish')]}
for x in TL:
    i = x['i']; cues = []
    for d in dirs:
        p = f'{d}/sfx_c{i:02d}.json'
        if os.path.exists(p): cues = [(c['t'], c['type']) for c in json.load(open(p))]; break
    cues += manual.get(i, [])
    lastt = -9
    for ct, kind in sorted(cues):
        if ct > x['dur'] - .3 or ct - lastt < .25: continue
        lastt = ct; s = int((x['start'] + ct) * SR); w = sfx(kind) * VOL.get(kind, .1)
        fx[s:s + len(w)] += w; used.append(kind)
fx = fx[:N]

L = nar * .95 + bgm + fx; R = nar * .95 + bgm + fx
# 少しだけ広がり：BGMを左右で微妙にずらす
dl = int(SR * .012); R[dl:] = (nar * .95 + fx)[dl:] + bgm[:-dl]
mx = max(np.max(np.abs(L)), np.max(np.abs(R))) / .95
L /= max(1, mx); R /= max(1, mx)
st = np.stack([L, R], 1)
with wave.open(f'{W}/final_audio2.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
from collections import Counter
print(round(total, 2), 's  sfx:', dict(Counter(used)))
