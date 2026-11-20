// 03 キス — 3D版 全50シーン
import { THREE, makeScene, mat, glow, box, cyl, ball, plane, dust, beam, lamp, sun, camMove, canvasTex, ease, easeOut, clamp, lerp, rng, SERIF, SANS } from '/pipeline3d/lib3d.js';
import { PAL, dataTex, D, room, windowPane, bookshelf, desk, chair, deskLamp, plant, sofa, board, paperOn, phone, globe, worldTex, human, profileTex } from '/pipeline3d/sets3d.js';
import { theater, office, washitsu, street, label } from './proto3d.js';

// ---------- helpers ----------
// 3Dの面には文字を描かない。文字・グラフは正面向きの平らなカード（HTML）で見せる
let CUR = [];
const FR = { chalk: 'border:12px solid #5b4330;', screen: 'border:10px solid #15171b;', phone: 'border:14px solid #111317;', paper: '' };
const cardImg = (cv, x, y, w, fr = '', rad = 12) => `<img src="${cv.toDataURL('image/jpeg', 0.92)}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;${fr}border-radius:${rad}px;box-shadow:0 18px 50px rgba(0,0,0,.6)">`;
function twin(w, h, theme, draw, lay = {}) {
  const tex = dataTex(w, h, theme, draw), blank = theme === 'phone' ? canvasTex(64, 128, (g, W, H) => { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#2a2f3a'); gr.addColorStop(1, '#0c0e12'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }) : dataTex(w, h, theme, () => {});
  CUR.push(t => (lay.show && !lay.show(t)) ? '' : cardImg(tex.image, lay.x ?? 100, lay.y ?? 96, lay.w ?? 1040, FR[theme] || '', theme === 'phone' ? 40 : 12));
  return { tex, blank };
}
function shots(cam, t, dur, list) {
  let i = 0; while (i + 1 < list.length && t >= list[i + 1][0]) i++;
  const [t0, a, b, la, lb, fov] = list[i]; const t1 = i + 1 < list.length ? list[i + 1][0] : dur;
  camMove(cam, a, b, la, lb, ease((t - t0) / Math.max(0.1, t1 - t0)));
  if (fov && cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
}
const big = (x, y, s, o = {}) => label(x, y, s, { size: o.size || 96, serif: o.serif ?? 1, color: o.color || '#fff', op: o.op ?? 1, ls: 2, w: 700 });
const note = (s, op = 1) => `<div style="position:absolute;right:60px;top:52px;font-size:24px;color:rgba(255,255,255,.7);opacity:${op};letter-spacing:1px;text-shadow:0 2px 8px rgba(0,0,0,.8)">${s}</div>`;
const chapterCard = (t, num, title) => { const a = clamp((t - 0.2) / 0.6) * clamp((3.4 - t) / 0.5);
  return `<div style="position:absolute;inset:0;background:rgba(0,0,0,${0.35 * a})"></div><div style="position:absolute;left:0;right:0;top:360px;text-align:center;opacity:${a}"><div style="font-size:30px;letter-spacing:10px;color:#ff8a3d;font-family:serif">${num}</div>
  <div class="serif" style="font-size:92px;font-weight:700;letter-spacing:6px;margin-top:18px;text-shadow:0 4px 30px rgba(0,0,0,.8)">${title}</div></div>`; };
const addPeople = (s, list) => (list || []).map(q => { const h = human(s, q); h.position.set(...q.at); h.rotation.y = q.ry || 0; return h; });

// ================================================================== 共通セット
function lab(drawBoard, o = {}) {
  const S = makeScene({ bg: '#2a2620', hemi: 0.8, exposure: 1.45, bloom: 0.5, bloomTh: 0.85, fov: 34 });
  const s = S.s;
  room(s, { w: 13, d: 9, wall: '#6b6254', floor: '#7a5e46' });
  windowPane(s, 4.3, 2.5, -4.38, 2.2, 1.9, o.sky || 'dusk');
  bookshelf(s, -5.0, -4.1, 0, { seed: 3 }); bookshelf(s, -3.3, -4.1, 0, { seed: 8 });
  const { tex, blank } = twin(1600, 900, 'chalk', drawBoard, o.card);
  board(s, 4.4, 2.48, blank, 0.4, 2.35, -4.35, 0, { tray: true });
  desk(s, -1.6, -2.2, 0.15, { w: 2.0 }); chair(s, -1.6, -1.4, Math.PI + 0.15);
  const gl = globe(s, -2.3, 1.18, -2.3, 0.33, worldTex(o.dots || [])); deskLamp(s, -0.9, 0.79, -2.5, { i: 5 });
  plant(s, 5.6, -3.7, 1.3);
  const people = addPeople(s, o.people);
  sun(s, '#ffd2a0', 1.5, 5, 6, 4, 10); lamp(s, '#fff0dc', 2.2, 9, 0.4, 3.6, -2.5, false);
  dust(s, 250, [-3, 3, 0.6, 3.6, -4, 1], '#fff2d6', 0.03, 0.4, 5);
  return { S, s, tex, globe: gl, people };
}
function museum(buildItem, o = {}) {
  const S = makeScene({ bg: '#121418', hemi: 0.45, exposure: 1.5, bloom: 0.6, bloomTh: 0.8, fov: 32, fog: ['#121418', 12, 26] });
  const s = S.s;
  room(s, { w: 14, d: 12, wall: o.wall || '#3a3f46', floor: '#4a4540', h: 5 });
  for (let i = -2; i <= 2; i++) box(s, 1.6, 2.1, 0.06, mat('#262a30'), i * 2.6, 2.6, -5.85);
  box(s, 1.2, 1.0, 1.2, mat('#d8d2c6'), 0, 0.5, -1.5);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), new THREE.MeshStandardMaterial({ color: '#cfe3ff', transparent: true, opacity: 0.12, roughness: .05, metalness: .1 })); glass.position.set(0, 1.45, -1.5); s.add(glass);
  const item = new THREE.Group(); item.position.set(0, 1.0, -1.5); s.add(item); buildItem(item);
  const sp = new THREE.SpotLight('#fff1d8', 14, 12, 0.35, 0.5, 1.2); sp.position.set(0.6, 4.6, 0.2); sp.target = item; sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); s.add(sp);
  lamp(s, '#cfd8e6', 2, 14, 0, 4.5, 2, false);
  if (o.panelTex) board(s, 2.6, 1.46, o.panelTex, 3.0, 2.2, -5.8, 0, { frame: '#111', glow: .35 });
  dust(s, 200, [-2, 2, 0.8, 4, -3, 1], '#fff2d6', 0.025, 0.35, 9);
  return { S, s, item };
}
function cafe(o = {}) {
  const S = makeScene({ bg: '#c9d8e6', hemi: 1.0, sky: '#dfe9f5', ground: '#6b5a48', exposure: 1.25, bloom: 0.35, bloomTh: 0.9, fov: 34 });
  const s = S.s;
  room(s, { w: 14, d: 10, wall: '#d8cfc0', floor: '#9a7a5a' });
  for (let i = 0; i < 3; i++) windowPane(s, -4 + i * 3.2, 2.3, -4.88, 2.6, 2.6, 'day', { frame: '#f2efe8', seed: 9 + i });
  sun(s, '#fff1d6', 2.4, -6, 7, -12, 10);
  const table = (x, z) => { cyl(s, 0.45, 0.45, 0.04, mat('#f4f0e8'), x, 0.74, z, 16); cyl(s, 0.04, 0.04, 0.72, mat('#333'), x, 0.37, z, 8); cyl(s, 0.25, 0.25, 0.03, mat('#333'), x, 0.015, z, 12); };
  (o.tables || [[0, -1.5]]).forEach(([x, z]) => table(x, z));
  const people = addPeople(s, o.people);
  (o.chairs || []).forEach(([x, z, ry]) => chair(s, x, z, ry, '#6b4a33'));
  plant(s, 5.6, -4.2, 1.5); plant(s, -6.2, -4.2, 1.2);
  cyl(s, 0.05, 0.04, 0.1, mat('#fff'), 0.15, 0.81, -1.4, 10); cyl(s, 0.05, 0.04, 0.1, mat('#fff'), -0.2, 0.81, -1.6, 10);
  return { S, s, people };
}
function biolab(drawScreen, o = {}) {
  const S = makeScene({ bg: '#1b2128', hemi: 0.8, sky: '#cfe0f0', ground: '#2a2f36', exposure: 1.4, bloom: 0.6, bloomTh: 0.8, fov: 34 });
  const s = S.s;
  room(s, { w: 12, d: 9, wall: '#4a5664', floor: '#56606a' });
  box(s, 6, 0.08, 1.2, mat('#d9dde2'), 0, 0.92, -3.4); box(s, 6, 0.9, 1.1, mat('#5a6470'), 0, 0.45, -3.4);
  const { tex, blank } = twin(1600, 900, 'screen', drawScreen, o.card);
  board(s, 2.6, 1.46, blank, 0.4, 1.95, -3.75, 0, { monitor: true, frame: false, glow: 0.6 });
  const m = mat('#e8ecf0', { m: .2, r: .4 }); box(s, 0.3, 0.05, 0.4, m, -1.8, 0.98, -3.3); cyl(s, 0.03, 0.03, 0.5, m, -1.8, 1.22, -3.45, 8);
  const tube = cyl(s, 0.05, 0.05, 0.35, mat('#2a2f36'), -1.8, 1.38, -3.3, 10); tube.rotation.x = 0.5;
  for (let i = 0; i < 4; i++) { const x = 1.8 + (i % 2) * 0.35, z = -3.2 + Math.floor(i / 2) * 0.32; cyl(s, 0.14, 0.14, 0.03, new THREE.MeshStandardMaterial({ color: '#dff5ff', transparent: true, opacity: .55 }), x, 0.97, z, 20); cyl(s, 0.12, 0.12, 0.012, glow(['#ff8a3d', '#3dc6c1', '#c98af0', '#f0d36a'][i], 0.8), x, 0.965, z, 20); }
  for (let i = 0; i < 3; i++) box(s, 0.9, 0.06, 1.8, glow('#eef4ff', 2.2), -3 + i * 3, 4.4, -1.5);
  lamp(s, '#eef4ff', 6, 10, 0, 4, -1.5, false);
  dust(s, 200, [-2.5, 2.5, 1, 3.5, -3.6, 0], '#bfe9ff', 0.02, 0.35, 3);
  const people = addPeople(s, o.people);
  return { S, s, tex, people };
}
function living(o = {}) {
  const S = makeScene({ bg: '#1a1714', hemi: 0.6, sky: '#c6c0d8', ground: '#3a2a20', exposure: 1.45, bloom: 0.6, bloomTh: 0.8, fov: 34 });
  const s = S.s;
  room(s, { w: 12, d: 9, wall: '#7a6e60', floor: '#7a5e44' });
  windowPane(s, 3.6, 2.3, -4.38, 2.6, 2.0, 'night', { frame: '#e6e0d6', seed: 12 });
  sofa(s, -0.6, -2.3, 0, '#5d6a74');
  box(s, 1.2, 0.36, 0.6, mat('#4a3424'), -0.6, 0.18, -1.0);
  cyl(s, 0.02, 0.02, 1.6, mat('#222'), 2.0, 0.8, -3.2, 6); cyl(s, 0.22, 0.28, 0.3, glow('#ffd9a0', 1.2), 2.0, 1.7, -3.2, 14);
  lamp(s, '#ffbf7a', 9, 7, 2.0, 1.6, -3.0, true);
  box(s, 2.2, 1.8, 0.4, mat('#4a3424'), -4.4, 0.9, -4.1); for (let k = 0; k < 3; k++) box(s, 2.1, 0.03, 0.38, mat('#3a281c'), -4.4, 0.4 + k * 0.5, -4.08);
  plant(s, 4.9, -3.8, 1.3);
  const people = addPeople(s, o.people);
  dust(s, 160, [-3, 3, 0.6, 3, -3.5, 0.5], '#ffe2b0', 0.025, 0.35, 6);
  return { S, s, people };
}
function filmset(o = {}) {
  const S = makeScene({ bg: '#0c0d10', hemi: 0.5, exposure: 1.4, bloom: 0.5, bloomTh: 0.85, fov: 32, fog: ['#0c0d10', 14, 30] });
  const s = S.s;
  box(s, 20, 0.2, 20, mat('#2a2a2c'), 0, -0.1, 0);
  box(s, 6, 3.6, 0.15, mat('#8a7a64'), 0, 1.8, -3); windowPane(s, 1.4, 2.0, -2.9, 1.4, 1.2, 'dusk', { frame: '#5a4a3a', seed: 2 });
  for (const [x, z, ry] of [[-3.6, 1.0, -0.6], [3.8, 0.8, 0.6]]) { cyl(s, 0.03, 0.03, 2.4, mat('#222'), x, 1.2, z, 6); box(s, 0.5, 0.4, 0.5, mat('#1a1a1a'), x, 2.5, z, ry); box(s, 0.42, 0.32, 0.02, glow('#fff6e2', 1.2), x - Math.sin(ry) * 0.26, 2.5, z - Math.cos(ry) * 0.26, ry); }
  const key = new THREE.SpotLight('#fff1d8', 14, 16, 0.5, 0.5, 1.2); key.position.set(-3.4, 2.6, 1.2); key.target.position.set(0, 1.3, -1.5); key.castShadow = true; s.add(key, key.target);
  const fill = new THREE.SpotLight('#cfe0ff', 6, 16, 0.6, 0.6, 1.2); fill.position.set(3.6, 2.4, 1.0); fill.target.position.set(0, 1.3, -1.5); s.add(fill, fill.target);
  const cg = new THREE.Group(); cg.position.set(1.6, 0, 2.8); cg.rotation.y = 0.5; s.add(cg);
  for (let k = 0; k < 3; k++) { const l = cyl(cg, 0.02, 0.02, 1.3, mat('#333'), Math.cos(k * 2.1) * 0.25, 0.62, Math.sin(k * 2.1) * 0.25, 6); l.rotation.z = Math.cos(k * 2.1) * 0.35; l.rotation.x = -Math.sin(k * 2.1) * 0.35; }
  box(cg, 0.36, 0.3, 0.6, mat('#1d1d1d'), 0, 1.4, 0); cyl(cg, 0.09, 0.11, 0.3, mat('#111'), 0, 1.42, -0.42, 12).rotation.x = Math.PI / 2;
  cyl(cg, 0.16, 0.16, 0.05, mat('#151515'), 0.12, 1.7, 0.1, 16).rotation.z = Math.PI / 2; cyl(cg, 0.16, 0.16, 0.05, mat('#151515'), 0.12, 1.7, -0.25, 16).rotation.z = Math.PI / 2;
  const people = addPeople(s, o.people);
  dust(s, 300, [-2, 2, 0.5, 3, -2.5, 1.5], '#fff2d6', 0.03, 0.45, 13);
  return { S, s, people };
}
function editroom() {
  const S = makeScene({ bg: '#15120e', hemi: 0.6, exposure: 1.25, bloom: 0.25, bloomTh: 0.95, fov: 32 });
  const s = S.s;
  room(s, { w: 10, d: 8, wall: '#5a4e42', floor: '#3a2e24' });
  desk(s, 0, -2.2, 0, { w: 3.0, d: 1.2 });
  box(s, 1.6, 0.04, 0.8, mat('#3a3028'), 0, 0.81, -2.2);
  lamp(s, '#ffe7c0', 2.5, 4, 0, 1.4, -2.0, false);
  for (const [x, z] of [[-1.2, -2.4], [1.25, -2.4]]) { cyl(s, 0.32, 0.32, 0.04, mat('#9aa0a6', { m: .7, r: .3 }), x, 0.85, z, 24); for (let k = 0; k < 6; k++) box(s, 0.05, 0.05, 0.5, mat('#3a3a3a'), x, 0.875, z, k * Math.PI / 6); cyl(s, 0.22, 0.22, 0.045, mat('#1a1410'), x, 0.86, z, 24); }
  const sc = new THREE.Group(); s.add(sc); sc.position.set(0.9, 0.84, -1.75);
  box(sc, 0.32, 0.01, 0.03, mat('#cfd3d8', { m: .8, r: .2 }), 0.12, 0, 0).rotation.y = 0.15; box(sc, 0.32, 0.01, 0.03, mat('#cfd3d8', { m: .8, r: .2 }), 0.12, 0.01, 0).rotation.y = -0.15;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 14), mat('#1f1f1f')); ring.rotation.x = Math.PI / 2; ring.position.set(-0.08, 0.01, 0.04); sc.add(ring); const ring2 = ring.clone(); ring2.position.z = -0.04; sc.add(ring2);
  cyl(s, 0.06, 0.07, 0.12, mat('#6b3a1a'), -0.9, 0.86, -1.8, 10); box(s, 0.16, 0.04, 0.12, mat('#2a1a10'), -0.9, 0.81, -1.8);
  return { S, s, scissors: sc };
}

