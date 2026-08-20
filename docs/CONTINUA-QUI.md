# Continua qui — stato reale di Tavolo dei Dadi

Aggiornato il **20 agosto 2026**. Ultima versione su `main`: **v2.99.0** (PR #61,
sottoclasse anche per la classe secondaria del multiclasse).
App: https://samuelenigro97-prog.github.io/tavolo-dei-dadi/

> Si lavora anche con altre IA sul repository. Prima di modificare o pubblicare:
> controllare branch, modifiche locali e ultimo `main`; non sovrascrivere lavoro
> non proprio e non far modificare `src/App.jsx` contemporaneamente.
>
> **Nota su questo ambiente sandbox**: il container di questa sessione ha
> ripristinato il working tree a uno snapshot vecchio **due volte** durante lo
> sviluppo della funzione qui sotto, cancellando tutto il lavoro non ancora
> committato. Se ti succede: `git status --short` (per non perdere lavoro vero),
> poi `git fetch origin main -q && git checkout -B claude/profilo-grid-alignment-9wda3o origin/main -q`,
> quindi ricostruisci. **Committa e pusha appena hai qualcosa di coerente che
> passa i test**, non aspettare la fine dell'intera funzione: qui il `git push`
> diretto su questo branch ha anche restituito un 403 sporadico (non un vero
> conflitto) risolto ripetendo il push — se ricapita, riprova un paio di volte
> prima di sospettare un problema di permessi reale.

## Ultima funzione consegnata: sincronizzazione tramite codice, senza token GitHub

Richiesta utente: **"sync senza token GitHub"**. Alternativa più semplice al
backup cloud esistente (che resta invariato, a base di token GitHub + Gist):
un codice a 10 caratteri collega due dispositivi senza account né password,
sullo stesso modello delle Stanze temporanee già esistenti.

**Stato: codice pronto, testato (10 test dedicati + build + 127/127 test
automatici del repo), committato e pushato su
`claude/profilo-grid-alignment-9wda3o`. Manca solo aprire la PR verso `main`,
farla passare in CI, fare merge e — soprattutto — che l'utente ripubblichi
manualmente il Worker su Cloudflare, perché la rotta `/sync` esiste nel codice
ma non è ancora online in produzione finché non lo fa.**

File toccati:

- `src/utils/sync.js` (nuovo) — client: `generaCodiceSync`, `salvaSync`,
  `caricaSync`, `messaggioErroreSync`, `normalizzaCodiceSync`/`formattaCodiceSync`
  (ri-esportati da `stanze.js`, stesso alfabeto delle Stanze).
- `worker/transcribe-worker.js` — nuova rotta `/sync/<codice>` (`gestisciSync`):
  `PUT` salva `{roster, updatedAt}` in KV con prefisso `sync:` (180 giorni,
  4 MB max), `GET` lo rilegge; riusa il rate limiting esistente
  (`ROOM_RATE_LIMITER`) e la KV `SCHEDE` già in uso da `/room` e `/pg`.
- `src/App.jsx` — nuova sezione "🔗 Sincronizza con un codice (senza account)"
  nel modale ☁️ Cloud, subito sotto "🛟 Backup automatico"; il backup a token
  GitHub esistente è stato spostato in un `<details>` "🔑 Backup con token
  GitHub (per il DM / uso avanzato)" per non confondere chi non lo usa. Stato
  e funzioni: `codiceSync`, `autoSyncCodice`, `salvaSuCodiceSync`,
  `caricaDaCodiceSync`, `creaCodiceSync`, `usaCodiceSyncEsistente`,
  `disattivaSyncCodice`, con autosalvataggio debounced e caricamento
  automatico all'avvio se un codice è già attivo su quel dispositivo — stessa
  logica del backup a token, chiave `localStorage` separata
  (`sync-codice-ts` invece di `sync-ts`). Il pulsante ☁️ in intestazione mostra
  la spunta verde anche quando la sync-by-code è l'unica attiva.
- `test/sync.test.mjs` (nuovo) — 10 test: salvataggio/rilettura, codice mai
  usato → 404, malformato → 400, corpo senza roster valido → 400, roster
  troppo grande → 413, KV mancante → 500, rate limit → 429, client che non
  tocca mai GitHub, formato del codice generato, copertura dei messaggi
  d'errore.
- `worker/LEGGIMI.md` — nuova sezione "Sincronizzazione tra dispositivi
  tramite codice — senza token GitHub", analoga a quella delle Stanze.

### Cosa manca per chiudere davvero questa richiesta

1. Aprire la PR da `claude/profilo-grid-alignment-9wda3o` verso `main`,
   spiegando la funzione **e ricordando esplicitamente che il Worker va
   ripubblicato a mano su Cloudflare** prima che `/sync` funzioni sul sito
   reale (il codice del Worker da solo non basta, come sempre in questo
   repository: il Worker non si aggiorna da solo col merge della PR).
2. Verifica manuale nel browser non ancora fatta in questa sessione (era in
   corso in una sessione precedente ma il tentativo si è perso in uno dei due
   rollback dell'ambiente): aprire l'app, creare un codice su un "dispositivo",
   verificare che compaia nel modale Cloud, e su un secondo profilo/browser
   digitare lo stesso codice e controllare che il roster arrivi. Non
   strettamente bloccante per il merge (i 10 test coprono già la logica), ma
   consigliata almeno una volta prima di considerarla definitivamente chiusa.
3. Dopo il merge: verificare che il bundle pubblicato su GitHub Pages mostri
   `v2.100.0`, e avvisare l'utente che deve ripubblicare il Worker.

Dopo questa richiesta, altre idee già proposte e accettate in linea di
principio ("Tavolo dal vivo" per il combat tracker condiviso in tempo reale,
"Scheda stampabile/PDF", "Diario di campagna condiviso") **restano in coda e
non vanno iniziate finché l'utente non le chiede esplicitamente per nome**,
esattamente come ha fatto per "sync senza token GitHub".

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

- **87 test** automatici su condivisione, persistenza, regole, stanze e traduzioni.
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

- Conversione slot incantesimo ↔ Punti Stregoneria.
- Effetti meccanici delle condizioni sui tiri e sulle azioni.
- Statblock per Forma Selvatica, famigli ed evocazioni.
- Statblock pronti di mostri e PNG per il Combat tracker.
- Eventuale sincronizzazione avanzata dei Tiri Salvezza contro Morte con il
  Combat tracker.
- Audit completo delle differenze 2014/2024 non ancora rappresentate.

### Funzioni

- Stampa ed esportazione PDF della scheda.
- Diario di sessione.
- QR code facoltativo per link o codice stanza.
- Valutare il nuovo nome pubblico dell'app solo dopo che l'utente avrà scelto
  quello definitivo; il repository può restare `tavolo-dei-dadi`.
- Verificare e documentare l'attivazione online del Worker PDF→JSON; non
  considerarla conclusa soltanto perché il codice del Worker è presente.

### Stabilità e manutenzione

- Spezzare gradualmente `App.jsx`, mantenendo invariato il comportamento.
- Ridurre il bundle principale, attualmente circa **887 kB** prima di gzip,
  caricando su richiesta le parti non necessarie all'avvio.
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
