# Test end-to-end (Playwright Test)

Un file per sezione della scheda, così quando si tocca una sezione è chiaro
quale file di test aggiornare.

```
npm run test:e2e        # gira tutta la suite in headless
npm run test:e2e:ui     # modalità interattiva (utile durante lo sviluppo)
npx playwright test e2e/azioni.spec.js   # un solo file
```

Non serve una build prima: `playwright.config.js` avvia da solo il server di
sviluppo Vite sulla porta 5199 (`webServer`) e lo riusa se è già in ascolto.

Ogni test parte da `apriScheda()` (`e2e/helpers.js`): apertura pagina,
chiusura del modal di benvenuto e del Menu Iniziale. Il localStorage è vuoto
a ogni test (isolamento di default di Playwright), quindi l'app carica il PG
di esempio "Vaelion (Val) Leafwhisper" — un Druido Elfo dei Boschi con
Randello Incantato, Forma Selvatica, un Potere homebrew ("Potere del
Patrono") e Metamorfosi in lista incantesimi. I test contano su questo
personaggio specifico: se `src/data/esempi.js` cambia, alcuni test vanno
aggiornati di conseguenza.

Nota su `locator('div').filter({ hasText: ... })`: include anche tutti gli
elementi antenati (che "contengono" il testo per via dei discendenti), non
solo l'elemento più specifico. In document order gli antenati vengono prima
dei loro figli, quindi il div più specifico è tipicamente l'ULTIMO risultato
(`.last()`), non il primo — a meno che dentro ci sia un div ancora più
annidato che soddisfa lo stesso filtro (vedi `incantesimi.spec.js` per un
caso in cui serve un filtro doppio invece del solo `.last()`).
