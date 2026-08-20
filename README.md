# 🎲 Scheda Interattiva

[![Licenza MIT](https://img.shields.io/github/license/samuelenigro97-prog/tavolo-dei-dadi)](LICENSE.md)
[![Deploy](https://github.com/samuelenigro97-prog/tavolo-dei-dadi/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/samuelenigro97-prog/tavolo-dei-dadi/actions/workflows/deploy.yml)
[![Release](https://img.shields.io/github/v/release/samuelenigro97-prog/tavolo-dei-dadi?display_name=tag&sort=semver)](https://github.com/samuelenigro97-prog/tavolo-dei-dadi/releases)

Scheda del personaggio **D&D 5e** interattiva con tiratore di dadi integrato,
nel formato della scheda ufficiale 2024. PWA installabile, funziona offline.

**▶️ Provala online:** <https://samuelenigro97-prog.github.io/tavolo-dei-dadi/>

**Versione corrente: 3.5.2** · React 18 + Vite · 145 test automatici

> 📌 **Riprendi da qui:** stato reale, cosa è pubblicato, cosa è ancora aperto e
> come lavora questo progetto sono in **[docs/CONTINUA-QUI.md](docs/CONTINUA-QUI.md)**.
> È la fonte unica del backlog.
> 🛠️ **Convenzioni di sviluppo e regole di dominio D&D:** [CLAUDE.md](./CLAUDE.md).

---

## Indice

1. [L'idea: la scheda È l'interfaccia](#lidea-la-scheda-è-linterfaccia)
2. [Funzioni](#funzioni)
3. [Avvio in locale](#avvio-in-locale)
4. [Architettura](#architettura)
5. [Dove si salvano i dati](#dove-si-salvano-i-dati)
6. [Il Cloudflare Worker (le funzioni online)](#il-cloudflare-worker-le-funzioni-online)
7. [Test, build e deploy](#test-build-e-deploy)
8. [Prossime modifiche](#prossime-modifiche)
9. [Documentazione del repository](#documentazione-del-repository)

---

## L'idea: la scheda È l'interfaccia

Non c'è una schermata separata per tirare i dadi. Si interagisce direttamente
coi numeri della scheda, nel formato di quella ufficiale:

| Gesto | Cosa fa |
|---|---|
| **1 click** su un valore | Lo modifichi lì dov'è (modifica inline) |
| **Tieni premuto e rilascia** | Tira il dado. Dopo ~280 ms l'elemento "si carica" e trema, al rilascio parte il tiro (stile Fantasy Grounds) |
| **Doppio click / doppio tap** | Stessa cosa, come scorciatoia |
| **Click sul pallino** | Cicla la competenza: 0 → competenza → maestria → 0 |

Vale per prove di caratteristica, tiri salvezza, abilità, attacchi, danni,
iniziativa, attacco con incantesimo, dadi vita e tiri salvezza contro morte.

## Funzioni

### Tiri e regole

- **Tutti i tiri 5e**: caratteristiche, tiri salvezza, 18 abilità (con
  competenza e maestria), iniziativa, attacchi e danni col dettaglio dei singoli
  dadi, attacco con incantesimo e CD calcolata, dadi vita, TS contro morte.
- **Normale / Vantaggio / Svantaggio** con un selettore nella barra del tiro,
  valido per ogni tiro di d20.
- **Critico corretto**: sul 20 naturale raddoppiano **solo i dadi**
  dell'espressione di danno, non i modificatori fissi (`2d6+3` → `4d6+3`). Conta
  sempre la faccia del dado, mai il totale.
- **Dado libero**: d4–d100 con un click, più un campo per espressioni a piacere
  (`3d6+2`, `1d10+1d6+2`).
- **Riposo breve e lungo** con ricarica corretta delle risorse, spesa dei dadi
  vita, recupero degli slot e sfinimento.
- **Sfinimento** con le regole 2024 (−2 × livello a ogni d20) o 2014, secondo il
  toggle di versione delle regole.
- **Condizioni 5e** come chip, con il riepilogo degli effetti meccanici quando
  se ne accumulano più di una.

### Gestione del personaggio

- **Più personaggi**: selettore in alto con Nuovo / Duplica / Elimina. Ogni PG
  si salva da solo.
- **Creazione guidata** con privilegi automatici fino al livello scelto,
  competenze di classe e specie, multiclasse e sottoclassi.
- **Import da PDF con l'IA**: carichi la scheda in PDF e viene trascritta in
  automatico (richiede il Worker, vedi sotto).
- **Import/Export JSON**, snapshot locali e ripristino.
- **Controllo scheda**: pannello che segnala tiri salvezza e competenze mancanti
  o senza una fonte che li giustifichi.
- **PG casuale** coerente (classe, specie, background, punteggi, competenze,
  nome) per provare al volo.
- Due esempi precaricati: **Flyora** (stregone liv. 4) e **Boddynock**
  (gnomo mago liv. 10).

### Magia

- Slot incantesimo cliccabili, trucchetti separati dagli incantesimi.
- Per le classi che **preparano** incantesimi viene mostrato tutto il catalogo
  lanciabile: i preparati sono stellinati e ordinati per primi a ogni livello.
- **Fonte di Magia**: conversione slot ↔ Punti Stregoneria per lo Stregone.
- **Terzi incantatori** (Cavaliere Mistico, Mistificatore Arcano) modellati.
- Metamagie, con descrizioni tradotte.

### Inventario ed equipaggiamento

- Oggetti con quantità, peso, stato equipaggiato e **sintonia**.
- **Effetti meccanici degli oggetti**: bonus alla Classe Armatura e ai tiri
  salvezza, punteggi di caratteristica impostati da oggetti magici.
- Oggetti **a utilizzi** con cariche massime, cariche rimaste e tipo di ricarica.
- Classe Armatura calcolata da armatura, scudo e competenze.
- Sezione Monete con conversione tra tagli.

### Al tavolo

- **Combat tracker** con iniziativa.
- **Mappa** con segnalino trascinabile, salvato per personaggio.
- **Ambientazioni sonore** (Città, Taverna, Dungeon, Montagna, Mare, Pioggia,
  Deserto…) con variante **giorno/notte** automatica, sottofondo ed effetti a
  volume separato, ed eventi casuali.
- **Diario di sessione** per personaggio, con voci datate.
- **Stampa / Salva PDF** della scheda.
- **Archivio DM**: elenco delle schede depositate, consultabile solo con la
  chiave DM.

### Interfaccia

- **Italiano e inglese**, con tasto ITA/ENG.
- **Tema dinamico**: le variabili CSS vengono tinte in base alla **classe** del
  personaggio; lo sfondo della pagina è un gradiente radiale tematico.
- **Chiaro / Scuro / Auto**: in automatico è scuro di notte (20:00–06:59) o se
  il sistema è in modalità scura.
- **Sezioni riordinabili** trascinandole per la maniglia, con l'ordine e lo
  stato aperto/chiuso ricordati.
- **Toggle regole 5.5 (2024) / 5.0 (2014)**, che incide davvero sui calcoli.
- Ottimizzata per desktop e mobile touch.
- **PWA installabile**: dopo la prima visita funziona offline (tranne l'import
  PDF, che ha bisogno della rete).

### Condivisione tra dispositivi

Tre meccanismi indipendenti, dal più semplice al più avanzato:

| Metodo | Serve un account? | A cosa serve |
|---|---|---|
| **Link `#pg=…`** | no | Mandi una scheda a qualcuno. Nessun server coinvolto |
| **Codice stanza** (10 caratteri) | no | Snapshot temporaneo (24 h) di una scheda: l'altro lo importa come copia |
| **Codice di sincronizzazione** (10 caratteri) | no | Tiene allineato **tutto il roster** tra i tuoi dispositivi, per 180 giorni |
| Backup su **Gist GitHub** | serve un token | Metodo storico, ancora supportato per chi lo aveva già configurato |

Stanze e sincronizzazione richiedono il Worker (vedi sotto).

## Avvio in locale

```bash
npm install
npm run dev        # http://localhost:5173
```

Non serve nessuna chiave API né alcun file `.env` per lo sviluppo normale:
**tutta l'app funziona in locale**. L'unica funzione che ha bisogno di un
servizio esterno è l'**import da PDF con l'IA**, che chiama un endpoint
configurabile (vedi [Il Cloudflare Worker](#il-cloudflare-worker-le-funzioni-online)).

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Vite in sviluppo, con hot reload |
| `npm test` | 145 test (Node test runner, nessuna dipendenza esterna) |
| `npm run build` | Build di produzione in `dist/` |
| `npm run preview` | Serve la build appena fatta |

## Architettura

Frontend puro: **React 18 + Vite**, nessun framework CSS, nessun TypeScript,
nessun backend proprio. Gli stili sono inline nell'oggetto `styles` con la
palette `C`.

```
src/
├── App.jsx              # 8600 righe: tutta la UI e lo stato dell'app
├── main.jsx             # punto di ingresso
├── i18n.js              # traduzioni italiano/inglese (1400 righe)
├── ritratti.js          # generazione avatar SVG da classe e specie
├── rules/               # 🎲 regole D&D pure, senza React — la parte testata
│   ├── dadi.js          #    modificatori, parser espressioni, tiri, dadi vita
│   ├── regole.js        #    slot, privilegi, incantesimi, condizioni, classi
│   └── scheda.js        #    CA totale, bonus abilità e TS, effetti oggetti
├── data/                # 📚 dati statici 5e
│   ├── dati5e.js        #    classi, specie, background, armi, armature
│   ├── incantesimi.js   #    catalogo incantesimi
│   ├── condizioni.js    #    condizioni e loro effetti
│   ├── caratteristiche.js
│   ├── spiegazioni.js / spiegazioni.en.js
│   └── esempi.js        #    Flyora e Boddynock
├── ui/
│   ├── componenti.jsx   #    Editable, Rollable, Sezione, campi con tendina
│   ├── stili.js         #    oggetto styles + keyframes
│   └── tema.js          #    BASE_TEMA, preset colori, tinta per classe
└── utils/
    ├── persistenza.js   #    loadState/saveState, roster, migrazioni
    ├── condivisione.js  #    link #pg=…
    ├── stanze.js        #    codice stanza (snapshot 24 h)
    ├── sync.js          #    codice di sincronizzazione del roster
    ├── audioAmbiente.js #    ambientazioni sonore, giorno/notte, effetti
    └── popover.js
```

**`src/App.jsx` è il punto più delicato del repository**: 8600 righe che
contengono tutta la UI. È anche il file su cui è più facile creare conflitti
quando ci lavorano più sessioni insieme — vedi la sezione sul lavoro
multi-agente in [CLAUDE.md](./CLAUDE.md).

I tre componenti che reggono l'interazione:

- **`Editable`** — 1 click modifica, e tira il dado se ha `onRoll`;
- **`Rollable`** — solo tiro (tieni premuto o doppio click);
- **`Sezione`** — pannello collassabile e trascinabile.

## Dove si salvano i dati

Tutto sul dispositivo, in `localStorage` e IndexedDB. Nessun account.

| Cosa | Dove |
|---|---|
| Roster dei personaggi | `localStorage` → `scheda-interattiva:v1`, nel formato `{ attivo, personaggi: {id: scheda} }` |
| Immagini (ritratto, mappa) | **IndexedDB**, così restano anche se cancelli il file originale |
| Preferenze (tema, lingua, volumi, versione regole, ordine sezioni…) | `localStorage`, una chiave per preferenza |
| Storico degli ultimi 30 tiri | Solo in memoria, non persistito |

> ⚠️ `loadState`/`saveState` in `src/utils/persistenza.js` gestiscono anche la
> **migrazione** dalla vecchia chiave a scheda singola (`tavolo-dei-dadi:scheda:v1`).
> Vanno toccati solo preservando la retrocompatibilità dei dati già salvati.

## Il Cloudflare Worker (le funzioni online)

GitHub Pages serve solo file statici: non può tenere al sicuro una chiave API né
memorizzare niente. Le funzioni che hanno bisogno di un server vivono quindi in
un **Cloudflare Worker** (`worker/transcribe-worker.js`), gratuito per uso
personale.

| Rotta | Funzione |
|---|---|
| `POST /` | **Import da PDF con l'IA**: riceve il PDF, chiama l'API Anthropic, restituisce il JSON del personaggio |
| `/pg` | **Archivio DM**: le schede depositate dall'app, leggibili solo con la chiave DM |
| `POST /room` · `GET /room/<CODICE>` | **Stanze**: snapshot immutabile di una scheda, 24 ore |
| `PUT /sync/<CODICE>` · `GET /sync/<CODICE>` | **Sincronizzazione del roster** tra dispositivi, 180 giorni |

Istruzioni complete di attivazione (con e senza terminale) in
**[worker/LEGGIMI.md](worker/LEGGIMI.md)**.

> ⚠️ **Il Worker non si aggiorna da solo quando una PR viene unita.** Va
> ripubblicato a mano dalla dashboard Cloudflare. È il motivo per cui una
> funzione può risultare corretta nel codice e non funzionare sul sito.

Variabili impostate al momento della build (in `deploy.yml`, da
Settings → Secrets and variables → Actions → Variables):

| Variabile | Serve per |
|---|---|
| `VITE_ARCHIVIO_PG_URL` | Archivio DM. Se è vuota, la funzione resta spenta |
| `VITE_STANZE_URL` | Stanze e sincronizzazione (in mancanza usa `VITE_ARCHIVIO_PG_URL`) |
| `VITE_TRANSCRIBE_URL` | Import PDF. Configurabile anche dall'app, che lo salva in `localStorage` |

## Test, build e deploy

### Test

```bash
npm test        # 145 test, tutti verdi
```

Usano il **test runner di Node**, senza dipendenze esterne. Coprono le parti
pure: regole e dadi, calcoli di scheda, persistenza e migrazioni, condivisione,
stanze, sincronizzazione, aggiornamento e ripristino della PWA, traduzioni,
estetica mobile.

> ⚠️ **Test verdi e build verde non bastano.** È già successo che un import
> mancante rompesse il rendering dell'app a runtime con tutti i 145 test che
> passavano. Dopo una modifica al JSX va **aperta davvero l'app** e controllato
> che non ci siano errori in console.

### Deploy

`.github/workflows/deploy.yml` pubblica su GitHub Pages a ogni push su `main`:

1. **test** — `npm test`, poi build e **smoke test** che carica l'app in
   Chromium vero: se la pagina va in schermata bianca, il job fallisce e il
   deploy non parte;
2. **build** — con `BASE_PATH=/tavolo-dei-dadi/` e le variabili del Worker;
3. **deploy** — su GitHub Pages.

Sulle PR gira solo il job di test.

### PWA e aggiornamenti

`vite-plugin-pwa` con `registerType: 'autoUpdate'` (`skipWaiting` +
`clientsClaim` + `cleanupOutdatedCaches`): la nuova versione si attiva subito e
prende il controllo delle pagine aperte.

L'app confronta `version.json` (tenuto **fuori** dalla precache, così il fetch
va sempre in rete) con `__BUILD_ID__` ogni 20 secondi, al focus e quando torna
online. In più c'è un pulsante **🔄 Aggiorna** che deregistra i service worker,
svuota tutte le cache e ricarica.

> Se un aggiornamento "non arriva", nella quasi totalità dei casi è la cache
> della PWA installata, non un bug. Dopo un merge il deploy impiega qualche
> minuto: prima di indagare, controllare che `version.json` sia davvero
> cambiato.

### Regola di rilascio

**Ogni modifica visibile alza `APP_VERSION` in `src/App.jsx`.** È il numero che
compare in testata e che permette di capire se il sito ha davvero ricevuto
l'aggiornamento. Checklist completa in [docs/RELEASE.md](docs/RELEASE.md).

## Prossime modifiche

Il backlog completo e sempre aggiornato è in
**[docs/CONTINUA-QUI.md](docs/CONTINUA-QUI.md)**. In sintesi:

| # | Intervento | Priorità | Nota |
|---|---|---|---|
| 1 | **Ripubblicare il Worker su Cloudflare** | 🔴 Dipende dall'utente | Senza, la rotta `/sync` non esiste in produzione e la sincronizzazione tramite codice non funziona sul sito, pur essendo corretta nel codice |
| 2 | **Completare e verificare l'inventario di Vaelion Leafwhisper** | 🟠 | Voce aperta da tempo: oggetti, quantità, sintonia, utilizzi e ricariche vanno confrontati coi PDF originali e poi verificati nel cloud |
| 3 | **Statblock per Forma Selvatica**, famigli ed evocazioni | 🟠 | Vaelion è un Druido: è la più utile per questo tavolo |
| 4 | **Statblock pronti di mostri e PNG** per il Combat tracker | 🟡 | |
| 5 | **Audit delle differenze 2014/2024** non ancora rappresentate | 🟡 | |
| 6 | **QR code** per link o codice stanza | 🟡 | Da valutare come generarlo senza aggiungere dipendenze |
| 7 | **Ridurre il bundle** | 🟡 Manutenzione | Oggi **953 kB** prima di gzip (286 kB gzip): caricare su richiesta le parti non necessarie all'avvio |
| 8 | **Spezzare `App.jsx`** | 🟡 Manutenzione | 8600 righe. Gradualmente, a comportamento invariato |
| 9 | **ESLint e formattazione automatica** | 🟢 | |
| 10 | **Test su oggetti con utilizzi, aggiornamento PWA, coda dei salvataggi cloud** | 🟢 | |

**Da non iniziare senza richiesta esplicita:** "Tavolo dal vivo" (combat tracker
condiviso in tempo reale). Richiederebbe anche una nuova rotta sul Worker,
quindi un altro deploy manuale.

## Documentazione del repository

| File | Contiene |
|---|---|
| **[docs/CONTINUA-QUI.md](docs/CONTINUA-QUI.md)** | 📌 Stato reale, cosa è pubblicato, cosa è aperto, come lavora l'utente. **Fonte unica del backlog** |
| **[CLAUDE.md](CLAUDE.md)** | Convenzioni di sviluppo, regole di dominio D&D, lavoro multi-agente |
| [CHANGELOG.md](CHANGELOG.md) | Storico delle versioni |
| [worker/LEGGIMI.md](worker/LEGGIMI.md) | Attivazione del Worker: import PDF, Archivio DM, stanze, sincronizzazione |
| [docs/CONDIVISIONE-STANZE.md](docs/CONDIVISIONE-STANZE.md) | Perché le stanze sono snapshot immutabili: sicurezza e ciclo di vita |
| [docs/PROMPT-MODIFICHE.md](docs/PROMPT-MODIFICHE.md) | Modifiche applicate da mantenere (ordinamenti, tema Montagna, audio) |
| [docs/RELEASE.md](docs/RELEASE.md) | Checklist di rilascio manuale |

---

Licenza [MIT](LICENSE.md).
