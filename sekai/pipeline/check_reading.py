# 読み間違いチェック：VOICEVOX（OpenJTalk）が実際に読むカナを書き出す
import os, json, importlib.util
from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile
EP=os.environ['EP']; spec=importlib.util.spec_from_file_location('s',f'{EP}/script.py'); script=importlib.util.module_from_spec(spec); spec.loader.exec_module(script)
B=os.environ.get('VV','/home/claude/vv')
ort=Onnxruntime.load_once(filename=f"{B}/voicevox_onnxruntime-linux-x64-1.17.3/lib/libvoicevox_onnxruntime.so.1.17.3")
syn=Synthesizer(ort, OpenJtalk(f"{B}/open_jtalk_dic_utf_8-1.11"))
with VoiceModelFile.open(f"{B}/vvms/15.vvm") as m: syn.load_voice_model(m)
rep=[("MHC","エムエイチシー"),("我々","われわれ")]+list(getattr(script,'READINGS',[]))
out=[]
for i,(part,nar,*_) in enumerate(script.SCENES):
    t=nar
    for a,b in rep: t=t.replace(a,b)
    q=syn.create_audio_query(t,13)
    out.append(f"{i:02d} {nar}\n   → {q.kana}")
open(f'{EP}/work/readings.txt','w').write('\n'.join(out)); print('\n'.join(out))
