// Calcoli 5e derivati dalla scheda: CA da equipaggiamento, bonus abilità e TS.
// Funzioni pure (nessun React, nessuno stato): testabili in isolamento.
import { modificatore, bonusCompetenzaDaLivello } from './dadi.js';
import { ABILITA } from '../data/caratteristiche.js';

export function formattaNomePg(nome) {
  if (!nome || typeof nome !== 'string') return '';
  const pulito = nome.trim();
  if (!pulito) return '';
  return pulito.replace(/(^|[\s\-(/'"])[a-zà-öø-ÿ]/gu, (m) => m.toUpperCase());
}

export function formattaTitoloVoce(str) {
  if (!str || typeof str !== 'string') return '';
  const pulito = str.trim();
  if (!pulito) return '';
  const base = (pulito === pulito.toUpperCase() && /[A-ZÀ-ÖØ-ß]/.test(pulito))
    ? pulito.toLowerCase()
    : pulito;

  const minuscole = new Set(['di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'il', 'lo', 'la', 'i', 'gli', 'le', 'del', 'dello', 'della', 'dei', 'degli', 'delle', 'al', 'allo', 'alla', 'ai', 'agli', 'alle', 'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle', 'nel', 'nello', 'nella', 'nei', 'negli', 'nelle', 'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle', 'e', 'ed', 'o', 'od', 'of', 'and', 'the', 'in', 'on', 'at', 'to', 'for', 'with', 'by']);

  return base.split(/(\s+|[-/()])/).map((token, idx) => {
    if (!token || /^\s+$/.test(token) || /^[-/()]$/.test(token)) return token;
    const lower = token.toLowerCase();
    if (idx > 0 && minuscole.has(lower)) {
      return lower;
    }
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join('');
}

function nomeNormalizzato(v) {
  return String(v || '').toLocaleLowerCase('it').replace(/[^a-zà-ÿ0-9]/gi, ' ').replace(/\s+/g, ' ').trim();
}

/** Un effetto dell'inventario funziona solo se l'oggetto è indossato e,
 * quando richiesto, occupa anche uno degli slot di sintonia. */
export function oggettiConEffettoAttivo(scheda) {
  const sintonia = Array.isArray(scheda?.sintonia) ? scheda.sintonia : (scheda?.sintonia ? [scheda.sintonia] : []);
  return (Array.isArray(scheda?.inventario) ? scheda.inventario : []).filter((o) => {
    if (!o?.equip || !o.effettoMeccanico) return false;
    if (!o.richiedeSintonia) return true;
    const nome = nomeNormalizzato(o.nome);
    return sintonia.some((s) => {
      const voce = nomeNormalizzato(s);
      return nome && voce && (nome.includes(voce) || voce.includes(nome));
    });
  });
}

export function bonusClasseArmaturaOggetti(scheda) {
  return oggettiConEffettoAttivo(scheda).reduce((tot, o) => {
    if (o.effettoMeccanico === 'classe_armatura_tiri_salvezza_1') return tot + 1;
    const m = /^classe_armatura_([123])$/.exec(o.effettoMeccanico);
    return tot + (m ? Number(m[1]) : 0);
  }, 0);
}

export function bonusTiriSalvezzaOggetti(scheda) {
  return oggettiConEffettoAttivo(scheda).reduce((tot, o) => {
    if (o.effettoMeccanico === 'classe_armatura_tiri_salvezza_1') return tot + 1;
    const m = /^tiri_salvezza_([123])$/.exec(o.effettoMeccanico);
    return tot + (m ? Number(m[1]) : 0);
  }, 0);
}

export function punteggioCaratteristica(scheda, caratteristica) {
  // Se la Forma Bestiale è attiva, Forza, Destrezza e Costituzione sono sostituite dalle caratteristiche fisiche della bestia (Regole 5e PHB)
  if (scheda?.formaBestiale?.attiva && ['forza', 'destrezza', 'costituzione'].includes(caratteristica)) {
    const valBestia = scheda.formaBestiale.car?.[caratteristica];
    if (valBestia != null) return Number(valBestia);
  }
  const base = Number(scheda?.caratteristiche?.[caratteristica]) || 0;
  const valori = oggettiConEffettoAttivo(scheda)
    .map((o) => new RegExp(`^${caratteristica}_impostata_(\\d+)$`).exec(o.effettoMeccanico))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  return valori.length ? Math.max(base, ...valori) : base;
}

export const TIPI_COPERTURA_5E = [
  { key: 'nessuna', labelIt: '🛡️ Nessuna Copertura', labelEn: '🛡️ No Cover', ca: 0, tsDes: 0, descIt: 'Bersaglio in campo aperto, nessuna protezione.', descEn: 'Target in open field, no protection.' },
  { key: 'mezza', labelIt: '🛡️ Mezza (+2 CA/TS)', labelEn: '🛡️ Half Cover (+2)', ca: 2, tsDes: 2, descIt: '+2 a CA e TS Destrezza (muretto, cassa, tronco o altra creatura).', descEn: '+2 to AC and Dex saves (low wall, crate, tree trunk, or another creature).' },
  { key: 'tre_quarti', labelIt: '🏰 Tre Quarti (+5 CA/TS)', labelEn: '🏰 Three-Quarters (+5)', ca: 5, tsDes: 5, descIt: '+5 a CA e TS Destrezza (feritoia, saracinesca, muro parziale).', descEn: '+5 to AC and Dex saves (arrow slit, portcullis, partial wall).' },
  { key: 'totale', labelIt: '🧱 Copertura Totale', labelEn: '🧱 Total Cover', ca: 0, tsDes: 0, descIt: 'Completamente celato da ostacoli: non bersagliabile direttamente da attacchi o incantesimi.', descEn: 'Completely concealed: cannot be targeted directly by attacks or spells.' },
];

export function bonusCopertura(scheda) {
  const tipo = scheda?.copertura || 'nessuna';
  const match = TIPI_COPERTURA_5E.find((c) => c.key === tipo) || TIPI_COPERTURA_5E[0];
  return {
    tipo: match.key,
    ca: match.ca,
    tsDes: match.tsDes,
    totale: match.key === 'totale',
    labelIt: match.labelIt,
    labelEn: match.labelEn,
    descIt: match.descIt,
    descEn: match.descEn,
  };
}

/**
 * CA totale in base all'equipaggiamento (regole 5e):
 * se la Forma Bestiale è attiva, usa la CA naturale della bestia;
 * altrimenti a mano = valore scritto · nessuna 10+DES · leggera base+DES ·
 * media base+min(DES,2) · pesante base. In tutti i casi si sommano
 * scudo (+2) ed eventuale bonus magico, più eventuale mezza/tre quarti copertura.
 */
export function caTotale(scheda) {
  if (scheda?.formaBestiale?.attiva && scheda.formaBestiale.ca != null) {
    return Number(scheda.formaBestiale.ca) + bonusClasseArmaturaOggetti(scheda) + bonusCopertura(scheda).ca;
  }
  const a = scheda.armatura || {};
  const des = modificatore(punteggioCaratteristica(scheda, 'destrezza'));
  let ca;
  if (a.tipo === 'nessuna') ca = 10 + des;
  else if (a.tipo === 'leggera') ca = (a.base || 0) + des;
  else if (a.tipo === 'media') ca = (a.base || 0) + Math.min(des, 2);
  else if (a.tipo === 'pesante') ca = a.base || 0;
  else ca = Number(scheda.ca) || 0; // 'manuale': valore scritto a mano
  return ca + (a.scudo ? 2 : 0) + (Number(a.bonus) || 0) + bonusClasseArmaturaOggetti(scheda) + bonusCopertura(scheda).ca;
}

/**
 * Sei competente per indossare questo tipo di armatura? 'manuale' e 'nessuna'
 * sono sempre concessi; leggera/media/pesante richiedono la competenza segnata
 * in addestramento (che deriva dalla classe, o si attiva a mano per talenti).
 */
export function competenteInArmatura(scheda, tipo) {
  if (tipo === 'manuale' || tipo === 'nessuna') return true;
  return !!scheda.addestramento?.armature?.[tipo];
}

/**
 * Estrae l'eventuale bonus dell'abilità dalla scheda della bestia (es. "Percezione +3, Furtività +4").
 * Ritorna il numero se presente, altrimenti null.
 */
export function bonusAbilitaBestia(scheda, abilitaKey) {
  if (!scheda?.formaBestiale?.attiva || !scheda.formaBestiale.abilita || scheda.formaBestiale.abilita === '—') return null;
  const def = ABILITA.find((a) => a.key === abilitaKey);
  if (!def) return null;
  const label = def.label;
  const key = def.key;
  const re = new RegExp(`(?:${label}|${key})\\s*([+-]?\\d+)`, 'iu');
  const m = String(scheda.formaBestiale.abilita).match(re);
  return m ? parseInt(m[1], 10) : null;
}

/** Bonus di un'abilità: mod caratteristica + competenza (1x o 2x per maestria), con regola Forma Selvatica. */
export function bonusAbilita(scheda, abilita) {
  const def = ABILITA.find((a) => a.key === abilita);
  if (!def) return 0;
  const livComp = (scheda?.abilita && scheda.abilita[abilita]) || 0;
  // 0 = niente, 1 = competenza (cerchietto ●), 2 = competenza di classe/razza
  // (stellina ★, solo un marcatore d'origine: vale ×1 come la 1), 3 = Maestria
  // /Expertise (✦, doppia competenza — Ladro e Bardo): vale ×2.
  const moltiplicatore = livComp >= 3 ? 2 : livComp >= 1 ? 1 : 0;
  const bonusComp = Number.isFinite(Number(scheda?.bonusCompetenza))
    ? Number(scheda.bonusCompetenza)
    : bonusCompetenzaDaLivello(scheda?.livello || 1);
  const bonusBase = modificatore(punteggioCaratteristica(scheda, def.car)) + moltiplicatore * bonusComp;

  // Regola 5e PHB Forma Selvatica: usa il bonus della bestia se superiore
  if (scheda?.formaBestiale?.attiva) {
    const bonusBestia = bonusAbilitaBestia(scheda, abilita);
    if (bonusBestia != null) {
      return Math.max(bonusBase, bonusBestia);
    }
  }
  return bonusBase;
}

/** Bonus di un tiro salvezza: mod caratteristica + eventuale competenza + bonus copertura (su Des). */
export function bonusTiroSalvezza(scheda, car) {
  const bonusComp = Number.isFinite(Number(scheda?.bonusCompetenza))
    ? Number(scheda.bonusCompetenza)
    : bonusCompetenzaDaLivello(scheda?.livello || 1);
  const bonusCop = car === 'destrezza' ? bonusCopertura(scheda).tsDes : 0;
  return (
    modificatore(punteggioCaratteristica(scheda, car)) +
    (scheda?.tiriSalvezza?.[car] ? bonusComp : 0) +
    bonusTiriSalvezzaOggetti(scheda) +
    bonusCop
  );
}

// ---------------------------------------------------------------------------
// Taglia 5e e modificatori dimensionali (Ingrandire / Ridurre / Forma Bestiale)
// ---------------------------------------------------------------------------

export const SCALE_TAGLIE_5E = ['Minuscola', 'Piccola', 'Media', 'Grande', 'Enorme', 'Mastodontica'];

export const MOLTIPLICATORI_TAGLIA = {
  Minuscola: 0.5,
  Piccola: 1,
  Media: 1,
  Grande: 2,
  Enorme: 4,
  Mastodontica: 8,
};

export const SPAZIO_TAGLIA_5E = {
  Minuscola: '75 cm (1/4 quadretto)',
  Piccola: '1,5 m (1 quadretto)',
  Media: '1,5 m (1 quadretto)',
  Grande: '3 m × 3 m (4 quadretti)',
  Enorme: '4,5 m × 4,5 m (9 quadretti)',
  Mastodontica: '6 m × 6 m o più (16+ quadretti)',
};

export const LOTTA_MAX_TAGLIA_5E = {
  Minuscola: 'Piccola',
  Piccola: 'Media',
  Media: 'Grande',
  Grande: 'Enorme',
  Enorme: 'Mastodontica',
  Mastodontica: 'Mastodontica+',
};

/**
 * Calcola la taglia effettiva del personaggio considerando:
 * 1. Forma Bestiale attiva (prende la taglia della bestia)
 * 2. Incantesimo Ingrandire/Ridurre o condizione 'Ingrandito' / 'Ridotto'
 * 3. Taglia base della scheda
 */
export function tagliaEffettiva(scheda) {
  if (scheda?.formaBestiale?.attiva && scheda.formaBestiale.taglia) {
    return scheda.formaBestiale.taglia;
  }
  const base = scheda?.taglia || 'Media';
  const idx = SCALE_TAGLIE_5E.indexOf(base);
  if (idx === -1) return base;

  if (scheda?.effettoTaglia === 'ingrandito' || (Array.isArray(scheda?.condizioni) && scheda.condizioni.includes('Ingrandito'))) {
    return SCALE_TAGLIE_5E[Math.min(SCALE_TAGLIE_5E.length - 1, idx + 1)];
  }
  if (scheda?.effettoTaglia === 'ridotto' || (Array.isArray(scheda?.condizioni) && scheda.condizioni.includes('Ridotto'))) {
    return SCALE_TAGLIE_5E[Math.max(0, idx - 1)];
  }
  return base;
}

/**
 * Parsea una stringa o un oggetto azione di una bestia / mostro 5e,
 * estraendo nome, descrizione, bonus per colpire, formula del danno e CD tiro salvezza.
 */
export function parseAzioneBestia(azione) {
  if (!azione) return { nome: 'Azione', desc: '', bonus: null, danno: '', cd: null, testoOriginale: '' };
  const str = typeof azione === 'string' ? azione : (azione.nome || azione.desc || '');
  const colonIdx = str.indexOf(':');
  const nome = colonIdx > -1 ? str.slice(0, colonIdx).trim() : (str.split(/[,.]/)[0] || 'Attacco');
  const desc = colonIdx > -1 ? str.slice(colonIdx + 1).trim() : str;

  // Trova bonus per colpire: es. "+4 al tiro per colpire", "+5 to hit"
  const matchHit = str.match(/([+-]?\d+)\s*(?:al tiro per colpire|to hit)/i);
  const bonus = matchHit ? parseInt(matchHit[1], 10) : null;

  // Trova formula danno primaria: es. "1d10+2", "2d6+4", "3d6", "1" (es. "1 danno tagliente")
  const matchDanno = desc.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?|\b\d+\b(?=\s+danno|\s+danni|\s+damage))/i);
  const danno = matchDanno ? matchDanno[1].replace(/\s+/g, '') : '';

  // Trova CD: es. "CD 13", "DC 14"
  const matchCD = desc.match(/(?:CD|DC)\s*(\d+)/i);
  const cd = matchCD ? parseInt(matchCD[1], 10) : null;

  return {
    nome,
    desc,
    bonus,
    danno,
    cd,
    testoOriginale: str,
  };
}

/**
 * Analizza un attacco o un'arma per verificare se possiede la proprietà Versatile
 * (con i relativi dadi a 1 mano e a 2 mani) o la proprietà Portata (Reach 3m).
 */
export function analizzaArmaVersatileEPortata(attacco, armaDb = null) {
  if (!attacco) return { isVersatile: false, dado1M: '', dado2M: '', hasReach: false };
  const nome = String(attacco.nome || '').trim().toLowerCase();
  const note = String(attacco.note || '').toLowerCase();
  const arma = armaDb || null;

  // 1. Controllo Versatilità
  let isVersatile = false;
  let dado1M = '';
  let dado2M = '';

  if (arma?.versatile) {
    isVersatile = true;
    dado1M = arma.danno;
    dado2M = arma.versatile;
  } else if (/versatile\s*\((1d\d+)\)/i.test(note)) {
    isVersatile = true;
    const match = note.match(/versatile\s*\((1d\d+)\)/i);
    dado2M = match[1];
    dado1M = dado2M === '1d10' ? '1d8' : '1d6';
  } else if (/spada lunga|longsword|ascia da battaglia|battleaxe|martello da guerra|warhammer|tridente|trident/i.test(nome)) {
    isVersatile = true;
    dado1M = '1d8';
    dado2M = '1d10';
  } else if (/bastone ferrato|quarterstaff|lancia\b|spear\b/i.test(nome) && !/lancia da cavaliere|lance/i.test(nome)) {
    isVersatile = true;
    dado1M = '1d6';
    dado2M = '1d8';
  }

  // 2. Controllo Portata (Reach)
  let hasReach = false;
  if (arma?.reach || arma?.portata) {
    hasReach = true;
  } else if (/portata|reach/i.test(note)) {
    hasReach = true;
  } else if (/alabarda|halberd|falcione|glaive|picca|pike|frusta|whip/i.test(nome)) {
    hasReach = true;
  }

  return { isVersatile, dado1M, dado2M, hasReach };
}

/**
 * Commuta la presa di un'arma versatile tra 1 mano e 2 mani,
 * sostituendo il dado di danno nella formula senza toccare il modificatore fisso.
 */
export function alternaImpugnaturaVersatile(attacco, armaDb = null) {
  const { isVersatile, dado1M, dado2M } = analizzaArmaVersatileEPortata(attacco, armaDb);
  if (!isVersatile) return attacco;

  const aDueManiAttuale = Boolean(attacco.aDueMani);
  const nuovaDueMani = !aDueManiAttuale;
  const vecchioDado = aDueManiAttuale ? dado2M : dado1M;
  const nuovoDado = nuovaDueMani ? dado2M : dado1M;

  let dannoStr = String(attacco.danno || '');
  if (dannoStr.includes(vecchioDado)) {
    dannoStr = dannoStr.replace(vecchioDado, nuovoDado);
  } else if (/^1d\d+/i.test(dannoStr)) {
    dannoStr = dannoStr.replace(/^1d\d+/i, nuovoDado);
  } else {
    dannoStr = nuovoDado;
  }

  return {
    ...attacco,
    aDueMani: nuovaDueMani,
    danno: dannoStr,
  };
}

