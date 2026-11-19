// 02 ラブホテル  50 scenes. lt = time since element appeared, t = scene time
const CX=960, CY=470;
const chapter = (num, title) => [
  {at:0, slide:0, f:()=> txt(CX,330,num,{size:40,color:C.o,serif:true,ls:8})},
  {at:0.3, f:()=> txt(CX,470,title,{size:104,serif:true,ls:6})},
  {at:0.8, f:(lt)=> `<rect x="${CX-260*ease(lt/0.8)}" y="520" width="${520*ease(lt/0.8)}" height="3" fill="${C.gray}"/>`},
];
const CH1='第1章　世界最下位の夜', CH2='第2章　家に「場所」がない', CH3='第3章　お城と回転ベッド', CH4='第4章　家ではしない国', EPI='エピローグ';
const fmt = n => Math.round(n).toLocaleString('en-US');
const note = (x,y,s,a) => txt(x,y,s,{size:24,color:C.dim,weight:400,anchor:a||'middle'});

// ---------- charts ----------
function vbars(x,y,w,h,items,maxv,lt,o){ o=o||{}; const n=items.length, gap=o.gap||24, bw=(w-gap*(n-1))/n; let s='';
  items.forEach((it,i)=>{ const p=easeOut(clamp((lt-(o.t0||0)-i*(o.stag==null?0.15:o.stag))/0.9,0,1)); const bh=h*it.v/maxv*p; const xx=x+i*(bw+gap);
    s+=`<rect x="${xx}" y="${y+h-bh}" width="${bw}" height="${bh}" fill="${it.c||C.o}" rx="4"/>`;
    s+=txt(xx+bw/2,y+h+42,it.label,{size:o.ls||28,color:C.dim,weight:500});
    if(it.txt && p>0.5) s+=txt(xx+bw/2,y+h-bh-16,it.txt,{size:o.vs||32,color:it.c||C.o}); });
  s+=`<path d="M${x-10},${y+h} h${w+20}" stroke="${C.gray}" stroke-width="3"/>`;
  return s; }

function lineChart(x,y,w,h,pts,xr,yr,prog,o){ o=o||{}; const X=v=>x+(v-xr[0])/(xr[1]-xr[0])*w, Y=v=>y+h-(v-yr[0])/(yr[1]-yr[0])*h; let s='';
  if(!o.noAxis){ s+=`<path d="M${x},${y} L${x},${y+h} L${x+w},${y+h}" stroke="${C.gray}" stroke-width="3" fill="none"/>`;
    (o.yticks||[]).forEach(v=>{ s+=`<path d="M${x},${Y(v)} h${w}" stroke="${C.dark}" stroke-width="2"/>`+txt(x-16,Y(v)+9,v+(o.yu||''),{size:24,color:C.dim,anchor:'end',weight:500}); }); }
  const seg=(pts.length-1)*clamp(prog,0,1); let d='';
  for(let i=0;i<pts.length;i++){ if(i>Math.ceil(seg)) break; let px=X(pts[i].x), py=Y(pts[i].y);
    if(i>seg){ const f=seg-(i-1); px=X(pts[i-1].x)+(px-X(pts[i-1].x))*f; py=Y(pts[i-1].y)+(py-Y(pts[i-1].y))*f; }
    d+=(i?'L':'M')+px.toFixed(1)+','+py.toFixed(1); }
  s+=`<path d="${d}" stroke="${o.color||C.o}" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round" ${o.dash?'stroke-dasharray="16 14"':''}/>`;
  pts.forEach((p,i)=>{ if(i<=seg+0.001){ const c=p.c||o.color||C.o;
    s+=`<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="10" fill="${c}"/>`;
    if(p.label) s+=txt(X(p.x)+(p.dx||0),Y(p.y)+(p.below?56:-24),p.label,{size:p.size||36,color:c});
    if(o.xlabels!==false) s+=txt(X(p.x),y+h+40,String(p.x),{size:26,color:C.dim,weight:500}); } });
  return s; }

function donut(cx,cy,r,segs,prog,o){ o=o||{}; let s='', a0=-Math.PI/2; const tot=segs.reduce((a,b)=>a+b.v,0);
  segs.forEach(sg=>{ const da=2*Math.PI*sg.v/tot*clamp(prog,0,1)*0.999; const a1=a0+da; const large=da>Math.PI?1:0;
    if(da>0.01) s+=`<path d="M${(cx+r*Math.cos(a0)).toFixed(1)},${(cy+r*Math.sin(a0)).toFixed(1)} A${r},${r} 0 ${large} 1 ${(cx+r*Math.cos(a1)).toFixed(1)},${(cy+r*Math.sin(a1)).toFixed(1)}" stroke="${sg.c}" stroke-width="${o.sw||80}" fill="none"/>`;
    const am=(a0+a1)/2; if(prog>0.95 && sg.label){ const lr=r+(o.lr||140); s+=txt(cx+lr*Math.cos(am),cy+lr*Math.sin(am)-6,sg.label,{size:34,color:sg.c})+txt(cx+lr*Math.cos(am),cy+lr*Math.sin(am)+40,sg.v+'%',{size:44,color:sg.c}); }
    a0=a1; });
  return s; }

// ---------- buildings / scenery ----------
function castle(x,y,s,col,lit){ let w='';
  if(lit) for(let r=0;r<2;r++) for(let c=0;c<4;c++) w+=`<rect x="${-90+c*50}" y="${-130+r*55}" width="22" height="30" fill="${C.o}" opacity="0.85"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})"><g fill="${col}"><rect x="-120" y="-170" width="240" height="170"/><rect x="-175" y="-240" width="65" height="240"/><rect x="110" y="-240" width="65" height="240"/><rect x="-45" y="-290" width="90" height="130"/><path d="M-185,-240 L-142,-320 L-100,-240 Z M100,-240 L142,-320 L185,-240 Z M-55,-290 L0,-380 L55,-290 Z"/><path d="M-120,-170 v-18 h20 v18 h20 v-18 h20 v18 h20 v-18 h20 v18 h20 v-18 h20 v18 h20 v-18 h20 v18 h20 v-18 h20 v18 h20 v-18 h20 v18"/></g>${w}</g>`; }

function building(x,y,s,col,lit){ let w='';
  for(let r=0;r<5;r++) for(let c=0;c<3;c++) w+=`<rect x="${-75+c*55}" y="${-300+r*58}" width="40" height="30" fill="${lit&&((r*3+c)%4===1)?C.o:C.dark}" opacity="0.9"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-100" y="-330" width="200" height="330" fill="${col}"/>${w}</g>`; }

function neon(x,y,str,col,t,size){ size=size||64; const fl=0.85+0.15*Math.sin(t*9)*Math.sin(t*3.1);
  return `<g opacity="${fl.toFixed(2)}" filter="url(#glow)">${txt(x,y,str,{size,color:col,weight:900,ls:6})}</g>`; }

