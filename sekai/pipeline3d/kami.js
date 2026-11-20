// 紙芝居（2D）シーン用の部品。3Dと同じ page.html で描く（字幕・粒子ノイズは共通）
// 見た目のルール（固定）：背景＝暖かい暗色＋薄い方眼／見出し＝明朝・本文＝ゴシック／
//   強調＝オレンジ、2系列目＝ティール、否定・ハンコ＝赤、ハイライト＝金。
// 動きのルール（固定）：出る＝0.45秒 ease-out（ポンと出る物は弾む）／要素は0.12秒ずつずらす／
//   場面のつなぎは fade・左右スライド・ズームを順番に使い分ける。
export const W = 1920, H = 1080;
export const C = { bg1: '#2b2631', bg2: '#141218', paper: '#f1e8d4', ink: '#2a2420', fg: '#f3efe6', dim: '#a49c90', gray: '#5a5560', dark: '#38333d',
  o: '#ff8a3d', t: '#3dc6c1', red: '#d8322a', gold: '#f0c75a', navy: '#4a5d84', pink: '#e58fa0', green: '#7fbf7a' };
export const SERIF = "'Noto Serif CJK JP',serif", SANS = "'Noto Sans CJK JP',sans-serif";
export const clamp = (x, a = 0, b = 1) => Math.min(Math.max(x, a), b);
export const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeOut = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
export const pop = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const fmt = n => Math.round(n).toLocaleString('en-US');

// ---------- 地図データ（world-atlas から作った maps.json） ----------
let MAPS = null;
export async function loadMaps() { if (!MAPS) MAPS = await (await fetch('/pipeline3d/maps.json')).json(); return MAPS; }
export const maps = () => MAPS;

// ---------- 文字 ----------
export function txt(x, y, s, o = {}) {
  const size = o.size || 48, fam = o.serif ? SERIF : SANS;
  const body = String(s).replace(/<o>(.*?)<\/o>/g, `<tspan fill="${C.o}">$1</tspan>`).replace(/<t>(.*?)<\/t>/g, `<tspan fill="${C.t}">$1</tspan>`).replace(/<g>(.*?)<\/g>/g, `<tspan fill="${C.gold}">$1</tspan>`).replace(/<r>(.*?)<\/r>/g, `<tspan fill="${C.red}">$1</tspan>`).replace(/<d>(.*?)<\/d>/g, `<tspan fill="${C.dim}">$1</tspan>`);
  return `<text x="${x}" y="${y}" font-family="${fam}" font-size="${size}" font-weight="${o.weight || 700}" fill="${o.color || C.fg}" text-anchor="${o.anchor || 'middle'}" letter-spacing="${o.ls || 0}" opacity="${o.op ?? 1}" ${o.vert ? 'writing-mode="vertical-rl"' : ''} ${o.shadow === false ? '' : 'filter="url(#ts)"'}>${body}</text>`;
}
export const note = (x, y, s, a = 'middle') => txt(x, y, s, { size: 24, color: C.dim, weight: 500, anchor: a });
// 見出し（場面の上に出す一行）
export const head = (s, o = {}) => txt(o.x ?? 960, o.y ?? 150, s, { size: o.size || 54, serif: true, ls: 2, anchor: o.anchor || 'middle' });
// 数字が回るカウンター
export function counter(x, y, v, lt, o = {}) { const p = easeOut(lt / (o.dur || 1.4)); const n = (o.from || 0) + (v - (o.from || 0)) * p;
  return txt(x, y, (o.pre || '') + (o.fmt ? o.fmt(n) : fmt(n)) + (o.suf || ''), { size: o.size || 150, color: o.color || C.o, anchor: o.anchor || 'middle', serif: o.serif }); }

