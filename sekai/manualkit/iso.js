// manualkit/iso.js — 説明書イラスト風（白地・線画・斜め上から）の立体を canvas 2D に描く土台。単位はcm。
// 軸：x=右手前、z=左手前、y=上。カメラは (+x,+y,+z) 側。奥行きは x+z が大きいほど手前。
export const PAL = { paper: '#F4F1EA', ink: '#1E1E1C', white: '#FFFFFF', s1: '#ECE8DF', s2: '#DAD4C8', g1: '#A29C92', g2: '#6B665F', g3: '#8E8980', dark: '#3A3835', red: '#D23A2E' };
export const LW = 3, JP = '"Noto Sans CJK JP","Noto Sans JP",sans-serif';
export const cl = (x) => Math.max(0, Math.min(1, x)), ease = (x) => x * x * (3 - 2 * x), eo = (x) => 1 - Math.pow(1 - x, 3);
export const pop = (x) => { x = cl(x); return x <= 0 ? 0 : 1 + .25 * Math.sin(x * Math.PI) * (1 - x); };
export const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
export const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len3 = (a) => Math.hypot(a[0], a[1], a[2]), norm3 = (a) => { const l = len3(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const KX = .866, KY = .5;
export function makeView({ cx, cy, s }) { const items = [];
  const v = { cx, cy, s, P: (p) => [cx + s * (p[0] - p[2]) * KX, cy + s * ((p[0] + p[2]) * KY - p[1])], depth: (p) => p[0] + p[2] + p[1] * .02,
    add: (d, fn) => items.push({ d, fn, n: items.length }), flush: (g) => { items.sort((a, b) => a.d - b.d || a.n - b.n); for (const it of items) it.fn(g); items.length = 0; } };
  return v; }
export function path(g, pts, fill, o = {}) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); if (!o.open) g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); } if (o.lw !== 0) { g.lineWidth = o.lw || LW; g.strokeStyle = o.stroke || PAL.ink; g.lineJoin = 'round'; g.lineCap = 'round'; if (o.dash) g.setLineDash(o.dash); g.stroke(); g.setLineDash([]); } }
const area = (q) => { let a = 0; for (let i = 0; i < q.length; i++) { const p = q[i], n = q[(i + 1) % q.length]; a += p[0] * n[1] - n[0] * p[1]; } return a; };
// 回転：点 o を通る軸 ax のまわりに ang(rad)
export function rotAbout(o, ax, ang) { const u = norm3(ax), c = Math.cos(ang), s = Math.sin(ang); return (p) => { const q = sub3(p, o), d = dot3(u, q), cr = cross3(u, q); return add3(o, [q[0] * c + cr[0] * s + u[0] * d * (1 - c), q[1] * c + cr[1] * s + u[1] * d * (1 - c), q[2] * c + cr[2] * s + u[2] * d * (1 - c)]); }; }
// 箱：a=最小の角、b=最大の角。o.c=[上,+x面,+z面] の色、o.xf=点の変換、o.depth / o.bias、o.dash、o.alpha
export function box(v, a, b, o = {}) { const xf = o.xf || ((p) => p), c = o.c || [PAL.white, PAL.s1, PAL.s2];
  const F = [[[a[0], b[1], a[2]], [a[0], b[1], b[2]], [b[0], b[1], b[2]], [b[0], b[1], a[2]]], [[b[0], a[1], a[2]], [b[0], b[1], a[2]], [b[0], b[1], b[2]], [b[0], a[1], b[2]]], [[a[0], a[1], b[2]], [b[0], a[1], b[2]], [b[0], b[1], b[2]], [a[0], b[1], b[2]]],
    [[a[0], a[1], a[2]], [b[0], a[1], a[2]], [b[0], a[1], b[2]], [a[0], a[1], b[2]]], [[a[0], a[1], a[2]], [a[0], a[1], b[2]], [a[0], b[1], b[2]], [a[0], b[1], a[2]]], [[a[0], a[1], a[2]], [a[0], b[1], a[2]], [b[0], b[1], a[2]], [b[0], a[1], a[2]]]];
  const ctr = xf([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
  v.add(o.depth ?? v.depth(ctr) + (o.bias || 0), (g) => { g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha;
    for (const f of F) { const w = f.map(xf), q = w.map(v.P); if (area(q) >= 0) continue; const n = norm3(cross3(sub3(w[1], w[0]), sub3(w[2], w[1])));
      const col = n[1] > .6 ? c[0] : n[0] > n[2] ? c[1] : c[2]; path(g, q, o.ghost ? null : col, { dash: o.dash, lw: o.lw, stroke: o.stroke }); } g.restore(); }); return ctr; }
// 円柱（縦）：c=底の中心
export function cyl(v, c, r, h, o = {}) { const col = o.c || [PAL.white, PAL.s1];
  v.add(o.depth ?? v.depth([c[0], c[1] + h / 2, c[2]]) + (o.bias || 0), (g) => { const p0 = v.P(c), p1 = v.P([c[0], c[1] + h, c[2]]), rx = 1.2247 * v.s * r, ry = .7071 * v.s * r;
    g.beginPath(); g.moveTo(p1[0] - rx, p1[1]); g.lineTo(p0[0] - rx, p0[1]); g.ellipse(p0[0], p0[1], rx, ry, 0, Math.PI, 0, true); g.lineTo(p1[0] + rx, p1[1]); g.closePath(); g.fillStyle = col[1]; g.fill(); g.lineWidth = LW; g.strokeStyle = PAL.ink; g.lineJoin = 'round'; g.stroke();
    g.beginPath(); g.ellipse(p1[0], p1[1], rx, ry, 0, 0, 7); g.fillStyle = col[0]; g.fill(); g.stroke(); }); }
function hull(P) { P = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const L = [], U = [];
  for (const p of P) { while (L.length >= 2 && cr(L[L.length - 2], L[L.length - 1], p) <= 0) L.pop(); L.push(p); } for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (U.length >= 2 && cr(U[U.length - 2], U[U.length - 1], p) <= 0) U.pop(); U.push(p); }
  L.pop(); U.pop(); return L.concat(U); }
// 球の集まりの外形（カプセル・胴体など）。sph=[[点,半径],…]
export function blob(v, sph, fill, o = {}) { let d = 0; for (const [p] of sph) d += v.depth(p); d = d / sph.length + (o.bias || 0);
  v.add(o.depth ?? d, (g) => { const pts = []; for (const [p, r] of sph) { const c = v.P(p), R = r * v.s * 1.06; for (let i = 0; i < 18; i++) pts.push([c[0] + Math.cos(i / 18 * 6.2832) * R, c[1] + Math.sin(i / 18 * 6.2832) * R]); }
    g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha; path(g, hull(pts), fill, { lw: o.lw }); if (o.after) o.after(g); g.restore(); }); }
// 面に貼る文字。origin=左上、U=右向き1cm、V=下向き1cm、size=cm
export function faceText(v, origin, U, V, s, size, o = {}) { const p0 = v.P(origin), pu = v.P(add3(origin, U)), pv = v.P(add3(origin, V));
  v.add(o.depth ?? v.depth(origin) + 6, (g) => { g.save(); g.globalAlpha *= o.a ?? 1; g.transform(pu[0] - p0[0], pu[1] - p0[1], pv[0] - p0[0], pv[1] - p0[1], p0[0], p0[1]);
    g.fillStyle = o.color || PAL.ink; g.font = `${o.w || 700} ${size}px ${JP}`; g.textAlign = o.align || 'left'; g.textBaseline = 'alphabetic'; g.fillText(s, 0, size); g.restore(); }); }
// 面に貼る図形（四角）。pts=世界座標の点列
export function poly3(v, pts, fill, o = {}) { let d = 0; for (const p of pts) d += v.depth(p); v.add(o.depth ?? d / pts.length + (o.bias || 0), (g) => { g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha; path(g, pts.map(v.P), fill, o); g.restore(); }); }
export function line3(v, a, b, o = {}) { v.add(o.depth ?? (v.depth(a) + v.depth(b)) / 2 + (o.bias || 0), (g) => { g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha; path(g, [v.P(a), v.P(b)], null, { open: true, dash: o.dash, lw: o.lw, stroke: o.stroke }); g.restore(); }); }
// ---------- 画面上（2D）の部品 ----------
export function tx(g, s, x, y, size, o = {}) { g.save(); g.globalAlpha *= o.a ?? 1; g.fillStyle = o.color || PAL.ink; g.font = `${o.w || 700} ${size}px ${JP}`; g.textAlign = o.align || 'left'; g.textBaseline = 'alphabetic';
  if (o.halo) { g.lineWidth = o.halo; g.strokeStyle = o.haloC || PAL.paper; g.lineJoin = 'round'; g.strokeText(s, x, y); } g.fillText(s, x, y); g.restore(); }
export function tw(g, s, size, w = 700) { g.save(); g.font = `${w} ${size}px ${JP}`; const r = g.measureText(s).width; g.restore(); return r; }
export function roundRect(g, x, y, w, h, r, fill, lw = LW, o = {}) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = o.stroke || PAL.ink; if (o.dash) g.setLineDash(o.dash); g.stroke(); g.setLineDash([]); } }
export function label(g, s, x, y, size = 34, o = {}) { g.save(); g.globalAlpha *= o.a ?? 1; const w = tw(g, s, size, o.w || 700) + size * 1.2, h = size * 1.75;
  roundRect(g, x - w / 2, y - h / 2, w, h, o.r ?? 10, o.fill || '#FFFFFF', o.lw ?? LW, { stroke: o.stroke }); tx(g, s, x, y + size * .36, size, { align: 'center', color: o.color, w: o.w }); g.restore(); return w; }
