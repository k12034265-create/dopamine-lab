// ===== 18 個人情報の流出（冒頭3分：0〜18）=====
const BLUE = '#6ab0ff', LEAK = '#9fe0ff';
const letter = (x, y, s = 1, rot = 0, txt0 = 'お詫び') => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-90" y="-58" width="180" height="116" rx="8" fill="#f4ecd8" stroke="#8a7a58" stroke-width="4"/><path d="M-90,-58 L0,8 L90,-58" fill="none" stroke="#8a7a58" stroke-width="4"/>` + txt(0, 44, txt0, { size: 32, color: '#b02020', shadow: false, serif: true }) + '</g>';
const lockIcon = (x, y, s = 1, col = '#d8b040') => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-40,0 V-40 a40,40 0 0 1 80,0 V0" stroke="${col}" stroke-width="16" fill="none"/><rect x="-60" y="-6" width="120" height="96" rx="14" fill="${col}"/><circle cx="0" cy="34" r="12" fill="#2a2010"/><rect x="-4" y="38" width="8" height="26" fill="#2a2010"/></g>`;
const fileIcon = (x, y, s = 1, col = '#e8eef8') => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-70,-90 H40 L70,-60 V90 H-70 Z" fill="${col}" stroke="#8a94a8" stroke-width="4"/><path d="M40,-90 V-60 H70" fill="none" stroke="#8a94a8" stroke-width="4"/>${[0, 1, 2, 3].map(i => `<rect x="-48" y="${-40 + i * 30}" width="${i % 2 ? 70 : 96}" height="10" rx="5" fill="#b8c0d0"/>`).join('')}</g>`;
const house = (x, y, s, col, lockS) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-80,-60 L0,-130 L80,-60 Z" fill="${col}"/><rect x="-70" y="-60" width="140" height="120" fill="#e8dcc8"/><rect x="-22" y="0" width="44" height="60" fill="#6a4a34"/>` + (lockS ? lockIcon(30, 24, lockS, '#c0c4cc') : '') + '</g>';

// --- 0 3D：夜の街。ビルから光る紙（データ）が空へ吹き出す ---
SC[0] = { build() { const S = bright({ bg: '#0c1020', hemi: .85, exp: 1.25, sun: .9, bloom: .8, floor: '#1a1c26', fog: ['#0c1020', 14, 40] }); const s = S.s;
  for (let x = -12; x <= 12; x += 3) box(s, .5, .021, 30, mat('#3a3c48'), x - 1.5, .012, 0);
  const winM = new THREE.MeshStandardMaterial({ color: '#ffe0a0', emissive: '#ffc870', emissiveIntensity: 1.1 });
  const blds = [], rr = (i) => ((Math.sin(i * 91.7) * 43758.5) % 1 + 1) % 1; const cols = ['#5a6a8a', '#7a6a6a', '#6a7a6a', '#8a8a9a', '#5a5a72'];
  for (let i = 0; i < 40; i++) { const gx = (i % 8) - 3.5, gz = Math.floor(i / 8) - 2.5, w = .9 + rr(i) * .6, h = 1.2 + rr(i + 3) * 3.6, x = gx * 3 + (rr(i + 7) - .5) * .6, z = gz * 3 + (rr(i + 9) - .5) * .6;
    const b = box(s, w, h, w, mat(cols[i % 5], { r: .7 }), x, h / 2, z); for (let r = 0; r < Math.floor(h / .45); r++) for (const sx of [-1, 1]) { if (rr(i * 13 + r) < .3) continue; const wd = box(s, .16, .14, .01, winM, x + sx * w * .22, .35 + r * .45, z + w / 2 + .006); wd.castShadow = false; } blds.push({ x, z, h, w }); }
  const near = (px, pz) => blds.reduce((b, q) => Math.hypot(q.x - px, q.z - pz) < Math.hypot(b.x - px, b.z - pz) ? q : b, blds[0]);
  const hot = [[-5, 0, 'ニトリ', '最大3762万件'], [0, 2, 'ドコモ', '約30万件'], [5, -1, '無印良品', '約2726万件']].map(([px, pz, n, c]) => ({ ...near(px, pz), n, c }));
  const pm = new THREE.MeshBasicMaterial({ color: '#e8f8ff', transparent: true, opacity: .95, side: THREE.DoubleSide }); const papers = [];
  hot.forEach((h, hi) => { for (let k = 0; k < 40; k++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(.34, .44), pm); p.userData = { h, hi, ph: k / 40, sx: (rr(k + hi * 50) - .5) * 1.6, sz: (rr(k + hi * 70) - .5) * 1.6 }; s.add(p); papers.push(p); } });
  hot.forEach(h => { const L = lamp(s, '#9fd8ff', 3, 5, h.x, h.h + .6, h.z, false); });
  return { render() { S.render(); }, update(t, dur) {
    papers.forEach(p => { const u = p.userData, start = .4 + u.hi * 1.8; if (t < start) { p.visible = false; return; } p.visible = true; const q = ((t - start) * .45 + u.ph) % 1;
      p.position.set(u.h.x + u.sx * q * 2, u.h.h + .2 + q * 5, u.h.z + u.sz * q * 2); p.rotation.set(t * 2 + u.ph * 9, t * 1.3 + u.ph * 5, u.ph * 6); });
    pm.opacity = .9;
    camMove(S.cam, [-3, 10, 19], [3, 9, 18], [0, 2.5, 0], [0, 2.8, 0], ease(t / dur));
    let o = '';
    hot.forEach((h, i) => { const at = .8 + i * 1.8; if (t < at) return; let [x, y] = proj(S.cam, h.x, h.h + 1.2, h.z); y = Math.max(240, Math.min(760, y)); x = Math.max(220, Math.min(1700, x)); const k = pop(clamp((t - at) / .4));
      o += `<g transform="translate(${x},${y - 60}) scale(${k})"><rect x="-170" y="-60" width="340" height="110" rx="16" fill="rgba(14,16,28,.92)" stroke="${LEAK}" stroke-width="4"/>` + txt(0, -12, h.n, { size: 34, color: '#e8f0ff' }) + txt(0, 34, h.c, { size: 40, color: '#ff8a8a', serif: true }) + '</g>'; });
    if (t > 6.6) o += `<g opacity="${easeOut(clamp((t - 6.6) / .5))}">` + cap(900, 'この1か月、毎週のように', Y, 48) + '</g>';
    return ovSvg(o); } }; } };

