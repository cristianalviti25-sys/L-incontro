# Style Your Dream — pagina di presentazione

Pagina singola (`index.html`) che presenta il servizio di creazione siti web: hero con seta animata che reagisce al tocco, scena che si muove con lo scroll, video del brand, sezioni animate e modulo di contatto.

## File
- `index.html` — la pagina (CSS e JavaScript sono dentro il file)
- `PROMPT-HIGGSFIELD.md` — i prompt usati per generare immagini e video con Higgsfield
- `media/` — il video "Il sogno prende stile" (`sogno.mp4`, la coda in loop `sogno-loop.mp4`, il fermo immagine `sogno.jpg`)
- `frames/hero/` — fotogrammi del video a scorrimento
- `tools/video.sh` — converte una clip scaricata da Higgsfield nei tre file di `media/`
- `tools/frames.sh` — taglia il video a scorrimento in fotogrammi

## Cosa configurare
In cima a `index.html` c'è il blocco `window.SYD`:
- `contact` — numero WhatsApp (con prefisso, senza +), email, Instagram. Finché sono vuoti il modulo prepara il messaggio e lo fa copiare, ma non mostra pulsanti di contatto.
- `video` — i file del video. Con `src` vuoto la sezione non compare.
- `scroll` — numero di fotogrammi, colore di fondo e ingrandimento su telefono del video a scorrimento. Con `frames: 0` la pagina usa la scena animata in codice.

## La seta dell'hero
È disegnata in WebGL, non è un video: per questo si può accarezzare. Passando il mouse o il dito la stoffa segue il gesto, fa una piega davanti e torna a posto; un tocco o un clic manda un'onda leggera.

## Cambiare i video
```bash
bash tools/video.sh percorso/clip-brand.mp4        # video "Il sogno prende stile"
bash tools/frames.sh percorso/clip-scroll.mp4      # video a scorrimento
```
Ogni script stampa la riga da incollare nel blocco `window.SYD`.

## Provarla in locale
```bash
python3 -m http.server 8000
```
poi apri `http://localhost:8000`.

## Da rivedere prima di pubblicarla
Testi, servizi, metodo e risposte alle domande sono una bozza: vanno adattati a come lavori davvero.
