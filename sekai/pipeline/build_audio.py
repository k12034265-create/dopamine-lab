import numpy as np, wave
from common import W
from timeline import build
TL=build(); SR=48000; FPS=30
total=sum(x['frames'] for x in TL)/FPS
nar=np.zeros(int(total*SR)+SR); start=0
for x in TL:
    with wave.open(f"{W}/audio/{x['i']+1:02d}.wav") as w:
        sr=w.getframerate(); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
    a=np.interp(np.arange(0,len(a)*SR/sr)/(SR/sr), np.arange(len(a)), a)
    s=int(start/FPS*SR); nar[s:s+len(a)]+=a; start+=x['frames']
nar=nar[:int(total*SR)]; t=np.arange(len(nar))/SR
chords=[[110,130.81,164.81],[98,123.47,146.83],[87.31,110,130.81],[82.41,103.83,123.47]]
pad=np.zeros_like(nar); seg=16.0
for k,ch in enumerate(chords*int(total/seg/4+2)):
    s0=k*seg; idx=(t>=s0-4)&(t<s0+seg+4)
    if not idx.any(): continue
    tt=t[idx]-s0; env=np.clip(np.minimum((tt+4)/4,(seg+4-tt)/4),0,1)
    for f in ch: pad[idx]+=env*(np.sin(2*np.pi*f*t[idx])*0.5+np.sin(2*np.pi*f*2*t[idx]+0.3)*0.12)*(1+0.2*np.sin(2*np.pi*0.1*t[idx]))
pad=np.convolve(pad,np.ones(40)/40,mode='same'); pad=pad/np.max(np.abs(pad))*0.06
pad*=np.clip(np.minimum(t/3,(total-t)/3),0,1)
mix=nar*0.95+pad; mix=mix/max(1,np.max(np.abs(mix))/0.98)
with wave.open(f'{W}/final_audio.wav','wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
print(round(total,2))
