/*! Pizza Game: minigioco del pizzaiolo per i siti delle pizzerie.
 *  Uso:  <div id="gioco"></div>
 *        <script src="pizza-game.js"></script>
 *        <script>PizzaGame.mount("#gioco", { brand: "Pizzeria Da Mario" })</script>
 */
(function () {
  "use strict";

  const SCRIPT_BASE = (() => {
    const s = document.currentScript;
    return s && s.src ? s.src.replace(/[^/]*$/, "") : "";
  })();

  /* ====================================================================== dati di gioco */

  // Ingredienti: ciotola da toccare e pezzi da spargere sulla pizza.
  const INGREDIENTS = {
    sauce:      { name: "Pomodoro",         bowl: "ingredients/bowl_sauce" },
    mozzarella: { name: "Mozzarella",       bowl: "ingredients/bowl_mozzarella", pieces: ["toppings/mozzarella_raw"], n: 5, size: 0.50 },
    basil:      { name: "Basilico",         bowl: "ingredients/bowl_basil",      pieces: ["toppings/basil_leaf", "toppings/basil_leaves"], n: 4, size: 0.46 },
    mushrooms:  { name: "Funghi",           bowl: "ingredients/bowl_mushrooms",  pieces: ["toppings/mushroom_a", "toppings/mushroom_b"], n: 6, size: 0.42 },
    salami:     { name: "Salame piccante",  bowl: "ingredients/bowl_salami",     pieces: ["toppings/salami"], n: 6, size: 0.44 },
    ham:        { name: "Prosciutto cotto", bowl: "ingredients/bowl_ham",        pieces: ["toppings/ham"], n: 5, size: 0.44 },
    olives:     { name: "Olive",            bowl: "ingredients/bowl_olives",     pieces: ["toppings/olive"], n: 8, size: 0.30 },
    peppers:    { name: "Peperoni",         bowl: "ingredients/bowl_peppers",    pieces: ["toppings/pepper_red", "toppings/pepper_yellow"], n: 6, size: 0.42 },
  };
  const ING_ORDER = ["sauce", "mozzarella", "basil", "mushrooms", "salami", "ham", "olives", "peppers"];

  // Gusti: "level" è il livello da cui il gusto può essere ordinato.
  const DEFAULT_FLAVORS = [
    { id: "margherita",        name: "Margherita",          ing: ["sauce", "mozzarella", "basil"], level: 1 },
    { id: "diavola",           name: "Diavola",             ing: ["sauce", "mozzarella", "salami"], level: 1 },
    { id: "funghi",            name: "Funghi",              ing: ["sauce", "mozzarella", "mushrooms"], level: 1 },
    { id: "prosciutto",        name: "Prosciutto",          ing: ["sauce", "mozzarella", "ham"], level: 1 },
    { id: "prosciutto_funghi", name: "Prosciutto e funghi", ing: ["sauce", "mozzarella", "ham", "mushrooms"], level: 2 },
    { id: "calabrese",         name: "Calabrese",           ing: ["sauce", "mozzarella", "salami", "olives"], level: 2 },
    { id: "capricciosa",       name: "Capricciosa",         ing: ["sauce", "mozzarella", "ham", "mushrooms", "olives"], level: 3 },
    { id: "vegetariana",       name: "Vegetariana",         ing: ["sauce", "mozzarella", "peppers", "mushrooms", "olives"], level: 3 },
    { id: "speciale",          name: "Speciale della casa", ing: ["sauce", "mozzarella", "salami", "ham", "mushrooms", "olives", "peppers", "basil"], level: 5 },
  ];

  // Cottura: d va da 0 (cruda) a 1. Si può sfornare da "yellow" in poi.
  const COOK = { yellow: 0.45, green: 0.56, greenEnd: 0.76, burnt: 0.88, base: 12.5 };

  const RULES = {
    hearts: 3,
    pizzasPerLevel: 3,
    speedPerLevel: 0.13, maxSpeed: 2.2,       // il forno accelera a ogni livello
    patience: 32, patienceStep: 3, patienceMin: 14,  // secondi di attesa del cliente (+1 per ingrediente)
    stars: [400, 1000, 2000],
  };

  // Posizioni nelle due scene (px di progetto). Rettangoli: [x0, y0, x1, y1].
  const LAYOUTS = {
    landscape: {
      fire: { x: 308, y: 494, s: 0.42 }, glow: { x: 330, y: 430, r: 300 },
      ovenPizza: { x: 372, y: 516, s: 0.30, sy: 0.70 },
      ovenHit: [30, 110, 640, 650], ovenHint: { x: 400, y: 400 },
      bar: { x: 330, y: 176, s: 0.74 }, smoke: { x: 360, y: 330 },
      home: { x: 960, y: 930, s: 1.08 }, atOven: { x: 712, y: 772, s: 1.0 },
      board: { x: 966, y: 893, s: 0.68, sy: 0.74 }, boardHit: [650, 770, 1285, 1035],
      trash: { x: 1345, y: 694, s: 0.27 },
      bowls: { sauce: [100, 872], mozzarella: [250, 962], basil: [400, 872], mushrooms: [550, 962],
               salami: [1370, 962], ham: [1520, 872], olives: [1670, 962], peppers: [1820, 872] },
      bowlS: 0.42, bowlR: 96,
      pop: { x: 966, y: 610, size: 70 }, hint: 42,
    },
    portrait: {
      fire: { x: 268, y: 556, s: 0.42 }, glow: { x: 285, y: 480, r: 300 },
      ovenPizza: { x: 335, y: 588, s: 0.30, sy: 0.70 },
      ovenHit: [0, 150, 590, 840], ovenHint: { x: 360, y: 470 },
      bar: { x: 292, y: 226, s: 0.96 }, smoke: { x: 320, y: 380 },
      home: { x: 720, y: 1606, s: 1.15 }, atOven: { x: 650, y: 814, s: 1.05 },
      board: { x: 722, y: 1583, s: 0.74, sy: 0.76 }, boardHit: [385, 1435, 1070, 1745],
      trash: { x: 1150, y: 1338, s: 0.36 },
      bowls: { sauce: [100, 1522], mozzarella: [285, 1522], basil: [100, 1684], mushrooms: [285, 1684],
               salami: [1155, 1522], ham: [1340, 1522], olives: [1155, 1684], peppers: [1340, 1684] },
      bowlS: 0.42, bowlR: 98,
      pop: { x: 722, y: 1210, size: 96 }, hint: 60,
    },
  };
  // Centro della pala rispetto ai piedi del pizzaiolo (px dello sprite; x si inverte se specchiato).
  const BLADE = { peel_carry: [205, -217], peel_push: [300, -215] };

  const STR = {
    title: "Pizzaiolo per un giorno",
    how: ["Leggi l’ordine e tocca gli ingredienti giusti.", "Tocca il forno per infornare.", "Sforna quando la freccia è sul verde, prima che bruci!"],
    play: "Gioca", again: "Gioca ancora", resume: "Riprendi", paused: "In pausa", loading: "Accendo il forno…",
    over: "Fine turno!", score: "Punti", best: "Record", served: "Pizze sfornate", newBest: "Nuovo record!",
    perfect: "Perfetta!", under: "Un po’ pallida", overcooked: "Troppo cotta", almost: "Quasi giusta",
    wrong: "Pizza sbagliata!", burnt: "Bruciata!", raw: "Ancora cruda!", gone: "Cliente andato via!",
    level: "Livello {n}", levelSub: "Il forno scalda di più", inOven: "In forno",
    tutDough: "Tocca l’impasto", tutAdd: "Aggiungi: {x}", tutOven: "Tocca il forno", tutWait: "Aspetta il verde…", tutPull: "Sforna adesso!",
    needDough: "Prima stendi l’impasto", needOrder: "Aspetta un ordine", ovenBusy: "Forno occupato",
    ranks: ["Lavapiatti", "Apprendista", "Pizzaiolo", "Maestro pizzaiolo"],
    pause: "Pausa", sound: "Audio", trash: "Butta la pizza",
  };

  /* ====================================================================== utilità */

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const bump = t => (t <= 0 || t >= 1 ? 0 : Math.sin(t * Math.PI));
  const hash = (a, b) => { const v = Math.sin((a + 1) * 127.1 + (b + 1) * 311.7) * 43758.5453; return v - Math.floor(v); };
  const inRect = (r, x, y) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];
  const FONT = '"PG Fredoka", "Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  const store = {
    get(k, d) { try { const v = localStorage.getItem("pizzaGame." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("pizzaGame." + k, JSON.stringify(v)); } catch (e) { /* senza memoria si gioca lo stesso */ } },
  };

  /* ====================================================================== audio sintetizzato */

  class Sound {
    constructor(on) { this.on = on; this.ctx = null; }
    unlock() {
      if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
      try { const AC = window.AudioContext || window.webkitAudioContext; if (AC) this.ctx = new AC(); } catch (e) { this.ctx = null; }
    }
    tone(freq, dur, { type = "sine", vol = 0.16, to = null, delay = 0 } = {}) {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
    }
    noise(dur, { vol = 0.12, freq = 1200, delay = 0 } = {}) {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime + delay, n = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = buf; f.type = "bandpass"; f.frequency.value = freq; g.gain.value = vol;
      s.connect(f).connect(g).connect(c.destination); s.start(t);
    }
    play(name) {
      switch (name) {
        case "tap": this.tone(520, 0.06, { type: "triangle", vol: 0.08 }); break;
        case "add": this.tone(330, 0.09, { type: "triangle", to: 520, vol: 0.13 }); break;
        case "knead": this.noise(0.16, { freq: 500, vol: 0.14 }); this.tone(160, 0.12, { to: 110, vol: 0.12 }); break;
        case "whoosh": this.noise(0.22, { freq: 900, vol: 0.1 }); break;
        case "order": this.tone(988, 0.16, { vol: 0.12 }); this.tone(1319, 0.22, { vol: 0.1, delay: 0.09 }); break;
        case "ding": this.tone(1568, 0.5, { vol: 0.16 }); this.tone(2093, 0.5, { vol: 0.07, delay: 0.02 }); break;
        case "warn": this.tone(740, 0.1, { type: "square", vol: 0.05 }); this.tone(740, 0.1, { type: "square", vol: 0.05, delay: 0.16 }); break;
        case "good": this.tone(659, 0.12, { type: "triangle" }); this.tone(880, 0.18, { type: "triangle", delay: 0.1 }); break;
        case "perfect": [659, 784, 988, 1319].forEach((f, i) => this.tone(f, 0.16, { type: "triangle", delay: i * 0.075 })); break;
        case "bad": this.tone(220, 0.22, { type: "sawtooth", to: 140, vol: 0.09 }); break;
        case "burn": this.noise(0.5, { freq: 300, vol: 0.2 }); this.tone(180, 0.4, { type: "sawtooth", to: 70, vol: 0.1 }); break;
        case "level": [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.2, { type: "square", vol: 0.05, delay: i * 0.1 })); break;
        case "over": [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.3, { type: "triangle", delay: i * 0.18 })); break;
      }
    }
  }

  /* ====================================================================== stile dell'interfaccia */

  const CSS = `
  :host { display: block; }
  [hidden] { display: none !important; }
  * { box-sizing: border-box; }
  .pg { position: absolute; inset: 0; overflow: hidden; background: #2b1a12; color: #3b1f14;
        font-family: ${FONT}; font-weight: 500; font-size: 16px; line-height: 1.2;
        user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  .stage { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
  canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: manipulation; cursor: pointer; }
  .hud { position: absolute; inset: 0; pointer-events: none; }
  .top { position: absolute; left: .7em; right: .7em; top: .6em; display: flex; align-items: center; gap: .6em; }
  .pill { display: flex; align-items: center; gap: .25em; background: rgba(255, 244, 222, .92); border: .14em solid #3b1f14;
          border-radius: 999px; padding: .2em .65em; box-shadow: 0 .14em 0 rgba(59, 31, 20, .35); }
  .hearts img { width: 1.55em; height: auto; transition: transform .25s; }
  .hearts img.lost { animation: lost .5s; }
  .score img { width: 1.4em; height: auto; }
  .score span { font-weight: 600; font-size: 1.3em; min-width: 2.4ch; text-align: right; font-variant-numeric: tabular-nums; }
  .grow { flex: 1; }
  .ib { pointer-events: auto; width: 3.3em; height: 3.3em; min-width: 40px; min-height: 40px; padding: 0; border: 0; background: none; cursor: pointer;
        filter: drop-shadow(0 .14em 0 rgba(59, 31, 20, .45)); }
  .ib img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .ib:focus-visible, .btn:focus-visible { outline: .2em solid #fff; outline-offset: .1em; border-radius: .6em; }
  .ib.off img { opacity: .45; }
  .tickets { position: absolute; display: flex; gap: .6em; justify-content: center; align-items: flex-start; }
  .landscape .tickets { top: .6em; left: 30%; right: 16%; }
  .portrait .tickets { top: 4.4em; left: 42%; right: .6em; justify-content: flex-end; }
  .ticket { position: relative; background: #fff6e2; border: .14em solid #3b1f14; border-radius: .5em; padding: .45em .55em .6em;
            box-shadow: 0 .2em 0 rgba(59, 31, 20, .35); display: flex; gap: .5em; align-items: center;
            width: 15.5em; transform: rotate(-1.2deg); animation: drop .35s cubic-bezier(.2, 1.4, .4, 1); }
  .ticket:nth-child(even) { transform: rotate(1.2deg); }
  .ticket.active { border-color: #c93a26; box-shadow: 0 .2em 0 #c93a26; }
  .ticket.cooking { background: #ffe9c2; }
  .ticket.out { animation: out .35s forwards; }
  .t-pz { width: 4.6em; height: auto; flex: none; }
  .t-body { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: .3em; }
  .t-name { font-weight: 600; font-size: 1.02em; overflow-wrap: anywhere; }
  .t-ings { display: flex; flex-wrap: wrap; gap: .15em; }
  .ing { position: relative; width: 1.75em; height: 1.75em; }
  .ing img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .ing.done img { opacity: .3; }
  .ing.done::after { content: ""; position: absolute; left: 32%; top: 10%; width: 32%; height: 60%;
                     border: solid #2c7a37; border-width: 0 .24em .24em 0; transform: rotate(40deg); }
  .t-bar { position: absolute; left: .5em; right: .5em; bottom: .22em; height: .26em; background: rgba(59, 31, 20, .18); border-radius: 9px; overflow: hidden; }
  .t-bar i { display: block; height: 100%; width: 100%; background: #2c7a37; border-radius: 9px; }
  .t-bar i.mid { background: #e0a020; }
  .t-bar i.low { background: #c93a26; }
  .t-tag { position: absolute; right: -.4em; top: -.6em; background: #c93a26; color: #fff; font-weight: 600; font-size: .72em;
           padding: .15em .55em; border-radius: 999px; border: .14em solid #3b1f14; }
  .t-err { position: absolute; left: -.5em; top: -.6em; width: 1.7em; height: auto; }
  .portrait .ticket { flex-direction: column; width: 7.6em; gap: .25em; padding: .4em .4em .65em; text-align: center; }
  .portrait .t-pz { width: 4.3em; }
  .portrait .t-ings { justify-content: center; }
  .portrait .ing { width: 1.55em; height: 1.55em; }
  .portrait .t-name { font-size: .92em; }
  .toast { position: absolute; left: 50%; top: 34%; transform: translate(-50%, -50%); text-align: center; pointer-events: none;
           background: #c93a26; color: #fff; border: .14em solid #3b1f14; border-radius: .6em; padding: .5em 1.2em;
           box-shadow: 0 .25em 0 rgba(59, 31, 20, .4); animation: toast 2.2s forwards; }
  .toast b { display: block; font-weight: 600; font-size: 1.7em; }
  .overlay { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(43, 26, 18, .55); padding: 1em; }
  .card { width: min(100%, 24em); max-height: 100%; overflow: auto; background: #fff6e2; border: .18em solid #3b1f14; border-radius: .9em;
          padding: 1.2em 1.3em 1.3em; text-align: center; box-shadow: 0 .4em 0 rgba(59, 31, 20, .45);
          display: flex; flex-direction: column; gap: .8em; align-items: center; }
  .card h2 { margin: 0; font-weight: 600; font-size: 1.8em; line-height: 1.05; color: #c93a26; text-wrap: balance; }
  .card .brand { font-size: .95em; opacity: .8; margin-top: -.5em; }
  .card ol { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: .45em; text-align: left; counter-reset: n; }
  .card li { display: flex; gap: .6em; align-items: baseline; counter-increment: n; }
  .card li::before { content: counter(n); flex: none; width: 1.5em; height: 1.5em; line-height: 1.5em; text-align: center; border-radius: 50%;
                     background: #3b1f14; color: #fff6e2; font-weight: 600; font-size: .85em; }
  .btn { pointer-events: auto; font: inherit; font-weight: 600; font-size: 1.25em; color: #fff; background: #2c7a37; border: .14em solid #3b1f14;
         border-radius: .6em; padding: .45em 1.6em; cursor: pointer; box-shadow: 0 .22em 0 #3b1f14; min-height: 44px; }
  .btn:active { transform: translateY(.14em); box-shadow: 0 .08em 0 #3b1f14; }
  .btn.alt { background: #c93a26; text-decoration: none; display: inline-block; }
  .big { font-weight: 600; font-size: 3em; line-height: 1; font-variant-numeric: tabular-nums; }
  .stars { display: flex; gap: .3em; justify-content: center; }
  .stars img { width: 2.6em; height: auto; }
  .meta { display: flex; gap: 1.2em; justify-content: center; flex-wrap: wrap; font-size: .95em; }
  .meta b { font-weight: 600; }
  .rank { font-weight: 600; font-size: 1.15em; }
  .newbest { color: #2c7a37; font-weight: 600; }
  .loadbar { width: 12em; max-width: 100%; height: .7em; border: .14em solid #3b1f14; border-radius: 9px; overflow: hidden; background: #fff; }
  .loadbar i { display: block; height: 100%; width: 0; background: #c93a26; transition: width .2s; }
  .shake { animation: shake .35s; }
  @keyframes drop { from { transform: translateY(-140%) rotate(-6deg); } }
  @keyframes out { to { transform: translateY(-160%) rotate(8deg); opacity: 0; } }
  @keyframes lost { 30% { transform: scale(1.5) rotate(-12deg); } }
  @keyframes shake { 20% { transform: translate(-.4em, 0); } 40% { transform: translate(.4em, 0); } 60% { transform: translate(-.25em, 0); } 80% { transform: translate(.25em, 0); } }
  @keyframes toast { 0% { opacity: 0; transform: translate(-50%, -30%) scale(.8); } 12%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -70%) scale(1); } }
  @media (prefers-reduced-motion: reduce) { .ticket, .toast, .hearts img.lost, .shake { animation-duration: .01s; } }
  `;

  /* ====================================================================== gioco */

  class Game {
    constructor(root, opts) {
      this.root = root;
      this.opts = { assets: SCRIPT_BASE + "assets/", title: STR.title, brand: "", cta: null, sound: true };
      for (const k in opts || {}) if (opts[k] !== undefined) this.opts[k] = opts[k];
      this.S = Object.assign({}, STR, this.opts.strings || {});
      this.flavors = (this.opts.flavors || DEFAULT_FLAVORS).filter(f => f.ing.every(i => INGREDIENTS[i]));
      this.A = this.opts.assets.replace(/\/?$/, "/");
      this.img = {}; this.man = null; this.mode = "loading"; this.st = null;
      this.pzCache = new Map(); this.time = 0; this.last = 0;
      this.sound = new Sound(store.get("sound", this.opts.sound));
      this.best = store.get("best", 0);
      this.buildDom();
      this.loop = this.loop.bind(this);
      this.load().then(() => { this.showMenu(); requestAnimationFrame(this.loop); })
        .catch(err => { this.ui.cardBody.textContent = "Impossibile caricare il gioco. Controlla la connessione e ricarica la pagina."; console.error("[PizzaGame]", err); });
    }

    /* ------------------------------------------------------------ caricamento */

    url(f) { return this.A + f; }

    loadImage(key, file) {
      return new Promise(res => {
        const i = new Image();
        i.onload = () => { this.img[key] = i; res(); };
        i.onerror = () => res();
        i.src = this.url(file);
      });
    }

    async load() {
      this.overlay("loading");
      const r = await fetch(this.url("manifest.json"));
      if (!r.ok) throw new Error("manifest " + r.status);
      this.man = await r.json();
      try {
        [500, 600].forEach(w => new FontFace("PG Fredoka", `url(${this.url("fonts/fredoka-" + w + ".woff2")})`, { weight: String(w) })
          .load().then(f => document.fonts.add(f)).catch(() => {}));
      } catch (e) { /* si usa il font di sistema */ }
      this.resize();
      const jobs = [];
      for (const k in this.man.sprites) jobs.push([k, this.man.sprites[k].f]);
      jobs.push(["fire", this.man.anims.fire.f]);
      const bg = this.man.backgrounds[this.orient];
      jobs.push(["bg_" + this.orient, bg.bg], ["counter_" + this.orient, bg.counter]);
      let done = 0;
      await Promise.all(jobs.map(([k, f]) => this.loadImage(k, f).then(() => {
        done++; if (this.ui.loadbar) this.ui.loadbar.style.width = Math.round(done / jobs.length * 100) + "%";
      })));
      const other = this.orient === "portrait" ? "landscape" : "portrait", ob = this.man.backgrounds[other];
      this.loadImage("bg_" + other, ob.bg); this.loadImage("counter_" + other, ob.counter);
      const pm = this.man.sprites["pizza/base_raw"];
      this.PW = pm.w; this.PH = pm.h;
    }

    /* ------------------------------------------------------------ DOM */

    buildDom() {
      const root = this.root;
      if (getComputedStyle(root).position === "static") root.style.position = "relative";
      this.autoSize = root.clientHeight < 40;
      const sh = this.shadow = root.attachShadow ? root.attachShadow({ mode: "open" }) : root;
      const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.append(e); return e; };
      el("style", null, sh, CSS);
      const pg = el("div", "pg landscape", sh);
      const stage = el("div", "stage", pg);
      const canvas = el("canvas", null, stage);
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", "Cucina della pizzeria: bancone con gli ingredienti, pizzaiolo e forno a legna");
      const hud = el("div", "hud", stage); hud.hidden = true;
      const top = el("div", "top", hud);
      const hearts = el("div", "pill hearts", top);
      const score = el("div", "pill score", top, `<img alt="${this.S.score}"><span>0</span>`);
      el("div", "grow", top);
      const bPause = el("button", "ib", top, "<img alt=''>"); bPause.type = "button"; bPause.setAttribute("aria-label", this.S.pause);
      const bSound = el("button", "ib", top, "<img alt=''>"); bSound.type = "button"; bSound.setAttribute("aria-label", this.S.sound);
      const tickets = el("div", "tickets", hud);
      const overlay = el("div", "overlay", stage);
      const card = el("div", "card", overlay);
      const cardBody = el("div", null, card); cardBody.style.display = "contents";
      this.ui = { pg, stage, canvas, hud, hearts, score: score.querySelector("span"), scoreImg: score.querySelector("img"),
                  bPause, bSound, tickets, overlay, card, cardBody, loadbar: null, el };
      this.ctx = canvas.getContext("2d");

      canvas.addEventListener("pointerdown", e => this.onPointer(e));
      bPause.addEventListener("click", () => this.togglePause());
      bSound.addEventListener("click", () => {
        this.sound.on = !this.sound.on; store.set("sound", this.sound.on); this.sound.unlock();
        bSound.classList.toggle("off", !this.sound.on); bSound.setAttribute("aria-pressed", String(!this.sound.on)); this.sound.play("tap");
      });
      bSound.classList.toggle("off", !this.sound.on);
      this.onKey = e => this.key(e);
      window.addEventListener("keydown", this.onKey);
      this.onVis = () => { if (document.hidden && this.mode === "play") this.togglePause(); };
      document.addEventListener("visibilitychange", this.onVis);
      this.onResize = () => this.resize();
      if (window.ResizeObserver) { this.ro = new ResizeObserver(this.onResize); this.ro.observe(root); }
      window.addEventListener("resize", this.onResize);
      this.resize();
    }

    resize() {
      const root = this.root;
      if (this.autoSize) {
        const tall = window.innerHeight > window.innerWidth && root.clientWidth < 720;
        root.style.aspectRatio = tall ? "3 / 4" : "16 / 9";
        root.style.maxHeight = "100vh";
      }
      const rw = root.clientWidth || 320, rh = root.clientHeight || rw * 0.5625;
      const orient = rh > rw * 1.12 ? "portrait" : "landscape";
      const W = orient === "portrait" ? 1440 : 1920, H = orient === "portrait" ? 1920 : 1080;
      const k = Math.min(rw / W, rh / H), cw = Math.floor(W * k), ch = Math.floor(H * k);
      const { stage, canvas, pg } = this.ui;
      stage.style.width = cw + "px"; stage.style.height = ch + "px";
      pg.style.fontSize = Math.max(11, cw * (orient === "portrait" ? 0.036 : 0.0172)) + "px";
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const bw = Math.min(W, Math.round(cw * dpr)), bh = Math.round(bw * H / W);
      if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
      this.k = bw / W; this.W = W; this.H = H;
      if (orient !== this.orient) {
        this.orient = orient; this.L = LAYOUTS[orient];
        pg.classList.toggle("portrait", orient === "portrait"); pg.classList.toggle("landscape", orient !== "portrait");
        if (this.st) { this.st.fx.length = 0; this.st.pops.length = 0; }
      }
    }

    overlay(kind, data) {
      const { overlay, cardBody, el } = this.ui, S = this.S;
      cardBody.innerHTML = ""; this.ui.loadbar = null;
      if (!kind) { overlay.hidden = true; return; }
      overlay.hidden = false;
      const btn = (label, fn, cls) => { const b = el("button", "btn" + (cls ? " " + cls : ""), cardBody); b.type = "button"; b.textContent = label; b.addEventListener("click", fn); return b; };
      if (kind === "loading") {
        el("h2", null, cardBody).textContent = this.opts.title;
        el("div", null, cardBody).textContent = S.loading;
        this.ui.loadbar = el("i", null, el("div", "loadbar", cardBody));
      } else if (kind === "menu") {
        el("h2", null, cardBody).textContent = this.opts.title;
        if (this.opts.brand) el("div", "brand", cardBody).textContent = this.opts.brand;
        const ol = el("ol", null, cardBody);
        S.how.forEach(t => { el("li", null, ol).append(document.createTextNode(t)); });
        if (this.best) el("div", "meta", cardBody, `<span>${S.best}: <b>${this.best}</b></span>`);
        btn(S.play, () => this.start()).focus({ preventScroll: true });
      } else if (kind === "pause") {
        el("h2", null, cardBody).textContent = S.paused;
        btn(S.resume, () => this.togglePause()).focus({ preventScroll: true });
      } else if (kind === "over") {
        el("h2", null, cardBody).textContent = S.over;
        const stars = el("div", "stars", cardBody);
        for (let i = 0; i < 3; i++) { const im = el("img", null, stars); im.alt = ""; im.src = this.url(this.man.sprites[i < data.stars ? "ui/star_full" : "ui/star_empty"].f); }
        el("div", "big", cardBody).textContent = data.score;
        el("div", "rank", cardBody).textContent = S.ranks[data.stars];
        if (data.newBest) el("div", "newbest", cardBody).textContent = S.newBest;
        el("div", "meta", cardBody, `<span>${S.served}: <b>${data.served}</b></span><span>${S.best}: <b>${this.best}</b></span>`);
        btn(S.again, () => this.start()).focus({ preventScroll: true });
        const cta = this.opts.cta;
        if (cta && cta.url) { const a = el("a", "btn alt", cardBody); a.textContent = cta.label || "Ordina ora"; a.href = cta.url; a.target = "_blank"; a.rel = "noopener"; }
      }
    }

    showMenu() {
      this.mode = "menu"; this.st = null; this.ui.hud.hidden = true;
      const s = k => this.url(this.man.sprites[k].f);
      this.ui.scoreImg.src = s("ui/star_full");
      this.ui.bPause.firstChild.src = s("ui/btn_pause"); this.ui.bSound.firstChild.src = s("ui/btn_sound");
      this.menuChef = { pose: "wave" };
      this.overlay("menu");
    }

    /* ------------------------------------------------------------ partita */

    start() {
      this.sound.unlock(); this.sound.play("tap");
      this.overlay(null); this.ui.hud.hidden = false; this.ui.tickets.innerHTML = "";
      this.pzCache.clear();
      this.st = {
        time: 0, score: 0, hearts: RULES.hearts, served: 0, level: 1, streak: 0,
        tickets: [], spawnIn: 0.5, nextId: 1, lastFlavor: null,
        board: { stage: "ball", ing: [], born: 0, pop: -9 },
        plan: { stage: "ball", ing: [], bake: false, fetch: false },
        oven: null, queue: [],
        chef: { where: "home", act: null, t: 0, carry: null, react: null, blink: 2 },
        fx: [], pops: [], bounce: {}, shakeBoard: -9, burnT: -9,
        tut: !store.get("tut", false), over: false, overIn: 0,
      };
      this.mode = "play";
      this.renderHearts(); this.ui.score.textContent = "0";
    }

    togglePause() {
      if (this.mode === "play") { this.mode = "pause"; this.overlay("pause"); }
      else if (this.mode === "pause") { this.mode = "play"; this.overlay(null); this.last = 0; }
    }

    speed() { return Math.min(RULES.maxSpeed, 1 + RULES.speedPerLevel * (this.st.level - 1)); }
    activeTicket() { return this.st.tickets.find(t => t.state === "waiting") || null; }

    spawnTicket() {
      const st = this.st, pool = this.flavors.filter(f => (f.level || 1) <= st.level && f.id !== st.lastFlavor);
      const fresh = pool.filter(f => (f.level || 1) === st.level);
      const pick = fresh.length && Math.random() < 0.45 ? fresh : pool.length ? pool : this.flavors;
      const flavor = pick[Math.floor(Math.random() * pick.length)];
      st.lastFlavor = flavor.id;
      const max = Math.max(RULES.patienceMin, RULES.patience - RULES.patienceStep * (st.level - 1)) + flavor.ing.length;
      const t = { id: st.nextId++, flavor, max, left: max, state: "waiting" };
      const { el } = this.ui, d = el("div", "ticket", this.ui.tickets);
      const pz = el("img", "t-pz", d); pz.alt = "";
      const m = this.man.sprites["flavors/" + flavor.id];
      pz.src = m ? this.url(m.f) : this.pizzaCanvas({ ing: flavor.ing }, 0.66).toDataURL();
      const body = el("div", "t-body", d);
      el("div", "t-name", body).textContent = flavor.name;
      const ings = el("div", "t-ings", body);
      t.ingEls = {};
      flavor.ing.forEach(i => { const s = el("span", "ing", ings); const im = el("img", null, s); im.alt = INGREDIENTS[i].name; im.src = this.url(this.man.sprites[INGREDIENTS[i].bowl].f); t.ingEls[i] = s; });
      t.bar = el("i", null, el("div", "t-bar", d));
      t.el = d; st.tickets.push(t);
      this.sound.play("order");
      this.syncTickets();
    }

    removeTicket(t) {
      const st = this.st, i = st.tickets.indexOf(t);
      if (i >= 0) st.tickets.splice(i, 1);
      if (t.el) { const e = t.el; e.classList.add("out"); setTimeout(() => e.remove(), 380); }
      if (!this.activeTicket() && !st.over) st.spawnIn = Math.max(st.spawnIn, 0.9 + Math.random() * 0.9);
      this.syncTickets();
    }

    // Aggiorna l'aspetto degli ordini: quello attivo, le spunte e gli errori.
    syncTickets() {
      const st = this.st, act = this.activeTicket();
      for (const t of st.tickets) {
        t.el.classList.toggle("active", t === act);
        t.el.classList.toggle("cooking", t.state === "cooking");
        if (t.state === "cooking" && !t.tag) t.tag = this.ui.el("div", "t-tag", t.el, this.S.inOven);
        const have = t === act ? st.plan.ing : t.state === "cooking" ? t.flavor.ing.filter(i => (t.made || []).includes(i)) : [];
        for (const i in t.ingEls) t.ingEls[i].classList.toggle("done", have.includes(i));
        const wrong = t === act && st.plan.ing.some(i => !t.flavor.ing.includes(i));
        if (wrong && !t.err) { t.err = this.ui.el("img", "t-err", t.el); t.err.alt = "Ingrediente sbagliato"; t.err.src = this.url(this.man.sprites["ui/badge_no"].f); }
        if (!wrong && t.err) { t.err.remove(); t.err = null; }
      }
    }

    renderHearts() {
      const h = this.ui.hearts, st = this.st; h.innerHTML = "";
      for (let i = 0; i < RULES.hearts; i++) {
        const im = this.ui.el("img", null, h); im.alt = i < st.hearts ? "Vita" : "Vita persa";
        im.src = this.url(this.man.sprites[i < st.hearts ? "ui/heart_full" : "ui/heart_empty"].f);
      }
    }

    loseHeart() {
      const st = this.st; if (st.over) return;
      st.hearts--; st.streak = 0; this.renderHearts();
      const lost = this.ui.hearts.children[st.hearts]; if (lost) lost.classList.add("lost");
      this.ui.stage.classList.remove("shake"); void this.ui.stage.offsetWidth; this.ui.stage.classList.add("shake");
      if (st.hearts <= 0) { st.over = true; st.overIn = 1.6; }
    }

    addScore(n) { const st = this.st; st.score += n; this.ui.score.textContent = st.score; }

    pop(text, color, x, y, size) {
      const p = this.L.pop;
      this.st.pops.push({ text, color: color || "#fff", x: x == null ? p.x : x, y: y == null ? p.y : y, size: size || p.size, t: 0, life: 1.5 });
    }

    fx(key, x, y, o) { this.st.fx.push(Object.assign({ key, x, y, vx: 0, vy: -60, s: 0.6, grow: 0.4, rot: 0, spin: 0, t: 0, life: 0.8 }, o)); }

    toast(title, sub) {
      const old = this.ui.hud.querySelector(".toast"); if (old) old.remove();
      const t = this.ui.el("div", "toast", this.ui.hud); this.ui.el("b", null, t).textContent = title;
      if (sub) t.append(document.createTextNode(sub));
      setTimeout(() => t.remove(), 2300);
    }

    endGame() {
      const st = this.st, score = st.score;
      const stars = RULES.stars.filter(v => score >= v).length;
      const newBest = score > this.best;
      if (newBest) { this.best = score; store.set("best", score); }
      this.mode = "over"; this.sound.play("over");
      this.overlay("over", { score, served: st.served, stars, newBest });
      if (typeof this.opts.onGameOver === "function") { try { this.opts.onGameOver({ score, served: st.served, level: st.level, best: this.best }); } catch (e) { console.error(e); } }
    }

    /* ------------------------------------------------------------ input */

    onPointer(e) {
      if (this.mode !== "play") return;
      const r = this.ui.canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * this.W, y = (e.clientY - r.top) / r.height * this.H;
      this.sound.unlock();
      const t = this.hit(x, y);
      if (t) { e.preventDefault(); this.command(t); }
    }

    hit(x, y) {
      const L = this.L, st = this.st;
      if (st.plan.stage === "base" && Math.hypot(x - L.trash.x, y - L.trash.y) < 464 * L.trash.s * 0.62) return { type: "trash" };
      let best = null, bd = 1e9;
      for (const id of ING_ORDER) {
        const b = L.bowls[id], d = Math.hypot(x - b[0], (y - b[1]) * 1.1);
        if (d < L.bowlR && d < bd) { bd = d; best = id; }
      }
      if (best) return { type: "bowl", ing: best };
      if (inRect(L.boardHit, x, y)) return { type: "board" };
      if (inRect(L.ovenHit, x, y)) return { type: "oven" };
      return null;
    }

    key(e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const tag = (e.target && e.target.tagName) || "";
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (this.mode !== "play") { if (this.mode === "pause" && (e.key === "p" || e.key === "Escape")) this.togglePause(); return; }
      let c = null;
      if (e.key >= "1" && e.key <= "8") c = { type: "bowl", ing: ING_ORDER[+e.key - 1] };
      else if (e.key === " ") c = { type: "board" };
      else if (e.key === "Enter" || e.key === "f") c = { type: "oven" };
      else if (e.key === "Backspace" || e.key === "Delete") c = { type: "trash" };
      else if (e.key === "p" || e.key === "Escape") { this.togglePause(); e.preventDefault(); return; }
      if (c) { e.preventDefault(); this.sound.unlock(); this.command(c); }
    }

    nope(msg) {
      const st = this.st; this.sound.play("bad");
      if (msg && (!st.lastNope || st.time - st.lastNope > 0.8)) { st.lastNope = st.time; this.pop(msg, "#ffd9a0", null, null, this.L.pop.size * 0.72); }
    }

    // Traduce un tocco in azioni del pizzaiolo. "plan" è lo stato previsto dopo le azioni in coda.
    command(c) {
      const st = this.st, plan = st.plan;
      if (st.over || st.queue.length > 12) return;
      if (c.type === "board") {
        if (plan.stage === "ball") { plan.stage = "base"; st.queue.push({ type: "knead", dur: 0.42 }); this.sound.play("tap"); }
        return;
      }
      if (c.type === "bowl") {
        if (plan.stage !== "base") { st.shakeBoard = st.time; return this.nope(this.S.needDough); }
        if (plan.ing.includes(c.ing)) return;
        plan.ing.push(c.ing); st.bounce[c.ing] = st.time;
        st.queue.push({ type: "add", ing: c.ing, dur: 0.2 }); this.sound.play("add"); this.syncTickets();
        return;
      }
      if (c.type === "trash") {
        if (plan.stage !== "base") return;
        plan.stage = "ball"; plan.ing = [];
        st.queue.push({ type: "trash", dur: 0.25 }); this.sound.play("tap"); this.syncTickets();
        return;
      }
      if (c.type === "oven") {
        const o = st.oven;
        if (o && !o.locked) {
          if (!o.burnt && o.d < COOK.yellow) return this.nope(this.S.raw);
          o.locked = true; o.lockT = st.time; plan.fetch = true;
          st.queue.push({ type: "walk", to: "atOven", dur: 0.55 }, { type: "pull", dur: 0.26 }, { type: "walk", to: "home", dur: 0.55 }, { type: "serve", dur: 0.8 });
          this.sound.play("tap");
          return;
        }
        if (plan.bake) return this.nope(this.S.ovenBusy);
        if (plan.stage !== "base") { st.shakeBoard = st.time; return this.nope(this.S.needDough); }
        if (!this.activeTicket()) return this.nope(this.S.needOrder);
        plan.bake = true; plan.stage = "ball"; plan.ing = [];
        st.queue.push({ type: "pick", dur: 0.12 }, { type: "walk", to: "atOven", dur: 0.55 }, { type: "push", dur: 0.26 }, { type: "walk", to: "home", dur: 0.55 });
        this.sound.play("tap");
      }
    }

    /* ------------------------------------------------------------ azioni del pizzaiolo */

    resync() {
      const st = this.st;
      st.queue.length = 0;
      st.plan = { stage: st.board.stage, ing: st.board.ing.slice(), bake: false, fetch: false };
      if (st.oven && st.oven.locked) {
        st.plan.fetch = true;
        st.queue.push({ type: "walk", to: "atOven", dur: 0.55 }, { type: "pull", dur: 0.26 }, { type: "walk", to: "home", dur: 0.55 }, { type: "serve", dur: 0.8 });
      }
      this.syncTickets();
    }

    actStart(a) {
      const st = this.st, c = st.chef, L = this.L;
      if (a.type === "knead") this.sound.play("knead");
      else if (a.type === "add") {
        st.board.ing.push(a.ing); st.board.pop = st.time;
        this.fx("fx/flour_puff", L.board.x, L.board.y - 30, { s: 0.35, life: 0.4, vy: -40 });
      } else if (a.type === "trash") {
        st.board = { stage: "ball", ing: [], born: st.time, pop: -9 };
        this.fx("fx/smoke_puff", L.board.x, L.board.y - 20, { s: 0.9, life: 0.5 }); this.sound.play("whoosh");
      } else if (a.type === "walk") {
        a.from = c.where === "moving" ? "home" : c.where;
        if (a.from === a.to) a.dur = 0.001;
        c.where = "moving";
      } else if (a.type === "serve") this.serve();
    }

    actProgress(a, p) {
      const st = this.st, L = this.L;
      if (a.type === "knead" && p >= 0.5 && !a.done) {
        a.done = true; st.board.stage = "base"; st.board.pop = st.time;
        this.fx("fx/flour_puff", L.board.x, L.board.y - 40, { s: 1.0, life: 0.55, vy: -90 });
      }
    }

    actEnd(a) {
      const st = this.st, c = st.chef;
      if (a.type === "walk") c.where = a.to;
      else if (a.type === "pick") {
        const t = this.activeTicket();
        if (!t || st.board.stage !== "base") return this.resync();
        t.state = "cooking"; t.made = st.board.ing.slice();
        c.carry = { pizza: { ing: st.board.ing.slice() }, d: 0, ticket: t };
        st.board = { stage: "ball", ing: [], born: st.time, pop: -9 };
        st.spawnIn = 1.0 + Math.random() * 0.8;
        this.syncTickets();
      } else if (a.type === "push") {
        st.oven = { pizza: c.carry.pizza, ticket: c.carry.ticket, d: 0, speed: this.speed(), locked: false, burnt: false };
        c.carry = null; st.plan.bake = false; this.sound.play("whoosh");
      } else if (a.type === "pull") {
        const o = st.oven;
        c.carry = { pizza: o.pizza, d: o.d, ticket: o.ticket, burnt: o.burnt, cooked: true };
        st.oven = null; st.plan.fetch = false; this.sound.play("whoosh");
      } else if (a.type === "serve") c.react = null;
    }

    // Consegna: confronta la pizza con l'ordine e assegna i punti.
    serve() {
      const st = this.st, c = st.chef, k = c.carry, S = this.S, L = this.L;
      c.carry = null; if (!k) return;
      const t = k.ticket;
      const from = { x: L.home.x + BLADE.peel_carry[0] * L.home.s, y: L.home.y + BLADE.peel_carry[1] * L.home.s };
      const fly = { pizza: k.pizza, d: k.d, x0: from.x, y0: from.y, x1: L.pop.x, y1: L.pop.y + L.pop.size * 2.2, t: 0, life: 1.0 };
      if (k.burnt) {
        c.react = "burnt_pizza"; st.flying = null;
        this.fx("fx/smoke_burnt", L.home.x - 170 * L.home.s, L.home.y - 300 * L.home.s, { s: 0.4, life: 0.9, vy: -150, vx: -30 });
      } else {
        const need = t.flavor.ing, have = k.pizza.ing;
        const errors = need.filter(i => !have.includes(i)).length + have.filter(i => !need.includes(i)).length;
        const cook = k.d < COOK.green ? "under" : k.d <= COOK.greenEnd ? "perfect" : "over";
        st.flying = fly;
        if (errors >= 2) {
          c.react = "sad"; this.pop(S.wrong, "#ff8a70"); this.sound.play("bad"); this.loseHeart();
        } else {
          const perfect = cook === "perfect" && !errors;
          st.streak = perfect ? st.streak + 1 : 0;
          const speed = errors ? 0 : Math.round(40 * clamp(t.left / t.max));
          const raw = (100 * (cook === "perfect" ? 1 : 0.5) * (errors ? 0.5 : 1) + speed) * (1 + 0.1 * Math.min(5, Math.max(0, st.streak - 1)));
          const pts = Math.round(raw / 5) * 5;
          this.addScore(pts); st.served++;
          const label = perfect ? S.perfect : errors ? S.almost : cook === "under" ? S.under : S.overcooked;
          this.pop(label, perfect ? "#ffe066" : "#fff"); this.pop("+" + pts, "#b8f5a0", null, L.pop.y + L.pop.size * 1.05, L.pop.size * 0.8);
          if (perfect && st.streak >= 2) this.pop("×" + st.streak, "#ffb347", L.pop.x + L.pop.size * 3.2, L.pop.y, L.pop.size * 0.7);
          c.react = perfect ? "celebrate" : "thumbs_up";
          this.sound.play(perfect ? "perfect" : "good");
          if (perfect) for (let i = 0; i < 5; i++) this.fx(i % 2 ? "fx/sparkles" : "fx/sparkle_big", fly.x1 + (hash(i, st.served) - 0.5) * 420, fly.y1 + (hash(st.served, i) - 0.5) * 220, { s: 0.3, grow: 0.5, life: 0.7 + i * 0.08, vy: -30, spin: 2 });
          if (st.tut) { st.tut = false; store.set("tut", true); }
          const lvl = 1 + Math.floor(st.served / RULES.pizzasPerLevel);
          if (lvl > st.level) { st.level = lvl; this.toast(S.level.replace("{n}", lvl), S.levelSub); this.sound.play("level"); }
        }
      }
      if (t) this.removeTicket(t);
    }

    updateChef(dt) {
      const st = this.st, c = st.chef;
      if (!c.act && st.queue.length) { c.act = st.queue.shift(); c.t = 0; this.actStart(c.act); }
      if (c.act) {
        c.t += dt; const a = c.act;
        this.actProgress(a, clamp(c.t / a.dur));
        if (c.t >= a.dur) { c.act = null; this.actEnd(a); }
      }
      c.blink -= dt; if (c.blink < -0.12) c.blink = 2 + Math.random() * 3;
    }

    /* ------------------------------------------------------------ aggiornamento */

    update(dt) {
      const st = this.st, S = this.S, L = this.L;
      st.time += dt;
      for (const t of st.tickets.slice()) {
        if (t.state !== "waiting") continue;
        t.left -= dt;
        const f = clamp(t.left / t.max);
        t.bar.style.width = (f * 100).toFixed(1) + "%";
        t.bar.className = f < 0.25 ? "low" : f < 0.5 ? "mid" : "";
        if (t.left <= 0 && !st.over) { this.pop(S.gone, "#ff8a70"); this.sound.play("bad"); this.removeTicket(t); this.loseHeart(); }
      }
      if (!this.activeTicket() && !st.over) { st.spawnIn -= dt; if (st.spawnIn <= 0) this.spawnTicket(); }

      const o = st.oven;
      if (o && !o.locked) {
        const prev = o.d;
        o.d = Math.min(1.02, o.d + dt * o.speed / COOK.base);
        if (prev < COOK.green && o.d >= COOK.green) { this.sound.play("ding"); o.dingT = st.time; }
        if (prev < COOK.greenEnd && o.d >= COOK.greenEnd) this.sound.play("warn");
        if (!o.burnt && o.d >= COOK.burnt) {
          o.burnt = true; st.burnT = st.time; this.sound.play("burn");
          this.pop(S.burnt, "#ff8a70", L.ovenHint.x, L.ovenPizza.y + L.pop.size * 2.1); this.loseHeart();
        }
      }
      if (o && (o.d > COOK.greenEnd || o.burnt) && Math.random() < dt * (o.burnt ? 5 : 2.5)) {
        this.fx(o.burnt ? "fx/smoke_burnt" : "fx/smoke_puff", L.smoke.x + (Math.random() - 0.5) * 90, L.smoke.y, { s: 0.35, grow: 0.7, vy: -120, vx: 20, life: 1.3 });
      }
      this.updateChef(dt);
      for (const f of st.fx) { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.spin * dt; }
      st.fx = st.fx.filter(f => f.t < f.life);
      for (const p of st.pops) p.t += dt;
      st.pops = st.pops.filter(p => p.t < p.life);
      if (st.flying) { st.flying.t += dt; if (st.flying.t >= st.flying.life) st.flying = null; }
      if (st.over) { st.overIn -= dt; if (st.overIn <= 0) this.endGame(); }
    }

    /* ------------------------------------------------------------ disegno */

    spr(key, x, y, s = 1, o = {}) {
      const m = this.man.sprites[key], im = this.img[key]; if (!m || !im) return;
      const ctx = this.ctx, w = m.w * s, h = m.h * s * (o.sy == null ? 1 : o.sy);
      const ax = o.ax != null ? o.ax : m.ax != null ? m.ax / m.w : 0.5, ay = o.ay != null ? o.ay : m.ay != null ? m.ay / m.h : 0.5;
      ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.flip) ctx.scale(-1, 1);
      if (o.alpha != null) ctx.globalAlpha = clamp(o.alpha);
      ctx.drawImage(im, -w * ax, -h * ay, w, h); ctx.restore();
    }

    // Compone la pizza (base + condimenti) e la scurisce in base alla cottura d.
    pizzaCanvas(pz, d) {
      const bucket = Math.round(clamp(d, 0, 1.02) * 50), key = pz.ing.join(",") + "|" + bucket;
      let c = this.pzCache.get(key); if (c) return c;
      if (this.pzCache.size > 60) this.pzCache.clear();
      const R = 0.8, PW = this.PW, PH = this.PH, dd = bucket / 50;
      c = document.createElement("canvas"); c.width = Math.round(PW * R); c.height = Math.round(PH * R);
      const g = c.getContext("2d"); g.scale(R, R);
      const put = (k, x, y, s, alpha, rot, flip) => {
        const m = this.man.sprites[k], im = this.img[k]; if (!m || !im) return;
        g.save(); g.translate(x, y); if (rot != null) { g.scale(1, 0.9); g.rotate(rot); } if (flip) g.scale(-1, 1);
        g.globalAlpha = alpha == null ? 1 : alpha; g.drawImage(im, -m.w * s / 2, -m.h * s / 2, m.w * s, m.h * s); g.restore();
      };
      const sauce = pz.ing.includes("sauce"), mozz = pz.ing.includes("mozzarella"), melt = sauce && mozz;
      const cookT = smooth(0.15, 0.55, dd);
      put(melt ? "pizza/base_sauce_mozzarella" : sauce ? "pizza/base_sauce" : "pizza/base_raw", PW / 2, PH / 2, 1);
      if (melt && cookT > 0) put("pizza/cooked", PW / 2, PH / 2, 1, cookT);
      const cx = PW / 2, cy = PH / 2 - 8, rx = PW * 0.33, ry = PH * 0.29, pieces = [];
      pz.ing.forEach((id, order) => {
        const def = INGREDIENTS[id]; if (!def.pieces || (id === "mozzarella" && sauce)) return;
        const idx = ING_ORDER.indexOf(id);
        for (let i = 0; i < def.n; i++) {
          const r = Math.sqrt((i + 0.6) / def.n) * 0.94, a = i * 2.39996 + idx * 1.1 + 0.4;
          pieces.push({ k: def.pieces[i % def.pieces.length], x: cx + Math.cos(a) * r * rx, y: cy + Math.sin(a) * r * ry,
                        rot: (hash(idx, i) - 0.5) * 1.8, flip: hash(i, idx) > 0.5, s: def.size * (0.92 + hash(idx + 9, i) * 0.16), order });
        }
      });
      pieces.sort((p, q) => p.order - q.order || p.y - q.y);
      for (const p of pieces) put(p.k, p.x, p.y, p.s, 1, p.rot, p.flip);
      g.globalCompositeOperation = "source-atop";
      if (!melt && cookT > 0) { g.fillStyle = `rgba(196,120,40,${(cookT * 0.25).toFixed(3)})`; g.fillRect(0, 0, PW, PH); }
      const over = smooth(COOK.greenEnd - 0.04, COOK.burnt, dd);
      if (over > 0) { g.fillStyle = `rgba(72,34,12,${(over * 0.5).toFixed(3)})`; g.fillRect(0, 0, PW, PH); }
      g.globalCompositeOperation = "source-over";
      const bt = smooth(COOK.burnt - 0.03, COOK.burnt + 0.05, dd);
      if (bt > 0) put("pizza/burnt", PW / 2, PH / 2, 1, bt);
      this.pzCache.set(key, c); return c;
    }

    drawPizza(pz, d, x, y, s, sy, alpha) {
      const c = this.pizzaCanvas(pz, d), ctx = this.ctx, w = this.PW * s, h = this.PH * s * sy;
      if (alpha != null) { ctx.save(); ctx.globalAlpha = clamp(alpha); }
      ctx.drawImage(c, x - w / 2, y - h / 2, w, h);
      if (alpha != null) ctx.restore();
    }

    text(str, x, y, size, fill, alpha) {
      const ctx = this.ctx; ctx.save();
      ctx.font = `600 ${size}px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
      ctx.globalAlpha = alpha == null ? 1 : clamp(alpha);
      ctx.lineWidth = size * 0.24; ctx.strokeStyle = "#3b1f14"; ctx.strokeText(str, x, y);
      ctx.fillStyle = fill; ctx.fillText(str, x, y); ctx.restore();
    }

    chefPlace() {
      const st = this.st, L = this.L, c = st ? st.chef : null, a = c && c.act;
      if (a && a.type === "walk") {
        const f = L[a.from], t = L[a.to], e = ease(clamp(c.t / a.dur));
        return { x: lerp(f.x, t.x, e), y: lerp(f.y, t.y, e), s: lerp(f.s, t.s, e), dx: t.x - f.x || (a.to === "home" ? 1 : -1), moving: true };
      }
      const p = L[c && c.where === "atOven" ? "atOven" : "home"];
      return { x: p.x, y: p.y, s: p.s, dx: 0, moving: false };
    }

    drawChef(t) {
      const st = this.st, L = this.L, c = st ? st.chef : null, a = c && c.act;
      const P = this.chefPlace();
      let pose = "idle", flip = false, x = P.x, y = P.y, sy = 1 + Math.sin(t * 2.4) * 0.012, carryAt = null;
      if (!st) pose = Math.sin(t * 1.3) > 0.2 ? "wave" : "idle";
      else if (a && a.type === "walk") {
        y -= Math.abs(Math.sin(t * 11)) * 7;
        if (c.carry) { pose = "peel_carry"; flip = P.dx < 0; carryAt = "peel_carry"; }
        else { const w = this.man.anims.walk; pose = w.frames[Math.floor(t * w.fps) % w.frames.length].slice(5); flip = P.dx > 0; }
      } else if (a && (a.type === "push" || a.type === "pull")) { pose = "peel_push"; flip = true; }
      else if (a && a.type === "knead") { pose = "knead"; sy = 1 + 0.03 * Math.sin(t * 30); }
      else if (a && a.type === "add") { pose = ING_ORDER.indexOf(a.ing) % 2 ? "sprinkle" : "place"; }
      else if (a && a.type === "pick") { pose = "peel_carry"; flip = true; }
      else if (a && a.type === "trash") pose = "place";
      else if (a && a.type === "serve") {
        pose = c.react || "idle";
        if (pose === "celebrate") y -= Math.abs(Math.sin(clamp(c.t / a.dur) * Math.PI * 2)) * 50;
      } else if (st.over && st.hearts <= 0) pose = "sad";
      else if (st.oven && st.oven.burnt && !st.oven.locked) { pose = st.time - st.burnT < 1.3 ? "shocked" : "wait_worried"; if (pose === "shocked") x += Math.sin(t * 40) * 3; }
      else if (st.oven && !st.oven.locked && st.oven.d >= COOK.greenEnd) pose = "wait_worried";
      else if (st.oven && !st.oven.locked && st.oven.d >= COOK.green) pose = "point_left";
      else if (c.blink < 0) pose = "blink";

      const dir = flip ? -1 : 1;
      if (c && c.carry && carryAt) {
        const b = BLADE[carryAt];
        this.drawPizza(c.carry.pizza, c.carry.d, x + dir * b[0] * P.s, y + b[1] * P.s - 8, 0.36 * P.s, 0.62);
      }
      this.spr("chef/" + pose, x, y, P.s, { flip, sy });
      if (c && c.carry && carryAt) {   // la pizza sta sopra la pala
        const b = BLADE[carryAt];
        this.drawPizza(c.carry.pizza, c.carry.d, x + dir * b[0] * P.s, y + b[1] * P.s - 8, 0.36 * P.s, 0.62);
      }
      if (a && (a.type === "push" || a.type === "pull") && st) {   // la pizza scivola tra pala e forno
        const b = BLADE.peel_push, bx = x - b[0] * P.s, by = y + b[1] * P.s, op = L.ovenPizza;
        const q = a.type === "push" ? clamp(c.t / a.dur) : 1 - clamp(c.t / a.dur), e = ease(q);
        const src = a.type === "push" ? c.carry : st.oven;
        if (src) this.drawPizza(src.pizza, src.d, lerp(bx, op.x, e), lerp(by, op.y, e), lerp(0.36 * P.s, op.s, e), op.sy);
      }
    }

    drawBar(o, t) {
      const ctx = this.ctx, B = this.L.bar, m = this.man.sprites["ui/bar_frame"];
      const fw = m.w * B.s, fh = m.h * B.s, x0 = B.x - fw * 0.40, x1 = B.x + fw * 0.40, y0 = B.y - fh * 0.145, hh = fh * 0.29;
      this.spr("ui/bar_frame", B.x, B.y, B.s);
      const g = ctx.createLinearGradient(x0, 0, x1, 0), e = 0.012;
      g.addColorStop(0, "#f7ead0"); g.addColorStop(COOK.yellow - e, "#f4dba0"); g.addColorStop(COOK.yellow + e, "#f0b84a");
      g.addColorStop(COOK.green - e, "#f0b84a"); g.addColorStop(COOK.green + e, "#4fb04c");
      g.addColorStop(COOK.greenEnd - e, "#4fb04c"); g.addColorStop(COOK.greenEnd + e, "#e8792c");
      g.addColorStop(COOK.burnt - e, "#e8792c"); g.addColorStop(COOK.burnt + e, "#3a1d14"); g.addColorStop(1, "#1e0f0a");
      ctx.save(); ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x0, y0, x1 - x0, hh, hh / 2); else ctx.rect(x0, y0, x1 - x0, hh);
      ctx.clip(); ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, hh); ctx.restore();
      const mx = lerp(x0, x1, clamp(o.d)), wob = o.locked ? 0 : Math.sin(t * 9) * 3 * B.s;
      this.spr("ui/bar_marker", mx, y0 - 26 * B.s + wob, 0.26 * B.s);
      ctx.save(); ctx.fillStyle = "#3b1f14"; ctx.fillRect(mx - 3 * B.s, y0, 6 * B.s, hh); ctx.restore();
      if (!o.locked && !o.burnt && o.d >= COOK.green && o.d <= COOK.greenEnd) {
        const k = 1 + 0.12 * Math.sin(t * 14);
        this.spr("ui/bell", x1 + fw * 0.2, B.y - 6 * B.s, 0.26 * B.s * k, { rot: Math.sin(t * 22) * 0.18 });
      }
    }

    hint() {
      const st = this.st, L = this.L, S = this.S;
      if (!st || !st.tut || st.over) return null;
      const o = st.oven, t = this.activeTicket();
      if (o) {   // finché la prima pizza è in forno si guarda solo il forno
        if (o.locked || o.burnt) return null;
        if (o.d >= COOK.green) return { x: L.ovenHint.x, y: L.ovenHint.y, text: S.tutPull };
        return { x: L.bar.x, y: L.bar.y + 100 * L.bar.s, text: S.tutWait, noHand: true };
      }
      if (!t || st.plan.bake) return null;
      if (st.plan.stage === "ball") return { x: L.board.x, y: L.board.y, text: S.tutDough };
      const next = t.flavor.ing.find(i => !st.plan.ing.includes(i));
      if (next) { const b = L.bowls[next]; return { x: b[0], y: b[1], text: S.tutAdd.replace("{x}", INGREDIENTS[next].name) }; }
      return { x: L.ovenHint.x, y: L.ovenHint.y, text: S.tutOven };
    }

    drawHint(h, t) {
      const ctx = this.ctx, size = this.L.hint, bob = Math.sin(t * 6) * size * 0.25;
      if (!h.noHand) this.spr("ui/hand_pointer", h.x + bob, h.y + bob, size / 150, { ax: 0.14, ay: 0.08 });
      ctx.save(); ctx.font = `600 ${size}px ${FONT}`;
      const w = ctx.measureText(h.text).width + size * 1.1, hh = size * 1.7;
      let bx = h.x - w / 2, by = h.noHand ? h.y : h.y - hh - size * 1.5;
      bx = clamp(bx, 12, this.W - w - 12); by = Math.max(12, by);
      ctx.fillStyle = "#fff6e2"; ctx.strokeStyle = "#3b1f14"; ctx.lineWidth = size * 0.12;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, w, hh, hh * 0.3); else ctx.rect(bx, by, w, hh);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#3b1f14"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(h.text, bx + w / 2, by + hh / 2 + size * 0.04);
      ctx.restore();
    }

    render() {
      const ctx = this.ctx, st = this.st, L = this.L, W = this.W, H = this.H;
      const t = st ? st.time : this.time, bgm = this.man.backgrounds[this.orient];
      ctx.setTransform(this.k, 0, 0, this.k, 0, 0);
      ctx.imageSmoothingQuality = "high";
      const bg = this.img["bg_" + this.orient];
      if (bg) ctx.drawImage(bg, 0, 0, W, H); else { ctx.fillStyle = "#c9603a"; ctx.fillRect(0, 0, W, H); }

      // forno: bagliore, fuoco, pizza in cottura
      const o = st && st.oven, heat = o ? 1.1 + 0.25 * smooth(COOK.green, 1, o.d) : 1;
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      const gl = ctx.createRadialGradient(L.glow.x, L.glow.y, 10, L.glow.x, L.glow.y, L.glow.r * heat);
      const ga = 0.28 + 0.06 * Math.sin(t * 9) + 0.04 * Math.sin(t * 23) + (o ? 0.08 : 0);
      gl.addColorStop(0, `rgba(255,170,60,${ga.toFixed(3)})`); gl.addColorStop(1, "rgba(255,120,20,0)");
      ctx.fillStyle = gl; ctx.fillRect(L.glow.x - 460, L.glow.y - 460, 920, 920); ctx.restore();
      const fa = this.man.anims.fire, fi = this.img.fire;
      if (fi) {
        const fw = fa.w * L.fire.s * heat, fh = fa.h * L.fire.s * heat, fr = Math.floor(t * fa.fps) % fa.n;
        ctx.drawImage(fi, fr * fi.width / fa.n, 0, fi.width / fa.n, fi.height, L.fire.x - fw / 2, L.fire.y - fh, fw, fh);
      }
      const pushing = st && st.chef.act && (st.chef.act.type === "pull");
      if (o && !pushing) this.drawPizza(o.pizza, o.d, L.ovenPizza.x, L.ovenPizza.y, L.ovenPizza.s, L.ovenPizza.sy);

      this.drawChef(t);

      // bancone, ciotole, pizza sul marmo
      const cn = this.img["counter_" + this.orient];
      if (cn) ctx.drawImage(cn, 0, bgm.counterY, W, H - bgm.counterY);
      const order = ING_ORDER.slice().sort((a, b) => L.bowls[a][1] - L.bowls[b][1]);
      for (const id of order) {
        const b = L.bowls[id], bt = st ? (st.time - (st.bounce[id] == null ? -9 : st.bounce[id])) / 0.3 : 9;
        this.spr(INGREDIENTS[id].bowl, b[0], b[1], L.bowlS * (1 + 0.16 * bump(bt)));
      }
      if (st) {
        const B = L.board, bd = st.board, a = st.chef.act;
        const shake = st.time - st.shakeBoard < 0.3 ? Math.sin(st.time * 60) * 8 : 0;
        if (bd.stage === "ball") {
          const kp = a && a.type === "knead" ? clamp(st.chef.t / a.dur) * 2 : 0;
          const born = clamp((st.time - bd.born) / 0.25);
          this.spr("pizza/dough_ball", B.x + shake, B.y - 14 + kp * 20, 0.46 * (1 + kp * 0.5) * lerp(0.6, 1, born), { sy: 1 - kp * 0.45, alpha: born });
        } else {
          const pp = 1 + 0.07 * bump((st.time - bd.pop) / 0.28);
          this.drawPizza(bd, 0, B.x + shake, B.y, B.s * pp, B.sy);
        }
        if (st.plan.stage === "base") this.spr("ui/btn_trash", L.trash.x, L.trash.y, L.trash.s);
      }

      // effetti, barra di cottura, scritte
      if (st) {
        if (o) this.drawBar(o, t);
        for (const f of st.fx) {
          const p = f.t / f.life;
          this.spr(f.key, f.x, f.y, f.s + f.grow * p, { alpha: p < 0.15 ? p / 0.15 : 1 - smooth(0.5, 1, p), rot: f.rot });
        }
        const fl = st.flying;
        if (fl) {
          const p = clamp(fl.t / fl.life), e = ease(clamp(p * 2.2));
          this.drawPizza(fl.pizza, fl.d, lerp(fl.x0, fl.x1, e), lerp(fl.y0, fl.y1, e) - bump(clamp(p * 2.2)) * 60, lerp(0.36, 0.62, e), lerp(0.62, 0.8, e), 1 - smooth(0.75, 1, p));
        }
        const h = this.mode === "play" ? this.hint() : null;
        if (h) this.drawHint(h, t);
        for (const p of st.pops) {
          const q = p.t / p.life, sc = 1 + 0.3 * (1 - smooth(0, 0.22, q));
          this.text(p.text, clamp(p.x, p.size * 3, W - p.size * 3), p.y - q * p.size * 0.9, p.size * sc, p.color, 1 - smooth(0.7, 1, q));
        }
      }
    }

    loop(now) {
      if (this.dead) return;
      const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0; this.last = now; this.time += dt;
      if (this.mode === "play" && this.st) this.update(dt);
      if (this.man) this.render();
      requestAnimationFrame(this.loop);
    }

    destroy() {
      this.dead = true;
      window.removeEventListener("keydown", this.onKey); window.removeEventListener("resize", this.onResize);
      document.removeEventListener("visibilitychange", this.onVis);
      if (this.ro) this.ro.disconnect();
      if (this.shadow !== this.root) this.shadow.innerHTML = ""; else this.root.innerHTML = "";
    }
  }

  const PizzaGame = {
    version: "0.1.0",
    flavors: DEFAULT_FLAVORS, ingredients: INGREDIENTS, rules: RULES, cook: COOK,
    mount(target, opts) {
      const root = typeof target === "string" ? document.querySelector(target) : target;
      if (!root) throw new Error("PizzaGame: contenitore non trovato");
      return new Game(root, opts);
    },
  };
  window.PizzaGame = PizzaGame;
  const auto = () => document.querySelectorAll("[data-pizza-game]").forEach(el => {
    if (el.__pg) return;
    el.__pg = PizzaGame.mount(el, { brand: el.dataset.brand || "", title: el.dataset.title || undefined, assets: el.dataset.assets || undefined,
      cta: el.dataset.ctaUrl ? { url: el.dataset.ctaUrl, label: el.dataset.ctaLabel } : null });
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();
})();
