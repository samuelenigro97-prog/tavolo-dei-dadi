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

/**
 * CA totale in base all'equipaggiamento (regole 5e):
 * se la Forma Bestiale è attiva, usa la CA naturale della bestia;
 * altrimenti a mano = valore scritto · nessuna 10+DES · leggera base+DES ·
 * media base+min(DES,2) · pesante base. In tutti i casi si sommano
 * scudo (+2) ed eventuale bonus magico.
 */
export function caTotale(scheda) {
  if (scheda?.formaBestiale?.attiva && scheda.formaBestiale.ca != null) {
    return Number(scheda.formaBestiale.ca) + bonusClasseArmaturaOggetti(scheda);
  }
  const a = scheda.armatura || {};
  const des = modificatore(punteggioCaratteristica(scheda, 'destrezza'));
  let ca;
  if (a.tipo === 'nessuna') ca = 10 + des;
  else if (a.tipo === 'leggera') ca = (a.base || 0) + des;
  else if (a.tipo === 'media') ca = (a.base || 0) + Math.min(des, 2);
  else if (a.tipo === 'pesante') ca = a.base || 0;
  else ca = Number(scheda.ca) || 0; // 'manuale': valore scritto a mano
  return ca + (a.scudo ? 2 : 0) + (Number(a.bonus) || 0) + bonusClasseArmaturaOggetti(scheda);
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

/** Bonus di un'abilità: mod caratteristica + competenza (1x o 2x per maestria). */
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
  return modificatore(punteggioCaratteristica(scheda, def.car)) + moltiplicatore * bonusComp;
}

/** Bonus di un tiro salvezza: mod caratteristica + eventuale competenza. */
export function bonusTiroSalvezza(scheda, car) {
  const bonusComp = Number.isFinite(Number(scheda?.bonusCompetenza))
    ? Number(scheda.bonusCompetenza)
    : bonusCompetenzaDaLivello(scheda?.livello || 1);
  return (
    modificatore(punteggioCaratteristica(scheda, car)) +
    (scheda?.tiriSalvezza?.[car] ? bonusComp : 0) +
    bonusTiriSalvezzaOggetti(scheda)
  );
}
