// 18 流出ラッシュ・説明書イラスト版（manualkit）。SC[i](g,S)：S={t,dur,sub(n),k(t0,d),e(t0,d)}
import { PAL, LW, makeView, box, cyl, blob, poly3, line3, faceText, rotAbout, tx, tw, label, roundRect, arrow2, cross, tick, tag, magnifier, path, add3, mul3, lerp3, cl, ease, eo, pop } from '/manualkit/iso.js';
import { person, stand, hips, scratch, hold, reach, walk, armsUp, THIEF } from '/manualkit/rig.js';
import { W, head, pie, ring, num } from '/manualkit/ui.js';
const E1 = [.7071, 0, -.7071], E2 = [.7071, 0, .7071], RED = PAL.red;
const TSR = '東京商工リサーチ（2026）', NPA = '警察庁（2026）';
export const SRC = { 0: '各社の公表資料（2026年10〜11月）', 2: 'NHK（2026年10月26日）', 3: TSR, 8: TSR, 9: TSR, 10: TSR, 11: TSR, 12: TSR, 13: TSR, 15: NPA, 17: NPA };
let MAPS = null, JP2D = null;
export async function load() { MAPS = await (await fetch('/pipeline3d/maps.json')).json(); JP2D = new Path2D(MAPS.japan.d); }
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const at = (g, a, fn) => { if (a <= 0) return; g.save(); g.globalAlpha *= Math.min(1, a); fn(); g.restore(); };
// ---- 部品 ----
function building(v, c, w, d, h, o = {}) { const a = [c[0] - w / 2, 0, c[1] - d / 2], b = [c[0] + w / 2, h, c[1] + d / 2]; box(v, a, b, o);
  const dw = Math.min(26, d * .3); poly3(v, [[b[0], 0, c[1] - dw / 2], [b[0], Math.min(52, h * .6), c[1] - dw / 2], [b[0], Math.min(52, h * .6), c[1] + dw / 2], [b[0], 0, c[1] + dw / 2]], PAL.g1, { depth: v.depth([c[0], h / 2, c[1]]) + .5 });
  const n = Math.max(1, Math.floor(w / 45)), rows = Math.max(1, Math.floor((h - 30) / 50)); for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) { const x0 = a[0] + (i + .25) * (w / n), y0 = h - 22 - r * 48; if (y0 - 24 < 12) continue; poly3(v, [[x0, y0, b[2]], [x0 + w / n * .5, y0, b[2]], [x0 + w / n * .5, y0 - 24, b[2]], [x0, y0 - 24, b[2]]], PAL.paper, { depth: v.depth([c[0], h / 2, c[1]]) + .5, lw: 2 }); }
  return { top: [c[0], h, c[1]], door: [b[0], 0, c[1]] }; }
const slab = (v, p, w = 16, h = 1.4, d = 22, o = {}) => box(v, p, [p[0] + w, p[1] + h, p[2] + d], o);
function lock2(g, x, y, s, o = {}) { g.save(); g.globalAlpha *= o.a ?? 1; g.translate(x, y); g.scale(s, s); g.lineWidth = LW / s * 1.4; g.strokeStyle = PAL.ink; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-15, -4); g.lineTo(-15, -20); g.arc(0, -20, 15, Math.PI, 0); g.lineTo(15, -4); g.lineWidth = 7; g.stroke(); g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.stroke(); g.strokeStyle = PAL.ink; g.lineWidth = LW / s * 1.2;
  g.beginPath(); g.roundRect(-24, -6, 48, 40, 6); g.fillStyle = o.fill || PAL.g1; g.fill(); g.stroke(); g.beginPath(); g.arc(0, 10, 5, 0, 7); g.fillStyle = PAL.ink; g.fill(); g.fillRect(-2, 10, 4, 12); g.restore(); }
function env2(g, x, y, s, rot, o = {}) { g.save(); g.globalAlpha *= o.a ?? 1; g.translate(x, y); g.rotate(rot); g.scale(s, s); g.lineWidth = LW / s; g.strokeStyle = PAL.ink; g.lineJoin = 'round'; g.beginPath(); g.rect(-110, -70, 220, 140); g.fillStyle = '#FFFFFF'; g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-110, -70); g.lineTo(0, 10); g.lineTo(110, -70); g.stroke(); tx(g, o.text || 'お詫び', 0, 52, 40, { align: 'center', color: RED, w: 900 }); g.restore(); }
function lockedBox(v, c, k, o = {}) { const a = [c[0] - 38, 0, c[1] - 30], b = [c[0] + 38, 92, c[1] + 30]; box(v, a, b); const d = v.depth([c[0], 46, c[1]]);
  for (const y of [30, 62]) line3(v, [a[0], y, b[2]], [b[0], y, b[2]], { depth: d + .3, lw: 2 }); faceText(v, [a[0] + 8, 86, b[2] + .1], [1, 0, 0], [0, -1, 0], o.text || 'データ', 13, { depth: d + .4 });
  if (k > 0) { for (const y of [22, 70]) { line3(v, [a[0], y, b[2]], [a[0] + (b[0] - a[0]) * k, y, b[2]], { depth: d + .6, lw: 7, stroke: PAL.ink }); line3(v, [a[0], y, b[2]], [a[0] + (b[0] - a[0]) * k, y, b[2]], { depth: d + .7, lw: 3, stroke: PAL.g1, dash: [6, 6] });
      line3(v, [b[0], y, b[2]], [b[0], y, b[2] - (b[2] - a[2]) * k], { depth: d + .6, lw: 7 }); line3(v, [b[0], y, b[2]], [b[0], y, b[2] - (b[2] - a[2]) * k], { depth: d + .7, lw: 3, stroke: PAL.g1, dash: [6, 6] }); }
    v.add(d + 1, (g) => { const p = v.P([c[0], 44, b[2]]); lock2(g, p[0], p[1], v.s * .42 * pop(k), {}); }); }
  return { top: [c[0], 92, c[1]] }; }
