import asyncio, json, sys, os
sys.path.insert(0,'/home/claude/dopamine-lab/sekai/pipeline'); os.environ['EP']='/home/claude/dopamine-lab/sekai/episodes/03_kiss'
os.chdir('/home/claude/dopamine-lab/sekai/pipeline'); from timeline import build; TL=build(); os.chdir('/home/claude/dl/px')
from playwright.async_api import async_playwright
css=open('/home/claude/dopamine-lab/sekai/pipeline3d/page.html').read().split('<style>')[1].split('</style>')[0].replace('background:#000','background:transparent')
def wrap(s):
    if len(s)<=30: return s
    mid=len(s)//2;best=-1
    for d in range(14):
        for k in (mid+d,mid-d):
            if 0<=k<len(s) and s[k] in '、，': best=k;break
        if best>=0: break
    if best<0: best=mid
    return s[:best+1]+'<br>'+s[best+1:]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1920,'height':1080})
        out=[]
        for i in (44,48):
            for k,(a,e,x) in enumerate(TL[i]['subs']):
                await pg.set_content(f'<html><head><meta charset=utf-8><style>{css}</style></head><body><div id=ov><div class=sub>{wrap(x)}</div></div></body></html>')
                await pg.wait_for_timeout(200)
                fn=f'sub/s{i}_{k}.png'; await pg.screenshot(path=fn,omit_background=True); out.append((i,k,a,e,fn))
        json.dump(out,open('subs.json','w')); await b.close()
asyncio.run(main())
