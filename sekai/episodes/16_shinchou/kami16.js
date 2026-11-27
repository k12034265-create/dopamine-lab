// 16 なぜ婚活の身長は「172cm」で線が引かれるのか？ — 名前を付けた言葉：「見えない線」
import { THREE, makeScene, mat, glow, box, cyl, ball, plane, canvasTex, sun, lamp, lerp, camMove } from '/pipeline3d/lib3d.js';
import { human } from '/pipeline3d/sets3d.js';
import { C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, loadMaps, run, kami, phone } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const Y = C.gold, RED = '#ff3b3b', CX = 960, DIM = C.dim, MAN = '#7fb8ff', WOM = '#ff8fb1', GRY = '#8a8490';
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', '第5章'];
const CHI = (i) => i < 8 ? 0 : i < 22 ? 1 : i < 37 ? 2 : i < 54 ? 3 : i < 67 ? 4 : 5;
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, enter: 'fade', zoom: 0, ...o });
const R = (els, t) => { const rf = els.filter(e => e.ref), ot = els.filter(e => !e.ref); return run([...rf, ...ot].map(e => e.f ? e : { ...e, f: () => '' }), t); };
const ref = (s) => ({ at: .6, ref: true, f: () => note(1880, 58, s, 'end') });
const S1 = 'IBJ結婚みらい研究所 成婚白書（2026）', S2 = '厚生労働省 国民健康・栄養調査（2024年）';
const cap = (y, s0, col = Y, size = 46) => `<g>${card(CX - s0.length * size * .55 - 40, y - size - 18, s0.length * size * 1.1 + 80, size * 1.9, { fill: 'rgba(18,16,24,.86)', stroke: col })}${txt(CX, y + 4, s0, { size, color: col, serif: true })}</g>`;
const ovSvg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0"><defs><filter id="ts" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".7"/></filter><filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${inner}</svg>`;
const srcBox = (src) => `<rect x="${1880 - src.length * 23 - 20}" y="28" width="${src.length * 23 + 40}" height="44" rx="8" fill="#121018"/>` + note(1880, 58, src, 'end');
const stampQ = (x, y, k, col = RED, r = 90) => `<g transform="translate(${x},${y}) scale(${k}) rotate(-10)"><circle r="${r}" fill="${col}"/>${txt(0, r * .44, '？', { size: r * 1.37, color: '#fff', shadow: false, serif: true })}</g>`;
const xMark = (x, y, k, s = 70, col = RED) => `<g transform="translate(${x},${y}) scale(${k})" stroke="${col}" stroke-width="16" stroke-linecap="round"><path d="M${-s},${-s} L${s},${s} M${s},${-s} L${-s},${s}"/></g>`;
const SC = []; const N = 77;
for (let i = 0; i < N; i++) SC[i] = K(() => '', CHI(i));

// ===== 3D 共通：身長計の壁 =====
// 壁は y=0〜2.4m。目盛りは 1cm ごと、10cm ごとに数字（140〜200）
function rulerWall(s, z = -0.62, w = 26, rx = 4.6, rz = 0) {
  // 壁（無地）＋10cmごとの細い横線＋右側に大きな目盛りの柱
  plane(s, w, 4.2, mat('#25222d', { r: .95 }), 0, 2.1, z);
  for (let cm = 140; cm <= 200; cm += 10) { const b = box(s, w, .006, .004, new THREE.MeshBasicMaterial({ color: '#5a5262', transparent: true, opacity: .55 }), 0, cm / 100, z + .01); b.castShadow = false; }
  const tex = canvasTex(512, 2048, (g, W, H) => { g.fillStyle = '#efe6d2'; g.fillRect(0, 0, W, H); const cmY = (cm) => H - cm / 240 * H;
    for (let cm = 0; cm <= 240; cm++) { const y = cmY(cm), big = cm % 10 === 0, mid = cm % 5 === 0; g.fillStyle = '#2a2420'; g.fillRect(0, y - (big ? 3 : 1.5), big ? 200 : mid ? 130 : 70, big ? 6 : 3);
      if (big && cm >= 100) { g.font = `700 96px 'Noto Sans CJK JP'`; g.textAlign = 'right'; g.fillText(cm + '', W - 30, y + 34); } } });
  const rm = new THREE.MeshStandardMaterial({ map: tex, roughness: .8, emissive: '#fff', emissiveMap: tex, emissiveIntensity: .25 });
  box(s, .5, 2.4, .06, [mat('#cfc6b4'), mat('#cfc6b4'), mat('#cfc6b4'), mat('#cfc6b4'), rm, mat('#cfc6b4')], rx, 1.2, rz); box(s, .7, .04, .5, mat('#3a3640'), rx, .02, rz);
}
const cloneMats = (o) => { const ms = []; o.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); ms.push(m.material); } }); return ms; };
const V = new THREE.Vector3();
const proj = (cam, x, y, z) => { cam.updateMatrixWorld(); V.set(x, y, z); V.project(cam); return [(V.x + 1) * 960, (1 - V.y) * 540]; };

// 0 背の順に並んだ男たち。赤いレーザーが下から上へ。170で止まる→消える
SC[0] = { build() { const S = makeScene({ bg: '#0c0b10', hemi: .75, exposure: 1.45, sky: '#9aa0c0', ground: '#1a1418', bloom: .9, bloomTh: .55, fov: 33 }); const s = S.s;
  box(s, 24, .04, 12, mat('#18161c', { r: .7 }), 0, -.02, 0); rulerWall(s, -.62, 26, 4.5, 0);
  sun(s, '#fff1e0', 1.35, 2.5, 6, 6, 8); lamp(s, '#ffd2a8', 2.2, 9, -3, 2.6, 2.5, false); lamp(s, '#9ab0ff', 1.6, 9, 4, 2.2, 2.0, false);
  const HS = [158, 162, 165, 168, 170, 172, 175, 178, 183], TOPS = ['#3a4660', '#5a4a3c', '#2f5a52', '#6a3a3a', '#3c3c48', '#4a5a7a', '#5c5248', '#2e3a4c', '#4a3e5a'];
  const men = HS.map((h, i) => { const p = human(s, { top: TOPS[i], bottom: '#22242a', hair: '#15110e' }); p.scale.setScalar(h / 183); p.position.set(-3.6 + i * .9, 0, 0); return { p, h, ms: cloneMats(p) }; });
  // レーザー：壁の上の明るい線＋人を横切る薄い光の板
  const lineM = new THREE.MeshBasicMaterial({ color: '#ff2a2a', transparent: true, opacity: 1 }); const wl = box(s, 26, .02, .02, lineM, 0, 1.4, -.6); wl.castShadow = false;
  const sheetM = new THREE.MeshBasicMaterial({ color: '#ff3030', transparent: true, opacity: .05, side: THREE.DoubleSide, depthWrite: false });
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(11, 1.2), sheetM); sh.rotation.x = -Math.PI / 2; s.add(sh);
  const edgeM = new THREE.MeshBasicMaterial({ color: '#ff5050', transparent: true, opacity: .9 }); const ed = box(s, 11, .012, .012, edgeM, 0, 1.4, .7); ed.castShadow = false;
  const lineY = (t) => t < 4.2 ? lerp(.15, 1.62, ease(t / 4.0)) : t < 5.0 ? lerp(1.62, 1.70, easeOut((t - 4.2) / .8)) : 1.70;
  const alive = (t) => t < 8.2 ? 1 : t < 9.4 ? ((Math.sin(t * 60) > 0 ? 1 : .15) * (1 - (t - 8.2) / 1.2 * .5)) : Math.max(0, 1 - (t - 9.4) / .5);
  let cur = 0;
  return { render() { S.render(); }, update(t, dur) { cur = t;
    const y = lineY(t), a = alive(t);
    wl.position.y = y; ed.position.y = y; sh.position.set(0, y, .1); lineM.opacity = a; edgeM.opacity = .9 * a; sheetM.opacity = .05 * a;
        camMove(S.cam, [-5.2, 1.25, 7.2], [2.8, 1.55, 6.0], [-.8, 1.3, 0], [1.0, 1.45, 0], ease(t / dur));
    // 2D：線の右端のラベル
    const [lx, ly] = proj(S.cam, 4.9, y, -.55);
    let o = '';
    if (t > 4.4 && t < 10) { const k = pop(clamp((t - 4.4) / .4)) * a; o += `<g opacity="${clamp(a)}" transform="translate(1520,${ly})">` + `<g transform="scale(${k})"><rect x="-10" y="-58" width="300" height="84" rx="14" fill="rgba(20,8,10,.9)" stroke="${RED}" stroke-width="4"/>` + txt(140, 2, '170cmの壁？', { size: 44, color: '#fff' }) + '</g></g>'; }
    if (t > 8.6 && t < 10.2) o += xMark(1660, ly - 16, pop(clamp((t - 8.6) / .35)), 60);
    if (t > 6.9) { const k = easeOut(clamp((t - 6.9) / .5)); o += `<g opacity="${k}">` + `<rect x="${CX - 420}" y="96" width="840" height="92" rx="18" fill="rgba(14,12,18,.86)" stroke="${Y}" stroke-width="3"/>` + txt(CX, 160, '成婚者 1万9112人のデータ', { size: 48, color: Y, serif: true }) + '</g>' + srcBox(S1); }
    return ovSvg(o); } }; } };