function car(v, x, o = {}) { const z = o.z || 0; box(v, [x, 9, z - 24], [x + 70, 32, z + 24], { c: o.c }); box(v, [x + 14, 32, z - 21], [x + 52, 52, z + 21], { c: [PAL.white, PAL.paper, PAL.paper] });
  for (const wx of [x + 14, x + 56]) blob(v, [[[wx, 9, z + 24], 9]], PAL.dark, { depth: v.depth([x + 35, 20, z]) + 1 }); }
function bus(v, x) { const L = 300; box(v, [x, 12, -32], [x + L, 100, 32]); const d = v.depth([x + L / 2, 56, 0]);
  for (let i = 0; i < 7; i++) poly3(v, [[x + 14 + i * 40, 90, 32], [x + 46 + i * 40, 90, 32], [x + 46 + i * 40, 64, 32], [x + 14 + i * 40, 64, 32]], PAL.paper, { depth: d + .4, lw: 2 });
  poly3(v, [[x + L, 90, 26], [x + L, 90, -26], [x + L, 58, -26], [x + L, 58, 26]], PAL.paper, { depth: d + .4, lw: 2 });
  poly3(v, [[x, 58, 32], [x + L, 58, 32], [x + L, 52, 32], [x, 52, 32]], RED, { depth: d + .4, lw: 0 }); faceText(v, [x + 78, 46, 32.1], [1, 0, 0], [0, -1, 0], '3063万人分', 30, { depth: d + .5, w: 900 });
  for (const wx of [x + 40, x + L - 50]) blob(v, [[[wx, 13, 32], 13]], PAL.dark, { depth: d + 1 }); }
function bar3(v, c, w, h, o = {}) { return box(v, [c[0] - w / 2, 0, c[2] - w / 2], [c[0] + w / 2, Math.max(.5, h), c[2] + w / 2], o); }
export const SC = {};

// 0 3つの店から紙（データ）が噴き出す
SC[0] = (g, S) => { const v = makeView({ cx: 960, cy: 650, s: 1.8 }), t = S.t; const names = [['ニトリ', '最大3762万件'], ['ドコモ', '約30万件'], ['無印良品', '約2726万件']]; const tops = [];
  for (let i = 0; i < 3; i++) { const c = mul3(E1, (i - 1) * 300), b = building(v, [c[0], c[2]], 130, 130, 120); tops.push(b.top); const t0 = S.sub(i) + (i ? 0 : 1.6);
    if (t > t0) for (let j = 0; j < 16; j++) { const ph = ((t - t0) * .55 + j / 16); if (t - t0 < j * .09) continue; const u = ph % 1, an = rnd(i * 31 + j) * 6.28, rr = 60 + rnd(i * 7 + j * 3) * 150; const q = [c[0] + Math.cos(an) * rr * u + 40 * u, 120 + Math.sin(u * Math.PI) * (170 + rnd(j) * 60) - 120 * u * u, c[2] + Math.sin(an) * rr * u + 40 * u];
        slab(v, q, 20, 1.5, 28, { xf: rotAbout(add3(q, [10, 0, 14]), [rnd(j), .3, rnd(j + 5)], u * 5 + j), depth: v.depth(q) + 300 }); } }
  const lt = S.sub(3); names.forEach((n, i) => S.sfx(S.sub(i) + (i ? 0 : 1.6), 'pop')); S.sfx(lt, 'stamp'); person(v, t > lt ? scratch([212, 0], 180, { look: [0, 150, 0] }) : hips([212, 0], 180)); v.flush(g);
  names.forEach((n, i) => { const k = pop((t - S.sub(i) - (i ? 0 : 1.6)) / .35); if (k <= 0) return; const p = v.P(tops[i]); g.save(); g.translate(p[0], p[1] - 215); g.scale(k, k); roundRect(g, -170, -70, 340, 140, 14, '#FFFFFF'); tx(g, n[0], 0, -14, 40, { align: 'center' }); tx(g, n[1], 0, 44, 46, { align: 'center', color: RED, w: 900 }); g.restore(); });
  at(g, S.k(.3, .4), () => label(g, 'この1か月だけで', 960, 66, 40));
  const k = pop((t - lt) / .4); if (k > 0) { g.save(); g.translate(400, 820); g.scale(k, k); tx(g, 'なぜ、今？', 0, 40, 130, { align: 'center', color: RED, w: 900, halo: 14 }); g.restore(); } };

// 1 郵便受けからお詫びの手紙
SC[1] = (g, S) => { const v = makeView({ cx: 400, cy: 700, s: 4.0 }), t = S.t, t1 = S.sub(1) - .6;
  cyl(v, [0, 0, 0], 4, 92); box(v, [-20, 92, -14], [20, 124, 14]); poly3(v, [[20, 100, -10], [20, 104, -10], [20, 104, 10], [20, 100, 10]], PAL.ink, { depth: 30 });
  const n = Math.floor(cl((t - t1) / 4.2) * 9); for (let j = 0; j < 9; j++) { const u = cl((t - t1 - j * .45) / .7); if (u <= 0) continue; const land = [44 + (j % 3) * 9, j * 1.5, -6 + (j % 4) * 7]; const q = lerp3([22, 101, -8], land, eo(u)); q[1] += Math.sin(u * Math.PI) * 40; slab(v, q, 22, 1.4, 15, { depth: 200 + j }); }
  person(v, t > t1 ? { pos: [95, -30], f: 180, hands: { r: { w: [34, 104, 4] } }, nod: 6 } : stand([95, -30], 180)); v.flush(g);
  head(g, 'お詫びの手紙、今月 何通目？', 200, 64, { x: 1400, a: S.k(.3) });
  const fan = [[1170, 470, -.16], [1400, 430, .03], [1630, 480, .2]]; fan.forEach((f, i) => { S.sfx(S.sub(1) + .2 + i * .35, 'pop'); const k = pop((t - S.sub(1) - .2 - i * .35) / .4); if (k > 0) env2(g, f[0], f[1], 1.15 * k, f[2]); });
  at(g, S.k(S.sub(2), .4), () => { for (let i = 0; i < 4; i++) env2(g, 1130 + i * 170, 740 + (i % 2) * 20, .72, -.2 + i * .13); tx(g, '…まだ届く', 1400, 890, 40, { align: 'center', color: PAL.g2 }); }); };

