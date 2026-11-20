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
const jproj = geoMercator().rotate([-137, 0]).fitExtent([[60, 40], [1140, 860]], jp);
const JP = geoPath(jproj).digits(1);
const jd = JP(jp);
const pts = { tokyo: jproj([139.69, 35.68]), kyoto: jproj([135.76, 35.01]) };
fs.writeFileSync('maps.json', JSON.stringify({ world: { sphere, countries, w: 1600, h: 860 }, japan: { d: jd, w: 1200, h: 900, pts } }));
console.log(countries.length, jd.length);