// 5 平均的な男女が並ぶ。頭の高さの差＝13cm
SC[5] = { build() { const S = makeScene({ bg: '#0d0c12', hemi: .75, exposure: 1.4, sky: '#a0a8c8', ground: '#1a1418', bloom: .5, bloomTh: .7, fov: 30 }); const s = S.s;
  box(s, 20, .04, 10, mat('#18161c', { r: .7 }), 0, -.02, 0); rulerWall(s, -.7, 26, 1.15, 0);
  sun(s, '#fff1e0', 1.4, 2, 6, 6, 6); lamp(s, '#ffc8a0', 1.8, 8, -2.5, 2.4, 2.2, false); lamp(s, '#a8b8ff', 1.4, 8, 2.5, 2.2, 2.0, false);
  const m = human(s, { top: '#3a4a6a', bottom: '#22242a' }); m.scale.setScalar(171.4 / 183); m.position.set(-.32, 0, 0); m.rotation.y = .12;
  const w = human(s, { top: '#b85a74', bottom: '#2a2228', hairStyle: 'long', skin: '#efcbb0' }); w.scale.setScalar(158 / 183); w.position.set(.32, 0, 0); w.rotation.y = -.12;
  return { render() { S.render(); }, update(t, dur) {
    camMove(S.cam, [1.9, 1.25, 4.8], [1.1, 1.45, 3.9], [.2, 1.25, 0], [.3, 1.42, 0], ease(t / dur));
    const [mx, my] = proj(S.cam, -.32, 1.714, 0), [wx, wy] = proj(S.cam, .32, 1.58, 0);
    const bx = Math.max(Math.min(mx, wx) - 330, 430), k = easeOut(clamp((t - .6) / .9));
    let o = `<g opacity="${k}" stroke-dasharray="14 10" stroke-width="4" fill="none"><path d="M${mx},${my} H${bx}" stroke="${MAN}"/><path d="M${wx},${wy} H${bx}" stroke="${WOM}"/></g>`;
    const k2 = easeOut(clamp((t - 1.3) / .6));
    o += `<g opacity="${k2}"><path d="M${bx - 14},${my} h-30 V${wy} h30" stroke="${Y}" stroke-width="6" fill="none"/>` + txt(bx - 70, (my + wy) / 2 + 30, Math.round(13 * easeOut(clamp((t - 1.3) / 1.4))) + 'cm', { size: 92, color: Y, serif: true, anchor: 'end' }) + '</g>';
    o += `<g opacity="${k}">` + txt(mx, my - 30, '夫', { size: 36, color: MAN }) + txt(wx, wy - 30, '妻', { size: 36, color: WOM }) + '</g>';
    if (t > 4.4) o += stampQ(bx - 200, (my + wy) / 2 - 150, pop(clamp((t - 4.4) / .4)), RED, 64);
    if (t > .3) o += `<g opacity="${easeOut(clamp((t - .3) / .5))}">` + `<rect x="${CX - 470}" y="96" width="940" height="92" rx="18" fill="rgba(14,12,18,.86)" stroke="${Y}" stroke-width="3"/>` + txt(CX, 160, '成婚カップル いちばん多い身長差', { size: 46, color: Y, serif: true }) + '</g>' + srcBox(S1);
    return ovSvg(o); } }; } };

// ===== 2D =====
// 2 2cm刻みの成婚率。170に「壁？」→外れる。162と172に赤い線
const HB = [['160以下', 27.6], ['162', 32.3], ['164', 33.1], ['166', 33.2], ['168', 34.5], ['170', 34.3], ['172', 37.4], ['174以上', 36.4]];
const BX0 = 330, BW = 150, BG = 22, BY = 860, V0 = 20, V1 = 40, BH = 560;
const bh = (v) => (v - V0) / (V1 - V0) * BH, bxc = (i) => BX0 + i * (BW + BG) + BW / 2;
const barsChart = (t, o = {}) => { let g = `<path d="M${BX0 - 30},${BY} H${BX0 + 8 * (BW + BG) + 10}" stroke="${C.gray}" stroke-width="4"/>`;
  for (const v of [25, 30, 35, 40]) { const y = BY - bh(v); g += `<path d="M${BX0 - 30},${y} H${BX0 + 8 * (BW + BG)}" stroke="rgba(255,255,255,.07)" stroke-width="2"/>` + txt(BX0 - 44, y + 10, v + '%', { size: 26, color: DIM, anchor: 'end' }); }
  HB.forEach(([lab, v], i) => { const at = (o.at0 ?? .3) + i * (o.step ?? .28), k = easeOut(clamp((t - at) / .6)); const x = bxc(i) - BW / 2, hh = bh(v) * k;
    const hi = (o.hi || []).includes(i); const col = hi ? RED : (o.dim ? '#6a6470' : '#b8b0a4');
    g += `<rect x="${x}" y="${BY - hh}" width="${BW}" height="${hh}" rx="8" fill="${col}" opacity="${k > 0 ? 1 : 0}"/>` + (k > .05 ? txt(bxc(i), BY - hh - 18, v.toFixed(1) + '%', { size: 34, color: hi ? '#fff' : C.fg }) : '') + txt(bxc(i), BY + 46, lab, { size: lab.length > 3 ? 28 : 34, color: DIM }); });
  return g + txt(BX0 + 8 * (BW + BG) / 2, BY + 96, '男性の身長（cm）', { size: 28, color: DIM }) + note(BX0 - 30, BY + 96, '※縦軸は20%から', 'start'); };
const wall = (i, k, col = RED) => { const x = BX0 + i * (BW + BG) - BG / 2, y0 = BY - BH - 20 + (1 - clamp(k)) * (BH + 30), h = BY + 10 - y0; return `<g opacity="${clamp(k)}"><rect x="${x - 12}" y="${y0}" width="24" height="${h}" rx="12" fill="${col}" opacity=".25"/><rect x="${x - 4}" y="${y0}" width="8" height="${h}" rx="4" fill="${col}"/></g>`; };
SC[2] = K((t) => { const kw = clamp((t - 6.6) / .35), shake = t > 6.6 && t < 7.0 ? Math.sin(t * 90) * 8 * (1 - (t - 6.6) / .4) : 0;
  let g = `<g transform="translate(${shake},0)">` + barsChart(t, { hi: t > 6.6 ? [1, 6] : [] });
  // 170の「壁？」の札：3.0sで出て 6.0sで落ちる
  if (t > 3.0) { const fall = t > 6.0 ? ease((t - 6.0) / .7) : 0, x = bxc(5), y = BY - bh(34.3) - 120 + fall * 420; g += `<g opacity="${1 - fall}" transform="translate(${x},${y}) rotate(${fall * 40}) scale(${pop(clamp((t - 3.0) / .4))})"><rect x="-120" y="-46" width="240" height="80" rx="14" fill="rgba(20,8,10,.92)" stroke="${Y}" stroke-width="4"/>` + txt(0, 12, '壁？', { size: 46, color: Y }) + '</g>'; }
  if (t > 6.6) { g += wall(1, kw) + wall(6, kw);
    if (t > 6.6 && t < 7.1) g += `<rect x="0" y="0" width="1920" height="1080" fill="#ff4040" opacity="${.22 * (1 - (t - 6.6) / .5)}"/>`;
    const k3 = easeOut(clamp((t - 7.6) / .5)); g += `<g opacity="${k3}">` + txt(BX0 + (BW + BG) - BG / 2 + 10, BY - bh(32.3) - 74, '+4.7', { size: 40, color: RED, anchor: 'start' }) + txt(BX0 + 6 * (BW + BG) - BG / 2 + 10, BY - bh(37.4) - 74, '+3.0', { size: 40, color: RED, anchor: 'start' }) + '</g>'; }
  if (t > 10.9) { const k = pop(clamp((t - 10.9) / .4)); g += `<g transform="translate(${CX},200) scale(${k})">` + txt(0, 0, '線は　162cm　と　172cm', { size: 60, color: '#fff', serif: true }) + '</g>'; }
  else g += head('身長ごとの成婚率（2cm刻み）', { y: 200, size: 50 });
  return R([{ at: 0, slide: 0, f: () => g + '</g>' }, ref(S1)], t); }, 0);

// 4 「172」の大きな数字＋？スタンプ
SC[4] = K((t) => { let g = ''; const off = (t * 60) % 40;
  for (let i = -2; i < 52; i++) { const x = i * 40 - off; const big = (i + Math.floor(t * 60 / 40)) % 5 === 0; g += `<path d="M${x},${big ? 760 : 790} V840" stroke="rgba(255,240,210,${big ? .35 : .16})" stroke-width="${big ? 4 : 2}"/>`; }
  const k = pop(clamp(t / .5)); g += `<g transform="translate(${CX},560) scale(${k})">` + txt(0, 0, '172', { size: 300, color: '#fff', serif: true }) + txt(250, -10, 'cm', { size: 90, color: DIM, anchor: 'start' }) + '</g>';
  g += `<path d="M560,640 H1360" stroke="${RED}" stroke-width="8" stroke-linecap="round" opacity="${easeOut(clamp((t - .6) / .4))}" filter="url(#glow)"/>`;
  if (t > 2.4) g += stampQ(1390, 360, pop(clamp((t - 2.4) / .4)), RED, 100);
  return R([{ at: 0, slide: 0, f: () => g }, { at: 1.0, f: () => cap(920, 'なぜ、172cmなのか', Y, 48) }], t); }, 0);

// 6 鍵のかかったカード
SC[6] = K((t) => { const wob = Math.sin(t * 9) * (t > 1.2 && t < 2.2 ? 4 : .6);
  let g = ''; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + t * .25; g += `<path d="M${CX},500 L${CX + Math.cos(a) * 900},${500 + Math.sin(a) * 900} L${CX + Math.cos(a + .12) * 900},${500 + Math.sin(a + .12) * 900} Z" fill="rgba(240,200,90,.05)"/>`; }
  g += `<g transform="translate(${CX},500) rotate(${wob}) scale(${pop(clamp(t / .5))})"><rect x="-330" y="-200" width="660" height="400" rx="30" fill="#211d28" stroke="${Y}" stroke-width="6"/>` + txt(0, 40, '？？？', { size: 150, color: Y, serif: true }) +
    `<g transform="translate(0,-200)"><path d="M-50,0 V-50 a50,50 0 0 1 100,0 V0" stroke="#c9b48a" stroke-width="16" fill="none"/><rect x="-75" y="-8" width="150" height="110" rx="16" fill="#c9b48a"/><circle cx="0" cy="40" r="14" fill="#3a3020"/><rect x="-5" y="44" width="10" height="30" fill="#3a3020"/></g></g>`;
  return R([{ at: 0, slide: 0, f: () => g }, { at: .9, f: () => cap(880, '身長の線を、ほぼ消す数字', Y, 46) }], t); }, 0);

// 7 目次
const TOC = [['①', '170cmの壁'], ['②', '172cmの正体'], ['③', '13cmの謎'], ['④', '線を消す数字'], ['⑤', '見えない線']];
SC[7] = K((t) => R([{ at: 0, f: () => head('今日のネタバレ', { y: 220, size: 58 }) }, ...TOC.map(([n, s0], i) => ({ at: .3 + i * .4, dx: 140, slide: 0, f: () => `<g transform="translate(0,${Math.sin(t * 1.6 + i) * 6})">` + card(110 + i * 345, 360, 315, 300, { stroke: 'rgba(255,255,255,.14)' }) + txt(267 + i * 345, 470, n, { size: 66, color: Y, serif: true }) + txt(267 + i * 345, 580, s0, { size: 34 }) + '</g>' })),
  { at: 3.2, f: () => cap(860, '1万9000人の婚活データ × 国の統計 × 海外の研究', Y, 40) }], t), 0);


