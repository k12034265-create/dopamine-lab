// 06 職場結婚 — 紙芝居＋写真（セリフに合う写真を背景に）。字幕は灰色の帯。男性=青 女性=ピンク
import { THREE, makeScene, mat, glow, box, cyl, plane, lamp, sun, canvasTex, person as person3, rng, lerp } from '/pipeline3d/lib3d.js';
import { maps, C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, bubble, loadMaps, run, kami } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const M = '#4f8fea', F = '#ef7fa8', Y = C.gold, CX = 960;
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', 'エピローグ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, ...o });
const R = (els, t) => run(els.map(e => e.f ? e : { ...e, f: () => '' }), t);
const ref = (s) => ({ at: .6, f: () => note(1880, 125, s, 'end') });
const IMG = (n) => `/episodes/06_shokuba/img/${n}.jpg`;
await Promise.all(['overtime'].map(n => new Promise(r => { const i = new Image(); i.onload = () => (i.decode ? i.decode().then(r, r) : r()); i.onerror = r; i.src = IMG(n); })));
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
    { at: 3.0, f: () => card(1200, 800, 520, 110, { fill: 'rgba(20,24,36,.92)' }) + txt(1510, 872, '友人・きょうだい 25.9%', { size: 38 }) },
    { at: 0, slide: 0, f: () => crown(1440 - 200 * c, 680 + 172 * c - 120 * arc, 1.4 - .6 * c) },

    ref(SURVEY),
  ], t); }, 0, { enter: 'fade', zoom: 0 });

// ===== 共通の小物 =====
const chapEls = (num, title) => [
  { at: 0, slide: 0, f: () => txt(CX, 400, num, { size: 40, color: C.o, serif: true, ls: 10 }) },
  { at: .25, f: () => txt(CX, 530, title, { size: 88, serif: true, ls: 4 }) },
  { at: .7, slide: 0, f: (lt) => `<rect x="${CX - 320 * ease(lt / .8)}" y="580" width="${640 * ease(lt / .8)}" height="3" fill="${C.o}"/>` }];
const NET = (() => { const r = (() => { let x = 99; return () => ((x = (x * 16807) % 2147483647) / 2147483647); })(); const out = []; while (out.length < 14) { const i = Math.floor(r() * 100); if (!WORK.includes(i) && !out.includes(i)) out.push(i); } return out; })();
const CY2 = '#5fd3e0';
const coupleC = (x, y, c1, c2, a = 1, g = 0, gc = Y) => `<g transform="translate(${x},${y})" opacity="${a}">` + (g > 0 ? `<circle cx="0" cy="-6" r="34" fill="${gc}" opacity="${(.35 * g).toFixed(2)}"/>` : '')
  + `<circle cx="-11" cy="-20" r="8" fill="${c1}"/><rect x="-19" y="-11" width="16" height="22" rx="6" fill="${c1}"/><circle cx="11" cy="-20" r="8" fill="${c2}"/><path d="M3,11 L11,-11 L19,11Z" fill="${c2}"/></g>`;
const bldg = (x, y, s = 1, col = '#9aa6b8') => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-60" y="-160" width="120" height="160" rx="6" fill="${col}"/>${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<rect x="${-44 + c * 32}" y="${-146 + r * 36}" width="22" height="24" fill="#1b1a20" opacity=".55"/>`).join('')).join('')}</g>`;
const phone = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-55" y="-100" width="110" height="200" rx="18" fill="#2b2f3a" stroke="${CY2}" stroke-width="5"/><rect x="-42" y="-80" width="84" height="150" rx="6" fill="${CY2}" opacity=".25"/>${`<path d="M0,-20 C-30,-50 -40,-5 0,20 C40,-5 30,-50 0,-20Z" fill="${F}"/>`}</g>`;
const house = (x, y, s = 1, col = '#cfc8b8') => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-70,-10 L0,-70 L70,-10Z" fill="${col}"/><rect x="-55" y="-10" width="110" height="80" fill="${col}"/><rect x="-14" y="22" width="28" height="48" fill="#1b1a20" opacity=".5"/></g>`;
const gear = (x, y, r, rot, col, label) => { let d = ''; for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; d += `<rect x="${-r * .16}" y="${-r - 18}" width="${r * .32}" height="36" rx="4" fill="${col}" transform="rotate(${a * 180 / Math.PI})"/>`; }
  return `<g transform="translate(${x},${y})"><g transform="rotate(${rot})">${d}<circle r="${r}" fill="${col}"/></g><circle r="${r * .72}" fill="#1b1a20"/>${txt(0, 14, label, { size: 36, color: col })}</g>`; };
const SR2 = '岩澤・三田 (2005) 日本労働研究雑誌';

// 5 ネットで出会った夫婦：6組 → 14組
SC[5] = K((t) => { const n = t < 3.6 ? Math.round(6 * easeOut(clamp((t - .6) / 1.2))) : 6 + Math.round(8 * easeOut(clamp((t - 3.6) / 2.4)));
  let g = ''; for (let i = 0; i < 100; i++) { const x = GX + (i % 10) * DX, y = GY + Math.floor(i / 10) * DY, ni = NET.indexOf(i), wi = WORK.indexOf(i), lit = ni >= 0 && ni < n, wk = wi >= 0 && wi < 21;
    g += lit ? coupleC(x, y, M, F, 1, 1, CY2) : coupleC(x, y, wk ? '#7a6a3a' : '#5d5a66', wk ? '#8a7840' : '#6a6672', .9); }
  return R([
    { at: 0, f: () => head('ネットで出会った夫婦', { y: 190 }) },
    { at: 0, slide: 0, f: () => g + legend() },
    { at: .6, slide: 0, f: () => txt(1440, 400, t < 3.6 ? '2015〜2018年' : '2018〜2021年', { size: 40, color: C.dim }) + `<g style="font-variant-numeric:tabular-nums">${txt(1440, 540, t < 3.6 ? '6.0%' : (n >= 14 ? '13.6%' : n + '組'), { size: 130, color: CY2, serif: true })}</g>` },
    { at: 6.4, f: (lt) => `<g transform="translate(1440,690) scale(${pop(lt / .4)})">${txt(0, 0, '2倍以上', { size: 72, color: Y, serif: true })}</g>` + txt(1440, 770, 'マッチングアプリ・SNS', { size: 36, color: C.dim }) },
    ref(SURVEY),
  ], t); }, 0, { enter: 'fade', zoom: 0 });
// 6 スマホが職場を押しのける？
SC[6] = K((t) => { const k = ease(clamp((t - .8) / 1.6)); return R([
  { at: 0, slide: 0, f: () => bldg(960 - 260 * k, 640, 1.6, '#9aa6b8') + `<g opacity="${clamp(t * 3)}">${phone(1700 - 520 * k, 560, 1.4)}</g>` + txt(960 - 260 * k, 700, '職場', { size: 40, color: '#9aa6b8' }) },
  { at: 2.6, f: () => txt(CX, 230, 'アプリが、職場の出会いを', { size: 56, serif: true }) + txt(CX, 310, '奪っただけ？', { size: 72, color: Y, serif: true }) },
], t); }, 0, { enter: 'fade', zoom: 0 });
// 7 時間軸：1930年代 → 今
SC[7] = K((t) => { const x0 = 220, x1 = 1700, k = ease(clamp(t / 4)), Y0 = 560, X = (y) => x0 + (y - 1930) / 95 * (x1 - x0);
  return R([
    { at: 0, f: () => head('100年近い、結婚の記録', { y: 200 }) },
    { at: 0, slide: 0, f: () => `<rect x="${x0}" y="${Y0 - 2}" width="${(x1 - x0) * k}" height="4" fill="#cfc8b8"/>` + [1930, 1950, 1970, 1990, 2010].map(y => (X(y) <= x0 + (x1 - x0) * k) ? `<rect x="${X(y) - 2}" y="${Y0 - 14}" width="4" height="28" fill="#cfc8b8"/>` + txt(X(y), Y0 + 60, y + '年', { size: 34, color: C.dim }) : '').join('') + `<circle cx="${x0 + (x1 - x0) * k}" cy="${Y0}" r="14" fill="${Y}"/>` },
    { at: 4.2, f: () => txt(x1, Y0 - 50, '今', { size: 48, color: Y }) },
    { at: 4.6, f: () => txt(CX, 820, '日本人の出会い方は、どう変わってきたのか', { size: 50, serif: true }) },
  ], t); }, 0, { enter: 'fade', zoom: 0 });
