// 05 地方の若い女性 — 紙芝居＋3D（1割前後）。字幕は灰色の帯。男性=青 女性=ピンク
import { THREE, makeScene, mat, glow, box, cyl, plane, dust, lamp, sun, canvasTex, person as person3, rng, lerp } from '/pipeline3d/lib3d.js';
import { maps, C, clamp, ease, easeOut, pop, txt, note, head, counter, person, card, arrow, bubble, japanMap, loadMaps, run, kami } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}

const M = '#4f8fea', F = '#ef7fa8', Y = C.gold, CX = 960;
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', 'エピローグ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, ...o });
const R = (els, t) => run(els.map(e => e.f ? e : { ...e, f: () => '' }), t);
const ref = (s) => ({ at: .6, f: () => note(1880, 125, s, 'end') });

// ---------- 3D：夜の地方駅のホーム ----------
function station() {
  const S = makeScene({ bg: '#070a14', fog: ['#0a0e1c', 18, 60], hemi: 1.0, exposure: 1.3, sky: '#6a7aa8', ground: '#2a2a30', bloom: 0.18, bloomTh: 0.9, fov: 34 });
  const s = S.s, r = rng(5);
  const skyTex = canvasTex(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#04060f'); gr.addColorStop(0.7, '#141c38'); gr.addColorStop(1, '#2a2c44'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  s.add(new THREE.Mesh(new THREE.SphereGeometry(95, 24, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })));
  const stars = dust(s, 260, [-90, 90, 18, 60, -95, -20], '#ffffff', 0.22, 0.7, 3); stars.material.fog = false;
  // 遠くの山なみ（シルエット）
  for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(6 + r() * 8, 5 + r() * 6, 5), mat('#0d1120')); m.position.set(-40 + i * 7 + r() * 3, 1, -55 - r() * 10); s.add(m); }
  // 地面・砂利・線路
  box(s, 80, 0.1, 120, mat('#16161a'), 0, -0.05, -20);
  box(s, 4.2, 0.95, 44, mat('#5a5852'), 0, 0.47, -6);                 // ホーム
  box(s, 0.25, 0.02, 44, mat('#8a7a3a'), 1.75, 0.96, -6);              // 点字ブロック（くすんだ黄）
  box(s, 4.0, 0.3, 120, mat('#2a2826'), 4.3, 0.12, -20);               // 砂利
  for (const x of [3.6, 5.0]) box(s, 0.08, 0.14, 120, mat('#6a6a70', { metal: .6, rough: .4 }), x, 0.33, -20);
  for (let z = -78; z < 38; z += 0.9) box(s, 2.2, 0.08, 0.22, mat('#3a3028'), 4.3, 0.27, z);
  // 屋根と柱
  box(s, 4.4, 0.12, 14, mat('#3a3e46'), 0, 3.3, -2);
  for (const z of [-8, -2, 4]) box(s, 0.16, 2.4, 0.16, mat('#4a4e56'), -1.4, 2.1, z);
  // 蛍光灯（控えめ）
  for (const z of [-7, -3, 1, 5]) { box(s, 0.12, 0.05, 1.1, glow('#e8f0ff', 0.45), 0.2, 3.2, z); }
  sun(s, '#8a9ac8', 0.5, -10, 20, 10, 20);
  lamp(s, '#dfe8ff', 1.6, 9, 0.2, 2.6, -1);
  lamp(s, '#dfe8ff', 1.2, 8, 0.2, 2.6, 5, false);
  // ベンチと自販機
  box(s, 0.45, 0.08, 1.8, mat('#6b4a33'), -0.6, 1.4, 0); box(s, 0.06, 0.45, 1.8, mat('#6b4a33'), -0.84, 1.66, 0);
  for (const z of [-0.7, 0.7]) box(s, 0.4, 0.45, 0.08, mat('#333'), -0.6, 1.17, z);
  box(s, 0.9, 1.8, 0.7, mat('#c9ced6'), -1.6, 1.85, 4.2); box(s, 0.78, 1.1, 0.02, glow('#bcd6ff', 0.55), -1.6, 2.0, 3.84);
  lamp(s, '#bcd6ff', 1.4, 4, -1.6, 2.0, 3.4, false);
  // ベンチに座る若い男性（後ろ姿）
  const man = person3(s, { seated: true, back: true, top: '#34404f', bottom: '#22252c', hair: '#18140f' });
  man.position.set(-0.62, 0.95, 0.2); man.rotation.y = Math.PI / 2;
  // 上り電車（奥から近づく）：ヘッドライトと窓の光
  const train = new THREE.Group(); s.add(train);
  box(train, 2.6, 2.6, 18, mat('#7c838c'), 0, 1.7, 0);
  for (let k = -7; k <= 7; k += 1.6) box(train, 0.02, 0.7, 1.0, glow('#ffe6b8', 0.6), 1.31, 2.1, k);
  const hl = box(train, 0.4, 0.2, 0.05, glow('#fff6dc', 1.4), 0.7, 1.2, 9.02); box(train, 0.4, 0.2, 0.05, glow('#fff6dc', 1.4), -0.7, 1.2, 9.02);
  const hlL = lamp(train, '#fff2d0', 6, 22, 0, 1.3, 10, false);
  train.position.set(4.3, 0, -95);
  return { render() { S.render(); }, update(t, dur) {
    const k = ease(t / dur);
    S.cam.position.set(lerp(-4.6, -4.0, k), lerp(2.3, 2.2, k), lerp(4.2, 3.4, k));
    S.cam.lookAt(lerp(2.6, 3.0, k), 1.3, lerp(-6, -8, k));
    train.position.z = -70 + 22 * ease(t / dur);
    return ''; } };
}

