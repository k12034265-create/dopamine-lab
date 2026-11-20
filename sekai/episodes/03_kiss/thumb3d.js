// 03 キス — サムネ専用シーン（A:命令 / B:風俗 / C:口吸い）
import { THREE, makeScene, mat, glow, box, cyl, plane, dust, beam, lamp, canvasTex, rng, SERIF } from '/pipeline3d/lib3d.js';

// ---- 横顔のシルエット（右向き。woman=true で長い髪） ----
function profile(g, x, y, s, dir, woman, color) {
  g.save(); g.translate(x, y); g.scale(dir * s, s); g.fillStyle = color; g.beginPath();
  g.moveTo(-170, 300); g.quadraticCurveTo(-120, 220, -66, 190); g.lineTo(-58, 120);                                   // うなじ
  g.bezierCurveTo(-106, 50, -104, -104, -20, -140);                         // 後頭部
  g.bezierCurveTo(40, -158, 80, -122, 80, -86);                             // 頭頂→額
  g.quadraticCurveTo(86, -62, 82, -50);                                     // 眉
  g.quadraticCurveTo(92, -34, 112, -8); g.lineTo(132, 12);                   // 鼻すじ→鼻先
  g.quadraticCurveTo(116, 24, 92, 20);                                      // 鼻の下
  g.quadraticCurveTo(98, 28, 110, 36);                                       // 上唇
  g.quadraticCurveTo(98, 40, 98, 43);                                       // 口
  g.quadraticCurveTo(112, 50, 100, 60);                                       // 下唇
  g.quadraticCurveTo(84, 60, 88, 72); g.quadraticCurveTo(92, 92, 72, 102);  // あご
  g.quadraticCurveTo(46, 108, 44, 130); g.lineTo(50, 200); g.quadraticCurveTo(110, 230, 160, 300); g.closePath(); g.fill();
  if (woman) { g.beginPath(); g.moveTo(-20, -146); g.bezierCurveTo(70, -168, 96, -110, 60, -96);
    g.bezierCurveTo(-30, -80, -60, 40, -40, 140); g.bezierCurveTo(-30, 220, -60, 290, -110, 300); g.bezierCurveTo(-170, 180, -150, -125, -20, -146); g.fill(); }
  g.restore();
}
// 2人のキス直前（中心 cx, 唇の高さ cy, gap=唇の間のすき間 px）
function couple(g, cx, cy, s, gap, color) {
  profile(g, cx - gap / 2 - 110 * s, cy - 34 * s, s, 1, false, color);
  profile(g, cx + gap / 2 + 110 * s * 0.92, cy - 34 * s * 0.92 + 6 * s, s * 0.92, -1, true, color);
}

const T = [];

// ================= A：命令されたキス（スクリーン越しの2人＋軍帽の影＋上からの光）
T.push({ build() {
  const S = makeScene({ bg: '#07070a', hemi: 0.15, exposure: 1.3, bloom: 0.35, bloomTh: 0.9, fov: 30 });
  const s = S.s;
  box(s, 30, 0.1, 30, mat('#0d0c0c', { r: .35 }), 0, -0.05, 0);
  const tex = canvasTex(2048, 1152, (g, w, h) => {
    const gr = g.createRadialGradient(w * .5, h * .42, 40, w * .5, h * .5, w * .62); gr.addColorStop(0, '#fff4dc'); gr.addColorStop(.55, '#e9c79a'); gr.addColorStop(1, '#5a3a22');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    couple(g, w * .5, h * .6, 2.1, 4, '#0b0807');
    // 唇の間の赤い光
    const rg = g.createRadialGradient(w * .5, h * .6, 0, w * .5, h * .6, 70); rg.addColorStop(0, 'rgba(255,50,30,.9)'); rg.addColorStop(1, 'rgba(255,50,30,0)'); g.fillStyle = rg; g.fillRect(w * .5 - 80, h * .6 - 80, 160, 160);
  });
  const scr = plane(s, 6.4, 3.6, new THREE.MeshBasicMaterial({ map: tex, color: '#9a8a78' }), 0, 2.0, -3);
  // 光の筋（上から）
  beam(s, new THREE.Vector3(0, 7, -1.5), new THREE.Vector3(0, 0, -2.4), 0.2, 2.2, '#ffe6c0', 0.035);
  dust(s, 500, [-2.5, 2.5, 0.2, 5, -2.8, 0], '#fff0d0', 0.025, 0.5, 4);
  // 手前に客席の頭（シルエット）
  const r = rng(3); for (let i = 0; i < 14; i++) { const x = -4 + i * 0.62 + r() * .2, z = 1.4 + (i % 2) * 0.5; const hd = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), mat('#050505')); hd.position.set(x, 0.55 + r() * .08, z); s.add(hd); box(s, 0.5, 0.5, 0.3, mat('#050505'), x, 0.25, z); }
  return { ...S, update() { S.cam.position.set(-1.6, 1.6, 5.4); S.cam.lookAt(-1.3, 2.0, -3); S.cam.fov = 34; S.cam.updateProjectionMatrix(); return ''; } };
} });

