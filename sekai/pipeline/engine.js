// ===== なぜなに解剖室 図解エンジン =====
const W = 1920, H = 1080;
const C = { bg:'#0e1014', fg:'#ECECEC', dim:'#7c8496', gray:'#4a505e', dark:'#23272f', o:'#FF8A3D', t:'#3DC6C1', red:'#e0564b' };
const NS = 'http://www.w3.org/2000/svg';
const SERIF = "'Noto Serif CJK JP', serif", SANS = "'Noto Sans CJK JP', sans-serif";

const ease = x => { x = Math.min(Math.max(x,0),1); return x*x*(3-2*x); };
const easeOut = x => { x = Math.min(Math.max(x,0),1); return 1-Math.pow(1-x,3); };
const clamp = (x,a,b)=>Math.min(Math.max(x,a),b);

// ---------- icons (line style, drawn in a 100x100 box centered at 0,0) ----------
const ICONS = {
 shirt: `<path d="M-30,-38 L-12,-44 Q0,-34 12,-44 L30,-38 L46,-16 L32,-6 L26,-14 L26,44 L-26,44 L-26,-14 L-32,-6 L-46,-16 Z"/>`,
 hanger: `<path d="M0,-50 q8,0 8,-8 q0,-8 -8,-8 q-8,0 -8,8"/><path d="M0,-50 L-46,-30 L46,-30 Z"/>`,
 nose: `<path d="M-6,-44 Q-4,-10 -22,14 Q-30,26 -16,30 Q-8,32 -4,26 Q0,34 8,30 Q22,26 14,14 Q-2,-6 6,-44"/>`,
 dna: `<path d="M-22,-48 C22,-34 22,-14 0,-4 C-22,6 -22,26 22,40"/><path d="M22,-48 C-22,-34 -22,-14 0,-4 C22,6 22,26 -22,40"/><path d="M-14,-38 L14,-38 M-16,-20 L16,-20 M-16,12 L16,12 M-14,30 L14,30"/>`,
 perfume: `<rect x="-26" y="-14" width="52" height="58" rx="10"/><rect x="-10" y="-28" width="20" height="14"/><rect x="-14" y="-44" width="28" height="16" rx="4"/>`,
 spray: `<rect x="-20" y="-24" width="40" height="70" rx="8"/><rect x="-12" y="-40" width="24" height="16"/><path d="M12,-34 L22,-34"/>`,
 incense: `<path d="M-40,0 Q-40,34 0,34 Q40,34 40,0 Z"/><path d="M-46,0 L46,0"/><path d="M-20,34 L-26,46 M20,34 L26,46"/><path d="M-10,-6 Q-20,-20 -8,-30 Q4,-40 -6,-52 M10,-6 Q0,-22 12,-32 Q22,-42 12,-54" stroke-width="3"/>`,
 ear: `<path d="M18,30 Q30,10 30,-10 Q30,-44 0,-44 Q-28,-44 -28,-14 Q-28,0 -18,4 Q-8,8 -10,20 Q-12,40 6,44 Q14,46 18,30"/><path d="M-10,-14 Q-10,-28 4,-28 Q16,-28 16,-12 Q16,0 4,4" stroke-width="3"/>`,
 tear: `<path d="M0,-46 Q30,0 30,16 Q30,44 0,44 Q-30,44 -30,16 Q-30,0 0,-46 Z"/>`,
 brain: `<path d="M-8,-40 Q-30,-46 -38,-28 Q-52,-22 -46,-4 Q-54,12 -40,22 Q-36,40 -16,38 Q-6,46 4,38 L4,-36 Q0,-44 -8,-40 Z"/><path d="M8,-40 Q30,-46 38,-28 Q52,-22 46,-4 Q54,12 40,22 Q36,40 16,38 Q8,44 4,38" /><path d="M-30,-12 Q-18,-8 -20,6 M-22,22 Q-12,18 -8,26 M28,-12 Q18,-6 22,8" stroke-width="3"/>`,
 wallet: `<rect x="-42" y="-26" width="84" height="56" rx="8"/><path d="M-42,-14 L30,-14"/><rect x="18" y="-4" width="24" height="18" rx="4"/>`,
 calendar: `<rect x="-38" y="-30" width="76" height="70" rx="6"/><path d="M-38,-10 L38,-10 M-20,-40 L-20,-22 M20,-40 L20,-22"/><path d="M-22,6 h8 M-4,6 h8 M14,6 h8 M-22,22 h8 M-4,22 h8" stroke-width="5"/>`,
 key: `<circle cx="-18" cy="0" r="18"/><path d="M0,0 L44,0 M30,0 L30,14 M40,0 L40,10"/>`,
 lock: `<rect x="-30" y="-6" width="60" height="48" rx="6"/><path d="M-18,-6 L-18,-22 Q-18,-42 0,-42 Q18,-42 18,-22 L18,-6"/>`,
 virus: `<circle r="22"/><path d="M0,-22 v-14 M0,22 v14 M-22,0 h-14 M22,0 h14 M-16,-16 l-10,-10 M16,16 l10,10 M16,-16 l10,-10 M-16,16 l-10,10"/>`,
 house: `<path d="M-40,-4 L0,-40 L40,-4"/><path d="M-30,-12 L-30,40 L30,40 L30,-12"/><rect x="-8" y="16" width="16" height="24"/>`,
 moon: `<path d="M10,-40 Q-34,-36 -34,4 Q-34,42 10,42 Q-14,26 -14,2 Q-14,-26 10,-40 Z"/>`,
 flower: `<circle r="9"/><g><ellipse cx="0" cy="-24" rx="10" ry="16"/><ellipse cx="0" cy="24" rx="10" ry="16"/><ellipse cx="-24" cy="0" rx="16" ry="10"/><ellipse cx="24" cy="0" rx="16" ry="10"/></g>`,
 letter: `<rect x="-42" y="-28" width="84" height="56" rx="4"/><path d="M-42,-28 L0,6 L42,-28"/>`,
 eye: `<path d="M-46,0 Q0,-40 46,0 Q0,40 -46,0 Z"/><circle r="12"/>`,
 money: `<circle r="40"/><path d="M-16,-22 L0,0 L16,-22 M0,0 L0,26 M-14,4 L14,4 M-14,14 L14,14"/>`,
 heart: `<path d="M0,40 Q-46,4 -40,-18 Q-34,-40 -12,-36 Q0,-32 0,-20 Q0,-32 12,-36 Q34,-40 40,-18 Q46,4 0,40 Z"/>`,
 pill: `<rect x="-40" y="-16" width="80" height="32" rx="16"/><path d="M0,-16 L0,16"/>`,
 city: `<path d="M-46,44 L-46,-10 L-24,-10 L-24,44 M-24,44 L-24,-40 L2,-40 L2,44 M2,44 L2,-20 L24,-20 L24,44 M24,44 L24,0 L46,0 L46,44 Z"/>`,
 village: `<path d="M-46,40 L-46,8 L-30,-8 L-14,8 L-14,40 M-14,40 L-14,0 L6,-20 L26,0 L26,40 M26,40 L26,14 L38,2 L50,14 L50,40"/><path d="M-50,40 L54,40"/>`,
 brake: `<circle r="40"/><circle r="22"/><path d="M-28,-28 Q-46,0 -28,28" stroke-width="10"/>`,
 window: `<rect x="-36" y="-44" width="72" height="88" rx="4"/><path d="M0,-44 L0,44 M-36,0 L36,0"/>`,
 book: `<path d="M0,-30 Q-24,-42 -46,-34 L-46,36 Q-24,28 0,40 Q24,28 46,36 L46,-34 Q24,-42 0,-30 Z M0,-30 L0,40"/>`,
 gene: `<path d="M-40,0 h80"/><path d="M-30,-14 v28 M-15,-14 v28 M0,-14 v28 M15,-14 v28 M30,-14 v28"/>`,
 kimono: `<path d="M-14,-44 L0,-20 L14,-44 L40,-34 L52,10 L30,14 L26,46 L-26,46 L-30,14 L-52,10 L-40,-34 Z"/><path d="M-14,-44 L6,10 M14,-44 L-6,10"/>`,
 shelf: `<rect x="-60" y="-46" width="120" height="92"/><path d="M-60,-14 h120 M-60,18 h120"/>`,
 neon: `<rect x="-56" y="-30" width="112" height="60" rx="10"/><path d="M-34,10 L-34,-10 L-14,10 L-14,-10 M4,-10 h20 M4,0 h16 M4,10 h20" stroke-width="5"/>`,
 question: `<path d="M-18,-20 Q-18,-44 2,-44 Q22,-44 22,-24 Q22,-10 4,-2 Q-2,2 -2,14"/><circle cx="-2" cy="32" r="5" fill="currentColor"/>`,
 meter: `<path d="M-46,20 A46,46 0 0 1 46,20"/><path d="M-36,20 h6 M36,20 h-6 M0,-24 v8"/>`,
};

