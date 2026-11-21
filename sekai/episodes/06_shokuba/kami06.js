// 06 職場結婚 — 紙芝居＋写真（セリフに合う写真を背景に）。字幕は灰色の帯。男性=青 女性=ピンク
import { maps, C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, bubble, loadMaps, run, kami } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const M = '#4f8fea', F = '#ef7fa8', Y = C.gold, CX = 960;
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', 'エピローグ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, ...o });
const R = (els, t) => run(els.map(e => e.f ? e : { ...e, f: () => '' }), t);
const ref = (s) => ({ at: .6, f: () => note(1880, 125, s, 'end') });
const IMG = (n) => `/episodes/06_shokuba/img/${n}.jpg`;
await Promise.all(['night_window', 'coffee', 'shrine_wedding', 'office_bldg'].map(n => new Promise(r => { const i = new Image(); i.onload = () => (i.decode ? i.decode().then(r, r) : r()); i.onerror = r; i.src = IMG(n); })));
const photo = (n, t, dur, dark = .35, z0 = 1.0, z1 = 1.08, px = 0, py = 0) => { const k = ease(t / dur), z = z0 + (z1 - z0) * k;
  return `<g transform="translate(${960 + px * k},${540 + py * k}) scale(${z}) translate(-960,-540)"><image href="${IMG(n)}" x="-40" y="-40" width="2000" height="1160" preserveAspectRatio="xMidYMid slice"/></g><rect width="1920" height="1080" fill="rgba(8,10,18,${dark})"/>`; };
const crown = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-34,14 L-40,-22 L-18,-4 L0,-30 L18,-4 L40,-22 L34,14Z" fill="${Y}" stroke="#7a5a10" stroke-width="3"/><rect x="-34" y="14" width="68" height="12" fill="${Y}" stroke="#7a5a10" stroke-width="3"/></g>`;
const SURVEY = '出生動向基本調査（社人研）';
// ===== 冒頭：100組の夫婦の格子（同じ画面に足していく） =====
const GX = 190, GY = 270, DX = 74, DY = 66;
const couple = (x, y, lit, a = 1, glowA = 0) => `<g transform="translate(${x},${y})" opacity="${a}">`
  + (glowA > 0 ? `<circle cx="0" cy="-6" r="34" fill="${Y}" opacity="${(.35 * glowA).toFixed(2)}"/>` : '')
  + `<circle cx="-11" cy="-20" r="8" fill="${lit ? M : '#5d5a66'}"/><rect x="-19" y="-11" width="16" height="22" rx="6" fill="${lit ? M : '#5d5a66'}"/>`
  + `<circle cx="11" cy="-20" r="8" fill="${lit ? F : '#6a6672'}"/><path d="M3,11 L11,-11 L19,11Z" fill="${lit ? F : '#6a6672'}"/></g>`;
// 職場で出会った夫婦：28組（そのうち後で7組が灰色に戻る）。ばらけた位置
const WORK = (() => { const r = (() => { let x = 7; return () => ((x = (x * 16807) % 2147483647) / 2147483647); })(), idx = [...Array(100).keys()];
  for (let i = 99; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; } return idx.slice(0, 28); })();
const OFF = new Set(WORK.slice(21));   // 21.4%に下がるとき灰色に戻る7組
// grid(t, mode)：mode.lit = 何組光らせるか（0〜28）、mode.off = 戻した数、mode.dim = 全体の暗さ
const grid = (o = {}) => { let g = ''; const nLit = o.lit || 0, nOff = o.off || 0, appear = o.appear ?? 1;
  for (let i = 0; i < 100; i++) { const x = GX + (i % 10) * DX, y = GY + Math.floor(i / 10) * DY, a = clamp(appear * 12 - (i % 10 + Math.floor(i / 10)) * .5);
    const wi = WORK.indexOf(i), lit = wi >= 0 && wi < nLit && !(OFF.has(i) && WORK.slice(21).indexOf(i) < nOff);
    g += couple(x, y, lit, a * (o.dim ?? 1) * (lit ? 1 : .9), lit ? 1 : 0); }
  return g; };
const legend = () => txt(GX + 4.5 * DX, GY + 10 * DY + 6, '1組 ＝ 結婚した夫婦100組のうちの1組', { size: 28, color: C.dim });
const SC = [];

