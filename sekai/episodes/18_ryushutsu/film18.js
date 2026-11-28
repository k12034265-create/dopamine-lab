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

// ================= ここから下は並べ替え後の番号（20〜） =================
const PPC = '個人情報保護委員会（2026）', CO = '各社の公表資料（2026年10〜11月）', DBIR = 'Verizon DBIR 2026';
const EPo = (a, b) => [(a + b) * .7071, (b - a) * .7071];            // 画面の右へa・手前へb（cm）→ [x,z]
const E3 = (a, b, y = 0) => { const p = EPo(a, b); return [p[0], y, p[1]]; };
let WORLD = null; const _load0 = load;
export async function load2() { await _load0(); WORLD = MAPS.world.countries.map(c => new Path2D(c.d)); }
function deskAt(v, o = [0, 0]) { const [ox, oz] = o; box(v, [ox - 70, 68, oz - 38], [ox + 70, 73, oz + 38]); for (const [x, z] of [[-64, -32], [58, -32], [-64, 28], [58, 28]]) box(v, [ox + x, 0, oz + z], [ox + x + 6, 68, oz + z + 6], { depth: v.depth([ox + x, 30, oz + z]) - 20 }); }
function key2(g, x, y, s, rot = 0, o = {}) { g.save(); g.globalAlpha *= o.a ?? 1; g.translate(x, y); g.rotate(rot); g.scale(s, s); g.lineWidth = 3 / s; g.strokeStyle = PAL.ink; g.fillStyle = o.fill || '#FFFFFF'; g.beginPath(); g.arc(0, 0, 16, 0, 7); g.rect(14, -5, 46, 10); g.rect(44, 5, 7, 11); g.rect(54, 5, 6, 8); g.fill(); g.stroke(); g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fillStyle = PAL.paper; g.fill(); g.stroke(); g.restore(); }
function paper2(g, x, y, w, h, title, o = {}) { g.save(); g.globalAlpha *= o.a ?? 1; roundRect(g, x, y, w, h, 6, '#FFFFFF'); if (title) { tx(g, title, x + w / 2, y + 64, o.size || 40, { align: 'center', w: 900, color: o.color }); g.fillStyle = PAL.ink; g.fillRect(x + 30, y + 84, w - 60, 3); } g.restore(); }
function win(g, title) { g.fillStyle = '#00ff00'; g.beginPath(); g.roundRect(300, 120, 1320, 742, 18); g.fill(); g.lineWidth = 8; g.strokeStyle = PAL.ink; g.stroke(); if (title) label(g, title, W / 2, 120, 42); }
function popAt(g, S, t0, x, y, fn, snd) { if (snd) S.sfx(t0, snd); const k = pop((S.t - t0) / .4); if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); fn(); g.restore(); }
const redTag = (g, s, x, y, size = 46) => label(g, s, x, y, size, { color: RED, stroke: RED, lw: 6 });
function pic(g, x, y, s, c) { g.fillStyle = c; g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 22 * s, 8 * s, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.roundRect(x - 9 * s, y - 12 * s, 18 * s, 26 * s, 6 * s); g.fill(); g.stroke(); }
function dominoes(v, x0, n, t, t0, o = {}) { const sp = o.sp || 62; for (let i = 0; i < n; i++) { const x = x0 + i * sp, stop = o.stopAt != null && i >= o.stopAt, mx = stop ? 0 : (o.stopAt != null && i === o.stopAt - 1) || (o.last && i === n - 1) ? .52 : 1.12, a = -mx * ease(cl((t - t0 - i * (o.dt || .28)) / .45)); box(v, [x, 0, -28], [x + 9, 104, 28], { xf: rotAbout([x + 9, 0, 0], [0, 0, 1], a), depth: x + 200, c: o.c && o.c(i) }); } }

// ---- 第2章：隠せなくなった ----
SRC[20] = PPC; SRC[22] = PPC; SRC[24] = PPC + '／' + TSR;
SC[20] = (g, S) => { const v = makeView({ cx: 420, cy: 700, s: 2.7 }), t = S.t, u = ease(cl((t - .5) / 2.6)), px = 340 - 180 * u;
  box(v, [70, 0, -120], [112, 96, 0]); person(v, stand([20, -60], 0)); person(v, u < 1 ? { ...walk([px, -60], 180, t * 7), hands: { l: [-11, 108, 28], r: [11, 108, 28] } } : hold([px, -60], 180, 108, 28));
  box(v, [px - 40, 110, -72], [px - 24, 111, -48], { depth: px + 20 }); v.flush(g); label(g, '個人情報保護委員会（国）の窓口', 560, 150, 36);
  popAt(g, S, .3, 1420, 260, () => { roundRect(g, -200, -110, 400, 220, 12, '#FFFFFF'); g.fillStyle = RED; g.fillRect(-200, -110, 400, 84); g.lineWidth = LW; g.strokeStyle = PAL.ink; g.strokeRect(-200, -110, 400, 84); tx(g, '2022年 4月', 0, -48, 56, { align: 'center', color: '#FFFFFF', w: 900 }); tx(g, '法律が変わった', 0, 60, 48, { align: 'center', w: 900 }); }, 'stamp');
  const t1 = S.sub(1); ['① 国に報告する', '② 本人に知らせる'].forEach((s, i) => at(g, S.k(t1 + .8 + i * 1.6), () => tx(g, s, 1220, 500 + i * 90, 54, { w: 900 })));
  popAt(g, S, S.dur - 2.2, 1500, 740, () => { g.rotate(-.08); roundRect(g, -130, -62, 260, 124, 12, '#FFFFFF', 8, { stroke: RED }); tx(g, '義務', 0, 30, 84, { align: 'center', color: RED, w: 900 }); }, 'stamp'); };
SC[21] = (g, S) => { const v = makeView({ cx: 620, cy: 640, s: 3.0 }), t = S.t, u = ease(cl((t - S.sub(1)) / 2.2)), bx = -185 + 150 * u;
  deskAt(v); box(v, [bx, 0, -22], [bx + 50, 44, 22], { depth: bx - 30 }); faceText(v, [bx + 4, 40, 22.1], [1, 0, 0], [0, -1, 0], '流出', 18, { depth: bx - 29 });
  person(v, { pos: [bx - 42, 0], f: 0, hands: { l: [-12, 40, 34], r: [12, 40, 34] }, lean: 22, crouch: 18, feet: { l: [-10, 0, -14], r: [10, 0, 12] } }); v.flush(g);
  popAt(g, S, .3, 1400, 250, () => tag(g, -230, -90, 460, 230, ['努力義務'], { size: 76 }), 'pop'); at(g, S.k(S.sub(1) + .3), () => tx(g, '黙っていても、罰はなかった', 1400, 500, 46, { align: 'center', w: 900 }));
  const t2 = S.sub(2); popAt(g, S, t2 + .4, 1400, 680, () => env2(g, 0, 0, .9, -.06), 'pop'); at(g, S.k(t2 + 1.4), () => tx(g, '出していたのは、正直な会社だけ', 1400, 840, 40, { align: 'center', color: PAL.g2 })); };
SC[22] = (g, S) => { const v = makeView({ cx: 720, cy: 800, s: 2.2 }), t = S.t, V = [5846, 7685, 12120, 19056], Y = ['2021年度', '2022年度', '2023年度', '2024年度'], T0 = [.4, S.sub(1) - 1.2, S.sub(1) - .6, S.sub(1)];
  const B = V.map((val, i) => { const c = mul3(E1, (i - 1.5) * 118), k = eo(cl((t - T0[i]) / .9)); if (k > 0) bar3(v, c, 64, val / 100 * k, { c: i === 3 ? [RED, '#C2352A', '#A92E25'] : i ? [PAL.white, PAL.g1, PAL.g3] : undefined }); return [c, k, val]; });
  const pp = mul3(E1, 290); person(v, t > S.sub(2) ? scratch([pp[0], pp[2]], 135, { look: [B[3][0][0], 200, B[3][0][2]] }) : stand([pp[0], pp[2]], 135)); v.flush(g);
  B.forEach(([c, k, val], i) => { const b0 = v.P(c); tx(g, Y[i], b0[0], b0[1] + 118, 30, { align: 'center', color: PAL.g2 }); if (k > 0) { const tp = v.P([c[0], val / 100 * k, c[2]]); tx(g, num(val * k) + '件', tp[0], tp[1] - 62, i === 3 ? 56 : 42, { align: 'center', w: 900, color: i === 3 ? RED : PAL.ink }); } });
  const m = v.P(mul3(E1, -118)); at(g, S.k(1.2), () => { path(g, [[m[0], m[1] + 60], [m[0], 260]], null, { open: true, dash: [12, 10], stroke: RED, lw: 4 }); redTag(g, '2022年4月 義務化', m[0] + 30, 230, 34); });
  head(g, '国への漏えい報告（民間）', 130, 52, { x: 620 }); popAt(g, S, S.sub(2) + .3, 1650, 290, () => { roundRect(g, -200, -90, 400, 180, 14, '#FFFFFF', 7, { stroke: RED }); tx(g, '3年で', 0, -18, 44, { align: 'center', w: 900 }); tx(g, '3倍以上', 0, 58, 76, { align: 'center', color: RED, w: 900 }); }, 'stamp'); };
SC[23] = (g, S) => { const v = makeView({ cx: 620, cy: 500, s: 2.8 }), t = S.t; deskAt(v, [-40, -60]);
  for (let i = 0; i < 4; i++) { const u = eo(cl((t - .5 - i * .7) / .8)), to = E3(-110 + i * 92, 120), fr = [-60 + i * 8, 0, -60], p = lerp3(fr, to, u); S.sfx(.5 + i * .7, 'tick'); box(v, [p[0] - 24, 0, p[2] - 20], [p[0] + 24, 40, p[2] + 20], { depth: u > 0 ? p[0] + p[2] + 30 : -200 }); if (u > .5) faceText(v, [p[0] - 20, 36, p[2] + 20.1], [1, 0, 0], [0, -1, 0], '流出', 16, { depth: p[0] + p[2] + 31, a: (u - .5) * 2 }); }
  v.flush(g);
  at(g, S.k(S.sub(1) - .2), () => { tx(g, '漏れる数が増えた、のではなく', 1400, 230, 44, { align: 'center' }); tx(g, '「隠せなくなった」分', 1400, 320, 66, { align: 'center', w: 900, color: RED }); });
  const t2 = S.sub(2); popAt(g, S, t2 + 2.2, 1400, 560, () => { tick(g, 0, 0, 70, 20); }, 'pop'); at(g, S.k(t2 + 2.4), () => tx(g, '制度が、ちゃんと働いている証拠', 1400, 730, 42, { align: 'center', w: 900 })); };
SC[24] = (g, S) => { const v = makeView({ cx: 960, cy: 820, s: 1.6 }), t = S.t, t1 = S.sub(1), t2 = S.sub(2), k1 = ease(cl((t - t1 - 1) / 1.2)), k2 = ease(cl((t - t2 - 1.5) / 1.4));
  const A = [mul3(E1, -330), mul3(E1, -215), mul3(E1, 180), mul3(E1, 295)], h1 = 190.6 - 19.2 * k1, h3 = 158.7 + 147.6 * k2;
  bar3(v, A[0], 66, 190.6); bar3(v, A[1], 66, h1, { c: [PAL.white, PAL.g1, PAL.g3] }); bar3(v, A[2], 66, 158.7); bar3(v, A[3], 66, h3, { c: [RED, '#C2352A', '#A92E25'] }); v.flush(g);
  const L = [['2024年度', '19056件', 190.6], ['2025年度', Math.round(19056 - 1917 * k1) + '件', h1], ['2024年', '1587万人', 158.7], ['2025年', Math.round(h3 * 10) + '万人', h3]];
  L.forEach((l, i) => { const b = v.P(A[i]), tp = v.P([A[i][0], l[2], A[i][2]]); tx(g, l[0], b[0], b[1] + 110, 28, { align: 'center', color: PAL.g2 }); tx(g, l[1], tp[0], tp[1] - 56, 40, { align: 'center', w: 900, color: i === 3 ? RED : PAL.ink }); });
  const a = v.P(mul3(E1, -272)), b = v.P(mul3(E1, 238)); tx(g, '国への報告件数', a[0], 150, 46, { align: 'center', w: 900 }); tx(g, '漏れた人数', b[0], 150, 46, { align: 'center', w: 900 });
  at(g, S.k(t1 + 2.2), () => label(g, '少し減った', a[0], 215, 36)); S.sfx(t2 + 2.9, 'stamp'); at(g, S.k(t2 + 2.9), () => redTag(g, '倍になった', b[0], 215, 38)); at(g, S.k(t2 + 3.2), () => tx(g, '≠', 960, 520, 150, { align: 'center', w: 900, color: PAL.g2 })); };