// 2 10月26日、1日のニュース
SC[2] = (g, S) => { const t = S.t, k0 = S.e(.1, .5); g.save(); g.translate(330, 330 - (1 - k0) * 40); g.globalAlpha = k0; roundRect(g, -150, -190, 300, 380, 12, '#FFFFFF'); g.fillStyle = RED; g.fillRect(-150, -190, 300, 80); g.lineWidth = LW; g.strokeRect(-150, -190, 300, 80);
  tx(g, '10月', 0, -132, 54, { align: 'center', color: '#FFFFFF', w: 900 }); tx(g, '26', 0, 90, 190, { align: 'center', w: 900 }); tx(g, 'この1日だけで', 0, 160, 34, { align: 'center', color: PAL.g2 }); g.restore();
  const v = makeView({ cx: 330, cy: 925, s: 1.95 }); person(v, hold([0, 0], 45, 110, 26, { nod: 8 })); box(v, [14, 108, 14], [44, 110, 50]); v.flush(g);
  const rows = [['家電量販店', '顧客情報 600万件 漏えいの可能性'], ['電子ギフト会社', '5億5000万円分を 不正に発行'], ['メール配信会社', '5162万件が 流出']];
  rows.forEach((r, i) => { S.sfx(S.sub(i + 1), 'swish'); const k = eo(cl((t - S.sub(i + 1)) / .45)); if (k <= 0) return; const y = 200 + i * 215; g.save(); g.globalAlpha = k; g.translate((1 - k) * 200, 0); roundRect(g, 640, y, 1150, 150, 14, '#FFFFFF'); g.fillStyle = PAL.ink; g.beginPath(); g.roundRect(640, y, 170, 150, [14, 0, 0, 14]); g.fill(); tx(g, 'NEWS', 725, y + 92, 44, { align: 'center', color: '#FFFFFF', w: 900 });
    tx(g, r[0], 850, y + 52, 30, { color: PAL.g2 }); tx(g, r[1], 850, y + 116, 52, { w: 900 }); g.restore(); }); };

// (旧3→新0) 日本地図：あなたはもう2回漏れている → 延べ2億1313万人分
SC[3] = (g, S) => { const t = S.t, t1 = S.sub(1), t2 = S.sub(2), kc = eo(cl((t - t1) / 3.0)), sc = 1.12, ox = -150, oy = -70;
  g.save(); g.translate(ox, oy); g.scale(sc, sc); g.fillStyle = '#FFFFFF'; g.fill(JP2D); g.lineWidth = 2.2; g.strokeStyle = PAL.ink; g.lineJoin = 'round'; g.stroke(JP2D);
  let n = 0; for (let i = 0; i < 1400 && n < 260 * kc; i++) { const x = 250 + rnd(i) * 700, y = 100 + rnd(i + 999) * 760; if (!g.isPointInPath(JP2D, ox + x * sc, oy + y * sc)) continue; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fillStyle = RED; g.fill(); n++; } g.restore();
  const v = makeView({ cx: 1130, cy: 900, s: 2.2 }); person(v, t > .7 ? scratch([0, 0], 45) : stand([0, 0], 45)); v.flush(g);
  S.sfx(.45, 'stamp'); const k = pop((t - .45) / .35); if (k > 0) { g.save(); g.translate(1540, 560); g.rotate(-.1); g.scale(k, k); roundRect(g, -190, -78, 380, 156, 14, '#FFFFFF', 8, { stroke: RED }); tx(g, '漏えい ×2', 0, 30, 82, { align: 'center', color: RED, w: 900 }); g.restore(); tx(g, 'あなたの個人情報', 1540, 440, 44, { align: 'center', a: Math.min(1, k) }); }
  if (t > t1) { S.sfx(t1 + .1, 'count'); const a = S.k(t1, .4); tx(g, '2012〜2025年　上場企業の流出（延べ）', 1400, 170, 38, { align: 'center', color: PAL.g2, a }); tx(g, '2億' + Math.round(1313 * kc) + '万人分', 1400, 290, 110, { align: 'center', color: RED, w: 900, a }); }
  at(g, S.k(t2 + .3, .4), () => tx(g, '÷ 日本の人口 ≒ 1人あたり 約2回', 1540, 760, 40, { align: 'center' })); };
function ptIn(g, x, y) { const m = g.getTransform(), p = new DOMPoint(x, y).matrixTransform(m); return g.isPointInPath(JP2D, p.x, p.y); }

