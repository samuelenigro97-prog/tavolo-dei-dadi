# Continua qui — stato reale di Tavolo dei Dadi

Aggiornato il **20 agosto 2026**. Ultima versione pubblicata e verificata online: **v3.5.2**.
App: https://samuelenigro97-prog.github.io/tavolo-dei-dadi/

### Dove sta cosa

| Documento | Contiene |
|---|---|
| [`README.md`](../README.md) | Cos'è il progetto: funzioni, architettura, dove si salvano i dati, Worker, test/build/deploy |
| [`CLAUDE.md`](../CLAUDE.md) | Convenzioni di sviluppo e regole di dominio D&D |
| **questo file** | Stato reale, cosa è pubblicato, cosa è aperto, come lavora l'utente. **Fonte unica del backlog** |
| [`CHANGELOG.md`](../CHANGELOG.md) | Storico delle versioni |
| [`worker/LEGGIMI.md`](../worker/LEGGIMI.md) | Attivazione del Worker Cloudflare |

> Si lavora anche con altre IA sul repository. Prima di modificare o pubblicare:
> controllare branch, modifiche locali e ultimo `main`; non sovrascrivere lavoro
> non proprio e non far modificare `src/App.jsx` contemporaneamente.
>
> **Nota su questo ambiente sandbox**: il container di questa sessione ha
> ripristinato il working tree a uno snapshot vecchio **tre volte** (l'ultima
> fino alla v2.88.0),
> cancellando tutto il lavoro non ancora
> committato. Se ti succede: `git status --short` (per non perdere lavoro vero),
> poi `git fetch origin main -q && git checkout -B claude/profilo-grid-alignment-9wda3o origin/main -q`,
> quindi ricostruisci. **Committa e pusha appena hai qualcosa di coerente che
> passa i test**, non aspettare la fine dell'intera funzione: qui il `git push`
> diretto su questo branch ha anche restituito un 403 sporadico (non un vero
> conflitto) risolto ripetendo il push — se ricapita, riprova un paio di volte
> prima di sospettare un problema di permessi reale.

## Stato attuale: v3.5.2 su `main`

