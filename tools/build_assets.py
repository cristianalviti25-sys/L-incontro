#!/usr/bin/env python3
"""Costruisce gli asset pronti per il gioco a partire dai fogli generati con Higgsfield.

  python3 tools/build_assets.py

Legge  assets/pizza-game/source/*  e scrive sprite singoli, strip di animazione,
livelli di sfondo e manifest.json in assets/pizza-game/.
"""
import json
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from slice_sheet import slice_sheet  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "pizza-game")
SRC = os.path.join(ROOT, "source")
DESIGN_W, DESIGN_H = 1920, 1080  # risoluzione di progetto della scena orizzontale

LANDSCAPE_LAYOUT = {
    # fuoco: ancora in basso al centro, dentro la bocca del forno
    "fire": {"x": 308, "y": 494, "scale": 0.42},
    "ovenMouth": {"x": 190, "y": 300, "w": 330, "h": 240},
    # pizza in cottura sul piano del forno (davanti ai ceppi)
    "ovenPizza": {"x": 372, "y": 516, "scale": 0.30, "squashY": 0.7},
    # pizzaiolo: ancora ai piedi, nascosti dal bancone
    "chef": {"x": 960, "baselineY": 930, "scale": 1.08, "minX": 620, "maxX": 1560,
             # davanti al forno il pizzaiolo sale verso il fondo: gambe visibili, pala all'altezza della bocca
             "oven": {"x": 712, "baselineY": 772, "scale": 1.0}},
    # centro della pala rispetto all'ancora (piedi), in px dello sprite; x si inverte se specchiato
    "peelBlade": {"peel_carry": [205, -217], "peel_push": [300, -215]},
    # pizza sul piano di marmo
    "pizza": {"x": 966, "y": 893, "scale": 0.68, "squashY": 0.74, "toppingScale": 0.30},
    "bowls": [
        {"sprite": "bowl_sauce", "x": 130, "y": 896, "scale": 0.46},
        {"sprite": "bowl_mozzarella", "x": 340, "y": 905, "scale": 0.46},
        {"sprite": "bowl_basil", "x": 548, "y": 905, "scale": 0.46},
        {"sprite": "bowl_mushrooms", "x": 1372, "y": 905, "scale": 0.46},
        {"sprite": "bowl_salami", "x": 1580, "y": 905, "scale": 0.46},
        {"sprite": "bowl_olives", "x": 1790, "y": 905, "scale": 0.46},
    ],
}

manifest = {
    "design": {"width": DESIGN_W, "height": DESIGN_H},
    "sprites": {},
    "animations": {},
    "scene": {},
}


def out_path(*parts):
    p = os.path.join(ROOT, *parts)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    return p


def register(group, name, rel, img, **extra):
    manifest["sprites"].setdefault(group, {})[name] = {
        "file": rel, "w": img.width, "h": img.height, **extra}


def load(name):
    return Image.open(os.path.join(SRC, name))


def pad(img, p):
    c = Image.new("RGBA", (img.width + 2 * p, img.height + 2 * p), (0, 0, 0, 0))
    c.paste(img, (p, p))
    return c


def fit(img, max_side):
    if max_side and max(img.size) > max_side:
        k = max_side / max(img.size)
        img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
    return img


