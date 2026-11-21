// 04 マスク — 全場面 紙芝居。字幕は灰色の帯（body.band）。男性=青 女性=ピンク 強調=黄
import { maps, C, W, H, SERIF, clamp, ease, easeOut, pop, txt, note, head, counter, icon, person, card, arrow, stamp, bubble,
  vbars, timeline, worldMap, worldCentroid, japanMap, loadMaps, run, kami } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}

const M = '#4f8fea', F = '#ef7fa8', Y = C.gold, CX = 960;
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', '第5章', 'エピローグ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, ...o });
const R = (els, t) => run(els.map(e => e.f ? e : { ...e, f: () => '' }), t);

// ---- 顔のピクト：mask: 'w'白 'b'青(医療) 'k'黒 'c'布 'g'灰 / cover:'book' 'top' / nose:1 鼻すじ 2 鼻全部 / q:？顔
function face(x, y, r, col, o = {}) {
  let s = `<g transform="translate(${x},${y})"><circle r="${r}" fill="${col}"/>`;
  if (!o.top) s += `<circle cx="${-r * .34}" cy="${-r * .12}" r="${r * .09}" fill="#1b1a20"/><circle cx="${r * .34}" cy="${-r * .12}" r="${r * .09}" fill="#1b1a20"/>`;
  if (o.q) s += txt(0, r * .62, '？', { size: r * .9, color: '#1b1a20', shadow: false });
  else if (!o.mask && !o.cover) s += `<path d="M${-r * .25},${r * .38} Q0,${r * .55} ${r * .25},${r * .38}" stroke="#1b1a20" stroke-width="${r * .07}" fill="none" stroke-linecap="round"/>`;
  const mc = { w: '#f4f4f2', b: '#8fc3ea', k: '#26252b', c: '#c9b7a0', g: '#9a9aa2' }[o.mask];
  if (mc) { const top = o.nose === 2 ? r * .42 : o.nose === 1 ? r * .2 : r * .02;
    s += `<path d="M${-r * .72},${top} Q0,${top - r * .12} ${r * .72},${top} L${r * .62},${r * .7} Q0,${r * .92} ${-r * .62},${r * .7} Z" fill="${mc}" stroke="rgba(0,0,0,.25)" stroke-width="${r * .03}"/>`
      + (o.mask === 'c' ? '' : [0.3, 0.48].map(k => `<path d="M${-r * .6},${top + r * k} Q0,${top + r * (k - .08)} ${r * .6},${top + r * k}" stroke="rgba(0,0,0,.18)" stroke-width="${r * .03}" fill="none"/>`).join(''))
      + `<path d="M${-r * .72},${top + r * .1} L${-r * .98},${-r * .05} M${r * .72},${top + r * .1} L${r * .98},${-r * .05}" stroke="${mc}" stroke-width="${r * .05}"/>`;
    if (o.nose === 2) s += `<path d="M0,${r * .1} l${-r * .08},${r * .2} h${r * .16}z" fill="rgba(0,0,0,.3)"/>`; }
  if (o.cover === 'book') s += `<rect x="${-r * 1.05}" y="${r * .05}" width="${r * 2.1}" height="${r * 1.0}" rx="${r * .06}" fill="#18171c" stroke="#3a3940" stroke-width="${r * .04}"/>`;
  if (o.top) s += `<rect x="${-r * 1.05}" y="${-r * 1.05}" width="${r * 2.1}" height="${r * 1.0}" rx="${r * .06}" fill="#18171c"/>`;
  return s + '</g>';
}
const pin = (x, y, label, col = Y) => `<g transform="translate(${x},${y})"><path d="M0,0 C-26,-34 -26,-62 0,-62 C26,-62 26,-34 0,0Z" fill="${col}"/><circle cy="-42" r="9" fill="#1b1a20"/></g>` + txt(x, y + 46, label, { size: 34 });
const bar = (x, base, w, h, col, label, lab2) => `<rect x="${x - w / 2}" y="${base - h}" width="${w}" height="${Math.max(h, 0)}" rx="8" fill="${col}"/>` + txt(x, base + 46, label, { size: 32 }) + (lab2 ? txt(x, base - h - 18, lab2, { size: 34, color: col }) : '');
const avgLine = (x1, x2, y, lt = 1) => `<path d="M${x1},${y} h${(x2 - x1) * easeOut(lt / .8)}" stroke="${Y}" stroke-width="4" stroke-dasharray="14 10"/>` + txt(x2 + 10, y + 12, '平均', { size: 30, color: Y, anchor: 'start', op: clamp(lt / .8) });
const ref = (s) => ({ at: .6, f: () => note(1880, 125, s, 'end') });
const IM = { at: .8, f: () => note(1880, 160, '※グラフはイメージ（数値は省略）', 'end') };
const chapEls = (num, title) => [
  { at: 0, out: 3.0, slide: 0, f: () => txt(CX, 400, num, { size: 40, color: C.o, serif: true, ls: 10 }) },
  { at: .25, out: 3.0, f: () => txt(CX, 530, title, { size: 92, serif: true, ls: 4 }) },
  { at: .7, out: 3.0, slide: 0, f: (lt) => `<rect x="${CX - 320 * ease(lt / .8)}" y="580" width="${640 * ease(lt / .8)}" height="3" fill="${C.o}"/>` }];
