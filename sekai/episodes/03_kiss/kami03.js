// 03 キス — 紙芝居（2D）版。3Dは 0,3,8,13,37,44,48,49 のみ（場所と空気の場面）
// 絵コンテ：ナレーション1行（約4秒）ごとに見せる物を1つ。数字はカウンター、名前・場所は専用の絵。
import { C, W, H, SERIF, clamp, ease, easeOut, pop, fmt, txt, note, head, counter, icon, person, profile, couple, card, arrow, stamp, bubble,
  hbars, vbars, donut, timeline, peopleGrid, paper, scrollBox, kanaCols, phone, worldMap, worldCentroid, japanMap, loadMaps, maps, run, kami } from '/pipeline3d/kami.js';
import { theater, street } from './proto3d.js';
import { SCENES as S3 } from './scenes3d.js';
await loadMaps();

const CX = 960;
// 章タイトル（最初の3秒）
const chapterEls = (num, title, until = 3.0) => [
  { at: 0, out: until, slide: 0, sfx: 'chime', f: () => txt(CX, 400, num, { size: 40, color: C.o, serif: true, ls: 10 }) },
  { at: 0.25, out: until, f: () => txt(CX, 530, title, { size: 104, serif: true, ls: 6 }) },
  { at: 0.7, out: until, slide: 0, f: (lt) => `<rect x="${CX - 300 * ease(lt / .8)}" y="580" width="${600 * ease(lt / .8)}" height="3" fill="${C.o}"/>` },
];
// 地域の判定（maps.json の投影後の重心で大まかに分ける）
const region = (c) => { const [x, y] = c;
  if (x > 900 && x < 1090 && y > 250 && y < 400) return 'me';
  if (x > 720 && x < 960 && y < 300) return 'eu';
  if (x > 1000 && y < 560 && !(x > 1300 && y > 470)) return 'as';
  if (x < 700 && y < 380) return 'na';
  if (x > 300 && x < 560 && y >= 380 && y < 470) return 'ca';
  if (x > 420 && x < 760 && y >= 440) return 'sa';
  if (x > 720 && x < 1080 && y >= 400) return 'af';
  if (x > 1300 && y > 470) return 'oc';
  return '';
};
const regColor = (map) => (id, name) => { const c = maps().world.countries.find(k => k.id === id); return map[region(c?.c || [0, 0])] || '#4d4a45'; };

// 赤ペンの脚本（1, 36）
function script(x, y, rot, s, k, kiss) {
  let lines = ''; [0.82, 0.6, 0.9, 0.7, 0.85, 0.5, 0.88, 0.66, 0.78, 0.92, 0.58, 0.8, 0.7, 0.86].forEach((v, i) => { lines += `<rect x="40" y="${250 + i * 34}" width="${400 * v}" height="9" rx="3" fill="#8a8072" opacity=".75"/>`; });
  const c = clamp(k * 1.6), L = 2 * Math.PI * 200;
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})" filter="url(#sh)"><rect width="520" height="720" rx="6" fill="${C.paper}"/>
    ${txt(40, 80, '脚本', { size: 40, anchor: 'start', color: C.ink, serif: true, shadow: false })}${txt(40, 160, 'はたちの青春', { size: 64, anchor: 'start', color: C.ink, serif: true, shadow: false })}
    ${txt(42, 205, '松竹　1946年', { size: 26, anchor: 'start', color: '#6a6258', serif: true, shadow: false })}${lines}
    ${k > 0 ? `<ellipse cx="250" cy="425" rx="215" ry="78" fill="none" stroke="${C.red}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${(L * (1 - c)).toFixed(1)}" transform="rotate(-4 250 425)"/>` : ''}
    ${kiss > 0 ? `<g transform="translate(120,640) rotate(-8) scale(${pop(kiss).toFixed(3)})" opacity="${clamp(kiss * 2)}"><text font-family="Georgia,${SERIF}" font-style="italic" font-weight="700" font-size="112" fill="${C.red}">KISS!</text></g>` : ''}</g>`;
}
const kuchisu = (hi) => { const w = 1500, h = 520; return kanaCols(w, h, [[w / 2 - 80, w / 2 + 80]]) + ['口', '吸', 'ふ'].map((ch, i) => txt(w / 2, 150 + i * 120, ch, { size: 96, color: '#1e1a16', serif: true, shadow: false })).join('')
  + (hi > 0 ? `<rect x="${w / 2 - 74}" y="62" width="148" height="400" fill="none" stroke="${C.red}" stroke-width="7" opacity="${hi}"/>` : ''); };
// 口の中（細菌の円）
function mouth(cx, cy, r, n, lt, hueA, mix = 0, seed = 1) { let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,.04)" stroke="${C.gray}" stroke-width="5"/>`; const R = (k) => ((Math.sin(k * 91.7 + seed * 13.1) * 43758.5) % 1 + 1) % 1;
  const shown = Math.floor(n * easeOut(lt / 1.4)); for (let i = 0; i < shown; i++) { const a = R(i) * 6.283, rr = Math.sqrt(R(i + 999)) * (r - 14); const hue = hueA == null ? Math.floor(R(i + 77) * 360) : (R(i + 5) < mix ? (hueA + 180) % 360 : hueA);
    s += `<circle cx="${(cx + Math.cos(a) * rr).toFixed(1)}" cy="${(cy + Math.sin(a) * rr).toFixed(1)}" r="7" fill="hsl(${hue},70%,62%)"/>`; }
  return s; }

const SC = [];
// 0 3D 映画館
SC[0] = S3[0];
// 1 GHQの注文
SC[1] = kami((t) => run([
  { at: 0, f: () => txt(CX, 190, '1946年　映画『はたちの青春』', { size: 44, color: C.dim, serif: true }) },
  { at: 0.15, slide: 60, sfx: 'pop', f: () => script(1080, 250, 2, .88, clamp((t - 4.4) / 1.2), clamp((t - 6.2) / .5)) },
  { at: 3.8, sfx: 'pop', f: () => person(560, 630, 140, C.navy, 'officer') + txt(560, 860, 'GHQ（民間情報教育局）', { size: 34 }) },
  { at: 4.3, sfx: 'pop', f: () => bubble(600, 320, 420, 110, 'キスシーンを入れろ', { size: 44 }) },
  { at: 6.2, sfx: 'stamp', f: () => '' },
], t), { chap: 0 });
// 2 それまでは？→口吸ふ
SC[2] = kami((t) => run([
  { at: 0, out: 3.3, f: () => txt(CX, 420, '？', { size: 200, color: C.gold }) },
  { at: 0, out: 4.0, f: () => person(760, 660, 120, '#c9b48a', 'heian') + person(1160, 660, 120, '#d98a8a', 'heianf') + txt(CX, 200, 'それまでの日本人は、キスをしなかった？', { size: 52, serif: true }) },
  { at: 3.3, out: 4.0, slide: 0, sfx: 'stamp', f: (lt) => `<g transform="translate(${CX},440) scale(${Math.max(.6, pop(lt / .3)).toFixed(3)})">${txt(0, 60, 'ノー', { size: 220, color: C.red, serif: true })}</g>` },
  { at: 4.3, slide: 0, sfx: 'swish', f: (lt) => scrollBox(210, 230, 1500, 520, lt / 1.1, kuchisu(clamp((lt - 1.3) / .4))) },
  { at: 5.6, sfx: 'chime', f: () => '' },
  { at: 5.8, f: () => txt(1500, 860, '口吸ふ（くちすう）＝ キス', { size: 46, serif: true }) + txt(1500, 912, '千年以上前の日本語', { size: 30, color: C.dim }) },
], t), { chap: 0 });
// 3 3D タイトル
SC[3] = S3[3];

