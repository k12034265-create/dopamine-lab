// manualkit/rig.js — 説明書風の人。球の外形（カプセル）で体を作る。身長 約172cm。
// person(v,{pos:[x,z], f:向き(度。0=+x、90=+z、45=カメラ向き), hands:{l,r}, feet:{l,r}, lean, crouch, nod, look, shirt, pants, hair, cap, y})
// hands/feet は体の座標 [右, 上, 前]（cm）か {w:[世界座標]}。省略すると「気をつけ」。
import { PAL, blob, add3, sub3, mul3, dot3, len3, norm3, LW } from './iso.js';
function ik(root, tgt, l1, l2, pole) { let d = sub3(tgt, root), L = len3(d); const mx = l1 + l2 - .5; if (L > mx) { d = mul3(d, mx / L); L = mx; tgt = add3(root, d); } if (L < 1) L = 1;
  const u = mul3(d, 1 / L), a = (l1 * l1 - l2 * l2 + L * L) / (2 * L), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)); let pp = sub3(pole, mul3(u, dot3(pole, u))); pp = norm3(pp); return [add3(add3(root, mul3(u, a)), mul3(pp, h)), tgt]; }
export function person(v, o) { const th = (o.f || 0) * Math.PI / 180, F = [Math.cos(th), 0, Math.sin(th)], R = [Math.sin(th), 0, -Math.cos(th)], base = [o.pos[0], o.y || 0, o.pos[1]];
  const B = (r, u, f) => [base[0] + R[0] * r + F[0] * f, base[1] + u, base[2] + R[2] * r + F[2] * f], W = (q, d) => !q ? B(...d) : q.w ? q.w : B(...q);
  const lean = o.lean || 0, hipY = 87 - (o.crouch || 0), hb = o.hipBack ? -o.hipBack : 0, shY = hipY + 52 - Math.abs(lean) * .18, sc = o.scale || 1;
  const shirt = o.shirt || PAL.white, pants = o.pants || PAL.g1, shoe = o.shoe || PAL.g2, skin = o.skin || PAL.white, hair = o.hair || PAL.g2;
  const hip = { l: B(-9, hipY, hb), r: B(9, hipY, hb) }, sh = { l: B(-17, shY, hb + lean), r: B(17, shY, hb + lean) };
  const tw = o.twist || 0; if (tw) { sh.l = B(-17, shY, hb + lean - tw); sh.r = B(17, shY, hb + lean + tw); }
  const out = { hand: {}, foot: {}, head: null, F, R, B };
  for (const s of ['l', 'r']) { const sg = s === 'l' ? -1 : 1;
    const ank = W(o.feet && o.feet[s], [sg * 10, 0, 0]); const an = [ank[0], ank[1] + 7, ank[2]]; const [kn] = ik(hip[s], an, 41.5, 41.5, add3(F, [0, .15, 0]));
    blob(v, [[an, 4.6], [add3(an, add3(mul3(F, 13), [0, -3, 0])), 4.2], [add3(an, [0, -3, 0]), 4.4]], shoe, { bias: -.5 });
    blob(v, [[kn, 6.2], [an, 4.8]], pants); blob(v, [[hip[s], 8], [kn, 6.4]], pants);
    const hd = o.hands && o.hands[s]; const wr0 = W(hd, [sg * 22, shY - 53 - 90 + 90, 3]); const pole = o.elbow && o.elbow[s] ? add3(add3(mul3(R, o.elbow[s][0]), [0, o.elbow[s][1], 0]), mul3(F, o.elbow[s][2])) : add3(add3(mul3(R, sg * .7), [0, -.5, 0]), mul3(F, -.9));
    const [el, wr] = ik(sh[s], wr0, 29, 27, pole); const hdir = norm3(sub3(wr, el)), hp = add3(wr, mul3(hdir, 5));
    blob(v, [[sh[s], 6], [el, 5]], shirt, { bias: sg * (R[0] + R[2]) > 0 ? .6 : -.6 }); blob(v, [[el, 5], [wr, 4.3]], shirt, { bias: sg * (R[0] + R[2]) > 0 ? .8 : -.8 }); blob(v, [[hp, 5], [add3(wr, mul3(hdir, 1)), 4.2]], skin, { bias: sg * (R[0] + R[2]) > 0 ? 1.2 : -1 });
    out.hand[s] = hp; out.foot[s] = an; }
  blob(v, [[hip.l, 8.4], [hip.r, 8.4], [B(-9, hipY + 6, hb), 8.6], [B(9, hipY + 6, hb), 8.6]], pants, { bias: -.2 });
  const wl = B(-9.5, hipY + 12, hb + lean * .2), wr = B(9.5, hipY + 12, hb + lean * .2);
  blob(v, [[sh.l, 8.2], [sh.r, 8.2], [wl, 8.6], [wr, 8.6], [B(-12, shY - 20, hb + lean * .7), 9], [B(12, shY - 20, hb + lean * .7), 9]], shirt);
  const nk = B(0, shY + 8, hb + lean * 1.1), hc = add3(B(0, shY + 21, hb + lean * 1.25 + (o.nod || 0) * .5), [0, -(o.nod || 0) * .25, 0]);
  blob(v, [[nk, 4.2], [add3(hc, [0, -6, 0]), 4.4]], skin, { bias: .1 });
  let look = F; if (o.look) look = norm3(sub3(o.look, hc)); const hv = add3(mul3(look, -4.6), [0, 5.2 - (o.nod || 0) * .1, 0]);
  const r = 11.2, cap = o.cap;
  v.add(v.depth(hc) + 3 + (o.headBias || 0), (g) => { const c = v.P(hc), R2 = r * v.s * 1.06, h2 = v.P(add3(hc, hv)); g.beginPath(); g.arc(c[0], c[1], R2, 0, 7); g.fillStyle = skin; g.fill();
    g.save(); g.clip(); g.beginPath(); g.arc(h2[0], h2[1], R2 * (cap ? 1.12 : 1.02), 0, 7); g.fillStyle = cap || hair; g.fill(); g.lineWidth = LW; g.strokeStyle = PAL.ink; g.stroke(); g.restore();
    g.beginPath(); g.arc(c[0], c[1], R2, 0, 7); g.lineWidth = LW; g.strokeStyle = PAL.ink; g.stroke(); });
  out.head = hc; out.sh = sh; return out; }