// ===== 3D の部品 =====
// 背の順の列＋レーザー線（固定の高さ）
function rowScene(o) { return { build() { const S = makeScene({ bg: '#0c0b10', hemi: .75, exposure: 1.45, sky: '#9aa0c0', ground: '#1a1418', bloom: .9, bloomTh: .55, fov: o.fov || 33 }); const s = S.s;
  box(s, 24, .04, 12, mat('#18161c', { r: .7 }), 0, -.02, 0); rulerWall(s, -.62, 26, o.rx ?? 4.5, 0);
  sun(s, '#fff1e0', 1.35, 2.5, 6, 6, 8); lamp(s, '#ffd2a8', 2.2, 9, -3, 2.6, 2.5, false); lamp(s, '#9ab0ff', 1.6, 9, 4, 2.2, 2.0, false);
  const TOPS = ['#3a4660', '#5a4a3c', '#2f5a52', '#6a3a3a', '#3c3c48', '#4a5a7a', '#5c5248', '#2e3a4c', '#4a3e5a'];
  const n = o.hs.length, gap = o.gap || .9, men = o.hs.map((h, i) => { const p = human(s, { top: (o.tops || TOPS)[i % 9], bottom: '#22242a', hair: '#15110e' }); p.scale.setScalar(h / 183); p.position.set((i - (n - 1) / 2) * gap, 0, 0); return p; });
  let wl = null, ed = null, lineM = null;
  if (o.line) { lineM = new THREE.MeshBasicMaterial({ color: o.lineCol || '#ff2a2a', transparent: true, opacity: 1 }); wl = box(s, 26, .02, .02, lineM, 0, o.line, -.6); wl.castShadow = false; ed = box(s, 11, .012, .012, lineM, 0, o.line, .7); ed.castShadow = false; }
  return { render() { S.render(); }, update(t, dur) { const k = ease(t / dur);
    camMove(S.cam, o.c0, o.c1, o.l0, o.l1, k);
    if (lineM) lineM.opacity = (o.alive ? o.alive(t) : 1) * (o.lineOp ?? 1);
    return ovSvg(o.ov ? o.ov(t, (x, y, z) => proj(S.cam, x, y, z), men) : ''); } }; } }; }
// 男女（または1人）＋身長の柱
function pairScene(o) { return { build() { const S = makeScene({ bg: '#0d0c12', hemi: .75, exposure: 1.4, sky: '#a0a8c8', ground: '#1a1418', bloom: .5, bloomTh: .7, fov: o.fov || 30 }); const s = S.s;
  box(s, 20, .04, 10, mat('#18161c', { r: .7 }), 0, -.02, 0); rulerWall(s, -.7, 26, o.rx ?? 1.15, 0);
  sun(s, '#fff1e0', 1.4, 2, 6, 6, 6); lamp(s, '#ffc8a0', 1.8, 8, -2.5, 2.4, 2.2, false); lamp(s, '#a8b8ff', 1.4, 8, 2.5, 2.2, 2.0, false);
  const P = (o.people || []).map(q => { const p = human(s, q.w ? { top: '#b85a74', bottom: '#2a2228', hairStyle: 'long', skin: '#efcbb0' } : { top: q.top || '#3a4a6a', bottom: '#22242a' }); p.scale.setScalar(q.h / 183); p.position.set(q.x, 0, 0); p.rotation.y = q.ry || 0; return p; });
  return { render() { S.render(); }, update(t, dur) { camMove(S.cam, o.c0, o.c1, o.l0, o.l1, ease(t / dur));
    return ovSvg(o.ov ? o.ov(t, (x, y, z) => proj(S.cam, x, y, z)) : ''); } }; } }; }
const lab3 = (x, y, s0, col, a = 1, size = 38) => `<g opacity="${a}">` + `<rect x="${x - s0.length * size * .55 - 22}" y="${y - size - 12}" width="${s0.length * size * 1.1 + 44}" height="${size * 1.6}" rx="12" fill="rgba(14,12,18,.88)" stroke="${col}" stroke-width="3"/>` + txt(x, y + 2, s0, { size, color: col }) + '</g>';
const topCap = (s0, col = Y, size = 46, t = 9, t0 = .3) => t > t0 ? `<g opacity="${easeOut(clamp((t - t0) / .5))}">` + `<rect x="${CX - s0.length * size * .55 - 40}" y="96" width="${s0.length * size * 1.1 + 80}" height="${size * 1.95}" rx="18" fill="rgba(14,12,18,.88)" stroke="${col}" stroke-width="3"/>` + txt(CX, 96 + size * 1.32, s0, { size, color: col, serif: true }) + '</g>' : '';

// 14 170の線がちらついて消える
SC[14] = rowScene({ hs: [158, 162, 165, 168, 170, 172, 175, 178, 183], line: 1.70, c0: [-2.4, 1.6, 5.4], c1: [1.2, 1.62, 5.0], l0: [-.4, 1.5, 0], l1: [.6, 1.55, 0],
  alive: (t) => t < 1.4 ? 1 : t < 2.6 ? (Math.sin(t * 55) > 0 ? 1 : .1) : Math.max(0, 1 - (t - 2.6) / .4),
  ov: (t) => { const k = pop(clamp((t - .3) / .4)); let g = `<g transform="translate(${CX},300) scale(${k})"><rect x="-260" y="-70" width="520" height="110" rx="18" fill="rgba(20,8,10,.92)" stroke="${RED}" stroke-width="5"/>` + txt(0, 10, '170cmの壁', { size: 64, color: '#fff', serif: true }) + '</g>';
    if (t > 2.4) g += xMark(CX, 285, pop(clamp((t - 2.4) / .35)), 110); if (t > 3.0) g += `<g opacity="${easeOut(clamp((t - 3) / .5))}">` + txt(CX, 470, 'このデータには、段差なし', { size: 50, color: Y, serif: true }) + '</g>'; return g + srcBox(S1); } });
// 18 成婚者の真ん中172・退会者の真ん中170
SC[18] = pairScene({ people: [{ h: 172, x: -.6, top: '#4a5a7a', ry: .1 }, { h: 170, x: .6, top: '#5a5560', ry: -.1 }], rx: 0, c0: [0, 1.3, 4.6], c1: [0, 1.5, 3.6], l0: [0, 1.25, 0], l1: [0, 1.5, 0],
  ov: (t, P) => { const [ax, ay] = P(-.6, 1.72, 0), [bx, by] = P(.6, 1.70, 0); let g = '';
    const k = easeOut(clamp((t - .4) / .6)); g += `<g opacity="${k}">` + lab3(ax - 170, ay - 70, '結婚が決まった人', '#ffd23a', 1, 34) + lab3(bx + 170, by - 70, 'やめた人', '#c8c0d0', 1, 34) + '</g>';
    const k2 = easeOut(clamp((t - 1.6) / .6)); g += `<g opacity="${k2}">` + txt(ax - 170, ay + 40, '真ん中 172cm', { size: 46, color: '#ffd23a', serif: true }) + txt(bx + 170, by + 40, '真ん中 170cm', { size: 46, color: '#e8e0f0', serif: true }) + '</g>';
    if (t > 5.0) g += `<g transform="translate(${CX},860) scale(${pop(clamp((t - 5) / .4))})">` + `<rect x="-300" y="-64" width="600" height="96" rx="20" fill="rgba(20,8,10,.92)" stroke="${RED}" stroke-width="4"/>` + txt(0, 4, '差は、たった2cm', { size: 52, color: '#fff', serif: true }) + '</g>';
    return g + srcBox(S1); } });
// 24 20代・30代・40代の平均。頭の上に平均の点線（光る線）
SC[24] = rowScene({ hs: [171.4, 171.6, 171.6], gap: 1.1, rx: 1.9, line: 1.715, lineCol: '#ffd23a', lineOp: .45, c0: [-1.2, 1.4, 4.4], c1: [.6, 1.6, 3.9], l0: [0, 1.3, 0], l1: [.2, 1.55, 0],
  tops: ['#3a4660', '#5a4a3c', '#2f5a52'],
  ov: (t, P) => { let g = ''; [['20代', -1.1], ['30代', 0], ['40代', 1.1]].forEach(([s0, x], i) => { const [sx, sy] = P(x, 2.05, 0); const k = easeOut(clamp((t - .4 - i * .3) / .5)); g += `<g opacity="${k}">` + lab3(sx, sy, s0, '#e8e0f0', 1, 40) + '</g>'; });
    const [lx, ly] = P(-2.2, 1.715, -.6); g += `<g opacity="${easeOut(clamp((t - 2.2) / .6))}">` + lab3(Math.max(lx, 330), ly - 40, '平均 ≒ 171.5cm', Y, 1, 44) + '</g>'; return g + topCap('婚活の中心の年代', Y, 44, t, .2) + srcBox(S2); } });
// 29 20代女性の平均 158.0cm
SC[29] = pairScene({ people: [{ w: 1, h: 158, x: .2, ry: -.15 }], rx: .85, c0: [-.6, 1.2, 3.8], c1: [-.2, 1.3, 3.2], l0: [.3, 1.1, 0], l1: [.4, 1.25, 0],
  ov: (t, P) => { const [wx, wy] = P(.2, 1.58, 0); const k = easeOut(clamp((t - .4) / .6)); let g = `<g opacity="${k}"><path d="M${wx},${wy} H${wx - 420}" stroke="${WOM}" stroke-width="5" stroke-dasharray="14 10"/></g>`;
    g += `<g opacity="${easeOut(clamp((t - .9) / .6))}">` + txt(wx - 440, wy + 22, '158.0cm', { size: 92, color: WOM, serif: true, anchor: 'end' }) + txt(wx - 440, wy + 80, '20代女性の平均', { size: 36, color: '#e8e0f0', anchor: 'end' }) + '</g>'; return g + srcBox(S2); } });
// 42 男女の平均を並べる：171.4 と 158.0、差 13.4
SC[42] = pairScene({ people: [{ h: 171.4, x: -.32, ry: .12 }, { w: 1, h: 158, x: .32, ry: -.12 }], rx: -1.15, c0: [-1.6, 1.3, 4.8], c1: [-.9, 1.45, 3.9], l0: [.1, 1.25, 0], l1: [.2, 1.42, 0],
  ov: (t, P) => { const [mx, my] = P(-.32, 1.714, 0), [wx, wy] = P(.32, 1.58, 0); const bx = Math.min(Math.max(mx, wx) + 300, 1500); const k = easeOut(clamp((t - .5) / .7));
    let g = `<g opacity="${k}" stroke-dasharray="14 10" stroke-width="4" fill="none"><path d="M${mx},${my} H${bx}" stroke="${MAN}"/><path d="M${wx},${wy} H${bx}" stroke="${WOM}"/></g>`;
    g += `<g opacity="${k}">` + txt(mx - 40, my - 20, '男性 171.4', { size: 36, color: MAN, anchor: 'end' }) + txt(wx + 40, wy + 56, '女性 158.0', { size: 36, color: WOM, anchor: 'start' }) + '</g>';
    const k2 = easeOut(clamp((t - 3.6) / .6)); g += `<g opacity="${k2}"><path d="M${bx + 14},${my} h30 V${wy} h-30" stroke="${Y}" stroke-width="6" fill="none"/>` + txt(bx + 70, (my + wy) / 2 + 30, '13.4cm', { size: 84, color: Y, serif: true, anchor: 'start' }) + '</g>';
    return g + topCap('20代の平均身長', Y, 44, t, .2) + srcBox(S2); } });