La sincronizzazione tramite codice è **pubblicata** (PR #62), insieme a tutto
quello che segue. Nessuna funzione è rimasta a metà.

> ⚠️ **Una cosa dipende ancora dall'utente**: il Worker su Cloudflare va
> **ripubblicato a mano dalla dashboard** perché la rotta `/sync` funzioni in
> produzione. Il codice è in `worker/transcribe-worker.js`, ma il Worker
> deployato non si aggiorna da solo col merge della PR. Finché non lo fa, la
> sincronizzazione tramite codice non funziona sul sito reale (tutto il resto sì).

### Pubblicato in questa tornata

| Versione | Cosa |
|---|---|
| v2.100.0 | Sincronizzazione tra dispositivi tramite **codice a 10 caratteri**, senza token GitHub (rotta Worker `/sync`, `src/utils/sync.js`, 10 test) |
| v2.100.0 | **Fix**: il salvataggio cloud non sovrascrive più alla cieca quando non riesce a verificare lo stato remoto — era il motivo per cui un ritratto caricato da un altro dispositivo poteva sparire |
| v2.100.0 | **Fix**: popover "Bonus dato da" con sfondo opaco (sembrava trasparente perché usava lo stesso colore del riquadro sotto) |
| v2.100.0 | **Fix**: in tema chiaro lo sfondo non si tinge più del colore di classe (slavato con le tinte calde: Stregone, Barbaro) |
| v3.0.0 | **Archivio DM raggruppato**: un personaggio per riga invece di una copia per dispositivo/re-import, con "▼ mostra N copie precedenti". Nessuna cancellazione |
| v3.1.0 | **Stampa / Salva PDF** della scheda (`@media print`, pulsante nel Menu) |
| v3.2.0 | **Fix serio**: il riposo *ricarica* le risorse di classe invece di azzerarle (Ira, Punti Stregoneria, Ki restavano a 0 dopo un riposo lungo) |
| v3.3.0 | **Fonte di Magia**: conversione slot ↔ Punti Stregoneria per lo Stregone |
| v3.4.0 | **Diario di sessione** per personaggio, voci datate |
| v3.5.0 | **Effetti meccanici delle condizioni**, con riepilogo di cosa comportano sommate |
| v3.5.1 | **Fix**: la nuvoletta "Bonus dato da" era invisibile sul tema scuro (contrasto 1.02) e poteva sbordare su schermo stretto |
| v3.5.2 | **Fix**: la stessa nuvoletta veniva *tagliata* dal riquadro della caratteristica (`overflow: hidden`); ora è montata su `document.body` con `createPortal` |

Da 127 a **145 test** automatici, tutti verdi.

### Perché la versione è passata da 2.100.0 a 3.0.0

Dopo la 2.99.0 la numerazione era arrivata a "2.100.0", che si legge male.
Su indicazione dell'utente si è passati alla serie **3.x**.

### Note utili per chi riprende

- **Il caso della nuvoletta "Bonus dato da" merita di essere letto**: l'utente
  l'ha segnalata **tre volte** e per due volte ho risposto che era a posto,
  perché su desktop lo era davvero. Il difetto esisteva solo alla larghezza del
  telefono e in tema scuro, ed erano in realtà **due difetti diversi** (colore
  invisibile, poi ritaglio). Morale: quando l'utente insiste, **riprodurre nelle
  sue condizioni** (390px, tema scuro, dati veri) prima di concludere che il
  codice è corretto.
- **Build verde e test verdi non bastano.** Un tentativo di correzione ha rotto
  il rendering dell'app per un import mancante (`createPortal`): `npm run build`
  e tutti i 145 test passavano lo stesso, perché era un errore a runtime. Dopo
  una modifica al JSX, **aprire davvero l'app** e controllare `pageerror`.

- **L'utente ha segnalato più volte "non mi arriva l'update"**: quasi sempre è
  la cache della PWA installata, non un bug. Il meccanismo è stato verificato e
  funziona: l'app confronta `version.json` (fuori dalla precache) con
  `__BUILD_ID__` ogni 20 secondi, al focus e quando torna online. Dopo un merge
  il deploy di GitHub Pages impiega **qualche minuto**: prima di indagare,
  controllare che `version.json` sia davvero cambiato.
  L'utente usa l'app **installata come PWA su macOS**, dove il modo affidabile
  di forzare l'aggiornamento è chiudere la finestra con Cmd+Q e riaprirla.
- Quando l'utente dice che un difetto grafico "c'è ancora", **verificare prima
  sul bundle realmente pubblicato** (scaricarlo con `curl` e servirlo in locale)
  invece di fidarsi solo del codice sorgente: due volte su tre il codice era
  già corretto e si trattava di cache.

### Da dove ripartire

**1. L'unica cosa in sospeso che dipende dall'utente** è la ripubblicazione del
Worker su Cloudflare (vedi riquadro in cima). Prima di dare per rotta la
sincronizzazione tramite codice, chiedere se l'ha fatta: il codice è corretto e
testato, ma senza quel passaggio la rotta `/sync` non esiste in produzione.

**2. Voci di roadmap non ancora affrontate**, in ordine di utilità pratica per
questo tavolo:

- **Statblock per Forma Selvatica** (Vaelion è un Druido: sarebbe la più utile),
  famigli ed evocazioni.
- **Statblock pronti di mostri e PNG** per il Combat tracker.
- **QR code** per link o codice stanza (serve valutare come generarlo senza
  aggiungere dipendenze).
- **Audit delle differenze 2014/2024** non ancora rappresentate.
- **Completare e verificare l'inventario di Vaelion** (voce aperta da tempo,
  vedi più sotto).
- Manutenzione: ESLint, riduzione del bundle (953 kB prima di gzip),
  spezzare gradualmente `App.jsx` (oltre 8000 righe).

**3. Idee proposte ma NON richieste**: "Tavolo dal vivo" (combat tracker
condiviso in tempo reale) resta in coda e **non va iniziata finché l'utente non
la chiede esplicitamente**. Richiede anche una nuova rotta sul Worker, quindi un
altro deploy manuale.

