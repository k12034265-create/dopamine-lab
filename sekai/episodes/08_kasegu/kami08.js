// 08 稼ぐ妻 — 図解中心。字幕は灰色の帯。名前を付けた言葉：「結婚の割り勘」
import { THREE, makeScene, mat, glow, box, cyl, ball, plane, lamp, sun, canvasTex, person as person3, lerp, rng, camMove } from '/pipeline3d/lib3d.js';
import { room, windowPane, desk, chair as chair3, human } from '/pipeline3d/sets3d.js';
import { maps, C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, bubble, loadMaps, run, kami } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const M = '#4f8fea', F = '#ef7fa8', Y = C.gold, CX = 960;
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', 'エピローグ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, ...o });
const R = (els, t) => { const rf = els.filter(e => e.ref), ot = els.filter(e => !e.ref); const o = ot.length && ot[0].bg ? [ot[0], ...rf, ...ot.slice(1)] : [...rf, ...ot]; return run(o.map(e => e.f ? e : { ...e, f: () => '' }), t); };
const ref = (s) => ({ at: .6, ref: true, f: () => note(1880, 58, s, 'end') });
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

// ===== 共通：折れ線グラフ =====
const YRS = [1992, 1997, 2002, 2010, 2015, 2021, 2025];
const GX0 = 330, GX1 = 1560, GY0 = 860, GY1 = 300;
const gx = (y) => GX0 + (y - 1990) / (2026 - 1990) * (GX1 - GX0), gy = (v) => GY0 - v / 100 * (GY0 - GY1);
const axes = (o = {}) => { let g = `<path d="M${GX0},${GY0} L${GX1},${GY0}" stroke="#6a6470" stroke-width="3"/>`;
  for (const v of [0, 50, 100]) g += `<path d="M${GX0},${gy(v)} L${GX1},${gy(v)}" stroke="#ffffff" stroke-opacity=".07" stroke-width="2"/>` + txt(GX0 - 20, gy(v) + 10, v + '%', { size: 26, color: C.dim, anchor: 'end' });
  for (const y of (o.years || [1992, 2002, 2015, 2025])) g += txt(gx(y), GY0 + 44, y + '年', { size: 26, color: C.dim });
  return g; };