def cut(sheet, cols, rows, names):
    """Ritorna {nome: crop RGBA} tagliando il foglio a griglia."""
    img = sheet.convert("RGBA")
    cells = slice_sheet(img, cols, rows)
    out = {}
    for i, name in enumerate(names):
        key = (i % cols, i // cols)
        if key not in cells:
            raise SystemExit(f"cella vuota per {name} {key}")
        out[name] = img.crop(cells[key])
    return out


# ---------------------------------------------------------------- sprite sheet semplici
def simple_sheet(src, group, cols, rows, names, max_side=0, padding=6):
    for name, crop in cut(load(src), cols, rows, names).items():
        img = fit(pad(crop, padding), max_side)
        rel = f"{group}/{name}.png"
        img.save(out_path(rel), optimize=True)
        register(group, name, rel, img)


# ---------------------------------------------------------------- pizzaiolo
def hat_metrics(crop):
    """Larghezza e centro X del cappello (fascia superiore della figura)."""
    a = np.asarray(crop)[..., 3] > 16
    band = a[: max(4, int(a.shape[0] * 0.15))]
    xs = np.nonzero(band.any(axis=0))[0]
    return xs.max() - xs.min() + 1, (xs.max() + xs.min()) / 2


def feet_center(crop):
    a = np.asarray(crop)[..., 3] > 16
    band = a[int(a.shape[0] * 0.93):]
    xs = np.nonzero(band.any(axis=0))[0]
    return (xs.max() + xs.min()) / 2


def chef_sheet(src, cols, rows, names, refs, align="feet"):
    """Ritaglia un foglio del pizzaiolo conservando la linea di terra di ogni riga.

    refs: pose in piedi e dritte, usate per portare ogni riga alla stessa statura.
    """
    img = load(src).convert("RGBA")
    cells = slice_sheet(img, cols, rows)
    out = []
    for r in range(rows):
        baseline = max(cells[(c, r)][3] for c in range(cols))
        for c in range(cols):
            box = cells[(c, r)]
            crop = img.crop(box)
            name = names[r * cols + c]
            out.append({
                "name": name, "crop": crop, "row": r,
                "ax": hat_metrics(crop)[1] if align == "hat" else feet_center(crop),
                "lift": baseline - box[3],
                "stature": (box[3] - box[1]) + (baseline - box[3]) if name in refs else None})
    return out


def build_chef(sheets):
    groups = [chef_sheet(*s) for s in sheets]
    # statura di riferimento: idle/blink del primo foglio
    target = float(np.median([s["stature"] for s in groups[0] if s["row"] == 0 and s["stature"]]))
    sprites = []
    for g in groups:
        sheet_k = target / float(np.median([s["stature"] for s in g if s["stature"]]))
        for row in sorted({s["row"] for s in g}):
            ref = [s["stature"] for s in g if s["row"] == row and s["stature"]]
            k = target / float(np.median(ref)) if ref else sheet_k  # stessa statura in ogni riga
            for s in (x for x in g if x["row"] == row):
                c = s["crop"]
                if abs(k - 1) > 0.004:
                    c = c.resize((round(c.width * k), round(c.height * k)), Image.LANCZOS)
                sprites.append({"name": s["name"], "img": c, "ax": s["ax"] * k, "lift": s["lift"] * k})
    p = 8
    left = max(s["ax"] for s in sprites)
    right = max(s["img"].width - s["ax"] for s in sprites)
    cw = int(round(left + right)) + 2 * p
    ch = int(round(max(s["img"].height + s["lift"] for s in sprites))) + 2 * p
    ax = int(round(left)) + p
    for s in sprites:
        canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
        canvas.paste(s["img"], (int(round(ax - s["ax"])), int(round(ch - p - s["lift"] - s["img"].height))))
        rel = f"chef/{s['name']}.png"
        canvas.save(out_path(rel), optimize=True)
        register("chef", s["name"], rel, canvas, anchor=[ax, ch - p])
    manifest["animations"]["chef_walk"] = {
        "frames": [f"chef/walk_{i}.png" for i in range(1, 9)],
        "fps": 12, "loop": True, "note": "cammina verso sinistra; specchiare per andare a destra"}
    manifest["animations"]["chef_idle"] = {
        "frames": ["chef/idle.png", "chef/blink.png"], "fps": 0,
        "note": "idle + battito di ciglia occasionale (~120 ms)"}


# ---------------------------------------------------------------- pizza
def build_pizza():
    names = ["dough_ball", "base_raw", "base_sauce", "base_sauce_mozzarella",
             "cooked", "overcooked", "burnt", "margherita", "peel"]
    crops = cut(load("pizza_states.png"), 3, 3, names)
    states = names[1:8]
    target_w = 560
    scaled = {}
    for n in states:
        c = crops[n]
        k = target_w / c.width
        scaled[n] = c.resize((target_w, round(c.height * k)), Image.LANCZOS)
    p = 8
    ch = max(s.height for s in scaled.values()) + 2 * p
    cw = target_w + 2 * p
    for n, s in scaled.items():
        canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
        canvas.paste(s, (p, (ch - s.height) // 2))
        rel = f"pizza/{n}.png"
        canvas.save(out_path(rel), optimize=True)
        register("pizza", n, rel, canvas, anchor=[cw // 2, ch // 2])
    k = target_w / np.mean([crops[n].width for n in states])
    for n in ("dough_ball", "peel"):
        c = crops[n]
        img = pad(c.resize((round(c.width * k), round(c.height * k)), Image.LANCZOS), p)
        rel = f"pizza/{n}.png"
        img.save(out_path(rel), optimize=True)
        register("pizza", n, rel, img)


# ---------------------------------------------------------------- fuoco
def key_black(img, lo=10, hi=44):
    """Sfondo nero -> trasparente, mantenendo i contorni scuri della fiamma."""
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    mx = a.max(axis=2)
    alpha = np.clip((mx - lo) / (hi - lo), 0, 1)
    rgb = np.where(alpha[..., None] > 0, np.clip(a / np.maximum(alpha[..., None], 1e-3), 0, 255), 0)
    return Image.fromarray(np.dstack([rgb, alpha * 255]).round().astype(np.uint8), "RGBA")


def strip(frames, name, fps, anchor_bottom=True, max_h=0):
    """Frame su celle uniformi (bbox unione) e strip orizzontale."""
    boxes = [f.getbbox() for f in frames]
    x0 = min(b[0] for b in boxes); y0 = min(b[1] for b in boxes)
    x1 = max(b[2] for b in boxes); y1 = max(b[3] for b in boxes)
    cells = [f.crop((x0, y0, x1, y1)) for f in frames]
    if max_h and cells[0].height > max_h:
        k = max_h / cells[0].height
        cells = [c.resize((round(c.width * k), max_h), Image.LANCZOS) for c in cells]
    cw, ch = cells[0].size
    sheet = Image.new("RGBA", (cw * len(cells), ch), (0, 0, 0, 0))
    for i, c in enumerate(cells):
        sheet.paste(c, (i * cw, 0))
    rel = f"fx/{name}_strip.png"
    sheet.save(out_path(rel), optimize=True)
    manifest["animations"][name] = {
        "file": rel, "frames": len(cells), "frameW": cw, "frameH": ch,
        "fps": fps, "loop": True, "anchor": [cw // 2, ch]}
    return cells


def build_fire():
    # foglio HD 4x2 su nero: ogni fiamma allineata alla base nella propria cella
    img = key_black(load("fire_sheet.png"))
    cells = slice_sheet(img, 4, 2)
    crops = [img.crop(cells[(i % 4, i // 4)]) for i in range(8)]
    w = max(c.width for c in crops); h = max(c.height for c in crops)
    frames = []
    for c in crops:
        f = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        f.paste(c, ((w - c.width) // 2, h - c.height))
        frames.append(f)
    strip(frames, "fire", fps=10)
    # GIF nativa 12 frame (alternativa piu' fluida, piu' piccola)
    gif = load("fire_loop.gif")
    gframes = []
    for i in range(gif.n_frames):
        gif.seek(i)
        gframes.append(key_black(gif.convert("RGB")))
    strip(gframes, "fire_alt", fps=12)


# ---------------------------------------------------------------- sfondi
def counter_layer(rgb, y_scan, corner_px):
    """Livello del bancone (primo piano): trasparente sopra il bordo posteriore."""
    a = np.asarray(rgb).astype(int)
    h, w = a.shape[:2]
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    wood = (r > 205) & (g > 120) & (g < 205) & (b < 125)
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    edge = np.full(w, h, int)
    for x in range(w):
        cs = np.concatenate([[0], np.cumsum(wood[:, x])])
        for y in range(y_scan, h - 30):
            if cs[y + 24] - cs[y] >= 20:
                # risale fino in cima al contorno scuro
                while y > 0 and (lum[y - 1, x] < 120 or wood[y - 1, x]):
                    y -= 1
                edge[x] = y
                break
    mid = int(np.median(edge[corner_px:w - corner_px]))
    edge[corner_px:w - corner_px] = mid
    edge = np.maximum(edge, mid)  # gli angoli smussati scendono soltanto
    alpha = (np.arange(h)[:, None] >= edge[None, :]).astype(np.uint8) * 255
    return Image.fromarray(np.dstack([np.asarray(rgb), alpha]), "RGBA"), mid


def build_backgrounds():
    # orizzontale 16:9
    src = load("bg_kitchen.png").convert("RGB")
    w, h = src.size
    th = round(w * 9 / 16)
    top = (h - th) // 2
    src = src.crop((0, top, w, top + th))
    layer, edge = counter_layer(src, y_scan=int(th * 0.68), corner_px=int(w * 0.06))
    k = DESIGN_W / w
    bg = src.resize((DESIGN_W, DESIGN_H), Image.LANCZOS)
    fg = layer.resize((DESIGN_W, DESIGN_H), Image.LANCZOS)
    bg.save(out_path("backgrounds/kitchen.webp"), quality=92, method=6)
    fg.save(out_path("backgrounds/kitchen_counter.webp"), quality=92, method=6)
    counter_y = round(edge * k)
    manifest["scene"]["landscape"] = {
        "background": "backgrounds/kitchen.webp",
        "counter": "backgrounds/kitchen_counter.webp",
        "width": DESIGN_W, "height": DESIGN_H,
        "counterTopY": counter_y,
        # posizioni consigliate (px nella scena 1920x1080), verificate con tools/make_preview.py
        "layout": LANDSCAPE_LAYOUT,
    }
    # verticale 3:4
    src = load("bg_kitchen_portrait.png").convert("RGB")
    w, h = src.size
    th = round(w * 4 / 3)
    top = (h - th) // 2
    src = src.crop((0, top, w, top + th))
    layer, edge = counter_layer(src, y_scan=int(th * 0.66), corner_px=int(w * 0.06))
    pw, ph = 1440, 1920
    src.resize((pw, ph), Image.LANCZOS).save(out_path("backgrounds/kitchen_portrait.webp"), quality=92, method=6)
    layer.resize((pw, ph), Image.LANCZOS).save(out_path("backgrounds/kitchen_portrait_counter.webp"), quality=92, method=6)
    manifest["scene"]["portrait"] = {
        "background": "backgrounds/kitchen_portrait.webp",
        "counter": "backgrounds/kitchen_portrait_counter.webp",
        "width": pw, "height": ph,
        "counterTopY": round(edge * pw / w),
    }
    # concept / copertina
    key = load("keyart.png").convert("RGB")
    key.resize((1920, round(1920 * key.height / key.width)), Image.LANCZOS).save(
        out_path("concept/keyart.webp"), quality=92, method=6)


def main():
    build_backgrounds()
    build_chef([
        ("chef_core.png", 4, 3, [
            "idle", "blink", "walk_a", "walk_b",
            "knead", "sprinkle", "arms_up", "place",
            "peel_carry", "peel_push", "wait_worried", "shocked"],
         {"idle", "blink", "sprinkle", "place", "wait_worried", "shocked"}),
        ("chef_emotes.png", 3, 3, [
            "celebrate", "proud_pizza", "thumbs_up",
            "sad", "burnt_pizza", "wave",
            "point_left", "watch_oven", "arms_crossed"],
         {"thumbs_up", "burnt_pizza", "wave", "point_left", "arms_crossed"}),
        ("chef_walk.png", 4, 2, [f"walk_{i}" for i in range(1, 9)],
         {f"walk_{i}" for i in range(1, 9)}, "hat"),
    ])
    simple_sheet("ingredient_bowls.png", "ingredients", 3, 3, [
        "dough_tray", "bowl_sauce", "bowl_mozzarella",
        "bowl_basil", "bowl_mushrooms", "bowl_salami",
        "bowl_olives", "bowl_ham", "bowl_peppers"], max_side=420)
    build_pizza()
    simple_sheet("toppings.png", "toppings", 4, 3, [
        "basil_leaf", "basil_leaves", "mushroom_a", "mushroom_b",
        "salami", "salami_crisp", "olive", "ham",
        "pepper_red", "pepper_yellow", "mozzarella_raw", "mozzarella_melted"])
    simple_sheet("fx.png", "fx", 4, 2, [
        "smoke_puff", "smoke_burnt", "steam", "flour_puff",
        "sparkle_big", "sparkles", "heart", "sweat_drop"])
    simple_sheet("ui.png", "ui", 4, 3, [
        "panel_wood", "ticket_paper", "btn_play", "btn_replay",
        "btn_pause", "btn_sound", "star_full", "star_empty",
        "bar_frame", "bar_marker", "timer", "hand_pointer"], max_side=520)
    build_fire()
    with open(out_path("manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    n = sum(len(v) for v in manifest["sprites"].values())
    print(f"ok: {n} sprite, {len(manifest['animations'])} animazioni")


if __name__ == "__main__":
    main()