const SC = [];
SC[0] = { build: station };
SC[1] = K((t) => R([
  { at: 0, slide: 0, f: () => person(560, 640, 120, M) + person(760, 650, 110, '#3f6fb8') + person(960, 640, 116, M) + txt(760, 860, '地元に残った男たち', { size: 36, color: C.dim }) },
  { at: .4, f: () => bubble(1360, 330, 560, 120, '若い女の子がいない', { size: 52 }) },
  { at: 4.2, f: (lt) => `<g transform="translate(1360,620) scale(${pop(lt / .4)})">${txt(0, 30, 'ただの気のせい？', { size: 72, color: Y, serif: true })}</g>` },
], t), 0, { enter: 'zoom', leave: 'left' });
SC[2] = K((t) => { const j = maps().japan, sx = 260, sy = 70, sc = .9, P = (k) => [sx + j.pts[k][0] * sc, sy + j.pts[k][1] * sc];
  const T = P('tokyo'), src = [P('sapporo'), P('osaka'), P('kyoto'), [sx + 330 * sc, sy + 720 * sc], [sx + 760 * sc, sy + 440 * sc]];
  return R([
    { at: 0, slide: 0, f: () => japanMap(sx, sy, sc) + `<circle cx="${T[0]}" cy="${T[1]}" r="16" fill="${Y}"/>` + txt(T[0] + 30, T[1] + 10, '東京', { size: 40, color: Y, anchor: 'start' }) },
    { at: .3, f: () => txt(1500, 360, '2020年', { size: 96, color: Y, serif: true }) },
    { at: 1.2, f: () => txt(1500, 450, 'コロナで人の移動が止まった年', { size: 36 }) },
    { at: 4.0, f: (lt) => src.map((p, i) => arrow(p[0], p[1], T[0] - 14, T[1] + 6, i % 2 ? M : F, easeOut((lt - i * .15) / .8), 6)).join('') },
    { at: 6.5, f: () => txt(1500, 620, '男女別に数えると…', { size: 50, color: C.fg }) },
    ref('天野 (2021) ニッセイ基礎研究所'),
  ], t); }, 0, { enter: 'right', leave: 'left' });
SC[3] = K((t) => R([
  { at: 0, f: () => head('東京への転入超過（2020年）', { y: 180 }) },
  { at: .3, slide: 0, f: (lt) => { const base = 820, k = easeOut(lt / 1.4), hF = 520 * k, hM = 520 * 9632 / 21493 * k;
      return `<rect x="560" y="${base - hF}" width="260" height="${hF}" rx="10" fill="${F}"/><rect x="1100" y="${base - hM}" width="260" height="${hM}" rx="10" fill="${M}"/>`
        + txt(690, base + 50, '女性', { size: 40, color: F }) + txt(1230, base + 50, '男性', { size: 40, color: M }); } },
  { at: .5, f: (lt) => counter(690, 820 - 520 * easeOut(lt / 1.4) - 24, 21493, lt, { size: 56, suf: '人', dur: 1.4, color: F }) },
  { at: .7, f: (lt) => counter(1230, 820 - 520 * 9632 / 21493 * easeOut(lt / 1.4) - 24, 9632, lt, { size: 56, suf: '人', dur: 1.4, color: M }) },
  { at: 6.4, f: (lt) => `<g transform="translate(1620,380) scale(${pop(lt / .4)})"><circle r="120" fill="${Y}"/>${txt(0, 30, '2.2倍', { size: 78, color: '#111', shadow: false, serif: true })}</g>` },
  ref('天野 (2021) ニッセイ基礎研究所'),
], t), 0, { enter: 'right' });

export const SCENES = SC;