const crowd = (n, maskK, y0 = 560, s = 46) => { let s0 = ''; for (let i = 0; i < n; i++) { const x = 200 + i * (1520 / (n - 1)); const m = i % 2 ? M : F; s0 += person(x, y0, s, m, i % 2 ? 'm' : 'f'); if (maskK(i)) s0 += `<rect x="${x - s * .3}" y="${y0 - s * 1.02}" width="${s * .6}" height="${s * .24}" rx="${s * .08}" fill="#f4f4f2"/>`; } return s0; };
const twoBars = (k, up) => { const base = 820, a = 360, b = up ? 470 : 250; return bar(760, base, 200, a * easeOut(k), C.gray, 'マスクなし') + bar(1160, base, 200, (up ? 360 + (b - 360) * easeOut((k - .6) / .8) : 360 - (360 - b) * easeOut((k - .6) / .8)) * clamp(k * 3), up ? Y : '#7a7a84', 'マスクあり'); };

const jpPin = (x, y, sc, key, label) => { const p = maps().japan.pts[key]; return pin(x + p[0] * sc, y + p[1] * sc, label); };
const hi = (name) => (id, n) => n === name ? Y : '#4d4a45';
const wPin = (x, y, sc, name, label) => { const c = worldCentroid(name); return pin(x + c[0] * sc, y + c[1] * sc, label); };
const SC = [];
// ===== プロローグ =====
SC[0] = K((t) => R([
  { at: 0, slide: 0, f: () => [0, 1, 2, 3, 4].map(i => face(360 + i * 300, 470, 105, i % 2 ? M : F, t > 2.4 + i * .15 ? { q: true } : { mask: 'w' })).join('') },
  { at: 2.2, f: () => txt(CX, 760, '「マスクを外したら、別人だった」', { size: 52, serif: true }) },
  { at: .3, f: () => txt(CX, 230, '「マスク美人」', { size: 64, serif: true, color: F }) },
], t), 0, { enter: 'zoom' });
SC[1] = K((t) => R([
  { at: 0, slide: 0, f: () => face(700, 500, 160, F, { mask: 'w' }) },
  { at: .3, f: () => bubble(1260, 360, 520, 120, 'マスク美人', { size: 56 }) },
  { at: 3.2, f: (lt) => `<g transform="translate(1260,640) scale(${pop(lt / .4)})">${txt(0, 30, 'ただの気のせい？', { size: 70, color: Y, serif: true })}</g>` },
], t), 0, { enter: 'right', leave: 'left' });
SC[2] = K((t) => R([
  { at: 0, slide: 0, f: () => japanMap(200, 60, .9) },
  { at: .8, f: (lt) => `<g opacity="${clamp(lt / .3)}">${jpPin(200, 60, .9, 'sapporo', '北海道大学')}</g>` },
  { at: 1.6, f: () => txt(1450, 560, '2016年', { size: 90, color: Y, serif: true }) + txt(1450, 640, '日本の研究チーム', { size: 44 }) },
  ref('Miyazaki & Kawahara (2016)'),
], t), 0, { enter: 'right', leave: 'left' });
SC[3] = K((t) => R([
  { at: 0, f: () => head('コロナの前', { y: 190 }) },
  { at: .3, slide: 0, f: (lt) => twoBars(lt / 1.4, false) },
  { at: 3.6, f: (lt) => arrow(1330, 440, 1330, 440 + 220 * easeOut(lt / .6), C.red, 1, 14) + txt(1470, 560, '下がった', { size: 54, color: C.red, anchor: 'start' }) },
  IM, ref('Miyazaki & Kawahara (2016)'),
], t), 0, { enter: 'right', leave: 'left' });
SC[4] = K((t) => R([
  { at: 0, f: () => head('コロナのあと', { y: 190 }) },
  { at: .3, slide: 0, f: (lt) => twoBars(lt / 1.4, true) },
  { at: 2.6, f: (lt) => arrow(1330, 620, 1330, 620 - 220 * easeOut(lt / .6), Y, 1, 14) + txt(1470, 500, '上がった', { size: 54, color: Y, anchor: 'start' }) },
  { at: 1.2, f: () => txt(1650, 300, '2020年〜', { size: 48, color: C.dim }) },
  IM, ref('Kamatani et al. (2021)'),
], t), 0, { enter: 'right', leave: 'left' });
SC[5] = K((t) => R([
  { at: 0, f: () => txt(CX, 400, 'たった数年で、何が変わった？', { size: 66, serif: true }) },
  { at: 2.6, f: () => txt(CX, 600, '得をしているのは、<g>誰？</g>', { size: 82, serif: true }) },
], t), 0, { enter: 'zoom' });
SC[6] = K((t) => R([
  { at: 0, f: () => head('4つの研究で確かめる', { y: 170 }) },
  ...[['日本', '2016', 'コロナ前'], ['日本', '2021', 'コロナ後'], ['カナダ', '2022', '若い顔・年配の顔'], ['イギリス', '2022', '4種類の隠し方']].map(([a, b, c], i) => ({ at: .5 + i * .45, dx: 0, f: () => card(140 + i * 425, 290, 385, 480) + txt(332 + i * 425, 400, `${i + 1}`, { size: 90, color: Y, serif: true }) + txt(332 + i * 425, 520, a, { size: 52 }) + txt(332 + i * 425, 590, b, { size: 44, color: C.dim }) + txt(332 + i * 425, 690, c, { size: 30 }) })),
], t), 0, { enter: 'right' });
// ===== 第1章 =====
SC[7] = K((t) => R([...chapEls('第1章', 'マスクは「病気の顔」だった')], t), 1, { enter: 'zoom' });
SC[8] = K((t) => R([
  { at: 0, slide: 0, f: () => [0, 1, 2, 3].map(i => face(330 + i * 160, 420, 62, i % 2 ? M : F) + face(330 + i * 160, 640, 62, i % 2 ? M : F, { mask: 'w' })).join('') + txt(150, 432, 'なし', { size: 34, anchor: 'end' }) + txt(150, 652, 'あり', { size: 34, anchor: 'end' }) },
  { at: 2.5, f: () => card(1080, 330, 640, 380) + txt(1400, 460, '見た目の魅力を', { size: 44 }) + txt(1400, 560, '採点', { size: 90, color: Y, serif: true }) },
  ref('Miyazaki & Kawahara (2016)'),
], t), 1, { enter: 'right', leave: 'left' });
SC[9] = K((t) => R([{ at: 0, slide: 0, f: (lt) => twoBars(lt / 1.2, false) }, { at: 1.6, f: () => txt(1160, 300, '全体として低い', { size: 46, color: C.red }) }, IM], t), 1, { enter: 'right', leave: 'left' });
SC[10] = K((t) => R([
  { at: 0, slide: 0, f: () => face(560, 470, 150, F, { mask: 'w' }) },
  { at: 1.4, f: (lt) => arrow(800, 470, 800 + 260 * easeOut(lt / .6), 470, C.dim, 1, 8) },
  { at: 2.0, f: () => icon('timer', 1300, 400, 150, C.red, 6) + txt(1300, 620, '病気？', { size: 70, color: C.red, serif: true }) },
], t), 1, { enter: 'right', leave: 'left' });
SC[11] = K((t) => R([
  { at: 0, slide: 0, f: () => person(700, 620, 120, M) + `<rect x="664" y="${620 - 122}" width="72" height="28" rx="9" fill="#f4f4f2"/>` },
  { at: .8, f: () => bubble(1200, 330, 420, 110, '風邪かな？', { size: 52 }) },
  { at: 2.6, f: () => bubble(1250, 560, 480, 110, '具合が悪いのかな？', { size: 46 }) },
], t), 1, { enter: 'right', leave: 'left' });
SC[12] = K((t) => R([
  { at: .2, f: (lt) => `<g transform="translate(${CX},470) scale(${pop(lt / .4)})">${txt(0, 30, '衛生マスク効果', { size: 110, serif: true, color: Y })}</g>` },
  { at: 1.2, f: () => txt(CX, 640, '宮崎・河原（2016）', { size: 40, color: C.dim }) },
], t), 1, { enter: 'zoom' });
const roads = (k1, k2, thick2, x1) => `<path d="M260,300 C700,300 900,250 1500,300" stroke="${C.gray}" stroke-width="40" fill="none" stroke-linecap="round" opacity="${k1}"/>`
  + `<path d="M260,640 C700,640 900,700 1500,640" stroke="${thick2 ? C.red : C.gray}" stroke-width="${thick2 ? 70 : 40}" fill="none" stroke-linecap="round" opacity="${k2}"/>`
  + txt(260, 230, '①顔の一部が隠れる', { size: 44, anchor: 'start', op: k1 }) + txt(260, 570, '②病気を思い出させる', { size: 44, anchor: 'start', op: k2 })
  + face(1640, 470, 110, F, { mask: 'w' }) + (x1 ? `<path d="M1000,600 l120,80 M1120,600 l-120,80" stroke="${C.red}" stroke-width="18" stroke-linecap="round" opacity="${x1}"/>` : '');