// 0 灰色の夫婦100組が並ぶ。「職場結婚」の札
SC[0] = K((t) => R([
  { at: 0, slide: 0, f: (lt) => grid({ appear: clamp(lt / 1.6) }) },
  { at: 1.2, f: (lt) => `<g transform="translate(1440,470) scale(${pop(lt / .4)})">${txt(0, 0, '職場結婚', { size: 110, serif: true })}</g>` + txt(1440, 560, 'あまり聞かなくなった？', { size: 44, color: C.dim }) },
], t), 0, { enter: 'fade', zoom: 0 });
// 1 吹き出し：聞かなくなった → 気のせい？
SC[1] = K((t) => R([
  { at: 0, slide: 0, f: () => grid() },
  { at: .3, f: () => bubble(1440, 380, 640, 130, '職場結婚、最近聞かないよね', { size: 44 }) },
  { at: 3.0, f: (lt) => `<g transform="translate(1440,620) scale(${pop(lt / .4)})">${txt(0, 30, 'ただの気のせい？', { size: 80, color: Y, serif: true })}</g>` },
], t), 0, { enter: 'fade', zoom: 0 });
// 2 出典カード：国が5年ごとに、約7,000組の夫婦にたずねている
SC[2] = K((t) => R([
  { at: 0, slide: 0, f: () => grid({ dim: .55 }) + legend() },
  { at: .3, f: () => card(1100, 300, 700, 460, { fill: 'rgba(20,24,36,.95)' }) + txt(1150, 380, '出生動向基本調査', { size: 46, color: Y, anchor: 'start' })
      + [['実施', '国立社会保障・人口問題研究所'], ['間隔', '5年ごと'], ['対象', '結婚した夫婦 約7,000組'], ['質問', '「どこで出会いましたか？」']].map((r, i) => txt(1150, 470 + i * 70, r[0], { size: 30, color: C.dim, anchor: 'start' }) + txt(1250, 470 + i * 70, r[1], { size: 32, anchor: 'start' })).join('') },
  ref(SURVEY),
], t), 0, { enter: 'fade', zoom: 0 });
// 3 2015〜18年に結婚：28組が光る → 28.2%、1位
SC[3] = K((t) => { const n = Math.round(28 * easeOut(clamp((t - 1.0) / 3.2))); return R([
  { at: 0, f: () => head('2015〜2018年に結婚した夫婦', { y: 190 }) },
  { at: 0, slide: 0, f: () => grid({ lit: n }) + legend() },
  { at: 1.0, slide: 0, f: () => txt(1440, 420, '職場や仕事で出会った', { size: 40 }) + `<g style="font-variant-numeric:tabular-nums">${txt(1440, 560, (n >= 28 ? 28.2 : n).toString() + (n >= 28 ? '%' : '組'), { size: 130, color: Y, serif: true })}</g>` },
  { at: 4.6, f: (lt) => crown(1440, 680, pop(lt / .4) * 1.4) + txt(1440, 770, '出会い方の1位', { size: 44, color: Y }) },
  ref(SURVEY),
], t); }, 0, { enter: 'fade', zoom: 0 });
// 4 2018〜21年に結婚：7組が灰色に戻る → 21.4%、王冠が「友人・きょうだい」へ
SC[4] = K((t) => { const off = Math.round(7 * ease(clamp((t - 1.0) / 2.0))), c = ease(clamp((t - 3.6) / 1.0)), arc = Math.sin(Math.PI * clamp((t - 3.6) / 1.0));
  const v = off >= 7 ? '21.4%' : (28 - off) + '組';
  return R([
    { at: 0, f: () => head(t < .9 ? '2015〜2018年に結婚した夫婦' : '2018〜2021年に結婚した夫婦', { y: 190 }) },
    { at: 0, slide: 0, f: () => grid({ lit: 28, off }) + legend() },
    { at: 0, slide: 0, f: () => txt(1440, 420, '職場や仕事で出会った', { size: 40 }) + `<g style="font-variant-numeric:tabular-nums">${txt(1440, 560, v, { size: 130, color: off >= 7 ? '#c9a24a' : Y, serif: true })}</g>` },
    { at: 3.0, f: () => card(1200, 800, 520, 110, { fill: 'rgba(20,24,36,.92)' }) + txt(1480, 872, '友人・きょうだい 25.9%', { size: 38 }) },
    { at: 0, slide: 0, f: () => crown(1440 - 190 * c, 680 + 172 * c - 120 * arc, 1.4 - .5 * c) },

    ref(SURVEY),
  ], t); }, 0, { enter: 'fade', zoom: 0 });
export const SCENES = SC;
