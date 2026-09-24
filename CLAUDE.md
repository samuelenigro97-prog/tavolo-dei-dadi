# Tavolo dei Dadi — contesto per lo sviluppo

Scheda D&D 5e interattiva con tiratore di dadi integrato. Nome pubblico e
nome del repo: **Tavolo dei Dadi** (alcune chiavi tecniche storiche usano
ancora "scheda-interattiva", es. `STORAGE_KEY = 'scheda-interattiva:v1'`: è
solo compatibilità dati, non rinominarle). Layout ispirato alla scheda
ufficiale D&D 2024 italiana. **Tema "vecchio manuale"**: parchment/vintage sia
in chiaro (`#f4f1ea`, inchiostro scuro, oro) sia in scuro (`#171310`, quasi
nero, oro chiaro) — non è un tema "foglio bianco", è pensato per sembrare un
manuale d'epoca in entrambe le modalità (`BASE_TEMA` in `src/ui/tema.js`).
Deve funzionare bene sia su desktop sia su mobile touch (doppio tap = doppio
click grazie a `touch-action: manipulation`; grid che collassa a una colonna
sotto 820px; input ≥16px su mobile per evitare lo zoom di iOS).

**Tema dinamico:** le variabili CSS del tema vengono ricostruite in JS da
`BASE_TEMA` così da poterle tingere in base alla **classe** del personaggio
(`CLASSI` → `coloreClasse`, variante chiara e scura; `mescola` tinge sfondo,
pannelli e bordi). `PRESET_COLORI` (in `src/ui/tema.js`) aggiunge dei "Luoghi"
opzionali (Taverna, Mare, Montagna, ecc.): ognuno è un'ambientazione completa
(palette + audio + sfondo atmosferico). Lo **sfondo della pagina**
(`document.body.style.background`) segue il preset attivo (app trasparente
sopra).

**Versione delle regole:** toggle 5.5 (2024, default) / 5.0 (2014) in alto a
sinistra e nel menu (`regoleVersione`, in `localStorage`). Incide sullo
**sfinimento**: nella 2024 `−2 × livello` ai d20 (in `lanciaD20`), nella 2014
nessuna penalità fissa ma si mostra l'effetto del livello (`SFINIMENTO_2014`).
Il selettore Auto/Chiaro/Scuro: in **Auto** il tema è scuro se è **notte**
(`eNotte`, 20:00–06:59) **oppure** se il sistema è in modalità scura
(`matchMedia`); si aggiorna al cambio di sistema e ogni 5 minuti per la fascia
oraria. Chiaro/Scuro forzano il modo.

## Stack

- **Frontend:** React 18 + Vite, niente TypeScript, niente CSS framework.
  `src/App.jsx` (~21.000 righe) resta il cuore della UI e dello stato (`App`,
  `Editable`, `Rollable`, quasi tutte le sezioni della scheda), ma una parte
  crescente è già stata estratta in moduli:
  - `src/ui/` — componenti condivisi (`componenti.jsx`: `Editable`, `Sezione`,
    tendine…), `stili.js` (CSS globale iniettato), `tema.js` (`C`, `BASE_TEMA`,
    `PRESET_COLORI`, `COLORE_DADO`), `PoteriSezione.jsx`, `CompendioModal.jsx`.
  - `src/rules/` — logica di regole pura: `scheda.js`, `regole.js`,
    `poteri.js` (modificatori homebrew), `dadi.js`.
  - `src/data/` — dati di gioco e testi: `dati5e.js`, `incantesimi.js`,
    `bestiario.js`, `condizioni.js`, `spiegazioni.js`/`.en.js`, `novita.js`
    (changelog in-app), `esempi.js`, `migrazioniPersonaggi.js`.
  - `src/dati/` — contenuti delle espansioni Tasha/Xanathar (talenti,
    sottoclassi, incantesimi, tratti opzionali).
  - `src/utils/` — `persistenza.js`, `sync.js`, `stanze.js`,
    `condivisione.js`, `audioAmbiente.js`, `popover.js`.
  - `src/i18n.js` — dizionario IT/EN (`t()`, funzione a livello di modulo,
    chiamabile ovunque; la variabile di stato `lingua` invece vive dentro
    `App` e **non** è automaticamente visibile nei componenti definiti fuori
    da `App` — vanno passata come prop se serve).
  - Nuovi refactor benvenuti purché **non richiesti come effetto
    collaterale** di un altro task: se estrai qualcosa da `App.jsx`, fallo
    come task a sé (vedi §"Backlog", punto "Spezzare App.jsx").