// k: 0..1 で何点目まで描くか（なめらかに伸びる）。labels: 値を点の上に出す
const line = (years, vals, col, k, o = {}) => { const n = years.length, f = k * (n - 1); let d = '', dots = '';
  for (let i = 0; i < n; i++) { if (i > f + 1e-6) { const a = Math.floor(f), r = f - a; if (a < n - 1 && i === a + 1) d += ` L${gx(years[a]) + (gx(years[i]) - gx(years[a])) * r},${gy(vals[a]) + (gy(vals[i]) - gy(vals[a])) * r}`; break; }
    d += (i ? ' L' : 'M') + gx(years[i]) + ',' + gy(vals[i]);
    dots += `<circle cx="${gx(years[i])}" cy="${gy(vals[i])}" r="${o.r || 9}" fill="${col}"/>`;
    if (o.labels && (o.labels === 'all' || o.labels.includes(i))) dots += txt(gx(years[i]), gy(vals[i]) + ((Array.isArray(o.below) ? o.below.includes(i) : o.below) ? 50 : -24), Math.round(vals[i]) + (o.unit ?? ''), { size: o.lsize || 34, color: col }); }
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${o.w || 7}" stroke-linejoin="round" stroke-linecap="round" opacity="${o.op ?? 1}"/>` + dots; };
const MEN_ECO = [26.7, 30.8, 29.5, 38.7, 42.0, 48.2, 55.6], MEN_EDU = [29.8, 23.5, 21.0, 26.4, 30.6, 27.3, 28.2], MEN_JOB = [39.5, 35.8, 37.2, 43.4, 47.4, 46.6, 48.5];
const WOM_ECO = [88.7, 90.9, 91.1, 93.9, 93.3, 91.6, 90.3];
const leg = (x, y, col, s0) => `<rect x="${x}" y="${y - 22}" width="34" height="8" rx="4" fill="${col}"/>` + txt(x + 48, y - 8, s0, { size: 30, color: col, anchor: 'start' });

// 4 別の格子：相手の稼ぎを気にする男性 27→56
SC[4] = K((t) => { const a = easeOut(clamp((t - 5.2) / 1.6)), b = easeOut(clamp((t - 8.6) / 1.6)), lit = 27 * a + 29 * b, y25 = t > 8.4;
  return R([
    { at: 0, f: () => head('結婚するつもりの独身男性　100人', { y: 170 }) },
    { at: .2, f: () => txt(CX - 560, 300, y25 ? '2025年' : '1992年', { size: 72, color: y25 ? Y : C.dim, serif: true }) },
    { at: .2, slide: 0, f: () => grid100(CX - 234, 330, lit, Y, 52, 60, 1.25) },
    { at: 5.2, slide: 0, f: () => counter(CX + 560, 560, lit, Y) + txt(CX + 560, 650, '「相手の女性の', { size: 38 }) + txt(CX + 560, 705, '稼ぎを気にする」', { size: 38 }) + (b > .95 ? txt(CX + 560, 790, '半分を超えた', { size: 34, color: Y }) : '') },
    ref(SR1),
  ], t); }, 0, { enter: 'fade', zoom: 0 });

// 5 天秤：ずるい？ 仕方ない？
SC[5] = K((t) => { const ang = 9 * Math.sin(t * 1.6) * clamp((t - .8) / .6);
  const pan = (x, s0, col) => `<g transform="translate(${x},0)"><path d="M0,0 L-110,190 M0,0 L110,190" stroke="#8a8478" stroke-width="4"/><path d="M-150,190 Q0,260 150,190 Z" fill="#5a5560"/>${txt(0, 170, s0, { size: 56, color: col, serif: true })}</g>`;
  return R([{ at: 0, slide: 0, f: () => `<g transform="translate(${CX},300)"><rect x="-10" y="0" width="20" height="520" fill="#6a6470"/><rect x="-140" y="510" width="280" height="30" rx="10" fill="#6a6470"/><circle r="22" fill="${Y}"/>`
      + `<g transform="rotate(${ang})"><rect x="-460" y="-8" width="920" height="16" rx="8" fill="#8a8478"/>` + `<g transform="translate(0,0)">${'' }</g>`
      + `<g transform="translate(-440,0) rotate(${-ang})">${pan(0, 'ずるい？', '#ff8a7a').replace('translate(0,0)', 'translate(0,0)')}</g><g transform="translate(440,0) rotate(${-ang})">${pan(0, '仕方ない？', '#9fc4ff')}</g></g></g>` }], t); }, 0, { enter: 'fade', zoom: 0 });

// 6 質問用紙と出典カード
SC[6] = K((t) => { const k = easeOut(clamp((t - .2) / .8));
  const q = (y, s0, chk) => txt(60, y, s0, { size: 30, color: '#333', shadow: false, anchor: 'start' }) + [0, 1, 2].map(i => `<rect x="${600 + i * 70}" y="${y - 28}" width="34" height="34" rx="4" fill="none" stroke="#777" stroke-width="3"/>` + (chk === i && t > 3 + y / 200 ? `<path d="M${605 + i * 70},${y - 12} l10,12 l18,-24" stroke="#c43a3a" stroke-width="6" fill="none"/>` : '')).join('');
  const sheet0 = `<g transform="translate(${CX - 700},${220 + (1 - k) * 600}) rotate(-3)"><rect width="820" height="600" rx="8" fill="#f1ece2"/>` + txt(410, 70, '結婚と子どもについての調査', { size: 40, color: '#222', shadow: false, serif: true })
    + q(170, '問1 いずれ結婚するつもりですか', 0) + q(260, '問2 結婚相手の条件（経済力）', 1) + q(350, '問3 結婚相手の条件（家事・育児）', 0) + q(440, '問4 理想の人生は', 2) + q(530, '問5 子どもは何人ほしいですか', 1) + '</g>';
  return R([
    { at: 0, slide: 0, f: () => sheet0 },
    { at: 2.0, f: () => txt(CX + 470, 330, '全国 1000 地区', { size: 50, color: Y }) + txt(CX + 470, 400, '独身の男女と夫婦', { size: 38 }) },
    { at: 7.0, f: () => txt(CX + 470, 520, '5年に1度', { size: 50, color: Y }) },
    { at: 10.0, f: (lt) => `<g transform="translate(${CX + 470},700) scale(${pop(lt / .4)})">` + card(-330, -90, 660, 200, { fill: 'rgba(240,200,90,.12)', stroke: Y }) + txt(0, -20, '第17回 出生動向基本調査', { size: 42, color: Y, serif: true }) + txt(0, 50, '2026年9月 公表', { size: 36 }) + txt(0, 92, '国立社会保障・人口問題研究所', { size: 24, color: C.dim }) + '</g>' },
  ], t); }, 0, { enter: 'fade', zoom: 0 });

// 7 4枚のカード
SC[7] = K((t) => R([
  { at: 0, f: () => head('結婚の割り勘の正体', { y: 220 }) },
  ...[['①', '男が求める条件'], ['②', '消えた席'], ['③', '降りた理由'], ['④', '増えた請求書']].map(([n, s0], i) => ({ at: .5 + i * .6, f: (lt) => `<g transform="translate(${300 + i * 440},560) scale(${pop(lt / .4)})">` + card(-190, -150, 380, 300, { fill: 'rgba(255,255,255,.06)' }) + txt(0, -40, n, { size: 70, color: Y, serif: true }) + txt(0, 60, s0, { size: 40 }) + '</g>' })),
], t), 1, { enter: 'fade', zoom: 0 });

// 8 条件カード（男性→女性）＋3段階
const CONDS = ['人がら', '容姿', '経済力', '職業', '学歴', '家事・育児'];
SC[8] = K((t) => R([
  { at: 0, f: () => head('男性が結婚相手の女性に求める条件', { y: 170 }) },
  ...CONDS.map((c, i) => ({ at: .6 + i * .35, f: (lt) => `<g transform="translate(${CX - 540 + (i % 3) * 540},${380 + Math.floor(i / 3) * 190}) scale(${pop(lt / .4)})">` + card(-220, -70, 440, 140, { fill: c === '経済力' && t > 6 ? 'rgba(240,200,90,.18)' : 'rgba(255,255,255,.06)', stroke: c === '経済力' && t > 6 ? Y : undefined }) + txt(0, 16, c, { size: 48, color: c === '経済力' && t > 6 ? Y : C.fg }) + '</g>' })),
  { at: 9.5, f: () => ['重視する', '考慮する', 'あまり関係ない'].map((s0, i) => `<g transform="translate(${CX - 460 + i * 460},800)">` + card(-190, -50, 380, 100, { fill: ['rgba(240,200,90,.25)', 'rgba(240,200,90,.1)', 'rgba(255,255,255,.04)'][i] }) + txt(0, 14, s0, { size: 40, color: i < 2 ? Y : C.dim }) + '</g>').join('') },
  { at: 5.5, f: () => txt(CX, 260, '18〜34歳・いずれ結婚するつもりの独身者', { size: 30, color: C.dim }) },
  ref(SR1),
], t), 1, { enter: 'fade', zoom: 0 });

// 9 折れ線：男性→女性の経済力 7点
const ECO_T = [1.0, 6.5, 7.6, 8.7, 9.8, 10.9, 12.4];
SC[9] = K((t) => { const n = ECO_T.filter(x => t >= x).length, k = n ? (n - 1 + clamp((t - ECO_T[n - 1]) / .6)) / 6 : 0;
  return R([
    { at: 0, f: () => head('女性の経済力を「重視・考慮する」男性', { y: 170 }) },
    { at: 0, slide: 0, f: () => axes({ years: YRS }) },
    { at: 1.0, slide: 0, f: () => line(YRS, MEN_ECO, M, Math.min(k, 1), { labels: [...Array(n).keys()] }) },
    { at: 13.5, f: (lt) => `<g transform="translate(1720,${gy(55.6) - 20}) scale(${pop(lt / .4)})">${txt(0, 0, 'ほぼ2倍', { size: 52, color: Y, serif: true })}</g>` },
    ref(SR1),
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 10 学歴は横ばい
SC[10] = K((t) => R([
  { at: 0, f: () => head('男性が女性に求める：経済力と学歴', { y: 170 }) },
  { at: 0, slide: 0, f: () => axes({ years: YRS }) + line(YRS, MEN_ECO, M, 1, { labels: [0, 6], below: [0] }) + leg(1600, 330, M, '経済力') },
  { at: .8, slide: 0, f: (lt) => line(YRS, MEN_EDU, '#8a8478', easeOut(lt / 2.2), { labels: easeOut(lt / 2.2) > .99 ? [0, 6] : [], below: [6], lsize: 30 }) + (lt > .5 ? leg(1600, 400, '#a49c90', '学歴') : '') },
  { at: 6.5, f: () => txt(960, 400, '肩書きではなく、稼ぎそのもの', { size: 46, color: Y, serif: true }) },
  ref(SR1),
], t), 1, { enter: 'fade', zoom: 0 });

// 11 職業も上がる
SC[11] = K((t) => R([
  { at: 0, f: () => head('男性が女性に求める：経済力・職業・学歴', { y: 170 }) },
  { at: 0, slide: 0, f: () => axes({ years: YRS }) + line(YRS, MEN_ECO, M, 1, { labels: [6] }) + line(YRS, MEN_EDU, '#8a8478', 1, { op: .6 }) + leg(1600, 330, M, '経済力') + leg(1600, 470, '#a49c90', '学歴') },
  { at: .5, slide: 0, f: (lt) => line(YRS, MEN_JOB, '#7fd1c1', easeOut(lt / 2.4), { labels: easeOut(lt / 2.4) > .99 ? [0, 6] : [], below: [6] }) + (lt > .4 ? leg(1600, 400, '#7fd1c1', '職業') : '') },
  { at: 6.5, f: () => txt(960, 360, 'どんな会社か、より', { size: 40, color: C.dim }) + txt(960, 425, 'どれだけ稼げる仕事か', { size: 46, color: Y, serif: true }) },
  ref(SR1),
], t), 1, { enter: 'fade', zoom: 0 });

// 12 56%を「重視7%＋考慮49%」に割る
SC[12] = K((t) => { const sp = easeOut(clamp((t - 4.0) / 1.2)), W1 = 1100, x0 = CX - W1 / 2, w = (v) => v / 55.6 * W1;
  return R([
    { at: 0, f: () => head('「重視・考慮する」56%の中身（2025年）', { y: 170 }) },
    { at: .3, slide: 0, f: (lt) => { const g = easeOut(lt / 1); return `<rect x="${x0}" y="420" width="${w(6.9) * g}" height="150" fill="${Y}"/><rect x="${x0 + w(6.9) * g + 14 * sp}" y="420" width="${w(48.7) * g}" height="150" fill="${Y}" opacity="${1 - .6 * sp}"/>` + (sp < .1 ? txt(CX, 520, '56%', { size: 80, color: '#1b1a20', shadow: false, serif: true }) : ''); } },
    { at: 4.6, f: () => txt(x0 + w(6.9) / 2, 650, '重視する', { size: 40, color: Y }) + txt(x0 + w(6.9) / 2, 730, '7%', { size: 80, color: Y, serif: true })
        + txt(x0 + w(6.9) + 14 + w(48.7) / 2, 650, '考慮する', { size: 40, color: '#e8dcc0' }) + txt(x0 + w(6.9) + 14 + w(48.7) / 2, 730, '49%', { size: 80, color: '#e8dcc0', serif: true }) },
    { at: 10.2, f: () => txt(CX, 880 - 30, '絶対の条件ではなく「あったほうがいい」', { size: 42, color: C.fg, serif: true }) },
    ref(SR1),
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 13 女性→男性の経済力（ピンク）
SC[13] = K((t) => R([
  { at: 0, f: () => head('相手の経済力を「重視・考慮する」割合', { y: 170 }) },
  { at: 0, slide: 0, f: () => axes({ years: YRS }) + line(YRS, MEN_ECO, M, 1, { labels: [0, 6], below: true, op: .55 }) + leg(1600, 560, M, '男性→女性') },
  { at: 1.5, slide: 0, f: (lt) => line(YRS, WOM_ECO, F, easeOut(lt / 3), { labels: easeOut(lt / 3) > .99 ? [0, 6] : [] }) + (lt > .4 ? leg(1600, 260, F, '女性→男性') : '') },
  ref(SR1),
], t), 1, { enter: 'fade', zoom: 0 });

// 14 差が62→35ポイントに縮む／変わったのは男性
const gapBr = (x, a, b, s0, col) => `<path d="M${x},${gy(a)} L${x + 20},${gy(a)} L${x + 20},${gy(b)} L${x},${gy(b)}" fill="none" stroke="${col}" stroke-width="4"/>` + txt(x + 40, (gy(a) + gy(b)) / 2 + 14, s0, { size: 36, color: col, anchor: 'start' });
SC[14] = K((t) => R([
  { at: 0, f: () => head('相手の経済力を「重視・考慮する」割合', { y: 170 }) },
  { at: 0, slide: 0, f: () => axes({ years: YRS }) + line(YRS, WOM_ECO, F, 1, { op: .8 }) + line(YRS, MEN_ECO, M, 1) },
  { at: .6, f: () => gapBr(gx(1992) - 70, 88.7, 26.7, '', '#e8dcc0') + txt(gx(1992) + 70, gy(57), '差 62', { size: 40, color: '#e8dcc0', anchor: 'start' }) },
  { at: 2.0, f: () => gapBr(gx(2025) + 20, 90.3, 55.6, '差 35', Y) },
  { at: 4.6, f: (lt) => `<g transform="translate(${CX - 80},${gy(70)}) scale(${pop(lt / .4)})">${txt(0, 0, '変わったのは、男性の方', { size: 54, color: Y, serif: true })}</g>` },
  ref(SR1),
], t), 1, { enter: 'fade', zoom: 0 });

// ===== 第2章用：年の範囲が違う折れ線 =====
const mkChart = (y0, y1, X0 = 330, X1 = 1560, Y0 = 860, Y1 = 300, vmax = 100) => { const fx = (y) => X0 + (y - y0) / (y1 - y0) * (X1 - X0), fy = (v) => Y0 - v / vmax * (Y0 - Y1);
  const ax = (years, unit = '%', ticks = [0, 50, 100]) => { let g = `<path d="M${X0},${Y0} L${X1},${Y0}" stroke="#6a6470" stroke-width="3"/>`;
    for (const v of ticks) g += `<path d="M${X0},${fy(v)} L${X1},${fy(v)}" stroke="#fff" stroke-opacity=".07" stroke-width="2"/>` + txt(X0 - 20, fy(v) + 10, v + unit, { size: 26, color: C.dim, anchor: 'end' });
    for (const y of years) g += txt(fx(y), Y0 + 44, y + '年', { size: 26, color: C.dim }); return g; };
  const ln = (years, vals, col, k, o = {}) => { const n = years.length, f = clamp(k) * (n - 1); let d = '', dots = '';
    for (let i = 0; i < n; i++) { if (i > f + 1e-6) { const a = Math.floor(f), r = f - a; if (i === a + 1) d += ` L${fx(years[a]) + (fx(years[i]) - fx(years[a])) * r},${fy(vals[a]) + (fy(vals[i]) - fy(vals[a])) * r}`; break; }
      d += (i ? ' L' : 'M') + fx(years[i]) + ',' + fy(vals[i]); if (!o.nodots) dots += `<circle cx="${fx(years[i])}" cy="${fy(vals[i])}" r="${o.r || 8}" fill="${col}"/>`;
      if (o.labels && o.labels.includes(i)) dots += txt(fx(years[i]) + (o.dx || 0), fy(vals[i]) + (o.below ? 48 : -22), Math.round(vals[i]) + (o.unit ?? ''), { size: o.lsize || 34, color: col }); }
    return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${o.w || 7}" stroke-linejoin="round" stroke-linecap="round" opacity="${o.op ?? 1}"/>` + dots; };
  return { fx, fy, ax, ln }; };
const CY = [1987, 1992, 1997, 2002, 2005, 2010, 2015, 2021, 2025];
const M_SEN = [37.9, 30.4, 20.7, 18.1, 12.5, 10.9, 10.1, 6.8, 4.2], M_SAI = [38.3, 44.2, 43.4, 46.8, 38.7, 39.1, 37.4, 29.0, 23.1], M_RYO = [10.5, 10.8, 17.0, 18.7, 28.2, 32.7, 33.9, 39.4, 39.2];
const W_SEN = [33.6, 32.5, 20.6, 18.5, 18.9, 19.7, 18.2, 13.8, 10.2];
const COL_SEN = '#c98a6a', COL_SAI = '#9fc4ff', COL_RYO = Y;
const wallet = (x, y, s, col = '#b8874a') => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-46" y="-30" width="92" height="60" rx="10" fill="${col}"/><rect x="10" y="-12" width="40" height="24" rx="6" fill="#8a6234"/><circle cx="34" cy="0" r="5" fill="${Y}"/></g>`;

// 15 2人が向かい合い、相手の財布をのぞく
SC[15] = K((t) => { const lk = clamp((t - 1.0) / .8), rk = clamp((t - 4.0) / .8);
  return R([
    { at: 0, slide: 0, f: () => person(CX - 380, 640, 120, M) + person(CX + 380, 640, 120, F, 'f') + wallet(CX - 300, 700, 1.1) + wallet(CX + 300, 700, 1.1) },
    { at: 1.0, slide: 0, f: () => `<path d="M${CX + 330},470 Q${CX},380 ${CX - 270},${660}" fill="none" stroke="${F}" stroke-width="5" stroke-dasharray="14 12" opacity="${lk}"/>` + `<circle cx="${CX - 300}" cy="700" r="${80}" fill="none" stroke="${F}" stroke-width="5" opacity="${lk}"/>` },
    { at: 4.0, slide: 0, f: () => `<path d="M${CX - 330},470 Q${CX},360 ${CX + 270},${660}" fill="none" stroke="${M}" stroke-width="5" stroke-dasharray="14 12" opacity="${rk}"/>` + `<circle cx="${CX + 300}" cy="700" r="${80}" fill="none" stroke="${M}" stroke-width="5" opacity="${rk}"/>` + txt(CX - 470, 430, '追いついた', { size: 36, color: M, anchor: 'end' }) },
    { at: 1.4, f: () => txt(CX + 470, 430, '昔から', { size: 36, color: F, anchor: 'start' }) },
    { at: 7.0, f: () => txt(CX, 250, '結婚の割り勘　1つ目の顔', { size: 52, color: Y, serif: true }) + txt(CX, 320, 'お互いの財布をのぞく', { size: 40 }) },
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 16 人生の道が5本
const ROADS = ['専業主婦', '再就職', '両立', 'DINKs', '結婚せず働く'];
SC[16] = K((t) => R([
  { at: 0, f: () => head('男性が「結婚相手の女性」に望む人生', { y: 170 }) },
  { at: .3, slide: 0, f: () => person(360, 640, 90, F, 'f') },
  ...ROADS.map((r, i) => ({ at: .8 + i * .45, slide: 0, f: (lt) => { const y = 330 + i * 125, k = easeOut(lt / .6); return `<path d="M460,600 C700,600 700,${y} ${460 + 620 * k},${y}" fill="none" stroke="${i === 2 ? Y : '#8a8478'}" stroke-width="10" stroke-linecap="round" opacity=".8"/>` + (k > .9 ? txt(1120, y + 14, r, { size: 44, color: i === 2 ? Y : C.fg, anchor: 'start' }) : ''); } })),
  ref(SR1),
], t), 2, { enter: 'fade', zoom: 0 });

// 17 3つの道の絵（働く＝金／家＝灰）
const lifeBar = (y, segs, k) => { let x = 520, g = ''; const W1 = 1100;
  for (const [w, col] of segs) { const ww = W1 * w * clamp(k * 1.2 - (x - 520) / W1); if (ww > 0) g += `<rect x="${x}" y="${y - 30}" width="${ww}" height="60" rx="8" fill="${col}"/>`; x += W1 * w; }
  return g; };
const WORK = Y, HOME = '#6a6470';
SC[17] = K((t) => R([
  { at: 0, f: () => head('3つの人生', { y: 170 }) + `<g opacity=".8">${txt(520, 280, '就職', { size: 28, color: C.dim, anchor: 'start' })}${txt(860, 280, '結婚・出産', { size: 28, color: C.dim })}${txt(1620, 280, '老後', { size: 28, color: C.dim, anchor: 'end' })}</g>` + `<rect x="1300" y="910" width="30" height="20" fill="${WORK}"/>` + txt(1340, 928, '働く', { size: 28, anchor: 'start' }) + `<rect x="1440" y="910" width="30" height="20" fill="${HOME}"/>` + txt(1480, 928, '家庭', { size: 28, anchor: 'start' }) },
  { at: 1.5, slide: 0, f: (lt) => txt(470, 410, '専業主婦', { size: 44, color: COL_SEN, anchor: 'end' }) + lifeBar(400, [[.3, WORK], [.7, HOME]], easeOut(lt / 1.4)) },
  { at: 5.2, slide: 0, f: (lt) => txt(470, 580, '再就職', { size: 44, color: COL_SAI, anchor: 'end' }) + lifeBar(570, [[.3, WORK], [.2, HOME], [.5, WORK]], easeOut(lt / 1.4)) },
  { at: 9.8, slide: 0, f: (lt) => txt(470, 750, '両立', { size: 44, color: COL_RYO, anchor: 'end' }) + lifeBar(740, [[1, WORK]], easeOut(lt / 1.4)) },
], t), 2, { enter: 'fade', zoom: 0 });

// 18 1987年：3本の棒
SC[18] = K((t) => { const B = [['専業主婦', 37.9, COL_SEN, 1.5], ['再就職', 38.3, COL_SAI, 3.4], ['両立', 10.5, COL_RYO, 6.0]];
  return R([
    { at: 0, f: () => head('男性が相手に望む人生（1987年）', { y: 170 }) },
    { at: 0, slide: 0, f: () => `<path d="M460,820 L1460,820" stroke="#6a6470" stroke-width="3"/>` + B.map(([n, v, col, t0], i) => { const k = easeOut(clamp((t - t0) / .8)), x = 620 + i * 340, h = v * 11 * k;
        return `<rect x="${x - 90}" y="${820 - h}" width="180" height="${h}" rx="8" fill="${col}"/>` + txt(x, 870, n, { size: 40, color: col }) + (k > .05 ? txt(x, 800 - h, Math.round(v * k) + '%', { size: 56, color: col, serif: true }) : ''); }).join('') },
    ref(SR1),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 19 3本の線が動き、両立が上に抜ける
const CH2 = mkChart(1985, 2027, 330, 1560, 860, 300, 50);
SC[19] = K((t) => { const k = easeOut(clamp((t - .3) / 5.5));
  return R([
    { at: 0, f: () => head('男性が相手に望む人生', { y: 170 }) },
    { at: 0, slide: 0, f: () => CH2.ax([1987, 1997, 2005, 2015, 2025], '%', [0, 25, 50]) },
    { at: 0, slide: 0, f: () => CH2.ln(CY, M_SEN, COL_SEN, k, { labels: k > .99 ? [0, 8] : [0], below: true }) + CH2.ln(CY, M_SAI, COL_SAI, k, { labels: k > .99 ? [0, 8] : [] }) + CH2.ln(CY, M_RYO, COL_RYO, k, { labels: k > .99 ? [0, 8] : [0], below: true, w: 9 }) },
    { at: 0, f: () => leg(1600, 330, COL_RYO, '両立') + leg(1600, 390, COL_SAI, '再就職') + leg(1600, 450, COL_SEN, '専業主婦') },
    { at: 7.0, f: (lt) => `<g transform="translate(${CH2.fx(2025) - 40},${CH2.fy(39.2) - 80}) scale(${pop(lt / .4)})">${txt(0, 0, '1位', { size: 52, color: Y, serif: true })}</g>` },
    ref(SR1),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 20 女性の理想：専業主婦 34→10
SC[20] = K((t) => { const k = easeOut(clamp((t - .5) / 4));
  return R([
    { at: 0, f: () => head('女性が「理想」とする人生：専業主婦', { y: 170 }) },
    { at: 0, slide: 0, f: () => CH2.ax([1987, 1997, 2005, 2015, 2025], '%', [0, 25, 50]) + CH2.ln(CY, M_SEN, COL_SEN, 1, { op: .35, nodots: true }) + txt(CH2.fx(2025) + 30, CH2.fy(4.2) + 10, '男性の希望', { size: 26, color: COL_SEN, anchor: 'start' }) },
    { at: 0, slide: 0, f: () => CH2.ln(CY, W_SEN, F, k, { labels: k > .99 ? [0, 8] : [0] }) },
    ref(SR1),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 21 教室の40席：1席だけ光る（実際になりそうな人生＝専業主婦 2.6%）
SC[21] = K((t) => { let g = ''; const lit = t > 6.5 ? 1 : 0;
  for (let i = 0; i < 40; i++) { const c = i % 8, r = Math.floor(i / 8), x = CX - 520 + c * 150, y = 360 + r * 105, on = lit && i === 19;
    g += `<rect x="${x - 50}" y="${y - 14}" width="100" height="44" rx="6" fill="${on ? Y : '#4a4752'}"/>` + `<circle cx="${x}" cy="${y - 34}" r="16" fill="${on ? F : '#5f5b66'}"/>`; }
  return R([
    { at: 0, f: () => head('女性が「実際になりそう」と思う人生：専業主婦', { y: 170 }) },
    { at: .3, slide: 0, f: () => g + `<rect x="${CX - 400}" y="250" width="800" height="16" rx="8" fill="#2f4a3a"/>` },
    { at: 3.4, f: () => txt(CX + 720, 560, '3%', { size: 110, color: Y, serif: true }) },
    { at: 6.5, f: () => txt(CX + 720, 660, '40人に1人', { size: 46, color: Y }) },
    ref(SR1),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 22 専業主婦世帯と共働き世帯（1980〜2024）
const HY = [1980, 1985, 1990, 1992, 1995, 1997, 2000, 2005, 2010, 2015, 2020, 2024];
const H_SEN = [1114, 952, 897, 903, 955, 921, 916, 863, 797, 692, 574, 508], H_TOM = [614, 722, 823, 914, 908, 949, 942, 988, 1012, 1120, 1247, 1300];
const CH3 = mkChart(1978, 2026, 330, 1560, 860, 300, 1400);
SC[22] = K((t) => { const k = easeOut(clamp((t - 1.0) / 9));
  return R([
    { at: 0, f: () => head('専業主婦の世帯と、共働きの世帯（万世帯）', { y: 170 }) },
    { at: 0, slide: 0, f: () => CH3.ax([1980, 1990, 2000, 2010, 2024], '', [0, 500, 1000]) },
    { at: 0, slide: 0, f: () => CH3.ln(HY, H_SEN, COL_SEN, k, { labels: k > .99 ? [0, 11] : [0], below: false, r: 6 }) + CH3.ln(HY, H_TOM, Y, k, { labels: k > .99 ? [0, 11] : [0], below: true, r: 6 }) },
    { at: .5, f: () => leg(1600, 330, Y, '共働き') + leg(1600, 390, COL_SEN, '専業主婦') },
    { at: 11.5, f: () => `<rect x="${CH3.fx(1992) - 10}" y="300" width="${CH3.fx(1998) - CH3.fx(1992) + 20}" height="560" fill="#fff" opacity=".06"/>` + txt((CH3.fx(1992) + CH3.fx(1998)) / 2, 340, '1990年代に逆転', { size: 34, color: '#e8dcc0' }) },
    { at: .6, ref: true, f: () => note(1880, 58, '労働政策研究・研修機構（総務省 労働力調査）', 'end') },
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 23 椅子2つ：財布が片方→両方
const chair = (x, y, col) => `<g transform="translate(${x},${y})"><rect x="-70" y="-160" width="20" height="200" rx="6" fill="${col}"/><rect x="-70" y="-10" width="150" height="24" rx="6" fill="${col}"/><rect x="60" y="0" width="16" height="110" fill="${col}"/><rect x="-66" y="0" width="16" height="110" fill="${col}"/></g>`;
SC[23] = K((t) => { const k = easeOut(clamp((t - 3.2) / .8));
  return R([
    { at: 0, slide: 0, f: () => chair(CX - 260, 640, '#8a8478') + chair(CX + 260, 640, '#8a8478') + txt(CX - 260, 800, '夫', { size: 40, color: M }) + txt(CX + 260, 800, '妻', { size: 40, color: F }) },
    { at: .3, slide: 0, f: () => wallet(CX - 250, 600, 1.2) },
    { at: 3.2, slide: 0, f: () => `<g transform="translate(0,${(1 - k) * -200})" opacity="${k}">${wallet(CX + 270, 600, 1.2)}</g>` },
    { at: 3.6, f: () => txt(CX, 260, '誰が、稼ぎを持って座るか', { size: 50, color: Y, serif: true }) },
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 24 章タイトル：男が養う側を降りた理由
SC[24] = K((t) => R([
  { at: 0, f: () => txt(CX, 420, '第3章', { size: 40, color: C.dim }) },
  { at: .2, f: (lt) => `<g transform="translate(${CX},560) scale(${pop(lt / .5)})">${txt(0, 0, 'なぜ男は、養う側を降りたのか', { size: 70, color: Y, serif: true })}</g>` },
], t), 3, { enter: 'fade', zoom: 0 });

// 25 給料：1997の山→長い谷→2024でやっと越える（確認できた年だけ点で結ぶ）
const WG = [[1997, 467], [2009, 406], [2023, 460], [2024, 478]];
SC[25] = K((t) => { const X0 = 360, X1 = 1560, Y0 = 840, Y1 = 320, fx = (y) => X0 + (y - 1994) / (2027 - 1994) * (X1 - X0), fy = (v) => Y0 - (v - 350) / 150 * (Y0 - Y1);
  const T = [2.0, 7.0, 11.0, 12.5], n = T.filter(x => t >= x).length;
  let d = '', g = '';
  for (let i = 0; i < n; i++) { const [y, v] = WG[i], k = i ? easeOut(clamp((t - T[i]) / 1.2)) : 1, px = i ? fx(WG[i - 1][0]) + (fx(y) - fx(WG[i - 1][0])) * k : fx(y), py = i ? fy(WG[i - 1][1]) + (fy(v) - fy(WG[i - 1][1])) * k : fy(v);
    d += (i ? ' L' : 'M') + px + ',' + py; if (k > .98) g += `<circle cx="${fx(y)}" cy="${fy(v)}" r="10" fill="${Y}"/>` + txt(fx(y) + (i === 2 ? 20 : 0), fy(v) + (i === 1 || i === 2 ? 56 : -26), v + '万円', { size: 36, color: i === 3 ? Y : C.fg, anchor: i === 2 ? 'start' : 'middle' }) + (y === 2023 ? '' : txt(fx(y), Y0 + 44, y + '年', { size: 26, color: C.dim })); }
  return R([
    { at: 0, f: () => head('会社員の平均の給料（1年間）', { y: 170 }) },
    { at: 0, slide: 0, f: () => `<path d="M${X0},${Y0} L${X1},${Y0}" stroke="#6a6470" stroke-width="3"/>` + `<path d="${d}" fill="none" stroke="${Y}" stroke-width="7" stroke-linejoin="round"/>` + g },
    { at: 4.0, slide: 0, f: () => `<path d="M${fx(1997)},${fy(467)} L${X1},${fy(467)}" stroke="#e8dcc0" stroke-width="3" stroke-dasharray="12 10" opacity=".6"/>` + txt(X1 + 10, fy(467) + 10, '1997年の山', { size: 28, color: '#e8dcc0', anchor: 'start' }) },
    { at: 13.5, f: (lt) => `<g transform="translate(${fx(2011)},${fy(475)}) scale(${pop(lt / .4)})">${txt(0, 0, '27年かかって、やっと', { size: 50, color: Y, serif: true })}</g>` },
    { at: 15.5, f: () => note(X1, 260, '※途中の年は代表的な年だけを結んでいます', 'end') },
    { at: .6, ref: true, f: () => note(1880, 58, '国税庁 民間給与実態統計調査', 'end') },
  ], t); }, 3, { enter: 'fade', zoom: 0 });

// 26 階段を上る親の世代／平らな道を歩く子の世代
SC[26] = K((t) => { const k1 = clamp((t - .3) / 5), k2 = clamp((t - 6.5) / 5); let st = '';
  for (let i = 0; i < 6; i++) st += `<rect x="${200 + i * 110}" y="${560 - i * 50}" width="110" height="${300 + i * 50}" fill="#4a4752"/>`;
  const si = Math.min(5, Math.floor(k1 * 6)), px = 255 + si * 110, py = 560 - si * 50;
  return R([
    { at: 0, slide: 0, f: () => st + txt(530, 920 - 40, '親の世代', { size: 40, color: C.fg }) + person(px, py - 117, 90, M) + (k1 > .3 ? txt(560, 760, '給料が毎年上がる', { size: 38, color: Y }) : '') },
    { at: 6.2, slide: 0, f: () => `<rect x="1080" y="560" width="680" height="300" fill="#4a4752"/>` + txt(1420, 920 - 40, '今の20代・30代', { size: 40, color: C.fg }) + person(1140 + 560 * k2, 560 - 117, 90, M) + (k2 > .2 ? txt(1420, 660, '平らなまま', { size: 34, color: C.dim }) : '') },
  ], t); }, 3, { enter: 'fade', zoom: 0 });

// 27 結婚の障害：①結婚資金 ②住む家
SC[27] = K((t) => R([
  { at: 0, f: () => head('1年以内に結婚するとしたら、障害になるもの', { y: 170 }) },
  { at: 2.0, out: 6.1, f: () => card(CX - 420, 340, 840, 160) + txt(CX - 330, 442, '1位', { size: 48, color: C.dim, serif: true }) + txt(CX + 40, 442, '？', { size: 64, color: C.dim, serif: true }) + card(CX - 420, 570, 840, 140) + txt(CX - 330, 658, '2位', { size: 44, color: C.dim, serif: true }) + txt(CX + 40, 658, '？', { size: 56, color: C.dim, serif: true }) },
  { at: 6.5, f: (lt) => `<g transform="translate(${CX},420) scale(${pop(lt / .4)})">` + card(-420, -80, 840, 160, { fill: 'rgba(240,200,90,.16)', stroke: Y }) + txt(-330, 22, '1位', { size: 48, color: Y, serif: true }) + txt(40, 22, '結婚資金', { size: 64, color: Y, serif: true }) + '</g>' },
  { at: 8.8, f: (lt) => `<g transform="translate(${CX},640) scale(${pop(lt / .4)})">` + card(-420, -70, 840, 140) + txt(-330, 18, '2位', { size: 44, color: C.fg, serif: true }) + txt(40, 18, '住む家', { size: 56, color: C.fg, serif: true }) + '</g>' },
  { at: 6.8, f: () => txt(CX, 830 - 20, '男女とも同じ順位', { size: 34, color: C.dim }) },
  ref(SR1),
], t), 3, { enter: 'fade', zoom: 0 });

// 28 1人で背負う大きな荷物 → 2人で持つ
SC[28] = K((t) => { const k = easeOut(clamp((t - 5.5) / 1.2)), wob = (1 - k) * 6 * Math.sin(t * 6);
  return R([
    { at: 0, slide: 0, f: () => `<g transform="translate(${CX - 140 + 140 * k},${400 + wob})">` + `<rect x="-200" y="0" width="${400 + 0}" height="230" rx="16" fill="#8a6a3a"/>` + txt(0, 130, '2人の暮らし', { size: 48, color: '#f1ece2', shadow: false, serif: true }) + '</g>' + person(CX - 140 + 40 * k, 760, 110, M) },
    { at: 5.2, slide: 0, f: (lt) => person(CX + 260 - 60 * k, 760, 104, F, 'f') },
    { at: 1.0, f: () => txt(CX - 560, 560, '1人で背負う', { size: 40, color: C.dim }) },
    { at: 6.4, f: () => txt(CX + 600, 560, '2人で持つ', { size: 44, color: Y }) },
  ], t); }, 3, { enter: 'fade', zoom: 0 });

// 29 「いい話？」→ もう1枚の請求書
SC[29] = K((t) => R([
  { at: .3, f: () => bubble(CX - 200, 330, 620, 140, '女性にとって、いい話？', { size: 52 }) },
  { at: 6.0, f: () => txt(CX - 200, 560, '……半分は、その通り', { size: 48, color: C.fg }) },
  { at: 9.6, slide: 0, f: (lt) => { const k = easeOut(lt / .9); return `<g transform="translate(${CX + 380 + (1 - k) * 700},380) rotate(6)"><rect width="420" height="520" rx="8" fill="#f1ece2"/>` + txt(210, 80, '請求書', { size: 52, color: '#222', shadow: false, serif: true }) + [0, 1, 2, 3].map(i => `<rect x="50" y="${150 + i * 70}" width="${320 - (i % 2) * 80}" height="18" rx="9" fill="#cfc8b8"/>`).join('') + '</g>'; } },
  { at: 11.5, f: () => txt(CX + 590, 980 - 70, 'もう1枚', { size: 40, color: Y }) },
], t), 3, { enter: 'fade', zoom: 0 });

// 30 条件カード「家事・育児」が光る（女性→男性）
SC[30] = K((t) => R([
  { at: 0, f: () => head('女性が結婚相手の男性に求める条件', { y: 170 }) },
  ...CONDS.map((c, i) => ({ at: .3 + i * .2, f: (lt) => { const on = c === '家事・育児' && t > 3.6; return `<g transform="translate(${CX - 540 + (i % 3) * 540},${430 + Math.floor(i / 3) * 190}) scale(${on ? 1.12 : pop(lt / .4)})">` + card(-220, -70, 440, 140, { fill: on ? 'rgba(239,127,168,.22)' : 'rgba(255,255,255,.06)', stroke: on ? F : undefined }) + txt(0, 16, c, { size: 48, color: on ? F : C.fg }) + '</g>'; } })),
  { at: 4.0, f: () => txt(CX + 540, 860 - 20, 'この30年でいちばん伸びた', { size: 34, color: F }) },
  ref(SR1),
], t), 4, { enter: 'fade', zoom: 0 });

// 31 「強く重視する」女性 44%→68%、3人に2人
SC[31] = K((t) => { const B = [[1997, 43.6, .8], [2025, 68.4, 4.6]];
  return R([
    { at: 0, f: () => head('相手の家事・育児を「強く重視する」女性', { y: 170 }) },
    { at: 0, slide: 0, f: () => `<path d="M420,820 L1120,820" stroke="#6a6470" stroke-width="3"/>` + B.map(([y, v, t0], i) => { const k = easeOut(clamp((t - t0) / .9)), x = 600 + i * 340, h = v * 7 * k;
        return `<rect x="${x - 100}" y="${820 - h}" width="200" height="${h}" rx="8" fill="${i ? F : '#a8607c'}"/>` + txt(x, 870, y + '年', { size: 36, color: C.dim }) + (k > .05 ? txt(x, 800 - h, Math.round(v * k) + '%', { size: 64, color: i ? F : '#d79ab3', serif: true }) : ''); }).join('') },
    { at: 7.6, slide: 0, f: () => [0, 1, 2].map(i => person(1360 + i * 150, 600, 80, i < 2 ? F : '#5f5b66', 'f')).join('') + txt(1510, 800, '3人に2人', { size: 52, color: F, serif: true }) },
    ref(SR1),
  ], t); }, 4, { enter: 'fade', zoom: 0 });

// 32-34 請求書
const bill = (x, y, title, col, rows, k = 1) => { let g = `<g transform="translate(${x},${y})"><rect x="-260" y="0" width="520" height="${170 + rows.length * 110}" rx="10" fill="#f1ece2"/>` + txt(0, 70, title, { size: 44, color: col, shadow: false, serif: true }) + `<rect x="-220" y="100" width="440" height="3" fill="#bbb"/>`;
  rows.forEach(([item, sub, add], i) => { const a = clamp(k * rows.length - i); if (a <= 0) return; const yy = 170 + i * 110;
    g += `<g opacity="${a}">` + txt(-220, yy, item, { size: 42, color: '#222', shadow: false, anchor: 'start' }) + txt(-220, yy + 42, sub, { size: 26, color: '#777', shadow: false, anchor: 'start' }) + (add ? `<g transform="translate(160,${yy - 10}) rotate(-10)"><rect x="-70" y="-34" width="140" height="62" rx="8" fill="none" stroke="#c43a3a" stroke-width="5"/>` + txt(0, 10, '追加', { size: 34, color: '#c43a3a', shadow: false }) + '</g>' : '') + '</g>'; });
  return g + '</g>'; };
const MB = [['稼ぎ', '女性の90%が見ている'], ['家事・育児', '強く重視する女性 68%', true]];
const WB = [['家事・育児', '男性の89%が見ている'], ['稼ぎ', '男性の56%が見るように', true]];
SC[32] = K((t) => R([
  { at: 0, slide: 0, f: () => bill(CX, 260, '夫の請求書', M, MB.slice(0, t > 5.6 ? 2 : 1), 1) + person(CX - 480, 640, 100, M) },
  ref(SR1),
], t), 4, { enter: 'fade', zoom: 0 });
SC[33] = K((t) => R([
  { at: 0, slide: 0, f: () => bill(CX, 260, '妻の請求書', F, WB.slice(0, t > 5.0 ? 2 : 1), 1) + person(CX + 480, 640, 100, F, 'f') },
  ref(SR1),
], t), 4, { enter: 'fade', zoom: 0 });
SC[34] = K((t) => R([
  { at: 0, slide: 0, f: () => `<g transform="translate(93,60) scale(.85)">${bill(CX - 340, 300, '夫の請求書', M, MB)}${bill(CX + 460, 300, '妻の請求書', F, WB)}</g>` },
  { at: 5.0, f: (lt) => `<g transform="translate(${CX},220) scale(${pop(lt / .4)})">${txt(0, 0, '割り勘なのに、どちらも増えた', { size: 56, color: Y, serif: true })}</g>` },
], t), 4, { enter: 'fade', zoom: 0 });

// 35 結婚の利点「子どもや家族をもてる」女性 50→32
SC[35] = K((t) => { const k = easeOut(clamp((t - 5.5) / 1.6)), v = 49.8 - (49.8 - 31.6) * k;
  return R([
    { at: 0, f: () => head('結婚の利点：「自分の子どもや家族をもてる」', { y: 170 }) },
    { at: .5, slide: 0, f: () => `<path d="M560,820 L1360,820" stroke="#6a6470" stroke-width="3"/><rect x="${CX - 130}" y="${820 - 49.8 * 9}" width="260" height="${49.8 * 9}" rx="8" fill="none" stroke="#a8607c" stroke-width="4" stroke-dasharray="12 10"/>` + `<rect x="${CX - 130}" y="${820 - v * 9}" width="260" height="${v * 9}" rx="8" fill="${F}"/>` + txt(CX, 800 - v * 9, Math.round(v) + '%', { size: 72, color: F, serif: true }) + txt(CX, 870, '女性', { size: 36, color: C.dim }) },
    { at: 2.0, f: () => txt(CX + 320, 820 - 49.8 * 9 + 10, 'いちばん多かったころ 50%', { size: 32, color: '#d79ab3', anchor: 'start' }) },
    ref(SR1),
  ], t); }, 4, { enter: 'fade', zoom: 0 });

// 36 一生結婚するつもりはない 男24・女22（100人格子×2）
SC[36] = K((t) => { const a = easeOut(clamp((t - 6.5) / 1.4)), b = easeOut(clamp((t - 9.2) / 1.4));
  return R([
    { at: 0, f: () => head('「一生結婚するつもりはない」（18〜34歳の独身者）', { y: 170 }) },
    { at: .3, slide: 0, f: () => grid100(CX - 700, 380, 24 * a, M, 46, 52, 1.1) + grid100(CX + 290, 380, 21.5 * b, F, 46, 52, 1.1) },
    { at: 6.5, f: () => counter(CX - 490, 315, 24 * a, M, '人', 64) },
    { at: 9.2, f: () => counter(CX + 500, 315, 22 * b, F, '人', 64) },
    { at: 11.5, f: (lt) => `<g transform="translate(${CX},560) scale(${pop(lt / .4)})">${card(-150, -70, 300, 120, { fill: 'rgba(240,200,90,.15)', stroke: Y })}${txt(0, -10, '初めて', { size: 34, color: Y })}${txt(0, 36, '男女とも2割超', { size: 34, color: Y })}</g>` },
    ref(SR1),
  ], t); }, 4, { enter: 'fade', zoom: 0 });

// 37 女性の予想：結婚せず働く 7→36（1位）
const W_HIK = [7.1, 9.5, 9.3, 12.5, 15.6, 17.7, 21.0, 33.3, 36.1];
SC[37] = K((t) => { const k = easeOut(clamp((t - 4.5) / 5));
  return R([
    { at: 0, f: () => head('女性が「実際になりそう」と思う人生：結婚せず働く', { y: 170 }) },
    { at: 0, slide: 0, f: () => CH2.ax([1987, 1997, 2005, 2015, 2025], '%', [0, 25, 50]) + CH2.ln(CY, W_HIK, F, k, { labels: k > .99 ? [0, 8] : [0] }) },
    { at: 10.5, f: (lt) => `<g transform="translate(${CH2.fx(2025) - 40},${CH2.fy(36.1) - 90}) scale(${pop(lt / .4)})">${txt(0, 0, 'いちばん多い答え', { size: 40, color: Y, serif: true })}</g>` },
    ref(SR1),
  ], t); }, 4, { enter: 'fade', zoom: 0 });

// 38 テーブルと空いた椅子
SC[38] = K((t) => { const op = clamp((t - 6.5) / 1.5);
  const tbl = `<rect x="${CX - 300}" y="560" width="600" height="26" rx="8" fill="#8a6a3a"/><rect x="${CX - 270}" y="586" width="20" height="230" fill="#6e5530"/><rect x="${CX + 250}" y="586" width="20" height="230" fill="#6e5530"/>`
    + [[-130, -6], [110, 7]].map(([dx, r]) => `<g transform="translate(${CX + dx},500) rotate(${r})"><rect x="-80" y="-56" width="160" height="112" rx="6" fill="#f1ece2"/>` + [0, 1, 2].map(i => `<rect x="-56" y="${-34 + i * 26}" width="${i === 2 ? 70 : 112}" height="10" rx="5" fill="${i === 2 ? '#c43a3a' : '#cfc8b8'}"/>`).join('') + '</g>').join('');
  return R([
    { at: 0, slide: 0, f: () => tbl + chair(CX - 440, 720, '#8a8478') + `<g transform="translate(${CX + 440},720) scale(-1,1)">${chair(0, 0, '#8a8478')}</g>` },
    { at: 6.5, slide: 0, f: () => `<g opacity="${op}">${txt(CX, 300, '払うものが増えたテーブルに', { size: 46, color: C.fg, serif: true })}${txt(CX, 370, '座らない人が増えている', { size: 52, color: Y, serif: true })}</g>` },
    { at: 1.0, f: () => note(CX, 930 - 30, '※請求書が原因だと、この調査だけでは言い切れない', 'middle') },
  ], t); }, 4, { enter: 'fade', zoom: 0 });

// 39 これまでの図が小さく並ぶ
SC[39] = K((t) => R([
  ...[['38人→4人', M], ['27%→56%', Y], ['両立が1位', Y], ['請求書が増えた', '#ff8a7a']].map(([s0, col], i) => ({ at: .2 + i * .4, f: (lt) => `<g transform="translate(${300 + i * 440},540) scale(${pop(lt / .4)})">${card(-190, -110, 380, 220)}${txt(0, 18, s0, { size: 46, color: col, serif: true })}</g>` })),
], t), 5, { enter: 'fade', zoom: 0 });

// 40 まとめの3行
SC[40] = K((t) => R([
  { at: .3, f: () => txt(380, 360, '①', { size: 50, color: Y, serif: true }) + txt(450, 360, '「妻は専業主婦で」の男性　100人中38人 → 4人', { size: 42, anchor: 'start' }) },
  { at: 5.0, f: () => txt(380, 520, '②', { size: 50, color: Y, serif: true }) + txt(450, 520, '相手の稼ぎを見る男性　27% → 56%', { size: 42, anchor: 'start' }) },
  { at: 8.4, f: () => txt(380, 680, '③', { size: 50, color: Y, serif: true }) + txt(450, 680, '女性は稼ぎを見続け、家事・育児も求めるように', { size: 42, anchor: 'start' }) },
  ref(SR1),
], t), 5, { enter: 'fade', zoom: 0 });

// 41 男女の「両立」が並ぶ（39・37）
SC[41] = K((t) => { const a = easeOut(clamp((t - 4.0) / 1)), b = easeOut(clamp((t - 8.0) / 1));
  return R([
    { at: 0, f: () => head('いちばん望まれている人生（2025年）', { y: 170 }) },
    { at: 0, slide: 0, f: () => `<path d="M560,820 L1360,820" stroke="#6a6470" stroke-width="3"/>` + `<rect x="${CX - 300}" y="${820 - 39.2 * 10 * a}" width="240" height="${39.2 * 10 * a}" rx="8" fill="${M}"/>` + `<rect x="${CX + 60}" y="${820 - 36.5 * 10 * b}" width="240" height="${36.5 * 10 * b}" rx="8" fill="${F}"/>`
        + (a > .05 ? txt(CX - 180, 800 - 39.2 * 10 * a, Math.round(39.2 * a) + '%', { size: 64, color: M, serif: true }) : '') + (b > .05 ? txt(CX + 180, 800 - 36.5 * 10 * b, Math.round(36.5 * b) + '%', { size: 64, color: F, serif: true }) : '')
        + txt(CX - 180, 866, '男性が相手に望む', { size: 32, color: M }) + txt(CX + 180, 866, '女性の理想', { size: 32, color: F }) },
    { at: 9.5, f: (lt) => `<g transform="translate(${CX},262) scale(${pop(lt / .4)})">${txt(0, 0, 'どちらも「両立」が1位', { size: 52, color: Y, serif: true })}</g>` },
    ref(SR1),
  ], t); }, 5, { enter: 'fade', zoom: 0 });

// 42 2本の矢印が近づいて重なる
SC[42] = K((t) => { const k = ease(clamp((t - 7.0) / 4));
  const lab = (x, y, s0, col) => txt(x, y, s0, { size: 40, color: col });
  return R([
    { at: 0, slide: 0, f: () => txt(400, 330, '1987年', { size: 52, color: C.dim, serif: true }) + lab(400, 430, '男性の1位', M) + lab(400, 490, '専業主婦・再就職', M) + lab(400, 640, '女性の1位', F) + lab(400, 700, '専業主婦', F) },
    { at: 3.8, slide: 0, f: () => txt(1520, 330, '2025年', { size: 52, color: Y, serif: true }) + `<g opacity="${clamp((t - 3.8) / .6)}">` + arrow(700, 470, 1180, 470 + 90 * k, M, 1, 8) + arrow(700, 680, 1180, 680 - 120 * k, F, 1, 8) + '</g>' },
    { at: 7.0, f: () => `<g transform="translate(1500,${560})">${card(-200, -80, 400, 160, { fill: 'rgba(240,200,90,.15)', stroke: Y })}${txt(0, 18, '両立', { size: 72, color: Y, serif: true })}</g>` },
    { at: 11.5, f: () => txt(CX, 880 - 20, '男と女が思い描く結婚は、むしろ近づいている', { size: 44, color: C.fg, serif: true }) },
    ref(SR1),
  ], t); }, 5, { enter: 'fade', zoom: 0 });

// 43 レシート「2人で払う」に戻る
SC[43] = K((t) => { const rec = `<g transform="translate(${CX - 260},200)"><path d="M0,0 L520,0 L520,620 ${[...Array(13)].map((_, i) => `L${520 - (i + .5) * 40},${i % 2 ? 620 : 640}`).join(' ')} L0,620Z" fill="#f1ece2"/>`
    + txt(260, 72, '結婚のお会計', { size: 46, color: '#222', shadow: false, serif: true }) + `<rect x="40" y="100" width="440" height="3" fill="#bbb"/>`
    + txt(60, 260, '稼ぎ', { size: 40, color: '#333', shadow: false, anchor: 'start' }) + txt(470, 260, '2人', { size: 44, color: '#7a5a10', shadow: false, anchor: 'end', serif: true })
    + txt(60, 380, '家のこと', { size: 40, color: '#333', shadow: false, anchor: 'start' }) + txt(470, 380, '2人', { size: 44, color: '#7a5a10', shadow: false, anchor: 'end', serif: true })
    + `<rect x="40" y="440" width="440" height="3" fill="#bbb"/>` + txt(60, 520, '足りないもの', { size: 34, color: '#c43a3a', shadow: false, anchor: 'start' }) + (t > 4.5 ? txt(470, 520, '給料・時間', { size: 40, color: '#c43a3a', shadow: false, anchor: 'end', serif: true }) : '') + '</g>';
  return R([{ at: 0, slide: 0, f: () => rec + person(CX - 480, 640, 100, M) + person(CX + 480, 640, 100, F, 'f') }], t); }, 5, { enter: 'fade', zoom: 0 });

// 44 コメントのアイコン
SC[44] = K((t) => R([
  { at: .3, f: () => bubble(CX - 470, 380, 940, 150, 'あなたは、結婚相手に稼ぎを求める？', { size: 46 }) },
  { at: 4.5, f: (lt) => `<g transform="translate(${CX},680) scale(${pop(lt / .4)})">${card(-260, -60, 520, 120, { fill: 'rgba(255,255,255,.08)' })}${txt(0, 16, 'コメント欄で教えてね', { size: 44, color: Y })}</g>` },
], t), 5, { enter: 'fade', zoom: 0 });

// 45 締め
SC[45] = K((t) => R([
  { at: .2, f: () => txt(CX, 460, '今日のネタバレは、ここまで', { size: 60, serif: true }) },
  { at: 2.0, f: () => txt(CX, 600, 'チャンネル登録・高評価をお願いします', { size: 40, color: Y }) },
], t), 5, { enter: 'fade', zoom: 0 });

// ===== 写真（ぱくたそ）を場面の頭・途中に重ねる =====
const IMG = (n) => `/episodes/08_kasegu/img/${n}.jpg`;
const OVD = `<defs><filter id="ts2" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity=".7"/></filter><linearGradient id="topg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".65"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>`;
const ovSvg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0">${OVD}${inner}</svg>`;
const otxt = (x, y, s0, size, color = '#fff', serif = true) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${color}" filter="url(#ts2)" font-weight="700" style="font-family:${serif ? "'Noto Serif CJK JP',serif" : "'Noto Sans CJK JP',sans-serif"}">${s0}</text>`;
const photoSvg = (n, k, dark = .3) => { const z = 1 + .07 * ease(k);
  return `<g transform="translate(960,540) scale(${z.toFixed(4)}) translate(-960,-540)"><image href="${IMG(n)}" x="-40" y="-40" width="2000" height="1160" preserveAspectRatio="xMidYMid slice"/></g><rect width="1920" height="1080" fill="rgba(8,10,18,${dark})"/>`; };
const PH = [[6, 'A1', 0, 8.9, '2025年6月、全国に配られた質問用紙'], [22, 'B1', 0, 3.3, '家庭の形は、とっくに変わっていた'], [26, 'C3', 4.0, 8.0, '1人の給料で、家族を養えた時代'], [35, 'D2', 0, 3.4, '結婚の良さ：「子どもや家族をもてる」']];
for (const [i, n, T0, T1, cap] of PH) { const old = SC[i];
  SC[i] = { kind: 'kami', build() { const b = old.build(); return { render() {}, update(t, dur) { const base = b.update(t, dur);
    const a = Math.min(T0 > 0 ? clamp((t - T0) / .45) : 1, 1 - clamp((t - T1) / .5)); if (a <= 0) return base;
    const c = clamp((t - T0 - .4) / .5);
    return base + `<div style="position:absolute;left:0;top:0;width:1920px;height:1080px;opacity:${a.toFixed(3)}">` + ovSvg(photoSvg(n, (t - T0) / (T1 - T0 + .5)) + `<rect width="1920" height="320" fill="url(#topg)"/>` + `<g opacity="${c.toFixed(3)}">${otxt(960, 205, cap, 58, Y)}</g>`) + '</div>'; } }; } }; }

// ===== 3D（場所・空気・人の動き） =====
const pendant = (s, x, z, y = 2.05) => { cyl(s, .01, .01, 3.2 - y, mat('#222'), x, y + (3.2 - y) / 2, z, 6); const sh = cyl(s, .08, .26, .2, mat('#2a2622', { side: THREE.DoubleSide }), x, y, z, 16); ball(s, .07, glow('#ffd9a0', 3), x, y - .08, z, 1); return lamp(s, '#ffcf90', 2.6, 7, x, y - .2, z, true); };
const wallet3 = (p, x, y, z, ry = 0) => { const g = new THREE.Group(); box(g, .32, .06, .2, mat('#7a4c26', { r: .5 }), 0, 0, 0); box(g, .325, .012, .03, mat('#c9a24a', { m: .6, r: .3 }), 0, .02, .03); g.position.set(x, y, z); g.rotation.y = ry; p.add(g); return g; };
const billTex = () => canvasTex(256, 360, (g, W, H) => { g.fillStyle = '#f3efe6'; g.fillRect(0, 0, W, H); g.fillStyle = '#9a9488'; for (let i = 0; i < 6; i++) g.fillRect(30, 70 + i * 40, i % 2 ? 150 : 196, 8); g.fillStyle = '#c43a3a'; g.fillRect(30, 320, 120, 10); g.fillStyle = '#555'; g.fillRect(60, 26, 136, 14); });
const diningRoom = (s, o = {}) => { room(s, { w: 9, d: 8, h: 3.2, floor: '#4a3628', wall: '#3b3632', wall2: '#35302c', right: true });
  windowPane(s, 2.2, 1.75, -3.89, 1.6, 1.2, 'night', { seed: 9 }); box(s, 1.2, .9, .4, mat('#3a2a20'), -2.6, .45, -3.6); plantLite(s, -3.4, -3.3);
  const tb = desk(s, 0, 0, 0, { w: 1.6, d: .9, wood: '#7a5638', leg: '#4a3324' }); return tb; };
const plantLite = (s, x, z) => { cyl(s, .16, .12, .3, mat('#8a5a3c'), x, .15, z, 8); for (let i = 0; i < 6; i++) { const l = ball(s, .16, mat('#3f6a3a'), x + Math.sin(i * 2.1) * .12, .45 + i * .07, z + Math.cos(i * 2.1) * .12, 0); l.scale.set(1, .6, 1); } };

// 23 夫婦の椅子：財布が夫の椅子に → 妻の椅子にも
SC[23] = { build() { const S = makeScene({ bg: '#0b0a0e', hemi: .6, exposure: 1.55, sky: '#8a90a8', ground: '#2a1e16', bloom: .3, bloomTh: .8, fov: 32 }); const s = S.s;
  diningRoom(s); pendant(s, 0, 0); lamp(s, '#9fb0d8', .5, 9, 2.2, 1.8, -3.2, false);
  chair3(s, -1.05, 0, Math.PI / 2, '#3d5a85'); chair3(s, 1.05, 0, -Math.PI / 2, '#8a4a62');
  wallet3(s, -1.05, .52, .02, .3); const w2 = wallet3(s, 1.05, 2.0, .02, -.4); lamp(s, '#ffe2c0', 1.2, 10, 0, 2.6, 3, false);
  return { render() { S.render(); }, update(t, dur) { const d = clamp((t - 3.3) / .45), b = d >= 1 ? Math.abs(Math.sin((t - 3.75) * 14)) * .04 * Math.max(0, 1 - (t - 3.75) * 3) : 0;
    w2.position.y = 2.0 - (2.0 - .52) * d * d + b; w2.visible = t > 3.25; camMove(S.cam, [0, 3.3, 4.3], [0, 2.8, 3.4], [0, .45, 0], [0, .5, 0], ease(t / dur)); return ''; } }; } };

// 24 第3章：夜の住宅街を帰る男
SC[24] = { build() { const S = makeScene({ bg: '#0d1428', hemi: .7, exposure: 1.6, sky: '#7080b0', ground: '#1a1a20', bloom: .35, bloomTh: .8, fov: 36, fog: ['#0d1428', 10, 34] }); const s = S.s; sun(s, '#9fb0e0', .6, 4, 10, 6, 14);
  box(s, 8, .02, 60, mat('#26272c'), 0, -.01, -20); box(s, 1.6, .06, 60, mat('#3a3a40'), -3.0, .03, -20); box(s, 1.6, .06, 60, mat('#3a3a40'), 3.0, .03, -20);
  const r = rng(5); for (let i = 0; i < 9; i++) for (const sx of [-1, 1]) { const z = 2 - i * 5, w = 3 + r() * 1.5, h = 2.6 + r() * 2.2, x = sx * (5.6 + r() * .6); box(s, w, h, 3.6, mat(['#3a3530', '#30343c', '#3c3a36', '#2e2a28'][(r() * 4) | 0]), x, h / 2, z);
    const roof = box(s, w + .3, .2, 3.9, mat('#1e1c1c'), x, h + .1, z); for (let k = 0; k < 2; k++) if (r() < .7) box(s, .6, .5, .02, glow(r() < .5 ? '#ffcf8a' : '#ffe2b0', 1.4), x - sx * (w / 2 + .01) * 0 + (k - .5) * 1.2, h * .62, z + 1.81); }
  for (let i = 0; i < 6; i++) { const z = -1 - i * 8, x = (i % 2 ? 1 : -1) * 3.6; cyl(s, .05, .06, 3.4, mat('#2a2a30'), x, 1.7, z, 8); box(s, .5, .05, .1, mat('#2a2a30'), x - Math.sign(x) * .25, 3.4, z); ball(s, .1, glow('#fff1d0', 3), x - Math.sign(x) * .45, 3.3, z, 1); lamp(s, '#ffe6b8', 4, 9, x - Math.sign(x) * .45, 3.2, z, i < 2); }
  const man = human(s, { top: '#3a4458', bottom: '#262a33', face: false }); lamp(s, '#ffe6c0', 1.6, 6, 0, 2.5, 0, false); man.rotation.y = Math.PI; box(man, .08, .3, .4, mat('#1a1a1a'), .3, .55, 0);
  return { render() { S.render(); }, update(t, dur) { const z = .5 - t * 1.05; man.position.set(-.6, 0, z); man.userData.walk(t, .9);
    camMove(S.cam, [.4, 1.75, z + 4.6], [.4, 1.7, z + 4.3], [-.4, 1.2, z - 3], [-.4, 1.2, z - 3], 0);
    const a = clamp((t - .4) / .5); return ovSvg(`<g opacity="${a}"><rect width="1920" height="360" fill="url(#topg)"/>${otxt(960, 160, '第3章', 34, '#ff8a3d', false)}${otxt(960, 250, 'なぜ男は、養う側を降りたのか', 66, Y)}</g>`); } }; } };

// 28 1人で抱える箱 → 女性が来て2人で持つ
SC[28] = { build() { const S = makeScene({ bg: '#0e0d12', hemi: .75, exposure: 1.5, sky: '#9aa4c0', ground: '#2a2018', bloom: .2, bloomTh: .85, fov: 30 }); const s = S.s; lamp(s, '#fff0dc', 1.4, 12, 0, 2.2, 4, false);
  room(s, { w: 10, d: 8, h: 3.4, floor: '#4d3a2c', wall: '#3a3734', left: false }); windowPane(s, -2.2, 1.8, -3.89, 1.8, 1.3, 'dusk', { seed: 3 });
  lamp(s, '#ffd6a0', 2.4, 9, .3, 2.6, 1.2, true); lamp(s, '#a8b8e0', .6, 10, -2.2, 1.8, -3.0, false);
  const man = human(s, { top: '#4f8fea', bottom: '#2a2f3a' }); man.rotation.y = Math.PI / 2; man.position.set(-.82, 0, 0);
  const wo = human(s, { top: '#ef7fa8', bottom: '#3a2e36', hairStyle: 'long' }); wo.rotation.y = -Math.PI / 2;
  const bx = new THREE.Group(); box(bx, .62, .46, .5, mat('#b08a5a'), 0, 0, 0); box(bx, .63, .012, .12, mat('#d8c49a'), 0, .235, 0); s.add(bx);
  const setArms = (p, a) => { p.userData.arms.forEach(g => { g.rotation.x = -a; }); };
  return { render() { S.render(); }, update(t, dur) { const arr = clamp((t - 4.6) / 1.6), lift = clamp((t - 6.1) / .5), wob = (1 - lift) * Math.sin(t * 7);
    const wx = lerp(3.4, .82, ease(arr)); wo.position.set(wx, 0, 0); if (arr < 1 && t > 4.6) wo.userData.walk(t, 1.1); else { wo.userData.legs.forEach(l => l.rotation.x = 0); }
    setArms(man, 1.0); if (t > 4.6 && arr >= 1) setArms(wo, 1.0 * lift); else if (t <= 4.6 || arr < 1) { if (t <= 4.6) setArms(wo, 0); }
    bx.position.set(0, 1.0 + wob * .025, 0); bx.rotation.z = wob * .07; man.rotation.z = 0; man.position.y = 0; man.userData.head.rotation.x = (1 - lift) * .25;
    camMove(S.cam, [.0, 1.45, 4.6], [.1, 1.35, 3.9], [.1, .95, 0], [.1, .95, 0], ease(t / dur)); return ''; } }; } };

// 38 払うものが増えたテーブル：請求書2枚と空いたままの椅子
SC[38] = { build() { const S = makeScene({ bg: '#0a090d', hemi: .45, exposure: 1.4, sky: '#8088a0', ground: '#241a14', bloom: .3, bloomTh: .85, fov: 30 }); const s = S.s;
  diningRoom(s); pendant(s, 0, 0); lamp(s, '#8fa0cc', .45, 9, 2.2, 1.8, -3.2, false);
  chair3(s, -1.15, .05, Math.PI / 2 + .25, '#4a4448'); chair3(s, 1.2, -.05, -Math.PI / 2 - .3, '#4a4448'); chair3(s, -.35, -.85, .1, '#4a4448'); chair3(s, .4, .95, Math.PI - .2, '#4a4448');
  const tx = billTex(); const mk = (x, z, rz) => { const pl = plane(s, .3, .42, new THREE.MeshStandardMaterial({ map: tx, roughness: .95 }), x, .795, z); pl.rotation.x = -Math.PI / 2; pl.rotation.z = rz; pl.receiveShadow = true; };
  mk(-.22, .02, .18); mk(.2, -.04, -.12);
  return { render() { S.render(); }, update(t, dur) { camMove(S.cam, [2.6, 2.4, 4.2], [1.2, 1.75, 2.6], [0, .7, 0], [0, .78, 0], ease(t / dur)); return ''; } }; } };

// 45 締め：夜のマンションに灯りがともる
SC[45] = { build() { const S = makeScene({ bg: '#0e1834', hemi: .45, exposure: 1.2, sky: '#4a5a8a', ground: '#121216', bloom: .25, bloomTh: .9, fov: 34 }); const s = S.s;
  box(s, 40, .02, 30, mat('#1c1d22'), 0, -.01, 0);
  const wins = []; const r = rng(11);
  for (const [bx0, bz, nx, ny] of [[-3.2, -2, 6, 9], [3.6, -4, 5, 11], [-8.5, -6, 5, 7]]) { const W = nx * 1.1 + .6, Hh = ny * 1.0 + .6; box(s, W, Hh, 3, mat('#4a4e5c'), bx0, Hh / 2, bz - 1.5);
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const x = bx0 - W / 2 + .85 + i * 1.1, y = .9 + j * 1.0; const off = box(s, .62, .5, .02, mat('#151821'), x, y, bz + .01); const on = box(s, .62, .5, .02, glow(r() < .5 ? '#e8b46a' : '#f0c890', .55), x, y, bz + .02); on.visible = false; box(s, .9, .05, .25, mat('#3a3c44'), x, y - .33, bz + .1); wins.push([on, r()]); } }
  sun(s, '#8aa0d8', .9, -5, 12, 14, 18);
  return { render() { S.render(); }, update(t, dur) { const k = clamp(t / (dur - 1)); wins.forEach(([on, th]) => { on.visible = th < .25 + .5 * k; });
    camMove(S.cam, [-1, 2.0, 24], [-1, 2.6, 21], [-1, 9.0, -3], [-1, 9.4, -3], ease(t / dur));
    const a = clamp((t - .3) / .5), b = clamp((t - 2.0) / .5); return ovSvg(`<g opacity="${a}">${otxt(960, 260, '今日のネタバレは、ここまで', 64)}</g><g opacity="${b}">${otxt(960, 360, 'チャンネル登録・高評価をお願いします', 42, Y, false)}</g>`); } }; } };

export const SCENES = SC;
