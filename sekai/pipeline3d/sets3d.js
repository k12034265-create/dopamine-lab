// ===== 世界のネタバレ 3D部品集（場所・小物・人物・データ表示） =====
import { THREE, mat, glow, box, cyl, ball, plane, dust, beam, lamp, sun, canvasTex, ease, easeOut, clamp, lerp, rng, SERIF, SANS } from './lib3d.js';

export const PAL = { o: '#ff8a3d', t: '#3dc6c1', red: '#e0564b', ink: '#2a2622', chalk: '#f1efe6', gray: '#8a8f99' };

// =====================================================================================
// データ表示（canvas に描いて、黒板・紙・モニター・スマホに貼る）
// theme: chalk(黒板) / paper(紙) / screen(暗いモニター) / phone(白いスマホ画面)
// =====================================================================================
const THEMES = {
  chalk: { bg: '#24382f', fg: '#f1efe6', dim: 'rgba(241,239,230,.55)', accent: '#ffcf6b', accent2: '#8fe0d8', red: '#ff8f80', font: SANS, grain: true },
  paper: { bg: '#f2ead8', fg: '#2a2622', dim: 'rgba(42,38,34,.5)', accent: '#c0392b', accent2: '#2e6f8e', red: '#c0392b', font: SERIF },
  screen: { bg: '#0f1622', fg: '#e8eef8', dim: 'rgba(232,238,248,.5)', accent: '#ff8a3d', accent2: '#3dc6c1', red: '#e0564b', font: SANS, glow: true },
  phone: { bg: '#f7f7f9', fg: '#1d1f24', dim: 'rgba(29,31,36,.5)', accent: '#ff7a2f', accent2: '#1fa39d', red: '#e0564b', font: SANS },
};
export function dataTex(w, h, theme, draw) {
  const T = THEMES[theme];
  return canvasTex(w, h, (g, W, H, ...a) => {
    g.fillStyle = T.bg; g.fillRect(0, 0, W, H);
    if (T.grain) { const r = rng(3); g.globalAlpha = 0.06; for (let i = 0; i < 1800; i++) { g.fillStyle = r() < .5 ? '#fff' : '#000'; g.fillRect(r() * W, r() * H, 2, 2); } g.globalAlpha = 1;
      for (let i = 0; i < 5; i++) { const x = r() * W, y = r() * H, rr = 160 + r() * 220; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(255,255,255,.05)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); } }
    g.textBaseline = 'alphabetic'; draw(g, W, H, T, ...a);
  });
}
// 共通の描画ヘルパー（canvas 2D）
export const D = {
  title(g, T, x, y, s, size = 56, o = {}) { g.font = `bold ${size}px ${T.font}`; g.fillStyle = o.color || T.fg; g.textAlign = o.align || 'left'; g.fillText(s, x, y); g.textAlign = 'left'; },
  text(g, T, x, y, s, size = 36, o = {}) { g.font = `${o.w || 700} ${size}px ${o.font || T.font}`; g.fillStyle = o.color || T.fg; g.globalAlpha = o.a ?? 1; g.textAlign = o.align || 'left'; g.fillText(s, x, y); g.globalAlpha = 1; g.textAlign = 'left'; },
  hbars(g, T, x, y, w, items, maxv, k, o = {}) {   // items: {label,v,c,txt}
    const bh = o.bh || 60, gap = o.gap || 34;
    items.forEach((it, i) => { const p = easeOut(clamp(k * items.length * 0.7 - i * 0.6)); const yy = y + i * (bh + gap);
      D.text(g, T, x - 24, yy + bh * 0.72, it.label, o.ls || 38, { align: 'right' });
      g.fillStyle = 'rgba(128,128,128,.18)'; g.fillRect(x, yy, w, bh);
      g.fillStyle = it.c || T.accent; g.fillRect(x, yy, w * it.v / maxv * p, bh);
      if (it.txt && p > 0.3) D.text(g, T, x + w * it.v / maxv * p + 18, yy + bh * 0.74, it.txt, o.vs || 42, { color: it.c || T.accent, a: clamp((p - .3) / .4) }); });
  },
  vbars(g, T, x, y, w, h, items, maxv, k, o = {}) {
    const n = items.length, gap = o.gap || 40, bw = (w - gap * (n - 1)) / n;
    items.forEach((it, i) => { const p = easeOut(clamp(k * n * 0.7 - i * 0.6)); const bh = h * it.v / maxv * p, xx = x + i * (bw + gap);
      g.fillStyle = it.c || T.accent; g.fillRect(xx, y + h - bh, bw, bh);
      D.text(g, T, xx + bw / 2, y + h + 50, it.label, o.ls || 34, { align: 'center', color: T.dim });
      if (it.txt && p > .4) D.text(g, T, xx + bw / 2, y + h - bh - 18, it.txt, o.vs || 46, { align: 'center', color: it.c || T.accent }); });
    g.fillStyle = T.dim; g.fillRect(x - 10, y + h, w + 20, 3);
  },
  donut(g, T, cx, cy, r, segs, k, o = {}) {
    let a0 = -Math.PI / 2; const tot = segs.reduce((a, b) => a + b.v, 0); g.lineWidth = o.lw || r * 0.42;
    segs.forEach(sg => { const da = 2 * Math.PI * sg.v / tot * clamp(k); g.strokeStyle = sg.c; g.beginPath(); g.arc(cx, cy, r, a0, a0 + da); g.stroke(); a0 += da; });
  },
  people(g, T, x, y, cols, rows, cell, frac, k, cOn, cOff) {
    const n = cols * rows, on = Math.round(n * frac * clamp(k));
    for (let i = 0; i < n; i++) { const cx = x + (i % cols) * cell, cy = y + Math.floor(i / cols) * cell * 1.5; g.fillStyle = i < on ? cOn : cOff;
      g.beginPath(); g.arc(cx, cy, cell * 0.17, 0, Math.PI * 2); g.fill(); g.fillRect(cx - cell * 0.2, cy + cell * 0.22, cell * 0.4, cell * 0.5); }
  },
  arrow(g, x1, y1, x2, y2, c, k = 1, lw = 6) { const x = lerp(x1, x2, k), y = lerp(y1, y2, k); g.strokeStyle = c; g.fillStyle = c; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x, y); g.stroke();
    if (k > .1) { const a = Math.atan2(y2 - y1, x2 - x1), h = lw * 3.5; g.beginPath(); g.moveTo(x + Math.cos(a) * h * .5, y + Math.sin(a) * h * .5); g.lineTo(x - Math.cos(a - .5) * h, y - Math.sin(a - .5) * h); g.lineTo(x - Math.cos(a + .5) * h, y - Math.sin(a + .5) * h); g.fill(); } },
  box(g, x, y, w, h, c, lw = 4) { g.strokeStyle = c; g.lineWidth = lw; g.strokeRect(x, y, w, h); },
  pill(g, T, x, y, s, c, size = 34) { g.font = `bold ${size}px ${T.font}`; const w = g.measureText(s).width + size * 1.2; g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); g.roundRect(x, y, w, size * 1.6, size * 0.8); g.stroke(); g.fillStyle = c; g.fillText(s, x + size * 0.6, y + size * 1.15); return w; },
  timeline(g, T, x, y, w, pts, k, o = {}) { // pts: [{at:0..1, label, sub, c}]
    g.fillStyle = T.dim; g.fillRect(x, y - 2, w * clamp(k * 1.4), 4);
    pts.forEach((p, i) => { const a = clamp(k * pts.length * 0.9 - i * 0.7); if (a <= 0) return; const px = x + w * p.at; g.globalAlpha = a;
      g.fillStyle = p.c || T.accent; g.beginPath(); g.arc(px, y, 12, 0, Math.PI * 2); g.fill();
      D.text(g, T, px, y - 34, p.label, o.ls || 36, { align: 'center', color: p.c || T.fg }); if (p.sub) D.text(g, T, px, y + 56, p.sub, o.ss || 28, { align: 'center', color: T.dim, w: 500 }); g.globalAlpha = 1; });
  },
};

