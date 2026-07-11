# Tavolo dei Dadi — contesto per lo sviluppo

Tiratore di dadi D&D 5e con scheda del personaggio integrata.

## Stack

- **Frontend:** React 18 + Vite. Tutta la UI vive in `src/App.jsx` (componenti
  `App`, `PlayTab`, `SheetTab`), stili inline nell'oggetto `styles` con la
  palette `C`. Niente CSS framework, niente TypeScript.
- **Backend:** Express (`server/index.js`) su porta 3001, fa solo da proxy
  all'API Anthropic per la trascrizione delle schede PDF
  (`POST /api/transcribe`). Richiede `ANTHROPIC_API_KEY` (file `.env`).
- **Dev:** `npm run dev` avvia Vite (5173, con proxy `/api` → 3001) e il server
  insieme via concurrently.
- **Persistenza:** `localStorage` tramite `loadState`/`saveState` in
  `src/App.jsx`. **Non modificare** `loadState`, `saveState` né la logica di
  `transcribePdf`.

## Regole di dominio D&D 5e

- Modificatore di caratteristica: `floor((punteggio − 10) / 2)`.
- Tiro per colpire: `d20 + bonus`. Un **20 naturale è un critico**, un 1
  naturale è un fallimento critico (il totale non conta).
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

## TODO futuri (non farli senza richiesta esplicita)

- Selettore dado libero (d4, d6, d8, d10, d12, d100).
- Export/import della scheda in JSON.
- Versione PWA offline.