// --- 1 郵便受けからお詫びの封筒があふれる ---
SC[1] = K((t, dur) => { let g = `<rect x="${CX - 220}" y="560" width="440" height="300" rx="20" fill="#3a5a8a" stroke="#1a2a4a" stroke-width="8"/><rect x="${CX - 160}" y="600" width="320" height="44" rx="8" fill="#0d1420"/><rect x="${CX - 30}" y="860" width="60" height="120" fill="#2a2a32"/>`;
  const pos = [[-250, 430, -18], [40, 380, 10], [280, 450, 24], [-60, 300, -6], [190, 280, 16], [-300, 260, -28], [330, 300, 30], [60, 200, 4], [-170, 180, -14]];
  pos.forEach(([dx, y, r], i) => { const at = .4 + i * (i < 3 ? .5 : .25), k = clamp((t - at) / .6); if (t < at) return; const e = easeOut(k); g += letter(CX + dx * e, 620 - (620 - y) * e, .9 + .2 * e, r * e); });
  if (t > 1.0) g += `<g opacity="${easeOut(clamp((t - 1.0) / .4))}">` + txt(CX, 150, 'お詫びの手紙、今月何通目？', { size: 50, serif: true }) + '</g>';
  return g; }, 0);

// --- 2 10月26日のニュース3本 ---
SC[2] = K((t, dur) => { let g = `<g opacity="${easeOut(clamp((t - .2) / .4))}"><rect x="${CX - 230}" y="170" width="460" height="90" rx="12" fill="#c02020"/>` + txt(CX, 232, '10月26日　この1日', { size: 46, color: '#fff' }) + '</g>';
  const N = [['家電量販店', '顧客情報 600万件 漏えいの可能性'], ['電子ギフト会社', '5億5000万円分を 不正に発行'], ['メール配信会社', '5162万件が 流出']];
  N.forEach(([a, b], i) => { const at = 1.2 + i * dur * .25, k = easeOut(clamp((t - at) / .5)), y = 340 + i * 190;
    g += `<g opacity="${k}" transform="translate(${(1 - k) * 600},0)"><rect x="220" y="${y}" width="1480" height="150" rx="10" fill="#f4f2ee"/><rect x="220" y="${y}" width="230" height="150" rx="10" fill="#1a2a5a"/>` + txt(335, y + 92, 'NEWS', { size: 46, color: '#fff', shadow: false }) + txt(490, y + 62, a, { size: 34, color: '#4a4450', anchor: 'start', shadow: false }) + txt(490, y + 120, b, { size: 50, color: '#1a1820', anchor: 'start', shadow: false, serif: true }) + '</g>'; });
  return R([{ at: 0, slide: 0, f: () => g }, ref('NHK（2026年10月26日）')], t); }, 0);

