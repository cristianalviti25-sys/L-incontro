# Style Your Dream — prompt per Higgsfield

Due video, stessa idea visiva: **la seta è il sogno, lo schermo è il sito**.
Palette del brand: fondo notte `#0a0912`, seta dal rosa (`#ff4f9a`) all'albicocca (`#ffae5c`) con ombre viola (`#8d6bff`).

Regole valide per entrambi:
- I prompt sono in inglese (i modelli rendono meglio). Titoli, logo e call to action **non** vanno nel video: li aggiunge la pagina in codice.
- Niente testo leggibile sullo schermo del video: i modelli lo deformano.
- Prima di generare, Higgsfield mostra il costo in crediti: controllalo lì.
- Se una clip non convince, rigenera cambiando **una cosa alla volta**.

---

## VIDEO A — "Il sogno prende stile" (il video mozzafiato)

Uso: sfondo in loop dell'hero del sito (16:9, muto) e reel/spot (9:16).

**Impostazioni Higgsfield**
| Voce | Valore |
|---|---|
| Modello | Seedance 2.0 (mode `std`) — alternative: FLUX 3 Video, Kling 3.0 Turbo |
| Formato | 16:9 per il sito · 9:16 per i social |
| Durata | 10 s |
| Risoluzione | 1080p |
| Audio | off per il sito, on per i social |

**Prompt (16:9, sito)**
```text
Generate a slow-motion luxury brand film shot. The central subject is a long ribbon of heavy liquid silk satin, and the primary event is the silk wrapping around a floating glass screen that lights up.

A wide ribbon of silk satin, rose pink blending into apricot gold with deep violet shadows in the folds, flows in from the left through a pitch-dark void. It moves like fabric underwater: long soft waves, glossy highlights sliding along the folds. In the right half of the frame floats a frameless, ultra-thin glass display, dark and switched off. The silk spirals once around the display in a wide slow loop, never touching it. As the silk completes the loop, the display fades on and glows with a soft abstract composition in the same rose and apricot colors, with no readable content. The silk slows down and keeps floating around the screen in a gentle, continuous drift.

Camera: starts as a wide shot and performs one very slow push-in toward the display, ending on a medium shot. No cuts. The left 40% of the frame stays dark and empty for the whole shot.
Light: one soft key light from the upper left that makes the satin shine, plus a thin magenta rim light from behind the display. Background stays a solid near-black violet (#0a0912), no floor, no horizon.

Keep the silk color, the display shape and position, and the light direction consistent from start to end. Do not add text, letters, logos, watermarks, people, hands, floors or any extra objects.
```

**Variante 9:16 (reel)** — stesso prompt, sostituendo le due righe di inquadratura con:
```text
Vertical framing. The glass display floats in the center of the frame; the silk flows in from the top and spirals downward around it. Camera: one very slow push-in, no cuts. The top 25% of the frame stays dark and empty.
```

**Dove va nel sito**: esporta in MP4, salvalo come `media/hero.mp4` e in `index.html` (blocco CONFIGURAZIONE) scrivi `heroVideo: 'media/hero.mp4'`.

---

## VIDEO B — "Lo svelamento" (il video a scorrimento)

Sul sito questo video non parte da solo: avanza e torna indietro **seguendo lo scroll**. Per questo deve essere un unico movimento continuo, a camera ferma, senza tagli, su fondo uniforme.

Si fa in tre passi: fotogramma iniziale → fotogramma finale → video tra i due.

### B1 · Fotogramma iniziale (immagine)
Modello immagine: GPT Image 2 · 16:9 · 2K · qualità alta.
```text
Luxury product hero shot, photorealistic. A floating widescreen display in landscape orientation, completely covered by a draped sheet of heavy liquid silk satin. The satin is rose pink blending into apricot gold, with deep violet shadows inside the folds; it falls in long vertical folds and hides the object entirely, so only its rectangular silhouette can be read under the cloth. The object is centered and occupies about half of the frame width, with generous empty space all around. Seamless solid near-black violet studio backdrop (#0a0912), no floor, no horizon, no shadow on the ground, no gradient. One soft key light from the upper left makes the satin shine; a thin magenta rim light outlines the silhouette from behind. Ultra sharp, fine fabric texture, 8k detail. No text, no letters, no logos, no watermark, no people.
```

