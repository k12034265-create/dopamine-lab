"""無限ズーム（非ボール型・CLAUDE.md の新6型の6番目）。
画面の中心へ向かってずっとズームし続ける。輪っかの中に同じ模様の輪っかが入れ子になっていて、
「花びら → ビーズ → 星」の3種類の模様が、色を少しずつ変えながら永遠に出てくる。
最後のフレームが最初のフレームとぴったり同じになるように作ってあるので、切れ目なくループする。
0秒からもうズームが動いていて、上に「ループの切れ目、分かる？」。
使い方: python gen/zoom.py SEED 出力.mp4 [--dur 26] [--n 8]
  SEED で色の始まり（色相）・回転の向き・ビーズの数が変わる。--n は花びらの枚数（対称の数）。
テスト: FRAMES=120 python gen/zoom.py 1 /tmp/x.mp4 （先頭120フレームだけ描く）
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
ARGS = sys.argv[1:]
DUR_ = 26.0
NSYM = 8
if '--dur' in ARGS:
    _i = ARGS.index('--dur'); DUR_ = float(ARGS[_i + 1]); del ARGS[_i:_i + 2]
if '--n' in ARGS:
    _i = ARGS.index('--n'); NSYM = int(ARGS[_i + 1]); del ARGS[_i:_i + 2]
import lib
lib.DUR = DUR_; lib.NF = int(DUR_ * 60)
from lib import *
DUR = lib.DUR; NF = lib.NF

SEED = int(ARGS[0]) if len(ARGS) > 0 else 1
OUT = ARGS[1] if len(ARGS) > 1 else 'zoom.mp4'
rng = np.random.default_rng(SEED)

CX, CY = W // 2, 1000
Q = 1.75                      # 1段ごとの大きさの比
ZL = 12                       # 動画1周で進む段数（3種類×4。偶数なので回転もぴったり戻る）
HUE0 = rng.random()
DH = 1.0 / ZL                 # 1段ごとの色相のずれ（1周でちょうど1回り）
SPIN_DIR = 1 if rng.random() < 0.5 else -1
BEADS = int(rng.choice([2, 3])) * NSYM
R0 = 260.0                    # z=0 のとき level 0 の半径
SS = 16                       # cv2 の shift=4 用


def P(pts):
    return np.round(np.asarray(pts) * SS).astype(np.int32)


def disk(img, r, col):
    cv2.circle(img, (CX * SS, CY * SS), int(r * SS), col, -1, cv2.LINE_AA, 4)


def ring_line(img, r, col, th):
    if r * 2 > 3:
        cv2.circle(img, (CX * SS, CY * SS), int(r * SS), col, max(1, int(th)), cv2.LINE_AA, 4)


def level(img, j, r, z_rot):
    """level j: 半径 r の円板。中に模様（内側の半径 r/Q までが模様の帯）。"""
    kind = j % 3
    h = HUE0 + j * DH
    base = hsv(h, 0.75, 0.22)
    c1 = hsv(h, 0.85, 1.0)
    c2 = hsv(h + 0.5 / 3, 0.7, 1.0)
    disk(img, r, base)
    ri = r / Q
    rot = z_rot + j * np.pi / NSYM
    if r < 2:
        return
    if kind == 0:     # 花びら（柑橘の断面みたいな放射状）
        u = np.linspace(0, 1, 18)
        for k in range(NSYM):
            a = rot + 2 * np.pi * k / NSYM
            rr = ri * 1.04 + (r * 0.93 - ri * 1.04) * u
            wd = np.sin(np.pi * u) ** 0.8 * (np.pi * (ri + r) / 2 / NSYM) * 0.78
            ca, sa = np.cos(a), np.sin(a)
            left = np.stack([CX + rr * ca - wd * sa, CY + rr * sa + wd * ca], 1)
            right = np.stack([CX + rr * ca + wd * sa, CY + rr * sa - wd * ca], 1)[::-1]
            col = c1 if k % 2 == 0 else c2
            cv2.fillPoly(img, [P(np.vstack([left, right]))], col, cv2.LINE_AA, 4)
    elif kind == 1:   # ビーズの輪（大小2列）
        rm = (r + ri) / 2
        rb = min((r - ri) * 0.42, np.pi * rm / BEADS * 0.9)
        for k in range(BEADS):
            a = rot + 2 * np.pi * k / BEADS
            col = c1 if k % 2 == 0 else c2
            cv2.circle(img, P((CX + rm * np.cos(a), CY + rm * np.sin(a))), int(max(1, rb * SS)), col, -1, cv2.LINE_AA, 4)
            a2 = a + np.pi / BEADS
            r2 = ri + (r - ri) * 0.86
            cv2.circle(img, P((CX + r2 * np.cos(a2), CY + r2 * np.sin(a2))), int(max(1, rb * 0.35 * SS)), (255, 255, 255), -1, cv2.LINE_AA, 4)
    else:             # 星（2N 角の星形）
        m = 2 * NSYM
        ang = rot + np.arange(2 * m) * np.pi / m
        rad = np.where(np.arange(2 * m) % 2 == 0, r * 0.95, ri * 1.08 + (r - ri) * 0.25)
        pts = np.stack([CX + rad * np.cos(ang), CY + rad * np.sin(ang)], 1)
        cv2.fillPoly(img, [P(pts)], c1, cv2.LINE_AA, 4)
        rad2 = np.where(np.arange(2 * m) % 2 == 0, r * 0.72, ri * 1.04)
        pts2 = np.stack([CX + rad2 * np.cos(ang + np.pi / m), CY + rad2 * np.sin(ang + np.pi / m)], 1)
        cv2.fillPoly(img, [P(pts2)], c2, cv2.LINE_AA, 4)
    ring_line(img, r, (255, 255, 255), max(1, r * 0.012) * SS / SS)
    # 内側の円の縁（次の段の入口）
    disk(img, ri, hsv(h + DH, 0.75, 0.22))
    ring_line(img, ri, hsv(h, 0.4, 1.0), max(1, ri * 0.02))


def scene(z):
    """z: 進んだ段数（連続）。z が ZL 増えると、同じ絵に戻る。"""
    img = np.zeros((H, W, 3), np.uint8)
    z_rot = SPIN_DIR * (2 * np.pi / NSYM) * (z / ZL) * 2   # 1周で 2/NSYM 回転（対称なので戻る）
    j0 = int(np.floor(z)) - 12
    for j in range(j0, j0 + 40):
        r = R0 * Q ** (z - j)
        if r > 2600:
            continue
        if r < 1.2:
            break
        level(img, j, r, z_rot)
    return img


# ---------------- audio（段が1つ画面の基準の大きさを越えるたびに鈴。ループに合わせて周期的）
au = Audio(SEED)
n = int(DUR * SR)
tt = np.arange(n) / SR
# パッド：DUR の間に整数回の周期になる周波数（ループでつながる）
pad = np.zeros(n)
for fr, v in ((110, 0.10), (164.8, 0.07), (220, 0.06), (277.2, 0.04)):
    fq = round(fr * DUR) / DUR
    pad += v * np.sin(2 * np.pi * fq * tt)
lfo = 0.75 + 0.25 * np.sin(2 * np.pi * (ZL / DUR) * tt)
au.L[:n] += pad * lfo; au.R[:n] += pad * lfo
PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]
for i in range(ZL * 2):       # 半段ごとに鈴
    t0 = (i + 0.5) * DUR / (ZL * 2)
    note = 523.25 * 2 ** (PENTA[(i * 3) % len(PENTA)] / 12)
    au.add(au.pluck(note, decay=5, dur=1.2, bright=0.2), t0, 0.3 + 0.4 * (i % 2), 0.22 if i % 2 else 0.3)
    if i % 2 == 0:
        au.add(au.kick, t0, 0.5, 0.25)
# 末尾にはみ出した鈴の余韻を頭に戻す（つなぎ目で音が切れない）
tail = int(1.3 * SR)
au.L[:tail] += au.L[n:n + tail]; au.R[:tail] += au.R[n:n + tail]
outw = np.tanh(np.stack([au.L[:n], au.R[:n]], 1) * 1.3) * 0.92
from scipy.io import wavfile
wavfile.write(OUT + '.wav', SR, (outw * 32767).astype(np.int16))

# ---------------- video
enc = Enc(OUT + '.v.mp4')
LIMIT = int(os.environ.get('FRAMES', NF))
vig = make_bg(CY, (255, 255, 255)).astype(np.float32) / 255
vig = 0.55 + 0.45 * np.clip(vig / vig.max(), 0, 1)
for f in range(min(NF, LIMIT)):
    t = f / FPS
    z = ZL * t / DUR
    img = scene(z)
    img = (img * vig).astype(np.uint8)
    lay = cv2.convertScaleAbs(img, alpha=0.6)
    img = cv2.add(img, cv2.GaussianBlur(lay, (0, 0), 6) // 3)
    put(img, 'ズームが止まらない…', 540, 170, 70)
    put(img, 'ループの切れ目、分かる？', 540, 275, 72, (255, 226, 60), 1 + 0.03 * np.sin(2 * np.pi * 4 * t / DUR))
    enc.write(img)
enc.close()
mux(OUT + '.v.mp4', OUT + '.wav', OUT); os.remove(OUT + '.v.mp4'); os.remove(OUT + '.wav')
print('levels per loop', ZL, 'zoom x%.0f' % (Q ** ZL), 'hue0', round(HUE0, 3), 'beads', BEADS)