// ---------- アイコン（線画、100x100） ----------
const ICONS = {
  dna: `<path d="M-22,-48 C22,-34 22,-14 0,-4 C-22,6 -22,26 22,40"/><path d="M22,-48 C-22,-34 -22,-14 0,-4 C22,6 22,26 -22,40"/><path d="M-14,-38 L14,-38 M-16,-20 L16,-20 M-16,12 L16,12 M-14,30 L14,30"/>`,
  nose: `<path d="M-6,-44 Q-4,-10 -22,14 Q-30,26 -16,30 Q-8,32 -4,26 Q0,34 8,30 Q22,26 14,14 Q-2,-6 6,-44"/>`,
  perfume: `<rect x="-26" y="-14" width="52" height="58" rx="10"/><rect x="-10" y="-28" width="20" height="14"/><rect x="-14" y="-44" width="28" height="16" rx="4"/>`,
  heart: `<path d="M0,40 Q-46,4 -40,-18 Q-34,-40 -12,-36 Q0,-32 0,-20 Q0,-32 12,-36 Q34,-40 40,-18 Q46,4 0,40 Z"/>`,
  key: `<circle cx="-18" cy="0" r="18"/><path d="M0,0 L44,0 M30,0 L30,14 M40,0 L40,10"/>`,
  book: `<path d="M0,-30 Q-24,-42 -46,-34 L-46,36 Q-24,28 0,40 Q24,28 46,36 L46,-34 Q24,-42 0,-30 Z M0,-30 L0,40"/>`,
  question: `<path d="M-18,-20 Q-18,-44 2,-44 Q22,-44 22,-24 Q22,-10 4,-2 Q-2,2 -2,14"/><circle cx="-2" cy="32" r="5" fill="currentColor"/>`,
  house: `<path d="M-40,-4 L0,-40 L40,-4"/><path d="M-30,-12 L-30,40 L30,40 L30,-12"/><rect x="-8" y="16" width="16" height="24"/>`,
  hotel: `<rect x="-36" y="-44" width="72" height="88" rx="4"/><path d="M-22,-28 h12 M10,-28 h12 M-22,-8 h12 M10,-8 h12 M-22,12 h12 M10,12 h12"/><rect x="-8" y="26" width="16" height="18"/>`,
  window: `<rect x="-36" y="-44" width="72" height="88" rx="4"/><path d="M0,-44 L0,44 M-36,0 L36,0"/>`,
  film: `<rect x="-46" y="-30" width="92" height="60" rx="4"/><path d="M-46,-18 h92 M-46,18 h92 M-30,-30 v12 M-14,-30 v12 M2,-30 v12 M18,-30 v12 M34,-30 v12 M-30,18 v12 M-14,18 v12 M2,18 v12 M18,18 v12 M34,18 v12"/>`,
  scissors: `<circle cx="-30" cy="-16" r="12"/><circle cx="-30" cy="16" r="12"/><path d="M-20,-10 L44,20 M-20,10 L44,-20"/>`,
  tablet: `<rect x="-34" y="-44" width="68" height="88" rx="10"/><path d="M-22,-28 l8,4 l-8,4 M-6,-28 l8,4 l-8,4 M10,-28 l8,4 l-8,4 M-22,-8 l8,4 l-8,4 M-6,-8 l8,4 l-8,4 M10,-8 l8,4 l-8,4 M-22,12 l8,4 l-8,4 M-6,12 l8,4 l-8,4"/>`,
  laurel: `<path d="M-6,40 Q-46,20 -40,-30 M6,40 Q46,20 40,-30"/><path d="M-40,-20 l-10,-6 M-42,-4 l-12,-2 M-38,12 l-12,4 M-28,26 l-10,8 M40,-20 l10,-6 M42,-4 l12,-2 M38,12 l12,4 M28,26 l10,8"/>`,
  timer: `<circle cx="0" cy="6" r="38"/><path d="M0,6 L0,-18 M-10,-44 h20 M0,-44 v12"/>`,
  calendar: `<rect x="-38" y="-30" width="76" height="70" rx="6"/><path d="M-38,-10 L38,-10 M-20,-40 L-20,-22 M20,-40 L20,-22"/>`,
  gate: `<path d="M-46,44 L-46,-30 M46,44 L46,-30 M-54,-30 L54,-30 M-50,-40 L50,-40"/>`,
  meter: `<path d="M-46,20 A46,46 0 0 1 46,20"/><path d="M-36,20 h6 M36,20 h-6 M0,-24 v8"/>`,
  lips: `<path d="M-46,0 Q-24,-26 0,-10 Q24,-26 46,0 Q24,30 0,30 Q-24,30 -46,0 Z"/><path d="M-46,0 Q0,10 46,0"/>`,
};
export function icon(name, x, y, s, color, sw = 5) {
  return `<g transform="translate(${x},${y}) scale(${s / 100})" fill="none" stroke="${color}" stroke-width="${sw * 100 / s * 0.55}" stroke-linecap="round" stroke-linejoin="round" style="color:${color}">${ICONS[name] || ''}</g>`;
}
// ---------- ピクト人物（高さ ≒ 2.4*s） kind: m / f / heian / heianf / officer ----------
export function person(x, y, s, color, kind = 'm') {
  const head = `<circle cx="0" cy="${-s}" r="${s * 0.36}" fill="${color}"/>`; let body = '';
  if (kind === 'f') body = `<path d="M${-s * .22},${-s * .58} L${s * .22},${-s * .58} L${s * .55},${s * .55} L${-s * .55},${s * .55} Z" fill="${color}"/><rect x="${-s * .2}" y="${s * .55}" width="${s * .14}" height="${s * .6}" fill="${color}"/><rect x="${s * .06}" y="${s * .55}" width="${s * .14}" height="${s * .6}" fill="${color}"/><path d="M${-s * .36},${-s * 1.2} Q${-s * .5},${-s * .6} ${-s * .3},${-s * .5} L${-s * .2},${-s * .9} Z" fill="${color}"/>`;
  else if (kind === 'heian') body = `<path d="M${-s * .2},${-s * .6} L${s * .2},${-s * .6} L${s * .9},${s * 1.15} L${-s * .9},${s * 1.15} Z" fill="${color}"/><rect x="${-s * .16}" y="${-s * 1.75}" width="${s * .32}" height="${s * .5}" rx="${s * .06}" fill="${color}"/>`;
  else if (kind === 'heianf') body = `<path d="M${-s * .2},${-s * .6} L${s * .2},${-s * .6} L${s},${s * 1.15} L${-s},${s * 1.15} Z" fill="${color}"/><path d="M${-s * .34},${-s * 1.1} Q${-s * .6},0 ${-s * .3},${s * .9} L${-s * .1},${-s * .6}Z" fill="${color}"/>`;
  else if (kind === 'officer') body = `<path d="M${-s * .5},${-s * 1.28} L${s * .5},${-s * 1.28} L${s * .62},${-s * 1.18} L${-s * .62},${-s * 1.18} Z M${-s * .34},${-s * 1.28} Q0,${-s * 1.72} ${s * .34},${-s * 1.28} Z" fill="${color}"/><rect x="${-s * .44}" y="${-s * .58}" width="${s * .88}" height="${s * 1.12}" rx="${s * .18}" fill="${color}"/><rect x="${-s * .34}" y="${s * .45}" width="${s * .28}" height="${s * .72}" fill="${color}"/><rect x="${s * .06}" y="${s * .45}" width="${s * .28}" height="${s * .72}" fill="${color}"/>`;
  else body = `<rect x="${-s * .42}" y="${-s * .58}" width="${s * .84}" height="${s * 1.1}" rx="${s * .22}" fill="${color}"/><rect x="${-s * .34}" y="${s * .45}" width="${s * .28}" height="${s * .72}" rx="${s * .08}" fill="${color}"/><rect x="${s * .06}" y="${s * .45}" width="${s * .28}" height="${s * .72}" rx="${s * .08}" fill="${color}"/>`;
  return `<g transform="translate(${x},${y})">${head}${body}</g>`;
}
// 横顔のシルエット（右向き）。couple() は唇が触れる直前の2人
export function profile(x, y, s, dir, woman, color) {
  return `<g transform="translate(${x},${y}) scale(${dir * s},${s})" fill="${color}"><path d="M-170,300 Q-120,220 -66,190 L-58,120 C-106,50 -104,-104 -20,-140 C40,-158 80,-122 80,-86 Q86,-62 82,-50 Q92,-34 112,-8 L132,12 Q116,24 92,20 Q98,28 110,36 Q98,40 98,43 Q112,50 100,60 Q84,60 88,72 Q92,92 72,102 Q46,108 44,130 L50,200 Q110,230 160,300 Z"/>${woman ? `<path d="M-20,-146 C70,-168 96,-110 60,-96 C-30,-80 -60,40 -40,140 C-30,220 -60,290 -110,300 C-170,180 -150,-125 -20,-146 Z"/>` : ''}</g>`;
}
export const couple = (cx, cy, s, gap, color) => profile(cx - gap / 2 - 110 * s, cy - 34 * s, s, 1, false, color) + profile(cx + gap / 2 + 110 * s * .92, cy - 28 * s, s * .92, -1, true, color);

