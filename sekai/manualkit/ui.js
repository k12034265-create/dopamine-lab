// manualkit/ui.js — 画面の枠（紙の地・章ラベル・字幕・出典）とグラフ部品
import { PAL, LW, JP, tx, tw, roundRect, cl, ease, eo, path } from './iso.js';
export const W = 1920, H = 1080, SUBY = 944;
export function frameBg(g) { g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H); }
export function frameUI(g, S) { // 章ラベル・出典・字幕（最後に呼ぶ）
  if (S.chap) { g.fillStyle = PAL.ink; g.fillRect(60, 44, 8, 40); tx(g, S.chap, 82, 76, 30, { color: PAL.g2 }); }
  if (S.src) tx(g, '出典：' + S.src, W - 56, 76, 24, { w: 500, align: 'right', color: PAL.g3 });
  g.fillStyle = '#FFFFFF'; g.fillRect(0, SUBY, W, H - SUBY); g.fillStyle = PAL.ink; g.fillRect(0, SUBY, W, 4);
  if (S.subText) { const lines = wrap(g, S.subText, 44, 1700); lines.forEach((l, i) => tx(g, l, W / 2, SUBY + 4 + (H - SUBY - 4) / 2 + 16 + (i - (lines.length - 1) / 2) * 58, 44, { align: 'center' })); } }
export function wrap(g, s, size, maxw) { if (tw(g, s, size) <= maxw) return [s]; const n = s.length; let best = Math.ceil(n / 2), bd = 1e9; for (let i = 4; i < n - 3; i++) { if ('、。'.includes(s[i - 1])) { const d = Math.abs(i - n / 2); if (d < bd) { bd = d; best = i; } } } return [s.slice(0, best), s.slice(best)]; }
export function head(g, s, y = 170, size = 56, o = {}) { tx(g, s, o.x ?? W / 2, y, size, { align: o.align || 'center', w: 900, ...o }); }
// 円グラフ（items=[{v,c}]、k=開き具合0..1）
export function pie(g, cx, cy, r, items, k) { let a = -Math.PI / 2; const tot = items.reduce((s, x) => s + x.v, 0); for (const it of items) { const b = a + it.v / tot * Math.PI * 2 * k; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, a, b); g.closePath(); g.fillStyle = it.c; g.fill(); g.lineWidth = LW; g.strokeStyle = PAL.ink; g.lineJoin = 'round'; g.stroke(); a = b; } if (k < 1) { g.beginPath(); g.arc(cx, cy, r, 0, 7); g.lineWidth = LW; g.strokeStyle = PAL.ink; g.setLineDash([8, 8]); g.stroke(); g.setLineDash([]); } }
export function ring(g, cx, cy, r, w, k, c = PAL.red) { g.beginPath(); g.arc(cx, cy, r, 0, 7); g.lineWidth = w; g.strokeStyle = '#FFFFFF'; g.stroke(); g.lineWidth = w + LW * 2; g.strokeStyle = PAL.ink; g.globalCompositeOperation = 'destination-over'; g.stroke(); g.globalCompositeOperation = 'source-over';
  if (k > 0) { g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.lineWidth = w; g.strokeStyle = c; g.stroke(); } }
export const num = (n) => Math.round(n).toLocaleString('en-US');
