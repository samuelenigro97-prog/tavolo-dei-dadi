# 🎲 Scheda Interattiva

Scheda del personaggio D&D 5e interattiva con tiratore di dadi integrato,
nel formato della scheda ufficiale 2024. Provala online:
<https://samuelenigro97-prog.github.io/tavolo-dei-dadi/>.

La scheda È l'interfaccia, nel formato della scheda ufficiale: **1 click
modifica un valore, doppio click tira il dado**.

- Tutti i tiri 5e: prove di caratteristica, tiri salvezza, 18 abilità (con
  competenza e maestria), iniziativa, attacchi e danni con dettaglio dei dadi
  (sul critico i dadi raddoppiano, il modificatore no), attacco con
  incantesimo (con CD calcolata), dadi vita, TS contro morte.
- Selettore Normale / Vantaggio / Svantaggio valido per ogni tiro di d20.
- Dado libero (d4–d100) ed espressioni a piacere tipo `3d6+2`.
- PWA installabile: dopo la prima visita funziona anche offline
  (tranne l'import PDF, che richiede il server).
- Import automatico della scheda da PDF tramite l'API Anthropic, ed esempio
  precaricato (Flyora) per provare subito.
- **Più personaggi**: selettore in alto con Nuovo / Duplica / Elimina; ogni
  PG si salva da solo in `localStorage` e lo riapri dal menu.
- Sezioni complete: slot incantesimo cliccabili, lista di trucchetti e
  incantesimi preparati, privilegi e tratti, talenti, equipaggiamento,
  lingue, denari, note.
- Ottimizzata per desktop e mobile touch (doppio tap = tiro).
- Con **Esporta/Importa JSON** porti una scheda su un altro dispositivo o ne
  tieni una copia.

## Avvio

```bash
npm install
cp .env.example .env   # inserisci la tua ANTHROPIC_API_KEY (serve solo per l'import PDF)
npm run dev
```

L'app è su <http://localhost:5173>; il server proxy per l'import PDF ascolta su
<http://localhost:3001>. Senza chiave API tutto funziona tranne l'import PDF.

## Stack

React 18 + Vite per il frontend (tutta la UI in `src/App.jsx`), Express in
`server/index.js` come proxy verso l'API Anthropic per la trascrizione dei PDF.

Per le convenzioni di sviluppo e le regole di dominio D&D vedi
[CLAUDE.md](./CLAUDE.md).
