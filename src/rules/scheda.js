// Calcoli 5e derivati dalla scheda: CA da equipaggiamento, bonus abilità e TS.
// Funzioni pure (nessun React, nessuno stato): testabili in isolamento.
import { modificatore } from './dadi.js';
import { ABILITA } from '../data/caratteristiche.js';

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
  const base = Number(scheda?.caratteristiche?.[caratteristica]) || 0;
  const valori = oggettiConEffettoAttivo(scheda)
    .map((o) => new RegExp(`^${caratteristica}_impostata_(\\d+)$`).exec(o.effettoMeccanico))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  return valori.length ? Math.max(base, ...valori) : base;
}

/**
 * CA totale in base all'equipaggiamento (regole 5e):
 * a mano = valore scritto · nessuna 10+DES · leggera base+DES ·
 * media base+min(DES,2) · pesante base. In tutti i casi si sommano
 * scudo (+2) ed eventuale bonus magico.
 */
export function caTotale(scheda) {
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
  const livComp = scheda.abilita[abilita] || 0;
  // 0 = niente, 1 = competenza (cerchietto ●), 2 = competenza di classe/razza
  // (stellina ★, solo un marcatore d'origine: vale ×1 come la 1), 3 = Maestria
  // /Expertise (✦, doppia competenza — Ladro e Bardo): vale ×2.
  const moltiplicatore = livComp >= 3 ? 2 : livComp >= 1 ? 1 : 0;
  return modificatore(punteggioCaratteristica(scheda, def.car)) + moltiplicatore * scheda.bonusCompetenza;
}

/** Bonus di un tiro salvezza: mod caratteristica + eventuale competenza. */
export function bonusTiroSalvezza(scheda, car) {
  return (
    modificatore(punteggioCaratteristica(scheda, car)) +
    (scheda.tiriSalvezza[car] ? scheda.bonusCompetenza : 0) +
    bonusTiriSalvezzaOggetti(scheda)
  );
}
