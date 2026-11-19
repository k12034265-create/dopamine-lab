import sys, asyncio, json
from playwright.async_api import async_playwright
from common import W, EP, PIPE
from timeline import build
TL=build()
def subat(sc,t):
    for a,b,x in sc['subs']:
        if a<=t<b+0.15: return x
    return None
async def main(pairs,out):
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1920,'height':1080})
        await pg.goto(f'file://{PIPE}/page.html'); await pg.add_script_tag(path=f'{EP}/scenes.js')
        for i,t in pairs:
            sc=TL[i]; await pg.evaluate('([i,t,d,s])=>FRAME(i,t,d,s)',[i,t,sc['dur'],subat(sc,t)])
            await pg.screenshot(path=f'{out}/s{i+1:02d}_{t:.1f}.jpg',type='jpeg',quality=85)
        await b.close()
pairs=[(int(a)-1,float(b)) for a,b in (x.split(':') for x in sys.argv[2:])]
asyncio.run(main(pairs,sys.argv[1]))