// 8 第1章
SC[8] = K((t) => R(chapEls('第1章', 'お見合いの時代'), t), 1, { enter: 'zoom', zoom: 0 });
// 9 3D：料亭の座敷。向かい合う2人と、間に座る仲人
function zashiki() {
  const S = makeScene({ bg: '#1a120c', hemi: .9, exposure: 1.2, sky: '#f0d8b0', ground: '#3a2a18', bloom: .12, bloomTh: .9, fov: 32 });
  const s = S.s, tat = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#b8a66a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6a5a30'; g.lineWidth = 6; g.strokeRect(0, 0, w, h / 2); g.strokeRect(0, h / 2, w, h / 2); for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(90,80,40,.12)'; g.fillRect(0, i * 4.3, w, 1); } });
  tat.wrapS = tat.wrapT = THREE.RepeatWrapping; tat.repeat.set(4, 4);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ map: tat, roughness: .9 })); fl.rotation.x = -Math.PI / 2; s.add(fl);
  box(s, 12, 4, .1, mat('#e8dcc0'), 0, 2, -3); for (let x = -5; x <= 5; x += 1.1) box(s, .06, 4, .14, mat('#4a3420'), x, 2, -2.94);   // 障子と桟
  box(s, 12, .12, .2, mat('#4a3420'), 0, 2.6, -2.9);
  box(s, 1.6, .32, .9, mat('#3a2010', { rough: .4 }), 0, .16, 0);   // 座卓
  for (const x of [-.25, .25]) cyl(s, .08, .07, .06, mat('#d8d0c0'), x, .35, 0, 12);
  for (const [x, ry, top, hs] of [[-1.25, Math.PI / 2, '#2a2d38', 'short'], [1.25, -Math.PI / 2, '#a8506a', 'bun']]) {
    box(s, .6, .06, .6, mat('#7a3040'), x, .03, 0);
    const p = person3(s, { seated: true, top, bottom: top, hairStyle: hs }); p.position.set(x, -.38, 0); p.rotation.y = ry; }
  box(s, .6, .06, .6, mat('#7a3040'), 0, .03, -1.3); const nk = person3(s, { seated: true, top: '#3a3a30', bottom: '#3a3a30', hair: '#6a6a66' }); nk.position.set(0, -.38, -1.3);
  lamp(s, '#ffd9a0', 1.1, 8, 0, 2.6, 1.5, false); lamp(s, '#ffe8d0', 1.0, 9, 0, 1.6, 3.5, false); sun(s, '#ffe8c0', .5, 2, 6, 4, 10);
  return { render() { S.render(); }, update(t, dur) { const k = ease(t / dur); S.cam.position.set(lerp(-.6, .4, k), 1.55, lerp(4.2, 3.7, k)); S.cam.lookAt(0, .55, -.2); return ''; } };
}
SC[9] = { build: zashiki };
// 10 家と家を結ぶ線。真ん中に世話好きな人
SC[10] = K((t) => R([
  { at: .2, f: (lt) => house(520, 560, 1.6 * pop(lt / .4)) + txt(520, 720, '〇〇家', { size: 40 }) },
  { at: .6, f: (lt) => house(1400, 560, 1.6 * pop(lt / .4)) + txt(1400, 720, '△△家', { size: 40 }) },
  { at: 1.6, f: (lt) => person(CX, 560, 110, '#cfc8b8') + txt(CX, 700, '親・親戚・近所の世話好き', { size: 32, color: C.dim }) },
  { at: 3.2, slide: 0, f: (lt) => { const k = ease(clamp(lt / 1)); return `<path d="M640,500 Q${CX},${380} ${640 + (1280 - 640) * k},500" stroke="${Y}" stroke-width="6" fill="none" stroke-dasharray="14 10"/>`; } },
  { at: 6.0, f: () => txt(CX, 300, '結婚は、家と家の話だった', { size: 62, color: Y, serif: true }) },
  ref(SR2),
], t), 1, { enter: 'right', zoom: 0 });
// 11 見合い結婚と恋愛結婚の割合（形はイメージ）：1960年代に逆転
SC[11] = K((t) => { const x0 = 300, x1 = 1600, yb = 820, X = (y) => x0 + (y - 1935) / 70 * (x1 - x0), Yv = (v) => yb - v * 5.2, k = clamp((t - .4) / 4.5);
  const lineP = (f) => { let d = ''; for (let i = 0; i <= 60; i++) { const y = 1935 + 70 * i / 60 * k; d += (i ? 'L' : 'M') + X(y).toFixed(1) + ',' + Yv(f(y)).toFixed(1); } return d; };
  const miai = (y) => 72 - 66 / (1 + Math.exp(-(y - 1966) / 7)), ren = (y) => 12 + 78 / (1 + Math.exp(-(y - 1966) / 7));
  return R([
    { at: 0, f: () => head('結婚のきっかけ：お見合い と 恋愛', { y: 190 }) },
    { at: 0, slide: 0, f: () => `<rect x="${x0}" y="${yb}" width="${x1 - x0}" height="3" fill="#6b665e"/>` + [1940, 1960, 1980, 2000].map(y => txt(X(y), yb + 50, y + '年', { size: 30, color: C.dim })).join('')
        + `<path d="${lineP(miai)}" stroke="#d9b57a" stroke-width="9" fill="none" stroke-linecap="round"/><path d="${lineP(ren)}" stroke="${F}" stroke-width="9" fill="none" stroke-linecap="round"/>` },
    { at: .6, f: () => txt(X(1936), Yv(72) - 30, 'お見合い 7割以上', { size: 38, color: '#d9b57a', anchor: 'start' }) },
    { at: 4.6, f: () => `<circle cx="${X(1966)}" cy="${Yv(miai(1966))}" r="20" fill="none" stroke="${Y}" stroke-width="5"/>` + txt(X(1966), Yv(miai(1966)) - 46, '1960年代に逆転', { size: 42, color: Y }) },
    { at: 4.0, f: () => txt(x1 + 20, Yv(88), '恋愛', { size: 40, color: F, anchor: 'start' }) + txt(x1 + 20, Yv(8), 'お見合い', { size: 40, color: '#d9b57a', anchor: 'start' }) },
    { at: .3, f: () => note(1880, 1000 - 60, '※線の形はイメージ', 'end') }, ref(SR2),
  ], t); }, 1, { enter: 'right', zoom: 0 });
// 12 未婚女性1000人あたり：お見合いで結婚 30人 → 3人
SC[12] = K((t) => { const gone = Math.round(27 * ease(clamp((t - 5.2) / 3))); let g = '';
  for (let i = 0; i < 30; i++) { const x = 380 + (i % 10) * 120, y = 470 + Math.floor(i / 10) * 150, keep = i < 3; g += `<g opacity="${!keep && i >= 30 - gone ? .1 : 1}">${person(x, y, 90, '#d9b57a', 'f')}</g>`; }
  return R([
    { at: 0, f: () => head('未婚の女性1000人のうち、1年にお見合いで結婚する人', { y: 190 }) },
    { at: .3, slide: 0, f: () => g },
    { at: .3, slide: 0, f: () => `<g style="font-variant-numeric:tabular-nums">${txt(CX, 330, (t < 5.2 ? '1960年代　約30人' : '今　約' + (30 - gone) + '人'), { size: 56, color: Y, serif: true })}</g>` },
    ref(SR2),
  ], t); }, 1, { enter: 'right', zoom: 0 });