SC[25] = (g, S) => { const v = makeView({ cx: 760, cy: 600, s: 2.1 }), t = S.t, t1 = S.sub(1), t2 = S.sub(2);
  for (let i = 0; i < 3; i++) { const c = E3(-240 + i * 150, -60); building(v, [c[0], c[2]], 84, 84, 78); } const p = EPo(240, 100); person(v, t > t1 ? scratch(p, -45, { ...THIEF, look: E3(900, 100, 150) }) : hips(p, 135, THIEF)); v.flush(g);
  head(g, '「見えるようになっただけ」なら、1件の大きさは変わらない', 150, 46); at(g, S.k(t1 + .3), () => tx(g, '泥棒の側で、何かが変わった', 1380, 290, 52, { align: 'center', w: 900, color: RED }));
  if (t > t2) { S.sfx(t2 + .3, 'swish'); const q = v.P(E3(310, 100, 110)); arrow2(g, q[0], q[1], q[0] + 330 * S.e(t2 + .3, .6), q[1], { color: RED, lw: 9, head: 34 }); at(g, S.k(t2 + .8), () => tx(g, '狙う場所は…？', q[0] + 180, q[1] + 90, 46, { align: 'center', w: 900 })); } };

// ---- 第3章：泥棒は「合鍵屋」を狙う ----
SRC[27] = CO; SRC[28] = CO; SRC[32] = DBIR; SRC[33] = DBIR; SRC[35] = 'ユミルリンクの公表資料（2026）'; SRC[36] = 'ユミルリンクの公表資料（2026）';
SC[26] = (g, S) => { const t = S.t, N = [['ニトリ', '最大3762万件'], ['ドコモ', '約30万件'], ['無印良品', '約2726万件']]; head(g, 'いちばん件数が大きかったのは？', 190, 60);
  N.forEach((n, i) => { const x = 250 + i * 490, k = eo(cl((t - .3 - i * .2) / .4)); g.save(); g.translate(0, (1 - k) * 50); tag(g, x, 360, 400, 320, [n[0]], { a: k, size: 64 }); tx(g, n[1], x + 200, 640, 38, { align: 'center', color: PAL.g2, a: k }); g.restore(); const t0 = S.dur * .45 + i * .45; S.sfx(t0, 'tick'); const kx = cl((t - t0) / .2); if (kx > 0) cross(g, x + 200, 520, 130 * (2 - kx), 22); });
  at(g, S.k(S.dur * .45 + 1.6), () => tx(g, '実は、どれでもない', W / 2, 840, 54, { align: 'center', w: 900, color: RED })); };
SC[27] = (g, S) => { win(g, 'メール配信の代行会社'); at(g, S.k(S.sub(1) + .5), () => label(g, '企業のお知らせ・メルマガを、代わりに配る会社', W / 2, 760, 40)); popAt(g, S, S.sub(2) + .3, W / 2, 860, () => redTag(g, 'ふだん、名前を見ることはない', 0, 0, 44), 'pop'); };
SC[28] = (g, S) => { const t = S.t, t1 = S.sub(1), t2 = S.sub(2), sc = .98, ox = 860, oy = 30, J = MAPS.japan.pts, T = J.tokyo;
  g.save(); g.translate(ox, oy); g.scale(sc, sc); g.fillStyle = '#FFFFFF'; g.fill(JP2D); g.lineWidth = 2.2; g.strokeStyle = PAL.ink; g.lineJoin = 'round'; g.stroke(JP2D);
  Object.values(J).forEach((p, i) => { const k = eo(cl((t - t2 - .3 - i * .05) / .6)); if (k <= 0 || p === T) return; g.beginPath(); g.moveTo(T[0], T[1]); g.lineTo(T[0] + (p[0] - T[0]) * k, T[1] + (p[1] - T[1]) * k); g.strokeStyle = RED; g.lineWidth = 2.5; g.stroke(); if (k >= 1) { g.beginPath(); g.arc(p[0], p[1], 6, 0, 7); g.fillStyle = RED; g.fill(); } });
  g.beginPath(); g.arc(T[0], T[1], 13, 0, 7); g.fillStyle = PAL.ink; g.fill(); g.restore(); tx(g, '※線の行き先はイメージ', 1880, 915, 24, { align: 'right', color: PAL.g3, w: 500 });
  const card = (y, a, b, c) => { roundRect(g, 90, y, 700, 200, 14, '#FFFFFF'); tx(g, a, 130, y + 70, 44, { w: 900 }); tx(g, b, 130, y + 160, 76, { w: 900, color: RED }); if (c) tx(g, c, 760, y + 70, 32, { align: 'right', color: PAL.g2 }); };
  popAt(g, S, .3, 0, 0, () => card(150, 'ユミルリンク', '延べ4786万件', '配信先の情報'), 'pop'); popAt(g, S, t1 + .2, 0, 0, () => card(390, 'アララ', '8132万件', 'メールアドレス'), 'pop');
  S.sfx(t2 + .3, 'swish'); at(g, S.k(t2 + .5), () => { tx(g, 'お客さんの会社は', 440, 700, 42, { align: 'center' }); tx(g, '最大 約380社', 440, 800, 84, { align: 'center', w: 900 }); }); };
SC[29] = (g, S) => { const v = makeView({ cx: 960, cy: 500, s: 1.55 }), t = S.t, t1 = S.sub(1), t2 = S.sub(2), H = [[-380, -120], [380, -120], [-380, 170], [380, 170]];
  H.forEach(h => { const c = EPo(h[0], h[1]); building(v, c, 84, 84, 76); }); const ks = EPo(0, 40); const kb = building(v, ks, 70, 70, 60);
  const p0 = EPo(-380, 290), p1 = EPo(-130, 150), u = ease(cl((t - t2 - .3) / 2.2)), pp = [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u]; person(v, u > 0 && u < 1 ? walk(pp, -30, t * 7, THIEF) : stand(pp, u >= 1 ? 225 : 225, THIEF)); v.flush(g);
  const kq = v.P(kb.top); label(g, '合鍵屋', kq[0], kq[1] - 96, 40); for (let i = 0; i < 5; i++) key2(g, kq[0] - 110 + i * 48, kq[1] - 40, .62, 1.57);
  if (t > t1 && t < t2 + .5) { const q = v.P(E3(-380, 170, 130)); popAt(g, S, t1 + 1.6, q[0], q[1] - 20, () => { cross(g, 0, 0, 40, 14); }, 'tick'); at(g, S.k(t1 + 1.8), () => label(g, '1軒ずつは、大変', q[0] + 20, q[1] - 110, 36)); }
  const ta = t2 + 3.0; S.sfx(ta, 'swish'); H.forEach((h, i) => { const k = eo(cl((t - ta - i * .12) / .5)); if (k <= 0) return; const a = v.P(E3(0, 40, 30)), b = v.P(E3(h[0] * .82, 40 + (h[1] - 40) * .82, 30)); arrow2(g, a[0], a[1], a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, { color: RED, lw: 7, head: 26 }); });
  at(g, S.k(ta + .6), () => redTag(g, '1軒襲えば、全部の家に入れる', W / 2, 870, 46)); head(g, '泥棒の気持ちで考える', 110, 50, { a: S.k(.2) }); };
SC[30] = (g, S) => { const t = S.t, t2 = S.sub(2), t3 = S.sub(3); head(g, 'なぜ、外の会社に任せるのか？', 160, 56);
  const yen = (x, y, n, k) => { for (let i = 0; i < n * k; i++) { g.beginPath(); g.arc(x + (i % 6) * 62, y + Math.floor(i / 6) * 62, 25, 0, 7); g.fillStyle = '#FFFFFF'; g.fill(); g.lineWidth = LW; g.strokeStyle = PAL.ink; g.stroke(); tx(g, '¥', x + (i % 6) * 62, y + Math.floor(i / 6) * 62 + 14, 36, { align: 'center', w: 900 }); } };
  at(g, S.k(.4), () => { paper2(g, 240, 250, 560, 560, '自分で仕組みを作る'); yen(330, 400, 18, cl((t - .8) / 1.6)); tx(g, 'サーバー・保守・迷惑メール対策…', 520, 760, 30, { align: 'center', color: PAL.g2 }); });
  at(g, S.k(t3 - .4), () => { paper2(g, 1120, 250, 560, 560, '専門の会社に任せる', { color: RED }); yen(1210, 400, 4, cl((t - t3) / .8)); tx(g, 'ずっと安い・確実に届く', 1400, 760, 34, { align: 'center', w: 900 }); });
  popAt(g, S, t3 + 1.6, 1560, 560, () => tick(g, 0, 0, 80, 22, { color: RED }), 'pop'); const v = makeView({ cx: 960, cy: 890, s: 1.9 }); person(v, t > t3 ? hips([0, 0], 45) : scratch([0, 0], 45)); v.flush(g); };
SC[31] = (g, S) => { const v = makeView({ cx: 900, cy: 640, s: 2.5 }), t = S.t, t1 = S.sub(1); box(v, [-62, 0, -46], [62, 64, 46]); poly3(v, [[-54, 64.2, -38], [54, 64.2, -38], [54, 64.2, 38], [-54, 64.2, 38]], PAL.g2, { depth: 2 });
  for (let i = 0; i < 6; i++) { const an = i / 6 * 6.28 + .5, fr = [Math.cos(an) * 250, 0, Math.sin(an) * 250], u = cl((t - .4 - i * .5) / .9); if (u >= 1) continue; S.sfx(.4 + i * .5 + .8, 'tick'); const p = lerp3(fr, [0, 60, 0], ease(u)); p[1] += Math.sin(u * 3.14) * 120; box(v, [p[0] - 14, p[1], p[2] - 11], [p[0] + 14, p[1] + 20, p[2] + 11], { depth: 300 + i, alpha: u > 0 ? 1 : .0 }); }
  const tp = EPo(210, 40); person(v, t > t1 + .8 ? reach(tp, 180 + 20, [50, 80, 20], 'r', { ...THIEF, lean: 12 }) : stand(tp, 200, THIEF)); v.flush(g);
  head(g, 'みんなの情報が、1か所に集まる', 150, 54); popAt(g, S, t1 + 1.0, 1420, 260, () => redTag(g, '泥棒には、最高の宝箱', 0, 0, 46), 'pop'); at(g, S.k(t1 + 4.0), () => { tx(g, '安全と効率を外に任せたら、', 1420, 760, 40, { align: 'center' }); tx(g, '危険まで、まとめて任せていた', 1420, 830, 44, { align: 'center', w: 900 }); }); };
SC[32] = (g, S) => { const v = makeView({ cx: 900, cy: 680, s: 1.6 }), t = S.t, t1 = S.sub(1), D = [[-290, 160, 190, '本社'], [40, 110, 115, '委託先'], [330, 74, 70, '再委託先']]; const B = D.map(d => building(v, EPo(d[0], -40), d[1], d[1], d[2]));
  const u = ease(cl((t - t1 - .3) / 2)), p0 = EPo(660, 170), p1 = EPo(430, 60), pp = [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u]; person(v, u > 0 && u < 1 ? walk(pp, 160, t * 7, THIEF) : stand(pp, 160, THIEF)); v.flush(g);
  redTag(g, 'サプライチェーン攻撃', 1250, 170, 56); D.forEach((d, i) => { const q = v.P(B[i].top); label(g, d[3], q[0], q[1] - 110 - (i ? 0 : 20), 38); const f = v.P(E3(d[0] + d[1] * .5, -40 + d[1] * .5, d[2] * .35)); lock2(g, f[0], f[1], [1.7, 1.0, .55][i], { fill: i ? '#FFFFFF' : PAL.g1 }); });
  [[2, 1], [1, 0]].forEach(([a, b], i) => { const t0 = t1 + 2.6 + i * 1.0; S.sfx(t0, 'swish'); const k = eo(cl((t - t0) / .6)); if (k <= 0) return; const A = v.P(E3(D[a][0] - D[a][1] * .6, 60, 40)), Bp = v.P(E3(D[b][0] + D[b][1] * .75, 60, 40)); arrow2(g, A[0], A[1], A[0] + (Bp[0] - A[0]) * k, A[1] + (Bp[1] - A[1]) * k, { color: RED, lw: 9, head: 30 }); });
  at(g, S.k(t1 + 4.2), () => label(g, '会社そのものではなく、仕事を任せている取引先から入る', W / 2, 870, 40)); };
