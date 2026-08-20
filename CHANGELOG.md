# Changelog

Formato ispirato a [Keep a Changelog](https://keepachangelog.com/it/1.1.0/).

Versione corrente: **3.5.2**. Il numero vive in `APP_VERSION` (`src/App.jsx`) e
va alzato **a ogni modifica visibile**: è ciò che permette di capire se il sito
ha davvero ricevuto l'aggiornamento.

> Il backlog e lo stato reale del progetto non stanno qui: sono in
> **[docs/CONTINUA-QUI.md](docs/CONTINUA-QUI.md)**.

## [Non rilasciato]

### Modificato
- README riscritto e corretto: descriveva un backend Express (`server/index.js`)
  e un `npm run dev` con `concurrently` che **non esistono più** nel progetto, e
  chiedeva di copiare un `.env.example` assente. Ora documenta l'architettura
  reale (frontend puro, Worker Cloudflare per le funzioni online), l'elenco
  completo delle funzioni, dove si salvano i dati, i tre meccanismi di
  condivisione, test/build/deploy e la roadmap.
- Changelog riorganizzato con lo storico reale delle versioni 2.x → 3.5.2.
- `CLAUDE.md`: corretta la sezione **Stack**, che indicava lo stesso backend
  Express inesistente.
- `docs/CONTINUA-QUI.md`: allineati i conteggi dei test (erano indicati sia 87
  sia 145) e la dimensione del bundle (887 kB / ~940 kB → **953 kB** misurati);
  tolte dalla roadmap aperta quattro voci in realtà già pubblicate.

---

## [3.5.2]
### Corretto
- La nuvoletta "Bonus dato da" veniva **tagliata** dal riquadro della
  caratteristica (`overflow: hidden`). Ora è montata su `document.body` con
  `createPortal`.

## [3.5.1]
### Corretto
- La stessa nuvoletta era di fatto **invisibile in tema scuro** (contrasto 1.02)
  e poteva sbordare su schermo stretto.

> Le due correzioni sopra sono lo stesso sintomo segnalato tre volte
> dall'utente, ma erano **due difetti diversi**, visibili solo alla larghezza
> del telefono e in tema scuro. Vedi la nota in `docs/CONTINUA-QUI.md`.

## [3.5.0]
### Aggiunto
- **Effetti meccanici delle condizioni**, con riepilogo di cosa comportano
  quando se ne accumulano più di una.

## [3.4.0]
### Aggiunto
- **Diario di sessione** per personaggio, con voci datate.

## [3.3.0]
### Aggiunto
- **Fonte di Magia**: conversione slot incantesimo ↔ Punti Stregoneria per lo
  Stregone.

## [3.2.0]
### Corretto
- **Fix serio:** il riposo *ricarica* le risorse di classe invece di azzerarle.
  Ira, Punti Stregoneria e Ki restavano a 0 dopo un riposo lungo.

## [3.1.0]
### Aggiunto
- **Stampa / Salva PDF** della scheda (`@media print`, pulsante nel Menu).

## [3.0.0]
### Modificato
- **Archivio DM raggruppato**: un personaggio per riga invece di una copia per
  dispositivo o re-import, con "▼ mostra N copie precedenti". Nessuna
  cancellazione.
- Passaggio alla serie **3.x**: dopo la 2.99.0 la numerazione era arrivata a
  "2.100.0", che si legge male.

## [2.100.0]
### Aggiunto
- **Sincronizzazione tra dispositivi tramite codice** a 10 caratteri, senza
  token GitHub (rotta Worker `/sync`, `src/utils/sync.js`, 10 test).

### Corretto
- Il salvataggio cloud non sovrascrive più alla cieca quando non riesce a
  verificare lo stato remoto: era il motivo per cui un ritratto caricato da un
  altro dispositivo poteva sparire.
- Popover "Bonus dato da" con sfondo opaco.
- In tema chiaro lo sfondo non si tinge più del colore di classe (risultava
  slavato con le tinte calde: Stregone, Barbaro).

## [2.9x] — creazione, controlli e multiclasse
### Aggiunto
- **Creazione guidata**: sottoclasse anche per la classe secondaria del
  multiclasse; maestria/expertise, talenti e multiclasse; aumenti di
  caratteristica; creazione a livello alto con incantesimi, PE e oro.
- **Controllo scheda**: pannello di suggerimenti su tiri salvezza e competenze
  mancanti o senza fonte.
- **Terzi incantatori**: Cavaliere Mistico e Mistificatore Arcano.
- **Dadi vita multiclasse**: una riga per classe.
- Inventario con **sintonia** ed effetti meccanici degli oggetti (bonus a CA e
  tiri salvezza, punteggi impostati da oggetti magici), oggetti a **utilizzi**
  con cariche e ricariche, Perla del Potere.
- Campo **Punti Esperienza** nel Profilo.
- **Condivisione tramite codice stanza**, senza account né token GitHub, con
  snapshot immutabili, scadenza, validazione e rate limiting sul Worker.
- Catalogo completo degli incantesimi per le classi che li preparano, coi
  preparati stellinati e in cima a ogni livello.
- **Pagina di recupero PWA** che rimuove solo service worker e cache obsolete,
  preservando personaggi e immagini locali.

### Corretto
- Aggiornamenti PWA: risolto il ciclo infinito, una sola attivazione per build,
  protezione anti-loop, timeout Safari e un unico banner di stato.
- Caricamento cloud e IndexedDB con timeout: su Safari un servizio non
  responsivo non lascia più la scheda bloccata sull'overlay.
- Maestria non più persa all'import; CA errata sulle Corazze a Piastre;
  Morsa del Gelo classificata come trucchetto a tiro salvezza; le cure non sono
  più trattate come attacchi.
- Attivare il backup cloud su un nuovo dispositivo carica quello esistente
  invece di crearne uno vuoto.

### Modificato
- Rifinitura estetica: versione nel titolo, pulsanti superiori uniformi,
  pannelli con gerarchia più netta, inventario mobile a schede compatte senza
  scorrimento orizzontale, titoli delle sezioni centrati.
- Profilo, risorse di classe, ritratto e disposizione mobile più compatti.
- Pannello Monete ridisegnato: conversione e riepilogo allineati ai due lati,
  moneta d'oro CSS al posto dell'emoji.
- Menu "Ambientazione" diventa **Luogo**; preset "Classica" rimosso; luoghi
  rinominati in "Mare" e "Pioggia"; bagliore del tema giorno attenuato.
- Il pin della mappa salva la posizione anche quando Safari mobile interrompe il
  trascinamento.
- Addestramento nelle armi in riquadri separati; menu testuali e inventario in
  ordine alfabetico.

## [2.8x] — regole, temi e infrastruttura
### Aggiunto
- Interfaccia **italiana e inglese** con tasto ITA/ENG.
- **Regole 5.0 (2014)**: bonus di caratteristica dalla razza, privilegi e
  descrizioni per edizione, tratti di specie completi.
- Maestria nelle armi; risorse di classe per edizione; Recupero Arcano del Mago.
- Tema **Montagna** con variante giorno/notte, sfondi e audio dedicati.
- Licenza MIT, template GitHub per issue e PR, runbook di rilascio in
  `docs/RELEASE.md`, note di sviluppo spostate in `docs/`.

### Corretto
- Deploy: i controlli di una PR non annullano più il deploy di `main` (con il
  gruppo di concorrenza unico la versione online restava indietro).
- Audio Città: file corretto e ricompresso, non più il loop sbagliato di
  riserva.

---

## Da automatizzare quando il permesso `workflow` sarà attivo
- Workflow `test.yml` separato dal deploy.
- Generazione del changelog da commit/PR.
- Release GitHub con artifact della build PWA (`dist`).