// ---------- 図形 ----------
export const card = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 20}" fill="${o.fill || 'rgba(255,255,255,.06)'}" stroke="${o.stroke || 'rgba(255,255,255,.14)'}" stroke-width="${o.sw || 2}" ${o.sh ? 'filter="url(#sh)"' : ''}/>`;
export function arrow(x1, y1, x2, y2, color, prog = 1, w = 6) { const x = x1 + (x2 - x1) * prog, y = y1 + (y2 - y1) * prog, a = Math.atan2(y2 - y1, x2 - x1), h = w * 3.2;
  return `<path d="M${x1},${y1} L${x},${y}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>` + (prog > .05 ? `<path d="M${x + Math.cos(a) * h * .4},${y + Math.sin(a) * h * .4} L${x - Math.cos(a - .5) * h},${y - Math.sin(a - .5) * h} L${x - Math.cos(a + .5) * h},${y - Math.sin(a + .5) * h} Z" fill="${color}"/>` : ''); }
export function stamp(x, y, s, label, lt, o = {}) { const k = pop(lt / .3); const a = clamp(lt / .1);
  return `<g transform="translate(${x},${y}) rotate(${o.rot ?? -8}) scale(${(Math.max(.5, 1.5 - .5 * k)).toFixed(3)})" opacity="${a}"><rect x="${-s * label.length * .6 - 30}" y="${-s * .72}" width="${s * label.length * 1.2 + 60}" height="${s * 1.44}" fill="${o.fill || 'rgba(255,248,236,.9)'}" stroke="${C.red}" stroke-width="${s * .08}"/>${txt(0, s * .36, label, { size: s, color: C.red, serif: true, weight: 900, shadow: false })}</g>`; }
export function bubble(x, y, w, h, s, o = {}) { const tail = o.tail || 'left';
  return `<g transform="translate(${x},${y})" filter="url(#sh)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2.4}" fill="#fff"/><path d="${tail === 'left' ? `M${-w / 4},${h / 2 - 4} L${-w / 4 - 30},${h / 2 + 40} L${-w / 4 + 26},${h / 2 - 4}Z` : `M${w / 4},${h / 2 - 4} L${w / 4 + 30},${h / 2 + 40} L${w / 4 - 26},${h / 2 - 4}Z`}" fill="#fff"/>${txt(0, (o.size || 40) * .36, s, { size: o.size || 40, color: C.ink, shadow: false })}</g>`; }
export function hbars(x, y, w, items, maxv, lt, o = {}) { let s = ''; const bh = o.bh || 70, gap = o.gap || 40;
  items.forEach((it, i) => { const yy = y + i * (bh + gap); const p = easeOut((lt - (o.t0 || 0) - i * (o.stag ?? .25)) / .9);
    s += txt(x - 28, yy + bh * .7, it.label, { size: o.ls || 40, anchor: 'end', weight: 600 });
    s += `<rect x="${x}" y="${yy}" width="${w}" height="${bh}" fill="${C.dark}" rx="8"/><rect x="${x}" y="${yy}" width="${Math.max(0, w * it.v / maxv * p)}" height="${bh}" fill="${it.c || C.o}" rx="8"/>`;
    if (it.txt && p > .05) s += txt(x + w * it.v / maxv * p + 22, yy + bh * .74, it.txt, { size: o.vs || 46, anchor: 'start', color: it.c || C.o }); });
  return s; }
export function vbars(x, y, w, h, items, maxv, lt, o = {}) { const n = items.length, gap = o.gap || 60, bw = (w - gap * (n - 1)) / n; let s = '';
  items.forEach((it, i) => { const p = easeOut((lt - (o.t0 || 0) - i * (o.stag ?? .2)) / 1.0); const bh = h * it.v / maxv * p, xx = x + i * (bw + gap);
    s += `<rect x="${xx}" y="${y + h - bh}" width="${bw}" height="${bh}" fill="${it.c || C.o}" rx="8"/>` + txt(xx + bw / 2, y + h + 56, it.label, { size: o.ls || 40, weight: 600 });
    if (it.txt && p > .3) s += txt(xx + bw / 2, y + h - bh - 24, it.txt, { size: o.vs || 64, color: it.c || C.o }); });
  return s + `<path d="M${x - 20},${y + h} h${w + 40}" stroke="${C.gray}" stroke-width="4"/>`; }
export function donut(cx, cy, r, segs, prog, o = {}) { let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.dark}" stroke-width="${o.sw || 70}"/>`, a0 = -Math.PI / 2; const tot = segs.reduce((a, b) => a + b.v, 0);
  segs.forEach(sg => { const da = 2 * Math.PI * sg.v / tot * clamp(prog) * .999, a1 = a0 + da;
    if (da > .01 && sg.c) s += `<path d="M${(cx + r * Math.cos(a0)).toFixed(1)},${(cy + r * Math.sin(a0)).toFixed(1)} A${r},${r} 0 ${da > Math.PI ? 1 : 0} 1 ${(cx + r * Math.cos(a1)).toFixed(1)},${(cy + r * Math.sin(a1)).toFixed(1)}" stroke="${sg.c}" stroke-width="${o.sw || 70}" fill="none"/>`; a0 = a1; });
  return s; }