// --- 3 日本人1人あたり、もう2回 ---
SC[3] = K((t, dur) => { let g = '';
  const k = easeOut(clamp((t - .3) / 1.6)), n = Math.round(21313 * k);
  g += `<g transform="translate(${CX},300)">` + txt(0, -60, '2012〜2025年　上場企業の流出（延べ）', { size: 36, color: DIM }) + txt(0, 60, `${Math.floor(n / 10000) ? Math.floor(n / 10000) + '億' : ''}${String(n % 10000)}万人分`, { size: 110, color: '#ff8a8a', serif: true }) + '</g>';
  if (t > dur * .45) { const q = easeOut(clamp((t - dur * .45) / .6)); g += `<g opacity="${q}">` + person(CX - 40, 700, 70, '#c8d0e8') + `<g transform="translate(${CX + 160},560) scale(${pop(clamp((t - dur * .5) / .4))})"><rect x="-150" y="-60" width="300" height="110" rx="20" fill="#2a1014" stroke="${RED}" stroke-width="5"/>` + txt(0, 18, '漏えい ×2', { size: 58, color: RED, serif: true }) + '</g>' + txt(CX, 920, '÷ 日本の人口 ＝ 1人あたり 約2回', { size: 44, color: Y }) + '</g>'; }
  return R([{ at: 0, slide: 0, f: () => g }, ref(S1)], t); }, 0);

// --- 4 狙われるのは、使っている会社ではない？ ---
SC[4] = K((t, dur) => { let g = `<g transform="translate(700,640)"><rect x="-260" y="-260" width="520" height="300" fill="#e8dcc8"/><rect x="-280" y="-320" width="560" height="80" rx="8" fill="#c04040"/>` + txt(0, -266, 'いつもの店', { size: 46, color: '#fff', shadow: false }) + `<rect x="-60" y="-120" width="120" height="160" fill="#6a4a34"/></g>`;
  g += `<g transform="translate(1440,690)"><rect x="-130" y="-160" width="260" height="200" fill="#8a8494"/>` + txt(0, -60, '委託先', { size: 40, color: '#fff', shadow: false }) + txt(0, -10, '（名前を知らない）', { size: 24, color: '#e8e0f0', shadow: false }) + '</g>';
  const k = ease(clamp((t - 1.0) / 1.2)); g += `<path d="M700,220 Q${700 + 500 * k},${220 - 60 * k} ${700 + 740 * k},${220 + 290 * k}" stroke="${RED}" stroke-width="10" fill="none" stroke-dasharray="${900 * k} 900"/>`;
  if (k > .95) g += `<path d="M1430,505 l-20,-30 M1430,505 l30,-14" stroke="${RED}" stroke-width="10" stroke-linecap="round"/>` + txt(CX, 160, '狙われているのは…？', { size: 52, color: '#ffb0b0', serif: true });
  return g; }, 0);

// --- 5 2024年のカレンダーに「弱点の指摘」の付箋 ---
SC[5] = K((t, dur) => { let g = `<g transform="translate(${CX},540)"><rect x="-300" y="-280" width="600" height="520" rx="14" fill="#f8f6f0"/><rect x="-300" y="-280" width="600" height="110" rx="14" fill="#c02020"/>` + txt(0, -205, '2024年 4月', { size: 60, color: '#fff', shadow: false });
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) g += `<rect x="${-270 + c * 78}" y="${-150 + r * 72}" width="70" height="62" fill="#ece8e0"/>`;
  g += `<g transform="translate(120,-40) rotate(6) scale(${pop(clamp((t - .5) / .4))})"><rect x="-140" y="-60" width="280" height="120" fill="#ffe680"/>` + txt(0, 14, '弱点の指摘', { size: 46, color: '#5a3a00', shadow: false, serif: true }) + '</g>';
  const dust = clamp((t - 1.6) / 2.2); g += `<rect x="-300" y="-280" width="600" height="520" rx="14" fill="#8a8070" opacity="${.45 * dust}"/></g>`;
  if (t > 1.8) g += `<g opacity="${easeOut(clamp((t - 1.8) / .4))}">` + txt(CX, 950, '…そのまま、2年', { size: 48, color: Y, serif: true }) + '</g>';
  return g; }, 0);