SC[33] = (g, S) => { const t = S.t, t1 = S.dur * .42; g.save(); g.translate(160, 70); g.globalAlpha = .9; for (const p of WORLD) { g.fillStyle = '#FFFFFF'; g.fill(p); g.lineWidth = 1; g.strokeStyle = PAL.g1; g.stroke(p); }
  for (let i = 0; i < 90 * cl(t / 2.5); i++) { const x = 150 + rnd(i * 3) * 1300, y = 120 + rnd(i * 7 + 1) * 520; if (!WORLD.some(p => g.isPointInPath(p, 160 + x, 70 + y))) continue; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fillStyle = RED; g.fill(); } g.restore();
  label(g, '世界2万件以上の侵害を分析（ベライゾン）', W / 2, 110, 40); S.sfx(t1, 'count');
  at(g, S.k(t1 - .3), () => { roundRect(g, 380, 330, 1160, 430, 20, '#FFFFFF', 5); tx(g, '取引先・委託先が関わる侵害', 960, 420, 46, { align: 'center', w: 900 }); tx(g, '30%', 640, 620, 150, { align: 'center', w: 900, color: PAL.g2 }); arrow2(g, 820, 570, 990, 570, { lw: 12, head: 40 }); const k = ease(cl((t - t1) / 1.4)); tx(g, Math.round(30 + 18 * k) + '%', 1250, 630, 200, { align: 'center', w: 900, color: RED }); tx(g, '前の年', 640, 700, 34, { align: 'center', color: PAL.g2 }); tx(g, '今年の報告', 1250, 710, 34, { align: 'center', color: PAL.g2 }); });
  popAt(g, S, S.dur - 2.6, W / 2, 850, () => redTag(g, '1年で6割増 ＝ ほぼ2件に1件', 0, 0, 46), 'stamp'); };
SC[34] = (g, S) => { const v = makeView({ cx: 1000, cy: 620, s: 1.5 }), t = S.t, tg = S.dur * .55; person(v, stand(EPo(-470, 60), -45)); const A = building(v, EPo(-150, -20), 140, 140, 150);
  const gc = EPo(250, -20); box(v, [gc[0] - 50, 0, gc[1] - 50], [gc[0] + 50, 90, gc[1] + 50], { ghost: true, dash: [10, 9], lw: 3 });
  if (t > tg) for (let j = 0; j < 12; j++) { const u = ((t - tg) * .5 + j / 12) % 1; if (t - tg < j * .12) continue; const an = rnd(j) * 6.28, rr = 60 + rnd(j * 3) * 130; const q = [gc[0] + Math.cos(an) * rr * u, 90 + Math.sin(u * 3.14) * 90 - 90 * u * u, gc[1] + Math.sin(an) * rr * u]; slab(v, q, 15, 1.2, 21, { xf: rotAbout(add3(q, [7, 0, 10]), [rnd(j), .4, rnd(j + 2)], u * 6 + j), depth: 500 + j }); }
  v.flush(g); const y0 = v.P(E3(-470, 60, 180)), a0 = v.P(A.top), g0 = v.P([gc[0], 90, gc[1]]); label(g, 'あなた', y0[0], y0[1] - 30, 38); label(g, 'ちゃんと選んだ会社', a0[0], a0[1] - 110, 36); const f = v.P(E3(-80, 50, 50)); lock2(g, f[0], f[1], 1.5, {});
  at(g, S.k(S.dur * .35), () => { label(g, '？　名前も知らない会社', g0[0] + 40, g0[1] - 110, 36, { fill: PAL.paper }); const m1 = v.P(E3(-380, 60, 90)), m2 = v.P(E3(-250, 20, 90)), m3 = v.P(E3(-40, 20, 90)), m4 = v.P(E3(180, 0, 90)); arrow2(g, m1[0], m1[1], m2[0], m2[1], { lw: 6 }); arrow2(g, m3[0], m3[1], m4[0], m4[1], { lw: 6, dash: [14, 10] }); });
  S.sfx(tg, 'swish'); at(g, S.k(tg + .5), () => redTag(g, '漏れるのは、ここから', g0[0] + 60, g0[1] + 300, 44)); };
SC[35] = (g, S) => { const v = makeView({ cx: 600, cy: 520, s: 1.9 }), t = S.t, t1 = S.sub(1), u = cl((t - t1 - 1.5) / (S.dur - t1 - 3.5)), px = -230 + 520 * ease(u);
  for (let i = 0; i < 4; i++) { const x = -200 + i * 135, op = ease(cl((px - x + 40) / 60)) * (i ? 1 : 1); box(v, [x - 6, 0, -4], [x, 150, 4], { depth: x }); box(v, [x + 70, 0, -4], [x + 76, 150, 4], { depth: x + 70 }); box(v, [x - 6, 150, -4], [x + 76, 156, 4], { depth: x + 30 });
    box(v, [x, 0, -2], [x + 70, 150, 2], { xf: rotAbout([x, 0, 2], [0, 1, 0], -1.25 * op), depth: x + 35 + op * 30, c: [PAL.white, PAL.s1, op > .5 ? '#F2C9C4' : PAL.s2] }); }
  person(v, u > 0 && u < 1 ? walk([px, 75], 0, t * 7, THIEF) : stand([px, 75], 0, THIEF)); v.flush(g); const h = v.P([px + 20, 150, 75]); key2(g, h[0] + 30, h[1] - 60, 1.2, -.5);
  head(g, '合鍵屋の中では、さらに奥の鍵が狙われる', 150, 48, { x: 1380 }); at(g, S.k(t1 + .4), () => { label(g, 'サポート担当者のログイン情報', 1400, 300, 38); tx(g, 'プログラムの弱点を突いて盗む', 1400, 380, 34, { align: 'center', color: PAL.g2 }); });
  at(g, S.k(S.sub(2) + .5), () => redTag(g, 'ほかのシステムにも次々と', 1400, 520, 42)); };
SC[36] = (g, S) => { const t = S.t, t1 = S.sub(1), t2 = S.sub(2), t3 = S.sub(3), k = ease(cl((t - t1 - .8) / 1.6)); head(g, '調べるほど、被害が広がる', 160, 56);
  popAt(g, S, .3, 520, 520, () => { paper2(g, -230, -260, 460, 520, '第一報'); tx(g, '5', 0, 110, 230, { align: 'center', w: 900 }); tx(g, 'システム', 0, 200, 40, { align: 'center', color: PAL.g2 }); }, 'pop');
  if (t > t1) { arrow2(g, 790, 520, 940, 520, { lw: 12, head: 40, a: S.k(t1) }); S.sfx(t1 + .8, 'count'); popAt(g, S, t1 + .2, 1220, 520, () => { paper2(g, -230, -260, 460, 520, '第二報', { color: RED }); tx(g, String(Math.round(5 + 44 * k)), 0, 110, 230, { align: 'center', w: 900, color: RED }); tx(g, 'システム', 0, 200, 40, { align: 'center', color: PAL.g2 }); }, 'pop'); }
  ['第三報', '第四報'].forEach((s, i) => popAt(g, S, t3 + .6 + i * .7, 1620 + i * 90, 420 + i * 150, () => { g.rotate(.1 + i * .08); paper2(g, -110, -70, 220, 140, null); tx(g, s, 0, 18, 44, { align: 'center', w: 900 }); }, 'tick')); };

// ---- 第4章：知っていたのに、直せない ----
const GMO = 'GMOインターネットグループの公表・会見（2026）', NHK = 'NHK（2026年11月6日）';
for (const i of [38, 39, 40, 41, 42]) SRC[i] = GMO; SRC[44] = 'ニトリの公表資料（2026年11月）'; SRC[45] = 'NTTドコモの公表資料（2026）'; SRC[46] = 'ビジネス+IT（2026）'; SRC[47] = DBIR; SRC[48] = DBIR; SRC[49] = DBIR; SRC[50] = NHK;
SC[37] = (g, S) => { win(g, null); popAt(g, S, S.sub(1), W / 2, 800, () => label(g, 'ここで、ある会社の話', 0, 0, 50, { lw: 5 }), 'pop'); at(g, S.k(.3), () => label(g, 'なぜ、そんなに簡単に入られるのか？', W / 2, 120, 44)); };
SC[38] = (g, S) => { SC[4](g, S); label(g, 'GMOインターネットグループ', 520, 150, 42); at(g, S.k(1.5), () => tx(g, 'グループのセキュリティ専門家から', 1470, 850, 36, { align: 'center', color: PAL.g2 })); };
SC[39] = (g, S) => { const v = makeView({ cx: 620, cy: 760, s: 2.7 }), t = S.t, t1 = S.sub(1); box(v, [-12, 0, -170], [0, 180, 150], { depth: -100 });
  const hole = []; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28, r = 26 + 9 * rnd(i); hole.push([.2, 85 + Math.sin(a) * r, -10 + Math.cos(a) * r * 1.2]); } poly3(v, hole, PAL.dark, { depth: -99 });
  const Bd = [[140, -95], [38, -90], [142, 70], [36, 78]]; let n = 0; Bd.forEach((b, i) => { const t0 = .5 + i * .8, k = pop((t - t0) / .35); S.sfx(t0, 'tick'); if (k <= 0) return; n++; const w = 22 * k, h = 9 * k; poly3(v, [[.3, b[0] - h, b[1] - w], [.3, b[0] + h, b[1] - w], [.3, b[0] + h, b[1] + w], [.3, b[0] - h, b[1] + w]], '#FFFFFF', { depth: -98 }); line3(v, [.4, b[0] - h, b[1]], [.4, b[0] + h, b[1]], { depth: -97, lw: 2 }); });
  person(v, reach([62, 105], 180, [2, 125, 82], 'r')); v.flush(g);
  tx(g, '緊急メンテナンス', 1380, 240, 50, { align: 'center', w: 900 }); tx(g, n + '回', 1380, 400, 150, { align: 'center', w: 900 });
  popAt(g, S, t1 + .4, 1380, 560, () => redTag(g, '穴は、ふさがっていない', 0, 0, 48), 'stamp'); at(g, S.k(S.sub(2) + .5), () => tx(g, '「速さと深さが足りなかった」', 1380, 730, 44, { align: 'center', w: 900 })); };
SC[40] = (g, S) => { const t = S.t, t1 = S.sub(1), t2 = S.sub(2), y = 470, N = [[330, '2024年4月', '弱点の指摘', .3], [1050, '2026年8月5日', 'サーバーに侵入', t1 - .3], [1560, '8月17日', '管理用サーバーも乗っ取り', t2]];
  const kl = eo(cl((t - .5) / (t1 - .5))); g.strokeStyle = PAL.ink; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(200, y); g.lineTo(200 + 1520 * Math.min(1, kl * .62 + (t > t2 ? S.e(t2, .6) * .38 : 0)), y); g.stroke();
  N.forEach((n, i) => popAt(g, S, n[3], n[0], y, () => { g.beginPath(); g.arc(0, 0, 24, 0, 7); g.fillStyle = i ? RED : '#FFFFFF'; g.fill(); g.lineWidth = 6; g.strokeStyle = PAL.ink; g.stroke(); tx(g, n[1], 0, -70, 44, { align: 'center', w: 900 }); tx(g, n[2], 0, 100, 36, { align: 'center', color: i ? RED : PAL.ink, w: 900 }); }, 'pop'));
  at(g, S.k(t1 + .6), () => { path(g, [[340, y + 170], [340, y + 200], [1040, y + 200], [1040, y + 170]], null, { open: true, lw: 4 }); label(g, '2年以上、そのまま', 690, y + 200, 42); });
  if (t > t1) { const v = makeView({ cx: 1300, cy: 900, s: 1.6 }); person(v, hips([0, 0], 45, THIEF)); v.flush(g); } head(g, 'そして、2年以上たった今年…', 170, 52); };
