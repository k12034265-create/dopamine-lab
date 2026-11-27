// 16 なぜ婚活の身長は「172cm」で線が引かれるのか？ — 名前を付けた言葉：「見えない線」
import { THREE, makeScene, mat, glow, box, cyl, ball, plane, canvasTex, sun, lamp, lerp, camMove } from '/pipeline3d/lib3d.js';
import { human } from '/pipeline3d/sets3d.js';
import { C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, loadMaps, run, kami } from '/pipeline3d/kami.js';
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
const GV = [[1, (t) => (t > .4 ? capO(170, 'プロフィールには、ほぼ必ず「身長」', Y, 46) : '') + profCard(t)],
  [3, (t) => (t > .6 ? capO(170, '172cmを超えると、もう変わらない', Y, 46) : '') + miniStep(t) + srcBox(S1)]];
for (const [i, ov] of GV) { const old = SC[i];
  SC[i] = { kind: 'kami', build() { const b = old.build(); return { render() {}, update(t, dur) { return b.update(t, dur) + `<div style="position:absolute;left:0;top:0;width:1920px;height:944px;background:#00ff00"></div>` + ovSvg(ov(t)); } }; } }; }
export const SCENES = SC;
