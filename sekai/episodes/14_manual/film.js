// 14 初任給回・説明書イラスト版（前半試作）。window.render(t)
import { PAL, makeView, box, cyl, blob, poly3, planeArrow, dashed3, dashed, cross, tick, roundRect, arrow2, setGhost, rotAbout, add3, mul3, lerp3, LW } from './iso.js';
import { person, walkFeet } from './rig.js';
import { stand, handsOnHips, scratch, read, sitCross } from './poses.js';
import { hand } from './hand.js';
import { paper, magnifier } from './page.js';

const W = 1920, H = 1080, JP = '"Noto Sans CJK JP","Noto Sans JP",sans-serif';
const cl = (x) => Math.max(0, Math.min(1, x)), ease = (x) => x * x * (3 - 2 * x), eo = (x) => 1 - Math.pow(1 - x, 3);
const yen = (n) => Math.round(n).toLocaleString('en-US');
let TL = null;
export async function load() { TL = await (await fetch('timeline.json')).json(); return TL; }

function tx(g, s, x, y, size, o = {}) {
  g.save(); g.globalAlpha *= o.a ?? 1; g.fillStyle = o.color || PAL.ink; g.font = `${o.w || 700} ${size}px ${JP}`; g.textAlign = o.align || 'left'; g.textBaseline = 'alphabetic';
  if (o.halo) { g.lineWidth = o.halo; g.strokeStyle = PAL.paper; g.lineJoin = 'round'; g.strokeText(s, x, y); }
  g.fillText(s, x, y); g.restore();
}
function label(g, s, x, y, size = 30, o = {}) {   // 白い札
  g.save(); g.globalAlpha *= o.a ?? 1; g.font = `700 ${size}px ${JP}`; const w = g.measureText(s).width + size * 1.1, h = size * 1.7;
  roundRect(g, x - w / 2, y - h / 2, w, h, 10, o.fill || '#FFFFFF', LW); tx(g, s, x, y + size * .36, size, { align: 'center', color: o.color }); g.restore();
}
function faceText(v, origin, U, V, s, size, o = {}) {
  const p0 = v.P(origin), pu = v.P(add3(origin, U)), pv = v.P(add3(origin, V));
  v.add(o.depth ?? v.depth(origin) + 5, (g) => { g.save(); g.globalAlpha *= o.a ?? 1; g.transform(pu[0] - p0[0], pu[1] - p0[1], pv[0] - p0[0], pv[1] - p0[1], p0[0], p0[1]);
    g.fillStyle = o.color || PAL.ink; g.font = `700 ${size}px ${JP}`; g.textBaseline = 'alphabetic'; g.fillText(s, 0, size); g.restore(); }, o.layer || 0);
}
function stepN(g, n, a = 1) { tx(g, String(n), 90, 200, 170, { w: 900, a }); }
function ghostFlush(v, g, a = 1) { setGhost(a); v.flush(g); setGhost(0); }
const slab = (v, p, pal = PAL.part, w = 16, h = 1.6, d = 9, o = {}) => box(v, p, [p[0] + w, p[1] + h, p[2] + d], pal, o);
function pile(v, x, z, hgt, w = 16, d = 9) { const n = Math.floor(hgt / 1.6); for (let i = 0; i < n; i++) slab(v, [x, 1 + i * 1.6, z], PAL.part, w, 1.6, d); const r = hgt - n * 1.6; if (r > .15) slab(v, [x, 1 + n * 1.6, z], PAL.part, w, r, d); }
function note(g, s) { tx(g, s, 1850, 944, 22, { w: 500, align: 'right', color: PAL.grey3 }); }
function tagShape(g, x, y, w, h, s, o = {}) {   // 荷札
  g.save(); g.globalAlpha *= o.a ?? 1; g.beginPath(); const c = 34; g.moveTo(x + c, y); g.lineTo(x + w - c, y); g.lineTo(x + w, y + c); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.lineTo(x, y + c); g.closePath();
  g.fillStyle = o.fill || '#FFFFFF'; g.fill(); g.lineWidth = LW; g.strokeStyle = PAL.ink; g.lineJoin = 'round'; g.stroke();
  g.beginPath(); g.arc(x + w / 2, y + 34, 11, 0, 7); g.fillStyle = PAL.paper; g.fill(); g.stroke();
  g.beginPath(); g.moveTo(x + w / 2, y + 23); g.quadraticCurveTo(x + w / 2 + 30, y - 40, x + w / 2 - 10, y - 70); g.stroke();
  tx(g, s, x + w / 2, y + h / 2 + (o.size || 60) * .55, o.size || 60, { align: 'center' }); g.restore();
}
const tk = (v, pose) => person(v, pose);

// ---------- setups: (g, S) S={p, lt, dur, sub(i)} ----------
const SET = {};
const mkT = (S) => (p, a = 0, d = .6) => S.p > p ? 1 : S.p < p ? 0 : ease(cl((S.lt - a) / d));

SET.box = (g, S) => { const T = mkT(S), v = makeView({ cx: 800, cy: 610, s: 3.8 }), vg = makeView({ cx: 800, cy: 610, s: 3.8 });
  const dr = 1 - T(0, .3, 1.0), by = 150 * dr * dr;
  tx(g, '4/25', 470, 170, 110, { w: 900, a: T(0, 0, .4) });
  if (dr > 0) dashed3(v, [35, 190, 25], [35, 42 + by, 25]);
  box(v, [0, by, 0], [70, by + 40, 50]);
  const la = -1.95 * T(2, .15, .8); box(v, [0, by + 40, 0], [70, by + 42.5, 50], PAL.part, { xf: rotAbout([0, by + 40, 0], [1, 0, 0], la) });
  faceText(v, [5, by + 31, 50.2], [1, 0, 0], [0, -1, 0], '262,300', 14.5, { a: T(1, .1, .4) });
  const tp = [-80, 125], look = [35, 40, 25], f = -42;
  tk(v, S.p < 2 ? stand(tp, f, 'a', { lookAt: look }) : S.p < 4 ? scratch(tp, f, 'a', { lookAt: S.p === 3 ? [200, 0, 40] : look }) : handsOnHips(tp, f, 'a', { lookAt: [200, 0, 0] }));
  const e1 = [.7071, 0, -.7071], e2 = [.7071, 0, .7071], base = [100, 0, -45];
  const pos = (i) => add3(base, add3(mul3(e1, (i % 11) * 16.5), mul3(e2, Math.floor(i / 11) * 34)));
  if (S.p >= 2) for (let i = 0; i < 22; i++) { const k = S.p > 2 ? 1 : eo(cl((S.lt - .9 - i * .045) / .5)); if (k <= 0) continue; const q = lerp3([27, by + 44, 20], pos(i), k); q[1] += Math.sin(k * Math.PI) * 40; slab(v, q, k < 1 ? PAL.neu : PAL.part, 9, 3, 16); }
  v.flush(g);
  if (S.p >= 3) { const a = T(3, .1, .5); for (let i = 22; i < 26; i++) slab(vg, pos(i), PAL.part, 9, 3, 16); g.save(); g.globalAlpha = a; ghostFlush(vg, g, 1); g.restore();
    const q = v.P(pos(28)); tx(g, '−44,000', q[0] + 20, q[1] + 24, 64, { color: PAL.red, a, w: 900 }); cross(g, q[0] - 150, q[1] - 60, 44 * a, 8); }
  if (S.p >= 2) { const a = T(2, 1.9, .4), q = v.P(pos(5)); tx(g, '218,000', q[0], q[1] - 120, 84, { align: 'center', a, w: 900 }); }
  if (S.p >= 1 && S.p < 2) { const a = T(1, .4, .4); g.save(); g.globalAlpha = a; magnifier(g, v.P([35, by + 22, 50]), 1380, 400, 230, (gg) => { tx(gg, '262,300', 1380, 420, 96, { align: 'center', w: 900 }); tx(gg, '円', 1560, 470, 40);
      const k = T(1, 2.6, .3); if (k > 0) { gg.save(); gg.translate(1380, 520); gg.rotate(-.12); gg.scale(2 - k, 2 - k); gg.globalAlpha = k; gg.strokeStyle = PAL.red; gg.lineWidth = 6; gg.strokeRect(-150, -42, 300, 84); tx(gg, '過去最高', 0, 22, 60, { align: 'center', color: PAL.red, w: 900 }); gg.restore(); } }, { spotR: 30 }); g.restore(); }
  if (S.p >= 4) { const a = T(4, 1.3, .4); g.save(); g.globalAlpha = a; tick(g, 1650, 300, 150 * (2 - a), 20); g.restore(); tx(g, '正しい組み立て方', 1650, 440, 40, { align: 'center', a }); }
};

SET.suspect = (g, S) => { const v = makeView({ cx: 300, cy: 800, s: 3.0 }), lt = S.lt;
  tk(v, handsOnHips([0, 0], 20, 'a', {})); v.flush(g);
  const a0 = ease(cl((lt - .1) / .3)); g.save(); g.globalAlpha = a0; roundRect(g, 420, 190, 640, 130, 30, '#FFFFFF', LW);
  g.beginPath(); g.moveTo(470, 318); g.lineTo(410, 380); g.lineTo(530, 318); g.fillStyle = '#FFFFFF'; g.fill(); g.lineWidth = LW; g.stroke(); g.fillRect(473, 310, 54, 8);
  tx(g, '「どうせ税金が高いせいだろ」', 740, 272, 40, { align: 'center' }); g.restore();
  const t1 = S.sub(1), t2 = S.sub(2), lab = ['税金', '？', '？', '？'];
  tx(g, '部品を抜いた犯人', 1240, 470, 44, { align: 'center', a: ease(cl((lt - t1) / .4)) });
  lab.forEach((s, i) => { const k = eo(cl((lt - t1 - .2 - i * .15) / .4)); if (k <= 0) return; g.save(); g.translate(0, (1 - k) * 60); tagShape(g, 760 + i * 250, 560, 210, 280, s, { a: k, size: 72 }); g.restore(); });
  const kx = cl((lt - t2 - 1.4) / .2); if (kx > 0) { cross(g, 865, 720, 230 * (2 - kx), 22); tx(g, '税金ではない', 865, 920, 40, { align: 'center', color: PAL.red, a: kx }); }
};

