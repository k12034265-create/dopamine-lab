// 17 日本の政治は腐ってる？ — 名前を付けた言葉：「にごり」
import { THREE, makeScene, mat, glow, box, cyl, ball, plane, canvasTex, sun, lamp, lerp, camMove } from '/pipeline3d/lib3d.js';
import { human } from '/pipeline3d/sets3d.js';
import { C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, loadMaps, run, kami } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const Y = C.gold, RED = '#ff3b3b', CX = 960, DIM = C.dim, GRN = '#8fd18a', ROT = '#9bbf5a', GRY = '#6a6470';
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', '第5章'];
const CHI = (i) => i < 8 ? 0 : i < 19 ? 1 : i < 30 ? 2 : i < 46 ? 3 : i < 60 ? 4 : 5;
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, enter: 'fade', zoom: 0, ...o });
const R = (els, t) => { const rf = els.filter(e => e.ref), ot = els.filter(e => !e.ref); return run([...rf, ...ot].map(e => e.f ? e : { ...e, f: () => '' }), t); };
const ref = (s) => ({ at: .6, ref: true, f: () => srcBox(s) });
const S1 = '東京商工リサーチ（2026）', S2 = '警察庁（2026）', S3 = '各社の公表資料（2026年10〜11月）';
const cap = (y, s0, col = Y, size = 46) => `<g>${card(CX - s0.length * size * .55 - 40, y - size - 18, s0.length * size * 1.1 + 80, size * 1.9, { fill: 'rgba(18,16,24,.88)', stroke: col })}${txt(CX, y + 4, s0, { size, color: col, serif: true })}</g>`;
const capO = (y, s0, col = Y, size = 46) => `<g>${card(CX - s0.length * size * .55 - 40, y - size - 18, s0.length * size * 1.1 + 80, size * 1.9, { fill: '#141219', stroke: col })}${txt(CX, y + 4, s0, { size, color: col, serif: true })}</g>`;
const ovSvg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0"><defs><filter id="ts" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".7"/></filter><filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="rv" cx="50%" cy="50%" r="75%"><stop offset="55%" stop-color="#2a1a3a" stop-opacity="0"/><stop offset="100%" stop-color="#1a2a10" stop-opacity=".75"/></radialGradient></defs>${inner}</svg>`;
const srcBox = (src) => `<rect x="${1880 - src.length * 23 - 20}" y="28" width="${src.length * 23 + 40}" height="44" rx="8" fill="#121018"/>` + note(1880, 58, src, 'end');
const xMark = (x, y, k, s = 70, col = RED) => `<g transform="translate(${x},${y}) scale(${k})" stroke="${col}" stroke-width="16" stroke-linecap="round"><path d="M${-s},${-s} L${s},${s} M${s},${-s} L${-s},${s}"/></g>`;
const stampT = (x, y, k, s0, col = RED, size = 56) => `<g transform="translate(${x},${y}) scale(${k}) rotate(-8)"><rect x="${-s0.length * size * .56 - 26}" y="${-size * .95}" width="${s0.length * size * 1.12 + 52}" height="${size * 1.6}" rx="10" fill="none" stroke="${col}" stroke-width="8"/>${txt(0, size * .3, s0, { size, color: col, serif: true, shadow: false })}</g>`;
// 封筒
const env = (x, y, s = 1, rot = 0, col = '#efe3c4') => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-120" y="-75" width="240" height="150" rx="10" fill="${col}" stroke="#8a7a58" stroke-width="4"/><path d="M-120,-75 L0,15 L120,-75" fill="none" stroke="#8a7a58" stroke-width="4"/>${txt(0, 52, '御礼', { size: 34, color: '#7a2a20', shadow: false, serif: true })}</g>`;
// 匂いの波線（上へゆらゆら）
const stink = (x, y, t, col = ROT, n = 3, h = 160) => { let g = ''; for (let i = 0; i < n; i++) { const ph = (t * .7 + i / n) % 1, yy = y - ph * h, a = Math.sin(ph * Math.PI) * .85, xx = x + (i - (n - 1) / 2) * 34;
  g += `<path d="M${xx},${yy} q14,-18 0,-36 q-14,-18 0,-36" stroke="${col}" stroke-width="7" fill="none" stroke-linecap="round" opacity="${a.toFixed(2)}"/>`; } return g; };
// 鼻をつまむピクト
const pinch = (x, y, s, k) => `<g opacity="${k}" transform="translate(${x},${y}) scale(${s})"><circle cx="0" cy="0" r="70" fill="#e8ddc8"/><circle cx="-24" cy="-12" r="7" fill="#2a2420"/><circle cx="24" cy="-12" r="7" fill="#2a2420"/><path d="M-20,34 q20,-12 40,0" stroke="#2a2420" stroke-width="6" fill="none"/><path d="M60,70 Q20,40 8,12" stroke="#e8ddc8" stroke-width="26" stroke-linecap="round" fill="none"/><circle cx="6" cy="10" r="14" fill="#d8c8b0"/></g>`;
const SC = []; const N = 77;
for (let i = 0; i < N; i++) SC[i] = K(() => '', CHI(i));
const V = new THREE.Vector3();
const proj = (cam, x, y, z) => { cam.updateMatrixWorld(); V.set(x, y, z); V.project(cam); return [(V.x + 1) * 960, (1 - V.y) * 540]; };

