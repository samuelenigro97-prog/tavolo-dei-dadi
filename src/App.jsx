import { useEffect, useId, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { ICONE_CLASSE, ICONE_SPECIE } from './ritratti';

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
// Palette a 12 tinte ben distinte (una per classe), sia in chiaro sia in scuro.
const CLASSI = [
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

/** Sottoclassi disponibili per la classe indicata (o [] se non riconosciuta). */
function sottoclassiPerClasse(classe) {
  const c = coloreClasse(classe);
  return (c && SOTTOCLASSI_5E[c.match[0]]) || [];
}

// Privilegi delle sottoclassi per livello (regole 2024). I nomi seguono le
// sottoclasse elencate in SOTTOCLASSI_5E e i livelli in SOTTOCLASSE_LIV.
// Sono riassunti/etichette nostre: da verificare col proprio manuale.
const SUBCLASS_PRIVILEGI = {
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
/** Privilegi della sottoclasse fino al livello dato (testo con a-capo), o null. */
function privilegiSottoclasseFinoA(sottoclasse, livello) {
  const t = SUBCLASS_PRIVILEGI[sottoclasse];
  if (!t) return null;
  const lv = Math.max(1, Math.floor(livello) || 1);
  const righe = [];
  for (let L = 1; L <= lv; L++) if (t[L]) righe.push(t[L]);
  return righe.join('\n');
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

// Competenze nelle abilità concesse da ogni classe (2024): quante sceglierne e
// da quale lista. 'tutte' = qualsiasi abilità (Bardo). Chiavi = quelle di ABILITA.
const COMPETENZE_CLASSE = {
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
/** Competenze di classe: { numero, lista:[chiavi] } (lista completa se 'tutte'), o null. */
function competenzeClasseDi(classe) {
  const c = coloreClasse(classe);
  const dati = c && COMPETENZE_CLASSE[c.match[0]];
  if (!dati) return null;
  const lista = dati.lista === 'tutte' ? ABILITA.map((a) => a.key) : dati.lista;
  return { numero: dati.numero, lista };
}

// Privilegi di classe di 1° livello (2024), riassunti in parole nostre.
const PRIVILEGI_CLASSE_L1 = {
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
// Privilegi di 1° livello nella 5.0 (2014): niente Maestria nelle armi, e alcune
// classi ricevono la sottoclasse già al 1° livello (Chierico, Stregoni, Warlock).
const PRIVILEGI_CLASSE_L1_2014 = {
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
/** Privilegi di 1° livello nella versione indicata ('2024' default, '2014'). */
function privilegiClasseL1(classe, versione = '2024') {
  const c = coloreClasse(classe);
  if (!c) return '';
  const tabella = versione === '2014' ? PRIVILEGI_CLASSE_L1_2014 : PRIVILEGI_CLASSE_L1;
  return tabella[c.match[0]] || '';
}

// Privilegi di classe guadagnati livello per livello (2024), riassunti in parole
// nostre. Qui stanno solo i privilegi "di classe": gli Aumenti di Caratteristica
// e i privilegi di SOTTOCLASSE sono gestiti a parte (promemoria nel level up).
const PRIVILEGI_CLASSE_LIV = {
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

// Privilegi di classe per livello nella 5.0 (2014). Differiscono dalla 2024
// (niente Maestria armi, sottoclasse a livelli diversi, alcune capacità cambiano).
const PRIVILEGI_CLASSE_LIV_2014 = {
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

// Livelli di Aumento dei Punteggi di Caratteristica / Talento (2024).
const ASI_LIV = {
  guerriero: [4, 6, 8, 12, 14, 16, 19],
  ladro: [4, 8, 10, 12, 16, 19],
  _default: [4, 8, 12, 16, 19],
};
// Livello in cui si SCEGLIE la sottoclasse (il primo dei livelli di sottoclasse).
function livelloSceltaSottoclasse(classe, versione = '2024') {
  const k = chiaveClasse(classe);
  const liv = sottoclasseLivPer(versione);
  return (k && liv[k] && liv[k][0]) || 3;
}

// Elenco (curato) degli incantesimi più comuni per classe e livello, in italiano.
// Serve al menu "Aggiungi incantesimo": non è esaustivo (c'è sempre "Scrivi a
// mano"), ma copre gli incantesimi tipici. I nomi sono indicativi e modificabili.
const INCANTESIMI_CLASSE = {
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
/** Incantesimi consigliati per la classe a un dato livello (o [] se non previsti). */
function incantesimiClasseLivello(classe, livello) {
  const k = chiaveClasse(classe);
  return (k && INCANTESIMI_CLASSE[k] && INCANTESIMI_CLASSE[k][livello]) || [];
}

// Numero di TRUCCHETTI conosciuti per classe (soglie ai livelli 1 / 4 / 10).
// Le classi che non lanciano trucchetti non compaiono (nessun limite).
const TRUCCHETTI_NOTI = {
  bardo: [2, 3, 4], chierico: [3, 4, 5], druido: [2, 3, 4],
  mago: [3, 4, 5], stregone: [4, 5, 6], warlock: [2, 3, 4],
};
/** Massimo di trucchetti conosciuti per classe e livello (null = nessun limite). */
function trucchettiMax(classe, livello) {
  const k = chiaveClasse(classe);
  const base = TRUCCHETTI_NOTI[k];
  if (!base) return null;
  const lv = Math.max(1, Math.floor(livello) || 1);
  return lv >= 10 ? base[2] : lv >= 4 ? base[1] : base[0];
}
// Incantesimi (livello 1+) noti/preparati per classe e livello (indice 0 = liv.1).
// 2024: quasi tutte le classi "preparano". 2014: i conoscitori hanno tabelle fisse,
// i preparatori usano mod. da incantatore + livello. Valori indicativi, modificabili.
const INC_MAX_2024 = {
  bardo:    [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 19, 20, 21, 22, 22],
  chierico: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 20, 21, 22, 23, 24],
  druido:   [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 20, 22, 23, 24, 25],
  mago:     [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25],
  stregone: [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 19, 20, 21, 22, 22],
  warlock:  [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  paladino: [2, 3, 4, 5, 6, 6, 7, 7, 8, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15],
  ranger:   [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15],
};
const INC_MAX_2014_NOTI = {
  stregone: [2, 3, 4, 5, 6, 7, 7, 8, 9, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  bardo:    [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
  warlock:  [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  ranger:   [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
};
/**
 * Massimo di incantesimi (livello 1+) per classe/livello/versione (o null se non
 * incantatore). È un default modificabile a mano dall'utente.
 */
function incantesimiMaxAuto(scheda, versione = '2024') {
  const k = chiaveClasse(scheda?.classe);
  if (!k) return null;
  const idx = Math.min(19, Math.max(1, Math.floor(scheda.livello) || 1) - 1);
  const carKey = scheda.incantatore?.caratteristica;
  const mod = carKey ? modificatore(scheda.caratteristiche?.[carKey]) : 0;
  const lv = idx + 1;
  if (versione === '2014') {
    if (['chierico', 'druido', 'mago'].includes(k)) return Math.max(1, mod + lv);
    if (k === 'paladino') return Math.max(1, mod + Math.floor(lv / 2));
    const noti = INC_MAX_2014_NOTI[k];
    return noti ? noti[idx] : null;
  }
  const t = INC_MAX_2024[k];
  return t ? t[idx] : null;
}

// Livelli in cui si sceglie o si potenzia la sottoclasse (2024).
const SOTTOCLASSE_LIV = {
  barbaro: [3, 6, 10, 14], bardo: [3, 6, 14], chierico: [3, 6, 17],
  druido: [3, 6, 10, 14], guerriero: [3, 7, 10, 15, 18], ladro: [3, 9, 13, 17],
  mago: [3, 6, 10, 14], monaco: [3, 6, 11, 17], paladino: [3, 7, 15, 20],
  ranger: [3, 7, 11, 15], stregone: [3, 6, 14, 18], warlock: [3, 6, 10, 14],
};
// Livelli di sottoclasse nella 5.0 (2014): alcune classi la scelgono già al 1°/2°.
const SOTTOCLASSE_LIV_2014 = {
  barbaro: [3, 6, 10, 14], bardo: [3, 6, 14], chierico: [1, 2, 6, 8, 17],
  druido: [2, 6, 10, 14], guerriero: [3, 7, 10, 15, 18], ladro: [3, 9, 13, 17],
  mago: [2, 6, 10, 14], monaco: [3, 6, 11, 17], paladino: [3, 7, 15, 20],
  ranger: [3, 7, 11, 15], stregone: [1, 6, 14, 18], warlock: [1, 6, 10, 14],
};
function sottoclasseLivPer(versione) {
  return versione === '2014' ? SOTTOCLASSE_LIV_2014 : SOTTOCLASSE_LIV;
}

function chiaveClasse(classe) {
  const c = coloreClasse(classe);
  return c ? c.match[0] : null;
}
/** Privilegi di classe guadagnati esattamente a questo livello (testo, o ''). */
function privilegiClasseLivello(classe, livello, versione = '2024') {
  const k = chiaveClasse(classe);
  if (!k) return '';
  const tabella = versione === '2014' ? PRIVILEGI_CLASSE_LIV_2014 : PRIVILEGI_CLASSE_LIV;
  let extra = (tabella[k] && tabella[k][livello]) || '';
  if (k === 'ladro' && livello % 2 === 1) {
    // Attacco furtivo del ladro: +1d6 a ogni livello dispari (uguale in 5.0 e 5.5).
    extra = (extra ? extra + '\n' : '') + `Attacco furtivo ${Math.ceil(livello / 2)}d6`;
  }
  return extra;
}
/** Vero se a questo livello scatta un Aumento di Caratteristica/Talento. */
function asiAlLivello(classe, livello) {
  const k = chiaveClasse(classe);
  return ((k && ASI_LIV[k]) || ASI_LIV._default).includes(livello);
}
/** Vero se a questo livello si sceglie/potenzia la sottoclasse (per versione). */
function sottoclasseAlLivello(classe, livello, versione = '2024') {
  const k = chiaveClasse(classe);
  const liv = sottoclasseLivPer(versione);
  return !!(k && liv[k] && liv[k].includes(livello));
}

// Competenze concesse dalla SPECIE (2024): quasi nessuna specie dà abilità
// (spostate sui background); l'Elfo con "Sensi Acuti" ne concede 1 a scelta.
const COMPETENZE_SPECIE = {
  Elfo: { numero: 1, lista: ['intuizione', 'percezione', 'sopravvivenza'], tratto: 'Sensi Acuti' },
};
function competenzeSpecieDi(specie) {
  const k = Object.keys(COMPETENZE_SPECIE).find((x) => (specie || '').toLowerCase().includes(x.toLowerCase()));
  return k ? { ...COMPETENZE_SPECIE[k], specie: k } : null;
}

// Nomi fantasy per razza/specie (liste generiche) + cognomi occasionali.
const NOMI_SPECIE = {
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
const NOMI_GENERICI = ['Aldric', 'Lyra', 'Corin', 'Sera', 'Rowan', 'Mira', 'Talon', 'Enna', 'Kael', 'Nira'];
/** Nome fantasy casuale coerente con la specie scelta. */
function nomeCasuale(specie) {
  const s = (specie || '').toLowerCase();
  const chiave = Object.keys(NOMI_SPECIE).find((k) => s.includes(k));
  const lista = (chiave && NOMI_SPECIE[chiave]) || NOMI_GENERICI;
  return lista[Math.floor(Math.random() * lista.length)];
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
/** Dati di una specie a partire dal nome scelto (anche varianti tipo "Elfo Alto"). */
function datiSpecieDi(specie) {
  if (!specie) return null;
  const s = String(specie).toLowerCase();
  const k = Object.keys(SPECIE_DATI).find((x) => s.includes(x.toLowerCase()));
  return k ? { ...SPECIE_DATI[k], nome: k } : null;
}

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
// Sensi 5e con le gittate tipiche (si può comunque scrivere un valore libero).
const SENSI_5E = [
  'Scurovisione 18 m', 'Scurovisione 36 m', 'Scurovisione 24 m',
  'Percezione cieca 3 m', 'Percezione cieca 9 m',
  'Percezione tremorsensitiva 9 m', 'Percezione tremorsensitiva 18 m',
  'Vista vera 36 m',
];

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
const ORDINE_SEZIONI_DEFAULT = ['privilegi', 'trattiSpecie', 'talenti', 'addestramento', 'equipaggiamento', 'aspetto'];

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

/**
 * Ritratto "da manuale": emblema della CLASSE (icona grande al centro) su un
 * gradiente del colore di classe, con un distintivo della SPECIE in basso a
 * destra. Icone game-icons.net (CC BY 3.0). Tutto SVG inline: nessuna rete,
 * coerente con classe e razza scelte alla creazione.
 */
function generaAvatar(classe, specie, nome) {
  const acc = coloreClasse(classe);
  const base = (acc && acc.chiaro) || '#8a6508';
  const chiaro = mescola(base, '#ffffff', 0.35);
  const dClasse = acc && ICONE_CLASSE[acc.match[0]];
  const chiaveSpecie = Object.keys(ICONE_SPECIE).find(
    (k) => (specie || '').toLowerCase().includes(k.toLowerCase()),
  );
  const dSpecie = chiaveSpecie && ICONE_SPECIE[chiaveSpecie];
  const iniziale = ((nome || specie || '?').trim()[0] || '?').toUpperCase();

  const eroe = dClasse
    ? `<g transform="translate(96,78) scale(0.62)">
         <path d="${dClasse}" fill="rgba(0,0,0,0.28)" transform="translate(6,8)"/>
         <path d="${dClasse}" fill="#fdf6e3"/>
       </g>`
    : `<text x="256" y="330" font-size="300" font-family="Georgia,serif" fill="#fdf6e3" text-anchor="middle">${iniziale}</text>`;
  const distintivo = dSpecie
    ? `<circle cx="398" cy="400" r="92" fill="rgba(0,0,0,0.4)" stroke="#fdf6e3" stroke-width="6"/>
       <g transform="translate(338,340) scale(0.235)"><path d="${dSpecie}" fill="#fdf6e3"/></g>`
    : '';

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" preserveAspectRatio="xMidYMid slice">` +
    `<defs><radialGradient id="g" cx="50%" cy="36%" r="85%">` +
    `<stop offset="0%" stop-color="${chiaro}"/><stop offset="100%" stop-color="${base}"/>` +
    `</radialGradient></defs>` +
    `<rect width="512" height="512" fill="url(#g)"/>` +
    eroe + distintivo +
    `</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/**
 * Avatar SVG inline (senza rete) usato come fallback quando DiceBear non è
 * raggiungibile (offline / PWA / reti restrittive): iniziale su colore classe.
 */
function avatarSvgFallback(classe, specie, nome) {
  const acc = coloreClasse(classe);
  const col = (acc && acc.chiaro) || '#8a6508';
  const iniziale = ((nome || specie || '?').trim()[0] || '?').toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">` +
    `<rect width="200" height="200" fill="${col}"/>` +
    `<text x="100" y="140" font-size="120" font-family="Georgia,serif" fill="#fff" text-anchor="middle">${iniziale}</text>` +
    `</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
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
    margin: '0 auto 6px auto',
    padding: '12px 0 8px',
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
    boxSizing: 'border-box',
    boxShadow: '0 1px 4px rgba(60,50,30,0.08)',
  },
  panelTitle: {
    margin: '0 0 12px',
    fontSize: 15,
    color: C.ink,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    // filetto dorato sottile (più caldo e leggero della vecchia riga scura piena)
    borderBottom: `1.5px solid ${C.goldDark}`,
    paddingBottom: 6,
    letterSpacing: 2.5,
  },
  // campo in stile modulo: valore su riga con etichetta sotto
  moduloLabel: {
    fontSize: 9,
    color: C.inkDim,
    letterSpacing: 0.7,
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
    borderRadius: 8,
    padding: '8px 6px',
    display: 'flex',
    flexDirection: 'column',
    // titolo in alto e valore sotto: così le etichette di tutti i riquadri
    // (anche quelli con chip più alti, es. Visione/Resistenze) restano allineate
    justifyContent: 'flex-start',
    minHeight: 40,
  },
  vitalLabel: {
    fontSize: 10.5,
    color: C.inkDim,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontWeight: 600,
    lineHeight: 1.15,
    // altezza fissa per ~2 righe: i titoli corti e quelli lunghi occupano lo
    // stesso spazio, così i valori sotto restano tutti allineati
    minHeight: '2.3em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  vitalValue: { fontSize: 17, color: C.ink },
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
    width: 15,
    height: 15,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    // competenza chiara a colpo d'occhio: verde pieno = competente, oro = maestria,
    // anello tenue = non competente (così non sembrano tutte "accese")
    color: livello === 2 ? '#d4af37' : livello === 1 ? C.green : C.inkDim,
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
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    padding: '5px 8px',
    borderBottom: `1px solid ${C.border}`,
  },
  td: { padding: '7px 8px', borderBottom: `1px solid ${C.border}`, verticalAlign: 'middle' },
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
/* box-sizing coerente: padding e bordi non allargano mai gli elementi
   (evita che i pannelli con width:100% sbordino a destra) */
*, *::before, *::after { box-sizing: border-box; }
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
.vitali { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); grid-auto-rows: 1fr; gap: 8px; align-items: stretch; }
/* consente ai riquadri di stringersi sotto la larghezza del contenuto (niente overflow) */
.vitali > * { min-width: 0; }
.vitali > * > * { min-width: 0; }
/* i campi anagrafica (con le tendine): font piccolo, padding compatto, allineati in basso */
.campi-anagrafica > * { min-width: 0; display: flex; flex-direction: column; justify-content: flex-end; }
.campi-anagrafica select { max-width: 100%; font-size: 11px !important; padding: 1px 2px !important; height: 20px; line-height: 1.2; }
.campi-anagrafica .campo-modulo-box { padding: 0 4px !important; min-height: 28px !important; height: 28px; display: flex; align-items: center; overflow: hidden; }
.campi-anagrafica .campo-modulo-label { font-size: 9px !important; margin-top: 2px; }
.selettore-personaggio {
  width: 100%;
  margin: 0 0 8px 0 !important;
}
/* testata: griglia 1fr auto 1fr → titolo sempre centrato e simmetrico, i due
   gruppi di pulsanti nelle colonne laterali di uguale larghezza (niente sovrapposizioni) */
.app-header { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px; }
.app-header-title { grid-column: 2; justify-self: center; text-align: center; white-space: nowrap; margin: 0; }
.app-header-group { flex-wrap: wrap; min-width: 0; }
.app-header-group:first-of-type { justify-self: start; }
.app-header-group:last-of-type { justify-self: end; }
/* schermata di caricamento dal cloud: nuvola che pulsa e barra che scorre */
.cloud-spinner { animation: cloud-bob 1.4s ease-in-out infinite; }
@keyframes cloud-bob { 0%,100% { transform: translateY(0); opacity: 0.85; } 50% { transform: translateY(-8px); opacity: 1; } }
.cloud-bar { width: 40%; animation: cloud-slide 1.1s ease-in-out infinite; }
@keyframes cloud-slide { 0% { margin-left: -40%; } 100% { margin-left: 100%; } }
.app-header-group { flex: 0 0 auto; }
@media (max-width: 560px) {
  /* su schermi stretti: titolo su una riga sopra, i due gruppi di pulsanti sotto */
  .app-header { display: flex; flex-wrap: wrap; justify-content: center; }
  .app-header-title { grid-column: auto; justify-self: auto; order: -1; flex: 1 1 100%; margin-bottom: 6px !important; }
  .app-header-group { flex: 1 1 auto; justify-self: auto; }
}
@media (max-width: 820px) {
  .griglia-scheda { grid-template-columns: 1fr; }
  .selettore-personaggio { width: 100%; }
}
@media (max-width: 560px) {
  .anagrafica > div:last-child > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
  /* su telefono i riquadri anagrafica e vitali passano a 2 colonne (leggibili,
     niente 5 colonne schiacciate); le altezze non sono più forzate uguali */
  .campi-anagrafica { grid-template-columns: repeat(2, 1fr) !important; }
  .vitali { grid-template-columns: repeat(2, 1fr) !important; grid-auto-rows: auto !important; }
  /* niente riquadri a doppia colonna su mobile: griglia 2×N perfettamente uniforme */
  .vitali > * { grid-column: auto !important; }
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
/* pulsante "Aggiorna" quando c'è una nuova versione: lampeggia di verde */
.aggiorna-pronto {
  animation: aggiorna-lampeggia 1.1s ease-in-out infinite;
  font-weight: bold;
}
@keyframes aggiorna-lampeggia {
  0%, 100% { background: transparent; border-color: #2e8b57; color: #2e8b57; box-shadow: 0 0 0 rgba(46,139,87,0); }
  50% { background: #2e8b57; border-color: #2e8b57; color: #fff; box-shadow: 0 0 12px 2px rgba(46,139,87,0.75); }
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

// Spiegazioni brevi per la "nuvoletta" informativa (click su caratteristica/abilità).
const SPIEG_CARATT = {
  forza: 'Potenza fisica. Governa gli attacchi in mischia, l\'abilità Atletica, la capacità di carico e le prove di forza bruta (spaccare, sollevare, spingere).',
  destrezza: 'Agilità e riflessi. Influenza Classe Armatura, Iniziativa, gli attacchi a distanza e con armi accurate, e le abilità Acrobazia, Furtività e Rapidità di Mano.',
  costituzione: 'Salute e vigore. Determina i Punti Ferita e i tiri salvezza contro fatica, veleni, malattie e freddo. Non ha abilità associate.',
  intelligenza: 'Ragionamento e memoria. Governa Arcano, Indagare, Natura, Religione e Storia, e la magia del Mago.',
  saggezza: 'Percezione e intuito. Governa Addestrare Animali, Intuizione, Medicina, Percezione e Sopravvivenza, e la magia di Chierico, Druido e Ranger.',
  carisma: 'Forza di personalità. Governa Inganno, Intimidire, Intrattenere e Persuasione, e la magia di Bardo, Stregone, Warlock e Paladino.',
};
const SPIEG_ABILITA = {
  acrobazia: 'Mantenere l\'equilibrio, capriole, muoversi su superfici insidiose o divincolarsi da una presa. (Destrezza)',
  addestrareAnimali: 'Calmare o controllare un animale, capirne il comportamento, guidare una cavalcatura in situazioni difficili. (Saggezza)',
  arcano: 'Conoscenze su incantesimi, oggetti magici, simboli arcani, piani di esistenza e tradizioni magiche. (Intelligenza)',
  atletica: 'Arrampicarsi, saltare, nuotare, lottare e altre prove di pura forza fisica. (Forza)',
  furtivita: 'Nascondersi, muoversi in silenzio e passare inosservati. (Destrezza)',
  indagare: 'Cercare indizi, dedurre, esaminare dettagli e trovare ciò che è nascosto. (Intelligenza)',
  inganno: 'Mentire in modo convincente, travestirsi, raggirare con le parole. (Carisma)',
  intimidire: 'Influenzare gli altri con minacce, ostilità o forza di volontà. (Carisma)',
  intrattenere: 'Esibirsi con musica, danza, recitazione o oratoria per intrattenere un pubblico. (Carisma)',
  intuizione: 'Capire le vere intenzioni altrui, individuare bugie e leggere gli stati d\'animo. (Saggezza)',
  medicina: 'Stabilizzare un morente, diagnosticare malattie e prestare cure. (Saggezza)',
  natura: 'Conoscenze su terreni, piante, animali, clima e cicli naturali. (Intelligenza)',
  percezione: 'Notare cose con vista, udito e altri sensi; accorgersi di pericoli e presenze. (Saggezza)',
  persuasione: 'Convincere con tatto, gentilezza e buona fede. (Carisma)',
  rapiditaDiMano: 'Giochi di prestigio, borseggiare, nascondere un oggetto sulla persona. (Destrezza)',
  religione: 'Conoscenze su divinità, riti, simboli sacri e gerarchie religiose. (Intelligenza)',
  sopravvivenza: 'Seguire tracce, orientarsi, cacciare, prevedere il clima ed evitare pericoli naturali. (Saggezza)',
  storia: 'Conoscenze su eventi passati, regni, guerre, personaggi e civiltà. (Intelligenza)',
};
// Spiegazioni brevi dei privilegi di classe/sottoclasse (per la nuvoletta nella
// Panoramica). Le chiavi combaciano col nome "base" (senza parentesi né "dN").
const SPIEG_PRIVILEGI = {
  'Lancio di incantesimi': 'Puoi lanciare incantesimi della tua classe, usando la caratteristica da incantatore per CD e attacchi.',
  'Maestria nelle armi': 'Applichi una proprietà di maestria (es. Sanguinare, Spingere, Rallentare) alle armi in cui sei competente. (2024)',
  'Stile di combattimento': 'Scegli uno stile (Duellare, Tiro, Difesa, ecc.) che ti dà un bonus permanente in combattimento.',
  'Attacco extra': "Quando compi l'azione di Attacco, puoi attaccare due volte invece di una.",
  'Due attacchi extra': "Con l'azione di Attacco compi tre attacchi in totale.",
  'Tre attacchi extra': "Con l'azione di Attacco compi quattro attacchi in totale.",
  'Difesa senza armatura': "Se non indossi armatura, la tua CA usa un modificatore di caratteristica al posto dell'armatura.",
  // Barbaro
  'Ira': 'Azione bonus: +danni in mischia con la Forza (da +2 a +4 col livello), vantaggio alle prove/TS di Forza e resistenza a contundenti/perforanti/taglienti. Dura 1 min; usi limitati per riposo lungo.',
  'Attacco irruento': 'Attacchi in mischia con vantaggio, ma fino al tuo prossimo turno i nemici hanno vantaggio contro di te.',
  'Percezione del pericolo': 'Vantaggio ai TS su Destrezza contro effetti che puoi vedere (trappole, incantesimi).',
  'Movimento veloce': 'La tua velocità aumenta di 3 metri quando non indossi armatura pesante.',
  'Istinto ferino': "Vantaggio ai tiri d'iniziativa.",
  'Ira instancabile': "Recuperi/mantieni l'Ira più facilmente quando ne hai bisogno. (2024)",
  'Critico brutale': 'Sui colpi critici in mischia tiri 1 dado dell’arma in più (2 al 13°, 3 al 17°).',
  'Ira implacabile': "Se scenderesti a 0 PF durante l'Ira, con un TS su Costituzione (CD 10, +5 a ogni uso) resti a 1 PF.",
  'Ira persistente': "La tua Ira non termina anticipatamente per mancanza di attacchi o perché sei incapacitato.",
  'Forza indomabile': 'Se una prova di Forza dà meno del tuo punteggio di Forza, usi il punteggio.',
  'Campione primordiale': 'Forza e Costituzione aumentano fino a un massimo più alto: il culmine del barbaro.',
  // Bardo
  'Ispirazione bardica': 'Come azione bonus dai a un alleato un dado da aggiungere a una prova, un attacco o un TS.',
  'Factotum': 'Aggiungi metà del bonus di competenza alle prove in cui non sei competente.',
  'Canzone di riposo': 'Durante un riposo breve tu e gli alleati recuperate PF extra grazie alla tua musica.',
  'Competenza': 'Raddoppi il bonus di competenza in alcune abilità scelte (maestria).',
  "Fonte d'ispirazione": 'Recuperi gli usi di Ispirazione bardica dopo un riposo breve, non solo lungo.',
  'Segreti magici': 'Impari incantesimi da qualsiasi lista di classe.',
  'Ispirazione superiore': "All'inizio del combattimento recuperi usi di Ispirazione bardica se ne hai pochi.",
  'Parole di creazione': 'Padroneggi due potenti incantesimi finali del bardo.',
  'Controincantesimo': 'Con la musica disturbi incantesimi che affascinano o spaventano. (2014)',
  // Chierico
  'Ordine divino': 'Scegli un ruolo (Protettore o Taumaturgo) che dà competenze o un trucchetto potenziato. (2024)',
  'Incanalare divinità': 'Canalizzi energia divina per effetti come Scacciare non morti o poteri del dominio.',
  'Distruggere non morti': 'Quando Scacci i non morti, quelli di grado basso vengono distrutti subito.',
  'Colpo benedetto': 'Aggiungi danni radiosi ai tuoi attacchi o potenzi i trucchetti. (2024)',
  'Colpo benedetto migliorato': 'La versione potenziata di Colpo benedetto, con più danni. (2024)',
  'Intervento divino': 'Preghi la tua divinità perché intervenga direttamente in tuo aiuto.',
  'Dominio divino': 'La tua sottoclasse: il dominio della divinità, con incantesimi e poteri. (2014)',
  // Druido
  'Ordine primordiale': "Scegli un'inclinazione (Mago o Guardiano) che dà un beneficio. (2024)",
  'Linguaggio druidico': 'Conosci il linguaggio segreto dei druidi.',
  'Druidico': 'Conosci il linguaggio segreto dei druidi.',
  'Forma selvatica': 'Ti trasformi in una bestia, assumendone le statistiche di combattimento.',
  'Forma selvatica migliorata': 'Puoi assumere forme di bestie più potenti (grado di sfida più alto).',
  'Compagno selvatico': 'Evochi uno spirito bestiale che ti assiste (come Trova Famiglio). (2024)',
  'Furia elementale': 'I tuoi trucchetti o la forma selvatica infliggono danni elementali extra. (2024)',
  'Incantesimi nella forma selvatica': 'Puoi lanciare incantesimi anche in forma selvatica.',
  'Incantesimi bestiali': 'Puoi lanciare incantesimi mentre sei in Forma Selvatica. (2014)',
  'Corpo senza tempo': 'Invecchi molto più lentamente.',
  'Arcidruido': 'Usi la Forma Selvatica quasi senza limiti e altri benefici supremi.',
  // Guerriero
  'Recuperare energie': 'Come azione bonus recuperi alcuni PF, una volta per riposo.',
  'Azione impetuosa': 'Compi unʼazione aggiuntiva nel tuo turno, una volta per riposo.',
  'Mente tattica': 'Puoi spendere Recuperare Energie per migliorare una prova fallita. (2024)',
  'Indomito': 'Puoi ritirare un tiro salvezza fallito, una volta per riposo lungo.',
  'Maestro tattico': 'Usando la Maestria nelle armi ottieni opzioni tattiche extra. (2024)',
  'Attacchi studiati': 'Se manchi un attacco, ottieni vantaggio al prossimo contro quel bersaglio. (2024)',
  // Ladro
  'Attacco furtivo': 'Una volta per turno infliggi danni extra (1d6 ogni 2 livelli da ladro: 1d6 al 1°, 5d6 al 9°, 10d6 al 19°) se hai vantaggio o un alleato è adiacente al bersaglio.',
  'Maestria': 'Raddoppi il bonus di competenza in alcune abilità scelte.',
  'Gergo ladresco': 'Un gergo segreto per messaggi nascosti tra ladri.',
  'Azione scaltra': 'Come azione bonus puoi Scattare, Disimpegnarti o Nasconderti ogni turno.',
  'Schivata prodigiosa': 'Come reazione dimezzi i danni di un attacco che ti colpisce.',
  'Elusione': 'Con un TS su Destrezza riuscito eviti del tutto i danni invece di dimezzarli.',
  'Talento affidabile': 'Nelle prove in cui sei competente, ogni tiro del d20 di 9 o meno conta come 10.',
  'Colpo scaltro': 'Spendi dadi di Attacco furtivo per effetti extra (avvelenare, atterrare, allontanare). (2024)',
  'Colpo scaltro migliorato': 'Puoi combinare più effetti di Colpo scaltro nello stesso attacco. (2024)',
  'Mente sfuggente': 'Ottieni competenza in altri tiri salvezza (es. Saggezza).',
  'Inafferrabile': 'Nessun attacco ha vantaggio contro di te finché non sei incapacitato.',
  'Colpo di fortuna': 'Trasformi un mancato in colpo, o una prova fallita in un 20, una volta per riposo.',
  'Percezione cieca': 'Percepisci creature nascoste o invisibili nelle vicinanze. (2014)',
  // Mago
  'Recupero arcano': 'Durante un riposo breve recuperi alcuni slot incantesimo spesi.',
  'Rituali · Studioso': 'Puoi lanciare come rituale e hai competenza extra in un campo del sapere. (2024)',
  'Studioso': 'Hai competenza (o maestria) in un campo del sapere: Arcano, Storia, ecc. (2024)',
  'Memorizzare incantesimo': 'Durante un riposo breve puoi sostituire un incantesimo preparato. (2024)',
  'Padronanza degli incantesimi': 'Lanci a volontà un incantesimo di 1° e uno di 2° livello scelti.',
  'Incantesimi distintivi': 'Due incantesimi di 3° livello che lanci gratis una volta per riposo.',
  // Monaco
  'Arti marziali': "Le armi da monaco usano Destrezza e infliggono danni crescenti; ottieni un colpo senz'armi bonus.",
  'Concentrazione monastica': 'Hai punti Ki/Concentrazione per tecniche come Raffica di colpi, Scatto e Difesa.',
  'Ki': 'Hai punti Ki che alimentano le tecniche monastiche.',
  'Movimento senza armatura': 'Senza armatura la tua velocità aumenta.',
  'Metabolismo prodigioso': 'Recuperi punti Concentrazione e PF con più facilità. (2024)',
  'Deviare attacchi': 'Come reazione riduci i danni di un attacco (e a volte lo rilanci).',
  'Deviare i proiettili': 'Come reazione riduci i danni di un attacco a distanza di 1d10 + Destrezza + livello da monaco; se li annulli puoi rilanciare il proiettile.',
  'Caduta lenta': 'Come reazione riduci i danni da caduta di 5 × il tuo livello da monaco.',
  'Colpo stordente': 'Spendi 1 punto Concentrazione: il bersaglio colpito in mischia è stordito fino al tuo prossimo turno (TS Costituzione).',
  'Colpi potenziati dal ki': 'I colpi senzʼarmi contano come magici per superare le resistenze. (2014)',
  'Quiete della mente': 'Puoi porre fine a effetti che ti affascinano o spaventano. (2014)',
  'Movimento acrobatico': 'Ti muovi su superfici verticali e sui liquidi senza cadere. (2024)',
  'Concentrazione accresciuta': 'Migliori la gestione dei tuoi punti Concentrazione. (2024)',
  'Auto-guarigione': 'Spendi Concentrazione per curarti o rimuovere condizioni. (2024)',
  "Deviare l'energia": 'Puoi deviare anche attacchi che infliggono danni elementali. (2024)',
  'Sopravvissuto disciplinato': 'Ottieni competenza in tutti i tiri salvezza. (2024)',
  'Concentrazione perfetta': "Recuperi sempre alcuni punti Concentrazione all'iniziativa. (2024)",
  'Purezza del corpo': 'Sei immune a malattie e veleni. (2014)',
  'Lingua del sole e della luna': 'Comprendi e ti fai capire in qualsiasi lingua. (2014)',
  'Anima di diamante': 'Competenza in tutti i TS e possibilità di ritirarli. (2014)',
  'Difesa superiore': 'Spendi Concentrazione per resistere a quasi tutti i danni per un turno. (2024)',
  'Corpo vuoto': 'Diventi invisibile e resistente a quasi tutti i danni per un breve tempo. (2014)',
  'Sé perfetto': 'Il culmine del monaco: recuperi Ki e potenzi corpo e mente.',
  'Corpo e mente': 'Il culmine del monaco: Destrezza e Saggezza aumentano notevolmente. (2024)',
  // Paladino
  'Imposizione delle mani': 'Riserva di cura pari a 5 × il tuo livello da paladino, da distribuire toccando i feriti (5 punti curano anche un veleno o una malattia). Si ricarica col riposo lungo.',
  'Colpo divino': 'Quando colpisci in mischia, spendi uno slot incantesimo per +2d8 danni radiosi (+1d8 per livello di slot oltre il 1°; +1d8 contro non morti/immondi).',
  'Punizione divina': 'Quando colpisci in mischia, spendi uno slot incantesimo per +2d8 danni radiosi (+1d8 per livello di slot oltre il 1°; +1d8 contro non morti/immondi).',
  'Punizione divina migliorata': 'Tutti i tuoi attacchi in mischia infliggono danni radiosi extra. (2014)',
  'Salute divina': 'Sei immune alle malattie. (2014)',
  'Senso divino': 'Percepisci celestiali, immondi e non morti nelle vicinanze. (2014)',
  'Aura di protezione': 'Tu e gli alleati entro 3 m (9 m al 18°) aggiungete il tuo modificatore di Carisma (min +1) a tutti i tiri salvezza.',
  'Aura di coraggio': 'Tu e gli alleati entro 3 m (9 m al 18°) non potete essere spaventati.',
  'Colpi radiosi': 'I tuoi attacchi in mischia infliggono danni radiosi aggiuntivi. (2024)',
  'Rinnegare i nemici': 'Spaventi e blocchi i nemici con la tua presenza divina. (2024)',
  'Tocco risanatore': 'Puoi porre fine a incantesimi su di te o sugli alleati.',
  'Tocco purificante': 'Puoi porre fine a incantesimi su di te o sugli alleati. (2014)',
  'Aure potenziate': 'Il raggio delle tue aure aumenta.',
  'Aure': 'Il raggio delle tue aure aumenta.',
  'Destriero fidato': 'Evochi una cavalcatura spirituale (come Trova Destriero). (2024)',
  // Ranger
  'Nemico favorito': 'Hai un vantaggio nel dare la caccia e conoscere certi tipi di creature.',
  'Nemico prescelto': 'Conosci a fondo certi tipi di creatura: vantaggio a tracciarle e ricordarne informazioni. (2014)',
  'Esploratore provetto': 'Sei abile nel viaggio, orientamento e sopravvivenza.',
  'Esploratore naturale': "Ti muovi e sopravvivi con maestria nei territori a te familiari. (2014)",
  'Consapevolezza primordiale': "Spendi uno slot per percepire certi tipi di creatura nell'area. (2014)",
  'Vagabondo': 'Aumenti velocità, scalata e salto. (2024)',
  'Instancabile': 'Riduci lo sfinimento e recuperi PF temporanei. (2024)',
  'Cacciatore implacabile': 'Il tuo Marchio del Cacciatore si mantiene meglio (meno concentrazione). (2024)',
  'Velo della natura': 'Come azione bonus diventi invisibile per un turno. (2024)',
  'Cacciatore preciso': 'Vantaggio agli attacchi contro il bersaglio del tuo Marchio. (2024)',
  'Sensi ferini': 'Percepisci le creature invisibili vicine e le colpisci meglio.',
  'Andatura nel terreno': 'Il terreno difficile naturale non ti rallenta. (2014)',
  'Nascondersi in piena vista': 'Puoi nasconderti restando immobile e mimetizzato. (2014)',
  'Svanire': 'Come azione bonus puoi Nasconderti; non puoi essere tracciato. (2014)',
  'Sterminatore di nemici': 'Una volta per turno aggiungi danni extra a un attacco contro un nemico.',
  // Stregone
  'Stregoneria innata': 'La fonte della tua magia innata: la sottoclasse che concede poteri unici.',
  'Origine stregonesca': 'La fonte della tua magia innata: la sottoclasse che concede poteri unici. (2014)',
  'Fonte di magia': 'Hai Punti Stregoneria (= livello da stregone) che converti in slot incantesimo e viceversa, come azione bonus.',
  'Metamagia': 'Impari 2 opzioni di Metamagia (altre al 10° e 17°): spendi Punti Stregoneria per modificare un incantesimo (gittata, bersagli, silenzioso, rapido, ecc.).',
  'Recupero stregonesco': 'Recuperi Punti Stregoneria dopo un riposo.',
  'Ristoro stregonesco': 'Recuperi Punti Stregoneria dopo un riposo breve. (2014)',
  'Stregoneria incarnata': 'Potenzi la tua Stregoneria Innata con effetti aggiuntivi. (2024)',
  'Apoteosi arcana': 'Il culmine dello stregone: usi la metamagia gratis in certe condizioni.',
  // Warlock
  'Magia del patto': 'Pochi slot incantesimo (1-4) sempre al livello massimo, che recuperi a ogni riposo breve o lungo.',
  'Patrono ultraterreno': "L'entità del tuo patto: la sottoclasse che concede incantesimi e poteri.",
  'Suppliche occulte': 'Impari doni magici permanenti a scelta (ne ottieni di più salendo di livello): es. vedere al buio, potenziare Raffica Occulta, lanciare certi incantesimi.',
  'Invocazioni occulte': 'Doni magici permanenti a scelta (es. Vista del Diavolo, Raffica potenziata). (2014)',
  'Astuzia magica': 'Durante un riposo breve puoi recuperare slot del patto spesi. (2024)',
  'Dono del patto': 'Scegli un dono: lama, tomo, catena o talismano. (2014)',
  'Contattare il patrono': 'Puoi comunicare direttamente col tuo patrono. (2024)',
  'Arcanum mistico': 'Impari un incantesimo di alto livello che lanci gratis una volta per riposo lungo.',
  'Maestro occulto': 'Il culmine del warlock: recuperi tutti gli slot del patto con un breve rituale.',

  // ===== PRIVILEGI DI SOTTOCLASSE (2024) — riassunti nostri =====
  // Barbaro
  'Frenesia': 'Durante l’Ira compi un attacco senz’armi o con arma bonus a ogni turno.',
  'Presenza Intimidatoria': 'Come azione bonus spaventi un nemico vicino (TS Saggezza).',
  'Rappresaglia': 'Come reazione, quando subisci danni in mischia puoi contrattaccare.',
  'Ira Selvaggia': 'La tua Ira assume un aspetto animale (orso, aquila, lupo) con benefici diversi.',
  'Aspetto della Natura': 'Ottieni un potere costante legato al tuo spirito animale.',
  'Parlare con la Natura': 'Puoi comunicare con gli animali e percepire la natura intorno a te.',
  'Potere della Natura': 'Il culmine del Cuore Selvaggio: potenzia i tuoi aspetti animali.',
  'Vitalità dell’Albero': 'Durante l’Ira ottieni PF temporanei e ti radichi all’Albero del Mondo.',
  'Rami dell’Albero': 'Durante l’Ira afferri e sposti i nemici con rami spettrali.',
  'Battaglia per l’Albero': 'Proteggi gli alleati vicini e ostacoli chi li attacca.',
  'Radici Nutrienti': 'Le radici dell’Albero ti curano e ti ancorano al terreno.',
  'Viaggio lungo l’Albero': 'Puoi teletrasportarti per brevi distanze durante l’Ira.',
  'Furia Divina': 'Durante l’Ira i tuoi attacchi infliggono danni radiosi o necrotici extra.',
  'Guerriero degli Dèi': 'Gli incantesimi di cura lanciati su di te rendono al massimo.',
  'Concentrazione Fanatica': 'Una volta per Ira, se fallisci un TS puoi considerarlo riuscito.',
  'Presenza Zelante': 'Come azione bonus dai vantaggio agli attacchi degli alleati vicini.',
  'Ira degli Dèi': 'Il culmine dello Zelota: continui a combattere anche in punto di morte.',
  // Bardo
  'Passi Abbaglianti': 'Ti muovi come un ballerino: colpi con danni radiosi e mobilità migliore.',
  'Movimento Ispiratore': 'Quando un alleato vicino è colpito, come reazione può muoversi senza attacchi di opportunità.',
  'Passi in Tandem': 'Ti muovi assieme a un alleato senza provocare attacchi di opportunità.',
  'Elusione Guida': 'Tu e gli alleati vicini subite metà danni dagli effetti ad area.',
  'Manto d’Ispirazione': 'Spendi Ispirazione bardica per dare PF temporanei e movimento agli alleati.',
  'Esibizione Soggiogante': 'La tua esibizione affascina chi ti osserva (TS Saggezza).',
  'Manto di Maestà': 'Per un breve tempo lanci Comando come azione bonus senza spendere slot.',
  'Maestà Infrangibile': 'La tua presenza è così regale che i nemici faticano a colpirti.',
  'Competenze Bonus': 'Ottieni competenza in abilità o strumenti aggiuntivi dalla sottoclasse.',
  'Parole Taglienti': 'Come reazione sottrai un dado di Ispirazione al tiro di un nemico.',
  'Scoperte Magiche': 'Impari incantesimi aggiuntivi da qualsiasi lista di classe.',
  'Abilità Impareggiabile': 'Aggiungi un dado di Ispirazione a una tua prova di abilità.',
  'Ispirazione da Combattimento': 'Gli alleati usano la tua Ispirazione bardica per danni o CA in combattimento.',
  'Magia da Battaglia': 'Dopo aver lanciato un incantesimo puoi anche compiere un attacco d’arma.',
  // Chierico
  'Incantesimi di Dominio': 'Il tuo dominio ti concede incantesimi sempre preparati.',
  'Discepolo della Vita': 'I tuoi incantesimi di cura ripristinano PF extra.',
  'Preservare la Vita': 'Con Incanalare Divinità distribuisci PF a più creature vicine.',
  'Guaritore Benedetto': 'Quando curi un altro, curi anche te stesso.',
  'Guarigione Suprema': 'I tuoi incantesimi di cura rendono il massimo possibile.',
  'Bagliore Protettivo': 'Come reazione imponi svantaggio all’attacco di un nemico con un lampo di luce.',
  'Radiosità dell’Alba': 'Con Incanalare Divinità emani luce che ferisce i nemici e dissolve le tenebre.',
  'Bagliore Migliorato': 'Il tuo Bagliore Protettivo può proteggere anche gli alleati.',
  'Corona di Luce': 'Emani una corona di luce che rende i nemici vulnerabili alla tua magia.',
  'Benedizione dell’Ingannatore': 'Tocchi un alleato dandogli vantaggio a una prova di abilità.',
  'Invocare Duplicità': 'Con Incanalare Divinità crei un’illusione di te da cui lanciare incantesimi.',
  'Trasposizione dell’Ingannatore': 'Puoi scambiarti di posto con la tua illusione duplicata.',
  'Duplicità Migliorata': 'Crei più illusioni di te stesso contemporaneamente.',
  'Sacerdote Guerriero': 'Come azione bonus compi un attacco d’arma aggiuntivo.',
  'Attacco Guidato': 'Con Incanalare Divinità aggiungi un grosso bonus a un tiro per colpire.',
  'Benedizione del Dio della Guerra': 'Come reazione concedi un bonus a colpire a te o a un alleato.',
  'Avatar della Battaglia': 'Diventi un avatar di guerra: resistenza alle armi non magiche.',
  // Druido
  'Incantesimi del Circolo': 'Il tuo circolo ti concede incantesimi sempre preparati.',
  'Aiuto della Terra': 'Con la magia curi un alleato o danneggi un nemico, legato alla terra.',
  'Recupero Naturale': 'Durante un riposo breve recuperi alcuni slot incantesimo.',
  'Protezione della Natura': 'Sei immune a veleno e malattie e resistente ai danni elementali.',
  'Santuario della Natura': 'I nemici devono superare un TS per riuscire ad attaccarti.',
  'Forme del Circolo': 'La tua Forma Selvatica da combattimento è più resistente e potente.',
  'Forme del Circolo Migliorate': 'Le tue forme bestiali diventano più forti e feriscono in modo magico.',
  'Passo di Luce Lunare': 'Come azione bonus ti teletrasporti e potenzi il tuo prossimo incantesimo.',
  'Forma Lunare': 'La tua Forma Selvatica emana luce lunare che cura gli alleati.',
  'Ira del Mare': 'Come azione bonus colpisci un nemico con un’ondata gelida che lo respinge.',
  'Affinità Acquatica': 'Ottieni velocità di nuoto e la capacità di respirare sott’acqua.',
  'Nato dalla Tempesta': 'Durante l’effetto del mare ottieni velocità di volo e resistenza ai danni.',
  'Dono Oceanico': 'Condividi i doni del mare con un alleato vicino.',
  'Mappa Stellare': 'Ricevi una mappa stellare magica che ti concede un incantesimo e benefici.',
  'Forma Stellata': 'Assumi una forma costellata (Arciere, Calice, Drago) con poteri diversi.',
  'Presagio Cosmico': 'A ogni riposo lungo un presagio ti dà bonus o malus da imporre ai tiri.',
  'Costellazioni Scintillanti': 'Le tue forme stellari si potenziano ed emanano luce.',
  'Pieno di Stelle': 'Diventi parzialmente incorporeo: resistenza a molti tipi di danno.',
  // Guerriero
  'Critico Migliorato': 'Ottieni un colpo critico con un tiro di 19 o 20.',
  'Atleta Straordinario': 'Vantaggio alle prove atletiche e mobilità migliorata.',
  'Stile di Combattimento Aggiuntivo': 'Impari un secondo Stile di Combattimento.',
  'Critico Superiore': 'Ottieni un colpo critico con un tiro di 18, 19 o 20.',
  'Sopravvissuto': 'Ti curi automaticamente ogni turno finché sei in piedi in battaglia.',
  'Manovre da Combattimento': 'Impari manovre tattiche (spingere, disarmare…) alimentate dai Dadi di Superiorità.',
  'Dadi di Superiorità': 'Riserva di dadi che alimentano le tue manovre da combattimento.',
  'Studente di Guerra': 'Ottieni competenza in uno strumento da artigiano e nozioni belliche.',
  'Conosci il Nemico': 'Studiando un nemico ne scopri punti di forza e debolezze.',
  'Dadi di Superiorità Migliorati': 'I tuoi Dadi di Superiorità diventano d10.',
  'Implacabile': 'Quando saresti a zero Dadi di Superiorità ne recuperi comunque uno.',
  'Dadi di Superiorità Superiori': 'I tuoi Dadi di Superiorità diventano d12.',
  'Legame con l’Arma': 'Leghi magicamente un’arma a te: non puoi essere disarmato e la richiami.',
  'Magia da Guerra': 'Dopo aver lanciato un trucchetto puoi attaccare come azione bonus.',
  'Colpo Arcano': 'Quando colpisci con un’arma, il tuo prossimo incantesimo è più efficace.',
  'Carica Arcana': 'Quando usi Azione Impetuosa puoi teletrasportarti.',
  'Magia da Guerra Migliorata': 'Dopo un incantesimo lanciato con l’azione puoi attaccare come azione bonus.',
  'Potere Psionico': 'Riserva di Dadi di Energia Psionica che alimentano le tecniche telecinetiche.',
  'Guardia Protettrice': 'Come reazione riduci i danni a te o a un alleato con energia psionica.',
  'Adepto Telecinetico': 'Colpisci con la mente: spingi o trattieni i nemici e attacchi a distanza.',
  'Mente Protetta': 'Come reazione ottieni vantaggio ai TS mentali con energia psionica.',
  'Baluardo di Forza': 'Crei una barriera di forza che protegge te e gli alleati.',
  'Maestro Telecinetico': 'Sollevi telecineticamente una creatura o un oggetto (come Mano Potente).',
  // Ladro
  'Assassinare': 'Vantaggio contro chi non ha ancora agito; i colpi a sorpresa sono critici e più letali.',
  'Esperto d’Infiltrazione': 'Crei identità false credibili e ti infiltri con facilità.',
  'Impostore': 'Imiti alla perfezione aspetto, voce e modi di un’altra persona.',
  'Colpo Mortale': 'Contro un bersaglio sorpreso raddoppi i danni se lo colpisci.',
  'Mani Veloci': 'Usi l’Azione Scaltra per usare oggetti, rubare o disinnescare trappole.',
  'Lavoro in Quota': 'Scali più in fretta e salti più lontano.',
  'Furtività Suprema': 'Hai vantaggio a Furtività se ti muovi lentamente.',
  'Uso di Oggetti Magici': 'Puoi usare bacchette, pergamene e oggetti magici di altre classi.',
  'Riflessi del Ladro': 'Nel primo round di combattimento agisci due volte.',
  'Lame Psichiche': 'Materializzi lame di energia psichica da lanciare o brandire.',
  'Lame dell’Anima': 'Le tue Lame Psichiche diventano più potenti e recuperabili.',
  'Velo Psichico': 'Come azione ti rendi invisibile per un breve tempo.',
  'Lacerare la Mente': 'Il tuo Attacco Furtivo può ferire la mente del bersaglio e stordirlo.',
  'Mano Magica Prestidigitatrice': 'La tua Mano Magica è invisibile e può rubare o scassinare.',
  'Imboscata Magica': 'Se sei nascosto, i nemici hanno svantaggio ai TS contro i tuoi incantesimi.',
  'Ingannatore Versatile': 'Usi la Mano Magica per distrarre più nemici e dare vantaggio ai tuoi attacchi.',
  'Ladro di Incantesimi': 'Come reazione rubi un incantesimo lanciato contro di te e lo apprendi per un giorno.',
  // Mago
  'Sapiente dell’Abiurazione': 'Impari e copi incantesimi di abiurazione con più facilità ed economia.',
  'Barriera Arcana': 'Una barriera magica assorbe danni al posto tuo; si ricarica lanciando abiurazioni.',
  'Barriera Proiettata': 'Come reazione usi la tua Barriera Arcana per proteggere un alleato.',
  'Spezza-Incantesimi': 'Sei più efficace nel dissolvere e contrastare la magia nemica.',
  'Resistenza agli Incantesimi': 'Vantaggio ai TS contro gli incantesimi e resistenza ai loro danni.',
  'Sapiente della Divinazione': 'Impari e copi incantesimi di divinazione con più facilità ed economia.',
  'Presagio': 'A ogni riposo lungo tiri due d20 da usare per sostituire tiri tuoi o altrui.',
  'Divinazione Esperta': 'Lanciando divinazioni recuperi uno slot incantesimo di livello inferiore.',
  'Il Terzo Occhio': 'Come azione ottieni scurovisione, vista eterea o altri sensi magici.',
  'Presagio Superiore': 'Ottieni un dado di Presagio in più a ogni riposo lungo.',
  'Sapiente dell’Invocazione': 'Impari e copi incantesimi di invocazione con più facilità ed economia.',
  'Plasmare Incantesimi': 'I tuoi incantesimi ad area risparmiano gli alleati che scegli.',
  'Trucchetto Potente': 'I tuoi trucchetti dannosi infliggono metà danni anche se il bersaglio supera il TS.',
  'Invocazione Potenziata': 'Aggiungi il tuo modificatore da incantatore ai danni degli incantesimi di invocazione.',
  'Sovraccaricare': 'Puoi infliggere il danno massimo con un incantesimo, a costo di danni a te stesso.',
  'Sapiente dell’Illusione': 'Impari e copi incantesimi di illusione con più facilità ed economia.',
  'Illusioni Migliorate': 'Il tuo trucchetto Illusione Minore è più versatile (suono e immagine insieme).',
  'Creature Fantasmatiche': 'Le tue illusioni possono dare forma a creature semi-reali.',
  'Sé Illusorio': 'Come reazione crei un’illusione che fa mancare un attacco che ti colpirebbe.',
  'Realtà Illusoria': 'Rendi reale per un istante una parte di un’illusione.',
  // Monaco
  'Tecnica della Mano Aperta': 'Con Raffica di Colpi puoi atterrare, respingere o negare reazioni ai nemici.',
  'Ristoro del Corpo': 'Come azione spendi Concentrazione per curarti.',
  'Tranquillità': 'Al termine di un riposo lungo emani su di te un effetto di Santuario.',
  'Palmo Vibrante': 'Colpisci con energia letale che può abbattere il bersaglio in un secondo momento.',
  'Mano della Guarigione': 'Con la Concentrazione curi PF a una creatura toccata.',
  'Mano del Danno': 'Con la Concentrazione infliggi danni necrotici extra a una creatura colpita.',
  'Tocco del Medico': 'Le tue cure rimuovono condizioni e i tuoi colpi possono infliggerne.',
  'Raffica di Cure e Danni': 'La tua Raffica di Colpi cura gli alleati o danneggia i nemici senza costo.',
  'Mano della Misericordia Suprema': 'Puoi riportare in vita una creatura morta di recente.',
  'Sintonia Elementale': 'Incanali un elemento nei tuoi colpi (fuoco, gelo…) con portata maggiore.',
  'Manipolare gli Elementi': 'Produci piccoli effetti elementali a volontà (come un trucchetto).',
  'Scarica Elementale': 'Spendi Concentrazione per un’esplosione elementale ad area.',
  'Passo degli Elementi': 'Ottieni velocità di volo o di nuoto legata al tuo elemento.',
  'Epitome Elementale': 'Il culmine degli Elementi: resistenza e portata elementale potenziate.',
  'Arti dell’Ombra': 'Lanci Oscurità e vedi attraverso di essa; magie legate alle tenebre.',
  'Passo dell’Ombra': 'Nell’oscurità ti teletrasporti da un’ombra all’altra con vantaggio all’attacco.',
  'Passo dell’Ombra Migliorato': 'Il tuo Passo dell’Ombra ha portata maggiore e più usi.',
  'Manto d’Ombre': 'Come azione diventi invisibile nell’oscurità.',
  // Paladino
  'Incantesimi del Giuramento': 'Il tuo giuramento ti concede incantesimi sempre preparati.',
  'Arma Sacra': 'Con Incanalare Divinità la tua arma diventa sacra: bonus a colpire e danni radiosi.',
  'Aura di Devozione': 'Tu e gli alleati nell’aura non potete essere affascinati.',
  'Punizione della Protezione': 'Quando usi Punizione Divina, gli alleati vicini ottengono copertura.',
  'Nimbo Sacro': 'Emani luce solare che ti protegge e brucia i nemici vicini.',
  'Atleta Impareggiabile': 'Vantaggio alle prove atletiche e mobilità migliorata.',
  'Punizione Ispiratrice': 'Quando usi Incanalare Divinità distribuisci PF temporanei agli alleati.',
  'Aura di Alacrità': 'Tu e gli alleati nell’aura avete velocità aumentata.',
  'Difesa Gloriosa': 'Come reazione migliori la CA di un alleato e contrattacchi.',
  'Leggenda Vivente': 'Diventi leggendario: bonus ai tiri e capacità di trasformare un mancato in colpo.',
  'Ira della Natura': 'Con Incanalare Divinità evochi viticci spettrali che trattengono i nemici vicini.',
  'Aura di Guardia': 'Tu e gli alleati nell’aura avete resistenza ai danni degli incantesimi.',
  'Sentinella Imperitura': 'Quando scenderesti a 0 PF resti invece a 1 PF (una volta per riposo).',
  'Campione Antico': 'Ti trasformi in un campione della natura: rigenerazione e magia potenziata.',
  'Voto di Inimicizia': 'Con Incanalare Divinità marchi un nemico e hai vantaggio agli attacchi contro di lui.',
  'Vendicatore Implacabile': 'Quando colpisci con un attacco di opportunità puoi muoverti restando saldo.',
  'Anima della Vendetta': 'Come reazione attacchi il bersaglio del tuo Voto quando colpisce.',
  'Angelo Vendicatore': 'Metti le ali e semini il terrore tra i nemici che ti circondano.',
  // Ranger
  'Preda del Cacciatore': 'Scegli un beneficio contro le prede (colpo extra, danno ai grandi nemici…).',
  'Tattiche Difensive': 'Scegli una difesa (contro attacchi multipli, resistenza alle condizioni…).',
  'Multiattacco': 'Colpisci più bersagli con un solo attacco (a raffica o a cono).',
  'Difesa Superiore del Cacciatore': 'Come reazione riduci i danni subiti, potenziando le tue difese.',
  'Compagno Primordiale': 'Evochi una bestia spiritica che combatte al tuo fianco e cresce con te.',
  'Addestramento Eccezionale': 'Il tuo compagno bestiale attacca meglio e infligge danni magici.',
  'Furia Bestiale': 'Il tuo compagno bestiale compie due attacchi.',
  'Condividere Incantesimi': 'Puoi far bersaglio anche del tuo compagno agli incantesimi lanciati su di te.',
  'Incantesimi': 'La tua sottoclasse ti concede incantesimi sempre preparati.',
  'Colpi Terrificanti': 'I tuoi attacchi d’arma possono infliggere danni psichici extra.',
  'Fascino Ultraterreno': 'Ottieni competenza in Persuasione o Inganno e un incantesimo fatato.',
  'Distorsione Ammaliante': 'Come reazione redirigi un attacco verso un’altra creatura vicina.',
  'Rinforzi Fatati': 'Evochi uno spirito fatato che combatte con te per un breve tempo.',
  'Vagabondo Nebbioso': 'Puoi teletrasportarti brevemente ogni turno tra la nebbia.',
  'Agguato Terrificante': 'Nel primo turno di combattimento sei più rapido e infliggi danni extra.',
  'Vista Umbratile': 'Ottieni scurovisione (o migliore) e sei invisibile nell’oscurità magica.',
  'Mente di Ferro': 'Ottieni competenza in un tiro salvezza mentale (Saggezza, Intelligenza o Carisma).',
  'Raffica del Predatore': 'Quando manchi un attacco puoi ripeterlo, restando nascosto.',
  'Schivata Ombrosa': 'Come reazione, se sei nell’ombra imponi svantaggio a un attacco contro di te.',
  // Stregone
  'Ondata di Magia Selvaggia': 'La tua magia può scatenare effetti casuali (tabella del caos).',
  'Onde di Caos': 'Puoi forzare un effetto di Magia Selvaggia per manipolare la sorte.',
  'Piega la Sorte': 'Spendi Punti Stregoneria per aggiungere o togliere a un tiro d20.',
  'Caos Controllato': 'Puoi tirare due volte sulla tabella del caos e scegliere il risultato.',
  'Bombardamento Magico': 'Con un colpo critico o un’uccisione ritiri e potenzi i dadi di danno.',
  'Resilienza Draconica': 'PF massimi aumentati e CA innata quando non indossi armatura.',
  'Incantesimi Draconici': 'La tua stirpe ti concede incantesimi sempre preparati.',
  'Affinità Elementale': 'Aggiungi il modificatore di Carisma ai danni del tuo elemento draconico.',
  'Ali di Drago': 'Fai spuntare ali e ottieni velocità di volo.',
  'Compagno Draconico': 'La tua magia draconica raggiunge il culmine (aura e volo potenziati).',
  'Linguaggio Telepatico': 'Comunichi telepaticamente con le creature vicine.',
  'Incantesimi Psionici': 'La tua mente aberrante ti concede incantesimi sempre preparati.',
  'Stregoneria Psionica': 'Puoi lanciare alcuni incantesimi spendendo Punti Stregoneria in silenzio.',
  'Difese Psichiche': 'Ottieni resistenza ai danni psichici e vantaggio contro chi legge la mente.',
  'Rivelazione nella Carne': 'Come azione bonus ottieni tratti aberranti (volo, nuoto, portata…).',
  'Implosione Distorcente': 'Ti teletrasporti scatenando un’implosione di forza sui nemici vicini.',
  'Magia Meccanica': 'Ottieni competenze e incantesimi legati all’ordine e alla meccanica.',
  'Ripristinare l’Equilibrio': 'Come reazione annulli vantaggio o svantaggio su un tiro vicino.',
  'Bastione della Legge': 'Crei uno scudo di energia che assorbe danni per te o gli alleati.',
  'Trance dell’Ordine': 'I tuoi tiri di attacco e prove non possono avere svantaggio.',
  'Cavalcata Meccanica': 'Evochi un incantesimo di Evoca Costrutto senza spendere slot.',
  // Warlock
  'Incantesimi del Patrono': 'Il tuo patrono ti concede incantesimi sempre preparati.',
  'Benedizione dell’Oscuro': 'Quando riduci un nemico a 0 PF ottieni PF temporanei.',
  'Fortuna dell’Oscuro': 'Puoi aggiungere il Carisma a una prova o TS fallito, una volta per riposo.',
  'Resilienza Immonda': 'Come azione bonus ottieni resistenza a quasi tutti i danni per un turno.',
  'Scagliare all’Inferno': 'Scagli un nemico attraverso l’Inferno, infliggendo enormi danni.',
  'Passi Fatati': 'Come azione bonus ti teletrasporti e affascini o spaventi chi è vicino.',
  'Fuga Nebbiosa': 'Come reazione, se subisci danni ti teletrasporti e diventi invisibile.',
  'Difese Ammalianti': 'Non puoi essere affascinato e chi ti affascina subisce l’incantesimo di ritorno.',
  'Magia Stregante': 'Dopo un incantesimo di ammaliamento o illusione puoi teletrasportarti.',
  'Mente Risvegliata': 'Comunichi telepaticamente con le creature intorno a te.',
  'Combattente Chiaroveggente': 'Un tuo alleato psichico dà vantaggio ai tiri contro un nemico.',
  'Scudo del Pensiero': 'Resistenza ai danni psichici e protezione dalla lettura del pensiero.',
  'Creare uno Schiavo': 'Puoi ammaliare permanentemente un umanoide o una bestia.',
  'Luce Guaritrice': 'Hai una riserva di dadi di cura da distribuire come azione bonus.',
  'Anima Radiosa': 'Aggiungi il Carisma ai danni radiosi o da fuoco e ottieni volo temporaneo.',
  'Resilienza Celestiale': 'Ottieni PF temporanei per te e gli alleati a ogni riposo.',
  'Vendetta Ardente': 'Quando scenderesti a 0 PF esplodi di luce, curandoti e ferendo i nemici.',

  // ===== Nomi ufficiali 2024 (Barbaro/Bardo/Chierico) — voci nuove o rinominate =====
  'Ira Incontenibile': 'Mentre sei in ira non puoi essere affascinato né spaventato; se lo sei, la condizione termina quando entri in ira.',
  'Ritorsione': 'Come reazione, quando una creatura entro 1,5 m ti ferisce puoi contrattaccarla in mischia.',
  'Ira della Natura Selvaggia': 'La tua ira assume un aspetto animale (Aquila, Lupo o Orso) con benefici diversi.',
  'Portavoce degli Animali': 'Puoi lanciare Parlare con gli Animali a volontà (come rituale).',
  'Aspetto della Natura Selvaggia': 'Ottieni un potere costante da uno spirito animale (sensi, scalata/nuoto, ecc.).',
  'Portavoce della Natura': 'Puoi lanciare Comunione con la Natura come rituale.',
  'Potere della Natura Selvaggia': 'Al culmine, alla fine dell’ira evochi uno spirito fatato o ottieni un grande potere naturale.',
  'Radici d’Assalto': 'Viticci aumentano la tua portata con armi pesanti/versatili e potenzi le proprietà di padronanza.',
  'Focus Fanatico': 'Una volta per ira, se fallisci un tiro salvezza puoi ripeterlo con un bonus.',
  'Scarto Smagliante': 'Ti muovi con grazia da ballerino: colpo senz’armi con dado di Ispirazione e mobilità migliore.',
  'Scarto Coordinato': 'Quando ti muovi, un alleato vicino può muoversi con te senza attacchi di opportunità.',
  'Elusione Trainante': 'Tu e gli alleati vicini subite metà danni dagli effetti ad area.',
  'Magia Ammaliante': 'Con un’esibizione affascini chi ti osserva (TS Saggezza).',
  'Manto di Ispirazione': 'Spendi Ispirazione bardica per dare PF temporanei e movimento agli alleati.',
  'Manto di Maestosità': 'Per un breve tempo lanci Comando come azione bonus senza spendere slot.',
  'Maestosità Invitta': 'La tua presenza regale rende difficile ai nemici colpirti.',
  'Addestramento Marziale': 'Ottieni competenza in armi da guerra, armature medie e scudi.',
  'Magia da Combattimento': 'Dopo aver lanciato un incantesimo puoi anche compiere un attacco d’arma.',
  'Preservare Vita': 'Con Incanalare Divinità distribuisci PF a più creature ferite vicine.',
  'Bagliore di Interdizione': 'Come reazione imponi svantaggio all’attacco di un nemico con un lampo di luce.',
  'Fulgore dell’Alba': 'Con Incanalare Divinità emani luce che ferisce i nemici e dissolve le tenebre.',
  'Bagliore di Interdizione Migliorato': 'Il tuo Bagliore di Interdizione può proteggere anche gli alleati vicini.',
  'Invocare Duplicato': 'Con Incanalare Divinità crei un’illusione di te da cui lanciare incantesimi.',
  'Duplicato Migliorato': 'Crei più illusioni di te stesso contemporaneamente.',
  'Colpo Guidato': 'Con Incanalare Divinità aggiungi un grosso bonus a un tiro per colpire.',
  'Sacerdote di Guerra': 'Come azione bonus compi un attacco d’arma aggiuntivo.',

  // ===== Nomi ufficiali 2024 — Ladro, Mago, Monaco, Paladino, Ranger, Stregone, Warlock =====
  'Ispirazione in Combattimento': 'Gli alleati possono usare la tua Ispirazione bardica per danni o CA in combattimento.',
  'Incantesimi del Dominio': 'Il tuo dominio ti concede incantesimi sempre preparati.',
  // Ladro
  'Gioco di Prestigio della Mano Magica': 'La tua Mano Magica è invisibile e può rubare, scassinare e fare furti.',
  'Arnesi dell’Assassino': 'Ottieni competenza col kit da avvelenatore e il kit da travestimento.',
  'Maestro Infiltrato': 'Crei identità false credibili e ti infiltri con facilità.',
  'Avvelenare Armi': 'Avveleni le tue armi per infliggere danni extra e indebolire i bersagli.',
  'Colpo di Morte': 'Contro un bersaglio sorpreso raddoppi i danni se lo colpisci.',
  'Squarciare la Mente': 'Il tuo Attacco Furtivo può ferire la mente del bersaglio e stordirlo.',
  'Lavoro al Secondo Piano': 'Scali più in fretta e salti più lontano.',
  'Usare Oggetto Magico': 'Puoi usare bacchette, pergamene e oggetti magici di altre classi.',
  'Riflessi da Furfante': 'Nel primo round di combattimento agisci due volte.',
  // Mago
  'Abiuratore Sapiente': 'Impari e copi incantesimi di abiurazione con più facilità ed economia.',
  'Interdizione Arcana': 'Una barriera magica assorbe danni al posto tuo; si ricarica lanciando abiurazioni.',
  'Interdizione Proiettata': 'Come reazione usi la tua barriera arcana per proteggere un alleato.',
  'Spezzamagia': 'Sei più efficace nel dissolvere e contrastare la magia nemica.',
  'Divinatore Sapiente': 'Impari e copi incantesimi di divinazione con più facilità ed economia.',
  'Portento': 'A ogni riposo lungo tiri due d20 da usare per sostituire tiri tuoi o altrui.',
  'Portento Superiore': 'Ottieni un dado di Portento in più a ogni riposo lungo.',
  'Invocatore Sapiente': 'Impari e copi incantesimi di invocazione con più facilità ed economia.',
  'Invocazione Potente': 'Aggiungi il tuo modificatore da incantatore ai danni degli incantesimi di invocazione.',
  'Saturazione Magica': 'Puoi infliggere il danno massimo con un incantesimo di invocazione.',
  'Illusionista Sapiente': 'Impari e copi incantesimi di illusione con più facilità ed economia.',
  'Creature Spettrali': 'Le tue illusioni possono dare forma a creature semi-reali.',
  'Sosia Illusorio': 'Come reazione crei un’illusione che fa mancare un attacco che ti colpirebbe.',
  // Monaco
  'Integrità del Corpo': 'Come azione spendi Concentrazione per curarti.',
  'Passo Lesto': 'La tua mobilità aumenta: ti muovi più liberamente in battaglia.',
  'Palmo Tremante': 'Colpisci con energia letale che può abbattere il bersaglio in un secondo momento.',
  'Mano del Dolore': 'Con la Concentrazione infliggi danni necrotici extra a una creatura colpita.',
  'Mano Guaritrice': 'Con la Concentrazione curi PF a una creatura toccata.',
  'Strumenti di Misericordia': 'Ottieni competenza in Intuizione, Medicina e nella borsa da erborista.',
  'Raffica di Guarigione e Dolore': 'La tua Raffica di Colpi cura gli alleati o danneggia i nemici senza costo.',
  'Esplosione Elementale': 'Spendi Concentrazione per un’esplosione elementale ad area.',
  'Quintessenza Elementale': 'Il culmine degli Elementi: resistenza e portata elementale potenziate.',
  'Passo d’Ombra': 'Nell’oscurità ti teletrasporti da un’ombra all’altra con vantaggio all’attacco.',
  'Passo d’Ombra Migliorato': 'Il tuo Passo d’Ombra ha portata maggiore e più usi.',
  'Manto di Ombre': 'Come azione diventi invisibile nell’oscurità.',
  // Paladino
  'Arma Consacrata': 'Con Incanalare Divinità la tua arma diventa sacra: bonus a colpire e danni radiosi.',
  'Punizione Protettiva': 'Quando usi Punizione Divina, gli alleati vicini ottengono copertura.',
  'Nube Sacra': 'Emani luce solare che ti protegge e brucia i nemici vicini.',
  'Furia della Natura': 'Con Incanalare Divinità evochi viticci spettrali che trattengono i nemici vicini.',
  'Aura Guardiana': 'Tu e gli alleati nell’aura avete resistenza ai danni degli incantesimi.',
  'Campione degli Antichi': 'Ti trasformi in un campione della natura: rigenerazione e magia potenziata.',
  'Vendetta Implacabile': 'Quando colpisci con un attacco di opportunità puoi muoverti restando saldo.',
  'Anima Vendicativa': 'Come reazione attacchi il bersaglio del tuo Voto quando colpisce un altro.',
  // Ranger
  'Condividi Incantesimi': 'Puoi far bersaglio anche del tuo compagno agli incantesimi lanciati su di te.',
  'Colpi Terribili': 'I tuoi attacchi d’arma possono infliggere danni psichici extra.',
  'Incantesimi del Viandante': 'La tua sottoclasse ti concede incantesimi sempre preparati.',
  'Scambio Seducente': 'Come reazione redirigi un attacco verso un’altra creatura vicina.',
  'Viandante Velato': 'Puoi teletrasportarti brevemente ogni turno tra la nebbia.',
  'Imboscata Terrificante': 'Nel primo turno di combattimento sei più rapido e infliggi danni extra.',
  'Vista dell’Ombra': 'Ottieni scurovisione (o migliore) e vedi nell’oscurità magica.',
  'Incantesimi del Cacciatore': 'La tua sottoclasse ti concede incantesimi sempre preparati.',
  'Raffica del Cacciatore': 'Quando manchi un attacco puoi ripeterlo, restando efficace.',
  'Schivata dell’Ombra': 'Come reazione, nell’ombra imponi svantaggio a un attacco contro di te.',
  'Sapienza del Cacciatore': 'Ottieni un beneficio contro la tua preda (colpo o difesa extra).',
  'Preda del Cacciatore Superiore': 'La tua Preda del Cacciatore si potenzia.',
  'Difesa del Cacciatore Superiore': 'Come reazione riduci i danni subiti, potenziando le tue difese.',
  // Stregone
  'Conversazione Telepatica': 'Comunichi telepaticamente con le creature vicine.',
  'Rivelazione della Carne': 'Come azione bonus ottieni tratti aberranti (volo, nuoto, portata…).',
  'Seguace Draconico': 'Al culmine evochi uno spirito draconico e potenzi le tue capacità.',
  'Impulso di Magia Selvaggia': 'La tua magia può scatenare effetti casuali (tabella del caos).',
  'Piegare la Fortuna': 'Spendi Punti Stregoneria per aggiungere o togliere a un tiro d20.',
  'Impulsi Domati': 'Al culmine puoi scegliere il risultato quando scateni la magia selvaggia.',
  'Incantesimi Meccanici': 'La tua origine ti concede incantesimi d’ordine sempre preparati.',
  'Ripristino dell’Equilibrio': 'Come reazione annulli vantaggio o svantaggio su un tiro vicino.',
  'Cavalleria Meccanica': 'Al culmine evochi un costrutto meccanico che ti serve e ti trasporta.',
  // Warlock
  'Incantesimi del Signore Fatato': 'Il tuo patrono ti concede incantesimi sempre preparati.',
  'Movimenti del Folletto': 'Come azione bonus ti teletrasporti e affascini o spaventi chi è vicino.',
  'Difese Seducenti': 'Non puoi essere affascinato e chi ti affascina subisce l’incantesimo di ritorno.',
  'Incantesimi Celestiali': 'Il tuo patrono ti concede incantesimi sempre preparati.',
  'Luce Curatrice': 'Hai una riserva di dadi di cura da distribuire come azione bonus.',
  'Vendetta Incandescente': 'Quando scenderesti a 0 PF esplodi di luce, curandoti e ferendo i nemici.',
  'Incantesimi Immondi': 'Il tuo patrono ti concede incantesimi sempre preparati.',
  'Incantesimi del Grande Antico': 'Il tuo patrono ti concede incantesimi sempre preparati.',
  'Incantesimi Psichici': 'La tua sottoclasse ti concede incantesimi sempre preparati.',
  'Guerriero Chiaroveggente': 'Un tuo alleato psichico dà vantaggio ai tiri contro un nemico.',
  'Creare Servitore': 'Puoi ammaliare permanentemente un umanoide o una bestia.',

  // ===== Nomi ufficiali 2024 — Druido e Guerriero =====
  'Ausilio dalla Terra': 'Spendi una Forma Selvatica per far apparire un’area di fiori curativi e spine dannose.',
  'Interdizione della Natura': 'Ottieni immunità/resistenza a certi danni e condizioni grazie alla natura.',
  'Rifugio della Natura': 'I nemici devono superare un TS per riuscire ad attaccarti.',
  'Passo Chiardiluna': 'Come azione bonus ti teletrasporti e potenzi il tuo prossimo incantesimo.',
  'Furia dei Mari': 'Come azione bonus colpisci un nemico con un’ondata gelida che lo respinge.',
  'Carta Celeste': 'Ricevi una mappa stellare magica che ti concede un incantesimo e benefici.',
  'Forma Siderale': 'Assumi una forma costellata (Arciere, Calice, Drago) con poteri diversi.',
  'Profezia Cosmica': 'A ogni riposo lungo un presagio ti dà bonus o malus da imporre ai tiri.',
  'Manto di Stelle': 'Diventi parzialmente incorporeo: resistenza a molti tipi di danno.',
  'Studioso di Guerra': 'Ottieni competenza in uno strumento da artigiano e nozioni belliche.',
  'Superiorità in Combattimento': 'Impari manovre tattiche alimentate da Dadi di Superiorità (che crescono di livello).',
  'Guerriero Eroico': 'All’inizio del tuo turno ottieni un vantaggio eroico da spendere in vari modi.',
  'Arma Vincolata': 'Leghi magicamente un’arma a te: non puoi essere disarmato e la richiami.',
  'Colpo Mistico': 'Quando colpisci con un’arma, il tuo prossimo incantesimo è più efficace.',
  'Scudo Mentale': 'Come reazione ottieni vantaggio ai TS mentali con energia psionica.',
  'Baluardo della Forza': 'Crei una barriera di forza che protegge te e gli alleati.',
  'Maestro della Telecinesi': 'Sollevi telecineticamente una creatura o un oggetto (come Mano Potente).',
};
// Indice minuscolo per ricerche senza distinzione di maiuscole.
const _lcMap = (obj) => { const m = {}; for (const k in obj) m[k.toLowerCase()] = obj[k]; return m; };
const SPIEG_PRIVILEGI_LC = _lcMap(SPIEG_PRIVILEGI);
/** Spiegazione di un privilegio dal nome mostrato (o null), senza distinzione maiuscole. */
function spiegaPrivilegio(nome) {
  const n = String(nome || '').trim();
  const base = n.replace(/\s*\(.*$/, '').replace(/\s+d\d+.*$/i, '').trim();
  return SPIEG_PRIVILEGI_LC[base.toLowerCase()] || SPIEG_PRIVILEGI_LC[n.toLowerCase()] || null;
}

// Riassunti funzionali (nostri) di cosa fa ogni incantesimo. Per la nuvoletta ⓘ
// sulle righe di incantesimi/trucchetti. Non sono i testi del manuale.
const SPIEG_INCANTESIMI = {
  'Aggiustare': 'Ripari un oggetto rotto o una crepa non più larga di ~30 cm (tocco, istantaneo). (Trucchetto)',
  'Aiuto': 'Liv. 1 · Fino a 3 creature entro 9 m: +5 PF massimi e attuali per 8 ore (+5 per slot oltre il 1°).',
  'Ammaliare Persone': 'Liv. 1 · Un umanoide entro 9 m ti considera amichevole per 1 ora (TS Saggezza; vantaggio se in lotta).',
  'Animare Morti': 'Liv. 3 · Rianimi ossa/cadaveri come 1 scheletro o zombie al tuo comando (2 in più per slot alto). Gittata 3 m.',
  'Arma Elementale': "Liv. 3 · Un'arma non magica ottiene +1 a colpire/danni e +1d4 elementali. Concentrazione, 1 ora (scala con lo slot).",
  'Arma Magica': "Liv. 2 · Un'arma diventa magica con +1 a colpire e danni (fino a +3 con slot alti). Concentrazione, 1 ora.",
  'Arma Spirituale': "Liv. 2 · Arma spettrale (gittata 18 m): attacco per 1d8 + mod. da incantatore (forza), azione bonus per riattaccare. 1 min.",
  'Armatura Magica': 'Liv. 1 · Una creatura senza armatura ha CA 13 + mod. Destrezza per 8 ore (tocco).',
  'Armatura di Agathys': 'Liv. 1 · 5 PF temporanei; chi ti colpisce in mischia subisce 5 danni da freddo (scala con lo slot). 1 ora.',
  'Arte Druidica': 'Piccoli effetti naturali: prevedere il meteo 24 h, far sbocciare un fiore, creare un simbolo di fumo. (Trucchetto)',
  'Aura di Vita': "Liv. 4 · Aura di 9 m: tu e gli alleati avete resistenza al necrotico e non scendete sotto 1 PF. Concentrazione, 10 min.",
  'Aura di Vitalità': "Liv. 3 · Aura di 9 m: come azione bonus curi 2d6 PF a una creatura nell'aura, ogni turno. Concentrazione, 1 min.",
  'Bacche Nutrienti': 'Liv. 1 · Crei 10 bacche: ognuna cura 1 PF e nutre per un giorno. Dura 24 ore.',
  'Barriera contro la Morte': 'Liv. 4 · Per 8 ore, la prima volta che la creatura scenderebbe a 0 PF resta a 1 (tocco).',
  'Bastone Incantato': 'Un bastone/clava usa la caratteristica da incantatore e infligge 1d8/1d10 in mischia. Concentrazione, 1 min. (Trucchetto)',
  'Benedizione': 'Liv. 1 · Fino a 3 alleati entro 9 m aggiungono 1d4 ad attacchi e TS. Concentrazione, 1 min (1 bersaglio in più per slot).',
  'Blocca Mostri': 'Liv. 5 · Paralizzi una creatura entro 27 m (TS Saggezza a ogni turno). Concentrazione, 1 min.',
  'Blocca Persone': 'Liv. 2 · Paralizzi un umanoide entro 18 m (TS Saggezza a ogni turno). Concentrazione, 1 min (più bersagli con slot alti).',
  'Braccia di Hadar': 'Liv. 1 · Tentacoli in area 3 m attorno a te: 2d6 necrotici e niente reazioni (TS Forza per metà, senza malus).',
  'Bussare': 'Liv. 2 · Apri magicamente una serratura, un chiavistello o una porta sbarrata entro 18 m (istantaneo).',
  'Caduta Morbida': 'Liv. 1 · Reazione: fino a 5 creature che cadono riducono i danni da caduta di 1d4×10 (nessun danno se basta).',
  'Camuffarsi': 'Liv. 1 · Alteri il tuo aspetto (viso, vestiti, altezza) per travestirti (illusione). Dura 1 ora.',
  'Cerchio di Potere': "Liv. 5 · Aura di 9 m: gli alleati hanno vantaggio ai TS e dimezzano i danni da certi effetti. Concentrazione, 10 min.",
  'Chiamare il Fulmine': 'Liv. 3 · Nube (gittata 36 m): ogni turno scagli un fulmine per 3d10 in area 1,5 m (TS Destrezza per metà). Concentrazione, 10 min.',
  'Colonna di Fuoco': 'Liv. 3 · Colonna 3×12 m (gittata 18 m): 4d6 fuoco + 4d6 radiosi (TS Destrezza per metà). Scala +1d6/+1d6 per slot.',
  'Colpo Accecante': 'Liv. 3 · Il prossimo colpo infligge +3d8 radiosi e può accecare il bersaglio (TS Costituzione). Concentrazione, 1 min.',
  'Colpo Ardente': 'Liv. 1 · Il prossimo colpo infligge +1d6 fuoco e incendia il bersaglio (1d6 a fine turno). Concentrazione, 1 min.',
  'Colpo Intrappolante': 'Liv. 1 · Il prossimo colpo infligge +1d6 perforanti e intrappola il bersaglio con rovi (TS Forza). Concentrazione, 1 min.',
  'Colpo Irato': 'Liv. 1 · Il prossimo colpo infligge +1d6 necrotici e spaventa il bersaglio (TS Saggezza). Concentrazione, 1 min.',
  'Colpo Marchiante': 'Liv. 1 · Il prossimo colpo infligge +1d6 radiosi e marchia il bersaglio, rendendolo visibile e colpibile. Concentrazione, 1 min.',
  'Colpo Sconvolgente': 'Liv. 1 · Il prossimo colpo infligge +1d6 psichici e dà svantaggio al bersaglio (TS Saggezza). Concentrazione, 1 min.',
  'Colpo Sicuro': 'Ottieni vantaggio al tuo prossimo tiro per colpire in mischia questo turno. (Trucchetto)',
  'Colpo Tonante': 'Liv. 1 · Il prossimo colpo infligge +2d6 tuono e può spingere via 3 m (TS Forza). Concentrazione, 1 min.',
  'Comando': "Liv. 1 · Un ordine di una parola (avvicinati, lascia, fuggi…) che il bersaglio esegue (TS Saggezza). Gittata 18 m.",
  'Comprendere Linguaggi': "Liv. 1 · Capisci ogni lingua parlata e leggi quelle scritte che tocchi. Rituale, 1 ora.",
  'Comunione con la Natura': "Liv. 5 · Ottieni informazioni sul territorio entro ~5 km (terreno, creature, acqua). Rituale.",
  'Confusione': "Liv. 4 · Area 3 m (gittata 27 m): le creature agiscono a caso (TS Saggezza a ogni turno). Concentrazione, 1 min.",
  'Cono di Freddo': 'Liv. 5 · Cono di 18 m: 8d8 danni da freddo (TS Costituzione per metà). +1d8 per slot oltre il 5°.',
  'Controincantesimo': "Liv. 3 · Reazione: interrompi un incantesimo altrui entro 18 m (automatico fino al 3° liv., altrimenti prova).",
  'Cordone di Frecce': "Liv. 2 · Fino a 4 munizioni: chi entra entro 9 m subisce 1d6 perforanti (TS Destrezza). Concentrazione, 8 ore.",
  'Corona della Follia': 'Liv. 2 · Costringi un umanoide (gittata 36 m) ad attaccare i suoi alleati (TS Saggezza a ogni turno). Concentrazione, 1 min.',
  'Crescita Vegetale': 'Liv. 3 · Fai crescere la vegetazione: terreno difficile in area 30 m (o raddoppia i raccolti in 8 ore).',
  'Crescita di Spine': 'Liv. 2 · Area 6 m (gittata 45 m): terreno difficile che infligge 2d4 perforanti ogni 1,5 m. Concentrazione, 10 min.',
  'Cura Ferite': 'Liv. 1 · Tocchi una creatura e le curi 2d8 + mod. da incantatore PF (+2d8 per slot oltre il 1°).',
  'Cura Ferite di Massa': "Liv. 5 · Fino a 6 creature in area 9 m: 3d8 + mod. da incantatore PF ciascuna (+1d8 per slot).",
  'Dardo Guida': 'Liv. 1 · Attacco magico a distanza (gittata 36 m): 4d6 radiosi e vantaggio al prossimo attacco di un alleato contro quel bersaglio.',
  'Dardo Incantato': "Liv. 1 · 3 dardi di forza (gittata 36 m): 1d4+1 ciascuno, colpiscono automaticamente. +1 dardo per slot oltre il 1°.",
  'Dardo Incantato Superiore': 'Liv. 7 · Versione potenziata: 11 dardi di forza da 1d4+1 che colpiscono in automatico (+1 dardo per slot).',
  'Dardo Infuocato': 'Attacco magico a distanza (gittata 36 m): 1d10 fuoco, incendia oggetti (aumenta a livelli 5/11/17). (Trucchetto)',
  'Derisione Crudele': 'Un insulto magico (gittata 18 m): 1d6 psichici e svantaggio al prossimo attacco (TS Saggezza). (Trucchetto)',
  'Dissolvi Magie': 'Liv. 3 · Termini gli effetti magici su una creatura, oggetto o area (fino al 3° liv. auto, oltre serve una prova). Gittata 36 m.',
  'Dominare Persone': "Liv. 5 · Controlli le azioni di un umanoide (gittata 18 m; TS Saggezza a ogni danno). Concentrazione, fino a 1 ora.",
  'Eroismo': 'Liv. 1 · Una creatura è immune alla paura e ottiene PF temporanei (= mod. da incantatore) a ogni turno. Concentrazione, 1 min.',
  'Esilio': 'Liv. 4 · Bandisci una creatura (gittata 18 m; TS Carisma) su un altro piano per 1 min. Concentrazione (permanente se è di un altro piano).',
  'Evocare Animali': 'Liv. 3 · Evochi spiriti bestiali che combattono per te (gittata 18 m). Concentrazione, 1 ora.',
  'Evocare Elementale': 'Liv. 4 · Evochi uno spirito elementale (aria/terra/fuoco/acqua) che combatte per te. Concentrazione, 1 ora.',
  'Falsa Vita': 'Liv. 1 · Ottieni 1d4+4 punti ferita temporanei per 1 ora (+5 per slot oltre il 1°).',
  'Fame di Hadar': 'Liv. 3 · Area 6 m (gittata 45 m): 2d6 freddo entrando/iniziando il turno, 2d6 acido nel centro (varie prove). Concentrazione, 1 min.',
  'Faretra Veloce': 'Liv. 2 · Come azione bonus scocchi 2 attacchi con arma a distanza ogni turno. Concentrazione, 1 min.',
  'Faro di Speranza': 'Liv. 3 · Gli alleati (gittata 9 m) hanno vantaggio ai TS su Saggezza e alla morte e curano il massimo. Concentrazione, 1 min.',
  'Favore Divino': "Liv. 1 · La tua arma infligge +1d4 danni radiosi a ogni colpo. Azione bonus, concentrazione, 1 min.",
  'Fiamma Sacra': 'Una fiamma radiosa colpisce un nemico entro 18 m: 1d8 radiosi (TS Destrezza; aumenta a 5/11/17). (Trucchetto)',
  'Frantumare': "Liv. 2 · Area 3 m (gittata 18 m): 3d8 danni da tuono (TS Costituzione per metà). +1d8 per slot oltre il 2°.",
  'Freccia Fulminante': 'Liv. 3 · Il prossimo tiro con arco: 4d8 fulmine al bersaglio, metà agli altri entro 3 m (TS Destrezza). Concentrazione, 1 min.',
  'Frusta di Spine': 'Frusta di rovi (gittata 9 m): attacco magico per 1d6 perforanti, trascina il bersaglio di 3 m (aumenta a 5/11/17). (Trucchetto)',
  'Fulmine': 'Liv. 3 · Linea di 30 m: 8d6 danni da fulmine (TS Destrezza per metà). +1d6 per slot oltre il 3°.',
  'Fulmine Stregato': 'Liv. 6 · Raggio (gittata 36 m): 12d6 fulmine (TS Destrezza per metà); ogni turno ripeti per 7d6. Concentrazione, 1 min.',
  'Fuoco Fatato': "Liv. 1 · Area 6 m (gittata 18 m): le creature emanano luce e si attaccano con vantaggio (TS Destrezza). Concentrazione, 1 min.",
  'Guardiani Spirituali': 'Liv. 3 · Aura di 4,5 m attorno a te: 3d8 radiosi/necrotici e velocità dimezzata (TS Saggezza per metà). Concentrazione, 10 min.',
  'Guardiano della Fede': 'Liv. 4 · Un guardiano spettrale (gittata 9 m): 20 danni radiosi a chi entra/inizia il turno vicino (TS Destrezza per metà). 8 ore.',
  'Guida': 'Aggiungi 1d4 a una prova di caratteristica a scelta. Concentrazione, 1 min. (Trucchetto)',
  'Identificare': 'Liv. 1 · Scopri le proprietà magiche e gli incantesimi attivi di un oggetto toccato. Rituale, 1 min.',
  'Illusione Minore': "Crei un suono o un'immagine (max 1,5 m) entro 9 m; un esame (prova Intelligenza) la rivela. Dura 1 min. (Trucchetto)",
  'Immagine Maggiore': 'Liv. 3 · Illusione realistica (max 6 m) con suoni, odori e temperatura, entro 36 m. Concentrazione, 10 min.',
  'Immagine Silenziosa': "Liv. 1 · Crei un'immagine puramente visiva (max 4,5 m) entro 18 m. Concentrazione, 10 min.",
  'Immagine Speculare': 'Liv. 2 · Crei 3 copie illusorie di te: gli attacchi possono colpire un duplicato invece di te. Dura 1 min.',
  'Individuazione dei Pensieri': 'Liv. 2 · Leggi i pensieri superficiali di creature entro 9 m e puoi sondare più a fondo (TS Saggezza). Concentrazione, 1 min.',
  'Individuazione del Magico': 'Liv. 1 · Percepisci aura e scuola della magia entro 9 m. Rituale, concentrazione, 10 min.',
  'Infliggere Ferite': 'Liv. 1 · Attacco magico in mischia: 3d10 danni necrotici (+1d10 per slot oltre il 1°).',
  'Infliggere Maledizione': 'Liv. 3 · Maledici una creatura (gittata 9 m; TS Saggezza) con un effetto a scelta: svantaggio, danni extra, ecc. Concentrazione, 1 min.',
  'Interdizione alle Lame': 'Un nemico entro 1,5 m ha −1d10 ai tiri per colpire con arma (TS Costituzione). (Trucchetto)',
  'Intralciare': "Liv. 1 · Area 6 m (gittata 27 m): erbacce trattengono le creature (TS Forza). Concentrazione, 1 min.",
  'Invisibilità': 'Liv. 2 · Una creatura toccata diventa invisibile finché non attacca o lancia un incantesimo. Concentrazione, 1 ora (più bersagli con slot).',
  'Invisibilità Superiore': 'Liv. 4 · La creatura resta invisibile anche attaccando o lanciando incantesimi. Concentrazione, 1 min.',
  'Legame di Protezione': "Liv. 2 · Un alleato entro 18 m subisce metà danni: l'altra metà la subisci tu. Concentrazione, 1 ora.",
  'Lentezza': 'Liv. 3 · Fino a 6 creature in area 12 m (gittata 36 m): velocità e CA dimezzate, 1 sola azione (TS Saggezza). Concentrazione, 1 min.',
  'Levitazione': 'Liv. 2 · Sollevi verticalmente (fino a 6 m) una creatura o un oggetto entro 18 m (TS Costituzione). Concentrazione, 10 min.',
  'Libertà di Movimento': 'Liv. 4 · Per 1 ora la creatura ignora terreno difficile e non può essere afferrata/trattenuta/rallentata (tocco).',
  'Linguaggi': "Liv. 3 · Una creatura capisce ogni lingua che sente per 1 ora (tocco).",
  'Localizzare Oggetto': 'Liv. 2 · Percepisci la direzione di un oggetto noto entro ~300 m. Concentrazione, 10 min.',
  'Luce': 'Un oggetto emana luce intensa (6 m) come una torcia; niente TS se lo tieni una creatura ostile (TS Destrezza). (Trucchetto)',
  'Luce del Giorno': "Liv. 3 · Sfera di luce intensa raggio 18 m (gittata 18 m); dissolve la magia dell'oscurità inferiore. 1 ora.",
  'Luci Danzanti': 'Crei fino a 4 luci fluttuanti (o una figura luminosa) entro 36 m, controllabili. Concentrazione, 1 min. (Trucchetto)',
  'Malanno': 'Liv. 1 · Un nemico entro 9 m: 1d10 danni necrotici (TS Costituzione); appassisce anche le piante non magiche. +1d10 per slot.',
  'Malocchio': 'Liv. 1 · Maledici un bersaglio (gittata 27 m): +1d6 necrotici ai tuoi attacchi contro di lui e svantaggio a una caratteristica. Concentrazione.',
  'Mani Brucianti': "Liv. 1 · Cono di 4,5 m: 3d6 danni da fuoco (TS Destrezza per metà). +1d6 per slot oltre il 1°.",
  'Mano Magica': 'Una mano spettrale (gittata 9 m) muove, apre o porta oggetti fino a ~5 kg. (Trucchetto)',
  'Manto del Crociato': "Liv. 3 · Aura di 9 m: gli alleati infliggono +1d4 radiosi a ogni colpo. Concentrazione, 1 min.",
  'Marchio del Cacciatore': 'Liv. 1 · Marchi un nemico (gittata 27 m): +1d6 ai tuoi danni contro di lui e vantaggio a cercarlo. Azione bonus, concentrazione, 1 ora.',
  'Messaggio': 'Sussurri un messaggio (gittata 36 m) udibile solo dal bersaglio, che può risponderti. (Trucchetto)',
  'Messaggio a Distanza': 'Liv. 3 · Invii un messaggio di 25 parole a una creatura nota ovunque si trovi, che può rispondere. Rituale.',
  'Metallo Rovente': 'Liv. 2 · Arroventi un oggetto di metallo (gittata 18 m): 2d8 fuoco a chi lo tiene e può fargli mollare la presa. Concentrazione, 1 min.',
  'Morsa del Gelo': 'Attacco magico a distanza (gittata 18 m): 1d8 freddo e niente reazioni fino al suo prossimo turno (aumenta a 5/11/17). (Trucchetto)',
  'Muro di Forza': 'Liv. 5 · Un muro invisibile e quasi indistruttibile (gittata 36 m) per 10 min. Concentrazione.',
  'Muro di Fuoco': 'Liv. 4 · Muro di fiamme (gittata 36 m): 5d8 fuoco a chi lo attraversa o gli sta vicino (TS Destrezza per metà). Concentrazione, 1 min.',
  'Muro di Pietra': 'Liv. 5 · Crei un muro di pietra solida (gittata 36 m) modellabile a piacere. Concentrazione, 10 min.',
  'Muro di Vento': 'Liv. 3 · Una raffica verticale (gittata 36 m) devia proiettili e gas: 3d8 tuono a chi lo attraversa (TS Forza). Concentrazione, 1 min.',
  'Nube Mefitica': "Liv. 3 · Nube velenosa raggio 6 m (gittata 27 m): 5d8 veleno a chi vi resta (TS Costituzione per metà). Concentrazione, 10 min.",
  'Nube di Nebbia': "Liv. 1 · Sfera di nebbia raggio 6 m (gittata 36 m) che oscura pesantemente la vista. Concentrazione, 1 ora.",
  'Offuscamento': 'Liv. 2 · Il tuo corpo appare sfocato: gli attacchi contro di te hanno svantaggio. Concentrazione, 1 min.',
  'Onda Distruttrice': "Liv. 5 · Area 6 m (gittata 27 m): 5d6 tuono + 5d6 radiosi/necrotici e atterra i nemici (TS Costituzione per metà, niente prono).",
  'Onda Tonante': "Liv. 1 · Cubo di 4,5 m da te: 2d8 tuono e spinge via 3 m (TS Costituzione per metà). +1d8 per slot oltre il 1°.",
  'Oscurità': "Liv. 2 · Sfera di oscurità magica raggio 4,5 m (gittata 18 m), impenetrabile anche alla scurovisione. Concentrazione, 10 min.",
  'Palla di Fuoco': 'Liv. 3 · Sfera esplosiva raggio 6 m (gittata 45 m): 8d6 danni da fuoco (TS Destrezza per metà). +1d6 per slot oltre il 3°.',
  'Parlare con gli Animali': 'Liv. 1 · Comprendi e comunichi con le bestie per 10 min. Rituale.',
  'Parola di Guarigione': 'Liv. 1 · Come azione bonus curi 2d4 + mod. da incantatore PF a una creatura entro 18 m (+2d4 per slot).',
  'Parola di Guarigione di Massa': 'Liv. 3 · Come azione bonus curi fino a 6 creature (gittata 18 m): 2d4 + mod. da incantatore PF ciascuna (+1d4 per slot).',
  'Passo Arboreo': "Liv. 5 · Entri in un albero e ne esci da un altro entro 150 m nello stesso turno. Concentrazione, 1 min.",
  'Passo Lontano': 'Liv. 7 · Ti teletrasporti fino a 1,5 km in un luogo che conosci (con una creatura consenziente).',
  'Passo Lungo': 'Liv. 1 · La velocità di una creatura toccata aumenta di 3 m per 1 ora (+1 bersaglio per slot). Concentrazione.',
  'Passo Senza Tracce': 'Liv. 2 · Tu e gli alleati vicini avete +10 a Furtività e non lasciate tracce. Concentrazione, 1 ora.',
  'Passo Velato': 'Liv. 2 · Come azione bonus ti teletrasporti fino a 9 m in un punto che vedi.',
  'Paura': 'Liv. 3 · Cono di 9 m: i nemici lasciano cadere ciò che tengono e fuggono spaventati (TS Saggezza a ogni turno). Concentrazione, 1 min.',
  'Pelle Coriacea': 'Liv. 2 · La CA base di una creatura senza armatura diventa 16. Concentrazione, 1 ora.',
  'Pelle di Pietra': 'Liv. 4 · La creatura toccata ha resistenza ai danni fisici non magici. Concentrazione, 1 ora.',
  'Piaga di Insetti': "Liv. 5 · Sfera di insetti raggio 6 m (gittata 90 m): 4d10 perforanti a chi vi resta (TS Costituzione per metà). Concentrazione, 10 min.",
  'Pioggia di Spine': 'Liv. 3 · Il prossimo tiro con arco crea una pioggia in area 1,5 m: 6d10 perforanti (TS Destrezza per metà).',
  'Polimorfia': 'Liv. 4 · Trasformi una creatura (gittata 18 m; TS Saggezza) in una bestia con PF propri. Concentrazione, 1 ora.',
  'Porta Dimensionale': 'Liv. 4 · Ti teletrasporti (e una creatura consenziente vicina) fino a 150 m in un punto che immagini.',
  'Potenziare Caratteristica': 'Liv. 2 · Per 1 ora dai un beneficio a una caratteristica (vantaggio alle prove, o forza/costituzione potenziata). Concentrazione (tocco).',
  'Preghiera di Guarigione': 'Liv. 2 · Con un rito di 10 min curi fino a 6 creature di 2d8 + mod. da incantatore PF (+1d8 per slot).',
  'Presagio': "Liv. 2 · Ricevi un presagio (bene/male/nulla) sul risultato di un'azione entro 30 min. Rituale.",
  'Prestidigitazione': 'Piccoli trucchi innocui (gittata 3 m): accendere/spegnere fuochi, pulire, creare suoni o odori. (Trucchetto)',
  'Produrre Fiamma': 'Una fiamma sulla mano illumina (3 m) e può essere lanciata (gittata 9 m) per 1d8 fuoco (aumenta a 5/11/17). (Trucchetto)',
  'Protezione dal Male e dal Bene': 'Liv. 1 · Certi tipi di mostri (immondi, non morti, ecc.) attaccano con svantaggio la creatura protetta e non possono affascinarla. Concentrazione, 10 min.',
  'Protezione dal Veleno': 'Liv. 2 · Neutralizzi un veleno; per 1 ora la creatura ha resistenza al veleno e vantaggio ai TS contro il veleno (tocco).',
  'Raffica Occulta': 'Attacco magico a distanza (gittata 36 m): 1d10 forza per raggio; 2 raggi a liv. 5, 3 a liv. 11, 4 a liv. 17. (Trucchetto)',
  'Raggio Rovente': 'Liv. 2 · 3 raggi di fuoco (gittata 36 m), attacco magico ciascuno: 2d6 fuoco a raggio. +1 raggio per slot oltre il 2°.',
  'Raggio dell’Indebolimento': 'Liv. 2 · Un raggio (gittata 18 m; TS Costituzione) dimezza i danni delle armi basate sulla Forza del bersaglio. Concentrazione, 1 min.',
  'Raggio di Gelo': 'Attacco magico a distanza (gittata 18 m): 1d8 freddo e −3 m alla velocità (aumenta a 5/11/17). (Trucchetto)',
  'Raggio di Luna': "Liv. 2 · Colonna di luce raggio 1,5 m (gittata 36 m): 2d10 radiosi a chi vi entra/resta (TS Costituzione per metà). Concentrazione, 10 min.",
  'Ragnatela': "Liv. 2 · Cubo di 6 m (gittata 18 m): ragnatele di terreno difficile che trattengono (TS Destrezza). Concentrazione, 1 ora.",
  'Rappresaglia Infernale': 'Liv. 1 · Reazione, quando subisci danni: colpisci col fuoco chi ti ha ferito per 2d10 (TS Destrezza per metà). +1d10 per slot.',
  'Resistenza': 'Aggiungi 1d4 a un tiro salvezza a scelta. Concentrazione, 1 min. (Trucchetto)',
  'Respirare sott’acqua': "Liv. 3 · Fino a 10 creature respirano sott'acqua per 24 ore. Rituale.",
  'Rianimare Morti': 'Liv. 5 · Riporti in vita una creatura morta da non più di 10 giorni (rito di 1 ora, componente da 500 mo).',
  'Ridestare': 'Liv. 5 · Doni a una bestia o pianta intelletto, linguaggio e cordialità verso di te (rito di 8 ore). Dura 30 giorni.',
  'Rimuovi Maledizione': 'Liv. 3 · Elimini tutte le maledizioni su una creatura o su un oggetto toccato (istantaneo).',
  'Rintocco Funebre': 'Un rintocco su un bersaglio entro 18 m: 1d8 necrotici, 1d12 se è già ferito (TS Saggezza; aumenta a 5/11/17). (Trucchetto)',
  'Ristorare Inferiore': 'Liv. 2 · Curi una malattia o una condizione (accecato, assordato, paralizzato, avvelenato, ecc.) su una creatura toccata.',
  'Ristorare Superiore': 'Liv. 5 · Rimuovi una condizione grave, una maledizione, o una riduzione a caratteristica/PF massimi (tocco).',
  'Ritirata Veloce': 'Liv. 1 · Come azione bonus Scatti; ogni turno successivo puoi Scattare come azione bonus. Concentrazione, 10 min.',
  'Rivitalizzare': 'Liv. 3 · Riporti in vita una creatura morta da meno di 1 minuto con 1 PF (tocco).',
  'Rovina': 'Liv. 1 · Fino a 3 creature (gittata 9 m; TS Carisma) sottraggono 1d4 ad attacchi e TS. Concentrazione, 1 min.',
  'Santuario': 'Liv. 1 · Chi vuole attaccare la creatura protetta deve superare un TS su Saggezza o cambiare bersaglio. Azione bonus, 1 min.',
  'Schema Ipnotico': 'Liv. 3 · Area 9 m (gittata 36 m): le creature restano affascinate e incapacitate (TS Saggezza). Concentrazione, 1 min.',
  'Scrutare': 'Liv. 5 · Osservi a distanza una creatura o un luogo tramite un sensore magico invisibile (TS Saggezza). Concentrazione, 10 min.',
  'Scudo': 'Liv. 1 · Reazione: +5 alla CA fino al tuo prossimo turno e annulli Dardo Incantato.',
  'Scudo della Fede': 'Liv. 1 · Una creatura entro 18 m ottiene +2 alla CA. Azione bonus, concentrazione, 10 min.',
  'Scudo di Fuoco': 'Liv. 4 · Ti avvolgi di fiamme: resistenza al freddo o al fuoco e 2d8 danni a chi ti colpisce in mischia. Dura 10 min.',
  'Scurovisione': 'Liv. 2 · Doni a una creatura toccata scurovisione (18 m) per 8 ore.',
  'Servitore Invisibile': 'Liv. 1 · Evochi una forza invisibile che svolge compiti semplici (pulire, portare) entro 18 m. Rituale, 1 ora.',
  'Sfera Cromatica': 'Liv. 1 · Lanci una sfera (gittata 27 m) di un elemento a scelta: 3d8 del tipo scelto (TS Destrezza). +1d8 per slot oltre il 1°.',
  'Sfera Infuocata': 'Liv. 2 · Sfera di fuoco (gittata 18 m) che muovi 9 m/turno: 2d6 fuoco a contatto (TS Destrezza per metà). Concentrazione, 1 min.',
  'Silenzio': "Liv. 2 · Sfera di 6 m (gittata 36 m): silenzio totale, niente incantesimi verbali né suoni. Rituale, concentrazione, 10 min.",
  'Sonno': 'Liv. 1 · Area 6 m (gittata 27 m): addormenti creature per un totale di 5d8 PF (dai più deboli). Concentrazione, 1 min.',
  'Spruzzo di Veleno': 'Un soffio tossico su un bersaglio entro 3 m: 1d12 veleno (TS Costituzione; aumenta a 5/11/17). (Trucchetto)',
  'Stabilizzare': 'Stabilizzi una creatura morente a 0 PF entro 9 m (istantaneo). (Trucchetto)',
  'Suggestione': "Liv. 2 · Suggerisci un corso d'azione ragionevole (gittata 9 m; TS Saggezza) che il bersaglio segue. Concentrazione, fino a 8 ore.",
  'Sussurri Dissonanti': 'Liv. 1 · Sussurri dolorosi (gittata 18 m): 3d6 psichici e il bersaglio fugge da te (TS Saggezza per metà, niente fuga). +1d6 per slot.',
  'Sviare': 'Liv. 2 · Crei un tuo doppio illusorio; per 1 min puoi scambiarti di posto con lui come azione bonus e diventi invisibile fino al prossimo turno.',
  'Taumaturgia': 'Piccoli prodigi divini (gittata 9 m): voce amplificata, tremori, apri/chiudi porte, fiamme che tremolano. (Trucchetto)',
  'Telecinesi': 'Liv. 5 · Sposti una creatura (TS Forza) o un oggetto fino a ~450 kg (gittata 18 m) con la mente. Concentrazione, 10 min.',
  'Tempesta di Ghiaccio': "Liv. 4 · Cilindro raggio 6 m (gittata 90 m): 2d8 contundenti + 4d6 freddo, poi terreno difficile (TS Destrezza per metà).",
  'Tempesta di Nevischio': "Liv. 3 · Cilindro raggio 12 m (gittata 45 m): oscura la vista, spegne i fuochi, terreno scivoloso e rompe la concentrazione. Concentrazione, 1 min.",
  'Terreno Allucinatorio': "Liv. 4 · Fai apparire un'area (cubo di 45 m, gittata 90 m) come un tipo di terreno naturale diverso. Dura 24 ore.",
  'Tocco Folgorante': 'Attacco magico in mischia (gittata tocco): 1d8 fulmine e niente reazioni fino al suo prossimo turno (aumenta a 5/11/17). (Trucchetto)',
  'Tocco Vampirico': 'Liv. 3 · Attacco magico in mischia: 3d6 necrotici e curi metà dei danni inflitti; ripetibile ogni turno. Concentrazione, 1 min.',
  'Trovare Destriero': 'Liv. 2 · Evochi una cavalcatura celestiale/fatata/immonda fedele, legata a te (rito di 10 min).',
  'Vampa': 'Fiamme su un nemico entro 9 m: 1d8 fuoco e, se scelto, un secondo bersaglio vicino subisce metà (aumenta a 5/11/17). (Trucchetto)',
  'Vedere Invisibilità': 'Liv. 2 · Per 1 ora vedi le creature e gli oggetti invisibili e nel Piano Etereo (tocco su di te).',
  'Velocità': "Liv. 3 · Raddoppi la velocità di un alleato (gittata 9 m), +2 CA, vantaggio ai TS su Destrezza e un'azione extra. Concentrazione, 1 min.",
  'Vite Afferrante': 'Liv. 4 · Una vite (gittata 9 m) afferra una creatura (TS Forza) e la trascina fino a 9 m verso di essa. Concentrazione, 1 min.',
  'Volare': 'Liv. 3 · Una creatura toccata ottiene velocità di volo 18 m per 10 min (+1 bersaglio per slot). Concentrazione.',
  'Zampata Acida': "Una bolla d'acido su 1-2 bersagli vicini (gittata 18 m): 1d6 acido (aumenta a 5/11/17). (Trucchetto)",
  'Zona di Verità': "Liv. 2 · Area 4,5 m (gittata 18 m): chi vi entra non può mentire deliberatamente (TS Carisma). Dura 10 min.",
};
const SPIEG_INCANTESIMI_LC = _lcMap(SPIEG_INCANTESIMI);
// Elenco ordinato dei nomi di incantesimo noti (per l'autocompletamento).
const INCANTESIMI_NOMI = Object.keys(SPIEG_INCANTESIMI).sort((a, b) => a.localeCompare(b, 'it'));
/** Spiegazione di un incantesimo dal nome (o null), senza distinzione maiuscole. */
function spiegaIncantesimo(nome) {
  const n = String(nome || '').trim();
  return SPIEG_INCANTESIMI_LC[n.toLowerCase()] || SPIEG_INCANTESIMI_LC[n.replace(/\s*\(.*$/, '').trim().toLowerCase()] || null;
}

// Tratti di razza/specie e sensi comuni (tutte le razze), riassunti nostri.
const SPIEG_TRATTI = {
  'Scurovisione': 'Vedi al buio entro una certa distanza (in bianco e nero); nell\'oscurità totale vedi come in penombra.',
  'Percezione cieca': 'Percepisci ciò che ti circonda senza vedere, entro una breve distanza.',
  'Percezione tremorsensitiva': 'Percepisci creature e cose a contatto col terreno tramite le vibrazioni.',
  'Vista vera': 'Vedi nel buio normale e magico, gli invisibili e le vere forme (illusioni, mutaforma).',
  // Elfo
  'Trance': 'Non dormi: 4 ore di meditazione vigile equivalgono a un riposo lungo di 8.',
  'Retaggio Fatato': "Vantaggio ai TS contro l'essere affascinato; la magia non può farti addormentare.",
  'Retaggio fatato': "Vantaggio ai TS contro l'essere affascinato; la magia non può farti addormentare.",
  'Sensi Acuti': 'Competenza in unʼabilità a scelta tra Intuizione, Percezione o Sopravvivenza.',
  'Sensi acuti': 'Competenza in unʼabilità a scelta tra Intuizione, Percezione o Sopravvivenza.',
  // Gnomo
  'Astuzia gnomesca': 'Vantaggio ai TS su Intelligenza, Saggezza e Carisma contro la magia.',
  // Nano
  'Robustezza nanica': 'PF massimi aumentati (+1 per livello) grazie alla tempra nanica.',
  'Scalpellino': 'Competenza con gli arnesi da muratore; riconosci lʼorigine delle opere in pietra.',
  'Resistenza al veleno': 'Vantaggio ai TS contro il veleno e resistenza ai danni da veleno.',
  // Halfling
  'Coraggioso': "Vantaggio ai TS contro l'essere spaventato.",
  'Agilità halfling': 'Puoi muoverti attraverso lo spazio di creature più grandi di te.',
  'Fortuna': 'Quando ottieni 1 sul d20 per un attacco, una prova o un TS, puoi ritirare il dado.',
  'Furtività naturale': 'Puoi tentare di nasconderti anche se sei coperto solo da una creatura più grande.',
  // Aasimar
  'Resistenza celestiale': 'Resistenza ai danni necrotici e radiosi.',
  'Mani guaritrici': 'Puoi curare PF pari al tuo livello, una volta per riposo lungo.',
  'Portatore di luce': 'Conosci il trucchetto Luce.',
  // Dragonide
  'Arma a soffio': 'Sostituisci un attacco con un soffio elementale che colpisce unʼarea.',
  'Resistenza al danno': 'Hai resistenza a un tipo di danno legato alla tua stirpe.',
  'Antenati draconici': 'Il tuo tipo di drago determina il danno del soffio e la resistenza.',
  // Goliath
  'Retaggio dei giganti': 'Ottieni un beneficio legato a un tipo di gigante.',
  'Corporatura potente': 'Conti come una taglia più grande per capacità di carico e prese.',
  // Orco
  'Scatto adrenalinico': 'Come azione bonus puoi Scattare e ottenere PF temporanei.',
  'Resistenza implacabile': 'Quando scenderesti a 0 PF resti a 1 (una volta per riposo lungo).',
  // Tiefling
  'Presenza ultraterrena': 'Conosci il trucchetto Taumaturgia.',
  // Umano (2024)
  'Pieno di risorse': "Ottieni Ispirazione dopo ogni riposo lungo. (2024)",
  'Abile': 'Competenza in unʼabilità a scelta.',
  'Versatile': 'Ottieni un talento di origine a tua scelta. (2024)',
};
const SPIEG_TRATTI_LC = _lcMap(SPIEG_TRATTI);
/** Spiegazione di un tratto di razza/senso (o null), senza maiuscole, con prefisso. */
function spiegaTratto(nome) {
  const n = String(nome || '').trim().toLowerCase();
  if (SPIEG_TRATTI_LC[n]) return SPIEG_TRATTI_LC[n];
  const base = n.replace(/\s*\(.*$/, '').trim();
  if (SPIEG_TRATTI_LC[base]) return SPIEG_TRATTI_LC[base];
  for (const k of Object.keys(SPIEG_TRATTI_LC)) if (base.startsWith(k)) return SPIEG_TRATTI_LC[k];
  return null;
}

// Talenti comuni (5e), riassunti nostri. Per la nuvoletta sui Talenti.
const SPIEG_TALENTI = {
  'Incantatore da Guerra': 'Talento generale (dal 4° liv.): +1 a INT/SAG/CAR, vantaggio ai TS di Concentrazione e puoi lanciare incantesimi con le mani occupate.',
  'Guaritore': 'Con una borsa del guaritore puoi far recuperare PF a un alleato durante il combattimento.',
  'Robusto': '+2 punti ferita massimi per ogni livello.',
  'Fortunato': 'Hai punti fortuna per ritirare un attacco, una prova o un TS (tuoi o dei nemici).',
  'Vigile': "+ all'iniziativa e non puoi essere colto di sorpresa.",
  'Attaccante Selvaggio': 'Una volta per turno puoi ritirare i dadi di danno di un attacco in mischia.',
  'Tiratore Scelto': 'Ignori copertura e penalità a lunga gittata, niente svantaggio a distanza; opzione di danno extra.',
  'Grande Maestro d’Armi': 'Danni potenziati con armi pesanti e attacco bonus dopo un critico o unʼuccisione.',
  'Maestro delle Armi': 'Sei competente e più efficace con più tipi di arma.',
  'Sentinella': 'Fermi chi colpisci con attacchi di opportunità e proteggi gli alleati vicini.',
  'Osservatore': 'Bonus a Percezione e Indagare; leggi il labiale.',
  'Mobile': 'Velocità aumentata e nessun attacco di opportunità da chi attacchi in mischia.',
  'Iniziato alla Magia': 'Impari due trucchetti e un incantesimo di 1° livello da una classe.',
  'Attore': 'Bonus a Inganno e Intrattenere; imiti voci e suoni.',
  'Resiliente': 'Ottieni competenza in un tiro salvezza e +1 alla caratteristica collegata.',
  'Esperto di Abilità': 'Competenza (o maestria) in abilità/strumenti a scelta.',
  'Combattente con Due Armi': 'Bonus alla CA combattendo con due armi e puoi impugnarne di non leggere.',
  'Cuoco': 'Prepari cibo che cura e concede punti ferita temporanei.',
  'Padrone delle Armature Pesanti': 'Competenza nelle armature pesanti e +1 Costituzione.',
  'Maestro di Scudo': 'Usi lo scudo per spingere e proteggerti meglio dagli effetti ad area.',
};
const SPIEG_TALENTI_LC = _lcMap(SPIEG_TALENTI);
// Elenco ordinato dei talenti noti (per il menu a tendina al Level Up).
const TALENTI_NOMI = Object.keys(SPIEG_TALENTI).sort((a, b) => a.localeCompare(b, 'it'));
/** Spiegazione di un talento dal nome (o null), senza maiuscole, ignora parentesi. */
function spiegaTalento(nome) {
  const n = String(nome || '').trim().toLowerCase();
  return SPIEG_TALENTI_LC[n] || SPIEG_TALENTI_LC[n.replace(/\s*\(.*$/, '').trim()] || null;
}

// Opzioni di Metamagia dello Stregone (5e), con riassunti nostri per la nuvoletta.
const SPIEG_METAMAGIA = {
  'Incantesimo Accurato': 'Spendi 1 punto stregoneria per escludere fino a 5 creature dall’area di un incantesimo.',
  'Incantesimo Ammaliante': 'Spendi 1 punto stregoneria per rendere più difficile individuare che stai lanciando.',
  'Incantesimo Celato': 'Spendi 1 punto stregoneria per lanciare senza componenti verbali e somatiche.',
  'Incantesimo Empio': 'Cambi il tipo di danno di un incantesimo con un altro tra alcuni tipi (2024).',
  'Incantesimo Esteso': 'Spendi 1 punto stregoneria per raddoppiare la durata (max 24 ore).',
  'Incantesimo Gemello': 'Spendi punti pari al livello per far bersagliare a un incantesimo a bersaglio singolo una seconda creatura.',
  'Incantesimo Persistente': 'Spendi 3 punti stregoneria per dare svantaggio ai TS del bersaglio contro il tuo incantesimo.',
  'Incantesimo Potenziato': 'Spendi 1 punto stregoneria per ritirare fino a Carisma dadi di danno.',
  'Incantesimo Preciso': 'Spendi punti stregoneria (in base al livello) per lanciare l’incantesimo come azione bonus.',
  'Incantesimo Prolungato': 'Spendi 1 punto stregoneria per raddoppiare la gittata (o portare a 9 m un tocco).',
  'Incantesimo Rapido': 'Spendi 2 punti stregoneria per lanciare un incantesimo da 1 azione come azione bonus.',
  'Incantesimo Sottile': 'Spendi 1 punto stregoneria per lanciare senza componenti verbali e somatiche.',
  'Incantesimo Trasmutato': 'Cambi il tipo di danno di un incantesimo con un altro tra alcuni tipi (2024).',
};
const METAMAGIA_5E = Object.keys(SPIEG_METAMAGIA).sort((a, b) => a.localeCompare(b, 'it'));
const SPIEG_METAMAGIA_LC = _lcMap(SPIEG_METAMAGIA);
/** Spiegazione di un'opzione di Metamagia dal nome (o null), senza maiuscole. */
function spiegaMetamagia(nome) {
  const n = String(nome || '').trim().toLowerCase();
  return SPIEG_METAMAGIA_LC[n] || SPIEG_METAMAGIA_LC[n.replace(/\s*\(.*$/, '').trim()] || null;
}
/** Righe (di un testo libero) che hanno una spiegazione, come lista cliccabile ⓘ. */
function renderSpiegazioni(testo, lookup, setInfo) {
  const trovate = String(testo || '')
    .split('\n').map((r) => r.trim()).filter(Boolean)
    .map((r) => ({ r, sp: lookup(r) })).filter((x) => x.sp);
  if (trovate.length === 0) return null;
  return (
    <div style={{ marginTop: 8, fontSize: 12, borderTop: `1px solid ${C.border}`, paddingTop: 6 }}>
      <div style={{ ...styles.detail, marginBottom: 3 }}>ⓘ Tocca per la spiegazione:</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {trovate.map(({ r, sp }, i) => (
          <span
            key={i}
            style={{ cursor: 'help', background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 6, padding: '2px 7px' }}
            onClick={() => setInfo({ titolo: r, testo: sp })}
          >{r} ⓘ</span>
        ))}
      </div>
    </div>
  );
}

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
    versione: '2024', // regole del personaggio: '2024' (5.5) o '2014' (5.0)
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
    maxTrucchetti: 0, // 0 = automatico (dalla classe); >0 = massimo forzato a mano
    maxIncantesimi: 0,
    privilegi: '',
    privilegiSottoclasse: '',
    trattiSpecie: '',
    talenti: '',
    metamagie: '', // opzioni di Metamagia attive (solo Stregone)
    equipaggiamento: '',
    sintonia: '',
    lingue: '',
    aspetto: '',
    trattiCaratteriali: '',
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
  { key: 'manuale', label: 'CA Manuale' },
  { key: 'nessuna', label: 'Senza armatura' },
  { key: 'leggera', label: 'Leggera (+DES)' },
  { key: 'media', label: 'Media (+DES max 2)' },
  { key: 'pesante', label: 'Pesante (fissa)' },
];
// Valore "base" tipico per categoria (5e): scegliendo la categoria si parte da
// un'armatura sensata, così la CA cambia subito; l'utente può poi correggere.
const BASE_ARMATURA_DEFAULT = { leggera: 12, media: 14, pesante: 18 };
// Esempi di armature per categoria (per il suggerimento sotto la CA).
const ESEMPI_ARMATURA = {
  leggera: 'Imbottita 11 · Cuoio 11 · Cuoio borchiato 12',
  media: 'Camaglia 13 · Corazza 14 · Mezza piastra 15',
  pesante: 'Anelli 14 · Maglia 16 · Chiodata 17 · Piastre 18',
};

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

// Armi standard 5e (dado di danno, tipo e proprietà). Scegliendone una si
// compilano danno/tipo/note e, dai modificatori del PG, bonus a colpire.
// finesse = Accurata (usa FOR o DES, la migliore); ranged = a distanza (DES).
const ARMI_5E = [
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

/**
 * Costruisce un attacco dai dati di un'arma standard e dai modificatori del PG.
 * Assume la competenza con l'arma (bonus = mod + bonus competenza); il danno
 * usa il modificatore di caratteristica appropriato (FOR, o DES se a distanza
 * o Accurata e più alta). Restituisce un patch { nome, danno, tipoDanno, note, bonus }.
 */
function attaccoDaArma(arma, scheda) {
  const forza = modificatore(scheda.caratteristiche.forza);
  const destr = modificatore(scheda.caratteristiche.destrezza);
  let mod;
  if (arma.ranged) mod = destr;
  else if (arma.finesse) mod = Math.max(forza, destr);
  else mod = forza;
  const comp = scheda.bonusCompetenza || 0;
  const danno = mod === 0 ? arma.danno : `${arma.danno}${mod > 0 ? '+' : ''}${mod}`;
  return { nome: arma.nome, danno, tipoDanno: arma.tipo, note: arma.note, bonus: mod + comp };
}

// Dotazione iniziale indicativa per classe (armi che diventano attacchi +
// equipaggiamento + monete d'oro). Le armi devono combaciare con ARMI_5E.
// Tipi di armatura iniziale (per impostare in automatico il riquadro CA).
const ARM_CUOIO = { tipo: 'leggera', base: 11, nome: 'Armatura di cuoio' };
const ARM_SCAGLIE = { tipo: 'media', base: 14, nome: 'Armatura a scaglie' };
const ARM_MAGLIA = { tipo: 'pesante', base: 16, nome: 'Cotta di maglia' };
const ARM_NESSUNA = { tipo: 'nessuna', base: 0, nome: '' };
const KIT_CLASSE = {
  barbaro:  { armi: ['Ascia bipenne'], equip: ['Ascia (Handaxe) ×4', 'Dotazione da esploratore'], denari: 15, armatura: ARM_NESSUNA, scudo: false, strumenti: '' },
  bardo:    { armi: ['Stocco'], equip: ['Armatura di cuoio', 'Pugnale', 'Strumento musicale', 'Dotazione da intrattenitore'], denari: 19, armatura: ARM_CUOIO, scudo: false, strumenti: 'Strumenti musicali (3 a scelta)' },
  chierico: { armi: ['Mazza'], equip: ['Armatura a scaglie', 'Scudo', 'Balestra leggera + 20 dardi', 'Simbolo sacro', 'Dotazione da sacerdote'], denari: 7, armatura: ARM_SCAGLIE, scudo: true, strumenti: '' },
  druido:   { armi: ['Scimitarra'], equip: ['Armatura di cuoio', 'Scudo (legno)', 'Focus druidico', 'Borsa da erborista', 'Dotazione da esploratore'], denari: 9, armatura: ARM_CUOIO, scudo: true, strumenti: 'Borsa da erborista' },
  guerriero:{ armi: ['Spada lunga', 'Arco lungo'], equip: ['Cotta di maglia', 'Scudo', '20 frecce', 'Dotazione da avventuriero'], denari: 4, armatura: ARM_MAGLIA, scudo: true, strumenti: '' },
  ladro:    { armi: ['Stocco', 'Arco corto'], equip: ['Armatura di cuoio', 'Pugnale ×2', 'Arnesi da scasso', 'Dotazione da scassinatore', '20 frecce'], denari: 8, armatura: ARM_CUOIO, scudo: false, strumenti: 'Arnesi da scasso' },
  mago:     { armi: ['Pugnale'], equip: ['Focus arcano', 'Libro degli incantesimi', 'Dotazione da studioso'], denari: 5, armatura: ARM_NESSUNA, scudo: false, strumenti: '' },
  monaco:   { armi: ['Spada corta'], equip: ['Dardo ×10', 'Dotazione da esploratore', 'Attrezzi da artigiano o strumento musicale'], denari: 11, armatura: ARM_NESSUNA, scudo: false, strumenti: 'Un tipo di attrezzi da artigiano o uno strumento musicale' },
  paladino: { armi: ['Spada lunga'], equip: ['Cotta di maglia', 'Scudo', 'Giavellotto ×6', 'Simbolo sacro', 'Dotazione da sacerdote'], denari: 9, armatura: ARM_MAGLIA, scudo: true, strumenti: '' },
  ranger:   { armi: ['Spada corta', 'Arco lungo'], equip: ['Armatura di cuoio', '20 frecce', 'Dotazione da esploratore'], denari: 7, armatura: ARM_CUOIO, scudo: false, strumenti: '' },
  stregone: { armi: ['Pugnale'], equip: ['Focus arcano', 'Pugnale', 'Dotazione da avventuriero'], denari: 28, armatura: ARM_NESSUNA, scudo: false, strumenti: '' },
  warlock:  { armi: ['Pugnale'], equip: ['Armatura di cuoio', 'Focus arcano', 'Pugnale', 'Libro degli occulti', 'Dotazione da studioso'], denari: 15, armatura: ARM_CUOIO, scudo: false, strumenti: '' },
};
// Oro iniziale alternativo per classe (5.5): al posto del pacchetto di dotazione.
const ORO_INIZIALE = {
  barbaro: 75, bardo: 90, chierico: 110, druido: 50, guerriero: 155, ladro: 100,
  mago: 55, monaco: 50, paladino: 150, ranger: 150, stregone: 50, warlock: 100,
};
// Lingua tematica concessa dalla specie (oltre al Comune). Nella 5.5 le lingue
// derivano dall'origine, ma diamo un default sensato modificabile a mano.
const LINGUA_SPECIE = {
  elfo: 'Elfico', 'elfo alto': 'Elfico', 'elfo dei boschi': 'Elfico', 'elfo oscuro': 'Elfico', drow: 'Elfico', mezzelf: 'Elfico',
  nano: 'Nanico', gnomo: 'Gnomesco', halfling: 'Halfling', mezzorco: 'Orchesco', orco: 'Orchesco',
  dragonide: 'Draconico', tiefling: 'Infernale', goliath: 'Gigante', aasimar: 'Celestiale',
};
/** Lingue iniziali: Comune + una lingua a tema specie (se riconosciuta). */
function lingueIniziali(specie) {
  const s = (specie || '').toLowerCase();
  const extra = Object.keys(LINGUA_SPECIE).find((k) => s.includes(k));
  return extra ? `Comune, ${LINGUA_SPECIE[extra]}` : 'Comune';
}

// Suggerimenti per l'autocompletamento dell'equipaggiamento comune (5e).
const EQUIP_5E = [
  'Abiti da viaggiatore', 'Abiti comuni', 'Abiti eleganti', 'Acciarino ed esca', 'Ampolla',
  'Arnesi da scasso', 'Balestra a mano', 'Borraccia', 'Borsa da componenti', 'Borsa da erborista',
  'Candela', 'Catena (3 m)', 'Cesto', 'Chiodi da rampino (10)', 'Coperta', 'Corda di canapa (15 m)',
  'Corda di seta (15 m)', 'Corno', 'Dotazione da avventuriero', 'Dotazione da esploratore',
  'Dotazione da scassinatore', 'Focus arcano', 'Fiaccola', 'Grimaldelli', 'Kit del guaritore',
  'Lanterna cieca', 'Lanterna schermabile', 'Libro', 'Lucchetto', 'Martello', 'Olio (fiasco)',
  'Otre', 'Pala', 'Pergamena (foglio)', 'Piccone', 'Pietra focaia', 'Piede di porco',
  'Rampino', 'Razioni (1 giorno)', 'Sacca a pelo', 'Sacco', 'Simbolo sacro', 'Specchietto d’acciaio',
  'Torcia', 'Zaino', 'Corda', 'Tenda', 'Acqua santa (ampolla)', 'Veleno base (fiala)',
  'Kit da erborista', 'Pozione di guarigione',
];

// Strumenti e dotazioni con competenza (5e).
const STRUMENTI_5E = [
  'Arnesi da scasso', 'Borsa da erborista', 'Strumenti da avvelenatore', 'Kit da travestimento',
  'Kit da falsario', 'Strumenti da calligrafo', 'Attrezzi da fabbro', 'Attrezzi da birraio',
  'Attrezzi da carpentiere', 'Attrezzi da cartografo', 'Attrezzi da calzolaio', 'Attrezzi da cuoco',
  'Attrezzi da vetraio', 'Attrezzi da gioielliere', 'Attrezzi da vasaio', 'Attrezzi da conciatore',
  'Attrezzi da intagliatore', 'Attrezzi da tessitore', 'Attrezzi da ceramista', 'Attrezzi da muratore',
  'Attrezzi da pittore', 'Attrezzi da fabbro d’armi', 'Strumenti da navigatore', 'Set da gioco',
  'Carte da gioco', 'Dadi', 'Strumento musicale', 'Cornamusa', 'Tamburo', 'Flauto', 'Liuto',
  'Lira', 'Corno', 'Zufolo', 'Veicoli (terrestri)', 'Veicoli (acquatici)',
];

// Suggerimenti per le competenze nelle armi (categorie + armi specifiche).
const COMP_ARMI_5E = ['Armi semplici', 'Armi da guerra', ...ARMI_5E.map((w) => w.nome)];

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

/**
 * Sei competente per indossare questo tipo di armatura? 'manuale' e 'nessuna'
 * sono sempre concessi; leggera/media/pesante richiedono la competenza segnata
 * in addestramento (che deriva dalla classe, o si attiva a mano per talenti).
 */
function competenteInArmatura(scheda, tipo) {
  if (tipo === 'manuale' || tipo === 'nessuna') return true;
  return !!scheda.addestramento?.armature?.[tipo];
}

/** Bonus di un'abilità: mod caratteristica + competenza (1x o 2x per maestria). */
function bonusAbilita(scheda, abilita) {
  const def = ABILITA.find((a) => a.key === abilita);
  if (!def) return 0;
  const livComp = scheda.abilita[abilita] || 0;
  // 0 = niente, 1 = competenza (cerchietto), 2 = competenza di classe/razza
  // (stellina). Entrambe le competenze valgono ×1 il bonus (la 2 è solo un
  // marcatore d'origine, non maestria): così i numeri restano fedeli alla scheda.
  const competente = livComp >= 1 ? 1 : 0;
  return modificatore(scheda.caratteristiche[def.car]) + competente * scheda.bonusCompetenza;
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
  sottoclasse: 'Stregoneria della Magia Selvaggia',
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
  // 0 = niente · 1 = competenza (cerchietto) · 2 = competenza di classe/razza (stella)
  // Stregone → Arcano, Persuasione · Elfo (Sensi Acuti) → Percezione (stelle);
  // Eremita/altre competenze → cerchietto.
  abilita: {
    acrobazia: 0, addestrareAnimali: 0, arcano: 2, atletica: 0,
    furtivita: 0, indagare: 0, inganno: 0, intimidire: 0,
    intrattenere: 0, intuizione: 1, medicina: 1, natura: 0,
    percezione: 2, persuasione: 2, rapiditaDiMano: 0,
    religione: 1, sopravvivenza: 1, storia: 0
  },
  competenzeExtra: 'Armi semplici',
  resistenze: '',
  sensi: 'Scurovisione 18 m',
  condizioni: [],
  concentrazione: '',
  attacchi: [
    { id: 1, nome: 'Spada', categoria: 'Azione', bonus: 4, danno: '1d6+2', tipoDanno: 'Perforante', note: 'Accurata, Leggera' },
    { id: 2, nome: 'Pugnale x2', categoria: 'Azione', bonus: 4, danno: '1d4+2', tipoDanno: 'Perforante', note: '6/18m Accurata, Leggera, Lancio' },
    { id: 3, nome: 'Bastone Ferrato (1 mano)', categoria: 'Azione', bonus: 3, danno: '1d6+1', tipoDanno: 'Contundente', note: 'Versatile' },
    { id: 4, nome: 'Bastone Ferrato (2 mani)', categoria: 'Azione', bonus: 3, danno: '1d8+1', tipoDanno: 'Contundente', note: 'Versatile' }
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
  privilegi: "Stregoneria Innata\nFonte di Magia\nOnde di Caos",
  metamagie: "Incantesimo Celato, Incantesimo Preciso",
  trattiSpecie: "Retaggio Fatato\nScurovisione 18 m\nSensi Acuti (Intuizione, Percezione o Sopravvivenza)\nTrance",
  talenti: "Incantatore da Guerra\nGuaritore",
  equipaggiamento: "Focus Arcano (Cristallo)\nBorsa da erborista\nGiaciglio\nLibro (filosofia)\nDotazione da avventuriero\nAbiti da viaggiatore",
  lingue: "Comune, Elfico, Sottocomune",
  denari: { mr: 0, ma: 0, me: 0, mo: 74, mp: 0 },
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
const APP_VERSION = '1.9.54';

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
          // assegna un id agli incantesimi che ne fossero privi (schede legacy),
          // così ognuno è modificabile singolarmente nel sottomenu
          if (Array.isArray(s.incantesimiLista)) {
            s.incantesimiLista = s.incantesimiLista.map((sp, i) => (sp && sp.id != null ? sp : { ...sp, id: Date.now() + i }));
          }
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
          preparato: s.preparato !== false,
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
    versione: dati.versione === '2014' ? '2014' : '2024',
    maxTrucchetti: num(dati.maxTrucchetti, 0),
    maxIncantesimi: num(dati.maxIncantesimi, 0),
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
    privilegiSottoclasse: str(dati.privilegiSottoclasse),
    trattiSpecie: str(dati.trattiSpecie),
    talenti: str(dati.talenti),
    metamagie: str(dati.metamagie),
    equipaggiamento: str(dati.equipaggiamento),
    sintonia: str(dati.sintonia),
    lingue: str(dati.lingue),
    aspetto: str(dati.aspetto),
    trattiCaratteriali: str(dati.trattiCaratteriali),
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
function CampoConTendina({ value, opzioni, onChange, width, title, lookup, setInfo }) {
  const attuali = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : [];

  const aggiungi = (v) => {
    if (!v) return;
    if (attuali.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...attuali, v].join(', '));
  };

  const rimuovi = (v) => {
    onChange(attuali.filter(x => x !== v).join(', '));
  };

  // Stesso aspetto dei "quadratini" classici (ListaQuadratini), con la × per rimuovere.
  const chip = { background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', fontSize: 13, color: C.ink, display: 'inline-flex', alignItems: 'center', gap: 6 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minHeight: 24 }} title={title}>
      {attuali.map(t => {
        const sp = lookup && setInfo ? lookup(t) : null;
        return (
        <span key={t} title={sp || t} style={chip}>
          <span
            style={sp ? { cursor: 'help', textDecoration: 'underline dotted', textUnderlineOffset: 3 } : undefined}
            onClick={sp ? () => setInfo({ titolo: t, testo: sp }) : undefined}
          >{t}</span>
          <button
            style={{ background: 'transparent', border: 'none', color: '#c0392b', cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 0.8 }}
            onClick={() => rimuovi(t)}
            title={`Rimuovi ${t}`}
          >
            ×
          </button>
        </span>
        );
      })}
      <label style={{ ...chip, borderStyle: 'dashed', color: C.goldDark, cursor: 'pointer', position: 'relative' }} title="Aggiungi dalla lista">
        ➕ Aggiungi
        <select
          value=""
          onChange={(e) => aggiungi(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
        >
          <option value="">Aggiungi…</option>
          {opzioni.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>
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
 * Elenco di "quadratini": ogni riga (di un testo separato da a-capo) è una
 * chip cliccabile. Il click apre un sottomenu con la spiegazione (se nota) e
 * i campi per modificare/eliminare la voce. In fondo un pulsante per aggiungere.
 * Il valore resta un unico testo con a-capo (nessun cambio al modello dati).
 */
function ListaQuadratini({ value, onChange, lookup, placeholder, opzioni }) {
  const righe = String(value || '').split('\n').map((r) => r.trim()).filter(Boolean);
  const [edit, setEdit] = useState(null); // { index, valore }  (index -1 = nuova)
  const listId = useId();
  const salva = (nuove) => onChange(nuove.join('\n'));
  const conferma = () => {
    const v = (edit.valore || '').trim();
    const nuove = [...righe];
    if (edit.index === -1) { if (v) nuove.push(v); }
    else if (v) nuove[edit.index] = v;
    else nuove.splice(edit.index, 1);
    salva(nuove);
    setEdit(null);
  };
  const elimina = () => { salva(righe.filter((_, i) => i !== edit.index)); setEdit(null); };
  const chip = { background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', fontSize: 13, cursor: 'pointer', color: C.ink };
  const spEdit = edit ? (lookup ? lookup(edit.valore) : null) : null;
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {righe.length === 0 && <span style={{ ...styles.detail, fontStyle: 'italic' }}>{placeholder || 'Nessuna voce.'}</span>}
        {righe.map((r, i) => {
          const sp = lookup ? lookup(r) : null;
          return (
            <button key={i} style={chip} title="Apri: dettagli e modifica" onClick={() => setEdit({ index: i, valore: r })}>
              {r}
            </button>
          );
        })}
        <button style={{ ...chip, borderStyle: 'dashed', color: C.goldDark }} onClick={() => setEdit({ index: -1, valore: '' })}>➕ Aggiungi</button>
      </div>
      {edit && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1004, padding: 16, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) setEdit(null); }}
        >
          <div style={{ ...styles.panel, maxWidth: 420, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong style={{ color: C.goldDark, fontSize: 16 }}>{edit.index === -1 ? 'Nuova voce' : 'Voce'}</strong>
              <button style={styles.buttonMini} onClick={() => setEdit(null)} title="Chiudi">✕</button>
            </div>
            {spEdit && (
              <div style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 14, lineHeight: 1.4, marginBottom: 8 }}>{spEdit}</div>
            )}
            <input
              autoFocus
              style={{ ...styles.inlineInput, width: '100%', padding: '8px 10px', fontSize: 15 }}
              value={edit.valore}
              placeholder={opzioni ? 'Scrivi o scegli dalla lista…' : 'Nome della voce'}
              list={opzioni ? listId : undefined}
              onChange={(e) => setEdit({ ...edit, valore: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') conferma(); }}
            />
            {opzioni && (
              <datalist id={listId}>
                {opzioni.map((o) => <option key={o} value={o} />)}
              </datalist>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {edit.index !== -1 && <button style={{ ...styles.buttonDanger, flex: 1 }} onClick={elimina}>🗑 Elimina</button>}
              <button style={{ ...styles.buttonPrimary, flex: 1 }} onClick={conferma}>Salva</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Pannello con titolo collassabile (details/summary nativo). Di default aperto;
 * cliccando il titolo si richiude per risparmiare spazio verticale.
 * Con `manigliaProps` mostra un segnalino ⠿ per trascinare e riordinare.
 */
function Sezione({ titolo, children, aperto = true, onToggleAperto, manigliaProps, trascinando, style, innerRef }) {
  return (
    <details
      ref={innerRef}
      open={aperto}
      onToggle={(e) => { const open = e.currentTarget.open; if (onToggleAperto && open !== aperto) onToggleAperto(open); }}
      style={{ ...styles.panel, opacity: trascinando ? 0.4 : 1, ...style }}
      className="sezione"
    >
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
  // aggiornamenti PWA: mostra un banner quando è pronta una nuova versione
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, r) {
      if (r) setInterval(() => r.update(), 60 * 1000); // controlla ogni minuto
    },
  });

  // Aggiornamento manuale: svuota le cache della PWA e ricarica dalla rete.
  // Utile quando il service worker serve ancora una versione vecchia: così
  // l'utente può forzare l'ultima versione con un solo click.
  const [aggiornando, setAggiornando] = useState(false);
  async function forzaAggiornamento() {
    setAggiornando(true);
    try {
      // 1) rimuovi del tutto i service worker: nessuno intercetta più le richieste
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister().catch(() => {})));
      }
      // 2) svuota ogni cache della PWA
      if ('caches' in window) {
        const chiavi = await caches.keys();
        await Promise.all(chiavi.map((k) => caches.delete(k)));
      }
    } catch { /* ignora: ricarichiamo comunque */ }
    // 3) ricarica bypassando anche la cache HTTP (query cache-busting)
    const u = new URL(window.location.href);
    u.searchParams.set('agg', Date.now().toString());
    window.location.replace(u.toString());
  }

  // Rilevatore di nuove versioni INDIPENDENTE dal service worker: interroga
  // `version.json` (che non è nella cache, quindi va sempre in rete) e confronta
  // il `build` pubblicato con quello di questa build (__BUILD_ID__ iniettato da
  // Vite). Se differiscono, il pulsante 🔄 lampeggia di verde per invitare al click.
  const [aggiornamentoPronto, setAggiornamentoPronto] = useState(false);
  useEffect(() => {
    let annullato = false;
    const controlla = async () => {
      try {
        const r = await fetch(`version.json?ts=${Date.now()}`, { cache: 'no-store' });
        if (!r.ok) return;
        const dati = await r.json();
        if (!annullato && dati && dati.build && String(dati.build) !== String(__BUILD_ID__)) {
          setAggiornamentoPronto(true);
        }
      } catch { /* offline o file assente: nessun avviso */ }
    };
    const t = setTimeout(controlla, 6000);          // primo controllo dopo l'avvio
    const id = setInterval(controlla, 60 * 1000);   // poi ogni minuto
    return () => { annullato = true; clearTimeout(t); clearInterval(id); };
  }, []);
  // il pulsante lampeggia se c'è una nuova versione (rilevata in un modo o nell'altro)
  const nuovaVersione = aggiornamentoPronto || needRefresh;

  const [roster, setRoster] = useState(loadState);
  const [modalita, setModalita] = useState('normale'); // normale | vantaggio | svantaggio
  const [rolling, setRolling] = useState(false);
  const [faccia, setFaccia] = useState(20);
  const [tipoDadoInUso, setTipoDadoInUso] = useState(20);
  const [tiro, setTiro] = useState(null);
  const [danni, setDanni] = useState(null);

  const [erroreImport, setErroreImport] = useState('');
  // Import da PDF con l'IA: endpoint configurabile (Cloudflare Worker o server
  // locale). In dev il proxy manda /api → localhost:3001; online serve un URL.
  const [transcribeUrl, setTranscribeUrl] = useState(
    () => localStorage.getItem('scheda-interattiva:transcribe-url')
      || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TRANSCRIBE_URL) || ''
  );
  useEffect(() => {
    try { localStorage.setItem('scheda-interattiva:transcribe-url', transcribeUrl); } catch { /* niente */ }
  }, [transcribeUrl]);
  const [pdfStato, setPdfStato] = useState(''); // '' | 'loading'
  const [filtroIncantesimo, setFiltroIncantesimo] = useState('');
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
  const [bozzaCrea, setBozzaCrea] = useState({ nome: '', classe: '', specie: '', background: '', metodo: 'auto', pool: null, assegna: {}, competenzeClasse: [], competenzeSpecie: [], dotazione: 'pacchetto' });
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
  // auto-salvataggio su cloud (debounced) + orario ultimo salvataggio
  const [mostraToken, setMostraToken] = useState(false);
  const [autoSync, setAutoSync] = useState(() => localStorage.getItem('scheda-interattiva:auto-sync') !== 'off');
  const [ultimoSync, setUltimoSync] = useState(() => localStorage.getItem('scheda-interattiva:ultimo-sync') || '');
  const [sincronizzando, setSincronizzando] = useState(false);
  const [caricandoCloud, setCaricandoCloud] = useState(false); // overlay di caricamento dal cloud

  // Level Up
  const [mostraLevelUp, setMostraLevelUp] = useState(false);
  const [mostraPrivilegi, setMostraPrivilegi] = useState(false); // panoramica privilegi per livello
  const [info, setInfo] = useState(null); // nuvoletta esplicativa: { titolo, testo }
  const [dettaglioInc, setDettaglioInc] = useState(null); // id incantesimo aperto nel sottomenu
  const [conferma, setConferma] = useState(null); // { titolo, testo, onConferma } per la conferma in-app
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

  /** Props per ricordare, PER SINGOLO PG, se una Sezione è aperta o minimizzata. */
  const apertoProps = (id, def = true) => ({
    aperto: scheda.sezioniAperte?.[id] ?? def,
    onToggleAperto: (open) => aggiorna({ sezioniAperte: { ...(scheda.sezioniAperte || {}), [id]: open } }),
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
    // Sfondo atmosferico "tavolo a lume di candela" (ispirato alla palette D&D):
    // bagliore della classe + luce ambrata calda in alto + vignettatura profonda.
    const tintaClasse = acc ? acc[modo] : t.gold;
    const glowClasse = `radial-gradient(135% 95% at 50% -14%, ${mescola(t.bg, tintaClasse, scuroEff ? 0.26 : 0.17)}, transparent 60%)`;
    const ambra = `radial-gradient(70% 46% at 50% -2%, rgba(224,162,74,${scuroEff ? 0.13 : 0.06}), transparent 66%)`;
    const vignetta = `radial-gradient(116% 116% at 50% 42%, transparent 52%, ${mescola(t.bg, '#000000', scuroEff ? 0.42 : 0.13)} 100%)`;
    document.body.style.background = `${glowClasse}, ${ambra}, ${vignetta}, ${t.bg}`;
    document.body.style.backgroundAttachment = 'fixed';
    try {
      localStorage.setItem('scheda-interattiva:tema', tema);
    } catch {
      // storage non disponibile: pazienza
    }
  }, [tema, sistemaScuro, oraTick, classeAttiva]);
  const intervalRef = useRef(null);
  const jsonRef = useRef(null);
  const pdfRef = useRef(null);
  const ritrattoRef = useRef(null);

  const scheda = roster.personaggi[roster.attivo];
  // versione delle regole del personaggio attivo (fallback: impostazione globale)
  const versione = scheda?.versione || regoleVersione || '2024';

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
  function creaPersonaggio({ nome, classe, specie, background, metodo, pool, assegna, competenzeClasse, competenzeSpecie, dotazione }) {
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
    // caratteristiche secondo il metodo scelto:
    //  'auto'    → 4d6 assegnate per priorità di classe
    //  'assegna' → i 6 valori tirati (pool), assegnati a mano dall'utente
    //  'manuale' → restano a 10 (le imposta l'utente più tardi)
    if (metodo === 'auto') {
      s.caratteristiche = generaCaratteristiche(classe);
    } else if (metodo === 'assegna' && Array.isArray(pool)) {
      for (const { key } of CARATTERISTICHE) {
        const idx = assegna?.[key];
        s.caratteristiche[key] = (idx != null && pool[idx] != null) ? pool[idx] : 10;
      }
    }
    // competenze nelle abilità:
    //  - background → competenza semplice (livello 1, cerchietto ●)
    //  - classe e specie (scelte dall'utente) → competenza di classe/razza (livello 2, ★)
    (BACKGROUND_COMPETENZE[background] || []).forEach((k) => { s.abilita[k] = Math.max(s.abilita[k] || 0, 1); });
    (Array.isArray(competenzeClasse) ? competenzeClasse : []).forEach((k) => { if (k in s.abilita) s.abilita[k] = 2; });
    (Array.isArray(competenzeSpecie) ? competenzeSpecie : []).forEach((k) => { if (k in s.abilita) s.abilita[k] = 2; });
    // versione delle regole scelta per questo personaggio
    s.versione = regoleVersione;
    // privilegi di classe di 1° livello (coerenti con la versione)
    s.privilegi = privilegiClasseL1(classe, regoleVersione);
    // background: bonus alle caratteristiche (solo regole 2024)
    if (regoleVersione === '2024') {
      const [piu2, piu1] = bonusCaratteristicheBackground(background, classe);
      if (piu2) s.caratteristiche[piu2] = (s.caratteristiche[piu2] || 10) + 2;
      if (piu1) s.caratteristiche[piu1] = (s.caratteristiche[piu1] || 10) + 1;
    }
    // lingue iniziali (Comune + lingua a tema specie)
    s.lingue = lingueIniziali(specie);
    // bonus competenza coerente col livello (serve per gli attacchi iniziali)
    s.bonusCompetenza = bonusCompetenzaDaLivello(s.livello);
    // dotazione iniziale della classe: armi (come attacchi), equipaggiamento,
    // monete, armatura indossata (riquadro CA), competenze negli strumenti.
    const kit = KIT_CLASSE[chiaveClasse(classe)];
    if (kit && dotazione === 'oro') {
      // Alternativa: solo oro iniziale, niente dotazione di classe.
      s.denari = { ...s.denari, mo: ORO_INIZIALE[chiaveClasse(classe)] || kit.denari };
      s.equipaggiamento = '';
      if (kit.strumenti) s.addestramento = { ...s.addestramento, strumenti: kit.strumenti };
    } else if (kit) {
      s.equipaggiamento = kit.equip.join('\n');
      s.denari = { ...s.denari, mo: kit.denari };
      if (kit.strumenti) s.addestramento = { ...s.addestramento, strumenti: kit.strumenti };
      // armatura indossata → il riquadro CA si calcola da sola
      s.armatura = { ...s.armatura, ...kit.armatura, scudo: !!kit.scudo, bonus: 0 };
      if (kit.armatura.tipo === 'manuale' || kit.armatura.tipo === 'nessuna') s.ca = 10 + modificatore(s.caratteristiche.destrezza);
      const armi = kit.armi
        .map((nomeArma, i) => {
          const a = ARMI_5E.find((w) => w.nome === nomeArma);
          return a ? { id: Date.now() + i, categoria: 'Azione', ...attaccoDaArma(a, s) } : null;
        })
        .filter(Boolean);
      if (armi.length) s.attacchi = armi;
    }
    // punti ferita di 1° livello = dado vita massimo + modificatore di Costituzione
    s.pfMax = Math.max(1, dadoVitaClasse(classe) + modificatore(s.caratteristiche.costituzione));
    s.pfAttuali = s.pfMax;
    // avatar e chiusura schermate
    s.ritratto = generaAvatar(classe, specie, s.nome);
    nuovoPersonaggio(s);
    setMostraCrea(false);
    setMostraMenu(false);
  }

  /** Genera un personaggio casuale ma coerente (classe/specie/background, stat, competenze, nome). */
  function generaPgCasuale() {
    const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const classe = rnd(NOMI_CLASSI);
    const specie = rnd(Object.keys(SPECIE_DATI));
    const background = rnd(BACKGROUND_5E);
    const cc = competenzeClasseDi(classe);
    const bgSkills = BACKGROUND_COMPETENZE[background] || [];
    let competenzeClasse = [];
    if (cc) {
      const disponibili = cc.lista.filter((k) => !bgSkills.includes(k)).sort(() => Math.random() - 0.5);
      competenzeClasse = disponibili.slice(0, cc.numero);
    }
    const cs = competenzeSpecieDi(specie);
    const competenzeSpecie = cs ? [rnd(cs.lista)] : [];
    creaPersonaggio({ nome: nomeCasuale(specie), classe, specie, background, metodo: 'auto', pool: null, assegna: {}, competenzeClasse, competenzeSpecie });
  }

  function duplicaPersonaggio() {
    nuovoPersonaggio({ ...scheda, nome: `${scheda.nome} (copia)` });
  }

  function eliminaPersonaggio() {
    setConferma({
      titolo: 'Elimina personaggio',
      testo: `Vuoi eliminare davvero "${scheda.nome || 'Senza nome'}"? L'operazione non si può annullare.`,
      onConferma: () => setRoster((r) => {
        const personaggi = { ...r.personaggi };
        delete personaggi[r.attivo];
        const ids = Object.keys(personaggi);
        if (ids.length === 0) return rosterVuoto();
        return { attivo: ids[0], personaggi };
      }),
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
    const penSfinimento = versione === '2024' ? 2 * scheda.sfinimento : 0;
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
    const maxFacce = Math.max(...parsata.termini.map((p) => p.facce).filter(Boolean));
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
    const maxFacce = Math.max(...parsata.termini.map((p) => p.facce).filter(Boolean));
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
    const maxFacce = Math.max(...parsata.termini.map((p) => p.facce).filter(Boolean));
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

  /**
   * Import da PDF con l'IA: manda il PDF (base64) all'endpoint di trascrizione
   * (Cloudflare Worker o server locale), che risponde con il JSON della scheda.
   */
  async function transcribePdf(evento) {
    const file = evento.target.files?.[0];
    evento.target.value = '';
    if (!file) return;
    const endpoint = (transcribeUrl || '').trim() || '/api/transcribe';
    setErroreImport('');
    setPdfStato('loading');
    try {
      const base64 = await new Promise((risolvi, rifiuta) => {
        const fr = new FileReader();
        fr.onload = () => risolvi(String(fr.result).split(',')[1] || '');
        fr.onerror = () => rifiuta(new Error('lettura del file fallita'));
        fr.readAsDataURL(file);
      });
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64 }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `errore ${res.status}`);
      }
      const dati = await res.json();
      nuovoPersonaggio(normalizeImported(dati));
      setPdfStato('');
      setMostraMenu(false);
    } catch (e) {
      setPdfStato('');
      const dove = (transcribeUrl || '').trim()
        ? 'Controlla che l’endpoint IA sia corretto e attivo.'
        : 'Devi prima configurare l’endpoint IA (campo qui sotto): serve un Cloudflare Worker con la tua chiave API.';
      setErroreImport(`Import da PDF fallito: ${e.message}. ${dove}`);
    }
  }

  // --- Cloud Sync (GitHub Gist) ---

  async function salvaSuCloud(silenzioso = false) {
    if (!githubToken) {
      if (!silenzioso) setCloudStatus({ text: 'Inserisci il GitHub Token per salvare.', type: 'error' });
      return;
    }
    try {
      setSincronizzando(true);
      if (!silenzioso) setCloudStatus({ text: 'Salvataggio in corso...', type: 'info' });
      const quando = Date.now();
      const dati = JSON.stringify({ ...roster, _updatedAt: quando }, null, 2);
      const corpo = { files: { 'roster_tavolo_dei_dadi.json': { content: dati } } };

      let nuovoId = gistId;
      if (gistId) {
        const res = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: { 'Authorization': `token ${githubToken}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
          body: JSON.stringify(corpo),
        });
        if (!res.ok) throw new Error('Errore aggiornamento Gist. Token o ID non validi.');
      } else {
        const res = await fetch(`https://api.github.com/gists`, {
          method: 'POST',
          headers: { 'Authorization': `token ${githubToken}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: 'Salvataggio Cloud - Tavolo dei Dadi', public: false, ...corpo }),
        });
        if (!res.ok) throw new Error('Errore creazione Gist. Token non valido.');
        const out = await res.json();
        nuovoId = out.id;
        setGistId(out.id);
        localStorage.setItem('scheda-interattiva:gist-id', out.id);
      }
      const orario = new Date(quando).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      setUltimoSync(orario);
      localStorage.setItem('scheda-interattiva:ultimo-sync', orario);
      localStorage.setItem('scheda-interattiva:sync-ts', String(quando));
      setCloudStatus({ text: `✅ Sincronizzato · ${orario}`, type: 'success' });
      return nuovoId;
    } catch (err) {
      setCloudStatus({ text: err.message, type: 'error' });
    } finally {
      setSincronizzando(false);
    }
  }

  // Auto-salvataggio: quando il roster cambia e il cloud è configurato, salva
  // dopo 2,5s di inattività (debounce). Salta il primo render.
  const primoRenderSync = useRef(true);
  useEffect(() => {
    if (primoRenderSync.current) { primoRenderSync.current = false; return; }
    if (!autoSync || !githubToken || !gistId) return;
    const t = setTimeout(() => { salvaSuCloud(true); }, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster, autoSync, githubToken, gistId]);

  // Auto-caricamento all'avvio: se il cloud è configurato e contiene una copia
  // più recente di quella locale, la carica da sola (vera sincronia tra device).
  const autoCaricato = useRef(false);
  useEffect(() => {
    if (autoCaricato.current) return;
    autoCaricato.current = true;
    if (!githubToken || !gistId) return;
    (async () => {
      try {
        setCaricandoCloud(true);
        const res = await fetch(`https://api.github.com/gists/${gistId}`, {
          headers: { 'Authorization': `token ${githubToken}`, 'Accept': 'application/vnd.github.v3+json' },
        });
        if (!res.ok) return;
        const out = await res.json();
        const file = out.files?.['roster_tavolo_dei_dadi.json'];
        if (!file) return;
        const parsed = JSON.parse(file.content);
        const cloudTs = Number(parsed._updatedAt) || 0;
        const localTs = Number(localStorage.getItem('scheda-interattiva:sync-ts')) || 0;
        if (cloudTs <= localTs) return; // il locale è già aggiornato quanto il cloud
        const caricato = { attivo: parsed.attivo, personaggi: {} };
        for (const id in parsed.personaggi) caricato.personaggi[id] = normalizeImported(parsed.personaggi[id]);
        if (!caricato.attivo || !caricato.personaggi[caricato.attivo]) caricato.attivo = Object.keys(caricato.personaggi)[0] || '';
        if (Object.keys(caricato.personaggi).length) {
          setRoster(caricato);
          localStorage.setItem('scheda-interattiva:sync-ts', String(cloudTs));
          setCloudStatus({ text: '☁️ Personaggi caricati dal cloud', type: 'success' });
        }
      } catch { /* offline o errore: si resta sui dati locali */ }
      finally { setCaricandoCloud(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function caricaDaCloud() {
    if (!githubToken || !gistId) {
      setCloudStatus({ text: 'Inserisci Token e Gist ID per caricare.', type: 'error' });
      return;
    }
    try {
      setCaricandoCloud(true);
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
      if (parsed._updatedAt) localStorage.setItem('scheda-interattiva:sync-ts', String(parsed._updatedAt));
      setCloudStatus({ text: '✅ Roster caricato e sincronizzato!', type: 'success' });
    } catch (err) {
      setCloudStatus({ text: err.message, type: 'error' });
    } finally {
      setCaricandoCloud(false);
    }
  }

  const critico = tiro?.naturale === 20;
  const fallimento = tiro?.naturale === 1;
  const dannoAttaccoValido = tiro?.attacco && parseEspressioneDado(tiro.attacco.danno || '');
  const percezionePassiva = 10 + bonusAbilita(scheda, 'percezione');
  const modIncantatore = scheda.incantatore.caratteristica
    ? modificatore(scheda.caratteristiche[scheda.incantatore.caratteristica])
    : null;

  // Limiti di trucchetti/incantesimi (come il lock delle armature): quando sei al
  // massimo per la tua classe/livello, i pulsanti "Aggiungi" si bloccano.
  const nTrucchetti = scheda.incantesimiLista.filter((s) => s.livello === 0).length;
  const nIncantesimi = scheda.incantesimiLista.filter((s) => s.livello > 0).length;
  // base = override manuale (>0) oppure automatico da classe/livello/versione
  const baseTrucchetti = (scheda.maxTrucchetti > 0) ? scheda.maxTrucchetti : trucchettiMax(scheda.classe, scheda.livello);
  const baseIncantesimi = (scheda.maxIncantesimi > 0) ? scheda.maxIncantesimi : incantesimiMaxAuto(scheda, versione);
  // "pieno" (e quindi blocco) quando sei al limite base; il massimo mostrato non
  // scende mai sotto quanti ne hai già, così le schede esistenti non risultano "oltre".
  const trucchettiPieno = baseTrucchetti != null && nTrucchetti >= baseTrucchetti;
  const incantesimiPieno = baseIncantesimi != null && nIncantesimi >= baseIncantesimi;
  const maxTrucchetti = baseTrucchetti == null ? null : Math.max(baseTrucchetti, nTrucchetti);
  const maxIncantesimi = baseIncantesimi == null ? null : Math.max(baseIncantesimi, nIncantesimi);

  return (
    <div style={styles.app}>
      <style>{GLOBAL_CSS}</style>

      {info && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 3100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setInfo(null)}
        >
          <div
            style={{ ...styles.panel, maxWidth: 360, width: '100%', position: 'relative', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <strong style={{ color: C.goldDark, fontSize: 16 }}>{info.titolo}</strong>
              <button style={styles.buttonMini} onClick={() => setInfo(null)} title="Chiudi">✕</button>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.45, color: C.ink }}>{info.testo}</div>
          </div>
        </div>
      )}

      {conferma && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 3200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setConferma(null)}
        >
          <div style={{ ...styles.panel, maxWidth: 380, width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }} onClick={(e) => e.stopPropagation()}>
            <strong style={{ color: C.red, fontSize: 16, display: 'block', marginBottom: 8 }}>{conferma.titolo}</strong>
            <div style={{ fontSize: 14, lineHeight: 1.45, color: C.ink, marginBottom: 16 }}>{conferma.testo}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...styles.button, flex: 1 }} onClick={() => setConferma(null)}>Annulla</button>
              <button style={{ ...styles.buttonDanger, flex: 1 }} onClick={() => { const f = conferma.onConferma; setConferma(null); if (f) f(); }}>🗑 Elimina</button>
            </div>
          </div>
        </div>
      )}

      {dettaglioInc != null && (() => {
        const s = scheda.incantesimiLista.find((x) => x.id === dettaglioInc);
        if (!s) return null;
        const upd = (patch) => aggiorna({ incantesimiLista: scheda.incantesimiLista.map((x) => (x.id === s.id ? { ...x, ...patch } : x)) });
        const eff = spiegaIncantesimo(s.nome);
        const campo = { ...styles.inlineInput, width: '100%', padding: '6px 8px', fontSize: 14, marginTop: 2 };
        const etichetta = { ...styles.detail, display: 'block', marginBottom: 1, marginTop: 8, fontWeight: 600 };
        return (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1004, padding: 16, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={(e) => { if (e.target === e.currentTarget) setDettaglioInc(null); }}
          >
            <div style={{ ...styles.panel, maxWidth: 420, width: '100%', maxHeight: '88vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <strong style={{ color: C.goldDark, fontSize: 17 }}>{s.nome || 'Incantesimo'}</strong>
                <button style={styles.buttonMini} onClick={() => setDettaglioInc(null)} title="Chiudi">✕</button>
              </div>
              <div style={{ ...styles.detail, marginBottom: 4 }}>Modifica · {s.livello === 0 ? 'Trucchetto' : `Incantesimo di ${s.livello}° livello`}</div>

              <label style={etichetta}>Nome</label>
              <input style={campo} value={s.nome} onChange={(e) => upd({ nome: e.target.value })} list="lista-incantesimi" placeholder="Scrivi o scegli dalla lista…" />
              <datalist id="lista-incantesimi">
                {INCANTESIMI_NOMI.map((n) => <option key={n} value={n} />)}
              </datalist>
              {eff && <div style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, lineHeight: 1.4, marginTop: 6 }}>{eff}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={etichetta}>Livello</label>
                  <select style={campo} value={s.livello} onChange={(e) => upd({ livello: Number(e.target.value) })}>
                    {Array.from({ length: 10 }, (_, i) => <option key={i} value={i}>{i === 0 ? 'Trucchetto' : `${i}° livello`}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={etichetta}>Tempo</label>
                  <input style={campo} value={s.tempo} onChange={(e) => upd({ tempo: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={etichetta}>Gittata</label>
                  <input style={campo} value={s.gittata} onChange={(e) => upd({ gittata: e.target.value })} />
                </div>
                <div style={{ flex: 1 }} />
              </div>
              <label style={etichetta}>Note</label>
              <input style={campo} value={s.note} onChange={(e) => upd({ note: e.target.value })} placeholder="Componenti, TS, concentrazione…" />

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button
                  style={{ ...styles.buttonDanger, flex: 1 }}
                  onClick={() => { aggiorna({ incantesimiLista: scheda.incantesimiLista.filter((x) => x.id !== s.id) }); setDettaglioInc(null); }}
                >🗑 Elimina</button>
                <button style={{ ...styles.buttonPrimary, flex: 1 }} onClick={() => setDettaglioInc(null)}>Fatto</button>
              </div>
            </div>
          </div>
        );
      })()}

      {caricandoCloud && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          background: 'rgba(20,12,8,0.72)', backdropFilter: 'blur(3px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
        }}>
          <div className="cloud-spinner" style={{ fontSize: 54 }}>☁️</div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: 0.5 }}>Carico i personaggi dal cloud…</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Un attimo di pazienza</div>
          <div style={{ width: 180, height: 5, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.2)' }}>
            <div className="cloud-bar" style={{ height: '100%', background: 'linear-gradient(90deg,#e0521c,#d6a90f,#3f9a3a,#1f74d4)' }} />
          </div>
        </div>
      )}

      {needRefresh && (
        <div
          style={{
            position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 2000,
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 10,
            background: C.panel, border: `1px solid var(--c-gold-dark)`, boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            maxWidth: '92vw',
          }}
        >
          <span style={{ ...styles.detail, color: C.ink }}>🔄 È disponibile una nuova versione.</span>
          <button style={styles.buttonPrimary} onClick={() => updateServiceWorker(true)}>Ricarica</button>
          <button style={styles.buttonMini} title="Ignora" onClick={() => setNeedRefresh(false)}>✕</button>
        </div>
      )}

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
              onClick={() => { setBozzaCrea({ nome: '', classe: '', specie: '', background: '', metodo: 'auto', pool: null, assegna: {}, competenzeClasse: [], competenzeSpecie: [], dotazione: 'pacchetto' }); setMostraCrea(true); }}
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
                    onClick={() => setConferma({
                      titolo: 'Elimina personaggio',
                      testo: `Vuoi eliminare davvero "${p.nome || 'Senza nome'}"? L'azione è irreversibile.`,
                      onConferma: () => setRoster((r) => {
                        const nuovi = { ...r.personaggi };
                        delete nuovi[id];
                        const nuovoAttivo = r.attivo === id ? (Object.keys(nuovi)[0] ?? null) : r.attivo;
                        return { personaggi: nuovi, attivo: nuovoAttivo };
                      }),
                    })}
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
                onClick={() => generaPgCasuale()}
                title="Genera un personaggio casuale ma coerente (classe, specie, background, stat, competenze e nome)"
              >
                🎲 PG casuale
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
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              <input
                type={mostraToken ? 'text' : 'password'}
                style={{ ...styles.inlineInput, flex: 1, padding: '6px 8px', fontSize: 13 }}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => {
                  setGithubToken(e.target.value);
                  localStorage.setItem('scheda-interattiva:github-token', e.target.value);
                }}
              />
              <button style={styles.buttonMini} title={mostraToken ? 'Nascondi' : 'Mostra per copiarlo'} onClick={() => setMostraToken((v) => !v)}>{mostraToken ? '🙈' : '👁'}</button>
              <button style={styles.buttonMini} title="Copia il token" onClick={() => navigator.clipboard?.writeText(githubToken).then(() => setCloudStatus({ text: 'Token copiato', type: 'success' }))}>📋</button>
            </div>
            <p style={{ ...styles.detail, fontSize: 11, marginTop: 0, marginBottom: 12 }}>
              Il token si vede una sola volta su GitHub: <strong>salvalo</strong> (con 👁 e 📋 lo copi da qui). Sull'altro dispositivo incolla lo <strong>stesso</strong> token e Gist ID, oppure genera un nuovo token (stesso account, scope "gist").
            </p>

            <label style={{ ...styles.detail, display: 'block', marginBottom: 3, fontWeight: 'bold' }}>Gist ID (creato automaticamente al primo salvataggio)</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              <input
                type="text"
                style={{ ...styles.inlineInput, flex: 1, padding: '6px 8px', fontSize: 13, fontFamily: 'monospace' }}
                placeholder="Lascia vuoto se è il primo salvataggio"
                value={gistId}
                onChange={(e) => {
                  setGistId(e.target.value);
                  localStorage.setItem('scheda-interattiva:gist-id', e.target.value);
                }}
              />
              <button style={styles.buttonMini} title="Copia il Gist ID" onClick={() => navigator.clipboard?.writeText(gistId).then(() => setCloudStatus({ text: 'Gist ID copiato', type: 'success' }))}>📋</button>
              {gistId && <a href={`https://gist.github.com/${gistId}`} target="_blank" rel="noreferrer" style={{ ...styles.buttonMini, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }} title="Apri il Gist su GitHub">↗</a>}
            </div>
            <p style={{ ...styles.detail, fontSize: 11, marginTop: 0, marginBottom: 16 }}>
              Il Gist ID lo trovi qui dopo il primo salvataggio (o nell'URL del gist su github.com/…). Copialo con 📋 e incollalo sull'altro dispositivo, poi premi «Carica da Cloud».
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button style={{ ...styles.buttonPrimary, flex: 1 }} onClick={() => salvaSuCloud(false)}>⬆️ Salva ora</button>
              <button style={{ ...styles.button, flex: 1, borderColor: C.green, color: C.green }} onClick={caricaDaCloud}>⬇️ Carica da Cloud</button>
            </div>

            {/* Auto-salvataggio: quando attivo, ogni modifica va sul cloud da sola */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => { setAutoSync(e.target.checked); localStorage.setItem('scheda-interattiva:auto-sync', e.target.checked ? 'on' : 'off'); }}
              />
              <span style={styles.detail}>
                <strong>Salvataggio automatico</strong> — sincronizza da solo a ogni modifica
                {ultimoSync && <><br />Ultimo salvataggio: {ultimoSync}{sincronizzando ? ' · salvo…' : ''}</>}
              </span>
            </label>

            {cloudStatus.text && (
              <div style={{ padding: 10, borderRadius: 6, background: cloudStatus.type === 'error' ? 'rgba(255,0,0,0.1)' : cloudStatus.type === 'success' ? 'rgba(0,255,0,0.1)' : 'rgba(255,255,255,0.05)', color: cloudStatus.type === 'error' ? C.red : cloudStatus.type === 'success' ? C.green : C.goldDark, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
                {cloudStatus.text}
              </div>
            )}

            {/* Import da PDF con l'IA — funzione avanzata, sotto la sincronizzazione Cloud */}
            <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 4, paddingTop: 12, marginBottom: 12 }}>
              <label style={{ ...styles.detail, display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Importa una scheda da PDF (IA)</label>
              <input ref={pdfRef} type="file" accept="application/pdf,.pdf" style={{ display: 'none' }} onChange={transcribePdf} />
              <button
                style={{ ...styles.button, width: '100%' }}
                onClick={() => pdfRef.current?.click()}
                disabled={pdfStato === 'loading'}
                title="Trasforma un PDF di scheda D&D in personaggio, con l'IA (richiede endpoint configurato)"
              >
                {pdfStato === 'loading' ? '🤖 Leggo il PDF…' : '🤖 Importa da PDF (IA)'}
              </button>
              <details style={{ marginTop: 8 }}>
                <summary style={{ ...styles.detail, cursor: 'pointer' }}>⚙️ Configura import da PDF (IA)</summary>
                <p style={{ ...styles.detail, marginTop: 6 }}>
                  L'import da PDF usa l'IA e richiede un piccolo servizio con la tua
                  chiave API (un <strong>Cloudflare Worker</strong> gratuito). Incolla
                  qui l'URL del Worker; istruzioni nel file <code>worker/LEGGIMI.md</code> del progetto.
                </p>
                <input
                  type="url"
                  value={transcribeUrl}
                  onChange={(e) => setTranscribeUrl(e.target.value)}
                  placeholder="https://il-tuo-worker.workers.dev"
                  style={{ ...styles.inlineInput, width: '100%', maxWidth: 420, padding: '6px 8px' }}
                />
              </details>
              {erroreImport && <div style={{ color: C.red, marginTop: 8, fontSize: 13 }}>{erroreImport}</div>}
            </div>

            <button style={{ ...styles.button, width: '100%' }} onClick={() => setMostraCloud(false)}>Chiudi</button>
          </div>
        </div>
      )}

      {mostraPrivilegi && (() => {
        const liv = Math.max(1, Math.min(20, scheda.livello || 1));
        const subLiv = sottoclasseLivPer(versione)[chiaveClasse(scheda.classe)] || [];
        // Costruisce la lista ordinata dei privilegi di classe per livello 1→20.
        const righe = [];
        for (let L = 1; L <= 20; L++) {
          const feat = L === 1 ? privilegiClasseL1(scheda.classe, versione) : privilegiClasseLivello(scheda.classe, L, versione);
          const asi = asiAlLivello(scheda.classe, L);
          const sub = subLiv.includes(L);
          if (feat || asi || sub) righe.push({ L, feat, asi, sub, futuro: L > liv });
        }
        return (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1003, padding: 16, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={(e) => { if (e.target === e.currentTarget) setMostraPrivilegi(false); }}
          >
            <div style={{ ...styles.panel, maxWidth: 520, width: '100%', maxHeight: '88vh', overflowY: 'auto' }}>
              <h1 style={{ ...styles.title, textAlign: 'center', marginBottom: 4 }}>📖 Panoramica privilegi</h1>
              <div style={{ textAlign: 'center', ...styles.detail, marginBottom: 12 }}>
                {scheda.classe || '—'}{scheda.sottoclasse ? ` · ${scheda.sottoclasse}` : ''} · Liv. {liv} · {versione === '2024' ? 'D&D 5.5' : 'D&D 5.0'}
              </div>
              {righe.length === 0 && <p style={styles.detail}>Nessun privilegio da mostrare per questa classe.</p>}
              {righe.map(({ L, feat, asi, sub, futuro }) => (
                <div key={L} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: `1px solid ${C.border}`, opacity: futuro ? 0.5 : 1 }}>
                  <div style={{ flexShrink: 0, width: 44, fontWeight: 'bold', color: futuro ? C.inkDim : C.goldDark }}>
                    Liv {L}
                  </div>
                  <div style={{ flex: 1, fontSize: 13 }}>
                    {feat && feat.split('\n').map((r, i) => {
                      const sp = spiegaPrivilegio(r);
                      return (
                        <div key={i}>
                          • {sp ? (
                            <span
                              style={{ cursor: 'help', textDecoration: 'underline dotted', textUnderlineOffset: 3 }}
                              title="Tocca per la spiegazione"
                              onClick={() => setInfo({ titolo: r, testo: sp })}
                            >{r}</span>
                          ) : r}
                        </div>
                      );
                    })}
                    {sub && <div style={{ color: C.green }}>🌟 Privilegio di sottoclasse{scheda.sottoclasse ? ` (${scheda.sottoclasse})` : ''}</div>}
                    {asi && <div style={{ color: C.inkDim }}>🎯 Aumento di Caratteristica o Talento</div>}
                    {futuro && <span style={{ ...styles.detail, fontStyle: 'italic' }}>— non ancora raggiunto</span>}
                  </div>
                </div>
              ))}
              <p style={{ ...styles.detail, marginTop: 10, fontSize: 11 }}>
                🌟 = la tua sottoclasse guadagna un privilegio (scrivine il testo nella sezione «Privilegi di sottoclasse»). I nomi sono riassunti indicativi.
              </p>
              <button style={{ ...styles.button, width: '100%', marginTop: 6 }} onClick={() => setMostraPrivilegi(false)}>Chiudi</button>
            </div>
          </div>
        );
      })()}

      {mostraLevelUp && (() => {
        // --- Anteprima di TUTTO ciò che cambia salendo di livello ---
        const nuovoLivello = (scheda.livello || 1) + 1;
        const gain = levelUpBozza.metodo === 'media'
          ? (levelUpBozza.hpGainMedia || 0)
          : (levelUpBozza.tiroFatto > 0 ? Math.max(1, levelUpBozza.tiroFatto + levelUpBozza.modCos) : null);
        const bcVecchio = scheda.bonusCompetenza;
        const bcNuovo = bonusCompetenzaDaLivello(nuovoLivello);
        const slotNuovi = slotDaClasseLivello(scheda.classe, nuovoLivello); // null se non incantatore
        const slotStr = slotNuovi
          ? Object.keys(slotNuovi).filter((l) => slotNuovi[l].totale > 0).map((l) => `${l}° ×${slotNuovi[l].totale}`).join(' · ')
          : null;
        // Quanti trucchetti/incantesimi in più si conoscono salendo di livello,
        // e qual è il nuovo livello di incantesimo massimo sbloccato.
        const trOld = trucchettiMax(scheda.classe, scheda.livello);
        const trNew = trucchettiMax(scheda.classe, nuovoLivello);
        const nuoviTrucchetti = (trOld != null && trNew != null) ? Math.max(0, trNew - trOld) : 0;
        const incOld = incantesimiMaxAuto(scheda, versione);
        const incNew = incantesimiMaxAuto({ ...scheda, livello: nuovoLivello }, versione);
        const nuoviIncantesimi = (incOld != null && incNew != null) ? Math.max(0, incNew - incOld) : 0;
        const slotVecchi = slotDaClasseLivello(scheda.classe, scheda.livello);
        const maxLivSlot = (obj) => obj ? Math.max(0, ...Object.keys(obj).filter((l) => obj[l].totale > 0).map(Number)) : 0;
        const nuovoLivInc = slotNuovi && maxLivSlot(slotNuovi) > maxLivSlot(slotVecchi) ? maxLivSlot(slotNuovi) : 0;
        const privNuoviTutti = privilegiClasseLivello(scheda.classe, nuovoLivello, versione);
        // Non ripetere righe già presenti nei privilegi attuali.
        const attualiPriv = (scheda.privilegi || '');
        const privNuovi = privNuoviTutti
          ? privNuoviTutti.split('\n').filter((r) => r.trim() && !attualiPriv.includes(r.trim())).join('\n')
          : '';
        const haASI = asiAlLivello(scheda.classe, nuovoLivello);
        const haSub = sottoclasseAlLivello(scheda.classe, nuovoLivello, versione);
        // A questo livello si SCEGLIE la sottoclasse (il primo livello di sottoclasse)?
        const scelteSub = sottoclassiPerClasse(scheda.classe);
        const mostraSceltaSub = nuovoLivello === livelloSceltaSottoclasse(scheda.classe, versione) && scelteSub.length > 0;
        // Privilegi di sottoclasse guadagnati a QUESTO livello (dai dati 2024).
        // Al livello di scelta usiamo la sottoclasse selezionata nel modale.
        const subSel = mostraSceltaSub ? (levelUpBozza.sottoclasse || '') : (scheda.sottoclasse || '');
        const subTab = SUBCLASS_PRIVILEGI[subSel];
        const attualiSub = (scheda.privilegiSottoclasse || '');
        const subPrivNuovi = subTab && subTab[nuovoLivello]
          ? subTab[nuovoLivello].split('\n').filter((r) => r.trim() && !attualiSub.includes(r.trim())).join('\n')
          : '';
        // Le scelte interattive sono complete? (per abilitare la conferma)
        const asiCompleto = !haASI
          || (levelUpBozza.asiMode === 'talento'
            ? !!(levelUpBozza.talento || '').trim()
            : !!(levelUpBozza.asiA && levelUpBozza.asiB));
        const hpOk = !(levelUpBozza.metodo === 'tiro' && !levelUpBozza.tiroFatto);
        const rigaCambio = { display: 'flex', justifyContent: 'space-between', gap: 8, padding: '3px 0', borderBottom: `1px solid ${C.border}` };
        return (
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
              Da livello <strong>{scheda.livello || 1}</strong> a livello <strong>{nuovoLivello}</strong>
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

            {/* Scelta della SOTTOCLASSE (solo al livello in cui si sceglie) */}
            {mostraSceltaSub && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ ...styles.detail, display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                  🌟 Sottoclasse — scegli la tua specializzazione
                </label>
                <select
                  style={{ ...styles.inlineInput, width: '100%', padding: '6px 8px', fontSize: 15 }}
                  value={levelUpBozza.sottoclasse || ''}
                  onChange={(e) => setLevelUpBozza((b) => ({ ...b, sottoclasse: e.target.value }))}
                >
                  <option value="">Scegli…</option>
                  {scelteSub.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            )}

            {/* Scelta AUMENTO CARATTERISTICHE / TALENTO */}
            {haASI && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ ...styles.detail, display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                  🎯 Aumento di Caratteristica o Talento
                </label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {[['aumento', 'Aumento caratteristiche'], ['talento', 'Talento']].map(([m, lab]) => (
                    <button key={m} style={{ ...styles.modeButton(levelUpBozza.asiMode === m), fontSize: 12, padding: '4px 10px' }}
                      onClick={() => setLevelUpBozza((b) => ({ ...b, asiMode: m }))}>{lab}</button>
                  ))}
                </div>
                {levelUpBozza.asiMode === 'talento' ? (
                  <>
                    <select
                      style={{ ...styles.inlineInput, width: '100%', padding: '6px 8px', fontSize: 14 }}
                      value={TALENTI_NOMI.includes(levelUpBozza.talento) ? levelUpBozza.talento : (levelUpBozza.talento ? '__altro' : '')}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLevelUpBozza((b) => ({ ...b, talento: v === '__altro' ? '' : v }));
                      }}
                    >
                      <option value="">Scegli un talento…</option>
                      {TALENTI_NOMI.map((t) => <option key={t} value={t}>{t}</option>)}
                      <option value="__altro">Altro (scrivi a mano)…</option>
                    </select>
                    {!TALENTI_NOMI.includes(levelUpBozza.talento) && (
                      <input
                        style={{ ...styles.inlineInput, width: '100%', padding: '6px 8px', fontSize: 14, marginTop: 6 }}
                        placeholder="Nome del talento"
                        value={levelUpBozza.talento || ''}
                        onChange={(e) => setLevelUpBozza((b) => ({ ...b, talento: e.target.value }))}
                      />
                    )}
                    {spiegaTalento(levelUpBozza.talento) && (
                      <div style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', fontSize: 12, lineHeight: 1.4, marginTop: 6 }}>{spiegaTalento(levelUpBozza.talento)}</div>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {['asiA', 'asiB'].map((campo) => (
                      <label key={campo} style={{ ...styles.detail, fontSize: 12 }}>
                        <span style={{ display: 'block', marginBottom: 2 }}>+1 a…</span>
                        <select
                          style={{ ...styles.inlineInput, width: '100%', fontSize: 13, padding: '4px 6px' }}
                          value={levelUpBozza[campo] || ''}
                          onChange={(e) => setLevelUpBozza((b) => ({ ...b, [campo]: e.target.value }))}
                        >
                          <option value="">—</option>
                          {CARATTERISTICHE.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
                        </select>
                      </label>
                    ))}
                    <div style={{ gridColumn: '1 / -1', ...styles.detail, fontSize: 11, color: C.inkDim }}>
                      Stessa caratteristica due volte = +2; due diverse = +1 ciascuna (massimo 20).
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Riepilogo: cosa cambia salendo di livello */}
            <div style={{ ...styles.panelSoft || {}, background: 'rgba(0,0,0,0.03)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 13 }}>
              <div style={{ fontWeight: 'bold', color: C.goldDark, marginBottom: 6 }}>📋 Cosa cambia</div>
              <div style={rigaCambio}><span>Punti Ferita massimi</span><strong>{gain != null ? `+${gain}` : '—'}</strong></div>
              <div style={rigaCambio}><span>Dadi vita</span><strong>{nuovoLivello}d{levelUpBozza.facceDV}</strong></div>
              {bcNuovo !== bcVecchio && (
                <div style={rigaCambio}><span>Bonus competenza</span><strong>{conSegno(bcVecchio)} → {conSegno(bcNuovo)} ⬆️</strong></div>
              )}
              {slotStr && (
                <div style={{ padding: '3px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div>Slot incantesimo (totali al {nuovoLivello}° liv.)</div>
                  <div style={{ color: C.inkDim, marginTop: 2 }}>{slotStr}</div>
                  {nuovoLivInc > 0 && <div style={{ color: C.green, marginTop: 2 }}>✨ Sblocchi gli incantesimi di {nuovoLivInc}° livello!</div>}
                </div>
              )}
              {(nuoviTrucchetti > 0 || nuoviIncantesimi > 0) && (
                <div style={{ padding: '3px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div>Nuovi incantesimi da imparare</div>
                  {nuoviTrucchetti > 0 && <div style={{ color: C.green, marginTop: 2 }}>• {nuoviTrucchetti} trucchetto{nuoviTrucchetti > 1 ? 'i' : ''} in più (livello 0)</div>}
                  {nuoviIncantesimi > 0 && <div style={{ color: C.green, marginTop: 2 }}>• {nuoviIncantesimi} incantesimo{nuoviIncantesimi > 1 ? ' in più' : ' in più'} da preparare/conoscere</div>}
                  <div style={{ ...styles.detail, fontSize: 11, color: C.inkDim, marginTop: 2 }}>Aggiungili poi nella sezione Incantesimi.</div>
                </div>
              )}
              {privNuovi && (
                <div style={{ padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ marginBottom: 2 }}>Nuovi privilegi di classe</div>
                  {privNuovi.split('\n').map((r, i) => <div key={i} style={{ color: C.green }}>• {r}</div>)}
                </div>
              )}
              {mostraSceltaSub && (
                <div style={rigaCambio}><span>Sottoclasse</span><strong>{levelUpBozza.sottoclasse || '— da scegliere'}</strong></div>
              )}
              {subPrivNuovi ? (
                <div style={{ padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ marginBottom: 2 }}>Nuovi privilegi di sottoclasse</div>
                  {subPrivNuovi.split('\n').map((r, i) => <div key={i} style={{ color: C.green }}>• {r}</div>)}
                </div>
              ) : haSub && !mostraSceltaSub ? (
                <div style={{ padding: '5px 0', color: C.inkDim }}>🌟 La tua sottoclasse guadagna un nuovo privilegio (aggiungilo a mano nei Privilegi di sottoclasse).</div>
              ) : null}
              {haASI && (
                <div style={rigaCambio}>
                  <span>Aumento / Talento</span>
                  <strong>{levelUpBozza.asiMode === 'talento'
                    ? ((levelUpBozza.talento || '').trim() || '— talento da indicare')
                    : ((levelUpBozza.asiA || levelUpBozza.asiB)
                      ? [levelUpBozza.asiA, levelUpBozza.asiB].filter(Boolean).map((k) => CARATTERISTICHE.find((c) => c.key === k)?.label).join(', ')
                      : '— da scegliere')}</strong>
                </div>
              )}
              {!slotStr && !privNuovi && !subPrivNuovi && !haSub && !haASI && !mostraSceltaSub && !nuoviTrucchetti && !nuoviIncantesimi && (
                <div style={{ padding: '3px 0', color: C.inkDim }}>Nessun altro cambiamento automatico a questo livello.</div>
              )}
            </div>

            <button
              style={{ ...styles.buttonPrimary, width: '100%', marginBottom: 12 }}
              disabled={!hpOk || !asiCompleto}
              onClick={() => {
                const g = levelUpBozza.metodo === 'media' ? levelUpBozza.hpGainMedia : Math.max(1, levelUpBozza.tiroFatto + levelUpBozza.modCos);
                const dvAttuale = String(scheda.dadiVita || '').split('d')[1] || String(levelUpBozza.facceDV) || '8';
                const patch = {
                  livello: nuovoLivello,
                  pfMax: scheda.pfMax + g,
                  pfAttuali: scheda.pfAttuali + g, // Cura automatica dei PF appena guadagnati
                  dadiVita: `${nuovoLivello}d${dvAttuale}`, // Aggiorna formula dadi vita totali
                  bonusCompetenza: bcNuovo,
                };
                // Slot incantesimo aggiornati (e ricaricati) secondo la tabella della classe
                if (slotNuovi) patch.slotIncantesimo = { ...scheda.slotIncantesimo, ...slotNuovi };
                // Appende i nuovi privilegi di classe (senza duplicare le righe)
                if (privNuovi) patch.privilegi = attualiPriv.trim() ? `${attualiPriv.trim()}\n${privNuovi}` : privNuovi;
                // Sottoclasse scelta (solo al livello di scelta)
                if (mostraSceltaSub && levelUpBozza.sottoclasse) patch.sottoclasse = levelUpBozza.sottoclasse;
                // Appende i nuovi privilegi di sottoclasse guadagnati a questo livello
                if (subPrivNuovi) patch.privilegiSottoclasse = attualiSub.trim() ? `${attualiSub.trim()}\n${subPrivNuovi}` : subPrivNuovi;
                // Aumento di Caratteristica o Talento
                if (haASI) {
                  if (levelUpBozza.asiMode === 'talento') {
                    const t = (levelUpBozza.talento || '').trim();
                    if (t) patch.talenti = (scheda.talenti || '').trim() ? `${(scheda.talenti || '').trim()}\n${t}` : t;
                  } else {
                    const nuoveCar = { ...scheda.caratteristiche };
                    [levelUpBozza.asiA, levelUpBozza.asiB].forEach((k) => {
                      if (k) nuoveCar[k] = Math.min(20, (nuoveCar[k] || 10) + 1);
                    });
                    patch.caratteristiche = nuoveCar;
                  }
                }
                aggiorna(patch);
                setMostraLevelUp(false);
              }}
            >
              🚀 Conferma Level Up
            </button>
            <button style={{ ...styles.button, width: '100%' }} onClick={() => setMostraLevelUp(false)}>Annulla</button>
          </div>
        </div>
        );
      })()}

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
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <input style={{ ...stileSelect, flex: 1, marginBottom: 0 }} value={bozzaCrea.nome} placeholder="Nome del personaggio" onChange={(e) => setB({ nome: e.target.value })} />
                <button style={styles.buttonMini} title="Genera un nome fantasy coerente con la specie" onClick={() => setB({ nome: nomeCasuale(bozzaCrea.specie) })}>🎲</button>
              </div>

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>{regoleVersione === '2024' ? 'Specie' : 'Razza'}</label>
              <select style={{ ...stileSelect, marginBottom: bozzaCrea.specie ? 4 : 12 }} value={bozzaCrea.specie} onChange={(e) => setB({ specie: e.target.value, competenzeSpecie: [] })}>
                <option value="">Scegli…</option>
                {Object.entries(SPECIE_5E).map(([g, opts]) => (
                  <optgroup key={g} label={g}>
                    {opts.map((n) => <option key={n} value={n}>{n}</option>)}
                  </optgroup>
                ))}
              </select>
              {bozzaCrea.specie && (() => {
                const d = datiSpecieDi(bozzaCrea.specie);
                return (
                  <div style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', marginBottom: 12, fontSize: 11, lineHeight: 1.5 }}>
                    {d && <div>🏃 Velocità {d.velocita} m · 📏 {d.taglia}{d.sensi ? ` · 👁 ${d.sensi}` : ''}</div>}
                    {d && <div>✨ Tratti: {d.tratti}</div>}
                    <div style={{ color: C.inkDim }}>
                      💪 Bonus di caratteristica: {regoleVersione === '2024' ? 'dal background (nella 5.5 non dalla specie)' : 'assegnati dalla razza'}
                    </div>
                  </div>
                );
              })()}

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>Classe</label>
              <select style={{ ...stileSelect, marginBottom: 12 }} value={bozzaCrea.classe} onChange={(e) => setB({ classe: e.target.value, competenzeClasse: [] })}>
                <option value="">Scegli…</option>
                {NOMI_CLASSI.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>Background</label>
              <select style={{ ...stileSelect, marginBottom: 6 }} value={bozzaCrea.background} onChange={(e) => setB({ background: e.target.value })}>
                <option value="">Scegli…</option>
                {BACKGROUND_5E.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              {bozzaCrea.background && (
                <div style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', marginBottom: 12, fontSize: 11, lineHeight: 1.5 }}>
                  <div>🎓 Competenze: {(BACKGROUND_COMPETENZE[bozzaCrea.background] || []).map((k) => ABILITA.find((a) => a.key === k)?.label).join(', ') || '—'}</div>
                  {regoleVersione === '2024' && bonusBg.length > 0 && (
                    <div>💪 Caratteristiche: +2 {bonusBg[0]?.slice(0, 3).toUpperCase()}, +1 {bonusBg[1]?.slice(0, 3).toUpperCase()} (a scelta: +1 a tre diverse)</div>
                  )}
                </div>
              )}

              {/* Competenze di classe: scelta dell'utente (diventano ★ nella scheda) */}
              {(() => {
                const cc = competenzeClasseDi(bozzaCrea.classe);
                if (!cc) return null;
                const scelte = bozzaCrea.competenzeClasse || [];
                const bgSkills = BACKGROUND_COMPETENZE[bozzaCrea.background] || [];
                const pieno = scelte.length >= cc.numero;
                const toggle = (k) => {
                  if (scelte.includes(k)) setB({ competenzeClasse: scelte.filter((x) => x !== k) });
                  else if (!pieno) setB({ competenzeClasse: [...scelte, k] });
                };
                return (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ ...styles.detail, display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                      Competenze di classe — scegli {cc.numero} <span style={{ fontWeight: 'normal', color: pieno ? C.green : C.inkDim }}>({scelte.length}/{cc.numero})</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {cc.lista.map((k) => {
                        const lab = ABILITA.find((a) => a.key === k)?.label || k;
                        const sel = scelte.includes(k);
                        const daBg = bgSkills.includes(k);
                        return (
                          <button
                            key={k}
                            disabled={daBg || (!sel && pieno)}
                            onClick={() => toggle(k)}
                            style={{ ...styles.modeButton(sel), fontSize: 11, padding: '3px 8px', opacity: daBg ? 0.45 : 1 }}
                            title={daBg ? 'Già concessa dal background' : (!sel && pieno ? `Hai già scelto ${cc.numero} competenze` : 'Click per scegliere')}
                          >
                            {sel ? '★ ' : ''}{lab}{daBg ? ' (bg)' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Competenza concessa dalla specie (es. Elfo · Sensi Acuti): diventa ★ */}
              {(() => {
                const cs = competenzeSpecieDi(bozzaCrea.specie);
                if (!cs) return null;
                const scelte = bozzaCrea.competenzeSpecie || [];
                const pieno = scelte.length >= cs.numero;
                const toggle = (k) => {
                  if (scelte.includes(k)) setB({ competenzeSpecie: scelte.filter((x) => x !== k) });
                  else if (!pieno) setB({ competenzeSpecie: [...scelte, k] });
                };
                return (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ ...styles.detail, display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                      Competenza di specie · {cs.tratto} — scegli {cs.numero} <span style={{ fontWeight: 'normal', color: pieno ? C.green : C.inkDim }}>({scelte.length}/{cs.numero})</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {cs.lista.map((k) => {
                        const lab = ABILITA.find((a) => a.key === k)?.label || k;
                        const sel = scelte.includes(k);
                        return (
                          <button key={k} disabled={!sel && pieno} onClick={() => toggle(k)}
                            style={{ ...styles.modeButton(sel), fontSize: 11, padding: '3px 8px' }}>
                            {sel ? '★ ' : ''}{lab}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <label style={{ ...styles.detail, display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Caratteristiche</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {[['auto', '🎲 Tira e assegna'], ['assegna', '🎲 Tira e scelgo io'], ['manuale', '✍️ A mano']].map(([m, etichetta]) => (
                  <button
                    key={m}
                    style={{ ...styles.modeButton(bozzaCrea.metodo === m), fontSize: 12, padding: '4px 10px' }}
                    onClick={() => setB({ metodo: m, pool: m === 'assegna' ? bozzaCrea.pool : null, assegna: {} })}
                  >
                    {etichetta}
                  </button>
                ))}
              </div>
              {bozzaCrea.metodo === 'auto' && (
                <div style={{ ...styles.detail, fontSize: 11, marginBottom: 16 }}>
                  Tira 4d6 (scarta il più basso) e mette il valore più alto sulla caratteristica chiave della classe.
                </div>
              )}
              {bozzaCrea.metodo === 'manuale' && (
                <div style={{ ...styles.detail, fontSize: 11, marginBottom: 16 }}>
                  Le caratteristiche partono da 10: le imposti tu sulla scheda (o tiri i dadi fisicamente).
                </div>
              )}
              {bozzaCrea.metodo === 'assegna' && (
                <div style={{ marginBottom: 16 }}>
                  <button
                    style={{ ...styles.button, marginBottom: 8 }}
                    onClick={() => setB({ pool: Array.from({ length: 6 }, tira4d6ScartaMinimo).sort((a, b) => b - a), assegna: {} })}
                  >
                    🎲 {bozzaCrea.pool ? 'Ritira i valori' : 'Tira i 6 valori'}
                  </button>
                  {bozzaCrea.pool && (
                    <>
                      <div style={{ ...styles.detail, fontSize: 11, marginBottom: 6 }}>
                        Valori tirati: <strong>{bozzaCrea.pool.join(', ')}</strong>. Assegna ognuno a una caratteristica:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                        {CARATTERISTICHE.map(({ key, label }) => {
                          const usatiAltrove = Object.entries(bozzaCrea.assegna).filter(([k]) => k !== key).map(([, idx]) => idx);
                          return (
                            <label key={key} style={{ ...styles.detail, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                              <span style={{ width: 66 }}>{label}</span>
                              <select
                                value={bozzaCrea.assegna[key] ?? ''}
                                onChange={(e) => setB({ assegna: { ...bozzaCrea.assegna, [key]: e.target.value === '' ? undefined : Number(e.target.value) } })}
                                style={{ ...styles.inlineInput, fontSize: 12, padding: '2px 4px', flex: 1 }}
                              >
                                <option value="">—</option>
                                {bozzaCrea.pool.map((v, i) => (
                                  <option key={i} value={i} disabled={usatiAltrove.includes(i)}>{v}</option>
                                ))}
                              </select>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {bozzaCrea.classe && (
                <div style={{ marginTop: 4, marginBottom: 8 }}>
                  <label style={{ ...styles.detail, display: 'block', marginBottom: 4, fontWeight: 'bold' }}>🎒 Equipaggiamento iniziale</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[['pacchetto', 'Dotazione della classe'], ['oro', `Oro iniziale (${ORO_INIZIALE[chiaveClasse(bozzaCrea.classe)] || 0} mo)`]].map(([m, lab]) => (
                      <button
                        key={m}
                        style={{ ...styles.modeButton(bozzaCrea.dotazione === m), fontSize: 12, padding: '5px 10px', flex: 1 }}
                        onClick={() => setB({ dotazione: m })}
                      >
                        {lab}
                      </button>
                    ))}
                  </div>
                  <div style={{ ...styles.detail, fontSize: 11, color: C.inkDim, marginTop: 3 }}>
                    {bozzaCrea.dotazione === 'oro'
                      ? 'Parti con solo oro per comprarti l’equipaggiamento (armi/armatura da impostare a mano).'
                      : 'Parti con armi, armatura e oggetti già pronti (consigliato).'}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ ...styles.buttonPrimary, flex: 1 }} onClick={() => creaPersonaggio(bozzaCrea)}>Crea personaggio</button>
                <button style={styles.button} onClick={() => setMostraCrea(false)}>Annulla</button>
              </div>
            </div>
          </div>
        );
      })()}

      <header className="app-header" style={styles.header}>
        <div className="app-header-group" style={{ display: 'flex', gap: 6 }}>
          <button
            style={styles.modeButton(false)}
            title="Menu iniziale: nuovo personaggio, carica"
            onClick={() => setMostraMenu(true)}
          >
            🏠 Menu
          </button>
          <button
            style={{ ...styles.modeButton(mostraCloud), color: C.goldDark, borderColor: C.goldDark }}
            title={githubToken && gistId ? (autoSync ? `Cloud: salvataggio automatico attivo${ultimoSync ? ` · ultimo ${ultimoSync}` : ''}` : 'Cloud configurato (auto-salvataggio spento)') : 'Sincronizza i tuoi personaggi sul Cloud GitHub'}
            onClick={() => { setCloudStatus({ text: '', type: '' }); setMostraCloud(true); }}
          >
            ☁️ Cloud{sincronizzando ? ' …' : (githubToken && gistId && autoSync ? ' ✓' : '')}
          </button>
          <input ref={jsonRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={importaJson} />
          <button
            style={styles.modeButton(false)}
            title="Esporta la scheda come file JSON (backup o trasferimento)"
            onClick={esportaJson}
          >
            💾 Esporta
          </button>
          <button
            style={styles.modeButton(false)}
            title="Importa una scheda da file JSON (crea un nuovo personaggio)"
            onClick={() => jsonRef.current?.click()}
          >
            📂 Importa
          </button>
        </div>

        <h1 className="app-header-title" style={{ ...styles.title, margin: 0 }}>
          <span style={{ position: 'relative' }}>
            Tavolo dei Dadi
            <span style={{ position: 'absolute', left: '100%', bottom: 3, marginLeft: 6, fontSize: 11, color: C.inkDim, fontWeight: 'normal', letterSpacing: 0.5 }}>v{APP_VERSION}</span>
          </span>
        </h1>

        <div className="app-header-group" style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button
            className={nuovaVersione && !aggiornando ? 'aggiorna-pronto' : undefined}
            style={styles.modeButton(false)}
            title={nuovaVersione ? 'È disponibile una nuova versione: click per aggiornare' : 'Aggiorna l’app: svuota la cache e ricarica l’ultima versione'}
            onClick={forzaAggiornamento}
            disabled={aggiornando}
          >
            {aggiornando ? '… Aggiorno' : nuovaVersione ? '🔄 Aggiorna!' : '🔄 Aggiorna'}
          </button>
          <button
            style={styles.modeButton(false)}
            title="Tema: Auto diventa scuro di notte o se il sistema è in modalità scura. I colori della scheda seguono la classe del personaggio."
            onClick={() => setTema(tema === 'auto' ? 'chiaro' : tema === 'chiaro' ? 'scuro' : 'auto')}
          >
            {tema === 'auto' ? '🌗 Auto' : tema === 'chiaro' ? '☀️ Chiaro' : '🌙 Scuro'}
          </button>
        </div>
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
        <section className="selettore-personaggio" style={{ ...styles.panel, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '6px 12px' }}>
          {rinominando ? (
            <input
              autoFocus
              style={{ ...styles.inlineInput, flex: '1 1 180px', minWidth: 150, fontSize: 16, fontWeight: 'bold', color: 'var(--c-title)' }}
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
            <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 150, display: 'flex' }}>
              <select
                style={{ ...styles.inlineInput, flex: 1, minWidth: 0, fontSize: 16, fontWeight: 'bold', color: 'var(--c-title)', padding: '5px 34px 5px 8px' }}
                value={roster.attivo}
                onChange={(e) => setRoster((r) => ({ ...r, attivo: e.target.value }))}
                title="Personaggio attivo — scegli per cambiare al volo"
              >
                {Object.entries(roster.personaggi).map(([id, p]) => (
                  <option key={id} value={id}>
                    {p.nome || 'Senza nome'}{p.classe ? ` · ${p.classe}` : ''} · Liv. {p.livello || 1}
                  </option>
                ))}
              </select>
              <span
                aria-hidden
                style={{
                  position: 'absolute', right: 30, top: '50%', transform: 'translateY(-50%)',
                  fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontWeight: 'bold',
                  fontSize: 30, letterSpacing: 1, lineHeight: 1,
                  color: C.inkDim, opacity: 0.28, pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
                }}
              >
                {(scheda.versione || '2024') === '2024' ? '5.5' : '5.0'}
              </span>
            </div>
          )}

          {/* Livello + pulsanti: un unico gruppo con spaziatura uniforme, va a
              capo insieme sotto il selettore invece di sbordare */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
            <button
              style={styles.buttonMini}
              title="Assistente al Passaggio di Livello"
              onClick={() => {
                const dvMatch = String(scheda.dadiVita || '').match(/d(\d+)/i);
                const facceDV = dvMatch ? parseInt(dvMatch[1]) : 8;
                const modCos = modificatore(scheda.caratteristiche?.costituzione || 10) || 0;
                const avgHpGain = Math.floor(facceDV / 2) + 1 + modCos;
                setLevelUpBozza({
                  metodo: 'media', hpGainMedia: Math.max(1, avgHpGain), facceDV, modCos, tiroFatto: 0,
                  asiMode: 'aumento', asiA: '', asiB: '', talento: '',
                  sottoclasse: scheda.sottoclasse || '',
                });
                setMostraLevelUp(true);
              }}
            >
              ⬆️
            </button>
            <button style={styles.buttonMini} onClick={() => setRinominando(!rinominando)} title="Rinomina il personaggio">✎</button>
            <button style={styles.buttonMini} onClick={() => { setBozzaCrea({ nome: '', classe: '', specie: '', background: '', metodo: 'auto', pool: null, assegna: {}, competenzeClasse: [], competenzeSpecie: [], dotazione: 'pacchetto' }); setMostraCrea(true); }} title="Nuovo personaggio">＋</button>
            <button style={styles.buttonMini} onClick={duplicaPersonaggio} title="Duplica il personaggio attivo">⧉</button>
            <button style={styles.buttonMini} onClick={resetScheda} title="Azzera i campi del personaggio attivo">↺</button>
            <button style={{ ...styles.buttonMini, borderColor: C.red, color: C.red }} onClick={eliminaPersonaggio} title="Elimina il personaggio attivo">🗑</button>
          </div>
        </section>

        {/* Testata: anagrafica + riquadri vitali uniformi */}
        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>Profilo</h2>
          <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
            <div style={{ flex: '0 0 160px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '100%', flex: 1, minHeight: 240, borderRadius: 12, overflow: 'hidden',
                  // emblema auto (foto assente o SVG): sfondo col colore classe, si fonde coi bordi
                  background: (!scheda.ritratto || scheda.ritratto.startsWith('data:image/svg')) ? (coloreClasse(scheda.classe)?.chiaro || C.panel) : C.panel,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)', border: `2px solid ${coloreClasse(scheda.classe)?.chiaro || C.border}`,
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
                    onError={(e) => {
                      // offline / DiceBear non raggiungibile → avatar SVG locale
                      if (!e.currentTarget.dataset.fallback) {
                        e.currentTarget.dataset.fallback = '1';
                        e.currentTarget.src = avatarSvgFallback(scheda.classe, scheda.specie, scheda.nome);
                      }
                    }}
                  />
                ) : (
                  // Nessuna foto: mostra l'emblema tematico di classe/specie
                  // (icone game-icons.net), cliccabile per caricare una foto.
                  <div style={{ position: 'relative', width: '100%', height: '100%' }} title="Click: carica l'immagine del personaggio">
                    <img
                      src={generaAvatar(scheda.classe, scheda.specie, scheda.nome)}
                      alt={`Ritratto di ${scheda.nome}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.35)', color: '#fff', fontSize: 9, letterSpacing: 1, textAlign: 'center', padding: '2px 0' }}>RITRATTO</div>
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
                <CampoModulo label={versione === '2024' ? 'Specie' : 'Razza'}>
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
                  {(() => {
                    const livSub = livelloSceltaSottoclasse(scheda.classe, versione);
                    const sbloccata = !scheda.classe || !livSub || (scheda.livello || 1) >= livSub;
                    if (!sbloccata) {
                      return (
                        <div
                          style={{ fontSize: 13, color: C.inkDim, fontStyle: 'italic', padding: '2px 0', cursor: 'not-allowed', userSelect: 'none' }}
                          title={`La sottoclasse si sceglie al ${livSub}° livello: verrà proposta al Level Up.`}
                        >
                          🔒 Dal {livSub}° livello
                        </div>
                      );
                    }
                    return (
                      <CampoTendina
                        value={scheda.sottoclasse}
                        opzioni={sottoclassiPerClasse(scheda.classe)}
                        onChange={(v) => {
                          const patch = { sottoclasse: v };
                          // Riempi in automatico i privilegi di sottoclasse fino al
                          // livello attuale (se abbiamo i dati per questa sottoclasse).
                          const auto = privilegiSottoclasseFinoA(v, scheda.livello || 1);
                          if (auto) patch.privilegiSottoclasse = auto;
                          aggiorna(patch);
                        }}
                        title="Sottoclasse (imposta anche i privilegi di sottoclasse fino al tuo livello)"
                      />
                    );
                  })()}
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
                onChange={(e) => {
                  const tipo = e.target.value;
                  // Blocco: non puoi indossare armature per cui non sei competente.
                  if (!competenteInArmatura(scheda, tipo)) return;
                  // Passando a una categoria con armatura, parti da un valore base
                  // sensato così la CA cambia subito (poi si può correggere a mano).
                  const base = BASE_ARMATURA_DEFAULT[tipo] ?? scheda.armatura.base;
                  aggiorna({ armatura: { ...scheda.armatura, tipo, base } });
                }}
              >
                {TIPI_ARMATURA.map((t) => {
                  const bloccato = !competenteInArmatura(scheda, t.key);
                  return <option key={t.key} value={t.key} disabled={bloccato}>{bloccato ? '🔒 ' : ''}{t.label}</option>;
                })}
              </select>
              <div style={{ fontSize: 10, color: C.inkDim, display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center', marginTop: 'auto', paddingTop: 6, flexWrap: 'wrap' }}>
                {(scheda.armatura.tipo === 'leggera' || scheda.armatura.tipo === 'media' || scheda.armatura.tipo === 'pesante') && (
                  <span title={`CA base dell'armatura. Esempi: ${ESEMPI_ARMATURA[scheda.armatura.tipo]}`}>base <Editable value={scheda.armatura.base} tipo="numero" width={24} onChange={(v) => aggiorna({ armatura: { ...scheda.armatura, base: Math.max(0, v) } })} /></span>
                )}
                {(() => {
                  const scudiOk = !!scheda.addestramento?.armature?.scudi;
                  return (
                    <span
                      className="tirabile"
                      style={{ cursor: scudiOk || scheda.armatura.scudo ? 'pointer' : 'not-allowed', opacity: scudiOk || scheda.armatura.scudo ? 1 : 0.5 }}
                      title={scudiOk ? 'Scudo: +2 alla CA' : 'Non sei competente con gli scudi (attivala in “Addestramento…”)'}
                      onClick={() => {
                        // Blocco: non puoi imbracciare uno scudo senza competenza (ma puoi sempre toglierlo).
                        if (!scudiOk && !scheda.armatura.scudo) return;
                        aggiorna({ armatura: { ...scheda.armatura, scudo: !scheda.armatura.scudo } });
                      }}
                    >
                      <span style={styles.pip(scheda.armatura.scudo, C.goldDark)} /> <span style={{ opacity: scheda.armatura.scudo ? 1 : 0.4 }}>{scudiOk ? '🛡️' : '🔒'}</span>
                    </span>
                  );
                })()}
                <span>+ <Editable value={scheda.armatura.bonus} tipo="numero" width={22} onChange={(v) => aggiorna({ armatura: { ...scheda.armatura, bonus: v } })} /></span>
              </div>
              {(!competenteInArmatura(scheda, scheda.armatura.tipo) || (scheda.armatura.scudo && !scheda.addestramento?.armature?.scudi)) && (
                <div style={{ fontSize: 9, color: C.red, marginTop: 3, lineHeight: 1.2 }} title="Senza competenza: svantaggio a prove, TS e attacchi basati su Forza e Destrezza, e non puoi lanciare incantesimi.">
                  ⚠️ Non competente{!competenteInArmatura(scheda, scheda.armatura.tipo) ? ` (${scheda.armatura.tipo})` : ''}{scheda.armatura.scudo && !scheda.addestramento?.armature?.scudi ? ' (scudo)' : ''}
                </div>
              )}
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
                  {'  Temporanei '}
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
                  <Rollable onRoll={tiraDadoVita} title="Tieni premuto e rilascia: spendi un dado vita per curarti. Il numero di dadi è pari al livello.">
                    <strong style={{ color: C.goldDark }}>{Math.max(1, scheda.livello || 1)}</strong>
                  </Rollable>
                  {' × d'}
                  <strong style={{ color: C.goldDark }} title="Tipo di dado vita: fisso dalla classe (d6 mago/stregone, d8 la maggior parte, d10 guerriero/paladino/ranger, d12 barbaro)">
                    {facceDadoVita(scheda.dadiVita)}
                  </strong>
                  {' · Spesi:'}{' '}
                  <select
                    style={{ ...styles.inlineInput, fontSize: 12, padding: '1px 3px' }}
                    value={Math.min(Math.max(0, scheda.dadiVitaSpesi || 0), Math.max(1, scheda.livello || 1))}
                    onChange={(e) => aggiorna({ dadiVitaSpesi: Number(e.target.value) })}
                    title="Dadi vita spesi: scegli quanti ne hai usati (ne recuperi metà a ogni riposo lungo)"
                  >
                    {Array.from({ length: Math.max(1, scheda.livello || 1) + 1 }, (_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <span style={{ color: C.inkDim }}>/ {Math.max(1, scheda.livello || 1)}</span>
                  <button
                    style={{ ...styles.buttonMini, padding: '2px 8px', color: C.green, borderColor: C.green }}
                    title="Usa un dado vita: tira 1 dado + mod. Costituzione e recupera quei PF"
                    disabled={scheda.dadiVitaSpesi >= Math.max(1, scheda.livello || 1)}
                    onClick={tiraDadoVita}
                  >
                    🎲 Usa
                  </button>
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
            <div style={styles.vitalBox}>
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

            {/* Resistenze — chip rimovibili + tendina */}
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Resistenze</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CampoConTendina
                  value={scheda.resistenze}
                  opzioni={DANNI_5E}
                  onChange={(v) => aggiorna({ resistenze: v })}
                  title="Resistenze ai danni: scegli dalla tendina o scrivi"
                />
              </div>
            </div>

            {/* Vista / Sensi — chip rimovibili + tendina (valore non fisso) */}
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Visione</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CampoConTendina
                  value={scheda.sensi}
                  opzioni={SENSI_5E}
                  onChange={(v) => aggiorna({ sensi: v })}
                  title="Sensi: scegli dalla tendina o scrivi (es. Scurovisione 18 m)"
                />
              </div>
            </div>

            {/* RIGA 3 — Bonus Comp. | Sfinimento | Ispirazione | Condizioni (span 2) */}
            {/* Bonus Competenza */}
            <div style={styles.vitalBox}>
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
                <div style={{ fontSize: 9, color: C.red }} title={versione === '2024' ? 'Regole 2024: −2 ai tiri di d20 per livello' : `Regole 2014: ${SFINIMENTO_2014[scheda.sfinimento]}`}>
                  {versione === '2024' ? `−${scheda.sfinimento * 2}` : SFINIMENTO_2014[scheda.sfinimento]}
                </div>
              )}
            </div>

            {/* Ispirazione — quando è accesa: bordo, stella e scritta tutti dorati.
                Uso un oro fisso (non `--c-gold`, che è tinto col colore classe). */}
            <div style={{
              ...styles.vitalBox,
              border: `1px solid ${scheda.ispirazione ? '#d4af37' : C.border}`,
              background: scheda.ispirazione ? 'rgba(212,175,55,0.16)' : C.panelLight,
              boxShadow: scheda.ispirazione ? '0 0 9px rgba(212,175,55,0.55)' : 'none',
              transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
            }}>
              <div style={{ ...styles.vitalLabel, color: scheda.ispirazione ? '#c8991a' : C.inkDim }}>Ispirazione</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  className="tirabile"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 8px', fontSize: 22, border: 'none', lineHeight: 1,
                    background: 'transparent',
                    color: scheda.ispirazione ? '#d4af37' : C.inkDim,
                    textShadow: scheda.ispirazione ? '0 0 7px rgba(212,175,55,0.7)' : 'none',
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
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                      <div
                        style={{ fontSize: 13, color: C.ink, letterSpacing: 0.8, fontWeight: 'bold', cursor: 'help', textDecoration: 'underline dotted', textUnderlineOffset: 3 }}
                        title="Cosa governa questa caratteristica?"
                        onClick={() => setInfo({ titolo: label, testo: SPIEG_CARATT[key] })}
                      >{label.toUpperCase()}</div>
                      <div style={{ fontSize: 17, fontWeight: 'bold', color: C.goldDark }} title="Punteggio di caratteristica (click per modificare)">
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
                    style={{ ...styles.skillRow(true), opacity: scheda.tiriSalvezza[key] ? 1 : 0.5 }}
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
                        style={{ ...styles.skillRow(true), opacity: liv === 0 ? 0.5 : 1 }}
                        title={`Tieni premuto e rilascia: prova di ${a.label} · click sul pallino: niente → competenza (●) → competenza di classe/razza (★)`}
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
                        <span>{a.label}</span>
                      </Rollable>
                    );
                  })}
                </div>
              );
            })}

            {/* Risorse di classe — compatte, sotto le caratteristiche (Carisma) */}
            <Sezione titolo="Risorse di classe" {...apertoProps('risorse')}>
              {scheda.risorse.length === 0 && (
                <p style={{ ...styles.detail, marginTop: 0, fontSize: 11 }}>
                  Nessuna risorsa. Aggiungi Ki, punti stregoneria, ira, ispirazione bardica, usi dei privilegi…
                </p>
              )}
              {scheda.risorse.map((r) => {
                const modifica = (patch) =>
                  aggiorna({ risorse: scheda.risorse.map((x) => (x.id === r.id ? { ...x, ...patch } : x)) });
                return (
                  <div key={r.id} style={{ marginBottom: 8, fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                      <Editable value={r.nome} onChange={(v) => modifica({ nome: v })} width={110} title="Nome della risorsa" />
                      <button
                        style={{ ...styles.buttonMini, padding: '0 6px', color: C.red }}
                        title="Rimuovi la risorsa"
                        onClick={() => aggiorna({ risorse: scheda.risorse.filter((x) => x.id !== r.id) })}
                      >✕</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
                      <button style={{ ...styles.buttonMini, padding: '1px 7px' }} title="Spendi" onClick={() => modifica({ attuali: Math.max(0, r.attuali - 1) })}>−</button>
                      <strong style={{ minWidth: 16, textAlign: 'center', display: 'inline-block', color: r.attuali === 0 ? C.inkDim : C.ink }}>{r.attuali}</strong>
                      <button style={{ ...styles.buttonMini, padding: '1px 7px' }} title="Recupera" onClick={() => modifica({ attuali: Math.min(r.max, r.attuali + 1) })}>+</button>
                      <span style={styles.detail}>/ <Editable value={r.max} tipo="numero" width={30} onChange={(v) => modifica({ max: Math.max(0, v), attuali: Math.min(Math.max(0, v), r.attuali) })} /></span>
                      <select
                        style={{ ...styles.inlineInput, fontSize: 11, padding: '1px 3px' }}
                        value={r.reset}
                        onChange={(e) => modifica({ reset: e.target.value })}
                        title="Quando si ricarica"
                      >
                        <option value="">manuale</option>
                        <option value="breve">r. breve</option>
                        <option value="lungo">r. lungo</option>
                      </select>
                    </div>
                  </div>
                );
              })}
              <button
                style={{ ...styles.buttonMini, marginTop: 2 }}
                onClick={() =>
                  aggiorna({
                    risorse: [...scheda.risorse, { id: Date.now(), nome: 'Nuova risorsa', attuali: 0, max: 0, reset: 'lungo' }],
                  })
                }
              >
                + Aggiungi risorsa
              </button>
            </Sezione>

            <Sezione titolo="Addestramento" {...propsSez('addestramento')} {...apertoProps('addestramento', false)}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ ...styles.detail, marginBottom: 4 }}>Armature:</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ ...styles.detail, marginBottom: 4 }}>Armi:</div>
                <ListaQuadratini
                  value={scheda.addestramento.armi}
                  opzioni={COMP_ARMI_5E}
                  placeholder="Es. Armi semplici, Spada lunga…"
                  onChange={(v) => aggiorna({ addestramento: { ...scheda.addestramento, armi: v } })}
                />
              </div>
              <div>
                <div style={{ ...styles.detail, marginBottom: 4 }}>Strumenti:</div>
                <ListaQuadratini
                  value={scheda.addestramento.strumenti}
                  opzioni={STRUMENTI_5E}
                  placeholder="Es. Borsa da erborista, Arnesi da scasso…"
                  onChange={(v) => aggiorna({ addestramento: { ...scheda.addestramento, strumenti: v } })}
                />
              </div>
            </Sezione>

            <Sezione titolo="Tratti della specie" {...propsSez('trattiSpecie')} {...apertoProps('trattiSpecie')}>
              <ListaQuadratini
                value={scheda.trattiSpecie}
                lookup={spiegaTratto}
                placeholder="Es. Scurovisione, Astuzia gnomesca, Trance, Fortuna halfling…"
                onChange={(v) => aggiorna({ trattiSpecie: v })}
              />
            </Sezione>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Armi e attacchi — sezione collassabile */}
            <Sezione titolo="Combattimento" style={{ order: -2 }} {...apertoProps('attacchi')}>
              <div style={{ overflowX: 'auto' }}>
                {['Azione', 'Bonus', 'Reazione'].map((cat) => {
                  const arr = scheda.attacchi.filter((a) => (a.categoria || 'Azione') === cat);
                  if (arr.length === 0 && cat !== 'Azione') return null;
                  return (
                    <div key={cat} style={{ marginBottom: 16 }}>
                      {cat !== 'Azione' && (
                        <h3 style={{ fontSize: 13, color: C.inkDim, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${C.border}`, paddingBottom: 4, marginBottom: 8 }}>
                          {cat === 'Bonus' ? 'Azioni Bonus' : 'Reazioni'}
                        </h3>
                      )}
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
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <select
                                      value=""
                                      title="Scegli un'arma standard: compila danno, tipo, proprietà e bonus"
                                      onChange={(e) => {
                                        const arma = ARMI_5E.find((w) => w.nome === e.target.value);
                                        if (arma) aggiornaAttacco(attaccoDaArma(arma, scheda));
                                      }}
                                      style={{ ...styles.inlineInput, appearance: 'none', width: 22, height: 22, padding: 0, textAlign: 'center', cursor: 'pointer', flexShrink: 0 }}
                                    >
                                      <option value="">⚔️</option>
                                      {ARMI_5E.map((w) => <option key={w.nome} value={w.nome}>{w.nome}</option>)}
                                    </select>
                                    <Editable
                                      value={a.nome}
                                      width={130}
                                      onChange={(v) => aggiornaAttacco({ nome: v })}
                                      onRoll={() => lanciaD20(`Attacco: ${a.nome}`, a.bonus, { attacco: a })}
                                    />
                                  </div>
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
                                  {parseEspressioneDado(a.danno) && (
                                    <button
                                      style={{ ...styles.buttonMini, padding: '1px 6px', marginRight: 4 }}
                                      title={`Tira i danni (${a.danno})`}
                                      onClick={() => lanciaDanniDiretti(`Danni: ${a.nome}`, a.danno)}
                                    >🎲</button>
                                  )}
                                  <Editable
                                    value={a.danno}
                                    width={70}
                                    onChange={(v) => aggiornaAttacco({ danno: v })}
                                    title="Click per modificare · 🎲 per tirare i danni"
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
            </Sezione>

            {/* Incantesimi — sezione collassabile */}
            <Sezione titolo="Incantesimi" style={{ order: -1 }} {...apertoProps('incantesimi')}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap', marginBottom: 12 }}>
                <label style={{ ...styles.detail, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
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
                  // i tre riquadri si allargano per riempire lo spazio a destra
                  <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 250 }}>
                    <div style={{ ...styles.vitalBox, flex: 1 }}>
                      <div style={styles.vitalLabel}>Modificatore</div>
                      <div style={styles.vitalValue}>{conSegno(modIncantatore)}</div>
                    </div>
                    <div style={{ ...styles.vitalBox, flex: 1 }}>
                      <div style={styles.vitalLabel}>CD Incantesimi</div>
                      <div style={styles.vitalValue}>{8 + scheda.bonusCompetenza + modIncantatore}</div>
                    </div>
                    <div style={{ ...styles.vitalBox, flex: 1 }}>
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
                  </div>
                )}
              </div>

              {/* Slot incantesimo compatti: totale modificabile, rombi per gli spesi */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ ...styles.detail, marginRight: 2 }}>Slot:</span>
                {(() => {
                  // mostra solo i livelli con slot + il primo vuoto successivo
                  // (niente file di riquadri "0" inutili per chi non li usa)
                  const conSlot = Array.from({ length: 9 }, (_, i) => i + 1)
                    .filter((l) => (scheda.slotIncantesimo[l]?.totale || 0) > 0);
                  const maxLiv = conSlot.length ? Math.max(...conSlot) : 0;
                  return Array.from({ length: Math.min(9, Math.max(1, maxLiv + 1)) }, (_, i) => i + 1);
                })().map((liv) => {
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

              {/* Trucchetti e incantesimi */}
              <h3 style={{ ...styles.panelTitle, fontSize: 15, marginTop: 14 }}>
                Trucchetti e incantesimi
              </h3>
              {(() => {
                return (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                    <input
                      type="search"
                      value={filtroIncantesimo}
                      onChange={(e) => setFiltroIncantesimo(e.target.value)}
                      placeholder="🔍 Cerca incantesimo…"
                      style={{ ...styles.inlineInput, padding: '5px 8px', width: 200 }}
                    />
                    <span style={styles.detail}>Tocca il nome per gli effetti · ✎ modifica · 🗑 elimina</span>
                    {/* Conteggi con massimo modificabile: al limite si bloccano gli "Aggiungi" */}
                    {maxTrucchetti != null && (
                      <span style={{ ...styles.detail, color: trucchettiPieno ? C.goldDark : C.inkDim, fontWeight: trucchettiPieno ? 700 : 400 }} title="Trucchetti conosciuti / massimo (modificabile). Al massimo il tasto Aggiungi si blocca.">
                        Trucchetti <strong>{nTrucchetti}</strong>/<Editable value={maxTrucchetti} tipo="numero" width={24} onChange={(v) => aggiorna({ maxTrucchetti: Math.max(0, v) })} />
                      </span>
                    )}
                    {maxIncantesimi != null && (
                      <span style={{ ...styles.detail, color: incantesimiPieno ? C.goldDark : C.inkDim, fontWeight: incantesimiPieno ? 700 : 400 }} title="Incantesimi (liv. 1+) noti o preparati / massimo (modificabile). Al massimo il tasto Aggiungi si blocca.">
                        Incantesimi <strong>{nIncantesimi}</strong>/<Editable value={maxIncantesimi} tipo="numero" width={24} onChange={(v) => aggiorna({ maxIncantesimi: Math.max(0, v) })} />
                      </span>
                    )}
                  </div>
                );
              })()}
              <div style={{ overflowX: 'auto' }}>
                {Array.from({ length: 10 }, (_, liv) => {
                  const q = filtroIncantesimo.trim().toLowerCase();
                  const spells = scheda.incantesimiLista.filter((s) => s.livello === liv && (!q || (s.nome || '').toLowerCase().includes(q)));
                  const haSlot = liv === 0 || ((scheda.slotIncantesimo[liv]?.totale || 0) > 0);
                  const haSpells = spells.length > 0;

                  if (q && !haSpells) return null;
                  if (!haSlot && !haSpells) return null;

                  const countLiv = scheda.incantesimiLista.filter((x) => x.livello === liv).length;
                  // Conteggio accanto al titolo: trucchetti = selezionati/conosciuti;
                  // livelli 1+ = quanti ne hai a quel livello.
                  const conteggio = liv === 0
                    ? (maxTrucchetti != null ? `${countLiv}/${maxTrucchetti}` : `${countLiv}`)
                    : `${countLiv}`;
                  return (
                    <div key={liv} style={{ marginBottom: 16 }}>
                      <h4 style={{ fontSize: 12, color: C.inkDim, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${C.border}`, paddingBottom: 2, marginBottom: 6, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span>{liv === 0 ? 'Trucchetti (Livello 0)' : `${liv}° Livello`}</span>
                        <span style={{ color: (liv === 0 && trucchettiPieno) ? C.goldDark : C.inkDim, fontWeight: 700 }}>{conteggio}</span>
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
                            const eff = spiegaIncantesimo(s.nome);
                            return (
                              <tr key={s.id}>
                                <td style={styles.td}>
                                  <button
                                    style={{ background: 'transparent', border: 'none', color: C.ink, fontWeight: 600, cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: 14, textDecoration: 'underline dotted', textUnderlineOffset: 3 }}
                                    title="Cosa fa questo incantesimo?"
                                    onClick={() => setInfo({ titolo: `${s.nome || 'Incantesimo'}${s.livello === 0 ? ' · Trucchetto' : ` · ${s.livello}° livello`}`, testo: eff || 'Nessuna descrizione disponibile per questo incantesimo. Aprilo con ✎ per aggiungere delle note.' })}
                                  >
                                    {s.nome || 'Senza nome'}
                                  </button>
                                </td>
                                <td style={{ ...styles.td, color: C.inkDim }}>{s.tempo}</td>
                                <td style={{ ...styles.td, color: C.inkDim }}>{s.gittata}</td>
                                <td style={{ ...styles.td, color: C.inkDim }}>{s.note}</td>
                                <td style={{ ...styles.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                  <button style={styles.buttonMini} title="Modifica" onClick={() => setDettaglioInc(s.id)}>✎</button>{' '}
                                  <button style={{ ...styles.buttonMini, color: C.red }} title="Elimina incantesimo" onClick={() => aggiorna({ incantesimiLista: scheda.incantesimiLista.filter((x) => x.id !== s.id) })}>🗑</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {(() => {
                        const suggeriti = incantesimiClasseLivello(scheda.classe, liv);
                        const gia = new Set(scheda.incantesimiLista.filter((s) => s.livello === liv).map((s) => (s.nome || '').toLowerCase()));
                        const aggiungiInc = (nome) =>
                          aggiorna({
                            incantesimiLista: [
                              ...scheda.incantesimiLista,
                              { id: Date.now(), livello: liv, nome, tempo: '1 Az.', gittata: '', note: '', preparato: true },
                            ],
                          });
                        // Lock come per le armature: al massimo per classe/livello si blocca.
                        const bloccato = liv === 0 ? trucchettiPieno : incantesimiPieno;
                        const etichetta = bloccato
                          ? `🔒 Massimo ${liv === 0 ? 'trucchetti' : 'incantesimi'} raggiunto`
                          : `➕ Aggiungi ${liv === 0 ? 'Trucchetto' : `Incantesimo Liv. ${liv}`}`;
                        return (
                          <select
                            className="add-spell"
                            value=""
                            disabled={bloccato}
                            title={bloccato ? 'Hai raggiunto il massimo per la tua classe a questo livello. Alza il numero accanto ai conteggi se ti serve.' : undefined}
                            style={{ ...styles.button, marginTop: 6, fontSize: 13, padding: '7px 12px', fontWeight: 600, cursor: bloccato ? 'not-allowed' : 'pointer', opacity: bloccato ? 0.55 : 1, maxWidth: '100%' }}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (!v) return;
                              aggiungiInc(v === '__manuale__' ? 'Nuovo incantesimo' : v);
                              e.target.value = '';
                            }}
                          >
                            <option value="">{etichetta}…</option>
                            <option value="__manuale__">✍️ Scrivi a mano</option>
                            {suggeriti.length > 0 && (
                              <optgroup label={`Incantesimi da ${scheda.classe}`}>
                                {suggeriti.map((n) => (
                                  <option key={n} value={n} disabled={gia.has(n.toLowerCase())}>
                                    {gia.has(n.toLowerCase()) ? `✓ ${n}` : n}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </Sezione>

            <Sezione titolo="Privilegi di classe" {...propsSez('privilegi')} {...apertoProps('privilegi')}>
              <button
                style={{ ...styles.button, marginBottom: 8, fontSize: 12 }}
                onClick={() => setMostraPrivilegi(true)}
                title="Panoramica ordinata dei privilegi di classe e sottoclasse per livello"
              >
                📖 Panoramica privilegi per livello
              </button>
              <ListaQuadratini
                value={scheda.privilegi}
                lookup={spiegaPrivilegio}
                placeholder="Nessun privilegio. Aggiungine uno."
                onChange={(v) => aggiorna({ privilegi: v })}
              />
            </Sezione>

            <Sezione titolo="Privilegi di sottoclasse" {...apertoProps('privilegiSottoclasse')}>
              <ListaQuadratini
                value={scheda.privilegiSottoclasse}
                lookup={spiegaPrivilegio}
                placeholder={`Privilegi della sottoclasse${scheda.sottoclasse ? ` (${scheda.sottoclasse})` : ''}: aggiungili qui.`}
                onChange={(v) => aggiorna({ privilegiSottoclasse: v })}
              />
            </Sezione>

            {/(stregone|sorcerer)/i.test(scheda.classe || '') && (
              <Sezione titolo="Metamagia" {...apertoProps('metamagia', false)}>
                <div style={{ ...styles.detail, fontSize: 12, marginBottom: 8 }}>
                  Scegli dal menu ➕ le opzioni di Metamagia che hai imparato. Tocca il nome per la spiegazione.
                </div>
                <CampoConTendina
                  value={scheda.metamagie}
                  opzioni={METAMAGIA_5E}
                  onChange={(v) => aggiorna({ metamagie: v })}
                  lookup={spiegaMetamagia}
                  setInfo={setInfo}
                  title="Opzioni di Metamagia attive"
                />
              </Sezione>
            )}
          </div>
        </div>

        {/* Sezioni descrittive a piena larghezza: riempiono lo spazio sotto le due colonne */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 10 }}>
            {/* Talenti, equipaggiamento, aspetto — collassabili */}
            <Sezione titolo="Talenti" {...propsSez('talenti')} {...apertoProps('talenti')}>
              <ListaQuadratini
                value={scheda.talenti}
                lookup={spiegaTalento}
                placeholder="Es. Guerramaga, Guaritore, Robusto…"
                onChange={(v) => aggiorna({ talenti: v })}
              />
            </Sezione>

            <Sezione titolo="Equipaggiamento e lingue" {...propsSez('equipaggiamento')} {...apertoProps('equipaggiamento')}>
              <ListaQuadratini
                value={scheda.equipaggiamento}
                opzioni={EQUIP_5E}
                placeholder="Zaino, corda, razioni… (scrivi o scegli dalla lista)"
                onChange={(v) => aggiorna({ equipaggiamento: v })}
              />
              <div style={{ marginTop: 10 }}>
                <span style={styles.detail}>
                  Sintonia con un oggetto magico:{' '}
                  <Editable value={scheda.sintonia} onChange={(v) => aggiorna({ sintonia: v })} width={300} />
                </span>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ ...styles.detail, marginBottom: 4 }}>Lingue</div>
                <CampoConTendina
                  value={scheda.lingue}
                  opzioni={LINGUE_5E}
                  onChange={(v) => aggiorna({ lingue: v })}
                  title="Lingue conosciute: aggiungi dalla tendina o scrivi"
                />
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

            <Sezione titolo="Aspetto, Carattere, Storia" {...propsSez('aspetto')} {...apertoProps('aspetto', false)}>
              <div style={styles.moduloLabel}>Aspetto</div>
              <AreaTesto
                value={scheda.aspetto}
                placeholder="Aspetto fisico del personaggio…"
                onChange={(v) => aggiorna({ aspetto: v })}
              />
              <div style={{ ...styles.moduloLabel, marginTop: 10 }}>Carattere</div>
              <AreaTesto
                value={scheda.trattiCaratteriali}
                placeholder="Ideali, legami, difetti, modi di fare… (chi è il personaggio)"
                onChange={(v) => aggiorna({ trattiCaratteriali: v })}
              />
              <div style={{ ...styles.moduloLabel, marginTop: 10 }}>Storia</div>
              <AreaTesto
                value={scheda.note}
                placeholder="Storia del personaggio, alleati, appunti di sessione…"
                onChange={(v) => aggiorna({ note: v })}
              />
            </Sezione>

        </div>

        <footer style={{ textAlign: 'center', margin: '18px 0 0', fontSize: 11, color: C.inkDim }}>
          Emblemi di classe e specie:{' '}
          <a href="https://game-icons.net" target="_blank" rel="noreferrer" style={{ color: C.inkDim }}>game-icons.net</a>{' '}
          (CC BY 3.0).
        </footer>
      </main>
    </div>
  );
}
