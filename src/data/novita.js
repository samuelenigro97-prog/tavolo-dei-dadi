// Novità per versione, in due lingue. Poche righe per versione: si leggono
// dal pannello Avvisi, non sono note di rilascio complete.
// La più recente va SEMPRE in cima: il pannello mostra le prime voci così
// come sono ordinate qui.

export const NOVITA = [
  {
    versione: '4.0.73',
    voci: {
      it: [
        'Bundle Ottimizzato: split chunk vendor/data5e/bestiario/regole per caricamento più rapido.',
      ],
      en: [
        'Bundle Optimized: split vendor/data5e/bestiary/rules chunks for faster loading.',
      ],
    },
  },
  {
    versione: '4.0.72',
    voci: {
      it: [
        'Sync Cloud Icona Colorata: rimosso testo Locale, resta solo ☁️ con bordo colorato (verde In tempo reale, giallo Locale, rosso Offline) come campanello notifiche.',
      ],
      en: [
        'Sync Cloud Colored Icon: removed Locale text, only ☁️ with colored border (green Live, yellow Local, red Offline) like notification bell.',
      ],
    },
  },
  {
    versione: '4.0.71',
    voci: {
      it: [
        'Fix P.E. Teorico & Immagini Orfane: livello teorico mai sotto attuale, recupero immagini perse anche da IndexedDB orfano per qualsiasi PG.',
      ],
      en: [
        'Fix XP Theoretical & Orphan Images: theoretical level never below actual, recovery of orphaned portraits from IndexedDB for any character.',
      ],
    },
  },
  {
    versione: '4.0.70',
    voci: {
      it: [
        'Nuvoletta Header Fissa: tooltip sezioni sempre sotto il tasto, senza salto sopra→sotto.',
      ],
      en: [
        'Header Tooltip Fixed: section tooltips always below button, no jump above→below.',
      ],
    },
  },
  {
    versione: '4.0.69',
    voci: {
      it: [
        'Fix Guanti FOR 19 & Immagini: Guanti ora riconosciuti anche come Potere Orchesco con freccia → 19 sempre visibile, recupero immagini orfane per qualsiasi PG.',
      ],
      en: [
        'Fix Gauntlets STR 19 & Images: Gauntlets now recognized as Potere Orchesco with arrow → 19, recovery of orphaned portraits for any character.',
      ],
    },
  },
  {
    versione: '4.0.68',
    voci: {
      it: [
        'Sesso/Allineamento + Sync + Incantesimi + Monete + P.E./Immagini: sesso allargato e allineamento stretto, badge sync stile notifiche (verde/giallo/rosso), costo slot in punti accanto agli slot e toggle Rituale, monete solo peso totale, P.E. allineati al livello e immagini recuperate.',
      ],
      en: [
        'Sex/Alignment + Sync + Spells + Coins + XP/Images: wider Sex and narrower Alignment, sync badge like notifications (green/yellow/red), slot cost in points next to slots and Ritual toggle, coins weight only, XP aligned and images recovered.',
      ],
    },
  },
  {
    versione: '4.0.67',
    voci: {
      it: [
        'Vaelion P.E. & Immagini: P.E. corretti per livello 10 (64000) e Wendell 6 (14000), recupero automatico immagini perse da snapshot e garanzia equip Guanti FOR 19 con freccia → 19 sempre visibile.',
      ],
      en: [
        'Vaelion XP & Images: XP fixed for level 10 (64000) and Wendell 6 (14000), auto-recovery of lost portraits from snapshots and guaranteed Gauntlets STR 19 arrow.',
      ],
    },
  },
  {
    versione: '4.0.66',
    voci: {
      it: [
        'Ordine Alfabetico Completo: tutti i sottomenu ora in ordine A-Z, incluse le sottoclassi nella sezione multiclasse.',
      ],
      en: [
        'Full Alphabetical Order: all dropdowns now A-Z, including subclasses in multiclass section.',
      ],
    },
  },
  {
    versione: '4.0.65',
    voci: {
      it: [
        'Fix Wendell Allineamento: "Buono Caotico" corretto in "Caotico Buono" + normalizzazione automatica per tutte le schede esistenti.',
      ],
      en: [
        'Fix Wendell Alignment: "Buono Caotico" corrected to "Caotico Buono" with auto-normalization for existing sheets.',
      ],
    },
  },
  {
    versione: '4.0.64',
    voci: {
      it: [
        'Colori Classe Ridisegnati: Guerriero rosso/bronzo, Ladro nero, Monaco zafferano/bianco, Stregone viola, Warlock nero/viola, Artefice rame/bronzo, Druido verde-marrone e Ranger verde foresta.',
      ],
      en: [
        'Class Colors Redesigned: Fighter red/bronze, Rogue black, Monk saffron/white, Sorcerer purple, Warlock black/purple, Artificer copper/bronze, Druid green-brown and Ranger forest green.',
      ],
    },
  },
  {
    versione: '4.0.63',
    voci: {
      it: [
        'Animazioni diffuse: Level Up pronto e turno in combattimento ora pulsano come la campanella delle notifiche.',
      ],
      en: [
        'Animations extended: Level Up ready and combat turn now pulse like notification bell.',
      ],
    },
  },
  {
    versione: '4.0.62',
    voci: {
      it: [
        'Notifiche solo Campanello & Fix Vaelion Trucchetti: rimosso numero dalle notifiche (resta solo 🔔 animata), Vaelion ora 5 trucchetti senza alert.',
      ],
      en: [
        'Notifications Bell Only & Vaelion Cantrips Fix: removed count from notifications (only 🔔 animated), Vaelion now 5 cantrips without alert.',
      ],
    },
  },
  {
    versione: '4.0.61',
    voci: {
      it: [
        'Vaelion 5.0 & Fix Equip: Vaelion ora in 5.0 (2014), Guanti della Forza Orchesca sempre equipaggiati e in sintonia, rimosso omino che corre dai salti.',
      ],
      en: [
        'Vaelion 5.0 & Equip Fix: Vaelion now on 5.0 (2014), Gauntlets always equipped/attuned, removed runner emoji from jumps.',
      ],
    },
  },
  {
    versione: '4.0.60',
    voci: {
      it: [
        'Fix Immagine Vaelion & Campanello: deduplica intelligente che conserva ritratto e mappa del PG più completo; campanello notifiche resta animato finché ci sono modifiche.',
      ],
      en: [
        'Fix Vaelion Image & Bell: smart deduplication keeps portrait/map of most complete character; notification bell stays animated while changes pending.',
      ],
    },
  },
  {
    versione: '4.0.59',
    voci: {
      it: [
        'Deduplica Automatica PG: al caricamento rimuove i doppioni con stesso nome (es. import ripetuto), mantenendo solo il primo.',
      ],
      en: [
        'Auto-Deduplicate Characters: on load removes duplicates with same name, keeping only the first.',
      ],
    },
  },
  {
    versione: '4.0.58',
    voci: {
      it: [
        'Tracciatore P.E.: sezione informazioni allineata e centrata con il Livello Attuale per simmetria perfetta.',
      ],
      en: [
        'XP Tracker: info section aligned and centered with Current Level for perfect symmetry.',
      ],
    },
  },
  {
    versione: '4.0.57',
    voci: {
      it: [
        'Profilo: Allineamento stretto per dare più spazio alla Razza/Specie + Combattimento: solo incantesimi con danni via TS o tiro per colpire (TS con danni + attacchi con danni).',
      ],
      en: [
        'Profile: narrowed Alignment for Species/Race + Combat: only damage spells via save or attack roll (TS + attack with damage).',
      ],
    },
  },
  {
    versione: '4.0.56',
    voci: {
      it: [
        'Tracciatore P.E. Allineato: livello attuale centrato nel riquadro di riepilogo per simmetria con il prossimo livello.',
      ],
      en: [
        'XP Tracker Aligned: current level centered in summary card for symmetry with next level.',
      ],
    },
  },
  {
    versione: '4.0.55',
    voci: {
      it: [
        'Pulizia Anagrafica & Combattimento Mirato: rimosse emoticon da sesso/razza/taglia/allineamento e da Compagni/Famigli, bordi uniformati su tutte le tendine, titolo Movimento/Salti dinamico 5.5/5e, incantesimi in combattimento solo con danni via tiro o CD, tasti Monete rinominati Converti in MR/MA e Converti in MP.',
      ],
      en: [
        'Clean Profile & Focused Combat: removed emojis from sex/species/size/alignment and Companions, unified dropdown borders, Movement/Jumps title dynamic 5.5/5e, combat spells only with damage via roll or save, coin buttons renamed Convert to CP/SP and Convert to PP.',
      ],
    },
  },
  {
    versione: '4.0.54',
    voci: {
      it: [
        'Scaling Trucchetti & Combattimento Rifinito: scaling automatico dei danni dei trucchetti con il livello del PG (5/11/17), tiro rapido danni e critici con raddoppio dadi, forme bestiali preferite (⭐) con gestione corretta dell\'overflow danni, Combat Tracker pulito e filtri rapidi a pillole per l\'inventario.',
      ],
      en: [
        'Cantrip Level Scaling & Combat Refinements: automatic cantrip damage dice scaling with character level (5/11/17), quick damage and critical hit rolling, favorite beast forms (⭐) with PHB damage overflow handling, cleaner Combat Tracker, and pill category filters for inventory.',
      ],
    },
  },
  {
    versione: '4.0.53',
    voci: {
      it: [
        'Tavolo dei Dadi su Richiesta & Versione in Vista: rimossa la barra fissa dei dadi per dare massimo spazio alla scheda. I dadi (d4–d100, formule e cronologia) sono ora accessibili dal tasto 🎲 nella sezione Sessione. La versione dell\'app è ora sempre visibile nel riquadro Profilo.',
      ],
      en: [
        'On-Demand Dice Roller & Always Visible Version: persistent top dice bar converted to a dedicated 🎲 button in the Session toolbar. App version is now always in plain sight in the Profile panel header.',
      ],
    },
  },
  {
    versione: '4.0.52',
    voci: {
      it: [
        'Nuovo Design Toolbar & Anagrafica Flessibile: micro-badge satinati con icone per i 3 blocchi della barra superiore e proporzioni dinamiche dei campi anagrafica (più spazio a Sottoclasse e Background, campi compatti per Taglia e P.E.).',
      ],
      en: [
        'New Toolbar Design & Dynamic Character Info: satin micro-badges with icons for toolbar blocks and proportional responsive layout for character info fields.',
      ],
    },
  },
  {
    versione: '4.0.51',
    voci: {
      it: [
        'Risoluzione Errore di Caricamento: corretto il riferimento anticipato all\'inizializzazione dei filtri e delle etichette incantesimo all\'avvio dell\'applicazione.',
      ],
      en: [
        'Loading Error Fix: resolved initialization timing for spell filters and spell tags on application startup.',
      ],
    },
  },
  {
    versione: '4.0.50',
    voci: {
      it: [
        'Diario di Sessione nella Toolbar: la sezione Diario non è più in fondo alla scheda ma è ora accessibile direttamente dal tasto 📜 nel blocco "SESSIONE" della toolbar, aprendo un pannello modale dedicato e lasciando la scheda più pulita e ordinata.',
      ],
      en: [
        'Session Journal in Toolbar: the Journal section is no longer at the bottom of the sheet but now opens directly via the 📜 button in the "SESSION" toolbar block in a dedicated modal panel, keeping the sheet clean and organized.',
      ],
    },
  },
  {
    versione: '4.0.49',
    voci: {
      it: [
        'Design Tiri Morte & Filigrana Carisma: caselle Successi/Fallimenti ridisegnate, pulsanti e testi ingranditi e meglio spaziati per sfruttare l\'intero riquadro; incrementata la visibilità dell\'icona teatrale 🎭 di sfondo per la caratteristica Carisma.',
      ],
      en: [
        'Death Saves Layout & Charisma Watermark: redesigned Success/Failure boxes, larger and well-spaced typography/buttons to fully leverage the box space; enhanced visibility of the 🎭 theatrical mask background watermark for Charisma.',
      ],
    },
  },
  {
    versione: '4.0.48',
    voci: {
      it: [
        'Organizzazione Toolbar & Combattimento: 3 blocchi con etichette (Gestione Scheda, Sistema, Sessione), filtri incantesimi riorganizzati, toggle per mostrare/nascondere le armi in combattimento, effetto Perla del Potere con recupero slot interattivo e diciture effetti semplificate.',
      ],
      en: [
        'Toolbar & Combat Layout: 3 labeled blocks (Sheet Management, System, Session), reorganized spell filters, toggle for weapons visibility in combat table, Pearl of Power effect with interactive spell slot recovery, and simplified effect labels.',
      ],
    },
  },
  {
    versione: '3.9.91',
    voci: {
      it: [
        'Nomi PG con Iniziale Maiuscola & Raggruppamento Archivio DM: forzatura automatica della prima lettera maiuscola per tutti i personaggi (creazione, import e modifica) e raggruppamento intelligente delle versioni dello stesso personaggio per nome nell\'Archivio DM.',
      ],
      en: [
        'Capitalized Character Names & DM Archive Grouping: automatic initial capitalization for character names across creation, import, and editing; robust name-based grouping of character versions in DM Archive.',
      ],
    },
  },
  {
    versione: '3.9.90',
    voci: {
      it: [
        'Pulsante "⚡ Correggi tutto" nelle Notifiche: aggiunto a fine riquadro delle notifiche il pulsante dedicato per applicare con un solo click tutte le correzioni disponibili (competenze mancanti, tiri salvezza, rimozione abilità extra e bonus competenza).',
      ],
      en: [
        '"⚡ Fix all" Button in Notifications: added a dedicated button at the bottom of the notification box to apply all available character fixes with a single click (missing skills, saving throws, removing extra skills, and proficiency bonus).',
      ],
    },
  },
  {
    versione: '3.9.89',
    voci: {
      it: [
        'Sistema di Validazione Regole D&D 2014/2024 Potenziato: verifica rigorosa del budget competenze (inclusi bonus multiclasse per Ladro, Bardo e Ranger), allineamento automatico del Bonus Competenza al livello totale del PG e controllo del tetto massimo di incantesimi preparati/conosciuti.',
      ],
      en: [
        'Enhanced D&D 2014/2024 Rulebook Validation Engine: strict skill proficiency budget check (including multiclass bonuses for Rogue, Bard, and Ranger), total level proficiency bonus alignment, and prepared/known spell limit enforcement.',
      ],
    },
  },
  {
    versione: '3.9.88',
    voci: {
      it: [
        'Modificatori Rapidi PF Potenziati: aggiunti pulsanti veloci -20, -10, -5, -1 per il danno e +1, +5, +10, +20 per la cura sotto la barra della vita del personaggio.',
      ],
      en: [
        'Expanded Quick HP Modifiers: added fast -20, -10, -5, -1 damage buttons and +1, +5, +10, +20 healing buttons right under the character health bar.',
      ],
    },
  },
  {
    versione: '3.9.87',
    voci: {
      it: [
        'Pulsante "Correggi" anche per Avvisi Gialli: ora è possibile correggere/rimuovere con un click sia le competenze mancanti (avvisi rossi) sia le abilità segnate prive di fonte o in eccesso (avvisi gialli).',
      ],
      en: [
        '"Fix" Button on Yellow Warnings: you can now one-click fix/remove extra or unsourced skill proficiencies (yellow warnings) as well as apply missing ones (red warnings).',
      ],
    },
  },
  {
    versione: '3.9.86',
    voci: {
      it: [
        'Miglioramento Import da Fantasy Grounds: istruzioni AI rafforzate per distinguere con precisione le abilità con stella dorata (competenza/maestria) da quelle con stella grigia (non competenti), evitando importazioni di competenze non possedute.',
      ],
      en: [
        'Fantasy Grounds Import Enhancement: reinforced AI vision instructions to strictly identify gold star proficiencies/expertise vs gray unproficient stars, preventing false skills from being imported.',
      ],
    },
  },
  {
    versione: '3.9.85',
    voci: {
      it: [
        'Uniformazione Completa Menu e Barra di Navigazione: nomi, icone e ordine delle azioni rapide nel menu principale (Cloud, Annulla, Importa, Esporta, Notifiche, Lingua) ora rispecchiano perfettamente i tasti della barra superiore.',
      ],
      en: [
        'Full Menu & Header Actions Uniformity: action labels, icons, and order in the main menu (Cloud, Undo, Import, Export, Notifications, Language) now perfectly mirror the top header buttons.',
      ],
    },
  },
  {
    versione: '3.9.84',
    voci: {
      it: [
        'Nuovo Menu Esporta & Stampa / Salva PDF Ufficiale: cliccando su "Esporta" si apre un menu con opzioni rapide per salvare in JSON, scaricare il backup completo, condividere il link o stampare/salvare in PDF con layout cartaceo D&D pulito a 2-3 pagine (formato A4 senza barre o elementi UI superflui).',
      ],
      en: [
        'New Export Menu & Print / Official PDF Sheet: clicking "Export" now opens a dropdown menu with quick options to save JSON, download full backup, share link, or print/save as a clean 2-3 page D&D official character sheet PDF (A4 format with no clutter).',
      ],
    },
  },
  {
    versione: '3.9.83',
    voci: {
      it: [
        'Evidenziazione e Correzione Rapida Competenze: le abilità e i tiri salvezza mancanti sono ora cerchiati in rosso direttamente sulla scheda con badge "⚠️ Manca", e il pannello Notifiche include i pulsanti "✓ Correggi" e "⚡ Correggi tutte" per applicarle istantaneamente.',
      ],
      en: [
        'Missing Proficiencies Highlighting & Quick Fix: missing skills and saving throws are now outlined in red on the sheet with a "⚠️ Manca" badge, and the Notifications panel features "✓ Fix" and "⚡ Fix all" buttons to apply them with one tap.',
      ],
    },
  },
  {
    versione: '3.9.82',
    voci: {
      it: [
        'Inventario Potenziato & Pozioni Rapide: filtri per tipo (Armi/Armature, Pozioni, Magici, Attrezzi) e tasto "Bevi" per consumare pozioni e curarsi automaticamente con tiro dadi integrato.',
        'Divisione Bottino Party: calcolatore per spartire equamente le monete tra i membri del gruppo mantenendo la propria quota.',
        'Soundboard Effetti Rapidi (SFX): pannello audio arricchito con effetti istantanei (Spada, Arco, Magia, Cura, Tuono, Monete, Campana, Porta).',
      ],
      en: [
        'Enhanced Inventory & Quick Potions: category filters (Weapons/Armor, Potions, Magic, Tools) and instant "Drink" button for potions with automated healing rolls.',
        'Party Loot Splitter: easy calculator to divide coins equally among party members and keep your share.',
        'Quick SFX Soundboard: instant sound effects panel (Sword, Bow, Magic, Heal, Thunder, Coins, Bell, Stone Door).',
      ],
    },
  },
  {
    versione: '3.9.81',
    voci: {
      it: [
        'Supporto Sottoclassi e Multiclasse: il riquadro Privilegi Sottoclasse e la relativa Panoramica ora mostrano e gestiscono automaticamente i privilegi per tutte le classi del personaggio con livello 3 o superiore (es. Ranger 6 / Ladro 3).',
      ],
      en: [
        'Multiclass Subclass Features Support: the Subclass Features panel and overview modal now automatically display and manage features for all character classes with level 3 or higher.',
      ],
    },
  },
  {
    versione: '3.9.80',
    voci: {
      it: [
        'Restyling Sezione Magia & Incantesimi: riprogettata la visualizzazione di Trucchetti e Incantesimi con card più pulite e ordinate, badge di preparazione chiari (⭐ Prep.) e pulsanti di tiro rapido integrati.',
      ],
      en: [
        'Magic & Spells Section Redesign: refined layout for Cantrips and Spelled levels with cleaner cards, clear preparation badges (⭐ Prep.), and integrated roll triggers.',
      ],
    },
  },
  {
    versione: '3.9.79',
    voci: {
      it: [
        'Auto-Compilazione Competenze e Addestramento all\'Import: quando si importa un personaggio, se l\'addestramento in armature/armi non è specificato nel file, l\'app lo deduce e compila automaticamente in base alla classe principale.',
      ],
      en: [
        'Automatic Proficiency & Training on Import: when importing a character without explicit training data, the app automatically populates armor and weapon proficiencies based on the character\'s class.',
      ],
    },
  },
  {
    versione: '3.9.78',
    voci: {
      it: [
        'Unione Intelligente Schermate Fantasy Grounds: caricando contemporaneamente più schermate (Main + Skills + Inventory), l\'app fonde automaticamente tutti i dati dando priorità alla scheda anagrafica e aggregando tutte le competenze e tiri salvezza.',
      ],
      en: [
        'Smart Fantasy Grounds Multi-Image Merge: importing multiple screenshots (Main + Skills + Inventory) automatically merges character data, prioritizing main stats and aggregating all skill proficiencies and saving throws.',
      ],
    },
  },
  {
    versione: '3.9.77',
    voci: {
      it: [
        'Apertura Automatica Scheda Importata: quando importi un personaggio (da JSON, PDF o immagine), l\'app lo seleziona e apre immediatamente a schermo la sua scheda aggiornata.',
      ],
      en: [
        'Auto-Open Imported Character: importing a character (JSON, PDF, or image) now immediately switches to and displays the newly imported sheet.',
      ],
    },
  },
  {
    versione: '3.9.76',
    voci: {
      it: [
        'Formattazione Selettore Personaggi: rimosso completamente il suffisso tra parentesi con il livello totale, lasciando la dicitura pulita con le sole classi e livelli (es. "Elevorn — Guerriero 1 / Ranger 6 / Ladro 3").',
      ],
      en: [
        'Character Selector Formatting: completely removed the parenthesized total level suffix, displaying only clean class names and levels.',
      ],
    },
  },
  {
    versione: '3.9.75',
    voci: {
      it: [
        'Pulizia Dicitura Livello nel Selettore: rimossa la ripetizione ridondante del livello "(Liv. X)" nei personaggi monoclasse, mostrandola solo nei multiclasse come livello totale.',
      ],
      en: [
        'Character Selector Level Label Cleanup: removed redundant "(Lvl X)" label for single-class characters, displaying it only for multiclass characters as total level.',
      ],
    },
  },
  {
    versione: '3.9.74',
    voci: {
      it: [
        'Esportazione Backup Consolidato Roster: "Esporta tutto" ora scarica unicamente il file completo del roster contenente tutti i personaggi insieme, evitando download multipli ridondanti.',
      ],
      en: [
        'Consolidated Roster Backup Export: "Export All" now exports solely the unified roster backup file containing all characters together, preventing redundant multiple downloads.',
      ],
    },
  },
  {
    versione: '3.9.73',
    voci: {
      it: [
        'Divisore Barra Azioni Personaggio: reso ben visibile e dorato il separatore verticale tra i tasti di gestione scheda (elimina, rinomina, aggiungi) e i tasti di utilità e mappa.',
      ],
      en: [
        'Character Toolbar Divider: enhanced visibility and styling for the vertical separator between character management buttons and utility/map tools.',
      ],
    },
  },
  {
    versione: '3.9.72',
    voci: {
      it: [
        'Miglioramento Gestione Ingombro e Borsa Conservante: risolto il falso avviso di ingombro quando è equipaggiata la Borsa Conservante o quando il carico rientra ampiamente nella capacità del personaggio.',
      ],
      en: [
        'Improved Encumbrance and Bag of Holding: fixed false encumbrance warnings when Bag of Holding is equipped or when weight is well within capacity.',
      ],
    },
  },
  {
    versione: '3.9.71',
    voci: {
      it: [
        'Auto-Equip Focus alla Creazione: quando crei un nuovo personaggio, il focus arcano, focus druidico, simbolo sacro o borsa componenti presente nella dotazione viene equipaggiato automaticamente nell\'inventario.',
      ],
      en: [
        'Auto-Equip Spell Focus on Creation: newly created characters will automatically have their starting arcane/druidic focus, holy symbol, or component pouch equipped.',
      ],
    },
  },
  {
    versione: '3.9.70',
    voci: {
      it: [
        'Correzione Colori Barra Ingombro: la barra e la scritta sono verdi se il peso è normale, arancioni quando si entra nello stato di ingombro (regola opzionale 5e), e rosse solo in caso di grave ingombro o sovraccarico.',
      ],
      en: [
        'Encumbrance Bar Color Fix: bar and label display green under normal load, orange when encumbered (optional 5e rule), and red only when heavily encumbered or overloaded.',
      ],
    },
  },
  {
    versione: '3.9.69',
    voci: {
      it: [
        'Esportazione Backup Completo Roster: "Esporta tutto" scarica un unico file consolidato contenente tutti i personaggi del roster e genera i singoli file di backup con intervalli temporizzati per evitare blocchi del browser.',
      ],
      en: [
        'Full Roster Backup Export: "Export all" now downloads a single consolidated file with all roster characters plus timed individual backup downloads.',
      ],
    },
  },
  {
    versione: '3.9.68',
    voci: {
      it: [
        'Risoluzione Spaziatura Anagrafica a Ritratto Chiuso: corretto il comportamento della griglia del Profilo quando il ritratto è collassato, eliminando l\'eccessivo spazio vuoto verticale tra i campi anagrafici.',
      ],
      en: [
        'Profile Grid Spacing Fix when Minimized: resolved excessive vertical gaps in character details when the portrait is collapsed.',
      ],
    },
  },
  {
    versione: '3.9.67',
    voci: {
      it: [
        'Grimorio Più Pulito: rimosso il simbolo ⓘ accanto al nome degli incantesimi; la spiegazione completa resta consultabile al passaggio del cursore o cliccando sul nome.',
      ],
      en: [
        'Cleaner Spellbook: removed ⓘ icon next to spell names; full spell text remains accessible via hover tooltip and direct click.',
      ],
    },
  },
  {
    versione: '3.9.66',
    voci: {
      it: [
        'Allineamento Competenze Vaelion: sincronizzate tutte le competenze in abilità (Addestrare Animali, Arcano, Intuizione, Medicina, Natura, Percezione, Sopravvivenza), tiri salvezza (Intelligenza, Saggezza), armature, armi e lingue con il formato numerico dell\'app.',
      ],
      en: [
        'Vaelion Proficiencies Synchronization: synchronized all skill proficiencies (Animal Handling, Arcana, Insight, Medicine, Nature, Perception, Survival), saving throws, armors, weapons and languages with the app format.',
      ],
    },
  },
  {
    versione: '3.9.65',
    voci: {
      it: [
        'Stile Uniforme Pulsante Cestino: rimosso il bordo colorato dal pulsante di eliminazione nell\'intestazione, uniformato agli altri pulsanti dell\'interfaccia.',
      ],
      en: [
        'Uniform Trash Button Style: removed colored border from the header delete button to match all other interface controls.',
      ],
    },
  },
  {
    versione: '3.9.64',
    voci: {
      it: [
        'Colori Dinamici Barra Ingombro: la barra dell\'ingombro è verde brillante se il PG non è ingombrato (<50%), arancione a metà/verso il limite, e rossa se ingombrato o sovraccarico.',
      ],
      en: [
        'Dynamic Encumbrance Bar Colors: the encumbrance gauge displays vivid green when unencumbered (<50%), orange at mid/threshold load, and red when encumbered or overloaded.',
      ],
    },
  },
  {
    versione: '3.9.63',
    voci: {
      it: [
        'Spiegazioni Incantesimi al Passaggio del Cursore: passando il mouse sul nome di qualsiasi incantesimo compare subito il tooltip con il testo integrale e l\'icona ⓘ cliccabile.',
      ],
      en: [
        'Spell Hover Explanations: hovering over any spell name now instantly shows a tooltip preview with the full rules text and a clickable ⓘ icon.',
      ],
    },
  },
  {
    versione: '3.9.62',
    voci: {
      it: [
        'Dicitura "Nessuna armatura" nella CA: uniformata la voce di selezione della Classe Armatura in conformità con la sezione Competenze.',
        'Pulizia Automatica Risorse Duplicate: unificate automaticamente le voci storiche (es. Punti Stregoneria Metamagia) nella risorsa ufficiale di classe.',
      ],
      en: [
        '“No Armor” AC Label: standardized the Armor Class selection label to match the Proficiencies section.',
        'Automatic Resource Deduplication: automatically merged legacy duplicate entries (e.g. Sorcery Points Metamagic) into official class resources.',
      ],
    },
  },
  {
    versione: '3.9.61',
    voci: {
      it: [
        'Risoluzione Schermata Bianca: corretto un errore nella valutazione della soglia d\'ingombro che bloccava il caricamento della scheda su dispositivi con personaggi esistenti.',
      ],
      en: [
        'White Screen Fix: fixed an encumbrance threshold reference error that caused sheet crashes on existing character loads.',
      ],
    },
  },
  {
    versione: '3.9.60',
    voci: {
      it: [
        'Risoluzione Crash Segnalino Mappa: corretto il controllo di sicurezza sul segnalino mappa che causava un errore di caricamento in assenza di personaggi.',
      ],
      en: [
        'Map Marker Crash Fix: resolved safe-navigation check on the map marker component preventing launch errors on empty storage.',
      ],
    },
  },
  {
    versione: '3.9.59',
    voci: {
      it: [
        'Robustezza Avvio senza Personaggi: protette tutte le derivazioni di stato (incantesimi, abilità, caratteristiche) per consentire un rendering fluido della schermata iniziale anche con archivio locale azzerato.',
      ],
      en: [
        'Storage-Safe Startup: protected all derived state calculations (spells, skills, attributes) to ensure smooth rendering on clean browsers with no local characters.',
      ],
    },
  },
  {
    versione: '3.9.58',
    voci: {
      it: [
        'Risoluzione Schermata Bianca all\'Avvio: corretto un controllo sullo stato del personaggio attivo che causava schermata bianca quando il browser non aveva ancora personaggi salvati in memoria.',
      ],
      en: [
        'Fix White Screen on Launch: resolved a state check error that caused a blank screen when the browser had no characters saved in storage yet.',
      ],
    },
  },
  {
    versione: '3.9.57',
    voci: {
      it: [
        'Indicatore Cloud con Allerta Rosso: quando i dati non sono sincronizzati sul Cloud o sono salvati solo localmente, il pulsante Cloud mostra il punto esclamativo rosso (❗).',
      ],
      en: [
        'Red Cloud Alert Indicator: when data is unsynced or only stored locally, the Cloud button displays a red exclamation mark (❗).',
      ],
    },
  },
  {
    versione: '3.9.56',
    voci: {
      it: [
        'Filtro Sezione Famigli & Evocazioni: il menu delle creature evocate compare solo per i personaggi che hanno effettivamente incantesimi di evocazione nel grimorio o sono Warlock del Patto della Catena, e la Forma Selvatica rimane dedicata al Druido.',
      ],
      en: [
        'Filtered Familiars & Summons Section: the summoned creatures panel now only appears for characters that actually know conjuration/familiar spells or are Pact of the Chain Warlocks, keeping Wild Shape strictly dedicated to Druids.',
      ],
    },
  },
  {
    versione: '3.9.55',
    voci: {
      it: [
        'Colori Dinamici Barra di Ingombro: la barra dell\'ingombro è verde sotto il 50% di carico, diventa arancione quando raggiunge la metà/carico moderato, e rossa solo quando si è ingombrati o sovraccarichi.',
      ],
      en: [
        'Dynamic Encumbrance Bar Colors: the weight capacity bar is green under 50% load, turns orange around half/moderate load, and turns red only when encumbered or overloaded.',
      ],
    },
  },
  {
    versione: '3.9.54',
    voci: {
      it: [
        'Nuovo Design Sezione Diario di Sessione: interfaccia completamente ridisegnata con schede cronaca eleganti, testata moderna, tag rapidi D&D (👤 PNG, 📜 Quest, 🗺️ Luoghi, 💰 Bottino, ⚔️ Scontri) e anteprima rapida ad apertura fluida.',
      ],
      en: [
        'New Session Journal Design: completely revamped UI featuring elegant chronicle cards, modern header, rapid D&D tags (👤 NPC, 📜 Quest, 🗺️ Locations, 💰 Loot, ⚔️ Combats) and smooth expanding preview.',
      ],
    },
  },
  {
    versione: '3.9.53',
    voci: {
      it: [
        'Indicatore Cloud con Spunta e Avviso: il pulsante Cloud mostra ora una spunta verde (✓) quando la sincronizzazione automatica è attiva e un avviso (⚠️) se i dati sono salvati solo localmente.',
      ],
      en: [
        'Cloud Indicator with Checkmark and Warning: the Cloud button now shows a green checkmark (✓) when auto-sync is active and a warning (⚠️) if data is only stored locally.',
      ],
    },
  },
  {
    versione: '3.9.52',
    voci: {
      it: [
        'Famigli & Creature Evocate: aggiunta sezione dedicata con statblock completi per famigli (Gufo, Pseudodrago, Imp, Quasit) ed evocazioni magiche (Elementale del Fuoco, Spirito Guardiano), consultabili con un tocco.',
      ],
      en: [
        'Familiars & Summons: added dedicated section with full statblocks for familiars (Owl, Pseudodragon, Imp, Quasit) and magical summons (Fire Elemental, Spirit Guardian), accessible with one tap.',
      ],
    },
  },
  {
    versione: '3.9.51',
    voci: {
      it: [
        'Creazione Guidata con Anteprima Tiri Salvezza: nella creazione del personaggio viene ora mostrato il riepilogo in tempo reale dei Tiri Salvezza e delle competenze in armi/armature associate alla classe scelta.',
      ],
      en: [
        'Character Creation Saving Throws Preview: the creation wizard now displays a live preview of class saving throws and weapon/armor proficiencies as soon as a class is selected.',
      ],
    },
  },
  {
    versione: '3.9.50',
    voci: {
      it: [
        'Sincronizzazione Tiri Salvezza contro Morte e PF: le modifiche a PF, PF temporanei e successi/fallimenti contro morte effettuate nel Combat Tracker si riflettono all\'istante in tempo reale sulla scheda del personaggio attivo.',
      ],
      en: [
        'Death Saves & HP Real-Time Sync: changes to HP, temp HP, and death save successes/failures inside the Combat Tracker now immediately reflect on the active character sheet.',
      ],
    },
  },
  {
    versione: '3.9.49',
    voci: {
      it: [
        'Condivisione con QR Code: nella finestra Stanza per la condivisione tra giocatori compare ora un QR Code inquadrabile con la fotocamera dello smartphone per entrare e caricare il personaggio al volo senza digitare.',
      ],
      en: [
        'QR Code Room Sharing: the temporary Room share window now displays a scannable QR Code to instantly join and import character sheets on mobile without typing.',
      ],
    },
  },
  {
    versione: '3.9.48',
    voci: {
      it: [
        'Generazione Rapida Mostri nel Combat Tracker: aggiunta la possibilità di inserire all\'istante creature e mostri dal bestiario (es. Lupi, Orsi, Coccodrilli, Ragnatele giganti) con CA, PF e iniziativa già calcolati per round di combattimento immediati.',
      ],
      en: [
        'Quick Monster Spawn in Combat Tracker: instantly add beasts and monsters from the bestiary (e.g. Wolves, Bears, Giant Spiders) with pre-calculated AC, HP, and initiative for rapid battle setup.',
      ],
    },
  },
  {
    versione: '3.9.47',
    voci: {
      it: [
        'Forma Selvatica & Bestiario Druido: sezione dedicata per Druidi (dal 2° livello) con catalogo interattivo di tutte le forme bestiali disponibili in base a livello e sottoclasse, statblock completo (CA, PF, caratteristiche, velocità, tratti e attacchi) e trasformazione con PF temporanei.',
      ],
      en: [
        'Wild Shape & Druid Bestiary: dedicated section for Druids (level 2+) with interactive beast catalogue filtered by level and subclass, full statblock display (AC, HP, abilities, speed, traits, attacks), and one-click transform with temporary HP.',
      ],
    },
  },
  {
    versione: '3.9.46',
    voci: {
      it: [
        'Inventario Zaino vs Equipaggiato: aggiunti filtri rapidi di visualizzazione (📦 Tutti, 🛡️ Indossati, 🎒 Nello Zaino) e conteggio dettagliato del peso indossato rispetto a quello stipato nello zaino.',
      ],
      en: [
        'Inventory Backpack vs Equipped: quick view filters (📦 All, 🛡️ Equipped, 🎒 In Backpack) and detailed weight breakdown for worn gear vs items stowed in backpack.',
      ],
    },
  },
  {
    versione: '3.9.45',
    voci: {
      it: [
        'Mobile Card View per Attacchi & Combattimento: su smartphone le tabelle di Azioni, Azioni Bonus e Reazioni diventano schede responsive touch-friendly con tiri dado immediati senza scorrimenti orizzontali.',
      ],
      en: [
        'Mobile Card View for Attacks & Combat: on mobile screens, Action, Bonus Action, and Reaction tables transform into touch-friendly cards with instant dice rolls and zero horizontal scroll.',
      ],
    },
  },
  {
    versione: '3.9.44',
    voci: {
      it: [
        'Filtri Rapidi Grimorio: aggiunte pillole di filtro rapido per incantesimi in combattimento (🎯 Tutti, ⭐ Solo Preparati, ⚡ Azione, ⏳ Azione Bonus, 🛡️ Reazione, 🧠 Concentrazione, 📜 Rituali).',
        'Interfaccia pulita: rimossi i banner persistenti di aggiornamento e archiviazione.',
      ],
      en: [
        'Spellbook Fast Combat Filters: quick filter pill buttons for combat spells (🎯 All, ⭐ Prepared, ⚡ Action, ⏳ Bonus Action, 🛡️ Reaction, 🧠 Concentration, 📜 Rituals).',
        'Clean UI: removed sticky update and storage banners.',
      ],
    },
  },
  {
    versione: '3.9.43',
    voci: {
      it: [
        'Miglioramento notifiche: aggiunto pulsante di chiusura ✕ sia al banner di aggiornamento versione che all\'avviso di persistenza; rimosso l\'allarme falso positivo di persistenza immagini su browser restrittivi.',
      ],
      en: [
        'Banner improvements: added dismiss ✕ button to both version update and storage warning banners; removed false-positive image persistence error in restrictive browser environments.',
      ],
    },
  },
  {
    versione: '3.9.42',
    voci: {
      it: [
        'Quality of Life: Modale interattiva per Riposo Breve (spesa Dadi Vita con tiro e ricarica risorse) e Riposo Lungo completo, badge colorati e luminosi per le Condizioni di stato con spiegazione effetti, e indicatore di sincronizzazione Cloud in tempo reale (🟢/🟠/🔄).',
      ],
      en: [
        'Quality of Life: Interactive Rest dialogs for Short Rest (spend Hit Dice with animated roll & recharge) and Long Rest, vibrant status condition badges with detailed effect tooltips, and real-time Cloud sync status indicator (🟢/🟠/🔄).',
      ],
    },
  },
  {
    versione: '3.9.41',
    voci: {
      it: [
        'Sezione Diario potenziata: barra di tag rapidi D&D (👤 PNG, 📜 Obiettivo, 🗺️ Luogo, 💰 Bottino, ⚔️ Scontro, 💡 Indizio), pulsante per esportare e scaricare il diario in formato Markdown (.md), ricerca istantanea migliorata e grafica a schede evidenziate.',
      ],
      en: [
        'Upgraded Session Journal: quick D&D tag toolbar (👤 NPC, 📜 Quest, 🗺️ Location, 💰 Loot, ⚔️ Combat, 💡 Clue), export & download journal as Markdown (.md), enhanced search bar, and highlighted session card design.',
      ],
    },
  },
  {
    versione: '3.9.40',
    voci: {
      it: [
        'Nomi puliti in italiano: rimossi i termini inglesi tra parentesi da armi (es. "Ascia" anziché "Ascia (Handaxe)"), reazioni e azioni bonus.',
      ],
      en: [
        'Clean naming: removed parenthetical English terms from Italian weapon names, reactions, and bonus actions.',
      ],
    },
  },
  {
    versione: '3.9.39',
    voci: {
      it: [
        'Competenze: anteprime dei menù aggiornate con l’elenco effettivo delle voci possedute separate da virgola e spazio (senza diciture generiche o contatori +N), e rimossa la voce ridondante "nessuna categoria" dal selettore Categorie Armi.',
      ],
      en: [
        'Proficiencies: dropdown previews now display the actual comma-separated list of proficiencies, and removed redundant "no category" option from Weapon Categories.',
      ],
    },
  },
  {
    versione: '3.9.38',
    voci: {
      it: [
        'Sezione Competenze potenziata: grafica con testata oro e contrasto nitido (sia in tema scuro che chiaro), suddivisione in gruppi tematici (armi semplici/guerra, strumenti musicali/artigianali, lingue standard/esotiche), barra di ricerca rapida 🔍 e possibilità di aggiungere voci personalizzate.',
      ],
      en: [
        'Upgraded Proficiencies section: gold header design with crisp contrast (dark and light themes), thematic groupings (simple/martial weapons, musical/artisan tools, standard/exotic languages), quick search bar 🔍, and custom entries support.',
      ],
    },
  },
  {
    versione: '3.9.37',
    voci: {
      it: [
        'Sezione Reazioni: il menù rapido e i suggerimenti propongono ora incantesimi di reazione (Scudo, Controincantesimo, Caduta Morbida...) e reazioni tattiche (Attacco di opportunità, Schivata prodigiosa...) anziché le normali armi.',
      ],
      en: [
        'Reactions section: quick menu and suggestions now offer reaction spells (Shield, Counterspell, Feather Fall...) and tactical reactions (Opportunity Attack, Uncanny Dodge...) instead of weapons.',
      ],
    },
  },
  {
    versione: '3.9.36',
    voci: {
      it: [
        'Pannello Notifiche: dicitura della versione in uso aggiornata a "Versione Attuale".',
      ],
      en: [
        'Notifications panel: active version label updated to "Current Version".',
      ],
    },
  },
  {
    versione: '3.9.35',
    voci: {
      it: [
        'Sezione Competenze: aggiunto menù Categorie Armi (Semplici, Guerra, Entrambe) e catalogo completo delle singole armi con evidenziazione in nero scuro per le competenze possedute.',
        'Menù a tendina interattivi per Armature, Categorie Armi, Armi, Strumenti e Lingue: tutte le opzioni sono visibili con spunta ✓ e colore nero intenso solo per le competenze possedute.',
      ],
      en: [
        'Proficiencies section: added Weapon Categories dropdown (Simple, Martial, Both) and complete weapon catalog with dark bold highlight for owned proficiencies.',
        'Interactive dropdowns for Armor, Weapon Categories, Weapons, Tools, and Languages: all options visible with checkmark ✓ and deep dark black only for owned proficiencies.',
      ],
    },
  },
  {
    versione: '3.9.34',
    voci: {
      it: [
        'Layout e simmetria: Competenze allineata perfettamente a Riposo e Sfinimento (riga 3); Risorse di classe allineata da Percezione Passiva a Ispirazione (righe 4-5).',
      ],
      en: [
        'Layout symmetry: Proficiencies perfectly aligned with Rest & Exhaustion (row 3); Class Resources aligned from Passive Perception to Inspiration (rows 4-5).',
      ],
    },
  },
  {
    versione: '3.9.33',
    voci: {
      it: [
        'Sezione "Addestramento" rinominata in "Competenze".',
      ],
      en: [
        'Section "Training" renamed to "Proficiencies".',
      ],
    },
  },
  {
    versione: '3.9.32',
    voci: {
      it: [
        'Sezione rinominata in "Notifiche" e rimossa la voce ridondante "Nessun avviso: è tutto a posto".',
      ],
      en: [
        'Section renamed to "Notifications" and removed the redundant "No alerts: all clear" item.',
      ],
    },
  },
  {
    versione: '3.9.31',
    voci: {
      it: [
        'Addestramento: rimossi trattini e frecce doppie, diciture pulite ed essenziali.',
        'Armi: aprendo il menù a tendina vengono dettagliate tutte le singole armi semplici o da guerra.',
        'Lingue: da chiusa la tendina mostra solo la lingua principale senza conteggi o testi ridondanti.',
      ],
      en: [
        'Proficiencies: removed dashes and double arrows, clean and essential look.',
        'Weapons: opening the dropdown lists all individual simple or martial weapons.',
        'Languages: closed dropdown shows only the primary language without extra voice counts.',
      ],
    },
  },
  {
    versione: '3.9.30',
    voci: {
      it: [
        'Ambientazione: rimossi i pulsanti ridondanti "Passa alla notte" e "Audio personalizzato" per un menù più rapido e compatto.',
      ],
      en: [
        'Atmosphere panel: removed redundant "Switch to night" and "Custom audio" buttons for a cleaner, faster menu.',
      ],
    },
  },
  {
    versione: '3.9.29',
    voci: {
      it: [
        'Addestramento compatto: solo menù a tendina di consultazione (armi, strumenti, lingue, armature) senza ingombri.',
        'Azioni PG su mobile: gli 8 pulsanti ora sono distribuiti a tutta larghezza in una singola riga uniforme.',
        'Tiri D20 su mobile: griglia simmetrica a 4 colonne per Normale, Vantaggio, Svantaggio e Cronologia.',
        'Incantesimi: livelli collassabili singolarmente e tasto globale "⇕ Riduci/Espandi livelli".',
        'Diario di Avventura: ricerca in tempo reale, sessioni comprimibili con anteprima, tag #sessione, data "Oggi" e copia.',
        'Header mobile: i 7 pulsanti in alto si dispongono perfettamente su 1 singola riga.',
      ],
      en: [
        'Proficiencies: compact read-only dropdowns for armors, weapons, tools, and languages.',
        'Character actions on mobile: 8 action buttons evenly distributed on 1 full-width row.',
        'D20 roll buttons on mobile: balanced 4-column grid for Normal, Advantage, Disadvantage, and History.',
        'Spells: collapsible spell levels and global "⇕ Collapse/Expand all levels" toggle.',
        'Adventure Journal: instant search filter, collapsible entries with preview, #tags, "Today" button, and copy.',
        'Mobile header: all 7 top action buttons fit cleanly on a single row.',
      ],
    },
  },
  {
    versione: '3.9.22',
    voci: {
      it: [
        'Backup non distruttivo: il sync non sovrascrive più un roster più grande con uno più piccolo.',
        'Import Frost/Elevorn ora prende correttamente razza e abilità di background.',
        'Taglia Media di default alla creazione, modificabile.',
      ],
      en: [
        'Non-destructive backup: sync no longer overwrites a larger roster with a smaller one.',
        'Frost/Elevorn import now correctly picks race and background skills.',
        'Size Medium by default at creation, editable.',
      ],
    },
  },
  {
    versione: '3.9.21',
    voci: {
      it: [
        'Tasto Lingua mostra la bandiera della lingua caricata (🇮🇹/🇬🇧).',
      ],
      en: [
        'Language button now shows the flag of the loaded language.',
      ],
    },
  },
  {
    versione: '3.9.20',
    voci: {
      it: [
        'Sincronizzazione fallback URL per Worker e backup più robusto.',
      ],
      en: [
        'Sync fallback URL for Worker and more robust backup.',
      ],
    },
  },
  {
    versione: '3.9.19',
    voci: {
      it: [
        'Fix sync 409 per roster più piccolo con timestamp vecchio.',
      ],
      en: [
        'Fix sync 409 for smaller roster with old timestamp.',
      ],
    },
  },
  {
    versione: '3.9.18',
    voci: {
      it: [
        'Elevorn triclasse ora mostra totale 10 (1+6+3) nel selettore PG.',
        'Menu Carica ora collassabile.',
      ],
      en: [
        'Elevorn triclass now shows total 10 (1+6+3) in PG selector.',
        'Load menu now collapsible.',
      ],
    },
  },
  {
    versione: '3.9.17',
    voci: {
      it: [
        'Import versione 5.0 a sinistra, 5.5 a destra.',
      ],
      en: [
        'Import version 5.0 left, 5.5 right.',
      ],
    },
  },
  {
    versione: '3.9.16',
    voci: {
      it: [
        'Menu: ora specchio dei tasti in alto (Nuovo → Carica → Cloud/Annulla/Esporta/Importa/Avvisi/Lingua) + PG Casuale sotto Carica.',
        'Import: dopo la scelta dei file chiedi subito 5e (2014) a sinistra / 5.5 (2024) a destra.',
        'Sottotitolo D&D 5e/5.5 rimosso; tasto Lingua ora mostra la bandiera della lingua caricata.',
      ],
      en: [
        'Menu now mirrors top buttons (New → Load → Cloud/Undo/Export/Import/Alerts/Language) + Random PG under Load.',
        'Import: after picking files, choose 5e (2014) left / 5.5 (2024) right.',
        'Subtitle removed; Language button now shows the loaded flag.',
      ],
    },
  },
  {
    versione: '3.9.15',
    voci: {
      it: [
        'PG Casuale sotto Carica, rimossi Link/Import/IA duplicati dal menu.',
        'Backup: Archivio DM ora dentro Backup dopo Versioni.',
      ],
      en: [
        'Random PG under Load, removed duplicate Link/Import/AI from menu.',
        'Backup: DM Archive now inside Backup after Versions.',
      ],
    },
  },
  {
    versione: '3.9.14',
    voci: {
      it: [
        'Menu: titolo con versione vX e bottone Carica dedicato.',
        'Import con scelta edizione già attivo dalla 3.9.10.',
      ],
      en: [
        'Menu: title with version and dedicated Load button.',
        'Import with edition choice already active since 3.9.10.',
      ],
    },
  },
  {
    versione: '3.8.6',
    voci: {
      it: [
        'Importa ora accetta anche JPG/PNG/WebP (oltre a JSON/PDF) — il Finder mostra le immagini e la trascrizione IA è gratis via Cloudflare.',
        'Su telefono i 10 tasti in alto sono ordinati in 2 file da 5, solo icone, tutti uguali.',
        'Versione allineata con tabular-nums e "Addestramento" in una riga sola.',
        'Archivio DM: cancellando un PG sparisce anche per il DM; ultimo PG → Menu, niente Avventuriero fantoccio.',
      ],
      en: [
        'Import now also accepts JPG/PNG/WebP (besides JSON/PDF) — Finder shows images and AI transcription is free via Cloudflare.',
        'On phone the 10 top buttons are ordered in 2 rows of 5, icons only, all equal.',
        'Version aligned with tabular-nums and "Addestramento" in one line.',
        'DM archive: deleting a character also removes it for the DM; last character → Menu, no dummy Adventurer.',
      ],
    },
  },
  {
    versione: '3.7.0',
    voci: {
      it: [
        'Borsa Conservante: gli oggetti dentro non pesano più sull’ingombro (spazio extradimensionale).',
        'Sincronizzazione via codice e stanze temporanee stabilizzate (Worker aggiornato).',
      ],
      en: [
        'Bag of Holding: items inside no longer count toward encumbrance (extradimensional space).',
        'Code sync and temporary rooms stabilized (Worker updated).',
      ],
    },
  },
  {
    versione: '3.6.0',
    voci: {
      it: [
        'Nuovo pulsante 🔔 Avvisi: promemoria e novità in un pannello, con un puntino che avvisa quando c\u2019è qualcosa da vedere.',
        'Spariti i due riquadri a tutta larghezza in cima alla pagina.',
        'Il titolo si è spostato al centro della barra dei dadi: una riga in meno.',
      ],
      en: [
        'New 🔔 Alerts button: reminders and news in one panel, with a dot when something needs your attention.',
        'The two full-width banners at the top of the page are gone.',
        'The title moved into the middle of the dice bar: one row less.',
      ],
    },
  },
  {
    versione: '3.5.3',
    voci: {
      it: [
        'Titolo leggibile anche sopra la foto del luogo, in tema chiaro.',
      ],
      en: [
        'The title stays readable over the location photo in light theme.',
      ],
    },
  },
  {
    versione: '3.5.0',
    voci: {
      it: [
        'Le condizioni ora spiegano cosa comportano, sommate fra loro.',
        'Diario di sessione per ogni personaggio, con voci datate.',
        'Fonte di Magia: converti slot in Punti Stregoneria e viceversa.',
        'Stampa della scheda o salvataggio in PDF dal Menu.',
      ],
      en: [
        'Conditions now explain what they do, combined together.',
        'Session journal for each character, with dated entries.',
        'Font of Magic: convert spell slots into Sorcery Points and back.',
        'Print the sheet or save it as PDF from the Menu.',
      ],
    },
  },
  {
    versione: '3.2.0',
    voci: {
      it: [
        'Corretto: il riposo ricarica le risorse di classe invece di azzerarle.',
      ],
      en: [
        'Fixed: resting now refills class resources instead of emptying them.',
      ],
    },
  },
  {
    versione: '3.0.0',
    voci: {
      it: [
        'Archivio DM: un personaggio per riga, le copie vecchie si aprono a parte.',
        'Sincronizzazione fra dispositivi con un codice, senza account.',
        'Corretto: le immagini non spariscono più quando la rete è lenta.',
      ],
      en: [
        'DM archive: one character per row, older copies open separately.',
        'Sync between devices with a code, no account needed.',
        'Fixed: portraits no longer disappear when the network is slow.',
      ],
    },
  },
];

/** Le novità da mostrare: le più recenti, al massimo `quante` versioni. */
export function novitaRecenti(quante = 3) {
  return NOVITA.slice(0, quante);
}

/** Versione più recente presente nell'elenco (per capire se ci sono novità non lette). */
export function ultimaVersioneNovita() {
  return NOVITA[0]?.versione || '';
}
