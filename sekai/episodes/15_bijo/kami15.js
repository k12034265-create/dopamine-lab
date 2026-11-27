// 15 なぜ美女の隣には「ふつうの男」がいるのか？ — 名前を付けた言葉：「自分だけの値札」
import { C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, loadMaps, run, kami, icon, hbars, vbars, donut, phone, paper, timeline, counter } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const Y = C.gold, RED = '#e0453a', BLU = '#6fb6ff', CX = 960, DIM = C.dim, GRN = '#9fe0b0', INK = '#2a2420';
const PNK = '#ff8fb1', MAN = '#7fb8ff', GRY = '#8a8490', SOB = '#c9a0ff', NEF = '#ffc24a';   // 女・男・ふつう・相場・値札
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', '第5章', 'まとめ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, enter: 'fade', zoom: 0, ...o });
const R = (els, t) => { const rf = els.filter(e => e.ref), ot = els.filter(e => !e.ref); return run([...rf, ...ot].map(e => e.f ? e : { ...e, f: () => '' }), t); };
const ref = (s) => ({ at: .6, ref: true, f: () => note(1880, 58, s, 'end') });
const S1 = '国立社会保障・人口問題研究所 第17回出生動向基本調査（2025）', S2 = 'Walster ほか（1966）', S3 = 'OkCupid（2009）', S4 = 'McClintock（2014）', S5 = 'Gullickson（2017）', S6 = 'McClintock（2017）',
  S7 = 'Eastwick & Finkel（2008）', S8 = 'Hunt, Eastwick & Finkel（2015）', S9 = 'Eastwick & Hunt（2014）', S10 = 'McNulty, Neff & Karney（2008）', S11 = 'Meltzer ほか（2014）';
const cap = (y, s0, col = Y, size = 46) => `<g>${card(CX - s0.length * size * .55 - 40, y - size - 18, s0.length * size * 1.1 + 80, size * 1.9, { fill: 'rgba(18,16,24,.86)', stroke: col })}${txt(CX, y + 4, s0, { size, color: col, serif: true })}</g>`;
const P = (x, y, s, c, k = 'm') => person(x, y, s, c, k);
const chapTitle = (t, no, title, col = Y) => R([{ at: 0, slide: 0, f: () => txt(960, 470, no, { size: 44, color: C.o }) + txt(960, 600, title, { size: 92, color: col, serif: true }) }], t);
const tag = (x, y, s0, col, a = 1, size = 38) => `<g opacity="${a}">${card(x - s0.length * size * .58 - 26, y - size * 1.16, s0.length * size * 1.16 + 52, size * 1.74, { fill: 'rgba(18,16,24,.9)', stroke: col, r: size * .87 })}${txt(x, y + 2, s0, { size, color: col })}</g>`;
const floor = (x1, x2, y) => `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="10" rx="5" fill="#4a4450"/>`;
// 値札（ひもつき）
const ptag = (x, y, s0, col, rot = 0, sc = 1) => { const w = s0.length * 44 + 60; return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sc})"><path d="M0,-70 L0,-20" stroke="${DIM}" stroke-width="3"/><path d="M${-w / 2 - 20},-20 h${w} l46,50 l-46,50 h${-w} Z" fill="rgba(18,16,24,.92)" stroke="${col}" stroke-width="5"/><circle cx="${w / 2 + 2}" cy="30" r="9" fill="none" stroke="${col}" stroke-width="4"/>${txt(-20, 44, s0, { size: 40, color: col, serif: true })}</g>`; };
const qstamp = (x, y, k, col = Y, r = 95) => `<g transform="translate(${x},${y}) scale(${k}) rotate(-10)"><circle r="${r}" fill="${col}"/>${txt(0, r * .44, '？', { size: r * 1.37, color: '#1b1820', shadow: false, serif: true })}</g>`;
const SC = [];
const N = 87;
for (let i = 0; i < N; i++) SC[i] = K(() => '', i < 8 ? 0 : i < 23 ? 1 : i < 41 ? 2 : i < 50 ? 3 : i < 72 ? 4 : i < 81 ? 5 : 6);

// ===== プロローグ =====
// 0 実写：街を歩くカップルの後ろ姿 / 1 実写：腕時計（お金） / 3 実写：交差点の人波
SC[2] = K((t) => R([{ at: 0, f: () => head('結婚相手の「経済力」を重視・考慮する', { y: 180, size: 50 }) + txt(960, 250, '18〜34歳の未婚女性', { size: 36, color: DIM }) },
  { at: .2, slide: 0, f: () => P(560, 600, 130, PNK, 'f') + floor(400, 720, 760) },
  { at: .5, slide: 0, f: (lt) => donut(1180, 560, 210, [{ v: 90.3, c: PNK }, { v: 9.7, c: null }], ease(clamp(lt / 2.4)), { sw: 64 }) + txt(1180, 600, (90.3 * easeOut(clamp(lt / 2.4))).toFixed(1) + '%', { size: 96, color: Y, serif: true }) },
  { at: 5.6, f: () => cap(905, '10人に9人以上', Y, 46) }, ref(S1)], t), 0);
SC[4] = K((t) => { const k = pop(clamp((t - 4.4) / .45)), sw = Math.sin(t * 1.6) * 5;
  return R([{ at: 0, slide: 0, f: () => P(820, 640, 120, PNK, 'f') + P(1100, 640, 124, GRY) + floor(640, 1280, 790) },
    { at: .8, f: () => ptag(960, 330 + 0, 'お金目当て？', Y, sw, 1.25) },
    { at: 4.4, slide: 0, f: () => qstamp(1250, 300, k, RED, 80) },
    { at: 1.6, f: () => cap(880, '見終わるころ、こう思わなくなる', Y, 44) }], t); }, 0);
SC[5] = K((t) => { const g = (x, kind, col, s0, tx, at) => { const k = easeOut(clamp((t - at) / .5)); return P(x, 680, 110, col, kind) + `<g opacity="${k}" transform="translate(${tx},${340 + (1 - k) * 30})"><path d="M-170,-70 h340 a30,30 0 0 1 30,30 v90 a30,30 0 0 1 -30,30 h-140 l${tx < 960 ? 60 : -60},70 l${tx < 960 ? -10 : 10},-70 h-210 a30,30 0 0 1 -30,-30 v-90 a30,30 0 0 1 30,-30 Z" fill="rgba(18,16,24,.92)" stroke="${col}" stroke-width="5"/>${txt(0, 18, s0, { size: 52, color: col, serif: true })}</g>`; };
  const dk = ease(clamp((t - 3.2) / 2.2));
  return R([{ at: 0, slide: 0, f: () => floor(300, 1620, 830) + g(620, 'm', MAN, '見た目！', 520, .4) + g(1300, 'f', PNK, '年収！', 1400, 1.0) },
    { at: 3.2, slide: 0, f: () => `<g opacity="${dk}">` + arrow(620, 880, 620 - 380 * dk, 880, MAN, 1, 10) + arrow(1300, 880, 1300 + 380 * dk, 880, PNK, 1, 10) + txt(960, 895, '実際は？', { size: 40, color: Y }) + '</g>' + '' },
    { at: 1.8, f: () => cap(185, '口で言う好み　と　実際の行動', Y, 44) }], t); }, 0);
SC[6] = K((t) => { const k = clamp(t / 6), HX = 960, HY = 520;
  const top = 1 - k, bot = k, sand = '#e8c07a';
  let g = `<g transform="translate(${HX},${HY})"><rect x="-150" y="-260" width="300" height="24" rx="10" fill="#8a6a4a"/><rect x="-150" y="236" width="300" height="24" rx="10" fill="#8a6a4a"/>
    <path d="M-120,-236 L120,-236 L14,-10 L14,10 L120,236 L-120,236 L-14,10 L-14,-10 Z" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.35)" stroke-width="5"/>
    <path d="M${-14 - 106 * top},${-10 - 226 * top} L${14 + 106 * top},${-10 - 226 * top} L14,-10 L-14,-10 Z" fill="${sand}"/>
    <path d="M-120,236 L120,236 L${120 - 106 * (1 - bot) * 0},${236 - 150 * bot} Q0,${236 - 200 * bot} ${-120},${236 - 150 * bot} Z" fill="${sand}"/>
    ${k < .98 ? `<rect x="-3" y="-10" width="6" height="246" fill="${sand}" opacity=".9"/>` : ''}</g>`;
  const d = 420 * easeOut(k);
  g += floor(200, 1720, 832) + P(260 + d, 680, 100, GRY) + P(1660 - d, 680, 96, PNK, 'f');
  return R([{ at: 0, slide: 0, f: () => g }, { at: 1.4, f: () => cap(185, 'ある「時間」の仕組み', Y, 46) }], t); }, 0);
