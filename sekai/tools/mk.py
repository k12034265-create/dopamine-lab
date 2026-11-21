import json, subprocess, sys
subs=json.load(open('subs.json')); OUT='/home/claude/dopamine-lab/sekai/episodes/03_kiss/work/clips_px'
import os; os.makedirs(OUT,exist_ok=True)
grade="eq=brightness=-0.035:saturation=0.88:contrast=1.04,vignette=PI/4.5,noise=alls=5:allf=t"
cfg={44:dict(src='sofa_uhd.mp4',ss=0,dur=9.1,vf="crop=1400:788:0:300,scale=1920:1080:flags=lanczos,fps=30"),
     48:dict(src='torii.mp4',ss=1.5,dur=8.0,vf="fps=30,crop=2160:1215:0:'250+1120*(3*pow(min(1,max(0,(t-0.8)/5.5)),2)-2*pow(min(1,max(0,(t-0.8)/5.5)),3))',scale=1920:1080:flags=lanczos")}
for i,c in cfg.items():

    S=[s for s in subs if s[0]==i]; ins=[]; fc=f"[0:v]{c['vf']},{grade},fade=t=in:st=0:d=0.35,fade=t=out:st={c['dur']-0.35}:d=0.35[v0]"
    for k,(_,_,a,e,fn) in enumerate(S):
        ins+=['-i',fn]; fc+=f";[v{k}][{k+1}:v]overlay=0:0:enable='between(t,{a:.3f},{e+0.15:.3f})'[v{k+1}]"
    cmd=['ffmpeg','-v','error','-y','-ss',str(c['ss']),'-t',str(c['dur']),'-i',c['src']]+ins+['-filter_complex',fc,'-map',f'[v{len(S)}]','-frames:v',str(round(c['dur']*30)),
         '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r','30','-an',f'{OUT}/tmp.mp4']
    subprocess.run(cmd,check=True); os.rename(f'{OUT}/tmp.mp4',f'{OUT}/c{i}.mp4'); print('ok',i)
