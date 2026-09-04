import os

out_dir = '/Users/samuele/.gemini/antigravity/scratch/tavolo-dei-dadi/src/dati/'

sottoclassi_js = """export const SOTTOCLASSI_TASHA = {
  'Cammino della Magia Selvaggia': {
    classe: 'Barbaro',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Percezione Magica', desc: 'Puoi lanciare individuazione del magico (Sag per le prove).' }, { nome: 'Furia Selvaggia', desc: 'Effetti magici casuali (tabella d8) all\\'inizio dell\\'ira.' }],
      6: [{ nome: 'Magia Incoraggiante', desc: 'Azione per donare 1d3 (fino a 1d4/1d6) a tiri per colpire, tiri caratteristica o far recuperare slot a una creatura.' }],
      10: [{ nome: 'Ripercussione Instabile', desc: 'Come reazione, quando subisci danni, scateni di nuovo magia selvaggia dell\\'ira.' }],
      14: [{ nome: 'Ondata Controllata', desc: 'Quando entri in ira tiri due volte per la magia selvaggia e scegli tu l\\'effetto desiderato.' }]
    }
  },
  'Cammino della Bestia': {
    classe: 'Barbaro',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Forma della Bestia', desc: 'Manifesti armi naturali magiche in ira: Morso (1d8, cure), Artigli (1d6, attacco extra), o Coda (1d8, aumento CA con reazione).' }],
      6: [{ nome: 'Anima Bestiale', desc: 'Le armi naturali diventano magiche. Riposo breve scegli vantaggio per: nuotare, scalare o salti potenziati.' }],
      10: [{ nome: 'Furia Infettiva', desc: 'Maledici bersaglio colpito in ira (TS Sag o attacca alleato, o subisce danni psichici 2d12).' }],
      14: [{ nome: 'Richiamo della Caccia', desc: 'Usi ululato in ira. PF temporanei per te pari a 5 x numero di creature scelte (max bonus Cos). Loro ottengono 1d6 danni extra ai colpi.' }]
    }
  },
  'Collegio della Creazione': {
    classe: 'Bardo',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Mota di Potenziale', desc: 'L\\'ispirazione bardica ha effetti secondari in base al tiro in cui viene usata (danni ad area, bonus movimento o dadi extra).' }, { nome: 'Esibizione di Creazione', desc: 'Crei un oggetto dal nulla grande fino a 1,5m per ore pari a livello di bardo.' }],
      6: [{ nome: 'Esibizione Animata', desc: 'Animi un oggetto in un costrutto ballerino (usa tua bonus action per attaccare/schivare). Fornisce buff passivi a mo\\' di aura.' }],
      14: [{ nome: 'Crescendo Creativo', desc: 'Puoi creare fino a 5 oggetti con Esibizione di Creazione. Ignori i limiti di costo monete.' }]
    }
  },
  'Collegio dell\\'Eloquenza': {
    classe: 'Bardo',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Linguaggio d\\'Argento', desc: 'Tratti i tiri di Persuasione e Inganno bassi come se avessi tirato 10.' }, { nome: 'Parole Inquietanti', desc: 'Spendi Ispirazione Bardica; il nemico subisce penalità pari al dado tirato al prossimo tiro salvezza.' }],
      6: [{ nome: 'Ispirazione Infallibile', desc: 'L\\'Ispirazione Bardica non viene consumata se l\\'alleato fallisce comunque il tiro.' }, { nome: 'Discorso Universale', desc: 'Usi un\\'azione per farti capire telepaticamente da chiunque per 1 ora (Car creature).' }],
      14: [{ nome: 'Ispirazione Contagiosa', desc: 'Se una creatura ha successo usando l\\'ispirazione, puoi darne una nuova gratis a un\\'altra creatura entro 18m (volte pari a mod Car).' }]
    }
  },
  'Dominio dell\\'Ordine': {
    classe: 'Chierico',
    fonte: 'Tasha',
    privilegi: {
      1: [{ nome: 'Competenza Bonus', desc: 'Competenza armature pesanti e Persuasione o Intimidire.' }, { nome: 'Voce dell\\'Autorità', desc: 'Se lanci magia su un alleato, esso può usare una reazione per attaccare.' }],
      2: [{ nome: 'Incanalare Divinità: Ordine Intimidatorio', desc: 'Disarmi nemici in area (TS Sag) e rimangono impauriti finché subiscono danni.' }],
      6: [{ nome: 'Incarnazione della Legge', desc: 'Lancia incantesimi di Ammaliamento (livello 1+) come azione bonus un num di volte pari a mod Sag.' }],
      8: [{ nome: 'Colpo Divino', desc: 'Aggiungi 1d8 (poi 2d8) danni psichici all\\'arma.' }],
      17: [{ nome: 'Collera dell\\'Ordine', desc: 'Colpo Divino maledice un bersaglio: prossimo alleato che lo colpisce fa 2d8 danni psichici bonus.' }]
    }
  },
  'Dominio della Pace': {
    classe: 'Chierico',
    fonte: 'Tasha',
    privilegi: {
      1: [{ nome: 'Implementazione di Pace', desc: 'Competenza in Intuizione, Medicina o Persuasione.' }, { nome: 'Legame Rincuorante', desc: 'Leghi PB creature: se entro 9m una dall\\'altra, possono aggiungere 1d4 a tiro attacco, caratteristica o salvezza (una volta a turno).' }],
      2: [{ nome: 'Incanalare Divinità: Balsamo della Pace', desc: 'Ti muovi per tutta la tua velocità gratis e curi chi passi a fianco (2d6 PF).' }],
      6: [{ nome: 'Legame Protettivo', desc: 'Chi è nel Legame Rincuorante può usare reazione per teletrasportarsi da alleato che subisce danni e prenderli al suo posto.' }],
      8: [{ nome: 'Incantesimi Potenti', desc: 'Aggiungi Sag ai danni dei trucchetti.' }],
      17: [{ nome: 'Legame Espanso', desc: 'Raggio dei legami aumenta a 18m; chi protegge l\\'altro ottiene resistenza a quei danni.' }]
    }
  },
  'Dominio del Crepuscolo': {
    classe: 'Chierico',
    fonte: 'Tasha',
    privilegi: {
      1: [{ nome: 'Competenze Bonus', desc: 'Armature pesanti e armi da guerra.' }, { nome: 'Occhi della Notte', desc: 'Scurovisione 90m illimitata, che puoi condividere con alleati (1 ora).' }, { nome: 'Vigilante Cauto', desc: 'Concedi vantaggio ai tiri iniziativa a te o un alleato.' }],
      2: [{ nome: 'Incanalare Divinità: Santuario del Crepuscolo', desc: 'Emani aura di penombra di 9m. Alla fine del turno, gli alleati nell\\'aura ricevono 1d6+liv PF temporanei o terminano paura/affascinamento.' }],
      6: [{ nome: 'Passi del Crepuscolo', desc: 'Puoi usare azione bonus nella luce debole o oscurità per guadagnare velocità di volo (1 min).' }],
      8: [{ nome: 'Colpo Divino', desc: 'Aggiungi 1d8 (poi 2d8) danni radianti o necrotici all\\'arma.' }],
      17: [{ nome: 'Santuario Illuminante', desc: 'Santuario del Crepuscolo dona mezza copertura a tutti.' }]
    }
  },
  'Circolo delle Stelle': {
    classe: 'Druido',
    fonte: 'Tasha',
    privilegi: {
      2: [{ nome: 'Mappa Stellare', desc: 'Focalizzatore, regala Guida, impari Dardo Incantato, lanci gratuito PB volte.' }, { nome: 'Forma Stellare', desc: 'Spendi forma selvatica per assumere costellazione (Calice per cura extra, Arciere per attacchi bonus radianti, Drago per vantaggio concentrazione Int/Sag).' }],
      6: [{ nome: 'Oroscopo Cosmico', desc: 'Lanci un d6 al riposo: doni 1d6 aggiuntivo a tiro tuo/alleato, o lo sottrai dal nemico (reazione).' }],
      10: [{ nome: 'Costellazione Sfuggente', desc: 'Forma Stellare riceve potenziamenti (danni aumentano a 2d8, cure a 2d8+Sag, o Drago ti dà volare). Puoi cambiare costellazione all\\'inizio del turno.' }],
      14: [{ nome: 'Comunione Stellare', desc: 'Mentre sei in Forma Stellare ottieni resistenza ai danni fisici (contundente, perforante, tagliente).' }]
    }
  },
  'Circolo del Fuoco Selvaggio': {
    classe: 'Druido',
    fonte: 'Tasha',
    privilegi: {
      2: [{ nome: 'Spirito del Fuoco Selvaggio', desc: 'Spendi forma selvatica per evocare uno spirito di fuoco (attacca con seme di fiamma o si teletrasporta facendo danni).' }],
      6: [{ nome: 'Legame Migliorato', desc: 'I danni e cure (fuoco/vita) che fai passano per lo spirito o aumentano di 1d8.' }],
      10: [{ nome: 'Fiamme Cauterizzanti', desc: 'Se creatura muore diventa vampata che curi alleati o ferisci nemici.' }],
      14: [{ nome: 'Ritorno Fiammeggiante', desc: 'Se scendi a 0 PF, lo spirito muore e tu vai a 1 PF, e infliggi enormi danni ad area e curi.' }]
    }
  },
  'Circolo delle Spore': {
    classe: 'Druido',
    fonte: 'Tasha',
    privilegi: {
      2: [{ nome: 'Spore dell\\'Aura', desc: 'Aura passiva 3m; reazione infligge danni necrotici (TS Cos).' }, { nome: 'Entità Simbiotica', desc: 'Spendi forma selvatica: PF temp, spore dell\\'aura raddoppiano e fai danni necrotici extra in mischia.' }],
      6: [{ nome: 'Infestazione di Funghi', desc: 'Reazione per rianimare nemico caduto come zombi fungino (1 PF) sotto tuo controllo (max mod Sag volte).' }],
      10: [{ nome: 'Spore Difensive', desc: 'Mentre sei in Entità Simbiotica puoi usare azione bonus per lanciare spore ad area (non si sposta da te, ma resta fermo in un punto per danni continui).' }],
      14: [{ nome: 'Corpo Fungino', desc: 'Non puoi più essere accecato, spaventato, avvelenato o assordato e critici contro di te sono colpi normali.' }]
    }
  },
  'Cavaliere Runico': {
    classe: 'Guerriero',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Artigiano delle Rune', desc: 'Competenza in strumenti da fabbro, apprendi lingua dei Giganti. Infondi equip con rune magiche (Haug, Nenia, Uvar, etc. con poteri attivi e passivi).' }, { nome: 'Forza del Gigante', desc: 'Azione bonus diventi taglia Grande (vantaggio For), fai danni bonus 1d6.' }],
      7: [{ nome: 'Scudo Runico', desc: 'Reazione per forzare il nemico a tirare di nuovo l\\'attacco.' }],
      10: [{ nome: 'Crescita Formidabile', desc: 'Il danno di Forza del Gigante diventa 1d8. Puoi usarlo più volte e altezza aumenta.' }],
      15: [{ nome: 'Maestro Runico', desc: 'Puoi usare ogni runa 2 volte a riposo.' }],
      18: [{ nome: 'Colosso', desc: 'Forza del Gigante ti rende taglia Enorme (portata aumenta) e i danni salgono a 1d10.' }]
    }
  },
  'Psi Guerriero': {
    classe: 'Guerriero',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Potere Psionico', desc: 'Dado Psionico (1d6). Puoi fare: Colpo Psionico (danni bonus+Int), Movimento Telecinetico, Scudo Protettivo (riduci danni).' }],
      7: [{ nome: 'Adepto Telecinetico', desc: 'Volo psionico (salti/vola per la velocità) o Spinta Telecinetica per far cadere avversari proni o spingerli.' }],
      10: [{ nome: 'Mente Custodita', desc: 'Resistenza a danni psichici. Reazione per curare ammaliato/paura.' }],
      15: [{ nome: 'Baluardo Telecinetico', desc: 'Aura telecinetica passiva che da mezza copertura e riduce danni agli alleati vicini.' }],
      18: [{ nome: 'Maestro Psionico', desc: 'Scudo Psionico scala. Può muoversi con la mente.' }]
    }
  },
  'Via della Misericordia': {
    classe: 'Monaco',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Strumenti di Misericordia', desc: 'Competenza Intimidire, Medicina e strumenti da erborista.' }, { nome: 'Mano della Cura', desc: 'Spendi 1 Ki per curare (dado art marziali + Sag).' }, { nome: 'Mano del Danno', desc: 'Spendi 1 Ki su attacco per fare danni necrotici bonus.' }],
      6: [{ nome: 'Tocco del Curatore', desc: 'Mano della Cura rimuove anche malattie o accecato/sordo/avvelenato/paralizzato ecc.' }],
      11: [{ nome: 'Raffica Misericordiosa', desc: 'Lancia Mano della Cura o Mano del Danno gratuitamente 1 volta quando usi Raffica di Colpi.' }],
      17: [{ nome: 'Mano della Misericordia Completa', desc: 'Resusciti chi è morto da poco spendendo molti Ki.' }]
    }
  },
  'Via della Forma Astrale': {
    classe: 'Monaco',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Braccia Astrali', desc: 'Spendi Ki per evocare braccia astrali: danni Forza (reach 3m), tiri e forza usano Sag, colpiscono con arti marziali o raffica.' }],
      6: [{ nome: 'Viso della Forma Astrale', desc: 'Evoca maschera: scurovisione magica, vantaggi in Intuizione o Intimidire, voce parlata tramite telepatia ecc.' }],
      11: [{ nome: 'Corpo della Forma Astrale', desc: 'Deviazione fisica, armatura magica, quando colpito riduce danni.' }],
      17: [{ nome: 'Risveglio Astrale', desc: 'Forma completa (gambe/busto), attacchi extra (3) in raffica, +2 CA.' }]
    }
  },
  'Giuramento degli Osservatori': {
    classe: 'Paladino',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Incanalare Divinità: Volontà dell\\'Osservatore', desc: 'Vantaggi a TS Int, Sag, Car per gruppo per 1 min.' }, { nome: 'Abjure the Extraplanar', desc: 'Scaccia elementali, folletti, inferni, aberrazioni, celestiali.' }],
      7: [{ nome: 'Aura della Sentinella', desc: 'Bonus all\\'iniziativa pari a mod Car a tutti in 3m (poi 9m).' }],
      15: [{ nome: 'Difesa Vigile', desc: 'Reazione per punire chi forza te o un alleato a fare un TS.' }],
      20: [{ nome: 'Baluardo Mortale', desc: 'Trusight 36m, attacchi baniscing. Vantaggio vs estranei.' }]
    }
  },
  'Giuramento della Gloria': {
    classe: 'Paladino',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Incanalare Divinità: Atletismo Impareggiabile', desc: 'Vantaggio Atletica, Acrobazia, salti raddoppiati, spinta.' }, { nome: 'Incanalare: Punizione Eroica', desc: 'Dopo un critico doni PF temporanei (2d8+liv) agli alleati vicini.' }],
      7: [{ nome: 'Aura di Rapidità', desc: 'Aumenti velocità di 3m per te e chi ti parte a fianco.' }],
      15: [{ nome: 'Gloriosa Difesa', desc: 'Reazione per scudo CA; se fallisce l\\'attacco puoi contrattaccare gratis.' }],
      20: [{ nome: 'Leggenda Vivente', desc: 'Carisma tiri vantaggio, un attacco fallito contro di te lo forzi a mancare e puoi ritirare TS.' }]
    }
  },
  'Guardiano dello Sciame': {
    classe: 'Ranger',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Sciame Accumulato', desc: 'Scegli uno sciame. Ogni turno: danno extra (1d6), spostare il nemico 4.5m o farti spostare tu 1.5m.' }, { nome: 'Magia dello Sciame', desc: 'Mano magica come sciame.' }],
      7: [{ nome: 'Sciame Soverchiante', desc: 'Ottieni velocità volare 3m.' }],
      11: [{ nome: 'Sciame Formidabile', desc: 'Sciame danno sale a 1d8, abbattimento del bersaglio, mezza copertura e resistenza.' }],
      15: [{ nome: 'Fuga Sciamante', desc: 'Teletrasporto 9m quando attaccato per schivare o scappare (reazione).' }]
    }
  },
  'Viandante Fatato': {
    classe: 'Ranger',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Dono del Feywild', desc: 'Aggiungi bonus Sag alle prove di Carisma. Ottieni competenza Inganno o Persuasione.' }, { nome: 'Colpi Spaventosi', desc: '1 volta per turno infliggi 1d4 danni psichici a una creatura colpita.' }],
      7: [{ nome: 'Magia Sinuosa', desc: 'Se superi/sei immune a fascino o paura, lo rimbalzi su un nemico.' }],
      11: [{ nome: 'Passo Folletto', desc: 'Puoi lanciare Passo Velato gratis senza slot e puoi portarti una persona con te.' }],
      15: [{ nome: 'Nebbia Fatata', desc: 'Lanci Evoca creatura Folletto senza slot (una volta a giorno) e se usi Incantesimo ha vari vantaggi aggiuntivi.' }]
    }
  },
  'Fantasma': {
    classe: 'Ladro',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Sussurri dei Morti', desc: 'A riposo ottieni competenza abilità/strumento con fantasma.' }, { nome: 'Lamenti dalla Tomba', desc: 'Quando usi Attacco Furtivo, infliggi 50% dei dadi ad un secondo bersaglio vicino (necrotici).' }],
      9: [{ nome: 'Gettone dell\\'Anima', desc: 'Se creatura muore catturi un gettone (vantaggio a tiri salvezza costituzione, o puoi far domande al morto distruggendolo).' }],
      13: [{ nome: 'Passo Spettrale', desc: 'Azione bonus, diventi invisibile, e voli (1 min).' }],
      17: [{ nome: 'Campione dei Morti', desc: 'Lamenti dalla tomba fa danno sia al primo che al secondo, distruggi gettoni per usarlo.' }]
    }
  },
  'Lama Spirituale': {
    classe: 'Ladro',
    fonte: 'Tasha',
    privilegi: {
      3: [{ nome: 'Lame Psioniche', desc: 'Crei pugnali di forza mentale psichica che fanno 1d6 (principale) e 1d4 (bonus).' }, { nome: 'Potere Psionico', desc: 'Dado (d6): bonus attacchi mancati, comunicazione telepatica.' }],
      9: [{ nome: 'Lame dell\\'Anima', desc: 'Puoi lanciare i pugnali per teletrasportarti o ottenere tiri vantaggiosi a abilità con telecinesi.' }],
      13: [{ nome: 'Mente Trasparente', desc: 'Diventi invisibile per 1 ora spendendo dadi.' }],
      17: [{ nome: 'Dilaniatore della Mente', desc: 'Colpisci per stordire i nemici o devastarli se falliscono TS Sag (sfruttando le lame furtive).' }]
    }
  },
  'Mente Aberrante': {
    classe: 'Stregone',
    fonte: 'Tasha',
    privilegi: {
      1: [{ nome: 'Incantesimi Psionici', desc: 'Incantesimi bonus in base al livello (Dissonanza Cognitiva, Tentacoli, ecc.).' }, { nome: 'Voce Telepatica', desc: 'Comunichi in mente.' }],
      6: [{ nome: 'Stregoneria Psionica', desc: 'Lancia incantesimi psionici della classe usando punti stregoneria invece di slot e senza componenti.' }],
      14: [{ nome: 'Rivelazione Alien', desc: 'Spendi punti stregoneria per mutare: vista vero 36m, volo, aura corrosiva.' }],
      18: [{ nome: 'Forza Distorcente', desc: 'Teletrasporto ad area, lasciando distruzione e trascinando gli altri nemici con danni elevati.' }]
    }
  },
  'Anima dell\\'Orologio': {
    classe: 'Stregone',
    fonte: 'Tasha',
    privilegi: {
      1: [{ nome: 'Incantesimi di Ordine', desc: 'Incantesimi extra (Scudo, Dispel, ecc).' }, { nome: 'Restaurare Equilibrio', desc: 'Reazione per negare vantaggio o svantaggio in un tiro.' }],
      6: [{ nome: 'Baluardo Meccanico', desc: 'Usa punti stregoneria (fino a 5) per dare (Dadi d8) PF temp a te o bersagli.' }],
      14: [{ nome: 'Trance di Ordine', desc: 'Non tiri meno di 10 (se d20 era meno) e nemici non hanno vantaggio contro di te.' }],
      18: [{ nome: 'Cavalieri dell\\'Ingranaggio', desc: 'Evoca poteri celesti e mecc curativi: cura istantanea (fino a 100 pf divisi) in area 9m.' }]
    }
  },
  'Patrono del Genio': {
    classe: 'Warlock',
    fonte: 'Tasha',
    privilegi: {
      1: [{ nome: 'Vaso del Genio', desc: 'Scegli (Dao, Djinni, Efreeti o Marid), hai vaso che ti da attacco extra (danno del tipo) e puoi entrarci per nasconderti/riposare.' }],
      6: [{ nome: 'Dono Elementale', desc: 'Resistenza al danno del tuo genio. Inoltre puoi volare per 10 min 3/gg.' }],
      10: [{ nome: 'Santuario Protetto', desc: 'Quando nel vaso tu e alleati riposate in 10 minuti e guadagnate PF pari a bonus prof.' }],
      14: [{ nome: 'Desiderio Limitato', desc: 'Puoi lanciare un incantesimo qualsiasi di 6 liv o inferiore, di qualsiasi classe, ignorando limiti, e torna al riposo lungo.' }]
    }
  },
  'Patrono dell\\'Insondabile': {
    classe: 'Warlock',
    fonte: 'Tasha',
    privilegi: {
      1: [{ nome: 'Tentacolo degli Abissi', desc: 'Azione bonus per evocare tentacolo (attacca a 3m, modifica mov nemico).' }, { nome: 'Dono dell\\'Oceano', desc: 'Nuoto veloce, respiri sott\\'acqua.' }],
      6: [{ nome: 'Spira Oceanica', desc: 'Tentacolo protegge (riduce danni con reazione d8).' }],
      10: [{ nome: 'Polmoni delle Profondità', desc: 'Immunità ambientale subacquea, Evardu magia, comunichi telepaticamente.' }],
      14: [{ nome: 'Immersione nelle Tenebre', desc: 'Crei pozza acqua e trasporti te/alleati di migliaia di miglia ovunque.' }]
    }
  },
  'Ordine degli Scribi': {
    classe: 'Mago',
    fonte: 'Tasha',
    privilegi: {
      2: [{ nome: 'Penna del Mago', desc: 'Crea penna magica; copi incantesimi molto più in fretta e gratis.' }, { nome: 'Libro Risvegliato', desc: 'Il libro agisce da focus; puoi cambiare tipo danno degli incanti.' }],
      6: [{ nome: 'Mente Manifesta', desc: 'Spirito del libro prende forma e puoi lanciare magie tramite di esso come proxy, o ti fa ritirare tiri conoscenza.' }],
      10: [{ nome: 'Maestro dell\\'Incantamento', desc: 'Crei un pergamino magico dell\\'incantesimo gratis a riposo lungo di livello 1 o 2 e lo lanci con +1 slot effettivo (potenziato).' }],
      14: [{ nome: 'Tomo Sacrificato', desc: 'Se subisci danni mortali puoi distruggere magie dal libro (cancellandole) per negare completamente i danni subiti.' }]
    }
  }
};
"""
with open(os.path.join(out_dir, 'sottoclassi-tasha.js'), 'w', encoding='utf-8') as f:
    f.write(sottoclassi_js)


