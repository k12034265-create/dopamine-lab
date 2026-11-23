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

## 人間モデル（2026-11-24 テスト済み、src/Human.tsx・HumanTest.tsx）
- モデル：three.js公式サンプル（Mixamo製、`https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/<名前>.glb`）
  - Xbot（マネキン）：agree / headShake / idle / run / sad_pose / sneak_pose / walk
  - Soldier（兵士）：Idle / Run / Walk
  - Michelle（女性）：SambaDance のみ
- `useModel('X.glb')` で読み込み → `<Human gltf f fps steps pos rotY>`。steps に「どの動きを何フレーム目から」を並べると10フレームでなめらかに切り替わる。
- **ハマりどころ（必ず守る）**
  1. モデルは全部読み込み終わってから `<ThreeCanvas>` を出す（`{a && b && <ThreeCanvas>}`）。先に出すと後から読んだモデルが写らない。
  2. continueRender はモデルが画面に反映された後（useEffect＋requestAnimationFrame）。
  3. カメラは `Cam` 部品で描画前に毎フレーム設定（useEffectだと並列書き出しの最初の1枚がずれる）。
  4. Soldier は後ろ向きのモデル → rotY に π を足す。
- 8秒の書き出しは約1分50秒（人間2体＋影）。

## 追加モデル（2026-11-24 比較済み、src/Gallery.tsx）
- RobotExpressive（three.js公式、CC0）：Dance / Death / Idle / Jump / No / Punch / Running / Sitting / Standing / ThumbsUp / Walking / WalkJump / Wave / Yes ＋ 表情（怒り・驚き・悲しみ）。scale 0.33 で人と同じくらい。
- readyplayer.me（three.js公式サンプル。帽子・口ひげ・スーツの紳士）：動きなし → `RetargetHuman`（src/Retarget.tsx）で Xbot の動きを毎フレーム写す。
  - 写し方は「骨自身の向きで見た回転の変化」：Wt = dRest × sRest⁻¹ × Ws（ワールドの差で写すと腕が背中に回った）。基準は skeleton.pose() の初期姿勢。
  - 骨名は Xbot の `mixamorig` を外すと一致（Mixamo系の人間モデルなら同じ方法で全部使える）。
- kira（ドラコ圧縮）は部屋ごとのシーンで単体では使えない。CesiumMan は小さく簡素。→ 不採用。
- ドラコ圧縮のモデルは `public/draco/` に three の decoder を置いて読む（useModel 対応済み）。
