// Dati di gioco D&D 5e estratti da App.jsx (costanti pure, nessuna logica).
// Spostati qui per ridurre la dimensione di App.jsx e i conflitti di merge.

import { INCANTESIMI_DB } from './incantesimi.js';

export const NOMI_CLASSI = [
  'Barbaro', 'Bardo', 'Chierico', 'Druido', 'Guerriero', 'Ladro',
  'Mago', 'Monaco', 'Paladino', 'Ranger', 'Stregone', 'Warlock', 'Artefice',
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
  barbaro: ['Berserker', 'Cuore Selvaggio', 'Albero del Mondo', 'Zelota', 'Cammino della Bestia', 'Cammino della Magia Selvaggia', 'Guardiano Ancestrale', 'Guerriero Totemico'],
  bardo: ['Collegio della Danza', 'Collegio del Fascino', 'Collegio della Sapienza', 'Collegio del Valore', 'Collegio della Creazione', 'Collegio dell’Eloquenza', 'Collegio delle Spade', 'Collegio dei Sussurri'],
  chierico: ['Dominio della Vita', 'Dominio della Luce', 'Dominio dell’Inganno', 'Dominio della Guerra', 'Dominio dell’Ordine', 'Dominio della Pace', 'Dominio del Crepuscolo', 'Dominio della Tempesta', 'Dominio della Natura', 'Dominio della Forgia', 'Dominio della Tomba'],
  druido: ['Circolo della Terra', 'Circolo della Luna', 'Circolo del Mare', 'Circolo del Pastore', 'Circolo delle Stelle', 'Circolo delle Spore', 'Circolo del Fuoco Selvaggio', 'Circolo dei Sogni'],
  guerriero: ['Maestro di Battaglia', 'Campione', 'Cavaliere Mistico', 'Guerriero Psionico', 'Cavaliere Runico', 'Arciere Arcano', 'Cavaliere', 'Samurai'],
  ladro: ['Mistificatore Arcano', 'Assassino', 'Lama Spirituale', 'Furfante', 'Fantasma', 'Inquisitore', 'Pianificatore', 'Spadaccino', 'Scout'],
  mago: ['Abiuratore', 'Divinatore', 'Invocatore', 'Illusionista', 'Cantore della Lama', 'Ordine degli Scribi', 'Necromante', 'Trasmutatore', 'Ammaliatore', 'Evocatore', 'Mago della Guerra'],
  monaco: ['Guerriero della Misericordia', 'Guerriero dell’Ombra', 'Guerriero degli Elementi', 'Guerriero della Mano Aperta', 'Via del Sé Astrale', 'Via del Maestro Ubriaco', 'Via del Kensei', 'Via dell’Anima Solare'],
  paladino: ['Giuramento di Devozione', 'Giuramento di Gloria', 'Giuramento degli Antichi', 'Giuramento di Vendetta', 'Giuramento degli Osservatori', 'Giuramento di Conquista', 'Giuramento di Redenzione', 'Giuramento della Corona'],
  ranger: ['Signore delle Bestie', 'Viandante Fatato', 'Cacciatore delle Tenebre', 'Cacciatore', 'Custode dello Sciame', 'Uccisore di Mostri', 'Guardiano dell’Orizzonte'],
  stregone: ['Stregoneria Aberrante', 'Stregoneria Meccanica', 'Stregoneria Draconica', 'Stregoneria della Magia Selvaggia', 'Stregoneria delle Ombre', 'Anima Divina', 'Stregoneria della Tempesta'],
  warlock: ['Patrono Signore Fatato', 'Patrono Celestiale', 'Patrono Immondo', 'Patrono Grande Antico', 'Patrono delle Profondità', 'Patrono del Genio', 'Lama del Sortilegio', 'L’Immortale'],
  artefice: ['Alchimista', 'Armaiolo', 'Artigliere', 'Fabbro da Guerra'],
};

export const INCANTESIMI_CLASSE = (() => {
  const classi = {
    stregone: {}, mago: {}, chierico: {}, druido: {}, bardo: {}, warlock: {}, paladino: {}, ranger: {}, artefice: {}
  };
  for (let i = 0; i <= 9; i++) {
    for (const c of Object.keys(classi)) classi[c][i] = [];
  }
  for (const [nome, d] of Object.entries(INCANTESIMI_DB)) {
    const liv = d.livello ?? 0;
    for (const cls of (d.classi || [])) {
      const k = cls.toLowerCase();
      if (classi[k] && classi[k][liv]) {
        if (!classi[k][liv].includes(nome)) classi[k][liv].push(nome);
      }
    }
  }
  for (const c of Object.keys(classi)) {
    for (let i = 0; i <= 9; i++) {
      classi[c][i].sort((a, b) => a.localeCompare(b, 'it'));
    }
  }
  return classi;
})();

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
export const SLOT_WARLOCK = {
  1:  [1],
  2:  [2],
  3:  [0, 2],
  4:  [0, 2],
  5:  [0, 0, 2],
  6:  [0, 0, 2],
  7:  [0, 0, 0, 2],
  8:  [0, 0, 0, 2],
  9:  [0, 0, 0, 0, 2],
  10: [0, 0, 0, 0, 2],
  11: [0, 0, 0, 0, 3, 1],
  12: [0, 0, 0, 0, 3, 1],
  13: [0, 0, 0, 0, 3, 1, 1],
  14: [0, 0, 0, 0, 3, 1, 1],
  15: [0, 0, 0, 0, 3, 1, 1, 1],
  16: [0, 0, 0, 0, 3, 1, 1, 1],
  17: [0, 0, 0, 0, 4, 1, 1, 1, 1],
  18: [0, 0, 0, 0, 4, 1, 1, 1, 1],
  19: [0, 0, 0, 0, 4, 1, 1, 1, 1],
  20: [0, 0, 0, 0, 4, 1, 1, 1, 1],
};
export const SLOT_ARTEFICE = {
  1:  [2],
  2:  [2],
  3:  [3],
  4:  [3],
  5:  [4, 2],
  6:  [4, 2],
  7:  [4, 3],
  8:  [4, 3],
  9:  [4, 3, 2],
  10: [4, 3, 2],
  11: [4, 3, 3],
  12: [4, 3, 3],
  13: [4, 3, 3, 1],
  14: [4, 3, 3, 1],
  15: [4, 3, 3, 2],
  16: [4, 3, 3, 2],
  17: [4, 3, 3, 3, 1],
  18: [4, 3, 3, 3, 1],
  19: [4, 3, 3, 3, 2],
  20: [4, 3, 3, 3, 2],
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
  // Aggiunte Comuni
  'Borsa da erborista': 1.5, 'Giaciglio': 3.5, 'Dotazione da avventuriero': 29.5, 'Dotazione da studioso': 5.5,
  'Dotazione da diplomatico': 18, 'Dotazione da intrattenitore': 19, 'Dotazione da sacerdote': 12.5,
  'Dotazione da dungeoneer': 30.5, 'Dotazione da scassinatore': 23, 'Abiti da viaggiatore': 2,
  'Abiti comuni': 1.5, 'Abiti pregiati': 3, 'Focus druidico': 1.5, 'Libro (filosofia)': 2.5,
  // Oggetto magico: peso fisso a prescindere dal contenuto (vedi funzione borsa
  // conservante nell'inventario, che aumenta la capacità di carico se equipaggiata).
  'Borsa Conservante': 7.5,
  'Guanti del Potere Orchesco': 0.5,
  'Mantello della Protezione': 1,
  'Perla del Potere': 0,
  // Pozioni e unguenti comuni (variante di quella di guarigione, stesso peso a fiala).
  'Pozione di Resistenza al Freddo': 0.25, 'Pozione di Respirare sott’Acqua': 0.25,
  'Pozione di Resistenza al Fuoco': 0.25, 'Pozione di Resistenza al Veleno': 0.25,
  'Pozione di Invisibilità': 0.25, 'Pozione di Forza del Gigante': 0.25,
  'Antitossina': 0.05, 'Unguento di Resistenza al Veleno': 0.25,
  // Pozioni di guarigione canoniche
  'Pozione di Guarigione Maggiore': 0.25, 'Pozione di Guarigione Superiore': 0.25, 'Pozione di Guarigione Suprema': 0.25,
  // Oggetti Magici iconici
  'Anello di Protezione': 0.05, 'Fascia dell’Intelletto': 0.5, 'Amuleto della Salute': 0.5, 'Bacchetta dei Dardi Incantati': 0.5,
  'Spada Fiammeggiante': 1.5, 'Mazza della Distruzione': 2, 'Pietra della Fortuna': 0.1,
  'Arma +1': 1.5, 'Arma +2': 1.5, 'Arma +3': 1.5, 'Scudo +1': 3, 'Scudo +2': 3, 'Scudo +3': 3,
  'Armatura +1': 9, 'Armatura +2': 9, 'Armatura +3': 9,
};
export const NOMI_OGGETTI = Object.keys(PESI_OGGETTI).sort((a, b) => a.localeCompare(b, 'it'));
export const PESO_ARMATURA_TIPO = { leggera: 5, media: 9, pesante: 25 };
export const LINGUE_5E = [
  'Abissale', 'Celestiale', 'Comune', 'Draconico', 'Druidico', 'Elfico',
  'Gergo dei ladri', 'Gigante', 'Gnomesco', 'Goblin', 'Halfling', 'Infernale',
  'Nanico', 'Orchesco', 'Primordiale', 'Silvano', 'Sottocomune'
];
export const STRUMENTI_5E = [
  'Arnesi da Scasso', 'Borsa da Erborista', 'Strumenti da Avvelenatore', 'Kit da Travestimento',
  'Kit da Falsario', 'Strumenti da Calligrafo', 'Attrezzi da Fabbro', 'Attrezzi da Birraio',
  'Attrezzi da Carpentiere', 'Attrezzi da Cartografo', 'Attrezzi da Calzolaio', 'Attrezzi da Cuoco',
  'Attrezzi da Vetraio', 'Attrezzi da Gioielliere', 'Attrezzi da Vasaio', 'Attrezzi da Conciatore',
  'Attrezzi da Intagliatore', 'Attrezzi da Tessitore', 'Attrezzi da Ceramista', 'Attrezzi da Muratore',
  'Attrezzi da Pittore', 'Attrezzi da Fabbro d’Armi', 'Strumenti da Navigatore', 'Set da Gioco',
  'Carte da Gioco', 'Dadi', 'Strumento Musicale', 'Cornamusa', 'Tamburo', 'Flauto', 'Liuto',
  'Lira', 'Corno', 'Zufolo', 'Veicoli (terrestri)', 'Veicoli (acquatici)',
];

