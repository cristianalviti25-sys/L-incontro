# Style Your Dream — prompt per Higgsfield

Ogni settore dello showroom è un video a scorrimento: il prodotto intero che si apre, esplode nei componenti o si trasforma. Ogni video nasce da tre generazioni:

1. **immagine di partenza** (prodotto intero su fondo nero)
2. **immagine di arrivo** (vista esplosa o trasformazione), generata **con la prima come riferimento** così resta lo stesso oggetto
3. **video** tra le due immagini

## Impostazioni usate

| Passo | Modello | Impostazioni | Costo rilevato |
|---|---|---|---|
| Immagini | GPT Image 2.6 | 16:9 · 2K · qualità `high` | circa 2,75 crediti l'una |
| Video | Seedance 2.5, mode `omni_reference` | start frame + end frame · 16:9 · 5 s · 720p · audio off | 35 crediti l'uno |

Sette settori: 14 immagini + 7 video = 283,5 crediti. Higgsfield accetta sei video Seedance alla volta: il settimo va lanciato quando se ne libera uno.

## Regole che hanno funzionato

- Prompt in inglese, nell'ordine: tipo di scatto, soggetto con materiali precisi, composizione, sfondo, luce, finitura.
- Fondo **nero pieno e uniforme**: la pagina è nera, quindi il bordo del video sparisce.
- Prodotto **piccolo nell'immagine di partenza** (circa un terzo dell'altezza), così la vista esplosa ci sta tutta.
- Nel video **una sola azione continua, camera ferma, nessun taglio**: con lo scroll all'indietro i tagli si vedono.
- Nessun testo, numero o logo: i modelli li deformano. Le etichette sui componenti le aggiunge la pagina.

### Coda comune delle immagini
Va in fondo a ogni prompt immagine, dopo la frase sulla luce:
```text
Seamless solid pure black studio backdrop, perfectly uniform from edge to edge, no floor, no horizon, no ground shadow, no reflection, no gradient, no vignette, no haze. Photorealistic, ultra sharp focus across the whole subject, extreme material detail. No text, no letters, no numbers, no logos, no watermark, no people, no hands.
```

### Regia comune dei video
Va in fondo a ogni prompt video, dopo la descrizione dell'azione:
```text
Reach the exact state of the last frame and hold it still for the last moment.

Camera: locked-off, perfectly still, no zoom, no pan, no cuts, one continuous shot. Light unchanged for the whole shot. The background stays pure black.
Keep every component's shape, material and color identical from start to end; no part appears from nowhere, deforms or passes through another. Do not add text, numbers, logos, people, hands or any new object.
```

---

## 1 · Orologi (`watch`)

**Partenza**
```text
Luxury product hero shot, photorealistic. A mechanical wristwatch floating in mid-air, lying horizontally with the dial facing up, seen from a 35-degree elevated three-quarter angle. Polished and brushed stainless steel case with a fluted crown, domed sapphire crystal, deep blue sunburst dial with plain polished baton hour markers, slim sword-shaped hands and one small sub-dial, no numerals and no wording anywhere on the dial. Black alligator leather strap with a steel pin buckle, the two strap halves curving gently downward. The watch is centered and small in the frame: it occupies about one third of the frame height, with generous empty space above and below. One soft key light from the upper left, a crisp cool rim light from behind that outlines the steel edges.
```
**Arrivo** (riferimento: partenza)
```text
Technical exploded view of the exact same wristwatch as in the reference image: same camera angle, same lighting, same pure black backdrop. The watch head is disassembled into its components, which float in a clean vertical stack along one vertical axis, evenly spaced and perfectly sharp. From top to bottom: the domed sapphire crystal, the polished steel bezel ring, the three hands, the blue sunburst dial with its baton markers, the mechanical movement in gold-toned brass with visible gears, bridges, ruby jewels and balance wheel, the steel case middle with its fluted crown, and the steel case back. The two halves of the black alligator strap have moved apart and float to the left and to the right of the stack, at the height of the case. The whole stack is centered and fills about 88% of the frame height. Nothing touches, no supports, no wires.
```
**Video**
```text
The first frame shows an assembled mechanical wristwatch floating on a pure black backdrop. The last frame shows the same watch as a technical exploded view: its components floating in a vertical stack, the two strap halves moved apart to the left and right.

Begin from the first-frame state. In one continuous slow-motion action the watch disassembles: the strap halves detach and glide outward to the left and right; the sapphire crystal, the bezel, the hands and the blue dial lift straight up one after another; the gold movement stays near the center; the steel case and the case back sink straight down. Every part travels in a straight line along the vertical axis, turning only very slightly, and settles exactly into the evenly spaced stack of the last frame.
```