// ================================================================== シーン定義
const SC = [];
// 0-3 プロローグ（試作のまま）
SC.push({ build: theater }, { build: office }, { build: washitsu }, { build: street });

// 4 第1章：地球儀に168の点
SC.push({ build() {
  const dots = []; const r = rng(168); for (let i = 0; i < 168; i++) dots.push([0.08 + r() * 0.85, 0.15 + r() * 0.65, '#ffcf6b', 5]);
  const L = lab((g, W, H, T) => { D.title(g, T, 80, 120, '168の文化を調べた', 64); D.text(g, T, 80, 200, '2015年　アメリカの研究チーム', 40, { color: T.dim }); D.text(g, T, 80, 330, '問い：恋人同士のキスはあるか？', 52, { color: T.accent }); }, { dots, card: { show: t => t > 3.4 && t < 5, w: 900, y: 120 } });
  const tex = L.globe.userData.sphere.material.map;
  return { ...L.S, update(t, dur) { L.tex.redraw(); if (tex.redraw) tex.redraw(clamp((t - 3) / 5)); L.globe.rotation.y = t * 0.12;
    shots(L.S.cam, t, dur, [[0, [-0.4, 1.9, 2.6], [-1.0, 1.6, 0.8], [-2.0, 1.3, -2.4], [-2.2, 1.2, -2.3], 34], [5.0, [-1.4, 1.4, -0.9], [-1.7, 1.35, -1.25], [-2.3, 1.2, -2.3], [-2.3, 1.2, -2.3], 30]]);
    const a = clamp((t - 5) / .5);
    return chapterCard(t, 'Chapter 1', 'キスしない世界の半分') + (t > 5 ? big(1240, 240, `${Math.round(168 * clamp((t - 3) / 5))}`, { size: 120, color: '#ffcf6b', op: a }) + label(1250, 390, 'の文化', { size: 40, op: a }) : ''); } }; } });

// 5 77 / 168 = 46%
SC.push({ build() {
  const L = lab((g, W, H, T, k = 0) => { D.title(g, T, 80, 100, '恋人同士のキスが確認できた文化', 54);
    D.people(g, T, 110, 170, 24, 7, 58, 77 / 168, k, T.accent, 'rgba(241,239,230,.25)');
    if (k > 0.9) D.text(g, T, 1180, 860, '77 / 168', 48, { color: T.accent }); });
  return { ...L.S, update(t, dur) { L.tex.redraw(clamp((t - 1.6) / 4)); shots(L.S.cam, t, dur, [[0, [0.6, 2.1, 3.4], [0.5, 2.25, 2.4], [0.4, 2.3, -4.3], [0.4, 2.35, -4.3], 36]]);
    const a = clamp((t - 6.8) / .6); return big(1300, 600, '46%', { size: 150, color: '#ffcf6b', op: a }) + label(1310, 790, '半分以上には記録なし', { size: 38, op: a }); } }; } });

// 6 地域別 1
SC.push({ build() {
  const L = lab((g, W, H, T, k = 0) => { D.title(g, T, 80, 110, '恋人同士のキスがある文化の割合', 56);
    D.hbars(g, T, 480, 210, 900, [{ label: '中東', v: 100, txt: '100%' }, { label: 'アジア', v: 73, txt: '73%' }, { label: 'ヨーロッパ', v: 70, txt: '70%' }, { label: '北米', v: 55, txt: '55%' }], 115, k, { bh: 80, gap: 62, ls: 46, vs: 50 }); },
    { people: [{ at: [-3.0, 0, -2.4], ry: 0.6, top: '#7a3b2e', hairStyle: 'long', hair: '#3a2418' }] });
  return { ...L.S, update(t, dur) { L.tex.redraw(clamp((t - 0.8) / 7)); shots(L.S.cam, t, dur, [[0, [-1.2, 1.8, 3.2], [-0.4, 1.9, 2.4], [0.2, 2.2, -4.3], [0.4, 2.3, -4.3], 36], [6.2, [1.8, 2.0, 0.6], [1.2, 2.1, 0.2], [0.3, 2.3, -4.3], [0.4, 2.3, -4.3], 32]]); return note('Jankowiak et al. (2015)'); } }; } });

// 7 地域別 2（ゼロ）
SC.push({ build() {
  const L = lab((g, W, H, T, k = 0) => { D.title(g, T, 80, 110, 'キスの報告がなかった地域', 56);
    ['中米', 'サハラ以南アフリカの狩猟採集民', 'ニューギニアの狩猟採集民', 'アマゾンの狩猟採集民'].forEach((s0, i) => { const a = clamp(k * 5 - i); if (a <= 0) return; D.text(g, T, 120, 260 + i * 130, s0, 46, { a }); D.text(g, T, 1380, 260 + i * 130, '0', 72, { color: T.red, a }); }); });
  return { ...L.S, update(t, dur) { L.tex.redraw(clamp((t - 0.5) / 6)); shots(L.S.cam, t, dur, [[0, [0.4, 2.2, 2.0], [0.1, 2.3, 1.2], [0.4, 2.3, -4.3], [0.4, 2.3, -4.3], 38]]); return note('Jankowiak et al. (2015)'); } }; } });

