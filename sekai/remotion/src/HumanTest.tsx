import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';

// カメラ：描画の前に毎フレーム設定する（effectだと各タブの最初の1枚がずれる）
const Cam = ({p, look, fov}: {p: [number, number, number]; look: [number, number, number]; fov: number}) => {
  const {camera, size} = useThree();
  const c: any = camera; c.fov = fov; c.aspect = size.width / size.height;
  c.position.set(...p); c.lookAt(...look); c.updateProjectionMatrix();
  return null;
};
import {Human, useModel} from './Human';

const MIN = '"Noto Serif CJK JP", serif';
const ease = (f: number, a: number, b: number, x0: number, x1: number) =>
  interpolate(f, [a, b], [x0, x1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const HumanTest = () => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const soldier = useModel('Soldier.glb');
  const xbot = useModel('Xbot.glb');
  const pop = spring({frame: f - 120, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{background: '#dfe6ee'}}>
      {soldier && xbot && <ThreeCanvas width={width} height={height} shadows>
        <Cam p={[0, 1.4, 6.2]} look={[0, 0.95, 0]} fov={30} />
        <color attach="background" args={['#e9eef3']} />
        <hemisphereLight args={['#ffffff', '#b8c4d0', 1.6]} />
        <directionalLight position={[3, 6, 4]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#b9c3cc" />
        </mesh>
        <mesh position={[0, 4, -4]} receiveShadow>
          <planeGeometry args={[40, 8]} />
          <meshStandardMaterial color="#f7f1e8" />
        </mesh>
        {/* 兵士：左から歩いてきて止まる */}
        <Human gltf={soldier} f={f} fps={fps} steps={[{clip: 'Walk', from: 0}, {clip: 'Idle', from: 60}]}
          pos={(t) => [ease(t, 0, 65, -3.6, -1.1), 0, 0]}
          rotY={(t) => Math.PI + ease(t, 55, 80, Math.PI / 2, Math.PI / 6)} />
        {/* マネキン：右から歩いてきて止まり、首を振る */}
        <Human gltf={xbot} f={f} fps={fps} steps={[{clip: 'walk', from: 0}, {clip: 'idle', from: 60}, {clip: 'headShake', from: 120}]}
          pos={(t) => [ease(t, 0, 65, 3.6, 1.1), 0, 0]}
          rotY={(t) => ease(t, 55, 80, -Math.PI / 2, -Math.PI / 6)} />
      </ThreeCanvas>}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: MIN, fontWeight: 700, fontSize: 64, color: '#fff', background: 'rgba(20,24,32,.78)',
          padding: '18px 48px', borderRadius: 10, transform: `scale(${pop})`}}>
          選ばれるのは <span style={{color: '#ffd400'}}>たった1匹</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