// ===== 第1章 =====
// 4 168の文化
SC[4] = kami((t) => { const dots = maps().world.countries.slice(0, 168);
  return run([...chapterEls('第1章', 'キスしない世界の半分'),
    { at: 3.2, slide: 0, f: (lt) => worldMap(160, 150, 1, null, { sea: '#1d2a36' }) + dots.map((c, i) => { const a = clamp((lt - 1.2 - i * 0.025) / .3); return a > 0 ? `<circle cx="${160 + c.c[0]}" cy="${150 + c.c[1]}" r="${9 * pop(a)}" fill="${C.gold}" opacity="${a}"/>` : ''; }).join('') },
    { at: 3.4, f: () => txt(110, 200, '2015年　アメリカの研究チーム', { size: 38, anchor: 'start', color: C.dim }) },
    { at: 4.4, sfx: 'count', f: (lt) => `<rect x="1370" y="640" width="420" height="200" rx="20" fill="rgba(20,18,24,.75)"/>` + counter(1580, 770, 168, lt, { size: 120, dur: 4.2, color: C.gold, serif: true }) + txt(1580, 825, 'の文化を調べた', { size: 34 }) },
  ], t); }, { chap: 1, enter: 'zoom' });
// 5 46%
SC[5] = kami((t) => run([
  { at: 0, f: () => head('恋人同士のキスが確認できた文化', { y: 170 }) },
  { at: 0.3, slide: 0, f: (lt) => peopleGrid(170, 300, 24, 7, 42, 77, clamp((t - 2.2) / 3) * 1.6, C.o, '#4d4a45') },
  { at: 4.4, sfx: 'pop', f: (lt) => counter(1520, 560, 46, lt, { size: 200, suf: '%', dur: 1.0, serif: true }) + txt(1520, 640, '77 / 168の文化', { size: 40 }) },
  { at: 7.0, f: () => txt(1520, 740, '残りの半分以上は「記録なし」', { size: 36, color: C.dim }) },
], t), { chap: 1, enter: 'right', leave: 'left' });
// 6 地域別
SC[6] = kami((t) => { const k = (a) => clamp((t - a) / .6);
  const col = { me: k(3.2) > 0 ? C.o : '', as: k(6.4) > 0 ? '#e9a26a' : '', eu: k(7.6) > 0 ? '#d7a77d' : '', na: k(8.8) > 0 ? '#c6a88f' : '' };
  return run([
    { at: 0, f: () => head('恋人同士のキスがある文化の割合', { y: 170 }) },
    { at: 0.2, slide: 0, f: () => worldMap(1000, 300, .55, regColor(col)) },
    { at: 2.9, slide: 0, f: (lt) => hbars(380, 300, 520, [{ label: '中東', v: 100, txt: '100%' }, { label: 'アジア', v: 73, txt: '73%', c: '#e9a26a' }, { label: 'ヨーロッパ', v: 70, txt: '70%', c: '#d7a77d' }, { label: '北米', v: 55, txt: '55%', c: '#c6a88f' }], 115, lt, { stag: 1.2, bh: 72, gap: 46 }) },
    { at: 2.9, sfx: 'pop' }, { at: 4.1, sfx: 'pop' }, { at: 5.3, sfx: 'pop' }, { at: 6.5, sfx: 'pop' },
    { at: 1, f: () => note(1880, 125, 'Jankowiak et al. (2015)', 'end') },
  ].filter(e => e.f || e.sfx).map(e => e.f ? e : { ...e, f: () => '' }), t); }, { chap: 1, enter: 'right', leave: 'left' });
// 7 ゼロの地域
const ZERO = [[['Guatemala','Belize','Honduras','El Salvador','Nicaragua','Costa Rica','Panama'], 0.6],
  [['Dem. Rep. Congo','Congo','Gabon','Cameroon','Central African Rep.','Tanzania','Zambia','Angola','Botswana','Namibia','Kenya','Uganda','Mozambique','Zimbabwe','Malawi'], 3.2],
  [['Papua New Guinea'], 4.6], [['Brazil','Peru','Colombia','Venezuela','Bolivia','Ecuador','Guyana','Suriname'], 6.0]];
SC[7] = kami((t) => { const zc = (id, name) => { for (const [ns, a] of ZERO) if (t > a && ns.includes(name)) return '#b8443c'; return '#4d4a45'; };
  const rows = [['中米', 0.6], ['サハラより南の狩猟採集民', 3.2], ['ニューギニアの狩猟採集民', 4.6], ['アマゾンの狩猟採集民', 6.0]];
  return run([
    { at: 0, f: () => head('キスの報告が「ゼロ」だった地域', { y: 170 }) },
    { at: 0.2, slide: 0, f: () => worldMap(1000, 300, .55, zc) },
    ...rows.map(([s0, a], i) => ({ at: a, sfx: 'tick', dx: -40, slide: 0, f: () => txt(160, 360 + i * 120, s0, { size: 42, anchor: 'start', weight: 600 }) + txt(900, 368 + i * 120, '0', { size: 80, color: C.red, serif: true }) })),
    { at: 1, f: () => note(1880, 125, 'Jankowiak et al. (2015)　※色は地域の目安', 'end') },
  ], t); }, { chap: 1, enter: 'right' });
