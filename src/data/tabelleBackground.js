// Tabelle ufficiali D&D 5e (2014 / 5.0) per Caratteristiche Suggerite dei Background:
// Tratto Caratteriale (d8), Ideale (d6), Legame (d6), Difetto (d6).

export const TABELLE_BACKGROUND = {
  accolito: {
    nome: 'Accolito',
    nome_en: 'Acolyte',
    tratti: [
      "Venero un particolare eroe della mia fede e mi ispiro costantemente alle sue gesta.",
      "Sono in grado di trovare punti in comune persino tra due acerrimi nemici, cercando la concordia e la pace.",
      "Riconosco presagi in ogni evento e gesto. Gli dèi cercano costantemente di parlarci, basta ascoltarli.",
      "Nulla riesce a minare il mio incrollabile ottimismo.",
      "Cito testi sacri e proverbi religiosi in quasi ogni situazione.",
      "Sono tollerante nei confronti delle altre fedi e rispetto il culto degli dèi altrui.",
      "Ho goduto dei piaceri del buon cibo e del buon vino all'interno del tempio. La vita ascetica non fa per me.",
      "Ho passato così tanto tempo nel tempio che ho qualche difficoltà a interagire con chi vive all'esterno."
    ],
    tratti_en: [
      "I idolize a particular hero of my faith, and constantly refer to that person's deeds and example.",
      "I can find common ground between the fiercest enemies, empathizing with them and always working toward peace.",
      "I see omens in every event and action. The gods try to speak to us, we just need to listen.",
      "Nothing can shake my optimistic attitude.",
      "I quote (or misquote) sacred texts and proverbs in almost every situation.",
      "I am tolerant (or intolerant) of other faiths and respect (or condemn) the worship of other gods.",
      "I've enjoyed fine food, drink, and high society among temple hierarchy. A rough life chafes at me.",
      "I've spent so long in the temple that I have little practical experience dealing with people in the outside world."
    ],
    ideali: [
      "Tradizione. Le antiche tradizioni di preghiera e sacrificio devono essere conservate e sostenute. (Legale)",
      "Carità. Cerco sempre di aiutare i bisognosi e non esito a sacrificarmi personalmente. (Buono)",
      "Cambiamento. Dobbiamo contribuire ai mutamenti costanti che gli dèi operano nel mondo. (Caotico)",
      "Potere. Spero di raggiungere un giorno le posizioni più elevate della gerarchia della mia chiesa. (Legale)",
      "Fede. Sono convinto che la mia divinità guidi le mie scelte, confidando che ogni cosa andrà per il meglio. (Legale)",
      "Aspirazione. Cerco di dimostrarmi degno del favore della mia divinità conformando le mie azioni ai suoi insegnamenti. (Qualsiasi)"
    ],
    ideali_en: [
      "Tradition. The ancient traditions of worship and sacrifice must be preserved and upheld. (Lawful)",
      "Charity. I always try to help those in need, no matter what the personal cost. (Good)",
      "Change. We must help bring about the changes the gods are constantly working in the world. (Chaotic)",
      "Power. I hope to one day rise to the top of my faith's religious hierarchy. (Lawful)",
      "Faith. I trust that my deity will guide my actions. I have faith that if I work hard, things will go well. (Lawful)",
      "Aspiration. I seek to prove myself worthy of my god's favor by matching my actions against his or her teachings. (Any)"
    ],
    legami: [
      "Morirei pur di recuperare un'antica reliquia della mia fede, perduta da molto tempo.",
      "Cerco vendetta contro i corrotti ministri del mio tempio che mi accusarono ingiustamente di eresia.",
      "Devo la vita al sacerdote che mi accolse nel tempio alla morte dei miei genitori.",
      "Tutto ciò che faccio, lo faccio per la gente comune e per i fedeli indifesi.",
      "Farò qualunque cosa pur di proteggere il tempio in cui sono cresciuto e ho servito.",
      "Cerco di proteggere un testo sacro che i miei nemici considerano eretico e vogliono distruggere."
    ],
    legami_en: [
      "I would die to recover an ancient relic of my faith that was lost long ago.",
      "I will someday get revenge on the corrupt temple hierarchy who branded me a heretic.",
      "I owe my life to the priest who took me in when my parents died.",
      "Everything I do is for the common people.",
      "I will do anything to protect the temple where I served.",
      "I seek to preserve a sacred text that my enemies consider heretical and seek to destroy."
    ],
    difetti: [
      "Giudico gli altri con severità, e me stesso ancora più duramente.",
      "Ripongo una fiducia cieca e acritica in chi detiene il potere all'interno del mio tempio.",
      "La mia pietà religiosa mi induce a credere ciecamente a chiunque professi la mia stessa fede.",
      "Sono inflessibile nei miei giudizi e non accetto compromessi morali.",
      "Non mi fido degli sconosciuti e sospetto sempre le peggiori intenzioni.",
      "Quando mi prefiggo un obiettivo sacro, divento ossessionato al punto da ignorare ogni altra cosa."
    ],
    difetti_en: [
      "I judge others harshly, and myself even more severely.",
      "I put too much trust in those who wield power within my temple's hierarchy.",
      "My piety sometimes leads me to blindly trust those that profess faith in my god.",
      "I am inflexible in my thinking.",
      "I am suspicious of strangers and expect the worst of them.",
      "Once I pick a goal, I become obsessed with it to the detriment of everything else in my life."
    ]
  },

  artigiano: {
    nome: 'Artigiano delle Gilde',
    nome_en: 'Guild Artisan',
    tratti: [
      "Credo che ogni lavoro debba essere svolto con perfezione maniacale e massima maestria.",
      "Non perdo occasione per promuovere la mia gilda e spiegare quanto sia superiore la nostra arte.",
      "Sono sempre alla ricerca di nuovi materiali rari o tecniche artigianali insolite.",
      "Ho l'abitudine di soppesare e valutare il valore materiale di ogni oggetto che vedo.",
      "Lavoro sodo e non sopporto i fannulloni o chi si lamenta della fatica.",
      "Sono abituato a trattare con mercanti e aristocratici: mantengo sempre modi cortesi e professionali.",
      "Se qualcuno insulta la mia professione o la qualità della mia bottega, mi offendo a morte.",
      "Il mio umore varia in base alla bellezza dell'ambiente che mi circonda: le cose rozze mi deprimono."
    ],
    tratti_en: [
      "I believe that anything worth doing is worth doing right. I can't help it— I'm a perfectionist.",
      "I'm a snob who looks down on those who can't appreciate fine art.",
      "I always want to know how things work and what makes people tick.",
      "I'm full of witty aphorisms and have a proverb for every occasion.",
      "I'm rude to people who lack my commitment to hard work and fair play.",
      "I like to talk at length about my profession.",
      "I don't part with my money easily and will haggle tirelessly to get the best deal possible.",
      "I'm well known for my work, and I want to make sure everyone appreciates it."
    ],
    ideali: [
      "Comunità. È dovere di ogni buon artigiano sostenere la gilda e proteggere i compagni di mestiere. (Legale)",
      "Generosità. I talenti che possiedo sono un dono che va condiviso per migliorare la vita altrui. (Buono)",
      "Libertà. Ognuno dovrebbe essere libero di creare la propria arte senza vincoli o tasse ingiuste. (Caotico)",
      "Avidità. Faccio questo lavoro per accumulare ricchezza, influenza e beni preziosi. (Malvagio)",
      "Progresso. Attraverso l'innovazione e l'ingegno possiamo elevare la civiltà a nuove vette. (Neutrale)",
      "Aspirazione. Lavoro duramente per diventare il maestro più stimato e celebre della mia disciplina. (Qualsiasi)"
    ],
    ideali_en: [
      "Community. It is the duty of all civilized people to strengthen the bonds of community and the security of the civilization. (Lawful)",
      "Generosity. My talents were given to me so that I could use them to benefit the world. (Good)",
      "Freedom. Everyone should be free to pursue his or her own livelihood. (Chaotic)",
      "Greed. I'm only in it for the money. (Evil)",
      "People. I'm committed to the people I care about, not to ideals. (Neutral)",
      "Aspiration. I work hard to be the best there is at my craft. (Any)"
    ],
    legami: [
      "La bottega in cui ho imparato il mestiere è il luogo più prezioso al mondo per me.",
      "Ho creato un capolavoro leggendario che mi è stato rubato; lo ritroverò a qualunque costo.",
      "Devo tutto al mio maestro che ha creduto in me quando nessun altro voleva prendermi a bottega.",
      "Voglio accumulare abbastanza oro per garantire alla mia famiglia una vita agiata e rispettata.",
      "La mia gilda è la mia vera famiglia; punirò chiunque osi screditarla o minacciarla.",
      "Un giorno aprirò la bottega più prestigiosa della capitale, superando ogni rivale."
    ],
    legami_en: [
      "The workshop where I learned my trade is the most important place in the world to me.",
      "I created a great work for someone, and then found them unworthy to receive it. I'm still looking for someone worthy.",
      "I owe my guild a great debt for forging me into the person I am today.",
      "I pursue wealth to secure the love of someone.",
      "One day I will return to my guild and prove that I am the greatest artisan of them all.",
      "I will get revenge on the evil forces that destroyed my place of business and ruined my livelihood."
    ],
    difetti: [
      "Non riesco a resistere alla tentazione di accumulare denaro, a volte rasentando l'avarizia.",
      "Sono gelosissimo dei miei segreti di bottega e sospetto che tutti vogliano rubarmeli.",
      "Disprezzo chiunque non possieda un'abilità artigianale o manuale riconosciuta.",
      "Se vedo un'opera difettosa non resisto all'impulso di criticarla ad alta voce e con sarcasmo.",
      "Ho contratto un debito cospicuo con un nobile o con la gilda per avviare la mia attività.",
      "Ucciderei pur di mettere le mani su formule o strumenti di fabbricazione leggendari."
    ],
    difetti_en: [
      "I'll do anything to get my hands on something rare or priceless.",
      "I'm quick to assume that someone is trying to cheat me.",
      "No one must ever learn that I once stole money from guild coffers.",
      "I'm never satisfied with what I have—I always want more.",
      "I would kill to acquire a noble title.",
      "I'm horribly jealous of anyone who can outshine my handiwork. Everywhere I go, I'm surrounded by rivals."
    ]
  },

  ciarlatano: {
    nome: 'Ciarlatano',
    nome_en: 'Charlatan',
    tratti: [
      "Mi innamoro facilmente di chiunque mostri fascino, denaro o un'ingenuità da sfruttare.",
      "Ho una barzelletta, un aneddoto o una storiella divertente pronta per ogni circostanza.",
      "Non resisto alla tentazione di tirare un tiro mancino a chi si dà troppe arie.",
      "Riesco a mentire con naturalezza disarmante anche sulle cose più futili e insignificanti.",
      "Mi invento sempre identità, titoli nobiliari o parentele fittizie per impressionare la gente.",
      "Spendo i miei soldi più velocemente di quanto riesca a guadagnarli con le mie truffe.",
      "Sono sempre alla ricerca di un pollo da spennare o di una scommessa vantaggiosa.",
      "Adatto i miei modi di fare e il mio accento a seconda della persona con cui sto parlando."
    ],
    tratti_en: [
      "I fall in and out of love easily, and am always pursuing someone.",
      "I have a joke for every occasion, especially occasions where humor is inappropriate.",
      "Flattery is my preferred trick for getting what I want.",
      "I'm a born gambler who can't resist taking a risk for a potential payoff.",
      "I lie about almost everything, even when there's no good reason to.",
      "Sarcasm and insults are my sharpest weapons.",
      "I keep multiple holy symbols on me and invoke whatever deity might come in useful at any given moment.",
      "I pocket anything that looks like it might have some value."
    ],
    ideali: [
      "Indipendenza. Sono uno spirito libero: nessuno può dirmi cosa fare o dove andare. (Caotico)",
      "Equità. Non rubo mai a chi non può permetterselo; prendo solo a chi ha troppo e lo merita. (Buono)",
      "Carità. Condivido parte dei miei guadagni illeciti con chi vive in miseria. (Buono)",
      "Creatività. Una truffa ben architettata è una forma d'arte superiore a qualsiasi dipinto. (Caotico)",
      "Amicizia. I beni materiali vanno e vengono, ma i legami coi compagni d'avventura restano. (Neutrale)",
      "Aspirazione. Farò il colpo del secolo e il mio nome (o il mio pseudonimo) passerà alla leggenda. (Qualsiasi)"
    ],
    ideali_en: [
      "Independence. I am a free spirit— no one tells me what to do. (Chaotic)",
      "Fairness. I never target people who can't afford to lose a few coins. (Lawful)",
      "Charity. I distribute the money I acquire to the people who really need it. (Good)",
      "Creativity. I never run the same con twice. (Chaotic)",
      "Friendship. Material goods come and go. Bonds of friendship last forever. (Neutral)",
      "Aspiration. I'm determined to make something of myself. (Any)"
    ],
    legami: [
      "Ho truffato la persona sbagliata e ora un potente signore del crimine dà la caccia alla mia testa.",
      "Tutto ciò che guadagno serve a mantenere una persona cara a cui ho nascosto la mia vera vita.",
      "Ho un debito d'onore con il maestro che mi ha insegnato tutti i trucchi del mestiere.",
      "Custodisco un oggetto prezioso che appartiene alla mia identità fittizia preferita.",
      "Voglio vendicarmi di un rivale che mi ha tradito e incastrato alle guardie cittadine.",
      "Un giorno accumulerò abbastanza ricchezza per comprare una tenuta nobiliare e vivere da signore."
    ],
    legami_en: [
      "I fleeced the wrong person and must work to ensure that this individual never crosses paths with me or those I care about.",
      "I owe everything to my mentor—a horrible person who's probably rotting in jail somewhere.",
      "Somewhere out there, I have a child who doesn't know me. I'm making the world better for him or her.",
      "I come from a noble family, and one day I'll reclaim my lands and title from those who stole them from me.",
      "A powerful person killed someone I love. Some day soon, I'll have my revenge.",
      "I swindled and ruined a person who didn't deserve it. I seek to atone for my misdeeds but might never be able to forgive myself."
    ],
    difetti: [
      "Non so resistere al fascino del gioco d'azzardo e delle scommesse rischiose.",
      "Quando vedo qualcosa di valore incustodito, la tentazione di appropriarmene è irresistibile.",
      "La mia prima reazione di fronte a un pericolo o a una domanda seria è mentire e fuggire.",
      "Non riesco a fidarmi di nessuno: penso sempre che gli altri stiano cercando di truffarmi.",
      "Se mi sento messo alle strette o smascherato, perdo la calma e divento aggressivo.",
      "L'avidità mi acceca: accetto incarichi pericolosi se la ricompensa promessa è favolosa."
    ],
    difetti_en: [
      "I can't resist a pretty face.",
      "I'm always in debt. I spend my ill-gotten gains on decadent luxuries faster than I bring them in.",
      "I'm convinced that no one could ever fool me the way I fool others.",
      "I'm too greedy for my own good. I can't resist taking a risk if there's money involved.",
      "I can't resist swindling people who are more powerful than me.",
      "I hate to admit it and will hate myself for it, but I'll run and preserve my own skin if the going gets tough."
    ]
  },

  criminale: {
    nome: 'Criminale',
    nome_en: 'Criminal',
    tratti: [
      "Mantengo sempre la calma e un tono di voce controllato, non importa quanto la situazione sia disperata.",
      "Il primo impulso quando entro in una stanza nuova è individuare tutte le vie di fuga e gli oggetti di valore.",
      "Preferisco fare un nuovo amico piuttosto che un nuovo nemico; non si sa mai quando servirà un favore.",
      "Non mi fido di nessuno e controllo sempre che nessuno mi stia pedinando.",
      "Spesso parlo in gergo ladresco o uso metafore legate al sottobosco criminale.",
      "Se c'è un piano da preparare, trovo sempre il punto debole e la falla nella sicurezza.",
      "Ho l'abitudine di giocare compulsivamente con una moneta o un piccolo pugnale tra le dita.",
      "Non mostro mai le mie vere emozioni: tengo sempre una maschera impassibile."
    ],
    tratti_en: [
      "I always have a plan for what to do when things go wrong.",
      "I am always calm, no matter what the situation. I never raise my voice or let my emotions control me.",
      "The first thing I do in a new place is note the locations of everything valuable—or where such things could be hidden.",
      "I would rather make a new friend than a new enemy.",
      "I am incredibly slow to trust. Those who seem the fairest often have the most to hide.",
      "I don't pay attention to the risks in a situation. Never tell me the odds.",
      "The best way to get me to do something is to tell me I can't do it.",
      "I blow up at the slightest insult."
    ],
    ideali: [
      "Onore. Non rubo mai ai miei compagni e mantengo sempre la parola data a chi rispetta i patti. (Legale)",
      "Libertà. Le leggi sono catene inventate dai potenti per opprimere la gente comune. (Caotico)",
      "Carità. Rubo ai ricchi per dare a chi muore di fame nei vicoli della città. (Buono)",
      "Avidità. Faccio quello che faccio per il denaro e per il potere che esso garantisce. (Malvagio)",
      "Sopravvivenza. Ognuno deve pensare a se stesso: in strada sopravvive solo chi è più furbo. (Neutrale)",
      "Redenzione. Ho commesso crimini in passato, ma ora voglio usare le mie capacità per fare del bene. (Buono)"
    ],
    ideali_en: [
      "Honor. I don't steal from others in the trade. (Lawful)",
      "Freedom. Chains are meant to be broken, as are those who would forge them. (Chaotic)",
      "Charity. I steal from the wealthy so that I can help people in need. (Good)",
      "Greed. I will do whatever it takes to become wealthy. (Evil)",
      "People. I'm loyal to my friends, not to any ideals, and everyone else can take a trip down the Styx for all I care. (Neutral)",
      "Redemption. There's a spark of good in everyone. (Good)"
    ],
    legami: [
      "Tutto ciò che faccio è per proteggere e mantenere la mia famiglia nei bassifondi.",
      "Ho un conto in sospeso con la guardia corrotta che ha ucciso il mio migliore amico.",
      "Devo un enorme favore al ricettatore che mi ha salvato la vita e fatto fuggire dalla forca.",
      "Un antico bottino di inestimabile valore è nascosto in un luogo segreto che solo io conosco.",
      "Voglio rovesciare il signore del crimine locale e prendere il controllo della gilda dei ladri.",
      "Ho un debito di sangue con una banda rivale che prima o poi verrà a riscuotere."
    ],
    legami_en: [
      "I'm trying to pay off an old debt I owe to a generous benefactor.",
      "My ill-gotten gains go to support my family.",
      "Something important was taken from me, and I aim to steal it back.",
      "I will become the greatest thief that ever lived.",
      "I'm guilty of a terrible crime. I hope I can redeem myself for it.",
      "Someone I loved died because of a mistake I made. That will never happen again."
    ],
    difetti: [
      "Se vedo qualcosa di valore incustodito, difficilmente resisto all'impulso di rubarlo.",
      "Quando le cose si mettono male, la mia prima reazione è scappare e salvare la mia pelle.",
      "Diffido sistematicamente di chiunque rappresenti la legge o l'autorità costituita.",
      "Basta un'offerta di denaro sufficientemente alta per far vacillare la mia lealtà.",
      "Non riesco a resistere alla tentazione di sbeffeggiare le guardie o i nobili arroganti.",
      "Ho un vizio costoso (alcol, gioco, droghe) che divora gran parte dei miei guadagni."
    ],
    difetti_en: [
      "When I see something valuable, I can't think about anything but how to steal it.",
      "When faced with a choice between money and my friends, I usually choose the money.",
      "If there's a plan, I'll forget it. If I don't forget it, I'll ignore it.",
      "I have a 'tell' that reveals when I'm lying.",
      "I turn tail and run when things look bad.",
      "An innocent person is in prison for a crime that I committed. I'm okay with that."
    ]
  },

  eremita: {
    nome: 'Eremita',
    nome_en: 'Hermit',
    tratti: [
      "Sono stato in isolamento così a lungo che parlo raramente e preferisco i gesti e il silenzio.",
      "Provo un profondo senso di empatia per ogni creatura vivente, anche la più umile.",
      "Non mi curo dell'etichetta sociale o dell'igiene impeccabile: la natura è la mia casa.",
      "Collego ogni evento quotidiano a una visione mistica o a una grande verità cosmica.",
      "Sono sereno anche di fronte a grandi pericoli; la morte è solo un passaggio naturale.",
      "Ho l'abitudine di parlare ad alta voce da solo o di rivolgermi a piante e animali.",
      "Preferisco osservare e ascoltare a lungo prima di esprimere un giudizio ponderato.",
      "Mi sento a disagio tra le folle e il rumore assordante delle grandi città."
    ],
    tratti_en: [
      "I've been isolated for so long that I rarely speak, preferring gestures and the occasional grunt.",
      "I am utterly serene, even in the face of disaster.",
      "The leader of my community had something wise to say on every topic, and I am eager to share that wisdom.",
      "I feel tremendous empathy for all who suffer.",
      "I'm oblivious to etiquette and social expectations.",
      "I connect everything that happens to me to a grand, cosmic plan.",
      "I often get lost in my own thoughts and contemplation, becoming oblivious to my surroundings.",
      "I am working on a grand philosophical theory and love sharing my ideas."
    ],
    ideali: [
      "Conoscenza. La ricerca della verità e della saggezza interiore è il fine ultimo dell'esistenza. (Neutrale)",
      "Armonia. Dobbiamo vivere in perfetto equilibrio con la natura e con il cosmo. (Buono)",
      "Autonomia. L'isolamento e l'autodisciplina sono l'unica via per la vera libertà. (Caotico)",
      "Logica. Le emozioni passeggere non devono offuscare la mente e il retto giudizio. (Legale)",
      "Guarigione. Uso le mie scoperte erboristiche e mistiche per lenire le sofferenze del mondo. (Buono)",
      "Illuminazione. Cerco di trascendere i limiti mortali per raggiungere una consapevolezza superiore. (Qualsiasi)"
    ],
    ideali_en: [
      "Greater Good. My gifts are meant to be shared with all, not used for my own benefit. (Good)",
      "Logic. Emotions must not cloud our sense of what is right and true, or our logical thinking. (Lawful)",
      "Free Thinking. Inquiry and curiosity are the pillars of progress. (Chaotic)",
      "Power. Solitude and contemplation are paths toward mystical or magical power. (Evil)",
      "Live and Let Live. Meddling in the affairs of others only causes trouble. (Neutral)",
      "Self-Knowledge. If you know yourself, there's nothing left to know. (Any)"
    ],
    legami: [
      "Il mio eremo solitario custodisce un segreto millenario che non deve cadere in mani sbagliate.",
      "Ho avuto una rivelazione tremenda su una catastrofe imminente: devo impedire che si avveri.",
      "Custodisco un manoscritto sacro che contiene la chiave per guarire una piaga mortale.",
      "Sono uscito dal mio isolamento solo per salvare la persona a cui tengo di più al mondo.",
      "Un antico spirito guardiano mi ha affidato una missione sacra che devo portare a compimento.",
      "Voglio trasmettere le mie scoperte a un discepolo meritevole prima che la mia vita giunga al termine."
    ],
    legami_en: [
      "Nothing is more important than the other members of my hermitage, order, or association.",
      "I entered seclusion to hide from the ones who might still be hunting me. I must someday confront them.",
      "I'm still seeking the enlightenment I pursued in my seclusion, and it still eludes me.",
      "I entered seclusion because I loved someone I could not have.",
      "Should my discovery come to light, it could bring ruin to the world.",
      "My isolation gave me great insight into a great evil that only I can destroy."
    ],
    difetti: [
      "Sono dogmatico nelle mie convinzioni e respingo con sdegno le opinioni altrui.",
      "Il mio attaccamento al segreto che ho scoperto mi rende paranoico e diffidente.",
      "Spesso mi isolo nei miei pensieri durante i momenti critici, ignorando cosa accade attorno.",
      "Disprezzo il lusso e la ricchezza, criticando apertamente chi ne fa sfoggio.",
      "Ho difficoltà a comprendere il valore del denaro e mi faccio facilmente raggirare nei commerci.",
      "La mia sete di conoscenza mi spinge a sperimentare segreti pericolosi e proibiti."
    ],
    difetti_en: [
      "Now that I've returned to the world, I enjoy its delights a little too much.",
      "I harbor dark, bloodthirsty thoughts that my isolation and meditation failed to quell.",
      "I am dogmatic in my religious or philosophical beliefs.",
      "I let my need to win arguments overshadow friendships and harmony.",
      "I'd risk too much to uncover a lost bit of knowledge.",
      "I like keeping secrets and won't share them with anyone."
    ]
  },

  eroe_popolare: {
    nome: 'Eroe Popolare',
    nome_en: 'Folk Hero',
    tratti: [
      "Giudico le persone in base alle loro azioni concrete, non in base al loro rango o titolo nobiliare.",
      "Se qualcuno si trova in difficoltà o subisce un'ingiustizia, non esito un secondo a intervenire.",
      "Non dimentico mai le mie umili origini contadine e tratto tutti da pari a pari.",
      "Ho una fiducia incrollabile nel destino che mi ha scelto per grandi imprese.",
      "Uso spesso proverbi popolari e metafore contadine per spiegare concetti complessi.",
      "Fatico a resistere alla tentazione di dimostrare il mio valore compiendo atti di coraggio sconsiderati.",
      "Lavoro con dedizione e rispetto chiunque si guadagni da vivere col sudore della fronte.",
      "Mi sento a disagio nei palazzi nobiliari; preferisco la calore genuino di una taverna di villaggio."
    ],
    tratti_en: [
      "I judge people by their actions, not their words.",
      "If someone is in trouble, I'm always ready to lend help.",
      "When I set my mind to something, I follow through no matter what gets in my way.",
      "I have a strong sense of fair play and always try to find the most equitable solution to arguments.",
      "I'm confident in my own abilities and do what I can to instill confidence in others.",
      "Thinking is for other people. I prefer action.",
      "I misuse long words in an attempt to sound smarter.",
      "I get bored easily. When am I going to get on with my destiny?"
    ],
    ideali: [
      "Rispetto. Nessun essere umano, per quanto povero o umile, merita di essere trattato come bestiame. (Buono)",
      "Equità. Nessuno deve essere al di sopra della legge, specialmente i ricchi e i potenti. (Legale)",
      "Libertà. I tiranni e i despoti devono essere abbattuti per restituire la libertà al popolo. (Caotico)",
      "Potere. Il popolo ha bisogno di una guida forte e decisa che lo conduca alla riscossa. (Malvagio)",
      "Sincerità. Non c'è virtù migliore della franchezza e dell'onestà verso il prossimo. (Neutrale)",
      "Destino. Sono nato per compiere un destino glorioso che cambierà il mondo per sempre. (Qualsiasi)"
    ],
    ideali_en: [
      "Respect. People deserve to be treated with dignity and respect. (Good)",
      "Fairness. No one should get preferential treatment before the law, and no one is above the law. (Lawful)",
      "Freedom. Tyrants must not be allowed to oppress the people. (Chaotic)",
      "Might. If I become strong, I can take what I want—what I deserve. (Evil)",
      "Sincerity. There's no good in pretending to be something I'm not. (Neutral)",
      "Destiny. Nothing and no one can steer me away from my higher calling. (Any)"
    ],
    legami: [
      "Proteggerò la mia gente e il mio villaggio d'origine da qualsiasi minaccia, a costo della vita.",
      "Voglio vendicarmi del tiranno locale che ha bruciato la mia fattoria e disperso la mia famiglia.",
      "Il mio vecchio strumento di lavoro è il simbolo della mia promessa di difendere gli oppressi.",
      "Combatto per conquistare il cuore della persona amata che appartiene a una classe sociale superiore.",
      "Un antico eroe del folklore popolare è il mio modello di vita: voglio eguagliare le sue gesta.",
      "Dimostrerò ai nobili che il valore di un uomo risiede nel suo cuore e non nel sangue blu."
    ],
    legami_en: [
      "I have a family, but I have no idea where they are. One day, I hope to see them again.",
      "I worked the land, I love the land, and I will protect the land.",
      "A proud noble once gave me a horrible beating, and I will take my revenge on any bully I encounter.",
      "My tools are symbols of my past life, and I carry them so that I will never forget my roots.",
      "I protect those who cannot protect themselves.",
      "I wish my childhood sweetheart had come with me to pursue my destiny."
    ],
    difetti: [
      "I tiranni che ho sfidato mi danno la caccia e metto in pericolo chiunque mi stia vicino.",
      "Ho un'opinione fin troppo alta di me stesso e fatico ad ammettere i miei errori.",
      "Basta che un nobile mi guardi con sufficienza per farmi perdere il controllo e provocare una rissa.",
      "La mia ostinazione rasenta la testardaggine: non cambio mai idea anche davanti all'evidenza.",
      "Fatico a resistere alla tentazione di fare l'eroe anche quando la prudenza consiglierebbe cautela.",
      "Ho un debole per gli applausi e la gloria: a volte agisco solo per far colpo sulla folla."
    ],
    difetti_en: [
      "The tyrant who rules my land will stop at nothing to see me killed.",
      "I'm convinced of the significance of my destiny, and blind to my shortcomings and the risk of failure.",
      "The people who knew me when I was young know my shameful secret, so I can never go home again.",
      "I have a weakness for the vices of the city, especially hard drink.",
      "Secretly, I believe that things would be much better if I were a tyrant ruling over the land.",
      "I have trouble trusting in my allies."
    ]
  },

  forestiero: {
    nome: 'Forestiero',
    nome_en: 'Outlander',
    tratti: [
      "Sono guidato da una curiosità insaziabile per i costumi e le stranezze delle terre civilizzate.",
      "Faccio sempre affidamento sulla natura: la foresta provvede a ogni mio bisogno.",
      "Non mi preoccupo delle comodità o del lusso; dormo meglio sotto le stelle che in un letto di piume.",
      "Tratto gli animali con lo stesso rispetto con cui tratto le persone intelligenti.",
      "Ho l'abitudine di esprimere i miei pensieri con schiettezza disarmante, senza filtri diplomatici.",
      "Raccolgo piccoli trofei naturali (ossa, piume, pietre levigate) da ogni territorio che visito.",
      "La mia tribù e i miei compagni vengono prima di qualunque legge straniera.",
      "Riconosco il pericolo dal mutare del vento o dal comportamento insolito degli uccelli."
    ],
    tratti_en: [
      "I'm driven by a wanderlust that led me away from home.",
      "I watch over my friends as if they were a litter of newborn pups.",
      "I once ran twenty-five miles without stopping to warn my clan of an approaching orc horde. I'd do it again.",
      "I have a lesson for every situation, drawn from observing nature.",
      "I place no stock in wealthy or well-mannered folk. Money and manners won't save you from a hungry owlbear.",
      "I'm always picking things up, absently fiddling with them, and sometimes accidentally breaking them.",
      "I feel far more comfortable around animals than people.",
      "I was, in fact, raised by wolves."
    ],
    ideali: [
      "Cambiamento. La vita è come le stagioni: nulla resta immutato e dobbiamo fluire col cambiamento. (Caotico)",
      "Protezione. È dovere del forte proteggere la natura e coloro che non sanno difendersi. (Buono)",
      "Onore. Se do la mia parola, la manterrò fino alla morte: la lealtà è la legge suprema. (Legale)",
      "Potere. Nelle terre selvagge vige la legge del più forte: solo i potenti prosperano. (Malvagio)",
      "Natura. Il mondo naturale deve essere preservato dall'avanzata distruttiva della civiltà. (Neutrale)",
      "Gloria. Voglio che i miei canti di caccia e le mie gesta siano ricordati attorno al fuoco per generazioni. (Qualsiasi)"
    ],
    ideali_en: [
      "Change. Life is like the seasons, in constant change, and we must change with it. (Chaotic)",
      "Greater Good. It is each person's responsibility to make the most happiness for the whole tribe. (Good)",
      "Honor. If I dishonor myself, I dishonor my whole clan. (Lawful)",
      "Might. The strongest are meant to rule. (Evil)",
      "Nature. The natural world is more important than all the constructs of civilization. (Neutral)",
      "Glory. I must earn glory in battle, for myself and my clan. (Any)"
    ],
    legami: [
      "La mia tribù è tutto per me: farei qualunque sacrificio per garantirne la sopravvivenza.",
      "Un giorno guiderò il mio popolo verso una nuova terra promessa, lontana dalle guerre.",
      "Custodisco il totem sacro dei miei antenati; perderlo significherebbe perdere la mia anima.",
      "Cerco vendetta contro i predoni civilizzati che hanno disboscato e distrutto la mia terra natia.",
      "Considero i miei compagni d'avventura il mio nuovo branco: morirò prima di abbandonarli.",
      "Voglio mappare e esplorare ogni angolo inesplorato di questo continente prima di morire."
    ],
    legami_en: [
      "My family, clan, or tribe is the most important thing in my life, even when they are far from me.",
      "An injury to the unspoiled wilderness of my home is an injury to me.",
      "I will bring terrible wrath down on the evildoers who destroyed my homeland.",
      "I am the last of my tribe, and it is up to me to ensure their names enter legend.",
      "I suffer awful visions of a coming disaster and will do anything to prevent it.",
      "It is my duty to provide children to sustain my tribe."
    ],
    difetti: [
      "Non comprendo il concetto di denaro e proprietà privata: se una mela è su un albero, si mangia.",
      "Diffido ciecamente di chiunque viva in città e indossi abiti troppo raffinati.",
      "La mia furia in combattimento a volte mi fa perdere il controllo e ignorare gli ordini dei compagni.",
      "Non tollero la debolezza o la codardia e disprezzo apertamente chi si arrende senza lottare.",
      "Ho un debole incontrollabile per le bevande alcoliche forti della civiltà.",
      "Prendo decisioni basandomi su superstizioni tribali che gli altri trovano assurde o pericolose."
    ],
    difetti_en: [
      "I am too enamored of ale, wine, and other intoxicants.",
      "There's no room for caution in a life lived to the fullest.",
      "I remember every insult I've ever received and nurse a silent resentment toward anyone who's ever wronged me.",
      "I am slow to trust members of other races, tribes, and societies.",
      "Violence is my answer to almost any challenge.",
      "Don't expect me to save those who can't save themselves. It is nature's way that the strong thrive and the weak perish."
    ]
  },

  intrattenitore: {
    nome: 'Intrattenitore',
    nome_en: 'Entertainer',
    tratti: [
      "Adoro essere al centro dell'attenzione e non perdo occasione per esibirmi davanti a un pubblico.",
      "So sempre come rallegrare l'atmosfera o stemperare la tensione con una battuta o una melodia.",
      "Cambio umore con la stessa rapidità con cui cambio tonalità sul mio strumento musicale.",
      "Mi affeziono subito a chiunque mostri di apprezzare la mia arte e i miei talenti.",
      "Nessuno può resistere al mio fascino; lo so per certo perché me lo dico ogni mattina allo specchio.",
      "Prendo nota di ogni pettegolezzo, scandalo o storia d'amore da trasformare in una ballata.",
      "Non sopporto la mediocrità: ogni mia performance deve essere memorabile e travolgente.",
      "Uso il sarcasmo e l'ironia tagliente come scudo per non mostrare le mie reali insicurezze."
    ],
    tratti_en: [
      "I know a story relevant to almost every situation.",
      "Whenever I come to a new place, I collect local rumors and spread gossip.",
      "I'm a hopeless romantic, always searching for that 'special someone.'",
      "Nobody stays angry at me or around me for long, since I can defuse any amount of tension.",
      "I love a good insult, even one directed at me.",
      "I get bitter if I'm not the center of attention.",
      "I'll settle for nothing less than perfection.",
      "I change my mood or my mind as quickly as I change key in a song."
    ],
    ideali: [
      "Bellezza. L'arte e la bellezza sono ciò che rende la vita degna di essere vissuta. (Buono)",
      "Tradizione. Le antiche storie e leggende devono essere tramandate fedelmente nel tempo. (Legale)",
      "Creatività. Il mondo ha bisogno di nuove idee, melodie audaci e spettacoli rivoluzionari. (Caotico)",
      "Avidità. Faccio spettacolo per diventare ricco, famoso e vivere nel lusso più sfrenato. (Malvagio)",
      "Onestà. L'arte deve riflettere la verità interiore delle persone, nel bene e nel male. (Neutrale)",
      "Aspirazione. Diventerò il più celebre bardo o acrobata della storia del continente. (Qualsiasi)"
    ],
    ideali_en: [
      "Beauty. When I perform, I make the world better than it was. (Good)",
      "Tradition. The stories, legends, and songs of the past must never be forgotten. (Lawful)",
      "Creativity. The world is in need of new ideas and bold action. (Chaotic)",
      "Greed. I'm only in it for the money and fame. (Evil)",
      "People. I like seeing and making people happy. (Neutral)",
      "Honesty. Art should reflect the soul; it should come from within and reveal who we really are. (Any)"
    ],
    legami: [
      "Il mio strumento musicale (o attrezzo di scena) è il mio bene più prezioso al mondo.",
      "Dedico ogni mia canzone e ogni mia vittoria alla persona amata che aspetta il mio ritorno.",
      "Voglio umiliare pubblicamente il rivale artistico che mi ha rubato la scena e diffamato.",
      "Devo tutto alla compagnia teatrale itinerante che mi ha raccolto dalla strada.",
      "Un giorno mi esibirò alla corte dell'Imperatore e riceverò gli onori più alti.",
      "Uso la mia fama per raccogliere fondi e aiutare gli orfani e i bisognosi della mia città."
    ],
    legami_en: [
      "My instrument is my most treasured possession, and it reminds me of someone I love.",
      "Someone stole my precious instrument, and someday I'll get it back.",
      "I want to be famous, whatever it takes.",
      "I idolize a hero of the old tales and measure my deeds against that person's.",
      "I will do anything to prove myself superior to my hated rival.",
      "I would do anything for the other members of my old troupe."
    ],
    difetti: [
      "Non so resistere al fascino del buon vino e dei piaceri mondani.",
      "Il mio narcisismo mi rende incapace di accettare critiche sul mio aspetto o sulla mia arte.",
      "Ho la lingua troppo lunga: quando inizio a parlare o spettegolare non so più fermarmi.",
      "Scappo a gambe levate di fronte a un pericolo reale se rischio di rovinare il mio bel viso.",
      "Sono geloso del successo altrui e cerco di oscurare chiunque mi rubi la scena.",
      "Ho debiti con strozzini e locandieri in quasi tutte le città che ho visitato."
    ],
    difetti_en: [
      "I'll do anything to win fame and renown.",
      "I'm a sucker for a pretty face.",
      "A scandal prevents me from ever going home again. That kind of trouble seems to follow me around.",
      "I once satirized a noble who still wants my head. It was a mistake that I will likely repeat.",
      "I have trouble keeping my true feelings hidden. My sharp tongue lands me in trouble.",
      "Despite my best efforts, I am unreliable to my friends."
    ]
  },

  marinaio: {
    nome: 'Marinaio',
    nome_en: 'Sailor',
    tratti: [
      "I miei amici sanno di poter sempre contare su di me, qualunque burrasca stia arrivando.",
      "Lavoro sodo senza lamentarmi, purché ci sia una buona pinta di birra a fine turno.",
      "Uso spesso gergo marinaresco e paragoni navali anche quando mi trovo sulla terraferma.",
      "Adoro viaggiare verso nuovi porti e scoprire culture mai viste prima.",
      "Non mi fido di chi non sa nuotare o di chi si spaventa per un po' di vento forte.",
      "Ho l'abitudine di intonare canti marinareschi per tenere alto il morale durante le fatiche.",
      "Non mi tiro mai indietro davanti a una sfida o a una prova di forza in taverna.",
      "Ho sempre una storia incredibile (e probabilmente inventata) su mostri marini e tempeste."
    ],
    tratti_en: [
      "My friends know they can rely on me, no matter what.",
      "I work hard so that I can play hard when the work is done.",
      "I enjoy sailing into new ports and making new friends over a flagon of ale.",
      "I stretch the truth for the sake of a good story.",
      "To me, a tavern brawl is a nice way to get to know a new town.",
      "I never pass up a friendly wager.",
      "My language is as foul as an otyugh nest.",
      "I like a job well done, especially if I can convince someone else to do it."
    ],
    ideali: [
      "Rispetto. La nave funziona solo se tutti rispettano la gerarchia e gli ordini del capitano. (Legale)",
      "Libertà. Il mare aperto rappresenta la libertà assoluta: nessuno può recintare l'oceano. (Caotico)",
      "Cameratismo. Nessun marinaio viene lasciato indietro; proteggiamo l'equipaggio a ogni costo. (Buono)",
      "Predazione. Se una nave è debole e indifesa, è diritto dei più audaci prenderne il carico. (Malvagio)",
      "Destino. Il mare è governato dal capriccio degli dèi: dobbiamo accettare ciò che la sorte ci riserva. (Neutrale)",
      "Avventura. Vivo per il brivido della scoperta e per solcare acque in cui nessuno ha mai navigato. (Qualsiasi)"
    ],
    ideali_en: [
      "Respect. The thing that keeps a ship together is mutual respect between captain and crew. (Good)",
      "Fairness. We all do the work, so we all share in the rewards. (Lawful)",
      "Freedom. The sea is freedom—the freedom to go anywhere and do anything. (Chaotic)",
      "Mastery. I'm a predator, and the other ships on the sea are my prey. (Evil)",
      "People. I'm committed to my crewmates, not to ideals. (Neutral)",
      "Aspiration. Someday I'll own my own ship and chart my own destiny. (Any)"
    ],
    legami: [
      "La mia vecchia nave è la mia vera casa; un giorno tornerò a solcare i mari al suo timone.",
      "Devo ritrovare il capitano che mi ha tradito e venduto ai pirati per ottenere la mia vendetta.",
      "Custodisco una mappa che indica la rotta per un'isola leggendaria colma di tesori.",
      "In ogni porto c'è qualcuno che aspetta il mio ritorno con ansia o con amore.",
      "Tutto ciò che guadagno serve a riscattare i miei vecchi compagni d'equipaggio prigionieri.",
      "Ho promesso a un marinaio morente di recapitare un messaggio alla sua famiglia lontana."
    ],
    legami_en: [
      "I'm loyal to my captain first, everything else second.",
      "The ship is most important—crewmates and captains come and go.",
      "I'll always remember my first ship.",
      "In a harbor town, I have a paramour whose eyes nearly stole me from the sea.",
      "I was cheated out of my fair share of the profits, and I want to get what's owed to me.",
      "Ruthless pirates murdered my captain and crewmates, plundered our ship, and left me to die. Vengeance will be mine."
    ],
    difetti: [
      "Non so resistere all'alcol forte e quando bevo divento insolente e attaccabrighe.",
      "Se qualcuno insulta le mie abilità marinare o la mia nave, passo subito alle mani.",
      "La mia superstizione marinara mi porta a vedere presagi nefasti ovunque.",
      "Spendo ogni moneta guadagnata la sera stessa in cui tocco terraferma.",
      "Fatico ad adattarmi alle regole e alla burocrazia rigida della vita cittadina.",
      "In passato ho commesso atti di pirateria di cui le autorità potrebbero ancora volere conto."
    ],
    difetti_en: [
      "I follow orders, even if I think they're wrong.",
      "I'll say anything to avoid having to do actual work.",
      "Once someone questions my courage, I never back down no matter how dangerous the situation.",
      "Once I start drinking, it's hard for me to stop.",
      "I can't help but pocket loose coins and other small items I come across.",
      "My pride will probably lead to my destruction."
    ]
  },

  monello: {
    nome: 'Monello',
    nome_en: 'Urchin',
    tratti: [
      "Nascondo sempre un pezzo di pane o cibo avanzato nelle tasche per i momenti di magra.",
      "Faccio domande dirette e schiette senza curarmi del rango o del galateo nobiliare.",
      "Dormo col sonno leggero e tengo sempre una mano vicino alla mia lama o al borsello.",
      "Mi sento a casa solo nei vicoli bui, sui tetti e nei cunicoli sotterranei della città.",
      "Non mi fido di chi mi fa promesse troppo belle: nessuno regala niente per niente.",
      "Ho un piccolo animale domestico (un topo, un piccione) a cui sono affezionatissimo.",
      "So come passare inosservato tra la folla e confordermi tra le ombre urbane.",
      "Se qualcuno è gentile con me senza un secondo fine, mi sento spaesato e sospettoso."
    ],
    tratti_en: [
      "I hide scraps of food and trinkets away in my pockets.",
      "I ask a lot of questions.",
      "I like to squeeze into small boundaries where no one can reach me.",
      "I sleep with my back to a wall or tree, with everything I own wrapped in a bundle in my arms.",
      "I eat like a pig and have bad manners.",
      "I think anyone who's nice to me is hiding evil intent.",
      "I don't like to bathe.",
      "I bluntly say what other people are hinting at or hiding."
    ],
    ideali: [
      "Rispetto. Nessun bambino o derelitto dovrebbe subire le sofferenze che ho passato io. (Buono)",
      "Comunità. Noi ragazzi di strada dobbiamo aiutarci a vicenda per sopravvivere. (Legale)",
      "Cambiamento. La ricchezza e il potere della città devono essere redistribuiti dal basso. (Caotico)",
      "Ritorsione. La società mi ha trattato come spazzatura; ora mi prenderò tutto ciò che voglio. (Malvagio)",
      "Sopravvivenza. Ognuno bada a se stesso: la strada non perdona i deboli e gli ingenui. (Neutrale)",
      "Aspirazione. Dimostrerò a tutti che un ragazzo di strada può diventare un grande eroe. (Qualsiasi)"
    ],
    ideali_en: [
      "Respect. All people, rich or poor, deserve respect. (Good)",
      "Community. We have to take care of each other, because no one else is going to do it. (Lawful)",
      "Change. The low are raised up, and the high and mighty are brought down. Change is the nature of things. (Chaotic)",
      "Retribution. The rich need to be shown what life and death are like in the gutters. (Evil)",
      "People. I help the people who help me—that's what keeps us alive. (Neutral)",
      "Aspiration. I'm going to prove that I'm worthy of a better life. (Any)"
    ],
    legami: [
      "La mia città è la mia casa; difenderò i suoi quartieri poveri da qualsiasi mostro o tiranno.",
      "Un giorno troverò i genitori che mi hanno abbandonato nei vicoli per scoprire la verità.",
      "Devo tutto all'amico d'infanzia che ha diviso l'ultimo tozzo di pane con me durante l'inverno.",
      "Custodisco un piccolo ciondolo rotto, unico ricordo della mia famiglia perduta.",
      "Voglio fondare un rifugio sicuro per togliere tutti i ragazzi poveri dalla strada.",
      "Farò pagare caro alla gilda criminale locale lo sfruttamento dei giovani orfani."
    ],
    legami_en: [
      "My town or city is my home, and I'll fight to defend it.",
      "I sponsor an orphanage to keep others from enduring what I was forced to endure.",
      "I owe my survival to another urchin who taught me to live on the streets.",
      "I have a pocket full of robbed trinkets that remind me of my home town.",
      "I would die to protect my animal companion.",
      "No one else is going to have to endure the hardships I've been through."
    ],
    difetti: [
      "Se vedo un'opportunità di arraffare cibo o denaro facile, agisco prima di pensare.",
      "Quando mi sento minacciato o messo all'angolo, reagisco con una violenza improvvisa.",
      "Non riesco a fidarmi delle autorità: per me le guardie sono sempre nemiche.",
      "Faccio fatica a separarmi da oggetti anche inutili: accumulo cianfrusaglie per paura di rimanere senza.",
      "Non conosco le buone maniere e metto spesso in imbarazzo i miei compagni nelle occasioni formali.",
      "La paura della fame e della miseria a volte mi spinge a decisioni ciniche ed egoiste."
    ],
    difetti_en: [
      "If I'm outnumbered, I will run away from a fight.",
      "Gold seems like a lot of money to me, and I'll do just about anything for more of it.",
      "I will never fully trust anyone other than myself.",
      "I'd rather kill someone in their sleep than fight fair.",
      "It's not stealing if I need it more than someone else.",
      "People who can't take care of themselves get what they deserve."
    ]
  },

  nobile: {
    nome: 'Nobile',
    nome_en: 'Noble',
    tratti: [
      "La mia adulazione rende chiaro chiunque mi ascolti che la mia nascita mi pone al di sopra della plebe.",
      "Tengo sempre un portamento impeccabile e pretendo che mi si rivolga con il dovuto rispetto.",
      "Non tollero la scortesia o i modi rozzi; la buona educazione è il pilastro della civiltà.",
      "Faccio di tutto per proteggere e accrescere il buon nome e il prestigio del mio casato.",
      "Amo il lusso, gli abiti sontuosi, il buon vino e i cavalli di razza pregiata.",
      "Non mi sporco mai le mani con compiti umili se posso pagare qualcuno per farlo al posto mio.",
      "Nonostante i miei privilegi, sento il peso della responsabilità verso chi dipende dalla mia famiglia.",
      "Parlo con eloquenza raffinata e uso spesso citazioni erudite e motti nobiliari."
    ],
    tratti_en: [
      "My eloquent flattery makes everyone I talk to feel like the most wonderful and important person in the world.",
      "The common folk love me for my kindness and generosity.",
      "No one could doubt by looking at my regal bearing that I am a cut above the unwashed masses.",
      "I take great pains to always look my best and follow the latest fashions.",
      "I don't like to get my hands dirty, and I won't be caught dead in unsuitable accommodations.",
      "Despite my noble birth, I do not place myself above other folk. We all have the same blood.",
      "My favor, once lost, is lost forever.",
      "If you do me an injury, I will crush you, ruin your name, and salt your fields."
    ],
    ideali: [
      "Rispetto. Il rispetto per l'autorità e per la nobiltà è ciò che impedisce al mondo di cadere nel caos. (Legale)",
      "Responsabilità. È dovere dei nobili guidare e proteggere il popolo affidato alle loro cure. (Buono)",
      "Indipendenza. Non permetterò alle rigide convenzioni di corte di soffocare la mia libertà. (Caotico)",
      "Potere. Il sangue nobile mi conferisce il diritto naturale di comandare sugli altri. (Malvagio)",
      "Famiglia. La lealtà al mio casato viene prima di qualunque legge o morale personale. (Neutrale)",
      "Noblesse Oblige. Devo dimostrare con grandi gesta di meritare i privilegi con cui sono nato. (Buono)"
    ],
    ideali_en: [
      "Respect. Respect is due to me because of my position, but all people regardless of station deserve to be treated with dignity. (Good)",
      "Responsibility. It is my duty to respect the authority of those above me, just as those below me must respect mine. (Lawful)",
      "Independence. I must prove that I can handle myself without the coddling of my family. (Chaotic)",
      "Power. If I can attain more power, no one will tell me what to do. (Evil)",
      "Family. Blood runs thicker than water. (Any)",
      "Noble Obligation. My title and wealth are a public trust; I must protect those beneath me. (Good)"
    ],
    legami: [
      "Riconquisterò le terre e il titolo che sono stati usurpati alla mia famiglia con l'inganno.",
      "Il mio anello con sigillo nobiliare è il simbolo del mio onore e non me ne separerò mai.",
      "Tutto ciò che faccio è per dimostrare a mio padre/madre di essere un erede all'altezza del casato.",
      "Devo proteggere la mia famiglia da una congiura ordita da un casato rivale a corte.",
      "Sono innamorato di una persona comune e sfiderò la mia famiglia pur di stare con lei.",
      "Voglio rendere il mio feudo un modello di giustizia, prosperità e pace per tutto il regno."
    ],
    legami_en: [
      "I will face any challenge to win the approval of my family.",
      "My house's alliance with another noble family must be sustained at all costs.",
      "Nothing is more important than the other members of my family.",
      "I am in love with the heir of a family that my family despises.",
      "My loyalty to my sovereign is unwavering.",
      "The common folk must see me as a hero of the people."
    ],
    difetti: [
      "Sotto sotto considero la gente comune inferiore e faccio fatica a nascondere il mio disprezzo.",
      "Se qualcuno insulta il mio onore o la mia famiglia, pretendo soddisfazione con un duello.",
      "Spendo cifre esorbitanti per mantenere uno stile di vita sontuoso anche quando sono al verde.",
      "Fatico ad accettare consigli o critiche da chi non appartiene alla mia stessa classe sociale.",
      "Ho un segreto di famiglia scandaloso che distruggerebbe la nostra reputazione se rivelato.",
      "La mia arroganza mi porta a sottovalutare i pericoli e i nemici che considero 'inferiori'."
    ],
    difetti_en: [
      "I secretly believe that everyone is beneath me.",
      "I hide a truly scandalous secret that could ruin my family forever.",
      "I too often hear veiled insults and threats in every word addressed to me, and I'm quick to anger.",
      "I have an insatiable desire for carnal pleasures.",
      "In fact, the world does revolve around me.",
      "By my words and actions, I often bring shame to my family."
    ]
  },

  saggio: {
    nome: 'Saggio',
    nome_en: 'Sage',
    tratti: [
      "Uso spesso parole colte e complicate per spiegare anche i concetti più banali.",
      "Ho letto quasi tutti i libri delle biblioteche della mia città e non perdo occasione per citarli.",
      "Sono abituato ad analizzare i problemi con rigore scientifico e logica ferrea.",
      "La mia curiosità non ha limiti: non resisto davanti a un enigma, un codice o una lingua sconosciuta.",
      "Mi distraggo facilmente quando trovo un testo antico o un'iscrizione interessante.",
      "Spesso parlo tra me e me mentre rifletto su teorie filosofiche o formule arcane.",
      "Non mi curo dell'aspetto fisico o degli abiti: per me conta solo la brillantezza della mente.",
      "Preferisco trascorrere una notte a studiare in biblioteca che partecipare a una festa."
    ],
    tratti_en: [
      "I use polysyllabic words that convey the impression of great erudition.",
      "I've read every book in the world's greatest libraries—or I like to boast that I have.",
      "I'm used to helping out those who aren't as smart as I am, and I patiently explain anything and everything to others.",
      "There's nothing I like more than a good mystery.",
      "I'm willing to listen to every side of an argument before I make up my own mind.",
      "I . . . speak . . . slowly . . . when talking . . . to idiots, . . . which . . . almost . . . everyone . . . is . . . compared . . . to me.",
      "I am horribly, awkwardly socially inept.",
      "I'm convinced that people are always trying to steal my secrets."
    ],
    ideali: [
      "Conoscenza. La conoscenza e la ricerca della verità sono il bene più prezioso dell'umanità. (Neutrale)",
      "Miglioramento. Dobbiamo usare le nostre scoperte per migliorare la vita di tutti e curare i mali del mondo. (Buono)",
      "Libertà. Il libero pensiero e la ricerca non devono essere limitati da dogmi o censure di corte. (Caotico)",
      "Potere. Chi possiede la conoscenza possiede il potere di plasmare il mondo a proprio piacimento. (Malvagio)",
      "Logica. Le emozioni non devono interferire con l'analisi razionale della realtà. (Legale)",
      "Auto-perfezionamento. Dedico la vita a spingere i confini della mia mente oltre ogni limite noto. (Qualsiasi)"
    ],
    ideali_en: [
      "Knowledge. The path to power and self-improvement is through knowledge. (Neutral)",
      "Beauty. What is beautiful points beyond itself to what is true. (Good)",
      "Logic. Emotions must not cloud our logical thinking. (Lawful)",
      "No Limits. Nothing should fetter the infinite possibility inherent in all existence. (Chaotic)",
      "Power. Knowledge is the path to power and domination. (Evil)",
      "Self-Improvement. The goal of a life of study is the betterment of oneself. (Any)"
    ],
    legami: [
      "Dedico la vita a completare il grande trattato accademico iniziato dal mio illustre maestro.",
      "Custodisco un antico tomo che contiene un segreto proibito che molti ucciderebbero per avere.",
      "Voglio scoprire la verità sulla scomparsa di un'antica civiltà perduta.",
      "L'università o la biblioteca in cui ho studiato è il luogo sacro che difenderò a ogni costo.",
      "Devo dimostrare a tutti i colleghi accademici che la mia teoria rivoluzionaria è corretta.",
      "Voglio recuperare i testi sacri e i rotoli perduti bruciati durante l'ultima grande guerra."
    ],
    legami_en: [
      "It is my duty to protect my students.",
      "I have an ancient text that holds terrible secrets, which must not fall into the wrong hands.",
      "I work to preserve a library, university, scriptorium, or monastery.",
      "My life's work is a series of tomes related to a specific field of lore.",
      "I've been searching my whole life for the answer to a certain question.",
      "I sold my soul for knowledge. I hope to do great deeds and win it back."
    ],
    difetti: [
      "Mi perdo così tanto nei miei studi teorici da ignorare completamente i pericoli concreti attorno a me.",
      "Sono superbo e tratto con condiscendenza chiunque non possieda la mia cultura.",
      "Non riesco a mantenere un segreto se si tratta di una scoperta accademica sensazionale.",
      "Rischio la vita mia e dei miei compagni pur di mettere le mani su un libro o un manufatto raro.",
      "Fatico a prendere decisioni pratiche immediate: voglio sempre analizzare tutte le variabili.",
      "Parlo per ore senza accorgermi che i miei interlocutori si stanno annoiando mortalmente."
    ],
    difetti_en: [
      "I am easily distracted by the promise of information.",
      "Most people scream and run when they see a demon. I stop and take notes on its anatomy.",
      "Unlocking an ancient mystery is worth the price of a civilization.",
      "I overlook obvious solutions in favor of complicated ones.",
      "I speak without really thinking through my words, invariably insulting others.",
      "I can't keep a secret to save my life, or anyone else's."
    ]
  },

  soldato: {
    nome: 'Soldato',
    nome_en: 'Soldier',
    tratti: [
      "Sono sempre vigile e valuto costantemente vantaggi tattici e coperture ovunque mi trovi.",
      "Rispetto la disciplina militare e seguo gli ordini con rigore, pretendendo lealtà in cambio.",
      "Porto con fierezza le cicatrici delle mie battaglie passate e racconto volentieri come me le sono procurate.",
      "Mantengo la calma anche nel caos della battaglia; il panico è il vero nemico.",
      "Uso un linguaggio diretto, schietto e senza fronzoli tipico della truppa.",
      "Pulisco e curo il mio equipaggiamento e le mie armi con devozione maniacale ogni sera.",
      "Ho visto gli orrori della guerra e faccio di tutto per risparmiare violenze inutili ai civili.",
      "Non mi fido di chi non ha mai impugnato una spada o combattuto per difendere i compagni."
    ],
    tratti_en: [
      "I'm always polite and respectful.",
      "I'm haunted by memories of war. I can't get the images of violence out of my mind.",
      "I've lost too many friends, and I'm slow to make new ones.",
      "I'm full of inspiring and cautionary tales from my military experience relevant to almost every combat situation.",
      "I can stare down a hell hound without flinching.",
      "I enjoy being strong and like breaking things.",
      "I have a crude sense of humor.",
      "I face problems head-on. A simple, direct solution is the best path to success."
    ],
    ideali: [
      "Dovere. Faccio ciò che deve essere fatto e obbedisco all'autorità legittima per proteggere il regno. (Legale)",
      "Protezione. È dovere del soldato fare da scudo agli indifesi e sacrificarsi per il bene comune. (Buono)",
      "Indipendenza. Se un ordine è palesemente ingiusto o crudele, la coscienza viene prima della gerarchia. (Caotico)",
      "Potere. In guerra vince chi ha la forza di imporre la propria volontà senza pietà. (Malvagio)",
      "Cameratismo. Combatto per i compagni che ho al mio fianco, non per bandiere o re lontani. (Neutrale)",
      "Gloria. Voglio che il mio nome sia ricordato per sempre negli annali delle grandi battaglie. (Qualsiasi)"
    ],
    ideali_en: [
      "Greater Good. Our lot is to lay down our lives in defense of others. (Good)",
      "Responsibility. I do what I must and obey just authority. (Lawful)",
      "Independence. When people follow orders blindly, they embrace a kind of tyranny. (Chaotic)",
      "Might. In life as in war, the stronger force wins. (Evil)",
      "Live and Let Live. Ideals aren't worth killing over or going to war for. (Neutral)",
      "Nation. My city, nation, or people are all that matter. (Any)"
    ],
    legami: [
      "Morirei pur di salvare i compagni con cui ho condiviso il fango e il sangue delle trincee.",
      "Voglio vendicare la mia unità militare, caduta in un'imboscata a causa di un traditore.",
      "Custodisco la bandiera o lo stemma del mio reggimento come la cosa più preziosa che ho.",
      "Combatto per garantire un futuro di pace e sicurezza alla mia famiglia rimasta a casa.",
      "Devo la vita al mio vecchio comandante che mi ha tratto in salvo quando ero ferito a morte.",
      "Non avrò pace finché il nemico che ha devastato la mia patria non sarà sconfitto definitivamente."
    ],
    legami_en: [
      "I would still lay down my life for the people I served with.",
      "Someone saved my life on the battlefield. To this day, I will never leave a friend behind.",
      "My honor is my life.",
      "I'll never forget the crushing defeat my company suffered or the enemies who dealt it.",
      "Those who fight beside me are those worth dying for.",
      "I fight for those who cannot fight for themselves."
    ],
    difetti: [
      "I ricordi traumatici della guerra mi perseguitano la notte e mi rendono irascibile di giorno.",
      "Ho difficoltà a rispettare chi non ha servito nell'esercito o chi non dimostra disciplina.",
      "La mia prima reazione davanti a un conflitto è ricorrere alla violenza o alle minacce fisiche.",
      "Seguo gli ordini anche quando sospetto che siano moralmente discutibili per paura di disubbidire.",
      "Ho un debole per il gioco d'azzardo e l'alcol forte dei soldati in congedo.",
      "Il mio odio viscerale verso il nemico della mia passata campagna militare offusca il mio giudizio."
    ],
    difetti_en: [
      "The monstrous enemy we faced in battle still leaves me quivering with fear.",
      "I have little respect for anyone who is not a proven warrior.",
      "I made a terrible mistake in battle that cost many lives—and I would do anything to keep that secret.",
      "My hatred of my enemies is blind and unreasoning.",
      "I obey the law, even if the law causes misery.",
      "I'd rather eat my weapon than admit when I'm wrong."
    ]
  }
};