## 2 · Food (`burger`)

**Partenza**
```text
Ultra-realistic food commercial hero shot. A gourmet cheeseburger floating in mid-air, seen straight on at eye level: glossy toasted brioche bun with sesame seeds, a thick char-grilled beef patty, melted cheddar dripping over the edge, crisp green lettuce, two tomato slices, red onion rings, pickle slices and a thin layer of sauce. The burger is centered and small in the frame: about one third of the frame height, with generous empty space above and below. Warm key light from the upper left, a soft golden rim light from behind that makes the bun and the cheese glisten.
```
**Arrivo** (riferimento: partenza)
```text
Exploded view of the exact same cheeseburger as in the reference image: same camera, same lighting, same pure black backdrop. Every layer has separated and floats in a vertical stack with even gaps, each one perfectly sharp. From top to bottom: the sesame brioche top bun, pickle slices, red onion rings, two tomato slices, the lettuce leaf, the slice of melted cheddar with stretched drips, the char-grilled beef patty, a ring of sauce, the bottom bun. A few sesame seeds and tiny sauce droplets hang frozen in the air around the stack. The stack is centered and fills about 88% of the frame height. Nothing touches, no supports, no plate, no smoke.
```
**Video**
```text
The first frame shows an assembled gourmet cheeseburger floating on a pure black backdrop. The last frame shows the same burger as an exploded view: every layer separated and floating in a vertical stack.

Begin from the first-frame state. In one continuous slow-motion action the burger comes apart layer by layer: the top bun rises, followed by the pickles, the onion rings, the tomato slices and the lettuce, while the cheese, the beef patty, the sauce and the bottom bun spread downward; the melted cheese stretches into drips; a few sesame seeds and sauce droplets drift off and hang in the air. Each layer moves straight along the vertical axis and settles exactly into the evenly spaced stack of the last frame.
```

## 3 · Drink (`drink`)

**Partenza**
```text
Ultra-realistic beverage commercial hero shot. A tall clear glass bottle of sparkling orange soda, without any label, sealed with a plain metal crown cap, ice-cold and covered in dense condensation droplets, fine bubbles visible in the liquid, floating upright in mid-air. The bottle is centered and occupies about 45% of the frame height, with generous empty space around it. A backlight from behind makes the orange liquid glow from inside; a soft cool key light from the upper left draws highlights on the droplets.
```
**Arrivo** (riferimento: partenza)
```text
The exact same bottle of orange soda as in the reference image, in the same position and at the same size, same camera, same lighting, same pure black backdrop. The crown cap has popped off and floats just above the neck, tilted. A dramatic splash of orange soda bursts out and wraps around the bottle in a wide spiral ribbon of liquid, with ice cubes, fresh orange slices and a few mint leaves suspended in mid-air around it, droplets frozen in flight, fine sparkling bubbles. The splash stays inside the frame with a little empty space at the left and right edges. High-speed photography look, every droplet sharp.
```
**Video**
```text
The first frame shows a sealed, ice-cold glass bottle of orange soda floating upright on a pure black backdrop. The last frame shows the same bottle with its cap popped off, wrapped in a spiral splash of orange soda, with ice cubes, orange slices and mint leaves suspended around it.

Begin from the first-frame state. In one continuous slow-motion action the crown cap pops off and floats up; orange soda erupts from the neck and wraps around the bottle as a spiral ribbon of liquid; ice cubes, orange slices and mint leaves fly in from outside the frame and come to rest suspended around the bottle; droplets scatter and freeze in the air. The bottle itself stays perfectly still, upright, at the same size and position.
```