// 8 3D 島
SC[8] = S3[8];
// 9 社会の複雑さ
SC[9] = kami((t) => run([
  { at: 0, f: () => head('研究チームが見つけた傾向', { y: 170 }) },
  { at: 0.4, slide: 0, f: (lt) => { const x0 = 420, y0 = 820, w = 1080, h = 520; let s = `<path d="M${x0},${y0 - h} L${x0},${y0} L${x0 + w},${y0}" stroke="${C.dim}" stroke-width="4" fill="none"/>`
      + txt(x0 + w, y0 + 60, '身分・階級が複雑な社会 →', { size: 34, anchor: 'end', color: C.dim }) + txt(x0 - 20, y0 - h - 24, '↑ キスがある', { size: 34, anchor: 'start', color: C.dim });
    const R = (k) => ((Math.sin(k * 51.3) * 9973.1) % 1 + 1) % 1; for (let i = 0; i < 36; i++) { const u = R(i), v = clamp(u * .8 + (R(i + 50) - .5) * .35); const a = clamp((t - 2.4 - i * .06) / .3); if (a > 0) s += `<circle cx="${x0 + 40 + u * (w - 80)}" cy="${y0 - 40 - v * (h - 80)}" r="${11 * pop(a)}" fill="rgba(243,239,230,.75)"/>`; }
    const q = clamp((t - 5.0) / 1.2); if (q > 0) s += arrow(x0 + 80, y0 - 80, x0 + 80 + (w - 200) * q, y0 - 80 - (h - 200) * q, C.o, 1, 10); return s; } },
  { at: 5.0, sfx: 'swish' },
  { at: 6.1, sfx: 'chime', f: () => `<rect x="470" y="330" width="720" height="90" rx="16" fill="rgba(20,18,24,.85)"/>` + txt(830, 392, 'キスは、文明とともに広がった？', { size: 46, serif: true, color: C.gold }) },
  { at: 1, f: () => note(1880, 125, '※イメージ図', 'end') },
].map(e => e.f ? e : { ...e, f: () => '' }), t), { chap: 1, enter: 'zoom' });
// 10 メソポタミア
SC[10] = kami((t) => run([
  { at: 0, f: () => txt(CX, 190, '記録に残る最古のキス', { size: 48, serif: true }) },
  { at: 0.3, slide: 60, sfx: 'pop', f: () => { let w = ''; const R = (k) => ((Math.sin(k * 33.7) * 777.7) % 1 + 1) % 1; for (let r = 0; r < 9; r++) for (let i = 0; i < 14; i++) { const x = -250 + i * 36 + R(r * 20 + i) * 6, y = -190 + r * 44; w += `<path d="M${x},${y} l20,6 l-20,8 z M${x + 18},${y + 3} h12" fill="#5a3a1e" stroke="#5a3a1e" stroke-width="3"/>`; }
      return `<g transform="translate(700,560) rotate(-4)" filter="url(#sh)"><rect x="-290" y="-230" width="580" height="460" rx="60" fill="#b8915f"/>${w}</g>`; } },
  { at: 1.4, sfx: 'count', f: (lt) => counter(1420, 500, 4500, lt, { size: 140, pre: '約', suf: '年前', dur: 1.6, serif: true, fmt: n => String(Math.round(n / 100) * 100) }) + txt(1420, 580, '紀元前2500年ごろ・メソポタミア', { size: 36 }) },
  { at: 4.3, f: () => txt(1420, 700, '粘土板に「恋人同士のキス」', { size: 40, color: C.gold }) },
  { at: 1, f: () => note(1880, 125, 'Arbøll & Rasmussen (2023) Science', 'end') },
], t), { chap: 1, enter: 'right', leave: 'left' });
// 11 ローマ
SC[11] = kami((t) => run([
  { at: 0, f: () => txt(CX, 190, 'キスは、病気も運ぶ', { size: 52, serif: true }) },
  { at: 1.4, sfx: 'pop', f: () => icon('laurel', 560, 520, 300, C.gold, 6) + person(560, 560, 110, '#d8cdb8') + txt(560, 780, '皇帝ティベリウス', { size: 40 }) + txt(560, 830, '古代ローマ', { size: 30, color: C.dim }) },
  { at: 2.6, f: () => couple(1340, 520, .75, 30, '#d8cdb8') + txt(1340, 780, '公式の場でのキス', { size: 40 }) },
  { at: 4.2, sfx: 'stamp', f: (lt) => stamp(1340, 470, 100, '禁止', lt) },
  { at: 6.2, f: (lt) => { let s = ''; for (let i = 0; i < 14; i++) { const p = ((lt * .5 + i / 14) % 1); s += `<circle cx="${1240 + p * 200}" cy="${470 + Math.sin(p * 9 + i) * 30}" r="8" fill="${C.green}" opacity="${.8 * Math.sin(p * Math.PI)}"/>`; } return s + txt(1340, 300, '口の病気がうつる？', { size: 40, color: C.green }); } },
  { at: 1, f: () => note(1880, 125, 'Smithsonian Magazine (2023)', 'end') },
], t), { chap: 1, enter: 'right', leave: 'left' });
// 12 系統樹
SC[12] = kami((t) => { const tips = [['テナガザル', .08, 0], ['オランウータン', .26, 1], ['ゴリラ', .44, 1], ['チンパンジー', .6, 1], ['ボノボ', .74, 1], ['ヒト', .9, 1]];
  const root = [300, 820], k = clamp((t - .5) / 4), lit = clamp((t - 6.0) / 1.5);
  return run([
    { at: 0, f: () => txt(CX, 180, 'キスはいつ生まれたか', { size: 52, serif: true }) },
    { at: 0.3, slide: 0, f: () => { let s = ''; tips.forEach(([n, f, kiss], i) => { const a = clamp(k * 6 - i * .7); if (a <= 0) return; const tx = 300 + f * 1300, bx = 300 + f * 520, by = 820 - f * 330, on = kiss && lit > 0;
        s += `<path d="M${root[0]},${root[1]} L${bx},${by} L${tx},300" stroke="${on ? C.o : C.fg}" stroke-width="7" fill="none" stroke-linecap="round" opacity="${a}"/>` + txt(tx, 270, n, { size: 36, color: on ? C.o : C.fg, op: a }); });
        if (t > 9) { const a = clamp((t - 9) / .6); s += `<path d="M${300 + .9 * 520 + 400},${820 - .9 * 330 - 200} L${300 + .82 * 1300},360" stroke="${C.t}" stroke-width="5" fill="none" opacity="${a}"/>` + txt(300 + .82 * 1300 - 20, 395, 'ネアンデルタール人', { size: 28, color: C.t, op: a, anchor: 'end' }); } return s; } },
    { at: 6.0, sfx: 'chime', f: () => `<circle cx="${300 + .2 * 520}" cy="${820 - .2 * 330}" r="20" fill="${C.o}" filter="url(#glow)"/>` },
    { at: 6.4, sfx: 'count', f: (lt) => `<rect x="460" y="700" width="760" height="130" rx="18" fill="rgba(20,18,24,.8)"/>` + counter(840, 790, 2150, lt, { size: 72, suf: '万〜1690万年前', dur: 1.4, color: C.o, serif: true, fmt: n => String(Math.round(n)) }) },
    { at: 1, f: () => note(1880, 125, 'Brindle et al. (2025) Oxford', 'end') },
  ], t); }, { chap: 1, enter: 'zoom' });
// 13 3D 焚き火
SC[13] = S3[13];
// 14 何のため？
SC[14] = kami((t) => run([
  { at: 0, out: 1.8, sfx: 'pop', f: () => txt(CX, 520, 'キスは、人間より古い', { size: 96, serif: true }) },
  { at: 1.8, out: 6.4, slide: 0, f: () => worldMap(300, 180, .82, (id) => { const c = maps().world.countries.find(k => k.id === id); return (c && ((c.c[0] * 7 + c.c[1] * 3) % 10) < 5) ? C.o : '#4d4a45'; }) + txt(CX, 920 - 40, '人間の文化の半分は、キスをやめている', { size: 44, color: C.fg }) },
  { at: 6.6, sfx: 'pop', f: (lt) => `<g transform="translate(${CX},460) scale(${pop(lt / .4).toFixed(3)})">${icon('lips', 0, 0, 380, C.pink, 6)}</g>` + txt(CX + 330, 520, '？', { size: 220, color: C.gold }) },
  { at: 7.2, f: () => txt(CX, 780, 'キスは本来、何のためにあったのか', { size: 54, serif: true }) },
], t), { chap: 1, enter: 'right' });