const ALIAS_BACKGROUND = {
  contadino: 'eroe_popolare',
  farmer: 'eroe_popolare',
  viandante: 'forestiero',
  wanderer: 'forestiero',
  guida: 'forestiero',
  guide: 'forestiero',
  guardia: 'soldato',
  guard: 'soldato',
  mercante: 'artigiano',
  merchant: 'artigiano',
  scriba: 'saggio',
  scribe: 'saggio',
  sapiente: 'saggio',
  scholar: 'saggio',
  bandito: 'criminale',
  bandit: 'criminale',
  pirata: 'marinaio',
  pirate: 'marinaio',
  gladiatore: 'intrattenitore',
  gladiator: 'intrattenitore',
  cavaliere: 'nobile',
  knight: 'nobile'
};

/**
 * Cerca le tabelle del background per nome (in italiano o inglese, ignorando maiuscole e accenti).
 */
export function datiTabelleBackground(nome, lingua = 'it') {
  if (!nome || typeof nome !== 'string') return null;
  const pulito = nome.toLowerCase().trim()
    .replace(/^📜\s*/, '')
    .replace(/[^a-z0-9àèéìòù]/g, '');

  if (!pulito) return null;

  const chiaveRisolta = ALIAS_BACKGROUND[pulito];
  if (chiaveRisolta && TABELLE_BACKGROUND[chiaveRisolta]) {
    const bg = TABELLE_BACKGROUND[chiaveRisolta];
    const isEn = lingua === 'en';
    return {
      chiave: chiaveRisolta,
      nome: isEn ? bg.nome_en : bg.nome,
      tratti: isEn ? (bg.tratti_en || bg.tratti) : bg.tratti,
      ideali: isEn ? (bg.ideali_en || bg.ideali) : bg.ideali,
      legami: isEn ? (bg.legami_en || bg.legami) : bg.legami,
      difetti: isEn ? (bg.difetti_en || bg.difetti) : bg.difetti,
    };
  }

  for (const [chiave, bg] of Object.entries(TABELLE_BACKGROUND)) {
    const kClean = chiave.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nClean = (bg.nome || '').toLowerCase().replace(/[^a-z0-9àèéìòù]/g, '');
    const enClean = (bg.nome_en || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (kClean.includes(pulito) || pulito.includes(kClean) ||
        nClean.includes(pulito) || pulito.includes(nClean) ||
        enClean.includes(pulito) || pulito.includes(enClean)) {
      
      const isEn = lingua === 'en';
      return {
        chiave,
        nome: isEn ? bg.nome_en : bg.nome,
        tratti: isEn ? (bg.tratti_en || bg.tratti) : bg.tratti,
        ideali: isEn ? (bg.ideali_en || bg.ideali) : bg.ideali,
        legami: isEn ? (bg.legami_en || bg.legami) : bg.legami,
        difetti: isEn ? (bg.difetti_en || bg.difetti) : bg.difetti,
      };
    }
  }

  return null;
}
