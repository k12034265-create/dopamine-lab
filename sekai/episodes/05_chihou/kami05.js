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


// ===== 県境つき地図（japan2）：見たい地域まで寄せて描く =====
// view = [中心x, 中心y, 倍率]（地図座標 1200x900）。画面の (ox,oy) にその中心が来る
const J2 = () => maps().japan2;
const lerpV = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const VW = { all: [600, 450, .92], east: [690, 400, 1.9], kanto: [640, 445, 5.2], kita: [648, 418, 6.2], chubu: [560, 470, 3.2], tohoku: [700, 300, 2.4] };
const vp = (v, ox = 760, oy = 540) => (p) => [ox + (p[0] - v[0]) * v[2], oy + (p[1] - v[1]) * v[2]];
// fills: {県コード: 色} / dim: 塗らない県の色
const jmap2 = (v, o = {}) => { const j = J2(), ox = o.ox ?? 760, oy = o.oy ?? 540, z = v[2];
  let g = `<g transform="translate(${ox - v[0] * z},${oy - v[1] * z}) scale(${z})">`;
  for (const [c, pf] of Object.entries(j.prefs)) { const f = (o.fills && o.fills[c]) || o.base || '#cfc8b8'; g += `<path d="${pf.d}" fill="${f}"/>`; }
  g += `<path d="${j.border}" fill="none" stroke="${o.stroke || '#1b1a20'}" stroke-width="${(1.6 / z).toFixed(3)}" opacity=".7"/></g>`; return g; };
const pc = (code) => J2().prefs[code].c;
const plabel = (v, code, s0, o = {}) => { const q = vp(v, o.ox, o.oy)(pc(code)); return txt(q[0] + (o.dx || 0), q[1] + (o.dy || 0) + 12, s0, { size: o.size || 34, color: o.color || '#1b1a20', shadow: false }); };

const SC = [];
// ---- 写真（Pexels）：先に読み込んでおく ----
const IMG = (n) => `/episodes/05_chihou/img/${n}.jpg`;
await Promise.all(['train_snow', 'station_night', 'suitcase', 'shutter', 'konbini', 'skyline', 'shinjuku', 'scramble', 'tstreet', 'campus', 'office', 'country', 'village', 'tnight', 'rice', 'train_jp', 'train_in'].map(n => new Promise(r => { const i = new Image(); i.onload = () => (i.decode ? i.decode().then(r, r) : r()); i.onerror = r; i.src = IMG(n); })));
const photo = (n, t, dur, dark = .35, z0 = 1.0, z1 = 1.08, px = 0) => { const k = ease(t / dur), z = z0 + (z1 - z0) * k;
  return `<g transform="translate(${960 + px * k},540) scale(${z}) translate(-960,-540)"><image href="${IMG(n)}" x="-40" y="-40" width="2000" height="1160" preserveAspectRatio="xMidYMid slice"/></g><rect width="1920" height="1080" fill="rgba(8,10,18,${dark})"/>`; };
const rnd = (seed) => { let x = seed * 9301 + 49297; return () => ((x = (x * 233280 + 49297) % 2147483647) / 2147483647); };
const pin = (x, y, label, col = Y) => `<g transform="translate(${x},${y})"><path d="M0,0 C-22,-30 -22,-54 0,-54 C22,-54 22,-30 0,0Z" fill="${col}"/><circle cy="-37" r="8" fill="#1b1a20"/></g>` + (label ? txt(x, y + 40, label, { size: 32 }) : '');

