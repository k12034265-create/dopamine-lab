// 14 初任給は過去最高なのに — 名前を付けた言葉：「額面マジック」
import { stamp, C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, loadMaps, run, kami, icon, hbars, vbars, donut, phone, paper, timeline } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const Y = C.gold, RED = '#e0453a', BLU = '#6fb6ff', CX = 960, DIM = C.dim, GRN = '#9fe0b0', INK = '#2a2420';
const PEN = '#ff8a3d', HLT = '#8fc8ff', EMP = '#9fe0b0', TAX = '#c9a0ff', RES = '#e8c07a', KAI = '#ff9ab8';
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', '第5章', 'まとめ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, enter: 'fade', zoom: 0, ...o });
const R = (els, t) => { const rf = els.filter(e => e.ref), ot = els.filter(e => !e.ref); return run([...rf, ...ot].map(e => e.f ? e : { ...e, f: () => '' }), t); };
const ref = (s) => ({ at: .6, ref: true, f: () => note(1880, 58, s, 'end') });
const S1 = '厚生労働省 令和7年賃金構造基本統計調査', S2 = '厚生労働省 2025年国民生活基礎調査', S3 = '大和総研（2025年10月）', S4 = '厚生労働省 厚生年金保険料率', S5 = '財務省 国民負担率の推移',
  S6 = 'マイナビニュース（2023）試算', S7 = '厚生労働省 毎月勤労統計調査（2025年分）', S9 = '日本学生支援機構 学生生活調査', S10 = '労働者福祉中央協議会（2024）', S13 = '農林水産省（総務省 消費者物価指数）',
  S14 = '日本学生支援機構 平均貸与額', S15 = '日本学生支援機構 返還例', S16 = '大和総研（2026年6月）', S17 = '財務省 国民負担率の国際比較', S18 = '時事通信（2026）', S19 = '日本学生支援機構 データ集（令和7年度）',
  S20 = '日本学生支援機構 給付奨学金', S21 = '文部科学省 所得連動返還方式', S22 = '全国健康保険協会 保険料率の推移', S23 = '財務省 消費税の税率の推移', S12 = '共同通信（2026）';
const cap = (y, s0, col = Y, size = 46) => `<g>${card(CX - s0.length * size * .55 - 40, y - size - 18, s0.length * size * 1.1 + 80, size * 1.9, { fill: 'rgba(18,16,24,.86)', stroke: col })}${txt(CX, y + 4, s0, { size, color: col, serif: true })}</g>`;
const big = (y, s0, col = Y, size = 96) => txt(CX, y, s0, { size, color: col, serif: true });
const P = (x, y, s, c, k = 'm') => person(x, y, s, c, k);
const chapTitle = (t, no, title, col = Y) => R([{ at: 0, slide: 0, f: () => txt(960, 470, no, { size: 44, color: C.o }) + txt(960, 600, title, { size: 92, color: col, serif: true }) }], t);
const cross = (x, y, s, a = 1, c = RED) => `<g opacity="${a}" transform="translate(${x},${y}) scale(${s})"><path d="M-50,-50 L50,50 M50,-50 L-50,50" stroke="${c}" stroke-width="16" stroke-linecap="round"/></g>`;
const circ = (x, y, s, a = 1, c = GRN) => `<g opacity="${a}" transform="translate(${x},${y}) scale(${s})"><circle r="56" fill="none" stroke="${c}" stroke-width="14"/></g>`;
const yen = (n) => Math.round(n).toLocaleString('en-US');
// 給与明細（紙）。rows:[{l,v,c,a,hl}]
const slip = (x, y, w, rows, o = {}) => { const n = o.n ?? rows.length, h = o.h || (330 + n * 62);
  let s = `<rect x="0" y="0" width="${w}" height="74" rx="6" fill="#d9cfb8"/>` + txt(w / 2, 50, o.title || '給与明細', { size: 34, color: INK, shadow: false, serif: true });
  s += `<g opacity="${o.grossA ?? 1}">` + (o.grossHl ? `<rect x="20" y="98" width="${w - 40}" height="70" rx="8" fill="${Y}" opacity="${.35 * o.grossHl}"/>` : '') + txt(40, 146, '総支給額', { size: 32, color: INK, shadow: false, anchor: 'start', weight: 600 }) + txt(w - 40, 150, o.gross || '262,300円', { size: o.gs || 50, color: INK, shadow: false, anchor: 'end', serif: true }) + '</g>';
  s += `<path d="M30,186 H${w - 30}" stroke="#bfb4a0" stroke-width="3"/>`;
  rows.forEach((r, i) => { const a = r.a ?? 1; if (a <= 0) return; const yy = 240 + i * 62; s += `<g opacity="${a}">` + (r.hl ? `<rect x="20" y="${yy - 44}" width="${w - 40}" height="60" rx="8" fill="${r.hl}" opacity=".35"/>` : '') + txt(50, yy, r.l, { size: 30, color: INK, shadow: false, anchor: 'start', weight: 600 }) + txt(w - 40, yy, r.v, { size: 32, color: r.c || '#b0352c', shadow: false, anchor: 'end' }) + '</g>'; });
  if (o.net != null) { const yy = 240 + n * 62 + 30; s += `<g opacity="${o.netA ?? 1}"><path d="M30,${yy - 40} H${w - 30}" stroke="${INK}" stroke-width="3"/>` + txt(40, yy + 20, '差引支給額', { size: 32, color: INK, shadow: false, anchor: 'start' }) + txt(w - 40, yy + 28, o.net, { size: 52, color: '#1d6b3a', shadow: false, anchor: 'end', serif: true }) + '</g>'; }
  return paper(x, y, w, h, s, { rot: o.rot || 0, fill: o.fill }); };
