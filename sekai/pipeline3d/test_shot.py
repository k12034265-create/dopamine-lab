import asyncio, time, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
        pg=await b.new_page(viewport={'width':1920,'height':1080})
        pg.on('console', lambda m: print('console:',m.text))
        await pg.goto('http://127.0.0.1:8765/scene.html'); await pg.wait_for_function('window.READY===true',timeout=60000)
        for t in [0,6]:
            t0=time.time(); await pg.evaluate(f'renderAt({t})'); await pg.screenshot(path=f'f{t}.jpg',quality=90,type='jpeg'); print(t, round(time.time()-t0,2),'s')
        await b.close()
asyncio.run(main())
