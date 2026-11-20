// ===== 世界のネタバレ 3Dエンジン（three.js ローポリ） =====
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
export { THREE };

export const W = 1920, H = 1080;
export const R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
R.setSize(W, H); R.setPixelRatio(1);
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.0;
R.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').appendChild(R.domElement);

// ---------- easing / random ----------
export const clamp = (x, a = 0, b = 1) => Math.min(Math.max(x, a), b);
export const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeOut = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
export const lerp = (a, b, k) => a + (b - a) * k;
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------- materials ----------
const matCache = {};
export function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!matCache[key]) matCache[key] = new THREE.MeshStandardMaterial({
    color, roughness: o.r ?? 0.85, metalness: o.m ?? 0, flatShading: o.flat ?? true,
    emissive: o.e || '#000', emissiveIntensity: o.ei ?? 0, transparent: !!o.op, opacity: o.op ?? 1, side: o.side ?? THREE.FrontSide });
  return matCache[key];
}
export const glow = (color, k = 1.5) => mat(color, { e: color, ei: k });

// ---------- primitives ----------
function add(parent, m, x, y, z, shadow = true) { m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; }
export function box(p, w, h, d, m, x = 0, y = 0, z = 0, ry = 0) { const o = add(p, new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), x, y, z); o.rotation.y = ry; return o; }
export function cyl(p, rt, rb, h, m, x = 0, y = 0, z = 0, seg = 10) { return add(p, new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m), x, y, z); }
export function ball(p, r, m, x = 0, y = 0, z = 0, detail = 1) { return add(p, new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail), m), x, y, z); }
export function plane(p, w, h, m, x = 0, y = 0, z = 0) { return add(p, new THREE.Mesh(new THREE.PlaneGeometry(w, h), m), x, y, z, false); }

// ---------- text / drawing textures ----------
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  tex.redraw = (...a) => { g.clearRect(0, 0, w, h); draw(g, w, h, ...a); tex.needsUpdate = true; };
  tex.redraw(); return tex;
}
export const SERIF = "'Noto Serif CJK JP','Noto Serif CJK SC',serif", SANS = "'Noto Sans CJK JP','Noto Sans CJK SC',sans-serif";

// ---------- people (low-poly) ----------
// opts: {skin, hair, top, bottom, seated, scale, hairStyle:'short'|'long'|'bun', back}
export function person(p, o = {}) {
  const g = new THREE.Group(); const s = o.scale || 1;
  const skin = mat(o.skin || '#e5bf9c'), hair = mat(o.hair || '#1c1714'), top = mat(o.top || '#2d3546'), bot = mat(o.bottom || '#23262e');
  const sit = !!o.seated;
  // legs
  if (sit) {
    box(g, 0.13, 0.12, 0.42, bot, -0.08, 0.5, 0.17); box(g, 0.13, 0.12, 0.42, bot, 0.08, 0.5, 0.17);
    box(g, 0.12, 0.46, 0.12, bot, -0.08, 0.25, 0.36); box(g, 0.12, 0.46, 0.12, bot, 0.08, 0.25, 0.36);
  } else { box(g, 0.13, 0.82, 0.14, bot, -0.08, 0.41, 0); box(g, 0.13, 0.82, 0.14, bot, 0.08, 0.41, 0); }
  const hy = sit ? 0.5 : 0.82;
  // torso (slightly tapered)
  const torso = cyl(g, 0.2, 0.17, 0.62, top, 0, hy + 0.31, 0, 7); torso.scale.z = 0.62;
  // arms
  const armY = hy + 0.33;
  for (const sx of [-1, 1]) { const a = box(g, 0.09, 0.55, 0.1, top, sx * 0.25, armY, sit ? 0.06 : 0); a.rotation.z = sx * 0.08; if (sit) a.rotation.x = -0.5; }
  // neck + head
  cyl(g, 0.05, 0.06, 0.08, skin, 0, hy + 0.66, 0, 6);
  const head = ball(g, 0.14, skin, 0, hy + 0.82, 0, 1); head.scale.set(0.95, 1.1, 1);
  const hs = o.hairStyle || 'short';
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.152, 8, 6, 0, Math.PI * 2, 0, Math.PI * (o.back ? 0.75 : 0.52)), hair);
  cap.position.set(0, hy + 0.85, -0.01); cap.castShadow = true; g.add(cap);
  if (hs === 'long') { const l = box(g, 0.3, 0.42, 0.12, hair, 0, hy + 0.66, -0.09); }
  if (hs === 'bun') ball(g, 0.07, hair, 0, hy + 0.98, -0.1, 0);
  g.scale.setScalar(s); p.add(g); g.userData.head = head; return g;
}

