// 09 東京は残らない — 図解中心。名前を付けた言葉：「東京の入場料」
import { THREE, makeScene, mat, glow, box, cyl, ball, plane, lamp, sun, canvasTex, lerp, rng, camMove } from '/pipeline3d/lib3d.js';
import { room, windowPane, human } from '/pipeline3d/sets3d.js';
import { maps, C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, bubble, loadMaps, run, kami } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const M = '#4f8fea', F = '#ef7fa8', Y = C.gold, RED = '#e0453a', CX = 960;
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', 'エピローグ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, ...o });
const R = (els, t) => { const rf = els.filter(e => e.ref), ot = els.filter(e => !e.ref); const o = ot.length && ot[0].bg ? [ot[0], ...rf, ...ot.slice(1)] : [...rf, ...ot]; return run(o.map(e => e.f ? e : { ...e, f: () => '' }), t); };
const ref = (s) => ({ at: .6, ref: true, f: () => note(1880, 58, s, 'end') });
const SR1 = '国土交通省「都道府県別の経済的豊かさ」（2019年・中央世帯）';
const typed = (x, y, s, t, t0, cps, o) => { const n = Math.max(0, Math.min(s.length, Math.floor((t - t0) * cps))); return txt(x, y, s.slice(0, n), o); };
// ===== 県境つき地図 =====
const J2 = () => maps().japan2;
const lerpV = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const VW = { all: [600, 450, .92], kanto: [640, 445, 5.2] };
const vp = (v, ox = 760, oy = 540) => (p) => [ox + (p[0] - v[0]) * v[2], oy + (p[1] - v[1]) * v[2]];
const jmap2 = (v, o = {}) => { const j = J2(), ox = o.ox ?? 760, oy = o.oy ?? 540, z = v[2];
  let g = `<g transform="translate(${ox - v[0] * z},${oy - v[1] * z}) scale(${z})">`;
  for (const [c, pf] of Object.entries(j.prefs)) { const f = (o.fills && (o.fills[c] || o.fills[+c])) || o.base || '#cfc8b8'; g += `<path d="${pf.d}" fill="${f}"/>`; }
  g += `<path d="${j.border}" fill="none" stroke="${o.stroke || '#1b1a20'}" stroke-width="${(1.6 / z).toFixed(3)}" opacity=".7"/></g>`; return g; };
const pc = (code) => (J2().prefs[code] || J2().prefs[String(code).padStart(2, '0')]).c;
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

// ===== 共通の部品 =====
const PREF = { 8: '茨城', 9: '栃木', 11: '埼玉', 12: '千葉', 13: '東京', 14: '神奈川', 16: '富山', 20: '長野', 27: '大阪', 31: '鳥取', 32: '島根', 45: '宮崎', 46: '鹿児島', 47: '沖縄' };
const rlist = (x, y, items, t, t0, gap = .55, hl = null, w = 440) => items.map(([r, name], i) => { const tt = Array.isArray(t0) ? t0[i] : t0 + i * gap; if (t < tt) return ''; const k = easeOut(clamp((t - tt) / .4)), on = name === hl;
  return `<g opacity="${k.toFixed(3)}" transform="translate(${((1 - k) * 80).toFixed(1)},0)">` + card(x, y + i * 96 - 52, w, 78, on ? { fill: 'rgba(240,200,90,.18)', stroke: Y } : {}) + txt(x + 36, y + i * 96 + 2, r + '位', { size: 36, color: Y, serif: true, anchor: 'start' }) + txt(x + 160, y + i * 96 + 2, name, { size: 40, anchor: 'start', color: on ? Y : C.fg }) + '</g>'; }).join('');