// 13 ここからが本題
SC[13] = K((t) => R([{ at: .5, f: (lt) => `<g transform="translate(${CX},560) scale(${pop(lt / .45)})">${txt(0, 0, 'ここからが本題', { size: 110, color: Y, serif: true })}</g>` }], t), 1, { enter: 'fade', zoom: 0 });
// 14 第2章
SC[14] = K((t) => R(chapEls('第2章', '会社が、仲人だった'), t), 2, { enter: 'zoom', zoom: 0 });
// 15 昭和のオフィス（イラスト）：1970年代、職場がトップに
SC[15] = K((t) => { let g = `<rect x="0" y="0" width="1920" height="1080" fill="#2a2218"/><rect x="0" y="640" width="1920" height="440" fill="#3a2e20"/>`;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { const x = 300 + c * 330 + r * 30, y = 520 + r * 150, sc = .8 + r * .15;
    g += `<g transform="translate(${x},${y}) scale(${sc})"><rect x="-90" y="0" width="180" height="16" fill="#7a6a50"/><rect x="-80" y="16" width="10" height="60" fill="#5a4a36"/><rect x="70" y="16" width="10" height="60" fill="#5a4a36"/><rect x="-36" y="-30" width="72" height="30" rx="4" fill="#4a4a46"/>${person(0, -30, 90, (r + c) % 3 ? '#8aa0c0' : '#d0a0b0', (r + c) % 3 ? 'm' : 'f')}</g>`; }
  g += `<rect width="1920" height="1080" fill="rgba(60,40,10,.18)"/>`;
  return R([
    { at: 0, slide: 0, f: () => g },
    { at: 1.2, f: () => card(440, 150, 1040, 200, { fill: 'rgba(20,16,10,.85)' }) + txt(CX, 230, '1970年代', { size: 48, color: C.dim }) + txt(CX, 310, '職場の出会いが、お見合いを抜いて1位に', { size: 46, color: Y }) },
    ref(SR2),
  ], t); }, 2, { enter: 'fade', zoom: 0 });
// 16 3組に1組
SC[16] = K((t) => R([
  ...[0, 1, 2].map(i => ({ at: .2 + i * .3, slide: 0, f: () => `<g transform="translate(${560 + i * 400},560) scale(4)">${i == 1 ? coupleC(0, 0, M, F, 1, 1) : coupleC(0, 0, '#5d5a66', '#6a6672')}</g>` })),
  { at: 1.8, f: () => txt(CX, 820, '職場結婚は、3組に1組', { size: 64, color: Y, serif: true }) },
  ref('岩澤・三田 (2005)／出生動向基本調査'),
], t), 2, { enter: 'right', zoom: 0 });
// 17 20代前半の女性：職場で出会って結婚する割合 1960年代 → 1970年代 で約2倍
SC[17] = K((t) => R([
  { at: 0, f: () => head('20代前半の女性：職場で出会って結婚する割合', { y: 190 }) },
  { at: .6, slide: 0, f: (lt) => { const h = 200 * easeOut(clamp(lt / .8)); return `<rect x="620" y="${800 - h}" width="200" height="${h}" rx="10" fill="#8a8478"/>` + txt(720, 860, '1960年代', { size: 38, color: C.dim }); } },
  { at: 3.0, slide: 0, f: (lt) => { const h = 400 * easeOut(clamp(lt / 1)); return `<rect x="1100" y="${800 - h}" width="200" height="${h}" rx="10" fill="${Y}"/>` + txt(1200, 860, '1970年代', { size: 38, color: Y }); } },
  { at: 4.4, f: (lt) => `<g transform="translate(1500,420) scale(${pop(lt / .4)})"><circle r="110" fill="${Y}"/>${txt(0, 24, '約2倍', { size: 62, color: '#111', shadow: false, serif: true })}</g>` },
  { at: .3, f: () => note(1880, 1000 - 60, '※棒の高さは目安', 'end') }, ref(SR2),
], t), 2, { enter: 'right', zoom: 0 });
// 18 結婚ブーム：式場の前に並ぶたくさんの夫婦（イラスト）
SC[18] = K((t) => { let g = `<path d="M560,520 L960,300 L1360,520Z" fill="#cfc8b8" opacity=".9"/><rect x="620" y="520" width="680" height="200" fill="#cfc8b8" opacity=".9"/><rect x="900" y="600" width="120" height="120" fill="#1b1a20" opacity=".6"/>` + txt(CX, 480, '結婚式場', { size: 34, color: '#1b1a20', shadow: false });
  for (let i = 0; i < 40; i++) { const r = Math.floor(i / 10), c = i % 10, a = clamp((t - .4 - i * .06) / .3); g += `<g opacity="${a}" transform="translate(${360 + c * 135 - r * 20},${790 + r * 40}) scale(${1.4 + r * .15})">${coupleC(0, 0, M, F)}</g>`; }
  return R([
    { at: 0, slide: 0, f: () => g },
    { at: 3.4, f: () => card(110, 150, 640, 190, { fill: 'rgba(20,24,36,.88)' }) + txt(430, 225, '1970年代前半', { size: 40, color: C.dim }) + txt(430, 300, '結婚ブーム', { size: 64, color: Y, serif: true }) },
    { at: 6.4, f: () => card(1170, 150, 640, 190, { fill: 'rgba(20,24,36,.88)' }) + txt(1490, 225, '支えたのは', { size: 40, color: C.dim }) + txt(1490, 300, '職場結婚', { size: 64, color: Y, serif: true }) },
    ref(SR2),
  ], t); }, 2, { enter: 'fade', zoom: 0 });