// 0 写真：雪の夜の地方駅に電車が入ってくる
SC[0] = K((t, dur) => photo('train_snow', t, dur, .18, 1.02, 1.12, -40), 0, { enter: 'fade', zoom: 0 });
// 1 写真（小さな駅）の上に、残った男たちのつぶやき
SC[1] = K((t, dur) => R([
  { at: .2, slide: 0, f: () => person(560, 700, 110, M) + person(740, 710, 100, '#3f6fb8') + person(920, 700, 106, M) + txt(740, 900, '地元に残った男たち', { size: 34, color: '#d8d4cc' }) },
  { at: .6, f: () => bubble(1340, 360, 560, 120, '若い女の子がいない', { size: 52 }) },
  { at: 4.2, f: (lt) => `<g transform="translate(1340,640) scale(${pop(lt / .4)})">${txt(0, 30, 'ただの気のせい？', { size: 72, color: Y, serif: true })}</g>` },
], t), 0, { enter: 'fade', leave: 'left', zoom: 0 });
// 2 人の流れ：各地から東京へ光の粒（女性:男性 ＝ 2.2:1、粒1つ ≒ 280人）
const SRC = ['sapporo', 'asahikawa', 'hakodate', 'aomori', 'akita', 'morioka', 'yamagata', 'sendai', 'fukushima', 'niigata', 'toyama', 'kanazawa', 'fukui', 'nagano', 'kofu', 'shizuoka', 'nagoya', 'kyoto', 'osaka', 'okayama', 'hiroshima', 'tottori', 'matsue', 'tokushima', 'kochi', 'matsuyama', 'fukuoka', 'nagasaki', 'kumamoto', 'miyazaki', 'kagoshima', 'utsunomiya', 'maebashi', 'mito'];
const PARTS = (() => { const r = rnd(11), out = []; for (let i = 0; i < 110; i++) { const f = i < 76; out.push({ f, s: SRC[Math.floor(r() * SRC.length)], st: 1.6 + r() * 5.2, dur: 1.2 + r() * .6, bend: (r() - .5) * 160 }); } return out.sort((a, b) => a.st - b.st); })();
SC[2] = K((t, dur) => { const j = J2(), v = lerpV(VW.all, [650, 420, 2.0], ease(clamp((t - 4) / 4.5))), V = vp(v), T0 = j.pts.tokyo, T = V(T0);
  let dots = '', nf = 0, nm = 0;
  for (const p of PARTS) { const u = (t - p.st) / p.dur; if (u < 0) continue; if (u >= 1) { p.f ? nf++ : nm++; continue; }
    const a = j.pts[p.s], e = easeOut(u), mx = (a[0] + T0[0]) / 2 + p.bend * .5, my = (a[1] + T0[1]) / 2 - 40;
    const q = V([(1 - e) * (1 - e) * a[0] + 2 * (1 - e) * e * mx + e * e * T0[0], (1 - e) * (1 - e) * a[1] + 2 * (1 - e) * e * my + e * e * T0[1]]);
    dots += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="10" fill="${p.f ? F : M}" opacity="${(.4 + .6 * Math.sin(Math.PI * Math.min(1, u * 1.2))).toFixed(2)}" filter="url(#glow)"/>`; }
  const nF = PARTS.filter(p => p.f).length, cF = Math.round(21493 * nf / nF), cM = Math.round(9632 * nm / (PARTS.length - nF)), gl = 18 + (nf + nm) * .3;
  return R([
    { at: 0, slide: 0, f: () => jmap2(v, { fills: { 11: '#e6dcc0', 12: '#e6dcc0', 13: '#f3d68a', 14: '#e6dcc0' } }) + `<circle cx="${T[0]}" cy="${T[1]}" r="${gl}" fill="${Y}" opacity=".5" filter="url(#glow)"/><circle cx="${T[0]}" cy="${T[1]}" r="12" fill="${Y}"/>` + txt(T[0] + 30, T[1] + 64, '東京', { size: 40, color: Y, anchor: 'start' }) + dots },
    { at: .2, f: () => txt(1580, 250, '2020年', { size: 90, color: Y, serif: true }) + txt(1580, 320, 'コロナで人の移動が止まった年', { size: 32 }) },
    { at: 1.4, slide: 0, f: () => `<g style="font-variant-numeric:tabular-nums">` + card(1330, 400, 500, 360, { fill: 'rgba(20,18,26,.85)' }) + txt(1580, 470, '東京への転入超過', { size: 34, color: C.dim })
        + txt(1380, 580, '女性', { size: 44, color: F, anchor: 'start' }) + txt(1790, 580, cF.toLocaleString() + '人', { size: 54, color: F, anchor: 'end' })
        + txt(1380, 690, '男性', { size: 44, color: M, anchor: 'start' }) + txt(1790, 690, cM.toLocaleString() + '人', { size: 54, color: M, anchor: 'end' }) + '</g>' },
    { at: 1.6, f: () => note(1580, 800, '光の粒1つ ≒ 280人', 'middle') },
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


// 4 写真：夜の駅。男も出ていくのでは？
SC[4] = K((t, dur) => photo('station_night', t, dur, .5, 1.0, 1.07, 30) + R([
  { at: .2, slide: 0, f: (lt) => person(500 + Math.min(lt, 3) * 120, 760, 120, M) + person(330 + Math.min(lt, 3) * 120, 770, 110, '#3f6fb8') },
  { at: 1.6, f: (lt) => `<g transform="translate(1280,420) scale(${pop(lt / .4)})">${txt(0, 30, '男だって同じでは？', { size: 76, color: '#fff', serif: true })}</g>` },
], t), 0, { enter: 'fade', zoom: 0 });
// 5 この動画で見る4つ
const CARDS = [['①', '人の移動', '誰が東京へ？'], ['②', '地方に残る男女', '数のバランス'], ['③', '出ていく理由', '本人の声'], ['④', '家の形', '3世代同居']];
SC[5] = K((t) => R([
  { at: 0, f: () => head('国の統計と調査で確かめる', { y: 200 }) },
  ...CARDS.map((c, i) => ({ at: .8 + i * .9, f: (lt) => { const x = 270 + i * 460; return `<g transform="translate(${x},560) scale(${pop(lt / .45)})">` + card(-200, -190, 400, 380) + txt(0, -90, c[0], { size: 60, color: Y, serif: true }) + txt(0, 20, c[1], { size: 50 }) + txt(0, 110, c[2], { size: 32, color: C.dim }) + '</g>'; } })),
], t), 0, { enter: 'right', zoom: 0 });
// 6 第1章
SC[6] = K((t) => R([
  { at: 0, slide: 0, f: () => txt(CX, 400, '第1章', { size: 40, color: C.o, serif: true, ls: 10 }) },
  { at: .25, f: () => txt(CX, 530, '出ていくのは女性の方', { size: 92, serif: true, ls: 4 }) },
  { at: .7, slide: 0, f: (lt) => `<rect x="${CX - 320 * ease(lt / .8)}" y="580" width="${640 * ease(lt / .8)}" height="3" fill="${C.o}"/>` },
], t), 1, { enter: 'zoom', zoom: 0 });
// 7 天秤：入ってくる人 − 出ていく人
SC[7] = K((t) => { const tilt = t < 4.5 ? 0 : (t < 7 ? -9 * ease((t - 4.5) / .8) : -9 + 18 * ease((t - 7) / .8));
  const pile = (x, n, c) => { let q = ''; for (let i = 0; i < n; i++) q += `<circle cx="${x - 60 + (i % 5) * 30}" cy="${-30 - Math.floor(i / 5) * 30}" r="12" fill="${c}"/>`; return q; };
  const nIn = t < 7 ? 10 : 6, nOut = t < 7 ? 6 : 10;
  return R([
    { at: 0, f: () => head('「転入超過」＝ 入ってきた人 − 出ていった人', { y: 190 }) },
    { at: .4, slide: 0, f: () => `<path d="M${CX},880 L${CX - 60},960 L${CX + 60},960Z" fill="#8a8478"/><rect x="${CX - 6}" y="420" width="12" height="460" fill="#8a8478"/>`
        + `<g transform="translate(${CX},430) rotate(${tilt})"><rect x="-520" y="-6" width="1040" height="12" rx="6" fill="#cfc8b8"/>`
        + `<g transform="translate(-460,0) rotate(${-tilt})"><line y1="0" y2="200" stroke="#cfc8b8" stroke-width="3"/><g transform="translate(0,210)"><rect x="-120" y="0" width="240" height="14" rx="7" fill="#cfc8b8"/>${pile(0, nIn, Y)}</g></g>`
        + `<g transform="translate(460,0) rotate(${-tilt})"><line y1="0" y2="200" stroke="#cfc8b8" stroke-width="3"/><g transform="translate(0,210)"><rect x="-120" y="0" width="240" height="14" rx="7" fill="#cfc8b8"/>${pile(0, nOut, '#8a8478')}</g></g></g>` },
    { at: 1.0, f: () => txt(CX - 460, 760, '入ってくる人', { size: 40, color: Y }) + txt(CX + 460, 760, '出ていく人', { size: 40, color: C.dim }) },
    { at: 4.6, out: 6.8, f: () => txt(CX, 330, 'プラス ＝ 人を吸い込む', { size: 56, color: Y, serif: true }) },
    { at: 7.4, f: () => txt(CX, 330, 'マイナス ＝ 人を送り出す', { size: 56, color: '#9aa6b8', serif: true }) },
  ], t); }, 1, { enter: 'right', zoom: 0 });
// 8 年表：東京が吸い込み始めた年
SC[8] = K((t) => { const x0 = 260, x1 = 1660, yr = (y) => x0 + (y - 1990) / 30 * (x1 - x0), k = ease(clamp(t / 2.5));
  return R([
    { at: 0, f: () => head('東京が人を吸い込み始めた年', { y: 190 }) },
    { at: 0, slide: 0, f: () => `<rect x="${x0}" y="598" width="${(x1 - x0) * k}" height="4" fill="#cfc8b8"/>` + [1990, 2000, 2010, 2020].map(y => k * 30 + 1990 >= y ? `<rect x="${yr(y) - 2}" y="585" width="4" height="30" fill="#cfc8b8"/>` + txt(yr(y), 660, y + '年', { size: 34, color: C.dim }) : '').join('') },
    { at: 2.8, f: (lt) => `<g transform="translate(${yr(1995)},590) scale(${pop(lt / .4)})"><circle r="16" fill="${F}"/></g>` + txt(yr(1995), 500, '1995年', { size: 52, color: F, serif: true }) + txt(yr(1995), 440, '女性', { size: 40, color: F }) },
    { at: 4.8, f: (lt) => `<g transform="translate(${yr(1996)},590) scale(${pop(lt / .4)})"><circle r="16" fill="${M}"/></g>` + txt(yr(1996) + 40, 780, '1996年', { size: 52, color: M, serif: true }) + txt(yr(1996) + 40, 720, '男性（翌年）', { size: 40, color: M }) },
    { at: 6.6, f: () => txt(1300, 470, '女性の方が1年早い', { size: 56, color: Y, serif: true }) },
    ref('天野 (2021) ニッセイ基礎研究所'),
  ], t); }, 1, { enter: 'right', zoom: 0 });


// ===== 第1章 つづき =====
const IMGNOTE = { at: .3, f: () => note(1880, 1000 - 60, '※形はイメージ', 'end') };
const chapPhoto = (num, title) => [
  { at: .3, slide: 0, f: () => txt(CX, 440, num, { size: 40, color: C.o, serif: true, ls: 10 }) },
  { at: .55, f: () => txt(CX, 570, title, { size: 96, serif: true, ls: 4 }) }];
// 9 男女の線が並ぶ→2009年から女性が離れる（イメージ）
SC[9] = K((t) => { const x0 = 260, x1 = 1660, yb = 820, k = ease(clamp((t - .3) / 5.5)), X = (y) => x0 + (y - 1995) / 25 * (x1 - x0);
  const line = (fem) => { let d = ''; for (let i = 0; i <= 50; i++) { const y = 1995 + 25 * i / 50 * k, g = Math.max(0, y - 2009);
      const v = 120 + (y - 1995) * 6 + (fem ? g * g * 2.2 : g * .5); d += (i ? 'L' : 'M') + X(y).toFixed(1) + ',' + (yb - v).toFixed(1); } return d; };
  return R([
    { at: 0, f: () => head('東京への転入超過：男女の動き', { y: 190 }) },
    { at: 0, slide: 0, f: () => `<rect x="${x0}" y="${yb}" width="${x1 - x0}" height="3" fill="#6b665e"/>` + [1995, 2000, 2005, 2010, 2015, 2020].map(y => txt(X(y), yb + 50, y, { size: 30, color: C.dim })).join('')
        + `<path d="${line(0)}" stroke="${M}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="${line(1)}" stroke="${F}" stroke-width="8" fill="none" stroke-linecap="round"/>` },
    { at: 3.0, f: () => `<rect x="${X(2009) - 2}" y="300" width="4" height="${yb - 300}" fill="${Y}" opacity=".7"/>` + txt(X(2009), 290, '2009年ごろ', { size: 40, color: Y }) },
    { at: 5.6, f: () => txt(X(2020) + 20, 360, '女性', { size: 44, color: F, anchor: 'start' }) + txt(X(2020) + 20, 640, '男性', { size: 44, color: M, anchor: 'start' }) },
    IMGNOTE, ref('天野 (2021)／内閣府 地域の経済2024'),
  ], t); }, 1, { enter: 'right', zoom: 0 });
// 10 倍率 1.0 → 1.4 → 2.2
SC[10] = K((t) => { const B = [['〜2008年ごろ', 1.0, 0], ['2015年ごろ', 1.4, 1.6], ['2020年', 2.2, 4.6]], base = 840, u = 220;
  return R([
    { at: 0, f: () => head('女性は男性の何倍？（東京への転入超過）', { y: 190 }) },
    ...B.map((b, i) => ({ at: b[2], slide: 0, f: (lt) => { const h = b[1] * u * easeOut(clamp(lt / .9)), x = 520 + i * 440;
      return `<rect x="${x - 90}" y="${base - h}" width="180" height="${h}" rx="10" fill="${i == 2 ? F : '#c98aa3'}" opacity="${i == 2 ? 1 : .75}"/>` + txt(x, base - h - 30, b[1].toFixed(1) + '倍', { size: i == 2 ? 72 : 52, color: i == 2 ? Y : '#fff', serif: true }) + txt(x, base + 55, b[0], { size: 34, color: C.dim }); } })),
    { at: 0, slide: 0, f: () => `<rect x="300" y="${base}" width="1320" height="3" fill="#6b665e"/>` },
    ref('天野 (2021) ニッセイ基礎研究所'),
  ], t); }, 1, { enter: 'right', zoom: 0 });