- **Backend:** **non esiste** un server Express locale. L'unica funzione
  server-side è la trascrizione PDF→JSON di una scheda importata, servita da
  un **Cloudflare Worker** (`worker/transcribe-worker.js`, vedi
  `worker/LEGGIMI.md`). Il client chiama un endpoint **configurabile**:
  `transcribeUrl` in `localStorage` (`scheda-interattiva:transcribe-url`) o
  `VITE_TRANSCRIBE_URL`, senza fallback locale (il progetto è a sola build
  statica: GitHub Pages). Lo **schema del PROMPT** nel Worker deve restare
  allineato a `normalizeImported`.
- **Dev:** `npm run dev` avvia solo Vite (porta 5173). Non esiste più
  `concurrently` né un secondo processo server da avviare.
- **Persistenza:** `localStorage` tramite `loadState`/`saveState` in
  `src/App.jsx`. Il formato è un **roster multi-personaggio**
  `{ attivo, personaggi: {id: scheda} }` (chiave `scheda-interattiva:v1`, con
  migrazione automatica dalla vecchia chiave a scheda singola).
  **Non modificare** la logica di `transcribePdf`; toccare
  `loadState`/`saveState` solo preservando la retrocompatibilità dei dati
  salvati.

## Interazione (convenzione centrale della UI)

- **1 click** su un valore = modifica inline (componente `Editable`).
- **Tieni premuto e rilascia** (stile Fantasy Grounds) su un elemento
  tirabile = tiro del dado: dopo ~280 ms l'elemento "si carica" (classe CSS
  `carica`, trema), al rilascio parte il tiro. Implementato in `Rollable`
  (anche `as="div"` per le righe abilità) e in `Editable` quando ha `onRoll`.
- **Doppio click/doppio tap** = stessa cosa, come scorciatoia:
  prove di caratteristica, tiri salvezza, abilità, attacchi (nome/bonus),
  danni (cella danno = solo danni, mai critico), iniziativa, attacco con
  incantesimo, dadi vita (guarigione), TS contro morte.
- Click sul **pallino** = ciclo competenza: abilità 0 → 1 (competenza) → 2
  (maestria) → 0; tiri salvezza on/off.
- **Dado libero**: pannello sotto la barra del tiro con d4–d100 (1 click) e
  campo espressione libera (es. `3d6+2`); il d20 libero passa dal tiro
  animato e rispetta vantaggio/svantaggio.
- Selettore **Normale / Vantaggio / Svantaggio** nella barra del tiro: vale
  per tutti i tiri di d20 (2d20, tieni il migliore/peggiore).

## Regole di dominio D&D 5e

- Modificatore di caratteristica: `floor((punteggio − 10) / 2)`.
- Abilità: `mod caratteristica + livello competenza × bonus competenza`
  (livello 0/1/2, dove 2 = maestria). Tiro salvezza: `mod + bonus competenza`
  se competente. Percezione passiva: `10 + bonus Percezione` (calcolata).
- Iniziativa: `mod Destrezza`. CD incantesimi: `8 + competenza + mod
  incantatore`; attacco con incantesimo: `competenza + mod incantatore`.
- TS contro morte: d20 secco; ≥10 successo, <10 fallimento, 1 naturale = 2
  fallimenti, 20 naturale = torni a 1 PF; 3 successi = stabile, 3 fallimenti
  = morte.
- Dado vita (guarigione): 1 dado del tipo indicato + mod Costituzione.
- Tiro per colpire: `d20 + bonus`. Un **20 naturale è un critico**, un 1
  naturale è un fallimento critico (il totale non conta MAI: si guarda solo
  la faccia del dado, `tiro.naturale`).
