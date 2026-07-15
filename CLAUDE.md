# Scheda Interattiva — contesto per lo sviluppo

Scheda D&D 5e interattiva con tiratore di dadi integrato (nome storico del
repo: tavolo-dei-dadi; il nome utente-visibile dell'app è "Scheda
Interattiva"). Layout ispirato alla scheda ufficiale D&D 2024 italiana.
Tema chiaro "foglio di carta" (bianco), pulsanti dei dadi colorati per tipo
(`COLORE_DADO`). Deve funzionare bene sia su desktop sia su mobile touch
(doppio tap = doppio click grazie a `touch-action: manipulation`; grid che
collassa a una colonna sotto 820px; input ≥16px su mobile per evitare lo
zoom di iOS).

**Tema dinamico:** le variabili CSS del tema vengono ricostruite in JS da
`BASE_TEMA` così da poterle tingere in base alla **classe** del personaggio
(`CLASSI` → `coloreClasse`, variante chiara e scura; `mescola` tinge sfondo,
pannelli e bordi). Il selettore Auto/Chiaro/Scuro: in **Auto** il tema è
scuro se è **notte** (`eNotte`, 20:00–06:59) **oppure** se il sistema è in
modalità scura (`matchMedia`); si aggiorna al cambio di sistema e ogni 5
minuti per la fascia oraria. Chiaro/Scuro forzano il modo.

## Stack

- **Frontend:** React 18 + Vite. Tutta la UI vive in `src/App.jsx`: la scheda
  interattiva È l'interfaccia (formato della scheda ufficiale D&D 2024), con la
  barra del tiro sticky in alto. Componenti principali: `App`, `Editable`
  (1 click = modifica inline, doppio click = tiro se `onRoll` è definito),
  `Rollable` (solo doppio click = tiro). Stili inline nell'oggetto `styles`
  con la palette `C`. Niente CSS framework, niente TypeScript.
- **Backend:** Express (`server/index.js`) su porta 3001, fa solo da proxy
  all'API Anthropic per la trascrizione delle schede PDF
  (`POST /api/transcribe`). Richiede `ANTHROPIC_API_KEY` (file `.env`).
- **Dev:** `npm run dev` avvia Vite (5173, con proxy `/api` → 3001) e il server
  insieme via concurrently.
- **Persistenza:** `localStorage` tramite `loadState`/`saveState` in
  `src/App.jsx`. Il formato è un **roster multi-personaggio**
  `{ attivo, personaggi: {id: scheda} }` (chiave `scheda-interattiva:v1`,
  con migrazione automatica dalla vecchia chiave a scheda singola).
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

## Convenzioni

- **Interfaccia e testi SEMPRE in italiano** (etichette, messaggi di errore,
  commenti inclusi).
- Mantieni lo stile grafico esistente: palette `C`, oggetto `styles`,
  animazione del d20 (`d20-spin` / `d20-settle` in `KEYFRAMES`).
- Nomi di funzioni e variabili in italiano dove naturale (coerenza col resto
  del file).
- Il modello dell'attacco è `{ id, nome, bonus, danno }` — `danno` è una
  stringa di espressione di dado, vuota se non impostata. `normalizeImported`
  e lo schema del `PROMPT` nel server devono restare allineati a questo
  modello.
- Non fare refactor non richiesti.

## Densità e sezioni descrittive

- `Sezione` è un pannello collassabile (`<details>/<summary>`, freccia ▾/▸
  animata, `.sezione` in CSS). Le sezioni descrittive (privilegi, talenti,
  addestramento, equipaggiamento, aspetto/storia, import/export) sono
  collassabili; alcune partono chiuse (`aperto={false}`) per compattezza.
- `AreaTesto` cresce con il contenuto (auto-resize su `scrollHeight`, niente
  altezza fissa né spazio morto).

## Roster e reset

- `nuovoPersonaggio`/`duplicaPersonaggio`/`eliminaPersonaggio` gestiscono il
  roster; `resetScheda` azzera il PG attivo (torna a `schedaVuota`) senza
  toglierlo dalla lista. Import PDF/JSON creano sempre un nuovo personaggio.
- Esempio precaricato: `ESEMPIO_GNOMO` (Boddynock, gnomo mago liv. 10).

## PWA

L'app è una PWA installabile e offline (vite-plugin-pwa, `registerType:
'autoUpdate'`): manifest e service worker sono generati alla build; le
richieste `/api` sono escluse dalla cache. Icone in `public/icona-*.png`.

## TODO futuri (non farli senza richiesta esplicita)

- (lista vuota — proporre nuove idee all'utente prima di implementarle)