// 11 写真：スーツケースを引いて歩く後ろ姿
SC[11] = K((t, dur) => photo('suitcase', t, dur, .35, 1.02, 1.1, -30) + R([
  { at: 3.2, f: () => txt(1360, 300, '強い意志で', { size: 72, serif: true }) + txt(1360, 400, '動いた人たち', { size: 72, serif: true }) },
  { at: 6.4, f: (lt) => `<g transform="translate(1360,540) scale(${pop(lt / .4)})">${txt(0, 30, 'その多くが女性', { size: 64, color: F, serif: true })}</g>` },
], t), 1, { enter: 'fade', zoom: 0 });
// 12 東京圏（1都3県）
SC[12] = K((t, dur) => { const P = [['埼玉', 760, 360], ['東京', 760, 560], ['千葉', 1160, 520], ['神奈川', 700, 760]];
  return photo('skyline', t, dur, 0.62) + R([
    { at: 0, f: () => head('東京圏（東京・埼玉・千葉・神奈川）で見ても', { y: 170 }) },
    ...P.map((p, i) => ({ at: .5 + i * .35, f: (lt) => `<g transform="translate(${p[1]},${p[2]}) scale(${pop(lt / .4)})"><rect x="-150" y="-80" width="300" height="160" rx="24" fill="rgba(255,214,102,.14)" stroke="${Y}" stroke-width="3"/>${txt(0, 16, p[0], { size: 52, color: Y })}</g>` })),
    { at: 3.2, slide: 0, f: (lt) => arrow(1700, 400, 1360, 520, F, easeOut(clamp(lt / .8)), 26) + arrow(1700, 700, 1360, 640, M, easeOut(clamp(lt / .8)), 12) },
    { at: 3.8, f: () => txt(1720, 380, '女性', { size: 44, color: F, anchor: 'start' }) + txt(1720, 740, '男性', { size: 44, color: M, anchor: 'start' }) },
    { at: 5.0, f: () => txt(1500, 900, '人口の割合で見ても、女性の方が大きい', { size: 40, color: '#fff' }) },
    ref('内閣府 地域の経済2024'),
  ], t); }, 1, { enter: 'right', zoom: 0 });
// 13 年齢別：20代前半が突出（イメージ）
SC[13] = K((t) => { const A = ['15-19', '20-24', '25-29', '30-34', '35-39', '40代', '50代'], H = [.45, 1, .55, .2, .1, .06, .04], base = 820;
  return R([
    { at: 0, f: () => head('一番多く動いているのは？', { y: 190 }) },
    { at: .3, slide: 0, f: () => A.map((a, i) => { const h = H[i] * 480 * easeOut(clamp((t - .3 - i * .12) / .8)), x = 380 + i * 200, hi = i == 1;
      return `<rect x="${x - 70}" y="${base - h}" width="140" height="${h}" rx="8" fill="${hi ? Y : '#8a8478'}"/>` + txt(x, base + 50, a + (i < 5 ? '歳' : ''), { size: 30, color: hi ? Y : C.dim }); }).join('') + `<rect x="280" y="${base}" width="1360" height="3" fill="#6b665e"/>` },
    { at: 3.4, f: (lt) => `<g transform="translate(980,330) scale(${pop(lt / .4)})">${txt(0, 0, '20代前半', { size: 72, color: Y, serif: true })}${txt(0, 60, '大学を出て、最初の仕事を選ぶ年ごろ', { size: 34 })}</g>` },
    IMGNOTE, ref('内閣府 地域の経済2024／総務省 住民基本台帳'),
  ], t); }, 1, { enter: 'right', zoom: 0 });
// 14 地図：東北・北関東・甲信越・東海 → 東京圏（20代前半は女性が多い）
const REG = [['東北', ['aomori', 'akita', 'morioka', 'yamagata', 'sendai', 'fukushima']], ['北関東', ['utsunomiya', 'maebashi', 'mito']], ['甲信越', ['niigata', 'nagano', 'kofu']], ['東海', ['shizuoka', 'nagoya']]];
const REG2 = [['東北', ['02', '03', '04', '05', '06', '07']], ['北関東', ['08', '09', '10']], ['甲信越', ['15', '19', '20']], ['東海', ['21', '22', '23', '24']]];
SC[14] = K((t) => { const k2 = ease(clamp((t - 6) / 1.2)), v = lerpV(VW.east, VW.kita, k2), V = vp(v), T = V(pc('13')), fills = { 13: Y };
  REG2.forEach((r, i) => { if (t > .6 + i * 1.1) r[1].forEach(c => fills[c] = k2 > 0 && i != 1 ? '#d9b8c4' : F); });
  const avg = (cs) => { const q = cs.map(pc); return [q.reduce((a, b) => a + b[0], 0) / q.length, q.reduce((a, b) => a + b[1], 0) / q.length]; };
  return R([
    { at: 0, slide: 0, f: () => jmap2(v, { fills }) },
    { at: 0, slide: 0, f: () => k2 > .5 ? '' : REG2.map((r, i) => { if (t < .6 + i * 1.1) return ''; const lt = t - .6 - i * 1.1, a = V(avg(r[1]));
        return arrow(a[0], a[1], a[0] + (T[0] - a[0]) * .8, a[1] + (T[1] - a[1]) * .8, '#fff', easeOut(clamp(lt / .8)), 9) + txt(a[0] + [0, 90, -90, -60][i], a[1] + [-30, 12, -20, 50][i], r[0], { size: 38, color: '#fff', anchor: ['middle', 'start', 'end', 'end'][i] }); }).join('') },
    { at: 6.3, f: () => [['09', '栃木'], ['10', '群馬'], ['08', '茨城'], ['13', '東京']].map(([c, n]) => plabel(v, c, n, { size: 40, color: '#1b1a20' })).join('') },
    { at: 3.8, slide: 0, f: () => card(1350, 380, 480, 220, { fill: 'rgba(20,18,26,.85)' }) + txt(1590, 460, '東京圏へ向かう20代前半', { size: 32 }) + txt(1590, 540, '女性 ＞ 男性', { size: 56, color: F, serif: true }) },
    ref('内閣府 地域の経済2024'),
  ], t); }, 1, { enter: 'right', zoom: 0 });

// 15 2024年 東京圏 +135,843人
SC[15] = K((t, dur) => photo('shinjuku', t, dur, 0.62) + R([
  { at: 0, f: () => head('2024年 東京圏への転入超過', { y: 220 }) },
  { at: .5, slide: 0, f: (lt) => `<g style="font-variant-numeric:tabular-nums">${txt(CX, 560, '＋' + Math.round(135843 * easeOut(clamp(lt / 3))).toLocaleString() + '人', { size: 150, color: Y, serif: true })}</g>` },
  { at: 5.0, f: () => txt(CX, 740, 'コロナ前の水準に、ほぼ戻った', { size: 50 }) },
  ref('総務省 住民基本台帳人口移動報告 2024'),
], t), 1, { enter: 'right', zoom: 0 });
// 16 「目標」の旗。矢印は止まらない
SC[16] = K((t) => { let ar = ''; for (let i = 0; i < 9; i++) { const u = ((t * .5 + i / 9) % 1), x = 200 + u * 1500, y = 420 + (i % 3) * 120; ar += `<g opacity="${Math.sin(Math.PI * u).toFixed(2)}"><path d="M${x - 60},${y} L${x + 40},${y}" stroke="${i % 3 ? F : M}" stroke-width="10" stroke-linecap="round"/><path d="M${x + 40},${y - 20} L${x + 70},${y} L${x + 40},${y + 20}Z" fill="${i % 3 ? F : M}"/></g>`; }
  return R([
    { at: 0, f: () => head('国の目標：東京への一極集中を止める', { y: 190 }) },
    { at: .3, slide: 0, f: () => ar },
    { at: .8, f: (lt) => `<g transform="translate(980,860) scale(${pop(lt / .4)})"><rect x="-4" y="-560" width="8" height="560" fill="#cfc8b8"/><path d="M4,-560 L220,-505 L4,-450Z" fill="${C.o}"/>${txt(100, -490, '目標', { size: 36, color: '#111', shadow: false })}</g>` },
    { at: 4.5, f: () => txt(CX, 960 - 60, 'それでも、流れは止まっていない', { size: 52, color: Y, serif: true }) },
  ], t); }, 1, { enter: 'right', zoom: 0 });
