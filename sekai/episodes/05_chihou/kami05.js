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
// ---- 写真（Pexels）：先に読み込んでおく ----
const IMG = (n) => `/episodes/05_chihou/img/${n}.jpg`;
await Promise.all(['train_snow', 'station_small'].map(n => new Promise(r => { const i = new Image(); i.onload = () => (i.decode ? i.decode().then(r, r) : r()); i.onerror = r; i.src = IMG(n); })));
const photo = (n, t, dur, dark = .35, z0 = 1.0, z1 = 1.08, px = 0) => { const k = ease(t / dur), z = z0 + (z1 - z0) * k;
  return `<g transform="translate(${960 + px * k},540) scale(${z}) translate(-960,-540)"><image href="${IMG(n)}" x="-40" y="-40" width="2000" height="1160" preserveAspectRatio="xMidYMid slice"/></g><rect width="1920" height="1080" fill="rgba(8,10,18,${dark})"/>`; };
const rnd = (seed) => { let x = seed * 9301 + 49297; return () => ((x = (x * 233280 + 49297) % 2147483647) / 2147483647); };
const pin = (x, y, label, col = Y) => `<g transform="translate(${x},${y})"><path d="M0,0 C-22,-30 -22,-54 0,-54 C22,-54 22,-30 0,0Z" fill="${col}"/><circle cy="-37" r="8" fill="#1b1a20"/></g>` + (label ? txt(x, y + 40, label, { size: 32 }) : '');

