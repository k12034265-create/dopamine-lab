#!/bin/bash
# 緑の場面に実写動画を合成： comp.sh シーン番号 動画 開始秒 [速度倍率]
set -e; cd "$(dirname "$0")"; i=$(printf %02d $1); src=$2; [ -f "$src" ] || src=../vid/$2; ss=$3; sp=${4:-1}
n=$(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 clips/c$i.mp4)
[ -f clips/c${i}_orig.mp4 ] || cp clips/c$i.mp4 clips/c${i}_orig.mp4
ffmpeg -y -v error -i clips/c${i}_orig.mp4 -ss $ss -i $src -filter_complex "[1:v]setpts=(PTS-STARTPTS)*$sp,fps=30,scale=1920:1080,tpad=stop_mode=clone:stop_duration=20[bg];[0:v]chromakey=0x00ff00:0.22:0.06[fg];[bg][fg]overlay=eof_action=pass,format=yuv420p" -map 0:a? -frames:v $n -c:v libx264 -crf 18 -preset veryfast -r 30 -c:a copy tmp_comp.mp4 && mv tmp_comp.mp4 clips/c$i.mp4
echo "c$i frames $n -> $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 clips/c$i.mp4)"