// 44 平均的な男女が並ぶ（ゆっくり回り込む）
SC[44] = pairScene({ people: [{ h: 171.5, x: -.3, ry: .25 }, { w: 1, h: 158, x: .3, ry: -.25 }], rx: 1.6, fov: 32, c0: [2.4, 1.3, 3.9], c1: [-1.8, 1.45, 3.9], l0: [0, 1.2, 0], l1: [0, 1.35, 0],
  ov: (t, P) => { const [mx, my] = P(-.3, 1.715, 0), [wx, wy] = P(.3, 1.58, 0); const k = easeOut(clamp((t - .8) / .7)); let g = `<g opacity="${k}"><path d="M${mx},${my} L${wx},${wy}" stroke="${Y}" stroke-width="5"/><circle cx="${mx}" cy="${my}" r="9" fill="${Y}"/><circle cx="${wx}" cy="${wy}" r="9" fill="${Y}"/></g>`;
    g += lab3(CX, 860, '平均 × 平均 ＝ 13cm差', Y, easeOut(clamp((t - 2) / .6)), 44); if (t > 6.5) g += topCap('いちばんよくある組み合わせ', Y, 44, t, 6.5); return g; } });
// 69 列＋平均の線（＝2本目の線）
SC[69] = rowScene({ hs: [158, 162, 165, 168, 170, 172, 175, 178, 183], line: 1.715, lineCol: '#ffd23a', lineOp: .45, c0: [3.2, 1.5, 6.4], c1: [-1.8, 1.6, 6.0], l0: [.8, 1.4, 0], l1: [-.4, 1.5, 0],
  ov: (t, P) => { const [lx, ly] = P(-4.9, 1.715, -.55); return lab3(Math.max(lx, 420), ly - 44, '平均 171.5cm ≒ 2本目の線', Y, easeOut(clamp((t - .6) / .6)), 42) + srcBox(S1); } });

// ===== 2D：成婚率グラフの続き =====
// n本まで出す。from 以降の棒を at0 から順に伸ばす
const chartN = (t, n, from, o = {}) => { let g = `<path d="M${BX0 - 30},${BY} H${BX0 + 8 * (BW + BG) + 10}" stroke="${C.gray}" stroke-width="4"/>`;
  for (const v of [25, 30, 35, 40]) { const y = BY - bh(v); g += `<path d="M${BX0 - 30},${y} H${BX0 + 8 * (BW + BG)}" stroke="rgba(255,255,255,.07)" stroke-width="2"/>` + txt(BX0 - 44, y + 10, v + '%', { size: 26, color: DIM, anchor: 'end' }); }
  HB.forEach(([lab, v], i) => { const k = i < from ? 1 : i < n ? easeOut(clamp((t - (o.at0 ?? .3) - (i - from) * .3) / .6)) : 0; const x = bxc(i) - BW / 2, hh = bh(v) * k;
    const hi = (o.hi || []).includes(i), dm = o.dimAll && !hi; const col = hi ? RED : (o.gold || []).includes(i) ? Y : dm ? '#5a5560' : '#b8b0a4';
    if (k > 0) g += `<rect x="${x}" y="${BY - hh}" width="${BW}" height="${hh}" rx="8" fill="${col}"/>` + (k > .05 && !o.noVal ? txt(bxc(i), BY - hh - 18, v.toFixed(1) + '%', { size: 34, color: dm ? DIM : C.fg }) : '');
    g += txt(bxc(i), BY + 46, lab, { size: lab.length > 3 ? 28 : 34, color: DIM }); });
  return g + txt(BX0 + 8 * (BW + BG) / 2, BY + 96, '男性の身長（cm）', { size: 28, color: DIM }) + note(BX0 - 30, BY + 96, '※縦軸は20%から', 'start'); };
const W1 = (k) => wall(1, k), W2 = (k) => wall(6, k);
const wtag = (i, s0, k, col = RED, dy = 0) => { const x = BX0 + i * (BW + BG) - BG / 2; return `<g opacity="${clamp(k)}" transform="translate(${x},${BY - BH - 60 + dy}) scale(${pop(clamp(k))})"><rect x="${-s0.length * 19 - 24}" y="-46" width="${s0.length * 38 + 48}" height="70" rx="14" fill="rgba(20,8,10,.92)" stroke="${col}" stroke-width="4"/>` + txt(0, 2, s0, { size: 38, color: col === RED ? '#fff' : col }) + '</g>'; };
const C1 = (f, ch = 1) => K((t) => R([{ at: 0, slide: 0, f: () => f(t) }, ref(S1)], t), ch);
SC[10] = C1((t) => head('身長ごとの成婚率', { y: 200, size: 50 }) + chartN(t, 1, 0, { at0: .8 }) + (t > 2.5 ? `<g opacity="${easeOut(clamp((t - 2.5) / .5))}">` + txt(bxc(0), BY - bh(27.6) - 80, '160cm以下', { size: 36, color: Y }) + '</g>' : ''));
SC[11] = C1((t) => head('身長ごとの成婚率', { y: 200, size: 50 }) + chartN(t, 2, 1, { at0: .6, hi: t > 3.5 ? [1] : [] }) + (t > 3.5 ? W1(clamp((t - 3.5) / .35)) + `<g opacity="${easeOut(clamp((t - 4) / .4))}">` + txt(bxc(1), BY - bh(32.3) - 74, '+4.7', { size: 42, color: RED }) + '</g>' + wtag(1, '1本目の線', clamp((t - 6.4) / .4)) : ''));
SC[12] = C1((t) => head('身長ごとの成婚率', { y: 200, size: 50 }) + W1(1) + chartN(t, 5, 2, { at0: 1.6, hi: [1] }) + (t > 8.5 ? `<g opacity="${easeOut(clamp((t - 8.5) / .5))}"><path d="M${bxc(2) - 70},${BY - bh(34.6) - 70} H${bxc(4) + 70}" stroke="${Y}" stroke-width="6" stroke-dasharray="16 10"/>` + txt(bxc(3), BY - bh(34.6) - 90, 'ほぼ横ばい', { size: 40, color: Y }) + '</g>' : ''));
SC[13] = C1((t) => { let g = head('身長ごとの成婚率', { y: 200, size: 50 }) + W1(1) + chartN(t, 6, 5, { at0: 1.0, hi: [1], gold: t > 4 ? [4, 5] : [] });
  if (t > 1.6) g += `<g transform="translate(${bxc(5)},${BY - bh(34.3) - 130}) scale(${pop(clamp((t - 1.6) / .4))})"><rect x="-120" y="-46" width="240" height="80" rx="14" fill="rgba(20,8,10,.92)" stroke="${Y}" stroke-width="4"/>` + txt(0, 12, '壁？', { size: 46, color: Y }) + '</g>';
  if (t > 5.2) g += `<g opacity="${easeOut(clamp((t - 5.2) / .5))}">` + txt(700, 300, '168cm 34.5% ＞ 170cm 34.3%', { size: 40, color: Y }) + '</g>'; return g; });
