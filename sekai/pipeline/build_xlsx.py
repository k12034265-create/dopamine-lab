import sys, os; EP=os.environ['EP']; sys.path.insert(0,EP)
import script as _m; SCENES=_m.SCENES; REFS=_m.REFS
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
F="Arial"; thin=Side(style="thin",color="BFBFBF"); bd=Border(left=thin,right=thin,top=thin,bottom=thin)
HDR=PatternFill("solid",fgColor="2B2F3A")
PART_FILL={"プロローグ":"EAF4F4","第1章":"FFF4EC","第2章":"EEF0F8","第3章":"F2F7EC","第4章":"FBEFEF","エピローグ":"F3EEF8"}
def style(ws,widths):
    for i,w in enumerate(widths): ws.column_dimensions[chr(65+i)].width=w
    for row in ws.iter_rows():
        for c in row:
            c.font=Font(name=F,size=10,bold=(c.row==1),color=("FFFFFF" if c.row==1 else "000000"))
            c.alignment=Alignment(wrap_text=True,vertical="top"); c.border=bd
            if c.row==1: c.fill=HDR
    ws.freeze_panes="A2"
wb=Workbook(); ws=wb.active; ws.title="台本（シーン表）"
ws.append(["No","パート","開始目安","ナレーション（VOICEVOXに貼る）","画面の指示","秒数目安","出典","読み注意"])
t=0; chap_times=[]; prev=None
for i,(part,nar,scr,ref,yomi) in enumerate(SCENES,1):
    if part!=prev:
        if prev is not None: t+=2
        chap_times.append((part,t)); prev=part
    sec=round(len(nar)/7.5+0.6,1)
    lines="\n".join(x+"。" for x in nar.split("。") if x)
    ws.append([i,part,f"{int(t//60)}:{int(t%60):02d}",lines,scr,sec,ref,yomi])
    key=next(k for k in PART_FILL if part.startswith(k))
    for c in ws[ws.max_row]: c.fill=PatternFill("solid",fgColor=PART_FILL[key])
    t+=sec
