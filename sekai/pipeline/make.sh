#!/bin/bash
# 使い方: EP=/path/to/episodes/NN_xxx bash make.sh [tts|render|mux|all]
set -e
: "${EP:?EP=<episode dir> を指定}"
cd "$(dirname "$0")"; W="$EP/work"; mkdir -p "$W"
step=${1:-all}
if [[ $step == tts || $step == all ]]; then python3 tts.py; fi
if [[ $step == render || $step == all ]]; then
  N=$(python3 -c "from timeline import build;print(len(build()))")
  # 2並列でレンダリング
  python3 render.py "$(seq -s, 0 2 $((N-1)))" > "$W/log_a.txt" 2>&1 &
  python3 render.py "$(seq -s, 1 2 $((N-1)))" > "$W/log_b.txt" 2>&1 &
  wait
fi
if [[ $step == mux || $step == all ]]; then
  N=$(python3 -c "from timeline import build;print(len(build()))")
  : > "$W/concat.txt"; for i in $(seq 0 $((N-1))); do printf "file 'clips/c%02d.mp4'\n" $i >> "$W/concat.txt"; done
  (cd "$W" && ffmpeg -loglevel error -y -f concat -safe 0 -i concat.txt -c copy video_only.mp4)
  python3 build_audio.py
  ffmpeg -loglevel error -y -i "$W/video_only.mp4" -i "$W/final_audio.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k \
    -af loudnorm=I=-15:TP=-1.5:LRA=11 -shortest "$W/final.mp4"
  python3 timeline.py
fi