// 年表（横）。pts:[{at:0..1,label,sub,c}] k=進み具合
export function timeline(x, y, w, pts, k, o = {}) { let s = `<path d="M${x},${y} h${w * easeOut(k * 1.3)}" stroke="${C.gray}" stroke-width="5" stroke-linecap="round"/>`;
  pts.forEach((p, i) => { const a = clamp((k * 1.3 - p.at) * 4); if (a <= 0) return; const px = x + w * p.at, c = p.c || C.o;
    s += `<g opacity="${a}"><circle cx="${px}" cy="${y}" r="${14 * pop(a)}" fill="${c}"/>${txt(px, y - 40, p.label, { size: o.ls || 52, color: c, serif: true })}${p.sub ? txt(px, y + 72, p.sub, { size: o.ss || 34, weight: 600 }) : ''}${p.sub2 ? txt(px, y + 118, p.sub2, { size: 28, color: C.dim, weight: 500 }) : ''}</g>`; });
  return s; }
// 人型の格子：n人中 on 人を色付け
export function peopleGrid(x, y, cols, rows, cell, on, lt, cOn, cOff) { let s = ''; const tot = cols * rows, shown = Math.floor(on * easeOut(lt / 1.6));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const k = r * cols + c; s += person(x + c * cell, y + r * cell * 1.35, cell * .3, k < shown ? cOn : cOff); }
  return s; }
