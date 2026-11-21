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
const SC = [];

// 0 夜のオフィスビル。明かりが1つだけ残っている
SC[0] = K((t, dur) => photo('night_window', t, dur, .15, 1.0, 1.12, 60, 40), 0, { enter: 'fade', zoom: 0 });
// 1 給湯室の立ち話：「職場結婚、聞かなくなった」→「気のせい？」
SC[1] = K((t, dur) => photo('coffee', t, dur, .5, 1.02, 1.08, -30) + R([
  { at: .4, f: () => bubble(1380, 300, 640, 130, '職場結婚、最近聞かないよね', { size: 46 }) },
  { at: 3.0, f: (lt) => `<g transform="translate(1380,560) scale(${pop(lt / .4)})">${txt(0, 30, 'ただの気のせい？', { size: 80, color: Y, serif: true })}</g>` },
], t), 0, { enter: 'fade', zoom: 0 });
// 2 神社の結婚式の写真＋調査票：約7,000組の夫婦にたずねた
SC[2] = K((t, dur) => photo('shrine_wedding', t, dur, .45, 1.0, 1.07, 40) + R([
  { at: .3, f: (lt) => { const k = easeOut(clamp(lt / .7)); return `<g transform="translate(${-500 * (1 - k)},0) rotate(-3 300 560)"><rect x="140" y="250" width="520" height="640" rx="14" fill="#efeae0"/>`
      + txt(400, 330, '結婚した夫婦への質問', { size: 34, color: '#333', shadow: false }) + txt(400, 400, '「どこで出会いましたか？」', { size: 34, color: '#111', shadow: false })
      + ['職場や仕事で', '友人・きょうだいを通じて', '学校で', 'ネットで', 'その他'].map((s0, i) => `<rect x="190" y="${458 + i * 78}" width="30" height="30" rx="4" fill="none" stroke="#8a8478" stroke-width="4"/>` + txt(240, 484 + i * 78, s0, { size: 30, color: '#333', anchor: 'start', shadow: false })).join('') + '</g>'; } },
  { at: 1.4, f: (lt) => `<g transform="translate(1380,470) scale(${pop(lt / .4)})">${txt(0, 0, '約7,000組', { size: 110, color: Y, serif: true })}</g>` + txt(1380, 560, '5年ごとの国の調査', { size: 40 }) },
  ref(SURVEY),
], t), 0, { enter: 'right', zoom: 0 });
// 3-4 出会い方ランキング（棒）：職場が1位 28.2% → 21.4%で1位を明け渡す
const BAR = (x, y, w, col, label, val, a = 1) => `<g opacity="${a}"><rect x="${x}" y="${y}" width="${w}" height="92" rx="12" fill="${col}"/>${txt(x - 24, y + 62, label, { size: 40, anchor: 'end' })}${txt(x + w + 24, y + 64, val, { size: 52, color: col === Y ? Y : '#fff', anchor: 'start', serif: true })}</g>`;
const U = 34;   // 1% = 34px
SC[3] = K((t, dur) => photo('office_bldg', t, dur, .74, 1.0, 1.05) + R([
  { at: 0, f: () => head('夫婦が出会ったきっかけ', { y: 190 }) + txt(CX, 250, '2015〜2018年に結婚', { size: 34, color: C.dim }) },
  { at: .4, slide: 0, f: (lt) => BAR(560, 480, 28.2 * U * easeOut(clamp(lt / 1.2)), Y, '職場や仕事で', lt > 1.1 ? '28.2%' : '') },
  { at: 2.2, f: (lt) => crown(560 + 28.2 * U + 210, 460, pop(lt / .4) * 1.2) + txt(560 + 28.2 * U + 210, 410, '1位', { size: 44, color: Y }) },
  { at: 4.5, slide: 0, f: (lt) => BAR(560, 660, 6.0 * U * easeOut(clamp(lt / .8)), '#8fb3d9', 'ネットで', lt > .7 ? '6.0%' : '', .8) },
  ref(SURVEY),
], t), 0, { enter: 'right', zoom: 0 });
SC[4] = K((t, dur) => { const k = ease(clamp((t - .8) / 1.6)), w = (28.2 - 6.8 * k) * U, c = clamp((t - 3.2) / 1.0), ce = ease(c);
  const cx = (560 + 28.2 * U + 210) * (1 - ce) + (560 + 25.9 * U + 210) * ce, cy = 480 * (1 - ce) + 320 * ce - Math.sin(Math.PI * c) * 160;
  return photo('office_bldg', t, dur, .74, 1.05, 1.08) + R([
    { at: 0, f: () => head('夫婦が出会ったきっかけ', { y: 190 }) + txt(CX, 250, t < 2.6 ? '2015〜2018年に結婚' : '2018〜2021年に結婚', { size: 34, color: t < 2.6 ? C.dim : Y }) },
    { at: 2.6, slide: 0, f: (lt) => BAR(560, 340, 25.9 * U * easeOut(clamp(lt / .9)), '#cfd4dc', '友人・きょうだい', lt > .8 ? '25.9%' : '') },
    { at: 0, slide: 0, f: () => BAR(560, 500, w, k > .9 ? '#c9a24a' : Y, '職場や仕事で', (28.2 - 6.8 * k).toFixed(1) + '%') + BAR(560, 660, 6.0 * U, '#8fb3d9', 'ネットで', '6.0%', .8) },
    { at: 0, slide: 0, f: () => crown(cx, cy, 1.2) + (c >= 1 ? txt(cx + 96, cy + 14, '1位', { size: 44, color: Y }) : '') },
    { at: 4.6, f: () => txt(CX, 880, '職場は、1位の座を明け渡した', { size: 50, color: Y, serif: true }) },
    ref(SURVEY),
  ], t); }, 0, { enter: 'fade', zoom: 0 });
export const SCENES = SC;