// ---- よく使う姿勢（person に渡す o を返す） ----
export const stand = (pos, f, o = {}) => ({ pos, f, ...o });
export const hips = (pos, f, o = {}) => ({ pos, f, hands: { l: [-17, 98, -2], r: [17, 98, -2] }, elbow: { l: [-1, 0, -.6], r: [1, 0, -.6] }, ...o });
export const scratch = (pos, f, o = {}) => ({ pos, f, hands: { r: [10, 168, 2] }, elbow: { r: [1, .2, .2] }, nod: 4, ...o });
export const hold = (pos, f, h = 105, d = 30, o = {}) => ({ pos, f, hands: { l: [-11, h, d], r: [11, h, d] }, ...o });
export const reach = (pos, f, w, side = 'r', o = {}) => ({ pos, f, hands: { [side]: { w } }, ...o });
export const walk = (pos, f, ph, o = {}) => { const s = Math.sin(ph), c = Math.cos(ph); return { pos, f, feet: { l: [-10, Math.max(0, c) * 7, s * 22], r: [10, Math.max(0, -c) * 7, -s * 22] }, hands: { l: [-22, 90, -s * 18 + 3], r: [22, 90, s * 18 + 3] }, lean: 3, ...o }; };
export const armsUp = (pos, f, o = {}) => ({ pos, f, hands: { l: [-30, 185, 5], r: [30, 185, 5] }, elbow: { l: [-1, 0, 0], r: [1, 0, 0] }, ...o });
export const THIEF = { shirt: '#5E5A55', pants: '#3F3C38', shoe: '#2B2927', cap: '#2B2927' };
