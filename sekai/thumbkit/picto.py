# ピクトグラム人間（SVG）。普通の体型の人を、関節の角度でポーズ付けして描く。
import math
def _pt(x,y,ang,l):  # ang: 真下=0、前(右)へ正
    a=math.radians(ang); return x+math.sin(a)*l, y+math.cos(a)*l
def person(x,y,h,col,pose=None,face=1,hair=None,skirt=False,extra=''):
    """x,y=足元。face=1右向き/-1左向き（前方向）。pose: 角度(度) lt/ls 左右の太もも/すね, ua/fa 腕"""
    p=dict(lt1=8,ls1=0,lt2=-8,ls2=0,ua1=10,fa1=5,ua2=-10,fa2=-5,lean=0,sit=False)
    if pose: p.update(pose)
    sw=h*0.10; hip=(x,y-h*(0.25 if p['sit'] else 0.47))
    lean=p['lean']*face
    sh=_pt(hip[0],hip[1],180+lean,h*0.30)
    head=_pt(hip[0],hip[1],180+lean,h*0.44)
    out=f'<g stroke="{col}" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-width="{sw:.1f}">'
    def limb(base,a1,a2,l1,l2):
        k=_pt(base[0],base[1],a1*face,l1); e=_pt(k[0],k[1],a2*face,l2)
        return f'<path d="M{base[0]:.1f},{base[1]:.1f} L{k[0]:.1f},{k[1]:.1f} L{e[0]:.1f},{e[1]:.1f}"/>'
    # 奥の手足 → 体 → 手前の手足
    out+=limb(hip,p['lt2'],p['ls2'],h*.24,h*.23)
    out+=limb(sh,p['ua2'],p['fa2'],h*.17,h*.16)
    out+=f'<path d="M{hip[0]:.1f},{hip[1]:.1f} L{sh[0]:.1f},{sh[1]:.1f}" stroke-width="{h*0.17:.1f}"/>'
    if skirt:
        out+=f'</g><path d="M{hip[0]-h*.09:.1f},{hip[1]-h*.06:.1f} L{hip[0]+h*.09:.1f},{hip[1]-h*.06:.1f} L{hip[0]+h*.15:.1f},{hip[1]+h*.16:.1f} L{hip[0]-h*.15:.1f},{hip[1]+h*.16:.1f}Z" fill="{col}"/><g stroke="{col}" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-width="{sw:.1f}">'
    out+=limb(hip,p['lt1'],p['ls1'],h*.24,h*.23)
    out+=limb(sh,p['ua1'],p['fa1'],h*.17,h*.16)
    out+='</g>'
    r=h*0.085
    out+=f'<circle cx="{head[0]:.1f}" cy="{head[1]:.1f}" r="{r:.1f}" fill="{col}"/>'
    if hair=='long':
        out+=f'<path d="M{head[0]-r*1.05:.1f},{head[1]:.1f} Q{head[0]-r*1.3:.1f},{head[1]+r*2.2:.1f} {head[0]-r*0.2*face:.1f},{head[1]+r*2.0:.1f} L{head[0]+r*1.0:.1f},{head[1]+r*1.6:.1f} Q{head[0]+r*1.25:.1f},{head[1]+r*0.5:.1f} {head[0]+r:.1f},{head[1]:.1f}Z" fill="{col}"/>'
    return out+extra
# よく使うポーズ
STAND={}
WALK=dict(lt1=28,ls1=-6,lt2=-24,ls2=-30,ua1=-28,fa1=-40,ua2=30,fa2=10)
CHEER=dict(ua1=160,fa1=170,ua2=-160,fa2=-170,lt1=10,lt2=-10)
SAD=dict(lean=22,ua1=5,fa1=0,ua2=-5,fa2=0)
SIT=dict(sit=True,lt1=90,ls1=0,lt2=88,ls2=2,ua1=50,fa1=95,ua2=45,fa2=90)
REACH=dict(ua1=95,fa1=95,ua2=-15,fa2=-10,lean=8)

def front(x,y,h,col,arms=(18,8,18,8),legs=4,hair=None,skirt=False,lean=0):
    """正面向きの人。arms=(左上腕,左前腕,右上腕,右前腕) の角度（真下=0、外へ正。150で万歳）"""
    sw=h*0.095; hipY=y-h*0.47; shY=y-h*0.78
    o=f'<g transform="rotate({lean} {x} {y})"><g stroke="{col}" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-width="{sw:.1f}">'
    for sx in (-1,1):
        o+=f'<path d="M{x+sx*h*.05:.1f},{hipY:.1f} L{x+sx*h*(.05+math.sin(math.radians(legs))*.47):.1f},{y-sw/2:.1f}"/>'
    o+=f'<path d="M{x:.1f},{hipY:.1f} L{x:.1f},{shY+h*0.02:.1f}" stroke-width="{h*0.2:.1f}"/>'
    for sx,(a1,a2) in ((-1,arms[0:2]),(1,arms[2:4])):
        bx,by=x+sx*h*.11,shY+h*.02
        k=(bx+sx*math.sin(math.radians(a1))*h*.17, by+math.cos(math.radians(a1))*h*.17)
        e=(k[0]+sx*math.sin(math.radians(a2))*h*.16, k[1]+math.cos(math.radians(a2))*h*.16)
        o+=f'<path d="M{bx:.1f},{by:.1f} L{k[0]:.1f},{k[1]:.1f} L{e[0]:.1f},{e[1]:.1f}"/>'
    o+='</g>'
    if skirt: o+=f'<path d="M{x-h*.1:.1f},{hipY-h*.08:.1f} L{x+h*.1:.1f},{hipY-h*.08:.1f} L{x+h*.17:.1f},{hipY+h*.15:.1f} L{x-h*.17:.1f},{hipY+h*.15:.1f}Z" fill="{col}"/>'
    r=h*0.09; hy=y-h*0.93
    if hair=='long': o+=f'<path d="M{x-r*1.1:.1f},{hy:.1f} Q{x-r*1.35:.1f},{hy+r*2.4:.1f} {x-r*.9:.1f},{hy+r*2.3:.1f} L{x+r*.9:.1f},{hy+r*2.3:.1f} Q{x+r*1.35:.1f},{hy+r*2.4:.1f} {x+r*1.1:.1f},{hy:.1f}Z" fill="{col}"/>'
    o+=f'<circle cx="{x:.1f}" cy="{hy:.1f}" r="{r:.1f}" fill="{col}"/>'
    return o+'</g>'
FCHEER=(150,165,150,165)
FWAVE=(18,8,140,170)
FDOWN=(14,6,14,6)
