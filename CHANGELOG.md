# Changelog

Formato ispirato a [Keep a Changelog](https://keepachangelog.com/it/1.1.0/).

## [4.12.0] – 2026-09-23

### Aggiunto
- **Creature raggruppate per GS nei popup Forma Selvatica/Metamorfosi.**
  Invece di un'unica griglia piatta, le creature disponibili sono ora in
  "cartelle" apribili per Grado di Sfida crescente (GS 0, GS 1/8, GS 1/4...),
  ciascuna con le creature in ordine alfabetico al suo interno — così puoi
  saltare direttamente al GS che ti interessa invece di scorrere tutto.

### Verificato
- **Copertura del catalogo creature**: per la Forma Selvatica il GS massimo
  raggiungibile è 6 (Circolo della Luna, livello 20) — il catalogo (GS 0-8)
  la copre interamente, nessuna lacuna. Per la Metamorfosi invece il limite
  è "GS ≤ livello del personaggio", quindi ai livelli 9+ le regole
  permetterebbero GS superiori a quelli presenti in catalogo (si ferma a
  GS 8, Tirannosauro Rex): un personaggio di alto livello non troverebbe
  nuove opzioni oltre il livello 8. Segnalato all'utente, in attesa di
  decidere se/quante creature di GS alto aggiungere.

## [4.11.0] – 2026-09-23

### Aggiunto
- **Bottone "🐾 Evoca" sugli incantesimi di evocazione.** Sulla riga di ogni
  incantesimo il cui nome richiama un'evocazione (Evoca/Evocare Animali,
  Evoca Elementale, Trova Destriero, Spiriti Guardiani, ecc.) compare ora un
  bottone che apre direttamente il catalogo "Evoca/Aggiungi Compagno" già
  esistente nella sezione Compagni, Famigli & Evocazioni — pre-filtrato sulla
  categoria giusta: "Bestie" per gli incantesimi tipo Evoca/Conjure Animali
  (dove scegli tra le creature normali, come per la Forma Selvatica), oppure
  "Evocazioni" per elementali/destrieri/spiriti specifici. Riusa la stessa
  logica/dati già presenti (nessun nuovo catalogo creato): un click in meno
  per passare dall'incantesimo alla scheda della creatura da evocare.

## [4.10.0] – 2026-09-23

### Modificato
- **Trasformazioni: da griglia sempre aperta a due popup separati.** La
  sezione "Trasformazioni" mostrava sempre in scheda l'intera griglia di
  40-60 creature (con un toggle per passare da Forma Selvatica a
  Metamorfosi), occupando molto spazio verticale anche quando non serviva.
  Ora la sezione è compatta: due soli bottoni, "🐾 Forma Selvatica" e
  "🔮 Metamorfosi", ciascuno con il conteggio delle creature disponibili.
  Cliccandone uno si apre un popup dedicato con la lista filtrata secondo
  le regole di quella specifica trasformazione (GS massimo, nuoto/volo per
  la Forma Selvatica; GS ≤ livello senza restrizioni per la Metamorfosi) —
  due "schede" indipendenti invece di una sola lista condivisa. Cliccare una
  creatura nel popup apre come prima il dettaglio con le statistiche e i
  bottoni per assumerla. Il banner "Forma Attiva" (quando una trasformazione
  è in corso) non è stato toccato: resta sempre visibile come prima.

## [4.9.0] – 2026-09-23

### Aggiunto
- **Note di Combattimento in categorie**: nella tabella Combattimento, invece
  di un unico blocco di testo, le note di attacchi/incantesimi mostrano ora
  piccoli tag separati per Gittata, Durata, Tiro Salvezza e Proprietà
  (Trucchetto/Magico/Versatile/Maestria) quando riconoscibili nel testo. Le
  Reazioni con Innesco/Effetto già strutturati (es. Assorbire Elementi, Totem
  Spirituale) li mostrano come due tag distinti invece che come testo unico.
  Il testo completo resta comunque visibile e modificabile come prima:
  è un riassunto visivo aggiuntivo, non sostituisce i dati esistenti.

### Corretto
- **Metamorfosi non raggiungibile dai Druidi**: il tab per sfogliare le
  creature di Metamorfosi (Polymorph) richiedeva Bardo/Stregone/Mago —
  escludeva il Druido, che invece ha Metamorfosi nella propria lista
  incantesimi. Un Druido non poteva mai vedere/scegliere creature oltre il
  limite GS della Forma Selvatica (es. Gorilla Gigante, Tirannosauro Rex),
  pur avendo i bottoni per usarle una volta aperto il dettaglio.
