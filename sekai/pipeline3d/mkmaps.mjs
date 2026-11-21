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
const pts = { tokyo: jproj([139.69, 35.68]), kyoto: jproj([135.76, 35.01]), sapporo: jproj([141.35, 43.06]), osaka: jproj([135.5, 34.69]), aomori: jproj([140.74, 40.82]), morioka: jproj([141.15, 39.7]), sendai: jproj([140.87, 38.27]), akita: jproj([140.1, 39.72]), niigata: jproj([139.02, 37.9]), kanazawa: jproj([136.66, 36.56]), nagano: jproj([138.18, 36.65]), utsunomiya: jproj([139.88, 36.57]), shizuoka: jproj([138.38, 34.98]), nagoya: jproj([136.91, 35.18]), hiroshima: jproj([132.46, 34.4]), matsue: jproj([133.05, 35.47]), kochi: jproj([133.53, 33.56]), matsuyama: jproj([132.77, 33.84]), fukuoka: jproj([130.42, 33.59]), kumamoto: jproj([130.74, 32.79]), kagoshima: jproj([130.56, 31.6]), fukui: jproj([136.22, 36.06]), okayama: jproj([133.93, 34.66]), tottori: jproj([134.24, 35.5]), hakodate: jproj([140.73, 41.77]), asahikawa: jproj([142.36, 43.77]), yamagata: jproj([140.36, 38.24]), fukushima: jproj([140.47, 37.75]), kofu: jproj([138.57, 35.66]), tokushima: jproj([134.56, 34.07]), miyazaki: jproj([131.42, 31.91]), nagasaki: jproj([129.87, 32.75]), toyama: jproj([137.21, 36.7]), maebashi: jproj([139.06, 36.39]), mito: jproj([140.45, 36.34]) };
fs.writeFileSync('maps.json', JSON.stringify({ world: { sphere, countries, w: 1600, h: 860 }, japan: { d: jd, w: 1200, h: 900, pts } }));
console.log(countries.length, jd.length);
