// ===== 実写の場面：緑に塗って、カード・出典だけ上に置く =====
const C2 = (s0, t0 = .5, src = '', size = 46) => (t) => (t > t0 ? capO(170, s0, Y, size) : '') + (src ? srcBox(src) : '');
const GV = [
  [8, (t) => C2('2025年　上場企業の流出・紛失事故', .4, S1, 40)(t) + (t > 2.6 ? `<g transform="translate(${CX},820) scale(${pop(clamp((t - 2.6) / .4))})"><rect x="-150" y="-60" width="300" height="110" rx="20" fill="#141219" stroke="${Y}" stroke-width="5"/>` + txt(0, 18, '180件', { size: 64, color: '#fff', serif: true }) + '</g>' : '')],
  [20, (t) => C2('メール配信の代行会社', .4, S3, 48)(t)]];
for (const [i, ov] of GV) { const old = SC[i];
  SC[i] = { kind: 'kami', build() { const b = old.build(); return { render() {}, update(t, dur) { return b.update(t, dur) + `<div style="position:absolute;left:0;top:0;width:1920px;height:944px;background:#00ff00"></div>` + ovSvg(ov(t)); } }; } }; }
export const SCENES = SC;
