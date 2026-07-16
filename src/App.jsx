import { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Palette e stili
// ---------------------------------------------------------------------------

// Tema chiaro "foglio di carta": bianco, inchiostro scuro, accenti sobri.
const C = {
  bg: 'var(--c-bg)',
  panel: 'var(--c-panel)',
  panelLight: 'var(--c-panel-light)',
  border: 'var(--c-border)',
  ink: 'var(--c-ink)',
  inkDim: 'var(--c-ink-dim)',
  gold: 'var(--c-gold)',
  goldDark: 'var(--c-gold-dark)',
  red: 'var(--c-red)',
  green: 'var(--c-green)',
};

// Un colore per ogni tipo di dado.
const COLORE_DADO = {
  4: '#2e8b57',
  6: '#1f6fb2',
  8: '#7d4cb0',
  10: '#c0392b',
  12: '#d97b12',
  20: '#b8860b',
  100: '#5b6770',
};

// Valori base del tema (devono combaciare con le variabili in GLOBAL_CSS):
// da qui il tema viene ricostruito in JS per poterlo tingere in base alla classe.
const BASE_TEMA = {
  chiaro: { bg: '#f4f1ea', panel: '#ffffff', panelLight: '#f7f4ee', border: '#ddd5c6', ink: '#2b2620', inkDim: '#8d8272', gold: '#b8860b', goldDark: '#8a6508', red: '#b03a2e', green: '#3e7d32', title: '#9e2b25' },
  scuro: { bg: '#171310', panel: '#211b16', panelLight: '#2a231c', border: '#46392b', ink: '#e9dfcd', inkDim: '#a0937f', gold: '#c9a227', goldDark: '#dcb84f', red: '#d0685a', green: '#7fb069', title: '#de8f88' },
};

// Colore identità per ogni classe (variante chiara e scura per restare leggibile).
// `match` = sottostringhe riconosciute nel campo classe (italiano + inglese).
const CLASSI = [
  { match: ['barbaro', 'barbarian'], chiaro: '#a8321f', scuro: '#e0745f' },
  { match: ['bardo', 'bard'], chiaro: '#9c2f9c', scuro: '#d67fd6' },
  { match: ['chierico', 'cleric'], chiaro: '#b8860b', scuro: '#dcb84f' },
  { match: ['druido', 'druid'], chiaro: '#3e7d32', scuro: '#7fb069' },
  { match: ['guerriero', 'fighter'], chiaro: '#3f5d7a', scuro: '#7fa8cc' },
  { match: ['ladro', 'rogue'], chiaro: '#556070', scuro: '#9aa6b4' },
  { match: ['mago', 'wizard'], chiaro: '#1f6fb2', scuro: '#5fa8e0' },
  { match: ['monaco', 'monk'], chiaro: '#1f8f80', scuro: '#5fd0c0' },
  { match: ['paladino', 'paladin'], chiaro: '#b08900', scuro: '#e6c34d' },
  { match: ['ranger'], chiaro: '#2e6b4f', scuro: '#68b08c' },
  { match: ['stregone', 'sorcerer'], chiaro: '#c0392b', scuro: '#e8776a' },
  { match: ['warlock', 'patto'], chiaro: '#6c3fa0', scuro: '#a67fd6' },
];

// Le 12 classi base (2024), per il menù a tendina della classe.
const NOMI_CLASSI = [
  'Barbaro', 'Bardo', 'Chierico', 'Druido', 'Guerriero', 'Ladro',
  'Mago', 'Monaco', 'Paladino', 'Ranger', 'Stregone', 'Warlock',
];

// Opzioni per i menù a tendina dell'anagrafica (liste 2024; sempre con "Altro…").
const BACKGROUND_5E = [
  'Accolito', 'Artigiano', 'Ciarlatano', 'Contadino', 'Criminale', 'Eremita',
  'Guardia', 'Guida', 'Intrattenitore', 'Marinaio', 'Mercante', 'Nobile',
  'Saggio', 'Scriba', 'Soldato', 'Viandante',
];
// Competenze nelle abilità concesse da ogni background (chiavi di ABILITA).
const BACKGROUND_COMPETENZE = {
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
const SPECIE_5E = {
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
const TAGLIE_5E = ['Minuscola', 'Piccola', 'Media', 'Grande', 'Enorme', 'Mastodontica'];
const ALLINEAMENTI_5E = [
  'Legale Buono', 'Neutrale Buono', 'Caotico Buono',
  'Legale Neutrale', 'Neutrale', 'Caotico Neutrale',
  'Legale Malvagio', 'Neutrale Malvagio', 'Caotico Malvagio',
];
// Sottoclassi per classe (chiave = primo alias in CLASSI, es. 'mago').
const SOTTOCLASSI_5E = {
  barbaro: ['Berserker', 'Cuore Selvaggio', 'Albero del Mondo', 'Zelota'],
  bardo: ['Collegio della Danza', 'Collegio dello Splendore', 'Collegio del Sapere', 'Collegio del Valore'],
  chierico: ['Dominio della Vita', 'Dominio della Luce', 'Dominio dell’Inganno', 'Dominio della Guerra'],
  druido: ['Circolo della Terra', 'Circolo della Luna', 'Circolo del Mare', 'Circolo delle Stelle'],
  guerriero: ['Campione', 'Maestro di Battaglia', 'Cavaliere Mistico', 'Soldato Psionico'],
  ladro: ['Assassino', 'Furfante', 'Anima Lama', 'Ladro Arcano'],
  mago: ['Abiuratore', 'Divinatore', 'Invocatore', 'Illusionista'],
  monaco: ['Mano Aperta', 'Misericordia', 'Elementi', 'Ombra'],
  paladino: ['Giuramento della Devozione', 'Giuramento della Gloria', 'Giuramento degli Antichi', 'Giuramento della Vendetta'],
  ranger: ['Cacciatore', 'Signore delle Bestie', 'Vagabondo Fatato', 'Errante Cupo'],
  stregone: ['Stregoneria Aberrante', 'Anima Meccanica', 'Stirpe Draconica', 'Magia Selvaggia'],
  warlock: ['Immondo', 'Arcifata', 'Grande Antico', 'Celestiale'],
};

/** Sottoclassi disponibili per la classe indicata (o [] se non riconosciuta). */
function sottoclassiPerClasse(classe) {
  const c = coloreClasse(classe);
  return (c && SOTTOCLASSI_5E[c.match[0]]) || [];
}

// Caratteristica da incantatore per classe (chiave = primo alias in CLASSI).
const CARATT_INCANTATORE = {
  bardo: 'carisma', stregone: 'carisma', warlock: 'carisma', paladino: 'carisma',
  chierico: 'saggezza', druido: 'saggezza', ranger: 'saggezza',
  mago: 'intelligenza',
};
/** Caratteristica da incantatore della classe (o '' se non incantatore/ignota). */
function caratteristicaIncantatorePerClasse(classe) {
  const c = coloreClasse(classe);
  return (c && CARATT_INCANTATORE[c.match[0]]) || '';
}

// Priorità delle caratteristiche per classe (dalla più importante alla meno).
// Serve per assegnare i tiri più alti alle caratteristiche giuste.
const PRIORITA_CARATT = {
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

/** Tira 4d6 e scarta il dado più basso (metodo classico per le caratteristiche). */
function tira4d6ScartaMinimo() {
  const dadi = [tiraDado(6), tiraDado(6), tiraDado(6), tiraDado(6)].sort((a, b) => a - b);
  return dadi[1] + dadi[2] + dadi[3];
}

/**
 * Genera le 6 caratteristiche (4d6 scarta il minimo) e le assegna: il valore
 * più alto alla caratteristica più importante per la classe scelta.
 */
function generaCaratteristiche(classe) {
  const valori = Array.from({ length: 6 }, tira4d6ScartaMinimo).sort((a, b) => b - a);
  const c = coloreClasse(classe);
  const ordine = (c && PRIORITA_CARATT[c.match[0]]) ||
    ['forza', 'destrezza', 'costituzione', 'intelligenza', 'saggezza', 'carisma'];
  const risultato = {};
  ordine.forEach((car, i) => { risultato[car] = valori[i]; });
  return risultato;
}

// Tipo di dado vita per classe (chiave = primo alias in CLASSI).
const DADO_VITA_CLASSE = {
  barbaro: 12,
  guerriero: 10, paladino: 10, ranger: 10,
  bardo: 8, chierico: 8, druido: 8, ladro: 8, monaco: 8, stregone: 8, warlock: 8,
  mago: 6,
};
function dadoVitaClasse(classe) {
  const c = coloreClasse(classe);
  return (c && DADO_VITA_CLASSE[c.match[0]]) || 8;
}

// Le 3 caratteristiche potenziabili da ogni background (regole 2024).
const BACKGROUND_CARATT = {
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

/**
 * Bonus alle caratteristiche dal background (2024): +2 e +1 alle due
 * caratteristiche più utili per la classe fra le tre concesse.
 * Ritorna [chiavePiù2, chiavePiù1] (o [] se background ignoto).
 */
function bonusCaratteristicheBackground(bg, classe) {
  const opzioni = BACKGROUND_CARATT[bg];
  if (!opzioni) return [];
  const prio = (coloreClasse(classe) && PRIORITA_CARATT[coloreClasse(classe).match[0]]) || [];
  const rank = (k) => (prio.indexOf(k) === -1 ? 99 : prio.indexOf(k));
  const ordinate = [...opzioni].sort((a, b) => rank(a) - rank(b));
  return [ordinate[0], ordinate[1]];
}

// Tiri salvezza in cui ogni classe è competente (2 per classe).
const TS_CLASSE = {
  barbaro: ['forza', 'costituzione'], bardo: ['destrezza', 'carisma'],
  chierico: ['saggezza', 'carisma'], druido: ['intelligenza', 'saggezza'],
  guerriero: ['forza', 'costituzione'], ladro: ['destrezza', 'intelligenza'],
  mago: ['intelligenza', 'saggezza'], monaco: ['forza', 'destrezza'],
  paladino: ['saggezza', 'carisma'], ranger: ['forza', 'destrezza'],
  stregone: ['costituzione', 'carisma'], warlock: ['saggezza', 'carisma'],
};
function tiriSalvezzaPerClasse(classe) {
  const c = coloreClasse(classe);
  const keys = (c && TS_CLASSE[c.match[0]]) || [];
  if (!keys.length) return null;
  const ts = { forza: false, destrezza: false, costituzione: false, intelligenza: false, saggezza: false, carisma: false };
  keys.forEach((k) => { ts[k] = true; });
  return ts;
}

// Addestramento in armature e armi per classe.
const ADDESTRAMENTO_CLASSE = {
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
function addestramentoPerClasse(classe) {
  const c = coloreClasse(classe);
  return (c && ADDESTRAMENTO_CLASSE[c.match[0]]) || null;
}

// Dati di specie (2024): velocità in metri, sensi, taglia, tratti principali.
const SPECIE_DATI = {
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

// Slot incantesimo degli incantatori completi (livello PG → slot per livello 1-9).
const SLOT_FULL_CASTER = {
  1: [2], 2: [3], 3: [4, 2], 4: [4, 3], 5: [4, 3, 2], 6: [4, 3, 3], 7: [4, 3, 3, 1], 8: [4, 3, 3, 2],
  9: [4, 3, 3, 3, 1], 10: [4, 3, 3, 3, 2], 11: [4, 3, 3, 3, 2, 1], 12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1], 14: [4, 3, 3, 3, 2, 1, 1], 15: [4, 3, 3, 3, 2, 1, 1, 1], 16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1], 19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};
// Slot dei semi-incantatori (paladino, ranger): tabella classica, incantesimi fino al 5° livello.
const SLOT_MEZZO_CASTER = {
  1: [], 2: [2], 3: [3], 4: [3], 5: [4, 2], 6: [4, 2], 7: [4, 3], 8: [4, 3], 9: [4, 3, 2], 10: [4, 3, 2],
  11: [4, 3, 3], 12: [4, 3, 3], 13: [4, 3, 3, 1], 14: [4, 3, 3, 1], 15: [4, 3, 3, 2], 16: [4, 3, 3, 2],
  17: [4, 3, 3, 3, 1], 18: [4, 3, 3, 3, 1], 19: [4, 3, 3, 3, 2], 20: [4, 3, 3, 3, 2],
};
const CLASSI_FULL_CASTER = ['bardo', 'chierico', 'druido', 'mago', 'stregone'];
const CLASSI_MEZZO_CASTER = ['paladino', 'ranger'];
/** Slot incantesimo coerenti con classe e livello (null se non applicabile: manuale). */
function slotDaClasseLivello(classe, livello) {
  const c = coloreClasse(classe);
  if (!c) return null;
  const lv = Math.max(1, Math.min(20, Math.floor(livello) || 1));
  let tabella = null;
  if (CLASSI_FULL_CASTER.includes(c.match[0])) tabella = SLOT_FULL_CASTER[lv];
  else if (CLASSI_MEZZO_CASTER.includes(c.match[0])) tabella = SLOT_MEZZO_CASTER[lv];
  if (!tabella) return null;
  const slot = {};
  for (let i = 1; i <= 9; i++) slot[i] = { totale: tabella[i - 1] || 0, spesi: 0 };
  return slot;
}

// Tipi di danno (per resistenze/immunità/vulnerabilità) e sensi comuni.
const DANNI_5E = [
  'Acido', 'Contundente', 'Freddo', 'Fuoco', 'Fulmine', 'Necrotico',
  'Perforante', 'Psichico', 'Radiante', 'Tagliente', 'Tuono', 'Veleno',
];
const SENSI_5E = ['Vista normale', 'Scurovisione', 'Vista cieca', 'Percezione tremorsensitiva'];

// Sfinimento: nella 5.0 (2014) sono 6 livelli con effetti crescenti; nella 5.5
// (2024) ogni livello dà −2 a tutti i tiri di d20. Testo degli effetti 2014:
const SFINIMENTO_2014 = [
  '',
  'Svantaggio alle prove di caratteristica',
  'Velocità dimezzata',
  'Svantaggio a tiri per colpire e tiri salvezza',
  'Massimo dei PF dimezzato',
  'Velocità ridotta a 0',
  'Morte',
];

// Ordine di default delle sezioni collassabili (riordinabili via drag).
// Sezioni riordinabili via drag. 'import' NON è qui: resta sempre fissa in fondo.
const ORDINE_SEZIONI_DEFAULT = ['risorse', 'privilegi', 'trattiSpecie', 'talenti', 'addestramento', 'equipaggiamento', 'aspetto'];

/** Ricava il colore identità dalla classe (testo libero), o null se non riconosciuta. */
function coloreClasse(classe) {
  if (typeof classe !== 'string' || !classe) return null;
  const c = classe.toLowerCase();
  return CLASSI.find((x) => x.match.some((m) => c.includes(m))) || null;
}

function hexToRgb(h) {
  const s = h.replace('#', '');
  return { r: parseInt(s.slice(0, 2), 16), g: parseInt(s.slice(2, 4), 16), b: parseInt(s.slice(4, 6), 16) };
}

/** Mescola due colori esadecimali: t=0 → a, t=1 → b. */
function mescola(a, b, t) {
  const x = hexToRgb(a), y = hexToRgb(b);
  const canale = (u, v) => Math.round(u + (v - u) * t).toString(16).padStart(2, '0');
  return `#${canale(x.r, y.r)}${canale(x.g, y.g)}${canale(x.b, y.b)}`;
}

/** È notte? (dalle 20:00 alle 06:59). Serve al tema automatico per orario. */
function eNotte(d = new Date()) {
  const h = d.getHours();
  return h >= 20 || h < 7;
}

// Emoji rappresentativa per classe (chiave = primo alias in CLASSI) e per specie.
const EMOJI_CLASSE = {
  barbaro: '🪓', bardo: '🎵', chierico: '✨', druido: '🌿', guerriero: '⚔️', ladro: '🗡️',
  mago: '🔮', monaco: '👊', paladino: '🛡️', ranger: '🏹', stregone: '✴️', warlock: '👁️',
};
const EMOJI_SPECIE = [
  { m: ['drago', 'dragon'], e: '🐉' }, { m: ['tiefling'], e: '😈' }, { m: ['orc'], e: '👹' },
  { m: ['aasimar'], e: '😇' }, { m: ['goliath'], e: '🗿' }, { m: ['nano', 'dwarf'], e: '⛏️' },
  { m: ['elfo', 'elf'], e: '🧝' }, { m: ['gnomo', 'gnome'], e: '🧙' },
  { m: ['halfling', 'mezz'], e: '🧒' }, { m: ['umano', 'human'], e: '🧑' },
];

function emojiSpecie(specie) {
  const s = (specie || '').toLowerCase();
  return (EMOJI_SPECIE.find((x) => x.m.some((k) => s.includes(k))) || {}).e || '';
}

/** Genera un avatar SVG (data URL) che rappresenta classe e specie del PG. */
function generaAvatar(classe, specie, nome) {
  const seed = `${specie || 'Umano'}-${classe || 'Guerriero'}-${nome || 'Eroe'}`.replace(/\s+/g, '').toLowerCase();
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

const styles = {
  app: {
    minHeight: '100vh',
    background: 'transparent', // lo sfondo tematico è sul body (cambia con la classe)
    color: C.ink,
    fontFamily: "Georgia, 'Times New Roman', serif",
    padding: '0 16px 48px',
  },
  header: {
    maxWidth: 1080,
    margin: '0 auto 16px auto',
    padding: '12px 0 16px',
    textAlign: 'center',
  },
  title: { margin: 0, fontSize: 21, letterSpacing: 1, color: 'var(--c-title)' },
  hint: { margin: '3px 0 0', color: C.inkDim, fontStyle: 'italic', fontSize: 12 },
  main: { maxWidth: 1080, margin: '0 auto' },
  panel: {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    boxShadow: '0 1px 4px rgba(60,50,30,0.08)',
  },
  panelTitle: {
    margin: '0 0 10px',
    fontSize: 14,
    color: C.ink,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    borderBottom: `2px solid ${C.ink}`,
    paddingBottom: 5,
    letterSpacing: 1.5,
  },
  // campo in stile modulo: valore su riga con etichetta sotto
  moduloLabel: {
    fontSize: 8,
    color: C.inkDim,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  moduloCampo: { borderBottom: `1px solid ${C.border}`, minHeight: 18, paddingBottom: 0, width: '100%', display: 'flex', alignItems: 'center' },
  ritratto: {
    width: 132,
    height: 132,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    cursor: 'pointer',
    overflow: 'hidden',
    userSelect: 'none',
  },
  scudo: {
    width: 76,
    height: 84,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: C.panelLight,
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 62%, 50% 100%, 0% 62%)',
    border: `1px solid ${C.border}`,
  },
  // Barra del tiro (sticky in alto)
  rollBar: {
    position: 'sticky',
    top: 8,
    zIndex: 10,
    background: C.panel,
    border: `2px solid ${C.gold}`,
    borderRadius: 12,
    padding: '8px 12px',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    boxShadow: '0 4px 12px rgba(60,50,30,0.18)',
    minHeight: 48,
  },
  dado: (rolling, crit, fumble, facce = 20) => {
    let clipPath = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'; // default d20 hexagon
    if (facce === 4) clipPath = 'polygon(50% 10%, 95% 90%, 5% 90%)'; // Triangle
    else if (facce === 6) clipPath = 'polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)'; // Square
    else if (facce === 8) clipPath = 'polygon(50% 5%, 95% 50%, 50% 95%, 5% 50%)'; // Diamond
    else if (facce === 10 || facce === 100) clipPath = 'polygon(50% 5%, 95% 35%, 50% 95%, 5% 35%)'; // Kite
    else if (facce === 12) clipPath = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'; // Dodecagon approximation (use hexagon for now)

    return {
      width: 64,
      height: 64,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: facce === 20 ? 26 : 22,
      fontWeight: 'bold',
      color: crit ? C.goldDark : fumble ? C.red : C.ink,
      background: C.panelLight,
      border: `3px solid ${crit ? C.gold : fumble ? C.red : (COLORE_DADO[facce] || COLORE_DADO[20])}`,
      clipPath,
      animation: rolling ? 'd20-spin 0.5s linear infinite' : 'd20-settle 0.35s ease-out',
      userSelect: 'none',
      paddingTop: facce === 4 ? 12 : 0,
    };
  },
  badge: (color) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    border: `1px solid ${color}`,
    color,
    fontSize: 13,
    letterSpacing: 1,
    marginLeft: 8,
  }),
  detail: { color: C.inkDim, fontSize: 13 },
  button: {
    padding: '7px 14px',
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    color: C.ink,
    fontFamily: 'inherit',
    fontSize: 14,
    cursor: 'pointer',
  },
  buttonPrimary: {
    padding: '8px 18px',
    background: C.gold,
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: 15,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  buttonDanger: {
    padding: '4px 10px',
    background: 'transparent',
    border: `1px solid ${C.red}`,
    borderRadius: 6,
    color: C.red,
    fontFamily: 'inherit',
    fontSize: 12,
    cursor: 'pointer',
  },
  buttonMini: {
    padding: '5px 9px',
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.ink,
    fontFamily: 'inherit',
    fontSize: 14,
    lineHeight: 1,
    cursor: 'pointer',
    flexShrink: 0,
  },
  buttonDado: (facce) => ({
    padding: '5px 10px',
    background: COLORE_DADO[facce],
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 'bold',
    cursor: 'pointer',
  }),
  modeButton: (active) => ({
    padding: '5px 12px',
    background: active ? C.ink : 'transparent',
    border: `1px solid ${active ? C.ink : C.border}`,
    borderRadius: 6,
    color: active ? C.bg : C.inkDim,
    fontFamily: 'inherit',
    fontSize: 13,
    cursor: 'pointer',
  }),
  vitalBox: {
    textAlign: 'center',
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 7,
    padding: '4px 3px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 36,
  },
  vitalLabel: {
    fontSize: 9,
    color: C.inkDim,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  vitalValue: { fontSize: 16, color: C.ink },
  abilityBlock: {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: '8px 10px',
    marginBottom: 8,
    boxShadow: '0 1px 4px rgba(60,50,30,0.08)',
  },
  abilityHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  abilityMod: {
    fontSize: 26,
    fontWeight: 'bold',
    color: C.goldDark,
    cursor: 'pointer',
    padding: '0 8px',
    borderRadius: 8,
  },
  skillRow: (rollable) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '2px 4px',
    borderRadius: 6,
    cursor: rollable ? 'pointer' : 'default',
    fontSize: 14,
  }),
  dot: (livello) => ({
    width: 14,
    height: 14,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    color: livello === 2 ? C.goldDark : livello === 1 ? C.ink : C.inkDim,
    cursor: 'pointer',
    userSelect: 'none',
  }),
  editable: {
    borderBottom: `1px dashed ${C.inkDim}`,
    cursor: 'text',
    minWidth: 24,
    display: 'inline-block',
  },
  inlineInput: {
    background: C.panel,
    border: `1px solid ${C.gold}`,
    borderRadius: 4,
    color: C.ink,
    fontFamily: 'inherit',
    fontSize: 'inherit',
    padding: '1px 4px',
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.ink,
    fontFamily: 'inherit',
    fontSize: 14,
    padding: 8,
    resize: 'vertical',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left',
    color: C.inkDim,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    padding: '4px 8px',
    borderBottom: `1px solid ${C.border}`,
  },
  td: { padding: '6px 8px', borderBottom: `1px solid ${C.border}` },
  pip: (attivo, colore) => ({
    width: 12,
    height: 12,
    display: 'inline-block',
    margin: '0 2px',
    borderRadius: 3,
    transform: 'rotate(45deg)',
    border: `2px solid ${colore}`,
    background: attivo ? colore : 'transparent',
    cursor: 'pointer',
  }),
};

const GLOBAL_CSS = `
:root {
  --c-bg: #f4f1ea; --c-panel: #ffffff; --c-panel-light: #f7f4ee;
  --c-border: #ddd5c6; --c-ink: #2b2620; --c-ink-dim: #8d8272;
  --c-gold: #b8860b; --c-gold-dark: #8a6508; --c-red: #b03a2e;
  --c-green: #3e7d32; --c-title: #9e2b25;
}
:root[data-tema="scuro"] {
  --c-bg: #171310; --c-panel: #211b16; --c-panel-light: #2a231c;
  --c-border: #46392b; --c-ink: #e9dfcd; --c-ink-dim: #a0937f;
  --c-gold: #c9a227; --c-gold-dark: #dcb84f; --c-red: #d0685a;
  --c-green: #7fb069; --c-title: #de8f88;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-tema="chiaro"]) {
    --c-bg: #171310; --c-panel: #211b16; --c-panel-light: #2a231c;
    --c-border: #46392b; --c-ink: #e9dfcd; --c-ink-dim: #a0937f;
    --c-gold: #c9a227; --c-gold-dark: #dcb84f; --c-red: #d0685a;
    --c-green: #7fb069; --c-title: #de8f88;
  }
}
html, body { margin: 0; padding: 0; background: ${C.bg}; }
/* touch: il doppio tap deve tirare il dado, non zoomare la pagina */
* { touch-action: manipulation; }
/* sezioni collassabili: niente marcatore nativo, freccia che ruota */
.sezione > summary::-webkit-details-marker { display: none; }
.sezione .freccia { display: inline-block; transition: transform 0.15s; font-size: 11px; color: var(--c-ink-dim); }
.sezione:not([open]) .freccia { transform: rotate(-90deg); }
.griglia-scheda {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 10px;
  align-items: start;
}
/* consente alle colonne della griglia di stringersi (niente overflow orizzontale) */
.griglia-scheda > * { min-width: 0; }
/* riquadri vitali: 5 colonne fisse → riga 1: CA | PF(x2) | Riposo | TsMorte ; riga 2: BonusComp | Iniziativa | Velocità | PercPass */
.vitali { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 5px; align-items: stretch; }
/* consente ai riquadri di stringersi sotto la larghezza del contenuto (niente overflow) */
.vitali > * { min-width: 0; }
.vitali > * > * { min-width: 0; }
/* i campi anagrafica (con le tendine): font piccolo, padding compatto, allineati in basso */
.campi-anagrafica > * { min-width: 0; display: flex; flex-direction: column; justify-content: flex-end; }
.campi-anagrafica select { max-width: 100%; font-size: 11px !important; padding: 1px 2px !important; height: 20px; line-height: 1.2; }
.campi-anagrafica .campo-modulo-box { padding: 0 4px !important; min-height: 28px !important; height: 28px; display: flex; align-items: center; overflow: hidden; }
.campi-anagrafica .campo-modulo-label { font-size: 8px !important; margin-top: 1px; }
.selettore-personaggio {
  width: 100%;
  margin: 0 0 8px 0 !important;
}
@media (max-width: 820px) {
  .griglia-scheda { grid-template-columns: 1fr; }
  .selettore-personaggio { width: 100%; }
}
@media (max-width: 560px) {
  .anagrafica > div:last-child > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
}
/* su mobile i campi con font < 16px fanno zoomare iOS al focus */
@media (max-width: 820px) {
  input, select, textarea { font-size: 16px !important; }
}
@keyframes d20-spin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.12); }
  100% { transform: rotate(360deg) scale(1); }
}
@keyframes d20-settle {
  0% { transform: scale(1.25); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
/* elementi tirabili: tenendo premuto NON deve partire la selezione del testo
   (React non aggiunge i prefissi, Safari iOS/Mac richiede -webkit-user-select) */
.tirabile {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}
/* elemento "in carica" mentre tieni premuto: trema come un dado in mano */
.carica { animation: carica-dado 0.4s ease-in-out infinite; color: ${C.goldDark} !important; }
@keyframes carica-dado {
  0% { transform: rotate(-4deg) scale(1.08); }
  50% { transform: rotate(4deg) scale(1.14); }
  100% { transform: rotate(-4deg) scale(1.08); }
}
`;

// ---------------------------------------------------------------------------
// Regole D&D 5e e parser delle espressioni di dado
// ---------------------------------------------------------------------------

const CARATTERISTICHE = [
  { key: 'forza', label: 'Forza', abbr: 'FOR' },
  { key: 'destrezza', label: 'Destrezza', abbr: 'DES' },
  { key: 'costituzione', label: 'Costituzione', abbr: 'COS' },
  { key: 'intelligenza', label: 'Intelligenza', abbr: 'INT' },
  { key: 'saggezza', label: 'Saggezza', abbr: 'SAG' },
  { key: 'carisma', label: 'Carisma', abbr: 'CAR' },
];

// Le 18 abilità 5e, ciascuna legata alla sua caratteristica.
const ABILITA = [
  { key: 'acrobazia', label: 'Acrobazia', car: 'destrezza' },
  { key: 'addestrareAnimali', label: 'Addestrare Animali', car: 'saggezza' },
  { key: 'arcano', label: 'Arcano', car: 'intelligenza' },
  { key: 'atletica', label: 'Atletica', car: 'forza' },
  { key: 'furtivita', label: 'Furtività', car: 'destrezza' },
  { key: 'indagare', label: 'Indagare', car: 'intelligenza' },
  { key: 'inganno', label: 'Inganno', car: 'carisma' },
  { key: 'intimidire', label: 'Intimidire', car: 'carisma' },
  { key: 'intrattenere', label: 'Intrattenere', car: 'carisma' },
  { key: 'intuizione', label: 'Intuizione', car: 'saggezza' },
  { key: 'medicina', label: 'Medicina', car: 'saggezza' },
  { key: 'natura', label: 'Natura', car: 'intelligenza' },
  { key: 'percezione', label: 'Percezione', car: 'saggezza' },
  { key: 'persuasione', label: 'Persuasione', car: 'carisma' },
  { key: 'rapiditaDiMano', label: 'Rapidità di Mano', car: 'destrezza' },
  { key: 'religione', label: 'Religione', car: 'intelligenza' },
  { key: 'sopravvivenza', label: 'Sopravvivenza', car: 'saggezza' },
  { key: 'storia', label: 'Storia', car: 'intelligenza' },
];

const DENARI = [
  { key: 'mr', label: 'MR' },
  { key: 'ma', label: 'MA' },
  { key: 'me', label: 'ME' },
  { key: 'mo', label: 'MO' },
  { key: 'mp', label: 'MP' },
];

function modificatore(punteggio) {
  const p = Number(punteggio);
  if (!Number.isFinite(p)) return 0;
  return Math.floor((p - 10) / 2);
}

function conSegno(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

function tiraDado(facce) {
  return 1 + Math.floor(Math.random() * facce);
}

/**
 * Parser per espressioni di dado tipo "2d6+3", "1d8", "1d10+1d6+2", "d8-1".
 * Ritorna { termini: [{tipo:'dado', quantita, facce, segno} | {tipo:'fisso', valore, segno}] }
 * oppure null se l'espressione non è valida. Non lancia mai eccezioni.
 */
export function parseEspressioneDado(espressione) {
  if (typeof espressione !== 'string') return null;
  const pulita = espressione.toLowerCase().replace(/\s+/g, '');
  if (!pulita || /[^0-9d+\-]/.test(pulita)) return null;

  // Spezza in token con il proprio segno: "1d8+2-1d4" -> ["1d8", "+2", "-1d4"]
  const token = pulita.match(/[+-]?[^+-]+/g);
  if (!token || token.length > 20) return null;

  const termini = [];
  let dadiTotali = 0;
  for (const t of token) {
    const dado = t.match(/^([+-]?)(\d*)d(\d+)$/);
    if (dado) {
      const segno = dado[1] === '-' ? -1 : 1;
      const quantita = dado[2] === '' ? 1 : parseInt(dado[2], 10);
      const facce = parseInt(dado[3], 10);
      if (quantita < 1 || quantita > 100 || facce < 2 || facce > 1000) return null;
      dadiTotali += quantita;
      if (dadiTotali > 200) return null;
      termini.push({ tipo: 'dado', quantita, facce, segno });
      continue;
    }
    const fisso = t.match(/^([+-]?)(\d+)$/);
    if (fisso) {
      const segno = fisso[1] === '-' ? -1 : 1;
      termini.push({ tipo: 'fisso', valore: parseInt(fisso[2], 10), segno });
      continue;
    }
    return null;
  }
  if (!termini.some((t) => t.tipo === 'dado')) return null;
  return { termini };
}

// --- Dadi vita ------------------------------------------------------------
// In 5e il NUMERO di dadi vita è sempre pari al livello del personaggio; il
// TIPO di dado (d6…d12) dipende dalla classe. Ricaviamo le facce dalla stringa
// salvata e teniamo la quantità agganciata al livello.
const FACCE_DADO_VITA = [6, 8, 10, 12];

function facceDadoVita(espressione) {
  const dado = parseEspressioneDado(espressione)?.termini.find((t) => t.tipo === 'dado');
  return dado ? dado.facce : 8;
}

/** Espressione dei dadi vita coerente col livello, es. livello 3 + d8 → "3d8". */
function esprDadiVita(livello, facce) {
  return `${Math.max(1, Math.floor(livello) || 1)}d${facce}`;
}

/** Bonus di competenza corretto per il livello in 5e: +2 a lv 1, +1 ogni 4 livelli. */
function bonusCompetenzaDaLivello(livello) {
  return 2 + Math.floor((Math.max(1, Math.floor(livello) || 1) - 1) / 4);
}

/**
 * Tira un'espressione di danno già parsata.
 * Regola del critico 5e: con `critico` = true raddoppiano SOLO i dadi
 * (2d6+3 -> 4d6+3); il modificatore fisso resta invariato.
 */
export function tiraDanni(parsata, critico = false) {
  const dettagli = [];
  let totale = 0;
  for (const t of parsata.termini) {
    if (t.tipo === 'dado') {
      const quantita = t.quantita * (critico ? 2 : 1);
      const tiri = Array.from({ length: quantita }, () => tiraDado(t.facce));
      const somma = tiri.reduce((a, b) => a + b, 0);
      totale += t.segno * somma;
      dettagli.push(`${t.segno < 0 ? '-' : ''}${quantita}d${t.facce} [${tiri.join(', ')}]`);
    } else {
      totale += t.segno * t.valore;
      dettagli.push(`${t.segno < 0 ? '-' : '+'}${t.valore}`);
    }
  }
  return { totale: Math.max(0, totale), dettaglio: dettagli.join(' ') };
}

/** Tira il d20 nella modalità scelta: normale, vantaggio o svantaggio. */
function tiraD20(modalita) {
  const a = tiraDado(20);
  if (modalita === 'normale') return { naturale: a, dadi: [a] };
  const b = tiraDado(20);
  const naturale = modalita === 'vantaggio' ? Math.max(a, b) : Math.min(a, b);
  return { naturale, dadi: [a, b] };
}

// ---------------------------------------------------------------------------
// Modello della scheda
// ---------------------------------------------------------------------------

function schedaVuota() {
  return {
    nome: 'Avventuriero senza nome',
    ritratto: '', // immagine del personaggio come data URL (jpeg ridimensionato)
    background: '',
    classe: '',
    sottoclasse: '',
    specie: '',
    allineamento: '',
    livello: 1,
    pe: 0,
    ca: 10,
    pfMax: 10,
    pfAttuali: 10,
    pfTemp: 0,
    dadiVita: '1d8',
    dadiVitaSpesi: 0,
    velocita: 9,
    taglia: 'Media',
    bonusCompetenza: 2,
    ispirazione: false,
    tsMorte: { successi: 0, fallimenti: 0 },
    caratteristiche: {
      forza: 10,
      destrezza: 10,
      costituzione: 10,
      intelligenza: 10,
      saggezza: 10,
      carisma: 10,
    },
    // armatura indossata: con tipo 'manuale' vale il campo `ca`, altrimenti
    // la CA è calcolata (vedi caTotale)
    armatura: { nome: '', tipo: 'manuale', base: 11, scudo: false, bonus: 0 },
    condizioni: [],
    // true = competente nel tiro salvezza
    tiriSalvezza: {
      forza: false,
      destrezza: false,
      costituzione: false,
      intelligenza: false,
      saggezza: false,
      carisma: false,
    },
    // 0 = nessuna competenza, 1 = competenza, 2 = maestria (expertise)
    abilita: Object.fromEntries(ABILITA.map((a) => [a.key, 0])),
    attacchi: [{ id: 1, nome: 'Spada lunga', categoria: 'Azione', bonus: 5, danno: '1d8+3', tipoDanno: 'Tagliente', note: '' }],
    incantatore: { caratteristica: '' }, // '' = non incantatore
    slotIncantesimo: Object.fromEntries(
      Array.from({ length: 9 }, (_, i) => [i + 1, { totale: 0, spesi: 0 }])
    ),
    // trucchetti (livello 0) e incantesimi preparati
    incantesimiLista: [],
    privilegi: '',
    trattiSpecie: '',
    talenti: '',
    equipaggiamento: '',
    sintonia: '',
    lingue: '',
    aspetto: '',
    note: '',
    // stato di gioco
    risorse: [], // { id, nome, attuali, max, reset: 'breve' | 'lungo' | '' }
    sfinimento: 0, // livelli di sfinimento 0–6 (regole 2024)
    concentrazione: '', // incantesimo su cui ci si concentra ('' = niente)
    resistenze: '', // resistenze / immunità / vulnerabilità ai danni
    sensi: '', // scurovisione, percezione tremorsensitiva, ecc.
    addestramento: {
      armature: { leggera: false, media: false, pesante: false, scudi: false },
      armi: '',
      strumenti: '',
    },
    denari: { mr: 0, ma: 0, me: 0, mo: 0, mp: 0 },
  };
}

const TIPI_ARMATURA = [
  { key: 'manuale', label: 'CA a mano' },
  { key: 'nessuna', label: 'Senza armatura' },
  { key: 'leggera', label: 'Leggera (+DES)' },
  { key: 'media', label: 'Media (+DES max 2)' },
  { key: 'pesante', label: 'Pesante (fissa)' },
];

const CONDIZIONI_5E = [
  'Accecato', 'Affascinato', 'Afferrato', 'Assordato', 'Avvelenato',
  'Incapacitato', 'Invisibile', 'Paralizzato', 'Pietrificato',
  'Privo di sensi', 'Prono', 'Spaventato', 'Stordito', 'Trattenuto',
];

const LINGUE_5E = [
  'Abissale', 'Celestiale', 'Comune', 'Draconico', 'Elfico', 
  'Gigante', 'Gnomesco', 'Goblin', 'Halfling', 'Infernale', 
  'Nanico', 'Orchesco', 'Primordiale', 'Silvano', 'Sottocomune'
];

/**
 * CA totale in base all'equipaggiamento (regole 5e):
 * a mano = valore scritto · nessuna 10+DES · leggera base+DES ·
 * media base+min(DES,2) · pesante base. In tutti i casi si sommano
 * scudo (+2) ed eventuale bonus magico.
 */
function caTotale(scheda) {
  const a = scheda.armatura || {};
  const des = modificatore(scheda.caratteristiche.destrezza);
  let ca;
  if (a.tipo === 'nessuna') ca = 10 + des;
  else if (a.tipo === 'leggera') ca = (a.base || 0) + des;
  else if (a.tipo === 'media') ca = (a.base || 0) + Math.min(des, 2);
  else if (a.tipo === 'pesante') ca = a.base || 0;
  else ca = Number(scheda.ca) || 0; // 'manuale': valore scritto a mano
  return ca + (a.scudo ? 2 : 0) + (Number(a.bonus) || 0);
}

/** Bonus di un'abilità: mod caratteristica + competenza (1x o 2x per maestria). */
function bonusAbilita(scheda, abilita) {
  const def = ABILITA.find((a) => a.key === abilita);
  if (!def) return 0;
  const livComp = scheda.abilita[abilita] || 0;
  return modificatore(scheda.caratteristiche[def.car]) + livComp * scheda.bonusCompetenza;
}

/** Bonus di un tiro salvezza: mod caratteristica + eventuale competenza. */
function bonusTiroSalvezza(scheda, car) {
  return (
    modificatore(scheda.caratteristiche[car]) +
    (scheda.tiriSalvezza[car] ? scheda.bonusCompetenza : 0)
  );
}

const FLYORA_JSON = {
  nome: 'Flyora delle Acque Nere',
  classe: 'Stregone',
  sottoclasse: 'Magia Selvaggia',
  livello: 4,
  background: 'Eremita',
  specie: 'Elfo Alto',
  taglia: 'Media',
  allineamento: 'Neutrale',
  pe: 0,
  pfMax: 30,
  pfAttuali: 30,
  pfTemp: 0,
  dadiVita: '4d6',
  dadiVitaSpesi: 0,
  ca: 12,
  velocita: 9,
  ispirazione: false,
  sfinimento: 0,
  armatura: { tipo: 'manuale', base: 10, scudo: false, bonus: 0 },
  caratteristiche: { forza: 12, destrezza: 15, costituzione: 16, intelligenza: 14, saggezza: 15, carisma: 18 },
  tiriSalvezza: { forza: false, destrezza: false, costituzione: true, intelligenza: false, saggezza: false, carisma: true },
  abilita: {
    acrobazia: 0, addestrareAnimali: 0, arcano: 1, atletica: 0,
    furtivita: 0, indagare: 0, inganno: 1, intimidire: 0,
    intrattenere: 0, intuizione: 0, medicina: 1, natura: 0,
    percezione: 1, persuasione: 1, rapiditaDiMano: 0,
    religione: 1, sopravvivenza: 0, storia: 0
  },
  competenzeExtra: 'Armi semplici',
  resistenze: '',
  sensi: 'Scurovisione',
  condizioni: [],
  concentrazione: '',
  attacchi: [
    { id: 1, nome: 'Spada', caratteristica: 'destrezza', competenza: true, danno: '1d6+2', tipoDanno: 'Perforante', bonusAttacco: 0, bonusDanno: 0, note: 'Accurata, Leggera' },
    { id: 2, nome: 'Pugnale x2', caratteristica: 'destrezza', competenza: true, danno: '1d4+2', tipoDanno: 'Perforante', bonusAttacco: 0, bonusDanno: 0, note: '6/18m Accurata, Leggera, Lancio' },
    { id: 3, nome: 'Bastone Ferrato (1 mano)', caratteristica: 'forza', competenza: true, danno: '1d6+1', tipoDanno: 'Contundente', bonusAttacco: 0, bonusDanno: 0, note: 'Versatile' },
    { id: 4, nome: 'Bastone Ferrato (2 mani)', caratteristica: 'forza', competenza: true, danno: '1d8+1', tipoDanno: 'Contundente', bonusAttacco: 0, bonusDanno: 0, note: 'Versatile' }
  ],
  incantatore: { caratteristica: 'carisma', cdExtra: 0, attaccoExtra: 0 },
  slotIncantesimo: {
    1: { totale: 4, spesi: 0 },
    2: { totale: 3, spesi: 0 },
    3: { totale: 0, spesi: 0 },
    4: { totale: 0, spesi: 0 },
    5: { totale: 0, spesi: 0 },
    6: { totale: 0, spesi: 0 },
    7: { totale: 0, spesi: 0 },
    8: { totale: 0, spesi: 0 },
    9: { totale: 0, spesi: 0 }
  },
  incantesimiLista: [
    { livello: 0, nome: 'Interdizione alle Lame', tempo: 'AZ', gittata: 'contatto', note: 'V S, res. armi' },
    { livello: 0, nome: 'Messaggio', tempo: 'AZ', gittata: '36m', note: 'V S M' },
    { livello: 0, nome: 'Morsa del Gelo', tempo: 'AZ', gittata: '18m', note: 'V S' },
    { livello: 0, nome: 'Prestidigitazione', tempo: 'AZ', gittata: '3m', note: 'V S (Razza)' },
    { livello: 0, nome: 'Vampa', tempo: 'AZ', gittata: '18m', note: 'V S' },
    { livello: 1, nome: 'Caduta Morbida', tempo: 'REAZ', gittata: '18m', note: 'V M' },
    { livello: 1, nome: 'Individuazione del Magico', tempo: 'AZ', gittata: '9m', note: 'V S M, Rituale (Razza)' },
    { livello: 1, nome: 'Onda Tonante', tempo: 'AZ', gittata: 'cubo 4,5m', note: 'V S' },
    { livello: 1, nome: 'Scudo', tempo: 'REAZ', gittata: '', note: 'V S' },
    { livello: 1, nome: 'Dardo Incantato', tempo: 'AZ', gittata: '36m', note: 'V S' },
    { livello: 2, nome: 'Frantumare', tempo: 'AZ', gittata: '18m', note: 'V S M' },
    { livello: 2, nome: 'Immagine Speculare', tempo: 'AZ', gittata: '', note: 'V S' },
    { livello: 2, nome: 'Passo Velato', tempo: 'AZ BONUS', gittata: '', note: 'V' }
  ],
  risorse: [
    { id: 1, nome: 'Punti Stregoneria', max: 4, attuali: 4, ricarica: 'Lungo' },
    { id: 2, nome: 'Stregoneria Innata', max: 2, attuali: 2, ricarica: 'Lungo' },
    { id: 3, nome: 'Borsa del Guaritore', max: 10, attuali: 10, ricarica: 'Nessuno' }
  ],
  privilegi: "Stregoneria Innata\nFonte di Magia\nMetamagia: Incantesimo Celato, Preciso\nOnde di Caos",
  trattiSpecie: "Retaggio Fatato\nScurovisione\nTrance",
  talenti: "Guaritore\nIncantatore da Guerra",
  equipaggiamento: "Focus Arcano (Cristallo)\nBorsa da erborista\nGiaciglio\nLibro (filosofia)\nDotazione da avventuriero\nAbiti da viaggiatore",
  lingue: "Comune, Elfico",
  monete: { mr: 0, ma: 0, me: 0, mo: 74, mp: 0 },
  note: "Il personaggio ha trascorso i suoi primi anni rinchiuso in una capanna o un monastero..."
};

// Esempio pronto all'uso: Gnomo Mago.
const ESEMPIO_GNOMO = {
  nome: 'Boddynock Folgorio',
  background: 'Sapiente',
  classe: 'Mago',
  sottoclasse: 'Invocatore',
  specie: 'Gnomo delle Rocce',
  allineamento: 'Caotico Buono',
  livello: 10,
  pe: 64000,
  ca: 12,
  armatura: { nome: '', tipo: 'nessuna', base: 11, scudo: false, bonus: 0 },
  pfMax: 62,
  pfAttuali: 62,
  pfTemp: 0,
  dadiVita: '10d6',
  dadiVitaSpesi: 0,
  velocita: 7.5,
  taglia: 'Piccola',
  bonusCompetenza: 4,
  caratteristiche: { forza: 8, destrezza: 14, costituzione: 14, intelligenza: 20, saggezza: 12, carisma: 10 },
  tiriSalvezza: { forza: false, destrezza: false, costituzione: false, intelligenza: true, saggezza: true, carisma: false },
  abilita: { arcano: 1, storia: 1, indagare: 1, religione: 1 },
  attacchi: [
    { id: 1, nome: 'Dardo di Fuoco', bonus: 9, danno: '2d10', tipoDanno: 'Fuoco', note: 'Trucchetto, 36m' },
    { id: 2, nome: 'Raggio di Gelo', bonus: 9, danno: '2d8', tipoDanno: 'Freddo', note: 'Trucchetto, 18m, -3m velocità' },
    { id: 3, nome: 'Pugnale', bonus: 6, danno: '1d4+2', tipoDanno: 'Perforante', note: 'Accurata, Leggera, Lancio 6/18m' },
  ],
  incantatore: { caratteristica: 'intelligenza' },
  slotIncantesimo: {
    1: { totale: 4, spesi: 0 }, 2: { totale: 3, spesi: 0 }, 3: { totale: 3, spesi: 0 },
    4: { totale: 3, spesi: 0 }, 5: { totale: 2, spesi: 0 },
  },
  incantesimiLista: [
    { livello: 0, nome: 'Dardo di Fuoco', tempo: 'AZ', gittata: '36m', note: '' },
    { livello: 0, nome: 'Raggio di Gelo', tempo: 'AZ', gittata: '18m', note: '' },
    { livello: 0, nome: 'Luce', tempo: 'AZ', gittata: 'contatto', note: '' },
    { livello: 0, nome: 'Mano Magica', tempo: 'AZ', gittata: '9m', note: '' },
    { livello: 0, nome: 'Prestidigitazione', tempo: 'AZ', gittata: '3m', note: '' },
    { livello: 1, nome: 'Scudo', tempo: 'REAZ', gittata: '', note: '' },
    { livello: 1, nome: 'Dardo Incantato', tempo: 'AZ', gittata: '36m', note: '' },
    { livello: 1, nome: 'Individuazione del Magico', tempo: 'AZ', gittata: '9m', note: 'Rituale' },
    { livello: 2, nome: 'Immagine Speculare', tempo: 'AZ', gittata: '', note: '' },
    { livello: 2, nome: 'Passo Velato', tempo: 'AZ BONUS', gittata: '', note: '' },
    { livello: 3, nome: 'Palla di Fuoco', tempo: 'AZ', gittata: '45m', note: '8d6, TS DES' },
    { livello: 3, nome: 'Controincantesimo', tempo: 'REAZ', gittata: '18m', note: '' },
    { livello: 3, nome: 'Volare', tempo: 'AZ', gittata: 'contatto', note: 'Concentrazione' },
    { livello: 4, nome: 'Invisibilità Superiore', tempo: 'AZ', gittata: 'contatto', note: 'Concentrazione' },
    { livello: 5, nome: 'Cono di Freddo', tempo: 'AZ', gittata: 'cono 18m', note: '8d8, TS COS' },
  ],
  privilegi:
    'RECUPERO ARCANO: 1 volta al giorno, con un riposo breve recuperi slot per un totale di 5 livelli.\n' +
    'PLASMARE INCANTESIMI: crei varchi sicuri nelle aree dei tuoi incantesimi di invocazione.\n' +
    'INCANTESIMO POTENZIATO: aggiungi INT ai danni degli incantesimi di invocazione.',
  trattiSpecie:
    'ASTUZIA GNOMESCA: vantaggio ai TS di INT, SAG e CAR contro la magia.\n' +
    'SCUROVISIONE: vedi al buio entro 18 m.',
  talenti: 'Adepto Elementale (fuoco): i tuoi incantesimi ignorano la resistenza al fuoco; gli 1 sui dadi di danno da fuoco contano come 2.',
  equipaggiamento: 'Libro degli incantesimi, bacchetta (focus arcano), dotazione da studioso, pozione di guarigione x2',
  sintonia: 'Bacchetta della Guerra Magica (+1 ai tiri per colpire con incantesimo)',
  lingue: 'Comune, Gnomesco, Draconico',
  aspetto: 'Gnomo minuto dai capelli argentei sparati in ogni direzione, occhiali spessi e dita macchiate di inchiostro.',
  note:
    "Boddynock ha passato quarant'anni negli archivi di Candlekeep prima che un esperimento di invocazione andato storto gli incendiasse la barba e la carriera. " +
    'Da allora gira il mondo per dimostrare che la teoria, se ben applicata, esplode meglio della pratica.',
  addestramento: { armature: {}, armi: 'Pugnali, dardi, fionde, bastoni ferrati, balestre leggere', strumenti: '' },
  denari: { mo: 120 },
  risorse: [
    { id: 1, nome: 'Recupero arcano', attuali: 1, max: 1, reset: 'lungo' },
  ],
  sensi: 'Scurovisione 18 m',
  resistenze: '',
  sfinimento: 0,
  concentrazione: '',
};

// ---------------------------------------------------------------------------
// Persistenza su localStorage: roster di personaggi { attivo, personaggi }
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'scheda-interattiva:v1';
const STORAGE_KEY_LEGACY = 'tavolo-dei-dadi:scheda:v1';
const APP_VERSION = '1.6.0';

function nuovoId() {
  return 'pg-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function rosterVuoto() {
  const id = nuovoId();
  return { attivo: id, personaggi: { [id]: schedaVuota() } };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const roster = JSON.parse(raw);
      if (roster?.personaggi && roster.attivo && roster.personaggi[roster.attivo]) {
        // completa i campi eventualmente mancanti con i default correnti
        for (const id of Object.keys(roster.personaggi)) {
          const s = { ...schedaVuota(), ...roster.personaggi[id] };
          // i dadi vita seguono sempre il livello (numero = livello, tipo dalla classe)
          s.dadiVita = esprDadiVita(s.livello, facceDadoVita(s.dadiVita));
          roster.personaggi[id] = s;
        }
        return roster;
      }
    }
    // migrazione dal vecchio formato a scheda singola
    const vecchio = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (vecchio) {
      const id = nuovoId();
      return { attivo: id, personaggi: { [id]: { ...schedaVuota(), ...JSON.parse(vecchio) } } };
    }
  } catch {
    // dati corrotti: riparti da zero
  }
  return rosterVuoto();
}

function saveState(roster) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
  } catch {
    // storage pieno o non disponibile: ignora
  }
}


/** Normalizza i dati importati dal PDF (o da JSON/esempio) nel modello della scheda. */
function normalizeImported(dati) {
  const base = schedaVuota();
  if (!dati || typeof dati !== 'object') return base;

  const num = (v, fallback) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
  const str = (v, fallback = '') => (typeof v === 'string' ? v : fallback);

  const car = { ...base.caratteristiche };
  for (const { key } of CARATTERISTICHE) {
    const v = Number(dati.caratteristiche?.[key]);
    if (Number.isFinite(v) && v >= 1 && v <= 30) car[key] = v;
  }

  const ts = { ...base.tiriSalvezza };
  for (const { key } of CARATTERISTICHE) {
    ts[key] = Boolean(dati.tiriSalvezza?.[key]);
  }

  const abilita = { ...base.abilita };
  for (const { key } of ABILITA) {
    const v = dati.abilita?.[key];
    abilita[key] = v === 2 ? 2 : v === 1 || v === true ? 1 : 0;
  }

  const attacchi = Array.isArray(dati.attacchi)
    ? dati.attacchi
        .filter((a) => a && typeof a === 'object' && a.nome)
        .slice(0, 20)
        .map((a, i) => ({
          id: Date.now() + i,
          nome: String(a.nome),
          categoria: ['Azione', 'Bonus', 'Reazione'].includes(a.categoria) ? a.categoria : 'Azione',
          bonus: num(a.bonus, 0),
          danno: typeof a.danno === 'string' && parseEspressioneDado(a.danno) ? a.danno.trim() : '',
          tipoDanno: str(a.tipoDanno),
          note: str(a.note),
        }))
    : base.attacchi;

  const carIncantatore = CARATTERISTICHE.some((c) => c.key === dati.incantatore?.caratteristica)
    ? dati.incantatore.caratteristica
    : '';

  const slot = { ...base.slotIncantesimo };
  for (let liv = 1; liv <= 9; liv++) {
    const v = dati.slotIncantesimo?.[liv];
    const totale = Math.max(0, Math.min(9, num(typeof v === 'object' ? v?.totale : v, 0)));
    const spesi = Math.max(0, Math.min(totale, num(typeof v === 'object' ? v?.spesi : 0, 0)));
    slot[liv] = { totale, spesi };
  }

  const denari = { ...base.denari };
  for (const { key } of DENARI) {
    denari[key] = Math.max(0, num(dati.denari?.[key], 0));
  }

  const armatura = {
    nome: str(dati.armatura?.nome),
    tipo: TIPI_ARMATURA.some((t) => t.key === dati.armatura?.tipo) ? dati.armatura.tipo : 'manuale',
    base: Math.max(0, num(dati.armatura?.base, 11)),
    scudo: Boolean(dati.armatura?.scudo),
    bonus: num(dati.armatura?.bonus, 0),
  };
  const condizioni = Array.isArray(dati.condizioni)
    ? dati.condizioni.filter((c) => CONDIZIONI_5E.includes(c))
    : [];

  const incantesimiLista = Array.isArray(dati.incantesimiLista)
    ? dati.incantesimiLista
        .filter((s) => s && typeof s === 'object' && s.nome)
        .slice(0, 60)
        .map((s, i) => ({
          id: Date.now() + i,
          livello: Math.max(0, Math.min(9, num(s.livello, 0))),
          nome: String(s.nome),
          tempo: str(s.tempo),
          gittata: str(s.gittata),
          note: str(s.note),
        }))
    : [];

  const clampTs = (v) => Math.max(0, Math.min(3, num(v, 0)));
  const pfMax = num(dati.pfMax, base.pfMax);
  return {
    ...base,
    pfTemp: num(dati.pfTemp, 0),
    ispirazione: Boolean(dati.ispirazione),
    tsMorte: {
      successi: clampTs(dati.tsMorte?.successi),
      fallimenti: clampTs(dati.tsMorte?.fallimenti),
    },
    nome: str(dati.nome, base.nome) || base.nome,
    ritratto:
      typeof dati.ritratto === 'string' &&
      (dati.ritratto.startsWith('data:image/') || dati.ritratto.startsWith('https://api.dicebear.com')) &&
      dati.ritratto.length < 800000
        ? dati.ritratto
        : '',
    background: str(dati.background),
    classe: str(dati.classe),
    sottoclasse: str(dati.sottoclasse),
    specie: str(dati.specie),
    allineamento: str(dati.allineamento),
    livello: num(dati.livello, base.livello),
    pe: num(dati.pe, 0),
    ca: num(dati.ca, base.ca),
    armatura,
    condizioni,
    pfMax,
    pfAttuali: num(dati.pfAttuali, pfMax),
    dadiVita: esprDadiVita(num(dati.livello, base.livello), facceDadoVita(typeof dati.dadiVita === 'string' ? dati.dadiVita : base.dadiVita)),
    dadiVitaSpesi: Math.max(0, num(dati.dadiVitaSpesi, 0)),
    velocita: num(dati.velocita, base.velocita),
    taglia: str(dati.taglia, base.taglia) || base.taglia,
    bonusCompetenza: num(dati.bonusCompetenza, base.bonusCompetenza),
    caratteristiche: car,
    tiriSalvezza: ts,
    abilita,
    attacchi: attacchi.length ? attacchi : base.attacchi,
    incantatore: { caratteristica: carIncantatore },
    slotIncantesimo: slot,
    incantesimiLista,
    privilegi: str(dati.privilegi),
    trattiSpecie: str(dati.trattiSpecie),
    talenti: str(dati.talenti),
    equipaggiamento: str(dati.equipaggiamento),
    sintonia: str(dati.sintonia),
    lingue: str(dati.lingue),
    aspetto: str(dati.aspetto),
    note: str(dati.note),
    risorse: Array.isArray(dati.risorse)
      ? dati.risorse
          .filter((r) => r && typeof r === 'object')
          .slice(0, 20)
          .map((r, i) => ({
            id: Date.now() + i,
            nome: str(r.nome, 'Risorsa') || 'Risorsa',
            max: Math.max(0, num(r.max, 0)),
            attuali: Math.max(0, Math.min(Math.max(0, num(r.max, 0)), num(r.attuali, num(r.max, 0)))),
            reset: ['breve', 'lungo'].includes(r.reset) ? r.reset : '',
          }))
      : [],
    sfinimento: Math.max(0, Math.min(6, num(dati.sfinimento, 0))),
    concentrazione: str(dati.concentrazione),
    resistenze: str(dati.resistenze),
    sensi: str(dati.sensi),
    addestramento: {
      armature: {
        leggera: Boolean(dati.addestramento?.armature?.leggera),
        media: Boolean(dati.addestramento?.armature?.media),
        pesante: Boolean(dati.addestramento?.armature?.pesante),
        scudi: Boolean(dati.addestramento?.armature?.scudi),
      },
      armi: str(dati.addestramento?.armi),
      strumenti: str(dati.addestramento?.strumenti),
    },
    denari,
  };
}

// ---------------------------------------------------------------------------
// Componenti di editing inline (1 click = modifica, doppio click = tiro)
// ---------------------------------------------------------------------------

/**
 * Valore modificabile in linea. Un click apre l'editor; se `onRoll` è
 * definito, il click viene ritardato per distinguere il doppio click,
 * che invece lancia il tiro.
 */
function Editable({ value, onChange, onRoll, tipo = 'testo', width, style, title }) {
  const [editing, setEditing] = useState(false);
  const [bozza, setBozza] = useState('');
  const [carica, setCarica] = useState(false);
  const timerRef = useRef(null);
  const holdRef = useRef(null);
  const caricato = useRef(false);
  const ignoraClick = useRef(false);

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    clearTimeout(holdRef.current);
  }, []);

  function apriEditor() {
    setBozza(String(value ?? ''));
    setEditing(true);
  }

  // tieni premuto → carica → rilascia → tiro (solo se l'elemento è tirabile)
  function pointerDown(e) {
    if (!onRoll || e.button > 0) return;
    caricato.current = false;
    clearTimeout(holdRef.current);
    holdRef.current = setTimeout(() => {
      caricato.current = true;
      setCarica(true);
      navigator.vibrate?.(12); // feedback aptico su mobile: il dado è "in mano"
    }, SOGLIA_CARICA_MS);
  }

  function pointerUp() {
    if (!onRoll) return;
    clearTimeout(holdRef.current);
    if (caricato.current) {
      caricato.current = false;
      setCarica(false);
      ignoraClick.current = true; // il click che segue non deve aprire l'editor
      clearTimeout(timerRef.current);
      onRoll();
    }
  }

  function pointerAnnulla() {
    clearTimeout(holdRef.current);
    caricato.current = false;
    setCarica(false);
  }

  function handleClick(e) {
    e.stopPropagation();
    if (ignoraClick.current) {
      ignoraClick.current = false;
      return;
    }
    if (!onRoll) return apriEditor();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(apriEditor, 260);
  }

  function handleDoubleClick(e) {
    e.stopPropagation();
    if (!onRoll) return;
    clearTimeout(timerRef.current);
    onRoll();
  }

  function commit() {
    setEditing(false);
    if (tipo === 'numero') {
      const n = Number(bozza);
      onChange(Number.isFinite(n) ? n : 0);
    } else {
      onChange(bozza);
    }
  }

  if (editing) {
    return (
      <input
        style={{ ...styles.inlineInput, width: width || 70 }}
        autoFocus
        onFocus={(e) => e.target.select()}
        type={tipo === 'numero' ? 'number' : 'text'}
        value={bozza}
        onChange={(e) => setBozza(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
      />
    );
  }

  return (
    <span
      className={[onRoll ? 'tirabile' : '', carica ? 'carica' : ''].filter(Boolean).join(' ') || undefined}
      style={{ ...styles.editable, ...style }}
      title={title || (onRoll ? '1 click: modifica · tieni premuto o doppio click: tira' : '1 click: modifica')}
      onSelectStart={onRoll ? (e) => e.preventDefault() : undefined}
      onPointerDown={onRoll ? pointerDown : undefined}
      onPointerUp={onRoll ? pointerUp : undefined}
      onPointerLeave={onRoll ? pointerAnnulla : undefined}
      onPointerCancel={onRoll ? pointerAnnulla : undefined}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {String(value ?? '') === '' ? '—' : String(value)}
    </span>
  );
}

/**
 * Elemento tirabile stile Fantasy Grounds: tieni premuto (il valore "si
 * carica" e trema), rilascia e il dado parte. Il doppio click resta come
 * scorciatoia. `as` permette di renderizzare un div (es. righe abilità).
 */
const SOGLIA_CARICA_MS = 280;

function Rollable({ onRoll, children, style, title, as: Tag = 'span' }) {
  const [carica, setCarica] = useState(false);
  const timerRef = useRef(null);
  const caricato = useRef(false);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function inizia(e) {
    if (e.button > 0) return;
    caricato.current = false;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      caricato.current = true;
      setCarica(true);
      navigator.vibrate?.(12); // feedback aptico su mobile: il dado è "in mano"
    }, SOGLIA_CARICA_MS);
  }

  function rilascia() {
    clearTimeout(timerRef.current);
    if (caricato.current) {
      caricato.current = false;
      setCarica(false);
      onRoll();
    }
  }

  function annulla() {
    clearTimeout(timerRef.current);
    caricato.current = false;
    setCarica(false);
  }

  return (
    <Tag
      className={carica ? 'tirabile carica' : 'tirabile'}
      style={{
        cursor: 'pointer',
        display: Tag === 'span' ? 'inline-block' : undefined,
        ...style,
      }}
      title={title || 'Tieni premuto e rilascia (o doppio click): tira'}
      onSelectStart={(e) => e.preventDefault()}
      onPointerDown={inizia}
      onPointerUp={rilascia}
      onPointerLeave={annulla}
      onPointerCancel={annulla}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onRoll();
      }}
    >
      {children}
    </Tag>
  );
}

