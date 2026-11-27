import sys; sys.path.insert(0,'..')
from picto import front
HEAD='<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../base2.css"></head><body>'
R=lambda s:f'<span class="r">{s}</span>'
sv='<defs><radialGradient id="bg" cx="75%" cy="60%" r="75%"><stop offset="0" stop-color="#2a2232"/><stop offset="1" stop-color="#08070b"/></radialGradient><filter id="gl"><feGaussianBlur stdDeviation="6"/></filter></defs><rect width="1280" height="720" fill="url(#bg)"/>'
for i in range(0,64):
    y=630-i*10; big=i%10==0
    sv+=f'<path d="M1240,{y} h{-40 if big else -20}" stroke="rgba(255,240,210,{.5 if big else .22})" stroke-width="{4 if big else 2}"/>'
floor=630; L=floor-226
sv+=f'<rect x="760" y="{floor}" width="520" height="8" rx="4" fill="#4a4450"/>'
sv+=front(900,floor,214,'#6a6474')
sv+=f'<circle cx="1090" cy="{floor-222}" r="62" fill="#ff2d3a" opacity=".22"/>'
sv+=front(1090,floor,242,'#ff2d3a')
sv+=f'<path d="M740,{L} H1270" stroke="#ff2d3a" stroke-width="16" opacity=".35" filter="url(#gl)"/><path d="M740,{L} H1270" stroke="#ff5a5a" stroke-width="6" stroke-dasharray="26 14"/>'
lab=lambda x,s,c: f'<text x="{x}" y="{floor+70}" text-anchor="middle" font-family="Noto Sans CJK JP" font-weight="900" font-size="50" fill="{c}" stroke="#000" stroke-width="10" paint-order="stroke">{s}</text>'
html=HEAD+f'<svg width="1280" height="720" style="position:absolute">{sv}{lab(900,"170cm","#d8d2ca")}{lab(1090,"？？cm","#ffd23a")}</svg>'
html+='<div class="b" style="left:36px;width:auto;text-align:left;top:40px;font-size:118px">170cmの壁は</div>'
html+=f'<div class="b" style="left:36px;width:auto;text-align:left;top:170px;font-size:150px">{R("ウソ")}だった</div>'
html+='<div class="b" style="left:36px;width:auto;text-align:left;top:350px;font-size:96px">本当の線は</div>'
html+=f'<div class="b" style="left:36px;width:auto;text-align:left;top:462px;font-size:150px">{R("何cm")}？</div></body></html>'
open('16.html','w').write(html)