SC[41] = (g, S) => { const v = makeView({ cx: 560, cy: 640, s: 3.2 }), t = S.t, t2 = S.sub(2); box(v, [-70, 0, -40], [70, 36, 30]); box(v, [-70, 36, -40], [70, 88, -24], { depth: -200 }); box(v, [-84, 0, -40], [-70, 56, 30]); box(v, [70, 0, -40], [84, 56, 30]);
  person(v, { pos: [0, 2], f: 90, crouch: 38, hipBack: 6, feet: { l: [-12, 0, 44], r: [12, 0, 44] }, hands: { l: [-30, 100, -18], r: [30, 100, -18] }, elbow: { l: [-1, .3, 0], r: [1, .3, 0] }, lean: -8, headBias: 50, ...THIEF }); v.flush(g);
  const d = Math.round(76 * ease(cl((t - 1.2) / 3.5))); S.sfx(1.2, 'count'); const cal = (x, a, b, red) => { roundRect(g, x - 150, 230, 300, 250, 12, '#FFFFFF'); g.fillStyle = red ? RED : PAL.ink; g.fillRect(x - 150, 230, 300, 74); tx(g, a, x, 284, 44, { align: 'center', color: '#FFFFFF', w: 900 }); tx(g, b, x, 420, 60, { align: 'center', w: 900, color: red ? RED : PAL.ink }); };
  cal(1160, '8月5日', '侵入'); arrow2(g, 1330, 355, 1440, 355, { lw: 9, head: 30 }); at(g, S.k(.6), () => cal(1620, '10月20日', '気づく', true)); tx(g, d + '日', 1390, 680, 170, { align: 'center', w: 900, color: RED }); tx(g, '泥棒が、家の中にいた日数', 1390, 760, 38, { align: 'center' });
  at(g, S.k(S.sub(1) + .2), () => label(g, '気づいたきっかけは、お客さんからの指摘', 1390, 860, 36)); };
SC[42] = (g, S) => { const t = S.t, t3 = S.sub(3); roundRect(g, 240, 150, 1440, 600, 24, '#FFFFFF', 14); g.save(); g.beginPath(); g.rect(247, 157, 1426, 586); g.clip(); const v = makeView({ cx: 960, cy: 600, s: 2.3 });
  poly3(v, [E3(-500, -60), E3(500, -60), E3(500, 90), E3(-500, 90)], PAL.s1, { depth: -9999 }); let tq = null, bd = 1e9; const tm = Math.min(t, t3 + .2); for (let i = 0; i < 5; i++) { const a = ((tm * 34 + i * 190) % 950) - 475, p = EPo(a, (i % 2) * 50 - 10); const r = person(v, t > t3 + .2 ? stand(p, -45) : walk(p, -45, t * 6 + i * 2)); if (Math.abs(a - 80) < bd) { bd = Math.abs(a - 80); tq = v.P(r.head); } } v.flush(g); g.restore();
  g.fillStyle = RED; g.beginPath(); g.arc(300, 205, 13, 0, 7); g.fill(); tx(g, 'REC　防犯カメラ', 326, 220, 34, { w: 900 });
  if (t > t3 && tq) { S.sfx(t3 + .2, 'pop'); g.save(); g.globalAlpha = S.k(t3 + .2, .3); g.strokeStyle = RED; g.lineWidth = 8; g.setLineDash([16, 12]); g.beginPath(); g.ellipse(tq[0], tq[1] + 150, 95, 230, 0, 0, 7); g.stroke(); g.setLineDash([]); tx(g, '泥棒', tq[0], tq[1] - 100, 48, { align: 'center', color: RED, w: 900, halo: 10, haloC: '#FFFFFF' }); g.restore(); }
  at(g, S.k(S.sub(2)), () => label(g, '盗んだ正規の鍵・管理者の権限で入る', 620, 830, 38)); at(g, S.k(t3 + .8), () => redTag(g, '映っていても、ただの出勤', 1380, 830, 42)); };
SC[43] = (g, S) => { const v = makeView({ cx: 520, cy: 760, s: 2.8 }), t = S.t; box(v, [-38, 0, -34], [38, 172, 34]); line3(v, [38.2, 110, -34], [38.2, 110, 34], { depth: 9 }); line3(v, [38.3, 122, 26], [38.3, 150, 26], { depth: 9, lw: 5 }); line3(v, [38.3, 70, 26], [38.3, 98, 26], { depth: 9, lw: 5 });
  person(v, hold([110, 20], 180, 112, 24, { ...THIEF, nod: 8 })); box(v, [78, 113, 10], [92, 114, 30], { depth: 140 }); v.flush(g);
  popAt(g, S, .5, 1330, 500, () => { g.rotate(.03); paper2(g, -280, -300, 560, 600, '泥棒のメモ'); for (let i = 0; i < 4; i++) { g.fillStyle = PAL.s2; g.fillRect(-230, -110 + i * 100, 460, 3); } tx(g, '・牛乳　残り半分', -220, -130, 50, { w: 900, a: S.k(1.6) }); tx(g, '・卵　あと3個', -220, -30, 50, { w: 900, color: PAL.g2, a: S.k(2.3) }); }, 'pop');
  label(g, '2か月半あれば…', 520, 140, 44); };
SC[44] = (g, S) => { const t = S.t, t1 = S.sub(1), x0 = 250, y0 = 250, cw = 124, ch = 96; head(g, 'ニトリ', 170, 64, { x: 400 }); tx(g, '10月', x0 - 90, y0 + 60, 44, { w: 900 }); tx(g, '11月', x0 - 90, y0 + 5 * ch + 60, 44, { w: 900 });
  for (let d = 0; d < 42; d++) { const day = d < 31 ? d + 1 : d - 30, m11 = d >= 31, col = (d + 3) % 7, row = Math.floor((d + 3) / 7), x = x0 + col * cw, y = y0 + row * ch; roundRect(g, x, y, cw - 8, ch - 8, 6, '#FFFFFF', 2); tx(g, String(day), x + 10, y + 30, 24, { color: PAL.g3 });
    if (!m11 && day >= 15 || m11 && day <= 5) { const k = cl((t - t1 - 2.2 - (d - 14) * .09) / .3); if (k > 0) { g.save(); g.globalAlpha = k * .8; g.fillStyle = PAL.g2; g.beginPath(); g.ellipse(x + 50, y + 54, 9, 15, .3, 0, 7); g.ellipse(x + 78, y + 44, 9, 15, .3, 0, 7); g.fill(); g.restore(); } }
    if (m11 && day === 6) popAt(g, S, .6, x + 58, y + 44, () => { g.rotate(-.12); roundRect(g, -62, -34, 124, 68, 8, '#FFFFFF', 6, { stroke: RED }); tx(g, '判明', 0, 16, 44, { align: 'center', color: RED, w: 900 }); }, 'stamp'); }
  at(g, S.k(.8), () => tx(g, '11月6日　不正アクセスに気づく', 1500, 400, 40, { align: 'center', w: 900 })); S.sfx(t1 + 2.2, 'swish'); at(g, S.k(t1 + 2.4), () => { tx(g, '実は、10月の中旬から', 1500, 560, 44, { align: 'center', w: 900, color: RED }); tx(g, 'アクセスされていた可能性', 1500, 630, 44, { align: 'center', w: 900, color: RED }); });
  at(g, S.k(.2), () => tx(g, '1社だけの話ではない', 1500, 250, 38, { align: 'center', color: PAL.g2 })); };
SC[45] = (g, S) => { const v = makeView({ cx: 560, cy: 560, s: 1.7 }), t = S.t, t1 = S.sub(1), P = [E3(-260, -80), E3(0, -80), E3(260, -80)], T = E3(0, 210);
  const pipe = (a, b, d) => { line3(v, [a[0], 40, a[2]], [b[0], 40, b[2]], { lw: 20, depth: d }); line3(v, [a[0], 40, a[2]], [b[0], 40, b[2]], { lw: 13, stroke: '#FFFFFF', depth: d + .1 }); };
  pipe(P[0], P[1], -50); pipe(P[1], P[2], -49); P.forEach((p, i) => { box(v, [p[0] - 42, 0, p[2] - 42], [p[0] + 42, 90, p[2] + 42]); faceText(v, [p[0] - 30, 70, p[2] + 42.1], [1, 0, 0], [0, -1, 0], 'システム', 13); });
  const k = S.k(.6, .8); if (k > 0) { line3(v, [P[1][0], 40, P[1][2] + 42], lerp3([P[1][0], 40, P[1][2] + 42], [T[0], 40, T[2] - 30], k), { lw: 20, depth: 60, stroke: RED }); line3(v, [P[1][0], 40, P[1][2] + 42], lerp3([P[1][0], 40, P[1][2] + 42], [T[0], 40, T[2] - 30], k), { lw: 11, stroke: '#FFFFFF', depth: 60.1 }); }
  if (t > 1.4) for (let j = 0; j < 8; j++) { const u = ((t - 1.4) * .45 + j / 8) % 1, q = lerp3([P[1][0], 46, P[1][2] + 42], [T[0], 46, T[2] - 30], u); slab(v, [q[0] - 7, q[1], q[2] - 10], 14, 1.2, 20, { depth: 62 + u }); }
  box(v, [T[0] - 30, 0, T[2] - 30], [T[0] + 30, 50, T[2] + 30], { c: ['#77726C', '#5E5A55', '#4A4743'] }); person(v, hips([T[0] + 85, T[2] + 10], 200, THIEF)); v.flush(g);
  label(g, 'NTTドコモ', 560, 150, 44); at(g, S.k(.8), () => redTag(g, 'システム同士をつなぐ仕組みを悪用', 560, 230, 36));
  popAt(g, S, t1 + .5, 1570, 380, () => { tx(g, '最大', -300, 0, 44, { w: 900 }); tx(g, '29万4839', 60, 14, 110, { align: 'center', color: RED, w: 900 }); tx(g, '回線分', 60, 90, 44, { align: 'center', w: 900 }); }, 'stamp');
  ['本人確認書類の番号', '一部は、銀行の口座番号'].forEach((s, i) => at(g, S.k(S.sub(2) + .8 + i * 1.8), () => label(g, s, 1540, 600 + i * 110, 42))); };
SC[46] = (g, S) => { const t = S.t, t2 = S.sub(2), t3 = S.sub(3); popAt(g, S, .4, 560, 520, () => { g.rotate(-.03); paper2(g, -250, -300, 500, 600, '健康診断の結果'); tx(g, '異常なし', 0, 60, 96, { align: 'center', w: 900 }); tick(g, 150, 190, 46, 14); }, 'pop');
  const v = makeView({ cx: 1300, cy: 880, s: 2.5 }); const hurt = t > t3 + 1.2; person(v, hurt ? { pos: [0, 0], f: 45, hands: { r: [16, 96, 16], l: [-10, 100, 18] }, lean: 14, nod: 10 } : hips([0, 0], 45)); v.flush(g);
  if (hurt) { S.sfx(t3 + 1.2, 'stamp'); const k = pop((t - t3 - 1.2) / .3); g.save(); g.translate(1420, 620); g.scale(k, k); g.strokeStyle = RED; g.lineWidth = 12; g.lineJoin = 'miter'; g.beginPath(); g.moveTo(60, -90); g.lineTo(10, -20); g.lineTo(50, -10); g.lineTo(-10, 70); g.stroke(); g.restore(); tx(g, 'まったく別の場所が…', 1560, 500, 44, { align: 'center', color: RED, w: 900 }); }
  label(g, 'ドコモ：事前の診断では、想定していなかった攻撃', W / 2, 140, 42); };
SC[47] = (g, S) => { const v = makeView({ cx: 620, cy: 850, s: 2.2 }), t = S.t, t1 = S.sub(1), c2 = mul3(E1, -105), c3 = mul3(E1, 105); bar3(v, [0, 0, 0], 100, 110); bar3(v, c2, 100, 66); bar3(v, c3, 100, 40);
  if (t > t1) person(v, armsUp([0, 0], 45, { y: 110, ...THIEF })); v.flush(g); const a = v.P([50, 55, 50]), b = v.P([c2[0] + 50, 33, c2[2] + 50]), c = v.P([c3[0] + 50, 20, c3[2] + 50]); tx(g, '1', a[0], a[1] + 30, 80, { align: 'center', w: 900 }); tx(g, '2', b[0], b[1] + 24, 64, { align: 'center', w: 900 }); tx(g, '3', c[0], c[1] + 20, 50, { align: 'center', w: 900 });
  head(g, '侵入の入口ランキング', 170, 56, { x: 1480 }); popAt(g, S, t1 + .3, 1480, 350, () => { roundRect(g, -300, -100, 600, 200, 14, '#FFFFFF', 7, { stroke: RED }); tx(g, '1位　ソフトの弱点を突く', 0, -20, 42, { align: 'center', w: 900 }); tx(g, '31%', 0, 70, 84, { align: 'center', color: RED, w: 900 }); }, 'stamp');
  at(g, S.k(t1 + 1.6), () => { roundRect(g, 1220, 500, 520, 150, 14, '#FFFFFF'); tx(g, '盗まれたパスワード', 1480, 560, 36, { align: 'center' }); tx(g, '13%', 1480, 626, 56, { align: 'center', w: 900, color: PAL.g2 }); }); at(g, S.k(.5), () => label(g, '19年で初めて、1位が交代', 1480, 780, 40)); };