// 19 会社＝仲人
SC[19] = K((t) => R([
  { at: .2, f: (lt) => bldg(760, 780, 2.6 * pop(lt / .4), '#9aa6b8') },
  { at: 2.0, f: () => txt(1060, 560, '＝', { size: 120 }) },
  { at: 2.4, f: (lt) => `<g transform="scale(1)">${person(1380, 720, 220 * pop(lt / .4), '#d9b57a')}</g>` + txt(1600, 640, '仲人', { size: 72, color: '#d9b57a', serif: true, anchor: 'start' }) },
  { at: 4.6, f: () => txt(CX, 230, '当時の会社は、仲人の役割を果たしていた', { size: 52, color: Y, serif: true }) },
  ref(SR2),
], t), 2, { enter: 'right', zoom: 0 });
// 20 社員証・給料袋・上司
SC[20] = K((t) => R([
  { at: .2, f: (lt) => `<g transform="translate(460,540) scale(${pop(lt / .4)})"><rect x="-140" y="-90" width="280" height="180" rx="14" fill="#efeae0"/><rect x="-120" y="-60" width="80" height="100" fill="#9aa6b8"/>${txt(40, -20, '社員証', { size: 34, color: '#111', shadow: false })}<rect x="-20" y="10" width="130" height="10" fill="#bbb"/><rect x="-20" y="34" width="100" height="10" fill="#bbb"/></g>` + txt(460, 720, '終身雇用', { size: 44 }) },
  { at: 2.0, f: (lt) => `<g transform="translate(960,540) scale(${pop(lt / .4)})"><rect x="-110" y="-140" width="220" height="280" rx="8" fill="#d8c8a0"/>${txt(0, -60, '給料', { size: 52, color: '#3a2a10', shadow: false, serif: true })}<path d="M-60,30 L60,30 M-60,70 L40,70" stroke="#8a7a50" stroke-width="8"/></g>` + txt(960, 720, '年功序列', { size: 44 }) },
  { at: 4.8, f: (lt) => person(1460, 640, 180 * pop(lt / .4), '#8aa0c0') + bubble(1520, 330, 460, 110, 'いい人、紹介するぞ', { size: 36 }) + txt(1460, 720, '世話を焼く上司', { size: 44 }) },
  ref(SR2),
], t), 2, { enter: 'right', zoom: 0 });
// 21 社員旅行の宴会（浴衣の後ろ姿、イラスト）
SC[21] = K((t) => { let g = `<rect width="1920" height="1080" fill="#2a1e16"/><rect y="640" width="1920" height="440" fill="#6a5a30"/>` + [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${260 + i * 280}" cy="${160 + (i % 2) * 20}" r="34" fill="#e07050" opacity=".85"/><circle cx="${260 + i * 280}" cy="${160 + (i % 2) * 20}" r="60" fill="#ffb080" opacity=".15"/>`).join('');
  for (let r = 0; r < 2; r++) for (let c = 0; c < 8; c++) { const x = 220 + c * 210 + r * 100, y = 720 + r * 160, f = (c + r) % 2;
    g += `<g transform="translate(${x},${y}) scale(${1 + r * .2})"><circle cy="-120" r="30" fill="#1b1410"/><path d="M-50,40 L-40,-90 L40,-90 L50,40Z" fill="${f ? '#e8b8c8' : '#b8c8e8'}"/><rect x="-46" y="-30" width="92" height="12" fill="${f ? '#a04060' : '#40609a'}"/></g>`; }
  return R([
    { at: 0, slide: 0, f: () => g },
    ...['社員旅行', '運動会', '会社のサークル'].map((s0, i) => ({ at: 1.2 + i * 1.4, f: (lt) => `<g transform="translate(${480 + i * 480},380) scale(${pop(lt / .4)})"><rect x="-170" y="-50" width="340" height="100" rx="20" fill="rgba(20,16,10,.85)" stroke="${Y}" stroke-width="3"/>${txt(0, 16, s0, { size: 46, color: Y })}</g>` })),
    ref(SR2),
  ], t); }, 2, { enter: 'fade', zoom: 0 });
// 22 団塊の世代：地方の家から都会のビルへ、人の列
SC[22] = K((t) => { let g = house(260, 640, 1) + house(380, 760, .8) + house(200, 820, .7) + bldg(1520, 760, 2.2) + bldg(1720, 760, 1.6) + bldg(1340, 760, 1.4);
  for (let i = 0; i < 18; i++) { const u = ((t * .16 + i / 18) % 1), x = 420 + u * 880, y = 740 + Math.sin(i) * 30; g += `<g opacity="${Math.sin(Math.PI * u).toFixed(2)}">${person(x, y, 70, i % 2 ? M : F, i % 2 ? 'm' : 'f')}</g>`; }
  return R([
    { at: 0, slide: 0, f: () => g + txt(280, 900, '地方', { size: 40, color: C.dim }) + txt(1560, 900, '都会の会社', { size: 40, color: C.dim }) },
    { at: 1.0, f: () => txt(CX, 260, '団塊の世代', { size: 72, color: Y, serif: true }) },
    { at: 5.6, f: () => txt(CX, 360, '実家を離れた若い男女が、同じ職場に集まった', { size: 46 }) },
    ref(SR2),
  ], t); }, 2, { enter: 'right', zoom: 0 });
// 23 寿退社
SC[23] = K((t) => R([
  { at: .3, slide: 0, f: () => `<rect x="560" y="560" width="300" height="16" fill="#7a6a50"/>` + person(620 + 300 * ease(clamp((t - 4) / 3)), 560, 160, F, 'f') },
  { at: 2.2, f: (lt) => `<g transform="translate(1280,470) rotate(-6) scale(${pop(lt / .4)})"><rect x="-200" y="-90" width="400" height="180" rx="10" fill="#c43a3a"/><rect x="-185" y="-75" width="370" height="150" rx="6" fill="none" stroke="#f5d07a" stroke-width="4"/>${txt(0, 30, '寿退社', { size: 90, color: '#fff', serif: true, shadow: false })}</g>` },
  { at: 5.6, f: () => txt(CX, 820, '女性は「結婚したら辞める」前提で雇われることが多かった', { size: 44 }) },
  ref(SR2),
], t), 2, { enter: 'right', zoom: 0 });
// 24 歯車3つ：出会い／世話／寿退社
SC[24] = K((t) => R([
  { at: .2, f: () => gear(560, 560, 150, t * 40, '#9aa6b8', '出会い') },
  { at: 1.6, f: () => gear(960, 470, 120, -t * 50 + 18, '#d9b57a', '世話') },
  { at: 3.0, f: () => gear(1340, 580, 150, t * 40 + 9, F, '寿退社') },
  { at: 5.2, f: () => txt(CX, 860, '職場結婚は、この仕組みの上に乗っていた', { size: 52, color: Y, serif: true }) },
], t), 2, { enter: 'right', zoom: 0 });
// 25 第3章
SC[25] = K((t) => R(chapEls('第3章', '消えたのは、恋愛ではなかった'), t), 3, { enter: 'zoom', zoom: 0 });
// 26 運動会の旗が下りる
SC[26] = K((t) => { const k = ease(clamp((t - 2) / 3)); let flags = '';
  for (let i = 0; i < 12; i++) { const x = 200 + i * 140, y = 260 + Math.sin(i / 11 * Math.PI) * 60 + k * 600; flags += `<path d="M${x},${y} L${x + 130},${y + 4} L${x + 65},${y + 90}Z" fill="${['#e05050', '#f0c040', '#4f8fea', '#50b070'][i % 4]}" opacity="${1 - .6 * k}"/>`; }
  return R([
    { at: 0, slide: 0, f: () => `<path d="M200,${260 + k * 600} Q960,${380 + k * 600} 1880,${260 + k * 600}" stroke="#cfc8b8" stroke-width="3" fill="none" opacity="${1 - .6 * k}"/>` + flags },
    { at: .4, f: () => txt(CX, 180, '1990年代〜', { size: 60, color: Y, serif: true }) },
    { at: 2.4, f: () => txt(CX, 560, '社員旅行も運動会も、減っていった', { size: 52 }) },
    ref(SR2),
  ], t); }, 3, { enter: 'right', zoom: 0 });
// 27 上司が消え、部下も距離を置く
SC[27] = K((t) => R([
  { at: 0, slide: 0, f: () => `<g opacity="${1 - clamp((t - 1) / 2)}">${person(760, 640, 200, '#8aa0c0')}${bubble(820, 330, 420, 100, 'いい人、紹介…', { size: 34 })}</g>` },
  { at: 0, slide: 0, f: () => person(1160 + 200 * ease(clamp((t - 3) / 2.5)), 640, 180, M) },
  { at: 4.0, f: () => txt(CX, 860, '会社とは、ほどほどの距離で', { size: 52, color: Y, serif: true }) },
  ref(SR2),
], t), 3, { enter: 'right', zoom: 0 });
// 28 写真：終電の車内（長時間労働は変わらない）
SC[28] = K((t, dur) => photo('overtime', t, dur, .35, 1.0, 1.08, -60) + R([
  { at: 3.2, f: () => txt(CX, 300, '出会いの場は減ったのに', { size: 56, serif: true }) + txt(CX, 390, '探す時間もない', { size: 66, color: Y, serif: true }) },
  ref(SR2),
], t), 3, { enter: 'fade', zoom: 0 });
// 29 社員証がバラバラに
SC[29] = K((t) => { let g = ''; const k = ease(clamp((t - .8) / 2.5));
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, x = CX + Math.cos(a) * 420 * k + ((i % 3) - 1) * 150 * (1 - k), y = 540 + Math.sin(a) * 260 * k + (Math.floor(i / 3) - 1) * 110 * (1 - k);
    g += `<g transform="translate(${x},${y}) rotate(${k * (i * 37 % 60 - 30)})"><rect x="-70" y="-45" width="140" height="90" rx="10" fill="${i % 3 ? '#efeae0' : '#c9c2b4'}"/><rect x="-60" y="-32" width="40" height="52" fill="#9aa6b8"/></g>`; }
  return R([
    { at: 0, slide: 0, f: () => g },
    { at: 3.0, f: () => txt(CX, 920, '正社員ではない働き方が増え、同じ職場に長くいる人も減った', { size: 42 }) },
    ref(SR2),
  ], t); }, 3, { enter: 'right', zoom: 0 });