// 17 福井：20代女性が1年で4.05%減
SC[17] = K((t) => { const c = pc('18'), v = lerpV(VW.all, [c[0] + 30, c[1] + 10, 3.6], ease(clamp((t - .4) / 2.4))), on = t > 2.8;
  return R([
    { at: 0, slide: 0, f: () => jmap2(v, { fills: on ? { 18: `rgba(224,69,58,${(.75 + .25 * Math.sin(t * 4)).toFixed(2)})` } : {} }) },
    { at: 3.0, f: () => plabel(v, '18', '福井', { size: 52, color: '#fff' }) + [['17', '石川'], ['21', '岐阜']].map(([cc, n]) => plabel(v, cc, n, { size: 34, color: '#5a554c' })).join('') },
    { at: .6, f: () => card(1350, 220, 500, 520, { fill: 'rgba(20,18,26,.88)' }) + txt(1600, 300, '20代女性が', { size: 44 }) + txt(1600, 360, '1年でどれだけ減った？', { size: 40 }) },
    { at: 4.0, f: (lt) => `<g transform="translate(1600,560) scale(${pop(lt / .4)})">${txt(0, 0, '−4.05%', { size: 120, color: '#ff7a6a', serif: true })}</g>` + txt(1600, 660, '全国で一番の減り方', { size: 36, color: C.dim }) },
    ref('舞田敏彦 (Newsweek日本版)'),
  ], t); }, 1, { enter: 'right', zoom: 0 });

// 18 10年続けば3分の1がいなくなる
SC[18] = K((t) => { const n = 30, gone = Math.min(10, Math.floor(clamp((t - 1.2) / 5) * 10.99)); let s0 = '';
  for (let i = 0; i < n; i++) { const x = 330 + (i % 15) * 90, y = 520 + Math.floor(i / 15) * 170, out = i >= n - gone; s0 += `<g opacity="${out ? .12 : 1}">${person(x, y, 70, F, 'f')}</g>`; }
  return R([
    { at: 0, f: () => head('1年で4%が10年続くと…', { y: 190 }) },
    { at: .2, slide: 0, f: () => s0 + `<g style="font-variant-numeric:tabular-nums">${txt(CX, 330, (gone) + '年後', { size: 60, color: Y, serif: true })}</g>` },
    { at: 6.4, f: (lt) => `<g transform="translate(${CX},880) scale(${pop(lt / .4)})">${txt(0, 0, '20代女性の3分の1がいなくなる計算', { size: 56, color: '#ff7a6a', serif: true })}</g>` },
  ], t); }, 1, { enter: 'right', zoom: 0 });

// ===== 第2章 =====
SC[19] = K((t, dur) => photo('shutter', t, dur, .55, 1.0, 1.08) + R(chapPhoto('第2章', '残された男たち'), t), 2, { enter: 'zoom', zoom: 0 });
// 20 日本全体では女性が344万人多い
SC[20] = K((t, dur) => photo('scramble', t, dur, 0.66) + R([
  { at: 0, f: () => head('日本の人口（2020年 国勢調査）', { y: 190 }) },
  { at: .5, slide: 0, f: (lt) => { const k = easeOut(clamp(lt / 1.2)); return `<rect x="360" y="420" width="${1150 * k}" height="130" rx="12" fill="${F}"/><rect x="360" y="620" width="${1118 * k}" height="130" rx="12" fill="${M}"/>` + txt(330, 505, '女性', { size: 48, color: F, anchor: 'end' }) + txt(330, 705, '男性', { size: 48, color: M, anchor: 'end' }); } },
  { at: 2.2, f: () => `<rect x="1478" y="400" width="32" height="170" fill="none" stroke="${Y}" stroke-width="4"/>` + txt(1560, 380, '＋344万人', { size: 64, color: Y, serif: true, anchor: 'start' }) },
  { at: 4.0, f: () => txt(CX, 880, '実は、女性の方が多い', { size: 54 }) },
  ref('総務省 令和2年国勢調査'),
], t), 2, { enter: 'right', zoom: 0 });
// 21 年齢ピラミッド：上の方だけ女性が多い（イメージ）
SC[21] = K((t) => { const N = 9, base = 860, hh = 62; let s0 = '';
  for (let i = 0; i < N; i++) { const y = base - (i + 1) * hh, top = i >= 6, wm = (300 - i * 22) * (top ? .75 - (i - 6) * .15 : 1), wf = (300 - i * 22) * (top ? 1 : .96), k = easeOut(clamp((t - .3 - i * .08) / .7));
    s0 += `<rect x="${CX - 6 - wm * k}" y="${y}" width="${wm * k}" height="${hh - 8}" rx="6" fill="${M}"/><rect x="${CX + 6}" y="${y}" width="${wf * k}" height="${hh - 8}" rx="6" fill="${F}" ${top && t > 3 ? `stroke="${Y}" stroke-width="4"` : ''}/>`; }
  return R([
    { at: 0, f: () => head('女性が多いのは、長生きだから', { y: 190 }) },
    { at: 0, slide: 0, f: () => s0 + txt(CX - 380, 900, '男性', { size: 40, color: M }) + txt(CX + 380, 900, '女性', { size: 40, color: F }) },
    { at: 3.2, f: () => txt(CX + 520, 330, '高齢の世代', { size: 40, color: Y, anchor: 'start' }) },
    { at: 5.0, f: () => txt(CX + 520, 780, '若い世代は？', { size: 44, color: '#fff', anchor: 'start' }) },
    IMGNOTE,
  ], t); }, 2, { enter: 'right', zoom: 0 });
// 22 未婚の若い女性が男性の4分の3に届かない県
SC[22] = K((t) => R([
  { at: 0, f: () => head('結婚していない若い世代（一部の県）', { y: 190 }) },
  { at: .6, slide: 0, f: () => [0, 1, 2, 3].map(i => person(560 + i * 140, 560, 110, M)).join('') + txt(770, 790, '男性 4人', { size: 44, color: M }) },
  { at: 2.6, slide: 0, f: () => [0, 1, 2].map(i => `<g ${i == 2 ? 'clip-path="url(#cut3)"' : ''}>${person(1180 + i * 140, 560, 110, F, 'f')}</g>`).join('') + `<clipPath id="cut3"><rect x="1400" y="380" width="${80 * .9}" height="300"/></clipPath>` + txt(1320, 790, '女性 3人に届かない', { size: 44, color: F }) },
  ref('山田昌弘（中央大学）'),
], t), 2, { enter: 'right', zoom: 0 });
// 23 あぶれた男性がグレーに
SC[23] = K((t) => { const g = t > 2.2; return R([
  { at: 0, f: () => head('男性4人に、女性は3人いない', { y: 190 }) },
  { at: 0, slide: 0, f: () => [0, 1, 2].map(i => person(560 + i * 140, 560, 110, M) + `<rect x="${576 + i * 140}" y="${470}" width="0" height="0"/>`).join('') + `<g opacity="${g ? .35 : 1}">${person(980, 560, 110, g ? '#777' : M)}</g>` + [0, 1, 2].map(i => `<g ${i == 2 ? 'clip-path="url(#cut3b)"' : ''}>${person(1180 + i * 140, 560, 110, F, 'f')}</g>`).join('') + `<clipPath id="cut3b"><rect x="1400" y="380" width="72" height="300"/></clipPath>` },
  { at: 2.4, f: () => txt(980, 760, '相手が見つからない', { size: 40, color: '#aaa' }) },
  { at: 4.2, f: () => txt(CX, 900, '努力ではなく、数の問題', { size: 54, color: Y, serif: true }) },
], t); }, 2, { enter: 'right', zoom: 0 });
// 24 地図アプリ風：周りに女性がいない
SC[24] = K((t) => { const r = 120 + ((t * 160) % 420); let dots = ''; const rr = rnd(5);
  for (let i = 0; i < 26; i++) { const a = rr() * 6.28, d = 140 + rr() * 380; dots += `<circle cx="${CX + Math.cos(a) * d}" cy="${560 + Math.sin(a) * d * .8}" r="12" fill="${i < 2 ? F : '#5b6f99'}" opacity="${i < 2 ? .9 : .6}"/>`; }
  return R([
    { at: 0, slide: 0, f: () => `<rect x="360" y="230" width="1200" height="660" rx="30" fill="#232a33"/>` + `<path d="M360,420 L1560,520 M700,230 L820,890 M360,760 L1560,640 M1240,230 L1140,890" stroke="#39434f" stroke-width="22"/>` + dots
        + `<circle cx="${CX}" cy="560" r="${r}" fill="none" stroke="${M}" stroke-width="3" opacity="${(1 - (r - 120) / 420).toFixed(2)}"/><circle cx="${CX}" cy="560" r="16" fill="${M}" stroke="#fff" stroke-width="4"/>` },
    { at: 2.0, f: () => card(1600, 300, 290, 200) + txt(1745, 370, '近くの同世代', { size: 28, color: C.dim }) + txt(1745, 440, '女性 少ない', { size: 40, color: F }) },
    { at: 5.0, f: () => txt(CX, 980 - 50, 'そもそも、近くにいない', { size: 52, color: Y, serif: true }) },
  ], t); }, 2, { enter: 'right', zoom: 0 });