- CA da equipaggiamento (`caTotale`): manuale = campo `ca`; nessuna 10+DES;
  leggera base+DES; media base+min(DES,2); pesante base fissa; scudo +2,
  più bonus. Dadi vita: il numero è sempre pari al `livello` (si aggiorna
  da solo), il tipo (`facceDadoVita`) si sceglie a parte; espressione da
  `esprDadiVita(livello, facce)`. Bonus competenza suggerito da
  `bonusCompetenzaDaLivello` (affordance "auto"). Riposo lungo: PF al massimo,
  slot recuperati, metà dadi vita (min 1), risorse (breve+lungo) ricaricate,
  −1 sfinimento. Riposo breve: ricarica le risorse "brevi" e spende un dado
  vita. Il dado vita speso applica la guarigione ai PF e incrementa
  `dadiVitaSpesi`. **Sfinimento** (0–6, regole 2024): `−2 × livello` a ogni
  tiro di d20, applicato in `lanciaD20`. **Risorse di classe** (`risorse`):
  contatori con reset a riposo breve/lungo. **Concentrazione**, **resistenze**
  e **sensi** sono campi liberi. Condizioni 5e come chip toggle; storico
  ultimi 30 tiri in memoria (non persistito).
- **Critico sui danni:** raddoppiano SOLO i dadi dell'espressione di danno
  (es. `2d6+3` → `4d6+3`); i modificatori fissi NON si raddoppiano.
- Espressioni di danno: formato `NdM±K` con più termini sommati
  (es. `1d10+1d6+2`). Il parser (`parseEspressioneDado`) non deve mai lanciare
  eccezioni: input non valido → `null`.
- Il danno totale non scende mai sotto 0.
- **Poteri homebrew** (`src/rules/poteri.js`, sezione "Poteri" in UI): un
  potere può modificare velocità/CA/iniziativa/PF massimi oppure un
  **bersaglio libero personalizzato** (`BERSAGLIO_LIBERO = 'altro'`, campo
  `bersaglioLibero`) per qualunque altro valore testuale — è l'unica parte
  della scheda pensata esplicitamente per regole non ufficiali.

## Convenzioni

- **Interfaccia e testi SEMPRE in italiano** (etichette, messaggi di errore,
  commenti inclusi). Le stringhe inglesi vivono solo nel dizionario `t()`.
- Mantieni lo stile grafico esistente: palette `C`, oggetto `styles`,
  animazione del d20 (`d20-spin` / `d20-settle` in `KEYFRAMES`).
- Nomi di funzioni e variabili in italiano dove naturale (coerenza col resto
  del file).
- Il modello dell'attacco è `{ id, nome, bonus, danno }` — `danno` è una
  stringa di espressione di dado, vuota se non impostata. `normalizeImported`
  e lo schema del `PROMPT` del Worker devono restare allineati a questo
  modello.