// =====================================================================================
// 部屋・小物
// =====================================================================================
export function room(p, o = {}) {
  const w = o.w || 12, d = o.d || 10, h = o.h || 4.5;
  box(p, w, 0.2, d, mat(o.floor || '#5e4535'), 0, -0.1, 0);
  box(p, w, h, 0.2, mat(o.wall || '#4a4f5a'), 0, h / 2, -d / 2);
  if (o.left !== false) box(p, 0.2, h, d, mat(o.wall2 || o.wall || '#444954'), -w / 2, h / 2, 0);
  if (o.right) box(p, 0.2, h, d, mat(o.wall2 || o.wall || '#444954'), w / 2, h / 2, 0);
  if (o.ceiling) box(p, w, 0.2, d, mat(o.ceil || '#2a2c31'), 0, h, 0);
  if (o.baseboard !== false) box(p, w, 0.18, 0.06, mat('#2c2622'), 0, 0.09, -d / 2 + 0.12);
}
// 窓：mode 'night'|'day'|'dusk'。壁 z の手前に置く
export function windowPane(p, x, y, z, w, h, mode = 'night', o = {}) {
  const sky = { night: ['#0a1430', '#1d2c5a'], day: ['#9fc6ea', '#e8f1f8'], dusk: ['#2a2350', '#f0a46a'] }[mode];
  const t = canvasTex(256, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, sky[0]); gr.addColorStop(1, sky[1]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const r = rng(o.seed || 4); g.fillStyle = mode === 'day' ? 'rgba(90,100,120,.55)' : '#0b0f1c';
    for (let i = 0; i < 14; i++) { const bw = 10 + r() * 22, bh = 40 + r() * 130; const bx = i * 19; g.fillRect(bx, H - bh, bw, bh); if (mode !== 'day') { g.fillStyle = '#ffd27a'; for (let k = 0; k < 6; k++) if (r() < .35) g.fillRect(bx + 3 + r() * (bw - 6), H - bh + 6 + r() * (bh - 12), 2, 3); g.fillStyle = '#0b0f1c'; } } });
  const m = new THREE.MeshBasicMaterial({ map: t, toneMapped: false }); const pl = plane(p, w, h, m, x, y, z);
  const f = mat(o.frame || '#d9d2c4'); box(p, w + 0.16, 0.08, 0.12, f, x, y + h / 2, z + 0.02); box(p, w + 0.16, 0.12, 0.2, f, x, y - h / 2, z + 0.04); box(p, 0.08, h, 0.12, f, x - w / 2, y, z + 0.02); box(p, 0.08, h, 0.12, f, x + w / 2, y, z + 0.02); box(p, 0.05, h, 0.08, f, x, y, z + 0.02);
  return pl;
}
export function bookshelf(p, x, z, ry = 0, o = {}) {
  const g = new THREE.Group(); const r = rng(o.seed || 2); const W = o.w || 1.6, H = o.h || 2.6, n = o.shelves || 4;
  const wd = mat(o.wood || '#4a3426'); box(g, W, H, 0.04, wd, 0, H / 2, -0.2); box(g, 0.05, H, 0.45, wd, -W / 2, H / 2, 0); box(g, 0.05, H, 0.45, wd, W / 2, H / 2, 0); box(g, W, 0.05, 0.45, wd, 0, H, 0); const cols = ['#7a2e2e', '#2e4a7a', '#7a6a2e', '#3d6b4f', '#5b3d6b', '#8a7a64', '#2f2f35', '#a0522d'];
  for (let s = 0; s < n; s++) { const y0 = 0.15 + s * (H - 0.2) / n; box(g, W - 0.08, 0.04, 0.42, mat('#3a281c'), 0, y0, 0.02); let x0 = -W / 2 + 0.08;
    while (x0 < W / 2 - 0.12) { const bw = 0.05 + r() * 0.07, bh = (H / n) * (0.55 + r() * 0.3); if (r() < 0.08) { x0 += 0.12; continue; } box(g, bw, bh, 0.3, mat(cols[(r() * 8) | 0]), x0 + bw / 2, y0 + 0.02 + bh / 2, 0.05); x0 += bw + 0.008; } }
  g.position.set(x, 0, z); g.rotation.y = ry; p.add(g); return g;
}
export function desk(p, x, z, ry = 0, o = {}) {
  const g = new THREE.Group(); const w = o.w || 2.2, d = o.d || 1.0, h = o.h || 0.76; const wood = mat(o.wood || '#6b4a33', { r: .6 });
  box(g, w, 0.06, d, wood, 0, h, 0); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(g, 0.06, h, 0.06, mat(o.leg || '#3e2b1f'), dx * (w / 2 - 0.08), h / 2, dz * (d / 2 - 0.08));
  if (o.drawers) box(g, 0.5, 0.5, d - 0.1, mat('#5a3e2b'), w / 2 - 0.35, h - 0.28, 0);
  g.position.set(x, 0, z); g.rotation.y = ry; p.add(g); g.userData.top = h + 0.03; return g;
}
export function chair(p, x, z, ry = 0, c = '#2f3540') { const g = new THREE.Group(); const m = mat(c);
  box(g, 0.48, 0.05, 0.46, m, 0, 0.46, 0); box(g, 0.48, 0.55, 0.05, m, 0, 0.76, -0.22); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(g, 0.04, 0.46, 0.04, mat('#1e2228'), dx * 0.2, 0.23, dz * 0.19);
  g.position.set(x, 0, z); g.rotation.y = ry; p.add(g); return g; }