**4. Come lavora questo utente**: chiede una cosa alla volta, con parole sue, e
spesso segnala difetti con uno screenshot da telefono. Preferisce che si vada
avanti senza chiedere conferma a ogni passo, ma vuole essere avvisato quando
serve un'azione sua. Se dice che un difetto c'è ancora, **ha ragione**: va
riprodotto nelle sue condizioni invece di rispondere che il codice è a posto.

## Registro delle richieste inviate oggi

Ricostruito direttamente dalla cronologia locale del task del **15–16 agosto
2026**. Questo registro conserva le richieste singole anche quando sono già
completate, evitando che scompaiano dentro un riepilogo generico.

| Ora | Richiesta | Stato |
|---|---|---|
| 20:33 | Condivisione tramite codice stanza senza token GitHub, con Worker/KV, scadenza, limiti, validazione, rate limiting, IT/EN e compatibilità link | **Fatto e pubblicato** |
| 20:54 | Rimuovere Classica, rinominare Ambientazione in Luogo e ridurre la luce del tema giorno | **Fatto e pubblicato** |
| 21:03 | Accorciare il pulsante «Combattimento» che appariva troncato | **Corretto localmente: Scontro anche su desktop** |
| 21:04 | Ricordare la posizione del pin della mappa a ogni apertura | **Implementato, da riverificare sul sito** |
| 21:07 | Ridisegnare il pannello Monete, centrare Converti e togliere il diamante non coerente | **Fatto e pubblicato** |
| 21:28 | Ridurre ulteriormente l'effetto bianco, ripristinare l'audio e chiamare i luoghi soltanto Pioggia e Mare | **Fatto e pubblicato** |
| 21:37 | Per le classi con incantesimi preparati mostrare tutto il catalogo e portare i preparati stellinati in cima a ogni livello | **Fatto e pubblicato** |
| 21:48 | Mettere riepilogo e conversione Monete uno a sinistra e uno a destra sopra i tagli monetari | **Fatto e pubblicato** |
| 21:51 | Importare Vaelion Leafwhisper dal PDF/ZIP nell'account Tavolo dei Dadi | **Importazione eseguita; inventario da completare e verificare** |
| 21:58 | Correggere versione non aggiornata e numeri del badge disallineati | **Fatto in v2.91.0** |
| 21:59 | Mostrare la nuova scritta del pulsante Combattimento/Scontro | **Fatto in v2.91.0** |
| 22:01 | Compilare automaticamente le Risorse di classe secondo la classe usata | **Fatto in v2.91.0** |
| 22:07 | Inserire il sesso prima della specie e adattare Elfo/Elfa e forme disponibili | **Fatto in v2.91.0** |
| 22:13 | Tasto lingua ITA/ENG e allineamento Tiri Salvezza contro Morte | **Fatto in v2.91.0** |
| 22:14 | Eliminare l'intestazione «Livello 0» dai trucchetti | **Fatto in v2.91.0** |
| 22:14 | Sistemare disposizione e dimensioni dei pulsanti su mobile | **Implementato, da riverificare su iPhone** |
| 22:18 | Nuvoletta/click con spiegazione dell'effetto delle Risorse di classe, senza rinominarle | **Completato localmente: aggiunta Ira e interazione ⓘ più evidente** |
| 23:xx | Riducendo il ritratto non deve restare spazio vuoto; compattare Risorse di classe eliminando spazio e comandi ridondanti | **Corretto localmente, da verificare visivamente** |
| 23:xx | Scambiare Percezione passiva e Sfinimento; centrare tutti i titoli delle sezioni | **Corretto localmente, da verificare visivamente** |
| 23:xx | Inventario: vera tendina alfabetica anche su Safari, Focus druidico selezionabile e colonna Sintonia comprensibile | **Corretto localmente, da verificare su iPhone** |
| 22:33 | Riga per oggetti a utilizzi, Perla del Potere e tutti i menu alfabetici | **Implementato localmente, non pubblicato** |
| 22:42 | Evitare inceppamenti e rendere più rapidi gli aggiornamenti | **Implementato localmente, non pubblicato** |

La richiesta delle 21:51 non è chiusa finché l'inventario di Vaelion non viene
confrontato con i documenti originali e verificato nel cloud.

