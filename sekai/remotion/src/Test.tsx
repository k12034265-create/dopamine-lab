import {AbsoluteFill, OffthreadVideo, Audio, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence} from 'remotion';
import {ThreeCanvas} from '@remotion/three';

const MIN = '"Noto Serif CJK JP", serif';

const Egg = () => {
  const f = useCurrentFrame();
  return (
    <ThreeCanvas width={700} height={700} camera={{position:[0,0,6], fov:40}}>
      <ambientLight intensity={0.6}/>
      <directionalLight position={[3,4,5]} intensity={1.2}/>
      <mesh rotation={[0, f*0.02, 0]} scale={1 + Math.sin(f/10)*0.03}>
        <icosahedronGeometry args={[1.6, 1]}/>
        <meshStandardMaterial color="#f4c9a8" flatShading/>
      </mesh>
    </ThreeCanvas>
  );
};

const Count = ({from}:{from:number}) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f-from, [0, 45], [0, 250000000], {extrapolateLeft:'clamp', extrapolateRight:'clamp'}));
  const oku = Math.floor(v/1e8), man = Math.floor((v%1e8)/1e4);
  return <span style={{color:'#ffd400'}}>{oku>0?`${oku}億`:''}{man>0?`${man}万`:''}{v===0?'0':''}</span>;
};

export const Test = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f-10, fps, config:{damping:12}});
  return (
    <AbsoluteFill style={{background:'#000'}}>
      <OffthreadVideo src={staticFile('V_lab.mp4')} muted style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.55}}/>
      <Audio src={staticFile('nar.wav')}/>
      <AbsoluteFill style={{justifyContent:'center', alignItems:'flex-start', paddingLeft:140}}>
        <div style={{fontFamily:MIN, fontWeight:700, color:'#fff', fontSize:96, transform:`scale(${pop})`, transformOrigin:'left center', textShadow:'0 4px 18px #000'}}>
          ライバルは <Count from={40}/> 匹
        </div>
        <Sequence from={100} layout="none">
          <div style={{fontFamily:MIN, color:'#fff', fontSize:56, marginTop:30, opacity:interpolate(f,[100,120],[0,1],{extrapolateRight:'clamp'})}}>
            卵子まで辿り着くのは <span style={{color:'#ffa000'}}>数百匹</span>
          </div>
        </Sequence>
      </AbsoluteFill>
      <div style={{position:'absolute', right:80, top:190}}><Egg/></div>
    </AbsoluteFill>
  );
};