export function deskLamp(p, x, y, z, o = {}) { const c = mat(o.metal || '#b08a4a', { m: .6, r: .35 });
  box(p, 0.2, 0.03, 0.2, c, x, y + 0.015, z); cyl(p, 0.015, 0.015, 0.45, c, x, y + 0.24, z, 6);
  const sh = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.2, 14, 1, true), new THREE.MeshStandardMaterial({ color: o.shade || '#f2d9a0', emissive: o.shade || '#ffcc77', emissiveIntensity: 1.1, side: THREE.DoubleSide, flatShading: true }));
  sh.position.set(x, y + 0.52, z); p.add(sh); return lamp(p, o.light || '#ffb866', o.i ?? 6, 5, x, y + 0.45, z, !!o.shadow); }
export function plant(p, x, z, s = 1) { const g = new THREE.Group(); cyl(g, 0.16, 0.12, 0.3, mat('#b5643c'), 0, 0.15, 0, 8);
  const r = rng(x * 100 + z); for (let i = 0; i < 9; i++) { const l = ball(g, 0.14, mat(i % 2 ? '#3e7a4a' : '#4f8f55'), (r() - .5) * 0.3, 0.42 + r() * 0.45, (r() - .5) * 0.3, 0); l.scale.set(1, 1.6, 0.6); l.rotation.z = (r() - .5); }
  g.position.set(x, 0, z); g.scale.setScalar(s); p.add(g); return g; }