const TOC = [['①', '似た者同士'], ['②', '美人とお金'], ['③', '口で言う好み'], ['④', '時間と相場'], ['⑤', 'その後の2人']];
SC[7] = K((t) => R([{ at: 0, f: () => head('今日のネタバレ', { y: 220, size: 58 }) }, ...TOC.map(([n, s0], i) => ({ at: .3 + i * .45, dx: 140, slide: 0, f: () => `<g transform="translate(0,${Math.sin(t * 1.6 + i) * 6})">` + card(110 + i * 345, 360, 315, 300, { stroke: i === 3 ? Y : 'rgba(255,255,255,.14)' }) + txt(267 + i * 345, 470, n, { size: 66, color: Y, serif: true }) + txt(267 + i * 345, 580, s0, { size: 36 }) + '</g>' })),
  { at: 3.4, f: () => cap(860, '5つの研究 × 国の調査', Y, 44) }], t), 0);


// ===== 共通の部品 =====
const stars = (x, y, n, tot = 5, col = Y, sz = 22) => { let g = ''; for (let i = 0; i < tot; i++) g += `<path transform="translate(${x + i * sz * 2.3},${y}) scale(${sz / 50})" d="M0,-50 L12,-16 L48,-15 L19,7 L29,42 L0,21 L-29,42 L-19,7 L-48,-15 L-12,-16 Z" fill="${i < n ? col : 'rgba(255,255,255,.15)'}"/>`; return g; };
const coins = (x, y, n, tot = 5, sz = 20) => { let g = ''; for (let i = 0; i < tot; i++) g += `<circle cx="${x + i * sz * 2.3}" cy="${y}" r="${sz}" fill="${i < n ? Y : 'rgba(255,255,255,.12)'}" stroke="${i < n ? '#b8902a' : 'none'}" stroke-width="3"/>` + (i < n ? txt(x + i * sz * 2.3, y + sz * .38, '¥', { size: sz * 1.05, color: '#8a6410', shadow: false }) : ''); return g; };
const scoreTag = (x, y, v, col, a = 1) => `<g opacity="${a}"><rect x="${x - 34}" y="${y - 34}" width="68" height="56" rx="12" fill="rgba(18,16,24,.92)" stroke="${col}" stroke-width="4"/>${txt(x, y + 6, String(v), { size: 36, color: col, serif: true })}</g>`;
const bub = (x, y, s0, col, a = 1, size = 40, spiky = false) => { const w = s0.length * size * 1.05 + 60, h = size * 1.9; return `<g opacity="${a}" transform="translate(${x},${y})">` + (spiky ? `<path d="M${-w / 2},${-h / 2} l${w * .25},10 l${w * .25},-16 l${w * .25},14 l${w * .25},-8 v${h} l${-w * .3},-10 l-20,40 l-10,-38 l${-w * .7 + 30},6 Z" fill="rgba(40,14,14,.94)" stroke="${col}" stroke-width="5"/>` : `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="rgba(18,24,20,.94)" stroke="${col}" stroke-width="5"/>`) + txt(0, size * .36, s0, { size, color: col }) + '</g>'; };
const env = (x, y, s, col = '#f1e8d4') => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-40" y="-26" width="80" height="52" rx="6" fill="${col}"/><path d="M-40,-26 L0,6 L40,-26" stroke="#b8ad98" stroke-width="4" fill="none"/></g>`;
const calendar = (x, y, s0, s1, col = Y, sc = 1) => `<g transform="translate(${x},${y}) scale(${sc})"><rect x="-120" y="-120" width="240" height="240" rx="18" fill="#f1e8d4"/><rect x="-120" y="-120" width="240" height="64" rx="18" fill="${RED}"/><rect x="-120" y="-80" width="240" height="24" fill="${RED}"/>${txt(0, -74, s0, { size: 34, color: '#fff', shadow: false })}${txt(0, 60, s1, { size: 72, color: INK, shadow: false, serif: true })}</g>`;
// 分布の山（x:0..1）
const AX0 = 360, AX1 = 1560, AY = 800;
const curve = (f, col, k = 1, fill = false, hh = 420) => { let d = `M${AX0},${AY}`; const n = 80; for (let i = 0; i <= n * k; i++) { const u = i / n; d += ` L${AX0 + (AX1 - AX0) * u},${AY - f(u) * hh}`; } if (fill) d += ` L${AX0 + (AX1 - AX0) * k},${AY} Z`; return `<path d="${d}" stroke="${col}" stroke-width="${fill ? 0 : 8}" fill="${fill ? col : 'none'}" ${fill ? 'opacity=".28"' : ''} stroke-linejoin="round"/>`; };
const bell = (u) => Math.exp(-Math.pow((u - .5) / .16, 2));
const skew = (u) => Math.exp(-Math.pow((u - .27) / .14, 2)) * 1.05 + Math.exp(-Math.pow((u - .45) / .2, 2)) * .25;
const axesD = (lab) => `<path d="M${AX0},${AY} H${AX1}" stroke="${C.gray}" stroke-width="4"/><path d="M${(AX0 + AX1) / 2},${AY} v16" stroke="${C.gray}" stroke-width="4"/>` + txt(AX0, AY + 50, '低い', { size: 32, color: DIM }) + txt(AX1, AY + 50, '高い', { size: 32, color: DIM }) + txt((AX0 + AX1) / 2, AY + 50, '平均', { size: 32, color: DIM }) + txt((AX0 + AX1) / 2, AY + 100, lab, { size: 32, color: DIM });
// 散布図
const scat = (t, flat = 0) => { let g = `<path d="M460,820 H1460 M460,820 V300" stroke="${C.gray}" stroke-width="4"/>` + txt(960, 880, '男性のお金（学歴・収入）→', { size: 32, color: DIM }) + txt(420, 560, '女性の見た目 →', { size: 32, color: DIM, anchor: 'end' });
  for (let i = 0; i < 40; i++) { const r = (q) => ((Math.sin((i + 1) * q * 12.9898) * 43758.5453) % 1 + 1) % 1; const u = r(1), v = (u * .7 + r(2) * .5) * (1 - flat) + (r(2) * .8 + .1) * flat; const a = clamp((t - i * .05) / .3); g += `<circle cx="${500 + u * 920}" cy="${800 - Math.min(.98, v) * 470}" r="12" fill="${PNK}" opacity="${a * .85}"/>`; }
  const k = clamp((t - 2) / 1.2), y0 = 800 - .2 * 470 * (1 - flat) - .5 * 470 * flat, y1 = 800 - .9 * 470 * (1 - flat) - .5 * 470 * flat;
  return g + `<path d="M500,${y0} L${500 + 920 * k},${y0 + (y1 - y0) * k}" stroke="${Y}" stroke-width="8" stroke-linecap="round"/>` + note(1460, 912, '※形はイメージ', 'end'); };
const paperCard = (x, y, who, yr, claim, col, rot = 0) => paper(x, y, 520, 300, txt(260, 70, who, { size: 40, color: INK, shadow: false, serif: true }) + txt(260, 118, yr, { size: 30, color: '#6a6058', shadow: false }) + `<rect x="30" y="160" width="460" height="100" rx="12" fill="${col}" opacity=".25"/>` + txt(260, 226, claim, { size: 40, color: INK, shadow: false, serif: true }), { rot });

