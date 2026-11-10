# Style Your Dream — showroom a scorrimento

Pagina singola (`index.html`) che presenta il servizio di creazione siti web a quanti più settori possibile. Tutto si muove con lo scroll.

## Com'è fatta
1. **Hero**: muro di LED che scrive i settori uno dopo l'altro e si accende sotto il puntatore. Scorrendo, le lettere del titolo e i LED esplodono.
2. **Showroom**: un palco fisso con sette settori (orologi, food, drink, beauty, tech, moda, immobili). In ognuno un video generato con Higgsfield avanza con lo scroll: il prodotto si apre o esplode nei componenti, con le etichette che li indicano. Tra un settore e l'altro passa il nome in LED.
3. **E il tuo settore?**: etichette di altri settori e palline con i prodotti che cadono, rimbalzano e saltano al tocco.
4. **Metodo**, **domande**, **contatti**: il modulo prepara il messaggio; i pulsanti "Voglio un sito così" precompilano il settore.

## File
- `index.html` — la pagina (CSS e JavaScript sono dentro il file)
- `frames/<settore>/` — i fotogrammi dei video (61 per settore)
- `tools/frames.sh` — taglia una clip in fotogrammi
- `PROMPT-HIGGSFIELD.md` — i prompt usati per immagini e video, e come aggiungere un settore

## Cosa configurare
In cima a `index.html` c'è il blocco `window.SYD`:
- `contact` — numero WhatsApp (con prefisso, senza +), email, Instagram. Finché sono vuoti il modulo prepara il messaggio e lo fa copiare, ma non mostra pulsanti di contatto.
- `scenes` — per ogni settore: numero di fotogrammi e inquadratura (ingrandimento iniziale e finale su schermi orizzontali e verticali).

Testi, etichette e richiami sui componenti di ogni settore sono nei blocchi `<article class="sc" …>` della sezione showroom.

## Librerie
Caricate da CDN: Lenis (scroll morbido) e Matter.js (fisica degli oggetti che rimbalzano). Se non si caricano la pagina funziona lo stesso: scroll normale ed etichette ferme.

## Provarla in locale
```bash
python3 -m http.server 8000
```
poi apri `http://localhost:8000`.

## Da rivedere prima di pubblicarla
Testi, servizi per settore, metodo e risposte alle domande sono una bozza: vanno adattati a come lavori davvero.
