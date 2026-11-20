# 完成動画の採点：python3 qa.py video.mp4 [out_dir]
# 明るさ（1秒ごとの平均輝度、140超＝白飛び注意）、止まっている秒の割合、音量（LUFS・ピーク）、黒味、コンタクトシート
import subprocess, sys, json, os, re, numpy as np
from PIL import Image
v = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(v) + '/qa'; os.makedirs(out, exist_ok=True)
# 1秒1枚、160x90 のグレー
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', v, '-vf', 'fps=2,scale=160:90,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 90, 160).astype(np.float32)
lum = fr.mean((1, 2)); n = len(fr)
diff = np.abs(np.diff(fr, axis=0)).mean((1, 2))
still = (diff < 0.35).mean() * 100
long_still = 0; run = 0
for d in diff:
    run = run + 1 if d < 0.35 else 0; long_still = max(long_still, run)
bright = [i / 2 for i, x in enumerate(lum) if x > 140]
dark = [i / 2 for i, x in enumerate(lum) if x < 8]
er = subprocess.run(['ffmpeg', '-v', 'info', '-i', v, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', er); TP = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', er); LRA = re.findall(r'LRA:\s+(-?[\d.]+) LU', er)
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v], capture_output=True, text=True).stdout)
size = os.path.getsize(v) / 1e6
# コンタクトシート（20秒ごと）
ts = np.arange(5, dur - 2, 20); tiles = []
for t in ts:
    p = f'{out}/f_{int(t):04d}.jpg'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', v, '-frames:v', '1', '-vf', 'scale=384:216', p])
    if os.path.exists(p): tiles.append(Image.open(p))
cols = 5; rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (384 * cols, 216 * rows))
for k, im in enumerate(tiles): sheet.paste(im, ((k % cols) * 384, (k // cols) * 216))
sheet.save(f'{out}/contact.jpg', quality=82)
rep = dict(長さ秒=round(dur, 1), サイズMB=round(size, 1), 平均輝度=round(float(lum.mean()), 1), 最大輝度=round(float(lum.max()), 1),
           白飛び注意の秒=bright[:20], 真っ黒の秒数=len(dark) / 2, 止まっている割合pct=round(still, 1), 最長静止秒=long_still / 2,
           音量LUFS=float(I[-1]) if I else None, ピークdBFS=float(TP[-1]) if TP else None, LRA=float(LRA[-1]) if LRA else None)
# 採点（100点満点）：白飛び0・静止20%未満・最長静止4秒以下・-14±1 LUFS・ピーク-1以下・100MB未満
sc = 100
sc -= min(30, len(bright) * 3)
sc -= max(0, min(20, (still - 20)))
sc -= max(0, min(15, (long_still / 2 - 4) * 3))
if rep['音量LUFS'] is not None: sc -= min(15, abs(rep['音量LUFS'] + 14) * 5)
if rep['ピークdBFS'] is not None and rep['ピークdBFS'] > -1: sc -= 10
if size >= 100: sc -= 10
rep['点数'] = round(max(0, sc))
json.dump(rep, open(f'{out}/qa.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps(rep, ensure_ascii=False, indent=1))