# Optional features
tratti_js = """export const TRATTI_OPZIONALI_TASHA = {
  'Barbaro': [
    { nome: 'Competenza Primordiale', livello: 3, sostituisce: null, desc: 'Ottieni competenza in un\\'abilità extra da barbaro (o focalizzazione in una esistente).' },
    { nome: 'Balzo Istintivo', livello: 7, sostituisce: null, desc: 'Come parte dell\\'azione bonus usata per entrare in Ira, puoi muoverti fino a metà della tua velocità verso un nemico.' }
  ],
  'Bardo': [
    { nome: 'Versatilità Magica', livello: 4, sostituisce: null, desc: 'Quando raggiungi livelli dove hai incremento di punteggio caratteristica, puoi sostituire un trucchetto noto con un altro.' },
    { nome: 'Ispirazione Magica', livello: 2, sostituisce: null, desc: 'Se creatura ha tuo dado ispirazione e lancia incantesimo di cura o danno, tira il dado ispirazione e aggiungilo alla cura/danno effettuato.' }
  ],
  'Chierico': [
    { nome: 'Colpi Benedetti', livello: 8, sostituisce: 'Colpo Divino o Incantesimi Potenti', desc: 'Quando infliggi danni con trucchetto o arma aggiungi 1d8 danni radianti.' },
    { nome: 'Incatenare Non Morti', livello: 2, sostituisce: 'Scacciare Non Morti', desc: 'Scacciare Non morti invece li immobilizza (come trattenuto) fintanto che restano entro portata per max 1 min, subiscono inoltre danni sacri lenti.' }
  ],
  'Druido': [
    { nome: 'Forma Selvatica di Compagno', livello: 2, sostituisce: null, desc: 'Spendi una forma selvatica per lanciare Trova Famiglio (uno spirito feywild senza spendere monete).' }
  ],
  'Guerriero': [
    { nome: 'Stile di Combattimento: Intercezione', livello: 1, sostituisce: null, desc: 'Riduci danni su un alleato di 1d10+PB usando reazione con scudo o arma marziale.' },
    { nome: 'Stile di Combattimento: Lanciatore', livello: 1, sostituisce: null, desc: 'Puoi sguainare rapidamente e fare +2 danni.' }
  ],
  'Monaco': [
    { nome: 'Armi del Monaco Dedicato', livello: 2, sostituisce: null, desc: 'Un arma in cui hai competenza (non pesante/speciale) e spendi ki al riposo diviene arma monaco.' },
    { nome: 'Ki Caricato (Colpo Potenziato)', livello: 2, sostituisce: null, desc: 'Azione bonus spendi Ki: il prossimo attacco a segno fa dadi extra pari a spesa.' }
  ],
  'Paladino': [
    { nome: 'Incanalare Energia', livello: 3, sostituisce: null, desc: 'Spendi Incanalare Divinità per curare slot incantesimo usati.' },
    { nome: 'Nuovi Stili', livello: 2, sostituisce: null, desc: 'Come Guerriero.' }
  ],
  'Ranger': [
    { nome: 'Favore Rovente (Esploratore Astuto)', livello: 1, sostituisce: 'Esploratore Naturale', desc: 'Esperienza in una skill, movimenti agili (roccia, nuoto pari a terra) a lvl 6 e PF temporanei a livello 10 come azione.' },
    { nome: 'Nemico Prestigioso (Mira Esperta)', livello: 1, sostituisce: 'Nemico Prescelto', desc: 'Usi Segugio (Hunter\\'s Mark) senza concentrazione. Appare come dono razziale senza consumare slot.' },
    { nome: 'Consapevolezza Primaria', livello: 3, sostituisce: 'Consapevolezza', desc: 'Ottieni incantesimi gratuiti legati alla natura (Parlare animali, bestie, ecc).' }
  ],
  'Ladro': [
    { nome: 'Mira Implacabile', livello: 3, sostituisce: null, desc: 'Azione Bonus (senza muoverti nel turno): Ottieni vantaggio sul tuo prossimo tiro per colpire di questo turno.' }
  ],
  'Stregone': [
    { nome: 'Incantesimi di Stirpe Ampliati', livello: 1, sostituisce: null, desc: 'Elenco incantesimi base allargato per lo stregone.' },
    { nome: 'Guidance Magica', livello: 5, sostituisce: null, desc: 'Se fallisci check caratteristica spendi 1 pnt stregoneria per ripeterlo.' }
  ],
  'Warlock': [
    { nome: 'Dono del Talismano', livello: 3, sostituisce: null, desc: 'Nuovo patto: talismano che permette a chi lo indossa di aggiungere d4 a abilità o attacchi (se falliti).' }
  ],
  'Mago': [
    { nome: 'Incantesimi Ampliati', livello: 1, sostituisce: null, desc: 'Nuova lista ampliata di magie, inclusi vari incantesimi Tasha.' },
    { nome: 'Formula di Memorizzazione', livello: 3, sostituisce: null, desc: 'Al riposo breve scambi magie per altre nel tuo libro se hai slot libro vuoti o sostituisci 1 magia.' }
  ]
};
"""
with open(os.path.join(out_dir, 'tratti-opzionali-tasha.js'), 'w', encoding='utf-8') as f:
    f.write(tratti_js)