export const GRUPPI_ARMI_5E = [
  {
    titolo: '🗡️ Semplici da mischia',
    voci: ['Ascia', 'Bastone ferrato', 'Clava', 'Falcetto', 'Giavellotto', 'Grande clava', 'Lancia', 'Martello leggero', 'Mazza', 'Pugnale'],
  },
  {
    titolo: '🏹 Semplici a distanza',
    voci: ['Arco corto', 'Balestra leggera', 'Dardo', 'Fionda'],
  },
  {
    titolo: '⚔️ Da guerra da mischia',
    voci: ['Alabarda', 'Ascia bipenne', 'Ascia da battaglia', 'Falcione', 'Frusta', 'Martello da guerra', 'Mazza chiodata', 'Mazzafrusto', 'Picca', 'Piccone da guerra', 'Scimitarra', 'Spada corta', 'Spada lunga', 'Spadone', 'Stocco', 'Tridente'],
  },
  {
    titolo: '🎯 Da guerra a distanza',
    voci: ['Arco lungo', 'Balestra a mano', 'Balestra pesante'],
  },
];

export const GRUPPI_STRUMENTI_5E = [
  {
    titolo: '🗝️ Speciali & Furtività',
    voci: ['Arnesi da Scasso', 'Borsa da Erborista', 'Kit da Falsario', 'Kit da Travestimento', 'Strumenti da Avvelenatore', 'Strumenti da Navigatore'],
  },
  {
    titolo: '🪕 Strumenti Musicali',
    voci: ['Cornamusa', 'Corno', 'Flauto', 'Lira', 'Liuto', 'Tamburo', 'Zufolo', 'Strumento Musicale'],
  },
  {
    titolo: '🔧 Attrezzi Artigianali',
    voci: [
      'Attrezzi da Fabbro', 'Attrezzi da Fabbro d’Armi', 'Attrezzi da Alchimista', 'Attrezzi da Falegname',
      'Attrezzi da Carpentiere', 'Attrezzi da Cuoco', 'Attrezzi da Conciatore', 'Attrezzi da Calzolaio',
      'Attrezzi da Muratore', 'Attrezzi da Birraio', 'Attrezzi da Cartografo', 'Attrezzi da Ceramista',
      'Attrezzi da Intagliatore', 'Attrezzi da Gioielliere', 'Attrezzi da Pittore', 'Attrezzi da Vetraio',
      'Attrezzi da Tessitore', 'Attrezzi da Vasaio', 'Strumenti da Calligrafo'
    ],
  },
  {
    titolo: '🎲 Set da Gioco & Veicoli',
    voci: ['Carte da gioco', 'Dadi', 'Set da gioco', 'Veicoli (terrestri)', 'Veicoli (acquatici)'],
  },
];

export const GRUPPI_LINGUE_5E = [
  {
    titolo: '📜 Lingue Standard',
    voci: ['Comune', 'Elfico', 'Gigante', 'Gnomesco', 'Goblin', 'Halfling', 'Nanico', 'Orchesco'],
  },
  {
    titolo: '🔮 Lingue Esotiche',
    voci: ['Abissale', 'Celestiale', 'Draconico', 'Infernale', 'Primordiale', 'Silvano', 'Sottocomune'],
  },
  {
    titolo: '🤫 Linguaggi Segreti',
    voci: ['Druidico', 'Gergo dei ladri'],
  },
];
export const ARMI_5E = [
  // Semplici da mischia
  { nome: 'Ascia', danno: '1d6', tipo: 'Tagliente', note: 'Leggera, Lancio (6/18 m)', maestria: 'Tormentare (Vex)' },
  { nome: 'Bastone ferrato', danno: '1d6', tipo: 'Contundente', note: 'Versatile (1d8)', maestria: 'Atterrare (Topple)' },
  { nome: 'Clava', danno: '1d4', tipo: 'Contundente', note: 'Leggera', maestria: 'Rallentare (Slow)' },
  { nome: 'Falcetto', danno: '1d4', tipo: 'Tagliente', note: 'Leggera', maestria: 'Intaccare (Nick)' },
  { nome: 'Giavellotto', danno: '1d6', tipo: 'Perforante', note: 'Lancio (9/36 m)', maestria: 'Rallentare (Slow)' },
  { nome: 'Grande clava', danno: '1d8', tipo: 'Contundente', note: 'Due mani', maestria: 'Spingere (Push)' },
  { nome: 'Lancia', danno: '1d6', tipo: 'Perforante', note: 'Lancio (6/18 m), Versatile (1d8)', maestria: 'Fiaccare (Sap)' },
  { nome: 'Martello leggero', danno: '1d4', tipo: 'Contundente', note: 'Leggera, Lancio (6/18 m)', maestria: 'Intaccare (Nick)' },
  { nome: 'Mazza', danno: '1d6', tipo: 'Contundente', note: '', maestria: 'Fiaccare (Sap)' },
  { nome: 'Pugnale', danno: '1d4', tipo: 'Perforante', note: 'Accurata, Leggera, Lancio (6/18 m)', finesse: true, maestria: 'Intaccare (Nick)' },
  // Semplici a distanza
  { nome: 'Arco corto', danno: '1d6', tipo: 'Perforante', note: 'Munizioni, Due mani (24/96 m)', ranged: true, maestria: 'Tormentare (Vex)' },
  { nome: 'Balestra leggera', danno: '1d8', tipo: 'Perforante', note: 'Munizioni, Caricamento, Due mani (24/96 m)', ranged: true, maestria: 'Rallentare (Slow)' },
  { nome: 'Dardo', danno: '1d4', tipo: 'Perforante', note: 'Accurata, Lancio (6/18 m)', finesse: true, ranged: true, maestria: 'Tormentare (Vex)' },
  { nome: 'Fionda', danno: '1d4', tipo: 'Contundente', note: 'Munizioni (9/36 m)', ranged: true, maestria: 'Rallentare (Slow)' },
  // Da guerra da mischia
  { nome: 'Alabarda', danno: '1d10', tipo: 'Tagliente', note: 'Pesante, Portata, Due mani', maestria: 'Fendente (Cleave)' },
  { nome: 'Ascia bipenne', danno: '1d12', tipo: 'Tagliente', note: 'Pesante, Due mani', maestria: 'Fendente (Cleave)' },
  { nome: 'Ascia da battaglia', danno: '1d8', tipo: 'Tagliente', note: 'Versatile (1d10)', maestria: 'Atterrare (Topple)' },
  { nome: 'Falcione', danno: '1d10', tipo: 'Tagliente', note: 'Pesante, Portata, Due mani', maestria: 'Sfiorare (Graze)' },
  { nome: 'Frusta', danno: '1d4', tipo: 'Tagliente', note: 'Accurata, Portata', finesse: true, maestria: 'Rallentare (Slow)' },
  { nome: 'Martello da guerra', danno: '1d8', tipo: 'Contundente', note: 'Versatile (1d10)', maestria: 'Spingere (Push)' },
  { nome: 'Mazzafrusto', danno: '1d8', tipo: 'Contundente', note: '', maestria: 'Fiaccare (Sap)' },
  { nome: 'Mazza chiodata', danno: '1d8', tipo: 'Perforante', note: '', maestria: 'Fiaccare (Sap)' },
  { nome: 'Picca', danno: '1d10', tipo: 'Perforante', note: 'Pesante, Portata, Due mani', maestria: 'Spingere (Push)' },
  { nome: 'Piccone da guerra', danno: '1d8', tipo: 'Perforante', note: '', maestria: 'Fiaccare (Sap)' },
  { nome: 'Scimitarra', danno: '1d6', tipo: 'Tagliente', note: 'Accurata, Leggera', finesse: true, maestria: 'Intaccare (Nick)' },
  { nome: 'Spada corta', danno: '1d6', tipo: 'Perforante', note: 'Accurata, Leggera', finesse: true, maestria: 'Tormentare (Vex)' },
  { nome: 'Spada lunga', danno: '1d8', tipo: 'Tagliente', note: 'Versatile (1d10)', maestria: 'Fiaccare (Sap)' },
  { nome: 'Spadone', danno: '2d6', tipo: 'Tagliente', note: 'Pesante, Due mani', maestria: 'Sfiorare (Graze)' },
  { nome: 'Stocco', danno: '1d8', tipo: 'Perforante', note: 'Accurata', finesse: true, maestria: 'Tormentare (Vex)' },
  { nome: 'Tridente', danno: '1d8', tipo: 'Perforante', note: 'Lancio (6/18 m), Versatile (1d10)', maestria: 'Atterrare (Topple)' },
  // Da guerra a distanza
  { nome: 'Arco lungo', danno: '1d8', tipo: 'Perforante', note: 'Munizioni, Pesante, Due mani (45/180 m)', ranged: true, maestria: 'Rallentare (Slow)' },
  { nome: 'Balestra a mano', danno: '1d6', tipo: 'Perforante', note: 'Leggera, Munizioni, Caricamento (9/36 m)', ranged: true, maestria: 'Tormentare (Vex)' },
  { nome: 'Balestra pesante', danno: '1d10', tipo: 'Perforante', note: 'Munizioni, Pesante, Caricamento, Due mani (30/120 m)', ranged: true, maestria: 'Spingere (Push)' },
];