// 30 2000年ごろ：友人・きょうだいが1位、職場は2位
SC[30] = K((t) => { const sw = ease(clamp((t - 1.6) / 1.2)); return R([
  { at: 0, f: () => head('2000年ごろ', { y: 190 }) },
  { at: 0, slide: 0, f: () => { const yA = 420 + 200 * sw, yB = 620 - 200 * sw;
    return `<rect x="560" y="${yA - 60}" width="800" height="120" rx="16" fill="rgba(255,214,102,.15)" stroke="${Y}" stroke-width="3"/>` + txt(CX, yA + 16, '職場や仕事で', { size: 52, color: Y })
      + `<rect x="560" y="${yB - 60}" width="800" height="120" rx="16" fill="rgba(255,255,255,.08)" stroke="#cfd4dc" stroke-width="3"/>` + txt(CX, yB + 16, '友人・きょうだいの紹介', { size: 52 })
      + txt(470, 436, '1位', { size: 52, color: Y, serif: true }) + txt(470, 636, '2位', { size: 52, color: C.dim, serif: true }); } },
  ref(SR2),
], t); }, 3, { enter: 'right', zoom: 0 });
// 31 研究者の計算：電卓
SC[31] = K((t) => R([
  { at: .2, f: (lt) => `<g transform="translate(${CX},520) scale(${pop(lt / .4)})"><rect x="-150" y="-210" width="300" height="420" rx="24" fill="#2b2f3a" stroke="#cfd4dc" stroke-width="4"/><rect x="-120" y="-180" width="240" height="90" rx="8" fill="#9fd0a0"/>${txt(100, -118, '?', { size: 60, color: '#1b3a1b', anchor: 'end', shadow: false })}${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<rect x="${-110 + c * 80}" y="${-60 + r * 64}" width="60" height="48" rx="8" fill="#4a4f5c"/>`).join('')).join('')}</g>` },
  { at: 1.4, f: () => txt(CX, 860, '研究者の、面白い計算', { size: 56, color: Y, serif: true }) },
  ref(SR2),
], t), 3, { enter: 'fade', zoom: 0 });


// ===== 第3章 後半 =====
const IMGN = (s0 = '※形はイメージ') => ({ at: .3, f: () => note(1880, 1000 - 60, s0, 'end') });
const pieSeg = (cx, cy, r, a0, a1, col, ex = 0) => { const m = (a0 + a1) / 2, dx = Math.cos(m) * ex, dy = Math.sin(m) * ex, P = (a) => [cx + dx + Math.cos(a) * r, cy + dy + Math.sin(a) * r], p0 = P(a0), p1 = P(a1);
  return `<path d="M${cx + dx},${cy + dy} L${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p1[0].toFixed(1)},${p1[1].toFixed(1)}Z" fill="${col}"/>`; };
// 32 女性が結婚する割合が下がっていく（1972→2002）
SC[32] = K((t) => { const x0 = 360, x1 = 1560, k = clamp((t - .4) / 5), X = (u) => x0 + u * (x1 - x0), Yv = (u) => 360 + 380 * (u * u * .3 + u * .7);
  let d = ''; for (let i = 0; i <= 40; i++) { const u = i / 40 * k; d += (i ? 'L' : 'M') + X(u).toFixed(1) + ',' + Yv(u).toFixed(1); }
  return R([
    { at: 0, f: () => head('日本の女性が結婚する割合', { y: 190 }) },
    { at: 0, slide: 0, f: () => `<rect x="${x0}" y="820" width="${x1 - x0}" height="3" fill="#6b665e"/>` + txt(x0, 870, '1972年', { size: 36, color: C.dim }) + txt(x1, 870, '2002年', { size: 36, color: C.dim }) + `<path d="${d}" stroke="${F}" stroke-width="10" fill="none" stroke-linecap="round"/>` },
    { at: 6.0, f: () => `<path d="M${x1 + 40},${Yv(0)} L${x1 + 40},${Yv(1)}" stroke="${Y}" stroke-width="6"/>` + txt(x1 + 70, (Yv(0) + Yv(1)) / 2 + 14, '下がった分', { size: 44, color: Y, anchor: 'start' }) },
    { at: 8.0, f: () => txt(CX, 300, 'これを、出会い方ごとに分けると？', { size: 48, serif: true }) },
    IMGN('※線の形はイメージ'), ref(SR2),
  ], t); }, 3, { enter: 'fade', zoom: 0 });
// 33-34 円グラフ：見合い 約5割／職場 約4割
const PIE = (t, glowBoth) => { const a0 = -Math.PI / 2, k = easeOut(clamp(t / 1.4)), A = (f) => a0 + Math.PI * 2 * f * k;
  return pieSeg(760, 560, 280, a0, A(.5), '#d9b57a', glowBoth ? 14 : 0) + pieSeg(760, 560, 280, A(.5), A(.88), Y, glowBoth ? 14 : 0) + pieSeg(760, 560, 280, A(.88), A(1), '#5d5a66'); };
SC[33] = K((t) => R([
  { at: 0, f: () => head('結婚が減った分の内訳（1972→2002）', { y: 190 }) },
  { at: .3, slide: 0, f: (lt) => PIE(lt, false) },
  { at: 1.8, f: () => txt(1180, 460, 'お見合いの減少', { size: 46, color: '#d9b57a', anchor: 'start' }) + txt(1180, 540, '約5割', { size: 80, color: '#d9b57a', anchor: 'start', serif: true }) },
  { at: 4.2, f: () => txt(1180, 680, '職場結婚の減少', { size: 46, color: Y, anchor: 'start' }) + txt(1180, 760, '4割近く', { size: 80, color: Y, anchor: 'start', serif: true }) },
  ref(SR2),
], t), 3, { enter: 'right', zoom: 0 });
SC[34] = K((t) => R([
  { at: 0, f: () => head('結婚が減った分の内訳（1972→2002）', { y: 190 }) },
  { at: 0, slide: 0, f: () => PIE(9, true) + `<circle cx="760" cy="560" r="${300 + 10 * Math.sin(t * 4)}" fill="none" stroke="${Y}" stroke-width="4" opacity=".6"/>` },
  { at: .3, f: () => txt(1180, 520, '見合い ＋ 職場', { size: 56, color: Y, anchor: 'start' }) + txt(1180, 620, 'ほとんど説明できる', { size: 52, anchor: 'start', serif: true }) },
  ref(SR2),
], t), 3, { enter: 'fade', zoom: 0 });
// 35 学校・友人・街なか/趣味 はほぼ横ばい（イメージ）
SC[35] = K((t) => { const x0 = 360, x1 = 1500, k = clamp((t - .4) / 4.5); const ln = (y0, col) => `<path d="M${x0},${y0} ${[...Array(20)].map((_, i) => `L${(x0 + (x1 - x0) * (i + 1) / 20 * k).toFixed(1)},${(y0 + Math.sin(i * 1.7) * 6).toFixed(1)}`).join(' ')}" stroke="${col}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  return R([
    { at: 0, f: () => head('ほかの出会い方は？（40年間）', { y: 190 }) },
    { at: 0, slide: 0, f: () => ln(420, '#9fd0a0') + ln(580, '#cfd4dc') + ln(740, '#c9a0e0') + `<rect x="${x0}" y="840" width="${x1 - x0}" height="3" fill="#6b665e"/>` },
    { at: 1.6, f: () => txt(x1 + 30, 432, '学校', { size: 40, color: '#9fd0a0', anchor: 'start' }) + txt(x1 + 30, 592, '友人の紹介', { size: 40, color: '#cfd4dc', anchor: 'start' }) + txt(x1 + 30, 752, '街なか・趣味', { size: 40, color: '#c9a0e0', anchor: 'start' }) },
    { at: 6.4, f: () => txt(CX, 920, 'ほとんど変わっていなかった', { size: 52, color: Y, serif: true }) },
    IMGN('※線の形はイメージ'), ref(SR2),
  ], t); }, 3, { enter: 'right', zoom: 0 });