r=ws.max_row+1
ws.cell(r,4,"合計（目安）"); ws.cell(r,6,f"=SUM(F2:F{r-1})"); ws.cell(r,7,f'=TEXT(F{r}/86400,"m:ss")')
style(ws,[5,20,8,60,48,8,8,22])
for c in ws[r]: c.font=Font(name=F,size=10,bold=True)
ts="\n".join(f"{int(tt//60):02d}:{int(tt%60):02d} - {p}" for p,tt in chap_times)
ws2=wb.create_sheet("タイトル・サムネ・概要欄")
ws2.append(["項目","内容","メモ"])
items=[
("タイトル案①（本命）","なぜ日本人は、体の匂いを消して香りを足すのか【遺伝学×源氏物語】","量産されているTシャツ実験ではなく、空いている「匂わない日本人」を看板にした"),
("タイトル案②","なぜ「香水の匂い」と「好きな人の匂い」は違うのか【免疫学×日本美学】","「AとBは違う」型"),
("タイトル案③","匂わない日本人は、なぜ千年も香りで恋をしてきたのか【遺伝学×源氏物語】","物語寄り"),
("サムネ文字（大）","消された本能","白の太字。「本能」だけオレンジ"),
("サムネ文字（小・任意）","匂わない日本人の恋","上に小さく"),
("サムネの絵","黒背景に、平安装束の後ろ姿のシルエットと、現代の人物のシルエットが背中合わせ。間を香りの線（ティール）がつなぎ、片方は香水瓶の霧でかき消されている","肌の露出・体のアップは使わない（BANと年齢制限の対策）"),
("概要欄",
 "恋人が置いていった服に、こっそり顔をうずめてしまう。ところが、その匂いのもとになる体臭が少ない人の割合は、日本人では世界でも珍しいほど高い。\n\n"
 "1995年、スイスの大学で行われた実験では、女子学生たちが、男子学生が二晩着たTシャツを嗅ぎ比べました。彼女たちが「心地よい」と答えたのは、自分と免疫の遺伝子が違う男性の匂いでした。\n\n"
 "ところが、その後の研究は、話をそう単純にはしてくれませんでした。ピルを飲み始めると好みがずれる。恋人がいるかどうかで好みが逆になる。そして実際の夫婦を調べると、鼻の力はずっと弱かった。\n\n"
 "一方で、女性の涙の匂いは男性の欲望にブレーキをかけ、ナイトクラブのダンサーのチップは生理周期とともに上下していました。\n\n"
 "それでも日本人は、千年前から体ではなく、衣にたきしめた香りで恋をしてきました。汗を止め、体臭を消し、香りを足す。その習慣は、いったい何を隠しているのか。\n"
 "今回は、遺伝学と免疫学、そして源氏物語から、日本人が体の匂いを消して香りを足してきた理由を解剖しました。\n\n"
 "----------------------------\n▼タイムスタンプ\n"+ts+
 "\n----------------------------\n▼参考文献・データ出典\n"+
 "\n\n".join(f"[{n}] {c}\n（{note}）"+("\n"+u if u else "") for n,c,note,u in REFS)+
 "\n----------------------------\n※紹介している研究の多くは対象人数が少なく、後の研究で結果が分かれているものもあります。内容に誤りがあればコメントで教えてください。概要欄で訂正します。\n"
 "※音声：VOICEVOX:青山龍星",
 "タイムスタンプは音声を作ったあとに実際の時間で直す。VOICEVOXのクレジットはキャラごとの規約どおりに書く"),
("タグ","#匂い #体臭 #恋愛心理学 #遺伝学 #免疫学 #源氏物語 #世界のネタバレ",""),
]
for it in items: ws2.append(it)
style(ws2,[20,90,40])
ws3=wb.create_sheet("参考文献")
ws3.append(["No","文献","この動画で使った内容・限界","リンク"])
for r_ in REFS: ws3.append(list(r_))
style(ws3,[5,60,55,40])
ws4=wb.create_sheet("制作メモ")
ws4.append(["項目","内容"])
notes=[
("尺","青山龍星（ノーマル）・話速1.1で生成済み。実際の長さは音声ファイルで確認する"),
("音声の作り方","「ナレーション」列を1シーンずつVOICEVOXに貼り、シーンごとに音声ファイルを書き出す（ファイル名はNo）。読み注意の列の言葉は、VOICEVOXの読み方を直してから書き出す"),
("図解","音声ファイルを渡してもらえれば、各シーンの長さに合わせて図解動画をこちらで作る。配色は黒×オレンジ×ティール"),
("イラスト（第4章の源氏物語）","AIで作る場合も、実在の人物に見えないもの・肌の露出がないものにする。後ろ姿や遠景にする"),
("BAN・年齢制限の対策","性の話は研究の紹介だけにとどめる。サムネと画面に肌の露出や体のアップを入れない。「ラップダンス」などの言葉は使わず「ナイトクラブのダンサー」と表現している"),
("AIの開示","実写と見間違えるようなAI映像は使わない前提。もし使う場合は、アップロード時に「改変または合成されたコンテンツ」にチェックを入れる"),
("BGM","YouTubeオーディオライブラリかDOVA-SYNDROMEの、静かで少し暗めの曲。ナレーションより十分小さい音量で"),
("出典がないシーン","「匂いの信号は記憶の脳に近道で届く」のシーン（匂いの信号が記憶の脳に近道で届く）は教科書レベルの一般的な説明で、個別の文献は付けていない"),
("最終チェック","数字と研究の説明が参考文献シートの内容と一致しているか、公開前にもう一度見る"),
]
for n in notes: ws4.append(n)
style(ws4,[22,100])
wb.save(os.path.join(EP,"work","台本.xlsx"))
print(round(t/60,2))