// 25 ゆりかごが減る
const cradle = (x, y, c, a) => `<g transform="translate(${x},${y})" opacity="${a}"><path d="M-50,0 A50,40 0 0 0 50,0 Z" fill="${c}"/><path d="M-50,0 A50,50 0 0 1 10,-48" stroke="${c}" stroke-width="8" fill="none"/><rect x="-36" y="38" width="8" height="22" fill="${c}"/><rect x="28" y="38" width="8" height="22" fill="${c}"/></g>`;
SC[25] = K((t) => { const gone = Math.floor(clamp((t - 2) / 3) * 6.99); return R([
  { at: 0, f: () => head('恋愛だけの話ではない', { y: 190 }) },
  { at: .3, slide: 0, f: () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => person(260 + i * 150, 470, 90, F, 'f')).map((p, i) => `<g opacity="${i >= 10 - gone ? .12 : 1}">${p}</g>`).join('') + txt(CX, 600, '子どもを産む年代の女性', { size: 36, color: F }) },
  { at: 1.2, slide: 0, f: () => [0, 1, 2, 3, 4, 5, 6, 7].map(i => cradle(400 + i * 160, 790, '#e8d9b0', i >= 8 - Math.floor(gone * .9) ? .12 : 1)).join('') + txt(CX, 920, 'その地域で生まれる子ども', { size: 36, color: '#e8d9b0' }) },
], t); }, 2, { enter: 'right', zoom: 0 });
// 26 地図の地方部分が暗くなる
SC[26] = K((t) => { const j = J2(), T = pc('13'), v = lerpV(VW.all, [600, 440, 1.05], ease(t / 6)), fills = {};
  for (const [c, pf] of Object.entries(j.prefs)) { if (['11', '12', '13', '14'].includes(c)) { fills[c] = Y; continue; }
    const dist = Math.hypot(pf.c[0] - T[0], pf.c[1] - T[1]), k = clamp((t - .4 - dist / 260) / 1.2); fills[c] = k <= 0 ? '#cfc8b8' : `rgb(${Math.round(207 - 160 * k)},${Math.round(200 - 155 * k)},${Math.round(184 - 130 * k)})`; }
  const q = vp(v)(T);
  return R([
    { at: 0, slide: 0, f: () => jmap2(v, { fills, stroke: '#111' }) + `<circle cx="${q[0]}" cy="${q[1]}" r="${30 + 20 * ease(clamp(t / 4))}" fill="${Y}" opacity=".35" filter="url(#glow)"/>` },
    { at: 3.0, f: () => txt(1560, 520, '次の世代ごと', { size: 60, serif: true }) + txt(1560, 610, '地方から人がいなくなる', { size: 48 }) },
  ], t); }, 2, { enter: 'right', zoom: 0 });

// 27 写真：雪の夜のコンビニ
SC[27] = K((t, dur) => photo('konbini', t, dur, .3, 1.0, 1.08, 40) + R([
  { at: 2.0, f: () => txt(560, 300, '地元に残った男たちは', { size: 60, serif: true }) + txt(560, 390, '満足しているのか？', { size: 60, serif: true, color: Y }) },
], t), 2, { enter: 'fade', zoom: 0 });
// 28-29 満足度メーター
const meter = (x, y, pct, label, col, lt) => { const k = easeOut(clamp(lt / 1.4)), a = Math.PI * (1 - pct / 100 * k), r = 200;
  return `<path d="M${x - r},${y} A${r},${r} 0 0 1 ${x + r},${y}" stroke="#3a3842" stroke-width="44" fill="none"/>`
    + `<path d="M${x - r},${y} A${r},${r} 0 0 1 ${(x + r * Math.cos(a)).toFixed(1)},${(y - r * Math.sin(a)).toFixed(1)}" stroke="${col}" stroke-width="44" fill="none"/>`
    + `<g style="font-variant-numeric:tabular-nums">${txt(x, y - 20, (pct * k).toFixed(1) + '%', { size: 80, color: '#fff', serif: true })}</g>` + txt(x, y + 70, label, { size: 40, color: col }); };
SC[28] = K((t) => R([
  { at: 0, f: () => head('今住んでいる地域に満足している（男性）', { y: 190 }) },
  { at: 1.0, slide: 0, f: (lt) => meter(CX, 680, 43.2, '東北の男性', M, lt) },
  { at: 4.5, f: () => txt(CX, 860, '男性で一番低い', { size: 48, color: Y, serif: true }) },
  ref('内閣府 令和6年 地方の暮らしに関する調査'),
], t), 2, { enter: 'right', zoom: 0 });
SC[29] = K((t) => R([
  { at: 0, f: () => head('今住んでいる地域に満足している（男性）', { y: 190 }) },
  { at: 0, slide: 0, f: (lt) => meter(600, 680, 60.2, '全国の男性', '#9aa6b8', lt + 2) },
  { at: 0, slide: 0, f: (lt) => meter(1320, 680, 43.2, '東北の男性', M, lt + 2) },
  { at: 2.5, f: () => txt(CX, 880, '残った男性も、満足しているわけではない', { size: 48, color: Y, serif: true }) },
  ref('内閣府 令和6年 地方の暮らしに関する調査'),
], t), 2, { enter: 'fade', zoom: 0 });


// ===== 第3章 =====
const chapEls = (num, title) => [
  { at: 0, slide: 0, f: () => txt(CX, 400, num, { size: 40, color: C.o, serif: true, ls: 10 }) },
  { at: .25, f: () => txt(CX, 530, title, { size: 92, serif: true, ls: 4 }) },
  { at: .7, slide: 0, f: (lt) => `<rect x="${CX - 320 * ease(lt / .8)}" y="580" width="${640 * ease(lt / .8)}" height="3" fill="${C.o}"/>` }];
const tag = (x, y, w, s0, col, lt, o = {}) => `<g transform="translate(${x},${y}) scale(${pop(lt / .4)})"><rect x="${-w / 2}" y="-52" width="${w}" height="104" rx="18" fill="${o.fill || 'rgba(255,255,255,.07)'}" stroke="${col}" stroke-width="3"/>${txt(0, 16, s0, { size: o.size || 44, color: col })}</g>`;
const R7 = ref('内閣府 男女共同参画白書 令和7年版');
SC[30] = K((t) => R(chapEls('第3章', 'なぜ、出ていくのか'), t), 3, { enter: 'zoom', zoom: 0 });
// 31 アンケート用紙 1万人
SC[31] = K((t, dur) => photo('tstreet', t, dur, 0.62) + R([
  { at: .2, slide: 0, f: (lt) => { let q = ''; for (let i = 0; i < 5; i++) { const k = easeOut(clamp((lt - i * .15) / .6)); q += `<g transform="translate(${560 + i * 26},${300 + i * 20 - (1 - k) * 80}) rotate(${-6 + i * 3})" opacity="${k}"><rect width="420" height="560" rx="14" fill="#efeae0"/>${[0, 1, 2, 3, 4].map(j => `<rect x="50" y="${90 + j * 90}" width="30" height="30" rx="4" fill="none" stroke="#8a8478" stroke-width="4"/><rect x="100" y="${98 + j * 90}" width="${220 - j * 18}" height="14" rx="7" fill="#c9c2b4"/>`).join('')}</g>`; } return q; } },
  { at: 1.4, f: (lt) => `<g transform="translate(1380,430) scale(${pop(lt / .4)})">${txt(0, 0, '1万人', { size: 130, color: Y, serif: true })}</g>` + txt(1380, 520, '18〜39歳の男女', { size: 40 }) },
  { at: 4.2, f: () => txt(1380, 640, '地方出身 → 今は東京圏', { size: 44, color: F }) + txt(1380, 720, '「地元を離れた理由は？」', { size: 44 }) },
  R7,
], t), 3, { enter: 'right', zoom: 0 });
// 32 1位 進学先
SC[32] = K((t, dur) => photo('campus', t, dur, 0.6) + R([
  { at: 0, f: () => head('地元を離れた理由', { y: 190 }) },
  { at: .5, f: (lt) => `<g transform="translate(${CX},520) scale(${pop(lt / .4)})"><circle cx="-520" r="80" fill="${Y}"/>${txt(-520, 26, '1位', { size: 56, color: '#111', shadow: false, serif: true })}</g>` + txt(CX + 60, 545, '希望する進学先が、地元に少ない', { size: 64 }) },
  { at: 2.6, f: () => txt(CX, 720, '男女とも同じ', { size: 48, color: C.dim }) },
  R7,
], t), 3, { enter: 'right', zoom: 0 });
// 33 高卒就職↓ 大学進学↑（30年前→今）
SC[33] = K((t) => { const g = (x, a, b, col, lab, ratio, t0) => { const k = easeOut(clamp((t - t0) / 1.2)), hb = a + (b - a) * k;
    return `<rect x="${x - 170}" y="${820 - a}" width="140" height="${a}" rx="8" fill="#6b665e"/><rect x="${x + 30}" y="${820 - hb}" width="140" height="${hb}" rx="8" fill="${col}"/>`
      + txt(x - 100, 870, '30年前', { size: 30, color: C.dim }) + txt(x + 100, 870, '今', { size: 30, color: C.dim }) + txt(x, 300, lab, { size: 48, color: col }) + (k > .9 ? txt(x + 100, 820 - hb - 26, ratio, { size: 50, color: Y, serif: true }) : ''); };
  return R([
    { at: 0, slide: 0, f: () => g(620, 260, 130, '#9aa6b8', '高校を出てすぐ就職', '約半分', .6) + g(1300, 150, 420, Y, '大学へそのまま進学', '3倍近く', 4.0) + `<rect x="380" y="820" width="1160" height="3" fill="#6b665e"/>` },
    ref('内閣府 地域の経済2024'), { at: .3, f: () => note(1880, 1000 - 60, '※棒の長さは目安', 'end') },
  ], t); }, 3, { enter: 'right', zoom: 0 });