SET.cover = (g, S) => { const a = ease(cl(S.lt / .5));
  g.save(); g.globalAlpha = a; roundRect(g, 420, 90, 760, 850, 8, '#FFFFFF', LW * 1.2);
  tx(g, '取扱説明書', 800, 230, 96, { align: 'center', w: 900 }); g.fillStyle = PAL.ink; g.fillRect(500, 270, 600, 6);
  tx(g, '給料', 800, 440, 170, { align: 'center', w: 900 });
  const v = makeView({ cx: 760, cy: 700, s: 2.6 }); box(v, [0, 0, 0], [70, 40, 50]); box(v, [0, 40, 0], [70, 42.5, 50]); faceText(v, [5, 31, 50.2], [1, 0, 0], [0, -1, 0], '262,300', 14.5); v.flush(g);
  tx(g, '対象：タナカ（22歳・新卒1年目）', 800, 880, 34, { align: 'center', w: 500 }); g.restore();
  const v2 = makeView({ cx: 1520, cy: 830, s: 3.0 }); tk(v2, read([0, 0], 200, 'a', {})); v2.flush(g);
  tx(g, '1ページ目から', 1520, 250, 44, { align: 'center', a: ease(cl((S.lt - 2.4) / .4)) });
};

const HANDS = [
  { nm: '厚生年金', amt: 23790, dir: [1, 0, 0], reach: [-17, 0, 0], side: 'r', lab: [-.62, -.5] },
  { nm: '健康保険', amt: 13115, dir: [0, 0, 1], reach: [17, 0, -1], side: 'l', lab: [.6, -.52] },
  { nm: '雇用保険', amt: 1443, dir: [-1, 0, 0], reach: [17, 0, 3], side: 'l', lab: [.66, .3] },
  { nm: '所得税', amt: 5170, dir: [0, 0, -1], reach: [-17, 0, 3], side: 'r', lab: [-.66, .3] },
  { nm: '住民税', amt: 10000, dir: [.7071, 0, .7071], reach: [0, 0, -2], side: 'r', lab: [0, -.82], txt: '住民税　月 約10,000' },
  { nm: '介護保険料', amt: 6000, dir: [-.7071, 0, -.7071], reach: [0, 0, 3], side: 'l', lab: [.02, .52], txt: '介護保険料（40歳〜）' },
];
SET.hands = (g, S) => { const T = mkT(S), v = makeView({ cx: 960, cy: 560, s: 10.5 });
  stepN(g, S.p >= 6 ? 2 : 1, T(0, 0, .4));
  // 手ごとの進み具合 0..1(入る) ..2(戻って保持)
  const prog = HANDS.map((h, i) => { const ph = i === 0 ? 2 : i === 1 ? 3 : i < 4 ? 4 : i + 2; if (S.p > ph) return 2; if (S.p < ph) return 0; const st = i === 3 ? 1.5 : .2; return ease(cl((S.lt - st) / .7)) + ease(cl((S.lt - st - 1.0) / .8)); });
  const seen = HANDS.map((h, i) => i < 4 ? (S.p > 1 ? 1 : S.p < 1 ? 0 : eo(cl((S.lt - .3 - i * .3) / .6))) : (S.p >= i + 2 ? eo(cl((S.p > i + 2 ? 1 : S.lt / .5))) : 0));
  let taken = 0; HANDS.forEach((h, i) => { if (i < 4 && prog[i] >= 1) taken += h.amt * cl(prog[i] - 1 + .001 > 0 ? 1 : 0); });
  const remain = 262300 - HANDS.slice(0, 4).reduce((s, h, i) => s + (prog[i] > .85 ? h.amt : 0), 0);
  const ph = remain / 3 / 10000 * 1.6 * 1.25;
  box(v, [-30, 0, -22], [30, 1, 22]); box(v, [-31.5, 0, -22], [-30, 13, 22]); box(v, [-30, 0, -23.5], [30, 13, -22]);
  [-25, -8, 9].forEach((x) => pile(v, x, -4.5, ph));
  box(v, [30, 0, -22], [31.5, 7, 22], PAL.part, { bias: 30 }); box(v, [-30, 0, 22], [30, 7, 23.5], PAL.part, { bias: 30 });
  const labs = [];
  HANDS.forEach((h, i) => { if (seen[i] <= 0) return; const th = Math.max(.6, h.amt / 10000 * 1.6 * 1.25), top = 1 + ph + 1.2;
    const reach = [h.reach[0], top + th + 1.6, h.reach[2]], home = add3(reach, mul3(h.dir, -30)), far = add3(reach, mul3(h.dir, -70));
    const p = prog[i], k = p <= 1 ? p : 1 - (p - 1) * .82; let pa = lerp3(home, reach, k); pa = lerp3(far, pa, seen[i]);
    const isNew = (i === 4 && S.p === 6) || (i === 5 && S.p === 7), holding = p > .85;
    hand(v, { palmAt: pa, dir: h.dir, palm: [0, -1, 0], side: h.side, pose: holding ? 'grip' : 'relaxed', r: 2, armLen: 5, scale: 1.25, sleeve: isNew ? PAL.neu.top : PAL.grey1, bias: 40 });
    if (holding) { const cur = (S.p === 2 && i === 0) || (S.p === 3 && i === 1) || (S.p === 4 && (i === 2 || i === 3)) || isNew; const ax = Math.abs(h.dir[0]) > .9;
      box(v, [pa[0] - (ax ? 7 : 4.5), pa[1] - th - 1.4, pa[2] - (ax ? 4.5 : 7)], [pa[0] + (ax ? 7 : 4.5), pa[1] - 1.4, pa[2] + (ax ? 4.5 : 7)], cur ? PAL.neu : PAL.part, { bias: 36 }); }
    labs.push([i, seen[i], holding]); });
  v.flush(g);
  labs.forEach(([i, a, holding]) => { const h = HANDS[i], x = 960 + h.lab[0] * 960, y = 540 + h.lab[1] * 480; if (i < 4 && S.p < 2) return;
    const show = i < 4 ? (S.p > (i === 0 ? 2 : i === 1 ? 3 : 4) || holding ? 1 : (S.p === (i === 0 ? 2 : i === 1 ? 3 : 4) ? cl(S.lt / .3) : 0)) : a; if (show <= 0) return;
    if (i >= 4) { label(g, h.txt, x, y, 34, { a: show, fill: (i === 4 && S.p === 6) || (i === 5 && S.p === 7) ? PAL.neu.top : '#FFFFFF' }); return; }
    label(g, h.nm, x, y, 34, { a: show }); if (holding) tx(g, yen(h.amt), x, y + 86, 54, { align: 'center', w: 900, halo: 10 }); });
  if (S.p <= 5) { tx(g, '箱の中身', 960, 70, 30, { w: 500, a: T(0, .3, .4), align: 'center' }); tx(g, yen(remain), 960, 150, 76, { w: 900, a: T(0, .3, .4), align: 'center' }); }
  if (S.p === 5) { const a = T(5, .6, .4), b = T(5, 3.2, .4);
    g.save(); g.globalAlpha = a; roundRect(g, 640, 800, 640, 130, 16, '#FFFFFF', LW); tx(g, '保険料', 680, 850, 36); tx(g, '38,348', 1000, 856, 52, { align: 'right', w: 900 }); tx(g, '税金', 680, 910, 36, { color: PAL.grey3 }); tx(g, '5,170', 1000, 912, 44, { align: 'right', w: 900, color: PAL.grey3 }); g.restore();
    if (b > 0) { g.save(); g.globalAlpha = b; tick(g, 1090, 838, 56, 10); cross(g, 1090, 898, 40, 8); g.restore(); } }
};

SET.company = (g, S) => { const T = mkT(S), v = makeView({ cx: 900, cy: 690, s: 2.5 });
  // 手前左=タナカ側、右=会社側、あいだに壁
  box(v, [-6, 0, -60], [0, 150, 120]);
  const tp = [-110, 120]; tk(v, stand(tp, -35, 'a', { lookAt: [0, 100, 30] }));
  box(v, [-150, 0, 10], [-90, 34, 55]);
  tk(v, stand([110, 40], 215, 'b', { lookAt: [-40, 200, -80] })); box(v, [70, 0, -50], [140, 40, 0]);
  cyl(v, [-3, 150, -100], [-3, 178, -100], 26, PAL.metal);
  const k1 = S.p >= 1 ? (S.p > 1 ? 1 : eo(cl((S.lt - .4) / .9))) : 0, k2 = S.p >= 1 ? (S.p > 1 ? 1 : eo(cl((S.lt - 1.5) / .9))) : 0;
  const A = [-125, 40, 30], B = [100, 46, -28], D = [-10, 182, -104];
  if (S.p >= 1) { dashed3(v, A, D, { depth: 1e5 }); dashed3(v, B, D, { depth: 1e5 }); const fly = (a, k, pal) => { if (k <= 0 || k >= 1) return; const q = lerp3(a, D, k); q[1] += Math.sin(k * Math.PI) * 30; slab(v, q, pal, 14, 5, 9, { depth: 2e5 }); }; fly(A, k1, PAL.neu); fly(B, k2, PAL.neu); }
  if (S.p >= 2) { const hd = [-110, 158, 120]; dashed3(v, hd, [-8, 130, 60], { depth: 3e5, p: T(2, 3.9, .5) }); }
  v.flush(g);
  const pA = v.P([-120, 0, 60]), pB = v.P([110, 0, -10]), pD = v.P(D);
  label(g, 'タナカ', pA[0] - 60, 915, 32); label(g, '会社', pB[0] + 130, pB[1] + 120, 32);
  label(g, '保険料', pD[0] + 150, pD[1] - 10, 32, { a: T(1, .2, .4) });
  if (S.p >= 1) { tx(g, '1×', pA[0] - 180, pA[1] - 250, 60, { w: 900, a: k1 }); tx(g, '1×', pB[0] + 170, pB[1] - 140, 60, { w: 900, a: k2 }); }
  if (S.p >= 2) { const a = T(2, .3, .5); tx(g, '額面 ＋ 1割以上', 1560, 330, 48, { align: 'center', a, w: 900 }); const b = T(2, 4.4, .3); if (b > 0) { const q = v.P([-8, 130, 60]); cross(g, q[0] - 6, q[1], 60 * (2 - b), 10); tx(g, '見えるのは半分だけ', pA[0] - 60, 250, 40, { align: 'center', a: b }); } }
};

