"""Original procedural pictures for reveal-type videos. pic(name, w, h) -> float32 (h,w,3) RGB in 0..1"""
import numpy as np, colorsys

TITLES = {'sunset': '夕焼けの海', 'stars': '星空', 'fireworks': '花火', 'fuji': '富士山'}


def _hsv(h, s, v):
    return np.array(colorsys.hsv_to_rgb(h % 1, s, v), np.float32)


def pic(name, w, h, seed=0):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    u = (xx + 0.5) / w; v = (yy + 0.5) / h
    img = np.zeros((h, w, 3), np.float32)
    if name == 'sunset':
        for y in range(h):
            vv = (y + 0.5) / h
            img[y] = colorsys.hsv_to_rgb((0.74 + 0.36 * (vv / 0.55) ** 1.3) % 1, 0.75, 0.55 + 0.45 * min(1, vv / 0.55)) if vv < 0.55 else colorsys.hsv_to_rgb(0.6, 0.8, 0.45 - 0.25 * (vv - 0.55) / 0.45)
        d = np.hypot((u - 0.5) * w, (v - 0.47) * h) / max(w, h)
        img[(d < 0.13) & (v < 0.55)] = (1.0, 0.8, 0.35)
        refl = (v >= 0.55) & (np.abs(u - 0.5) < 0.25 * (1 - (v - 0.55) / 0.45)) & ((yy.astype(int) % 3) != 0)
        img[refl] = (1.0, 0.65, 0.3)
        hm = 0.55 - (0.08 + 0.06 * np.sin(u * 15) + 0.04 * np.sin(u * 5 + 1)) * np.where((u < 0.32) | (u > 0.68), 1, 0.25)
        img[(v > hm) & (v < 0.55)] = (0.12, 0.08, 0.2)
    elif name == 'stars':
        top = np.array([0.03, 0.03, 0.12]); bot = np.array([0.12, 0.08, 0.35])
        img[:] = top + (bot - top) * v[..., None]
        # milky band
        band = np.exp(-((v - (0.15 + 0.5 * u)) ** 2) / 0.006)
        img += band[..., None] * np.array([0.25, 0.18, 0.4])
        n = int(w * h * 0.025)
        sx, sy = rng.integers(0, w, n), rng.integers(0, int(h * 0.75), n)
        b = rng.uniform(0.6, 1.0, n)
        for x, y, bb in zip(sx, sy, b):
            img[y, x] = (bb, bb, min(1, bb + 0.1))
        # crescent moon
        d1 = np.hypot((u - 0.75) * w, (v - 0.16) * h) / w
        d2 = np.hypot((u - 0.79) * w, (v - 0.14) * h) / w
        img[(d1 < 0.09) & (d2 > 0.085)] = (1.0, 0.95, 0.7)
        # hills + tiny house with lit window
        hill = 0.78 - 0.06 * np.sin(u * 6 + 0.5) - 0.03 * np.sin(u * 17)
        img[v > hill] = (0.04, 0.06, 0.1)
        hx = (u > 0.2) & (u < 0.32) & (v > 0.72) & (v < 0.8)
        img[hx] = (0.1, 0.08, 0.12)
        img[(u > 0.24) & (u < 0.28) & (v > 0.745) & (v < 0.77)] = (1.0, 0.8, 0.3)
    elif name == 'fireworks':
        img[:] = np.array([0.02, 0.02, 0.08]) + np.array([0.08, 0.03, 0.15]) * v[..., None]
        bursts = [(0.3, 0.25, 0.2, 0.95), (0.7, 0.2, 0.17, 0.55), (0.52, 0.45, 0.22, 0.12), (0.2, 0.55, 0.13, 0.33), (0.82, 0.48, 0.14, 0.78)]
        for bx, by, br, hue in bursts:
            dx = (u - bx) * w; dy = (v - by) * h; r = np.hypot(dx, dy) / w
            ang = np.arctan2(dy, dx)
            rays = (np.cos(ang * 18) > 0.55) & (r < br) & (r > br * 0.15)
            ring = np.abs(r - br * 0.9) < br * 0.07
            m = rays | ring
            img[m] = _hsv(hue, 0.7, 1.0)
            img[r < br * 0.12] = _hsv(hue, 0.3, 1.0)
        # city skyline
        sky = np.zeros(w)
        x = 0
        while x < w:
            bw = rng.integers(max(2, w // 22), max(3, w // 9)); bh = rng.uniform(0.08, 0.22)
            sky[x:x + bw] = bh; x += bw
        img[v > 1 - sky[None, :]] = (0.06, 0.05, 0.1)
        win = (v > 1 - sky[None, :] + 0.02) & ((xx.astype(int) % 3) == 1) & ((yy.astype(int) % 4) == 1)
        img[win] = (0.9, 0.75, 0.35)
    elif name == 'fuji':
        top = np.array([0.25, 0.55, 0.95]); bot = np.array([0.75, 0.88, 1.0])
        img[:] = top + (bot - top) * np.clip(v / 0.6, 0, 1)[..., None]
        d = np.hypot((u - 0.78) * w, (v - 0.14) * h) / w
        img[d < 0.07] = (1.0, 0.75, 0.3)
        peak = 0.28
        slope = np.abs(u - 0.5) * 1.1
        mtn = v > peak + slope ** 1.15
        img[mtn] = (0.25, 0.32, 0.55)
        img[mtn & (v < peak + 0.12) & (v < peak + slope ** 1.15 + 0.06 + 0.03 * np.sin(u * 60))] = (0.97, 0.97, 1.0)
        img[v > 0.74] = (0.2, 0.45, 0.25)
        lake = v > 0.82
        img[lake] = (0.2, 0.4, 0.75)
        img[lake & ((yy.astype(int) % 3) == 0)] = (0.4, 0.6, 0.9)
    return np.clip(img, 0, 1)