// 4 泥棒は「いつもの店」を素通りして委託先へ（回収：第3章）
SC[4] = (g, S) => { const v = makeView({ cx: 860, cy: 730, s: 1.8 }), t = S.t, t1 = .4, t2 = S.sub(1) - 1.0;
  const st = building(v, [-60, -20], 190, 170, 150), hut = building(v, [250, -180], 80, 80, 62); person(v, stand([75, -20], 180));
  const A = [-230, 330], B = [185, -60], u = ease(cl((t - t1) / (S.dur - t1 - 1.2))), p = [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u]; const f = Math.atan2(B[1] - A[1], B[0] - A[0]) * 180 / Math.PI;
  person(v, u > 0 && u < 1 ? walk(p, f, t * 7, THIEF) : stand(p, f, THIEF));
  for (let i = 0; i < 16; i++) { const a = i / 16, b = (i + .55) / 16; if (a < u) continue; line3(v, [A[0] + (B[0] - A[0]) * a, 0, A[1] + (B[1] - A[1]) * a], [A[0] + (B[0] - A[0]) * b, 0, A[1] + (B[1] - A[1]) * b], { depth: -900, lw: 4, alpha: S.k(t1) }); }
  v.flush(g); const ps = v.P(st.top), ph = v.P(hut.top); label(g, 'いつもの店', ps[0], ps[1] - 70, 40); at(g, S.k(t1 + .4), () => label(g, '委託先（名前も知らない会社）', ph[0] + 50, ph[1] - 100, 34));
  at(g, S.k(.3), () => head(g, 'いちばん大きな流出を起こしたのは…？', 130, 58)); S.sfx(t2 + 1.2, 'pop'); const k = pop((t - t2 - 1.2) / .4); if (k > 0) { const q = v.P([75, 190, -20]); g.save(); g.translate(q[0] + 70, q[1]); g.scale(k, k); tx(g, '？', 0, 0, 90, { align: 'center', w: 900 }); g.restore(); const q2 = v.P([250, 62, -180]); g.save(); g.translate(q2[0] + 120, q2[1] + 70); g.scale(k, k); tx(g, '！', 0, 0, 100, { align: 'center', color: RED, w: 900 }); g.restore(); } };

// 5 2年前に弱点を知っていた（回収：第4章）
SC[5] = (g, S) => { const v = makeView({ cx: 480, cy: 660, s: 3.6 }), t = S.t;
  box(v, [-70, 68, -38], [70, 73, 38]); for (const [x, z] of [[-64, -32], [58, -32], [-64, 28], [58, 28]]) box(v, [x, 0, z], [x + 6, 68, z + 6], { depth: v.depth([x, 30, z]) - 20 });
  box(v, [-12, 73, -12], [14, 73.8, 12], { c: ['#FFFFFF', PAL.s1, PAL.s2] }); box(v, [30, 73, -20], [58, 95, -16]); box(v, [36, 73, 4], [50, 76, 24]);
  person(v, hips([115, 15], 180, { look: [400, 150, -150] })); v.flush(g);
  const k = pop((t - .5) / .4); if (k > 0) { g.save(); const p = v.P([1, 74, 0]); g.translate(1400, 450); g.scale(k, k); g.translate(-1400, -450); g.translate(70, 20); magnifier(g, [p[0] - 70, p[1] - 20], 1330, 430, 280, (gg) => { gg.fillStyle = RED; gg.fillRect(1050, 150, 560, 130); tx(gg, '2024年 4月', 1330, 250, 60, { align: 'center', color: '#FFFFFF', w: 900 });
      tx(gg, '弱点の指摘', 1330, 420, 84, { align: 'center', w: 900 }); tx(gg, '「このままだと危ない」', 1330, 500, 36, { align: 'center', color: PAL.g2 });
      S.sfx(S.dur * .5, 'stamp'); const k2 = cl((t - S.dur * .5) / .3); if (k2 > 0) { gg.save(); gg.translate(1330, 600); gg.rotate(-.1); gg.scale(2 - k2, 2 - k2); gg.globalAlpha = k2; gg.strokeStyle = RED; gg.lineWidth = 7; gg.strokeRect(-190, -50, 380, 100); tx(gg, '…そのまま2年', 0, 22, 56, { align: 'center', color: RED, w: 900 }); gg.restore(); } }); g.restore(); } };

// 6 ドミノの最後の1枚を手で止める（回収：第6章）
SC[6] = (g, S) => { const v = makeView({ cx: 640, cy: 560, s: 2.6 }), t = S.t, N = 7; poly3(v, [[-300, 0, -42], [330, 0, -42], [330, 0, 42], [-300, 0, 42]], PAL.s1, { depth: -9999 });
  for (let i = 0; i < N; i++) { S.sfx(.3 + i * .28 + .3, 'tick'); const x = -260 + i * 62, mx = i === N - 1 ? .52 : 1.12, a = -mx * ease(cl((t - .3 - i * .28) / .45)); box(v, [x, 0, -28], [x + 9, 104, 28], { xf: rotAbout([x + 9, 0, 0], [0, 0, 1], a), depth: x + 200 }); }
  const hx = -260 + N * 62; box(v, [hx, 0, -28], [hx + 9, 104, 28], { c: ['#FFFFFF', '#FFFFFF', '#FFFFFF'], depth: hx + 200, lw: 5 });
  person(v, { pos: [hx + 62, 0], f: 180, hands: { l: { w: [hx + 12, 98, 14] }, r: { w: [hx + 12, 98, -14] } }, lean: 10, feet: { l: [-10, 0, -8], r: [10, 0, 14] } }); v.flush(g);
  at(g, S.k(1.4, .5), () => { tx(g, '最後の1枚は、', 1480, 280, 76, { align: 'center', w: 900 }); tx(g, 'あなたの手に', 1480, 385, 76, { align: 'center', w: 900, color: RED }); }); };

