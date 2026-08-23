import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { ICONE_CLASSE, ICONE_SPECIE } from './ritratti';
import { t, setLinguaAttuale, DIZIONARIO, traduciDato } from './i18n';
import { avviaAmbiente, fermaAmbiente, setVolumeAmbiente, eseguiEffettoSonoro, sbloccaAudio, precaricaSfx } from './utils/audioAmbiente';
import { C, COLORE_DADO, BASE_TEMA, PRESET_COLORI } from './ui/tema.js';
import { styles, GLOBAL_CSS } from './ui/stili.js';
import { Editable, Rollable, CampoModulo, CampoConTendina, CampoTendina, AreaTesto, ListaQuadratini, Sezione, CampoBloccato } from './ui/componenti.jsx';
import { caTotale, competenteInArmatura, bonusAbilita, bonusTiroSalvezza, bonusClasseArmaturaOggetti, bonusTiriSalvezzaOggetti, oggettiConEffettoAttivo, punteggioCaratteristica } from './rules/scheda.js';
import { FLYORA_JSON, ESEMPIO_GNOMO } from './data/esempi.js';
import { CARATTERISTICHE, ABILITA } from './data/caratteristiche.js';
import { EFFETTI_CONDIZIONI, ETICHETTE_EFFETTI } from './data/condizioni.js';
import { novitaRecenti, ultimaVersioneNovita } from './data/novita.js';
import { codificaScheda, decodificaScheda, preparaPerCondivisione, costruisciLink, payloadDaUrl, LIMITE_PAYLOAD } from './utils/condivisione.js';
import { creaStanza, apriStanza, normalizzaCodiceStanza, formattaCodiceStanza, DURATA_STANZA_ORE } from './utils/stanze.js';
import { generaCodiceSync, normalizzaCodiceSync, formattaCodiceSync, salvaSync, caricaSync, messaggioErroreSync } from './utils/sync.js';
import { posizionePopover, stilePopover } from './utils/popover.js';
import { salvaJson, rosterSenzaImmagini, riagganciaImmagini, salvaImmaginiRoster, caricaImmaginiRoster, rimuoviImmaginePersonaggio, preservaImmaginiSeMancanti } from './utils/persistenza.js';

// ---------------------------------------------------------------------------
// Palette e stili
// ---------------------------------------------------------------------------

// Tema chiaro "foglio di carta": bianco, inchiostro scuro, accenti sobri.

/** Numero valido o fallback (helper condiviso: usato da loader e dal Level Up). */
function num(v, fallback) { return Number.isFinite(Number(v)) ? Number(v) : fallback; }

/** Fetch che non può lasciare l'interfaccia sospesa indefinitamente (Safari/iOS). */
async function fetchConTimeout(url, opzioni = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opzioni, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

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

function IconaMonetaOro({ size = 20 }) {
  return (
    <span
      aria-label="Moneta d'oro"
      role="img"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, flex: `0 0 ${size}px`, borderRadius: '50%', boxSizing: 'border-box',
        background: 'radial-gradient(circle at 35% 30%, #ffdf73, #d9a93a 55%, #9a6a08)',
        border: '1px solid #b8860b', color: '#fff0a6', fontSize: Math.max(9, size * 0.55),
        lineHeight: 1, textShadow: '0 1px 1px rgba(88,52,0,0.55)',
        boxShadow: 'inset 0 0 0 1px rgba(255,235,145,0.35)',
      }}
    >✦</span>
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

/** Caratteristica da incantatore della classe (o '' se non incantatore/ignota).
 *  Per Cavaliere Mistico/Mistificatore Arcano (Intelligenza) serve la sottoclasse:
 *  senza quella specifica sottoclasse, Guerriero e Ladro non sono incantatori. */
function caratteristicaIncantatorePerClasse(classe, sottoclasse) {
  const c = coloreClasse(classe);
  return (c && CARATT_INCANTATORE[c.match[0]]) || (sottoclasseTerzoIncantatore(classe, sottoclasse) ? 'intelligenza' : '');
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

/** Gruppi di dadi vita nell'ordine delle classi (prima la principale, poi il
 *  multiclasse nell'ordine in cui è stato aggiunto): stesso tipo di dado →
 *  un solo gruppo con la somma dei livelli, tipi diversi → gruppi separati. */
function gruppiDadoVitaClassi(classePrincipale, livPrincipale, multiclasseArray) {
  const ordine = [];
  const indice = {};
  const addDV = (cl, lv) => {
    if (!cl || !lv) return;
    const f = dadoVitaClasse(cl);
    if (indice[f] == null) { indice[f] = ordine.length; ordine.push({ facce: f, quantita: 0 }); }
    ordine[indice[f]].quantita += Math.max(1, Math.floor(lv));
  };
  addDV(classePrincipale, livPrincipale);
  if (Array.isArray(multiclasseArray)) {
    for (const m of multiclasseArray) {
      if (m && m.classe) addDV(m.classe, m.livello);
    }
  }
  return ordine;
}

// Calcola la formula unificata dei Dadi Vita (es. "5d10 + 2d6") per PG persino multiclasse
function calcolaFormulaDadiVita(classePrincipale, livPrincipale, multiclasseArray) {
  return gruppiDadoVitaClassi(classePrincipale, livPrincipale, multiclasseArray)
    .map((g) => `${g.quantita}d${g.facce}`)
    .join(' + ');
}

/** Normalizza i dadi vita spesi in una mappa { facce: quantitàSpesa }, uno
 *  per gruppo (tipo di dado). Le schede vecchie salvavano un numero unico:
 *  lo si riassegna al primo gruppo così non si perde nulla. */
function dadiVitaSpesiNormalizzati(scheda) {
  const gruppi = gruppiDadoVita(scheda.dadiVita);
  const raw = scheda.dadiVitaSpesi;
  const out = {};
  if (raw && typeof raw === 'object') {
    for (const g of gruppi) out[g.facce] = Math.max(0, Math.min(g.quantita, Number(raw[g.facce]) || 0));
  } else {
    const n = Math.max(0, Number(raw) || 0);
    gruppi.forEach((g, i) => { out[g.facce] = i === 0 ? Math.min(g.quantita, n) : 0; });
  }
  return out;
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

/**
 * Aumenti di caratteristica dalla razza (regole 2014). Ritorna una mappa
 * { caratteristica: bonus }. Il Mezzelfo ha due +1 a scelta: li assegniamo
 * alle caratteristiche più utili alla classe, saltando quelle già toccate.
 */
function bonusCaratteristicheSpecie2014(specie, classe) {
  const d = datiSpecieDi(specie);
  const tab = d && BONUS_CARATT_SPECIE_2014[d.nome];
  if (!tab) return {};
  const { sceltaExtra, ...fissi } = tab;
  const out = { ...fissi };
  if (sceltaExtra) {
    const c = coloreClasse(classe);
    const prio = (c && PRIORITA_CARATT[c.match[0]]) || ['forza', 'destrezza', 'costituzione', 'intelligenza', 'saggezza', 'carisma'];
    let rimasti = sceltaExtra;
    for (const k of prio) {
      if (rimasti <= 0) break;
      if (out[k]) continue;
      out[k] = 1;
      rimasti -= 1;
    }
  }
  return out;
}

/** Riepilogo leggibile dei bonus di caratteristica, es. "+2 DES, +1 INT". */
function riepilogoBonusCaratt(mappa) {
  return Object.entries(mappa)
    .map(([k, v]) => `+${v} ${k.slice(0, 3).toUpperCase()}`)
    .join(', ');
}

/**
 * Slot di Maestria/Expertise (doppia competenza) disponibili a un certo livello:
 * solo Ladro e Bardo la ottengono, in due tranche da 2 abilità ciascuna.
 */
function maestriaSlotDisponibili(classe, livello, versione = '2024') {
  const k = chiaveClasse(classe);
  const lv = Number(livello) || 1;
  if (k === 'ladro') return lv >= 6 ? 4 : lv >= 1 ? 2 : 0;
  if (k === 'bardo') return versione === '2014' ? (lv >= 10 ? 4 : lv >= 3 ? 2 : 0) : (lv >= 9 ? 4 : lv >= 2 ? 2 : 0);
  return 0;
}

/** Livelli in cui la classe ottiene un Aumento dei Punteggi di Caratteristica. */
function livelliASI(classe) {
  const c = coloreClasse(classe);
  return (c && ASI_LIV[c.match[0]]) || ASI_LIV._default;
}

/**
 * Applica gli ASI maturati fino a un certo livello, come farebbe un giocatore
 * che sale di livello uno alla volta: +2 alla caratteristica più utile alla
 * classe, e se è già a 20 si passa alla successiva. Serve quando il PG viene
 * creato direttamente a un livello alto (altrimenti resterebbe con i tiri
 * grezzi anche al 7°, che a D&D non succede mai).
 * Ritorna il numero di ASI applicati, così la creazione può dirlo all'utente.
 */
/**
 * Applica gli ASI dei livelli già superati. Per ogni livello, se in `scelteTalento`
 * c'è un nome di talento associato, quel livello diventa un talento invece del
 * classico +2 (esattamente come la scelta "aumento o talento" del Level Up).
 * Ritorna { applicati, talenti } così il chiamante sa quanti +2 sono scattati
 * e quali talenti aggiungere al campo talenti.
 */
function applicaASIFinoA(caratteristiche, classe, livello, scelteTalento = {}) {
  const livelli = livelliASI(classe).filter((l) => l <= Math.max(1, Number(livello) || 1));
  if (!livelli.length) return { applicati: 0, talenti: [] };
  const prio = (coloreClasse(classe) && PRIORITA_CARATT[coloreClasse(classe).match[0]])
    || ['forza', 'destrezza', 'costituzione', 'intelligenza', 'saggezza', 'carisma'];
  let applicati = 0;
  const talenti = [];
  for (const lv of livelli) {
    const talento = (scelteTalento[lv] || '').trim();
    if (talento) { talenti.push(talento); continue; }
    applicati += 1;
    let punti = 2; // ogni ASI vale +2, spalmati se la caratteristica tocca il tetto di 20
    for (const k of prio) {
      if (punti <= 0) break;
      const spazio = 20 - (caratteristiche[k] || 10);
      if (spazio <= 0) continue;
      const dai = Math.min(punti, spazio);
      caratteristiche[k] = (caratteristiche[k] || 10) + dai;
      punti -= dai;
    }
  }
  return { applicati, talenti };
}

// Punti esperienza minimi per livello (identici nelle due edizioni).
const PE_PER_LIVELLO = [0, 0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

/**
 * Oro iniziale per un personaggio creato a livello alto (linee guida del DMG).
 * Sotto il 5° livello vale la dotazione normale della classe.
 */
function oroInizialePerLivello(livello) {
  const L = Number(livello) || 1;
  if (L >= 17) return 20000 + 5 * 250;
  if (L >= 11) return 5000 + 5 * 250;
  if (L >= 5) return 500 + 5 * 25;
  return 0;
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

/** Incantesimi consigliati per la classe a un dato livello (o [] se non previsti).
 *  Cavaliere Mistico/Mistificatore Arcano pescano dalla lista del Mago (vedi
 *  sottoclasseTerzoIncantatore), ristretta alle due scuole solo nella 5.0. */
function incantesimiClasseLivello(classe, livello, sottoclasse, versione) {
  if (sottoclasseTerzoIncantatore(classe, sottoclasse)) {
    return incantesimiTerzoCasterLivello(classe, sottoclasse, livello, versione);
  }
  const k = chiaveClasse(classe);
  return (k && INCANTESIMI_CLASSE[k] && INCANTESIMI_CLASSE[k][livello]) || [];
}

/** Incantesimi con Concentrazione disponibili per la classe (dalle liste note). */
function incantesimiConcentrazioneClasse(classe, sottoclasse, versione) {
  const terzo = sottoclasseTerzoIncantatore(classe, sottoclasse);
  const k = terzo ? 'mago' : chiaveClasse(classe);
  const liste = terzo ? listeIncantesimiTerzoCaster(terzo, versione) : INCANTESIMI_CLASSE[k];
  if (!k || !liste) return [];
  const tutti = [...new Set(Object.values(liste).flat())];
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
// (spostate sui background); l'Elfo con "Sensi Acuti" ne concede 1 a scelta,
// Umano e Mezzelfo ne concedono una/due qualsiasi ("tutte"), il Mezzorco
// concede Intimidire. 'tutte' = qualsiasi abilità. Chiavi = quelle di ABILITA.

/** Competenze concesse dalla specie: { numero, lista: [chiavi] } (lista completa se 'tutte'), o null. */
function competenzeSpecieDi(specie) {
  if (!specie) return null;
  const s = String(specie).toLowerCase();
  const chiavi = Object.keys(COMPETENZE_SPECIE);
  const esatta = chiavi.find((x) => x.toLowerCase() === s);
  const chiave = esatta || [...chiavi].sort((a, b) => b.length - a.length).find((x) => s.includes(x.toLowerCase()));
  if (!chiave) return null;
  const dati = COMPETENZE_SPECIE[chiave];
  const lista = dati.lista === 'tutte' ? ABILITA.map((a) => a.key) : dati.lista;
  return { numero: dati.numero, lista, tratto: dati.tratto };
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

/** Spezza i tratti di specie (stringa con virgole) in voci separate, tenendo
 *  insieme le virgole dentro le parentesi. Restituisce un testo con a-capo,
 *  così ogni tratto diventa una chip separata in ListaQuadratini. */
function trattiSpecieTesto(tratti) {
  return String(tratti || '')
    .split(/,(?![^(]*\))/)
    .map((x) => x.trim())
    .filter(Boolean)
    .join('\n');
}

/** Estrae una quantità "×N" / "xN" dal nome di un oggetto della dotazione:
 *  "Pugnale ×2" → { nome: "Pugnale", qta: 2 }. Senza suffisso → qta 1. */
function separaQtaOggetto(nomeRaw) {
  const s = String(nomeRaw).trim();
  // suffisso "×N" / "xN": "Pugnale ×2" → Pugnale, 2
  let m = s.match(/^(.+?)\s*[×xX]\s*(\d{1,4})$/);
  if (m) return { nome: m[1].trim(), qta: Math.max(1, parseInt(m[2], 10)) };
  // prefisso numerico: "20 frecce" → frecce, 20 (ma non "1d6…")
  m = s.match(/^(\d{1,4})\s*[×xX]?\s+(.+)$/);
  if (m && !/^\d*d\d/i.test(s)) return { nome: m[2].trim(), qta: Math.max(1, parseInt(m[1], 10)) };
  return { nome: s, qta: 1 };
}

/** Impostazioni note per oggetti con cariche. La Perla del Potere recupera
 * uno slot di 3° livello o inferiore e torna utilizzabile all'alba. */
function utilizziOggettoNoto(nome) {
  if (/perla del pot(?:ere)?\.?/i.test(String(nome || ''))) {
    return {
      nome: 'Perla del Potere',
      usi: 1, usiMax: 1, ricarica: 'alba',
      effetto: 'Azione Magica: recuperi uno slot incantesimo speso di 3° livello o inferiore. La Perla torna utilizzabile all’alba successiva.',
    };
  }
  return null;
}

// Nomi abbreviati comuni (import da altri strumenti) → nome per intero, per
// far scattare il peso noto anche quando l'oggetto non ha un effetto o degli
// utilizzi da riconoscere (le pozioni, per esempio).
const NOMI_ABBREVIATI_OGGETTO = [
  [/^pozione (?:di )?resistenza al freddo\.?$/i, 'Pozione di Resistenza al Freddo'],
  [/^pozione (?:di )?respirare sott.?acqua\.?$/i, 'Pozione di Respirare sott’Acqua'],
  [/^pozione (?:di )?resistenza al fuoco\.?$/i, 'Pozione di Resistenza al Fuoco'],
  [/^pozione (?:di )?resistenza al veleno\.?$/i, 'Pozione di Resistenza al Veleno'],
  [/^(?:poz\.?|pozione) antitossina\.?$/i, 'Antitossina'],
  [/^unguento (?:res\.?|di resistenza al) veleno\.?$/i, 'Unguento di Resistenza al Veleno'],
];
function nomeAbbreviatoNoto(nome) {
  const n = String(nome || '').trim();
  for (const [re, canonico] of NOMI_ABBREVIATI_OGGETTO) if (re.test(n)) return canonico;
  return null;
}

function effettoOggettoNoto(nome) {
  const n = String(nome || '');
  if (/guanti (?:del potere orchesco|della forza orchesca)/i.test(n)) {
    return { nome: 'Guanti del Potere Orchesco', effettoMeccanico: 'forza_impostata_19', richiedeSintonia: true };
  }
  if (/mantello (?:della |di )?prot(?:ezione|\.)?/i.test(n)) {
    return { nome: 'Mantello della Protezione', effettoMeccanico: 'classe_armatura_tiri_salvezza_1', richiedeSintonia: true };
  }
  return null;
}

function completaUtilizziOggetto(oggetto) {
  const noto = utilizziOggettoNoto(oggetto?.nome);
  const effettoNoto = effettoOggettoNoto(oggetto?.nome);
  const nomeCorretto = effettoNoto?.nome || noto?.nome || nomeAbbreviatoNoto(oggetto?.nome) || oggetto.nome;
  const conEffetto = effettoNoto ? {
    ...oggetto,
    nome: nomeCorretto,
    effettoMeccanico: oggetto.effettoMeccanico || effettoNoto.effettoMeccanico,
    richiedeSintonia: oggetto.richiedeSintonia ?? effettoNoto.richiedeSintonia,
  } : { ...oggetto, nome: nomeCorretto };
  if (!noto) return conEffetto;
  return {
    ...conEffetto,
    usi: Number.isFinite(Number(oggetto.usi)) ? Number(oggetto.usi) : noto.usi,
    usiMax: Math.max(1, Number(oggetto.usiMax) || noto.usiMax),
    ricarica: oggetto.ricarica || noto.ricarica,
    effetto: conEffetto.effetto || noto.effetto,
  };
}

const EFFETTI_OGGETTO = [
  ['', 'Nessun effetto meccanico', 'No mechanical effect'],
  ['classe_armatura_1', 'Classe Armatura +1', 'Armor Class +1'],
  ['classe_armatura_2', 'Classe Armatura +2', 'Armor Class +2'],
  ['classe_armatura_3', 'Classe Armatura +3', 'Armor Class +3'],
  ['classe_armatura_tiri_salvezza_1', 'Classe Armatura e tiri salvezza +1', 'Armor Class and saving throws +1'],
  ['tiri_salvezza_1', 'Tiri salvezza +1', 'Saving throws +1'],
  ['tiri_salvezza_2', 'Tiri salvezza +2', 'Saving throws +2'],
  ['tiri_salvezza_3', 'Tiri salvezza +3', 'Saving throws +3'],
  ['costituzione_impostata_19', 'Costituzione impostata a 19', 'Constitution set to 19'],
  ['forza_impostata_19', 'Forza impostata a 19', 'Strength set to 19'],
  ['intelligenza_impostata_19', 'Intelligenza impostata a 19', 'Intelligence set to 19'],
];

/** Arma da tiro che consuma munizioni (arco, balestra, fionda: proprietà "Munizioni"). */
function armaUsaMunizioni(nomeArma) {
  const a = ARMI_5E.find((w) => w.nome === nomeArma);
  return !!(a && a.ranged && /munizion/i.test(a.note || ''));
}
/** Regex del tipo di munizione adatto all'arma (frecce per archi, quadrelli per balestre, ecc.). */
function regexMunizione(nomeArma) {
  const n = String(nomeArma || '').toLowerCase();
  if (n.includes('arco')) return /frecc/i;
  if (n.includes('balestra')) return /(quadrell|verretton|dardo|bolt)/i;
  if (n.includes('fionda')) return /(proiettil|pallott|sling)/i;
  return /(frecc|quadrell|proiettil|munizion)/i;
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
// 'addestramento' e 'risorse' non sono più qui: vivono nel Profilo (colonna destra, sotto il ritratto).
// privilegi/privilegiSottoclasse/talenti sono nel blocco fisso "Privilegi & Talenti"
// sotto la Magia (non riordinabili singolarmente).
// 'metamagia' NON è qui: non è trascinabile, resta sempre agganciata sotto la Magia.
const ORDINE_SEZIONI_DEFAULT = ['attacchi', 'incantesimi', 'equipaggiamento', 'aspetto', 'diario'];

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



// ---------------------------------------------------------------------------
// Regole D&D 5e e parser delle espressioni di dado
// ---------------------------------------------------------------------------


import { spiegaPrivilegio, spiegaIncantesimo, spiegaTratto, spiegaTalento, spiegaMetamagia, setEdizioneAttuale, METAMAGIA_5E, TALENTI_5E, INCANTESIMI_NOMI as NOMI_SPIEG_INC } from './data/spiegazioni.js';
import { INCANTESIMI_DB, datiIncantesimo } from './data/incantesimi.js';

const INCANTESIMI_NOMI = Array.from(new Set([...NOMI_SPIEG_INC, ...Object.keys(INCANTESIMI_DB)])).sort((a, b) => a.localeCompare(b, 'it'));
import { NOMI_CLASSI, BACKGROUND_5E, TAGLIE_5E, ALLINEAMENTI_5E, SOTTOCLASSI_5E, INCANTESIMI_CLASSE, TRUCCHETTI_NOTI, INC_MAX_2024, INC_MAX_2014_NOTI, SLOT_FULL_CASTER, SLOT_MEZZO_CASTER, CLASSI_FULL_CASTER, CLASSI_MEZZO_CASTER, DANNI_5E, SENSI_5E, CONDIZIONI_5E, PESI_OGGETTI, NOMI_OGGETTI, PESO_ARMATURA_TIPO, LINGUE_5E, ARMI_5E } from './data/dati5e.js';
import { BACKGROUND_COMPETENZE, SPECIE_5E, SUBCLASS_PRIVILEGI, CARATT_INCANTATORE, PRIORITA_CARATT, DADO_VITA_CLASSE, BACKGROUND_CARATT, TS_CLASSE, ADDESTRAMENTO_CLASSE, COMPETENZE_CLASSE, PRIVILEGI_CLASSE_L1, PRIVILEGI_CLASSE_L1_2014, PRIVILEGI_CLASSE_LIV, PRIVILEGI_CLASSE_LIV_2014, ASI_LIV, SOTTOCLASSE_LIV, SOTTOCLASSE_LIV_2014, COMPETENZE_SPECIE, NOMI_SPECIE, NOMI_GENERICI, SPECIE_DATI, BONUS_CARATT_SPECIE_2014, SFINIMENTO_2014, BASE_ARMATURA_DEFAULT, ESEMPI_ARMATURA } from './data/dati5e.js';
import { modificatore, conSegno, tiraDado, parseEspressioneDado, FACCE_DADO_VITA, facceDadoVita, esprDadiVita, gruppiDadoVita, bonusCompetenzaDaLivello, tiraDanni, tiraD20, capacitaCarico } from './rules/dadi.js';
import { trucchettiMax, incantesimiMaxAuto, sottoclasseLivPer, chiaveClasse, privilegiClasseLivello, privilegiClasseFinoA, asiAlLivello, slotDaClasseLivello, livelloIncantatoreCombinato, slotMulticlasse, coloreClasse, dettagliIncantesimo, classificaIncantesimoCombattimento, incantesimiInizialiPerLivello, classePreparaIncantesimi, catalogoIncantesimiPreparabili, caratteristicaIncantatoreEffettiva, pesoStimato, pesoArmatura, sottoclasseTerzoIncantatore, incantesimiTerzoCasterLivello, listeIncantesimiTerzoCaster, controlliScheda, risorseDopoRiposo, COSTO_SLOT_IN_PUNTI, LIVELLI_CONVERTIBILI, puntiVersoSlot, slotVersoPunti, riepilogoCondizioni } from './rules/regole.js';

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

// `abbr` è la sigla ufficiale 5e: entra nei riquadri stretti senza troncarsi
// (il nome per esteso resta nel tooltip).
const DENARI = [
  { key: 'mr', label: 'Monete di Rame', abbr: 'MR' },
  { key: 'ma', label: "Monete d'Argento", abbr: 'MA' },
  { key: 'me', label: 'Monete di Elettro', abbr: 'ME' },
  { key: 'mo', label: "Monete d'Oro", abbr: 'MO' },
  { key: 'mp', label: 'Monete di Platino', abbr: 'MP' },
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
    sesso: '', // maschio | femmina | altro; modifica solo il nome mostrato della specie
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
    // inventario strutturato: { id, nome, qta, peso, equip, categoria, usi, usiMax, ricarica, effetto }
    inventario: [],
    sintonia: '',
    lingue: '',
    aspetto: '',
    trattiCaratteriali: '',
    diario: [], // diario di sessione: [{ id, data, titolo, testo }]
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
    // Preferenze UI del personaggio: persistono insieme alla scheda.
    sezioniAperte: {},
    // Id dei controlliScheda() che l'utente ha scelto di non vedere più
    // (homebrew, concessioni del DM: non sono errori, solo eccezioni).
    controlliIgnorati: [],
    // La mappa viene convertita in data URL: non dipende più dal file originale.
    mappaCampagna: '',
    mappaMarker: { x: 50, y: 50 },
  };
}

/** Forma italiana della specie coerente col sesso, senza cambiare il valore
 * canonico usato dalle regole (es. il dato resta "Elfo Alto"). */
function nomeSpeciePerSesso(specie, sesso, lingua = 'it') {
  if (lingua !== 'it' || sesso !== 'femmina') return traduciDato(specie);
  const femminili = {
    Elfo: 'Elfa',
    'Elfo Alto': 'Elfa Alta',
    'Elfo dei Boschi': 'Elfa dei Boschi',
    'Elfo Oscuro (Drow)': 'Elfa Oscura (Drow)',
    Gnomo: 'Gnoma',
    'Gnomo delle Foreste': 'Gnoma delle Foreste',
    'Gnomo delle Rocce': 'Gnoma delle Rocce',
    'Halfling Piedelesto': 'Halfling Piedelesta',
    'Halfling Tozzo': 'Halfling Tozza',
    Nano: 'Nana',
    'Nano delle Colline': 'Nana delle Colline',
    'Nano delle Montagne': 'Nana delle Montagne',
    Mezzorco: 'Mezzorca',
    Orco: 'Orca',
    Umano: 'Umana',
    Mezzelfo: 'Mezzelfa',
  };
  return femminili[specie] || traduciDato(specie);
}

function inizialeMaiuscola(v) {
  const testo = String(v || '').trim();
  return testo ? testo.charAt(0).toLocaleUpperCase('it') + testo.slice(1) : '';
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
  const forza = modificatore(punteggioCaratteristica(scheda, 'forza'));
  const destr = modificatore(punteggioCaratteristica(scheda, 'destrezza'));
  let mod;
  if (arma.ranged) mod = destr;
  else if (arma.finesse) mod = Math.max(forza, destr);
  else mod = forza;
  const comp = scheda.bonusCompetenza || 0;
  const danno = mod === 0 ? arma.danno : `${arma.danno}${mod > 0 ? '+' : ''}${mod}`;
  // La maestria delle armi esiste solo nelle regole 2024: la aggiungiamo alle note.
  const usa2024 = (scheda.versione || '2024') === '2024';
  const note = usa2024 && arma.maestria
    ? [arma.note, `Maestria: ${arma.maestria}`].filter(Boolean).join(' · ')
    : arma.note;
  return { nome: arma.nome, danno, tipoDanno: arma.tipo, note, bonus: mod + comp };
}

// Dotazione iniziale indicativa per classe (armi che diventano attacchi +
// equipaggiamento + monete d'oro). Le armi devono combaciare con ARMI_5E.
// Tipi di armatura iniziale (per impostare in automatico il riquadro CA).
const ARM_CUOIO = { tipo: 'leggera', base: 11, nome: 'Armatura di cuoio' };
const ARM_SCAGLIE = { tipo: 'media', base: 14, nome: 'Armatura a scaglie' };
const ARM_MAGLIA = { tipo: 'pesante', base: 16, nome: 'Cotta di maglia' };
const ARM_NESSUNA = { tipo: 'nessuna', base: 0, nome: '' };

// Catalogo armature 5e (nome → tipo + CA base): serve a riconoscere un'armatura
// nell'inventario ed equipaggiarla in automatico (come per le armi). Le chiavi
// più specifiche vanno prima, così "cuoio borchiato" vince su "cuoio".
const ARMATURE_5E = [
  // Pesante
  { match: ['piastre', 'plate'], tipo: 'pesante', base: 18 },
  { match: ['chiodata', 'splint'], tipo: 'pesante', base: 17 },
  { match: ['cotta di maglia', 'maglia', 'chain mail'], tipo: 'pesante', base: 16 },
  { match: ['anelli', 'ring mail'], tipo: 'pesante', base: 14 },
  // Media
  { match: ['mezza piastra', 'mezza corazza', 'half plate'], tipo: 'media', base: 15 },
  { match: ['corazza', 'breastplate'], tipo: 'media', base: 14 },
  { match: ['a scaglie', 'scaglie', 'scale mail'], tipo: 'media', base: 14 },
  { match: ['camaglia', 'chain shirt'], tipo: 'media', base: 13 },
  { match: ['pelle', 'hide'], tipo: 'media', base: 12 },
  // Leggera
  { match: ['cuoio borchiato', 'borchiat', 'studded'], tipo: 'leggera', base: 12 },
  { match: ['armatura di cuoio', 'cuoio', 'leather'], tipo: 'leggera', base: 11 },
  { match: ['imbottita', 'padded'], tipo: 'leggera', base: 11 },
];
/** Riconosce un'armatura dal nome di un oggetto: { tipo, base } o null. */
function trovaArmatura(nome) {
  const n = String(nome || '').toLowerCase();
  if (!n) return null;
  // Nomi che uniscono "corazza" e "piastre" (armature reflavorate, es. "a
  // piastre di legno e ferro"): il sostantivo è "corazza" (media, CA 14);
  // "piastre" qui è solo un aggettivo, non l'Armatura a Piastre pesante
  // (CA 18) — altrimenti vincerebbe sempre "piastre" per primo in elenco.
  if (n.includes('corazza') && n.includes('piastre')) return { tipo: 'media', base: 14 };
  for (const a of ARMATURE_5E) {
    if (a.match.some((k) => n.includes(k))) return { tipo: a.tipo, base: a.base };
  }
  return null;
}
/** Vero se l'oggetto è uno scudo (non un'armatura corporea). */
function eScudo(nome) {
  return /scudo|shield/i.test(String(nome || ''));
}
const KIT_CLASSE = {
  barbaro:  { armi: ['Ascia bipenne'], equip: ['Ascia (Handaxe) ×4', 'Dotazione da esploratore'], denari: 15, armatura: ARM_NESSUNA, scudo: false, strumenti: '' },
  bardo:    { armi: ['Stocco'], equip: ['Armatura di cuoio', 'Pugnale', 'Strumento musicale', 'Dotazione da intrattenitore'], denari: 19, armatura: ARM_CUOIO, scudo: false, strumenti: 'Strumenti musicali (3 a scelta)' },
  chierico: { armi: ['Mazza'], equip: ['Armatura a scaglie', 'Scudo', 'Balestra leggera + 20 dardi', 'Simbolo sacro', 'Dotazione da sacerdote'], denari: 7, armatura: ARM_SCAGLIE, scudo: true, strumenti: '' },
  druido:   { armi: ['Scimitarra'], equip: ['Armatura di cuoio', 'Scudo (legno)', 'Focus druidico', 'Borsa da erborista', 'Dotazione da esploratore'], denari: 9, armatura: ARM_CUOIO, scudo: true, strumenti: 'Borsa da erborista' },
  guerriero:{ armi: ['Spada lunga', 'Arco lungo'], equip: ['Cotta di maglia', 'Scudo', 'Frecce ×20', 'Dotazione da avventuriero'], denari: 4, armatura: ARM_MAGLIA, scudo: true, strumenti: '' },
  ladro:    { armi: ['Stocco', 'Arco corto'], equip: ['Armatura di cuoio', 'Pugnale ×2', 'Arnesi da scasso', 'Dotazione da scassinatore', 'Frecce ×20'], denari: 8, armatura: ARM_CUOIO, scudo: false, strumenti: 'Arnesi da scasso' },
  mago:     { armi: ['Pugnale'], equip: ['Focus arcano', 'Libro degli incantesimi', 'Dotazione da studioso'], denari: 5, armatura: ARM_NESSUNA, scudo: false, strumenti: '' },
  monaco:   { armi: ['Spada corta'], equip: ['Dardo ×10', 'Dotazione da esploratore'], denari: 11, armatura: ARM_NESSUNA, scudo: false, strumenti: 'Un tipo di attrezzi da artigiano o uno strumento musicale' },
  paladino: { armi: ['Spada lunga'], equip: ['Cotta di maglia', 'Scudo', 'Giavellotto ×6', 'Simbolo sacro', 'Dotazione da sacerdote'], denari: 9, armatura: ARM_MAGLIA, scudo: true, strumenti: '' },
  ranger:   { armi: ['Spada corta', 'Arco lungo'], equip: ['Armatura di cuoio', 'Frecce ×20', 'Dotazione da esploratore'], denari: 7, armatura: ARM_CUOIO, scudo: false, strumenti: '' },
  stregone: { armi: ['Pugnale'], equip: ['Focus arcano', 'Pugnale', 'Dotazione da avventuriero'], denari: 28, armatura: ARM_NESSUNA, scudo: false, strumenti: '' },
  warlock:  { armi: ['Pugnale'], equip: ['Armatura di cuoio', 'Focus arcano', 'Pugnale', 'Libro degli occulti', 'Dotazione da studioso'], denari: 15, armatura: ARM_CUOIO, scudo: false, strumenti: '' },
};
// Oro iniziale alternativo per classe (5.5): al posto del pacchetto di dotazione.
const ORO_INIZIALE = {
  barbaro: 75, bardo: 90, chierico: 110, druido: 50, guerriero: 155, ladro: 100,
  mago: 55, monaco: 50, paladino: 150, ranger: 150, stregone: 50, warlock: 100,
};

/** Risorse di classe generate automaticamente da classe e livello (valori 5e
 *  indicativi). Restituisce voci { id, nome, attuali, max, reset }. */
function risorseAutoClasse(classe, livello, caratteristiche, versione = '2024') {
  const L = Math.max(1, Number(livello) || 1);
  const v24 = String(versione) !== '2014';
  const modCar = (v) => Math.floor(((Number(v) || 10) - 10) / 2);
  const mk = (nome, max, reset) => ({ id: `auto-${nome.toLowerCase().replace(/\s+/g, '-')}`, nome, attuali: Math.max(0, max), max: Math.max(0, max), reset });
  switch (chiaveClasse(classe)) {
    case 'barbaro':
      // Stessa progressione nelle due edizioni; nella 5.5 un uso torna anche
      // con un riposo breve, nella 5.0 solo con quello lungo.
      return [mk('Ira', L >= 17 ? 6 : L >= 12 ? 5 : L >= 6 ? 4 : L >= 3 ? 3 : 2, v24 ? 'breve' : 'lungo')];
    case 'bardo':
      return [mk('Ispirazione Bardica', Math.max(1, modCar(caratteristiche?.carisma)), L >= 5 ? 'breve' : 'lungo')];
    case 'monaco':
      // 5.0: Punti Ki. 5.5: Punti Focus (stesso numero, nome diverso).
      return L >= 2 ? [mk(v24 ? 'Punti Focus' : 'Punti Ki', L, 'breve')] : [];
    case 'stregone':
      return L >= 2 ? [mk('Punti Stregoneria', L, 'lungo')] : [];
    case 'mago':
      // Recupero Arcano: un uso per riposo lungo, si spende durante un riposo breve.
      return [mk('Recupero Arcano', 1, 'lungo')];
    case 'guerriero':
      // Recuperare Energie: 1 uso nella 5.0, 2/3/4 nella 5.5.
      return [
        mk('Recuperare Energie', v24 ? (L >= 10 ? 4 : L >= 4 ? 3 : 2) : 1, 'breve'),
        ...(L >= 2 ? [mk('Azione Impetuosa', L >= 17 ? 2 : 1, 'breve')] : []),
      ];
    case 'druido':
      // Forma Selvatica: 2 usi nella 5.0, 2/3/4 nella 5.5.
      return L >= 2 ? [mk('Forma Selvatica', v24 ? (L >= 17 ? 4 : L >= 6 ? 3 : 2) : 2, 'breve')] : [];
    case 'chierico':
      // Incanalare Divinità: 1/2/3 nella 5.0 (liv. 2/6/18), 2/3 nella 5.5.
      return L >= 2
        ? [mk('Incanalare Divinità', v24 ? (L >= 6 ? 3 : 2) : (L >= 18 ? 3 : L >= 6 ? 2 : 1), 'breve')]
        : [];
    case 'paladino':
      // Incanalare Divinità: 1 uso nella 5.0 (2 dal 18°), 2/3 nella 5.5.
      return [
        mk('Imposizione delle Mani', L * 5, 'lungo'),
        ...(L >= 3 ? [mk('Incanalare Divinità', v24 ? (L >= 11 ? 3 : 2) : (L >= 18 ? 2 : 1), 'lungo')] : []),
      ];
    default:
      return [];
  }
}

/**
 * Completa e aggiorna le risorse automatiche senza toccare quelle aggiunte a
 * mano. Quando il massimo cresce conserva il numero di utilizzi già spesi.
 */
function sincronizzaRisorseClasse(scheda, versione = '2024') {
  if (!scheda) return [];
  const correnti = Array.isArray(scheda.risorse) ? scheda.risorse : [];
  const automatiche = risorseAutoClasse(scheda.classe, scheda.livello, scheda.caratteristiche, versione);
  if (!automatiche.length) return correnti;

  let cambiate = false;
  const risultato = [...correnti];
  for (const auto of automatiche) {
    const indice = risultato.findIndex((r) =>
      r?.id === auto.id || String(r?.nome || '').toLocaleLowerCase('it') === auto.nome.toLocaleLowerCase('it')
    );
    if (indice < 0) {
      risultato.push(auto);
      cambiate = true;
      continue;
    }
    const corrente = risultato[indice];
    const vecchioMax = Math.max(0, Number(corrente.max) || 0);
    const vecchiAttuali = Math.max(0, Math.min(vecchioMax, Number(corrente.attuali) || 0));
    const usati = Math.max(0, vecchioMax - vecchiAttuali);
    const attuali = Math.max(0, auto.max - usati);
    if (corrente.max !== auto.max || corrente.reset !== auto.reset || corrente.id !== auto.id || corrente.nome !== auto.nome || corrente.attuali !== attuali) {
      risultato[indice] = { ...corrente, ...auto, attuali };
      cambiate = true;
    }
  }
  return cambiate ? risultato : correnti;
}
// Spiegazioni delle risorse di classe (parole proprie, meccaniche 5e/5.5):
// mostrate al passaggio del cursore sul nome, come per le altre sezioni.
const SPIEG_RISORSE = {
  'Ira': 'Azione bonus: entri in Ira, ottenendo resistenza ai danni contundenti, perforanti e taglienti e un bonus ai danni degli attacchi basati sulla Forza. Termina se resti incapacitato o non la mantieni secondo le regole della tua edizione.',
  'Ispirazione Bardica': 'Azione bonus: doni a un alleato entro 18 m un dado Ispirazione (d6, poi d8/d10/d12 col livello) da sommare a un tiro per colpire, una prova o un TS. Usi pari al mod. Carisma; si recuperano con un riposo lungo (breve dal 5° livello).',
  'Punti Ki': 'La riserva di Ki del Monaco nelle regole 5.0 (punti = livello). Li spendi per Raffica di Colpi (2 attacchi senz’armi bonus), Scatto Vertiginoso e Difesa Paziente. Si recuperano tutti con un riposo breve o lungo.',
  'Punti Focus': 'La riserva di Ki del Monaco (punti = livello). Li spendi per le tue tecniche: Raffica di Colpi (1 attacco bonus extra), Scatto Vertiginoso, Difesa Paziente. Si recuperano tutti con un riposo breve o lungo.',
  'Recupero Arcano': 'Una volta al giorno, durante un riposo breve, recuperi slot incantesimo spesi per un totale di livelli pari alla metà del tuo livello da Mago (arrotondata per eccesso): 4 livelli al 7°, 5 al 9°, e nessuno slot di 6° livello o superiore. Si ricarica con un riposo lungo.',
  'Punti Stregoneria': 'La riserva di energia magica dello Stregone (punti = livello). Puoi convertirli in slot incantesimo (o viceversa) e alimentano la Metamagia. Si recuperano con un riposo lungo.',
  'Stregoneria Innata': 'Come azione bonus sprigioni la tua magia interiore per 1 minuto: la CD dei tuoi incantesimi da Stregone aumenta di 1 e hai Vantaggio ai loro tiri per colpire. Hai 2 utilizzi e li recuperi con un riposo lungo.',
  'Borsa del Guaritore': 'Contiene 10 utilizzi. Come azione puoi spenderne uno per stabilizzare una creatura a 0 PF senza effettuare una prova di Medicina.',
  'Recuperare Energie': 'Azione bonus: recuperi 1d10 + il tuo livello da Guerriero in PF. Si ricarica con un riposo breve o lungo.',
  'Azione Impetuosa': 'Una volta per riposo (due volte dal 17° livello) compi un’azione aggiuntiva nel tuo turno, oltre a quella normale. Si ricarica con un riposo breve o lungo.',
  'Forma Selvatica': 'Ti trasformi in una bestia che conosci, entro i limiti di grado sfida della tua edizione (azione nella 5.0, azione bonus nella 5.5). Usi limitati, recuperati con un riposo breve o lungo.',
  'Incanalare Divinità': 'Incanali il potere del tuo dominio (Chierico) o giuramento (Paladino) per un effetto speciale della sottoclasse. Usi limitati: si recuperano con un riposo breve (Chierico) o lungo (Paladino).',
  'Imposizione delle Mani': 'Una riserva di potere curativo pari a 5 × il tuo livello da Paladino: distribuisci quei PF toccando i feriti (azione nella 5.0, azione bonus nella 5.5) e puoi spendere 5 punti per il veleno. Si ricarica con un riposo lungo.',
};

/** Spiegazione di una risorsa di classe: prima la mappa dedicata, poi i privilegi. */
function spiegaRisorsa(nome) {
  const n = String(nome || '').trim();
  if (SPIEG_RISORSE[n]) return SPIEG_RISORSE[n];
  const sp = spiegaPrivilegio(n);
  if (sp) return typeof sp === 'string' ? sp : (sp.testo || sp.descrizione || '');
  return '';
}

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



// ---------------------------------------------------------------------------
// Persistenza su localStorage: roster di personaggi { attivo, personaggi }
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'scheda-interattiva:v1';
const STORAGE_KEY_LEGACY = 'tavolo-dei-dadi:scheda:v1';
const APP_VERSION = '3.9.5';

/**
 * Archivio schede del DM (Cloudflare Worker + KV, vedi worker/LEGGIMI.md).
 * Quando è impostato, l'app deposita da sola una copia delle schede (senza
 * immagini) così il DM può consultarle dalla vista "Archivio DM".
 * L'URL non è un segreto: la lettura richiede la chiave DM e il Worker accetta
 * chiamate solo dall'origine del sito. Lasciandolo vuoto la funzione è spenta.
 */
const URL_ARCHIVIO_PG = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ARCHIVIO_PG_URL) || ''
).trim();
const URL_STANZE = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STANZE_URL) || URL_ARCHIVIO_PG
).trim();
const ORDINE_AMBIENTAZIONI = ['default', 'taverna', 'mercato', 'citta', 'accampamento', 'foresta', 'palude', 'montagna', 'tundra', 'deserto', 'mare', 'tempesta', 'dungeon', 'tempio'];

function iconaAmbientazione(id) {
  if (!id || id === 'default') return '📍';
  const nome = PRESET_COLORI.find((p) => p.id === id)?.nome || '';
  return nome.split(' ')[0] || '🎨';
}

function nuovoId() {
  return 'pg-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function rosterVuoto() {
  const id = nuovoId();
  return { attivo: id, personaggi: { [id]: schedaVuota() } };
}

function unisciSchedeFG(lista) {
  if (!lista.length) return null;
  if (lista.length === 1) return lista[0];
  const base = { ...lista[0] };
  for (let i = 1; i < lista.length; i++) {
    const cur = lista[i];
    for (const k in cur) {
      if (k === 'abilita' && cur.abilita && base.abilita) {
        base.abilita = { ...base.abilita };
        for (const ak in cur.abilita) if (cur.abilita[ak] > 0) base.abilita[ak] = cur.abilita[ak];
      } else if (k === 'tiriSalvezza' && cur.tiriSalvezza && base.tiriSalvezza) {
        base.tiriSalvezza = { ...base.tiriSalvezza };
        for (const tk in cur.tiriSalvezza) if (cur.tiriSalvezza[tk]) base.tiriSalvezza[tk] = true;
      } else if (k === 'caratteristiche' && cur.caratteristiche && base.caratteristiche) {
        base.caratteristiche = { ...base.caratteristiche };
        for (const ck in cur.caratteristiche) if (cur.caratteristiche[ck] && cur.caratteristiche[ck] !== 10) base.caratteristiche[ck] = cur.caratteristiche[ck];
      } else if (k === 'attacchi' && Array.isArray(cur.attacchi) && cur.attacchi.length) {
        base.attacchi = [...(base.attacchi || []), ...cur.attacchi];
      } else if (k === 'incantesimiLista' && Array.isArray(cur.incantesimiLista) && cur.incantesimiLista.length) {
        base.incantesimiLista = [...(base.incantesimiLista || []), ...cur.incantesimiLista];
      } else if (k === 'multiclasse' && Array.isArray(cur.multiclasse) && cur.multiclasse.length) {
        // Unisce multiclasse senza duplicati
        const visti = new Set((base.multiclasse || []).map((m) => `${m.classe}:${m.livello}`));
        for (const m of cur.multiclasse) {
          const key = `${m.classe}:${m.livello}`;
          if (!visti.has(key)) { base.multiclasse = [...(base.multiclasse || []), m]; visti.add(key); }
        }
      } else if (cur[k] != null && cur[k] !== '' && cur[k] !== 0 && cur[k] !== false) {
        if (base[k] == null || base[k] === '' || base[k] === 0 || base[k] === false || (typeof base[k] === 'object' && !Array.isArray(base[k]) && Object.keys(base[k] || {}).length === 0)) {
          base[k] = cur[k];
        }
      }
    }
  }
  return base;
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
          // i dadi vita seguono sempre livello e classi correnti (anche multiclasse:
          // ricalcolare da un solo termine cancellerebbe il dado della seconda classe)
          s.dadiVita = calcolaFormulaDadiVita(s.classe, s.livello, s.multiclasse);
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
            s.inventario = s.equipaggiamento.split(/[;,\n]/).map((x) => x.trim()).filter(Boolean).map((raw, i) => {
              const { nome, qta } = separaQtaOggetto(raw);
              const base = completaUtilizziOggetto({ id: `inv-mig-${i}`, nome, qta, peso: 0, equip: false, categoria: '' });
              return { ...base, peso: pesoStimato(base.nome) };
            });
            s.equipaggiamento = '';
          }
          // Riporta la quantità dal nome alla colonna qta anche per l'inventario
          // già strutturato ("20 frecce" → Frecce ×20, "Pugnale ×2" → Pugnale ×2),
          // così i nomi combaciano con le armi note e le munizioni si scalano.
          if (Array.isArray(s.inventario)) {
            s.inventario = s.inventario.map((o) => {
              const parsed = separaQtaOggetto(String(o.nome || ''));
              return completaUtilizziOggetto((parsed.qta > 1 && parsed.nome && parsed.nome !== o.nome)
                ? { ...o, nome: parsed.nome, qta: parsed.qta }
                : o);
            });
          }
          // Tratti di specie salvati come stringa con virgole (formato vecchio):
          // se combaciano con la dotazione automatica della specie, li ri-spezzo in
          // voci separate (una chip per tratto) senza toccare gli inserimenti manuali.
          if (s.specie && typeof s.trattiSpecie === 'string' && !s.trattiSpecie.includes('\n')) {
            const sp = datiSpecieDi(s.specie);
            if (sp && s.trattiSpecie.trim() === String(sp.tratti || '').trim()) {
              s.trattiSpecie = trattiSpecieTesto(sp.tratti);
            }
          }
          // "Fissa" il massimo di trucchetti/incantesimi per le schede che ne
          // conoscono più di quanti la classe suggerirebbe (import da PDF): senza
          // questo, togliere un incantesimo non sblocca mai il selettore.
          if (Array.isArray(s.incantesimiLista)) {
            const nTruc = s.incantesimiLista.filter((x) => x.livello === 0 && !x.bonus).length;
            const nInc = s.incantesimiLista.filter((x) => x.livello > 0 && !x.bonus).length;
            const baseTruc = trucchettiMax(s.classe, s.livello, s.sottoclasse);
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
  // Nessun dato salvato: parti vuoto e apri il Menu (niente più Avventuriero fantoccio).
  return { attivo: '', personaggi: {} };
}

function saveState(roster) {
  return salvaJson(localStorage, STORAGE_KEY, rosterSenzaImmagini(roster));
}

/** Ridimensiona e comprime un'immagine finché resta entro la quota indicata. */
function immagineRidotta(img, maxLato, maxBytes, qualitaIniziale = 0.86) {
  let scala = Math.min(1, maxLato / Math.max(img.width, img.height));
  let qualita = qualitaIniziale;
  let dataUrl = '';
  for (let tentativo = 0; tentativo < 8; tentativo++) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scala));
    canvas.height = Math.max(1, Math.round(img.height * scala));
    const ctx2d = canvas.getContext('2d');
    ctx2d.imageSmoothingEnabled = true;
    ctx2d.imageSmoothingQuality = 'high';
    ctx2d.drawImage(img, 0, 0, canvas.width, canvas.height);
    dataUrl = canvas.toDataURL('image/jpeg', qualita);
    // Il base64 occupa circa 4/3 dei byte originali: la lunghezza della stringa
    // è una stima prudente della quota che consumerà nel localStorage.
    if (dataUrl.length <= maxBytes || (scala <= 0.35 && qualita <= 0.55)) break;
    if (qualita > 0.58) qualita -= 0.1;
    else scala *= 0.82;
  }
  return dataUrl;
}


