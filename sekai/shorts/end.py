# ショートの最後に「チャンネルへ誘導する締め」を足す（KOH指定 2026-11-25）。
# 使い方: python3 end.py 元のショート.mp4 本編サムネ.jpg 出力.mp4
# 画面: 上「続きは本編で」、中央に本編サムネ、下に「▶ 世界のネタバレ」と「チャンネルの動画一覧から」
# 声: 青山龍星「続きは本編で。チャンネル『世界のネタバレ』で、全部ネタバレしてます。」
import sys, os, subprocess, wave
from playwright.sync_api import sync_playwright
src, thumb, out = sys.argv[1:4]
H = os.path.dirname(os.path.abspath(__file__))
VO = f'{H}/end_vo.wav'
if not os.path.exists(VO):
    from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile
    B = '/home/claude/vv'
    ort = Onnxruntime.load_once(filename=f"{B}/voicevox_onnxruntime-linux-x64-1.17.3/lib/libvoicevox_onnxruntime.so.1.17.3")
    syn = Synthesizer(ort, OpenJtalk(f"{B}/open_jtalk_dic_utf_8-1.11"))
    with VoiceModelFile.open(f"{B}/vvms/15.vvm") as m: syn.load_voice_model(m)
    q = syn.create_audio_query("続きは本編で。チャンネル、世界のネタバレで、全部ネタバレしてます。", 13); q.speed_scale = 1.1
    open(VO, 'wb').write(syn.synthesis(q, 13))
with wave.open(VO) as w: vd = w.getnframes() / w.getframerate()
D = round(vd + 0.6, 2)   # 声のあと0.6秒残す
card = out.replace('.mp4', '_end.png')
html = f'''<html><head><meta charset="utf-8"></head><body style="margin:0;width:1080px;height:1920px;background:#15141a;font-family:'Noto Sans CJK JP';font-weight:900;color:#fff">
<style>.g{{background:linear-gradient(180deg,#fff7c2 0%,#ffd84a 45%,#e0a100 55%,#ffe27a 100%);-webkit-background-clip:text;color:transparent}}</style>
<div style="position:absolute;top:330px;width:1080px;text-align:center;font-size:120px" class="g">続きは本編で</div>
<img src="file://{os.path.abspath(thumb)}" style="position:absolute;top:620px;left:60px;width:960px;height:540px;border-radius:24px;box-shadow:0 20px 60px #000">
<div style="position:absolute;top:1290px;left:140px;width:800px;height:150px;border-radius:75px;background:#e0453a;text-align:center;line-height:150px;font-size:66px">▶ 世界のネタバレ</div>
<div style="position:absolute;top:1500px;width:1080px;text-align:center;font-size:46px;color:#bbb">チャンネルの動画一覧から</div>
</body></html>'''
hp = out.replace('.mp4', '_end.html'); open(hp, 'w').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    pg.goto('file://' + os.path.abspath(hp)); pg.wait_for_timeout(800); pg.screenshot(path=card); b.close()
tmp = out.replace('.mp4', '_tmp.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-loop', '1', '-framerate', '30', '-t', str(D), '-i', card, '-i', VO,
  '-filter_complex',
  f'[0:v]fps=30,format=yuv420p,setsar=1[a];[1:v]format=yuv420p,setsar=1,fade=t=in:d=0.25[c];'
  f'[0:a]aresample=48000,aformat=channel_layouts=stereo[x];[2:a]volume=7dB,alimiter=limit=0.89:level=false,aresample=48000,aformat=channel_layouts=stereo,adelay=150|150,apad=whole_dur={D}[y];'
  f'[a][x][c][y]concat=n=2:v=1:a=1[v][o]',
  '-map', '[v]', '-map', '[o]', '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '192k', tmp], check=True)
os.replace(tmp, out)
print('ok', out, D)