// 紙（書類）と巻物
export function paper(x, y, w, h, inner, o = {}) { return `<g transform="translate(${x},${y}) rotate(${o.rot || 0})" filter="url(#sh)"><rect width="${w}" height="${h}" rx="6" fill="${o.fill || C.paper}"/>${inner}</g>`; }
export function scrollBox(x, y, w, h, open, inner) { const ww = w * easeOut(open); const id = 'sc' + Math.round(x + y);
  return `<g transform="translate(${x},${y})" filter="url(#sh)"><clipPath id="${id}"><rect x="${w - ww}" y="0" width="${ww}" height="${h}"/></clipPath>
    <g clip-path="url(#${id})"><rect width="${w}" height="${h}" fill="#ece1c6"/>${inner}</g>
    <rect x="${w - ww - 18}" y="-14" width="22" height="${h + 28}" rx="10" fill="#7a3a1e"/><rect x="${w - 4}" y="-14" width="22" height="${h + 28}" rx="10" fill="#7a3a1e"/></g>`; }
export function kanaCols(w, h, skip = [], seed = 1) { let s = ''; const r = (i, k) => ((Math.sin(i * 12.9898 + k * 78.233 + seed) * 43758.5453) % 1 + 1) % 1;
  for (let c = 0; c < Math.floor(w / 54); c++) { const cx = w - 50 - c * 54; if (skip.some(([a, b]) => cx > a && cx < b)) continue; let yy = 40, k = 0;
    while (yy < h - 50) { const hh = 16 + r(c, k) * 26; s += `<rect x="${cx}" y="${yy}" width="${8 + r(k, c) * 6}" height="${hh}" fill="#2b2520" opacity="${.5 + r(c + 3, k) * .3}"/>`; yy += hh + 10 + r(k + 1, c) * 10; k++; } }
  return s; }