// 36 『恋愛』は残り、『仕組み』が消える
SC[36] = K((t) => { const k = ease(clamp((t - 2.4) / 1.6)); return R([
  { at: .2, f: (lt) => tag2(620, 520, '恋愛', F, pop(lt / .4)) },
  { at: .8, slide: 0, f: () => `<g opacity="${1 - k}" transform="translate(0,${-60 * k})">${tag2(1300, 520, '出会いの仕組み', '#cfd4dc', 1)}</g>` },
  { at: 4.4, f: () => txt(CX, 820, '減ったのは、出会いを用意してくれる仕組み', { size: 50, color: Y, serif: true }) },
], t); }, 3, { enter: 'right', zoom: 0 });
const tag2 = (x, y, s0, col, sc) => `<g transform="translate(${x},${y}) scale(${sc})"><rect x="-260" y="-80" width="520" height="160" rx="26" fill="rgba(255,255,255,.06)" stroke="${col}" stroke-width="4"/>${txt(0, 22, s0, { size: 64, color: col, serif: true })}</g>`;
// 37 仲人2人：家と会社
SC[37] = K((t) => R([
  { at: .2, f: (lt) => house(560, 520, 1.4 * pop(lt / .4)) + person(560, 700, 110, '#d9b57a') + txt(560, 880, '親・近所', { size: 40, color: '#d9b57a' }) },
  { at: 3.4, f: (lt) => bldg(1360, 600, 1.6 * pop(lt / .4)) + person(1360, 700, 110, '#8aa0c0') + txt(1360, 880, '会社・上司', { size: 40, color: '#8aa0c0' }) },
  { at: 6.0, f: () => txt(CX, 230, '本人の代わりに、相手を見つけてくれる人がいた', { size: 48, color: Y, serif: true }) },
  ref(SR2),
], t), 3, { enter: 'right', zoom: 0 });
// 38 会社がまた仲人に？ → ×
SC[38] = K((t) => R([
  { at: .2, f: () => bldg(CX, 720, 2.4) + txt(CX, 260, '会社が、また仲人に？', { size: 60, serif: true }) },
  { at: 4.0, f: (lt) => { const k = easeOut(clamp(lt / .5)); return `<path d="M${CX - 200},${360} L${CX - 200 + 400 * k},${360 + 400 * k} M${CX + 200},${360} L${CX + 200 - 400 * k},${360 + 400 * k}" stroke="#e0453a" stroke-width="26" stroke-linecap="round"/>`; } },
  { at: 5.0, f: () => txt(CX, 880, '研究者「それは難しい」', { size: 48, color: Y }) },
  ref(SR2),
], t), 3, { enter: 'right', zoom: 0 });
// 39 昔には戻れない
SC[39] = K((t) => R([
  { at: .3, f: (lt) => `<g transform="translate(560,420) scale(${pop(lt / .4)})">${person(0, 120, 150, '#8aa0c0')}${bubble(60, -160, 380, 100, '結婚はまだか？', { size: 34 })}</g>` + txt(560, 760, 'ハラスメントと言われかねない', { size: 36, color: '#ff8a7a' }) },
  { at: 4.0, f: (lt) => `<g transform="translate(1360,460) scale(${pop(lt / .4)}) rotate(-5)"><rect x="-150" y="-60" width="300" height="120" rx="10" fill="#7a3a3a"/>${txt(0, 20, '寿退社', { size: 56, color: '#ddd', serif: true, shadow: false })}</g><path d="M1220,420 L1500,500" stroke="#e0453a" stroke-width="10"/>` + txt(1360, 760, '当たり前だった時代にも', { size: 36, color: '#ff8a7a' }) },
  { at: 6.2, f: () => txt(CX, 860, '昔には、戻れない', { size: 72, color: Y, serif: true }) },
  ref(SR2),
], t), 3, { enter: 'right', zoom: 0 });
// 40 仕事と家庭の天秤（両立）
SC[40] = K((t) => { const tilt = 6 * Math.sin(t * 1.4) * Math.exp(-t * .4); return R([
  { at: .2, slide: 0, f: () => `<path d="M${CX},860 L${CX - 60},940 L${CX + 60},940Z" fill="#8a8478"/><rect x="${CX - 6}" y="420" width="12" height="440" fill="#8a8478"/><g transform="translate(${CX},430) rotate(${tilt})"><rect x="-460" y="-6" width="920" height="12" rx="6" fill="#cfc8b8"/><g transform="translate(-400,0) rotate(${-tilt})">${bldg(0, 260, .9)}${txt(0, 320, '仕事', { size: 44 })}</g><g transform="translate(400,0) rotate(${-tilt})">${house(0, 200, .9)}${txt(0, 320, '家庭', { size: 44 })}</g></g>` },
  { at: 2.0, f: () => txt(CX, 240, '研究者のすすめ：両立できるように支える', { size: 48, color: Y, serif: true }) },
  ref(SR2),
], t); }, 3, { enter: 'right', zoom: 0 });

// ===== 第4章 =====
SC[41] = K((t) => R(chapEls('第4章', 'アプリは、新しい仲人か'), t), 4, { enter: 'zoom', zoom: 0 });
// 42-44 ランキング（2018〜21年に結婚）
const RANK = [['友人・きょうだい', 25.9, '#cfd4dc'], ['職場や仕事で', 21.4, '#c9a24a'], ['学校で', 14.1, '#9fd0a0'], ['ネットで', 13.6, CY2], ['お見合いで', 9.0, '#d9b57a']];
const rankRow = (i, prog, hi) => { const r = RANK[i], y = 330 + i * 120, w = r[1] * 34 * easeOut(clamp(prog));
  return `<g opacity="${hi === undefined || hi.includes(i) ? 1 : .35}">${txt(300, y + 56, (i + 1) + '位', { size: 46, color: i == 0 ? Y : '#fff', serif: true })}${txt(810, y + 56, r[0], { size: 40, anchor: 'end' })}<rect x="840" y="${y + 10}" width="${w}" height="72" rx="10" fill="${r[2]}"/>${prog >= .9 ? txt(860 + w, y + 62, r[1] + '%', { size: 46, anchor: 'start', serif: true, color: r[2] }) : ''}</g>`; };