/** Campo in stile modulo ufficiale: valore su riga, etichetta minuscola sotto. */
function CampoModulo({ label, children, style }) {
  return (
    <div style={style}>
      <div className="campo-modulo-box" style={styles.moduloCampo}>{children}</div>
      <div className="campo-modulo-label" style={styles.moduloLabel}>{label}</div>
    </div>
  );
}

/**
 * Campo di testo libero (elementi separati da virgola) con un menù a tendina
 * "＋" per aggiungere velocemente voci da una lista, senza perdere il testo.
 */
function CampoConTendina({ value, opzioni, onChange, width, title }) {
  const attuali = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : [];
  
  const aggiungi = (v) => {
    if (!v) return;
    if (attuali.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...attuali, v].join(', '));
  };

  const rimuovi = (v) => {
    onChange(attuali.filter(x => x !== v).join(', '));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minHeight: 24 }} title={title}>
      {attuali.map(t => (
        <span key={t} style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, border: `1px solid rgba(255,255,255,0.15)` }}>
          {t}
          <button 
            style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '0 2px', fontSize: 14, lineHeight: 0.8, marginTop: -2 }} 
            onClick={() => rimuovi(t)} 
            title={`Rimuovi ${t}`}
          >
            ×
          </button>
        </span>
      ))}
      <span style={{ display: 'flex', gap: 4 }}>
        <select
          value=""
          onChange={(e) => aggiungi(e.target.value)}
          style={{ ...styles.inlineInput, appearance: 'none', fontSize: 13, padding: '2px 4px', width: 24, height: 24, textAlign: 'center', cursor: 'pointer' }}
          title="Aggiungi dalla lista"
        >
          <option value="">＋</option>
          {opzioni.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <input 
          type="text" 
          style={{ ...styles.inlineInput, fontSize: 12, padding: '2px 6px', width: 70, height: 24, background: 'transparent' }} 
          placeholder="Scrivi..." 
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              aggiungi(e.target.value.trim());
              e.target.value = '';
            }
          }}
          onBlur={(e) => {
            aggiungi(e.target.value.trim());
            e.target.value = '';
          }}
        />
      </span>
    </div>
  );
}