const ROWS1 = [{ l: '健康保険', v: '−13,115' }, { l: '厚生年金', v: '−23,790' }, { l: '雇用保険', v: '−1,443' }, { l: '所得税', v: '−5,170' }];
const tag = (x, y, s0, col, a = 1) => `<g opacity="${a}">${card(x - s0.length * 22 - 26, y - 44, s0.length * 44 + 52, 66, { fill: 'rgba(18,16,24,.9)', stroke: col, r: 33 })}${txt(x, y + 2, s0, { size: 38, color: col })}</g>`;
// 財布
const wallet = (x, y, s, inner = '', col = '#8a5a3a') => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-150" y="-95" width="300" height="190" rx="26" fill="${col}"/><rect x="-150" y="-95" width="300" height="60" rx="26" fill="#6e452c"/><rect x="60" y="-20" width="110" height="70" rx="18" fill="#6e452c"/><circle cx="100" cy="15" r="12" fill="${Y}"/>${inner}</g>`;
const coin = (x, y, r, a = 1) => `<g opacity="${a}"><circle cx="${x}" cy="${y}" r="${r}" fill="${Y}" stroke="#b8902a" stroke-width="${r * .12}"/>${txt(x, y + r * .36, '¥', { size: r, color: '#8a6410', shadow: false })}</g>`;
// 縦の比較棒（2本1組）
const pairBar = (x, base, h1, h2, c1, c2, l1, l2, lab, lt, sc = 1) => { const p = easeOut(clamp(lt / 1)); return `<rect x="${x}" y="${base - h1 * p * sc}" width="90" height="${h1 * p * sc}" rx="6" fill="${c1}"/><rect x="${x + 110}" y="${base - h2 * p * sc}" width="90" height="${h2 * p * sc}" rx="6" fill="${c2}"/>` + (p > .5 ? txt(x + 45, base - h1 * sc - 18, l1, { size: 30, color: DIM }) + txt(x + 155, base - h2 * sc - 18, l2, { size: 34, color: c2 }) : '') + txt(x + 100, base + 56, lab, { size: 36, weight: 600 }); };

// ===== 45年の折れ線（形はイメージ。大和総研の推計の傾向をなぞったもの） =====
const X45 = (y) => 300 + (y - 1980) / 44 * 1320, V45 = (v) => 800 - (v - 40) * 8;
const PT45 = [[1980, 52], [1984, 60], [1988, 69], [1992, 79], [1996, 86], [2000, 85.5], [2005, 84.5], [2010, 84], [2015, 85], [2017, 90], [2019, 96], [2021, 94.5], [2022, 92.5], [2024, 89]];
const PT3034 = [[1980, 62], [1984, 69], [1988, 77], [1992, 86], [1996, 92], [2000, 90], [2005, 87], [2010, 85], [2015, 84.5], [2017, 87.5], [2019, 89.5], [2022, 87.5], [2024, 85.5]];
const PTH = [[1980, 46], [1988, 58], [1996, 70], [2005, 73], [2015, 78], [2019, 87], [2022, 90], [2024, 95]];
const lineTo = (pts, y0, y1, col, w = 8, extra = '') => { const out = []; for (let i = 0; i < pts.length; i++) { const [y, v] = pts[i]; if (y < y0) { const n = pts[i + 1]; if (n && n[0] > y0) { const k = (y0 - y) / (n[0] - y); out.push([y0, v + (n[1] - v) * k]); } continue; } if (y <= y1) out.push([y, v]); else { const p = pts[i - 1]; if (p && p[0] < y1) { const k = (y1 - p[0]) / (y - p[0]); out.push([y1, p[1] + (v - p[1]) * k]); } break; } }
  if (out.length < 2) return ''; return `<path d="M${out.map(([y, v]) => X45(y).toFixed(1) + ',' + V45(v).toFixed(1)).join(' L')}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`; };