SC[42] = K((t) => R([
  { at: 0, f: () => head('出会い方ランキング（2018〜2021年に結婚）', { y: 190 }) },
  { at: .6, slide: 0, f: () => [0, 1, 2, 3, 4].map(i => `<rect x="260" y="${340 + i * 120}" width="1400" height="92" rx="12" fill="none" stroke="#3a3842" stroke-width="3" stroke-dasharray="10 8"/>`).join('') },
  ref(SURVEY),
], t), 4, { enter: 'right', zoom: 0 });
SC[43] = K((t) => R([
  { at: 0, f: () => head('出会い方ランキング（2018〜2021年に結婚）', { y: 190 }) },
  { at: 0, slide: 0, f: () => [0, 1, 2].map(i => rankRow(i, (t - .6 - i * 2.8) / 1)).join('') },
  ref(SURVEY),
], t), 4, { enter: 'fade', zoom: 0 });
SC[44] = K((t) => R([
  { at: 0, f: () => head('出会い方ランキング（2018〜2021年に結婚）', { y: 190 }) },
  { at: 0, slide: 0, f: () => [0, 1, 2].map(i => rankRow(i, 2, [3, 4])).join('') + rankRow(3, (t - .3) / 1) + rankRow(4, (t - 2.4) / 1) },
  { at: 4.0, f: () => `<path d="M1500,800 C1640,760 1640,700 1500,690" stroke="${Y}" stroke-width="6" fill="none"/>` + txt(1560, 905, 'ネットがお見合いを上回った', { size: 40, color: Y }) },
  ref(SURVEY),
], t), 4, { enter: 'fade', zoom: 0 });
// 45 交際4.3年、夫30.7歳／妻29.1歳
SC[45] = K((t) => R([
  { at: .3, f: (lt) => `<g transform="translate(560,540) scale(${pop(lt / .4)})"><rect x="-200" y="-200" width="400" height="400" rx="20" fill="#efeae0"/><rect x="-200" y="-200" width="400" height="90" rx="20" fill="#c43a3a"/>${txt(0, -138, '付き合った期間', { size: 34, color: '#fff', shadow: false })}${txt(0, 60, '4.3年', { size: 120, color: '#111', shadow: false, serif: true })}</g>` },
  { at: 4.0, f: () => person(1200, 600, 180, M) + txt(1200, 840, '夫 30.7歳', { size: 46, color: M, serif: true }) },
  { at: 6.0, f: () => person(1560, 600, 180, F, 'f') + txt(1560, 840, '妻 29.1歳', { size: 46, color: F, serif: true }) },
  { at: 10.0, f: () => txt(CX, 880, '出会ってから結婚まで、思ったより長い', { size: 50, color: Y, serif: true }) },
  ref(SURVEY),
], t), 4, { enter: 'right', zoom: 0 });
// 46 2019〜21年に絞るとネット15.2%
SC[46] = K((t) => R([
  { at: 0, f: () => head('2019〜2021年に結婚した夫婦に絞ると', { y: 190 }) },
  { at: .5, slide: 0, f: (lt) => { const w = 15.2 * 50 * easeOut(clamp(lt / 1.2)); return txt(560, 560, 'ネットで', { size: 48, anchor: 'end', color: CY2 }) + `<rect x="600" y="500" width="${w}" height="110" rx="14" fill="${CY2}"/>` + (lt > 1.1 ? txt(620 + w, 580, '15.2%', { size: 90, anchor: 'start', color: CY2, serif: true }) : ''); } },
  { at: 3.6, f: () => txt(CX, 800, '15%を超えた', { size: 60, color: Y, serif: true }) },
  ref('出生動向基本調査 報告書 (2023)'),
], t), 4, { enter: 'right', zoom: 0 });
// 47 3D：在宅勤務の部屋（ノートPCとスマホの光）／55 夜のワンルーム（スマホの光の後ろ姿）
function room(mode) { return () => {
  const S = makeScene({ bg: '#0c0e14', hemi: mode === 'wfh' ? .55 : .5, exposure: 1.15, sky: '#8090b0', ground: '#201812', bloom: .2, bloomTh: .85, fov: 34 });
  const s = S.s; box(s, 8, .05, 8, mat('#3a2e24'), 0, 0, 0); box(s, 8, 3, .1, mat('#2a2c34'), 0, 1.5, -2.5); box(s, .1, 3, 8, mat('#262830'), -3, 1.5, 1);
  box(s, 1.4, .9, .05, glow('#2a3a5a', .5), -1.2, 1.7, -2.44);   // 夜の窓
  box(s, 1.4, .06, .7, mat('#5a4a3a'), .6, .74, -1.4); for (const x of [0, 1.2]) for (const z of [-1.7, -1.1]) box(s, .05, .72, .05, mat('#3a3028'), x, .36, z);
  if (mode === 'wfh') { box(s, .5, .02, .34, mat('#333'), .6, .78, -1.35); const sc = box(s, .5, .32, .02, glow('#bcd4ff', .9), .6, .94, -1.52); sc.rotation.x = -.2; lamp(s, '#bcd4ff', .9, 3, .6, 1.0, -1.2, false); }
  const ph = box(s, .08, .005, .15, glow('#d8e8ff', 1.2), mode === 'wfh' ? 1.1 : .55, mode === 'wfh' ? .78 : 1.12, mode === 'wfh' ? -1.25 : -.85); lamp(s, '#c8dcff', mode === 'wfh' ? .4 : .9, 2.5, ph.position.x, ph.position.y + .2, ph.position.z + .1, false);
  const p = person3(s, { seated: true, back: true, top: mode === 'wfh' ? '#5a6a7a' : '#3a3a48', bottom: '#2a2a30', hairStyle: 'short' }); p.position.set(.6, .02, -.75); p.rotation.y = Math.PI;
  if (mode !== 'wfh') { ph.rotation.x = 1.1; }
  box(s, .5, .45, .5, mat('#4a3a30'), .6, .22, -.65);
  lamp(s, '#ffd9a0', mode === 'wfh' ? .35 : .3, 5, -1.5, 2.6, 1, false);
  return { render() { S.render(); }, update(t, dur) { const k = ease(t / dur); S.cam.position.set(lerp(-.3, .2, k), lerp(1.7, 1.6, k), lerp(1.9, 1.5, k)); S.cam.lookAt(.6, 1.0, -1.2); return ''; } }; }; }
SC[47] = { build: room('wfh') };
// 48 スマホ＝新しい仲人
SC[48] = K((t) => R([
  { at: .2, f: (lt) => phone(760, 560, 2.4 * pop(lt / .4)) },
  { at: 1.0, slide: 0, f: () => [0, 1, 2, 3, 4, 5].map(i => { const a = i / 6 * Math.PI * 2 + t * .4; return person(760 + Math.cos(a) * 360, 600 + Math.sin(a) * 220, 70, i % 2 ? M : F, i % 2 ? 'm' : 'f'); }).join('') },
  { at: 2.0, f: () => txt(1240, 420, '条件を入れれば、候補を探してくれる', { size: 40, anchor: 'start' }) },
  { at: 5.0, f: () => txt(1240, 560, '新しい仲人？', { size: 80, color: Y, serif: true, anchor: 'start' }) },
], t), 4, { enter: 'right', zoom: 0 });
// 49-51 ネットはどっちに数える？
const stack = (x, parts, k) => { let y = 820, out = ''; for (const [v, col, lab] of parts) { const h = v * 6 * k; y -= h; out += `<rect x="${x - 110}" y="${y}" width="220" height="${h}" fill="${col}"/>` + (k > .9 && lab ? txt(x + 140, y + h / 2 + 12, lab, { size: 34, color: col, anchor: 'start' }) : ''); } return out; };
SC[49] = K((t) => R([
  { at: 0, f: () => head('国の報告書の分け方', { y: 190 }) },
  { at: .4, slide: 0, f: (lt) => stack(760, [[66, F, '恋愛結婚'], [15, CY2, 'ネット'], [10, '#d9b57a', 'お見合い']], easeOut(clamp(lt / 1.2))) },
  { at: 4.0, f: () => `<path d="M1180,380 L1180,520" stroke="${F}" stroke-width="8"/><path d="M1160,500 L1180,540 L1200,500Z" fill="${F}"/>` + txt(1220, 470, '恋愛結婚が下がって見える', { size: 40, color: F, anchor: 'start' }) },
  IMGN('※高さはイメージ'), ref('出生動向基本調査 報告書 (2023)'),
], t), 4, { enter: 'right', zoom: 0 });
SC[50] = K((t) => R([
  { at: .2, f: () => phone(640, 560, 1.8) },
  { at: 1.2, slide: 0, f: () => [0, 1, 2].map(i => `<g opacity="${clamp((t - 1.2 - i * .6) / .4)}">${person(900 + i * 130, 620, 100, M)}${person(960 + i * 130, 620, 100, F, 'f')}</g>`).join('') + txt(1030, 760, '何度もデート', { size: 36, color: C.dim }) },
  { at: 3.4, f: (lt) => `<g transform="translate(1580,460) scale(${pop(lt / .4)})"><path d="M0,30 C-60,-10 -40,-70 0,-40 C40,-70 60,-10 0,30Z" fill="${F}" transform="scale(2)"/>${txt(0, 20, '？', { size: 80, color: '#fff' })}</g>` + txt(1580, 640, '恋愛結婚じゃないの？', { size: 40, color: F }) },
], t), 4, { enter: 'right', zoom: 0 });
SC[51] = K((t) => R([
  { at: 0, f: () => head('同じ数字でも、分け方で見え方が変わる', { y: 190 }) },
  { at: .3, slide: 0, f: () => stack(560, [[66, F, ''], [15, CY2, ''], [10, '#d9b57a', '']], 1) + txt(560, 880, 'ネット＝別の箱', { size: 36, color: C.dim }) },
  { at: 2.0, slide: 0, f: (lt) => stack(1300, [[66, F, ''], [15, F, ''], [10, '#d9b57a', '']], easeOut(clamp(lt / 1))) + txt(1300, 880, 'ネット＝恋愛に入れる', { size: 36, color: F }) },
  { at: 4.6, f: () => txt(CX, 300, '数字を見るときは、分け方にも注意', { size: 46, color: Y, serif: true }) },
  IMGN('※高さはイメージ'),
], t), 4, { enter: 'fade', zoom: 0 });
// 52 未婚の男女（18〜34歳）
SC[52] = K((t) => { let g = ''; for (let i = 0; i < 20; i++) { const a = clamp((t - .4 - i * .08) / .3); g += `<g opacity="${a}">${person(300 + (i % 10) * 145, 520 + Math.floor(i / 10) * 220, 110, i % 2 ? F : M, i % 2 ? 'f' : 'm')}</g>`; }
  return R([{ at: 0, slide: 0, f: () => g }, { at: 1.2, f: () => txt(CX, 230, '18〜34歳の、結婚していない人たち', { size: 52, serif: true }) }, ref(SURVEY)], t); }, 4, { enter: 'right', zoom: 0 });