// --- 6 手のひらのドミノ1枚 ---
SC[6] = K((t, dur) => { let g = '';
  for (let i = 0; i < 9; i++) { const a = Math.min(70, Math.max(0, (t * 60 - i * 12))); g += `<g transform="translate(${260 + i * 110},640) rotate(${a})"><rect x="-18" y="-150" width="36" height="150" rx="6" fill="#f0f0f0" stroke="#2a2a2a" stroke-width="3"/><circle cx="0" cy="-110" r="6" fill="#222"/><circle cx="0" cy="-40" r="6" fill="#222"/></g>`; }
  g += `<g transform="translate(1500,700)"><rect x="-95" y="120" width="190" height="200" fill="#34507a"/><rect x="-115" y="-30" width="230" height="170" rx="60" fill="#e8c0a0" stroke="#c89878" stroke-width="3"/><g transform="translate(0,-40) rotate(${Math.sin(t * 3) * 3})"><rect x="-24" y="-200" width="48" height="200" rx="8" fill="#fff8e0" stroke="#d8b040" stroke-width="5"/><circle cx="0" cy="-150" r="8" fill="#222"/><circle cx="0" cy="-60" r="8" fill="#222"/></g><rect x="-104" y="-70" width="50" height="96" rx="24" fill="#e8c0a0" stroke="#c89878" stroke-width="3"/><rect x="-52" y="-70" width="50" height="96" rx="24" fill="#e8c0a0" stroke="#c89878" stroke-width="3"/><rect x="0" y="-70" width="50" height="96" rx="24" fill="#e8c0a0" stroke="#c89878" stroke-width="3"/><rect x="52" y="-70" width="50" height="96" rx="24" fill="#e8c0a0" stroke="#c89878" stroke-width="3"/><ellipse cx="-120" cy="10" rx="32" ry="70" transform="rotate(25,-120,10)" fill="#e8c0a0" stroke="#c89878" stroke-width="3"/></g>`;
  if (t > 1.2) g += `<g opacity="${easeOut(clamp((t - 1.2) / .4))}">` + txt(1500, 300, '最後の1枚は、あなたの手に', { size: 44, color: Y, serif: true }) + '</g>';
  return g; }, 0);

// --- 7 目次 ---
const TOC = [['①', '件数は減ったのに', '人数は倍'], ['②', '泥棒は', '「合鍵屋」を狙う'], ['③', '知っていたのに', '直せない'], ['④', '漏れた情報が', '次の鍵に'], ['⑤', 'ドミノを', '止める1枚']];
SC[7] = K((t) => R([{ at: 0, f: () => head('今日のネタバレ', { y: 220, size: 58 }) }, ...TOC.map(([n, a, b], i) => ({ at: .4 + i * .5, dx: 140, slide: 0, f: () => `<g transform="translate(0,${Math.sin(t * 1.6 + i) * 6})">` + card(110 + i * 345, 360, 315, 320, { stroke: 'rgba(255,255,255,.14)' }) + txt(267 + i * 345, 470, n, { size: 66, color: Y, serif: true }) + txt(267 + i * 345, 570, a, { size: 32 }) + txt(267 + i * 345, 620, b, { size: 32 }) + '</g>' })),
  { at: 5.6, f: () => cap(860, '東京商工リサーチ × 警察庁 × 世界2万件の侵害データ', Y, 38) }], t), 0);

