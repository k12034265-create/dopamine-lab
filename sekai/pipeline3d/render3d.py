# 3D版レンダラー: EP=<episode> python3 render3d.py [ids|all] [--snap t1,t2]
import sys, asyncio, subprocess, os, time, threading, http.server, functools
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'pipeline'))
from playwright.async_api import async_playwright
from common import W, EP
from timeline import build
TL = build(); FPS = 30
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))  # sekai/
OUT = f'{W}/clips3d'; os.makedirs(OUT, exist_ok=True)
PORT = int(os.environ.get('PORT', '8790'))

def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    h.log_message = lambda *a: None
    http.server.ThreadingHTTPServer(('127.0.0.1', PORT), h).serve_forever()

def subat(sc, t):
    for a, b, x in sc['subs']:
        if a <= t < b + 0.15: return x
    return None

async def main(ids, snaps):
    threading.Thread(target=serve, daemon=True).start()
    rel = os.path.relpath(EP, ROOT)
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 1920, 'height': 1080})
        pg.on('pageerror', lambda e: print('PAGEERROR', e, flush=True))
        sf = os.environ.get('SCENES', f'/{rel}/scenes3d.js')
        await pg.goto(f'http://127.0.0.1:{PORT}/pipeline3d/page.html?scenes={sf}')
        await pg.wait_for_function('window.READY===true', timeout=120000)
        for i in ids:
            sc = TL[i]
            if snaps:
                for t in snaps:
                    await pg.evaluate('([i,t,d,s,f])=>FRAME(i,t,d,s,f)', [i, t, sc['dur'], subat(sc, t), int(t * FPS)])
                    await pg.screenshot(path=f'{OUT}/snap_{i:02d}_{t}.jpg', type='jpeg', quality=90)
                print('snap', i, flush=True); continue
            fn = f'{OUT}/c{i:02d}.mp4'
            if os.path.exists(fn): continue
            tmp = f'{OUT}/tmp_c{i:02d}.mp4'
            ff = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                                   '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', str(FPS), tmp], stdin=subprocess.PIPE)
            t0 = time.time()
            for k in range(sc['frames']):
                t = k / FPS
                await pg.evaluate('([i,t,d,s,f])=>FRAME(i,t,d,s,f)', [i, t, sc['dur'], subat(sc, t), k])
                ff.stdin.write(await pg.screenshot(type='jpeg', quality=92))
                if k % 60 == 0: print(i, k, sc['frames'], round(time.time() - t0, 1), flush=True)
            ff.stdin.close(); rc = ff.wait()
            if rc == 0: os.rename(tmp, fn)
            print('done', i, sc['frames'], round(time.time() - t0, 1), flush=True)
        await b.close()

args = sys.argv[1:]
snaps = None
if '--snap' in args:
    j = args.index('--snap'); snaps = [float(x) for x in args[j + 1].split(',')]; args = args[:j] + args[j + 2:]
ids = list(range(len(TL))) if not args or args[0] == 'all' else [int(x) for x in args[0].split(',')]
asyncio.run(main(ids, snaps))