// 53-54 いずれ結婚するつもり 81.4/84.3 → 恋人がいる 21.1/27.8
const vbar = (x, v, col, lab, k) => { const h = v * 5.2 * easeOut(clamp(k)); return `<rect x="${x - 90}" y="${820 - h}" width="180" height="${h}" rx="10" fill="${col}"/>` + (k > .9 ? txt(x, 800 - h, v + '%', { size: 56, color: col, serif: true }) : '') + txt(x, 880, lab, { size: 40, color: col }); };
SC[53] = K((t) => R([
  { at: 0, f: () => head('「いずれ結婚するつもり」', { y: 190 }) },
  { at: .5, slide: 0, f: (lt) => vbar(760, 81.4, M, '男性', lt / 1.2) },
  { at: 1.6, slide: 0, f: (lt) => vbar(1160, 84.3, F, '女性', lt / 1.2) },
  { at: 6.0, f: () => txt(CX, 260, '今でも8割を超える', { size: 52, color: Y, serif: true }) },
  ref(SURVEY),
], t), 4, { enter: 'right', zoom: 0 });
SC[54] = K((t) => R([
  { at: 0, f: () => head('「今、恋人と付き合っている」', { y: 190 }) },
  { at: 0, slide: 0, f: () => `<g opacity=".25">${vbar(560, 81.4, M, '', 2)}${vbar(960, 84.3, F, '', 2)}</g>` },
  { at: .8, slide: 0, f: (lt) => vbar(760, 21.1, M, '男性', lt / 1.2) },
  { at: 2.6, slide: 0, f: (lt) => vbar(1160, 27.8, F, '女性', lt / 1.2) },
  { at: .3, f: () => txt(1640, 520, '薄い棒：', { size: 32, color: C.dim }) + txt(1640, 570, '結婚するつもり', { size: 32, color: C.dim }) },
  ref(SURVEY),
], t), 4, { enter: 'fade', zoom: 0 });
SC[55] = { build: room('night') };

// ===== エピローグ =====
SC[56] = K((t) => R([
  { at: .2, f: (lt) => bldg(CX, 720, 2.2 * pop(lt / .4)) },
  { at: 1.4, f: () => txt(CX, 260, '職場結婚が減ったのは、気のせいではない', { size: 52, color: Y, serif: true }) },
], t), 5, { enter: 'fade', zoom: 0 });
SC[57] = K((t) => { const sp = Math.max(0, 1 - t / 4); return R([
  { at: 0, slide: 0, f: () => gear(560, 560, 150, 40 * (t - t * t / 8 * (t < 4 ? 1 : 0)) * 1, '#9aa6b8', '出会い') + gear(960, 470, 120, -50 * Math.min(t, 4) * .5 + 18, '#d9b57a', '世話') + gear(1340, 580, 150, 40 * Math.min(t, 4) * .5 + 9, F, '寿退社') },
  { at: 4.4, f: () => txt(CX, 860, 'なくなったのは、恋愛ではなく、仕組みの方', { size: 50, color: Y, serif: true }) },
], t); }, 5, { enter: 'right', zoom: 0 });
SC[58] = K((t) => R([
  { at: .2, f: (lt) => house(460, 560, 1.3 * pop(lt / .4)) + txt(460, 700, '家が仲人', { size: 44, color: '#d9b57a' }) },
  { at: 1.6, f: () => arrow(620, 540, 780, 540, '#cfc8b8', 1, 8) },
  { at: 2.2, f: (lt) => bldg(CX, 640, 1.2 * pop(lt / .4)) + txt(CX, 700, '会社が仲人', { size: 44, color: '#9aa6b8' }) },
  { at: 3.6, f: () => arrow(1120, 540, 1280, 540, '#cfc8b8', 1, 8) },
  { at: 4.2, f: (lt) => phone(1460, 520, 1.1 * pop(lt / .4)) + txt(1460, 700, 'スマホが仲人？', { size: 44, color: CY2 }) },
], t), 5, { enter: 'right', zoom: 0 });
SC[59] = K((t) => R([
  { at: .3, f: (lt) => `<g transform="translate(${CX},460) scale(${pop(lt / .45)})"><rect x="-150" y="-110" width="300" height="200" rx="30" fill="${Y}"/><path d="M-40,88 L-70,150 L20,90Z" fill="${Y}"/>${[-60, 0, 60].map(x => `<circle cx="${x}" cy="-10" r="16" fill="#1b1a20"/>`).join('')}</g>` },
  { at: 1.0, f: () => txt(CX, 720, 'あなたの周りの夫婦は、どこで出会った？', { size: 54, serif: true }) },
  { at: 2.6, f: () => txt(CX, 810, 'コメント欄で教えてください', { size: 42, color: C.dim }) },
], t), 5, { enter: 'right', zoom: 0 });
SC[60] = K((t) => R([
  { at: .3, f: () => txt(CX, 380, '今日のネタバレは、ここまで', { size: 64, serif: true }) },
  { at: 2.0, f: (lt) => `<g transform="translate(${CX - 230},600) scale(${pop(lt / .4)})"><rect x="-200" y="-56" width="400" height="112" rx="56" fill="#e0453a"/>${txt(0, 16, 'チャンネル登録', { size: 44, color: '#fff' })}</g>` },
  { at: 2.6, f: (lt) => `<g transform="translate(${CX + 230},600) scale(${pop(lt / .4)})"><rect x="-200" y="-56" width="400" height="112" rx="56" fill="rgba(255,255,255,.1)" stroke="#fff" stroke-width="3"/>${txt(0, 16, '高評価', { size: 44, color: '#fff' })}</g>` },
  { at: 4.8, f: () => txt(CX, 820, 'また次のネタバレで', { size: 44, color: Y }) },
], t), 5, { enter: 'right', zoom: 0 });

export const SCENES = SC;
