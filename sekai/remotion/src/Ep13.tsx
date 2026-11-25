// 13 男女論争の3D場面（Remotion）。明るい場面だけ（暗い3Dは使わない）
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useMemo} from 'react';
import * as THREE from 'three';
import {Human, useModel} from './Human';
import {RetargetHuman} from './Retarget';

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ez = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x * (3 - 2 * x)});
const Cam = ({p, look, fov}: {p: number[]; look: number[]; fov: number}) => {
  const {camera, size} = useThree(); const c: any = camera; c.fov = fov; c.aspect = size.width / size.height;
  c.position.set(p[0], p[1], p[2]); c.lookAt(look[0], look[1], look[2]); c.updateProjectionMatrix(); return null;
};
const Lights = ({sky = '#ffffff', ground = '#c8c0b4', sun = 2.2}: any) => (<>
  <hemisphereLight args={[sky, ground, 1.5]} />
  <directionalLight position={[4, 8, 6]} intensity={sun} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
</>);
// 群衆：カプセルの人（体＋頭）をインスタンスで大量に置く
const Crowd = ({pts, colors}: {pts: [number, number, number, number][]; colors: string[]}) => {
  const body = useMemo(() => new THREE.CapsuleGeometry(0.2, 0.75, 4, 10), []);
  const head = useMemo(() => new THREE.SphereGeometry(0.15, 12, 10), []);
  const set = (m: THREE.InstancedMesh | null, dy: number) => { if (!m) return; const o = new THREE.Object3D();
    pts.forEach(([x, y, z, s], i) => { o.position.set(x, y + dy * s, z); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, new THREE.Color(colors[i])); });
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; };
  return (<>
    <instancedMesh ref={(m) => set(m, 0.58)} args={[body, undefined as any, pts.length]} castShadow><meshStandardMaterial roughness={0.7} /></instancedMesh>
    <instancedMesh ref={(m) => set(m, 1.17)} args={[head, undefined as any, pts.length]} castShadow><meshStandardMaterial roughness={0.6} /></instancedMesh>
  </>);
};
const rnd = (s: number) => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
const M = '#8fb8e8', F = '#f0a0bc', G = '#b8b4ae';

// ── 1：明るいオフィス。男女が普通に話している ──
export const Office = () => {
  const f = useCurrentFrame(); const {fps, width, height} = useVideoConfig();
  const xbot = useModel('Xbot.glb'); const rpm = useModel('readyplayer.me.glb');
  const k = f / 294;
  return (<AbsoluteFill style={{background: '#eef0f2'}}>{xbot && rpm && <ThreeCanvas width={width} height={height} shadows>
    <Cam p={[lerp(-1.2, 0.6, k), 1.6, lerp(5.6, 4.8, k)]} look={[0, 1.1, 0]} fov={34} />
    <color attach="background" args={['#eef0f2']} /><Lights />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#d8c8b0" /></mesh>
    <mesh position={[0, 3, -3]} receiveShadow><boxGeometry args={[30, 6, .2]} /><meshStandardMaterial color="#f6f4f0" /></mesh>
    {[-3.2, 3.2].map((x) => <mesh key={x} position={[x, 1.9, -2.88]}><boxGeometry args={[2.2, 1.4, .05]} /><meshStandardMaterial color="#cfe6f6" emissive="#cfe6f6" emissiveIntensity={0.25} /></mesh>)}
    <mesh position={[0, .74, -.2]} castShadow receiveShadow><boxGeometry args={[2.2, .06, 1]} /><meshStandardMaterial color="#e8e2d8" /></mesh>
    {[-1, 1].map((x) => <mesh key={x} position={[x, .37, -.2]}><boxGeometry args={[.06, .74, .9]} /><meshStandardMaterial color="#9a948c" /></mesh>)}
    <mesh position={[.3, .9, -.3]}><boxGeometry args={[.5, .32, .03]} /><meshStandardMaterial color="#2a2a30" /></mesh>
    <mesh position={[2.6, .45, -2.2]}><cylinderGeometry args={[.25, .2, .5, 16]} /><meshStandardMaterial color="#c8b8a0" /></mesh>
    <mesh position={[2.6, 1.0, -2.2]}><sphereGeometry args={[.45, 16, 12]} /><meshStandardMaterial color="#7aa86a" /></mesh>
    <RetargetHuman src={xbot} dst={rpm} f={f} fps={fps} steps={[{clip: 'idle', from: 0}, {clip: 'agree', from: 70}, {clip: 'idle', from: 150}, {clip: 'agree', from: 220}]} pos={() => [-0.95, 0, 0.75]} rotY={() => 1.1} armDown={ARM} />
    <Human gltf={xbot} f={f} fps={fps} steps={[{clip: 'idle', from: 0}, {clip: 'agree', from: 120}, {clip: 'idle', from: 190}]} pos={() => [0.95, 0, 0.75]} rotY={() => -1.1} />
  </ThreeCanvas>}</AbsoluteFill>);
};