SC[13] = K((t) => R([{ at: 0, slide: 0, f: () => roads(clamp(t / .6), clamp((t - 1.2) / .6), false, 0) }, { at: 2.6, f: () => txt(CX, 860, '効き方は2つ', { size: 50, color: Y }) }], t), 1, { enter: 'right', leave: 'left' });
SC[14] = K((t) => R([{ at: 0, slide: 0, f: () => roads(1, .25, false, 0) }, { at: 1.0, f: () => txt(900, 380, '人によって ↑ も ↓ も', { size: 40, color: Y }) }], t), 1, { enter: 'fade' });
SC[15] = K((t) => R([{ at: 0, slide: 0, f: () => roads(.25, 1, false, 0) }, { at: 2.6, f: () => txt(900, 760, '誰でも ↓', { size: 50, color: C.red }) }], t), 1, { enter: 'fade' });
SC[16] = K((t) => R([{ at: 0, slide: 0, f: () => roads(.5, 1, t > .6, 0) }, { at: 1.0, f: () => txt(900, 790, 'コロナ前は ② が強かった', { size: 48, color: C.red }) }], t), 1, { enter: 'fade', leave: 'left' });
SC[17] = K((t) => R([{ at: 0, slide: 0, f: () => face(CX, 470, 170, F, { mask: 'w' }) }, { at: 1.6, sfx: 'stamp', f: (lt) => stamp(CX, 470, 150, '損', lt) }], t), 1, { enter: 'zoom' });
// ===== 第2章 =====
SC[18] = K((t) => R([...chapEls('第2章', '得をしたのは誰か'), { at: 3.0, slide: 0, f: () => crowd(12, i => t > 3.2 + i * .25, 640, 46) }], t), 2, { enter: 'zoom' });
SC[19] = K((t) => R([{ at: 0, slide: 0, f: (lt) => timeline(260, 480, 1400, [{ at: .02, label: '2016', sub: 'コロナ前の実験' }, { at: .5, label: '2020', sub: 'コロナ流行', c: C.red }, { at: .98, label: '再実験', sub: '同じ研究チーム', c: Y }], clamp(lt / 4)) }, ref('Kamatani et al. (2021)')], t), 2, { enter: 'right', leave: 'left' });
SC[20] = K((t) => R([
  { at: 0, f: () => head('マスク姿を「不健康そう」と思う人', { y: 190, size: 48 }) },
  { at: .4, slide: 0, f: (lt) => bar(760, 800, 220, 420, '#7a7a84', 'コロナ前') + bar(1160, 800, 220, 420 - 230 * easeOut((lt - 1.2) / 1), Y, 'コロナ後') },
  { at: 3.2, f: () => txt(1420, 480, '半分以下に', { size: 60, color: Y, anchor: 'start', serif: true }) },
  IM, ref('Kamatani et al. (2021)'),
], t), 2, { enter: 'right', leave: 'left' });
SC[21] = K((t) => R([{ at: 0, slide: 0, f: () => roads(1, 1 - .7 * clamp((t - 1.5) / 1), false, clamp((t - 1.5) / .4)) }, { at: 2.6, f: () => txt(900, 860, '残ったのは ① だけ', { size: 48, color: Y }) }], t), 2, { enter: 'fade', leave: 'left' });
const grp = (lt, dl, dm, dh, o = {}) => { const base = 800, hs = [230, 400, 570], ds = [dl, dm, dh], cols = [C.gray, C.gray, C.gray];
  return ['元が低い顔', 'ふつうの顔', '元が高い顔'].map((n, i) => { const h = hs[i] + ds[i] * easeOut(lt); const c = ds[i] > 0 ? Y : ds[i] < 0 ? '#7a6a7a' : cols[i];
    return `<rect x="${470 + i * 400 - 100}" y="${base - hs[i]}" width="200" height="${hs[i]}" rx="8" fill="${C.dark}"/>` + `<rect x="${470 + i * 400 - 100}" y="${base - h}" width="200" height="${h}" rx="8" fill="${c}" opacity=".9"/>` + txt(470 + i * 400, base + 46, n, { size: 34 }) + (o.crown && i === 0 ? `<path d="M${470-60},${base-h-30} l0,-60 l30,30 l30,-45 l30,45 l30,-30 l0,60 z" fill="${Y}"/>` : ''); }).join(''); };