/** Normalizza i dati importati dal PDF (o da JSON/esempio) nel modello della scheda. */
function normalizeImported(dati) {
  const base = schedaVuota();
  if (!dati || typeof dati !== 'object') return base;

  const num = (v, fallback) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
  const str = (v, fallback = '') => (typeof v === 'string' ? v : fallback);
  // Safety net import: il Worker deve già uscire in italiano, ma se arriva EN (Fighter/Soldier/Wood Elf) traduciamo in canonico IT.
  const EN_IT = { 'Soldier':'Soldato','Acolyte':'Accolito','Criminal':'Criminale','Entertainer':'Intrattenitore','Hermit':'Eremita','Sage':'Saggio','Sailor':'Marinaio','Noble':'Nobile','Charlatan':'Ciarlatano','Artisan':'Artigiano','Guard':'Guardia','Guide':'Guida','Farmer':'Contadino','Merchant':'Mercante','Scribe':'Scriba','Wayfarer':'Viandante','Fighter':'Guerriero','Rogue':'Ladro','Wizard':'Mago','Cleric':'Chierico','Bard':'Bardo','Druid':'Druido','Monk':'Monaco','Paladin':'Paladino','Ranger':'Ranger','Sorcerer':'Stregone','Warlock':'Warlock','Barbarian':'Barbaro','Half-Elf':'Mezzelfo','Half Elf':'Mezzelfo','Wood Elf':'Elfo dei Boschi','High Elf':'Elfo Alto','Dark Elf':'Elfo Oscuro (Drow)','Drow':'Elfo Oscuro (Drow)','Hill Dwarf':'Nano delle Colline','Mountain Dwarf':'Nano delle Montagne','Lightfoot Halfling':'Halfling Piedelesto','Stout Halfling':'Halfling Tozzo','Forest Gnome':'Gnomo delle Foreste','Rock Gnome':'Gnomo delle Rocce','Darkvision':'Scurovisione','Blindsight':'Percezione cieca','Tremorsense':'Percezione tremorsensitiva','Truesight':'Vista vera','Common':'Comune','Elvish':'Elfico','Dwarvish':'Nanico','Gnomish':'Gnomesco','Orc':'Orco','Infernal':'Infernale','Celestial':'Celestiale','Abyssal':'Abissale','Undercommon':'Sottocomune','Sylvan':'Silvano','Draconic':'Draconico','Giant':'Gigante','Goblin':'Goblin' };
  const traduciEN = (v) => {
    if (typeof v !== 'string' || !v) return v;
    let out = v.trim();
    if (EN_IT[out]) return EN_IT[out];
    for (const [en,it] of Object.entries(EN_IT)) out = out.replace(new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`, 'gi'), it);
    out = out.replace(/Scurovisione\s*60(\s*ft)?/gi, 'Scurovisione 18 m').replace(/Darkvision\s*60(\s*ft)?/gi, 'Scurovisione 18 m');
    return out;
  };

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
    abilita[key] = v === 3 ? 3 : v === 2 ? 2 : v === 1 || v === true ? 1 : 0;
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
  const schedaPin = { classe: str(dati.classe), sottoclasse: str(dati.sottoclasse), livello: livelloPin, incantatore: { caratteristica: carIncantatore }, caratteristiche: car };
  const nTruccPin = incantesimiLista.filter((s) => s.livello === 0 && !s.bonus).length;
  const nIncPin = incantesimiLista.filter((s) => s.livello > 0 && !s.bonus).length;
  const baseTruccPin = trucchettiMax(str(dati.classe), livelloPin, str(dati.sottoclasse));
  const baseIncPin = incantesimiMaxAuto(schedaPin, versionePin);
  const maxTruccIniziale = num(dati.maxTrucchetti, 0) || (baseTruccPin != null && nTruccPin > baseTruccPin ? nTruccPin : 0);
  const maxIncIniziale = num(dati.maxIncantesimi, 0) || (baseIncPin != null && nIncPin > baseIncPin ? nIncPin : 0);
  const multiclassePin = Array.isArray(dati.multiclasse)
    ? dati.multiclasse.map((m) => ({ classe: traduciEN(str(m && m.classe)), livello: Math.max(1, num(m && m.livello, 1)) })).filter((m) => m.classe)
    : [];
  // Auto-correzione livello se il JSON ha messo il totale in "livello" (es. Elevorn: livello 10 con Ranger6/Ladro3 → totale 19 ma bonus 4 da 10)
  let livelloCorretto = num(dati.livello, base.livello);
  {
    const sommaMulti = multiclassePin.reduce((s, m) => s + (Number(m.livello) || 0), 0);
    const totaleDati = livelloCorretto + sommaMulti;
    const bonusDati = num(dati.bonusCompetenza, null);
    if (Number.isFinite(bonusDati) && sommaMulti > 0 && totaleDati > 12) {
      const bonusMain = typeof bonusCompetenzaDaLivello === 'function' ? bonusCompetenzaDaLivello(livelloCorretto) : null;
      const bonusTot = typeof bonusCompetenzaDaLivello === 'function' ? bonusCompetenzaDaLivello(totaleDati) : null;
      if (bonusDati === bonusMain && bonusDati !== bonusTot) {
        const nuovo = livelloCorretto - sommaMulti;
        if (nuovo >= 1 && nuovo <= 20) livelloCorretto = nuovo;
      }
    }
  }
  return {
    ...base,
    pfTemp: num(dati.pfTemp, 0),
    ispirazione: Boolean(dati.ispirazione),
    tsMorte: {
      successi: clampTs(dati.tsMorte?.successi),
      fallimenti: clampTs(dati.tsMorte?.fallimenti),
    },
    nome: str(dati.nome, base.nome) || base.nome,
    sesso: ['maschio', 'femmina', 'altro'].includes(dati.sesso) ? dati.sesso : '',
    ritratto:
      typeof dati.ritratto === 'string' &&
      (dati.ritratto.startsWith('data:image/') || dati.ritratto.startsWith('https://api.dicebear.com')) &&
      dati.ritratto.length < 800000
        ? dati.ritratto
        : '',
    background: traduciEN(str(dati.background)),
    classe: traduciEN(str(dati.classe)),
    sottoclasse: traduciEN(str(dati.sottoclasse)),
    multiclasse: multiclassePin,
    specie: traduciEN(str(dati.specie)),
    allineamento: traduciEN(str(dati.allineamento)),
    versione: dati.versione === '2014' ? '2014' : '2024',
    maxTrucchetti: maxTruccIniziale,
    maxIncantesimi: maxIncIniziale,
    livello: livelloCorretto,
    pe: num(dati.pe, 0),
    ca: num(dati.ca, base.ca),
    armatura,
    condizioni,
    pfMax,
    pfAttuali: num(dati.pfAttuali, pfMax),
    dadiVita: calcolaFormulaDadiVita(traduciEN(str(dati.classe)), livelloCorretto, multiclassePin)
      || esprDadiVita(livelloCorretto, facceDadoVita(typeof dati.dadiVita === 'string' ? dati.dadiVita : base.dadiVita)),
    dadiVitaSpesi: (dati.dadiVitaSpesi && typeof dati.dadiVitaSpesi === 'object' && !Array.isArray(dati.dadiVitaSpesi))
      ? Object.fromEntries(Object.entries(dati.dadiVitaSpesi).map(([k, v]) => [k, Math.max(0, num(v, 0))]))
      : Math.max(0, num(dati.dadiVitaSpesi, 0)),
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
          // Se il nome contiene ancora "×N" (dati vecchi), lo riporto nella quantità
          // così il nome combacia con le armi note (es. "Pugnale ×2" → "Pugnale" ×2).
          const parsed = separaQtaOggetto(str(o.nome));
          const nomeVal = parsed.nome;
          const qtaVal = parsed.qta > 1 ? parsed.qta : Math.max(1, num(o.qta, 1));
          let pesoVal = Math.max(0, Number(o.peso) || 0);
          const base = completaUtilizziOggetto({
            id: o.id || `inv-${i}-${Math.random().toString(36).slice(2, 6)}`,
            nome: nomeVal, qta: qtaVal, peso: pesoVal,
            equip: !!o.equip, categoria: str(o.categoria),
            usi: Number.isFinite(Number(o.usi)) ? Math.max(0, Number(o.usi)) : undefined,
            usiMax: Number.isFinite(Number(o.usiMax)) ? Math.max(0, Number(o.usiMax)) : undefined,
            ricarica: ['alba', 'breve', 'lungo', 'manuale'].includes(o.ricarica) ? o.ricarica : '',
            effetto: str(o.effetto),
            effettoMeccanico: EFFETTI_OGGETTO.some(([id]) => id === o.effettoMeccanico) ? o.effettoMeccanico : '',
            richiedeSintonia: typeof o.richiedeSintonia === 'boolean' ? o.richiedeSintonia : undefined,
          });
          // Peso ricalcolato sul nome CORRETTO (post-riconoscimento): un oggetto
          // importato col nome abbreviato ("Mantello Prot.") va rinominato al
          // nome canonico prima di cercarne il peso, altrimenti resta a 0.
          return pesoVal > 0 ? base : { ...base, peso: pesoStimato(base.nome) };
        });
      }
      // Migrazione: il vecchio equipaggiamento testuale (voci separate da ; , o
      // a capo) diventa una lista di oggetti, con peso stimato dal nome.
      const testo = str(dati.equipaggiamento);
      if (!testo) return [];
      return testo.split(/[;,\n]/).map((s) => s.trim()).filter(Boolean).map((raw, i) => {
        const { nome, qta } = separaQtaOggetto(raw);
        const base = completaUtilizziOggetto({ id: `inv-mig-${i}`, nome, qta, peso: 0, equip: false, categoria: '' });
        return { ...base, peso: pesoStimato(base.nome) };
      });
    })(),
    sintonia: Array.isArray(dati.sintonia) ? dati.sintonia.slice(0, 3).map(str) : str(dati.sintonia),
    lingue: str(dati.lingue),
    aspetto: str(dati.aspetto),
    trattiCaratteriali: str(dati.trattiCaratteriali),
    diario: Array.isArray(dati.diario) ? dati.diario : [],
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
    sezioniAperte: dati.sezioniAperte && typeof dati.sezioniAperte === 'object' && !Array.isArray(dati.sezioniAperte)
      ? Object.fromEntries(Object.entries(dati.sezioniAperte).map(([id, aperta]) => [id, Boolean(aperta)]))
      : {},
    controlliIgnorati: Array.isArray(dati.controlliIgnorati) ? dati.controlliIgnorati.filter((x) => typeof x === 'string') : [],
    mappaCampagna: typeof dati.mappaCampagna === 'string' && dati.mappaCampagna.startsWith('data:image/')
      ? dati.mappaCampagna
      : '',
    mappaMarker: {
      x: Math.max(0, Math.min(100, num(dati.mappaMarker?.x, 50))),
      y: Math.max(0, Math.min(100, num(dati.mappaMarker?.y, 50))),
    },
  };
}

/**
 * Archivio DM: elenco delle schede depositate dagli utenti sul Worker.
 * Serve la chiave DM (verificata dal Worker, non salvata nel sito): senza
 * quella l'elenco non è leggibile. La chiave resta solo su questo dispositivo.
 */
function ArchivioDm({ url, onChiudi, onApri }) {
  const [chiave, setChiave] = useState(() => {
    try { return localStorage.getItem('scheda-interattiva:dm-key') || ''; } catch { return ''; }
  });
  const [elenco, setElenco] = useState(null);
  const [stato, setStato] = useState('');   // '' | 'carico' | messaggio d'errore
  const [filtro, setFiltro] = useState('');
  const [dettagliAperti, setDettagliAperti] = useState({}); // id → scheda completa caricata, o 'carico'
  const [copieAperte, setCopieAperte] = useState({});       // chiave gruppo → mostra le copie più vecchie
  const base = String(url || '').replace(/\/+$/, '');

  const carica = async (k) => {
    if (!base) { setStato('Archivio non configurato in questa build.'); return; }
    setStato('carico');
    try {
      const r = await fetch(`${base}/pg?key=${encodeURIComponent(k)}`);
      const d = await r.json();
      if (!r.ok) { setStato(d.error || `Errore ${r.status}`); return; }
      setElenco(d.schede || []);
      setStato('');
      try { localStorage.setItem('scheda-interattiva:dm-key', k); } catch { /* niente */ }
    } catch (e) {
      setStato(`Connessione fallita: ${e.message}`);
    }
  };

  const apri = async (id) => {
    setStato('carico');
    try {
      const r = await fetch(`${base}/pg/${encodeURIComponent(id)}?key=${encodeURIComponent(chiave)}`);
      const d = await r.json();
      if (!r.ok) { setStato(d.error || `Errore ${r.status}`); return; }
      setStato('');
      onApri(d);
    } catch (e) {
      setStato(`Connessione fallita: ${e.message}`);
    }
  };

  // Espande/comprime i dettagli di una scheda SENZA importarla tra i propri
  // personaggi: utile per controllare tutto (CA, PF, equip) a colpo d'occhio.
  const toggleDettagli = async (id) => {
    if (dettagliAperti[id]) {
      setDettagliAperti((d) => { const n = { ...d }; delete n[id]; return n; });
      return;
    }
    setDettagliAperti((d) => ({ ...d, [id]: 'carico' }));
    try {
      const r = await fetch(`${base}/pg/${encodeURIComponent(id)}?key=${encodeURIComponent(chiave)}`);
      const d = await r.json();
      if (!r.ok) { setDettagliAperti((d2) => ({ ...d2, [id]: { errore: d.error || `Errore ${r.status}` } })); return; }
      setDettagliAperti((d2) => ({ ...d2, [id]: d }));
    } catch (e) {
      setDettagliAperti((d2) => ({ ...d2, [id]: { errore: `Connessione fallita: ${e.message}` } }));
    }
  };

  const quando = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  };

  const f = filtro.trim().toLowerCase();
  const elencoFiltrato = elenco
    ? elenco.filter((s) => !f || [s.nome, s.classe, s.sottoclasse, s.specie, s.background].some((v) => String(v || '').toLowerCase().includes(f)))
    : null;

  // Lo stesso personaggio compare più volte in archivio quando viene depositato
  // da dispositivi diversi (cache svuotata, altro browser) o dopo un
  // re-import, che gli assegna un id interno nuovo. Per il DM sono la STESSA
  // scheda: qui le raggruppiamo per nome+classe+specie e mostriamo solo la
  // copia più recente, tenendo le altre disponibili sotto "copie precedenti".
  // Nessuna cancellazione: l'archivio sul Worker resta intatto.
  const chiaveIdentita = (s) =>
    [s.nome, s.classe, s.specie].map((v) => String(v || '').trim().toLowerCase()).join('|');
  const gruppi = [];
  if (elencoFiltrato) {
    const perChiave = new Map();
    for (const s of elencoFiltrato) {
      const k = chiaveIdentita(s);
      if (!perChiave.has(k)) { const g = { chiave: k, copie: [] }; perChiave.set(k, g); gruppi.push(g); }
      perChiave.get(k).copie.push(s);
    }
    for (const g of gruppi) {
      g.copie.sort((a, b) => String(b.aggiornato || '').localeCompare(String(a.aggiornato || '')));
    }
  }
  const nDuplicati = gruppi.reduce((n, g) => n + g.copie.length - 1, 0);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1002, padding: 16, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onChiudi(); }}
    >
      <div style={{ ...styles.panel, maxWidth: 620, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <strong style={{ color: C.goldDark, fontSize: 17 }}>🗂 Archivio DM</strong>
          <button style={styles.buttonMini} onClick={onChiudi}>✕</button>
        </div>
        <p style={{ ...styles.detail, marginTop: 0 }}>
          Le schede che gli utenti hanno creato (senza immagini). Visibili solo con la chiave DM.
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <input
            type="password"
            placeholder="Chiave DM"
            value={chiave}
            onChange={(e) => setChiave(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') carica(chiave); }}
            style={{ ...styles.inlineInput, flex: 1, minWidth: 160, padding: '8px 10px', boxSizing: 'border-box' }}
          />
          <button style={styles.buttonPrimary} onClick={() => carica(chiave)} disabled={stato === 'carico'}>
            {stato === 'carico' ? '…' : 'Apri elenco'}
          </button>
        </div>
        {stato && stato !== 'carico' && (
          <div style={{ padding: 10, borderRadius: 8, background: 'rgba(200,60,60,0.12)', border: `1px solid ${C.red}`, marginBottom: 12, fontSize: 13 }}>{stato}</div>
        )}
        {elenco && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={styles.detail}>
                {gruppi.length} {gruppi.length === 1 ? 'personaggio' : 'personaggi'} in archivio
                {nDuplicati > 0 && <> · {nDuplicati} {nDuplicati === 1 ? 'copia precedente' : 'copie precedenti'} nascoste</>}
              </span>
              <input
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Filtra per nome, classe, specie..."
                style={{ ...styles.inlineInput, flex: '1 1 180px', minWidth: 140, padding: '5px 8px', fontSize: 12 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {gruppi.map((g) => {
                const riga = (s, vecchia) => {
                  const dett = dettagliAperti[s.id];
                  const completa = dett && dett !== 'carico' && !dett.errore ? dett : null;
                  const ca = completa ? caTotale(completa) : null;
                  return (
                    <div key={s.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', ...(vecchia ? { marginLeft: 16, opacity: 0.75, borderStyle: 'dashed' } : {}) }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{s.nome || '(senza nome)'}</div>
                          <div style={{ ...styles.detail, fontSize: 11 }}>
                            {[s.classe, s.sottoclasse, s.specie, s.livello ? `Liv. ${s.livello}` : ''].filter(Boolean).join(' · ')}
                            {s.pfMax ? ` · PF ${s.pfAttuali ?? '?'}/${s.pfMax}` : ''}
                          </div>
                          <div style={{ ...styles.detail, fontSize: 10, opacity: 0.75 }}>
                            {quando(s.aggiornato)} · {s.dispositivo || '?'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button style={styles.buttonMini} onClick={() => toggleDettagli(s.id)}>
                            {dett && dett !== 'carico' ? '▲ Dettagli' : '▼ Dettagli'}
                          </button>
                          <button style={styles.buttonMini} onClick={() => apri(s.id)}>Apri</button>
                        </div>
                      </div>
                      {dett === 'carico' && <div style={{ ...styles.detail, fontSize: 12, marginTop: 6 }}>Caricamento…</div>}
                      {dett && dett.errore && <div style={{ ...styles.detail, fontSize: 12, marginTop: 6, color: C.red }}>{dett.errore}</div>}
                      {completa && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${C.border}`, fontSize: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6 }}>
                          <div><strong>CA</strong> {ca ?? '—'}</div>
                          <div><strong>Background</strong> {completa.background || '—'}</div>
                          <div><strong>Allineamento</strong> {completa.allineamento || '—'}</div>
                          <div><strong>Armi</strong> {(completa.attacchi || []).length}</div>
                          <div><strong>Incantesimi</strong> {(completa.incantesimiLista || []).length}</div>
                          <div><strong>Inventario</strong> {(completa.inventario || []).length} ogg.</div>
                          <div><strong>Talenti</strong> {(completa.talenti || '').split('\n').filter(Boolean).length}</div>
                          <div><strong>Sintonia</strong> {(Array.isArray(completa.sintonia) ? completa.sintonia.length : 0)}/3</div>
                        </div>
                      )}
                    </div>
                  );
                };
                const [recente, ...vecchie] = g.copie;
                const aperte = !!copieAperte[g.chiave];
                return (
                  <div key={g.chiave} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {riga(recente, false)}
                    {vecchie.length > 0 && (
                      <button
                        style={{ ...styles.buttonMini, alignSelf: 'flex-start', marginLeft: 16, fontSize: 11 }}
                        onClick={() => setCopieAperte((c) => ({ ...c, [g.chiave]: !c[g.chiave] }))}
                        title="Stesso personaggio depositato da un altro dispositivo o prima di un re-import"
                      >
                        {aperte ? '▲ nascondi' : '▼ mostra'} {vecchie.length} {vecchie.length === 1 ? 'copia precedente' : 'copie precedenti'}
                      </button>
                    )}
                    {aperte && vecchie.map((s) => riga(s, true))}
                  </div>
                );
              })}
              {gruppi.length === 0 && <div style={styles.detail}>{elenco.length === 0 ? 'Ancora nessuna scheda depositata.' : 'Nessuna scheda corrisponde al filtro.'}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componenti di editing inline (1 click = modifica, doppio click = tiro)
// ---------------------------------------------------------------------------
export default function App() {
  // Dichiarato prima del rilevatore PWA: un aggiornamento aspetta che il
  // salvataggio cloud corrente sia terminato prima di ricaricare la pagina.
  const [sincronizzando, setSincronizzando] = useState(false);
  // aggiornamenti PWA: mostra un banner quando è pronta una nuova versione
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, r) {
      if (r) setInterval(() => r.update(), 20 * 1000);
    },
  });

  // Aggiorna tramite il normale ciclo di vita PWA. Non cancelliamo più tutte le
  // cache e non deregistriamo il worker: quella procedura poteva interrompere
  // audio, immagini IndexedDB o un salvataggio ancora in corso.
  const [aggiornando, setAggiornando] = useState(false);
  async function forzaAggiornamento() {
    if (aggiornando) return;
    setAggiornando(true);
    let navigazioneAvviata = false;
    const ricaricaUnaVolta = () => {
      if (navigazioneAvviata) return;
      navigazioneAvviata = true;
      window.location.reload();
    };
    // Safari può lasciare pendente updateServiceWorker senza risolvere né
    // rifiutare la Promise. Il watchdog impedisce "Aggiornamento…" infinito.
    const watchdog = setTimeout(ricaricaUnaVolta, 4500);
    try {
      await updateServiceWorker(true);
      ricaricaUnaVolta();
    } catch { ricaricaUnaVolta(); }
    finally { clearTimeout(watchdog); }
  }

  // Rilevatore di nuove versioni INDIPENDENTE dal service worker: interroga
  // `version.json` (che non è nella cache, quindi va sempre in rete) e confronta
  // il `build` pubblicato con quello di questa build (__BUILD_ID__ iniettato da
  // Vite). Se differiscono, il pulsante 🔄 lampeggia di verde per invitare al click.
  const [aggiornamentoPronto, setAggiornamentoPronto] = useState('');
  useEffect(() => {
    let annullato = false;
    const controlla = async () => {
      try {
        const r = await fetch(`version.json?ts=${Date.now()}`, { cache: 'no-store' });
        if (!r.ok) return;
        const dati = await r.json();
        if (!annullato && dati && dati.build && String(dati.build) !== String(__BUILD_ID__)) {
          setAggiornamentoPronto(String(dati.build));
        }
      } catch { /* offline o file assente: nessun avviso */ }
    };
    const quandoVisibile = () => { if (document.visibilityState === 'visible') controlla(); };
    const t = setTimeout(controlla, 1500);
    const id = setInterval(controlla, 20 * 1000);
    window.addEventListener('focus', controlla);
    window.addEventListener('online', controlla);
    document.addEventListener('visibilitychange', quandoVisibile);
    return () => {
      annullato = true; clearTimeout(t); clearInterval(id);
      window.removeEventListener('focus', controlla);
      window.removeEventListener('online', controlla);
      document.removeEventListener('visibilitychange', quandoVisibile);
    };
  }, []);
  // il pulsante lampeggia se c'è una nuova versione (rilevata in un modo o nell'altro)
  const nuovaVersione = !!aggiornamentoPronto || needRefresh;

  // Aggiorna automaticamente una sola volta per ogni build pubblicata. La
  // chiave in sessionStorage sopravvive al reload e impedisce il vecchio ciclo
  // infinito se Safari dovesse continuare a servire la build precedente.
  useEffect(() => {
    if (!aggiornamentoPronto || aggiornando || sincronizzando) return;
    const chiave = `tavolo-dei-dadi:update:${aggiornamentoPronto}`;
    if (sessionStorage.getItem(chiave)) return;
    sessionStorage.setItem(chiave, 'tentato');
    const timer = setTimeout(forzaAggiornamento, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aggiornamentoPronto, aggiornando, sincronizzando]);

  const [roster, setRoster] = useState(loadState);
  const [erroreSalvataggio, setErroreSalvataggio] = useState('');
  useEffect(() => {
    let attivo = true;
    caricaImmaginiRoster(roster).then((conImmagini) => {
      if (!attivo) return;
      const aggiunte = Object.keys(conImmagini.personaggi || {}).some((id) => {
        const prima = roster.personaggi?.[id] || {};
        const dopo = conImmagini.personaggi?.[id] || {};
        return (!prima.ritratto && dopo.ritratto) || (!prima.mappaCampagna && dopo.mappaCampagna);
      });
      if (aggiunte) setRoster(conImmagini);
    }).catch(() => { /* fallback localStorage per browser senza IndexedDB */ });
    return () => { attivo = false; };
    // Il recupero dal database immagini va eseguito una sola volta all'avvio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Annulla (undo): pila in memoria degli stati precedenti del roster.
  const storicoUndo = useRef([]);
  const rosterPrec = useRef(null);
  const ultimoPassoUndo = useRef(0);
  const saltaUndo = useRef(false);   // true mentre stiamo ripristinando: non registrare
  const [passiUndo, setPassiUndo] = useState(0);
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
  // --- Archivio schede del DM ---
  // Identificativo casuale e anonimo del dispositivo: serve solo a tenere
  // separate le schede di persone diverse nell'elenco del DM.
  const idDispositivo = useMemo(() => {
    try {
      let v = localStorage.getItem('scheda-interattiva:id-dispositivo');
      if (!v) {
        v = `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem('scheda-interattiva:id-dispositivo', v);
      }
      return v;
    } catch { return 'anonimo'; }
  }, []);
  const [mostraArchivioDm, setMostraArchivioDm] = useState(false);
  const [filtroIncantesimo, setFiltroIncantesimo] = useState('');
  const [filtroLivelloInc, setFiltroLivelloInc] = useState('');
  const [filtroScuolaInc, setFiltroScuolaInc] = useState('');
  const [filtroClasseInc, setFiltroClasseInc] = useState('');
  const [soloRitualiInc, setSoloRitualiInc] = useState(false);
  const [listaMagicaMinimizzata, setListaMagicaMinimizzata] = useState(false);
  const [filtroInventario, setFiltroInventario] = useState('');
  const [effettoInventarioAperto, setEffettoInventarioAperto] = useState(null);
  const [fontePopover, setFontePopover] = useState(null); // { tipo: 'ts'|'car', key, top, left } menu "da cosa deriva il bonus" aperto
  useEffect(() => {
    if (!fontePopover) return;
    const chiudi = () => setFontePopover(null);
    window.addEventListener('click', chiudi);
    return () => window.removeEventListener('click', chiudi);
  }, [fontePopover]);
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
  // Mappa della campagna: immagine caricata dal DM, apribile/chiudibile come il
  // Combat tracker. La mappa e il segnalino sono salvati NELLA scheda del PG
  // (vedi più sotto, dopo la definizione di scheda/aggiorna).
  const [mappaAperta, setMappaAperta] = useState(false);
  // Zoom mappa: 0 = adattata all'intero schermo; >0 = larghezza in multipli della
  // finestra (1 = piena larghezza, fino a 6× per lo zoom massimo), scorrevole.
  const [mappaScala, setMappaScala] = useState(0);
  const mappaRef = useRef(null);
  const mappaWrapRef = useRef(null);
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
  const [notteAttiva, setNotteAttiva] = useState(false); // tema scuro/notte: sfondi e audio più cupi

  // ordine (personalizzabile via drag) delle sezioni collassabili
  const [ordineSezioni, setOrdineSezioni] = useState(() => {
    let salvato = [];
    try {
      const s = JSON.parse(localStorage.getItem('scheda-interattiva:ordine-sezioni-v3'));
      if (Array.isArray(s)) salvato = s;
    } catch {
      /* niente */
    }

    // mantieni l'ordine salvato, scarta id sconosciuti e INSERISCI le sezioni
    // nuove alla loro posizione di default (non in fondo): così, aggiungendo
    // Talenti/Tratti come sezioni separate, non finiscono in coda per chi aveva
    // già un ordine salvato.
    const ordinato = salvato.filter((id) => ORDINE_SEZIONI_DEFAULT.includes(id));
    for (const id of ORDINE_SEZIONI_DEFAULT) {
      if (!ordinato.includes(id)) {
        const pos = Math.min(ORDINE_SEZIONI_DEFAULT.indexOf(id), ordinato.length);
        ordinato.splice(pos, 0, id);
      }
    }
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
  const [promemoriaBackup, setPromemoriaBackup] = useState(false); // banner "fai un backup"
  const [mostraGuida, setMostraGuida] = useState(false); // guida rapida al primo avvio
  const [mostraControlliScheda, setMostraControlliScheda] = useState(false);
  // Pannello Avvisi: raccoglie i promemoria (backup, controlli scheda) e le
  // novità di versione, al posto dei riquadri a tutta larghezza che rubavano
  // spazio in cima e, sopra la foto del luogo, si leggevano male.
  const [mostraAvvisi, setMostraAvvisi] = useState(false);
  const [posAvvisi, setPosAvvisi] = useState({ top: 60, left: 16 });
  const avvisiBtnRef = useRef(null);
  const [novitaViste, setNovitaViste] = useState(() => {
    try { return localStorage.getItem('scheda-interattiva:novita-viste') || ''; } catch { return ''; }
  });
  const [condivisione, setCondivisione] = useState(null); // { link, copiato, ritrattoRimosso, lungo }
  const [stanzaUi, setStanzaUi] = useState({ aperta: false, codice: '', creato: '', scadenza: 0, caricamento: false, errore: '' });
  const [pgDaLink, setPgDaLink] = useState(null);      // personaggio ricevuto tramite link
  const [mostraRipristino, setMostraRipristino] = useState(false); // modale "ripristina versione precedente"
  const [rinominando, setRinominando] = useState(false); // rinomina inline del PG attivo
  const [mostraCrea, setMostraCrea] = useState(false); // schermata di creazione guidata
  const [bozzaCrea, setBozzaCrea] = useState({ nome: '', sesso: '', classe: '', sottoclasse: '', specie: '', background: '', livello: 1, metodo: 'auto', pool: null, assegna: {}, competenzeClasse: [], competenzeSpecie: [], maestria: [], talentoOrigine: '', asiTalenti: {}, multiclasseClasse2: '', multiclasseLivello2: 1, sottoclasseMc2: '', multiclasseClasse3: '', multiclasseLivello3: 1, sottoclasseMc3: '', dotazione: 'pacchetto' });
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
  const [volumeEffetti, setVolumeEffetti] = useState(() => Number(localStorage.getItem('scheda-interattiva:volume-effetti') || 0.65));
  const [urlCustomAudio, setUrlCustomAudio] = useState(() => localStorage.getItem('scheda-interattiva:url-audio-custom') || '');
  const [mostraPannelloAudio, setMostraPannelloAudio] = useState(false);
  const ambientazioneBtnRef = useRef(null);
  const [posPannelloAudio, setPosPannelloAudio] = useState({ top: 56, left: 10 });
  const [effettiSonoriAttivi, setEffettiSonoriAttivi] = useState(() => localStorage.getItem('scheda-interattiva:effetti-sonori') !== 'false');
  // Muto rapido: azzera tutto l'audio (sottofondo + effetti) con un click, senza
  // toccare il volume impostato — così basta ri-cliccare per tornare com'era.
  const [mutoAudio, setMutoAudio] = useState(() => localStorage.getItem('scheda-interattiva:muto-audio') === 'true');
  // Effetti sonori attivi solo se non sono in muto.
  const suoniEffOn = effettiSonoriAttivi && !mutoAudio;
  // Safari iOS consente l'avvio dei file audio solo nello stesso gesto che li
  // attiva. Quando partono già dal click, evita che l'effect li fermi e ricrei
  // subito dopo fuori dal gesto (operazione che Safari bloccherebbe).
  const audioAvviatoDaGestoRef = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem('scheda-interattiva:ambiente-audio', ambienteAudio);
      localStorage.setItem('scheda-interattiva:volume-audio', volumeAudio);
      localStorage.setItem('scheda-interattiva:volume-effetti', volumeEffetti);
      localStorage.setItem('scheda-interattiva:url-audio-custom', urlCustomAudio);
      localStorage.setItem('scheda-interattiva:effetti-sonori', effettiSonoriAttivi ? 'true' : 'false');
      localStorage.setItem('scheda-interattiva:muto-audio', mutoAudio ? 'true' : 'false');
    } catch { /* niente */ }
  }, [ambienteAudio, volumeAudio, volumeEffetti, urlCustomAudio, effettiSonoriAttivi, mutoAudio]);

  // Audio notturno per ambientazione: di notte ogni ambiente mantiene il proprio
  // sottofondo (bosco resta bosco, città resta città) ma più cupo (volume ridotto)
  // e, se all'aperto, con un velo di grilli/insetti sopra → "suona di notte".
  useEffect(() => {
    // Muto significa arresto reale: ferma player HTML, nodi Web Audio, timer e
    // overlay. Riattivandolo, l'ambiente corrente riparte da zero.
    if (mutoAudio) {
      fermaAmbiente();
      return;
    }
    if (audioAvviatoDaGestoRef.current) {
      audioAvviatoDaGestoRef.current = false;
      return;
    }
    avviaAmbiente(ambienteAudio, volumeAudio * (notteAttiva ? 0.6 : 1), urlCustomAudio, notteAttiva);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambienteAudio, notteAttiva, mutoAudio]);

  useEffect(() => {
    // In muto non esiste più alcun player da regolare; fuori dal muto aggiorna
    // il volume senza riavviare il loop.
    if (!mutoAudio) setVolumeAmbiente(volumeAudio * (notteAttiva ? 0.6 : 1));
  }, [volumeAudio, notteAttiva, mutoAudio]);

  // Pre-carica gli effetti sonori (colpo d'arma/incantesimo) al PRIMO tocco:
  // così il primo tiro suona subito, senza ritardo (l'audio va sbloccato da un gesto).
  useEffect(() => {
    const warm = () => { precaricaSfx(); window.removeEventListener('pointerdown', warm); };
    window.addEventListener('pointerdown', warm, { once: true });
    return () => window.removeEventListener('pointerdown', warm);
  }, []);

  // Promemoria backup: se ci sono personaggi reali e non si fa un backup da oltre
  // 7 giorni (e non è in "snooze"), mostra un avviso per non rischiare di perdere i dati.
  useEffect(() => {
    try {
      const ultimo = Number(localStorage.getItem('scheda-interattiva:ultimo-backup') || 0);
      const snooze = Number(localStorage.getItem('scheda-interattiva:snooze-backup') || 0);
      const pgReali = Object.values(roster.personaggi || {}).filter((s) => s && ((s.nome || '').trim() || (s.classe || '').trim())).length;
      const seiGiorni = 7 * 24 * 3600 * 1000;
      const vecchio = !ultimo || (Date.now() - ultimo) > seiGiorni;
      if (pgReali >= 1 && vecchio && Date.now() > snooze) setPromemoriaBackup(true);
    } catch { /* niente */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guida rapida: si apre una sola volta, al primo avvio dell'app.
  useEffect(() => {
    try {
      if (!localStorage.getItem('scheda-interattiva:guida-vista')) setMostraGuida(true);
    } catch { /* niente */ }
  }, []);

  function chiudiGuida() {
    try { localStorage.setItem('scheda-interattiva:guida-vista', '1'); } catch { /* niente */ }
    setMostraGuida(false);
    // Primo avvio senza personaggio reale: apri subito la CREAZIONE del PG.
    try {
      const r = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const s = r?.personaggi?.[r?.attivo];
      const haPg = s && (s.nome || s.classe);
      if (!haPg) {
        setBozzaCrea({ nome: '', sesso: '', classe: '', sottoclasse: '', specie: '', background: '', livello: 1, metodo: 'auto', pool: null, assegna: {}, competenzeClasse: [], competenzeSpecie: [], maestria: [], talentoOrigine: '', asiTalenti: {}, multiclasseClasse2: '', multiclasseLivello2: 1, sottoclasseMc2: '', multiclasseClasse3: '', multiclasseLivello3: 1, sottoclasseMc3: '', dotazione: 'pacchetto' });
        setMostraMenu(false);
        setMostraCrea(true);
      }
    } catch { /* niente */ }
  }

  // Personaggio ricevuto tramite link: lo decodifichiamo e chiediamo conferma
  // prima di aggiungerlo (non si sovrascrive mai nulla senza chiedere).
  useEffect(() => {
    const payload = payloadDaUrl(window.location.href);
    if (!payload) return;
    let annullato = false;
    decodificaScheda(payload).then((dati) => {
      if (annullato) return;
      // ripulisce subito il link, così un ricaricamento non riapre la richiesta
      try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch { /* niente */ }
      if (dati) { setMostraGuida(false); setMostraMenu(false); setPgDaLink(dati); }
      else setErroreImport('Il link del personaggio non e\u0300 leggibile: potrebbe essere incompleto.');
    });
    return () => { annullato = true; };
  }, []);

  /** Aggiunge alla raccolta il personaggio arrivato dal link. */
  function accettaPgDaLink() {
    if (!pgDaLink) return;
    salvaSnapshot(roster);
    const id = nuovoId();
    setRoster((r) => ({ ...r, attivo: id, personaggi: { ...r.personaggi, [id]: normalizeImported(pgDaLink) } }));
    setPgDaLink(null);
  }

  // Snapshot automatico periodico: se è passato abbastanza tempo dall'ultimo, ne
  // registra uno (debounced), così c'è sempre una versione recente da ripristinare.
  useEffect(() => {
    const ultimo = leggiSnapshots()[0]?.ts || 0;
    if (Date.now() - ultimo < 5 * 60 * 1000) return;
    const tmr = setTimeout(() => salvaSnapshot(roster), 2500);
    return () => clearTimeout(tmr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster]);

  // Cloud Sync
  const [mostraCloud, setMostraCloud] = useState(false);
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('scheda-interattiva:github-token') || '');
  const [gistId, setGistId] = useState(() => localStorage.getItem('scheda-interattiva:gist-id') || '');
  const [cloudStatus, setCloudStatus] = useState({ text: '', type: '' });
  // auto-salvataggio su cloud (debounced) + orario ultimo salvataggio
  const [mostraToken, setMostraToken] = useState(false);
  const [autoSync, setAutoSync] = useState(() => localStorage.getItem('scheda-interattiva:auto-sync') !== 'off');
  const [ultimoSync, setUltimoSync] = useState(() => localStorage.getItem('scheda-interattiva:ultimo-sync') || '');
  const [caricandoCloud, setCaricandoCloud] = useState(false); // overlay di caricamento dal cloud
  const rosterSyncRef = useRef(roster);
  const tokenSyncRef = useRef(githubToken);
  const gistSyncRef = useRef(gistId);
  const syncInCorsoRef = useRef(false);
  const syncPendenteRef = useRef(false);
  rosterSyncRef.current = roster;
  tokenSyncRef.current = githubToken;
  gistSyncRef.current = gistId;

  // Sincronizzazione tramite codice, senza token GitHub: alternativa più
  // semplice al backup a token, sullo stesso modello delle Stanze temporanee.
  const [codiceSync, setCodiceSync] = useState(() => localStorage.getItem('scheda-interattiva:codice-sync') || '');
  const [autoSyncCodice, setAutoSyncCodice] = useState(() => localStorage.getItem('scheda-interattiva:auto-sync-codice') === 'on');
  const [ultimoSyncCodice, setUltimoSyncCodice] = useState(() => localStorage.getItem('scheda-interattiva:ultimo-sync-codice') || '');
  const [codiceSyncInput, setCodiceSyncInput] = useState('');
  const [syncCodiceStatus, setSyncCodiceStatus] = useState({ text: '', type: '' });
  const codiceSyncRef = useRef(codiceSync);
  const syncCodiceInCorsoRef = useRef(false);
  const syncCodicePendenteRef = useRef(false);
  codiceSyncRef.current = codiceSync;

  // Level Up
  const [mostraLevelUp, setMostraLevelUp] = useState(false);
  const [mostraPrivilegi, setMostraPrivilegi] = useState(false); // panoramica privilegi per livello
  const [mostraPrivilegiSub, setMostraPrivilegiSub] = useState(false); // panoramica privilegi di sottoclasse
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

  /** Controllo sottoclasse per una singola classe (usato sia per la classe
   *  principale sia per quelle del multiclasse): bloccato finché non è ancora il
   *  livello di scelta, poi tendina; una volta scelta, mostra la sottoclasse. */
  function campoSottoclasse(cls, liv, valore, onSeleziona) {
    const livSub = livelloSceltaSottoclasse(cls, versione);
    const sbloccata = !cls || !livSub || (liv || 1) >= livSub;
    if (!sbloccata) {
      return <CampoBloccato valore={t('profilo.sottoclasse_dal_liv', { n: livSub })} title={t('profilo.sottoclasse_attesa', { n: livSub })} />;
    }
    if (valore) {
      return <CampoBloccato valore={traduciDato(valore)} title={t('profilo.sottoclasse_bloccata')} />;
    }
    return (
      <CampoTendina
        value={valore}
        opzioni={sottoclassiPerClasse(cls)}
        onChange={onSeleziona}
        title={t('tip.scegli_sottoclasse')}
      />
    );
  }

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
    setNotteAttiva(scuroEff); // notte = tema scuro: pilota sfondi notturni e audio più cupo
    // Parti dal tema base, poi applica l'override del preset colori
    const presetDati = PRESET_COLORI.find((p) => p.id === presetColori) || PRESET_COLORI[0];
    const t = { ...BASE_TEMA[modo], ...presetDati[modo] };
    const acc = coloreClasse(classeAttiva);
    if (acc) {
      const colore = acc[modo];
      t.title = colore;
      t.gold = colore;
      t.goldDark = colore;
      // tonalità: bordi sempre, sfondo e pannelli solo in tema scuro. In tema
      // chiaro, intonare anche lo sfondo verso colori "caldi" (rosso, arancio,
      // cremisi) lo appiattisce contro il crema di base: restano quindi
      // neutri, e solo testo/bordi portano il colore della classe.
      if (scuroEff) {
        t.bg = mescola(t.bg, colore, 0.07);
        t.panelLight = mescola(t.panelLight, colore, 0.1);
      }
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
    const hexRgba = (hex, a) => {
      const m = /^#?([0-9a-fA-F]{6})$/.exec(hex || '');
      if (!m) return `rgba(0,0,0,${a})`;
      const n = parseInt(m[1], 16);
      return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
    };
    const tintaClasse = acc ? acc[modo] : t.gold;
    const coloreGlow = mescola(t.bg, tintaClasse, scuroEff ? 0.26 : 0.17);
    // In modalità giorno il colore miscelato è quasi bianco: opaco lavava la
    // fotografia. La trasparenza conserva la tinta di classe senza sovraesporre.
    const glowClasse = `radial-gradient(135% 95% at 50% -14%, ${hexRgba(coloreGlow, scuroEff ? 0.18 : 0.12)}, transparent 60%)`;
    const ambra = `radial-gradient(70% 46% at 50% -2%, rgba(224,162,74,${scuroEff ? 0.13 : 0.06}), transparent 66%)`;
    const vignetta = `radial-gradient(116% 116% at 50% 42%, transparent 52%, ${mescola(t.bg, '#000000', scuroEff ? 0.42 : 0.13)} 100%)`;
    // sfondo atmosferico dell'ambientazione (gradienti tematici nei margini pagina)
    const sfondoAmbiente = presetDati.sfondo || '';
    // Immagine di sfondo a tema (foto libere/di pubblico dominio in
    // public/ambientazioni/<id>.jpg): riempie i margini della pagina e cambia
    // con il luogo. Il preset tecnico di base resta senza immagine.
    const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
    const idAmb = presetDati.id;
    const conImmagine = idAmb && idAmb !== 'default';
    // velo SCURO sopra la foto (non chiaro): così l'immagine resta ben visibile e
    // "spicca" anche di giorno, mentre i pannelli opachi restano bianchi/leggibili.
    // Di notte il velo è più intenso per un'atmosfera più cupa.
    const veloAlpha = scuroEff ? 0.5 : 0.32;
    const velo = conImmagine
      ? `linear-gradient(rgba(14,11,8,${veloAlpha}), rgba(14,11,8,${veloAlpha}))`
      : '';
    // Di notte (tema scuro) usa la variante notturna dell'ambientazione, se esiste.
    const AMB_NOTTE = new Set(['taverna', 'mercato', 'citta', 'dungeon', 'foresta', 'palude', 'notte', 'mare', 'tundra', 'montagna', 'tempesta', 'accampamento', 'deserto', 'tempio']);
    const fileImg = (scuroEff && AMB_NOTTE.has(idAmb)) ? `${idAmb}-notte.jpg` : `${idAmb}.jpg`;
    const imgLayer = conImmagine
      ? `url("${baseUrl}ambientazioni/${fileImg}") center center / cover no-repeat`
      : '';
    document.body.style.background = [sfondoAmbiente, glowClasse, ambra, vignetta, velo, imgLayer, t.bg]
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
  const caratteristicaIncantatore = caratteristicaIncantatoreEffettiva(scheda);
  // versione delle regole del personaggio attivo (fallback: impostazione globale)
  const versione = scheda?.versione || regoleVersione || '2024';
  // Allinea SUBITO le spiegazioni all'edizione del PG: le voci che cambiano fra
  // 5.0 e 5.5 mostrano solo le regole dell'edizione di questo personaggio.
  setEdizioneAttuale(versione);

  // Le risorse tipiche della classe devono esserci anche nelle schede vecchie
  // o importate e devono seguire automaticamente livello e caratteristiche.
  useEffect(() => {
    if (!scheda) return;
    setRoster((r) => {
      const corrente = r.personaggi[r.attivo];
      if (!corrente) return r;
      const sincronizzate = sincronizzaRisorseClasse(corrente, corrente.versione || regoleVersione || '2024');
      if (sincronizzate === corrente.risorse) return r;
      return {
        ...r,
        personaggi: { ...r.personaggi, [r.attivo]: { ...corrente, risorse: sincronizzate } },
      };
    });
  }, [roster.attivo, scheda?.classe, scheda?.livello, scheda?.versione, scheda?.caratteristiche, regoleVersione]);

  useEffect(() => {
    const esito = saveState(roster);
    salvaImmaginiRoster(roster).catch(() => {
      setErroreSalvataggio('Il browser non ha consentito il salvataggio permanente delle immagini. Esporta un backup prima di chiudere.');
    });
    setErroreSalvataggio(esito.ok
      ? ''
      : `Spazio del browser esaurito: le ultime modifiche non sono state salvate (${(esito.bytes / 1048576).toFixed(1)} MB). Esporta subito il personaggio.`);
  }, [roster]);

  /**
   * Registra lo stato precedente per l'Annulla. Le modifiche ravvicinate
   * (es. mentre si digita in un campo) vengono unite in un unico passo:
   * così un Annulla non cancella una lettera alla volta.
   */
  useEffect(() => {
    if (rosterPrec.current === null) { rosterPrec.current = roster; return; } // primo avvio
    if (rosterPrec.current === roster) return;
    if (saltaUndo.current) { saltaUndo.current = false; rosterPrec.current = roster; return; }
    const ora = Date.now();
    if (ora - ultimoPassoUndo.current > 700) {
      storicoUndo.current.push(rosterPrec.current);
      if (storicoUndo.current.length > 30) storicoUndo.current.shift();
      setPassiUndo(storicoUndo.current.length);
    }
    ultimoPassoUndo.current = ora;
    rosterPrec.current = roster;
  }, [roster]);

  /** Annulla l'ultima modifica (Ctrl/Cmd+Z o pulsante ↩︎). */
  function annullaModifica() {
    const prec = storicoUndo.current.pop();
    if (!prec) return;
    saltaUndo.current = true;
    setRoster(prec);
    setPassiUndo(storicoUndo.current.length);
  }

  // Scorciatoia da tastiera: Ctrl+Z / Cmd+Z (non mentre si scrive in un campo)
  useEffect(() => {
    function onKey(e) {
      if (!(e.key === 'z' || e.key === 'Z') || !(e.ctrlKey || e.metaKey) || e.shiftKey) return;
      const el = e.target;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return;
      e.preventDefault();
      annullaModifica();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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

  // Corregge definitivamente anche le schede create/importate prima
  // dell'automatismo, senza ritardare i calcoli del render corrente.
  useEffect(() => {
    const automatica = caratteristicaIncantatorePerClasse(scheda.classe, scheda.sottoclasse);
    if (automatica && scheda.incantatore?.caratteristica !== automatica) {
      aggiorna({ incantatore: { ...scheda.incantatore, caratteristica: automatica } });
    }
  }, [scheda.classe, scheda.sottoclasse, scheda.incantatore?.caratteristica]);

  // --- Archivio DM: deposita una copia della scheda attiva ---
  // Parte ~10 secondi dopo l'ultima modifica (così non si scrive a ogni tasto)
  // e solo se la scheda ha un nome vero. Le immagini non vengono inviate.
  useEffect(() => {
    if (!URL_ARCHIVIO_PG) return;
    const nome = String(scheda?.nome || '').trim();
    if (!nome || nome === 'Nuovo personaggio') return;
    const timer = setTimeout(() => {
      const { ritratto, mappaCampagna: _m, ...leggera } = scheda;
      fetch(`${URL_ARCHIVIO_PG.replace(/\/+$/, '')}/pg`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispositivo: idDispositivo, id: roster.attivo, scheda: leggera }),
      }).catch(() => { /* offline o archivio spento: si riproverà alla prossima modifica */ });
    }, 10000);
    return () => clearTimeout(timer);
  }, [scheda, roster.attivo, idDispositivo]);

  // --- Mappa della campagna, legata al PG ---
  // Immagine e segnalino sono salvati NELLA scheda, così la mappa resta col
  // personaggio a cui la carichi (e segue export/cloud).
  const mappaCampagna = scheda.mappaCampagna || '';
  const setMappaCampagna = (v) => {
    aggiorna({ mappaCampagna: v || '' });
    if (!v) rimuoviImmaginePersonaggio(roster.attivo, 'mappaCampagna').catch(() => {});
  };
  // Durante il trascinamento uso uno stato locale (fluidità) e scrivo nella
  // scheda solo al rilascio; cambiando PG risincronizzo dal personaggio attivo.
  const [mappaMarker, setMappaMarker] = useState(
    scheda.mappaMarker && typeof scheda.mappaMarker.x === 'number' ? scheda.mappaMarker : { x: 50, y: 50 }
  );
  const mappaMarkerRef = useRef(mappaMarker);
  useEffect(() => {
    const m = scheda.mappaMarker;
    const val = m && typeof m.x === 'number' ? m : { x: 50, y: 50 };
    mappaMarkerRef.current = val;
    setMappaMarker(val);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster.attivo, scheda.mappaMarker?.x, scheda.mappaMarker?.y]);
  // Su Safari mobile il trascinamento può terminare con pointercancel invece di
  // pointerup. Salva quindi anche poco dopo ogni spostamento: il pin non dipende
  // dall'evento finale e conserva la posizione a ogni riapertura/ricaricamento.
  useEffect(() => {
    if (!mappaAperta) return undefined;
    const salvato = scheda.mappaMarker;
    if (salvato && salvato.x === mappaMarker.x && salvato.y === mappaMarker.y) return undefined;
    const timer = setTimeout(() => aggiorna({ mappaMarker: mappaMarkerRef.current }), 180);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappaMarker.x, mappaMarker.y, mappaAperta]);
  const trascinaMarker = (e) => {
    const wrap = mappaWrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
    const nuovo = { x, y };
    mappaMarkerRef.current = nuovo;
    setMappaMarker(nuovo);
  };
  const fineTrascinaMarker = () => {
    window.removeEventListener('pointermove', trascinaMarker);
    window.removeEventListener('pointerup', fineTrascinaMarker);
    aggiorna({ mappaMarker: mappaMarkerRef.current }); // salva la posizione nel PG
  };
  const iniziaTrascinaMarker = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.addEventListener('pointermove', trascinaMarker);
    window.addEventListener('pointerup', fineTrascinaMarker, { once: true });
  };

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

  /** Applica alla specie: imposta come ★ (competenza di classe/razza) le abilità concesse. */
  function abilitaConSpecie(specie) {
    const cs = competenzeSpecieDi(specie);
    if (!cs) return {};
    const abilita = { ...scheda.abilita };
    cs.lista.slice(0, cs.numero).forEach((k) => { abilita[k] = Math.max(abilita[k] || 0, 2); });
    return { abilita };
  }

  // --- gestione roster ---

  function nuovoPersonaggio(dati = schedaVuota()) {
    const id = nuovoId();
    setRoster((r) => ({ attivo: id, personaggi: { ...r.personaggi, [id]: dati } }));
  }

  /** Genera un personaggio coerente da classe/specie/background (creazione guidata). */
  function creaPersonaggio({ nome, sesso, classe, sottoclasse, specie, background, metodo, pool, assegna, competenzeClasse, competenzeSpecie, maestria, talentoOrigine, asiTalenti, multiclasseClasse2, multiclasseLivello2, sottoclasseMc2, multiclasseClasse3, multiclasseLivello3, sottoclasseMc3, dotazione, livello }) {
    const s = schedaVuota();
    // Livello iniziale scelto in creazione (1-20): impostato SUBITO così dado vita,
    // slot incantesimo e bonus di competenza vengono calcolati per quel livello.
    s.livello = Math.max(1, Math.min(20, Number(livello) || 1));
    s.nome = nome?.trim() || 'Nuovo personaggio';
    s.sesso = ['maschio', 'femmina', 'altro'].includes(sesso) ? sesso : '';
    s.classe = classe;
    s.sottoclasse = sottoclasse || '';
    s.specie = specie;
    s.background = background;
    // dati dalla classe: incantatore, dado vita, tiri salvezza, addestramento, slot
    const car = caratteristicaIncantatorePerClasse(classe, sottoclasse);
    if (car) s.incantatore = { caratteristica: car };
    s.dadiVita = esprDadiVita(s.livello, dadoVitaClasse(classe));
    const ts = tiriSalvezzaPerClasse(classe);
    if (ts) s.tiriSalvezza = ts;
    const add = addestramentoPerClasse(classe);
    if (add) s.addestramento = { ...s.addestramento, armature: { ...add.armature }, armi: add.armi };
    const slot = slotDaClasseLivello(classe, s.livello, sottoclasse);
    if (slot) s.slotIncantesimo = slot;
    // dati dalla specie: velocità, sensi, taglia, tratti
    const sp = datiSpecieDi(specie);
    if (sp) { s.velocita = sp.velocita; s.sensi = sp.sensi; s.taglia = sp.taglia; s.trattiSpecie = trattiSpecieTesto(sp.tratti); }
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
    // Maestria/Expertise (Ladro, Bardo): doppia competenza (✦) sulle abilità scelte,
    // già competenti per costruzione (l'interfaccia le propone solo fra quelle).
    (Array.isArray(maestria) ? maestria : []).forEach((k) => { if (k in s.abilita) s.abilita[k] = 3; });
    // versione delle regole scelta per questo personaggio
    s.versione = regoleVersione;
    // Privilegi ottenuti fino al livello iniziale, secondo l'edizione scelta.
    s.privilegi = privilegiClasseFinoA(classe, s.livello, regoleVersione);
    s.privilegiSottoclasse = sottoclasse ? privilegiSottoclasseFinoA(sottoclasse, s.livello) : '';
    // Bonus alle caratteristiche: dal background nella 5.5, dalla razza nella 5.0.
    if (regoleVersione === '2024') {
      const [piu2, piu1] = bonusCaratteristicheBackground(background, classe);
      if (piu2) s.caratteristiche[piu2] = (s.caratteristiche[piu2] || 10) + 2;
      if (piu1) s.caratteristiche[piu1] = (s.caratteristiche[piu1] || 10) + 1;
    } else {
      const bonusRazza = bonusCaratteristicheSpecie2014(specie, classe);
      for (const [k, v] of Object.entries(bonusRazza)) {
        s.caratteristiche[k] = (s.caratteristiche[k] || 10) + v;
      }
    }
    // Aumenti di caratteristica dei livelli già superati (4°, 8°, …): senza
    // questi un PG creato al 7° livello resterebbe coi punteggi del 1°. Ogni
    // livello può diventare un talento invece del +2, secondo la scelta fatta
    // nella creazione guidata (stesso meccanismo del Level Up).
    const { talenti: talentiDaASI } = applicaASIFinoA(s.caratteristiche, classe, s.livello, asiTalenti || {});
    // Talento di Origine (2024): il background ne dà uno già al 1° livello.
    const talentiIniziali = [...(regoleVersione === '2024' && talentoOrigine ? [talentoOrigine] : []), ...talentiDaASI];
    if (talentiIniziali.length) s.talenti = talentiIniziali.join('\n');
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
    // risorse di classe automatiche (Ira, Punti Stregoneria, Ki, Ispirazione Bardica…)
    s.risorse = risorseAutoClasse(classe, s.livello, s.caratteristiche, regoleVersione);
    // punti ferita: 1° livello = dado vita massimo + mod. Costituzione; ogni
    // livello successivo aggiunge la media del dado (arrotondata per eccesso) + mod.
    {
      const facce = dadoVitaClasse(classe);
      const conMod = modificatore(s.caratteristiche.costituzione);
      const perLivelloSucc = Math.floor(facce / 2) + 1 + conMod;
      s.pfMax = Math.max(1, facce + conMod + (s.livello - 1) * perLivelloSucc);
      s.pfAttuali = s.pfMax;
    }
    // Punti esperienza coerenti col livello scelto (chi gioca a milestone li ignora).
    s.pe = PE_PER_LIVELLO[s.livello] || 0;
    // Oro extra per chi parte oltre il 4° livello (linee guida del DMG): un
    // personaggio di 12° non può avere in tasca le 5 monete del 1°.
    const oroExtra = oroInizialePerLivello(s.livello);
    if (oroExtra) {
      s.denari = { ...s.denari, mo: (s.denari.mo || 0) + oroExtra };
      s.note = [s.note, `Creato al ${s.livello}° livello: secondo le linee guida del manuale ti spettano anche degli oggetti magici (${s.livello >= 17 ? 'tre non comuni e uno raro' : s.livello >= 11 ? 'due non comuni' : 'uno non comune'}), da concordare con il DM.`].filter(Boolean).join('\n');
    }
    // Trucchetti e incantesimi già noti: senza questi un incantatore creato a
    // livello alto avrebbe gli slot pieni e la lista degli incantesimi vuota.
    const inc = incantesimiInizialiPerLivello(classe, s.livello, regoleVersione, s.caratteristiche, sottoclasse);
    if (inc && (inc.trucchetti.length || inc.incantesimi.length)) {
      s.incantesimiLista = [...inc.trucchetti, ...inc.incantesimi];
    }
    // Multiclasse alla creazione: seconda e terza classe (triclasse come Fighter1/Ranger6/Rogue3).
    // Le competenze di addestramento/TS restano quelle della classe principale, come da regola.
    const multiclasseDaCreazione = [];
    if (multiclasseClasse2 && multiclasseClasse2 !== classe) {
      const liv2 = Math.max(1, Math.min(19, Number(multiclasseLivello2) || 1));
      multiclasseDaCreazione.push({ classe: multiclasseClasse2, livello: liv2, ...(sottoclasseMc2 ? { sottoclasse: sottoclasseMc2 } : {}) });
    }
    if (multiclasseClasse3 && multiclasseClasse3 !== classe && multiclasseClasse3 !== multiclasseClasse2) {
      const liv3 = Math.max(1, Math.min(19, Number(multiclasseLivello3) || 1));
      multiclasseDaCreazione.push({ classe: multiclasseClasse3, livello: liv3, ...(sottoclasseMc3 ? { sottoclasse: sottoclasseMc3 } : {}) });
    }
    if (multiclasseDaCreazione.length) {
      s.multiclasse = multiclasseDaCreazione;
      s.dadiVita = calcolaFormulaDadiVita(classe, s.livello, s.multiclasse);
      for (const mc of s.multiclasse) {
        const priv = privilegiClasseFinoA(mc.classe, mc.livello, regoleVersione);
        if (priv) s.privilegi = [s.privilegi, `[${mc.classe}]`, priv].filter(Boolean).join('\n');
        if (mc.sottoclasse) {
          const subPriv = privilegiSottoclasseFinoA(mc.sottoclasse, mc.livello);
          if (subPriv) s.privilegiSottoclasse = [s.privilegiSottoclasse, subPriv].filter(Boolean).join('\n');
        }
      }
      const slotMc = slotMulticlasse([{ classe, livello: s.livello }, ...s.multiclasse.map((m) => ({ classe: m.classe, livello: m.livello }))]);
      if (slotMc) s.slotIncantesimo = slotMc;
      const conMod = modificatore(s.caratteristiche.costituzione);
      for (const mc of s.multiclasse) {
        const facce = dadoVitaClasse(mc.classe);
        s.pfMax += mc.livello * (Math.floor(facce / 2) + 1 + conMod);
      }
      s.pfAttuali = s.pfMax;
    }
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
    const competenzeSpecie = cs ? [...cs.lista].sort(() => Math.random() - 0.5).slice(0, cs.numero) : [];
    creaPersonaggio({ nome: nomeCasuale(specie), classe, specie, background, metodo: 'auto', pool: null, assegna: {}, competenzeClasse, competenzeSpecie });
  }

  function duplicaPersonaggio() {
    nuovoPersonaggio({ ...scheda, nome: `${scheda.nome} (copia)` });
  }

  function eliminaPersonaggio() {
    setConferma({
      titolo: t('menu.elimina_titolo'),
      testo: `Vuoi eliminare davvero "${scheda?.nome || t('menu.senza_nome')}"? L'operazione non si può annullare.`,
      onConferma: () => {
        const idDaCancellare = roster.attivo;
        // Toglie anche la copia nell'Archivio DM: altrimenti il Master continua
        // a vedere un personaggio che sul dispositivo del giocatore non esiste
        // più. Nessuna chiave richiesta: un dispositivo può cancellare solo
        // ciò che ha depositato lui stesso (stessa identità della POST).
        if (URL_ARCHIVIO_PG && idDaCancellare) {
          fetch(`${URL_ARCHIVIO_PG.replace(/\/+$/, '')}/pg`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dispositivo: idDispositivo, id: idDaCancellare }),
            keepalive: true,
          }).catch(() => { /* offline o archivio spento: pazienza, non blocca l'eliminazione locale */ });
        }
        setRoster((r) => {
          salvaSnapshot(r);
          const personaggi = { ...r.personaggi };
          delete personaggi[r.attivo];
          const ids = Object.keys(personaggi);
          if (ids.length === 0) {
            // Niente più "Avventuriero senza nome" fantoccio: apri il Menu
            // così l'utente sceglie da zero (nuovo PG, importa, ecc.).
            setTimeout(() => setMostraMenu(true), 0);
            return { attivo: '', personaggi: {} };
          }
          return { attivo: ids[0], personaggi };
        });
      },
    });
  }


  /** Azzera la scheda del personaggio attivo, mantenendolo nel roster. */
  function resetScheda() {
    if (!window.confirm(t('reset.conferma', { nome: scheda.nome }))) return;
    salvaSnapshot(roster); // rete di sicurezza: salva lo stato prima di azzerare
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
  function conAnimazione(alFine, facciaFinale, tipoDado = 20, magia = false, suono = null) {
    clearInterval(intervalRef.current);
    setTiro(null);
    setDanni(null);
    setRolling(true);
    setTipoDadoInUso(tipoDado);
    if (suoniEffOn) eseguiEffettoSonoro(suono || (magia ? 'magia' : 'tiro'), volumeEffetti);
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
    const initRoll = tiraDado(20) + modificatore(punteggioCaratteristica(scheda, 'destrezza'));
    aggiungiCombattente('pg', {
      nome: scheda.nome, iniziativa: initRoll,
      pfMax: scheda.pfMax, pfAttuali: scheda.pfAttuali, ca: caTotale(scheda),
    });
    registra({ etichetta: `${t('vital.iniziativa')}: ${scheda.nome}`, tipo: 'd20', totale: initRoll, dettaglio: `d20 ${conSegno(modificatore(punteggioCaratteristica(scheda, 'destrezza')))}` });
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
    const { dopoTiro, magia, suono, ...restExtra } = extra;
    clearInterval(intervalRef.current);
    setDanni(null);
    setTiro(null);
    setRolling(true);
    setTipoDadoInUso(20);
    if (suoniEffOn) eseguiEffettoSonoro(suono || (magia ? 'magia' : 'tiro'), volumeEffetti);
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
      if (suoniEffOn) {
        if (naturale === 20) eseguiEffettoSonoro('critico', volumeEffetti);
        else if (naturale === 1) eseguiEffettoSonoro('fallimento', volumeEffetti);
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
    }, esito.totale, maxFacce || 20, magia, esito.tabella ? null : (magia ? 'magia' : 'danni'));
  }

  /** Tira i danni di un attacco (con eventuale critico), indipendente dallo stato. */
  function tiraDanniPerAttacco(attacco, critico) {
    const parsata = parseEspressioneDado(attacco?.danno || '');
    if (!parsata) return;
    const maxFacce = Math.max(...parsata.termini.map((p) => p.facce).filter(Boolean));
    const nome = attacco.nome;
    const esito = tiraDanni(parsata, critico);
    // Suono coerente col tipo d'attacco: incantesimo → magia; arco/balestra/fionda
    // → colpo a distanza; tutto il resto (mischia) → colpo di spada.
    const suonoDanno = attacco?.isSpell
      ? 'magia'
      : /arco|balestra|fionda/i.test(nome || '')
        ? 'arco'
        : 'arma';
    conAnimazione(() => {
      setDanni({ etichetta: `Danni: ${nome}`, ...esito, critico });
      registra({ etichetta: `${t('log.danni')}: ${nome}`, tipo: 'danni', totale: esito.totale, dettaglio: esito.dettaglio, critico });
    }, esito.totale, maxFacce || 20, false, suonoDanno);
  }

  /** Danni dell'attacco corrente (dal tiro per colpire in corso). */
  function lanciaDanniAttacco() {
    if (!tiro?.attacco) return;
    tiraDanniPerAttacco(tiro.attacco, tiro.naturale === 20);
  }

  /** Scala di 1 la munizione adatta (se l'arma la usa e ne hai in inventario). */
  function consumaMunizione(nomeArma) {
    if (!armaUsaMunizioni(nomeArma)) return;
    const inv = scheda.inventario || [];
    const re = regexMunizione(nomeArma);
    const idx = inv.findIndex((o) => re.test(o.nome) && (Number(o.qta) || 0) > 0);
    if (idx === -1) return;
    aggiorna({ inventario: inv.map((o, i) => (i === idx ? { ...o, qta: Math.max(0, (Number(o.qta) || 0) - 1) } : o)) });
  }

  /** Tira per colpire con un'arma e, se è a munizioni, ne scala una dall'inventario. */
  function tiraColpoArma(a) {
    // Il tiro per colpire è sempre un d20: spada, freccia e magia suonano solo
    // quando si tirano i rispettivi danni.
    lanciaD20(`Attacco: ${a.nome}`, a.bonus, { attacco: a, magia: !!a.isSpell, suono: 'tiro' });
    if (!a.isSpell) consumaMunizione(a.nome);
  }

  /** Tiro salvezza contro morte: regole 5e complete. */
  function tiroSalvezzaMorte() {
    clearInterval(intervalRef.current);
    setDanni(null);
    setTiro(null);
    setRolling(true);
    setTipoDadoInUso(20);
    if (suoniEffOn) eseguiEffettoSonoro('tiro', volumeEffetti);
    intervalRef.current = setInterval(() => setFaccia(tiraDado(20)), 70);

    const { naturale, dadi } = tiraD20(modalita);
    setTimeout(() => {
      clearInterval(intervalRef.current);
      setFaccia(naturale);
      setRolling(false);
      if (suoniEffOn) {
        if (naturale === 20) eseguiEffettoSonoro('critico', volumeEffetti);
        else if (naturale === 1) eseguiEffettoSonoro('fallimento', volumeEffetti);
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
  function tiraDadoVita(facceScelte) {
    const gruppi = gruppiDadoVita(scheda.dadiVita);
    const spesiMap = dadiVitaSpesiNormalizzati(scheda);
    const gruppo = gruppi.find((g) => g.facce === facceScelte)
      || gruppi.find((g) => (spesiMap[g.facce] || 0) < g.quantita)
      || gruppi[0];
    const facce = gruppo.facce;
    const spesiAttuali = spesiMap[facce] || 0;
    if (spesiAttuali >= gruppo.quantita) {
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
    const mod = modificatore(punteggioCaratteristica(scheda, 'costituzione'));
    const recupero = Math.max(0, dado + mod);
    conAnimazione(() => {
      setScheda((s) => {
        const mappa = dadiVitaSpesiNormalizzati(s);
        return {
          ...s,
          pfAttuali: Math.min(s.pfMax, s.pfAttuali + recupero),
          dadiVitaSpesi: { ...mappa, [facce]: (mappa[facce] || 0) + 1 },
        };
      });
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
      // Il totale recuperabile è condiviso fra tutte le classi (metà del livello
      // totale DI TUTTE LE CLASSI, non solo la principale, arrotondato per
      // difetto): si applica prima al gruppo più speso.
      const livelloTotalePerRiposo = (s.livello || 1) + (Array.isArray(s.multiclasse) ? s.multiclasse.reduce((a, m) => a + (m?.livello || 0), 0) : 0);
      let recuperoDadi = Math.max(1, Math.floor(livelloTotalePerRiposo / 2));
      const gruppi = gruppiDadoVita(s.dadiVita);
      const spesiMap = dadiVitaSpesiNormalizzati(s);
      const nuovoSpesi = { ...spesiMap };
      for (const g of [...gruppi].sort((a, b) => (spesiMap[b.facce] || 0) - (spesiMap[a.facce] || 0))) {
        if (recuperoDadi <= 0) break;
        const attuale = nuovoSpesi[g.facce] || 0;
        const riduci = Math.min(attuale, recuperoDadi);
        nuovoSpesi[g.facce] = attuale - riduci;
        recuperoDadi -= riduci;
      }
      return {
        ...s,
        pfAttuali: s.pfMax,
        pfTemp: 0,
        tsMorte: { successi: 0, fallimenti: 0 },
        slotIncantesimo: slot,
        dadiVitaSpesi: nuovoSpesi,
        risorse: risorseDopoRiposo(s.risorse, 'lungo'),
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
      risorse: risorseDopoRiposo(s.risorse, 'breve'),
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
      // Mantiene dettaglio Retina, ma impedisce a una singola foto di saturare
      // lo spazio riservato a tutti i personaggi.
      aggiorna({ ritratto: immagineRidotta(img, 1280, 650000, 0.88) });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setErroreImport('Immagine non riconosciuta: usa un file JPG o PNG.');
    };
    img.src = url;
  }

  /** Carica (e ridimensiona) l'immagine della mappa della campagna. */
  function caricaMappa(evento) {
    const file = evento.target.files?.[0];
    evento.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      // Compressione adattiva: prova prima 2200px, poi riduce qualità/dimensioni
      // solo quanto serve per restare sotto circa 1,5 MB.
      setMappaCampagna(immagineRidotta(img, 2200, 1500000, 0.84));
      setMappaAperta(true);
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
    segnaBackupFatto();
  }

  /**
   * Crea il link di condivisione del personaggio attivo e lo copia negli
   * appunti. La scheda viaggia compressa nel frammento dell'URL, quindi non
   * passa mai dal server. Le foto caricate sono troppo pesanti per un link:
   * vengono escluse e chi apre il link vede l'avatar rigenerato.
   */
  async function condividiLink() {
    const { scheda: daInviare, ritrattoRimosso } = preparaPerCondivisione(scheda);
    const payload = await codificaScheda(daInviare);
    const link = costruisciLink(window.location.href, payload);
    let copiato = false;
    try {
      await navigator.clipboard.writeText(link);
      copiato = true;
    } catch { /* niente appunti: mostriamo comunque il link da copiare a mano */ }
    setCondivisione({ link, copiato, ritrattoRimosso, lungo: payload.length > LIMITE_PAYLOAD });
  }

  function messaggioErroreStanza(codice) {
    if (codice === 'ROOM_NOT_FOUND') return t('stanze.errore_inesistente');
    if (codice === 'ROOM_EXPIRED') return t('stanze.errore_scaduta');
    if (codice === 'ROOM_TOO_LARGE') return t('stanze.errore_grande');
    if (codice === 'ROOM_INVALID_PAYLOAD') return t('stanze.errore_non_valida');
    if (codice === 'ROOM_RATE_LIMITED') return t('stanze.errore_limite');
    return t('stanze.errore_servizio');
  }

  async function creaStanzaCorrente() {
    setStanzaUi((s) => ({ ...s, caricamento: true, errore: '', creato: '' }));
    try {
      const risultato = await creaStanza(URL_STANZE, scheda);
      setStanzaUi((s) => ({ ...s, caricamento: false, creato: risultato.code, scadenza: risultato.expiresAt }));
    } catch (err) {
      setStanzaUi((s) => ({ ...s, caricamento: false, errore: messaggioErroreStanza(err.message) }));
    }
  }

  async function apriStanzaDaCodice() {
    const codice = normalizzaCodiceStanza(stanzaUi.codice);
    setStanzaUi((s) => ({ ...s, codice, caricamento: true, errore: '' }));
    try {
      const risultato = await apriStanza(URL_STANZE, codice);
      setPgDaLink(normalizeImported(risultato.scheda));
      setStanzaUi({ aperta: false, codice: '', creato: '', scadenza: 0, caricamento: false, errore: '' });
      setMostraMenu(false);
    } catch (err) {
      setStanzaUi((s) => ({ ...s, caricamento: false, errore: messaggioErroreStanza(err.message) }));
    }
  }

  /** Segna che è stato fatto un backup (esportazione o sync cloud): azzera il promemoria. */
  function segnaBackupFatto() {
    try { localStorage.setItem('scheda-interattiva:ultimo-backup', String(Date.now())); } catch { /* niente */ }
    setPromemoriaBackup(false);
  }

  /** Backup COMPLETO: esporta TUTTI i personaggi in un unico file, per non perdere nulla. */
  function esportaBackupCompleto() {
    const nPg = Object.keys(roster.personaggi || {}).length;
    const dati = { tipo: 'tavolo-dei-dadi-backup', app: 'Tavolo dei Dadi', versione: APP_VERSION, data: new Date().toISOString(), personaggi: nPg, roster };
    const blob = new Blob([JSON.stringify(dati, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tavolo-dei-dadi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    segnaBackupFatto();
  }

  // --- Snapshot automatici: rete di sicurezza contro cancellazioni/reset accidentali.
  //     Sono LEGGERI (senza immagini) per non riempire lo spazio del browser. ---
  function leggiSnapshots() {
    try { return JSON.parse(localStorage.getItem('scheda-interattiva:snapshots')) || []; } catch { return []; }
  }
  function salvaSnapshot(r) {
    try {
      const ids = Object.keys(r?.personaggi || {});
      if (!ids.length) return;
      const leggero = rosterSenzaImmagini(r);
      const serial = JSON.stringify(leggero.personaggi);
      const snaps = leggiSnapshots();
      if (snaps[0] && JSON.stringify(snaps[0].roster.personaggi) === serial) return; // no doppioni
      snaps.unshift({ ts: Date.now(), n: ids.length, roster: leggero });
      let taglio = snaps.slice(0, 12);
      // se lo spazio non basta, riduci progressivamente il numero di snapshot
      for (;;) {
        try { localStorage.setItem('scheda-interattiva:snapshots', JSON.stringify(taglio)); break; }
        catch { if (taglio.length <= 1) break; taglio = taglio.slice(0, taglio.length - 1); }
      }
    } catch { /* niente */ }
  }
  /** Ripristina un roster da uno snapshot (salvando prima lo stato attuale, per poter tornare indietro). */
  function ripristinaSnapshot(snap) {
    salvaSnapshot(roster);
    setRoster(riagganciaImmagini(snap.roster, roster));
    setMostraRipristino(false);
    setMostraMenu(false);
  }

  /** Carica una scheda da file JSON come nuovo personaggio. */
  async function importaJson(evento) {
    const files = Array.from(evento.target.files || []);
    evento.target.value = '';
    if (!files.length) return;
    // Seleziona file immagine/PDF per IA e JSON per import diretto
    const isImageOrPdf = (f) => {
      const n = f.name.toLowerCase();
      const t = f.type || '';
      return t.startsWith('image/') || t === 'application/pdf' || /\.(pdf|jpe?g|png|webp|gif)$/.test(n);
    };
    const imageFiles = files.filter(isImageOrPdf);
    const jsonFiles = files.filter((f) => !isImageOrPdf(f));

    // 1) Immagini/PDF → trascrizione IA (supporta selezione multipla, es. 4 JPG FG)
    if (imageFiles.length) {
      const endpoint = (transcribeUrl || '').trim() || (typeof URL_ARCHIVIO_PG !== 'undefined' && URL_ARCHIVIO_PG ? URL_ARCHIVIO_PG : '') || (typeof URL_STANZE !== 'undefined' && URL_STANZE ? URL_STANZE : '') || '/api/transcribe';
      setErroreImport('');
      setPdfStato('loading');
      try {
        for (const file of imageFiles) {
          const name = file.name.toLowerCase();
          const base64 = await new Promise((risolvi, rifiuta) => {
            const fr = new FileReader();
            fr.onload = () => risolvi(String(fr.result).split(',')[1] || '');
            fr.onerror = () => rifiuta(new Error('lettura del file fallita'));
            fr.readAsDataURL(file);
          });
          const mediaType = (() => {
            if (file.type) return file.type;
            if (name.endsWith('.pdf')) return 'application/pdf';
            if (name.endsWith('.png')) return 'image/png';
            if (name.endsWith('.webp')) return 'image/webp';
            if (name.endsWith('.gif')) return 'image/gif';
            if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
            return 'image/jpeg';
          })();
          const body = mediaType.startsWith('image/') ? { fileBase64: base64, mediaType } : { pdfBase64: base64, fileBase64: base64, mediaType: 'application/pdf' };
          const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || `errore ${res.status} su ${file.name}`); }
          const dati = await res.json();
          nuovoPersonaggio(normalizeImported(dati));
        }
        setPdfStato('');
        setMostraMenu(false);
      } catch (e) {
        setPdfStato('');
        const dove = (transcribeUrl || URL_ARCHIVIO_PG || URL_STANZE || '').trim() ? 'Controlla endpoint IA.' : 'Configura endpoint IA.';
        setErroreImport(`Import da file fallito: ${e.message}. ${dove}`);
        return;
      }
    }

    // 2) JSON → import diretto (supporta selezione multipla)
    for (const file of jsonFiles) {
      try {
        const dati = JSON.parse(await file.text());
        const personaggiBackup = dati?.roster?.personaggi || (dati?.tipo === 'tavolo-dei-dadi-backup' ? dati?.personaggi : null);
        if (personaggiBackup && typeof personaggiBackup === 'object' && !Array.isArray(personaggiBackup)) {
          const lista = Object.values(personaggiBackup).filter((s) => s && typeof s === 'object');
          if (lista.length) {
            setRoster((r) => {
              const personaggi = { ...r.personaggi };
              let ultimo = r.attivo;
              lista.forEach((s, i) => {
                const id = `pg-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`;
                personaggi[id] = normalizeImported(s);
                ultimo = id;
              });
              return { attivo: ultimo, personaggi };
            });
            setMostraMenu(false);
            continue;
          }
        }
        nuovoPersonaggio(normalizeImported(dati));
        setMostraMenu(false);
      } catch {
        setErroreImport(`File JSON non valido: ${file.name} — usa un file esportato da Tavolo dei Dadi.`);
      }
    }
  }

  /**
   * Import da PDF con l'IA: manda il PDF (base64) all'endpoint di trascrizione
   * (Cloudflare Worker o server locale), che risponde con il JSON della scheda.
   */
   async function transcribePdf(evento) {
    const files = Array.from(evento.target.files || []);
    evento.target.value = '';
    if (!files.length) return;
    // Endpoint IA: prova prima quello configurato a mano, poi l'URL dell'archivio (stesso Worker), poi /api locale
    const endpoint = (transcribeUrl || '').trim() || (typeof URL_ARCHIVIO_PG !== 'undefined' && URL_ARCHIVIO_PG ? URL_ARCHIVIO_PG : '') || (typeof URL_STANZE !== 'undefined' && URL_STANZE ? URL_STANZE : '') || '/api/transcribe';
    setErroreImport('');
    setPdfStato('loading');
    try {
      for (const file of files) {
        const base64 = await new Promise((risolvi, rifiuta) => {
          const fr = new FileReader();
          fr.onload = () => risolvi(String(fr.result).split(',')[1] || '');
          fr.onerror = () => rifiuta(new Error('lettura del file fallita'));
          fr.readAsDataURL(file);
        });
        const mediaType = (() => {
          if (file.type) return file.type;
          const n = file.name.toLowerCase();
          if (n.endsWith('.pdf')) return 'application/pdf';
          if (n.endsWith('.png')) return 'image/png';
          if (n.endsWith('.webp')) return 'image/webp';
          if (n.endsWith('.gif')) return 'image/gif';
          if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
          return 'image/jpeg';
        })();
        const isImage = mediaType.startsWith('image/');
        const body = isImage
          ? { fileBase64: base64, mediaType }
          : { pdfBase64: base64, fileBase64: base64, mediaType: 'application/pdf' };
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `errore ${res.status} su ${file.name}`);
        }
        const dati = await res.json();
          nuovoPersonaggio(normalizeImported(dati));
        }
        setPdfStato('');
        setMostraMenu(false);
      } catch (e) {
      setPdfStato('');
      const dove = (transcribeUrl || URL_ARCHIVIO_PG || URL_STANZE || '').trim()
        ? 'Controlla che l’endpoint IA sia corretto e attivo (Workers AI richiede [ai] binding).'
        : 'Configura l’endpoint IA nelle impostazioni o imposta VITE_ARCHIVIO_PG_URL al deploy.';
      setErroreImport(`Import da file fallito: ${e.message}. ${dove}`);
    }
  }

  // --- Cloud Sync (GitHub Gist) ---

  async function salvaSuCloud(silenzioso = false) {
    if (!tokenSyncRef.current) {
      if (!silenzioso) setCloudStatus({ text: 'Inserisci il GitHub Token per salvare.', type: 'error' });
      return;
    }
    // Accoda una sola scrittura aggiornata se arriva una modifica mentre il
    // salvataggio precedente è ancora in volo. Evita che una risposta vecchia
    // finisca dopo quella nuova e sovrascriva il Gist con dati arretrati.
    if (syncInCorsoRef.current) {
      syncPendenteRef.current = true;
      return;
    }
    syncInCorsoRef.current = true;
    try {
      setSincronizzando(true);
      if (!silenzioso) setCloudStatus({ text: 'Salvataggio in corso...', type: 'info' });
      const quando = Date.now();
      // Le immagini vivono in IndexedDB per non saturare localStorage. Prima
      // del cloud le riagganciamo esplicitamente: così ritratto e mappa seguono
      // davvero il personaggio anche su un altro dispositivo.
      const rosterCloud = await caricaImmaginiRoster(rosterSyncRef.current).catch(() => rosterSyncRef.current);
      let nuovoId = gistSyncRef.current;
      let rosterDaInviare = rosterCloud;
      if (nuovoId) {
        // Non lasciare che il push di un dispositivo senza l'immagine più
        // recente (appena caricata da un altro dispositivo, non ancora
        // scaricata qui) cancelli quella già presente sul cloud: se non
        // riusciamo a leggere lo stato attuale per fare il confronto, meglio
        // rimandare il salvataggio (ci riprova il prossimo cambiamento) che
        // scrivere alla cieca e rischiare di cancellare un'immagine.
        const resAttuale = await fetch(`https://api.github.com/gists/${nuovoId}`, {
          headers: { 'Authorization': `token ${tokenSyncRef.current}`, 'Accept': 'application/vnd.github.v3+json' },
        }).catch(() => null);
        if (!resAttuale || !resAttuale.ok) {
          if (!silenzioso) setCloudStatus({ text: 'Rete non raggiungibile: salvataggio rimandato per non rischiare di sovrascrivere dati più recenti.', type: 'error' });
          return;
        }
        const outAttuale = await resAttuale.json();
        const fileAttuale = outAttuale.files?.['roster_tavolo_dei_dadi.json'];
        if (fileAttuale) {
          const parsedAttuale = JSON.parse(fileAttuale.content);
          rosterDaInviare = preservaImmaginiSeMancanti(rosterCloud, parsedAttuale);
        }
      }
      const dati = JSON.stringify({ ...rosterDaInviare, _updatedAt: quando }, null, 2);
      const corpo = { files: { 'roster_tavolo_dei_dadi.json': { content: dati } } };

      if (nuovoId) {
        const res = await fetch(`https://api.github.com/gists/${nuovoId}`, {
          method: 'PATCH',
          headers: { 'Authorization': `token ${tokenSyncRef.current}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
          body: JSON.stringify(corpo),
        });
        if (!res.ok) throw new Error('Errore aggiornamento Gist. Token o ID non validi.');
      } else {
        const res = await fetch(`https://api.github.com/gists`, {
          method: 'POST',
          headers: { 'Authorization': `token ${tokenSyncRef.current}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: 'Salvataggio Cloud - Tavolo dei Dadi', public: false, ...corpo }),
        });
        if (!res.ok) throw new Error('Errore creazione Gist. Token non valido.');
        const out = await res.json();
        nuovoId = out.id;
        gistSyncRef.current = out.id;
        setGistId(out.id);
        localStorage.setItem('scheda-interattiva:gist-id', out.id);
      }
      const orario = new Date(quando).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      setUltimoSync(orario);
      localStorage.setItem('scheda-interattiva:ultimo-sync', orario);
      localStorage.setItem('scheda-interattiva:sync-ts', String(quando));
      segnaBackupFatto(); // il sync sul cloud conta come backup: azzera il promemoria
      setCloudStatus({ text: `✅ Sincronizzato · ${orario}`, type: 'success' });
      return nuovoId;
    } catch (err) {
      setCloudStatus({ text: err.message, type: 'error' });
    } finally {
      syncInCorsoRef.current = false;
      if (syncPendenteRef.current) {
        syncPendenteRef.current = false;
        setTimeout(() => salvaSuCloud(true), 0);
      } else {
        setSincronizzando(false);
      }
    }
  }

  /** Carica un Gist per id e lo applica come roster locale. Condivisa da
   *  caricaDaCloud() e da attivaBackupAuto() quando trova un backup esistente. */
  async function caricaGistById(id, tokenUsato) {
    const res = await fetchConTimeout(`https://api.github.com/gists/${id}`, {
      headers: { 'Authorization': `token ${tokenUsato}`, 'Accept': 'application/vnd.github.v3+json' },
    });
    if (!res.ok) throw new Error('Errore caricamento. Token o ID non validi.');
    const out = await res.json();
    const file = out.files['roster_tavolo_dei_dadi.json'];
    if (!file) throw new Error('Il file "roster_tavolo_dei_dadi.json" non è presente nel Gist.');
    const parsed = JSON.parse(file.content);
    const loadedRoster = { attivo: parsed.attivo, personaggi: {} };
    for (const pid in parsed.personaggi) loadedRoster.personaggi[pid] = normalizeImported(parsed.personaggi[pid]);
    if (!loadedRoster.attivo || !loadedRoster.personaggi[loadedRoster.attivo]) {
      loadedRoster.attivo = Object.keys(loadedRoster.personaggi)[0] || '';
    }
    const conImmaginiLocali = await caricaImmaginiRoster(loadedRoster).catch(() => loadedRoster);
    // Se il cloud non porta un'immagine per un personaggio già presente qui
    // (bug di sincronizzazione, upload non ancora arrivato, dato troppo grande...),
    // non cancellare quella già visibile su questo dispositivo.
    setRoster(preservaImmaginiSeMancanti(conImmaginiLocali, rosterSyncRef.current));
    if (parsed._updatedAt) localStorage.setItem('scheda-interattiva:sync-ts', String(parsed._updatedAt));
  }

  /** Attiva il backup automatico: abilita l'auto-sync e fa subito il primo salvataggio
   *  (che crea il Gist se non esiste). Basta averlo fatto una volta.
   *  Su un dispositivo nuovo (nessun Gist ID salvato) controlla prima se questo
   *  account ha già un backup creato da un altro dispositivo: altrimenti il
   *  primo salvataggio ne creerebbe uno nuovo e vuoto, "sdoppiando" i personaggi
   *  invece di farli comparire su questo dispositivo. */
  async function attivaBackupAuto() {
    const token = githubToken.trim();
    if (!token) {
      setCloudStatus({ text: 'Prima crea e incolla il token GitHub qui sopra.', type: 'error' });
      return;
    }
    if (!gistSyncRef.current) {
      try {
        setSincronizzando(true);
        setCloudStatus({ text: 'Controllo backup esistenti...', type: 'info' });
        const res = await fetchConTimeout('https://api.github.com/gists', {
          headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' },
        });
        if (res.ok) {
          const lista = await res.json();
          const esistente = lista.find((g) => g.files && g.files['roster_tavolo_dei_dadi.json']);
          if (esistente) {
            const usaEsistente = window.confirm('Trovato un backup già esistente su questo account GitHub, creato con un altro dispositivo.\n\nVuoi caricarlo su questo dispositivo invece di crearne uno nuovo e vuoto?');
            if (usaEsistente) {
              gistSyncRef.current = esistente.id;
              setGistId(esistente.id);
              localStorage.setItem('scheda-interattiva:gist-id', esistente.id);
              await caricaGistById(esistente.id, token);
              setCloudStatus({ text: '✅ Backup esistente caricato e sincronizzato!', type: 'success' });
              setAutoSync(true);
              localStorage.setItem('scheda-interattiva:auto-sync', 'on');
              return;
            }
          }
        }
      } catch {
        // Offline o rete lenta: si prosegue comunque con l'attivazione normale,
        // non deve bloccare chi sta configurando il backup per la prima volta.
      } finally {
        setSincronizzando(false);
      }
    }
    setAutoSync(true);
    localStorage.setItem('scheda-interattiva:auto-sync', 'on');
    await salvaSuCloud(false);
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
        const res = await fetchConTimeout(`https://api.github.com/gists/${gistId}`, {
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
          // Se il cloud non contiene ancora un'immagine, conserva quella già
          // archiviata sul dispositivo invece di cancellarla durante il merge.
          const conImmaginiLocali = await caricaImmaginiRoster(caricato).catch(() => caricato);
          setRoster(preservaImmaginiSeMancanti(conImmaginiLocali, rosterSyncRef.current));
          localStorage.setItem('scheda-interattiva:sync-ts', String(cloudTs));
          setCloudStatus({ text: '☁️ Personaggi caricati dal cloud', type: 'success' });
        }
      } catch {
        // Offline, GitHub lento o IndexedDB bloccato: il roster locale resta
        // già disponibile e l'overlay deve sempre scomparire.
        setCloudStatus({ text: 'Cloud non raggiungibile: uso i personaggi salvati sul dispositivo.', type: 'error' });
      }
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
      await caricaGistById(gistId, githubToken);
      setCloudStatus({ text: '✅ Roster caricato e sincronizzato!', type: 'success' });
    } catch (err) {
      setCloudStatus({ text: err.message, type: 'error' });
    } finally {
      setCaricandoCloud(false);
    }
  }

  // --- Sincronizzazione tramite codice (senza token GitHub) ---

  async function salvaSuCodiceSync(silenzioso = false) {
    if (!codiceSyncRef.current) return;
    if (syncCodiceInCorsoRef.current) {
      syncCodicePendenteRef.current = true;
      return;
    }
    syncCodiceInCorsoRef.current = true;
    try {
      if (!silenzioso) setSyncCodiceStatus({ text: 'Salvataggio in corso...', type: 'info' });
      const quando = Date.now();
      const rosterCloud = await caricaImmaginiRoster(rosterSyncRef.current).catch(() => rosterSyncRef.current);
      let rosterDaInviare = rosterCloud;
      try {
        const attuale = await caricaSync(URL_STANZE, codiceSyncRef.current);
        rosterDaInviare = preservaImmaginiSeMancanti(rosterCloud, attuale.roster);
      } catch (errAttuale) {
        // "Codice non ancora popolato" è l'unico caso in cui è sicuro procedere
        // senza il confronto: per qualsiasi altro errore (rete, rate limit...)
        // scrivere alla cieca rischierebbe di cancellare un'immagine più
        // recente salvata da un altro dispositivo con lo stesso codice.
        if (errAttuale.message !== 'SYNC_NOT_FOUND') {
          if (!silenzioso) setSyncCodiceStatus({ text: 'Rete non raggiungibile: salvataggio rimandato per non rischiare di sovrascrivere dati più recenti.', type: 'error' });
          return;
        }
      }
      await salvaSync(URL_STANZE, codiceSyncRef.current, rosterDaInviare, quando);
      const orario = new Date(quando).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      setUltimoSyncCodice(orario);
      localStorage.setItem('scheda-interattiva:ultimo-sync-codice', orario);
      localStorage.setItem('scheda-interattiva:sync-codice-ts', String(quando));
      segnaBackupFatto();
      setSyncCodiceStatus({ text: `✅ Sincronizzato · ${orario}`, type: 'success' });
    } catch (err) {
      setSyncCodiceStatus({ text: messaggioErroreSync(err.message), type: 'error' });
    } finally {
      syncCodiceInCorsoRef.current = false;
      if (syncCodicePendenteRef.current) {
        syncCodicePendenteRef.current = false;
        setTimeout(() => salvaSuCodiceSync(true), 0);
      }
    }
  }

  /** Applica al roster locale ciò che è salvato sotto un codice. Condivisa da
   *  caricaDaCodiceSync() e usaCodiceSyncEsistente(). */
  async function caricaDaCodiceSyncPer(codice) {
    const { roster: rosterRicevuto, updatedAt } = await caricaSync(URL_STANZE, codice);
    const caricato = { attivo: rosterRicevuto.attivo, personaggi: {} };
    for (const id in (rosterRicevuto.personaggi || {})) caricato.personaggi[id] = normalizeImported(rosterRicevuto.personaggi[id]);
    if (!caricato.attivo || !caricato.personaggi[caricato.attivo]) caricato.attivo = Object.keys(caricato.personaggi)[0] || '';
    const conImmaginiLocali = await caricaImmaginiRoster(caricato).catch(() => caricato);
    setRoster(preservaImmaginiSeMancanti(conImmaginiLocali, rosterSyncRef.current));
    if (updatedAt) localStorage.setItem('scheda-interattiva:sync-codice-ts', String(updatedAt));
    return updatedAt;
  }

  async function caricaDaCodiceSync() {
    if (!codiceSyncRef.current) {
      setSyncCodiceStatus({ text: 'Nessun codice attivo su questo dispositivo.', type: 'error' });
      return;
    }
    try {
      setCaricandoCloud(true);
      setSyncCodiceStatus({ text: 'Caricamento in corso...', type: 'info' });
      await caricaDaCodiceSyncPer(codiceSyncRef.current);
      setSyncCodiceStatus({ text: '✅ Roster caricato e sincronizzato!', type: 'success' });
    } catch (err) {
      setSyncCodiceStatus({ text: messaggioErroreSync(err.message), type: 'error' });
    } finally {
      setCaricandoCloud(false);
    }
  }

  /** Crea un nuovo codice su questo dispositivo e lo pubblica subito, così è
   *  pronto da digitare sull'altro dispositivo. */
  async function creaCodiceSync() {
    const nuovo = generaCodiceSync();
    codiceSyncRef.current = nuovo;
    setCodiceSync(nuovo);
    localStorage.setItem('scheda-interattiva:codice-sync', nuovo);
    setAutoSyncCodice(true);
    localStorage.setItem('scheda-interattiva:auto-sync-codice', 'on');
    await salvaSuCodiceSync(false);
  }

  /** Entra in un codice creato su un altro dispositivo: lo adotta come proprio
   *  e carica subito il roster che contiene. */
  async function usaCodiceSyncEsistente() {
    const pulito = normalizzaCodiceSync(codiceSyncInput);
    if (pulito.length !== 10) {
      setSyncCodiceStatus({ text: messaggioErroreSync('SYNC_INVALID_CODE'), type: 'error' });
      return;
    }
    try {
      setCaricandoCloud(true);
      setSyncCodiceStatus({ text: 'Caricamento in corso...', type: 'info' });
      await caricaDaCodiceSyncPer(pulito);
      codiceSyncRef.current = pulito;
      setCodiceSync(pulito);
      localStorage.setItem('scheda-interattiva:codice-sync', pulito);
      setAutoSyncCodice(true);
      localStorage.setItem('scheda-interattiva:auto-sync-codice', 'on');
      setCodiceSyncInput('');
      setSyncCodiceStatus({ text: '✅ Roster caricato e sincronizzato!', type: 'success' });
    } catch (err) {
      setSyncCodiceStatus({ text: messaggioErroreSync(err.message), type: 'error' });
    } finally {
      setCaricandoCloud(false);
    }
  }

  function disattivaSyncCodice() {
    setAutoSyncCodice(false);
    localStorage.setItem('scheda-interattiva:auto-sync-codice', 'off');
  }

  // Auto-salvataggio con codice: stessa logica di debounce del backup a token.
  const primoRenderSyncCodice = useRef(true);
  useEffect(() => {
    if (primoRenderSyncCodice.current) { primoRenderSyncCodice.current = false; return; }
    if (!autoSyncCodice || !codiceSync) return;
    const t = setTimeout(() => { salvaSuCodiceSync(true); }, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster, autoSyncCodice, codiceSync]);

  // Auto-caricamento all'avvio se un codice è già attivo su questo dispositivo
  // e il cloud ha una copia più recente di quella locale (stessa logica del
  // caricamento automatico col token, ma sulla chiave "sync-codice-ts").
  const autoCaricatoCodice = useRef(false);
  useEffect(() => {
    if (autoCaricatoCodice.current) return;
    autoCaricatoCodice.current = true;
    if (!codiceSync) return;
    (async () => {
      try {
        setCaricandoCloud(true);
        const { roster: rosterRicevuto, updatedAt } = await caricaSync(URL_STANZE, codiceSync);
        const localTs = Number(localStorage.getItem('scheda-interattiva:sync-codice-ts')) || 0;
        if (updatedAt <= localTs) return;
        const caricato = { attivo: rosterRicevuto.attivo, personaggi: {} };
        for (const id in (rosterRicevuto.personaggi || {})) caricato.personaggi[id] = normalizeImported(rosterRicevuto.personaggi[id]);
        if (!caricato.attivo || !caricato.personaggi[caricato.attivo]) caricato.attivo = Object.keys(caricato.personaggi)[0] || '';
        if (Object.keys(caricato.personaggi).length) {
          const conImmaginiLocali = await caricaImmaginiRoster(caricato).catch(() => caricato);
          setRoster(preservaImmaginiSeMancanti(conImmaginiLocali, rosterSyncRef.current));
          localStorage.setItem('scheda-interattiva:sync-codice-ts', String(updatedAt));
          setSyncCodiceStatus({ text: '☁️ Personaggi caricati dal codice di sincronizzazione', type: 'success' });
        }
      } catch {
        // Offline o codice non più valido: il roster locale resta comunque disponibile.
      } finally {
        setCaricandoCloud(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const critico = tiro?.naturale === 20;
  const fallimento = tiro?.naturale === 1;
  const dannoAttaccoValido = tiro?.attacco && parseEspressioneDado(tiro.attacco.danno || '');
  const percezionePassiva = 10 + bonusAbilita(scheda, 'percezione');
  const indagarePassivo = 10 + bonusAbilita(scheda, 'indagare');
  const intuizionePassiva = 10 + bonusAbilita(scheda, 'intuizione');
  const modIncantatore = caratteristicaIncantatore
    ? modificatore(punteggioCaratteristica(scheda, caratteristicaIncantatore))
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
  const classePreparata = classePreparaIncantesimi(scheda.classe);
  const maxLivelloPreparabile = Math.max(0, ...Object.entries(scheda.slotIncantesimo || {})
    .filter(([, slot]) => Number(slot?.totale) > 0)
    .map(([livello]) => Number(livello) || 0));
  const chiaviIncantesimiSalvati = new Set(scheda.incantesimiLista
    .filter((s) => s.livello >= 1)
    .map((s) => `${s.livello}:${String(s.nome || '').toLocaleLowerCase('it')}`));
  const incantesimiVisualizzati = classePreparata
    ? [
        ...scheda.incantesimiLista,
        ...catalogoIncantesimiPreparabili(scheda.classe)
          .filter((s) => s.livello <= maxLivelloPreparabile && !chiaviIncantesimiSalvati.has(`${s.livello}:${s.nome.toLocaleLowerCase('it')}`))
          .map((s) => ({ ...s, id: `catalogo-${s.livello}-${s.nome}`, catalogo: true, preparato: false })),
      ]
    : scheda.incantesimiLista;
  const nPreparati = scheda.incantesimiLista.filter((s) => s.livello > 0 && !s.bonus && s.preparato !== false).length;
  // base = override manuale (>0) oppure automatico da classe/livello/versione
  const baseTrucchetti = (scheda.maxTrucchetti > 0) ? scheda.maxTrucchetti : trucchettiMax(scheda.classe, scheda.livello, scheda.sottoclasse);
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

  // Avvisi in sospeso e novità non ancora lette: pilotano il puntino rosso
  // lampeggiante sul pulsante 🔔 dell'intestazione.
  const controlliAttivi = useMemo(() => {
    if (!scheda) return [];
    const ignorati = scheda.controlliIgnorati || [];
    return controlliScheda(scheda).filter((r) => !ignorati.includes(r.id));
  }, [scheda]);
  const avvisoBackup = promemoriaBackup && !mostraGuida;
  const nAvvisi = (avvisoBackup ? 1 : 0) + controlliAttivi.length;
  const novitaNonLette = novitaViste !== ultimaVersioneNovita();
  const daNotificare = nAvvisi > 0 || novitaNonLette;

  function apriAvvisi() {
    if (!mostraAvvisi) {
      const r = avvisiBtnRef.current?.getBoundingClientRect();
      if (r) setPosAvvisi({
        top: Math.max(8, Math.min(window.innerHeight - 200, r.bottom + 5)),
        left: Math.max(8, Math.min(window.innerWidth - 330, r.left)),
      });
      // Aprendo il pannello le novità risultano lette: il puntino si spegne.
      const ultima = ultimaVersioneNovita();
      setNovitaViste(ultima);
      try { localStorage.setItem('scheda-interattiva:novita-viste', ultima); } catch { /* niente */ }
    }
    setMostraAvvisi((v) => !v);
  }

  return (
    <div className="app-shell" style={styles.app}>
      <style>{GLOBAL_CSS}</style>

      {erroreSalvataggio && (
        <div className="no-stampa" style={{ position: 'sticky', top: 0, zIndex: 10000, padding: '10px 14px', background: '#8b1e1e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', boxShadow: '0 3px 12px rgba(0,0,0,0.35)', fontSize: 13, fontWeight: 700 }}>
          <span>⚠️ {erroreSalvataggio}</span>
          <button style={{ ...styles.buttonMini, background: '#fff', color: '#8b1e1e', borderColor: '#fff' }} onClick={esportaJson}>⬇️ Esporta JSON</button>
        </div>
      )}

      {nuovaVersione && (
        <div className="no-stampa" style={{
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
          <span>🚀 È disponibile una nuova versione del Tavolo dei Dadi (attuale: {APP_VERSION})!</span>
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
        const bonusCon = bonusTiroSalvezza(scheda, 'costituzione');
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
              onClick={() => { setBozzaCrea({ nome: '', sesso: '', classe: '', sottoclasse: '', specie: '', background: '', livello: 1, metodo: 'auto', pool: null, assegna: {}, competenzeClasse: [], competenzeSpecie: [], maestria: [], talentoOrigine: '', asiTalenti: {}, multiclasseClasse2: '', multiclasseLivello2: 1, sottoclasseMc2: '', multiclasseClasse3: '', multiclasseLivello3: 1, sottoclasseMc3: '', dotazione: 'pacchetto' }); setMostraCrea(true); }}
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
                      onConferma: () => {
                        if (URL_ARCHIVIO_PG) {
                          fetch(`${URL_ARCHIVIO_PG.replace(/\/+$/, '')}/pg`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ dispositivo: idDispositivo, id }),
                            keepalive: true,
                          }).catch(() => {});
                        }
                        setRoster((r) => {
                          const nuovi = { ...r.personaggi };
                          delete nuovi[id];
                          const nuovoAttivo = r.attivo === id ? (Object.keys(nuovi)[0] ?? '') : r.attivo;
                          if (Object.keys(nuovi).length === 0) setTimeout(() => setMostraMenu(true), 0);
                          return { personaggi: nuovi, attivo: nuovoAttivo };
                        });
                      },
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

            {/* Colonne uguali: i pulsanti hanno tutti la stessa larghezza. */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
              <button style={{ ...styles.button, width: '100%' }} onClick={() => jsonRef.current?.click()}>{t('menu.da_file')}</button>
              <button
                style={{ ...styles.button, width: '100%' }}
                onClick={() => generaPgCasuale()}
                title={t('menu.pg_casuale_tooltip')}
              >
                {t('menu.pg_casuale')}
              </button>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <div style={{ ...styles.detail, marginBottom: 8, fontWeight: 700 }}>🤖 Importa da file (IA) — PDF/JPG/PNG</div>
              <input ref={pdfRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/gif" multiple style={{ display: 'none' }} onChange={transcribePdf} />
              <button style={{ ...styles.modeButton(false), width: '100%' }} onClick={() => pdfRef.current?.click()} disabled={pdfStato === 'loading'}>
                {pdfStato === 'loading' ? '⏳ Trascrizione IA in corso…' : '🤖 Importa da PDF/JPG (IA)'}
              </button>
              <div style={{ ...styles.detail, fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>Gratis via Cloudflare Workers AI per JPG/PNG/WebP (zero chiavi). PDF richiede ANTHROPIC_API_KEY sul Worker.</div>
              {pdfStato === 'loading' && <div style={{ ...styles.detail, fontSize: 12, marginTop: 6, color: C.goldDark }}>Lettura in corso…</div>}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <div style={{ ...styles.detail, marginBottom: 8, fontWeight: 700 }}>🔗 Condividi / Esporta</div>
              <button style={{ ...styles.button, width: '100%' }} onClick={() => { condividiLink(); setMostraMenu(false); }} title={t('condividi.tooltip')}>
                🔗 {t('stanze.link')} <span style={{ opacity: 0.7, fontSize: 11 }}>(link = esporta)</span>
              </button>
              <div style={{ ...styles.detail, fontSize: 11, marginTop: 4 }}>Il link contiene la scheda come un file esportato, senza server.</div>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <div style={{ ...styles.detail, marginBottom: 8 }}>🛟 Backup di sicurezza (tutti i personaggi in un file):</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                <button style={{ ...styles.button, width: '100%', borderColor: C.gold, color: C.goldDark }} onClick={esportaBackupCompleto} title="Scarica un file con TUTTI i tuoi personaggi">💾 Backup completo</button>
                <button style={{ ...styles.button, width: '100%' }} onClick={() => jsonRef.current?.click()} title="Ripristina da un file di backup o importa una scheda">📂 Ripristina / Importa</button>
                {leggiSnapshots().length > 0 && (
                  <button style={{ ...styles.button, width: '100%', gridColumn: '1 / -1' }} onClick={() => setMostraRipristino(true)} title="Annulla una modifica o cancellazione recente">🕓 Versioni precedenti</button>
                )}
              </div>
            </div>
            {URL_ARCHIVIO_PG && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                <button
                  style={{ ...styles.button, width: '100%' }}
                  onClick={() => { setMostraArchivioDm(true); }}
                  title="Solo per il DM: elenco delle schede create dagli utenti (serve la chiave)"
                >
                  🗂 Archivio DM
                </button>
              </div>
            )}
            {erroreImport && <div style={{ color: C.red, marginTop: 10 }}>{erroreImport}</div>}
          </div>
        </div>
      )}

      {mostraArchivioDm && (
        <ArchivioDm
          url={URL_ARCHIVIO_PG}
          onChiudi={() => setMostraArchivioDm(false)}
          onApri={(s) => { nuovoPersonaggio(normalizeImported(s)); setMostraArchivioDm(false); setMostraMenu(false); }}
        />
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
            <h1 style={{ ...styles.title, textAlign: 'center', marginBottom: 8 }}>🛟 Backup automatico</h1>

            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, marginBottom: 16 }}>
              <div style={{ ...styles.detail, fontWeight: 'bold', marginBottom: 6 }}>🔗 Sincronizza con un codice (senza account)</div>
              {codiceSync && autoSyncCodice ? (
                <>
                  <p style={{ ...styles.detail, fontSize: 12, marginTop: 0, marginBottom: 8, lineHeight: 1.5 }}>
                    Digita questo stesso codice sull'altro dispositivo per collegarlo.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ color: C.goldDark, fontSize: 20, fontWeight: 800, letterSpacing: 2, fontFamily: 'monospace' }}>{formattaCodiceSync(codiceSync)}</div>
                    <button style={styles.buttonMini} onClick={() => navigator.clipboard?.writeText(formattaCodiceSync(codiceSync))}>📋</button>
                  </div>
                  {ultimoSyncCodice && <div style={{ ...styles.detail, fontSize: 11, marginBottom: 8 }}>Ultimo salvataggio: {ultimoSyncCodice}</div>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ ...styles.button, flex: 1 }} onClick={caricaDaCodiceSync}>⬇️ Carica ora</button>
                    <button style={styles.buttonMini} onClick={disattivaSyncCodice}>Disattiva</button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ ...styles.detail, fontSize: 12, marginTop: 0, marginBottom: 8, lineHeight: 1.5 }}>
                    Crea un codice a 10 caratteri su questo dispositivo e digitalo sull'altro per collegarli, senza account né password.
                  </p>
                  <button style={{ ...styles.buttonPrimary, width: '100%', marginBottom: 10 }} onClick={creaCodiceSync}>🆕 Crea un nuovo codice</button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      style={{ ...styles.inlineInput, flex: 1, padding: '6px 8px', fontSize: 15, fontFamily: 'monospace', textTransform: 'uppercase' }}
                      placeholder="XXXXX-XXXXX"
                      value={formattaCodiceSync(codiceSyncInput)}
                      onChange={(e) => setCodiceSyncInput(normalizzaCodiceSync(e.target.value))}
                      onKeyDown={(e) => { if (e.key === 'Enter' && normalizzaCodiceSync(codiceSyncInput).length === 10) usaCodiceSyncEsistente(); }}
                    />
                    <button style={styles.buttonPrimary} disabled={normalizzaCodiceSync(codiceSyncInput).length !== 10} onClick={usaCodiceSyncEsistente}>Usa</button>
                  </div>
                </>
              )}
              {syncCodiceStatus.text && (
                <div style={{ marginTop: 10, padding: 8, borderRadius: 6, background: syncCodiceStatus.type === 'error' ? 'rgba(255,0,0,0.1)' : syncCodiceStatus.type === 'success' ? 'rgba(0,255,0,0.1)' : 'rgba(255,255,255,0.05)', color: syncCodiceStatus.type === 'error' ? C.red : syncCodiceStatus.type === 'success' ? C.green : C.goldDark, fontSize: 12, textAlign: 'center' }}>
                  {syncCodiceStatus.text}
                </div>
              )}
            </div>



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
                {traduciDato(scheda.classe) || '—'}{scheda.sottoclasse ? ` · ${traduciDato(scheda.sottoclasse)}` : ''} · Liv. {liv} · {versione === '2024' ? 'D&D 5.5' : 'D&D 5.0'}
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
                    {sub && <div style={{ color: C.green }}>🌟 {t('priv.sottoclasse')}{scheda.sottoclasse ? ` (${traduciDato(scheda.sottoclasse)})` : ''}</div>}
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

      {mostraPrivilegiSub && (() => {
        const liv = Math.max(1, Math.min(20, scheda.livello || 1));
        const tab = SUBCLASS_PRIVILEGI[scheda.sottoclasse] || {};
        const righe = [];
        for (let L = 1; L <= 20; L++) if (tab[L]) righe.push({ L, feat: tab[L], futuro: L > liv });
        return (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1003, padding: 16, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={(e) => { if (e.target === e.currentTarget) setMostraPrivilegiSub(false); }}
          >
            <div style={{ ...styles.panel, maxWidth: 520, width: '100%', maxHeight: '88vh', overflowY: 'auto' }}>
              <h1 style={{ ...styles.title, textAlign: 'center', marginBottom: 4 }}>📖 {t('priv.panoramica_sub')}</h1>
              <div style={{ textAlign: 'center', ...styles.detail, marginBottom: 12 }}>
                {traduciDato(scheda.sottoclasse) || '—'} · {traduciDato(scheda.classe) || '—'} · Liv. {liv} · {versione === '2024' ? 'D&D 5.5' : 'D&D 5.0'}
              </div>
              {righe.length === 0 && <p style={styles.detail}>{t('priv.nessuno')}</p>}
              {righe.map(({ L, feat, futuro }) => (
                <div key={L} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: `1px solid ${C.border}`, opacity: futuro ? 0.5 : 1 }}>
                  <div style={{ flexShrink: 0, width: 44, fontWeight: 'bold', color: futuro ? C.inkDim : C.goldDark }}>
                    {t('priv.livello')} {L}
                  </div>
                  <div style={{ flex: 1, fontSize: 13 }}>
                    {feat.split('\n').map((r, i) => {
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
                    {futuro && <span style={{ ...styles.detail, fontStyle: 'italic' }}>— {t('priv.futuro')}</span>}
                  </div>
                </div>
              ))}
              <p style={{ ...styles.detail, marginTop: 10, fontSize: 11 }}>{t('priv.aiuto_sub')}</p>
              <button style={{ ...styles.button, width: '100%', marginTop: 6 }} onClick={() => setMostraPrivilegiSub(false)}>{t('modal.chiudi')}</button>
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
        const modCos = modificatore(punteggioCaratteristica(scheda, 'costituzione') || 10) || 0;
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

        // La sottoclasse "terzo incantatore" (Cavaliere Mistico/Mistificatore
        // Arcano) è nota solo per la classe principale: le classi secondarie da
        // multiclasse non hanno un campo sottoclasse proprio in questa app.
        const targetSottoclasse = (!isNewMc && !isSecMc) ? scheda.sottoclasse : undefined;

        const isTotMc = classiNuove.filter((c) => c && c.classe).length > 1;
        const slotNuovi = isTotMc ? slotMulticlasse(classiNuove) : slotDaClasseLivello(targetClasse, targetLivelloNuovo, targetSottoclasse);
        const slotVecchi = isTotMc ? slotMulticlasse([{ classe: scheda.classe, livello: Math.max(1, num(scheda.livello, 1)) }, ...mcArray]) : slotDaClasseLivello(scheda.classe, Math.max(1, num(scheda.livello, 1)), scheda.sottoclasse);

        const slotStr = slotNuovi
          ? Object.keys(slotNuovi).filter((l) => slotNuovi[l].totale > 0).map((l) => `${l}° ×${slotNuovi[l].totale}`).join(' · ')
          : null;

        const trOld = trucchettiMax(targetClasse, targetLivelloVecchio, targetSottoclasse);
        const trNew = trucchettiMax(targetClasse, targetLivelloNuovo, targetSottoclasse);
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
                  {[...scelteSub].sort((a, b) => traduciDato(a).localeCompare(traduciDato(b), lingua)).map((s) => <option key={s} value={s}>{traduciDato(s)}</option>)}
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
                      {[...TALENTI_5E].sort((a, b) => a.nome.localeCompare(b.nome, lingua)).map((tl) => <option key={tl.nome} value={tl.nome}>{tl.nome} — {tl.desc}</option>)}
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
                          {[...CARATTERISTICHE].sort((a, b) => t('attr.' + a.key).localeCompare(t('attr.' + b.key), lingua)).map(({ key }) => <option key={key} value={key}>{t('attr.' + key)}</option>)}
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
        const bonusRazza = regoleVersione === '2014' ? bonusCaratteristicheSpecie2014(bozzaCrea.specie, bozzaCrea.classe) : {};
        return (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1001, padding: 16, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={(e) => { if (e.target === e.currentTarget) setMostraCrea(false); }}
          >
            <div style={{ ...styles.panel, maxWidth: 460, width: '100%', maxHeight: '88vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, position: 'relative' }}>
                <h1 style={{ ...styles.title, margin: 0 }}>{t('menu.nuovo_personaggio')}</h1>
                <button
                  style={{ ...styles.buttonMini, position: 'absolute', right: 0, borderRadius: '50%', width: 26, height: 26, padding: 0, fontWeight: 'bold' }}
                  title={lingua === 'it' ? 'Come funziona l’app (tutorial)' : 'How the app works (tutorial)'}
                  onClick={() => setMostraGuida(true)}
                >ℹ️</button>
              </div>

              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
                <span style={styles.detail}>{t('crea.versione')}</span>
                {['2024', '2014'].map((v) => (
                  <button key={v} style={{ ...styles.modeButton(regoleVersione === v), fontSize: 12, padding: '3px 10px' }} onClick={() => { setRegoleVersione(v); setB({ sottoclasse: '' }); }}>
                    {v === '2024' ? 'D&D 5.5' : 'D&D 5.0'}
                  </button>
                ))}
              </div>

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>{t('crea.nome')}</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <input style={{ ...stileSelect, flex: 1, marginBottom: 0 }} value={bozzaCrea.nome} placeholder={t('crea.nome_placeholder')} onChange={(e) => setB({ nome: e.target.value })} />
                <button style={styles.buttonMini} title={t('crea.genera_nome')} onClick={() => setB({ nome: nomeCasuale(bozzaCrea.specie) })}>🎲</button>
              </div>

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>{t('profilo.sesso')}</label>
              <select style={{ ...stileSelect, marginBottom: 12 }} value={bozzaCrea.sesso} onChange={(e) => setB({ sesso: e.target.value })}>
                <option value="">{t('profilo.sesso_non_specificato')}</option>
                <option value="maschio">{t('profilo.sesso_maschio')}</option>
                <option value="femmina">{t('profilo.sesso_femmina')}</option>
                <option value="altro">{t('profilo.sesso_altro')}</option>
              </select>

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>{regoleVersione === '2024' ? t('crea.specie') : t('crea.razza')}</label>
              <select style={{ ...stileSelect, marginBottom: bozzaCrea.specie ? 4 : 12 }} value={bozzaCrea.specie} onChange={(e) => setB({ specie: e.target.value, competenzeSpecie: [] })}>
                <option value="">{t('crea.scegli')}</option>
                {Object.entries(SPECIE_5E).map(([g, opts]) => (
                  <optgroup key={g} label={g}>
                    {[...opts].sort((a, b) => nomeSpeciePerSesso(a, bozzaCrea.sesso, lingua).localeCompare(nomeSpeciePerSesso(b, bozzaCrea.sesso, lingua), lingua)).map((n) => <option key={n} value={n}>{nomeSpeciePerSesso(n, bozzaCrea.sesso, lingua)}</option>)}
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
                      💪 {t('crea.bonus_car')}: {regoleVersione === '2024'
                        ? t('crea.bonus_bg')
                        : (riepilogoBonusCaratt(bonusRazza) || t('crea.bonus_razza'))}
                    </div>
                  </div>
                );
              })()}

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>{t('crea.classe')}</label>
              <select style={{ ...stileSelect, marginBottom: 12 }} value={bozzaCrea.classe} onChange={(e) => setB({ classe: e.target.value, sottoclasse: '', competenzeClasse: [] })}>
                <option value="">{t('crea.scegli')}</option>
                {[...NOMI_CLASSI].sort((a, b) => a.localeCompare(b, lingua)).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>

              {/* Livello iniziale: crea subito un PG di livello alto senza fare Level Up a mano */}
              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>{lingua === 'it' ? '🎚️ Livello iniziale' : '🎚️ Starting level'}</label>
              <select style={{ ...stileSelect, marginBottom: 12 }} value={bozzaCrea.livello} onChange={(e) => {
                const livello = Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1));
                setB({ livello, sottoclasse: livello < livelloSceltaSottoclasse(bozzaCrea.classe, regoleVersione) ? '' : bozzaCrea.sottoclasse });
              }}>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{lingua === 'it' ? `Livello ${n}` : `Level ${n}`}</option>)}
              </select>

              {/* Multiclasse: classe e livello della classe principale prima,
                  poi il flag e la classe/livello della seconda, in quest'ordine
                  per rendere più chiaro il flusso di creazione. */}
              {bozzaCrea.classe && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ ...styles.detail, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 'bold' }}>
                    <input
                      type="checkbox"
                      checked={!!bozzaCrea.multiclasseClasse2}
                      onChange={(e) => setB({ multiclasseClasse2: e.target.checked ? (NOMI_CLASSI.find((n) => n !== bozzaCrea.classe) || '') : '', multiclasseLivello2: 1 })}
                    />
                    ➕ {lingua === 'it' ? 'Multiclasse: aggiungi una seconda classe' : 'Multiclass: add a second class'}
                  </label>
                  {bozzaCrea.multiclasseClasse2 && (() => {
                    const maxLiv2 = Math.max(1, 20 - Number(bozzaCrea.livello || 1));
                    const serveSubMc2 = Number(bozzaCrea.multiclasseLivello2 || 1) >= livelloSceltaSottoclasse(bozzaCrea.multiclasseClasse2, regoleVersione);
                    const scelteSubMc2 = serveSubMc2 ? sottoclassiPerClasse(bozzaCrea.multiclasseClasse2) : [];
                    return (
                      <>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          <select style={{ ...stileSelect, flex: 2 }} value={bozzaCrea.multiclasseClasse2} onChange={(e) => setB({ multiclasseClasse2: e.target.value, sottoclasseMc2: '' })}>
                            {[...NOMI_CLASSI].filter((n) => n !== bozzaCrea.classe).sort((a, b) => a.localeCompare(b, lingua)).map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                          <select style={{ ...stileSelect, flex: 1 }} value={Math.min(bozzaCrea.multiclasseLivello2 || 1, maxLiv2)} onChange={(e) => setB({ multiclasseLivello2: Math.max(1, Math.min(maxLiv2, parseInt(e.target.value, 10) || 1)), sottoclasseMc2: '' })}>
                            {Array.from({ length: maxLiv2 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{lingua === 'it' ? `Liv. ${n}` : `Lv. ${n}`}</option>)}
                          </select>
                        </div>
                        {serveSubMc2 && scelteSubMc2.length > 0 && (
                          <select style={{ ...stileSelect, marginTop: 6 }} value={bozzaCrea.sottoclasseMc2} onChange={(e) => setB({ sottoclasseMc2: e.target.value })}>
                            <option value="">{lingua === 'it' ? `⚔️ Sottoclasse (${bozzaCrea.multiclasseClasse2}) — scegli...` : `⚔️ Subclass (${bozzaCrea.multiclasseClasse2}) — choose...`}</option>
                            {[...scelteSubMc2].sort((a, b) => a.localeCompare(b, lingua)).map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
              {bozzaCrea.multiclasseClasse2 && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ ...styles.detail, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 'bold' }}>
                    <input
                      type="checkbox"
                      checked={!!bozzaCrea.multiclasseClasse3}
                      onChange={(e) => setB({ multiclasseClasse3: e.target.checked ? (NOMI_CLASSI.find((n) => n !== bozzaCrea.classe && n !== bozzaCrea.multiclasseClasse2) || '') : '', multiclasseLivello3: 1 })}
                    />
                    ➕ {lingua === 'it' ? 'Triclasse: aggiungi una terza classe' : 'Triclass: add a third class'}
                  </label>
                  {bozzaCrea.multiclasseClasse3 && (() => {
                    const maxLiv3 = Math.max(1, 20 - Number(bozzaCrea.livello || 1) - Number(bozzaCrea.multiclasseLivello2 || 1));
                    const serveSubMc3 = Number(bozzaCrea.multiclasseLivello3 || 1) >= livelloSceltaSottoclasse(bozzaCrea.multiclasseClasse3, regoleVersione);
                    const scelteSubMc3 = serveSubMc3 ? sottoclassiPerClasse(bozzaCrea.multiclasseClasse3) : [];
                    return (
                      <>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          <select style={{ ...stileSelect, flex: 2 }} value={bozzaCrea.multiclasseClasse3} onChange={(e) => setB({ multiclasseClasse3: e.target.value, sottoclasseMc3: '' })}>
                            {[...NOMI_CLASSI].filter((n) => n !== bozzaCrea.classe && n !== bozzaCrea.multiclasseClasse2).sort((a, b) => a.localeCompare(b, lingua)).map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                          <select style={{ ...stileSelect, flex: 1 }} value={Math.min(bozzaCrea.multiclasseLivello3 || 1, maxLiv3)} onChange={(e) => setB({ multiclasseLivello3: Math.max(1, Math.min(maxLiv3, parseInt(e.target.value, 10) || 1)), sottoclasseMc3: '' })}>
                            {Array.from({ length: maxLiv3 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{lingua === 'it' ? `Liv. ${n}` : `Lv. ${n}`}</option>)}
                          </select>
                        </div>
                        {serveSubMc3 && scelteSubMc3.length > 0 && (
                          <select style={{ ...stileSelect, marginTop: 6 }} value={bozzaCrea.sottoclasseMc3} onChange={(e) => setB({ sottoclasseMc3: e.target.value })}>
                            <option value="">{lingua === 'it' ? `⚔️ Sottoclasse (${bozzaCrea.multiclasseClasse3}) — scegli...` : `⚔️ Subclass (${bozzaCrea.multiclasseClasse3}) — choose...`}</option>
                            {[...scelteSubMc3].sort((a, b) => a.localeCompare(b, lingua)).map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Aumenti di caratteristica dei livelli già superati: per ognuno si
                  può scegliere +2 automatico o un talento (come nel Level Up). */}
              {bozzaCrea.classe && (() => {
                const asi = livelliASI(bozzaCrea.classe).filter((l) => l <= Number(bozzaCrea.livello || 1));
                if (!asi.length) return null;
                const talentiOrdinati = [...TALENTI_5E].sort((a, b) => a.nome.localeCompare(b.nome, lingua));
                return (
                  <div style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', marginTop: -6, marginBottom: 12, fontSize: 11 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 6, color: C.inkDim }}>
                      💪 {asi.length} {asi.length > 1 ? 'aumenti' : 'aumento'} di caratteristica (livello{asi.length > 1 ? 'i' : ''} {asi.join(', ')})
                    </div>
                    {asi.map((lv) => {
                      const scelta = bozzaCrea.asiTalenti?.[lv] || '';
                      return (
                        <div key={lv} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ minWidth: 44 }}>Liv. {lv}</span>
                          <button
                            style={{ ...styles.modeButton(!scelta), fontSize: 10, padding: '2px 7px' }}
                            onClick={() => setB({ asiTalenti: { ...bozzaCrea.asiTalenti, [lv]: '' } })}
                          >+2 auto</button>
                          <select
                            value={scelta}
                            onChange={(e) => setB({ asiTalenti: { ...bozzaCrea.asiTalenti, [lv]: e.target.value } })}
                            style={{ ...styles.inlineInput, fontSize: 11, padding: '2px 4px', flex: '1 1 150px', minWidth: 0 }}
                          >
                            <option value="">— o scegli un talento —</option>
                            {talentiOrdinati.map((tl) => <option key={tl.nome} value={tl.nome}>{tl.nome}</option>)}
                          </select>
                        </div>
                      );
                    })}
                    <div style={{ color: C.inkDim, marginTop: 2 }}>Il +2 va alle caratteristiche più utili alla classe (max 20); puoi ritoccare tutto a mano dopo la creazione.</div>
                  </div>
                );
              })()}

              {/* Talento di Origine (2024): il background lo concede già al 1° livello. */}
              {regoleVersione === '2024' && bozzaCrea.background && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ ...styles.detail, display: 'block', marginBottom: 3, fontWeight: 'bold' }}>🎖️ Talento di Origine (dal background)</label>
                  <select value={bozzaCrea.talentoOrigine} onChange={(e) => setB({ talentoOrigine: e.target.value })} style={stileSelect}>
                    <option value="">{t('crea.scegli')}</option>
                    {[...TALENTI_5E].sort((a, b) => a.nome.localeCompare(b.nome, lingua)).map((tl) => <option key={tl.nome} value={tl.nome}>{tl.nome} — {tl.desc}</option>)}
                  </select>
                </div>
              )}

              {bozzaCrea.classe && Number(bozzaCrea.livello) >= livelloSceltaSottoclasse(bozzaCrea.classe, regoleVersione) && (
                <>
                  <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>⚔️ {lingua === 'it' ? 'Sottoclasse' : 'Subclass'}</label>
                  <select style={{ ...stileSelect, marginBottom: 12 }} value={bozzaCrea.sottoclasse} onChange={(e) => setB({ sottoclasse: e.target.value })}>
                    <option value="">{t('crea.scegli')}</option>
                    {[...sottoclassiPerClasse(bozzaCrea.classe)].sort((a, b) => a.localeCompare(b, lingua)).map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </>
              )}

              <label style={{ ...styles.detail, display: 'block', marginBottom: 3 }}>{t('crea.background')}</label>
              <select style={{ ...stileSelect, marginBottom: 6 }} value={bozzaCrea.background} onChange={(e) => setB({ background: e.target.value })}>
                <option value="">{t('crea.scegli')}</option>
                {[...BACKGROUND_5E].sort((a, b) => a.localeCompare(b, lingua)).map((n) => <option key={n} value={n}>{n}</option>)}
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
                const tutte = cs.lista.length === ABILITA.length;
                const pieno = scelte.length >= cs.numero;
                const toggle = (k) => {
                  if (scelte.includes(k)) setB({ competenzeSpecie: scelte.filter((x) => x !== k) });
                  else if (!pieno) setB({ competenzeSpecie: [...scelte, k] });
                };
                return (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ ...styles.detail, display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                      {t('crea.competenze_specie')} · {cs.tratto} — {t('crea.scegli_n')} {cs.numero} <span style={{ fontWeight: 'normal', color: pieno ? C.green : C.inkDim }}>({scelte.length}/{cs.numero})</span>
                      {tutte && <span style={{ fontWeight: 'normal', color: C.inkDim }}> · {t('crea.competenze_specie_tutte')}</span>}
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

              {/* Maestria/Expertise (Ladro, Bardo): doppia competenza fra le abilità già scelte. */}
              {(() => {
                const nMaestria = maestriaSlotDisponibili(bozzaCrea.classe, bozzaCrea.livello, regoleVersione);
                if (!nMaestria) return null;
                const bgSkills = BACKGROUND_COMPETENZE[bozzaCrea.background] || [];
                const pool = [...new Set([...bgSkills, ...(bozzaCrea.competenzeClasse || []), ...(bozzaCrea.competenzeSpecie || [])])];
                const scelte = bozzaCrea.maestria || [];
                const pieno = scelte.length >= nMaestria;
                const toggle = (k) => {
                  if (scelte.includes(k)) setB({ maestria: scelte.filter((x) => x !== k) });
                  else if (!pieno) setB({ maestria: [...scelte, k] });
                };
                return (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ ...styles.detail, display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                      ✦ {lingua === 'it' ? 'Maestria' : 'Expertise'} ({lingua === 'it' ? 'doppia competenza' : 'double proficiency'}) — {t('crea.scegli_n')} {nMaestria} <span style={{ fontWeight: 'normal', color: pieno ? C.green : C.inkDim }}>({scelte.length}/{nMaestria})</span>
                    </label>
                    {!pool.length ? (
                      <div style={{ ...styles.detail, fontSize: 11 }}>{lingua === 'it' ? 'Scegli prima le competenze di background/classe/specie: la Maestria si applica solo ad abilità già competenti.' : 'Choose background/class/species proficiencies first: Expertise only applies to skills you are already proficient in.'}</div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {pool.map((k) => {
                          const lab = t('skill.' + k);
                          const sel = scelte.includes(k);
                          return (
                            <button key={k} disabled={!sel && pieno} onClick={() => toggle(k)} style={{ ...styles.modeButton(sel), fontSize: 11, padding: '3px 8px' }}>
                              {sel ? '✦ ' : ''}{lab}
                            </button>
                          );
                        })}
                      </div>
                    )}
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
                {(() => {
                  // A livello alto la sottoclasse non è facoltativa: un Mago di 7°
                  // senza Tradizione Arcana non esiste. Blocchiamo la creazione.
                  // Stesso discorso per la classe secondaria da multiclasse.
                  const serveSub = !!bozzaCrea.classe
                    && Number(bozzaCrea.livello) >= livelloSceltaSottoclasse(bozzaCrea.classe, regoleVersione)
                    && !bozzaCrea.sottoclasse;
                  const serveSubMc2 = !!bozzaCrea.multiclasseClasse2
                    && Number(bozzaCrea.multiclasseLivello2 || 1) >= livelloSceltaSottoclasse(bozzaCrea.multiclasseClasse2, regoleVersione)
                    && sottoclassiPerClasse(bozzaCrea.multiclasseClasse2).length > 0
                    && !bozzaCrea.sottoclasseMc2;
                  const bloccato = serveSub || serveSubMc2;
                  return (
                    <button
                      style={{ ...styles.buttonPrimary, flex: 1, opacity: bloccato ? 0.5 : 1, cursor: bloccato ? 'not-allowed' : 'pointer' }}
                      disabled={bloccato}
                      title={bloccato ? (lingua === 'it' ? 'Scegli prima la sottoclasse: a questo livello è obbligatoria.' : 'Choose a subclass first: it is required at this level.') : ''}
                      onClick={() => creaPersonaggio(bozzaCrea)}
                    >
                      {t('crea.crea_pg')}
                    </button>
                  );
                })()}
                <button style={styles.button} onClick={() => setMostraCrea(false)}>{t('modal.annulla')}</button>
              </div>
            </div>
          </div>
        );
      })()}

      <header className="app-header" style={styles.header}>
        <div className="app-header-side">
        <div className="app-header-group">
          <button
            style={styles.modeButton(false)}
            title={t('tip.menu_iniziale')}
            onClick={() => setMostraMenu(true)}
          >
            🏠 <span className="header-label">Menu</span>
          </button>
          <button
            style={{ ...styles.modeButton(mostraCloud), color: C.goldDark, borderColor: C.goldDark }}
            title={githubToken && gistId ? (autoSync ? `Cloud: salvataggio automatico attivo${ultimoSync ? ` · ultimo ${ultimoSync}` : ''}` : 'Cloud configurato (auto-salvataggio spento)') : (codiceSync && autoSyncCodice ? `Sincronizzato con codice${ultimoSyncCodice ? ` · ultimo ${ultimoSyncCodice}` : ''}` : 'Sincronizza i tuoi personaggi sul Cloud')}
            onClick={() => { setCloudStatus({ text: '', type: '' }); setMostraCloud(true); }}
          >
            ☁️ <span className="header-label">Cloud</span>{sincronizzando ? ' …' : ((githubToken && gistId && autoSync) || (codiceSync && autoSyncCodice)
              ? <span aria-label="Sincronizzazione automatica attiva" style={{ color: '#2e9d4d', fontWeight: 900 }}>✓</span>
              : '')}
          </button>
          <button
            style={{ ...styles.modeButton(false), opacity: passiUndo ? 1 : 0.4, cursor: passiUndo ? 'pointer' : 'default' }}
            title={passiUndo ? t('undo.tooltip', { n: passiUndo }) : t('undo.vuoto')}
            disabled={!passiUndo}
            onClick={annullaModifica}
          >
            ↩︎ <span className="header-label">{t('undo.annulla')}</span>
          </button>
          <input ref={jsonRef} type="file" accept="application/json,.json,application/pdf,image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif,.pdf" multiple style={{ display: 'none' }} onChange={importaJson} />
          <button
            style={styles.modeButton(false)}
            title={t('tip.esporta')}
            onClick={esportaJson}
          >
            💾 <span className="header-label">Esporta</span>
          </button>
          <button
            style={styles.modeButton(false)}
            title="Importa JSON, PDF o JPG/PNG (IA) — il Finder ora mostra anche le immagini"
            onClick={() => jsonRef.current?.click()}
          >
            📂 <span className="header-label">Importa</span>
          </button>
          <button
            ref={avvisiBtnRef}
            style={styles.modeButton(mostraAvvisi)}
            title={nAvvisi > 0
              ? `${nAvvisi} ${nAvvisi === 1 ? 'avviso' : 'avvisi'} da vedere`
              : (novitaNonLette ? 'Novità di questa versione' : 'Avvisi e novità')}
            onClick={apriAvvisi}
          >
            🔔 <span className="header-label">Avvisi</span>
            {daNotificare && (
              <span
                className="avvisi-pallino"
                aria-label={nAvvisi > 0 ? `${nAvvisi} avvisi` : 'novità non lette'}
              >{nAvvisi > 0 ? nAvvisi : '!'}</span>
            )}
          </button>
        </div>

        <div className="app-header-group app-header-language">
          <button
            style={styles.modeButton(false)}
            title={lingua === 'it' ? 'Interfaccia in italiano — click per passare all’inglese' : 'Interface in English — click to switch to Italian'}
            onClick={() => setLingua((l) => (l === 'it' ? 'en' : 'it'))}
          >
            {lingua === 'it' ? '🇮🇹 ' : '🇬🇧 '}<span className="header-label">{lingua === 'it' ? 'ITA' : 'ENG'}</span>
          </button>
        </div>

        <input ref={mappaRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={caricaMappa} />
        <div className="game-actions-dock" aria-label="Funzioni di gioco">
          <button
            ref={ambientazioneBtnRef}
            className="game-actions-btn"
            title={t('luogo.tooltip')}
            onClick={() => {
              sbloccaAudio();
              if (!mostraPannelloAudio) {
                const r = ambientazioneBtnRef.current?.getBoundingClientRect();
                if (r) setPosPannelloAudio({
                  top: Math.max(8, Math.min(window.innerHeight - 160, r.bottom + 5)),
                  left: Math.max(8, Math.min(window.innerWidth - 288, r.left)),
                });
              }
              setMostraPannelloAudio(!mostraPannelloAudio);
            }}
          >{iconaAmbientazione(presetColori)} <span className="header-label">{t('luogo.titolo')}</span></button>
          <button
            className="game-actions-btn"
            onClick={() => (mappaCampagna ? setMappaAperta((v) => !v) : mappaRef.current?.click())}
            title={mappaCampagna ? (mappaAperta ? t('mappa.chiudi') : t('mappa.apri')) : t('mappa.carica')}
          >🗺️ <span className="header-label">{t('mappa.tasto')}</span></button>
          {!(combat.attivo && combat.aperto) && (
            <button
              className="game-actions-btn"
              onClick={() => (combat.combattenti.length ? setCombat((c) => ({ ...c, attivo: true, aperto: true })) : aggiungiPgAlCombat())}
              title={t('ct.apri')}
            >⚔️ <span className="header-label"><span className="game-action-combat-full">{t('ct.titolo')}</span><span className="game-action-combat-short">{t('ct.tasto')}</span></span>{combat.combattenti.length ? ` (${combat.combattenti.length})` : ''}</button>
          )}
        </div>
        </div>

      </header>

      {erroreImport && (
        <div style={{ maxWidth: 1080, margin: '8px auto 0', padding: '10px 12px', background: 'color-mix(in srgb, var(--c-panel) 94%, #c0392b)', border: `1px solid ${C.red}`, borderRadius: 8, color: C.red, fontSize: 13, lineHeight: 1.4, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ flex: 1 }}>{erroreImport}</span>
          <button style={{ ...styles.buttonMini, flexShrink: 0, padding: '2px 8px' }} onClick={() => setErroreImport('')}>✕</button>
        </div>
      )}

      {/* Pannello Avvisi: promemoria (backup, controlli scheda) e novità di
          versione. Prima erano due riquadri a tutta larghezza sempre aperti in
          cima alla pagina; qui stanno in una tendina come quella del Luogo, e
          il pulsante 🔔 avvisa con un puntino quando c'è qualcosa da vedere. */}
      {mostraAvvisi && (
        <div onClick={() => setMostraAvvisi(false)} style={{ position: 'fixed', inset: 0, zIndex: 1400, background: 'transparent' }}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="no-stampa"
            style={{
              position: 'fixed', top: posAvvisi.top, left: posAvvisi.left,
              width: 'min(320px, calc(100vw - 16px))', maxHeight: 'min(70vh, 560px)', overflowY: 'auto',
              background: C.panel, border: `1px solid ${C.gold}`, borderRadius: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.45)', padding: '10px 12px', zIndex: 1401,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <strong style={{ color: C.goldDark, fontSize: 15, marginRight: 'auto' }}>🔔 Avvisi e novità</strong>
              <button style={{ ...styles.buttonMini, padding: '2px 7px' }} onClick={() => setMostraAvvisi(false)}>✕</button>
            </div>

            {nAvvisi === 0 && (
              <div style={{ ...styles.detail, fontSize: 12, marginBottom: 10 }}>
                ✅ Nessun avviso: è tutto a posto.
              </div>
            )}

            {avvisoBackup && (
              <div style={{ border: `1px solid ${C.gold}`, borderRadius: 8, padding: '8px 10px', marginBottom: 8, background: 'color-mix(in srgb, var(--c-panel) 88%, #c88c14)' }}>
                <div style={{ fontSize: 13, color: C.ink, marginBottom: 6 }}>
                  🛟 <strong>Fai un backup dei tuoi personaggi.</strong> I dati sono salvati solo su questo
                  dispositivo: un backup ti protegge se cambi telefono o svuoti la cache.
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button style={{ ...styles.buttonPrimary, fontSize: 12, padding: '6px 12px' }} onClick={esportaBackupCompleto}>
                    💾 Scarica backup
                  </button>
                  <button
                    style={styles.buttonMini}
                    onClick={() => { try { localStorage.setItem('scheda-interattiva:snooze-backup', String(Date.now() + 3 * 24 * 3600 * 1000)); } catch { /* niente */ } setPromemoriaBackup(false); }}
                    title="Ricordamelo tra qualche giorno"
                  >Più tardi</button>
                </div>
              </div>
            )}

            {/* Controlli scheda: suggerimenti su competenze/TS che il calcolo
                automatico non trova. Mai una correzione automatica: talenti,
                multiclasse e oggetti magici possono spiegare eccezioni
                legittime, quindi ogni voce si può ignorare per sempre. */}
            {controlliAttivi.length > 0 && (() => {
              const certi = controlliAttivi.filter((r) => r.gravita === 'certo').length;
              const ignorati = scheda.controlliIgnorati || [];
              return (
                <div style={{ border: `1px solid ${certi ? C.red : C.gold}`, borderRadius: 8, padding: '8px 10px', marginBottom: 10, background: certi ? 'color-mix(in srgb, var(--c-panel) 88%, #c83c3c)' : 'color-mix(in srgb, var(--c-panel) 88%, #c88c14)' }}>
                  <div style={{ fontSize: 13, color: C.ink, marginBottom: 6 }}>
                    ⚠️ <strong>{controlliAttivi.length} {controlliAttivi.length === 1 ? 'cosa da controllare' : 'cose da controllare'}</strong> su {scheda.nome || 'questa scheda'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {controlliAttivi.map((r) => (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 8px' }}>
                        <span style={{ flex: 1, fontSize: 12, color: C.ink }}>
                          {r.gravita === 'certo' ? '🔴' : '🟡'} {r.testo}
                        </span>
                        <button
                          style={{ ...styles.buttonMini, fontSize: 10, padding: '3px 6px', flexShrink: 0 }}
                          title="Non segnalarlo più per questo personaggio"
                          onClick={() => aggiorna({ controlliIgnorati: [...ignorati, r.id] })}
                        >Ignora</button>
                      </div>
                    ))}
                    {ignorati.length > 0 && (
                      <button
                        style={{ ...styles.buttonMini, fontSize: 10, alignSelf: 'flex-start' }}
                        onClick={() => aggiorna({ controlliIgnorati: [] })}
                      >↺ Mostra anche i {ignorati.length} ignorati</button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Novità: cosa è cambiato nelle ultime versioni, in breve. */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
              <div style={{ ...styles.detail, fontWeight: 700, marginBottom: 6 }}>✨ Novità</div>
              {novitaRecenti(3).map((n) => (
                <div key={n.versione} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.goldDark }}>
                    v{n.versione}{n.versione === APP_VERSION ? ' · questa versione' : ''}
                  </div>
                  <ul style={{ margin: '3px 0 0', paddingLeft: 18 }}>
                    {(lingua === 'en' ? n.voci.en : n.voci.it).map((v, i) => (
                      <li key={i} style={{ fontSize: 12, color: C.ink, lineHeight: 1.45 }}>{v}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Guida rapida al primo avvio: spiega i tre gesti fondamentali. */}
      {mostraGuida && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1010, padding: 16, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) chiudiGuida(); }}
        >
          <div style={{ background: C.panel, border: `1px solid ${C.gold}`, borderRadius: 12, padding: '18px 20px', maxWidth: 460, width: '100%', maxHeight: '86vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.45)' }}>
            <h2 style={{ ...styles.title, fontSize: 22, margin: '0 0 4px', textAlign: 'center' }}>{t('guida.titolo')}</h2>
            <p style={{ ...styles.detail, textAlign: 'center', margin: '0 0 14px' }}>{t('guida.sottotitolo')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['👆', t('guida.click_t'), t('guida.click_d')],
                ['👆👆', t('guida.doppio_t'), t('guida.doppio_d')],
                ['🎲', t('guida.dadi_t'), t('guida.dadi_d')],
                ['🛟', t('guida.backup_t'), t('guida.backup_d')],
                ...(URL_ARCHIVIO_PG ? [['🗄️', t('guida.archivio_t'), t('guida.archivio_d')]] : []),
              ].map(([icona, titolo, desc]) => (
                <div key={titolo} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: C.panelLight, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px' }}>
                  <span style={{ fontSize: 20, lineHeight: 1.2, flexShrink: 0 }} aria-hidden>{icona}</span>
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ color: C.ink, fontSize: 14 }}>{titolo}</strong>
                    <span style={{ ...styles.detail, display: 'block', fontSize: 13 }}>{desc}</span>
                  </span>
                </div>
              ))}
            </div>
            <button style={{ ...styles.buttonPrimary, width: '100%', marginTop: 16 }} onClick={chiudiGuida}>
              {t('guida.ok')}
            </button>
          </div>
        </div>
      )}

      {stanzaUi.aperta && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1010, padding: 16, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) setStanzaUi((s) => ({ ...s, aperta: false })); }}
        >
          <div style={{ background: C.panel, border: `1px solid ${C.gold}`, borderRadius: 12, padding: '18px 20px', maxWidth: 480, width: '100%' }}>
            <h2 style={{ ...styles.title, fontSize: 20, margin: '0 0 6px', textAlign: 'center' }}>🚪 {t('stanze.titolo')}</h2>
            <p style={{ ...styles.detail, fontSize: 13, margin: '0 0 14px', textAlign: 'center' }}>{t('stanze.snapshot_desc', { ore: DURATA_STANZA_ORE })}</p>

            <button style={{ ...styles.buttonPrimary, width: '100%' }} disabled={stanzaUi.caricamento} onClick={creaStanzaCorrente}>
              {stanzaUi.caricamento ? t('stanze.attendi') : t('stanze.crea')}
            </button>
            {stanzaUi.creato && (
              <div style={{ marginTop: 12, padding: 12, textAlign: 'center', background: C.panelLight, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                <div style={styles.detail}>{t('stanze.codice')}</div>
                <div style={{ color: C.goldDark, fontSize: 28, fontWeight: 800, letterSpacing: 3, fontFamily: 'monospace', margin: '4px 0' }}>{formattaCodiceStanza(stanzaUi.creato)}</div>
                <button style={styles.buttonMini} onClick={() => navigator.clipboard?.writeText(formattaCodiceStanza(stanzaUi.creato))}>📋 {t('stanze.copia')}</button>
                <div style={{ ...styles.detail, fontSize: 11, marginTop: 6 }}>{t('stanze.scade')}</div>
              </div>
            )}

            <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 16, paddingTop: 14 }}>
              <label style={{ ...styles.detail, display: 'block', fontWeight: 700, marginBottom: 5 }}>{t('stanze.inserisci')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={formattaCodiceStanza(stanzaUi.codice)}
                  onChange={(e) => setStanzaUi((s) => ({ ...s, codice: normalizzaCodiceStanza(e.target.value), errore: '' }))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && normalizzaCodiceStanza(stanzaUi.codice).length === 10) apriStanzaDaCodice(); }}
                  placeholder="23456-ABCDE"
                  autoCapitalize="characters"
                  style={{ ...styles.inlineInput, flex: 1, minWidth: 0, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1.5 }}
                />
                <button style={styles.buttonPrimary} disabled={stanzaUi.caricamento || normalizzaCodiceStanza(stanzaUi.codice).length !== 10} onClick={apriStanzaDaCodice}>{t('stanze.apri')}</button>
              </div>
            </div>
            {stanzaUi.errore && <div role="alert" style={{ color: C.red, fontSize: 13, marginTop: 10 }}>{stanzaUi.errore}</div>}
            {!URL_STANZE && <div style={{ ...styles.detail, color: C.red, fontSize: 12, marginTop: 10 }}>{t('stanze.non_configurato')}</div>}
            <button style={{ ...styles.button, width: '100%', marginTop: 14 }} onClick={() => setStanzaUi((s) => ({ ...s, aperta: false }))}>{t('common.chiudi')}</button>
          </div>
        </div>
      )}

      {/* Link di condivisione appena creato */}
      {condivisione && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1010, padding: 16, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) setCondivisione(null); }}
        >
          <div style={{ background: C.panel, border: `1px solid ${C.gold}`, borderRadius: 12, padding: '18px 20px', maxWidth: 520, width: '100%', maxHeight: '86vh', overflowY: 'auto' }}>
            <h2 style={{ ...styles.title, fontSize: 20, margin: '0 0 4px', textAlign: 'center' }}>🔗 {t('condividi.titolo')}</h2>
            <p style={{ ...styles.detail, textAlign: 'center', margin: '0 0 12px' }}>
              {condivisione.copiato ? t('condividi.copiato') : t('condividi.copia_a_mano')}
            </p>
            <textarea
              readOnly
              value={condivisione.link}
              onFocus={(e) => e.target.select()}
              style={{ ...styles.textarea, height: 90, fontSize: 12, fontFamily: 'monospace' }}
            />
            {condivisione.ritrattoRimosso && (
              <p style={{ ...styles.detail, fontSize: 12, marginTop: 8, color: C.goldDark }}>
                🖼️ {t('condividi.senza_foto')}
              </p>
            )}
            {condivisione.lungo && (
              <p style={{ ...styles.detail, fontSize: 12, marginTop: 6, color: C.red }}>
                ⚠️ {t('condividi.lungo')}
              </p>
            )}
            <p style={{ ...styles.detail, fontSize: 12, marginTop: 8 }}>🔒 {t('condividi.privacy')}</p>
            <button style={{ ...styles.buttonPrimary, width: '100%', marginTop: 14 }} onClick={() => setCondivisione(null)}>
              {t('common.chiudi')}
            </button>
          </div>
        </div>
      )}

      {/* Personaggio ricevuto da un link: si chiede conferma prima di aggiungerlo */}
      {pgDaLink && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1011, padding: 16, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: C.panel, border: `1px solid ${C.gold}`, borderRadius: 12, padding: '18px 20px', maxWidth: 460, width: '100%' }}>
            <h2 style={{ ...styles.title, fontSize: 20, margin: '0 0 10px', textAlign: 'center' }}>📥 {t('condividi.ricevuto')}</h2>
            <div style={{ background: C.panelLight, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: C.ink, fontSize: 16 }}>{pgDaLink.nome || t('menu.senza_nome')}</div>
              <div style={styles.detail}>
                {[traduciDato(pgDaLink.classe), pgDaLink.livello ? `${t('spell.livello_scelto_label')} ${pgDaLink.livello}` : '', traduciDato(pgDaLink.specie)].filter(Boolean).join(' · ')}
              </div>
            </div>
            <p style={{ ...styles.detail, fontSize: 13, marginBottom: 14 }}>{t('condividi.ricevuto_desc')}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...styles.buttonPrimary, flex: 1 }} onClick={accettaPgDaLink}>{t('condividi.aggiungi')}</button>
              <button style={{ ...styles.button, flex: 1 }} onClick={() => setPgDaLink(null)}>{t('common.annulla')}</button>
            </div>
          </div>
        </div>
      )}

      {mostraRipristino && (() => {
        const snaps = leggiSnapshots();
        return (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1005, padding: 16, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={(e) => { if (e.target === e.currentTarget) setMostraRipristino(false); }}
          >
            <div style={{ ...styles.panel, maxWidth: 460, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ color: C.goldDark, fontSize: 16 }}>🕓 Versioni precedenti</strong>
                <button style={styles.buttonMini} onClick={() => setMostraRipristino(false)}>✕</button>
              </div>
              <p style={{ ...styles.detail, marginTop: 0 }}>
                Ripristini automatici salvati su questo dispositivo (senza immagini). Utile per annullare
                una cancellazione o una modifica sbagliata. Ripristinando, lo stato attuale viene comunque salvato.
              </p>
              {snaps.length === 0 && <p style={styles.detail}>Nessuna versione salvata.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {snaps.map((s, i) => {
                  const nomi = Object.values(s.roster?.personaggi || {}).map((p) => p.nome || '—').slice(0, 4).join(', ');
                  const quando = new Date(s.ts).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{quando} · {s.n} personagg{s.n === 1 ? 'io' : 'i'}</div>
                        <div style={{ ...styles.detail, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nomi}</div>
                      </div>
                      <button
                        style={{ ...styles.buttonMini, borderColor: C.gold, color: C.goldDark, flexShrink: 0 }}
                        onClick={() => setConferma({
                          titolo: 'Ripristinare questa versione?',
                          testo: `Sostituirai i personaggi attuali con la versione del ${quando}. Lo stato di adesso verrà salvato tra le versioni, così puoi tornare indietro.`,
                          onConferma: () => ripristinaSnapshot(s),
                        })}
                      >Ripristina</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {mostraPannelloAudio && (
        <div
          onClick={() => setMostraPannelloAudio(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1400,
            background: 'transparent'
          }}
        >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed', top: posPannelloAudio.top, left: posPannelloAudio.left,
            width: 'min(280px, calc(100vw - 16px))',
            maxHeight: `calc(100vh - ${posPannelloAudio.top + 8}px)`,
            background: C.panel, border: `2px solid ${C.goldDark}`, borderRadius: 10,
            padding: '10px 12px', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13,
            boxShadow: '6px 0 28px rgba(0,0,0,0.48)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontWeight: 'bold', color: C.goldDark, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span>{iconaAmbientazione(presetColori)} {t('luogo.titolo')}</span>
              <span style={{ fontSize: 11, fontWeight: 'normal', color: C.inkDim }}>{t('luogo.descrizione')}</span>
            </div>
            <button
              style={{ ...styles.btnMini }}
              onClick={() => setMostraPannelloAudio(false)}
            >✕</button>
          </div>
          <button
            style={{ ...styles.btnMini, width: '100%', padding: '7px 10px', borderColor: C.goldDark, color: C.ink, background: C.panelLight }}
            title={t('luogo.giorno_notte_tip')}
            onClick={() => setTema(notteAttiva ? 'chiaro' : 'scuro')}
          >
            {notteAttiva ? '☀️ Passa al giorno' : '🌙 Passa alla notte'}
          </button>
          {/* Volume del sottofondo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: C.inkDim }}>🔊</span>
            <input
              type="range" min="0" max="1" step="0.05"
              value={volumeAudio}
              onChange={(e) => setVolumeAudio(e.target.value)}
              style={{ flex: 1, accentColor: C.gold }}
              title="Volume del sottofondo"
            />
            <span style={{ minWidth: 38, textAlign: 'right', fontSize: 12, fontWeight: 'bold' }}>{Math.round(volumeAudio * 100)}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: C.inkDim }} title="Volume dadi, armi e magia">🎲</span>
            <input
              type="range" min="0" max="1" step="0.05"
              value={volumeEffetti}
              onChange={(e) => setVolumeEffetti(Number(e.target.value))}
              style={{ flex: 1, accentColor: C.gold }}
              title="Volume degli effetti: dadi, armi e magia"
            />
            <span style={{ minWidth: 38, textAlign: 'right', fontSize: 12, fontWeight: 'bold' }}>{Math.round(volumeEffetti * 100)}%</span>
          </div>
          {/* Due interruttori simmetrici: suoni dei dadi e muto generale */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setEffettiSonoriAttivi((v) => !v)}
              title={'Attiva/disattiva i suoni dei tiri di dado. La barra qui sopra regola invece il volume del sottofondo ambientale (sono due cose diverse).'}
              style={{
                ...styles.btnMini, flex: 1, padding: '8px 6px', whiteSpace: 'nowrap',
                border: `1px solid ${effettiSonoriAttivi ? C.gold : C.border}`,
                background: effettiSonoriAttivi ? C.gold : C.panel,
                color: effettiSonoriAttivi ? '#fff' : C.inkDim, fontWeight: 'bold'
              }}
            >🎲 Suoni dadi {effettiSonoriAttivi ? 'ON' : 'OFF'}</button>
            <button
              onClick={() => {
                if (mutoAudio) {
                  sbloccaAudio();
                  audioAvviatoDaGestoRef.current = true;
                  avviaAmbiente(ambienteAudio, volumeAudio * (notteAttiva ? 0.6 : 1), urlCustomAudio, notteAttiva);
                }
                setMutoAudio((m) => !m);
              }}
              title={mutoAudio ? 'Audio in muto · click per riattivare tutto' : 'Muta rapidamente tutto l’audio (sottofondo + effetti)'}
              style={{
                ...styles.btnMini, flex: 1, padding: '8px 6px', whiteSpace: 'nowrap',
                border: `1px solid ${mutoAudio ? C.gold : C.border}`,
                background: mutoAudio ? C.gold : C.panel,
                color: mutoAudio ? '#fff' : C.inkDim, fontWeight: 'bold'
              }}
            >{mutoAudio ? '🔇 Muto' : '🔊 Audio ON'}</button>
          </div>

          {/* Ambientazioni: un click applica palette + sfondo + audio abbinato */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 4 }}>
          {[...PRESET_COLORI].filter((p) => p.id !== 'default').sort((a, b) => ORDINE_AMBIENTAZIONI.indexOf(a.id) - ORDINE_AMBIENTAZIONI.indexOf(b.id)).map((p) => {
              const attivo = presetColori === p.id;
              const conSuono = p.audio && p.audio !== 'spento';
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    sbloccaAudio();
                    if (!mutoAudio) {
                      audioAvviatoDaGestoRef.current = p.audio !== ambienteAudio;
                      avviaAmbiente(p.audio, volumeAudio * (notteAttiva ? 0.6 : 1), urlCustomAudio, notteAttiva);
                    }
                    setPresetColori(p.id);
                    setAmbienteAudio(p.audio);
                  }}
                  title={`${p.nome}${conSuono ? ' · audio ambientale incluso' : ' · silenzio'}`}
                  style={{
                    padding: '4px 6px', minHeight: 29, borderRadius: 6, border: `1px solid ${attivo ? C.goldDark : C.border}`,
                    background: attivo ? C.goldDark : C.panelLight, color: attivo ? '#ffffff' : C.ink,
                    cursor: 'pointer', fontWeight: attivo ? 'bold' : 'normal', textAlign: 'left',
                    display: 'flex', alignItems: 'center', fontSize: 12, lineHeight: 1.15,
                    transition: 'all 0.15s ease', boxShadow: attivo ? '0 2px 8px rgba(0,0,0,0.28)' : '0 1px 2px rgba(0,0,0,0.08)'
                  }}
                >
                  <span>{p.nome}</span>
                </button>
              );
            })}
          </div>

          {/* Audio personalizzato (facoltativo): sovrascrive il sottofondo con un MP3/stream */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const prossimo = ambienteAudio === 'custom' ? 'spento' : 'custom';
                sbloccaAudio();
                if (!mutoAudio) {
                  audioAvviatoDaGestoRef.current = prossimo !== ambienteAudio;
                  avviaAmbiente(prossimo, volumeAudio * (notteAttiva ? 0.6 : 1), urlCustomAudio, notteAttiva);
                }
                setAmbienteAudio(prossimo);
              }}
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
        </div>
      )}

      <main style={styles.main}>

        {/* Barra del tiro */}
        <div className="barra-tiro no-stampa" style={styles.rollBar}>
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
                        // Anche sul critico serve il pulsante: prima compariva solo
                        // la scritta "tiro i danni raddoppiati…" e i danni non
                        // venivano mai tirati.
                        <button
                          style={{
                            ...styles.buttonPrimary, marginTop: 6,
                            ...(tiro.naturale === 20 ? { background: C.goldDark } : {}),
                          }}
                          onClick={lanciaDanniAttacco}
                        >
                          {tiro.naturale === 20
                            ? `⚔ ${t('atk.tira_danni_critico')} (${tiro.attacco.danno} ×2)`
                            : `🗡 ${t('atk.tira_danni')} (${tiro.attacco.danno})`}
                        </button>
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

          <div className="dadi-riga" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', width: '100%', padding: '1px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ ...styles.detail, marginRight: 2, flexShrink: 0, fontWeight: 700, fontSize: 13 }}>{t('roll.dado')}:</span>
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
                className="dadi-espressione"
                style={{
                  ...styles.inlineInput,
                  flex: '0 1 80px', minWidth: 55, maxWidth: 100,
                  padding: '2px 6px', height: 24, fontSize: 12,
                  marginLeft: 3,
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

            {/* Titolo centrato nella barra */}
            <h1 className="app-header-title" style={{ ...styles.title, fontSize: 18, whiteSpace: 'nowrap', color: 'var(--c-title)', display: 'inline-flex', alignItems: 'baseline', gap: 0 }}>
              <span>Tavolo dei Dadi</span>
              <span className="app-version" style={{ fontSize: 9, color: 'var(--c-ink-dim)', fontWeight: 500, marginLeft: 3, position: 'relative', top: 0, letterSpacing: 0.3, lineHeight: 1, border: 'none', background: 'transparent', padding: 0, minHeight: 'auto', borderRadius: 0, display: 'inline-block', verticalAlign: 'baseline', fontVariantNumeric: 'tabular-nums lining-nums', fontFeatureSettings: '"lnum" 1, "tnum" 1', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>v{APP_VERSION}</span>
            </h1>

            {/* Modi di tiro: 4 colonne uguali */}
            <div className="dadi-modi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6, alignItems: 'center', flex: '1 1 280px', maxWidth: 360 }}>
              {['normale', 'vantaggio', 'svantaggio'].map((m) => (
                <button key={m} style={{ ...styles.modeButton(modalita === m), width: '100%', minWidth: 0, textAlign: 'center', whiteSpace: 'nowrap' }} onClick={() => setModalita(m)}>
                  {m === 'normale' ? t('roll.normale') : m === 'vantaggio' ? t('roll.vantaggio') : t('roll.svantaggio')}
                </button>
              ))}
              <button
                style={{ ...styles.modeButton(storicoAperto), width: '100%', minWidth: 0, textAlign: 'center', whiteSpace: 'nowrap' }}
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

        {!scheda ? (
          <section style={{ ...styles.panel, textAlign: 'center', padding: '24px 16px' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-title)', marginBottom: 8 }}>Nessun personaggio</div>
            <div style={{ ...styles.detail, marginBottom: 16 }}>Crea il tuo primo eroe o importane uno dal Menu.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={styles.buttonPrimary} onClick={() => setMostraMenu(true)}>🏠 Apri Menu</button>
              <button style={styles.button} onClick={() => { setBozzaCrea({ nome: '', sesso: '', classe: '', sottoclasse: '', specie: '', background: '', livello: 1, metodo: 'auto', pool: null, assegna: {}, competenzeClasse: [], competenzeSpecie: [], maestria: [], talentoOrigine: '', asiTalenti: {}, multiclasseClasse2: '', multiclasseLivello2: 1, sottoclasseMc2: '', multiclasseClasse3: '', multiclasseLivello3: 1, sottoclasseMc3: '', dotazione: 'pacchetto' }); setMostraCrea(true); }}>＋ Nuovo personaggio</button>
            </div>
          </section>
        ) : (
          <>

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
                  // centrato verticalmente e a filo destro, DENTRO il riquadro
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  paddingRight: 28,
                  pointerEvents: 'none', userSelect: 'none', zIndex: 1,
                }}
              >
                <span style={{
                  fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontWeight: 'bold',
                  // grande: riempie l'altezza del riquadro, dal bordo inferiore al superiore
                  fontSize: 46, letterSpacing: 1, lineHeight: 1,
                  marginRight: -1.5,
                  color: C.goldDark, opacity: 0.3, whiteSpace: 'nowrap',
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
                const modCos = modificatore(punteggioCaratteristica(scheda, 'costituzione') || 10) || 0;
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
            <button style={styles.buttonMini} onClick={() => { setBozzaCrea({ nome: '', sesso: '', classe: '', sottoclasse: '', specie: '', background: '', livello: 1, metodo: 'auto', pool: null, assegna: {}, competenzeClasse: [], competenzeSpecie: [], maestria: [], talentoOrigine: '', asiTalenti: {}, multiclasseClasse2: '', multiclasseLivello2: 1, sottoclasseMc2: '', multiclasseClasse3: '', multiclasseLivello3: 1, sottoclasseMc3: '', dotazione: 'pacchetto' }); setMostraCrea(true); }} title={t('tip.nuovo_pg')}>＋</button>
            <button style={styles.buttonMini} onClick={duplicaPersonaggio} title={t('tip.duplica')}>⧉</button>
            <button style={styles.buttonMini} onClick={resetScheda} title={t('tip.azzera')}>↺</button>
            <button style={{ ...styles.buttonMini, borderColor: C.red, color: C.red }} onClick={eliminaPersonaggio} title={t('tip.elimina_pg')}>🗑</button>
          </div>
        </section>

        {/* Testata: anagrafica + riquadri vitali uniformi */}
        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>{t("profilo.titolo")}</h2>
          {/* Con il ritratto ridotto, Addestramento/Risorse si prendono lo spazio libero. */}
          <div className={`profilo-griglia${(scheda.sezioniAperte?.ritratto ?? true) ? '' : ' senza-ritratto'}`}>
            {/* RITRATTO — colonna destra, occupa tutta l'altezza */}
            <div className="profilo-ritratto">
              {/* Da chiuso resta solo la barretta per riaprire; da aperto il
                  comando è la freccia nell'angolo in alto a sinistra dell'immagine. */}
              {!(scheda.sezioniAperte?.ritratto ?? true) && (
                <button
                  type="button"
                  className="ritratto-toggle"
                  onClick={() => aggiorna({ sezioniAperte: { ...(scheda.sezioniAperte || {}), ritratto: true } })}
                  aria-expanded={false}
                >▸ 🖼️ {t('profilo.ritratto')}</button>
              )}
              {(scheda.sezioniAperte?.ritratto ?? true) && <>
              <div
                className="ritratto-box"
                style={{
                  width: '100%', flex: 1, minHeight: 0, borderRadius: 12, overflow: 'hidden',
                  // emblema auto (foto assente o SVG): sfondo col colore classe, si fonde coi bordi
                  background: (!scheda.ritratto || scheda.ritratto.startsWith('data:image/svg')) ? (coloreClasse(scheda.classe)?.chiaro || C.panel) : C.panel,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)', border: `2px solid ${coloreClasse(scheda.classe) ? C.gold : C.border}`,
                  cursor: 'pointer', position: 'relative',
                }}
                title={scheda.ritratto ? 'Click: cambia immagine' : 'Click: carica l’immagine del personaggio'}
                onClick={() => ritrattoRef.current?.click()}
              >
                {/* Freccia di riduzione nell'angolo in alto a sinistra, come le
                    altre sezioni ma dentro l'immagine (non ruba spazio). */}
                <button
                  type="button"
                  className="ritratto-collassa"
                  title="Riduci il ritratto"
                  aria-expanded
                  onClick={(e) => { e.stopPropagation(); aggiorna({ sezioniAperte: { ...(scheda.sezioniAperte || {}), ritratto: false } }); }}
                >▾</button>
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
              </>}
            </div>
            {/* COLONNA CENTRALE: anagrafica + riquadri vitali; righe condivise (subgrid) con le caratteristiche */}
            <div className="profilo-main">
              {/* Riga 1 — Anagrafica (allineata a Forza) */}
              <div className="pm-anagrafica">
              <div className="campi-anagrafica" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px 10px', alignItems: 'end' }}>
                <CampoModulo label={t("profilo.sesso")}>
                  <select
                    value={scheda.sesso || ''}
                    onChange={(e) => aggiorna({ sesso: e.target.value })}
                    title={t('profilo.sesso_tooltip')}
                    style={{ background: 'transparent', border: 'none', color: C.ink, fontFamily: 'inherit', width: '100%', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="">{t('profilo.sesso_non_specificato')}</option>
                    <option value="maschio">{t('profilo.sesso_maschio')}</option>
                    <option value="femmina">{t('profilo.sesso_femmina')}</option>
                    <option value="altro">{t('profilo.sesso_altro')}</option>
                  </select>
                </CampoModulo>
                <CampoModulo label={versione === "2024" ? t("profilo.specie") : t("profilo.razza")}>
                  <CampoTendina value={scheda.specie} opzioni={SPECIE_5E} formattaOpzione={(v) => nomeSpeciePerSesso(v, scheda.sesso, lingua)} onChange={(v) => { const sp = datiSpecieDi(v); aggiorna({ specie: v, ...(sp ? { velocita: sp.velocita, sensi: sp.sensi, taglia: sp.taglia, trattiSpecie: trattiSpecieTesto(sp.tratti) } : {}), ...abilitaConSpecie(v), ...ritrattoAuto(scheda.classe, v, scheda.nome) }); }} title={t('tip.scegli_specie')} />
                </CampoModulo>
                <CampoModulo label={t("profilo.taglia")}>
                  <CampoTendina value={scheda.taglia} opzioni={TAGLIE_5E} onChange={(v) => aggiorna({ taglia: v })} title={t('tip.scegli_taglia')} />
                </CampoModulo>
                <CampoModulo label={t("profilo.allineamento")}>
                  <CampoTendina value={scheda.allineamento} opzioni={ALLINEAMENTI_5E} onChange={(v) => aggiorna({ allineamento: v })} title={t('tip.scegli_allineamento')} />
                </CampoModulo>
                <CampoModulo label={t("profilo.background")}>
                  <CampoBloccato
                    valore={traduciDato(scheda.background) || t('profilo.nessuno')}
                    title={t('profilo.background_bloccato')}
                  />
                </CampoModulo>
                <CampoModulo label={t("profilo.classe")} boxClassName={(scheda.multiclasse || []).some((m) => m.classe) ? 'classe-multi' : undefined}>
                  <CampoBloccato
                    valore={[traduciDato(scheda.classe), ...(scheda.multiclasse || []).filter((m) => m.classe).map((m) => traduciDato(m.classe))].filter(Boolean).join(' + ') || t('profilo.nessuna')}
                    title={t('profilo.classe_bloccata')}
                  />
                </CampoModulo>
                <CampoModulo label={t("profilo.sottoclasse")} boxClassName={(scheda.multiclasse || []).some((m) => m.classe) ? 'sottoclasse-multi' : undefined}>
                  {(() => {
                    // Con più classi (multiclasse) ogni riga porta anche il nome
                    // della classe: senza, un valore bloccato senza bordo (es.
                    // "Guerriero dell'Ombra" o "Dal 3° livello") si confonde con
                    // il campo Background appena sopra, che non ha alcun confine
                    // visivo evidente.
                    const multi = (scheda.multiclasse || []).some((m) => m.classe);
                    const riga = (etichetta, contenuto) => multi ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ ...styles.detail, fontWeight: 700, flexShrink: 0, minWidth: 54 }}>{traduciDato(etichetta)}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>{contenuto}</div>
                      </div>
                    ) : contenuto;
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: multi ? 6 : 4 }}>
                        {/* Sottoclasse della classe principale */}
                        {riga(scheda.classe, campoSottoclasse(scheda.classe, scheda.livello, scheda.sottoclasse, (v) => {
                          const patch = { sottoclasse: v };
                          // Riempi in automatico i privilegi di sottoclasse fino al
                          // livello attuale (se abbiamo i dati per questa sottoclasse).
                          const auto = privilegiSottoclasseFinoA(v, scheda.livello || 1);
                          if (auto) patch.privilegiSottoclasse = auto;
                          // Cavaliere Mistico/Mistificatore Arcano: scegliendo la
                          // sottoclasse compaiono gli slot incantesimo del "terzo
                          // incantatore", altrimenti resterebbero a zero finché non
                          // si passa dalla creazione guidata o da un level up. Solo
                          // per queste due sottoclassi: non deve mai toccare gli slot
                          // (e gli "spesi" già segnati) di una classe già incantatrice.
                          if (sottoclasseTerzoIncantatore(scheda.classe, v)) {
                            const slot = slotDaClasseLivello(scheda.classe, scheda.livello, v);
                            if (slot) patch.slotIncantesimo = slot;
                          }
                          aggiorna(patch);
                        }))}
                        {/* Una sottoclasse per ogni classe del multiclasse */}
                        {(scheda.multiclasse || []).map((m, i) => (m.classe ? (
                          <div key={i}>
                            {riga(m.classe, campoSottoclasse(m.classe, m.livello, m.sottoclasse, (v) =>
                              aggiorna({ multiclasse: (scheda.multiclasse || []).map((x, j) => (j === i ? { ...x, sottoclasse: v } : x)) })
                            ))}
                          </div>
                        ) : null))}
                      </div>
                    );
                  })()}
                </CampoModulo>
                <CampoModulo label={t("profilo.pe")}>
                  <Editable
                    value={Math.max(0, Number(scheda.pe) || 0)}
                    tipo="numero"
                    width="100%"
                    style={{ width: '100%', textAlign: 'left' }}
                    title={t('profilo.pe_tooltip')}
                    onChange={(v) => aggiorna({ pe: Math.max(0, v) })}
                  />
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
                      {[...NOMI_CLASSI].sort((a, b) => traduciDato(a).localeCompare(traduciDato(b), lingua)).map((n) => <option key={n} value={n}>{traduciDato(n)}</option>)}
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
              </div>
              {/* Riga 2 — Punti Ferita (allineata a Destrezza + Costituzione) */}
              <div className="pm-pf">
            <div style={{ ...styles.vitalBox, gridColumn: 'span 4', padding: '32px 14px 12px' }}>
              <SfondoVit>🩸</SfondoVit>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ ...styles.vitalLabel, margin: 0, fontSize: 13 }}>❤️ {t("vital.pf")}</div>
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
                {/* PF temporanei: badge scudo accanto ai PF, non più in alto a caso */}
                <span
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 10, fontSize: 12, color: '#42a5f5', background: 'rgba(66,165,245,0.12)', border: '1px solid rgba(66,165,245,0.45)', borderRadius: 12, padding: '1px 8px' }}
                  title={t('vital.temporanei')}
                >
                  🛡️ <span style={{ fontSize: 10, color: C.inkDim, letterSpacing: 0.4, textTransform: 'uppercase' }}>{t("vital.temporanei")}</span>
                  <Editable value={scheda.pfTemp} tipo="numero" onChange={(v) => aggiorna({ pfTemp: v })} width={24} style={{ fontSize: 13, fontWeight: 'bold', color: '#42a5f5' }} />
                </span>
              </div>

              {(() => {
                const gruppiDV = gruppiDadoVita(scheda.dadiVita);
                const spesiMapDV = dadiVitaSpesiNormalizzati(scheda);
                return gruppiDV.map((g, i) => (
                  <div key={g.facce} style={{ ...styles.detail, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: i === 0 ? 14 : 4, paddingTop: i === 0 ? 12 : 0, paddingBottom: 2, borderTop: i === 0 ? `1px solid ${C.border}` : 'none', textAlign: 'center', position: 'relative', top: i === 0 ? 3 : 0 }}>
                    <span style={{ width: '100%', display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {t('vital.dadi_vita')}{' '}
                      <Rollable onRoll={() => tiraDadoVita(g.facce)} title={t('vital.dadi_vita_tooltip')}>
                        <strong style={{ color: C.goldDark }}>{g.quantita}</strong>
                      </Rollable>
                      {' × d'}
                      <strong style={{ color: C.goldDark }} title={t('vital.dado_tipo_tooltip')}>
                        {g.facce}
                      </strong>
                      {' · '}{t('vital.spesi')}{' '}
                      <select
                        style={{ ...styles.inlineInput, fontSize: 12, padding: '1px 3px' }}
                        value={Math.min(Math.max(0, spesiMapDV[g.facce] || 0), g.quantita)}
                        onChange={(e) => aggiorna({ dadiVitaSpesi: { ...spesiMapDV, [g.facce]: Number(e.target.value) } })}
                        title={t('vital.spesi_tooltip')}
                      >
                        {Array.from({ length: g.quantita + 1 }, (_, n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <span style={{ color: C.inkDim }}>/ {g.quantita}</span>
                      <button
                        style={{ ...styles.buttonMini, padding: '2px 8px', color: C.green, borderColor: C.green }}
                        title={t('vital.usa_tooltip')}
                        disabled={(spesiMapDV[g.facce] || 0) >= g.quantita}
                        onClick={() => tiraDadoVita(g.facce)}
                      >
                        🎲 {t('vital.usa')}
                      </button>
                    </span>
                  </div>
                ));
              })()}
            </div>
              </div>
              {/* Riga 3 — Difesa e mobilità (allineata a Intelligenza) */}
              <div className="vitali pm-gruppo">
            <div style={{ ...styles.vitalBox, gridColumn: 'span 2' }}>
              <SfondoVit>🛡️</SfondoVit>
              <div style={styles.vitalLabel}>{t("vital.ca")}</div>
              <div style={styles.vitalValue}>
                {scheda.armatura.tipo === 'manuale' && !scheda.armatura.scudo && !scheda.armatura.bonus && !bonusClasseArmaturaOggetti(scheda) ? (
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
                  // Niente lucchetto: l'opzione resta semplicemente non selezionabile.
                  return <option key={ta.key} value={ta.key} disabled={bloccato}>{t('armor.' + ta.key)}</option>;
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
                      <span style={styles.pip(scheda.armatura.scudo, C.goldDark)} /> <span style={{ opacity: scheda.armatura.scudo ? 1 : 0.4 }}>🛡️</span>
                    </span>
                  );
                })()}
                <span>+ <Editable value={scheda.armatura.bonus} tipo="numero" width={22} onChange={(v) => aggiorna({ armatura: { ...scheda.armatura, bonus: v } })} /></span>
                {bonusClasseArmaturaOggetti(scheda) > 0 && <span title={t('inv.effetto_attivo')}>✨ +{bonusClasseArmaturaOggetti(scheda)}</span>}
              </div>
              {(!competenteInArmatura(scheda, scheda.armatura.tipo) || (scheda.armatura.scudo && !scheda.addestramento?.armature?.scudi)) && (
                <div style={{ fontSize: 9, color: C.red, marginTop: 3, lineHeight: 1.2 }} title={t('tip.senza_comp_armatura')}>
                  ⚠️ Non competente{!competenteInArmatura(scheda, scheda.armatura.tipo) ? ` (${scheda.armatura.tipo})` : ''}{scheda.armatura.scudo && !scheda.addestramento?.armature?.scudi ? ' (scudo)' : ''}
                </div>
              )}
            </div>
            <div style={{ ...styles.vitalBox, gridColumn: 'span 2' }}>
              <SfondoVit>🌙</SfondoVit>
              <div style={styles.vitalLabel}>{t("vital.riposo")}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button style={{ ...styles.buttonMini, fontSize: 11 }} onClick={() => riposoBreve()} title={t('vital.riposo_breve_tip')}>☕ {t("vital.breve")}</button>
                    <button style={{ ...styles.buttonMini, fontSize: 11, borderColor: C.goldDark, color: C.goldDark }} onClick={() => riposoLungo()} title={t('vital.riposo_lungo_tip')}>🌙 {t("vital.lungo")}</button>
                  </div>
                </div>
                <div style={{ ...styles.vitalBox }}>
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
                <div style={{ ...styles.vitalBox }}>
                  <SfondoVit>⚡</SfondoVit>
                  <div style={styles.vitalLabel}>{t("vital.iniziativa")}</div>
                  <div style={styles.vitalValue}>
                    <Rollable onRoll={() => lanciaD20(t('vital.iniziativa'), modificatore(punteggioCaratteristica(scheda, 'destrezza')), { dopoTiro: (tot) => sincronizzaIniziativaPg(tot) })}>
                      {conSegno(modificatore(punteggioCaratteristica(scheda, 'destrezza')))}
                    </Rollable>
                  </div>
                </div>
                <div
                  style={{ ...styles.vitalBox }}
                  title={`🏃 Salto in Lungo (con rincorsa): ${punteggioCaratteristica(scheda, 'forza') || 10} piedi (${((punteggioCaratteristica(scheda, 'forza') || 10) * 0.3).toFixed(1)} m) • ⬆️ Salto in Alto: ${3 + modificatore(punteggioCaratteristica(scheda, 'forza') || 10)} piedi (${((3 + modificatore(punteggioCaratteristica(scheda, 'forza') || 10)) * 0.3).toFixed(1)} m) • 🫁 Trattenere il Respiro: ${Math.max(1, 1 + modificatore(punteggioCaratteristica(scheda, 'costituzione') || 10))} minuti`}
                >
                  <SfondoVit>🏃</SfondoVit>
                  <div style={styles.vitalLabel}>{t("vital.movimento")}</div>
                  <div style={styles.vitalValue}>
                    <Editable value={scheda.velocita} tipo="numero" onChange={(v) => aggiorna({ velocita: v })} width={48} />
                    <span style={{ fontSize: 17, color: C.inkDim, marginLeft: 2, fontWeight: 600 }}> m</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 5, left: 0, right: 0, fontSize: 10, color: C.goldDark, textAlign: 'center', fontWeight: 600 }}>
                    🏃 Salto: {((punteggioCaratteristica(scheda, 'forza') || 10) * 0.3).toFixed(1)}m
                  </div>
                </div>
                <div style={{ ...styles.vitalBox }}>
                  <SfondoVit>🥱</SfondoVit>
                  <div style={styles.vitalLabel}>{t("vital.sfinimento")}</div>
                  <div style={styles.vitalValue}>
                    <button style={{ ...styles.buttonMini, padding: '1px 5px', fontSize: 13 }} onClick={() => aggiorna({ sfinimento: Math.max(0, scheda.sfinimento - 1) })} title={t('tip.diminuisci')}>−</button>
                    {' '}<strong style={{ color: scheda.sfinimento ? C.red : C.ink }}>{scheda.sfinimento}</strong>{' '}
                    <button style={{ ...styles.buttonMini, padding: '1px 5px', fontSize: 13 }} onClick={() => aggiorna({ sfinimento: Math.min(6, scheda.sfinimento + 1) })} title={t('tip.aumenta')}>+</button>
                  </div>
                  {scheda.sfinimento > 0 && (
                    <div style={{ fontSize: 9, color: C.red }} title={versione === '2024' ? 'Regole 2024: −2 ai tiri di d20 per livello' : `Regole 2014: ${SFINIMENTO_2014[scheda.sfinimento]}`}>
                      {versione === '2024' ? `−${scheda.sfinimento * 2}` : SFINIMENTO_2014[scheda.sfinimento]}
                    </div>
                  )}
                </div>
              </div>
              {/* Riga 4 — Salvezza e sensi (allineata a Saggezza) */}
              <div className="vitali pm-gruppo">
                <div className="ts-morte-box" style={{ ...styles.vitalBox }}>
                  <SfondoVit>💀</SfondoVit>
                  <div style={styles.vitalLabel}>{t("vital.ts_morte")}</div>
                  <div className="ts-morte-controlli">
                    <div className="ts-morte-riga">
                      <span style={{ color: C.green, fontWeight: 600 }}>✔</span>
                      {[1, 2, 3].map((n) => (
                        <input key={`s-${n}`} type="checkbox" checked={(scheda.tsMorte?.successi || 0) >= n} onChange={() => {
                          const att = scheda.tsMorte?.successi || 0;
                          aggiorna({ tsMorte: { ...scheda.tsMorte, successi: att === n ? n - 1 : n } });
                        }} />
                      ))}
                    </div>
                    <div className="ts-morte-riga">
                      <span style={{ color: C.red, fontWeight: 600 }}>✘</span>
                      {[1, 2, 3].map((n) => (
                        <input key={`f-${n}`} type="checkbox" checked={(scheda.tsMorte?.fallimenti || 0) >= n} onChange={() => {
                          const att = scheda.tsMorte?.fallimenti || 0;
                          aggiorna({ tsMorte: { ...scheda.tsMorte, fallimenti: att === n ? n - 1 : n } });
                        }} />
                      ))}
                    </div>
                  </div>
                  <button className="ts-morte-reset" style={{ ...styles.buttonMini, fontSize: 10 }} onClick={() => aggiorna({ tsMorte: { successi: 0, fallimenti: 0 } })}>{t("vital.reset_ts")}</button>
                  {scheda.pfAttuali <= 0 && (
                    <button
                      style={{ ...styles.buttonMini, fontSize: 10, marginTop: 3, color: C.red, borderColor: C.red, fontWeight: 700 }}
                      onClick={tiroSalvezzaMorte}
                      disabled={rolling || (scheda.tsMorte?.successi || 0) >= 3 || (scheda.tsMorte?.fallimenti || 0) >= 3}
                      title="Tira 1d20: 10 o più è un successo, 9 o meno è un fallimento"
                    >🎲 Tira TS</button>
                  )}
                </div>
                <div style={{ ...styles.vitalBox }}>
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
                <div style={{ ...styles.vitalBox }}>
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
                <div style={{ ...styles.vitalBox }} title={t('vital.passive_tooltip')}>
                  <SfondoVit>👁️</SfondoVit>
                  <div style={styles.vitalLabel}>{t("vital.percezione_passiva")}</div>
                  <div style={styles.vitalValue}>{percezionePassiva}</div>
                </div>
              </div>
              {/* Riga 5 — Stato: condizioni e ispirazione (allineata a Carisma) */}
              <div className="vitali pm-gruppo">
            <div style={{ ...styles.vitalBox, gridColumn: 'span 2' }}>
              <SfondoVit>⚠️</SfondoVit>
              <div style={styles.vitalLabel}>{t("vital.condizioni")}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', alignItems: 'center', marginTop: 2 }}>
                {scheda.condizioni.map((c) => {
                  const eff = EFFETTI_CONDIZIONI[c];
                  const testoEff = eff ? (lingua === 'en' ? eff.en : eff.it) : '';
                  return (
                    <span key={c} style={{ ...styles.modeButton(true), fontSize: 9, padding: '1px 3px', margin: 0, lineHeight: 1.4, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      {/* Il nome apre gli effetti, la ✕ toglie la condizione:
                          prima l'intera etichetta cancellava, quindi non c'era
                          modo di leggere cosa comportasse. */}
                      <button
                        type="button"
                        style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'inherit', cursor: eff ? 'help' : 'default' }}
                        title={testoEff || c}
                        onClick={() => eff && setInfo({ titolo: `⚠️ ${traduciDato(c)}`, testo: testoEff })}
                      >{c}</button>
                      <button
                        type="button"
                        style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer', opacity: 0.75 }}
                        title={t('tip.click_rimuovi')}
                        onClick={() => aggiorna({ condizioni: scheda.condizioni.filter((x) => x !== c) })}
                      >✕</button>
                    </span>
                  );
                })}
                <select
                  value=""
                  onChange={(e) => { if (e.target.value) aggiorna({ condizioni: [...scheda.condizioni, e.target.value] }); }}
                  style={{ ...styles.inlineInput, fontSize: 10, padding: '1px 2px', height: 18 }}
                  title={t('tip.aggiungi_condizione')}
                >
                  <option value="">＋ aggiungi</option>
                  {CONDIZIONI_5E.filter((c) => !scheda.condizioni.includes(c)).sort((a, b) => traduciDato(a).localeCompare(traduciDato(b), lingua)).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {/* Riepilogo: cosa comportano, sommate, le condizioni attive.
                  Fra parentesi la condizione che causa l'effetto, così si vede
                  subito cosa resterebbe togliendone una. */}
              {(() => {
                const righe = riepilogoCondizioni(scheda.condizioni);
                if (!righe.length) return null;
                return (
                  <div style={{ marginTop: 5, paddingTop: 5, borderTop: `1px dotted ${C.border}`, textAlign: 'left' }}>
                    {righe.map(({ flag, da }) => (
                      <div key={flag} style={{ fontSize: 9, lineHeight: 1.45, color: C.ink }}>
                        • {(lingua === 'en' ? ETICHETTE_EFFETTI[flag].en : ETICHETTE_EFFETTI[flag].it)}
                        <span style={{ opacity: 0.65 }}> ({da.map(traduciDato).join(', ')})</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
                <div style={{
                  ...styles.vitalBox, gridColumn: 'span 2',
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
              </div>
            </div>
          <div className="profilo-caratteristiche">
            {(() => {
              const blocco = (key) => {
              const punteggioEffettivo = punteggioCaratteristica(scheda, key);
              const mod = modificatore(punteggioEffettivo);
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
                        {punteggioEffettivo !== scheda.caratteristiche[key] && (() => {
                          const fontiCar = oggettiConEffettoAttivo(scheda).filter((o) => new RegExp(`^${key}_impostata_(\\d+)$`).test(o.effettoMeccanico));
                          return (
                            <span style={{ position: 'relative' }}>
                              <button
                                type="button"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const r = e.currentTarget.getBoundingClientRect();
                                  setFontePopover((v) => (v && v.tipo === 'car' && v.key === key ? null : { tipo: 'car', key, ...posizionePopover(r, window) }));
                                }}
                                title={t('inv.fonte_bonus_tip')}
                                style={{ marginLeft: 4, fontSize: 15, fontWeight: 'bold', color: C.goldDark, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              >→ {punteggioEffettivo}</button>
                              {fontePopover?.tipo === 'car' && fontePopover.key === key && createPortal(
                                <div
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => e.stopPropagation()}
                                  className="popover-fonte" style={{ position: 'fixed', ...stilePopover(fontePopover), zIndex: 1050, borderRadius: 8, padding: '6px 10px', fontSize: 11, textAlign: 'left', fontWeight: 'normal' }}
                                >
                                  <div className="popover-titolo" style={{ fontWeight: 'bold', marginBottom: 4 }}>{t('inv.fonte_bonus')}:</div>
                                  {fontiCar.length
                                    ? fontiCar.map((o) => <div key={o.id}>🎒 {o.nome}</div>)
                                    : <div className="popover-titolo">—</div>}
                                </div>,
                                document.body
                              )}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <Rollable
                    as="div"
                    style={{ ...styles.skillRow(true), opacity: scheda.tiriSalvezza[key] ? 1 : 0.5, position: 'relative' }}
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
                    {(() => {
                      const bonusOggettiTS = bonusTiriSalvezzaOggetti(scheda);
                      if (!bonusOggettiTS) return null;
                      const fontiTS = oggettiConEffettoAttivo(scheda).filter((o) => o.effettoMeccanico === 'classe_armatura_tiri_salvezza_1' || /^tiri_salvezza_[123]$/.test(o.effettoMeccanico));
                      return (
                        <span style={{ marginLeft: 'auto' }}>
                          <button
                            type="button"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              const r = e.currentTarget.getBoundingClientRect();
                              setFontePopover((v) => (v && v.tipo === 'ts' && v.key === key ? null : { tipo: 'ts', key, ...posizionePopover(r, window) }));
                            }}
                            title={t('inv.fonte_bonus_tip')}
                            style={{ ...styles.buttonMini, fontSize: 10, padding: '0 5px', height: 18, lineHeight: '16px', color: C.goldDark, borderColor: C.goldDark, background: 'rgba(201,162,39,0.12)' }}
                          >✨ +{bonusOggettiTS}</button>
                          {fontePopover?.tipo === 'ts' && fontePopover.key === key && createPortal(
                            <div
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                              className="popover-fonte" style={{ position: 'fixed', ...stilePopover(fontePopover), zIndex: 1050, borderRadius: 8, padding: '6px 10px', fontSize: 11, textAlign: 'left' }}
                            >
                              <div className="popover-titolo" style={{ fontWeight: 'bold', marginBottom: 4 }}>{t('inv.fonte_bonus')}:</div>
                              {fontiTS.length
                                ? fontiTS.map((o) => <div key={o.id}>🎒 {o.nome}</div>)
                                : <div className="popover-titolo">—</div>}
                            </div>,
                            document.body
                          )}
                        </span>
                      );
                    })()}
                  </Rollable>

                  {abilitaDellaCar.map((a) => {
                    const bonus = bonusAbilita(scheda, a.key);
                    const liv = scheda.abilita[a.key] || 0;
                    return (
                      <Rollable
                        as="div"
                        key={a.key}
                        style={{ ...styles.skillRow(true), opacity: liv === 0 ? 0.5 : 1 }}
                        title={`Tieni premuto e rilascia: prova di ${t('skill.' + a.key)} · click sul pallino: niente → competenza (●) → competenza di classe/razza (★) → Maestria/Expertise, doppia competenza (✦)`}
                        onRoll={() => lanciaD20(`${t('skill.' + a.key)}`, bonus)}
                      >
                        <span
                          style={styles.dot(liv)}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            aggiorna({ abilita: { ...scheda.abilita, [a.key]: liv === 0 ? 1 : liv === 1 ? 2 : liv === 2 ? 3 : 0 } });
                          }}
                        >
                          {liv === 3 ? '✦' : liv === 2 ? '★\uFE0E' : liv === 1 ? '●' : '○'}
                        </span>
                        <strong style={{ width: 32 }}>{conSegno(bonus)}</strong>
                        <span>{t('skill.' + a.key)}</span>
                      </Rollable>
                    );
                  })}
                </div>
              );
              };
              return (
                <>
                  {blocco('forza')}
                  {/* Destrezza + Costituzione impilate: insieme si allineano ai Punti Ferita */}
                  <div className="car-coppia">
                    {blocco('destrezza')}
                    {blocco('costituzione')}
                  </div>
                  {blocco('intelligenza')}
                  {blocco('saggezza')}
                  {blocco('carisma')}
                </>
              );
            })()}
          </div>{/* fine colonna caratteristiche (dentro il Profilo) */}
          {/* Addestramento: riempie lo spazio vuoto della colonna destra (righe Intelligenza→Carisma) */}
          <div className="profilo-extra">
            <Sezione titolo={t("sez.addestramento")} {...apertoProps('addestramento')}>
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
                <CampoConTendina
                  value={scheda.addestramento.armi}
                  opzioni={COMP_ARMI_5E}
                  formattaVoce={inizialeMaiuscola}
                  onChange={(v) => aggiorna({ addestramento: { ...scheda.addestramento, armi: v.split(',').map(inizialeMaiuscola).join(', ') } })}
                  title={t("train.armi_ph")}
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
            {/* Risorse di classe: sotto l'Addestramento, riempie il resto dello spazio */}
            <Sezione titolo={t("sez.risorse")} {...apertoProps('risorse')}>
              {scheda.risorse.length === 0 && (
                <p style={{ ...styles.detail, marginTop: 0, fontSize: 11 }}>
                  Nessuna risorsa. Aggiungi Ki, punti stregoneria, ira, ispirazione bardica, usi dei privilegi…
                </p>
              )}
              {scheda.risorse.map((r) => {
                const modifica = (patch) =>
                  aggiorna({ risorse: scheda.risorse.map((x) => (x.id === r.id ? { ...x, ...patch } : x)) });
                const spiegazione = spiegaRisorsa(r.nome);
                const automatica = String(r.id || '').startsWith('auto-');
                return (
                  <div key={r.id} style={{ marginBottom: 8, fontSize: 12, paddingBottom: 8, borderBottom: `1px dotted ${C.border}` }}>
                    {/* Riga 1: nome (con la spiegazione se nota) + rimuovi. Su una riga
                        propria così non si mescola coi controlli del contatore quando
                        la colonna Profilo è stretta. */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      {spiegazione ? (
                        <button
                          type="button"
                          title={spiegazione}
                          onClick={() => setInfo({ titolo: r.nome, testo: spiegazione })}
                          style={{ padding: 0, border: 0, background: 'transparent', color: C.ink, font: 'inherit', fontWeight: 600, textAlign: 'left', cursor: 'help', textDecoration: 'underline dotted', textUnderlineOffset: 3, marginRight: 'auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >{r.nome} ⓘ</button>
                      ) : (
                        <span style={{ marginRight: 'auto', minWidth: 0 }}><Editable value={r.nome} onChange={(v) => modifica({ nome: v })} width={110} title={t('tip.nome_risorsa')} /></span>
                      )}
                      {!automatica && (
                        <button
                          style={{ ...styles.buttonMini, padding: '0 6px', color: C.red, flexShrink: 0 }}
                          title={t('tip.rimuovi_risorsa')}
                          onClick={() => aggiorna({ risorse: scheda.risorse.filter((x) => x.id !== r.id) })}
                        >✕</button>
                      )}
                    </div>
                    {/* Riga 2: contatore (− n/max +) e quando si ricarica. */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      <button style={{ ...styles.buttonMini, padding: '1px 7px' }} title={t('tip.spendi')} onClick={() => modifica({ attuali: Math.max(0, r.attuali - 1) })}>−</button>
                      <strong style={{ minWidth: 16, textAlign: 'center', display: 'inline-block', color: r.attuali === r.max ? C.goldDark : (r.attuali === 0 ? C.inkDim : C.ink) }}>{r.attuali}</strong>
                      <button style={{ ...styles.buttonMini, padding: '1px 7px' }} title={t('tip.recupera')} onClick={() => modifica({ attuali: Math.min(r.max, r.attuali + 1) })}>+</button>
                      <span style={styles.detail}>/ {automatica
                        ? <strong>{r.max}</strong>
                        : <Editable value={r.max} tipo="numero" width={30} onChange={(v) => modifica({ max: Math.max(0, v), attuali: Math.min(Math.max(0, v), r.attuali) })} />}
                      </span>
                      {automatica ? (
                        <span style={{ ...styles.detail, fontSize: 10, whiteSpace: 'nowrap', marginLeft: 'auto' }} title={t('tip.quando_ricarica')}>↻ {r.reset === 'breve' ? t('res.breve') : t('res.lungo')}</span>
                      ) : (
                        <select
                          style={{ ...styles.inlineInput, fontSize: 11, padding: '1px 3px', width: 'auto', marginLeft: 'auto' }}
                          value={r.reset}
                          onChange={(e) => modifica({ reset: e.target.value })}
                          title={t('tip.quando_ricarica')}
                        >
                          <option value="">{t("res.manuale")}</option>
                          <option value="breve">{t("res.breve")}</option>
                          <option value="lungo">{t("res.lungo")}</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                <button
                  style={{ ...styles.buttonMini }}
                  onClick={() =>
                    aggiorna({
                      risorse: [...scheda.risorse, { id: Date.now(), nome: t("res.nuova"), attuali: 0, max: 0, reset: 'lungo' }],
                    })
                  }
                >
                  + {t("res.aggiungi")}
                </button>
              </div>
            </Sezione>
          </div>
        </div>{/* fine contenitore Profilo */}
      </section>

        {/* Corpo scheda: tutte le sezioni a piena larghezza */}
        <div className="griglia-scheda">
          {/* display:contents → le sezioni diventano figlie dirette di
              .griglia-scheda, così l'ordine (e il trascinamento) è unico per tutte. */}
          <div style={{ display: 'contents' }}>
            {/* Tratti della specie spostati nel blocco "Privilegi & Talenti" (accanto ai Talenti). */}

            {/* Privilegi di classe/sottoclasse spostati nel blocco "Privilegi & Talenti"
                sotto la Magia (vedi più sotto). */}

            {/* La Metamagia è renderizzata subito SOTTO la Magia (vedi più giù),
                così resta sempre agganciata alla sezione incantesimi. */}
          </div>

          <div style={{ display: 'contents' }}>
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
                    return classificaIncantesimoCombattimento(s).mostraInCombattimento;
                  }).map((s) => {
                    const d = dettagliIncantesimo(s.nome) || {};
                    const db = datiIncantesimo(s.nome) || {};
                    const desc = (s.note || '') + ' ' + (spiegaIncantesimo(s.nome) || '');
                    const danno = s.danno || d.danno || '';
                    const tipoDanno = s.tipoDanno || d.tipoDanno || '';
                    const { isTS } = classificaIncantesimoCombattimento(s);
                    const tsMatch = desc.match(/ts\s+(destrezza|saggezza|costituzione|forza|intelligenza|carisma)/i);
                    const nomeTS = tsMatch ? ` (TS ${tsMatch[1].charAt(0).toUpperCase() + tsMatch[1].slice(1)})` : isTS ? ' (TS)' : '';
                    
                    const modInc = caratteristicaIncantatore ? modificatore(punteggioCaratteristica(scheda, caratteristicaIncantatore)) : 0;
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
                  // Per lanciare incantesimi in combattimento serve un focus (o
                  // borsa da componenti / simbolo sacro) EQUIPAGGIATO nell'inventario.
                  const haFocus = (scheda.inventario || []).some((o) => o.equip && /focus|simbolo sacro|borsa (da )?componenti|bacchetta|cristallo|totem|bastone runico|feticcio/i.test(o.nome || ''));
                  const serveFocus = Boolean(caratteristicaIncantatore) && attacchiSpettro.length > 0;
                  const bloccaSpell = serveFocus && !haFocus;
                  const avvisoFocus = bloccaSpell ? (
                    <div style={{ fontSize: 12, color: C.red, background: 'rgba(200,40,40,0.10)', border: `1px solid ${C.red}`, borderRadius: 8, padding: '6px 10px', marginBottom: 10 }}>
                      🪄 Nessun <strong>focus</strong> equipaggiato: per lanciare incantesimi equipaggia un focus arcano/druidico, un simbolo sacro o una borsa da componenti dall'<strong>Inventario</strong> (spunta “equip.”).
                    </div>
                  ) : null;
                  return [avvisoFocus, ...['Azione', 'Bonus', 'Reazione'].map((cat) => {
                    const arr = listaAttacchiCompleta.filter((a) => (a.categoria || 'Azione') === cat);
                    if (arr.length === 0 && cat !== 'Azione') return null;
                    return (
                      <div key={cat} style={{ marginBottom: 16 }}>
                        {cat !== 'Azione' && (
                          <h3 style={{ fontSize: 13, color: C.inkDim, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${C.border}`, paddingBottom: 4, marginBottom: 8 }}>
                            {cat === 'Bonus' ? t('combat.azioni_bonus') : t('combat.reazioni')}
                          </h3>
                        )}
                        <table className="attacchi-table" style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>{t('combat.col_nome')}</th>
                              <th style={styles.th}>{t('combat.col_bonus')}</th>
                              <th style={styles.th}>{t('combat.col_danno')}</th>
                              <th style={styles.th}>{t('combat.col_note')}</th>
                              <th className="col-azioni" style={styles.th} />
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
                              // Incantesimo senza focus equipaggiato: tiri disabilitati.
                              const castBloccato = a.isSpell && bloccaSpell;
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
                                          {[...ARMI_5E].sort((a, b) => a.nome.localeCompare(b.nome, 'it')).map((w) => <option key={w.nome} value={w.nome}>{w.nome}</option>)}
                                        </select>
                                      )}
                                      <Editable
                                        value={a.nome}
                                        width={130}
                                        onChange={(v) => aggiornaAttacco({ nome: v })}
                                        onRoll={castBloccato ? undefined : () => tiraColpoArma(a)}
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
                                          style={{ ...styles.buttonMini, padding: '1px 6px', opacity: castBloccato ? 0.4 : 1, cursor: castBloccato ? 'not-allowed' : 'pointer' }}
                                          title={castBloccato ? 'Equipaggia un focus per lanciare questo incantesimo' : `Tira per colpire con ${a.nome}`}
                                          disabled={castBloccato}
                                          onClick={() => { if (!castBloccato) tiraColpoArma(a); }}
                                        >🎲</button>
                                        <Editable
                                          value={conSegno(a.bonus)}
                                          width={44}
                                          onChange={(v) => aggiornaAttacco({ bonus: Number(String(v).replace('+', '')) || 0 })}
                                          onRoll={castBloccato ? undefined : () => tiraColpoArma(a)}
                                        />
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ ...styles.td, color: dannoValido ? undefined : C.red }}>
                                    {parseEspressioneDado(a.danno) && (
                                      <button
                                        style={{ ...styles.buttonMini, padding: '1px 6px', marginRight: 4, opacity: castBloccato ? 0.4 : 1, cursor: castBloccato ? 'not-allowed' : 'pointer' }}
                                        title={castBloccato ? 'Equipaggia un focus per lanciare questo incantesimo' : `Tira i danni (${a.danno})`}
                                        disabled={castBloccato}
                                        onClick={() => { if (!castBloccato) tiraDanniPerAttacco(a, false); }}
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
                                  <td className="col-azioni" style={{ ...styles.td, textAlign: 'right' }}>
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
                            placeholder={t('combat.aggiungi_ph')}
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
                          {cat === 'Azione' && <datalist id="wpn-presets">{[...ARMI_5E].sort((a, b) => a.nome.localeCompare(b.nome, 'it')).map((w) => <option key={w.nome} value={w.nome} />)}</datalist>}
                        </div>
                      </div>
                    );
                  })];
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
              className="sezione-magia"
              {...propsSez('incantesimi')}
              {...apertoProps('incantesimi', !!(caratteristicaIncantatore || (scheda.incantesimiLista || []).length > 0))}
              azioni={(
                // Nella riga del titolo: recupera l'altezza di una riga intera.
                <label className="magia-caratteristica" style={{ ...styles.detail, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, textTransform: 'none', letterSpacing: 0 }}>
                  {t('spell.caratteristica')}{' '}
                  <select
                    style={{ ...styles.inlineInput, padding: '3px 6px', fontSize: 12 }}
                    value={caratteristicaIncantatore}
                    onChange={(e) => aggiorna({ incantatore: { caratteristica: e.target.value } })}
                    disabled={Boolean(caratteristicaIncantatorePerClasse(scheda.classe, scheda.sottoclasse))}
                    title={caratteristicaIncantatorePerClasse(scheda.classe, scheda.sottoclasse) ? 'Determinata automaticamente dalla classe' : undefined}
                  >
                    <option value="">{t('spell.non_incantatore')}</option>
                    {CARATTERISTICHE.map((c) => (
                      <option key={c.key} value={c.key}>{t('attr.' + c.key)}</option>
                    ))}
                  </select>
                </label>
              )}
            >
              <div style={{ marginBottom: 14 }}>
                {(() => {
                  const conc = incantesimiConcentrazioneClasse(scheda.classe, scheda.sottoclasse, versione);
                  const bonusCon = bonusTiroSalvezza(scheda, 'costituzione');
                  const attivo = Boolean(scheda.concentrazione);
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, width: '100%', marginTop: 8 }}>
                      {/* Concentrazione: riquadro quadrato, in linea con gli altri tre */}
                      <div style={{ ...styles.vitalBox, padding: '30px 6px 8px', gap: 5, justifyContent: 'flex-start', background: attivo ? 'rgba(201,162,39,0.15)' : C.panelLight, borderColor: attivo ? C.goldDark : C.border }}>
                        <div style={{ ...styles.vitalLabel, color: attivo ? C.goldDark : C.inkDim }}>🧠 {t('conc.label')}</div>
                        <select
                          value={scheda.concentrazione || ''}
                          onChange={(e) => aggiorna({ concentrazione: e.target.value })}
                          style={{ ...styles.inlineInput, fontSize: 12, width: '100%', maxWidth: '100%', padding: '3px 6px', height: 28, textAlign: 'center' }}
                          title={t('conc.scegli')}
                        >
                          <option value="">{t('conc.nessuna')}</option>
                          {attivo && !conc.includes(scheda.concentrazione) && <option value={scheda.concentrazione}>{scheda.concentrazione}</option>}
                          {[...conc].sort((a, b) => a.localeCompare(b, lingua)).map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <button
                          className="tirabile"
                          style={{ ...styles.button, fontSize: 12, fontWeight: 700, padding: '3px 8px', width: '100%', lineHeight: 1.2 }}
                          title={t('conc.ts_tooltip')}
                          onClick={() => lanciaD20(t('conc.ts'), bonusCon)}
                        >
                          🎲 TS {conSegno(bonusCon)}
                        </button>
                        {attivo && (
                          <button style={{ ...styles.buttonMini, position: 'absolute', top: 4, right: 4, fontSize: 10, padding: '0 5px', height: 20, color: C.red, background: C.panel }} title={t('conc.termina')} onClick={() => aggiorna({ concentrazione: '' })}>✕</button>
                        )}
                      </div>
                      {modIncantatore !== null && (
                        <>
                          <div style={{ ...styles.vitalBox, padding: '30px 6px 10px' }}>
                            <div style={styles.vitalLabel}>{t("vital.mod_incantesimi")}</div>
                            <div style={styles.vitalValue}>{conSegno(modIncantatore)}</div>
                          </div>
                          <div style={{ ...styles.vitalBox, padding: '30px 6px 10px' }}>
                            <div style={styles.vitalLabel}>{t("vital.cd_incantesimi")}</div>
                            <div style={styles.vitalValue}>{8 + scheda.bonusCompetenza + modIncantatore}</div>
                          </div>
                          <div style={{ ...styles.vitalBox, padding: '30px 6px 10px' }}>
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
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Gli slot sono ora mostrati all'interno di ciascun livello nella lista. */}

              {/* Conteggi (compatti) + ricerca. L'aggiunta è un tastino piccolo
                  sotto la lista di ogni livello (vedi più in basso). */}
              <div style={{ marginTop: 14, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ ...styles.detail, fontSize: 11, opacity: 0.75 }}>{t('spell.tocca_nome')}</span>
                  <button
                    type="button"
                    onClick={() => setListaMagicaMinimizzata((v) => !v)}
                    title={listaMagicaMinimizzata ? t('spell.espandi_lista_tip') : t('spell.minimizza_lista_tip')}
                    style={{ ...styles.buttonMini, padding: '2px 8px', fontSize: 11 }}
                  >
                    {listaMagicaMinimizzata ? `▸ ${t('spell.espandi_lista')}` : `▾ ${t('spell.minimizza_lista')}`}
                  </button>
                </div>
                <div className="spell-filters" style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 2fr) repeat(3, minmax(105px, 1fr)) auto', gap: 6, alignItems: 'center' }}>
                  <input
                    value={filtroIncantesimo}
                    onChange={(e) => setFiltroIncantesimo(e.target.value)}
                    placeholder={t('spell.cerca')}
                    aria-label={t('spell.cerca')}
                    style={{ ...styles.inlineInput, minWidth: 0, padding: '6px 9px' }}
                  />
                  <select value={filtroLivelloInc} onChange={(e) => setFiltroLivelloInc(e.target.value)} style={{ ...styles.inlineInput, padding: '6px 7px' }} aria-label={t('spell.filtro_livello')}>
                    <option value="">{t('spell.tutti_livelli')}</option>
                    <option value="0">{t('spell.trucchetti')}</option>
                    {Array.from({ length: 9 }, (_, i) => <option key={i + 1} value={String(i + 1)}>{i + 1}°</option>)}
                  </select>
                  <select value={filtroScuolaInc} onChange={(e) => setFiltroScuolaInc(e.target.value)} style={{ ...styles.inlineInput, padding: '6px 7px' }} aria-label={t('spell.filtro_scuola')}>
                    <option value="">{t('spell.tutte_scuole')}</option>
                    {[...new Set(incantesimiVisualizzati.map((s) => s.scuola || datiIncantesimo(s.nome)?.scuola).filter(Boolean))].sort((a, b) => traduciDato(a).localeCompare(traduciDato(b), lingua)).map((scuola) => <option key={scuola} value={scuola}>{traduciDato(scuola)}</option>)}
                  </select>
                  <select value={filtroClasseInc} onChange={(e) => setFiltroClasseInc(e.target.value)} style={{ ...styles.inlineInput, padding: '6px 7px' }} aria-label={t('spell.filtro_classe')}>
                    <option value="">{t('spell.tutte_classi')}</option>
                    {[...new Set(incantesimiVisualizzati.flatMap((s) => s.classi || datiIncantesimo(s.nome)?.classi || []))].sort((a, b) => traduciDato(a).localeCompare(traduciDato(b), lingua)).map((classe) => <option key={classe} value={classe}>{traduciDato(classe)}</option>)}
                  </select>
                  <button type="button" onClick={() => setSoloRitualiInc((v) => !v)} title={t('spell.solo_rituali')}
                    style={{ ...styles.buttonMini, padding: '6px 8px', fontSize: 12, borderColor: soloRitualiInc ? C.goldDark : C.border, color: soloRitualiInc ? C.goldDark : C.inkDim, fontWeight: soloRitualiInc ? 700 : 400 }}>
                    ◯ {t('spell.rituali')}
                  </button>
                </div>
              </div>
              <div>
                {(() => {
                const bannerStyle = { ...styles.panelTitle, fontSize: 15, marginTop: 14, marginBottom: 8, borderBottom: `2px solid ${C.border}`, paddingBottom: 4 };
                const q = filtroIncantesimo.trim().toLowerCase();
                const filtriAttivi = Boolean(q || filtroLivelloInc || filtroScuolaInc || filtroClasseInc || soloRitualiInc);
                const match = (s) => {
                  const d = datiIncantesimo(s.nome) || {};
                  return (!q || (s.nome || '').toLowerCase().includes(q))
                    && (!filtroLivelloInc || Number(s.livello) === Number(filtroLivelloInc))
                    && (!filtroScuolaInc || (s.scuola || d.scuola || '') === filtroScuolaInc)
                    && (!filtroClasseInc || (d.classi || []).includes(filtroClasseInc))
                    && (!soloRitualiInc || d.rituale === true);
                };
                const maxSpellLiv = Math.max(0, ...incantesimiVisualizzati.map(s => s.livello || 0));
                const maxSlotLiv = Math.max(0, ...Object.entries(scheda.slotIncantesimo || {}).filter(([_, v]) => v.totale > 0).map(([k]) => parseInt(k, 10)));
                const maxLiv = Math.min(9, Math.max(caratteristicaIncantatore ? 1 : 0, maxSpellLiv, maxSlotLiv + 1));
                const aggiungiInc = (nome, liv, manuale, bonus) => {
                  const d = dettagliIncantesimo(nome) || { tempo: manuale ? '1 Az.' : 'AZ', gittata: '', note: '' };
                  aggiorna({ incantesimiLista: [...scheda.incantesimiLista,
                    { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, livello: liv, nome, tempo: d.tempo, gittata: d.gittata, note: d.note, scuola: d.scuola || '', area: d.area || '', danno: d.danno || '', tipoDanno: d.tipoDanno || '', preparato: true, ...(bonus ? { bonus: true } : {}) }] });
                };
                const cambiaPreparazione = (s) => {
                  const staPreparando = s.preparato === false;
                  if (staPreparando && preparatiPieni && !s.bonus) return;
                  if (s.catalogo) {
                    const { catalogo: _catalogo, id: _id, desc: _desc, classi: _classi, conc: _conc, rituale: _rituale, ...base } = s;
                    aggiorna({ incantesimiLista: [...scheda.incantesimiLista, {
                      ...base,
                      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                      preparato: true,
                    }] });
                    return;
                  }
                  aggiorna({ incantesimiLista: scheda.incantesimiLista.map((x) => (x.id === s.id ? { ...x, preparato: x.preparato === false } : x)) });
                };
                // Tastino piccolo di aggiunta sotto ogni livello: menu compatto con
                // i suggerimenti di quel livello + "scrivi a mano", e toggle ✦ bonus.
                const AddControl = (liv) => {
                  const suggeriti = incantesimiClasseLivello(scheda.classe, liv, scheda.sottoclasse, versione);
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
                            {[...suggeriti].sort((a, b) => a.localeCompare(b, lingua)).map((n) => <option key={n} value={n} disabled={gia.has(n.toLowerCase())}>{gia.has(n.toLowerCase()) ? `✓ ${n}` : n}</option>)}
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
                  const spells = incantesimiVisualizzati
                    .filter((s) => s.livello === liv && match(s))
                    .sort((a, b) => Number(b.preparato !== false) - Number(a.preparato !== false) || String(a.nome || '').localeCompare(String(b.nome || ''), lingua));
                  if (filtriAttivi && spells.length === 0) return null;
                  const countLiv = scheda.incantesimiLista.filter((x) => x.livello === liv).length;
                  return (
                    <div key={liv} style={{ marginBottom: 14 }}>
                      {liv > 0 && (
                        <h4 style={{ fontSize: 12, color: C.inkDim, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${C.border}`, paddingBottom: 2, marginBottom: 6, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span>{t('spell.n_livello', { n: liv })}</span>
                        </h4>
                      )}
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
                            const scuola = s.scuola || dbInc.scuola || det.scuola || '';
                            const area = s.area || dbInc.area || det.area || '';
                            const danno = s.danno || dbInc.danno || det.danno || '';
                            const tipoDanno = s.tipoDanno || dbInc.tipoDanno || det.tipoDanno || '';
                            const note = s.note || det.note || '';
                            const chip = (icona, etichetta, testo) => (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.inkDim, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '2px 8px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                <span aria-hidden style={{ opacity: 0.75 }}>{icona}</span>
                                <span style={{ opacity: 0.7 }}>{etichetta}:</span> <span style={{ color: C.ink }}>{testo}</span>
                              </span>
                            );
                            return (
                              <div key={s.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', background: C.panelLight, opacity: (classePreparata && s.livello >= 1 && s.preparato === false) ? 0.5 : 1 }}>
                                {/* Nome + info (chip) + pulsanti su UNA sola riga: i dettagli
                                    stanno in una fascia a scorrimento orizzontale, così NON
                                    vanno mai a capo su due/tre righe. */}
                                <div className="spell-row" style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: 6 }}>
                                  <button
                                    style={{ background: 'transparent', border: 'none', color: C.ink, fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: 14, lineHeight: 1.2, textDecoration: 'underline dotted', textUnderlineOffset: 3, whiteSpace: 'nowrap', flexShrink: 0 }}
                                    title={t('tip.cosa_fa_inc')}
                                    onClick={() => setInfo({ titolo: `${s.nome || 'Incantesimo'}${s.livello === 0 ? ' · Trucchetto' : ` · ${s.livello}° livello`}`, testo: eff || 'Nessuna descrizione disponibile per questo incantesimo. Aprilo con ✎ per aggiungere delle note.' })}
                                  >
                                    {s.nome || t('menu.senza_nome')}
                                  </button>
                                  {s.bonus && (
                                    <span
                                      title={t('spell.bonus_badge_tooltip')}
                                      style={{ fontSize: 10, fontWeight: 700, color: C.goldDark, border: `1px solid ${C.goldDark}`, borderRadius: 6, padding: '0 4px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                                      onClick={() => aggiorna({ incantesimiLista: scheda.incantesimiLista.map((x) => (x.id === s.id ? { ...x, bonus: false } : x)) })}
                                    >✦ {t('spell.bonus_badge')}</span>
                                  )}
                                  {/* Fascia dettagli: una sola riga, scorre in orizzontale se serve. */}
                                  <div className="spell-chips" style={{ display: 'flex', flexWrap: 'nowrap', gap: 6, alignItems: 'center', overflowX: 'auto', flex: '1 1 auto', minWidth: 0 }}>
                                    {chip('⏱', t('spell.chip_tempo'), tempoLabel)}
                                    {chip('🎯', t('spell.chip_gittata'), gittata)}
                                    {scuola && chip('🔮', 'Scuola', traduciDato(scuola))}
                                    {area && chip('📐', 'Area', area)}
                                    {/* Danno solo testuale (non tirabile): resta un chip informativo.
                                        Quando è un'espressione di dado valida, il tiro dei danni va
                                        nella riga azioni qui sotto, DOPO il tiro per colpire. */}
                                    {(danno || tipoDanno) && !parseEspressioneDado(danno) && (
                                      chip('💥', 'Danno', [danno, tipoDanno].filter(Boolean).join(' '))
                                    )}
                                    {note && chip('📝', t('spell.chip_note'), note)}
                                  </div>
                                  {/* Tiri (solo per incantesimi con danno): sulla STESSA riga, mai a capo. */}
                                  {parseEspressioneDado(danno) && (
                                    <div className="spell-rolls" style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
                                      <button
                                        style={{ ...styles.buttonMini, fontSize: 12, padding: '3px 8px', fontWeight: 600, borderColor: C.goldDark, color: C.goldDark, whiteSpace: 'nowrap' }}
                                        title={`${t('spell.tira_attacco')} — ${t('spell.colpire')}`}
                                        onClick={() => lanciaD20(`${t('spell.attacco_inc')}: ${s.nome}`, scheda.bonusCompetenza + (modIncantatore || 0), { attacco: { nome: s.nome, danno, tipoDanno, isSpell: true }, magia: true, suono: 'tiro' })}
                                      >🎯 {conSegno(scheda.bonusCompetenza + (modIncantatore || 0))}</button>
                                      <button
                                        className="tirabile"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: C.red, background: C.bg, border: `1px solid ${C.red}`, borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                                        title={t('spell.tira_danni_diretti')}
                                        onClick={() => lanciaDanniDiretti(`${s.nome}${tipoDanno ? ` · ${tipoDanno}` : ''}`, danno, true)}
                                      ><span aria-hidden>💥</span><span>{[danno, tipoDanno].filter(Boolean).join(' ')}</span><span aria-hidden style={{ opacity: 0.65 }}>🎲</span></button>
                                    </div>
                                  )}
                                  {/* Pulsanti azione: restano sulla stessa riga, a destra. */}
                                  <div className="spell-actions" style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                    {classePreparata && s.livello >= 1 && (
                                      <button
                                        style={{ ...styles.buttonMini, color: s.preparato !== false ? C.goldDark : C.inkDim, borderColor: s.preparato !== false ? C.goldDark : C.border }}
                                        title={s.preparato === false && preparatiPieni && !s.bonus ? t('spell.max_tooltip') : (s.preparato !== false ? t('spell.preparato_si') : t('spell.preparato_no'))}
                                        disabled={s.preparato === false && preparatiPieni && !s.bonus}
                                        onClick={() => cambiaPreparazione(s)}
                                      >{s.preparato !== false ? '⭐' : '☆'}</button>
                                    )}
                                    {!s.catalogo && <button style={styles.buttonMini} title={t('tip.modifica')} onClick={() => setDettaglioInc(s.id)}>✎</button>}
                                    {!s.catalogo && <button style={{ ...styles.buttonMini, color: C.red }} title={t('tip.elimina_inc')} onClick={() => aggiorna({ incantesimiLista: scheda.incantesimiLista.filter((x) => x.id !== s.id) })}>🗑</button>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {!filtriAttivi && AddControl(liv)}
                    </div>
                  );
                };
                const livelliInc = Array.from({ length: maxLiv }, (_, i) => i + 1);
                if (filtriAttivi && !incantesimiVisualizzati.some(match)) {
                  return <p style={{ ...styles.detail, textAlign: 'center', padding: '12px 0', opacity: 0.8 }}>{t('spell.nessun_risultato')}</p>;
                }
                return (
                  <>
                    <h3 style={{ ...bannerStyle, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 6 }}>
                      <span />
                      <span>{t('spell.trucchetti')}</span>
                      {maxTrucchetti != null ? (
                        <span style={{ fontSize: 13, color: trucchettiPieno ? C.goldDark : C.inkDim, fontWeight: 'normal', display: 'flex', alignItems: 'center', justifySelf: 'end', textTransform: 'none', letterSpacing: 'normal' }}>
                          {nTrucchetti} / <Editable value={maxTrucchetti} tipo="numero" width={24} onChange={(v) => aggiorna({ maxTrucchetti: Math.max(0, v) })} />
                        </span>
                      ) : <span />}
                    </h3>
                    {!listaMagicaMinimizzata && renderLivello(0)}
                    {maxLiv >= 1 && (
                      <h3 style={{ ...bannerStyle, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 6 }}>
                        <span />
                        <span>{t('spell.incantesimi')}</span>
                        {maxIncantesimi != null ? (
                          <span style={{ fontSize: 13, color: (classePreparata ? preparatiPieni : incantesimiPieno) ? C.goldDark : C.inkDim, fontWeight: 'normal', display: 'flex', alignItems: 'center', justifySelf: 'end', textTransform: 'none', letterSpacing: 'normal' }}>
                            ({classePreparata ? t('spell.preparati') : t('spell.conosciuti')}: {classePreparata ? nPreparati : nIncantesimi} / <Editable value={maxIncantesimi} tipo="numero" width={24} onChange={(v) => aggiorna({ maxIncantesimi: Math.max(0, v) })} />)
                            {nBonus > 0 && <span style={{ color: C.goldDark, fontWeight: 700, marginLeft: 4 }}>✦ {nBonus}</span>}
                          </span>
                        ) : <span />}
                      </h3>
                    )}
                    {!listaMagicaMinimizzata && livelliInc.map((liv) => renderLivello(liv))}
                  </>
                );
                })()}
              </div>
            </Sezione>

            {/* Metamagia (solo Stregone): SEMPRE subito sotto la Magia. Ordine
                agganciato a 'incantesimi' e in DOM dopo la sezione Magia; non è
                trascinabile, così resta sempre attaccata alla Magia. */}
            {/(stregone|sorcerer)/i.test(scheda.classe || '') && (
              <Sezione titolo={t("sez.metamagia")} style={{ order: ordineSezioni.indexOf('incantesimi') }} {...apertoProps('metamagia', false)}>
                <div style={{ ...styles.detail, fontSize: 12, marginBottom: 8 }}>
                  {t("meta.desc")}
                </div>
                {(() => {
                  const risorse = scheda.risorse || [];
                  const idx = risorse.findIndex((r) => /stregoneria/i.test(r.nome || ''));
                  const r = idx >= 0 ? risorse[idx] : null;
                  const modR = (patch) => aggiorna({ risorse: risorse.map((x, i) => (i === idx ? { ...x, ...patch } : x)) });
                  if (!r) {
                    const L = Math.max(1, scheda.livello || 1);
                    return (
                      <button
                        style={{ ...styles.buttonMini, borderColor: C.goldDark, color: C.goldDark, marginBottom: 10 }}
                        title="Aggiunge i Punti Stregoneria (compaiono anche in Risorse di classe)"
                        onClick={() => aggiorna({ risorse: [...risorse, { id: 'auto-punti-stregoneria', nome: 'Punti Stregoneria', attuali: L, max: L, reset: 'lungo' }] })}
                      >✨ Aggiungi Punti Stregoneria</button>
                    );
                  }
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap', fontSize: 13 }}>
                      <span style={{ ...styles.detail, fontWeight: 700, color: C.goldDark }}>✨ Punti Stregoneria</span>
                      <button style={{ ...styles.buttonMini, padding: '1px 7px' }} title="Spendi 1 punto" onClick={() => modR({ attuali: Math.max(0, r.attuali - 1) })}>−</button>
                      <strong style={{ minWidth: 18, textAlign: 'center', color: r.attuali === 0 ? C.inkDim : C.ink }}>{r.attuali}</strong>
                      <button style={{ ...styles.buttonMini, padding: '1px 7px' }} title="Recupera 1 punto" onClick={() => modR({ attuali: Math.min(r.max, r.attuali + 1) })}>+</button>
                      <span style={styles.detail}>/ <Editable value={r.max} tipo="numero" width={30} onChange={(v) => modR({ max: Math.max(0, v), attuali: Math.min(Math.max(0, v), r.attuali) })} /></span>
                      <span style={{ ...styles.detail, fontSize: 11, opacity: 0.75 }}>· sincronizzati con Risorse di classe</span>
                    </div>
                  );
                })()}

                {/* Fonte di Magia: converte i Punti Stregoneria in slot già
                    spesi e viceversa. Tocca sia i punti (una risorsa) sia gli
                    slot, quindi scrive con un solo aggiorna() per non perdere
                    una delle due modifiche. */}
                {(() => {
                  const risorse = scheda.risorse || [];
                  const idx = risorse.findIndex((r) => /stregoneria/i.test(r.nome || ''));
                  if (idx < 0) return null;
                  const r = risorse[idx];
                  const applica = (esito) => {
                    if (!esito.ok) { setInfo({ titolo: '✨ Fonte di Magia', testo: esito.motivo }); return; }
                    aggiorna({
                      slotIncantesimo: esito.slotIncantesimo,
                      risorse: risorse.map((x, i) => (i === idx ? { ...x, attuali: esito.punti } : x)),
                    });
                  };
                  const slotOra = scheda.slotIncantesimo || {};
                  return (
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
                      <div style={{ ...styles.detail, fontWeight: 700, marginBottom: 2 }}>🔄 Fonte di Magia</div>
                      <div style={{ ...styles.detail, fontSize: 11, marginBottom: 8 }}>
                        Converti i punti in uno slot già speso, o brucia uno slot per riavere punti.
                      </div>
                      <div style={{ ...styles.detail, fontSize: 11, marginBottom: 4 }}>Punti → slot (recupera uno slot speso):</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                        {LIVELLI_CONVERTIBILI.map((liv) => {
                          const costo = COSTO_SLOT_IN_PUNTI[liv];
                          const possibile = puntiVersoSlot(slotOra, r.attuali, liv).ok;
                          return (
                            <button
                              key={liv}
                              style={{ ...styles.buttonMini, padding: '2px 7px', opacity: possibile ? 1 : 0.45 }}
                              title={`Spendi ${costo} punti per recuperare uno slot di ${liv}° livello`}
                              onClick={() => applica(puntiVersoSlot(slotOra, r.attuali, liv))}
                            >{liv}° <span style={{ opacity: 0.7 }}>({costo}p)</span></button>
                          );
                        })}
                      </div>
                      <div style={{ ...styles.detail, fontSize: 11, marginBottom: 4 }}>Slot → punti (spendi uno slot disponibile):</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {Object.keys(slotOra)
                          .map(Number)
                          .filter((liv) => liv >= 1 && (slotOra[liv]?.totale || 0) > 0)
                          .sort((a, b) => a - b)
                          .map((liv) => {
                            const possibile = slotVersoPunti(slotOra, r.attuali, r.max, liv).ok;
                            return (
                              <button
                                key={liv}
                                style={{ ...styles.buttonMini, padding: '2px 7px', opacity: possibile ? 1 : 0.45 }}
                                title={`Spendi uno slot di ${liv}° livello per ottenere ${liv} Punti Stregoneria`}
                                onClick={() => applica(slotVersoPunti(slotOra, r.attuali, r.max, liv))}
                              >{liv}° <span style={{ opacity: 0.7 }}>(+{liv}p)</span></button>
                            );
                          })}
                      </div>
                    </div>
                  );
                })()}
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

            {/* Privilegi (classe + sottoclasse affiancati) e Talenti, subito sotto la
                Magia. I box mostrano SOLO la Panoramica: apre la lista dei privilegi
                per livello e, cliccando un privilegio, la sua spiegazione. */}
            <div className="privilegi-talenti" style={{ order: ordineSezioni.indexOf('incantesimi'), display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="privilegi-duo">
                <Sezione titolo={t("sez.privilegi")} {...apertoProps('privilegi')}>
                  <button
                    style={{ ...styles.button, width: '100%', fontSize: 12 }}
                    onClick={() => setMostraPrivilegi(true)}
                    title={t('tip.panoramica_priv')}
                  >
                    📖 {t("priv.panoramica_btn")}
                  </button>
                </Sezione>
                <Sezione titolo={t("sez.privilegi_sottoclasse")} {...apertoProps('privilegiSottoclasse')}>
                  {scheda.sottoclasse && SUBCLASS_PRIVILEGI[scheda.sottoclasse] ? (
                    <button
                      style={{ ...styles.button, width: '100%', fontSize: 12 }}
                      onClick={() => setMostraPrivilegiSub(true)}
                      title={t('tip.panoramica_priv_sub')}
                    >
                      📖 {t("priv.panoramica_sub_btn")}
                    </button>
                  ) : (
                    <p style={{ ...styles.detail, fontSize: 12, margin: 0 }}>{t('priv.sub_nessuna')}</p>
                  )}
                </Sezione>
              </div>
              {/* Talenti e Tratti della specie: sotto, come coppia di riquadri
                  della stessa dimensione dei Privilegi (classe/sottoclasse). */}
              <div className="privilegi-duo">
                <Sezione titolo={t("sez.talenti")} {...apertoProps('talenti')}>
                  <ListaQuadratini
                    value={scheda.talenti}
                    lookup={spiegaTalento}
                    opzioni={TALENTI_5E}
                    placeholder={t("talenti.ph")}
                    onChange={(v) => aggiorna({ talenti: v })}
                  />
                </Sezione>
                <Sezione titolo={t("sez.tratti_specie")} {...apertoProps('trattiSpecie')}>
                  <ListaQuadratini
                    value={scheda.trattiSpecie}
                    lookup={spiegaTratto}
                    placeholder={t("tratti.ph")}
                    onChange={(v) => aggiorna({ trattiSpecie: v })}
                  />
                </Sezione>
              </div>
            </div>


          </div>

          {/* Sezioni descrittive: anch'esse figlie dirette di .griglia-scheda
              (display:contents) così rientrano nell'unico ordine riordinabile. */}
          <div style={{ display: 'contents' }}>

            {/* Equipaggiamento, aspetto — collassabili */}
            <Sezione titolo={t("sez.equipaggiamento")} {...propsSez('equipaggiamento')} {...apertoProps('equipaggiamento')}>
              {(() => {
                const inv = scheda.inventario || [];
                const pesoInv = inv.reduce((s, o) => s + (o.qta || 1) * (o.peso || 0), 0);
                // Peso di armi e armatura equipaggiate (tutto ciò che ho addosso).
                // Le armi che sono GIÀ nell'inventario non vengono ricontate qui
                // (altrimenti equipaggiare un oggetto già posseduto ne raddoppia il peso).
                const attacchi = Array.isArray(scheda.attacchi) ? scheda.attacchi : [];
                const nomiInv = new Set(inv.map((o) => (o.nome || '').trim().toLowerCase()));
                const pesoArmi = attacchi.reduce((s, a) => (nomiInv.has((a.nome || '').trim().toLowerCase()) ? s : s + pesoStimato(a.nome)), 0);
                const pesoArm = pesoArmatura(scheda.armatura);
                // Peso delle monete: conta nel totale ed è mostrato come riga fra gli oggetti.
                const dMon = scheda.denari || {};
                const numMonete = (dMon.mr || 0) + (dMon.ma || 0) + (dMon.me || 0) + (dMon.mo || 0) + (dMon.mp || 0);
                const pesoMonete = numMonete * 0.01;
                const forza = punteggioCaratteristica(scheda, 'forza') || 10;
                // Borsa Conservante equipaggiata: spazio extradimensionale (~250 kg).
                // Gli oggetti CONTRASSEGNATI come "dentro borsa" (dentroBorsa: true)
                // non pesano nulla sull'ingombro. La borsa stessa pesa il suo peso (15 lb = 6.8 kg).
                const borsaEquip = inv.find((o) => o.equip && /borsa\s+conservante|bag of holding/i.test(o.nome || ''));
                const capBonusBorsa = borsaEquip ? 250 : 0;
                const moltiTaglia = ({ Minuscola: 0.5, Piccola: 1, Media: 1, Grande: 2, Enorme: 4, Mastodontica: 8 })[scheda.taglia] || 1;
                const capFisica = capacitaCarico(forza) * moltiTaglia;
                const cap = capFisica + capBonusBorsa;
                // Peso totale ESCLUSO ciò che sta dentro la Borsa Conservante equipaggiata
                const pesoDentroBorsa = borsaEquip
                  ? inv.filter((o) => o.dentroBorsa).reduce((s, o) => s + (o.qta || 1) * (o.peso || 0), 0)
                  : 0;
                const pesoTot = pesoInv + pesoArmi + pesoArm + pesoMonete - pesoDentroBorsa;
                const soglia1 = forza * 2.5 * moltiTaglia; // ingombrato
                const soglia2 = forza * 5 * moltiTaglia;   // gravemente ingombrato
                const spingiTrascina = capFisica * 2;
                const stato = pesoTot > cap ? 'sovraccarico' : pesoTot > soglia2 ? 'grave' : pesoTot > soglia1 ? 'ingombrato' : 'ok';
                // Barra dell'ingombro con colori espliciti: verde (a posto) →
                // arancione (ingombrato) → rosso (grave/sovraccarico), a prescindere dal tema.
                const colore = stato === 'ok' ? '#3e9b4f' : stato === 'ingombrato' ? '#e08a1e' : '#c0392b';
                const perc = Math.min(100, (pesoTot / cap) * 100);
                const modInv = (id, patch) => aggiorna({ inventario: inv.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
                const sintoniaArr = Array.isArray(scheda.sintonia) ? scheda.sintonia : (scheda.sintonia ? [scheda.sintonia] : []);
                const normalizzaNomeOggetto = (v) => String(v || '').toLocaleLowerCase('it').replace(/[^a-zà-ÿ0-9]/gi, ' ').replace(/\s+/g, ' ').trim();
                const indiceSintonia = (nome) => {
                  const n = normalizzaNomeOggetto(nome);
                  return sintoniaArr.findIndex((s) => {
                    const voce = normalizzaNomeOggetto(s);
                    return n && voce && (voce.includes(n) || n.includes(voce));
                  });
                };
                const toggleSintonia = (o) => {
                  const indice = indiceSintonia(o.nome);
                  if (indice >= 0) {
                    aggiorna({ sintonia: sintoniaArr.filter((_, i) => i !== indice) });
                    return;
                  }
                  const occupati = sintoniaArr.filter((s) => String(s || '').trim());
                  if (occupati.length >= 3) {
                    setInfo({ titolo: t('equip.sintonia'), testo: t('inv.sintonia_piena') });
                    return;
                  }
                  aggiorna({ sintonia: [...occupati, o.nome] });
                };
                const rinominaItem = (o, nome) => {
                  const indice = indiceSintonia(o.nome);
                  const nuovaSintonia = indice < 0 ? sintoniaArr : sintoniaArr.map((s, i) => (i === indice ? nome : s));
                  aggiorna({
                    inventario: inv.map((x) => (x.id === o.id ? completaUtilizziOggetto({ ...x, nome }) : x)),
                    sintonia: nuovaSintonia,
                  });
                };
                const eliminaItem = (o) => {
                  const indice = indiceSintonia(o.nome);
                  aggiorna({
                    inventario: inv.filter((x) => x.id !== o.id),
                    ...(indice >= 0 ? { sintonia: sintoniaArr.filter((_, i) => i !== indice) } : {}),
                  });
                };
                const toggleEquip = (o, checked) => {
                  // 1) Scudo: aggiorna il flag scudo del riquadro CA.
                  if (eScudo(o.nome)) {
                    aggiorna({
                      inventario: inv.map((x) => (x.id === o.id ? { ...x, equip: checked } : x)),
                      armatura: { ...scheda.armatura, scudo: checked },
                    });
                    return;
                  }
                  // 2) Armatura: equipaggiandola la CA si calcola dal tipo/base; togliendola
                  //    si torna "senza armatura" (come per le armi nella sezione Combattimento).
                  const armInfo = trovaArmatura(o.nome);
                  if (armInfo) {
                    const nuovaArmatura = checked
                      ? { ...scheda.armatura, tipo: armInfo.tipo, base: armInfo.base, nome: o.nome }
                      : { ...scheda.armatura, tipo: 'nessuna', base: 0, nome: '' };
                    aggiorna({
                      // Se sto equipaggiando questa armatura, tolgo il flag "equip" da eventuali
                      // altre armature (se ne indossa una sola alla volta).
                      inventario: inv.map((x) => {
                        if (x.id === o.id) return { ...x, equip: checked };
                        if (checked && trovaArmatura(x.nome) && !eScudo(x.nome)) return { ...x, equip: false };
                        return x;
                      }),
                      armatura: nuovaArmatura,
                    });
                    return;
                  }
                  // 3) Arma: come prima, la aggiunge/rimuove dalla sezione Combattimento.
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
                  // Peso automatico dal nome: calcolato DOPO che completaUtilizziOggetto
                  // ha eventualmente corretto il nome (es. "Mantello Prot." → "Mantello
                  // della Protezione"), altrimenti la ricerca del peso fallisce sul nome
                  // abbreviato e resta a 0 anche quando l'oggetto è noto.
                  const base = completaUtilizziOggetto({ id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, nome: nome || '', qta: 1, peso: 0, equip: false, categoria: '' });
                  aggiorna({ inventario: [...inv, { ...base, peso: pesoStimato(base.nome) }] });
                };
                return (
                  <div>
                    {/* Riepilogo ingombro automatico */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, ...styles.detail, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700 }}>⚖️ {t('inv.ingombro')}: <span style={{ color: colore }}>{pesoTot.toFixed(1)} / {cap.toFixed(0)} kg</span></span>
                        {stato !== 'ok' && <span style={{ color: colore, fontWeight: 700 }}>{t('inv.stato_' + stato)}</span>}
                      </div>
                      <div style={{ ...styles.detail, marginTop: 2, fontSize: 10 }}>
                        Taglia {scheda.taglia || 'Media'} ×{moltiTaglia} · Spingi/trascina/solleva fino a {spingiTrascina.toFixed(0)} kg
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
                    {(inv.length > 0 || numMonete > 0) && (
                      <div className="inventario-wrap" style={{ overflowX: 'auto' }}>
                        <table className="inventario-table" style={styles.table}>
                          <thead><tr>
                            <th style={styles.th} title={t('inv.equip_tooltip')}>{t('inv.equip')}</th>
                            <th style={styles.th}>{t('inv.nome')}</th>
                            <th style={styles.th}>{t('inv.qta')}</th>
                            <th style={{ ...styles.th, textAlign: 'center' }} title={t('inv.sintonia_tooltip')}>{t('inv.sintonia')}</th>
                            <th style={styles.th}>{t('inv.peso')}</th>
                            <th style={styles.th} />
                          </tr></thead>
                          <tbody>
                            {inv.filter((o) => !filtroInventario || (o.nome || '').toLowerCase().includes(filtroInventario.trim().toLowerCase())).sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'it', { sensitivity: 'base' })).map((o) => {
                              const isWeapon = ARMI_5E.some((w) => w.nome === o.nome) || attacchi.some((a) => a.nome === o.nome);
                              const isEquip = isWeapon ? attacchi.some((a) => a.nome === o.nome) : !!o.equip;
                              const isSintonizzato = indiceSintonia(o.nome) >= 0;
                              const effettoAttivo = !!o.effettoMeccanico && isEquip && (!o.richiedeSintonia || isSintonizzato);
                              // Effetto e Utilizzi sono dettagli dello STESSO oggetto: niente riga
                              // divisoria fra il nome e le sue righe di dettaglio, che restano
                              // "attaccate" come un unico blocco (bordo solo dopo l'ultima).
                              const mostraEffetto = effettoInventarioAperto === o.id || o.effettoMeccanico;
                              const mostraUtilizzi = o.usiMax > 0;
                              const senzaBordo = { borderBottom: 'none' };
                              return (
                                <Fragment key={o.id}>
                                <tr className="inventario-riga" style={{ opacity: isEquip ? 1 : 0.82 }}>
                                  <td data-label={t('inv.equip')} style={{ ...styles.td, textAlign: 'center', ...((mostraEffetto || mostraUtilizzi) && senzaBordo) }}>
                                    <input type="checkbox" checked={isEquip} onChange={(e) => toggleEquip(o, e.target.checked)} title={t('inv.equip_tooltip')} />
                                  </td>
                                  <td data-label={t('inv.nome')} style={{ ...styles.td, ...((mostraEffetto || mostraUtilizzi) && senzaBordo) }}><Editable value={o.nome} width={150} onChange={(v) => rinominaItem(o, v)} /></td>
                                  <td data-label={t('inv.qta')} style={{ ...styles.td, ...((mostraEffetto || mostraUtilizzi) && senzaBordo) }}>×<Editable value={o.qta} tipo="numero" width={30} onChange={(v) => modInv(o.id, { qta: Math.max(1, v) })} /></td>
                                  <td data-label={t('inv.sintonia')} style={{ ...styles.td, textAlign: 'center', ...((mostraEffetto || mostraUtilizzi) && senzaBordo) }}>
                                    <button
                                      type="button"
                                      aria-pressed={isSintonizzato}
                                      aria-label={isSintonizzato ? t('inv.sintonizzato') : t('inv.non_sintonizzato')}
                                      title={isSintonizzato ? t('inv.sintonizzato') : t('inv.non_sintonizzato')}
                                      onClick={() => toggleSintonia(o)}
                                      style={{ border: 0, background: 'transparent', padding: '1px 5px', fontSize: 20, lineHeight: 1, color: isSintonizzato ? C.goldDark : C.inkDim, cursor: 'pointer' }}
                                    >{isSintonizzato ? '✦' : '◇'}</button>
                                  </td>
                                  <td data-label={t('inv.peso')} style={{ ...styles.td, color: C.inkDim, whiteSpace: 'nowrap', ...((mostraEffetto || mostraUtilizzi) && senzaBordo) }}><Editable value={o.peso} tipo="numero" width={40} onChange={(v) => modInv(o.id, { peso: Math.max(0, v) })} /> kg</td>
                                  <td className="inventario-azioni" style={{ ...styles.td, textAlign: 'right', whiteSpace: 'nowrap', ...((mostraEffetto || mostraUtilizzi) && senzaBordo) }}>
                                    <button
                                      style={{ ...styles.buttonMini, color: effettoAttivo ? C.goldDark : C.inkDim, borderColor: effettoAttivo ? C.goldDark : C.border }}
                                      title={t('inv.gestisci_effetti')}
                                      onClick={() => setEffettoInventarioAperto((id) => id === o.id ? null : o.id)}
                                    >✨</button>{' '}
                                    <button style={styles.buttonMini} title={t('inv.gestisci_utilizzi')} onClick={() => modInv(o.id, o.usiMax > 0 ? { usi: undefined, usiMax: 0, ricarica: '', effetto: '' } : { usi: 1, usiMax: 1, ricarica: 'manuale' })}>⚡</button>{' '}
                                    <button style={{ ...styles.buttonMini, color: C.red }} title={t('modal.elimina')} onClick={() => eliminaItem(o)}>🗑</button>
                                  </td>
                                </tr>
                                {mostraEffetto && (
                                  <tr style={{ background: effettoAttivo ? 'rgba(201,162,39,0.08)' : 'rgba(0,0,0,0.035)' }}>
                                    <td style={{ ...styles.td, ...(mostraUtilizzi && senzaBordo) }} />
                                    <td colSpan={5} style={{ ...styles.td, paddingTop: 5, paddingBottom: 7, ...(mostraUtilizzi && senzaBordo) }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <strong style={{ fontSize: 12 }}>✨ {t('inv.effetto')}</strong>
                                        <select
                                          value={o.effettoMeccanico || ''}
                                          onChange={(e) => modInv(o.id, { effettoMeccanico: e.target.value, richiedeSintonia: !!e.target.value })}
                                          style={{ ...styles.inlineInput, flex: '1 1 250px', minWidth: 190, padding: '4px 7px', fontSize: 12 }}
                                        >
                                          <option value="">{EFFETTI_OGGETTO[0][lingua === 'it' ? 1 : 2]}</option>
                                          {EFFETTI_OGGETTO.slice(1).sort((a, b) => a[lingua === 'it' ? 1 : 2].localeCompare(b[lingua === 'it' ? 1 : 2], lingua)).map(([id, labelIt, labelEn]) => <option key={id} value={id}>{lingua === 'it' ? labelIt : labelEn}</option>)}
                                        </select>
                                        {!!o.effettoMeccanico && (
                                          <span style={{ ...styles.detail, fontSize: 11, whiteSpace: 'nowrap' }} title={t('inv.richiede_sintonia_tip')}>
                                            🔗 {t('inv.richiede_sintonia')}
                                          </span>
                                        )}
                                        <span title={t('inv.effetto_inattivo')} style={{ color: effettoAttivo ? C.green : C.inkDim, fontSize: 12 }}>
                                          {effettoAttivo ? '●' : '○'}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                                {o.usiMax > 0 && (
                                  <tr style={{ background: 'rgba(0,0,0,0.035)' }}>
                                    <td style={styles.td} />
                                    <td colSpan={5} style={{ ...styles.td, paddingTop: 4, paddingBottom: 7 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                                        <strong style={{ fontSize: 12 }}>⚡ {t('inv.utilizzi')}</strong>
                                        <button style={styles.buttonMini} onClick={() => modInv(o.id, { usi: Math.max(0, (Number(o.usi) || 0) - 1) })}>−</button>
                                        <Editable value={Math.min(Number(o.usi) || 0, Number(o.usiMax) || 1)} tipo="numero" width={30} onChange={(v) => modInv(o.id, { usi: Math.max(0, Math.min(Number(o.usiMax) || 1, v)) })} />
                                        <span>/</span>
                                        <Editable value={o.usiMax || 1} tipo="numero" width={30} onChange={(v) => modInv(o.id, { usiMax: Math.max(1, v), usi: Math.min(Number(o.usi) || 0, Math.max(1, v)) })} />
                                        <button style={styles.buttonMini} onClick={() => modInv(o.id, { usi: Math.min(Number(o.usiMax) || 1, (Number(o.usi) || 0) + 1) })}>＋</button>
                                        <span style={{ fontSize: 12 }}>{t('inv.ricarica')}:</span>
                                        <select value={o.ricarica || 'manuale'} onChange={(e) => modInv(o.id, { ricarica: e.target.value })} style={{ ...styles.inlineInput, width: 'auto', padding: '3px 6px', fontSize: 12 }}>
                                          {['alba', 'breve', 'lungo', 'manuale'].sort((a, b) => t(`inv.${a}`).localeCompare(t(`inv.${b}`), 'it')).map((r) => <option key={r} value={r}>{t(`inv.${r}`)}</option>)}
                                        </select>
                                        {o.effetto && <button style={styles.buttonMini} title={o.effetto} onClick={() => setInfo({ titolo: o.nome, testo: o.effetto })}>ⓘ</button>}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                                </Fragment>
                              );
                            })}
                            {(!filtroInventario || 'monete'.includes(filtroInventario.trim().toLowerCase())) && (
                              <tr className="inventario-riga inventario-monete" style={{ opacity: 0.9 }} title="Monete d'oro: modificando qui aggiorni la sezione Monete (e viceversa). Il peso di tutte le monete è contato nell'ingombro.">
                                <td data-label={t('inv.equip')} style={{ ...styles.td, textAlign: 'center' }}>
                                  <IconaMonetaOro />
                                </td>
                                <td data-label={t('inv.nome')} style={styles.td}>Monete d'oro (MO)</td>
                                <td data-label={t('inv.qta')} style={styles.td}>
                                  <Editable value={dMon.mo || 0} tipo="numero" width={44} onChange={(v) => aggiorna({ denari: { ...scheda.denari, mo: Math.max(0, v) } })} title="Monete d'oro: sincronizzate con la sezione Monete" />
                                </td>
                                <td data-label={t('inv.sintonia')} style={{ ...styles.td, textAlign: 'center', color: C.inkDim }}>—</td>
                                <td data-label={t('inv.peso')} style={{ ...styles.td, color: C.inkDim, whiteSpace: 'nowrap' }}>{pesoMonete.toFixed(2)} kg{numMonete > (dMon.mo || 0) ? ` · ${numMonete} monete tot.` : ''}</td>
                                <td className="inventario-azioni" style={styles.td} />
                              </tr>
                            )}
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
                      <select
                        value=""
                        onChange={(e) => { if (e.target.value) addItem(e.target.value); }}
                        style={{ ...styles.inlineInput, flex: '0 1 230px', minWidth: 180, padding: '6px 28px 6px 8px' }}
                        aria-label={t('inv.scegli_oggetto')}
                      >
                        <option value="">▾ {t('inv.scegli_oggetto')}</option>
                        {NOMI_OGGETTI.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
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
                  // I due pannelli si allungano alla stessa altezza (alignItems
                  // stretch): niente spazio morto sotto quello più corto.
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'stretch', marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ background: C.panelLight, padding: '12px 14px', borderRadius: 8, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
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
                    
                    <div style={{ background: C.panelLight, padding: '12px 14px', borderRadius: 8, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ ...styles.panelTitle, marginBottom: 8 }}>{t('monete.titolo')}</div>
                      {(() => {
                        const d = scheda.denari || {};
                        const totMo = ((d.mr || 0) / 100) + ((d.ma || 0) / 10) + ((d.me || 0) / 2) + (d.mo || 0) + ((d.mp || 0) * 10);
                        const numMonete = (d.mr || 0) + (d.ma || 0) + (d.me || 0) + (d.mo || 0) + (d.mp || 0);
                        const pesoMonete = numMonete * 0.01; // 50 monete = 0.5 kg (0.01 kg a moneta)
                        return (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-start', minWidth: 0 }}>
                              <button
                                style={{ ...styles.buttonMini, fontSize: 11, color: C.goldDark, borderColor: C.goldDark, whiteSpace: 'nowrap' }}
                                title={t('monete.converti_tip')}
                                onClick={() => {
                                  const mr = d.mr || 0;
                                  const ma = d.ma || 0;
                                  const addMo = Math.floor(mr / 100) + Math.floor(ma / 10);
                                  if (addMo > 0) aggiorna({ denari: { ...d, mr: mr % 100, ma: ma % 10, mo: (d.mo || 0) + addMo } });
                                  else alert(t('monete.insufficienti'));
                                }}
                              >🔄 {t('monete.converti')}</button>
                            </div>
                            <div title={t('monete.totale_tip', { n: numMonete })} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 7, minWidth: 0, fontSize: 12, color: C.goldDark, fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <IconaMonetaOro size={18} />
                              <span>≈ {totMo.toFixed(2)} MO · {pesoMonete.toFixed(2)} kg</span>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="griglia-monete" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 8, marginTop: 'auto' }}>
                        {DENARI.map(({ key, label, abbr }) => (
                          <div key={key} style={{ ...styles.vitalBox, minHeight: 'auto', padding: '26px 4px 6px', background: C.bg }} title={label}>
                            <div style={{ ...styles.vitalLabel, fontSize: 11, height: 'auto', whiteSpace: 'nowrap' }}>{abbr}</div>
                            <div style={{ ...styles.vitalValue, fontSize: 18 }}>
                              <Editable value={scheda.denari[key]} tipo="numero" width={44} onChange={(v) => aggiorna({ denari: { ...scheda.denari, [key]: Math.max(0, v) } })} />
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

            {/* Diario di sessione: voci datate legate al singolo personaggio.
                Le più recenti in cima, così l'ultima sessione resta subito
                sotto il titolo anche quando il diario diventa lungo. */}
            <Sezione titolo={t("sez.diario")} {...propsSez('diario')} {...apertoProps('diario', false)}>
              {(() => {
                const diario = Array.isArray(scheda.diario) ? scheda.diario : [];
                const modificaVoce = (id, patch) =>
                  aggiorna({ diario: diario.map((v) => (v.id === id ? { ...v, ...patch } : v)) });
                const oggi = new Date().toISOString().slice(0, 10);
                return (
                  <>
                    <button
                      className="no-stampa"
                      style={{ ...styles.buttonMini, borderColor: C.goldDark, color: C.goldDark, marginBottom: 10 }}
                      onClick={() => aggiorna({
                        diario: [{ id: `d-${Date.now()}`, data: oggi, titolo: '', testo: '' }, ...diario],
                      })}
                    >＋ {t('diario.aggiungi')}</button>

                    {diario.length === 0 && (
                      <div style={{ ...styles.detail, fontSize: 12 }}>{t('diario.vuoto')}</div>
                    )}

                    {diario.map((v) => (
                      <div key={v.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <input
                            type="date"
                            value={v.data || ''}
                            onChange={(e) => modificaVoce(v.id, { data: e.target.value })}
                            style={{ ...styles.inlineInput, padding: '3px 6px', fontSize: 12, width: 140 }}
                          />
                          <input
                            value={v.titolo || ''}
                            placeholder={t('diario.titolo_ph')}
                            onChange={(e) => modificaVoce(v.id, { titolo: e.target.value })}
                            style={{ ...styles.inlineInput, flex: '1 1 200px', minWidth: 140, padding: '3px 6px', fontSize: 13, fontWeight: 700 }}
                          />
                          <button
                            className="no-stampa"
                            style={{ ...styles.buttonMini, padding: '0 7px', color: C.red, flexShrink: 0 }}
                            title={t('diario.elimina')}
                            onClick={() => setConferma({
                              titolo: t('sez.diario'),
                              testo: t('diario.elimina_conferma'),
                              onConferma: () => aggiorna({ diario: diario.filter((x) => x.id !== v.id) }),
                            })}
                          >✕</button>
                        </div>
                        <AreaTesto
                          value={v.testo || ''}
                          placeholder={t('diario.testo_ph')}
                          onChange={(nuovo) => modificaVoce(v.id, { testo: nuovo })}
                        />
                      </div>
                    ))}
                  </>
                );
              })()}
            </Sezione>
          </div>
        </div>
          </>
        )}

        <footer style={{ textAlign: 'center', margin: '18px 0 0', fontSize: 11, color: C.inkDim }}>
          Emblemi di classe e specie:{' '}
          <a href="https://game-icons.net" target="_blank" rel="noreferrer" style={{ color: C.inkDim }}>game-icons.net</a>{' '}
          (CC BY 3.0).
        </footer>
        <div style={{ height: combat.attivo && combat.aperto ? 220 : 0 }} />
      </main>

      {/* ===== Visore della mappa della campagna ===== */}
      {mappaAperta && mappaCampagna && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 2600, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column' }}
          onClick={() => setMappaAperta(false)}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: C.panel, borderBottom: `1px solid ${C.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <strong style={{ color: 'var(--c-title)', fontSize: 15 }}>🗺️ {t('mappa.titolo')}</strong>
            <span style={{ flex: 1 }} />
            <button style={{ ...styles.buttonMini, ...(mappaScala === 0 ? { borderColor: C.gold, color: C.gold } : {}) }} onClick={() => setMappaScala(0)} title={t('mappa.adatta_tip')}>🖥 {t('mappa.adatta')}</button>
            <button style={styles.buttonMini} onClick={() => setMappaScala((s) => Math.max(0.5, (s === 0 ? 1 : s) - 0.5))} title={t('mappa.riduci')}>➖</button>
            <span style={{ fontSize: 12, minWidth: 42, textAlign: 'center', fontWeight: 'bold' }}>{mappaScala === 0 ? 'fit' : `${Math.round(mappaScala * 100)}%`}</span>
            <button style={styles.buttonMini} onClick={() => setMappaScala((s) => Math.min(6, (s === 0 ? 1 : s) + 0.5))} title={t('mappa.ingrandisci')}>➕</button>
            <button style={styles.buttonMini} onClick={() => mappaRef.current?.click()} title={t('mappa.cambia_tip')}>🔁 {t('mappa.cambia')}</button>
            <button style={{ ...styles.buttonMini, color: C.red, borderColor: C.red }} onClick={() => { if (window.confirm(t('mappa.rimuovi_conferma'))) { setMappaCampagna(''); setMappaAperta(false); } }} title={t('mappa.rimuovi_tip')}>🗑 {t('mappa.rimuovi')}</button>
            <button style={styles.buttonMini} onClick={() => setMappaAperta(false)} title={t('mappa.chiudi')}>✕</button>
          </div>
          {/* Vista adattata allo schermo (nessuno scroll); con “Ingrandisci” passa
              alla dimensione reale e diventa scorrevole in entrambe le direzioni. */}
          <div
            style={{ flex: 1, minHeight: 0, overflow: mappaScala === 0 ? 'hidden' : 'auto', display: 'flex', alignItems: mappaScala === 0 ? 'center' : 'flex-start', justifyContent: 'center', padding: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div ref={mappaWrapRef} style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
              <img
                src={mappaCampagna}
                alt={t('mappa.titolo')}
                draggable={false}
                style={mappaScala === 0
                  ? { maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }
                  : { width: `${mappaScala * 100}vw`, maxWidth: 'none', maxHeight: 'none', height: 'auto', display: 'block' }}
              />
              {/* Segnalino trascinabile: la punta indica il punto salvato. */}
              <div
                onPointerDown={iniziaTrascinaMarker}
                title="Trascina il segnalino · la posizione viene salvata"
                style={{
                  position: 'absolute', left: `${mappaMarker.x}%`, top: `${mappaMarker.y}%`,
                  transform: 'translate(-50%, -100%)', cursor: 'grab', touchAction: 'none',
                  fontSize: 30, lineHeight: 1, userSelect: 'none',
                  filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))', zIndex: 2,
                }}
              >📍</div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Combat tracker: barra fissa in basso (stile Fantasy Grounds) ===== */}
      {combat.attivo && combat.aperto ? (
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
                      iniziativa: cb.iniziativa ? cb.iniziativa : tiraDado(20) + (cb.tipo === 'pg' ? modificatore(punteggioCaratteristica(scheda, 'destrezza') || 10) : Math.floor(Math.random() * 5))
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
                              const roll = tiraDado(20) + (cb.tipo === 'pg' ? modificatore(punteggioCaratteristica(scheda, 'destrezza') || 10) : Math.floor(Math.random() * 5));
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
                          {CONDIZIONI_5E.filter((c) => !cb.condizioni.includes(c)).sort((a, b) => traduciDato(a).localeCompare(traduciDato(b), lingua)).map((c) => (
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
      ) : null}
    </div>
  );
}
