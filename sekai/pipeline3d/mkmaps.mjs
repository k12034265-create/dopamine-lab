// 地図データ（world-atlas）からSVGのパスを作って maps.json に保存
import fs from 'fs';
import { feature } from 'topojson-client';
import { geoPath, geoNaturalEarth1, geoMercator } from 'd3-geo';
const t110 = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json'));
const t10 = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-10m.json'));
const world = feature(t110, t110.objects.countries);
const proj = geoNaturalEarth1().fitExtent([[40, 40], [1560, 820]], { type: 'Sphere' });
const P = geoPath(proj);
const countries = world.features.map(f => ({ id: f.id, name: f.properties.name, d: P(f), c: P.centroid(f) })).filter(c => c.d);
const sphere = P({ type: 'Sphere' });
// 日本（10m）
const w10 = feature(t10, t10.objects.countries);
const jp = w10.features.find(f => f.properties.name === 'Japan');
// 遠い離島（南鳥島・沖ノ鳥島など）で本土が小さくならないよう、本土＋沖縄の範囲だけに合わせて、外は切る
const jbox = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[127.5, 30.2], [127.5, 45.7], [146.2, 45.7], [146.2, 30.2], [127.5, 30.2]]] } };
const jfilt = { ...jp, geometry: { type: 'MultiPolygon', coordinates: (jp.geometry.type === 'MultiPolygon' ? jp.geometry.coordinates : [jp.geometry.coordinates]).filter(poly => poly[0].some(([lo, la]) => lo > 127.5 && lo < 146.5 && la > 30 && la < 46)) } };
const jproj = geoMercator().rotate([-137, 0]).fitExtent([[60, 40], [1140, 860]], jbox);
const JP = geoPath(jproj).digits(1);
const jd = JP(jfilt);
const pts = { tokyo: jproj([139.69, 35.68]), kyoto: jproj([135.76, 35.01]), sapporo: jproj([141.35, 43.06]), osaka: jproj([135.5, 34.69]) };
fs.writeFileSync('maps.json', JSON.stringify({ world: { sphere, countries, w: 1600, h: 860 }, japan: { d: jd, w: 1200, h: 900, pts } }));
console.log(countries.length, jd.length);