SET.wait = (g, S) => { const T = mkT(S); stepN(g, 2);
  if (S.p === 0) { const v = makeView({ cx: 640, cy: 700, s: 4.2 }); tk(v, sitCross([-40, 60], -30, 'a', 0, {})); box(v, [20, 0, 0], [90, 40, 50]); box(v, [20, 40, 0], [90, 42.5, 50]); v.flush(g);
    const k = ease(cl((S.lt - 1.3) / .7)), fl = Math.abs(Math.cos(k * Math.PI)); g.save(); g.translate(1400, 240);
    roundRect(g, -170, 0, 340, 380, 12, '#FFFFFF', LW); g.fillStyle = PAL.ink; g.fillRect(-170, 0, 340, 70); g.save(); g.translate(0, 230); g.scale(1, Math.max(.02, fl)); tx(g, k < .5 ? '1年目' : '2年目', 0, -40, 54, { align: 'center' }); tx(g, k < .5 ? '4月' : '6月', 0, 90, 130, { align: 'center', w: 900 }); g.restore(); g.restore(); return; }
  if (S.p === 1) { const v = makeView({ cx: 470, cy: 640, s: 2.5 }), e1 = [.7071, 0, -.7071], names = ['学生', '1年目', '2年目'], bill = ['—', 'ほぼ0', '月 約1万円'];
    const C = [0, 1, 2].map((i) => mul3(e1, i * 185)); C.forEach((c, i) => { box(v, [c[0] - 45, 0, c[2] - 45], [c[0] + 45, 3, c[2] + 45]); tk(v, (i === 2 ? scratch : stand)([c[0], c[2]], 20, 'a', { y0: 3 })); }); v.flush(g);
    C.forEach((c, i) => { const q = v.P([c[0], 0, c[2]]), a = ease(cl((S.lt - .2 - i * .25) / .4)); label(g, names[i], q[0], 170, 40, { a }); tx(g, '住民税', q[0], 870, 26, { align: 'center', w: 500, color: PAL.grey3, a }); label(g, bill[i], q[0], 915, 34, { a: ease(cl((S.lt - (i === 2 ? 4.4 : i === 1 ? S.sub(1) + .4 : .6)) / .4)), fill: i === 2 ? PAL.neu.top : '#FFFFFF' }); });
    [0, 1].forEach((i) => { const a = v.P([C[i][0], 0, C[i][2]]), b = v.P([C[i + 1][0], 0, C[i + 1][2]]), k = ease(cl((S.lt - (i ? 4.0 : 1.4)) / .6)); if (k <= 0) return; const pts = []; for (let j = 0; j <= 20 * k; j++) { const u = j / 20; pts.push([a[0] + 40 + (b[0] - a[0] - 60) * u, 230 + Math.sin(u * Math.PI) * 26 + (915 - 300) * u * u * .0 + (u > .6 ? (u - .6) * 0 : 0)]); } if (pts.length > 2) arrow2(g, pts, 12); });
    tx(g, '前の年の稼ぎに、1年遅れでかかる', 960, 100, 36, { align: 'center', w: 500, a: ease(cl((S.lt - 1.2) / .4)) }); return; }
  // less
  const v = makeView({ cx: 640, cy: 780, s: 3.0 }), vg = makeView({ cx: 640, cy: 780, s: 3.0 }), e1 = [.7071, 0, -.7071];
  tk(v, scratch([-130, 110], -40, 'a', { lookAt: [150, 80, -150] }));
  const col = (i, gross, net, up) => { const c = mul3(e1, 60 + i * 170); box(v, [c[0] - 30, 0, c[2] - 30], [c[0] + 30, net, c[2] + 30]); box(vg, [c[0] - 30, net, c[2] - 30], [c[0] + 30, gross, c[2] + 30]); if (up) box(v, [c[0] - 30, gross, c[2] - 30], [c[0] + 30, gross + up, c[2] + 30], PAL.neu, { depth: 1e5 }); return c; };
  const k = T(2, 2.2, .8), c0 = col(0, 150, 124, 0), c1 = col(1, 150, 124 - 14 * k, 9 * ease(cl((S.lt - .4) / .6)));
  v.flush(g); ghostFlush(vg, g, 1);
  [c0, c1].forEach((c, i) => { const q = v.P([c[0], 0, c[2]]); label(g, i ? '2年目' : '1年目', q[0], q[1] + 90, 38); });
  const q0 = v.P([c0[0] - 30, 150, c0[2] + 30]), q1 = v.P([c1[0] + 30, 160, c1[2] - 30]), n1 = v.P([c1[0] + 30, 115, c1[2] - 30]);
  tx(g, '額面', q0[0] - 110, q0[1] + 40, 34, { w: 500 }); tx(g, '手取り', q0[0] - 140, q0[1] + 190, 34, { w: 500 });
  tx(g, '昇給', q1[0] + 30, q1[1] + 10, 36, { a: ease(cl((S.lt - .6) / .4)) });
  if (k > 0) { arrow2(g, [[n1[0] + 60, n1[1] - 50], [n1[0] + 60, n1[1] + 40 * k + 10]], 16, { fill: PAL.red }); tx(g, '手取りは減る', n1[0] + 100, n1[1] + 20, 40, { color: PAL.red, a: k }); }
  note(g, '※イメージ図');
};

function cols(g, S, o) { const T = mkT(S), v = makeView({ cx: 640, cy: 790, s: 3.1 }), e1 = [.7071, 0, -.7071];
  tx(g, o.title, 960, 110, 44, { align: 'center' }); if (o.sub) tx(g, o.sub, 960, 160, 28, { align: 'center', w: 500, color: PAL.grey3 });
  const sh = o.show ?? 1; const C = [0, 1].map((i) => mul3(e1, 20 + i * 215));
  C.forEach((c, i) => { const pct = o.v[i], kk = i ? sh : 1; box(v, [c[0] - 22, 0, c[2] - 22], [c[0] + 22, 120 - pct * 1.2, c[2] + 22]); if (kk > 0) box(v, [c[0] - 22, 120 - pct * 1.2, c[2] - 22], [c[0] + 22, 120, c[2] + 22], i === 1 ? PAL.neu : { top: PAL.grey1, z: PAL.grey1, x: PAL.grey2 });
    tk(v, stand([c[0] - 48, c[2] + 48], -45, 'a', { lookAt: [c[0], 125, c[2]] })); });
  v.flush(g);
  C.forEach((c, i) => { const q = v.P([c[0], 0, c[2]]), top = v.P([c[0], 120 - o.v[i] * .6, c[2] + 22]); label(g, o.yr[i], q[0] - 10, q[1] + 110, 40);
    const a = i ? sh : (o.show0 ?? 1); if (a <= 0) return; g.save(); g.globalAlpha = a; const mx = q[0] + (i ? 330 : -300), my = 400;
    magnifier(g, top, mx, my, 150, (gg) => { const hh = o.v[i] * 14; gg.fillStyle = '#ECE8DF'; gg.fillRect(mx - 150, my - 20 + hh / 2, 300, 300); gg.fillStyle = i ? PAL.neu.top : PAL.grey1; gg.fillRect(mx - 150, my - 20 - hh / 2, 300, hh); gg.strokeStyle = PAL.ink; gg.lineWidth = LW; gg.strokeRect(mx - 160, my - 20 - hh / 2, 320, hh);
      tx(gg, o.v[i] + '%', mx, my + 6 + (hh < 70 ? 90 : 0), 64, { align: 'center', w: 900 }); }, { spotR: 16 }); g.restore(); });
  if (o.arrow && sh > 0) { tx(g, o.arrow, 1640, 660, 52, { align: 'center', a: sh, color: o.arrowColor || PAL.ink, w: 900 }); }
}
SET.cmp = (g, S) => { const T = mkT(S); cols(g, S, { title: '厚生年金の保険料（本人が払うぶん）', sub: '給料に対する割合', yr: ['1980年', '今'], v: [5.3, 9.15], show0: S.p >= 1 ? T(1, .8, .4) : 0, show: S.p >= 1 ? T(1, 5.6, .4) : 0 }); };
SET.tax = (g, S) => { const t1 = S.sub(1); cols(g, S, { title: '所得税 ＋ 住民税', sub: '30代前半の男性・給料に対する割合', yr: ['1980年', '2005年'], v: [9.22, 6.39], show0: ease(cl((S.lt - t1 - 2.2) / .4)), show: ease(cl((S.lt - t1 - 6.0) / .4)), arrow: '軽くなった', arrowColor: PAL.blue }); };

SET.stairs = (g, S) => { const v = makeView({ cx: 330, cy: 880, s: 2.5 }), N = 13, lt = S.lt;
  const k = cl(lt / Math.max(4.5, S.sub(1) - .3)), up = k * (N - .2);
  for (let i = 0; i < N; i++) { const a = eo(cl((lt - i * .08) / .3)); if (a <= 0) continue; box(v, [0, 0, -(i + 1) * 15], [46, (i + 1) * 4 * a, -i * 15], i === Math.floor(up) ? PAL.neu : PAL.part); }
  const si = Math.min(N - 1, Math.floor(up)), fr = up - si; tk(v, read([23, -(up + .5) * 15], -90, 'a', { y0: (si + 1) * 4 + (fr > .7 && si < N - 1 ? (fr - .7) / .3 * 4 : 0), feet: walkFeet(up * 1.0, 16, 9) }));
  // 鍋とカエル
  const t1 = S.sub(1), kp = eo(cl((lt - t1) / .5)); if (kp > 0) { const px = 200, pz = -260; cyl(v, [px, 0, pz], [px, 30 * kp, pz], 30, PAL.metal); cyl(v, [px, 30 * kp, pz], [px, 30.5 * kp, pz], 26, { top: '#FFFFFF', z: '#FFFFFF', x: '#FFFFFF' }, { bias: 1 });
    blob(v, [[[px, 33, pz], 9], [[px + 3, 36, pz + 3], 7]], '#FFFFFF', { bias: 10 }); blob(v, [[[px + 8, 43, pz + 1], 2.6]], '#FFFFFF', { bias: 12 }); blob(v, [[[px + 2, 43, pz + 8], 2.6]], '#FFFFFF', { bias: 12 }); }
  v.flush(g);
  const b = v.P([46, 0, 0]), t = v.P([46, N * 4, -N * 15]); label(g, '2004年', b[0] + 120, b[1] - 6, 38); label(g, '2017年', t[0] + 110, t[1] - 10, 38, { a: cl(k * 3 - 2) });
  tx(g, '13年間、毎年少しずつ', 1000, 250, 48, { a: ease(cl((lt - .8) / .4)) });
  if (kp > 0) { const q = v.P([200, 30, -260]); for (let i = -1; i <= 1; i++) { const yy = ((lt * 30 + i * 20) % 60); dashed(g, [q[0] + i * 34, q[1] - 70 - yy], [q[0] + i * 34 + 6, q[1] - 110 - yy], { lw: 3 }); } tx(g, 'まだ気づかない', q[0] + 110, q[1] - 30, 38, { a: kp, w: 500 }); }
};

