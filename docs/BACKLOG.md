# Continua qui — stato reale di Tavolo dei Dadi

Aggiornato il **03 settembre 2026**. Ultima versione pubblicata e verificata online: **v4.0.80**.
App: https://samuelenigro97-prog.github.io/tavolo-dei-dadi/

> Si lavora anche con altre IA sul repository. Prima di modificare o pubblicare:
> controllare branch, modifiche locali e ultimo `main`; non sovrascrivere lavoro
> non proprio e non far modificare `src/App.jsx` contemporaneamente.

## Stato attuale: v4.0.80 su `main`

Tutti i rilasci recenti sono committati e sincronizzati direttamente su `main` (rebase del 03/09/2026 allineato a `origin/main`).

### Pubblicato nelle ultime tornate

| Versione | Cosa |
|---|---|
| v4.0.53 | **Tavolo su Richiesta & Versione in Vista**: pannello dadi rimosso → tasto 🎲 modale in Sessione, versione sempre visibile in Profilo |
| v4.0.52 | **Toolbar & Anagrafica Flessibile**: micro-badge con icone per 3 blocchi toolbar, anagrafica a larghezze proporzionali dinamiche |
| v4.0.50 | **Diario in Toolbar**: Diario spostato da fondo scheda a modale 📜 nel blocco Sessione |
| v4.0.49 | **Tiri Morte & Filigrana Carisma**: box Successi/Fallimenti ridisegnati, icona 🎭 più visibile |
| v4.0.48 | **Toolbar & Combattimento**: 3 blocchi etichettati, filtri incantesimi riorganizzati, toggle armi, effetto Perla del Potere |
| v3.9.49 | **Condivisione Stanza con QR Code**: generazione immediata di QR Code inquadrabile con la fotocamera |
| v3.9.48 | **Spawn Rapido Mostri**: menu rapido bestiario con CA/PF/iniziativa già calcolati |
| v3.9.47 | **Forma Selvatica & Bestiario Druido**: catalogo bestie filtrato GS/sottoclasse, statblock e Trasformati |
| v3.9.46 | **Inventario Zaino vs Equipaggiato**: filtri `📦 Tutti`/`🛡️ Indossati`/`🎒 Zaino` e pesi dettagliati |
| v3.9.45 | **Mobile Card View Combattimento**: Azioni/Bonus/Reazioni in card responsive |
| v3.9.44 | **Filtri Grimorio**: pillole `🎯 Tutti`/`⭐ Preparati`/`⚡ Azione`/`⏳ Bonus`/`🛡️ Reazione`/`🧠 Conc.`/`📜 Rituali` |
| v4.0.42–4.0.46 | **Audit & Sistema**: controlli D&D estesi, XP tracker, pozioni con meccaniche 5e, movimento/salti, reazioni, turn economy, guide abilità, concentrazione, cover, booster combattimento, Artefice, Warlock, manuali |

`src/App.jsx` da 12k a **19.330 righe**, bundle PWA ~940 kB → ~890 kB, **145 test** verdi (12 suite).

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
- Manutenzione: ESLint, riduzione del bundle (~940 kB prima di gzip),
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

### Roadmap Prioritaria (ex-approvata) — STATO 03/09/2026

1. **Diario di Sessione** — **✅ FATTO** (`v3.9.41`, poi `v4.0.50` modale toolbar): tag PNG/Quest/Luoghi/Bottino/Scontri, export `.md`, ora in modale Sessione (`src/App.jsx:18061`).
2. **QoL Tavolo** — **✅ FATTO**: Riposo Breve/Lungo guidato (`v3.9.42`, `src/App.jsx:4969`), Badge Condizioni colorati con tooltip (`src/data/condizioni.js:13`). **Resta aperto**: badge header sync 🟢/🟠 (solo toast Cloud, non in header).
3. **Filtri Grimorio** — **✅ FATTO** (`v3.9.44`, `076ee85`, `src/App.jsx:3234`).
4. **Mobile Card Combattimento** — **✅ FATTO** (`v3.9.45`).
5. **Zaino vs Equipaggiato** — **✅ FATTO** (`v3.9.46`, `src/App.jsx:3245` + `16428`). **Fix odierno 03/09**:rimosse emoticon da sesso/razza/taglia/allineamento (`src/ui/componenti.jsx:53`, `src/i18n.js:259`), bordi uniformati su tutte le tendine (`src/ui/stili.js:53`).

**Fix odierni aggiuntivi (non in roadmap):**
- Titolo Movimento/Salti dinamico 5.5/5e per PG (`src/App.jsx:8056` usa `scheda?.versione`).
- Combattimento: solo incantesimi con danni + tiro/CD mostrati (`src/rules/regole.js:490` `classificaIncantesimoCombattimento`).

### Scheda di Vaelion [COMPLETATO]

- **Inventario di Vaelion Leafwhisper verificato e allineato al 100% con il PDF originale**:
  - Confrontato con `Vaelion Leafwhisper NEW.pdf` e `Vaelion_Scheda_Background.pdf` in `I Segreti del Faerûn`.
  - Strutturato `public/Vaelion.json` con tutti i 13 oggetti (Corazza di Legnoferro CA 14, Scudo, Mantello della Protezione +1, Perla del Potere 1/1 reset lungo, Guanti della Forza Orchesca FOR 19, Borsa da Erborista, Borsa Conservante, pozioni e unguenti, sonaglio sacro di zucca).
  - Verificate le 3 sintonie attive (Mantello Prot., Perla del Potere, Guanti FOR).

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
