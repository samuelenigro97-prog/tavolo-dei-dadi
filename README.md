# 🎲 Tavolo dei Dadi

Tiratore di dadi per D&D 5a edizione con scheda del personaggio integrata.

La scheda È l'interfaccia, nel formato della scheda ufficiale: **1 click
modifica un valore, doppio click tira il dado**.

- Tutti i tiri 5e: prove di caratteristica, tiri salvezza, 18 abilità (con
  competenza e maestria), iniziativa, attacchi e danni con dettaglio dei dadi
  (sul critico i dadi raddoppiano, il modificatore no), attacco con
  incantesimo (con CD calcolata), dadi vita, TS contro morte.
- Selettore Normale / Vantaggio / Svantaggio valido per ogni tiro di d20.
- Import automatico della scheda da PDF tramite l'API Anthropic, ed esempio
  precaricato (Flyora) per provare subito.
- La scheda è salvata in `localStorage`: resta sul tuo browser.

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