SET.culprit = (g, S) => { const lt = S.lt, t1 = S.sub(1), a = ease(cl(lt / .4)); g.save(); g.globalAlpha = a;
  roundRect(g, 260, 200, 1400, 620, 24, '#FFFFFF', LW * 1.2); g.beginPath(); g.moveTo(960, 200); g.lineTo(960, 820); g.lineWidth = LW; g.stroke();
  tagShape(g, 480, 340, 260, 300, '税金', { size: 80 }); tagShape(g, 1120, 340, 380, 300, '年金の保険料', { size: 54 }); g.restore();
  tx(g, '9.22% → 6.39%', 610, 730, 44, { align: 'center', a, w: 900 }); tx(g, '5.3% → 9.15%', 1310, 730, 44, { align: 'center', a, w: 900 });
  const k1 = cl((lt - 1.3) / .2), k2 = cl((lt - t1 - .9) / .2); if (k1 > 0) cross(g, 760, 330, 110 * (2 - k1), 18); if (k2 > 0) tick(g, 1530, 320, 130 * (2 - k2), 20);
  if (k2 > 0) tx(g, '犯人', 1310, 910, 60, { align: 'center', w: 900, a: k2 });
};

SET.io = (g, S) => { const T = mkT(S), v = makeView({ cx: 960, cy: 560, s: 4.2 }), vg = makeView({ cx: 960, cy: 560, s: 4.2 }), t = S.t;
  box(v, [-120, 0, -16], [120, 4, 16]);
  box(v, [-34, 4, -18], [34, 44, -16]); box(v, [-34, 44, -18], [34, 46, 18], PAL.part, { bias: 60 }); box(v, [-34, 4, 16], [34, 44, 18], PAL.part, { bias: 80 });
  faceText(v, [-22, 34, 18.2], [1, 0, 0], [0, -1, 0], '財布', 16, { depth: 1e5 });
  const run = S.p >= 1 ? 1 : 0; for (let i = 0; i < 5; i++) { const x = -150 + (((run ? t * 34 : 60) + i * 60) % 300); if (x < -118 || x > 104 || (x > -40 && x < 26)) continue; const th = x < -70 ? 5 : x < 60 ? 3.6 : 2.6; slab(v, [x, 4, -5], PAL.part, 14, th, 10); }
  const hIn = { palmAt: [-72, 17, -1], dir: [0, 0, 1], palm: [0, -1, 0], side: 'r', pose: 'grip', r: 2, armLen: 7, sleeve: PAL.grey1, bias: 100 };
  const kb = S.p >= 1 ? 1 : 0, bob = (ph) => Math.sin(t * 2.2 + ph) * 1.5 * kb; hand(v, { ...hIn, palmAt: [-72, 17 + bob(0), -1] });
  const solid = S.p > 0 ? 1 : cl((S.lt - S.sub(2) - 1.6) / .3); const hOut = { palmAt: [72, 15 + bob(2), 1], dir: [0, 0, -1], palm: [0, -1, 0], side: 'l', pose: 'grip', r: 2, armLen: 7, sleeve: PAL.neu.top, bias: 100 };
  if (solid >= 1) hand(v, hOut); v.flush(g);
  if (solid < 1 && S.lt > S.sub(1) - .2) { hand(vg, { ...hOut, sleeve: '#FFFFFF' }); ghostFlush(vg, g, 1); }
  const pin = v.P([-120, 4, 0]), pout = v.P([120, 4, 0]); label(g, '入口', pin[0] + 10, pin[1] - 90, 36); label(g, '出口', pout[0] - 10, pout[1] + 80, 36);
  arrow2(g, [[pin[0] - 110, pin[1] - 66], [pin[0] - 30, pin[1] - 20]], 16); arrow2(g, [[pout[0] + 30, pout[1] + 16], [pout[0] + 110, pout[1] + 62]], 16);
  label(g, '保険料', 1330, 170, 36);
  const q = [560, 900]; if (S.lt > S.sub(1) - .2 || S.p > 0) { label(g, '消費税', q[0], q[1] - 70, 36, { fill: solid >= 1 ? PAL.neu.top : '#FFFFFF' }); tx(g, solid >= 1 ? '今：10%' : '1980年：なし', q[0] + 110, q[1] - 56, 40, { w: 900 }); }
};

SET.news = (g, S) => { const v = makeView({ cx: 960, cy: 700, s: 3.0 }), lt = S.lt, t1 = S.sub(1);
  cyl(v, [-150, 0, 0], [-150, 70, 0], 4); box(v, [-215, 70, -3], [-85, 150, 3]); faceText(v, [-205, 140, 3.2], [1, 0, 0], [0, -1, 0], '過去最高', 22, { depth: 1e5 }); faceText(v, [-207, 108, 3.2], [1, 0, 0], [0, -1, 0], '262,300', 28, { depth: 1e5 });
  box(v, [40, 0, 0], [110, 40, 50]); box(v, [40, 40, 0], [110, 42.5, 50], PAL.part, { xf: rotAbout([40, 40, 0], [1, 0, 0], -1.95) }); faceText(v, [45, 31, 50.2], [1, 0, 0], [0, -1, 0], '262,300', 14.5, { depth: 1e5 });
  tk(v, read([185, 15], 180, 'a', { lookAt: [75, 40, 25] })); v.flush(g);
  const pb = v.P([-150, 150, 0]), px = v.P([75, 40, 25]); label(g, '箱の数字', pb[0], pb[1] - 60, 36);
  const a = ease(cl((lt - t1) / .4)); if (a > 0) { g.save(); g.globalAlpha = a; magnifier(g, px, 1500, 330, 190, (gg) => { tx(gg, '箱の中身', 1500, 280, 34, { align: 'center', w: 500 }); tx(gg, '218,782', 1500, 380, 78, { align: 'center', w: 900 }); }, { spotR: 30 }); g.restore(); }
};

SET.shop = (g, S) => { const T = mkT(S), v = makeView({ cx: 470, cy: 820, s: 3.0 }); stepN(g, 3);
  const L = 52; for (let lane = 0; lane < 2; lane++) for (let j = 0; j < 5; j++) box(v, [lane * 62, 0, -(j + 1) * L], [lane * 62 + 44, 1.5, -j * L + -2]);
  const kw = S.p >= 1 ? (S.p > 1 ? 1 : ease(cl((S.lt - 1.0) / 1.6))) : 0, kp = S.p >= 2 ? (S.p > 2 ? 1 : ease(cl((S.lt - 2.2) / 1.6))) : 0;
  const zw = -(kw * 2.3) * L, zp = -(kp * 3.7) * L;
  tk(v, (kw > 0 && kw < 1 ? stand : handsOnHips)([22, zw - 4], -90, 'a', { y0: 1.5, ...(kw > 0 && kw < 1 ? { feet: walkFeet(kw * 6, 20, 9) } : {}) }));
  box(v, [62, 1.5, zp - 6], [106, 62, zp - 2]); faceText(v, [66, 46, zp - 1.8], [1, 0, 0], [0, -1, 0], '値札', 18, { depth: v.depth([84, 20, zp]) + 10 });
  v.flush(g);
  for (let j = 1; j <= 5; j++) { const q = v.P([120, 0, -j * L]); tx(g, String(j), q[0], q[1] + 14, 34, { w: 500, color: PAL.grey2 }); }
  const qw = v.P([22, 175, zw]), qp = v.P([84, 66, zp]);
  label(g, '給料', qw[0] - 150, qw[1] + 40, 34); if (kw > 0) tx(g, '+' + (2.3 * kw).toFixed(1) + '%', qw[0] - 150, qw[1] - 20, 60, { align: 'center', w: 900 });
  if (kp > 0) tx(g, '+' + (3.7 * kp).toFixed(1) + '%', qp[0] + 210, qp[1] + 30, 60, { align: 'center', w: 900, color: S.p >= 2 ? PAL.red : PAL.ink });
  if (S.p >= 3) { const a = T(3, .8, .5), a1 = v.P([52, 2, zw]), a2 = v.P([52, 2, zp]); arrow2(g, [a1, [a1[0] + (a2[0] - a1[0]) * a, a1[1] + (a2[1] - a1[1]) * a]], 14, { fill: PAL.red }); tx(g, '追いつけない', 1330, 720, 52, { color: PAL.red, a }); }
  tx(g, '2025年', 1700, 130, 48, { align: 'center', a: T(1, .1, .4) });
};

SET.rice = (g, S) => { const v = makeView({ cx: 700, cy: 760, s: 3.2 }), e1 = [.7071, 0, -.7071], lt = S.lt, t1 = S.sub(1);
  const bag = (c, a) => { if (a <= 0) return; box(v, [c[0] - 22, 0, c[2] - 11], [c[0] + 22, 58 * a, c[2] + 11]); if (a >= 1) faceText(v, [c[0] - 13, 46, c[2] + 11.2], [1, 0, 0], [0, -1, 0], '米', 26, { depth: 1e5 }); };
  const coins = (c, n) => { for (let i = 0; i < n; i++) cyl(v, [c[0], i * 3.2, c[2]], [c[0], i * 3.2 + 2.6, c[2]], 11, PAL.metal, { bias: i * .1 }); };
  const c0 = mul3(e1, 0), c1 = mul3(e1, 250), k = cl((lt - t1 - .4) / 1.6);
  bag(c0, 1); coins(add3(c0, mul3(e1, 62)), 10); bag(c1, eo(cl((lt - t1) / .4))); if (lt > t1) coins(add3(c1, mul3(e1, 62)), Math.round(10 + 7 * k));
  tk(v, scratch([-95, 75], -40, 'a', { lookAt: [c1[0], 60, c1[2]] })); v.flush(g);
  const q0 = v.P(c0), q1 = v.P(c1); label(g, '2024年', q0[0] + 60, q0[1] + 120, 38); if (lt > t1) label(g, '2025年', q1[0] + 60, q1[1] + 120, 38);
  tx(g, '1.0', q0[0] + 130, q0[1] - 150, 50, { w: 900, align: 'center' }); if (lt > t1) tx(g, (1 + .7 * k).toFixed(1), q1[0] + 130, q1[1] - 215, 76, { w: 900, align: 'center', color: PAL.red }); if (k >= 1) tx(g, '倍近く', q1[0] + 250, q1[1] - 215, 40, { color: PAL.red });
};