SC[22] = K((t) => R([{ at: 0, f: () => head('元の顔の点数ごとに分けると', { y: 180 }) }, { at: .3, slide: 0, f: () => grp(0, 0, 0, 0) }, IM], t), 2, { enter: 'right', leave: 'fade' });
SC[23] = K((t) => R([{ at: 0, slide: 0, f: (lt) => grp(clamp((lt - .5) / 1), 150, 0, 0) }, { at: 1.4, f: () => txt(470, 380, '↑ 上がった', { size: 48, color: Y }) }, IM, ref('Kamatani et al. (2021)')], t), 2, { enter: 'fade', leave: 'fade' });
SC[24] = K((t) => R([{ at: 0, slide: 0, f: (lt) => grp(1, 150, 0, 0) + (lt > 2 ? grp(0, 0, 0, 0).slice(0, 0) : '') }, { at: 2.4, slide: 0, f: (lt) => grp(1, 150, 0, -90 * easeOut(lt / 1)) }, { at: 3.4, f: () => txt(870, 220, '元が高い顔：上がらない／研究によっては ↓', { size: 40, color: C.dim }) }, IM, ref('Kamatani et al. (2021)')], t), 2, { enter: 'fade', leave: 'left' });
SC[25] = K((t) => R([{ at: 0, f: () => txt(CX, 480, '美人が、マスクでさらに美人に', { size: 70, serif: true }) }, { at: 2.6, sfx: 'stamp', f: (lt) => `<g transform="translate(${CX},460) scale(${pop(lt / .3)})"><path d="M-520,-80 L520,80 M520,-80 L-520,80" stroke="${C.red}" stroke-width="26" stroke-linecap="round"/></g>` }], t), 2, { enter: 'zoom' });
SC[26] = K((t) => R([{ at: 0, slide: 0, f: () => grp(1, 150, 0, -90, { crown: t > 1.5 }) }, { at: 2.0, f: () => txt(CX, 170, '得をしたのは、素顔に自信がない人', { size: 52, color: Y, serif: true }) }], t), 2, { enter: 'fade', leave: 'left' });
SC[27] = K((t) => { const g = (x, lab, k) => [0, 1].map(j => { const up = j === 0; const h = (j ? 420 : 220) + (up ? 140 * easeOut(k) : 0);
    return `<rect x="${x + j * 190}" y="${820 - h}" width="150" height="${h}" rx="8" fill="${up ? Y : C.gray}"/>` + txt(x + 75 + j * 190, 870, j ? '元が高い' : '元が低い', { size: 28 }); }).join('') + txt(x + 170, 300, lab, { size: 44 });
  return R([{ at: 0, slide: 0, f: () => worldMap(60, 170, .36, hi('Canada')) + wPin(60, 170, .36, 'Canada', '') + txt(60 + 288, 170 + 310 + 50, 'カナダの大学', { size: 40, color: Y }) },
    { at: 1.4, f: (lt) => g(680, '若い人の顔', clamp((lt - .5) / 1)) + g(1240, '年配の人の顔', clamp((lt - .8) / 1)) }, IM, ref('Pazhoohi & Kingstone (2022)')], t); }, 2, { enter: 'right' });
// ===== 第3章 =====
SC[28] = K((t) => R([...chapEls('第3章', '脳は、隠れた顔を平均で埋める')], t), 3, { enter: 'zoom' });
SC[29] = K((t) => R([{ at: 0, slide: 0, f: () => face(700, 480, 190, F) + `<rect x="${700 - 210}" y="490" width="420" height="200" fill="rgba(20,18,24,.92)" stroke="${Y}" stroke-width="5" stroke-dasharray="18 12"/>` + txt(700, 610, '？', { size: 100, color: Y }) },
  { at: 1.6, f: () => icon('question', 1350, 460, 200, Y, 6) + txt(1350, 700, '脳はどう想像する？', { size: 46 }) }], t), 3, { enter: 'right', leave: 'left' });
