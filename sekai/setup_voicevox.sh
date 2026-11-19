#!/bin/bash
# 新しい作業環境でVOICEVOX(青山龍星)を使えるようにする。/home/claude/vv に展開。
set -e; B=${VV:-/home/claude/vv}; mkdir -p $B/vvms; cd $B
curl -sSLO https://github.com/VOICEVOX/voicevox_core/releases/download/0.17.1/voicevox_core-0.17.1-cp310-abi3-manylinux_2_34_x86_64.whl
curl -sSL https://github.com/VOICEVOX/onnxruntime-builder/releases/download/voicevox_onnxruntime-1.17.3/voicevox_onnxruntime-linux-x64-1.17.3.tgz | tar xz
curl -sSL https://github.com/r9y9/open_jtalk/releases/download/v1.11.1/open_jtalk_dic_utf_8-1.11.tar.gz | tar xz
curl -sSL -o vvms/15.vvm https://github.com/VOICEVOX/voicevox_vvm/releases/download/0.17.0/15.vvm   # 15.vvm = 青山龍星
pip install --break-system-packages -q ./voicevox_core-0.17.1-*.whl playwright numpy openpyxl
python3 -m playwright install chromium >/dev/null 2>&1 || true
echo done
