"""Original procedural pictures for reveal-type videos. pic(name, w, h) -> float32 (h,w,3) RGB in 0..1"""
import numpy as np, colorsys

TITLES = {'sunset': '夕焼けの海', 'stars': '星空', 'fireworks': '花火', 'fuji': '富士山', 'snowman': '雪だるま', 'tulips': 'チューリップ畑', 'wave': '大波と富士'}


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
    elif name == 'snowman':
        top = np.array([0.04, 0.07, 0.25]); bot = np.array([0.18, 0.3, 0.6])
        img[:] = top + (bot - top) * np.clip(v / 0.8, 0, 1)[..., None]
        # moon top-left
        dm = np.hypot((u - 0.18) * w, (v - 0.1) * h) / w
        img[dm < 0.1] = (1.0, 0.88, 0.45)
        # falling snow
        n = max(4, int(w * h * 0.03))
        sx, sy = rng.integers(0, w, n), rng.integers(0, int(h * 0.8), n)
        for x, y in zip(sx, sy):
            img[y, x] = (0.75, 0.82, 0.95)
        ar = h / w
        # ground
        gnd = v > 0.82 - 0.03 * np.sin(u * 5)
        img[gnd] = (0.78, 0.84, 0.95)
        img[gnd & (v > 0.92)] = (0.62, 0.72, 0.9)
        # arms (sticks)
        for sgn in (-1, 1):
            arm = (np.abs((v - 0.6) + 0.55 * sgn * (u - 0.5) / ar * ar * 0.9 + 0.0) < 0.018 * ar) & (np.abs(u - 0.5) > 0.22) & (np.abs(u - 0.5) < 0.44) & (v < 0.62) & (v > 0.42)
            img[arm] = (0.45, 0.28, 0.12)
        snow = np.array([0.9, 0.93, 0.98]); shade = np.array([0.65, 0.74, 0.92])
        def ball(cx, cy, r):
            d = np.hypot(u - cx, (v - cy) * ar)
            m = d < r
            # light from upper-left: right/bottom side shaded
            sh = ((u - cx) * 0.7 + (v - cy) * ar * 0.7) / r > 0.45
            img[m] = snow; img[m & sh] = shade
            return m
        ball(0.5, 0.72, 0.29)
        ball(0.5, 0.45, 0.2)
        hy = 0.45 - 0.2 / ar
        # hat
        img[(np.abs(u - 0.5) < 0.17) & (v > hy - 0.03) & (v < hy + 0.01)] = (0.12, 0.1, 0.16)
        img[(np.abs(u - 0.5) < 0.11) & (v > hy - 0.15) & (v <= hy - 0.03)] = (0.12, 0.1, 0.16)
        img[(np.abs(u - 0.5) < 0.11) & (v > hy - 0.06) & (v <= hy - 0.03)] = (0.85, 0.15, 0.2)
        # eyes, carrot nose
        for ex in (0.42, 0.58):
            img[(np.abs(u - ex) < 0.035) & (np.abs(v - 0.42) < 0.02)] = (0.08, 0.08, 0.12)
        img[(u > 0.5) & (u < 0.64) & (np.abs(v - 0.475) < 0.022 * (1 - (u - 0.5) / 0.16) + 0.006)] = (1.0, 0.5, 0.1)
        # scarf
        ny = 0.45 + 0.2 / ar
        img[(np.abs(u - 0.5) < 0.2) & (np.abs(v - ny) < 0.028)] = (0.9, 0.15, 0.2)
        img[(u > 0.54) & (u < 0.63) & (v > ny) & (v < ny + 0.12)] = (0.9, 0.15, 0.2)
        # buttons
        for by in (0.66, 0.74, 0.82):
            img[(np.abs(u - 0.5) < 0.035) & (np.abs(v - by) < 0.018)] = (0.15, 0.12, 0.18)
    elif name == 'tulips':
        ar = h / w
        top = np.array([0.18, 0.42, 0.85]); bot = np.array([0.55, 0.75, 0.95])
        img[:] = top + (bot - top) * np.clip(v / 0.45, 0, 1)[..., None]
        ds = np.hypot((u - 0.22) * w, (v - 0.12) * h) / w
        img[ds < 0.09] = (1.0, 0.82, 0.25)
        for cx, cy, r in ((0.68, 0.16, 0.07), (0.78, 0.15, 0.06), (0.73, 0.12, 0.06)):
            img[np.hypot(u - cx, (v - cy) * ar) < r] = (0.92, 0.94, 0.98)
        # hills
        img[v > 0.42 + 0.04 * np.sin(u * 4 + 1)] = (0.3, 0.6, 0.3)
        img[v > 0.47 + 0.03 * np.sin(u * 6)] = (0.22, 0.5, 0.25)
        # flower rows in the distance
        rowcols = [(0.95, 0.25, 0.3), (1.0, 0.8, 0.2), (0.95, 0.45, 0.7), (0.65, 0.35, 0.85), (1.0, 0.55, 0.2)]
        for k in range(5):
            y0 = 0.5 + k * 0.045
            band = (v > y0) & (v < y0 + 0.022 + k * 0.004) & ((np.floor(u * (40 - k * 5)) % 2) == 0)
            img[band] = rowcols[k]
        img[v > 0.74] = (0.18, 0.42, 0.2)
        # big tulips in front
        cols = [(0.95, 0.2, 0.25), (1.0, 0.78, 0.15), (0.95, 0.4, 0.68), (0.95, 0.2, 0.25), (0.6, 0.3, 0.85)]
        for k, cx in enumerate((0.12, 0.31, 0.5, 0.69, 0.88)):
            cy = 0.76 + (0.03 if k % 2 else 0.0)
            img[(np.abs(u - cx) < 0.018) & (v > cy) & (v < 1.0)] = (0.15, 0.55, 0.2)
            leaf = (np.abs((u - cx) - 0.6 * (v - 0.92) * (1 if k % 2 else -1) / ar * 0) < 0.06 * (1 - np.abs(v - 0.9) / 0.06)) & (np.abs(v - 0.9) < 0.06) & (np.abs(u - cx) > 0.015)
            img[leaf] = (0.2, 0.62, 0.25)
            head = (((u - cx) / 0.075) ** 2 + ((v - (cy - 0.05)) / 0.05) ** 2 < 1) & (v > cy - 0.075) | ((np.abs(u - cx) < 0.072) & (v > cy - 0.08) & (v <= cy - 0.05))
            img[head] = cols[k]
            for px in (-0.05, 0.0, 0.05):
                tip = (np.abs(u - (cx + px)) < 0.022 * np.clip((v - (cy - 0.11)) / 0.035, 0, 1)) & (v > cy - 0.11) & (v <= cy - 0.075)
                img[tip] = cols[k]
            img[head & (u > cx + 0.035)] = np.array(cols[k]) * 0.78
    elif name == 'wave':
        # 大波と富士（北斎の大波風の自作構図）
        ar = h / w
        X = u; Y = v * ar
        top = np.array([0.80, 0.62, 0.38]); bot = np.array([0.90, 0.76, 0.52])
        img[:] = top + (bot - top) * np.clip(v / 0.75, 0, 1)[..., None]
        sl = 0.80 * ar
        # far Fuji (right, small)
        fx = 0.84
        fuji = (Y < sl) & (Y > sl - 0.15) & (np.abs(X - fx) < (Y - (sl - 0.15)) * 1.5 + 0.01)
        img[fuji] = (0.25, 0.32, 0.52)
        img[fuji & (Y < sl - 0.10)] = (0.97, 0.97, 0.95)
        # sea with small waves
        img[Y > sl + 0.012 * np.sin(X * 25)] = (0.12, 0.22, 0.45)
        for cx in (0.70, 0.90):
            d = np.hypot(X - cx, Y - (sl + 0.07)); r = 0.08
            img[(d < r) & (Y < sl + 0.07)] = (0.18, 0.32, 0.6)
            img[(np.abs(d - r) < 0.012) & (Y < sl + 0.05)] = (0.97, 0.97, 0.93)
        # big wave: outer disc minus curl
        c1x, c1y, r1 = 0.36, 0.60 * ar, 0.42
        c2x, c2y, r2 = 0.50, 0.58 * ar, 0.21
        d1 = np.hypot(X - c1x, Y - c1y); d2 = np.hypot(X - c2x, Y - c2y)
        curl = (d2 < r2) & (Y < c2y + r2 * 0.4)
        body = ((d1 < r1) | ((Y > c1y) & (X < c1x + r1))) & ~curl
        img[body] = (0.10, 0.20, 0.48)
        img[body & (np.sin(d1 * 80) > 0.25)] = (0.22, 0.40, 0.70)
        # foam crest with claws on the outer rim
        ang = np.arctan2(Y - c1y, X - c1x)
        claw = 0.03 * (np.sin(ang * 36) > 0)
        rim = body & (d1 > r1 - 0.04 - claw) & (ang > -2.5) & (ang < 0.15)
        img[rim] = (0.97, 0.97, 0.93)
        # spray drops inside the curl
        for k in range(12):
            px = c2x - 0.05 + 0.18 * rng.random(); py = c2y - r2 + 0.15 * rng.random()
            img[np.hypot(X - px, Y - py) < 0.011] = (0.97, 0.97, 0.93)
    return np.clip(img, 0, 1)