const photo = (x, y, kind, k = 1) => { let f = face(0, 0, 90, F); if (kind === 'small') f = `<g transform="scale(.45)">${f}</g>`; if (kind === 'third') f = `<g clip-path="url(#third)">${f}</g>`; if (kind === 'blur') f = `<g filter="url(#bl)">${f}</g>`;
  return `<defs><clipPath id="third"><rect x="-120" y="-120" width="240" height="80"/></clipPath><filter id="bl"><feGaussianBlur stdDeviation="9"/></filter></defs><g transform="translate(${x},${y})" opacity="${k}"><rect x="-140" y="-140" width="280" height="280" rx="16" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.2)" stroke-width="3"/>${f}</g>`; };
const P4 = [['orig', '元の写真'], ['small', '小さい'], ['third', '3分の1だけ'], ['blur', 'ぼかし']];
SC[30] = K((t) => R([{ at: 0, f: () => head('96人の顔写真で実験', { y: 180 }) }, ...P4.map(([k, l], i) => ({ at: .5 + i * .5, f: () => photo(360 + i * 400, 480, k) + txt(360 + i * 400, 700, l, { size: 38 }) })), ref('Orghian & Hidalgo (2020)')], t), 3, { enter: 'right', leave: 'fade' });
SC[31] = K((t) => R([...P4.map(([k, l], i) => ({ at: 0, slide: 0, f: () => photo(360 + i * 400, 400, k) + bar(360 + i * 400, 860, 140, (i ? 150 + 60 * easeOut((t - .8) / 1) : 150), i ? Y : C.gray, l) })), IM, ref('Orghian & Hidalgo (2020)')], t), 3, { enter: 'fade', leave: 'fade' });
SC[32] = K((t) => R([...P4.slice(1).map(([k, l], i) => ({ at: .2 + i * .4, f: () => photo(560 + i * 400, 440, k) + txt(560 + i * 400, 690, l + '　↑', { size: 40, color: Y }) })), { at: 3.0, f: () => txt(CX, 830, '7回の実験で、同じ結果', { size: 52, serif: true }) }], t), 3, { enter: 'fade', leave: 'left' });
SC[33] = K((t) => R([{ at: 0, slide: 0, f: () => face(620, 480, 170, M) }, ...['性格がよさそう', '頭がよさそう', '健康そう'].map((s0, i) => ({ at: 2.2 + i * .7, f: () => card(980, 300 + i * 150, 620, 110) + txt(1290, 375 + i * 150, s0 + '　◎', { size: 46, color: Y }) }))], t), 3, { enter: 'right', leave: 'left' });
SC[34] = K((t) => R([{ at: 0, slide: 0, f: () => face(500, 420, 150, F) + `<rect x="350" y="430" width="300" height="160" fill="rgba(20,18,24,.92)" stroke="${Y}" stroke-width="4" stroke-dasharray="14 10"/>` },
  ...[0, 1, 2, 3].map(i => ({ at: 1.2 + i * .35, f: () => `<g transform="translate(${980 + i * 230},520)"><rect x="-95" y="-70" width="190" height="140" rx="14" fill="rgba(255,255,255,.08)"/><path d="M-50,${-10 + (i - 1.5) * 6} Q0,${25 + i * 4} 50,${-10 - (i - 1.5) * 6}" stroke="${F}" stroke-width="${6 + i * 2}" fill="none" stroke-linecap="round"/></g>` })),
  { at: 2.0, f: () => txt(1325, 340, 'どの口元で埋める？', { size: 44 }) }, ref('Kramer & Jones (2022)')], t), 3, { enter: 'right', leave: 'fade' });
SC[35] = K((t) => R([{ at: 0, slide: 0, f: () => face(500, 420, 150, F) + `<path d="M440,520 Q500,550 560,520" stroke="${F}" stroke-width="10" fill="none" stroke-linecap="round"/>` },
  { at: .5, f: () => txt(1250, 380, '本人の顔 ×', { size: 56, color: C.dim }) }, { at: 1.6, f: () => txt(1250, 520, '平均的な顔 ○', { size: 66, color: Y, serif: true }) },
  { at: 3.6, f: () => txt(1250, 680, '個性が強い顔ほど、より平均に', { size: 40 }) }, ref('Kramer & Jones (2022)')], t), 3, { enter: 'fade', leave: 'left' });
SC[36] = K((t) => R([{ at: 0, slide: 0, f: () => `<g transform="translate(560,180) rotate(-2)" filter="url(#sh)"><rect width="800" height="620" rx="8" fill="${C.paper}"/>${[0, 1, 2, 3, 4].map(i => `<rect x="60" y="${80 + i * 105}" width="420" height="14" rx="5" fill="#8a8072"/><rect x="540" y="${62 + i * 105}" width="200" height="56" rx="6" fill="none" stroke="#8a8072" stroke-width="4"/>`).join('')}</g>` },
  ...[1, 3, 4].map((r0, i) => ({ at: 1.2 + i * .4, sfx: 'stamp', f: (lt) => stamp(1200, 270 + r0 * 105, 60, '平均点', lt) }))], t), 3, { enter: 'right', leave: 'left' });
const avgBars = (k1, k2) => { const base = 820, avg = 450; const h1 = 260 + (avg - 260) * easeOut(k1), h2 = 640 - (640 - avg) * easeOut(k2);
  return bar(700, base, 220, h1, k1 > 0 ? Y : C.gray, '元が低い人') + bar(1220, base, 220, h2, k2 > 0 ? '#9a8aa0' : C.gray, '元が高い人') + avgLine(480, 1440, base - avg); };
