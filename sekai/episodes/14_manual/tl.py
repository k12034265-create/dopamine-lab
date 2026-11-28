import json,runpy,sys
EP='/home/claude/dopamine-lab/sekai/episodes/14_manual'
m=runpy.run_path(EP+'/script.py'); S=m['SCENES']; PA=m['PAUSEK']; du=json.load(open(EP+'/work/audio/durations.json'))
FPS=30; out=[]; cum=0.0
for i,(s,a) in enumerate(zip(S,du)):
    gap = 5.2 if i==len(S)-1 else (1.2 if S[i+1][0]!=s[0] else 0.45)+PA.get(s[2],0)
    start=cum; cum+=a+gap; f0=round(start*FPS); f1=round(cum*FPS)
    sents=[x+'。' for x in s[1].split('。') if x]; tot=sum(len(x) for x in sents); subs=[]; t=0
    for x in sents: L=a*len(x)/tot; subs.append([round(t,3),round(t+L,3),x]); t+=L
    out.append(dict(i=i,part=s[0],key=s[2],src=s[3],note=s[4],f0=f0,frames=f1-f0,start=f0/FPS,dur=(f1-f0)/FPS,audio=a,subs=subs))
json.dump(dict(scenes=out,dur=cum,fps=FPS),open('timeline.json','w'),ensure_ascii=False)
print(len(out),round(cum,2))