SC[15] = C1((t) => head('身長ごとの成婚率', { y: 200, size: 50 }) + W1(1) + chartN(t, 7, 6, { at0: .8, hi: t > 3 ? [1, 6] : [1] }) + (t > 3 ? W2(clamp((t - 3) / .35)) + `<g opacity="${easeOut(clamp((t - 3.4) / .4))}">` + txt(bxc(6), BY - bh(37.4) - 74, '+3.0', { size: 42, color: RED }) + '</g>' + wtag(6, '2本目の線', clamp((t - 5.6) / .4), RED, -40) + wtag(1, '1本目', 1, RED, -40) : ''));
SC[16] = C1((t) => head('身長ごとの成婚率', { y: 200, size: 50 }) + W1(1) + W2(1) + chartN(t, 8, 7, { at0: 1.2, hi: [1, 6] }) + (t > 3.6 ? `<g opacity="${easeOut(clamp((t - 3.6) / .5))}">` + arrow(bxc(6) + 40, BY - bh(37.4) - 30, bxc(7) - 10, BY - bh(36.4) - 30, Y, 1, 6) + txt(bxc(7), BY - bh(36.4) - 150, '少し下がる', { size: 38, color: Y }) + '</g>' : ''));
SC[17] = C1((t) => { const pts = HB.map(([, v], i) => [bxc(i), BY - bh(v) - 6]); const n = Math.max(2, Math.ceil(8 * easeOut(clamp((t - .6) / 2.2))));
  let g = head('身長ごとの成婚率', { y: 200, size: 50 }) + W1(1) + W2(1) + chartN(t, 8, 8, { hi: [1, 6], dimAll: true, noVal: true });
  g += `<path d="M${pts.slice(0, n).map(p => p.join(',')).join(' L')}" stroke="${Y}" stroke-width="10" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
  if (t > 3.2) g += `<g opacity="${easeOut(clamp((t - 3.2) / .5))}">` + txt(CX, 300, '2段の階段。その先は横ばい', { size: 52, color: Y, serif: true }) + '</g>'; return g; });
// 19 10人に3人近く
SC[19] = K((t) => { let g = head('160cm以下でも', { y: 230, size: 56 }); for (let i = 0; i < 10; i++) { const x = 330 + i * 140, on = i < 3, part = i === 2 ? .76 : 1, k = easeOut(clamp((t - 1 - i * .12) / .4));
    g += `<g opacity="${k}">` + person(x, 640, 92, '#5a5560') + (on && t > 3.2 ? `<g clip-path="inset(${(1 - part) * 100}% 0 0 0)">${person(x, 640, 92, Y)}</g>` : '') + '</g>'; }
  if (t > 3.2) g += `<g opacity="${easeOut(clamp((t - 3.2) / .5))}">` + txt(CX, 880, '成婚率 27.6% ＝ 10人に3人近く', { size: 54, color: Y, serif: true }) + '</g>';
  if (t > 8.5) g += `<g transform="translate(${CX},400) scale(${pop(clamp((t - 8.5) / .4))})">` + card(-430, -60, 860, 100, { fill: 'rgba(20,18,26,.95)', stroke: '#7fb8ff' }) + txt(0, 8, '「背が低いと結婚できない」ではない', { size: 44, color: '#cfe4ff' }) + '</g>';
  return R([{ at: 0, slide: 0, f: () => g }, ref(S1)], t); }, 1);
// 21 2本の線に「なぜ？」
SC[21] = C1((t) => chartN(t, 8, 8, { hi: [1, 6], dimAll: true }) + W1(1) + W2(1) + (t > .6 ? stampQ(BX0 + (BW + BG) - BG / 2, BY - BH - 40, pop(clamp((t - .6) / .4)), RED, 70) : '') + (t > 1.2 ? stampQ(BX0 + 6 * (BW + BG) - BG / 2, BY - BH - 40, pop(clamp((t - 1.2) / .4)), RED, 70) : '') + head('なぜ、170cmではなく', { y: 190, size: 50 }));
// 23 国の統計：平均身長
SC[23] = K((t) => { let g = `<g transform="translate(560,0)"><rect x="-60" y="180" width="120" height="720" rx="10" fill="#efe6d2"/>`;
  const yv = (cm) => 880 - (cm - 160) / 20 * 680; for (let cm = 160; cm <= 180; cm++) { const y = yv(cm), big = cm % 5 === 0; g += `<path d="M-60,${y} h${big ? 60 : 30}" stroke="#2a2420" stroke-width="${big ? 4 : 2}"/>` + (big ? txt(-80, y + 12, cm + '', { size: 34, color: DIM, anchor: 'end' }) : ''); } g += '</g>';
  const rows = [['20代', 171.4, 1.2], ['30代', 171.6, 4.8], ['40代', 171.6, 6.6]];
  rows.forEach(([a, v, at], i) => { const k = easeOut(clamp((t - at) / .6)); if (k <= 0) return; const y = yv(v) + i * 0; g += `<g opacity="${k}"><path d="M620,${yv(v)} H${880 + i * 0}" stroke="${Y}" stroke-width="5"/>` + txt(910, yv(v) - 30 + i * 70, `${a}　${v.toFixed(1)}cm`, { size: 58, color: i === 0 ? Y : '#f0e6c8', anchor: 'start', serif: true }) + '</g>'; });
  return R([{ at: 0, slide: 0, f: () => head('日本人男性の平均身長', { y: 150, size: 54 }) + g }, ref(S2)], t); }, 2);
// 25 平均の点線が2本目の線に重なる
SC[25] = C1((t) => { const xw = BX0 + 6 * (BW + BG) - BG / 2, k = ease(clamp((t - 1.2) / 2.2)), x = xw + (1 - k) * 700;
  let g = chartN(t, 8, 8, { hi: [1, 6], dimAll: true }) + W1(1) + W2(1);
  g += `<g opacity="${easeOut(clamp((t - 1) / .4))}"><path d="M${x},${BY + 20} V${BY - BH - 70}" stroke="${Y}" stroke-width="7" stroke-dasharray="18 12"/>` + lab3(x, BY - BH - 90, '男性の平均 171.5cm', Y, 1 - easeOut(clamp((t - 4.0) / .4)), 38) + '</g>';
  if (t > 3.6 && t < 4.2) g += `<circle cx="${xw}" cy="${BY - BH / 2}" r="${(t - 3.6) * 900}" fill="none" stroke="${Y}" stroke-width="6" opacity="${1 - (t - 3.6) / .6}"/>`;
  if (t > 4.2) g += `<g opacity="${easeOut(clamp((t - 4.2) / .5))}">` + txt(CX, 200, '2本目の線 ＝ 平均身長', { size: 58, color: Y, serif: true }) + '</g>'; return g; }, 2);
// 26・27 平均より下／上の箱
const boxes = (t, items, o = {}) => { let g = `<rect x="260" y="560" width="600" height="330" rx="24" fill="rgba(255,255,255,.04)" stroke="#5a5560" stroke-width="4"/><rect x="1060" y="560" width="600" height="330" rx="24" fill="rgba(240,200,90,.08)" stroke="${Y}" stroke-width="4"/>` + txt(560, 940, '平均より下', { size: 46, color: '#c8c0d0' }) + txt(1360, 940, '平均より上', { size: 46, color: Y });
  items.forEach(([h, at], i) => { const up = h > 171.5, k = ease(clamp((t - at) / 1.0)); const s = 50 + (h - 150) * 1.2, x0 = 760 + i * 100, x1 = (up ? 1360 : 560) + ((o.slot ? o.slot(i) : 0)), y = 380 + k * (870 - 1.17 * s - 380); const x = x0 + (x1 - x0) * k;
    g += person(x, y, s, up ? Y : '#8a8490') + txt(x, y - s * 1.6, h + '', { size: 32, color: up ? Y : '#c8c0d0' }); });
  return g; };
SC[26] = K((t) => R([{ at: 0, slide: 0, f: () => boxes(t, [[165, .6], [178, 1.4], [170, 2.2], [183, 3.0], [160, 3.8]], { slot: (i) => [-160, -100, 0, 120, 160][i] }) }, { at: 0, f: () => head('見ているのは「平均より上か、下か」？', { y: 170, size: 48 }) }], t), 2);
SC[27] = K((t) => R([{ at: 0, slide: 0, f: () => boxes(t, [[174, .8], [180, 2.0], [185, 3.2]], { slot: (i) => [-170, 0, 170][i] }) + (t > 5 ? `<g opacity="${easeOut(clamp((t - 5) / .5))}">` + lab3(1360, 500, '174でも180でも、同じ箱', Y, 1, 40) + '</g>' : '') }, { at: 0, f: () => head('いったん平均を超えれば', { y: 170, size: 50 }) }], t), 2);
// 28 162の線にスポット
SC[28] = C1((t) => `<defs><radialGradient id="sp" cx="${(BX0 + (BW + BG) - BG / 2) / 19.2}%" cy="55%" r="22%"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></radialGradient></defs>` + chartN(t, 8, 8, { hi: [1, 6], dimAll: true }) + W1(1) + W2(1) + `<rect width="1920" height="1080" fill="url(#sp)" opacity="${easeOut(clamp((t - .3) / .6))}"/>` + wtag(1, '1本目　162cm', clamp((t - .8) / .4), Y), 2);
// 31 2本の線のラベル
SC[31] = C1((t) => chartN(t, 8, 8, { hi: [1, 6], dimAll: true }) + W1(1) + W2(1) + wtag(1, '自分より低くない？', clamp((t - .8) / .4), '#7fb8ff', -10) + wtag(6, '平均より上？', clamp((t - 4.4) / .4), Y, -10), 2);
// 32 注意カード
const caution = (t, l1, l2) => `<g transform="translate(${CX},520) scale(${pop(clamp(t / .5))})"><rect x="-640" y="-190" width="1280" height="380" rx="30" fill="#1d1a22" stroke="#7fb8ff" stroke-width="5"/>` + txt(-560, -90, '※ 注意', { size: 46, color: '#7fb8ff', anchor: 'start' }) + txt(0, 20, l1, { size: 50, color: '#f0ecf6', serif: true }) + txt(0, 110, l2, { size: 40, color: '#c8c0d0' }) + '</g>';
SC[32] = K((t) => R([{ at: 0, slide: 0, f: () => caution(t, 'これは、データの形から読める1つの見方', '女性がなぜそう選ぶのかまでは、調べられていない') }], t), 2);
// 34 スマホで「172cm以上」を押すと半分消える
SC[34] = K((t) => { const hs = [168, 175, 170, 181, 165, 173, 171], press = 1.8; let inner = `<rect x="0" y="0" width="520" height="110" fill="#ece8e2"/>` + txt(40, 70, '検索条件', { size: 34, color: '#2a2420', anchor: 'start', shadow: false });
  const on = t > press; inner += `<rect x="300" y="28" width="196" height="58" rx="29" fill="${on ? '#e0453a' : '#fff'}" stroke="#e0453a" stroke-width="3"/>` + txt(398, 68, '172cm以上', { size: 28, color: on ? '#fff' : '#e0453a', shadow: false });
  let yy = 130; hs.forEach((h, i) => { const gone = h < 172, a = gone ? 1 - ease(clamp((t - press - .2 - i * .06) / .5)) : 1; if (a <= .01 && gone) return;
    inner += `<g opacity="${a}" transform="translate(0,${yy})"><rect x="20" y="0" width="480" height="84" rx="14" fill="#fff"/><circle cx="70" cy="42" r="28" fill="#d8d2ca"/>` + txt(120, 54, `会員 ${String.fromCharCode(65 + i)}`, { size: 30, color: '#2a2420', anchor: 'start', shadow: false }) + txt(470, 54, h + 'cm', { size: 32, color: h < 172 ? '#9a9088' : '#2a2420', anchor: 'end', shadow: false }) + '</g>';
    yy += 88 * (gone ? a : 1); });
  const g = phone(520, 150, 520, 780, inner) + (t > press ? `<circle cx="${520 + 398}" cy="${150 + 57}" r="${30 + (t - press) * 80}" fill="none" stroke="#e0453a" stroke-width="5" opacity="${Math.max(0, 1 - (t - press) / .6)}"/>` : '');
  return R([{ at: 0, slide: 0, f: () => g }, { at: 3.6, f: () => lab3(1420, 540, '平均ちょうどの男性も消える', Y, 1, 42) }], t); }, 2);
// 35 プロフィールカード：顔・性格は？、身長だけくっきり
SC[35] = K((t) => { let g = `<g transform="translate(${CX - 330},210)"><rect width="660" height="640" rx="30" fill="#f8f6f2"/><circle cx="330" cy="150" r="96" fill="#d8d2ca"/>` + txt(330, 185, '？', { size: 110, color: '#9a9088', shadow: false }) +
    txt(70, 330, '性格', { size: 36, color: '#6a6058', anchor: 'start', shadow: false }) + txt(590, 330, '？', { size: 44, color: '#9a9088', anchor: 'end', shadow: false }) + txt(70, 410, '話しやすさ', { size: 36, color: '#6a6058', anchor: 'start', shadow: false }) + txt(590, 410, '？', { size: 44, color: '#9a9088', anchor: 'end', shadow: false });
  const p = .5 + .5 * Math.sin(t * 5); g += `<rect x="40" y="450" width="580" height="110" rx="18" fill="rgba(255,190,60,${.3 + .3 * p})" stroke="#e0a020" stroke-width="5"/>` + txt(70, 524, '身長', { size: 44, color: '#2a2420', anchor: 'start', shadow: false }) + txt(590, 528, '171cm', { size: 64, color: '#2a2420', anchor: 'end', shadow: false }) + '</g>';
  return R([{ at: 0, slide: 0, f: () => g }, { at: 5.2, f: () => cap(905, '数字で書いてあるから、最初の足切りに使われやすい', Y, 38) }], t); }, 2);
// 36・54・67 章タイトル
const chapTitle = (no, title, ch) => K((t) => R([{ at: 0, slide: 0, f: () => txt(960, 470, no, { size: 44, color: C.o }) + txt(960, 600, title, { size: 92, color: Y, serif: true }) }], t), ch);
SC[36] = chapTitle('第3章', '13cmの謎', 3); SC[67] = chapTitle('第5章', '見えない線', 5);
// 38〜43 身長差のグラフ（縦の棒）
const DF = [['妻が高い', 2.0], ['同じ', 2.1], ['1〜2', 3.7], ['3〜4', 5.1], ['5〜6', 7.2], ['7〜8', 9.2], ['9〜10', 10.5], ['11〜12', 10.9], ['13〜14', 11.0], ['15〜16', 9.9], ['17〜18', 8.4], ['19〜20', 6.3], ['21〜22', 5.1], ['23〜24', 3.3]];
const DX0 = 240, DW = 92, DG = 12, DY = 820, DH = 500, dh = (v) => v / 12 * DH, dxc = (i) => DX0 + i * (DW + DG) + DW / 2;
const diffChart = (t, o = {}) => { let g = `<path d="M${DX0 - 20},${DY} H${DX0 + 14 * (DW + DG)}" stroke="${C.gray}" stroke-width="4"/>`;
  DF.forEach(([lab, v], i) => { const k = o.anim ? easeOut(clamp((t - .4 - i * .12) / .5)) : 1, hh = dh(v) * k; const band = o.band && i >= 6 && i <= 9, top = i === 8 && o.top;
    const col = top ? RED : band ? '#ff8fb1' : i < 2 ? '#7a7484' : '#b8b0a4'; g += `<rect x="${dxc(i) - DW / 2}" y="${DY - hh}" width="${DW}" height="${hh}" rx="6" fill="${col}"/>` + (k > .1 ? txt(dxc(i), DY - hh - 14, v.toFixed(1), { size: 26, color: top ? '#fff' : C.fg }) : '') + txt(dxc(i), DY + 40, lab, { size: lab.length > 4 ? 22 : 26, color: DIM }); });
  return g + txt(DX0 + 7 * (DW + DG), DY + 92, '夫のほうが何cm高いか（%）', { size: 28, color: DIM }); };
const D1 = (f, ch = 3) => K((t) => R([{ at: 0, slide: 0, f: () => f(t) }, ref(S1)], t), ch);
SC[38] = D1((t) => head('成婚カップルの身長差', { y: 180, size: 50 }) + diffChart(t, { anim: true, top: t > 3 }) + (t > 3 ? wtagD(8, 'いちばん多い', clamp((t - 3) / .4)) : ''));
function wtagD(i, s0, k) { return `<g opacity="${k}" transform="translate(${dxc(i)},${DY - dh(11) - 80}) scale(${pop(k)})"><rect x="${-s0.length * 19 - 24}" y="-46" width="${s0.length * 38 + 48}" height="70" rx="14" fill="rgba(20,8,10,.92)" stroke="${RED}" stroke-width="4"/>` + txt(0, 2, s0, { size: 36, color: '#fff' }) + '</g>'; }
SC[39] = D1((t) => head('成婚カップルの身長差', { y: 165, size: 46 }) + `<rect x="${dxc(6) - DW / 2 - 12}" y="${DY - DH - 70}" width="${4 * (DW + DG) + 12}" height="${DH + 80}" rx="18" fill="rgba(255,143,177,.12)" stroke="#ff8fb1" stroke-width="4" opacity="${easeOut(clamp((t - .6) / .5))}"/>` + diffChart(t, { band: t > .6, top: true }) + (t > 1.6 ? `<g transform="translate(${dxc(7.5)},${DY - DH - 20}) scale(${pop(clamp((t - 1.6) / .4))})">` + txt(0, 0, '8〜16cm差で 42.3%', { size: 52, color: '#ffb3c9', serif: true }) + '</g>' : ''));
SC[40] = D1((t) => { let g = head('100組のうち', { y: 190, size: 52 }); for (let i = 0; i < 100; i++) { const r = Math.floor(i / 20), c = i % 20, x = 390 + c * 60, y = 330 + r * 110, odd = [17, 38, 61, 86].includes(i), k = easeOut(clamp((t - .3 - i * .012) / .3));
    g += `<g opacity="${k}">` + person(x - 12, y + 40, 22, odd ? Y : '#7fb8ff') + person(x + 12, y + 40, odd ? 24 : 19, odd ? Y : '#ff8fb1', 'f') + '</g>'; }
  return g + (t > 2.4 ? `<g opacity="${easeOut(clamp((t - 2.4) / .5))}">` + txt(CX, 920, '妻のほうが高い・同じ ＝ 約4%', { size: 52, color: Y, serif: true }) + '</g>' : ''); });
SC[41] = K((t) => R([{ at: 0, slide: 0, f: () => `<g transform="translate(${CX},560) scale(${1 + t * .06})">` + txt(0, 0, '13', { size: 320, color: '#fff', serif: true }) + txt(200, -10, 'cm', { size: 90, color: DIM, anchor: 'start' }) + '</g>' + (t > 1.6 ? stampQ(1420, 330, pop(clamp((t - 1.6) / .4)), RED, 90) : '') }], t), 3);
SC[43] = D1((t) => { const k = easeOut(clamp((t - .6) / .6)); return diffChart(t, { top: true }) + `<g opacity="${k}"><path d="M${dxc(8) - 60},${DY - dh(11) - 110} h120" stroke="${Y}" stroke-width="6"/><path d="M${dxc(8)},${DY - dh(11) - 110} v60" stroke="${Y}" stroke-width="6"/>` + lab3(dxc(8), DY - dh(11) - 140, '男女の平均の差 13.4cm', Y, 1, 40) + '</g>'; });
// 46 720組に1組
SC[46] = K((t) => { let g = ''; const n = Math.floor(720 * easeOut(clamp((t - .3) / 2.4))); for (let i = 0; i < n; i++) { const r = Math.floor(i / 40), c = i % 40; const red = i === 437; g += `<circle cx="${410 + c * 28}" cy="${300 + r * 28}" r="${red ? 12 : 9}" fill="${red ? RED : '#6a6474'}"/>`; }
  if (t > 3) g += `<circle cx="${410 + 37 * 28 - 28 * 40 + 28 * 37}" cy="0" r="0"/>` + `<g opacity="${easeOut(clamp((t - 3) / .5))}"><circle cx="${410 + (437 % 40) * 28}" cy="${300 + Math.floor(437 / 40) * 28}" r="34" fill="none" stroke="${RED}" stroke-width="5"/></g>`;
  return R([{ at: 0, slide: 0, f: () => g }, { at: 0, f: () => head('アメリカ・イギリスの720組', { y: 200, size: 50 }) }, { at: 3.4, f: () => cap(900, '妻のほうが高いのは、たった1組', Y, 46) }, { at: .6, ref: true, f: () => note(1880, 58, 'Gillis & Avis（1980）', 'end') }], t); }, 3);
// 47 偶然なら100組に2組 vs 実際は720組に1組
SC[47] = K((t) => { const panel = (x, title, sub, n, reds, at, col) => { let g = `<g transform="translate(${x},280)" opacity="${easeOut(clamp((t - at) / .5))}">` + card(-380, -40, 760, 600, { fill: 'rgba(255,255,255,.04)', stroke: col }) + txt(0, 40, title, { size: 44, color: col, serif: true }) + txt(0, 100, sub, { size: 32, color: DIM });
    for (let i = 0; i < n; i++) { const c = i % 10, r = Math.floor(i / 10); g += `<circle cx="${-225 + c * 50}" cy="${170 + r * 38}" r="14" fill="${reds.includes(i) ? RED : '#6a6474'}"/>`; } return g + '</g>'; };
  return R([{ at: 0, slide: 0, f: () => panel(520, 'でたらめに組むと', '100組に約2組', 100, [34, 77], .3, '#c8c0d0') + panel(1400, '実際は', '720組に1組（100組なら0.14組）', 100, [], 3.0, RED) }, { at: 6.4, f: () => cap(960, '偶然の、約14分の1', Y, 50) }, { at: .6, ref: true, f: () => note(1880, 58, 'Stulp ほか（2013）による説明', 'end') }], t); }, 3);
// 49 10組中9組以上で夫が高い
SC[49] = K((t) => { let g = ''; for (let i = 0; i < 10; i++) { const x = 300 + i * 148, k = easeOut(clamp((t - .4 - i * .1) / .4)), same = i === 6;
    g += `<g opacity="${k}">` + person(x - 26, 790 - 1.17 * (same ? 66 : 74), same ? 66 : 74, '#7fb8ff') + person(x + 26, 790 - 1.17 * (same ? 68 : 64), same ? 68 : 64, '#ff8fb1', 'f') + '</g>'; }
  g += `<rect x="200" y="790" width="1520" height="8" rx="4" fill="#4a4450"/>`;
  return R([{ at: 0, slide: 0, f: () => g }, { at: 0, f: () => head('イギリスの夫婦', { y: 200, size: 50 }) }, { at: 2.4, f: () => cap(380, '夫のほうが高い：10組に9組以上', Y, 46) }, { at: 5.2, f: () => cap(900, '平均の差は、およそ14cm', Y, 46) }, { at: .6, ref: true, f: () => note(1880, 58, 'Stulp ほか（2013）', 'end') }], t); }, 3);
// 50 身長差の山：両端がへこむ
SC[50] = K((t) => { const X0 = 360, X1 = 1560, Y0 = 820, f = (u) => Math.exp(-Math.pow((u - .45) / .2, 2)); let d = `M${X0},${Y0}`, n = 80, k = easeOut(clamp((t - .3) / 1.6)); for (let i = 0; i <= n * k; i++) { const u = i / n; d += ` L${X0 + (X1 - X0) * u},${Y0 - f(u) * 440}`; }
  let g = `<path d="M${X0},${Y0} H${X1}" stroke="${C.gray}" stroke-width="4"/><path d="${d}" stroke="${Y}" stroke-width="8" fill="none"/>` + txt(X0, Y0 + 50, '妻が高い', { size: 30, color: DIM }) + txt(X1, Y0 + 50, '夫が25cm以上高い', { size: 30, color: DIM });
  if (t > 2.4) { const a = easeOut(clamp((t - 2.4) / .5)); g += `<g opacity="${a}"><rect x="${X0 - 10}" y="${Y0 - 200}" width="200" height="200" rx="14" fill="${RED}" opacity=".18"/><rect x="${X1 - 190}" y="${Y0 - 200}" width="200" height="200" rx="14" fill="${RED}" opacity=".18"/>` + txt(X0 + 90, Y0 - 220, '少ない', { size: 40, color: RED }) + '</g>'; }
  if (t > 4.6) g += `<g opacity="${easeOut(clamp((t - 4.6) / .5))}">` + txt(X1 - 90, Y0 - 220, '少ない', { size: 40, color: RED }) + '</g>';
  return R([{ at: 0, slide: 0, f: () => g }, { at: 0, f: () => head('高すぎる相手も、避けられていた', { y: 200, size: 50 }) }, { at: .6, ref: true, f: () => note(1880, 58, 'Stulp ほか（2013）', 'end') }], t); }, 3);
// 52 理想21cm → 実際14cm
SC[52] = K((t) => { const yv = (cm) => 860 - cm * 30; let g = `<path d="M760,${yv(0)} V${yv(24)}" stroke="#efe6d2" stroke-width="10"/>`; for (let cm = 0; cm <= 24; cm += 2) g += `<path d="M760,${yv(cm)} h${cm % 10 === 0 ? 50 : 26}" stroke="#efe6d2" stroke-width="3"/>` + (cm % 10 === 0 ? txt(740, yv(cm) + 12, cm + '', { size: 30, color: DIM, anchor: 'end' }) : '');
  const k1 = easeOut(clamp((t - .5) / .5)); g += `<g opacity="${k1}"><path d="M760,${yv(21)} H1000" stroke="#ff8fb1" stroke-width="6"/>` + txt(1020, yv(21) + 18, '女性の理想　21cm', { size: 54, color: '#ffb3c9', anchor: 'start', serif: true }) + '</g>';
  const k2 = easeOut(clamp((t - 4.4) / .6)); g += `<g opacity="${k2}"><path d="M760,${yv(14)} H1000" stroke="${Y}" stroke-width="6"/>` + txt(1020, yv(14) + 18, '実際の夫婦　約14cm', { size: 54, color: Y, anchor: 'start', serif: true }) + '</g>';
  if (t > 6.5) g += arrow(900, yv(21) + 20, 900, yv(14) - 20, '#ffffff', easeOut(clamp((t - 6.5) / .8)), 6) + (t > 7.4 ? `<g opacity="${easeOut(clamp((t - 7.4) / .5))}">` + txt(560, (yv(21) + yv(14)) / 2 + 14, '折り合い', { size: 48, color: '#fff', anchor: 'end', serif: true }) + '</g>' : '');
  return R([{ at: 0, slide: 0, f: () => g }, { at: 1.2, f: () => note(CX, 915, '※別々の調査なので、単純には比べられない') }, { at: .6, ref: true, f: () => note(1880, 58, 'Stulp ほか（2013）', 'end') }], t); }, 3);
// 53 男女の矢印が近づいて13cmに収まる
SC[53] = K((t) => { const k = ease(clamp((t - 6) / 2.5)); let g = person(560 + k * 240, 818 - 117, 100, '#7fb8ff') + person(1360 - k * 240, 818 - 1.17 * 92, 92, '#ff8fb1', 'f');
  g += `<g opacity="${easeOut(clamp((t - .6) / .5))}">` + lab3(560, 380, '自分より少し高い男性を選ぶ', '#ffb3c9', 1, 34) + '</g>' + `<g opacity="${easeOut(clamp((t - 3) / .5))}">` + lab3(1360, 300, '自分より少し低い女性を選ぶ', '#9fd0ff', 1, 34) + '</g>';
  if (t > 9) g += `<g transform="translate(${CX},${520}) scale(${pop(clamp((t - 9) / .4))})">` + txt(0, 0, '答え ＝ 13cm', { size: 72, color: Y, serif: true }) + '</g>';
  return R([{ at: 0, slide: 0, f: () => g + `<rect x="300" y="818" width="1320" height="8" rx="4" fill="#4a4450"/>` }], t); }, 3);
// 54 鍵が開く
SC[54] = K((t) => { const op = ease(clamp((t - 1.4) / .8)); let g = `<g transform="translate(${CX},520)"><rect x="-330" y="-200" width="660" height="400" rx="30" fill="#211d28" stroke="${Y}" stroke-width="6"/>` + (op < 1 ? txt(0, 40, '？？？', { size: 150, color: Y, serif: true, op: 1 - op }) : '') + txt(0, 50, '年収', { size: 170, color: Y, serif: true, op });
  g += `<g transform="translate(0,${-200 - op * 60}) rotate(${op * 25})" opacity="${1 - op}"><path d="M-50,0 V-50 a50,50 0 0 1 100,0 V${-op * 30}" stroke="#c9b48a" stroke-width="16" fill="none"/><rect x="-75" y="-8" width="150" height="110" rx="16" fill="#c9b48a"/></g></g>`;
  return R([{ at: 0, slide: 0, f: () => g }, { at: 2.6, f: () => cap(880, 'もう1つの答え', Y, 46) }], t); }, 4);
// 56〜60 身長×年収
const TI = [['年収450万円以下', [10.7, 21.4, 23.6]], ['年収550〜750万円', [33.1, 38.9, 41.3]], ['年収850万円以上', [41.8, 44.9, 43.9]]], TC = ['#ff8fb1', '#b8b0a4', '#7fb8ff'], TL3 = ['160cm以下', '162〜170cm', '172cm以上'];
const tiers = (t, n, from, at0 = .5) => { let g = ''; const X0 = 560, WW = 800, mx = 50;
  for (let r = 0; r < n; r++) { const y0 = 240 + r * 230; g += txt(X0 - 30, y0 + 80, TI[r][0], { size: 34, color: '#e8e0f0', anchor: 'end' });
    TI[r][1].forEach((v, i) => { const k = r < from ? 1 : easeOut(clamp((t - at0 - i * .5) / .7)); const w = v / mx * WW * k, y = y0 + i * 58; g += `<rect x="${X0}" y="${y}" width="${w}" height="44" rx="8" fill="${TC[i]}"/>` + (k > .1 ? txt(X0 + w + 16, y + 34, v.toFixed(1) + '%', { size: 32, color: C.fg, anchor: 'start' }) : ''); }); }
  let lg = ''; TL3.forEach((s0, i) => { lg += `<rect x="${560 + i * 330}" y="878" width="34" height="34" rx="6" fill="${TC[i]}"/>` + txt(604 + i * 330, 906, s0, { size: 30, color: '#e8e0f0', anchor: 'start' }); });
  return g + lg; };
const T1 = (f) => K((t) => R([{ at: 0, slide: 0, f: () => f(t) }, ref(S1)], t), 4);
SC[56] = T1((t) => head('身長 × 年収の成婚率', { y: 170, size: 50 }) + tiers(t, 1, 0, 3.2));
SC[58] = T1((t) => head('身長 × 年収の成婚率', { y: 170, size: 50 }) + tiers(t, 2, 1, 1.2) + (t > 5.5 ? `<g opacity="${easeOut(clamp((t - 5.5) / .5))}">` + txt(1860, 560, '差が縮む', { size: 40, color: Y, anchor: 'end' }) + '</g>' : ''));
SC[59] = T1((t) => head('身長 × 年収の成婚率', { y: 170, size: 50 }) + tiers(t, 3, 2, 2.0) + (t > 9.5 ? `<g opacity="${easeOut(clamp((t - 9.5) / .5))}">` + txt(1860, 660, '差は2ポイント', { size: 40, color: Y, anchor: 'end' }) + '</g>' : '') + (t > 13 ? `<g opacity="${easeOut(clamp((t - 13) / .5))}">` + txt(1860, 705, '162〜170cmが いちばん高い', { size: 34, color: '#e8e0f0', anchor: 'end' }) + '</g>' : ''));
SC[60] = T1((t) => { let g = head('同じ160cm以下でも', { y: 200, size: 54 }); const k = easeOut(clamp((t - .4) / .6));
  g += `<g opacity="${k}"><rect x="360" y="600" width="${10.7 / 45 * 1100}" height="110" rx="12" fill="#ff8fb1" opacity=".55"/>` + txt(360, 570, '年収450万円以下　10.7%', { size: 40, color: '#e8e0f0', anchor: 'start' }) + '</g>';
  const k2 = easeOut(clamp((t - 1.6) / .9)); g += `<g opacity="${k2 > 0 ? 1 : 0}"><rect x="360" y="780" width="${41.8 / 45 * 1100 * k2}" height="110" rx="12" fill="#ff8fb1"/>` + txt(360, 760, '年収850万円以上　41.8%', { size: 40, color: '#e8e0f0', anchor: 'start' }) + '</g>';
  if (t > 3) g += `<g transform="translate(1600,560) scale(${pop(clamp((t - 3) / .4))})"><circle r="120" fill="${RED}"/>` + txt(0, 0, '約', { size: 40, color: '#fff', shadow: false }) + txt(0, 60, '4倍', { size: 76, color: '#fff', shadow: false, serif: true }) + '</g>'; return g; });
// 62・65 天秤（物差し vs お札）
const scale = (t, tilt) => { const a = tilt * 12; let g = `<g transform="translate(${CX},360)"><path d="M0,0 V460" stroke="#c9b48a" stroke-width="18"/><path d="M-160,460 h320" stroke="#c9b48a" stroke-width="22" stroke-linecap="round"/><g transform="rotate(${a})"><path d="M-460,0 H460" stroke="#c9b48a" stroke-width="16" stroke-linecap="round"/>`;
  const pan = (x, inner) => `<g transform="translate(${x},0) rotate(${-a})"><path d="M0,0 L-120,200 M0,0 L120,200" stroke="#a89a78" stroke-width="4"/><path d="M-150,200 h300 a150,40 0 0 1 -300,0 Z" fill="#8a7a58"/>${inner}</g>`;
  g += pan(-440, `<rect x="-20" y="20" width="40" height="180" rx="4" fill="#efe6d2"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M-20,${40 + i * 28} h18" stroke="#2a2420" stroke-width="3"/>`).join('')}` + txt(0, 250, '身長', { size: 40, color: '#e8e0f0' }));
  g += pan(440, [0, 1, 2, 3].map(i => `<rect x="-90" y="${170 - i * 22}" width="180" height="26" rx="4" fill="#7fae6a" stroke="#4a7a3a" stroke-width="2"/>`).join('') + txt(0, 250, 'お金', { size: 40, color: '#e8e0f0' }));
  return g + '</g></g>'; };
SC[62] = K((t) => R([{ at: 0, slide: 0, f: () => scale(t, Math.sin(t * 1.4) * .5) }, { at: 1.2, f: () => cap(150, '身長と年収の「交換レート」', Y, 48) }, { at: .6, ref: true, f: () => note(1880, 58, 'Hitsch, Hortaçsu & Ariely（2010）', 'end') }], t), 4);
SC[65] = K((t) => R([{ at: 0, slide: 0, f: () => scale(t, (1 - ease(clamp(t / 2.5))) * .8) }, { at: 2.6, f: () => cap(150, '身長は、ほかのもので埋め合わせできる', Y, 46) }], t), 4);
// 63 168cmと183cm、お札が積み上がる
SC[63] = K((t) => { const k = easeOut(clamp((t - 2.5) / 4)); let g = person(560, 820 - 1.17 * 116, 116, '#8a8490') + person(1300, 820 - 1.17 * 126, 126, '#7fb8ff') + txt(560, 885, '約168cm', { size: 40, color: '#e8e0f0' }) + txt(1300, 885, '約183cm', { size: 40, color: '#9fd0ff' });
  const nb = Math.floor(14 * k); for (let i = 0; i < nb; i++) g += `<rect x="680" y="${794 - i * 26}" width="200" height="24" rx="4" fill="#7fae6a" stroke="#4a7a3a" stroke-width="2"/>`;
  g += `<rect x="200" y="820" width="1520" height="8" rx="4" fill="#4a4450"/>`;
  if (t > 4) g += `<g opacity="${easeOut(clamp((t - 4) / .5))}">` + txt(780, 360, '年収 +17万5000ドル', { size: 58, color: '#a8e090', serif: true }) + '</g>';
  if (t > 9.5) g += `<g opacity="${easeOut(clamp((t - 9.5) / .5))}">` + txt(780, 430, '（日本円で2000万円以上）', { size: 40, color: '#e8e0f0' }) + '</g>';
  return R([{ at: 0, slide: 0, f: () => g }, { at: .2, f: () => head('同じくらい選ばれるには', { y: 200, size: 50 }) }, { at: .6, ref: true, f: () => note(1880, 58, 'Hitsch, Hortaçsu & Ariely（2010）', 'end') }], t); }, 4);
SC[64] = K((t) => R([{ at: 0, slide: 0, f: () => caution(t, '20年ほど前のアメリカ・最初の一押しの段階', '日本の婚活と、そのまま比べることはできない') }], t), 4);
// 68 まとめ：2本の線
SC[68] = C1((t) => head('婚活の身長、2本の見えない線', { y: 190, size: 50 }) + chartN(t, 8, 8, { hi: [1, 6], dimAll: true }) + W1(clamp((t - .6) / .4)) + W2(clamp((t - 1.4) / .4)), 5);
// 70 13cm
SC[70] = K((t) => { const k = easeOut(clamp((t - .4) / .5)); const FL = 860, ty = (s) => FL - 2.53 * s; let g = person(640, FL - 1.17 * 120, 120, '#7fb8ff') + person(840, FL - 1.17 * 110, 110, '#ff8fb1', 'f') + `<rect x="380" y="${FL}" width="720" height="8" rx="4" fill="#4a4450"/>`;
  g += `<g opacity="${k}"><path d="M580,${ty(120)} H1080 M780,${ty(110)} H1080" stroke="${Y}" stroke-width="4" stroke-dasharray="12 8"/><path d="M1090,${ty(120)} h30 V${ty(110)} h-30" stroke="${Y}" stroke-width="6" fill="none"/>` + txt(1150, (ty(120) + ty(110)) / 2 + 16, '13cm ≒ 男女の平均の差', { size: 46, color: Y, anchor: 'start', serif: true }) + '</g>';
  return R([{ at: 0, slide: 0, f: () => g }], t); }, 5);
SC[71] = T1((t) => head('年収が上がると', { y: 170, size: 50 }) + tiers(t, 3, 3) + (t > 1 ? `<g opacity="${easeOut(clamp((t - 1) / .5))}">` + txt(1760, 860, '線は、ほぼ消える', { size: 44, color: Y, anchor: 'end' }) + '</g>' : ''));
SC[71] = K((t) => R([{ at: 0, slide: 0, f: () => head('年収が上がると', { y: 170, size: 50 }) + tiers(t, 3, 3) + (t > 1 ? `<g opacity="${easeOut(clamp((t - 1) / .5))}">` + txt(1860, 800, '線は、ほぼ消える', { size: 44, color: Y, anchor: 'end' }) + '</g>' : '') }, ref(S1)], t), 5);
SC[72] = K((t) => R([{ at: 0, slide: 0, f: () => caution(t, '1つの結婚相談所の、会員のデータ', '日本の男性全体に、そのまま当てはまるとは限らない') }], t), 5);
// 75 コメント・76 締め
SC[75] = K((t) => R([{ at: 0, f: () => `<g transform="translate(960,470) scale(${pop(clamp(t / .5))})"><path d="M-560,-170 h1120 a40,40 0 0 1 40,40 v240 a40,40 0 0 1 -40,40 h-940 l-90,70 v-70 h-90 a40,40 0 0 1 -40,-40 v-240 a40,40 0 0 1 40,-40 Z" fill="rgba(240,200,90,.12)" stroke="${Y}" stroke-width="6"/>` + txt(0, -40, 'あなたとパートナーの身長差は', { size: 56, serif: true }) + txt(0, 60, '何cm？', { size: 72, color: Y, serif: true }) + '</g>' }, { at: 2.2, f: () => txt(960, 820, 'コメント欄で教えてください', { size: 44, color: DIM }) }], t), 5);
SC[76] = K((t) => R([{ at: 0, f: () => txt(960, 460, '今日のネタバレは、ここまで', { size: 64, serif: true }) }, { at: 1.9, f: () => `<g transform="translate(960,640) scale(${pop(clamp((t - 1.9) / .4))})"><rect x="-230" y="-56" width="460" height="112" rx="56" fill="#e0453a"/>${txt(0, 18, 'チャンネル登録', { size: 50, color: '#fff', shadow: false })}</g>` }], t), 5);

// ===== 実写の場面：緑に塗って、カード・出典だけ上に置く =====
// 1 スマホのプロフィール → 右に「身長」欄のカード
const profCard = (t) => { const k = easeOut(clamp((t - .6) / .6)), x = 1360 + (1 - k) * 300;
  const rows = [['年齢', '32歳'], ['職業', '会社員'], ['年収', '500〜600万円'], ['身長', '？？？ cm']];
  let g = `<g opacity="${k}" transform="translate(${x},250)"><rect x="0" y="0" width="460" height="520" rx="28" fill="#f8f6f2"/><circle cx="230" cy="110" r="66" fill="#d8d2ca"/><circle cx="230" cy="92" r="26" fill="#b0a89e"/><path d="M180,160 a50,40 0 0 1 100,0 Z" fill="#b0a89e"/>`;
  rows.forEach(([a, b], i) => { const y = 250 + i * 66, hi = i === 3, p = hi ? .5 + .5 * Math.sin(t * 6) : 0;
    g += (hi ? `<rect x="20" y="${y - 44}" width="420" height="60" rx="12" fill="rgba(255,190,60,${.35 + .3 * p})" stroke="#e0a020" stroke-width="${3 + 3 * p}"/>` : '') + txt(46, y, a, { size: 30, color: '#6a6058', anchor: 'start', shadow: false }) + txt(420, y, b, { size: 32, color: '#2a2420', anchor: 'end', shadow: false }); });
  return g + '</g>'; };
// 3 背の高い男と女 → 右下に「横ばい」の小さなグラフ
const miniStep = (t) => { const k = easeOut(clamp((t - 1.0) / .7)); let g = `<g opacity="${k}" transform="translate(1340,560)"><rect x="0" y="0" width="500" height="300" rx="20" fill="#141219" stroke="rgba(255,255,255,.2)" stroke-width="2"/>`;
  const pts = [[60, 230], [130, 160], [200, 152], [260, 150], [330, 148], [390, 92], [450, 98]]; const n = Math.max(2, Math.ceil(pts.length * easeOut(clamp((t - 1.2) / 1.6))));
  g += `<path d="M${pts.slice(0, n).map(p => p.join(',')).join(' L')}" stroke="${Y}" stroke-width="7" fill="none" stroke-linejoin="round"/>`;
  if (t > 2.8) g += `<path d="M390,70 H470" stroke="${RED}" stroke-width="6" stroke-dasharray="10 8"/>` + txt(430, 56, '横ばい', { size: 30, color: RED });
  return g + txt(250, 284, '身長 →', { size: 24, color: DIM }) + txt(70, 50, '成婚率', { size: 24, color: DIM, anchor: 'start' }) + '</g>'; };
const capO = (y, s0, col = Y, size = 46) => `<g>${card(CX - s0.length * size * .55 - 40, y - size - 18, s0.length * size * 1.1 + 80, size * 1.9, { fill: '#141219', stroke: col })}${txt(CX, y + 4, s0, { size, color: col, serif: true })}</g>`;
const S4 = 'Stulp ほか（2013）', S6 = 'Hitsch, Hortaçsu & Ariely（2010）';
const C2 = (s0, t0 = .5, src = '', size = 46) => (t) => (t > t0 ? capO(170, s0, Y, size) : '') + (src ? srcBox(src) : '');
const bubO = (x, y, s0, col, a) => `<g opacity="${a}"><rect x="${x - s0.length * 23 - 30}" y="${y - 50}" width="${s0.length * 46 + 60}" height="84" rx="42" fill="#141219" stroke="${col}" stroke-width="5"/>` + txt(x, y + 6, s0, { size: 44, color: col }) + '</g>';
const GV = [[1, (t) => (t > .4 ? capO(170, 'プロフィールには、ほぼ必ず「身長」', Y, 46) : '') + profCard(t)],
  [3, (t) => (t > .6 ? capO(170, '172cmを超えると、もう変わらない', Y, 46) : '') + miniStep(t) + srcBox(S1)],
  [8, C2('大手結婚相談所 IBJ の成婚データ', .5, S1)],
  [9, (t) => { const k = pop(clamp((t - .6) / .5)); return `<g transform="translate(${CX},470) scale(${k})"><rect x="-700" y="-170" width="1400" height="330" rx="30" fill="#141219" stroke="${Y}" stroke-width="5"/>` + txt(0, -50, '成婚率 ＝ 成婚 ÷（成婚 ＋ 退会）', { size: 62, color: '#fff', serif: true }) + (t > 4 ? txt(0, 60, '入会した男性のうち、結婚までたどり着いた割合', { size: 40, color: Y }) : '') + '</g>' + srcBox(S1); }],
  [20, C2('2万人近いデータで見えてくる段差', .5)], [22, C2('国の統計で確かめる', .3, S2)], [30, C2('かかとの高い靴なら、160cmを超える', .6)],
  [33, C2('身長で絞り込める検索', .6)], [37, C2('結婚が決まった 9427組', .5, S1)], [45, C2('海外でも、同じ？', .4)], [48, C2('イギリスで子どもが生まれた夫婦', .5, S4)],
  [51, (t) => C2('学生650人に聞いた「満足する身長差」', .4, S4, 44)(t) + bubO(560, 640, '女性：相手が21cm高い', '#ffb3c9', easeOut(clamp((t - 3.4) / .5))) + bubO(1360, 640, '男性：自分が8cm高い', '#9fd0ff', easeOut(clamp((t - 7.2) / .5)))],
  [55, C2('身長 × 年収', .4, S1)], [57, (t) => C2('年収450万円以下 × 160cm以下 ＝ 10.7%', .5, S1, 42)(t)], [61, C2('身長と年収の「交換レート」', .4, S6)],
  [66, C2('身長の線は、絶対ではない', 1.0)], [73, C2('線が強く効くのは、検索画面と最初の数秒', .6, '', 42)], [74, C2('時間をかけるほど、数字の線は薄くなる', .6, '', 44)]];
for (const [i, ov] of GV) { const old = SC[i];
  SC[i] = { kind: 'kami', build() { const b = old.build(); return { render() {}, update(t, dur) { return b.update(t, dur) + `<div style="position:absolute;left:0;top:0;width:1920px;height:944px;background:#00ff00"></div>` + ovSvg(ov(t)); } }; } }; }
export const SCENES = SC;