/**
 * Menù a tendina con opzioni predefinite più "Altro…" per un valore libero.
 * Se il valore corrente non è tra le opzioni, mostra sotto un campo di testo
 * così i valori personalizzati/importati non vanno persi.
 */
function CampoTendina({ value, opzioni, onChange, title }) {
  const std = Array.isArray(opzioni) ? opzioni.includes(value) : Object.values(opzioni).flat().includes(value);
  return (
    <>
      <select
        style={{
          background: 'transparent',
          border: 'none',
          color: C.ink,
          fontFamily: 'inherit',
          fontSize: 13,
          padding: '0 4px 0 0',
          width: '100%',
          outline: 'none',
          cursor: 'pointer',
        }}
        value={std ? value : value ? '__altro' : ''}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '__altro') onChange(std || !value ? 'Personalizzato' : value);
          else onChange(v);
        }}
        title={title}
      >
        <option value="" style={{ background: C.panel }}>Scegli…</option>
        {Array.isArray(opzioni) ? opzioni.map((o) => (
          <option key={o} value={o} style={{ background: C.panel }}>{o}</option>
        )) : Object.entries(opzioni).map(([group, opts]) => (
          <optgroup key={group} label={group} style={{ background: C.panel }}>
            {opts.map((o) => <option key={o} value={o} style={{ background: C.panel }}>{o}</option>)}
          </optgroup>
        ))}
        <option value="__altro" style={{ background: C.panel }}>Altro…</option>
      </select>
      {!std && value !== '' && (
        <div style={{ marginTop: 2 }}>
          <Editable value={value} onChange={onChange} width={80} style={{ fontSize: 13, borderBottom: 'none' }} title="Valore personalizzato" />
        </div>
      )}
    </>
  );
}