SC[37] = K((t) => R([{ at: 0, slide: 0, f: () => avgBars(clamp((t - 1.2) / 1.2), 0) }, { at: 2.4, f: () => txt(700, 300, '↑', { size: 80, color: Y }) }, IM], t), 3, { enter: 'right', leave: 'fade' });
SC[38] = K((t) => R([{ at: 0, slide: 0, f: () => avgBars(1, clamp((t - 1.2) / 1.2)) }, { at: 2.6, f: () => txt(1220, 300, '↓', { size: 80, color: '#c9b0d0' }) }, IM], t), 3, { enter: 'fade', leave: 'fade' });
SC[39] = K((t) => R([{ at: 0, slide: 0, f: () => avgBars(1, 1) }, { at: .8, f: () => txt(CX, 200, 'マスク ＝ みんなを平均に近づける道具', { size: 54, color: Y, serif: true }) }], t), 3, { enter: 'fade', leave: 'left' });
SC[40] = K((t) => { const k = easeOut((t - 1) / 1.2); return R([{ at: 0, slide: 0, f: () => face(CX, 470, 190, F) + `<g transform="translate(0,${-260 * k})" opacity="${1 - k}">${face(CX, 470, 190, 'rgba(0,0,0,0)', { mask: 'w', top: false })}</g>` }, { at: 2.4, f: () => txt(CX, 800, '外したら、別人？', { size: 60, serif: true }) }], t); }, 3, { enter: 'zoom', leave: 'left' });
SC[41] = K((t) => R([{ at: 0, slide: 0, f: () => icon('question', 520, 300, 120, C.dim, 5) + `<g opacity=".55">${face(520, 520, 150, F)}</g>` + txt(520, 760, '頭の中：平均で埋めた顔', { size: 38 }) },
  { at: 3.4, f: () => face(1400, 520, 150, '#e7a0b8') + `<path d="M1340,580 Q1400,600 1460,575" stroke="#1b1a20" stroke-width="10" fill="none"/>` + txt(1400, 760, '外した瞬間：本物の顔', { size: 38, color: Y }) },
  { at: 4.2, f: (lt) => arrow(760, 520, 760 + 360 * easeOut(lt / .6), 520, Y, 1, 8) + txt(940, 490, '比べる', { size: 36 }) }], t), 3, { enter: 'right', leave: 'left' });
SC[42] = K((t) => R([{ at: 0, slide: 0, f: () => avgLine(380, 1500, 520) },
  { at: .8, f: (lt) => arrow(700, 520, 700, 520 + 240 * easeOut(lt / .6), '#9a8aa0', 1, 12) + txt(700, 840, 'がっかり', { size: 50 }) },
  { at: 2.8, f: (lt) => arrow(1200, 520, 1200, 520 - 240 * easeOut(lt / .6), Y, 1, 12) + txt(1200, 230, '外した方がかわいい', { size: 50, color: Y }) },
  { at: 5.2, f: () => txt(CX, 840 + 0, '', {}) }], t), 3, { enter: 'fade', leave: 'left' });
SC[43] = K((t) => R([{ at: 0, slide: 0, f: () => face(620, 480, 170, F, { top: true }) }, { at: 1.4, f: () => txt(620, 740, '口元だけ見せると', { size: 40 }) },
  { at: 2.6, slide: 0, f: (lt) => bar(1260, 820, 220, 560 - 180 * easeOut((lt - .4) / 1), '#9a8aa0', '元が高い顔') }, { at: 3.6, f: () => txt(1520, 420, '↓', { size: 90, color: '#c9b0d0' }) }, IM, ref('Pazhoohi & Kingstone (2022)')], t), 3, { enter: 'right', leave: 'left' });
SC[44] = K((t) => R([{ at: 0, slide: 0, f: () => `<ellipse cx="${CX}" cy="420" rx="420" ry="120" fill="rgba(240,199,90,.12)"/>` + face(CX, 500, 200, F, { mask: 'w' }) },
  { at: 1.6, f: () => txt(CX, 230, '大事な目元は残す', { size: 54, color: Y, serif: true }) }, { at: 3.2, f: () => txt(CX, 820, '残りは、平均で埋める', { size: 48 }) }], t), 3, { enter: 'zoom' });
// ===== 第4章 =====
SC[45] = K((t) => R([...chapEls('第4章', 'マスクにも、ちがいがある'), { at: 3.0, f: () => face(700, 520, 130, M, { mask: 'b' }) + txt(CX, 540, 'vs', { size: 70, color: C.dim }) + face(1220, 520, 130, M, { cover: 'book' }) + txt(CX, 820, '隠れるなら、なんでも同じ？', { size: 50 }) }], t), 4, { enter: 'zoom' });
SC[46] = K((t) => R([{ at: 0, slide: 0, f: () => worldMap(100, 160, .7, hi('United Kingdom')) }, { at: .6, f: () => wPin(100, 160, .7, 'United Kingdom', 'イギリス') },
  { at: 1.6, f: () => card(1300, 320, 460, 260) + txt(1530, 430, '2021年2月', { size: 56, color: Y, serif: true }) + txt(1530, 510, 'コロナの最中', { size: 38 }) }, ref('Hies & Lewis (2022)')], t), 4, { enter: 'right', leave: 'left' });
