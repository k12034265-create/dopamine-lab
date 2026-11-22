// 07 親の年収と成績 — 図解中心（写真なし）。字幕は灰色の帯。名前を付けた言葉：「前払い」「利子」
import { THREE, makeScene, mat, glow, box, cyl, lamp, sun, canvasTex, person as person3, lerp } from '/pipeline3d/lib3d.js';
import { maps, C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, bubble, loadMaps, run, kami } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const M = '#4f8fea', F = '#ef7fa8', Y = C.gold, CX = 960;
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', '第5章', 'エピローグ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, ...o });
const R = (els, t) => { const rf = els.filter(e => e.ref), ot = els.filter(e => !e.ref); const o = ot.length && ot[0].bg ? [ot[0], ...rf, ...ot.slice(1)] : [...rf, ...ot]; return run(o.map(e => e.f ? e : { ...e, f: () => '' }), t); };
const ref = (s) => ({ at: .6, ref: true, f: () => note(1880, 125, s, 'end') });
const SR1 = '文部科学省 全国学力・学習状況調査（保護者に対する調査）';
const IMG = (n) => `/episodes/07_gakuryoku/img/${n}.jpg`;
const photo = (n, t, dur, dark = .3, z0 = 1.0, z1 = 1.08) => { const k = ease(clamp(t / dur)), z = z0 + (z1 - z0) * k;
  return `<g transform="translate(960,540) scale(${z}) translate(-960,-540)"><image href="${IMG(n)}" x="-40" y="-40" width="2000" height="1160" preserveAspectRatio="xMidYMid slice"/></g><rect width="1920" height="1080" fill="rgba(8,10,18,${dark})"/>`; };
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
SC[2] = K((t) => { const cr = clamp((t - 5.6) / .8), P = -38, gap = 16 * easeOut(cr);
  const box0 = `<rect x="-420" y="-140" width="840" height="280" rx="60" fill="#efeae0"/><path d="M-60,138 L-110,230 L30,138Z" fill="#efeae0"/>`;
  const word = txt(0, 30, '勉強は、努力しだい', { size: 76, color: '#222', shadow: false, serif: true });
  const crack = `<path d="M${P},-150 L${P + 7},-90 L${P - 7},-30 L${P + 7},30 L${P - 7},90 L${P},150" stroke="#1b1a20" stroke-width="5" fill="none" stroke-dasharray="320" stroke-dashoffset="${320 * (1 - cr)}"/>`;
  return R([
    { at: .2, slide: 0, f: (lt) => `<g transform="translate(${CX},430) scale(${pop(lt / .4)})">` + (cr <= 0 ? box0 + word
        : `<defs><clipPath id="bl2"><rect x="-600" y="-300" width="${600 + P - .5}" height="700"/></clipPath><clipPath id="br2"><rect x="${P + .5}" y="-300" width="700" height="700"/></clipPath></defs><g clip-path="url(#bl2)" transform="translate(${-gap},0) rotate(${-2 * cr} ${P} 140)">${box0 + word}</g><g clip-path="url(#br2)" transform="translate(${gap},0) rotate(${2 * cr} ${P} 140)">${box0 + word}</g>`) + `</g>` },
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

// ===== 共通 =====
const chapEls = (num, title) => [
  { at: 0, slide: 0, f: () => txt(CX, 400, num, { size: 40, color: C.o, serif: true, ls: 10 }) },
  { at: .25, f: () => txt(CX, 530, title, { size: 88, serif: true, ls: 4 }) },
  { at: .7, slide: 0, f: (lt) => `<rect x="${CX - 320 * ease(lt / .8)}" y="580" width="${640 * ease(lt / .8)}" height="3" fill="${C.o}"/>` }];
const kid = (x, y, col, a = 1, s = 1) => `<g transform="translate(${x},${y}) scale(${s})" opacity="${a}"><circle cy="-16" r="9" fill="${col}"/><rect x="-10" y="-6" width="20" height="24" rx="7" fill="${col}"/></g>`;
// 100人の格子。lit人が光る（上から順ではなく散らす）
const ORD = (() => { let x = 13; const a = [...Array(100).keys()]; for (let i = 99; i > 0; i--) { x = (x * 16807) % 2147483647; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; })();
const grid100 = (gx, gy, lit, col, dx = 46, dy = 50) => { const on = new Set(ORD.slice(0, Math.round(lit))); let g = '';
  for (let i = 0; i < 100; i++) g += kid(gx + (i % 10) * dx, gy + Math.floor(i / 10) * dy, on.has(i) ? col : '#4a4752', 1); return g; };
const HOUSES = ['#6b665e', '#8a8478', '#b5ad9c', '#e0d6bd'];
const house = (x, y, s, col) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-70,-10 L0,-70 L70,-10Z" fill="${col}"/><rect x="-55" y="-10" width="110" height="80" fill="${col}"/><rect x="-14" y="22" width="28" height="48" fill="#1b1a20" opacity=".5"/></g>`;
const hbar = (x, y, w, h, col, label, val, k = 1) => `<rect x="${x}" y="${y}" width="${w * k}" height="${h}" rx="10" fill="${col}"/>` + txt(x - 20, y + h / 2 + 14, label, { size: 36, anchor: 'end' }) + (k > .95 ? txt(x + w + 20, y + h / 2 + 16, val, { size: 46, anchor: 'start', color: col, serif: true }) : '');
const vbar = (x, base, h, col, top, bottom, k = 1, w = 160) => `<rect x="${x - w / 2}" y="${base - h * k}" width="${w}" height="${h * k}" rx="10" fill="${col}"/>` + (k > .95 ? txt(x, base - h - 24, top, { size: 48, color: col, serif: true }) : '') + txt(x, base + 50, bottom, { size: 32, color: C.dim });
const stamp = (x, y, s0, t, t0, col = '#c43a3a', size = 66) => { const st = clamp((t - t0) / .25); return t > t0 ? `<g transform="translate(${x},${y}) rotate(-12) scale(${1.6 - .6 * st})" opacity="${st}"><rect x="${-s0.length * size * .55 - 30}" y="-${size}" width="${s0.length * size * 1.1 + 60}" height="${size * 2}" rx="12" fill="none" stroke="${col}" stroke-width="9"/>${txt(0, size * .32, s0, { size, color: col, shadow: false, serif: true })}</g>` : ''; };
const SR2 = 'お茶の水女子大学 (2018) 文部科学省委託研究', SR3 = '東京大学 大学経営・政策研究センター', SR4 = '労働政策研究・研修機構 ユースフル労働統計', SR5 = '文部科学省 (2026) 専門的な課題分析', SR6 = 'OECD (2018) Equity in Education';

// 4 100人に解かせると：年収200万円未満 vs 1500万円以上 で20人以上ちがう
SC[4] = K((t) => R([
  { at: 0, f: () => head('中学3年の数学を、100人に解かせたら', { y: 170 }) },
  { at: .4, slide: 0, f: () => grid100(170, 330, Math.min(1, clamp((t - 5) / 2)) * 45, '#8a8478') + txt(377, 870, '年収200万円未満の家', { size: 34, color: C.dim }) },
  { at: 2.0, slide: 0, f: () => grid100(1130, 330, Math.min(1, clamp((t - 5) / 2)) * 66, Y) + txt(1337, 870, '年収1500万円以上の家', { size: 34, color: Y }) },
  { at: 8.0, f: (lt) => `<g transform="translate(${CX},600) scale(${pop(lt / .4)})"><circle r="95" fill="#c43a3a"/>${txt(0, -8, '20人', { size: 50, color: '#fff', shadow: false, serif: true })}${txt(0, 40, '以上の差', { size: 30, color: '#fff', shadow: false })}</g>` },
  { at: .3, f: () => note(1880, 1000 - 60, '※格子は差のイメージ（正答数は目安）', 'end') }, ref(SR1),
], t), 0, { enter: 'fade', zoom: 0 });
// 5 素朴な反論
SC[5] = K((t) => R([
  { at: .3, f: () => txt(CX, 330, 'ここで、素朴な反論が浮かぶ', { size: 44, color: C.dim }) },
  { at: 1.2, f: (lt) => `<g transform="translate(${CX},560) scale(${pop(lt / .45)})"><rect x="-460" y="-120" width="920" height="240" rx="60" fill="#efeae0"/><path d="M60,118 L120,210 L-20,118Z" fill="#efeae0"/>${txt(0, 0, 'お金がなくても', { size: 58, color: '#222', shadow: false })}${txt(0, 80, '努力すれば、逆転できるのでは？', { size: 58, color: '#222', shadow: false })}</g>` },
], t), 0, { enter: 'fade', zoom: 0 });
// 6 4枚のカード
const CARDS = [['①', '差の大きさ'], ['②', '努力で逆転？'], ['③', '前払いの中身'], ['④', 'その先']];
SC[6] = K((t) => R([
  { at: 0, f: () => head('国の調査の数字だけで確かめる', { y: 200 }) },
  ...CARDS.map((c, i) => ({ at: .5 + i * .6, f: (lt) => `<g transform="translate(${270 + i * 460},560) scale(${pop(lt / .45)})">` + card(-200, -170, 400, 340) + txt(0, -60, c[0], { size: 60, color: Y, serif: true }) + txt(0, 50, c[1], { size: 44 }) + '</g>' })),
], t), 0, { enter: 'fade', zoom: 0 });
// 7 第1章
SC[7] = K((t) => R(chapEls('第1章', '家庭で4つに分けると'), t), 1, { enter: 'zoom', zoom: 0 });
// 8 家のピクト4段
SC[8] = K((t) => R([
  { at: 0, f: () => head('家の年収 ＋ 父と母の学歴 → 4つのグループ', { y: 190 }) },
  ...HOUSES.map((c, i) => ({ at: .6 + i * .8, f: (lt) => house(420 + i * 360, 760 - i * 90, (1 + i * .15) * pop(lt / .4), c) + txt(420 + i * 360, 880 - i * 90 + 30, ['一番下', '下から2番目', '上から2番目', '一番上'][i], { size: 32, color: c }) })),
  { at: 5.0, slide: 0, f: (lt) => `<path d="M300,860 L1600,${560}" stroke="${Y}" stroke-width="4" stroke-dasharray="${1400 * clamp(lt / 1)} 2000" opacity=".7"/>` + (lt > 1 ? txt(1350, 790, '豊かさ・学びの環境', { size: 32, color: Y }) : '') },
  ref(SR2),
], t), 1, { enter: 'right', zoom: 0 });
// 9 2つの家
SC[9] = K((t) => R([
  { at: 0, f: () => head('2017年度の調査', { y: 190 }) },
  { at: .3, f: (lt) => house(600, 640, 1.3 * pop(lt / .4), HOUSES[0]) + txt(600, 780, '一番下のグループ', { size: 40, color: C.dim }) },
  { at: 1.2, f: (lt) => house(1320, 640, 2.2 * pop(lt / .4), HOUSES[3]) + txt(1320, 860, '一番上のグループ', { size: 40, color: HOUSES[3] }) },
  { at: 2.4, f: () => txt(CX, 600, 'vs', { size: 70, color: C.dim, serif: true }) }, ref(SR1),
], t), 1, { enter: 'right', zoom: 0 });
// 10 100人の格子：53人 vs 77人
SC[10] = K((t) => { const a = Math.round(53 * easeOut(clamp((t - 2.5) / 2.5))), b = Math.round(77 * easeOut(clamp((t - 5) / 2.5)));
  return R([
    { at: 0, f: () => head('中学3年 数学の基礎問題 — 100人のうち正解するのは', { y: 170 }) },
    { at: 0, slide: 0, f: () => grid100(170, 330, a, '#b5ad9c') + `<g style="font-variant-numeric:tabular-nums">${txt(377, 900, '一番下　' + a + '人', { size: 44, color: '#b5ad9c', serif: true })}</g>` },
    { at: 0, slide: 0, f: () => grid100(1130, 330, b, Y) + `<g style="font-variant-numeric:tabular-nums">${txt(1337, 900, '一番上　' + b + '人', { size: 44, color: Y, serif: true })}</g>` },
    { at: 9.0, f: (lt) => `<g transform="translate(${CX},590) scale(${pop(lt / .4)})"><circle r="100" fill="#c43a3a"/>${txt(0, 0, '24人', { size: 58, color: '#fff', shadow: false, serif: true })}${txt(0, 48, 'ぶんの差', { size: 30, color: '#fff', shadow: false })}</g>` },
    ref(SR1),
  ], t); }, 1, { enter: 'fade', zoom: 0 });
// 11 格子2組：算数の応用 36/58、国語の基礎 68/82
SC[11] = K((t) => { const pair = (x, title, lo, hi, t0) => { const k = easeOut(clamp((t - t0) / 2)); return txt(x + 230, 260, title, { size: 36 }) + grid100(x, 330, lo * k, '#b5ad9c', 23, 26).replace(/scale\(1\)/g, 'scale(.5)') + grid100(x + 250, 330, hi * k, Y, 23, 26).replace(/scale\(1\)/g, 'scale(.5)') + (k > .95 ? txt(x + 105, 640, lo + '人', { size: 46, color: '#b5ad9c', serif: true }) + txt(x + 355, 640, hi + '人', { size: 46, color: Y, serif: true }) : ''); };
  return R([
    { at: 0, f: () => head('ほかの問題でも（100人のうち正解する人数）', { y: 170 }) },
    { at: 0, slide: 0, f: () => pair(250, '小6 算数の応用', 36, 58, .5) },
    { at: 0, slide: 0, f: () => pair(1100, '小6 国語の基礎（差が一番小さい）', 68, 82, 5.0) },
    { at: 1.0, f: () => txt(CX, 760, '左＝一番下のグループ　右＝一番上のグループ', { size: 32, color: C.dim }) }, ref(SR1),
  ], t); }, 1, { enter: 'right', zoom: 0 });
// 12 8組の棒：全部上が高い
const PAIRS8 = [['小6 国語の基礎', 68, 82], ['小6 算数の応用', 36, 58], ['中3 数学の基礎', 53, 77]];
SC[12] = K((t) => R([
  { at: 0, f: () => head('100人のうち正解する人数（左：一番下／右：一番上）', { y: 170 }) },
  { at: .3, slide: 0, f: () => PAIRS8.map((p, i) => { const k = easeOut(clamp((t - .4 - i * .35) / .8)), x = 480 + i * 480;
      return `<rect x="${x - 130}" y="${820 - p[1] * 5 * k}" width="120" height="${p[1] * 5 * k}" fill="#8a8478"/><rect x="${x + 10}" y="${820 - p[2] * 5 * k}" width="120" height="${p[2] * 5 * k}" fill="${Y}"/>` + txt(x, 870, p[0], { size: 32, color: C.dim }) + (k > .95 ? txt(x - 70, 800 - p[1] * 5, p[1] + '人', { size: 36, color: '#b5ad9c' }) + txt(x + 70, 800 - p[2] * 5, p[2] + '人', { size: 36, color: Y }) : ''); }).join('') + `<rect x="160" y="820" width="1600" height="3" fill="#6b665e"/>` },
  { at: 8.5, f: (lt) => `<g transform="translate(${CX},300) scale(${pop(lt / .4)})">${txt(0, 0, '例外は、1つもない', { size: 54, color: Y, serif: true })}</g>` },
  { at: 4.5, out: 8.2, f: () => txt(CX, 300, '国語・算数・小・中、どの組み合わせでも差は14〜24人', { size: 40 }) }, ref(SR1),
], t), 1, { enter: 'right', zoom: 0 });
// 13 点の散らばり
SC[13] = K((t) => { const dots = (cy, spread, col, n, seed, t0) => { let s0 = '', x = seed; for (let i = 0; i < n; i++) { x = (x * 16807) % 2147483647; const u = (x % 1000) / 1000 - .5; x = (x * 16807) % 2147483647; const v = (x % 1000) / 1000 - .5; const a = clamp((t - t0 - i * .02) / .3); s0 += `<circle cx="${(960 + u * spread * 2 + (cy < 600 ? -60 : 120)).toFixed(1)}" cy="${(cy + v * 70).toFixed(1)}" r="9" fill="${col}" opacity="${a * .85}"/>`; } return s0; };
  return R([
    { at: 0, f: () => head('点数の散らばり方', { y: 170 }) },
    { at: 0, slide: 0, f: () => dots(450, 620, '#b5ad9c', 70, 7, .5) + txt(160, 460, '一番下', { size: 36, color: '#b5ad9c', anchor: 'start' }) },
    { at: 0, slide: 0, f: () => dots(720, 260, Y, 70, 11, 2.5) + txt(160, 730, '一番上', { size: 36, color: Y, anchor: 'start' }) },
    { at: 0, slide: 0, f: () => `<rect x="260" y="860" width="1400" height="3" fill="#6b665e"/>` + txt(300, 910, '低い点', { size: 30, color: C.dim }) + txt(1620, 910, '高い点', { size: 30, color: C.dim }) },
    { at: 6.0, f: () => txt(CX, 300, '下のグループほど、横に広く散らばる', { size: 44, color: Y }) },
    { at: .3, f: () => note(1880, 1000 - 60, '※点の位置はイメージ', 'end') }, ref(SR1),
  ], t); }, 1, { enter: 'right', zoom: 0 });
// 14 第2章
SC[14] = K((t) => R(chapEls('第2章', '努力で、逆転できるか'), t), 2, { enter: 'zoom', zoom: 0 });
// 15 3D：夜の勉強机
function desk() {
  const S = makeScene({ bg: '#0c0d14', hemi: .45, exposure: 1.15, sky: '#8090b0', ground: '#201812', bloom: .2, bloomTh: .85, fov: 34 });
  const s = S.s; box(s, 6, .05, 6, mat('#2a2018'), 0, 0, 0); box(s, 6, 3, .1, mat('#22242c'), 0, 1.5, -1.6);
  box(s, 1.6, .06, .8, mat('#6a5040'), 0, .76, -.9); for (const x of [-.75, .75]) for (const z of [-1.25, -.55]) box(s, .05, .74, .05, mat('#3a3028'), x, .37, z);
  const nb = box(s, .5, .02, .34, mat('#efeae0'), -.05, .8, -.85); nb.rotation.y = .15; box(s, .02, .01, .3, mat('#888'), .12, .815, -.85);
  for (let i = 0; i < 5; i++) box(s, .06, .3, .22, mat(['#7a3a3a', '#3a5a7a', '#5a7a3a', '#7a6a3a', '#4a4a6a'][i]), .5 + i * .07, .95, -1.15);
  cyl(s, .06, .08, .04, mat('#222'), -.55, .8, -1.1, 12); box(s, .03, .4, .03, mat('#222'), -.55, 1.0, -1.1); const sh = box(s, .22, .06, .14, mat('#333'), -.45, 1.2, -1.0);
  lamp(s, '#ffd9a0', 1.3, 3, -.4, 1.12, -.95, false); box(s, .9, .6, .05, glow('#1a2a4a', .4), 0, 1.7, -1.55);
  return { render() { S.render(); }, update(t, dur) { const k = ease(t / dur); S.cam.position.set(lerp(.9, .5, k), lerp(1.6, 1.45, k), lerp(.9, .6, k)); S.cam.lookAt(-.05, .82, -.9); return ''; } };
}
SC[15] = { build: desk };
// 16 全国平均：3時間以上72% vs しない51%
SC[16] = K((t) => R([
  { at: 0, f: () => head('小6 国語の正答率（全国）', { y: 190 }) },
  { at: .5, slide: 0, f: (lt) => vbar(720, 820, 72.4 * 6, Y, '72.4%', '毎日3時間以上', easeOut(clamp(lt / 1))) },
  { at: 3.0, slide: 0, f: (lt) => vbar(1200, 820, 50.6 * 6, '#8a8478', '50.6%', 'まったくしない', easeOut(clamp(lt / 1))) },
  { at: 7.5, f: (lt) => txt(1500, 420, '勉強すれば上がる', { size: 44, color: Y }) },
  ref(SR1),
], t), 2, { enter: 'right', zoom: 0 });
// 17 4つの家ごとに並べ直す
SC[17] = K((t) => R([
  { at: 0, f: () => txt(CX, 260, 'だが、家庭ごとに並べ直すと…', { size: 58, color: Y, serif: true }) },
  ...HOUSES.map((c, i) => ({ at: .5 + i * .4, f: (lt) => house(360 + i * 400, 680, .9 * pop(lt / .4), c) + `<rect x="${330 + i * 400}" y="780" width="26" height="${60}" fill="${c}"/><rect x="${366 + i * 400}" y="760" width="26" height="80" fill="${c}"/>` })),
], t), 2, { enter: 'fade', zoom: 0 });
// 18 下×3時間 59% vs 上×勉強なし 61%
SC[18] = K((t) => R([
  { at: 0, f: () => head('小6 国語の正答率', { y: 170 }) },
  { at: .5, slide: 0, f: (lt) => house(560, 300, .8, HOUSES[0]) + vbar(560, 840, 58.9 * 6, '#b5ad9c', '58.9%', '一番下 × 毎日3時間以上', easeOut(clamp(lt / 1)), 220) },
  { at: 6.5, slide: 0, f: (lt) => house(1360, 300, .8, HOUSES[3]) + vbar(1360, 840, 60.5 * 6, Y, '60.5%', '一番上 × まったくしない', easeOut(clamp(lt / 1)), 220) },
  ref(SR1),
], t), 2, { enter: 'right', zoom: 0 });
// 19 1年で1000時間超の努力が届かない
SC[19] = K((t) => R([
  { at: 0, slide: 0, f: () => vbar(560, 840, 58.9 * 6, '#b5ad9c', '58.9%', '一番下 × 毎日3時間以上', 1, 220) + vbar(1360, 840, 60.5 * 6, Y, '60.5%', '一番上 × まったくしない', 1, 220) + `<path d="M440,${840 - 60.5 * 6} L1480,${840 - 60.5 * 6}" stroke="#c43a3a" stroke-width="3" stroke-dasharray="12 10"/>` },
  { at: .8, f: () => card(700, 180, 520, 170, { fill: 'rgba(20,24,36,.92)' }) + txt(CX, 250, '毎日3時間 × 365日', { size: 38 }) + txt(CX, 320, '＝ 1年で1000時間超', { size: 46, color: Y, serif: true }) },
  { at: 5.5, f: () => txt(CX, 430, '随分と、重い数字である', { size: 46, color: '#ff8a7a', serif: true }) },
  ref(SR1),
], t), 2, { enter: 'fade', zoom: 0 });
// 20 上×3時間 81%
SC[20] = K((t) => R([
  { at: 0, slide: 0, f: () => vbar(460, 840, 58.9 * 6, '#b5ad9c', '58.9%', '一番下×3時間以上', 1, 200) + vbar(960, 840, 60.5 * 6, '#c9a24a', '60.5%', '一番上×しない', 1, 200) },
  { at: .5, slide: 0, f: (lt) => vbar(1460, 840, 80.6 * 6, Y, '80.6%', '一番上×3時間以上', easeOut(clamp(lt / 1)), 200) },
  { at: 4.5, f: (lt) => `<path d="M1340,${840 - 58.9 * 6} L1340,${840 - 80.6 * 6}" stroke="#c43a3a" stroke-width="6"/>` + txt(1165, 330, '同じ3時間で', { size: 32, color: '#ff8a7a' }) + txt(1165, 378, '20ポイント以上', { size: 40, color: '#ff8a7a', serif: true }) },
  ref(SR1),
], t), 2, { enter: 'fade', zoom: 0 });
// 21 前払いの額が家ごとにちがう：同じ階段、ちがう高さ
SC[21] = K((t) => { const steps = (x, base, col) => { let s0 = ''; for (let i = 0; i < 5; i++) s0 += `<rect x="${x + i * 90}" y="${base - (i + 1) * 45}" width="90" height="${(i + 1) * 45}" fill="${col}"/>`; return s0; };
  return R([
    { at: 0, slide: 0, f: () => steps(220, 900, '#4a4752') + steps(1060, 780, '#6b665e') + `<rect x="1060" y="780" width="450" height="120" fill="${Y}" opacity=".35"/>` + person(220 + 4 * 90 + 45, 900 - 225 - 129, 110, M) + person(1060 + 4 * 90 + 45, 780 - 225 - 129, 110, F, 'f') },
    { at: 2.0, f: () => txt(1285, 855, '前払いの分', { size: 36, color: Y }) },
    { at: 4.5, f: () => txt(CX, 170, 'ずるい・努力不足、という話ではない', { size: 44 }) + txt(CX, 238, '前払いの額が、家ごとにちがう', { size: 56, color: Y, serif: true }) },
  ], t); }, 2, { enter: 'right', zoom: 0 });
// 22 下のグループ：44% → 59%（努力はちゃんと効く）
SC[22] = K((t) => R([
  { at: 0, f: () => head('一番下のグループでも', { y: 190 }) },
  { at: .5, slide: 0, f: (lt) => vbar(720, 820, 43.7 * 7, '#8a8478', '43.7%', 'まったくしない', easeOut(clamp(lt / 1))) },
  { at: 3.5, slide: 0, f: (lt) => vbar(1200, 820, 58.9 * 7, '#b5ad9c', '58.9%', '毎日3時間以上', easeOut(clamp(lt / 1))) },
  { at: 6.5, f: (lt) => `<g transform="translate(1520,420) scale(${pop(lt / .4)})"><circle r="100" fill="${Y}"/>${txt(0, -6, '+15', { size: 58, color: '#111', shadow: false, serif: true })}${txt(0, 42, 'ポイント', { size: 28, color: '#111', shadow: false })}</g>` },
  ref(SR1),
], t), 2, { enter: 'right', zoom: 0 });
// 23 スタートラインのずれた陸上トラック（イラスト）
function runner(s, top, hairStyle) {
  const g = new THREE.Group(); const skin = mat('#e5bf9c'), hair = mat('#1c1714'), tp = mat(top), bt = mat('#2a2d36');
  const legs = [], arms = [];
  for (const sx of [-1, 1]) { const hip = new THREE.Group(); hip.position.set(sx * .08, .82, 0); g.add(hip); box(hip, .13, .82, .14, bt, 0, -.41, 0); legs.push(hip);
    const sh = new THREE.Group(); sh.position.set(sx * .25, 1.42, 0); g.add(sh); box(sh, .09, .55, .1, tp, 0, -.27, 0); arms.push(sh); }
  const torso = cyl(g, .2, .17, .62, tp, 0, 1.13, 0, 7); torso.scale.z = .62;
  cyl(g, .05, .06, .08, skin, 0, 1.48, 0, 6); const hd = new THREE.Mesh(new THREE.IcosahedronGeometry(.14, 1), skin); hd.position.set(0, 1.64, 0); hd.scale.set(.95, 1.1, 1); g.add(hd);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(.152, 8, 6, 0, Math.PI * 2, 0, Math.PI * .55), hair); cap.position.set(0, 1.67, -.01); g.add(cap);
  if (hairStyle === 'pony') { const pt = box(g, .08, .3, .08, hair, 0, 1.6, -.17); pt.rotation.x = .5; }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.pose = (ph) => { const a = Math.sin(ph) * .7; legs[0].rotation.x = a; legs[1].rotation.x = -a; arms[0].rotation.x = -a; arms[1].rotation.x = a; g.children.forEach(() => {}); };
  s.add(g); return g;
}
function track() {
  const S = makeScene({ bg: '#1a1d2a', hemi: .75, exposure: 1.1, sky: '#b8c4dc', ground: '#3a2a22', bloom: .15, bloomTh: .9, fov: 32 });
  const s = S.s; sun(s, '#fff2dc', 2.2, -6, 10, 6, 16);
  box(s, 60, .02, 30, mat('#3d6a3a'), 0, -.02, 0);
  box(s, 60, .03, 5.2, mat('#b5533f', { rough: .95 }), 0, 0, 0);
  for (let i = 0; i <= 4; i++) box(s, 60, .035, .05, mat('#f4efe6'), 0, .005, -2.6 + i * 1.3);
  const startB = -6, startG = .5;
  box(s, .08, .036, 1.25, mat('#f4efe6'), startB, .006, -.65 + 1.3 * 0 - 0); // lane 2 start (boy)
  box(s, .08, .036, 1.25, mat('#f4efe6'), startG, .006, .65);              // lane 3 start (girl)
  const goalX = 9; box(s, .12, .037, 5.2, mat('#ffffff'), goalX, .007, 0);
  for (const z of [-2.7, 2.7]) cyl(s, .05, .05, 1.6, mat('#eee'), goalX, .8, z, 8);
  box(s, .02, .05, 5.4, mat('#e8d26a'), goalX, 1.45, 0);
  const b = runner(s, M, 'short'); b.position.set(startB, 0, -.65); b.rotation.y = Math.PI / 2;
  const g = runner(s, F, 'pony'); g.position.set(startG, 0, .65); g.rotation.y = Math.PI / 2; g.scale.setScalar(.95);
  return { render() { S.render(); }, update(t, dur) { const k = ease(clamp(t / dur));
    const run = clamp((t - .6) / (dur - .6)), d = 4.2 * run;
    b.position.x = startB + d; g.position.x = startG + d; b.userData.pose(t * 11); g.userData.pose(t * 11 + .6);
    b.position.y = Math.abs(Math.sin(t * 11)) * .05 * (run > 0); g.position.y = Math.abs(Math.sin(t * 11 + .6)) * .05 * (run > 0);
    S.cam.position.set(lerp(.5, 1.5, k), lerp(5.2, 4.8, k), lerp(15.5, 14.5, k)); S.cam.lookAt(lerp(1.0, 1.6, k), .3, 0);
    const o = clamp((t - 2) / .6);
    return `<svg viewBox="0 0 1920 1080" style="position:absolute;inset:0;width:100%;height:100%"><g opacity="${o}">${txt(CX, 150, '努力は効く。でも、スタート地点がそれ以上に離れている', { size: 50, color: Y, serif: true })}</g></svg>`; } };
}
SC[23] = { build: track };
// 24 第3章
SC[24] = K((t) => R(chapEls('第3章', '前払いの中身'), t), 3, { enter: 'zoom', zoom: 0 });
// 25 お金と塾
const coin = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><circle r="60" fill="${Y}"/><circle r="46" fill="none" stroke="#7a5a10" stroke-width="6"/>${txt(0, 18, '円', { size: 50, color: '#7a5a10', shadow: false })}</g>`;
SC[25] = K((t) => R([
  { at: .2, f: (lt) => coin(700, 520, 1.6 * pop(lt / .4)) + txt(700, 720, 'お金', { size: 46, color: Y }) },
  { at: 1.6, f: (lt) => `<g transform="translate(1220,520) scale(${pop(lt / .4)})"><rect x="-140" y="-110" width="280" height="220" rx="14" fill="#cfd4dc"/>${txt(0, 20, '塾', { size: 90, color: '#222', shadow: false, serif: true })}</g>` + txt(1220, 720, '塾・習いごと', { size: 46 }) },
  { at: 3.4, f: () => txt(CX, 280, '真っ先に思いつくのは', { size: 44, color: C.dim }) },
], t), 3, { enter: 'right', zoom: 0 });
// 26 本棚：文化的な環境
SC[26] = K((t) => { let shelf = `<rect x="660" y="300" width="600" height="560" fill="#5a4030"/>`; for (let r = 0; r < 3; r++) { shelf += `<rect x="680" y="${330 + r * 180}" width="560" height="150" fill="#2a1e16"/>`; for (let i = 0; i < 12; i++) { const a = clamp((t - 2.5 - (r * 12 + i) * .05) / .2); shelf += `<rect x="${690 + i * 46}" y="${350 + r * 180 + (i % 3) * 8}" width="38" height="${122 - (i % 3) * 8}" fill="${['#7a3a3a', '#3a5a7a', '#5a7a3a', '#7a6a3a', '#4a4a6a', '#8a5a3a'][(i + r) % 6]}" opacity="${a}"/>`; } }
  return R([{ at: 0, slide: 0, f: () => shelf }, { at: 5.0, f: () => txt(CX, 230, 'もう1つの大きな要素：家の中の文化的な環境', { size: 46, color: Y, serif: true }) }, ref(SR1)], t); }, 3, { enter: 'right', zoom: 0 });
// 27 3D：夜の食卓。親子が並んで本を開く
function table() {
  const S = makeScene({ bg: '#120e0c', hemi: .6, exposure: 1.15, sky: '#f0d8b0', ground: '#2a1e16', bloom: .15, bloomTh: .9, fov: 34 });
  const s = S.s; box(s, 8, .05, 8, mat('#3a2a20'), 0, 0, 0); box(s, 8, 3, .1, mat('#2a2420'), 0, 1.5, -2);
  box(s, 1.8, .06, 1.0, mat('#7a5a40'), 0, .74, -.6); for (const x of [-.85, .85]) for (const z of [-1.05, -.15]) box(s, .06, .72, .06, mat('#4a3628'), x, .36, z);
  const bk = box(s, .5, .02, .34, mat('#efeae0'), 0, .78, -.45); bk.rotation.y = .05; box(s, .02, .03, .34, mat('#c9c2b4'), 0, .79, -.45);
  const p1 = person3(s, { seated: true, back: true, top: '#6a7a8a', bottom: '#3a3a40', hairStyle: 'short' }); p1.position.set(-.3, -.05, .15); p1.rotation.y = Math.PI;
  const p2 = person3(s, { seated: true, back: true, top: '#c98aa3', bottom: '#3a3a40', hairStyle: 'bun' }); p2.position.set(.32, -.25, .15); p2.rotation.y = Math.PI; p2.scale.setScalar(.8);
  lamp(s, '#ffd9a0', 1.4, 5, 0, 2.2, -.5, false); const sh = cyl(s, .35, .2, .25, glow('#ffd9a0', .8), 0, 2.0, -.5, 16);
  return { render() { S.render(); }, update(t, dur) { const k = ease(t / dur); S.cam.position.set(lerp(-.4, .3, k), lerp(1.75, 1.65, k), lerp(1.9, 1.6, k)); S.cam.lookAt(0, .8, -.5); return ''; } };
}
SC[27] = K((t) => R([{ at: 0, slide: 0, bg: true, f: () => photo('read', t, 13, .3) }, { at: 6.5, f: () => txt(CX, 200, '家の習慣が、点数と結びついていた', { size: 52, color: Y, serif: true }) }], t), 3, { enter: 'fade', zoom: 0 });
// 28 1位 読書の習慣、2位 親の期待
SC[28] = K((t) => R([
  { at: 0, f: () => head('家の豊かさそのものを除くと、学力に強く効いていたのは', { y: 190 }) },
  { at: 1.5, f: (lt) => `<g transform="translate(${CX},460) scale(${pop(lt / .4)})"><rect x="-520" y="-70" width="1040" height="140" rx="20" fill="rgba(255,214,102,.15)" stroke="${Y}" stroke-width="4"/>${txt(-440, 22, '1位', { size: 60, color: Y, serif: true })}${txt(40, 22, '読書の習慣（読み聞かせ・新聞）', { size: 50 })}</g>` },
  { at: 7.5, f: (lt) => `<g transform="translate(${CX},660) scale(${pop(lt / .4)})"><rect x="-520" y="-70" width="1040" height="140" rx="20" fill="rgba(255,255,255,.06)" stroke="#cfd4dc" stroke-width="3"/>${txt(-440, 22, '2位', { size: 60, color: '#cfd4dc', serif: true })}${txt(40, 22, '親の「どこまで進学してほしいか」', { size: 50 })}</g>` },
  ref(SR1),
], t), 3, { enter: 'right', zoom: 0 });
// 29 年収や学歴が高くないのに好成績の家：本・新聞・時計
SC[29] = K((t) => R([
  { at: .2, f: (lt) => house(420, 640, 1.3 * pop(lt / .4), HOUSES[0]) + `<path d="M420,470 l14,30 32,4 -24,22 6,32 -28,-16 -28,16 6,-32 -24,-22 32,-4Z" fill="${Y}"/>` + txt(420, 790, '年収・学歴は高くないのに', { size: 32, color: C.dim }) + txt(420, 840, '好成績の子が多い家', { size: 36, color: Y }) },
  { at: 4.5, f: (lt) => `<g transform="translate(980,560) scale(${pop(lt / .4)})"><rect x="-90" y="-110" width="180" height="220" rx="8" fill="#7a3a3a"/>${txt(0, 15, '本', { size: 70, color: '#f1ece2', shadow: false, serif: true })}</g>` },
  { at: 5.5, f: (lt) => `<g transform="translate(1300,560) scale(${pop(lt / .4)})"><rect x="-110" y="-100" width="220" height="200" fill="#e8e4da"/>${[0, 1, 2, 3].map(i => `<rect x="-90" y="${-70 + i * 40}" width="${i ? 180 : 120}" height="${i ? 14 : 26}" fill="#999"/>`).join('')}</g>` + txt(1300, 720, '新聞', { size: 40 }) },
  { at: 9.0, f: (lt) => `<g transform="translate(1620,560) scale(${pop(lt / .4)})"><circle r="110" fill="#efeae0"/><path d="M0,0 L0,-70 M0,0 L50,20" stroke="#222" stroke-width="10" stroke-linecap="round"/></g>` + txt(1620, 720, '規則正しい生活', { size: 40 }) },
  ref(SR2),
], t), 3, { enter: 'right', zoom: 0 });
// 30 お金と家の習慣の2つの歯車
const gear = (x, y, r, rot, col, label) => { let d = ''; for (let i = 0; i < 10; i++) d += `<rect x="${-r * .16}" y="${-r - 18}" width="${r * .32}" height="36" rx="4" fill="${col}" transform="rotate(${i * 36})"/>`;
  return `<g transform="translate(${x},${y})"><g transform="rotate(${rot})">${d}<circle r="${r}" fill="${col}"/></g><circle r="${r * .72}" fill="#1b1a20"/>${txt(0, 14, label, { size: 40, color: col })}</g>`; };
SC[30] = K((t) => R([
  { at: .2, f: () => gear(760, 560, 170, t * 30, Y, 'お金') },
  { at: 1.5, f: () => gear(1140, 520, 190, -t * 27 + 18, '#cfd4dc', '家の習慣') },
  { at: 4.0, f: () => txt(CX, 880, '前払いは、家で何が当たり前になっているかの積み重ね', { size: 44, color: Y, serif: true }) },
  ref('お茶の水女子大学 (2018)'),
], t), 3, { enter: 'right', zoom: 0 });
// 31 第4章
SC[31] = K((t) => R(chapEls('第4章', '前払いには、利子がつく'), t), 4, { enter: 'zoom', zoom: 0 });
// 32 高校生と大学の門
SC[32] = K((t) => R([
  { at: .2, f: (lt) => person(620, 600, 170 * pop(lt / .4), M) + txt(620, 870, '高校3年生', { size: 40 }) },
  { at: 1.4, f: (lt) => `<g transform="translate(1300,690) scale(${pop(lt / .4) * .9})"><path d="M-260,-140 L0,-290 L260,-140 Z" fill="#cfc8b8"/><rect x="-250" y="-150" width="500" height="26" fill="#bfb8a8"/><rect x="-190" y="-130" width="34" height="250" fill="#d8d1c2"/><rect x="-110" y="-130" width="34" height="250" fill="#d8d1c2"/><rect x="-30" y="-130" width="34" height="250" fill="#d8d1c2"/><rect x="50" y="-130" width="34" height="250" fill="#d8d1c2"/><rect x="130" y="-130" width="34" height="250" fill="#d8d1c2"/><rect x="210" y="-130" width="34" height="250" fill="#d8d1c2"/><rect x="-270" y="120" width="540" height="22" fill="#bfb8a8"/><rect x="-300" y="142" width="600" height="22" fill="#a9a293"/>${txt(0, -172, '大学', { size: 40, color: '#2b2733', shadow: false })}</g>` },

  { at: 3.5, f: () => txt(CX, 260, '家の年収ごとに、4年制大学へ進む割合', { size: 48, color: Y, serif: true }) }, ref(SR3),
], t), 4, { enter: 'right', zoom: 0 });
// 33 100人並べたら：31人 vs 62人
SC[33] = K((t) => { const a = Math.round(31 * easeOut(clamp((t - 2.5) / 2))), b = Math.round(62 * easeOut(clamp((t - 6) / 2)));
  return R([
    { at: 0, f: () => head('高校3年生を100人並べると、大学へ進むのは', { y: 170 }) },
    { at: 0, slide: 0, f: () => grid100(170, 330, a, '#b5ad9c') + `<g style="font-variant-numeric:tabular-nums">${txt(377, 900, '年収400万円以下　' + a + '人', { size: 40, color: '#b5ad9c', serif: true })}</g>` },
    { at: 0, slide: 0, f: () => grid100(1130, 330, b, Y) + `<g style="font-variant-numeric:tabular-nums">${txt(1337, 900, '1000万円超　' + b + '人', { size: 40, color: Y, serif: true })}</g>` },
    { at: 9.0, f: (lt) => `<g transform="translate(${CX},590) scale(${pop(lt / .4)})"><circle r="95" fill="#c43a3a"/>${txt(0, 18, '2倍', { size: 64, color: '#fff', shadow: false, serif: true })}</g>` },
    ref(SR3),
  ], t); }, 4, { enter: 'fade', zoom: 0 });
// 34 階段状の棒
const ST = [['400万以下', 31.4], ['600万以下', 43.9], ['800万以下', 49.4], ['1000万以下', 54.8], ['1000万超', 62.4]];
SC[34] = K((t) => R([
  { at: 0, f: () => head('家の年収別：4年制大学に進む割合', { y: 190 }) },
  ...ST.map((s0, i) => ({ at: .5 + i * 1.2, slide: 0, f: (lt) => vbar(420 + i * 270, 840, s0[1] * 8, i == 4 ? Y : '#b5ad9c', s0[1] + '%', s0[0], easeOut(clamp(lt / .8)), 170) })),
  { at: 7.5, f: (lt) => { const k = clamp(lt / 1); const pts = ST.map((s0, i) => [420 + i * 270, 840 - s0[1] * 8 - 90]); let d = `M${pts[0][0] - 90},${pts[0][1]}`; for (let i = 0; i < pts.length; i++) { d += ` L${pts[i][0] + 90},${pts[i][1]}`; if (i < pts.length - 1) d += ` L${pts[i][0] + 90},${pts[i + 1][1]}`; } return `<path d="${d}" fill="none" stroke="${Y}" stroke-width="5" stroke-dasharray="14 10" opacity="${k * .8}"/>` + txt(560, 330, 'きれいな階段', { size: 52, color: Y, serif: true }); } }, ref(SR3),
], t), 4, { enter: 'right', zoom: 0 });
// 35 生涯賃金（男性）：積み上げ
SC[35] = K((t) => { const stackBar = (x, total, col, lab, t0) => { const k = easeOut(clamp((t - t0) / 1.5)); let s0 = '', y = 860; const segs = 8; for (let i = 0; i < segs; i++) { const h = total / segs * 1.9 * clamp(k * segs - i); y -= h; s0 += `<rect x="${x - 110}" y="${y}" width="220" height="${Math.max(0, h - 3)}" fill="${col}" opacity="${.75 + .25 * (i % 2)}"/>`; } return s0 + (k > .95 ? txt(x, 860 - total * 1.9 - 30, (total / 100).toFixed(2) + '億円', { size: 52, color: col, serif: true }) : '') + txt(x, 910, lab, { size: 34, color: C.dim }); };
  return R([
    { at: 0, f: () => head('男性の生涯賃金（およそ）', { y: 190 }) },
    { at: 0, slide: 0, f: () => stackBar(720, 211, '#8a8478', '高校を出てすぐ働く', 2.0) + stackBar(1200, 269, Y, '大学・大学院を出る', 7.0) },
    ref(SR4),
  ], t); }, 4, { enter: 'right', zoom: 0 });
// 36 差5800万円 ÷ 40年 ＝ 毎年140万円 →「利子」
SC[36] = K((t) => R([
  { at: .3, f: (lt) => `<g transform="translate(420,460) scale(${pop(lt / .4)})">${txt(0, 0, '差 約5800万円', { size: 60, color: Y, serif: true })}</g>` },
  { at: 2.5, f: () => txt(CX, 470, '÷ 働く40年 ＝', { size: 56 }) },
  { at: 4.0, f: (lt) => `<g transform="translate(1500,460) scale(${pop(lt / .4)})">${txt(0, 0, '毎年 約140万円', { size: 60, color: Y, serif: true })}</g>` },
  { at: 7.5, f: () => stamp(CX, 720, '利子', t, 7.5, '#c43a3a', 90) },
  { at: 8.5, f: () => txt(CX, 900, '子どものころの前払いが、毎年返ってくる', { size: 44, color: C.dim }) },
  ref(SR4),
], t), 4, { enter: 'fade', zoom: 0 });
// 37 女性
SC[37] = K((t) => R([
  { at: 0, f: () => head('女性の生涯賃金（およそ）', { y: 190 }) },
  { at: .4, slide: 0, f: (lt) => vbar(720, 860, 150 * 2.2, '#8a8478', '1.50億円', '高校を出てすぐ働く', easeOut(clamp(lt / 1)), 220) },
  { at: 1.6, slide: 0, f: (lt) => vbar(1200, 860, 217 * 2.2, F, '2.17億円', '大学・大学院を出る', easeOut(clamp(lt / 1)), 220) },
  { at: 4.5, f: () => txt(1560, 420, '差は、さらに大きい', { size: 44, color: F, serif: true }) }, ref(SR4),
], t), 4, { enter: 'right', zoom: 0 });
// 38 輪になる矢印
const LOOP = ['親の年収', '子どもの成績', '進学', '子どもの年収', 'また次の前払い'];
SC[38] = K((t) => R([
  { at: 0, slide: 0, f: () => { const k = clamp(t / 11); return `<circle cx="${CX}" cy="560" r="315" fill="none" stroke="${Y}" stroke-width="4" stroke-dasharray="${1980 * k} 2000" opacity=".6" transform="rotate(-90 ${CX} 560)"/>`; } },
  ...LOOP.map((s0, i) => ({ at: .3 + i * 2.2, f: (lt) => { const a = -Math.PI / 2 + i * Math.PI * 2 / 5, x = CX + Math.cos(a) * 330, y = 560 + Math.sin(a) * 300; return `<g transform="translate(${x},${y}) scale(${pop(lt / .4)})"><rect x="-150" y="-50" width="300" height="100" rx="50" fill="#2b2733" stroke="${i == 4 ? Y : '#cfd4dc'}" stroke-width="3"/>${txt(0, 14, s0, { size: 36, color: i == 4 ? Y : '#fff' })}</g>`; } })),
], t), 4, { enter: 'right', zoom: 0 });
// 39 団地とタワーマンションの夕景（イラスト）
SC[39] = K((t) => { const G = ['祖父母', '親', '子ども'], xs = [460, 960, 1460], yHi = 430, yLo = 690;
  const els = [{ at: 0, f: () => G.map((g0, i) => txt(xs[i], 875, g0 + 'の代', { size: 34, color: C.dim })).join('') + `<path d="M260,815 L1660,815" stroke="#555" stroke-width="3"/>` }];
  G.forEach((g0, i) => {
    els.push({ at: .3 + i * 1.2, slide: 0, f: (lt) => { const k = pop(lt / .4); return `<g transform="translate(${xs[i]},0)"><g transform="translate(0,${yHi}) scale(${k})">${person(0, 0, 70, Y)}</g><g transform="translate(0,${yLo}) scale(${k})">${person(0, 0, 70, '#8a8478')}</g></g>`; } });
    els.push({ at: .7 + i * 1.2, slide: 0, f: (lt) => { const k = clamp(lt / .4); return `<g opacity="${k}"><path d="M${xs[i] + 110},${yHi - 40} L${xs[i] + 110},${yLo - 40}" stroke="${Y}" stroke-width="4"/><path d="M${xs[i] + 98},${yHi - 40} L${xs[i] + 122},${yHi - 40} M${xs[i] + 98},${yLo - 40} L${xs[i] + 122},${yLo - 40}" stroke="${Y}" stroke-width="4"/>${txt(xs[i] + 150, (yHi + yLo) / 2 - 30, '差', { size: 40, color: Y, anchor: 'start' })}</g>`; } });
    if (i < 2) els.push({ at: 1.0 + i * 1.2, slide: 0, f: (lt) => { const k = clamp(lt / .5); return `<g opacity="${k}">` + arrow(xs[i] + 200, yHi - 40, xs[i + 1] - 90, yHi - 40, Y) + arrow(xs[i] + 200, yLo - 40, xs[i + 1] - 90, yLo - 40, '#8a8478') + '</g>'; } });
  });
  els.push({ at: 3.6, f: () => txt(CX, 230, '世代をまたいで、くり返される', { size: 52, color: Y, serif: true }) });
  return R(els, t); }, 4, { enter: 'fade', zoom: 0 });
// 40 平均の線と、飛び出すピクト
SC[40] = K((t) => R([
  { at: 0, slide: 0, f: () => `<path d="M200,746 L1720,746" stroke="#cfd4dc" stroke-width="4" stroke-dasharray="16 10"/>` + txt(1740, 758, '平均', { size: 34, color: C.dim, anchor: 'start' }) + [0, 1, 2, 3, 4, 5, 6].map(i => kid(360 + i * 190, 700, '#6b665e', 1, 2.4)).join('') },
  { at: 2.5, slide: 0, f: (lt) => kid(360 + 3 * 190, 700 - 360 * easeOut(clamp(lt / .8)), Y, 1, 2.6) },
  { at: 4.0, f: () => txt(CX, 230, 'これは平均の話。親より大きく羽ばたく子も、たくさんいる', { size: 42 }) },
], t), 4, { enter: 'right', zoom: 0 });
// 41 学力の下がり方：下の層ほど大きく下がる（イメージ）
SC[41] = K((t) => { const k = clamp((t - .5) / 5), x0 = 360, x1 = 1350, line = (y0, drop, col) => `<path d="M${x0},${y0} L${x0 + (x1 - x0) * k},${y0 + drop * k}" stroke="${col}" stroke-width="10" stroke-linecap="round"/>`;
  return R([
    { at: 0, f: () => head('学力の変化（家庭の豊かさ別）', { y: 190 }) },
    { at: 0, slide: 0, f: () => line(380, 40, HOUSES[3]) + line(480, 70, HOUSES[2]) + line(580, 110, HOUSES[1]) + line(680, 170, HOUSES[0]) + `<rect x="${x0}" y="880" width="${x1 - x0}" height="3" fill="#6b665e"/>` },
    { at: .3, f: () => ['一番上', '上から2番目', '下から2番目', '一番下'].map((n, i) => txt(x0 - 20, 392 + i * 100, n, { size: 28, color: HOUSES[3 - i], anchor: 'end' })).join('') },
    { at: 5.5, f: () => txt(x1 + 30, 860, '下の層ほど大きく下がる', { size: 36, color: '#ff8a7a', anchor: 'start' }) },
    { at: 9.0, f: () => txt(CX, 300, '皮肉なことに、差は広がりつつある', { size: 50, color: Y, serif: true }) },
    { at: .3, f: () => note(1880, 1000 - 60, '※線の形はイメージ', 'end') }, ref(SR5),
  ], t); }, 4, { enter: 'right', zoom: 0 });
// 42 第5章
SC[42] = K((t) => R(chapEls('第5章', 'それでも、逆転する子'), t), 5, { enter: 'zoom', zoom: 0 });
// 43 レジリエントな生徒：下の家から上の段へ跳ぶ
SC[43] = K((t) => { const k = ease(clamp((t - 4) / 1.2)), arc = Math.sin(Math.PI * clamp((t - 4) / 1.2));
  return R([
    { at: 0, slide: 0, f: () => `<rect x="300" y="760" width="560" height="20" fill="#6b665e"/><rect x="1060" y="420" width="560" height="20" fill="${Y}"/>` + txt(580, 830, '家庭の豊かさ：下から4分の1', { size: 32, color: C.dim }) + txt(1340, 490, '学力：上から4分の1', { size: 32, color: Y }) },
    { at: 0, slide: 0, f: () => person(580 + 760 * k, 620 - 340 * k - 200 * arc, 120, M) },
    { at: 7.0, f: () => txt(700, 250, 'レジリエントな生徒', { size: 66, color: Y, serif: true }) }, ref(SR6),
  ], t); }, 5, { enter: 'right', zoom: 0 });
// 44 日本11.6% vs OECD平均11.3%
SC[44] = K((t) => R([
  { at: 0, f: () => head('レジリエントな生徒の割合（2015年）', { y: 190 }) },
  { at: .4, slide: 0, f: (lt) => hbar(560, 440, 11.6 * 90, 110, Y, '日本', '11.6%', easeOut(clamp(lt / 1))) },
  { at: 2.5, slide: 0, f: (lt) => hbar(560, 620, 11.3 * 90, 110, '#8a8478', 'OECD平均', '11.3%', easeOut(clamp(lt / 1))) },
  ref(SR6),
], t), 5, { enter: 'right', zoom: 0 });
// 45 9人に1人
SC[45] = K((t) => R([
  { at: .2, slide: 0, f: () => [...Array(9)].map((_, i) => kid(400 + i * 140, 620, i == 4 && t > 1.2 ? Y : '#6b665e', 1, 3.2)).join('') },
  { at: 1.6, f: () => txt(CX, 300, 'およそ9人に1人。ゼロではない', { size: 56, color: Y, serif: true }) }, ref(SR6),
], t), 5, { enter: 'fade', zoom: 0 });
// 46 朝の教室（イラスト）
SC[46] = K((t) => R([{ at: 0, slide: 0, bg: true, f: () => photo('class', t, 9, .35) }, { at: 2.0, f: () => txt(CX, 200, '学校の力で、差を縮めることもできる', { size: 52, color: Y, serif: true }) }, ref(SR1)], t), 5, { enter: 'fade', zoom: 0 });
// 47 本・机・学校
SC[47] = K((t) => R([
  { at: .3, f: (lt) => `<g transform="translate(500,540) scale(${pop(lt / .4)})"><rect x="-90" y="-110" width="180" height="220" rx="8" fill="#7a3a3a"/>${txt(0, 15, '本', { size: 70, color: '#f1ece2', shadow: false, serif: true })}</g>` + txt(500, 720, '本を読む習慣', { size: 36 }) },
  { at: 2.0, f: (lt) => `<g transform="translate(960,560) scale(${pop(lt / .4)})"><rect x="-150" y="-20" width="300" height="24" fill="#8a6a4a"/><rect x="-130" y="4" width="16" height="100" fill="#6a5040"/><rect x="114" y="4" width="16" height="100" fill="#6a5040"/></g>` + txt(960, 720, '毎日少しでも机に', { size: 36 }) },
  { at: 4.0, f: (lt) => `<g transform="translate(1420,540) scale(${pop(lt / .4)})"><rect x="-180" y="-30" width="360" height="140" fill="#cfd4dc"/><rect x="-50" y="-120" width="100" height="90" fill="#cfd4dc"/><circle cy="-80" r="28" fill="#2b2733"/><path d="M0,-80 L0,-98 M0,-80 L12,-74" stroke="#cfd4dc" stroke-width="4"/><rect x="-160" y="-10" width="34" height="26" fill="#5a6a7a"/><rect x="-110" y="-10" width="34" height="26" fill="#5a6a7a"/><rect x="-60" y="-10" width="34" height="26" fill="#5a6a7a"/><rect x="26" y="-10" width="34" height="26" fill="#5a6a7a"/><rect x="76" y="-10" width="34" height="26" fill="#5a6a7a"/><rect x="126" y="-10" width="34" height="26" fill="#5a6a7a"/><rect x="-160" y="40" width="34" height="26" fill="#5a6a7a"/><rect x="-110" y="40" width="34" height="26" fill="#5a6a7a"/><rect x="-60" y="40" width="34" height="26" fill="#5a6a7a"/><rect x="26" y="40" width="34" height="26" fill="#5a6a7a"/><rect x="76" y="40" width="34" height="26" fill="#5a6a7a"/><rect x="126" y="40" width="34" height="26" fill="#5a6a7a"/><rect x="-22" y="50" width="44" height="60" fill="#5a6a7a"/></g>` + txt(1420, 720, '学校が支える', { size: 36 }) },
  { at: 7.0, f: () => txt(CX, 880, 'お金がなくても始められる、前払い', { size: 50, color: Y, serif: true }) },
], t), 5, { enter: 'right', zoom: 0 });
// ===== エピローグ =====
SC[48] = K((t) => R([
  { at: .3, slide: 0, f: () => txt(CX - 20, 520, '子どもの成績は、親の年収で、', { size: 70, serif: true }) + txt(CX - 70, 650, '前払い', { size: 110, serif: true, color: Y }) + txt(CX + 140, 650, 'されている。', { size: 70, serif: true, anchor: 'start' }) },
  { at: 2.5, f: () => txt(CX, 820, '── 気のせいではない', { size: 46, color: C.dim }) },
], t), 6, { enter: 'fade', zoom: 0 });
SC[49] = K((t) => R([
  { at: .2, f: () => person(560, 640, 150, M) + `<rect x="420" y="740" width="10" height="100" fill="#fff"/>` + person(900, 520, 150, F, 'f') + `<rect x="760" y="620" width="10" height="100" fill="#fff"/>` + txt(730, 900, 'ずれたスタートライン', { size: 36, color: C.dim }) },
  ...LOOP.slice(0, 4).map((s0, i) => ({ at: 4 + i * .8, f: (lt) => { const a = -Math.PI / 2 + i * Math.PI / 2, x = 1420 + Math.cos(a) * 285, y = 560 + Math.sin(a) * 250; return `<g transform="translate(${x},${y}) scale(${pop(lt / .4) * .8})"><rect x="-140" y="-44" width="280" height="88" rx="44" fill="rgba(255,214,102,.12)" stroke="#cfd4dc" stroke-width="3"/>${txt(0, 12, s0, { size: 32 })}</g>`; } })),
  { at: 7.0, f: () => stamp(1420, 560, '利子', t, 7.0, '#c43a3a', 60) },
], t), 6, { enter: 'right', zoom: 0 });
SC[50] = K((t) => R([
  { at: .2, f: (lt) => `<g transform="translate(760,540) scale(${pop(lt / .4)})"><rect x="-90" y="-110" width="180" height="220" rx="8" fill="#7a3a3a"/>${txt(0, 15, '本', { size: 70, color: '#f1ece2', shadow: false, serif: true })}</g>` },
  { at: 1.0, f: (lt) => `<g transform="translate(1160,540) scale(${pop(lt / .4)})"><rect x="-110" y="-100" width="220" height="200" fill="#e8e4da"/>${[0, 1, 2, 3].map(i => `<rect x="-90" y="${-70 + i * 40}" width="${i ? 180 : 120}" height="${i ? 14 : 26}" fill="#999"/>`).join('')}</g>` },
  { at: 2.5, f: () => txt(CX, 820, '努力は確かに点数を上げる。家の習慣は、お金がなくても始められる', { size: 40 }) },
], t), 6, { enter: 'right', zoom: 0 });
// 51 「努力しだい」が半分だけ光る
SC[51] = K((t) => { const k = clamp((t - 3) / 1.5); return R([
  { at: .2, slide: 0, f: () => `<defs><clipPath id="hl"><rect x="0" y="0" width="${CX}" height="1080"/></clipPath><clipPath id="hr"><rect x="${CX}" y="0" width="${CX}" height="1080"/></clipPath></defs>`
      + `${txt(CX - 65, 560, '勉強は、', { size: 110, serif: true, color: Y, anchor: 'end' })}<g opacity="${1 - .7 * k}" transform="translate(${30 * k},0)">${txt(CX - 35, 560, '努力しだい', { size: 110, serif: true, color: '#8a8478', anchor: 'start' })}</g>` },
  { at: 3.5, f: () => txt(CX - 270, 720, '半分は本当', { size: 40, color: Y }) + txt(CX + 270, 720, '半分は、前払いを受けた側の言葉', { size: 40, color: '#8a8478' }) },
], t); }, 6, { enter: 'fade', zoom: 0 });
SC[52] = K((t) => R([
  { at: .3, f: (lt) => `<g transform="translate(${CX},460) scale(${pop(lt / .45)})"><rect x="-150" y="-110" width="300" height="200" rx="30" fill="${Y}"/><path d="M-40,88 L-70,150 L20,90Z" fill="${Y}"/>${[-60, 0, 60].map(x => `<circle cx="${x}" cy="-10" r="16" fill="#1b1a20"/>`).join('')}</g>` },
  { at: 1.0, f: () => txt(CX, 720, '子どものころ、あなたの家に本や新聞はあった？', { size: 52, serif: true }) },
  { at: 2.4, f: () => txt(CX, 810, 'コメント欄で教えてください', { size: 42, color: C.dim }) },
], t), 6, { enter: 'right', zoom: 0 });
SC[53] = K((t) => R([
  { at: .3, f: () => txt(CX, 380, '今日のネタバレは、ここまで', { size: 64, serif: true }) },
  { at: 2.0, f: (lt) => `<g transform="translate(${CX - 230},600) scale(${pop(lt / .4)})"><rect x="-200" y="-56" width="400" height="112" rx="56" fill="#e0453a"/>${txt(0, 16, 'チャンネル登録', { size: 44, color: '#fff' })}</g>` },
  { at: 2.6, f: (lt) => `<g transform="translate(${CX + 230},600) scale(${pop(lt / .4)})"><rect x="-200" y="-56" width="400" height="112" rx="56" fill="rgba(255,255,255,.1)" stroke="#fff" stroke-width="3"/>${txt(0, 16, '高評価', { size: 44, color: '#fff' })}</g>` },
  { at: 4.8, f: () => txt(CX, 820, 'また次のネタバレで', { size: 44, color: Y }) },
], t), 6, { enter: 'right', zoom: 0 });

export const SCENES = SC;
