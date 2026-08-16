# Changelog

Formato ispirato a [Keep a Changelog](https://keepachangelog.com/it/1.1.0/).

## [Unreleased]

### Aggiunto
- Pagina di recupero PWA che rimuove soltanto service worker e cache obsolete, preservando personaggi e immagini locali.
- Inventario con sintonia ed effetti meccanici degli oggetti: bonus alla Classe Armatura e ai tiri salvezza, caratteristiche impostate e oggetti magici preconfigurati.
- Campo Punti Esperienza nel Profilo e gestione degli utilizzi/ricariche degli oggetti.
- Le classi preparatrici mostrano automaticamente tutti gli incantesimi di classe lanciabili; quelli preparati sono stellinati e ordinati per primi a ogni livello.
- Condivisione temporanea di una scheda tramite codice stanza, senza account o token GitHub.
- Endpoint Cloudflare Worker `/room` con snapshot immutabili, scadenza, validazione e rate limiting.
- Licenza MIT (`LICENSE.md`).
- Template GitHub per bug report, feature request e pull request.
- Note di sviluppo spostate in `docs/`.
- Runbook release manuale in `docs/RELEASE.md`.

### Modificato
- Aggiornamenti PWA automatici una sola volta per build, con protezione anti-loop, timeout Safari e un unico banner di stato.
- Rifinitura estetica 2.93: versione integrata nel titolo, pulsanti superiori uniformi, pannelli con gerarchia più netta e inventario mobile trasformato in schede compatte senza scorrimento orizzontale.
- Il caricamento cloud e IndexedDB ora hanno un timeout: su Safari un servizio non responsivo non può più lasciare la scheda bloccata sull'overlay.
- Corretto il ciclo infinito di aggiornamento PWA: la nuova versione viene segnalata senza ricaricare automaticamente e il comando manuale esegue una sola navigazione.
- Vaelion corretto come Druido del Circolo del Pastore; competenze nelle armi con iniziale maiuscola e immagini cloud riagganciate all’archivio locale prima della sincronizzazione.
- Addestramento nelle armi mostrato in riquadri separati; menu testuali e inventario ordinati alfabeticamente.
- Profilo, risorse di classe, ritratto e disposizione mobile resi più compatti e coerenti.
- Nel pannello Monete, conversione e riepilogo sono allineati rispettivamente a sinistra e a destra sopra le valute.
- Ridotto il bagliore chiaro sopra gli sfondi giorno/notte; i sottofondi partono direttamente dal tocco su iOS; nel menu Luogo le voci diventano “Mare” e “Pioggia”.
- Ridisegnato il pannello Monete: titolo coerente, conversione centrata e moneta d'oro al posto del diamante.
- Il pin della mappa salva automaticamente la posizione anche quando Safari mobile interrompe il trascinamento, mantenendola a ogni riapertura.
- Il menu "Ambientazione" diventa "Luogo", non mostra più il preset tecnico "Classica" e attenua il bagliore del tema giorno.
- Rimossa dalla repository la cartella `scratchpad/` già ignorata da `.gitignore`.

### Da automatizzare quando il permesso `workflow` sarà attivo
- Workflow `test.yml` separato da deploy.
- Generazione changelog da commit/PR.
- Release GitHub con artifact build PWA (`dist`).