// 8 トロブリアンド諸島（夕暮れの島）
SC.push({ build() {
  const S = makeScene({ bg: '#2a2350', hemi: 0.75, sky: '#f0a46a', ground: '#1a2a3a', exposure: 1.35, bloom: 0.5, bloomTh: 0.85, fov: 36, fog: ['#4a3a5a', 20, 70] });
  const s = S.s;
  const skyTex = canvasTex(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1d1840'); gr.addColorStop(0.55, '#7a4a78'); gr.addColorStop(0.8, '#f0a46a'); gr.addColorStop(1, '#ffd9a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  s.add(new THREE.Mesh(new THREE.SphereGeometry(90, 24, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })));
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(300, 300, 60, 60), new THREE.MeshStandardMaterial({ color: '#2a4a6a', roughness: .3, metalness: .2, flatShading: true })); sea.rotation.x = -Math.PI / 2; s.add(sea);
  const isl = new THREE.Mesh(new THREE.SphereGeometry(6, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat('#c9b07a')); isl.scale.y = 0.18; isl.position.set(0, -0.1, -4); isl.receiveShadow = true; s.add(isl);
  const palm = (x, z, h, lean) => { const g = new THREE.Group(); g.position.set(x, 0.6, z); g.rotation.z = lean; s.add(g); for (let i = 0; i < 6; i++) cyl(g, 0.09, 0.11, h / 6, mat('#5a4030'), Math.sin(i * 0.3) * 0.1 * i, i * h / 6, 0, 6);
    for (let k = 0; k < 7; k++) { const l = box(g, 1.6, 0.04, 0.3, mat('#2f6a3a'), 0.6 * Math.cos(k * 0.9), h, 0.6 * Math.sin(k * 0.9), -k * 0.9); l.rotation.z = -0.35; } };
  palm(-2.6, -4.5, 4, 0.15); palm(-1.6, -5.5, 3.4, -0.1); palm(3.2, -5, 4.2, -0.2);
  const hut = new THREE.Group(); hut.position.set(1.5, 0.6, -6); s.add(hut); box(hut, 1.6, 1.0, 1.4, mat('#8a6a44'), 0, 0.5, 0); const rf = cyl(hut, 0.01, 1.3, 1.0, mat('#a68a50'), 0, 1.5, 0, 4); rf.rotation.y = Math.PI / 4;
  const a = human(s, { skin: '#8a5a3a', hair: '#1a1410', top: '#a0522d', bottom: '#5a3a20' }); a.position.set(-0.6, 0.6, -3.0); a.rotation.y = 0.5;
  const b = human(s, { skin: '#7a4e32', hair: '#1a1410', top: '#c98a40', bottom: '#5a3a20', hairStyle: 'long' }); b.position.set(0.3, 0.6, -3.1); b.rotation.y = -0.6;
  sun(s, '#ffb070', 2.2, -20, 8, -30, 14);
  const fire = ball(s, 0.1, glow('#ff8a3d', 1.6), 1.0, 0.72, -3.4, 0); lamp(s, '#ff8a3d', 2.5, 4, 1.0, 1.0, -3.4, false);
  return { ...S, update(t, dur) { const v = sea.geometry.attributes.position; for (let i = 0; i < v.count; i++) { const x = v.getX(i), y = v.getY(i); v.setZ(i, Math.sin(x * 0.3 + t) * 0.08 + Math.cos(y * 0.25 + t * 0.8) * 0.08); } v.needsUpdate = true;
    fire.scale.setScalar(1 + 0.15 * Math.sin(t * 13));
    shots(S.cam, t, dur, [[0, [6, 2.4, 6], [3.5, 2.0, 3.6], [-0.2, 1.4, -3.5], [-0.1, 1.3, -3.2], 36], [7.4, [-2.6, 1.6, 0.4], [-2.1, 1.5, -0.4], [0, 1.4, -3.4], [0, 1.4, -3.3], 30]]);
    const a2 = clamp((t - 2.0) / .6); return label(1060, 250, '「つまらなくて、馬鹿げた遊び」', { serif: 1, size: 54, op: a2 }) + label(1070, 340, 'トロブリアンド諸島の人々（キスについて）', { size: 28, op: a2 * .8, w: 500 }) + note('SAPIENS (Jankowiak & Garcia)'); } }; } });

// 9 社会の複雑さ ↗
SC.push({ build() {
  const L = lab((g, W, H, T, k = 0) => { D.title(g, T, 80, 100, '社会の複雑さとキス（イメージ）', 54);
    const x0 = 200, y0 = 780, w = 1200, h = 560; g.strokeStyle = T.dim; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y0 - h); g.lineTo(x0, y0); g.lineTo(x0 + w, y0); g.stroke();
    D.text(g, T, x0 + w, y0 + 60, '身分・階級が複雑 →', 38, { align: 'right', color: T.dim }); D.text(g, T, x0 + 10, y0 - h - 20, '↑ キスがある', 38, { color: T.dim });
    const r = rng(2); for (let i = 0; i < 40; i++) { const u = r(); const v = clamp(u * 0.8 + (r() - .5) * 0.35); if (i / 40 > k * 1.3) break; g.fillStyle = 'rgba(241,239,230,.7)'; g.beginPath(); g.arc(x0 + 40 + u * (w - 80), y0 - 40 - v * (h - 80), 10, 0, Math.PI * 2); g.fill(); }
    if (k > .6) { const q = clamp((k - .6) / .4); D.arrow(g, x0 + 80, y0 - 80, x0 + 80 + (w - 200) * q, y0 - 80 - (h - 200) * q, T.accent, 1, 10); } });
  return { ...L.S, update(t, dur) { L.tex.redraw(clamp((t - 0.3) / 7)); shots(L.S.cam, t, dur, [[0, [-0.8, 2.1, 2.2], [0.0, 2.3, 1.6], [0.4, 2.3, -4.3], [0.4, 2.3, -4.3], 38]]);
    return label(1060, 780, 'キスは、文明とともに広がった？', { serif: 1, size: 48, op: clamp((t - 6.1) / .6) }); } }; } });

// 10 メソポタミアの粘土板
SC.push({ build() {
  const M = museum(it => { const g0 = new THREE.Group(); g0.position.y = 0.5; g0.rotation.x = 0.5; it.add(g0); box(g0, 0.5, 0.06, 0.36, mat('#b0875a'), 0, 0, 0);
    const tx = canvasTex(512, 360, (g, w, h) => { g.fillStyle = '#b0875a'; g.fillRect(0, 0, w, h); const r = rng(4); g.fillStyle = '#6a4a2a'; for (let row = 0; row < 9; row++) for (let i = 0; i < 18; i++) { const x = 20 + i * 26 + r() * 6, y = 30 + row * 36; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 14, y + 4); g.lineTo(x, y + 9); g.fill(); g.fillRect(x + 12, y + 2, 8, 3); } });
    const top = plane(g0, 0.48, 0.34, new THREE.MeshStandardMaterial({ map: tx, roughness: .95 }), 0, 0.031, 0); top.rotation.x = -Math.PI / 2; });
  return { ...M.S, update(t, dur) { M.item.rotation.y = t * 0.1; shots(M.S.cam, t, dur, [[0, [2.6, 2.0, 2.6], [1.6, 1.8, 1.2], [0, 1.4, -1.5], [0, 1.45, -1.5], 32], [4.3, [0.5, 1.9, -0.6], [0.3, 1.85, -0.8], [0, 1.5, -1.5], [0, 1.5, -1.5], 28]]);
    const a = clamp((t - 0.8) / .6); return big(110, 140, '紀元前2500年', { size: 72, op: a }) + label(116, 250, 'メソポタミア ― 記録に残る最古のキス', { size: 34, op: a, w: 500 }) + note('Arbøll & Rasmussen (2023) Science'); } }; } });

// 11 古代ローマの胸像
SC.push({ build() {
  const M = museum(it => { const st = mat('#e6e1d6', { r: .7 }); cyl(it, 0.16, 0.2, 0.12, st, 0, 0.56, 0, 12); const b = cyl(it, 0.18, 0.13, 0.28, st, 0, 0.75, 0, 10); b.scale.z = .6;
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), new THREE.MeshStandardMaterial({ color: '#e6e1d6', roughness: .7 })); h.position.set(0, 1.0, 0); h.scale.set(.92, 1.1, 1); h.castShadow = true; it.add(h);
    for (let k = 0; k < 12; k++) { const lf = ball(it, 0.035, mat('#c9a43a', { m: .6, r: .3 }), Math.cos(k / 11 * Math.PI) * 0.13, 1.08 + Math.sin(k / 11 * Math.PI) * 0.02, -0.02 - Math.sin(k / 11 * Math.PI) * 0.05, 0); lf.scale.set(1, .5, .5); } }, { wall: '#4a3a34' });
  return { ...M.S, update(t, dur) { shots(M.S.cam, t, dur, [[0, [1.8, 2.0, 1.6], [1.0, 1.95, 0.5], [0, 1.9, -1.5], [0, 1.95, -1.5], 30], [6.2, [-0.9, 2.0, -0.3], [-0.6, 2.0, -0.6], [0, 1.95, -1.5], [0, 1.95, -1.5], 26]]);
    const a = clamp((t - 1.2) / .6), b = clamp((t - 6.3) / .5); return big(110, 140, '古代ローマ', { size: 64, op: a }) + label(116, 236, '皇帝ティベリウス：公式の場でのキスを禁止しようとした', { size: 32, op: a, w: 500 }) + label(116, 300, '理由：口の病気がうつるから？', { size: 32, op: b, color: '#ff8a3d' }) + note('Smithsonian Magazine (2023)'); } }; } });

// 12 系統樹
SC.push({ build() {
  const L = lab((g, W, H, T, k = 0) => { D.title(g, T, 80, 90, 'キスはいつ生まれたか', 54);
    const root = [200, 820]; const tips = [['テナガザル', 0.12, false], ['オランウータン', 0.3, true], ['ゴリラ', 0.48, true], ['チンパンジー', 0.66, true], ['ボノボ', 0.8, true], ['ヒト', 0.95, true]];
    g.lineWidth = 6; g.lineCap = 'round';
    tips.forEach(([n, f, kiss], i) => { const tx = 200 + f * 1250, ty = 200; const a = clamp(k * 6 - i * 0.8); if (a <= 0) return; const on = kiss && k > .75; g.globalAlpha = a; g.strokeStyle = on ? T.accent : T.fg;
      const bx = 200 + f * 600; g.beginPath(); g.moveTo(...root); g.lineTo(bx, 820 - f * 300); g.lineTo(tx, ty + 40); g.stroke(); g.globalAlpha = 1; D.text(g, T, tx, ty, n, 34, { align: 'center', color: on ? T.accent : T.fg, a }); });
    if (k > .8) { g.fillStyle = T.accent; g.beginPath(); g.arc(320, 760, 18, 0, Math.PI * 2); g.fill(); D.text(g, T, 360, 830, '2150万〜1690万年前', 44, { color: T.accent }); } });
  return { ...L.S, update(t, dur) { L.tex.redraw(clamp((t - 0.5) / 9)); shots(L.S.cam, t, dur, [[0, [2.4, 2.2, 3.0], [1.4, 2.3, 2.2], [0.3, 2.3, -4.3], [0.4, 2.3, -4.3], 36], [8.0, [-0.6, 2.0, 0.9], [-0.2, 2.1, 0.4], [0.2, 2.1, -4.3], [0.3, 2.2, -4.3], 30]]); return note('Brindle et al. (2025) Oxford'); } }; } });

// 13 サピエンスとネアンデルタール（焚き火）
SC.push({ build() {
  const S = makeScene({ bg: '#0b0d14', hemi: 0.4, sky: '#3a4a7a', ground: '#1a120c', exposure: 1.55, bloom: 0.9, bloomTh: 0.65, fov: 34, fog: ['#0b0d14', 8, 24] });
  const s = S.s; box(s, 30, 0.2, 30, mat('#3a2e24'), 0, -0.1, 0);
  const r = rng(6); for (let i = 0; i < 26; i++) { const rk = ball(s, 0.3 + r() * 0.6, mat('#4a4038'), (r() - .5) * 20, 0.1, -4 - r() * 10, 0); rk.scale.y = 0.6; }
  const stars = dust(s, 400, [-40, 40, 8, 30, -40, -20], '#ffffff', 0.25, 0.8, 4); stars.material.fog = false;
  for (let i = 0; i < 6; i++) { const lg = cyl(s, 0.05, 0.05, 0.7, mat('#4a3020'), 0, 0.06, -1.5, 6); lg.rotation.z = Math.PI / 2; lg.rotation.y = i * Math.PI / 3; }
  const fire = new THREE.Group(); fire.position.set(0, 0.15, -1.5); s.add(fire); for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.16 - i * 0.03, 0.5 - i * 0.08, 7), glow(['#ff6a2a', '#ff9a3a', '#ffcf5a', '#fff2a0'][i], 1.6)); f.position.y = 0.2; fire.add(f); }
  const fl = lamp(s, '#ff8a3d', 7, 9, 0, 0.8, -1.5, true);
  const sap = human(s, { skin: '#c79a74', hair: '#2a1a10', top: '#7a5a3a', bottom: '#5a4028', hairStyle: 'long' }); sap.position.set(-0.9, 0, -1.4); sap.rotation.y = Math.PI / 2 + 0.3;
  const nea = human(s, { skin: '#d4a07a', hair: '#5a3a20', top: '#6a4a2a', bottom: '#4a3420', scale: 0.95 }); nea.position.set(0.9, 0, -1.6); nea.rotation.y = -Math.PI / 2 - 0.2; nea.userData.head.scale.set(1.12, 1.0, 1.12);
  const mic = dust(s, 120, [-0.7, 0.7, 1.3, 1.7, -1.7, -1.3], '#8fe0d8', 0.035, 0.9, 8);
  return { ...S, update(t, dur) { fire.children.forEach((f, i) => f.scale.set(1 + .15 * Math.sin(t * 11 + i), 1 + .25 * Math.sin(t * 9 + i * 2), 1)); if (fl) fl.intensity = 7 * (0.9 + 0.1 * Math.sin(t * 13));
    const a = mic.geometry.attributes.position.array; for (let i = 0; i < 120; i++) { a[i * 3] = Math.sin(t * 0.8 + i * 0.7) * 0.75; a[i * 3 + 1] = 1.5 + Math.sin(t * 1.3 + i) * 0.12; a[i * 3 + 2] = -1.5 + Math.cos(i * 1.7) * 0.15; } mic.geometry.attributes.position.needsUpdate = true;
    shots(S.cam, t, dur, [[0, [0.2, 1.4, 3.6], [0.1, 1.5, 2.4], [0, 1.2, -1.5], [0, 1.3, -1.5], 34], [6.0, [2.2, 1.5, 0.4], [1.8, 1.55, -0.2], [0, 1.4, -1.5], [0, 1.4, -1.5], 30]]);
    return label(110, 120, 'ホモ・サピエンス', { size: 36, color: '#ff8a3d', op: clamp((t - .5) / .5) }) + label(1440, 120, 'ネアンデルタール人', { size: 36, color: '#3dc6c1', op: clamp((t - 1) / .5) }) + label(110, 190, '口の中の細菌の一部を共有していた', { size: 30, op: clamp((t - 2) / .6), w: 500 }); } }; } });

