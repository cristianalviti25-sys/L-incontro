#!/usr/bin/env python3
"""Taglia uno sprite sheet a griglia (sfondo trasparente) in sprite singoli.

Ogni cella viene trovata tramite le componenti connesse dell'alpha, quindi la
griglia non deve essere perfetta: ogni "isola" di pixel viene assegnata alla
cella che contiene il suo baricentro.

Uso:
  slice_sheet.py SHEET.png OUT_DIR COLS ROWS nome1,nome2,... [--pad 8]
                 [--uniform] [--anchor bottom|center] [--black-to-alpha]
"""
import argparse
import os
from collections import deque

import numpy as np
from PIL import Image


def black_to_alpha(img):
    """Sfondo nero -> alpha (alpha = canale massimo), per fiamme/luci additive."""
    a = np.asarray(img.convert("RGB")).astype(np.float32) / 255.0
    alpha = a.max(axis=2)
    alpha = np.clip((alpha - 0.06) / 0.94, 0, 1)
    safe = np.maximum(a.max(axis=2, keepdims=True), 1e-4)
    rgb = np.clip(a / safe, 0, 1)
    out = np.dstack([rgb, alpha[..., None]])
    return Image.fromarray((out * 255).round().astype(np.uint8), "RGBA")


def components(mask, min_area):
    """Componenti connesse (8-conn) su una maschera ridotta. Ritorna i bbox."""
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    boxes = []
    ys, xs = np.nonzero(mask)
    for y0, x0 in zip(ys, xs):
        if seen[y0, x0]:
            continue
        q = deque([(y0, x0)])
        seen[y0, x0] = True
        minx = maxx = x0
        miny = maxy = y0
        area = 0
        sx = sy = 0
        while q:
            y, x = q.popleft()
            area += 1
            sx += x
            sy += y
            minx, maxx = min(minx, x), max(maxx, x)
            miny, maxy = min(miny, y), max(maxy, y)
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
        if area >= min_area:
            boxes.append((minx, miny, maxx + 1, maxy + 1, sx / area, sy / area, area))
    return boxes


def slice_sheet(img, cols, rows, alpha_thr=16, scale=4):
    """Ritorna {(col,row): bbox} in pixel dell'immagine originale."""
    a = np.asarray(img)[..., 3]
    h, w = a.shape
    # maschera ridotta per velocizzare il flood fill
    hh, ww = h // scale, w // scale
    small = a[: hh * scale, : ww * scale].reshape(hh, scale, ww, scale).max(axis=(1, 3)) > alpha_thr
    boxes = components(small, min_area=6)
    cells = {}
    for (x0, y0, x1, y1, cx, cy, area) in boxes:
        c = min(cols - 1, int(cx * scale / (w / cols)))
        r = min(rows - 1, int(cy * scale / (h / rows)))
        bx = (x0 * scale, y0 * scale, x1 * scale, y1 * scale)
        if (c, r) in cells:
            o = cells[(c, r)]
            bx = (min(o[0], bx[0]), min(o[1], bx[1]), max(o[2], bx[2]), max(o[3], bx[3]))
        cells[(c, r)] = bx
    # rifinisce il bbox al pixel
    out = {}
    for key, (x0, y0, x1, y1) in cells.items():
        x0, y0 = max(0, x0 - scale), max(0, y0 - scale)
        x1, y1 = min(w, x1 + scale), min(h, y1 + scale)
        sub = a[y0:y1, x0:x1] > alpha_thr
        ys, xs = np.nonzero(sub)
        out[key] = (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sheet")
    ap.add_argument("out_dir")
    ap.add_argument("cols", type=int)
    ap.add_argument("rows", type=int)
    ap.add_argument("names")
    ap.add_argument("--pad", type=int, default=8)
    ap.add_argument("--uniform", action="store_true",
                    help="tutte le celle con la stessa dimensione (per animazioni)")
    ap.add_argument("--anchor", choices=["bottom", "center"], default="center")
    ap.add_argument("--black-to-alpha", action="store_true")
    ap.add_argument("--max-size", type=int, default=0,
                    help="lato massimo in px dello sprite salvato (0 = originale)")
    args = ap.parse_args()

    img = Image.open(args.sheet)
    img = black_to_alpha(img) if args.black_to_alpha else img.convert("RGBA")
    names = args.names.split(",")
    assert len(names) == args.cols * args.rows, "numero di nomi != celle"
    cells = slice_sheet(img, args.cols, args.rows)
    os.makedirs(args.out_dir, exist_ok=True)

    crops = {}
    for i, name in enumerate(names):
        key = (i % args.cols, i // args.cols)
        if key not in cells:
            print(f"!! cella vuota: {name} {key}")
            continue
        crops[name] = img.crop(cells[key])

    if args.uniform:
        cw = max(c.width for c in crops.values()) + 2 * args.pad
        ch = max(c.height for c in crops.values()) + 2 * args.pad
    for name, crop in crops.items():
        if args.uniform:
            canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
            x = (cw - crop.width) // 2
            y = ch - args.pad - crop.height if args.anchor == "bottom" else (ch - crop.height) // 2
            canvas.paste(crop, (x, y))
        else:
            canvas = Image.new("RGBA", (crop.width + 2 * args.pad, crop.height + 2 * args.pad), (0, 0, 0, 0))
            canvas.paste(crop, (args.pad, args.pad))
        if args.max_size and max(canvas.size) > args.max_size:
            k = args.max_size / max(canvas.size)
            canvas = canvas.resize((round(canvas.width * k), round(canvas.height * k)), Image.LANCZOS)
        if name == "_":
            continue
        path = os.path.join(args.out_dir, name + ".png")
        canvas.save(path, optimize=True)
        print(f"{name:28s} {canvas.width}x{canvas.height}")


if __name__ == "__main__":
    main()
