// 09 東京は残らない — 図解中心。名前を付けた言葉：「東京の入場料」
import { maps, C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, bubble, loadMaps, run, kami } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const M = '#4f8fea', F = '#ef7fa8', Y = C.gold, RED = '#e0453a', CX = 960;
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', 'エピローグ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, ...o });
const R = (els, t) => { const rf = els.filter(e => e.ref), ot = els.filter(e => !e.ref); const o = ot.length && ot[0].bg ? [ot[0], ...rf, ...ot.slice(1)] : [...rf, ...ot]; return run(o.map(e => e.f ? e : { ...e, f: () => '' }), t); };
const ref = (s) => ({ at: .6, ref: true, f: () => note(1880, 125, s, 'end') });
const SR1 = '国土交通省「都道府県別の経済的豊かさ」（2019年・中央世帯）';
const typed = (x, y, s, t, t0, cps, o) => { const n = Math.max(0, Math.min(s.length, Math.floor((t - t0) * cps))); return txt(x, y, s.slice(0, n), o); };
// ===== 県境つき地図 =====
const J2 = () => maps().japan2;
const lerpV = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const VW = { all: [600, 450, .92], kanto: [640, 445, 5.2] };
const vp = (v, ox = 760, oy = 540) => (p) => [ox + (p[0] - v[0]) * v[2], oy + (p[1] - v[1]) * v[2]];
const jmap2 = (v, o = {}) => { const j = J2(), ox = o.ox ?? 760, oy = o.oy ?? 540, z = v[2];
  let g = `<g transform="translate(${ox - v[0] * z},${oy - v[1] * z}) scale(${z})">`;
  for (const [c, pf] of Object.entries(j.prefs)) { const f = (o.fills && o.fills[c]) || o.base || '#cfc8b8'; g += `<path d="${pf.d}" fill="${f}"/>`; }
  g += `<path d="${j.border}" fill="none" stroke="${o.stroke || '#1b1a20'}" stroke-width="${(1.6 / z).toFixed(3)}" opacity=".7"/></g>`; return g; };
const pc = (code) => J2().prefs[code].c;
const SC = [];

// 0 黒地に一文。「入場料」が金色
SC[0] = K((t) => { const g = clamp((t - .9) / .4); return R([
  { at: 0, slide: 0, f: () => typed(CX - 110, 470, '東京は、', t, .05, 12, { size: 70, serif: true, anchor: 'start' })
      + `<g opacity="${g}">${txt(CX - 170, 620, '入場料', { size: 120, serif: true, color: Y })}${txt(CX + 20, 620, 'のかかる街である。', { size: 62, serif: true, anchor: 'start' })}</g>`
      + `<ellipse cx="${CX - 170}" cy="585" rx="${210 * g}" ry="${75 * g}" fill="${Y}" opacity="${(.16 * g).toFixed(2)}" filter="url(#glow)"/>` },
], t); }, 0, { enter: 'fade', zoom: 0 });

// 1 改札：給料が高い札 → 家賃と通勤時間が料金箱へ
const gate = () => { let g = '';
  for (const x of [CX - 300, CX - 60, CX + 180]) g += `<rect x="${x}" y="470" width="120" height="260" rx="14" fill="#3a3842"/><rect x="${x + 10}" y="480" width="100" height="40" rx="6" fill="#2a2830"/><rect x="${x + 30}" y="500" width="60" height="8" rx="4" fill="${Y}" opacity=".7"/>`;
  return g + `<rect x="${CX - 360}" y="330" width="660" height="90" rx="12" fill="#26313f"/>` + txt(CX - 30, 395, '東京', { size: 56, color: '#fff', serif: true }); };
const house = (x, y, s, col) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-40,-6 L0,-42 L40,-6Z" fill="${col}"/><rect x="-32" y="-6" width="64" height="46" fill="${col}"/></g>`;
const clock = (x, y, s, t) => `<g transform="translate(${x},${y}) scale(${s})"><circle r="38" fill="#efeae0"/><circle r="38" fill="none" stroke="#3a3842" stroke-width="6"/><path d="M0,0 L0,-26" stroke="#222" stroke-width="5" stroke-linecap="round" transform="rotate(${t * 120})"/><path d="M0,0 L18,0" stroke="#222" stroke-width="5" stroke-linecap="round"/></g>`;
SC[1] = K((t) => {
  const box = `<g transform="translate(${CX + 560},640)"><rect x="-130" y="-70" width="260" height="190" rx="16" fill="#5a4a2a"/><rect x="-80" y="-80" width="160" height="16" rx="8" fill="#1b1a20"/>` + txt(0, 60, '入場料', { size: 42, color: Y, serif: true }) + txt(0, 104, '毎月', { size: 30, color: '#e8dcc0' }) + '</g>';
  const fall = (t0, x0, item) => { const k = clamp((t - t0) / 1.1); if (t < t0) return ''; const x = x0 + (CX + 560 - x0) * easeOut(k), y = 320 + (560 - 320) * (k * k); return k < 1 ? item(x, y) : ''; };
  const items = [3.6, 6.0, 8.4].map((t0, i) => fall(t0, CX + 260 + i * 10, (x, y) => house(x, y, 1, '#c9a35a'))).join('')
    + [4.8, 7.2, 9.6].map((t0, i) => fall(t0, CX + 300 + i * 10, (x, y) => clock(x, y, .9, t))).join('');
  return R([
    { at: 0, slide: 0, f: () => gate() },
    { at: .3, slide: 0, f: (lt) => { const x = CX - 640 + 700 * easeOut(clamp(lt / 3.0)); return person(x, 690, 80, M) + `<g transform="translate(${x},520)">${`<rect x="-90" y="-34" width="180" height="60" rx="30" fill="${Y}"/>` + txt(0, 10, '給料 ↑', { size: 34, color: '#1b1a20', shadow: false })}</g>`; } },
    { at: 3.4, slide: 0, f: () => box + txt(CX + 330, 300, '家賃', { size: 40, color: '#e8c987' }) + txt(CX + 470, 300, '通勤の時間', { size: 40, color: '#e8dcc0', anchor: 'start' }) },
    { at: 0, slide: 0, f: () => items },
  ], t); }, 0, { enter: 'fade', zoom: 0 });