// 7 目次
SC[7] = (g, S) => { const t = S.t, L = [['件数は減った', 'のに人数は倍'], ['隠せなく', 'なった'], ['泥棒は', '「合鍵屋」へ'], ['知ってたのに', '直せない'], ['漏れた情報が', '次の鍵に'], ['ドミノを', '止める1枚']];
  head(g, 'なぜ今、流出ラッシュなのか？', 180, 76, { a: S.k(.1) });
  L.forEach((s, i) => { S.sfx(.5 + i * .3, 'tick'); const k = eo(cl((t - .5 - i * .3) / .45)); if (k <= 0) return; g.save(); g.translate(0, (1 - k) * 60); const x = 95 + i * 292; tag(g, x, 340, 270, 400, s, { a: k, size: 38 }); tx(g, '①②③④⑤⑥'[i], x + 135, 480, 90, { align: 'center', a: k, w: 900 }); g.restore(); });
  at(g, S.k(S.dur * .45, .5), () => label(g, '東京商工リサーチ × 警察庁 × 個人情報保護委員会 × 世界2万件の侵害データ', W / 2, 860, 34, { fill: PAL.paper })); };

// 8 実写の窓（緑＝あとで動画を合成）＋180件
SC[8] = (g, S) => { const t = S.t; g.fillStyle = '#00ff00'; g.beginPath(); g.roundRect(300, 120, 1320, 742, 18); g.fill(); g.lineWidth = 8; g.strokeStyle = PAL.ink; g.stroke();
  label(g, '2025年　上場企業の流出・紛失事故', W / 2, 120, 42); S.sfx(S.sub(1) + 1.0, 'pop'); const k = pop((t - S.sub(1) - 1.0) / .4); if (k > 0) { g.save(); g.translate(W / 2, 830); g.scale(k, k); roundRect(g, -200, -80, 400, 160, 16, '#FFFFFF', 6); tx(g, '180件', 0, 36, 100, { align: 'center', w: 900 }); g.restore(); } };

// 9 件数の棒（立体）：189→180
SC[9] = (g, S) => { const v = makeView({ cx: 760, cy: 790, s: 2.5 }), t = S.t, cA = mul3(E1, -150), cB = mul3(E1, 20), h2 = 189 - 9 * ease(cl((t - .2) / 1.0));
  bar3(v, cA, 70, 189, { c: [PAL.white, PAL.s1, PAL.s2] }); bar3(v, cB, 70, h2, { c: [PAL.white, PAL.g1, PAL.g3] }); bar3(v, cB, 70, 189, { ghost: true, dash: [8, 8], lw: 2, depth: 9999 });
  const pp = mul3(E1, 170); person(v, t > S.sub(2) ? hips([pp[0], pp[2]], 135, { nod: -3 }) : stand([pp[0], pp[2]], 135)); v.flush(g);
  const a = v.P([cA[0], 189, cA[2]]), b = v.P([cB[0], h2, cB[2]]), a0 = v.P(cA), b0 = v.P(cB); tx(g, '189件', a[0], a[1] - 70, 56, { align: 'center', w: 900 }); tx(g, num(h2) + '件', b[0], b[1] - 70, 56, { align: 'center', w: 900 });
  tx(g, '2024年', a0[0], a0[1] + 132, 36, { align: 'center', color: PAL.g2 }); tx(g, '2025年', b0[0], b0[1] + 132, 36, { align: 'center', color: PAL.g2 });
  head(g, '上場企業の流出事故（件数）', 170, 54, { x: 700 }); S.sfx(.9, 'pop'); at(g, S.k(.9), () => { tx(g, '−4.7%', 1580, 420, 130, { align: 'center', w: 900 }); }); at(g, S.k(S.sub(1) + .2), () => label(g, '7年ぶりに減少', 1580, 520, 44));
  at(g, S.k(S.sub(2) + .4), () => { tx(g, '少しは良くなった…？', 1580, 660, 46, { align: 'center', color: PAL.g2 }); }); };

// 10 人数の棒（立体）：1587万→3063万
SC[10] = (g, S) => { const v = makeView({ cx: 720, cy: 800, s: 1.95 }), t = S.t, cA = mul3(E1, -160), cB = mul3(E1, 20), kk = ease(cl((t - .8) / 1.6)), h2 = 60 + (306.3 - 60) * kk;
  bar3(v, cA, 78, 158.7); bar3(v, cB, 78, h2, { c: [RED, '#C2352A', '#A92E25'] });
  const pp = mul3(E1, 190); person(v, t > 1.6 ? scratch([pp[0], pp[2]], 135, { look: [cB[0], 320, cB[2]] }) : stand([pp[0], pp[2]], 135)); v.flush(g);
  const a = v.P([cA[0], 158.7, cA[2]]), b = v.P([cB[0], h2, cB[2]]), a0 = v.P(cA), b0 = v.P(cB); tx(g, '1587万人', a[0], a[1] - 62, 48, { align: 'center', w: 900 }); tx(g, Math.round(h2 * 10) + '万人', b[0], b[1] - 62, 56, { align: 'center', w: 900, color: RED });
  tx(g, '2024年', a0[0], a0[1] + 122, 34, { align: 'center', color: PAL.g2 }); tx(g, '2025年', b0[0], b0[1] + 122, 34, { align: 'center', color: PAL.g2 });
  head(g, '漏れた人数', 200, 60, { x: 1560 }); S.sfx(.8, 'count'); S.sfx(S.sub(1), 'stamp'); const k = pop((t - S.sub(1)) / .4); if (k > 0) { g.save(); g.translate(1560, 370); g.scale(k, k); roundRect(g, -190, -80, 380, 160, 14, '#FFFFFF', 7, { stroke: RED }); tx(g, '+93%', 0, 38, 110, { align: 'center', color: RED, w: 900 }); g.restore(); tx(g, '前の年の、ほぼ2倍', 1560, 520, 42, { align: 'center', a: k }); }
  at(g, S.k(S.sub(2) + 1.2), () => { tx(g, '回数は減ったのに、', 1560, 680, 46, { align: 'center', w: 900 }); tx(g, '1回の大きさが けた違いに', 1560, 750, 46, { align: 'center', w: 900, color: RED }); }); };