// ===== 第1章 =====
SC[9] = K((t) => { let g = `<rect x="260" y="330" width="380" height="420" rx="20" fill="#5a5560" stroke="#8a8490" stroke-width="5"/><rect x="300" y="370" width="300" height="140" rx="10" fill="#1b1820"/>`;
  for (let i = 0; i < 12; i++) g += `<circle cx="${320 + (i % 6) * 52}" cy="${560 + Math.floor(i / 6) * 50}" r="14" fill="${Math.sin(t * 6 + i * 1.7) > .2 ? (i % 3 ? GRN : RED) : '#3a3640'}"/>`;
  g += txt(450, 452, 'COMPUTER', { size: 34, color: GRN, shadow: false }) + `<rect x="300" y="680" width="300" height="20" rx="6" fill="#1b1820"/>` + floor(220, 700, 752);
  const sh = clamp((t - 5.6) / 2.5);
  for (let i = 0; i < 4; i++) { const k = easeOut(clamp((t - .6 - i * .7) / .8)); if (k <= 0) continue; const sw = Math.sin(sh * Math.PI * 3 + i) * 120 * Math.sin(sh * Math.PI);
    const y = 300 + i * 140; g += `<g transform="translate(${700 + 340 * k},${y})">` + card(0, 0, 190, 100, { stroke: MAN, fill: 'rgba(18,16,24,.92)' }) + P(55, 54, 26, MAN) + txt(130, 64, '男' + (i + 1), { size: 34, color: MAN }) + `<g transform="translate(${260 + sw},0)">` + card(0, 0, 190, 100, { stroke: PNK, fill: 'rgba(18,16,24,.92)' }) + P(55, 54, 26, PNK, 'f') + txt(130, 64, '女' + (4 - i), { size: 34, color: PNK }) + '</g>' + txt(225, 66, '♥', { size: 40, color: RED }) + '</g>'; }
  return R([{ at: 0, f: () => head('「コンピューター・ダンス」　新入生752人', { y: 200, size: 50 }) }, { at: 0, slide: 0, f: () => g }, { at: 6.2, f: () => cap(905, '実は、ペアはでたらめ', RED, 46) }, ref(S2)], t); }, 1);
SC[10] = K((t) => { let g = `<rect x="840" y="330" width="40" height="480" fill="#6e5a48"/><rect x="1240" y="330" width="40" height="480" fill="#6e5a48"/><rect x="840" y="310" width="440" height="40" fill="#6e5a48"/>` + txt(1060, 296, 'DANCE', { size: 40, color: Y }) + floor(200, 1720, 812);
  for (let i = 0; i < 6; i++) { const x = 260 + ((t * 120 + i * 230) % 1400); const f = i % 2; g += P(x, 660, 62, f ? PNK : MAN, f ? 'f' : 'm');
    if (x > 1060) g += scoreTag(x, 520, [6, 8, 4, 7, 5, 9][i], Y, clamp((x - 1060) / 60)); }
  g += P(1500, 660, 70, '#c8c4bc') + paper(1560, 520, 120, 150, txt(60, 60, '点数', { size: 30, color: INK, shadow: false }) + `<path d="M20,90 h80 M20,120 h60" stroke="#8a8070" stroke-width="5"/>`);
  return R([{ at: 0, slide: 0, f: () => g }, { at: 1.2, f: () => cap(200, '入り口で、見た目をこっそり採点', Y, 44) }, ref(S2)], t); }, 1);
SC[12] = K((t) => R([{ at: 0, f: () => head('相手を「気に入った」かを決めたもの', { y: 200, size: 50 }) }, { at: .4, slide: 0, f: (lt) => hbars(560, 320, 1000, [{ label: '相手の見た目', v: 92, txt: 'ほぼこれだけ', c: PNK }, { label: '性格', v: 5, txt: '', c: GRY }, { label: '頭のよさ', v: 4, txt: '', c: GRY }], 100, lt, { bh: 100, gap: 60, stag: 1.2, ls: 40 }) },
  { at: 5.2, f: () => cap(905, '性格や頭のよさは、ほとんど関係なし', Y, 44) }, { at: 0, f: () => note(1640, 860, '※形はイメージ', 'end') }, ref(S2)], t), 1);
SC[13] = K((t) => { const cols = [['自分の見た目：低い', 420], ['ふつう', 760], ['高い', 1100]]; let g = '';
  cols.forEach(([l, x], j) => { g += txt(x, 300, l, { size: 34, color: DIM }); for (let i = 0; i < 3; i++) g += P(x + (i - 1) * 90, 470 + i * 130, 40, j === 2 ? MAN : j === 1 ? '#a8b8d0' : GRY) + floor(x + (i - 1) * 90 - 50, x + (i - 1) * 90 + 50, 470 + i * 130 + 48); });
  g += floor(1360, 1700, 720) + P(1530, 570, 90, PNK, 'f') + `<g filter="url(#glow)">${stars(1440, 330, 5, 5, Y, 18)}</g>` + txt(1530, 800, '見た目のいい相手', { size: 34, color: PNK });
  const k = easeOut(clamp((t - 2) / 2));
  cols.forEach(([l, x], j) => { for (let i = 0; i < 3; i++) { const y0 = 450 + i * 130; g += arrow(x + 120, y0, x + 120 + (1360 - x - 120) * k, y0 + (560 - y0) * k, Y, 1, 4); } });
  return R([{ at: 0, slide: 0, f: () => g }, { at: 7.2, f: () => cap(905, '「自分と釣り合う相手を選ぶ」は外れた', RED, 44) }, ref(S2)], t); }, 1);
SC[15] = K((t) => { const pairs = [[8, 8], [5, 5], [3, 4], [7, 6]]; let g = floor(180, 1740, 760);
  pairs.forEach(([a, b], i) => { const x = 330 + i * 420, k = clamp((t - .5 - i * .7) / .4); g += P(x - 60, 610, 56, PNK, 'f') + P(x + 60, 610, 58, MAN) + scoreTag(x - 60, 440, a, PNK, k) + scoreTag(x + 60, 440, b, MAN, k) + (k >= 1 ? `<path d="M${x - 70},${390} q70,-40 140,0" stroke="${Y}" stroke-width="4" fill="none" opacity="${clamp((t - 3.5) / .5)}"/>` : ''); });
  return R([{ at: 0, slide: 0, f: () => g }, { at: 4.2, f: () => cap(200, '2人の見た目は、似た者同士でそろう', Y, 46) }, { at: 0, f: () => note(1740, 860, '※点数はイメージ', 'end') }, ref(S4)], t); }, 1);
SC[17] = K((t) => R([{ at: 0, slide: 0, f: () => axesD('見た目の点数') + curve(bell, PNK, ease(clamp((t - .6) / 3)), true) + curve(bell, PNK, ease(clamp((t - .6) / 3))) },
  { at: .2, f: () => head('男性が、女性につけた点数', { y: 220, size: 50 }) }, { at: 7.4, f: () => tag(960, 330, 'ふつうの人がいちばん多い', PNK) }, ref(S3)], t), 1);
SC[18] = K((t) => { const k = ease(clamp((t - .4) / 2.6)), f = clamp((t - 4) / .8);
  return R([{ at: 0, slide: 0, f: () => axesD('見た目の点数') + `<g opacity=".3">${curve(bell, PNK, 1)}</g>` + curve(skew, MAN, k) + `<g opacity="${f}"><clipPath id="c18"><rect x="${AX0}" y="0" width="${(AX1 - AX0) / 2}" height="1080"/></clipPath><g clip-path="url(#c18)">${curve(skew, MAN, 1, true)}</g></g>` },
    { at: .2, f: () => head('女性が、男性につけた点数', { y: 220, size: 50 }) + txt(AX1 - 40, 520, '（薄い線：男性→女性）', { size: 28, color: DIM, anchor: 'end' }) },
    { at: 4.4, f: () => `<g transform="translate(560,330) scale(${pop(clamp((t - 4.4) / .4))})">${tag(0, 0, '「平均より下」が 8割', RED, 1, 44)}</g>` }, ref(S3)], t); }, 1);
SC[19] = K((t) => { const pile = (x, n, col, lab, mul, at) => { let g = ''; const k = clamp((t - at) / 2.2), m = Math.round(n * k); for (let i = 0; i < m; i++) g += env(x + (i % 5) * 54 - 108 + (Math.floor(i / 5) % 2) * 20, 760 - Math.floor(i / 5) * 40, .62, col);
    return g + env(x + 300, 760, .62, col) + txt(x - 10, 860, 'いちばん上', { size: 32, color: DIM }) + txt(x + 300, 860, 'いちばん下', { size: 32, color: DIM }) + txt(x + 140, 300, lab, { size: 46, color: col === PNK ? PNK : MAN, serif: true }) + (k >= 1 ? txt(x + 140, 380, `約${mul}倍`, { size: 72, color: Y, serif: true }) : ''); };
  return R([{ at: 0, f: () => head('見た目の評価と、届いたメッセージの数', { y: 200, size: 48 }) }, { at: .3, slide: 0, f: () => pile(320, 50, PNK, '女性', 25, .5) }, { at: 3.6, slide: 0, f: () => pile(1100, 22, '#cfe2ff', '男性', 11, 3.8) }, ref(S3)], t); }, 1);