// ===== 第2章 =====
SC[15] = kami((t) => run([...chapterEls('第2章', '唇は何を測っているのか', 3.0),
  { at: 3.2, f: () => txt(CX, 200, 'アメリカの大学生', { size: 44, color: C.dim }) },
  { at: 3.2, sfx: 'count', f: (lt) => counter(CX, 330, 1041, lt, { size: 110, suf: '人', dur: 1.2, serif: true }) },
  { at: 3.4, slide: 0, f: (lt) => { let s = ''; for (let i = 0; i < 30; i++) s += person(330 + i * 43, 560, 40, i % 2 ? C.pink : C.t, i % 2 ? 'f' : 'm'); return `<g opacity="${clamp(lt / .8)}">${s}</g>`; } },
  { at: 5.0, sfx: 'pop', f: () => bubble(CX, 760, 900, 120, '初めてのキスで、冷めたことはある？', { size: 46 }) },
], t), { chap: 2, enter: 'zoom', leave: 'left' });
SC[16] = kami((t) => run([
  { at: 0, f: () => head('「冷めた」経験がある人', { y: 170 }) },
  { at: 0.4, slide: 0, sfx: 'pop', f: (lt) => vbars(560, 260, 800, 500, [{ label: '男性', v: 59, c: C.t, txt: '59%' }, { label: '女性', v: 66, c: C.o, txt: '66%' }], 80, lt, { stag: .5, gap: 220 }) },
  { at: 4.8, sfx: 'stamp', f: (lt) => { const s = clamp(lt / .6) * 40; return `<g transform="translate(1620,420)">${`<g transform="translate(${-s},0) rotate(${-s / 3})"><path d="M0,80 Q-92,8 -80,-36 Q-68,-80 -24,-72 Q0,-64 0,-40 L-12,0 L8,30 Z" fill="${C.red}"/></g>`}${`<g transform="translate(${s},0) rotate(${s / 3})"><path d="M0,80 Q92,8 80,-36 Q68,-80 24,-72 Q0,-64 0,-40 L-12,0 L8,30 Z" fill="${C.red}"/></g>`}</g>` + txt(1620, 620, '一度のキスで、恋が終わる', { size: 36 }); } },
  { at: 1, f: () => note(1880, 125, 'Hughes, Harrison & Gallup (2007)', 'end') },
], t), { chap: 2, enter: 'right', leave: 'left' });
SC[17] = kami((t) => { const tilt = 12 * easeOut((t - 2.5) / 1.5);
  return run([
    { at: 0, f: () => head('キスを重視するのは？', { y: 170 }) },
    { at: 0.3, slide: 0, f: () => `<g transform="translate(${CX},420)"><path d="M0,0 L0,380 M-120,380 h240" stroke="${C.gold}" stroke-width="10" stroke-linecap="round"/>
      <g transform="rotate(${-tilt})"><path d="M-380,0 h760" stroke="${C.gold}" stroke-width="10" stroke-linecap="round"/>
        <g transform="translate(-380,0) rotate(${tilt})"><path d="M0,0 L-90,160 M0,0 L90,160 M-110,160 h220" stroke="${C.gold}" stroke-width="5"/>${person(0, 100, 50, C.pink, 'f')}${icon('lips', 0, 190, 90, C.pink, 6)}</g>
        <g transform="translate(380,0) rotate(${tilt})"><path d="M0,0 L-90,160 M0,0 L90,160 M-110,160 h220" stroke="${C.gold}" stroke-width="5"/>${person(0, 100, 50, C.t, 'm')}</g></g></g>` },
    { at: 2.5, sfx: 'swish' },
    { at: 4.5, f: () => txt(CX, 880 - 30, '女性のほうが、最初のキスで気持ちが変わりやすい', { size: 42 }) },
    { at: 1, f: () => note(1880, 125, 'Wlodarski & Dunbar (2013) 900人以上', 'end') },
  ].map(e => e.f ? e : { ...e, f: () => '' }), t); }, { chap: 2, enter: 'right', leave: 'left' });
SC[18] = kami((t) => { const open = easeOut((t - 6.6) / 1.2);
  return run([
    { at: 0, f: () => head('キスなしで、体の関係に進める？', { y: 170 }) },
    { at: 0.5, slide: 0, f: () => person(560, 640, 110, C.t) + txt(560, 860, '男性', { size: 40 }) + `<path d="M760,520 h320" stroke="${C.t}" stroke-width="10" stroke-dasharray="20 16"/>` },
    { at: 1.6, slide: 0, f: () => { const g = (x, dx) => `<rect x="${x + dx}" y="380" width="110" height="340" fill="#7a4e2e" stroke="#4a2e1a" stroke-width="6"/>`;
      return `<path d="M1240,370 h380 M1230,350 h400" stroke="#4a2e1a" stroke-width="16"/><rect x="1240" y="370" width="16" height="360" fill="#4a2e1a"/><rect x="1604" y="370" width="16" height="360" fill="#4a2e1a"/>` + g(1320, -60 * open) + g(1430, 60 * open) + person(1430, 640, 110, C.pink, 'f') + txt(1430, 860, '女性', { size: 40 }); } },
    { at: 5.7, sfx: 'pop', f: () => txt(1430, 300, '関所', { size: 64, serif: true, color: C.gold }) },
    { at: 6.6, sfx: 'swish', f: () => icon('lips', 1430, 560, 120, C.pink, 6) },
    { at: 1, f: () => note(1880, 125, 'Hughes et al. (2007)', 'end') },
  ], t); }, { chap: 2, enter: 'right', leave: 'left' });
SC[19] = kami((t) => { const nd = -1.2 + 2.0 * easeOut((t - 4.4) / 1.5);
  return run([
    { at: 0, f: () => head('キスの使い道', { y: 170 }) },
    { at: 3.5, sfx: 'pop', f: () => card(140, 250, 780, 600) + person(330, 560, 80, C.pink, 'f') + txt(330, 760, '女性', { size: 40 }) + txt(680, 340, '本気度チェック', { size: 42, color: C.o })
        + `<g transform="translate(680,580)"><path d="M-150,0 A150,150 0 0 1 150,0" stroke="${C.dark}" stroke-width="30" fill="none"/><path d="M-150,0 A150,150 0 0 1 ${150 * Math.cos(Math.PI - (nd + 1.2) / 2 * Math.PI)},${-150 * Math.sin(Math.PI - (nd + 1.2) / 2 * Math.PI)}" stroke="${C.o}" stroke-width="30" fill="none"/><path d="M0,0 L${120 * Math.cos(Math.PI - (nd + 1.2) / 2 * Math.PI)},${-120 * Math.sin(Math.PI - (nd + 1.2) / 2 * Math.PI)}" stroke="${C.fg}" stroke-width="8" stroke-linecap="round"/></g>` },
    { at: 7.0, sfx: 'pop', f: (lt) => card(1000, 250, 780, 600) + person(1180, 560, 80, C.t) + txt(1180, 760, '男性', { size: 40 }) + arrow(1320, 460, 1320 + 300 * easeOut(lt / .8), 460, C.t, 1, 8) + txt(1500, 420, '先に進む', { size: 42, color: C.t })
        + arrow(1320, 640, 1320 + 300 * easeOut((lt - .6) / .8), 640, C.t, 1, 8) + txt(1500, 600, 'けんかの仲直り', { size: 42, color: C.t, op: clamp((lt - .6) / .4) }) },
    { at: 1, f: () => note(1880, 125, 'Hughes et al. (2007)', 'end') },
  ], t); }, { chap: 2, enter: 'right', leave: 'left' });