export function sofa(p, x, z, ry = 0, c = '#6b5a4a') { const g = new THREE.Group(); const m = mat(c);
  box(g, 2.0, 0.42, 0.85, m, 0, 0.21, 0); box(g, 2.0, 0.55, 0.2, m, 0, 0.62, -0.33); box(g, 0.2, 0.6, 0.85, m, -0.95, 0.4, 0); box(g, 0.2, 0.6, 0.85, m, 0.95, 0.4, 0);
  box(g, 0.85, 0.12, 0.6, mat('#7d6b59'), -0.45, 0.47, 0.05); box(g, 0.85, 0.12, 0.6, mat('#7d6b59'), 0.45, 0.47, 0.05);
  g.position.set(x, 0, z); g.rotation.y = ry; p.add(g); return g; }
// 壁掛けボード（黒板・額・モニター）
export function board(p, w, h, tex, x, y, z, ry = 0, o = {}) {
  const g = new THREE.Group(); const fr = mat(o.frame || '#5b4330');
  const scr = plane(g, w, h, new THREE.MeshStandardMaterial({ map: tex, roughness: o.rough ?? .9, emissive: '#fff', emissiveMap: tex, emissiveIntensity: o.glow ?? 0.18 }), 0, 0, 0.02);
  if (o.frame !== false) { box(g, w + 0.14, 0.08, 0.08, fr, 0, h / 2 + 0.03, 0); box(g, w + 0.14, 0.08, 0.08, fr, 0, -h / 2 - 0.03, 0); box(g, 0.08, h + 0.1, 0.08, fr, -w / 2 - 0.03, 0, 0); box(g, 0.08, h + 0.1, 0.08, fr, w / 2 + 0.03, 0, 0); }
  if (o.tray) box(g, w, 0.05, 0.12, fr, 0, -h / 2 - 0.08, 0.06);
  if (o.monitor) { box(g, w + 0.1, h + 0.1, 0.06, mat('#15171b', { m: .4, r: .4 }), 0, 0, -0.02); }
  g.position.set(x, y, z); g.rotation.y = ry; p.add(g); return g;
}
export function paperOn(p, w, h, tex, x, y, z, rz = 0) { const pl = plane(p, w, h, new THREE.MeshStandardMaterial({ map: tex, roughness: .95, emissive: '#fff', emissiveMap: tex, emissiveIntensity: 0.06 }), x, y, z); pl.rotation.x = -Math.PI / 2; pl.rotation.z = rz; pl.receiveShadow = true; return pl; }
export function phone(p, tex, x, y, z, s = 1) { const g = new THREE.Group(); box(g, 0.36, 0.74, 0.03, mat('#111317', { m: .5, r: .3 }), 0, 0, 0);
  plane(g, 0.32, 0.68, new THREE.MeshBasicMaterial({ map: tex, color: '#c4c4c4' }), 0, 0, 0.017); g.position.set(x, y, z); g.scale.setScalar(s); p.add(g); return g; }