// --- 9 件数 189→180 ---
SC[9] = K((t, dur) => { let g = head('上場企業の流出事故（件数）', { y: 190, size: 50 });
  const H = (v) => v * 2.4; [['2024年', 189, '#8a8490'], ['2025年', 180, BLUE]].forEach(([y0, v, col], i) => { const k = easeOut(clamp((t - .4 - i * .5) / .8)), x = 760 + i * 400; g += `<rect x="${x - 110}" y="${860 - H(v) * k}" width="220" height="${H(v) * k}" rx="10" fill="${col}"/>` + (k > .1 ? txt(x, 840 - H(v) * k, Math.round(v * k) + '件', { size: 56, color: C.fg, serif: true }) : '') + txt(x, 910, y0, { size: 34, color: DIM }); });
  if (t > 2.0) g += `<g opacity="${easeOut(clamp((t - 2.0) / .4))}">` + txt(1380, 480, '-4.7%', { size: 60, color: '#9fe0a0', anchor: 'start', serif: true }) + txt(1380, 540, '7年ぶりに減少', { size: 34, color: DIM, anchor: 'start' }) + '</g>';
  return R([{ at: 0, slide: 0, f: () => g }, ref(S1)], t); }, 1);

// --- 10 人数 1587万→3063万 ---
SC[10] = K((t, dur) => { let g = head('漏れた人数', { y: 190, size: 54 });
  const H = (v) => v * .19; [['2024年', 1587, '#8a8490'], ['2025年', 3063, RED]].forEach(([y0, v, col], i) => { const k = easeOut(clamp((t - .4 - i * 1.2) / (i ? 1.8 : .8))), x = 760 + i * 400; g += `<rect x="${x - 110}" y="${860 - H(v) * k}" width="220" height="${H(v) * k}" rx="10" fill="${col}"/>` + (k > .1 ? txt(x, 840 - H(v) * k, Math.round(v * k) + '万人', { size: 54, color: i ? '#ff9a9a' : C.fg, serif: true }) : '') + txt(x, 910, y0, { size: 34, color: DIM }); });
  if (t > 3.6) g += `<g transform="translate(1440,420) scale(${pop(clamp((t - 3.6) / .4))})"><rect x="-120" y="-60" width="240" height="110" rx="20" fill="#2a1014" stroke="${RED}" stroke-width="5"/>` + txt(0, 18, '+93%', { size: 64, color: RED, serif: true }) + '</g>';
  if (t > dur * .62) g += `<g opacity="${easeOut(clamp((t - dur * .62) / .4))}">` + txt(420, 500, '1回の大きさが', { size: 40, color: Y }) + txt(420, 560, 'けた違いに', { size: 52, color: Y, serif: true }) + '</g>';
  return R([{ at: 0, slide: 0, f: () => g }, ref(S1)], t); }, 1);

// --- 11 100万人ブロックの山（大型事故） ---
SC[11] = K((t, dur) => { let g = head('100万人以上の大型事故：2025年に6件', { y: 190, size: 46 });
  const BIG = [['AOKI（快活CLUB）', 7.29], ['SOMPO', 7.27]];
  BIG.forEach(([n, v], i) => { const x = 620 + i * 680, at = 1.2 + i * dur * .3, full = Math.floor(v); for (let j = 0; j < 8; j++) { const k = easeOut(clamp((t - at - j * .15) / .3)); if (j >= Math.ceil(v)) break; const frac = j < full ? 1 : v - full; g += `<rect x="${x - 120}" y="${820 - (j + 1) * 66 + (1 - k) * -200}" width="${240 * frac}" height="58" rx="6" fill="${i ? '#e8a060' : '#6ab0ff'}" opacity="${k}" stroke="rgba(0,0,0,.4)" stroke-width="2"/>`; }
    if (t > at + 1.4) g += `<g opacity="${easeOut(clamp((t - at - 1.4) / .4))}">` + txt(x, 870, n, { size: 36 }) + txt(x, 920, `${Math.round(v * 100)}万人分`, { size: 44, color: Y, serif: true }) + '</g>'; });
  g += `<g opacity="${easeOut(clamp((t - .4) / .4))}"><rect x="830" y="296" width="260" height="58" rx="6" fill="#9a94a4"/>` + txt(960, 336, '＝100万人', { size: 30, color: '#fff', shadow: false }) + '</g>';
  return R([{ at: 0, slide: 0, f: () => g }, ref(S1)], t); }, 1);

