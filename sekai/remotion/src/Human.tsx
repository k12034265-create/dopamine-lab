import {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

// Canvasの外で読み込む。画面に反映されてから continueRender（先に呼ぶと写らないことがある）
export const useModel = (file: string) => {
  const [gltf, setGltf] = useState<any>(null);
  const [handle] = useState(() => delayRender('load ' + file));
  useEffect(() => {
    new GLTFLoader().load(staticFile(file), (g: any) => {
      g.scene.traverse((o: any) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; if ((window as any).PLAIN && o.material?.map) o.material = new THREE.MeshStandardMaterial({color:'#3355ff'}); } });
      setGltf(g);
    }, undefined, (e: any) => { console.log('LOADERR', String(e)); continueRender(handle); });
  }, []);
  useEffect(() => { if (gltf) requestAnimationFrame(() => continueRender(handle)); }, [gltf]);
  return gltf;
};

export type Step = {clip: string; from: number};
type Props = {
  gltf: any; f: number; fps: number;
  steps: Step[];
  pos: (f: number) => [number, number, number];
  rotY: (f: number) => number;
  fade?: number; scale?: number;
};

// 動きの予定（steps）に沿って、フレームfの姿勢を毎回計算する（コマ飛ばしでも同じ絵になる）
export const Human = ({gltf, f, fps, steps, pos, rotY, fade = 10, scale = 1}: Props) => {
  const mixer = useMemo(() => (gltf ? new THREE.AnimationMixer(gltf.scene) : null), [gltf]);
  if (!gltf || !mixer) return null;
  const cur = steps.filter((s) => s.from <= f).length - 1;
  mixer.stopAllAction();
  steps.forEach((s, i) => {
    const clip = gltf.animations.find((a: any) => a.name === s.clip);
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