function icon(name, x, y, s, color, sw){ sw = sw||5;
  return `<g transform="translate(${x},${y}) scale(${s/100})" fill="none" stroke="${color}" stroke-width="${sw*100/s*0.55}" stroke-linecap="round" stroke-linejoin="round" style="color:${color}">${ICONS[name]}</g>`; }

// ---------- person pictogram (height ~ 2.4*s) ----------
function person(x, y, s, color, kind, extra){ kind = kind||'m'; extra=extra||{};
  const head = `<circle cx="0" cy="${-s*1.0}" r="${s*0.36}" fill="${color}"/>`;
  let body;
  if (kind==='f') body = `<path d="M${-s*0.22},${-s*0.58} L${s*0.22},${-s*0.58} L${s*0.55},${s*0.55} L${-s*0.55},${s*0.55} Z" fill="${color}"/><rect x="${-s*0.2}" y="${s*0.55}" width="${s*0.14}" height="${s*0.6}" fill="${color}"/><rect x="${s*0.06}" y="${s*0.55}" width="${s*0.14}" height="${s*0.6}" fill="${color}"/>`;
  else if (kind==='heian') body = `<path d="M${-s*0.2},${-s*0.6} L${s*0.2},${-s*0.6} L${s*0.9},${s*1.15} L${-s*0.9},${s*1.15} Z" fill="${color}"/><rect x="${-s*0.16}" y="${-s*1.75}" width="${s*0.32}" height="${s*0.5}" rx="${s*0.06}" fill="${color}"/>`;
  else if (kind==='heianf') body = `<path d="M${-s*0.2},${-s*0.6} L${s*0.2},${-s*0.6} L${s*1.0},${s*1.15} L${-s*1.0},${s*1.15} Z" fill="${color}"/><path d="M${-s*0.34},${-s*1.1} Q${-s*0.6},${0} ${-s*0.3},${s*0.9} L${-s*0.1},${-s*0.6}Z" fill="${color}"/>`;
  else body = `<rect x="${-s*0.42}" y="${-s*0.58}" width="${s*0.84}" height="${s*1.1}" rx="${s*0.22}" fill="${color}"/><rect x="${-s*0.34}" y="${s*0.45}" width="${s*0.28}" height="${s*0.72}" rx="${s*0.08}" fill="${color}"/><rect x="${s*0.06}" y="${s*0.45}" width="${s*0.28}" height="${s*0.72}" rx="${s*0.08}" fill="${color}"/>`;
  return `<g transform="translate(${x},${y})">${head}${body}</g>`; }