SET.food = (g, S) => { const v = makeView({ cx: 620, cy: 770, s: 3.0 }), e1 = [.7071, 0, -.7071], lt = S.lt, t1 = S.sub(1), up = ease(cl((lt - t1 - .5) / .8));
  const st = (c, n, f) => { for (let i = 0; i < n; i++) { const isF = i < f; slab(v, [c[0] - 20, i * 7, c[2] - 14], isF ? PAL.neu : PAL.part, 40, 7, 28); } };
  const c0 = mul3(e1, 0), c1 = mul3(e1, 290); st(c0, 6, 2 + up); st(c1, 15, 2 + up);
  tk(v, stand([c0[0] - 60, c0[2] + 60], -45, 'a', { lookAt: [c0[0], 20, c0[2]] })); tk(v, handsOnHips([c1[0] - 60, c1[2] + 60], -45, { shirt: PAL.grey1, pants: PAL.grey3, shoes: '#3E3C39', hair: PAL.grey2, skin: '#FFFFFF', bun: false, scale: 1.04 }, {}));
  v.flush(g);
  const q0 = v.P(c0), q1 = v.P(c1); label(g, 'タナカ', q0[0], q0[1] + 120, 36); label(g, '稼ぎの多い人', q1[0], q1[1] + 120, 36);
  [q0, q1].forEach((q) => { label(g, '食費', q[0] + 170, q[1] - 20, 32, { fill: PAL.neu.top }); });
  if (up > 0) { [q0, q1].forEach((q) => arrow2(g, [[q[0] + 170, q[1] - 60], [q[0] + 170, q[1] - 60 - 60 * up]], 14, { fill: PAL.red })); tx(g, '同じ値上げでも', 960, 130, 44, { align: 'center', a: up }); }
  note(g, '※イメージ図');
};

SET.real = (g, S) => { const lt = S.lt, a1 = ease(cl((lt - .2) / .4)), a2 = ease(cl((lt - 1.2) / .4)), a3 = cl((lt - 2.6) / .25);
  roundRect(g, 420, 150, 1080, 700, 20, '#FFFFFF', LW * 1.2);
  tx(g, '給料', 520, 300, 56, { a: a1 }); tx(g, '+2.3%', 1400, 304, 84, { align: 'right', w: 900, a: a1 });
  tx(g, '物価', 520, 450, 56, { a: a2 }); tx(g, '+3.7%', 1400, 454, 84, { align: 'right', w: 900, a: a2 });
  g.fillStyle = PAL.ink; g.fillRect(500, 520, 920, 5);
  if (a3 > 0) { g.save(); g.translate(960, 700); g.scale(2 - a3, 2 - a3); g.globalAlpha = a3; tx(g, '実質賃金', -440, 20, 56); tx(g, '−1.3%', 440, 40, 150, { align: 'right', w: 900, color: PAL.red }); g.restore(); }
};

SET.shrink = (g, S) => { const v = makeView({ cx: 760, cy: 760, s: 4.2 }), vg = makeView({ cx: 760, cy: 760, s: 4.2 }), lt = S.lt, t1 = S.sub(1), k = 1 - .26 * ease(cl((lt - 1.0) / 2.2));
  box(vg, [0, 0, 0], [70, 40, 50]); ghostFlush(vg, g, 1);
  const cx = 35, cz = 25, a = [cx - 35 * k, 0, cz - 25 * k], b = [cx + 35 * k, 40 * k, cz + 25 * k]; box(v, a, b);
  faceText(v, [a[0] + 4 * k, b[1] - 9 * k, b[2] + .2], [1, 0, 0], [0, -1, 0], '262,300', 14.5, { depth: 1e5 });
  tk(v, scratch([-80, 125], -42, 'a', { lookAt: [35, 30, 25] })); v.flush(g);
  const q = v.P([cx, 20, 50]); label(g, '数字はそのまま', 1380, 300, 38, { a: ease(cl((lt - .3) / .4)) }); dashed(g, [1250, 330], [q[0] + 40, q[1] - 10], { lw: 3 });
  const c = ease(cl((lt - t1) / .4)); if (c > 0) { label(g, '静かな給料カット', 1380, 600, 44, { a: c, fill: PAL.neu.top }); }
  note(g, '※イメージ図');
};

SET.page = (g, S) => { const lt = S.lt, cells = [['hands', 5, 1], ['hands', 7, 2], ['shop', 3, 3]];
  cells.forEach(([nm, p, n], i) => { const a = ease(cl((lt - .2 - i * .5) / .5)); if (a <= 0) return; const x = 70 + i * 450, y = 250, w = 420, h = 236;
    g.save(); g.globalAlpha = a; roundRect(g, x, y, w, h, 12, '#FBF9F4', LW); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.translate(x, y); g.scale(w / W, w / W); SET[nm](g, { p, lt: 99, dur: 99, t: S.t, sub: () => 0 }); g.restore(); });
  const a4 = ease(cl((lt - S.sub(2)) / .5)); if (a4 > 0) { g.save(); g.globalAlpha = a4; g.setLineDash([6, 12]); g.lineWidth = 3; g.strokeStyle = PAL.ink; g.strokeRect(70 + 3 * 450, 250, 420, 236); g.restore(); tx(g, '4', 1440, 440, 150, { w: 900, a: a4 }); tx(g, '？', 1630, 420, 110, { w: 900, a: a4, color: PAL.grey2 }); }
  tx(g, '箱の数字：過去最高', 960, 660, 56, { align: 'center', a: ease(cl((lt - .3) / .4)) });
  tx(g, '中身：抜かれて、縮む', 960, 760, 56, { align: 'center', a: ease(cl((lt - S.sub(1)) / .4)), color: PAL.red });
  tx(g, 'まだ、つづきがある', 960, 880, 40, { align: 'center', w: 500, a: a4 });
};


