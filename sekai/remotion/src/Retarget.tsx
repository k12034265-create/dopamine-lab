import {useMemo} from 'react';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import {Step} from './Human';

// Mixamo系（Xbot）の動きを、骨名が同じ別モデル（Ready Player Me 等）に毎フレーム写す。
// 方法：元の骨の「初期姿勢からの回転（ワールド）」を、先の骨の初期姿勢に掛ける。初期姿勢の違いを吸収できる。
const qW = (o: THREE.Object3D) => { const q = new THREE.Quaternion(); o.getWorldQuaternion(q); return q; };

export const RetargetHuman = ({src, dst, f, fps, steps, pos, rotY, fade = 10, scale = 1, armDown = 0}: {
  src: any; dst: any; f: number; fps: number; steps: Step[];
  pos: (f: number) => [number, number, number]; rotY: (f: number) => number; fade?: number; scale?: number; armDown?: number;
}) => {
  const rig = useMemo(() => {
    const s = SkeletonUtils.clone(src.scene) as THREE.Object3D;   // 動きを再生する見えない元モデル
    // 骨の基準はスキンの初期姿勢（bind pose）にそろえる
    s.traverse((o: any) => { if (o.isSkinnedMesh) o.skeleton.pose(); });
    dst.scene.traverse((o: any) => { if (o.isSkinnedMesh) o.skeleton.pose(); });
    s.updateMatrixWorld(true);
    dst.scene.updateMatrixWorld(true);                          // まだ何にも追加していない＝ワールド＝モデル基準
    const sb: Record<string, THREE.Object3D> = {};
    s.traverse((o: any) => { if (o.isBone) sb[o.name.replace(/^mixamorig:?/, '')] = o; });
    const pairs: {d: any; s: any; dRest: THREE.Quaternion; sRest: THREE.Quaternion; pRest: THREE.Quaternion}[] = [];
    dst.scene.traverse((o: any) => {
      if (o.isBone && sb[o.name]) pairs.push({d: o, s: sb[o.name], dRest: qW(o), sRest: qW(sb[o.name]), pRest: qW(o.parent)});
    });
    const mixer = new THREE.AnimationMixer(s);
    return {s, pairs, mixer};
  }, [src, dst]);

  // 元モデルを動かす
  const {s, pairs, mixer} = rig;
  const cur = steps.filter((x) => x.from <= f).length - 1;
  mixer.stopAllAction();
  steps.forEach((st, i) => {
    const clip = src.animations.find((a: any) => a.name === st.clip);
    if (!clip) return;
    let w = 0;
    if (i === cur) w = i === 0 ? 1 : Math.min(1, (f - st.from) / fade);
    if (i === cur - 1) w = 1 - Math.min(1, (f - steps[cur].from) / fade);
    if (w <= 0) return;
    const a = mixer.clipAction(clip); a.play(); a.setEffectiveWeight(w);
    a.time = ((f - st.from) / fps) % clip.duration;
  });
  mixer.update(0);
  s.updateMatrixWorld(true);

  // 先のモデルに写す（親→子の順。親のワールド回転は自前で追う）
  const world = new Map<any, THREE.Quaternion>(); const extra = new Map<any, THREE.Quaternion>();
  for (const p of pairs) {
    // 骨自身の向きで見た回転の変化を写す（Mixamo系は骨の軸がそろっている）
    let Wt = p.dRest.clone().multiply(p.sRest.clone().invert()).multiply(qW(p.s));
    let ex = extra.get(p.d.parent);
    if (armDown && /^(Left|Right)Arm$/.test(p.d.name)) ex = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), armDown);
    if (ex) { Wt = ex.clone().multiply(Wt); extra.set(p.d, ex); }
    const parentW = world.get(p.d.parent) ?? p.pRest;
    p.d.quaternion.copy(parentW.clone().invert().multiply(Wt));
    world.set(p.d, Wt);
  }
  const [x, y, z] = pos(f);
  return <group position={[x, y, z]} rotation={[0, rotY(f), 0]} scale={scale}><primitive object={dst.scene} /></group>;
};