export function arrow2(g, x1, y1, x2, y2, o = {}) { g.save(); g.globalAlpha *= o.a ?? 1; const a = Math.atan2(y2 - y1, x2 - x1), h = o.head || 22; g.strokeStyle = g.fillStyle = o.color || PAL.ink; g.lineWidth = o.lw || 5; g.lineCap = 'round'; if (o.dash) g.setLineDash(o.dash);
  g.beginPath(); g.moveTo(x1, y1); if (o.bend) { const mx = (x1 + x2) / 2 - Math.sin(a) * o.bend, my = (y1 + y2) / 2 + Math.cos(a) * o.bend; g.quadraticCurveTo(mx, my, x2 - Math.cos(a) * h * .6, y2 - Math.sin(a) * h * .6); } else g.lineTo(x2 - Math.cos(a) * h * .6, y2 - Math.sin(a) * h * .6); g.stroke(); g.setLineDash([]);
  const b = o.bend ? Math.atan2(y2 - ((y1 + y2) / 2 + Math.cos(a) * o.bend), x2 - ((x1 + x2) / 2 - Math.sin(a) * o.bend)) : a;
  g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - Math.cos(b - .45) * h, y2 - Math.sin(b - .45) * h); g.lineTo(x2 - Math.cos(b + .45) * h, y2 - Math.sin(b + .45) * h); g.closePath(); g.fill(); g.restore(); }