// 34 地方の地図：大学のアイコンが少ない
const uni = (x, y, c, s0 = 1) => `<g transform="translate(${x},${y}) scale(${s0})"><path d="M-22,-8 L0,-22 L22,-8Z" fill="${c}"/><rect x="-18" y="-8" width="36" height="22" fill="${c}"/></g>`;
SC[34] = K((t) => { const vL = [640, 450, 4.6], vR = [700, 300, 2.3];
  const icons = (V, c0, n, cols, gap) => { const c = V(pc(c0)); let q = ''; for (let i = 0; i < n; i++) { const a = clamp((t - 1.4 - i * .1) / .3); if (a <= 0) continue; q += `<g opacity="${a}">${uni(c[0] + ((i % cols) - (cols - 1) / 2) * gap, c[1] + (Math.floor(i / cols) - (Math.ceil(n / cols) - 1) / 2) * gap * .8, Y, 1.1)}</g>`; } return q; };
  const VL = vp(vL, 520, 560), VR = vp(vR, 1400, 560);
  return R([
    { at: 0, slide: 0, f: () => `<clipPath id="pl"><rect x="120" y="230" width="800" height="680" rx="24"/></clipPath><clipPath id="pr"><rect x="1000" y="230" width="800" height="680" rx="24"/></clipPath>`
        + `<g clip-path="url(#pl)"><rect x="120" y="230" width="800" height="680" fill="#24222c"/>${jmap2(vL, { ox: 520, oy: 560, fills: { 11: '#e6dcc0', 12: '#e6dcc0', 13: '#e6dcc0', 14: '#e6dcc0' }, base: '#8a8478' })}${icons(VL, '13', 12, 4, 62)}</g>`
        + `<g clip-path="url(#pr)"><rect x="1000" y="230" width="800" height="680" fill="#24222c"/>${jmap2(vR, { ox: 1400, oy: 560, fills: { '02': '#e6dcc0', '03': '#e6dcc0', '04': '#e6dcc0', '05': '#e6dcc0', '06': '#e6dcc0', '07': '#e6dcc0' }, base: '#8a8478' })}${['02', '03', '05', '06'].map(c => { const a = clamp((t - 2.2) / .3), q = VR(pc(c)); return a > 0 ? `<g opacity="${a}">${uni(q[0], q[1], Y, 1.1)}</g>` : ''; }).join('')}</g>` },
    { at: .2, f: () => txt(520, 200, '東京圏', { size: 48, color: Y }) + txt(1400, 200, '東北', { size: 48, color: '#cfd4dc' }) },
    { at: 3.2, f: () => txt(CX, 980, '大学に行く人が増えれば、出ていくのは自然な流れ', { size: 42, color: Y }) },
    { at: .3, f: () => note(1880, 140, '※アイコンの数はイメージ', 'end') },
  ], t); }, 3, { enter: 'right', zoom: 0 });

// 35 進学先が理由：男性29.7% 女性42.1%
SC[35] = K((t) => R([
  { at: 0, f: () => head('「進学先が少ない」を選んだ割合', { y: 190 }) },
  { at: .4, slide: 0, f: (lt) => { const k = easeOut(clamp(lt / 1.2)); return `<rect x="420" y="400" width="${1200 * .297 / .45 * k}" height="130" rx="12" fill="${M}"/><rect x="420" y="620" width="${1200 * .421 / .45 * k}" height="130" rx="12" fill="${F}"/>` + txt(390, 485, '男性', { size: 46, color: M, anchor: 'end' }) + txt(390, 705, '女性', { size: 46, color: F, anchor: 'end' })
      + (k > .95 ? txt(420 + 1200 * .297 / .45 + 30, 490, '29.7%', { size: 60, color: M, anchor: 'start', serif: true }) + txt(420 + 1200 * .421 / .45 + 30, 710, '42.1%', { size: 60, color: F, anchor: 'start', serif: true }) : ''); } },
  R7,
], t), 3, { enter: 'right', zoom: 0 });
// 36 2位 仕事が少ない
SC[36] = K((t, dur) => photo('office', t, dur, 0.62) + R([
  { at: 0, f: () => head('地元を離れた理由', { y: 190 }) },
  { at: 0, slide: 0, f: () => `<g opacity=".45"><circle cx="440" cy="420" r="60" fill="${Y}"/>${txt(440, 440, '1位', { size: 40, color: '#111', shadow: false, serif: true })}${txt(540, 440, '進学先が少ない', { size: 50, anchor: 'start' })}</g>` },
  { at: .6, f: (lt) => `<g transform="translate(440,620) scale(${pop(lt / .4)})"><circle r="60" fill="#cfd4dc"/>${txt(0, 20, '2位', { size: 40, color: '#111', shadow: false, serif: true })}</g>` + txt(540, 640, 'やりたい仕事・就職先が少ない', { size: 56, anchor: 'start' }) },
  { at: 4.0, f: () => txt(CX, 860, 'ここまでは、想像しやすい', { size: 46, color: C.dim }) },
  R7,
], t), 3, { enter: 'right', zoom: 0 });
// 37 「地元から離れたかった」が赤く光る
SC[37] = K((t) => R([
  { at: 0, f: () => head('女性の方が多く選んだ、もう1つの理由', { y: 190 }) },
  { at: 3.2, f: (lt) => `<rect x="${CX - 560}" y="420" width="1120" height="200" rx="28" fill="rgba(224,69,58,${(.18 + .1 * Math.sin(lt * 4)).toFixed(2)})" stroke="#ff6a5a" stroke-width="5" filter="url(#glow)"/>` + `<g transform="translate(${CX},545) scale(${pop(lt / .4)})">${txt(0, 0, '地元から離れたかった', { size: 88, color: '#fff', serif: true })}</g>` },
  R7,
], t), 3, { enter: 'right', zoom: 0 });
// 38 玄関とスーツケースの後ろ姿（2D）
SC[38] = K((t) => { const k = ease(clamp(t / 4)); return R([
  { at: 0, slide: 0, f: () => `<rect x="560" y="200" width="800" height="700" fill="#2a2420"/><rect x="620" y="250" width="680" height="650" fill="#ffd9a0" opacity="${(.25 + .2 * k).toFixed(2)}"/><rect x="560" y="880" width="800" height="40" fill="#4a3c30"/>`
      + `<g transform="translate(${CX - 60 + 30 * k},${800 - 10 * k}) scale(${1 - .15 * k})">${person(0, 0, 220, '#2b2b33', 'f')}<rect x="70" y="-60" width="80" height="120" rx="12" fill="#3b6fb0"/><rect x="104" y="-90" width="12" height="32" fill="#888"/></g>` },
  { at: 1.2, f: () => txt(CX, 160, '進学や仕事のためではなく', { size: 44, color: C.dim }) },
], t); }, 3, { enter: 'fade', zoom: 0 });
// 39-41 理由の札
SC[39] = K((t) => R([
  { at: 0, f: () => head('「離れたかった」人が、あわせて選んだ理由', { y: 190 }) },
  ...['親や周りの干渉から逃れたかった', '居場所がなかった', '出会いやチャンスが少なそう'].map((s0, i) => ({ at: 1 + i * 1.8, slide: 0, f: (lt) => tag(CX, 380 + i * 180, 1000, s0, '#fff', lt, { size: 52 }) })),
  R7,
], t), 3, { enter: 'right', zoom: 0 });
SC[40] = K((t, dur) => photo('country', t, dur, 0.55) + R([
  { at: 0, f: () => head('ほかにも', { y: 190 }) },
  ...['若い人が楽しめる場所が少ない', '生活に必要な施設・サービスが足りない'].map((s0, i) => ({ at: .6 + i * 2, slide: 0, f: (lt) => tag(CX, 450 + i * 200, 1100, s0, '#cfd4dc', lt, { size: 52 }) })),
  R7,
], t), 3, { enter: 'right', zoom: 0 });
SC[41] = K((t) => R([
  { at: 0, f: () => head('女性だけ、目立った理由', { y: 190 }) },
  { at: 2.6, slide: 0, f: (lt) => tag(CX, 540, 1240, '多様な価値観が、受け入れられなそう', F, lt, { size: 60, fill: 'rgba(239,127,168,.12)' }) },
  R7,
], t), 3, { enter: 'right', zoom: 0 });
// 42 地元の空気：吹き出し
SC[42] = K((t, dur) => photo('village', t, dur, 0.55) + R([
  { at: 0, f: () => head('出身地域に強く感じていた「空気」', { y: 190 }) },
  { at: 4.4, f: () => bubble(620, 470, 640, 130, '個人の気持ちより、世間体', { size: 46 }) },
  { at: 7.0, f: () => bubble(1300, 700, 760, 130, '家事・育児・介護は女性の仕事', { size: 46 }) },
  R7,
], t), 3, { enter: 'right', zoom: 0 });
// 43 男性にもあるが、差は女性の方が大きい
SC[43] = K((t) => R([
  { at: 0, f: () => head('「空気」を感じた割合の差', { y: 190 }) },
  { at: .4, slide: 0, f: () => person(700, 560, 200, M) + person(1220, 560, 200, F, 'f') },
  { at: 1.0, f: (lt) => `<rect x="${700 - 60}" y="${820}" width="120" height="${-40 * easeOut(clamp(lt / .8))}" fill="${M}"/>` },
  { at: 1.6, f: (lt) => `<rect x="${1220 - 60}" y="${820}" width="120" height="${-110 * easeOut(clamp(lt / .8))}" fill="${F}"/>` },
  { at: 2.6, f: () => txt(700, 900, '男性にも', { size: 40, color: M }) + txt(1220, 900, '女性の方が大きい', { size: 40, color: F }) },
  { at: .3, f: () => note(1880, 1000 - 60, '※高さはイメージ', 'end') }, R7,
], t), 3, { enter: 'right', zoom: 0 });
// 44 仕事＋大学 だけでは足りない
SC[44] = K((t) => R([
  { at: .3, f: (lt) => tag(560, 480, 400, '仕事', '#cfd4dc', lt, { size: 60 }) },
  { at: .8, f: () => txt(800, 500, '＋', { size: 80 }) },
  { at: 1.0, f: (lt) => tag(1040, 480, 400, '大学', '#cfd4dc', lt, { size: 60 }) },
  { at: 2.0, f: () => txt(1330, 500, '＋', { size: 80 }) },
  { at: 2.2, f: (lt) => tag(1580, 480, 360, '空気？', F, lt, { size: 60, fill: 'rgba(239,127,168,.12)' }) },
  { at: 3.4, f: () => txt(CX, 760, '仕事や大学を増やすだけでは、止まらない', { size: 54, color: Y, serif: true }) },
], t), 3, { enter: 'right', zoom: 0 });