/** Area di testo per le sezioni descrittive della scheda. */
function AreaTesto({ value, onChange, righe = 2, placeholder }) {
  const ref = useRef(null);
  // cresce con il contenuto: niente altezza fissa e niente spazio morto
  const adatta = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(() => adatta(ref.current), [value]);
  return (
    <textarea
      ref={ref}
      style={{ ...styles.textarea, resize: 'none', overflow: 'hidden' }}
      rows={righe}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        onChange(e.target.value);
        adatta(e.target);
      }}
    />
  );
}

/**
 * Pannello con titolo collassabile (details/summary nativo). Di default aperto;
 * cliccando il titolo si richiude per risparmiare spazio verticale.
 * Con `manigliaProps` mostra un segnalino ⠿ per trascinare e riordinare.
 */
function Sezione({ titolo, children, aperto = true, manigliaProps, trascinando, style, innerRef }) {
  return (
    <details ref={innerRef} open={aperto} style={{ ...styles.panel, opacity: trascinando ? 0.4 : 1, ...style }} className="sezione">
      <summary style={{ ...styles.panelTitle, cursor: 'pointer', listStyle: 'none', marginBottom: 0, userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
        {manigliaProps && (
          <span
            className="tirabile"
            title="Trascina per riordinare le sezioni"
            style={{ cursor: 'grab', color: C.inkDim, fontSize: 15, lineHeight: 1, touchAction: 'none' }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            {...manigliaProps}
          >
            ⠿
          </span>
        )}
        <span className="freccia">▾</span> {titolo}
      </summary>
      <div style={{ marginTop: 10 }}>{children}</div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [roster, setRoster] = useState(loadState);
  const [modalita, setModalita] = useState('normale'); // normale | vantaggio | svantaggio
  const [rolling, setRolling] = useState(false);
  const [faccia, setFaccia] = useState(20);
  const [tipoDadoInUso, setTipoDadoInUso] = useState(20);
  const [tiro, setTiro] = useState(null);
  const [danni, setDanni] = useState(null);

  const [erroreImport, setErroreImport] = useState('');
  const [espressioneLibera, setEspressioneLibera] = useState('');
  const [erroreEspressione, setErroreEspressione] = useState(false);
  const [storico, setStorico] = useState([]);
  const [storicoAperto, setStoricoAperto] = useState(false);
  // tema: 'auto' = scuro se è notte OPPURE se il sistema è in scuro; oppure forzato
  const [tema, setTema] = useState(() => localStorage.getItem('scheda-interattiva:tema') || 'auto');
  const [sistemaScuro, setSistemaScuro] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [oraTick, setOraTick] = useState(0); // forza il ricalcolo quando cambia la fascia oraria

  // ordine (personalizzabile via drag) delle sezioni collassabili
  const [ordineSezioni, setOrdineSezioni] = useState(() => {
    let salvato = [];
    try {
      const s = JSON.parse(localStorage.getItem('scheda-interattiva:ordine-sezioni'));
      if (Array.isArray(s)) salvato = s;
    } catch {
      /* niente */
    }
    // mantieni l'ordine salvato, scarta id sconosciuti, aggiungi le sezioni nuove
    const ordinato = salvato.filter((id) => ORDINE_SEZIONI_DEFAULT.includes(id));
    for (const id of ORDINE_SEZIONI_DEFAULT) if (!ordinato.includes(id)) ordinato.push(id);
    return ordinato;
  });
  const [sezTrascinata, setSezTrascinata] = useState(null);
  // menu iniziale: si mostra solo al primo avvio (nessun PG reale); poi carica la scheda
  const [mostraMenu, setMostraMenu] = useState(() => {
    try {
      const r = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const s = r?.personaggi?.[r?.attivo];
      if (s && (s.nome || s.classe)) return false;
    } catch {
      /* niente */
    }
    return true;
  });
  const [rinominando, setRinominando] = useState(false); // rinomina inline del PG attivo
  const [mostraCrea, setMostraCrea] = useState(false); // schermata di creazione guidata
  const [bozzaCrea, setBozzaCrea] = useState({ nome: '', classe: '', specie: '', background: '', tira: true });
  // versione delle regole: '2024' (5.5, default) o '2014' (5.0)
  const [regoleVersione, setRegoleVersione] = useState(() => localStorage.getItem('scheda-interattiva:versione') || '2024');
  useEffect(() => {
    try { localStorage.setItem('scheda-interattiva:versione', regoleVersione); } catch { /* niente */ }
  }, [regoleVersione]);

  // Cloud Sync
  const [mostraCloud, setMostraCloud] = useState(false);
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('scheda-interattiva:github-token') || '');
  const [gistId, setGistId] = useState(() => localStorage.getItem('scheda-interattiva:gist-id') || '');
  const [cloudStatus, setCloudStatus] = useState({ text: '', type: '' });

  // Level Up
  const [mostraLevelUp, setMostraLevelUp] = useState(false);
  const [levelUpBozza, setLevelUpBozza] = useState({ metodo: 'media', hpLanciato: 0 });
  const ordineRef = useRef(ordineSezioni);
  ordineRef.current = ordineSezioni;
  const nodiSezioni = useRef({}); // id sezione → elemento DOM
  const dragSezione = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('scheda-interattiva:ordine-sezioni', JSON.stringify(ordineSezioni));
    } catch {
      /* niente */
    }
  }, [ordineSezioni]);

  function iniziaTrascinamento(e, id) {
    e.preventDefault();
    e.stopPropagation();
    dragSezione.current = id;
    setSezTrascinata(id);
    window.addEventListener('pointermove', duranteTrascinamento);
    window.addEventListener('pointerup', fineTrascinamento, { once: true });
  }

  function duranteTrascinamento(e) {
    const id = dragSezione.current;
    if (!id) return;
    const ord = ordineRef.current;
    const y = e.clientY;
    let to = ord.length;
    for (let i = 0; i < ord.length; i++) {
      const el = nodiSezioni.current[ord[i]];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (y < r.top + r.height / 2) { to = i; break; }
    }
    const from = ord.indexOf(id);
    const nuovo = ord.filter((x) => x !== id);
    nuovo.splice(to > from ? to - 1 : to, 0, id);
    if (nuovo.join('|') !== ord.join('|')) setOrdineSezioni(nuovo);
  }

  function fineTrascinamento() {
    dragSezione.current = null;
    setSezTrascinata(null);
    window.removeEventListener('pointermove', duranteTrascinamento);
  }

  /** Props per rendere una Sezione riordinabile via drag (maniglia + ordine). */
  const propsSez = (id) => ({
    style: { order: ordineSezioni.indexOf(id) },
    innerRef: (el) => {
      if (el) nodiSezioni.current[id] = el;
      else delete nodiSezioni.current[id];
    },
    manigliaProps: { onPointerDown: (e) => iniziaTrascinamento(e, id) },
    trascinando: sezTrascinata === id,
  });

  // ascolta il cambio di tema di sistema e ricontrolla l'orario ogni 5 minuti
  useEffect(() => {
    const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
    const onSistema = (e) => setSistemaScuro(e.matches);
    mq?.addEventListener?.('change', onSistema);
    const timer = setInterval(() => setOraTick((n) => n + 1), 5 * 60 * 1000);
    const onVisibile = () => setOraTick((n) => n + 1);
    document.addEventListener('visibilitychange', onVisibile);
    return () => {
      mq?.removeEventListener?.('change', onSistema);
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibile);
    };
  }, []);

  // scuro effettivo + tinta della classe → variabili CSS su :root
  const classeAttiva = roster.personaggi[roster.attivo]?.classe;
  useEffect(() => {
    const scuroEff =
      tema === 'scuro' || (tema === 'auto' && (sistemaScuro || eNotte()));
    const modo = scuroEff ? 'scuro' : 'chiaro';
    const t = { ...BASE_TEMA[modo] };
    const acc = coloreClasse(classeAttiva);
    if (acc) {
      const colore = acc[modo];
      t.title = colore;
      t.gold = colore;
      t.goldDark = colore;
      // tonalità: sfondo, pannelli e bordi virano leggermente verso il colore classe
      t.bg = mescola(t.bg, colore, scuroEff ? 0.07 : 0.05);
      t.panelLight = mescola(t.panelLight, colore, scuroEff ? 0.1 : 0.06);
      t.border = mescola(t.border, colore, 0.2);
    }
    const root = document.documentElement;
    root.dataset.tema = modo;
    const set = (k, v) => root.style.setProperty(k, v);
    set('--c-bg', t.bg); set('--c-panel', t.panel); set('--c-panel-light', t.panelLight);
    set('--c-border', t.border); set('--c-ink', t.ink); set('--c-ink-dim', t.inkDim);
    set('--c-gold', t.gold); set('--c-gold-dark', t.goldDark); set('--c-red', t.red);
    set('--c-green', t.green); set('--c-title', t.title);
    // sfondo della scheda: alone tematico che cambia con la classe selezionata
    const sfondo = acc
      ? `radial-gradient(130% 90% at 50% -12%, ${mescola(t.bg, acc[modo], scuroEff ? 0.22 : 0.16)}, ${t.bg} 58%)`
      : t.bg;
    document.body.style.background = sfondo;
    document.body.style.backgroundAttachment = 'fixed';
    try {
      localStorage.setItem('scheda-interattiva:tema', tema);
    } catch {
      // storage non disponibile: pazienza
    }
  }, [tema, sistemaScuro, oraTick, classeAttiva]);
  const intervalRef = useRef(null);
  const jsonRef = useRef(null);
  const ritrattoRef = useRef(null);

  const scheda = roster.personaggi[roster.attivo];

  useEffect(() => {
    saveState(roster);
  }, [roster]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  /** Aggiorna la scheda del personaggio attivo. */
  function setScheda(valore) {
    setRoster((r) => ({
      ...r,
      personaggi: {
        ...r.personaggi,
        [r.attivo]: typeof valore === 'function' ? valore(r.personaggi[r.attivo]) : valore,
      },
    }));
  }

  function aggiorna(patch) {
    setScheda((s) => ({ ...s, ...patch }));
  }

  /**
   * Rigenera l'avatar da classe/specie SOLO se non c'è una foto caricata
   * dall'utente (gli avatar generati sono SVG; le foto sono jpeg/png).
   */
  function ritrattoAuto(classe, specie, nome) {
    const r = scheda.ritratto;
    if (r && !r.startsWith('data:image/svg') && !r.startsWith('https://api.dicebear.com')) return {};
    return { ritratto: generaAvatar(classe, specie, nome || scheda.nome) };
  }

  /** Applica al background: imposta competenti le abilità concesse (senza togliere le altre). */
  function abilitaConBackground(bg) {
    const chiavi = BACKGROUND_COMPETENZE[bg] || [];
    if (!chiavi.length) return {};
    const abilita = { ...scheda.abilita };
    chiavi.forEach((k) => { abilita[k] = Math.max(abilita[k] || 0, 1); });
    return { abilita };
  }

  // --- gestione roster ---

  function nuovoPersonaggio(dati = schedaVuota()) {
    const id = nuovoId();
    setRoster((r) => ({ attivo: id, personaggi: { ...r.personaggi, [id]: dati } }));
  }

  /** Genera un personaggio coerente da classe/specie/background (creazione guidata). */
  function creaPersonaggio({ nome, classe, specie, background, tira }) {
    const s = schedaVuota();
    s.nome = nome?.trim() || 'Nuovo personaggio';
    s.classe = classe;
    s.specie = specie;
    s.background = background;
    // dati dalla classe: incantatore, dado vita, tiri salvezza, addestramento, slot
    const car = caratteristicaIncantatorePerClasse(classe);
    if (car) s.incantatore = { caratteristica: car };
    s.dadiVita = esprDadiVita(s.livello, dadoVitaClasse(classe));
    const ts = tiriSalvezzaPerClasse(classe);
    if (ts) s.tiriSalvezza = ts;
    const add = addestramentoPerClasse(classe);
    if (add) s.addestramento = { ...s.addestramento, armature: { ...add.armature }, armi: add.armi };
    const slot = slotDaClasseLivello(classe, s.livello);
    if (slot) s.slotIncantesimo = slot;
    // dati dalla specie: velocità, sensi, taglia, tratti
    const sp = SPECIE_DATI[specie];
    if (sp) { s.velocita = sp.velocita; s.sensi = sp.sensi; s.taglia = sp.taglia; s.trattiSpecie = sp.tratti; }
    // caratteristiche: tirate (4d6, ordinate per classe) o array base
    if (tira) s.caratteristiche = generaCaratteristiche(classe);
    // background: competenze nelle abilità
    (BACKGROUND_COMPETENZE[background] || []).forEach((k) => { s.abilita[k] = Math.max(s.abilita[k] || 0, 1); });
    // background: bonus alle caratteristiche (solo regole 2024)
    if (regoleVersione === '2024') {
      const [piu2, piu1] = bonusCaratteristicheBackground(background, classe);
      if (piu2) s.caratteristiche[piu2] = (s.caratteristiche[piu2] || 10) + 2;
      if (piu1) s.caratteristiche[piu1] = (s.caratteristiche[piu1] || 10) + 1;
    }
    // avatar e chiusura schermate
    s.ritratto = generaAvatar(classe, specie, s.nome);
    nuovoPersonaggio(s);
    setMostraCrea(false);
    setMostraMenu(false);
  }

  function duplicaPersonaggio() {
    nuovoPersonaggio({ ...scheda, nome: `${scheda.nome} (copia)` });
  }

  function eliminaPersonaggio() {
    if (!window.confirm(`Eliminare "${scheda.nome}"? L'operazione non si può annullare.`)) return;
    setRoster((r) => {
      const personaggi = { ...r.personaggi };
      delete personaggi[r.attivo];
      const ids = Object.keys(personaggi);
      if (ids.length === 0) return rosterVuoto();
      return { attivo: ids[0], personaggi };
    });
  }


  /** Azzera la scheda del personaggio attivo, mantenendolo nel roster. */
  function resetScheda() {
    if (!window.confirm(`Azzerare tutti i campi di "${scheda.nome}"? Il personaggio resta nella lista ma torna vuoto.`)) return;
    setScheda(schedaVuota());
    setTiro(null);
    setDanni(null);
    setStorico([]);
  }

  /**
   * Anima il d20 (facce che girano) per una breve durata, poi esegue `alFine`.
   * Usato da TUTTI i tiri così il dado "rotola" sempre, anche per danni,
   * dado libero, espressioni e dado vita.
   */
  function conAnimazione(alFine, facciaFinale, tipoDado = 20) {
    clearInterval(intervalRef.current);
    setTiro(null);
    setDanni(null);
    setRolling(true);
    setTipoDadoInUso(tipoDado);
    intervalRef.current = setInterval(() => setFaccia(tiraDado(tipoDado)), 70);
    setTimeout(() => {
      clearInterval(intervalRef.current);
      setRolling(false);
      if (facciaFinale !== undefined) setFaccia(facciaFinale);
      alFine();
    }, 700);
  }

  /** Registra una voce nello storico dei tiri della sessione. */
  function registra(voce) {
    setStorico((s) => [voce, ...s].slice(0, 30));
  }

  // --- tiri ---

  /** Tiro di d20 generico con animazione. `extra` finisce nello stato del tiro. */
  function lanciaD20(etichetta, bonus, extra = {}) {
    clearInterval(intervalRef.current);
    setDanni(null);
    setTiro(null);
    setRolling(true);
    setTipoDadoInUso(20);
    intervalRef.current = setInterval(() => setFaccia(tiraDado(20)), 70);

    // Sfinimento: nella 5.5 (2024) −2 a ogni tiro di d20 per livello; nella
    // 5.0 (2014) gli effetti sono condizionali (nessuna penalità fissa qui).
    const penSfinimento = regoleVersione === '2024' ? 2 * scheda.sfinimento : 0;
    const bonusEff = bonus - penSfinimento;
    const { naturale, dadi } = tiraD20(modalita);
    setTimeout(() => {
      clearInterval(intervalRef.current);
      setFaccia(naturale);
      setRolling(false);
      setTiro({ etichetta, naturale, dadi, bonus: bonusEff, totale: naturale + bonusEff, modalita, sfinimento: penSfinimento, ...extra });
      registra(
        `${etichetta}: ${naturale}${bonusEff ? ` ${conSegno(bonusEff)}` : ''} = ${naturale + bonusEff}` +
          (penSfinimento ? ` (sfinimento −${penSfinimento})` : '') +
          (naturale === 20 ? ' ⚔ critico' : naturale === 1 ? ' 💀' : '')
      );
      // Tira automaticamente i danni dopo il tiro a colpire, tranne se il d20 fa 1 (fallimento critico)
      if (extra.attacco && naturale !== 1 && parseEspressioneDado(extra.attacco.danno || '')) {
        setTimeout(() => tiraDanniPerAttacco(extra.attacco, naturale === 20), 650);
      }
    }, 850);
  }

  /** Tiro di danni diretto (senza tiro per colpire): mai critico. */
  function lanciaDanniDiretti(etichetta, espressione) {
    const parsata = parseEspressioneDado(espressione);
    if (!parsata) return;
    const maxFacce = Math.max(...parsata.map(p => p.facce).filter(Boolean));
    const esito = tiraDanni(parsata, false);
    conAnimazione(() => {
      setDanni({ etichetta, ...esito, critico: false });
      registra(`${etichetta}: ${esito.totale} (${esito.dettaglio})`);
    }, esito.totale, maxFacce || 20);
  }

  /** Tira i danni di un attacco (con eventuale critico), indipendente dallo stato. */
  function tiraDanniPerAttacco(attacco, critico) {
    const parsata = parseEspressioneDado(attacco?.danno || '');
    if (!parsata) return;
    const maxFacce = Math.max(...parsata.map(p => p.facce).filter(Boolean));
    const nome = attacco.nome;
    const esito = tiraDanni(parsata, critico);
    conAnimazione(() => {
      setDanni({ etichetta: `Danni: ${nome}`, ...esito, critico });
      registra(`Danni ${nome}: ${esito.totale}${critico ? ' ⚔ critico' : ''} (${esito.dettaglio})`);
    }, esito.totale, maxFacce || 20);
  }

  /** Danni dell'attacco corrente (dal tiro per colpire in corso). */
  function lanciaDanniAttacco() {
    if (!tiro?.attacco) return;
    tiraDanniPerAttacco(tiro.attacco, tiro.naturale === 20);
  }

  /** Tiro salvezza contro morte: regole 5e complete. */
  function tiroSalvezzaMorte() {
    clearInterval(intervalRef.current);
    setDanni(null);
    setTiro(null);
    setRolling(true);
    setTipoDadoInUso(20);
    intervalRef.current = setInterval(() => setFaccia(tiraDado(20)), 70);

    const { naturale, dadi } = tiraD20(modalita);
    setTimeout(() => {
      clearInterval(intervalRef.current);
      setFaccia(naturale);
      setRolling(false);
      let esito;
      setScheda((s) => {
        let { successi, fallimenti } = s.tsMorte;
        if (naturale === 20) {
          esito = '20 naturale: torni a 1 PF!';
          return { ...s, pfAttuali: 1, tsMorte: { successi: 0, fallimenti: 0 } };
        }
        if (naturale === 1) {
          fallimenti = Math.min(3, fallimenti + 2);
          esito = '1 naturale: due fallimenti!';
        } else if (naturale >= 10) {
          successi = Math.min(3, successi + 1);
          esito = 'Successo';
        } else {
          fallimenti = Math.min(3, fallimenti + 1);
          esito = 'Fallimento';
        }
        if (successi >= 3) esito = 'Terzo successo: sei stabile!';
        if (fallimenti >= 3) esito = 'Terzo fallimento: sei morto.';
        return { ...s, tsMorte: { successi, fallimenti } };
      });
      setTiro({
        etichetta: 'TS contro morte',
        naturale,
        dadi,
        bonus: 0,
        totale: naturale,
        modalita,
        esito,
      });
    }, 850);
  }

  /**
   * Spende un dado vita: tira 1 dado + mod COS, applica la guarigione ai PF
   * (fino al massimo) e segna il dado come speso.
   */
  function tiraDadoVita() {
    const facce = facceDadoVita(scheda.dadiVita);
    const totali = Math.max(1, scheda.livello || 1); // in 5e i dadi vita = livello
    if (scheda.dadiVitaSpesi >= totali) {
      setTiro(null);
      setDanni({
        etichetta: 'Dadi vita',
        totale: 0,
        dettaglio: 'hai già speso tutti i dadi vita (recuperi con un riposo lungo)',
        guarigione: true,
      });
      return;
    }
    const dado = tiraDado(facce);
    const mod = modificatore(scheda.caratteristiche.costituzione);
    const recupero = Math.max(0, dado + mod);
    conAnimazione(() => {
      setScheda((s) => ({
        ...s,
        pfAttuali: Math.min(s.pfMax, s.pfAttuali + recupero),
        dadiVitaSpesi: s.dadiVitaSpesi + 1,
      }));
      setDanni({
        etichetta: 'Dado vita speso (PF applicati)',
        totale: recupero,
        dettaglio: `1d${facce} [${dado}] ${conSegno(mod)}`,
        critico: false,
        guarigione: true,
      });
      registra(`Dado vita: +${recupero} PF`);
    }, dado);
  }

  /**
   * Riposo lungo 5e: PF al massimo, slot recuperati, metà dei dadi vita,
   * risorse (breve e lungo) ricaricate, uno sfinimento in meno.
   */
  function riposoLungo() {
    if (!window.confirm('Riposo lungo: PF al massimo, slot incantesimo recuperati, metà dei dadi vita, risorse ricaricate e uno sfinimento in meno. Procedere?')) return;
    setScheda((s) => {
      const slot = Object.fromEntries(
        Object.entries(s.slotIncantesimo).map(([liv, v]) => [liv, { ...v, spesi: 0 }])
      );
      const recuperoDadi = Math.max(1, Math.floor((s.livello || 1) / 2));
      return {
        ...s,
        pfAttuali: s.pfMax,
        pfTemp: 0,
        tsMorte: { successi: 0, fallimenti: 0 },
        slotIncantesimo: slot,
        dadiVitaSpesi: Math.max(0, s.dadiVitaSpesi - recuperoDadi),
        risorse: s.risorse.map((r) => (r.reset ? { ...r, attuali: r.max } : r)),
        sfinimento: Math.max(0, s.sfinimento - 1),
      };
    });
  }

  /** Riposo breve: ricarica le risorse "brevi" e spende un dado vita per curarti. */
  function riposoBreve() {
    setScheda((s) => ({
      ...s,
      risorse: s.risorse.map((r) => (r.reset === 'breve' ? { ...r, attuali: r.max } : r)),
    }));
    tiraDadoVita();
  }

  /** Tiro libero di un singolo dado (il d20 passa dal tiro animato). */
  function tiroLibero(facce) {
    if (facce === 20) return lanciaD20('Tiro libero d20', 0);
    const valore = tiraDado(facce);
    conAnimazione(() => {
      setDanni({ etichetta: 'Tiro libero', totale: valore, dettaglio: `1d${facce} [${valore}]`, libero: true });
      registra(`d${facce}: ${valore}`);
    }, valore, facce);
  }

  /** Tiro libero di un'espressione qualsiasi (es. "3d6+2"). */
  function tiroEspressione() {
    const parsata = parseEspressioneDado(espressioneLibera);
    if (!parsata) {
      setErroreEspressione(true);
      return;
    }
    setErroreEspressione(false);
    const testo = espressioneLibera.trim();
    const maxFacce = Math.max(...parsata.map(p => p.facce).filter(Boolean));
    const esito = tiraDanni(parsata, false);
    conAnimazione(() => {
      setDanni({ etichetta: `Tiro libero: ${testo}`, ...esito, libero: true });
      registra(`${testo}: ${esito.totale} (${esito.dettaglio})`);
    }, esito.totale, maxFacce || 20);
  }

  /** Carica l'immagine del personaggio: ridimensionata e salvata nella scheda. */
  function caricaRitratto(evento) {
    const file = evento.target.files?.[0];
    evento.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 512;
      const scala = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scala));
      canvas.height = Math.max(1, Math.round(img.height * scala));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      aggiorna({ ritratto: canvas.toDataURL('image/jpeg', 0.85) });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setErroreImport('Immagine non riconosciuta: usa un file JPG o PNG.');
    };
    img.src = url;
  }

  // --- import / export ---

  /** Scarica la scheda corrente come file JSON. */
  function esportaJson() {
    const nomeFile = (scheda.nome || 'scheda')
      .toLowerCase()
      .replace(/[^a-z0-9àèéìòù]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'scheda';
    const blob = new Blob([JSON.stringify(scheda, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomeFile}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Carica una scheda da file JSON come nuovo personaggio. */
  async function importaJson(evento) {
    const file = evento.target.files?.[0];
    evento.target.value = '';
    if (!file) return;
    setErroreImport('');
    try {
      const dati = JSON.parse(await file.text());
      nuovoPersonaggio(normalizeImported(dati));
      setMostraMenu(false);
    } catch {
      setErroreImport('File JSON non valido: usa un file esportato da Tavolo dei Dadi.');
    }
  }

  // --- Cloud Sync (GitHub Gist) ---

  async function salvaSuCloud() {
    if (!githubToken) {
      setCloudStatus({ text: 'Inserisci il GitHub Token per salvare.', type: 'error' });
      return;
    }
    try {
      setCloudStatus({ text: 'Salvataggio in corso...', type: 'info' });
      const dati = JSON.stringify(roster, null, 2);
      
      if (gistId) {
        const res = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ files: { 'roster_tavolo_dei_dadi.json': { content: dati } } })
        });
        if (!res.ok) throw new Error('Errore aggiornamento Gist. Token o ID non validi.');
        setCloudStatus({ text: '✅ Roster salvato su Cloud!', type: 'success' });
      } else {
        const res = await fetch(`https://api.github.com/gists`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: 'Salvataggio Cloud - Tavolo dei Dadi',
            public: false,
            files: { 'roster_tavolo_dei_dadi.json': { content: dati } }
          })
        });
        if (!res.ok) throw new Error('Errore creazione Gist. Token non valido.');
        const out = await res.json();
        setGistId(out.id);
        localStorage.setItem('scheda-interattiva:gist-id', out.id);
        setCloudStatus({ text: '✅ Nuovo salvataggio Cloud creato!', type: 'success' });
      }
    } catch (err) {
      setCloudStatus({ text: err.message, type: 'error' });
    }
  }

  async function caricaDaCloud() {
    if (!githubToken || !gistId) {
      setCloudStatus({ text: 'Inserisci Token e Gist ID per caricare.', type: 'error' });
      return;
    }
    try {
      setCloudStatus({ text: 'Caricamento in corso...', type: 'info' });
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      if (!res.ok) throw new Error('Errore caricamento. Token o ID non validi.');
      const out = await res.json();
      const file = out.files['roster_tavolo_dei_dadi.json'];
      if (!file) throw new Error('Il file "roster_tavolo_dei_dadi.json" non è presente nel Gist.');
      const parsed = JSON.parse(file.content);
      
      const loadedRoster = { attivo: parsed.attivo, personaggi: {} };
      for (const id in parsed.personaggi) {
        loadedRoster.personaggi[id] = normalizeImported(parsed.personaggi[id]);
      }
      if (!loadedRoster.attivo || !loadedRoster.personaggi[loadedRoster.attivo]) {
        loadedRoster.attivo = Object.keys(loadedRoster.personaggi)[0] || '';
      }
      
      setRoster(loadedRoster);
      setCloudStatus({ text: '✅ Roster caricato e sincronizzato!', type: 'success' });
    } catch (err) {
      setCloudStatus({ text: err.message, type: 'error' });
    }
  }

  const critico = tiro?.naturale === 20;
  const fallimento = tiro?.naturale === 1;
  const dannoAttaccoValido = tiro?.attacco && parseEspressioneDado(tiro.attacco.danno || '');
  const percezionePassiva = 10 + bonusAbilita(scheda, 'percezione');
  const modIncantatore = scheda.incantatore.caratteristica
    ? modificatore(scheda.caratteristiche[scheda.incantatore.caratteristica])
    : null;

  return (
    <div style={styles.app}>
      <style>{GLOBAL_CSS}</style>

      {mostraMenu && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000, padding: 16,
            background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setMostraMenu(false); }}
        >
          <div style={{ ...styles.panel, maxWidth: 460, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <h1 style={{ ...styles.title, textAlign: 'center', marginBottom: 16 }}>Tavolo dei Dadi</h1>

            <button
              style={{ ...styles.buttonPrimary, width: '100%', marginBottom: 14 }}
              onClick={() => { setBozzaCrea({ nome: '', classe: '', specie: '', background: '', tira: true }); setMostraCrea(true); }}
            >
              ➕ Nuovo personaggio
            </button>

            <div style={{ ...styles.detail, marginBottom: 6, fontWeight: 'bold' }}>Carica un personaggio</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {Object.entries(roster.personaggi).map(([id, p]) => (
                <div key={id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    style={{ ...styles.button, flex: 1, display: 'flex', justifyContent: 'space-between', gap: 10, textAlign: 'left' }}
                    onClick={() => { setRoster((r) => ({ ...r, attivo: id })); setMostraMenu(false); }}
                  >
                    <span>{p.nome || 'Senza nome'}</span>
                    <span style={styles.detail}>{p.classe ? `${p.classe}` : '—'}</span>
                  </button>
                  <button
                    style={{ ...styles.buttonDanger, padding: '4px 10px', fontSize: 13, flexShrink: 0 }}
                    title={`Elimina ${p.nome || 'questo personaggio'}`}
                    onClick={() => {
                      if (window.confirm(`Eliminare "${p.nome || 'Senza nome'}"? L'azione è irreversibile.`)) {
                        setRoster((r) => {
                          const nuovi = { ...r.personaggi };
                          delete nuovi[id];
                          const nuovoAttivo = r.attivo === id
                            ? (Object.keys(nuovi)[0] ?? null)
                            : r.attivo;
                          return { personaggi: nuovi, attivo: nuovoAttivo };
                        });
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {Object.keys(roster.personaggi).length === 0 && (
                <span style={styles.detail}>Nessun personaggio salvato.</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button style={styles.button} onClick={() => jsonRef.current?.click()}>📂 Da file JSON</button>
              <button
                style={styles.button}
                onClick={() => { nuovoPersonaggio(normalizeImported(FLYORA_JSON)); setMostraMenu(false); }}
                title="Carica la scheda di Flyora (liv. 4)"
              >
                ✨ Esempio (Flyora)
              </button>
            </div>
            {erroreImport && <div style={{ color: C.red, marginTop: 10 }}>{erroreImport}</div>}
          </div>
        </div>
      )}

      {mostraCloud && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1002, padding: 16,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setMostraCloud(false); }}
        >
          <div style={{ ...styles.panel, maxWidth: 460, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <h1 style={{ ...styles.title, textAlign: 'center', marginBottom: 12 }}>☁️ Sincronizzazione Cloud</h1>
            <p style={{ ...styles.detail, marginBottom: 16, lineHeight: 1.4 }}>
              Salva e carica i tuoi personaggi su un Gist privato di GitHub per sincronizzarli tra PC e telefono.
              <br />
              <a href="https://github.com/settings/tokens/new?scopes=gist&description=Tavolo+dei+Dadi+Cloud+Sync" target="_blank" rel="noreferrer" style={{ color: C.goldDark, textDecoration: 'underline' }}>
                Clicca qui per generare un GitHub Token gratuito
              </a> (seleziona lo scope "gist").
            </p>

            <label style={{ ...styles.detail, display: 'block', marginBottom: 3, fontWeight: 'bold' }}>GitHub Personal Access Token</label>
            <input
              type="password"
              style={{ ...styles.inlineInput, width: '100%', padding: '6px 8px', marginBottom: 12, fontSize: 13 }}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => {
                setGithubToken(e.target.value);
                localStorage.setItem('scheda-interattiva:github-token', e.target.value);
              }}
            />

            <label style={{ ...styles.detail, display: 'block', marginBottom: 3, fontWeight: 'bold' }}>Gist ID (creato automaticamente al primo salvataggio)</label>
            <input
              type="text"
              style={{ ...styles.inlineInput, width: '100%', padding: '6px 8px', marginBottom: 16, fontSize: 13, fontFamily: 'monospace' }}
              placeholder="Lascia vuoto se è il primo salvataggio"
              value={gistId}
              onChange={(e) => {
                setGistId(e.target.value);
                localStorage.setItem('scheda-interattiva:gist-id', e.target.value);
              }}
            />

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button style={{ ...styles.buttonPrimary, flex: 1 }} onClick={salvaSuCloud}>⬆️ Salva su Cloud</button>
              <button style={{ ...styles.button, flex: 1, borderColor: C.green, color: C.green }} onClick={caricaDaCloud}>⬇️ Carica da Cloud</button>
            </div>

            {cloudStatus.text && (
              <div style={{ padding: 10, borderRadius: 6, background: cloudStatus.type === 'error' ? 'rgba(255,0,0,0.1)' : cloudStatus.type === 'success' ? 'rgba(0,255,0,0.1)' : 'rgba(255,255,255,0.05)', color: cloudStatus.type === 'error' ? C.red : cloudStatus.type === 'success' ? C.green : C.goldDark, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
                {cloudStatus.text}
              </div>
            )}

            <button style={{ ...styles.button, width: '100%' }} onClick={() => setMostraCloud(false)}>Chiudi</button>
          </div>
        </div>
      )}

      {mostraLevelUp && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1002, padding: 16,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setMostraLevelUp(false); }}
        >
          <div style={{ ...styles.panel, maxWidth: 400, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <h1 style={{ ...styles.title, textAlign: 'center', marginBottom: 12 }}>⬆️ Passaggio di Livello</h1>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              Da livello <strong>{scheda.livello || 1}</strong> a livello <strong>{(scheda.livello || 1) + 1}</strong>
            </div>

            <p style={{ ...styles.detail, marginBottom: 16, lineHeight: 1.4 }}>
              Scegli come ottenere i tuoi nuovi Punti Ferita massimi. Il tuo modificatore di Costituzione ({conSegno(levelUpBozza.modCos)}) viene aggiunto in automatico.
            </p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div
                style={{ ...styles.button, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, borderColor: levelUpBozza.metodo === 'media' ? C.goldDark : C.border, background: levelUpBozza.metodo === 'media' ? 'rgba(255,215,0,0.1)' : 'transparent' }}
                onClick={() => setLevelUpBozza((b) => ({ ...b, metodo: 'media' }))}
              >
                <div style={{ fontWeight: 'bold' }}>Media Fissa</div>
                <div style={{ fontSize: 24, color: C.goldDark }}>+{levelUpBozza.hpGainMedia} PF</div>
                <div style={styles.detail}>Veloce e sicuro</div>
              </div>
              <div
                style={{ ...styles.button, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, borderColor: levelUpBozza.metodo === 'tiro' ? C.goldDark : C.border, background: levelUpBozza.metodo === 'tiro' ? 'rgba(255,215,0,0.1)' : 'transparent' }}
                onClick={() => setLevelUpBozza((b) => ({ ...b, metodo: 'tiro' }))}
              >
                <div style={{ fontWeight: 'bold' }}>Tira il Dado (1d{levelUpBozza.facceDV})</div>
                <div style={{ fontSize: 24, color: C.goldDark }}>
                  {levelUpBozza.tiroFatto > 0 ? `+${Math.max(1, levelUpBozza.tiroFatto + levelUpBozza.modCos)} PF` : '?'}
                </div>
                <div style={styles.detail}>
                  {levelUpBozza.tiroFatto > 0 ? `(Hai tirato ${levelUpBozza.tiroFatto})` : <button style={{ ...styles.buttonMini, fontSize: 12 }} onClick={(e) => { e.stopPropagation(); setLevelUpBozza((b) => ({ ...b, tiroFatto: Math.floor(Math.random() * b.facceDV) + 1, metodo: 'tiro' })); }}>Tira Ora</button>}
                </div>
              </div>
            </div>

            <button
              style={{ ...styles.buttonPrimary, width: '100%', marginBottom: 12 }}
              disabled={levelUpBozza.metodo === 'tiro' && !levelUpBozza.tiroFatto}
              onClick={() => {
                const gain = levelUpBozza.metodo === 'media' ? levelUpBozza.hpGainMedia : Math.max(1, levelUpBozza.tiroFatto + levelUpBozza.modCos);
                const nuovoLivello = (scheda.livello || 1) + 1;
                const dvAttuale = String(scheda.dadiVita || '').split('d')[1] || '8';
                
                aggiorna({
                  livello: nuovoLivello,
                  pfMax: scheda.pfMax + gain,
                  pfAttuali: scheda.pfAttuali + gain, // Cura automatica dei PF appena guadagnati
                  dadiVita: `${nuovoLivello}d${dvAttuale}`, // Aggiorna formula dadi vita totali
                  bonusCompetenza: bonusCompetenzaDaLivello(nuovoLivello)
                });
                setMostraLevelUp(false);
              }}
            >
              🚀 Conferma Level Up
            </button>
            <button style={{ ...styles.button, width: '100%' }} onClick={() => setMostraLevelUp(false)}>Annulla</button>
          </div>
        </div>
      )}

      {mostraCrea && (() => {
        const setB = (patch) => setBozzaCrea((b) => ({ ...b, ...patch }));
        const stileSelect = { ...styles.inlineInput, width: '100%', padding: '6px 8px', fontSize: 15 };
        const bonusBg = regoleVersione === '2024' ? bonusCaratteristicheBackground(bozzaCrea.background, bozzaCrea.classe) : [];
        return (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1001, padding: 16, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={(e) => { if (e.target === e.currentTarget) setMostraCrea(false); }}
          >
            <div style={{ ...styles.panel, maxWidth: 460, width: '100%', maxHeight: '88vh', overflowY: 'auto' }}>
              <h1 style={{ ...styles.title, marginBottom: 12 }}>➕ Nuovo personaggio</h1>

              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
                <span style={styles.detail}>Versione:</span>
                {['2024', '2014'].map((v) => (
                  <button key={v} style={{ ...styles.modeButton(regoleVersione === v), fontSize: 12, padding: '3px 10px' }} onClick={() => setRegoleVersione(v)}>
                    {v === '2024' ? 'D&D 5.5' : 'D&D 5.0'}
                  </button>
                ))}
              </div>

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>Nome</label>
              <input style={{ ...stileSelect, marginBottom: 12 }} value={bozzaCrea.nome} placeholder="Nome del personaggio" onChange={(e) => setB({ nome: e.target.value })} />

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>Classe</label>
              <select style={{ ...stileSelect, marginBottom: 12 }} value={bozzaCrea.classe} onChange={(e) => setB({ classe: e.target.value })}>
                <option value="">Scegli…</option>
                {NOMI_CLASSI.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>{regoleVersione === '2024' ? 'Specie' : 'Razza'}</label>
              <select style={{ ...stileSelect, marginBottom: 12 }} value={bozzaCrea.specie} onChange={(e) => setB({ specie: e.target.value })}>
                <option value="">Scegli…</option>
                {Object.entries(SPECIE_5E).map(([g, opts]) => (
                  <optgroup key={g} label={g}>
                    {opts.map((n) => <option key={n} value={n}>{n}</option>)}
                  </optgroup>
                ))}
              </select>

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>Background</label>
              <select style={{ ...stileSelect, marginBottom: 6 }} value={bozzaCrea.background} onChange={(e) => setB({ background: e.target.value })}>
                <option value="">Scegli…</option>
                {BACKGROUND_5E.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              {bozzaCrea.background && (
                <div style={{ ...styles.detail, marginBottom: 12, fontSize: 11 }}>
                  Competenze: {(BACKGROUND_COMPETENZE[bozzaCrea.background] || []).map((k) => ABILITA.find((a) => a.key === k)?.label).join(', ')}
                  {bonusBg.length > 0 && ` · Caratteristiche: +2 ${bonusBg[0]?.slice(0, 3).toUpperCase()}, +1 ${bonusBg[1]?.slice(0, 3).toUpperCase()}`}
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
                <input type="checkbox" checked={bozzaCrea.tira} onChange={(e) => setB({ tira: e.target.checked })} />
                <span style={styles.detail}>Tira le caratteristiche (4d6, scarta il più basso, ordinate per classe)</span>
              </label>

              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ ...styles.buttonPrimary, flex: 1 }} onClick={() => creaPersonaggio(bozzaCrea)}>Crea personaggio</button>
                <button style={styles.button} onClick={() => setMostraCrea(false)}>Annulla</button>
              </div>
            </div>
          </div>
        );
      })()}

      <header style={{ ...styles.header, position: 'relative' }}>
        <h1 style={styles.title}>Tavolo dei Dadi <span style={{ fontSize: 11, color: C.inkDim, fontWeight: 'normal', letterSpacing: 0.5 }}>v{APP_VERSION}</span></h1>

        <div style={{ position: 'absolute', left: 0, top: 12, display: 'flex', gap: 6 }}>
          <button
            style={styles.modeButton(false)}
            title="Menu iniziale: nuovo personaggio, carica"
            onClick={() => setMostraMenu(true)}
          >
            🏠 Menu
          </button>
          <button
            style={{ ...styles.modeButton(mostraCloud), color: C.goldDark, borderColor: C.goldDark }}
            title="Sincronizza i tuoi personaggi sul Cloud GitHub"
            onClick={() => { setCloudStatus({ text: '', type: '' }); setMostraCloud(true); }}
          >
            ☁️ Cloud
          </button>
        </div>
        <button
          style={{ ...styles.modeButton(false), position: 'absolute', right: 0, top: 12 }}
          title="Tema: Auto diventa scuro di notte o se il sistema è in modalità scura. I colori della scheda seguono la classe del personaggio."
          onClick={() => setTema(tema === 'auto' ? 'chiaro' : tema === 'chiaro' ? 'scuro' : 'auto')}
        >
          {tema === 'auto' ? '🌗 Auto' : tema === 'chiaro' ? '☀️ Chiaro' : '🌙 Scuro'}
        </button>
      </header>

      <main style={styles.main}>
        {/* Barra del tiro */}
        <div style={styles.rollBar}>
          <div style={styles.dado(rolling, !rolling && (tiro?.naturale === 20 || danni?.critico), !rolling && (tiro?.naturale === 1), tipoDadoInUso)}>{faccia}</div>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {rolling ? (
              <div style={{ fontSize: 24, fontWeight: 'bold', color: C.inkDim, marginLeft: 16 }}>Tirando...</div>
            ) : tiro ? (
              <div style={{ marginLeft: 16 }}>
                <div style={{ fontSize: 13, color: C.inkDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{tiro.etichetta}</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  {tiro.naturale} {tiro.bonus !== 0 && `${conSegno(tiro.bonus)} `}= <strong>{tiro.totale}</strong>
                </div>
                <div style={styles.detail}>
                  {tiro.dadi.length > 1 && ` · ${tiro.modalita} [${tiro.dadi.join(', ')}] → ${tiro.naturale}`}
                </div>
                {tiro.naturale === 20 && <span style={styles.badge(C.goldDark)}>⚔ CRITICO! 20 naturale</span>}
                {tiro.naturale === 1 && <span style={styles.badge(C.red)}>💀 1 naturale</span>}
                {tiro.esito && <span style={styles.badge(C.goldDark)}>{tiro.esito}</span>}
                {tiro.attacco && tiro.naturale !== 1 && (
                  parseEspressioneDado(tiro.attacco.danno || '') ? (
                    tiro.naturale === 20 ? (
                      <div style={{ ...styles.detail, marginTop: 6, color: C.goldDark, fontWeight: 'bold' }}>
                        ⚔ Critico! Tiro i danni raddoppiati…
                      </div>
                    ) : (
                      <button style={{ ...styles.buttonPrimary, marginTop: 6 }} onClick={lanciaDanniAttacco}>
                        🗡 Tira danni ({tiro.attacco.danno})
                      </button>
                    )
                  ) : (
                    <div style={styles.detail}>Danno non impostato o non valido per questo attacco.</div>
                  )
                )}
              </div>
            ) : danni ? (
              <div style={{ marginLeft: 16 }}>
                <div style={{ fontSize: 13, color: C.inkDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
                  {danni.etichetta}
                </div>
                <div style={{ fontSize: 24, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {danni.libero ? '' : danni.guarigione ? '✚' : '💥'} <strong>{danni.totale}</strong>
                  {danni.libero ? '' : danni.guarigione ? ' PF recuperati' : ' danni'}
                  {danni.critico && <span style={styles.badge(C.goldDark)}>⚔ CRITICO!</span>}
                </div>
                <div style={{ ...styles.detail, marginTop: 4 }}>
                  Dettaglio: {danni.dettaglio}
                </div>
              </div>
            ) : (
              <div style={{ ...styles.detail, marginLeft: 16 }}>
                Tieni premuto un valore (caratteristiche, tiri salvezza, abilità, attacchi,
                iniziativa…), rilascia e il dado rotola qui. Funziona anche il doppio click.
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {['normale', 'vantaggio', 'svantaggio'].map((m) => (
              <button key={m} style={styles.modeButton(modalita === m)} onClick={() => setModalita(m)}>
                {m === 'normale' ? 'Normale' : m === 'vantaggio' ? 'Vantaggio' : 'Svantaggio'}
              </button>
            ))}
            <button
              style={styles.modeButton(storicoAperto)}
              title="Cronologia dei tiri della sessione"
              onClick={() => setStoricoAperto(!storicoAperto)}
            >
              Cronologia
            </button>
          </div>
        </div>

        {storicoAperto && (
          <section style={{ ...styles.panel, padding: '10px 16px' }}>
            <h2 style={{ ...styles.panelTitle, fontSize: 13 }}>Cronologia</h2>
            {storico.length === 0 ? (
              <div style={styles.detail}>Ancora nessun tiro in questa sessione.</div>
            ) : (
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: C.ink }}>
                {storico.map((voce, i) => (
                  <li key={`${i}-${voce}`} style={{ padding: '1px 0', color: i === 0 ? C.ink : C.inkDim }}>
                    {voce}
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        {/* Dado libero */}
        <section style={{ ...styles.panel, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', padding: '6px 12px' }}>
          <span style={{ ...styles.detail, marginRight: 2 }}>Dado:</span>
          {[4, 6, 8, 10, 12, 20, 100].map((facce) => (
            <button key={facce} style={styles.buttonDado(facce)} onClick={() => tiroLibero(facce)}>
              d{facce}
            </button>
          ))}
          <span style={{ flex: 1 }} />
          <input
            style={{
              ...styles.inlineInput,
              width: 110,
              padding: '6px 8px',
              ...(erroreEspressione ? { borderColor: C.red } : {}),
            }}
            placeholder="es. 3d6+2"
            value={espressioneLibera}
            onChange={(e) => {
              setEspressioneLibera(e.target.value);
              setErroreEspressione(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && tiroEspressione()}
          />
          <button style={styles.button} onClick={tiroEspressione}>
            Tira
          </button>
          {erroreEspressione && <span style={{ color: C.red, fontSize: 13 }}>Espressione non valida</span>}
        </section>

        {/* Personaggi: il riquadro blu È il nome/selettore. Cambia PG al volo; ✎ per rinominare */}
        <section className="selettore-personaggio" style={{ ...styles.panel, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap', padding: '6px 12px' }}>
          {rinominando ? (
            <input
              autoFocus
              style={{ ...styles.inlineInput, flex: 1, minWidth: 0, fontSize: 16, fontWeight: 'bold', color: 'var(--c-title)' }}
              value={scheda.nome}
              onChange={(e) => aggiorna({ nome: e.target.value })}
              onBlur={() => {
                setRinominando(false);
                const rPatch = ritrattoAuto(scheda.classe, scheda.specie, scheda.nome);
                if (rPatch.ritratto) aggiorna(rPatch);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  setRinominando(false);
                  const rPatch = ritrattoAuto(scheda.classe, scheda.specie, scheda.nome);
                  if (rPatch.ritratto) aggiorna(rPatch);
                }
              }}
            />
          ) : (
            <select
              style={{ ...styles.inlineInput, flex: 1, minWidth: 0, fontSize: 16, fontWeight: 'bold', color: 'var(--c-title)', padding: '5px 8px' }}
              value={roster.attivo}
              onChange={(e) => setRoster((r) => ({ ...r, attivo: e.target.value }))}
              title="Personaggio attivo — scegli per cambiare al volo"
            >
              {Object.entries(roster.personaggi).map(([id, p]) => (
                <option key={id} value={id}>
                  {p.nome || 'Senza nome'}{p.classe ? ` · ${p.classe}` : ''}
                </option>
              ))}
            </select>
          )}

          <div style={{ fontSize: 15, fontWeight: 'bold', color: C.goldDark, display: 'flex', alignItems: 'center', gap: 4, marginRight: 8, paddingLeft: 4 }}>
            Liv. <Editable value={scheda.livello} tipo="numero" width={26} onChange={(v) => aggiorna({ livello: Math.max(1, Math.min(20, v)) })} />
            <button
              style={{ ...styles.buttonMini, marginLeft: 2, padding: '2px 4px', fontSize: 14 }}
              title="Assistente al Passaggio di Livello"
              onClick={() => {
                const dvMatch = String(scheda.dadiVita || '').match(/d(\d+)/i);
                const facceDV = dvMatch ? parseInt(dvMatch[1]) : 8;
                const modCos = modificatore(scheda.caratteristiche?.costituzione || 10) || 0;
                const avgHpGain = Math.floor(facceDV / 2) + 1 + modCos;
                setLevelUpBozza({ metodo: 'media', hpGainMedia: Math.max(1, avgHpGain), facceDV, modCos, tiroFatto: 0 });
                setMostraLevelUp(true);
              }}
            >
              ⬆️
            </button>
          </div>
          <button style={styles.buttonMini} onClick={() => setRinominando(!rinominando)} title="Rinomina il personaggio">✎</button>
          <button style={styles.buttonMini} onClick={() => { setBozzaCrea({ nome: '', classe: '', specie: '', background: '', tira: true }); setMostraCrea(true); }} title="Nuovo personaggio">＋</button>
          <button style={styles.buttonMini} onClick={duplicaPersonaggio} title="Duplica il personaggio attivo">⧉</button>
          <button style={styles.buttonMini} onClick={resetScheda} title="Azzera i campi del personaggio attivo">↺</button>
          <button style={{ ...styles.buttonMini, borderColor: C.red, color: C.red }} onClick={eliminaPersonaggio} title="Elimina il personaggio attivo">🗑</button>
        </section>

        {/* Testata: anagrafica + riquadri vitali uniformi */}
        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>Profilo e Statistiche</h2>
          <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
            <div style={{ flex: '0 0 160px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '100%', flex: 1, minHeight: 240, borderRadius: 12, overflow: 'hidden',
                  background: C.panel, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)', border: `2px solid ${coloreClasse(scheda.classe)}`,
                  cursor: 'pointer', position: 'relative',
                }}
                title={scheda.ritratto ? 'Click: cambia immagine' : 'Click: carica l’immagine del personaggio'}
                onClick={() => ritrattoRef.current?.click()}
              >
                {scheda.ritratto ? (
                  <img
                    src={scheda.ritratto}
                    alt={`Ritratto di ${scheda.nome}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: C.inkDim }}>
                    <div style={{ fontSize: 24 }}>🖼</div>
                    <div style={{ fontSize: 9, letterSpacing: 1 }}>RITRATTO</div>
                  </div>
                )}
              </div>
              {scheda.ritratto && (
                <button
                  style={{ ...styles.buttonDanger, position: 'absolute', top: -8, right: -8, padding: '0 6px', background: C.panel }}
                  title="Rimuovi immagine"
                  onClick={() => aggiorna({ ritratto: '' })}
                >
                  ×
                </button>
              )}
              <input ref={ritrattoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={caricaRitratto} />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="campi-anagrafica" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 10px', alignItems: 'end' }}>
                <CampoModulo label={regoleVersione === '2024' ? 'Specie' : 'Razza'}>
                  <CampoTendina value={scheda.specie} opzioni={SPECIE_5E} onChange={(v) => { const sp = SPECIE_DATI[v]; aggiorna({ specie: v, ...(sp ? { velocita: sp.velocita, sensi: sp.sensi, taglia: sp.taglia, trattiSpecie: sp.tratti } : {}), ...ritrattoAuto(scheda.classe, v, scheda.nome) }); }} title="Scegli la specie (imposta velocità, sensi, taglia, tratti e avatar)" />
                </CampoModulo>
                <CampoModulo label="Taglia">
                  <CampoTendina value={scheda.taglia} opzioni={TAGLIE_5E} onChange={(v) => aggiorna({ taglia: v })} title="Scegli la taglia" />
                </CampoModulo>
                <CampoModulo label="Allineamento">
                  <CampoTendina value={scheda.allineamento} opzioni={ALLINEAMENTI_5E} onChange={(v) => aggiorna({ allineamento: v })} title="Scegli l'allineamento" />
                </CampoModulo>
                <CampoModulo label="Background">
                  <CampoTendina value={scheda.background} opzioni={BACKGROUND_5E} onChange={(v) => aggiorna({ background: v, ...abilitaConBackground(v) })} title="Scegli un background (imposta le competenze nelle abilità)" />
                </CampoModulo>
                <CampoModulo label="Classe">
                  <CampoTendina
                    value={scheda.classe}
                    opzioni={NOMI_CLASSI}
                    onChange={(v) => {
                      const car = caratteristicaIncantatorePerClasse(v);
                      const ts = tiriSalvezzaPerClasse(v);
                      const add = addestramentoPerClasse(v);
                      const slot = slotDaClasseLivello(v, scheda.livello);
                      aggiorna({
                        classe: v,
                        ...(car ? { incantatore: { caratteristica: car } } : {}),
                        ...(ts ? { tiriSalvezza: ts } : {}),
                        ...(add ? { addestramento: { ...scheda.addestramento, armature: { ...add.armature }, armi: add.armi } } : {}),
                        ...(slot ? { slotIncantesimo: slot } : {}),
                        dadiVita: esprDadiVita(scheda.livello, dadoVitaClasse(v)),
                        ...ritrattoAuto(v, scheda.specie, scheda.nome),
                      });
                    }}
                    title="Scegli la classe (imposta TS, addestramento, incantatore, slot, dado vita e avatar)"
                  />
                </CampoModulo>
                <CampoModulo label="Sottoclasse">
                  <CampoTendina value={scheda.sottoclasse} opzioni={sottoclassiPerClasse(scheda.classe)} onChange={(v) => aggiorna({ sottoclasse: v })} title="Sottoclasse (opzioni in base alla classe)" />
                </CampoModulo>
              </div>
          <div className="vitali">
            {/* RIGA 1 — Classe Armatura | Punti Ferita (x2) | Riposo | TS Morte */}
            {/* Classe Armatura */}
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Classe Armatura</div>
              <div style={styles.vitalValue}>
                {scheda.armatura.tipo === 'manuale' && !scheda.armatura.scudo && !scheda.armatura.bonus ? (
                  <Editable value={scheda.ca} tipo="numero" onChange={(v) => aggiorna({ ca: v })} width={40} />
                ) : (
                  <span title="CA calcolata da armatura, scudo e bonus">{caTotale(scheda)}</span>
                )}
              </div>
              <select
                style={{ ...styles.inlineInput, fontSize: 10, padding: '1px 3px', maxWidth: '100%', marginTop: 2 }}
                value={scheda.armatura.tipo}
                onChange={(e) => aggiorna({ armatura: { ...scheda.armatura, tipo: e.target.value } })}
              >
                {TIPI_ARMATURA.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
              <div style={{ fontSize: 10, color: C.inkDim, display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center', marginTop: 'auto', paddingTop: 6, flexWrap: 'wrap' }}>
                {(scheda.armatura.tipo === 'leggera' || scheda.armatura.tipo === 'media' || scheda.armatura.tipo === 'pesante') && (
                  <span>base <Editable value={scheda.armatura.base} tipo="numero" width={24} onChange={(v) => aggiorna({ armatura: { ...scheda.armatura, base: Math.max(0, v) } })} /></span>
                )}
                <span className="tirabile" style={{ cursor: 'pointer' }} title="Scudo: +2 alla CA" onClick={() => aggiorna({ armatura: { ...scheda.armatura, scudo: !scheda.armatura.scudo } })}>
                  <span style={styles.pip(scheda.armatura.scudo, C.goldDark)} /> <span style={{ opacity: scheda.armatura.scudo ? 1 : 0.4 }}>🛡️</span>
                </span>
                <span>+ <Editable value={scheda.armatura.bonus} tipo="numero" width={22} onChange={(v) => aggiorna({ armatura: { ...scheda.armatura, bonus: v } })} /></span>
              </div>
            </div>

            {/* Punti Ferita — occupa 2 colonne */}
            <div style={{ ...styles.vitalBox, gridColumn: 'span 2' }}>
              <div style={styles.vitalLabel}>Punti Ferita</div>
              <div style={styles.vitalValue}>
                <Editable value={scheda.pfAttuali} tipo="numero" onChange={(v) => aggiorna({ pfAttuali: v })} width={44} />
                <span style={{ color: C.inkDim, fontSize: 14 }}>
                  {' / '}
                  <Editable value={scheda.pfMax} tipo="numero" onChange={(v) => aggiorna({ pfMax: v })} width={44} />
                </span>
                <span style={{ color: C.inkDim, fontSize: 13 }}>
                  {'  temp '}
                  <Editable value={scheda.pfTemp} tipo="numero" onChange={(v) => aggiorna({ pfTemp: v })} width={30} />
                </span>
              </div>
              {(() => {
                const temp = Number(scheda.pfTemp) || 0;
                const max = Math.max(1, scheda.pfMax + temp);
                const percNormale = Math.max(0, Math.min(100, (scheda.pfAttuali / max) * 100));
                const percTemp = Math.max(0, Math.min(100, (temp / max) * 100));
                const coloreNormale = (scheda.pfAttuali / Math.max(1, scheda.pfMax)) > 0.5 ? C.green : (scheda.pfAttuali / Math.max(1, scheda.pfMax)) > 0.25 ? C.gold : C.red;
                return (
                  <div style={{ height: 5, borderRadius: 3, background: C.border, overflow: 'hidden', margin: '4px 10px 0', display: 'flex' }} title={`${scheda.pfAttuali} / ${scheda.pfMax} PF${temp ? ` (+ ${temp} temp)` : ''}`}>
                    <div style={{ width: `${percNormale}%`, height: '100%', background: coloreNormale, transition: 'width 0.25s ease' }} />
                    {temp > 0 && <div style={{ width: `${percTemp}%`, height: '100%', background: '#4A90E2', transition: 'width 0.25s ease' }} />}
                  </div>
                );
              })()}
              <div style={{ ...styles.detail, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                  Dadi vita{' '}
                  <Rollable onRoll={tiraDadoVita} title="Tieni premuto e rilascia: spendi un dado vita">
                    <strong>{Math.max(1, scheda.livello || 1)}</strong>d
                  </Rollable>
                  <select
                    style={{ ...styles.inlineInput, fontSize: 12, padding: '1px 2px' }}
                    value={facceDadoVita(scheda.dadiVita)}
                    onChange={(e) => aggiorna({ dadiVita: esprDadiVita(scheda.livello, Number(e.target.value)) })}
                    title="Tipo di dado vita (dalla classe)"
                  >
                    {FACCE_DADO_VITA.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  Spesi:{' '}
                  <Editable value={scheda.dadiVitaSpesi} tipo="numero" onChange={(v) => aggiorna({ dadiVitaSpesi: Math.min(Math.max(1, scheda.livello || 1), Math.max(0, v)) })} width={26} />
                  <span style={{ color: C.inkDim }}>/ {Math.max(1, scheda.livello || 1)}</span>
                </span>
              </div>
            </div>

            {/* Riposo */}
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Riposo</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button style={{ ...styles.buttonMini, fontSize: 11, padding: '2px 4px' }} onClick={riposoBreve} title="Riposo breve">🔥 Breve</button>
                <button style={{ ...styles.buttonMini, fontSize: 11, padding: '2px 4px' }} onClick={riposoLungo} title="Riposo lungo">🌙 Lungo</button>
              </div>
            </div>

            {/* TS Morte */}
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>
                <Rollable onRoll={tiroSalvezzaMorte} title="Tieni premuto e rilascia: TS contro morte">TS Morte</Rollable>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 16 }}>
                {[1, 2, 3].map((i) => (
                  <span key={`s${i}`} style={styles.pip(scheda.tsMorte.successi >= i, C.green)} title={`Successi: ${scheda.tsMorte.successi}`}
                    onClick={() => aggiorna({ tsMorte: { ...scheda.tsMorte, successi: scheda.tsMorte.successi >= i ? i - 1 : i } })} />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 16, marginTop: 3 }}>
                {[1, 2, 3].map((i) => (
                  <span key={`f${i}`} style={styles.pip(scheda.tsMorte.fallimenti >= i, C.red)} title={`Fallimenti: ${scheda.tsMorte.fallimenti}`}
                    onClick={() => aggiorna({ tsMorte: { ...scheda.tsMorte, fallimenti: scheda.tsMorte.fallimenti >= i ? i - 1 : i } })} />
                ))}
              </div>
            </div>

            {/* RIGA 2 — Iniziativa | Velocità | Perc. Passiva | Resistenze | Vista */}
            {/* Iniziativa */}
            <div style={{ ...styles.vitalBox, gridColumn: '1' }}>
              <div style={styles.vitalLabel}>Iniziativa</div>
              <div style={styles.vitalValue}>
                <Rollable onRoll={() => lanciaD20('Iniziativa', modificatore(scheda.caratteristiche.destrezza))}>
                  {conSegno(modificatore(scheda.caratteristiche.destrezza))}
                </Rollable>
              </div>
            </div>

            {/* Velocità */}
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Velocità</div>
              <div style={styles.vitalValue}>
                <Editable value={scheda.velocita} tipo="numero" onChange={(v) => aggiorna({ velocita: v })} width={38} />
                <span style={{ fontSize: 12, color: C.inkDim }}> m</span>
              </div>
            </div>

            {/* Percezione Passiva */}
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Perc. Passiva</div>
              <div style={styles.vitalValue}>{percezionePassiva}</div>
            </div>

            {/* Resistenze */}
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Resistenze</div>
              <div style={{ fontSize: 10, color: C.ink, textAlign: 'center', lineHeight: 1.3 }}>
                {scheda.resistenze ? scheda.resistenze : <span style={{ color: C.inkDim }}>—</span>}
              </div>
              <select
                value=""
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  const cur = scheda.resistenze ? scheda.resistenze.split(',').map(x => x.trim()).filter(Boolean) : [];
                  if (!cur.includes(v)) aggiorna({ resistenze: [...cur, v].join(', ') });
                }}
                style={{ ...styles.inlineInput, fontSize: 10, padding: '1px 2px', height: 18, marginTop: 2 }}
                title="Aggiungi resistenza"
              >
                <option value="">＋</option>
                {DANNI_5E.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Vista */}
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Vista</div>
              <div style={{ fontSize: 10, color: C.ink, textAlign: 'center', lineHeight: 1.3 }}>
                {scheda.sensi ? scheda.sensi : <span style={{ color: C.inkDim }}>—</span>}
              </div>
              <select
                value=""
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  const cur = scheda.sensi ? scheda.sensi.split(',').map(x => x.trim()).filter(Boolean) : [];
                  if (!cur.includes(v)) aggiorna({ sensi: [...cur, v].join(', ') });
                }}
                style={{ ...styles.inlineInput, fontSize: 10, padding: '1px 2px', height: 18, marginTop: 2 }}
                title="Aggiungi senso"
              >
                <option value="">＋</option>
                {SENSI_5E.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* RIGA 3 — Bonus Comp. | Sfinimento | Ispirazione | Condizioni (span 2) */}
            {/* Bonus Competenza */}
            <div style={{ ...styles.vitalBox, gridColumn: '1' }}>
              <div style={styles.vitalLabel}>Bonus Comp.</div>
              <div style={styles.vitalValue}>
                <Editable value={conSegno(scheda.bonusCompetenza)} onChange={(v) => aggiorna({ bonusCompetenza: parseInt(v, 10) || 0 })} width={38} title="1 click: modifica" />
              </div>
              {scheda.bonusCompetenza !== bonusCompetenzaDaLivello(scheda.livello) && (
                <span className="tirabile" style={{ fontSize: 9, color: C.goldDark, cursor: 'pointer', marginTop: 1 }}
                  title={`Bonus corretto per liv. ${scheda.livello}: ${conSegno(bonusCompetenzaDaLivello(scheda.livello))}`}
                  onClick={() => aggiorna({ bonusCompetenza: bonusCompetenzaDaLivello(scheda.livello) })}>
                  auto {conSegno(bonusCompetenzaDaLivello(scheda.livello))}
                </span>
              )}
            </div>

            {/* Sfinimento */}
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Sfinimento</div>
              <div style={styles.vitalValue}>
                <button style={{ ...styles.buttonMini, padding: '1px 5px', fontSize: 13 }} onClick={() => aggiorna({ sfinimento: Math.max(0, scheda.sfinimento - 1) })} title="Diminuisci">−</button>
                {' '}
                <strong style={{ color: scheda.sfinimento ? C.red : C.ink }}>{scheda.sfinimento}</strong>
                {' '}
                <button style={{ ...styles.buttonMini, padding: '1px 5px', fontSize: 13 }} onClick={() => aggiorna({ sfinimento: Math.min(6, scheda.sfinimento + 1) })} title="Aumenta">+</button>
              </div>
              {scheda.sfinimento > 0 && (
                <div style={{ fontSize: 9, color: C.red }} title={regoleVersione === '2024' ? 'Regole 2024: −2 ai tiri di d20 per livello' : `Regole 2014: ${SFINIMENTO_2014[scheda.sfinimento]}`}>
                  {regoleVersione === '2024' ? `−${scheda.sfinimento * 2}` : SFINIMENTO_2014[scheda.sfinimento]}
                </div>
              )}
            </div>

            {/* Ispirazione */}
            <div style={{
              ...styles.vitalBox,
              borderColor: scheda.ispirazione ? C.goldDark : C.border,
              background: scheda.ispirazione ? 'rgba(184,134,11,0.18)' : C.panelLight,
              transition: 'background 0.25s, border-color 0.25s',
            }}>
              <div style={{ ...styles.vitalLabel, color: scheda.ispirazione ? C.goldDark : C.inkDim }}>Ispirazione</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <button
                  className="tirabile"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '2px 8px', fontSize: 18, border: 'none',
                    background: 'transparent',
                    color: scheda.ispirazione ? C.goldDark : C.inkDim,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onClick={() => aggiorna({ ispirazione: !scheda.ispirazione })}
                  title="Ispirazione: spendila per avere vantaggio a un tiro o ripetere un dado"
                >
                  {scheda.ispirazione ? '★' : '☆'}
                </button>
              </div>
            </div>

            {/* Condizioni */}
            <div style={{ ...styles.vitalBox, gridColumn: 'span 2' }}>
              <div style={styles.vitalLabel}>Condizioni</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', alignItems: 'center', marginTop: 2 }}>
                {scheda.condizioni.map((c) => (
                  <button
                    key={c}
                    className="tirabile"
                    style={{ ...styles.modeButton(true), fontSize: 9, padding: '1px 4px', margin: 0, lineHeight: 1.4 }}
                    title="Click per rimuovere"
                    onClick={() => aggiorna({ condizioni: scheda.condizioni.filter((x) => x !== c) })}
                  >
                    {c} ✕
                  </button>
                ))}
                <select
                  value=""
                  onChange={(e) => { if (e.target.value) aggiorna({ condizioni: [...scheda.condizioni, e.target.value] }); }}
                  style={{ ...styles.inlineInput, fontSize: 10, padding: '1px 2px', height: 18 }}
                  title="Aggiungi una condizione"
                >
                  <option value="">＋ aggiungi</option>
                  {CONDIZIONI_5E.filter((c) => !scheda.condizioni.includes(c)).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

        {/* Corpo scheda: caratteristiche a sinistra, resto a destra */}
        <div className="griglia-scheda">
          <div>

            {CARATTERISTICHE.map(({ key, label, abbr }) => {
              const mod = modificatore(scheda.caratteristiche[key]);
              const bonusTS = bonusTiroSalvezza(scheda, key);
              const abilitaDellaCar = ABILITA.filter((a) => a.car === key);
              return (
                <div key={key} className="blocco-car" style={styles.abilityBlock}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <Rollable
                      onRoll={() => lanciaD20(`Prova di ${label}`, mod)}
                      style={styles.abilityMod}
                      title={`Tieni premuto e rilascia: prova di ${label}`}
                    >
                      {conSegno(mod)}
                    </Rollable>
                    <div>
                      <div style={{ fontSize: 13, color: C.inkDim, letterSpacing: 1 }}>{label.toUpperCase()}</div>
                      <div style={styles.detail}>
                        punteggio{' '}
                        <Editable
                          value={scheda.caratteristiche[key]}
                          tipo="numero"
                          width={40}
                          onChange={(v) =>
                            aggiorna({ caratteristiche: { ...scheda.caratteristiche, [key]: v } })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Rollable
                    as="div"
                    style={styles.skillRow(true)}
                    title={`Tieni premuto e rilascia: tiro salvezza di ${label} · click sul pallino: competenza`}
                    onRoll={() => lanciaD20(`Tiro salvezza: ${label}`, bonusTS)}
                  >
                    <span
                      style={styles.dot(scheda.tiriSalvezza[key] ? 1 : 0)}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        aggiorna({ tiriSalvezza: { ...scheda.tiriSalvezza, [key]: !scheda.tiriSalvezza[key] } });
                      }}
                    >
                      {scheda.tiriSalvezza[key] ? '●' : '○'}
                    </span>
                    <strong style={{ width: 32 }}>{conSegno(bonusTS)}</strong>
                    <em>Tiro salvezza</em>
                  </Rollable>

                  {abilitaDellaCar.map((a) => {
                    const bonus = bonusAbilita(scheda, a.key);
                    const liv = scheda.abilita[a.key] || 0;
                    return (
                      <Rollable
                        as="div"
                        key={a.key}
                        style={styles.skillRow(true)}
                        title={`Tieni premuto e rilascia: prova di ${a.label} · click sul pallino: competenza/maestria`}
                        onRoll={() => lanciaD20(`${a.label} (${abbr})`, bonus)}
                      >
                        <span
                          style={styles.dot(liv)}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            aggiorna({ abilita: { ...scheda.abilita, [a.key]: liv === 0 ? 1 : liv === 1 ? 2 : 0 } });
                          }}
                        >
                          {liv === 2 ? '★\uFE0E' : liv === 1 ? '●' : '○'}
                        </span>
                        <strong style={{ width: 32 }}>{conSegno(bonus)}</strong>
                        <span>
                          {a.label}
                        </span>
                      </Rollable>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Armi e attacchi */}
            <section style={{ ...styles.panel, order: -2 }}>
              <h2 style={styles.panelTitle}>Azioni di combattimento</h2>
              <div style={{ overflowX: 'auto' }}>
                {['Azione', 'Bonus', 'Reazione'].map((cat) => {
                  const arr = scheda.attacchi.filter((a) => (a.categoria || 'Azione') === cat);
                  if (arr.length === 0 && cat !== 'Azione') return null;
                  return (
                    <div key={cat} style={{ marginBottom: 16 }}>
                      <h3 style={{ fontSize: 13, color: C.inkDim, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${C.border}`, paddingBottom: 4, marginBottom: 8 }}>
                        {cat === 'Bonus' ? 'Azioni Bonus' : cat === 'Reazione' ? 'Reazioni' : 'Azioni'}
                      </h3>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Nome</th>
                            <th style={styles.th}>Bonus att.</th>
                            <th style={styles.th}>Danno e tipo</th>
                            <th style={styles.th}>Note</th>
                            <th style={styles.th} />
                          </tr>
                        </thead>
                        <tbody>
                          {arr.map((a) => {
                            const aggiornaAttacco = (patch) =>
                              aggiorna({
                                attacchi: scheda.attacchi.map((x) => (x.id === a.id ? { ...x, ...patch } : x)),
                              });
                            const dannoValido = a.danno.trim() === '' || parseEspressioneDado(a.danno);
                            return (
                              <tr key={a.id}>
                                <td style={styles.td}>
                                  <Editable
                                    value={a.nome}
                                    width={150}
                                    onChange={(v) => aggiornaAttacco({ nome: v })}
                                    onRoll={() => lanciaD20(`Attacco: ${a.nome}`, a.bonus, { attacco: a })}
                                  />
                                </td>
                                <td style={styles.td}>
                                  <Editable
                                    value={conSegno(a.bonus)}
                                    width={44}
                                    onChange={(v) => aggiornaAttacco({ bonus: Number(String(v).replace('+', '')) || 0 })}
                                    onRoll={() => lanciaD20(`Attacco: ${a.nome}`, a.bonus, { attacco: a })}
                                  />
                                </td>
                                <td style={{ ...styles.td, color: dannoValido ? undefined : C.red }}>
                                  <Editable
                                    value={a.danno}
                                    width={80}
                                    onChange={(v) => aggiornaAttacco({ danno: v })}
                                    onRoll={
                                      parseEspressioneDado(a.danno)
                                        ? () => lanciaDanniDiretti(`Danni: ${a.nome}`, a.danno)
                                        : undefined
                                    }
                                    title="1 click: modifica · doppio click: tira solo i danni"
                                  />{' '}
                                  <Editable value={a.tipoDanno} width={90} onChange={(v) => aggiornaAttacco({ tipoDanno: v })} />
                                </td>
                                <td style={styles.td}>
                                  <Editable value={a.note} width={130} onChange={(v) => aggiornaAttacco({ note: v })} />
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                  <button
                                    style={styles.buttonDanger}
                                    onClick={() => aggiorna({ attacchi: scheda.attacchi.filter((x) => x.id !== a.id) })}
                                  >
                                    ×
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <button
                        style={{ ...styles.button, marginTop: 6, fontSize: 12, padding: '2px 8px' }}
                        onClick={() =>
                          aggiorna({
                            attacchi: [
                              ...scheda.attacchi,
                              { id: Date.now(), nome: 'Nuovo', categoria: cat, bonus: 0, danno: '', tipoDanno: '', note: '' },
                            ],
                          })
                        }
                      >
                        + Aggiungi {cat.toLowerCase()}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 4, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={styles.detail}>
                  Doppio click sul nome o sul bonus: tiro per colpire · sul danno: solo danni.
                </span>
              </div>
            </section>

            {/* Incantesimi */}
            <section style={{ ...styles.panel, order: -1 }}>
              <h2 style={styles.panelTitle}>Incantesimi</h2>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                <label style={styles.detail}>
                  Caratteristica da incantatore:{' '}
                  <select
                    style={{ ...styles.inlineInput, padding: '4px 6px' }}
                    value={scheda.incantatore.caratteristica}
                    onChange={(e) => aggiorna({ incantatore: { caratteristica: e.target.value } })}
                  >
                    <option value="">— non incantatore —</option>
                    {CARATTERISTICHE.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                {modIncantatore !== null && (
                  <>
                    <div style={styles.vitalBox}>
                      <div style={styles.vitalLabel}>Modificatore</div>
                      <div style={styles.vitalValue}>{conSegno(modIncantatore)}</div>
                    </div>
                    <div style={styles.vitalBox}>
                      <div style={styles.vitalLabel}>CD Incantesimi</div>
                      <div style={styles.vitalValue}>{8 + scheda.bonusCompetenza + modIncantatore}</div>
                    </div>
                    <div style={styles.vitalBox}>
                      <div style={styles.vitalLabel}>Attacco Incantesimo</div>
                      <div style={styles.vitalValue}>
                        <Rollable
                          onRoll={() =>
                            lanciaD20('Attacco con incantesimo', scheda.bonusCompetenza + modIncantatore)
                          }
                        >
                          {conSegno(scheda.bonusCompetenza + modIncantatore)}
                        </Rollable>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Slot incantesimo compatti: totale modificabile, rombi per gli spesi */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ ...styles.detail, marginRight: 2 }}>Slot:</span>
                {Array.from({ length: 9 }, (_, i) => i + 1).map((liv) => {
                  const slot = scheda.slotIncantesimo[liv] || { totale: 0, spesi: 0 };
                  const aggiornaSlot = (patch) =>
                    aggiorna({
                      slotIncantesimo: { ...scheda.slotIncantesimo, [liv]: { ...slot, ...patch } },
                    });
                  return (
                    <div
                      key={liv}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        border: `1px solid ${C.border}`,
                        borderRadius: 6,
                        padding: '2px 7px',
                        background: C.panelLight,
                        opacity: slot.totale > 0 ? 1 : 0.55,
                      }}
                    >
                      <span style={{ fontSize: 11, color: C.inkDim }}>L{liv}</span>
                      <Editable
                        value={slot.totale}
                        tipo="numero"
                        width={26}
                        onChange={(v) =>
                          aggiornaSlot({ totale: Math.max(0, Math.min(9, v)), spesi: Math.min(slot.spesi, Math.max(0, v)) })
                        }
                        title="Slot totali del livello"
                      />
                      {Array.from({ length: slot.totale }, (_, i) => i + 1).map((i) => (
                        <span
                          key={i}
                          style={styles.pip(slot.spesi >= i, COLORE_DADO[6])}
                          title={`Spesi: ${slot.spesi}/${slot.totale} (click per segnare)`}
                          onClick={() => aggiornaSlot({ spesi: slot.spesi >= i ? i - 1 : i })}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Trucchetti e incantesimi preparati */}
              <h3 style={{ ...styles.panelTitle, fontSize: 15, marginTop: 14 }}>
                Trucchetti e incantesimi preparati
              </h3>
              <div style={{ overflowX: 'auto' }}>
                {Array.from({ length: 10 }, (_, liv) => {
                  const spells = scheda.incantesimiLista.filter((s) => s.livello === liv);
                  const haSlot = liv === 0 || ((scheda.slotIncantesimo[liv]?.totale || 0) > 0);
                  const haSpells = spells.length > 0;
                  
                  if (!haSlot && !haSpells) return null;
                  
                  return (
                    <div key={liv} style={{ marginBottom: 16 }}>
                      <h4 style={{ fontSize: 12, color: C.inkDim, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${C.border}`, paddingBottom: 2, marginBottom: 6 }}>
                        {liv === 0 ? 'Trucchetti (Livello 0)' : `${liv}° Livello`}
                      </h4>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Nome</th>
                            <th style={styles.th}>Tempo</th>
                            <th style={styles.th}>Gittata</th>
                            <th style={styles.th}>Note</th>
                            <th style={styles.th} />
                          </tr>
                        </thead>
                        <tbody>
                          {spells.map((s) => {
                            const aggiornaIncantesimo = (patch) =>
                              aggiorna({
                                incantesimiLista: scheda.incantesimiLista.map((x) =>
                                  x.id === s.id ? { ...x, ...patch } : x
                                ),
                              });
                            return (
                              <tr key={s.id}>
                                <td style={styles.td}>
                                  <Editable value={s.nome} width={180} onChange={(v) => aggiornaIncantesimo({ nome: v })} />
                                </td>
                                <td style={styles.td}>
                                  <Editable value={s.tempo} width={70} onChange={(v) => aggiornaIncantesimo({ tempo: v })} />
                                </td>
                                <td style={styles.td}>
                                  <Editable value={s.gittata} width={70} onChange={(v) => aggiornaIncantesimo({ gittata: v })} />
                                </td>
                                <td style={styles.td}>
                                  <Editable value={s.note} width={140} onChange={(v) => aggiornaIncantesimo({ note: v })} />
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                  <button
                                    style={styles.buttonDanger}
                                    onClick={() =>
                                      aggiorna({ incantesimiLista: scheda.incantesimiLista.filter((x) => x.id !== s.id) })
                                    }
                                  >
                                    ×
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <button
                        style={{ ...styles.button, marginTop: 4, fontSize: 11, padding: '2px 6px' }}
                        onClick={() =>
                          aggiorna({
                            incantesimiLista: [
                              ...scheda.incantesimiLista,
                              { id: Date.now(), livello: liv, nome: 'Nuovo incantesimo', tempo: '1 Az.', gittata: '', note: '' },
                            ],
                          })
                        }
                      >
                        + Aggiungi {liv === 0 ? 'trucchetto' : `L${liv}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {/* Sezioni descrittive a piena larghezza: riempiono lo spazio sotto le due colonne */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 10 }}>
            {/* Risorse di classe: contatori con reset a riposo breve/lungo */}
            <Sezione titolo="Risorse di classe" {...propsSez('risorse')}>
              {scheda.risorse.length === 0 && (
                <p style={{ ...styles.detail, marginTop: 0 }}>
                  Nessuna risorsa. Aggiungine una per tracciare Ki, punti stregoneria, ira, ispirazione bardica, usi dei privilegi…
                </p>
              )}
              {scheda.risorse.map((r) => {
                const modifica = (patch) =>
                  aggiorna({ risorse: scheda.risorse.map((x) => (x.id === r.id ? { ...x, ...patch } : x)) });
                return (
                  <div key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                    <Editable value={r.nome} onChange={(v) => modifica({ nome: v })} width={150} title="Nome della risorsa" />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <button style={{ ...styles.buttonMini, padding: '1px 8px' }} title="Spendi" onClick={() => modifica({ attuali: Math.max(0, r.attuali - 1) })}>−</button>
                      <strong style={{ minWidth: 18, textAlign: 'center', display: 'inline-block', color: r.attuali === 0 ? C.inkDim : C.ink }}>{r.attuali}</strong>
                      <button style={{ ...styles.buttonMini, padding: '1px 8px' }} title="Recupera" onClick={() => modifica({ attuali: Math.min(r.max, r.attuali + 1) })}>+</button>
                      <span style={styles.detail}>/ <Editable value={r.max} tipo="numero" width={34} onChange={(v) => modifica({ max: Math.max(0, v), attuali: Math.min(Math.max(0, v), r.attuali) })} /></span>
                    </span>
                    <select
                      style={{ ...styles.inlineInput, fontSize: 12, padding: '2px 4px' }}
                      value={r.reset}
                      onChange={(e) => modifica({ reset: e.target.value })}
                      title="Quando si ricarica"
                    >
                      <option value="">reset manuale</option>
                      <option value="breve">riposo breve</option>
                      <option value="lungo">riposo lungo</option>
                    </select>
                    <button
                      style={{ ...styles.buttonMini, padding: '1px 8px', color: C.red }}
                      title="Rimuovi la risorsa"
                      onClick={() => aggiorna({ risorse: scheda.risorse.filter((x) => x.id !== r.id) })}
                    >✕</button>
                  </div>
                );
              })}
              <button
                style={{ ...styles.buttonMini, marginTop: 4 }}
                onClick={() =>
                  aggiorna({
                    risorse: [...scheda.risorse, { id: Date.now(), nome: 'Nuova risorsa', attuali: 0, max: 0, reset: 'lungo' }],
                  })
                }
              >
                + Aggiungi risorsa
              </button>
            </Sezione>

            {/* Privilegi di classe, tratti della specie, talenti — collassabili */}
            <Sezione titolo="Privilegi di classe" {...propsSez('privilegi')}>
              <AreaTesto
                value={scheda.privilegi}
                placeholder="Es. Incanalare divinità, Recupero arcano, Attacco furtivo…"
                onChange={(v) => aggiorna({ privilegi: v })}
              />
            </Sezione>

            <Sezione titolo="Tratti della specie" {...propsSez('trattiSpecie')}>
              <AreaTesto
                value={scheda.trattiSpecie}
                placeholder="Es. Scurovisione, Astuzia gnomesca, Trance, Fortuna halfling…"
                onChange={(v) => aggiorna({ trattiSpecie: v })}
              />
            </Sezione>

            <Sezione titolo="Talenti" {...propsSez('talenti')}>
              <AreaTesto
                value={scheda.talenti}
                placeholder="Es. Guerramaga (War Caster): vantaggio ai TS di Concentrazione…"
                onChange={(v) => aggiorna({ talenti: v })}
              />
            </Sezione>

            <Sezione titolo="Addestramento e competenze nell'equipaggiamento" aperto={false} {...propsSez('addestramento')}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={styles.detail}>Armature:</span>
                {[
                  ['leggera', 'leggera'],
                  ['media', 'media'],
                  ['pesante', 'pesante'],
                  ['scudi', 'scudi'],
                ].map(([key, label]) => (
                  <span
                    key={key}
                    className="tirabile"
                    style={{ ...styles.detail, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onClick={() =>
                      aggiorna({
                        addestramento: {
                          ...scheda.addestramento,
                          armature: {
                            ...scheda.addestramento.armature,
                            [key]: !scheda.addestramento.armature[key],
                          },
                        },
                      })
                    }
                  >
                    <span style={styles.pip(scheda.addestramento.armature[key], C.goldDark)} /> {label}
                  </span>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={styles.moduloLabel}>Armi</div>
                  <AreaTesto
                    value={scheda.addestramento.armi}
                    righe={2}
                    placeholder="Es. armi semplici, spade lunghe…"
                    onChange={(v) => aggiorna({ addestramento: { ...scheda.addestramento, armi: v } })}
                  />
                </div>
                <div>
                  <div style={styles.moduloLabel}>Strumenti</div>
                  <AreaTesto
                    value={scheda.addestramento.strumenti}
                    righe={2}
                    placeholder="Es. borsa da erborista, arnesi da scasso…"
                    onChange={(v) => aggiorna({ addestramento: { ...scheda.addestramento, strumenti: v } })}
                  />
                </div>
              </div>
            </Sezione>

            <Sezione titolo="Equipaggiamento e lingue" {...propsSez('equipaggiamento')}>
              <AreaTesto
                value={scheda.equipaggiamento}
                placeholder="Zaino, corda, razioni…"
                onChange={(v) => aggiorna({ equipaggiamento: v })}
              />
              <div style={{ marginTop: 10 }}>
                <span style={styles.detail}>
                  Sintonia con un oggetto magico:{' '}
                  <Editable value={scheda.sintonia} onChange={(v) => aggiorna({ sintonia: v })} width={300} />
                </span>
              </div>
              <div style={{ marginTop: 10 }}>
                <span style={styles.detail}>
                  Lingue:{' '}
                  <Editable value={scheda.lingue} onChange={(v) => aggiorna({ lingue: v })} width={300} />
                  <select
                    value=""
                    onChange={(e) => {
                      const ling = e.target.value;
                      if (!ling) return;
                      const esistenti = scheda.lingue
                        ? scheda.lingue.split(',').map((l) => l.trim()).filter(Boolean)
                        : [];
                      if (!esistenti.some((l) => l.toLowerCase() === ling.toLowerCase())) {
                        esistenti.push(ling);
                        aggiorna({ lingue: esistenti.join(', ') });
                      }
                    }}
                    style={{ ...styles.inlineInput, fontSize: 12, padding: '1px 3px', marginLeft: 8, height: 20 }}
                    title="Aggiungi una lingua"
                  >
                    <option value="">＋ aggiungi lingua</option>
                    {LINGUE_5E.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </span>
              </div>
              
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {DENARI.map(({ key, label }) => (
                  <div key={key} style={{ ...styles.vitalBox, minHeight: 'auto', padding: '6px 4px' }}>
                    <div style={styles.vitalLabel}>{label}</div>
                    <div style={styles.vitalValue}>
                      <Editable
                        value={scheda.denari[key]}
                        tipo="numero"
                        width={40}
                        onChange={(v) => aggiorna({ denari: { ...scheda.denari, [key]: Math.max(0, v) } })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Sezione>

            <Sezione titolo="Aspetto, storia e tratti" aperto={false} {...propsSez('aspetto')}>
              <div style={styles.moduloLabel}>Aspetto</div>
              <AreaTesto
                value={scheda.aspetto}
                placeholder="Aspetto fisico del personaggio…"
                onChange={(v) => aggiorna({ aspetto: v })}
              />
              <div style={{ ...styles.moduloLabel, marginTop: 10 }}>Storia e tratti caratteriali</div>
              <AreaTesto
                value={scheda.note}
                placeholder="Storia del personaggio, tratti caratteriali, alleati, appunti di sessione…"
                onChange={(v) => aggiorna({ note: v })}
              />
            </Sezione>

            {/* Import / export */}
            <Sezione titolo="Importa / esporta scheda" aperto={false} style={{ order: 999 }}>
              <p style={{ ...styles.detail, marginTop: 0 }}>
                Salva e ricarica la scheda come file JSON per portarla su un altro
                dispositivo o tenerne una copia. Gli import creano un nuovo personaggio.
              </p>
              <input ref={jsonRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={importaJson} />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button style={styles.button} onClick={esportaJson}>
                  💾 Esporta JSON
                </button>
                <button style={styles.button} onClick={() => jsonRef.current?.click()}>
                  📂 Importa JSON
                </button>
                <button
                  style={styles.button}
                  onClick={() => nuovoPersonaggio(normalizeImported(FLYORA_JSON))}
                  title="Carica la scheda di esempio (Flyora, stregone livello 4)"
                >
                  ✨ Carica esempio (Flyora)
                </button>
              </div>
              {erroreImport && <div style={{ color: C.red, marginTop: 8 }}>{erroreImport}</div>}
            </Sezione>
        </div>
      </main>
    </div>
  );
}