// ================= B：風俗（ライトテーブルのフィルムに、赤い判が押される瞬間）
T.push({ build() {
  const S = makeScene({ bg: '#0a0806', hemi: 0.25, exposure: 1.35, bloom: 0.6, bloomTh: 0.7, fov: 28, dof: { focus: 1.25, aperture: 0.012, maxblur: 0.008 } });
  const s = S.s;
  box(s, 6, 0.06, 3, glow('#fff1d6', 0.18), 0, 0, 0);                         // 光る台
  const ft = canvasTex(3200, 520, (g, w, h) => {
    g.fillStyle = '#16120e'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++) { g.fillStyle = '#efe6d2'; g.fillRect(i * 40 + 10, 18, 22, 28); g.fillRect(i * 40 + 10, h - 46, 22, 28); }
    for (let f = 0; f < 6; f++) { const x = 60 + f * 520; g.fillStyle = '#d9cdb4'; g.fillRect(x, 70, 470, 380); g.save(); g.beginPath(); g.rect(x, 70, 470, 380); g.clip(); couple(g, x + 235, 290, 0.8, f === 3 ? 6 : 60 - f * 8, '#231c16'); g.restore(); }
    // 押された判
    g.save(); g.translate(60 + 3 * 520 + 235, 260); g.rotate(-0.16); g.strokeStyle = 'rgba(200,24,18,.92)'; g.lineWidth = 20; g.strokeRect(-200, -110, 400, 220); g.fillStyle = 'rgba(200,24,18,.92)'; g.font = `900 170px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('風俗', 0, 8); g.restore();
  });
  const strip = plane(s, 4.0, 0.65, new THREE.MeshStandardMaterial({ map: ft, transparent: true, roughness: .5, emissive: '#fff', emissiveMap: ft, emissiveIntensity: .3 }), 0.2, 0.04, 0); strip.rotation.x = -Math.PI / 2; strip.rotation.z = 0.08;
  // ハンコ（持ち上がった直後）
  const st = new THREE.Group(); st.position.set(1.05, 0.32, 0.02); st.rotation.set(0.2, 0.5, -0.3); st.scale.setScalar(1.3); s.add(st);
  cyl(st, 0.07, 0.09, 0.32, mat('#5a2c14', { r: .5 }), 0, 0.22, 0, 16); ball(st, 0.09, mat('#5a2c14'), 0, 0.4, 0);
  box(st, 0.36, 0.06, 0.22, mat('#2a1a10'), 0, 0.04, 0); box(st, 0.34, 0.012, 0.2, glow('#c8180e', 0.5), 0, 0.006, 0);
  // ハサミ
  const sc = new THREE.Group(); sc.position.set(-1.25, 0.06, 0.55); sc.rotation.y = 0.5; s.add(sc);
  box(sc, 0.55, 0.012, 0.05, mat('#cfd3d8', { m: .85, r: .2 }), 0.2, 0, 0).rotation.y = 0.12; box(sc, 0.55, 0.012, 0.05, mat('#cfd3d8', { m: .85, r: .2 }), 0.2, 0.015, 0).rotation.y = -0.12;
  for (const z of [-0.06, 0.06]) { const r0 = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 8, 18), mat('#1a1a1a')); r0.rotation.x = Math.PI / 2; r0.position.set(-0.15, 0.01, z); sc.add(r0); }
  lamp(s, '#ffd9a8', 6, 6, -1.2, 1.4, 0.6, true);
  return { ...S, update() { S.cam.position.set(-0.3, 1.1, 1.35); S.cam.lookAt(0.6, 0.1, -0.15); return ''; } };
} });
function ball(p, r, m, x, y, z) { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), m); o.position.set(x, y, z); o.castShadow = true; p.add(o); return o; }

// ================= C：口吸い（障子に重なる2人の影＋手前の巻物）
T.push({ build() {
  const S = makeScene({ bg: '#0b0806', hemi: 0.2, exposure: 1.35, bloom: 0.7, bloomTh: 0.6, fov: 32, dof: { focus: 1.8, aperture: 0.004, maxblur: 0.006 } });
  const s = S.s;
  box(s, 20, 0.1, 20, mat('#6e6a46', { r: .9 }), 0, -0.05, 0);                 // 畳
  for (let i = -4; i <= 4; i++) box(s, 0.03, 0.012, 20, mat('#3a3420'), i * 0.9, 0.006, 0);
  const sj = canvasTex(2400, 1350, (g, w, h) => {
    const gr = g.createRadialGradient(w * .5, h * .5, 60, w * .5, h * .5, w * .6); gr.addColorStop(0, '#ffe2b0'); gr.addColorStop(1, '#a8643a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // 2人の影（少しぼかす）
    g.filter = 'blur(6px)'; couple(g, w * .5, h * .58, 1.6, 0, 'rgba(40,18,8,.92)'); g.filter = 'none';
    g.fillStyle = '#2a1a10'; for (let i = 1; i < 6; i++) g.fillRect(i * w / 6 - 7, 0, 14, h); for (let j = 1; j < 4; j++) g.fillRect(0, j * h / 4 - 7, w, 14);
    g.lineWidth = 40; g.strokeStyle = '#2a1a10'; g.strokeRect(0, 0, w, h);
  });
  plane(s, 5.6, 3.15, new THREE.MeshBasicMaterial({ map: sj }), 0, 1.6, -3.2);
  // 文机と巻物
  box(s, 1.6, 0.06, 0.7, mat('#4a2a18', { r: .4 }), -0.1, 0.36, 0.2); for (const x of [-0.8, 0.6]) box(s, 0.08, 0.33, 0.6, mat('#3a2010'), x, 0.165, 0.2);
  const sc = canvasTex(1600, 560, (g, w, h) => { g.fillStyle = '#efe6cc'; g.fillRect(0, 0, w, h); const r = rng(5); g.fillStyle = '#2a2420';
    for (let c = 0; c < 22; c++) { if (c === 11) continue; const x = w - 60 - c * 68; for (let k = 0; k < 9; k++) if (r() > .12) g.fillRect(x, 40 + k * 55, 26, 34 + r() * 10); }
    const x = w - 60 - 11 * 68 - 20; g.font = `700 92px ${SERIF}`; g.fillStyle = '#1a1410'; g.textAlign = 'center'; ['口', '吸', 'ふ'].forEach((ch, i) => g.fillText(ch, x + 34, 140 + i * 120));
    g.strokeStyle = '#c81e14'; g.lineWidth = 10; g.strokeRect(x - 40, 50, 150, 400); });
  const pp = plane(s, 1.35, 0.47, new THREE.MeshStandardMaterial({ map: sc, roughness: .95, emissive: '#fff', emissiveMap: sc, emissiveIntensity: .15 }), -0.1, 0.395, 0.2); pp.rotation.x = -Math.PI / 2;
  for (const x of [-0.79, 0.59]) { const rod = cyl(s, 0.035, 0.035, 0.52, mat('#8a2a1a'), x, 0.42, 0.2, 12); rod.rotation.x = Math.PI / 2; }
  lamp(s, '#ffc890', 4, 5, -1.6, 1.2, 1.2, true);
  dust(s, 260, [-2, 2, 0.3, 3, -3, 1], '#ffe0b0', 0.02, 0.45, 8);
  return { ...S, update() { S.cam.position.set(0.85, 1.25, 2.3); S.cam.lookAt(-0.4, 0.8, -1.2); S.cam.fov = 40; S.cam.updateProjectionMatrix(); return ''; } };
} });

export const SCENES = T;
