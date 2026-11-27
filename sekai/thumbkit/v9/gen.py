import re, sys
sys.path.insert(0,'..')
from picto import front
HEAD='<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../base2.css"></head><body>'
def L(s): return len(re.sub(r'<[^>]+>','',s))
def fs(s,maxw,cap): return min(cap,int(maxw/max(1,L(s))/0.97))
def textblock(lines,left=True,top=70,maxw=1180,cap=165,gap=1.08):
    out='';y=top
    for s in lines:
        f=fs(s,maxw,cap)
        st=f'left:40px;width:auto;text-align:left;' if left else ''
        out+=f'<div class="b" style="{st}top:{y}px;font-size:{f}px">{s}</div>';y+=int(f*gap)
    return out
def photo(n,bg,lines,pos='50% 50%',flip=False,grad=True,extra='',maxw=1000,top=70,filt='brightness(.9)'):
    tr='transform:scaleX(-1);' if flip else ''
    g='<div class="bg" style="background:linear-gradient(90deg,rgba(0,0,0,.85) 0%,rgba(0,0,0,.5) 45%,rgba(0,0,0,0) 72%)"></div>' if grad else ''
    open(f'{n}.html','w').write(HEAD+f'<div class="bg" style="background-image:url({bg});background-position:{pos};{tr}filter:{filt}"></div>'+g+extra+textblock(lines,maxw=maxw,top=top)+'</body></html>')
R=lambda s:f'<span class="r">{s}</span>'; Yw=lambda s:f'<span class="y">{s}</span>'
photo('02','bg02.jpg',['世界一しない国に','ラブホ'+R('3万軒')],pos='70% 50%',filt='brightness(1.15) saturate(1.3)')
photo('03','bg03.jpg',['日本人は','人前で'+R('キス'),'しない？'],flip=True,pos='30% 40%',maxw=760)
photo('04','bg04.jpg',['マスクをすると',R('美人')+'に','見える？'],pos='50% 30%',top=70,maxw=700,extra='',filt='brightness(1.05)')
photo('06','bg06.jpg',['会社の'+R('出会い'),'どこへ消えた？'],pos='60% 40%',flip=True,filt='brightness(1.3)')
photo('07','bg07.jpg',['成績は',R('親の年収'),'で決まる？'],pos='60% 50%',maxw=820)
photo('09','bg09.jpg',['手取り'+Yw('1位')+'なのに',R('残らない')+'東京'],pos='50% 50%',filt='brightness(1.3)')
photo('11','bg11.jpg',['地方は',R('車')+'がないと','詰む？'],pos='60% 50%',maxw=760,filt='brightness(.95)')
photo('14','bg14.jpg',['初任給は'+Yw('過去最高'),'なのに'+R('苦しい')+'？'],pos='50% 50%',top=60,filt='brightness(1.3)')
# 08 左右比較
ex=('<div class="bg" style="right:640px;background-image:url(bg08a.jpg);background-position:50% 40%;filter:brightness(.75) saturate(.6)"></div>'
    '<div class="bg" style="left:640px;background-image:url(bg08b.jpg);background-position:55% 30%;filter:brightness(.95)"></div>'
    '<div style="position:absolute;left:636px;top:0;width:8px;height:720px;background:#fff"></div>'
    '<div class="bg" style="background:linear-gradient(180deg,rgba(0,0,0,.8) 0%,rgba(0,0,0,.3) 45%,rgba(0,0,0,0) 60%)"></div>'
    '<div class="pill" style="left:40px;bottom:36px;background:#fff">昔：専業主婦がいい</div><div class="pill" style="right:40px;bottom:36px">今：稼ぐ妻がいい？</div>')
open('08.html','w').write(HEAD+ex+'<div class="b" style="top:40px;font-size:150px">男の'+R('本音')+'が</div><div class="b" style="top:200px;font-size:150px">逆転した</div></body></html>')
# 10 ピクト：年齢ごとに友達が減る
sv=''
groups=[('20歳',6),('30歳',4),('40歳',2),('50歳',1)]
for gi,(lab,n) in enumerate(groups):
    cx=190+gi*300
    for k in range(n):
        x=cx+(k-(n-1)/2)*44; col='#ff2d3a' if gi==3 else '#d9d4cc'
        sv+=front(x,640,130,col,skirt=(k%2==1))
    sv+=f'<text x="{cx}" y="700" fill="#aaa" font-size="40" font-family="Noto Sans CJK JP" font-weight="900" text-anchor="middle">{lab}</text>'
open('10.html','w').write(HEAD+f'<svg width="1280" height="720" style="position:absolute"><rect width="1280" height="720" fill="#0d0c10"/><path d="M60,650 H1220" stroke="#444" stroke-width="6"/>{sv}</svg><div class="b" style="top:30px;font-size:140px">大人になると</div><div class="b" style="top:175px;font-size:150px">'+R('友達')+'が消える？</div></body></html>')
# 12 卵子と精子
import random; random.seed(3); sp=''
for i in range(70):
    x=random.uniform(-40,700); y=random.uniform(380,720); a=random.uniform(-20,20)
    sp+=f'<g transform="translate({x:.0f},{y:.0f}) rotate({a:.0f})" opacity="{random.uniform(.35,.95):.2f}"><ellipse cx="0" cy="0" rx="11" ry="7" fill="#e8f1ff"/><path d="M-10,0 q-20,-10 -40,0 t-40,0" stroke="#e8f1ff" stroke-width="3" fill="none"/></g>'
open('12.html','w').write(HEAD+f'''<svg width="1280" height="720" style="position:absolute"><defs><radialGradient id="e" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe2a8"/><stop offset=".6" stop-color="#ff9a6a"/><stop offset="1" stop-color="#ff5a7a" stop-opacity="0"/></radialGradient><radialGradient id="bg" cx="80%" cy="65%" r="70%"><stop offset="0" stop-color="#3a1424"/><stop offset="1" stop-color="#08070b"/></radialGradient></defs><rect width="1280" height="720" fill="url(#bg)"/><circle cx="1030" cy="540" r="230" fill="url(#e)"/><circle cx="1030" cy="540" r="140" fill="#ffd9a0" opacity=".9"/>{sp}<g transform="translate(860,520) rotate(-5)"><ellipse rx="14" ry="9" fill="#fff"/><path d="M-13,0 q-25,-12 -50,0 t-50,0" stroke="#fff" stroke-width="4" fill="none"/></g></svg>
<div class="b" style="left:40px;width:auto;text-align:left;top:40px;font-size:110px">選ばれるのは</div><div class="b" style="left:40px;width:auto;text-align:left;top:165px;font-size:150px">{R("2億5000万")}</div><div class="b" style="left:40px;width:auto;text-align:left;top:320px;font-size:120px">分の<span class="y">1</span></div></body></html>''')
# 13 群衆の中の1人
sv=''
for r in range(4):
    for c in range(26):
        x=40+c*47+(r%2)*22; y=470+r*68; red=(r==2 and c==17)
        if red: sv+=f'<circle cx="{x}" cy="{y-45}" r="60" fill="#ff2d3a" opacity=".25"/>'
        sv+=front(x,y,82 if not red else 100,'#ff2d3a' if red else '#4a4752')
open('13.html','w').write(HEAD+f'<svg width="1280" height="720" style="position:absolute"><rect width="1280" height="720" fill="#0d0c10"/>{sv}</svg><div class="b" style="top:30px;font-size:128px">炎上を書いてるのは</div><div class="b" style="top:170px;font-size:170px">たった'+R('0.5%')+'</div></body></html>')