// ── 47：明るいスタンドの大観衆（まっすぐ並ぶ段）。1人だけ赤く光る ──
export const Stadium = () => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig();
  const {pts, cols, red} = useMemo(() => { const r = rnd(47); const pts: [number, number, number, number][] = []; const cols: string[] = [];
    for (let row = 0; row < 18; row++) for (let i = 0; i < 60; i++) { pts.push([-21 + i * .72 + (row % 2) * .36, row * .5, -row * 1.0, .9]); cols.push([M, F, G, G][Math.floor(r() * 4)]); }
    const red = 9 * 60 + 33; cols[red] = '#e0453a'; return {pts, cols, red}; }, []);
  const [rx, ry, rz] = pts[red]; const k = ez(f, 15, 175);
  const glow = 0.6 + 0.4 * Math.sin(f / 5);
  return (<AbsoluteFill style={{background: '#cfe3f4'}}><ThreeCanvas width={width} height={height} shadows>
    <Cam p={[lerp(0, rx, k), lerp(5, ry + 1.3, k), lerp(13, rz + 4.2, k)]} look={[lerp(0, rx, k), lerp(3.5, ry + .9, k), lerp(-8, rz, k)]} fov={lerp(55, 30, k)} />
    <color attach="background" args={['#cfe3f4']} /><Lights sky="#ffffff" ground="#9ab08a" sun={2.4} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.02, 10]} receiveShadow><planeGeometry args={[80, 20]} /><meshStandardMaterial color="#6aa85a" /></mesh>
    {Array.from({length: 18}, (_, row) => <mesh key={row} position={[0, row * .5 - .25, -row]} receiveShadow><boxGeometry args={[46, .5, 1]} /><meshStandardMaterial color={row % 2 ? '#dedad2' : '#cfcbc3'} /></mesh>)}
    {Array.from({length: 18}, (_, row) => <mesh key={'b' + row} position={[0, row * .25 - .25, -row - .5]}><boxGeometry args={[46, row * .5 + .01, .02]} /><meshStandardMaterial color="#bdb9b1" /></mesh>)}
    <Crowd pts={pts} colors={cols} />
    <pointLight position={[rx, ry + 1.6, rz + .6]} intensity={8 * glow} distance={3} color="#ff5040" />
    <mesh position={[rx, ry + .75, rz]}><sphereGeometry args={[.6, 16, 12]} /><meshBasicMaterial color="#ff6a50" transparent opacity={.2 * glow} /></mesh>
  </ThreeCanvas></AbsoluteFill>);
};