SC[20] = kami((t) => { const gap = 220 - 190 * easeOut(t / 5.5);
  return run([
    { at: 0, slide: 0, f: () => couple(CX, 520, 1.0, gap, '#e9e2d0') },
    { at: 1.5, slide: 0, f: () => { let s = ''; for (let k = 0; k < 3; k++) { let d = ''; for (let i = 0; i <= 30; i++) { const u = i / 30, x = CX - gap / 2 - 20 + (gap + 40) * u, y = 470 + (k - 1) * 22 + Math.sin(u * 9 - t * 3 + k) * 10; d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1); } s += `<path d="${d}" stroke="${C.t}" stroke-width="4" fill="none" opacity=".75"/>`; } return s; } },
    { at: 4.0, sfx: 'chime', f: () => txt(CX, 200, 'キス ＝ 相手を見極める検査', { size: 56, serif: true, color: C.gold }) },
    { at: 4.6, f: () => txt(CX, 860, '息や肌の匂いを、いやでも嗅ぐ', { size: 40 }) },
  ], t); }, { chap: 2, enter: 'zoom', leave: 'left' });
SC[21] = kami((t) => run([
  { at: 0, f: () => head('匂い ＝ 免疫の遺伝子の名刺？', { y: 180 }) },
  { at: 0.4, sfx: 'pop', f: () => icon('dna', 560, 500, 260, C.t, 6) + txt(560, 720, 'あなたの遺伝子', { size: 36 }) },
  { at: 1.6, sfx: 'pop', f: () => icon('dna', 1360, 500, 260, C.o, 6) + txt(1360, 720, '相手の遺伝子', { size: 36 }) },
  { at: 2.6, sfx: 'pop', f: (lt) => `<g transform="translate(${CX},500) scale(${pop(lt / .35).toFixed(3)})">${txt(0, 50, '≠', { size: 180, color: C.gold })}</g>` },
  { at: 3.4, f: () => icon('nose', CX, 760, 120, C.fg, 6) },
  { at: 5.1, f: () => txt(CX, 880 - 20, 'キスは、一番近い距離の検査', { size: 44, color: C.gold }) },
], t), { chap: 2, enter: 'right', leave: 'left' });
SC[22] = kami((t) => { const sec = clamp((t - 3.0) / 5.5) * 10;
  return run([
    { at: 0, f: () => head('キスは、細菌の交換', { y: 170 }) },
    { at: 0.3, slide: 0, f: () => mouth(500, 520, 200, 120, t, 25, 0, 1) + mouth(1420, 520, 200, 120, t, 190, 0, 2) },
    { at: 3.0, slide: 0, f: () => { let s = ''; for (let i = 0; i < 40; i++) { const p = ((t * .6 + i / 40) % 1); const dir = i % 2; s += `<circle cx="${dir ? 700 + p * 520 : 1220 - p * 520}" cy="${520 + Math.sin(p * 6 + i) * 60}" r="7" fill="hsl(${dir ? 25 : 190},70%,62%)" opacity="${Math.sin(p * Math.PI)}"/>`; } return s; } },
    { at: 3.0, sfx: 'count', f: () => icon('timer', CX, 330, 110, C.fg, 6) + txt(CX, 470, `${sec.toFixed(1)}秒`, { size: 56, color: C.t }) },
    { at: 3.0, f: (lt) => `<rect x="610" y="700" width="700" height="150" rx="18" fill="rgba(20,18,24,.8)"/>` + counter(CX, 810, 8000, lt, { size: 110, suf: '万個', dur: 5.5, serif: true }) },
    { at: 1, f: () => note(1880, 125, 'Kort et al. (2014) Microbiome', 'end') },
  ], t); }, { chap: 2, enter: 'right', leave: 'left' });
SC[23] = kami((t) => run([
  { at: 0, f: () => head('口の中の細菌', { y: 170 }) },
  { at: 0.2, slide: 0, f: () => mouth(700, 540, 290, 700, t / 2, null, 0, 3) },
  { at: 1.4, sfx: 'count', f: (lt) => counter(1420, 560, 700, lt, { size: 150, suf: '種類', dur: 1.2, serif: true }) + txt(1420, 640, '以上', { size: 44 }) },
  { at: 3.4, f: () => txt(1420, 760, 'キスのたびに、一部が引っ越す', { size: 36, color: C.dim }) },
], t), { chap: 2, enter: 'right', leave: 'left' });
SC[24] = kami((t) => { const kiss = Math.min(9, Math.floor(clamp((t - .8) / 4.5) * 10)); const mix = kiss / 9;
  return run([
    { at: 0, f: () => head('1日9回以上キスするカップル', { y: 170 }) },
    { at: 0.2, slide: 0, f: () => mouth(620, 520, 230, 220, 2, 25, mix * .9, 4) + mouth(1300, 520, 230, 220, 2, 190, mix * .9, 5) + icon('heart', CX, 520, 70, C.pink, 6) },
    { at: 0.8, f: () => txt(CX, 840 - 40, `キス ${kiss} 回目`, { size: 46, color: C.o }) },
    { at: 0.8, sfx: 'tick' }, { at: 1.3, sfx: 'tick' }, { at: 1.8, sfx: 'tick' }, { at: 2.3, sfx: 'tick' }, { at: 2.8, sfx: 'tick' }, { at: 3.3, sfx: 'tick' }, { at: 3.8, sfx: 'tick' }, { at: 4.3, sfx: 'tick' }, { at: 4.8, sfx: 'tick' },
    { at: 5.3, f: () => `<rect x="340" y="230" width="1240" height="90" rx="16" fill="rgba(20,18,24,.82)"/>` + txt(CX, 292, '相手の体を、少しずつ自分の中に取り込む', { size: 44, serif: true, color: C.gold }) },
  ].map(e => e.f ? e : { ...e, f: () => '' }), t); }, { chap: 2, enter: 'right', leave: 'left' });
SC[25] = kami((t) => run([
  { at: 0, f: () => txt(CX, 190, '相手を確かめ、混ざり合う', { size: 50, serif: true }) },
  { at: 0.3, slide: 0, f: (lt) => `<g opacity="${clamp(lt / .8)}">${japanMap(420, 250, .62)}</g>` },
  { at: 2.0, sfx: 'pop', f: (lt) => `<g transform="translate(1000,520) scale(${pop(lt / .4).toFixed(3)})">${icon('lips', 0, 0, 200, C.red, 7)}</g>` },
  { at: 2.6, f: () => txt(1480, 520, 'では、', { size: 56, serif: true }) + txt(1480, 610, '日本人は？', { size: 72, serif: true, color: C.gold }) },
], t), { chap: 2, enter: 'zoom' });

