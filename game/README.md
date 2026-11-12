# Pizzaiolo per un giorno — il gioco

Minigioco per i siti delle pizzerie. Un solo file JavaScript, nessuna dipendenza, funziona
con mouse, tocco e tastiera, in orizzontale (desktop, tablet) e in verticale (telefono).

## Come si gioca

1. Arriva un ordine con il gusto e i suoi ingredienti.
2. Si tocca l'impasto per stenderlo, poi le ciotole degli ingredienti richiesti.
3. Si tocca il forno per infornare. Mentre la pizza cuoce si può già preparare la prossima.
4. Si tocca di nuovo il forno per sfornare quando la freccia è sul verde.

| Dinamica | Regola |
| --- | --- |
| Cottura | La freccia va da cruda a bruciata. Verde = perfetta, giallo o arancione = metà punti, cruda = non si può sfornare, oltre l'arancione = bruciata. |
| Vite | Tre. Se ne perde una per pizza bruciata, pizza sbagliata (due o più errori) o cliente che se ne va. |
| Pazienza | Ogni ordine ha una barra che scende finché la pizza non entra in forno. |
| Punti | 100 per la pizza perfetta, più fino a 40 di bonus velocità. Le pizze perfette di fila aggiungono il 10% ciascuna, fino al 50%. Un errore negli ingredienti dimezza i punti. |
| Livelli | Ogni 3 pizze servite: forno più veloce (+13%), meno pazienza, gusti nuovi. |
| Cestino | Butta la pizza sul bancone per rifarla. |
| Tutorial | La prima partita mostra con la mano cosa toccare, fino alla prima pizza servita. |

Da tastiera: `Spazio` impasto, `1`–`8` ingredienti, `Invio` forno, `Canc` cestino, `P` pausa.

## I gusti

| Gusto | Ingredienti | Dal livello |
| --- | --- | --- |
| Margherita | pomodoro, mozzarella, basilico | 1 |
| Diavola | pomodoro, mozzarella, salame piccante | 1 |
| Funghi | pomodoro, mozzarella, funghi | 1 |
| Prosciutto | pomodoro, mozzarella, prosciutto cotto | 1 |
| Prosciutto e funghi | pomodoro, mozzarella, prosciutto cotto, funghi | 2 |
| Calabrese | pomodoro, mozzarella, salame piccante, olive | 2 |
| Capricciosa | pomodoro, mozzarella, prosciutto cotto, funghi, olive | 3 |
| Vegetariana | pomodoro, mozzarella, peperoni, funghi, olive | 3 |
| Speciale della casa | tutti e otto gli ingredienti | 5 |

## Inserirlo in un sito

Copiare la cartella `game/` (basta `pizza-game.js` e `assets/`) e aggiungere:

```html
<div data-pizza-game data-brand="Pizzeria Da Mario"
     data-cta-label="Ordina ora" data-cta-url="https://esempio.it/ordina"></div>
<script src="pizza-game.js"></script>
```

Il riquadro prende tutta la larghezza disponibile e sceglie da solo il formato:
16:9, oppure 3:4 sui telefoni in verticale. Se il contenitore ha già un'altezza
(per esempio a tutto schermo, come in `index.html`) il gioco si adatta a quella.

In alternativa, da codice:

```js
PizzaGame.mount("#gioco", {
  brand: "Pizzeria Da Mario",               // nome mostrato nella schermata iniziale
  title: "Pizzaiolo per un giorno",          // titolo del gioco
  cta: { label: "Ordina ora", url: "…" },    // pulsante a fine partita
  assets: "percorso/assets/",                // se gli asset non sono accanto allo script
  sound: true,                               // audio attivo alla prima partita
  flavors: [                                 // menu personalizzato (facoltativo)
    { id: "margherita", name: "Margherita", ing: ["sauce", "mozzarella", "basil"], level: 1 },
  ],
  strings: { play: "Inizia" },               // per cambiare o tradurre i testi
  onGameOver: ({ score, served, level, best }) => {},
});
```

Ingredienti disponibili per i gusti personalizzati: `sauce`, `mozzarella`, `basil`,
`mushrooms`, `salami`, `ham`, `olives`, `peppers`. Se l'`id` di un gusto non ha un'immagine
in `assets/flavors/`, l'icona dell'ordine viene composta con gli ingredienti.

Record e preferenza dell'audio restano nel browser del giocatore (`localStorage`).
Il gioco non invia dati e non carica nulla da altri siti: anche il font è nella cartella.

## Modificare regole e posizioni

Tutto è in cima a `pizza-game.js`:

- `RULES`: vite, pizze per livello, velocità del forno, pazienza, soglie delle stelle.
- `COOK`: zone della barra di cottura.
- `DEFAULT_FLAVORS` e `INGREDIENTS`: menu e condimenti.
- `LAYOUTS`: posizioni di forno, pizzaiolo, bancone e ciotole nelle due scene.
- `STR`: tutti i testi.

## Rigenerare gli asset

```bash
python3 tools/build_assets.py   # fogli Higgsfield -> sprite master in assets/pizza-game/
python3 tools/build_game.py     # sprite master -> WebP leggeri in game/assets/ (circa 3,3 MB)
```

Per provarlo in locale serve un server web, perché il manifest viene letto con `fetch`:

```bash
python3 -m http.server 8000 --directory game
```
