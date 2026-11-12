#!/usr/bin/env python3
"""Compone un'anteprima statica della scena di gioco usando gli sprite ritagliati.

  python3 tools/make_preview.py [out.png]

Serve a verificare scala, livelli e posizioni (vedi "layout" in manifest.json).
"""
import json
import os
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "pizza-game")
M = json.load(open(os.path.join(ROOT, "manifest.json")))
L = M["scene"]["landscape"]


def img(rel):
    return Image.open(os.path.join(ROOT, rel)).convert("RGBA")


def draw(canvas, sprite, x, y, scale=1.0, anchor=(0.5, 0.5), sy=1.0, flip=False):
    w, h = round(sprite.width * scale), round(sprite.height * scale * sy)
    s = sprite.resize((w, h), Image.LANCZOS)
    if flip:
        s = s.transpose(Image.FLIP_LEFT_RIGHT)
    canvas.alpha_composite(s, (round(x - w * anchor[0]), round(y - h * anchor[1])))


def frame(strip_name, i):
    a = M["animations"][strip_name]
    s = img(a["file"])
    return s.crop((i * a["frameW"], 0, (i + 1) * a["frameW"], a["frameH"]))


def scene(chef_pose="idle", chef_x=None, flip=False, pizza="base_sauce_mozzarella",
          toppings=(), fire_frame=2, ui=True):
    lay = L["layout"]
    c = img(L["background"])
    # fuoco nel forno
    f = lay["fire"]
    draw(c, frame("fire", fire_frame), f["x"], f["y"], f["scale"], anchor=(0.5, 1.0))
    # pizzaiolo dietro al bancone
    ch = lay["chef"]
    draw(c, img(f"chef/{chef_pose}.png"), chef_x if chef_x is not None else ch["x"], ch["baselineY"],
         ch["scale"], anchor=(0.5, 1.0), flip=flip)
    # bancone in primo piano
    c.alpha_composite(img(L["counter"]))
    # ciotole
    for slot in lay["bowls"]:
        draw(c, img(f"ingredients/{slot['sprite']}.png"), slot["x"], slot["y"], slot["scale"])
    # pizza sul piano di marmo
    p = lay["pizza"]
    if pizza:
        draw(c, img(f"pizza/{pizza}.png"), p["x"], p["y"], p["scale"], sy=p["squashY"])
        for name, dx, dy in toppings:
            draw(c, img(f"toppings/{name}.png"), p["x"] + dx, p["y"] + dy, p["toppingScale"], sy=p["squashY"])
    if ui:
        draw(c, img("ui/bar_frame.png"), 960, 62, 0.62)
        draw(c, img("ui/bar_marker.png"), 900, 34, 0.16)
        for i in range(3):
            draw(c, img("ui/star_full.png" if i < 2 else "ui/star_empty.png"), 1662 + i * 84, 66, 0.19)
        draw(c, img("ui/btn_pause.png"), 76, 76, 0.22)
        draw(c, img("ui/timer.png"), 1310, 66, 0.2)
    return c


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "concept", "scene_preview.webp")
    s = scene(chef_pose="sprinkle", toppings=[("basil_leaf", -60, -20), ("basil_leaf", 70, 25)])
    s.convert("RGB").save(out, quality=90)
    print(out, s.size)