const litMap = (v, lit, t, ox = 760, oy = 560) => { const fills = {}; for (const [c, [col, t0]] of Object.entries(lit)) { if (t >= t0) fills[c] = col; } return jmap2(v, { ox, oy, fills }); };
const roll = (x, y, a, b, t, t0, dur, o = {}) => { const k = ease(clamp((t - t0) / dur)), v = Math.round(a + (b - a) * k); return `<g style="font-variant-numeric:tabular-nums">${txt(x, y, (o.pre || '') + v.toLocaleString('ja-JP') + (o.unit || ''), { size: o.size || 96, color: o.color || Y, serif: true, anchor: o.anchor })}</g>`; };
const ticket = (x, y, s0, t, t0) => { if (t < t0) return ''; const k = clamp((t - t0) / .25); return `<g transform="translate(${x},${y}) rotate(-8) scale(${1.5 - .5 * k})" opacity="${k}"><rect x="-190" y="-58" width="380" height="116" rx="12" fill="#f1ece2"/><rect x="-176" y="-44" width="352" height="88" rx="8" fill="none" stroke="${RED}" stroke-width="5" stroke-dasharray="10 8"/>${txt(0, 14, s0, { size: 34, color: RED, shadow: false, serif: true })}</g>`; };
const stamp = (x, y, s0, t, t0, col = RED, size = 60) => { const st = clamp((t - t0) / .25); return t > t0 ? `<g transform="translate(${x},${y}) rotate(-12) scale(${1.6 - .6 * st})" opacity="${st}"><rect x="${-s0.length * size * .55 - 26}" y="-${size}" width="${s0.length * size * 1.1 + 52}" height="${size * 2}" rx="12" fill="none" stroke="${col}" stroke-width="8"/>${txt(0, size * .32, s0, { size, color: col, shadow: false, serif: true })}</g>` : ''; };
const coin = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><circle r="22" fill="#e0b24a"/><circle r="15" fill="none" stroke="#a8812a" stroke-width="3"/></g>`;
const bldg = (x, base, w, h, col = '#4a4856') => `<rect x="${x - w / 2}" y="${base - h}" width="${w}" height="${h}" fill="${col}"/>` + [...Array(Math.max(0, Math.floor((h - 20) / 34)))].map((_, i) => `<rect x="${x - w / 2 + 8}" y="${base - h + 12 + i * 34}" width="${w - 16}" height="14" fill="#2c2a34"/>`).join('');
// 階段を下りる人（1→5→25→40）
const STAIR = [[1, '平均の手取り'], [5, '真ん中の家庭'], [25, '生活費を引く'], [40, '通勤も引く']];
const stairs = (t, ts, x0 = 360, y0 = 440) => { let g = ''; const n = ts.filter(a => t >= a).length;
  STAIR.forEach(([r, lb], i) => { const x = x0 + i * 300, y = y0 + i * 110; g += `<rect x="${x}" y="${y}" width="300" height="${960 - y}" fill="${i === 3 ? '#4a3436' : '#3e3c48'}"/>`;
    if (i < n) g += `<g opacity="${clamp((t - ts[i]) / .35)}">` + txt(x + 150, y + 70, r + '位', { size: 64, color: i === 3 ? RED : Y, serif: true }) + txt(x + 150, y + 116, lb, { size: 26, color: C.dim }) + '</g>'; });
  const i = Math.max(0, n - 1), k = n ? easeOut(clamp((t - ts[i]) / .7)) : 0, pi = Math.max(0, i - 1), px = lerp(x0 + pi * 300 + 150, x0 + i * 300 + 150, i ? k : 1), py = lerp(y0 + pi * 110, y0 + i * 110, i ? k : 1) - Math.sin(k * Math.PI) * 40 * (i ? 1 : 0);
  return g + person(px, py - 92, 70, M); };

// ===== 写真（ぱくたそ） =====
const IMG = (n) => `/episodes/09_tokyo/img/${n}.jpg`;
const OVD = `<defs><filter id="ts2" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity=".7"/></filter><linearGradient id="topg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".65"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>`;
const ovSvg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0">${OVD}${inner}</svg>`;
const otxt = (x, y, s0, size, color = '#fff', serif = true) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${color}" filter="url(#ts2)" font-weight="700" style="font-family:${serif ? "'Noto Serif CJK JP',serif" : "'Noto Sans CJK JP',sans-serif"}">${s0}</text>`;
const photoSvg = (n, k, dark = .3) => { const z = 1 + .07 * ease(k);
  return `<g transform="translate(960,540) scale(${z.toFixed(4)}) translate(-960,-540)"><image href="${IMG(n)}" x="-40" y="-40" width="2000" height="1160" preserveAspectRatio="xMidYMid slice"/></g><rect width="1920" height="1080" fill="rgba(8,10,18,${dark})"/>`; };

// 4 古い数字に×
SC[4] = K((t) => { const k = clamp((t - 5.9) / .5);
  const clip = `<g transform="translate(560,520) rotate(-4)">` + `<rect x="-330" y="-210" width="660" height="400" fill="#e8e2d4"/>` + txt(-300, -150, 'よく見るネットの記事', { size: 26, color: '#776', shadow: false, anchor: 'start' }) + txt(0, -60, '東京は42位', { size: 70, color: '#222', shadow: false, serif: true }) + txt(0, 40, '通勤を入れると最下位', { size: 50, color: '#222', shadow: false, serif: true }) + txt(0, 140, '（2014年の数字）', { size: 34, color: '#a33', shadow: false }) + '</g>';
  const x = `<path d="M260,300 L${260 + 600 * k},${300 + 440 * k}" stroke="${RED}" stroke-width="18" stroke-linecap="round"/>` + (t > 6.3 ? `<path d="M860,300 L${860 - 600 * clamp((t - 6.3) / .5)},${300 + 440 * clamp((t - 6.3) / .5)}" stroke="${RED}" stroke-width="18" stroke-linecap="round"/>` : '');
  return R([
    { at: 0, slide: 0, f: () => clip },
    { at: 5.9, slide: 0, f: () => x },
    { at: 8.3, dx: 120, f: () => `<g transform="translate(1400,520)">` + card(-300, -200, 600, 400, { fill: 'rgba(240,200,90,.14)', stroke: Y }) + txt(0, -110, '国の最新の資料（2019年）', { size: 34, color: C.dim }) + txt(0, 30, '東京は40位', { size: 84, color: Y, serif: true }) + txt(0, 120, '最下位ではない', { size: 40 }) + '</g>' },
    ref(SR1),
  ], t); }, 0, { enter: 'fade', zoom: 0 });

// 5 国交省（写真）→ 資料カード。47県が1つずつ並ぶ
SC[5] = K((t) => { let sq = ''; const n = Math.floor(clamp((t - 4.5) / 5) * 47);
  for (let i = 0; i < 47; i++) { const x = 1080 + (i % 8) * 86, y = 340 + Math.floor(i / 8) * 86; sq += `<rect x="${x}" y="${y}" width="70" height="70" rx="10" fill="${i < n ? (i === 12 ? Y : '#6a6878') : '#2c2a34'}"/>`; }
  return R([
    { at: 2.4, f: () => `<g transform="translate(560,540)">` + card(-380, -230, 760, 460, { fill: '#f1ece2' }) + txt(0, -140, '国土交通省', { size: 64, color: '#222', shadow: false, serif: true }) + txt(0, -50, '都道府県別の経済的豊かさ', { size: 44, color: '#333', shadow: false }) + `<rect x="-300" y="-10" width="600" height="3" fill="#bbb"/>` + txt(0, 60, 'もとの統計：総務省', { size: 34, color: '#555', shadow: false }) + txt(0, 110, '全国家計構造調査（2019年）', { size: 34, color: '#555', shadow: false }) + '</g>' },
    { at: 4.3, slide: 0, f: () => sq + txt(1380, 300, '47都道府県を並べる', { size: 36, color: C.dim }) },
  ], t); }, 0, { enter: 'fade', zoom: 0 });

// 6 4枚のカード
const FOUR = [['①', '手取り'], ['②', '生活費'], ['③', '通勤'], ['④', 'それでも東京？']];
SC[6] = K((t) => R([
  { at: 0, f: () => head('東京の入場料の正体', { y: 260, size: 58 }) },
  ...FOUR.map(([n, s0], i) => ({ at: .6 + i * .6, dx: 160, slide: 0, f: () => card(170 + i * 400, 430, 360, 280) + txt(350 + i * 400, 530, n, { size: 60, color: Y, serif: true }) + txt(350 + i * 400, 630, s0, { size: i === 3 ? 38 : 48 }) })),
], t), 0, { enter: 'fade', zoom: 0 });

// 7 給与明細：額面 → 税金・保険料が落ちる → 手取り
SC[7] = K((t) => { const d1 = clamp((t - 2.6) / 1.2), d2 = clamp((t - 3.4) / 1.2);
  const bar = `<rect x="460" y="460" width="600" height="120" rx="12" fill="${Y}"/>` + txt(760, 535, '手取り', { size: 48, color: '#1b1a20', shadow: false })
    + `<g transform="translate(0,${d1 * d1 * 420}) rotate(${d1 * 8},1160,520)" opacity="${1 - d1 * .8}"><rect x="1064" y="460" width="190" height="120" rx="12" fill="#8a7a9a"/>${txt(1159, 535, '税金', { size: 40, shadow: false })}</g>`
    + `<g transform="translate(0,${d2 * d2 * 420}) rotate(${-d2 * 6},1360,520)" opacity="${1 - d2 * .8}"><rect x="1258" y="460" width="200" height="120" rx="12" fill="#6a7a9a"/>${txt(1358, 535, '保険料', { size: 40, shadow: false })}</g>`;
  return R([
    { at: 0, f: () => head('給与明細', { y: 230 }) + txt(460, 420, '額面（もらう給料）', { size: 34, color: C.dim, anchor: 'start' }) },
    { at: .3, slide: 0, f: () => bar },
    { at: 4.6, f: () => txt(760, 700, '実際に手元に入るお金', { size: 42, color: Y }) },
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 8 比べる世帯：家族は枠の中、一人暮らしと経営者は外へ出ていく
SC[8] = K((t) => { const out = easeOut(clamp((t - 3.8) / 1.6));
  return R([
    { at: 0, f: () => `<rect x="330" y="300" width="760" height="520" rx="30" fill="rgba(240,200,90,.08)" stroke="${Y}" stroke-width="4"/>` + txt(710, 370, '2人以上・会社勤めの世帯', { size: 40, color: Y }) + person(560, 640, 110, M) + person(760, 640, 104, F, 'f') + person(900, 700, 62, '#9ab0d8') },
    { at: 3.6, slide: 0, f: () => person(1250 + 260 * out, 640, 90, '#8a8894') + txt(1250 + 260 * out, 800, '一人暮らし', { size: 32, color: C.dim }) + person(1500 + 220 * out, 640, 90, '#8a8894') + `<path d="M${1500 + 220 * out},${560} l0,70" stroke="${RED}" stroke-width="10"/>` + txt(1500 + 220 * out, 800, '会社の経営者', { size: 32, color: C.dim }) + (out > .5 ? txt(1520, 380, '入っていない', { size: 40, color: RED }) : '') },
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 9 平均の手取り：表彰台が下から伸びる
const podium = (x, base, h, r, name, t, t0, col) => { const k = easeOut(clamp((t - t0) / .9)); return `<rect x="${x - 120}" y="${base - h * k}" width="240" height="${h * k}" rx="8" fill="${col}"/>` + (k > .9 ? txt(x, base - h - 30, name, { size: 48, color: r === 1 ? Y : C.fg }) + txt(x, base - h + 80, r + '位', { size: 60, color: '#1b1a20', shadow: false, serif: true }) : ''); };
SC[9] = K((t) => R([
  { at: 0, f: () => head('働く世帯の手取り（すべての世帯の平均）', { y: 200 }) },
  { at: 0, slide: 0, f: () => podium(960, 860, 360, 1, '東京', t, 1.2, Y) + podium(660, 860, 260, 2, '茨城', t, 5.4, '#c9c2b2') + podium(1260, 860, 200, 3, '富山', t, 5.9, '#b08a5a') },
  ref(SR1),
], t), 1, { enter: 'fade', zoom: 0 });

// 10 平均の落とし穴：1軒の塔が伸びると、平均線が引き上がる
SC[10] = K((t) => { const g = easeOut(clamp((t - 2.6) / 3.0)), th = 120 + 520 * g, avg = 120 + (520 * g) / 10;
  let hs = ''; for (let i = 0; i < 9; i++) hs += `<rect x="${330 + i * 120}" y="${860 - 120}" width="80" height="120" rx="6" fill="#6a6878"/>`;
  return R([
    { at: 0, f: () => head('平均の落とし穴', { y: 200 }) },
    { at: 0, slide: 0, f: () => hs + `<rect x="${330 + 9 * 120}" y="${860 - th}" width="80" height="${th}" rx="6" fill="${Y}"/>` + `<path d="M290,${860 - avg} L1520,${860 - avg}" stroke="${RED}" stroke-width="5" stroke-dasharray="16 10"/>` + txt(1560, 870 - avg, '平均', { size: 40, color: RED, anchor: 'start' }) },
    { at: 2.4, f: () => txt(1380, 330, 'お金持ちの家 →', { size: 36, color: Y, anchor: 'end' }) },
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 11 10軒の町：9軒400万円・1軒1億円 → 平均1360万円 → その家は1軒もない
SC[11] = K((t) => { const k = easeOut(clamp((t - 2.5) / 2.5)), a = clamp((t - 7.0) / 1.2), sc = clamp((t - 10.8) / 3.5);
  let g = ''; for (let i = 0; i < 9; i++) { const x = 300 + i * 120; g += `<rect x="${x}" y="${860 - 80}" width="80" height="80" rx="6" fill="#6a6878"/>`; }
  const tall = 80 + 560 * k; g += `<rect x="${300 + 9 * 120}" y="${860 - tall}" width="80" height="${tall}" rx="6" fill="${Y}"/>` + (k > .95 ? `<path d="M${1420},${290} l20,-30 l20,30" fill="${Y}"/>` : '');
  const ay = 860 - 80 - 120 * a;
  const scan = t > 10.8 ? `<rect x="${290 + sc * 1140}" y="${ay - 30}" width="10" height="60" fill="${RED}"/>` : '';
  return R([
    { at: 0, f: () => head('10軒の町', { y: 200 }) },
    { at: .3, slide: 0, f: () => g + txt(780, 920, '9軒は年収400万円', { size: 34, color: C.dim }) + (k > .3 ? txt(1390, 300, '1軒だけ1億円 →', { size: 38, color: Y, anchor: 'end' }) : '') },
    { at: 7.0, slide: 0, f: () => `<path d="M260,${ay} L1500,${ay}" stroke="${RED}" stroke-width="5" stroke-dasharray="16 10"/>` + txt(1520, ay + 12, '平均1360万円', { size: 40, color: RED, anchor: 'start' }) + scan },
    { at: 12.2, f: () => `<g transform="translate(960,420)">` + card(-360, -60, 720, 110, { fill: 'rgba(224,69,58,.18)', stroke: RED }) + txt(0, 14, 'この平均の家は、1軒もない', { size: 46, color: '#fff' }) + '</g>' },
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 12 100軒を並べ、41〜60番目が光る
SC[12] = K((t) => { const s0 = clamp((t - 5.0) / 3.0); let g = '';
  for (let i = 0; i < 100; i++) { const x = 300 + (i % 20) * 66, y = 330 + Math.floor(i / 20) * 96, h = 20 + (99 - i) * .5, lit = i >= 40 && i < 60 && (i - 40) / 20 < s0;
    g += `<g transform="translate(${x},${y + 60})"><path d="M-22,-${h * .3 + 22} L0,-${h * .3 + 40} L22,-${h * .3 + 22}Z" fill="${lit ? Y : '#55535f'}"/><rect x="-18" y="-${h * .3 + 22}" width="36" height="${h * .3 + 22}" fill="${lit ? Y : '#55535f'}"/></g>`; }
  return R([
    { at: 0, f: () => head('収入の順に100軒並べる', { y: 200 }) + txt(300, 270, '← 収入が多い', { size: 28, color: C.dim, anchor: 'start' }) + txt(1580, 270, '少ない →', { size: 28, color: C.dim, anchor: 'end' }) },
    { at: .3, slide: 0, f: () => g },
    { at: 8.2, f: () => txt(960, 900, '41〜60番目の20軒', { size: 40, color: Y }) },
    { at: 10.0, f: (lt) => `<g transform="translate(960,980) scale(${pop(lt / .4)})">${txt(0, 0, '＝ 中央世帯', { size: 50, color: Y, serif: true })}</g>` },
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 13 中央世帯の手取り：茨城・埼玉・長野・島根が順に光る、東京5位
const V13 = [560, 430, 1.55];
SC[13] = K((t) => { const lit = { 8: [Y, .6], 11: ['#e8c987', 3.7], 20: ['#d9b46a', 4.4], 32: ['#c9a35a', 5.1], 13: ['#8a8894', 6.8] };
  return R([
    { at: 0, slide: 0, bg: true, f: () => litMap(V13, lit, t, 640, 600) },
    { at: 0, f: () => `<rect x="440" y="115" width="1040" height="90" rx="45" fill="rgba(20,19,26,.85)"/>` + head('真ん中の家庭の手取り', { y: 170 }) },
    { at: 0, slide: 0, f: () => rlist(1340, 330, [[1, '茨城'], [2, '埼玉'], [3, '長野'], [4, '島根'], [5, '東京']], t, [.6, 3.7, 4.4, 5.1, 6.8], 0, null) },
    ref(SR1),
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 14 東京の平均を押し上げていたのは一部：平均線が真ん中へ下りる
SC[14] = K((t) => { const d = easeOut(clamp((t - 3.6) / 1.6));
  const town = (x0, tall, col, lab, line) => { let g = ''; for (let i = 0; i < 7; i++) g += `<rect x="${x0 + i * 70}" y="${860 - 150}" width="54" height="150" rx="5" fill="#6a6878"/>`; if (tall) g += `<rect x="${x0 + 7 * 70}" y="${860 - 520}" width="54" height="520" rx="5" fill="${Y}"/>`;
    return g + `<path d="M${x0 - 20},${860 - line} L${x0 + 580},${860 - line}" stroke="${col}" stroke-width="5" stroke-dasharray="14 8"/>` + txt(x0 + 270, 930, lab, { size: 44 }); };
  return R([
    { at: 0, f: () => head('真ん中の家庭で比べると', { y: 200 }) },
    { at: 0, slide: 0, f: () => town(260, true, RED, '東京', lerp(260, 165, d)) + town(1100, false, Y, '茨城', 175) + (d > .9 ? txt(560, 660, '真ん中は、ほぼ同じ', { size: 36, color: '#fff' }) : '') },
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 15 茨城：平均2位 → 真ん中の家庭で1位（下の段から上の段へ上がる）
SC[15] = K((t) => { const u = easeOut(clamp((t - 2.8) / 1.4)), T = vp(V13, 640, 600)(pc(8));
  return R([
    { at: 0, slide: 0, bg: true, f: () => litMap(V13, { 8: [Y, 0] }, t, 640, 600) + `<circle cx="${T[0]}" cy="${T[1]}" r="${46 + 8 * Math.sin(t * 3)}" fill="${Y}" opacity=".22" filter="url(#glow)"/>` },
    { at: 0, f: () => `<rect x="440" y="115" width="1040" height="90" rx="45" fill="rgba(20,19,26,.85)"/>` + head('茨城の順位', { y: 170 }) },
    { at: 0, slide: 0, f: () => card(1320, 330, 420, 150, { fill: 'rgba(240,200,90,.16)', stroke: Y }) + txt(1530, 375, '真ん中の家庭', { size: 30, color: Y }) + card(1320, 600, 420, 150) + txt(1530, 645, '平均', { size: 30, color: C.dim })
      + `<g opacity="${1 - .6 * clamp(u * 2)}">${txt(1530, 720, '2位', { size: 70, serif: true })}</g>` + `<g opacity="${clamp(u * 2 - 1)}">${txt(1530, 450, '1位', { size: 70, color: Y, serif: true })}</g>`
      + (t > 2.8 ? `<path d="M1770,700 L1770,${700 - 250 * u}" stroke="${Y}" stroke-width="5"/><path d="M1758,${714 - 250 * u} l12,-14 l12,14" stroke="${Y}" stroke-width="5" fill="none"/>` : '') },
    ref(SR1),
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 16 出ていくお金：財布から3つの箱へコインが流れる
const BOX3 = [['食費', 6.5], ['家賃', 7.4], ['光熱費', 8.3]];
SC[16] = K((t) => { let cs = ''; for (let i = 0; i < 9; i++) { const tt = 2.0 + i * .5; if (t < tt) continue; const k = clamp((t - tt) / .9), b = i % 3, x = lerp(960, 560 + b * 400, k), y = 380 + (700 - 380) * k - Math.sin(k * Math.PI) * 120; if (k < 1) cs += coin(x, y, .9); }
  return R([
    { at: 0, f: () => head('出ていくお金', { y: 200 }) + `<g transform="translate(960,380)"><rect x="-90" y="-56" width="180" height="112" rx="16" fill="#8a6234"/><rect x="10" y="-20" width="70" height="40" rx="8" fill="#6a4a24"/></g>` },
    ...BOX3.map(([n, at], i) => ({ at, slide: 0, f: (lt) => `<g transform="translate(${560 + i * 400},740) scale(${pop(lt / .4)})">` + card(-150, -70, 300, 160) + txt(0, 30, n, { size: 48 }) + '</g>' })),
    { at: 0, slide: 0, f: () => cs },
    { at: 10.3, f: () => `<path d="M400,880 L1520,880" stroke="${Y}" stroke-width="4"/>` + txt(960, 950, '＝ 基礎支出', { size: 52, color: Y, serif: true }) },
    ref(SR1),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 17 持ち家に「もし借りたら」の値札が揺れる
SC[17] = K((t) => { const sw = t > 2.3 ? Math.sin((t - 2.3) * 4) * 14 * Math.exp(-(t - 2.3) * .5) : 0;
  return R([
    { at: 0, slide: 0, f: () => `<g transform="translate(760,760)"><path d="M-260,-200 L0,-400 L260,-200Z" fill="#b08a5a"/><rect x="-220" y="-200" width="440" height="300" fill="#c9a35a"/><rect x="-50" y="-30" width="100" height="130" fill="#6a4a24"/><rect x="-170" y="-150" width="90" height="80" fill="#e8dcc0"/><rect x="80" y="-150" width="90" height="80" fill="#e8dcc0"/></g>` + txt(760, 930, '持ち家', { size: 40 }) },
    { at: 2.3, slide: 0, f: (lt) => `<g transform="translate(1060,400) rotate(${sw})"><path d="M0,0 L0,90" stroke="#ddd" stroke-width="3"/><g transform="translate(0,90)"><path d="M-130,0 L130,0 L130,180 L-130,180 Z" fill="#f1ece2"/><circle cx="0" cy="22" r="10" fill="#1b1a20"/>${txt(0, 90, 'もし借りたら', { size: 34, color: '#333', shadow: false })}${txt(0, 150, '家賃 ○万円', { size: 40, color: RED, shadow: false, serif: true })}</g></g>` },
    { at: 5.2, f: () => txt(1500, 560, '計算に入れる', { size: 40, color: Y }) },
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 18 基礎支出：高い県が赤く、安い県が青く順に灯る
SC[18] = K((t) => { const lit = { 13: ['#e06a5a', .8], 11: ['#e09a7a', 5.2], 27: ['#e09a7a', 5.9], 46: ['#6aa0e0', 7.6], 45: ['#6aa0e0', 8.2], 47: ['#6aa0e0', 8.8], 9: [Y, 9.6] };
  return R([
    { at: 0, slide: 0, bg: true, f: () => litMap([600, 470, 1.0], lit, t, 640, 600) },
    { at: 0, f: () => `<rect x="440" y="115" width="1040" height="90" rx="45" fill="rgba(20,19,26,.85)"/>` + head('基礎支出（食費・家賃・光熱費）', { y: 170 }) },
    { at: 0, slide: 0, f: () => txt(1520, 300, '高い', { size: 36, color: '#e06a5a' }) + rlist(1300, 380, [[1, '東京'], [2, '埼玉'], [3, '大阪']], t, [.8, 5.2, 5.9], 0, null) + txt(1520, 700, '安い', { size: 36, color: '#6aa0e0' }) + (t > 7.6 ? txt(1520, 780, '鹿児島・宮崎・沖縄', { size: 36 }) : '') + (t > 9.6 ? txt(1520, 850, '栃木', { size: 46, color: Y }) : '') },
    ref(SR1),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 19 家賃の棒：東京が伸び、宮崎が伸び、宮崎をもう1本積むと東京に届く
SC[19] = K((t) => { const a = easeOut(clamp((t - 2.6) / 1.6)), b = easeOut(clamp((t - 8.2) / 1.4)), c = easeOut(clamp((t - 11.2) / .8)), S = 5.6 / 1000;
  const tb = 94802 * S * a, mb = 46290 * S * b;
  return R([
    { at: 0, f: () => head('民間の賃貸住宅　1か月の家賃', { y: 200 }) },
    { at: 0, slide: 0, f: () => `<path d="M520,860 L1400,860" stroke="#6a6470" stroke-width="3"/>`
      + `<rect x="620" y="${860 - tb}" width="220" height="${tb}" rx="8" fill="${RED}"/>` + (a > .05 ? roll(730, 830 - tb, 0, 94802, t, 2.6, 1.6, { size: 54, unit: '円', color: '#fff' }) : '') + txt(730, 920, '東京（全国一）', { size: 36 })
      + `<rect x="1080" y="${860 - mb}" width="220" height="${mb}" rx="8" fill="#6aa0e0"/>` + (b > .05 && c < .5 ? roll(1190, 830 - mb, 0, 46290, t, 8.2, 1.4, { size: 54, unit: '円', color: '#fff' }) : '') + txt(1190, 920, '宮崎（いちばん安い）', { size: 36 })
      + (c > 0 ? `<rect x="1080" y="${860 - mb - mb * c}" width="220" height="${mb * c}" rx="8" fill="#6aa0e0" opacity=".55" stroke="#fff" stroke-dasharray="10 8"/>` + txt(1440, 860 - mb * 1.6, 'ほぼ2倍', { size: 54, color: Y, anchor: 'start', serif: true }) : '') },
    ref('総務省 令和5年住宅・土地統計調査（民営借家・専用住宅）'),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 20 畳6枚：1枚ずつ値札が貼られる（東京／全国）
const tatami = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#b5ad7a" stroke="#4a4630" stroke-width="5"/>`;
SC[20] = K((t) => { const row = (y, val, t0, col) => { let g = ''; for (let i = 0; i < 6; i++) { g += tatami(320 + i * 180, y, 160, 220); if (t > t0 + i * .35) { const k = clamp((t - t0 - i * .35) / .25); g += `<g transform="translate(${400 + i * 180},${y + 110}) scale(${1.4 - .4 * k})" opacity="${k}"><rect x="-72" y="-30" width="144" height="60" rx="8" fill="${col}"/>${txt(0, 12, val, { size: 30, color: '#1b1a20', shadow: false })}</g>`; } } return g; };
  return R([
    { at: 0, f: () => head('畳1枚あたりの家賃（1か月）', { y: 200 }) },
    { at: 2.6, slide: 0, f: () => txt(300, 400, '東京', { size: 40, anchor: 'end', color: RED }) + row(290, '5,692円', 3.2, '#f0a090') },
    { at: 7.8, slide: 0, f: () => txt(300, 650, '全国', { size: 40, anchor: 'end' }) + row(540, '3,393円', 8.0, '#c9d8f0') },
    { at: 9.6, f: (lt) => `<g transform="translate(1640,560) scale(${pop(lt / .4)})">` + card(-170, -140, 340, 280, { fill: 'rgba(240,200,90,.16)', stroke: Y }) + txt(0, -70, '6畳なら', { size: 34, color: C.dim }) + txt(0, 10, '毎月', { size: 34 }) + txt(0, 90, '約1.4万円差', { size: 46, color: Y, serif: true }) + '</g>' },
    ref('東京都 令和5年住宅・土地統計調査（借家1畳当たり家賃）'),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 21 家がもう1軒、料金箱に吸い込まれる → 入場料1枚目
SC[21] = K((t) => { const k = clamp((t - 2.2) / 1.6), hx = lerp(860, 1420, easeOut(k)), hy = 600 + (700 - 600) * k * k, hs = 1.6 * (1 - .8 * k);
  const box = `<g transform="translate(1420,720)"><rect x="-160" y="-90" width="320" height="220" rx="16" fill="#5a4a2a"/><rect x="-100" y="-100" width="200" height="18" rx="9" fill="#1b1a20"/>${txt(0, 50, '入場料', { size: 46, color: Y, serif: true })}</g>`;
  return R([
    { at: 0, slide: 0, f: () => house(500, 700, 1.6, '#c9a35a') + txt(500, 820, '自分の家', { size: 36 }) + box + (k < 1 ? house(hx, hy, hs, '#e8c987') : '') + (t > 1.6 && k < .3 ? txt(860, 560, 'もう1軒分', { size: 40, color: Y }) : '') },
    { at: 5.6, slide: 0, f: () => ticket(960, 300, '入場料 1枚目：家賃', t, 5.6) },
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 22 手取り − 基礎支出 ＝ 自由に使えるお金 → 1〜4位
SC[22] = K((t) => { const cut = easeOut(clamp((t - 1.6) / 1.4));
  return R([
    { at: 0, f: () => head('自由に使えるお金', { y: 200 }) },
    { at: .3, slide: 0, f: () => `<rect x="200" y="380" width="${700 - 280 * cut}" height="110" rx="12" fill="${Y}"/>` + txt(220, 450, '手取り', { size: 40, color: '#1b1a20', shadow: false, anchor: 'start' })
      + `<g transform="translate(${cut * 60},${cut * 260})" opacity="${1 - cut * .6}"><rect x="${900 - 280}" y="380" width="280" height="110" rx="12" fill="#8a7a9a"/>${txt(760, 450, '基礎支出', { size: 36, shadow: false })}</g>`
      + (cut > .9 ? txt(420, 560, '残ったお金', { size: 36, color: Y }) : '') },
    { at: 0, slide: 0, f: () => rlist(1200, 360, [[1, '茨城'], [2, '島根'], [3, '鳥取'], [4, '長野']], t, 5.3, .55, '茨城') },
    ref(SR1),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 23 東京 5位 → 25位（数字が回って落ちる）
SC[23] = K((t) => { const k = clamp((t - .2) / 1.6), v = Math.round(5 + 20 * ease(k)), y = 380 + 260 * ease(k);
  return R([
    { at: 0, f: () => head('東京の順位', { y: 200 }) },
    { at: 0, slide: 0, f: () => `<path d="M960,330 L960,700" stroke="#4a4856" stroke-width="10" stroke-linecap="round"/>` + txt(1060, 360, '5位　手取り', { size: 34, color: C.dim, anchor: 'start' }) + txt(1060, 690, '25位　生活費を引く', { size: 34, color: C.dim, anchor: 'start' })
      + `<g transform="translate(860,${y})"><g style="font-variant-numeric:tabular-nums">${txt(0, 30, v + '位', { size: 110, color: k < 1 ? Y : '#d9b46a', serif: true, anchor: 'end' })}</g></g>` },
    { at: 1.4, f: () => txt(960, 880, 'ちょうど真ん中', { size: 46, color: '#fff' }) },
    ref(SR1),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 25 通勤時間 × 時給 ＝ お金（時計の針が回ってコインが出る）
SC[25] = K((t) => { let cs = ''; for (let i = 0; i < 6; i++) { const tt = 6.0 + i * .45; if (t < tt) continue; const k = clamp((t - tt) / .8); cs += coin(1420 + (i % 3 - 1) * 50, 420 + 280 * k * k, 1.2); }
  return R([
    { at: 0, f: () => head('通勤の時間をお金に直す', { y: 200 }) },
    { at: 0, slide: 0, f: () => clock(420, 560, 2.4, t * 3) + txt(420, 760, '通勤の時間', { size: 36 }) },
    { at: 0, slide: 0, f: () => txt(420, 420 + 0, '', { size: 1 }) + (t > 1.0 ? txt(420, 330, '働いていない・休んでいない', { size: 30, color: C.dim }) : '') },
    { at: 4.4, f: () => txt(720, 580, '×', { size: 90 }) + `<g transform="translate(960,560)">` + card(-150, -80, 300, 160) + txt(0, -10, '1時間あたり', { size: 30, color: C.dim }) + txt(0, 46, 'の給料', { size: 40 }) + '</g>' + txt(1200, 580, '＝', { size: 90 }) },
    { at: 5.6, slide: 0, f: () => cs + txt(1420, 780, 'お金', { size: 44, color: Y }) },
    ref(SR1),
  ], t); }, 3, { enter: 'fade', zoom: 0 });

// 26 通勤・通学時間：東京95分／全国79分
SC[26] = K((t) => { const a = easeOut(clamp((t - 2.4) / 1.4)), b = easeOut(clamp((t - 6.6) / 1.2)), S = 6.0;
  return R([
    { at: 0, f: () => head('1日の通勤・通学時間（往復）', { y: 200 }) },
    { at: 0, slide: 0, f: () => `<path d="M380,320 L380,760" stroke="#6a6470" stroke-width="3"/>`
      + `<rect x="380" y="380" width="${95 * S * a}" height="120" rx="10" fill="${RED}"/>` + txt(360, 460, '東京', { size: 40, anchor: 'end' }) + (a > .9 ? txt(400 + 95 * S, 460, '1時間35分', { size: 44, anchor: 'start' }) : '')
      + `<rect x="380" y="580" width="${79 * S * b}" height="120" rx="10" fill="#8a8894"/>` + txt(360, 660, '全国', { size: 40, anchor: 'end' }) + (b > .9 ? txt(400 + 79 * S, 660, '1時間19分', { size: 44, anchor: 'start' }) : '')
      + (b > .99 ? `<path d="M${380 + 79 * S},560 L${380 + 79 * S},520 L${380 + 95 * S},520 L${380 + 95 * S},500" stroke="${Y}" stroke-width="5" fill="none"/>` + txt(400 + 95 * S, 540, '← 16分の差', { size: 40, color: Y, anchor: 'start' }) : '') },
    ref('総務省 令和3年社会生活基本調査'),
  ], t); }, 3, { enter: 'fade', zoom: 0 });

// 27 16分×240日＝64時間 → カレンダー8日分が塗られる（頭に写真）
SC[27] = K((t) => { let cal = ''; for (let i = 0; i < 30; i++) { const x = 1040 + (i % 7) * 104, y = 400 + Math.floor(i / 7) * 96, on = i < 8 && t > 7.8 + i * .35; cal += `<rect x="${x}" y="${y}" width="90" height="82" rx="8" fill="${on ? RED : '#3a3842'}"/>` + txt(x + 45, y + 52, i + 1, { size: 28, color: on ? '#fff' : '#8a8894', shadow: false }); }
  return R([
    { at: 0, f: () => head('1日16分の差', { y: 200 }) },
    { at: 4.3, slide: 0, f: () => txt(520, 420, '16分 × 240日', { size: 56 }) + txt(520, 520, '＝', { size: 60 }) + roll(520, 650, 0, 64, t, 4.6, 1.6, { unit: '時間', size: 110 }) },
    { at: 7.4, slide: 0, f: () => cal + txt(1400, 360, '8日分の働く時間', { size: 40, color: RED }) },
  ], t); }, 3, { enter: 'fade', zoom: 0 });

// 28 見えない請求書
SC[28] = K((t) => R([
  { at: 0, slide: 0, f: (lt) => `<g transform="translate(960,${560 + (1 - easeOut(clamp(lt / .8))) * 500})">` + `<rect x="-360" y="-330" width="720" height="620" rx="10" fill="#f1ece2"/>` + txt(0, -240, '見えない請求書', { size: 54, color: '#222', shadow: false, serif: true }) + `<rect x="-300" y="-200" width="600" height="3" fill="#bbb"/>`
    + txt(-300, -110, '通勤の時間（年）', { size: 36, color: '#333', shadow: false, anchor: 'start' }) + txt(300, -110, '64時間', { size: 40, color: '#333', shadow: false, anchor: 'end' })
    + txt(-300, -20, '時給（例）', { size: 36, color: '#333', shadow: false, anchor: 'start' }) + txt(300, -20, '2,000円', { size: 40, color: '#333', shadow: false, anchor: 'end' }) + `<rect x="-300" y="30" width="600" height="3" fill="#bbb"/>`
    + txt(-300, 120, '合計', { size: 40, color: '#333', shadow: false, anchor: 'start' }) + '</g>' },
  { at: 1.6, slide: 0, f: () => roll(1260, 680, 0, 128000, t, 1.6, 2.2, { unit: '円', size: 64, color: RED, anchor: 'end' }) },
  { at: 4.7, slide: 0, f: () => stamp(1380, 380, '毎年', t, 4.7) + txt(960, 980, '給与明細には載らない', { size: 40, color: Y }) },
], t), 3, { enter: 'fade', zoom: 0 });

// 29 通勤まで引いた順位 1〜5
SC[29] = K((t) => { const lit = { 8: [Y, 3.7], 31: ['#e8c987', 4.2], 32: ['#e8c987', 4.7], 20: ['#d9b46a', 5.2], 16: ['#d9b46a', 5.7] };
  return R([
    { at: 0, slide: 0, bg: true, f: () => litMap(V13, lit, t, 640, 600) },
    { at: 0, f: () => `<rect x="440" y="115" width="1040" height="90" rx="45" fill="rgba(20,19,26,.85)"/>` + head('通勤の時間まで引いた順位', { y: 170 }) },
    { at: 0, slide: 0, f: () => rlist(1340, 320, [[1, '茨城'], [2, '鳥取'], [3, '島根'], [4, '長野'], [5, '富山']], t, 3.7, .5, '茨城') },
    ref(SR1),
  ], t); }, 3, { enter: 'fade', zoom: 0 });

// 30 首都圏がまとめて暗くなる：東京40・神奈川41・千葉42
SC[30] = K((t) => { const v = lerpV([600, 450, 1.2], VW.kanto, ease(clamp(t / 1.6))), V = vp(v, 860, 600);
  const dk = (t0) => t > t0 ? '#5a3a3e' : '#cfc8b8'; const LY = { 13: 330, 14: 470, 12: 610 }; const lab = (c, s0, t0) => { if (t < t0) return ''; const P = V(pc(c)), k = clamp((t - t0) / .4), ly = LY[c]; return `<g opacity="${k}"><path d="M${P[0]},${P[1]} L1380,${ly - 14}" stroke="#fff" stroke-width="3"/><circle cx="${P[0]}" cy="${P[1]}" r="8" fill="#fff"/>` + card(1390, ly - 60, 400, 90) + txt(1590, ly, s0, { size: 42, color: c === 13 ? RED : '#fff' }) + '</g>'; };
  return R([
    { at: 0, slide: 0, bg: true, f: () => jmap2(v, { ox: 860, oy: 600, fills: { 13: dk(.4), 14: dk(2.4), 12: dk(3.4), 11: '#cfc8b8' } }) + lab(13, '東京 40位', .6) + lab(14, '神奈川 41位', 2.6) + lab(12, '千葉 42位', 3.6) },
    { at: 0, f: () => `<rect x="440" y="115" width="1040" height="90" rx="45" fill="rgba(20,19,26,.85)"/>` + head('首都圏が並んで下位に', { y: 170 }) },
    ref(SR1),
  ], t); }, 3, { enter: 'fade', zoom: 0 });

// 31 最下位は沖縄：地図が沖縄へ動く
SC[31] = K((t) => { const v = lerpV([600, 450, 1.0], [260, 760, 2.6], ease(clamp((t - 1.0) / 2.0))), V = vp(v, 860, 560), P = V(pc(47));
  return R([
    { at: 0, slide: 0, bg: true, f: () => jmap2(v, { ox: 860, oy: 560, fills: { 47: t > 2.5 ? '#6aa0e0' : '#cfc8b8', 13: '#8a8894' } }) + (t > 2.5 ? `<g transform="translate(${P[0] + 220},${P[1] - 40}) scale(${pop((t - 2.5) / .4)})">${txt(0, 0, '沖縄 47位', { size: 60, color: '#fff', serif: true })}</g>` : '') },
    { at: 0, f: () => `<rect x="440" y="115" width="1040" height="90" rx="45" fill="rgba(20,19,26,.85)"/>` + head('最下位は東京ではない', { y: 170 }) },
    { at: 3.8, f: () => `<g transform="translate(1400,820)">` + card(-330, -60, 660, 110) + txt(0, 14, '真ん中の家庭の手取りも47位', { size: 38 }) + '</g>' },
    ref(SR1),
  ], t); }, 3, { enter: 'fade', zoom: 0 });

// 32 埼玉：東京に通い、安い家に住む（頭に写真）。点の列が埼玉→東京へ往復
SC[32] = K((t) => { const V = vp(VW.kanto, 860, 600), S = V(pc(11)), T = V(pc(13)); let dots = '';
  if (t > 4.0) for (let i = 0; i < 14; i++) { const ph = ((t - 4.0) * .5 + i / 14) % 1, x = lerp(S[0], T[0], ph), y = lerp(S[1], T[1], ph); dots += `<circle cx="${x}" cy="${y}" r="9" fill="${M}" opacity="${Math.sin(ph * Math.PI)}"/>`; }
  return R([
    { at: 0, slide: 0, bg: true, f: () => jmap2(VW.kanto, { ox: 860, oy: 600, fills: { 11: Y, 13: '#5a3a3e' } }) + dots + txt(S[0], S[1] - 30, '埼玉', { size: 44, color: '#1b1a20', shadow: false }) + txt(T[0] + 40, T[1] + 70, '東京', { size: 40, color: '#fff' }) },
    { at: 0, f: () => `<rect x="440" y="115" width="1040" height="90" rx="45" fill="rgba(20,19,26,.85)"/>` + head('埼玉は24位', { y: 170 }) },
    { at: 3.6, f: () => card(1360, 300, 470, 130) + txt(1595, 355, '真ん中の家庭の手取り', { size: 28, color: C.dim }) + txt(1595, 405, '全国2位', { size: 46, color: Y }) },
    { at: 7.0, f: () => card(1360, 470, 470, 150) + txt(1595, 530, '東京に通いながら', { size: 34 }) + txt(1595, 585, '安い家に住む', { size: 34, color: Y }) },
    { at: 10.0, slide: 0, f: () => stamp(1595, 780, '値切る', t, 10.0, Y, 54) },
    ref(SR1),
  ], t); }, 3, { enter: 'fade', zoom: 0 });

// 33 階段：1→5→25→40 → 入場料2枚目
SC[33] = K((t) => R([
  { at: 0, f: () => head('手取り1位の街が、40位に', { y: 200 }) },
  { at: 0, slide: 0, f: () => stairs(t, [.2, 1.2, 2.2, 3.2]) },
  { at: 5.2, slide: 0, f: () => ticket(1480, 300, '入場料 2枚目：時間', t, 5.2) },
], t), 3, { enter: 'fade', zoom: 0 });

// 34 栃木 29位 → 18位（頭に写真）。人が階段を上る
SC[34] = K((t) => { const k = easeOut(clamp((t - 4.6) / 2.0)), v = Math.round(29 - 11 * k);
  return R([
    { at: 0, slide: 0, bg: true, f: () => jmap2([655, 400, 4.0], { ox: 560, oy: 600, fills: { 9: Y, 13: '#5a3a3e' } }) + txt(vp([655, 400, 4.0], 560, 600)(pc(9))[0], vp([655, 400, 4.0], 560, 600)(pc(9))[1], '栃木', { size: 46, color: '#1b1a20', shadow: false }) },
    { at: 0, f: () => `<rect x="440" y="115" width="1040" height="90" rx="45" fill="rgba(20,19,26,.85)"/>` + head('栃木（宇都宮）の順位', { y: 170 }) },
    { at: 4.4, slide: 0, f: () => card(1180, 330, 560, 300) + txt(1460, 400, '手取り 29位', { size: 36, color: C.dim }) + `<g style="font-variant-numeric:tabular-nums">${txt(1460, 540, v + '位', { size: 120, color: k > .99 ? Y : C.fg, serif: true })}</g>` + '' },
    { at: 9.4, f: () => card(1180, 680, 560, 140, { fill: 'rgba(240,200,90,.16)', stroke: Y }) + txt(1460, 765, '東京（40位）より22も上', { size: 40, color: Y }) },
    ref(SR1),
  ], t); }, 3, { enter: 'fade', zoom: 0 });

// 35 茨城：3つの1位が順に落ちてくる（頭に写真）
SC[35] = K((t) => { const md = (x, lb, t0) => { if (t < t0) return ''; const k = clamp((t - t0) / .5), y = 560 - 120 * (1 - k * k); return `<g transform="translate(${x},${y})" opacity="${k}"><circle r="110" fill="${Y}"/><circle r="92" fill="none" stroke="#a8812a" stroke-width="6"/>${txt(0, 26, '1位', { size: 72, color: '#1b1a20', shadow: false, serif: true })}</g>` + (k >= 1 ? txt(x, 740, lb, { size: 34 }) : ''); };
  return R([
    { at: 0, f: () => head('茨城は、どの計算でも上位', { y: 200 }) },
    { at: 4.2, slide: 0, f: () => md(560, '真ん中の家庭の手取り', 4.3) + md(960, '自由に使えるお金', 9.0) + md(1360, '通勤を引いたあと', 10.4) },
    ref(SR1),
  ], t); }, 3, { enter: 'fade', zoom: 0 });

// 36 それでも人は東京へ：全国から点の列が東京へ流れ込む
SC[36] = K((t) => { const v = [610, 450, 1.25], V = vp(v, 860, 560), T = V(pc(13)); let dots = '';
  const src = [1, 4, 15, 17, 23, 27, 34, 40, 43, 46, 7, 20].map(c => V(pc(c)));
  for (let s = 0; s < src.length; s++) for (let i = 0; i < 5; i++) { const ph = ((t * .35 + i / 5 + s * .13) % 1); if (t < 1.0 + s * .15) continue; const x = lerp(src[s][0], T[0], ph), y = lerp(src[s][1], T[1], ph); dots += `<circle cx="${x}" cy="${y}" r="9" fill="${Y}" opacity="${(Math.sin(ph * Math.PI) * .9).toFixed(2)}"/>`; }
  return R([
    { at: 0, slide: 0, bg: true, f: () => jmap2(v, { ox: 860, oy: 560, base: '#4a4856', stroke: '#2a2830', fills: { 13: '#e06a5a' } }) + dots + `<circle cx="${T[0]}" cy="${T[1]}" r="${26 + 6 * Math.sin(t * 4)}" fill="#e06a5a" opacity=".35" filter="url(#glow)"/>` },
    { at: 2.2, f: () => `<rect x="440" y="115" width="1040" height="90" rx="45" fill="rgba(20,19,26,.85)"/>` + head('なぜ人は東京に集まり続けるのか', { y: 170 }) },
    { at: 5.5, f: (lt) => `<g transform="translate(1560,560) scale(${pop(lt / .4)})">${txt(0, 0, '計算ミス？', { size: 64, color: Y, serif: true })}</g>` },
  ], t); }, 4, { enter: 'fade', zoom: 0 });

// 37 資料の範囲：家族は枠の中、一人暮らしの若者は外を歩いていく
SC[37] = K((t) => { const w = clamp((t - 7.6) / 3), x = 1300 + 300 * w;
  return R([
    { at: 0, f: () => head('この資料の範囲', { y: 200 }) },
    { at: 2.6, f: () => `<rect x="300" y="300" width="760" height="540" rx="30" fill="rgba(240,200,90,.08)" stroke="${Y}" stroke-width="4"/>` + txt(680, 370, '2人以上・会社勤め・真ん中', { size: 38, color: Y }) + person(560, 650, 110, M) + person(760, 650, 104, F, 'f') + person(900, 710, 62, '#9ab0d8') },
    { at: 7.6, slide: 0, f: () => person(x, 650 + Math.abs(Math.sin(t * 6)) * -8, 96, '#7fd1c1') + txt(1450, 850, '一人暮らしの若者', { size: 38 }) + txt(1450, 920, '入っていない', { size: 38, color: RED }) },
  ], t); }, 4, { enter: 'fade', zoom: 0 });

// 40 給与明細の大きな数字と、見えない料金（虫めがねが動いて小さな字を見つける）
SC[40] = K((t) => { const m = clamp((t - 8.6) / 4), mx = lerp(700, 1220, ease(m)), my = 700;
  return R([
    { at: 0, slide: 0, f: () => `<g transform="translate(960,560)"><rect x="-460" y="-330" width="920" height="620" rx="10" fill="#f1ece2"/>` + txt(-400, -240, '給与明細', { size: 40, color: '#555', shadow: false, anchor: 'start', serif: true }) + `<rect x="-400" y="-210" width="800" height="3" fill="#bbb"/>` + (t > 5.0 ? txt(0, -40, '給料 高い！', { size: 120, color: '#1b1a20', shadow: false, serif: true }) : '')
      + txt(-200, 150, '家賃 −', { size: 22, color: '#c9c2b2', shadow: false }) + txt(200, 150, '通勤時間 −', { size: 22, color: '#c9c2b2', shadow: false }) + '</g>' },
    { at: 8.6, slide: 0, f: () => `<g transform="translate(${mx},${my})"><circle r="110" fill="rgba(255,255,255,.12)" stroke="#3a3842" stroke-width="14"/><path d="M78,78 L170,170" stroke="#3a3842" stroke-width="26" stroke-linecap="round"/></g>` + (m > .1 ? txt(760, 720, '家賃 −', { size: 48, color: RED }) : '') + (m > .85 ? txt(1160, 720, '通勤時間 −', { size: 48, color: RED }) : '') },
    { at: 10.5, f: () => txt(960, 980, '明細には大きく書かれない', { size: 40, color: Y }) },
  ], t); }, 4, { enter: 'fade', zoom: 0 });

// 41 05の話：地方から東京へ流れる → 稼ぐ・出会う → 残す？（お金が東京から漏れ出す）
SC[41] = K((t) => { const v = [610, 450, 1.2], V = vp(v, 760, 560), T = V(pc(13)); let dots = '';
  const src = [2, 5, 6, 15, 18, 32, 38, 44].map(c => V(pc(c)));
  if (t < 11.0) for (let s = 0; s < src.length; s++) for (let i = 0; i < 4; i++) { const ph = (t * .4 + i / 4 + s * .17) % 1; dots += `<circle cx="${lerp(src[s][0], T[0], ph)}" cy="${lerp(src[s][1], T[1], ph)}" r="9" fill="${F}" opacity="${Math.sin(ph * Math.PI).toFixed(2)}"/>`; }
  let leak = ''; if (t > 11.2) for (let i = 0; i < 10; i++) { const ph = ((t - 11.2) * .5 + i / 10) % 1, a = i * .63; leak += coin(T[0] + Math.cos(a) * 260 * ph, T[1] + Math.sin(a) * 200 * ph, .6 * (1 - ph * .5)); }
  return R([
    { at: 0, slide: 0, bg: true, f: () => jmap2(v, { ox: 760, oy: 560, base: '#4a4856', stroke: '#2a2830', fills: { 13: '#e06a5a' } }) + dots + leak },
    { at: 0, f: () => card(1300, 140, 520, 90) + txt(1560, 200, '以前の回：地方→東京', { size: 34, color: C.dim }) },
    { at: 4.9, f: () => card(1300, 300, 520, 100) + txt(1560, 368, '理由の1つは「仕事」', { size: 40 }) },
    { at: 7.6, f: () => card(1300, 440, 250, 100, { fill: 'rgba(240,200,90,.16)', stroke: Y }) + txt(1425, 508, '稼ぐ', { size: 44, color: Y }) + card(1570, 440, 250, 100, { fill: 'rgba(239,127,168,.16)', stroke: F }) + txt(1695, 508, '出会う', { size: 44, color: F }) },
    { at: 11.2, f: (lt) => `<g transform="translate(1560,680) scale(${pop(lt / .4)})">` + card(-260, -60, 520, 120, { fill: 'rgba(224,69,58,.16)', stroke: RED }) + txt(0, 18, '残す場所？', { size: 52, color: '#fff', serif: true }) + '</g>' },
  ], t); }, 4, { enter: 'fade', zoom: 0 });

// 42 散らばった数字が1列に集まる
const BITS = [['1位', Y], ['5位', '#e8c987'], ['25位', '#d9b46a'], ['40位', RED], ['9.5万円', '#fff'], ['16分', '#fff']];
SC[42] = K((t) => { const k = easeOut(clamp((t - .4) / 2.2));
  return R([{ at: 0, slide: 0, f: () => BITS.map(([s0, c], i) => { const sx = [300, 1600, 500, 1400, 260, 1700][i], sy = [300, 280, 860, 880, 600, 620][i], ex = 360 + i * 240, ey = 560;
    return `<g transform="translate(${lerp(sx, ex, k)},${lerp(sy, ey, k)})">` + card(-100, -60, 200, 110) + txt(0, 18, s0, { size: 42, color: c, serif: true }) + '</g>'; }).join('') }], t); }, 5, { enter: 'fade', zoom: 0 });

// 43 まとめの階段
SC[43] = K((t) => R([
  { at: 0, f: () => head('東京の手取りの順位', { y: 200 }) },
  { at: 0, slide: 0, f: () => stairs(t, [.2, 2.5, 4.3, 6.7]) },
], t), 5, { enter: 'fade', zoom: 0 });

// 44 茨城の1位が3つ並ぶ
SC[44] = K((t) => { const T = vp(V13, 640, 600)(pc(8));
  return R([
    { at: 0, slide: 0, bg: true, f: () => litMap(V13, { 8: [Y, 0] }, t, 640, 600) + `<circle cx="${T[0]}" cy="${T[1]}" r="${46 + 8 * Math.sin(t * 3)}" fill="${Y}" opacity=".22" filter="url(#glow)"/>` },
    { at: 0, f: () => `<rect x="440" y="115" width="1040" height="90" rx="45" fill="rgba(20,19,26,.85)"/>` + head('茨城', { y: 170 }) },
    ...[0, 1, 2].map(i => ({ at: .6 + i * .5, slide: 0, f: (lt) => `<g transform="translate(1520,${340 + i * 200}) scale(${pop(lt / .4)})"><circle r="80" fill="${Y}"/>${txt(0, 20, '1位', { size: 54, color: '#1b1a20', shadow: false, serif: true })}</g>` })),
    { at: 3.5, f: () => txt(1520, 890, '手元にいちばん残せる', { size: 38, color: Y }) },
  ], t); }, 5, { enter: 'fade', zoom: 0 });

// 46 給料の差 − 家賃の差 − 通勤時間の差 ＝ 本当の差（棒が削れていく）
SC[46] = K((t) => { const a = easeOut(clamp((t - 4.6) / 1.0)), b = easeOut(clamp((t - 6.0) / 1.0));
  return R([
    { at: 0, f: () => head('引っ越し・転職のときの比べ方', { y: 200 }) },
    { at: .5, slide: 0, f: () => `<rect x="300" y="420" width="${1100 - 260 * a - 200 * b}" height="130" rx="12" fill="${Y}"/>` + txt(330, 500, '給料の差', { size: 44, color: '#1b1a20', shadow: false, anchor: 'start' })
      + `<g transform="translate(0,${a * a * 300})" opacity="${1 - a}"><rect x="${1400 - 460}" y="420" width="260" height="130" rx="12" fill="#e06a5a"/>${txt(1070, 500, '家賃の差', { size: 36, shadow: false })}</g>`
      + `<g transform="translate(0,${b * b * 300})" opacity="${1 - b}"><rect x="${1400 - 200}" y="420" width="200" height="130" rx="12" fill="#8a7a9a"/>${txt(1300, 500, '通勤時間', { size: 34, shadow: false })}</g>` },
    { at: 8.6, f: () => `<g transform="translate(${300 + (640) / 2},700)">` + card(-320, -60, 640, 120, { fill: 'rgba(240,200,90,.16)', stroke: Y }) + txt(0, 18, '＝ 本当に残る差', { size: 50, color: Y, serif: true }) + '</g>' },
  ], t); }, 5, { enter: 'fade', zoom: 0 });

// 47 天秤：東京に住む／地元で残す → コメント欄
SC[47] = K((t) => { const tilt = Math.sin(t * 1.2) * 7;
  return R([
    { at: 0, slide: 0, f: () => `<path d="M960,300 L960,800" stroke="#8a8478" stroke-width="12"/><rect x="860" y="790" width="200" height="22" rx="8" fill="#8a8478"/><g transform="rotate(${tilt},960,320)"><path d="M560,320 L1360,320" stroke="#b5ad9c" stroke-width="10"/><path d="M560,320 l-110,200 l220,0 Z" fill="none" stroke="#8a8478" stroke-width="3"/><path d="M1360,320 l-110,200 l220,0 Z" fill="none" stroke="#8a8478" stroke-width="3"/></g>`
      + `<g transform="translate(${560 + 0},${520 + Math.sin(tilt * Math.PI / 180) * -400})">${txt(0, 0, '入場料を払って東京', { size: 38, color: '#e06a5a' })}</g>`
      + (t > 4.4 ? `<g transform="translate(1360,${520 + Math.sin(tilt * Math.PI / 180) * 400})">${txt(0, 0, '地元で手元に残す', { size: 38, color: Y })}</g>` : '') },
    { at: 7.5, f: () => bubble(960, 950 - 60, 640, 100, 'コメント欄で教えてね', { size: 40 }) },
  ], t); }, 5, { enter: 'fade', zoom: 0 });

// ===== 3D =====
// 24 第3章：夜の通勤電車の中
SC[24] = { build() { const S = makeScene({ bg: '#0a0c14', hemi: .7, exposure: 1.4, sky: '#c8d0e0', ground: '#3a3a40', bloom: .3, bloomTh: .85, fov: 40 }); const s = S.s;
  box(s, 3, .05, 22, mat('#6a6458'), 0, 0, -8); box(s, 3, .05, 22, mat('#d8dce0'), 0, 2.4, -8);
  for (const sx of [-1, 1]) { box(s, .06, 2.4, 22, mat('#c8ccd2'), sx * 1.5, 1.2, -8); box(s, .5, .45, 20, mat('#4a5a8a'), sx * 1.2, .45, -8); box(s, .1, .5, 20, mat('#4a5a8a'), sx * 1.42, .9, -8);
    for (let i = 0; i < 6; i++) box(s, .02, .7, 1.6, glow('#1a2238', .6), sx * 1.47, 1.55, -1 - i * 3.2);
    for (let i = 0; i < 14; i++) { const z = -i * 1.2; cyl(s, .008, .008, .2, mat('#ddd'), sx * .9, 2.25, z, 4); const r = new THREE.Mesh(new THREE.TorusGeometry(.06, .012, 6, 12), mat('#f0f0f0')); r.position.set(sx * .9, 2.08, z); s.add(r); } }
  box(s, 2.2, .03, 22, mat('#c0c4c8', { m: .5, r: .3 }), 0, 2.2, -8);
  for (let i = 0; i < 6; i++) box(s, .4, .03, 1.4, glow('#f4f6ff', 1.2), 0, 2.37, -i * 3.4);
  const ppl = []; const r = rng(3); const cols = ['#2b3140', '#3a3a3a', '#4a3a34', '#22262e', '#5a4a5a'];
  for (let i = 0; i < 12; i++) { const p = human(s, { top: cols[i % 5], bottom: '#22252c', face: false, hairStyle: r() < .3 ? 'long' : 'short' }); p.position.set((r() - .5) * 1.4, 0, -1.5 - i * 1.3 - r() * .5); p.rotation.y = (r() - .5) * 2; ppl.push([p, r() * 6]); p.userData.arms[1].rotation.x = -2.6; }
  return { render() { S.render(); }, update(t, dur) { ppl.forEach(([p, ph]) => { p.rotation.z = Math.sin(t * 1.3 + ph) * .03; });
    camMove(S.cam, [0, 1.55, 3.2], [0, 1.5, 2.2], [0, 1.3, -10], [0, 1.3, -10], ease(t / dur)); S.cam.rotation.z = Math.sin(t * 1.3) * .006;
    const a = clamp((t - .4) / .5); return ovSvg(`<g opacity="${a}"><rect width="1920" height="360" fill="url(#topg)"/>${otxt(960, 160, '第3章', 34, '#ff8a3d', false)}${otxt(960, 250, '通勤時間という、見えない入場料', 64, Y)}</g>`); } }; } };

// 38 お金に換えられないもの：夜の東京の街
const cityStreet = (s, o = {}) => { const r = rng(o.seed || 9); box(s, 10, .02, 80, mat(o.road || '#2a2a30'), 0, -.01, -30); box(s, 2, .06, 80, mat(o.walk || '#3e3e46'), -4, .03, -30); box(s, 2, .06, 80, mat(o.walk || '#3e3e46'), 4, .03, -30);
  const signs = [];
  for (let i = 0; i < 12; i++) for (const sx of [-1, 1]) { const z = 2 - i * 6, w = 3.6 + r() * 1.4, h = 6 + r() * 14, x = sx * (7.2 + r() * .8); box(s, w, h, 5, mat(o.night ? ['#2a2c36', '#30323c', '#26282f'][(r() * 3) | 0] : ['#9aa2ae', '#b8bcc4', '#8890a0'][(r() * 3) | 0]), x, h / 2, z);
    for (let k = 0; k < Math.floor(h / 1.2); k++) box(s, .02, .35, w * .8, o.night ? glow(r() < .55 ? '#e8b878' : '#1a1c24', r() < .55 ? .3 : 0) : mat('#5a6a80', { m: .4, r: .2 }), x - sx * 2.51, 1 + k * 1.2, z);
    if (o.night && r() < .6) { const c = ['#ff5a8a', '#5ad0ff', '#ffb43a', '#8aff8a'][(r() * 4) | 0]; signs.push(box(s, .12, 1.0 + r() * .8, .4, glow(c, .9), x - sx * 2.7, 3 + r() * 2, z + 1.5)); } }
  return signs; };
SC[38] = { build() { const S = makeScene({ bg: '#0a0e1c', hemi: .55, exposure: 1.35, sky: '#6a78b0', ground: '#1a1a20', bloom: .25, bloomTh: .88, fov: 38, fog: ['#0a0e1c', 18, 60] }); const s = S.s; sun(s, '#8fa0d8', .5, 4, 14, 8, 20);
  const signs = cityStreet(s, { night: true }); for (let i = 0; i < 4; i++) lamp(s, '#ffd6a0', 3, 12, (i % 2 ? 3 : -3), 3.5, -4 - i * 10, false);
  const ppl = []; const r = rng(4); for (let i = 0; i < 16; i++) { const p = human(s, { top: ['#7a5a8a', '#3a5a8a', '#8a5a4a', '#4a7a6a', '#aa8a4a'][i % 5], bottom: '#22252c', face: false, hairStyle: r() < .5 ? 'long' : 'short' }); const lane = r() < .5 ? -4 : 4; p.position.set(lane + (r() - .5) * 1.2, 0, -2 - r() * 40); const dir = r() < .5 ? 1 : -1; p.rotation.y = dir > 0 ? 0 : Math.PI; ppl.push([p, dir, r() * 3]); }
  return { render() { S.render(); }, update(t, dur) { ppl.forEach(([p, d, ph]) => { p.position.z += d * .018; p.userData.walk(t + ph, 1); }); signs.forEach((g, i) => { g.material.emissiveIntensity = .8 + .3 * Math.sin(t * 3 + i); });
    camMove(S.cam, [0, 2.2, 8], [0, 2.4, 2], [0, 3.2, -30], [0, 3.6, -30], ease(t / dur));
    const items = [['仕事の種類', 4.1], ['出会い', 4.9], ['店やイベント', 5.7]]; return ovSvg(items.map(([w, t0], i) => `<g opacity="${clamp((t - t0) / .4)}">${otxt(560 + i * 400, 210, w, 52, Y)}</g>`).join('')); } }; } };

// 39 若いうちの経験：昼のオフィス街を若者が歩いていく
SC[39] = { build() { const S = makeScene({ bg: '#9fc0e0', hemi: .9, exposure: 1.25, sky: '#d8e6f4', ground: '#6a6458', bloom: .15, bloomTh: .9, fov: 36, fog: ['#b8d0e8', 30, 90] }); const s = S.s; sun(s, '#fff2dc', 2.0, -8, 18, 10, 24);
  cityStreet(s, { night: false, road: '#5a5a60', walk: '#8a8680', seed: 12 });
  const yo = human(s, { top: '#3a8a7a', bottom: '#2a2f3a', face: false }); yo.rotation.y = Math.PI; box(yo, .3, .36, .14, mat('#2a2a2a'), 0, 1.25, -.16);
  return { render() { S.render(); }, update(t, dur) { const z = 1 - t * 1.0; yo.position.set(-3.8, 0, z); yo.userData.walk(t, 1.1);
    const k = ease(t / dur); camMove(S.cam, [-3.0, 1.8, z + 4.2], [-3.2, 2.7, z + 5.4], [-3.8, 1.5, z - 4], [-3.8, 2.6, z - 10], k); return ''; } }; } };

// 45 改札に戻る：夜の駅、人が改札を通っていく
SC[45] = { build() { const S = makeScene({ bg: '#0c0e16', hemi: .75, exposure: 1.3, sky: '#c8d0e0', ground: '#3a3a40', bloom: .35, bloomTh: .8, fov: 34 }); const s = S.s;
  box(s, 16, .05, 12, mat('#8a8680', { r: .5 }), 0, 0, 0); box(s, 16, 4, .2, mat('#3a3e48'), 0, 2, -4); box(s, 16, .1, 12, mat('#2a2c32'), 0, 4, 0);
  for (let i = 0; i < 5; i++) box(s, 2.2, .04, .3, glow('#f4f6ff', 1.4), -4 + i * 2, 3.94, -1);
  box(s, 6, .7, .1, glow('#26313f', .5), 0, 3.2, -3.85);
  for (let i = 0; i < 6; i++) { const x = -3.75 + i * 1.5; box(s, .32, 1.0, 1.6, mat('#d8dce0', { m: .3, r: .4 }), x, .5, 0); box(s, .2, .04, .5, glow('#ffcf6a', 1.6), x, 1.02, .3); box(s, .2, .2, .02, glow(i % 2 ? '#5ad0ff' : '#ff6a8a', 1.4), x, .85, .81); }
  const ppl = []; const r = rng(8); for (let i = 0; i < 7; i++) { const p = human(s, { top: ['#2b3140', '#4a3a34', '#3a8a7a', '#22262e', '#7a5a8a'][i % 5], bottom: '#22252c', face: false }); ppl.push([p, -3.0 + (i % 5) * 1.5, r() * 6, 2.5 + r() * 3]); p.rotation.y = Math.PI; }
  return { render() { S.render(); }, update(t, dur) { ppl.forEach(([p, x, ph, st]) => { const z = 4 - ((t * .9 + ph) % 9); p.position.set(x, 0, z); p.userData.walk(t + ph, 1); });
    camMove(S.cam, [5.5, 2.4, 6.5], [3.5, 2.0, 5.2], [-.5, 1.0, 0], [-.5, 1.0, 0], ease(t / dur)); return ''; } }; } };

// 48 締め：夜のマンションに灯り
SC[48] = { build() { const S = makeScene({ bg: '#0e1834', hemi: .45, exposure: 1.2, sky: '#4a5a8a', ground: '#121216', bloom: .25, bloomTh: .9, fov: 34 }); const s = S.s;
  box(s, 40, .02, 30, mat('#1c1d22'), 0, -.01, 0); const wins = []; const r = rng(11);
  for (const [bx0, bz, nx, ny] of [[-3.2, -2, 6, 9], [3.6, -4, 5, 11], [-8.5, -6, 5, 7]]) { const W = nx * 1.1 + .6, Hh = ny * 1.0 + .6; box(s, W, Hh, 3, mat('#4a4e5c'), bx0, Hh / 2, bz - 1.5);
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const x = bx0 - W / 2 + .85 + i * 1.1, y = .9 + j * 1.0; box(s, .62, .5, .02, mat('#151821'), x, y, bz + .01); const on = box(s, .62, .5, .02, glow(r() < .5 ? '#e8b46a' : '#f0c890', .55), x, y, bz + .02); on.visible = false; box(s, .9, .05, .25, mat('#3a3c44'), x, y - .33, bz + .1); wins.push([on, r()]); } }
  sun(s, '#8aa0d8', .9, -5, 12, 14, 18);
  return { render() { S.render(); }, update(t, dur) { const k = clamp(t / (dur - 1)); wins.forEach(([on, th]) => { on.visible = th < .25 + .5 * k; });
    camMove(S.cam, [-1, 2.0, 24], [-1, 2.6, 21], [-1, 9.0, -3], [-1, 9.4, -3], ease(t / dur));
    const a = clamp((t - .3) / .5), b = clamp((t - 2.0) / .5); return ovSvg(`<g opacity="${a}">${otxt(960, 260, '今日のネタバレは、ここまで', 64)}</g><g opacity="${b}">${otxt(960, 360, 'チャンネル登録・高評価をお願いします', 42, Y, false)}</g>`); } }; } };

// 写真を場面の頭に重ねる
const PH = [[5, 'A2', 0, 2.4, '計算したのは、国土交通省'], [27, 'B2', 0, 4.2, '電車の中で過ごす時間'], [32, 'C2', 0, 3.5, '埼玉（さいたま新都心）'], [34, 'D1', 0, 4.3, '栃木・宇都宮'], [35, 'E1', 0, 4.1, '茨城（筑波山から）']];
for (const [i, n, T0, T1, cap] of PH) { const old = SC[i];
  SC[i] = { kind: 'kami', build() { const b = old.build(); return { render() {}, update(t, dur) { const base = b.update(t, dur);
    const a = Math.min(T0 > 0 ? clamp((t - T0) / .45) : 1, 1 - clamp((t - T1) / .5)); if (a <= 0) return base; const c = clamp((t - T0 - .4) / .5);
    return base + `<div style="position:absolute;left:0;top:0;width:1920px;height:1080px;opacity:${a.toFixed(3)}">` + ovSvg(photoSvg(n, (t - T0) / (T1 - T0 + .5)) + `<rect width="1920" height="320" fill="url(#topg)"/>` + `<g opacity="${c.toFixed(3)}">${otxt(960, 205, cap, 58, Y)}</g>`) + '</div>'; } }; } }; }

export const SCENES = SC;