SC[48] = (g, S) => { const t = S.t, t1 = S.sub(1), t2 = S.sub(2); head(g, '攻撃に使われていると分かっている弱点', 150, 48, { x: 560 });
  for (let i = 0; i < 8; i++) { const y = 230 + i * 80, k = S.k(.3 + i * .12, .3); g.save(); g.globalAlpha = k; roundRect(g, 200, y, 720, 64, 8, '#FFFFFF', 2.5); g.fillStyle = PAL.s2; g.fillRect(290, y + 26, 300 + rnd(i) * 220, 12); roundRect(g, 220, y + 12, 40, 40, 6, PAL.paper, 2.5); g.restore(); if (i === 2 || i === 6) { const t0 = t1 + .6 + (i === 6 ? .5 : 0); S.sfx(t0, 'tick'); if (t > t0) tick(g, 240, y + 30, 20, 8, { color: RED }); else if (t > t0 - .01) 0; } }
  if (t > t1) { const k = ease(cl((t - t1 - .4) / 1.2)); ring(g, 1240, 380, 120, 34, k * .26); tx(g, Math.round(26 * k) + '%', 1240, 400, 64, { align: 'center', color: RED, w: 900 }); tx(g, '完全に直せた', 1240, 560, 38, { align: 'center', w: 900 }); }
  popAt(g, S, t2 + 1.0, 1600, 520, () => { tx(g, '43日', 0, 0, 130, { align: 'center', w: 900 }); tx(g, '直すまでの日数', 0, 70, 34, { align: 'center' }); tx(g, '（真ん中の値）', 0, 114, 28, { align: 'center', color: PAL.g2 }); }, 'stamp'); };
SC[49] = (g, S) => { const v = makeView({ cx: 960, cy: 610, s: 4.6 }), t = S.t, t3 = S.sub(3); poly3(v, [E3(-260, -85), E3(260, -85), E3(260, -25), E3(-260, -25)], PAL.s1, { depth: -9999 }); poly3(v, [E3(-260, 25), E3(260, 25), E3(260, 85), E3(-260, 85)], PAL.s1, { depth: -9998 });
  const tu = E3(-150 + t * 4, 55), ra = ((t * 130) % 560) - 280, rb = E3(ra, -55), hop = Math.abs(Math.sin(t * 9)) * 16;
  blob(v, [[add3(tu, [0, 14, 0]), 21], [add3(tu, mul3(E1, 12)), 15], [add3(tu, mul3(E1, -12)), 15]], PAL.g1); blob(v, [[add3(add3(tu, mul3(E1, 34)), [0, 16, 0]), 9], [add3(add3(tu, mul3(E1, 22)), [0, 12, 0]), 7]], '#FFFFFF', { bias: 2 }); for (const d of [-14, 14]) blob(v, [[add3(add3(tu, mul3(E1, d)), [0, 3, 14]), 6]], '#FFFFFF', { bias: 3 });
  const rc = add3(rb, [0, 16 + hop, 0]); blob(v, [[rc, 15], [add3(rc, mul3(E1, 16)), 12]], '#FFFFFF'); const rh = add3(add3(rc, mul3(E1, 30)), [0, 14, 0]); blob(v, [[rh, 10]], '#FFFFFF', { bias: 2 }); for (const d of [-4, 4]) blob(v, [[add3(rh, [0, 8, d]), 3.5], [add3(add3(rh, mul3(E1, -8)), [0, 30, d]), 3.5]], '#FFFFFF', { bias: 3 }); blob(v, [[add3(rc, mul3(E1, -17)), 5]], '#FFFFFF', { bias: -1 });
  v.flush(g); const a = v.P(tu); label(g, '守る側：直すまで43日', a[0] + 330, a[1] - 20, 42); label(g, '攻める側：弱点を見つけて、数時間で攻撃', 960, 125, 42, { color: RED, stroke: RED, lw: 5 }); at(g, S.k(.5), () => tx(g, 'AIで、何か月 → 何時間に', 960, 195, 34, { align: 'center', color: PAL.g2 }));
  popAt(g, S, t3 + 1.6, 1420, 320, () => label(g, 'このウサギは、昼寝をしない', 0, 0, 44, { lw: 5 }), 'pop'); };
SC[50] = (g, S) => { const v = makeView({ cx: 600, cy: 800, s: 2.4 }), t = S.t, t1 = S.sub(1); const DK = ['#4A4743', '#3A3835', '#45423E']; box(v, [-120, 62, -6], [120, 176, 0], { c: DK }); box(v, [-112, 0, -5], [-106, 62, -1]); box(v, [106, 0, -5], [112, 62, -1]);
  const k = cl((t - .6) / 2.2), L = ['日本企業は、', 'ぜい弱性を', '放置している']; L.forEach((s, i) => { const n = Math.floor(cl(k * 3 - i) * s.length); if (n > 0) faceText(v, [-106, 166 - i * 34, .2], [1, 0, 0], [0, -1, 0], s.slice(0, n), 24, { color: '#FFFFFF', depth: 20 }); });
  person(v, reach([150, 46], 185, [112, 130, 4], 'r', THIEF)); v.flush(g); label(g, '国際的なハッカー集団', 1400, 250, 46); tx(g, 'NHKの取材に、こう答えた', 1400, 330, 36, { align: 'center', color: PAL.g2 });
  popAt(g, S, t1 + .5, 1400, 560, () => redTag(g, '泥棒に、戸締まりを注意される', 0, 0, 44), 'pop'); at(g, S.k(S.sub(2) + .3), () => tx(g, 'なかなか、屈辱的な話', 1400, 700, 40, { align: 'center' })); };
SC[51] = (g, S) => { const v = makeView({ cx: 560, cy: 740, s: 2.9 }), t = S.t, t3 = S.sub(3), wob = t > t3 ? Math.sin(t * 9) * .035 : 0, xf = rotAbout([0, 0, 0], [0, 0, 1], wob); box(v, [-50, 0, -40], [50, 130, 40], { xf }); for (let i = 0; i < 4; i++) line3(v, [50.2, 25 + i * 26, -32], [50.2, 25 + i * 26, 32], { depth: 20, lw: 2 });
  faceText(v, [-40, 118, 40.1], [1, 0, 0], [0, -1, 0], '古いシステム', 12, { depth: 21 });
  person(v, reach([125, 40], 180, [52, 100, 30], 'r', { lean: 8 })); v.flush(g); head(g, 'なぜ、すぐ直せないのか？', 150, 54, { x: 1380 });
  ['直すには、システムを止める', '止めれば、売り上げが止まる', '古いほど、何が壊れるか分からない'].forEach((s, i) => popAt(g, S, S.sub(i + 1) + .3, 1380, 320 + i * 150, () => label(g, s, 0, 0, 42, i === 1 ? { color: RED, stroke: RED, lw: 5 } : {}), 'pop')); };
SC[52] = (g, S) => { const v = makeView({ cx: 700, cy: 640, s: 2.2 }), t = S.t; const b = building(v, [0, 0], 210, 170, 140); const hole = []; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28, r = 20 + 7 * rnd(i); hole.push([-40 + Math.cos(a) * r * 1.2, 50 + Math.sin(a) * r, 85.2]); } poly3(v, hole, PAL.dark, { depth: 20 });
  const k = S.e(S.sub(1) - .3, .6); if (k > 0) { const y0 = 150 - 80 * k; poly3(v, [[-78, y0 + 42, 85.4], [-8, y0 + 42, 85.4], [-8, y0 - 26, 85.4], [-78, y0 - 26, 85.4]], '#FFFFFF', { depth: 21 }); faceText(v, [-72, y0 + 30, 85.5], [1, 0, 0], [0, -1, 0], 'SALE', 22, { depth: 22, color: RED, w: 900 }); }
  for (let i = 0; i < 2; i++) { const u = ((t * .12 + i * .5) % 1), p = [330 - 200 * u, 130 - 110 * u + i * 30]; person(v, walk(p, 205, t * 6 + i * 3)); } v.flush(g); const q = v.P(b.top); popAt(g, S, .4, q[0], q[1] - 130, () => label(g, '営業中', 0, 0, 56, { lw: 6 }), 'pop');
  at(g, S.k(.6), () => tx(g, '穴が開いていると分かっていても…', 1420, 330, 42, { align: 'center' })); popAt(g, S, S.sub(1) + .6, 1420, 520, () => redTag(g, '穴の開いたまま、今日も営業', 0, 0, 46), 'stamp'); };

// ---- 第5章：漏れた情報が、次の鍵になる ----
const RK = '良品計画の公表資料（2026）', TM = 'トレンドマイクロの調査（2026）', AR = 'アララの公表資料（2026）';
SRC[55] = RK; SRC[56] = RK; SRC[58] = TM; SRC[59] = TM; SRC[60] = AR; SRC[61] = AR; SRC[62] = GMO; SRC[63] = GMO; SRC[64] = GMO;
const tags4 = (g, S, L, y, w, h, size, t0f, o = {}) => L.forEach((s, i) => { const n = L.length, gap = 26, x = (W - n * w - (n - 1) * gap) / 2 + i * (w + gap), t0 = t0f(i), k = eo(cl((S.t - t0) / .45)); S.sfx(t0, 'tick'); if (k <= 0) return; g.save(); g.translate(0, (1 - k) * 60); tag(g, x, y, w, h, s, { a: k, size, color: o.red && o.red(i) ? RED : undefined }); if (o.mark) o.mark(i, x + w / 2, y, k); g.restore(); });
SC[53] = (g, S) => { const t = S.t, t2 = S.sub(2); head(g, 'ここまでで分かったこと', 180, 60); tags4(g, S, [['流出は', '隠せなくなった'], ['泥棒は', '合鍵屋を狙う'], ['守る側は', '穴を直しきれない'], ['？']], 360, 400, 360, 44, i => i < 3 ? .5 + i * 1.3 : t2 + .3, { red: i => i === 3, mark: (i, x, y, k) => { if (i < 3) tick(g, x + 130, y + 300, 30, 10, { a: k }); } });
  at(g, S.k(t2 + .8), () => redTag(g, 'いちばんの理由は、別のところに', W / 2, 850, 46)); };
SC[54] = (g, S) => { const v = makeView({ cx: 600, cy: 560, s: 2.6 }), t = S.t; poly3(v, [[-300, 0, -42], [300, 0, -42], [300, 0, 42], [-300, 0, 42]], PAL.s1, { depth: -9999 }); dominoes(v, -260, 8, t, .5); for (let i = 0; i < 8; i++) S.sfx(.8 + i * .28, 'tick'); v.flush(g);
  at(g, S.k(.4), () => { tx(g, '漏れた情報が、', 1400, 330, 64, { align: 'center', w: 900 }); tx(g, '次の流出の「鍵」になる', 1400, 430, 64, { align: 'center', w: 900, color: RED }); }); popAt(g, S, 1.6, 1400, 620, () => key2(g, -60, 0, 3.2, -.3), 'pop'); };
SC[55] = (g, S) => { const t = S.t, t1 = S.sub(1); popAt(g, S, .3, 480, 420, () => { roundRect(g, -330, -170, 660, 340, 16, '#FFFFFF'); tx(g, '無印良品', 0, -80, 54, { align: 'center', w: 900 }); tx(g, '約2726万件', 0, 40, 100, { align: 'center', w: 900, color: RED }); tx(g, 'アプリなどの利用者の情報が流出した可能性', 0, 120, 30, { align: 'center', color: PAL.g2 }); }, 'pop');
  at(g, S.k(t1 - .3), () => { roundRect(g, 1080, 300, 620, 520, 18, '#FFFFFF', 5); tx(g, 'ネットストア ログイン', 1390, 380, 40, { align: 'center', w: 900 }); for (let i = 0; i < 2; i++) { roundRect(g, 1140, 440 + i * 120, 500, 80, 8, PAL.paper, 2.5); tx(g, i ? 'パスワード' : 'ID', 1160, 492 + i * 120, 30, { color: PAL.g3 }); } roundRect(g, 1290, 700, 200, 70, 35, PAL.ink, 0); tx(g, 'ログイン', 1390, 746, 32, { align: 'center', color: '#FFFFFF' }); });
  if (t > t1) { S.sfx(t1 + .2, 'swish'); g.save(); g.beginPath(); g.rect(1000, 90, 800, 235); g.clip(); for (let j = 0; j < 26; j++) { const u = ((t - t1) * .7 + rnd(j) * 3) % 1, x = 1100 + rnd(j * 3) * 560, y = 60 + u * 290; g.save(); g.translate(x, y); g.rotate((rnd(j * 7) - .5) * .5); roundRect(g, -52, -17, 104, 34, 4, '#FFFFFF', 2.5); tx(g, 'ID／PW', 0, 9, 22, { align: 'center', color: RED, w: 900 }); g.restore(); } g.restore(); redTag(g, '大量のログインの試み', 1390, 880, 44); }
  if (t > t1) { const v = makeView({ cx: 860, cy: 900, s: 1.8 }); person(v, armsUp([0, 0], -30, THIEF)); v.flush(g); } };
