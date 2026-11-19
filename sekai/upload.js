// 世界のネタバレ：YouTube Studio のアップロードダイアログ操作（内蔵ブラウザの javascript_tool で実行）
// 前提: https://studio.youtube.com/channel/UCnitdCImoZ2PO3ZSo4J9Pvg/videos/upload?d=ud&authuser=2 を開いている
const S = ms => new Promise(r => setTimeout(r, ms));
const D = () => document.querySelector('ytcp-uploads-dialog');

// 1) GitHubの raw URL から動画を取得してファイル欄に入れる（ネイティブのファイル選択を使わない）
async function putFile(url, name) {
  const b = await (await fetch(url)).blob();
  const f = new File([b], name, { type: 'video/mp4' });
  const inp = document.querySelector('ytcp-uploads-dialog input[type=file], input[type=file][name=Filedata], input[type=file]');
  const dt = new DataTransfer(); dt.items.add(f); inp.files = dt.files;
  inp.dispatchEvent(new Event('change', { bubbles: true }));
  return f.size;
}
// 2) タイトル・説明（contenteditable なので execCommand で入れる）
function setText(el, v) { el.focus(); document.execCommand('selectAll'); document.execCommand('insertText', false, v); }
async function details(title, desc, tags) {
  const boxes = [...D().querySelectorAll('#textbox')];
  setText(boxes[0], title); setText(boxes[1], desc);
  for (const n of ['VIDEO_MADE_FOR_KIDS_NOT_MFK']) D().querySelector(`tp-yt-paper-radio-button[name="${n}"]`).click();
  D().querySelector('#toggle-button').click(); await S(800);          // 「すべて表示」
  for (const n of ['VIDEO_AGE_RESTRICTION_NONE', 'VIDEO_PAID_PRODUCT_PLACEMENT_NO', 'VIDEO_HAS_ALTERED_CONTENT_NO']) {
    D().querySelector(`tp-yt-paper-radio-button[name="${n}"]`).click(); await S(200);
  }
  const ti = D().querySelector('input[aria-label="タグ"]'); ti.focus();
  document.execCommand('insertText', false, tags.join(',') + ',');
  ti.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
  await S(500);
  return [...D().querySelectorAll('ytcp-chip')].map(c => c.innerText.trim());
}
// 3) 次へ×3 → 公開設定。mode: 'PRIVATE'（KOH確認待ち）/'PUBLIC'
async function visibility(mode) {
  for (let i = 0; i < 3; i++) { D().querySelector('#next-button').click(); await S(1500); }
  D().querySelector(`tp-yt-paper-radio-button[name="${mode}"]`).click(); await S(500);
  D().querySelector('#done-button').click(); await S(4000);
  return [...document.querySelectorAll('a')].map(a => a.href).find(h => /youtu\.be\//.test(h));
}