- **Contatore Forma Selvatica/Metamorfosi che non calava mai**: il bottone
  "Assumi Forma Selvatica" scalava un campo (`usi`) diverso da quello letto
  altrove nell'app (`attuali`), quindi il contatore in Risorse di Classe non
  si aggiornava mai cliccandolo. Corretto; ora se hai esaurito gli utilizzi
  il bottone si disabilita e si ingrigisce invece di restare cliccabile.
- **Elenco creature Forma Selvatica/Metamorfosi ora alfabetico** invece che
  per Grado di Sfida crescente.
- **Leggibilità campi Profilo**: Sesso e Specie/Razza potevano troncarsi
  (es. "Maschio" tagliato) nella colonna più stretta della riga anagrafica;
  ora usano lo stesso meccanismo "testo compatto" già in uso per Classe/
  Sottoclasse/Allineamento, più margini minimi di colonna garantiti.

### Modificato
- Tolta la parola "Assumi" dal bottone Forma Selvatica; tolto il bottone
  "Chiudi" dal modal di dettaglio creatura (restano il tasto ✕ in alto e il
  click fuori dal modal) a favore di più spazio per i due bottoni azione.
- Uniformato l'allineamento dei titoli di sotto-sezione (es. "Combattimento",
  "Reazioni", "Incantesimi") a sinistra, come le altre etichette dell'app,
  invece di alcuni centrati e altri a sinistra senza un criterio unico.

## [4.8.0] – 2026-09-23

### Modificato
- **Il tocco "vecchio manuale" (4.7.0) non è più un'Ambientazione a scelta:
  ora è fisso, sempre presente, indipendente dai colori/scena che scegli in
  Luogo → Ambientazione.** Rimossa la voce "📜 Vintage" dal menu Ambientazione
  (tornano ad essere 13 come prima). Al suo posto, su tutta l'app, sempre:
  titoli delle sezioni e intestazione in font Cinzel (autoospitato, offline
  come sempre), pannelli con texture carta leggerissima e doppio filetto
  interno, filetto oro doppio sotto la barra superiore — indipendentemente
  da quale Ambientazione/colore hai scelto. I colori restano personalizzabili
  come prima (Taverna, Dungeon, Tempio Arcano...): quella è "atmosfera",
  questa è l'identità fissa dell'app.

## [4.7.0] – 2026-09-22

### Aggiunto
- **Nuova Ambientazione "📜 Vintage"** (Luogo → Ambientazione): palette
  ispirata ai vecchi manuali italiani ed americani di D&D (pergamena
  invecchiata, rosso bordeaux, oro), con i titoli delle sezioni e l'intestazione
  dell'app in un font serif decorativo (Cinzel) invece del sans-serif di
  sistema. Il font è autoospitato (nessun CDN) e precacheato dal service
  worker, quindi resta disponibile offline come tutto il resto; l'accessibilità
  "lettura facilitata" continua a forzare i caratteri di sistema come prima,
  Vintage compreso. Nessun impatto sugli altri 13 preset: senza un font
  dedicato continuano a usare il font di sistema di sempre.

## [4.6.3] – 2026-09-22

### Corretto
- **"Forma Bestiale" e "Forma Selvatica" erano due nomi per la stessa cosa.**
  Il tasto/banner/modale di trasformazione del Druido diceva "Forma
  Bestiale", mentre la risorsa di classe generata automaticamente (usi per
  riposo breve) si chiama "Forma Selvatica" — il termine ufficiale del
  Manuale del Giocatore 2014. Chi non lo sapeva poteva aggiungere a mano una
  seconda risorsa "Forma Bestiale" pensando fosse un'abilità diversa,
  ritrovandosi due contatori scollegati per lo stesso privilegio. Uniformato
  tutto il testo visibile (tasto, banner, titolo modale illustrazione, testo
  alternativo immagine, tooltip taglia) su "Forma Selvatica"/"Wild Shape".
  Non tocca il nome del campo dati (`scheda.formaBestiale`) né le schede
  esistenti: se avevi già creato a mano una risorsa "Forma Bestiale"
  duplicata, resta lì finché non la elimini tu da Risorse di Classe.

## [4.6.2] – 2026-09-22

### Corretto
- **Coerenza delle sagome Forma Bestiale/Metamorfosi**: le 15 icone originali
  (Orso, Lupo, Aquila, Gufo, Ragno, Cinghiale, Serpente, Pantera, Coccodrillo,
  Squalo, Polpo, Alce, Dinosauro, Pipistrello, Tasso) erano in realtà forme
  generiche quasi identiche tra loro (un "pupazzo di neve" con due occhi),
  non vere icone — molto meno dettagliate delle 12 aggiunte in 4.6.1, quindi
  visivamente incoerenti se affiancate. Sostituite tutte con icone reali
  game-icons.net (stessa fonte, stesso stile), inclusi Coccodrillo e Squalo
  che prima non avevano mai avuto un'icona vera. In più, tre sagome erano
  scambiate per errore tra loro (Pipistrello/Tasso/Dinosauro): corretto.