SC[56] = (g, S) => { const t = S.t, t1 = S.sub(1), t2 = S.sub(2); popAt(g, S, t1 + .2, W / 2, 140, () => redTag(g, 'リスト型攻撃', 0, 0, 56), 'stamp');
  paper2(g, 180, 250, 520, 580, 'よその会社から漏れた', { size: 34 }); tx(g, 'ID・パスワードの一覧', 440, 384, 36, { align: 'center', w: 900 }); for (let i = 0; i < 6; i++) { g.fillStyle = PAL.s2; g.fillRect(230, 440 + i * 60, 190, 14); g.fillRect(450, 440 + i * 60, 200, 14); }
  for (let i = 0; i < 4; i++) { const y = 260 + i * 150, t0 = t2 + .4 + i * .7, k = S.e(t0, .5), ok = i === 1 || i === 3; if (k > 0) { arrow2(g, 720, 540, 720 + (1140 - 720) * k, 540 + (y + 55 - 540) * k, { lw: 6, color: PAL.g2 }); } roundRect(g, 1160, y, 560, 112, 12, '#FFFFFF'); tx(g, 'サイト ' + 'ABCD'[i], 1200, y + 70, 40, { w: 900 });
    S.sfx(t0 + .5, ok ? 'stamp' : 'tick'); if (t > t0 + .5) { if (ok) tx(g, 'ログイン成功', 1690, y + 70, 38, { align: 'right', color: RED, w: 900 }); else cross(g, 1650, y + 56, 24, 9, { color: PAL.g2 }); } }
  at(g, S.k(t2), () => tx(g, '片っ端から試す', 930, 880, 40, { align: 'center', w: 900 })); };
SC[57] = (g, S) => { const v = makeView({ cx: 960, cy: 540, s: 1.8 }), t = S.t, t1 = S.sub(1), A = [-310, 0, 310]; const hb = building(v, EPo(A[0], -40), 110, 110, 95); const cc = EPo(A[1] , -40); car(v, cc[0] - 35, { z: cc[1] }); const sc = E3(A[2], -40); box(v, [sc[0] - 42, 0, sc[2] - 38], [sc[0] + 42, 100, sc[2] + 38], { c: [PAL.white, PAL.g1, PAL.g3] }); blob(v, [[[sc[0] + 42.5, 55, sc[2]], 13]], '#FFFFFF', { depth: v.depth(sc) + 5 });
  person(v, { pos: EPo(-150, 200), f: 225, hands: { r: [14, 130, 26] } }); v.flush(g); const N = ['家', '車', '金庫'];
  A.forEach((a, i) => { const q = v.P(E3(a, -40, i === 0 ? 150 : i === 1 ? 110 : 160)), t0 = t1 + 1.2 + i * 1.1, op = t > t0; S.sfx(t0, 'pop'); label(g, N[i], q[0], q[1] - 30, 40); const l = v.P(E3(a, 30, 30)); if (op) { popAt(g, S, t0, l[0], l[1] + 40, () => { g.beginPath(); g.arc(0, 0, 44, 0, 7); g.fillStyle = '#FFFFFF'; g.fill(); g.lineWidth = 7; g.strokeStyle = RED; g.stroke(); tx(g, '開', 0, 18, 50, { align: 'center', color: RED, w: 900 }); }); } else lock2(g, l[0], l[1] + 30, 1.3, {}); });
  const kq = v.P(E3(-150, 200, 150)); key2(g, kq[0] + 30, kq[1] - 20, 1.5, -.6); head(g, '同じパスワードを、いくつものサイトで使うと…', 130, 48); at(g, S.k(t1 + 4.2), () => redTag(g, '1つ漏れただけで、全部のドアが開く', W / 2, 880, 46)); };
SC[58] = (g, S) => { const t = S.t, k = ease(cl((t - 1.4) / 1.6)); win(g, 'ネットのサービスを使う人のうち'); S.sfx(1.4, 'count'); popAt(g, S, 1.2, W / 2, 790, () => { roundRect(g, -400, -110, 800, 220, 18, '#FFFFFF', 6); tx(g, (84.3 * k).toFixed(1) + '%', 0, 20, 120, { align: 'center', w: 900, color: RED }); tx(g, 'パスワードを使い回している', 0, 84, 38, { align: 'center', w: 900 }); });
  at(g, S.k(S.sub(1) + .4), () => label(g, '3年前の調査から、ほとんど変わらず', 1300, 220, 36)); };
SC[59] = (g, S) => { const t = S.t, x0 = 320, x1 = 1500, y0 = 760, yy = (p) => y0 - p * 5.2, k = ease(cl((t - .5) / 2)); head(g, 'パスワードを使い回している人', 160, 52); path(g, [[x0, 240], [x0, y0], [x1 + 60, y0]], null, { open: true, lw: 5 });
  [0, 50, 100].forEach(p => tx(g, p + '%', x0 - 20, yy(p) + 12, 30, { align: 'right', color: PAL.g2 })); const a = [x0 + 150, yy(83.8)], b = [x1 - 100, yy(84.3)], c = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; path(g, [a, c], null, { open: true, lw: 10, stroke: RED });
  for (const [p, s, yr, kk] of [[a, '83.8%', '2023年', 1], [b, '84.3%', '2026年', k >= 1 ? 1 : 0]]) { if (!kk) continue; g.beginPath(); g.arc(p[0], p[1], 16, 0, 7); g.fillStyle = RED; g.fill(); tx(g, s, p[0], p[1] - 40, 56, { align: 'center', w: 900, color: RED }); tx(g, yr, p[0], y0 + 56, 36, { align: 'center' }); }
  const t1 = S.sub(1); popAt(g, S, t1 + 1.0, 960, 560, () => { g.rotate(-.04); label(g, '日本でいちばん安定しているデータ…？', 0, 0, 46, { lw: 6 }); }, 'stamp'); at(g, S.k(.8), () => tx(g, '流出の数字は、毎年更新されるのに', 960, 880, 38, { align: 'center', color: PAL.g2 })); };
SC[60] = (g, S) => { const v = makeView({ cx: 560, cy: 780, s: 2.7 }), t = S.t, t1 = S.sub(1); for (let j = 0; j < 22; j++) { const u = (t * .32 + rnd(j) * 5) % 1, q = [-170 + rnd(j * 3) * 340, 300 * (1 - u), -150 + rnd(j * 5) * 300]; slab(v, q, 24, 1.4, 16, { xf: rotAbout(add3(q, [12, 0, 8]), [rnd(j), .2, rnd(j + 4)], u * 4 + j) }); }
  person(v, { pos: [0, 0], f: 45, hands: { l: [-22, 172, 14], r: [22, 172, 14] }, elbow: { l: [-1, 0, .3], r: [1, 0, .3] }, crouch: 8, nod: 10 }); v.flush(g); label(g, '漏れたメールアドレスも、次の鍵に', 1380, 180, 42);
  popAt(g, S, t1 + 1.6, 1380, 430, () => { tx(g, 'カード会社を装った偽メール', 0, -110, 42, { align: 'center', w: 900 }); tx(g, '最大 約713万通', 0, 30, 104, { align: 'center', w: 900, color: RED }); }, 'stamp'); at(g, S.k(t1 + .3), () => label(g, 'アララのシステムが乗っ取られて…', 1380, 660, 38)); };
SC[61] = (g, S) => { const t = S.t, cx = 960, cy = 500, R = 270, N = ['情報が漏れる', '偽メールが届く', '番号を入れてしまう', 'また漏れる'], T0 = [.3, .3, S.sub(0) + S.dur * .12, S.sub(1)];
  N.forEach((s, i) => { const a = -Math.PI / 2 + i * Math.PI / 2, t0 = Math.min(T0[i] + i * .9, S.dur - 4 + i * .5); popAt(g, S, t0, cx + Math.cos(a) * R * 1.75, cy + Math.sin(a) * R, () => label(g, s, 0, 0, 44, i % 2 ? {} : { color: RED, stroke: RED, lw: 5 }), 'pop');
    const k = S.e(t0 + .4, .6); if (k > 0) { g.beginPath(); g.ellipse(cx, cy, R * 1.25, R * .78, 0, a + .42, a + .42 + (Math.PI / 2 - .84) * k); g.strokeStyle = PAL.ink; g.lineWidth = 9; g.lineCap = 'round'; g.stroke(); } });
  const v = makeView({ cx, cy: cy + 70, s: 2.0 }); dominoes(v, -70, 3, t % 3, .3, { sp: 50 }); v.flush(g); at(g, S.k(S.sub(2) + .5), () => tx(g, 'こうして、次の1枚を倒していく', cx, 890, 44, { align: 'center', w: 900 })); };
SC[62] = (g, S) => { const t = S.t, t1 = S.sub(1), k = ease(cl((t - 1.2) / 1.8)); roundRect(g, 160, 240, 820, 520, 16, '#FFFFFF'); tx(g, 'お客さんのFX口座', 200, 310, 38, { w: 900 }); const pts = [[220, 480], [330, 440], [430, 470], [520, 420], [600, 450]], dr = [[680, 520], [760, 610], [840, 680], [930, 720]]; path(g, pts, null, { open: true, lw: 7 }); const n = k * dr.length, dd = [[600, 450]]; for (let i = 0; i < dr.length; i++) if (n > i) { const f = Math.min(1, n - i), p = i ? dr[i - 1] : [600, 450]; dd.push([p[0] + (dr[i][0] - p[0]) * f, p[1] + (dr[i][1] - p[1]) * f]); } if (dd.length > 1) path(g, dd, null, { open: true, lw: 9, stroke: RED });
  S.sfx(1.2, 'swish'); at(g, S.k(2.6), () => redTag(g, 'わざと損をする取引', 570, 830, 42)); label(g, 'GMOのケース', 570, 150, 44);
  popAt(g, S, t1 + 1.6, 1420, 470, () => { g.rotate(.04); tag(g, -270, -150, 540, 330, ['身代金の要求', '80億円'], { size: 70, color: RED, w: 900 }); }, 'stamp'); if (t > t1) { const v = makeView({ cx: 1120, cy: 900, s: 1.7 }); person(v, hips([0, 0], 45, THIEF)); v.flush(g); } };
SC[63] = (g, S) => { const v = makeView({ cx: 720, cy: 750, s: 1.8 }), t = S.t, t1 = S.sub(1), k = ease(cl((t - t1 - .3) / 1.6)), A = mul3(E1, -170), B = mul3(E1, 30); bar3(v, A, 90, 2); bar3(v, B, 90, 305 * k, { c: [RED, '#C2352A', '#A92E25'] }); const pp = mul3(E1, 230); person(v, t > t1 + 1.5 ? scratch([pp[0], pp[2]], 135, { look: [B[0], 300, B[2]] }) : stand([pp[0], pp[2]], 135)); v.flush(g);
  const a = v.P(A), b = v.P([B[0], 305 * k, B[2]]), b0 = v.P(B); tx(g, '0円', a[0], a[1] - 50, 60, { align: 'center', w: 900 }); tx(g, '払った身代金', a[0], a[1] + 125, 34, { align: 'center' }); S.sfx(t1 + .3, 'count'); if (k > 0) tx(g, (30.5 * k).toFixed(1) + '億円〜', b[0], b[1] - 60, 60, { align: 'center', w: 900, color: RED }); tx(g, '事件の影響', b0[0], b0[1] + 125, 34, { align: 'center' });
  head(g, '会社は「払わない」方針', 170, 52, { x: 1560 }); popAt(g, S, S.sub(2) + .3, 1560, 400, () => redTag(g, '払わなくても、高くつく', 0, 0, 46), 'stamp'); at(g, S.k(S.sub(3) + .5), () => { tx(g, '泥棒には、払ってもらえなくても', 1590, 620, 34, { align: 'center' }); tx(g, '割に合う商売', 1590, 690, 48, { align: 'center', w: 900 }); }); };