export function globe(p, x, y, z, r, tex) { const g = new THREE.Group();
  const sph = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), new THREE.MeshStandardMaterial({ map: tex, roughness: .6, emissive: '#fff', emissiveMap: tex, emissiveIntensity: 0.25 })); sph.castShadow = true; g.add(sph);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.08, r * 0.02, 6, 48), mat('#b08a4a', { m: .6, r: .3 })); ring.rotation.y = Math.PI / 2; g.add(ring);
  cyl(g, r * 0.05, r * 0.05, r * 0.5, mat('#3a2a1c'), 0, -r * 1.2, 0, 8); cyl(g, r * 0.35, r * 0.4, r * 0.1, mat('#3a2a1c'), 0, -r * 1.45, 0, 16);
  g.position.set(x, y, z); g.rotation.z = 0.4; p.add(g); g.userData.sphere = sph; return g; }
// 世界地図テクスチャ（ざっくりした大陸 + 点）
export function worldTex(dots = [], o = {}) {
  return canvasTex(1024, 512, (g, W, H, k = 1) => {
    g.fillStyle = o.sea || '#1c3b5a'; g.fillRect(0, 0, W, H);
    g.fillStyle = o.land || '#c9b88f';
    const blob = (pts) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x * W, y * H) : g.moveTo(x * W, y * H)); g.closePath(); g.fill(); };
    blob([[.08, .18], [.2, .12], [.3, .2], [.27, .35], [.22, .45], [.17, .42], [.12, .3]]);           // N america
    blob([[.24, .5], [.3, .52], [.33, .62], [.3, .82], [.27, .85], [.25, .66]]);                      // S america
    blob([[.45, .18], [.55, .12], [.75, .14], [.88, .22], [.85, .38], [.75, .42], [.65, .45], [.55, .38], [.48, .32]]); // eurasia
    blob([[.47, .42], [.56, .42], [.6, .55], [.56, .75], [.52, .78], [.48, .6]]);                     // africa
    blob([[.78, .62], [.88, .6], [.9, .72], [.82, .76]]);                                             // australia
    blob([[.835, .3], [.845, .28], [.855, .34], [.842, .38]]);                                        // japan
    dots.forEach((d, i) => { if (i / dots.length > k) return; g.fillStyle = d[2]; g.beginPath(); g.arc(d[0] * W, d[1] * H, d[3] || 5, 0, Math.PI * 2); g.fill(); });
  });
}

