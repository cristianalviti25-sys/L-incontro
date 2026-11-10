#!/usr/bin/env bash
# Taglia la clip di un settore in fotogrammi WebP per lo showroom a scorrimento di index.html.
# uso: bash tools/frames.sh <clip.mp4> <nome_scena> [passo=2] [larghezza=1280] [qualita=78]
#   nome_scena  una delle voci di window.SYD.scenes (watch, burger, drink, beauty, tech, shoe, building)
#   passo       tiene un fotogramma ogni N (2 = metà dei fotogrammi: la pagina sfuma tra uno e l'altro)
set -euo pipefail
CLIP="$1"; NAME="$2"; STEP="${3:-2}"; W="${4:-1280}"; Q="${5:-78}"; OUT="frames/$NAME"
mkdir -p "$OUT"; rm -f "$OUT"/f_*.webp
ffmpeg -loglevel error -y -i "$CLIP" -vf "select='not(mod(n\,$STEP))',scale=$W:-2:flags=lanczos" -vsync 0 \
  -c:v libwebp -quality "$Q" -compression_level 6 "$OUT/f_%04d.webp"
COUNT=$(ls "$OUT" | grep -c '^f_.*\.webp$'); SIZE=$(du -sh "$OUT" | cut -f1)
echo "$NAME: fotogrammi=$COUNT dimensione=$SIZE"
echo "In index.html (blocco CONFIGURAZIONE) controlla che la scena abbia:  $NAME: { frames: $COUNT, ... }"