SC[64] = (g, S) => { const t = S.t; roundRect(g, 330, 210, 1260, 600, 16, PAL.dark, 5); g.fillStyle = '#55524E'; g.fillRect(333, 213, 1254, 60); for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(370 + i * 36, 243, 10, 0, 7); g.fillStyle = PAL.g3; g.fill(); } tx(g, '犯人のサイト', 500, 255, 28, { color: '#D8D4CC' });
  for (let i = 0; i < 7; i++) { const k = S.k(.6 + i * .2, .3); g.globalAlpha = k; g.fillStyle = '#77726C'; g.fillRect(400, 320 + i * 62, 260 + rnd(i) * 200, 26); g.fillRect(760, 320 + i * 62, 300 + rnd(i + 3) * 380, 26); g.globalAlpha = 1; }
  label(g, '10月27日　盗んだデータの一部を掲載', W / 2, 130, 42); popAt(g, S, S.sub(1) + .4, 1300, 600, () => { g.rotate(-.1); roundRect(g, -190, -70, 380, 140, 12, '#FFFFFF', 8, { stroke: RED }); tx(g, '見せしめ', 0, 30, 80, { align: 'center', color: RED, w: 900 }); }, 'stamp'); tx(g, '「払わないなら、こうなるぞ」', W / 2, 890, 40, { align: 'center', w: 900, a: S.k(S.sub(1) + 1) }); };
SC[65] = (g, S) => { const t = S.t, t1 = S.sub(1), L = ['名前', '住所', '電話番号', '生年月日'], v = makeView({ cx: 500, cy: 560, s: 2.2 }); for (let i = 0; i < 4; i++) { const c = E3(-110 + (i % 2) * 190, -120 + Math.floor(i / 2) * 190); box(v, [c[0] - 36, 0, c[2] - 36], [c[0] + 36, 60, c[2] + 36]); faceText(v, [c[0] - 28, 48, c[2] + 36.1], [1, 0, 0], [0, -1, 0], 'ABCD'[i] + '社', 20); } v.flush(g);
  roundRect(g, 1080, 270, 640, 440, 20, null, 4, { dash: [14, 12] }); L.forEach((s, i) => { const t0 = .5 + i * 1.0, u = eo(cl((t - t0) / .8)); S.sfx(t0 + .8, 'tick'); if (u <= 0) return; const c = E3(-110 + (i % 2) * 190, -120 + Math.floor(i / 2) * 190, 70), fr = v.P(c), to = [1240 + (i % 2) * 320, 380 + Math.floor(i / 2) * 220], x = fr[0] + (to[0] - fr[0]) * u, y = fr[1] + (to[1] - fr[1]) * u - Math.sin(u * 3.14) * 120; roundRect(g, x - 140, y - 90, 280, 180, 14, '#FFFFFF'); tx(g, s, x, y + 16, 46, { align: 'center', w: 900 }); });
  head(g, '1つ1つは小さくても…', 150, 50, { x: 420 }); popAt(g, S, t1 + 3.4, 1400, 820, () => redTag(g, 'なりすましの材料セットが完成', 0, 0, 46), 'stamp'); tx(g, '泥棒の手元', 1400, 240, 36, { align: 'center', color: PAL.g2 }); };
SC[66] = (g, S) => { const v = makeView({ cx: 520, cy: 400, s: 1.75 }), t = S.t; poly3(v, [[-470, 0, -42], [520, 0, -42], [520, 0, 42], [-470, 0, 42]], PAL.s1, { depth: -9999 }); dominoes(v, -440, 17, t, .3, { sp: 56, dt: .22 }); for (let i = 0; i < 17; i += 2) S.sfx(.6 + i * .22, 'tick'); v.flush(g);
  at(g, S.k(.3), () => tx(g, '1つの流出が、次の流出を生む', 1380, 250, 44, { align: 'center', w: 900 })); popAt(g, S, S.sub(1) + S.dur * .18, 1380, 470, () => { g.rotate(-.04); tx(g, '流出の', 0, -40, 110, { align: 'center', w: 900, color: RED }); tx(g, 'ドミノ', 0, 110, 170, { align: 'center', w: 900, color: RED }); }, 'stamp'); };
// ---- 第6章：ドミノを止める1枚 ----
SRC[68] = 'Impress Watch（2026）'; SRC[69] = '＠IT（2026）'; SRC[70] = 'IBM（2026）'; SRC[71] = RK; SRC[75] = CO; SRC[77] = TM; SRC[79] = TM;
function stopScene(g, S, o = {}) { const s = o.s || 2.6, v = makeView({ cx: o.cx ?? 640, cy: o.cy ?? 560, s }), t = o.done ? 99 : S.t, N = 7, hx = -260 + N * 62; poly3(v, [[-300, 0, -42], [hx + 110 + (o.after || 0) * 62, 0, -42], [hx + 110 + (o.after || 0) * 62, 0, 42], [-300, 0, 42]], PAL.s1, { depth: -9999 });
  dominoes(v, -260, N, t, .3, { last: true }); if (!o.done) for (let i = 0; i < N; i++) S.sfx(.6 + i * .28, 'tick'); box(v, [hx, 0, -28], [hx + 9, 104, 28], { c: ['#FFFFFF', '#FFFFFF', '#FFFFFF'], depth: hx + 200, lw: 5 });
  person(v, { pos: [hx + 62, 0], f: 180, hands: { l: { w: [hx + 12, 98, 14] }, r: { w: [hx + 12, 98, -14] } }, lean: 10, feet: { l: [-10, 0, -8], r: [10, 0, 14] } }); for (let i = 0; i < (o.after || 0); i++) { const x = hx + 130 + i * 62; box(v, [x, 0, -28], [x + 9, 104, 28], { depth: x + 200 }); } v.flush(g); return v; }
SC[67] = (g, S) => { const v = makeView({ cx: 640, cy: 540, s: 2.4 }), t = S.t; poly3(v, [[-320, 0, -42], [420, 0, -42], [420, 0, 42], [-320, 0, 42]], PAL.s1, { depth: -9999 }); dominoes(v, -280, 5, t, .2, { last: false }); for (let i = 0; i < 4; i++) { const x = 110 + i * 62; box(v, [x, 0, -28], [x + 9, 104, 28], { depth: x + 200 }); } v.flush(g);
  const q = v.P([60, 60, 0]); popAt(g, S, 1.6, q[0], q[1] - 120, () => tx(g, '？', 0, 0, 130, { align: 'center', w: 900, color: RED }), 'pop'); tx(g, 'このドミノは、止められるのか', 1380, 380, 56, { align: 'center', w: 900, a: S.k(.3) }); };
SC[68] = (g, S) => { win(g, '国も動き始めた'); popAt(g, S, S.sub(1) + 1.2, W / 2, 760, () => { roundRect(g, -470, -100, 940, 200, 16, '#FFFFFF', 6); tx(g, 'サイバーセキュリティの緊急対策', 0, -24, 42, { align: 'center', w: 900 }); tx(g, '予備費から 100億円', 0, 62, 70, { align: 'center', w: 900, color: RED }); }, 'stamp'); };
SC[69] = (g, S) => { const v = makeView({ cx: 520, cy: 660, s: 3.6 }), t = S.t, u = S.e(1.4, .9); deskAt(v); box(v, [-30, 73, -20], [22, 90, 18], { c: ['#FFFFFF', PAL.g1, PAL.g3], depth: 60 }); faceText(v, [-24, 88, 18.1], [1, 0, 0], [0, -1, 0], '法 律', 12, { color: '#FFFFFF', depth: 61 });
  if (u > 0) { const x = 90 - 78 * u; box(v, [x - 24, 91, -14], [x + 24, 92, 14], { c: ['#FFFFFF', RED, RED], depth: 70 }); faceText(v, [x - 20, 92.2, -8], [1, 0, 0], [0, 0, 1], '課徴金', 11, { color: RED, depth: 71, w: 900 }); } S.sfx(1.4, 'swish');
  person(v, reach([112, 12], 180, [40, 96, 0], 'r')); v.flush(g); popAt(g, S, .3, 1380, 300, () => { roundRect(g, -250, -130, 500, 260, 12, '#FFFFFF'); g.fillStyle = RED; g.fillRect(-250, -130, 500, 90); g.lineWidth = LW; g.strokeStyle = PAL.ink; g.strokeRect(-250, -130, 500, 90); tx(g, '2026年 7月', 0, -64, 60, { align: 'center', color: '#FFFFFF', w: 900 }); tx(g, '個人情報保護法　改正', 0, 60, 44, { align: 'center', w: 900 }); }, 'stamp');
  popAt(g, S, 2.4, 1380, 620, () => redTag(g, '違反した企業に「課徴金」', 0, 0, 46), 'pop'); };
SC[70] = (g, S) => { const v = makeView({ cx: 760, cy: 540, s: 2.0 }), t = S.t, t2 = S.sub(2), L = 280 * ease(cl((t - .6) / 2.4)); box(v, [-150, 0, -100], [-110, 30, -70]); person(v, hold([0, -60], 90, 105, 26, { nod: 10 })); if (L > 0) { box(v, [-12, 0, -30], [12, .6, -30 + L], { depth: 0 }); box(v, [-12, 0, -34], [12, 108, -32], { depth: -40 }); }
  v.flush(g); const w = v.P([-130, 30, -85]); label(g, '守る費用', w[0], w[1] - 50, 34); const r = v.P([0, 0, -30 + L]); if (L > 20) label(g, '流出の請求書', r[0] + 150, r[1] - 10, 36, { color: RED, stroke: RED, lw: 5 }); S.sfx(.6, 'swish');
  tx(g, '流出1件にかかる費用（世界平均）', 1400, 230, 40, { align: 'center', w: 900 }); popAt(g, S, 1.6, 1400, 400, () => tx(g, '499万ドル', 0, 40, 130, { align: 'center', w: 900, color: RED }), 'stamp'); at(g, S.k(S.sub(1)), () => tx(g, '≒ 7億円超　過去最高', 1400, 560, 50, { align: 'center', w: 900 }));
  at(g, S.k(t2 + .5), () => label(g, '守る投資をケチると、もっと高い請求書', 1400, 760, 38)); };
SC[71] = (g, S) => { const v = makeView({ cx: 480, cy: 610, s: 2.5 }), t = S.t, t1 = S.sub(1), t2 = S.sub(2); for (let r = 0; r < 3; r++) { box(v, [-90, 44 + r * 56, -30], [90, 48 + r * 56, 30], { depth: -10 + r }); } box(v, [-94, 0, -30], [-90, 166, 30], { depth: -30 }); box(v, [90, 0, -30], [94, 166, 30], { depth: 30 });
  for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) { const gone = (r * 3 + i) % 2 === 0 ? cl((t - t2 - (r * 3 + i) * .25) / .5) : 0; if (gone >= 1) continue; box(v, [-72 + i * 52, 48 + r * 56, -18], [-36 + i * 52, 78 + r * 56, 18], { depth: 2 + r + i * .1, alpha: 1 - gone, c: (r * 3 + i) % 2 === 0 ? [PAL.white, PAL.g1, PAL.g3] : undefined }); }
  const u = (t * .25) % 1, px = 130 + u * 220; person(v, { ...walk([px, 50], 0, t * 6), hands: { l: [-12, 100, 28], r: [12, 100, 28] } }); box(v, [px + 20, 96, 34], [px + 50, 122, 66], { depth: px + 120, c: [PAL.white, PAL.g1, PAL.g3] }); v.flush(g);
  label(g, '無印良品', 1400, 180, 46); popAt(g, S, t1 - .5, 1400, 330, () => label(g, '全会員に、パスワードの再設定', 0, 0, 42), 'pop'); popAt(g, S, t2 + .5, 1400, 520, () => redTag(g, '必要のない情報は、持たない', 0, 0, 46), 'stamp'); };
SC[72] = (g, S) => { const v = makeView({ cx: 600, cy: 720, s: 2.8 }), t = S.t, t1 = S.sub(1), t2 = S.sub(2); box(v, [-45, 0, -40], [45, 110, 40], { c: [PAL.white, PAL.dark, PAL.g1] }); box(v, [45, 0, 36], [49, 110, 116], { xf: rotAbout([45, 0, 40], [0, 1, 0], -.5), c: [PAL.white, PAL.s1, PAL.g1], depth: 120 });
  person(v, t > t1 ? { pos: [150, -10], f: 190, hands: { l: [-36, 118, 8], r: [36, 118, 8] }, elbow: { l: [-.3, -1, 0], r: [.3, -1, 0] }, ...THIEF } : stand([150, -10], 190, THIEF)); v.flush(g); const q = v.P([45, 55, 0]); tx(g, '空っぽ', q[0] - 10, q[1] + 10, 34, { align: 'center', color: '#FFFFFF', w: 900 });
  popAt(g, S, .4, 1400, 260, () => { tx(g, '持っていない情報は、', 0, -30, 54, { align: 'center', w: 900 }); tx(g, '漏れない', 0, 70, 90, { align: 'center', w: 900, color: RED }); }, 'pop'); at(g, S.k(t2 + .4), () => label(g, 'いちばん安上がりなのは「ためこまない」', 1400, 640, 38)); };