// 11 100万人＝板1枚の山
SC[11] = (g, S) => { const v = makeView({ cx: 960, cy: 580, s: 1.9 }), t = S.t; const P = [];
  for (let i = 0; i < 6; i++) { const c = mul3(E1, (i - 2.5) * 125), val = i === 1 ? 7.29 : i === 3 ? 7.27 : 1, t0 = i === 1 ? S.sub(1) + 1.2 : i === 3 ? S.sub(1) + 5.4 : .4 + i * .12, n = val * eo(cl((t - t0) / 1.0));
    for (let j = 0; j < Math.ceil(n); j++) { const hgt = Math.min(1, n - j) * 16; box(v, [c[0] - 42, j * 17, c[2] - 42], [c[0] + 42, j * 17 + hgt, c[2] + 42], { c: val > 1 ? [PAL.white, PAL.g1, PAL.g3] : undefined, depth: v.depth(c) + j * .01 }); }
    if (val === 1) box(v, [c[0] - 42, 17, c[2] - 42], [c[0] + 42, 90, c[2] + 42], { ghost: true, dash: [8, 8], lw: 2, depth: v.depth(c) + 1, alpha: S.k(.8) }); P.push([c, n, val]); }
  v.flush(g); S.sfx(S.sub(1) + 1.6, 'pop'); S.sfx(S.sub(1) + 5.8, 'pop'); head(g, '100万人以上の大型事故：2025年に6件', 190, 58);
  P.forEach(([c, n, val], i) => { const q = v.P(c); if (val > 1) { const a = cl(n / val * 1.2 - .2); tx(g, i === 1 ? 'AOKI（快活CLUB）' : 'SOMPOグループ', q[0], q[1] + 130, 34, { align: 'center', a }); tx(g, (i === 1 ? '729' : '727') + '万人分', q[0], q[1] + 190, 50, { align: 'center', color: RED, w: 900, a }); }
    else { const tp = v.P([c[0], 100, c[2]]); tx(g, '？', tp[0], tp[1] + 10, 48, { align: 'center', color: PAL.g3, a: S.k(.9) }); } });
  at(g, S.k(.5), () => { const v2 = makeView({ cx: 1560, cy: 850, s: 1.95 }); box(v2, [-42, 0, -42], [42, 16, 42]); v2.flush(g); tx(g, '＝100万人', 1700, 862, 38); }); };

// 12 小さな車が減って、大型バスに
SC[12] = (g, S) => { const v = makeView({ cx: 960, cy: 500, s: 1.7 }), t = S.t, u = t / S.dur;
  poly3(v, [[-900, 0, -75], [900, 0, -75], [900, 0, 75], [-900, 0, 75]], PAL.s2, { depth: -9999 }); for (let i = -9; i < 9; i++) line3(v, [i * 100 + 20, 0, 0], [i * 100 + 70, 0, 0], { depth: -9998, lw: 5, stroke: '#FFFFFF' });
  for (let i = 0; i < 5; i++) { const x = -420 + i * 190 + t * 200; if (x < 700) car(v, x, { z: i % 2 ? 38 : -38, c: i % 2 ? undefined : [PAL.white, PAL.g1, PAL.g3] }); }
  const bx = -1250 + 1100 * ease(cl((t - S.dur * .38) / (S.dur * .42))) + Math.max(0, t - S.dur * .8) * 30; if (t > S.dur * .3) bus(v, bx); S.sfx(S.dur * .42, 'swish');
  person(v, t > S.dur * .6 ? scratch([60, 250], 250, { look: [bx + 150, 80, 0] }) : stand([60, 250], 250)); v.flush(g);
  label(g, '事故の件数は減ったのに…', 1380, 190, 46); at(g, S.k(S.dur * .62, .4), () => label(g, '1台ずつが、大型バスに', 520, 830, 50, { color: RED, stroke: RED, lw: 6 })); };

// 13 原因の円グラフ
SC[13] = (g, S) => { const t = S.t, k = ease(cl(t / 1.6)), it = [{ v: 64.4, c: RED, l: 'ウイルス感染・不正アクセス', p: '64.4%' }, { v: 20.5, c: PAL.g1, l: '誤表示・誤送信', p: '20.5%' }, { v: 10, c: PAL.s2, l: '紛失・誤廃棄', p: '10.0%' }, { v: 3.8, c: PAL.g2, l: '不正持ち出し', p: '3.8%' }, { v: 1.3, c: '#FFFFFF', l: 'その他', p: '' }];
  head(g, '流出の原因（2025年・180件）', 170, 54); pie(g, 560, 540, 290, it, k);
  it.slice(0, 4).forEach((x, i) => { const a = S.k(.5 + i * .35); at(g, a, () => { const y = 350 + i * 120; roundRect(g, 1000, y - 34, 46, 46, 6, x.c); tx(g, x.l, 1070, y + 6, 40, { w: i ? 700 : 900, color: i ? PAL.ink : RED }); tx(g, x.p, 1850, y + 6, i ? 44 : 56, { align: 'right', w: 900, color: i ? PAL.ink : RED }); }); });
  S.sfx(S.sub(2) + .5, 'pop'); at(g, S.k(S.sub(2) + .5), () => label(g, '「うっかり」より、外から破られた', 1400, 850, 44, { lw: 5 })); };

