import {Composition} from 'remotion';
import {Test} from './Test';
import {HumanTest} from './HumanTest';
import {Gallery} from './Gallery';
export const Root = () => (<>
  <Composition id="Test" component={Test} durationInFrames={240} fps={30} width={1920} height={1080}/>
  <Composition id="HumanTest" component={HumanTest} durationInFrames={240} fps={30} width={1920} height={1080}/>
  <Composition id="Gallery" component={Gallery} durationInFrames={240} fps={30} width={1920} height={1080}/>
</>);