// ===== 第3章 =====
SC[26] = kami((t) => run([...chapterEls('第3章', '口吸いの国', 3.0),
  { at: 3.2, slide: 0, f: (lt) => timeline(260, 520, 1400, [{ at: .05, label: '898年', sub: '紀長谷雄の文章', sub2: '平安時代', c: C.red }], clamp((lt - .2) / 1.2)) },
  { at: 6.0, sfx: 'pop', f: (lt) => scrollBox(380, 620, 600, 200, lt / .8, kanaCols(600, 200, [[230, 370]], 4) + txt(300, 130, '口吸ひ', { size: 64, color: '#1e1a16', serif: true, shadow: false })) },
], t), { chap: 3, enter: 'zoom', leave: 'left' });
SC[27] = kami((t) => run([
  { at: 0, f: () => head('口吸いが出てくる記録', { y: 170 }) },
  { at: 0.2, slide: 0, sfx: 'swish', f: (lt) => timeline(220, 500, 1480, [{ at: .02, label: '898年', sub: '紀長谷雄', c: C.red }, { at: .34, label: '1120年ごろ', sub: '今昔物語' }, { at: .66, label: '室町時代', sub: '御伽草子' }, { at: .98, label: '江戸時代', sub: '遊郭の隠語', c: C.pink }], clamp(lt / 4.5), { ls: 46 }) },
  { at: 5.0, sfx: 'pop', f: () => bubble(1480, 760, 420, 110, '「おさしみ」', { size: 50, tail: 'right' }) },
  { at: 1, f: () => note(1880, 125, '大阪大学『待兼山論叢』／百科事典「接吻」', 'end') },
], t), { chap: 3, enter: 'right', leave: 'left' });
SC[28] = kami((t) => run([
  { at: 0, f: () => card(160, 220, 760, 620) + txt(540, 300, '口吸いが出てくる', { size: 44, color: C.o }) },
  ...['日記', '説話（今昔物語）', '狂歌・俳諧'].map((s0, i) => ({ at: 0.3 + i * .35, sfx: 'tick', dx: -30, slide: 0, f: () => txt(540, 420 + i * 110, s0 + '　○', { size: 44 }) })),
  { at: 1.6, sfx: 'pop', f: () => card(1000, 220, 760, 620) + txt(1380, 300, '出てこない', { size: 44, color: C.red }) + ['源氏物語（恋の物語）', '和歌'].map((s0, i) => txt(1380, 420 + i * 110, s0 + '　×', { size: 44 })).join('') },
  { at: 5.4, sfx: 'pop', f: () => person(1380, 720, 46, '#d8cdb8') + txt(1380, 820, 'ラフカディオ・ハーンも驚いた', { size: 32, color: C.gold }) },
], t), { chap: 3, enter: 'right', leave: 'left' });
SC[29] = kami((t) => { const d = clamp((t - 1.0) / 1.5);
  return run([
    { at: 0, slide: 0, f: () => card(160, 220, 760, 620) + txt(540, 300, '書き残された', { size: 44, color: C.o }) + ['日記', '説話', '狂歌・俳諧'].map((s0, i) => txt(540, 420 + i * 110, s0, { size: 44 })).join('') },
    { at: 0, slide: 0, f: () => `<g opacity="${1 - d * .7}">${card(1000, 220, 760, 620) + ['恋の物語', '和歌'].map((s0, i) => txt(1380, 420 + i * 110, s0, { size: 44 })).join('')}</g>` },
    { at: 2.4, sfx: 'chime', f: () => txt(1380, 300, '語られない', { size: 60, color: C.red, serif: true }) },
    { at: 3.6, f: () => txt(540, 800, 'こっそり書かれる言葉', { size: 36, color: C.gold }) },
  ], t); }, { chap: 3, enter: 'fade', leave: 'left' });
const kimono = (x, y, w, h) => { let s = ''; for (let i = 0; i < 6; i++) s += `<rect x="${x + i * w / 6}" y="${y}" width="${w / 6 + 1}" height="${h}" fill="${['#8a2a3a', '#2a4a6a', '#c9a43a', '#3d6b4f', '#8a2a3a', '#2a4a6a'][i]}"/>`; for (let i = 0; i < 24; i++) s += `<circle cx="${x + (i * 53) % w}" cy="${y + (i * 97) % h}" r="12" fill="rgba(255,240,220,.25)"/>`; return s; };
SC[30] = kami((t) => run([
  { at: 0, f: () => head('江戸の春画で、着物を着たまま描かれた割合', { y: 170, size: 48 }) },
  { at: 3.3, sfx: 'pop', f: (lt) => donut(600, 520, 200, [{ v: 80, c: C.o }, { v: 20 }], easeOut(lt / 1.2)) + counter(600, 550, 8, lt, { size: 84, pre: '約', suf: '割', dur: 1.2 }) + txt(600, 810, '男女とも', { size: 40 }) },
  { at: 7.4, sfx: 'pop', f: (lt) => donut(1320, 520, 200, [{ v: 90, c: C.t }, { v: 10 }], easeOut(lt / 1.0)) + counter(1320, 550, 9, lt, { size: 84, pre: '約', suf: '割', dur: 1.0 }) + txt(1320, 810, '女性', { size: 40 }) },
  { at: 1, f: () => note(1880, 125, '鈴木堅弘「春画と衣装」日文研', 'end') },
], t), { chap: 3, enter: 'right', leave: 'left' });
SC[31] = kami((t) => run([
  { at: 0, f: () => head('同じ時代の春画を比べると', { y: 170 }) },
  { at: 0.3, f: () => kimono(300, 280, 460, 440) + txt(530, 800, '日本：着物を着たまま', { size: 42, color: C.o }) },
  { at: 1.6, sfx: 'pop', f: () => `<rect x="1160" y="280" width="460" height="440" fill="rgba(232,210,180,.55)"/>` + txt(1390, 800, '中国：ほとんどが裸', { size: 42, color: C.dim }) },
  { at: 3.4, sfx: 'chime', f: () => `<rect x="560" y="380" width="800" height="110" rx="16" fill="rgba(20,18,24,.85)"/>` + txt(CX, 455, '性を描くときでさえ、全部は見せない', { size: 46, serif: true, color: C.gold }) },
  { at: 1, f: () => note(1880, 125, '※明代後期以降の中国春画（人物は描かず色面で表現）', 'end') },
], t), { chap: 3, enter: 'right', leave: 'left' });
SC[32] = kami((t) => run([
  { at: 0, sfx: 'pop', f: () => txt(400, 330, '明治', { size: 140, serif: true }) },
  { at: 0.9, f: () => txt(400, 450, '西洋から「愛の象徴」のキス', { size: 40, color: C.dim }) },
  { at: 0.9, slide: 60, f: () => paper(900, 240, 820, 520, `<rect x="408" y="0" width="4" height="520" fill="#8a7a64"/>` + ['CHAPTER IV', 'and then he', 'gave her a', 'tender KISS', 'upon the lips...'].map((s0, i) => `<text x="50" y="${90 + i * 64}" font-family="Georgia,serif" font-style="italic" font-size="36" fill="#3a2e24">${s0}</text>`).join('') + icon('heart', 610, 260, 140, C.red, 6), { rot: 2 }) },
  { at: 4.4, sfx: 'stamp', f: (lt) => `<g transform="translate(1310,520) scale(${pop(lt / .35).toFixed(3)})"><rect x="-220" y="-110" width="440" height="220" rx="16" fill="rgba(20,18,24,.9)"/>${txt(0, 30, '接吻', { size: 130, color: C.red, serif: true })}</g>` + txt(400, 640, '1887年ごろ', { size: 70, color: C.o, serif: true }) + txt(400, 710, '「接吻」が広まる', { size: 40 }) },
], t), { chap: 3, enter: 'zoom', leave: 'left' });
SC[33] = kami((t) => run([
  { at: 0, slide: 60, f: () => paper(260, 220, 1400, 560, `<text x="60" y="90" font-family="Georgia,serif" font-style="italic" font-size="44" fill="#3a2e24">Doeff-Halma Dictionary　1816</text><rect x="60" y="120" width="1280" height="3" fill="#8a7a64"/>`
      + `<text x="90" y="300" font-family="Georgia,serif" font-size="64" fill="#3a2e24">Kus</text>` + txt(520, 310, '接吻', { size: 120, color: C.ink, serif: true, shadow: false, op: clamp((t - 1.2) / .5) })
      + txt(1000, 310, '→　くちすう', { size: 90, color: C.red, serif: true, shadow: false, op: clamp((t - 5.5) / .5) })) },
  { at: 1.2, sfx: 'pop' }, { at: 5.5, sfx: 'chime' },
  { at: 2.5, f: () => txt(CX, 880 - 30, 'オランダ語の辞書に初めて登場', { size: 40, color: C.gold }) },
  { at: 1, f: () => note(1880, 125, '九州大学「〈接吻〉の語史」', 'end') },
].map(e => e.f ? e : { ...e, f: () => '' }), t), { chap: 3, enter: 'right', leave: 'left' });
SC[34] = kami((t) => { const cut = easeOut((t - 4) / 2);
  return run([
    { at: 0, f: () => txt(CX, 170, '戦前の映画検閲', { size: 52, serif: true }) },
    { at: 0.2, slide: 0, f: () => { let s = `<rect x="0" y="380" width="1920" height="300" fill="#16120e"/>`; for (let i = 0; i < 48; i++) s += `<rect x="${i * 40 + 10}" y="394" width="22" height="22" fill="#e8dfcc"/><rect x="${i * 40 + 10}" y="644" width="22" height="22" fill="#e8dfcc"/>`;
      for (let f = 0; f < 6; f++) { const x = 40 + f * 320, mid = f === 2 || f === 3, dy = mid ? cut * 200 : 0, rot = mid ? cut * (f === 2 ? -14 : 12) : 0;
        s += `<g transform="translate(${x + 140},${530 + dy}) rotate(${rot})" opacity="${mid ? 1 - cut : 1}"><rect x="-140" y="-100" width="280" height="200" fill="#a99d88"/>${mid ? couple(0, 30, .38, 4, '#2a2420') : person(0, 60, 40, '#2a2420')}</g>`; } return s; } },
    { at: 3.4, sfx: 'swish', f: () => icon('scissors', 980 - 60 * Math.sin(t * 8) * (t < 6 ? 1 : 0), 300, 140, C.fg, 6) },
    { at: 4.2, sfx: 'tick' }, { at: 4.8, sfx: 'tick' },
    { at: 1.2, f: () => txt(CX, 260, '抱き合う場面・同じ寝床の場面を切除', { size: 38, color: C.dim }) },
    { at: 7.6, sfx: 'stamp', f: (lt) => stamp(CX, 530, 110, '風俗', lt) },
    { at: 1, f: () => note(1880, 125, '国立映画アーカイブ「内務省 切除フィルム」', 'end') },
  ].map(e => e.f ? e : { ...e, f: () => '' }), t); }, { chap: 3, enter: 'right', leave: 'left' });
