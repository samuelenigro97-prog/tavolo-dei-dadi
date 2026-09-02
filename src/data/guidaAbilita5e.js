/**
 * Guida ufficiale alle 18 Abilita e agli Strumenti di D&D 5e (PHB + Xanathars Guide to Everything).
 * Include descrizioni, tabelle CD di riferimento (5, 10, 15, 20, 25, 30) e sinergie con strumenti.
 */

export const GUIDA_ABILITA_5E = {
  atletica: {
    nomeIt: "Atletica",
    nomeEn: "Athletics",
    car: "forza",
    descrizioneIt: "Copre situazioni difficili in cui devi scalare pareti scoscese, saltare burroni, nuotare controcorrente, sfondare ostacoli o afferrare/spingere creature in lotta.",
    descrizioneEn: "Covers difficult situations you encounter while climbing, jumping, swimming, shoving, grappling, or breaking objects.",
    esempiCd: [
      { cd: 5, diffIt: "Molto Facile", diffEn: "Very Easy", esIt: "Arrampicarsi su una fune annodata o nuotare in acque calme.", esEn: "Climb a knotted rope or swim in calm water." },
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Scalare una parete con molti appigli naturali o saltare un fossato standard.", esEn: "Climb a rough wall with plentiful handholds or jump across a standard ditch." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Nuotare contro corrente moderata o scalare una roccia umida.", esEn: "Swim against a moderate current or scale a slick cliff." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Arrampicarsi su una superficie scivolosa con pochissimi appigli o sfondare una porta di quercia rinforzata.", esEn: "Climb a slippery surface with few handholds or bash through a reinforced oak door." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Nuotare contro una tempesta marina impetuosa o saltare oltre i normali limiti fisici.", esEn: "Swim in storm waters or leap beyond normal physical boundaries." },
      { cd: 30, diffIt: "Quasi Impossibile", diffEn: "Nearly Impossible", esIt: "Scalare una parete liscia di ghiaccio o sfondare un portone di ferro massiccio.", esEn: "Climb a smooth wall of ice or smash open a massive iron gate." }
    ],
    sinergieStrumenti: [
      { strumento: "Attrezzi da Fabbro", beneficioIt: "Vantaggio nello sfondare porte corazzate o distruggere grate e catene metalliche.", beneficioEn: "Advantage on smashing armored doors or breaking metal grates/chains." },
      { strumento: "Attrezzi da Muratore", beneficioIt: "Vantaggio nel distruggere o aprirsi un varco attraverso muri e strutture in pietra.", beneficioEn: "Advantage on breaching stone walls and structures." },
      { strumento: "Veicoli (acquatici)", beneficioIt: "Vantaggio nel mantenere il controllo dei remi in rapide o acque turbolente.", beneficioEn: "Advantage on rowing through rapids or turbulent waters." },
      { strumento: "Attrezzi da Carpentiere", beneficioIt: "Vantaggio nello sfondare o puntellare strutture in legno.", beneficioEn: "Advantage on breaking or bracing wooden structures." }
    ]
  },
  acrobazia: {
    nomeIt: "Acrobazia",
    nomeEn: "Acrobatics",
    car: "destrezza",
    descrizioneIt: "Copre i tuoi tentativi di rimanere in piedi in situazioni precarie (su ghiaccio sottile, su una fune tesa o su un ponte oscillante) e di eseguire manovre acrobatiche come capriole e salti mortali.",
    descrizioneEn: "Covers your attempts to stay on your feet in tricky situations, such as running across sheet ice, balancing on a tightrope, or escaping a grapple.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Camminare su una superficie inclinata o su una passerella di legno stretta.", esEn: "Walk across an inclined surface or narrow wooden plank." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Rimanere in equilibrio su una fune o atterrare agilmente su terreno accidentato dopo una caduta.", esEn: "Balance on a tightrope or land safely on rough terrain." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Attraversare una superficie ricoperta d\x27olio o ghiaccio durante una scossa di terremoto.", esEn: "Cross an oil-slicked or icy surface during a tremor." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Eseguire capriole acrobatiche tra le travi di un soffitto oscillante evitando ostacoli.", esEn: "Tumble across swinging rafters while dodging hazards." }
    ],
    sinergieStrumenti: [
      { strumento: "Veicoli (terrestri)", beneficioIt: "Vantaggio nel saltare al volo da o verso una carrozza in corsa.", beneficioEn: "Advantage on leaping to or from a moving vehicle." },
      { strumento: "Strumento Musicale", beneficioIt: "Vantaggio nel combinare danze acrobatiche coreografate con la musica.", beneficioEn: "Advantage on combining acrobatic dance with music." }
    ]
  },
  furtivita: {
    nomeIt: "Furtivita",
    nomeEn: "Stealth",
    car: "destrezza",
    descrizioneIt: "Effettui una prova di Furtivita quando tenti di nasconderti dai nemici, muoverti senza fare rumore o scivolare via senza farti notare.",
    descrizioneEn: "Make a Stealth check when you attempt to conceal yourself from enemies, slink past guards, or slip away without being noticed.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Muoversi silenziosamente nel bosco di notte con vento leggero.", esEn: "Move quietly in the woods at night with light wind." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Passare inosservato alle spalle di una guardia distratta o su un pavimento di pietra.", esEn: "Slip past an inattentive guard on stone flooring." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Attraversare una stanza silenziosa su un pavimento di assi di legno scricchiolanti.", esEn: "Cross a quiet room with squeaky floorboards." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Nascondersi in un ambiente privo di coperture pesanti solo sfruttando ombre sfuggenti.", esEn: "Hide in sparse shadows under active observation." }
    ],
    sinergieStrumenti: [
      { strumento: "Kit da Travestimento", beneficioIt: "Vantaggio nel mimetizzarsi e fondersi con la folla o l\x27ambiente circostante.", beneficioEn: "Advantage on blending into crowds or camouflage." },
      { strumento: "Arnesi da Scasso", beneficioIt: "Vantaggio nel manomettere serrature in totale silenzio senza allertare le guardie vicine.", beneficioEn: "Advantage on picking locks silently without alerting nearby sentries." }
    ]
  },
  rapiditaDiMano: {
    nomeIt: "Rapidita di Mano",
    nomeEn: "Sleight of Hand",
    car: "destrezza",
    descrizioneIt: "Copre trucchi di prestigio, borseggi, nascondere oggetti sul proprio corpo o compiere azioni manuali senza che nessuno se ne accorga.",
    descrizioneEn: "Covers acts of legerdemain or manual trickery, such as planting something on someone else or concealing an object on your person.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Nascondere una moneta nella manica o sfilare una mela da un cesto.", esEn: "Palm a coin or slip an apple from a stall." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Borseggiare un borsello dalla cintura di un viandante o sostituire un bicchiere.", esEn: "Pickpocket a pouch from a belt or swap glasses unseen." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Sfilare le chiavi dal mazzo di una guardia attenta mentre le parli.", esEn: "Slip keys from an alert guard’s ring while speaking." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Sfilare un anello dal dito di un nobile senza che questi percepisca alcun contatto.", esEn: "Slip a ring off a nobles finger unnoticed." }
    ],
    sinergieStrumenti: [
      { strumento: "Arnesi da Scasso", beneficioIt: "Vantaggio nel nascondere o disarmare meccanismi di innesco a mano libera.", beneficioEn: "Advantage on concealing or disarming triggers with free hands." },
      { strumento: "Carte da Gioco", beneficioIt: "Vantaggio nel truccare il mazzo, distribuire carte false o barare al tavolo.", beneficioEn: "Advantage on stacking the deck, dealing fake cards, or cheating." },
      { strumento: "Dadi", beneficioIt: "Vantaggio nell\x27introdurre e tirare dadi truccati senza farsi scoprire.", beneficioEn: "Advantage on introducing loaded dice undetected." },
      { strumento: "Kit da Travestimento", beneficioIt: "Vantaggio nel nascondere armi corte o arnesi tra le pieghe del costume.", beneficioEn: "Advantage on concealing small weapons or tools within a costume." }
    ]
  },
  arcano: {
    nomeIt: "Arcano",
    nomeEn: "Arcana",
    car: "intelligenza",
    descrizioneIt: "Misura la tua conoscenza degli incantesimi, degli oggetti magici, dei simboli arcani, delle tradizioni magiche, dei piani di esistenza e degli abitanti di quei piani.",
    descrizioneEn: "Measures your ability to recall lore about spells, magic items, eldritch symbols, magical traditions, the planes of existence, and their inhabitants.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Identificare un trucchetto o incantesimo di 1° livello comune.", esEn: "Identify a common cantrip or 1st-level spell." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Riconoscere la scuola di magia di un\x27aura o le proprieta di un oggetto non comune.", esEn: "Determine the school of magic of an aura or properties of an uncommon item." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Decifrare un circolo di teletrasporto o le proprieta di una reliquia rara.", esEn: "Decipher a teleportation circle or properties of a rare relic." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Comprendere il funzionamento di un artefatto leggendario o di un varco planare instabile.", esEn: "Understand the mechanics of a legendary artifact or planar rift." }
    ],
    sinergieStrumenti: [
      { strumento: "Attrezzi da Alchimista", beneficioIt: "Vantaggio nell\x27analizzare sostanze magiche, pozioni e residui di trasmutazione.", beneficioEn: "Advantage on analyzing magical substances, potions, and transmutation residue." },
      { strumento: "Strumenti da Calligrafo", beneficioIt: "Vantaggio nel decifrare rune antiche o copiare pergamene arcane complesse.", beneficioEn: "Advantage on deciphering ancient runes or copying arcane scrolls." }
    ]
  },
  storia: {
    nomeIt: "Storia",
    nomeEn: "History",
    car: "intelligenza",
    descrizioneIt: "Misura la tua capacita di ricordare informazioni storiche su eventi passati, leggende, regni scomparsi, dinastie, guerre e dispute araldiche.",
    descrizioneEn: "Measures your ability to recall lore about historical events, legendary people, ancient kingdoms, past disputes, and wars.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Ricordare i regnanti attuali della regione o una guerra recente.", esEn: "Recall current local rulers or a recent war." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Conoscere le origini di una casata nobiliare o di una citta antica.", esEn: "Know the origins of a noble house or ancient city." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Identificare il fondatore di un antico impero sepolto o le cause di una caduta millenaria.", esEn: "Identify the founder of a fallen empire or ancient collapse." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Ricordare i dettagli dimenticati di una dinastia pre-cataclisma.", esEn: "Recall forgotten details of a pre-cataclysm dynasty." }
    ],
    sinergieStrumenti: [
      { strumento: "Attrezzi da Cartografo", beneficioIt: "Vantaggio nel ricostruire confini territoriali scomparsi o antiche rotte commerciali.", beneficioEn: "Advantage on mapping lost borders or ancient trade routes." },
      { strumento: "Attrezzi da Muratore", beneficioIt: "Vantaggio nel determinare la datazione e lo stile architettonico di rovine storiche.", beneficioEn: "Advantage on dating and identifying the architectural era of ruins." },
      { strumento: "Strumenti da Calligrafo", beneficioIt: "Vantaggio nell\x27identificare l\x27autore o il periodo di un manoscritto d\x27epoca.", beneficioEn: "Advantage on identifying the author or era of vintage manuscripts." }
    ]
  },
  indagare: {
    nomeIt: "Indagare",
    nomeEn: "Investigation",
    car: "intelligenza",
    descrizioneIt: "Cerchi indizi, deduci conclusioni a partire da prove, deduci la posizione di scomparti segreti, comprendi il funzionamento di meccanismi complessi o individui ferite su un cadavere.",
    descrizioneEn: "When you look around for clues and make deductions based on those clues, you make an Investigation check.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Trovare un documento nascosto frettolosamente in una scrivania.", esEn: "Find a document hastily hidden in a desk." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Individuare la leva di un pannello segreto o dedurre l\x27arma usata in un delitto.", esEn: "Locate a secret panel lever or deduce the murder weapon." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Ricostruire la sequenza temporale di una scena del crimine o trovare una cassaforte murata.", esEn: "Reconstruct a crime scene timeline or locate a hidden wall safe." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Decifrare un meccanismo a combinazione complessa senza fare scattare il blocco.", esEn: "Decipher a complex combination lock mechanism without tripping locks." }
    ],
    sinergieStrumenti: [
      { strumento: "Arnesi da Scasso", beneficioIt: "Vantaggio nel dedurre come e costruita internamente una trappola o serratura complessa.", beneficioEn: "Advantage on deducing internal trap or lock mechanisms." },
      { strumento: "Kit da Falsario", beneficioIt: "Vantaggio nello scoprire se un documento, firma o sigillo e stato alterato o falsificato.", beneficioEn: "Advantage on determining if documents, signatures, or seals are forged." },
      { strumento: "Attrezzi da Muratore", beneficioIt: "Vantaggio nell\x27individuare porte segrete nella roccia o debolezze statiche nei soffitti.", beneficioEn: "Advantage on detecting secret stone doors or structural ceiling flaws." }
    ]
  },
  natura: {
    nomeIt: "Natura",
    nomeEn: "Nature",
    car: "intelligenza",
    descrizioneIt: "Misura la tua capacita di ricordare nozioni sul terreno, piante e animali, il clima e i cicli naturali.",
    descrizioneEn: "Measures your ability to recall lore about terrain, plants and animals, weather, and natural cycles.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Riconoscere una pianta medicinale comune o prevedere la pioggia del giorno.", esEn: "Identify a common medicinal plant or predict rain." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Identificare le abitudini di una bestia selvatica o funghi velenosi commestibili sotto trattamento.", esEn: "Identify a wild beast’s habits or treatable poisonous fungi." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Riconoscere flora esotica del Sottosuolo o prevedere anomalie vulcaniche/climatiche.", esEn: "Identify Underdark flora or predict volcanic/climate anomalies." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Comprendere le interazioni ecologiche di un mostro o aberrazione con la fauna locale.", esEn: "Understand an aberration’s ecological disruption on local fauna." }
    ],
    sinergieStrumenti: [
      { strumento: "Borsa da Erborista", beneficioIt: "Vantaggio nell\x27identificare piante officinali, erbe rare e tossine vegetali.", beneficioEn: "Advantage on identifying herbs, rare plants, and floral toxins." },
      { strumento: "Strumenti da Avvelenatore", beneficioIt: "Vantaggio nell\x27isolare ghiandole velenifere da insetti o rettili selvatici.", beneficioEn: "Advantage on harvesting venom sacs from vermin or reptiles." },
      { strumento: "Attrezzi da Cuoco", beneficioIt: "Vantaggio nel determinare quali piante e bacche selvatiche sono commestibili.", beneficioEn: "Advantage on determining edible wild plants and berries." }
    ]
  },
  religione: {
    nomeIt: "Religione",
    nomeEn: "Religion",
    car: "intelligenza",
    descrizioneIt: "Misura la tua conoscenza delle divinita, dei miti sacri, dei riti, delle preghiere, delle gerarchie dei templi e dei simboli religiosi.",
    descrizioneEn: "Measures your ability to recall lore about deities, rites, prayers, religious hierarchies, holy symbols, and the practices of secret cults.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Riconoscere il simbolo sacro di una divinita maggiore del pantheon.", esEn: "Recognize the holy symbol of a major deity." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Identificare i dogmi e i tabu di un culto o le funzioni di un altare antico.", esEn: "Identify cult tenets, taboos, or functions of an ancient altar." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Riconoscere i rituali sacrileghi di un culto segreto o semidei dimenticati.", esEn: "Recognize profane rites of a secret cult or forgotten demigod." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Comprendere eresie cosmiche o il funzionamento di sacre reliquie millenarie.", esEn: "Understand cosmic heresies or the inner workings of ancient holy relics." }
    ],
    sinergieStrumenti: [
      { strumento: "Strumenti da Calligrafo", beneficioIt: "Vantaggio nel decifrare o trascrivere antichi testi sacri in linguaggi liturgici.", beneficioEn: "Advantage on deciphering or copying sacred scriptures in liturgical tongues." },
      { strumento: "Attrezzi da Pittore", beneficioIt: "Vantaggio nell\x27interpretare affreschi religiosi ed emblemi sacri nascosti.", beneficioEn: "Advantage on interpreting religious frescoes and hidden sacred emblems." }
    ]
  },
  addestrareAnimali: {
    nomeIt: "Addestrare Animali",
    nomeEn: "Animal Handling",
    car: "saggezza",
    descrizioneIt: "Usata per calmare un animale domestico o selvatico spaventato, controllare una cavalcatura durante un combattimento o intuire le intenzioni di una bestia.",
    descrizioneEn: "When there is any question whether you can calm down a domesticated animal, keep a mount from getting spooked, or intuit an animal’s intentions.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Calmare un cane da guardia che ringhia o condurre un bue recalcitrante.", esEn: "Calm a growling guard dog or lead a stubborn ox." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Mantenere il controllo di un cavallo spaventato da fiamme o rumori improvvisi.", esEn: "Control a horse spooked by flames or sudden loud noises." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Convincere un predatore selvatico a non attaccare o farsi accettare da un ippogrifo.", esEn: "Deter an aggressive wild predator or approach a wild hippogriff." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Farsi obbedire da una bestia mostruosa infuriata o addestrare una creatura esotica.", esEn: "Command an enraged beast or tame an exotic creature." }
    ],
    sinergieStrumenti: [
      { strumento: "Veicoli (terrestri)", beneficioIt: "Vantaggio nelle manovre spericolate alla guida di carri trainati da cavalli.", beneficioEn: "Advantage on daring maneuvers with horse-drawn carriages." }
    ]
  },
  intuizione: {
    nomeIt: "Intuizione",
    nomeEn: "Insight",
    car: "saggezza",
    descrizioneIt: "Determini le vere intenzioni di una creatura, scopri se qualcuno sta mentendo, leggi il linguaggio del corpo o prevedi la prossima mossa di qualcuno.",
    descrizioneEn: "Your Insight check decides whether you can determine the true intentions of a creature, such as searching out a lie or predicting someone’s next move.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Capire se un mendicante sta esagerando o se un PNG e visibilmente terrorizzato.", esEn: "Sense if a beggar is exaggerating or an NPC is terrified." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Riconoscere se un mercante sta nascondendo un difetto cruciale della merce.", esEn: "Tell if a merchant is concealing a critical flaw in merchandise." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Smascherare un diplomatico o truffatore esperto con una storia ben orchestrata.", esEn: "See through an experienced diplomat or con artist’s rehearsed lie." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Comprendere le vere motivazioni di un\x27entita ultraterrena o di una spia addestrata.", esEn: "Unravel the true motives of an otherworldly entity or master spy." }
    ],
    sinergieStrumenti: [
      { strumento: "Carte da Gioco", beneficioIt: "Vantaggio nel capire se un avversario sta bluffando al tavolo da gioco.", beneficioEn: "Advantage on reading bluffs at the gaming table." },
      { strumento: "Dadi", beneficioIt: "Vantaggio nell\x27intuire i tic nervosi di giocatori d\x27azzardo avversari.", beneficioEn: "Advantage on picking up opponents gambling tells." }
    ]
  },
  medicina: {
    nomeIt: "Medicina",
    nomeEn: "Medicine",
    car: "saggezza",
    descrizioneIt: "Stabilizzi un compagno morente, diagnostichi una malattia, comprendi la causa di morte su un cadavere o applichi bendaggi d\x27urgenza.",
    descrizioneEn: "A Medicine check lets you try to stabilize a dying companion, diagnose an illness, or determine a corpse’s cause of death.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Stabilizzare un compagno a 0 Punti Ferita (CD 10 standard 5e).", esEn: "Stabilize a dying creature at 0 HP (standard DC 10 in 5e)." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Diagnosticare i sintomi di una malattia comune o capire l\x27ora del decesso.", esEn: "Diagnose common illness symptoms or estimate time of death." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Identificare una pestilenza magica rara o trattare ferite necrotiche.", esEn: "Identify a rare magical plague or treat necrotic wounds." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Trattare veleni sconosciuti o arrestare emorragie devastanti senza magia.", esEn: "Treat alien toxins or staunch catastrophic hemorrhaging without magic." }
    ],
    sinergieStrumenti: [
      { strumento: "Borsa da Erborista", beneficioIt: "Vantaggio nel preparare cataplasmi lenitivi e curare sintomi di avvelenamento naturale.", beneficioEn: "Advantage on brewing soothing poultices and treating natural poisoning." },
      { strumento: "Strumenti da Avvelenatore", beneficioIt: "Vantaggio nel diagnosticare veleni esotici, sintetici o magici su un paziente.", beneficioEn: "Advantage on diagnosing exotic, synthetic, or magical toxins." },
      { strumento: "Attrezzi da Alchimista", beneficioIt: "Vantaggio nel purificare sostanze chimiche o creare disinfettanti ad alta efficacia.", beneficioEn: "Advantage on purifying chemicals or compounding potent antiseptics." }
    ]
  },
  percezione: {
    nomeIt: "Percezione",
    nomeEn: "Perception",
    car: "saggezza",
    descrizioneIt: "Misura la tua capacita di vedere, udire o percepire la presenza di cose nascoste attorno a te: un agguato imminente, conversazioni sussurrate, porte segrete o fumo in lontananza.",
    descrizioneEn: "Lets you spot, hear, or otherwise detect the presence of something: an ambush, whispering behind a door, hidden threats, or smoke in the distance.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Sentire passi pesanti di pattuglie o vedere una lanterna nella nebbia.", esEn: "Hear heavy footsteps or spot a lantern through fog." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Avvertire nemici in agguato nel sottobosco o sentire un sussurro oltre una porta.", esEn: "Spot an ambush in underbrush or overhear a whisper behind a door." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Notare il filo d\x27innesco quasi invisibile di una trappola a terra.", esEn: "Spot a hair-thin tripwire on the floor." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Scorgere un cecchino perfettamente mimetizzato tra le fronde di un albero a distanza.", esEn: "Spot a perfectly camouflaged sniper in tree canopies at distance." }
    ],
    sinergieStrumenti: [
      { strumento: "Strumenti da Navigatore", beneficioIt: "Vantaggio nell\x27avvistare scogli affioranti, coste e banchi di nebbia in mare.", beneficioEn: "Advantage on spotting shoals, coastlines, and sea fogbanks." },
      { strumento: "Attrezzi da Cartografo", beneficioIt: "Vantaggio nell\x27orientarsi riconoscendo picchi e punti di riferimento geografici.", beneficioEn: "Advantage on navigation by recognizing distant terrain landmarks." }
    ]
  },
  sopravvivenza: {
    nomeIt: "Sopravvivenza",
    nomeEn: "Survival",
    car: "saggezza",
    descrizioneIt: "Segui tracce di prede o nemici, cacci selvaggina, trovi acqua e cibo, guidi il gruppo attraverso terre selvagge e previeni pericoli ambientali come sabbie mobili o valanghe.",
    descrizioneEn: "Follow tracks, hunt wild game, guide your allies through wilderness, identify signs of creatures, or avoid natural hazards like quicksand.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Seguire tracce evidenti su fango fresco o trovare acqua in una foresta rigogliosa.", esEn: "Follow clear tracks in mud or locate water in a lush forest." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Trovare cibo per il gruppo in ambiente arido o seguire tracce su terreno roccioso.", esEn: "Forage in arid terrain or follow tracks across rocky ground." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Orientarsi durante una tempesta di neve o prevedere un crollo franoso imminente.", esEn: "Navigate through a blizzard or predict an impending rockslide." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Rintracciare creature volatili o che non lasciano tracce fisiche attraverso il terreno.", esEn: "Track flying creatures or trackless beasts through wilderness." }
    ],
    sinergieStrumenti: [
      { strumento: "Attrezzi da Cartografo", beneficioIt: "Vantaggio nel calcolare distanze e tracciare percorsi sicuri su mappe.", beneficioEn: "Advantage on mapping safe routes and measuring wilderness distances." },
      { strumento: "Strumenti da Navigatore", beneficioIt: "Vantaggio nell\x27orientarsi di notte tramite le stelle senza rischiare di perdersi.", beneficioEn: "Advantage on nighttime navigation using the stars." },
      { strumento: "Borsa da Erborista", beneficioIt: "Vantaggio nel reperire piante nutritive e fonti d\x27acqua pulita in aree ostili.", beneficioEn: "Advantage on finding sustenance and clean water in hostile lands." }
    ]
  },
  inganno: {
    nomeIt: "Inganno",
    nomeEn: "Deception",
    car: "carisma",
    descrizioneIt: "Nascondi la verita, verbalmente o tramite le tue azioni: mentire, sviare un interrogatorio, truffare un mercante, mascherare le tue intenzioni o assumere un travestimento.",
    descrizioneEn: "Your Deception check determines whether you can convincingly hide the truth, either verbally or through your actions (bluffing, misleading, or conning).",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Dire una bugia innocua a una guardia distratta per passare una porta.", esEn: "Tell a white lie to a bored guard to get through a gate." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Sostenere un alibi plausibile ma falso durante un interrogatorio formale.", esEn: "Maintain a plausible but false alibi during formal questioning." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Convincere un nobile diffidente di essere un emissario ufficiale di corte.", esEn: "Convince a suspicious noble that you are an official court emissary." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Ingannare un magistrato o inquisitore addestrato a scoprire menzogne.", esEn: "Deceive an inquisitor trained in detecting lies." }
    ],
    sinergieStrumenti: [
      { strumento: "Kit da Travestimento", beneficioIt: "Vantaggio nel recitare credibilmente l\x27identita del personaggio di cui indossi gli abiti.", beneficioEn: "Advantage on convincingly roleplaying a disguised persona." },
      { strumento: "Kit da Falsario", beneficioIt: "Vantaggio nel presentare mandati o credenziali false a supporto della tua menzogna.", beneficioEn: "Advantage on presenting forged papers to support your bluff." },
      { strumento: "Set da Gioco", beneficioIt: "Vantaggio nel simulare debolezza o fingere disinteresse durante contrattazioni.", beneficioEn: "Advantage on feigning weakness or disinterest in negotiations." }
    ]
  },
  intimidire: {
    nomeIt: "Intimidire",
    nomeEn: "Intimidation",
    car: "carisma",
    descrizioneIt: "Spaventi o minacci qualcuno affinche faccia cio che desideri: estorcere informazioni da un prigioniero, far indietreggiare banditi o costringere un PNG a collaborare.",
    descrizioneEn: "When you attempt to influence someone through overt threats, hostile actions, or physical presence, make an Intimidation check.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Spaventare un teppista di strada facendogli fare un passo indietro.", esEn: "Scare a street thug into stepping down." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Costringere un prigioniero riluttante a rivelare il covo della sua banda.", esEn: "Compel a reluctant prisoner to reveal gang hideout location." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Intimidire un capitano delle guardie corrotto affinche rilasci i tuoi compagni.", esEn: "Intimidate a corrupt guard captain into releasing allies." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Far esitare un signore della guerra o un nobile spietato mostrandoti inflessibile.", esEn: "Make a ruthless warlord hesitate through sheer presence." }
    ],
    sinergieStrumenti: [
      { strumento: "Attrezzi da Fabbro", beneficioIt: "Vantaggio nell\x27intimidire piegando con violenza sbarre o armi di metallo sotto gli occhi del bersaglio.", beneficioEn: "Advantage on intimidation by aggressively bending bars or metal weapons." }
    ]
  },
  intrattenere: {
    nomeIt: "Intrattenere",
    nomeEn: "Performance",
    car: "carisma",
    descrizioneIt: "Diletti un pubblico con musica, danza, recitazione teatrale, narrazione di storie o poesie appassionate.",
    descrizioneEn: "Your Performance check determines how well you can delight an audience with music, dance, acting, storytelling, or poetry.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Guadagnare una cena calda suonando canzoni allegre in una taverna affollata.", esEn: "Earn a warm meal by playing cheerful songs in a packed tavern." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Emozionare una piazza cittadina o guadagnare l\x27ammirazione di un ricco mercante.", esEn: "Captivate a town square or earn praise from wealthy merchants." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Ricevere una standing ovation alla corte di un sovrano esigente.", esEn: "Receive a standing ovation at an exacting royal court." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Eseguire un capolavoro artistico memorabile che verra ricordato per generazioni.", esEn: "Deliver a legendary performance remembered for generations." }
    ],
    sinergieStrumenti: [
      { strumento: "Strumento Musicale", beneficioIt: "Vantaggio nell\x27esecuzione di ballate, assoli virtuosi e melodie complesse.", beneficioEn: "Advantage on playing ballads, virtuous solos, and intricate melodies." },
      { strumento: "Kit da Travestimento", beneficioIt: "Vantaggio nell\x27interpretare personaggi comici o drammatici in opere teatrali.", beneficioEn: "Advantage on theatrical acting and dramatic stage performances." }
    ]
  },
  persuasione: {
    nomeIt: "Persuasione",
    nomeEn: "Persuasion",
    car: "carisma",
    descrizioneIt: "Tenti di influenzare una persona o un gruppo con tatto, buone maniere, grazia sociale, logica inconfutabile o sincera diplomazia.",
    descrizioneEn: "When you attempt to influence someone or make a good impression with tact, social graces, or good nature, make a Persuasion check.",
    esempiCd: [
      { cd: 10, diffIt: "Facile", diffEn: "Easy", esIt: "Ottenere un piccolo sconto da un commerciante amichevole o chiedere indicazioni.", esEn: "Get a minor discount from a friendly merchant or ask directions." },
      { cd: 15, diffIt: "Media", diffEn: "Moderate", esIt: "Convincere un nobile a concedere un\x27udienza formale o negoziare un compenso migliore.", esEn: "Convince a noble to grant audience or negotiate a better quest reward." },
      { cd: 20, diffIt: "Difficile", diffEn: "Hard", esIt: "Mediare una tregua tra due fazioni rivali o convincere una folla furiosa a calmarsi.", esEn: "Broker a truce between rival factions or calm an angry mob." },
      { cd: 25, diffIt: "Molto Difficile", diffEn: "Very Hard", esIt: "Convincere un monarca a stringere un\x27alleanza militare contro le sue preferenze.", esEn: "Convince a monarch to forge a military alliance against initial instincts." }
    ],
    sinergieStrumenti: [
      { strumento: "Strumenti da Calligrafo", beneficioIt: "Vantaggio nel redigere trattati di pace o missive diplomatiche formali impeccabili.", beneficioEn: "Advantage on composing formal peace treaties and diplomatic missives." },
      { strumento: "Attrezzi da Cuoco", beneficioIt: "Vantaggio nel negoziare offrendo un banchetto sontuoso cucinato a regola d\x27arte.", beneficioEn: "Advantage on negotiations when hosting a masterfully cooked feast." }
    ]
  }
};