// --- 12 3D：小さな車が減り、大型バスがやってくる ---
SC[12] = { build() { const S = bright({ bg: '#b8d0e8', hemi: 1.2, exp: 1.15, sun: 1.8, floor: '#7a9a6a' }); const s = S.s;
  box(s, 40, .03, 3.2, mat('#4a4a52'), 0, .015, 0); for (let x = -18; x < 18; x += 2) box(s, 1, .032, .08, mat('#f0f0e0'), x, .02, 0);
  for (let i = 0; i < 10; i++) { const tr = new THREE.Group(); s.add(tr); tr.position.set(-16 + i * 3.6, 0, -2.6); cyl(tr, .08, .1, .8, mat('#6a4a34'), 0, .4, 0, 8); ball(tr, .45, mat('#4a9a4a'), 0, 1.1, 0, 1); }
  const car = (col) => { const g = new THREE.Group(); s.add(g); g.scale.setScalar(1.4); box(g, 1.0, .32, .5, mat(col, { r: .4 }), 0, .3, 0); box(g, .55, .26, .46, mat('#cfe4f4', { r: .1 }), -.05, .58, 0); for (const x of [-.32, .32]) for (const z of [-.26, .26]) { const w = cyl(g, .13, .13, .08, mat('#151515'), x, .14, z, 14); w.rotation.x = Math.PI / 2; } return g; };
  const cars = [['#e04040', -1], ['#4080e0', 1], ['#f0c040', -1], ['#50b060', 1], ['#e08040', -1], ['#a060c0', 1]].map(([c, d], i) => ({ g: car(c), d, x0: -8 + i * 3 }));
  const bus = new THREE.Group(); s.add(bus); box(bus, 4.2, 1.1, .9, mat('#f0f0f0', { r: .4 }), 0, .7, 0); box(bus, 4.22, .2, .92, mat('#e04040'), 0, .5, 0); for (let i = 0; i < 7; i++) box(bus, .42, .36, .02, mat('#9ac4e8', { r: .1 }), -1.7 + i * .54, .95, .46);
  for (const x of [-1.4, 1.4]) for (const z of [-.42, .42]) { const w = cyl(bus, .22, .22, .1, mat('#151515'), x, .22, z, 16); w.rotation.x = Math.PI / 2; }
  box(bus, .02, .3, .7, label('3063万人分', '#1a2a5a', '#ffffff', 512, 128, 70), 0, 0, 0).visible = false;
  const side = new THREE.Mesh(new THREE.PlaneGeometry(2.6, .3), label('3063万人分', '#1a2a5a', '#ffffff', 512, 64, 44)); side.position.set(0, .5, .462); bus.add(side);
  return { render() { S.render(); }, update(t, dur) {
    cars.forEach((c, i) => { const fade = clamp((t - .8 - i * .25) / .6); c.g.position.set(c.x0 + c.d * t * 1.6, 0, c.d > 0 ? .7 : -.7); c.g.rotation.y = c.d > 0 ? 0 : Math.PI; c.g.visible = fade < 1 || i < 1; c.g.scale.setScalar(1.4 * Math.max(.001, 1 - fade * (i ? 1 : 0))); });
    bus.position.set(-11 + Math.max(0, t - .8) * 3.2, 0, .7);
    camMove(S.cam, [-2, 3.2, 7], [-1, 2.8, 6], [-2, .4, 0], [-1, .5, 0], ease(t / dur));
    let o = `<g opacity="${easeOut(clamp((t - .3) / .4))}">` + cap(170, '事故の件数は減ったのに…', Y, 46) + '</g>';
    if (t > 2.6) o += `<g opacity="${easeOut(clamp((t - 2.6) / .4))}">` + cap(900, '1台ずつが、大型バスに', Y, 50) + '</g>';
    return ovSvg(o); } }; } };