### B2 · Fotogramma finale (immagine)
Stesso modello, **con il fotogramma B1 caricato come riferimento**, così resta lo stesso oggetto.
```text
Same scene, same camera position, same lighting and the same solid near-black violet backdrop as the reference image. The silk sheet is gone: it has been lifted away and has left the frame. The object is now fully revealed: a frameless, ultra-thin glass display floating in the same centered position and at the same size. The screen is on and shows an elegant dark website layout made only of abstract shapes: on the right a large rounded image block filled with a rose-to-apricot silk gradient, on the left a few pale horizontal bars in place of text and one small pill-shaped button in rose. A soft rose glow spills from the screen onto the dark background. Photorealistic, ultra sharp. No readable text, no letters, no logos, no watermark, no people, no floor.
```

### B3 · Video tra i due fotogrammi
**Impostazioni Higgsfield**
| Voce | Valore |
|---|---|
| Modello | Seedance 2.0 (mode `std`) — alternative con frame iniziale + finale: FLUX 3 Video, MiniMax H3 |
| Start frame | immagine B1 |
| End frame | immagine B2 |
| Formato | 16:9 |
| Durata | 8 s |
| Risoluzione | 1080p |
| Audio | off |

```text
The first frame shows a floating widescreen display completely covered by a draped silk sheet, centered on a solid near-black backdrop. The last frame shows the same display uncovered and glowing.

Begin from the first-frame state. In one continuous slow-motion action, the silk sheet is lifted from its top edge straight upward by an invisible force, slides off the display like an unveiling and exits the top of the frame. As the glass is uncovered from bottom to top, the screen fades on and its rose glow grows on the background. Naturally reach the state of the last frame and hold it for the final moment.

Camera: locked-off, perfectly still, no zoom, no pan, no cuts, one continuous shot.
Light: one soft key light from the upper left and a thin magenta rim light from behind, unchanged for the whole shot.

Keep the display size, position and proportions, the backdrop color and the light direction identical from start to end. Do not add text, letters, logos, people, hands, a floor, or any new object.
```

### Controllo prima di usarla
- lo schermo resta della stessa forma e nella stessa posizione dall'inizio alla fine
- la seta non attraversa lo schermo e non cambia colore
- il fondo resta uniforme (niente pavimento, niente sfumature che si muovono)
- nessun taglio, nessun testo inventato

### Montaggio nel sito
```bash
bash tools/frames.sh percorso/della/clip.mp4
```
Lo script taglia la clip in 150 fotogrammi WebP dentro `frames/hero/` e stampa la riga da incollare nel blocco CONFIGURAZIONE di `index.html`, per esempio:
```js
scroll: { frames: 150, bg: '#0a0912', dir: 'frames/hero' },
```
Finché `frames` è `0`, la pagina usa al posto del video la scena animata in codice (le particelle che diventano sito).

---

## CLIP C (facoltativa) — vista esplosa del sito

Una seconda scena a scorrimento, da mettere più in basso nella pagina. Parte dal fotogramma finale di B.

- **Start frame**: immagine B2.
- **End frame** (GPT Image 2, con B2 come riferimento):
```text
Same scene, same camera, same lighting and backdrop as the reference image. The glass display stays in the same position, but its interface has separated into four thin translucent glass layers floating in front of the screen, evenly spaced along the depth axis like a technical exploded view: the gradient image block, the pale text bars, the pill-shaped button, and a row of three small cards. Each layer keeps its shape and color and casts a soft glow. Photorealistic, ultra sharp. No readable text, no letters, no logos, no people, no floor.
```
- **Video** (stesse impostazioni di B3):
```text
The first frame shows a floating glass display with a flat website layout on screen. The last frame shows the same display with its interface separated into four floating glass layers.

Begin from the first-frame state. In one continuous slow-motion action, the interface elements detach from the screen one after another and glide straight forward, settling into the evenly spaced layers of the last frame.

Camera: locked-off, perfectly still, no zoom, no cuts, one continuous shot. Light unchanged for the whole shot.
Keep the display size and position, the backdrop color and each element's shape and color identical from start to end. Do not add text, letters, logos, people, hands or any new object.
```
