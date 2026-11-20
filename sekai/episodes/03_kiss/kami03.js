// 03 キス — 紙芝居（2D）版のシーン
import { C, W, H, SERIF, clamp, ease, easeOut, pop, txt, person, run, kami } from '/pipeline3d/kami.js';
import { theater, office, washitsu, street } from './proto3d.js';

const CX = 960;
// 台本の紙
function script(x, y, rot, k, kiss) {
  let lines = ''; const r = [0.82, 0.6, 0.9, 0.7, 0.85, 0.5, 0.88, 0.66, 0.78, 0.92, 0.58, 0.8, 0.7, 0.86];
  r.forEach((v, i) => { lines += `<rect x="40" y="${250 + i * 34}" width="${400 * v}" height="9" rx="3" fill="#8a8072" opacity=".75"/>`; });
  const c = clamp(k * 1.6), L = 2 * Math.PI * 200;
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(.88)" filter="url(#sh)">
    <rect x="0" y="0" width="520" height="720" rx="6" fill="${C.paper}"/>
    ${txt(40, 80, '脚本', { size: 40, anchor: 'start', color: C.ink, serif: true, shadow: false })}
    ${txt(40, 160, 'はたちの青春', { size: 64, anchor: 'start', color: C.ink, serif: true, shadow: false })}
    ${txt(42, 205, '松竹　1946年', { size: 26, anchor: 'start', color: '#6a6258', serif: true, shadow: false })}
    ${lines}
    ${k > 0 ? `<ellipse cx="250" cy="425" rx="215" ry="78" fill="none" stroke="${C.red}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${(L * (1 - c)).toFixed(1)}" transform="rotate(-4 250 425)"/>` : ''}
    ${kiss > 0 ? `<g transform="translate(120,640) rotate(-8) scale(${pop(kiss).toFixed(3)})" opacity="${clamp(kiss * 2)}"><text font-family="Georgia,${SERIF}" font-style="italic" font-weight="700" font-size="112" fill="${C.red}">KISS!</text></g>` : ''}
  </g>`;
}
// 巻物（横に開く）
function scroll(x, y, w, h, open, hi) {
  const ww = w * easeOut(open); let cols = ''; const r = (i, k) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;
  for (let c = 0; c < 26; c++) { const cx = w - 50 - c * 54; if (Math.abs(cx - w / 2) < 70 || cx > ww) continue; let yy = 40, k = 0;
    while (yy < h - 50) { const hh = 16 + r(c, k) * 26; cols += `<rect x="${cx}" y="${yy}" width="${8 + r(k, c) * 6}" height="${hh}" fill="#2b2520" opacity="${.55 + r(c + 3, k) * .3}"/>`; yy += hh + 10 + r(k + 1, c) * 10; k++; } }
  const kc = ['口', '吸', 'ふ'].map((ch, i) => txt(w / 2, 150 + i * 120, ch, { size: 96, color: '#1e1a16', serif: true, shadow: false })).join('');
  return `<g transform="translate(${x},${y})" filter="url(#sh)">
    <clipPath id="sc"><rect x="${w - ww}" y="0" width="${ww}" height="${h}"/></clipPath>
    <g clip-path="url(#sc)"><rect width="${w}" height="${h}" fill="#ece1c6"/>${cols}${kc}
      ${hi > 0 ? `<rect x="${w / 2 - 74}" y="62" width="148" height="400" fill="none" stroke="${C.red}" stroke-width="7" opacity="${hi}"/>` : ''}</g>
    <rect x="${w - ww - 18}" y="-14" width="22" height="${h + 28}" rx="10" fill="#7a3a1e"/><rect x="${w - 4}" y="-14" width="22" height="${h + 28}" rx="10" fill="#7a3a1e"/>
  </g>`;
}

const S1 = kami((t) => run([
  { at: 0, f: () => txt(CX, 150, '1946年　映画『はたちの青春』', { size: 44, color: C.dim, serif: true }) },
  { at: 0.15, slide: 60, f: () => script(1060 - 330 * ease((t - 3.4) / .8) * 0, 230, 2, clamp((t - 4.0) / 1.2), clamp((t - 5.6) / .5)) },
  { at: 3.5, f: (lt) => person(560, 600, 140, C.navy, 'officer') + txt(560, 840, 'GHQ（民間情報教育局）', { size: 34, color: C.fg }) },
  { at: 4.0, f: (lt) => `<g transform="translate(560,300)"><rect x="-190" y="-70" width="420" height="110" rx="22" fill="#fff"/><path d="M60,38 L110,90 L110,38 Z" fill="#fff"/>${txt(20, 6, 'キスシーンを入れろ', { size: 46, color: C.ink, shadow: false })}</g>` },
], t), { zoom: 0.05 });

const S2 = kami((t) => run([
  { at: 0, out: 3.3, f: () => txt(CX, 400, '？', { size: 200, color: C.gold }) },
  { at: 0, out: 4.0, f: (lt) => person(760, 640, 120, '#c9b48a', 'heian') + person(1160, 640, 120, '#d98a8a', 'heianf')
      + txt(CX, 180, 'それまでの日本人は、キスをしなかった？', { size: 52, serif: true }) },
  { at: 3.3, out: 4.0, slide: 0, f: (lt) => `<g transform="translate(${CX},420) scale(${Math.max(.6, pop(lt / .3)).toFixed(3)})">${txt(0, 60, 'ノー', { size: 220, color: C.red, serif: true })}</g>` },
  { at: 4.3, slide: 0, f: (lt) => scroll(210, 230, 1500, 520, lt / 1.1, clamp((lt - 1.3) / .4)) },
  { at: 5.8, f: () => txt(1500, 870, '口吸ふ（くちすう）＝ キス', { size: 46, color: C.fg, serif: true, anchor: 'middle' }) + txt(1500, 925, '千年以上前の日本語', { size: 30, color: C.dim }) },
], t), { zoom: 0.05 });

export const SCENES = [{ build: theater }, S1, S2, { build: street }];