// --- 13 円グラフ：原因 ---
SC[13] = K((t, dur) => { let g = head('流出の原因（2025年 180件）', { y: 190, size: 50 });
  const parts = [['ウイルス感染・不正アクセス', 64.4, RED], ['誤表示・誤送信', 20.5, '#e8a060'], ['紛失・誤廃棄', 10.0, '#9fb4d8'], ['不正持ち出し', 3.8, '#8a8490'], ['その他', 1.3, '#5a5664']];
  const cx = 700, cy = 580, r = 280; let a0 = -Math.PI / 2; const k = ease(clamp((t - .4) / 1.6));
  parts.forEach(([n, v, col], i) => { const a1 = a0 + Math.PI * 2 * v / 100 * k; const big = (a1 - a0) > Math.PI ? 1 : 0; if (a1 - a0 > .001) g += `<path d="M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${big} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z" fill="${col}" stroke="#141219" stroke-width="4"/>`; a0 = a1;
    if (i < 4 && t > 1.6 + i * .3) g += `<g opacity="${easeOut(clamp((t - 1.6 - i * .3) / .4))}"><rect x="1080" y="${360 + i * 110}" width="40" height="40" fill="${col}"/>` + txt(1140, 392 + i * 110, `${n}　${v}%`, { size: i ? 36 : 42, color: i ? C.fg : '#ffb0b0', anchor: 'start' }) + '</g>'; });
  if (t > dur * .6) g += `<g opacity="${easeOut(clamp((t - dur * .6) / .4))}">` + cap(870, 'うっかりより、外から破られた', Y, 44) + '</g>';
  return R([{ at: 0, slide: 0, f: () => g }, ref(S1)], t); }, 1);

// --- 14 ランサムウェア：ファイルに鍵、身代金の札 ---
SC[14] = K((t, dur) => { let g = '';
  [-420, 0, 420].forEach((dx, i) => { g += fileIcon(CX + dx, 520, 1.9); const k = clamp((t - 1.2 - i * .3) / .5); if (k > 0) g += `<g opacity="${easeOut(k)}"><path d="M${CX + dx - 140},${360} L${CX + dx + 140},${680} M${CX + dx + 140},${360} L${CX + dx - 140},${680}" stroke="#8a8a92" stroke-width="12" stroke-dasharray="20 8"/>` + lockIcon(CX + dx, 480, 1.3 * pop(k)) + '</g>'; });
  if (t > dur * .5) g += `<g transform="translate(${CX},830) rotate(${Math.sin(t * 2) * 3}) scale(${pop(clamp((t - dur * .5) / .4))})"><path d="M0,-80 V-40" stroke="#888" stroke-width="4"/><rect x="-230" y="-40" width="460" height="100" rx="10" fill="#f4e8c8" stroke="#8a6a30" stroke-width="5"/>` + txt(0, 28, '戻したければ、払え', { size: 46, color: '#8a1a1a', shadow: false, serif: true }) + '</g>';
  g += `<g opacity="${easeOut(clamp((t - .2) / .4))}">` + cap(170, 'ランサムウェア', RED, 54) + '</g>';
  return g; }, 1);

// --- 15 226件、二重恐喝88.9% ---
SC[15] = K((t, dur) => { let g = head('ランサムウェア被害（警察庁・2025年）', { y: 190, size: 48 });
  const n = Math.round(226 * easeOut(clamp((t - .3) / 1.6))); g += `<g transform="translate(620,560)">` + card(-260, -170, 520, 320, { stroke: RED }) + txt(0, -80, '被害の報告', { size: 36, color: DIM }) + txt(0, 70, n + '件', { size: 130, color: '#ff9a9a', serif: true }) + '</g>';
  if (t > dur * .45) { const k = easeOut(clamp((t - dur * .45) / 1.2)), a = Math.PI * 2 * .889 * k; g += `<g transform="translate(1320,560)"><circle r="170" fill="none" stroke="#2a2630" stroke-width="44"/><path d="M0,-170 A170,170 0 ${a > Math.PI ? 1 : 0} 1 ${170 * Math.sin(a)},${-170 * Math.cos(a)}" fill="none" stroke="${RED}" stroke-width="44"/>` + txt(0, 0, (88.9 * k).toFixed(1) + '%', { size: 70, color: '#ff9a9a', serif: true }) + txt(0, 60, '二重恐喝', { size: 36, color: C.fg }) + '</g>'; }
  return R([{ at: 0, slide: 0, f: () => g }, ref(S2)], t); }, 1);