// 14 ランサムウェア：データに鍵をかけて「払え」
SC[14] = (g, S) => { const v = makeView({ cx: 700, cy: 770, s: 2.8 }), t = S.t, t1 = S.sub(1), k = ease(cl((t - t1) / 1.0));
  const b = lockedBox(v, [0, 0], k); person(v, k > .5 ? scratch([-120, 40], 0, { look: [0, 60, 0] }) : stand([-120, 40], 0)); person(v, { pos: [125, -25], f: 180, hands: t > t1 + 2 ? { l: [-14, 108, 34] } : {}, ...THIEF }); v.flush(g);
  label(g, 'ランサムウェア', 1340, 200, 60, { color: RED, stroke: RED, lw: 6 }); at(g, S.k(t1 + .2), () => tx(g, 'データを暗号化して、使えなくする', 1340, 340, 42, { align: 'center' }));
  S.sfx(t1 + .7, 'stamp'); S.sfx(t1 + 2.4, 'pop'); const k2 = pop((t - t1 - 2.4) / .4); if (k2 > 0) { g.save(); g.translate(1400, 600); g.rotate(.05); g.scale(k2, k2); tag(g, -210, -80, 420, 200, '戻したければ、払え', { size: 40, color: RED, w: 900 }); g.restore(); } };

// 15 226件、二重恐喝88.9%
SC[15] = (g, S) => { const t = S.t, k = eo(cl(t / 2.0)), t1 = S.sub(1), k2 = ease(cl((t - t1) / 1.6)); S.sfx(.1, 'count'); S.sfx(t1 + 1.6, 'pop'); head(g, 'ランサムウェア被害（警察庁・2025年）', 170, 54);
  roundRect(g, 220, 330, 560, 380, 18, '#FFFFFF', 5); tx(g, '被害の報告', 500, 420, 40, { align: 'center', color: PAL.g2 }); tx(g, num(226 * k) + '件', 500, 610, 170, { align: 'center', w: 900 });
  const v = makeView({ cx: 960, cy: 890, s: 2.1 }); person(v, hips([0, 0], 45, THIEF)); v.flush(g);
  at(g, S.k(t1 - .2), () => { ring(g, 1400, 520, 190, 46, k2 * .889); tx(g, (88.9 * k2).toFixed(1) + '%', 1400, 540, 84, { align: 'center', color: RED, w: 900 }); tx(g, '二重恐喝', 1400, 600, 38, { align: 'center' }); label(g, 'およそ9割', 1400, 800, 44); }); };

// 16 二重恐喝：人質＋ばらまく
SC[16] = (g, S) => { const v = makeView({ cx: 960, cy: 760, s: 2.5 }), t = S.t, t1 = S.sub(0) + S.dur * .28, t2 = S.sub(1);
  const c1 = mul3(E1, -170), c2 = mul3(E1, 150); lockedBox(v, [c1[0], c1[2]], 1); person(v, { pos: [c2[0], c2[2]], f: 60, hands: { l: [-26, 178, 14], r: [26, 172, 18] }, elbow: { l: [-1, 0, 0], r: [1, 0, 0] }, ...THIEF });
  if (t > t1) for (let j = 0; j < 14; j++) { const u = ((t - t1) * .5 + j / 14) % 1; if (t - t1 < j * .1) continue; const an = -0.6 + rnd(j) * 1.8, rr = 60 + rnd(j * 3) * 170; const q = [c2[0] + 20 + Math.cos(an) * rr * u, 185 + Math.sin(u * Math.PI) * 60 - 185 * u * u, c2[2] + 20 + Math.sin(an) * rr * u]; slab(v, q, 15, 1.2, 21, { xf: rotAbout(add3(q, [7, 0, 10]), [rnd(j), .4, rnd(j + 2)], u * 6 + j), depth: 500 + j, alpha: 1 - u * u }); }
  v.flush(g); S.sfx(t1, 'swish'); label(g, '二重恐喝', W / 2, 150, 56, { color: RED, stroke: RED, lw: 6 }); const a = v.P(c1), b = v.P(c2);
  tx(g, '① データを人質に', a[0], a[1] + 110, 44, { align: 'center', w: 900 }); at(g, S.k(t1), () => tx(g, '② 払わないと、ばらまく', b[0] + 40, b[1] + 110, 44, { align: 'center', w: 900, color: RED }));
  at(g, S.k(t2 + 1.5), () => label(g, '身代金 ＋「家族写真を公開するぞ」', 560, 330, 42)); };

// 17 被害の6割は中小企業：鍵の甘い家から
SC[17] = (g, S) => { const v = makeView({ cx: 960, cy: 560, s: 1.4 }), t = S.t, big = [1, 0, 0, 1, 0], B = [];
  for (let i = 0; i < 5; i++) { const c = mul3(E1, (i - 2) * 195); B.push([building(v, [c[0], c[2]], big[i] ? 150 : 84, big[i] ? 150 : 84, big[i] ? 190 : 78), c, big[i]]); }
  const u = cl((t - .4) / (S.dur - 1.6)), s0 = add3(mul3(E1, -560), mul3(E2, 200)), s1 = add3(mul3(E1, 520), mul3(E2, 200)), p = lerp3(s0, s1, u); person(v, u < 1 ? walk([p[0], p[2]], -45, t * 7, THIEF) : stand([p[0], p[2]], -45, THIEF));
  for (let i = 0; i < 40; i++) { const a = i / 40; if (a > u - .02) break; const q = lerp3(s0, s1, a), o = mul3(E2, i % 2 ? 9 : -9); blob(v, [[[q[0] + o[0], .5, q[2] + o[2]], 5]], PAL.g2, { depth: -500, lw: 0 }); }
  v.flush(g); 
  B.forEach(([b, c, bg], i) => { const q = v.P([c[0] + (bg ? 75 : 42), bg ? 80 : 40, c[2] + (bg ? 75 : 42)]); lock2(g, q[0], q[1] + 20, bg ? 1.7 : .7, { fill: bg ? PAL.g1 : '#FFFFFF' }); const d = v.P(b.top); label(g, bg ? '大企業' : '中小企業', d[0], d[1] - (bg ? 150 : 95), 32, { fill: bg ? PAL.paper : '#FFFFFF', lw: 2 });
    if (!bg) { const pass = cl((u - (i + .9) / 6.2) * 12); if (pass > 0) { const e = v.P(add3(c, mul3(E2, 150))), dd = v.P(add3(c, mul3(E2, 62))); arrow2(g, e[0], e[1], dd[0], dd[1], { color: RED, a: pass, lw: 7 }); } } });
  S.sfx(S.sub(0) + 1.6, 'pop'); const k = pop((t - S.sub(0) - 1.6) / .4); if (k > 0) { g.save(); g.translate(1480, 850); g.scale(k, k); roundRect(g, -300, -62, 600, 124, 14, '#FFFFFF', 6); tx(g, '被害の約6割が 中小企業', 0, 18, 46, { align: 'center', w: 900 }); g.restore(); }
  at(g, S.k(S.sub(2) + .4), () => label(g, '鍵の甘い家から、順番に', 420, 850, 44, { color: RED, stroke: RED, lw: 5 })); };