- Non fare refactor non richiesti.
- **Densità delle righe/pannelli — pattern "Altre opzioni"/"⋯"**: quando una
  riga o una sezione ha azioni usate raramente (es. azioni avanzate in
  Azioni, icone di container/effetto/utilizzi in Equipaggiamento quando
  l'oggetto non le usa), nascondile dietro un toggle a comparsa invece di
  mostrarle sempre. Non applicarlo dove le azioni sono già condizionali per
  natura (es. i bottoni extra nelle righe di Incantesimi compaiono solo se
  l'incantesimo li usa davvero: non serve un ulteriore livello di
  compressione lì).
- Bottoni a **sola icona** (es. ✕ chiudi/rimuovi): devono avere sia `title`
  (tooltip mouse) sia `aria-label` (screen reader) — non bastano le emoji da
  sole. Attenzione allo scope di `lingua` (vedi sopra) quando il bottone è in
  un componente che non riceve `lingua` come prop: usa una stringa italiana
  fissa in quel caso, non un riferimento a `lingua` che non esiste lì.

## Densità e sezioni descrittive

- `Sezione` (`src/ui/componenti.jsx`) è un pannello collassabile
  (`<details>/<summary>`, freccia ▾/▸ animata, classe CSS `.sezione`). Le
  sezioni descrittive (privilegi, talenti, addestramento, equipaggiamento,
  aspetto/storia, import/export) sono collassabili; alcune partono chiuse
  (`aperto={false}`) per compattezza.
  - **Angoli decorati**: sono resi come **sibling dopo `</details>`**, non
    come figli — un `<details>` chiuso calcola male il containing block per
    figli `position:absolute` (bug di rendering, non di CSS logico): se li
    rimetti dentro il `<details>`, torneranno a posizionarsi male da chiusi
    anche se "visibili". Il selettore CSS è quindi `.sezione:hover ~
    .angolo-ornamento` (sibling), non discendente.
- Le sezioni sono **riordinabili via drag** (maniglia ⠿ nel titolo,
  `manigliaProps`/`iniziaTrascinamento`): l'ordine è gestito con il CSS
  `order` su una colonna flex (nessun JSX spostato), stato `ordineSezioni`
  persistito in `localStorage` (`scheda-interattiva:ordine-sezioni`).
  Le sezioni combattimento/incantesimi restano fisse in alto (`order` −2/−1).
- Scegliere il **background** imposta le competenze nelle abilità
  (`BACKGROUND_COMPETENZE` → `abilitaConBackground`); la **classe** imposta la
  caratteristica da incantatore; classe/specie generano un **avatar** SVG
  (`generaAvatar`, solo se non c'è una foto caricata: `ritrattoAuto`).
- La riga dei personaggi in alto è un `select` (il "riquadro" col nome, per
  cambiare PG al volo) con pulsante ✎ per rinominare; niente nome duplicato.
- I campi anagrafica sono menù a tendina (`CampoTendina`, con "Altro…");
  resistenze/sensi usano `CampoConTendina` (testo libero + "＋" da lista);
  le condizioni sono chip removibili + tendina, sulla stessa riga di sensi.
- `AreaTesto` cresce con il contenuto (auto-resize su `scrollHeight`, niente
  altezza fissa né spazio morto).
- Un `NuvolettaGlobale` (tooltip generico) intercetta globalmente
  `[title]`/`[data-app-tooltip]`: si apre sopra o sotto a seconda dello
  spazio disponibile (soglia `rect.top < 90`), con classi CSS separate
  `.nuvoletta-tooltip--top`/`--bottom` (keyframe distinti per evitare che
  l'animazione sovrascriva la posizione calcolata inline).

## Roster e reset

- `nuovoPersonaggio`/`duplicaPersonaggio`/`eliminaPersonaggio` gestiscono il
  roster; `resetScheda` azzera il PG attivo (torna a `schedaVuota`) senza
  toglierlo dalla lista. Import PDF/JSON creano sempre un nuovo personaggio.
- **Roster precaricato** (`rosterPredefinito`, quando `localStorage` è
  vuoto): quattro personaggi d'esempio già completi — **Vaelion Leafwhisper**
  (elfo dei boschi, Druido — attivo di default), **Wendell**, **Flyora**,
  **Elevorn**. I dati vengono da `VAELION_JSON`/`WENDELL_JSON`/`FLYORA_JSON`/
  `ELEVORN_JSON`. I test (unitari ed e2e) assumono **Vaelion attivo** e i
  suoi dati specifici (es. il trucchetto "Randello Incantato", il potere
  homebrew "Potere del Patrono", l'incantesimo Metamorfosi conosciuto, la
  risorsa "Forma Selvatica") — se cambi questo roster o i dati di Vaelion,
  aspettati di dover aggiornare più test in `e2e/`.

## PWA

L'app è una PWA installabile e offline (vite-plugin-pwa, `registerType:
'autoUpdate'` con `skipWaiting`+`clientsClaim`+`cleanupOutdatedCaches`): la
nuova versione del service worker si attiva **subito** e prende il controllo
delle pagine aperte, così l'app si aggiorna da sola senza svuotare la cache a
mano. In più c'è un pulsante **🔄 Aggiorna** in testata (accanto al tema):
`forzaAggiornamento` deregistra i service worker, svuota tutte le cache e
ricarica con query cache-busting (soluzione "nucleare" per client bloccati su
una versione vecchia). Manifest e service worker sono generati alla build; le
richieste `/api` sono escluse dalla cache. Icone in `public/icona-*.png`.

Distribuzione attuale: solo **PWA via web** (GitHub Pages), non è pubblicata
su Google Play / Apple App Store. Portarla su uno store richiederebbe un
wrapper nativo (es. Trusted Web Activity su Android via Bubblewrap, o Capacitor
per iOS+Android) e non è stato ancora iniziato: valutarlo solo se l'utente lo
chiede esplicitamente, è un progetto a parte rispetto alle modifiche alla PWA.

## Test

- **Unitari**: `npm test` (Node test runner nativo, `test/**/*.test.mjs`).
  Coprono regole D&D, parser, i18n (parità IT/EN), audit dati (duplicati in
  talenti/incantesimi/privilegi), poteri homebrew, condivisione/stanze.
  Tenerli verdi **prima di ogni commit**.
- **End-to-end**: `npm run test:e2e` (Playwright, config in
  `playwright.config.js`, spec in `e2e/`, **un file per sezione della
  scheda** — vedi `e2e/README.md`). Girano contro il **dev server Vite**
  (porta 5199, avviato automaticamente dal config), non contro `dist/`.
  Dipendono tutti dal **roster precaricato di default** (localStorage vuoto,
  Vaelion attivo) — vedi sopra. `npm run test:e2e:ui` per il runner
  interattivo. Nota Playwright: `locator('div').filter({hasText})` include
  anche gli antenati che contengono quel testo, non solo l'elemento più
  interno — spesso serve `.last()`, a volte un `.filter().filter()` in più
  se un discendente più interno ripete lo stesso testo.
- **Lint**: `npm run lint` (ESLint, `eslint-plugin-react`/`react-hooks`).
- Dopo una modifica al JSX, **build verde e test verdi non bastano** da soli
  contro errori runtime (es. un import mancante non rompe build/test ma
  rompe l'app): quando possibile, aprire davvero l'app (dev server o
  Playwright) e controllare che non ci siano `pageerror`.

## Versionamento e changelog

Per ogni modifica visibile all'utente: **workflow completo, in quest'ordine**:

1. Modifica → `npm run build` → `npm test` (unitari) → `npm run test:e2e`
   (se tocca UI) → verifica visiva.
2. Incrementa `APP_VERSION` in `src/App.jsx` (semver, es. `4.23.0` →
   `4.24.0`).
3. Aggiungi una voce in cima a `CHANGELOG.md` (nuova versione sempre in
   cima).
4. Aggiungi una voce bilingue (IT/EN) in cima a `src/data/novita.js` **solo
   per cambi visibili all'utente** (salta questo passaggio per release
   puramente di sviluppo/tooling, es. l'aggiunta della suite e2e).
5. Commit e push su `main`.

## Lavoro multi-agente

Il repo viene modificato da più agenti/sessioni (Claude Code e potenzialmente
altri strumenti). Per evitare conflitti:

1. **Sincronizza SEMPRE prima di lavorare**: `git fetch origin main` e
   allineati (`git pull` è configurato con `pull.rebase=true` +
   `rebase.autoStash=true`, quindi rebasa senza merge commit).
2. **Non lavorare in contemporanea** con l'altro agente sugli **stessi file**
   (tutta la UI è in `src/App.jsx`: è il punto più a rischio).
3. **Commit piccoli e push frequenti**: prima di ogni push rifai
   `git fetch` e, se il remote è avanzato, `git rebase origin/main`.
4. Se nasce un conflitto in `App.jsx`, risolverlo **preferendo le modifiche
   più recenti dell'altro agente** per la struttura/layout, reinnestando solo
   la propria logica (es. regole D&D) nei punti giusti.

Nessuna configurazione elimina i conflitti al 100% se due agenti editano le
**stesse righe** insieme: la garanzia è la disciplina di sync qui sopra.

## Backlog canonico

Il backlog non viene più duplicato in questo file: la fonte unica e
aggiornata è [`docs/BACKLOG.md`](docs/BACKLOG.md) (il file si intitola
"Continua qui" al suo interno). **Attenzione**: anche quel documento può
scollarsi dalla realtà tra una sessione e l'altra (es. riferimenti a un
deploy GitHub Pages, a numeri di versione o a un roster diversi da quelli
attuali) — verificare sempre nel codice prima di fidarsi ciecamente di una
sua affermazione datata, esattamente come per questo file.

Prima di iniziare una modifica, leggere lì le sezioni:

1. **Implementato localmente, non ancora pubblicato**;
2. **Implementato ma da riverificare sul sito reale**;
3. **Roadmap realmente aperta**.

Altri documenti in `docs/`: `CONDIVISIONE-STANZE.md` (design della
condivisione via codice stanza), `PROMPT-MODIFICHE.md` (storico richieste),
`RELEASE.md` (checklist di rilascio manuale).