## Completato e da mantenere

### Persistenza e condivisione

- Salvataggio locale automatico del roster.
- Immagini di ritratto e mappa conservate in IndexedDB, indipendenti dal file
  originale in Download/Desktop.
- Mappa e posizione del segnalino associate al singolo personaggio.
- Sezioni minimizzate ricordate dopo aggiornamento o riapertura.
- Snapshot locali e ripristino senza cancellare le immagini correnti.
- Condivisione tramite link mantenuta.
- Condivisione tramite **codice stanza** senza account e token GitHub: codici
  casuali, scadenza, limiti, validazione, rate limiting e fallback locale.
- Vecchio supporto Gist conservato e separato dalle stanze.
- Auto-salvataggio Gist e caricamento della copia più recente all'avvio.

### Scheda e regole

- Combat tracker presente e funzionante.
- Creazione guidata con privilegi automatici fino al livello scelto.
- Competenze di classe e della specie applicate automaticamente.
- Differenze 2014/2024 già modellate per creazione, privilegi, sottoclassi,
  slot e incantesimi.
- Risorse di classe automatiche secondo classe, livello e caratteristiche,
  conservando utilizzi spesi e risorse personalizzate.
- Spiegazione cliccabile per le risorse di classe conosciute.
- Catalogo completo per le classi che preparano incantesimi; quelli preparati
  sono stellinati e portati in cima a ogni livello.
- Trucchetti separati dagli incantesimi, senza intestazione «Livello 0».
- Tiro guidato dei Tiri Salvezza contro Morte a 0 PF.
- Dadi Vita collegati a classe e livello.
- Classe Armatura, scudo e competenze nelle armature collegati.
- Armi ordinate alfabeticamente senza alterare i dati originali per categoria.
- Tiro per colpire con suono di dadi; danni con effetto coerente per arma,
  distanza o magia.
- Sesso del personaggio prima della specie e forma femminile della specie quando
  disponibile.

### Interfaccia

- Interfaccia italiana e inglese; tasto abbreviato **ITA/ENG**.
- Profilo desktop allineato tramite griglia condivisa.
- Pulsanti principali raccolti in alto su mobile; Luogo, Mappa e Scontro restano
  laterali su desktop.
- Menu **Luogo** al posto di Ambientazione; tema Classica rimosso.
- Nomi Mare e Pioggia semplificati.
- Tema Montagna, variante giorno/notte, immagini e audio dedicati.
- Tema chiaro attenuato e contrasto dei pulsanti migliorato.
- Moneta d'oro CSS al posto dell'emoji argentata.
- Sezione Monete compattata e riallineata.
- Dadi Vita, Salto e Tiri Salvezza contro Morte riallineati.
- Icona del luogo coerente col luogo selezionato; icona Palude corretta.
- Tasto muto interrompe sottofondo, effetti e timer e resta memorizzato.

### Audio e ambientazioni

- Sottofondo ed effetti con volumi separati.
- Eventi di Città, Dungeon e Montagna casuali e senza ripetizione immediata.
- Cinguettii rimossi dagli scenari notturni; gufi usati dove coerenti.
- Suoni di montagna giorno/notte e vento dedicato presenti.
- Sfondi giorno/notte gestiti automaticamente da `public/ambientazioni/`.
- Sfondi Mercato, Montagna e Dungeon mantenuti secondo richiesta.

### Qualità verificata

- **145 test** automatici su regole e dadi, calcoli di scheda, persistenza e
  migrazioni, condivisione, stanze, sincronizzazione, aggiornamento e ripristino
  della PWA, traduzioni ed estetica mobile.
- Build di produzione riuscita.
- Workflow GitHub Pages con test, smoke test, build e deploy.
- Traduzioni di incantesimi, privilegi, tratti, talenti, metamagie, nomi delle
  sottoclassi e scuole coperte dai test.

## Implementato ma da riverificare sul sito reale

Questi punti richiedono una prova visiva o sonora su iPhone e desktop prima di
considerarli definitivamente chiusi:

