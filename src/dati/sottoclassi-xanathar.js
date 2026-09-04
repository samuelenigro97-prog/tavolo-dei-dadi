export const SOTTOCLASSI_XANATHAR = {
  'Cammino del Guardiano Ancestrale': {
    classe: 'Barbaro',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Protettori Ancestrali', desc: 'Evoca spiriti in ira che impongono svantaggio agli attacchi del bersaglio verso gli altri.' }],
      6: [{ nome: 'Spiriti Protettori', desc: 'Usa la reazione per ridurre di 2d6 i danni a un alleato (scala a 3d6 e 4d6).' }],
      10: [{ nome: 'Consultare gli Spiriti', desc: 'Lancia presagio o chiaroveggenza senza componenti.' }],
      14: [{ nome: 'Antenati Vendicativi', desc: 'Quando usi Spiriti Protettori, l\'attaccante subisce danni da forza pari ai danni prevenuti.' }]
    }
  },
  'Cammino dell\'Araldo della Tempesta': {
    classe: 'Barbaro',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Aura Tempestosa', desc: 'Emana un\'aura in ira (Deserto: danni da fuoco; Mare: danni da fulmine; Tundra: PF temporanei).' }],
      6: [{ nome: 'Anima Tempestosa', desc: 'Ottiene resistenza ai danni e benefici in base all\'ambiente scelto.' }],
      10: [{ nome: 'Tempesta Protettrice', desc: 'Alleati nell\'aura ottengono la resistenza ai danni dell\'ambiente scelto.' }],
      14: [{ nome: 'Tempesta Furibonda', desc: 'Effetti aggiuntivi potenti quando l\'aura si attiva (danni al contatto, buttare a terra, o velocità ridotta a 0).' }]
    }
  },
  'Cammino dello Zelota': {
    classe: 'Barbaro',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Furia Divina', desc: 'Il primo colpo in ira infligge danni radiosi o necrotici extra.' }, { nome: 'Guerriero degli Dei', desc: 'Riportarti in vita non richiede componenti materiali.' }],
      6: [{ nome: 'Concentrazione Fanatica', desc: 'Può ripetere un tiro salvezza fallito una volta per ira.' }],
      10: [{ nome: 'Presenza Zelante', desc: 'Con un grido di battaglia infonde vantaggio agli alleati.' }],
      14: [{ nome: 'Ira Inestinguibile', desc: 'Mentre sei in ira, avere 0 PF non ti fa svenire o morire finché l\'ira non finisce.' }]
    }
  },
  'Collegio del Fascino': {
    classe: 'Bardo',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Manto dell\'Ispirazione', desc: 'Usa Ispirazione Bardica per dare PF temporanei e permettere movimento come reazione.' }, { nome: 'Esibizione Ammaliante', desc: 'Usa un\'esibizione di 1 minuto per affascinare il pubblico.' }],
      6: [{ nome: 'Comando del Manto', desc: 'Può lanciare comando senza slot per 1 minuto.' }],
      14: [{ nome: 'Maestà Inviolabile', desc: 'I nemici devono superare un TS Carisma per attaccare il bardo, altrimenti devono scegliere un altro bersaglio.' }]
    }
  },
  'Collegio degli Spadaccini': {
    classe: 'Bardo',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Competenze Bonus', desc: 'Armature medie e scimitarra. Può usare un\'arma da mischia come focus.' }, { nome: 'Stile di Combattimento', desc: 'Scegli Duellare o Combattere con Due Armi.' }, { nome: 'Fioritura della Lama', desc: 'Aumenta velocità di 3m quando attacca. Usa Ispirazione per danni extra e vari effetti (CA bonus, spingere o danni ad area).' }],
      6: [{ nome: 'Attacco Extra', desc: 'Può attaccare due volte nell\'azione di attacco.' }],
      14: [{ nome: 'Fioritura della Lama Superiore', desc: 'Può usare un d6 invece di consumare Ispirazione Bardica per le Fioriture.' }]
    }
  },
  'Collegio dei Sussurri': {
    classe: 'Bardo',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Lame Psichiche', desc: 'Usa Ispirazione Bardica per infliggere danni psichici extra con un attacco con arma.' }, { nome: 'Parole di Terrore', desc: 'Può spaventare un bersaglio dopo 1 minuto di conversazione.' }],
      6: [{ nome: 'Manto dei Sussurri', desc: 'Assorbe l\'ombra di un umanoide morto per assumerne le sembianze e ricordi superficiali.' }],
      14: [{ nome: 'Sapere Oscuro', desc: 'Può lanciare un incantesimo di charme speciale e ricattare il bersaglio facendogli credere che il bardo sappia i suoi segreti.' }]
    }
  },
  'Dominio della Forgia': {
    classe: 'Chierico',
    fonte: 'Xanathar',
    privilegi: {
      1: [{ nome: 'Competenze Bonus', desc: 'Armature pesanti e strumenti da fabbro.' }, { nome: 'Benedizione della Forgia', desc: 'Rende magica un\'arma o armatura (+1) fino al riposo lungo.' }],
      2: [{ nome: 'Incanalare Divinità: Creazione dell\'Artigiano', desc: 'Crea oggetti non magici fino a 100 mo in 1 ora.' }],
      6: [{ nome: 'Anima della Forgia', desc: 'Resistenza ai danni da fuoco e +1 CA se indossi armatura pesante.' }],
      8: [{ nome: 'Colpo Divino', desc: 'Infligge 1d8 danni da fuoco extra con gli attacchi con armi (2d8 al 14°).' }],
      17: [{ nome: 'Santuario della Forgia', desc: 'Immunità ai danni da fuoco e resistenza ai danni contundenti, perforanti e taglienti non magici.' }]
    }
  },
  'Dominio della Tomba': {
    classe: 'Chierico',
    fonte: 'Xanathar',
    privilegi: {
      1: [{ nome: 'Cerchio della Mortalità', desc: 'Le cure su bersagli a 0 PF guariscono del massimo possibile. Lancia risparmiare i morenti come azione bonus.' }, { nome: 'Occhi della Tomba', desc: 'Percepisce non morti entro 18m per 1 volta per riposo.' }],
      2: [{ nome: 'Incanalare Divinità: Sentiero per la Tomba', desc: 'Maledice un nemico, dandogli vulnerabilità al prossimo attacco che subisce.' }],
      6: [{ nome: 'Sentinella della Soglia', desc: 'Come reazione, può trasformare un colpo critico subito da un alleato entro 9m in un colpo normale.' }],
      8: [{ nome: 'Lancio di Incantesimi Potenziato', desc: 'Aggiunge il modificatore di Saggezza ai danni dei trucchetti da chierico.' }],
      17: [{ nome: 'Custode delle Anime', desc: 'Quando un nemico muore entro 9m, cura se stesso o un alleato pari ai dadi vita del nemico.' }]
    }
  },
  'Circolo dei Sogni': {
    classe: 'Druido',
    fonte: 'Xanathar',
    privilegi: {
      2: [{ nome: 'Balsamo della Corte d\'Estate', desc: 'Dadi cura d6 aggiuntivi da usare come azione bonus. Donano anche 1 PF temporaneo per dado.' }],
      6: [{ nome: 'Focolare di Luce Lunare e Ombra', desc: 'Crea un riparo sicuro durante i riposi che dà bonus a Furtività e Percezione (+5).' }],
      10: [{ nome: 'Sentieri Nascosti', desc: 'Teletrasporta se stesso fino a 18m o un alleato fino a 9m come azione bonus.' }],
      14: [{ nome: 'Camminatore dei Sogni', desc: 'Lancia camminare nei sogni, scrying o teletrasporto (tramite sogni) gratuitamente 1 volta per riposo lungo.' }]
    }
  },
  'Circolo del Pastore': {
    classe: 'Druido',
    fonte: 'Xanathar',
    privilegi: {
      2: [{ nome: 'Linguaggio delle Selve', desc: 'Comunica con le bestie.' }, { nome: 'Spirito Totemico', desc: 'Evoca uno spirito (Orso, Falco o Unicorno) che dona un\'aura di buff (PF temp, vantaggio agli attacchi, o cure extra).' }],
      6: [{ nome: 'Evocatore Possente', desc: 'Bestie e folletti evocati hanno PF extra (+2 per dado vita) e attacchi considerati magici.' }],
      10: [{ nome: 'Spirito Guardiano', desc: 'Bestie e folletti evocati recuperano PF nell\'aura dello Spirito Totemico.' }],
      14: [{ nome: 'Spiriti Protettori', desc: 'Evoca 4 bestie con evoca animali automaticamente se il druido scende a 0 PF.' }]
    }
  },
  'Arciere Arcano': {
    classe: 'Guerriero',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Tradizione dell\'Arciere Arcano', desc: 'Competenza in un\'abilità magica e impara un trucchetto (prestidigitazione o druidcraft).' }, { nome: 'Freccia Arcana', desc: 'Impara due opzioni di freccia magica. 2 usi per riposo breve/lungo.' }],
      7: [{ nome: 'Freccia Magica', desc: 'Frecce sparate sono considerate magiche.' }, { nome: 'Tiro Incurvato', desc: 'Se manca un attacco, può usare un\'azione bonus per ritirarlo contro un altro bersaglio vicino.' }],
      10: [{ nome: 'Opzioni Aggiuntive', desc: 'Impara una nuova opzione di Freccia Arcana.' }],
      15: [{ nome: 'Prontezza Arcana', desc: 'Recupera un uso di Freccia Arcana se tira iniziativa e ne ha 0.' }],
      18: [{ nome: 'Frecce Potenziate', desc: 'I danni extra o gli effetti delle frecce aumentano.' }]
    }
  },
  'Cavaliere': {
    classe: 'Guerriero',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Competenze Bonus', desc: 'Un\'abilità extra e competenza in lingua o strumento.' }, { nome: 'Nato per la Sella', desc: 'Vantaggio sui TS per non cadere da sella, e montare/smontare costa 1,5m.' }, { nome: 'Marchio Incrollabile', desc: 'Marchia chi colpisce, dando svantaggio ad attaccare altri. Può effettuare un attacco bonus se il marchiato danneggia un alleato.' }],
      7: [{ nome: 'Manovra Difensiva', desc: 'Aggiunge 1d8 alla CA di un alleato vicino o a se stesso contro un attacco, usando la reazione.' }],
      10: [{ nome: 'Mantenere la Posizione', desc: 'Gli AdO riducono la velocità del bersaglio a 0 e si attivano anche se il nemico si sposta di 1,5m.' }],
      15: [{ nome: 'Carica Feroce', desc: 'Se si muove per 3m prima di attaccare, può buttare il bersaglio a terra con un TS Forza.' }],
      18: [{ nome: 'Difensore Vigile', desc: 'Ottiene una reazione speciale per ogni turno in combattimento, usabile solo per Attacchi di Opportunità.' }]
    }
  },
  'Samurai': {
    classe: 'Guerriero',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Competenze Bonus', desc: 'Un\'abilità (Storia, Intuizione, Persuasione, etc.) o lingua.' }, { nome: 'Spirito Combattivo', desc: 'Azione bonus per ottenere vantaggio a tutti gli attacchi del turno e 5 PF temporanei. 3 usi/riposo lungo.' }],
      7: [{ nome: 'Cortigiano Elegante', desc: 'Aggiunge Mod. Saggezza a Persuasione. Ottiene competenza nei TS Saggezza.' }],
      10: [{ nome: 'Spirito Indomito', desc: 'Se inizia il combattimento con 0 usi di Spirito Combattivo, ne recupera 1.' }],
      15: [{ nome: 'Colpo Rapido', desc: 'Può rinunciare a vantaggio su un attacco per effettuare un attacco aggiuntivo in quel turno.' }],
      18: [{ nome: 'Forza Prima della Morte', desc: 'Se scende a 0 PF, può compiere un turno extra immediato prima di svenire.' }]
    }
  },
  'Esploratore': {
    classe: 'Ladro',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Schermagliatore', desc: 'Reazione per muoversi di metà velocità (senza AdO) quando un nemico finisce il turno adiacente.' }, { nome: 'Sopravvivenza', desc: 'Competenza in Natura e Sopravvivenza, con doppio bonus (Maestria).' }],
      9: [{ nome: 'Mobilità Superiore', desc: 'Velocità base aumenta di 3m (anche a nuotare/scalare se possedute).' }],
      13: [{ nome: 'Maestro dell\'Imboscata', desc: 'Vantaggio a Iniziativa. Il primo bersaglio colpito nel primo turno dà vantaggio agli attacchi di tutti gli alleati fino all\'inizio del prossimo turno.' }],
      17: [{ nome: 'Colpo Improvviso', desc: 'Può effettuare un attacco aggiuntivo con l\'azione bonus, potendo applicare Attacco Furtivo due volte in un turno (ma su bersagli diversi).' }]
    }
  },
  'Inquisitivo': {
    classe: 'Ladro',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Orecchio per l\'Inganno', desc: 'Non tiri mai meno di 8 (sul dado) in Intuizione per capire bugie.' }, { nome: 'Occhio per i Dettagli', desc: 'Percezione e Indagare come azione bonus.' }, { nome: 'Combattimento Analitico', desc: 'Vinci una prova Intuizione vs Inganno per usare Attacco Furtivo per 1 minuto anche senza vantaggio.' }],
      9: [{ nome: 'Sguardo Penetrante', desc: 'Vantaggio a Percezione per notare illusioni o mutaforma.' }],
      13: [{ nome: 'Sensibile all\'Inganno', desc: 'Sente automaticamente l\'inganno magico o se le creature sono incantate.' }],
      17: [{ nome: 'Colpo Mirato', desc: 'Quando usi Combattimento Analitico, l\'Attacco Furtivo infligge +3d6 danni.' }]
    }
  },
  'Spadaccino': {
    classe: 'Ladro',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Gioco di Gambe Affascinante', desc: 'Se attacchi una creatura, essa non può farti AdO per il resto del turno.' }, { nome: 'Audacia Spavalda', desc: 'Aggiunge Carisma all\'Iniziativa. Può usare Attacco Furtivo se è a 1,5m dal nemico e non ha altri alleati/nemici adiacenti.' }],
      9: [{ nome: 'Eleganza Formidabile', desc: 'Prova di Persuasione (contro Intuizione) per affascinare un bersaglio o schernirlo (dando svantaggio ai suoi attacchi contro altri).' }],
      13: [{ nome: 'Manovra Elegante', desc: 'Azione bonus per vantaggio in prove di Acrobazia o Atletica.' }],
      17: [{ nome: 'Maestro Duellante', desc: 'Può ripetere con vantaggio un attacco mancato. 1 uso per riposo breve/lungo.' }]
    }
  },
  'Mente Eccelsa': {
    classe: 'Ladro',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Maestro degli Intrighi', desc: 'Competenza con arnesi da falsario, trucchi da camuffamento e due lingue. Mimicry di voci.' }, { nome: 'Tattico', desc: 'Azione Aiuto usabile come azione bonus a 9m di distanza.' }],
      9: [{ nome: 'Intuizione Infallibile', desc: 'Può studiare una creatura per capirne le statistiche (se superiori/inferiori alle proprie).' }],
      13: [{ nome: 'Deviare l\'Attacco', desc: 'Se una creatura ti attacca e hai copertura di un\'altra creatura, l\'attacco colpisce la copertura.' }],
      17: [{ nome: 'Anima Ingannevole', desc: 'Immune alla lettura del pensiero e divinazioni che rivelano la verità.' }]
    }
  },
  'Magia della Guerra': {
    classe: 'Mago',
    fonte: 'Xanathar',
    privilegi: {
      2: [{ nome: 'Deflessione Arcana', desc: 'Reazione per +2 CA o +4 TS contro un attacco/effetto, ma non lancia magie non-trucchetto nel turno successivo.' }, { nome: 'Ingegno Tattico', desc: 'Aggiunge mod. Intelligenza all\'Iniziativa.' }],
      6: [{ nome: 'Ondata di Potere', desc: 'Accumula cariche dissolvendo magie, usabili per aggiungere metà livello ai danni di un incantesimo.' }],
      10: [{ nome: 'Magia Difensiva', desc: '+2 CA e TS quando concentra su un incantesimo.' }],
      14: [{ nome: 'Deflessione Letale', desc: 'Quando usi Deflessione Arcana, infliggi danni da forza (metà livello del mago) a chi ti circonda a 3m.' }]
    }
  },
  'Via del Kensei': {
    classe: 'Monaco',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Via del Kensei', desc: 'Sceglie armi da mischia e a distanza (no Pesante/Speciale) che diventano armi da monaco. Parata Agile (+2 CA) e Colpo del Kensei (danni extra con arma a distanza).' }],
      6: [{ nome: 'Una Cosa Sola con la Lama', desc: 'Armi Kensei magiche. Usa 1 ki per aumentare i danni dell\'arma Kensei pari al dado di Arti Marziali.' }],
      11: [{ nome: 'Precisione Affilata', desc: 'Spende fino a 3 ki per dare +1/+2/+3 bonus a Tiri Colpire/Danni per un\'arma Kensei.' }],
      17: [{ nome: 'Mira Infallibile', desc: 'Se manca un attacco con arma Kensei, lo ripete.' }]
    }
  },
  'Via del Maestro Ubriaco': {
    classe: 'Monaco',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Competenze', desc: 'Intrattenere e scorte da mescitore.' }, { nome: 'Tecnica dell\'Ubriaco', desc: 'Raffica di Colpi dona Disimpegno e +3m di movimento nel turno.' }],
      6: [{ nome: 'Spostamento dell\'Ubriaco', desc: 'Usa 1 ki in reazione se un nemico lo manca per reindirizzare l\'attacco su un\'altra creatura.' }],
      11: [{ nome: 'Fortuna dell\'Ubriaco', desc: 'Spende 2 ki per annullare Svantaggio su un tiro.' }],
      17: [{ nome: 'Raffica Inebriante', desc: 'Può fare fino a 5 attacchi extra (invece di 2) con Raffica di Colpi, se tutti colpiscono creature diverse.' }]
    }
  },
  'Via dell\'Anima Solare': {
    classe: 'Monaco',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Dardo dell\'Anima Solare', desc: 'Attacco a distanza (9m) magico radioso. Usa azione bonus (o ki per 2 attacchi) dopo un attacco.' }],
      6: [{ nome: 'Colpo dell\'Arco Solare', desc: 'Può lanciare mani brucianti come azione bonus dopo attacco usando punti ki (fino a metà livello).' }],
      11: [{ nome: 'Esplosione di Luce Solare', desc: 'Azione per creare un\'esplosione radiosa 6m a 45m. Danni pari a dadi Arti Marziali. Incrementabile con ki.' }],
      17: [{ nome: 'Scudo Solare', desc: 'Usa reazione per infliggere danni radiosi se viene colpito in mischia mentre è illuminato (può accendere/spegnere la luce come azione bonus).' }]
    }
  },
  'Giuramento di Conquista': {
    classe: 'Paladino',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Incanalare Divinità', desc: 'Presenza Conquistatrice (spaventa tutti a 9m) e Colpo Guidato (+10 a un TC).' }],
      7: [{ nome: 'Aura di Conquista', desc: 'Creature spaventate nell\'aura hanno velocità 0 e subiscono danni psichici pari a metà livello all\'inizio del loro turno.' }],
      15: [{ nome: 'Rifiuto Sprezzante', desc: 'Se colpito, l\'attaccante subisce danni psichici pari al Carisma del paladino.' }],
      20: [{ nome: 'Conquistatore Invincibile', desc: 'Resistenza a tutti i danni, un attacco extra, e critici su 19-20 per 1 minuto.' }]
    }
  },
  'Giuramento di Redenzione': {
    classe: 'Paladino',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Incanalare Divinità', desc: 'Emissario di Pace (+5 a Persuasione per 10 min) e Rimproverare Violenza (reattivo danni radiosi a chi ferisce gli alleati).' }],
      7: [{ nome: 'Aura del Guardiano', desc: 'Usa reazione per assorbire i danni destinati a un alleato entro 3m.' }],
      15: [{ nome: 'Spirito Protettivo', desc: 'Recupera PF (1d6+metà liv) a ogni turno se ha meno di metà PF e non è inabile.' }],
      20: [{ nome: 'Emissario della Redenzione', desc: 'Resistenza ai danni da creature. Creature subiscono metà del danno inflitto al paladino. Effetto svanisce contro chi attacchi.' }]
    }
  },
  'Cacciatore delle Tenebre': {
    classe: 'Ranger',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Magia', desc: 'Incantesimi bonus (camuffare se stesso, corda incantata, ecc).' }, { nome: 'Terrore delle Tenebre', desc: '+Iniziativa pari a mod Saggezza, +3m velocità nel primo turno e 1 attacco extra con 1d8 danni extra.' }, { nome: 'Vista Umbratile', desc: 'Scurovisione estesa. Invisibile alle creature che usano la Scurovisione nel buio.' }],
      7: [{ nome: 'Mente Ferrea', desc: 'Competenza nei TS Saggezza.' }],
      11: [{ nome: 'Raffica dello Stalker', desc: 'Se manca un attacco, ne può fare un altro gratis nello stesso turno.' }],
      15: [{ nome: 'Schivata dell\'Ombra', desc: 'Reazione per imporre svantaggio a un attacco che non ha vantaggio.' }]
    }
  },
  'Uccisore di Mostri': {
    classe: 'Ranger',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Magia', desc: 'Incantesimi bonus (protezione dal bene/male, ecc).' }, { nome: 'Senso del Cacciatore', desc: 'Scopri immunità, resistenze e vulnerabilità di un mostro.' }, { nome: 'Preda dell\'Uccisore', desc: 'Azione bonus per marcare. Primo attacco a turno fa +1d6 danni.' }],
      7: [{ nome: 'Nemesi Soprannaturale', desc: 'Aggiunge 1d6 ai TS o lotte contro il bersaglio di Preda dell\'Uccisore.' }],
      11: [{ nome: 'Nemesi della Magia', desc: 'Usa reazione per sventare l\'incantesimo/teletrasporto del bersaglio marcato (TS Saggezza o fallisce).' }],
      15: [{ nome: 'Contrattacco dell\'Uccisore', desc: 'Se il bersaglio marcato obbliga a un TS, usa reazione per fare un attacco; se colpisce, il TS del ranger passa in automatico.' }]
    }
  },
  'Viandante dell\'Orizzonte': {
    classe: 'Ranger',
    fonte: 'Xanathar',
    privilegi: {
      3: [{ nome: 'Magia', desc: 'Incantesimi bonus (passo velato, ecc).' }, { nome: 'Percepire Portali', desc: 'Sente portali planari entro 1,5 km.' }, { nome: 'Colpo Planare', desc: 'Azione bonus: prossimo colpo infligge +1d8 forza e tutto il danno dell\'arma diventa forza.' }],
      7: [{ nome: 'Passo Etereo', desc: 'Lancia forma eterea (fino a fine turno) come azione bonus 1/riposo.' }],
      11: [{ nome: 'Colpo Lontano', desc: 'Si teletrasporta di 3m prima di ogni attacco. Può fare un 3° attacco se colpisce bersagli diversi.' }],
      15: [{ nome: 'Difesa Spettrale', desc: 'Usa reazione per dimezzare il danno da un attacco, diventando intangibile per un attimo.' }]
    }
  },
  'Anima Divina': {
    classe: 'Stregone',
    fonte: 'Xanathar',
    privilegi: {
      1: [{ nome: 'Magia Divina', desc: 'Impara incantesimi anche dalla lista del Chierico. Ottiene un incantesimo extra in base all\'allineamento.' }, { nome: 'Favore degli Dèi', desc: 'Aggiunge 2d4 a un TC o TS fallito. 1/riposo.' }],
      6: [{ nome: 'Guarigione Potenziata', desc: 'Spende 1 punto stregoneria per rerollare dadi cura sugli alleati (o sé stessi) entro 1.5m.' }],
      14: [{ nome: 'Ali Angeliche', desc: 'Azione bonus per manifestare ali (velocità volo 9m).' }],
      18: [{ nome: 'Recupero Soprannaturale', desc: 'Recupera PF pari a metà del massimo con azione bonus. 1/riposo lungo.' }]
    }
  },
  'Magia delle Ombre': {
    classe: 'Stregone',
    fonte: 'Xanathar',
    privilegi: {
      1: [{ nome: 'Occhi dell\'Oscurità', desc: 'Scurovisione 36m. Impara oscurità al 3°, castabile con 2 punti stregoneria (può vederci attraverso).' }, { nome: 'Forza della Tomba', desc: 'Se scende a 0 PF, TS Carisma (CD 5+danni) per rimanere a 1 PF (non vale vs danni radiosi o critici).' }],
      6: [{ nome: 'Segugio del Malaugurio', desc: 'Evoca un Mastino d\'Ombra con 3 punti che insegue bersaglio. Bersaglio ha svantaggio a TS contro tuoi incantesimi.' }],
      14: [{ nome: 'Camminare nelle Ombre', desc: 'Azione bonus per teletrasportarsi di 36m da zona di ombra a zona di ombra.' }],
      18: [{ nome: 'Forma Umbratile', desc: 'Spende 6 punti per resistenza a tutti i danni (tranne forza/radiante) e passare per i muri.' }]
    }
  },
  'Stregoneria della Tempesta': {
    classe: 'Stregone',
    fonte: 'Xanathar',
    privilegi: {
      1: [{ nome: 'Parlare al Vento', desc: 'Parla Primordiale.' }, { nome: 'Magia Tempestosa', desc: 'Azione bonus dopo aver lanciato magia (lv1+) per volare 3m senza provocare AdO.' }],
      6: [{ nome: 'Cuore della Tempesta', desc: 'Resistenza a fulmine e tuono. Lanciare magie di tuono/fulmine (lv1+) infligge danni ad area.' }, { nome: 'Guida della Tempesta', desc: 'Manipola la direzione del vento o ferma la pioggia intorno a sé.' }],
      14: [{ nome: 'Furia della Tempesta', desc: 'Reazione ai danni da mischia per infliggere fulmine al nemico (pari a liv. stregone) e spingerlo via (TS).' }],
      18: [{ nome: 'Anima del Vento', desc: 'Immunità a fulmine/tuono. Volo permanente (18m). Può condividerlo con alleati temporaneamente.' }]
    }
  },
  'Il Celestiale': {
    classe: 'Warlock',
    fonte: 'Xanathar',
    privilegi: {
      1: [{ nome: 'Lista Ampliata', desc: 'Cura ferite, luce, fiamma sacra, ecc.' }, { nome: 'Luce Guaritrice', desc: 'Pool di dadi cura (d6 pari a 1+livello) usabili come azione bonus a distanza.' }],
      6: [{ nome: 'Resilienza Radiante', desc: 'Resistenza radiante. Aggiungi modificatore Carisma ai danni radiosi/fuoco.' }],
      10: [{ nome: 'Protezione Celestiale', desc: 'Dona PF temporanei a fine di riposo a sé e agli alleati (liv warlock + Carisma).' }],
      14: [{ nome: 'Ritorno Fiammeggiante', desc: 'Quando muore o va a 0, si rialza al 50% di PF infliggendo danni radiosi accecanti a chi è vicino.' }]
    }
  },
  'La Lama del Sortilegio': {
    classe: 'Warlock',
    fonte: 'Xanathar',
    privilegi: {
      1: [{ nome: 'Lista Ampliata', desc: 'Scudo, punizione furiosa, ecc.' }, { nome: 'Guerriero del Sortilegio', desc: 'Armature medie/scudi, armi marziali. Usa Carisma per attacco/danni con un\'arma a una mano.' }, { nome: 'Maledizione del Sortilegio', desc: 'Azione bonus per maledire: bonus a danni (+prof), critici su 19-20, cura PF quando muore il maledetto.' }],
      6: [{ nome: 'Spettro Maledetto', desc: 'Uccidendo un umanoide, alza il suo spettro per combattere a fianco.' }],
      10: [{ nome: 'Armatura dei Sortilegi', desc: 'Il nemico maledetto ha il 50% di possibilità di missare il warlock su qualsiasi colpo.' }],
      14: [{ nome: 'Maestro del Sortilegio', desc: 'Può spostare la maledizione su un altro bersaglio se il primo muore.' }]
    }
  }
};