// ---------- scent line: flowing wavy path ----------
function scent(x1,y1,x2,y2,color,t,opt){ opt=opt||{}; const amp=opt.amp||18, n=opt.n||3, prog=opt.prog==null?1:opt.prog, w=opt.w||4;
  let out='';
  for(let k=0;k<n;k++){ let d=''; const steps=60; const off=(k-(n-1)/2)*(opt.sep||14);
    for(let i=0;i<=steps*prog;i++){ const u=i/steps; const x=x1+(x2-x1)*u, y=y1+(y2-y1)*u;
      const nx=-(y2-y1), ny=(x2-x1); const L=Math.hypot(nx,ny)||1;
      const wv=Math.sin(u*Math.PI*3 - t*2.2 + k*1.3)*amp*Math.sin(u*Math.PI) + off*Math.sin(u*Math.PI);
      d+=(i?'L':'M')+(x+nx/L*wv).toFixed(1)+','+(y+ny/L*wv).toFixed(1); }
    out+=`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${0.35+0.5*(k===Math.floor(n/2))}"/>`; }
  return out; }

function waves(x,y,color,t,maxr,n){ maxr=maxr||160; n=n||4; let s='';
  for(let k=0;k<n;k++){ const p=((t*0.45+k/n)%1); s+=`<circle cx="${x}" cy="${y}" r="${30+p*maxr}" fill="none" stroke="${color}" stroke-width="3" opacity="${(1-p)*0.7}"/>`; }
  return s; }