// ── 54：広場の群衆。1人が拡声器で叫び、音の輪が広がる。周りは黙っている ──
export const Megaphone = () => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig();
  const {pts, cols} = useMemo(() => { const r = rnd(54); const pts: [number, number, number, number][] = []; const cols: string[] = [];
    for (let i = 0; i < 160; i++) { const a = r() * Math.PI * 2, d = 1.6 + r() * 9; pts.push([Math.cos(a) * d, 0, Math.sin(a) * d, .95 + r() * .1]); cols.push([M, F, G][Math.floor(r() * 3)]); } return {pts, cols}; }, []);
  const k = f / 285; const ang = lerp(.3, 1.4, k);
  return (<AbsoluteFill style={{background: '#dfe9f2'}}><ThreeCanvas width={width} height={height} shadows>
    <Cam p={[Math.sin(ang) * 7.5, 3.6, Math.cos(ang) * 7.5]} look={[0, 1.1, 0]} fov={40} />
    <color attach="background" args={['#dfe9f2']} /><Lights sky="#ffffff" ground="#b8b0a4" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[16, 64]} /><meshStandardMaterial color="#d6cfc2" /></mesh>
    <Crowd pts={pts} colors={cols} />
    {/* 叫ぶ人（赤）＋拡声器 */}
    <mesh position={[0, .58 * 1.15, 0]} scale={1.15} castShadow><capsuleGeometry args={[.2, .75, 4, 10]} /><meshStandardMaterial color="#e0453a" /></mesh>
    <mesh position={[0, 1.17 * 1.15, 0]} scale={1.15}><sphereGeometry args={[.15, 12, 10]} /><meshStandardMaterial color="#e0453a" /></mesh>
    <mesh position={[.18, 1.32, .32]} rotation={[Math.PI / 2 + .25, 0, 0]} castShadow><coneGeometry args={[.16, .5, 20, 1, true]} /><meshStandardMaterial color="#f0c75a" side={THREE.DoubleSide} /></mesh>
    {/* 音の輪 */}
    {[0, 1, 2, 3].map((i) => { const p = ((f / 60) + i / 4) % 1; return <mesh key={i} position={[0, 1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.5 + p * 11, .8 + p * 11, 64]} /><meshBasicMaterial color="#f08a2a" transparent opacity={(1 - p) * .9} side={THREE.DoubleSide} /></mesh>; })}
  </ThreeCanvas></AbsoluteFill>);
};

// ── 73：男女が並んで立ち、後ろに子ども、その後ろへ世代の列が続く（夕方の明るい光） ──
export const Generations = () => {
  const f = useCurrentFrame(); const {fps, width, height} = useVideoConfig();
  const xbot = useModel('Xbot.glb'); const rpm = useModel('readyplayer.me.glb');
  const {pts, cols} = useMemo(() => { const pts: [number, number, number, number][] = []; const cols: string[] = [];
    for (let i = 0; i < 40; i++) { const z = -2.2 - i * 1.25; const pair = i % 3; const s = pair === 1 ? .62 : 1; pts.push([-.45, 0, z, s], [.45, 0, z, s]); cols.push(M, F); } return {pts, cols}; }, []);
  const k = ez(f, 0, 199);
  return (<AbsoluteFill style={{background: '#f6e2c4'}}>{xbot && rpm && <ThreeCanvas width={width} height={height} shadows>
    <Cam p={[lerp(2.6, 3.4, k), lerp(1.7, 2.6, k), lerp(4.4, 6.2, k)]} look={[0, lerp(1.1, .9, k), lerp(0, -6, k)]} fov={36} />
    <color attach="background" args={['#f6e2c4']} /><fog attach="fog" args={['#f6e2c4', 14, 60]} />
    <hemisphereLight args={['#fff4e0', '#c8a880', 1.6]} />
    <directionalLight position={[-6, 6, 4]} intensity={2.4} color="#ffe0b0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-40} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]} receiveShadow><planeGeometry args={[40, 80]} /><meshStandardMaterial color="#d8c4a0" /></mesh>
    <Crowd pts={pts} colors={cols} />
    {/* 子ども */}
    <mesh position={[0, .58 * .6, -.9]} scale={.6} castShadow><capsuleGeometry args={[.2, .75, 4, 10]} /><meshStandardMaterial color="#f0c75a" /></mesh>
    <mesh position={[0, 1.17 * .6, -.9]} scale={.6}><sphereGeometry args={[.15, 12, 10]} /><meshStandardMaterial color="#f0c75a" /></mesh>
    <RetargetHuman src={xbot} dst={rpm} f={f} fps={fps} steps={[{clip: 'idle', from: 0}]} pos={() => [-.55, 0, 0]} rotY={() => .25} armDown={ARM} />
    <Human gltf={xbot} f={f} fps={fps} steps={[{clip: 'idle', from: 0}]} pos={() => [.55, 0, 0]} rotY={() => -.25} />
  </ThreeCanvas>}</AbsoluteFill>);
};





const ARM = -0.75;