SC[35] = kami((t) => run([
  { at: 0, slide: 0, f: () => `<rect x="460" y="210" width="1000" height="560" fill="#e9e2d0" filter="url(#sh)"/>` + couple(CX, 520, .8, 20, '#2a2420') },
  { at: 1.0, sfx: 'pop', f: () => icon('heart', CX, 330, 100, C.red, 7) + txt(CX, 840, '西洋：愛の告白', { size: 40, color: C.pink }) },
  { at: 3.4, sfx: 'stamp', f: (lt) => stamp(CX, 500, 150, '風俗', lt) },
  { at: 4.2, f: () => `<rect x="0" y="800" width="1920" height="80" fill="${C.bg2}"/>` + txt(CX, 860, '日本の役所：人前で見せてはいけないもの', { size: 42, color: C.gold }) },
], t), { chap: 3, enter: 'zoom' });

// ===== 第4章 =====
SC[36] = kami((t) => run([...chapterEls('第4章', '命令されたキス', 2.8),
  { at: 2.9, f: () => txt(CX, 190, '1946年　敗戦の翌年', { size: 44, color: C.dim }) },
  { at: 3.0, sfx: 'pop', f: () => person(620, 640, 140, C.navy, 'officer') + txt(620, 860, '占領軍の担当者', { size: 34 }) },
  { at: 3.4, slide: 60, f: () => script(1060, 260, 2, .82, clamp((t - 4.4) / 1.0), clamp((t - 5.6) / .5)) },
  { at: 5.6, sfx: 'stamp' },
].map(e => e.f ? e : { ...e, f: () => '' }), t), { chap: 4, enter: 'zoom' });
// 37 3D 撮影所
SC[37] = S3[37];
SC[38] = kami((t) => { const b = Math.sin(clamp(t / 2.2) * Math.PI) * 30;
  return run([
    { at: 0, slide: 0, f: () => `<g transform="translate(470,640) rotate(${b})">${person(0, 0, 90, '#d8cdb8')}</g><g transform="translate(690,640) rotate(${-b})">${person(0, 0, 90, '#e5b8b8', 'f')}</g>` + txt(580, 860, 'おじぎの国', { size: 44 }) },
    { at: 2.4, sfx: 'swish', f: (lt) => arrow(860, 520, 860 + 200 * easeOut(lt / .7), 520, C.o, 1, 10) },
    { at: 3.0, sfx: 'pop', f: () => couple(1400, 500, .7, 10, '#e9e2d0') + txt(1400, 860, 'キスの国（西洋式）', { size: 44, color: C.o }) },
    { at: 4.0, f: () => txt(CX, 200, '民主化の演出のひとつ', { size: 52, serif: true, color: C.gold }) },
    { at: 1, f: () => note(1880, 125, '占領期の映画政策（TMDB 作品解説ほか）', 'end') },
  ], t); }, { chap: 4, enter: 'right', leave: 'left' });
