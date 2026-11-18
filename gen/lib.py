import numpy as np, cv2, subprocess, colorsys
from PIL import Image, ImageDraw, ImageFont
from scipy.io import wavfile
from scipy.signal import butter, lfilter

W, H, FPS, SR = 1080, 1920, 60, 44100
DUR = 60.0
NF = int(DUR * FPS)
FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'


def hsv(h, s=1.0, v=1.0):
    r, g, b = colorsys.hsv_to_rgb(h % 1, s, v)
    return (int(b * 255), int(g * 255), int(r * 255))


def make_bg(cy=960, tint=(46, 14, 30)):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    rr = np.hypot(xx - W / 2, yy - cy) / 1100
    bg = np.zeros((H, W, 3), np.float32)
    for c in range(3):
        bg[..., c] = tint[c] * np.exp(-rr * 2.2) + 6
    return bg.astype(np.uint8)


_tc = {}


def text(s, size, fill):
    k = (s, size, fill)
    if k not in _tc:
        f = ImageFont.truetype(FONT, size, index=0)
        sw = max(4, size // 9)
        l, t, r, b = f.getbbox(s, stroke_width=sw)
        im = Image.new('RGBA', (r - l + 8, b - t + 8), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((4 - l, 4 - t), s, font=f, fill=fill + (255,), stroke_width=sw, stroke_fill=(0, 0, 0, 255))
        a = np.array(im)
        _tc[k] = (a[..., 2::-1].astype(np.float32), a[..., 3:4].astype(np.float32) / 255)
    return _tc[k]


def put(img, s, cx, cy, size, fill=(255, 255, 255), scale=1.0, alpha=1.0):
    """fill is RGB"""
    rgb, a = text(s, size, fill)
    if abs(scale - 1) > 0.01:
        nw, nh = max(2, int(rgb.shape[1] * scale)), max(2, int(rgb.shape[0] * scale))
        rgb = cv2.resize(rgb, (nw, nh)); a = cv2.resize(a, (nw, nh))[..., None]
    h, w = a.shape[:2]
    x0, y0 = int(cx - w / 2), int(cy - h / 2)
    xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
    if xa >= xb or ya >= yb:
        return
    sa = a[ya - y0:yb - y0, xa - x0:xb - x0] * alpha
    img[ya:yb, xa:xb] = (img[ya:yb, xa:xb] * (1 - sa) + rgb[ya - y0:yb - y0, xa - x0:xb - x0] * sa).astype(np.uint8)


def glow(bg, layer, amt=1.1, sig=5):
    small = cv2.resize(layer, (W // 6, H // 6), interpolation=cv2.INTER_AREA)
    small = cv2.GaussianBlur(small, (0, 0), sig)
    g = cv2.resize(small, (W, H), interpolation=cv2.INTER_LINEAR)
    return cv2.add(cv2.add(bg, layer), cv2.convertScaleAbs(g, alpha=amt))


def post(img, f, flash=0.0, shake=0.0, rng=None, bar=(60, 226, 255)):
    if shake > 0.5:
        dx, dy = rng.normal(0, shake * 0.5, 2)
        img = cv2.warpAffine(img, np.float32([[1, 0, dx], [0, 1, dy]]), (W, H), borderMode=cv2.BORDER_REFLECT)
    if flash > 0.02:
        img = cv2.addWeighted(img, 1.0, np.full_like(img, 255), flash, 0)
    cv2.rectangle(img, (0, H - 10), (int(W * f / NF), H), bar, -1)
    if f > NF - 20:
        img = cv2.convertScaleAbs(img, alpha=(NF - f) / 20)
    return img


class Enc:
    def __init__(self, out):
        self.p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS),
                                   '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-maxrate', '7M', '-bufsize', '14M',
                                   '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)

    def write(self, img):
        self.p.stdin.write(img.tobytes())

    def close(self):
        self.p.stdin.close(); self.p.wait()


def mux(video, wav, out):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', video, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                    '-movflags', '+faststart', out], check=True)


class Audio:
    def __init__(self, seed=0):
        self.L = np.zeros(int((DUR + 4) * SR)); self.R = np.zeros(int((DUR + 4) * SR))
        self.rng = np.random.default_rng(seed)
        tk = np.arange(int(0.3 * SR)) / SR
        self.kick = np.sin(2 * np.pi * np.cumsum(110 * np.exp(-tk * 22) + 45) / SR) * np.exp(-tk * 11)
        th = np.arange(int(0.05 * SR)) / SR
        b, a = butter(2, 7000 / (SR / 2), 'high')
        self.hat = lfilter(b, a, self.rng.normal(0, 1, len(th))) * np.exp(-th * 90)

    def add(self, sig, t, pan=0.5, vol=1.0):
        i = int(max(0, t) * SR)
        if i + len(sig) > len(self.L):
            return
        self.L[i:i + len(sig)] += sig * vol * (1 - pan); self.R[i:i + len(sig)] += sig * vol * pan

    def pluck(self, freq, decay=14, dur=0.4, bright=0.35):
        t = np.arange(int(dur * SR)) / SR
        env = np.exp(-t * decay) * np.minimum(1, t * 800)
        return (np.sin(2 * np.pi * freq * t) + bright * np.sin(4 * np.pi * freq * t) * np.exp(-t * 30) + 0.15 * np.sin(8 * np.pi * freq * t) * np.exp(-t * 50)) * env

    def smash(self, k=0, dur=1.8):
        t = np.arange(int(dur * SR)) / SR
        root = 261.63 * 2 ** ((k % 12) / 12)
        s = sum(np.sin(2 * np.pi * root * m * t + self.rng.random() * 6) for m in (2, 2.52, 3, 4, 5.04)) * np.exp(-t * 3) * 0.22
        b, a = butter(2, 3000 / (SR / 2), 'high')
        noise = lfilter(b, a, self.rng.normal(0, 1, len(t))) * np.exp(-t * 9) * 0.5
        sub = np.sin(2 * np.pi * np.cumsum(150 * np.exp(-t * 6) + 42) / SR) * np.exp(-t * 4) * 1.1
        return s + noise + sub

    def riser(self, t_end, d=5.0, vol=1.0):
        tr = np.arange(int(d * SR)) / SR
        ris = np.sin(2 * np.pi * np.cumsum(200 * 2 ** (tr / d * 2.2)) / SR) * (tr / d) ** 2 * 0.12
        bb, aa = butter(2, [1500 / (SR / 2), 9000 / (SR / 2)], 'band')
        ris += lfilter(bb, aa, self.rng.normal(0, 1, len(tr))) * (tr / d) ** 3 * 0.35
        self.add(ris, t_end - d, 0.5, vol)

    def beat(self, bpm, level, t0=0.0, t1=DUR - 0.3):
        """level(t) -> 0..1 intensity"""
        step = 60 / bpm / 2
        tt, k = t0, 0
        while tt < t1:
            lv = level(tt)
            g = 0.15 + 0.4 * lv
            if k % 2 == 0:
                self.add(self.kick, tt, 0.5, g * 1.6)
            else:
                self.add(self.hat, tt, 0.5, g * 0.5)
            if lv > 0.4:
                self.add(self.hat, tt + step / 2, 0.6 if k % 2 else 0.4, g * 0.3)
            tt += step; k += 1

    def save(self, path, gain=1.3):
        n = int(DUR * SR)
        out = np.tanh(np.stack([self.L[:n], self.R[:n]], 1) * gain) * 0.92
        fade = int(0.3 * SR)
        out[-fade:] *= np.linspace(1, 0, fade)[:, None]
        wavfile.write(path, SR, (out * 32767).astype(np.int16))