const OLD = { shirt: PAL.grey1, pants: PAL.grey3, shoes: '#3E3C39', hair: '#FFFFFF', skin: '#FFFFFF', bun: false, scale: .96 };
function crowd(g, S, marked, mode, title) { const v = makeView({ cx: 330, cy: 520, s: 2.3 }), e1 = [.7071, 0, -.7071], e2 = [.7071, 0, .7071], lt = S.lt;
  for (let i = 0; i < 10; i++) { const c = add3(mul3(e1, (i % 5) * 68), mul3(e2, Math.floor(i / 5) * 125)), on = i < marked && lt > .8 + i * .18;
    tk(v, (mode === 'worry' && on ? scratch : stand)([c[0], c[2]], 35, 'a', {}));
    if (mode === 'bill' && on) slab(v, [c[0] + 22, 96, c[2] + 6], PAL.neu, 22, 1.5, 15, { bias: 60 }); }
  v.flush(g); const q = v.P([0, 0, 0]); label(g, 'タナカ', q[0] - 110, q[1] - 40, 30);
  tx(g, title, 1500, 420, 64, { align: 'center', w: 900, a: ease(cl((lt - 2.2) / .4)) }); tx(g, '10人のうち', 1500, 330, 34, { align: 'center', w: 500, a: ease(cl((lt - .5) / .4)) });
}
SET.bill = (g, S) => { stepN(g, 4); if (S.p === 1) { crowd(g, S, 5, 'bill', '約半分'); label(g, '奨学金', 1500, 520, 36, { fill: PAL.neu.top, a: ease(cl((S.lt - 2.4) / .4)) }); return; }
  const v = makeView({ cx: 760, cy: 660, s: 3.8 }), k = eo(cl((S.lt - 1.4) / 1.0)); box(v, [0, 0, 0], [70, 40, 50]); tk(v, (k >= 1 ? scratch : stand)([-80, 125], -42, 'a', { lookAt: [35, 44, 25] }));
  const A = [190, 150, -90], B = [22, 42.5, 16]; dashed3(v, A, B, { depth: 1e5 }); const q = lerp3(A, B, k); slab(v, q, PAL.neu, 30, 1.2, 20, { depth: 2e5 }); v.flush(g);
  const p = v.P(A); label(g, '請求書', p[0] + 20, p[1] - 50, 40, { fill: PAL.neu.top, a: ease(cl((S.lt - .9) / .4)) }); tx(g, '同封されていません', p[0] + 20, p[1] + 30, 30, { align: 'center', w: 500, color: PAL.grey3, a: ease(cl((S.lt - 2.4) / .4)) });
};
SET.seven = (g, S) => { crowd(g, S, 7, 'worry', '約7割が不安'); };
SET.loan = (g, S) => { const T = mkT(S), v = makeView({ cx: 250, cy: 850, s: 2.6 }), N = 15, L = 30;
  const k = S.p >= 1 ? (S.p > 1 ? 1 : ease(cl((S.lt - .6) / 5.2))) : 0, at = k * N;
  for (let i = 0; i < N; i++) { const done = i < Math.floor(at); box(v, [0, 0, -(i + 1) * L + 2], [44, 2, -i * L], done ? { top: PAL.grey1, z: PAL.grey1, x: PAL.grey2 } : PAL.part); if (!done) slab(v, [14, 2, -(i + 1) * L + 10], PAL.neu, 16, 2.4, 10); }
  tk(v, k > 0 && k < 1 ? stand([22, -at * L - 4], -90, 'a', { y0: 2, feet: walkFeet(at * 1.0, 18, 9) }) : scratch([22, -at * L - 4], -90, 'a', { y0: 2 })); v.flush(g);
  const a = v.P([60, 0, 0]), b = v.P([60, 0, -N * L]); label(g, '22歳', a[0] + 110, a[1] - 20, 38); label(g, '37歳', b[0] + 80, b[1] + 20, 38);
  tx(g, '借りた額', 1180, 560, 32, { w: 500 }); tx(g, '2,400,000', 1840, 566, 70, { w: 900, align: 'right' });
  tx(g, '毎月の返済', 1180, 680, 32, { w: 500, a: T(0, 2.6, .4) }); tx(g, '約14,000', 1840, 686, 70, { w: 900, align: 'right', a: T(0, 2.6, .4) });
  tx(g, '期間', 1180, 800, 32, { w: 500, a: T(0, 4.4, .4) }); tx(g, '15年', 1840, 806, 70, { w: 900, align: 'right', a: T(0, 4.4, .4) });
  if (S.p >= 1) tx(g, Math.round(22 + at) + '歳', 1520, 400, 130, { w: 900 });
};
SET.offslip = (g, S) => { const lt = S.lt, rows = [['総支給額', '262,300'], ['厚生年金', '−23,790'], ['健康保険', '−13,115'], ['雇用保険', '−1,443'], ['所得税', '−5,170']];
  roundRect(g, 300, 120, 700, 780, 8, '#FFFFFF', LW * 1.2); tx(g, '給与明細', 650, 200, 48, { align: 'center' }); g.fillStyle = PAL.ink; g.fillRect(340, 230, 620, 4);
  rows.forEach((r, i) => { tx(g, r[0], 360, 320 + i * 90, 38, { w: i ? 500 : 700 }); tx(g, r[1], 940, 322 + i * 90, 44, { align: 'right', w: 900 }); }); g.fillRect(340, 730, 620, 4); tx(g, '差引支給額', 360, 820, 38); tx(g, '218,782', 940, 824, 56, { align: 'right', w: 900 });
  const a = ease(cl((lt - 1.2) / .5)); if (a > 0) { g.save(); g.globalAlpha = a; g.setLineDash([8, 12]); g.lineWidth = 3; g.strokeStyle = PAL.ink; g.strokeRect(1150, 420, 600, 220); g.setLineDash([]); tx(g, '奨学金の返済', 1190, 500, 40); tx(g, '−約14,000', 1710, 600, 64, { align: 'right', w: 900, color: PAL.red }); g.restore();
    label(g, '明細の外', 1450, 360, 40, { a, fill: PAL.neu.top }); }
  const b = ease(cl((lt - S.sub(1) - 2.6) / .5)); if (b > 0) arrow2(g, [[1010, 800], [1250, 800], [1450, 800 - 130 * b]], 16, { fill: PAL.red });
};
SET.q = (g, S) => { const lt = S.lt, v = makeView({ cx: 380, cy: 800, s: 3.2 }); tk(v, scratch([0, 0], 20, 'a', {})); v.flush(g);
  roundRect(g, 620, 250, 1080, 180, 30, '#FFFFFF', LW); tx(g, '若者は、どんどん貧しくなっている？', 1160, 360, 52, { align: 'center' });
  const k = cl((lt - S.sub(1) - .4) / .25); if (k > 0) { g.save(); g.translate(1160, 640); g.rotate(-.08); g.scale(2 - k, 2 - k); g.globalAlpha = k; g.strokeStyle = PAL.red; g.lineWidth = 8; g.strokeRect(-420, -70, 840, 140); tx(g, '今日いちばんのネタバレ', 0, 24, 68, { align: 'center', color: PAL.red, w: 900 }); g.restore(); }
};
const B45 = [[1980, 52], [1996, 86], [2015, 85], [2019, 96], [2024, 89]];
SET.b45 = (g, S) => { const T = mkT(S), v = makeView({ cx: 430, cy: 800, s: 2.2 }), e1 = [.7071, 0, -.7071]; stepN(g, 5);
  const ph = [1, 2, 3, 4, 6], P2 = [];
  B45.forEach(([yr, val], i) => { const a = S.p > ph[i] ? 1 : S.p < ph[i] ? 0 : eo(cl((S.lt - (i === 4 ? S.sub(1) + 2.6 : i === 0 ? .6 : .3)) / .7)); if (a <= 0) return; const c = mul3(e1, 60 + i * 130), sc = Math.pow(val / 96, .9) * a, w = 34 * sc, d = 26 * sc, h = 60 * sc;
    box(v, [c[0] - w, 0, c[2] - d], [c[0] + w, h * 1.6, c[2] + d], (i === 3 && S.p === 4) || (i === 4 && S.p === 6) ? PAL.neu : PAL.part); P2.push([i, yr, c, h * 1.6, a]); });
  tk(v, (S.p >= 6 ? scratch : S.p >= 4 ? handsOnHips : stand)([-70, 110], -40, 'a', { lookAt: [300, 60, -300] })); v.flush(g);
  P2.forEach(([i, yr, c, h, a]) => { const q = v.P([c[0], 0, c[2]]), t = v.P([c[0], h, c[2]]); label(g, yr + '年', q[0] + 20, q[1] + 90, 34, { a });
    if (i === 3 && S.p >= 4) tx(g, '過去最高', t[0], t[1] - 60, 44, { align: 'center', w: 900, a: T(4, 1.6, .4) });
    if (i === 4 && S.p >= 6) { arrow2(g, [[t[0] + 90, t[1] - 90], [t[0] + 90, t[1] - 20]], 16, { fill: PAL.red }); tx(g, '物価高', t[0] + 120, t[1] - 50, 40, { color: PAL.red, a }); } });
  tx(g, '本当に使えるお金（税・保険料・物価を引いたあと）', 1040, 110, 36, { align: 'center', a: T(1, 4.6, .4) }); tx(g, '20〜34歳・扶養家族なし・フルタイムの会社員', 1040, 160, 26, { align: 'center', w: 500, color: PAL.grey3, a: T(1, 4.6, .4) });
  if (S.p === 3) tx(g, '20年ほど横ばい', 1000, 300, 48, { align: 'center', a: T(3, .5, .4) });
  if (S.p === 5) { const a = T(5, 1.2, .3); g.save(); g.globalAlpha = a; tick(g, 1500, 330, 110, 18); g.restore(); tx(g, '貧しくなり続けたわけではない', 1040, 300, 44, { align: 'center', a }); }
  if (S.p >= 1) note(g, '※箱の大きさはイメージ（大和総研の推計の傾向をなぞったもの）');
};
SET.except = (g, S) => { const v = makeView({ cx: 760, cy: 760, s: 4.0 }), vg = makeView({ cx: 760, cy: 760, s: 4.0 }), lt = S.lt, k = .929;
  box(vg, [0, 0, 0], [70, 64, 50]); ghostFlush(vg, g, 1); box(v, [35 - 35 * k, 0, 25 - 25 * k], [35 + 35 * k, 64 * k, 25 + 25 * k]);
  tk(v, handsOnHips([-80, 125], -42, { shirt: '#FFFFFF', pants: PAL.grey3, shoes: '#3E3C39', hair: PAL.grey3, skin: '#FFFFFF', bun: false, scale: 1 }, { lookAt: [35, 40, 25] })); v.flush(g);
  tx(g, '30代前半の男性', 300, 150, 52); const q = v.P([70, 64, 0]); label(g, '1996年', q[0] + 150, q[1] - 10, 36); dashed(g, [q[0] + 80, q[1] - 6], [q[0] + 8, q[1] + 4], { lw: 3 });
  const a = cl((lt - S.sub(2)) / .3); if (a > 0) { tx(g, '2024年', 1480, 470, 40, { align: 'center', w: 500, a }); tx(g, '92.9%', 1480, 610, 130, { align: 'center', w: 900, a, color: PAL.red }); }
  note(g, '※箱の大きさはイメージ');
};
SET.hourly = (g, S) => { const lt = S.lt, v = makeView({ cx: 420, cy: 800, s: 3.2 }); tk(v, handsOnHips([0, 0], 20, 'a', {})); v.flush(g);
  g.save(); g.translate(1000, 480); g.beginPath(); g.arc(0, 0, 190, 0, 7); g.fillStyle = '#FFFFFF'; g.fill(); g.lineWidth = LW * 1.6; g.strokeStyle = PAL.ink; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(a) * 160, Math.sin(a) * 160); g.lineTo(Math.cos(a) * 178, Math.sin(a) * 178); g.lineWidth = 5; g.stroke(); }
  const ha = -Math.PI / 2 + lt * 1.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(ha) * 140, Math.sin(ha) * 140); g.lineWidth = 8; g.lineCap = 'round'; g.stroke(); g.beginPath(); g.moveTo(0, 0); g.lineTo(60, -70); g.stroke(); g.restore();
  tx(g, '1時間あたりで見ると', 1480, 380, 40, { align: 'center', w: 500, a: ease(cl((lt - S.sub(1)) / .4)) }); tx(g, '20代前半', 1480, 480, 56, { align: 'center', a: ease(cl((lt - S.sub(1) - 1.6) / .4)) });
  const k = cl((lt - S.sub(1) - 3.6) / .3); if (k > 0) { tx(g, '45年で最高', 1480, 590, 64, { align: 'center', w: 900, a: k, color: PAL.blue }); g.save(); g.globalAlpha = k; tick(g, 1480, 700, 90, 16); g.restore(); }
};
function cell(g, x, y, w, nm, S0, a, t) { if (a <= 0) return; const h = w * 9 / 16; g.save(); g.globalAlpha = a; roundRect(g, x, y, w, h, 12, '#FBF9F4', LW); g.beginPath(); g.rect(x, y, w, h * .9); g.clip(); g.translate(x, y); g.scale(w / W, w / W); SET[nm](g, { lt: 99, dur: 99, t, sub: () => 0, ...S0 }); g.restore(); }
SET.tricks = (g, S) => { const T = mkT(S), lt = S.lt, items = [['hands', { p: 5 }, '天引き', '届く前に抜かれる'], ['shrink', { p: 0 }, '物価', '買う前に縮む'], ['offslip', { p: 0 }, '奨学金', 'あとから届く']];
  items.forEach(([nm, S0, lab, sub], i) => { const a = S.p > 1 ? 1 : S.p < 1 ? (i === 0 ? 0 : 0) : ease(cl((lt - S.sub(i) - .1) / .4)); const x = 110 + i * 590; if (S.p === 0) { g.save(); g.setLineDash([6, 12]); g.lineWidth = 3; g.strokeStyle = PAL.ink; g.globalAlpha = ease(cl((lt - 1 - i * .5) / .4)); g.strokeRect(x, 300, 520, 292); g.restore(); tx(g, String(i + 1), x + 230, 500, 140, { w: 900, color: PAL.grey2, a: ease(cl((lt - 1 - i * .5) / .4)) }); return; }
    cell(g, x, 300, 520, nm, S0, a, S.t); label(g, lab, x + 260, 650, 44, { a }); tx(g, sub, x + 260, 740, 36, { align: 'center', w: 500, a }); });
  if (S.p === 2) { const a = T(2, S.sub(1) + .8, .3); label(g, '額面マジック', 960, 170, 72, { a, fill: PAL.neu.top }); }
};
SET.fair = (g, S) => { const lt = S.lt; if (S.p === 0) { const v = makeView({ cx: 300, cy: 760, s: 2.6 }), e1 = [.7071, 0, -.7071], t1 = S.sub(1), n = Math.round(3 + 4 * ease(cl((lt - t1 - .8) / 3)));
    for (let i = 0; i < n; i++) { const c = mul3(e1, i * 85); tk(v, stand([c[0], c[2]], 35, OLD, {})); } v.flush(g);
    tx(g, 'お年寄りが増えた', 960, 190, 56, { align: 'center', a: ease(cl((lt - t1 - 1) / .4)) });
    const k = cl((lt - S.sub(2) - .8) / .3); if (k > 0) tx(g, 'だれも、ずるはしていない', 960, 290, 44, { align: 'center', w: 500, a: k }); return; }
  const v = makeView({ cx: 330, cy: 820, s: 3.0 }), e1 = [.7071, 0, -.7071], D = [['ドイツ', 53.4], ['イギリス', 49.8], ['日本', 46.7]], P2 = [];
  D.forEach(([nm, val], i) => { const a = eo(cl((lt - .5 - i * .6) / .6)); if (a <= 0) return; const c = mul3(e1, i * 150); box(v, [c[0] - 28, 0, c[2] - 28], [c[0] + 28, val * 2.6 * a, c[2] + 28], i === 2 ? PAL.neu : PAL.part); P2.push([nm, val, c, a]); }); v.flush(g);
  P2.forEach(([nm, val, c, a]) => { const q = v.P([c[0], 0, c[2]]), t = v.P([c[0], val * 2.6, c[2]]); label(g, nm, q[0], q[1] + 90, 36, { a }); tx(g, val + '%', t[0], t[1] - 50, 54, { align: 'center', w: 900, a }); });
  tx(g, '国民負担率（税 ＋ 社会保険料）', 960, 130, 44, { align: 'center' }); tx(g, '日本は、先進国の真ん中くらい', 960, 215, 48, { align: 'center', w: 500, a: ease(cl((lt - 2.6) / .4)) });
};
SET.plus = (g, S) => { const lt = S.lt, a1 = ease(cl((lt - .3) / .4)), a2 = cl((lt - 3.2) / .25), t2 = S.sub(2);
  roundRect(g, 420, 170, 1080, 640, 20, '#FFFFFF', LW * 1.2); tx(g, '2026年 1〜3月', 520, 300, 56, { a: a1 }); g.fillStyle = PAL.ink; g.fillRect(500, 350, 920, 5);
  if (a2 > 0) { g.save(); g.translate(960, 560); g.scale(2 - a2, 2 - a2); g.globalAlpha = a2; tx(g, '実質賃金', -440, 20, 56); tx(g, '+1.3%', 440, 40, 150, { align: 'right', w: 900, color: PAL.blue }); g.restore(); }
  const k = cl((lt - t2 - .3) / .3); if (k > 0) tx(g, 'この先は ？', 960, 740, 52, { align: 'center', a: k, color: PAL.grey3 });
};
SET.dodont = (g, S) => { const lt = S.lt; roundRect(g, 200, 170, 1520, 640, 24, '#FFFFFF', LW * 1.2); g.beginPath(); g.moveTo(960, 170); g.lineTo(960, 810); g.lineWidth = LW; g.strokeStyle = PAL.ink; g.stroke();
  const v = makeView({ cx: 540, cy: 560, s: 3.6 }); box(v, [0, 0, 0], [70, 40, 50]); box(v, [0, 40, 0], [70, 42.5, 50]); faceText(v, [5, 31, 50.2], [1, 0, 0], [0, -1, 0], '262,300', 14.5); v.flush(g);
  const v2 = makeView({ cx: 1300, cy: 600, s: 5.2 }); box(v2, [-30, 0, -22], [30, 1, 22]); box(v2, [-31.5, 0, -22], [-30, 13, 22]); box(v2, [-30, 0, -23.5], [30, 13, -22]); [-25, -8, 9].forEach((x) => pile(v2, x, -4.5, 14.5)); box(v2, [30, 0, -22], [31.5, 7, 22], PAL.part, { bias: 30 }); box(v2, [-30, 0, 22], [30, 7, 23.5], PAL.part, { bias: 30 }); v2.flush(g);
  label(g, '箱の数字（額面）', 580, 740, 40); label(g, '箱の中身（手取り）', 1340, 740, 40);
  const k1 = cl((lt - 2.0) / .2), k2 = cl((lt - 3.4) / .2); if (k1 > 0) cross(g, 860, 270, 110 * (2 - k1), 18); if (k2 > 0) tick(g, 1620, 270, 120 * (2 - k2), 20);
  tx(g, '＋ それで何が買えたか', 1340, 890, 40, { align: 'center', w: 500, a: ease(cl((lt - S.sub(1) - 2.2) / .4)) });
};
SET.comment = (g, S) => { const v = makeView({ cx: 700, cy: 720, s: 3.6 }), lt = S.lt; box(v, [0, 0, 0], [70, 40, 50]); box(v, [0, 40, 0], [70, 42.5, 50], PAL.part, { xf: rotAbout([0, 40, 0], [1, 0, 0], -1.95) }); tk(v, read([145, 15], 180, 'a', { lookAt: [35, 40, 25] })); v.flush(g);
  const a = ease(cl((lt - .8) / .4)); g.save(); g.globalAlpha = a; magnifier(g, v.P([35, 40, 25]), 1400, 360, 210, (gg) => { tx(gg, '額面の', 1400, 300, 44, { align: 'center', w: 500 }); tx(gg, '？割', 1400, 440, 130, { align: 'center', w: 900 }); }, { spotR: 30 }); g.restore();
  label(g, 'コメント欄で教えてください', 1420, 780, 44, { a: ease(cl((lt - S.sub(1)) / .4)), fill: PAL.neu.top });
};
SET.end = (g, S) => { const lt = S.lt, cells = [['hands', { p: 5 }], ['hands', { p: 7 }], ['shop', { p: 3 }], ['loan', { p: 2 }], ['b45', { p: 7 }], ['tricks', { p: 3 }]];
  cells.forEach(([nm, S0], i) => { const a = ease(cl((lt - .1 - i * .18) / .4)); cell(g, 150 + (i % 3) * 550, 110 + Math.floor(i / 3) * 310, 500, nm, S0, a, S.t); tx(g, String(i + 1), 165 + (i % 3) * 550, 175 + Math.floor(i / 3) * 310, 56, { w: 900, a, halo: 10 }); });
  tx(g, '今日のネタバレは、ここまで', 960, 800, 60, { align: 'center', a: ease(cl((lt - .4) / .4)) }); label(g, 'チャンネル登録・高評価', 960, 890, 40, { a: ease(cl((lt - S.sub(1)) / .4)), fill: PAL.neu.top });
};