- Persistenza della mappa dopo eliminazione del file originale e riavvio.
- Persistenza del segnalino dopo spostamento, cambio personaggio e riapertura.
- Tutti gli sfondi giorno/notte, soprattutto Città, Taverna e Deserto.
- Montagna giorno/notte: vento, lupi, volume e assenza di loop percepibili.
- Città: carro e campane non troppo frequenti.
- Audio notturno più inquietante ma coerente, senza animali diurni.
- Suoni di tiro per colpire e danno per spada, arco e incantesimo.
- Mobile: simmetria dei pulsanti, assenza di spazi vuoti e righe incantesimi
  contenute nello schermo.
- Ritratto richiudibile e resa delle immagini già caricate in precedenza.
- Uniformità finale di icone, emoji e palette delle classi.

Un difetto osservato durante la verifica torna nella roadmap aperta con passaggi
riproducibili; non va riaperto soltanto per prudenza.

## Roadmap realmente aperta

### Scheda di Vaelion

- **Completare e verificare l'inventario di Vaelion Leafwhisper** confrontando
  la scheda presente nel cloud con i PDF e il materiale originale in
  `/Users/samuele/Documents/Dungeons & Dragons/I Segreti del Faerûn/`.
- Recuperare tutti gli oggetti mancanti con nome, quantità, peso ed eventuale
  stato equipaggiato; non limitarsi al testo generico dell'equipaggiamento.
- Verificare separatamente gli oggetti magici sintonizzati.
- Per gli oggetti a utilizzi registrare cariche massime, cariche rimaste,
  effetto e tipo di ricarica. In particolare la **Perla del Potere** deve avere
  1 utilizzo e ricarica all'alba.
- Dopo il confronto, aggiornare il personaggio nel cloud senza creare un
  duplicato e verificare che l'inventario resti presente su un altro dispositivo.

Questa voce è **aperta**: l'importazione generale di Vaelion è stata eseguita,
ma il controllo conclusivo dell'inventario non risulta documentato.

### Regole e automazioni D&D

> Conversione slot ↔ Punti Stregoneria (v3.3.0) ed effetti meccanici delle
> condizioni (v3.5.0) erano elencati qui ma sono **pubblicati**: rimossi per non
> farli riaprire per sbaglio.

- Statblock per Forma Selvatica, famigli ed evocazioni.
- Statblock pronti di mostri e PNG per il Combat tracker.
- Eventuale sincronizzazione avanzata dei Tiri Salvezza contro Morte con il
  Combat tracker.
- Audit completo delle differenze 2014/2024 non ancora rappresentate.

### Funzioni

> Stampa/esportazione PDF (v3.1.0) e diario di sessione (v3.4.0) erano elencati
> qui ma sono **pubblicati**: rimossi per non farli riaprire per sbaglio.

- QR code facoltativo per link o codice stanza.
- Valutare il nuovo nome pubblico dell'app solo dopo che l'utente avrà scelto
  quello definitivo; il repository può restare `tavolo-dei-dadi`.
- Verificare e documentare l'attivazione online del Worker PDF→JSON; non
  considerarla conclusa soltanto perché il codice del Worker è presente.

### Stabilità e manutenzione

- Spezzare gradualmente `App.jsx`, mantenendo invariato il comportamento.
- Ridurre il bundle principale, **953 kB** prima di gzip (286 kB gzip, misurati
  il 20/08/2026 con `npm run build`), caricando su richiesta le parti non
  necessarie all'avvio.
- Configurare ESLint e formattazione automatica.
- Aggiungere test mirati per oggetti con utilizzi, aggiornamento PWA e coda dei
  salvataggi cloud.
- Aggiornare questo documento insieme a ogni PR: spostare una voce in
  «Completato» solo dopo test e, per UI/audio, dopo verifica sul sito reale.

## Procedura prima di pubblicare

1. Controllare ultimo `main`, branch e modifiche locali delle altre IA.
2. Eseguire test, build e smoke test quando il browser è disponibile.
3. Incrementare `APP_VERSION` per ogni modifica visibile.
4. Pubblicare tramite branch dedicato e PR; controllare GitHub Pages.
5. Aprire il sito su desktop e iPhone e verificare la versione mostrata.