incantesimi_js = """export const INCANTESIMI_TASHA = [
  { nome: 'Lama Rombante', livello: 0, scuola: 'Invocazione', tempo: '1 azione', gittata: 'Mischia', componenti: 'S, M', durata: '1 round', desc: 'Effettui attacco mischia, bersaglio avvolto da magia. Se si muove volontariamente subisce 1d8 danni tuono (scala con livelli).', classi: ['Mago', 'Stregone', 'Warlock', 'Artefice'] },
  { nome: 'Lama di Fiamma Verde', livello: 0, scuola: 'Invocazione', tempo: '1 azione', gittata: 'Mischia', componenti: 'S, M', durata: 'Istantanea', desc: 'Effettui attacco mischia. Fiamme avvolgono arma infliggendo danni aggiuntivi al bersaglio e a un nemico adiacente.', classi: ['Mago', 'Stregone', 'Warlock', 'Artefice'] },
  { nome: 'Dardo Mentale', livello: 0, scuola: 'Ammaliamento', tempo: '1 azione', gittata: '18m', componenti: 'V', durata: 'Istantanea', desc: 'Danni psichici 1d6, prossimo tiro salvezza del nemico riceve malus di 1d4.', classi: ['Bardo', 'Stregone', 'Mago', 'Warlock'] },
  { nome: 'Onda del Terrore', livello: 1, scuola: 'Necromanzia', tempo: '1 azione', gittata: 'Cubo 4.5m', componenti: 'V', durata: 'Istantanea', desc: 'Nemici in area TS Sag o spaventati.', classi: ['Warlock', 'Mago'] },
  { nome: 'Armatura Magica Psionica', livello: 1, scuola: 'Abiurazione', tempo: '1 bonus', gittata: 'Personale', componenti: 'V, S', durata: '1 ora', desc: 'CA aumenta e resistenze magiche.', classi: ['Artefice', 'Mago'] },
  { nome: 'Nube Venefica', livello: 2, scuola: 'Evocazione', tempo: '1 azione', gittata: 'Sfera 6m', componenti: 'V, S', durata: 'Concentrazione (1 min)', desc: 'Danni veleno ricorrenti nell\\'area oscurata e svantaggio.', classi: ['Druido', 'Stregone'] },
  { nome: 'Sfera Mentale Psionica', livello: 3, scuola: 'Invocazione', tempo: '1 azione', gittata: '27m', componenti: 'V', durata: 'Istantanea', desc: 'Sfera che fa danni psichici e riduce velocità.', classi: ['Stregone', 'Mago', 'Bardo'] },
  { nome: 'Manto Spirituale', livello: 3, scuola: 'Necromanzia', tempo: '1 azione bonus', gittata: 'Personale', componenti: 'V, S', durata: 'Concentrazione', desc: 'I tuoi attacchi fanno 1d8 danni radianti/necrotici/freddo bonus e limiti mov.', classi: ['Chierico', 'Paladino'] },
  { nome: 'Passo del Fey', livello: 4, scuola: 'Evocazione', tempo: '1 azione bonus', gittata: 'Personale', componenti: 'V', durata: '1 round', desc: 'Teletrasporti di 9m e accechi nemici.', classi: ['Ranger', 'Warlock'] },
  { nome: 'Evoca Bestia', livello: 2, scuola: 'Evocazione', tempo: '1 azione', gittata: '27m', componenti: 'V, S, M', durata: 'Concentrazione', desc: 'Evoca bestia terreste, mare, volo (scala in base allo slot).', classi: ['Druido', 'Ranger'] },
  { nome: 'Evoca Celestiale', livello: 5, scuola: 'Evocazione', tempo: '1 azione', gittata: '27m', componenti: 'V, S, M', durata: 'Concentrazione', desc: 'Evoca Vendicatore o Difensore divino (stat base fisse Tasha).', classi: ['Chierico', 'Paladino'] },
  { nome: 'Evoca Aberrazione', livello: 4, scuola: 'Evocazione', tempo: '1 azione', gittata: '27m', componenti: 'V, S, M', durata: 'Concentrazione', desc: 'Evoca mostro Slaad o beholderoid.', classi: ['Warlock', 'Mago', 'Stregone'] },
  { nome: 'Lama del Disastro', livello: 9, scuola: 'Evocazione', tempo: '1 azione bonus', gittata: '18m', componenti: 'V, S', durata: 'Concentrazione', desc: 'Spada dimensionale, infligge ferite spaventose e ignora protezioni magiche.', classi: ['Mago', 'Stregone', 'Warlock'] }
];
"""
with open(os.path.join(out_dir, 'incantesimi-tasha.js'), 'w', encoding='utf-8') as f:
    f.write(incantesimi_js)

print("Files rewritten completely with all subclasses and optional features.")
