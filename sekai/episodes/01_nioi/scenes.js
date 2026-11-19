// 49 scenes. lt = time since element appeared, t = scene time
const CX=960, CY=470;
const chapter = (num, title, sub) => [
  {at:0, slide:0, f:()=> `<rect x="${CX-1}" y="250" width="2" height="0" fill="${C.o}"/>` + txt(CX,330,num,{size:40,color:C.o,serif:true,ls:8})},
  {at:0.3, f:()=> txt(CX,470,title,{size:110,serif:true,ls:6})},
  {at:0.8, f:(lt)=> `<rect x="${CX-260*ease(lt/0.8)}" y="520" width="${520*ease(lt/0.8)}" height="3" fill="${C.gray}"/>`},
];
const tag = s => s;

const SCENES = [
// 1 shirt on hanger, scent drifting
{els:[
 {at:0, f:(lt,t)=> icon('hanger',CX,250,190,C.dim,4) + icon('shirt',CX,440,300,C.fg,4)},
 {at:0.8, f:(lt,t)=> scent(CX+60,380,CX+520,200,C.t,t,{amp:24,n:3,prog:ease(lt/2.5)}) + scent(CX-60,400,CX-520,240,C.t,t+1,{amp:20,n:2,prog:ease(lt/2.5)})},
 {at:3.2, f:()=> txt(CX,760,'こっそり、顔をうずめてしまう',{size:44,serif:true,color:C.dim})},
]},
// 2 Japan few body odor
{els:[
 {at:0, f:(lt,t)=>{ let s=''; const xs=[260,520,780,1140,1400,1660]; xs.forEach((x,i)=>{ const jp=i===3; s+=person(x,560,70,jp?C.o:C.gray); if(!jp) s+=waves(x,470,C.gray,t+i*0.3,90,3); }); return s;}},
 {at:0.6, f:()=> txt(1140,290,'日本',{size:54,color:C.o})},
 {at:2.2, f:()=> box(CX,820,820,90,{stroke:C.o})+txt(CX,836,'体臭が少ない人の割合が、世界でも珍しいほど高い',{size:36})},
]},
// 3 heian incense = modern spray
{els:[
 {at:0, f:()=> icon('shirt',CX-560,420,150,C.fg,4)+txt(CX-560,580,'汗を止め',{size:40})},
 {at:1.0, f:(lt,t)=> icon('spray',CX-200,420,150,C.fg,4)+txt(CX-200,580,'体臭を消し',{size:40})+`<g opacity="${0.6}">${scent(CX-170,330,CX-40,280,C.dim,t,{n:1,amp:8,prog:ease(lt)})}</g>`},
 {at:2.0, f:(lt,t)=> icon('perfume',CX+160,420,150,C.o,4)+txt(CX+160,580,'香りを足す',{size:40,color:C.o})},
 {at:5.0, f:(lt,t)=> txt(CX+380,430,'＝',{size:90,color:C.dim})+icon('incense',CX+600,410,170,C.t,4)+txt(CX+600,580,'千年前の貴族',{size:40,color:C.t})+`<g>${scent(CX+600,330,CX+640,160,C.t,t,{n:2,amp:16,prog:ease(lt/1.5)})}</g>`},
]},
// 4 perfume -> DNA + heart
{els:[
 {at:0, out:4.5, f:(lt,t)=> icon('perfume',CX,430,220,C.fg,4)+txt(CX,650,'清潔さ・マナーの話？',{size:46,serif:true,color:C.dim})},
 {at:5.2, f:(lt,t)=> icon('dna',CX-220,430,230,C.t,4)+icon('heart',CX+220,430,200,C.o,4)+txt(CX-220,650,'遺伝子',{size:44,color:C.t})+txt(CX+220,650,'恋の相手への情報',{size:44,color:C.o})},
 {at:9.5, f:()=> txt(CX,800,'消しているのは、ただの汗の匂いではない？',{size:42,serif:true})},
]},
// 5 title card
{els:[
 {at:0, f:()=> txt(CX,330,'世界のネタバレ',{size:34,color:C.dim,ls:10})},
 {at:0.4, f:()=> txt(CX,470,'なぜ日本人は、',{size:80,serif:true})+txt(CX,590,'体の匂いを<o>消して</o>香りを<o>足す</o>のか',{size:80,serif:true})},
 {at:1.6, f:()=> ['遺伝学','免疫学','源氏物語'].map((s,i)=> box(CX-330+i*330,740,260,74,{stroke:i===2?C.t:C.o})+txt(CX-330+i*330,754,s,{size:38,color:i===2?C.t:C.o})).join('')},
]},
// 6 chapter 1 + ear types
{chapterTag:'第1章　匂わない体', els:[
 ...chapter('第1章','匂わない体'),
 {at:2.6, f:()=> icon('ear',CX-260,720,130,C.fg,4)+txt(CX-260,840,'カサカサ',{size:40,color:C.t})+icon('ear',CX+260,720,130,C.fg,4)+txt(CX+260,840,'しっとり',{size:40,color:C.o})},
]},
// 7 one letter
{chapterTag:'第1章　匂わない体', els:[
 {at:0, f:(lt)=>{ const seq='ATCGGATTCAGGCTAGCCATG'; let s=''; for(let i=0;i<seq.length;i++){ const hot=i===10; const ch=hot?(lt>3.5?'A':'G'):seq[i]; s+=txt(300+i*63,470,ch,{size:64,color:hot?C.o:C.gray,weight:hot?900:500}); } return s+(lt>3?`<rect x="${300+10*63-30}" y="400" width="60" height="96" rx="8" fill="none" stroke="${C.o}" stroke-width="4" filter="url(#glow)"/>`:'');}},
 {at:0.4, f:()=> txt(CX,300,'2006年　長崎大学などの研究チーム',{size:38,color:C.dim})},
 {at:4.2, f:()=> txt(CX,640,'たった<o>一文字</o>の違いで、耳あかのタイプが決まる',{size:46,serif:true})},
]},
// 8 body ear-armpit link
{chapterTag:'第1章　匂わない体', els:[
 {at:0, f:()=> person(CX,560,150,C.dark)+`<circle cx="${CX+48}" cy="${560-150}" r="12" fill="${C.t}"/><circle cx="${CX+70}" cy="${560-80}" r="12" fill="${C.o}"/>`},
 {at:1.2, f:(lt)=> `<path d="M${CX+60},${410} Q${CX+260},${430} ${CX+80},${480}" fill="none" stroke="${C.fg}" stroke-width="3" stroke-dasharray="8 8"/>` + txt(CX+260,380,'耳あか',{size:38,anchor:'start',color:C.t})+txt(CX+260,520,'わきの汗の腺',{size:38,anchor:'start',color:C.o})},
 {at:4.8, f:()=> box(CX,800,900,90,{stroke:C.t})+txt(CX,816,'耳あかが乾いている人は、わきの匂いも少ない',{size:38})},
]},
// 9 grid 98.7% wet among strong odor
{chapterTag:'第1章　匂わない体', els:[
 {at:0, f:()=> txt(CX,170,'わきの匂いが強いと診断された人（九州・沖縄）',{size:38,color:C.dim})},
 {at:0.4, f:(lt)=> grid(437,250,20,5,56,0.987,C.o,lt/2.5)},
 {at:3.2, f:()=> txt(CX,790,'<o>98.7%</o> が湿ったタイプ',{size:64,serif:true})},
]},
// 10 grid general ~1/3
{chapterTag:'第1章　匂わない体', els:[
 {at:0, f:()=> txt(CX,170,'同じ地域の一般の人',{size:38,color:C.dim})},
 {at:0.3, f:(lt)=> grid(437,250,20,5,56,0.354,C.o,lt/1.8)},
 {at:2.4, f:()=> txt(CX,790,'湿ったタイプは <o>3人に1人</o> ほど',{size:64,serif:true})},
]},
// 11 world gradient bars (dry type share)
{chapterTag:'第1章　匂わない体', els:[
 {at:0, f:()=> txt(CX,190,'乾いたタイプ（体臭が少ない）の割合',{size:40,color:C.dim})},
 {at:0.3, f:(lt)=> bars(720,280,820,[{label:'東アジア',v:90,c:C.t,txt:'8〜9割'},{label:'南・中央アジア',v:40,c:C.gray,txt:'3〜5割'},{label:'ヨーロッパ・アフリカ',v:2,c:C.gray,txt:'ほぼゼロ'}],100,lt,{bh:80,gap:56})},
]},
// 12 globe, scent vanishes at Japan
{chapterTag:'第1章　匂わない体', els:[
 {at:0, f:(lt,t)=>{ let s=`<circle cx="${CX}" cy="${CY}" r="250" fill="none" stroke="${C.gray}" stroke-width="3"/>`; for(let k=-3;k<=3;k++){ const ph=(t*0.25+k*0.45); const rx=Math.abs(Math.cos(ph))*250; s+=`<ellipse cx="${CX}" cy="${CY}" rx="${rx}" ry="250" fill="none" stroke="${C.dark}" stroke-width="2"/>`; } s+=`<path d="M${CX-250},${CY} h500 M${CX-220},${CY-120} h440 M${CX-220},${CY+120} h440" stroke="${C.dark}" stroke-width="2"/>`;
   const pts=[[-160,-60],[-90,40],[-20,-110],[60,90],[150,-20]]; pts.forEach((p,i)=>{ s+=scent(CX+p[0],CY+p[1],CX+p[0]+10,CY+p[1]-110,C.gray,t+i,{n:1,amp:10}); });
   s+=`<circle cx="${CX+175}" cy="${CY-90}" r="14" fill="${C.o}"/>`+txt(CX+205,CY-110,'日本',{size:38,anchor:'start',color:C.o}); return s;}},
 {at:3.0, f:()=> txt(CX,820,'多くの人が、生まれつき<o>ほとんど持っていない</o>',{size:44,serif:true})},
]},
// 13 question
{chapterTag:'第1章　匂わない体', els:[
 {at:0.2, f:(lt)=> icon('question',CX,CY-20,260+10*Math.sin(lt*2),C.o,5)},
 {at:1.2, f:()=> txt(CX,760,'体の匂いには、何が書き込まれている？',{size:46,serif:true})},
]},
// 14 chapter 2
{chapterTag:'第2章　鼻は何を読んでいるのか', els:[
 ...chapter('第2章','鼻は何を読んでいるのか'),
 {at:2.8, f:()=> icon('shirt',CX-120,720,120,C.fg,4)+icon('moon',CX+60,700,70,C.dim,4)+icon('moon',CX+150,700,70,C.dim,4)+txt(CX+105,800,'×2晩',{size:34,color:C.dim})},
]},
// 15 boxes sniff test
{chapterTag:'第2章　鼻は何を読んでいるのか', els:[
 {at:0, f:()=> txt(CX,170,'1995年　スイス',{size:38,color:C.dim})},
 {at:0.2, f:(lt)=>{ let s=''; for(let i=0;i<6;i++){ const x=420+i*216; const diff=i%2===1; s+=box(x,420,150,150,{stroke:C.gray,fill:C.dark})+`<circle cx="${x}" cy="370" r="18" fill="${C.bg}"/>`+icon('shirt',x,440,70,C.dim,3); if(lt>5.2 && diff) s+=icon('heart',x,270,60,C.o,4); } return s;}},
 {at:1.6, f:(lt)=> person(420+ (Math.min(lt/3,1))*1080,700,60,C.fg,'f')},
 {at:5.6, f:()=> txt(CX,820,'免疫の遺伝子が<o>自分と違う</o>男性の匂いほど「心地よい」',{size:42,serif:true})},
]},
// 16 keyholes
{chapterTag:'第2章　鼻は何を読んでいるのか', els:[
 {at:0, f:()=> icon('lock',CX-420,360,130,C.t,4)+txt(CX-420,470,'父の鍵穴',{size:34,color:C.t})+icon('lock',CX+420,360,130,C.o,4)+txt(CX+420,470,'母の鍵穴',{size:34,color:C.o})},
 {at:3.5, f:(lt)=> arrow(CX-330,420,CX-90,560,C.dim,ease(lt))+arrow(CX+330,420,CX+90,560,C.dim,ease(lt))+person(CX,690,70,C.fg)+`<circle cx="${CX-26}" cy="${690-20}" r="12" fill="${C.t}"/><circle cx="${CX+26}" cy="${690-20}" r="12" fill="${C.o}"/>`},
 {at:5.5, f:(lt,t)=>{ let s=''; for(let i=0;i<5;i++){ const a=i*1.25+0.3; const r=270-60*Math.max(0,Math.sin(t*1.5+i)); s+=icon('virus',CX+Math.cos(a)*r*1.4,690+Math.sin(a)*r*0.45-40,80,C.dim,4);} return s;}},
 {at:8.0, f:()=> txt(CX,860,'違うほど、たくさんの敵に対応できる',{size:42,serif:true})},
]},
// 17 "ここから"
{chapterTag:'第2章　鼻は何を読んでいるのか', els:[
 {at:0, out:1.8, f:()=> txt(CX,CY,'よくある解説は、ここで終わる',{size:56,serif:true,color:C.dim})},
 {at:2.3, f:(lt)=> `<rect x="${CX-300*ease(lt/0.6)}" y="${CY+40}" width="${600*ease(lt/0.6)}" height="4" fill="${C.o}"/>`+txt(CX,CY,'ここから',{size:130,serif:true,color:C.o})},
]},
// 18 pill shifts preference
{chapterTag:'第2章　鼻は何を読んでいるのか', els:[
 {at:0, f:()=> person(CX-480,560,90,C.gray)+txt(CX-480,730,'自分と似た男性',{size:36,color:C.dim})+person(CX+480,560,90,C.gray)+txt(CX+480,730,'自分と違う男性',{size:36,color:C.dim})+person(CX,560,80,C.fg,'f')},
 {at:0.6, f:(lt)=>{ const p=ease((lt-4)/2.5); const tx=CX+(1-p)*330-p*330; return arrow(CX,470,tx,470,C.o,1,7);}},
 {at:3.0, f:()=> icon('pill',CX,300,110,C.t,4)+txt(CX,240,'ピル',{size:40,color:C.t})},
 {at:6.5, f:()=> txt(CX,860,'好みが「似た人」のほうへ<o>ずれていった</o>',{size:42,serif:true})},
]},
// 19 partner status
{chapterTag:'第2章　鼻は何を読んでいるのか', els:[
 {at:0, f:()=> person(CX-420,520,90,C.fg,'f')+txt(CX-420,690,'恋人なし',{size:40})+person(CX+420,520,90,C.fg,'f')+icon('heart',CX+420,330,56,C.o,4)+txt(CX+420,690,'恋人あり',{size:40,color:C.o})},
 {at:1.6, f:()=> txt(CX-420,800,'→ <t>似た</t>男性の匂い',{size:42})},
 {at:4.0, f:()=> txt(CX+420,800,'→ <o>違う</o>男性の匂い',{size:42})},
]},
// 20 partnered woman glances elsewhere
{chapterTag:'第2章　鼻は何を読んでいるのか', els:[
 {at:0, f:()=> person(CX-200,560,90,C.gray)+person(CX,560,90,C.fg,'f')+icon('heart',CX-100,380,50,C.gray,4)},
 {at:2.0, f:(lt,t)=> person(CX+460,560,90,C.dark)+scent(CX+40,470,CX+400,470,C.o,t,{n:2,amp:14,prog:ease(lt/2)})},
 {at:5.5, f:()=> txt(CX,820,'ひそかに<o>別の遺伝子</o>を求めている名残？',{size:44,serif:true})},
]},
// 21 Japan couples
{chapterTag:'第2章　鼻は何を読んでいるのか', els:[
 {at:0, f:()=>{ // stylized Japan arc of dots
   let s=''; const pts=[[1240,190],[1210,250],[1180,310],[1140,370],[1090,420],[1030,460],[960,500],[890,530],[820,560],[760,600],[720,640],[690,690]]; pts.forEach((p,i)=>{ s+=`<circle cx="${p[0]}" cy="${p[1]}" r="${22}" fill="${C.dark}" stroke="${C.gray}" stroke-width="2"/>`; }); return s; }},
 {at:0.8, f:(lt)=>{ let s=''; const pts=[[1240,190],[1180,310],[1090,420],[960,500],[820,560],[720,640]]; pts.forEach((p,i)=>{ if(lt>i*0.3) s+=person(p[0]-12,p[1]-6,12,C.fg)+person(p[0]+12,p[1]-6,12,C.fg,'f'); }); return s;}},
 {at:1.6, f:()=> txt(420,330,'約450組の夫婦',{size:56,serif:true,anchor:'start'})+txt(420,400,'東北をはじめ全国',{size:36,anchor:'start',color:C.dim})},
 {at:6.0, f:()=> box(560,520,480,96,{stroke:C.o,fill:C.bg})+txt(560,537,'強い傾向は見つからず',{size:42,color:C.o})},
]},
// 22 hutterites
{chapterTag:'第2章　鼻は何を読んでいるのか', els:[
 {at:0, f:()=> icon('village',CX,330,260,C.fg,4)+txt(CX,190,'アメリカ　フッター派の共同体',{size:38,color:C.dim})},
 {at:2.0, f:()=> txt(CX,560,'400組あまりの夫婦',{size:48,serif:true})},
 {at:4.5, f:(lt)=> person(CX-160,740,50,C.t)+person(CX+160,740,50,C.o,'f')+txt(CX,700,'同じ型を避ける',{size:36,color:C.o})+`<path d="M${CX-100},720 L${CX+100},720" stroke="${C.o}" stroke-width="4" stroke-dasharray="10 8"/>`},
]},
// 23 village vs city
{chapterTag:'第2章　鼻は何を読んでいるのか', els:[
 {at:0, f:()=> icon('village',CX-430,330,200,C.fg,4)+txt(CX-430,180,'小さな共同体',{size:40})+icon('nose',CX-430,580,170,C.o,5)},
 {at:5.0, f:(lt)=> icon('city',CX+430,330,200,C.fg,4)+txt(CX+430,180,'大きな社会',{size:40})+icon('nose',CX+430,600,60,C.o,4)+
   ['学歴','地域','収入','育ち'].map((w,i)=> box(CX+430+[-150,150,-150,150][i],[520,520,680,680][i],200,70,{stroke:C.gray,fill:C.dark})+txt(CX+430+[-150,150,-150,150][i],[534,534,694,694][i],w,{size:32,color:C.dim})).join('')},
 {at:11.5, f:()=> txt(CX,860,'鼻の声は、雑音にかき消される',{size:42,serif:true})},
]},
// 24 nose arrow stops before marriage
{chapterTag:'第2章　鼻は何を読んでいるのか', els:[
 {at:0, f:(lt)=> icon('nose',CX-520,CY,170,C.o,5)+arrow(CX-400,CY,CX+300,CY,C.o,0.72*ease(lt/1.5))+icon('heart',CX+480,CY,170,C.gray,4)+txt(CX+480,CY+160,'結婚相手',{size:38,color:C.dim})},
 {at:2.2, f:()=> txt(CX,760,'日本人の鼻は、ほとんど口を出していなかった',{size:44,serif:true})},
]},
// 25 night window meter
{chapterTag:'第2章　鼻は何を読んでいるのか', els:[
 {at:0, f:()=> icon('moon',CX-460,250,90,C.dim,4)+`<rect x="${CX-560}" y="320" width="220" height="300" fill="#1a1e28" stroke="${C.gray}" stroke-width="4"/><path d="M${CX-450},320 v300 M${CX-560},470 h220" stroke="${C.gray}" stroke-width="4"/><rect x="${CX-555}" y="325" width="210" height="290" fill="${C.o}" opacity="0.10"/>`},
 {at:1.0, f:()=> txt(CX+260,270,'ドイツ　508人',{size:40,color:C.dim})},
 {at:3.4, f:(lt)=>{ const p=ease(lt/2); const a=Math.PI*(1-(0.35+0.35*p)); return `<path d="M${CX+60},560 A200,200 0 0 1 ${CX+460},560" fill="none" stroke="${C.dark}" stroke-width="30"/><path d="M${CX+60},560 A200,200 0 0 1 ${CX+260+200*Math.cos(a)},${560-200*Math.sin(a)}" fill="none" stroke="${C.o}" stroke-width="30"/>`+txt(CX+260,640,'夜の生活の満足度',{size:38});}},
 {at:5.5, f:()=> txt(CX,820,'免疫の遺伝子が<o>違う</o>カップルほど、満足している傾向',{size:42,serif:true})},
]},
// 26 before / after
{chapterTag:'第2章　鼻は何を読んでいるのか', els:[
 {at:0, f:()=> txt(CX-420,200,'選ぶ前',{size:46,serif:true})+icon('eye',CX-560,400,120,C.fg,4)+icon('money',CX-420,400,110,C.fg,4)+icon('house',CX-280,400,110,C.fg,4)+icon('nose',CX-420,600,60,C.gray,4)},
 {at:4.6, f:()=> txt(CX+420,200,'選んだあと',{size:46,serif:true,color:C.o})+icon('nose',CX+420,440,220,C.o,5)},
 {at:0, f:()=> `<path d="M${CX},180 v540" stroke="${C.dark}" stroke-width="3"/>`},
]},
// 27 chapter 3
{chapterTag:'第3章　体が漏らす合図', els:[
 ...chapter('第3章','体が漏らす合図'),
 {at:2.6, f:(lt,t)=> person(CX,760,48,C.fg)+waves(CX,700,C.t,t,120,3)},
]},
// 28 tears collected
{chapterTag:'第3章　体が漏らす合図', els:[
 {at:0, f:()=> txt(CX,170,'2011年　イスラエル',{size:38,color:C.dim})},
 {at:0.3, f:(lt)=> person(CX-420,560,90,C.fg,'f')+icon('tear',CX-380,430+((lt*60)%120),36,C.t,4)},
 {at:2.0, f:()=> `<path d="M${CX-60},400 L${CX-60},620 Q${CX-60},660 ${CX-20},660 L${CX+20},660 Q${CX+60},660 ${CX+60},620 L${CX+60},400" fill="none" stroke="${C.fg}" stroke-width="4"/><rect x="${CX-56}" y="560" width="112" height="96" fill="${C.t}" opacity="0.4"/>`},
 {at:4.5, f:(lt,t)=> person(CX+420,560,90,C.fg)+`<rect x="${CX+380}" y="${560-100}" width="80" height="16" fill="${C.bg}"/>`+scent(CX+70,500,CX+360,470,C.t,t,{n:2,amp:10,prog:ease(lt/1.5)})},
 {at:7.0, f:()=> txt(CX+420,760,'何を嗅いでいるかは知らない',{size:34,color:C.dim})},
]},
// 29 tears results
{chapterTag:'第3章　体が漏らす合図', els:[
 {at:0, f:()=> txt(560,200,'食塩水と比べると…',{size:40,color:C.dim})},
 {at:4.0, f:(lt)=>{ const p=easeOut(lt/1.5); let s='';
   [['性的な興奮',0],['男性ホルモン',1]].forEach(([l,i])=>{ const x=360+i*420; s+=txt(x+80,800,l,{size:34});
     s+=`<rect x="${x}" y="${720-300}" width="70" height="300" fill="${C.gray}"/>`+`<rect x="${x+90}" y="${720-300+90*p}" width="70" height="${300-90*p}" fill="${C.t}"/>`; });
   s+=`<rect x='360' y='250' width='26' height='26' fill='${C.gray}'/>`+txt(396,272,'食塩水',{size:32,anchor:'start',color:C.dim})+`<rect x='540' y='250' width='26' height='26' fill='${C.t}'/>`+txt(576,272,'涙',{size:32,anchor:'start',color:C.t}); return s;}},
 {at:9.5, f:(lt)=> icon('brain',1460,450,300,C.fg,4)+`<circle cx="1430" cy="470" r="${40}" fill="${lt>1?C.gray:C.o}" opacity="0.7"/>`+txt(1460,700,'興奮に関わる部分が弱まる',{size:34})},
]},
// 30 brake
{chapterTag:'第3章　体が漏らす合図', els:[
 {at:0, f:(lt)=> `<g transform="rotate(${-Math.min(lt,2)*40} ${CX} ${CY-40})">${icon('brake',CX,CY-40,260,C.t,5)}</g>`},
 {at:0.5, f:()=> txt(CX,700,'欲望に、ブレーキ',{size:56,serif:true})},
 {at:6.5, f:()=> txt(CX,800,'※涙の提供者はごく少数。どこまで一般的かは未確定',{size:34,color:C.dim})},
]},
// 31 nightclub
{chapterTag:'第3章　体が漏らす合図', els:[
 {at:0, f:(lt,t)=> `<g filter="url(#glow)" opacity="${0.75+0.25*Math.sin(t*6)}">${icon('neon',CX,300,260,C.o,5)}</g>`+txt(CX,140,'アメリカのナイトクラブ',{size:38,color:C.dim})},
 {at:2.5, f:()=> { let s=''; for(let i=0;i<18;i++) s+=person(460+i*58,620,22,C.fg,'f'); return s+txt(CX,720,'ダンサー18人',{size:40});}},
 {at:5.0, f:()=> icon('calendar',CX-180,840,90,C.fg,4)+icon('wallet',CX+180,840,90,C.o,4)+txt(CX,856,'60日間',{size:40})},
]},
// 32 tips bars
{chapterTag:'第3章　体が漏らす合図', els:[
 {at:0, f:()=> txt(CX,180,'5時間のシフトあたりのチップ（平均）',{size:38,color:C.dim})},
 {at:0.3, f:(lt)=> bars(760,270,700,[{label:'排卵の時期',v:335,c:C.o,txt:'約335ドル'},{label:'それ以外',v:260,c:C.gray,txt:'約260ドル'},{label:'生理中',v:185,c:C.gray,txt:'約185ドル'}],400,lt,{bh:76,gap:44})},
 {at:11.0, f:()=> box(CX,780,820,80,{stroke:C.t})+txt(CX,794,'ピルを飲んでいたダンサーには、この山がない',{size:36,color:C.t})},
]},
// 33 customer question
{chapterTag:'第3章　体が漏らす合図', els:[
 {at:0, f:()=> person(CX,600,100,C.fg)},
 {at:0.5, f:(lt)=> ['匂い？','表情？','ふるまい？'].map((w,i)=> lt>i*0.9? txt(CX-360+i*360,300,w,{size:46,color:i===0?C.o:C.fg}):'').join('')},
 {at:5.0, f:(lt)=> icon('wallet',CX+300,640,110,C.o,4)+`<path d="M${CX+260},${600-30*ease(lt)} l80,0" stroke="${C.o}" stroke-width="5"/>`},
 {at:6.5, f:()=> txt(CX,840,'言葉にされない何かが、財布を開かせた',{size:42,serif:true})},
]},
// 34 waves erased by spray
{chapterTag:'第3章　体が漏らす合図', els:[
 {at:0, f:(lt,t)=> person(CX-200,600,100,C.fg)+(t<6?waves(CX-200,520,C.t,t,260,4):'')+txt(CX-200,170,'遺伝子・悲しみ・周期',{size:38,color:C.t})},
 {at:5.0, f:(lt,t)=>{ let s=icon('spray',CX+380,420,140,C.fg,4); for(let i=0;i<60;i++){ const r=((i*37)%100)/100; const d=(lt*300+i*13)%420; s+=`<circle cx="${CX+330-d}" cy="${380+(r-0.5)*d*0.7}" r="${3+r*4}" fill="${C.dim}" opacity="${0.5*(1-d/420)}"/>`;} return s;}},
 {at:7.0, f:()=> txt(CX,860,'匂いを消すことは、何を隠している？',{size:44,serif:true})},
]},
// 35 chapter 4
{chapterTag:'第4章　薫と匂宮', els:[
 ...chapter('第4章','薫と匂宮'),
 {at:2.6, f:(lt,t)=> icon('incense',CX,760,120,C.t,4)+scent(CX,700,CX+20,600,C.t,t,{n:2,amp:12})},
]},
// 36 incense into robes/letters
{chapterTag:'第4章　薫と匂宮', els:[
 {at:0, f:(lt,t)=> icon('incense',CX,560,150,C.t,4)+scent(CX-10,480,CX-380,330,C.t,t,{n:2,amp:16,prog:ease(lt/2)})+scent(CX+10,480,CX+380,330,C.t,t+1,{n:2,amp:16,prog:ease(lt/2)})},
 {at:1.2, f:()=> icon('kimono',CX-440,300,170,C.fg,4)+icon('letter',CX+440,300,150,C.fg,4)},
 {at:4.2, f:()=> ['身分','教養','個性'].map((w,i)=> box(CX-300+i*300,780,220,76,{stroke:C.o})+txt(CX-300+i*300,795,w,{size:40,color:C.o})).join('')},
]},
// 37 ruined mansion with one scent line
{chapterTag:'第4章　薫と匂宮', els:[
 {at:0, f:()=> `<path d="M${CX-380},620 L${CX-380},420 L${CX-200},330 L${CX-40},430 L${CX+120},310 L${CX+380},420 L${CX+380},620 Z" fill="none" stroke="${C.gray}" stroke-width="4" stroke-dasharray="30 14 6 14"/><path d="M${CX-300},620 l40,-90 M${CX+250},620 l-30,-120" stroke="${C.gray}" stroke-width="3"/>`},
 {at:2.5, f:(lt,t)=> person(CX,600,50,C.dim,'heianf')+scent(CX,520,CX+40,200,C.t,t,{n:1,amp:20,w:5,prog:ease(lt/2)})},
 {at:7.0, f:()=> txt(CX,820,'財産を失っても残る、<t>その人の誇り</t>',{size:44,serif:true})},
]},
// 38 Kaoru
{chapterTag:'第4章　薫と匂宮', els:[
 {at:0, f:(lt,t)=> `<ellipse cx="${CX}" cy="${CY+20}" rx="320" ry="320" fill="url(#spot)"/>`+person(CX,600,110,C.fg,'heian')+scent(CX-60,460,CX-360,260,C.t,t,{n:2,amp:16})+scent(CX+60,460,CX+360,260,C.t,t+1,{n:2,amp:16})},
 {at:0.8, f:()=> txt(CX,200,'薫（かおる）',{size:60,serif:true,color:C.t})},
 {at:3.5, f:()=> txt(CX,830,'生まれつき、体から不思議な芳香を放つ',{size:42,serif:true})},
]},
// 39 Kaoru vs Niou
{chapterTag:'第4章　薫と匂宮', els:[
 {at:0, f:(lt,t)=> person(CX-380,600,100,C.fg,'heian')+scent(CX-380,480,CX-380,240,C.t,t,{n:2,amp:16})+txt(CX-380,780,'薫',{size:52,serif:true,color:C.t})+txt(CX-380,840,'生まれ持った匂い',{size:34,color:C.dim})},
 {at:1.5, f:(lt,t)=> person(CX+380,600,100,C.o,'heian')+scent(CX+420,600,CX+460,260,C.o,t,{n:3,amp:14,prog:ease(lt/2)})+txt(CX+380,780,'匂宮',{size:52,serif:true,color:C.o})+txt(CX+380,840,'作り込んだ匂い',{size:34,color:C.dim})},
 {at:6.5, f:()=> txt(CX,400,'VS',{size:80,serif:true,color:C.gray})},
]},
// 40 utsuri-ga (transferred scent)
{chapterTag:'第4章　薫と匂宮', els:[
 {at:0, f:()=> icon('kimono',CX,440,300,C.fg,4)},
 {at:1.5, f:(lt,t)=> scent(CX-500,250,CX-40,400,C.t,t,{n:2,amp:20,prog:ease(lt/2)})},
 {at:3.5, f:()=> person(CX+460,620,80,C.dim,'heian')+txt(CX+460,400,'…',{size:90,color:C.o})},
 {at:9.0, f:()=> txt(CX,830,'言葉より先に、匂いがすべてを告げる',{size:44,serif:true})},
]},
// 41 waka vertical
{chapterTag:'第4章　薫と匂宮', els:[
 {at:0, f:()=> icon('flower',CX-420,CY-20,200,C.t,4)+txt(CX-420,700,'橘',{size:44,serif:true,color:C.t})},
 {at:0.6, f:(lt)=>{ const lines=['五月まつ花橘の香をかげば','昔の人の袖の香ぞする']; let s=''; lines.forEach((l,i)=>{ const n=Math.floor(clamp((lt-i*1.6)/1.6,0,1)*l.length); s+=txt(CX+300-i*110,170,l.slice(0,n),{size:58,serif:true,vert:true,anchor:'start'}); }); return s+txt(CX+60,840,'古今和歌集',{size:30,color:C.dim});}},
]},
// 42 flower -> sleeve -> figure
{chapterTag:'第4章　薫と匂宮', els:[
 {at:0, f:()=> icon('flower',CX-560,CY,150,C.t,4)},
 {at:1.2, f:(lt)=> arrow(CX-450,CY,CX-170,CY,C.dim,ease(lt))+icon('kimono',CX,CY,170,C.fg,4)+txt(CX,CY+150,'袖の香り',{size:36,color:C.t})},
 {at:3.0, f:(lt)=> arrow(CX+150,CY,CX+400,CY,C.dim,ease(lt))+`<g filter="url(#blur)" opacity="0.8">${person(CX+580,CY+60,90,C.fg,'heianf')}</g>`+txt(CX+580,CY+210,'昔の恋人',{size:36,color:C.dim})},
 {at:5.5, f:()=> txt(CX,820,'記憶は、体ではなく<o>選んだ香り</o>として残る',{size:42,serif:true})},
]},
// 43 brain pathway
{chapterTag:'第4章　薫と匂宮', els:[
 {at:0, f:()=> icon('brain',CX+200,CY-20,420,C.gray,4)+`<circle cx="${CX+160}" cy="${CY+20}" r="46" fill="${C.o}" opacity="0.25"/>`+txt(CX+160,CY+110,'感情・記憶',{size:32,color:C.o})},
 {at:1.0, f:(lt)=> icon('eye',CX-600,CY-200,90,C.fg,4)+icon('ear',CX-600,CY-20,90,C.fg,4)+`<path d="M${CX-540},${CY-200} Q${CX-200},${CY-380} ${CX+200},${CY-200} Q${CX+300},${CY-120} ${CX+180},${CY-10}" fill="none" stroke="${C.gray}" stroke-width="5" stroke-dasharray="${1400*ease(lt/2)} 2000"/><path d="M${CX-540},${CY-20} Q${CX-150},${CY-260} ${CX+260},${CY-150} Q${CX+300},${CY-60} ${CX+190},${CY+10}" fill="none" stroke="${C.gray}" stroke-width="5" stroke-dasharray="${1400*ease(lt/2)} 2000"/>`+txt(CX-200,CY-340,'遠回り',{size:32,color:C.dim})},
 {at:3.5, f:(lt)=> icon('nose',CX-600,CY+200,100,C.o,5)+arrow(CX-530,CY+180,CX+110,CY+40,C.o,ease(lt/1),8)+txt(CX-200,CY+200,'ほぼ直行',{size:36,color:C.o})},
 {at:8.5, f:()=> txt(CX,860,'だから香りは、その人そのものとして記憶に残る',{size:40,serif:true})},
]},
// 44 spotlight shifts to Niou
{chapterTag:'エピローグ', els:[
 {at:0, f:(lt)=>{ const p=ease((lt-2)/2); const x=CX-380+760*p; return `<ellipse cx="${x}" cy="${CY+40}" rx="300" ry="340" fill="url(#spot)"/>`+person(CX-380,600,100,p<0.5?C.fg:C.gray,'heian')+person(CX+380,600,100,p>0.5?C.o:C.gray,'heian')+txt(CX-380,780,'生まれ持った匂い',{size:34,color:C.dim})+txt(CX+380,780,'選んだ香り',{size:34,color:p>0.5?C.o:C.dim});}},
 {at:4.5, f:()=> txt(CX,200,'香りで、自分を語ってきた',{size:50,serif:true})},
]},
// 45 drugstore shelf
{chapterTag:'エピローグ', els:[
 {at:0, f:()=> `<rect x="${CX-600}" y="240" width="1200" height="480" fill="none" stroke="${C.gray}" stroke-width="4"/><path d="M${CX-600},400 h1200 M${CX-600},560 h1200" stroke="${C.gray}" stroke-width="4"/>`},
 {at:0.6, f:(lt)=>{ let s=''; const names=['spray','perfume','spray','perfume','spray','perfume','spray','perfume']; for(let r=0;r<3;r++) for(let i=0;i<8;i++){ if(lt>(r*8+i)*0.07) s+=icon(names[(i+r)%8],CX-520+i*148,320+r*160,90,r===1?C.o:C.fg,3);} return s;}},
 {at:3.5, f:()=> txt(CX,830,'千年の、続き',{size:52,serif:true})},
]},
// 46 soft light two people
{chapterTag:'エピローグ', els:[
 {at:0, f:()=> `<ellipse cx="${CX}" cy="${CY}" rx="520" ry="360" fill="url(#spot)"/>`+person(CX-200,600,100,C.fg)+person(CX+200,600,100,C.fg,'f')},
 {at:2.0, f:()=> txt(CX,830,'清潔さも、思いやりも、大切だ',{size:44,serif:true})},
]},
// 47 perfume line reaches, body waves blocked
{chapterTag:'エピローグ', els:[
 {at:0, f:(lt,t)=> person(CX-500,600,100,C.fg)+person(CX+500,600,100,C.fg,'f')+scent(CX-420,470,CX+420,470,C.o,t,{n:3,amp:16,prog:ease(lt/2)})+txt(CX,330,'作った香り（見せたい自分）',{size:34,color:C.o})},
 {at:4.5, f:(lt,t)=> scent(CX-420,560,CX-420+500*ease(lt/2),560,C.t,t,{n:1,amp:8,w:3})+`<rect x="${CX+60}" y="520" width="10" height="90" fill="${C.gray}"/>`+txt(CX-100,660,'遺伝子・悲しみ・周期',{size:30,color:C.t})},
 {at:10.0, f:()=> txt(CX,840,'人類で一番古い相性の確かめ方を、手放している',{size:42,serif:true})},
]},
// 48 back to shirt, two lines entwine
{chapterTag:'エピローグ', els:[
 {at:0, f:()=> icon('hanger',CX,250,190,C.dim,4) + icon('shirt',CX,440,300,C.fg,4)},
 {at:1.0, f:(lt,t)=> scent(CX-500,200,CX+500,700,C.o,t,{n:1,amp:40,w:5,prog:ease(lt/3)})+scent(CX+500,200,CX-500,700,C.t,t+0.7,{n:1,amp:40,w:5,prog:ease(lt/3)})},
 {at:6.0, f:()=> txt(CX,850,'いちばん正直な、答え合わせ',{size:48,serif:true})},
]},
// 49 outro
{els:[
 {at:0, f:()=> txt(CX,380,'今日のネタバレは、ここまで。',{size:64,serif:true})},
 {at:1.0, f:()=> txt(CX,520,'世界のネタバレ',{size:90,serif:true,color:C.o,ls:8})},
 {at:2.2, f:()=> `<rect x="${CX-170}" y="610" width="340" height="80" rx="40" fill="${C.o}"/>`+txt(CX,664,'チャンネル登録',{size:38,color:'#111'})},
 {at:3.0, f:()=> txt(CX,800,'音声：VOICEVOX:青山龍星',{size:28,color:C.dim})},
]},
];
