import os, sys
EP=os.environ.get('EP') or sys.exit('EP=<episode dir> を指定して')
EP=os.path.abspath(EP); W=os.path.join(EP,'work'); os.makedirs(W,exist_ok=True)
PIPE=os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0,EP)
