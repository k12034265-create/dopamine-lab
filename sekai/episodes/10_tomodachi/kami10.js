// 10 大人になると友達は減る — 名前を付けた言葉：「200時間の壁」
// 前半（プロローグ〜第2章、場面0〜25）の試作
import { THREE, makeScene, mat, glow, box, cyl, ball, lamp, sun, lerp, rng, camMove } from '/pipeline3d/lib3d.js';
import { human } from '/pipeline3d/sets3d.js';
import { C, clamp, ease, easeOut, pop, txt, note, head, person, card, arrow, loadMaps, run, kami, donut } from '/pipeline3d/kami.js';
await loadMaps();
try { document.body.classList.add('band'); } catch (e) {}
const M = '#4f8fea', F = '#ef7fa8', Y = C.gold, RED = '#e0453a', CX = 960, FAM = '#7fc4a0', OTH = '#e8b04a';
const CH = ['プロローグ', '第1章', '第2章', '第3章', '第4章', 'エピローグ'];
const K = (fn, chap, o = {}) => kami(fn, { chap, chaps: CH, ...o });
const R = (els, t) => { const rf = els.filter(e => e.ref), ot = els.filter(e => !e.ref); const o = ot.length && ot[0].bg ? [ot[0], ...rf, ...ot.slice(1)] : [...rf, ...ot]; return run(o.map(e => e.f ? e : { ...e, f: () => '' }), t); };
const ref = (s) => ({ at: .6, ref: true, f: () => note(1880, 58, s, 'end') });
const SR_SS = '総務省「社会生活基本調査」（2021年）';
const SR_HALL = 'Hall (2018) Journal of Social and Personal Relationships';
const SR_BH = 'Bhattacharya ほか (2016) Royal Society Open Science';
const IMG = (n) => `/episodes/10_tomodachi/img/${n}.jpg`;
const roll = (x, y, a, b, t, t0, dur, o = {}) => { const k = ease(clamp((t - t0) / dur)), v = a + (b - a) * k; const s0 = o.dec ? v.toFixed(o.dec) : Math.round(v).toLocaleString('ja-JP'); return `<g style="font-variant-numeric:tabular-nums">${txt(x, y, (o.pre || '') + s0 + (o.unit || ''), { size: o.size || 96, color: o.color || Y, serif: true, anchor: o.anchor })}</g>`; };
const stampR = (x, y, s0, t, t0, col = RED, size = 56) => { const st = clamp((t - t0) / .25); return t > t0 ? `<g transform="translate(${x},${y}) rotate(-10) scale(${1.6 - .6 * st})" opacity="${st}"><rect x="${-s0.length * size * .55 - 26}" y="-${size}" width="${s0.length * size * 1.1 + 52}" height="${size * 2}" rx="12" fill="rgba(20,18,24,.6)" stroke="${col}" stroke-width="8"/>${txt(0, size * .34, s0, { size, color: col, shadow: false, serif: true })}</g>` : ''; };
// 砂時計（x,y=中心、h=高さ、k=上の砂が落ちた割合）
const hourglass = (x, y, h, k, col = Y, o = {}) => { const w = h * .62, top = y - h / 2, bot = y + h / 2, neck = 10;
  const up = (1 - k), dn = k;
  const frame = `<rect x="${x - w / 2 - 16}" y="${top - 18}" width="${w + 32}" height="16" rx="6" fill="#8a6a44"/><rect x="${x - w / 2 - 16}" y="${bot + 2}" width="${w + 32}" height="16" rx="6" fill="#8a6a44"/>`;
  const glass = `<path d="M${x - w / 2},${top} L${x + w / 2},${top} L${x + neck},${y} L${x + w / 2},${bot} L${x - w / 2},${bot} L${x - neck},${y} Z" fill="rgba(200,220,255,.08)" stroke="rgba(220,230,255,.55)" stroke-width="4"/>`;
  const hu = (h / 2 - 16) * up, wu = (w / 2 - 8) * up;
  const sandUp = up > .01 ? `<path d="M${x - wu},${y - 8 - hu} L${x + wu},${y - 8 - hu} L${x + 4},${y - 6} L${x - 4},${y - 6} Z" fill="${col}"/>` : '';
  const hd = (h / 2 - 16) * Math.sqrt(dn), wd = (w / 2 - 8) * Math.sqrt(dn);
  const sandDn = dn > .01 ? `<path d="M${x - wd},${bot - 6} L${x + wd},${bot - 6} L${x},${bot - 6 - hd} Z" fill="${col}"/>` : '';
  const stream = (o.flow && up > .01) ? `<rect x="${x - 2}" y="${y - 6}" width="4" height="${h / 2 - 2}" fill="${col}" opacity=".85"/>` : '';
  return frame + sandUp + stream + sandDn + glass; };
const SC = [];