// 0 写真：雪の夜の地方駅に電車が入ってくる
SC[0] = K((t, dur) => photo('train_snow', t, dur, .18, 1.02, 1.12, -40), 0, { enter: 'fade', zoom: 0 });
// 1 写真（小さな駅）の上に、残った男たちのつぶやき
SC[1] = K((t, dur) => photo('station_small', t, dur, .58, 1.0, 1.06) + R([
  { at: .2, slide: 0, f: () => person(560, 700, 110, M) + person(740, 710, 100, '#3f6fb8') + person(920, 700, 106, M) + txt(740, 900, '地元に残った男たち', { size: 34, color: '#d8d4cc' }) },
  { at: .6, f: () => bubble(1340, 360, 560, 120, '若い女の子がいない', { size: 52 }) },
  { at: 4.2, f: (lt) => `<g transform="translate(1340,640) scale(${pop(lt / .4)})">${txt(0, 30, 'ただの気のせい？', { size: 72, color: Y, serif: true })}</g>` },
], t), 0, { enter: 'fade', leave: 'left', zoom: 0 });
// 2 人の流れ：各地から東京へ光の粒（女性:男性 ＝ 2.2:1、粒1つ ≒ 280人）
const SRC = ['sapporo', 'asahikawa', 'hakodate', 'aomori', 'akita', 'morioka', 'yamagata', 'sendai', 'fukushima', 'niigata', 'toyama', 'kanazawa', 'fukui', 'nagano', 'kofu', 'shizuoka', 'nagoya', 'kyoto', 'osaka', 'okayama', 'hiroshima', 'tottori', 'matsue', 'tokushima', 'kochi', 'matsuyama', 'fukuoka', 'nagasaki', 'kumamoto', 'miyazaki', 'kagoshima', 'utsunomiya', 'maebashi', 'mito'];
const PARTS = (() => { const r = rnd(11), out = []; for (let i = 0; i < 110; i++) { const f = i < 76; out.push({ f, s: SRC[Math.floor(r() * SRC.length)], st: 1.6 + r() * 5.2, dur: 1.2 + r() * .6, bend: (r() - .5) * 160 }); } return out.sort((a, b) => a.st - b.st); })();
SC[2] = K((t, dur) => { const j = maps().japan, sx = 230, sy = 60, sc = .92, P = (k) => [sx + j.pts[k][0] * sc, sy + j.pts[k][1] * sc], T = P('tokyo');
  let dots = '', nf = 0, nm = 0;
  for (const p of PARTS) { const u = (t - p.st) / p.dur; if (u < 0) continue; if (u >= 1) { p.f ? nf++ : nm++; continue; }
    const a = P(p.s), e = easeOut(u), mx = (a[0] + T[0]) / 2 + p.bend, my = (a[1] + T[1]) / 2 - 80;
    const x = (1 - e) * (1 - e) * a[0] + 2 * (1 - e) * e * mx + e * e * T[0], y = (1 - e) * (1 - e) * a[1] + 2 * (1 - e) * e * my + e * e * T[1];
    dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="${p.f ? F : M}" opacity="${(.4 + .6 * Math.sin(Math.PI * Math.min(1, u * 1.2))).toFixed(2)}" filter="url(#glow)"/>`; }
  const done = t > PARTS[PARTS.length - 1].st + 2, nF = PARTS.filter(p => p.f).length, cF = Math.round(21493 * nf / nF), cM = Math.round(9632 * nm / (PARTS.length - nF)), gl = 18 + (nf + nm) * .35;
  return R([
    { at: 0, slide: 0, f: () => japanMap(sx, sy, sc, { fill: '#cfc8b8' }) + `<circle cx="${T[0]}" cy="${T[1]}" r="${gl}" fill="${Y}" opacity=".55" filter="url(#glow)"/><circle cx="${T[0]}" cy="${T[1]}" r="12" fill="${Y}"/>` + txt(T[0] + 34, T[1] + 12, '東京', { size: 40, color: Y, anchor: 'start' }) + dots },
    { at: .2, f: () => txt(1560, 250, '2020年', { size: 90, color: Y, serif: true }) + txt(1560, 320, 'コロナで人の移動が止まった年', { size: 32 }) },
    { at: 1.4, slide: 0, f: () => `<g style="font-variant-numeric:tabular-nums">` + card(1300, 400, 520, 360) + txt(1560, 470, '東京への転入超過', { size: 34, color: C.dim })
        + txt(1360, 580, '女性', { size: 44, color: F, anchor: 'start' }) + txt(1780, 580, cF.toLocaleString() + '人', { size: 54, color: F, anchor: 'end' })
        + txt(1360, 690, '男性', { size: 44, color: M, anchor: 'start' }) + txt(1780, 690, cM.toLocaleString() + '人', { size: 54, color: M, anchor: 'end' }) + '</g>' },
    { at: 1.6, f: () => note(1560, 800, '光の粒1つ ≒ 280人', 'middle') },
    ref('天野 (2021) ニッセイ基礎研究所'),
  ], t); }, 0, { enter: 'right', leave: 'left', zoom: 0 });
// 3 1人の形＝1,000人で並べる。女性21.5、男性9.6
const icon1 = (x, y, c, a) => `<g transform="translate(${x},${y})" opacity="${a}"><circle cy="-30" r="13" fill="${c}"/><rect x="-14" y="-15" width="28" height="34" rx="9" fill="${c}"/></g>`;
SC[3] = K((t) => { const cols = 6, dx = 62, dy = 84;
  const grid = (x0, n, c, t0) => { let s0 = ''; const full = Math.floor(n), frac = n - full; for (let i = 0; i < Math.ceil(n); i++) { const a = clamp((t - t0 - i * .09) / .3); if (a <= 0) continue; const cx = x0 + (i % cols) * dx, cy = 820 - Math.floor(i / cols) * dy - (1 - easeOut(a)) * 60;
      s0 += i < full ? icon1(cx, cy, c, a) : `<g>${icon1(cx, cy, c, a * .9)}<rect x="${cx - 16 + 32 * frac}" y="${cy - 46}" width="${32 * (1 - frac) + 2}" height="70" fill="#1a1820"/></g>`; } return s0; };
  return R([
    { at: 0, f: () => head('東京への転入超過（2020年）', { y: 170 }) },
    { at: .2, f: () => txt(1880, 230, '1人の形 ＝ 1,000人', { size: 30, color: C.dim, anchor: 'end' }) },
    { at: 0, slide: 0, f: () => grid(330, 21.5, F, .4) + grid(1080, 9.6, M, 3.6) },
    { at: 2.4, f: () => txt(485, 900, '女性　21,493人', { size: 44, color: F }) },
    { at: 5.4, f: () => txt(1235, 900, '男性　9,632人', { size: 44, color: M }) },
    { at: 6.4, f: (lt) => `<g transform="translate(1660,420) scale(${pop(lt / .4)})"><circle r="120" fill="${Y}"/>${txt(0, 28, '2.2倍', { size: 78, color: '#111', shadow: false, serif: true })}</g>` },
    ref('天野 (2021) ニッセイ基礎研究所'),
  ], t); }, 0, { enter: 'right', zoom: 0 });

export const SCENES = SC;