const recap = (t, title, rows, foot) => { let g = head(title, { y: 210, size: 52 });
  rows.forEach(([a, mark, col], i) => { const at = .6 + i * 1.4, k = easeOut(clamp((t - at) / .5)), y = 420 + i * 180;
    g += `<g opacity="${k}" transform="translate(${(1 - k) * 80},0)">` + card(360, y - 80, 1200, 140, { fill: 'rgba(255,255,255,.05)', stroke: col }) + txt(420, y + 18, a, { size: 52, anchor: 'start', serif: true }) + txt(1480, y + 26, mark, { size: 90, color: col, anchor: 'end' }) + '</g>'; });
  if (foot && t > .6 + rows.length * 1.4 + .6) g += `<g opacity="${easeOut(clamp((t - .6 - rows.length * 1.4 - .6) / .5))}">` + cap(900, foot, Y, 46) + '</g>';
  return g; };
const pawnRow = (x0, y0, n, cols, cell, s, colf, t, t0 = 0) => { let g = ''; for (let i = 0; i < n; i++) { const k = easeOut(clamp((t - t0 - i * .01) / .35)); g += `<g opacity="${k}">` + person(x0 + (i % cols) * cell, y0 + Math.floor(i / cols) * cell * 1.5, s, colf(i)) + '</g>'; } return g; };
const lineChart = (t, pts, o) => { const { x0, x1, y0, y1, v0, v1 } = o; const X = (i) => x0 + (x1 - x0) * i / (pts.length - 1), Yv = (v) => y1 - (v - v0) / (v1 - v0) * (y1 - y0);
  let g = `<path d="M${x0},${y1} H${x1}" stroke="${C.gray}" stroke-width="3"/>`; const n = Math.max(2, Math.ceil(pts.length * easeOut(clamp((t - (o.t0 || .4)) / (o.dur || 2.4)))));
  if (o.ref != null) g += `<path d="M${x0},${Yv(o.ref)} H${x1}" stroke="${o.refCol || RED}" stroke-width="3" stroke-dasharray="12 10"/>` + txt(x1 + 14, Yv(o.ref) + 10, o.refLab || '', { size: 28, color: o.refCol || RED, anchor: 'start' });
  g += `<path d="M${pts.slice(0, n).map((p, i) => X(i) + ',' + Yv(p[1])).join(' L')}" stroke="${o.col || Y}" stroke-width="7" fill="none" stroke-linejoin="round"/>`;
  pts.slice(0, n).forEach((p, i) => { const hi = (o.hi || []).includes(i); g += `<circle cx="${X(i)}" cy="${Yv(p[1])}" r="${hi ? 12 : 8}" fill="${hi ? RED : (o.col || Y)}"/>` + txt(X(i), y1 + 42, p[0], { size: 24, color: DIM }) + ((o.labels || []).includes(i) ? txt(X(i), Yv(p[1]) - 22, p[1] + (o.unit || ''), { size: 30, color: hi ? RED : C.fg }) : ''); });
  return g; };
// ===== 3D 共通 =====
const stage = (o = {}) => { const S = makeScene({ bg: o.bg || '#0c0b10', hemi: o.hemi ?? .7, exposure: o.exp ?? 1.4, sky: '#a8b0d0', ground: '#1a1418', bloom: o.bloom ?? .6, bloomTh: .7, fov: o.fov || 34, fog: o.fog });
  box(S.s, 40, .04, 40, mat(o.floor || '#1a1820', { r: .8 }), 0, -.02, 0); sun(S.s, '#fff1e0', o.sun ?? 1.2, 3, 7, 5, 10); lamp(S.s, '#ffd0a0', 1.6, 10, -3, 3, 3, false); lamp(S.s, '#a8b8ff', 1.2, 10, 3.5, 2.6, 2, false); return S; };
const pawn = (p, col, x, z, s = 1, y = 0) => { const g = new THREE.Group(); p.add(g); g.position.set(x, y, z); g.scale.setScalar(s); const m = mat(col, { r: .6 });
  cyl(g, .16, .2, .5, m, 0, .25, 0, 12); ball(g, .12, m, 0, .64, 0, 2); return g; };
const bills = (p, x, y, z, n = 4, col = '#c9b878') => { const g = new THREE.Group(); p.add(g); g.position.set(x, y, z); for (let i = 0; i < n; i++) box(g, .34, .07, .16, mat(col, { r: .8 }), 0, .035 + i * .075, 0); return g; };

const tag = (x, y, s0, col, k) => `<g opacity="${k}"><rect x="${x - s0.length * 20 - 30}" y="${y - 44}" width="${s0.length * 40 + 60}" height="72" rx="36" fill="#141219" stroke="${col}" stroke-width="4"/>` + txt(x, y + 6, s0, { size: 38, color: col }) + '</g>';
const bright = (o = {}) => { const S = makeScene({ bg: o.bg || '#1c1a22', hemi: o.hemi ?? 1.1, exposure: o.exp ?? 1.25, sky: '#e8ecff', ground: '#3a3030', bloom: o.bloom ?? .35, bloomTh: .85, fov: o.fov || 32, fog: o.fog });
  if (o.floor !== false) box(S.s, 40, .04, 40, mat(o.floor || '#2e2a30', { r: .85 }), 0, -.02, 0);
  sun(S.s, '#fff6ea', o.sun ?? 1.8, 3, 8, 6, 10); lamp(S.s, '#ffe2c0', 2.2, 14, -4, 4, 4, false); lamp(S.s, '#c8d4ff', 1.6, 14, 4, 3.5, 3, false); return S; };
const label = (tx, bg = '#ffffff', fg = '#1a1a1a', w = 256, h = 128, size = 64) => new THREE.MeshStandardMaterial({ map: canvasTex(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = `900 ${size}px 'Noto Sans CJK JP'`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tx, W / 2, H / 2 + 4); }), roughness: .7 });