## 4 · Beauty (`beauty`)

**Partenza**
```text
Luxury cosmetics hero shot, photorealistic. A closed face-cream jar floating in mid-air: thick frosted glass body with a soft pearl-pink tint, polished rose-gold screw lid with fine knurling on its edge, seen from a slightly elevated three-quarter angle. The jar is centered and small in the frame: about 28% of the frame height, with generous empty space above it. Soft beauty key light from the upper left, a thin warm rim light from behind that outlines the glass and the metal lid.
```
**Arrivo** (riferimento: partenza)
```text
The exact same face-cream jar as in the reference image, in the same position and at the same size, same camera, same lighting, same pure black backdrop. The rose-gold lid has unscrewed and floats above the jar, tilted toward the camera. From the open jar a thick silky ribbon of white cream rises in a perfect spiral swirl that reaches the upper part of the frame. Around it float golden serum droplets of different sizes and a few soft pink rose petals, all frozen in mid-air and sharp. The composition is centered on the jar and fills about 85% of the frame height.
```
**Video**
```text
The first frame shows a closed frosted-glass face-cream jar with a rose-gold lid floating on a pure black backdrop. The last frame shows the same jar open, its lid floating above to the right, a tall spiral swirl of white cream rising from it, with golden serum droplets and pink rose petals suspended around.

Begin from the first-frame state. In one continuous slow-motion action the rose-gold lid unscrews with a slow turn, lifts off and floats up to the right, tilting toward the camera; from the open jar a thick silky ribbon of white cream rises and curls into a tall spiral swirl; golden serum droplets and pink rose petals drift in from outside the frame and come to rest around it. The jar stays perfectly still at the same size and position.
```

## 5 · Tech (`tech`)

**Partenza**
```text
Premium tech product hero shot, photorealistic. Over-ear wireless headphones floating in mid-air, seen from a three-quarter front angle: matte black anodized aluminum earcups with a fine machined ring, plush black memory-foam leather ear cushions, brushed steel sliders and a padded leather headband. The headphones are centered and occupy about 40% of the frame height, with generous empty space to the left and right. Soft key light from the upper left, a crisp electric-blue rim light from behind that outlines the metal edges.
```
**Arrivo** (riferimento: partenza)
```text
Technical exploded view of the exact same over-ear headphones as in the reference image: same camera angle, same lighting with the electric-blue rim light, same pure black backdrop. Both earcups are disassembled along one horizontal axis, with the parts evenly spaced and perfectly sharp. For each earcup, from the outside toward the center: the matte black aluminum outer shell, the circuit board with a small battery, the speaker driver with copper coil and magnet, the inner frame, the black leather ear cushion. The padded headband has lifted and floats above, with its two brushed steel sliders detached beside it. The exploded view is centered and fills about 88% of the frame width. Nothing touches, no supports, no hanging wires.
```
**Video**
```text
The first frame shows assembled over-ear headphones floating on a pure black backdrop with an electric-blue rim light. The last frame shows the same headphones as a technical exploded view: both earcups disassembled along a horizontal axis, the headband lifted above.

Begin from the first-frame state. In one continuous slow-motion action the headphones disassemble: the headband lifts upward and its two steel sliders detach; both earcups come apart along the horizontal axis, the ear cushions sliding inward toward the center while the inner frames, the speaker drivers, the circuit boards and the outer shells slide outward to the left and to the right, one after another. Each part moves in a straight line and settles exactly into the evenly spaced row of the last frame.
```

## 6 · Moda (`shoe`)