// 2 日本地図：手取り（平均）は東京が1位
SC[2] = K((t) => { const v = lerpV(VW.all, [640, 440, 1.6], ease(clamp(t / 4.8))), V = vp(v, 860, 560), T = V(pc(13)); const g = .5 + .5 * Math.sin(t * 3);
  return R([
    { at: 0, slide: 0, bg: true, f: () => jmap2(v, { ox: 860, oy: 560, fills: { 13: Y } }) + `<circle cx="${T[0]}" cy="${T[1]}" r="${30 + 10 * g}" fill="${Y}" opacity=".25" filter="url(#glow)"/>` },
    { at: 0, f: () => `<rect x="440" y="115" width="1040" height="90" rx="45" fill="rgba(20,19,26,.85)"/>` + head('47都道府県　働く世帯の手取り（平均）', { y: 170 }) },
    { at: 1.2, slide: 0, f: (lt) => `<g transform="translate(${T[0] + 260},${T[1] - 40}) scale(${pop(lt / .4)})">` + txt(0, 0, '東京', { size: 52, color: Y }) + txt(0, 110, '1位', { size: 120, color: Y, serif: true }) + '</g>' + `<path d="M${T[0] + 40},${T[1] - 10} L${T[0] + 170},${T[1] - 40}" stroke="${Y}" stroke-width="4"/>` },
    ref(SR1),
  ], t); }, 0, { enter: 'fade', zoom: 0 });

// 3 関東へ寄って、順位が1→25→40と落ちる
const STEP = [[0, 1, '手取り（平均）'], [2.6, 25, '生活費を引くと'], [5.0, 40, '通勤の時間も引くと']];
SC[3] = K((t) => { const v = [640, 440, 1.6], v2 = lerpV(v, [650, 445, 4.6], ease(clamp(t / 2.2))), V = vp(v2, 760, 560), T = V(pc(13));
  const cur = STEP.filter(s => t >= s[0]).pop(), idx = STEP.indexOf(cur), red = idx === 2 ? clamp((t - 5.0) / .5) : 0;
  const col = idx === 0 ? Y : idx === 1 ? '#d9b46a' : `rgb(${224},${Math.round(160 - 91 * red)},${Math.round(90 - 32 * red)})`;
  const stairs = STEP.map((s, i) => t >= s[0] ? `<g opacity="${clamp((t - s[0]) / .4)}">` + txt(1560, 330 + i * 190, s[2], { size: 34, color: C.dim }) + `<g style="font-variant-numeric:tabular-nums">${txt(1560, 410 + i * 190, s[1] + '位', { size: 84, color: i === 2 ? RED : i === 1 ? '#d9b46a' : Y, serif: true })}</g></g>` + (i > 0 ? `<path d="M1560,${250 + i * 190} l0,22" stroke="${C.dim}" stroke-width="4"/><path d="M1550,${264 + i * 190} l10,12 l10,-12" stroke="${C.dim}" stroke-width="4" fill="none"/>` : '') : '').join('');
  return R([
    { at: 0, slide: 0, bg: true, f: () => jmap2(v2, { ox: 760, oy: 560, fills: { 13: col } }) + txt(T[0], T[1] + 12, '東京', { size: 40, color: '#1b1a20', shadow: false }) },
    { at: 0, f: () => `<rect x="440" y="115" width="1040" height="90" rx="45" fill="rgba(20,19,26,.85)"/>` + head('東京の順位（47都道府県・真ん中の家庭）', { y: 170 }) },
    { at: 0, slide: 0, f: () => stairs },
    ref(SR1),
  ], t); }, 0, { enter: 'fade', zoom: 0 });

export const SCENES = SC;