## [4.6.1] – 2026-09-22

### Modificato
- **Illustrazioni Forma Bestiale/Metamorfosi: sagome vere invece di categorie
  riciclate.** La correzione precedente (4.6.0) rimappava una quindicina di
  creature senza icona dedicata sulla categoria esistente più vicina (es.
  Rana → sagoma coccodrillo, Elefante → sagoma cinghiale). Ora hanno una
  silhouette propria, presa da game-icons.net (CC BY 3.0, autori lorc,
  delapouite, skoll) come le altre: Rana/Rospo, Granchio, Millepiedi, Vespa,
  Scimmia/Gorilla, Capra, Rinoceronte, Elefante, Mammut, Triceratopo, Ratto,
  Cavallo/Pony.

## [4.6.0] – 2026-09-22

### Corretto
- **In Forma Bestiale/Metamorfosi ora si vedono tutte e sei le caratteristiche.**
  Prima il pannello mostrava solo quelle sostituite dalla forma (3 per la
  Forma Bestiale); ora mostra sempre tutte e sei, con quelle non sostituite
  ("Tua") in chiaro ma leggermente attenuate, così non serve scendere alla
  scheda per controllarle mentre si è trasformati.
- Il tasto per tornare alla forma normale si chiamava "Ritorna Umanoide": per
  un elfo o uno gnomo suonava strano. Ora è "Torna alla Forma Normale".
- Icone e illustrazioni generate mancavano per una quindicina di creature del
  catalogo (Rana/Rospo, Granchio, Millepiedi, Vespa, Scimmia/Gorilla, Capra,
  Rinoceronte, Elefante, Mammut, Triceratopo...): finivano tutte con la
  sagoma del lupo. Mappate sulla categoria esistente più vicina.

### Aggiunto
- **Sezione "Trasformazioni" con due liste separate.** Forma Bestiale e
  Metamorfosi hanno regole di Grado di Sfida diverse (la prima segue la
  tabella Forma Selvatica del Druido; la seconda, per Bardo/Stregone/Mago,
  segue "GS ≤ livello del personaggio", senza limiti di nuoto/volo): ora un
  interruttore 🐾 Forma Animale / 🔮 Metamorfosi mostra la lista giusta per
  ciascuna. Compare per il Druido (Forma Animale), per Bardo/Stregone/Mago
  (Metamorfosi con Polymorph in lista), o entrambi i tab se il personaggio è
  idoneo a entrambe.
- **Gorilla Gigante (GS 7) e Tirannosauro Rex (GS 8)** aggiunti al catalogo
  creature: erano gli unici assenti nella fascia alta, raggiungibile solo con
  la Metamorfosi (la tabella Forma Selvatica del Druido non arriva così in
  alto nel gioco normale).

## [4.5.0] – 2026-09-22

### Aggiunto
- **Metamorfosi** (l'incantesimo Polymorph), come nuova trasformazione a fianco
  della Forma Bestiale già esistente. Riusa lo stesso meccanismo affidabile
  della Forma Bestiale — sostituzione diretta delle statistiche via
  `trasformazioneAttiva()` (`src/rules/scheda.js`), non un livello di badge —
  ma con due differenze chiave dettate dalle regole 2014:
  - **Tutte e sei le caratteristiche** vengono sostituite, comprese quelle
    mentali (Forma Bestiale sostituisce solo For/Des/Cos, non Int/Sag/Car).
    Ogni calcolo derivato (prove, tiri salvezza, CD, CA, iniziativa) si
    aggiorna da solo perché tutti passano dalla stessa funzione
    `punteggioCaratteristica`.
  - Un pool di PF separato per la nuova forma, con lo stesso danno in
    eccesso che torna al personaggio quando scende a 0 (regola PHB), la
    stessa barra vita, lo stesso ritratto sostituibile (illustrazione
    ufficiale, upload o link) e lo stesso pannello statistiche/azioni/tratti
    della bestia già visti per la Forma Bestiale — includono già la
    sostituzione automatica dell'immagine in base alla forma assunta.
  - Attivabile dalla stessa scheda creatura del Bestiario/Compendio (nuovo
    tasto "🔮 Metamorfosi" accanto a "🐾 Assumi Forma Bestiale"): le due
    trasformazioni sono mutuamente esclusive, attivarne una disattiva l'altra.
  - Personaggi esistenti non cambiano: senza `scheda.metamorfosi` il
    personaggio si comporta esattamente come prima.

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