// 14 唇と？
SC.push({ build() {
  const L = lab((g, W, H, T, k = 0) => { D.title(g, T, 80, 100, '人間より古い行動なのに……', 54);
    D.text(g, T, 380, 520, '人類の文化の半分は', 60, { color: T.dim }); D.text(g, T, 380, 620, 'キスをしない', 80, { color: T.accent });
    if (k > .5) D.text(g, T, 1250, 640, '？', 260, { color: T.fg, a: clamp((k - .5) * 3) }); });
  return { ...L.S, update(t, dur) { L.tex.redraw(clamp((t - 0.5) / 7)); shots(L.S.cam, t, dur, [[0, [3.0, 1.9, 1.4], [2.0, 2.1, 0.8], [0.3, 2.3, -4.3], [0.4, 2.3, -4.3], 36], [6.6, [0.4, 2.3, 0.6], [0.4, 2.35, -0.6], [0.4, 2.35, -4.3], [0.4, 2.35, -4.3], 34]]);
    return t > 6.6 ? label(640, 780, 'キスは、何のためにあったのか', { serif: 1, size: 52, op: clamp((t - 6.8) / .6) }) : ''; } }; } });

// 15 第2章：カフェの学生たち
SC.push({ build() {
  const C = cafe({ tables: [[0, -1.5], [-3, -2.5], [3, -2.2]], chairs: [[-0.6, -1.5, Math.PI / 2], [0.6, -1.5, -Math.PI / 2]],
    people: [{ pose: 'sit', at: [-0.62, 0, -1.5], ry: Math.PI / 2, top: '#c0574a', hairStyle: 'long', hair: '#3a2418' }, { pose: 'sit', at: [0.62, 0, -1.5], ry: -Math.PI / 2, top: '#3a5a7a' },
      { at: [-3.4, 0, -2.0], ry: 0.4, top: '#6a7a4a', hairStyle: 'bun' }, { at: [3.4, 0, -2.6], ry: -0.5, top: '#4a4a6a' }, { at: [2.4, 0, -2.0], ry: -0.9, top: '#b08a4a', hairStyle: 'long', hair: '#5a3a20' }] });
  return { ...C.S, update(t, dur) { shots(C.S.cam, t, dur, [[0, [0.8, 1.6, 4.4], [0.3, 1.5, 3.0], [0, 1.1, -1.6], [0, 1.1, -1.6], 36]]);
    return chapterCard(t, 'Chapter 2', '唇は何を測っているのか') + (t > 3.4 ? label(110, 120, 'アメリカの大学生 1,041人', { size: 44, op: clamp((t - 3.4) / .5) }) + label(116, 190, '「最初のキスで冷めたことはある？」', { size: 34, op: clamp((t - 4.4) / .5), w: 500, serif: 1 }) : ''); } }; } });

// 16 男性59% 女性66%
SC.push({ build() {
  const C = cafe({ people: [{ pose: 'sit', at: [-0.62, 0, -1.5], ry: Math.PI / 2, top: '#c0574a', hairStyle: 'long', hair: '#3a2418' }], chairs: [[-0.6, -1.5, Math.PI / 2]] });
  const { tex: tx, blank: txb } = twin(640, 1360, 'phone', (g, W, H, T, k = 0) => { D.text(g, T, 40, 90, 'アンケート結果', 44); D.text(g, T, 40, 150, '最初のキスで冷めた経験', 30, { color: T.dim });
    D.vbars(g, T, 80, 260, 480, 800, [{ label: '男性', v: 59, c: T.accent2, txt: '59%' }, { label: '女性', v: 66, c: T.accent, txt: '66%' }], 80, k, { gap: 100, ls: 38, vs: 60 }); }, { x: 1440, y: 70, w: 360 });
  const ph = phone(C.s, txb, 0.0, 1.05, -1.3, 1.2); ph.rotation.x = -0.9; ph.rotation.y = -0.4;
  return { ...C.S, update(t, dur) { tx.redraw(clamp((t - 0.8) / 4)); shots(C.S.cam, t, dur, [[0, [0.75, 1.85, 0.0], [0.55, 1.75, -0.35], [0.0, 1.05, -1.3], [0.0, 1.05, -1.3], 32], [4.8, [1.2, 1.5, 0.6], [0.9, 1.45, 0.2], [-0.3, 1.0, -1.4], [-0.3, 1.0, -1.4], 34]]);
    return (t > 4.8 ? label(110, 120, 'たった一度のキスが、恋を終わらせる', { serif: 1, size: 50, op: clamp((t - 5) / .5) }) : '') + note('Hughes, Harrison & Gallup (2007)'); } }; } });

// 17 天秤
SC.push({ build() {
  const L = lab(() => {}, { card: { show: () => false } });
  const s = L.s; const bal = new THREE.Group(); bal.position.set(-1.6, 0.79, -2.2); s.add(bal); const br = mat('#b08a4a', { m: .7, r: .3 });
  cyl(bal, 0.12, 0.15, 0.04, br, 0, 0.02, 0, 16); cyl(bal, 0.02, 0.02, 0.6, br, 0, 0.32, 0, 8); const beamG = new THREE.Group(); beamG.position.y = 0.62; bal.add(beamG); box(beamG, 0.8, 0.025, 0.03, br, 0, 0, 0);
  const pans = [-1, 1].map(sx => { const pg = new THREE.Group(); pg.position.x = sx * 0.38; beamG.add(pg); cyl(pg, 0.004, 0.004, 0.25, br, 0, -0.125, 0, 4); cyl(pg, 0.12, 0.09, 0.03, br, 0, -0.26, 0, 16); return pg; });
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.025, 8, 16), glow('#e0564b', .8)); lip.scale.y = 0.55; lip.position.set(0, -0.2, 0); pans[0].add(lip);
  const fw = human(s, { top: '#c0574a', hairStyle: 'long', hair: '#3a2418', scale: 0.3 }); fw.position.set(-2.18, 0.82, -2.35);
  const mm = human(s, { top: '#3a5a7a', scale: 0.3 }); mm.position.set(-1.02, 0.82, -2.35);
  return { ...L.S, update(t, dur) { beamG.rotation.z = 0.32 * easeOut(clamp((t - 1.5) / 2)); pans.forEach(p => p.rotation.z = -beamG.rotation.z);
    shots(L.S.cam, t, dur, [[0, [-0.8, 1.35, -0.6], [-1.1, 1.3, -0.9], [-1.6, 1.3, -2.2], [-1.6, 1.3, -2.2], 34]]);
    return label(110, 120, '女性のほうが、キスを重視する', { serif: 1, size: 50, op: clamp((t - .5) / .5) }) + label(116, 200, '最初のキスで、相手への気持ちが変わりやすい', { size: 32, op: clamp((t - 2.5) / .5), w: 500 }) + note('Wlodarski & Dunbar (2013) N=900+'); } }; } });

// 18 関所（門）
SC.push({ build() {
  const S = makeScene({ bg: '#c9d8e6', hemi: 1.0, sky: '#dfe9f5', ground: '#6b5a48', exposure: 1.2, bloom: 0.35, bloomTh: 0.9, fov: 36, fog: ['#c9d8e6', 14, 40] });
  const s = S.s; box(s, 40, 0.2, 40, mat('#8aa86a'), 0, -0.1, 0); box(s, 2.4, 0.02, 40, mat('#c8b48a'), 0, 0.01, 0);
  const w = mat('#6a4a2a'); cyl(s, 0.14, 0.16, 3, w, -1.4, 1.5, -3, 8); cyl(s, 0.14, 0.16, 3, w, 1.4, 1.5, -3, 8); box(s, 3.6, 0.25, 0.3, w, 0, 3.0, -3); box(s, 3.2, 0.18, 0.25, w, 0, 2.6, -3);
  const doorL = new THREE.Group(); doorL.position.set(-1.3, 0, -3); s.add(doorL); box(doorL, 1.3, 2.4, 0.1, mat('#8a6a44'), 0.65, 1.2, 0);
  const doorR = new THREE.Group(); doorR.position.set(1.3, 0, -3); s.add(doorR); box(doorR, 1.3, 2.4, 0.1, mat('#8a6a44'), -0.65, 1.2, 0);
  for (let i = 0; i < 8; i++) { const tr = new THREE.Group(); tr.position.set((i % 2 ? 1 : -1) * (5 + (i * 1.7) % 6), 0, -6 - i * 2); s.add(tr); cyl(tr, 0.15, 0.2, 1.4, mat('#5a4030'), 0, 0.7, 0, 6); ball(tr, 1.1, mat('#4f7f45'), 0, 2.0, 0, 0); }
  const f = human(s, { top: '#c0574a', hairStyle: 'long', hair: '#3a2418' }); f.position.set(0.3, 0, -1.4); f.rotation.y = Math.PI;
  const m = human(s, { top: '#3a5a7a' }); m.position.set(-0.4, 0, -0.6); m.rotation.y = Math.PI;
  sun(s, '#fff1d6', 2.4, -6, 10, 6, 12);
  return { ...S, update(t, dur) { const op = easeOut(clamp((t - 6.0) / 2)); doorL.rotation.y = -op * 1.3; doorR.rotation.y = op * 1.3;
    shots(S.cam, t, dur, [[0, [3.4, 1.8, 3.6], [2.4, 1.7, 2.6], [0, 1.4, -2.8], [0, 1.5, -2.9], 36], [5.6, [0.2, 1.6, 2.4], [0.1, 1.6, 1.8], [0, 1.5, -3.0], [0, 1.5, -3.0], 34]]);
    return label(110, 120, 'キスは「関所」', { serif: 1, size: 60, op: clamp((t - .5) / .5) }) + label(116, 210, '女性は、キスなしで体の関係に進むことに消極的', { size: 32, op: clamp((t - 1.5) / .5), w: 500 }) + note('Hughes et al. (2007)'); } }; } });

