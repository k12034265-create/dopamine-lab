// 07 親の年収と成績 — 図解中心（写真なし）。字幕は灰色の帯。名前を付けた言葉：「前払い」「利子」
import { maps, C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, bubble, loadMaps, run, kami } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const M = '#4f8fea', F = '#ef7fa8', Y = C.gold, CX = 960;
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', '第5章', 'エピローグ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, ...o });
const R = (els, t) => run(els.map(e => e.f ? e : { ...e, f: () => '' }), t);
const ref = (s) => ({ at: .6, f: () => note(1880, 125, s, 'end') });
const SR1 = '文部科学省 全国学力・学習状況調査（保護者に対する調査）';
const SC = [];
// 文字が1字ずつ出る
const typed = (x, y, s, t, t0, cps, o) => { const n = Math.max(0, Math.min(s.length, Math.floor((t - t0) * cps))); return txt(x, y, s.slice(0, n), o); };
// 0 黒地に一文。「前払い」が金色に光る
SC[0] = K((t) => { const g = clamp((t - 2.2) / .6); return R([
  { at: 0, slide: 0, f: () => typed(CX - 20, 520, '子どもの成績は、親の年収で、', t, .1, 14, { size: 70, serif: true })
      + `<g opacity="${clamp((t - 1.9) / .3)}">${txt(CX - 70, 650, '前払い', { size: 110, serif: true, color: Y })}${txt(CX + 140, 650, 'されている。', { size: 70, serif: true, anchor: 'start' })}</g>`
      + `<ellipse cx="${CX - 70}" cy="615" rx="${200 * g}" ry="${70 * g}" fill="${Y}" opacity="${(.18 * g).toFixed(2)}" filter="url(#glow)"/>` },
], t); }, 0, { enter: 'fade', zoom: 0 });
// 1 レシート：点数の一部は、もう家で支払い済み
const ITEMS = [['絵本の読み聞かせ', '済'], ['家にある本・新聞', '済'], ['塾・習いごと', '済'], ['「大学まで」という親の期待', '済']];
SC[1] = K((t) => { const k = easeOut(clamp((t - .2) / .8));
  let rec = `<g transform="translate(${CX - 260},${170 + (1 - k) * 700})"><path d="M0,0 L520,0 L520,700 ${[...Array(13)].map((_, i) => `L${520 - (i + .5) * 40},${i % 2 ? 700 : 720}`).join(' ')} L0,700Z" fill="#f1ece2"/>`
    + txt(260, 70, '領収書', { size: 46, color: '#222', shadow: false, serif: true }) + `<rect x="40" y="100" width="440" height="3" fill="#bbb"/>`
    + txt(40, 160, '品名：子どもの点数', { size: 32, color: '#333', shadow: false, anchor: 'start' });
  ITEMS.forEach((it, i) => { if (t > 2.4 + i * .7) rec += txt(40, 250 + i * 80, it[0], { size: 30, color: '#333', shadow: false, anchor: 'start' }) + txt(480, 250 + i * 80, it[1], { size: 30, color: '#7a5a10', shadow: false, anchor: 'end' }); });
  rec += `<rect x="40" y="560" width="440" height="3" fill="#bbb"/>` + txt(40, 620, '受け取り：テストのとき', { size: 30, color: '#333', shadow: false, anchor: 'start' }) + '</g>';
  const st = clamp((t - 6.4) / .25), sc = 1.6 - .6 * st;
  const stamp = t > 6.4 ? `<g transform="translate(${CX + 120},560) rotate(-14) scale(${sc})" opacity="${st}"><rect x="-190" y="-70" width="380" height="140" rx="12" fill="none" stroke="#c43a3a" stroke-width="10"/>${txt(0, 22, '前払い済み', { size: 66, color: '#c43a3a', shadow: false, serif: true })}</g>` : '';
  return R([{ at: 0, slide: 0, f: () => rec + stamp }], t); }, 0, { enter: 'fade', zoom: 0 });
