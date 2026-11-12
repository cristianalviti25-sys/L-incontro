#!/usr/bin/env python3
"""Crea la pagina dimostrativa del gioco con lo script incluso.

  python3 tools/build_game_page.py OUT.html [--full]

Senza --full produce il frammento da pubblicare come Artifact (accanto alla cartella assets/);
con --full produce una pagina HTML completa, utile per provarla in locale dentro game/.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "game_page.src.html"), encoding="utf-8").read()
js = open(os.path.join(HERE, "..", "game", "pizza-game.js"), encoding="utf-8").read()
js = js.replace("</script", "<\\/script")  # non deve chiudere il tag che lo contiene
page = src.replace("/*GAME_JS*/", js)
if "--full" in sys.argv:
    page = ('<!doctype html><html lang="it"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<style>body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>'
            '</head><body>' + page + '</body></html>')
out = [a for a in sys.argv[1:] if not a.startswith("--")][0]
open(out, "w", encoding="utf-8").write(page)
print(out, len(page) // 1024, "KB")