export const REAZIONI_5E = [
  // Incantesimi di reazione
  { nome: 'Scudo', tipo: 'incantesimo', danno: '', tipoDanno: '', note: '+5 CA fino al prossimo turno, annulla Dardo Incantato' },
  { nome: 'Controincantesimo', tipo: 'incantesimo', danno: '', tipoDanno: '', note: 'Interrompi incantesimo entro 18 m (auto fino al 3° liv.)' },
  { nome: 'Caduta Morbida', tipo: 'incantesimo', danno: '', tipoDanno: '', note: 'Fino a 5 creature: riduce danni da caduta di 1d4×10' },
  { nome: 'Rappresaglia Infernale', tipo: 'incantesimo', danno: '2d10', tipoDanno: 'Fuoco', note: 'TS Destrezza per metà quando subisci danni' },
  { nome: 'Assorbire Elementi', tipo: 'incantesimo', danno: '1d6', tipoDanno: 'Elementale', note: 'Resistenza al danno elementale + 1d6 al prossimo attacco' },
  { nome: 'Parola di Ritorno', tipo: 'incantesimo', danno: '', tipoDanno: '', note: 'Forza a ritirare un d20 e dona vantaggio a un alleato' },
  
  // Reazioni fisiche, privilegi e manovre
  { nome: 'Attacco di Opportunità', tipo: 'tattica', danno: '1d8', tipoDanno: 'Da arma', note: 'Reazione quando un nemico esce dalla portata' },
  { nome: 'Schivata Prodigiosa', tipo: 'privilegio', danno: '', tipoDanno: '', note: 'Dimezza i danni di un attacco che ti colpisce' },
  { nome: 'Deviare Proiettili', tipo: 'privilegio', danno: '1d10', tipoDanno: '', note: 'Riduci danni a distanza di 1d10 + Des + Livello Monaco' },
  { nome: 'Parata', tipo: 'manovra', danno: '1d8', tipoDanno: '', note: 'Riduci i danni in mischia con dado superiorità + Des' },
  { nome: 'Intercettare', tipo: 'stile', danno: '1d10', tipoDanno: '', note: 'Riduci danni a un alleato entro 1,5 m di 1d10 + Comp' },
  { nome: 'Protezione', tipo: 'stile', danno: '', tipoDanno: '', note: 'Imponi svantaggio a un attacco contro alleato vicino con scudo' },
  { nome: 'Sentinella', tipo: 'talento', danno: '1d8', tipoDanno: '', note: 'Attacco contro chi colpisce un alleato vicino' },
  { nome: 'Parole Taglienti', tipo: 'privilegio', danno: '1d6', tipoDanno: '', note: 'Sottrai dado Ispirazione Bardica al tiro del nemico' },
  { nome: 'Bagliore Protettivo', tipo: 'privilegio', danno: '', tipoDanno: '', note: 'Imponi svantaggio a chi ti attacca con luce divina' },
  { nome: 'Ritorsione', tipo: 'privilegio', danno: '1d12', tipoDanno: '', note: 'Attacca chi ti ferisce in mischia' },
  { nome: 'Fuga Nebbiosa', tipo: 'privilegio', danno: '', tipoDanno: '', note: 'Teletrasporto e invisibilità quando subisci danni' },
];

export const AZIONI_BONUS_5E = [
  // Combattimento e armi
  { nome: 'Attacco con Seconda Arma', tipo: 'combattimento', danno: '1d6', tipoDanno: 'Da arma', note: 'Azione bonus con arma leggera nella mano secondaria' },
  { nome: 'Colpo di Scudo', tipo: 'talento', danno: '', tipoDanno: '', note: 'Spingi o atterra una creatura entro 1,5 m' },
  { nome: 'Colpo con Asta', tipo: 'talento', danno: '1d4', tipoDanno: 'Contundente', note: 'Attacco con l\'estremità opposta dell\'asta' },
  { nome: 'Attacco Disarmato Bonus', tipo: 'privilegio', danno: '1d6', tipoDanno: 'Contundente', note: 'Colpo senz\'armi come azione bonus dopo un attacco' },
  { nome: 'Raffica di Colpi', tipo: 'privilegio', danno: '2d6', tipoDanno: 'Contundente', note: '2 colpi senz\'armi spendendo 1 punto Focus/Ki' },

  // Incantesimi azione bonus
  { nome: 'Arma Spirituale', tipo: 'incantesimo', danno: '1d8', tipoDanno: 'Forza', note: 'Attacco magico a distanza (18 m) come azione bonus' },
  { nome: 'Parola Guaritrice', tipo: 'incantesimo', danno: '1d4', tipoDanno: 'Guarigione', note: 'Cura 1d4 + mod a distanza (18 m) come azione bonus' },
  { nome: 'Passo Velato', tipo: 'incantesimo', danno: '', tipoDanno: '', note: 'Teletrasporto fino a 9 m in uno spazio visibile' },
  { nome: 'Marchio del Cacciatore', tipo: 'incantesimo', danno: '1d6', tipoDanno: 'Forza', note: '+1d6 danni a ogni colpo sul bersaglio marcato' },
  { nome: 'Maledizione', tipo: 'incantesimo', danno: '1d6', tipoDanno: 'Necrotico', note: '+1d6 danni necrotici e svantaggio alle prove' },
  { nome: 'Punizione Divina', tipo: 'incantesimo', danno: '2d8', tipoDanno: 'Radioso', note: 'Azione bonus dopo aver colpito un bersaglio' },
  { nome: 'Punizione Tonante', tipo: 'incantesimo', danno: '2d6', tipoDanno: 'Tuono', note: 'Spinge di 3 m e atterra (TS Forza)' },
  { nome: 'Punizione Infuocata', tipo: 'incantesimo', danno: '1d6', tipoDanno: 'Fuoco', note: 'Brucia il bersaglio a ogni turno' },
  { nome: 'Punizione Iridescente', tipo: 'incantesimo', danno: '1d6', tipoDanno: 'Psichico', note: 'Spaventa il bersaglio (TS Saggezza)' },

  // Privilegi di classe
  { nome: 'Ira Barbarica', tipo: 'privilegio', danno: '', tipoDanno: '', note: 'Resistenza ai danni e bonus danni in mischia' },
  { nome: 'Ispirazione Bardica', tipo: 'privilegio', danno: '1d6', tipoDanno: '', note: 'Dona un dado Ispirazione a un alleato entro 18 m' },
  { nome: 'Azione Scaltra', tipo: 'privilegio', danno: '', tipoDanno: '', note: 'Scatto, disimpegno o furtività come azione bonus' },
  { nome: 'Recuperare Energie', tipo: 'privilegio', danno: '1d10', tipoDanno: 'Guarigione', note: 'Recuperi 1d10 + livello da Guerriero in PF' },
  { nome: 'Forma Selvatica', tipo: 'privilegio', danno: '', tipoDanno: '', note: 'Trasformazione in bestia come azione bonus' },
  { nome: 'Stregoneria Innata', tipo: 'privilegio', danno: '', tipoDanno: '', note: '+1 CD e vantaggio ai tiri per colpire' },
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
  'Circolo del Pastore': { 2: 'Lingua dei Boschi\nTotem Spirituale', 6: 'Evocatore Possente', 10: 'Spirito Guardiano', 14: 'Evocazioni Fedeli' },
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

  // --- ARTEFICE (3, 5, 9, 15) ---
  'Alchimista': { 3: 'Competenza: arnesi da alchimista, elisir sperimentale\nIncantesimi: parola guaritrice, raggio di infermità', 5: 'Padronanza alchemica (+INT a cure/danni acido/fuoco/necrotico/veleno)', 9: 'Ricostituente prodigioso (PF temp da elisir)', 15: 'Purezza chimica (resistenze veleno/acido, immunità ad avvelenato)' },
  'Armaiolo': { 3: 'Competenza: armature pesanti\nArmatura arcana (focus magico, no requisiti Forza)\nModello Guardiano o Infiltratore', 5: 'Attacco extra', 9: 'Modifiche all’armatura (4 parti infondibili, +2 infusioni)', 15: 'Armatura perfetta' },
  'Artigliere': { 3: 'Competenza: arnesi da intagliatore\nIncantesimi: scudo, dardo tracciante\nCannone arcano (Lanciafiamme, Balista, Protettore)', 5: 'Arma da fuoco arcana (+1d8 danni agli incantesimi)', 9: 'Posizione esplosiva', 15: 'Cannoni fortificati (mezza copertura, 2 cannoni)' },
  'Fabbro da Guerra': { 3: 'Competenza: armi da guerra\nPronto alla battaglia (INT per colpire e danni)\nDifensore d’acciaio (fedele costrutto da combattimento)', 5: 'Attacco extra', 9: 'Colpo arcano (2d6 forza extra o cura 2d6)', 15: 'Difensore migliorato (colpo arcano 4d6, +2 CA difensore)' },
};

export const CARATT_INCANTATORE = {
  bardo: 'carisma', stregone: 'carisma', warlock: 'carisma', paladino: 'carisma',
  chierico: 'saggezza', druido: 'saggezza', ranger: 'saggezza',
  mago: 'intelligenza', artefice: 'intelligenza',
};

// "Terzo incantatore": Guerriero con Cavaliere Mistico e Ladro con Mistificatore
// Arcano lanciano incantesimi da Mago (Intelligenza) con una progressione tutta
// loro, più lenta di un mezzo incantatore — ma SOLO con quella sottoclasse
// specifica, non l'intera classe. Attivo dal 3° livello (dove si sceglie la
// sottoclasse), fino a incantesimi di 4° livello al 19°.
export const SOTTOCLASSE_TERZO_CASTER = {
  guerriero: 'Cavaliere Mistico',
  ladro: 'Mistificatore Arcano',
};
// Scuole a cui la scelta è ristretta nella 5.0 (2014); nella 5.5 (2024) la
// restrizione è stata rimossa e si accede all'intera lista del Mago.
export const SCUOLE_TERZO_CASTER_2014 = {
  guerriero: ['Abiurazione', 'Evocazione'],
  ladro: ['Ammaliamento', 'Illusione'],
};
// Slot incantesimo del terzo incantatore (identica in 5.0 e 5.5), per livello.
export const SLOT_TERZO_CASTER = {
  3: [2], 4: [3], 5: [3], 6: [3], 7: [4, 2], 8: [4, 2], 9: [4, 2],
  10: [4, 3], 11: [4, 3], 12: [4, 3], 13: [4, 3, 2], 14: [4, 3, 2], 15: [4, 3, 2],
  16: [4, 3, 3], 17: [4, 3, 3], 18: [4, 3, 3], 19: [4, 3, 3, 1], 20: [4, 3, 3, 1],
};
// Incantesimi di 1° livello o superiore conosciuti (indice 0 = liv. personaggio 1).
export const INC_MAX_TERZO = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];
// Trucchetti dal Mago conosciuti dal 3° livello (secondo valore dal 10°): il
// Mistificatore Arcano include Mano Magica in più rispetto al Cavaliere Mistico.
export const TRUCCHETTI_TERZO_CASTER = { guerriero: [2, 3], ladro: [3, 4] };
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
  artefice: ['intelligenza', 'costituzione', 'destrezza', 'saggezza', 'forza', 'carisma'],
};
export const DADO_VITA_CLASSE = {
  barbaro: 12,
  guerriero: 10, paladino: 10, ranger: 10,
  bardo: 8, chierico: 8, druido: 8, ladro: 8, monaco: 8, stregone: 8, warlock: 8, artefice: 8,
  mago: 6,
};
export const BACKGROUND_TALENTO_ORIGINE_2024 = {
  'Accolito': 'Iniziato alla Magia',
  'Artigiano': 'Artigiano',
  'Ciarlatano': 'Abile',
  'Contadino': 'Robusto',
  'Criminale': 'Allerta',
  'Eremita': 'Guaritore',
  'Guardia': 'Allerta',
  'Guida': 'Iniziato alla Magia',
  'Intrattenitore': 'Musicista',
  'Marinaio': 'Condottiero',
  'Mercante': 'Fortunato',
  'Nobile': 'Abile',
  'Saggio': 'Iniziato alla Magia',
  'Scriba': 'Abile',
  'Soldato': 'Mente Rapida',
  'Viandante': 'Fortunato',
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
  stregone: ['costituzione', 'carisma'], warlock: ['saggezza', 'carisma'], artefice: ['costituzione', 'intelligenza'],
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
  artefice: { armature: { leggera: true, media: true, pesante: false, scudi: true }, armi: 'Armi semplici e balestre' },
};
export const MULTICLASSE_REQUISITI_5E = {
  barbaro: 'FOR 13',
  bardo: 'CAR 13',
  chierico: 'SAG 13',
  druido: 'SAG 13',
  guerriero: 'FOR 13 o DES 13',
  ladro: 'DES 13',
  mago: 'INT 13',
  monaco: 'DES 13 e SAG 13',
  paladino: 'FOR 13 e CAR 13',
  ranger: 'DES 13 e SAG 13',
  stregone: 'CAR 13',
  warlock: 'CAR 13',
  artefice: 'INT 13',
};