SET.y400 = (g, S) => { const lt = S.lt; roundRect(g, 420, 190, 1080, 600, 20, '#FFFFFF', LW * 1.2); tx(g, '年収 400万円', 520, 320, 60); g.fillStyle = PAL.ink; g.fillRect(500, 370, 920, 5);
  tx(g, '手取り', 520, 520, 52, { w: 500 }); tx(g, '20年前より', 520, 610, 40, { w: 500, color: PAL.grey3 }); const k = cl((lt - 3.0) / .25); if (k > 0) { g.save(); g.translate(1400, 600); g.scale(2 - k, 2 - k); g.globalAlpha = k; tx(g, '−18万円', 0, 0, 130, { align: 'right', w: 900, color: PAL.red }); g.restore(); }
  tx(g, '※試算', 1400, 740, 30, { align: 'right', w: 500, color: PAL.grey3 }); };
SET.real4 = (g, S) => { const lt = S.lt; tx(g, '実質賃金（前の年とくらべて）', 960, 200, 44, { align: 'center' });
  [2022, 2023, 2024, 2025].forEach((y, i) => { const k = eo(cl((lt - .6 - i * .5) / .4)); if (k <= 0) return; const x = 330 + i * 330; g.save(); g.globalAlpha = k; roundRect(g, x, 330, 270, 360, 16, '#FFFFFF', LW); tx(g, y + '年', x + 135, 420, 52, { align: 'center' }); arrow2(g, [[x + 135, 470], [x + 135, 470 + 160 * k]], 34, { fill: PAL.red, halo: 0 }); g.restore(); });
  tx(g, '4年連続マイナス', 960, 840, 64, { align: 'center', w: 900, color: PAL.red, a: ease(cl((lt - 2.8) / .4)) }); };
SET.real12 = (g, S) => { const lt = S.lt; tx(g, '2014年からの12年間', 960, 210, 48, { align: 'center' });
  for (let i = 0; i < 12; i++) { const k = eo(cl((lt - .5 - i * .12) / .3)); if (k <= 0) continue; const x = 255 + i * 118, up = i < 3; g.save(); g.globalAlpha = k; roundRect(g, x, 380, 100, 100, 12, '#FFFFFF', LW); if (lt > 2.4 + i * .08) (up ? tick : cross)(g, x + 50, 430, 46, 9); g.restore(); }
  tx(g, '前の年を上回った', 760, 660, 44, { align: 'right', w: 500, a: ease(cl((lt - 3.6) / .4)) }); tx(g, '3回', 800, 680, 130, { w: 900, color: PAL.blue, a: ease(cl((lt - 3.6) / .4)) }); tx(g, '※並びは回数だけを示す', 1850, 944, 22, { w: 500, align: 'right', color: PAL.grey3 }); };
SET.born = (g, S) => { const lt = S.lt, t1 = S.sub(1), v = makeView({ cx: 330, cy: 830, s: 3.0 }); tk(v, (lt > t1 + 1.2 ? scratch : stand)([0, 0], 20, 'a', {})); v.flush(g);
  const x0 = 620, x1 = 1760, y0 = 640, n = 60, k = cl((lt - .6) / 3.2), pts = []; for (let i = 0; i <= n * k; i++) { const u = i / n; pts.push([x0 + (x1 - x0) * u, y0 - (u > .84 ? Math.pow((u - .84) / .16, 1.6) * 300 * cl((lt - t1) / 1.2) : 0)]); }
  g.strokeStyle = PAL.ink; g.lineWidth = LW; g.beginPath(); g.moveTo(x0, 760); g.lineTo(x1 + 30, 760); g.stroke(); if (pts.length > 1) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.lineWidth = 9; g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = lt > t1 ? PAL.red : PAL.ink; g.stroke(); }
  label(g, '値段', x0 + 60, y0 - 70, 38); tx(g, '生まれた年', x0, 820, 30, { w: 500 }); tx(g, '今', x1, 820, 30, { w: 500, align: 'center' }); tx(g, 'ずっと、ほぼ変わらない', 1100, 560, 40, { align: 'center', w: 500, a: ease(cl((lt - 1.6) / .4)) });
  if (lt > t1 + .8) tx(g, '急な値上げ', 1560, 300, 52, { align: 'center', w: 900, color: PAL.red }); note(g, '※線の形はイメージ'); };
SET.daily = (g, S) => { const lt = S.lt, t1 = S.sub(1), t3 = S.sub(3); roundRect(g, 380, 130, 1160, 760, 12, '#FFFFFF', LW * 1.2); g.fillStyle = PAL.ink; g.fillRect(380, 130, 1160, 80);
  for (let i = 0; i < 30; i++) { const c = i % 6, r = Math.floor(i / 6), x = 420 + c * 185, y = 240 + r * 126; roundRect(g, x, y, 160, 104, 8, i === 24 ? PAL.neu.top : '#FBF9F4', LW * .7); tx(g, String(i + 1), x + 12, y + 34, 26, { w: 500, color: PAL.grey3 });
    if (i === 24) tx(g, '給料', x + 80, y + 78, 40, { align: 'center' }); else if (lt > t1 + i * .05) arrow2(g, [[x + 96, y + 88], [x + 96, y + 38]], 12, { fill: PAL.red, halo: 0 }); }
  if (lt > S.sub(2)) { label(g, 'うれしい：年1回', 660, 930, 36, { fill: PAL.neu.top }); label(g, '痛い：毎日', 1240, 930, 36); } };