// ---------- particles ----------
export function dust(p, n, box3, color = '#ffd9a0', size = 0.02, op = 0.55, seed = 7) {
  const r = rng(seed), pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = lerp(box3[0], box3[1], r()); pos[i * 3 + 1] = lerp(box3[2], box3[3], r()); pos[i * 3 + 2] = lerp(box3[4], box3[5], r()); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dot = canvasTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, map: dot, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
  pts.userData.base = pos.slice(); pts.userData.drift = (t) => { const a = geo.attributes.position.array, b = pts.userData.base; for (let i = 0; i < n; i++) { a[i * 3] = b[i * 3] + Math.sin(t * 0.3 + i) * 0.08; a[i * 3 + 1] = b[i * 3 + 1] + Math.sin(t * 0.2 + i * 1.7) * 0.06 + t * 0.01; } geo.attributes.position.needsUpdate = true; };
  p.add(pts); return pts;
}

// ---------- light cone (projector / lamp beam) ----------
export function beam(p, from, to, r0, r1, color = '#fff4d6', op = 0.08) {
  const len = from.distanceTo(to);
  const geo = new THREE.CylinderGeometry(r1, r0, len, 24, 1, true); geo.translate(0, len / 2, 0); geo.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  m.position.copy(from); m.lookAt(to); p.add(m); return m;
}

// ---------- scene shell ----------
export function makeScene(o = {}) {
  R.toneMappingExposure = o.exposure ?? 1.35;
  const s = new THREE.Scene(); s.background = new THREE.Color(o.bg || '#151821');
  if (o.fog) s.fog = new THREE.Fog(o.fog[0], o.fog[1], o.fog[2]);
  s.add(new THREE.HemisphereLight(o.sky || '#9aaad0', o.ground || '#2a201a', o.hemi ?? 0.35));
  const cam = new THREE.PerspectiveCamera(o.fov || 35, W / H, 0.05, 200);
  const comp = new EffectComposer(R); comp.setPixelRatio(1); comp.setSize(W, H);
  comp.addPass(new RenderPass(s, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), o.bloom ?? 0.55, 0.6, o.bloomTh ?? 0.82); comp.addPass(bloom);
  let bokeh = null;
  if (o.dof) { bokeh = new BokehPass(s, cam, { focus: o.dof.focus, aperture: o.dof.aperture, maxblur: o.dof.maxblur ?? 0.006 }); comp.addPass(bokeh); }
  comp.addPass(new OutputPass());
  const ex = o.exposure ?? 1.35; return { s, cam, comp, bloom, bokeh, render() { R.toneMappingExposure = ex; comp.render(); } };
}
export function lamp(p, color, intensity, dist, x, y, z, shadow = true) {
  const l = new THREE.PointLight(color, intensity, dist, 1.6); l.position.set(x, y, z); l.castShadow = shadow;
  if (shadow) { l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.002; } p.add(l); return l;
}
export function sun(p, color, intensity, x, y, z, size = 12) {
  const l = new THREE.DirectionalLight(color, intensity); l.position.set(x, y, z); l.castShadow = true;
  l.shadow.mapSize.set(2048, 2048); const c = l.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.far = 80; l.shadow.bias = -0.0005; p.add(l); return l;
}
// camera path helper: from/to positions and look targets, k in 0..1
export function camMove(cam, a, b, la, lb, k) {
  cam.position.set(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k));
  cam.lookAt(lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k));
}
