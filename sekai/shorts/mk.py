# 本編の一部を縦型ショート（1080x1920）にする。上に問いかけ、中央に本編の映像、下に「続きは本編」
import sys, os, subprocess
from playwright.sync_api import sync_playwright
name, src, ss, dur, top1, top2, bottom = sys.argv[1:8]
html = f'''<html><head><meta charset="utf-8"></head><body style="margin:0;width:1080px;height:1920px;background:transparent;font-family:'Noto Sans CJK JP';font-weight:900;color:#fff">
<style>.s{{filter:drop-shadow(0 0 2px #000) drop-shadow(4px 6px 0 #000)}} .g{{background:linear-gradient(180deg,#fff7c2 0%,#ffd84a 45%,#e0a100 55%,#ffe27a 100%);-webkit-background-clip:text;color:transparent}}</style>
<div style="position:absolute;top:0;left:0;width:1080px;height:600px;background:#15141a"></div>
<div style="position:absolute;top:1228px;left:0;width:1080px;height:692px;background:#15141a"></div>
<div class="s" style="position:absolute;top:150px;width:1080px;text-align:center;font-size:96px;line-height:1.25">{top1}<br><span class="g" style="font-size:120px">{top2}</span></div>
<div style="position:absolute;top:1330px;width:1080px;text-align:center;font-size:52px;line-height:1.5;color:#ddd">{bottom}</div>
<div style="position:absolute;top:1560px;left:190px;width:700px;height:120px;border-radius:60px;background:#e0453a;text-align:center;line-height:120px;font-size:50px">続きは本編で ▶</div>
<div style="position:absolute;top:1740px;width:1080px;text-align:center;font-size:36px;color:#999">世界のネタバレ</div>
</body></html>'''
open(f'{name}.html', 'w').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    pg.goto('file://' + os.path.abspath(f'{name}.html')); pg.wait_for_timeout(600)
    pg.screenshot(path=f'{name}_ov.png', omit_background=True); b.close()
d = float(dur)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', ss, '-t', dur, '-i', src, '-i', f'{name}_ov.png',
  '-filter_complex', f'color=c=#15141a:s=1080x1920:r=30:d={d}[bg];[0:v]scale=1080:608[v];[bg][v]overlay=0:620[a];[a][1:v]overlay=0:0,format=yuv420p[o]',
  '-map', '[o]', '-map', '0:a', '-af', f'afade=t=in:d=0.3,afade=t=out:st={d - 1.0}:d=1.0', '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '192k', '-shortest', f'{name}.mp4'], check=True)
print('ok', name)
