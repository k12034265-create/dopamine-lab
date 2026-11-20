import { THREE, makeScene, mat, glow, box, lamp, sun, camMove, ease, clamp } from '/pipeline3d/lib3d.js';
import { room, windowPane, bookshelf, desk, chair, deskLamp, plant, board, dataTex, D, human, globe, worldTex, PAL } from '/pipeline3d/sets3d.js';
function t1(){ const S=makeScene({bg:'#2a2620',hemi:0.8,exposure:1.4}); const s=S.s;
  room(s,{w:12,d:9,wall:'#5b5448',floor:'#6e5440'}); windowPane(s,3.6,2.4,-4.38,2.4,1.8,'dusk');
  bookshelf(s,-4.6,-4.1); desk(s,-1.2,-2.6); chair(s,-1.2,-1.8,Math.PI);
  const tex=dataTex(1600,900,'chalk',(g,W,H,T,k=1)=>{ D.title(g,T,80,110,'恋人同士のキスがある文化',60); D.hbars(g,T,520,220,860,[{label:'中東',v:100,txt:'100%'},{label:'アジア',v:73,txt:'73%'},{label:'ヨーロッパ',v:70,txt:'70%'},{label:'北米',v:55,txt:'55%'}],100,k,{bh:80,gap:60,ls:46,vs:50}); });
  board(s,4.2,2.36,tex,0.6,2.3,-4.35,0,{tray:true});
  const a=human(s,{top:'#7a3b2e',hairStyle:'long',hair:'#3a2418'}); a.position.set(-2.4,0,-1.6); a.rotation.y=0.5;
  const b=human(s,{top:'#2e4a6a'}); b.position.set(2.6,0,-1.4); b.rotation.y=-0.4;
  const c=human(s,{pose:'sit',top:'#4a5a3a',hairStyle:'bun',hair:'#2a2018'}); c.position.set(-1.2,0,-1.9); c.rotation.y=Math.PI;
  globe(s,-3.2,1.15,-2.5,0.35,worldTex([[.6,.3,'#ff8a3d',8]])); deskLamp(s,-0.6,0.79,-2.8,{i:5}); plant(s,4.8,-3.6,1.3);
  sun(s,'#ffd2a0',1.6,4,6,4,10);
  return {...S, update(t){ tex.redraw(clamp(t/3)); camMove(S.cam,[0.5,1.7,5.5],[0.2,1.6,4.6],[0,1.5,-3],[0,1.6,-3],ease(t/8)); return ''; }}; }
export const SCENES=[{build:t1}];