export const MULTICLASSE_COMPETENZE_5E = {
  barbaro: {
    armature: { scudi: true },
    armi: 'Armi semplici, Armi da guerra',
    desc: 'Scudi, Armi semplici e da guerra',
    descEn: 'Shields, Simple weapons, Martial weapons',
  },
  bardo: {
    armature: { leggera: true },
    strumenti: 'Un qualsiasi strumento musicale',
    abilita: '1 abilità a scelta',
    desc: 'Armature leggere, 1 abilità a scelta, 1 strumento musicale',
    descEn: 'Light armor, 1 skill of your choice, 1 musical instrument',
  },
  chierico: {
    armature: { leggera: true, media: true, scudi: true },
    desc: 'Armature leggere, Medie, Scudi',
    descEn: 'Light armor, Medium armor, Shields',
  },
  druido: {
    armature: { leggera: true, media: true, scudi: true },
    strumenti: 'Borsa da erborista',
    desc: 'Armature leggere, Medie, Scudi, Borsa da erborista',
    descEn: 'Light armor, Medium armor, Shields, Herbalism kit',
  },
  guerriero: {
    armature: { leggera: true, media: true, scudi: true },
    armi: 'Armi semplici, Armi da guerra',
    desc: 'Armature leggere, Medie, Scudi, Armi semplici e da guerra',
    descEn: 'Light armor, Medium armor, Shields, Simple and martial weapons',
  },
  ladro: {
    armature: { leggera: true },
    strumenti: 'Arnesi da scasso',
    abilita: '1 abilità dalla lista del ladro',
    desc: 'Armature leggere, 1 abilità dalla lista del Ladro, Arnesi da scasso',
    descEn: 'Light armor, 1 skill from Rogue list, Thieves’ tools',
  },
  mago: {
    desc: 'Nessuna competenza aggiuntiva in armature o armi',
    descEn: 'No additional armor or weapon proficiencies',
  },
  monaco: {
    armi: 'Armi semplici, Spada corta',
    desc: 'Armi semplici, Spada corta',
    descEn: 'Simple weapons, Shortswords',
  },
  paladino: {
    armature: { leggera: true, media: true, scudi: true },
    armi: 'Armi semplici, Armi da guerra',
    desc: 'Armature leggere, Medie, Scudi, Armi semplici e da guerra',
    descEn: 'Light armor, Medium armor, Shields, Simple and martial weapons',
  },
  ranger: {
    armature: { leggera: true, media: true, scudi: true },
    armi: 'Armi semplici, Armi da guerra',
    abilita: '1 abilità dalla lista del ranger',
    desc: 'Armature leggere, Medie, Scudi, Armi semplici e da guerra, 1 abilità dalla lista del Ranger',
    descEn: 'Light armor, Medium armor, Shields, Simple and martial weapons, 1 skill from Ranger list',
  },
  stregone: {
    desc: 'Nessuna competenza aggiuntiva in armature o armi',
    descEn: 'No additional armor or weapon proficiencies',
  },
  warlock: {
    armature: { leggera: true },
    armi: 'Armi semplici',
    desc: 'Armature leggere, Armi semplici',
    descEn: 'Light armor, Simple weapons',
  },
  artefice: {
    armature: { leggera: true, media: true, scudi: true },
    strumenti: 'Arnesi da ladro, arnesi da inventore',
    desc: 'Armature leggere e medie, scudi, arnesi da ladro e inventore',
    descEn: 'Light and medium armor, shields, thieves\' and tinker\'s tools',
  },
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
  artefice: { numero: 2, lista: ['arcano', 'storia', 'indagare', 'medicina', 'natura', 'percezione', 'rapiditaDiMano'] },
};
export const PRIVILEGI_CLASSE_L1 = {
  barbaro: 'Ira\nDifesa senza armatura (CA = 10 + DES + COS)\nMaestria nelle armi',
  bardo: 'Lancio di incantesimi (Carisma)\nIspirazione bardica (d6)',
  chierico: 'Lancio di incantesimi (Saggezza)\nOrdine divino (Protettore o Taumaturgo)',
  druido: 'Lancio di incantesimi (Saggezza)\nOrdine primordiale\nLinguaggio druidico',
  guerriero: 'Stile di combattimento\nRecuperare energie (azione bonus)\nMaestria nelle armi',
  ladro: 'Attacco furtivo (1d6)\nMaestria (doppia competenza in 2 abilità)\nGergo ladresco\nMaestria nelle armi',
  mago: 'Lancio di incantesimi (Intelligenza)\nRecupero arcano\nAdepto dei rituali',
  monaco: 'Arti marziali\nDifesa senza armatura (CA = 10 + DES + SAG)',
  paladino: 'Imposizione delle mani (cura 5 × livello)\nLancio di incantesimi (Carisma)\nMaestria nelle armi',
  ranger: 'Lancio di incantesimi (Saggezza)\nNemico favorito\nEsploratore provetto\nMaestria nelle armi',
  stregone: 'Lancio di incantesimi (Carisma)\nStregoneria innata',
  warlock: 'Magia del patto (Carisma)\nPatrono ultraterreno\nSuppliche occulte (invocazioni)',
  artefice: 'Bricolage magico (Magical Tinkering)\nLancio di incantesimi (Intelligenza)',
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
  artefice: 'Bricolage magico (Magical Tinkering)\nLancio di incantesimi (Intelligenza)',
};
export const PRIVILEGI_CLASSE_LIV = {
  barbaro: {
    2: 'Attacco irruento\nPercezione del pericolo',
    3: 'Conoscenza primordiale',
    5: 'Attacco extra\nMovimento veloce (+3 m)',
    7: 'Istinto ferino\nBalzo istintivo',
    9: 'Colpo brutale',
    11: 'Ira implacabile',
    13: 'Colpo brutale migliorato',
    15: 'Ira persistente',
    17: 'Colpo brutale migliorato (2 effetti, 2d10)',
    18: 'Forza indomabile',
    20: 'Campione primordiale (+4 FOR e COS, max 25)',
  },
  bardo: {
    2: 'Competenza (2 abilità)\nFactotum (metà competenza)',
    5: "Fonte d'ispirazione\nIspirazione bardica d8",
    7: 'Controincantesimo',
    9: 'Competenza (altre 2 abilità)',
    10: 'Segreti magici\nIspirazione bardica d10',
    15: 'Ispirazione bardica d12',
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
    5: 'Rinascita selvatica',
    7: 'Furia elementale',
    15: 'Furia elementale migliorata',
    18: 'Incantesimi bestiali',
    20: 'Arcidruido',
  },
  guerriero: {
    2: 'Azione impetuosa\nMente tattica',
    5: 'Attacco extra\nSpostamento tattico',
    9: 'Indomito\nMaestro tattico',
    11: 'Due attacchi extra (3 attacchi totali)',
    13: 'Indomito (2 usi)\nAttacchi studiati',
    17: 'Azione impetuosa (2 usi)\nIndomito (3 usi)',
    20: 'Tre attacchi extra (4 attacchi totali)',
  },
  ladro: {
    2: 'Azione scaltra',
    3: 'Mira stabile',
    5: 'Colpo scaltro\nSchivata prodigiosa',
    6: 'Competenze aggiuntive',
    7: 'Elusione\nTalento affidabile',
    11: 'Colpo scaltro migliorato',
    14: 'Colpi insidiosi',
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
    2: 'Fonte di magia (Punti stregoneria)\nMetamagia (2 opzioni)',
    5: 'Recupero stregonesco',
    7: 'Stregoneria incarnata',
    10: 'Metamagia (2 opzioni aggiuntive)',
    17: 'Metamagia (2 opzioni aggiuntive)',
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
  artefice: {
    2: 'Infondere oggetti (Infuse Item)',
    3: 'Specializzazione dell’artefice\nCompetenza negli strumenti',
    6: 'Competenza negli strumenti (Raddoppiata)',
    7: 'Lampo d’ingegno (Flash of Genius)',
    10: 'Adepto degli oggetti magici',
    11: 'Oggetto conserva-incantesimi',
    14: 'Specialista degli oggetti magici',
    18: 'Maestro degli oggetti magici',
    20: 'Anima dell’artefice (Soul of Artifice)',
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
    6: 'Competenze aggiuntive',
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
    2: 'Stile di combattimento\nLancio di incantesimi (Carisma)\nPunizione divina',
    3: 'Salute divina',
    5: 'Attacco extra',
    6: 'Aura di protezione',
    10: 'Aura di coraggio',
    11: 'Punizione divina migliorata',
    14: 'Tocco purificante',
    18: 'Aure (raggio 9 m)',
  },
  ranger: {
    2: 'Stile di combattimento\nLancio di incantesimi (Saggezza)',
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
    3: 'Metamagia (2 opzioni)',
    10: 'Metamagia (1 opzione aggiuntiva)',
    17: 'Metamagia (1 opzione aggiuntiva)',
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
  artefice: {
    2: 'Infondere oggetti (Infuse Item)',
    3: 'Specializzazione dell’artefice\nCompetenza negli strumenti',
    6: 'Competenza negli strumenti (Raddoppiata)',
    7: 'Lampo d’ingegno (Flash of Genius)',
    10: 'Adepto degli oggetti magici',
    11: 'Oggetto conserva-incantesimi',
    14: 'Specialista degli oggetti magici',
    18: 'Maestro degli oggetti magici',
    20: 'Anima dell’artefice (Soul of Artifice)',
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
  artefice: [3, 5, 9, 15],
};
export const SOTTOCLASSE_LIV_2014 = {
  barbaro: [3, 6, 10, 14], bardo: [3, 6, 14], chierico: [1, 2, 6, 8, 17],
  druido: [2, 6, 10, 14], guerriero: [3, 7, 10, 15, 18], ladro: [3, 9, 13, 17],
  mago: [2, 6, 10, 14], monaco: [3, 6, 11, 17], paladino: [3, 7, 15, 20],
  ranger: [3, 7, 11, 15], stregone: [1, 6, 14, 18], warlock: [1, 6, 10, 14],
  artefice: [3, 5, 9, 15],
};
export const COMPETENZE_SPECIE = {
  // Chiave = lista di SPECIE_5E; 'tutte' = qualsiasi abilità (Umano, Mezzelfo).
  Elfo: { numero: 1, lista: ['intuizione', 'percezione', 'sopravvivenza'], tratto: 'Sensi Acuti' },
  Umano: { numero: 1, lista: 'tutte', tratto: 'Abile' },
  Mezzelfo: { numero: 2, lista: 'tutte', tratto: 'Versatilità' },
  Mezzorco: { numero: 1, lista: ['intimidire'], tratto: 'Minaccioso' },
};
export const NOMI_SPECIE_GENERE = {
  elfo: {
    maschio: [
      'Aelar', 'Erevan', 'Sylvaris', 'Lithael', 'Aramil', 'Vaeril', 'Adran', 'Aust', 'Beiro', 'Berrian',
      'Carric', 'Dayereth', 'Enialis', 'Erdan', 'Galinndan', 'Hadarai', 'Heian', 'Himo', 'Immeral', 'Ivellios',
      'Laucian', 'Mindartis', 'Paelias', 'Peren', 'Quarion', 'Riardon', 'Rolen', 'Soveliss', 'Thamior', 'Tharivol',
      'Varis', 'Drizzt', 'Jarlaxle', 'Zaknafein', 'Pharaun', 'Gromph', 'Vaelion', 'Celeborn', 'Fëanor', 'Legolas',
      'Elrond', 'Thranduil', 'Alluin', 'Sylas', 'Theron', 'Zephyr', 'Faelar', 'Kaelen',
    ],
    femmina: [
      'Faelyn', 'Thalindra', 'Miriel', 'Caelynn', 'Naivara', 'Enna', 'Adrie', 'Althaea', 'Anastrianna', 'Andraste',
      'Antinua', 'Bethrynna', 'Birel', 'Drusilia', 'Felosial', 'Ielenia', 'Jelenneth', 'Keyleth', 'Leshanna', 'Lia',
      'Meriele', 'Mialee', 'Quelenna', 'Quillathe', 'Sariel', 'Shanairra', 'Shava', 'Silaqui', 'Theirastra', 'Thia',
      'Vadania', 'Valanthe', 'Xanaphia', 'Viconia', 'Liriel', 'Malice', 'Ilyrana', 'Tauriel', 'Aranel', 'Galadriel',
      'Morwen', 'Nyxaris',
    ],
  },
  nano: {
    maschio: [
      'Durgan', 'Baldrek', 'Grunnar', 'Kildrak', 'Dwalin', 'Morgrym', 'Rurik', 'Adrik', 'Alberich', 'Baern',
      'Barendd', 'Brottor', 'Bruenor', 'Dain', 'Darrak', 'Delg', 'Eberk', 'Einkil', 'Fargrim', 'Flint',
      'Gardain', 'Gimli', 'Harbek', 'Krag', 'Morgran', 'Orsik', 'Oskar', 'Rangrim', 'Rustik', 'Taklinn',
      'Thoradin', 'Thorin', 'Thorik', 'Thror', 'Tordek', 'Traubon', 'Travok', 'Ulfgar', 'Veit', 'Vondal',
      'Bofur', 'Bombur', 'Balin', 'Gloin', 'Oin', 'Dori', 'Nori', 'Ori', 'Magni', 'Muradin',
      'Brann', 'Thorbardin', 'Grumbar', 'Korgan', 'Dwommar', 'Khazad', 'Skorri', 'Gundrik', 'Hrolf', 'Ironbeard',
    ],
    femmina: [
      'Thora', 'Helga', 'Barundra', 'Vistra', 'Kaddra', 'Amber', 'Artin', 'Audhild', 'Bardryn', 'Dagnal',
      'Diesa', 'Eldeth', 'Falkrunn', 'Finellen', 'Gunnloda', 'Gurdis', 'Helja', 'Hlin', 'Kathra', 'Kristryd',
      'Ilde', 'Liftrasa', 'Mardred', 'Riswynn', 'Sannl', 'Torbera', 'Torgga', 'Brimla', 'Dala', 'Kitta',
      'Marna', 'Morga', 'Runia', 'Svala', 'Therra', 'Valka', 'Brynja', 'Gerta', 'Hulda', 'Signe',
    ],
  },
  orco: {
    maschio: [
      'Grosh', 'Karg', 'Mogru', 'Thurgok', 'Renk', 'Dragok', 'Yarzol', 'Romok', 'Dench', 'Feng',
      'Gell', 'Henk', 'Holg', 'Imsh', 'Keth', 'Krusk', 'Mhurren', 'Ront', 'Shump', 'Thokk',
      'Gorrok', 'Azmog', 'Gorgar', 'Morgok', 'Kragh', 'Brak', 'Dorn', 'Grimnak', 'Horgar', 'Jarg',
      'Krog', 'Lugnut', 'Murg', 'Narsh', 'Ogg', 'Rokk', 'Skarr', 'Torg', 'Ulgor', 'Vark',
      'Wurg', 'Zark', 'Zorath', 'Urghat', 'Grishnakh', 'Ugluk', 'Azog', 'Bolg', 'Durotan', 'Thrall',
      'Garrosh', 'Grommash', 'Orgrim',
    ],
    femmina: [
      'Ushka', 'Grukka', 'Vola', 'Shautha', 'Baggi', 'Emen', 'Engong', 'Kansif', 'Myev', 'Neega',
      'Ovak', 'Ownka', 'Sutha', 'Volen', 'Yevelda', 'Gora', 'Karga', 'Mogra', 'Raka', 'Thoka',
      'Brakka', 'Durna', 'Grima', 'Hurga', 'Jarka', 'Kroga', 'Mura', 'Roka', 'Skarra', 'Torga',
    ],
  },
  umano: {
    maschio: [
      'Aldric', 'Marcus', 'Gareth', 'Rowan', 'Corin', 'Emeric', 'Alistair', 'Valerius', 'Julian', 'Roderick',
      'Tristan', 'Sean', 'Roland', 'Victor', 'Conrad', 'Lucas', 'Derek', 'Gabriel', 'Arthur', 'Galahad',
      'Lancelot', 'Gawain', 'Percival', 'Bors', 'Brandon', 'Caelan', 'Darian', 'Edric', 'Godric', 'Lorcan',
      'Theron', 'Kaelen', 'Dante', 'Vito', 'Alessio', 'Federico', 'Gennaro', 'Leonardo', 'Massimo', 'Matteo',
      'Raffaele', 'Talon', 'Baelor', 'Gendry', 'Jorah', 'Stannis', 'Davos', 'Lyrian', 'Vael', 'Wendell',
    ],
    femmina: [
      'Elena', 'Sera', 'Lyra', 'Mira', 'Talia', 'Dara', 'Cassandra', 'Vivienne', 'Leona', 'Morgana',
      'Diana', 'Helena', 'Beatrice', 'Evelyn', 'Sophia', 'Fiona', 'Guinevere', 'Iseult', 'Isolde', 'Yvaine',
      'Althea', 'Brigid', 'Cordelia', 'Elowen', 'Gwen', 'Morrigan', 'Rhiannon', 'Rowena', 'Adriana', 'Chiara',
      'Ginevra', 'Livia', 'Lucia', 'Silvia', 'Valeria', 'Vittoria', 'Brienne', 'Lyanna', 'Catelyn', 'Arya',
    ],
  },
  tiefling: {
    maschio: [
      'Malakar', 'Vex', 'Karrin', 'Mordai', 'Sered', 'Barakas', 'Akmenos', 'Amnon', 'Damakos', 'Ekemon',
      'Iados', 'Kairon', 'Leucis', 'Melech', 'Morthos', 'Pelaios', 'Skamos', 'Therai', 'Azazel', 'Belial',
      'Mephistopheles', 'Baal', 'Hellion', 'Ignis', 'Pyre', 'Obsidian', 'Brimstone',
    ],
    femmina: [
      'Nyx', 'Ember', 'Damaia', 'Kallista', 'Akta', 'Rieta', 'Anakis', 'Bryseis', 'Criella', 'Ea',
      'Lerissa', 'Makaria', 'Nemeia', 'Orianna', 'Phelaia', 'Lilith', 'Morrigan', 'Ravana', 'Kali', 'Asmodea',
      'Malice', 'Hellion', 'Arte', 'Hope', 'Poetry', 'Music', 'Reverence',
    ],
  },
  drago: {
    maschio: [
      'Rhogar', 'Balasar', 'Nadarr', 'Pandjed', 'Arjhan', 'Torinn', 'Kriv', 'Bharash', 'Donaar', 'Ghesh',
      'Heskan', 'Medrash', 'Mehen', 'Patrin', 'Shamash', 'Shedinn', 'Tarhun', 'Ancalagon', 'Smaug', 'Glaurung',
      'Balerion', 'Caraxes', 'Vermithrax', 'Draco', 'Bahamut', 'Pyroth', 'Drakar', 'Khorvash', 'Zarkon', 'Gorvath',
      'Sarkhan', 'Vrak', 'Tyrannus', 'Vyrm', 'Aurelion', 'Caelum', 'Zephyros', 'Eldarion',
    ],
    femmina: [
      'Kava', 'Sora', 'Mishann', 'Farideh', 'Harann', 'Akra', 'Biri', 'Daar', 'Havilar', 'Jheri',
      'Korinn', 'Nala', 'Perra', 'Raiann', 'Surina', 'Thava', 'Uadjit', 'Vhagar', 'Tiamat', 'Scaleshield',
      'Flametongue',
    ],
  },
  gnomo: {
    maschio: [
      'Fizwick', 'Namfudl', 'Roondar', 'Bimble', 'Dabbek', 'Zook', 'Boddynock', 'Dimble', 'Fonkin', 'Gimble',
      'Gribble', 'Kellen', 'Namfoodle', 'Orryn', 'Seebo', 'Sindri', 'Warryn', 'Wrenn', 'Cogsworth', 'Tinkertop',
      'Sprocket', 'Gearloose', 'Clockwise', 'Pinchpenny', 'Copperkettle', 'Gimbal', 'Fizban', 'Alston', 'Alvyn', 'Brocc',
      'Burgell', 'Eldon', 'Erky', 'Gerd', 'Jebeddo', 'Pebble', 'Pip', 'Rondel', 'Tink', 'Wiggle',
      'Whistle', 'Zib', 'Zapper', 'Fizzle', 'Sparky', 'Gasket', 'Widget', 'Spring', 'Ratchet',
    ],
    femmina: [
      'Ella', 'Wren', 'Nissa', 'Ellywick', 'Lorra', 'Bimpnottin', 'Breena', 'Caramip', 'Carlin', 'Donella',
      'Ellyjobell', 'Lilli', 'Loopmottin', 'Lorilla', 'Mardnab', 'Nyx', 'Oda', 'Orla', 'Roywyn', 'Shamil',
      'Tana', 'Waywocket', 'Zanna', 'Bebop', 'Whirly', 'Quirke',
    ],
  },
  halfling: {
    maschio: [
      'Milo', 'Pip', 'Cade', 'Finnan', 'Corrin', 'Osborn', 'Alton', 'Ander', 'Bernie', 'Bobbin',
      'Drogo', 'Eldon', 'Errich', 'Garrett', 'Lindal', 'Lyle', 'Merric', 'Perrin', 'Reed', 'Roscoe',
      'Samwise', 'Frodo', 'Bilbo', 'Peregrin', 'Meriadoc', 'Wellby', 'Werry', 'Wilby', 'Gaffer', 'Hobbie',
      'Mungo', 'Pippin', 'Robin', 'Tobias', 'Wilibald', 'Zaccheus',
    ],
    femmina: [
      'Rosanna', 'Wenna', 'Lidda', 'Nedda', 'Seraphina', 'Verna', 'Bree', 'Callie', 'Cora', 'Euphemia',
      'Jillian', 'Kithri', 'Lavinia', 'Merla', 'Paela', 'Portia', 'Shaena', 'Sylvie', 'Tansy', 'Tarragon',
      'Teagan', 'Tilly', 'Trym', 'Vani', 'Bramble', 'Poppy', 'Primula', 'Rose',
    ],
  },
  aasimar: {
    maschio: [
      'Seraphel', 'Cael', 'Lumen', 'Ilias', 'Raziel', 'Aethel', 'Castiel', 'Gabriel', 'Gideon', 'Michael',
      'Orion', 'Raphael', 'Solaire', 'Uriel', 'Valerius', 'Zephyr', 'Divinus', 'Helios', 'Hyperion', 'Ignatius',
      'Luminary', 'Mikael', 'Solarius', 'Vesper',
    ],
    femmina: [
      'Aurelia', 'Nova', 'Ysera', 'Elenya', 'Solara', 'Celestine', 'Dawn', 'Illyria', 'Lux', 'Mira',
      'Seraphina', 'Astra', 'Celeste', 'Eos', 'Radiance', 'Valeria',
    ],
  },
  goliath: {
    maschio: [
      'Kavaki', 'Thruun', 'Ilikan', 'Gae-Al', 'Keothi', 'Uthal', 'Manneo', 'Aukan', 'Gauthak', 'Lo-Kag',
      'Maveith', 'Orilo', 'Paavu', 'Thalai', 'Thotham', 'Vimak', 'Stonecrag', 'Frostwalker', 'Thunderclap', 'Peakstride',
      'Cliffgazer', 'Stormborn', 'Bearfist', 'Ironbrow',
    ],
    femmina: [
      'Vaunea', 'Ovak', 'Nalla', 'Eglath', 'Kuori', 'Pethani',
    ],
  },
  tabaxi: [
    'Artiglio di Luna', 'Ombra nella Notte', 'Salto di Nuvola', 'Fumo Silenzioso', 'Guizzo Rapido',
    'Cinque Piume', 'Due Fiumi', 'Canto del Vento', 'Occhi di Giada', 'Foglia Danzante',
    'Passo di Velluto', 'Raggio di Sole', 'Manto d\'Ambra', 'Zampa Veloce', 'Eco della Foresta',
    'Nebbia Mattutina', 'Sussurro della Giungla', 'Fiamma Dorata', 'Graffio Cortese', 'Cacciatore Silente',
  ],
  goblin: [
    'Droop', 'Snik', 'Grib', 'Skrap', 'Fiz', 'Taz', 'Krik', 'Poz', 'Nib', 'Snagg',
    'Rax', 'Grix', 'Clak', 'Zix', 'Skrit', 'Vexil', 'Nox', 'Pik', 'Brak', 'Snick',
    'Klag', 'Zib', 'Gerk', 'Sprock', 'Splint', 'Snaggle', 'Pebble', 'Glint', 'Rubble', 'Spark',
  ],
};

export const NOMI_SPECIE = Object.fromEntries(
  Object.entries(NOMI_SPECIE_GENERE).map(([k, v]) => [
    k,
    Array.isArray(v) ? v : [...(v.maschio || []), ...(v.femmina || [])],
  ])
);

export const COGNOMI_SPECIE = {
  elfo: [
    'Sussurro Lunare', 'Crestavento', 'Ombrabosco', 'Stella d\'Argento', 'Frondadoro', 'Alba Radiosa',
    'Canto della Notte', 'Lama Verde', 'Petalochiaro', 'Passolieve', 'Moonwhisper', 'Silverleaf',
    'Stargazer', 'Shadowsong', 'Nightbreeze', 'Sunstrider', 'Willowshade', 'Faerwind', 'Evenwood',
    'Starfall', 'Dewdrop', 'Sunwatcher', 'Leafwhisper', 'Whisperwind', 'Silverglades',
  ],
  nano: [
    'Spaccamontagne', 'Forgiaferro', 'Barbadargento', 'Scudosaldo', 'Martelloduro', 'Cuordiroccia',
    'Piccainfranta', 'Incudinodorata', 'Pietrafitta', 'Venerapietra', 'Ironbreaker', 'Stoneforge',
    'Battlehammer', 'Frostbeard', 'Goldseeker', 'Anvilmar', 'Deepdelver', 'Coppervein', 'Thunderforge', 'Firebeard',
  ],
  halfling: [
    'Sottocolle', 'Foglia di Tè', 'Piedelesto', 'Botteverde', 'Meladoro', 'Tostapane',
    'Spicchiobuono', 'Boscofiorito', 'Pennadoca', 'Cottocotto', 'Underhill', 'Tealeaf',
    'Goodbarrel', 'Greenbottle', 'Tosscobble', 'Brushgather', 'High-hill', 'Brambleberry', 'Sweetwater', 'Buttercup',
  ],
  umano: [
    'Fierobraccio', 'Nerosole', 'Corvospina', 'Falcoceleste', 'Valdor', 'Sterling', 'Blackwood',
    'Vance', 'Thorne', 'Ravencroft', 'Winterfall', 'Hawthorne', 'Ashford', 'Castellano',
    'Altavilla', 'Montegrigio', 'Silverstone', 'Redmane', 'Ironwood', 'Lionheart', 'Brightwood', 'Stormbringer',
  ],
  orco: [
    'Spaccateschi', 'Zannaguzza', 'Occhiodisangue', 'Mano di Ferro', 'Furia Grigia', 'Grugno d\'Acciaio',
    'Lama Mozza', 'Pelle di Pietra', 'Skullcrusher', 'Bloodtooth', 'Ironhide', 'Bonegnawer', 'Gorehowl', 'Doomhammer', 'Hellscream',
  ],
  tiefling: [
    'delle Ombre', 'dall\'Abisso', 'Senzanome', 'dal Patto Oscuro', 'del Fuoco Infernale',
    'Cenere', 'Brinaeterna', 'Nottefonda', 'Animeperse', 'delle Fiamme Eterne',
  ],
  drago: [
    'Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Drachedandion', 'Fenkenkabradon', 'Kepeshkmolik',
    'Kerrhylon', 'Kimbatuul', 'Linxakasendalor', 'Myastan', 'Nemmonis', 'Norixius', 'Ophinshtalajiir',
    'Prexijandilin', 'Shestendeliath', 'Turnuroth', 'Verthisathurgiesh', 'Yarjerit', 'Scalesoul', 'Flameheart',
  ],
  goliath: [
    'Cercatore d\'Alba', 'Squartacornifero', 'Cacciatore d\'Orsi', 'Pietrafredda', 'Guardiano dei Ghiacci',
    'Manoferma', 'Dawncaller', 'Bearkiller', 'Flintfinder', 'Horncarver', 'Rootbreaker', 'Skywatcher', 'Steadyhand', 'Threadtwister', 'Stormpeaks',
  ],
};

export const NOMI_GENERICI = [
  'Aldric', 'Lyra', 'Corin', 'Sera', 'Rowan', 'Mira', 'Talon', 'Enna', 'Kael', 'Nira',
  'Alistair', 'Valerius', 'Elena', 'Emeric', 'Gareth', 'Talia', 'Cassandra', 'Julian', 'Fiona', 'Derek',
  'Tristan', 'Evelyn', 'Roland', 'Morgana', 'Cedric', 'Diana', 'Sean', 'Victor', 'Helena', 'Conrad',
];
// Aumenti di caratteristica dati dalla razza nelle regole 2014 (5.0).
// Nelle regole 2024 (5.5) questi bonus arrivano invece dal background.
// 'sceltaExtra' = quante caratteristiche a scelta ricevono +1 (Mezzelfo).
export const BONUS_CARATT_SPECIE_2014 = {
  Aasimar: { carisma: 2 },
  Dragonide: { forza: 2, carisma: 1 },
  Elfo: { destrezza: 2 },
  'Elfo Alto': { destrezza: 2, intelligenza: 1 },
  'Elfo dei Boschi': { destrezza: 2, saggezza: 1 },
  'Elfo Oscuro (Drow)': { destrezza: 2, carisma: 1 },
  Gnomo: { intelligenza: 2 },
  'Gnomo delle Foreste': { intelligenza: 2, destrezza: 1 },
  'Gnomo delle Rocce': { intelligenza: 2, costituzione: 1 },
  Goliath: { forza: 2, costituzione: 1 },
  Halfling: { destrezza: 2 },
  'Halfling Piedelesto': { destrezza: 2, carisma: 1 },
  'Halfling Tozzo': { destrezza: 2, costituzione: 1 },
  Nano: { costituzione: 2 },
  'Nano delle Colline': { costituzione: 2, saggezza: 1 },
  'Nano delle Montagne': { costituzione: 2, forza: 2 },
  Orco: { forza: 2, costituzione: 1 },
  Mezzorco: { forza: 2, costituzione: 1 },
  Mezzelfo: { carisma: 2, sceltaExtra: 2 },
  Tiefling: { intelligenza: 1, carisma: 2 },
  Umano: { forza: 1, destrezza: 1, costituzione: 1, intelligenza: 1, saggezza: 1, carisma: 1 },
};
export const SPECIE_DATI = {
  Aasimar: { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Media', tratti: 'Resistenza celestiale, Mani guaritrici, Portatore di luce, Rivelazione celestiale (liv. 3)' },
  Dragonide: { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Media', tratti: 'Arma a soffio (1d10/2d6, ricarica riposo breve), Resistenza al danno, Antenati draconici, Volo draconico (liv. 5)' },
  Elfo: { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Media', tratti: 'Trance (4 ore), Retaggio fatato, Sensi acuti (competenza Percezione)' },
  'Elfo Alto': { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Media', tratti: 'Trance, Retaggio fatato, Sensi acuti, 1 Trucchetto da Mago (Intelligenza), Lingua extra, Competenza armi elfiche' },
  'Elfo dei Boschi': { velocita: 10.5, sensi: 'Scurovisione 18 m', taglia: 'Media', tratti: 'Trance, Retaggio fatato, Sensi acuti, Piedi veloci (10.5 m), Maschera della selva (mimetismo naturale)' },
  'Elfo Oscuro (Drow)': { velocita: 9, sensi: 'Scurovisione 36 m', taglia: 'Media', tratti: 'Trance, Retaggio fatato, Sensibilità alla luce solare, Magia Drow (Luce danzante, Fuoco fatuo liv. 3, Oscurità liv. 5), Armi drow' },
  Gnomo: { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Piccola', tratti: 'Astuzia gnomesca (vantaggio ai TS mentali contro la magia)' },
  'Gnomo delle Foreste': { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Piccola', tratti: 'Astuzia gnomesca, Illusionista nato (Trucchetto Illusione minore), Parlare con le piccole bestie' },
  'Gnomo delle Rocce': { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Piccola', tratti: 'Astuzia gnomesca, Conoscenza degli artefatti, Inventore (congegni meccanici amatoriali)' },
  Goliath: { velocita: 10.5, sensi: '', taglia: 'Media', tratti: 'Retaggio dei giganti (Benedizione dei Titani), Corporatura potente, Forma Grande (liv. 5)' },
  Halfling: { velocita: 9, sensi: '', taglia: 'Piccola', tratti: 'Coraggioso (vantaggio contro spaventato), Agilità halfling, Fortuna (ritira gli 1 sul d20), Furtività naturale' },
  'Halfling Piedelesto': { velocita: 9, sensi: '', taglia: 'Piccola', tratti: 'Coraggioso, Agilità halfling, Fortuna, Furtività naturale (nascondersi dietro creature Medie)' },
  'Halfling Tozzo': { velocita: 9, sensi: '', taglia: 'Piccola', tratti: 'Coraggioso, Agilità halfling, Fortuna, Resilienza tozza (vantaggio TS e resistenza al veleno)' },
  Nano: { velocita: 9, sensi: 'Scurovisione 36 m', taglia: 'Media', tratti: 'Robustezza nanica (+1 PF per livello), Scalpellino, Resistenza al veleno (vantaggio TS e resistenza), Competenza negli strumenti' },
  'Nano delle Colline': { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Media', tratti: 'Robustezza nanica (+1 PF per livello, totale +2/liv.), Scalpellino, Resistenza al veleno' },
  'Nano delle Montagne': { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Media', tratti: 'Competenza nelle armature leggere e medie, Robustezza nanica, Scalpellino, Resistenza al veleno, Forza +2' },
  Orco: { velocita: 9, sensi: 'Scurovisione 36 m', taglia: 'Media', tratti: 'Scatto adrenalinico (azione bonus Scatto + PF temp), Resistenza implacabile (1 PF invece di 0 una volta al giorno)' },
  Mezzorco: { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Media', tratti: 'Minaccioso (competenza Intimidire), Resistenza implacabile (rimani a 1 PF), Attacchi selvaggi (+1 dado ai critici in mischia)' },
  Mezzelfo: { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Media', tratti: 'Retaggio fatato (immunità al sonno magico, vantaggio contro affascinato), Versatilità (competenza in 2 abilità a scelta), +2 Carisma' },
  Tiefling: { velocita: 9, sensi: 'Scurovisione 18 m', taglia: 'Media', tratti: 'Presenza ultraterrena (Taumaturgia), Resistenza al fuoco, Eredità infernale/abisso (Incantesimi a livello 3 e 5)' },
  Umano: { velocita: 9, sensi: '', taglia: 'Media', tratti: 'Pieno di risorse (Ispirazione Eroica dopo riposo lungo), Abile (competenza in 1 abilità), Versatile (Talento di Origine extra)' },
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
  { match: ['barbaro', 'barbarian'], chiaro: '#b42318', scuro: '#ff6b5e' },   // cremisi
  { match: ['bardo', 'bard'], chiaro: '#a51f94', scuro: '#f06bd6' },          // fucsia
  { match: ['chierico', 'cleric'], chiaro: '#a87300', scuro: '#ffd04a' },     // oro solare
  { match: ['druido', 'druid'], chiaro: '#287a35', scuro: '#69d477' },        // verde bosco
  { match: ['guerriero', 'fighter'], chiaro: '#365f88', scuro: '#83b5e6' },   // blu acciaio
  { match: ['ladro', 'rogue'], chiaro: '#574a43', scuro: '#b6a39a' },         // bruno fumo
  { match: ['mago', 'wizard'], chiaro: '#1558c0', scuro: '#6f9fff' },         // blu arcano
  { match: ['monaco', 'monk'], chiaro: '#007d72', scuro: '#45d8c8' },         // giada
  { match: ['paladino', 'paladin'], chiaro: '#bd6500', scuro: '#ffad42' },    // ambra
  { match: ['ranger'], chiaro: '#627514', scuro: '#b5cf4b' },                 // oliva
  { match: ['stregone', 'sorcerer'], chiaro: '#df4815', scuro: '#ff8557' },   // arancio fiamma
  { match: ['warlock', 'patto'], chiaro: '#6e2aa6', scuro: '#c27bf2' },       // viola occulto
  { match: ['artefice', 'artificer'], chiaro: '#7c3aed', scuro: '#a78bfa' },   // ametista tecnomagica
];


// ============================================================================
// CONFIGURAZIONE MANUALI E FONTI DI REGOLE D&D 5e
// ============================================================================

export const DEFAULT_MANUALI = {
  phb2024: true,
  phb2014: true,
  tasha: true,
  xanathar: true,
  fizban_mm: true,
};

export const MANUALI_INFO = {
  phb2024: {
    id: 'phb2024',
    nome: "Player's Handbook 2024 (D&D 5.5)",
    nomeEn: "Player's Handbook 2024 (D&D 5.5)",
    codice: 'PHB 2024',
    icona: '✨',
    colore: '#2e9d4d',
    descrizione: 'Regole 2024, 16 Background con Talenti di Origine, Maestria nelle Armi e 48 nuove sottoclassi canoniche.',
    descrizioneEn: '2024 Core Rules, 16 Origin Backgrounds with Feats, Weapon Mastery, and 48 updated subclasses.',
  },
  phb2014: {
    id: 'phb2014',
    nome: "Player's Handbook 2014 (D&D 5.0)",
    nomeEn: "Player's Handbook 2014 (D&D 5.0)",
    codice: 'PHB 2014',
    icona: '📕',
    colore: '#d97706',
    descrizione: 'Regole e progressioni storiche della 5ª Edizione classica (2014).',
    descrizioneEn: 'Classic 5th Edition historical core rules and progressions (2014).',
  },
  tasha: {
    id: 'tasha',
    nome: "Tasha's Cauldron of Everything (TCoE)",
    nomeEn: "Tasha's Cauldron of Everything (TCoE)",
    codice: 'TCoE',
    icona: '🔮',
    colore: '#8b5cf6',
    descrizione: 'Classe Artefice con 4 specializzazioni, 26 sottoclassi Tasha, magie di Evocazione con scheda mostro e talenti opzionali.',
    descrizioneEn: 'Artificer class with 4 subclasses, 26 Tasha subclasses, Summon spells with stat blocks, and optional feats.',
  },
  xanathar: {
    id: 'xanathar',
    nome: "Xanathar's Guide to Everything (XGtE)",
    nomeEn: "Xanathar's Guide to Everything (XGtE)",
    codice: 'XGtE',
    icona: '📜',
    colore: '#3b82f6',
    descrizione: '31 sottoclassi iconiche (Lama del Sortilegio, Anima Divina, Cacciatore delle Tenebre, Samurai), incantesimi e regole espanse.',
    descrizioneEn: '31 iconic subclasses (Hexblade, Divine Soul, Gloom Stalker, Samurai), spells, and expanded options.',
  },
  fizban_mm: {
    id: 'fizban_mm',
    nome: "Fizban's Treasury & Bestiario Esteso",
    nomeEn: "Fizban's Treasury & Expanded Bestiary",
    codice: 'FTD & MM',
    icona: '🐉',
    colore: '#ef4444',
    descrizione: 'Evocazione Spirito Draconico, catalogo mostri completo per il Combat Tracker e creature avanzate.',
    descrizioneEn: 'Summon Draconic Spirit, full classic monsters catalog for Combat Tracker, and expanded creatures.',
  },
};

export const SOTTOCLASSI_FONTI = {
  // Barbaro
  'Berserker': 'phb2014', 'Cuore Selvaggio': 'phb2024', 'Albero del Mondo': 'phb2024', 'Zelota': 'xanathar',
  'Cammino della Bestia': 'tasha', 'Cammino della Magia Selvaggia': 'tasha', 'Guardiano Ancestrale': 'xanathar', 'Guerriero Totemico': 'phb2014',
  // Bardo
  'Collegio della Danza': 'phb2024', 'Collegio del Fascino': 'xanathar', 'Collegio della Sapienza': 'phb2014', 'Collegio del Valore': 'phb2014',
  'Collegio della Creazione': 'tasha', 'Collegio dell’Eloquenza': 'tasha', 'Collegio delle Spade': 'xanathar', 'Collegio dei Sussurri': 'xanathar',
  // Chierico
  'Dominio della Vita': 'phb2014', 'Dominio della Luce': 'phb2014', 'Dominio dell’Inganno': 'phb2014', 'Dominio della Guerra': 'phb2014',
  'Dominio dell’Ordine': 'tasha', 'Dominio della Pace': 'tasha', 'Dominio del Crepuscolo': 'tasha', 'Dominio della Tempesta': 'phb2014',
  'Dominio della Natura': 'phb2014', 'Dominio della Forgia': 'xanathar', 'Dominio della Tomba': 'xanathar',
  // Druido
  'Circolo della Terra': 'phb2014', 'Circolo della Luna': 'phb2014', 'Circolo del Mare': 'phb2024', 'Circolo del Pastore': 'xanathar',
  'Circolo delle Stelle': 'tasha', 'Circolo delle Spore': 'tasha', 'Circolo del Fuoco Selvaggio': 'tasha', 'Circolo dei Sogni': 'xanathar',
  // Guerriero
  'Maestro di Battaglia': 'phb2014', 'Campione': 'phb2014', 'Cavaliere Mistico': 'phb2014', 'Guerriero Psionico': 'tasha',
  'Cavaliere Runico': 'tasha', 'Arciere Arcano': 'xanathar', 'Cavaliere': 'xanathar', 'Samurai': 'xanathar',
  // Ladro
  'Mistificatore Arcano': 'phb2014', 'Assassino': 'phb2014', 'Lama Spirituale': 'tasha', 'Furfante': 'phb2014',
  'Fantasma': 'tasha', 'Inquisitore': 'xanathar', 'Pianificatore': 'xanathar', 'Spadaccino': 'xanathar', 'Scout': 'xanathar',
  // Mago
  'Abiuratore': 'phb2014', 'Divinatore': 'phb2014', 'Invocatore': 'phb2014', 'Illusionista': 'phb2014',
  'Cantore della Lama': 'tasha', 'Ordine degli Scribi': 'tasha', 'Necromante': 'phb2014', 'Trasmutatore': 'phb2014',
  'Ammaliatore': 'phb2014', 'Evocatore': 'phb2014', 'Mago della Guerra': 'xanathar',
  // Monaco
  'Guerriero della Misericordia': 'tasha', 'Guerriero dell’Ombra': 'phb2014', 'Guerriero degli Elementi': 'phb2024', 'Guerriero della Mano Aperta': 'phb2014',
  'Via del Sé Astrale': 'tasha', 'Via del Maestro Ubriaco': 'xanathar', 'Via del Kensei': 'xanathar', 'Via dell’Anima Solare': 'xanathar',
  // Paladino
  'Giuramento di Devozione': 'phb2014', 'Giuramento di Gloria': 'tasha', 'Giuramento degli Antichi': 'phb2014', 'Giuramento di Vendetta': 'phb2014',
  'Giuramento degli Osservatori': 'tasha', 'Giuramento di Conquista': 'xanathar', 'Giuramento di Redenzione': 'xanathar', 'Giuramento della Corona': 'phb2014',
  // Ranger
  'Signore delle Bestie': 'phb2014', 'Viandante Fatato': 'tasha', 'Cacciatore delle Tenebre': 'xanathar', 'Cacciatore': 'phb2014',
  'Custode dello Sciame': 'tasha', 'Uccisore di Mostri': 'xanathar', 'Guardiano dell’Orizzonte': 'xanathar',
  // Stregone
  'Stregoneria Aberrante': 'tasha', 'Stregoneria Meccanica': 'tasha', 'Stregoneria Draconica': 'phb2014', 'Stregoneria della Magia Selvaggia': 'phb2014',
  'Stregoneria delle Ombre': 'xanathar', 'Anima Divina': 'xanathar', 'Stregoneria della Tempesta': 'xanathar',
  // Warlock
  'Patrono Signore Fatato': 'phb2014', 'Patrono Celestiale': 'xanathar', 'Patrono Immondo': 'phb2014', 'Patrono Grande Antico': 'phb2014',
  'Patrono delle Profondità': 'tasha', 'Patrono del Genio': 'tasha', 'Lama del Sortilegio': 'xanathar', 'L’Immortale': 'phb2014',
  // Artefice
  'Alchimista': 'tasha', 'Armaiolo': 'tasha', 'Artigliere': 'tasha', 'Fabbro da Guerra': 'tasha',
};

export const TALENTI_FONTI = {
  // PHB 2024 / Origine / Doni Epici
  'Allerta': 'phb2024', 'Fortunato': 'phb2024', 'Guaritore': 'phb2024', 'Incantatore Magico': 'phb2024',
  'Mago Combattente': 'phb2024', 'Iniziato alla Magia': 'phb2024', 'Robusto': 'phb2024', 'Musico': 'phb2024',
  'Abile': 'phb2024', 'Artigiano': 'phb2024', 'Guida Spirituale': 'phb2024', 'Attaccabrighe': 'phb2024',
  'Dono dell’Irresistibile Offensiva': 'phb2024', 'Dono del Destino': 'phb2024',
  'Dono dell’Attacco Rapido': 'phb2024', 'Dono dell’Invulnerabilità': 'phb2024',
  'Dono della Magia Implacabile': 'phb2024', 'Dono dell\'Irresistibile Offensiva': 'phb2024',
  'Dono dell\'Attacco Rapido': 'phb2024', 'Dono dell\'Invulnerabilità': 'phb2024',

  // Tasha's Cauldron of Everything (TCoE)
  'Toccato dalle Fate': 'tasha', 'Toccato dalle Ombre': 'tasha', 'Telecinetico': 'tasha',
  'Telepatico': 'tasha', 'Cuoco': 'tasha', 'Schiacciatore': 'tasha', 'Perforatore': 'tasha',
  'Squartatore': 'tasha', 'Avvelenatore': 'tasha', 'Esperto nelle Abilità': 'tasha',
  'Iniziato all’Artefatto': 'tasha', 'Iniziato all\'Artefatto': 'tasha', 'Metamagia Adepta': 'tasha',
  'Iniziato al Combattimento': 'tasha', 'Lama Spirituale': 'tasha',

  // Xanathar's Guide to Everything (XGtE)
  'Precisione Elfica': 'xanathar', 'Paura del Drago': 'xanathar', 'Fiamme di Phlegethos': 'xanathar',
  'Agilità Tozza': 'xanathar', 'Furia Orchesca': 'xanathar', 'Fortuna Generosa': 'xanathar',
  'Costituzione Infernale': 'xanathar', 'Seconda Opportunità': 'xanathar',
  'Magia degli Elfi dei Boschi': 'xanathar', 'Prodigio': 'xanathar',

  // PHB 2014 Classici
  'Maestro delle Armi Grandi': 'phb2014', 'Tiratore Scelto': 'phb2014', 'Sentinella': 'phb2014',
  'Maestro delle Armature Medie': 'phb2014', 'Condottiero Ispiratore': 'phb2014', 'Resiliente': 'phb2014',
  'Mente Lucida': 'phb2014', 'Padrone delle Armi ad Asta': 'phb2014', 'Attore': 'phb2014', 'Atleta': 'phb2014',
  'Difensore con Due Armi': 'phb2014', 'Lottatore': 'phb2014', 'Adepto Elementale': 'phb2014',
  'Cecchino Magico': 'phb2014', 'Mobile': 'phb2014', 'Osservatore': 'phb2014', 'Maestro di Scudo': 'phb2014',
};

export const INCANTESIMI_FONTI = {
  // Tasha's Cauldron of Everything (TCoE)
  'Evoca Aberrazione': 'tasha', 'Evoca Bestia': 'tasha', 'Evoca Celestiale': 'tasha',
  'Evoca Costrutto': 'tasha', 'Evoca Elementale': 'tasha', 'Evoca Folletto': 'tasha',
  'Evoca Immondo': 'tasha', 'Evoca Spirito dell’Ombra': 'tasha', 'Evoca Spirito dell\'Ombra': 'tasha',
  'Evoca Non Morto': 'tasha', 'Calderone Caustico di Tasha': 'tasha', 'Frusta Mentale di Tasha': 'tasha',
  'Aspetto Ultraterreno di Tasha': 'tasha', 'Lama del Disastro': 'tasha', 'Sudario Spirituale': 'tasha',
  'Spada dell’Inganno': 'tasha', 'Scheggia Mentale': 'tasha', 'Sogno del Velo Blu': 'tasha',

  // Xanathar's Guide to Everything (XGtE)
  'Assorbire Elementi': 'xanathar', 'Dardo del Caos': 'xanathar', 'Catapulta': 'xanathar',
  'Soffio del Drago': 'xanathar', 'Spirito Guaritore': 'xanathar', 'Lama d’Ombra': 'xanathar',
  'Lama d\'Ombra': 'xanathar', 'Passo del Tuono': 'xanathar', 'Minuscolo Servitore': 'xanathar',
  'Squarcio Sinaptico': 'xanathar', 'Danza Macabra': 'xanathar', 'Enervazione': 'xanathar',
  'Alba': 'xanathar', 'Arma Sacra': 'xanathar', 'Drago Illusorio': 'xanathar',
  'Oscurità Esasperante': 'xanathar', 'Tempio degli Dei': 'xanathar', 'Corona di Stelle': 'xanathar',
  'Rintocco dei Morti': 'xanathar', 'Infestazione': 'xanathar', 'Ferinità Primordiale': 'xanathar',
  'Parola di Radiosità': 'xanathar', 'Dardo Psichico': 'xanathar', 'Trasferimento Vitale': 'xanathar',

  // Fizban's Treasury of Dragons (FTD)
  'Evoca Spirito Draconico': 'fizban_mm', 'Passo di Ashardalon': 'fizban_mm',
  'Trasformazione Draconica': 'fizban_mm', 'Scudo di Platino di Fizban': 'fizban_mm',
  'Gelo Vincolante di Rime': 'fizban_mm', 'Inganno di Nathair': 'fizban_mm',
};

export const INVOCAZIONI_FONTI = {
  // Tasha
  'Mente Mistica': 'tasha', 'Scriba Remoto': 'tasha', 'Investitura del Maestro della Catena': 'tasha',
  'Servitù Imperitura': 'tasha', 'Protezione della Tomba': 'tasha',
  // Xanathar
  'Tomba di Levistus': 'xanathar', 'Sguardo Fantasmale': 'xanathar', 'Morsa di Hadar': 'xanathar',
  'Arma del Patto Migliorata': 'xanathar', 'Fuga del Trickster': 'xanathar', 'Manto di Baalzebul': 'xanathar',
};

export function fonteValida(fonte, manuali) {
  if (!manuali || typeof manuali !== 'object') return true;
  if (!fonte) return true;
  return manuali[fonte] !== false;
}

export function talentiPerManuali(talenti, manuali) {
  if (!manuali || !Array.isArray(talenti)) return talenti;
  return talenti.filter((t) => {
    const nome = typeof t === 'string' ? t : (t.nome || '');
    const fonte = TALENTI_FONTI[nome] || 'phb2014';
    return fonteValida(fonte, manuali);
  });
}

export function incantesimiPerManuali(incantesimi, manuali) {
  if (!manuali || !Array.isArray(incantesimi)) return incantesimi;
  return incantesimi.filter((inc) => {
    const nome = typeof inc === 'string' ? inc : (inc.nome || '');
    const fonte = INCANTESIMI_FONTI[nome] || 'phb2014';
    return fonteValida(fonte, manuali);
  });
}
