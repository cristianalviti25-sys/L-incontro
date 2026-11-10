#!/usr/bin/env bash
# Taglia il video a scorrimento in fotogrammi WebP per lo scrub di index.html.
# uso: bash tools/frames.sh <clip.mp4> [cartella_uscita=frames/hero] [num_frame=150] [larghezza=1280] [qualita=78]
set -euo pipefail
CLIP="$1"; OUT="${2:-frames/hero}"; N="${3:-150}"; W="${4:-1280}"; Q="${5:-78}"
mkdir -p "$OUT"
rm -f "$OUT"/f_*.webp
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CLIP")
FPS=$(python3 -c "print(round($N/$DUR, 4))")
ffmpeg -loglevel error -y -i "$CLIP" -vf "fps=$FPS,scale=$W:-2:flags=lanczos" \
  -c:v libwebp -quality "$Q" -compression_level 6 "$OUT/f_%04d.webp"
COUNT=$(ls "$OUT" | grep -c '^f_.*\.webp$')
SIZE=$(du -sh "$OUT" | cut -f1)
# colore di sfondo: media dei 4 angoli del primo frame (serve per fondere canvas e pagina)
BG=$(python3 - "$OUT/f_0001.webp" <<'PY'
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB"); w, h = im.size
pts = [im.getpixel((x, y)) for x, y in [(4,4),(w-5,4),(4,h-5),(w-5,h-5)]]
print("#%02x%02x%02x" % tuple(sum(p[i] for p in pts)//4 for i in range(3)))
PY
)
echo "frame=$COUNT dimensione=$SIZE sfondo=$BG"
echo "In index.html (blocco CONFIGURAZIONE) imposta:"
echo "  scroll: { frames: $COUNT, bg: '$BG', dir: '$OUT' },"