// --- 16 二重恐喝：鍵＋公開するぞ ---
SC[16] = K((t, dur) => { let g = '';
  g += `<g opacity="${easeOut(clamp((t - .3) / .4))}">` + fileIcon(560, 540, 1.5) + lockIcon(560, 500, 1.1) + txt(560, 800, '①データを人質に', { size: 42, color: '#ffd080' }) + '</g>';
  if (t > dur * .35) { const k = easeOut(clamp((t - dur * .35) / .5)); g += `<g opacity="${k}" transform="translate(1340,520)"><path d="M-120,-60 L60,-140 L60,140 L-120,60 Z" fill="#d84040"/><rect x="-170" y="-60" width="60" height="120" rx="10" fill="#a83030"/><path d="M90,-60 q40,60 0,120 M120,-100 q70,100 0,200" stroke="#ffb0b0" stroke-width="10" fill="none"/>` + txt(0, 280, '②払わないと、ばらまく', { size: 42, color: '#ffb0b0' }) + '</g>';
    for (let i = 0; i < 8; i++) { const q = ((t - dur * .35) * .6 + i / 8) % 1; g += `<rect x="${1480 + q * 380}" y="${380 + (i % 4) * 70 - q * 120}" width="54" height="68" rx="4" fill="#e8eef8" opacity="${(1 - q) * k}" transform="rotate(${q * 120 + i * 30} ${1500 + q * 380} ${410 + (i % 4) * 70})"/>`; } }
  if (t > dur * .62) g += `<g opacity="${easeOut(clamp((t - dur * .62) / .4))}">` + cap(870, '身代金 ＋ 家族写真の公開まで、ちらつかせる', Y, 40) + '</g>';
  g += `<g opacity="${easeOut(clamp((t - .2) / .4))}">` + cap(170, '二重恐喝', RED, 54) + '</g>';
  return g; }, 1);

// --- 17 家が並ぶ。鍵の小さい家にだけ足あと ---
SC[17] = K((t, dur) => { let g = `<rect x="0" y="760" width="1920" height="40" fill="#3a3640"/>`;
  const H = [[300, 1.25, '#5a6a8a', 1.0, '大企業'], [700, .9, '#8a6a5a', .45, '中小企業'], [1050, .95, '#6a8a6a', .45, '中小企業'], [1420, 1.2, '#6a6a8a', 1.0, '大企業'], [1720, .85, '#8a7a5a', .4, '中小企業']];
  H.forEach(([x, s0, col, ls, lab], i) => { g += house(x, 700, s0, col, ls) + txt(x, 880, lab, { size: 30, color: DIM }); });
  if (t > 1.6) { [700, 1050, 1720].forEach((x, j) => { for (let s = 0; s < 5; s++) { const at = 1.6 + j * .6 + s * .15; if (t < at) continue; g += `<ellipse cx="${x - 200 + s * 40}" cy="${770 + (s % 2) * 14}" rx="10" ry="16" fill="#c8b8a8" opacity="${easeOut(clamp((t - at) / .3))}"/>`; } }); }
  if (t > dur * .45) g += `<g transform="translate(${CX},300) scale(${pop(clamp((t - dur * .45) / .4))})"><rect x="-300" y="-70" width="600" height="120" rx="20" fill="rgba(18,16,24,.94)" stroke="${Y}" stroke-width="4"/>` + txt(0, 16, '被害の 約6割が 中小企業', { size: 48, color: Y, serif: true }) + '</g>';
  return R([{ at: 0, slide: 0, f: () => g }, ref(S2)], t); }, 1);

// --- 18 小さな家と巨大な数字 ---
SC[18] = K((t, dur) => { let g = house(560, 700, 1.4, '#8a6a5a', .5);
  const k = easeOut(clamp((t - .6) / 1.0)); g += `<g opacity="${k}" transform="translate(1380,560) scale(${.6 + .4 * k})">` + txt(0, 0, '4786万', { size: 180, color: '#ff8a8a', serif: true }) + txt(0, 90, '件', { size: 60, color: '#ff8a8a' }) + '</g>';
  if (t > 2.2) g += `<g transform="translate(${CX - 120},560) scale(${pop(clamp((t - 2.2) / .4))})">` + txt(0, 30, '？', { size: 200, color: Y, serif: true }) + '</g>';
  if (t > dur * .6) g += `<g opacity="${easeOut(clamp((t - dur * .6) / .4))}">` + cap(920, '答えは、泥棒の「狙う場所」', Y, 46) + '</g>';
  return g; }, 1);