function txt(x,y,str,o){ o=o||{}; const size=o.size||48, fam=o.serif?SERIF:SANS, col=o.color||C.fg, anchor=o.anchor||'middle', wt=o.weight||(o.serif?700:700);
  const s=str.replace(/<o>(.*?)<\/o>/g,`<tspan fill="${C.o}">$1</tspan>`).replace(/<t>(.*?)<\/t>/g,`<tspan fill="${C.t}">$1</tspan>`).replace(/<d>(.*?)<\/d>/g,`<tspan fill="${C.dim}">$1</tspan>`);
  return `<text x="${x}" y="${y}" font-family="${fam}" font-size="${size}" font-weight="${wt}" fill="${col}" text-anchor="${anchor}" letter-spacing="${o.ls||0}" ${o.vert?'writing-mode="vertical-rl"':''}>${s}</text>`; }

function arrow(x1,y1,x2,y2,color,prog,w){ prog=prog==null?1:prog; w=w||6; const x=x1+(x2-x1)*prog, y=y1+(y2-y1)*prog;
  const a=Math.atan2(y2-y1,x2-x1), h=w*3.2;
  return `<path d="M${x1},${y1} L${x},${y}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`+
   (prog>0.05?`<path d="M${x+Math.cos(a)*h*0.4},${y+Math.sin(a)*h*0.4} L${x-Math.cos(a-0.5)*h},${y-Math.sin(a-0.5)*h} L${x-Math.cos(a+0.5)*h},${y-Math.sin(a+0.5)*h} Z" fill="${color}"/>`:''); }

function box(x,y,w,h,o){ o=o||{}; return `<rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="${o.r||16}" fill="${o.fill||'none'}" stroke="${o.stroke||C.gray}" stroke-width="${o.sw||3}" ${o.dash?'stroke-dasharray="10 10"':''}/>`; }

function grid(x,y,cols,rows,cell,colored,col,t){ let s=''; let n=0; const total=cols*rows;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){ const k=r*cols+c; const on=k<colored*total*clamp(t,0,1);
    s+=person(x+c*cell, y+r*cell*1.45, cell*0.3, on?col:C.gray); }
  return s; }

function bars(x,y,w,items,maxv,t,o){ o=o||{}; let s=''; const bh=o.bh||70, gap=o.gap||40;
  items.forEach((it,i)=>{ const yy=y+i*(bh+gap); const p=easeOut(clamp((t-(o.t0||0)-i*0.35)/1.2,0,1));
    s+=txt(x-24,yy+bh*0.68,it.label,{size:o.ls||38,anchor:'end',weight:500});
    s+=`<rect x="${x}" y="${yy}" width="${w}" height="${bh}" fill="${C.dark}" rx="6"/>`;
    s+=`<rect x="${x}" y="${yy}" width="${w*it.v/maxv*p}" height="${bh}" fill="${it.c||C.o}" rx="6"/>`;
    if(it.txt) s+=txt(x+w*it.v/maxv*p+20,yy+bh*0.7,it.txt,{size:o.vs||42,anchor:'start',color:it.c||C.o}); });
  return s; }