// 19 使い道の違い
SC.push({ build() {
  const C = cafe({ chairs: [[-0.6, -1.5, Math.PI / 2], [0.6, -1.5, -Math.PI / 2]], people: [{ pose: 'sit', at: [-0.62, 0, -1.5], ry: Math.PI / 2, top: '#c0574a', hairStyle: 'long', hair: '#3a2418' }, { pose: 'sit', at: [0.62, 0, -1.5], ry: -Math.PI / 2, top: '#3a5a7a' }] });
  const ui = (x, y, title, items, c, a) => `<div style="position:absolute;left:${x}px;top:${y}px;opacity:${a};background:rgba(255,255,255,.92);color:#222;border-radius:18px;padding:22px 30px;box-shadow:0 10px 30px rgba(0,0,0,.25);min-width:420px">
    <div style="font-size:28px;color:${c};font-weight:700">${title}</div>${items.map(s => `<div style="font-size:36px;font-weight:700;margin-top:10px">${s}</div>`).join('')}</div>`;
  return { ...C.S, update(t, dur) { shots(C.S.cam, t, dur, [[0, [0, 1.5, 2.6], [0, 1.45, 1.8], [0, 1.15, -1.5], [0, 1.15, -1.5], 34]]);
    return ui(120, 220, '女性にとってのキス', ['本気度チェック ✔'], '#e0564b', clamp((t - 3.4) / .5)) + ui(1300, 220, '男性にとってのキス', ['先に進むため →', 'けんかの仲直り'], '#2e6f8e', clamp((t - 6.9) / .5)) + note('Hughes et al. (2007)'); } }; } });

// 20 2人が近づく（窓辺のシルエット＋匂い）
SC.push({ build() {
  const S = makeScene({ bg: '#2a2236', hemi: 0.5, exposure: 1.5, bloom: 0.9, bloomTh: 0.6, fov: 32 });
  const s = S.s; room(s, { w: 10, d: 8, wall: '#4a4058', floor: '#4a3a32' });
  windowPane(s, 0, 2.0, -3.88, 3.6, 2.6, 'dusk', { frame: '#2a2230', seed: 21 });
  const pt = profileTex('#120e14'); plane(s, 2.6, 2.6, new THREE.MeshBasicMaterial({ map: pt, transparent: true }), 0, 1.75, -3.2);
  const scent = dust(s, 160, [-0.4, 0.4, 2.1, 2.4, -3.15, -3.1], '#3dc6c1', 0.05, 0.9, 7);
  lamp(s, '#ffb070', 3, 8, 0, 2.6, -1, false);
  return { ...S, update(t, dur) { pt.redraw(lerp(200, 70, easeOut(clamp(t / 6)))); const a = scent.geometry.attributes.position.array; for (let i = 0; i < 160; i++) { const u = (i / 160 + t * 0.15) % 1; a[i * 3] = lerp(-0.35, 0.35, u); a[i * 3 + 1] = 2.25 + Math.sin(u * 12 + t * 2) * 0.05; } scent.geometry.attributes.position.needsUpdate = true;
    shots(S.cam, t, dur, [[0, [0, 1.8, 2.6], [0, 1.85, 1.2], [0, 1.9, -3.2], [0, 1.95, -3.2], 34]]);
    return label(110, 120, 'キス＝相手を見極める検査', { serif: 1, size: 52, op: clamp((t - 4.0) / .5) }) + label(116, 200, '息や肌の匂いを、いやでも嗅ぐ', { size: 32, op: clamp((t - 4.6) / .5), w: 500 }); } }; } });

// 21 DNA
SC.push({ build() {
  const B = biolab((g, W, H, T, k = 0) => { D.title(g, T, 80, 100, '匂い ＝ 免疫の遺伝子の名刺？', 56);
    for (let i = 0; i < 2; i++) { const cx = 450 + i * 700; g.strokeStyle = i ? T.accent2 : T.accent; g.lineWidth = 8; for (let s2 = 0; s2 < 2; s2++) { g.beginPath(); for (let y = 0; y < 500; y += 6) { const x = cx + Math.sin(y / 40 + s2 * Math.PI + k * 6) * 90; y ? g.lineTo(x, 220 + y) : g.moveTo(x, 220 + y); } g.stroke(); } }
    D.text(g, T, 800, 520, '≠', 140, { align: 'center', color: T.fg, a: clamp(k * 2) }); D.text(g, T, 800, 820, '自分と違う遺伝子の相手を、鼻で選ぶ？', 44, { align: 'center', color: T.dim }); },
    { people: [{ at: [-1.2, 0, -2.4], ry: 0.3, top: '#f2f2f2', bottom: '#33384a', hairStyle: 'bun', hair: '#2a2018' }] });
  return { ...B.S, update(t, dur) { B.tex.redraw(clamp(t / 6)); shots(B.S.cam, t, dur, [[0, [1.6, 1.9, 1.6], [0.9, 1.95, 0.6], [0.4, 1.9, -3.7], [0.4, 1.95, -3.7], 34], [7.7, [-2.4, 1.7, -0.6], [-2.0, 1.75, -1.0], [0.3, 1.8, -3.7], [0.3, 1.85, -3.7], 32]]);
    return ''; } }; } });