// 2 「努力しだい」の吹き出しに、ひびが入る
SC[2] = K((t) => { const cr = clamp((t - 5.6) / .8);
  const crack = cr > 0 ? `<path d="M${CX - 20},300 L${CX + 10},360 L${CX - 30},420 L${CX + 20},480 L${CX - 10},560" stroke="#1b1a20" stroke-width="8" fill="none" stroke-dasharray="400" stroke-dashoffset="${400 * (1 - cr)}"/>` : '';
  return R([
    { at: .2, slide: 0, f: (lt) => `<g transform="translate(${CX},430) scale(${pop(lt / .4)})"><rect x="-420" y="-140" width="840" height="280" rx="60" fill="#efeae0"/><path d="M-60,138 L-110,230 L30,138Z" fill="#efeae0"/>${txt(0, 30, '勉強は、努力しだい', { size: 76, color: '#222', shadow: false, serif: true })}</g>` + crack },
    { at: 1.2, f: () => txt(CX, 780, '子どものころ、何度も言われてきた言葉', { size: 40, color: C.dim }) },
    { at: 6.6, f: () => txt(CX, 880, '国の調査の数字を並べると…', { size: 48, color: Y, serif: true }) },
  ], t); }, 0, { enter: 'fade', zoom: 0 });
// 3 テスト用紙と保護者アンケート → 出典カード → 年収メーターと点数メーターが線でつながる
const paper = (x, y, title, rows, rot) => `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="-170" y="-220" width="340" height="440" rx="10" fill="#efeae0"/>${txt(0, -160, title, { size: 32, color: '#222', shadow: false })}${[...Array(rows)].map((_, i) => `<rect x="-130" y="${-110 + i * 60}" width="${200 + (i % 3) * 20}" height="14" rx="7" fill="#c9c2b4"/>`).join('')}</g>`;
const meter = (x, y, label, v, col) => `<g transform="translate(${x},${y})"><path d="M-130,0 A130,130 0 0 1 130,0" stroke="#3a3842" stroke-width="30" fill="none"/><path d="M-130,0 A130,130 0 0 1 ${(130 * Math.cos(Math.PI * (1 - v))).toFixed(1)},${(-130 * Math.sin(Math.PI * (1 - v))).toFixed(1)}" stroke="${col}" stroke-width="30" fill="none"/>${txt(0, 60, label, { size: 36, color: col })}</g>`;
SC[3] = K((t) => { const w = .5 + .45 * Math.sin(t * 1.3);
  return R([
    { at: .2, slide: 0, f: (lt) => paper(420, 520, '全国学力テスト', 6, -5) + (lt > 1 ? txt(420, 800, '小6・中3', { size: 34, color: C.dim }) : '') },
    { at: 2.4, slide: 0, f: () => paper(820, 540, '保護者アンケート', 6, 4) + txt(820, 820, '何年かに一度', { size: 34, color: C.dim }) },
    { at: 6.0, f: () => card(1120, 260, 700, 340, { fill: 'rgba(20,24,36,.95)' }) + txt(1160, 330, '全国学力・学習状況調査', { size: 40, color: Y, anchor: 'start' })
        + [['実施', '文部科学省'], ['聞くこと', '家の年収・親の学歴'], ['規模', '保護者 約10万人']].map((r, i) => txt(1160, 410 + i * 64, r[0], { size: 30, color: C.dim, anchor: 'start' }) + txt(1300, 410 + i * 64, r[1], { size: 32, anchor: 'start' })).join('') },
    { at: 11.0, slide: 0, f: (lt) => meter(1260, 720, '家の年収', w, M) + meter(1680, 720, '子どもの点数', w * .9 + .05, F) + `<path d="M1390,700 L1550,700" stroke="${Y}" stroke-width="5" stroke-dasharray="${160 * clamp(lt / .8)} 400"/>` },
    { at: 14.5, f: () => txt(1470, 890, '並べてみると？', { size: 46, color: Y, serif: true }) },
    ref(SR1),
  ], t); }, 0, { enter: 'fade', zoom: 0 });
export const SCENES = SC;
