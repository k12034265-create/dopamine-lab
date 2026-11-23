import {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const draco = new DRACOLoader();
draco.setDecoderPath(staticFile('draco/'));

// Canvasの外で読み込む。画面に反映されてから continueRender（先に呼ぶと写らないことがある）
export const useModel = (file: string) => {
  const [gltf, setGltf] = useState<any>(null);
  const [handle] = useState(() => delayRender('load ' + file));
  useEffect(() => {
    new GLTFLoader().setDRACOLoader(draco).load(staticFile(file), (g: any) => {
      g.scene.traverse((o: any) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; if ((window as any).PLAIN && o.material?.map) o.material = new THREE.MeshStandardMaterial({color:'#3355ff'}); } });
      setGltf(g);
    }, undefined, (e: any) => { console.log('LOADERR', String(e)); continueRender(handle); });
  }, []);
  useEffect(() => { if (gltf) requestAnimationFrame(() => continueRender(handle)); }, [gltf]);
  return gltf;
};

export type Step = {clip: string; from: number};
type Props = {
  clips?: any[];
  gltf: any; f: number; fps: number;
  steps: Step[];
  pos: (f: number) => [number, number, number];
  rotY: (f: number) => number;
  fade?: number; scale?: number;
};

// 動きの予定（steps）に沿って、フレームfの姿勢を毎回計算する（コマ飛ばしでも同じ絵になる）
export const Human = ({clips, gltf, f, fps, steps, pos, rotY, fade = 10, scale = 1}: Props) => {
  const mixer = useMemo(() => (gltf ? new THREE.AnimationMixer(gltf.scene) : null), [gltf]);
  if (!gltf || !mixer) return null;
  const cur = steps.filter((s) => s.from <= f).length - 1;
  mixer.stopAllAction();
  steps.forEach((s, i) => {
    const clip = (clips || gltf.animations).find((a: any) => a.name === s.clip);
    if (!clip) return;
    let w = 0;
    if (i === cur) w = i === 0 ? 1 : Math.min(1, (f - s.from) / fade);
    if (i === cur - 1) w = 1 - Math.min(1, (f - steps[cur].from) / fade);
    if (w <= 0) return;
    const a = mixer.clipAction(clip);
    a.play(); a.setEffectiveWeight(w);
    a.time = ((f - s.from) / fps) % clip.duration;
  });
  mixer.update(0);
  const [x, y, z] = pos(f);
  return <primitive object={gltf.scene} position={[x, y, z]} rotation={[0, rotY(f), 0]} scale={scale} />;
};

// Mixamo系の動きを、骨名が「mixamorig」抜きのモデル（Ready Player Me など）へ移す。
// 初期姿勢の違いは SkeletonUtils.retargetClip が吸収する。位置トラックは捨てる（その場の動きだけ使う）
export const retarget = (srcGltf: any, dstGltf: any, clipNames?: string[]) => {
  const find = (g: any) => { let m: any; g.scene.traverse((o: any) => { if (!m && o.isSkinnedMesh) m = o; }); return m; };
  const src = find(srcGltf), dst = find(dstGltf);
  const names: Record<string, string> = {};
  dst.skeleton.bones.forEach((b: any) => { names[b.name] = 'mixamorig' + b.name; });
  return srcGltf.animations
    .filter((c: any) => !clipNames || clipNames.includes(c.name))
    .map((c: any) => {
      const r = SkeletonUtils.retargetClip(dst, src, c, {names, hip: 'Hips', fps: 30, preserveBoneMatrix: false} as any);
      const tracks = r.tracks
        .filter((t: any) => !t.name.endsWith('.position'))
        .map((t: any) => { const n = t.clone(); n.name = t.name.replace(/^\.bones\[(.+?)\]/, '$1'); return n; });
      dst.skeleton.pose();
      return new THREE.AnimationClip(c.name, r.duration, tracks);
    });
};