// ---------- element runner ----------
// el: {at, out, f:(t,local)=>svg, slide}
function runScene(els, t, dur){ let s='';
  for(const e of els){ const at=e.at||0; if(t<at) continue; const out=e.out==null?1e9:e.out; if(t>out+0.5) continue;
    let a=ease((t-at)/(e.fade||0.6)); if(t>out) a*=1-ease((t-out)/0.5);
    const dy=(1-ease((t-at)/0.7))*(e.slide==null?24:e.slide);
    s+=`<g opacity="${a.toFixed(3)}" transform="translate(0,${dy.toFixed(1)})">${e.f(t-at,t)}</g>`; }
  return s; }

// ---------- frame ----------
function frame(sc, t, dur, sub){
  const zoom = 1 + 0.025*(t/Math.max(dur,1));
  let inner = runScene(sc.els, t, dur);
  // scene fade in/out
  const fin = sc.noFade?1:ease(t/0.35), fout = sc.noFade?1:ease((dur-t)/0.35);
  let svg = `<svg xmlns="${NS}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
   <defs><radialGradient id="vg" cx="50%" cy="45%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.75"/></radialGradient>
   <radialGradient id="spot" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff" stop-opacity="0.18"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient>
   <filter id="blur"><feGaussianBlur stdDeviation="6"/></filter>
   <filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
   <rect width="${W}" height="${H}" fill="${C.bg}"/>
   <g opacity="${Math.min(fin,fout).toFixed(3)}" transform="translate(${W/2},${H/2-40}) scale(${zoom}) translate(${-W/2},${-H/2+40})">${inner}</g>
   <rect width="${W}" height="${H}" fill="url(#vg)"/>`;
  if (sub){ const s2=sub.replace(/([0-9][0-9.,]*(?:パーセント|ドル|人|組|年|割|時間|日|分の1)?)/g,'<o>$1</o>').replace(/([「『][^」』]*[」』])/g,'<o>$1</o>');
    svg += `<rect x="0" y="${H-150}" width="${W}" height="150" fill="#000" opacity="0.55"/>` + subText(s2); }
  if (sc.chapterTag) svg += txt(60,74,sc.chapterTag,{size:28,anchor:'start',color:C.dim,weight:500});
  svg += `</svg>`; return svg; }

function subText(s){ // wrap to max ~34 chars per line
  const plain=s.replace(/<\/?o>/g,''); const max=34;
  if (plain.length<=max) return txt(W/2,H-62,s,{size:46,weight:700});
  // split at nearest 、 to middle
  let mid=Math.floor(plain.length/2), best=-1;
  for(let d=0; d<14; d++){ for(const k of [mid+d, mid-d]){ if(plain[k]==='、'){ best=k; break;} } if(best>=0) break; }
  if(best<0) best=mid; // map plain idx to tagged string
  let cnt=0, cut=0, inTag=false; for(let i=0;i<s.length;i++){ if(s[i]==='<'){inTag=true;} if(!inTag){ if(cnt===best+1){cut=i;break;} cnt++; } if(s[i]==='>') inTag=false; }
  let a=s.slice(0,cut), b=s.slice(cut);
  // balance tags
  const open=(a.match(/<o>/g)||[]).length-(a.match(/<\/o>/g)||[]).length; if(open>0){ a+='</o>'; b='<o>'+b; }
  return txt(W/2,H-92,a,{size:42,weight:700})+txt(W/2,H-38,b,{size:42,weight:700}); }

window.FRAME = (i, t, dur, sub) => { document.body.innerHTML = frame(SCENES[i], t, dur, sub); };