// ===== 第4章 =====
SC[45] = K((t) => R(chapEls('第4章', '家の形と、出ていく女性'), t), 4, { enter: 'zoom', zoom: 0 });
// 46 3世代の家（2D）
SC[46] = K((t) => R([
  { at: 0, slide: 0, f: () => `<path d="M420,520 L960,250 L1500,520Z" fill="#3a3430"/><rect x="480" y="520" width="960" height="330" fill="#2c2622"/><rect x="480" y="800" width="960" height="30" fill="#5a4a3a"/>` + [0, 1, 2, 3].map(i => `<rect x="${540 + i * 225}" y="580" width="180" height="200" fill="#ffd9a0" opacity=".28"/>`).join('') },
  { at: 1.5, slide: 0, f: () => person(700, 790, 150, '#cfc8b8') + person(840, 790, 150, '#cfc8b8', 'f') + person(1040, 790, 150, M) + person(1180, 790, 150, F, 'f') + person(1320, 800, 100, '#e8d9b0', 'f') },
  { at: 3.0, f: () => txt(CX, 170, '祖父母・親・子の「3世代」で暮らす女性の割合', { size: 44 }) },
  { at: 6.4, f: () => txt(CX, 960 - 40, '×　20代女性が出ていく割合', { size: 48, color: F }) },
  ref('舞田敏彦 (Newsweek日本版)'),
], t), 4, { enter: 'fade', zoom: 0 });
// 47 散布図：右上がり r=0.59
const SCAT = (() => { const r = rnd(21), o = []; for (let i = 0; i < 47; i++) { const x = r(), y = .59 * x + .81 * (r() - .5) * .9 + .2; o.push([x, Math.max(0, Math.min(1, y))]); } return o; })();
SC[47] = K((t) => { const X = (v) => 460 + v * 1000, Y0 = (v) => 860 - v * 560;
  return R([
    { at: 0, slide: 0, f: () => `<rect x="440" y="860" width="1060" height="3" fill="#6b665e"/><rect x="440" y="280" width="3" height="583" fill="#6b665e"/>` + txt(950, 930, '3世代で暮らす女性の割合 →', { size: 34, color: C.dim }) + `<g transform="translate(380,580) rotate(-90)">${txt(0, 0, '20代女性が出ていく割合 →', { size: 34, color: C.dim })}</g>` },
    { at: .3, slide: 0, f: (lt) => SCAT.map((p, i) => lt > i * .05 ? `<circle cx="${X(p[0])}" cy="${Y0(p[1])}" r="11" fill="${F}" opacity=".85"/>` : '').join('') },
    { at: 3.2, slide: 0, f: (lt) => { const k = ease(clamp(lt / .8)); return `<path d="M${X(0)},${Y0(.2)} L${X(k)},${Y0(.2 + .59 * k)}" stroke="${Y}" stroke-width="6" stroke-dasharray="14 10"/>`; } },
    { at: 4.0, f: () => txt(1680, 400, '相関', { size: 40, color: C.dim }) + txt(1680, 500, '0.59', { size: 96, color: Y, serif: true }) },
    { at: .3, f: () => note(1880, 1000 - 60, '※点の位置はイメージ（相関の値は研究から）', 'end') }, ref('舞田敏彦 (Newsweek日本版)'),
  ], t); }, 4, { enter: 'right', zoom: 0 });
