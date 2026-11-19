# VOICEVOX 青山龍星ノーマル(id13) speed1.1 で全シーンを合成
import wave, io, json, os
from common import W
import script
from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile
B=os.environ.get('VV','/home/claude/vv')
ort=Onnxruntime.load_once(filename=f"{B}/voicevox_onnxruntime-linux-x64-1.17.3/lib/libvoicevox_onnxruntime.so.1.17.3")
syn=Synthesizer(ort, OpenJtalk(f"{B}/open_jtalk_dic_utf_8-1.11"))
with VoiceModelFile.open(f"{B}/vvms/15.vvm") as m: syn.load_voice_model(m)
SID=13
rep=[("MHC","エムエイチシー"),("我々","われわれ")]+list(getattr(script,'READINGS',[]))
os.makedirs(f'{W}/audio',exist_ok=True); durs=[]
for i,(part,nar,*_) in enumerate(script.SCENES,1):
    t=nar
    for a,b in rep: t=t.replace(a,b)
    q=syn.create_audio_query(t, SID); q.speed_scale=1.1
    w=syn.synthesis(q, SID)
    open(f"{W}/audio/{i:02d}.wav","wb").write(w)
    with wave.open(io.BytesIO(w)) as f: durs.append(round(f.getnframes()/f.getframerate(),2))
json.dump(durs,open(f'{W}/audio/durations.json','w'))
print(len(durs), round(sum(durs),1),"s")
