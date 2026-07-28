import { useEffect, useId, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { ICONE_CLASSE, ICONE_SPECIE } from './ritratti';
import { t, setLinguaAttuale, DIZIONARIO, traduciDato } from './i18n';
import { avviaAmbiente, fermaAmbiente, setVolumeAmbiente, eseguiEffettoSonoro, sbloccaAudio, precaricaSfx } from './utils/audioAmbiente';

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
  title: 'var(--c-title)',
};

/** Numero valido o fallback (helper condiviso: usato da loader e dal Level Up). */
function num(v, fallback) { return Number.isFinite(Number(v)) ? Number(v) : fallback; }

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

// Palette base del tema (chiaro/scuro): i preset qui sotto la sovrascrivono, e la
// tinta per classe agisce sopra. NON rimuovere: è usata per costruire il tema.
const BASE_TEMA = {
  chiaro: { bg: '#f4f1ea', panel: '#ffffff', panelLight: '#f7f4ee', border: '#ddd5c6', ink: '#2b2620', inkDim: '#8d8272', gold: '#b8860b', goldDark: '#8a6508', red: '#b03a2e', green: '#3e7d32', title: '#9e2b25' },
  scuro: { bg: '#171310', panel: '#211b16', panelLight: '#2a231c', border: '#46392b', ink: '#e9dfcd', inkDim: '#a0937f', gold: '#c9a227', goldDark: '#dcb84f', red: '#d0685a', green: '#7fb069', title: '#de8f88' },
};

// Preset di colori aggiuntivi (Temi di Ambientazione D&D):
// sovrascrivono i valori di palette, il meccanismo tinta-classe funziona sopra come prima.
// Ogni preset è un'AMBIENTAZIONE completa: palette colori (chiaro/scuro) +
// audio abbinato (id di AMBIENTI_AUDIO) + sfondo atmosferico per i margini
// pagina (gradienti CSS leggeri, offline). Un solo controllo li applica insieme.
const PRESET_COLORI = [
  {
    id: 'default', nome: '🟤 Classica', audio: 'spento', sfondo: '',
    chiaro: {},
    scuro: {},
  },
  {
    id: 'taverna', nome: '🍺 Taverna', audio: 'taverna',
    sfondo: 'radial-gradient(55% 60% at 0% 20%, rgba(210,120,40,0.15), transparent 62%), radial-gradient(55% 60% at 100% 80%, rgba(180,90,20,0.13), transparent 62%)',
    chiaro: { bg: '#f7f1e8', panel: '#fdfbfa', panelLight: '#f2e8dc', border: '#d8c0a4', ink: '#321c10', inkDim: '#885c40', gold: '#b86214', goldDark: '#8c440a', title: '#8c440a' },
    scuro:  { bg: '#160d08', panel: '#22140c', panelLight: '#2c1a10', border: '#482c18', ink: '#eddccc', inkDim: '#a87454', gold: '#d47620', goldDark: '#f09440', title: '#f09440' },
  },
  {
    id: 'mercato', nome: '🏪 Mercato', audio: 'mercato',
    sfondo: 'radial-gradient(55% 55% at 0% 15%, rgba(220,160,50,0.16), transparent 62%), radial-gradient(55% 55% at 100% 85%, rgba(200,110,40,0.13), transparent 62%)',
    chiaro: { bg: '#f9f2e2', panel: '#fffcf4', panelLight: '#f5ead2', border: '#dcc596', ink: '#3a2810', inkDim: '#8a6a3a', gold: '#c07818', goldDark: '#94540c', title: '#94540c' },
    scuro:  { bg: '#181004', panel: '#241809', panelLight: '#2e2010', border: '#4c3818', ink: '#efdfc4', inkDim: '#b08a58', gold: '#e08820', goldDark: '#ffab44', title: '#ffab44' },
  },
  {
    id: 'citta', nome: '🏘️ Città', audio: 'citta',
    sfondo: 'radial-gradient(52% 55% at 0% 25%, rgba(150,120,90,0.15), transparent 62%), radial-gradient(52% 55% at 100% 75%, rgba(120,100,80,0.14), transparent 62%)',
    chiaro: { bg: '#f3efe8', panel: '#fbf9f5', panelLight: '#ebe5da', border: '#c8bca8', ink: '#2c2820', inkDim: '#726a58', gold: '#a07838', goldDark: '#785424', title: '#785424' },
    scuro:  { bg: '#12100c', panel: '#1c1912', panelLight: '#252118', border: '#3d3628', ink: '#e4ddce', inkDim: '#9a8f78', gold: '#c89848', goldDark: '#e4b464', title: '#e4b464' },
  },
  {
    id: 'dungeon', nome: '⛓️ Dungeon', audio: 'dungeon',
    sfondo: 'radial-gradient(50% 60% at 0% 30%, rgba(70,90,120,0.16), transparent 62%), radial-gradient(50% 60% at 100% 70%, rgba(45,60,90,0.16), transparent 62%)',
    chiaro: { bg: '#eef0f2', panel: '#f6f7f9', panelLight: '#e4e7ec', border: '#b0b8c4', ink: '#1c222c', inkDim: '#546070', gold: '#b87d1a', goldDark: '#8a5a0c', title: '#8a5a0c' },
    scuro:  { bg: '#0d1015', panel: '#141922', panelLight: '#1b222f', border: '#283244', ink: '#d8e0ec', inkDim: '#6b7a94', gold: '#d4982a', goldDark: '#f0b440', title: '#f0b440' },
  },
  {
    id: 'foresta', nome: '🌲 Foresta', audio: 'foresta',
    sfondo: 'radial-gradient(55% 50% at 0% 0%, rgba(60,140,50,0.14), transparent 62%), radial-gradient(55% 50% at 100% 100%, rgba(40,110,40,0.14), transparent 62%)',
    chiaro: { bg: '#eef3ec', panel: '#f5faf4', panelLight: '#edf7eb', border: '#a3cba0', ink: '#182b17', inkDim: '#4e6d49', gold: '#4d7c30', goldDark: '#355c1d', title: '#355c1d' },
    scuro:  { bg: '#0b140b', panel: '#121e12', panelLight: '#182818', border: '#284428', ink: '#d2ecc9', inkDim: '#70a065', gold: '#5caa3b', goldDark: '#7dcf5a', title: '#7dcf5a' },
  },
  {
    id: 'notte', nome: '🌙 Notte', audio: 'notte',
    sfondo: 'radial-gradient(60% 55% at 15% 10%, rgba(70,80,150,0.20), transparent 60%), radial-gradient(55% 55% at 90% 95%, rgba(50,55,110,0.18), transparent 60%)',
    chiaro: { bg: '#eceef6', panel: '#f6f7fc', panelLight: '#e2e5f2', border: '#adb4d0', ink: '#191d30', inkDim: '#525a80', gold: '#4a5aa0', goldDark: '#323a78', title: '#323a78' },
    scuro:  { bg: '#080a14', panel: '#10131f', panelLight: '#171b2b', border: '#282e46', ink: '#d0d6ee', inkDim: '#6b74a0', gold: '#6472c8', goldDark: '#8f9ce8', title: '#8f9ce8' },
  },
  {
    id: 'mare', nome: '🌊 Mare / Costa', audio: 'mare',
    sfondo: 'radial-gradient(55% 60% at 0% 15%, rgba(30,150,170,0.15), transparent 62%), radial-gradient(55% 60% at 100% 85%, rgba(40,170,190,0.13), transparent 62%)',
    chiaro: { bg: '#e8f5f4', panel: '#f4fcfb', panelLight: '#dcf0ee', border: '#96ccc8', ink: '#0e2c2a', inkDim: '#3e807a', gold: '#0e9088', goldDark: '#066660', title: '#066660' },
    scuro:  { bg: '#06110f', panel: '#0d1c1a', panelLight: '#132724', border: '#1e4440', ink: '#c6ece6', inkDim: '#54a09a', gold: '#20b0a4', goldDark: '#50d0c4', title: '#50d0c4' },
  },
  {
    id: 'tundra', nome: '❄️ Tundra Gelata', audio: 'tundra',
    sfondo: 'radial-gradient(55% 60% at 0% 15%, rgba(60,160,230,0.15), transparent 62%), radial-gradient(55% 60% at 100% 85%, rgba(90,190,255,0.13), transparent 62%)',
    chiaro: { bg: '#ebf4fa', panel: '#f5fbff', panelLight: '#e0f0fa', border: '#9cc4e0', ink: '#102436', inkDim: '#447294', gold: '#1474b0', goldDark: '#0a5280', title: '#0a5280' },
    scuro:  { bg: '#08101a', panel: '#0f1b2b', panelLight: '#16253b', border: '#1f3a58', ink: '#cae4f8', inkDim: '#5a90ba', gold: '#2aa2f0', goldDark: '#60c0ff', title: '#60c0ff' },
  },
  {
    id: 'tempesta', nome: '🌧️ Pioggia / Tempesta', audio: 'tempesta',
    sfondo: 'radial-gradient(55% 60% at 0% 15%, rgba(90,110,140,0.17), transparent 62%), radial-gradient(55% 60% at 100% 85%, rgba(70,90,120,0.15), transparent 62%)',
    chiaro: { bg: '#edeff2', panel: '#f6f8fa', panelLight: '#e2e6ec', border: '#aeb8c6', ink: '#1e242e', inkDim: '#586474', gold: '#5878a0', goldDark: '#3a5678', title: '#3a5678' },
    scuro:  { bg: '#0b0e13', panel: '#13171f', panelLight: '#1a1f2a', border: '#2a3340', ink: '#d2dae6', inkDim: '#68758c', gold: '#6890c0', goldDark: '#88acd8', title: '#88acd8' },
  },
  {
    id: 'accampamento', nome: '🔥 Accampamento', audio: 'accampamento',
    sfondo: 'radial-gradient(70% 55% at 50% 115%, rgba(220,110,30,0.20), transparent 60%), radial-gradient(45% 50% at 0% 0%, rgba(230,130,40,0.12), transparent 60%)',
    chiaro: { bg: '#f9efe5', panel: '#fff8f2', panelLight: '#f4e4d4', border: '#dcb890', ink: '#3a2410', inkDim: '#8c6038', gold: '#c86818', goldDark: '#96460c', title: '#96460c' },
    scuro:  { bg: '#170e06', panel: '#23160b', panelLight: '#2e1e10', border: '#4c3418', ink: '#f0dcc4', inkDim: '#b0804c', gold: '#e07818', goldDark: '#ff9c3c', title: '#ff9c3c' },
  },
  {
    id: 'deserto', nome: '🏜️ Deserto', audio: 'deserto',
    sfondo: 'radial-gradient(60% 55% at 0% 100%, rgba(210,170,60,0.15), transparent 62%), radial-gradient(60% 55% at 100% 0%, rgba(190,150,40,0.13), transparent 62%)',
    chiaro: { bg: '#f8f2e4', panel: '#fffdf9', panelLight: '#f2e8d4', border: '#d4be94', ink: '#342814', inkDim: '#8a7244', gold: '#b89020', goldDark: '#8a6a10', title: '#8a6a10' },
    scuro:  { bg: '#161208', panel: '#221c0e', panelLight: '#2c2514', border: '#4a3d20', ink: '#ede4cc', inkDim: '#a89460', gold: '#d4aa30', goldDark: '#f0c850', title: '#f0c850' },
  },
  {
    id: 'tempio', nome: '🔮 Tempio Arcano', audio: 'tempio',
    sfondo: 'radial-gradient(60% 60% at 12% 8%, rgba(150,90,220,0.20), transparent 60%), radial-gradient(60% 60% at 88% 92%, rgba(110,60,180,0.18), transparent 60%)',
    chiaro: { bg: '#f0eaf8', panel: '#faf6ff', panelLight: '#f3eeff', border: '#c8b0e0', ink: '#1e1030', inkDim: '#7a5a9a', gold: '#7030b0', goldDark: '#521888', title: '#521888' },
    scuro:  { bg: '#0f0a1a', panel: '#1a1128', panelLight: '#221633', border: '#3a2252', ink: '#e0d0f4', inkDim: '#9a78c0', gold: '#a060e0', goldDark: '#c890ff', title: '#c890ff' },
  },
];

// Simbolo (emoji / testo) associato a ogni caratteristica — usato come sfondo opaco
// all'interno del blocco caratteristica per evocare visivamente l'attributo.
const SFONDO_CARATTERISTICA = {
  forza:        { symbol: '⚔️', label: 'Forza' },
  destrezza:    { symbol: '🏹', label: 'Destrezza' },
  costituzione: { symbol: '🛡️', label: 'Costituzione' },
  intelligenza: { symbol: '📚', label: 'Intelligenza' },
  saggezza:     { symbol: '🔮', label: 'Saggezza' },
  carisma:      { symbol: '✨', label: 'Carisma' },
};

// Simbolo di sfondo opaco per i riquadri vitali (come nelle caratteristiche):
// un'emoji grande e sfumata nell'angolo, che evoca il riquadro senza disturbare.
function SfondoVit({ children }) {
  return (
    <span aria-hidden style={{
      position: 'absolute', right: -4, bottom: -12, fontSize: 54, opacity: 0.06,
      pointerEvents: 'none', lineHeight: 1, userSelect: 'none',
      transform: 'rotate(-8deg)', filter: 'grayscale(20%)',
    }}>{children}</span>
  );
}


// Colore identità per ogni classe (variante chiara e scura per restare leggibile).
// `match` = sottostringhe riconosciute nel campo classe (italiano + inglese).
// Palette a 12 tinte ben distinte (una per classe), sia in chiaro sia in scuro.


// Le 12 classi base (2024), per il menù a tendina della classe.


// Opzioni per i menù a tendina dell'anagrafica (liste 2024; sempre con "Altro…").

// Competenze nelle abilità concesse da ogni background (chiavi di ABILITA).




// Sottoclassi per classe (chiave = primo alias in CLASSI, es. 'mago').


/** Sottoclassi disponibili per la classe indicata (o [] se non riconosciuta). */
function sottoclassiPerClasse(classe) {
  const c = coloreClasse(classe);
  return (c && SOTTOCLASSI_5E[c.match[0]]) || [];
}

// Privilegi delle sottoclassi per livello (regole 2024). I nomi seguono le
// sottoclasse elencate in SOTTOCLASSI_5E e i livelli in SOTTOCLASSE_LIV.
// Sono riassunti/etichette nostre: da verificare col proprio manuale.

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

/** Caratteristica da incantatore della classe (o '' se non incantatore/ignota). */
function caratteristicaIncantatorePerClasse(classe) {
  const c = coloreClasse(classe);
  return (c && CARATT_INCANTATORE[c.match[0]]) || '';
}

// Priorità delle caratteristiche per classe (dalla più importante alla meno).
// Serve per assegnare i tiri più alti alle caratteristiche giuste.


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

function dadoVitaClasse(classe) {
  const c = coloreClasse(classe);
  return (c && DADO_VITA_CLASSE[c.match[0]]) || 8;
}

// Calcola la formula unificata dei Dadi Vita (es. "5d10 + 2d6") per PG persino multiclasse
function calcolaFormulaDadiVita(classePrincipale, livPrincipale, multiclasseArray) {
  const gruppi = {};
  const addDV = (cl, lv) => {
    if (!cl || !lv) return;
    const f = dadoVitaClasse(cl);
    gruppi[f] = (gruppi[f] || 0) + Math.max(1, Math.floor(lv));
  };
  addDV(classePrincipale, livPrincipale);
  if (Array.isArray(multiclasseArray)) {
    for (const m of multiclasseArray) {
      if (m && m.classe) addDV(m.classe, m.livello);
    }
  }
  return Object.keys(gruppi)
    .sort((a, b) => Number(b) - Number(a))
    .map((f) => `${gruppi[f]}d${f}`)
    .join(' + ');
}


// Le 3 caratteristiche potenziabili da ogni background (regole 2024).


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

function tiriSalvezzaPerClasse(classe) {
  const c = coloreClasse(classe);
  const keys = (c && TS_CLASSE[c.match[0]]) || [];
  if (!keys.length) return null;
  const ts = { forza: false, destrezza: false, costituzione: false, intelligenza: false, saggezza: false, carisma: false };
  keys.forEach((k) => { ts[k] = true; });
  return ts;
}

// Addestramento in armature e armi per classe.

function addestramentoPerClasse(classe) {
  const c = coloreClasse(classe);
  return (c && ADDESTRAMENTO_CLASSE[c.match[0]]) || null;
}

// Competenze nelle abilità concesse da ogni classe (2024): quante sceglierne e
// da quale lista. 'tutte' = qualsiasi abilità (Bardo). Chiavi = quelle di ABILITA.

/** Competenze di classe: { numero, lista:[chiavi] } (lista completa se 'tutte'), o null. */
function competenzeClasseDi(classe) {
  const c = coloreClasse(classe);
  const dati = c && COMPETENZE_CLASSE[c.match[0]];
  if (!dati) return null;
  const lista = dati.lista === 'tutte' ? ABILITA.map((a) => a.key) : dati.lista;
  return { numero: dati.numero, lista };
}

// Privilegi di classe di 1° livello (2024), riassunti in parole nostre.

// Privilegi di 1° livello nella 5.0 (2014): niente Maestria nelle armi, e alcune
// classi ricevono la sottoclasse già al 1° livello (Chierico, Stregoni, Warlock).

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


// Privilegi di classe per livello nella 5.0 (2014). Differiscono dalla 2024
// (niente Maestria armi, sottoclasse a livelli diversi, alcune capacità cambiano).


// Livelli di Aumento dei Punteggi di Caratteristica / Talento (2024).

// Livello in cui si SCEGLIE la sottoclasse (il primo dei livelli di sottoclasse).
function livelloSceltaSottoclasse(classe, versione = '2024') {
  const k = chiaveClasse(classe);
  const liv = sottoclasseLivPer(versione);
  return (k && liv[k] && liv[k][0]) || 3;
}

// Elenco (curato) degli incantesimi più comuni per classe e livello, in italiano.
// Serve al menu "Aggiungi incantesimo": non è esaustivo (c'è sempre "Scrivi a
// mano"), ma copre gli incantesimi tipici. I nomi sono indicativi e modificabili.

/** Incantesimi consigliati per la classe a un dato livello (o [] se non previsti). */
function incantesimiClasseLivello(classe, livello) {
  const k = chiaveClasse(classe);
  return (k && INCANTESIMI_CLASSE[k] && INCANTESIMI_CLASSE[k][livello]) || [];
}

/** Incantesimi con Concentrazione disponibili per la classe (dalle liste note). */
function incantesimiConcentrazioneClasse(classe) {
  const k = chiaveClasse(classe);
  if (!k || !INCANTESIMI_CLASSE[k]) return [];
  const tutti = [...new Set(Object.values(INCANTESIMI_CLASSE[k]).flat())];
  return tutti
    .filter((nome) => /concentrazione/i.test(spiegaIncantesimo(nome) || ''))
    .sort((a, b) => a.localeCompare(b, 'it'));
}

// Numero di TRUCCHETTI conosciuti per classe (soglie ai livelli 1 / 4 / 10).
// Le classi che non lanciano trucchetti non compaiono (nessun limite).

/** Massimo di trucchetti conosciuti per classe e livello (null = nessun limite). */

// Incantesimi (livello 1+) noti/preparati per classe e livello (indice 0 = liv.1).
// 2024: quasi tutte le classi "preparano". 2014: i conoscitori hanno tabelle fisse,
// i preparatori usano mod. da incantatore + livello. Valori indicativi, modificabili.


/**
 * Massimo di incantesimi (livello 1+) per classe/livello/versione (o null se non
 * incantatore). È un default modificabile a mano dall'utente.
 */


// Livelli in cui si sceglie o si potenzia la sottoclasse (2024).

// Livelli di sottoclasse nella 5.0 (2014): alcune classi la scelgono già al 1°/2°.




/** Privilegi di classe guadagnati esattamente a questo livello (testo, o ''). */

/** Vero se a questo livello scatta un Aumento di Caratteristica/Talento. */

/** Vero se a questo livello si sceglie/potenzia la sottoclasse (per versione). */
function sottoclasseAlLivello(classe, livello, versione = '2024') {
  const k = chiaveClasse(classe);
  const liv = sottoclasseLivPer(versione);
  return !!(k && liv[k] && liv[k].includes(livello));
}

// Competenze concesse dalla SPECIE (2024): quasi nessuna specie dà abilità
// (spostate sui background); l'Elfo con "Sensi Acuti" ne concede 1 a scelta.

function competenzeSpecieDi(specie) {
  const k = Object.keys(COMPETENZE_SPECIE).find((x) => (specie || '').toLowerCase().includes(x.toLowerCase()));
  return k ? { ...COMPETENZE_SPECIE[k], specie: k } : null;
}

// Nomi fantasy per razza/specie (liste generiche) + cognomi occasionali.


/** Nome fantasy casuale coerente con la specie scelta. */
function nomeCasuale(specie) {
  const s = (specie || '').toLowerCase();
  const chiave = Object.keys(NOMI_SPECIE).find((k) => s.includes(k));
  const lista = (chiave && NOMI_SPECIE[chiave]) || NOMI_GENERICI;
  return lista[Math.floor(Math.random() * lista.length)];
}

// Dati di specie (2024): velocità in metri, sensi, taglia, tratti principali.

/** Dati di una specie a partire dal nome scelto (anche varianti tipo "Elfo Alto"). */
function datiSpecieDi(specie) {
  if (!specie) return null;
  const s = String(specie).toLowerCase();
  const k = Object.keys(SPECIE_DATI).find((x) => x.toLowerCase() === s) ||
            Object.keys(SPECIE_DATI).sort((a, b) => b.length - a.length).find((x) => s.includes(x.toLowerCase()));
  return k ? { ...SPECIE_DATI[k], nome: k } : null;
}

// Slot incantesimo degli incantatori completi (livello PG → slot per livello 1-9).

// Slot dei semi-incantatori (paladino, ranger): tabella classica, incantesimi fino al 5° livello.



/** Slot incantesimo coerenti con classe e livello (null se non applicabile: manuale). */


/** Livello da incantatore combinato per il multiclasse (regola 5e): full caster
 *  = livello pieno, mezzo caster (paladino/ranger) = livello/2 arrotondato per
 *  difetto. Il Warlock (Pact Magic) NON entra in questa somma. */


/** Slot incantesimo combinati per un personaggio multiclasse: usa la tabella
 *  del full caster al livello da incantatore combinato. Restituisce null se
 *  nessuna classe è incantatrice. */


// Tipi di danno (per resistenze/immunità/vulnerabilità) e sensi comuni.

// Sensi 5e con le gittate tipiche (si può comunque scrivere un valore libero).


// Sfinimento: nella 5.0 (2014) sono 6 livelli con effetti crescenti; nella 5.5
// (2024) ogni livello dà −2 a tutti i tiri di d20. Testo degli effetti 2014:


// Ordine di default delle sezioni collassabili (riordinabili via drag).
// Sezioni riordinabili via drag. 'import' NON è qui: resta sempre fissa in fondo.
const ORDINE_SEZIONI_DEFAULT = ['attacchi', 'incantesimi', 'risorse', 'privilegi', 'talenti', 'privilegiSottoclasse', 'trattiSpecie', 'addestramento', 'equipaggiamento', 'aspetto'];