**Partenza**
```text
Premium footwear product hero shot, photorealistic. A modern running sneaker floating in mid-air, side profile with the toe pointing right, tilted up very slightly: white engineered-mesh upper with volt-green and black overlays, flat white laces, padded collar, thick sculpted white foam midsole, translucent rubber outsole with visible tread. No brand marks of any kind. The shoe is centered and occupies about 45% of the frame width and one third of the frame height, with generous empty space above and below. Soft key light from the upper left, a crisp cool rim light from behind that outlines the sole.
```
**Arrivo** (riferimento: partenza)
```text
Technical exploded view of the exact same running sneaker as in the reference image: same side profile with the toe pointing right, same lighting, same pure black backdrop. The shoe is separated into horizontal layers that float in a vertical stack with even gaps, each one perfectly sharp. From top to bottom: the white laces and the tongue, the white engineered-mesh upper with its volt-green and black overlays, the inner sock liner and insole, the white foam midsole with a thin carbon plate visible above it, and the translucent rubber outsole with its tread. The stack is centered and fills about 88% of the frame height. Nothing touches, no supports.
```
**Video**
```text
The first frame shows a white and volt-green running sneaker floating in side profile on a pure black backdrop. The last frame shows the same sneaker as a technical exploded view: its layers separated and floating in a vertical stack.

Begin from the first-frame state. In one continuous slow-motion action the sneaker separates into layers: the laces and the tongue lift up and tilt, the mesh upper rises, the insole slides out below it, the foam midsole and the thin plate sink, and the translucent rubber outsole drops to the bottom. Each layer moves straight along the vertical axis and settles exactly into the evenly spaced stack of the last frame.
```

## 7 · Immobili (`building`)

Qui il verso è invertito: il video parte dal progetto in ologramma e arriva al palazzo vero. L'immagine fotorealistica è stata generata per prima e usata come riferimento per l'ologramma.

**Arrivo** (palazzo vero, generato per primo)
```text
Architectural visualization hero shot, photorealistic. A contemporary seven-storey residential building as a hyper-detailed scale model floating in mid-air on a thin concrete base slab: floor-to-ceiling glass facade with warm interior lights and visible furnished rooms, white concrete balconies with glass railings, vertical timber cladding panels, a rooftop garden with small trees. Seen from an elevated three-quarter angle. The building is centered and occupies about 45% of the frame height, with generous empty space above and below. Cool moonlight key light from the upper left, warm glow from the windows, a thin rim light from behind that outlines the edges.
```
**Partenza** (ologramma; riferimento: palazzo vero)
```text
The exact same building as in the reference image, same camera angle, same position, same size, same pure black backdrop, but rendered as a glowing holographic architectural blueprint: every edge of the structure, every floor slab, balcony, window frame and the outline of the rooftop garden is drawn as thin luminous cyan-blue light lines, like a precise three-dimensional wireframe made of LED light. The surfaces are transparent: there is no solid material, no warm interior light, no textures, only the fine glowing line work, with a few small measurement tick marks along the edges and no readable numbers. A soft glow surrounds the lines.
```
**Video**
```text
The first frame shows a seven-storey building as a glowing cyan holographic wireframe on a pure black backdrop. The last frame shows the same building, in the same position and at the same size, as a finished photorealistic scale model with warm lit interiors.

Begin from the first-frame state. In one continuous slow-motion action the building materializes from the ground up: starting at the base slab and rising floor by floor, the glowing blueprint lines fill in with real materials, concrete slabs, glass facade, timber cladding and balconies, and the interior lights switch on one floor after another; the rooftop garden grows in last. The cyan lines fade as each floor becomes solid. The building's geometry, position and size never change.
```

---

## Aggiungere un settore

1. Genera le due immagini e il video con lo schema sopra.
2. Scarica l'MP4 e lancia `bash tools/frames.sh clip.mp4 nome_scena`.
3. In `index.html` aggiungi la voce in `window.SYD.scenes` e un blocco `<article class="sc" data-id="nome_scena" …>` copiando uno di quelli esistenti (testi, etichette, richiami sui componenti).

Controllo prima di usare una clip: forma del prodotto coerente dall'inizio alla fine, nessun pezzo che si deforma o ne attraversa un altro, fondo sempre nero, nessun taglio, nessun testo inventato.