// =====================================================================================
// 人物（顔あり・ローポリ）
// o: {skin,hair,top,bottom,hairStyle:'short'|'long'|'bun'|'none', face:true, pose:'stand'|'sit'|'walk', era:'modern'|'showa'|'heian'|'ancient', scale}
// =====================================================================================
export function human(p, o = {}) {
  const g = new THREE.Group(); const skin = mat(o.skin || '#e8c3a0'), hair = mat(o.hair || '#1c1714'), top = mat(o.top || '#34405a'), bot = mat(o.bottom || '#262a33');
  const sit = o.pose === 'sit';
  const legs = [];
  if (sit) { for (const sx of [-1, 1]) { box(g, 0.13, 0.12, 0.44, bot, sx * 0.08, 0.5, 0.18); legs.push(box(g, 0.12, 0.48, 0.12, bot, sx * 0.08, 0.25, 0.38)); box(g, 0.13, 0.06, 0.2, mat('#1b1b1e'), sx * 0.08, 0.03, 0.44); } }
  else for (const sx of [-1, 1]) { const lg = new THREE.Group(); lg.position.set(sx * 0.085, 0.84, 0); box(lg, 0.13, 0.82, 0.14, bot, 0, -0.41, 0); box(lg, 0.13, 0.07, 0.24, mat('#1b1b1e'), 0, -0.8, 0.04); g.add(lg); legs.push(lg); }
  const hy = sit ? 0.52 : 0.84;
  if (o.era === 'heian' || o.dress) { const sk = cyl(g, 0.2, 0.42, hy + 0.05, top, 0, (hy + 0.05) / 2, 0, 8); }
  const torso = cyl(g, 0.21, 0.17, 0.62, top, 0, hy + 0.31, 0, 8); torso.scale.z = 0.62;
  const arms = [];
  for (const sx of [-1, 1]) { const ag = new THREE.Group(); ag.position.set(sx * 0.25, hy + 0.58, 0); box(ag, 0.09, 0.56, 0.1, top, 0, -0.27, 0); ball(ag, 0.05, skin, 0, -0.57, 0, 0); ag.rotation.z = sx * 0.07; if (sit) ag.rotation.x = -0.6; g.add(ag); arms.push(ag); }
  cyl(g, 0.05, 0.06, 0.08, skin, 0, hy + 0.66, 0, 6);
  const hg = new THREE.Group(); hg.position.set(0, hy + 0.83, 0); g.add(hg);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 18, 14), new THREE.MeshStandardMaterial({ color: o.skin || '#e8c3a0', roughness: .8 })); head.castShadow = true; hg.add(head); head.scale.set(0.95, 1.1, 1);
  const hs = o.hairStyle || 'short';
  if (hs !== 'none') { const cap = new THREE.Mesh(new THREE.SphereGeometry(0.157, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), hair); cap.position.set(0, 0.03, -0.012); cap.castShadow = true; hg.add(cap);
    box(hg, 0.3, 0.12, 0.1, hair, 0, -0.01, -0.1); }
  if (hs === 'long') box(hg, 0.3, 0.42, 0.1, hair, 0, -0.18, -0.1);
  if (hs === 'bun') ball(hg, 0.07, hair, 0, 0.14, -0.1, 0);
  if (o.era === 'heian' && !o.dress) { const eb = cyl(hg, 0.06, 0.08, 0.22, mat('#151515'), 0, 0.22, -0.02, 8); }
  if (o.face !== false) { const eye = mat('#1a1614'); ball(hg, 0.017, eye, -0.05, 0.02, 0.135, 0); ball(hg, 0.017, eye, 0.05, 0.02, 0.135, 0);
    box(hg, 0.04, 0.008, 0.01, mat('#2a1d18'), -0.05, 0.06, 0.13); box(hg, 0.04, 0.008, 0.01, mat('#2a1d18'), 0.05, 0.06, 0.13);
    box(hg, 0.04, 0.008, 0.01, mat('#a0574a'), 0, -0.06, 0.138); }
  if (o.hat) { cyl(hg, 0.22, 0.22, 0.02, mat(o.hat), 0, 0.13, 0, 14); cyl(hg, 0.13, 0.15, 0.13, mat(o.hat), 0, 0.2, 0, 14); }
  g.scale.setScalar(o.scale || 1); p.add(g);
  g.userData = { head: hg, arms, legs, sit };
  g.userData.walk = (t, sp = 1) => { if (sit) return; const a = Math.sin(t * 5 * sp) * 0.45; legs[0].rotation.x = a; legs[1].rotation.x = -a; arms[0].rotation.x = -a * 0.7; arms[1].rotation.x = a * 0.7; };
  g.userData.bow = (k) => { torso.rotation.x = 0; hg.position.z = 0.25 * k; hg.position.y = hy + 0.83 - 0.12 * k; g.children.forEach(() => {}); };
  return g;
}
// 横顔シルエット（平面）— キス表現用（唇は重ねない）
export function profileTex(color = '#16130f', bg = null) {
  return canvasTex(512, 512, (g, W, H, gap = 120) => {
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, W, H); }
    const prof = (cx, dir) => { g.save(); g.translate(cx, H * 0.55); g.scale(dir, 1); g.fillStyle = color; g.beginPath();
      g.moveTo(-70, 230); g.lineTo(-62, 30); g.quadraticCurveTo(-75, -120, 8, -135); g.quadraticCurveTo(64, -130, 70, -70); g.lineTo(82, -32); g.lineTo(68, -24); g.lineTo(73, 0); g.lineTo(65, 9); g.quadraticCurveTo(66, 32, 40, 37); g.lineTo(34, 85); g.lineTo(120, 150); g.lineTo(130, 230); g.closePath(); g.fill(); g.restore(); };
    prof(W / 2 - gap / 2 - 75, 1); prof(W / 2 + gap / 2 + 75, -1);
  });
}