// 22 10秒で8000万個
SC.push({ build() {
  const B = biolab((g, W, H, T, k = 0, t = 0) => { D.title(g, T, 80, 100, '10秒のキスで移る細菌の数', 52);
    const sec = Math.min(10, t * 1.6); D.text(g, T, 120, 420, `${sec.toFixed(1)} 秒`, 110, { color: T.accent2 });
    const n = Math.round(8000 * easeOut(clamp(sec / 10))); D.text(g, T, 1480, 470, `${n.toLocaleString()} 万個`, 150, { align: 'right', color: T.accent });
    const r = rng(1); for (let i = 0; i < 260 * clamp(sec / 10); i++) { g.fillStyle = ['#ff8a3d', '#3dc6c1', '#c98af0', '#f0d36a'][i % 4]; g.globalAlpha = .6; g.beginPath(); g.arc(120 + r() * 1360, 560 + r() * 280, 6 + r() * 6, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; });
  return { ...B.S, update(t, dur) { B.tex.redraw(1, Math.max(0, t - 2.4)); shots(B.S.cam, t, dur, [[0, [-0.8, 1.7, 1.5], [0.0, 1.85, 0.4], [0.4, 1.9, -3.7], [0.4, 1.95, -3.7], 34]]); return note('Kort et al. (2014) Microbiome'); } }; } });

// 23 700種類以上（シャーレ）
SC.push({ build() {
  const B = biolab((g, W, H, T, k = 0) => { D.title(g, T, 80, 100, '口の中の細菌', 56); g.strokeStyle = T.dim; g.lineWidth = 6; g.beginPath(); g.arc(700, 520, 300, 0, Math.PI * 2); g.stroke();
    const r = rng(7); for (let i = 0; i < 700 * clamp(k); i++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 280; g.fillStyle = `hsl(${(r() * 360) | 0},70%,62%)`; g.beginPath(); g.arc(700 + Math.cos(a) * rr, 520 + Math.sin(a) * rr, 5, 0, Math.PI * 2); g.fill(); }
    D.text(g, T, 1080, 540, '700種類以上', 80, { color: T.accent, a: clamp(k * 2 - 1) }); });
  return { ...B.S, update(t, dur) { B.tex.redraw(clamp(t / 3)); shots(B.S.cam, t, dur, [[0, [2.6, 1.3, -1.6], [2.2, 1.25, -2.2], [1.95, 0.97, -3.05], [1.95, 0.97, -3.05], 32], [3.0, [0.5, 1.95, -0.4], [0.45, 1.95, -1.2], [0.4, 1.95, -3.7], [0.4, 1.95, -3.7], 34]]); return ''; } }; } });

// 24 2つの口の細菌が似てくる
SC.push({ build() {
  const B = biolab((g, W, H, T, k = 0) => { D.title(g, T, 80, 100, '1日9回以上キスするカップル', 52);
    const mix = clamp(k); const r = rng(9);
    for (let side = 0; side < 2; side++) { const cx = 520 + side * 560; g.strokeStyle = T.dim; g.lineWidth = 5; g.beginPath(); g.arc(cx, 520, 230, 0, Math.PI * 2); g.stroke();
      for (let i = 0; i < 220; i++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 210; const own = side ? 190 : 25; const hue = r() < mix * 0.5 ? (side ? 25 : 190) : own; g.fillStyle = `hsl(${hue},75%,60%)`; g.beginPath(); g.arc(cx + Math.cos(a) * rr, 520 + Math.sin(a) * rr, 7, 0, Math.PI * 2); g.fill(); } }
    D.text(g, T, 800, 860, `キス ${Math.min(9, Math.floor(k * 10))} 回目`, 46, { align: 'center', color: T.accent }); });
  return { ...B.S, update(t, dur) { B.tex.redraw(clamp(t / 7)); shots(B.S.cam, t, dur, [[0, [0.4, 1.95, 1.0], [0.4, 1.95, 0.0], [0.4, 1.95, -3.7], [0.4, 1.95, -3.7], 34]]);
    return t > 5.3 ? label(110, 780, '相手の体を、少しずつ自分の中に取り込む', { serif: 1, size: 46, op: clamp((t - 5.4) / .5) }) : ''; } }; } });

// 25 日本地図に唇
SC.push({ build() {
  const L = lab((g, W, H, T, k = 0) => { D.title(g, T, 80, 100, 'では、日本人は？', 60);
    g.fillStyle = g.strokeStyle = 'rgba(241,239,230,.85)'; g.lineCap = 'round'; g.lineJoin = 'round';
    g.lineWidth = 78; g.beginPath(); g.moveTo(1040, 300); g.bezierCurveTo(1060, 420, 960, 520, 820, 560); g.quadraticCurveTo(700, 600, 610, 610); g.stroke();
    g.lineWidth = 50; g.beginPath(); g.moveTo(1010, 230); g.lineTo(1040, 310); g.stroke();
    g.beginPath(); g.ellipse(1110, 150, 105, 72, -0.2, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(735, 655, 70, 30, -0.1, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(560, 700, 55, 80, 0.2, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(470, 850, 10, 0, Math.PI * 2); g.arc(440, 880, 8, 0, Math.PI * 2); g.fill();
    if (k > .3) { g.globalAlpha = clamp((k - .3) * 2); g.fillStyle = T.red; g.beginPath(); g.ellipse(860, 470, 80, 34, 0, 0, Math.PI); g.fill(); g.beginPath(); g.moveTo(780, 470); g.quadraticCurveTo(820, 430, 860, 452); g.quadraticCurveTo(900, 430, 940, 470); g.fill(); g.globalAlpha = 1; } });
  return { ...L.S, update(t, dur) { L.tex.redraw(clamp((t - .5) / 3)); shots(L.S.cam, t, dur, [[0, [0.4, 2.3, 2.0], [0.4, 2.35, 0.9], [0.4, 2.35, -4.3], [0.4, 2.35, -4.3], 36]]); return ''; } }; } });

// 和室の巻物（26-29, 33）
function scrollScene(drawScroll, cam, overlay, lay = {}) {
  return { build() { const { flat, ...W0 } = washitsu(); const sc = W0.s.children.find(o => o.geometry && o.geometry.parameters && o.geometry.parameters.width === 1.4 && o.geometry.parameters.height === 0.48);
    const tex = canvasTex(1400, 480, (g, w, h, k = 0) => { g.fillStyle = '#e9dfc4'; g.fillRect(0, 0, w, h); const r = rng(5); g.globalAlpha = .08; for (let i = 0; i < 900; i++) { g.fillStyle = '#6a5a3a'; g.fillRect(r() * w, r() * h, 3, 3); } g.globalAlpha = 1; drawScroll(g, w, h, k); });
    const plain = canvasTex(1400, 480, (g, w, h) => { g.fillStyle = '#e9dfc4'; g.fillRect(0, 0, w, h); const r = rng(9); g.fillStyle = '#2b2520'; for (let c = 0; c < 26; c++) { const x = w - 60 - c * 50; let y = 40; while (y < h - 50) { const hh = 14 + r() * 26; g.globalAlpha = .5 + r() * .3; g.fillRect(x + r() * 6, y, 6 + r() * 8, hh); y += hh + 8 + r() * 10; } } g.globalAlpha = 1; });
    if (sc) sc.material = new THREE.MeshStandardMaterial({ map: plain, roughness: .95, emissive: '#fff', emissiveMap: plain, emissiveIntensity: 0.12 });
    CUR.push(t => (lay.show && !lay.show(t)) ? '' : cardImg(tex.image, lay.x ?? 160, lay.y ?? 200, lay.w ?? 1000, 'border:6px solid #6b3f22;', 6));
    return { ...W0, update(t, dur) { W0.update(t, dur); if (sc) sc.material.emissiveIntensity = 0.12; tex.redraw(clamp(t / (dur * 0.75))); shots(W0.cam, t, dur, cam); return overlay ? overlay(t, dur) : ''; } }; } };
}
const inkT = (g, x, y, s, size = 52, c = '#1e1a16', a = 1) => { g.globalAlpha = a; g.font = `bold ${size}px ${SERIF}`; g.fillStyle = c; g.textAlign = 'center'; g.fillText(s, x, y); g.textAlign = 'left'; g.globalAlpha = 1; };
const camScroll = [[0, [1.6, 1.5, 1.2], [1.0, 1.35, 0.6], [0, 0.4, -0.9], [0, 0.4, -0.9], 34], [5.0, [0.3, 1.25, 0.0], [0.2, 1.15, -0.15], [0, 0.4, -0.9], [0, 0.4, -0.9], 34]];
// 26 第3章
SC.push(scrollScene((g, w, h, k) => { g.fillStyle = '#6a5a4a'; g.fillRect(80, 260, (w - 160) * clamp(k * 1.5), 4); if (k > .3) { g.fillStyle = '#b8261d'; g.beginPath(); g.arc(260, 262, 16, 0, Math.PI * 2); g.fill(); inkT(g, 260, 200, '898年', 56); inkT(g, 260, 340, '紀長谷雄', 40, '#4a3a2a'); inkT(g, 260, 400, '「口吸ひ」', 44, '#b8261d'); } },
  camScroll, (t) => chapterCard(t, 'Chapter 3', '口吸いの国'), { show: t => t > 3.4 }));
// 27 年表
SC.push(scrollScene((g, w, h, k) => { g.fillStyle = '#6a5a4a'; g.fillRect(80, 260, w - 160, 4);
  [[260, '898年', '紀長谷雄'], [600, '1120年ごろ', '今昔物語'], [900, '室町時代', '御伽草子'], [1180, '江戸', '遊郭「おさしみ」']].forEach(([x, a, b], i) => { const al = i === 0 ? 1 : clamp(k * 4 - i + 0.5); if (al <= 0) return; g.globalAlpha = al; g.fillStyle = '#b8261d'; g.beginPath(); g.arc(x, 262, 14, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; inkT(g, x, 200, a, 44, '#1e1a16', al); inkT(g, x, 340, b, 38, '#4a3a2a', al); }); },
  [[0, [0.9, 1.4, 0.6], [-0.4, 1.4, 0.6], [0.2, 0.4, -0.9], [-0.1, 0.4, -0.9], 34]], () => note('大阪大学『待兼山論叢』／百科事典「接吻」')));
// 28 出てくる／出てこない
SC.push(scrollScene((g, w, h, k) => { inkT(g, 360, 90, '口吸いが出てくる', 44); inkT(g, 1040, 90, '出てこない', 44);
  ['日記', '説話（今昔物語）', '狂歌・俳諧'].forEach((s0, i) => inkT(g, 360, 190 + i * 90, s0 + '　○', 44, '#1e1a16', clamp(k * 3 - i * .5)));
  ['源氏物語（恋の物語）', '和歌'].forEach((s0, i) => inkT(g, 1040, 190 + i * 90, s0 + '　×', 44, '#b8261d', clamp(k * 3 - 1.5 - i * .5))); g.fillStyle = '#6a5a4a'; g.fillRect(700, 60, 3, 380); },
  [[0, [0.1, 1.5, 0.5], [0.05, 1.35, 0.1], [0, 0.4, -0.9], [0, 0.4, -0.9], 34]], (t) => t > 5.4 ? label(110, 120, 'ラフカディオ・ハーンも驚いた', { size: 40, op: clamp((t - 5.5) / .5) }) : ''));
// 29 こっそり書かれる言葉
SC.push(scrollScene((g, w, h, k) => { inkT(g, 360, 90, '書き残された', 44); inkT(g, 1040, 90, '語られない', 52, '#b8261d');
  ['日記', '説話', '狂歌・俳諧'].forEach((s0, i) => inkT(g, 360, 190 + i * 90, s0, 44, '#1e1a16', 1 - clamp(k) * .6)); ['恋の物語', '和歌'].forEach((s0, i) => inkT(g, 1040, 190 + i * 90, s0, 44, '#1e1a16', .35)); },
  [[0, [-0.2, 1.3, 0.2], [-0.3, 1.2, 0.0], [0.2, 0.4, -0.9], [0.25, 0.4, -0.9], 32]], (t) => label(1180, 780, 'こっそり書かれる言葉', { serif: 1, size: 46, op: clamp((t - 1) / .5) })));

// 30-31 春画のパネル（人物は描かない）
function shungaPanel(kind) {
  return { build() {
    const { tex: pt, blank: ptb } = twin(1600, 900, 'screen', (g, W, H, T, k = 0) => {
      if (kind === 0) { D.title(g, T, 80, 100, '江戸の春画で、着物を着たまま描かれた割合', 50);
        D.donut(g, T, 480, 500, 220, [{ v: 80, c: T.accent }, { v: 20, c: 'rgba(255,255,255,.12)' }], k); D.text(g, T, 480, 525, '約8割', 80, { align: 'center' }); D.text(g, T, 480, 820, '男女とも', 40, { align: 'center', color: T.dim });
        D.donut(g, T, 1120, 500, 220, [{ v: 90, c: T.accent2 }, { v: 10, c: 'rgba(255,255,255,.12)' }], clamp(k * 1.2 - .2)); D.text(g, T, 1120, 525, '約9割', 80, { align: 'center' }); D.text(g, T, 1120, 820, '女性', 40, { align: 'center', color: T.dim }); }
      else { D.title(g, T, 80, 100, '同じ時代の春画を比べると', 50);
        for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#8a2a3a' : '#2a4a6a'; g.fillRect(220 + i * 60, 220, 60, 420); } g.fillStyle = 'rgba(255,255,255,.15)'; for (let i = 0; i < 30; i++) { g.beginPath(); g.arc(220 + (i * 53) % 360, 220 + (i * 97) % 420, 12, 0, Math.PI * 2); g.fill(); }
        D.text(g, T, 400, 730, '日本：着物を着たまま', 44, { align: 'center', color: T.accent });
        g.globalAlpha = clamp(k * 2); g.fillStyle = 'rgba(232,210,180,.5)'; g.fillRect(1020, 220, 360, 420); g.globalAlpha = 1; D.text(g, T, 1200, 730, '中国：ほとんどが裸', 44, { align: 'center', color: T.dim, a: clamp(k * 2) });
        D.text(g, T, 800, 840, '※明代後期以降の中国春画（色面のみで表現）', 26, { align: 'center', color: T.dim }); } }, { x: 120 });
    const M = museum(it => { box(it, 0.8, 0.55, 0.04, mat('#2a1a10'), 0, 0.6, 0); plane(it, 0.72, 0.47, new THREE.MeshStandardMaterial({ map: canvasTex(256, 170, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#8a2a3a', '#2a4a6a', '#c9a43a', '#3d6b4f'][i % 4]; g.fillRect(i * 32, 0, 32, h); } g.fillStyle = 'rgba(255,240,220,.25)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc((i * 37) % w, (i * 61) % h, 6, 0, Math.PI * 2); g.fill(); } }), roughness: .9 }), 0, 0.6, 0.025); }, { panelTex: ptb, wall: '#4a3a3e' });
    return { ...M.S, update(t, dur) { pt.redraw(clamp((t - 0.6) / 4)); shots(M.S.cam, t, dur, kind === 0 ? [[0, [3.6, 2.0, -1.2], [3.1, 2.1, -2.6], [3.0, 2.2, -5.8], [3.0, 2.2, -5.8], 34]] : [[0, [1.5, 2.1, 0.0], [2.8, 2.2, -3.0], [3.0, 2.2, -5.8], [3.0, 2.2, -5.8], 36]]);
      return note('鈴木堅弘「春画と衣装」日文研'); } }; } };
}
SC.push(shungaPanel(0), shungaPanel(1));

// 32 明治：洋書と「接吻」
SC.push({ build() {
  const S = makeScene({ bg: '#2a2018', hemi: 0.6, exposure: 1.2, bloom: 0.4, bloomTh: 0.9, fov: 32 });
  const s = S.s; room(s, { w: 10, d: 8, wall: '#7a6450', floor: '#5a4030' }); windowPane(s, 2.6, 2.3, -3.88, 1.8, 2.0, 'day', { frame: '#e8e0d0' });
  desk(s, 0, -2.0, 0, { w: 2.2 }); deskLamp(s, -0.8, 0.79, -2.3, { i: 4, metal: '#8a7a5a' }); bookshelf(s, -3.6, -3.6, 0, { seed: 12 });
  const bt = canvasTex(1024, 640, (g, w, h, k = 0) => { g.fillStyle = '#efe6d0'; g.fillRect(0, 0, w, h); g.fillStyle = '#8a7a64'; g.fillRect(w / 2 - 2, 0, 4, h);
    g.font = `italic 34px Georgia,serif`; g.fillStyle = '#3a2e24'; ['CHAPTER IV', 'and then he', 'gave her a', 'tender KISS', 'upon the lips...'].forEach((s0, i) => g.fillText(s0, 60, 90 + i * 60));
    g.font = `bold 120px ${SERIF}`; g.globalAlpha = clamp(k); g.fillStyle = '#b8261d'; g.fillText('接吻', 600, 360); g.font = `40px ${SERIF}`; g.fillText('＝ キス', 640, 440); g.globalAlpha = 1; });
  const btb = canvasTex(1024, 640, (g, w, h) => { g.fillStyle = '#c4b89e'; g.fillRect(0, 0, w, h); g.fillStyle = '#8a7a64'; g.fillRect(w / 2 - 2, 0, 4, h); g.fillStyle = 'rgba(58,46,36,.35)'; for (let i = 0; i < 9; i++) { g.fillRect(60, 70 + i * 60, 380, 10); g.fillRect(580, 70 + i * 60, 380, 10); } });
  paperOn(s, 0.9, 0.56, btb, 0.1, 0.8, -1.9, -0.05);
  CUR.push(t => cardImg(bt.image, 980, 330, 820, '', 8));
  sun(s, '#fff1d6', 1.1, 3, 6, -6, 6);
  return { ...S, update(t, dur) { bt.redraw(clamp((t - 4.0) / 1)); shots(S.cam, t, dur, [[0, [1.8, 1.7, 0.8], [1.0, 1.5, 0.0], [0, 0.8, -1.9], [0.1, 0.8, -1.9], 34], [4.4, [0.3, 1.45, -1.3], [0.2, 1.35, -1.45], [0.1, 0.8, -1.9], [0.1, 0.8, -1.9], 32]]);
    return t < 4.4 ? big(110, 140, '明治', { size: 68, op: clamp((t - .4) / .5) }) + label(116, 240, '「愛の象徴」としてのキスが入ってくる', { size: 34, op: clamp((t - 1) / .5), w: 500 }) : `<div style="position:absolute;left:0;top:0;width:1100px;height:240px;background:linear-gradient(90deg,rgba(10,6,4,.85) 40%,rgba(10,6,4,0))"></div>` + label(110, 120, '1887年ごろ「接吻」が広まる', { serif: 1, size: 52, color: '#ff8a3d', op: clamp((t - 4.5) / .5) }); } }; } });

// 33 1816年の辞書
SC.push(scrollScene((g, w, h, k) => { g.font = `italic 40px Georgia,serif`; g.fillStyle = '#3a2e24'; g.fillText('Doeff-Halma  1816', 80, 90); g.font = `36px Georgia,serif`; g.fillText('Kus  ―', 120, 200);
  inkT(g, 520, 210, '接吻', 80, '#1e1a16', clamp(k * 3)); inkT(g, 900, 210, '→　くちすう', 64, '#b8261d', clamp(k * 3 - 1.2)); inkT(g, 700, 380, 'オランダ語の辞書に初めて登場', 40, '#4a3a2a', clamp(k * 3 - 1.8)); },
  [[0, [0.6, 1.4, 0.4], [0.2, 1.25, 0.0], [0, 0.4, -0.9], [0, 0.4, -0.9], 32]], () => note('九州大学「〈接吻〉の語史」')));

// 34 検閲（フィルムをハサミで）
SC.push({ build() {
  const E = editroom(); const s = E.s;
  const ft = canvasTex(1600, 260, (g, w, h, k = 0) => { g.fillStyle = '#1a1612'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = '#d8d0c0'; g.fillRect(i * 40 + 8, 12, 22, 22); g.fillRect(i * 40 + 8, h - 34, 22, 22); }
    for (let f = 0; f < 6; f++) { const x = 40 + f * 260; g.fillStyle = '#9c917e'; g.fillRect(x, 50, 220, 160); g.fillStyle = '#2a2622'; if (f === 3 || f === 4) { g.beginPath(); g.arc(x + 80, 120, 34, 0, Math.PI * 2); g.arc(x + 140, 120, 34, 0, Math.PI * 2); g.fill(); g.fillRect(x + 50, 150, 120, 60); } else { g.beginPath(); g.arc(x + 110, 110, 26, 0, Math.PI * 2); g.fill(); } }
    const c = clamp(k); if (c > .4) { g.fillStyle = '#1a1612'; g.fillRect(40 + 3 * 260 - 20, 0, 520 * clamp((c - .4) * 3), h); }
  });
  const strip = plane(s, 1.6, 0.26, new THREE.MeshStandardMaterial({ map: ft, roughness: .7, emissive: '#fff', emissiveMap: ft, emissiveIntensity: 0.08 }), 0, 0.845, -2.2); strip.rotation.x = -Math.PI / 2;
  return { ...E.S, update(t, dur) { ft.redraw(clamp((t - 2) / 8)); const c = clamp((t - 3) / 3); E.scissors.position.set(lerp(0.9, 0.25, ease(c)), 0.86, lerp(-1.75, -2.1, ease(c))); E.scissors.rotation.y = Math.sin(t * 8) * 0.15 * (c > 0 && c < 1 ? 1 : 0);
    shots(E.S.cam, t, dur, [[0, [1.4, 1.7, 0.4], [0.9, 1.6, -0.4], [0, 0.82, -2.2], [0.1, 0.82, -2.2], 34], [7.3, [0.35, 1.35, -1.5], [0.3, 1.3, -1.7], [0.3, 0.82, -2.2], [0.3, 0.82, -2.2], 30]]);
    const sa = clamp((t - 7.6) / .3);
    return big(110, 140, '戦前の映画検閲', { size: 60, op: clamp((t - .4) / .5) }) + label(116, 230, '抱き合う場面・同じ寝床の場面を切除', { size: 32, op: clamp((t - 1) / .5), w: 500 }) + note('国立映画アーカイブ「内務省 切除フィルム」')
      + `<div style="position:absolute;left:0;right:0;top:380px;text-align:center;opacity:${sa}"><span class="serif" style="display:inline-block;border:10px solid #c0261e;color:#c0261e;font-size:130px;font-weight:900;padding:0 36px;transform:rotate(-8deg) scale(${1.4 - 0.4 * easeOut(clamp((t - 7.6) / .3))});background:rgba(255,250,240,.9)">風俗</span></div>`; } }; } });

// 35 スクリーンに「風俗」
SC.push({ build() { const T0 = theater();
  return { ...T0, update(t, dur) { T0.update(Math.min(t, 6.2), dur); shots(T0.cam, t, dur, [[0, [0.3, 3.4, 6], [0.2, 3.5, 3.5], [0, 3.8, -13], [0, 3.8, -13], 34]]);
    const a = clamp((t - 2.5) / .4); return `<div style="position:absolute;left:0;right:0;top:360px;text-align:center;opacity:${a}"><span class="serif" style="display:inline-block;border:10px solid #c0261e;color:#c0261e;font-size:150px;font-weight:900;padding:0 40px;transform:rotate(-8deg) scale(${1.4 - 0.4 * easeOut(clamp((t - 2.5) / .3))});background:rgba(255,250,240,.15)">風俗</span></div>`
      + label(110, 120, '人前で見せてはいけないもの', { serif: 1, size: 48, op: clamp((t - 4) / .5) }); } }; } });

// 36 第4章：GHQ
SC.push({ build() { const O = office(); return { ...O, update(t, dur) { O.update(Math.min(t, 3.0), dur); shots(O.cam, t, dur, [[0, [2.8, 2.3, 3.4], [2.0, 2.0, 2.4], [-0.2, 1.3, -1.2], [-0.3, 1.1, -0.2], 32]]);
  return chapterCard(t, 'Chapter 4', '命令されたキス') + (t > 3 ? label(110, 120, '1946年　敗戦の翌年', { size: 40, op: clamp((t - 3) / .5) }) : ''); } }; } });

// 37 撮影所：ガーゼ
SC.push({ build() {
  const F = filmset({ people: [{ at: [-0.34, 0, -1.5], ry: Math.PI / 2, top: '#3a3a44', bottom: '#2a2a30' }, { at: [0.34, 0, -1.5], ry: -Math.PI / 2, top: '#d8c8b0', bottom: '#8a7a6a', hairStyle: 'long', hair: '#1a1410', dress: true }] });
  const gz = plane(F.s, 0.05, 0.05, new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), 0, 1.67, -1.5); gz.rotation.y = Math.PI / 2;
  return { ...F.S, update(t, dur) { const lean = easeOut(clamp((t - 1) / 3)); F.people[0].position.x = -0.34 + 0.12 * lean; F.people[1].position.x = 0.34 - 0.12 * lean;
    gz.visible = t > 6.5;
    shots(F.S.cam, t, dur, [[0, [3.4, 2.2, 3.6], [2.4, 1.9, 2.4], [0, 1.5, -1.5], [0, 1.5, -1.5], 34], [6.5, [0.0, 1.68, 0.2], [0.0, 1.68, -0.5], [0, 1.67, -1.5], [0, 1.67, -1.5], 28]]);
    return big(110, 140, '1946年『はたちの青春』', { size: 56, op: clamp((t - .3) / .5) }) + (t > 6.6 ? label(1160, 560, '← 唇の間にガーゼ', { size: 40, color: '#ff8a3d', op: clamp((t - 6.8) / .5) }) : ''); } }; } });

// 38 おじぎ → キスの国へ
SC.push({ build() {
  const F = filmset({ people: [{ at: [-0.55, 0, -1.5], ry: Math.PI / 2, top: '#3a3a44' }, { at: [0.55, 0, -1.5], ry: -Math.PI / 2, top: '#d8c8b0', hairStyle: 'long', hair: '#1a1410', dress: true }] });
  return { ...F.S, update(t, dur) { const b = Math.sin(clamp(t / 2.4) * Math.PI) * (t < 2.6 ? 1 : 0);
    F.people[0].rotation.z = -0.35 * b; F.people[1].rotation.z = 0.35 * b;
    const m = easeOut(clamp((t - 3) / 2.5)); F.people[0].position.x = -0.55 + 0.25 * m; F.people[1].position.x = 0.55 - 0.25 * m;
    shots(F.S.cam, t, dur, [[0, [0.2, 1.6, 2.6], [0.1, 1.6, 1.6], [0, 1.2, -1.5], [0, 1.4, -1.5], 34]]);
    return label(110, 120, t < 3 ? 'おじぎの国' : '→ キスの国へ', { serif: 1, size: 56, color: t < 3 ? '#fff' : '#ff8a3d' }) + label(116, 210, '占領期の映画政策：西洋化・民主化の演出', { size: 30, op: clamp((t - 3.5) / .5), w: 500 }); } }; } });

// 39 5月23日・キスの日
SC.push({ build() { const T0 = theater(); return { ...T0, update(t, dur) { T0.update(Math.min(5.5, 2 + t * 0.4), dur); shots(T0.cam, t, dur, [[0, [-5.6, 4.6, 6], [-5.0, 4.2, 2], [0, 1.6, -4], [0, 1.8, -6], 40]]);
  return `<div style="position:absolute;left:120px;top:150px;opacity:${clamp((t - .3) / .5)};background:#f6f1e6;color:#222;width:300px;border-radius:10px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.5);text-align:center"><div style="background:#c0392b;color:#fff;font-size:34px;padding:8px">5月</div><div class="serif" style="font-size:150px;font-weight:900;line-height:1.1">23</div><div style="font-size:30px;padding-bottom:12px;color:#c0392b">♥ キスの日</div></div>`
    + label(470, 210, '連日満員', { serif: 1, size: 64, op: clamp((t - .8) / .5) }) + label(476, 300, '公開日が、今の「キスの日」', { size: 34, op: clamp((t - 3.8) / .5), w: 500 }); } }; } });

// 40 年表 1946→1949→1950
SC.push({ build() {
  const L = lab((g, W, H, T, k = 0) => { D.title(g, T, 80, 100, '人前のキスへの反応', 54);
    D.timeline(g, T, 160, 420, 1280, [{ at: 0.05, label: '1946', sub: '映画『はたちの青春』', c: T.accent }, { at: 0.5, label: '1949', sub: '手塚治虫の漫画に抗議殺到', c: T.red }, { at: 0.95, label: '1950', sub: 'ガラス越しのキスで話題', c: T.accent2 }], k, { ls: 54, ss: 34 });
    if (k > .55) { for (let i = 0; i < 6; i++) { const x = 650 + (i % 3) * 110, y = 560 + Math.floor(i / 3) * 90; g.globalAlpha = clamp((k - .55) * 5 - i * .3); g.strokeStyle = T.red; g.lineWidth = 4; g.strokeRect(x, y, 90, 64); g.globalAlpha = 1; D.text(g, T, x + 45, y + 46, '！', 36, { align: 'center', color: T.red, a: clamp((k - .55) * 5 - i * .3) }); } }
    if (k > .85) { g.strokeStyle = T.accent2; g.lineWidth = 6; g.strokeRect(1300, 560, 220, 220); g.beginPath(); g.moveTo(1410, 560); g.lineTo(1410, 780); g.stroke(); } });
  return { ...L.S, update(t, dur) { L.tex.redraw(clamp((t - .4) / 10)); shots(L.S.cam, t, dur, [[0, [-1.6, 2.2, 1.6], [-0.4, 2.3, 1.2], [0.0, 2.3, -4.3], [0.6, 2.3, -4.3], 36], [7.0, [1.6, 2.2, 0.6], [1.2, 2.3, 0.2], [0.6, 2.3, -4.3], [0.7, 2.3, -4.3], 32]]); return note('百科事典「接吻」'); } }; } });

// 41 選んだ× 言われた○
SC.push({ build() {
  const L = lab((g, W, H, T, k = 0) => { D.title(g, T, 80, 110, '日本人が「人前のキス」を見せ始めたのは', 52);
    D.text(g, T, 200, 360, '自分たちで選んだから', 60, { color: T.dim }); D.text(g, T, 1250, 360, '×', 110, { color: T.red, a: clamp(k * 3) });
    D.text(g, T, 200, 600, '占領軍に言われたから', 60, { color: T.accent, a: clamp(k * 3 - 1.5) }); D.text(g, T, 1250, 610, '○', 110, { color: T.accent, a: clamp(k * 3 - 1.8) }); });
  return { ...L.S, update(t, dur) { L.tex.redraw(clamp((t - .3) / 5.5)); shots(L.S.cam, t, dur, [[0, [0.4, 2.3, 1.6], [0.4, 2.35, 0.5], [0.4, 2.35, -4.3], [0.4, 2.35, -4.3], 36]]); return ''; } }; } });

// 42 今の夫婦 56%
const couple = [{ pose: 'sit', at: [-1.0, 0, -2.25], ry: 0.15, top: '#7a8a9a' }, { pose: 'sit', at: [-0.25, 0, -2.25], ry: -0.15, top: '#c08a6a', hairStyle: 'long', hair: '#3a2418' }];
SC.push({ build() {
  const Lv = living({ people: couple });
  const { tex: tx, blank: txb } = twin(640, 1360, 'phone', (g, W, H, T, k = 0) => { D.text(g, T, 40, 90, 'パートナーとキスする？', 40); D.text(g, T, 40, 150, '20〜50代 既婚 200人', 28, { color: T.dim });
    D.donut(g, T, 320, 620, 200, [{ v: 56, c: T.accent }, { v: 44, c: '#d8d8de' }], k); D.text(g, T, 320, 650, '56%', 96, { align: 'center', color: T.accent }); D.text(g, T, 320, 1000, 'キスをする', 44, { align: 'center' }); D.text(g, T, 320, 1260, '2023年 民間調査', 26, { align: 'center', color: T.dim }); }, { x: 1420, y: 90, w: 360 });
  const ph = phone(Lv.s, txb, 0.6, 1.0, -1.2, 1.3); ph.rotation.y = -0.5; ph.rotation.x = -0.2;
  return { ...Lv.S, update(t, dur) { tx.redraw(clamp((t - 3.3) / 2.5)); shots(Lv.S.cam, t, dur, [[0, [1.8, 1.6, 2.2], [1.2, 1.5, 1.2], [-0.6, 0.9, -2.2], [-0.4, 0.95, -2.0], 36], [3.3, [1.55, 1.25, 0.25], [1.4, 1.2, 0.0], [0.6, 1.0, -1.2], [0.6, 1.0, -1.2], 32]]); return note('リベルタ「デンティス」調査 (2023) N=200'); } }; } });

// 43 頻度
SC.push({ build() {
  const Lv = living({ people: couple });
  const { tex: tx, blank: txb } = twin(1600, 900, 'screen', (g, W, H, T, k = 0) => { D.title(g, T, 80, 100, 'キスをする夫婦のうち', 50);
    D.hbars(g, T, 640, 230, 760, [{ label: '週に1回以上', v: 73, txt: '73%' }, { label: '毎日', v: 30, txt: '約30%', c: T.accent2 }, { label: '結婚15年以上でも', v: 46, txt: '46%', c: '#c98af0' }], 100, k, { bh: 90, gap: 80, ls: 44, vs: 52 }); });
  board(Lv.s, 2.4, 1.35, txb, -0.6, 1.9, -4.35, 0, { monitor: true, frame: false, glow: 0.6 });
  return { ...Lv.S, update(t, dur) { tx.redraw(clamp((t - .4) / 8)); shots(Lv.S.cam, t, dur, [[0, [-0.6, 1.5, 2.4], [-0.6, 1.7, 1.2], [-0.6, 1.6, -4.3], [-0.6, 1.8, -4.3], 34]]); return note('リベルタ「デンティス」調査 (2023)'); } }; } });

// 44 家の窓
SC.push({ build() { const St = street(); return { ...St, update(t, dur) { St.update(Math.min(t + 2, 8), 8); shots(St.cam, t, dur, [[0, [-1.2, 2.2, -6], [-2.0, 2.6, -9], [-5.2, 3.0, -13.55], [-5.3, 3.0, -13.55], 36]]);
  return label(110, 120, '家の中では、ちゃんとしている', { serif: 1, size: 52, op: clamp((t - .5) / .5) }) + label(116, 210, 'しないのは「人前で」', { size: 40, color: '#ff8a3d', op: clamp((t - 5.5) / .5) }); } }; } });

// 45 3本のアイコン
SC.push({ build() {
  const Lv = living({}); const s = Lv.s; const y = 1.81;
  const per = new THREE.Group(); per.position.set(-5.0, y, -4.0); s.add(per); box(per, 0.14, 0.18, 0.1, new THREE.MeshStandardMaterial({ color: '#f0c0a0', transparent: true, opacity: .7, roughness: .1 }), 0, 0.09, 0); cyl(per, 0.03, 0.03, 0.06, mat('#c9a43a', { m: .7 }), 0, 0.21, 0, 8);
  const key = new THREE.Group(); key.position.set(-4.4, y, -4.0); s.add(key); box(key, 0.12, 0.2, 0.02, mat('#8a2a2a'), 0, 0.1, 0); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 6, 14), mat('#c9a43a', { m: .7 })); ring.position.y = 0.23; key.add(ring);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.028, 8, 18), glow('#e0564b', .6)); lip.scale.y = .55; lip.position.set(-3.8, y + 0.1, -4.0); s.add(lip);
  lamp(s, '#ffd9a0', 3, 3, -4.4, 2.6, -3.4, false);
  return { ...Lv.S, update(t, dur) { [per, key, lip].forEach((o, i) => o.rotation.y = Math.sin(t * .6 + i) * .3); shots(Lv.S.cam, t, dur, [[0, [-3.3, 2.3, -1.6], [-3.7, 2.2, -2.4], [-4.4, 1.9, -4.0], [-4.4, 1.9, -4.0], 32]]);
    const L0 = (x, s0, a) => label(x, 860, s0, { size: 34, op: a }); return L0(380, '匂いを消す', clamp((t - .3) / .5)) + L0(800, '家の外のホテル', clamp((t - 2.3) / .5)) + L0(1260, '人前で見せない', clamp((t - 5.9) / .5)); } }; } });

// 46 引き出しにしまう（開いた引き出しに3つの小物 → 閉まる）
SC.push({ build() {
  const S = makeScene({ bg: '#2a2018', hemi: 0.7, exposure: 1.45, bloom: 0.5, bloomTh: 0.85, fov: 30 });
  const s = S.s; room(s, { w: 8, d: 6, wall: '#6a5a4c', floor: '#4a3626' });
  const wd = mat('#5a3e2b', { r: .5 }), wd2 = mat('#6b4a33', { r: .5 });
  box(s, 1.6, 0.9, 0.7, wd, 0, 0.45, -1.8);                                  // 本体（前面 z=-1.45）
  box(s, 1.66, 0.04, 0.74, mat('#4a3020'), 0, 0.92, -1.8);                    // 天板
  const dr = new THREE.Group(); s.add(dr);
  box(dr, 1.4, 0.3, 0.04, wd2, 0, 0.62, -1.43);                               // 前板
  box(dr, 0.3, 0.035, 0.04, mat('#c9a43a', { m: .7, r: .3 }), 0, 0.64, -1.40); // 取っ手
  box(dr, 1.3, 0.02, 0.6, mat('#3a281c'), 0, 0.5, -1.75);                     // 底板
  box(dr, 0.02, 0.2, 0.6, wd2, -0.65, 0.6, -1.75); box(dr, 0.02, 0.2, 0.6, wd2, 0.65, 0.6, -1.75); box(dr, 1.3, 0.2, 0.02, wd2, 0, 0.6, -2.05);
  const it = new THREE.Group(); dr.add(it);
  box(it, 0.12, 0.16, 0.08, new THREE.MeshStandardMaterial({ color: '#f0c0a0', transparent: true, opacity: .75, roughness: .1 }), -0.35, 0.59, -1.72);
  cyl(it, 0.025, 0.025, 0.05, mat('#c9a43a', { m: .7 }), -0.35, 0.69, -1.72, 8);
  const key = box(it, 0.1, 0.17, 0.02, mat('#8a2a2a'), 0.0, 0.52, -1.72); key.rotation.x = -Math.PI / 2;
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.022, 8, 16), glow('#e0564b', .6)); lip.scale.y = .55; lip.rotation.x = -Math.PI / 2; lip.position.set(0.35, 0.53, -1.72); it.add(lip);
  deskLamp(s, 0.6, 0.94, -2.0, { i: 4 });
  return { ...S, update(t, dur) { const c = ease(clamp((t - 1.2) / 2.5)); dr.position.z = lerp(0.42, 0, c);
    shots(S.cam, t, dur, [[0, [0.7, 1.75, 0.5], [0.5, 1.65, 0.2], [0, 0.55, -1.6], [0, 0.6, -1.7], 32]]);
    return label(110, 780, '見えない場所に、しまってきた', { serif: 1, size: 52, op: clamp((t - 3.0) / .5) }); } }; } });

// 47 巻物の「口吸ふ」がもう一度灯る
SC.push({ build() { const W0 = washitsu(); return { ...W0, update(t, dur) { W0.update(4.5 + t, 12); shots(W0.cam, t, dur, [[0, [0.35, 1.25, 0.15], [0.15, 1.05, -0.2], [0, 0.4, -0.9], [0, 0.4, -0.9], 32]]);
  return label(150, 560, '千年前、口吸いは恋の歌には詠まれなかった', { serif: 1, size: 44, op: clamp((t - .4) / .5) }) + label(156, 640, 'それでも、こっそり書き残されていた', { size: 34, op: clamp((t - 3.6) / .5), w: 500 }); } }; } });

// 48 夜の窓の2人
SC.push({ build() { const St = street(); return { ...St, update(t, dur) { St.update(Math.min(1.5 + t * 0.45, 5), 8); shots(St.cam, t, dur, [[0, [-3.2, 2.9, -9.5], [-4.0, 3.0, -11.2], [-5.25, 3.0, -13.55], [-5.3, 3.0, -13.55], 34]]);
  return label(110, 780, '誰にも見せないぶんだけ、二人だけのもの', { serif: 1, size: 50, op: clamp((t - 3.3) / .6) }); } }; } });

// 49 アウトロ
SC.push({ build() { const St = street(); return { ...St, update(t, dur) { St.update(5, 8); shots(St.cam, t, dur, [[0, [0, 2.0, 4], [0, 3.0, 2], [0, 6, -20], [0, 10, -20], 40]]);
  return `<div style="position:absolute;inset:0;background:rgba(5,8,20,${0.45 * clamp(t / 1.5)})"></div>`
    + `<div style="position:absolute;left:0;right:0;top:300px;text-align:center;opacity:${clamp(t / .6)}"><div class="serif" style="font-size:60px;font-weight:700">今日のネタバレは、ここまで。</div>
      <div class="serif" style="font-size:96px;font-weight:700;color:#ff8a3d;letter-spacing:8px;margin-top:40px;opacity:${clamp((t - 1) / .6)}">世界のネタバレ</div>
      <div style="display:inline-block;margin-top:40px;background:#ff8a3d;color:#111;font-size:38px;font-weight:700;padding:16px 50px;border-radius:50px;opacity:${clamp((t - 2) / .6)}">チャンネル登録</div>
      <div style="font-size:26px;color:rgba(255,255,255,.7);margin-top:40px;opacity:${clamp((t - 3) / .6)}">音声：VOICEVOX:青山龍星</div></div>`; } }; } });

export const SCENES = SC.map(sc => ({ build() {
  CUR = []; const b = sc.build(); const cs = CUR; CUR = [];
  if (b.flat) cs.push(b.flat);
  return { ...b, update(t, d) { const h = b.update(t, d) || ''; return cs.map(f => f(t)).join('') + h; } };
} }));
