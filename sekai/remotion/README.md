# Remotion メモ（2026-11-24 導入）

Reactで書いた画面を1コマずつ撮って動画にするツール。v4.0.546。

## セットアップ（新しい作業環境で）
```
cd sekai/remotion && npm i
```
- 専用Chrome（remotion.media）はネットワーク制限で落とせない → Playwright のChromeを使う：
  `--browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`
- 3D（three.js）を使うときは `--gl=swangle` が必須。
- CPUは2コア → `--concurrency=2`。
- 素材（動画・音声・画像）は `public/` に置き、`staticFile('x.mp4')` で読む。

## 書き出し
```
npx remotion render src/index.ts <CompositionID> out/x.mp4 \
  --browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome --gl=swangle --concurrency=2
```
- 実測：1920x1080・30fps・8秒（動画背景＋3D＋文字）で約70秒。→ 13分の本編なら約2時間弱。
- 一部だけ：`--frames=0-89`。静止画1枚：`npx remotion still src/index.ts Test out/a.png --frame=120 ...`

## 使い方の基本
- `src/Root.tsx` の `<Composition id fps width height durationInFrames>` が1本の動画。
- 部品の中で `useCurrentFrame()` が今のコマ番号。動きは全部これから計算する。
  - `interpolate(f, [0,30], [0,1], {extrapolateRight:'clamp'})` … 数値を時間で変化
  - `spring({frame:f, fps})` … ポンと弾む出現
  - `<Sequence from={100}>` … 100コマ目から出す（中では0コマ目から数え直し）
  - `<Series>` … シーンを順番に並べる（台本のシーン→動画の流れに使える）
- `<OffthreadVideo src>` フリー素材動画、`<Audio src>` ナレーション、`<Img>` 写真。
- `@remotion/three` の `<ThreeCanvas>` に react-three-fiber で3Dを書ける。
- 字幕・文字は普通のHTML/CSS。明朝は `"Noto Serif CJK JP"`。数字の強調は黄 #ffd400・オレンジ #ffa000。

## 今の方式との違い（乗り換えの狙い）
- 今：kami.js でシーンごとにブラウザを開いて撮影 → ffmpegでつなぐ／緑幕合成は comp.sh。
- Remotion：シーンも動画素材もナレーションも1つのタイムラインで扱える。緑幕合成が不要（素材動画を直接下に敷ける）。部品（数字カウント、カード、地図、グラフ）を共通コンポーネントにして毎回使い回せる。
- サンプル：`src/Test.tsx`（研究室の動画＋ローポリ卵＋「ライバルは2億5000万匹」カウントアップ＋ナレーション）。
