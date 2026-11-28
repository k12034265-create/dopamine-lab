# 説明書風レンダラー: EP=<episode> SCENES=/episodes/NN/filmNN.js python3 render.py [ids|all] [--snap t1,t2|p15,p45,p85]
import sys, asyncio, subprocess, os, time, threading, http.server, functools
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'pipeline'))
from playwright.async_api import async_playwright
from common import W, EP
from timeline import build
TL = build(); FPS = 30
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
OUT = os.environ.get('OUTDIR', f'{W}/clips'); os.makedirs(OUT, exist_ok=True)
PORT = int(os.environ.get('PORT', '8795'))
def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT); h.log_message = lambda *a: None
    http.server.ThreadingHTTPServer(('127.0.0.1', PORT), h).serve_forever()
def chap(sc):
    p = sc['part']; return '' if p == 'プロローグ' else p.replace('：', '　')
async def main(ids, snaps):
    threading.Thread(target=serve, daemon=True).start()
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1920, 'height': 1080})
        pg.on('pageerror', lambda e: print('PAGEERROR', e, flush=True))
        await pg.goto(f'http://127.0.0.1:{PORT}/manualkit/page.html?scenes={os.environ["SCENES"]}')
        await pg.wait_for_function('window.READY===true', timeout=60000)
        async def fr(i, t):
            sc = TL[i]; r = await pg.evaluate('([i,t,d,s,c])=>FRAME(i,t,d,s,c)', [i, t, sc['dur'], [list(x) for x in sc['subs']], chap(sc)])
            if r != 'ok': print('scene', i, 't', t, r, flush=True)
        for i in ids:
            sc = TL[i]
            if snaps:
                for s in snaps:
                    t = sc['dur'] * float(s[1:]) / 100 if s.startswith('p') else float(s)
                    await fr(i, t); await pg.screenshot(path=f'{OUT}/snap_{i:02d}_{s}.jpg', type='jpeg', quality=88)
                continue
            fn = f'{OUT}/c{i:02d}.mp4'; tmp = f'{OUT}/tmp_c{i:02d}.mp4'
            ff = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', str(FPS), tmp], stdin=subprocess.PIPE)
            t0 = time.time()
            for k in range(sc['frames']):
                await fr(i, k / FPS); ff.stdin.write(await pg.screenshot(type='jpeg', quality=92))
            ff.stdin.close()
            if ff.wait() == 0: os.replace(tmp, fn)
            cues = await pg.evaluate('(i)=>Object.values(window.__SFX[i]||{})', i)
            if i > 0 and TL[i - 1]['part'] != sc['part']: cues.append({'t': 0.15, 'type': 'chime'})
            import json as _j; open(f'{OUT}/sfx_c{i:02d}.json', 'w').write(_j.dumps(cues)); print('done', i, sc['frames'], round(time.time() - t0, 1), flush=True)
        await b.close()
args = sys.argv[1:]; snaps = None
if '--snap' in args: j = args.index('--snap'); snaps = args[j + 1].split(','); args = args[:j] + args[j + 2:]
ids = list(range(len(TL))) if not args or args[0] == 'all' else [int(x) for x in args[0].split(',')]
asyncio.run(main(ids, snaps))
