// Dati di gioco D&D 5e estratti da App.jsx (costanti pure, nessuna logica).
// Spostati qui per ridurre la dimensione di App.jsx e i conflitti di merge.

export const NOMI_CLASSI = [
  'Barbaro', 'Bardo', 'Chierico', 'Druido', 'Guerriero', 'Ladro',
  'Mago', 'Monaco', 'Paladino', 'Ranger', 'Stregone', 'Warlock',
];
export const BACKGROUND_5E = [
  'Accolito', 'Artigiano', 'Ciarlatano', 'Contadino', 'Criminale', 'Eremita',
  'Guardia', 'Guida', 'Intrattenitore', 'Marinaio', 'Mercante', 'Nobile',
  'Saggio', 'Scriba', 'Soldato', 'Viandante',
];
export const TAGLIE_5E = ['Minuscola', 'Piccola', 'Media', 'Grande', 'Enorme', 'Mastodontica'];
export const ALLINEAMENTI_5E = [
  'Legale Buono', 'Neutrale Buono', 'Caotico Buono',
  'Legale Neutrale', 'Neutrale', 'Caotico Neutrale',
  'Legale Malvagio', 'Neutrale Malvagio', 'Caotico Malvagio',
];
export const SOTTOCLASSI_5E = {
  barbaro: ['Berserker', 'Cuore Selvaggio', 'Albero del Mondo', 'Zelota'],
  bardo: ['Collegio della Danza', 'Collegio del Fascino', 'Collegio della Sapienza', 'Collegio del Valore'],
  chierico: ['Dominio della Vita', 'Dominio della Luce', 'Dominio dell’Inganno', 'Dominio della Guerra'],
  druido: ['Circolo della Terra', 'Circolo della Luna', 'Circolo del Mare', 'Circolo delle Stelle'],
  guerriero: ['Maestro di Battaglia', 'Campione', 'Cavaliere Mistico', 'Guerriero Psionico'],
  ladro: ['Mistificatore Arcano', 'Assassino', 'Lama Spirituale', 'Furfante'],
  mago: ['Abiuratore', 'Divinatore', 'Invocatore', 'Illusionista'],
  monaco: ['Guerriero della Misericordia', 'Guerriero dell’Ombra', 'Guerriero degli Elementi', 'Guerriero della Mano Aperta'],
  paladino: ['Giuramento di Devozione', 'Giuramento di Gloria', 'Giuramento degli Antichi', 'Giuramento di Vendetta'],
  ranger: ['Signore delle Bestie', 'Viandante Fatato', 'Cacciatore delle Tenebre', 'Cacciatore'],
  stregone: ['Stregoneria Aberrante', 'Stregoneria Meccanica', 'Stregoneria Draconica', 'Stregoneria della Magia Selvaggia'],
  warlock: ['Patrono Signore Fatato', 'Patrono Celestiale', 'Patrono Immondo', 'Patrono Grande Antico'],
};
export const INCANTESIMI_CLASSE = {
  stregone: {
    0: ['Dardo Infuocato', 'Raggio di Gelo', 'Morsa del Gelo', 'Mano Magica', 'Luce', 'Messaggio', 'Prestidigitazione', 'Illusione Minore', 'Spruzzo di Veleno', 'Tocco Folgorante', 'Luci Danzanti', 'Interdizione alle Lame', 'Vampa'],
    1: ['Dardo Incantato', 'Scudo', 'Armatura Magica', 'Onda Tonante', 'Mani Brucianti', 'Sfera Cromatica', 'Sonno', 'Ammaliare Persone', 'Caduta Morbida', 'Individuazione del Magico', 'Nube di Nebbia', 'Camuffarsi', 'Immagine Silenziosa', 'Fulmine Stregato'],
    2: ['Immagine Speculare', 'Passo Velato', 'Frantumare', 'Raggio Rovente', 'Invisibilità', 'Blocca Persone', 'Oscurità', 'Scurovisione', 'Levitazione', 'Ragnatela', 'Suggestione', 'Offuscamento', 'Vedere Invisibilità'],
    3: ['Palla di Fuoco', 'Controincantesimo', 'Fulmine', 'Volare', 'Velocità', 'Lentezza', 'Dissolvi Magie', 'Nube Mefitica', 'Paura'],
    4: ['Invisibilità Superiore', 'Porta Dimensionale', 'Tempesta di Ghiaccio', 'Scudo di Fuoco', 'Polimorfia', 'Confusione'],
    5: ['Cono di Freddo', 'Blocca Mostri', 'Dominare Persone', 'Telecinesi', 'Muro di Pietra'],
  },
  mago: {
    0: ['Dardo Infuocato', 'Raggio di Gelo', 'Morsa del Gelo', 'Mano Magica', 'Luce', 'Messaggio', 'Prestidigitazione', 'Illusione Minore', 'Zampata Acida', 'Tocco Folgorante', 'Colpo Sicuro'],
    1: ['Dardo Incantato', 'Scudo', 'Armatura Magica', 'Onda Tonante', 'Mani Brucianti', 'Sonno', 'Individuazione del Magico', 'Comprendere Linguaggi', 'Identificare', 'Ritirata Veloce', 'Falsa Vita', 'Servitore Invisibile', 'Sfera Cromatica'],
    2: ['Immagine Speculare', 'Passo Velato', 'Frantumare', 'Raggio Rovente', 'Invisibilità', 'Blocca Persone', 'Ragnatela', 'Levitazione', 'Vedere Invisibilità', 'Bussare', 'Individuazione dei Pensieri'],
    3: ['Palla di Fuoco', 'Controincantesimo', 'Fulmine', 'Volare', 'Velocità', 'Dissolvi Magie', 'Nube Mefitica', 'Animare Morti', 'Dardo Incantato Superiore'],
    4: ['Invisibilità Superiore', 'Porta Dimensionale', 'Tempesta di Ghiaccio', 'Scudo di Fuoco', 'Polimorfia', 'Pelle di Pietra', 'Muro di Fuoco'],
    5: ['Cono di Freddo', 'Blocca Mostri', 'Telecinesi', 'Muro di Forza', 'Evocare Elementale'],
  },
  chierico: {
    0: ['Fiamma Sacra', 'Guida', 'Luce', 'Aggiustare', 'Resistenza', 'Stabilizzare', 'Taumaturgia', 'Rintocco Funebre'],
    1: ['Benedizione', 'Cura Ferite', 'Dardo Guida', 'Parola di Guarigione', 'Comando', 'Individuazione del Magico', 'Infliggere Ferite', 'Protezione dal Male e dal Bene', 'Santuario', 'Scudo della Fede', 'Rovina'],
    2: ['Aiuto', 'Ristorare Inferiore', 'Arma Spirituale', 'Blocca Persone', 'Silenzio', 'Preghiera di Guarigione', 'Presagio', 'Legame di Protezione'],
    3: ['Dissolvi Magie', 'Parola di Guarigione di Massa', 'Rivitalizzare', 'Guardiani Spirituali', 'Faro di Speranza', 'Rimuovi Maledizione', 'Luce del Giorno'],
    4: ['Barriera contro la Morte', 'Guardiano della Fede', 'Esilio', 'Libertà di Movimento'],
    5: ['Colonna di Fuoco', 'Ristorare Superiore', 'Cura Ferite di Massa', 'Rianimare Morti'],
  },
  druido: {
    0: ['Arte Druidica', 'Guida', 'Aggiustare', 'Spruzzo di Veleno', 'Produrre Fiamma', 'Resistenza', 'Bastone Incantato', 'Frusta di Spine'],
    1: ['Cura Ferite', 'Parola di Guarigione', 'Intralciare', 'Fuoco Fatato', 'Bacche Nutrienti', 'Parlare con gli Animali', 'Onda Tonante', 'Nube di Nebbia', 'Passo Lungo'],
    2: ['Pelle Coriacea', 'Sfera Infuocata', 'Raggio di Luna', 'Metallo Rovente', 'Passo Senza Tracce', 'Crescita di Spine', 'Ristorare Inferiore', 'Blocca Persone'],
    3: ['Chiamare il Fulmine', 'Evocare Animali', 'Dissolvi Magie', 'Crescita Vegetale', 'Tempesta di Nevischio', 'Respirare sott’acqua', 'Muro di Vento'],
    4: ['Polimorfia', 'Tempesta di Ghiaccio', 'Pelle di Pietra', 'Muro di Fuoco', 'Libertà di Movimento'],
    5: ['Ridestare', 'Comunione con la Natura', 'Piaga di Insetti', 'Passo Arboreo', 'Cura Ferite di Massa'],
  },
  bardo: {
    0: ['Derisione Crudele', 'Luci Danzanti', 'Luce', 'Mano Magica', 'Aggiustare', 'Messaggio', 'Illusione Minore', 'Prestidigitazione', 'Colpo Sicuro'],
    1: ['Cura Ferite', 'Parola di Guarigione', 'Ammaliare Persone', 'Camuffarsi', 'Fuoco Fatato', 'Caduta Morbida', 'Eroismo', 'Sonno', 'Onda Tonante', 'Sussurri Dissonanti', 'Individuazione del Magico'],
    2: ['Invisibilità', 'Suggestione', 'Blocca Persone', 'Frantumare', 'Metallo Rovente', 'Potenziare Caratteristica', 'Ristorare Inferiore', 'Silenzio', 'Vedere Invisibilità'],
    3: ['Dissolvi Magie', 'Schema Ipnotico', 'Paura', 'Immagine Maggiore', 'Linguaggi', 'Infliggere Maledizione', 'Messaggio a Distanza'],
    4: ['Porta Dimensionale', 'Polimorfia', 'Libertà di Movimento', 'Invisibilità Superiore', 'Confusione'],
    5: ['Ristorare Superiore', 'Cura Ferite di Massa', 'Blocca Mostri', 'Dominare Persone', 'Sviare'],
  },
  warlock: {
    0: ['Raffica Occulta', 'Morsa del Gelo', 'Mano Magica', 'Illusione Minore', 'Spruzzo di Veleno', 'Prestidigitazione', 'Colpo Sicuro'],
    1: ['Malocchio', 'Armatura di Agathys', 'Braccia di Hadar', 'Ammaliare Persone', 'Comprendere Linguaggi', 'Ritirata Veloce', 'Protezione dal Male e dal Bene', 'Fulmine Stregato', 'Rappresaglia Infernale', 'Servitore Invisibile'],
    2: ['Invisibilità', 'Immagine Speculare', 'Passo Velato', 'Blocca Persone', 'Oscurità', 'Raggio dell’Indebolimento', 'Corona della Follia', 'Suggestione'],
    3: ['Controincantesimo', 'Dissolvi Magie', 'Volare', 'Paura', 'Schema Ipnotico', 'Fame di Hadar', 'Tocco Vampirico'],
    4: ['Esilio', 'Porta Dimensionale', 'Malanno', 'Terreno Allucinatorio'],
    5: ['Blocca Mostri', 'Scrutare', 'Passo Lontano'],
  },
  paladino: {
    1: ['Benedizione', 'Cura Ferite', 'Comando', 'Individuazione del Magico', 'Favore Divino', 'Eroismo', 'Protezione dal Male e dal Bene', 'Scudo della Fede', 'Colpo Ardente', 'Colpo Tonante', 'Colpo Irato'],
    2: ['Aiuto', 'Ristorare Inferiore', 'Trovare Destriero', 'Arma Magica', 'Colpo Marchiante', 'Protezione dal Veleno', 'Zona di Verità'],
    3: ['Dissolvi Magie', 'Rivitalizzare', 'Aura di Vitalità', 'Colpo Accecante', 'Manto del Crociato', 'Arma Elementale'],
    4: ['Esilio', 'Barriera contro la Morte', 'Aura di Vita', 'Colpo Sconvolgente'],
    5: ['Cerchio di Potere', 'Onda Distruttrice'],
  },
  ranger: {
    1: ['Cura Ferite', 'Marchio del Cacciatore', 'Colpo Intrappolante', 'Nube di Nebbia', 'Bacche Nutrienti', 'Pioggia di Spine', 'Passo Lungo', 'Parlare con gli Animali'],
    2: ['Ristorare Inferiore', 'Passo Senza Tracce', 'Crescita di Spine', 'Pelle Coriacea', 'Silenzio', 'Cordone di Frecce', 'Localizzare Oggetto'],
    3: ['Evocare Animali', 'Freccia Fulminante', 'Crescita Vegetale', 'Respirare sott’acqua', 'Muro di Vento'],
    4: ['Libertà di Movimento', 'Pelle di Pietra', 'Vite Afferrante'],
    5: ['Faretra Veloce', 'Passo Arboreo'],
  },
};
export const TRUCCHETTI_NOTI = {
  bardo: [2, 3, 4], chierico: [3, 4, 5], druido: [2, 3, 4],
  mago: [3, 4, 5], stregone: [4, 5, 6], warlock: [2, 3, 4],
};
export const INC_MAX_2024 = {
  bardo:    [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 19, 20, 21, 22, 22],
  chierico: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 20, 21, 22, 23, 24],
  druido:   [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 20, 22, 23, 24, 25],
  mago:     [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25],
  stregone: [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 19, 20, 21, 22, 22],
  warlock:  [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  paladino: [2, 3, 4, 5, 6, 6, 7, 7, 8, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15],
  ranger:   [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15],
};
export const INC_MAX_2014_NOTI = {
  stregone: [2, 3, 4, 5, 6, 7, 7, 8, 9, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  bardo:    [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
  warlock:  [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  ranger:   [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
};
export const SLOT_FULL_CASTER = {
  1: [2], 2: [3], 3: [4, 2], 4: [4, 3], 5: [4, 3, 2], 6: [4, 3, 3], 7: [4, 3, 3, 1], 8: [4, 3, 3, 2],
  9: [4, 3, 3, 3, 1], 10: [4, 3, 3, 3, 2], 11: [4, 3, 3, 3, 2, 1], 12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1], 14: [4, 3, 3, 3, 2, 1, 1], 15: [4, 3, 3, 3, 2, 1, 1, 1], 16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1], 19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};
export const SLOT_MEZZO_CASTER = {
  1: [], 2: [2], 3: [3], 4: [3], 5: [4, 2], 6: [4, 2], 7: [4, 3], 8: [4, 3], 9: [4, 3, 2], 10: [4, 3, 2],
  11: [4, 3, 3], 12: [4, 3, 3], 13: [4, 3, 3, 1], 14: [4, 3, 3, 1], 15: [4, 3, 3, 2], 16: [4, 3, 3, 2],
  17: [4, 3, 3, 3, 1], 18: [4, 3, 3, 3, 1], 19: [4, 3, 3, 3, 2], 20: [4, 3, 3, 3, 2],
};
export const CLASSI_FULL_CASTER = ['bardo', 'chierico', 'druido', 'mago', 'stregone'];
export const CLASSI_MEZZO_CASTER = ['paladino', 'ranger'];
export const DANNI_5E = [
  'Acido', 'Contundente', 'Freddo', 'Fuoco', 'Fulmine', 'Necrotico',
  'Perforante', 'Psichico', 'Radiante', 'Tagliente', 'Tuono', 'Veleno',
];
export const SENSI_5E = [
  'Scurovisione 18 m', 'Scurovisione 36 m', 'Scurovisione 24 m',
  'Percezione cieca 3 m', 'Percezione cieca 9 m',
  'Percezione tremorsensitiva 9 m', 'Percezione tremorsensitiva 18 m',
  'Vista vera 36 m',
];
export const CONDIZIONI_5E = [
  'Accecato', 'Affascinato', 'Afferrato', 'Assordato', 'Avvelenato',
  'Incapacitato', 'Invisibile', 'Paralizzato', 'Pietrificato',
  'Privo di sensi', 'Prono', 'Spaventato', 'Stordito', 'Trattenuto',
];
export const PESI_OGGETTI = {
  // Armature e scudo
  'Armatura di cuoio': 4.5, 'Cuoio borchiato': 6, 'Armatura di pelle': 5.5, 'Corazza di scaglie': 20,
  'Corazza a strisce': 9, 'Corazza di maglia': 8, 'Cotta di maglia': 25, 'Corazza di piastre': 30,
  'Corazza a piastre da torneo': 32.5, 'Scudo': 3,
  // Armi
  'Pugnale': 0.5, 'Spada corta': 1, 'Spada lunga': 1.5, 'Spadone': 3, 'Ascia': 1, 'Ascia bipenne': 3.5,
  'Mazza': 2, 'Mazzafrusto': 1, 'Martello da guerra': 1, 'Bastone ferrato': 2, 'Lancia': 1.5,
  'Alabarda': 3, 'Arco corto': 1, 'Arco lungo': 1, 'Balestra leggera': 2.5, 'Balestra pesante': 9,
  'Fionda': 0, 'Giavellotto': 1, 'Tridente': 2, 'Randello': 1,
  // Equipaggiamento comune
  'Zaino': 2.5, 'Corda di canapa (15 m)': 5, 'Corda di seta (15 m)': 2.5, 'Razioni (1 giorno)': 1,
  'Torcia': 0.5, 'Lanterna cieca': 1, 'Lanterna schermabile': 1, 'Otre': 2.5, 'Coperta': 1.5,
  'Sacco a pelo': 3.5, 'Kit da sanitario': 1.5, 'Kit da scasso': 0.5, 'Piede di porco': 2.5,
  'Rampino': 2, 'Martello': 1.5, 'Picchetti da tenda (10)': 2.5, 'Tenda per due': 10,
  'Catena (3 m)': 5, 'Sacco': 0.25, 'Borsa per componenti': 1, 'Focus arcano': 1.5, 'Simbolo sacro': 0.5,
  'Libro degli incantesimi': 1.5, 'Pergamena': 0, 'Pozione di guarigione': 0.25, 'Fiala': 0,
  'Acciarino': 0.5, 'Specchietto d’acciaio': 0.25, 'Corda per rampino': 5, 'Piccone': 5,
};
export const NOMI_OGGETTI = Object.keys(PESI_OGGETTI).sort((a, b) => a.localeCompare(b, 'it'));
export const PESO_ARMATURA_TIPO = { leggera: 5, media: 9, pesante: 25 };
export const LINGUE_5E = [
  'Abissale', 'Celestiale', 'Comune', 'Draconico', 'Elfico',
  'Gigante', 'Gnomesco', 'Goblin', 'Halfling', 'Infernale',
  'Nanico', 'Orchesco', 'Primordiale', 'Silvano', 'Sottocomune'
];
export const ARMI_5E = [
  // Semplici da mischia
  { nome: 'Ascia (Handaxe)', danno: '1d6', tipo: 'Tagliente', note: 'Leggera, Lancio (6/18 m)' },
  { nome: 'Bastone ferrato', danno: '1d6', tipo: 'Contundente', note: 'Versatile (1d8)' },
  { nome: 'Clava', danno: '1d4', tipo: 'Contundente', note: 'Leggera' },
  { nome: 'Falcetto', danno: '1d4', tipo: 'Tagliente', note: 'Leggera' },
  { nome: 'Giavellotto', danno: '1d6', tipo: 'Perforante', note: 'Lancio (9/36 m)' },
  { nome: 'Grande clava', danno: '1d8', tipo: 'Contundente', note: 'Due mani' },
  { nome: 'Lancia', danno: '1d6', tipo: 'Perforante', note: 'Lancio (6/18 m), Versatile (1d8)' },
  { nome: 'Martello leggero', danno: '1d4', tipo: 'Contundente', note: 'Leggera, Lancio (6/18 m)' },
  { nome: 'Mazza', danno: '1d6', tipo: 'Contundente', note: '' },
  { nome: 'Pugnale', danno: '1d4', tipo: 'Perforante', note: 'Accurata, Leggera, Lancio (6/18 m)', finesse: true },
  // Semplici a distanza
  { nome: 'Arco corto', danno: '1d6', tipo: 'Perforante', note: 'Munizioni, Due mani (24/96 m)', ranged: true },
  { nome: 'Balestra leggera', danno: '1d8', tipo: 'Perforante', note: 'Munizioni, Caricamento, Due mani (24/96 m)', ranged: true },
  { nome: 'Dardo', danno: '1d4', tipo: 'Perforante', note: 'Accurata, Lancio (6/18 m)', finesse: true, ranged: true },
  { nome: 'Fionda', danno: '1d4', tipo: 'Contundente', note: 'Munizioni (9/36 m)', ranged: true },
  // Da guerra da mischia
  { nome: 'Alabarda', danno: '1d10', tipo: 'Tagliente', note: 'Pesante, Portata, Due mani' },
  { nome: 'Ascia bipenne', danno: '1d12', tipo: 'Tagliente', note: 'Pesante, Due mani' },
  { nome: 'Ascia da battaglia', danno: '1d8', tipo: 'Tagliente', note: 'Versatile (1d10)' },
  { nome: 'Falcione', danno: '1d10', tipo: 'Tagliente', note: 'Pesante, Portata, Due mani' },
  { nome: 'Frusta', danno: '1d4', tipo: 'Tagliente', note: 'Accurata, Portata', finesse: true },
  { nome: 'Martello da guerra', danno: '1d8', tipo: 'Contundente', note: 'Versatile (1d10)' },
  { nome: 'Mazzafrusto', danno: '1d8', tipo: 'Contundente', note: '' },
  { nome: 'Mazza chiodata', danno: '1d8', tipo: 'Perforante', note: '' },
  { nome: 'Picca', danno: '1d10', tipo: 'Perforante', note: 'Pesante, Portata, Due mani' },
  { nome: 'Piccone da guerra', danno: '1d8', tipo: 'Perforante', note: '' },
  { nome: 'Scimitarra', danno: '1d6', tipo: 'Tagliente', note: 'Accurata, Leggera', finesse: true },
  { nome: 'Spada corta', danno: '1d6', tipo: 'Perforante', note: 'Accurata, Leggera', finesse: true },
  { nome: 'Spada lunga', danno: '1d8', tipo: 'Tagliente', note: 'Versatile (1d10)' },
  { nome: 'Spadone', danno: '2d6', tipo: 'Tagliente', note: 'Pesante, Due mani' },
  { nome: 'Stocco', danno: '1d8', tipo: 'Perforante', note: 'Accurata', finesse: true },
  { nome: 'Tridente', danno: '1d8', tipo: 'Perforante', note: 'Lancio (6/18 m), Versatile (1d10)' },
  // Da guerra a distanza
  { nome: 'Arco lungo', danno: '1d8', tipo: 'Perforante', note: 'Munizioni, Pesante, Due mani (45/180 m)', ranged: true },
  { nome: 'Balestra a mano', danno: '1d6', tipo: 'Perforante', note: 'Leggera, Munizioni, Caricamento (9/36 m)', ranged: true },
  { nome: 'Balestra pesante', danno: '1d10', tipo: 'Perforante', note: 'Munizioni, Pesante, Caricamento, Due mani (30/120 m)', ranged: true },
];

export const BACKGROUND_COMPETENZE = {
  Accolito: ['intuizione', 'religione'],
  Artigiano: ['indagare', 'persuasione'],
  Ciarlatano: ['inganno', 'rapiditaDiMano'],
  Contadino: ['addestrareAnimali', 'natura'],
  Criminale: ['rapiditaDiMano', 'furtivita'],
  Eremita: ['medicina', 'religione'],
  Guardia: ['atletica', 'percezione'],
  Guida: ['furtivita', 'sopravvivenza'],
  Intrattenitore: ['acrobazia', 'intrattenere'],
  Marinaio: ['acrobazia', 'percezione'],
  Mercante: ['addestrareAnimali', 'persuasione'],
  Nobile: ['storia', 'persuasione'],
  Saggio: ['arcano', 'storia'],
  Scriba: ['indagare', 'percezione'],
  Soldato: ['atletica', 'intimidire'],
  Viandante: ['intuizione', 'rapiditaDiMano'],
};
export const SPECIE_5E = {
  'Aasimar': ['Aasimar'],
  'Dragonide': ['Dragonide'],
  'Elfo': ['Elfo', 'Elfo Alto', 'Elfo dei Boschi', 'Elfo Oscuro (Drow)'],
  'Gnomo': ['Gnomo', 'Gnomo delle Foreste', 'Gnomo delle Rocce'],
  'Goliath': ['Goliath'],
  'Halfling': ['Halfling', 'Halfling Piedelesto', 'Halfling Tozzo'],
  'Nano': ['Nano', 'Nano delle Colline', 'Nano delle Montagne'],
  'Orco': ['Mezzorco', 'Orco'],
  'Tiefling': ['Tiefling'],
  'Umano': ['Umano', 'Mezzelfo']
};
export const SUBCLASS_PRIVILEGI = {
  // --- BARBARO (3, 6, 10, 14) — nomi ufficiali Manuale del Giocatore 2024 ---
  'Berserker': { 3: 'Frenesia', 6: 'Ira Incontenibile', 10: 'Ritorsione', 14: 'Presenza Intimidatoria' },
  'Cuore Selvaggio': { 3: 'Ira della Natura Selvaggia\nPortavoce degli Animali', 6: 'Aspetto della Natura Selvaggia', 10: 'Portavoce della Natura', 14: 'Potere della Natura Selvaggia' },
  'Albero del Mondo': { 3: 'Vitalità dell’Albero', 6: 'Rami dell’Albero', 10: 'Radici d’Assalto', 14: 'Viaggio lungo l’Albero' },
  'Zelota': { 3: 'Furia Divina\nGuerriero degli Dèi', 6: 'Focus Fanatico', 10: 'Presenza Zelante', 14: 'Ira degli Dèi' },

  // --- BARDO (3, 6, 14) — nomi ufficiali 2024 ---
  'Collegio della Danza': { 3: 'Scarto Smagliante', 6: 'Movimento Ispiratore\nScarto Coordinato', 14: 'Elusione Trainante' },
  'Collegio del Fascino': { 3: 'Magia Ammaliante\nManto di Ispirazione', 6: 'Manto di Maestosità', 14: 'Maestosità Invitta' },
  'Collegio della Sapienza': { 3: 'Competenze Bonus\nParole Taglienti', 6: 'Scoperte Magiche', 14: 'Abilità Impareggiabile' },
  'Collegio del Valore': { 3: 'Addestramento Marziale\nIspirazione in Combattimento', 6: 'Attacco Extra', 14: 'Magia da Combattimento' },

  // --- CHIERICO (3, 6, 17) — nomi ufficiali 2024 ---
  'Dominio della Vita': { 3: 'Discepolo della Vita\nIncantesimi del Dominio\nPreservare Vita', 6: 'Guaritore Benedetto', 17: 'Guarigione Suprema' },
  'Dominio della Luce': { 3: 'Bagliore di Interdizione\nFulgore dell’Alba\nIncantesimi del Dominio', 6: 'Bagliore di Interdizione Migliorato', 17: 'Corona di Luce' },
  'Dominio dell’Inganno': { 3: 'Benedizione dell’Ingannatore\nInvocare Duplicato\nIncantesimi del Dominio', 6: 'Trasposizione dell’Ingannatore', 17: 'Duplicato Migliorato' },
  'Dominio della Guerra': { 3: 'Colpo Guidato\nSacerdote di Guerra\nIncantesimi del Dominio', 6: 'Benedizione del Dio della Guerra', 17: 'Avatar della Battaglia' },

  // --- DRUIDO (3, 6, 10, 14) — nomi ufficiali 2024 ---
  'Circolo della Terra': { 3: 'Incantesimi del Circolo\nAusilio dalla Terra', 6: 'Recupero Naturale', 10: 'Interdizione della Natura', 14: 'Rifugio della Natura' },
  'Circolo della Luna': { 3: 'Incantesimi del Circolo\nForme del Circolo', 10: 'Passo Chiardiluna', 14: 'Forma Lunare' },
  'Circolo del Mare': { 3: 'Incantesimi del Circolo\nFuria dei Mari', 6: 'Affinità Acquatica', 10: 'Nato dalla Tempesta', 14: 'Dono Oceanico' },
  'Circolo delle Stelle': { 3: 'Carta Celeste\nForma Siderale', 6: 'Profezia Cosmica', 10: 'Costellazioni Scintillanti', 14: 'Manto di Stelle' },

  // --- GUERRIERO (3, 7, 10, 15, 18) — nomi ufficiali 2024 ---
  'Maestro di Battaglia': { 3: 'Studioso di Guerra\nSuperiorità in Combattimento' },
  'Campione': { 3: 'Atleta Straordinario\nCritico Migliorato', 7: 'Stile di Combattimento Aggiuntivo', 10: 'Guerriero Eroico', 15: 'Critico Superiore', 18: 'Sopravvissuto' },
  'Cavaliere Mistico': { 3: 'Arma Vincolata\nIncantesimi', 7: 'Magia da Guerra', 10: 'Colpo Mistico', 15: 'Carica Arcana', 18: 'Magia da Guerra Migliorata' },
  'Guerriero Psionico': { 3: 'Potere Psionico', 7: 'Adepto Telecinetico', 10: 'Scudo Mentale', 15: 'Baluardo della Forza', 18: 'Maestro della Telecinesi' },

  // --- LADRO (3, 9, 13, 17) — nomi ufficiali 2024 ---
  'Mistificatore Arcano': { 3: 'Gioco di Prestigio della Mano Magica\nIncantesimi', 9: 'Imboscata Magica', 13: 'Ingannatore Versatile', 17: 'Ladro di Incantesimi' },
  'Assassino': { 3: 'Arnesi dell’Assassino\nAssassinare', 9: 'Maestro Infiltrato', 13: 'Avvelenare Armi', 17: 'Colpo di Morte' },
  'Lama Spirituale': { 3: 'Lame Psichiche\nPotere Psionico', 9: 'Lame dell’Anima', 13: 'Velo Psichico', 17: 'Squarciare la Mente' },
  'Furfante': { 3: 'Lavoro al Secondo Piano\nMani Veloci', 9: 'Furtività Suprema', 13: 'Usare Oggetto Magico', 17: 'Riflessi da Furfante' },

  // --- MAGO (3, 6, 10, 14) — nomi ufficiali 2024 ---
  'Abiuratore': { 3: 'Abiuratore Sapiente\nInterdizione Arcana', 6: 'Interdizione Proiettata', 10: 'Spezzamagia', 14: 'Resistenza agli Incantesimi' },
  'Divinatore': { 3: 'Divinatore Sapiente\nPortento', 6: 'Divinazione Esperta', 10: 'Il Terzo Occhio', 14: 'Portento Superiore' },
  'Invocatore': { 3: 'Invocatore Sapiente\nTrucchetto Potente', 6: 'Plasmare Incantesimi', 10: 'Invocazione Potente', 14: 'Saturazione Magica' },
  'Illusionista': { 3: 'Illusionista Sapiente\nIllusioni Migliorate', 6: 'Creature Spettrali', 10: 'Sosia Illusorio', 14: 'Realtà Illusoria' },

  // --- MONACO (3, 6, 11, 17) — nomi ufficiali 2024 ---
  'Guerriero della Mano Aperta': { 3: 'Tecnica della Mano Aperta', 6: 'Integrità del Corpo', 11: 'Passo Lesto', 17: 'Palmo Tremante' },
  'Guerriero della Misericordia': { 3: 'Mano del Dolore\nMano Guaritrice\nStrumenti di Misericordia', 6: 'Tocco del Medico', 11: 'Raffica di Guarigione e Dolore', 17: 'Mano della Misericordia Suprema' },
  'Guerriero degli Elementi': { 3: 'Manipolare gli Elementi\nSintonia Elementale', 6: 'Esplosione Elementale', 11: 'Passo degli Elementi', 17: 'Quintessenza Elementale' },
  'Guerriero dell’Ombra': { 3: 'Arti dell’Ombra', 6: 'Passo d’Ombra', 11: 'Passo d’Ombra Migliorato', 17: 'Manto di Ombre' },

  // --- PALADINO (3, 7, 15, 20) — nomi ufficiali 2024 ---
  'Giuramento di Devozione': { 3: 'Arma Consacrata\nIncantesimi del Giuramento', 7: 'Aura di Devozione', 15: 'Punizione Protettiva', 20: 'Nube Sacra' },
  'Giuramento di Gloria': { 3: 'Atleta Impareggiabile\nPunizione Ispiratrice\nIncantesimi del Giuramento', 7: 'Aura di Alacrità', 15: 'Difesa Gloriosa', 20: 'Leggenda Vivente' },
  'Giuramento degli Antichi': { 3: 'Furia della Natura\nIncantesimi del Giuramento', 7: 'Aura Guardiana', 15: 'Sentinella Imperitura', 20: 'Campione degli Antichi' },
  'Giuramento di Vendetta': { 3: 'Voto di Inimicizia\nIncantesimi del Giuramento', 7: 'Vendetta Implacabile', 15: 'Anima Vendicativa', 20: 'Angelo Vendicatore' },

  // --- RANGER (3, 7, 11, 15) — nomi ufficiali 2024 ---
  'Signore delle Bestie': { 3: 'Compagno Primordiale', 7: 'Addestramento Eccezionale', 11: 'Furia Bestiale', 15: 'Condividi Incantesimi' },
  'Viandante Fatato': { 3: 'Colpi Terribili\nFascino Ultraterreno\nIncantesimi del Viandante', 7: 'Scambio Seducente', 11: 'Rinforzi Fatati', 15: 'Viandante Velato' },
  'Cacciatore delle Tenebre': { 3: 'Imboscata Terrificante\nVista dell’Ombra\nIncantesimi del Cacciatore', 7: 'Mente di Ferro', 11: 'Raffica del Cacciatore', 15: 'Schivata dell’Ombra' },
  'Cacciatore': { 3: 'Preda del Cacciatore\nSapienza del Cacciatore', 7: 'Tattiche Difensive', 11: 'Preda del Cacciatore Superiore', 15: 'Difesa del Cacciatore Superiore' },

  // --- STREGONE (3, 6, 14, 18) — nomi ufficiali 2024 ---
  'Stregoneria Aberrante': { 3: 'Conversazione Telepatica\nIncantesimi Psionici', 6: 'Stregoneria Psionica\nDifese Psichiche', 14: 'Rivelazione della Carne', 18: 'Implosione Distorcente' },
  'Stregoneria Draconica': { 3: 'Incantesimi Draconici\nResilienza Draconica', 6: 'Affinità Elementale', 14: 'Ali di Drago', 18: 'Seguace Draconico' },
  'Stregoneria della Magia Selvaggia': { 3: 'Impulso di Magia Selvaggia\nOnde di Caos', 6: 'Piegare la Fortuna', 14: 'Caos Controllato', 18: 'Impulsi Domati' },
  'Stregoneria Meccanica': { 3: 'Incantesimi Meccanici\nRipristino dell’Equilibrio', 6: 'Bastione della Legge', 14: 'Trance dell’Ordine', 18: 'Cavalleria Meccanica' },

  // --- WARLOCK (3, 6, 10, 14) — nomi ufficiali 2024 ---
  'Patrono Signore Fatato': { 3: 'Incantesimi del Signore Fatato\nMovimenti del Folletto', 6: 'Fuga Nebbiosa', 10: 'Difese Seducenti', 14: 'Magia Ammaliante' },
  'Patrono Celestiale': { 3: 'Incantesimi Celestiali\nLuce Curatrice', 6: 'Anima Radiosa', 10: 'Resilienza Celestiale', 14: 'Vendetta Incandescente' },
  'Patrono Immondo': { 3: 'Benedizione dell’Oscuro\nIncantesimi Immondi', 6: 'Fortuna dell’Oscuro', 10: 'Resilienza Immonda', 14: 'Scagliare all’Inferno' },
  'Patrono Grande Antico': { 3: 'Incantesimi del Grande Antico\nIncantesimi Psichici\nMente Risvegliata', 6: 'Guerriero Chiaroveggente', 10: 'Scudo del Pensiero', 14: 'Creare Servitore' },
};
export const CARATT_INCANTATORE = {
  bardo: 'carisma', stregone: 'carisma', warlock: 'carisma', paladino: 'carisma',
  chierico: 'saggezza', druido: 'saggezza', ranger: 'saggezza',
  mago: 'intelligenza',
};
export const PRIORITA_CARATT = {
  barbaro: ['forza', 'costituzione', 'destrezza', 'saggezza', 'carisma', 'intelligenza'],
  bardo: ['carisma', 'destrezza', 'costituzione', 'saggezza', 'intelligenza', 'forza'],
  chierico: ['saggezza', 'costituzione', 'forza', 'destrezza', 'carisma', 'intelligenza'],
  druido: ['saggezza', 'costituzione', 'destrezza', 'intelligenza', 'carisma', 'forza'],
  guerriero: ['forza', 'costituzione', 'destrezza', 'saggezza', 'carisma', 'intelligenza'],
  ladro: ['destrezza', 'costituzione', 'saggezza', 'intelligenza', 'carisma', 'forza'],
  mago: ['intelligenza', 'costituzione', 'destrezza', 'saggezza', 'carisma', 'forza'],
  monaco: ['destrezza', 'saggezza', 'costituzione', 'forza', 'intelligenza', 'carisma'],
  paladino: ['forza', 'carisma', 'costituzione', 'saggezza', 'destrezza', 'intelligenza'],
  ranger: ['destrezza', 'saggezza', 'costituzione', 'forza', 'intelligenza', 'carisma'],
  stregone: ['carisma', 'costituzione', 'destrezza', 'saggezza', 'intelligenza', 'forza'],
  warlock: ['carisma', 'costituzione', 'destrezza', 'saggezza', 'intelligenza', 'forza'],
};
export const DADO_VITA_CLASSE = {
  barbaro: 12,
  guerriero: 10, paladino: 10, ranger: 10,
  bardo: 8, chierico: 8, druido: 8, ladro: 8, monaco: 8, stregone: 8, warlock: 8,
  mago: 6,
};
export const BACKGROUND_CARATT = {
  Accolito: ['intelligenza', 'saggezza', 'carisma'],
  Artigiano: ['forza', 'destrezza', 'intelligenza'],
  Ciarlatano: ['destrezza', 'costituzione', 'carisma'],
  Contadino: ['forza', 'costituzione', 'saggezza'],
  Criminale: ['destrezza', 'costituzione', 'intelligenza'],
  Eremita: ['costituzione', 'saggezza', 'carisma'],
  Guardia: ['forza', 'intelligenza', 'saggezza'],
  Guida: ['destrezza', 'costituzione', 'saggezza'],
  Intrattenitore: ['forza', 'destrezza', 'carisma'],
  Marinaio: ['forza', 'destrezza', 'saggezza'],
  Mercante: ['costituzione', 'intelligenza', 'carisma'],
  Nobile: ['forza', 'intelligenza', 'carisma'],
  Saggio: ['costituzione', 'intelligenza', 'saggezza'],
  Scriba: ['destrezza', 'intelligenza', 'saggezza'],
  Soldato: ['forza', 'destrezza', 'costituzione'],
  Viandante: ['destrezza', 'saggezza', 'carisma'],
};
export const TS_CLASSE = {
  barbaro: ['forza', 'costituzione'], bardo: ['destrezza', 'carisma'],
  chierico: ['saggezza', 'carisma'], druido: ['intelligenza', 'saggezza'],
  guerriero: ['forza', 'costituzione'], ladro: ['destrezza', 'intelligenza'],
  mago: ['intelligenza', 'saggezza'], monaco: ['forza', 'destrezza'],
  paladino: ['saggezza', 'carisma'], ranger: ['forza', 'destrezza'],
  stregone: ['costituzione', 'carisma'], warlock: ['saggezza', 'carisma'],
};
export const ADDESTRAMENTO_CLASSE = {
  barbaro: { armature: { leggera: true, media: true, pesante: false, scudi: true }, armi: 'Armi semplici e da guerra' },
  bardo: { armature: { leggera: true, media: false, pesante: false, scudi: false }, armi: 'Armi semplici' },
  chierico: { armature: { leggera: true, media: true, pesante: false, scudi: true }, armi: 'Armi semplici' },
  druido: { armature: { leggera: true, media: true, pesante: false, scudi: true }, armi: 'Armi semplici (no metallo)' },
  guerriero: { armature: { leggera: true, media: true, pesante: true, scudi: true }, armi: 'Armi semplici e da guerra' },
  ladro: { armature: { leggera: true, media: false, pesante: false, scudi: false }, armi: 'Armi semplici e con finezza' },
  mago: { armature: { leggera: false, media: false, pesante: false, scudi: false }, armi: 'Armi semplici' },
  monaco: { armature: { leggera: false, media: false, pesante: false, scudi: false }, armi: 'Armi semplici e arma da monaco' },
  paladino: { armature: { leggera: true, media: true, pesante: true, scudi: true }, armi: 'Armi semplici e da guerra' },
  ranger: { armature: { leggera: true, media: true, pesante: false, scudi: true }, armi: 'Armi semplici e da guerra' },
  stregone: { armature: { leggera: false, media: false, pesante: false, scudi: false }, armi: 'Armi semplici' },
  warlock: { armature: { leggera: true, media: false, pesante: false, scudi: false }, armi: 'Armi semplici' },
};
export const COMPETENZE_CLASSE = {
  barbaro: { numero: 2, lista: ['addestrareAnimali', 'atletica', 'intimidire', 'natura', 'percezione', 'sopravvivenza'] },
  bardo: { numero: 3, lista: 'tutte' },
  chierico: { numero: 2, lista: ['storia', 'intuizione', 'medicina', 'persuasione', 'religione'] },
  druido: { numero: 2, lista: ['arcano', 'addestrareAnimali', 'intuizione', 'medicina', 'natura', 'percezione', 'religione', 'sopravvivenza'] },
  guerriero: { numero: 2, lista: ['acrobazia', 'addestrareAnimali', 'atletica', 'storia', 'intuizione', 'intimidire', 'percezione', 'sopravvivenza'] },
  ladro: { numero: 4, lista: ['acrobazia', 'atletica', 'inganno', 'intuizione', 'intimidire', 'indagare', 'percezione', 'persuasione', 'rapiditaDiMano', 'furtivita'] },
  mago: { numero: 2, lista: ['arcano', 'storia', 'intuizione', 'indagare', 'medicina', 'religione'] },
  monaco: { numero: 2, lista: ['acrobazia', 'atletica', 'storia', 'intuizione', 'religione', 'furtivita'] },
  paladino: { numero: 2, lista: ['atletica', 'intuizione', 'intimidire', 'medicina', 'persuasione', 'religione'] },
  ranger: { numero: 3, lista: ['addestrareAnimali', 'atletica', 'indagare', 'intuizione', 'natura', 'percezione', 'furtivita', 'sopravvivenza'] },
  stregone: { numero: 2, lista: ['arcano', 'inganno', 'intuizione', 'intimidire', 'persuasione', 'religione'] },
  warlock: { numero: 2, lista: ['arcano', 'inganno', 'storia', 'intimidire', 'indagare', 'natura', 'religione'] },
};
export const PRIVILEGI_CLASSE_L1 = {
  barbaro: 'Ira\nDifesa senza armatura (CA = 10 + DES + COS)\nMaestria nelle armi',
  bardo: 'Lancio di incantesimi (Carisma)\nIspirazione bardica (d6)',
  chierico: 'Lancio di incantesimi (Saggezza)\nOrdine divino (Protettore o Taumaturgo)',
  druido: 'Lancio di incantesimi (Saggezza)\nOrdine primordiale\nLinguaggio druidico',
  guerriero: 'Stile di combattimento\nRecuperare energie (azione bonus)\nMaestria nelle armi',
  ladro: 'Attacco furtivo (1d6)\nMaestria (doppia competenza in 2 abilità)\nGergo ladresco\nMaestria nelle armi',
  mago: 'Lancio di incantesimi (Intelligenza)\nRecupero arcano\nRituali · Studioso',
  monaco: 'Arti marziali\nDifesa senza armatura (CA = 10 + DES + SAG)',
  paladino: 'Imposizione delle mani (cura 5 × livello)\nLancio di incantesimi (Carisma)\nMaestria nelle armi',
  ranger: 'Lancio di incantesimi (Saggezza)\nNemico favorito\nEsploratore provetto\nMaestria nelle armi',
  stregone: 'Lancio di incantesimi (Carisma)\nStregoneria innata',
  warlock: 'Magia del patto (Carisma)\nPatrono ultraterreno\nSuppliche occulte (invocazioni)',
};
export const PRIVILEGI_CLASSE_L1_2014 = {
  barbaro: 'Ira\nDifesa senza armatura (CA = 10 + DES + COS)',
  bardo: 'Lancio di incantesimi (Carisma)\nIspirazione bardica (d6)',
  chierico: 'Lancio di incantesimi (Saggezza)\nDominio divino (sottoclasse)',
  druido: 'Lancio di incantesimi (Saggezza)\nDruidico',
  guerriero: 'Stile di combattimento\nRecuperare energie',
  ladro: 'Attacco furtivo (1d6)\nMaestria (doppia competenza in 2 abilità)\nGergo ladresco',
  mago: 'Lancio di incantesimi (Intelligenza)\nRecupero arcano',
  monaco: 'Difesa senza armatura (CA = 10 + DES + SAG)\nArti marziali',
  paladino: 'Senso divino\nImposizione delle mani (cura 5 × livello)',
  ranger: 'Nemico prescelto\nEsploratore naturale',
  stregone: 'Lancio di incantesimi (Carisma)\nOrigine stregonesca (sottoclasse)',
  warlock: 'Magia del patto (Carisma)\nPatrono ultraterreno (sottoclasse)',
};
export const PRIVILEGI_CLASSE_LIV = {
  barbaro: {
    2: 'Attacco irruento\nPercezione del pericolo',
    5: 'Attacco extra\nMovimento veloce (+3 m)',
    7: 'Istinto ferino\nIra instancabile',
    9: 'Critico brutale (1 dado extra)',
    11: 'Ira implacabile',
    15: 'Ira persistente',
    17: 'Critico brutale (2 dadi extra)',
    18: 'Forza indomabile',
    20: 'Campione primordiale (+4 FOR e COS, max 25)',
  },
  bardo: {
    2: 'Factotum (metà competenza)\nCanzone di riposo',
    3: 'Maestria (competenza doppia in 2 abilità)',
    5: "Fonte d'ispirazione\nIspirazione bardica d8",
    9: 'Ispirazione bardica d10',
    10: 'Segreti magici',
    13: 'Ispirazione bardica d12',
    18: 'Ispirazione superiore',
    20: 'Parole di creazione',
  },
  chierico: {
    2: 'Incanalare divinità',
    5: 'Distruggere non morti',
    7: 'Colpo benedetto',
    10: 'Intervento divino',
    14: 'Colpo benedetto migliorato',
    18: 'Incanalare divinità (usi aggiuntivi)',
    20: 'Intervento divino migliorato',
  },
  druido: {
    2: 'Forma selvatica\nCompagno selvatico',
    5: 'Furia elementale',
    7: 'Incantesimi nella forma selvatica',
    15: 'Furia elementale migliorata',
    18: 'Incantesimi bestiali',
    20: 'Arcidruido',
  },
  guerriero: {
    2: 'Azione impetuosa\nMente tattica',
    5: 'Attacco extra',
    9: 'Indomito\nMaestro tattico',
    11: 'Due attacchi extra (3 attacchi totali)',
    13: 'Indomito (2 usi)\nAttacchi studiati',
    17: 'Azione impetuosa (2 usi)\nIndomito (3 usi)',
    20: 'Tre attacchi extra (4 attacchi totali)',
  },
  ladro: {
    2: 'Azione scaltra',
    5: 'Colpo scaltro\nSchivata prodigiosa',
    7: 'Elusione\nTalento affidabile',
    11: 'Colpo scaltro migliorato',
    14: 'Competenze aggiuntive',
    15: 'Mente sfuggente',
    18: 'Inafferrabile',
    20: 'Colpo di fortuna',
    // Attacco furtivo (+1d6 a ogni livello dispari) è aggiunto a parte.
  },
  mago: {
    2: 'Studioso',
    5: 'Memorizzare incantesimo',
    18: 'Padronanza degli incantesimi',
    20: 'Incantesimi distintivi',
  },
  monaco: {
    2: 'Concentrazione monastica (Ki)\nMovimento senza armatura\nMetabolismo prodigioso',
    3: 'Deviare attacchi',
    4: 'Caduta lenta',
    5: 'Attacco extra\nColpo stordente',
    7: 'Elusione',
    9: 'Movimento acrobatico',
    10: 'Concentrazione accresciuta\nAuto-guarigione',
    13: "Deviare l'energia",
    14: 'Sopravvissuto disciplinato',
    15: 'Concentrazione perfetta',
    18: 'Difesa superiore',
    20: 'Corpo e mente',
  },
  paladino: {
    2: 'Stile di combattimento\nColpo divino (Divine Smite)',
    3: 'Incanalare divinità',
    5: 'Attacco extra\nDestriero fidato',
    6: 'Aura di protezione',
    9: 'Rinnegare i nemici',
    10: 'Aura di coraggio',
    11: 'Colpi radiosi',
    14: 'Tocco risanatore',
    18: 'Aure potenziate (9 m)',
  },
  ranger: {
    2: 'Esploratore provetto\nStile di combattimento',
    5: 'Attacco extra',
    6: 'Vagabondo',
    9: 'Maestria (competenza doppia)',
    10: 'Instancabile',
    13: 'Cacciatore implacabile',
    14: 'Velo della natura',
    17: 'Cacciatore preciso',
    18: 'Sensi ferini',
    20: 'Sterminatore di nemici',
  },
  stregone: {
    2: 'Fonte di magia (Punti stregoneria)',
    5: 'Recupero stregonesco',
    7: 'Stregoneria incarnata',
    20: 'Apoteosi arcana',
  },
  warlock: {
    2: 'Astuzia magica',
    9: 'Contattare il patrono',
    11: 'Arcanum mistico (6° livello)',
    13: 'Arcanum mistico (7° livello)',
    15: 'Arcanum mistico (8° livello)',
    17: 'Arcanum mistico (9° livello)',
    20: 'Maestro occulto',
  },
};
export const PRIVILEGI_CLASSE_LIV_2014 = {
  barbaro: {
    2: 'Attacco irruento\nPercezione del pericolo',
    5: 'Attacco extra\nMovimento veloce (+3 m)',
    7: 'Istinto ferino',
    9: 'Critico brutale (1 dado extra)',
    11: 'Ira implacabile',
    13: 'Critico brutale (2 dadi extra)',
    15: 'Ira persistente',
    17: 'Critico brutale (3 dadi extra)',
    18: 'Forza indomabile',
    20: 'Campione primordiale (+4 FOR e COS, max 24)',
  },
  bardo: {
    2: 'Factotum (metà competenza)\nCanzone di riposo (d6)',
    3: 'Competenza (2 abilità)',
    5: "Fonte d'ispirazione\nIspirazione bardica d8",
    6: 'Controincantesimo',
    10: 'Segreti magici\nIspirazione bardica d10\nCompetenza (altre 2)',
    14: 'Segreti magici',
    15: 'Ispirazione bardica d12',
    18: 'Segreti magici',
    20: 'Ispirazione superiore',
  },
  chierico: {
    2: 'Incanalare divinità (1/riposo)',
    5: 'Distruggere non morti (GS 1/2)',
    6: 'Incanalare divinità (2/riposo)',
    8: 'Distruggere non morti (GS 1)\nColpo divino (se previsto dal dominio)',
    10: 'Intervento divino',
    11: 'Distruggere non morti (GS 2)',
    14: 'Distruggere non morti (GS 3)',
    17: 'Distruggere non morti (GS 4)',
    18: 'Incanalare divinità (3/riposo)',
    20: 'Intervento divino migliorato',
  },
  druido: {
    2: 'Forma selvatica',
    4: 'Forma selvatica migliorata (GS 1/2)',
    8: 'Forma selvatica (GS 1)',
    18: 'Corpo senza tempo\nIncantesimi bestiali',
    20: 'Arcidruido',
  },
  guerriero: {
    2: 'Azione impetuosa',
    5: 'Attacco extra',
    9: 'Indomito',
    11: 'Attacco extra (2)',
    13: 'Indomito (2 usi)',
    17: 'Azione impetuosa (2 usi)\nIndomito (3 usi)',
    20: 'Attacco extra (3)',
  },
  ladro: {
    2: 'Azione scaltra',
    5: 'Schivata prodigiosa',
    7: 'Elusione',
    11: 'Talento affidabile',
    14: 'Percezione cieca',
    15: 'Mente sfuggente',
    18: 'Inafferrabile',
    20: 'Colpo di fortuna',
  },
  mago: {
    18: 'Padronanza degli incantesimi',
    20: 'Incantesimi distintivi',
  },
  monaco: {
    2: 'Ki\nMovimento senza armatura',
    3: 'Deviare i proiettili',
    4: 'Caduta lenta',
    5: 'Attacco extra\nColpo stordente',
    6: 'Colpi potenziati dal ki',
    7: 'Elusione\nQuiete della mente',
    10: 'Purezza del corpo',
    13: 'Lingua del sole e della luna',
    14: 'Anima di diamante',
    15: 'Corpo senza tempo',
    18: 'Corpo vuoto',
    20: 'Sé perfetto',
  },
  paladino: {
    2: 'Stile di combattimento\nPunizione divina',
    3: 'Salute divina',
    5: 'Attacco extra',
    6: 'Aura di protezione',
    10: 'Aura di coraggio',
    11: 'Punizione divina migliorata',
    14: 'Tocco purificante',
    18: 'Aure (raggio 9 m)',
  },
  ranger: {
    2: 'Stile di combattimento',
    3: 'Consapevolezza primordiale',
    5: 'Attacco extra',
    8: 'Andatura nel terreno',
    10: 'Nascondersi in piena vista',
    14: 'Svanire',
    18: 'Sensi ferini',
    20: 'Sterminatore di nemici',
  },
  stregone: {
    2: 'Fonte di magia (Punti stregoneria)',
    20: 'Ristoro stregonesco',
  },
  warlock: {
    2: 'Invocazioni occulte',
    3: 'Dono del patto',
    11: 'Arcanum mistico (6° livello)',
    13: 'Arcanum mistico (7° livello)',
    15: 'Arcanum mistico (8° livello)',
    17: 'Arcanum mistico (9° livello)',
    20: 'Maestro occulto',
  },
};
export const ASI_LIV = {
  guerriero: [4, 6, 8, 12, 14, 16, 19],
  ladro: [4, 8, 10, 12, 16, 19],
  _default: [4, 8, 12, 16, 19],
};
export const SOTTOCLASSE_LIV = {
  barbaro: [3, 6, 10, 14], bardo: [3, 6, 14], chierico: [3, 6, 17],
  druido: [3, 6, 10, 14], guerriero: [3, 7, 10, 15, 18], ladro: [3, 9, 13, 17],
  mago: [3, 6, 10, 14], monaco: [3, 6, 11, 17], paladino: [3, 7, 15, 20],
  ranger: [3, 7, 11, 15], stregone: [3, 6, 14, 18], warlock: [3, 6, 10, 14],
};
export const SOTTOCLASSE_LIV_2014 = {
  barbaro: [3, 6, 10, 14], bardo: [3, 6, 14], chierico: [1, 2, 6, 8, 17],
  druido: [2, 6, 10, 14], guerriero: [3, 7, 10, 15, 18], ladro: [3, 9, 13, 17],
  mago: [2, 6, 10, 14], monaco: [3, 6, 11, 17], paladino: [3, 7, 15, 20],
  ranger: [3, 7, 11, 15], stregone: [1, 6, 14, 18], warlock: [1, 6, 10, 14],
};
export const COMPETENZE_SPECIE = {
  Elfo: { numero: 1, lista: ['intuizione', 'percezione', 'sopravvivenza'], tratto: 'Sensi Acuti' },
};
export const NOMI_SPECIE = {
  elfo: ['Aelar', 'Faelyn', 'Thalindra', 'Miriel', 'Erevan', 'Sylvaris', 'Caelynn', 'Lithael', 'Naivara', 'Aramil', 'Enna', 'Vaeril'],
  nano: ['Durgan', 'Baldrek', 'Thora', 'Helga', 'Grunnar', 'Kildrak', 'Barundra', 'Dwalin', 'Morgrym', 'Vistra', 'Kaddra', 'Rurik'],
  orco: ['Grosh', 'Karg', 'Ushka', 'Mogru', 'Thurgok', 'Renk', 'Grukka', 'Vola', 'Dragok', 'Yarzol', 'Romok', 'Shautha'],
  umano: ['Aldric', 'Elena', 'Marcus', 'Sera', 'Gareth', 'Lyra', 'Rowan', 'Mira', 'Corin', 'Talia', 'Emeric', 'Dara'],
  tiefling: ['Malakar', 'Nyx', 'Ember', 'Vex', 'Karrin', 'Damaia', 'Kallista', 'Mordai', 'Sered', 'Akta', 'Barakas', 'Rieta'],
  drago: ['Rhogar', 'Balasar', 'Kava', 'Sora', 'Nadarr', 'Pandjed', 'Arjhan', 'Mishann', 'Torinn', 'Kriv', 'Farideh', 'Harann'],
  gnomo: ['Fizwick', 'Namfudl', 'Roondar', 'Ella', 'Bimble', 'Wren', 'Dabbek', 'Nissa', 'Zook', 'Ellywick', 'Boddynock', 'Lorra'],
  halfling: ['Milo', 'Pip', 'Rosanna', 'Cade', 'Wenna', 'Lidda', 'Finnan', 'Nedda', 'Corrin', 'Seraphina', 'Osborn', 'Verna'],
  aasimar: ['Seraphel', 'Aurelia', 'Cael', 'Lumen', 'Nova', 'Ysera', 'Ilias', 'Elenya', 'Raziel', 'Solara'],
  goliath: ['Kavaki', 'Thruun', 'Vaunea', 'Ilikan', 'Ovak', 'Nalla', 'Gae-Al', 'Keothi', 'Uthal', 'Manneo'],
};
export const NOMI_GENERICI = ['Aldric', 'Lyra', 'Corin', 'Sera', 'Rowan', 'Mira', 'Talon', 'Enna', 'Kael', 'Nira'];
export const SPECIE_DATI = {
  Aasimar: { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Media', tratti: 'Resistenza celestiale, Mani guaritrici, Portatore di luce' },
  Dragonide: { velocita: 9, sensi: '', taglia: 'Media', tratti: 'Arma a soffio, Resistenza al danno, Antenati draconici' },
  Elfo: { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Media', tratti: 'Trance, Retaggio fatato, Sensi acuti' },
  Gnomo: { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Piccola', tratti: 'Astuzia gnomesca (vantaggio ai TS mentali contro la magia)' },
  Goliath: { velocita: 10.5, sensi: '', taglia: 'Media', tratti: 'Retaggio dei giganti, Corporatura potente' },
  Halfling: { velocita: 9, sensi: '', taglia: 'Piccola', tratti: 'Coraggioso, Agilità halfling, Fortuna, Furtività naturale' },
  Nano: { velocita: 9, sensi: 'Scurovisione 36 m', taglia: 'Media', tratti: 'Robustezza nanica, Scalpellino, Resistenza al veleno' },
  Orco: { velocita: 9, sensi: 'Scurovisione 36 m', taglia: 'Media', tratti: 'Scatto adrenalinico, Resistenza implacabile' },
  Tiefling: { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Media', tratti: 'Presenza ultraterrena, Resistenza al danno' },
  Umano: { velocita: 9, sensi: '', taglia: 'Media', tratti: 'Pieno di risorse, Abile, Versatile' },
};
export const SFINIMENTO_2014 = [
  '',
  'Svantaggio alle prove di caratteristica',
  'Velocità dimezzata',
  'Svantaggio a tiri per colpire e tiri salvezza',
  'Massimo dei PF dimezzato',
  'Velocità ridotta a 0',
  'Morte',
];
export const BASE_ARMATURA_DEFAULT = { leggera: 12, media: 14, pesante: 18 };
export const ESEMPI_ARMATURA = {
  leggera: 'Imbottita 11 · Cuoio 11 · Cuoio borchiato 12',
  media: 'Camaglia 13 · Corazza 14 · Mezza piastra 15',
  pesante: 'Anelli 14 · Maglia 16 · Chiodata 17 · Piastre 18',
};

export const CLASSI = [
  { match: ['barbaro', 'barbarian'], chiaro: '#b0281b', scuro: '#ec6f5e' },   // rosso
  { match: ['bardo', 'bard'], chiaro: '#c02a9c', scuro: '#ee78d0' },          // magenta
  { match: ['chierico', 'cleric'], chiaro: '#d6a90f', scuro: '#f0cb44' },     // oro
  { match: ['druido', 'druid'], chiaro: '#3f9a3a', scuro: '#79ce6f' },        // verde foglia
  { match: ['guerriero', 'fighter'], chiaro: '#4a6a8a', scuro: '#8aa6c8' },   // blu acciaio
  { match: ['ladro', 'rogue'], chiaro: '#566070', scuro: '#99a4b4' },         // grigio ardesia
  { match: ['mago', 'wizard'], chiaro: '#1f74d4', scuro: '#66acf0' },         // azzurro
  { match: ['monaco', 'monk'], chiaro: '#12a08e', scuro: '#57d6c4' },         // giada
  { match: ['paladino', 'paladin'], chiaro: '#b07d2f', scuro: '#e0a851' },    // bronzo
  { match: ['ranger'], chiaro: '#7d8a26', scuro: '#b3c257' },                 // verde oliva
  { match: ['stregone', 'sorcerer'], chiaro: '#e0521c', scuro: '#f4885a' },   // arancio fuoco
  { match: ['warlock', 'patto'], chiaro: '#7b30b0', scuro: '#b07be0' },       // viola indaco
];