SC[20] = K((t) => { let g = floor(560, 1760, 780); const xs = [620, 780, 940, 1100, 1260, 1420, 1580];
  xs.forEach((x, i) => g += P(x, 640, 50, i < 4 ? GRY : MAN)); g += txt(620, 850, '低い', { size: 30, color: DIM }) + txt(1580, 850, '高い', { size: 30, color: DIM }) + txt(1100, 850, '男性の見た目（女性の採点）', { size: 30, color: DIM });
  g += P(260, 640, 70, PNK, 'f') + floor(160, 360, 780);
  for (let i = 0; i < 14; i++) { const tt = (t * .9 + i * .37) % 2.2, tgt = [1, 2, 2, 3, 2, 1, 3, 2, 4, 2, 3, 5, 2, 1][i]; const k = clamp(tt / 1.4); const x = 330 + (xs[tgt] - 330) * k, y = 520 - Math.sin(k * Math.PI) * 220 + (1 - k) * 0; if (t > .6) g += env(x, y, .45); }
  return R([{ at: 0, slide: 0, f: () => g }, { at: 2, f: () => tag(940, 320, '平均より少し下にも、たくさん届く', Y) }, ref(S3)], t); }, 1);
SC[22] = K((t) => { let g = floor(560, 1760, 780) + P(260, 640, 80, PNK, 'f') + floor(140, 380, 780); const k = clamp((t - 1.5) / 3);
  g += `<path d="M300,560 L1760,${380} L1760,${860} Z" fill="${PNK}" opacity="${.06 + .04 * Math.sin(t * 3)}"/>`;
  for (let i = 0; i < 10; i++) { const x = 640 + i * 120, gray = i < 8 && k > i / 10; g += P(x, 650, 44, gray ? GRY : MAN); }
  return R([{ at: 0, slide: 0, f: () => g }, { at: 5, f: () => cap(240, '女性の目には、男の大半が「ふつう」', Y, 46) }], t); }, 1);
// ===== 第2章 =====
SC[23] = K((t) => chapTitle(t, '第2章', '美人はお金持ちを選ぶのか'), 2, { enter: 'zoom' });
SC[25] = K((t) => { const k = ease(clamp((t - 1.2) / 2.4)); let g = floor(300, 1620, 790) + P(520, 640, 110, PNK, 'f') + P(1400, 640, 114, MAN);
  const ax = 640 + (1280 - 640) * k, bx = 1280 - (1280 - 640) * k, y = 420 - Math.sin(k * Math.PI) * 100;
  g += `<g transform="translate(${ax},${y})">${card(-110, -60, 220, 120, { stroke: PNK, fill: 'rgba(18,16,24,.94)' })}${stars(-70, -18, 3, 3, Y, 16)}${txt(0, 44, '美しさ', { size: 30, color: PNK })}</g>`;
  g += `<g transform="translate(${bx},${y + 40})">${card(-110, -60, 220, 120, { stroke: Y, fill: 'rgba(18,16,24,.94)' })}${coins(-64, -18, 3, 3, 16)}${txt(0, 44, 'お金', { size: 30, color: Y })}</g>`;
  return R([{ at: 0, slide: 0, f: () => g }, { at: 3.6, f: () => cap(200, '美しさと、お金の「交換」？', Y, 46) }], t); }, 2);
SC[26] = K((t) => R([{ at: 0, f: () => head('女性が結婚相手に求める条件（重視＋考慮）', { y: 200, size: 48 }) }, { at: .4, slide: 0, f: (lt) => hbars(600, 330, 960, [{ label: '経済力', v: 90.3, txt: '90.3%', c: Y }, { label: '容姿', v: 82.5, txt: '82.5%', c: PNK }], 100, lt, { bh: 120, gap: 90, stag: 4.2, ls: 44 }) },
  { at: 8.4, f: () => `<g transform="translate(1300,760) scale(${pop(clamp((t - 8.4) / .4))})">${tag(0, 0, '1992年以降で最高', RED)}</g>` }, { at: 0, f: () => note(1640, 860, '※18〜34歳の未婚女性', 'end') }, ref(S1)], t), 2);
SC[27] = K((t) => R([{ at: 0, f: () => head('女性の「経済力」を重視・考慮する未婚男性', { y: 200, size: 48 }) }, { at: .3, slide: 0, f: (lt) => vbars(560, 310, 800, 470, [{ label: '1992年', v: 26.7, txt: '26.7%', c: '#c8c4bc' }, { label: '2025年', v: 55.6, txt: '55.6%', c: MAN }], 55, lt, { gap: 220, stag: 3.2 }) },
  { at: 8.2, f: () => cap(905, 'お金を気にするのは、女性だけじゃない', Y, 44) }, ref(S1)], t), 2);
SC[28] = K((t) => { const H = ['人気女優、IT社長と電撃婚', 'モデル、年上の資産家と結婚', '元アイドル、実業家と熱愛']; let g = '';
  H.forEach((h, i) => { const k = easeOut(clamp((t - .3 - i * .8) / .6)); g += `<g opacity="${k}" transform="translate(${960 + (i - 1) * 40},${340 + i * 170 + (1 - k) * 40}) rotate(${(i - 1) * 2})">` + paper(-460, -70, 920, 130, txt(460, 82, h, { size: 52, color: INK, shadow: false, serif: true })) + '</g>'; });
  return R([{ at: 0, slide: 0, f: () => g }, { at: 4.4, f: () => cap(200, '目立つ例ほど、記憶に残る', Y, 46) }, { at: 0, f: () => note(1880, 1000 - 70, '※架空の見出し', 'end') }], t); }, 2);
SC[32] = K((t) => { const cardP = (x, col, lab, st, co, kind) => card(x, 300, 560, 480, { stroke: col, fill: 'rgba(18,16,24,.88)' }) + P(x + 110, 560, 70, col, kind) + txt(x + 360, 380, lab, { size: 44, color: col, serif: true }) + txt(x + 250, 500, '見た目', { size: 32, color: DIM, anchor: 'start' }) + stars(x + 250, 550, Math.round(st), 5, Y, 16) + txt(x + 250, 650, '学歴・収入', { size: 32, color: DIM, anchor: 'start' }) + coins(x + 250, 700, Math.round(co), 5, 15);
  const k = clamp((t - 1) / 3); return R([{ at: 0, slide: 0, f: () => cardP(300, PNK, '女性', 3 * k, 3 * k, 'f') + cardP(1060, MAN, '男性', 3 * k, 3 * k, 'm') }, { at: 0, f: () => head('2人それぞれを、数字にする', { y: 220, size: 50 }) }, ref(S4)], t); }, 2);
SC[33] = K((t) => R([{ at: 0, slide: 0, f: () => scat(t) }, { at: 2.6, f: () => tag(1260, 300, 'お金のある男ほど、相手もきれい？', Y) }, ref(S4)], t), 2);
SC[34] = K((t) => { const cardP = (x, col, lab, st, co, kind, hl) => card(x, 300, 560, 480, { stroke: col, fill: 'rgba(18,16,24,.88)' }) + P(x + 110, 560, 70, col, kind) + txt(x + 360, 380, lab, { size: 44, color: col, serif: true }) + `<rect x="${x + 236}" y="${hl === 's' ? 470 : 620}" width="300" height="110" rx="12" fill="${Y}" opacity="${.18 + .1 * Math.sin(t * 4)}"/>` + txt(x + 250, 500, '見た目', { size: 32, color: DIM, anchor: 'start' }) + stars(x + 250, 550, st, 5, Y, 16) + txt(x + 250, 650, '学歴・収入', { size: 32, color: DIM, anchor: 'start' }) + coins(x + 250, 700, co, 5, 15);
  return R([{ at: 0, slide: 0, f: () => cardP(1060, MAN, 'お金のある男性', t > 1.5 ? 4 : 2, 5, 'm', 's') }, { at: 5.2, slide: 0, f: () => cardP(300, PNK, 'きれいな女性', 5, t > 6.6 ? 4 : 2, 'f', 'c') },
    { at: 1.6, out: 5, f: () => cap(905, 'お金のある男性は、本人も見た目がいい', Y, 42) }, { at: 6.6, f: () => cap(905, 'きれいな女性は、本人も学歴・収入が高い', Y, 42) }, ref(S4)], t); }, 2);
