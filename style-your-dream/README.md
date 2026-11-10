# Style Your Dream — pagina di presentazione

Pagina singola (`index.html`) che presenta il servizio di creazione siti web: hero con seta animata in WebGL, scena che si muove con lo scroll, sezioni animate e modulo di contatto.

## File
- `index.html` — la pagina (CSS e JavaScript sono dentro il file)
- `PROMPT-HIGGSFIELD.md` — i prompt per generare i due video con Higgsfield
- `tools/frames.sh` — taglia il video a scorrimento in fotogrammi
- `frames/hero/` — fotogrammi del video a scorrimento (vuota finché non c'è la clip)
- `media/` — video dell'hero (vuota finché non c'è la clip)

## Cosa configurare
In cima a `index.html` c'è il blocco `window.SYD`:
- `contact` — numero WhatsApp (con prefisso, senza +), email, Instagram. Finché sono vuoti il modulo prepara il messaggio e lo fa copiare, ma non mostra pulsanti di contatto.
- `heroVideo` — percorso del video in loop dietro al titolo. Vuoto = seta animata.
- `scroll` — numero di fotogrammi e colore di fondo del video a scorrimento. `frames: 0` = scena animata in codice.

## Provarla in locale
```bash
python3 -m http.server 8000
```
poi apri `http://localhost:8000`.

## Da rivedere prima di pubblicarla
Testi, servizi, metodo e risposte alle domande sono una bozza: vanno adattati a come lavori davvero.