export function cross(g, x, y, r, lw = 12, o = {}) { if (r <= 0) return; g.save(); g.globalAlpha *= o.a ?? 1; g.strokeStyle = o.color || PAL.red; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r, y - r); g.lineTo(x + r, y + r); g.moveTo(x + r, y - r); g.lineTo(x - r, y + r); g.stroke(); g.restore(); }
export function tick(g, x, y, r, lw = 12, o = {}) { g.save(); g.globalAlpha *= o.a ?? 1; g.strokeStyle = o.color || PAL.ink; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x - r * .3, y + r * .7); g.lineTo(x + r, y - r * .8); g.stroke(); g.restore(); }
// 荷札
export function tag(g, x, y, w, h, s, o = {}) { g.save(); g.globalAlpha *= o.a ?? 1; const c = Math.min(34, w * .16); g.beginPath(); g.moveTo(x + c, y); g.lineTo(x + w - c, y); g.lineTo(x + w, y + c); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.lineTo(x, y + c); g.closePath();
  g.fillStyle = o.fill || '#FFFFFF'; g.fill(); g.lineWidth = LW; g.strokeStyle = PAL.ink; g.lineJoin = 'round'; g.stroke(); g.beginPath(); g.arc(x + w / 2, y + 30, 10, 0, 7); g.fillStyle = PAL.paper; g.fill(); g.stroke();
  g.beginPath(); g.moveTo(x + w / 2, y + 20); g.quadraticCurveTo(x + w / 2 + 28, y - 36, x + w / 2 - 10, y - 62); g.stroke();
  const L = Array.isArray(s) ? s : [s], sz = o.size || 60; L.forEach((l, i) => tx(g, l, x + w / 2, y + h / 2 + 20 + sz * .4 + (i - (L.length - 1) / 2) * sz * 1.25, sz, { align: 'center', color: o.color, w: o.w })); g.restore(); }
// 虫めがね風の丸（中身は fn(g) で描く。中心 cx,cy 半径 r）。from=指している場所[x,y]
export function magnifier(g, from, cx, cy, r, fn) { g.save(); if (from) { g.strokeStyle = PAL.ink; g.lineWidth = LW; g.setLineDash([10, 9]); const a = Math.atan2(cy - from[1], cx - from[0]); g.beginPath(); g.moveTo(from[0], from[1]); g.lineTo(cx - Math.cos(a) * r, cy - Math.sin(a) * r); g.stroke(); g.setLineDash([]); g.beginPath(); g.arc(from[0], from[1], 16, 0, 7); g.stroke(); }
  g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fillStyle = '#FFFFFF'; g.fill(); g.save(); g.clip(); fn(g); g.restore(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.lineWidth = LW * 1.6; g.strokeStyle = PAL.ink; g.stroke(); g.restore(); }