SC[73] = (g, S) => { stopScene(g, S); at(g, S.k(S.sub(1) + .3), () => { tx(g, '最後の1枚は、', 1480, 280, 76, { align: 'center', w: 900 }); tx(g, 'あなたの手に', 1480, 385, 76, { align: 'center', w: 900, color: RED }); }); label(g, '最初に予告した話', 1480, 150, 38); };
SC[74] = (g, S) => { stopScene(g, S, { after: 4, cx: 560, cy: 500, s: 2.2 }); const t1 = S.sub(1), t2 = S.sub(2); tx(g, '会社から漏れるのは、止められない', 1400, 200, 40, { align: 'center', color: PAL.g2 }); at(g, S.k(t1), () => { tx(g, '漏れたパスワードが', 1420, 330, 46, { align: 'center', w: 900 }); tx(g, 'ほかのドアを開けるかは、', 1420, 400, 46, { align: 'center', w: 900 }); tx(g, 'あなたが決められる', 1420, 480, 56, { align: 'center', w: 900, color: RED }); });
  popAt(g, S, t2 + .6, 1420, 650, () => redTag(g, '使い回しをやめる', 0, 0, 56), 'stamp'); };
SC[75] = (g, S) => { const t = S.t, t1 = S.sub(1), t2 = S.sub(2); head(g, '流出のあとに届く「お詫びメール」', 150, 52); const mail = (x, lab, fake, a) => { g.save(); g.globalAlpha = a; roundRect(g, x, 240, 680, 480, 14, '#FFFFFF'); g.fillStyle = PAL.s1; g.fillRect(x + 2, 242, 676, 80); tx(g, '【お詫び】個人情報流出について', x + 30, 296, 34, { w: 900 }); for (let i = 0; i < 3; i++) { g.fillStyle = PAL.s2; g.fillRect(x + 40, 370 + i * 50, 520 - i * 90, 16); }
    roundRect(g, x + 40, 560, 600, 70, 8, PAL.paper, 2.5); tx(g, fake ? 'https://xxxx-owabi.example/…' : '公式サイトで確認してください', x + 60, 606, 30, { color: fake ? RED : PAL.ink }); label(g, lab, x + 340, 240, 40, fake ? { color: RED, stroke: RED, lw: 5 } : {}); g.restore(); };
  mail(220, '本物', false, S.k(.3)); mail(1020, '偽物', true, S.k(t1)); if (t > t1 + 1.2) { S.sfx(t1 + 1.2, 'stamp'); cross(g, 1640, 595, 44 * (2 - cl((t - t1 - 1.2) / .2)), 14); } at(g, S.k(t2 + .5), () => label(g, 'メールのURLは開かず、公式サイトから確かめる', W / 2, 840, 44, { lw: 5 })); };
SC[76] = (g, S) => { const v = makeView({ cx: 620, cy: 800, s: 3.2 }), t = S.t, t1 = S.sub(1), b = 34 * ease(cl((t - .3) / .8)); const r = person(v, { pos: [0, 0], f: 20, lean: b, hipBack: b * .3, nod: b * .6, hands: { l: [-16, 70, 12 + b * .5], r: [16, 70, 12 + b * .5] } }); v.flush(g);
  const q = v.P(add3(r.sh.l, [-6, -14, 0])); popAt(g, S, t1 + .2, q[0] - 10, q[1] + 20, () => { g.rotate(-.2); roundRect(g, -34, -34, 68, 68, 8, '#FFFFFF', 6, { stroke: RED }); tx(g, '偽', 0, 18, 48, { align: 'center', color: RED, w: 900 }); }, 'stamp');
  tx(g, 'お詫びの手紙にまで、偽物が混ざる時代', 1380, 260, 40, { align: 'center' }); at(g, S.k(t1 + .5), () => { tx(g, '謝られたときこそ、', 1380, 440, 60, { align: 'center', w: 900 }); tx(g, 'いちばん疑う', 1380, 540, 76, { align: 'center', w: 900, color: RED }); }); };
SC[77] = (g, S) => { const t = S.t, t1 = S.sub(1), k = ease(cl((t - t1 - .3) / 1.5)); roundRect(g, 360, 170, 380, 700, 44, '#FFFFFF', 7); roundRect(g, 500, 190, 100, 20, 10, PAL.ink, 0); g.strokeStyle = RED; g.lineWidth = 7; g.lineCap = 'round'; for (let i = 0; i < 5; i++) { const kk = S.e(.5 + i * .15, .4); if (kk <= 0) continue; g.beginPath(); g.ellipse(550, 520, 28 + i * 22, 38 + i * 28, 0, Math.PI * (1.1 - .05 * i), Math.PI * (1.1 - .05 * i) + Math.PI * (1.8 + .05 * i) * kk); g.stroke(); }
  tx(g, '指紋・顔で入る', 550, 760, 36, { align: 'center', w: 900 }); S.sfx(.5, 'pop'); popAt(g, S, .4, 1300, 280, () => redTag(g, 'パスキー', 0, 0, 70), null); tx(g, 'パスワードの代わりになる仕組み', 1300, 390, 36, { align: 'center', color: PAL.g2 });
  if (t > t1) { S.sfx(t1 + .3, 'count'); ring(g, 1300, 620, 130, 36, k * .911); tx(g, (91.1 * k).toFixed(1) + '%', 1300, 640, 60, { align: 'center', color: RED, w: 900 }); tx(g, '名前を知っている', 1300, 820, 40, { align: 'center', w: 900 }); } };
SC[78] = (g, S) => { const v = makeView({ cx: 560, cy: 740, s: 3.0 }), t = S.t, t1 = S.sub(1), t2 = S.sub(2); box(v, [-8, 0, -50], [0, 170, -44], { depth: -60 }); box(v, [-8, 0, 44], [0, 170, 50], { depth: 40 }); box(v, [-8, 170, -50], [0, 176, 50], { depth: 0 }); box(v, [-5, 0, -44], [-1, 170, 44], { depth: -5 });
  person(v, reach([62, 78], 180, [2, 96, 44], 'r', THIEF)); v.flush(g); const l1 = v.P([0, 110, -14]), l2 = v.P([0, 70, -14]); const o1 = t > t1 + 1.2; S.sfx(t1 + 1.2, 'pop'); if (o1) { g.beginPath(); g.arc(l1[0], l1[1], 30, 0, 7); g.fillStyle = '#FFFFFF'; g.fill(); g.lineWidth = 5; g.strokeStyle = PAL.ink; g.stroke(); tick(g, l1[0], l1[1], 16, 6); } else lock2(g, l1[0], l1[1], .9, {}); lock2(g, l2[0], l2[1] + 10, .9, { fill: t > t1 + 2 ? '#F2C9C4' : PAL.g1 });
  if (t > t1 + 2.4) { S.sfx(t1 + 2.4, 'stamp'); cross(g, l2[0] + 70, l2[1], 26, 10); } popAt(g, S, .4, 1380, 240, () => redTag(g, '2段階認証', 0, 0, 64), 'pop'); at(g, S.k(t1 + .3), () => { tx(g, 'パスワードが漏れても、', 1380, 420, 44, { align: 'center', w: 900 }); tx(g, 'スマホの確認がなければ開かない', 1380, 490, 44, { align: 'center', w: 900 }); });
  at(g, S.k(t2 + .5), () => label(g, '合鍵屋が襲われても、あなたの家は開かない', 1380, 700, 36)); };
SC[79] = (g, S) => { const t = S.t, t1 = S.sub(1), t3 = S.sub(3); popAt(g, S, .3, 520, 380, () => { roundRect(g, -330, -170, 660, 340, 16, '#FFFFFF'); tx(g, 'パスキーを知っている', 0, -90, 40, { align: 'center', w: 900 }); tx(g, '91.1%', 0, 80, 150, { align: 'center', w: 900 }); }, 'pop');
  popAt(g, S, t1, 1400, 380, () => { roundRect(g, -330, -170, 660, 340, 16, '#FFFFFF', 7, { stroke: RED }); tx(g, 'パスワードを使い回す', 0, -90, 40, { align: 'center', w: 900 }); tx(g, '84.3%', 0, 80, 150, { align: 'center', w: 900, color: RED }); }, 'stamp');
  at(g, S.k(S.sub(2)), () => tx(g, '分かっちゃいるけど、やめられない', W / 2, 660, 50, { align: 'center', w: 900 })); popAt(g, S, t3 + 1.6, W / 2, 810, () => { g.rotate(-.03); label(g, '年末の大掃除：「来年やる」', 0, 0, 44, { lw: 5 }); }, 'pop'); };
SC[80] = (g, S) => { const t = S.t, t2 = S.sub(2), d = (S.dur - t2 - 1.5) / 5; head(g, 'なぜ今、流出ラッシュなのか', 170, 64); tags4(g, S, [['隠せなく', 'なった'], ['1回の流出が', '巨大に'], ['泥棒は', '合鍵屋を狙う'], ['守る側は', '穴を直せない'], ['漏れた情報が', '次の鍵に']], 340, 330, 380, 38, i => t2 + .2 + i * d, { red: i => i === 4, mark: (i, x, y, k) => tx(g, '①②③④⑤'[i], x, y + 120, 70, { align: 'center', w: 900, a: k }) }); };
SC[81] = (g, S) => { const v = makeView({ cx: 600, cy: 540, s: 2.5 }), t = S.t, t1 = S.sub(1); poly3(v, [[-300, 0, -42], [330, 0, -42], [330, 0, 42], [-300, 0, 42]], PAL.s1, { depth: -9999 }); dominoes(v, -260, 6, t, .4, { last: true }); for (let i = 0; i < 6; i++) S.sfx(.7 + i * .28, 'tick'); const px = -260 + 6 * 62 + 24; person(v, hold([px, 0], 45, 118, 22, { nod: 12 })); box(v, [px + 12, 120, 12], [px + 20, 121, 26], { depth: px + 60, c: [PAL.dark, PAL.dark, PAL.dark] }); v.flush(g);
  tx(g, '流出は、遠くの会社の事故ではない', 1400, 260, 40, { align: 'center', color: PAL.g2 }); at(g, S.k(t1), () => { tx(g, 'あなたのパスワードが、', 1400, 430, 52, { align: 'center', w: 900 }); tx(g, '次の1枚かもしれない', 1400, 520, 60, { align: 'center', w: 900, color: RED }); }); };
SC[82] = (g, S) => { const k = ease(cl(S.t / S.dur)), t1 = S.sub(1); stopScene(g, S, { done: true, after: 6, s: 2.9 - 1.3 * k, cx: 640 - 150 * k, cy: 600 - 160 * k }); tx(g, 'まずは今日、', 1420, 240, 46, { align: 'center', w: 900 }); tx(g, 'いちばん大事なパスワードを', 1420, 330, 50, { align: 'center', w: 900 }); tx(g, 'ほかと違うものにする', 1420, 420, 58, { align: 'center', w: 900, color: RED });
  popAt(g, S, t1 + 1.0, 1420, 620, () => label(g, 'ドミノは、あなたのところで1枚止まる', 0, 0, 38, { lw: 5 }), 'pop'); };
SC[83] = (g, S) => { const v = makeView({ cx: 960, cy: 900, s: 2.2 }), t = S.t; person(v, { pos: [0, 0], f: 45, hands: { r: [34, 178 + Math.sin(t * 6) * 6, 6 + Math.sin(t * 6) * 0] }, elbow: { r: [1, 0, 0] } }); v.flush(g); head(g, '今日のネタバレは、ここまで', 220, 76);
  popAt(g, S, S.sub(1), 520, 560, () => label(g, 'チャンネル登録', 0, 0, 56, { color: RED, stroke: RED, lw: 7 }), 'pop'); popAt(g, S, S.sub(1) + .5, 1400, 560, () => label(g, '高評価', 0, 0, 56, { lw: 7 }), 'pop'); at(g, S.k(S.sub(2)), () => tx(g, 'また次のネタバレで', 960, 400, 44, { align: 'center', color: PAL.g2 })); };
