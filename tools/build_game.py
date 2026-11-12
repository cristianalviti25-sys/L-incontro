#!/usr/bin/env python3
"""Prepara gli asset leggeri del gioco (WebP) a partire dagli sprite master.

  python3 tools/build_game.py

Legge assets/pizza-game/ e scrive game/assets/ con un manifest.json che riporta,
per ogni sprite, le dimensioni "di progetto" (quelle dello sprite master): il gioco
disegna sempre in quelle unita', qualunque sia la risoluzione reale del file.
"""
import json
import os
import shutil

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "assets", "pizza-game")
OUT = os.path.join(HERE, "..", "game", "assets")

# riduzione applicata a ogni gruppo (1 = risoluzione master)
SCALE = {"chef": 0.75, "ingredients": 0.8, "pizza": 0.8, "flavors": 0.6,
         "toppings": 0.6, "fx": 0.75, "ui": 0.6}
QUALITY = 86


def save(img, rel, quality=QUALITY):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, quality=quality, method=6)
    return os.path.getsize(path)


def main():
    m = json.load(open(os.path.join(SRC, "manifest.json")))
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    out = {"sprites": {}, "anims": {}, "backgrounds": {}}
    total = 0

    for group, sprites in m["sprites"].items():
        k = SCALE[group]
        for name, s in sprites.items():
            img = Image.open(os.path.join(SRC, s["file"])).convert("RGBA")
            if k != 1:
                img = img.resize((max(1, round(img.width * k)), max(1, round(img.height * k))), Image.LANCZOS)
            rel = f"{group}/{name}.webp"
            total += save(img, rel)
            e = {"f": rel, "w": s["w"], "h": s["h"]}
            if "anchor" in s:
                e["ax"], e["ay"] = s["anchor"]
            out["sprites"][f"{group}/{name}"] = e

    fire = m["animations"]["fire"]
    img = Image.open(os.path.join(SRC, fire["file"])).convert("RGBA")
    fw, fh = round(fire["frameW"] * 0.6), round(fire["frameH"] * 0.6)
    img = img.resize((fw * fire["frames"], fh), Image.LANCZOS)
    total += save(img, "fx/fire.webp")
    out["anims"]["fire"] = {"f": "fx/fire.webp", "n": fire["frames"], "w": fire["frameW"], "h": fire["frameH"],
                            "fps": fire["fps"]}
    out["anims"]["walk"] = {"frames": [f[:-4] for f in m["animations"]["chef_walk"]["frames"]], "fps": 14}

    for key, scene, size in (("landscape", m["scene"]["landscape"], (1920, 1080)),
                             ("portrait", m["scene"]["portrait"], (1080, 1440))):
        bg = Image.open(os.path.join(SRC, scene["background"])).convert("RGB").resize(size, Image.LANCZOS)
        fg = Image.open(os.path.join(SRC, scene["counter"])).convert("RGBA").resize(size, Image.LANCZOS)
        # il livello del bancone serve solo dalla linea del bordo in giu'
        top = int(scene["counterTopY"] * size[1] / scene["height"]) - 4
        fg = fg.crop((0, top, size[0], size[1]))
        total += save(bg, f"bg/{key}.webp", 84)
        total += save(fg, f"bg/{key}_counter.webp", 84)
        out["backgrounds"][key] = {
            "bg": f"bg/{key}.webp", "counter": f"bg/{key}_counter.webp",
            "w": scene["width"], "h": scene["height"],
            "counterY": round(top * scene["height"] / size[1]),
        }

    fonts = os.path.join(HERE, "fonts")
    if os.path.isdir(fonts):
        os.makedirs(os.path.join(OUT, "fonts"), exist_ok=True)
        for f in os.listdir(fonts):
            shutil.copy(os.path.join(fonts, f), os.path.join(OUT, "fonts", f))
            total += os.path.getsize(os.path.join(fonts, f))

    with open(os.path.join(OUT, "manifest.json"), "w") as f:
        json.dump(out, f, separators=(",", ":"))
    n = sum(len(files) for _, _, files in os.walk(OUT))
    print(f"ok: {n} file, {total // 1024} KB")


if __name__ == "__main__":
    main()
