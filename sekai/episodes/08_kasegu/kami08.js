// 08 稼ぐ妻 — 図解中心。字幕は灰色の帯。名前を付けた言葉：「結婚の割り勘」
import { THREE, makeScene, mat, glow, box, cyl, lamp, sun, canvasTex, person as person3, lerp } from '/pipeline3d/lib3d.js';
import { maps, C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, bubble, loadMaps, run, kami } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const M = '#4f8fea', F = '#ef7fa8', Y = C.gold, CX = 960;
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', 'エピローグ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, ...o });
const R = (els, t) => { const rf = els.filter(e => e.ref), ot = els.filter(e => !e.ref); const o = ot.length && ot[0].bg ? [ot[0], ...rf, ...ot.slice(1)] : [...rf, ...ot]; return run(o.map(e => e.f ? e : { ...e, f: () => '' }), t); };
const ref = (s) => ({ at: .6, ref: true, f: () => note(1880, 125, s, 'end') });
const SR1 = '国立社会保障・人口問題研究所 出生動向基本調査（2026年9月公表）';
const SC = [];
const typed = (x, y, s, t, t0, cps, o) => { const n = Math.max(0, Math.min(s.length, Math.floor((t - t0) * cps))); return txt(x, y, s.slice(0, n), o); };
const stamp = (x, y, s0, t, t0, col = '#c43a3a', size = 66) => { const st = clamp((t - t0) / .25); return t > t0 ? `<g transform="translate(${x},${y}) rotate(-12) scale(${1.6 - .6 * st})" opacity="${st}"><rect x="${-s0.length * size * .55 - 30}" y="-${size}" width="${s0.length * size * 1.1 + 60}" height="${size * 2}" rx="12" fill="none" stroke="${col}" stroke-width="9"/>${txt(0, size * .32, s0, { size, color: col, shadow: false, serif: true })}</g>` : ''; };
// 100人の格子（人型）。lit人が光る。散らした順で光る
const ORD = (() => { let x = 7; const a = [...Array(100).keys()]; for (let i = 99; i > 0; i--) { x = (x * 16807) % 2147483647; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; })();
const kid = (x, y, col, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><circle cy="-16" r="9" fill="${col}"/><rect x="-10" y="-6" width="20" height="24" rx="7" fill="${col}"/></g>`;
const grid100 = (gx, gy, lit, col, dx = 46, dy = 50, ks = 1) => { const on = new Set(ORD.slice(0, Math.round(lit))); let g = '';
  for (let i = 0; i < 100; i++) g += kid(gx + (i % 10) * dx, gy + Math.floor(i / 10) * dy, on.has(i) ? col : '#3e3c46', ks); return g; };
const counter = (x, y, v, col, unit = '人', size = 110) => `<g style="font-variant-numeric:tabular-nums">${txt(x, y, Math.round(v) + unit, { size, color: col, serif: true })}</g>`;

// 0 黒地に一文。「割り勘」が金色
SC[0] = K((t) => { const g = clamp((t - 1.1) / .4); return R([
  { at: 0, slide: 0, f: () => typed(CX - 245, 470, '日本の結婚は、', t, .05, 16, { size: 70, serif: true, anchor: 'start' })
      + `<g opacity="${g}">${txt(CX - 150, 620, '割り勘', { size: 120, serif: true, color: Y })}${txt(CX + 40, 620, 'になり始めている。', { size: 62, serif: true, anchor: 'start' })}</g>`
      + `<ellipse cx="${CX - 150}" cy="585" rx="${210 * g}" ry="${75 * g}" fill="${Y}" opacity="${(.16 * g).toFixed(2)}" filter="url(#glow)"/>` },
], t); }, 0, { enter: 'fade', zoom: 0 });

// 1 結婚の会計：稼ぎ＝夫／家のこと＝妻 → どちらも「2人」に書き換わる
SC[1] = K((t) => { const k = easeOut(clamp((t - .2) / .8)), sw = clamp((t - 7.0) / .5), nw = clamp((t - 7.6) / .4);
  const row = (y, item, who, col) => txt(60, y, item, { size: 40, color: '#333', shadow: false, anchor: 'start' })
    + `<g opacity="${1 - .55 * sw}">${txt(470, y, who, { size: 40, color: col, shadow: false, anchor: 'end', serif: true })}</g>`
    + `<rect x="${470 - 90}" y="${y - 16}" width="${100 * sw}" height="6" fill="#c43a3a"/>`
    + `<g opacity="${nw}">${txt(470, y + 56, '2人', { size: 44, color: '#7a5a10', shadow: false, anchor: 'end', serif: true })}</g>`;
  let rec = `<g transform="translate(${CX - 260},${200 + (1 - k) * 700})"><path d="M0,0 L520,0 L520,620 ${[...Array(13)].map((_, i) => `L${520 - (i + .5) * 40},${i % 2 ? 620 : 640}`).join(' ')} L0,620Z" fill="#f1ece2"/>`
    + txt(260, 72, '結婚のお会計', { size: 46, color: '#222', shadow: false, serif: true }) + `<rect x="40" y="100" width="440" height="3" fill="#bbb"/>`
    + txt(60, 160, '品名', { size: 28, color: '#888', shadow: false, anchor: 'start' }) + txt(470, 160, '払う人', { size: 28, color: '#888', shadow: false, anchor: 'end' });
  if (t > 2.6) rec += row(260, '稼ぎ', '夫', M);
  if (t > 4.2) rec += row(420, '家のこと', '妻', F);
  rec += '</g>';
  const lp = t > 2.6 ? `<g opacity="${clamp((t - 2.6) / .4)}">${person(CX - 480, 560, 70, M)}</g>` : '', rp = t > 4.2 ? `<g opacity="${clamp((t - 4.2) / .4)}">${person(CX + 480, 560, 70, F, 'f')}</g>` : '';
  return R([{ at: 0, slide: 0, f: () => rec + lp + rp + stamp(CX + 170, 790, '割り勘', t, 9.6, '#c43a3a', 60) }], t); }, 0, { enter: 'fade', zoom: 0 });

// 2 1987年：100人中38人「妻には専業主婦でいてほしい」
const grid38 = (t, lit) => grid100(CX - 234, 330, lit, M, 52, 60, 1.25);
SC[2] = K((t) => { const k = easeOut(clamp((t - 4.0) / 2.2)); return R([
  { at: 0, f: () => head('結婚するつもりの独身男性　100人', { y: 170 }) },
  { at: .3, slide: 0, f: () => txt(CX - 560, 300, '1987年', { size: 72, color: C.dim, serif: true }) },
  { at: .5, slide: 0, f: () => grid38(t, 38 * k) },
  { at: 4.0, slide: 0, f: () => counter(CX + 560, 560, 38 * k, M) + txt(CX + 560, 650, '「妻には', { size: 38 }) + txt(CX + 560, 705, '専業主婦でいてほしい」', { size: 38 }) },
  ref(SR1),
], t); }, 0, { enter: 'fade', zoom: 0 });

// 3 2025年：同じ質問で4人
SC[3] = K((t) => { const d = easeOut(clamp((t - 4.6) / 1.0)), lit = 38 - 34 * d; return R([
  { at: 0, f: () => head('結婚するつもりの独身男性　100人', { y: 170 }) },
  { at: 0, slide: 0, f: () => `<g opacity="${1 - clamp(t / .4)}">${txt(CX - 560, 300, '1987年', { size: 72, color: C.dim, serif: true })}</g><g opacity="${clamp((t - .3) / .4)}">${txt(CX - 560, 300, '2025年', { size: 72, color: Y, serif: true })}</g>` },
  { at: 0, slide: 0, f: () => grid38(t, lit) },
  { at: 0, slide: 0, f: () => (t < 4.6 ? txt(CX + 560, 560, '？', { size: 130, color: C.dim, serif: true }) : counter(CX + 560, 560, lit, d > .95 ? Y : M, '人', 130 + 30 * d))
      + txt(CX + 560, 650, '「妻には', { size: 38 }) + txt(CX + 560, 705, '専業主婦でいてほしい」', { size: 38 }) },
  ref(SR1),
], t); }, 0, { enter: 'fade', zoom: 0 });

export const SCENES = SC;