SC[35] = K((t) => R([{ at: 0, slide: 0, f: () => scat(9, ease(clamp((t - 1.5) / 2.5))) }, { at: .2, f: () => tag(1180, 300, '似た者同士の分を差し引くと…', Y) }, { at: 4.4, f: () => cap(905, '交換の証拠は、ほとんど残らない', RED, 46) }, ref(S4)], t), 2);
SC[37] = K((t) => { const k = easeOut(clamp(t / 1.2)), hit = clamp((t - 6.5) / .3), shake = t > 6.5 && t < 7.3 ? Math.sin(t * 60) * 8 : 0;
  return R([{ at: 0, slide: 0, f: () => paperCard(200 + 160 * k + (t > 6.5 ? -40 * hit : 0) + shake, 360, 'McClintock', '2014年', '交換は、ほぼない', MAN, -3) }, { at: 5.6, slide: 0, f: () => paperCard(1200 - 160 * easeOut(clamp((t - 5.6) / 1)) + (t > 6.5 ? 40 * hit : 0) - shake, 360, 'Gullickson', '2017年', '計算しだいで出る', RED, 3) },
    { at: 6.5, f: () => `<path d="M960,300 l-40,90 h50 l-40,100" stroke="${Y}" stroke-width="10" fill="none" stroke-linejoin="round" opacity="${1 - clamp((t - 7.5) / .5)}"/>` }, ref(S4 + '／' + S5)], t); }, 2);
SC[38] = K((t) => { const ph = (t * .8) % 2, dir = ph < 1, k = ease(ph % 1); const ax = dir ? 760 + 400 * k : 1160 - 400 * k;
  return R([{ at: 0, slide: 0, f: () => paperCard(180, 360, 'McClintock', '2014年・2017年', '交換は、ほぼない', MAN, -3) + paperCard(1220, 360, 'Gullickson', '2017年', '計算しだいで出る', RED, 3) + arrow(dir ? 760 : 1160, 520, ax, 520, dir ? MAN : RED, 1, 10) + txt(960, 460, dir ? '再反論' : '反論', { size: 40, color: dir ? MAN : RED }) },
    { at: 3.4, f: () => cap(905, '研究者の間でも、まだ決着はついていない', Y, 44) }, ref(S5 + '／' + S6)], t); }, 2);
SC[39] = K((t) => { const g = .6 + .4 * Math.sin(t * 3); return R([{ at: 0, slide: 0, f: () => `<g opacity=".45">` + paperCard(140, 380, 'McClintock', '2014年', '交換は、ほぼない', MAN, -3) + paperCard(1260, 380, 'Gullickson', '2017年', '計算しだいで出る', RED, 3) + '</g>' },
  { at: 1.6, f: () => `<g transform="translate(960,540) scale(${pop(clamp((t - 1.6) / .5))})"><circle r="${150 + 10 * g}" fill="${Y}" opacity=".12"/>${tag(0, 14, '似た者同士', Y, 1, 64)}</g>` }, { at: 3.2, f: () => cap(240, 'どちらも認める、いちばん強い力', Y, 46) }], t); }, 2);
// ===== 第3章 =====
SC[41] = K((t) => chapTitle(t, '第3章', '口で言う好みと、本当の好み'), 3, { enter: 'zoom' });
SC[43] = K((t) => { const q = (x, col, lab, a, b, rot) => paper(x, 260, 520, 560, txt(260, 80, lab, { size: 44, color: INK, shadow: false, serif: true }) + txt(260, 130, '理想の相手で大事なのは？', { size: 30, color: '#6a6058', shadow: false }) + txt(60, 270, '見た目', { size: 44, color: INK, shadow: false, anchor: 'start' }) + txt(60, 430, '稼ぐ力', { size: 44, color: INK, shadow: false, anchor: 'start' }) + `<circle cx="390" cy="255" r="${a}" fill="none" stroke="${col}" stroke-width="10" opacity="${a ? 1 : 0}"/><circle cx="390" cy="415" r="${b}" fill="none" stroke="${col}" stroke-width="10" opacity="${b ? 1 : 0}"/>`, { rot });
  const k = easeOut(clamp((t - 1.5) / .6)), k2 = easeOut(clamp((t - 4.2) / .6));
  return R([{ at: 0, f: () => head('10日前のアンケート', { y: 200, size: 52 }) }, { at: .3, slide: 0, f: () => q(300, MAN, '男性', 80 * k, 40 * k, -2) }, { at: 3.6, slide: 0, f: () => q(1100, RED, '女性', 40 * k2, 80 * k2, 2) }, ref(S7)], t); }, 3);
SC[44] = K((t) => { const k = easeOut(clamp((t - 1) / 1.6)); const grp = (x, lab) => `<rect x="${x}" y="${800 - 380 * k}" width="140" height="${380 * k}" rx="8" fill="${MAN}"/><rect x="${x + 160}" y="${800 - 380 * k}" width="140" height="${380 * k}" rx="8" fill="${PNK}"/>` + txt(x + 150, 860, lab, { size: 40 }) + txt(x + 70, 780 - 380 * k, '男', { size: 36, color: MAN }) + txt(x + 230, 780 - 380 * k, '女', { size: 36, color: PNK });
  return R([{ at: 0, f: () => head('実際に会ったあと、どれだけ惹かれたか', { y: 200, size: 50 }) }, { at: 0, slide: 0, f: () => `<path d="M360,800 H1560" stroke="${C.gray}" stroke-width="4"/>` + grp(460, '見た目のいい相手') + grp(1060, '稼げそうな相手') }, { at: 6, f: () => cap(300, '男女の差は、消えた', Y, 48) }, { at: 0, f: () => note(1560, 912, '※形はイメージ', 'end') }, ref(S7)], t); }, 3);
SC[45] = K((t) => { const k = clamp((t - .8) / 2); return R([{ at: 0, slide: 0, f: () => floor(300, 760, 790) + P(520, 640, 110, PNK, 'f') + `<path d="M560,520 L1000,${430} L1000,${650} Z" fill="${PNK}" opacity=".12"/>` },
  { at: .8, slide: 0, f: () => txt(1300, 520, (82.5 * easeOut(k)).toFixed(1) + '%', { size: 150, color: PNK, serif: true }) + txt(1300, 620, '男性の容姿を重視・考慮', { size: 40 }) }, { at: 4.6, f: () => cap(240, '女性も、見た目をちゃんと見ている', Y, 46) }, ref(S1)], t); }, 3);
SC[46] = K((t) => { const k = ease(clamp((t - 1) / 2.2)); const x = 600 + 800 * k, y = 540 - Math.sin(k * Math.PI) * 220 + k * k * 260;
  return R([{ at: 0, slide: 0, f: () => paper(260, 380, 300, 320, txt(150, 70, '理想の条件', { size: 36, color: INK, shadow: false, serif: true }) + `<path d="M40,130 h220 M40,180 h200 M40,230 h180" stroke="#8a8070" stroke-width="6"/>`) + `<circle cx="1400" cy="540" r="120" fill="none" stroke="${PNK}" stroke-width="8"/><circle cx="1400" cy="540" r="60" fill="none" stroke="${PNK}" stroke-width="8"/>` + P(1400, 560, 40, PNK, 'f') + txt(1400, 720, '実際に好きになった人', { size: 32, color: PNK }) + `<path d="M600,540 Q1000,${320} ${x},${y}" stroke="${Y}" stroke-width="7" fill="none" stroke-dasharray="16 10"/>` + (k >= 1 ? `<g transform="translate(1560,860)">${txt(0, 20, '×', { size: 110, color: RED })}</g>` : '') },
    { at: 3.8, f: () => cap(240, '理想の条件は、本当の好みを当てられない', Y, 44) }, ref(S7)], t); }, 3);
SC[48] = K((t) => R([{ at: 0, slide: 0, f: () => txt(620, 560, '90.3%', { size: 170, color: Y, serif: true }) + txt(620, 660, '経済力を重視・考慮', { size: 38, color: DIM }) }, { at: 1.2, f: () => tag(620, 330, '口で言った好み', Y) },
  { at: 3.6, slide: 0, f: () => qstamp(1340, 520, pop(clamp((t - 3.6) / .4)), PNK, 130) + txt(1340, 740, '実際の好み', { size: 44, color: PNK }) }, ref(S1)], t), 3);