// 18 小さな会社なのに、なぜ4786万件？→ その前に「本当に増えたのか」
SC[18] = (g, S) => { const v = makeView({ cx: 380, cy: 620, s: 2.6 }), t = S.t, t1 = S.sub(1), t2 = S.sub(2);
  const b = building(v, [0, 0], 90, 90, 80); person(v, scratch([150, -10], 180)); v.flush(g); const q = v.P([45, 40, 45]); lock2(g, q[0], q[1] + 10, 1.0, { fill: '#FFFFFF' }); const d = v.P([0, 0, 0]); label(g, '中小企業', d[0], d[1] - 300, 38);
  S.sfx(t1 + .2, 'stamp'); S.sfx(S.sub(3), 'tick'); S.sfx(S.sub(4), 'tick'); const out = 1 - S.k(t2 - .1, .4); at(g, S.k(t1 + .2) * out, () => { tx(g, '4786万件', 1330, 470, 180, { align: 'center', color: RED, w: 900 }); tx(g, 'なぜ、こんなに巨大な流出が？', 1330, 590, 48, { align: 'center' }); }); const kq = 0; if (kq > 0) { g.save(); g.globalAlpha = Math.min(1, kq); g.translate(830, 330); g.scale(kq, kq); tx(g, '？', 0, 40, 150, { align: 'center', w: 900 }); g.restore(); }
  if (t > t2) { tx(g, 'その前に、確かめたいこと', 1280, 250, 54, { align: 'center', a: S.k(t2 + .1), w: 900 }); const k1 = eo(cl((t - S.sub(3)) / .45)), k2 = eo(cl((t - S.sub(4)) / .45)); if (k1 > 0) tag(g, 870, 400, 370, 330, ['本当に', '増えた？'], { a: k1, size: 56 }); if (k2 > 0) tag(g, 1320, 400, 370, 330, ['見えるように', 'なっただけ？'], { a: k2, size: 48, color: RED }); } };

// 法律（新3）：増えたように見える理由の1つは、4年前に変わった法律（回収：第2章）
const LAW = (g, S) => { const v = makeView({ cx: 520, cy: 660, s: 3.6 }), t = S.t, t1 = S.sub(1);
  box(v, [-70, 68, -38], [70, 73, 38]); for (const [x, z] of [[-64, -32], [58, -32], [-64, 28], [58, 28]]) box(v, [x, 0, z], [x + 6, 68, z + 6], { depth: v.depth([x, 30, z]) - 20 });
  box(v, [-30, 73, -20], [22, 90, 18], { c: ['#FFFFFF', PAL.g1, PAL.g3], depth: 60 }); faceText(v, [-24, 88, 18.1], [1, 0, 0], [0, -1, 0], '法 律', 12, { color: '#FFFFFF', depth: 61 });
  person(v, scratch([112, 12], 180, { look: [0, 80, 0] })); v.flush(g);
  at(g, S.k(.3), () => { tx(g, '増えたように見えるのは、', 1380, 250, 50, { align: 'center', w: 900 }); tx(g, '泥棒のせいだけじゃない', 1380, 325, 50, { align: 'center', w: 900 }); });
  S.sfx(t1 + .2, 'stamp'); const k = pop((t - t1 - .2) / .4); if (k > 0) { g.save(); g.translate(1380, 600); g.scale(k, k); roundRect(g, -230, -170, 460, 340, 12, '#FFFFFF'); g.fillStyle = RED; g.fillRect(-230, -170, 460, 90); g.lineWidth = LW; g.strokeStyle = PAL.ink; g.strokeRect(-230, -170, 460, 90);
    tx(g, '2022年 4月', 0, -104, 60, { align: 'center', color: '#FFFFFF', w: 900 }); tx(g, '法律が変わった', 0, 30, 60, { align: 'center', w: 900 }); tx(g, '何が？ → 第2章', 0, 120, 36, { align: 'center', color: PAL.g2 }); g.restore(); } };
// ---- 並べ替え（2026-11-28）：冒頭を 地図→店→泥棒→法律→机→ドミノ→目次 にし、郵便受け・10/26は第1章の頭へ。上の番号は旧番号 ----
{ const O = { ...SC }, OS = { ...SRC }, M = { 0: 3, 1: 0, 2: 4, 4: 5, 5: 6, 6: 7, 7: 1, 8: 2 }; for (const k in SC) delete SC[k]; for (const k in SRC) delete SRC[k];
  for (const n in M) { SC[n] = O[M[n]]; if (OS[M[n]]) SRC[n] = OS[M[n]]; } SC[3] = LAW; SRC[3] = '個人情報保護委員会（2026）'; for (let i = 8; i <= 18; i++) { SC[i + 1] = O[i]; if (OS[i]) SRC[i + 1] = OS[i]; } }