// ===== 写真の部品 =====
const OVD = `<defs><filter id="ts2" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity=".7"/></filter><linearGradient id="topg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".65"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>`;
const ovSvg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0">${OVD}${inner}</svg>`;
const otxt = (x, y, s0, size, color = '#fff', serif = true, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${color}" filter="url(#ts2)" font-weight="700" style="font-family:${serif ? "'Noto Serif CJK JP',serif" : "'Noto Sans CJK JP',sans-serif"}">${s0}</text>`;
const photoSvg = (n, k, dark = .3) => { const z = 1 + .07 * ease(k);
  return `<g transform="translate(960,540) scale(${z.toFixed(4)}) translate(-960,-540)"><image href="${IMG(n)}" x="-40" y="-40" width="2000" height="1160" preserveAspectRatio="xMidYMid slice"/></g><rect width="1920" height="1080" fill="rgba(8,10,18,${dark})"/>`; };

// ===== プロローグ =====
// 0 写真（友達と遊ぶ若者）→ 22分 → 10分 → 半分以下
SC[0] = { kind: 'kami', build() { return { render() {}, update(t, dur) {
  const a = clamp((t - .3) / .5), b = clamp((t - 4.3) / .5);
  const box1 = `<g opacity="${a}">` + `<rect x="120" y="170" width="620" height="300" rx="24" fill="rgba(12,12,18,.62)"/>` + otxt(430, 245, '20代前半', 44, '#fff', false) + otxt(430, 410, '', 10) + '</g>';
  const n1 = t > .3 ? `<g opacity="${a}">${otxt(430, 420, Math.round(22 * ease(clamp((t - .4) / 1.2))) + '分', 150, Y)}</g>` : '';
  const box2 = `<g opacity="${b}">` + `<rect x="1180" y="170" width="620" height="300" rx="24" fill="rgba(12,12,18,.62)"/>` + otxt(1490, 245, '30代前半', 44, '#fff', false) + otxt(1490, 420, Math.round(22 - 12 * ease(clamp((t - 4.4) / 1.4))) + '分', 150, '#9ec8ff') + '</g>';
  const ar = t > 4.3 ? `<g opacity="${b}"><path d="M790,330 L${790 + 330 * easeOut(clamp((t - 4.3) / .6))},330" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M${1090 + 30 * easeOut(clamp((t - 4.3) / .6)) - 30},300 l40,30 l-40,30" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="${clamp((t - 4.7) / .2)}"/></g>` : '';
  const lab = `<g opacity="${a}">${otxt(960, 110, '友達と遊ぶ時間（1日平均）', 50, '#fff')}</g>`;
  const st = t > 7.8 ? (() => { const s = clamp((t - 7.8) / .25); return `<g transform="translate(1490,640) rotate(-10) scale(${1.6 - .6 * s})" opacity="${s}"><rect x="-230" y="-70" width="460" height="140" rx="14" fill="rgba(20,18,24,.6)" stroke="${RED}" stroke-width="9"/>${otxt(0, 24, '半分以下', 72, RED)}</g>`; })() : '';
  const fade = Math.min(1, clamp(t / .3), 1 - clamp((t - (dur - .35)) / .35));
  return `<div style="position:absolute;left:0;top:0;width:1920px;height:1080px;background:#000"><div style="position:absolute;left:0;top:0;width:1920px;height:1080px;opacity:${fade.toFixed(3)}">` + ovSvg(photoSvg('A', t / dur, .38) + `<rect width="1920" height="300" fill="url(#topg)"/>` + lab + box1 + n1 + box2 + ar + st + `<text x="1880" y="58" text-anchor="end" font-size="24" fill="#cfc8bc" filter="url(#ts2)" style="font-family:'Noto Sans CJK JP',sans-serif">${SR_SS}</text>`) + '</div></div>'; } }; } };

// 2 3枚の札が落ちてくる
const TAGS = [['忙しくなった', .05], ['結婚した', 1.2], ['気が合わなくなった', 2.2]];
SC[2] = K((t) => { let g = '';
  TAGS.forEach(([s0, t0], i) => { if (t < t0) return; const k = clamp((t - t0) / .55), y = -200 + (480 + i * 40 + 200) * easeOut(k) + Math.sin(k * Math.PI) * -20, rot = (i - 1) * 8 * (1 - k) + (i - 1) * 4;
    const x = 480 + i * 480, w = 70 + s0.length * 46;
    g += `<g transform="translate(${x},${y}) rotate(${rot})"><path d="M0,-90 L0,-30" stroke="#a49c90" stroke-width="3"/><circle cx="0" cy="-30" r="8" fill="#a49c90"/>` + card(-w / 2, -20, w, 120, { fill: '#efe6d2', stroke: '#c8b894' }) + txt(0, 60, s0, { size: 46, color: '#2a2420', shadow: false, serif: true }) + '</g>'; });
  const q = clamp((t - 3.8) / .4);
  return R([
    { at: 0, slide: 0, f: () => g },
    { at: 3.8, f: () => `<g transform="translate(960,860) scale(${pop(q)})">` + txt(0, 0, 'よく言われる理由', { size: 44, color: C.dim }) + '</g>' },
  ], t); }, 0, { enter: 'fade', zoom: 0 });

// 3 ハート → 砂時計
const heart = (x, y, s, col) => `<path transform="translate(${x},${y}) scale(${s})" d="M0,30 C-60,-20 -100,-70 -55,-105 C-25,-128 0,-108 0,-85 C0,-108 25,-128 55,-105 C100,-70 60,-20 0,30 Z" fill="${col}"/>`;
SC[3] = K((t) => { const sw = ease(clamp((t - 4.6) / .8)), k = clamp((t - 7.1) / 3.5);
  return R([
    { at: 0, slide: 0, f: () => `<g opacity="${(1 - sw * .75).toFixed(3)}">` + heart(620, 520, 2.1, '#e0607a') + txt(620, 760, '気持ち', { size: 56, serif: true }) + '</g>' },
    { at: 4.6, dx: 80, slide: 0, f: () => hourglass(1300, 460, 360, k, Y, { flow: t > 7.1 }) + txt(1300, 780, '時間', { size: 72, serif: true, color: Y }) },
    { at: 4.8, f: () => txt(960, 885, '友達は、時間でできる', { size: 50, serif: true, color: '#fff' }) },
  ], t); }, 0, { enter: 'fade', zoom: 0 });

// 4 200時間の壁：道を歩く人の前に壁がせり上がる
SC[4] = K((t) => { const walk = clamp(t / 5.0), px = 300 + 980 * easeOut(walk), wall = ease(clamp((t - 5.1) / .9));
  const flags = [[300, '0時間'], [1640, '200時間']].map(([x, s0]) => `<path d="M${x},700 L${x},560" stroke="#c8c0b0" stroke-width="6"/><path d="M${x},560 l70,22 l-70,22 Z" fill="${x > 1000 ? Y : '#c8c0b0'}"/>` + txt(x, 760, s0, { size: 38, color: x > 1000 ? Y : C.fg })).join('');
  const road = `<rect x="200" y="700" width="1560" height="20" rx="10" fill="#4a4652"/>`;
  const wl = wall > 0 ? `<g><rect x="1440" y="${700 - 420 * wall}" width="90" height="${420 * wall}" fill="#6a5c50"/>` + [...Array(8)].map((_, i) => (700 - (i + 1) * 52 > 700 - 420 * wall) ? `<path d="M1440,${700 - (i + 1) * 52} h90" stroke="#4a3e36" stroke-width="4"/>` : '').join('') + '</g>' : '';
  return R([
    { at: 0, slide: 0, f: () => road + flags + person(px, 630, 50, M) + wl },
    { at: 5.4, f: () => `<g transform="translate(1485,${230}) scale(${pop(clamp((t - 5.4) / .4))})">` + txt(0, 0, '200時間の壁', { size: 84, serif: true, color: Y }) + '</g>' },
    { at: 1.2, f: () => txt(760, 420, '知り合い → 親友', { size: 46, color: C.dim }) },
    ref(SR_HALL),
  ], t); }, 0, { enter: 'fade', zoom: 0 });

// 5 4枚のカード
const FOUR = [['①', '友達の時間'], ['②', '200時間'], ['③', '3つの条件'], ['④', '減るのは悪い？']];
SC[5] = K((t) => R([
  { at: 0, f: () => head('大人が友達を作れなくなる理由', { y: 260, size: 58 }) },
  ...FOUR.map(([n, s0], i) => ({ at: .6 + i * .6, dx: 160, slide: 0, f: () => card(170 + i * 400, 430, 360, 280) + txt(350 + i * 400, 530, n, { size: 60, color: Y, serif: true }) + txt(350 + i * 400, 630, s0, { size: i === 3 ? 40 : 46 }) })),
], t), 0, { enter: 'fade', zoom: 0 });

// ===== 第1章 =====
// 6 社会生活基本調査：1日を15分きざみで書く（96マス）＋約19万人
SC[6] = K((t) => { let g = ''; const n = Math.floor(clamp((t - 3.2) / 5.5) * 96);
  const cols = ['#5a6fa8', '#5a6fa8', '#5a6fa8', '#5a6fa8', '#c08a4a', '#c08a4a', '#7fa86a', Y, '#8a6a9a'];
  for (let i = 0; i < 96; i++) { const x = 330 + (i % 12) * 62, y = 300 + Math.floor(i / 12) * 62, h = Math.floor(i / 4);
    const c = i < n ? cols[(Math.floor(i / 11) + (i % 7 === 0 ? 3 : 0)) % cols.length] : '#2c2a34';
    g += `<rect x="${x}" y="${y}" width="52" height="52" rx="6" fill="${c}"/>`; }
  const hours = [0, 6, 12, 18].map((hh, i) => txt(300, 340 + i * 124, hh + '時', { size: 26, color: C.dim, anchor: 'end' })).join('');
  return R([
    { at: 2.1, f: () => head('社会生活基本調査（総務省・5年に1度）', { y: 190 }) },
    { at: 2.4, slide: 0, f: () => g + hours + txt(698, 840, '1日を15分ずつ、96マスに書く', { size: 36, color: C.dim }) },
    { at: 1.8, dx: 120, f: () => card(1180, 330, 560, 380, { fill: 'rgba(240,200,90,.1)', stroke: Y }) + txt(1460, 420, '10歳以上', { size: 40, color: C.dim }) + roll(1460, 560, 0, 19, t, 2.0, 2.0, { unit: '万人', size: 110 }) + txt(1460, 650, '約', { size: 36, color: C.dim }) },
    ref(SR_SS),
  ], t); }, 1, { enter: 'zoom', zoom: 0 });

// 7 1日のドーナツ：交際・付き合いの切れだけ飛び出す（全年齢の平均）
const DAY = [['食事・身の回り', 183, '#7a6a5a'], ['家事・育児・買い物', 130, '#5a7a6a'], ['趣味・スポーツ', 61, '#8a7a4a'], ['交際・付き合い', 10, Y], ['睡眠', 474, '#3e4a78'], ['仕事・学業', 246, '#6a5a8a'], ['テレビ・休養', 245, '#4a6a8a'], ['移動・通勤', 53, '#5a5a6a'], ['その他', 38, '#4a4652']];
SC[7] = K((t) => { const p = clamp(t / 1.8), pop1 = easeOut(clamp((t - 1.6) / .6));
  const segs = DAY.map(([l, v, c]) => ({ v, c: l === '交際・付き合い' ? null : c }));
  let a0 = -Math.PI / 2; const tot = DAY.reduce((s, d) => s + d[1], 0); let hi = 0; for (const d of DAY) { const da = 2 * Math.PI * d[1] / tot; if (d[0] === '交際・付き合い') { hi = a0 + da / 2; break; } a0 += da; }
  const da = 2 * Math.PI * 10 / tot, off = 46 * pop1, cx = 760 + off * Math.cos(hi), cy = 560 + off * Math.sin(hi), r = 250;
  const slice = p >= .99 ? `<path d="M${(cx + r * Math.cos(hi - da / 2 - .015)).toFixed(1)},${(cy + r * Math.sin(hi - da / 2 - .015)).toFixed(1)} A${r},${r} 0 0 1 ${(cx + r * Math.cos(hi + da / 2 + .015)).toFixed(1)},${(cy + r * Math.sin(hi + da / 2 + .015)).toFixed(1)}" stroke="${Y}" stroke-width="110" fill="none"/>` : '';
  const lx = 760 + 420 * Math.cos(hi), ly = 560 + 420 * Math.sin(hi);
  return R([
    { at: 0, f: () => head('1日（24時間）の使い方', { y: 190 }) },
    { at: 0, slide: 0, f: () => donut(760, 560, 250, segs, p, { sw: 100 }) + slice + txt(760, 575, '24時間', { size: 52, color: C.dim }) },
    { at: 2.0, slide: 0, f: () => `<path d="M${cx + 300 * Math.cos(hi)},${cy + 300 * Math.sin(hi)} L${lx},${ly} L${lx + 120},${ly}" stroke="${Y}" stroke-width="4" fill="none"/>` + txt(lx + 140, ly + 16, '交際・付き合い', { size: 52, color: Y, anchor: 'start', serif: true }) },
    { at: 3.4, dx: 80, f: () => txt(1150, ly + 110, '友達や知り合いと会う・話す・食事する', { size: 34, anchor: 'start', color: C.fg }) },
    ref(SR_SS),
  ], t); }, 1, { enter: 'right', zoom: 0 });

// 8 年齢別の棒グラフ 22 → 15 → 10 → 8 → 8
const AGE8 = [['20〜24歳', 22, 4.4], ['25〜29歳', 15, 8.9], ['30〜34歳', 10, 11.2], ['35〜39歳', 8, 13.2], ['40〜44歳', 8, 13.6]];
SC[8] = K((t) => { const base = 820, x0 = 420, bw = 170, gap = 60, s = 18; let g = '';
  AGE8.forEach(([l, v, t0], i) => { const k = easeOut(clamp((t - t0) / .8)), h = v * s * k, x = x0 + i * (bw + gap), col = i === 0 ? Y : '#9aa6c8';
    g += txt(x + bw / 2, base + 56, l, { size: 34, color: C.fg }) ; if (t < t0) return;
    g += `<rect x="${x}" y="${base - h}" width="${bw}" height="${h}" rx="10" fill="${col}"/>` + (k > .4 ? txt(x + bw / 2, base - h - 24, v + '分', { size: 62, color: col, serif: true }) : ''); });
  return R([
    { at: 0, f: () => head('交際・付き合いの時間（1日平均・2021年）', { y: 190 }) },
    { at: 0, slide: 0, f: () => g + `<path d="M${x0 - 30},${base} h${5 * (bw + gap) + 20}" stroke="${C.gray}" stroke-width="4"/>` },
    { at: 13.6, f: () => `<path d="M${x0 + bw / 2},${base - 22 * s - 90} C${x0 + 500},${base - 22 * s - 140} ${x0 + 900},${base - 8 * s - 140} ${x0 + 4 * (bw + gap) + bw / 2},${base - 8 * s - 90}" stroke="${RED}" stroke-width="6" fill="none" stroke-dasharray="14 10"/>` },
    ref(SR_SS),
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 9 7日間のカレンダー：会った日は長く、会わない日は0 → 平均22分
const WEEK = ['月', '火', '水', '木', '金', '土', '日'];
SC[9] = K((t) => { const base = 760, s = 1.9; let g = '';
  WEEK.forEach((d, i) => { const x = 380 + i * 170, v = i === 5 ? 154 : 0, k = easeOut(clamp((t - .4 - i * .25) / .6)), h = v * s * k;
    g += card(x, 360, 130, 460, { fill: 'rgba(255,255,255,.04)' }) + txt(x + 65, 410, d, { size: 40, color: i === 5 ? Y : C.fg });
    if (v) g += `<rect x="${x + 25}" y="${base - h}" width="80" height="${h}" rx="8" fill="${Y}"/>` + (k > .5 ? txt(x + 65, base - h - 18, '2時間34分', { size: 26, color: Y }) : '');
    else if (k > .5) g += txt(x + 65, base + 42, '0分', { size: 34, color: C.dim }); });
  const av = clamp((t - 3.2) / .8), ay = base - 22 * s;
  return R([
    { at: 0, f: () => head('平均22分とは（例）', { y: 190 }) },
    { at: 0, slide: 0, f: () => g },
    { at: 3.2, slide: 0, f: () => `<path d="M360,${ay} h${1220 * av}" stroke="${RED}" stroke-width="5" stroke-dasharray="14 10"/>` + txt(1600, ay + 12, '平均 22分', { size: 44, color: RED, anchor: 'start' }) },
    { at: 3.6, f: () => txt(980, 880, '会わなかった日も入れて割った数', { size: 36, color: C.dim }) },
  ], t); }, 1, { enter: 'left', zoom: 0 });

// 10 ある1日に友達と会った人：10人に1人 → 22人に1人
SC[10] = K((t) => { const row = (y, n, t0, col, lab) => { if (t < t0) return ''; let g = ''; const sh = Math.floor(n * easeOut(clamp((t - t0) / .8))), w = Math.min(120, 1480 / n);
    for (let i = 0; i < sh; i++) { const lit = i === Math.floor(n / 2); g += person(260 + i * w + w / 2, y, w * .36, lit ? col : '#5a5662'); if (lit && t > t0 + .9) g += `<circle cx="${260 + i * w + w / 2}" cy="${y - w * .2}" r="${w * .75}" fill="${col}" opacity=".2"/>`; }
    return g + txt(200, y + 10, lab, { size: 38, anchor: 'end', color: col }); };
  return R([
    { at: 0, f: () => head('ある1日に、友達と会った人', { y: 190 }) },
    { at: 4.5, slide: 0, f: () => row(420, 10, 4.5, Y, '20代前半') + (t > 5.4 ? txt(1540, 300, '10人に1人', { size: 64, color: Y, serif: true }) : '') },
    { at: 7.0, slide: 0, f: () => row(720, 22, 7.0, '#9ec8ff', '40代') + (t > 8.0 ? txt(1540, 610, '22人に1人', { size: 64, color: '#9ec8ff', serif: true }) : '') },
    ref(SR_SS),
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 12 家族でも職場の人でもない人と過ごした時間 64分 → 27分
SC[12] = K((t) => { const bar = (y, v, t0, col, lab) => { if (t < t0) return ''; const k = easeOut(clamp((t - t0) / .9)), w = v * 16 * k;
    return txt(560, y + 62, lab, { size: 42, anchor: 'end' }) + `<rect x="600" y="${y}" width="${w}" height="90" rx="10" fill="${col}"/>` + (k > .3 ? txt(600 + w + 24, y + 70, v + '分', { size: 72, color: col, anchor: 'start', serif: true }) : ''); };
  return R([
    { at: 0, f: () => head('家族でも職場の人でもない人と過ごした時間', { y: 190, size: 50 }) },
    { at: 3.7, f: () => `<g transform="translate(960,300)">${card(-230, -44, 460, 70, { fill: 'rgba(240,200,90,.14)', stroke: Y })}${txt(0, 6, '友達は、ここに入る', { size: 36, color: Y })}</g>` },
    { at: 5.5, slide: 0, f: () => bar(420, 64, 5.5, OTH, '20代前半') },
    { at: 8.0, slide: 0, f: () => bar(620, 27, 8.0, '#9ec8ff', '40代前半') },
    { at: 10.1, slide: 0, f: () => stampR(1460, 820, '半分以下', t, 10.1) },
    ref('総務省「社会生活基本調査」（2021年）一緒にいた人別'),
  ], t); }, 1, { enter: 'right', zoom: 0 });

// 13 2つのタンク：家族・職場以外の人 64→27分、家族 171→325分。粒が左から右へ流れる
const tank = (x, top, h, w, v, vmax, col, lab) => { const lv = h * v / vmax; return `<rect x="${x - w / 2}" y="${top}" width="${w}" height="${h}" rx="18" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.25)" stroke-width="4"/><rect x="${x - w / 2 + 8}" y="${top + h - lv + 8}" width="${w - 16}" height="${Math.max(0, lv - 16)}" rx="12" fill="${col}"/>` + txt(x, top + h + 50, lab, { size: 38, color: col }); };
SC[13] = K((t) => { const k = ease(clamp((t - 3.4) / 6.0)), vL = 64 - 37 * k, vR = 171 + 154 * k;
  let dots = ''; if (t > 3.4 && t < 9.6) for (let i = 0; i < 9; i++) { const ph = ((t * .9 + i / 9) % 1), x = 640 + 640 * ph, y = 420 - Math.sin(ph * Math.PI) * 120; dots += `<circle cx="${x}" cy="${y}" r="9" fill="${Y}" opacity="${(.9 - .4 * Math.abs(ph - .5)).toFixed(2)}"/>`; }
  return R([
    { at: 0, f: () => head('減った時間は、どこへ行ったのか', { y: 190 }) },
    { at: .3, slide: 0, f: () => tank(560, 380, 380, 220, vL, 340, OTH, '家族・職場以外の人') + roll(560, 350, 64, 27, t, 3.4, 6.0, { unit: '分', size: 64, color: OTH }) },
    { at: .6, slide: 0, f: () => tank(1360, 380, 380, 220, vR, 340, FAM, '家族') + roll(1360, 350, 171, 325, t, 3.4, 6.0, { unit: '分', size: 64, color: FAM }) },
    { at: 3.4, slide: 0, f: () => dots },
    { at: 9.4, f: () => txt(1500, 600, 'ほぼ2倍', { size: 54, color: FAM, serif: true, anchor: 'start' }) },
    ref('総務省「社会生活基本調査」（2021年）20代前半→40代前半'),
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 14 連絡相手の数の山：25歳が頂上（写真のあと）
SC[14] = K((t) => { const ax = (a) => 300 + (a - 18) * 26, ay = (v) => 840 - v * 22;
  const pts = [[18, 14], [21, 17], [25, 19], [29, 17], [33, 15], [37, 13], [40, 12], [45, 11.5], [50, 11.5], [55, 11], [60, 9.5], [65, 8], [70, 7]];
  const k = clamp((t - 3.4) / 4.0), n = Math.max(2, Math.ceil(pts.length * k)); const vis = pts.slice(0, n);
  const d = vis.map((p, i) => (i ? 'L' : 'M') + ax(p[0]) + ',' + ay(p[1])).join(' ');
  return R([
    { at: 3.0, f: () => head('連絡を取る相手の数（年齢別・イメージ）', { y: 190 }) },
    { at: 3.2, slide: 0, f: () => `<path d="M${ax(18)},820 h${ax(70) - ax(18)}" stroke="${C.gray}" stroke-width="4"/>` + [20, 30, 40, 50, 60, 70].map(a => txt(ax(a), 870, a + '歳', { size: 30, color: C.dim })).join('') + `<path d="${d}" stroke="#9ec8ff" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>` },
    { at: 7.2, f: () => `<circle cx="${ax(25)}" cy="${ay(19)}" r="16" fill="${Y}"/><path d="M${ax(25)},${ay(19) - 24} L${ax(25)},${ay(19) - 90}" stroke="${Y}" stroke-width="4"/>` + txt(ax(25), ay(19) - 110, '25歳が頂上', { size: 50, color: Y, serif: true }) },
    { at: 3.6, f: () => card(1300, 300, 480, 170, { fill: 'rgba(255,255,255,.05)' }) + txt(1540, 370, 'ヨーロッパ', { size: 34, color: C.dim }) + txt(1540, 435, '携帯300万人の記録', { size: 40 }) },
    ref(SR_BH),
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 15 25歳の男性 19人 → 39歳 12人（7人が消える）
SC[15] = K((t) => { let g = ''; const gone = clamp((t - 4.8) / 1.6);
  for (let i = 0; i < 19; i++) { const x = 200 + (i % 10) * 130, y = 470 + Math.floor(i / 10) * 230, fade = i >= 12 ? 1 - ease(clamp((gone * 7 - (i - 12)) / 1)) : 1; if (t < .3 + i * .06) continue;
    g += `<g opacity="${fade.toFixed(3)}">${person(x, y, 56, M)}</g>`; }
  return R([
    { at: 0, f: () => head('1か月に連絡を取る相手（男性）', { y: 190 }) },
    { at: 0, slide: 0, f: () => g },
    { at: .8, f: () => txt(1700, 420, '25歳', { size: 40, color: C.dim }) + roll(1700, 540, 0, 19, t, .8, 1.2, { unit: '人', size: 90, color: M }) },
    { at: 4.6, f: () => txt(1700, 680, '39歳', { size: 40, color: C.dim }) + roll(1700, 800, 19, 12, t, 4.8, 1.6, { unit: '人', size: 90, color: Y }) },
    ref(SR_BH),
  ], t); }, 1, { enter: 'right', zoom: 0 });

// 16 男女の線：30代後半で交差（両端の数字は研究の値、間はイメージ）
SC[16] = K((t) => { const ax = (a) => 420 + (a - 25) * 80, ay = (v) => 860 - (v - 10) * 52;
  const mP = [[25, 19], [29, 17.6], [33, 16.2], [35.5, 15.2], [37, 14.2], [39, 12]], fP = [[25, 17.5], [29, 16.8], [33, 16.0], [35.5, 15.2], [37, 15.1], [39, 15]];
  const k = clamp((t - .6) / 3.0); const line = (P, col) => { const n = Math.max(2, Math.ceil(P.length * k)); return `<path d="${P.slice(0, n).map((p, i) => (i ? 'L' : 'M') + ax(p[0]) + ',' + ay(p[1])).join(' ')}" stroke="${col}" stroke-width="9" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`; };
  return R([
    { at: 0, f: () => head('連絡を取る相手（1か月）', { y: 190 }) },
    { at: .2, slide: 0, f: () => `<path d="M${ax(25) - 30},860 h${ax(39) - ax(25) + 60}" stroke="${C.gray}" stroke-width="4"/>` + [25, 30, 35, 39].map(a => txt(ax(a), 910 - 10, a + '歳', { size: 30, color: C.dim })).join('') + line(mP, M) + line(fP, F) },
    { at: 1.0, f: () => txt(ax(25) - 40, ay(19) + 12, '男 19人', { size: 40, color: M, anchor: 'end' }) + txt(ax(25) - 40, ay(17.5) + 30, '女 17.5人', { size: 40, color: F, anchor: 'end' }) },
    { at: 3.6, f: () => txt(ax(39) + 40, ay(15) + 12, '女 15人', { size: 40, color: F, anchor: 'start' }) + txt(ax(39) + 40, ay(12) + 12, '男 12人', { size: 40, color: M, anchor: 'start' }) },
    { at: 6.8, f: () => `<circle cx="${ax(35.5)}" cy="${ay(15.2)}" r="${22 + 6 * Math.sin(t * 4)}" fill="none" stroke="${Y}" stroke-width="5"/>` + txt(ax(35.5), ay(15.2) - 330 + 120, '30代後半で入れ替わる', { size: 46, color: Y, serif: true }) },
    ref(SR_BH),
  ], t); }, 1, { enter: 'fade', zoom: 0 });

// 17 注意書き：2021年10月は宣言明け直後
SC[17] = K((t) => R([
  { at: 0, f: () => `<g transform="translate(960,420)">` + card(-520, -170, 1040, 340, { fill: 'rgba(240,200,90,.08)', stroke: Y }) + txt(0, -80, 'ちょっと注意', { size: 40, color: Y }) + txt(0, 10, '調査は2021年10月', { size: 64, serif: true }) + txt(0, 95, '緊急事態宣言が明けた直後', { size: 48, color: C.fg }) + '</g>' },
  { at: 6.5, f: () => txt(960, 720, '全体の数字は、いつもより少なめ', { size: 44, color: C.dim }) },
  { at: 9.8, f: () => txt(960, 820, '年齢による差の形は、変わらない', { size: 50, color: Y, serif: true }) },
], t), 1, { enter: 'fade', zoom: 0 });

// ===== 第2章 =====
// 19 引っ越したばかりの大人355人に2つの質問（写真のあと）
SC[19] = K((t) => R([
  { at: 5.0, f: () => head('引っ越したばかりの大人 355人に聞いた', { y: 200 }) },
  { at: 5.4, dx: 140, f: () => card(240, 340, 1440, 200, { fill: 'rgba(255,255,255,.06)' }) + txt(320, 465, 'Q1', { size: 64, color: Y, anchor: 'start', serif: true }) + txt(460, 462, '新しく出会った人と、何時間いっしょに過ごした？', { size: 46, anchor: 'start' }) },
  { at: 9.6, dx: 140, f: () => card(240, 590, 1440, 200, { fill: 'rgba(255,255,255,.06)' }) + txt(320, 715, 'Q2', { size: 64, color: Y, anchor: 'start', serif: true }) + txt(460, 712, 'その人を、今どう呼んでいる？', { size: 46, anchor: 'start' }) },
  ref(SR_HALL),
], t), 2, { enter: 'fade', zoom: 0 });

// 20 階段：50時間 軽い友達 → 90時間 友達 → 200時間 親友
const STEPS = [[1.6, '50時間', '軽い友達'], [6.1, '90時間', '友達'], [8.5, '200時間', '親友']];
SC[20] = K((t) => { let g = ''; const x0 = 300, y0 = 840; const n = STEPS.filter(s => t >= s[0]).length;
  g += `<rect x="${x0 - 240}" y="${y0}" width="240" height="${960 - y0}" fill="#3e3c48"/>` + txt(x0 - 120, y0 + 60, '知り合い', { size: 34, color: C.dim });
  STEPS.forEach(([t0, h, lb], i) => { const x = x0 + i * 400, y = y0 - (i + 1) * 110; g += `<rect x="${x}" y="${y}" width="400" height="${960 - y}" fill="${i === 2 ? '#5a4a30' : '#3e3c48'}"/>`;
    if (t >= t0) g += `<g opacity="${clamp((t - t0) / .35)}">` + txt(x + 200, y + 70, h, { size: 56, color: i === 2 ? Y : '#fff', serif: true }) + txt(x + 200, y + 120, lb, { size: 34, color: i === 2 ? Y : C.dim }) + '</g>'; });
  const i = n - 1, k = n ? easeOut(clamp((t - STEPS[Math.max(0, i)][0]) / .8)) : 0;
  const fx = (j) => j < 0 ? x0 - 120 : x0 + j * 400 + 200, fy = (j) => j < 0 ? y0 : y0 - (j + 1) * 110;
  const px = lerp(fx(i - 1), fx(i), n ? k : 0), py = lerp(fy(i - 1), fy(i), n ? k : 0) - Math.sin(k * Math.PI) * 50 * (n ? 1 : 0);
  return R([
    { at: 0, f: () => head('いっしょに過ごした時間と、呼び方', { y: 190 }) },
    { at: 0, slide: 0, f: () => g + person(px, py - 100, 52, M) },
    ref(SR_HALL),
  ], t); }, 2, { enter: 'right', zoom: 0 });

// 21 2つの時計：仕事の時間はメーターが上がらない／雑談・遊びの時間で上がる
const clockG = (x, y, r, t, sp, col) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#efeae0"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${col}" stroke-width="10"/>` + [...Array(12)].map((_, i) => `<path d="M${x + Math.cos(i * Math.PI / 6) * (r - 18)},${y + Math.sin(i * Math.PI / 6) * (r - 18)} L${x + Math.cos(i * Math.PI / 6) * (r - 6)},${y + Math.sin(i * Math.PI / 6) * (r - 6)}" stroke="#555" stroke-width="5"/>`).join('') + `<path d="M${x},${y} L${x + Math.cos(t * sp - Math.PI / 2) * (r - 30)},${y + Math.sin(t * sp - Math.PI / 2) * (r - 30)}" stroke="#222" stroke-width="8" stroke-linecap="round"/><path d="M${x},${y} L${x + Math.cos(t * sp / 12 - Math.PI / 2) * (r - 60)},${y + Math.sin(t * sp / 12 - Math.PI / 2) * (r - 60)}" stroke="#222" stroke-width="10" stroke-linecap="round"/>`;
const meter = (x, y, h, k, col, lab) => `<rect x="${x}" y="${y}" width="56" height="${h}" rx="12" fill="#2c2a34"/><rect x="${x}" y="${y + h * (1 - k)}" width="56" height="${h * k}" rx="12" fill="${col}"/>` + txt(x + 28, y + h + 44, lab, { size: 28, color: C.dim });
SC[21] = K((t) => { const kL = .12 * clamp((t - 2.8) / 2), kR = .12 + .78 * ease(clamp((t - 7.0) / 4.0));
  return R([
    { at: 0, f: () => head('「友達の時間」に数えられたのは？', { y: 190 }) },
    { at: 2.8, dx: -100, slide: 0, f: () => clockG(520, 540, 170, t, 3, '#8a8aa0') + meter(760, 380, 320, kL, '#8a8aa0', '友達度') + txt(560, 800, '同じ職場で働いた時間', { size: 42 }) + (t > 5.5 ? `<path d="M380,400 L660,680 M660,400 L380,680" stroke="${RED}" stroke-width="12" stroke-linecap="round" opacity="${clamp((t - 5.5) / .3) * .85}"/>` : '') },
    { at: 7.0, dx: 100, slide: 0, f: () => clockG(1260, 540, 170, t, 3, Y) + meter(1500, 380, 320, kR, Y, '友達度') + txt(1300, 800, '雑談・遊び・ふざけ合い', { size: 42, color: Y }) },
    ref(SR_HALL),
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 23 大人：月1回3時間 → 67か月かかる（カレンダーが1マスずつ）
SC[23] = K((t) => { let g = ''; const n = Math.floor(clamp((t - 1.4) / 6.0) * 67);
  for (let i = 0; i < 72; i++) { const x = 340 + (i % 12) * 100, y = 330 + Math.floor(i / 12) * 84; const on = i < n;
    g += `<rect x="${x}" y="${y}" width="84" height="68" rx="8" fill="${i >= 67 ? 'rgba(255,255,255,.03)' : on ? Y : '#2c2a34'}"/>`; }
  const yrs = [...Array(6)].map((_, i) => txt(310, 375 + i * 84, (i + 1) + '年目', { size: 26, color: C.dim, anchor: 'end' })).join('');
  return R([
    { at: 0, f: () => head('大人：月に1回、3時間だけ会う友達', { y: 190 }) },
    { at: .4, slide: 0, f: () => g + yrs },
    { at: 1.4, f: () => `<g transform="translate(1680,420)">` + txt(0, 0, 'たまった時間', { size: 30, color: C.dim }) + roll(0, 100, 0, 201, t, 1.4, 6.0, { unit: '時間', size: 70 }) + '</g>' },
    { at: 5.0, f: () => `<g transform="translate(1680,650)">` + txt(0, 0, '67か月', { size: 64, color: Y, serif: true }) + '</g>' },
    { at: 7.7, f: () => stampR(1680, 790, '5年半', t, 7.7, RED, 52) },
  ], t); }, 2, { enter: 'fade', zoom: 0 });

// 24 2本の道：学校5か月／大人5年半。同じ高さの壁
SC[24] = K((t) => { const k1 = easeOut(clamp((t - .2) / .9)), k2 = easeOut(clamp((t - 1.4) / 1.8));
  const road = (y, len, k, lab, col) => `<rect x="300" y="${y}" width="${len * k}" height="18" rx="9" fill="#4a4652"/>` + txt(270, y + 16, lab, { size: 42, anchor: 'end', color: col }) + (k > .98 ? `<rect x="${300 + len - 10}" y="${y - 150}" width="60" height="168" fill="#6a5c50"/><path d="M${300 + len - 10},${y - 100} h60 M${300 + len - 10},${y - 50} h60" stroke="#4a3e36" stroke-width="4"/>` : '');
  return R([
    { at: 0, f: () => head('同じ200時間の壁', { y: 190 }) },
    { at: 0, slide: 0, f: () => road(420, 340, k1, '学校', '#9ec8ff') + (k1 > .98 ? txt(300 + 170, 400, '5か月', { size: 46, color: '#9ec8ff' }) : '') },
    { at: 1.2, slide: 0, f: () => road(720, 1320, k2, '大人', Y) + (k2 > .98 ? txt(300 + 660, 700, '5年半', { size: 46, color: Y }) : '') },
    { at: 4.6, f: () => txt(960, 880, 'これが、200時間の壁の正体', { size: 50, serif: true, color: Y }) },
  ], t); }, 2, { enter: 'zoom', zoom: 0 });

// 25 実写：夜のホームに電車が入ってくる（緑で塗って後から差し替え）
SC[25] = K((t) => '', 2, { enter: 'fade', zoom: 0 });

// ===== 3D =====
// 1 誰もいない居酒屋の座敷。湯のみが1つだけ
SC[1] = { build() { const S = makeScene({ bg: '#1a120c', hemi: .55, exposure: 1.25, sky: '#ffd8a8', ground: '#3a2a1a', bloom: .25, bloomTh: .85, fov: 36 }); const s = S.s;
  box(s, 12, .05, 8, mat('#b8a26e', { r: .9 }), 0, 0, 0);
  for (let i = -5; i <= 5; i++) box(s, .03, .055, 8, mat('#8a7448'), i * 1.0, .001, 0);
  box(s, 12, 3, .1, mat('#e8dcc0', { r: .9 }), 0, 1.5, -3);
  for (let i = -6; i <= 6; i++) box(s, .05, 3, .12, mat('#5a3e28'), i * .9, 1.5, -2.95);
  for (let j = 0; j < 5; j++) box(s, 12, .05, .12, mat('#5a3e28'), 0, .4 + j * .6, -2.95);
  box(s, 12, .3, .3, mat('#4a3220'), 0, 3.0, -2.9);
  const wood = mat('#7a5233', { r: .5 });
  box(s, 4.6, .07, 1.05, wood, 0, .36, 0); for (const [dx, dz] of [[-2.1, -.4], [2.1, -.4], [-2.1, .4], [2.1, .4]]) box(s, .08, .33, .08, mat('#4a3220'), dx, .17, dz);
  for (const x of [-1.6, -.55, .5, 1.55]) for (const z of [-.95, .95]) { box(s, .58, .08, .58, mat('#7a2e2e', { r: .9 }), x, .04, z); }
  cyl(s, .05, .042, .1, mat('#e8e2d4', { r: .4 }), 1.2, .45, .15, 16);
  cyl(s, .2, .2, .02, mat('#2a1e16'), -.2, .4, 0, 20);
  for (const x of [-1.8, 1.8]) { ball(s, .24, glow('#ffcf8a', .9), x, 2.25, -.6, 2); box(s, .02, .5, .02, mat('#222'), x, 2.7, -.6); lamp(s, '#ffc88a', 6, 7, x, 2.1, -.4, x < 0); }
  sun(s, '#ffd8b0', .4, 3, 5, 6, 8);
  return { render() { S.render(); }, update(t, dur) { camMove(S.cam, [-3.0, 1.55, 4.2], [1.2, 1.35, 3.8], [-1.0, .45, 0], [1.0, .45, 0], ease(t / dur)); return ''; } }; } };

// 11 夕方の駅前：家族・会社の2人組・制服の3人が通り過ぎる（通り道に物を置かない）
SC[11] = { build() { const S = makeScene({ bg: '#e8a878', hemi: .9, exposure: 1.2, sky: '#ffd0a0', ground: '#6a6058', bloom: .15, bloomTh: .9, fov: 40, fog: ['#e8b088', 24, 60] }); const s = S.s; sun(s, '#ffc890', 1.6, -12, 8, 6, 30);
  box(s, 40, .02, 30, mat('#9a948c', { r: .8 }), 0, -.01, -4);
  for (let i = -10; i <= 10; i++) box(s, .03, .025, 30, mat('#8a847c'), i * 2, 0, -4);
  box(s, 20, 5.5, 3, mat('#cfc6b8'), 0, 2.75, -11); box(s, 20, .5, 3.4, mat('#8a8070'), 0, 5.5, -11);
  for (let i = 0; i < 9; i++) box(s, 1.4, 1.6, .05, glow('#ffe0b0', .45), -8 + i * 2, 3.2, -9.47);
  box(s, 6, 1.2, .08, glow('#2a3a5a', .35), 0, 4.6, -9.45);
  for (const x of [-9, 9]) { cyl(s, .07, .09, 4.2, mat('#3a3a40'), x, 2.1, -6.5, 8); ball(s, .22, glow('#fff0d0', .9), x, 4.3, -6.5, 1); }
  for (const x of [-15, -12.5, 12.5, 15]) { cyl(s, .15, .2, 2.4, mat('#5a4636'), x, 1.2, -7, 6); ball(s, 1.3, mat('#6a8a54'), x, 3.2, -7, 1); }
  const mk = (o, sc = 1) => { const p = human(s, { face: false, ...o }); p.scale.setScalar(sc); return p; };
  // 家族：z=0、+x へ。大人2人＋子ども
  const fam = [[mk({ top: '#7fa0c8', bottom: '#3a3f4a' }), -.35], [mk({ top: '#c87f8a', bottom: '#3a3a44', hairStyle: 'long' }), .35], [mk({ top: '#e8c060', bottom: '#4a4a60' }, .62), 0]];
  // 会社の2人組：z=-3、-x へ
  const suit = [[mk({ top: '#2b3140', bottom: '#22252c' }), -.35], [mk({ top: '#3a3a44', bottom: '#22252c' }), .35]];
  // 私服の友達3人：z=3、-x へ
  const stu = [[mk({ top: '#c86a4a', bottom: '#3a3f52' }), -.5], [mk({ top: '#4a9a8a', bottom: '#2a2a40', hairStyle: 'long' }), 0], [mk({ top: '#d8b04a', bottom: '#3a3a48' }), .5]];
  const V = new THREE.Vector3(); const scr = (o) => { V.set(o.position.x, 2.3, o.position.z); V.project(S.cam); return [(V.x + 1) * 960, (1 - V.y) * 540]; };
  return { render() { S.render(); }, update(t, dur) {
    fam.forEach(([p, dz], i) => { p.position.set(-8.0 + t * .55 - (i === 2 ? .45 : 0), 0, 0 + dz); p.rotation.y = Math.PI / 2; p.userData.walk(t + i, i === 2 ? .8 : .55); });
    suit.forEach(([p, dz], i) => { p.position.set(3.8 - t * .45, 0, -3 + dz); p.rotation.y = -Math.PI / 2; p.userData.walk(t + 2 + i, .45); });
    stu.forEach(([p, dz], i) => { p.position.set(8.8 - t * .55 + (i === 1 ? .3 : 0), 0, 3 + dz); p.rotation.y = -Math.PI / 2; p.userData.walk(t + 4 + i, .55); });
    camMove(S.cam, [0, 3.4, 13], [0, 3.0, 11.5], [0, 1.2, -1], [0, 1.1, -1], ease(t / dur)); S.cam.updateMatrixWorld();
    const lab = (o, s0, col, t0) => { const a = clamp((t - t0) / .4); if (a <= 0) return ''; const [x, y] = scr(o); return `<g opacity="${a}">${otxt(x, y - 30, s0, 44, col, false)}</g>`; };
    return ovSvg(lab(fam[0][0], '家族', FAM, 6.7) + lab(suit[0][0], '学校・職場の人', '#9ec8ff', 7.7) + lab(stu[1][0], 'それ以外の人', OTH, 8.7)); } }; } };

// 18 第2章：夕暮れの公園、離れて置かれた2つのベンチ
SC[18] = { build() { const S = makeScene({ bg: '#d89070', hemi: .8, exposure: 1.2, sky: '#ffc8a0', ground: '#4a5a3a', bloom: .2, bloomTh: .88, fov: 36, fog: ['#d89878', 14, 40] }); const s = S.s; sun(s, '#ffb880', 1.4, -10, 5, -6, 24);
  box(s, 40, .02, 30, mat('#5a6a44', { r: .9 }), 0, -.01, -5); box(s, 40, .03, 2.2, mat('#c8b898', { r: .9 }), 0, 0, 1.2);
  const bench = (x) => { const g = new THREE.Group(); const w = mat('#7a5233', { r: .6 }), m = mat('#2a2a2e', { m: .5, r: .4 });
    box(g, 1.6, .06, .45, w, 0, .45, 0); box(g, 1.6, .35, .05, w, 0, .75, -.2); for (const sx of [-.7, .7]) { box(g, .06, .45, .45, m, sx, .22, 0); box(g, .06, .5, .05, m, sx, .7, -.22); } g.position.set(x, 0, -.2); s.add(g); };
  bench(-2.6); bench(2.6);
  const r = rng(3); for (let i = 0; i < 9; i++) { const x = -16 + i * 4 + (r() - .5), z = -9 - r() * 3; cyl(s, .14, .2, 2.2, mat('#5a4a3a'), x, 1.1, z, 6); ball(s, .95 + r() * .3, mat(['#7a9a5a', '#8aa864', '#6a8a50'][i % 3]), x, 2.7, z, 1); }
  for (const x of [-5.2, 5.2]) { cyl(s, .05, .07, 3.2, mat('#2a2a2e'), x, 1.6, -.6, 8); ball(s, .18, glow('#fff0c8', 1.1), x, 3.25, -.6, 1); lamp(s, '#ffe0b0', 3, 6, x, 3.1, -.4, false); }
  return { render() { S.render(); }, update(t, dur) { camMove(S.cam, [0, 2.4, 10], [0, 2.0, 7.2], [0, .6, -2], [0, .6, -2], ease(t / dur));
    const a = clamp((t - .4) / .5); return ovSvg(`<g opacity="${a}"><rect width="1920" height="360" fill="url(#topg)"/>${otxt(960, 160, '第2章', 34, '#ff8a3d', false)}${otxt(960, 250, '友達は何時間でできるのか', 64, Y)}</g>`); } }; } };

// 22 放課後の教室：夕日が差す。2時間×100日＝200時間
SC[22] = { build() { const S = makeScene({ bg: '#2a2018', hemi: .6, exposure: 1.25, sky: '#ffd0a0', ground: '#5a4a38', bloom: .2, bloomTh: .85, fov: 40 }); const s = S.s;
  box(s, 10, .05, 9, mat('#9a7a52', { r: .7 }), 0, 0, 0); box(s, 10, 3.2, .1, mat('#e6dccb'), 0, 1.6, -4.5); box(s, 10, .1, 9, mat('#efe8dc'), 0, 3.2, 0);
  box(s, .1, 3.2, 9, mat('#e6dccb'), 5, 1.6, 0);
  box(s, 4.2, 1.3, .06, mat('#2e4a3a', { r: .9 }), 0, 1.7, -4.44); box(s, 4.4, .08, .14, mat('#6a5038'), 0, 1.02, -4.4);
  for (let i = 0; i < 4; i++) { box(s, .06, 1.6, 1.7, glow('#ffb46a', .9), -4.97, 1.8, -3.2 + i * 2.1); box(s, .12, 1.7, .08, mat('#8a7a68'), -4.95, 1.8, -2.3 + i * 2.1); }
  box(s, .1, .9, 9, mat('#d8ccb8'), -5, .45, 0); box(s, .1, .3, 9, mat('#d8ccb8'), -5, 3.05, 0);
  sun(s, '#ffb070', 2.4, -9, 3.2, 1, 14);
  const wood = mat('#b89060', { r: .6 }), leg = mat('#555a60', { m: .4, r: .5 });
  for (let r0 = 0; r0 < 4; r0++) for (let c = 0; c < 5; c++) { const x = -3.2 + c * 1.6, z = -2.4 + r0 * 1.5;
    box(s, .65, .04, .45, wood, x, .72, z); for (const [dx, dz] of [[-.28, -.18], [.28, -.18], [-.28, .18], [.28, .18]]) box(s, .03, .72, .03, leg, x + dx, .36, z + dz);
    box(s, .4, .03, .38, wood, x, .44, z + .48); box(s, .4, .35, .03, wood, x, .68, z + .68); for (const [dx, dz] of [[-.17, .32], [.17, .32], [-.17, .64], [.17, .64]]) box(s, .025, .44, .025, leg, x + dx, .22, z + dz); }
  const r = rng(2); const bags = []; for (let i = 0; i < 3; i++) { const c = (r() * 5) | 0, rr = (r() * 4) | 0; bags.push(box(s, .3, .22, .12, mat('#2a2a34'), -3.2 + c * 1.6, .86, -2.4 + rr * 1.5)); }
  return { render() { S.render(); }, update(t, dur) { camMove(S.cam, [3.8, 1.75, 4.2], [-.6, 1.6, 4.0], [.5, .9, -2.2], [-1.8, .9, -2.2], ease(t / dur));
    const a = clamp((t - 2.8) / .4), b = clamp((t - 7.5) / .4), c = clamp((t - 11.3) / .4);
    return ovSvg(`<g opacity="${a}"><rect x="1180" y="150" width="640" height="${c > 0 ? 420 : b > 0 ? 300 : 160}" rx="22" fill="rgba(12,12,18,.6)"/>${otxt(1500, 240, '学校：毎日2時間', 52, '#fff', false)}</g><g opacity="${b}">${otxt(1500, 380, '× 100日 ＝ 200時間', 54, Y)}</g><g opacity="${c}">${otxt(1500, 520, 'だいたい5か月', 54, '#9ec8ff')}</g>`); } }; } };

// ===== 第3章 =====
// 3つの条件カード（家が近い／足あとが重なる／ソファ）。marks: [時刻 or null, 'ok'|'ng'|'blink']
const ICON = [
  (x, y) => `<rect x="${x - 95}" y="${y - 10}" width="70" height="60" fill="#9ec8ff"/><path d="M${x - 105},${y - 8} L${x - 60},${y - 50} L${x - 15},${y - 8} Z" fill="#7aa8e0"/><rect x="${x + 25}" y="${y - 10}" width="70" height="60" fill="${F}"/><path d="M${x + 15},${y - 8} L${x + 60},${y - 50} L${x + 105},${y - 8} Z" fill="#d86a90"/><path d="M${x - 20},${y + 30} h40" stroke="${Y}" stroke-width="5" stroke-dasharray="6 5"/>`,
  (x, y) => [0, 1, 2, 3].map(i => `<ellipse cx="${x - 90 + i * 60}" cy="${y + (i % 2 ? -18 : 18)}" rx="16" ry="26" fill="#c8b894" opacity="${.45 + i * .15}"/><ellipse cx="${x - 70 + i * 60}" cy="${y + (i % 2 ? 4 : 40)}" rx="16" ry="26" fill="${Y}" opacity="${.35 + i * .15}"/>`).join(''),
  (x, y) => `<rect x="${x - 110}" y="${y - 10}" width="220" height="60" rx="18" fill="#b07a5a"/><rect x="${x - 110}" y="${y - 55}" width="220" height="55" rx="18" fill="#c88a6a"/><rect x="${x - 130}" y="${y - 30}" width="36" height="80" rx="14" fill="#a06a4a"/><rect x="${x + 94}" y="${y - 30}" width="36" height="80" rx="14" fill="#a06a4a"/>`,
];
const CLAB = ['近い', '約束なしに、何度も会う', '気を抜ける場所'];
const cond3 = (t, appear, marks) => { let g = '';
  for (let i = 0; i < 3; i++) { if (t < appear[i]) continue; const k = easeOut(clamp((t - appear[i]) / .5)), x = 400 + i * 560, y = 520;
    g += `<g opacity="${k}" transform="translate(0,${(1 - k) * 40})">` + card(x - 240, 330, 480, 440, { fill: 'rgba(255,255,255,.05)' }) + txt(x, 400, '①②③'[i], { size: 52, color: Y, serif: true }) + ICON[i](x, y) + txt(x, 690, CLAB[i], { size: i === 1 ? 36 : 44 }) + '</g>';
    const m = marks && marks[i]; if (m && t >= m[0]) { const q = clamp((t - m[0]) / .3);
      if (m[1] === 'ok') g += `<g transform="translate(${x + 170},360) scale(${pop(q)})"><circle r="44" fill="${FAM}"/><path d="M-20,0 l14,16 l26,-30" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      if (m[1] === 'ng') g += `<g transform="translate(${x + 170},360) scale(${pop(q)})" opacity="${.55 + .45 * Math.abs(Math.sin(t * 3))}"><circle r="44" fill="none" stroke="${RED}" stroke-width="8" stroke-dasharray="10 8"/>${txt(0, 16, '？', { size: 46, color: RED })}</g>`; } }
  return g; };
SC[27] = K((t) => R([
  { at: 0, f: () => head('友達ができる3つの条件', { y: 200 }) },
  { at: 0, slide: 0, f: () => cond3(t, [0, 1.5, 5.3], null) },
  ref('Rebecca G. Adams（社会学者）'),
], t), 3, { enter: 'fade', zoom: 0 });
SC[28] = K((t) => R([
  { at: 2.8, f: () => head('学校', { y: 200, size: 64 }) },
  { at: 2.8, slide: 0, f: () => cond3(t, [2.8, 2.8, 2.8], [[3.2, 'ok'], [5.2, 'ok'], [7.4, 'ok']]) },
], t), 3, { enter: 'fade', zoom: 0 });
SC[29] = K((t) => R([
  { at: 0, f: () => head('職場', { y: 200, size: 64 }) },
  { at: 0, slide: 0, f: () => cond3(t, [0, 0, 0], [[2.0, 'ok'], [3.6, 'ok'], [5.7, 'ng']]) },
], t), 3, { enter: 'fade', zoom: 0 });

// 31 家が離れていく → 足あとが途切れる
SC[31] = K((t) => { const sep = ease(clamp((t - 3.7) / 1.6)), cut = clamp((t - 5.7) / 2.0);
  const hx1 = 760 - 420 * sep, hx2 = 1160 + 420 * sep;
  const house = (x, c1, c2) => `<rect x="${x - 70}" y="400" width="140" height="120" fill="${c1}"/><path d="M${x - 88},404 L${x},320 L${x + 88},404 Z" fill="${c2}"/><rect x="${x - 20}" y="460" width="40" height="60" fill="#2a2630"/>`;
  let fp = ''; for (let i = 0; i < 12; i++) { const x = 300 + i * 115, op = i / 12 < 1 - cut ? .9 : .08; fp += `<ellipse cx="${x}" cy="${760 + (i % 2 ? -18 : 18)}" rx="18" ry="30" fill="${Y}" opacity="${op}" transform="rotate(90 ${x} ${760 + (i % 2 ? -18 : 18)})"/>`; }
  return R([
    { at: 0, f: () => head('職場を離れると', { y: 200 }) },
    { at: .2, slide: 0, f: () => house(hx1, '#9ec8ff', '#7aa8e0') + house(hx2, F, '#d86a90') + `<path d="M${hx1 + 80},480 L${hx2 - 80},480" stroke="${Y}" stroke-width="5" stroke-dasharray="10 8"/>` + (t > 4.2 ? txt(960, 590, '引っ越し → 近さが消える', { size: 42, color: C.fg }) : '') },
    { at: 5.7, slide: 0, f: () => fp + txt(960, 870, '結婚・家庭 → 約束なしに会う時間が消える', { size: 42, color: C.fg }) },
  ], t); }, 3, { enter: 'right', zoom: 0 });

// 32 手帳に予定を書く → 砂時計に少しずつ砂がたまる
SC[32] = K((t) => { const items = [[7.1, '場所を決める'], [8.0, '日にちを決める'], [9.0, '誘う']]; const k = clamp((t - 7.1) / 5.0) * .35;
  let g = card(260, 300, 760, 560, { fill: '#efe8da', stroke: '#c8b894' }) + `<rect x="260" y="300" width="760" height="70" rx="16" fill="#c86a4a"/>` + txt(640, 350, '予定', { size: 40, color: '#fff', shadow: false });
  for (let i = 0; i < 5; i++) g += `<path d="M300,${440 + i * 85} h680" stroke="#c8bca8" stroke-width="3"/>`;
  items.forEach(([t0, s0], i) => { if (t < t0) return; const w = clamp((t - t0) / .6); g += `<g opacity="${w}">${txt(330, 425 + i * 85, s0, { size: 44, color: '#2a2420', anchor: 'start', shadow: false })}</g>`; });
  return R([
    { at: 0, f: () => head('学校が自動でやってくれていたこと', { y: 200 }) },
    { at: .3, slide: 0, f: () => g },
    { at: .6, slide: 0, f: () => hourglass(1460, 560, 380, k, Y, { flow: t > 7.1 }) },
    { at: 9.9, f: () => txt(1460, 860, '× 200時間分', { size: 54, color: Y, serif: true }) },
  ], t); }, 3, { enter: 'fade', zoom: 0 });

// 33 写真：一人で夜道を歩く後ろ姿 ＋ 言葉
SC[33] = { kind: 'kami', build() { return { render() {}, update(t, dur) {
  const a = clamp((t - 4.9) / .5), fade = Math.min(1, clamp(t / .35), 1 - clamp((t - (dur - .35)) / .35));
  return `<div style="position:absolute;left:0;top:0;width:1920px;height:1080px;background:#000"><div style="position:absolute;left:0;top:0;width:1920px;height:1080px;opacity:${fade.toFixed(3)}">` + ovSvg(photoSvg('F', t / dur, .2) + `<g opacity="${clamp((t - .6) / .5)}">${otxt(1400, 380, '性格の問題ではない', 64, '#fff')}</g><g opacity="${a}">${otxt(1400, 500, '条件がなくなっただけ', 72, Y)}</g>`) + '</div></div>'; } }; } };

// ===== 第4章 =====
// 35 内閣府の調査：100人中4人
SC[35] = K((t) => { let g = ''; const lit = new Set([12, 37, 58, 83]);
  for (let i = 0; i < 100; i++) { const x = 560 + (i % 20) * 42, y = 440 + Math.floor(i / 20) * 78, on = lit.has(i) && t > 9.0; if (t < 6.4 + i * .012) continue; g += person(x, y, 17, on ? RED : '#5a5662'); }
  return R([
    { at: 0, f: () => head('人々のつながりに関する基礎調査（内閣府）', { y: 200, size: 50 }) },
    { at: .8, f: () => txt(960, 320, '全国の16歳以上・約1万人が回答（2024年）', { size: 38, color: C.dim }) },
    { at: 6.4, slide: 0, f: () => g },
    { at: 9.2, f: () => txt(1580, 560, '孤独を「しばしば」', { size: 34, color: C.fg, anchor: 'start' }) + txt(1580, 610, '「いつも」感じる', { size: 34, color: C.fg, anchor: 'start' }) + roll(1660, 720, 0, 4.3, t, 9.4, 1.2, { dec: 1, unit: '%', size: 84, color: RED }) },
    ref('内閣府「人々のつながりに関する基礎調査」（令和6年）'),
  ], t); }, 4, { enter: 'fade', zoom: 0 });

// 36 年齢別の孤独（しばしば・いつも）
const LONE = [['20代', 7.4, 3.3], ['30代', 6.0, 6.5], ['40代', 4.3, 8.2], ['50代', 5.1, 8.5], ['60代', 4.4, 8.8], ['70代', 2.5, 9.1], ['80歳〜', 2.8, 9.4]];
SC[36] = K((t) => { const base = 820, s = 52; let g = '';
  LONE.forEach(([l, v, t0], i) => { const x = 330 + i * 200, col = i === 0 ? RED : i === 5 ? '#9ec8ff' : '#8a8aa0'; g += txt(x + 70, base + 52, l, { size: 34 }); if (t < t0) return; const k = easeOut(clamp((t - t0) / .7)), h = v * s * k;
    g += `<rect x="${x}" y="${base - h}" width="140" height="${h}" rx="10" fill="${col}"/>` + (k > .4 ? txt(x + 70, base - h - 20, v.toFixed(1) + '%', { size: 46, color: col, serif: true }) : ''); });
  return R([
    { at: 0, f: () => head('孤独を「しばしば・いつも」感じる人（年齢別）', { y: 200, size: 50 }) },
    { at: 0, slide: 0, f: () => g + `<path d="M300,${base} h1440" stroke="${C.gray}" stroke-width="4"/>` },
    ref('内閣府「人々のつながりに関する基礎調査」（令和6年）'),
  ], t); }, 4, { enter: 'right', zoom: 0 });

// 37 2つのグラフ：友達の時間（20代が長い）／孤独（20代が高い）
SC[37] = K((t) => { const AG = ['20代', '30代', '40代', '50代', '60代', '70代'];
  const FT = [18.5, 9, 8, 8, 8.5, 11], LN = [7.4, 6.0, 4.3, 5.1, 4.4, 2.5];
  const mini = (y0, vals, vmax, col, t0, unit, lab) => { let g = txt(500, y0 + 70, lab, { size: 38, color: col, anchor: 'end' }); vals.forEach((v, i) => { const x = 560 + i * 190, k = easeOut(clamp((t - t0 - i * .08) / .6)), h = 190 * v / vmax * k; g += `<rect x="${x}" y="${y0 + 120 - h}" width="110" height="${h}" rx="8" fill="${i === 0 ? col : '#5a5662'}"/>` + (k > .5 && i === 0 ? txt(x + 55, y0 + 100 - h, v + unit, { size: 34, color: col }) : ''); g += txt(x + 55, y0 + 160, AG[i], { size: 28, color: C.dim }); }); return g; };
  return R([
    { at: 0, slide: 0, f: () => mini(300, FT, 20, OTH, .2, '分', '友達との時間') },
    { at: 1.6, slide: 0, f: () => mini(620, LN, 8, RED, 1.6, '%', '孤独な人') },
    { at: 3.4, f: () => `<rect x="535" y="190" width="160" height="640" rx="20" fill="none" stroke="${Y}" stroke-width="6" opacity="${clamp((t - 3.4) / .4)}"/>` + txt(615, 175, 'どちらも20代が1位', { size: 34, color: Y }) },
    { at: 4.8, f: () => txt(1250, 960 - 70, '長く会っていても、孤独は消えない', { size: 44, color: '#fff', serif: true }) },
    ref('社会生活基本調査（2021）／人々のつながりに関する基礎調査（令和6年）'),
  ], t); }, 4, { enter: 'fade', zoom: 0 });

// 38 大きな円の点が減り、残った数個が太い線でつながる
SC[38] = K((t) => { const r = rng(9); const P = [...Array(28)].map((_, i) => { const a = i / 28 * Math.PI * 2 + r() * .2, d = 200 + r() * 150; return [960 + Math.cos(a) * d, 560 + Math.sin(a) * d * .78]; });
  const keep = new Set([3, 11, 19, 24]); const shrink = ease(clamp((t - 8.7) / 2.2)), thick = ease(clamp((t - 10.6) / 1.4));
  let g = `<circle cx="960" cy="560" r="${(400 - 220 * shrink).toFixed(1)}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="4"/>`;
  P.forEach(([x, y], i) => { const kp = keep.has(i); const op = kp ? 1 : 1 - shrink; if (op <= 0.01) return; const nx = kp ? 960 + (x - 960) * (1 - .45 * shrink) : x, ny = kp ? 560 + (y - 560) * (1 - .45 * shrink) : y;
    if (kp && thick > 0) g += `<path d="M960,560 L${nx},${ny}" stroke="${Y}" stroke-width="${4 + 12 * thick}" stroke-linecap="round" opacity="${thick}"/>`;
    else if (!kp) g += `<path d="M960,560 L${nx},${ny}" stroke="rgba(255,255,255,.18)" stroke-width="2" opacity="${op}"/>`;
    g += `<circle cx="${nx}" cy="${ny}" r="${kp ? 20 + 6 * thick : 13}" fill="${kp ? Y : '#8a8aa0'}" opacity="${op}"/>`; });
  g += person(960, 600, 34, '#fff');
  return R([
    { at: 0, f: () => head('残り時間を意識すると、人は付き合う人を選ぶ', { y: 200, size: 48 }) },
    { at: .2, slide: 0, f: () => g },
    { at: 8.7, f: () => txt(1560, 820, '広く浅く → 狭く濃く', { size: 44, color: Y, serif: true }) },
    ref('Carstensen (1992) Psychology and Aging'),
  ], t); }, 4, { enter: 'fade', zoom: 0 });

// 40 11人のうち1人が離れて立つ
SC[40] = K((t) => { let g = ''; for (let i = 0; i < 11; i++) { if (t < 2.5 + i * .08) continue; const lone = i === 10, x = lone ? 1640 + 40 * ease(clamp((t - 4.0) / 1.0)) : 300 + i * 120; g += person(x, 640, 58, lone ? '#9ec8ff' : '#5a5662'); }
  return R([
    { at: 0, f: () => head('困ったときに相談できる相手がいない', { y: 200 }) },
    { at: 2.5, slide: 0, f: () => g },
    { at: 6.0, f: () => roll(1680, 420, 0, 8.7, t, 6.0, 1.2, { dec: 1, unit: '%', size: 96, color: '#9ec8ff' }) },
    { at: 8.6, f: () => txt(960, 880, 'およそ11人に1人', { size: 56, color: Y, serif: true }) },
    ref('内閣府 孤独・孤立の実態把握（令和6年調査）'),
  ], t); }, 4, { enter: 'right', zoom: 0 });

// 41 砂時計が満タン → 2人が並ぶ
SC[41] = K((t) => { const k = ease(clamp((t - .3) / 5.5));
  return R([
    { at: 0, f: () => head('大事なのは、数ではない', { y: 200 }) },
    { at: .2, slide: 0, f: () => hourglass(700, 560, 400, k, Y, { flow: k < .99 }) },
    { at: .2, f: () => roll(700, 850, 0, 200, t, .3, 5.5, { unit: '時間', size: 56 }) },
    { at: 5.0, slide: 0, f: () => person(1260, 620, 70, M) + person(1420, 620, 70, F) + `<path d="M1300,520 Q1340,470 1380,520" stroke="${Y}" stroke-width="6" fill="none" opacity="${clamp((t - 5.6) / .4)}"/>` + txt(1340, 800, '1人か2人', { size: 50, color: Y, serif: true }) },
  ], t); }, 4, { enter: 'fade', zoom: 0 });

// ===== エピローグ =====
// 42 これまでの図が小さく並ぶ
const MINI = [['22分→10分', OTH], ['200時間の壁', Y], ['3つの条件', '#9ec8ff'], ['20代がいちばん孤独', RED]];
SC[42] = K((t) => R([
  ...MINI.map(([s0, col], i) => ({ at: .2 + i * .5, dx: 0, slide: 0, f: () => `<g transform="translate(${330 + i * 420},560) scale(${pop(clamp((t - .2 - i * .5) / .4))})">` + card(-180, -140, 360, 280, { fill: 'rgba(255,255,255,.05)', stroke: col }) + txt(0, 14, s0, { size: i === 3 ? 34 : 44, color: col, serif: true }) + '</g>' })),
], t), 5, { enter: 'fade', zoom: 0 });

// 43 22分→10分 ／ 200時間の壁
SC[43] = K((t) => { const a = clamp((t - .2) / .5), b = clamp((t - 5.8) / .5), w = ease(clamp((t - 6.0) / .9));
  return R([
    { at: 0, slide: 0, f: () => `<g opacity="${a}">` + txt(560, 300, '友達と過ごす時間（1日）', { size: 40, color: C.dim }) + txt(400, 470, '22分', { size: 110, color: Y, serif: true }) + `<path d="M520,440 h120" stroke="#fff" stroke-width="8"/><path d="M630,415 l30,25 l-30,25" fill="none" stroke="#fff" stroke-width="8"/>` + txt(780, 470, '10分', { size: 110, color: '#9ec8ff', serif: true }) + txt(560, 560, '20代前半 → 30代前半', { size: 34, color: C.dim }) + '</g>' },
    { at: 5.8, slide: 0, f: () => `<g opacity="${b}"><rect x="1300" y="${760 - 420 * w}" width="110" height="${420 * w}" fill="#6a5c50"/>` + [...Array(7)].map((_, i) => (760 - (i + 1) * 58 > 760 - 420 * w) ? `<path d="M1300,${760 - (i + 1) * 58} h110" stroke="#4a3e36" stroke-width="4"/>` : '').join('') + `<rect x="1100" y="760" width="520" height="16" rx="8" fill="#4a4652"/>` + txt(1355, 850, '親友まで 200時間', { size: 44, color: Y, serif: true }) + '</g>' },
  ], t); }, 5, { enter: 'fade', zoom: 0 });

// 46 コメントのアイコン
SC[46] = K((t) => R([
  { at: 0, f: () => `<g transform="translate(960,470) scale(${pop(clamp(t / .5))})"><path d="M-230,-150 h460 a40,40 0 0 1 40,40 v200 a40,40 0 0 1 -40,40 h-300 l-90,70 v-70 h-70 a40,40 0 0 1 -40,-40 v-200 a40,40 0 0 1 40,-40 Z" fill="rgba(240,200,90,.12)" stroke="${Y}" stroke-width="6"/>` + txt(0, -40, 'あなたが200時間を', { size: 50, serif: true }) + txt(0, 40, 'かけた友達は？', { size: 50, serif: true, color: Y }) + '</g>' },
  { at: 4.0, f: () => txt(960, 800, '最後に会ったのは、いつ？', { size: 46, color: C.fg }) },
], t), 5, { enter: 'fade', zoom: 0 });

// 47 締め
SC[47] = K((t) => R([
  { at: 0, f: () => txt(960, 460, '今日のネタバレは、ここまで', { size: 64, serif: true }) },
  { at: 1.9, f: () => `<g transform="translate(960,640) scale(${pop(clamp((t - 1.9) / .4))})"><rect x="-230" y="-56" width="460" height="112" rx="56" fill="#e0453a"/>${txt(0, 18, 'チャンネル登録', { size: 50, color: '#fff', shadow: false })}</g>` },
], t), 5, { enter: 'fade', zoom: 0 });

// 45 写真：友人たちとキャンプ ＋ 2つの言葉
SC[45] = { kind: 'kami', build() { return { render() {}, update(t, dur) {
  const fade = Math.min(1, clamp(t / .35), 1 - clamp((t - (dur - .35)) / .35)); const a = clamp((t - 4.7) / .4), b = clamp((t - 6.2) / .4), c = clamp((t - 8.5) / .5);
  return `<div style="position:absolute;left:0;top:0;width:1920px;height:1080px;background:#000"><div style="position:absolute;left:0;top:0;width:1920px;height:1080px;opacity:${fade.toFixed(3)}">` + ovSvg(photoSvg('G', t / dur, .3) + `<rect width="1920" height="420" fill="url(#topg)"/>` + `<g opacity="${clamp((t - 2.5) / .4)}">${otxt(960, 140, '大人の友達は、予定で作る', 62, Y)}</g><g opacity="${a}">${otxt(560, 260, '毎月、同じ日に会う', 50, '#fff')}</g><g opacity="${b}">${otxt(1360, 260, '同じ集まりに通い続ける', 50, '#fff')}</g><g opacity="${c}">${otxt(960, 380, '200時間の壁は、少しずつなら越えられる', 46, '#9ec8ff')}</g>`) + '</div></div>'; } }; } };

// 39 実写：2人が並んで歩く後ろ姿（緑で塗って差し替え）
SC[39] = K((t) => '', 4, { enter: 'fade', zoom: 0 });

// ===== 3D（後半） =====
// 26 第3章：夜の大学の中庭、灯りのついた窓
SC[26] = { build() { const S = makeScene({ bg: '#0e1424', hemi: .45, exposure: 1.3, sky: '#6a7aa8', ground: '#2a2a30', bloom: .45, bloomTh: .7, fov: 40 }); const s = S.s; sun(s, '#9ab0ff', .5, 6, 10, 8, 20);
  box(s, 40, .02, 30, mat('#3a3a42', { r: .9 }), 0, -.01, -4); box(s, 3, .03, 30, mat('#6a6458', { r: .9 }), 0, 0, -4);
  const bld = (x, z, w, h, d, ry) => { const g = new THREE.Group(); box(g, w, h, d, mat('#8a8478', { r: .9 }), 0, h / 2, 0); const r = rng((x * 7 + z) | 0);
    for (let fl = 0; fl < Math.floor(h / 1.6); fl++) for (let c = 0; c < Math.floor(w / 1.4); c++) { const on = r() < .45; box(g, .8, .9, .05, on ? glow('#ffd89a', .9) : mat('#2a2e3a'), -w / 2 + .9 + c * 1.4, 1.2 + fl * 1.6, d / 2 + .03); }
    g.position.set(x, 0, z); g.rotation.y = ry; s.add(g); };
  bld(0, -12, 18, 8, 3, 0); bld(-9, -3, 12, 6.5, 3, Math.PI / 2); bld(9, -3, 12, 6.5, 3, -Math.PI / 2);
  for (const z of [-7, -1, 5]) for (const x of [-2.6, 2.6]) { cyl(s, .05, .07, 3.2, mat('#2a2a2e'), x, 1.6, z, 8); ball(s, .18, glow('#fff0c8', 1.2), x, 3.25, z, 1); }
  for (const [x, z] of [[-5, -7], [5, -7], [-5, 1], [5, 1]]) { cyl(s, .14, .2, 2.4, mat('#3a2e26'), x, 1.2, z, 6); ball(s, 1.2, mat('#2e4030'), x, 3.0, z, 1); }
  return { render() { S.render(); }, update(t, dur) { camMove(S.cam, [0, 2.2, 12], [0, 2.6, 8.5], [0, 3.0, -8], [0, 3.6, -8], ease(t / dur));
    const a = clamp((t - .4) / .5); return ovSvg(`<g opacity="${a}"><rect width="1920" height="360" fill="url(#topg)"/>${otxt(960, 160, '第3章', 34, '#ff8a3d', false)}${otxt(960, 250, '大人が失う3つの条件', 64, Y)}</g>`); } }; } };

// 30 夜のオフィス：2つの机に灯り、椅子は背中合わせ（人は置かない）
SC[30] = { build() { const S = makeScene({ bg: '#0c1018', hemi: .3, exposure: 1.35, sky: '#4a5a7a', ground: '#1a1a20', bloom: .35, bloomTh: .75, fov: 38 }); const s = S.s;
  box(s, 16, .04, 12, mat('#3a3e46', { r: .9 }), 0, 0, 0); box(s, 16, 3, .1, mat('#2e323a'), 0, 1.5, -5); box(s, 16, .1, 12, mat('#22262e'), 0, 3, 0);
  for (let i = 0; i < 6; i++) box(s, 1.6, 2.0, .05, glow('#2a3a5a', .35), -6 + i * 2.4, 1.6, -4.94);
  const desk = (x, z, ry, lit) => { const g = new THREE.Group(); box(g, 1.4, .05, .75, mat('#c8c0b0'), 0, .74, 0); for (const [dx, dz] of [[-.65, -.33], [.65, -.33], [-.65, .33], [.65, .33]]) box(g, .04, .74, .04, mat('#555'), dx, .37, dz);
    box(g, .62, .38, .03, lit ? glow('#9ec8ff', 1.0) : mat('#222'), 0, 1.02, -.25); box(g, .06, .2, .06, mat('#333'), 0, .84, -.27);
    const ch = new THREE.Group(); box(ch, .5, .06, .5, mat('#2a2a34'), 0, .48, 0); box(ch, .5, .55, .06, mat('#2a2a34'), 0, .8, .25); cyl(ch, .03, .03, .45, mat('#444'), 0, .24, 0, 6); ch.position.set(0, 0, .6); g.add(ch);
    if (lit) lamp(g, '#cfe0ff', 2.2, 3, 0, 1.3, .2, false);
    g.position.set(x, 0, z); g.rotation.y = ry; s.add(g); };
  for (const x of [-4.2, 4.2]) for (const z of [-1.6, 1.6]) desk(x, z, z < 0 ? 0 : Math.PI, false);
  desk(-1, -1.0, 0, true); desk(1, 1.0, Math.PI, true);
  box(s, .9, .04, .4, glow('#fff4dc', .25), 0, 2.97, -1);
  return { render() { S.render(); }, update(t, dur) { camMove(S.cam, [-5.5, 2.6, 6.5], [-3.2, 2.3, 5.4], [0, .8, 0], [.3, .9, 0], ease(t / dur)); return ''; } }; } };

// 34 第4章：夜明けの川べり、土手に立つ1人の後ろ姿
SC[34] = { build() { const S = makeScene({ bg: '#e8b898', hemi: .9, exposure: 1.15, sky: '#ffd8c0', ground: '#4a5040', bloom: .25, bloomTh: .85, fov: 38, fog: ['#e8c0a0', 16, 60] }); const s = S.s; sun(s, '#ffc8a0', 1.4, -12, 4, -30, 30);
  box(s, 60, .02, 30, mat('#5a6a7a', { r: .2, m: .1 }), 0, -.2, -16); box(s, 60, .4, 6, mat('#5a6a44', { r: .95 }), 0, 0, 2);
  const slope = box(s, 60, .05, 4, mat('#6a7a4a', { r: .95 }), 0, -.1, -2.2); slope.rotation.x = .12;
  ball(s, 1.6, glow('#ffd8a0', 1.2), -16, 2.4, -40, 1);
  for (let i = 0; i < 6; i++) box(s, 6 + i * 2, .03, .25, glow('#ffe0b8', .25), -8 + (i % 2) * 1.5, -.17, -10 - i * 3);
  const p = human(s, { face: false, top: '#3a4a6a', bottom: '#2a2a34' }); p.position.set(.4, .2, 1.2); p.rotation.y = Math.PI;
  return { render() { S.render(); }, update(t, dur) { camMove(S.cam, [1.4, 1.9, 7.5], [.9, 1.7, 6.0], [0, 1.0, -6], [0, 1.0, -6], ease(t / dur));
    const a = clamp((t - .4) / .5); return ovSvg(`<g opacity="${a}"><rect width="1920" height="360" fill="url(#topg)"/>${otxt(960, 160, '第4章', 34, '#ff8a3d', false)}${otxt(960, 250, '友達が減るのは悪いことか', 64, Y)}</g>`); } }; } };

// 44 冒頭の座敷。今度は湯のみが2つ
const zashiki = (cups) => ({ build() { const S = makeScene({ bg: '#1a120c', hemi: .55, exposure: 1.25, sky: '#ffd8a8', ground: '#3a2a1a', bloom: .25, bloomTh: .85, fov: 36 }); const s = S.s;
  box(s, 12, .05, 8, mat('#b8a26e', { r: .9 }), 0, 0, 0);
  for (let i = -5; i <= 5; i++) box(s, .03, .055, 8, mat('#8a7448'), i * 1.0, .001, 0);
  box(s, 12, 3, .1, mat('#e8dcc0', { r: .9 }), 0, 1.5, -3);
  for (let i = -6; i <= 6; i++) box(s, .05, 3, .12, mat('#5a3e28'), i * .9, 1.5, -2.95);
  for (let j = 0; j < 5; j++) box(s, 12, .05, .12, mat('#5a3e28'), 0, .4 + j * .6, -2.95);
  box(s, 12, .3, .3, mat('#4a3220'), 0, 3.0, -2.9);
  box(s, 4.6, .07, 1.05, mat('#7a5233', { r: .5 }), 0, .36, 0); for (const [dx, dz] of [[-2.1, -.4], [2.1, -.4], [-2.1, .4], [2.1, .4]]) box(s, .08, .33, .08, mat('#4a3220'), dx, .17, dz);
  for (const x of [-1.6, -.55, .5, 1.55]) for (const z of [-.95, .95]) box(s, .58, .08, .58, mat('#7a2e2e', { r: .9 }), x, .04, z);
  cups.forEach(([x, z]) => cyl(s, .05, .042, .1, mat('#e8e2d4', { r: .4 }), x, .45, z, 16));
  cyl(s, .2, .2, .02, mat('#2a1e16'), -.2, .4, 0, 20);
  for (const x of [-1.8, 1.8]) { ball(s, .24, glow('#ffcf8a', .9), x, 2.25, -.6, 2); box(s, .02, .5, .02, mat('#222'), x, 2.7, -.6); lamp(s, '#ffc88a', 6, 7, x, 2.1, -.4, x < 0); }
  sun(s, '#ffd8b0', .4, 3, 5, 6, 8);
  return { render() { S.render(); }, update(t, dur) { camMove(S.cam, [-3.0, 1.55, 4.2], [1.2, 1.35, 3.8], [-1.0, .45, 0], [1.0, .45, 0], ease(t / dur)); return ''; } }; } });
SC[44] = zashiki([[1.05, .2], [1.35, -.2]]);

// 写真を場面の頭に重ねる
const PH = [[6, 'D', 0, 1.6, '総務省「社会生活基本調査」'], [14, 'B', 0, 2.9, 'ヨーロッパ・300万人の携帯電話の記録'], [28, 'E', 0, 2.8, '学校には、3つが全部そろっている']];
for (const [i, n, T0, T1, cap] of PH) { const old = SC[i];
  SC[i] = { kind: 'kami', build() { const b = old.build(); return { render() {}, update(t, dur) { const base = b.update(t, dur);
    const a = Math.min(T0 > 0 ? clamp((t - T0) / .45) : 1, 1 - clamp((t - T1) / .5)); if (a <= 0) return base; const c = clamp((t - T0 - .4) / .5);
    return base + `<div style="position:absolute;left:0;top:0;width:1920px;height:1080px;opacity:${a.toFixed(3)}">` + ovSvg(photoSvg(n, (t - T0) / (T1 - T0 + .5)) + `<rect width="1920" height="320" fill="url(#topg)"/>` + `<g opacity="${c.toFixed(3)}">${otxt(960, 205, cap, 58, Y)}</g>`) + '</div>'; } }; } }; }

// 実写動画を入れる場面：画面を緑（#00ff00）で塗り、あとでffmpegで差し替える
const GV = [[25, 0, 99], [19, 0, 5.0], [39, 0, 99]];
for (const [i, T0, T1] of GV) { const old = SC[i];
  SC[i] = { kind: 'kami', build() { const b = old.build(); return { render() {}, update(t, dur) { const base = b.update(t, dur);
    return (t >= T0 && t < T1) ? base + '<div style="position:absolute;left:0;top:0;width:1920px;height:944px;background:#00ff00"></div>' : base; } }; } }; }

export const SCENES = SC;