function road(t,o){ o=o||{}; const hy=o.hy||430; let s=`<rect x="0" y="${hy}" width="${W}" height="${H-hy}" fill="#121519"/>`;
  s+=`<path d="M${CX-40},${hy} L${CX-700},${H} M${CX+40},${hy} L${CX+700},${H}" stroke="${C.gray}" stroke-width="4"/>`;
  for(let k=0;k<8;k++){ const p=((t*0.35+k/8)%1); const yy=hy+(H-hy)*p*p; const ww=4+p*16; s+=`<rect x="${CX-ww/2}" y="${yy}" width="${ww}" height="${8+p*40}" fill="${C.dim}" opacity="${0.3+p*0.5}"/>`; }
  for(let k=0;k<3;k++){ const p=((t*0.22+k/3)%1); const yy=hy+(H-hy)*p*p; const xx=CX-60-p*420; s+=`<circle cx="${xx}" cy="${yy}" r="${3+p*14}" fill="#fff5d0" opacity="${0.4+p*0.6}" filter="url(#glow)"/>`; }
  return s; }

function floorplan(x,y,s,lt){ const a=easeOut(lt/1.2);
  return `<g transform="translate(${x},${y}) scale(${s})" fill="none" stroke="${C.fg}" stroke-width="5" opacity="${a}">
    <rect x="-300" y="-180" width="600" height="360"/><path d="M-300,0 h220 M-80,-180 v360 M120,-180 v210 M120,30 h180"/>
    <path d="M-80,-60 v60" stroke="${C.bg}" stroke-width="9"/><path d="M-80,-60 v60" stroke="${C.dim}" stroke-width="3" stroke-dasharray="6 6"/></g>`
   + txt(x-190*s,y-80*s,'洋室',{size:28*s+6,color:C.dim,weight:500})+txt(x-190*s,y+100*s,'洋室',{size:28*s+6,color:C.dim,weight:500})+txt(x+210*s,y-70*s,'LDK',{size:28*s+6,color:C.dim,weight:500}); }

function houses(t,litFn){ let s=''; const xs=[200,470,740,1010,1280,1550,1760];
  xs.forEach((x,i)=>{ const hh=180+(i%3)*30; s+=`<path d="M${x-110},600 L${x-110},${600-hh} L${x},${600-hh-90} L${x+110},${600-hh} L${x+110},600 Z" fill="${C.dark}" stroke="${C.gray}" stroke-width="3"/>`;
    for(let k=0;k<2;k++){ const on=litFn(i,k); s+=`<rect x="${x-70+k*90}" y="${600-hh+50}" width="50" height="60" fill="${on===2?'#ffcf8a':on?C.o:'#15181d'}" opacity="${on?0.9:1}" ${on===2?'filter="url(#glow)"':''}/>`; } });
  return `<rect x="0" y="600" width="${W}" height="10" fill="${C.gray}"/>`+s; }

function bubbles(x,y,n,t,col){ let s=''; for(let i=0;i<n;i++){ const a=i/n*Math.PI*1.4-Math.PI*1.2, r=150+((i*37)%40); const bx=x+Math.cos(a)*r, by=y+Math.sin(a)*r*0.7; const p=0.6+0.4*Math.sin(t*2+i);
  s+=`<g opacity="${p.toFixed(2)}"><rect x="${bx-38}" y="${by-24}" width="76" height="48" rx="20" fill="none" stroke="${col}" stroke-width="4"/><path d="M${bx-10},${by+24} l-8,16 l22,-16" fill="none" stroke="${col}" stroke-width="4"/><path d="M${bx-20},${by} h40" stroke="${col}" stroke-width="4" stroke-dasharray="6 8"/></g>`; } return s; }

