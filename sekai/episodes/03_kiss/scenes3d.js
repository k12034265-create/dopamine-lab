// 03 キス — 3D版（試作：プロローグ4シーン）
import { THREE, makeScene, mat, glow, box, cyl, ball, plane, person, dust, beam, lamp, sun, camMove, canvasTex,
         ease, easeOut, clamp, lerp, rng, SERIF, SANS } from '/pipeline3d/lib3d.js';

const label = (x, y, s, o = {}) => `<div class="${o.serif ? 'serif' : ''}" style="position:absolute;left:${x}px;top:${y}px;font-size:${o.size || 34}px;font-weight:${o.w || 700};color:${o.color || '#fff'};opacity:${o.op ?? 1};letter-spacing:${o.ls || 2}px;text-shadow:0 2px 10px rgba(0,0,0,.8)">${s}</div>`;

// ---------------------------------------------------------------- 1. 1946年の映画館
function theater() {
  const S = makeScene({ bg: '#07080b', fog: ['#07080b', 22, 44], hemi: 0.45, exposure: 1.6, sky: '#6a7390', ground: '#1a1210', bloom: 0.8, bloomTh: 0.7 });
  const s = S.s, r = rng(3);
  box(s, 16, 0.2, 30, mat('#2a1b14'), 0, -0.1, -2);                      // floor
  box(s, 0.3, 9, 30, mat('#3a1f1c'), -8, 4.5, -2); box(s, 0.3, 9, 30, mat('#3a1f1c'), 8, 4.5, -2); // side walls
  box(s, 16, 0.3, 30, mat('#1c1312'), 0, 9, -2);                         // ceiling
  box(s, 16, 9, 0.3, mat('#241614'), 0, 4.5, -14.2);                     // front wall
  // proscenium + curtains
  box(s, 11, 0.8, 0.5, mat('#6b4a2a', { m: .4, r: .5 }), 0, 7.2, -13.6);
  for (const side of [-1, 1]) for (let k = 0; k < 7; k++) box(s, 0.32, 6.4, 0.3, mat(k % 2 ? '#6e1414' : '#7f1a18'), side * (4.7 + k * 0.28), 3.6, -13.5 + (k % 2) * 0.12);
  box(s, 10.5, 1.0, 0.3, mat('#7a1816'), 0, 6.5, -13.4);
  box(s, 10, 1.1, 1.2, mat('#3b2418'), 0, 0.55, -13.2);                 // stage
  // screen with animated old film
  const scr = canvasTex(1024, 576, (g, w, h, t = 0) => {
    const k = clamp(t / 9);
    const grd = g.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.7); grd.addColorStop(0, '#d9d2c2'); grd.addColorStop(1, '#6f685c');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    // window light + two profiles approaching
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(w * 0.62, h * 0.12, w * 0.2, h * 0.5);
    const gap = lerp(260, 34, easeOut(k));
    const prof = (cx, dir) => { g.save(); g.translate(cx, h * 0.62); g.scale(dir, 1); g.fillStyle = '#1b1915';
      g.beginPath(); g.moveTo(-90, 260); g.lineTo(-80, 40); g.quadraticCurveTo(-95, -150, 10, -170); g.quadraticCurveTo(80, -165, 88, -90);
      g.lineTo(104, -40); g.lineTo(86, -30); g.lineTo(92, 0); g.lineTo(82, 12); g.quadraticCurveTo(84, 40, 50, 46); g.lineTo(40, 110); g.lineTo(170, 190); g.lineTo(190, 260); g.closePath(); g.fill(); g.restore(); };
    prof(w / 2 - gap / 2 - 90, 1); prof(w / 2 + gap / 2 + 90, -1);
    // film grain / scratches / flicker
    const rr = rng(Math.floor(t * 24) + 1);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${rr() < .5 ? 0 : 255},${0},${0},0)`; }
    g.globalAlpha = 0.08; for (let i = 0; i < 1500; i++) { g.fillStyle = rr() < .5 ? '#000' : '#fff'; g.fillRect(rr() * w, rr() * h, 2, 2); }
    g.globalAlpha = 0.06; g.strokeStyle = '#fff'; g.lineWidth = 1; for (let i = 0; i < 1; i++) { const x = rr() * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + rr() * 6 - 3, h); g.stroke(); }
    g.globalAlpha = 1; g.fillStyle = `rgba(0,0,0,${0.06 + 0.06 * rr()})`; g.fillRect(0, 0, w, h);
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(9, 5.06), new THREE.MeshBasicMaterial({ map: scr, toneMapped: false }));
  screen.position.set(0, 3.8, -13.3); s.add(screen);
  const scrLight = new THREE.SpotLight('#e8e2d6', 90, 40, 0.75, 0.6, 1.2); scrLight.position.set(0, 3.8, -13); scrLight.target.position.set(0, 1, 8); s.add(scrLight, scrLight.target);
  // projector beam from booth
  const booth = new THREE.Vector3(0, 6.6, 13.5);
  const bm = beam(s, booth, new THREE.Vector3(0, 3.8, -13.2), 0.08, 2.4, '#fff3d8', 0.035);
  box(s, 2, 1.2, 0.4, mat('#120c0a'), 0, 6.6, 13.9); ball(s, 0.1, glow('#fff3d0', 6), 0, 6.6, 13.7, 0);
  dust(s, 700, [-2, 2, 3, 7, -12, 13], '#fff1cf', 0.02, 0.45, 11);
  // sconces
  for (const side of [-1, 1]) for (let z = -9; z <= 9; z += 6) { box(s, 0.3, 0.45, 0.15, glow('#ffb35a', 2.2), side * 7.8, 4.2, z); lamp(s, '#ff9f45', 2.2, 5, side * 7.4, 4.2, z, false); }
  // seats + audience (packed)
  const seat = mat('#4d1715'), seatB = mat('#3b100f');
  const crowdCols = ['#2a2f3a', '#3a2f28', '#2c3328', '#44393a', '#23262c', '#3b3a44'];
  for (let row = 0; row < 11; row++) {
    const z = -9 + row * 1.45, y = row * 0.18;
    box(s, 13, y + 0.01, 1.45, mat('#24160f'), 0, y / 2, z);
    for (let c = 0; c < 14; c++) {
      if (Math.abs(c - 6.5) < 0.6) continue;            // aisle
      const x = -6.2 + c * 0.95;
      box(s, 0.78, 0.45, 0.65, seat, x, y + 0.42, z); box(s, 0.78, 0.75, 0.12, seatB, x, y + 0.85, z + 0.33);
      if (r() < 0.93) {
        const hat = r() < 0.25;
        const h = cyl(s, 0.2, 0.24, 0.62, mat(crowdCols[(r() * 6) | 0]), x + (r() - .5) * 0.06, y + 0.95, z + 0.05, 7);
        const hd = ball(s, 0.15, mat(r() < .5 ? '#16110e' : '#20160f'), x, y + 1.43, z + 0.03, 1);
        if (hat) { cyl(s, 0.2, 0.2, 0.04, mat('#2b2620'), x, y + 1.55, z + 0.03, 10); cyl(s, 0.12, 0.13, 0.12, mat('#2b2620'), x, y + 1.62, z + 0.03, 10); }
        hd.rotation.y = (r() - .5) * 0.6;
      }
    }
  }
  return {
    ...S,
    update(t, dur) {
      scr.redraw(t); bm.visible = t < 6.3;
      if (t < 6.3) camMove(S.cam, [0.6, 4.6, 14], [0.2, 3.9, 9.5], [0, 3.6, -13], [0, 3.7, -13], ease(t / 6.3));
      else camMove(S.cam, [2.8, 3.4, 1.0], [2.2, 3.5, -1.6], [-0.4, 3.9, -13], [-0.3, 3.9, -13], ease((t - 6.3) / (dur - 6.3)));
      S.cam.fov = t < 6.3 ? 38 : 30; S.cam.updateProjectionMatrix();
      const a = clamp((t - 0.4) / 0.8) * (t < 6.3 ? 1 : 0);
      return label(110, 90, '1946.5.23', { serif: 1, size: 64, op: a, ls: 6 }) + label(114, 172, '東京・ある映画館', { size: 28, op: a * 0.8, w: 500 });
    }
  };
}

// ---------------------------------------------------------------- 2. 占領期の机と脚本
function office() {
  const S = makeScene({ bg: '#2a241c', hemi: 0.7, exposure: 1.5, sky: '#c8d2e6', ground: '#3a2a1e', bloom: 0.45, bloomTh: 0.85, fov: 32 });
  const s = S.s;
  box(s, 14, 0.2, 12, mat('#4a3426'), 0, -0.1, 0);
  box(s, 14, 6, 0.2, mat('#6b6252'), 0, 3, -3.2);
  // window with blinds → stripe shadows on desk
  box(s, 3.2, 2.4, 0.05, glow('#f3e6c8', 1.4), 1.6, 2.9, -3.08);
  for (let k = 0; k < 12; k++) box(s, 3.3, 0.08, 0.12, mat('#b8ab90'), 1.6, 1.85 + k * 0.2, -2.95);
  const sl = sun(s, '#ffe2b0', 2.6, 3.2, 3.4, -9, 6); sl.target.position.set(-0.4, 1, 0.3); s.add(sl.target);
  // desk
  const wood = mat('#5a3a26', { r: .6 });
  box(s, 3.6, 0.1, 1.8, wood, -0.4, 1.0, 0.2); box(s, 0.1, 1.0, 1.7, wood, -2.1, 0.5, 0.2); box(s, 0.1, 1.0, 1.7, wood, 1.3, 0.5, 0.2);
  box(s, 1.0, 0.6, 1.6, mat('#4c311f'), 0.75, 0.65, 0.2);
  // banker's lamp
  box(s, 0.35, 0.05, 0.22, mat('#b89a52', { m: .7, r: .3 }), -1.7, 1.08, -0.35); cyl(s, 0.02, 0.02, 0.35, mat('#b89a52', { m: .7, r: .3 }), -1.7, 1.25, -0.35, 6);
  const sh = cyl(s, 0.18, 0.18, 0.16, mat('#1f5e3a', { e: '#1f5e3a', ei: .4 }), -1.7, 1.45, -0.32, 10); sh.rotation.z = Math.PI / 2; sh.scale.set(1, 1, .55);
  lamp(s, '#ffd08a', 7, 4, -1.7, 1.35, -0.25, false); lamp(s, '#cfd8ff', 3, 8, 2.5, 3.0, 2.5, false);
  // typewriter
  box(s, 0.8, 0.22, 0.55, mat('#1d1f22', { m: .3, r: .5 }), -1.0, 1.16, -0.35); box(s, 0.75, 0.12, 0.2, mat('#121315'), -1.0, 1.3, -0.55); cyl(s, 0.05, 0.05, 0.85, mat('#0c0c0c'), -1.0, 1.36, -0.55).rotation.z = Math.PI / 2;
  // folders + stamp
  box(s, 0.7, 0.05, 0.5, mat('#c9b07a'), 0.6, 1.08, -0.3, 0.15);
  const stampTex = canvasTex(256, 128, (g, w, h) => { g.strokeStyle = '#b23a2e'; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = '#b23a2e'; g.font = `bold 52px ${SANS}`; g.textAlign = 'center'; g.fillText('C I E', w / 2, 84); });
  const st = plane(s, 0.34, 0.17, new THREE.MeshStandardMaterial({ map: stampTex, transparent: true, roughness: .9 }), 0.62, 1.111, -0.3); st.rotation.x = -Math.PI / 2; st.rotation.z = -0.15;
  // script paper (animated red pen)
  const paperTex = canvasTex(900, 1200, (g, w, h, k = 0) => {
    g.fillStyle = '#efe7d4'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2622';
    g.font = `bold 58px ${SERIF}`; g.fillText('脚本', 70, 120); g.font = `bold 72px ${SERIF}`; g.fillText('はたちの青春', 70, 220);
    g.font = `28px ${SERIF}`; g.fillStyle = '#5a534a'; g.fillText('松竹　1946年', 72, 270);
    const rr = rng(5); g.fillStyle = '#6d665c';
    for (let i = 0; i < 22; i++) { const y = 340 + i * 36; const len = 300 + rr() * 460; g.fillRect(80, y, len, 7); }
    // red pen: circle + KISS
    const p = clamp(k);
    if (p > 0) { g.strokeStyle = '#c0261e'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.ellipse(430, 680, 330, 120, -0.05, -Math.PI * 0.6, -Math.PI * 0.6 + Math.PI * 2 * clamp(p * 1.6)); g.stroke(); }
    if (p > 0.55) { g.save(); g.globalAlpha = clamp((p - 0.55) / 0.2); g.fillStyle = '#c0261e'; g.font = `italic bold 150px Georgia, ${SERIF}`; g.translate(220, 1040); g.rotate(-0.12); g.fillText('KISS!', 0, 0); g.restore(); }
  });
  const paper = plane(s, 0.62, 0.83, new THREE.MeshStandardMaterial({ map: paperTex, roughness: .95 }), -0.25, 1.06, 0.45); paper.rotation.x = -Math.PI / 2; paper.rotation.z = 0.06; paper.receiveShadow = true;
  // red pen
  const pen = cyl(s, 0.012, 0.012, 0.28, mat('#8e1a14'), 0, 1.07, 0.6, 8); pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.5;
  // coffee cup + ashtray
  cyl(s, 0.07, 0.06, 0.12, mat('#e8e2d6'), 0.45, 1.11, 0.75, 12); cyl(s, 0.09, 0.09, 0.02, mat('#e8e2d6'), 0.45, 1.06, 0.75, 12);
  dust(s, 300, [-2, 2, 1.1, 3.4, -2.8, 1.5], '#fff2d6', 0.006, 0.45, 4);
  return {
    ...S,
    update(t, dur) {
      const k = clamp((t - 3.5) / 3.2); paperTex.redraw(k);
      pen.position.set(lerp(0.1, -0.1, ease(k)), 1.07 + (k > 0 && k < 1 ? 0.01 : 0), lerp(0.62, 0.5, ease(k)));
      if (t < 3.4) camMove(S.cam, [2.8, 2.3, 3.4], [2.3, 2.1, 2.8], [-0.2, 1.4, -1.2], [-0.3, 1.2, -0.6], ease(t / 3.4));
      else camMove(S.cam, [0.25, 2.05, 1.45], [0.1, 1.85, 1.2], [-0.25, 1.06, 0.45], [-0.25, 1.06, 0.45], ease((t - 3.4) / (dur - 3.4)));
      const a = clamp((t - 3.8) / 0.6);
      return label(110, 92, 'GHQ　民間情報教育局（CIE）', { size: 34, op: a }) + label(112, 146, '「キスシーンを入れるように」', { size: 30, op: a * 0.85, w: 500, serif: 1 });
    }
  };
}

// ---------------------------------------------------------------- 3. 和室と巻物
function washitsu() {
  const S = makeScene({ bg: '#0c0f16', hemi: 0.4, exposure: 1.3, sky: '#7d8fc2', ground: '#2a2018', bloom: 0.7, bloomTh: 0.75, fov: 34 });
  const s = S.s;
  // tatami
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const rot = (i + j) % 2; box(s, rot ? 1.8 : 0.9, 0.08, rot ? 0.9 : 1.8, mat(i % 2 ? '#a99d6e' : '#b0a476'), -2.7 + i * 1.8, 0, -1.8 + j * 1.8 + (rot ? 0 : 0)); }
  for (let i = 0; i < 5; i++) box(s, 0.05, 0.085, 6, mat('#2f3a2a'), -3.6 + i * 1.8, 0.005, -0.9);
  // shoji wall with moonlight
  box(s, 8, 4, 0.08, glow('#c9d4ef', 0.55), 0, 2, -3.6);
  for (let i = 0; i <= 10; i++) box(s, 0.05, 4, 0.1, mat('#4a3a2a'), -4 + i * 0.8, 2, -3.52);
  for (let j = 0; j <= 8; j++) box(s, 8, 0.05, 0.1, mat('#4a3a2a'), 0, j * 0.5, -3.52);
  const moon = sun(s, '#9fb2ff', 0.7, -2, 5, -10, 6);
  // side wall + tokonoma post
  box(s, 0.2, 4, 8, mat('#5a4a36'), -4.1, 2, 0); box(s, 0.2, 4, 0.2, mat('#3a2a1c'), -2.2, 2, -3.4);
  // andon lantern
  box(s, 0.32, 0.6, 0.32, glow('#ffcf8a', 0.9), 1.6, 0.42, -1.6); box(s, 0.36, 0.06, 0.36, mat('#2a1c12'), 1.6, 0.1, -1.6); box(s, 0.36, 0.04, 0.36, mat('#2a1c12'), 1.6, 0.74, -1.6);
  const al = lamp(s, '#ffb35c', 6, 6, 1.6, 0.6, -1.4, true);
  // low desk (文机) + scroll
  const wood = mat('#3b2416', { r: .5 });
  box(s, 1.6, 0.06, 0.6, wood, 0, 0.36, -0.9); box(s, 0.06, 0.33, 0.55, wood, -0.74, 0.17, -0.9); box(s, 0.06, 0.33, 0.55, wood, 0.74, 0.17, -0.9);
  const scrollTex = canvasTex(1400, 480, (g, w, h, k = 0) => {
    g.fillStyle = '#e9dfc4'; g.fillRect(0, 0, w, h);
    const rr = rng(9); g.fillStyle = '#2b2520';
    // vertical faux kana columns (right to left)
    for (let c = 0; c < 26; c++) { const x = w - 60 - c * 50; let y = 40; while (y < h - 50) { const hh = 14 + rr() * 26; g.globalAlpha = 0.55 + rr() * 0.35; g.fillRect(x + rr() * 6, y, 6 + rr() * 8, hh); y += hh + 8 + rr() * 10; } }
    g.globalAlpha = 1;
    // key word 口吸ふ
    const p = clamp(k);
    g.fillStyle = '#e9dfc4'; g.fillRect(w / 2 - 50, 40, 100, h - 80);
    g.font = `bold 84px ${SERIF}`; g.textAlign = 'center';
    const chars = ['口', '吸', 'ふ'];
    chars.forEach((ch, i) => { g.globalAlpha = 0.85; g.fillStyle = '#1e1a16'; g.fillText(ch, w / 2, 140 + i * 110); });
    if (p > 0) { g.globalAlpha = p; g.strokeStyle = '#b8261d'; g.lineWidth = 5; g.strokeRect(w / 2 - 62, 60, 124, 360); }
    g.globalAlpha = 1;
  });
  const scroll = plane(s, 1.4, 0.48, new THREE.MeshStandardMaterial({ map: scrollTex, roughness: .95, emissive: '#ffffff', emissiveMap: scrollTex, emissiveIntensity: 0.0 }), 0, 0.395, -0.9);
  scroll.rotation.x = -Math.PI / 2; scroll.receiveShadow = true;
  cyl(s, 0.03, 0.03, 0.52, mat('#6b3f22'), -0.72, 0.42, -0.9, 8).rotation.x = Math.PI / 2; cyl(s, 0.045, 0.045, 0.52, mat('#6b3f22'), 0.73, 0.43, -0.9, 8).rotation.x = Math.PI / 2;
  // ink stone + brush
  box(s, 0.16, 0.03, 0.24, mat('#141414'), 0.95, 0.4, -0.75); const br = cyl(s, 0.01, 0.014, 0.3, mat('#8a6a3a'), 0.95, 0.43, -1.0, 6); br.rotation.z = Math.PI / 2; br.rotation.y = 0.3;
  dust(s, 260, [-1.5, 2.5, 0.4, 2.4, -2.6, 0.6], '#ffe2b0', 0.006, 0.45, 21);
  return {
    ...S,
    update(t, dur) {
      const k = clamp((t - 4.4) / 0.8); scrollTex.redraw(k); scroll.material.emissiveIntensity = 0.12 * k;
      al.intensity = 6 * (0.95 + 0.05 * Math.sin(t * 9) * Math.sin(t * 3.7));
      if (t < 4.3) camMove(S.cam, [2.6, 1.7, 2.6], [1.9, 1.45, 1.9], [0, 0.45, -1.0], [0, 0.42, -0.95], ease(t / 4.3));
      else camMove(S.cam, [0.35, 1.25, 0.15], [0.25, 1.1, -0.05], [0, 0.4, -0.9], [0, 0.4, -0.9], ease((t - 4.3) / (dur - 4.3)));
      const a = clamp((t - 4.9) / 0.6);
      return label(1460, 300, '口吸ふ', { serif: 1, size: 64, op: a, ls: 10 }) + label(1466, 390, '（くちすう）＝キス', { size: 30, op: a * 0.85, w: 500 });
    }
  };
}

// ---------------------------------------------------------------- 4. 夜の住宅街とタイトル
function street() {
  const S = makeScene({ bg: '#0b1020', fog: ['#0b1020', 16, 46], hemi: 0.45, exposure: 1.3, sky: '#5a6aa0', ground: '#14121a', bloom: 0.9, bloomTh: 0.7, fov: 36 });
  const s = S.s, r = rng(17);
  // sky gradient dome
  const skyTex = canvasTex(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#060a18'); gr.addColorStop(0.65, '#1a2448'); gr.addColorStop(1, '#3a3a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(90, 24, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })); s.add(dome);
  const stars = dust(s, 300, [-80, 80, 20, 60, -90, -40], '#ffffff', 0.25, 0.8, 5); stars.material.fog = false;
  box(s, 8, 0.1, 60, mat('#24262c'), 0, -0.05, -10);                    // road
  box(s, 0.12, 0.02, 60, mat('#b9b39a'), -3.6, 0.01, -10); box(s, 0.12, 0.02, 60, mat('#b9b39a'), 3.6, 0.01, -10);
  for (const side of [-1, 1]) box(s, 10, 0.12, 60, mat('#1c1d22'), side * 9, 0, -10);
  const houseCols = ['#4a4f5c', '#5a5246', '#3f4652', '#56504c', '#474b42'];
  const wins = [];
  const house = (x, z, w, d, h, side) => {
    const c = mat(houseCols[(r() * 5) | 0]);
    box(s, w, h, d, c, x, h / 2, z);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, w * 0.78, 1.2, 4), mat('#2a2c33')); roof.position.set(x, h + 0.6, z); roof.rotation.y = Math.PI / 4; roof.scale.z = d / w; roof.castShadow = true; s.add(roof);
    for (let fl = 0; fl < 2; fl++) for (let k = 0; k < 2; k++) {
      const on = r() < 0.45; const wm = on ? glow('#ffc477', 1.2 + r()) : mat('#11141c');
      const wz = z - d / 4 + k * d / 2;
      const win = box(s, 0.06, 0.8, 0.9, wm, x - side * (w / 2 + 0.03), 1.1 + fl * 1.9, wz); wins.push(win);
    }
    // fence
    box(s, 0.1, 0.9, d, mat('#3a3a3e'), x - side * (w / 2 + 1.2), 0.45, z);
  };
  for (let i = 0; i < 9; i++) { house(-7.5, -i * 6.2, 4.4, 4.6, 4.2 + r() * 1.2, -1); house(7.5, -i * 6.2 - 2.5, 4.4, 4.6, 4.2 + r() * 1.2, 1); }
  // the special window (two silhouettes behind curtain)
  const spX = -7.5 + 2.2 + 0.08, spZ = -12.4 - 1.15;
  const curtainTex = canvasTex(256, 256, (g, w, h, k = 0) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 170); gr.addColorStop(0, '#ffd59a'); gr.addColorStop(1, '#d9873e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(60,30,10,.75)'; const gap = lerp(70, 6, ease(k));
    const head = (x) => { g.beginPath(); g.arc(x, 100, 30, 0, Math.PI * 2); g.fill(); g.fillRect(x - 38, 128, 76, 140); };
    head(w / 2 - 32 - gap / 2); head(w / 2 + 32 + gap / 2);
    g.strokeStyle = 'rgba(120,60,20,.35)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(i * 30 + 8, 0); g.lineTo(i * 30 + 14, h); g.stroke(); }
  });
  const sp = plane(s, 1.1, 1.0, new THREE.MeshBasicMaterial({ map: curtainTex, toneMapped: false }), spX, 3.0, spZ); sp.rotation.y = Math.PI / 2;
  // utility poles + wires + street lamp
  for (let i = 0; i < 6; i++) { const z = -i * 9 + 2; cyl(s, 0.12, 0.14, 8, mat('#3a3a3a'), 4.6, 4, z, 6); box(s, 1.6, 0.1, 0.1, mat('#3a3a3a'), 4.6, 7.4, z); }
  for (let w = 0; w < 3; w++) { const g = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 30 }, (_, i) => new THREE.Vector3(4.0 + w * 0.6, 7.35 - Math.sin(i / 29 * Math.PI * 5) * 0.0 - 0.3 * Math.abs(Math.sin(i / 29 * Math.PI * 5)), 2 - i * 1.55))); s.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#15161a' }))); }
  cyl(s, 0.06, 0.08, 4.5, mat('#4a4a4a'), -3.9, 2.25, -6, 6); box(s, 0.6, 0.12, 0.3, glow('#fff2d4', 3), -3.6, 4.5, -6);
  const sl = new THREE.SpotLight('#ffe6b8', 40, 14, 0.8, 0.5, 1.4); sl.position.set(-3.6, 4.4, -6); sl.target.position.set(-2.8, 0, -6); sl.castShadow = true; s.add(sl, sl.target);
  beam(s, new THREE.Vector3(-3.6, 4.4, -6), new THREE.Vector3(-2.8, 0, -6), 0.15, 2.0, '#ffe6b8', 0.05);
  const moonL = sun(s, '#8ea4ff', 0.55, -10, 18, -30, 30);
  return {
    ...S,
    update(t, dur) {
      curtainTex.redraw(clamp((t - 0.5) / 4));
      camMove(S.cam, [1.2, 1.7, 8], [0.0, 2.2, 2.5], [-3.5, 2.8, -14], [-4.6, 3.0, -13], ease(t / dur));
      const a = clamp((t - 2.0) / 0.9);
      const dim = `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0) 30%,rgba(5,8,20,${0.55 * a}) 70%)"></div>`;
      return dim + label(1010, 300, '世界のネタバレ', { size: 30, op: a * 0.8, ls: 10, w: 500 })
        + label(1000, 370, 'なぜ日本人は、', { serif: 1, size: 76, op: a, ls: 4 })
        + label(1000, 470, '人前で<span style="color:#ff8a3d">キス</span>をしないのか', { serif: 1, size: 76, op: a, ls: 4 })
        + `<div style="position:absolute;left:1004px;top:600px;opacity:${clamp((t - 2.6) / 0.6)};display:flex;gap:18px">`
        + ['人類学', '日本史'].map((x, i) => `<div style="border:2px solid ${i ? '#3dc6c1' : '#ff8a3d'};color:${i ? '#3dc6c1' : '#ff8a3d'};padding:6px 22px;border-radius:30px;font-size:30px;font-weight:700">${x}</div>`).join('') + '</div>';
    }
  };
}

export const SCENES = [{ build: theater }, { build: office }, { build: washitsu }, { build: street }];
