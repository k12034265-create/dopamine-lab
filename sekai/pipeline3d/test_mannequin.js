// テスト：11の第41シーン（夕方の路面電車の停留場）の人をマネキン（Xbot）に置き換える。10秒。
import { THREE, makeScene, mat, glow, box, cyl, lamp, sun, camMove, clamp, ease, lerp } from '/pipeline3d/lib3d.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const XBOT = await new GLTFLoader().loadAsync('/pipeline3d/models/Xbot.glb');
const clipOf = (n) => XBOT.animations.find(a => a.name === n);

// マネキン1体：steps = [[動き, 開始秒], ...]。切り替えは fade 秒でなめらかに
function mannequin(p, color) {
  const g = SkeletonUtils.clone(XBOT.scene);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
    if (color && o.material.name.includes('HighLimbs')) { o.material = o.material.clone(); o.material.color.set(color); } } });
  p.add(g); const mixer = new THREE.AnimationMixer(g);
  g.userData.pose = (t, steps, fade = .35) => {
    mixer.stopAllAction(); const cur = steps.filter(s => s[1] <= t).length - 1;
    steps.forEach(([n, t0], i) => { let w = 0;
      if (i === cur) w = i === 0 ? 1 : clamp((t - t0) / fade);
      if (i === cur - 1) w = 1 - clamp((t - steps[cur][1]) / fade);
      if (w <= 0) return; const c = clipOf(n); const a = mixer.clipAction(c); a.play(); a.setEffectiveWeight(w); a.time = (t - t0) % c.duration; });
    mixer.update(0); };
  return g;
}

const build = () => { const S = makeScene({ bg: '#c8907a', hemi: .8, exposure: 1.15, sky: '#f0b898', ground: '#4a4a48', bloom: .35, bloomTh: .75, fov: 36, fog: ['#d0a088', 20, 70] }); const s = S.s; sun(s, '#ffb888', 1.6, -16, 7, 14, 30);
  box(s, 120, .02, 40, mat('#5a5a58', { r: .9 }), 0, -.02, 0); box(s, 120, .03, 3.2, mat('#7a8a6a', { r: .95 }), 0, 0, 0);
  for (const z of [-.72, .72]) box(s, 120, .08, .1, mat('#8a8a90', { m: .6 }), 0, .05, z);
  box(s, 14, .25, 1.2, mat('#b8b4ac'), 2, .12, 2.2); box(s, 14, .02, .15, mat('#e8d060'), 2, .26, 1.68);
  box(s, 6, .08, 1.4, mat('#4a4a52'), 2, 2.6, 2.4); for (const x of [-.6, 4.6]) cyl(s, .05, .05, 2.4, mat('#4a4a52'), x, 1.45, 2.8, 6);
  const sl = box(s, 4.5, .06, .3, glow('#fff0c8', .1), 2, 2.52, 2.4); const stopLamp = lamp(s, '#ffe8b8', 0, 7, 2, 2.3, 2.4, false);
  for (let i = 0; i < 7; i++) { const x = -30 + i * 10, h = 5 + (i % 3) * 2.5; box(s, 7, h, 5, mat(['#c8bca8', '#b8b0a0', '#d0c4b0'][i % 3], { r: .9 }), x, h / 2, -14); for (let r = 0; r < Math.floor(h / 2); r++) for (const dx of [-2, 0, 2]) box(s, .9, .8, .05, glow('#ffd8a0', ((i + r + dx) % 3) ? .9 : .05), x + dx, 1.4 + r * 2, -11.47); }
  const tram = new THREE.Group(); for (let k = 0; k < 3; k++) { const x = k * 6.2; box(tram, 6, 2.2, 2.5, mat(k % 2 ? '#222' : '#f0c020', { r: .5 }), x, 1.4, 0); box(tram, 5.4, .8, 2.52, glow('#fff0c8', .6), x, 1.7, 0); } box(tram, 18.6, .18, 2.3, mat('#333'), 6.2, .3, 0); s.add(tram);
  // ホームの上面 y=0.245。A：左から歩いてきて止まる → 電車が止まらず通過 → 落ち込む。B：待っている → 首を振る
  const A = mannequin(s), B = mannequin(s, '#9fb4c8');
  const PY = .245;
  return { render() { S.render(); }, update(t, dur) {
    const k = clamp(t / 3.4); A.position.set(lerp(-4.6, .9, k), PY, 2.1);   // 柱は z=2.8。体の幅を考えて 0.7 離す
    A.rotation.y = t < 3.2 ? Math.PI / 2 : lerp(Math.PI / 2, -.35, ease((t - 3.2) / .6));
    if (t > 5.6) A.rotation.y = lerp(-.35, -1.25, ease((t - 5.6) / .8));      // 走り去る電車を目で追う
    A.userData.pose(t, [['walk', 0], ['idle', 3.3], ['sad_pose', 7.0]]);
    B.position.set(2.5, PY, 2.45); B.rotation.y = t < 4.2 ? -.25 : lerp(-.25, -1.1, ease((t - 4.2) / .8));
    B.userData.pose(t, [['idle', 0], ['headShake', 6.4], ['idle', 8.6]]);
    tram.position.x = -34 + (t - 1.5) * 8.5; tram.visible = t > 1.5;
    const on = clamp((t - .5) / 1.2); sl.material.emissiveIntensity = .1 + 2.2 * on; stopLamp.intensity = 4 * on;
    camMove(S.cam, [5.2, 1.9, 8.4], [4.4, 1.8, 7.4], [1.2, 1.15, 1.6], [1.6, 1.1, 1.8], ease(t / dur)); return ''; } }; };

export const SCENES = { 0: { build } };