const P4b = [[{}, 'なし'], [{ cover: 'book' }, '黒い本'], [{ mask: 'c' }, '布マスク'], [{ mask: 'b' }, '医療用マスク']];
SC[47] = K((t) => R([{ at: 0, f: () => txt(CX, 200, '<t>女性43人</t>が、男性40人の顔を採点', { size: 50 }).replace(/#3dc6c1/, F) },
  ...P4b.map(([o, l], i) => ({ at: .8 + i * .45, f: () => face(360 + i * 400, 500, 130, M, o) + txt(360 + i * 400, 720, l, { size: 40 }) })), ref('Hies & Lewis (2022)')], t), 4, { enter: 'right', leave: 'fade' });
SC[48] = K((t) => { const ord = [3, 2, 1, 0]; return R([...ord.map((pi, r) => ({ at: .3 + (3 - r) * .5, f: () => { const [o, l] = P4b[pi]; const y = 230 + r * 170; return txt(420, y + 20, `${r + 1}位`, { size: 60, color: r === 0 ? Y : C.fg, serif: true }) + face(620, y, 62, M, o) + txt(740, y + 16, l, { size: 46, anchor: 'start', color: r === 0 ? Y : C.fg }); } })), ref('Hies & Lewis (2022)')], t); }, 4, { enter: 'fade', leave: 'left' });
SC[49] = K((t) => R([{ at: 0, slide: 0, f: () => face(560, 470, 150, M, { mask: 'b' }) }, { at: 2.6, f: (lt) => arrow(780, 470, 780 + 300 * easeOut(lt / .6), 470, Y, 1, 8) },
  { at: 3.2, f: () => person(1380, 600, 110, '#f4f4f2') + `<rect x="1347" y="${600 - 112}" width="66" height="26" rx="8" fill="#8fc3ea"/>` + icon('heart', 1530, 380, 90, F, 6) + txt(1380, 840, '病院で働く人のイメージ？', { size: 40 }) }], t), 4, { enter: 'right', leave: 'left' });
SC[50] = K((t) => R([{ at: 0, slide: 0, f: () => japanMap(160, 60, .9, { fill: F }) }, { at: .6, f: () => txt(1450, 420, '日本の実験', { size: 64, color: Y, serif: true }) }, { at: 1.4, f: () => txt(1450, 520, 'マスクの種類と付け方', { size: 50 }) }, ref('菊島・櫻井 (2024)')], t), 4, { enter: 'right', leave: 'left' });
SC[51] = K((t) => R([...[['w', '不織布', 400], ['c', '布（平ら）', 230], ['g', '立体', 380]].map(([m, l, h], i) => ({ at: .3 + i * .4, f: () => face(500 + i * 460, 250, 80, F, { mask: m }) + bar(500 + i * 460, 860, 180, h * easeOut((t - 1.4 - i * .2) / 1), m === 'c' ? '#9a8aa0' : Y, l) })), IM, ref('菊島・櫻井 (2024)')], t), 4, { enter: 'right', leave: 'left' });
SC[52] = K((t) => R([...[[0, '鼻を覆う', 400], [1, '鼻すじが見える', 290], [2, '鼻が全部出る', 180]].map(([n, l, h], i) => ({ at: .3 + i * .9, f: () => face(500 + i * 460, 250, 80, M, { mask: 'w', nose: n }) + bar(500 + i * 460, 860, 180, h * easeOut((t - .8 - i * .9) / .8), i ? '#9a8aa0' : Y, l) })), IM, ref('菊島・櫻井 (2024)')], t), 4, { enter: 'right', leave: 'left' });
SC[53] = K((t) => R([{ at: 0, f: () => txt(560, 200, '日本の人', { size: 50 }) + txt(1360, 200, 'イギリス・アメリカの人', { size: 50 }) },
  { at: .5, slide: 0, f: () => face(470, 420, 80, M, { mask: 'w' }) + face(650, 420, 80, M, { mask: 'k' }) + txt(470, 560, '白', { size: 34 }) + txt(650, 560, '黒', { size: 34 }) + face(1270, 420, 80, M, { mask: 'w' }) + face(1450, 420, 80, M, { mask: 'k' }) + txt(1270, 560, '白', { size: 34 }) + txt(1450, 560, '黒', { size: 34 }) },
  { at: 2.8, f: () => txt(650, 700, '黒 ＝ 悪い印象', { size: 44, color: '#c9b0d0' }) }, { at: 4.6, f: () => txt(1450, 700, '黒 ＝ おしゃれ', { size: 44, color: Y }) }, ref('科研費 23K02856 研究実績報告')], t), 4, { enter: 'right', leave: 'left' });
SC[54] = K((t) => R([{ at: 0, f: () => head('日本・コロナのあと', { y: 180 }) }, ...['w', 'k'].map((m, i) => ({ at: .4 + i * .4, f: () => face(560 + i * 800, 380, 90, M, { mask: m }) + bar(470 + i * 800, 860, 140, 220 + 120 * easeOut((t - 2) / 1), Y, '元が低い顔') + bar(660 + i * 800, 860, 140, 420, C.gray, '元が高い顔') })), IM, ref('鎌谷ほか (2021) 心理学研究')], t), 4, { enter: 'right' });
// ===== 第5章 =====
SC[55] = K((t) => R([...chapEls('第5章', '研究どうしの矛盾'), { at: 2.6, sfx: 'stamp', f: (lt) => stamp(1500, 760, 110, '矛盾', lt) }], t), 5, { enter: 'zoom' });
const studyCard = (x, title, up, k) => card(x, 260, 640, 520, { stroke: up ? Y : C.gray }) + txt(x + 320, 350, title, { size: 46 }) + bar(x + 200, 720, 150, 220, C.gray, 'マスクなし') + bar(x + 440, 720, 150, 220 + (up ? 90 : -50) * easeOut(k), up ? Y : '#9a8aa0', 'マスクあり') + txt(x + 320, 230 + 0, '元が高い顔', { size: 32, color: C.dim });
SC[56] = K((t) => R([{ at: 0, slide: 0, f: () => studyCard(200, '日本・カナダ', false, clamp((t - 1) / 1)) }, ref('Kamatani et al. (2021) / Pazhoohi & Kingstone (2022)')], t), 5, { enter: 'right', leave: 'fade' });
SC[57] = K((t) => R([{ at: 0, slide: 0, f: () => studyCard(200, '日本・カナダ', false, 1) }, { at: .2, f: () => studyCard(1080, 'イギリス', true, clamp((t - .8) / 1)) }, { at: 3.2, f: () => txt(1400, 860, '美人も得をした', { size: 46, color: Y }) }, ref('Hies & Lewis (2022)')], t), 5, { enter: 'fade', leave: 'left' });
SC[58] = K((t) => R([{ at: .2, f: (lt) => `<g transform="translate(${CX},480) scale(${pop(lt / .4)})">${txt(0, 30, 'なぜ、分かれた？', { size: 90, serif: true })}</g>` }, { at: 2.0, f: () => txt(CX, 680, '理由は2つ', { size: 56, color: Y }) }], t), 5, { enter: 'zoom' });
const ruler = (y, off, lab, col) => { let s = `<rect x="360" y="${y}" width="1200" height="70" rx="10" fill="${col}" opacity=".85"/>`; for (let i = 0; i <= 10; i++) s += `<rect x="${380 + i * 116 + off}" y="${y}" width="5" height="${i % 5 ? 26 : 44}" fill="#1b1a20"/>`; return s + txt(330, y + 48, lab, { size: 34, anchor: 'end' }); };
SC[59] = K((t) => R([{ at: 0, f: () => head('① 「美人」の線の引き方がちがう', { y: 180, size: 50 }) }, { at: .4, slide: 0, f: () => ruler(330, 0, '研究A', Y) }, { at: 1.0, slide: 0, f: () => ruler(520, 70 * easeOut((t - 1.4) / 1), '研究B', M) },
  { at: 2.6, f: () => `<path d="M1080,300 V640" stroke="${C.red}" stroke-width="6"/>` + txt(1080, 720, 'ここから「美人」', { size: 36, color: C.red }) }, ref('Kramer & Jones (2022)')], t), 5, { enter: 'right', leave: 'left' });
SC[60] = K((t) => R([{ at: 0, f: () => head('② 時期のちがい', { y: 180, size: 50 }) },
  { at: .4, slide: 0, f: () => `<g transform="translate(430,300)" filter="url(#sh)"><rect width="360" height="400" rx="16" fill="#f6f1e6"/><rect width="360" height="90" rx="16" fill="#c0392b"/>${txt(180, 62, '2021年', { size: 44, shadow: false })}${txt(180, 290, '2月', { size: 130, color: C.ink, serif: true, shadow: false })}</g>` + txt(610, 780, 'マスク義務から7か月', { size: 36 }) },
  { at: 3.0, f: () => face(1180, 480, 110, M, { mask: 'b' }) + `<path d="M1320,480 h120" stroke="${Y}" stroke-width="8"/>` + icon('heart', 1540, 440, 110, F, 6) + txt(1520, 640, '安心感・好印象', { size: 40, color: Y }) }, ref('Hies & Lewis (2022)')], t), 5, { enter: 'right', leave: 'left' });
SC[61] = K((t) => R([{ at: .2, f: (lt) => `<g transform="translate(${CX},470) rotate(-3) scale(${pop(lt / .4)})"><rect x="-460" y="-110" width="920" height="200" rx="16" fill="#2c2a33" stroke="${Y}" stroke-width="6"/>${txt(0, 28, 'まだ決着していない', { size: 80, color: Y, serif: true })}</g>` }], t), 5, { enter: 'zoom' });
// ===== エピローグ =====
SC[62] = K((t) => R([{ at: 0, slide: 0, f: () => crowd(10, () => true, 600, 52) }, { at: 1.6, f: () => txt(CX, 250, 'マスク美人は、気のせいではない', { size: 60, serif: true }) }], t), 6, { enter: 'zoom', leave: 'left' });
SC[63] = K((t) => R([{ at: 0, slide: 0, f: () => face(CX, 470, 190, F) + `<rect x="${CX - 210}" y="480" width="420" height="200" fill="rgba(20,18,24,.92)"/>` + txt(CX, 610, '平均', { size: 100, color: Y, serif: true }) }, { at: 2.6, f: () => txt(CX, 820, '埋めているのは、見る人の脳', { size: 50 }) }], t), 6, { enter: 'right', leave: 'left' });
SC[64] = K((t) => R([{ at: 0, slide: 0, f: (lt) => timeline(300, 470, 1320, [{ at: .02, label: '2016', sub: '病気の顔', c: '#9a8aa0' }, { at: .98, label: '2021', sub: 'ちゃんとした人の顔', c: Y }], clamp(lt / 3.5)) }, { at: 1.0, f: () => face(300, 680, 80, F, { mask: 'w' }) }, { at: 3.6, f: () => face(1620, 680, 80, F, { mask: 'w' }) + txt(CX, 250, '物差しは、時代で変わる', { size: 58, serif: true, color: Y }) }], t), 6, { enter: 'right', leave: 'left' });
SC[65] = K((t) => R([{ at: 0, f: () => txt(CX, 380, 'マスクを外した人を見て', { size: 56 }) + txt(CX, 480, '「思っていた顔とちがった」ことは？', { size: 56, color: Y }) }, { at: 2.0, f: () => card(560, 600, 800, 150) + txt(CX, 695, 'コメント欄で教えてください', { size: 46, shadow: false }) }], t), 6, { enter: 'zoom' });
SC[66] = K((t) => R([{ at: 0, f: () => txt(CX, 360, '今日のネタバレは、ここまで。', { size: 60, serif: true }) }, { at: .8, f: () => txt(CX, 500, '世界のネタバレ', { size: 96, serif: true, color: C.o, ls: 8 }) },
  { at: 1.6, f: () => `<rect x="${CX - 200}" y="580" width="400" height="80" rx="40" fill="${C.o}"/>` + txt(CX, 634, 'チャンネル登録', { size: 38, color: '#111', shadow: false }) }, { at: 2.4, f: () => txt(CX, 740, '音声：VOICEVOX:青山龍星', { size: 28, color: C.dim }) }], t), 6, { enter: 'zoom' });

export const SCENES = SC;