// スマホの枠（中身は inner を 0..w,0..h で描く）
export const phone = (x, y, w, h, inner) => `<g transform="translate(${x},${y})" filter="url(#sh)"><rect x="-16" y="-16" width="${w + 32}" height="${h + 32}" rx="44" fill="#121317"/><rect width="${w}" height="${h}" rx="30" fill="#f7f6f2"/>${inner}</g>`;

// ---------- 地図 ----------
// 世界地図（maps.json）。color(id,name)→色。s=倍率、x,y=左上
export function worldMap(x, y, s, color, o = {}) { const M = maps(); if (!M) return ''; const wd = M.world;
  let g = `<path d="${wd.sphere}" fill="${o.sea || '#1d2a36'}" opacity=".9"/>`;
  for (const c of wd.countries) g += `<path d="${c.d}" fill="${color ? color(c.id, c.name) || '#5d5a52' : '#5d5a52'}" stroke="${o.line || '#2b2631'}" stroke-width="${1 / s}"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">${g}</g>`; }
export const worldCentroid = (name) => { const c = maps()?.world.countries.find(c => c.name === name); return c ? c.c : [800, 400]; };
export function japanMap(x, y, s, o = {}) { const M = maps(); if (!M) return ''; const j = M.japan;
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="${j.d}" fill="${o.fill || '#e9e2d0'}" stroke="${o.stroke || 'rgba(0,0,0,.25)'}" stroke-width="${1.5 / s}"/></g>`; }

// ---------- 時間で出す要素 ----------
// [{at, out, f:(lt,t)=>svg, slide, sfx}]  sfx: pop / tick / stamp / chime / swish / count
export function run(els, t) { let s = '';
  for (const e of els) { const at = e.at || 0; if (e.sfx) cue(at, e.sfx); if (t < at) continue; const out = e.out ?? 1e9; if (t > out + .4) continue;
    let a = easeOut((t - at) / (e.fade || .45)); if (t > out) a *= 1 - ease((t - out) / .4);
    const dy = (1 - easeOut((t - at) / .55)) * (e.slide ?? 34), dx = (1 - easeOut((t - at) / .55)) * (e.dx ?? 0);
    s += `<g opacity="${a.toFixed(3)}" transform="translate(${dx.toFixed(1)},${dy.toFixed(1)})">${e.f(t - at, t)}</g>`; }
  return s; }
// 効果音のきっかけを記録（render3d.py が書き出し後に読む）
function cue(at, type) { const i = window.__CUR; if (i == null) return; window.__SFX = window.__SFX || {}; const k = `${i}|${at}|${type}`; if (!window.__SFXK) window.__SFXK = new Set(); if (window.__SFXK.has(k)) return; window.__SFXK.add(k); (window.__SFX[i] = window.__SFX[i] || []).push({ t: at, type }); }

// ---------- 1枚の紙芝居 ----------
// o.enter: 'fade' | 'left' | 'right' | 'zoom'（場面の入り方）、o.leave: 同じく（終わり方）。o.chap: 章の目印（0..4）
const CHAPS = ['プロローグ', '第1章', '第2章', '第3章', '第4章', 'エピローグ'];
export function sheet(t, dur, inner, o = {}) {
  const ci = (typeof window !== 'undefined' && window.__CUR) || 0, zin = ci % 2 === 0;
  const zk = (o.zoom ?? 0.06) * ease(t / dur), z = zin ? 1 + zk : 1 + (o.zoom ?? 0.06) - zk;
  const pan = (ci % 3 - 1) * 24 * (t / dur - .5);
  // 背景に漂う光の粒（ゆっくり上へ）
  let dust = ''; for (let k = 0; k < 26; k++) { const r = (q) => ((Math.sin((k + 1) * q * 12.9898 + ci * 7.1) * 43758.5453) % 1 + 1) % 1;
    const y = ((r(2) * H - t * (12 + r(3) * 22)) % H + H) % H, x = r(1) * W + Math.sin(t * .4 + k) * 30;
    dust += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 + r(4) * 5).toFixed(1)}" fill="#ffd9a8" opacity="${(.05 + r(5) * .12).toFixed(3)}"/>`; }
  const ie = easeOut(t / .5), le = ease((t - (dur - .45)) / .45);
  let tx = 0, sc = 1, op = 1;
  const en = o.enter || 'fade', lv = o.leave || 'fade';
  if (en === 'left') tx += (1 - ie) * -260; else if (en === 'right') tx += (1 - ie) * 260; else if (en === 'zoom') sc *= .9 + .1 * ie;
  if (lv === 'left') tx += le * -260; else if (lv === 'right') tx += le * 260; else if (lv === 'zoom') sc *= 1 + .08 * le;
  op = Math.min(easeOut(t / .35), 1 - ease((t - (dur - .35)) / .35));
  const grid = `<pattern id="gr" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60,0 L0,0 0,60" fill="none" stroke="rgba(255,255,255,.035)" stroke-width="2"/></pattern>`;
  const chapBar = o.chap == null ? '' : `<g opacity=".85">${CHAPS.map((c, i) => `<g transform="translate(${70 + i * 150},62)"><rect x="0" y="0" width="130" height="6" rx="3" fill="${i < o.chap ? 'rgba(255,138,61,.55)' : i === o.chap ? C.o : 'rgba(255,255,255,.15)'}"/>${i === o.chap ? txt(0, 44, c, { size: 22, anchor: 'start', color: C.o, weight: 700 }) : ''}</g>`).join('')}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;left:0;top:0">
  <defs><radialGradient id="bgg" cx="50%" cy="42%" r="78%"><stop offset="0%" stop-color="${o.bg1 || C.bg1}"/><stop offset="100%" stop-color="${o.bg2 || C.bg2}"/></radialGradient>${grid}
  <filter id="ts" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".55"/></filter>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".5"/></filter>
  <filter id="glow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <radialGradient id="vg" cx="50%" cy="46%" r="72%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".55"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#bgg)"/><rect width="${W}" height="${H}" fill="url(#gr)"/>${dust}
  <g opacity="${op.toFixed(3)}" transform="translate(${(tx + pan).toFixed(1)},0) translate(${W / 2},${H / 2 - 40}) scale(${(z * sc).toFixed(4)}) translate(${-W / 2},${-H / 2 + 40})">${inner}</g>
  ${chapBar}<rect width="${W}" height="${H}" fill="url(#vg)"/></svg>`;
}
// 2Dシーンを page.html 用のシーンにする
export const kami = (fn, o = {}) => ({ kind: 'kami', build() { return { render() {}, update(t, dur) { return sheet(t, dur, fn(t, dur), o); } }; } });
