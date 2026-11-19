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
ws.append(["No","パート","開始","ナレーション（1文ごと）","画面の指示","秒数","出典","読み注意"])
try:
    sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
    from timeline import build; TL=build()
except Exception: TL=None
t=0
for i,(part,nar,scr,ref,yomi) in enumerate(SCENES,1):
    if TL: t=TL[i-1]['start']; sec=round(TL[i-1]['dur'],1)
    else: sec=round(len(nar)/6.7+0.5,1)
    lines="\n".join(x+"。" for x in nar.split("。") if x)
    ws.append([i,part,f"{int(t//60)}:{int(t%60):02d}",lines,scr,sec,ref,yomi])
    key=next((k for k in PART_FILL if part.startswith(k)),"プロローグ")
    for c in ws[ws.max_row]: c.fill=PatternFill("solid",fgColor=PART_FILL[key])
    if not TL: t+=sec
r=ws.max_row+1
ws.cell(r,4,"合計"); ws.cell(r,6,f"=SUM(F2:F{r-1})"); ws.cell(r,7,f'=TEXT(F{r}/86400,"m:ss")')
style(ws,[5,20,7,60,48,7,8,22])
for c in ws[r]: c.font=Font(name=F,size=10,bold=True)
META=getattr(_m,'META',{})
rd=lambda f: open(os.path.join(EP,f)).read().strip() if os.path.exists(os.path.join(EP,f)) else ""
ws2=wb.create_sheet("タイトル・サムネ・概要欄")
ws2.append(["項目","内容","メモ"])
for it in META.get('titles',[]): ws2.append(it)
for it in META.get('thumb',[]): ws2.append(it)
ws2.append(("概要欄",rd("desc.txt"),"タイムスタンプは音声の実際の長さから計算済み"))
ws2.append(("タグ",rd("tags.txt"),""))
style(ws2,[20,90,40])
ws3=wb.create_sheet("参考文献")
ws3.append(["No","文献","この動画で使った内容・限界","リンク"])
for r_ in REFS: ws3.append(list(r_))
style(ws3,[5,60,55,40])
ws4=wb.create_sheet("制作メモ")
ws4.append(["項目","内容"])
notes=META.get('notes',[])
for n in notes: ws4.append(n)
style(ws4,[22,100])
wb.save(os.path.join(EP,"work","台本.xlsx"))
print('ok')
