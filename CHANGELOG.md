# Changelog

Formato ispirato a [Keep a Changelog](https://keepachangelog.com/it/1.1.0/).

## [4.4.0] – 2026-09-22

### Aggiunto
- **Effetti dello Sfinimento automatici sui tiri.** Prima il contatore Sfinimento
  mostrava solo un promemoria testuale nel 2014; ora applica davvero le regole,
  in `src/rules/scheda.js` (`effettiSfinimento`) e `src/rules/dadi.js`
  (`modalitaEffettiva`):
  - **5.5 (2024):** −2 ai tiri di d20 per livello (attacchi, prove, salvezze,
    iniziativa) e −1,5m di velocità per livello, entrambi applicati solo ai
    tiri/valori del personaggio (non a quelli di alleati o creature del
    bestiario, tirati con lo stesso pulsante ma per conto terzi).
  - **5.0 (2014):** soglie cumulative, come da Manuale del Giocatore — livello
    1 svantaggio alle prove di caratteristica (inclusa l'Iniziativa), livello
    2 velocità dimezzata, livello 3 svantaggio anche ad attacchi e tiri
    salvezza (compresi TS contro morte e di Concentrazione, incluso il
    vantaggio di Incantatore da Guerra: si annullano a vicenda, come da
    regola 5e), livello 4 PF massimi dimezzati, livello 5 velocità a 0.
  - Badge "Sfin." accanto a Velocità e PF Massimi quando l'effetto è attivo,
    sullo stesso modello dei badge dei Poteri personalizzati.
  - Il livello 6 (morte) resta segnalato solo a testo: non uccide il
    personaggio in automatico.

## [4.3.0] – 2026-09-21

### Corretto
- **Trucchetti/incantesimi già salvati non sparivano più.** Il filtro classe
  in cima alla sezione Incantesimi (`filtroClasseInc`) si applica in
  automatico alla classe del personaggio a ogni apertura/cambio scheda
  (`src/App.jsx`, `useEffect` righe ~4182). Se il catalogo (`src/data/incantesimi.js`)
  non elencava quella classe per un incantesimo già salvato, l'incantesimo
  spariva dalla lista pur restando conteggiato (es. Vaelion, Druido 10:
  contatore 4/4 Trucchetti ma solo 3 mostrati, mancava Morsa del Gelo). Il
  filtro ora si applica solo alle proposte del catalogo (`s.catalogo === true`),
  mai a un incantesimo già presente sul personaggio (`src/App.jsx:15406`).
- Aggiunta la classe Druido a Morsa del Gelo (Frostbite) nel catalogo
  (`src/data/incantesimi.js:23`): è un trucchetto Druido/Mago/Stregone/Warlock
  fin da Xanathar's Guide to Everything (5.0) ed è rimasto tale nel 5.5.
- Un riposo lungo ricaricava per errore qualunque risorsa con un `reset`
  diverso da vuoto, non solo `'breve'`/`'lungo'` (`risorseDopoRiposo`,
  `src/rules/regole.js`): correzione necessaria perché i contatori dei nuovi
  Poteri (reset `'manuale'`) restassero davvero manuali.

### Aggiunto
- **Nuova sottosezione "Poteri"** dentro "Privilegi, Tratti & Talenti": regole
  personalizzate del tavolo (patti, benedizioni, maledizioni...) non coperte
  da classi/talenti ufficiali. Modello dati per personaggio (`scheda.poteri`,
  vedi `src/rules/poteri.js`): un array di `{ id, nome, descrizione, attivo,
  contatori: [{ nome, attuali, max }], modificatori: [{ bersaglio, valore, fonte }] }`.
  - Una scheda per potere (`src/ui/PoteriSezione.jsx`) con chip per contatori
    e modificatori, descrizione, tasto "+" tratteggiato per aggiungere un
    effetto e clic sulla scheda per aprire dettagli/modifica (elimina, riordina).
  - Ogni contatore genera/aggiorna una voce in `scheda.risorse` con
    `reset: 'manuale'` (mai toccata da riposo breve/lungo), sincronizzata nei
    due sensi: un +/- fatto da "Risorse di Classe" si riflette sulla scheda
    del potere e viceversa (`sincronizzaRisorsePoteri`, `valoreContatore`).
  - I modificatori (bersagli: Velocità, CA, Iniziativa, PF Massimi) si sommano
    ai valori corrispondenti della scheda (`caTotale`, `calcolaMovimentoESalti`,
    `iniziativaTotale`, `pfMassimiEffettivi`) e mostrano la fonte con un badge
    accanto al valore; spariscono se il potere viene disattivato o eliminato.
  - Inclusi in export/import del roster, nella condivisione via link e nel
    codice stanza (nessun cambiamento richiesto: entrambi serializzano la
    scheda per intero); i personaggi esistenti restano invariati (`poteri`
    di default `[]`).
  - Potere di prova su Vaelion Leafwhisper: "Potere del Patrono" (contatore
    Debito 5, modificatore +3m Velocità con fonte "Maschera").

## [4.0.55] – 2026-09-03
### Aggiunto / Modificato (da v3.9.49)
- Toolbar a 3 blocchi, anagrafica proporzionale, diario in modale, Artefice/Warlock/Manuali, pozioni/movimento/reazioni/turn economy, audit D&D.
- Fix 4.0.55: rimosse emoticon da sesso/razza/taglia/allineamento e da Compagni/Famigli/Evocazioni, bordi uniformati su tutte le tendine (`src/ui/stili.js:53`), titolo Movimento/Salti dinamico 5.5/5e per PG (`src/App.jsx:8056`), combattimento solo incantesimi con danni+tiro/CD (`src/rules/regole.js:490`), monete tasti rinominati Converti in MR/MA / Converti in MP senza diamante (`src/i18n.js:469`).

## [4.0.53] – 2026-09-03 (allineamento a origin/main)
- Rebase 03/09: allineato locale (2 commit) su `origin/main` 9de633f, version bump a 4.0.55, docs allineati.

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