// ===== 第4章 =====
SC[50] = K((t) => R([{ at: 0, out: 4.6, slide: 0, f: () => txt(960, 470, '第4章', { size: 44, color: C.o }) + txt(960, 600, '時間が恋の相場を崩す', { size: 92, color: Y, serif: true }) },
  { at: 5.2, slide: 0, f: () => calendar(700, 520, '出会い', '?', RED, 1) + arrow(860, 520, 1060, 520, Y, easeOut(clamp((t - 5.6) / .8)), 8) + calendar(1220, 520, '交際スタート', '♥', RED, 1) }, { at: 6.4, f: () => cap(860, 'カギは、付き合う前の時間', Y, 46) }], t), 4, { enter: 'zoom' });
SC[52] = K((t) => R([{ at: 0, slide: 0, f: () => `<rect x="560" y="260" width="800" height="440" rx="20" fill="#121018" stroke="#5a5560" stroke-width="10"/><rect x="930" y="700" width="60" height="80" fill="#5a5560"/>` + `<g opacity=".5" filter="url(#glow)">${P(860, 520, 60, '#c8c4bc', 'f')}${P(1060, 520, 62, '#c8c4bc')}</g>` + floor(300, 1620, 900) + [420, 760, 1160, 1500].map((x, i) => P(x, 780, 40, GRY) + scoreTag(x, 640, [6, 7, 6, 7][i], Y, clamp((t - 1 - i * .4) / .3))).join('') },
  { at: .8, f: () => cap(200, '2人を知らない人が、見た目を採点', Y, 44) }, ref(S8)], t), 4);
SC[53] = K((t) => { const n = Math.min(9, Math.floor(t * 2.2)); return R([{ at: 0, slide: 0, f: () => calendar(700, 540, '出会い', '', RED, 1.1) + calendar(1220, 540, '交際スタート', n + 'か月', RED, 1.1) + arrow(870, 540, 1040, 540, Y, 1, 8) }, { at: 1, f: () => cap(240, '知り合ってから、付き合うまで何か月？', Y, 44) }, ref(S8)], t); }, 4);
SC[54] = K((t) => { const panel = (x, lab, pairs, at, col) => { let g = card(x, 260, 700, 560, { stroke: col, fill: 'rgba(18,16,24,.7)' }) + txt(x + 350, 330, lab, { size: 42, color: col, serif: true }) + floor(x + 40, x + 660, 720);
    pairs.forEach(([a, b], i) => { const cx = x + 140 + i * 210, k = clamp((t - at - i * .4) / .3); g += P(cx - 40, 600, 36, PNK, 'f') + P(cx + 40, 600, 37, MAN) + scoreTag(cx - 40, 470, a, PNK, k) + scoreTag(cx + 40, 470, b, MAN, k); }); return g; };
  return R([{ at: 0, slide: 0, f: () => panel(180, 'すぐ付き合った組', [[8, 8], [5, 5], [3, 4]], .6, GRN) }, { at: 2.4, f: () => tag(530, 880, '見た目がそろう', GRN) },
    { at: 5.2, slide: 0, f: () => panel(1040, '長く知り合ってから', [[8, 4], [3, 7], [6, 2]], 5.6, NEF) }, { at: 7.4, f: () => tag(1390, 880, 'そろわない', NEF) }, { at: 0, f: () => note(1740, 240, '※点数はイメージ', 'end') }, ref(S8)], t); }, 4);
SC[57] = K((t) => { let g = ''; const wk = t < 5 ? '2週目' : '14週目';
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { const x = 420 + c * 360, y = 470 + r * 230; g += `<rect x="${x - 110}" y="${y + 60}" width="220" height="24" rx="6" fill="#8a6a4a"/>` + P(x, y, 42, (r + c) % 2 ? PNK : MAN, (r + c) % 2 ? 'f' : 'm') + scoreTag(x + 90, y - 20, ((r * 4 + c) * 7 + (t < 5 ? 3 : 5)) % 9 + 1, Y, clamp((t - .6 - c * .2) / .3) * (t > 4.6 && t < 5.2 ? 0 : 1)); }
  return R([{ at: 0, slide: 0, f: () => g }, { at: 0, f: () => tag(960, 300, wk, Y, 1, 46) }, { at: 0, f: () => head('異性のクラスメイトの「魅力」を採点', { y: 200, size: 48 }) }, ref(S9)], t); }, 4);
const split = (x, y, w, h, a, lt) => { const k = easeOut(clamp(lt / 1)); return `<rect x="${x}" y="${y}" width="${w * a * k}" height="${h}" rx="10" fill="${SOB}"/><rect x="${x + w * a * k + 6}" y="${y}" width="${Math.max(0, w * (1 - a) * k - 6)}" height="${h}" rx="10" fill="${NEF}"/>`; };
SC[58] = K((t) => { const sp = clamp((t - 2.6) / .8); return R([{ at: 0, slide: 0, f: () => sp < 1 ? `<rect x="360" y="440" width="1200" height="140" rx="12" fill="${Y}" opacity="${1 - sp}"/>` + txt(960, 530, 'ある人が、ある人につけた魅力の点数', { size: 44, color: '#1b1820', shadow: false }) : '' },
  { at: 2.6, slide: 0, f: (lt) => split(360, 440, 1200, 140, .5, lt) }, { at: 3.8, f: () => tag(660, 700, 'みんなの意見がそろう部分＝「相場」', SOB, 1, 36) }, { at: 7.6, f: () => tag(1260, 360, 'その人だけの点数＝「自分だけの値札」', NEF, 1, 36) }, ref(S9)], t); }, 4);
SC[59] = K((t) => { const k = ease(clamp((t - 1) / 6)), a = .62 - .3 * k; return R([{ at: 0, slide: 0, f: () => split(360, 470, 1200, 140, a, 9) + txt(360 + 1200 * a / 2, 556, '相場', { size: 46, color: '#1b1820', shadow: false }) + txt(360 + 1200 * (a + (1 - a) / 2), 556, '値札', { size: 46, color: '#1b1820', shadow: false }) },
  { at: 0, f: () => timeline(360, 760, 1200, [{ at: 0, label: '知り合ったばかり', c: DIM }, { at: 1, label: '時間がたつと', c: NEF }], k, { ls: 36 }) }, { at: 0, f: () => note(1560, 912, '※形はイメージ', 'end') }, ref(S9)], t); }, 4);
SC[60] = K((t) => R([{ at: 0, f: () => head('何年も前からの知り合いどうし', { y: 260, size: 52 }) }, { at: .3, slide: 0, f: (lt) => split(360, 440, 1200, 160, .08, lt) },
  { at: 1.8, f: () => tag(420, 700, '相場はほんのわずか', SOB, 1, 36) }, { at: 2.6, f: () => tag(1180, 700, 'ほとんどが「自分だけの値札」', NEF, 1, 40) }, ref(S9)], t), 4);
SC[62] = K((t) => { const sw = clamp((t - 3.4) / 1.2); let g = floor(500, 1760, 800);
  for (let i = 0; i < 7; i++) { const x = 600 + i * 180, up = i === 4 ? 160 * easeOut(sw) : 0; g += (up > 0 ? `<rect x="${x - 60}" y="${800 - up}" width="120" height="${up}" rx="8" fill="${NEF}" opacity=".8"/>` : '') + P(x, 660 - up, 46, i === 4 && sw > .3 ? MAN : GRY) + (i === 4 && sw > .6 ? ptag(x + 10, 460 - up, '値札', NEF, Math.sin(t * 2) * 4, .9) : ''); }
  g += `<g opacity="${sw}">` + P(280, 660, 70, PNK, 'f') + floor(180, 380, 800) + '</g>';
  return R([{ at: 0, slide: 0, f: () => g }, { at: .6, out: 3.2, f: () => tag(1140, 330, '相場では、みんな「ふつう」', GRY) }, { at: 5.4, f: () => cap(240, 'ある1人の値札では、いちばん上', NEF, 46) }], t); }, 4);
