#!/usr/bin/env bash
# Prepara il video "Il sogno prende stile" per il sito a partire dalla clip scaricata da Higgsfield.
# Crea in media/: sogno.mp4 (il video, in H.264 compatibile con tutti i browser),
# sogno-loop.mp4 (la coda rallentata, avanti e indietro, per restare in loop senza stacchi)
# e sogno.jpg (primo fotogramma, mostrato mentre il video carica).
# uso: bash tools/video.sh <clip.mp4> [secondi_di_coda=1.54] [rallentamento=2.4]
set -euo pipefail
CLIP="$1"; TAIL="${2:-1.54}"; SLOW="${3:-2.4}"; OUT="media"; TMP="$(mktemp -d)"
mkdir -p "$OUT"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CLIP")
START=$(python3 -c "print(max(0, round($DUR - $TAIL, 3)))")
X264="-an -c:v libx264 -pix_fmt yuv420p -profile:v high -movflags +faststart"
ffmpeg -loglevel error -y -i "$CLIP" $X264 -preset slow -crf 23 "$OUT/sogno.mp4"
# coda al contrario: parte esattamente dall'ultimo fotogramma del video
ffmpeg -loglevel error -y -ss "$START" -i "$CLIP" -an -vf "reverse,setpts=PTS-STARTPTS" -c:v libx264 -preset medium -crf 12 -pix_fmt yuv420p "$TMP/rev.mp4"
ffmpeg -loglevel error -y -i "$TMP/rev.mp4" -an -vf "setpts=$SLOW*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" -c:v libx264 -preset medium -crf 12 -pix_fmt yuv420p "$TMP/slow.mp4"
ffmpeg -loglevel error -y -i "$TMP/slow.mp4" -filter_complex "[0:v]split[a][b];[b]reverse[f];[a][f]concat=n=2:v=1[o]" -map "[o]" $X264 -preset slow -crf 23 "$OUT/sogno-loop.mp4"
ffmpeg -loglevel error -y -i "$CLIP" -frames:v 1 -vf scale=1280:-2 -q:v 4 "$OUT/sogno.jpg"
rm -rf "$TMP"
ls -la "$OUT"
echo "In index.html (blocco CONFIGURAZIONE) imposta:"
echo "  video: { src: '$OUT/sogno.mp4', loop: '$OUT/sogno-loop.mp4', poster: '$OUT/sogno.jpg' },"
