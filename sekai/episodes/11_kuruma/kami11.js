// 11 地方は車が1人1台 — 名前を付けた言葉：「免許という住民票」
import { THREE, makeScene, mat, glow, box, cyl, ball, lamp, sun, lerp, rng, camMove } from '/pipeline3d/lib3d.js';
import { human } from '/pipeline3d/sets3d.js';
import { C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, loadMaps, maps, run, kami, donut } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const Y = C.gold, RED = '#e0453a', BLUE = '#9ec8ff', GRN = '#7fc4a0', CX = 960;
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', 'エピローグ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, ...o });
const R = (els, t) => { const rf = els.filter(e => e.ref), ot = els.filter(e => !e.ref); const o = ot.length && ot[0].bg ? [ot[0], ...rf, ...ot.slice(1)] : [...rf, ...ot]; return run(o.map(e => e.f ? e : { ...e, f: () => '' }), t); };
const ref = (s) => ({ at: .6, ref: true, f: () => note(1880, 58, s, 'end') });
const SR_AI = '自動車検査登録情報協会「自家用乗用車の世帯当たり普及台数」（2026年3月末）';
const SR_KK = '総務省「家計調査」二人以上の世帯（2023〜2025年平均）';
const SR_TT = '国土交通省「全国都市交通特性調査」（2021年）';
const IMG = (n) => `/episodes/11_kuruma/img/${n}.jpg`;
const roll = (x, y, a, b, t, t0, dur, o = {}) => { const k = ease(clamp((t - t0) / dur)), v = a + (b - a) * k; const s0 = o.dec ? v.toFixed(o.dec) : Math.round(v).toLocaleString('ja-JP'); return `<g style="font-variant-numeric:tabular-nums">${txt(x, y, (o.pre || '') + s0 + (o.unit || ''), { size: o.size || 96, color: o.color || Y, serif: true, anchor: o.anchor })}</g>`; };
const stampR = (x, y, s0, t, t0, col = RED, size = 56) => { const st = clamp((t - t0) / .25); return t > t0 ? `<g transform="translate(${x},${y}) rotate(-10) scale(${1.6 - .6 * st})" opacity="${st}"><rect x="${-s0.length * size * .55 - 26}" y="-${size}" width="${s0.length * size * 1.1 + 52}" height="${size * 2}" rx="12" fill="rgba(20,18,24,.6)" stroke="${col}" stroke-width="8"/>${txt(0, size * .34, s0, { size, color: col, shadow: false, serif: true })}</g>` : ''; };
// 地図
const J2 = () => maps().japan2;
const pc = (code) => (J2().prefs[code] || J2().prefs[String(code).padStart(2, '0')]).c;
const jmap2 = (v, o = {}) => { const j = J2(), ox = o.ox ?? 760, oy = o.oy ?? 540, z = v[2];
  let g = `<g transform="translate(${ox - v[0] * z},${oy - v[1] * z}) scale(${z})">`;
  for (const [c, pf] of Object.entries(j.prefs)) { const f = (o.fills && (o.fills[c] || o.fills[+c])) || o.base || '#cfc8b8'; g += `<path d="${pf.d}" fill="${f}"/>`; }
  g += `<path d="${j.border}" fill="none" stroke="${o.stroke || '#1b1a20'}" stroke-width="${(1.6 / z).toFixed(3)}" opacity=".7"/></g>`; return g; };
