// サムネ用：字幕・オーバーレイなしで同じシーンを描く
import { SCENES as S0 } from './scenes3d.js';
export const SCENES = S0.map(sc => ({ build() { const b = sc.build(); return { ...b, update(t, d) { b.update(t, d); return ''; } }; } }));
