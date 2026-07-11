# 🎲 Tavolo dei Dadi

Tiratore di dadi per D&D 5a edizione con scheda del personaggio integrata.

- **Gioco:** tira gli attacchi (d20 + bonus, con critico sul 20 naturale e
  fallimento sull'1), tira i danni con il dettaglio dei dadi (sul critico i
  dadi raddoppiano, il modificatore no) e fai prove di caratteristica.
- **Scheda:** dati base, caratteristiche ed editor degli attacchi (nome, bonus
  per colpire e stringa di danno tipo `2d6+3` o `1d10+1d6+2`), con import
  automatico da PDF tramite l'API Anthropic.
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
