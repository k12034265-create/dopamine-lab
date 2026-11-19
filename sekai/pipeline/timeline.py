import json
from common import W
import script as d
FPS=30
def build():
    du=json.load(open(f'{W}/audio/durations.json'))
    sc=d.SCENES; out=[]; cum=0.0
    for i,(s,a) in enumerate(zip(sc,du)):
        gap=1.5 if i==len(sc)-1 else (1.5 if sc[i+1][0]!=s[0] else 0.4)
        start=cum; cum+=a+gap
        f0=round(start*FPS); f1=round(cum*FPS)
        sents=[x+'。' for x in s[1].split('。') if x]
        tot=sum(len(x) for x in sents); subs=[]; t=0
        for x in sents:
            L=a*len(x)/tot; subs.append((t,t+L,x)); t+=L
        out.append(dict(i=i,part=s[0],frames=f1-f0,start=f0/FPS,dur=(f1-f0)/FPS,audio=a,subs=subs))
    return out
def chapters():
    """概要欄タイムスタンプ用：パートの開始時刻"""
    res=[]; last=None
    for x in build():
        if x['part']!=last: res.append((x['start'],x['part'])); last=x['part']
    return [f"{int(t//60):02d}:{int(t%60):02d} - {p}" for t,p in res]
if __name__=='__main__':
    tl=build(); print(len(tl), round(sum(x['frames'] for x in tl)/FPS,2),'s'); print('\n'.join(chapters()))
