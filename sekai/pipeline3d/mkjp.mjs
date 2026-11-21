// 県境つき日本地図（jpn-atlas）→ maps.json の japan2。座標は 1200x900 の枠に合わせる。県の中心＝県庁所在地の目安
import fs from 'fs';
import { feature, mesh } from 'topojson-client';
import { geoPath, geoIdentity } from 'd3-geo';
const t = JSON.parse(fs.readFileSync('node_modules/jpn-atlas/japan/japan.json'));
const prefs = feature(t, t.objects.prefectures), land = feature(t, t.objects.country);
const pr = geoIdentity().fitExtent([[60, 40], [1140, 860]], land), P = geoPath(pr).digits(1);
const out = { d: P(land), border: P(mesh(t, t.objects.prefectures, (a, b) => a !== b)), prefs: {} };
for (const f of prefs.features) { const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
  let best = null, ba = -1; for (const pl of polys) { const g = { type: 'Polygon', coordinates: pl }, a = P.area(g); if (a > ba) { ba = a; best = g; } }
  out.prefs[f.id] = { d: P(f), c: P.centroid(best).map(v => +v.toFixed(1)) }; }
const NM = { sapporo: '01', aomori: '02', morioka: '03', sendai: '04', akita: '05', yamagata: '06', fukushima: '07', mito: '08', utsunomiya: '09', maebashi: '10', saitama: '11', chiba: '12', tokyo: '13', yokohama: '14', niigata: '15', toyama: '16', kanazawa: '17', fukui: '18', kofu: '19', nagano: '20', gifu: '21', shizuoka: '22', nagoya: '23', tsu: '24', otsu: '25', kyoto: '26', osaka: '27', kobe: '28', nara: '29', wakayama: '30', tottori: '31', matsue: '32', okayama: '33', hiroshima: '34', yamaguchi: '35', tokushima: '36', takamatsu: '37', matsuyama: '38', kochi: '39', fukuoka: '40', saga: '41', nagasaki: '42', kumamoto: '43', oita: '44', miyazaki: '45', kagoshima: '46', naha: '47' };
out.pts = {}; for (const [k, c] of Object.entries(NM)) out.pts[k] = out.prefs[c].c;
out.pts.asahikawa = [out.pts.sapporo[0] + 25, out.pts.sapporo[1] - 15]; out.pts.hakodate = [out.pts.sapporo[0] - 40, out.pts.sapporo[1] + 70];
const m = JSON.parse(fs.readFileSync('maps.json')); m.japan2 = out; fs.writeFileSync('maps.json', JSON.stringify(m));
console.log(Object.keys(out.prefs).length, out.pts.tokyo, out.pts.sapporo, out.pts.naha, JSON.stringify(m).length);