SET.fairloan = (g, S) => { const lt = S.lt, t1 = S.sub(1); roundRect(g, 360, 220, 1200, 540, 20, '#FFFFFF', LW * 1.2); tx(g, '奨学金', 960, 320, 56, { align: 'center' }); g.fillStyle = PAL.ink; g.fillRect(440, 360, 1040, 5);
  const a = ease(cl((lt - .8) / .4)), b = ease(cl((lt - t1 - .4) / .4)); g.save(); g.globalAlpha = a; tick(g, 520, 470, 60, 12); g.restore(); tx(g, '返さなくていい「給付型」が広がった', 600, 490, 44, { a });
  g.save(); g.globalAlpha = b; tick(g, 520, 620, 60, 12); g.restore(); tx(g, '収入が少ないうちは、返す額を小さくできる', 600, 640, 44, { a: b }); };


function big(g, s, x, y, size, color) { tx(g, s, x, y, size, { w: 900, color, halo: size * .22 }); }
const TH = { p: 0, lt: 99, dur: 99, t: 0, sub: () => 0 };
SET.thA = (g) => { g.save(); g.translate(250, 175); g.scale(.74, .74); SET.hands(g, { ...TH, p: 1 }); g.restore(); g.fillStyle = PAL.paper; g.fillRect(0, 0, 1920, 200); g.fillRect(0, 790, 1920, 290);
  g.fillRect(270, 190, 170, 150); g.fillRect(800, 190, 360, 140); big(g, '初任給', 60, 165, 140); big(g, '26万2300円', 520, 165, 140); big(g, '先に4本の手', 60, 1010, 230, PAL.red); };
SET.thB = (g) => { g.save(); g.translate(150, 150); g.scale(.8, .8); SET.box(g, { ...TH, p: 3 }); g.restore(); g.fillStyle = PAL.paper; g.fillRect(0, 0, 1920, 200); g.fillRect(950, 200, 520, 160); g.fillRect(0, 800, 1920, 280);
  g.fillRect(470, 190, 330, 120); big(g, '過去最高の初任給', 60, 165, 140); big(g, '−44,000', 1250, 470, 96, PAL.red); big(g, '部品が足りない', 60, 1010, 230, PAL.red); };
SET.thC = (g) => { g.save(); g.translate(180, 150); g.scale(.8, .8); SET.suspect(g, { ...TH, lt: 1, sub: (i) => (i === 1 ? 0 : 99) }); g.restore(); g.fillStyle = PAL.paper; g.fillRect(380, 0, 1540, 240); g.fillRect(0, 800, 1920, 280);
  big(g, '4万4000円', 420, 190, 150); big(g, '抜いたのは誰？', 60, 1010, 230, PAL.red); };

// ---------- scene → setup/phase ----------
const MAP = {
  'box:arrive': ['box', 0], 'box:label': ['box', 1], 'box:open': ['box', 2], 'box:missing': ['box', 3], 'box:ok': ['box', 4], suspect: ['suspect', 0], cover: ['cover', 0],
  'hands:start': ['hands', 0], 'hands:four': ['hands', 1], 'hands:nenkin': ['hands', 2], 'hands:kenpo': ['hands', 3], 'hands:rest': ['hands', 4], 'hands:sum': ['hands', 5],
  'company:wall': ['company', 0], 'company:pay': ['company', 1], 'company:half': ['company', 2],
  'wait:start': ['wait', 0, 'w0'], 'wait:hand5': ['hands', 6, 'h5'], 'wait:why': ['wait', 1, 'w1'], 'wait:less': ['wait', 2, 'w2'], 'wait:hand6': ['hands', 7, 'h6'],
  'cmp:start': ['cmp', 0], 'cmp:nenkin': ['cmp', 1], 'cmp:stairs': ['stairs', 0], 'cmp:tax': ['tax', 0], 'cmp:culprit': ['culprit', 0],
  'io:shohi': ['io', 0], 'io:both': ['io', 1], news: ['news', 0],
  'bill:start': ['bill', 0], 'bill:half': ['bill', 1, 'bh'], 'loan:plan': ['loan', 0], 'loan:walk': ['loan', 1], offslip: ['offslip', 0], seven: ['seven', 0], q: ['q', 0],
  'b45:start': ['b45', 0], 'b45:def': ['b45', 1], 'b45:96': ['b45', 2], 'b45:flat': ['b45', 3], 'b45:19': ['b45', 4], 'b45:not': ['b45', 5], 'b45:24': ['b45', 6], except: ['except', 0], hourly: ['hourly', 0],
  'tricks:a': ['tricks', 0], 'tricks:b': ['tricks', 1], 'tricks:c': ['tricks', 2], 'fair:old': ['fair', 0, 'f0'], 'fair:world': ['fair', 1, 'f1'], plus: ['plus', 0], dodont: ['dodont', 0], comment: ['comment', 0], end: ['end', 0],
  y400: ['y400', 0], real4: ['real4', 0], real12: ['real12', 0], born: ['born', 0], daily: ['daily', 0], 'fair:loan': ['fairloan', 0],
  'shop:start': ['shop', 0], 'shop:wage': ['shop', 1], 'shop:price': ['shop', 2], 'shop:race': ['shop', 3], rice: ['rice', 0], food: ['food', 0], real: ['real', 0], shrink: ['shrink', 0], page: ['page', 0],
};
const SRC = { '1': '厚生労働省 賃金構造基本統計調査', '3,4': '大和総研／厚生労働省', '4': '厚生労働省', '3': '大和総研', '7': '厚生労働省 毎月勤労統計調査', '13': '農林水産省（総務省 消費者物価指数）', '23': '財務省', '9': '日本学生支援機構 学生生活調査', '15': '日本学生支援機構 返還例', '10': '労働者福祉中央協議会（2024）', '11': '大和総研（2025年10月）', '17': '財務省 国民負担率の国際比較', '12': '共同通信（2026）', '6': 'マイナビニュース（2023）', '7,8': '厚生労働省 毎月勤労統計調査', '20,21': '日本学生支援機構／文部科学省' };
const gid = (sc) => { const m = MAP[sc.key]; return m[2] || m[0]; };
function drawScene(g, sc, lt, t) { const m = MAP[sc.key]; SET[m[0]](g, { p: m[1], lt, dur: sc.dur, t, sub: (i) => (sc.subs[i] ? sc.subs[i][0] : 1e9) });
  if (sc.src && SRC[sc.src]) tx(g, '出典：' + SRC[sc.src] + (sc.note ? '　※金額は概算' : ''), 1850, 50, 22, { w: 500, align: 'right', color: PAL.grey3 });
  else if (sc.note) tx(g, '※金額は概算', 1850, 50, 22, { w: 500, align: 'right', color: PAL.grey3 }); }
function subtitle(g, sc, lt) { let s = null; for (const x of sc.subs) if (lt >= x[0] - .05) s = x[2]; if (!s || lt > sc.audio + .35) { g.fillStyle = '#E4E0D7'; g.fillRect(0, 968, W, 112); g.fillStyle = PAL.ink; g.fillRect(0, 966, W, 2.5); return; }
  let lines = [s]; if (s.length > 29) { let best = -1, bd = 1e9; for (let i = 0; i < s.length - 1; i++) if (s[i] === '、') { const d = Math.abs(i + 1 - s.length / 2); if (d < bd) { bd = d; best = i + 1; } } if (best < 0) best = Math.ceil(s.length / 2); lines = [s.slice(0, best), s.slice(best)]; }
  g.fillStyle = '#E4E0D7'; g.fillRect(0, 968, W, 112); g.fillStyle = PAL.ink; g.fillRect(0, 966, W, 2.5);
  lines.forEach((l, i) => tx(g, l, W / 2, lines.length === 1 ? 1040 : 1016 + i * 50, lines.length === 1 ? 44 : 40, { align: 'center' })); }

SET.thD = (g) => { g.save(); g.translate(250, 110); g.scale(.75, .75); SET.box(g, { ...TH, p: 2 }); g.restore(); g.fillStyle = PAL.paper; g.fillRect(0, 0, 1920, 200); g.fillRect(500, 190, 380, 140); g.fillRect(0, 790, 1920, 290);
  big(g, '初任給 26万2300円', 60, 165, 140); big(g, '手取りは21万', 60, 1010, 240, PAL.red); };
SET.thE = (g) => { g.save(); g.translate(120, 90); g.scale(.8, .8); SET.suspect(g, { ...TH, lt: 99, sub: () => 0 }); g.restore(); g.fillStyle = PAL.paper; g.fillRect(0, 0, 1920, 200); g.fillRect(0, 790, 1920, 290);
  big(g, '給料から4万4000円', 60, 165, 140); big(g, '抜いたのは誰？', 60, 1010, 240, PAL.red); };
SET.thF = (g) => { g.save(); g.translate(330, 120); g.scale(.75, .75); SET.offslip(g, { ...TH, lt: 0 }); g.restore(); g.fillStyle = PAL.paper; g.fillRect(0, 0, 1920, 190); g.fillRect(0, 790, 1920, 290);
  g.save(); g.strokeStyle = PAL.red; g.lineWidth = 12; g.beginPath(); g.ellipse(330 + 650 * .75, 120 + 400 * .75, 310, 46, 0, 0, 7); g.stroke(); g.restore();
  arrow2(g, [[1560, 260], [1160, 410]], 24, { fill: PAL.red });
  big(g, '初任給の明細', 60, 155, 130); big(g, '犯人はここ', 60, 1010, 240, PAL.red); };
export function thumb(g, nm) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; paper(g, W, H); SET[nm](g); }
export function render(g, t) { const scs = TL.scenes; let i = scs.findIndex((s) => t < s.start + s.dur); if (i < 0) i = scs.length - 1; const sc = scs[i], lt = t - sc.start, prev = i > 0 ? scs[i - 1] : null;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; paper(g, W, H);
  const PAN = .5; if (prev && gid(prev) !== gid(sc) && lt < PAN) { const e = ease(lt / PAN);
    g.save(); g.translate(-W * e, 0); drawScene(g, prev, prev.dur, t); g.restore(); g.save(); g.translate(W * (1 - e), 0); drawScene(g, sc, lt, t); g.restore(); }
  else drawScene(g, sc, lt, t);
  g.setTransform(1, 0, 0, 1, 0, 0); subtitle(g, sc, lt);
  const f = Math.min(1, t / .6, (TL.dur - t) / .8); if (f < 1) { g.fillStyle = `rgba(244,241,234,${1 - Math.max(0, f)})`; g.fillRect(0, 0, W, H); } }