SC[63] = K((t) => R([{ at: 0, f: () => head('夫婦が知り合ったきっかけ', { y: 190, size: 50 }) }, { at: .3, slide: 0, f: (lt) => hbars(640, 270, 900, [{ label: '職場や仕事', v: 20.9, txt: '20.9%', c: NEF }, { label: '友人・兄弟の紹介', v: 20.2, txt: '20.2%', c: NEF }, { label: '学校', v: 14.0, txt: '14.0%', c: NEF }, { label: 'ネット・アプリ', v: 20.2, txt: '20.2%', c: MAN }, { label: '結婚相談所', v: 7.7, txt: '7.7%', c: GRY }], 25, lt, { bh: 80, gap: 40, stag: 1.6, ls: 34 }) },
  { at: 0, f: () => note(1640, 912, '※調査前の5年間に結婚した夫婦', 'end') }, ref(S1)], t), 4);
SC[64] = K((t) => R([{ at: 0, f: () => head('夫婦が知り合ったきっかけ', { y: 190, size: 50 }) }, { at: 0, slide: 0, f: () => hbars(640, 270, 900, [{ label: '職場や仕事', v: 20.9, txt: '20.9%', c: NEF }, { label: '友人・兄弟の紹介', v: 20.2, txt: '20.2%', c: NEF }, { label: '学校', v: 14.0, txt: '14.0%', c: NEF }, { label: 'ネット・アプリ', v: 20.2, txt: '20.2%', c: MAN }, { label: '結婚相談所', v: 7.7, txt: '7.7%', c: GRY }], 25, 9, { bh: 80, gap: 40, ls: 34 }) },
  { at: .8, f: () => `<path d="M1600,275 h30 V620 h-30" stroke="${Y}" stroke-width="6" fill="none"/>` + tag(1640, 450, '5割超', Y, 1, 48) }, { at: 2.4, out: 6.4, f: () => cap(905, '何度も顔を合わせる場所で出会っている', Y, 44) }, { at: 6.6, f: () => `<rect x="630" y="622" width="960" height="96" rx="12" fill="none" stroke="${MAN}" stroke-width="6" opacity="${.6 + .4 * Math.sin(t * 5)}"/>` + cap(905, 'ネット・アプリも、ほぼ並んだ', MAN, 44) }, ref(S1)], t), 4);
SC[66] = K((t) => { const v = Math.min(4.5, t * 1.3); return R([{ at: 0, slide: 0, f: () => calendar(700, 540, '交際スタート', '♥', RED, 1.1) + arrow(880, 540, 1060, 540, Y, 1, 8) + calendar(1240, 540, '結婚', v.toFixed(1) + '年', RED, 1.1) }, { at: 0, f: () => head('結婚までの平均交際期間', { y: 240, size: 50 }) }, ref(S1)], t); }, 4);
SC[67] = K((t) => { const pb = (x, a, b, col, lab, at) => { const k = easeOut(clamp((t - at) / 1.2)), s = 14; return `<rect x="${x}" y="${800 - a * s}" width="160" height="${a * s}" rx="8" fill="#8a8490"/><rect x="${x + 190}" y="${800 - b * s * k}" width="160" height="${b * s * k}" rx="8" fill="${col}"/>` + txt(x + 80, 780 - a * s, a.toFixed(1) + '%', { size: 38, color: DIM }) + (k > .8 ? txt(x + 270, 780 - b * s, b.toFixed(1) + '%', { size: 46, color: col, serif: true }) : '') + txt(x + 175, 860, lab, { size: 42 }); };
  return R([{ at: 0, f: () => head('4年前の調査と比べると', { y: 190, size: 50 }) + `<rect x="380" y="240" width="28" height="28" fill="#8a8490"/>` + txt(420, 264, '2021年の調査', { size: 30, anchor: 'start', color: DIM }) + txt(680, 264, '→ 2025年の調査', { size: 30, anchor: 'start' }) },
    { at: .4, slide: 0, f: () => pb(420, 11.0, 20.2, MAN, 'ネット・アプリ', 1.4) }, { at: 7.6, slide: 0, f: () => pb(1080, 25.6, 20.9, NEF, '職場や仕事', 8.4) }, { at: 3.6, out: 7.2, f: () => tag(600, 420, '倍近くに', MAN, 1, 44) }, ref(S1)], t); }, 4);
SC[71] = K((t) => { const ph = phone(300, 220, 340, 640, `<rect width="340" height="640" rx="30" fill="#1b1820"/>` + P(110, 260, 40, MAN) + P(230, 260, 38, PNK, 'f') + txt(170, 420, 'マッチしました！', { size: 30, color: PNK }) + txt(170, 500, '♥', { size: 70, color: RED }));
  const k = ease(clamp((t - 3) / 6)), m = Math.floor(1 + k * 11);
  return R([{ at: 0, slide: 0, f: () => ph }, { at: 2.6, slide: 0, f: () => calendar(900, 400, '会った回数', m + '回', RED, .8) + floor(1100, 1700, 800) + P(1250, 650, 60, MAN) + P(1550, 650, 58, PNK, 'f') + ptag(1400, 450, '値札', NEF, Math.sin(t * 2) * 4, .6 + .6 * k) },
    { at: 5.6, f: () => cap(905, '出会い方より、知り合う時間', Y, 46) }], t); }, 4);
// ===== 第5章 =====
SC[72] = K((t) => chapTitle(t, '第5章', '美女とふつうの男のその後'), 5, { enter: 'zoom' });
const marr = (t, wifeUp, lines, spiky, col) => { let g = floor(460, 1460, 800) + P(780, 650, 76, PNK, 'f') + P(1140, 650, 78, MAN) + `<g opacity=".9">${stars(700, 400, wifeUp ? 5 : 3, 5, Y, 12)}${stars(1060, 400, wifeUp ? 3 : 5, 5, Y, 12)}</g>`;
  lines.forEach(([s0, x, y, at], i) => g += bub(x, y, s0, col, clamp((t - at) / .3), 38, spiky)); return g; };
SC[74] = K((t) => R([{ at: 0, slide: 0, f: () => marr(t, true, [['大丈夫だよ', 560, 300, 1], ['手伝うよ', 1360, 300, 2], ['ありがとう', 960, 210, 3.2]], false, GRN) }, { at: 0, f: () => tag(960, 900, '妻のほうが見た目が上', PNK) }, { at: 0, f: () => note(1880, 1000 - 70, '※セリフは例', 'end') }, ref(S10)], t), 5);
SC[75] = K((t) => R([{ at: 0, slide: 0, f: () => marr(t, false, [['またそれ？', 560, 300, .8], ['だから言ったのに', 1360, 300, 1.8]], true, RED) }, { at: 0, f: () => tag(960, 900, '夫のほうが見た目が上', MAN) }, { at: 0, f: () => note(1880, 1000 - 70, '※セリフは例', 'end') }, ref(S10)], t), 5);
SC[77] = K((t) => { const k = easeOut(clamp((t - .5) / 1.2)), k2 = easeOut(clamp((t - 4.4) / 1.2)); return R([{ at: 0, slide: 0, f: () => floor(300, 1620, 800) + P(560, 650, 90, PNK, 'f') + P(1360, 650, 92, MAN) + `<path d="M680,${480} C900,380 1100,380 ${680 + 560 * k},${480}" stroke="${PNK}" stroke-width="${14 + 10 * k}" fill="none"/>` + txt(960, 360, '受け取るもの', { size: 36, color: PNK }) },
  { at: 4.4, slide: 0, f: () => `<path d="M1240,600 C1040,700 880,700 ${1240 - 560 * k2},600" stroke="${MAN}" stroke-width="${12 + 14 * k2}" fill="none"/>` + txt(960, 760, '大事にする気持ち', { size: 36, color: MAN }) }, ref(S10)], t); }, 5);
const sat = (t, title, a, b, la, lb, colA, colB) => { const X = (u) => 420 + u * 1100, Yv = (v) => 760 - v * 380, k = ease(clamp((t - .5) / 3)); const ln = (f, col) => { let d = ''; for (let i = 0; i <= 40 * k; i++) { const u = i / 40; d += (i ? ' L' : 'M') + X(u).toFixed(1) + ',' + Yv(f(u)).toFixed(1); } return `<path d="${d}" stroke="${col}" stroke-width="9" fill="none" stroke-linecap="round"/>`; };
  return `<path d="M420,760 H1540 M420,760 V320" stroke="${C.gray}" stroke-width="4"/>` + ['結婚', '1年', '2年', '3年', '4年'].map((s0, i) => txt(X(i / 4), 810, s0, { size: 30, color: DIM })).join('') + txt(400, 340, '満足度', { size: 30, color: DIM, anchor: 'end' }) + ln(a, colA) + ln(b, colB) + (k > .95 ? txt(X(1) + 20, Math.min(Yv(a(1)), Yv(b(1)) - 30) + 10, la, { size: 32, color: colA, anchor: 'start' }) + txt(X(1) + 20, Math.max(Yv(b(1)), Yv(a(1)) + 30) + 30, lb, { size: 32, color: colB, anchor: 'start' }) : '') + note(1540, 912, '※形はイメージ', 'end') + head(title, { y: 220, size: 48 }); };