/** Ricava il colore identità dalla classe (testo libero), o null se non riconosciuta. */


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
    ? `<g transform="translate(112,26) scale(0.56)">
         <path d="${dClasse}" fill="rgba(0,0,0,0.28)" transform="translate(6,8)"/>
         <path d="${dClasse}" fill="#fdf6e3"/>
       </g>`
    : `<text x="256" y="250" font-size="260" font-family="Georgia,serif" fill="#fdf6e3" text-anchor="middle">${iniziale}</text>`;
  // Distintivo di specie: in basso al CENTRO (non a destra) così resta visibile
  // anche quando il ritratto è un rettangolo verticale con object-fit: cover,
  // che ritaglia i lati dell'immagine quadrata.
  const distintivo = dSpecie
    ? `<circle cx="256" cy="420" r="74" fill="rgba(0,0,0,0.42)" stroke="#fdf6e3" stroke-width="6"/>
       <g transform="translate(202,366) scale(0.21)"><path d="${dSpecie}" fill="#fdf6e3"/></g>`
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
    top: 4,
    zIndex: 10,
    background: C.panel,
    border: `1px solid ${C.gold}`,
    borderRadius: 8,
    padding: '6px 12px',
    marginBottom: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    boxShadow: '0 2px 8px rgba(60,50,30,0.15)',
    minHeight: 38,
  },
  dado: (rolling, crit, fumble, facce = 20) => {
    let clipPath = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'; // default d20 hexagon
    if (facce === 4) clipPath = 'polygon(50% 10%, 95% 90%, 5% 90%)'; // Triangle
    else if (facce === 6) clipPath = 'polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)'; // Square
    else if (facce === 8) clipPath = 'polygon(50% 5%, 95% 50%, 50% 95%, 5% 50%)'; // Diamond
    else if (facce === 10 || facce === 100) clipPath = 'polygon(50% 5%, 95% 35%, 50% 95%, 5% 35%)'; // Kite
    else if (facce === 12) clipPath = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'; // Dodecagon approximation (use hexagon for now)

    return {
      width: 38,
      height: 38,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: facce === 20 ? 16 : 14,
      fontWeight: 'bold',
      color: crit ? C.goldDark : fumble ? C.red : C.ink,
      background: C.panelLight,
      border: `2px solid ${crit ? C.gold : fumble ? C.red : (COLORE_DADO[facce] || COLORE_DADO[20])}`,
      clipPath,
      animation: rolling ? 'd20-spin 0.5s linear infinite' : 'd20-settle 0.35s ease-out',
      userSelect: 'none',
      paddingTop: facce === 4 ? 6 : 0,
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
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
    position: 'relative',
    overflow: 'hidden',
  },
  vitalLabel: {
    fontSize: 11,
    color: C.inkDim,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingTop: 6,
    marginBottom: 4,
    fontWeight: 700,
    lineHeight: 1.15,
    height: '2.2em',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
  },
  vitalValue: {
    fontSize: 25,
    fontWeight: 800,
    color: C.ink,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    lineHeight: 1.1,
    flexWrap: 'wrap',
    width: '100%',
  },
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
    borderRadius: 6,
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

/* ===================== SISTEMA GRAFICO UNIFICATO =====================
   Regole di base condivise da TUTTE le sezioni, così menu a tendina, campi e
   bottoni hanno lo stesso aspetto e le stesse interazioni ovunque. */
:root { --raggio-s: 6px; --raggio-m: 8px; --raggio-l: 10px; }

/* Campi modulo (tendine, input, aree di testo): stessa famiglia, stesse
   transizioni e stesso anello di focus dorato in ogni sezione. */
select, input[type="text"], input[type="number"], input[type="search"],
input[type="url"], input[type="tel"], input:not([type]), textarea {
  font-family: inherit;
  color: var(--c-ink);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
select:hover, input:hover, textarea:hover { border-color: var(--c-gold); }
select:focus-visible, input:focus-visible, textarea:focus-visible {
  outline: 2px solid var(--c-gold);
  outline-offset: 1px;
}

/* Menu a tendina: freccia personalizzata IDENTICA su ogni browser e sistema
   operativo (iOS/Safari/Chrome hanno frecce native diverse: qui le uniformiamo).
   !important per prevalere anche sugli sfondi impostati inline sui singoli select. */
select {
  appearance: none !important;
  -webkit-appearance: none !important;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1.5l5 5 5-5' fill='none' stroke='%23998f7a' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/></svg>") !important;
  background-repeat: no-repeat !important;
  background-position: right 9px center !important;
  padding-right: 28px !important;
  cursor: pointer;
}

/* Bottoni: interazione coerente ovunque (focus da tastiera, hover, pressione).
   Non tocchiamo i colori scelti inline: aggiungiamo solo il comportamento. */
button { font-family: inherit; cursor: pointer; transition: filter 0.12s ease, transform 0.05s ease; }
button:focus-visible { outline: 2px solid var(--c-gold); outline-offset: 1px; }
button:not(:disabled):hover { filter: brightness(1.07); }
button:not(:disabled):active { transform: translateY(1px); }
button:disabled { cursor: not-allowed; opacity: 0.55; }
/* ==================================================================== */
/* sezioni collassabili: niente marcatore nativo, freccia che ruota */
.sezione > summary::-webkit-details-marker { display: none; }
.sezione .freccia { display: inline-block; transition: transform 0.15s; font-size: 11px; color: var(--c-ink-dim); }
.sezione:not([open]) .freccia { transform: rotate(-90deg); }
/* Corpo scheda: le sezioni ora sono a PIENA LARGHEZZA, impilate in verticale.
   L'ordine è controllato con 'order' (Combattimento/Magia prima, poi il resto). */
.griglia-scheda {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.griglia-scheda > * { min-width: 0; }
/* Profilo: caratteristiche (colonna verticale) a sinistra, dati al centro,
   ritratto in basso a destra. Su schermi stretti si impila tutto. */
.profilo-caratteristiche > .blocco-car { margin-bottom: 0 !important; }
@media (max-width: 820px) {
  .profilo-griglia {
    grid-template-columns: 1fr !important;
    grid-template-areas: "main" "car" "ritratto" !important;
    grid-template-rows: auto auto auto !important;
  }
}
/* riquadri vitali: 5 colonne fisse → riga 1: CA | PF(x2) | Riposo | TsMorte ; riga 2: BonusComp | Iniziativa | Velocità | PercPass */
/* grid-auto-rows: auto → ogni riga è alta quanto il suo contenuto (niente più
   spazi vuoti: prima "1fr" forzava tutte le righe all'altezza della più alta).
   align-items: stretch tiene comunque uniformi i riquadri della STESSA riga. */
.vitali { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: auto; gap: 8px; align-items: stretch; }
/* consente ai riquadri di stringersi sotto la larghezza del contenuto (niente overflow) */
.vitali > * { min-width: 0; }
.vitali > * > * { min-width: 0; }
/* i campi anagrafica (con le tendine): font piccolo, padding compatto, allineati in basso */
.campi-anagrafica > * { min-width: 0; display: flex; flex-direction: column; justify-content: flex-end; }
.campi-anagrafica select { max-width: 100%; font-size: 11px !important; padding: 1px 15px 1px 3px !important; height: 20px; line-height: 1.2; background-position: right 3px center !important; background-size: 8px !important; }
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
@media (max-width: 780px) {
  /* schermo medio: titolo centrato in prima riga, poi i due gruppi di bottoni
     allineati sulle due righe successive ciascuno a piena larghezza */
  .app-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; }
  .app-header-title { order: -1; flex: 1 1 100%; text-align: center; margin-bottom: 4px !important; }
  .app-header-group { flex: 1 1 auto !important; flex-wrap: wrap; justify-content: center; }
  .app-header-group > button { flex: 0 1 auto; }
}
@media (max-width: 560px) {
  /* su schermi stretti: titolo su una riga sopra, poi ciascun gruppo di pulsanti
     su una propria riga a piena larghezza, centrata e ordinata */
  .app-header { display: flex; flex-wrap: wrap; justify-content: center; }
  .app-header-title { grid-column: auto; justify-self: auto; order: -1; flex: 1 1 100%; margin-bottom: 6px !important; }
  .app-header-group { flex: 1 1 100% !important; justify-content: center !important; flex-wrap: wrap; }
  .app-header-group > button { flex: 1 1 auto; justify-content: center; }
  /* dadi: pulsanti compatti e leggibili su telefono in riga singola */
  .dadi-riga { justify-content: space-between; flex-wrap: wrap !important; gap: 4px !important; }
  .dadi-riga .dado-btn { flex: 0 0 auto; min-width: 28px !important; width: 28px !important; height: 28px !important; padding: 0 !important; text-align: center; }
  /* tabelle incantesimi più compatte sul telefono: celle strette così i
     tasti azione (✎ 🗑) restano visibili senza scorrere in orizzontale */
  .spell-table { font-size: 12px; }
  .spell-table th, .spell-table td { padding: 5px 4px !important; }
  /* nomi lunghi (es. "Prestidigitazione") vanno a capo invece di allargare
     la tabella e spingere i tasti azione fuori schermo */
  .spell-table td:first-child button { white-space: normal !important; overflow-wrap: anywhere; }
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

import { spiegaPrivilegio, spiegaIncantesimo, spiegaTratto, spiegaTalento, spiegaMetamagia, METAMAGIA_5E, INCANTESIMI_NOMI as NOMI_SPIEG_INC } from './data/spiegazioni.js';
import { INCANTESIMI_DB, datiIncantesimo } from './data/incantesimi.js';

const INCANTESIMI_NOMI = Array.from(new Set([...NOMI_SPIEG_INC, ...Object.keys(INCANTESIMI_DB)])).sort((a, b) => a.localeCompare(b, 'it'));
import { NOMI_CLASSI, BACKGROUND_5E, TAGLIE_5E, ALLINEAMENTI_5E, SOTTOCLASSI_5E, INCANTESIMI_CLASSE, TRUCCHETTI_NOTI, INC_MAX_2024, INC_MAX_2014_NOTI, SLOT_FULL_CASTER, SLOT_MEZZO_CASTER, CLASSI_FULL_CASTER, CLASSI_MEZZO_CASTER, DANNI_5E, SENSI_5E, CONDIZIONI_5E, PESI_OGGETTI, NOMI_OGGETTI, PESO_ARMATURA_TIPO, LINGUE_5E, ARMI_5E } from './data/dati5e.js';
import { BACKGROUND_COMPETENZE, SPECIE_5E, SUBCLASS_PRIVILEGI, CARATT_INCANTATORE, PRIORITA_CARATT, DADO_VITA_CLASSE, BACKGROUND_CARATT, TS_CLASSE, ADDESTRAMENTO_CLASSE, COMPETENZE_CLASSE, PRIVILEGI_CLASSE_L1, PRIVILEGI_CLASSE_L1_2014, PRIVILEGI_CLASSE_LIV, PRIVILEGI_CLASSE_LIV_2014, ASI_LIV, SOTTOCLASSE_LIV, SOTTOCLASSE_LIV_2014, COMPETENZE_SPECIE, NOMI_SPECIE, NOMI_GENERICI, SPECIE_DATI, SFINIMENTO_2014, BASE_ARMATURA_DEFAULT, ESEMPI_ARMATURA } from './data/dati5e.js';
import { modificatore, conSegno, tiraDado, parseEspressioneDado, FACCE_DADO_VITA, facceDadoVita, esprDadiVita, bonusCompetenzaDaLivello, tiraDanni, tiraD20, capacitaCarico } from './rules/dadi.js';
import { trucchettiMax, incantesimiMaxAuto, sottoclasseLivPer, chiaveClasse, privilegiClasseLivello, asiAlLivello, slotDaClasseLivello, livelloIncantatoreCombinato, slotMulticlasse, coloreClasse, dettagliIncantesimo, pesoStimato, pesoArmatura } from './rules/regole.js';

/**
 * Ricava tempo/gittata/note di un incantesimo dalla sua descrizione (le meccaniche
 * sono nel testo di SPIEG_INCANTESIMI). Restituisce null se non c'è descrizione,
 * così chi chiama può decidere se lasciare i valori esistenti o usare un default.
 */

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
  { key: 'mr', label: 'Monete di Rame' },
  { key: 'ma', label: "Monete d'Argento" },
  { key: 'me', label: 'Monete di Elettro' },
  { key: 'mo', label: "Monete d'Oro" },
  { key: 'mp', label: 'Monete di Platino' },
];







/**
 * Parser per espressioni di dado tipo "2d6+3", "1d8", "1d10+1d6+2", "d8-1".
 * Ritorna { termini: [{tipo:'dado', quantita, facce, segno} | {tipo:'fisso', valore, segno}] }
 * oppure null se l'espressione non è valida. Non lancia mai eccezioni.
 */


// --- Dadi vita ------------------------------------------------------------
// In 5e il NUMERO di dadi vita è sempre pari al livello del personaggio; il
// TIPO di dado (d6…d12) dipende dalla classe. Ricaviamo le facce dalla stringa
// salvata e teniamo la quantità agganciata al livello.




/** Espressione dei dadi vita coerente col livello, es. livello 3 + d8 → "3d8". */


/** Bonus di competenza corretto per il livello in 5e: +2 a lv 1, +1 ogni 4 livelli. */


/**
 * Tira un'espressione di danno già parsata.
 * Regola del critico 5e: con `critico` = true raddoppiano SOLO i dadi
 * (2d6+3 -> 4d6+3); il modificatore fisso resta invariato.
 */


/** Tira il d20 nella modalità scelta: normale, vantaggio o svantaggio. */


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
    multiclasse: [], // classi secondarie: [{ classe, livello }] (opzionale)
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
    // inventario strutturato: { id, nome, qta, peso (kg, per unità), equip, categoria }
    inventario: [],
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

// Esempi di armature per categoria (per il suggerimento sotto la CA).




// Pesi indicativi (kg) di oggetti comuni 5e: auto-compilano il peso quando
// aggiungi un oggetto noto e alimentano il calcolo dell'ingombro.



/** Capacità di carico massima (kg) = Forza × 7,5 (equivale a For × 15 lb). */


// Peso di ripiego per tipo di armatura, usato quando il nome non è nella tabella.


/** Stima il peso (kg) di un oggetto dal nome: esatto → contenuto → 0. */


/** Peso stimato di un'armatura {nome,tipo,scudo}: nome → tipo, + scudo se presente. */




// Armi standard 5e (dado di danno, tipo e proprietà). Scegliendone una si
// compilano danno/tipo/note e, dai modificatori del PG, bonus a colpire.
// finesse = Accurata (usa FOR o DES, la migliore); ranged = a distanza (DES).


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
const APP_VERSION = '2.6.0';

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
            s.incantesimiLista = s.incantesimiLista.map((sp, i) => {
              const base = sp && sp.id != null ? sp : { ...sp, id: Date.now() + i };
              if (base.nome === 'Vampa') {
                base.nome = 'Stregoneria Esplosiva';
              }
              // Auto-completa i dettagli mancanti (gittata/tempo/note vuoti) per
              // gli incantesimi noti: le righe importate o riaggiunte a mano non
              // restano più "vuote" (es. Dardo Incantato → gittata 36m).
              const d = dettagliIncantesimo(base.nome);
              if (!d) return base;
              const patch = {};
              if (!base.gittata && d.gittata) patch.gittata = d.gittata;
              if (!base.note && d.note) patch.note = d.note;
              if ((!base.tempo || base.tempo === '1 Az.') && d.tempo) patch.tempo = d.tempo;
              if (!base.scuola && d.scuola) patch.scuola = d.scuola;
              if (!base.area && d.area) patch.area = d.area;
              if (!base.danno && d.danno) patch.danno = d.danno;
              if (!base.tipoDanno && d.tipoDanno) patch.tipoDanno = d.tipoDanno;
              
              return Object.keys(patch).length ? { ...base, ...patch } : base;
            });
          }
          // Migrazione legacy: se l'inventario strutturato è vuoto ma esiste il
          // vecchio equipaggiamento testuale, converti le voci in oggetti (con
          // peso stimato) e svuota il testo, così gli oggetti non spariscono.
          if ((!Array.isArray(s.inventario) || s.inventario.length === 0) && typeof s.equipaggiamento === 'string' && s.equipaggiamento.trim()) {
            s.inventario = s.equipaggiamento.split(/[;,\n]/).map((x) => x.trim()).filter(Boolean).map((nome, i) => ({
              id: `inv-mig-${i}`, nome, qta: 1, peso: pesoStimato(nome), equip: false, categoria: '',
            }));
            s.equipaggiamento = '';
          }
          // "Fissa" il massimo di trucchetti/incantesimi per le schede che ne
          // conoscono più di quanti la classe suggerirebbe (import da PDF): senza
          // questo, togliere un incantesimo non sblocca mai il selettore.
          if (Array.isArray(s.incantesimiLista)) {
            const nTruc = s.incantesimiLista.filter((x) => x.livello === 0 && !x.bonus).length;
            const nInc = s.incantesimiLista.filter((x) => x.livello > 0 && !x.bonus).length;
            const baseTruc = trucchettiMax(s.classe, s.livello);
            const baseInc = incantesimiMaxAuto(s, s.versione === '2014' ? '2014' : '2024');
            if (!(s.maxTrucchetti > 0) && baseTruc != null && nTruc > baseTruc) s.maxTrucchetti = nTruc;
            if (!(s.maxIncantesimi > 0) && baseInc != null && nInc > baseInc) s.maxIncantesimi = nInc;
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
  // "Fissa" il massimo di trucchetti/incantesimi quando una scheda importata ne
  // ha PIÙ di quanti la classe/livello suggerirebbe: senza questo, il massimo
  // seguiva il conteggio verso il basso e togliere un incantesimo non sbloccava
  // mai il selettore (restava sempre "pieno"). Fissandolo, rimuoverne uno ti
  // riporta sotto il tetto e riabilita l'aggiunta.
  const versionePin = dati.versione === '2014' ? '2014' : '2024';
  const livelloPin = num(dati.livello, base.livello);
  const schedaPin = { classe: str(dati.classe), livello: livelloPin, incantatore: { caratteristica: carIncantatore }, caratteristiche: car };
  const nTruccPin = incantesimiLista.filter((s) => s.livello === 0 && !s.bonus).length;
  const nIncPin = incantesimiLista.filter((s) => s.livello > 0 && !s.bonus).length;
  const baseTruccPin = trucchettiMax(str(dati.classe), livelloPin);
  const baseIncPin = incantesimiMaxAuto(schedaPin, versionePin);
  const maxTruccIniziale = num(dati.maxTrucchetti, 0) || (baseTruccPin != null && nTruccPin > baseTruccPin ? nTruccPin : 0);
  const maxIncIniziale = num(dati.maxIncantesimi, 0) || (baseIncPin != null && nIncPin > baseIncPin ? nIncPin : 0);
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
    multiclasse: Array.isArray(dati.multiclasse)
      ? dati.multiclasse.map((m) => ({ classe: str(m && m.classe), livello: Math.max(1, num(m && m.livello, 1)) })).filter((m) => m.classe)
      : [],
    specie: str(dati.specie),
    allineamento: str(dati.allineamento),
    versione: dati.versione === '2014' ? '2014' : '2024',
    maxTrucchetti: maxTruccIniziale,
    maxIncantesimi: maxIncIniziale,
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
    inventario: (() => {
      // Usa l'inventario strutturato solo se NON è vuoto: un array vuoto salvato
      // in precedenza non deve nascondere l'equipaggiamento testuale da migrare
      // (bug: gli oggetti sparivano perché [] aveva la precedenza sul testo).
      if (Array.isArray(dati.inventario) && dati.inventario.length > 0) {
        return dati.inventario.map((o, i) => {
          let pesoVal = Math.max(0, Number(o.peso) || 0);
          const nomeVal = str(o.nome);
          if (pesoVal === 0 && nomeVal) pesoVal = pesoStimato(nomeVal);
          return {
            id: o.id || `inv-${i}-${Math.random().toString(36).slice(2, 6)}`,
            nome: nomeVal, qta: Math.max(1, num(o.qta, 1)), peso: pesoVal,
            equip: !!o.equip, categoria: str(o.categoria),
          };
        });
      }
      // Migrazione: il vecchio equipaggiamento testuale (voci separate da ; , o
      // a capo) diventa una lista di oggetti, con peso stimato dal nome.
      const testo = str(dati.equipaggiamento);
      if (!testo) return [];
      return testo.split(/[;,\n]/).map((s) => s.trim()).filter(Boolean).map((nome, i) => ({
        id: `inv-mig-${i}`, nome, qta: 1, peso: pesoStimato(nome), equip: false, categoria: '',
      }));
    })(),
    sintonia: Array.isArray(dati.sintonia) ? dati.sintonia.slice(0, 3).map(str) : str(dati.sintonia),
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
            onClick={sp ? () => setInfo({ titolo: traduciDato(t), testo: sp }) : undefined}
          >{traduciDato(t)}</span>
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
      <label style={{ ...chip, borderStyle: 'dashed', color: C.goldDark, cursor: 'pointer', position: 'relative' }} title={t('common.aggiungi_lista')}>
        ➕ {t('common.aggiungi')}
        <select
          value=""
          onChange={(e) => aggiungi(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
        >
          <option value="">{t('common.aggiungi')}…</option>
          {opzioni.map((o) => (
            <option key={o} value={o}>{traduciDato(o)}</option>
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
        <option value="" style={{ background: C.panel }}>{t("common.scegli")}</option>
        {Array.isArray(opzioni) ? opzioni.map((o) => (
          <option key={o} value={o} style={{ background: C.panel }}>{traduciDato(o)}</option>
        )) : Object.entries(opzioni).map(([group, opts]) => (
          <optgroup key={group} label={traduciDato(group)} style={{ background: C.panel }}>
            {opts.map((o) => <option key={o} value={o} style={{ background: C.panel }}>{traduciDato(o)}</option>)}
          </optgroup>
        ))}
        <option value="__altro" style={{ background: C.panel }}>{t("common.altro")}</option>
      </select>
      {!std && value !== '' && (
        <div style={{ marginTop: 2 }}>
          <Editable value={value} onChange={onChange} width={80} style={{ fontSize: 13, borderBottom: 'none' }} title={t('tip.valore_pers')} />
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
function ListaQuadratini({ value, onChange, lookup, placeholder, opzioni, onRoll }) {
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
          const isMagiaSelvaggia = /magia selvaggia/i.test(r) && onRoll;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <button style={{ ...chip, borderRight: isMagiaSelvaggia ? 'none' : chip.border, borderTopRightRadius: isMagiaSelvaggia ? 0 : 8, borderBottomRightRadius: isMagiaSelvaggia ? 0 : 8 }} title={t('tip.apri_dettagli')} onClick={() => setEdit({ index: i, valore: r })}>
                {r}
              </button>
              {isMagiaSelvaggia && (
                <button
                  style={{ ...chip, background: C.gold, color: '#fff', borderLeft: '1px solid rgba(0,0,0,0.1)', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, paddingLeft: 6, paddingRight: 6 }}
                  title="Tira 1d100 (Impulso di Magia Selvaggia)"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRoll("Impulso di Magia Selvaggia", "1d100");
                  }}
                >
                  🎲
                </button>
              )}
            </div>
          );
        })}
        <button style={{ ...chip, borderStyle: 'dashed', color: C.goldDark }} onClick={() => setEdit({ index: -1, valore: "" })}>➕ {t("common.aggiungi")}</button>
      </div>
      {edit && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1004, padding: 16, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) setEdit(null); }}
        >
          <div style={{ ...styles.panel, maxWidth: 420, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong style={{ color: C.goldDark, fontSize: 16 }}>{edit.index === -1 ? 'Nuova voce' : 'Voce'}</strong>
              <button style={styles.buttonMini} onClick={() => setEdit(null)} title={t('tip.chiudi')}>✕</button>
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
              {edit.index !== -1 && <button style={{ ...styles.buttonDanger, flex: 1 }} onClick={elimina}>🗑 {t('modal.elimina')}</button>}
              <button style={{ ...styles.buttonPrimary, flex: 1 }} onClick={conferma}>{t('modal.salva')}</button>
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
            title={t('tip.trascina_sezioni')}
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

  // Auto-aggiornamento silenzioso: se rileva un update su GitHub e non stai scrivendo, aggiorna da solo!
  useEffect(() => {
    if (nuovaVersione && !aggiornando) {
      const active = document.activeElement;
      const staScrivendo = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
      if (!staScrivendo) {
        forzaAggiornamento();
      }
    }
  }, [nuovaVersione, aggiornando]);

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
  const [filtroInventario, setFiltroInventario] = useState('');
  const [addLivIncantesimo, setAddLivIncantesimo] = useState(0); // livello scelto nella barra "aggiungi"
  const [addBonusIncantesimo, setAddBonusIncantesimo] = useState(false); // aggiungi come incantesimo bonus ✦
  const [espressioneLibera, setEspressioneLibera] = useState('');
  const [erroreEspressione, setErroreEspressione] = useState(false);
  const [storico, setStorico] = useState([]);
  // Combat tracker (barra fissa in basso, stile Fantasy Grounds)
  const [combat, setCombat] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('scheda-interattiva:combat'));
      if (s && Array.isArray(s.combattenti)) return s;
    } catch { /* niente */ }
    return { attivo: false, aperto: true, round: 1, turno: 0, combattenti: [] };
  });
  useEffect(() => {
    try { localStorage.setItem('scheda-interattiva:combat', JSON.stringify(combat)); } catch { /* niente */ }
  }, [combat]);
  const [ctDmg, setCtDmg] = useState({}); // valore danno/cura per combattente (id → stringa)
  const [storicoAperto, setStoricoAperto] = useState(false);
  // tema: 'auto' = scuro se è notte OPPURE se il sistema è in scuro; oppure forzato
  const [tema, setTema] = useState(() => localStorage.getItem('scheda-interattiva:tema') || 'auto');
  const [lingua, setLingua] = useState(() => localStorage.getItem('scheda-interattiva:lingua') || 'it');
  // Allinea SUBITO la lingua del dizionario durante il render: così tutti i
  // {t('...')} in questo render usano già la lingua corrente (niente ritardo di
  // un render come accadrebbe aspettando l'useEffect).
  setLinguaAttuale(lingua);
  useEffect(() => {
    try {
      localStorage.setItem('scheda-interattiva:lingua', lingua);
      document.documentElement.lang = lingua;
    } catch { /* niente */ }
  }, [lingua]);
  const [sistemaScuro, setSistemaScuro] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [oraTick, setOraTick] = useState(0); // forza il ricalcolo quando cambia la fascia oraria

  // ordine (personalizzabile via drag) delle sezioni collassabili
  const [ordineSezioni, setOrdineSezioni] = useState(() => {
    let salvato = [];
    try {
      const s = JSON.parse(localStorage.getItem('scheda-interattiva:ordine-sezioni-v3'));
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
  // Preset colori UI
  const [presetColori, setPresetColori] = useState(() => localStorage.getItem('scheda-interattiva:preset-colori') || 'default');
  useEffect(() => {
    try { localStorage.setItem('scheda-interattiva:preset-colori', presetColori); } catch { /* niente */ }
  }, [presetColori]);

  // Audio e Sottofondo Ambientale
  const [ambienteAudio, setAmbienteAudio] = useState(() => localStorage.getItem('scheda-interattiva:ambiente-audio') || 'spento');
  const [volumeAudio, setVolumeAudio] = useState(() => Number(localStorage.getItem('scheda-interattiva:volume-audio') || 0.5));
  const [urlCustomAudio, setUrlCustomAudio] = useState(() => localStorage.getItem('scheda-interattiva:url-audio-custom') || '');
  const [mostraPannelloAudio, setMostraPannelloAudio] = useState(false);
  const [effettiSonoriAttivi, setEffettiSonoriAttivi] = useState(() => localStorage.getItem('scheda-interattiva:effetti-sonori') !== 'false');

  useEffect(() => {
    try {
      localStorage.setItem('scheda-interattiva:ambiente-audio', ambienteAudio);
      localStorage.setItem('scheda-interattiva:volume-audio', volumeAudio);
      localStorage.setItem('scheda-interattiva:url-audio-custom', urlCustomAudio);
      localStorage.setItem('scheda-interattiva:effetti-sonori', effettiSonoriAttivi ? 'true' : 'false');
    } catch { /* niente */ }
  }, [ambienteAudio, volumeAudio, urlCustomAudio, effettiSonoriAttivi]);

  useEffect(() => {
    avviaAmbiente(ambienteAudio, volumeAudio, urlCustomAudio);
  }, [ambienteAudio]);

  useEffect(() => {
    setVolumeAmbiente(volumeAudio);
  }, [volumeAudio]);

  // Pre-carica gli effetti sonori (colpo d'arma/incantesimo) al PRIMO tocco:
  // così il primo tiro suona subito, senza ritardo (l'audio va sbloccato da un gesto).
  useEffect(() => {
    const warm = () => { precaricaSfx(); window.removeEventListener('pointerdown', warm); };
    window.addEventListener('pointerdown', warm, { once: true });
    return () => window.removeEventListener('pointerdown', warm);
  }, []);

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
  const [checkConc, setCheckConc] = useState(null); // TS concentrazione automatico: { danno, cd, spell, esito }
  const [dettaglioInc, setDettaglioInc] = useState(null); // id incantesimo aperto nel sottomenu
  const [conferma, setConferma] = useState(null); // { titolo, testo, onConferma } per la conferma in-app
  const [levelUpBozza, setLevelUpBozza] = useState({ metodo: 'media', hpLanciato: 0 });
  const ordineRef = useRef(ordineSezioni);
  ordineRef.current = ordineSezioni;
  const nodiSezioni = useRef({}); // id sezione → elemento DOM
  const dragSezione = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('scheda-interattiva:ordine-sezioni-v3', JSON.stringify(ordineSezioni));
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
    // Parti dal tema base, poi applica l'override del preset colori
    const presetDati = PRESET_COLORI.find((p) => p.id === presetColori) || PRESET_COLORI[0];
    const t = { ...BASE_TEMA[modo], ...presetDati[modo] };
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
    root.dataset.preset = presetColori;
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
    // sfondo atmosferico dell'ambientazione (gradienti tematici nei margini pagina)
    const sfondoAmbiente = presetDati.sfondo || '';
    document.body.style.background = [sfondoAmbiente, glowClasse, ambra, vignetta, t.bg]
      .filter(Boolean)
      .join(', ');
    document.body.style.backgroundAttachment = 'fixed';
    try {
      localStorage.setItem('scheda-interattiva:tema', tema);
    } catch {
      // storage non disponibile: pazienza
    }
  }, [tema, sistemaScuro, oraTick, classeAttiva, presetColori]);
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
    const sp = datiSpecieDi(specie);
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
      titolo: t('menu.elimina_titolo'),
      testo: `Vuoi eliminare davvero "${scheda.nome || t('menu.senza_nome')}"? L'operazione non si può annullare.`,
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
    if (!window.confirm(t('reset.conferma', { nome: scheda.nome }))) return;
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
  function conAnimazione(alFine, facciaFinale, tipoDado = 20, magia = false) {
    clearInterval(intervalRef.current);
    setTiro(null);
    setDanni(null);
    setRolling(true);
    setTipoDadoInUso(tipoDado);
    if (effettiSonoriAttivi) eseguiEffettoSonoro(magia ? 'magia' : 'tiro', volumeAudio);
    intervalRef.current = setInterval(() => setFaccia(tiraDado(tipoDado)), 70);
    setTimeout(() => {
      clearInterval(intervalRef.current);
      setRolling(false);
      if (facciaFinale !== undefined) setFaccia(facciaFinale);
      alFine();
    }, 700);
  }

  /**
   * Registra un tiro nel registro della sessione come voce STRUTTURATA:
   * { id, ora, personaggio, etichetta, totale, dettaglio, modalita, critico,
   *   fumble, tipo, nota }. `dati` può contenere qualunque di questi campi.
   */
  function registra(dati) {
    const voce = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ts: Date.now(),
      personaggio: scheda.nome,
      modalita,
      nota: '',
      ...dati,
    };
    setStorico((s) => [voce, ...s].slice(0, 60));
  }

  // --- Combat tracker ---

  /** Ordina esplicitamente i combattenti per iniziativa. Mantiene invariato il turno attivo. */
  function ordinaIniziativa() {
    setCombat((c) => {
      if (!c.combattenti.length) return c;
      const idAttivo = c.combattenti[c.turno]?.id;
      const ordinati = [...c.combattenti].sort((a, b) => (Number(b.iniziativa) || 0) - (Number(a.iniziativa) || 0));
      const nuovoTurno = idAttivo ? Math.max(0, ordinati.findIndex(x => x.id === idAttivo)) : 0;
      return { ...c, combattenti: ordinati, turno: nuovoTurno };
    });
  }

  function aggiungiCombattente(tipo, dati = {}) {
    const nome = dati.nome || (tipo === 'nemico' ? t('ct.nemico') : tipo === 'alleato' ? t('ct.alleato') : t('ct.pg'));
    const pfMax = dati.pfMax ?? 10;
    const initRandom = Math.floor(Math.random() * 20) + 1; // Tiro d20 default per png
    const nuovo = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nome, tipo,
      iniziativa: dati.iniziativa ?? initRandom,
      pfMax, pfAttuali: dati.pfAttuali ?? pfMax, pfTemp: 0,
      ca: dati.ca ?? 10,
      condizioni: [], concentrazione: false,
      tsMorte: { successi: 0, fallimenti: 0 },
    };
    setCombat((c) => {
      const lista = [...c.combattenti, nuovo].sort((a, b) => (Number(b.iniziativa) || 0) - (Number(a.iniziativa) || 0));
      const idAttivo = c.combattenti[c.turno]?.id;
      const nuovoTurno = idAttivo ? Math.max(0, lista.findIndex(x => x.id === idAttivo)) : 0;
      return { ...c, attivo: true, aperto: true, combattenti: lista, turno: nuovoTurno };
    });
  }

  /** Aggiunge il personaggio attivo al combattimento, tirando l'iniziativa. */
  function aggiungiPgAlCombat() {
    const initRoll = tiraDado(20) + modificatore(scheda.caratteristiche.destrezza);
    aggiungiCombattente('pg', {
      nome: scheda.nome, iniziativa: initRoll,
      pfMax: scheda.pfMax, pfAttuali: scheda.pfAttuali, ca: caTotale(scheda),
    });
    registra({ etichetta: `${t('vital.iniziativa')}: ${scheda.nome}`, tipo: 'd20', totale: initRoll, dettaglio: `d20 ${conSegno(modificatore(scheda.caratteristiche.destrezza))}` });
  }

  /** Aggiorna (o inserisce) il PG attivo nel combat tracker con l'iniziativa tirata,
   *  poi riordina la lista. Usato quando si tira l'Iniziativa dalla scheda. */
  function sincronizzaIniziativaPg(valore) {
    setCombat((c) => {
      const idx = c.combattenti.findIndex((x) => x.tipo === 'pg' && x.nome === scheda.nome);
      let lista;
      if (idx >= 0) {
        lista = c.combattenti.map((x, i) => (i === idx ? { ...x, iniziativa: valore } : x));
      } else {
        lista = [...c.combattenti, {
          id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          nome: scheda.nome, tipo: 'pg', iniziativa: valore,
          pfMax: scheda.pfMax, pfAttuali: scheda.pfAttuali, pfTemp: 0, ca: caTotale(scheda),
          condizioni: [], concentrazione: false, tsMorte: { successi: 0, fallimenti: 0 },
        }];
      }
      const idAttivo = c.combattenti[c.turno]?.id;
      const ordinati = lista.sort((a, b) => (Number(b.iniziativa) || 0) - (Number(a.iniziativa) || 0));
      const nuovoTurno = idAttivo ? Math.max(0, ordinati.findIndex((x) => x.id === idAttivo)) : 0;
      return { ...c, attivo: true, aperto: true, combattenti: ordinati, turno: nuovoTurno };
    });
  }

  const modCombat = (id, patch) =>
    setCombat((c) => ({ ...c, combattenti: c.combattenti.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));

  /** Applica danni (segno negativo) o cure (positivo) a un combattente, gestendo i PF temporanei. */
  function dannoCura(id, delta) {
    setCombat((c) => ({
      ...c,
      combattenti: c.combattenti.map((x) => {
        if (x.id !== id) return x;
        if (delta < 0) {
          let dmg = -delta;
          let temp = x.pfTemp || 0;
          const assorbito = Math.min(temp, dmg);
          temp -= assorbito; dmg -= assorbito;
          return { ...x, pfTemp: temp, pfAttuali: Math.max(0, x.pfAttuali - dmg) };
        }
        return { ...x, pfAttuali: Math.min(x.pfMax, x.pfAttuali + delta) };
      }),
    }));
  }

  function prossimoTurno() {
    setCombat((c) => {
      const n = c.combattenti.length;
      if (n === 0) return c;
      const idAttivo = c.combattenti[c.turno]?.id;
      const ordinati = [...c.combattenti].sort((a, b) => (Number(b.iniziativa) || 0) - (Number(a.iniziativa) || 0));
      const curIdx = idAttivo ? Math.max(0, ordinati.findIndex(x => x.id === idAttivo)) : 0;
      const nuovo = curIdx + 1;
      if (nuovo >= n) return { ...c, combattenti: ordinati, turno: 0, round: c.round + 1 };
      return { ...c, combattenti: ordinati, turno: nuovo };
    });
  }
  function turnoPrecedente() {
    setCombat((c) => {
      const n = c.combattenti.length;
      if (n === 0) return c;
      const idAttivo = c.combattenti[c.turno]?.id;
      const ordinati = [...c.combattenti].sort((a, b) => (Number(b.iniziativa) || 0) - (Number(a.iniziativa) || 0));
      const curIdx = idAttivo ? Math.max(0, ordinati.findIndex(x => x.id === idAttivo)) : 0;
      if (curIdx === 0) return { ...c, combattenti: ordinati, turno: Math.max(0, n - 1), round: Math.max(1, c.round - 1) };
      return { ...c, combattenti: ordinati, turno: curIdx - 1 };
    });
  }

  // --- tiri ---

  /** Tiro di d20 generico con animazione. `extra` finisce nello stato del tiro. */
  function lanciaD20(etichetta, bonus, extra = {}) {
    const { dopoTiro, magia, ...restExtra } = extra;
    clearInterval(intervalRef.current);
    setDanni(null);
    setTiro(null);
    setRolling(true);
    setTipoDadoInUso(20);
    if (effettiSonoriAttivi) eseguiEffettoSonoro(magia ? 'magia' : 'tiro', volumeAudio);
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
      if (effettiSonoriAttivi) {
        if (naturale === 20) eseguiEffettoSonoro('critico', volumeAudio);
        else if (naturale === 1) eseguiEffettoSonoro('fallimento', volumeAudio);
      }
      setTiro({ etichetta, naturale, dadi, bonus: bonusEff, totale: naturale + bonusEff, modalita, sfinimento: penSfinimento, ...restExtra });
      registra({
        etichetta,
        tipo: 'd20',
        naturale,
        totale: naturale + bonusEff,
        dettaglio: `d20 [${naturale}]${bonusEff ? ` ${conSegno(bonusEff)}` : ''}${penSfinimento ? ` · sfin. −${penSfinimento}` : ''}`,
        critico: naturale === 20,
        fumble: naturale === 1,
      });
      if (dopoTiro) dopoTiro(naturale + bonusEff, naturale);
    }, 850);
  }

  function getEffettoMagiaSelvaggia(roll) {
    if (roll >= 1 && roll <= 4) return "Tira su questa tabella all'inizio di ciascun turno per il prossimo minuto. Se nei tiri successivi ottieni questo stesso risultato, ignoralo.";
    if (roll >= 5 && roll <= 8) return "Appare una creatura amichevole entro 18 m. Tira 1d4: 1 duodrone modron, 2 flumph, 3 monodrone modron, 4 unicorno. Scompare dopo 1 min.";
    if (roll >= 9 && roll <= 12) return "Per il prossimo minuto, ripristini 5 punti ferita a ogni turno.";
    if (roll >= 13 && roll <= 16) return "Per il prossimo minuto, le creature hanno svantaggio ai TS contro il tuo prossimo incantesimo che richiede un TS.";
    if (roll >= 17 && roll <= 20) return "Effetto per 1 minuto (tira 1d8): 1 musica eterea, 2 taglia aumenta, 3 barba di piume, 4 urli invece di parlare, 5 farfalle illusorie, 6 occhio sulla fronte (vantaggio Percezione), 7 bolle rosa dalla bocca, 8 pelle blu (24 ore).";
    if (roll >= 21 && roll <= 24) return "Per 1 minuto, gli incantesimi con tempo di lancio di un'azione diventano azioni bonus.";
    if (roll >= 25 && roll <= 28) return "Vieni trasportato sul Piano Astrale fino al termine del tuo turno successivo.";
    if (roll >= 29 && roll <= 32) return "Nel prossimo minuto, i danni dei tuoi incantesimi sono massimizzati (nessun tiro richiesto).";
    if (roll >= 33 && roll <= 36) return "Per il minuto successivo, hai resistenza a tutti i danni.";
    if (roll >= 37 && roll <= 40) return "Diventi una pianta in vaso fino all'inizio del tuo prossimo turno. Incapacitato e vulnerabile a tutti i danni. Se scendi a 0 PF, la pianta muore e torni normale.";
    if (roll >= 41 && roll <= 44) return "Per il minuto successivo, puoi teletrasportarti fino a 6 metri come azione bonus in ogni tuo turno.";
    if (roll >= 45 && roll <= 48) return "Tu e altre creature a scelta entro 9 m diventate invisibili per 1 minuto. Termina se la creatura attacca, infligge danni o lancia un incantesimo.";
    if (roll >= 49 && roll <= 52) return "Appare uno scudo spettrale per 1 minuto: +2 alla CA e immunità a dardo incantato.";
    if (roll >= 53 && roll <= 56) return "Puoi effettuare un'azione extra durante questo turno.";
    if (roll >= 57 && roll <= 60) return "Lanci un incantesimo casuale (tira 1d10, no conc.): 1 confusione, 2 palla di fuoco, 3 nube di nebbia, 4 volare, 5 unto, 6 levitazione, 7 dardo incantato (5° liv.), 8 immagine speculare, 9 metamorfosi (capra), 10 vedere invisibilità.";
    if (roll >= 61 && roll <= 64) return "Per 1 minuto, qualsiasi oggetto non magico e infiammabile che tocchi (non indossato/trasportato) prende fuoco (1d4 danni da fuoco).";
    if (roll >= 65 && roll <= 68) return "Se muori entro 1 ora, vieni riportato subito in vita (come reincarnazione).";
    if (roll >= 69 && roll <= 72) return "Sei spaventato fino al termine del tuo turno successivo (fonte decisa dal DM).";
    if (roll >= 73 && roll <= 76) return "Ti teletrasporti fino a 18 metri in uno spazio libero che vedi.";
    if (roll >= 77 && roll <= 80) return "Una creatura casuale entro 18 metri è avvelenata per 1d4 ore.";
    if (roll >= 81 && roll <= 84) return "Per 1 minuto emani luce intensa (9m). Chi termina il turno entro 1,5m da te è accecato fino al suo turno successivo.";
    if (roll >= 85 && roll <= 88) return "Infliggi 1d10 danni necrotici a max 3 creature che vedi. Ripristini PF pari ai danni inflitti.";
    if (roll >= 89 && roll <= 92) return "Infliggi 4d10 danni da fulmine a max 3 creature che vedi.";
    if (roll >= 93 && roll <= 96) return "Tu e le creature entro 9 m diventate vulnerabili ai danni perforanti per 1 minuto.";
    if (roll >= 97 && roll <= 100) return "Tira 1d6: 1 tu recuperi 2d10 PF, 2 un alleato (90m) recupera 2d10 PF, 3 recuperi i tuoi slot di liv più basso, 4 un alleato recupera i suoi slot di liv più basso, 5 recuperi i punti stregoneria, 6 tutti gli effetti riga 17-20.";
    return "";
  }

  /** Tiro di danni diretto (senza tiro per colpire): mai critico. */
  function lanciaDanniDiretti(etichetta, espressione, magia = false) {
    const parsata = parseEspressioneDado(espressione);
    if (!parsata) return;
    const maxFacce = Math.max(...parsata.termini.map((p) => p.facce).filter(Boolean));
    const esito = tiraDanni(parsata, false);

    if (etichetta === 'Impulso di Magia Selvaggia') {
      esito.dettaglio = getEffettoMagiaSelvaggia(esito.totale);
      esito.tabella = true;
    }

    conAnimazione(() => {
      setDanni({ etichetta, ...esito, critico: false });
      registra({ etichetta, tipo: esito.tabella ? 'tiro' : 'danni', totale: esito.totale, dettaglio: esito.dettaglio });
    }, esito.totale, maxFacce || 20, magia);
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
      registra({ etichetta: `${t('log.danni')}: ${nome}`, tipo: 'danni', totale: esito.totale, dettaglio: esito.dettaglio, critico });
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
    if (effettiSonoriAttivi) eseguiEffettoSonoro('tiro', volumeAudio);
    intervalRef.current = setInterval(() => setFaccia(tiraDado(20)), 70);

    const { naturale, dadi } = tiraD20(modalita);
    setTimeout(() => {
      clearInterval(intervalRef.current);
      setFaccia(naturale);
      setRolling(false);
      if (effettiSonoriAttivi) {
        if (naturale === 20) eseguiEffettoSonoro('critico', volumeAudio);
        else if (naturale === 1) eseguiEffettoSonoro('fallimento', volumeAudio);
      }
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
      registra({ etichetta: t('vital.dadi_vita'), tipo: 'cura', totale: recupero, dettaglio: `+${recupero} PF · 1d${facce} [${dado}] ${conSegno(mod)}` });
    }, dado);
  }

  /**
   * Riposo lungo 5e: PF al massimo, slot recuperati, metà dei dadi vita,
   * risorse (breve e lungo) ricaricate, uno sfinimento in meno.
   */
  function riposoLungo() {
    if (!window.confirm(t('rest.lungo_conferma'))) return;
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
        risorse: s.risorse.map((r) => (r.reset ? { ...r, attuali: 0 } : r)),
        sfinimento: Math.max(0, s.sfinimento - 1),
        concentrazione: '',
      };
    });
    registra({ etichetta: `🌙 ${t('vital.riposo_lungo_tooltip')}`, tipo: 'riposo', dettaglio: t('rest.lungo_fatto') });
  }

  /** Riposo breve: ricarica le risorse "brevi" e spende un dado vita per curarti.
   *  Pact Magic: il Warlock recupera anche gli slot incantesimo col riposo breve. */
  function riposoBreve() {
    if (!window.confirm(t('rest.breve_conferma'))) return;
    const isWarlock = /warlock|patto/i.test(scheda.classe || '');
    setScheda((s) => ({
      ...s,
      risorse: s.risorse.map((r) => (r.reset === 'breve' ? { ...r, attuali: 0 } : r)),
      ...(isWarlock ? { slotIncantesimo: Object.fromEntries(Object.entries(s.slotIncantesimo).map(([liv, v]) => [liv, { ...v, spesi: 0 }])) } : {}),
    }));
    registra({ etichetta: `🔥 ${t('vital.riposo_breve_tooltip')}`, tipo: 'riposo', dettaglio: isWarlock ? t('rest.breve_fatto_warlock') : t('rest.breve_fatto') });
    tiraDadoVita();
  }

  /** Tiro libero di un singolo dado (il d20 passa dal tiro animato). */
  function tiroLibero(facce) {
    if (facce === 20) return lanciaD20(t('roll.tiro_libero'), 0);
    const valore = tiraDado(facce);
    conAnimazione(() => {
      setDanni({ etichetta: 'Tiro libero', totale: valore, dettaglio: `1d${facce} [${valore}]`, libero: true });
      registra({ etichetta: `d${facce}`, tipo: 'libero', totale: valore, dettaglio: `1d${facce} [${valore}]` });
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
      registra({ etichetta: testo, tipo: 'libero', totale: esito.totale, dettaglio: esito.dettaglio });
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
  const indagarePassivo = 10 + bonusAbilita(scheda, 'indagare');
  const intuizionePassiva = 10 + bonusAbilita(scheda, 'intuizione');
  const modIncantatore = scheda.incantatore.caratteristica
    ? modificatore(scheda.caratteristiche[scheda.incantatore.caratteristica])
    : null;

  // Limiti di trucchetti/incantesimi (come il lock delle armature): quando sei al
  // massimo per la tua classe/livello, i pulsanti "Aggiungi" si bloccano.
  // Gli incantesimi BONUS (da razza/sottoclasse/talento) non contano verso il
  // limite: sono aggiunti "forzatamente" e marcati a parte.
  const nTrucchetti = scheda.incantesimiLista.filter((s) => s.livello === 0 && !s.bonus).length;
  const nIncantesimi = scheda.incantesimiLista.filter((s) => s.livello > 0 && !s.bonus).length;
  const nBonus = scheda.incantesimiLista.filter((s) => s.bonus).length;
  // Incantatori che PREPARANO (Mago, Chierico, Druido, Paladino): il "libro/lista"
  // dei conosciuti è illimitato, ma ogni giorno se ne preparano fino a un massimo.
  // Gli altri (Stregone, Bardo, Warlock, Ranger) CONOSCONO un numero fisso, sempre
  // pronto: nessuna preparazione separata.
  const classePreparata = /(\bmago\b|wizard|chierico|cleric|druido|druid|paladino|paladin)/i.test(scheda.classe || '');
  const nPreparati = scheda.incantesimiLista.filter((s) => s.livello > 0 && !s.bonus && s.preparato !== false).length;
  // base = override manuale (>0) oppure automatico da classe/livello/versione
  const baseTrucchetti = (scheda.maxTrucchetti > 0) ? scheda.maxTrucchetti : trucchettiMax(scheda.classe, scheda.livello);
  const baseIncantesimi = (scheda.maxIncantesimi > 0) ? scheda.maxIncantesimi : incantesimiMaxAuto(scheda, versione);
  const trucchettiPieno = baseTrucchetti != null && nTrucchetti >= baseTrucchetti;
  // Blocco AGGIUNTA: per chi prepara il libro è illimitato (mai pieno); per chi
  // conosce, pieno al cap dei conosciuti.
  const incantesimiPieno = !classePreparata && baseIncantesimi != null && nIncantesimi >= baseIncantesimi;
  // Blocco PREPARAZIONE (solo classi che preparano): non puoi preparare più del cap.
  const preparatiPieni = classePreparata && baseIncantesimi != null && nPreparati >= baseIncantesimi;
  const maxTrucchetti = baseTrucchetti == null ? null : Math.max(baseTrucchetti, nTrucchetti);
  // Per chi prepara il massimo mostrato è il cap dei preparati (fisso); per chi
  // conosce non scende mai sotto quanti ne ha già.
  const maxIncantesimi = baseIncantesimi == null ? null : (classePreparata ? baseIncantesimi : Math.max(baseIncantesimi, nIncantesimi));

  return (
    <div style={styles.app}>
      <style>{GLOBAL_CSS}</style>

      {nuovaVersione && (
        <div style={{
          background: 'linear-gradient(90deg, #1b4d3e, #2a7a62)',
          color: '#fff',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          fontWeight: 'bold',
          fontSize: 14,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          zIndex: 9999,
          position: 'sticky',
          top: 0,
          borderBottom: '2px solid #f0cb44'
        }}>
          <span>🚀 È disponibile la nuova versione 2.0.1 del Tavolo dei Dadi!</span>
          <button
            style={{
              background: '#f0cb44',
              color: '#000',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            onClick={forzaAggiornamento}
            disabled={aggiornando}
          >
            {aggiornando ? '🔄 Aggiornamento...' : '🔄 Aggiorna Ora'}
          </button>
        </div>
      )}

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
              <button style={styles.buttonMini} onClick={() => setInfo(null)} title={t('tip.chiudi')}>✕</button>
            </div>
            <div 
              style={{ fontSize: 14, lineHeight: 1.45, color: C.ink }}
              dangerouslySetInnerHTML={{ 
                __html: String(info.testo || '')
                  .replace(/\n/g, '<br/>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }} 
            />
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
              <button style={{ ...styles.button, flex: 1 }} onClick={() => setConferma(null)}>{t('modal.annulla')}</button>
              <button style={{ ...styles.buttonDanger, flex: 1 }} onClick={() => { const f = conferma.onConferma; setConferma(null); if (f) f(); }}>🗑 {t('modal.elimina')}</button>
            </div>
          </div>
        </div>
      )}

      {/* TS Concentrazione automatico: appare quando i PF calano mentre concentri */}
      {checkConc && (() => {
        const bonusCon = modificatore(scheda.caratteristiche.costituzione) + (scheda.tiriSalvezza?.costituzione ? scheda.bonusCompetenza : 0);
        const esito = checkConc.esito;
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 3300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.55)' }} onClick={() => setCheckConc(null)}>
            <div style={{ ...styles.panel, maxWidth: 380, width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }} onClick={(e) => e.stopPropagation()}>
              <strong style={{ color: C.goldDark, fontSize: 16, display: 'block', marginBottom: 8 }}>🧠 {t('conc.auto_titolo')}</strong>
              <div style={{ fontSize: 14, lineHeight: 1.45, color: C.ink, marginBottom: 12 }}>
                {t('conc.auto_desc', { danno: checkConc.danno, spell: checkConc.spell })} <strong>{t('conc.auto_cd', { cd: checkConc.cd })}</strong>
              </div>
              {!esito ? (
                <button style={{ ...styles.button, width: '100%', marginBottom: 8 }} onClick={() => {
                  const d20 = Math.floor(Math.random() * 20) + 1;
                  const tot = d20 + bonusCon;
                  const passa = d20 === 20 ? true : d20 === 1 ? false : tot >= checkConc.cd;
                  registra({ etichetta: t('conc.ts'), tipo: 'd20', naturale: d20, totale: tot, dettaglio: `d20 [${d20}] ${conSegno(bonusCon)} · CD ${checkConc.cd} → ${passa ? '✅' : '❌'}`, critico: d20 === 20, fumble: d20 === 1 });
                  if (!passa) aggiorna({ concentrazione: '' });
                  setCheckConc({ ...checkConc, esito: { d20, tot, passa } });
                }}>🎲 {t('conc.ts')} ({conSegno(bonusCon)})</button>
              ) : (
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: C.inkDim }}>d20 [{esito.d20}] {conSegno(bonusCon)} = <strong>{esito.tot}</strong> · CD {checkConc.cd}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6, color: esito.passa ? C.green : C.red }}>
                    {esito.passa ? `✅ ${t('conc.mantieni')}` : `❌ ${t('conc.persa')}`}
                  </div>
                </div>
              )}
              <button style={{ ...styles.buttonMini, width: '100%' }} onClick={() => setCheckConc(null)}>{t('modal.chiudi')}</button>
            </div>
          </div>
        );
      })()}

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
                <button style={styles.buttonMini} onClick={() => setDettaglioInc(null)} title={t('tip.chiudi')}>✕</button>
              </div>
              <div style={{ ...styles.detail, marginBottom: 4 }}>{t('modal.modifica')} · {s.livello === 0 ? t('spell.trucchetto') : t('spell.inc_liv', { n: s.livello })}</div>

              <label style={etichetta}>{t('crea.nome')}</label>
              <input 
                style={campo} 
                value={s.nome} 
                onChange={(e) => {
                  const val = e.target.value;
                  const auto = datiIncantesimo(val);
                  if (auto) {
                    upd({ 
                      nome: val, 
                      livello: auto.livello ?? s.livello,
                      tempo: auto.tempo ?? s.tempo,
                      scuola: auto.scuola ?? s.scuola,
                      area: auto.area ?? s.area,
                      danno: auto.danno ?? s.danno,
                      tipoDanno: auto.tipoDanno ?? s.tipoDanno
                    });
                  } else {
                    upd({ nome: val });
                  }
                }} 
                list="lista-incantesimi" 
                placeholder={t('ph.inc_nome')} 
              />
              <datalist id="lista-incantesimi">
                {INCANTESIMI_NOMI.map((n) => <option key={n} value={n} />)}
              </datalist>
              {eff && <div style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, lineHeight: 1.4, marginTop: 6 }}>{eff}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={etichetta}>{t('spell.livello_scelto_label')}</label>
                  <select style={campo} value={s.livello} onChange={(e) => upd({ livello: Number(e.target.value) })}>
                    {Array.from({ length: 10 }, (_, i) => <option key={i} value={i}>{i === 0 ? 'Trucchetto' : `${i}° livello`}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={etichetta}>{t('spell.col_tempo')}</label>
                  <input style={campo} value={s.tempo} onChange={(e) => upd({ tempo: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={etichetta}>Scuola di Magia</label>
                  <select style={campo} value={s.scuola || ''} onChange={(e) => upd({ scuola: e.target.value })}>
                    <option value="">— Nessuna —</option>
                    <option value="Abiurazione">Abiurazione</option>
                    <option value="Ammaliamento">Ammaliamento</option>
                    <option value="Chiaroveggenza">Chiaroveggenza</option>
                    <option value="Conjurazione">Conjurazione</option>
                    <option value="Divinazione">Divinazione</option>
                    <option value="Evocazione">Evocazione</option>
                    <option value="Illusione">Illusione</option>
                    <option value="Invocazione">Invocazione</option>
                    <option value="Necromanza">Necromanza</option>
                    <option value="Trasmutazione">Trasmutazione</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={etichetta}>Area d'Effetto</label>
                  <select style={campo} value={s.area || ''} onChange={(e) => upd({ area: e.target.value })}>
                    <option value="">— Nessuna —</option>
                    <option value="Cono">Cono</option>
                    <option value="Cubo">Cubo</option>
                    <option value="Cilindro">Cilindro</option>
                    <option value="Linea">Linea</option>
                    <option value="Sfera">Sfera</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={etichetta}>Danno (es. 8d6, 3d8+5)</label>
                  <input style={campo} value={s.danno || ''} onChange={(e) => upd({ danno: e.target.value })} placeholder="es. 8d6 fuoco" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={etichetta}>Tipo di Danno</label>
                  <select style={campo} value={s.tipoDanno || ''} onChange={(e) => upd({ tipoDanno: e.target.value })}>
                    <option value="">—</option>
                    <option value="Acido">Acido</option>
                    <option value="Freddo">Freddo</option>
                    <option value="Fuoco">Fuoco</option>
                    <option value="Forza">Forza</option>
                    <option value="Fulmine">Fulmine</option>
                    <option value="Necrotico">Necrotico</option>
                    <option value="Perforante">Perforante</option>
                    <option value="Psichico">Psichico</option>
                    <option value="Radiante">Radiante</option>
                    <option value="Rottura">Rottura</option>
                    <option value="Tagliente">Tagliente</option>
                    <option value="Tuono">Tuono</option>
                    <option value="Veleno">Veleno</option>
                  </select>
                </div>
              </div>
              <label style={etichetta}>Note</label>
              <input style={campo} value={s.note} onChange={(e) => upd({ note: e.target.value })} placeholder={t('ph.inc_note')} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: C.ink }}>
                <input
                  type="checkbox"
                  checked={!s.nascondiAttacco}
                  onChange={(e) => upd({ nascondiAttacco: !e.target.checked })}
                />
                ✨ Mostra tra gli attacchi e le armi (se offensivo)
              </label>

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button
                  style={{ ...styles.buttonDanger, flex: 1 }}
                  onClick={() => { aggiorna({ incantesimiLista: scheda.incantesimiLista.filter((x) => x.id !== s.id) }); setDettaglioInc(null); }}
                >🗑 {t('modal.elimina')}</button>
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
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: 0.5 }}>{t('cloud.caricamento')}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{t('cloud.attendi')}</div>
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
          <span style={{ ...styles.detail, color: C.ink }}>🔄 {t('update.disponibile')}</span>
          <button style={styles.buttonPrimary} disabled={aggiornando} onClick={forzaAggiornamento}>{aggiornando ? t('btn.aggiorno') : t('update.ricarica')}</button>
          <button style={styles.buttonMini} title={t('update.ignora')} onClick={() => setNeedRefresh(false)}>✕</button>
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
              {t('menu.nuovo_personaggio')}
            </button>

            <div style={{ ...styles.detail, marginBottom: 6, fontWeight: 'bold' }}>{t('menu.carica_personaggio')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {Object.entries(roster.personaggi).map(([id, p]) => (
                <div key={id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    style={{ ...styles.button, flex: 1, display: 'flex', justifyContent: 'space-between', gap: 10, textAlign: 'left' }}
                    onClick={() => { setRoster((r) => ({ ...r, attivo: id })); setMostraMenu(false); }}
                  >
                    <span>{p.nome || t('menu.senza_nome')}</span>
                    <span style={styles.detail}>{p.classe ? `${p.classe}` : '—'}</span>
                  </button>
                  <button
                    style={{ ...styles.buttonDanger, padding: '4px 10px', fontSize: 13, flexShrink: 0 }}
                    title={t('menu.elimina_tooltip', { nome: p.nome || t('menu.senza_nome') })}
                    onClick={() => setConferma({
                      titolo: t('menu.elimina_titolo'),
                      testo: `Vuoi eliminare davvero "${p.nome || t('menu.senza_nome')}"? L'azione è irreversibile.`,
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
                <span style={styles.detail}>{t('menu.nessun_personaggio')}</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button style={styles.button} onClick={() => jsonRef.current?.click()}>{t('menu.da_file')}</button>
              <button
                style={styles.button}
                onClick={() => generaPgCasuale()}
                title={t('menu.pg_casuale_tooltip')}
              >
                {t('menu.pg_casuale')}
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
            <h1 style={{ ...styles.title, textAlign: 'center', marginBottom: 12 }}>☁️ {t('cloud.titolo')}</h1>
            <p style={{ ...styles.detail, marginBottom: 16, lineHeight: 1.4 }}>
              {t('cloud.descrizione_1')}
              <br />
              <a href="https://github.com/settings/tokens/new?scopes=gist&description=Tavolo+dei+Dadi+Cloud+Sync" target="_blank" rel="noreferrer" style={{ color: C.goldDark, textDecoration: 'underline' }}>
                {t('cloud.link_token')}
              </a> {t('cloud.descrizione_2')}
            </p>

            <label style={{ ...styles.detail, display: 'block', marginBottom: 3, fontWeight: 'bold' }}>{t('cloud.label_token')}</label>
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
              <button style={styles.buttonMini} title={mostraToken ? t('cloud.nascondi') : t('cloud.mostra')} onClick={() => setMostraToken((v) => !v)}>{mostraToken ? '🙈' : '👁'}</button>
              <button style={styles.buttonMini} title={t('cloud.copia_token')} onClick={() => navigator.clipboard?.writeText(githubToken).then(() => setCloudStatus({ text: 'Token copiato', type: 'success' }))}>📋</button>
            </div>
            <p style={{ ...styles.detail, fontSize: 11, marginTop: 0, marginBottom: 12 }}>
              {t('cloud.aiuto_token')}
            </p>

            <label style={{ ...styles.detail, display: 'block', marginBottom: 3, fontWeight: 'bold' }}>{t('cloud.label_gist')}</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              <input
                type="text"
                style={{ ...styles.inlineInput, flex: 1, padding: '6px 8px', fontSize: 13, fontFamily: 'monospace' }}
                placeholder={t('cloud.placeholder_gist')}
                value={gistId}
                onChange={(e) => {
                  setGistId(e.target.value);
                  localStorage.setItem('scheda-interattiva:gist-id', e.target.value);
                }}
              />
              <button style={styles.buttonMini} title={t('cloud.copia_gist')} onClick={() => navigator.clipboard?.writeText(gistId).then(() => setCloudStatus({ text: 'Gist ID copiato', type: 'success' }))}>📋</button>
              {gistId && <a href={`https://gist.github.com/${gistId}`} target="_blank" rel="noreferrer" style={{ ...styles.buttonMini, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }} title={t('cloud.apri_gist')}>↗</a>}
            </div>
            <p style={{ ...styles.detail, fontSize: 11, marginTop: 0, marginBottom: 16 }}>
              {t('cloud.aiuto_gist')}
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button style={{ ...styles.buttonPrimary, flex: 1 }} onClick={() => salvaSuCloud(false)}>⬆️ {t('cloud.salva')}</button>
              <button style={{ ...styles.button, flex: 1, borderColor: C.green, color: C.green }} onClick={caricaDaCloud}>⬇️ {t('cloud.carica')}</button>
            </div>

            {/* Auto-salvataggio: quando attivo, ogni modifica va sul cloud da sola */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => { setAutoSync(e.target.checked); localStorage.setItem('scheda-interattiva:auto-sync', e.target.checked ? 'on' : 'off'); }}
              />
              <span style={styles.detail}>
                {t('cloud.auto_sync')}
                {ultimoSync && <><br />{t('cloud.ultimo_sync')}: {ultimoSync}{sincronizzando ? ` · ${t('cloud.salvando')}` : ''}</>}
              </span>
            </label>

            {cloudStatus.text && (
              <div style={{ padding: 10, borderRadius: 6, background: cloudStatus.type === 'error' ? 'rgba(255,0,0,0.1)' : cloudStatus.type === 'success' ? 'rgba(0,255,0,0.1)' : 'rgba(255,255,255,0.05)', color: cloudStatus.type === 'error' ? C.red : cloudStatus.type === 'success' ? C.green : C.goldDark, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
                {cloudStatus.text}
              </div>
            )}



            <button style={{ ...styles.button, width: '100%' }} onClick={() => setMostraCloud(false)}>{t('modal.chiudi')}</button>
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
              <h1 style={{ ...styles.title, textAlign: 'center', marginBottom: 4 }}>📖 {t('priv.panoramica')}</h1>
              <div style={{ textAlign: 'center', ...styles.detail, marginBottom: 12 }}>
                {scheda.classe || '—'}{scheda.sottoclasse ? ` · ${scheda.sottoclasse}` : ''} · Liv. {liv} · {versione === '2024' ? 'D&D 5.5' : 'D&D 5.0'}
              </div>
              {righe.length === 0 && <p style={styles.detail}>{t('priv.nessuno')}</p>}
              {righe.map(({ L, feat, asi, sub, futuro }) => (
                <div key={L} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: `1px solid ${C.border}`, opacity: futuro ? 0.5 : 1 }}>
                  <div style={{ flexShrink: 0, width: 44, fontWeight: 'bold', color: futuro ? C.inkDim : C.goldDark }}>
                    {t('priv.livello')} {L}
                  </div>
                  <div style={{ flex: 1, fontSize: 13 }}>
                    {feat && feat.split('\n').map((r, i) => {
                      const sp = spiegaPrivilegio(r);
                      return (
                        <div key={i}>
                          • {sp ? (
                            <span
                              style={{ cursor: 'help', textDecoration: 'underline dotted', textUnderlineOffset: 3 }}
                              title={t('priv.tocca_spiegazione')}
                              onClick={() => setInfo({ titolo: r, testo: sp })}
                            >{r}</span>
                          ) : r}
                        </div>
                      );
                    })}
                    {sub && <div style={{ color: C.green }}>🌟 {t('priv.sottoclasse')}{scheda.sottoclasse ? ` (${scheda.sottoclasse})` : ''}</div>}
                    {asi && <div style={{ color: C.inkDim }}>🎯 {t('priv.aumento_car')}</div>}
                    {futuro && <span style={{ ...styles.detail, fontStyle: 'italic' }}>— {t('priv.futuro')}</span>}
                  </div>
                </div>
              ))}
              <p style={{ ...styles.detail, marginTop: 10, fontSize: 11 }}>
                {t('priv.aiuto')}
              </p>
              <button style={{ ...styles.button, width: '100%', marginTop: 6 }} onClick={() => setMostraPrivilegi(false)}>{t('modal.chiudi')}</button>
            </div>
          </div>
        );
      })()}

      {mostraLevelUp && (() => {
        // --- Target del Level Up: classe principale o secondaria (True Multiclassing) ---
        const targetMode = levelUpBozza.target !== undefined ? levelUpBozza.target : 'main';
        const isNewMc = targetMode === 'new';
        const isSecMc = typeof targetMode === 'number';
        const mcArray = scheda.multiclasse || [];
        const secMcObj = isSecMc ? mcArray[targetMode] : null;

        const targetClasse = isNewMc
          ? (levelUpBozza.nuovaClasseMc || NOMI_CLASSI.find((n) => n !== scheda.classe && !mcArray.some((x) => x.classe === n)) || NOMI_CLASSI[0])
          : (isSecMc ? (secMcObj?.classe || scheda.classe) : scheda.classe);

        const targetLivelloVecchio = isNewMc
          ? 0
          : (isSecMc ? Math.max(1, num(secMcObj?.livello, 1)) : Math.max(1, num(scheda.livello, 1)));

        const targetLivelloNuovo = targetLivelloVecchio + 1;

        const livTotVecchio = Math.max(1, num(scheda.livello, 1)) + mcArray.reduce((a, m) => a + Math.max(1, num(m.livello, 1)), 0);
        const nuovoLivello = livTotVecchio + 1; // LIVELLO TOTALE del personaggio

        // Dadi Vita ed HP Gain per LA CLASSE SCELTA
        const facceTargetDV = dadoVitaClasse(targetClasse);
        const modCos = modificatore(scheda.caratteristiche?.costituzione || 10) || 0;
        const avgHpGainTarget = Math.floor(facceTargetDV / 2) + 1 + modCos;

        const gain = levelUpBozza.metodo === 'media'
          ? (levelUpBozza.hpGainMedia != null ? levelUpBozza.hpGainMedia : avgHpGainTarget)
          : (levelUpBozza.tiroFatto > 0 ? Math.max(1, levelUpBozza.tiroFatto + modCos) : null);

        const bcVecchio = scheda.bonusCompetenza;
        const bcNuovo = bonusCompetenzaDaLivello(nuovoLivello);

        // Configurazione classi per calcolo slot unificati
        const classiNuove = isNewMc
          ? [{ classe: scheda.classe, livello: Math.max(1, num(scheda.livello, 1)) }, ...mcArray, { classe: targetClasse, livello: 1 }]
          : (isSecMc
              ? [{ classe: scheda.classe, livello: Math.max(1, num(scheda.livello, 1)) }, ...mcArray.map((m, idx) => idx === targetMode ? { ...m, livello: Math.max(1, num(m.livello, 1)) + 1 } : m)]
              : [{ classe: scheda.classe, livello: Math.max(1, num(scheda.livello, 1)) + 1 }, ...mcArray]);

        const isTotMc = classiNuove.filter((c) => c && c.classe).length > 1;
        const slotNuovi = isTotMc ? slotMulticlasse(classiNuove) : slotDaClasseLivello(targetClasse, targetLivelloNuovo);
        const slotVecchi = isTotMc ? slotMulticlasse([{ classe: scheda.classe, livello: Math.max(1, num(scheda.livello, 1)) }, ...mcArray]) : slotDaClasseLivello(scheda.classe, Math.max(1, num(scheda.livello, 1)));

        const slotStr = slotNuovi
          ? Object.keys(slotNuovi).filter((l) => slotNuovi[l].totale > 0).map((l) => `${l}° ×${slotNuovi[l].totale}`).join(' · ')
          : null;

        const trOld = trucchettiMax(targetClasse, targetLivelloVecchio);
        const trNew = trucchettiMax(targetClasse, targetLivelloNuovo);
        const nuoviTrucchetti = (trOld != null && trNew != null) ? Math.max(0, trNew - trOld) : (isNewMc && trNew != null ? trNew : 0);
        const incOld = incantesimiMaxAuto(scheda, versione);
        const incNew = incantesimiMaxAuto({ ...scheda, livello: isNewMc || isSecMc ? Math.max(1, num(scheda.livello, 1)) : targetLivelloNuovo }, versione);
        const nuoviIncantesimi = (incOld != null && incNew != null) ? Math.max(0, incNew - incOld) : 0;
        const maxLivSlot = (obj) => obj ? Math.max(0, ...Object.keys(obj).filter((l) => obj[l].totale > 0).map(Number)) : 0;
        const nuovoLivInc = slotNuovi && maxLivSlot(slotNuovi) > maxLivSlot(slotVecchi) ? maxLivSlot(slotNuovi) : 0;

        const privNuoviTutti = isNewMc && targetLivelloNuovo === 1
          ? privilegiClasseL1(targetClasse, versione)
          : privilegiClasseLivello(targetClasse, targetLivelloNuovo, versione);
        const attualiPriv = (scheda.privilegi || '');
        const privNuovi = privNuoviTutti
          ? privNuoviTutti.split('\n').filter((r) => r.trim() && !attualiPriv.includes(r.trim())).join('\n')
          : '';

        const haASI = asiAlLivello(targetClasse, targetLivelloNuovo);
        const haSub = sottoclasseAlLivello(targetClasse, targetLivelloNuovo, versione);
        const scelteSub = sottoclassiPerClasse(targetClasse);
        const mostraSceltaSub = targetLivelloNuovo === livelloSceltaSottoclasse(targetClasse, versione) && scelteSub.length > 0;
        const subSel = mostraSceltaSub ? (levelUpBozza.sottoclasse || '') : (isSecMc ? (secMcObj?.sottoclasse || '') : (scheda.sottoclasse || ''));
        const subTab = SUBCLASS_PRIVILEGI[subSel];
        const attualiSub = (scheda.privilegiSottoclasse || '');
        const subPrivNuovi = subTab && subTab[targetLivelloNuovo]
          ? subTab[targetLivelloNuovo].split('\n').filter((r) => r.trim() && !attualiSub.includes(r.trim())).join('\n')
          : '';

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
          <div style={{ ...styles.panel, maxWidth: 440, width: '100%', maxHeight: '88vh', overflowY: 'auto' }}>
            <h1 style={{ ...styles.title, textAlign: 'center', marginBottom: 12 }}>⬆️ {t('levelup.titolo')}</h1>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              Livello Personaggio: <strong>{livTotVecchio}</strong> → <strong>{nuovoLivello}</strong>
            </div>

            {/* Selettore Classe (True Multiclassing) */}
            <div style={{ marginBottom: 16, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.goldDark}`, borderRadius: 8, padding: '10px 12px' }}>
              <label style={{ ...styles.detail, display: 'block', marginBottom: 8, fontWeight: 'bold', color: C.goldDark, fontSize: 13 }}>
                ⚔️ Scegli la classe per questo avanzamento:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* 1) Classe Principale */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, background: targetMode === 'main' ? 'rgba(214,169,15,0.15)' : 'transparent', padding: '6px 8px', borderRadius: 6, border: targetMode === 'main' ? `1px solid ${C.goldDark}` : '1px solid transparent' }}>
                  <input
                    type="radio"
                    name="mc_target"
                    checked={targetMode === 'main'}
                    onChange={() => {
                      const fDV = dadoVitaClasse(scheda.classe);
                      setLevelUpBozza((b) => ({ ...b, target: 'main', facceDV: fDV, hpGainMedia: Math.max(1, Math.floor(fDV/2) + 1 + modCos), tiroFatto: 0 }));
                    }}
                  />
                  <span>🥇 <strong>{scheda.classe}</strong> (da Liv. {scheda.livello || 1} → <strong>Liv. {(scheda.livello || 1) + 1}</strong>)</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.85, fontWeight: 'bold' }}>DV: d{dadoVitaClasse(scheda.classe)}</span>
                </label>

                {/* 2) Classi Secondarie esistenti */}
                {mcArray.map((m, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, background: targetMode === idx ? 'rgba(214,169,15,0.15)' : 'transparent', padding: '6px 8px', borderRadius: 6, border: targetMode === idx ? `1px solid ${C.goldDark}` : '1px solid transparent' }}>
                    <input
                      type="radio"
                      name="mc_target"
                      checked={targetMode === idx}
                      onChange={() => {
                        const fDV = dadoVitaClasse(m.classe);
                        setLevelUpBozza((b) => ({ ...b, target: idx, facceDV: fDV, hpGainMedia: Math.max(1, Math.floor(fDV/2) + 1 + modCos), tiroFatto: 0 }));
                      }}
                    />
                    <span>🥈 <strong>{m.classe}</strong> (da Liv. {m.livello || 1} → <strong>Liv. {(num(m.livello, 1)) + 1}</strong>)</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.85, fontWeight: 'bold' }}>DV: d{dadoVitaClasse(m.classe)}</span>
                  </label>
                ))}

                {/* 3) Nuova Classe Secondaria (Multiclasse) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: targetMode === 'new' ? 'rgba(214,169,15,0.15)' : 'transparent', padding: '6px 8px', borderRadius: 6, border: targetMode === 'new' ? `1px solid ${C.goldDark}` : '1px solid transparent', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="radio"
                      name="mc_target"
                      checked={targetMode === 'new'}
                      onChange={() => {
                        const firstNew = NOMI_CLASSI.find((n) => n !== scheda.classe && !mcArray.some((x) => x.classe === n)) || NOMI_CLASSI[0];
                        const fDV = dadoVitaClasse(levelUpBozza.nuovaClasseMc || firstNew);
                        setLevelUpBozza((b) => ({ ...b, target: 'new', nuovaClasseMc: b.nuovaClasseMc || firstNew, facceDV: fDV, hpGainMedia: Math.max(1, Math.floor(fDV/2) + 1 + modCos), tiroFatto: 0 }));
                      }}
                    />
                    <span>➕ <strong>Nuova Classe:</strong></span>
                  </label>
                  {targetMode === 'new' && (
                    <select
                      value={levelUpBozza.nuovaClasseMc || ''}
                      onChange={(e) => {
                        const nc = e.target.value;
                        const fDV = dadoVitaClasse(nc);
                        setLevelUpBozza((b) => ({ ...b, nuovaClasseMc: nc, facceDV: fDV, hpGainMedia: Math.max(1, Math.floor(fDV/2) + 1 + modCos), tiroFatto: 0 }));
                      }}
                      style={{ ...styles.inlineInput, padding: '3px 8px', fontSize: 13, fontWeight: 'bold' }}
                    >
                      {NOMI_CLASSI.map((n) => (
                        <option key={n} value={n} disabled={n === scheda.classe || mcArray.some((x) => x.classe === n)}>{traduciDato(n)}</option>
                      ))}
                    </select>
                  )}
                  {targetMode === 'new' && (
                    <span style={{ fontSize: 12, color: C.goldDark, marginLeft: 'auto', fontWeight: 'bold' }}>→ Liv. 1 (DV: d{dadoVitaClasse(levelUpBozza.nuovaClasseMc || 'Guerriero')})</span>
                  )}
                </div>
              </div>
            </div>

            <p style={{ ...styles.detail, marginBottom: 14, lineHeight: 1.4 }}>
              {t('levelup.desc_hp', { cos: conSegno(modCos) })}
            </p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div
                style={{ ...styles.button, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, borderColor: levelUpBozza.metodo === 'media' ? C.goldDark : C.border, background: levelUpBozza.metodo === 'media' ? 'rgba(255,215,0,0.1)' : 'transparent' }}
                onClick={() => setLevelUpBozza((b) => ({ ...b, metodo: 'media' }))}
              >
                <div style={{ fontWeight: 'bold' }}>{t('levelup.media_fissa')}</div>
                <div style={{ fontSize: 20, color: C.goldDark }}>+{levelUpBozza.hpGainMedia != null ? levelUpBozza.hpGainMedia : avgHpGainTarget} PF</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>({Math.floor(facceTargetDV / 2) + 1} {modCos !== 0 ? conSegno(modCos) : ''})</div>
              </div>

              <div
                style={{ ...styles.button, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, borderColor: levelUpBozza.metodo === 'tiro' ? C.goldDark : C.border, background: levelUpBozza.metodo === 'tiro' ? 'rgba(255,215,0,0.1)' : 'transparent' }}
                onClick={() => setLevelUpBozza((b) => ({ ...b, metodo: 'tiro' }))}
              >
                <div style={{ fontWeight: 'bold' }}>{t('levelup.tira_dado', { facce: facceTargetDV })}</div>
                <div style={{ fontSize: 20, color: C.goldDark }}>
                  {levelUpBozza.tiroFatto > 0 ? `+${Math.max(1, levelUpBozza.tiroFatto + modCos)} PF` : '? PF'}
                </div>
                <div>
                  {levelUpBozza.tiroFatto > 0 ? t('levelup.hai_tirato', { n: levelUpBozza.tiroFatto }) : <button style={{ ...styles.buttonMini, fontSize: 12 }} onClick={(e) => { e.stopPropagation(); setLevelUpBozza((b) => ({ ...b, tiroFatto: Math.floor(Math.random() * b.facceDV) + 1, metodo: 'tiro' })); }}>{t('levelup.tira_ora')}</button>}
                </div>
              </div>
            </div>

            {mostraSceltaSub && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ ...styles.detail, display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                  🌟 {t('levelup.scegli_sub')} ({targetClasse}):
                </label>
                <select
                  style={{ ...styles.inlineInput, width: '100%', padding: '6px 8px', fontSize: 14 }}
                  value={levelUpBozza.sottoclasse || ''}
                  onChange={(e) => setLevelUpBozza((b) => ({ ...b, sottoclasse: e.target.value }))}
                >
                  <option value="">{t('crea.scegli')}</option>
                  {scelteSub.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {haASI && (
              <div style={{ marginBottom: 14, background: 'rgba(0,0,0,0.03)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: 6 }}>🎯 {t('levelup.asi_o_talento')} ({targetClasse})</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {[['aumento', t('levelup.aumento_car')], ['talento', t('levelup.talento')]].map(([m, lab]) => (
                    <button key={m} style={levelUpBozza.asiMode === m ? styles.modeButton(true) : styles.modeButton(false)} onClick={() => setLevelUpBozza((b) => ({ ...b, asiMode: m }))}>{lab}</button>
                  ))}
                </div>
                {levelUpBozza.asiMode === 'talento' ? (
                  <div>
                    <select
                      style={{ ...styles.inlineInput, width: '100%', padding: '6px 8px', fontSize: 14, marginBottom: 6 }}
                      value={TALENTI_5E.some((t) => t.nome === levelUpBozza.talento) ? levelUpBozza.talento : '__altro'}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLevelUpBozza((b) => ({ ...b, talento: v === '__altro' ? '' : v }));
                      }}
                    >
                      <option value="">{t('crea.scegli')}</option>
                      {TALENTI_5E.map((tl) => <option key={tl.nome} value={tl.nome}>{tl.nome} — {tl.desc}</option>)}
                      <option value="__altro">{t('levelup.altro_talento')}</option>
                    </select>
                    {(!levelUpBozza.talento || !TALENTI_5E.some((t) => t.nome === levelUpBozza.talento)) && (
                      <input
                        type="text"
                        placeholder={t('levelup.nome_talento_custom')}
                        style={{ ...styles.inlineInput, width: '100%', padding: '6px 8px', fontSize: 13 }}
                        value={levelUpBozza.talento || ''}
                        onChange={(e) => setLevelUpBozza((b) => ({ ...b, talento: e.target.value }))}
                      />
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {['asiA', 'asiB'].map((campo) => (
                      <label key={campo} style={{ ...styles.detail, fontSize: 12 }}>
                        <span style={{ display: 'block', marginBottom: 2 }}>{t('levelup.piu1_a')}</span>
                        <select
                          style={{ ...styles.inlineInput, width: '100%', fontSize: 13, padding: '4px 6px' }}
                          value={levelUpBozza[campo] || ''}
                          onChange={(e) => setLevelUpBozza((b) => ({ ...b, [campo]: e.target.value }))}
                        >
                          <option value="">—</option>
                          {CARATTERISTICHE.map(({ key }) => <option key={key} value={key}>{t('attr.' + key)}</option>)}
                        </select>
                      </label>
                    ))}
                    <div style={{ gridColumn: '1 / -1', ...styles.detail, fontSize: 11, color: C.inkDim }}>
                      {t('levelup.asi_nota')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Riepilogo: cosa cambia salendo di livello */}
            <div style={{ ...styles.panelSoft || {}, background: 'rgba(0,0,0,0.03)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 13 }}>
              <div style={{ fontWeight: 'bold', color: C.goldDark, marginBottom: 6 }}>📋 {t('levelup.cosa_cambia')}</div>
              <div style={rigaCambio}><span>{t('levelup.pf_massimi')}</span><strong>{gain != null ? `+${gain}` : '—'}</strong></div>
              <div style={rigaCambio}><span>{t('levelup.dadi_vita')}</span><strong>{calcolaFormulaDadiVita(scheda.classe, isNewMc || isSecMc ? Math.max(1, num(scheda.livello, 1)) : targetLivelloNuovo, classiNuove.slice(1))}</strong></div>
              {bcNuovo !== bcVecchio && (
                <div style={rigaCambio}><span>{t('levelup.bonus_comp')}</span><strong>{conSegno(bcVecchio)} → {conSegno(bcNuovo)} ⬆️</strong></div>
              )}
              {slotStr && (
                <div style={{ padding: '3px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div>{t('levelup.slot_inc', { n: nuovoLivello })}</div>
                  <div style={{ color: C.inkDim, marginTop: 2 }}>{slotStr}</div>
                  {nuovoLivInc > 0 && <div style={{ color: C.green, marginTop: 2 }}>{t('levelup.sblocchi', { n: nuovoLivInc })}</div>}
                </div>
              )}
              {(nuoviTrucchetti > 0 || nuoviIncantesimi > 0) && (
                <div style={{ padding: '3px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div>{t('levelup.nuovi_inc')}</div>
                  {nuoviTrucchetti > 0 && <div style={{ color: C.green, marginTop: 2 }}>• {t('levelup.piu_trucchetti', { n: nuoviTrucchetti })}</div>}
                  {nuoviIncantesimi > 0 && <div style={{ color: C.green, marginTop: 2 }}>• {t('levelup.piu_incantesimi', { n: nuoviIncantesimi })}</div>}
                  <div style={{ ...styles.detail, fontSize: 11, color: C.inkDim, marginTop: 2 }}>{t('levelup.aggiungi_dopo')}</div>
                </div>
              )}
              {privNuovi && (
                <div style={{ padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ marginBottom: 2 }}>{t('levelup.nuovi_priv')} ({targetClasse}):</div>
                  {privNuovi.split('\n').map((r, i) => <div key={i} style={{ color: C.green }}>• {r}</div>)}
                </div>
              )}
              {mostraSceltaSub && (
                <div style={rigaCambio}><span>{t('levelup.sottoclasse')} ({targetClasse})</span><strong>{levelUpBozza.sottoclasse || t('levelup.da_scegliere')}</strong></div>
              )}
              {subPrivNuovi ? (
                <div style={{ padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ marginBottom: 2 }}>{t('levelup.nuovi_priv_sub')}</div>
                  {subPrivNuovi.split('\n').map((r, i) => <div key={i} style={{ color: C.green }}>• {r}</div>)}
                </div>
              ) : haSub && !mostraSceltaSub ? (
                <div style={{ padding: '5px 0', color: C.inkDim }}>🌟 {t('levelup.sub_guadagna')} ({targetClasse})</div>
              ) : null}
              {haASI && (
                <div style={rigaCambio}>
                  <span>{t('levelup.aumento_talento')} ({targetClasse})</span>
                  <strong>{levelUpBozza.asiMode === 'talento'
                    ? ((levelUpBozza.talento || '').trim() || t('levelup.talento_da_indicare'))
                    : ((levelUpBozza.asiA || levelUpBozza.asiB)
                      ? [levelUpBozza.asiA, levelUpBozza.asiB].filter(Boolean).map((k) => t('attr.' + k)).join(', ')
                      : t('levelup.da_scegliere'))}</strong>
                </div>
              )}
            </div>

            <button
              style={{ ...styles.buttonPrimary, width: '100%', marginBottom: 12 }}
              disabled={!hpOk || !asiCompleto}
              onClick={() => {
                const g = levelUpBozza.metodo === 'media' ? (levelUpBozza.hpGainMedia != null ? levelUpBozza.hpGainMedia : avgHpGainTarget) : Math.max(1, levelUpBozza.tiroFatto + modCos);
                const patch = {
                  pfMax: (scheda.pfMax || 10) + g,
                  pfAttuali: (scheda.pfAttuali || 10) + g,
                  bonusCompetenza: bcNuovo,
                };

                if (isNewMc) {
                  const newMcItem = { classe: targetClasse, livello: 1 };
                  if (mostraSceltaSub && levelUpBozza.sottoclasse) newMcItem.sottoclasse = levelUpBozza.sottoclasse;
                  patch.multiclasse = [...mcArray, newMcItem];
                } else if (isSecMc) {
                  patch.multiclasse = mcArray.map((m, idx) => {
                    if (idx === targetMode) {
                      const updated = { ...m, livello: (num(m.livello, 1)) + 1 };
                      if (mostraSceltaSub && levelUpBozza.sottoclasse) updated.sottoclasse = levelUpBozza.sottoclasse;
                      return updated;
                    }
                    return m;
                  });
                } else {
                  patch.livello = Math.max(1, num(scheda.livello, 1)) + 1;
                  if (mostraSceltaSub && levelUpBozza.sottoclasse) patch.sottoclasse = levelUpBozza.sottoclasse;
                }

                const nextLivMain = isNewMc || isSecMc ? (scheda.livello || 1) : patch.livello;
                const nextMcArray = patch.multiclasse || mcArray;
                patch.dadiVita = calcolaFormulaDadiVita(scheda.classe, nextLivMain, nextMcArray);

                if (slotNuovi) {
                  const cur = scheda.slotIncantesimo || {};
                  for (let idx = 1; idx <= 9; idx++) if (slotNuovi[idx]) slotNuovi[idx].spesi = Math.min(slotNuovi[idx].totale, cur[idx]?.spesi || 0);
                  patch.slotIncantesimo = slotNuovi;
                }

                if (privNuovi) patch.privilegi = attualiPriv.trim() ? `${attualiPriv.trim()}\n${privNuovi}` : privNuovi;
                if (subPrivNuovi) patch.privilegiSottoclasse = attualiSub.trim() ? `${attualiSub.trim()}\n${subPrivNuovi}` : subPrivNuovi;
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
              🚀 Conferma Level Up ({targetClasse})
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
              <h1 style={{ ...styles.title, marginBottom: 12 }}>{t('menu.nuovo_personaggio')}</h1>

              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
                <span style={styles.detail}>{t('crea.versione')}</span>
                {['2024', '2014'].map((v) => (
                  <button key={v} style={{ ...styles.modeButton(regoleVersione === v), fontSize: 12, padding: '3px 10px' }} onClick={() => setRegoleVersione(v)}>
                    {v === '2024' ? 'D&D 5.5' : 'D&D 5.0'}
                  </button>
                ))}
              </div>

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>{t('crea.nome')}</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <input style={{ ...stileSelect, flex: 1, marginBottom: 0 }} value={bozzaCrea.nome} placeholder={t('crea.nome_placeholder')} onChange={(e) => setB({ nome: e.target.value })} />
                <button style={styles.buttonMini} title={t('crea.genera_nome')} onClick={() => setB({ nome: nomeCasuale(bozzaCrea.specie) })}>🎲</button>
              </div>

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>{regoleVersione === '2024' ? t('crea.specie') : t('crea.razza')}</label>
              <select style={{ ...stileSelect, marginBottom: bozzaCrea.specie ? 4 : 12 }} value={bozzaCrea.specie} onChange={(e) => setB({ specie: e.target.value, competenzeSpecie: [] })}>
                <option value="">{t('crea.scegli')}</option>
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
                    {d && <div>🏃 {t('vital.movimento')} {d.velocita} m · 📏 {d.taglia}{d.sensi ? ` · 👁 ${d.sensi}` : ''}</div>}
                    {d && <div>✨ {t('crea.tratti')}: {d.tratti}</div>}
                    <div style={{ color: C.inkDim }}>
                      💪 {t('crea.bonus_car')}: {regoleVersione === '2024' ? t('crea.bonus_bg') : t('crea.bonus_razza')}
                    </div>
                  </div>
                );
              })()}

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>{t('crea.classe')}</label>
              <select style={{ ...stileSelect, marginBottom: 12 }} value={bozzaCrea.classe} onChange={(e) => setB({ classe: e.target.value, competenzeClasse: [] })}>
                <option value="">{t('crea.scegli')}</option>
                {NOMI_CLASSI.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>{t('crea.background')}</label>
              <select style={{ ...stileSelect, marginBottom: 6 }} value={bozzaCrea.background} onChange={(e) => setB({ background: e.target.value })}>
                <option value="">{t('crea.scegli')}</option>
                {BACKGROUND_5E.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              {bozzaCrea.background && (
                <div style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', marginBottom: 12, fontSize: 11, lineHeight: 1.5 }}>
                  <div>🎓 {t('crea.competenze')}: {(BACKGROUND_COMPETENZE[bozzaCrea.background] || []).map((k) => t('skill.' + k)).join(', ') || '—'}</div>
                  {regoleVersione === '2024' && bonusBg.length > 0 && (
                    <div>💪 {t('crea.caratteristiche')}: +2 {bonusBg[0]?.slice(0, 3).toUpperCase()}, +1 {bonusBg[1]?.slice(0, 3).toUpperCase()} ({t('crea.a_scelta')})</div>
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
                      {t('crea.competenze_classe')} — {t('crea.scegli_n')} {cc.numero} <span style={{ fontWeight: 'normal', color: pieno ? C.green : C.inkDim }}>({scelte.length}/{cc.numero})</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {cc.lista.map((k) => {
                        const lab = t('skill.' + k);
                        const sel = scelte.includes(k);
                        const daBg = bgSkills.includes(k);
                        return (
                          <button
                            key={k}
                            disabled={daBg || (!sel && pieno)}
                            onClick={() => toggle(k)}
                            style={{ ...styles.modeButton(sel), fontSize: 11, padding: '3px 8px', opacity: daBg ? 0.45 : 1 }}
                            title={daBg ? t('crea.gia_bg') : (!sel && pieno ? t('crea.gia_scelte', { n: cc.numero }) : t('crea.click_scegli'))}
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
                      {t('crea.competenze_specie')} · {cs.tratto} — {t('crea.scegli_n')} {cs.numero} <span style={{ fontWeight: 'normal', color: pieno ? C.green : C.inkDim }}>({scelte.length}/{cs.numero})</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {cs.lista.map((k) => {
                        const lab = t('skill.' + k);
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
                        {CARATTERISTICHE.map(({ key }) => {
                          const usatiAltrove = Object.entries(bozzaCrea.assegna).filter(([k]) => k !== key).map(([, idx]) => idx);
                          return (
                            <label key={key} style={{ ...styles.detail, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                              <span style={{ width: 66 }}>{t('attr.' + key)}</span>
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
                <button style={{ ...styles.buttonPrimary, flex: 1 }} onClick={() => creaPersonaggio(bozzaCrea)}>{t('crea.crea_pg')}</button>
                <button style={styles.button} onClick={() => setMostraCrea(false)}>{t('modal.annulla')}</button>
              </div>
            </div>
          </div>
        );
      })()}

      <header className="app-header" style={styles.header}>
        <div className="app-header-group" style={{ display: 'flex', gap: 6 }}>
          <button
            style={styles.modeButton(false)}
            title={t('tip.menu_iniziale')}
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
            title={t('tip.esporta')}
            onClick={esportaJson}
          >
            💾 Esporta
          </button>
          <button
            style={styles.modeButton(false)}
            title={t('tip.importa')}
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
            style={styles.modeButton(false)}
            title={lingua === 'it' ? 'Interfaccia in italiano — click per passare all’inglese' : 'Interface in English — click to switch to Italian'}
            onClick={() => setLingua((l) => (l === 'it' ? 'en' : 'it'))}
          >
            {lingua === 'it' ? '🇮🇹 IT' : '🇬🇧 EN'}
          </button>
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
            title={t('tooltip.tema')}
            onClick={() => setTema(tema === 'auto' ? 'chiaro' : tema === 'chiaro' ? 'scuro' : 'auto')}
          >
            {tema === 'auto' ? t('btn.tema.auto') : tema === 'chiaro' ? t('btn.tema.chiaro') : t('btn.tema.scuro')}
          </button>
          <button
            style={{ ...styles.modeButton(presetColori !== 'default'), fontSize: 14, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
            title="Ambientazione: cambia insieme colori, sfondo e audio · click per aprire"
            onClick={() => { sbloccaAudio(); setMostraPannelloAudio(!mostraPannelloAudio); }}
          >
            🎭 {PRESET_COLORI.find(p => p.id === presetColori)?.nome.split(' ')[0] || '🟤'}
          </button>
        </div>

      </header>

      {mostraPannelloAudio && (
        <div style={{
          background: C.panelLight, borderBottom: `1px solid ${C.border}`, padding: '10px 16px',
          display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontWeight: 'bold', color: C.goldDark, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🎭 Ambientazione</span>
              <span style={{ fontSize: 11, fontWeight: 'normal', color: C.inkDim }}>(colori, sfondo e audio insieme · tutto offline)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: C.inkDim }}>🔊</span>
              <input
                type="range" min="0" max="1" step="0.05"
                value={volumeAudio}
                onChange={(e) => setVolumeAudio(e.target.value)}
                style={{ width: 100, accentColor: C.gold }}
                title="Volume del sottofondo"
              />
              <span style={{ minWidth: 35, textAlign: 'right', fontSize: 12, fontWeight: 'bold' }}>{Math.round(volumeAudio * 100)}%</span>
              <button
                onClick={() => setEffettiSonoriAttivi((v) => !v)}
                title={effettiSonoriAttivi ? 'Effetti sonori dei dadi attivi' : 'Effetti sonori dei dadi disattivati'}
                style={{
                  ...styles.btnMini, marginLeft: 4,
                  border: `1px solid ${effettiSonoriAttivi ? C.gold : C.border}`,
                  background: effettiSonoriAttivi ? C.gold : C.panel,
                  color: effettiSonoriAttivi ? '#fff' : C.inkDim, fontWeight: 'bold'
                }}
              >🎲 FX {effettiSonoriAttivi ? 'ON' : 'OFF'}</button>
              <button
                style={{ ...styles.btnMini, marginLeft: 4 }}
                onClick={() => setMostraPannelloAudio(false)}
              >✕</button>
            </div>
          </div>

          {/* Ambientazioni: un click applica palette + sfondo + audio abbinato */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 6 }}>
            {PRESET_COLORI.map((p) => {
              const attivo = presetColori === p.id;
              const conSuono = p.audio && p.audio !== 'spento';
              return (
                <button
                  key={p.id}
                  onClick={() => { sbloccaAudio(); setPresetColori(p.id); setAmbienteAudio(p.audio); }}
                  title={`${p.nome}${conSuono ? ' · con sottofondo' : ' · nessun sottofondo'}`}
                  style={{
                    padding: '7px 10px', borderRadius: 6, border: `1px solid ${attivo ? C.gold : C.border}`,
                    background: attivo ? C.gold : C.panel, color: attivo ? '#ffffff' : C.ink,
                    cursor: 'pointer', fontWeight: attivo ? 'bold' : 'normal', textAlign: 'left',
                    display: 'flex', flexDirection: 'column', gap: 2,
                    transition: 'all 0.15s ease', boxShadow: attivo ? `0 2px 6px ${C.gold}` : 'none'
                  }}
                >
                  <span>{p.nome}</span>
                  <span style={{ fontSize: 10, opacity: 0.8 }}>
                    {conSuono ? '🔊 sottofondo' : '🔇 silenzio'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Audio personalizzato (facoltativo): sovrascrive il sottofondo con un MP3/stream */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => { sbloccaAudio(); setAmbienteAudio(ambienteAudio === 'custom' ? 'spento' : 'custom'); }}
              title="Usa un file/stream audio da URL al posto del sottofondo generato"
              style={{
                ...styles.btnMini,
                border: `1px solid ${ambienteAudio === 'custom' ? C.gold : C.border}`,
                background: ambienteAudio === 'custom' ? C.gold : C.panel,
                color: ambienteAudio === 'custom' ? '#fff' : C.ink
              }}
            >🔗 Audio personalizzato</button>
            {ambienteAudio === 'custom' && (
              <input
                type="text"
                placeholder="https://esempio.com/suono-dungeon.mp3"
                value={urlCustomAudio}
                onChange={(e) => setUrlCustomAudio(e.target.value)}
                style={{ flex: 1, minWidth: 200, padding: '6px 10px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.panel, color: C.ink }}
              />
            )}
          </div>

          <div style={{ fontSize: 10, color: C.inkDim, opacity: 0.8, textAlign: 'center' }}>
            🔊 Suoni ambientali reali da Freesound.com · licenza CC0 (dominio pubblico)
          </div>
        </div>
      )}

      <main style={styles.main}>

        {/* Barra del tiro */}
        <div style={styles.rollBar}>
          {(rolling || tiro || danni) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', paddingBottom: 6, borderBottom: `1px solid ${C.border}`, marginBottom: 2 }}>
              <div style={styles.dado(rolling, !rolling && (tiro?.naturale === 20 || danni?.critico), !rolling && (tiro?.naturale === 1), tipoDadoInUso)}>{faccia}</div>
              <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {rolling ? (
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: C.inkDim, marginLeft: 8 }}>Tirando...</div>
                ) : tiro ? (
                  <div style={{ marginLeft: 8 }}>
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
                        <div style={styles.detail}>{t('atk.danno_invalido')}</div>
                      )
                    )}
                  </div>
                ) : danni ? (
                  <div style={{ marginLeft: 8 }}>
                    <div style={{ fontSize: 13, color: C.inkDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
                      {danni.etichetta}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {danni.libero || danni.tabella || /magia selvaggia/i.test(danni.etichetta) ? '✨' : danni.guarigione ? '✚' : '💥'} <strong>{danni.totale}</strong>
                      {danni.libero || danni.tabella || /magia selvaggia/i.test(danni.etichetta) ? '' : danni.guarigione ? ' PF recuperati' : ' danni'}
                      {danni.critico && <span style={styles.badge(C.goldDark)}>⚔ CRITICO!</span>}
                    </div>
                    <div style={{ ...styles.detail, marginTop: 4 }}>
                      {t('roll.dettaglio')}: {danni.dettaglio}
                    </div>
                  </div>
                ) : null}
              </div>
              <button
                style={{ ...styles.buttonMini, color: C.inkDim, alignSelf: 'flex-start', padding: '4px 8px' }}
                title="Chiudi risultato tiro"
                onClick={() => { setTiro(null); setDanni(null); }}
              >✖</button>
            </div>
          )}

          <div className="dadi-riga" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', width: '100%', padding: '1px 0' }}>
            <span style={{ ...styles.detail, marginRight: 2, flexShrink: 0, fontWeight: 700, fontSize: 13 }}>{t('roll.dado')}:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              {[4, 6, 8, 10, 12, 20, 100].map((facce) => {
                let pts = "";
                if (facce === 4) pts = "20,4 36,36 4,36";
                else if (facce === 6) pts = "6,6 34,6 34,34 6,34";
                else if (facce === 8) pts = "20,4 36,20 20,36 4,20";
                else if (facce === 10) pts = "20,4 36,16 20,36 4,16";
                else if (facce === 12) pts = "20,4 36,14 30,36 10,36 4,14";
                else if (facce === 20) pts = "10,4 30,4 38,20 30,36 10,36 2,20";
                return (
                  <button
                    key={facce}
                    className="dado-btn"
                    onClick={() => tiroLibero(facce)}
                    style={{
                      position: 'relative', width: 30, height: 30, background: 'none', border: 'none', cursor: 'pointer',
                      padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'none'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                  >
                    <svg width="30" height="30" viewBox="0 0 40 40" style={{ position: 'absolute', top: 0, left: 0 }}>
                      {facce === 100 ? (
                        <circle cx="20" cy="20" r="16" fill="var(--c-gold)" stroke="var(--c-gold-dark)" strokeWidth="2" />
                      ) : (
                        <polygon points={pts} fill="var(--c-gold)" stroke="var(--c-gold-dark)" strokeWidth="2" strokeLinejoin="round" />
                      )}
                    </svg>
                    <span style={{ position: 'relative', zIndex: 1, fontWeight: 800, color: '#000', fontSize: 10, marginTop: facce === 4 ? 4 : facce === 10 ? 2 : 0 }}>
                      d{facce}
                    </span>
                  </button>
                );
              })}
              <input
                style={{
                  ...styles.inlineInput,
                  flex: '0 1 95px', minWidth: 70, maxWidth: 120,
                  padding: '3px 8px', height: 28, fontSize: 13,
                  marginLeft: 4,
                  ...(erroreEspressione ? { borderColor: C.red } : {}),
                }}
                placeholder={t('roll.espr_placeholder') || 'Es. 1d6+2'}
                title="Premi Invio per tirare"
                value={espressioneLibera}
                onChange={(e) => {
                  setEspressioneLibera(e.target.value);
                  setErroreEspressione(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && tiroEspressione()}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap' }}>
              {['normale', 'vantaggio', 'svantaggio'].map((m) => (
                <button key={m} style={styles.modeButton(modalita === m)} onClick={() => setModalita(m)}>
                  {m === 'normale' ? t('roll.normale') : m === 'vantaggio' ? t('roll.vantaggio') : t('roll.svantaggio')}
                </button>
              ))}
              <button
                style={styles.modeButton(storicoAperto)}
                title={t('roll.cronologia_tooltip')}
                onClick={() => setStoricoAperto(!storicoAperto)}
              >
                {t('roll.cronologia')}
              </button>
            </div>
          </div>
          {erroreEspressione && <div style={{ color: C.red, fontSize: 13, width: '100%' }}>{t('roll.espr_invalida')}</div>}
        </div>

        {storicoAperto && (
          <section style={{ ...styles.panel, padding: '10px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
              <h2 style={{ ...styles.panelTitle, fontSize: 13, margin: 0 }}>{t('roll.cronologia')}</h2>
              {storico.length > 0 && (
                <button style={{ ...styles.buttonMini, color: C.red }} title={t('log.svuota_tooltip')} onClick={() => setStorico([])}>🧹 {t('log.svuota')}</button>
              )}
            </div>
            {storico.length === 0 ? (
              <div style={styles.detail}>{t('roll.nessun_tiro')}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 360, overflowY: 'auto' }}>
                {storico.map((voce) => {
                  const isObj = voce && typeof voce === 'object';
                  if (!isObj) {
                    return <div key={String(voce)} style={{ ...styles.detail, padding: '2px 0' }}>{voce}</div>;
                  }
                  const colore = voce.critico ? C.green : voce.fumble ? C.red : voce.tipo === 'cura' ? C.green : C.gold;
                  const ora = new Date(voce.ts || Date.now()).toLocaleTimeString(lingua === 'it' ? 'it-IT' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={voce.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.04)', border: `1px solid ${voce.critico ? C.green : voce.fumble ? C.red : C.border}` }}>
                      <div style={{ minWidth: 40, textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1, color: colore }}>{voce.totale != null ? voce.totale : '—'}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: C.ink, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span>{voce.etichetta}</span>
                          {voce.critico && <span style={styles.badge(C.green)}>{t('log.critico')}</span>}
                          {voce.fumble && <span style={styles.badge(C.red)}>{t('log.fallimento')}</span>}
                          {voce.tipo === 'd20' && voce.modalita && voce.modalita !== 'normale' && (
                            <span style={styles.badge(C.goldDark)}>{voce.modalita === 'vantaggio' ? t('roll.vantaggio') : t('roll.svantaggio')}</span>
                          )}
                        </div>
                        <div style={{ ...styles.detail, fontSize: 11 }}>
                          {ora}{voce.personaggio ? ` · ${voce.personaggio}` : ''}{voce.dettaglio ? ` · ${voce.dettaglio}` : ''}
                        </div>
                        <input
                          value={voce.nota || ''}
                          onChange={(e) => setStorico((s) => s.map((x) => (x.id === voce.id ? { ...x, nota: e.target.value } : x)))}
                          placeholder={t('log.nota_ph')}
                          style={{ ...styles.inlineInput, marginTop: 3, fontSize: 11, padding: '2px 6px', width: '100%', maxWidth: 260 }}
                        />
                      </div>
                      <button style={{ ...styles.buttonMini, color: C.red, alignSelf: 'flex-start' }} title={t('log.elimina_tooltip')} onClick={() => setStorico((s) => s.filter((x) => x.id !== voce.id))}>×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}



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
            <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 150, display: 'flex', overflow: 'hidden', borderRadius: 8 }}>
              <select
                style={{ ...styles.inlineInput, flex: 1, minWidth: 0, fontSize: 16, fontWeight: 'bold', color: 'var(--c-title)', padding: '9px 28px 9px 8px', textOverflow: 'ellipsis', background: 'transparent', position: 'relative', zIndex: 2 }}
                value={roster.attivo}
                onChange={(e) => setRoster((r) => ({ ...r, attivo: e.target.value }))}
                title={t('nome.tooltip_selettore')}
              >
                {Object.entries(roster.personaggi).map(([id, p]) => (
                  <option key={id} value={id}>
                    {p.nome || t('menu.senza_nome')}{p.classe ? ` · ${p.classe}` : ''} · {t('nome.liv')} {p.livello || 1}
                  </option>
                ))}
              </select>
              <span
                aria-hidden
                style={{
                  position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  paddingRight: 34,
                  pointerEvents: 'none', userSelect: 'none', zIndex: 1,
                }}
              >
                <span style={{
                  fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontWeight: 'bold',
                  fontSize: 28, letterSpacing: 4, lineHeight: 1,
                  color: C.goldDark, opacity: 0.35, whiteSpace: 'nowrap',
                }}>
                  {(scheda.versione || '2024') === '2024' ? '5.5' : '5.0'}
                </span>
              </span>
            </div>
          )}

          {/* Livello + pulsanti: un unico gruppo con spaziatura uniforme, va a
              capo insieme sotto il selettore invece di sbordare */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
            <button
              style={styles.buttonMini}
              title={t('tip.levelup')}
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
            <button style={styles.buttonMini} onClick={() => setRinominando(!rinominando)} title={t('tip.rinomina')}>✎</button>
            <button style={styles.buttonMini} onClick={() => { setBozzaCrea({ nome: '', classe: '', specie: '', background: '', metodo: 'auto', pool: null, assegna: {}, competenzeClasse: [], competenzeSpecie: [], dotazione: 'pacchetto' }); setMostraCrea(true); }} title={t('tip.nuovo_pg')}>＋</button>
            <button style={styles.buttonMini} onClick={duplicaPersonaggio} title={t('tip.duplica')}>⧉</button>
            <button style={styles.buttonMini} onClick={resetScheda} title={t('tip.azzera')}>↺</button>
            <button style={{ ...styles.buttonMini, borderColor: C.red, color: C.red }} onClick={eliminaPersonaggio} title={t('tip.elimina_pg')}>🗑</button>
          </div>
        </section>

        {/* Testata: anagrafica + riquadri vitali uniformi */}
        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>{t("profilo.titolo")}</h2>
          <div className="profilo-griglia" style={{ display: 'grid', gridTemplateColumns: '230px 1fr 210px', gridTemplateAreas: '"car main ritratto"', gap: 14 }}>
            <div style={{ gridArea: 'ritratto', position: 'relative', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div
                style={{
                  width: '100%', flex: 1, minHeight: 340, borderRadius: 12, overflow: 'hidden',
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
                  <div style={{ position: 'relative', width: '100%', height: '100%' }} title={t('tip.carica_img')}>
                    <img
                      src={generaAvatar(scheda.classe, scheda.specie, scheda.nome)}
                      alt={`Ritratto di ${scheda.nome}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.35)', color: '#fff', fontSize: 9, letterSpacing: 1, textAlign: 'center', padding: '2px 0' }}>{t("profilo.ritratto")}</div>
                  </div>
                )}
              </div>
              {scheda.ritratto && (
                <button
                  style={{ ...styles.buttonDanger, position: 'absolute', top: -8, right: -8, padding: '0 6px', background: C.panel }}
                  title={t('tip.rimuovi_img')}
                  onClick={() => aggiorna({ ritratto: '' })}
                >
                  ×
                </button>
              )}
              <input ref={ritrattoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={caricaRitratto} />
            </div>
            <div style={{ gridArea: 'main', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="campi-anagrafica" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 10px', alignItems: 'end' }}>
                <CampoModulo label={versione === "2024" ? t("profilo.specie") : t("profilo.razza")}>
                  <CampoTendina value={scheda.specie} opzioni={SPECIE_5E} onChange={(v) => { const sp = datiSpecieDi(v); aggiorna({ specie: v, ...(sp ? { velocita: sp.velocita, sensi: sp.sensi, taglia: sp.taglia, trattiSpecie: sp.tratti } : {}), ...ritrattoAuto(scheda.classe, v, scheda.nome) }); }} title={t('tip.scegli_specie')} />
                </CampoModulo>
                <CampoModulo label={t("profilo.taglia")}>
                  <CampoTendina value={scheda.taglia} opzioni={TAGLIE_5E} onChange={(v) => aggiorna({ taglia: v })} title={t('tip.scegli_taglia')} />
                </CampoModulo>
                <CampoModulo label={t("profilo.allineamento")}>
                  <CampoTendina value={scheda.allineamento} opzioni={ALLINEAMENTI_5E} onChange={(v) => aggiorna({ allineamento: v })} title={t('tip.scegli_allineamento')} />
                </CampoModulo>
                <CampoModulo label={t("profilo.background")}>
                  <CampoTendina value={scheda.background} opzioni={BACKGROUND_5E} onChange={(v) => aggiorna({ background: v, ...abilitaConBackground(v) })} title={t('tip.scegli_background')} />
                </CampoModulo>
                <CampoModulo label={t("profilo.classe")}>
                  <div
                    style={{ fontSize: 13, color: C.inkDim, fontStyle: 'italic', padding: '2px 0', cursor: 'not-allowed', userSelect: 'none' }}
                    title="La classe principale non può essere cambiata dopo la creazione."
                  >
                    🔒 {traduciDato(scheda.classe) || 'Nessuna'}
                  </div>
                </CampoModulo>
                <CampoModulo label={t("profilo.sottoclasse")}>
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
                    if (scheda.sottoclasse) {
                      return (
                        <div
                          style={{ fontSize: 13, color: C.inkDim, fontStyle: 'italic', padding: '2px 0', cursor: 'not-allowed', userSelect: 'none' }}
                          title="La sottoclasse non può essere cambiata dopo essere stata scelta."
                        >
                          🔒 {traduciDato(scheda.sottoclasse)}
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
                        title={t('tip.scegli_sottoclasse')}
                      />
                    );
                  })()}
                </CampoModulo>
              </div>
          {/* Multiclasse (opzionale, non invasivo): quando vuoto è solo un
              tastino; aggiungendo classi secondarie puoi applicare competenza e
              slot incantesimo combinati (regola 5e). */}
          {(() => {
            const mc = scheda.multiclasse || [];
            if (mc.length === 0) {
              return null;
            }
            const livTot = (scheda.livello || 1) + mc.reduce((a, m) => a + (m.livello || 0), 0);
            const setMc = (arr) => aggiorna({ multiclasse: arr });
            return (
              <div style={{ ...styles.panel, padding: '8px 10px', margin: '2px 0 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ ...styles.detail, fontWeight: 700 }}>⚔️ {t('mc.titolo')}</span>
                  <span style={{ ...styles.detail }}>{t('mc.liv_totale')}: <strong>{livTot}</strong> ({traduciDato(scheda.classe) || '—'} {scheda.livello || 1}{mc.map((m) => ` / ${traduciDato(m.classe) || '—'} ${m.livello}`).join('')})</span>
                </div>
                {mc.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                    <select value={m.classe} onChange={(e) => setMc(mc.map((x, j) => (j === i ? { ...x, classe: e.target.value } : x)))} style={{ ...styles.inlineInput, padding: '4px 6px', flex: 1, minWidth: 120 }}>
                      <option value="">{t('crea.scegli')}</option>
                      {NOMI_CLASSI.map((n) => <option key={n} value={n}>{traduciDato(n)}</option>)}
                    </select>
                    <span style={{ ...styles.detail }}>{t('mc.liv')}</span>
                    <Editable value={m.livello} tipo="numero" width={28} onChange={(v) => setMc(mc.map((x, j) => (j === i ? { ...x, livello: Math.max(1, v) } : x)))} />
                    <button style={{ ...styles.buttonMini, color: C.red }} title={t('modal.elimina')} onClick={() => setMc(mc.filter((_, j) => j !== i))}>🗑</button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <button style={{ ...styles.buttonMini }} onClick={() => setMc([...mc, { classe: '', livello: 1 }])}>➕ {t('mc.aggiungi')}</button>
                  <button style={{ ...styles.button, fontSize: 12, padding: '5px 12px' }} title={t('mc.applica_tip')} onClick={() => {
                    const classi = [{ classe: scheda.classe, livello: scheda.livello || 1 }, ...mc.filter((m) => m.classe)];
                    const slot = slotMulticlasse(classi);
                    const patch = { bonusCompetenza: bonusCompetenzaDaLivello(livTot) };
                    if (slot) {
                      const cur = scheda.slotIncantesimo || {};
                      for (let i = 1; i <= 9; i++) slot[i].spesi = Math.min(slot[i].totale, cur[i]?.spesi || 0);
                      patch.slotIncantesimo = slot;
                    }
                    aggiorna(patch);
                  }}>🔄 {t('mc.applica')}</button>
                </div>
                <div style={{ ...styles.detail, fontSize: 11, opacity: 0.75, marginTop: 6 }}>{t('mc.nota')}</div>
              </div>
            );
          })()}
          <div className="vitali">
            {(
              <>
            {/* RIGA 1 — Classe Armatura | Riposo | TS Morte */}
            {/* Classe Armatura */}
            <div style={{ ...styles.vitalBox, order: 2, gridColumn: 'span 2' }}>
              <SfondoVit>🛡️</SfondoVit>
              <div style={styles.vitalLabel}>{t("vital.ca")}</div>
              <div style={styles.vitalValue}>
                {scheda.armatura.tipo === 'manuale' && !scheda.armatura.scudo && !scheda.armatura.bonus ? (
                  <Editable value={scheda.ca} tipo="numero" onChange={(v) => aggiorna({ ca: v })} width={48} />
                ) : (
                  <span title={t('tip.ca_calcolata')}>{caTotale(scheda)}</span>
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
                {TIPI_ARMATURA.map((ta) => {
                  const bloccato = !competenteInArmatura(scheda, ta.key);
                  return <option key={ta.key} value={ta.key} disabled={bloccato}>{bloccato ? '🔒 ' : ''}{t('armor.' + ta.key)}</option>;
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
                <div style={{ fontSize: 9, color: C.red, marginTop: 3, lineHeight: 1.2 }} title={t('tip.senza_comp_armatura')}>
                  ⚠️ Non competente{!competenteInArmatura(scheda, scheda.armatura.tipo) ? ` (${scheda.armatura.tipo})` : ''}{scheda.armatura.scudo && !scheda.addestramento?.armature?.scudi ? ' (scudo)' : ''}
                </div>
              )}
            </div>

            {/* Riposo */}
            <div style={{ ...styles.vitalBox, order: 3, gridColumn: 'span 2' }}>
              <SfondoVit>🌙</SfondoVit>
              <div style={styles.vitalLabel}>{t("vital.riposo")}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button style={{ ...styles.buttonMini, fontSize: 11 }} onClick={() => riposoBreve()} title={t('vital.riposo_breve_tip')}>☕ {t("vital.breve")}</button>
                    <button style={{ ...styles.buttonMini, fontSize: 11, borderColor: C.goldDark, color: C.goldDark }} onClick={() => riposoLungo()} title={t('vital.riposo_lungo_tip')}>🌙 {t("vital.lungo")}</button>
                  </div>
                </div>

                {/* TS Morte */}
                <div style={{ ...styles.vitalBox, order: 8 }}>
                  <SfondoVit>💀</SfondoVit>
                  <div style={styles.vitalLabel}>{t("vital.ts_morte")}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: C.green, fontWeight: 600 }}>✔</span>
                      {[1, 2, 3].map((n) => (
                        <input key={`s-${n}`} type="checkbox" checked={(scheda.tsMorte?.successi || 0) >= n} onChange={() => {
                          const att = scheda.tsMorte?.successi || 0;
                          aggiorna({ tsMorte: { ...scheda.tsMorte, successi: att === n ? n - 1 : n } });
                        }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: C.red, fontWeight: 600 }}>✘</span>
                      {[1, 2, 3].map((n) => (
                        <input key={`f-${n}`} type="checkbox" checked={(scheda.tsMorte?.fallimenti || 0) >= n} onChange={() => {
                          const att = scheda.tsMorte?.fallimenti || 0;
                          aggiorna({ tsMorte: { ...scheda.tsMorte, fallimenti: att === n ? n - 1 : n } });
                        }} />
                      ))}
                    </div>
                  </div>
                  <button style={{ ...styles.buttonMini, fontSize: 10, marginTop: 2 }} onClick={() => aggiorna({ tsMorte: { successi: 0, fallimenti: 0 } })}>{t("vital.reset_ts")}</button>
                </div>

                {/* RIGA 2 — Iniziativa | Velocità | Percezione Passiva | Resistenze | Visione */}
                {/* Iniziativa */}
                <div style={{ ...styles.vitalBox, order: 5 }}>
                  <SfondoVit>⚡</SfondoVit>
                  <div style={styles.vitalLabel}>{t("vital.iniziativa")}</div>
                  <div style={styles.vitalValue}>
                    <Rollable onRoll={() => lanciaD20(t('vital.iniziativa'), modificatore(scheda.caratteristiche.destrezza), { dopoTiro: (tot) => sincronizzaIniziativaPg(tot) })}>
                      {conSegno(modificatore(scheda.caratteristiche.destrezza))}
                    </Rollable>
                  </div>
                </div>

                {/* Velocità + Calcolatore Salto & Respiro */}
                <div
                  style={{ ...styles.vitalBox, order: 6 }}
                  title={`🏃 Salto in Lungo (con rincorsa): ${(scheda.caratteristiche?.forza || 10)} piedi (${((scheda.caratteristiche?.forza || 10) * 0.3).toFixed(1)} m) • ⬆️ Salto in Alto: ${3 + modificatore(scheda.caratteristiche?.forza || 10)} piedi (${((3 + modificatore(scheda.caratteristiche?.forza || 10)) * 0.3).toFixed(1)} m) • 🫁 Trattenere il Respiro: ${Math.max(1, 1 + modificatore(scheda.caratteristiche?.costituzione || 10))} minuti`}
                >
                  <SfondoVit>🏃</SfondoVit>
                  <div style={styles.vitalLabel}>{t("vital.movimento")}</div>
                  <div style={styles.vitalValue}>
                    <Editable value={scheda.velocita} tipo="numero" onChange={(v) => aggiorna({ velocita: v })} width={48} />
                    <span style={{ fontSize: 17, color: C.inkDim, marginLeft: 2, fontWeight: 600 }}> m</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.goldDark, marginTop: 2, textAlign: 'center', fontWeight: 600 }}>
                    🏃 Salto: {((scheda.caratteristiche?.forza || 10) * 0.3).toFixed(1)}m
                  </div>
                </div>

                {/* Percezione Passiva */}
                <div style={{ ...styles.vitalBox, order: 7 }} title={t('vital.passive_tooltip')}>
                  <SfondoVit>👁️</SfondoVit>
                  <div style={styles.vitalLabel}>{t("vital.percezione_passiva")}</div>
                  <div style={styles.vitalValue}>{percezionePassiva}</div>
                </div>

                {/* Resistenze — chip rimovibili + tendina */}
                <div style={{ ...styles.vitalBox, order: 9 }}>
                  <SfondoVit>🧪</SfondoVit>
                  <div style={styles.vitalLabel}>{t("vital.resistenze")}</div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CampoConTendina
                      value={scheda.resistenze}
                      opzioni={DANNI_5E}
                      onChange={(v) => aggiorna({ resistenze: v })}
                      title={t('tip.resistenze')}
                    />
                  </div>
                </div>

                {/* Vista / Sensi — chip rimovibili + tendina */}
                <div style={{ ...styles.vitalBox, order: 10 }}>
                  <SfondoVit>🦉</SfondoVit>
                  <div style={styles.vitalLabel}>{t("vital.visione")}</div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CampoConTendina
                      value={scheda.sensi}
                      opzioni={SENSI_5E}
                      onChange={(v) => aggiorna({ sensi: v })}
                      title={t('tip.sensi')}
                    />
                  </div>
                </div>

                {/* RIGA 3 — Bonus Comp. | Ispirazione */}
                {/* Bonus Competenza */}
                <div style={{ ...styles.vitalBox, order: 4 }}>
                  <SfondoVit>✨</SfondoVit>
                  <div style={styles.vitalLabel}>{t("vital.competenza")}</div>
                  <div style={styles.vitalValue}>
                    <Editable value={conSegno(scheda.bonusCompetenza)} onChange={(v) => aggiorna({ bonusCompetenza: parseInt(v, 10) || 0 })} width={48} title={t('tip.click_modifica')} />
                  </div>
                  {scheda.bonusCompetenza !== bonusCompetenzaDaLivello(scheda.livello) && (
                    <span className="tirabile" style={{ fontSize: 9, color: C.goldDark, cursor: 'pointer', marginTop: 1 }}
                      title={`Bonus corretto per liv. ${scheda.livello}: ${conSegno(bonusCompetenzaDaLivello(scheda.livello))}`}
                      onClick={() => aggiorna({ bonusCompetenza: bonusCompetenzaDaLivello(scheda.livello) })}>
                      auto {conSegno(bonusCompetenzaDaLivello(scheda.livello))}
                    </span>
                  )}
                </div>

                {/* Ispirazione */}
                <div style={{
                  ...styles.vitalBox, order: 13,
                  border: `1px solid ${scheda.ispirazione ? '#d4af37' : C.border}`,
                  background: scheda.ispirazione ? 'rgba(212,175,55,0.16)' : C.panelLight,
                  boxShadow: scheda.ispirazione ? '0 0 9px rgba(212,175,55,0.55)' : 'none',
                  transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
                }}>
                  <SfondoVit>⭐</SfondoVit>
                  <div style={{ ...styles.vitalLabel, color: scheda.ispirazione ? '#c8991a' : C.inkDim }}>{t("vital.ispirazione")}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button
                      className="tirabile"
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 8px', fontSize: 28, border: 'none', lineHeight: 1,
                        background: 'transparent',
                        color: scheda.ispirazione ? '#d4af37' : C.inkDim,
                        textShadow: scheda.ispirazione ? '0 0 7px rgba(212,175,55,0.7)' : 'none',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onClick={() => aggiorna({ ispirazione: !scheda.ispirazione })}
                      title={t('tip.ispirazione')}
                    >
                      {scheda.ispirazione ? '★' : '☆'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ELEMENTI SEMPRE A VISTA: Punti Ferita (La Vita), Sfinimento (Affaticamento), Concentrazione e Condizioni */}
            {/* Punti Ferita — occupa sempre 2 colonne (o tutta la larghezza in griglia compatta) */}
            <div style={{ ...styles.vitalBox, gridColumn: 'span 4', order: 1, padding: '12px 14px' }}>
              <SfondoVit>🩸</SfondoVit>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                <div style={{ ...styles.vitalLabel, margin: 0, fontSize: 13 }}>❤️ {t("vital.pf")}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.inkDim }}>🛡️ {t("vital.temporanei")}</span>
                  <Editable value={scheda.pfTemp} tipo="numero" onChange={(v) => aggiorna({ pfTemp: v })} width={32} style={{ fontSize: 13, fontWeight: 'bold', color: '#42a5f5' }} />
                </div>
              </div>

              {/* BARRA DELLA VITA STILE VIDEOGIOCO */}
              {(() => {
                const att = Number(scheda.pfAttuali) || 0;
                const maxPf = Number(scheda.pfMax) || 10;
                const temp = Number(scheda.pfTemp) || 0;
                const max = Math.max(1, maxPf + temp);
                const percNormale = Math.max(0, Math.min(100, (att / max) * 100));
                const percTemp = Math.max(0, Math.min(100, (temp / max) * 100));
                const coloreNormale = (att / Math.max(1, maxPf)) > 0.5 ? 'linear-gradient(90deg, #2e7d32, #4caf50)' : (att / Math.max(1, maxPf)) > 0.25 ? 'linear-gradient(90deg, #f57f17, #ffb300)' : 'linear-gradient(90deg, #c62828, #e53935)';
                return (
                  <div style={{ position: 'relative', width: '100%', height: 26, borderRadius: 13, background: 'rgba(0,0,0,0.7)', border: `2px solid ${C.goldDark}`, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.3)', overflow: 'hidden', marginBottom: 10, display: 'flex' }} title={`${att} / ${maxPf} PF${temp ? ` (+ ${temp} temp)` : ''}`}>
                    <div style={{ width: `${percNormale}%`, height: '100%', background: coloreNormale, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 10px rgba(76,175,80,0.5)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)' }} />
                    </div>
                    {temp > 0 && (
                      <div style={{ width: `${percTemp}%`, height: '100%', background: 'linear-gradient(90deg, #1565c0, #42a5f5)', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)' }} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)', letterSpacing: 0.5, pointerEvents: 'none' }}>
                      {att} / {maxPf} {temp > 0 ? `(+${temp})` : ''}
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>
                  <Editable value={scheda.pfAttuali} tipo="numero" onChange={(v) => {
                    const danno = scheda.pfAttuali - v;
                    aggiorna({ pfAttuali: v });
                    if (danno > 0 && scheda.concentrazione) {
                      setCheckConc({ danno, cd: Math.max(10, Math.floor(danno / 2)), spell: scheda.concentrazione, esito: null });
                    }
                  }} width={48} />
                </span>
                <span style={{ fontSize: 16, color: C.inkDim, fontWeight: 600 }}>/ <span title={t('vital.max_pf_tooltip')} style={{ display: 'inline-block', textAlign: 'center' }}>{scheda.pfMax}</span></span>
              </div>

              <div style={{ ...styles.detail, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: 6, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {t('vital.dadi_vita')}{' '}
                  <Rollable onRoll={tiraDadoVita} title={t('vital.dadi_vita_tooltip')}>
                    <strong style={{ color: C.goldDark }}>{Math.max(1, scheda.livello || 1)}</strong>
                  </Rollable>
                  {' × d'}
                  <strong style={{ color: C.goldDark }} title={t('vital.dado_tipo_tooltip')}>
                    {facceDadoVita(scheda.dadiVita)}
                  </strong>
                  {' · '}{t('vital.spesi')}{' '}
                  <select
                    style={{ ...styles.inlineInput, fontSize: 12, padding: '1px 3px' }}
                    value={Math.min(Math.max(0, scheda.dadiVitaSpesi || 0), Math.max(1, scheda.livello || 1))}
                    onChange={(e) => aggiorna({ dadiVitaSpesi: Number(e.target.value) })}
                    title={t('vital.spesi_tooltip')}
                  >
                    {Array.from({ length: Math.max(1, scheda.livello || 1) + 1 }, (_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <span style={{ color: C.inkDim }}>/ {Math.max(1, scheda.livello || 1)}</span>
                  <button
                    style={{ ...styles.buttonMini, padding: '2px 8px', color: C.green, borderColor: C.green }}
                    title={t('vital.usa_tooltip')}
                    disabled={scheda.dadiVitaSpesi >= Math.max(1, scheda.livello || 1)}
                    onClick={tiraDadoVita}
                  >
                    🎲 {t('vital.usa')}
                  </button>
                </span>
              </div>
            </div>

            {/* Sfinimento / Affaticamento */}
            <div style={{ ...styles.vitalBox, order: 11 }}>
              <SfondoVit>💤</SfondoVit>
              <div style={styles.vitalLabel}>{t("vital.sfinimento")}</div>
              <div style={styles.vitalValue}>
                <button style={{ ...styles.buttonMini, padding: '1px 5px', fontSize: 13 }} onClick={() => aggiorna({ sfinimento: Math.max(0, scheda.sfinimento - 1) })} title={t('tip.diminuisci')}>−</button>
                {' '}
                <strong style={{ color: scheda.sfinimento ? C.red : C.ink }}>{scheda.sfinimento}</strong>
                {' '}
                <button style={{ ...styles.buttonMini, padding: '1px 5px', fontSize: 13 }} onClick={() => aggiorna({ sfinimento: Math.min(6, scheda.sfinimento + 1) })} title={t('tip.aumenta')}>+</button>
              </div>
              {scheda.sfinimento > 0 && (
                <div style={{ fontSize: 9, color: C.red }} title={versione === '2024' ? 'Regole 2024: −2 ai tiri di d20 per livello' : `Regole 2014: ${SFINIMENTO_2014[scheda.sfinimento]}`}>
                  {versione === '2024' ? `−${scheda.sfinimento * 2}` : SFINIMENTO_2014[scheda.sfinimento]}
                </div>
              )}
            </div>

            {/* Condizioni */}
            <div style={{ ...styles.vitalBox, order: 12, gridColumn: 'span 3' }}>
              <SfondoVit>⚠️</SfondoVit>
              <div style={styles.vitalLabel}>{t("vital.condizioni")}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', alignItems: 'center', marginTop: 2 }}>
                {scheda.condizioni.map((c) => (
                  <button
                    key={c}
                    className="tirabile"
                    style={{ ...styles.modeButton(true), fontSize: 9, padding: '1px 4px', margin: 0, lineHeight: 1.4 }}
                    title={t('tip.click_rimuovi')}
                    onClick={() => aggiorna({ condizioni: scheda.condizioni.filter((x) => x !== c) })}
                  >
                    {c} ✕
                  </button>
                ))}
                <select
                  value=""
                  onChange={(e) => { if (e.target.value) aggiorna({ condizioni: [...scheda.condizioni, e.target.value] }); }}
                  style={{ ...styles.inlineInput, fontSize: 10, padding: '1px 2px', height: 18 }}
                  title={t('tip.aggiungi_condizione')}
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
          <div className="profilo-caratteristiche" style={{ gridArea: 'car', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>

            {CARATTERISTICHE.map(({ key }) => {
              const mod = modificatore(scheda.caratteristiche[key]);
              const bonusTS = bonusTiroSalvezza(scheda, key);
              const abilitaDellaCar = ABILITA.filter((a) => a.car === key);
              const sfondoCar = SFONDO_CARATTERISTICA[key];
              return (
                <div key={key} className="blocco-car" style={{ ...styles.abilityBlock, position: 'relative', overflow: 'hidden' }}>
                  {/* Sfondo emoji opaco che rappresenta la caratteristica */}
                  {sfondoCar && (
                    <span aria-hidden style={{
                      position: 'absolute', right: -2, bottom: -8,
                      fontSize: 58, opacity: 0.07, pointerEvents: 'none',
                      lineHeight: 1, userSelect: 'none',
                      transform: 'rotate(-8deg)',
                      filter: 'grayscale(20%)',
                    }}>
                      {sfondoCar.symbol}
                    </span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <Rollable
                      onRoll={() => lanciaD20(`Prova di ${t('attr.' + key)}`, mod)}
                      style={styles.abilityMod}
                      title={`Tieni premuto e rilascia: prova di ${t('attr.' + key)}`}
                    >
                      {conSegno(mod)}
                    </Rollable>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                      <div
                        style={{ fontSize: 13, color: C.ink, letterSpacing: 0.8, fontWeight: 'bold', cursor: 'help', textDecoration: 'underline dotted', textUnderlineOffset: 3 }}
                        title={t('tip.cosa_governa')}
                        onClick={() => setInfo({ titolo: t('attr.' + key), testo: t('spieg.' + key) })}
                      >{t('attr.' + key).toUpperCase()}</div>
                      <div style={{ fontSize: 17, fontWeight: 'bold', color: C.goldDark }} title={t('tip.punteggio_car')}>
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
                    title={`Tieni premuto e rilascia: tiro salvezza di ${t('attr.' + key)} · click sul pallino: competenza`}
                    onRoll={() => lanciaD20(`Tiro salvezza: ${t('attr.' + key)}`, bonusTS)}
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
                    <em>{t('attr.tiro_salvezza')}</em>
                  </Rollable>

                  {abilitaDellaCar.map((a) => {
                    const bonus = bonusAbilita(scheda, a.key);
                    const liv = scheda.abilita[a.key] || 0;
                    return (
                      <Rollable
                        as="div"
                        key={a.key}
                        style={{ ...styles.skillRow(true), opacity: liv === 0 ? 0.5 : 1 }}
                        title={`Tieni premuto e rilascia: prova di ${t('skill.' + a.key)} · click sul pallino: niente → competenza (●) → competenza di classe/razza (★)`}
                        onRoll={() => lanciaD20(`${t('skill.' + a.key)}`, bonus)}
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
                        <span>{t('skill.' + a.key)}</span>
                      </Rollable>
                    );
                  })}
                </div>
              );
            })}
          </div>{/* fine colonna caratteristiche (dentro il Profilo) */}
        </div>{/* fine contenitore Profilo */}
      </section>

        {/* Corpo scheda: tutte le sezioni a piena larghezza */}
        <div className="griglia-scheda">
          <div style={{ order: 2, display: 'flex', flexDirection: 'column' }}>

            {/* Risorse di classe */}
            <Sezione titolo={t("sez.risorse")} {...propsSez('risorse')} {...apertoProps('risorse')}>
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
                      <Editable value={r.nome} onChange={(v) => modifica({ nome: v })} width={110} title={t('tip.nome_risorsa')} />
                      <button
                        style={{ ...styles.buttonMini, padding: '0 6px', color: C.red }}
                        title={t('tip.rimuovi_risorsa')}
                        onClick={() => aggiorna({ risorse: scheda.risorse.filter((x) => x.id !== r.id) })}
                      >✕</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
                      <button style={{ ...styles.buttonMini, padding: '1px 7px' }} title={t('tip.recupera')} onClick={() => modifica({ attuali: Math.max(0, r.attuali - 1) })}>−</button>
                      <strong style={{ minWidth: 16, textAlign: 'center', display: 'inline-block', color: r.attuali === r.max ? C.goldDark : (r.attuali === 0 ? C.inkDim : C.ink) }}>{r.attuali}</strong>
                      <button style={{ ...styles.buttonMini, padding: '1px 7px' }} title={t('tip.spendi')} onClick={() => modifica({ attuali: Math.min(r.max, r.attuali + 1) })}>+</button>
                      <span style={styles.detail}>/ <Editable value={r.max} tipo="numero" width={30} onChange={(v) => modifica({ max: Math.max(0, v), attuali: Math.min(Math.max(0, v), r.attuali) })} /></span>
                      <select
                        style={{ ...styles.inlineInput, fontSize: 11, padding: '1px 3px' }}
                        value={r.reset}
                        onChange={(e) => modifica({ reset: e.target.value })}
                        title={t('tip.quando_ricarica')}
                      >
                        <option value="">{t("res.manuale")}</option>
                        <option value="breve">{t("res.breve")}</option>
                        <option value="lungo">{t("res.lungo")}</option>
                      </select>
                    </div>
                  </div>
                );
              })}
              <button
                style={{ ...styles.buttonMini, marginTop: 2 }}
                onClick={() =>
                  aggiorna({
                    risorse: [...scheda.risorse, { id: Date.now(), nome: t("res.nuova"), attuali: 0, max: 0, reset: 'lungo' }],
                  })
                }
              >
                + {t("res.aggiungi")}
              </button>
            </Sezione>

            <Sezione titolo={t("sez.addestramento")} {...propsSez('addestramento')} {...apertoProps('addestramento', false)}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ ...styles.detail, marginBottom: 4 }}>{t("train.armature")}</div>
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
                <div style={{ ...styles.detail, marginBottom: 4 }}>{t("train.armi")}</div>
                <ListaQuadratini
                  value={scheda.addestramento.armi}
                  opzioni={COMP_ARMI_5E}
                  placeholder={t("train.armi_ph")}
                  onChange={(v) => aggiorna({ addestramento: { ...scheda.addestramento, armi: v } })}
                />
              </div>
              <div>
                <div style={{ ...styles.detail, marginBottom: 4 }}>{t("train.strumenti")}</div>
                <ListaQuadratini
                  value={scheda.addestramento.strumenti}
                  opzioni={STRUMENTI_5E}
                  placeholder={t("train.strumenti_ph")}
                  onChange={(v) => aggiorna({ addestramento: { ...scheda.addestramento, strumenti: v } })}
                />
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ ...styles.detail, marginBottom: 4 }}>{t("equip.lingue")}</div>
                <CampoConTendina
                  value={scheda.lingue}
                  opzioni={LINGUE_5E}
                  onChange={(v) => aggiorna({ lingue: v })}
                  title={t("equip.lingue_tooltip")}
                />
              </div>
            </Sezione>

            <Sezione titolo={t("sez.tratti_specie")} {...propsSez('trattiSpecie')} {...apertoProps('trattiSpecie')}>
              <ListaQuadratini
                value={scheda.trattiSpecie}
                lookup={spiegaTratto}
                placeholder={t("tratti.ph")}
                onChange={(v) => aggiorna({ trattiSpecie: v })}
              />
            </Sezione>

            <Sezione titolo={t("sez.privilegi")} {...propsSez('privilegi')} {...apertoProps('privilegi')}>
              <button
                style={{ ...styles.button, marginBottom: 8, fontSize: 12 }}
                onClick={() => setMostraPrivilegi(true)}
                title={t('tip.panoramica_priv')}
              >
                📖 {t("priv.panoramica_btn")}
              </button>
              <ListaQuadratini
                value={scheda.privilegi}
                lookup={spiegaPrivilegio}
                placeholder={t("priv.ph")}
                onChange={(v) => aggiorna({ privilegi: v })}
                onRoll={lanciaDanniDiretti}
              />
            </Sezione>

            <Sezione titolo={t("sez.privilegi_sottoclasse")} {...propsSez('privilegiSottoclasse')} {...apertoProps('privilegiSottoclasse')}>
              <ListaQuadratini
                value={scheda.privilegiSottoclasse}
                lookup={spiegaPrivilegio}
                placeholder={`Privilegi della sottoclasse${scheda.sottoclasse ? ` (${scheda.sottoclasse})` : ''}: aggiungili qui.`}
                onChange={(v) => aggiorna({ privilegiSottoclasse: v })}
                onRoll={lanciaDanniDiretti}
              />
            </Sezione>

            {/(stregone|sorcerer)/i.test(scheda.classe || '') && (
              <Sezione titolo={t("sez.metamagia")} {...apertoProps('metamagia', false)}>
                <div style={{ ...styles.detail, fontSize: 12, marginBottom: 8 }}>
                  {t("meta.desc")}
                </div>
                <CampoConTendina
                  value={scheda.metamagie}
                  opzioni={METAMAGIA_5E}
                  onChange={(v) => aggiorna({ metamagie: v })}
                  lookup={spiegaMetamagia}
                  setInfo={setInfo}
                  title={t('tip.metamagia_attive')}
                />
              </Sezione>
            )}
          </div>

          <div style={{ order: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Armi e attacchi — sezione collassabile */}
            <Sezione titolo={t("sez.combattimento")} {...propsSez('attacchi')} {...apertoProps('attacchi')}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <button
                  style={{ ...styles.buttonMini, fontSize: 11, padding: '3px 8px', color: scheda.mostraIncantesimiAttacco !== false ? C.accentDark : C.inkDim, border: `1px solid ${scheda.mostraIncantesimiAttacco !== false ? C.accentDark : C.border}` }}
                  onClick={() => aggiorna({ mostraIncantesimiAttacco: scheda.mostraIncantesimiAttacco === false })}
                  title="Mostra o nascondi automaticamente i tuoi incantesimi offensivi nella tabella degli attacchi"
                >
                  ✨ Incantesimi offensivi: {scheda.mostraIncantesimiAttacco !== false ? 'ON' : 'OFF'}
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                {(() => {
                  const attacchiSpettro = (scheda.incantesimiLista || []).filter((s) => {
                    if (scheda.mostraIncantesimiAttacco === false || s.nascondiAttacco) return false;
                    const d = dettagliIncantesimo(s.nome) || {};
                    const db = datiIncantesimo(s.nome) || {};
                    const desc = (s.note || '') + ' ' + (db.desc || '');
                    const danno = s.danno || d.danno || '';
                    const area = s.area || d.area || '';
                    return Boolean(danno || area || /attacco magico|tiro per colpire|ts \w+|tiro salvezza|danni/i.test(desc));
                  }).map((s) => {
                    const d = dettagliIncantesimo(s.nome) || {};
                    const db = datiIncantesimo(s.nome) || {};
                    const desc = (s.note || '') + ' ' + (db.desc || '');
                    const danno = s.danno || d.danno || '';
                    const tipoDanno = s.tipoDanno || d.tipoDanno || '';
                    const isTS = /ts (\w+)|tiro salvezza/i.test(desc);
                    const tsMatch = desc.match(/ts\s+(destrezza|saggezza|costituzione|forza|intelligenza|carisma)/i);
                    const nomeTS = tsMatch ? ` (TS ${tsMatch[1].charAt(0).toUpperCase() + tsMatch[1].slice(1)})` : isTS ? ' (TS)' : '';
                    
                    const modInc = scheda.incantatore?.caratteristica ? modificatore(scheda.caratteristiche[scheda.incantatore.caratteristica]) : 0;
                    const bonusComp = scheda.bonusCompetenza || 2;
                    const bonus = isTS ? 0 : bonusComp + modInc;
                    const cd = 8 + bonusComp + modInc;
                    const note = (isTS ? `CD ${cd}${nomeTS}` : `Attacco Magico`) + (s.gittata || d.gittata ? ` • ${s.gittata || d.gittata}` : '') + (s.note ? ` • ${s.note}` : '');

                    let categoria = 'Azione';
                    const tempo = (s.tempo || d.tempo || '').toUpperCase();
                    if (tempo.includes('BONUS')) categoria = 'Bonus';
                    else if (tempo.includes('REAZ')) categoria = 'Reazione';

                    return {
                      id: `spell-${s.id}`,
                      idIncantesimo: s.id,
                      isSpell: true,
                      isTS,
                      cd,
                      nome: `${s.nome}`,
                      categoria,
                      bonus,
                      danno,
                      tipoDanno,
                      note
                    };
                  });
                  const listaAttacchiCompleta = [...(scheda.attacchi || []), ...attacchiSpettro];
                  return ['Azione', 'Bonus', 'Reazione'].map((cat) => {
                    const arr = listaAttacchiCompleta.filter((a) => (a.categoria || 'Azione') === cat);
                    if (arr.length === 0 && cat !== 'Azione') return null;
                    return (
                      <div key={cat} style={{ marginBottom: 16 }}>
                        {cat !== 'Azione' && (
                          <h3 style={{ fontSize: 13, color: C.inkDim, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${C.border}`, paddingBottom: 4, marginBottom: 8 }}>
                            {cat === 'Bonus' ? t('combat.azioni_bonus') : t('combat.reazioni')}
                          </h3>
                        )}
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>{t('combat.col_nome')}</th>
                              <th style={styles.th}>{t('combat.col_bonus')}</th>
                              <th style={styles.th}>{t('combat.col_danno')}</th>
                              <th style={styles.th}>{t('combat.col_note')}</th>
                              <th style={styles.th} />
                            </tr>
                          </thead>
                          <tbody>
                            {arr.map((a) => {
                              const aggiornaAttacco = (patch) => {
                                if (a.isSpell) {
                                  const cleanPatch = { ...patch };
                                  if (cleanPatch.nome !== undefined) cleanPatch.nome = cleanPatch.nome.replace(/^✨\s*/, '');
                                  aggiorna({
                                    incantesimiLista: scheda.incantesimiLista.map((x) => (x.id === a.idIncantesimo ? { ...x, ...cleanPatch } : x)),
                                  });
                                } else {
                                  aggiorna({
                                    attacchi: scheda.attacchi.map((x) => (x.id === a.id ? { ...x, ...patch } : x)),
                                  });
                                }
                              };
                              const dannoValido = a.danno.trim() === '' || parseEspressioneDado(a.danno);
                              return (
                                <tr key={a.id}>
                                  <td style={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      {a.isSpell ? (
                                        <span style={{ fontSize: 16, cursor: 'help', display: 'inline-block', width: 22, textAlign: 'center' }} title="Incantesimo offensivo (integrato automaticamente)">✨</span>
                                      ) : (
                                        <select
                                          value=""
                                          title={t('tip.scegli_arma')}
                                          onChange={(e) => {
                                            const arma = ARMI_5E.find((w) => w.nome === e.target.value);
                                            if (arma) aggiornaAttacco(attaccoDaArma(arma, scheda));
                                          }}
                                          style={{ ...styles.inlineInput, appearance: 'none', width: 22, height: 22, padding: 0, textAlign: 'center', cursor: 'pointer', flexShrink: 0 }}
                                        >
                                          <option value="">⚔️</option>
                                          {ARMI_5E.map((w) => <option key={w.nome} value={w.nome}>{w.nome}</option>)}
                                        </select>
                                      )}
                                      <Editable
                                        value={a.nome}
                                        width={130}
                                        onChange={(v) => aggiornaAttacco({ nome: v })}
                                        onRoll={() => lanciaD20(`Attacco: ${a.nome}`, a.bonus, { attacco: a })}
                                      />
                                    </div>
                                  </td>
                                  <td style={styles.td}>
                                    {a.isTS ? (
                                      <span style={{ ...styles.badge, background: 'rgba(201,162,39,0.15)', color: C.goldDark, border: `1px solid ${C.goldDark}`, padding: '2px 6px', fontWeight: 700 }} title="Tiro salvezza richiesto">
                                        CD {a.cd}
                                      </span>
                                    ) : (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <button
                                          style={{ ...styles.buttonMini, padding: '1px 6px' }}
                                          title={`Tira per colpire con ${a.nome}`}
                                          onClick={() => lanciaD20(`Attacco: ${a.nome}`, a.bonus, { attacco: a })}
                                        >🎲</button>
                                        <Editable
                                          value={conSegno(a.bonus)}
                                          width={44}
                                          onChange={(v) => aggiornaAttacco({ bonus: Number(String(v).replace('+', '')) || 0 })}
                                          onRoll={() => lanciaD20(`Attacco: ${a.nome}`, a.bonus, { attacco: a })}
                                        />
                                      </div>
                                    )}
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
                                      title={t('tip.click_mod_danni')}
                                    />{' '}
                                    <Editable value={a.tipoDanno} width={90} onChange={(v) => aggiornaAttacco({ tipoDanno: v })} />
                                  </td>
                                  <td style={styles.td}>
                                    <Editable value={a.note} width={130} onChange={(v) => aggiornaAttacco({ note: v })} />
                                  </td>
                                  <td style={{ ...styles.td, textAlign: 'right' }}>
                                    <button
                                      style={styles.buttonDanger}
                                      title={a.isSpell ? "Nascondi questo incantesimo dalla sezione Armi e attacchi" : "Elimina attacco"}
                                      onClick={() => {
                                        if (a.isSpell) {
                                          aggiorna({
                                            incantesimiLista: scheda.incantesimiLista.map((x) => (x.id === a.idIncantesimo ? { ...x, nascondiAttacco: true } : x))
                                          });
                                        } else {
                                          const inv = scheda.inventario || [];
                                          aggiorna({
                                            attacchi: scheda.attacchi.filter((x) => x.id !== a.id),
                                            inventario: inv.map((x) => (x.nome === a.nome ? { ...x, equip: false } : x))
                                          });
                                        }
                                      }}
                                    >
                                      ×
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <input
                            id={`wpn-add-input-${cat}`}
                            list="wpn-presets"
                            placeholder={t('combat.aggiungi_ph', { defaultValue: "Nome arma..." })}
                            style={{ ...styles.inlineInput, flex: 1, minWidth: 140, padding: '6px 8px' }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                const nomeArma = e.target.value.trim();
                                const arma = ARMI_5E.find((w) => w.nome === nomeArma);
                                const nuova = arma ? attaccoDaArma(arma, scheda) : { nome: nomeArma, bonus: 0, danno: '', tipoDanno: '', note: '' };
                                const inv = scheda.inventario || [];
                                aggiorna({
                                  attacchi: [...scheda.attacchi, { ...nuova, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, categoria: cat }],
                                  inventario: inv.some((x) => x.nome === nuova.nome)
                                    ? inv.map((x) => (x.nome === nuova.nome ? { ...x, equip: true } : x))
                                    : [...inv, { nome: nuova.nome, qta: 1, peso: pesoStimato(nuova.nome), equip: true }]
                                });
                                e.target.value = '';
                              }
                            }}
                          />
                          {cat === 'Azione' && <datalist id="wpn-presets">{ARMI_5E.map((w) => <option key={w.nome} value={w.nome} />)}</datalist>}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              <div style={{ marginTop: 4, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={styles.detail}>
                  {t('combat.hint')}
                </span>
              </div>
            </Sezione>

            {/* Incantesimi — sezione collassabile */}
            <Sezione 
              titolo={t("sez.incantesimi")} 
              {...propsSez('incantesimi')} 
              {...apertoProps('incantesimi')}
            >
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                  <label style={{ ...styles.detail, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t('spell.caratteristica')}{' '}
                    <select
                      style={{ ...styles.inlineInput, padding: '4px 8px' }}
                      value={scheda.incantatore.caratteristica}
                      onChange={(e) => aggiorna({ incantatore: { caratteristica: e.target.value } })}
                    >
                      <option value="">{t('spell.non_incantatore')}</option>
                      {CARATTERISTICHE.map((c) => (
                        <option key={c.key} value={c.key}>
                          {t('attr.' + c.key)}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Concentrazione rimpicciolita e affiancata alla caratteristica */}
                  {(() => {
                    const conc = incantesimiConcentrazioneClasse(scheda.classe);
                    const bonusCon = modificatore(scheda.caratteristiche.costituzione) + (scheda.tiriSalvezza?.costituzione ? scheda.bonusCompetenza : 0);
                    return (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', padding: '3px 8px', borderRadius: 6, background: scheda.concentrazione ? 'rgba(201,162,39,0.15)' : 'rgba(0,0,0,0.15)', border: `1px solid ${scheda.concentrazione ? C.goldDark : C.border}` }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: scheda.concentrazione ? C.goldDark : C.inkDim }}>🧠 {t('conc.label')}</span>
                        <select
                          value={scheda.concentrazione || ''}
                          onChange={(e) => aggiorna({ concentrazione: e.target.value })}
                          style={{ ...styles.inlineInput, fontSize: 12, minWidth: 120, maxWidth: 170, padding: '2px 6px', height: 26 }}
                          title={t('conc.scegli')}
                        >
                          <option value="">{t('conc.nessuna')}</option>
                          {scheda.concentrazione && !conc.includes(scheda.concentrazione) && <option value={scheda.concentrazione}>{scheda.concentrazione}</option>}
                          {conc.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <button
                          className="tirabile"
                          style={{ ...styles.button, fontSize: 11, padding: '2px 8px', height: 26 }}
                          title={t('conc.ts_tooltip')}
                          onClick={() => lanciaD20(t('conc.ts'), bonusCon)}
                        >
                          🎲 {t('conc.ts')} ({conSegno(bonusCon)})
                        </button>
                        {scheda.concentrazione && (
                          <button style={{ ...styles.buttonMini, fontSize: 10, padding: '0 5px', height: 22, color: C.red }} title={t('conc.termina')} onClick={() => aggiorna({ concentrazione: '' })}>✕</button>
                        )}
                      </div>
                    );
                  })()}
                </div>
                {modIncantatore !== null && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, width: '100%', marginTop: 8 }}>
                    <div style={{ ...styles.vitalBox, padding: '10px 6px' }}>
                      <div style={styles.vitalLabel}>{t("vital.mod_incantesimi")}</div>
                      <div style={styles.vitalValue}>{conSegno(modIncantatore)}</div>
                    </div>
                    <div style={{ ...styles.vitalBox, padding: '10px 6px' }}>
                      <div style={styles.vitalLabel}>{t("vital.cd_incantesimi")}</div>
                      <div style={styles.vitalValue}>{8 + scheda.bonusCompetenza + modIncantatore}</div>
                    </div>
                    <div style={{ ...styles.vitalBox, padding: '10px 6px' }}>
                      <div style={styles.vitalLabel}>{t("vital.attacco_incantesimi")}</div>
                      <div style={styles.vitalValue}>
                        <span
                          className="tirabile"
                          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          title={t('spell.tira_attacco')}
                          onClick={() => lanciaD20(t('spell.attacco_inc'), scheda.bonusCompetenza + modIncantatore, { magia: true })}
                        >
                          🎲 {conSegno(scheda.bonusCompetenza + modIncantatore)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Gli slot sono ora mostrati all'interno di ciascun livello nella lista. */}

              {/* Conteggi (compatti) + ricerca. L'aggiunta è un tastino piccolo
                  sotto la lista di ogni livello (vedi più in basso). */}
              <div style={{ marginTop: 14, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ ...styles.detail, fontSize: 11, textAlign: 'center', opacity: 0.75 }}>{t('spell.tocca_nome')}</span>
              </div>
              <div>
                {(() => {
                const bannerStyle = { ...styles.panelTitle, fontSize: 15, marginTop: 14, marginBottom: 8, borderBottom: `2px solid ${C.border}`, paddingBottom: 4 };
                const q = filtroIncantesimo.trim().toLowerCase();
                const match = (s) => !q || (s.nome || '').toLowerCase().includes(q);
                const maxSpellLiv = Math.max(0, ...scheda.incantesimiLista.map(s => s.livello || 0));
                const maxSlotLiv = Math.max(0, ...Object.entries(scheda.slotIncantesimo || {}).filter(([_, v]) => v.totale > 0).map(([k]) => parseInt(k, 10)));
                const maxLiv = Math.min(9, Math.max(scheda.incantatore?.caratteristica ? 1 : 0, maxSpellLiv, maxSlotLiv + 1));
                const aggiungiInc = (nome, liv, manuale, bonus) => {
                  const d = dettagliIncantesimo(nome) || { tempo: manuale ? '1 Az.' : 'AZ', gittata: '', note: '' };
                  aggiorna({ incantesimiLista: [...scheda.incantesimiLista,
                    { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, livello: liv, nome, tempo: d.tempo, gittata: d.gittata, note: d.note, scuola: d.scuola || '', area: d.area || '', danno: d.danno || '', tipoDanno: d.tipoDanno || '', preparato: true, ...(bonus ? { bonus: true } : {}) }] });
                };
                // Tastino piccolo di aggiunta sotto ogni livello: menu compatto con
                // i suggerimenti di quel livello + "scrivi a mano", e toggle ✦ bonus.
                const AddControl = (liv) => {
                  const suggeriti = incantesimiClasseLivello(scheda.classe, liv);
                  const gia = new Set(scheda.incantesimiLista.filter((s) => s.livello === liv).map((s) => (s.nome || '').toLowerCase()));
                  const pieno = liv === 0 ? trucchettiPieno : incantesimiPieno;
                  const bloccato = pieno && !addBonusIncantesimo;
                  return (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                      <select className="add-spell" value="" disabled={bloccato}
                        title={bloccato ? t('spell.max_tooltip') : undefined}
                        style={{ ...styles.buttonMini, fontSize: 12, padding: '5px 10px', fontWeight: 600, cursor: bloccato ? 'not-allowed' : 'pointer', opacity: bloccato ? 0.55 : 1, maxWidth: '100%' }}
                        onChange={(e) => { const v = e.target.value; if (!v) return; aggiungiInc(v === '__manuale__' ? 'Nuovo incantesimo' : v, liv, v === '__manuale__', addBonusIncantesimo); e.target.value = ''; }}>
                        <option value="">{bloccato ? (liv === 0 ? t('spell.max_trucchetti') : t('spell.max_incantesimi')) : `➕ ${t('spell.aggiungi')}`}…</option>
                        <option value="__manuale__">{t('spell.scrivi_mano')}</option>
                        {suggeriti.length > 0 && (
                          <optgroup label={t('spell.incantesimi_da', { classe: scheda.classe })}>
                            {suggeriti.map((n) => <option key={n} value={n} disabled={gia.has(n.toLowerCase())}>{gia.has(n.toLowerCase()) ? `✓ ${n}` : n}</option>)}
                          </optgroup>
                        )}
                      </select>
                      <button type="button" title={t('spell.bonus_tooltip')} onClick={() => setAddBonusIncantesimo(!addBonusIncantesimo)}
                        style={{ ...styles.buttonMini, fontSize: 12, padding: '5px 8px', cursor: 'pointer', borderColor: addBonusIncantesimo ? C.goldDark : C.border, color: addBonusIncantesimo ? C.goldDark : C.inkDim, fontWeight: addBonusIncantesimo ? 700 : 400 }}>
                        ✦ {t('spell.bonus_badge')}
                      </button>
                    </div>
                  );
                };
                const renderLivello = (liv) => {
                  const spells = scheda.incantesimiLista.filter((s) => s.livello === liv && match(s));
                  if (q && spells.length === 0) return null; // durante la ricerca salta i livelli senza risultati
                  const countLiv = scheda.incantesimiLista.filter((x) => x.livello === liv).length;
                  return (
                    <div key={liv} style={{ marginBottom: 14 }}>
                      <h4 style={{ fontSize: 12, color: C.inkDim, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${C.border}`, paddingBottom: 2, marginBottom: 6, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span>{liv === 0 ? t('spell.trucchetti_liv0') : t('spell.n_livello', { n: liv })}</span>
                      </h4>
                      {liv >= 1 && (() => {
                        const slot = scheda.slotIncantesimo[liv] || { totale: 0, spesi: 0 };
                        const aggiornaSlot = (patch) => aggiorna({ slotIncantesimo: { ...scheda.slotIncantesimo, [liv]: { ...slot, ...patch } } });
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, opacity: slot.totale > 0 ? 1 : 0.6 }}>
                            <span style={{ fontSize: 12, color: C.inkDim, fontWeight: 500 }}>{t('spell.slot')}:</span>
                            <Editable value={slot.totale} tipo="numero" width={26} onChange={(v) => aggiornaSlot({ totale: Math.max(0, Math.min(9, v)), spesi: Math.min(slot.spesi, Math.max(0, v)) })} title={t('tip.slot_totali')} />
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                              {Array.from({ length: slot.totale }, (_, i) => i + 1).map((i) => (
                                <span key={i} style={styles.pip(slot.spesi >= i, COLORE_DADO[6])} title={`Spesi: ${slot.spesi}/${slot.totale} (click per segnare)`} onClick={() => aggiornaSlot({ spesi: slot.spesi >= i ? i - 1 : i })} />
                              ))}
                            </div>
                            {/(warlock|patto)/i.test(scheda.classe || '') && (
                              <span style={{ fontSize: 11, color: C.goldDark, fontWeight: 700, marginLeft: 'auto' }} title={t('spell.pact_tip')}>🌙 {t('spell.pact')}</span>
                            )}
                          </div>
                        );
                      })()}
                      {spells.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {spells.map((s) => {
                            const eff = spiegaIncantesimo(s.nome);
                            const dbInc = datiIncantesimo(s.nome) || {};
                            const det = dettagliIncantesimo(s.nome) || {};
                            const tp = s.tempo || dbInc.tempo || det.tempo || '1 Az.';
                            const tempoLabel = /reaz/i.test(tp) ? t('spell.tempo_reazione')
                              : /bonus/i.test(tp) ? t('spell.tempo_bonus')
                              : /^(az|1 az|azione)/i.test(tp) ? t('spell.tempo_azione')
                              : tp;
                            const gittata = s.gittata || dbInc.gittata || det.gittata || 'Personale';
                            const scuola = s.scuola || dbInc.scuola || det.scuola || 'Universale';
                            const area = s.area || dbInc.area || det.area || '';
                            const danno = s.danno || dbInc.danno || det.danno || '';
                            const tipoDanno = s.tipoDanno || dbInc.tipoDanno || det.tipoDanno || '';
                            const note = s.note || det.note || '';
                            const chip = (icona, etichetta, testo) => (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.inkDim, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '2px 8px' }}>
                                <span aria-hidden style={{ opacity: 0.75 }}>{icona}</span>
                                <span style={{ opacity: 0.7 }}>{etichetta}:</span> <span style={{ color: C.ink }}>{testo}</span>
                              </span>
                            );
                            return (
                              <div key={s.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', background: C.panelLight, opacity: (classePreparata && s.livello >= 1 && s.preparato === false) ? 0.5 : 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                                    <button
                                      style={{ background: 'transparent', border: 'none', color: C.ink, fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: 15, lineHeight: 1.2, textDecoration: 'underline dotted', textUnderlineOffset: 3 }}
                                      title={t('tip.cosa_fa_inc')}
                                      onClick={() => setInfo({ titolo: `${s.nome || 'Incantesimo'}${s.livello === 0 ? ' · Trucchetto' : ` · ${s.livello}° livello`}`, testo: eff || 'Nessuna descrizione disponibile per questo incantesimo. Aprilo con ✎ per aggiungere delle note.' })}
                                    >
                                      {s.nome || t('menu.senza_nome')}
                                    </button>
                                    {s.bonus && (
                                      <span
                                        title={t('spell.bonus_badge_tooltip')}
                                        style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: C.goldDark, border: `1px solid ${C.goldDark}`, borderRadius: 6, padding: '0 4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                        onClick={() => aggiorna({ incantesimiLista: scheda.incantesimiLista.map((x) => (x.id === s.id ? { ...x, bonus: false } : x)) })}
                                      >✦ {t('spell.bonus_badge')}</span>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                    {classePreparata && s.livello >= 1 && (
                                      <button
                                        style={{ ...styles.buttonMini, color: s.preparato !== false ? C.goldDark : C.inkDim, borderColor: s.preparato !== false ? C.goldDark : C.border }}
                                        title={s.preparato !== false ? t('spell.preparato_si') : t('spell.preparato_no')}
                                        onClick={() => aggiorna({ incantesimiLista: scheda.incantesimiLista.map((x) => (x.id === s.id ? { ...x, preparato: x.preparato === false } : x)) })}
                                      >{s.preparato !== false ? '⭐' : '☆'}</button>
                                    )}
                                    <button style={styles.buttonMini} title={t('tip.modifica')} onClick={() => setDettaglioInc(s.id)}>✎</button>
                                    <button style={{ ...styles.buttonMini, color: C.red }} title={t('tip.elimina_inc')} onClick={() => aggiorna({ incantesimiLista: scheda.incantesimiLista.filter((x) => x.id !== s.id) })}>🗑</button>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                                  {chip('⏱', t('spell.chip_tempo'), tempoLabel)}
                                  {chip('🎯', t('spell.chip_gittata'), gittata)}
                                  {chip('🔮', 'Scuola', scuola)}
                                  {area && chip('📐', 'Area', area)}
                                  {(danno || tipoDanno) && chip('💥', 'Danno', [danno, tipoDanno].filter(Boolean).join(' '))}
                                  {note && chip('📝', t('spell.chip_note'), note)}
                                </div>
                                {parseEspressioneDado(danno) && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                                    <button
                                      style={{ ...styles.buttonMini, fontSize: 12, padding: '4px 10px', fontWeight: 600, borderColor: C.goldDark, color: C.goldDark }}
                                      title={t('spell.tira_attacco')}
                                      onClick={() => lanciaD20(`${t('spell.attacco_inc')}: ${s.nome}`, scheda.bonusCompetenza + (modIncantatore || 0), { attacco: { nome: s.nome, danno, tipoDanno }, magia: true })}
                                    >🎯 {t('spell.colpire')} {conSegno(scheda.bonusCompetenza + (modIncantatore || 0))}</button>
                                    <button
                                      style={{ ...styles.buttonMini, fontSize: 12, padding: '4px 10px', fontWeight: 600, borderColor: C.red, color: C.red }}
                                      title={t('spell.tira_danni_diretti')}
                                      onClick={() => lanciaDanniDiretti(`${s.nome}${tipoDanno ? ` · ${tipoDanno}` : ''}`, danno, true)}
                                    >💥 {t('spell.danni')} ({danno})</button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {!q && AddControl(liv)}
                    </div>
                  );
                };
                const livelliInc = Array.from({ length: maxLiv }, (_, i) => i + 1);
                if (q && !scheda.incantesimiLista.some(match)) {
                  return <p style={{ ...styles.detail, textAlign: 'center', padding: '12px 0', opacity: 0.8 }}>{t('spell.nessun_risultato')}</p>;
                }
                return (
                  <>
                    <h3 style={{ ...bannerStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{t('spell.trucchetti')}</span>
                      {maxTrucchetti != null && (
                        <span style={{ fontSize: 13, color: trucchettiPieno ? C.goldDark : C.inkDim, fontWeight: 'normal', display: 'flex', alignItems: 'center', textTransform: 'none', letterSpacing: 'normal' }}>
                          {nTrucchetti} / <Editable value={maxTrucchetti} tipo="numero" width={24} onChange={(v) => aggiorna({ maxTrucchetti: Math.max(0, v) })} />
                        </span>
                      )}
                    </h3>
                    {renderLivello(0)}
                    {maxLiv >= 1 && (
                      <h3 style={{ ...bannerStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{t('spell.incantesimi')}</span>
                        {maxIncantesimi != null && (
                          <span style={{ fontSize: 13, color: (classePreparata ? preparatiPieni : incantesimiPieno) ? C.goldDark : C.inkDim, fontWeight: 'normal', display: 'flex', alignItems: 'center', textTransform: 'none', letterSpacing: 'normal' }}>
                            ({classePreparata ? t('spell.preparati') : t('spell.conosciuti')}: {classePreparata ? nPreparati : nIncantesimi} / <Editable value={maxIncantesimi} tipo="numero" width={24} onChange={(v) => aggiorna({ maxIncantesimi: Math.max(0, v) })} />)
                            {nBonus > 0 && <span style={{ color: C.goldDark, fontWeight: 700, marginLeft: 4 }}>✦ {nBonus}</span>}
                          </span>
                        )}
                      </h3>
                    )}
                    {livelliInc.map((liv) => renderLivello(liv))}
                  </>
                );
                })()}
              </div>
            </Sezione>


          </div>
        </div>

        {/* Sezioni descrittive a piena larghezza: riempiono lo spazio sotto le due colonne */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 10, gap: 10 }}>
            
            <Sezione titolo={t("sez.talenti")} {...propsSez('talenti')} {...apertoProps('talenti')}>
              <ListaQuadratini
                value={scheda.talenti}
                lookup={spiegaTalento}
                placeholder={t("talenti.ph")}
                onChange={(v) => aggiorna({ talenti: v })}
              />
            </Sezione>

            {/* Equipaggiamento, aspetto — collassabili */}
            <Sezione titolo={t("sez.equipaggiamento")} {...propsSez('equipaggiamento')} {...apertoProps('equipaggiamento')}>
              {(() => {
                const inv = scheda.inventario || [];
                const pesoInv = inv.reduce((s, o) => s + (o.qta || 1) * (o.peso || 0), 0);
                // Peso di armi e armatura equipaggiate (tutto ciò che ho addosso).
                const attacchi = Array.isArray(scheda.attacchi) ? scheda.attacchi : [];
                const pesoArmi = attacchi.reduce((s, a) => s + pesoStimato(a.nome), 0);
                const pesoArm = pesoArmatura(scheda.armatura);
                const pesoTot = pesoInv + pesoArmi + pesoArm;
                const forza = scheda.caratteristiche.forza || 10;
                const cap = capacitaCarico(forza);
                const soglia1 = forza * 2.5; // ingombrato
                const soglia2 = forza * 5;   // gravemente ingombrato
                const stato = pesoTot > cap ? 'sovraccarico' : pesoTot > soglia2 ? 'grave' : pesoTot > soglia1 ? 'ingombrato' : 'ok';
                const colore = stato === 'ok' ? C.green : stato === 'ingombrato' ? C.gold : C.red;
                const perc = Math.min(100, (pesoTot / cap) * 100);
                const modInv = (id, patch) => aggiorna({ inventario: inv.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
                const toggleEquip = (o, checked) => {
                  const isWeapon = ARMI_5E.find((w) => w.nome === o.nome) || (scheda.attacchi?.find((a) => a.nome === o.nome) ? { nome: o.nome, danno: '1d6', tipoDanno: 'Contundente', categoria: 'Mischia' } : null);
                  let newAttacchi = Array.isArray(scheda.attacchi) ? [...scheda.attacchi] : [];
                  if (checked && isWeapon) {
                    if (!newAttacchi.find((a) => a.nome === o.nome)) {
                      newAttacchi.push({ id: Date.now(), categoria: 'Azione', ...attaccoDaArma(isWeapon, scheda) });
                    }
                  } else if (!checked) {
                    newAttacchi = newAttacchi.filter((a) => a.nome !== o.nome);
                  }
                  aggiorna({
                    inventario: inv.map((x) => (x.id === o.id ? { ...x, equip: checked } : x)),
                    attacchi: newAttacchi
                  });
                };
                const addItem = (nome) => {
                  // Peso automatico dal nome (match esatto → parziale): l'oggetto
                  // viene salvato già col suo peso noto, senza doverlo scrivere.
                  const peso = pesoStimato(nome);
                  aggiorna({ inventario: [...inv, { id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, nome: nome || '', qta: 1, peso, equip: false, categoria: '' }] });
                };
                return (
                  <div>
                    {/* Riepilogo ingombro automatico */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, ...styles.detail, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700 }}>⚖️ {t('inv.ingombro')}: <span style={{ color: colore }}>{pesoTot.toFixed(1)} / {cap.toFixed(0)} kg</span></span>
                        {stato !== 'ok' && <span style={{ color: colore, fontWeight: 700 }}>{t('inv.stato_' + stato)}</span>}
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: C.border, overflow: 'hidden', marginTop: 3 }} title={`${t('inv.soglie')}: ${(soglia1).toFixed(0)} / ${(soglia2).toFixed(0)} / ${cap.toFixed(0)} kg`}>
                        <div style={{ width: `${perc}%`, height: '100%', background: colore, transition: 'width 0.25s ease' }} />
                      </div>
                    </div>
                    {/* Barra di ricerca e pulizia esauriti */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        value={filtroInventario}
                        onChange={(e) => setFiltroInventario(e.target.value)}
                        placeholder="🔍 Cerca nell'inventario..."
                        style={{ ...styles.inlineInput, flex: 1, minWidth: 200, padding: '4px 8px', fontSize: 13 }}
                      />
                      {filtroInventario && (
                        <button style={styles.buttonMini} onClick={() => setFiltroInventario('')}>✕</button>
                      )}
                      <button
                        style={{ ...styles.buttonMini, color: C.red, borderColor: C.red, fontSize: 11 }}
                        title="Rimuovi automaticamente dal tuo inventario tutti gli oggetti con quantità pari a 0"
                        onClick={() => {
                          if (window.confirm("Vuoi rimuovere dall'inventario tutti gli oggetti esauriti (quantità 0)?")) {
                            aggiorna({ inventario: inv.filter((x) => (Number(x.qta) || 0) > 0) });
                          }
                        }}
                      >
                        🧹 Pulisci esauriti (qta 0)
                      </button>
                    </div>
                    {/* Lista oggetti */}
                    {inv.length > 0 && (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                          <thead><tr>
                            <th style={styles.th} title={t('inv.equip_tooltip')}>{t('inv.equip')}</th>
                            <th style={styles.th}>{t('inv.nome')}</th>
                            <th style={styles.th}>{t('inv.qta')}</th>
                            <th style={styles.th}>{t('inv.peso')}</th>
                            <th style={styles.th} />
                          </tr></thead>
                          <tbody>
                            {inv.filter((o) => !filtroInventario || (o.nome || '').toLowerCase().includes(filtroInventario.trim().toLowerCase())).map((o) => {
                              const isWeapon = ARMI_5E.some((w) => w.nome === o.nome) || attacchi.some((a) => a.nome === o.nome);
                              const isEquip = isWeapon ? attacchi.some((a) => a.nome === o.nome) : !!o.equip;
                              return (
                                <tr key={o.id} style={{ opacity: isEquip ? 1 : 0.82 }}>
                                  <td style={{ ...styles.td, textAlign: 'center' }}>
                                    <input type="checkbox" checked={isEquip} onChange={(e) => toggleEquip(o, e.target.checked)} title={t('inv.equip_tooltip')} />
                                  </td>
                                  <td style={styles.td}><Editable value={o.nome} width={150} onChange={(v) => modInv(o.id, { nome: v })} /></td>
                                  <td style={styles.td}>×<Editable value={o.qta} tipo="numero" width={30} onChange={(v) => modInv(o.id, { qta: Math.max(1, v) })} /></td>
                                  <td style={{ ...styles.td, color: C.inkDim, whiteSpace: 'nowrap' }}><Editable value={o.peso} tipo="numero" width={40} onChange={(v) => modInv(o.id, { peso: Math.max(0, v) })} /> kg</td>
                                  <td style={{ ...styles.td, textAlign: 'right' }}><button style={{ ...styles.buttonMini, color: C.red }} title={t('modal.elimina')} onClick={() => aggiorna({ inventario: inv.filter((x) => x.id !== o.id) })}>🗑</button></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {/* Aggiungi oggetto: puoi SCRIVERLO nel campo (autocomplete +
                        Invio o tasto Aggiungi) OPPURE SCEGLIERLO dal menu a
                        tendina, che lo inserisce subito con il peso noto. */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        id="inv-add-input"
                        list="inv-presets"
                        placeholder={t('inv.aggiungi_ph')}
                        style={{ ...styles.inlineInput, flex: 1, minWidth: 140, padding: '6px 8px' }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) { addItem(e.target.value.trim()); e.target.value = ''; } }}
                      />
                      <datalist id="inv-presets">{NOMI_OGGETTI.map((n) => <option key={n} value={n} />)}</datalist>
                    </div>
                  </div>
                );
              })()}
              {(() => {
                // Oggetti magici sintonizzati: massimo 3 (regola 5e) → 3 slot compilabili.
                const arr = Array.isArray(scheda.sintonia) ? scheda.sintonia : (scheda.sintonia ? [scheda.sintonia] : []);
                const slots = [arr[0] || '', arr[1] || '', arr[2] || ''];
                const setSlot = (i, v) => { const n = [...slots]; n[i] = v; aggiorna({ sintonia: n }); };
                const usati = slots.filter((x) => x.trim()).length;
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'flex-start', marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ background: C.panelLight, padding: '12px 14px', borderRadius: 8, border: `1px solid ${C.border}` }}>
                      <div style={{ ...styles.detail, marginBottom: 8, fontWeight: 700, fontSize: 13 }}>{t("equip.sintonia")} <span style={{ color: usati >= 3 ? C.gold : C.inkDim }}>({usati}/3)</span></div>
                      {[0, 1, 2].map((i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ ...styles.detail, minWidth: 16, fontWeight: 600 }}>{i + 1}.</span>
                          <input
                            value={slots[i]}
                            onChange={(e) => setSlot(i, e.target.value)}
                            placeholder={t("equip.sintonia_ph")}
                            style={{ ...styles.inlineInput, flex: 1, minWidth: 0, padding: '6px 10px', fontSize: 13 }}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ background: C.panelLight, padding: '12px 14px', borderRadius: 8, border: `1px solid ${C.border}` }}>
                      <div style={{ ...styles.detail, marginBottom: 8, fontWeight: 700, fontSize: 13 }}>Monete</div>
                      {(() => {
                        const d = scheda.denari || {};
                        const totMo = ((d.mr || 0) / 100) + ((d.ma || 0) / 10) + ((d.me || 0) / 2) + (d.mo || 0) + ((d.mp || 0) * 10);
                        const numMonete = (d.mr || 0) + (d.ma || 0) + (d.me || 0) + (d.mo || 0) + (d.mp || 0);
                        const pesoMonete = numMonete * 0.01; // 50 monete = 0.5 kg (0.01 kg a moneta)
                        return (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8, ...styles.detail }}>
                            <span>💎 <strong>Patrimonio:</strong> ~{totMo.toFixed(2)} MO • ⚖️ <strong>Peso monete:</strong> {pesoMonete.toFixed(2)} kg ({numMonete})</span>
                            <button
                              style={{ ...styles.buttonMini, fontSize: 11, color: C.goldDark, borderColor: C.goldDark }}
                              title="Converte tutte le Monete di Rame (100 MR = 1 MO) e d'Argento (10 MA = 1 MO) in equivalenti Monete d'Oro, tenendo i resti"
                              onClick={() => {
                                const mr = d.mr || 0;
                                const ma = d.ma || 0;
                                const moFromMr = Math.floor(mr / 100);
                                const moFromMa = Math.floor(ma / 10);
                                const remMr = mr % 100;
                                const remMa = ma % 10;
                                const addMo = moFromMr + moFromMa;
                                if (addMo > 0) {
                                  aggiorna({ denari: { ...d, mr: remMr, ma: remMa, mo: (d.mo || 0) + addMo } });
                                } else {
                                  alert("Non hai abbastanza monete di rame o argento per convertire in 1 MO!");
                                }
                              }}
                            >
                              🔄 Semplifica in Oro (MO)
                            </button>
                          </div>
                        );
                      })()}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {DENARI.map(({ key, label }) => (
                          <div key={key} style={{ ...styles.vitalBox, minHeight: 'auto', padding: '8px 4px', background: C.bg }}>
                            <div style={{ ...styles.vitalLabel, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={label}>{label}</div>
                            <div style={{ ...styles.vitalValue, fontSize: 18 }}>
                              <Editable
                                value={scheda.denari[key]}
                                tipo="numero"
                                width={44}
                                onChange={(v) => aggiorna({ denari: { ...scheda.denari, [key]: Math.max(0, v) } })}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </Sezione>

            <Sezione titolo={t("sez.aspetto")} {...propsSez('aspetto')} {...apertoProps('aspetto', false)}>
              <div style={styles.moduloLabel}>{t("aspetto.aspetto")}</div>
              <AreaTesto
                value={scheda.aspetto}
                placeholder={t("aspetto.aspetto_ph")}
                onChange={(v) => aggiorna({ aspetto: v })}
              />
              <div style={{ ...styles.moduloLabel, marginTop: 10 }}>{t("aspetto.carattere")}</div>
              <AreaTesto
                value={scheda.trattiCaratteriali}
                placeholder={t("aspetto.carattere_ph")}
                onChange={(v) => aggiorna({ trattiCaratteriali: v })}
              />
              <div style={{ ...styles.moduloLabel, marginTop: 10 }}>{t("aspetto.storia")}</div>
              <AreaTesto
                value={scheda.note}
                placeholder={t("aspetto.storia_ph")}
                onChange={(v) => aggiorna({ note: v })}
              />
            </Sezione>
        </div>

        <footer style={{ textAlign: 'center', margin: '18px 0 0', fontSize: 11, color: C.inkDim }}>
          Emblemi di classe e specie:{' '}
          <a href="https://game-icons.net" target="_blank" rel="noreferrer" style={{ color: C.inkDim }}>game-icons.net</a>{' '}
          (CC BY 3.0).
        </footer>
        <div style={{ height: combat.attivo && combat.aperto ? 220 : 0 }} />
      </main>

      {/* ===== Combat tracker: barra fissa in basso (stile Fantasy Grounds) ===== */}
      {!(combat.attivo && combat.aperto) ? (
        <button
          onClick={() => (combat.combattenti.length ? setCombat((c) => ({ ...c, attivo: true, aperto: true })) : aggiungiPgAlCombat())}
          style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1500, ...styles.buttonPrimary, borderRadius: 999, padding: '10px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.35)' }}
          title={t('ct.apri')}
        >
          ⚔️ {t('ct.titolo')}{combat.combattenti.length ? ` (${combat.combattenti.length})` : ''}
        </button>
      ) : (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1500, background: C.panel, borderTop: `2px solid var(--c-gold-dark)`, boxShadow: '0 -4px 20px rgba(0,0,0,0.4)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <strong style={{ color: 'var(--c-title)', fontSize: 15, whiteSpace: 'nowrap' }}>⚔️ {t('ct.round')} {combat.round}</strong>
              <button style={styles.buttonMini} onClick={turnoPrecedente} title={t('ct.prec')}>◀</button>
              <button style={{ ...styles.buttonMini, fontWeight: 700 }} onClick={prossimoTurno} title={t('ct.succ')}>{t('ct.turno')} ▶</button>
              <span style={{ flex: 1 }} />
              <button style={styles.buttonMini} onClick={ordinaIniziativa} title="Ordina i combattenti per iniziativa decrescente">🔃 Ordina</button>
              <button
                style={{ ...styles.buttonMini, color: C.goldDark, borderColor: C.goldDark }}
                title="Tira automaticamente 1d20 per tutti i combattenti che hanno Iniziativa a 0, poi ordina la lista"
                onClick={() => {
                  setCombat((c) => ({
                    ...c,
                    combattenti: c.combattenti.map((cb) => ({
                      ...cb,
                      iniziativa: cb.iniziativa ? cb.iniziativa : tiraDado(20) + (cb.tipo === 'pg' ? modificatore(scheda.caratteristiche?.destrezza || 10) : Math.floor(Math.random() * 5))
                    }))
                  }));
                  setTimeout(ordinaIniziativa, 50);
                }}
              >
                🎲 Tira Iniziative (0)
              </button>
              <button
                style={{ ...styles.buttonMini, color: C.red, borderColor: C.red }}
                title="Applica un danno ad area (Es. Palla di Fuoco) a tutti i nemici presenti nel Combat Tracker"
                onClick={() => {
                  const dmg = parseInt(window.prompt("Inserisci i danni ad area da applicare a TUTTI i nemici:"), 10);
                  if (dmg > 0) {
                    setCombat((c) => ({
                      ...c,
                      combattenti: c.combattenti.map((cb) => cb.tipo === 'nemico' ? { ...cb, pfAttuali: Math.max(0, cb.pfAttuali - dmg) } : cb)
                    }));
                  }
                }}
              >
                💥 Danno ad Area (Nemici)
              </button>
              <button style={styles.buttonMini} onClick={aggiungiPgAlCombat} title={t('ct.aggiungi_pg')}>➕ {t('ct.pg')}</button>
              <button style={styles.buttonMini} onClick={() => aggiungiCombattente('alleato')}>➕ {t('ct.alleato')}</button>
              <button style={styles.buttonMini} onClick={() => aggiungiCombattente('nemico')}>➕ {t('ct.nemico')}</button>
              <button style={styles.buttonMini} onClick={() => setCombat((c) => ({ ...c, aperto: false }))} title={t('ct.minimizza')}>▁</button>
              <button style={{ ...styles.buttonMini, color: C.red, borderColor: C.red }} onClick={() => { if (window.confirm(t('ct.fine_conferma'))) setCombat({ attivo: false, aperto: true, round: 1, turno: 0, combattenti: [] }); }} title={t('ct.fine')}>✕</button>
            </div>
            {combat.combattenti.length === 0 ? (
              <div style={{ ...styles.detail, padding: '10px 0' }}>{t('ct.vuoto')}</div>
            ) : (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, alignItems: 'stretch' }}>
                {combat.combattenti.map((cb, idx) => {
                  const attivoTurno = idx === combat.turno;
                  const col = cb.tipo === 'nemico' ? C.red : cb.tipo === 'alleato' ? C.green : C.gold;
                  const morto = cb.pfAttuali <= 0;
                  const applica = (segno) => { const v = Math.abs(parseInt(ctDmg[cb.id], 10) || 0); if (v) { dannoCura(cb.id, segno * v); setCtDmg((d) => ({ ...d, [cb.id]: '' })); } };
                  return (
                    <div key={cb.id} style={{ flex: '0 0 auto', width: 196, border: `2px solid ${attivoTurno ? 'var(--c-gold-dark)' : col}`, borderRadius: 10, padding: 8, background: attivoTurno ? C.panelLight : C.panel, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: C.bg, border: `1.5px solid ${col}`, borderRadius: 6, padding: '1px 4px' }} title={t('ct.iniziativa')}>
                          <span style={{ fontSize: 11, color: col, fontWeight: 800 }}>⚡</span>
                          <input
                            type="number"
                            value={cb.iniziativa ?? 0}
                            onChange={(e) => modCombat(cb.id, { iniziativa: parseInt(e.target.value, 10) || 0 })}
                            onBlur={() => ordinaIniziativa()}
                            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                            style={{ ...styles.inlineInput, width: 34, textAlign: 'center', fontWeight: 800, fontSize: 15, color: col, padding: 0, border: 'none', background: 'transparent', height: 22 }}
                          />
                          <button
                            style={{ ...styles.buttonMini, padding: '0 3px', fontSize: 11, border: 'none', color: C.inkDim, height: 20 }}
                            title="Tira d20 per iniziativa e ordina"
                            onClick={() => {
                              const roll = tiraDado(20) + (cb.tipo === 'pg' ? modificatore(scheda.caratteristiche?.destrezza || 10) : Math.floor(Math.random() * 5));
                              modCombat(cb.id, { iniziativa: roll });
                              setTimeout(ordinaIniziativa, 10);
                            }}
                          >🎲</button>
                        </div>
                        <span style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 13, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <Editable value={cb.nome} onChange={(v) => modCombat(cb.id, { nome: v })} width={100} />
                        </span>
                        <button style={{ ...styles.buttonMini, color: C.red, padding: '0 5px' }} title={t('ct.rimuovi')} onClick={() => setCombat((c) => ({ ...c, combattenti: c.combattenti.filter((x) => x.id !== cb.id) }))}>×</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.inkDim }}>
                        <span title={t("vital.ca")} style={{ fontWeight: 700 }}>CA <Editable value={cb.ca} tipo="numero" width={24} onChange={(v) => modCombat(cb.id, { ca: v })} /></span>
                        <span
                          className="tirabile"
                          style={{ cursor: 'pointer', color: cb.concentrazione ? C.gold : C.inkDim, fontWeight: cb.concentrazione ? 700 : 400 }}
                          title={t('ct.concentrazione')}
                          onClick={() => modCombat(cb.id, { concentrazione: !cb.concentrazione })}
                        >🧠 {cb.concentrazione ? t('ct.conc_on') : t('ct.conc_off')}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'center' }}>
                        <strong style={{ fontSize: 20, color: morto ? C.red : cb.pfAttuali / Math.max(1, cb.pfMax) > 0.5 ? C.green : C.gold }}>
                          <Editable value={cb.pfAttuali} tipo="numero" width={34} onChange={(v) => modCombat(cb.id, { pfAttuali: Math.max(0, v) })} />
                        </strong>
                        <span style={{ color: C.inkDim, fontSize: 13 }}>/ <Editable value={cb.pfMax} tipo="numero" width={34} onChange={(v) => modCombat(cb.id, { pfMax: Math.max(1, v) })} /></span>
                        {cb.pfTemp > 0 && <span style={{ color: '#4A90E2', fontSize: 12 }}>+{cb.pfTemp}</span>}
                        <span style={{ marginLeft: 4, color: C.inkDim, fontSize: 11 }} title={t('vital.temporanei')}>➕<Editable value={cb.pfTemp} tipo="numero" width={20} onChange={(v) => modCombat(cb.id, { pfTemp: Math.max(0, v) })} /></span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.35)', border: `1px solid ${C.border}`, overflow: 'hidden', margin: '2px 0 4px', display: 'flex', width: '100%' }}>
                        <div style={{ width: `${Math.min(100, Math.max(0, (cb.pfAttuali / Math.max(1, cb.pfMax)) * 100))}%`, height: '100%', background: cb.pfAttuali / Math.max(1, cb.pfMax) > 0.5 ? C.green : cb.pfAttuali / Math.max(1, cb.pfMax) > 0.25 ? C.gold : C.red, transition: 'width 0.2s' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        <input
                          type="number"
                          value={ctDmg[cb.id] || ''}
                          onChange={(e) => setCtDmg((d) => ({ ...d, [cb.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && applica(-1)}
                          placeholder={t('ct.danno_ph')}
                          style={{ ...styles.inlineInput, flex: 1, minWidth: 0, padding: '2px 4px', fontSize: 12 }}
                        />
                        <button style={{ ...styles.buttonMini, color: C.red, borderColor: C.red, padding: '2px 6px' }} title={t('ct.danno')} onClick={() => applica(-1)}>−</button>
                        <button style={{ ...styles.buttonMini, color: C.green, borderColor: C.green, padding: '2px 6px' }} title={t('ct.cura')} onClick={() => applica(1)}>＋</button>
                      </div>
                      {(morto || cb.tipo === 'pg') && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11 }} title={t('vital.ts_morte')}>
                          <span style={{ color: C.inkDim }}>💀</span>
                          {[1, 2, 3].map((i) => (
                            <span key={`s${i}`} style={styles.pip(cb.tsMorte.successi >= i, C.green)} onClick={() => modCombat(cb.id, { tsMorte: { ...cb.tsMorte, successi: cb.tsMorte.successi >= i ? i - 1 : i } })} />
                          ))}
                          <span style={{ color: C.border }}>|</span>
                          {[1, 2, 3].map((i) => (
                            <span key={`f${i}`} style={styles.pip(cb.tsMorte.fallimenti >= i, C.red)} onClick={() => modCombat(cb.id, { tsMorte: { ...cb.tsMorte, fallimenti: cb.tsMorte.fallimenti >= i ? i - 1 : i } })} />
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
                        {cb.condizioni.map((cond) => (
                          <span key={cond} onClick={() => modCombat(cb.id, { condizioni: cb.condizioni.filter((x) => x !== cond) })}
                            style={{ fontSize: 10, background: 'rgba(176,58,46,0.12)', color: C.red, border: `1px solid ${C.red}`, borderRadius: 6, padding: '0 5px', cursor: 'pointer' }} title={t('ct.rimuovi_cond')}>
                            {cond} ×
                          </span>
                        ))}
                        <select
                          value=""
                          onChange={(e) => { if (e.target.value) modCombat(cb.id, { condizioni: [...cb.condizioni, e.target.value] }); }}
                          style={{ ...styles.inlineInput, fontSize: 10, padding: '1px 2px' }}
                        >
                          <option value="">＋ {t('ct.condizione')}</option>
                          {CONDIZIONI_5E.filter((c) => !cb.condizioni.includes(c)).map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
