import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {Human, useModel} from './Human';
import {RetargetHuman} from './Retarget';

const Cam = ({p, look, fov}: {p: [number, number, number]; look: [number, number, number]; fov: number}) => {
  const {camera, size} = useThree();
  const c: any = camera; c.fov = fov; c.aspect = size.width / size.height;
  c.position.set(...p); c.lookAt(...look); c.updateProjectionMatrix();
  return null;
};
const MIN = '"Noto Serif CJK JP", serif';

export const Gallery = () => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const robot = useModel('RobotExpressive.glb');
  const rpm = useModel('readyplayer.me.glb');
  const xbot = useModel('Xbot.glb');
  const ok = robot && rpm && xbot;
  const X = [-2.6, 0, 2.6];
  const labels = ['ロボット（14動作＋表情）', 'リアル人間（Ready Player Me）', 'マネキン（今回のテスト）'];
  return (
    <AbsoluteFill style={{background: '#e9eef3'}}>
      {ok && <ThreeCanvas width={width} height={height} shadows>
        <Cam p={[0, 1.5, 9]} look={[0, 0.95, 0]} fov={32} />
        <color attach="background" args={['#e9eef3']} />
        <hemisphereLight args={['#ffffff', '#b8c4d0', 1.6]} />
        <directionalLight position={[3, 6, 5]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={6} shadow-camera-bottom={-6} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[40, 40]} /><meshStandardMaterial color="#b9c3cc" /></mesh>
        <mesh position={[0, 4, -4]} receiveShadow><planeGeometry args={[40, 8]} /><meshStandardMaterial color="#f7f1e8" /></mesh>
        <Human gltf={robot} f={f} fps={fps} scale={0.33}
          steps={[{clip: 'Wave', from: 0}, {clip: 'Yes', from: 60}, {clip: 'ThumbsUp', from: 120}, {clip: 'Dance', from: 170}]}
          pos={() => [X[0], 0, 0]} rotY={() => 0.2} />
        <RetargetHuman src={xbot} dst={rpm} f={f} fps={fps}
          steps={[{clip: 'idle', from: 0}, {clip: 'agree', from: 50}, {clip: 'headShake', from: 120}, {clip: 'sad_pose', from: 180}]}
          pos={() => [X[1], 0, 0]} rotY={() => 0.1} />
        <Human gltf={xbot} f={f} fps={fps}
          steps={[{clip: 'idle', from: 0}, {clip: 'sneak_pose', from: 60}, {clip: 'sad_pose', from: 140}]}
          pos={() => [X[2], 0, 0]} rotY={() => -0.3} />
      </ThreeCanvas>}
      {labels.map((l, i) => (
        <div key={i} style={{position: 'absolute', bottom: 60, left: `${21 + i * 29}%`, transform: 'translateX(-50%)',
          fontFamily: MIN, fontWeight: 700, fontSize: 30, color: '#fff', background: 'rgba(20,24,32,.78)', padding: '8px 18px', borderRadius: 8, whiteSpace: 'nowrap'}}>{l}</div>
      ))}
    </AbsoluteFill>
  );
};