const valAt = (pts, y) => { for (let i = 1; i < pts.length; i++) if (pts[i][0] >= y) { const [a, va] = pts[i - 1], [b, vb] = pts[i]; return va + (vb - va) * (y - a) / (b - a); } return pts[pts.length - 1][1]; };
const axes45 = (o = {}) => `<path d="M300,${V45(40)} H1640 M300,${V45(40)} V300" stroke="${C.gray}" stroke-width="4"/>` + (o.years || [1980, 1996, 2015, 2019, 2024]).map(y => `<path d="M${X45(y)},${V45(40)} v14" stroke="${C.gray}" stroke-width="4"/>` + txt(X45(y), V45(40) + 56, y + '年', { size: 30, color: DIM })).join('') + txt(280, 330, o.ylab || '本当に使えるお金', { size: 28, color: DIM, anchor: 'start' }) + note(1640, 912, o.note || '※線の形はイメージ（大和総研の推計の傾向をなぞったもの）', 'end');
const star = (x, y, s, col = Y) => `<path transform="translate(${x},${y}) scale(${s})" d="M0,-50 L12,-16 L48,-15 L19,7 L29,42 L0,21 L-29,42 L-19,7 L-48,-15 L-12,-16 Z" fill="${col}"/>`;
const dot = (pts, y, col, r = 12) => `<circle cx="${X45(y)}" cy="${V45(valAt(pts, y))}" r="${r}" fill="${col}"/>`;
const hat = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="0" rx="230" ry="44" fill="#1a1820" stroke="#4a4450" stroke-width="4"/><path d="M-140,-10 L-130,-300 Q0,-330 130,-300 L140,-10 Z" fill="#1a1820" stroke="#4a4450" stroke-width="4"/><rect x="-136" y="-90" width="272" height="44" fill="${RED}"/></g>`;

const SC = [];
SC[0] = K(() => '', 0);
// A：26万2,300円 → 21万8,000円、4万4,000円が消える
SC[1] = K((t) => { const NX = 1330;
  const up = easeOut(clamp((t - 1.9) / 1.5)), dn = ease(clamp((t - 7.2) / 1.5)), after = t >= 5.3;
  const val = t < 7.2 ? 262300 * up : 262300 - 44300 * dn, col = dn > .5 ? GRN : Y;
  const rows = ROWS1.map((r, i) => ({ ...r, a: clamp((t - 5.4 - i * .35) / .3) }));
  let coins = ''; if (t > 9.4) for (let i = 0; i < 9; i++) { const k = clamp((t - 9.4 - i * .12) / 1.6); if (k <= 0 || k >= 1) continue; coins += coin(NX - 260 + i * 62 + 40 * k, 760 - 150 * k - 30 * Math.sin(i), 26, (1 - k) * .95); }
  return R([
    { at: 0, slide: 0, f: () => slip(170, 130, 640, rows, { grossHl: clamp((t - 1.9) / .5) * (1 - clamp((t - 6.2) / .6)), net: '218,782円', netA: clamp((t - 7.4) / .4) }) },
    { at: .2, f: () => txt(NX, 250, after ? '口座に届くのは' : '大卒の初任給（平均）', { size: 46, color: after ? GRN : DIM }) },
    { at: 1.9, slide: 0, f: () => (dn > 0 ? `<g opacity="${.75 * clamp((t - 7.2) / .4)}">` + txt(NX, 350, '262,300円', { size: 54, color: DIM, serif: true }) + `<path d="M${NX - 170},334 h340" stroke="${RED}" stroke-width="6"/></g>` : '') + txt(NX, 520, yen(val) + '円', { size: 150, color: col, serif: true }) },
    { at: 4.1, out: 6.9, slide: 0, f: (lt) => stamp(NX, 700, 88, '過去最高', lt) },
    { at: 9.4, slide: 0, f: (lt) => `<g transform="translate(${NX + Math.sin(lt * 40) * 10 * Math.max(0, 1 - lt / .6)},700) scale(${pop(clamp(lt / .4))})">` + card(-330, -78, 660, 140, { fill: 'rgba(18,16,24,.92)', stroke: RED, sw: 5 }) + txt(0, 28, '−44,000円', { size: 96, color: RED, serif: true }) + '</g>' },
    { at: 10.9, f: () => cap(868, '届く前に、消えている', RED, 46) }, ref(S1)], t); }, 0);
// B：「どうせ税金のせい」→ 容疑者の列、税金はシロ
SC[2] = K((t) => { const XS = [330, 757, 1183, 1610], LAB = ['税金', '？', '？', '？'], COL = [TAX, PEN, HLT, KAI];
  const line = () => { let s = ''; for (let k = 0; k < 6; k++) s += `<path d="M110,${330 + k * 76} H1810" stroke="rgba(255,255,255,${k % 2 ? .07 : .13})" stroke-width="3"/>` + txt(96, 340 + k * 76, String(190 - k * 10), { size: 22, color: DIM, anchor: 'end' });
    XS.forEach((x, i) => { const k = easeOut(clamp((t - 4.35 - i * .12) / .45)), x0 = t - 5.62, dim = i === 0 && x0 > 0 ? 1 - .55 * clamp(x0 / .4) : 1;
      s += `<g opacity="${k * dim}" transform="translate(0,${(1 - k) * 60})">` + card(x - 150, 330, 300, 400, { stroke: COL[i], fill: 'rgba(18,16,24,.94)', sw: 5 }) + P(x, 520, 92, COL[i]) + txt(x, 695, LAB[i], { size: 62, color: COL[i], serif: true }) + '</g>'; });
    return s; };
  return R([
    { at: 0, out: 4.0, slide: 0, f: () => P(470, 700, 140, GRN) + `<rect x="290" y="862" width="360" height="12" rx="6" fill="#4a4450"/>` },
    { at: .15, out: 4.0, f: (lt) => `<g transform="translate(1160,470) scale(${pop(clamp(lt / .4))}) translate(-1160,-470)"><path d="M720,330 h880 a40,40 0 0 1 40,40 v190 a40,40 0 0 1 -40,40 h-700 l-130,90 l40,-90 h-90 a40,40 0 0 1 -40,-40 v-190 a40,40 0 0 1 40,-40 Z" fill="rgba(18,16,24,.92)" stroke="${C.fg}" stroke-width="5"/>${txt(1160, 492, '「どうせ税金が高いせいだろ」', { size: 60, serif: true })}</g>` },
    { at: 1.95, out: 4.0, f: () => cap(200, 'そう思った人ほど、最後まで', Y, 46) },
    { at: 4.3, slide: 0, f: () => head('消えた4万4,000円の「犯人」は？', { y: 230, size: 54 }) + line() },
    { at: 5.62, slide: 0, f: (lt) => `<g transform="translate(330,520) scale(${1 + (1 - easeOut(clamp(lt / .25))) * 1.2})">${cross(0, 0, 2.3, clamp(lt / .12))}</g>` },
    { at: 5.9, f: () => cap(868, '犯人は、税金ではない', RED, 50) }], t); }, 0);
// C：今日ネタバレするもの3つ
SC[3] = K((t) => { const cd = (x, at, col, title1, title2, art) => ({ at, slide: 70, f: (lt) => `<g transform="translate(0,${Math.sin(t * 1.5 + x) * 5})">` + card(x, 250, 520, 500, { stroke: col, fill: 'rgba(18,16,24,.9)', sw: 4 }) + art(lt) + txt(x + 260, 640, title1, { size: 44, color: col, serif: true }) + txt(x + 260, 704, title2, { size: 44, color: col, serif: true }) + '</g>' });
  const a1 = (lt) => { let s = ''; for (let i = 0; i < 5; i++) { const k = (lt * .55 + i * .2) % 1; s += coin(250 + k * 250, 430 - Math.sin(k * Math.PI) * 60, 24, k < .85 ? 1 : (1 - k) / .15); } return s + txt(545, 470, '？', { size: 130, color: RED, serif: true }); };
  const a2 = () => `<g transform="translate(960,520) scale(.52)">` + hat(0, 0, 1) + '</g>' + `<g transform="translate(960,${330 - 14 * Math.sin(t * 2)}) rotate(-8)">` + card(-58, -70, 116, 140, { stroke: Y, fill: 'rgba(18,16,24,.96)', sw: 4 }) + txt(0, 24, '？', { size: 70, color: Y, serif: true }) + '</g>';
  const a3 = (lt) => { const pts = [[0, 150], [70, 128], [140, 96], [210, 72], [280, 70], [350, 60], [400, 30], [440, 52]], n = 1 + (pts.length - 1) * easeOut(clamp(lt / 1.2)), sh = pts.slice(0, Math.ceil(n));
    return `<g transform="translate(1320,340)"><path d="M0,170 H450 M0,170 V0" stroke="${C.gray}" stroke-width="4"/><path d="M${sh.map(p => p.join(',')).join(' L')}" stroke="${GRN}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` + txt(0, 214, '1980', { size: 26, color: DIM }) + txt(440, 214, '2024', { size: 26, color: DIM }) + '</g>'; };
  return R([{ at: 0, f: () => head('今日のネタバレ', { y: 180, size: 56 }) },
    cd(120, .2, RED, '消えた4万4,000円の', '行き先', a1), cd(700, 2.4, Y, '「過去最高」に隠れた', '手品のタネ', a2), cd(1280, 5.4, GRN, '45年分の数字で', '答え合わせ', a3),
    { at: 6.3, f: () => cap(868, '国の統計で、全部ネタバレする', Y, 46) }], t); }, 0);
export const SCENES = SC;