// 48 相関 ≠ 原因
SC[48] = K((t) => R([
  { at: .3, slide: 0, f: () => tag(620, 440, 520, '3世代の家が多い', '#cfd4dc', 1, { size: 46 }) + tag(1300, 440, 560, '若い女性が出ていく', F, 1, { size: 46 }) },
  { at: 1.0, f: () => txt(CX, 455, '⇄', { size: 70, color: Y }) + txt(CX, 360, '一緒に動いている', { size: 36, color: Y }) },
  { at: 4.0, f: (lt) => `<g transform="translate(${CX},720) scale(${pop(lt / .4)})">${txt(0, 0, '「追い出している」とまでは言えない', { size: 60, serif: true })}</g>` + txt(CX, 820, '相関 ≠ 原因', { size: 44, color: C.dim }) },
], t), 4, { enter: 'right', zoom: 0 });
// 49 2枚のカードを重ねる
SC[49] = K((t) => { const k = ease(clamp((t - 2) / 1.2)); return R([
  { at: 0, slide: 0, f: () => `<g transform="translate(${-260 * (1 - k) + 0},0)">${card(480, 330, 560, 380)}${txt(760, 420, '3世代の家', { size: 46 })}${txt(760, 520, '相関 0.59', { size: 60, color: Y, serif: true })}</g>`
      + `<g transform="translate(${260 * (1 - k) + 0},40)">${card(880, 330, 560, 380, { fill: 'rgba(60,40,50,.9)' })}${txt(1160, 420, '調査の答え', { size: 46 })}${txt(1160, 520, '世間体', { size: 46, color: F })}${txt(1160, 600, '家事は女性の仕事', { size: 40, color: F })}</g>` },
  { at: 4.4, f: () => txt(CX, 880, '重ねると、無視できない数字', { size: 54, color: Y, serif: true }) },
], t); }, 4, { enter: 'right', zoom: 0 });
// 50-51 女性の満足度
const RS = ref('内閣府 令和6年 地方の暮らしに関する調査');
SC[50] = K((t, dur) => photo('tnight', t, dur, 0.6) + R([
  { at: 0, f: () => head('今住んでいる地域に満足している（女性）', { y: 190 }) },
  { at: 1.0, slide: 0, f: (lt) => meter(CX, 680, 75.5, '東京圏の女性', F, lt) },
  { at: 4.0, f: () => txt(CX, 860, '4人に3人', { size: 52, color: Y, serif: true }) }, RS,
], t), 4, { enter: 'right', zoom: 0 });
SC[51] = K((t) => R([
  { at: 0, f: () => head('今住んでいる地域に満足している（女性）', { y: 190 }) },
  { at: 0, slide: 0, f: (lt) => meter(520, 680, 75.5, '東京圏', '#cfc8b8', lt + 2) },
  { at: .6, slide: 0, f: (lt) => meter(CX, 680, 51.6, '東北', F, lt) },
  { at: 4.0, slide: 0, f: (lt) => meter(1400, 680, 55.9, '北関東・甲信', F, lt) }, RS,
], t), 4, { enter: 'fade', zoom: 0 });
// 52 地元への愛着：女性58.0% 男性51.6%
const heart = (x, y, s0, c) => `<path transform="translate(${x},${y}) scale(${s0})" d="M0,30 C-60,-10 -40,-70 0,-40 C40,-70 60,-10 0,30Z" fill="${c}"/>`;
SC[52] = K((t) => R([
  { at: 0, f: () => head('地元への愛着がある', { y: 190 }) },
  { at: .5, f: (lt) => heart(700, 560, 2.2 * pop(lt / .4), F) + txt(700, 760, '女性 58.0%', { size: 54, color: F, serif: true }) },
  { at: 1.2, f: (lt) => heart(1220, 570, 2.0 * pop(lt / .4), M) + txt(1220, 760, '男性 51.6%', { size: 54, color: M, serif: true }) },
  { at: 5.0, f: () => txt(CX, 900, '好きでも、居づらい', { size: 58, color: Y, serif: true }) }, R7,
], t), 4, { enter: 'right', zoom: 0 });
// 53 選ばれない地方
SC[53] = K((t, dur) => photo('rice', t, dur, 0.5) + R([
  { at: .8, f: (lt) => `<g transform="translate(${CX},540) scale(${pop(lt / .5)})">${txt(0, 0, '若い女性に', { size: 60 })}${txt(0, 130, '選ばれない地方', { size: 120, color: Y, serif: true })}</g>` },
  ref('天野 (2021) ニッセイ基礎研究所'),
], t), 4, { enter: 'zoom', zoom: 0 });
// 54 3D：夕暮れの田んぼ道、遠くに駅の灯り
function fields() {
  const S = makeScene({ bg: '#1a1420', fog: ['#3a2a38', 25, 90], hemi: .9, exposure: 1.15, sky: '#d89a7a', ground: '#2a2a20', bloom: .15, bloomTh: .9, fov: 36 });
  const s = S.s, r = rng(9);
  const skyTex = canvasTex(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1c1830'); gr.addColorStop(.55, '#6a4a5a'); gr.addColorStop(.85, '#d8906a'); gr.addColorStop(1, '#e8b080'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  s.add(new THREE.Mesh(new THREE.SphereGeometry(95, 24, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })));
  for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(8 + r() * 10, 6 + r() * 8, 5), mat('#2a2030')); m.position.set(-60 + i * 8 + r() * 4, 1, -70 - r() * 10); s.add(m); }
  box(s, 160, .1, 160, mat('#2e3020'), 0, -.05, -30);
  for (let z = -70; z < 10; z += 1.2) for (const sx of [-1, 1]) box(s, 30, .25, .5, mat('#4a5a2a'), sx * 17, .12, z);  // 稲の列
  box(s, 3.2, .06, 160, mat('#6a6050'), 0, .03, -30);  // 道
  for (let z = -60; z < 10; z += 12) { box(s, .2, 6, .2, mat('#3a3028'), 2.6, 3, z); box(s, 1.4, .1, .1, mat('#3a3028'), 2.6, 5.6, z); }
  box(s, 6, 2.5, 3, mat('#3a3a40'), -4, 1.25, -58); box(s, 5, .5, .05, glow('#ffd9a0', .7), -4, 1.6, -56.5); lamp(s, '#ffd9a0', 1.2, 14, -4, 2.5, -55, false);
  sun(s, '#ffb080', .6, 0, 6, -80, 20);
  const w = person3(s, { back: true, top: '#c97a90', bottom: '#2a2a30', hair: '#1a140f' }); w.position.set(.4, 0, -16); w.rotation.y = Math.PI;
  return { render() { S.render(); }, update(t, dur) { const k = ease(t / dur);
    S.cam.position.set(.6, lerp(1.9, 2.1, k), lerp(-1, -3, k)); S.cam.lookAt(0, 1.2, -40); w.position.z = -16 - 5 * k; return ''; } };
}
SC[54] = { build: fields };

// ===== エピローグ =====
SC[55] = K((t) => { const v = lerpV(VW.all, VW.tohoku, ease(t / 6)); return R([
  { at: 0, slide: 0, f: () => jmap2(v, { fills: { '02': '#e6c2cf', '03': '#e6c2cf', '04': '#e6c2cf', '05': '#e6c2cf', '06': '#e6c2cf', '07': '#e6c2cf' } }) },
  { at: 1.2, f: () => card(1300, 380, 560, 300, { fill: 'rgba(20,18,26,.85)' }) + txt(1580, 470, '地方に若い女性がいないのは', { size: 40 }) },
  { at: 2.6, f: (lt) => `<g transform="translate(1580,590) scale(${pop(lt / .4)})">${txt(0, 0, '気のせいではない', { size: 70, color: Y, serif: true })}</g>` },
], t); }, 5, { enter: 'fade', zoom: 0 });

SC[56] = K((t) => R([
  { at: .3, slide: 0, f: () => person(560, 620, 160, F, 'f') + txt(560, 860, '出ていった女性', { size: 40, color: F }) },
  { at: 2.0, slide: 0, f: () => person(1360, 620, 160, M) + txt(1360, 860, '残った男性', { size: 40, color: M }) },
  { at: 3.6, f: () => txt(CX, 300, 'どちらも、満足しているとは言えない', { size: 54, serif: true }) },
  { at: 6.4, f: () => txt(CX, 930, '男女どちらか一方の問題ではない', { size: 50, color: Y, serif: true }) },
], t), 5, { enter: 'right', zoom: 0 });
SC[57] = K((t, dur) => photo('train_jp', t, dur, 0.62) + R([
  { at: .3, f: () => txt(CX, 260, '女性は、いないのではない。出ていっている', { size: 54, serif: true }) },
  ...['進学先', '仕事', '地元の空気'].map((s0, i) => ({ at: 4.2 + i * .9, slide: 0, f: (lt) => tag(520 + i * 440, 600, 380, s0, i == 2 ? F : '#cfd4dc', lt, { size: 56, fill: i == 2 ? 'rgba(239,127,168,.12)' : undefined }) })),
], t), 5, { enter: 'right', zoom: 0 });
// 58 3D：駅に電車が入ってくる
SC[58] = { build: station };
SC[59] = K((t, dur) => photo('train_in', t, dur, 0.6) + R([
  { at: .3, f: (lt) => `<g transform="translate(${CX},460) scale(${pop(lt / .45)})"><rect x="-150" y="-110" width="300" height="200" rx="30" fill="${Y}"/><path d="M-40,88 L-70,150 L20,90Z" fill="${Y}"/>${[-60, 0, 60].map(x => `<circle cx="${x}" cy="-10" r="16" fill="#1b1a20"/>`).join('')}</g>` },
  { at: 1.0, f: () => txt(CX, 720, 'あなたの地元には、若い女性が残っている？', { size: 54, serif: true }) },
  { at: 2.6, f: () => txt(CX, 810, 'コメント欄で教えてください', { size: 42, color: C.dim }) },
], t), 5, { enter: 'right', zoom: 0 });
SC[60] = K((t) => R([
  { at: .3, f: () => txt(CX, 380, '今日のネタバレは、ここまで', { size: 64, serif: true }) },
  { at: 2.0, f: (lt) => `<g transform="translate(${CX - 230},600) scale(${pop(lt / .4)})"><rect x="-200" y="-56" width="400" height="112" rx="56" fill="#e0453a"/>${txt(0, 16, 'チャンネル登録', { size: 44, color: '#fff' })}</g>` },
  { at: 2.6, f: (lt) => `<g transform="translate(${CX + 230},600) scale(${pop(lt / .4)})"><rect x="-200" y="-56" width="400" height="112" rx="56" fill="rgba(255,255,255,.1)" stroke="#fff" stroke-width="3"/>${txt(0, 16, '高評価', { size: 44, color: '#fff' })}</g>` },
  { at: 4.8, f: () => txt(CX, 820, 'また次のネタバレで', { size: 44, color: Y }) },
], t), 5, { enter: 'right', zoom: 0 });

export const SCENES = SC;
