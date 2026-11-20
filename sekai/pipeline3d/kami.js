// 紙芝居（2D）シーン用の部品。3Dと同じ page.html で描く（字幕・粒子ノイズは共通）
export const W = 1920, H = 1080;
export const C = { bg1: '#2a2530', bg2: '#141218', paper: '#f1e8d4', ink: '#2a2420', fg: '#f3efe6', dim: '#a49c90', o: '#ff8a3d', t: '#3dc6c1', red: '#d8322a', gold: '#f0c75a', navy: '#3a4a6a' };
export const SERIF = "'Noto Serif CJK JP',serif", SANS = "'Noto Sans CJK JP',sans-serif";
export const clamp = (x, a = 0, b = 1) => Math.min(Math.max(x, a), b);
export const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeOut = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
export const pop = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

export function txt(x, y, s, o = {}) {
  const size = o.size || 48, fam = o.serif ? SERIF : SANS;
  return `<text x="${x}" y="${y}" font-family="${fam}" font-size="${size}" font-weight="${o.weight || 700}" fill="${o.color || C.fg}" text-anchor="${o.anchor || 'middle'}" letter-spacing="${o.ls || 0}" opacity="${o.op ?? 1}" ${o.vert ? 'writing-mode="vertical-rl"' : ''} ${o.shadow === false ? '' : 'filter="url(#ts)"'}>${s}</text>`;
}
// ピクト人物（高さ ≒ 2.4*s）。kind: m / f / heian / heianf / officer
export function person(x, y, s, color, kind = 'm') {
  const head = `<circle cx="0" cy="${-s}" r="${s * 0.36}" fill="${color}"/>`; let body = '';
  if (kind === 'f') body = `<path d="M${-s * .22},${-s * .58} L${s * .22},${-s * .58} L${s * .55},${s * .55} L${-s * .55},${s * .55} Z" fill="${color}"/><rect x="${-s * .2}" y="${s * .55}" width="${s * .14}" height="${s * .6}" fill="${color}"/><rect x="${s * .06}" y="${s * .55}" width="${s * .14}" height="${s * .6}" fill="${color}"/>`;
  else if (kind === 'heian') body = `<path d="M${-s * .2},${-s * .6} L${s * .2},${-s * .6} L${s * .9},${s * 1.15} L${-s * .9},${s * 1.15} Z" fill="${color}"/><rect x="${-s * .16}" y="${-s * 1.75}" width="${s * .32}" height="${s * .5}" rx="${s * .06}" fill="${color}"/>`;
  else if (kind === 'heianf') body = `<path d="M${-s * .2},${-s * .6} L${s * .2},${-s * .6} L${s},${s * 1.15} L${-s},${s * 1.15} Z" fill="${color}"/><path d="M${-s * .34},${-s * 1.1} Q${-s * .6},0 ${-s * .3},${s * .9} L${-s * .1},${-s * .6}Z" fill="${color}"/>`;
  else if (kind === 'officer') body = `<path d="M${-s * .5},${-s * 1.28} L${s * .5},${-s * 1.28} L${s * .62},${-s * 1.18} L${-s * .62},${-s * 1.18} Z M${-s * .34},${-s * 1.28} Q0,${-s * 1.72} ${s * .34},${-s * 1.28} Z" fill="${color}"/><rect x="${-s * .44}" y="${-s * .58}" width="${s * .88}" height="${s * 1.12}" rx="${s * .18}" fill="${color}"/><rect x="${-s * .34}" y="${s * .45}" width="${s * .28}" height="${s * .72}" fill="${color}"/><rect x="${s * .06}" y="${s * .45}" width="${s * .28}" height="${s * .72}" fill="${color}"/>`;
  else body = `<rect x="${-s * .42}" y="${-s * .58}" width="${s * .84}" height="${s * 1.1}" rx="${s * .22}" fill="${color}"/><rect x="${-s * .34}" y="${s * .45}" width="${s * .28}" height="${s * .72}" rx="${s * .08}" fill="${color}"/><rect x="${s * .06}" y="${s * .45}" width="${s * .28}" height="${s * .72}" rx="${s * .08}" fill="${color}"/>`;
  return `<g transform="translate(${x},${y})">${head}${body}</g>`;
}
// 要素を時間で出す：[{at, out, f:(lt,t)=>svg, slide}]
export function run(els, t) { let s = '';
  for (const e of els) { const at = e.at || 0; if (t < at) continue; const out = e.out ?? 1e9; if (t > out + .5) continue;
    let a = ease((t - at) / (e.fade || .5)); if (t > out) a *= 1 - ease((t - out) / .5);
    const dy = (1 - easeOut((t - at) / .6)) * (e.slide ?? 30);
    s += `<g opacity="${a.toFixed(3)}" transform="translate(0,${dy.toFixed(1)})">${e.f(t - at, t)}</g>`; }
  return s; }
// 1枚の紙芝居：背景＋カメラの寄り（zoom）＋シーンのフェード
export function sheet(t, dur, inner, o = {}) {
  const z = 1 + (o.zoom ?? 0.04) * ease(t / dur); const f = Math.min(1, t / .35, (dur - t) / .35);
  const bg = o.bg || `<radialGradient id="bgg" cx="50%" cy="42%" r="75%"><stop offset="0%" stop-color="${C.bg1}"/><stop offset="100%" stop-color="${C.bg2}"/></radialGradient>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;left:0;top:0">
  <defs>${bg}<filter id="ts" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".55"/></filter>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".55"/></filter>
  <filter id="glow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <radialGradient id="vg" cx="50%" cy="46%" r="72%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".6"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#bgg)"/>
  <g transform="translate(${W / 2},${H / 2 - 40}) scale(${z.toFixed(4)}) translate(${-W / 2},${-H / 2 + 40})">${inner}</g>
  <rect width="${W}" height="${H}" fill="url(#vg)"/><rect width="${W}" height="${H}" fill="#000" opacity="${(1 - clamp(f)).toFixed(3)}"/></svg>`;
}
// 2Dシーンを page.html 用のシーンにする
export const kami = (fn, o = {}) => ({ build() { return { render() {}, update(t, dur) { return sheet(t, dur, fn(t, dur), o); } }; } });