SC[78] = K((t) => R([{ at: 0, slide: 0, f: () => sat(t, '妻の満足度', (u) => .8 - .25 * u, (u) => .76 - .23 * u + .01 * Math.sin(u * 9), '夫の見た目が上', '夫の見た目が下', MAN, GRY) }, { at: 4.4, f: () => cap(905, '夫の見た目とは、ほとんど関係なし', Y, 44) }, ref(S11)], t), 5);
SC[79] = K((t) => R([{ at: 0, slide: 0, f: () => sat(t, '夫の満足度', (u) => .85 - .12 * u, (u) => .72 - .3 * u, '妻の見た目が上', '妻の見た目が下', PNK, GRY) }, { at: 4.4, f: () => cap(905, '見た目を気にするのは、むしろ男性', Y, 44) }, ref(S11)], t), 5);
// ===== まとめ =====
SC[81] = K((t) => { const C3 = [['①', '見た目は', '似た者同士', .4], ['②', '美しさとお金の交換は', '主役じゃない', 5.2], ['③', '時間をかけるほど', '自分だけの値札', 9.6]]; let g = '';
  C3.forEach(([n, a, b, at], i) => { const k = easeOut(clamp((t - at) / .6)); if (k <= 0) return; g += `<g opacity="${k}" transform="translate(${170 + i * 540},${300 + (1 - k) * 40})">` + card(0, 0, 500, 460, { stroke: i === 2 ? NEF : 'rgba(255,255,255,.2)', fill: 'rgba(18,16,24,.85)' }) + txt(250, 110, n, { size: 70, color: Y, serif: true }) + txt(250, 240, a, { size: 36 }) + txt(250, 330, b, { size: 52, color: i === 2 ? NEF : Y, serif: true }) + '</g>'; });
  return R([{ at: 0, f: () => head('まとめ', { y: 210, size: 56 }) }, { at: 0, slide: 0, f: () => g }], t); }, 6);
SC[83] = K((t) => { let g = floor(200, 1720, 800) + P(860, 650, 80, PNK, 'f') + P(1060, 650, 84, MAN) + ptag(965, 420, '値札', NEF, Math.sin(t * 2) * 4, 1 + .08 * Math.sin(t * 3));
  [[300, 1], [480, -1], [1480, 1], [1640, -1]].forEach(([x, d], i) => { g += P(x, 650, 54, '#5e5a64') + `<g opacity="${clamp((t - .5 - i * .3) / .3)}">${tag(x, 470, '相場', GRY, 1, 30)}</g>`; });
  return R([{ at: 0, slide: 0, f: () => g }, { at: 4.4, f: () => cap(905, '2人にしか読めない値札', NEF, 46) }], t); }, 6);
SC[85] = K((t) => R([{ at: 0, f: () => `<g transform="translate(960,470) scale(${pop(clamp(t / .5))})"><path d="M-560,-170 h1120 a40,40 0 0 1 40,40 v240 a40,40 0 0 1 -40,40 h-940 l-90,70 v-70 h-90 a40,40 0 0 1 -40,-40 v-240 a40,40 0 0 1 40,-40 Z" fill="rgba(240,200,90,.12)" stroke="${Y}" stroke-width="6"/>` + txt(0, -40, 'あなたが恋人を好きになったのは', { size: 52, serif: true }) + txt(0, 60, '出会ってすぐ？　しばらくたってから？', { size: 52, color: Y, serif: true }) + '</g>' }, { at: 2.2, f: () => txt(960, 820, 'コメント欄で教えてください', { size: 44 }) }], t), 6);
SC[86] = K((t) => R([{ at: 0, f: () => txt(960, 460, '今日のネタバレは、ここまで', { size: 64, serif: true }) }, { at: 1.9, f: () => `<g transform="translate(960,640) scale(${pop(clamp((t - 1.9) / .4))})"><rect x="-230" y="-56" width="460" height="112" rx="56" fill="#e0453a"/>${txt(0, 18, 'チャンネル登録', { size: 50, color: '#fff', shadow: false })}</g>` }], t), 6);
// 章の番号（実写の場面の進行バー用）
const CHI = (i) => i < 8 ? 0 : i < 23 ? 1 : i < 41 ? 2 : i < 50 ? 3 : i < 72 ? 4 : i < 81 ? 5 : 6;

// ===== 実写の場面：緑に塗って、出典・カードだけ上に置く =====
const ovSvg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0">${inner}</svg>`;
const srcBox = (src) => `<rect x="${1880 - src.length * 23 - 20}" y="28" width="${src.length * 23 + 40}" height="44" rx="8" fill="#121018"/>` + note(1880, 58, src, 'end');
const capAt = (s0, col = Y, size = 50, t0 = .8, src = '') => (t) => (t > t0 ? cap(150, s0, col, size) : '') + (src ? srcBox(src) : '');
const GV = [[0, (t) => capAt('美女の隣に、ふつうの男？', Y, 52, 1.2)(t)], [1, capAt('「お金かな？」', Y, 56, .5)], [3, capAt('何千組ものカップルを調べると…', Y, 48, 1.0)],
  [8, capAt('1966年 アメリカの大学のダンスパーティー', Y, 44, .5, S2)], [11, capAt('「相手を、どれくらい気に入った？」', Y, 48, .5, S2)], [14, capAt('初対面なら、見た目がものを言う', Y, 48)],
  [16, capAt('出会い系サイトの、少し残酷なデータ', Y, 46, .5, S3)], [21, capAt('「ふつう以下」でも、声はかける', Y, 48, .8, S3)], [24, capAt('「トロフィーワイフ」', Y, 56, .6)],
  [29, capAt('似た者同士の夫婦は、ニュースにならない', Y, 44)], [30, capAt('本当に「美しさとお金」の交換はある？', Y, 46, .5)], [31, capAt('アメリカの若いカップル 1,507組', Y, 50, .8, S4)],
  [36, capAt('「成功した男は、成功した女と」', Y, 50, .8, S4)], [40, capAt('「お金目当て」と決めつけるのは、分の悪い賭け', Y, 42)], [42, capAt('スピードデート：4分ずつ話して、次の相手へ', Y, 44, .6, S7)],
  [47, capAt('何に惹かれるか、自分でも分かっていない', Y, 44)], [49, capAt('恋に落ちる瞬間に、年収表は見ない', Y, 48)], [51, capAt('恋人と夫婦 167組（交際3か月〜結婚53年）', Y, 44, .6, S8)],
  [55, capAt('友だちから始まったカップルも、同じ向き', Y, 46, .6, S8)], [56, capAt('大学の少人数クラスで、魅力を採点', Y, 46, .6, S9)], [61, capAt('初対面の数秒では見えないもの', Y, 48)],
  [65, capAt('職場や学校は、時間をかけて知り合う場所', Y, 44)], [68, capAt('写真から始まる出会いが増えている', Y, 46, .6, S1)], [69, capAt('数秒で決める場では、「相場」が強くなる', Y, 44)],
  [70, capAt('何度も会える場所にいる', Y, 50)], [73, capAt('新婚82組の話し合いを録画', Y, 50, .6, S10)], [76, capAt('相手を大事にしようとする？', Y, 50, .6, S10)],
  [80, capAt('「ふつうの男」の隣は、損な席ではなさそう', Y, 44)], [82, () => ''], [84, capAt('値段を決めたのは、2人で過ごした時間', Y, 46, .4)]];
for (const [i, ov, gw = 1920] of GV) { const old = SC[i];
  SC[i] = { kind: 'kami', build() { const b = old.build(); return { render() {}, update(t, dur) { return b.update(t, dur) + `<div style="position:absolute;left:0;top:0;width:${gw}px;height:944px;background:#00ff00"></div>` + ovSvg(ov(t)); } }; } }; }
export const SCENES = SC;
