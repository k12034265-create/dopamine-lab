import {Composition} from 'remotion';
import {Test} from './Test';
import {HumanTest} from './HumanTest';
import {Gallery} from './Gallery';
import {Office, Stadium, Megaphone, Generations} from './Ep13';
export const Root = () => (<>
  <Composition id="Test" component={Test} durationInFrames={240} fps={30} width={1920} height={1080}/>
  <Composition id="HumanTest" component={HumanTest} durationInFrames={240} fps={30} width={1920} height={1080}/>
  <Composition id="Gallery" component={Gallery} durationInFrames={240} fps={30} width={1920} height={1080}/>
  <Composition id="E13Office" component={Office} durationInFrames={294} fps={30} width={1920} height={1080}/>
  <Composition id="E13Stadium" component={Stadium} durationInFrames={200} fps={30} width={1920} height={1080}/>
  <Composition id="E13Megaphone" component={Megaphone} durationInFrames={285} fps={30} width={1920} height={1080}/>
  <Composition id="E13Generations" component={Generations} durationInFrames={199} fps={30} width={1920} height={1080}/>
</>);