SC[39] = kami((t) => run([
  { at: 0, f: () => txt(CX, 170, '観客は騒然、映画館は連日満員', { size: 50, serif: true }) },
  { at: 0.2, slide: 0, f: () => { let s = ''; const full = easeOut(t / 3.2); for (let r = 0; r < 4; r++) for (let c = 0; c < 22; c++) { const k = r * 22 + c; if (k / 88 > full) continue; s += person(170 + c * 72 + (r % 2) * 20, 420 + r * 120, 26, r % 2 ? '#8a8494' : '#a7a0b0'); } return s; } },
  { at: 3.9, sfx: 'pop', f: (lt) => `<g transform="translate(${CX},560) scale(${pop(lt / .4).toFixed(3)})"><rect x="-200" y="-230" width="400" height="460" rx="16" fill="#f6f1e6" filter="url(#sh)"/><rect x="-200" y="-230" width="400" height="90" rx="16" fill="#c0392b"/>${txt(0, -168, '5月', { size: 50, shadow: false })}${txt(0, 90, '23', { size: 220, color: C.ink, serif: true, shadow: false })}${txt(0, 190, '♥ キスの日', { size: 40, color: '#c0392b', shadow: false })}</g>` },
], t), { chap: 4, enter: 'right', leave: 'left' });
SC[40] = kami((t) => run([
  { at: 0, f: () => head('人前のキスへの反応', { y: 170 }) },
  { at: 0.2, slide: 0, sfx: 'swish', f: (lt) => timeline(260, 470, 1400, [{ at: .02, label: '1946', sub: 'はたちの青春', c: C.o }, { at: .5, label: '1949', sub: '手塚治虫の漫画', c: C.red }, { at: .98, label: '1950', sub: 'また逢う日まで', c: C.t }], clamp(lt / 7.5)) },
  { at: 3.2, sfx: 'pop', f: (lt) => { let s = ''; for (let i = 0; i < 7; i++) { const a = clamp((lt - i * .15) / .25); if (a <= 0) continue; const x = 960 + Math.cos(i * 2.4) * 200, y = 330 + Math.sin(i * 1.7) * 60; s += `<g transform="translate(${x},${y}) scale(${pop(a)})"><rect x="-56" y="-36" width="112" height="72" rx="20" fill="#fff"/>${txt(0, 18, '抗議！', { size: 30, color: C.red, shadow: false })}</g>`; } return s; } },
  { at: 7.0, sfx: 'chime', f: () => `<g transform="translate(1660,700)"><rect x="-120" y="-90" width="240" height="180" fill="rgba(180,220,240,.25)" stroke="#cfe6f2" stroke-width="6"/>${couple(0, 20, .22, 24, '#e9e2d0')}</g>` + txt(1660, 850, 'ガラス越しのキス', { size: 34, color: C.t }) },
  { at: 1, f: () => note(1880, 125, '百科事典「接吻」', 'end') },
], t), { chap: 4, enter: 'zoom', leave: 'left' });
SC[41] = kami((t) => run([
  { at: 0, f: () => head('日本人が「人前のキス」を見せ始めたのは', { y: 180, size: 50 }) },
  { at: 0.6, f: () => card(300, 300, 1320, 180) + txt(380, 410, '自分たちで選んだから', { size: 56, anchor: 'start', color: C.dim }) },
  { at: 1.8, sfx: 'stamp', f: (lt) => `<g transform="translate(1500,390) scale(${pop(lt / .3)})">${txt(0, 40, '×', { size: 140, color: C.red })}</g>` },
  { at: 4.8, sfx: 'pop', f: () => card(300, 540, 1320, 180, { stroke: C.o }) + txt(380, 650, '占領軍に言われたから', { size: 56, anchor: 'start', color: C.o }) },
  { at: 5.2, sfx: 'stamp', f: (lt) => `<g transform="translate(1500,630) scale(${pop(lt / .3)})"><circle r="56" fill="none" stroke="${C.o}" stroke-width="14"/></g>` },
], t), { chap: 4, enter: 'right', leave: 'left' });
SC[42] = kami((t) => run([
  { at: 0, f: () => head('今の夫婦は、キスしている？', { y: 170 }) },
  { at: 0.4, f: () => person(560, 600, 120, C.t) + person(760, 600, 116, C.pink, 'f') + icon('house', 660, 360, 140, C.dim, 5) + txt(660, 840, '20〜50代の既婚者 200人', { size: 34, color: C.dim }) },
  { at: 3.3, slide: 40, sfx: 'pop', f: (lt) => phone(1180, 230, 380, 640, donut(190, 300, 120, [{ v: 56, c: C.o }, { v: 44 }], easeOut(lt / 1.2), { sw: 50 }) + counter(190, 324, 56, lt, { size: 72, suf: '%', dur: 1.2, color: C.o }) + txt(190, 520, 'キスをする', { size: 36, color: C.ink, shadow: false })) },
  { at: 1, f: () => note(1880, 125, 'リベルタ「デンティス」調査 (2023) N=200', 'end') },
], t), { chap: 4, enter: 'right', leave: 'left' });
SC[43] = kami((t) => run([
  { at: 0, f: () => head('キスをする夫婦のうち', { y: 170 }) },
  { at: 0.3, slide: 0, sfx: 'pop', f: (lt) => hbars(620, 300, 820, [{ label: '週に1回以上', v: 73, txt: '73%' }, { label: '毎日', v: 30, txt: '約30%', c: C.t }, { label: '結婚15年以上でも', v: 46, txt: '46%', c: C.pink }], 100, lt, { stag: 2.6, bh: 90, gap: 70 }) },
  { at: 3.0, sfx: 'pop', f: () => '' }, { at: 5.6, sfx: 'pop', f: () => '' },
  { at: 1, f: () => note(1880, 125, 'リベルタ「デンティス」調査 (2023)', 'end') },
], t), { chap: 4, enter: 'right' });
// 44 3D 家の窓
SC[44] = S3[44];

// ===== エピローグ =====
SC[45] = kami((t) => run([
  { at: 0, sfx: 'pop', f: () => icon('perfume', 480, 480, 220, C.t, 6) + txt(480, 720, '匂いを消す', { size: 44 }) },
  { at: 2.3, sfx: 'pop', f: () => icon('hotel', CX, 480, 220, C.gold, 6) + txt(CX, 720, '家の外のホテル', { size: 44 }) },
  { at: 5.9, sfx: 'pop', f: () => icon('lips', 1440, 480, 220, C.pink, 6) + txt(1440, 720, '人前で見せない', { size: 44 }) },
], t), { chap: 5, enter: 'zoom', leave: 'left' });
SC[46] = kami((t) => { const fall = easeOut((t - 1.0) / 1.0), lid = easeOut((t - 2.4) / .8);
  return run([
    { at: 0, slide: 0, f: () => [['perfume', 700, C.t], ['hotel', CX, C.gold], ['lips', 1220, C.pink]].map(([n, x, c], i) => icon(n, x, 330 + fall * 300, 130, c, 6)).join('')
        + `<rect x="560" y="560" width="800" height="300" rx="10" fill="#6b4a33"/><rect x="560" y="${560 - 40 + 40 * lid}" width="${800}" height="40" rx="8" fill="#8a6244" transform="rotate(${-30 * (1 - lid)} 560 560)"/><rect x="900" y="690" width="120" height="16" rx="6" fill="#c9a43a"/>` },
    { at: 2.4, sfx: 'stamp' },
    { at: 3.0, f: () => txt(CX, 190, '見えない場所に、しまってきた', { size: 56, serif: true, color: C.gold }) },
  ].map(e => e.f ? e : { ...e, f: () => '' }), t); }, { chap: 5, enter: 'right', leave: 'left' });
SC[47] = kami((t) => run([
  { at: 0, slide: 0, f: () => scrollBox(210, 250, 1500, 520, 1, kuchisu(.6 + .4 * Math.sin(t * 2))) },
  { at: 0.4, f: () => txt(CX, 860, '千年前、恋の歌には詠まれなかった', { size: 44, serif: true }) },
  { at: 3.6, sfx: 'chime', f: () => txt(CX, 205, 'それでも、こっそり書き残されていた', { size: 44, color: C.gold }) },
], t), { chap: 5, enter: 'right' });
SC[48] = S3[48];
SC[49] = S3[49];

export const SCENES = SC;