const vp = (v, ox = 760, oy = 540) => (p) => [ox + (p[0] - v[0]) * v[2], oy + (p[1] - v[1]) * v[2]];
const cen = (codes) => { const ps = codes.map(pc); return [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length]; };
// 写真・動画の部品
const OVD = `<defs><filter id="ts2" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity=".7"/></filter><linearGradient id="topg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".65"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>`;
const ovSvg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0">${OVD}${inner}</svg>`;
const otxt = (x, y, s0, size, color = '#fff', serif = true, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${color}" filter="url(#ts2)" font-weight="700" style="font-family:${serif ? "'Noto Serif CJK JP',serif" : "'Noto Sans CJK JP',sans-serif"}">${s0}</text>`;
const photoSvg = (n, k, dark = .3) => { const z = 1 + .07 * ease(k); return `<g transform="translate(960,540) scale(${z.toFixed(4)}) translate(-960,-540)"><image href="${IMG(n)}" x="-40" y="-40" width="2000" height="1160" preserveAspectRatio="xMidYMid slice"/></g><rect width="1920" height="1080" fill="rgba(8,10,18,${dark})"/>`; };
// 実写の上に置く「べた塗り」のカード（緑抜きでにじまないよう、半透明と影は使わない）
const solidCard = (x, y, w, h, inner, col = '#15141a', stroke = null) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${col}"${stroke ? ` stroke="${stroke}" stroke-width="5"` : ''}/>${inner}`;
const stx = (x, y, s0, size, color = '#fff', serif = true, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${color}" font-weight="700" style="font-family:${serif ? "'Noto Serif CJK JP',serif" : "'Noto Sans CJK JP',sans-serif"}">${s0}</text>`;
const SC = [];

// ===== プロローグ =====
// 0 実写（霧の地方道路を走る車）＋ 東京0.4台／福井1.65台
const OV0 = (t) => { let g = '';
  if (t > 3.9) { const k = easeOut(clamp((t - 3.9) / .4)); g += `<g transform="translate(${80 - 40 * (1 - k)},120)" opacity="${k}">` + solidCard(0, 0, 560, 230, stx(280, 70, '東京', 48, '#cfc8bc', false) + stx(280, 190, '0.4台', 110, BLUE)) + '</g>'; }
  if (t > 5.9) { const k = easeOut(clamp((t - 5.9) / .4)); g += `<g transform="translate(${1280 + 40 * (1 - k)},120)" opacity="${k}">` + solidCard(0, 0, 560, 230, stx(280, 70, '福井', 48, '#cfc8bc', false) + stx(280, 190, '1.65台', 110, Y)) + '</g>'; }
  if (t > 1.0) g += solidCard(560, 30, 800, 70, stx(960, 80, '1世帯あたりの車の数', 42, '#fff', false), '#15141a');
  if (t > 9.0) { const s = clamp((t - 9.0) / .25); g += `<g transform="translate(960,560) rotate(-8) scale(${1.6 - .6 * s})">` + `<rect x="-230" y="-80" width="460" height="160" rx="16" fill="#15141a" stroke="${RED}" stroke-width="9"/>` + stx(0, 30, '約4倍', 86, RED) + '</g>'; }
  return g; };

// 2 免許証 → 裏返ると住民票の判子
SC[2] = K((t) => { const flip = clamp((t - 5.1) / .8), sx = Math.abs(Math.cos(flip * Math.PI)), back = flip > .5;
  const lic = `<g transform="translate(960,470) scale(${sx.toFixed(3)},1)">` + (back
    ? `<rect x="-330" y="-200" width="660" height="400" rx="24" fill="#f3ecdc" stroke="#c8b894" stroke-width="5"/>` + txt(0, -110, '住民票', { size: 64, color: '#2a2420', serif: true, shadow: false }) + [0, 1, 2, 3].map(i => `<path d="M-260,${-40 + i * 55} h520" stroke="#c8bca8" stroke-width="3"/>`).join('')
    : `<rect x="-330" y="-200" width="660" height="400" rx="24" fill="#e6efe6" stroke="#7aa888" stroke-width="5"/><rect x="-330" y="-200" width="660" height="70" rx="24" fill="#5a9a6a"/>` + txt(0, -150, '運転免許証', { size: 40, color: '#fff', shadow: false }) + `<rect x="160" y="-100" width="130" height="170" rx="10" fill="#c8d0c8"/><circle cx="225" cy="-40" r="34" fill="#9aa69a"/><path d="M175,60 Q225,0 275,60 Z" fill="#9aa69a"/>` + [0, 1, 2].map(i => `<rect x="-280" y="${-90 + i * 60}" width="${380 - i * 60}" height="22" rx="8" fill="#b8c4b8"/>`).join('')) + '</g>';
  const st = t > 9.2 ? (() => { const s = clamp((t - 9.2) / .25); return `<g transform="translate(1160,600) rotate(-14) scale(${1.8 - .8 * s})" opacity="${s}"><circle r="110" fill="none" stroke="${RED}" stroke-width="10"/><circle r="92" fill="none" stroke="${RED}" stroke-width="4"/>${txt(0, -10, '免許という', { size: 30, color: RED, shadow: false })}${txt(0, 40, '住民票', { size: 46, color: RED, shadow: false, serif: true })}</g>`; })() : '';
  const icons = ['仕事', '買い物', '病院'].map((s0, i) => { if (t < .3 + i * .5 || t > 5.1) return ''; const y = 300 + i * 170, a = clamp((t - .3 - i * .5) / .4), pulse = (t * 1.2 + i * .3) % 1;
    return `<g opacity="${a}"><path d="M1290,${470} L1500,${y}" stroke="${Y}" stroke-width="4" stroke-dasharray="10 8" stroke-dashoffset="${-t * 40}"/><circle cx="${1290 + 210 * pulse}" cy="${470 + (y - 470) * pulse}" r="8" fill="${Y}"/>` + card(1500, y - 60, 240, 120) + txt(1620, y + 16, s0, { size: 44 }) + '</g>'; }).join('');
  return R([{ at: 0, slide: 0, f: () => lic + icons + st }], t); }, 0, { enter: 'fade', zoom: 0 });

// 3 4枚のカード
const FOUR = [['①', '車の数の地図'], ['②', '電車とバスが消えた'], ['③', '車がない人'], ['④', '路面電車の実験']];
SC[3] = K((t) => R([
  { at: 0, f: () => head('地方が車に頼る仕組み', { y: 260, size: 58 }) },
  ...FOUR.map(([n, s0], i) => ({ at: .5 + i * .5, dx: 160, slide: 0, f: () => `<g transform="translate(0,${Math.sin(t * 1.6 + i) * 6})">` + card(170 + i * 400, 430, 360, 280) + txt(350 + i * 400, 530, n, { size: 60, color: Y, serif: true }) + txt(350 + i * 400, 630, s0, { size: i === 1 ? 36 : 42 }) + '</g>' })),
], t), 0, { enter: 'fade', zoom: 0 });

// ===== 第1章 =====
// 4 実写（住宅街を上から）＋ 見出しカード
const OV4 = (t) => { let g = '';
  if (t > .4) g += solidCard(460, 40, 1000, 90, stx(960, 102, '1世帯あたりの車の台数（47都道府県）', 46, '#fff', false));
  if (t > 9.5) g += solidCard(560, 760, 800, 110, stx(960, 830, '最新：2026年3月末', 50, Y));
  return g; };

// 5 北陸・東北の地図：福井→山形→富山（地図がゆっくり寄る）
SC[5] = K((t) => { const c0 = cen([18, 16, 6]); const z = 2.4 + .25 * ease(t / 8); const v = [c0[0], c0[1], z]; const P = vp(v, 860, 560);
  const lit = [[18, .3, '1位 福井', '1.65台', -170, 60], [6, 2.1, '2位 山形', '1.61台', 170, -40], [16, 4.2, '3位 富山', '1.60台', 60, -170]]; const fills = {}; lit.forEach(([c, t0]) => { if (t > t0) fills[c] = Y; });
  let lab = ''; lit.forEach(([c, t0, a, b, ox, oy]) => { if (t < t0 + .2) return; const p = P(pc(c)), k = pop(clamp((t - t0 - .2) / .4)); lab += `<path d="M${p[0]},${p[1]} L${p[0] + ox * k},${p[1] + oy * k}" stroke="${Y}" stroke-width="3"/><g transform="translate(${p[0] + ox},${p[1] + oy + 35}) scale(${k})">` + card(-130, -95, 260, 120, { fill: 'rgba(20,18,26,.85)', stroke: Y }) + txt(0, -45, a, { size: 34 }) + txt(0, 8, b, { size: 42, color: Y, serif: true }) + '</g>'; });
  return R([{ at: 0, slide: 0, bg: true, f: () => jmap2(v, { ox: 860, oy: 560, fills }) + lab }, { at: 4.6, f: () => txt(1640, 860, '雪が多い県が上に並ぶ', { size: 40, color: C.fg }) }, ref(SR_AI)], t); }, 1, { enter: 'fade', zoom: 0 });

// 6 北関東：群馬4位・栃木5位・茨城8位（地図がズームイン）
SC[6] = K((t) => { const c0 = cen([10, 9, 8]); const z = 3.2 + 2.0 * ease(clamp(t / 2.5)); const v = [c0[0], c0[1], z]; const P = vp(v, 860, 560);
  const lit = [[10, 1.0, '4位 群馬', '1.55台', -230, 20], [9, 1.8, '5位 栃木', '1.53台', 0, -200], [8, 2.6, '8位 茨城', '1.50台', 230, 90]]; const fills = { 13: '#5a5662' }; lit.forEach(([c, t0]) => { if (t > t0) fills[c] = c === 9 ? Y : '#e8c070'; });
  let lab = ''; lit.forEach(([c, t0, a, b, ox, oy]) => { if (t < t0 + .2) return; const p = P(pc(c)), k = pop(clamp((t - t0 - .2) / .4)); lab += `<path d="M${p[0]},${p[1]} L${p[0] + ox * k},${p[1] + oy * k}" stroke="#e8c070" stroke-width="3"/><g transform="translate(${p[0] + ox},${p[1] + oy}) scale(${k})">` + card(-120, -60, 240, 120, { fill: 'rgba(20,18,26,.85)', stroke: c === 9 ? Y : '#e8c070' }) + txt(0, -12, a, { size: 32 }) + txt(0, 40, b, { size: 40, color: Y, serif: true }) + '</g>'; });
  return R([{ at: 0, slide: 0, bg: true, f: () => jmap2(v, { ox: 860, oy: 560, fills }) + lab }, { at: 3.4, f: () => `<g transform="translate(1600,180) scale(${pop(clamp((t - 3.4) / .4))})">` + card(-250, -60, 500, 120, { fill: 'rgba(20,18,26,.85)', stroke: Y }) + txt(0, 16, '北関東3県がトップ10', { size: 40, color: Y }) + '</g>' }, ref(SR_AI)], t); }, 1, { enter: 'fade', zoom: 0 });

// 7 首都圏と大阪：0.40台・0.61台・0.66台（薄い色）
SC[7] = K((t) => { const v = [cen([13, 27])[0], cen([13, 27])[1] + 10, 1.55 + .1 * ease(t / 12)]; const P = vp(v, 900, 560);
  const lit = [[13, .4, '47位 東京', '0.40台'], [27, 3.8, '46位 大阪', '0.61台'], [14, 5.0, '45位 神奈川', '0.66台']]; const fills = {}; lit.forEach(([c, t0]) => { if (t > t0) fills[c] = BLUE; });
  let lab = ''; lit.forEach(([c, t0, a, b], i) => { if (t < t0 + .2) return; const p = P(pc(c)), k = pop(clamp((t - t0 - .2) / .4)), dy = i === 2 ? 130 : i === 0 ? -110 : 130, dx = i === 2 ? 120 : i === 1 ? -60 : 0; lab += `<g transform="translate(${p[0] + dx},${p[1] + dy}) scale(${k})">` + card(-130, -60, 260, 120, { fill: 'rgba(20,18,26,.85)', stroke: BLUE }) + txt(0, -12, a, { size: 30 }) + txt(0, 40, b, { size: 40, color: BLUE, serif: true }) + '</g>'; });
  return R([{ at: 0, slide: 0, bg: true, f: () => jmap2(v, { ox: 900, oy: 560, fills, base: '#8a8494' }) + lab }, { at: 7.5, f: () => `<g transform="translate(1560,880)">` + card(-320, -55, 640, 110, { fill: 'rgba(20,18,26,.85)' }) + txt(0, 14, '車を持たない家の方が多い', { size: 40 }) + '</g>' }, ref(SR_AI)], t); }, 1, { enter: 'fade', zoom: 0 });

// 9 実写（給油）→ 家計簿のページ
const OV9 = (t) => solidCard(560, 40, 800, 90, stx(960, 102, '1年に、ガソリンにいくら使う？', 46, '#fff', false));
SC[9] = K((t) => { const rows = [['食費', '…'], ['光熱・水道', '…'], ['ガソリン', '？'], ['…', '']]; let g = card(560, 260, 800, 560, { fill: '#efe8da', stroke: '#c8b894' }) + `<rect x="560" y="260" width="800" height="80" rx="20" fill="#4a7aa0"/>` + txt(960, 315, '家計調査（2人以上の世帯）', { size: 38, color: '#fff', shadow: false });
  rows.forEach(([a, b], i) => { if (t < 3.0 + i * .4) return; const y = 410 + i * 100, hi = i === 2; g += (hi ? `<rect x="590" y="${y - 60}" width="740" height="84" rx="10" fill="rgba(240,200,90,${.35 + .15 * Math.sin(t * 4)})"/>` : '') + txt(620, y, a, { size: 44, color: '#2a2420', anchor: 'start', shadow: false }) + txt(1300, y, b, { size: 44, color: hi ? RED : '#2a2420', anchor: 'end', shadow: false }) + `<path d="M600,${y + 26} h720" stroke="#c8bca8" stroke-width="3"/>`; });
  return R([{ at: 2.8, slide: 0, f: () => g }, ref(SR_KK)], t); }, 1, { enter: 'fade', zoom: 0 });

// 10 横棒ランキング：鳥取 → … 宇都宮（8位）→ … 東京23区（最下位）
const GAS = [['1位 鳥取市', 107406, .2, '#e8c070'], ['8位 宇都宮市', 99142, 3.1, Y], ['52位 東京23区', 21767, 5.7, BLUE]];
SC[10] = K((t) => { let g = ''; GAS.forEach(([l, v, t0, col], i) => { const y = 330 + i * 190 + (i === 2 ? 40 : 0); if (t < t0) return; const k = easeOut(clamp((t - t0) / .9)), w = 1000 * v / 110000 * k;
    g += txt(520, y + 52, l, { size: 40, anchor: 'end', color: col }) + `<rect x="560" y="${y}" width="${w}" height="80" rx="10" fill="${col}"/>` + (k > .3 ? txt(560 + w + 20, y + 58, Math.round(v * k).toLocaleString('ja-JP') + '円', { size: 50, color: col, anchor: 'start', serif: true }) : ''); });
  if (t > 4.5) g += [0, 1, 2].map(i => `<circle cx="${960 + i * 40}" cy="680" r="7" fill="${C.dim}"/>`).join('');
  return R([{ at: 0, f: () => head('ガソリンに使うお金（1年・県庁所在地）', { y: 200 }) }, { at: 0, slide: 0, f: () => g }, ref(SR_KK)], t); }, 1, { enter: 'fade', zoom: 0 });

// 11 ガソリン缶 1 → 4.5
const can = (x, y, k = 1, col = '#d84a3a') => `<g transform="translate(${x},${y})"><clipPath id="cc${x}"><rect x="-70" y="${-100 + 200 * (1 - k)}" width="140" height="${200 * k + 30}"/></clipPath><g clip-path="url(#cc${x})"><rect x="-70" y="-90" width="140" height="190" rx="16" fill="${col}"/><rect x="-30" y="-115" width="40" height="30" rx="6" fill="${col}"/><path d="M-40,-40 L40,40 M40,-40 L-40,40" stroke="rgba(0,0,0,.25)" stroke-width="10"/></g></g>`;
SC[11] = K((t) => { const n = 1 + 3.5 * ease(clamp((t - .6) / 2.8)); let g = can(420, 520, 1, '#5a7ab0') + txt(420, 700, '東京23区', { size: 40, color: BLUE });
  for (let i = 0; i < 5; i++) { const f = clamp(n - i); if (f <= 0) continue; g += can(900 + i * 190, 520, i === 4 ? Math.min(f, .5) / .5 * .5 : f); }
  return R([{ at: 0, slide: 0, f: () => g + txt(1280, 700, '宇都宮市', { size: 40, color: Y }) }, { at: 3.2, f: () => `<g transform="translate(1280,850) scale(${pop(clamp((t - 3.2) / .4))})">` + txt(0, 0, '4.5倍', { size: 90, color: Y, serif: true }) + '</g>' }, ref(SR_KK)], t); }, 1, { enter: 'right', zoom: 0 });

// 12 天びん：東京はバス側、宇都宮は車側に傾く
const scale2 = (x, y, ang, L, R2, colL, colR) => { const dx = Math.cos(ang) * 220, dy = Math.sin(ang) * 220;
  return `<path d="M${x},${y + 260} L${x},${y}" stroke="#a49c90" stroke-width="10"/><path d="M${x - 90},${y + 270} h180" stroke="#a49c90" stroke-width="12"/><path d="M${x - dx},${y - dy} L${x + dx},${y + dy}" stroke="#d8d0c4" stroke-width="10"/>` +
    `<path d="M${x - dx},${y - dy} v80" stroke="#a49c90" stroke-width="3"/><path d="M${x + dx},${y + dy} v80" stroke="#a49c90" stroke-width="3"/>` +
    `<g transform="translate(${x - dx},${y - dy + 100})">${card(-90, -30, 180, 70, { fill: 'rgba(20,18,26,.9)', stroke: colL })}${txt(0, 16, L, { size: 32, color: colL })}</g><g transform="translate(${x + dx},${y + dy + 100})">${card(-90, -30, 180, 70, { fill: 'rgba(20,18,26,.9)', stroke: colR })}${txt(0, 16, R2, { size: 32, color: colR })}</g>`; };
SC[12] = K((t) => { const a1 = -.32 * ease(clamp((t - 2.1) / 1.2)) + .02 * Math.sin(t * 2), a2 = .32 * ease(clamp((t - 5.0) / 1.2)) + .02 * Math.sin(t * 2 + 1);
  return R([
    { at: 0, f: () => head('バス・電車にお金を使うのは？', { y: 200 }) },
    { at: .3, slide: 0, f: () => scale2(520, 420, a1, 'バス代', 'ガソリン', BLUE, Y) + txt(520, 800, '東京23区', { size: 44, color: BLUE }) + (t > 2.1 ? txt(520, 870, 'バス代 年4,300円', { size: 34, color: C.fg }) : '') },
    { at: 3.0, slide: 0, f: () => scale2(1400, 420, a2, 'バス代', 'ガソリン', BLUE, Y) + txt(1400, 800, '宇都宮市', { size: 44, color: Y }) + (t > 5.0 ? txt(1400, 870, 'バス代 年1,700円', { size: 34, color: C.fg }) : '') },
    ref(SR_KK),
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 13 写真（古い車）→ 0.5台 → 1.0台の階段
SC[13] = K((t) => { const steps = [[5.3, '1976年', '2世帯に1台', .5], [8.8, '1996年', '1世帯に1台', 1.0]]; let g = '';
  steps.forEach(([t0, yr, lb, v], i) => { if (t < t0) return; const k = easeOut(clamp((t - t0) / .6)), x = 520 + i * 560, h = 420 * v * k; g += `<rect x="${x}" y="${820 - h}" width="440" height="${h}" rx="10" fill="${i ? Y : '#e8c070'}"/>` + (k > .5 ? txt(x + 220, 820 - h - 90, yr, { size: 44, color: C.fg }) + txt(x + 220, 820 - h - 30, lb, { size: 50, color: i ? Y : '#e8c070', serif: true }) : ''); });
  const cars = Math.floor(clamp((t - 9.6) / 3) * 6); for (let i = 0; i < cars; i++) g += `<g transform="translate(${1640},${780 - i * 60})"><rect x="-60" y="-22" width="120" height="40" rx="12" fill="#9aa6c8"/><circle cx="-34" cy="20" r="11" fill="#333"/><circle cx="34" cy="20" r="11" fill="#333"/></g>`;
  return R([{ at: 4.8, f: () => head('日本の車（1世帯あたり）', { y: 200 }) }, { at: 4.8, slide: 0, f: () => g + `<path d="M480,820 h1080" stroke="${C.gray}" stroke-width="4"/>` }, ref(SR_AI)], t); }, 1, { enter: 'fade', zoom: 0 });

// 14 全国の折れ線：1976 0.5 → 1996 1.0 → 2006 1.11（頂上）→ 2026 1.00
SC[14] = K((t) => { const ax = (y) => 300 + (y - 1976) * 26, ay = (v) => 820 - v * 480; const P = [[1976, .5], [1996, 1.0], [2006, 1.112], [2026, 1.001]];
  const k = clamp((t - .4) / 6); const tot = P.length - 1, pos = k * tot, n = Math.floor(pos), f = pos - n; const pts = P.slice(0, n + 1).map(p => [ax(p[0]), ay(p[1])]); if (n < tot) pts.push([lerp(ax(P[n][0]), ax(P[n + 1][0]), f), lerp(ay(P[n][1]), ay(P[n + 1][1]), f)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
  let g = `<path d="M${ax(1976)},820 h${ax(2026) - ax(1976)}" stroke="${C.gray}" stroke-width="4"/>` + [1976, 1996, 2006, 2026].map(y => txt(ax(y), 870, y + '年', { size: 30, color: C.dim })).join('') + `<path d="${d}" stroke="${Y}" stroke-width="9" fill="none" stroke-linejoin="round"/>`;
  P.forEach((p, i) => { if (k * tot < i) return; g += `<circle cx="${ax(p[0])}" cy="${ay(p[1])}" r="13" fill="${Y}"/>` + txt(ax(p[0]), ay(p[1]) - 30, p[1].toFixed(2) + '台', { size: 36, color: i === 2 ? Y : C.fg }); });
  if (t > 7.9) g += `<g transform="translate(1300,640)">` + card(-330, -70, 660, 210, { fill: 'rgba(20,18,26,.85)', stroke: BLUE }) + txt(0, -8, '減ったのは都会の一人暮らし', { size: 38, color: BLUE }) + txt(0, 70, '地方の車は減っていない', { size: 38 }) + '</g>';
  return R([{ at: 0, f: () => head('全国の平均（1世帯あたり）', { y: 200 }) }, { at: 0, slide: 0, f: () => g }, { at: 3.2, f: () => txt(ax(2026) - 40, ay(1.001) + 70, '13年連続で減少', { size: 34, color: RED, anchor: 'end' }) }, ref(SR_AI)], t); }, 1, { enter: 'fade', zoom: 0 });

// ===== 第2章 =====
// 16 2つの円グラフ：三大都市圏32%／地方都市圏61%
SC[16] = K((t) => { const k1 = ease(clamp((t - 6.0) / 1.5)), k2 = ease(clamp((t - 9.5) / 1.5));
  const pie = (x, v, k, lab, col) => donut(x, 540, 210, [{ v: v * k, c: col }, { v: 100 - v * k, c: '#3a3844' }], 1, { sw: 90 }) + (t < (lab === '地方の都市圏' ? 9.5 : 6.0) ? txt(x, 570, '？', { size: 80, color: col }) : roll(x, 570, 0, v, t, lab === '地方の都市圏' ? 9.5 : 6.0, 1.5, { unit: '%', size: 80, color: col })) + txt(x, 830, lab, { size: 44, color: col });
  return R([
    { at: 0, f: () => head('移動に「車」を使った割合（平日）', { y: 200 }) },
    { at: 1.0, slide: 0, f: () => pie(560, 32, k1, '東京・名古屋・大阪の都市圏', BLUE) },
    { at: 1.6, slide: 0, f: () => pie(1360, 61, k2, '地方の都市圏', Y) },
    { at: 13.6, f: () => stampR(1700, 250, '2回に1回以上', t, 13.6, RED, 46) },
    ref(SR_TT),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 17 10人の移動：6本が車（矢印が流れ続ける）
SC[17] = K((t) => { let g = ''; const kinds = ['車', '車', '車', '車', '車', '車', '電車・バス', '電車・バス', '歩き', '自転車'];
  kinds.forEach((kd, i) => { if (t < .3 + i * .12) return; const y = 300 + i * 56, car = kd === '車', col = car ? Y : '#8a8aa0'; const ph = ((t * (car ? .5 : .3)) + i * .13) % 1;
    g += person(330, y + 18, 18, col) + `<path d="M380,${y} L1500,${y}" stroke="${col}" stroke-width="${car ? 8 : 4}" opacity=".55"/>` + `<circle cx="${380 + 1120 * ph}" cy="${y}" r="${car ? 13 : 9}" fill="${col}"/>` + txt(1540, y + 12, kd, { size: 30, color: col, anchor: 'start' }); });
  return R([{ at: 0, f: () => head('地方の人の移動（10回）', { y: 200 }) }, { at: 0, slide: 0, f: () => g }, { at: 3.7, f: () => txt(960, 900, '歩きと電車を全部足しても、車に届かない', { size: 42, color: Y, serif: true }) }, ref(SR_TT)], t); }, 2, { enter: 'right', zoom: 0 });

// 18 2つの町：家がまとまる町には線路と電車／散らばる町では線が引けない
SC[18] = K((t) => { const r = rng(4); const dense = [], sparse = []; for (let i = 0; i < 26; i++) { dense.push([520 + (r() - .5) * 360, 560 + (r() - .5) * 260]); } for (let i = 0; i < 18; i++) sparse.push([1180 + r() * 600, 330 + r() * 440]);
  const house = (x, y, col) => `<rect x="${x - 14}" y="${y - 10}" width="28" height="22" fill="${col}"/><path d="M${x - 18},${y - 8} L${x},${y - 26} L${x + 18},${y - 8} Z" fill="${col}"/>`;
  const a = clamp((t - .3) / .6), b = clamp((t - 2.2) / .6); const trainX = 220 + ((t * 160) % 640);
  let g = `<g opacity="${a}">` + dense.map(p => house(p[0], p[1], '#e8c070')).join('') + `<path d="M220,560 L860,560" stroke="#d8d0c4" stroke-width="8"/><path d="M220,560 L860,560" stroke="#2a2630" stroke-width="3" stroke-dasharray="14 10"/><rect x="${trainX - 50}" y="538" width="100" height="44" rx="10" fill="${GRN}"/>` + txt(540, 860, '家がまとまる町', { size: 40 }) + '</g>';
  g += `<g opacity="${b}">` + sparse.map(p => house(p[0], p[1], '#c8b8a8')).join('') + (t > 7.2 ? `<path d="M1150,600 L${1150 + 680 * easeOut(clamp((t - 7.2) / 1.5))},600" stroke="${RED}" stroke-width="6" stroke-dasharray="16 12" opacity=".8"/>` + txt(1480, 520, '？', { size: 80, color: RED }) : '') + txt(1480, 920 - 60, '家が散らばる町', { size: 40 }) + '</g>';
  return R([{ at: 0, f: () => head('電車やバスは「まとまり」が要る', { y: 200 }) }, { at: 0, slide: 0, f: () => g }], t); }, 2, { enter: 'fade', zoom: 0 });

// 20 回る矢印：車を買う → バスの客が減る → 本数が減る → また車を買う
const LOOP = ['車を買う', 'バスの客が減る', '本数が減る'];
SC[20] = K((t) => { const cx = 960, cy = 560, r = 250, rot = t * 22; let g = `<g transform="rotate(${rot} ${cx} ${cy})"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${Y}" stroke-width="8" stroke-dasharray="40 26" opacity=".7"/></g>`;
  LOOP.forEach((s0, i) => { const t0 = [0, 2.8, 5.4][i]; if (t < t0) return; const a = -Math.PI / 2 + i * 2 * Math.PI / 3, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, k = pop(clamp((t - t0) / .4)); g += `<g transform="translate(${x},${y}) scale(${k})">` + card(-170, -55, 340, 110, { fill: 'rgba(20,18,26,.92)', stroke: Y }) + txt(0, 14, s0, { size: 40 }) + '</g>'; });
  const pa = rot * Math.PI / 180 * 3; g += `<g transform="translate(${cx + Math.cos(pa) * r},${cy + Math.sin(pa) * r})"><rect x="-34" y="-16" width="68" height="32" rx="10" fill="${RED}"/></g>`;
  return R([{ at: 0, f: () => head('ぐるぐる回り続ける輪', { y: 200 }) }, { at: 0, slide: 0, f: () => g }, { at: 7.5, f: () => txt(cx, cy + 16, 'また車を買う', { size: 44, color: Y, serif: true }) }], t); }, 2, { enter: 'fade', zoom: 0 });

// 21 地球にバス路線の線 → 消えていく。カウンター 0→27,000km
SC[21] = K((t) => { const cx = 700, cy = 560, r = 260, k = ease(clamp((t - 2.5) / 6.5)); const ang = 2 * Math.PI * (27000 / 40000) * k;
  let g = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#1e3a5a"/><g stroke="#3a5a7a" stroke-width="2" fill="none"><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * .35}"/><ellipse cx="${cx}" cy="${cy}" rx="${r * .4}" ry="${r}"/><path d="M${cx - r},${cy} h${2 * r}"/></g>`;
  const a0 = -Math.PI / 2; if (k > 0) { const x1 = cx + Math.cos(a0) * (r + 30), y1 = cy + Math.sin(a0) * (r + 30), x2 = cx + Math.cos(a0 + ang) * (r + 30), y2 = cy + Math.sin(a0 + ang) * (r + 30); g += `<path d="M${x1},${y1} A${r + 30},${r + 30} 0 ${ang > Math.PI ? 1 : 0} 1 ${x2},${y2}" stroke="${RED}" stroke-width="12" fill="none" stroke-dasharray="20 10" stroke-dashoffset="${t * 30}"/>`; }
  return R([
    { at: 0, f: () => head('廃止されたバス路線（2008〜2024年度）', { y: 200 }) },
    { at: 0, slide: 0, f: () => g },
    { at: 2.5, f: () => roll(1420, 520, 0, 27000, t, 2.5, 6.5, { unit: 'km', size: 100, color: RED }) + txt(1420, 380, 'およそ', { size: 40, color: C.dim }) },
    { at: 9.7, f: () => txt(1420, 660, '地球を半周以上', { size: 54, color: Y, serif: true }) },
    ref('国土交通省の集計（2008〜2024年度）'),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 23 バス10台のうち7台に「赤字」の札／関東の市町村10のうち7つが減便・廃止
SC[23] = K((t) => { let g = ''; for (let i = 0; i < 10; i++) { const x = 230 + (i % 5) * 150, y = 400 + Math.floor(i / 5) * 140; if (t < .3 + i * .06) continue; g += `<g transform="translate(${x},${y + Math.sin(t * 3 + i) * 3})"><rect x="-60" y="-34" width="120" height="66" rx="12" fill="#6a9ac8"/><rect x="-48" y="-24" width="96" height="22" rx="4" fill="#cfe0f0"/><circle cx="-32" cy="34" r="12" fill="#333"/><circle cx="32" cy="34" r="12" fill="#333"/></g>`;
    if (i < 7 && t > 2.0 + i * .15) g += `<g transform="translate(${x + 40},${y - 50}) rotate(-12) scale(${pop(clamp((t - 2.0 - i * .15) / .3))})"><rect x="-40" y="-20" width="80" height="40" rx="6" fill="${RED}"/>${txt(0, 12, '赤字', { size: 26, color: '#fff', shadow: false })}</g>`; }
  let h = ''; for (let i = 0; i < 10; i++) { const x = 1180 + (i % 5) * 120, y = 420 + Math.floor(i / 5) * 140; if (t < 5.6) continue; const red = i < 7 && t > 5.8 + i * .12; h += `<g transform="translate(${x},${y})"><rect x="-40" y="-30" width="80" height="60" rx="8" fill="${red ? '#c86a5a' : '#5a5662'}"/><path d="M-46,-26 L0,-60 L46,-26 Z" fill="${red ? '#a84a3a' : '#4a4652'}"/></g>`; }
  return R([
    { at: 0, f: () => txt(530, 270, '路線バスの会社', { size: 42 }) + (t > 2.8 ? txt(530, 760, '7割以上が赤字', { size: 50, color: RED, serif: true }) : '') },
    { at: 0, slide: 0, f: () => g },
    { at: 5.6, slide: 0, f: () => txt(1420, 270, '関東の市町村', { size: 42 }) + h + (t > 7.2 ? txt(1420, 760, '約7割で廃止・大幅減便', { size: 44, color: RED, serif: true }) : '') },
    ref('国土交通省関東運輸局「地域の公共交通を取り巻く環境」'),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 24 実写（路線バスが停留所に来て出ていく）＋ 運転手1万9000人減
const OV24 = (t) => t > 4.3 ? solidCard(460, 760, 1000, 120, stx(960, 840, 'バスの運転手　7年で 1万9000人減', 52, Y)) : '';

// 25 卵とニワトリ → 車とバスに入れ替わる
SC[25] = K((t) => { const sw = ease(clamp((t - 6.5) / 1.0)), rot = t * 30;
  const egg = `<ellipse cx="0" cy="0" rx="90" ry="120" fill="#f3ecdc"/>`, hen = `<circle cx="0" cy="-40" r="60" fill="#e8e0d0"/><ellipse cx="0" cy="50" rx="110" ry="80" fill="#e8e0d0"/><path d="M-10,-110 l10,-24 l10,24 Z" fill="${RED}"/><path d="M58,-40 l30,8 l-30,10 Z" fill="#e8b040"/>`;
  const carI = `<rect x="-120" y="-50" width="240" height="90" rx="22" fill="${Y}"/><rect x="-70" y="-100" width="140" height="60" rx="16" fill="${Y}"/><circle cx="-70" cy="44" r="26" fill="#333"/><circle cx="70" cy="44" r="26" fill="#333"/>`;
  const busI = `<rect x="-140" y="-80" width="280" height="140" rx="20" fill="#6a9ac8"/><rect x="-120" y="-60" width="240" height="44" rx="6" fill="#cfe0f0"/><circle cx="-80" cy="64" r="26" fill="#333"/><circle cx="80" cy="64" r="26" fill="#333"/>`;
  const L = [660, 540], Rr = [1260, 540];
  const arc = `<g transform="rotate(${rot} 960 540)"><path d="M960,330 A210,210 0 0 1 1170,540" stroke="${Y}" stroke-width="8" fill="none"/><path d="M960,750 A210,210 0 0 1 750,540" stroke="${Y}" stroke-width="8" fill="none"/></g>`;
  return R([
    { at: 0, slide: 0, f: () => arc + `<g transform="translate(${L[0]},${L[1]})"><g opacity="${1 - sw}">${egg}</g><g opacity="${sw}">${busI}</g></g><g transform="translate(${Rr[0]},${Rr[1]})"><g opacity="${1 - sw}">${hen}</g><g opacity="${sw}">${carI}</g></g>` },
    { at: 0, f: () => txt(L[0], 800, sw > .5 ? '電車・バスが消える' : '卵', { size: 40 }) + txt(Rr[0], 800, sw > .5 ? '車に乗る' : 'ニワトリ', { size: 40 }) },
    { at: 3.7, f: () => txt(960, 230, '答えは、両方', { size: 60, color: Y, serif: true }) },
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// ===== 3D =====
// 軽自動車（x,z、向き ry、色）
const kei = (p, col, x, z, ry = 0) => { const g = new THREE.Group(); const m = mat(col, { r: .35, m: .2 });
  box(g, .9, .42, 1.6, m, 0, .38, 0); box(g, .84, .4, 1.0, m, 0, .78, -.12); box(g, .8, .3, .02, mat('#22303e', { r: .1 }), 0, .8, .4); box(g, .02, .26, .8, mat('#22303e', { r: .1 }), .43, .8, -.12); box(g, .02, .26, .8, mat('#22303e', { r: .1 }), -.43, .8, -.12);
  for (const [dx, dz] of [[-.42, .52], [.42, .52], [-.42, -.52], [.42, -.52]]) { const w = cyl(g, .16, .16, .1, mat('#222'), dx, .17, dz, 12); w.rotation.z = Math.PI / 2; }
  box(g, .2, .08, .02, glow('#fff4d0', .6), -.3, .45, .81); box(g, .2, .08, .02, glow('#fff4d0', .6), .3, .45, .81);
  g.position.set(x, 0, z); g.rotation.y = ry; p.add(g); return g; };
const house = (p, x, z, s0 = 1, wall = '#e8dcc8', roof = '#6a4a3a', lit = false) => { const g = new THREE.Group(); box(g, 3, 2.2, 2.6, mat(wall, { r: .9 }), 0, 1.1, 0); const r = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.1, 4), mat(roof, { r: .8 })); r.position.y = 2.75; r.rotation.y = Math.PI / 4; r.scale.set(1, 1, .85); g.add(r);
  for (const dx of [-.8, .8]) box(g, .6, .6, .04, lit ? glow('#ffd89a', .8) : mat('#3a4a5a'), dx, 1.4, 1.31); box(g, .5, 1.0, .04, mat('#6a4a3a'), 0, .5, 1.31);
  g.position.set(x, 0, z); g.scale.setScalar(s0); p.add(g); return g; };

// 1 夕方の郊外の家：駐車場に軽自動車が3台。1台が道路から入ってくる
SC[1] = { build() { const S = makeScene({ bg: '#e8a878', hemi: .9, exposure: 1.2, sky: '#ffd0a8', ground: '#5a5a48', bloom: .2, bloomTh: .85, fov: 36, fog: ['#e8b090', 20, 60] }); const s = S.s; sun(s, '#ffc890', 1.8, -10, 6, 8, 30);
  box(s, 60, .02, 40, mat('#6a7a4a', { r: .95 }), 0, -.01, -6); box(s, 60, .03, 3, mat('#3a3a40', { r: .8 }), 0, 0, 4.2);
  for (let i = -14; i <= 14; i++) box(s, .8, .035, .08, mat('#d8d0c0'), i * 2, 0, 4.2);
  box(s, 7, .04, 4, mat('#8a8680', { r: .9 }), 1.2, .01, 1.2);
  house(s, -3.2, -.4, 1, '#efe6d4', '#5a3a2e', true);
  const cars = [kei(s, '#e8e4dc', -.4, 1.1, Math.PI), kei(s, '#c84a3a', .9, 1.1, Math.PI), kei(s, '#4a7aa8', 2.2, 1.1, Math.PI)];
  const mover = kei(s, '#e8c060', 3.5, 4.2, Math.PI / 2);
  for (const [x, z] of [[-12, -8], [9, -9], [14, -6], [-16, -12], [6, -16]]) house(s, x, z, .9, '#e0d6c4', '#4a3a34', true);
  for (const [x, z] of [[-7, 2], [6, -2]]) { cyl(s, .12, .16, 2, mat('#5a4636'), x, 1, z, 6); ball(s, 1.0, mat('#5a7a44'), x, 2.6, z, 1); }
  return { render() { S.render(); }, update(t, dur) {
    // 4台目：道路（z=4.2）を左から来て、x=3.5で曲がって駐車場（z=1.1）へ。物と重ならない通り道
    const k1 = clamp((t - .4) / 2.6), k2 = clamp((t - 3.0) / 1.8);
    if (k2 <= 0) { mover.position.set(lerp(-9, 3.5, easeOut(k1)), 0, 4.2); mover.rotation.y = Math.PI / 2; }
    else { const e = ease(k2); mover.position.set(3.5, 0, lerp(4.2, 1.1, e)); mover.rotation.y = lerp(Math.PI / 2, Math.PI, Math.min(1, e * 1.6)); }
    camMove(S.cam, [1.2, 3.0, 10.5], [1.2, 4.2, 14.5], [0, .9, 1], [0, 1.0, 0], ease(t / dur)); return ''; } }; } };

// 8 2つの駐車場：左は1台分、右は4台が次々に入る
SC[8] = { build() { const S = makeScene({ bg: '#c8d4e4', hemi: 1.0, exposure: 1.2, sky: '#eef2f8', ground: '#8a8680', bloom: .12, bloomTh: .9, fov: 34 }); const s = S.s; sun(s, '#fff4e0', 1.6, -6, 10, 8, 16);
  box(s, 40, .02, 30, mat('#9aa080', { r: .95 }), 0, -.01, -4);
  box(s, 2.0, .04, 2.6, mat('#8a8680'), -4.2, .01, 0); box(s, 3.2, 3.0, 1.6, mat('#d8d4cc', { r: .9 }), -4.2, 1.5, -2.3); for (let i = 0; i < 3; i++) box(s, .6, .5, .04, mat('#3a4a5a'), -5.1 + i * .9, 2.2, -1.48);
  box(s, 5.6, .04, 2.6, mat('#8a8680'), 2.6, .01, 0);
  for (let i = 0; i <= 4; i++) box(s, .05, .045, 2.4, mat('#f0ece4'), .4 + i * 1.1, .015, 0);
  box(s, 5.6, .03, 10, mat('#4a4a50', { r: .85 }), 2.6, .005, -6);
  kei(s, '#9aa6c8', -4.2, 0, Math.PI);
  const C4 = ['#e8e4dc', '#c84a3a', '#4a7aa8', '#e8c060'].map((c, i) => kei(s, c, .95 + i * 1.1, 0, Math.PI));
  return { render() { S.render(); }, update(t, dur) { C4.forEach((c, i) => { const k = ease(clamp((t - .3 - i * .6) / .8)); c.position.z = lerp(-11, 0, k); c.visible = k > 0; });
    camMove(S.cam, [.4, 5.0, 11.0], [.4, 4.6, 10.2], [.4, .3, 0], [.4, .3, 0], ease(t / dur));
    const a = clamp((t - .4) / .4); return ovSvg(`<g opacity="${a}">${otxt(270, 880, '東京', 60, BLUE)}${otxt(1330, 880, '栃木', 60, Y)}</g>`); } }; } };

// 15 第2章：雪の残る地方駅のホーム。電車は来ない
SC[15] = { build() { const S = makeScene({ bg: '#b8c4d4', hemi: 1.0, exposure: 1.15, sky: '#e8eef6', ground: '#9a9a98', bloom: .12, bloomTh: .9, fov: 38, fog: ['#c8d0dc', 12, 40] }); const s = S.s; sun(s, '#f0f4ff', 1.2, 6, 10, 6, 20);
  box(s, 40, .02, 30, mat('#e8eef4', { r: .95 }), 0, -.3, -4);
  box(s, 16, .6, 3, mat('#a8a49c', { r: .9 }), 0, 0, 0); box(s, 16, .02, .3, mat('#e8d060'), 0, .31, -1.2);
  box(s, 16, .02, 2.6, mat('#f4f6f8', { r: .95 }), 0, .32, .2);
  for (const z of [-2.4, -3.4]) box(s, 30, .08, .1, mat('#6a6058', { m: .5 }), 0, -.2, z);
  for (let i = -12; i <= 12; i++) box(s, .2, .06, 1.6, mat('#5a5048'), i * .7, -.26, -2.9);
  const bench = new THREE.Group(); box(bench, 1.6, .06, .4, mat('#7a5233'), 0, .5, 0); box(bench, 1.6, .3, .05, mat('#7a5233'), 0, .8, .18); for (const sx of [-.7, .7]) box(bench, .06, .5, .4, mat('#333'), sx, .25, 0); bench.position.set(-1.5, .3, .6); s.add(bench);
  cyl(s, .06, .06, 2.4, mat('#4a4a50'), 2, 1.5, .4, 8); box(s, .9, .6, .05, mat('#f0f0f0'), 2, 2.4, .43);
  box(s, 8, .12, 3, mat('#5a5a60'), -3, 3.2, .2); for (const x of [-6.5, .5]) cyl(s, .08, .08, 2.9, mat('#5a5a60'), x, 1.75, 1.2, 8);
  for (let i = 0; i < 7; i++) { const x = -14 + i * 4.5; ball(s, 1.3, mat('#f4f6f8', { r: .95 }), x, .4, -9, 1); cyl(s, .15, .2, 2.4, mat('#5a4a3a'), x + 1.5, 1, -10, 6); ball(s, .9, mat('#e8eef0'), x + 1.5, 2.6, -10, 1); }
  return { render() { S.render(); }, update(t, dur) { camMove(S.cam, [3.5, 1.9, 6.5], [2.0, 1.8, 5.5], [-1, .9, -1], [-1.5, .9, -1], ease(t / dur));
    const a = clamp((t - .3) / .5); return ovSvg(`<g opacity="${a}"><rect width="1920" height="360" fill="url(#topg)"/>${otxt(960, 160, '第2章', 34, '#ff8a3d', false)}${otxt(960, 250, 'なぜ電車とバスは消えたのか', 64, Y)}</g>`); } }; } };

// 19 田んぼの中に家がぽつぽつ。道を車が1台走る（上空から回るカメラ）
SC[19] = { build() { const S = makeScene({ bg: '#a8c4e0', hemi: 1.0, exposure: 1.15, sky: '#e8f0f8', ground: '#6a7a4a', bloom: .1, bloomTh: .9, fov: 40, fog: ['#c0d4e4', 30, 90] }); const s = S.s; sun(s, '#fff4e0', 1.6, -10, 14, 6, 40);
  box(s, 120, .02, 120, mat('#7a9a4a', { r: .95 }), 0, -.02, 0);
  for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) box(s, 6.6, .03, 6.6, mat((i + j) % 2 ? '#8aaa52' : '#7a9e4a', { r: .95 }), i * 7, 0, j * 7);
  for (let i = -6; i <= 6; i++) { box(s, .25, .05, 80, mat('#b8a888'), i * 7 + 3.5, .01, 0); box(s, 80, .05, .25, mat('#b8a888'), 0, .01, i * 7 + 3.5); }
  box(s, 120, .06, 2.2, mat('#4a4a50'), 0, .02, 0);
  const r = rng(11); for (let i = 0; i < 14; i++) { let x = (r() - .5) * 70, z = (r() - .5) * 70; if (Math.abs(z) < 4) z += 8; house(s, x, z, .7, '#e8dcc8', ['#5a3a2e', '#3a4a5a', '#6a5a4a'][i % 3]); }
  const car = kei(s, '#e8e4dc', -40, .5, Math.PI / 2); car.scale.setScalar(1.4);
  return { render() { S.render(); }, update(t, dur) { car.position.x = -40 + t * 9; const a = .3 + t / dur * .9; S.cam.position.set(Math.cos(a) * 34, 26, Math.sin(a) * 34); S.cam.lookAt(0, 0, 0); return ''; } }; } };

// 写真を場面の頭に重ねる
const PH = [[13, 'P13', 0, 4.8, '昔は、車は「ぜいたく品」だった']];
for (const [i, n, T0, T1, cap] of PH) { const old = SC[i];
  SC[i] = { kind: 'kami', build() { const b = old.build(); return { render() {}, update(t, dur) { const base = b.update(t, dur);
    const a = Math.min(T0 > 0 ? clamp((t - T0) / .45) : 1, 1 - clamp((t - T1) / .5)); if (a <= 0) return base; const c = clamp((t - T0 - .4) / .5);
    return base + `<div style="position:absolute;left:0;top:0;width:1920px;height:1080px;opacity:${a.toFixed(3)}">` + ovSvg(photoSvg(n, (t - T0) / (T1 - T0 + .5)) + `<rect width="1920" height="320" fill="url(#topg)"/>` + `<g opacity="${c.toFixed(3)}">${otxt(960, 205, cap, 58, Y)}</g>`) + '</div>'; } }; } }; }
// 22 写真だけの場面（廃線）
SC[22] = { kind: 'kami', build() { return { render() {}, update(t, dur) { const fade = Math.min(1, clamp(t / .35), 1 - clamp((t - (dur - .35)) / .35)); const a = clamp((t - 4.7) / .4);
  return `<div style="position:absolute;left:0;top:0;width:1920px;height:1080px;background:#000"><div style="position:absolute;left:0;top:0;width:1920px;height:1080px;opacity:${fade.toFixed(3)}">` + ovSvg(photoSvg('P22', t / dur, .25) + `<rect width="1920" height="360" fill="url(#topg)"/><g opacity="${clamp((t - .4) / .5)}">${otxt(960, 170, '鉄道も 23路線・約720km が廃止', 60, Y)}</g><g opacity="${a}">${otxt(960, 270, '東京から広島の手前まで', 50, '#fff')}</g>`) + '</div></div>'; } }; } };

// 実写動画の場面：緑（#00ff00）で塗り、べた塗りのカードだけ上に置く。あとでffmpegで差し替え
SC[0] = K(() => '', 0, { enter: 'fade', zoom: 0 }); SC[4] = K(() => '', 1, { enter: 'fade', zoom: 0 }); SC[24] = K(() => '', 2, { enter: 'fade', zoom: 0 });
const GV = [[0, 0, 99, OV0], [4, 0, 99, OV4], [9, 0, 2.8, OV9], [24, 0, 99, OV24]];
for (const [i, T0, T1, ov] of GV) { const old = SC[i];
  SC[i] = { kind: 'kami', build() { const b = old.build(); return { render() {}, update(t, dur) { const base = b.update(t, dur);
    return (t >= T0 && t < T1) ? base + '<div style="position:absolute;left:0;top:0;width:1920px;height:944px;background:#00ff00"></div>' + ovSvg(ov(t)) : base; } }; } }; }

export const SCENES = SC;