function globeDots(t,n,hl){ let s=`<circle cx="${CX}" cy="${CY}" r="250" fill="none" stroke="${C.gray}" stroke-width="3"/>`;
  for(let k=-3;k<=3;k++){ const ph=(t*0.25+k*0.45); const rx=Math.abs(Math.cos(ph))*250; s+=`<ellipse cx="${CX}" cy="${CY}" rx="${rx.toFixed(1)}" ry="250" fill="none" stroke="${C.dark}" stroke-width="2"/>`; }
  for(let i=0;i<n;i++){ const a=i*2.399, rr=Math.sqrt((i+0.5)/n)*220; const x=CX+Math.cos(a)*rr, y=CY+Math.sin(a)*rr*0.95; s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${C.t}" opacity="${0.5+0.5*Math.sin(t*2+i)}"/>`; }
  if(hl) s+=`<circle cx="${CX+hl[0]}" cy="${CY+hl[1]}" r="16" fill="${C.o}" filter="url(#glow)"/>`+txt(CX+hl[0]+30,CY+hl[1]-20,hl[2],{size:40,anchor:'start',color:C.o});
  return s; }

function bedSpin(x,y,s,t,col){ const a=t*40; return `<g transform="translate(${x},${y}) scale(${s})"><circle r="70" fill="none" stroke="${col}" stroke-width="5"/><g transform="rotate(${a})"><circle r="56" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="20 14"/><rect x="-40" y="-56" width="80" height="22" rx="8" fill="${col}"/></g><path d="M78,-20 a82,82 0 0 1 0,40" stroke="${col}" stroke-width="4" fill="none"/><path d="M78,20 l-10,-6 M78,20 l8,-9" stroke="${col}" stroke-width="4"/></g>`; }
function mirrorIcon(x,y,s,col){ return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-55" y="-70" width="110" height="140" fill="none" stroke="${col}" stroke-width="5"/><path d="M-30,-40 L10,-60 M-30,0 L30,-30 M-10,40 L30,20" stroke="${col}" stroke-width="3" opacity="0.6"/></g>`; }
function bathIcon(x,y,s,col,t){ return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-70,0 h140 v20 q0,40 -40,40 h-60 q-40,0 -40,-40 Z" fill="none" stroke="${col}" stroke-width="5"/><path d="M-50,-70 v70" stroke="${col}" stroke-width="5"/><path d="M-40,${-30+Math.sin(t*3)*4} q15,-10 30,0 t30,0 t30,0" fill="none" stroke="${C.t}" stroke-width="3"/><rect x="-80" y="-90" width="160" height="170" fill="none" stroke="${col}" stroke-width="2" stroke-dasharray="6 8" opacity="0.6"/></g>`; }
const cross = (x,y,r,p) => `<path d="M${x-r},${y-r} L${x-r+2*r*clamp(p*2,0,1)},${y-r+2*r*clamp(p*2,0,1)}" stroke="${C.red}" stroke-width="12" stroke-linecap="round"/>`+(p>0.5?`<path d="M${x+r},${y-r} L${x+r-2*r*clamp(p*2-1,0,1)},${y-r+2*r*clamp(p*2-1,0,1)}" stroke="${C.red}" stroke-width="12" stroke-linecap="round"/>`:'');
function couple(x,y,s,c1,c2){ return person(x-s*0.8,y,s,c1||C.fg)+person(x+s*0.8,y,s,c2||C.fg,'f'); }

// ---------- data ----------
const SEXLESS=[{x:2004,y:31.9,label:'31.9%',below:true},{x:2014,y:44.6},{x:2016,y:47.2,label:'47.2%',below:true,dx:20},{x:2020,y:51.9,label:'51.9%',c:C.red}];
const HOTELS=[[2017,5537],[2018,5417],[2019,5306],[2020,5183],[2021,5042],[2022,4885],[2023,4724],[2024,4563],[2025,4425]];

const SCENES = [
// 1 Durex frequency bars
{els:[
 {at:0, f:()=> txt(CX,140,'1年間の回数（26カ国・2007年）',{size:38,color:C.dim})},
 {at:0.4, f:(lt)=> bars(640,180,900,[{label:'ギリシャ',v:164,c:C.o,txt:'164回'},{label:'ブラジル',v:145,c:C.gray},{label:'ポーランド',v:143,c:C.gray},{label:'ロシア',v:143,c:C.gray},{label:'ニュージーランド',v:122,c:C.gray},{label:'南アフリカ',v:120,c:C.gray},{label:'オーストラリア',v:106,c:C.gray}],170,lt,{bh:50,gap:22,ls:30,vs:34})},
 {at:3.0, f:(lt)=> `<path d="M${640+900*103/170},170 v${600*ease(lt)}" stroke="${C.t}" stroke-width="3" stroke-dasharray="10 8"/>`+txt(640+900*103/170+12,745,'世界平均 103回',{size:28,color:C.t,anchor:'start'})},
 {at:5.6, f:()=> txt(640+900*0.3,705,'⋮',{size:40,color:C.dim})},
 {at:8.6, f:(lt)=> bars(640,770,900,[{label:'日本',v:48,c:C.red,txt:'48回　最下位'}],170,lt,{bh:60,ls:36,vs:38})},
 {at:9.5, f:()=> note(1880,880,'Durex Sexual Wellbeing Global Survey 2007','end')},
]},
// 2 night road, castle, neon
{els:[
 {at:0, slide:0, f:(lt,t)=> road(t)},
 {at:0.6, f:(lt,t)=> castle(CX+560,520,0.75,'#1b1f27',true)},
 {at:4.6, f:(lt,t)=> neon(CX+560,100,'HOTEL',C.o,t,64)+`<rect x="${CX+420}" y="122" width="280" height="104" rx="10" fill="none" stroke="${C.t}" stroke-width="4" filter="url(#glow)"/>`+txt(CX+560,166,'休憩　2時間',{size:36,color:C.t})+txt(CX+560,210,'宿泊',{size:32,color:C.t})},
]},
// 3 counter 4,425 + 30,000 estimate
{els:[
 {at:3.0, f:(lt)=> `<g opacity="${0.35*ease(lt)}">${txt(CX,560,'30,000',{size:300,color:C.gray,weight:900})}</g>`+txt(CX,700,'届け出のない施設も含めた推計　約3万軒',{size:38,color:C.dim})+note(CX,750,'Chaplin (2007) より')},
 {at:0, f:(lt)=> txt(CX,380,fmt(4425*easeOut(lt/2.2)),{size:170,color:C.o,weight:900})+txt(CX,450,'軒（届け出をしているラブホテル等）',{size:36,color:C.fg})+note(CX,500,'警察庁　2025年')},
]},
// 4 contradiction
{els:[
 {at:0, f:()=> icon('moon',CX-430,380,180,C.red,4)+txt(CX-430,560,'回数　世界最下位',{size:46,color:C.red})},
 {at:1.6, f:(lt,t)=> castle(CX+430,500,0.6,C.gray,true)+txt(CX+430,560,'専用ホテル　世界最多クラス',{size:46,color:C.o})},
 {at:4.6, f:(lt)=> `<g transform="translate(${CX},400) scale(${0.6+0.4*easeOut(lt)})">${txt(0,40,'？',{size:160,color:C.fg})}</g>`},
 {at:6.4, f:()=> txt(CX,760,'矛盾か、それとも同じ答えの表と裏か',{size:44,serif:true,color:C.dim})},
]},
// 5 title card
{els:[
 {at:0, f:()=> txt(CX,310,'世界のネタバレ',{size:34,color:C.dim,ls:10})},
 {at:0.3, f:()=> txt(CX,460,'なぜ日本人は「<o>世界一しない</o>」のに、',{size:74,serif:true})+txt(CX,580,'ラブホテルを<o>3万軒</o>も作ったのか',{size:74,serif:true})},
 {at:1.4, f:()=> ['性科学','都市社会学'].map((s,i)=> box(CX-170+i*340,730,280,74,{stroke:i?C.t:C.o})+txt(CX-170+i*340,744,s,{size:38,color:i?C.t:C.o})).join('')},
]},
// 6 chapter 1 + 41 countries
{chapterTag:CH1, els:[
 ...chapter('第1章','世界最下位の夜'),
 {at:2.6, f:(lt,t)=>{ let s=''; for(let i=0;i<41;i++){ const x=CX-600+(i%21)*60, y=680+Math.floor(i/21)*60; s+=`<circle cx="${x}" cy="${y}" r="${10*ease((lt-i*0.04)/0.4)}" fill="${C.t}"/>`; } return s+txt(CX,830,'Durex 2005年　41カ国・30万人以上',{size:34,color:C.dim}); }},
]},
// 7 Japan 45 vs avg 103, 2005 & 2007
{chapterTag:CH1, els:[
 {at:0, f:()=> txt(CX,150,'1年間の回数',{size:38,color:C.dim})},
 {at:0.3, f:(lt)=> vbars(CX-620,220,520,520,[{label:'日本',v:45,c:C.red,txt:'45回'},{label:'世界平均',v:103,c:C.gray,txt:'103回'}],120,lt,{gap:80,ls:32,vs:40})+txt(CX-360,850,'2005年（41カ国）',{size:34})},
 {at:3.6, f:()=> txt(CX-360,170,'平均の半分にも届かない',{size:34,color:C.o})},
 {at:7.0, f:(lt)=> vbars(CX+100,220,520,520,[{label:'日本',v:48,c:C.red,txt:'48回'},{label:'世界平均',v:103,c:C.gray,txt:'103回'}],120,lt,{gap:80,ls:32,vs:40})+txt(CX+360,850,'2007年（26カ国）',{size:34})},
 {at:8.6, f:()=> txt(CX,130+0,'',{})+box(CX+360,180,300,64,{stroke:C.red})+txt(CX+360,194,'やはり最下位',{size:34,color:C.red})},
]},
// 8 scatter: satisfaction
{chapterTag:CH1, els:[
 {at:0, f:()=>{ const x=420,y=170,w=1100,h=600; let s=`<path d="M${x},${y} L${x},${y+h} L${x+w},${y+h}" stroke="${C.gray}" stroke-width="3" fill="none"/>`;
   s+=txt(x+w/2,y+h+70,'週1回以上している人の割合 →',{size:30,color:C.dim,weight:500})+txt(x-30,y-30,'満足している人の割合 ↑',{size:30,color:C.dim,weight:500,anchor:'start'});
   [0,25,50,75,100].forEach(v=>{ s+=txt(x+w*v/100,y+h+36,v+'%',{size:24,color:C.dim,weight:400}); });
   [20,40,60].forEach(v=>{ s+=`<path d="M${x},${y+h-h*v/80} h${w}" stroke="${C.dark}" stroke-width="2"/>`+txt(x-14,y+h-h*v/80+8,v+'%',{size:24,color:C.dim,anchor:'end',weight:400}); });
   return s; }},
 {at:1.3, f:(lt)=>{ const px=420+1100*0.34, py=170+600-600*15/80; return `<circle cx="${px}" cy="${py}" r="${18*easeOut(lt*2)}" fill="${C.red}" filter="url(#glow)"/>`+txt(px+30,py+12,'日本　満足15%',{size:38,color:C.red,anchor:'start'}); }},
 {at:6.0, f:()=> box(CX+300,250,420,70,{stroke:C.red})+txt(CX+300,265,'26カ国中　最下位',{size:38,color:C.red})},
 {at:8.4, f:(lt)=>{ const px=420+1100*0.53, py=170+600-600*67/80; return `<circle cx="${px}" cy="${py}" r="${18*easeOut(lt*2)}" fill="${C.o}"/>`+txt(px-30,py+12,'ナイジェリア　67%',{size:36,color:C.o,anchor:'end'}); }},
 {at:9.5, f:()=> note(1880,880,'Durex Sexual Wellbeing Global Survey 2007','end')},
]},
// 9 weekly: Greece 87 vs Japan 34
{chapterTag:CH1, els:[
 {at:0, f:()=> txt(CX,200,'週1回以上している人の割合',{size:40,color:C.dim})},
 {at:0.3, f:(lt)=> bars(620,300,1000,[{label:'ギリシャ',v:87,c:C.t,txt:'87%'},{label:'日本',v:34,c:C.red,txt:'34%'}],100,lt,{bh:110,gap:80,ls:44,vs:50})},
 {at:6.6, f:()=> box(1220,690,380,70,{stroke:C.red})+txt(1220,705,'参加国で最も低い',{size:36,color:C.red})},
]},
// 10 bias caveat
{chapterTag:CH1, els:[
 {at:0, out:3.2, f:()=> icon('window',CX,380,200,C.dim,4)+box(CX,620,620,90,{stroke:C.gray,dash:true})+txt(CX,636,'ネット調査には偏りがある',{size:42,color:C.dim})},
 {at:3.6, f:()=> icon('book',CX,400,220,C.t,4)+txt(CX,640,'日本国内の、地道な調査へ',{size:52,serif:true,color:C.t})},
]},
// 11 sexless line 2004-2020
{chapterTag:CH1, els:[
 {at:0, f:()=> txt(CX,140,'既婚者のセックスレス率（ひと月以上なし）',{size:38,color:C.dim})},
 {at:0, f:(lt)=> lineChart(380,190,1160,560,SEXLESS,[2002,2026],[20,70],clamp((lt-7.4)/6.5,0,1),{yticks:[30,40,50,60],yu:'%'})},
 {at:12.5, f:(lt)=>{ const y=190+560-560*(50-20)/50; return `<path d="M380,${y} h${1160*ease(lt/0.8)}" stroke="${C.red}" stroke-width="3" stroke-dasharray="10 8"/>`+txt(1540,y-14,'半分',{size:32,color:C.red,anchor:'end'}); }},
 {at:14.5, f:()=> note(1880,880,'日本家族計画協会（2004〜2016）／ジェクス（2020）','end')},
]},
// 12 + 2024 dotted
{chapterTag:CH1, els:[
 {at:0, f:()=> txt(CX,140,'既婚者のセックスレス率',{size:38,color:C.dim})},
 {at:0, slide:0, f:()=> lineChart(380,190,1160,560,SEXLESS,[2002,2026],[20,70],1,{yticks:[30,40,50,60],yu:'%'})},
 {at:0.5, f:(lt)=> lineChart(380,190,1160,560,[{x:2020,y:51.9},{x:2024,y:64.2,label:'64.2%',c:C.red,size:44}],[2002,2026],[20,70],ease(lt/1.6),{color:C.red,dash:true,noAxis:true})},
 {at:5.0, f:()=> box(1220,830,560,60,{stroke:C.gray,dash:true})+txt(1220,842,'2024年は集計方法が一部異なる',{size:28,color:C.dim})},
]},
// 13 virginity 1992 vs 2015
{chapterTag:CH1, els:[
 {at:0, f:()=> txt(CX,150,'18〜39歳で、異性と一度も経験のない男性',{size:38,color:C.dim})},
 {at:2.6, f:(lt)=> vbars(CX-420,220,840,520,[{label:'1992年',v:20.0,c:C.gray,txt:'20.0%'},{label:'2015年',v:25.8,c:C.o,txt:'25.8%'}],30,lt,{gap:240,ls:34,vs:48,stag:4})},
 {at:3.0, f:()=> note(1880,880,'Ghaznavi et al. (2019) 東京大学','end')},
]},
// 14 1 in 8 + UK/US/AU
{chapterTag:CH1, els:[
 {at:0, f:(lt)=>{ let s=''; for(let i=0;i<8;i++){ s+=person(300+i*90,470,40,i===7&&lt>1.2?C.red:C.fg); } return s+txt(615,640,'30代前半の男性　<o>8人に1人</o>',{size:44}); }},
 {at:2.8, f:(lt)=> bars(1300,380,420,[{label:'日本',v:12.7,c:C.red,txt:'12.7%'},{label:'英・米・豪',v:5,c:C.gray,txt:'1〜5%'}],16,lt,{bh:70,gap:50,ls:34,vs:36})},
]},
// 15 unmarried experience 2021
{chapterTag:CH1, els:[
 {at:0, f:()=> txt(CX,130,'18〜34歳の未婚者で「経験あり」（2021年）',{size:38,color:C.dim})},
 {at:0.6, f:(lt)=> grid(200,230,10,5,62,0.53,C.o,lt/2.5)+txt(480,700,'男性　<o>53%</o>',{size:48})},
 {at:3.0, f:(lt)=> grid(1100,230,10,5,62,0.475,C.t,lt/2.5)+txt(1380,700,'女性　<t>47.5%</t>',{size:48})},
 {at:10.3, f:()=> txt(CX,820,'未婚の若者の、ほぼ2人に1人はまだ',{size:46,serif:true})},
 {at:1, f:()=> note(1880,880,'国立社会保障・人口問題研究所　出生動向基本調査','end')},
]},
// 16 everything dims -> neon hotel
{chapterTag:CH1, els:[
 {at:0, out:4.6, f:(lt)=> lineChart(380,190,1160,480,SEXLESS.map(p=>({x:p.x,y:p.y})),[2002,2026],[20,70],1,{yticks:[],color:C.gray,xlabels:false})+txt(CX,780,'日本の夜は、静かになり続けている',{size:46,serif:true,color:C.dim})},
 {at:5.2, f:(lt,t)=> neon(CX,470,'HOTEL',C.o,t,140)+txt(CX,640,'なぜ、これほどのホテルが？',{size:46,serif:true})},
]},
// 17 chapter 2 + floorplan
{chapterTag:CH2, els:[
 ...chapter('第2章','家に「場所」がない'),
 {at:2.8, f:(lt)=> floorplan(CX-200,730,0.42,lt)+txt(CX+120,720,'東京　平均<o>64㎡</o>',{size:44,anchor:'start'})+txt(CX+120,780,'全国で最も狭い',{size:34,color:C.dim,anchor:'start'})},
]},
// 18 thin walls + parents
{chapterTag:CH2, els:[
 {at:0, f:(lt)=> floorplan(560,440,1.0,lt)+person(330,585,24,C.dim)+person(390,585,24,C.dim,'f')+person(580,500,34,C.o)+txt(560,700,'ふすま1枚の向こうに家族',{size:38,color:C.dim})},
 {at:3.4, f:()=> txt(1400,250,'未婚者（18〜34歳）が親と同居',{size:34,color:C.dim})},
 {at:3.6, f:(lt)=> donut(1250,470,110,[{v:70,c:C.o},{v:30,c:C.dark}],lt/1.2,{sw:44})+txt(1250,488,'約70%',{size:48,color:C.o})+txt(1250,640,'男性',{size:36})},
 {at:4.6, f:(lt)=> donut(1580,470,110,[{v:75,c:C.t},{v:25,c:C.dark}],lt/1.2,{sw:44})+txt(1580,488,'約75%',{size:48,color:C.t})+txt(1580,640,'女性',{size:36})},
]},
// 19 couple pushed out to hotel
{chapterTag:CH2, els:[
 {at:0, f:(lt)=> icon('house',CX-420,430,360,C.fg,3)+person(CX-470,520,36,C.fg)+person(CX-370,520,36,C.fg,'f')+txt(CX-420,700,'二人きりになれない',{size:38,color:C.dim})},
 {at:3.0, f:(lt)=> arrow(CX-180,460,CX+260,460,C.o,easeOut(lt/0.8),7)+castle(CX+470,560,0.55,C.gray,true)+txt(CX+470,700,'外に部屋を借りる',{size:38,color:C.o})},
]},
// 20 Brazil ~5000 motels
{chapterTag:CH2, els:[
 {at:0, f:(lt,t)=> globeDots(t,0,[-120,120,'ブラジル'])},
 {at:1.4, f:(lt)=> box(1480,420,520,190,{stroke:C.o})+txt(1480,400,'時間貸しのモーテル',{size:36})+txt(1480,480,'約'+fmt(5000*easeOut(lt/1.5))+'軒',{size:70,color:C.o})},
 {at:3, f:()=> note(1880,880,'ブラジルモーテル協会（NYT報道）','end')},
]},
// 21 Brazil open vs Japan
{chapterTag:CH2, els:[
 {at:0, f:(lt,t)=> couple(CX-450,560,50,C.fg,C.fg)+txt(CX-450,760,'ブラジル',{size:44,color:C.o})},
 {at:3.8, f:(lt,t)=> bubbles(CX-450,430,7,t,C.o)+txt(CX-450,160,'スーパーに行くのと同じくらい普通',{size:36,color:C.o})},
 {at:5.5, f:(lt,t)=> couple(CX+450,560,50,C.dim,C.dim)+icon('lock',CX+450,330,110,C.dim,4)+txt(CX+450,760,'日本',{size:44,color:C.dim})},
]},
// 22 adult-only ranking
{chapterTag:CH2, els:[
 {at:0, f:()=> txt(CX,200,'予約サイトの「大人専用」の宿の数',{size:40,color:C.dim})},
 {at:1.6, f:(lt)=> box(CX-260,470,420,260,{stroke:C.o,sw:5})+txt(CX-260,430,'1位',{size:50,color:C.o})+txt(CX-260,530,'日本',{size:90,serif:true,color:C.o})},
 {at:3.4, f:(lt)=> box(CX+260,500,380,200,{stroke:C.gray})+txt(CX+260,470,'2位',{size:44,color:C.dim})+txt(CX+260,560,'ブラジル',{size:70,serif:true})},
 {at:4, f:()=> note(1880,880,'プレジデントオンライン（2020）','end')},
]},
// 23 leaving age Europe
{chapterTag:CH2, els:[
 {at:0, f:()=> box(CX,190,660,80,{stroke:C.red})+txt(CX,206,'この説明には、大きな穴がある',{size:40,color:C.red})},
 {at:3.0, f:()=> txt(CX,300,'若者が親元を離れる平均年齢（2024年）',{size:34,color:C.dim})},
 {at:3.2, f:(lt)=> bars(660,350,880,[{label:'クロアチア',v:31.3,c:C.gray,txt:'31.3歳'},{label:'スロバキア',v:30.9,c:C.gray,txt:'30.9歳'},{label:'ギリシャ',v:30.7,c:C.t,txt:'30.7歳'},{label:'EU平均',v:26.2,c:C.gray,txt:'26.2歳'},{label:'フィンランド',v:21.4,c:C.gray,txt:'21.4歳'}],35,lt,{bh:56,gap:30,ls:34,vs:34})},
 {at:4, f:()=> note(1880,880,'Eurostat (2025)','end')},
]},
// 24 Greece: parents 30.7 & 164
{chapterTag:CH2, els:[
 {at:0, f:()=> txt(CX,220,'ギリシャ',{size:80,serif:true,color:C.t})},
 {at:1.2, f:()=> icon('house',CX-380,480,220,C.fg,4)+txt(CX-380,660,'30.7歳まで親と同居',{size:42})},
 {at:4.0, f:(lt)=> txt(CX+380,520,fmt(164*easeOut(lt/1.5))+'回',{size:130,color:C.o,weight:900})+txt(CX+380,660,'年間の回数　世界1位',{size:42,color:C.o})},
]},
// 25 where vs whether
{chapterTag:CH2, els:[
 {at:0, f:()=> box(CX-330,360,420,140,{stroke:C.o})+txt(CX-330,382,'どこで',{size:60,color:C.o})+box(CX+330,360,420,140,{stroke:C.gray})+txt(CX+330,382,'するか',{size:60,color:C.dim})},
 {at:1.6, f:(lt)=> txt(CX-330,640,'家の狭さ・親と同居',{size:38})+arrow(CX-330,600,CX-330,450,C.o,easeOut(lt/0.8),6)},
 {at:4.0, f:(lt)=> `<path d="M${CX+60},620 Q${CX+200},560 ${CX+260},470" stroke="${C.gray}" stroke-width="4" fill="none" stroke-dasharray="10 10"/>`+cross(CX+300,440,26,lt/0.8)},
 {at:7.0, f:()=> txt(CX,790,'住宅事情だけでは、解けない',{size:50,serif:true})},
]},
// 26 chapter 3 + Edo
{chapterTag:CH3, els:[
 ...chapter('第3章','お城と回転ベッド'),
 {at:2.6, f:(lt)=> `<path d="M260,760 h${1400*ease(lt/1.2)}" stroke="${C.gray}" stroke-width="4"/>`+`<circle cx="320" cy="760" r="12" fill="${C.t}"/>`+txt(320,830,'江戸　出会い茶屋',{size:34,color:C.t})},
]},
// 27 postwar tsurekomi
{chapterTag:CH3, els:[
 {at:0, f:()=> `<path d="M200,700 h1520" stroke="${C.gray}" stroke-width="4"/>`+`<circle cx="260" cy="700" r="10" fill="${C.dim}"/>`+txt(260,760,'江戸',{size:30,color:C.dim})},
 {at:0.4, f:()=> txt(CX,220,'戦後　宿も家も足りない',{size:40,color:C.dim})},
 {at:3.2, f:(lt)=>{ let s=`<circle cx="620" cy="700" r="12" fill="${C.o}"/>`+txt(620,760,'1950〜60年代',{size:32,color:C.o}); const n=Math.floor(clamp(lt/4,0,1)*24); for(let i=0;i<n;i++){ s+=icon('house',420+(i%12)*90,420+Math.floor(i/12)*120,70,i%3?C.dim:C.o,3);} return s+(lt>2?txt(CX,640,'連れ込み宿が爆発的に増える',{size:44,serif:true}):''); }},
]},
// 28 1973 castle rises
{chapterTag:CH3, els:[
 {at:0, f:()=> `<path d="M200,780 h1520" stroke="${C.gray}" stroke-width="4"/><circle cx="${CX}" cy="780" r="12" fill="${C.o}"/>`+txt(CX,840,'1973年',{size:36,color:C.o})},
 {at:0.4, f:(lt,t)=> `<g transform="translate(0,${(1-easeOut(lt/2))*300})">${castle(CX,760,1.0,C.gray,true)}</g>`+`<rect x="0" y="782" width="${W}" height="300" fill="${C.bg}"/>`},
 {at:2.5, f:()=> txt(CX,200,'ヨーロッパの古城をまねた豪華ホテル',{size:40})},
 {at:6.0, f:()=> txt(CX-560,500,'豪華さ',{size:52,serif:true,color:C.o})+txt(CX+560,500,'奇抜さ',{size:52,serif:true,color:C.t})},
]},
// 29 rotating bed, mirror, bath
{chapterTag:CH3, els:[
 {at:0, f:(lt,t)=> bedSpin(CX-480,420,1.5,t,C.o)+txt(CX-480,620,'回転ベッド',{size:38,color:C.o})},
 {at:1.1, f:()=> mirrorIcon(CX,420,1.3,C.t)+txt(CX,620,'壁一面の鏡',{size:38,color:C.t})},
 {at:2.2, f:(lt,t)=> bathIcon(CX+480,440,1.3,C.fg,t)+txt(CX+480,620,'ガラス張りの浴室',{size:38})},
 {at:4.0, f:()=> txt(CX,790,'昭和の、夜のテーマパーク',{size:52,serif:true})},
]},
// 30 1984 law
{chapterTag:CH3, els:[
 {at:0, f:()=> `<path d="M200,780 h1520" stroke="${C.gray}" stroke-width="4"/><circle cx="1240" cy="780" r="12" fill="${C.red}"/>`+txt(1240,840,'1984年　風営法改正',{size:36,color:C.red})},
 {at:0.4, f:(lt,t)=> bedSpin(CX-300,420,1.6,t*(lt<4?1:0.2),C.dim)},
 {at:4.0, f:(lt)=> cross(CX-300,420,120,lt/0.7)},
 {at:3.6, f:()=> txt(CX+300,360,'警察の管理下へ',{size:46,anchor:'start',color:C.fg})+txt(CX+300,450,'回転ベッド・鏡張りは',{size:38,anchor:'start',color:C.dim})+txt(CX+300,510,'新設が極めて難しく',{size:38,anchor:'start',color:C.dim})},
]},
// 31 castle -> plain building, 2010
{chapterTag:CH3, els:[
 {at:0, out:3.0, f:(lt,t)=> castle(CX,700,1.0,C.gray,true)},
 {at:3.3, f:(lt,t)=> building(CX,700,1.15,C.gray,true)+txt(CX,780,'普通の建物のふり',{size:40,color:C.dim})},
 {at:4.4, f:()=> box(CX,170,560,80,{stroke:C.o})+txt(CX,186,'2010年　規制の範囲を拡大',{size:40,color:C.o})},
]},
// 32 2011 jump (no numbers)
{chapterTag:CH3, els:[
 {at:0, f:(lt,t)=>{ let s=''; for(let i=0;i<6;i++){ const x=360+i*240; const flip=lt>2.5+i*0.5; s+=building(x,640,0.6,C.dark,false); s+=box(x,690,200,56,{stroke:flip?C.o:C.gray,fill:C.bg})+txt(x,702,flip?'ラブホテル等':'普通のホテル？',{size:24,color:flip?C.o:C.dim}); } return s; }},
 {at:5.2, f:(lt)=> arrow(CX,320,CX,170,C.o,easeOut(lt/0.6),8)+txt(CX+40,250,'2011年　届け出が急増',{size:46,color:C.o,anchor:'start'})},
 {at:9.2, f:()=> txt(CX,830,'それほど多くが、普通のホテルのふりをしていた',{size:42,serif:true})},
]},
// 33 declining bars 2017-2025
{chapterTag:CH3, els:[
 {at:0, f:()=> txt(CX,140,'ラブホテル等の届け出数',{size:38,color:C.dim})},
 {at:2.8, f:(lt)=> vbars(300,220,1320,520,HOTELS.map((h,i)=>({label:String(h[0]),v:h[1]-3000,c:(i===0||i===8)?C.o:C.gray,txt:(i===0||i===8)?fmt(h[1]):''})),2800,lt,{gap:30,ls:26,vs:34,stag:0.18})},
 {at:8.8, f:()=> box(1580,180,220,90,{stroke:C.red})+txt(1580,200,'−20%',{size:56,color:C.red})},
 {at:3, f:()=> note(1880,880,'警察庁　警察白書（縦軸は3,000軒から）','end')},
]},
// 34 donut location
{chapterTag:CH3, els:[
 {at:0, f:()=> txt(CX,110,'残ったホテルはどこにある？',{size:40,color:C.dim})},
 {at:2.4, f:(lt)=> donut(CX,530,190,[{v:17,c:C.gray,label:'繁華街'},{v:53,c:C.o,label:'郊外'},{v:30,c:C.t,label:'インター近く'}],lt/1.6,{sw:90,lr:150})},
 {at:3, f:()=> note(1880,880,'綜合ユニコム　レジャーホテル経営者調査（2022年・N=70）','end')},
]},
// 35 rural road at night
{chapterTag:CH3, els:[
 {at:0, slide:0, f:(lt,t)=> road(t,{hy:470})},
 {at:0.6, f:(lt,t)=> building(CX-620,560,0.55,'#1b1f27',true)+neon(CX-620,330,'HOTEL',C.o,t,46)},
 {at:3.5, f:()=> txt(CX,200,'車社会で、誰にも見られずに出入りできる場所',{size:42,serif:true})},
]},
// 36 panel -> payment -> door (no people)
{chapterTag:CH4, els:[
 ...chapter('第4章','家ではしない国').map(e=>({...e,out:2.8})),
 {at:3.2, f:(lt)=>{ let s=''; for(let i=0;i<12;i++){ const on=(i===5); s+=`<rect x="${270+(i%4)*80}" y="${330+Math.floor(i/4)*80}" width="66" height="66" rx="6" fill="${on&&lt>1?C.o:C.dark}" stroke="${C.gray}" stroke-width="2"/>`; } return s+txt(420,640,'パネルで部屋を選ぶ',{size:34}); }},
 {at:4.6, f:(lt)=> arrow(640,450,780,450,C.dim,easeOut(lt/0.5),5)+`<rect x="860" y="330" width="200" height="240" rx="12" fill="none" stroke="${C.fg}" stroke-width="4"/><rect x="890" y="360" width="140" height="70" fill="${C.dark}"/>`+txt(960,520,'¥',{size:60,color:C.o})+txt(960,640,'部屋の精算機',{size:34})},
 {at:6.0, f:(lt)=> arrow(1120,450,1260,450,C.dim,easeOut(lt/0.5),5)+`<rect x="1330" y="300" width="160" height="290" rx="6" fill="none" stroke="${C.fg}" stroke-width="4"/><circle cx="1465" cy="450" r="8" fill="${C.fg}"/>`+txt(1410,640,'ドア',{size:34})},
 {at:6.8, f:()=> box(CX,770,700,80,{stroke:C.o})+txt(CX,785,'従業員とは一度も顔を合わせない',{size:38,color:C.o})},
]},
// 37 key -> secret
{chapterTag:CH4, els:[
 {at:0, out:2.4, f:()=> icon('key',CX,440,260,C.fg,4)+txt(CX,660,'ただの部屋ではない',{size:44,color:C.dim})},
 {at:2.7, f:(lt)=> `<g transform="translate(${CX},500) scale(${0.7+0.3*easeOut(lt)})">${txt(0,0,'秘密',{size:200,serif:true,color:C.o})}</g>`+txt(CX,700,'誰にも会わず、誰にも知られない',{size:44})},
]},
// 38 Brazil talks vs Japan hides
{chapterTag:CH4, els:[
 {at:0, f:(lt,t)=> couple(CX-450,600,46,C.fg,C.fg)+bubbles(CX-450,470,6,t,C.o)+txt(CX-450,790,'ブラジル：堂々と話す',{size:40,color:C.o})},
 {at:3.3, f:(lt)=> couple(CX+450,600,46,C.dim,C.dim)+`<rect x="${CX+250}" y="${330}" width="${400*easeOut(lt/0.8)}" height="380" fill="${C.dark}" opacity="0.92"/>`+`<path d="M${CX+250},330 h400" stroke="${C.gray}" stroke-width="8"/>`+[0,1,2,3].map(k=>`<rect x="${CX+262+k*98}" y="336" width="86" height="${120*easeOut(lt/0.8)}" fill="${C.gray}" opacity="0.6"/>`).join('')+txt(CX+450,790,'日本：行ったことすら隠す',{size:40,color:C.dim})},
 {at:6.0, f:()=> txt(CX,190,'人目を避ける作り（遮へい・暖簾・顔の見えないフロント）',{size:36,color:C.dim})},
]},
// 39 1% of population, half
{chapterTag:CH4, els:[
 {at:0, f:(lt)=>{ let s=''; for(let i=0;i<100;i++){ const on=i===47&&lt>1.2; s+=person(250+(i%20)*34,300+Math.floor(i/20)*70,11,on?C.o:C.gray); } return s+txt(570,700,'毎日　人口の約<o>1%</o>',{size:42}); }},
 {at:4.4, f:(lt)=> donut(1430,460,170,[{v:50,c:C.gray,label:'家など'},{v:50,c:C.o,label:'ラブホテル'}],lt/1.3,{sw:70,lr:120})},
 {at:5.5, f:()=> box(1430,800,480,56,{stroke:C.gray,dash:true})+txt(1430,811,'2000年代の推計（Chaplin 2007）',{size:26,color:C.dim})},
]},
// 40 home minus, outside plus
{chapterTag:CH4, els:[
 {at:0, f:()=> icon('house',CX-360,430,280,C.dim,4)+txt(CX-360,640,'家',{size:44,color:C.dim})+txt(CX-210,320,'−',{size:110,color:C.red})},
 {at:0.6, f:()=> castle(CX+360,560,0.5,C.gray,true)+txt(CX+360,640,'外',{size:44,color:C.o})+txt(CX+520,320,'＋',{size:100,color:C.o})},
 {at:3.7, f:()=> txt(CX,800,'なぜ、家ではしないのか',{size:52,serif:true})},
]},
// 41 reasons men / women
{chapterTag:CH4, els:[
 {at:0, f:()=> txt(CX,140,'セックスに積極的になれない理由（既婚者・2016年）',{size:36,color:C.dim})},
 {at:3.0, f:(lt)=> txt(460,240,'男性',{size:44,color:C.t})+bars(510,290,330,[{label:'仕事で疲れている',v:35.2,c:C.t,txt:'35.2%'},{label:'家族のように思える',v:12.8,c:C.gray,txt:'12.8%'},{label:'出産後なんとなく',v:12.0,c:C.gray,txt:'12.0%'}],40,lt,{bh:60,gap:50,ls:28,vs:30})},
 {at:6.6, f:(lt)=> txt(1400,240,'女性',{size:44,color:C.o})+bars(1440,290,330,[{label:'面倒くさい',v:22.3,c:C.o,txt:'22.3%'},{label:'出産後なんとなく',v:20.1,c:C.gray,txt:'20.1%'},{label:'仕事で疲れている',v:17.4,c:C.gray,txt:'17.4%'}],40,lt,{bh:60,gap:50,ls:28,vs:30})},
 {at:1, f:()=> note(1880,880,'日本家族計画協会「男女の生活と意識に関する調査」','end')},
]},
// 42 "like family"
{chapterTag:CH4, els:[
 {at:0, out:3.0, f:()=> txt(CX,450,'男性の2位は……',{size:60,serif:true,color:C.dim})},
 {at:3.2, f:(lt)=> `<g transform="translate(${CX},440) scale(${0.85+0.15*easeOut(lt)})">${txt(0,0,'相手が、家族のように思えるから',{size:70,serif:true,color:C.o})}</g>`+txt(CX,570,'12.8%',{size:60,color:C.o})},
]},
// 43 man/woman -> father/mother + child
{chapterTag:CH4, els:[
 {at:0, f:()=> icon('house',CX,440,520,C.gray,2)},
 {at:0.4, f:(lt)=>{ const fam=lt>3.2; return person(CX-120,560,52,fam?C.dim:C.t)+person(CX+120,560,52,fam?C.dim:C.o,'f')+txt(CX-120,400,fam?'父':'男',{size:52,color:fam?C.dim:C.t})+txt(CX+120,400,fam?'母':'女',{size:52,color:fam?C.dim:C.o}); }},
 {at:6.8, f:()=> person(CX,600,30,C.fg)},
 {at:10.2, f:()=> box(CX,830,640,70,{stroke:C.o})+txt(CX,843,'女性の2位：出産後なんとなく　20.1%',{size:34,color:C.o})},
]},
// 44 home (family) <-> hotel (man & woman)
{chapterTag:CH4, els:[
 {at:0, f:()=> icon('house',CX-480,440,300,C.dim,3)+person(CX-530,530,30,C.dim)+person(CX-430,530,30,C.dim,'f')+person(CX-480,560,18,C.dim)+txt(CX-480,680,'家の中＝家族',{size:40,color:C.dim})},
 {at:1.2, f:(lt)=> `<path d="M${CX-300},460 Q${CX},${360} ${CX+300},460" stroke="${C.gray}" stroke-width="4" fill="none" stroke-dasharray="${900*easeOut(lt)} 2000"/>`},
 {at:2.0, f:()=> castle(CX+480,560,0.55,C.gray,true)+person(CX+430,520,30,C.t)+person(CX+530,520,30,C.o,'f')+txt(CX+480,680,'外＝男と女',{size:40,color:C.o})},
 {at:6.4, f:()=> txt(CX,820,'性は、誰にも見られない家の外で',{size:46,serif:true})},
]},
// 45 ? -> =
{chapterTag:CH4, els:[
 {at:0, f:()=> icon('moon',CX-430,380,160,C.red,4)+txt(CX-430,540,'夫婦はしない',{size:44,color:C.red})+castle(CX+430,470,0.5,C.gray,true)+txt(CX+430,540,'ラブホテルは多い',{size:44,color:C.o})},
 {at:0, out:4.1, f:()=> txt(CX,450,'？',{size:150,color:C.fg})},
 {at:4.3, f:(lt)=> `<g transform="translate(${CX},400) scale(${0.6+0.4*easeOut(lt)})">${txt(0,50,'＝',{size:150,color:C.o})}</g>`},
 {at:6.5, f:()=> txt(CX,760,'性を家から追い出した。その行き先がラブホテル',{size:44,serif:true})},
]},
// 46 epilogue start
{chapterTag:EPI, els:[
 {at:0, f:()=> txt(CX,470,'だが、もう一段深刻なことが起きている',{size:56,serif:true,color:C.dim})},
]},
// 47 X-cross schematic
{chapterTag:EPI, els:[
 {at:0, f:(lt)=> lineChart(400,200,1120,520,[{x:0,y:30},{x:1,y:40},{x:2,y:52},{x:3,y:64,label:'セックスレス　↑',c:C.red}],[0,3],[20,80],ease(lt/2),{color:C.red,yticks:[],xlabels:false,noAxis:true})},
 {at:0.6, f:(lt)=> lineChart(400,200,1120,520,[{x:0,y:70},{x:1,y:62},{x:2,y:52},{x:3,y:44,label:'ラブホテル　↓',c:C.o,below:true}],[0,3],[20,80],ease(lt/2),{color:C.o,yticks:[],xlabels:false,noAxis:true})},
 {at:3.8, f:()=> txt(CX,820,'性は、行き先さえ失いつつある',{size:46,serif:true})},
 {at:1, f:()=> note(1880,880,'イメージ図（単位の違う2つのデータの増減の向き）','end')},
]},
// 48 windows go dark
{chapterTag:EPI, els:[
 {at:0, slide:0, f:(lt)=> houses(lt,(i,k)=> (i*2+k)/14 > lt/5 ? 1 : 0)},
 {at:5.2, f:()=> txt(CX,800,'世界一しない国は、こうしてできあがった',{size:46,serif:true})},
]},
// 49 one warm window
{chapterTag:EPI, els:[
 {at:0, slide:0, f:(lt)=> houses(lt,(i,k)=> (i===3&&k===1&&lt>2.5)?2:0)},
 {at:7.0, f:()=> txt(CX,800,'昭和の回転ベッドよりも、ずっと珍しい夜',{size:46,serif:true})},
]},
// 50 outro
{els:[
 {at:0, f:()=> txt(CX,380,'今日のネタバレは、ここまで。',{size:64,serif:true})},
 {at:1.0, f:()=> txt(CX,520,'世界のネタバレ',{size:90,serif:true,color:C.o,ls:8})},
 {at:2.2, f:()=> `<rect x="${CX-170}" y="610" width="340" height="80" rx="40" fill="${C.o}"/>`+txt(CX,664,'チャンネル登録',{size:38,color:'#111'})},
 {at:3.0, f:()=> txt(CX,800,'音声：VOICEVOX:青山龍星',{size:28,color:C.dim})},
]},
];
