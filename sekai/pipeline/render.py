import sys, asyncio, subprocess, os, time
from playwright.async_api import async_playwright
from common import W, EP, PIPE
from timeline import build
TL=build(); FPS=30
OUT=f'{W}/clips'; os.makedirs(OUT,exist_ok=True)
def subat(sc,t):
    for a,b,x in sc['subs']:
        if a<=t<b+0.15: return x
    return None
async def main(ids):
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1920,'height':1080})
        await pg.goto(f'file://{PIPE}/page.html'); await pg.add_script_tag(path=f'{EP}/scenes.js')
        for i in ids:
            fn=f'{OUT}/c{i:02d}.mp4'
            if os.path.exists(fn): continue
            sc=TL[i]; tmp=f'{OUT}/tmp_c{i:02d}.mp4'
            ff=subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','image2pipe','-framerate',str(FPS),'-c:v','mjpeg','-i','-',
               '-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-r',str(FPS),tmp],stdin=subprocess.PIPE)
            t0=time.time()
            for k in range(sc['frames']):
                t=k/FPS
                await pg.evaluate('([i,t,d,s])=>FRAME(i,t,d,s)',[i,t,sc['dur'],subat(sc,t)])
                ff.stdin.write(await pg.screenshot(type='jpeg',quality=90))
            ff.stdin.close(); rc=ff.wait()
            if rc==0: os.rename(tmp,fn)
            print(i, sc['frames'], round(time.time()-t0,1), flush=True)
        await b.close()
ids=list(range(len(TL))) if len(sys.argv)<2 or sys.argv[1]=='all' else [int(x) for x in sys.argv[1].split(',')]
asyncio.run(main(ids))
