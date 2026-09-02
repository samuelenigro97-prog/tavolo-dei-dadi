import { CLASSI, CLASSI_FULL_CASTER, CLASSI_MEZZO_CASTER, SLOT_FULL_CASTER, SLOT_MEZZO_CASTER, SLOT_WARLOCK, SLOT_ARTEFICE,
  TRUCCHETTI_NOTI, INC_MAX_2024, INC_MAX_2014_NOTI, SOTTOCLASSE_LIV, SOTTOCLASSE_LIV_2014,
  PRIVILEGI_CLASSE_L1, PRIVILEGI_CLASSE_L1_2014, PRIVILEGI_CLASSE_LIV,
  PRIVILEGI_CLASSE_LIV_2014, ASI_LIV, PESI_OGGETTI, PESO_ARMATURA_TIPO,
  INCANTESIMI_CLASSE, CARATT_INCANTATORE, SOTTOCLASSE_TERZO_CASTER,
  SCUOLE_TERZO_CASTER_2014, SLOT_TERZO_CASTER, INC_MAX_TERZO, TRUCCHETTI_TERZO_CASTER,
  TS_CLASSE, COMPETENZE_CLASSE, COMPETENZE_SPECIE, BACKGROUND_COMPETENZE,
  MULTICLASSE_REQUISITI_5E, MULTICLASSE_COMPETENZE_5E } from '../data/dati5e.js';
import { modificatore, conSegno, bonusCompetenzaDaLivello } from './dadi.js';
import { spiegaIncantesimo } from '../data/spiegazioni.js';
import { INCANTESIMI_DB, datiIncantesimo } from '../data/incantesimi.js';
import { ABILITA, CARATTERISTICHE } from '../data/caratteristiche.js';
import { EFFETTI_CONDIZIONI, ETICHETTE_EFFETTI } from '../data/condizioni.js';

/** Restituisce 'guerriero'/'ladro' se la scheda è un "terzo incantatore" (la
 *  sottoclasse specifica, non l'intera classe: un Campione o un Assassino non
 *  lanciano incantesimi). null altrimenti. */
export function sottoclasseTerzoIncantatore(classe, sottoclasse) {
  const k = chiaveClasse(classe);
  if (k && SOTTOCLASSE_TERZO_CASTER[k] && String(sottoclasse || '').trim() === SOTTOCLASSE_TERZO_CASTER[k]) return k;
  return null;
}

/** Lista incantesimi (per livello) selezionabile da un terzo incantatore:
 *  quella del Mago, ristretta alle due scuole previste solo nella 5.0 (2014).
 *  I trucchetti (livello 0) non hanno mai restrizione di scuola. */
export function listeIncantesimiTerzoCaster(terzo, versione = '2024') {
  const base = INCANTESIMI_CLASSE.mago;
  if (!base) return null;
  if (versione !== '2014') return base;
  const scuole = SCUOLE_TERZO_CASTER_2014[terzo];
  if (!scuole || !scuole.length) return base;
  const filtrata = {};
  for (const [liv, nomi] of Object.entries(base)) {
    filtrata[liv] = Number(liv) === 0 ? nomi : nomi.filter((n) => scuole.includes(datiIncantesimo(n)?.scuola));
  }
  return filtrata;
}

/** Incantesimi del Mago selezionabili da un terzo incantatore a un dato
 *  livello, per il selettore "aggiungi incantesimo" della UI. */
export function incantesimiTerzoCasterLivello(classe, sottoclasse, livello, versione = '2024') {
  const terzo = sottoclasseTerzoIncantatore(classe, sottoclasse);
  if (!terzo) return [];
  const liste = listeIncantesimiTerzoCaster(terzo, versione);
  return (liste && liste[livello]) || [];
}

export function trucchettiMax(classe, livello, sottoclasse) {
  const lv = Math.max(1, Math.floor(livello) || 1);
  const terzo = sottoclasseTerzoIncantatore(classe, sottoclasse);
  if (terzo) {
    if (lv < 3) return null; // niente magia prima di scegliere la sottoclasse
    return TRUCCHETTI_TERZO_CASTER[terzo][lv >= 10 ? 1 : 0];
  }
  const k = chiaveClasse(classe);
  if (k === 'artefice') {
    if (lv >= 14) return 4;
    if (lv >= 10) return 3;
    return 2;
  }
  const base = TRUCCHETTI_NOTI[k];
  if (!base) return null;
  return lv >= 10 ? base[2] : lv >= 4 ? base[1] : base[0];
}

export function incantesimiMaxAuto(scheda, versione = '2024') {
  const lv = Math.max(1, Math.floor(scheda?.livello) || 1);
  const terzo = sottoclasseTerzoIncantatore(scheda?.classe, scheda?.sottoclasse);
  if (terzo) return lv < 3 ? null : INC_MAX_TERZO[Math.min(19, lv - 1)];
  const k = chiaveClasse(scheda?.classe);
  if (!k) return null;
  const idx = Math.min(19, lv - 1);
  const carKey = caratteristicaIncantatoreEffettiva(scheda);
  const mod = carKey ? modificatore(scheda.caratteristiche?.[carKey]) : 0;
  if (k === 'artefice') {
    return Math.max(1, Math.floor(lv / 2) + mod);
  }
  if (versione === '2014') {
    if (['chierico', 'druido', 'mago'].includes(k)) return Math.max(1, mod + lv);
    if (k === 'paladino') return Math.max(1, mod + Math.floor(lv / 2));
    const noti = INC_MAX_2014_NOTI[k];
    return noti ? noti[idx] : null;
  }
  const t = INC_MAX_2024[k];
  return t ? t[idx] : null;
}

export function sottoclasseLivPer(versione) {
  return versione === '2014' ? SOTTOCLASSE_LIV_2014 : SOTTOCLASSE_LIV;
}

export function chiaveClasse(classe) {
  const c = coloreClasse(classe);
  return c ? c.match[0] : null;
}

/** Una classe incantatrice prevale sul valore sbagliato di una scheda importata. */
export function caratteristicaIncantatoreEffettiva(scheda) {
  const automatica = CARATT_INCANTATORE[chiaveClasse(scheda?.classe)] || '';
  if (automatica) return automatica;
  // Se la classe principale non è incantatrice, controlla le classi multiclasse
  if (Array.isArray(scheda?.multiclasse)) {
    for (const m of scheda.multiclasse) {
      const mcAuto = CARATT_INCANTATORE[chiaveClasse(m?.classe)];
      if (mcAuto) return mcAuto;
    }
  }
  if (sottoclasseTerzoIncantatore(scheda?.classe, scheda?.sottoclasse)) return 'intelligenza';
  const salvata = scheda?.incantatore?.caratteristica;
  return ['forza', 'destrezza', 'costituzione', 'intelligenza', 'saggezza', 'carisma'].includes(salvata) ? salvata : '';
}

/** Classi che scelgono ogni giorno gli incantesimi preparati da una lista ampia. */
export function classePreparaIncantesimi(classe) {
  return ['mago', 'chierico', 'druido', 'paladino', 'artefice'].includes(chiaveClasse(classe));
}

/**
 * Catalogo completo disponibile per una classe preparatrice. Unisce il database
 * dettagliato alle liste curate, così eventuali voci presenti in una sola fonte
 * non spariscono. I trucchetti restano esclusi: si conoscono, non si preparano.
 */
export function catalogoIncantesimiPreparabili(classe) {
  const chiave = chiaveClasse(classe);
  if (!classePreparaIncantesimi(classe)) return [];
  const catalogo = new Map();
  for (const [nome, dati] of Object.entries(INCANTESIMI_DB)) {
    if (!(dati.livello >= 1) || !(dati.classi || []).some((c) => chiaveClasse(c) === chiave)) continue;
    catalogo.set(`${dati.livello}:${nome.toLocaleLowerCase('it')}`, { nome, ...dati });
  }
  for (const [livello, nomi] of Object.entries(INCANTESIMI_CLASSE[chiave] || {})) {
    if (Number(livello) < 1) continue;
    for (const nome of nomi) {
      const key = `${Number(livello)}:${nome.toLocaleLowerCase('it')}`;
      if (!catalogo.has(key)) catalogo.set(key, { nome, livello: Number(livello), ...(datiIncantesimo(nome) || {}) });
    }
  }
  return [...catalogo.values()].sort((a, b) => a.livello - b.livello || a.nome.localeCompare(b.nome, 'it'));
}

export function privilegiClasseLivello(classe, livello, versione = '2024') {
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

/** Tutti i privilegi di classe ottenuti fino al livello indicato, senza duplicati. */
export function privilegiClasseFinoA(classe, livello, versione = '2024') {
  const k = chiaveClasse(classe);
  if (!k) return '';
  const iniziali = versione === '2014' ? PRIVILEGI_CLASSE_L1_2014 : PRIVILEGI_CLASSE_L1;
  const righe = String(iniziali[k] || '').split('\n').filter(Boolean);
  const massimo = Math.max(1, Math.min(20, Math.floor(livello) || 1));
  for (let lv = 2; lv <= massimo; lv += 1) {
    righe.push(...String(privilegiClasseLivello(classe, lv, versione) || '').split('\n').filter(Boolean));
  }
  return [...new Set(righe)].join('\n');
}

export function asiAlLivello(classe, livello) {
  const k = chiaveClasse(classe);
  return ((k && ASI_LIV[k]) || ASI_LIV._default).includes(livello);
}

export { MULTICLASSE_REQUISITI_5E, MULTICLASSE_COMPETENZE_5E };

/**
 * Restituisce i dettagli specifici di progressione e potenziamenti di risorsa
 * per un passaggio di livello in una classe (da vecchioLivello a nuovoLivello).
 */
export function dettagliProgressioneLivello(classe, vecchioLivello, nuovoLivello, versione = '2024') {
  const k = chiaveClasse(classe);
  if (!k) return [];
  const v24 = String(versione) !== '2014';
  const out = [];

  switch (k) {
    case 'barbaro': {
      const rageOld = vecchioLivello >= 17 ? 6 : vecchioLivello >= 12 ? 5 : vecchioLivello >= 6 ? 4 : vecchioLivello >= 3 ? 3 : vecchioLivello >= 1 ? 2 : 0;
      const rageNew = nuovoLivello >= 17 ? 6 : nuovoLivello >= 12 ? 5 : nuovoLivello >= 6 ? 4 : nuovoLivello >= 3 ? 3 : 2;
      if (rageNew > rageOld) {
        out.push({ icon: '🔥', nome: 'Ira', desc: `Usi aumentati a ${rageNew} per riposo` });
      }
      const rageDmgOld = vecchioLivello >= 16 ? 4 : vecchioLivello >= 9 ? 3 : vecchioLivello >= 1 ? 2 : 0;
      const rageDmgNew = nuovoLivello >= 16 ? 4 : nuovoLivello >= 9 ? 3 : 2;
      if (rageDmgNew > rageDmgOld) {
        out.push({ icon: '⚔️', nome: 'Danno d’Ira', desc: `Bonus danno aumentato a +${rageDmgNew}` });
      }
      break;
    }
    case 'bardo': {
      if (nuovoLivello === 5) {
        out.push({ icon: '🎲', nome: 'Ispirazione Bardica', desc: 'Dado aumentato a d8 e recupero con Riposo Breve' });
      } else if (nuovoLivello === 10) {
        out.push({ icon: '🎲', nome: 'Ispirazione Bardica', desc: 'Dado aumentato a d10' });
      } else if (nuovoLivello === 15) {
        out.push({ icon: '🎲', nome: 'Ispirazione Bardica', desc: 'Dado aumentato a d12' });
      }
      if (nuovoLivello === 10 || nuovoLivello === 14 || nuovoLivello === 18) {
        out.push({ icon: '✨', nome: 'Segreti Magici', desc: 'Sblocchi 2 incantesimi da qualsiasi lista di classe' });
      }
      break;
    }
    case 'chierico': {
      if (nuovoLivello === 6) {
        out.push({ icon: '✨', nome: 'Incanalare Divinità', desc: 'Usi aumentati a 2 per riposo' });
      } else if (nuovoLivello === 18) {
        out.push({ icon: '✨', nome: 'Incanalare Divinità', desc: 'Usi aumentati a 3 per riposo' });
      }
      break;
    }
    case 'druido': {
      if (nuovoLivello === 2) {
        out.push({ icon: '🐾', nome: 'Forma Selvatica', desc: '2 utilizzi per riposo breve' });
      } else if (nuovoLivello === 4) {
        out.push({ icon: '🐟', nome: 'Forma Selvatica (Nuoto)', desc: 'Puoi trasformarti in bestie con velocità di nuoto' });
      } else if (nuovoLivello === 8) {
        out.push({ icon: '🦅', nome: 'Forma Selvatica (Volo)', desc: 'Puoi trasformarti in bestie con velocità di volo' });
      }
      break;
    }
    case 'guerriero': {
      if (nuovoLivello === 2) {
        out.push({ icon: '⚡', nome: 'Azione Impetuosa', desc: '1 azione aggiuntiva nel tuo turno per riposo' });
      } else if (nuovoLivello === 5) {
        out.push({ icon: '⚔️', nome: 'Attacco Extra', desc: 'Attacchi 2 volte per azione di Attacco' });
      } else if (nuovoLivello === 11) {
        out.push({ icon: '⚔️', nome: 'Attacco Extra (3 attacchi)', desc: 'Attacchi 3 volte per azione di Attacco' });
      } else if (nuovoLivello === 20) {
        out.push({ icon: '⚔️', nome: 'Attacco Extra Supremo', desc: 'Attacchi 4 volte per azione di Attacco' });
      }
      if (nuovoLivello === 9) {
        out.push({ icon: '🛡️', nome: 'Indomito', desc: 'Ritira un tiro salvezza fallito (1 uso per riposo lungo)' });
      } else if (nuovoLivello === 13) {
        out.push({ icon: '🛡️', nome: 'Indomito', desc: 'Usi aumentati a 2 per riposo lungo' });
      } else if (nuovoLivello === 17) {
        out.push({ icon: '🛡️', nome: 'Indomito & Azione Impetuosa', desc: 'Indomito 3 usi, Azione Impetuosa 2 usi' });
      }
      break;
    }
    case 'ladro': {
      const sneakOld = Math.ceil(vecchioLivello / 2);
      const sneakNew = Math.ceil(nuovoLivello / 2);
      if (sneakNew > sneakOld || vecchioLivello === 0) {
        out.push({ icon: '🗡️', nome: 'Attacco Furtivo', desc: `Danno furtivo: ${sneakNew}d6` });
      }
      if (nuovoLivello === 5) {
        out.push({ icon: '💨', nome: 'Schivata Prodigiosa', desc: 'Reazione: dimezza il danno di un attacco subito' });
      } else if (nuovoLivello === 7) {
        out.push({ icon: '🤸', nome: 'Elusione', desc: 'TS Destrezza: 0 danni se superato, metà se fallito' });
      }
      break;
    }
    case 'monaco': {
      const maDie = nuovoLivello >= 17 ? '1d10' : nuovoLivello >= 11 ? '1d8' : nuovoLivello >= 5 ? '1d6' : '1d4';
      const maDie24 = nuovoLivello >= 17 ? '1d12' : nuovoLivello >= 11 ? '1d10' : nuovoLivello >= 5 ? '1d8' : '1d6';
      if (nuovoLivello === 1 || nuovoLivello === 5 || nuovoLivello === 11 || nuovoLivello === 17) {
        out.push({ icon: '👊', nome: 'Arti Marziali', desc: `Dado arti marziali: ${v24 ? maDie24 : maDie}` });
      }
      out.push({ icon: '☯️', nome: v24 ? 'Punti Focus' : 'Punti Ki', desc: `Riserva totale: ${nuovoLivello} punti` });
      if (nuovoLivello === 5) {
        out.push({ icon: '⚔️', nome: 'Attacco Extra & Colpo Stordente', desc: 'Attacchi 2 volte + Colpo Stordente' });
      }
      break;
    }
    case 'paladino': {
      out.push({ icon: '✋', nome: 'Imposizione delle Mani', desc: `Riserva curativa aumentata a ${nuovoLivello * 5} PF (+5 PF)` });
      if (nuovoLivello === 2) {
        out.push({ icon: '⚡', nome: 'Punizione Divina', desc: 'Spendi slot incantesimo per infliggere danni radiosi extra' });
      }
      if (nuovoLivello === 5) {
        out.push({ icon: '⚔️', nome: 'Attacco Extra', desc: 'Attacchi 2 volte per azione di Attacco' });
      } else if (nuovoLivello === 6) {
        out.push({ icon: '🛡️', nome: 'Aura di Protezione', desc: 'Aggiungi il mod. Carisma a tutti i tuoi TS e a quelli degli alleati vicini' });
      }
      break;
    }
    case 'ranger': {
      if (nuovoLivello === 5) {
        out.push({ icon: '⚔️', nome: 'Attacco Extra', desc: 'Attacchi 2 volte per azione di Attacco' });
      }
      break;
    }
    case 'stregone': {
      if (nuovoLivello >= 2) {
        out.push({ icon: '🔮', nome: 'Punti Stregoneria', desc: `Riserva magica aumentata a ${nuovoLivello} punti` });
      }
      break;
    }
    case 'warlock': {
      if (nuovoLivello === 2 || nuovoLivello === 3 || nuovoLivello === 5 || nuovoLivello === 7 || nuovoLivello === 9 || nuovoLivello === 11 || nuovoLivello === 17) {
        const numSlot = nuovoLivello >= 17 ? 4 : nuovoLivello >= 11 ? 3 : 2;
        const livSlot = Math.min(5, Math.ceil(nuovoLivello / 2));
        out.push({ icon: '📜', nome: 'Magia del Patto', desc: `${numSlot} slot di ${livSlot}° livello (recupero su riposo breve)` });
      }
      break;
    }
    case 'mago': {
      out.push({ icon: '📖', nome: 'Recupero Arcano', desc: `Recuperi fino a ${Math.ceil(nuovoLivello / 2)} livelli di slot su riposo breve` });
      break;
    }
  }

  return out;
}

export function maxInvocazioniWarlock(livello, versione = '2024') {
  const lv = Math.max(0, Math.min(20, Math.floor(livello) || 0));
  if (lv <= 0) return 0;
  if (versione === '2024') {
    if (lv >= 18) return 8;
    if (lv >= 15) return 7;
    if (lv >= 12) return 6;
    if (lv >= 9) return 5;
    if (lv >= 7) return 4;
    if (lv >= 5) return 3;
    if (lv >= 2) return 2;
    if (lv >= 1) return 1;
    return 0;
  }
  if (lv >= 18) return 8;
  if (lv >= 15) return 7;
  if (lv >= 12) return 6;
  if (lv >= 9) return 5;
  if (lv >= 7) return 4;
  if (lv >= 5) return 3;
  if (lv >= 2) return 2;
  return 0;
}

export function maxInfusioniNote(livello) {
  const lv = Math.max(0, Math.min(20, Math.floor(livello) || 0));
  if (lv < 2) return 0;
  if (lv >= 18) return 12;
  if (lv >= 14) return 10;
  if (lv >= 10) return 8;
  if (lv >= 6) return 6;
  return 4;
}

export function maxOggettiInfusi(livello) {
  const lv = Math.max(0, Math.min(20, Math.floor(livello) || 0));
  if (lv < 2) return 0;
  if (lv >= 18) return 6;
  if (lv >= 14) return 5;
  if (lv >= 10) return 4;
  if (lv >= 6) return 3;
  return 2;
}

export function slotDaClasseLivello(classe, livello, sottoclasse) {
  const lv = Math.max(1, Math.min(20, Math.floor(livello) || 1));
  let tabella = null;
  if (sottoclasseTerzoIncantatore(classe, sottoclasse)) {
    tabella = SLOT_TERZO_CASTER[lv];
  } else {
    const c = coloreClasse(classe);
    if (!c) return null;
    const k = c.match[0];
    if (CLASSI_FULL_CASTER.includes(k)) tabella = SLOT_FULL_CASTER[lv];
    else if (CLASSI_MEZZO_CASTER.includes(k)) tabella = SLOT_MEZZO_CASTER[lv];
    else if (k === 'warlock') tabella = SLOT_WARLOCK[lv];
    else if (k === 'artefice') tabella = SLOT_ARTEFICE[lv];
  }
  if (!tabella) return null;
  const slot = {};
  for (let i = 1; i <= 9; i++) slot[i] = { totale: tabella[i - 1] || 0, spesi: 0 };
  return slot;
}

export function livelloIncantatoreCombinato(classi) {
  let lv = 0;
  for (const { classe, livello } of classi) {
    const c = coloreClasse(classe);
    if (!c) continue;
    const k = c.match[0];
    if (CLASSI_FULL_CASTER.includes(k)) lv += Math.floor(livello) || 0;
    else if (CLASSI_MEZZO_CASTER.includes(k)) lv += Math.floor((Math.floor(livello) || 0) / 2);
    else if (k === 'artefice') lv += Math.ceil((Math.floor(livello) || 0) / 2);
  }
  return lv;
}

export function slotMulticlasse(classi) {
  const lv = livelloIncantatoreCombinato(classi);
  const slot = {};
  for (let i = 1; i <= 9; i++) slot[i] = { totale: 0, spesi: 0 };

  if (lv >= 1) {
    const tabella = SLOT_FULL_CASTER[Math.min(20, lv)];
    if (tabella) {
      for (let i = 1; i <= 9; i++) slot[i].totale += tabella[i - 1] || 0;
    }
  }

  // Aggiungi gli slot di Magia del Patto (Warlock) se presenti
  for (const { classe, livello } of (Array.isArray(classi) ? classi : [])) {
    const k = chiaveClasse(classe);
    if (k === 'warlock') {
      const lvW = Math.max(1, Math.min(20, Math.floor(livello) || 1));
      const tabW = SLOT_WARLOCK[lvW];
      if (tabW) {
        for (let i = 1; i <= 9; i++) slot[i].totale += tabW[i - 1] || 0;
      }
    }
  }

  const haSlot = Object.values(slot).some((v) => v.totale > 0);
  return haSlot ? slot : null;
}

export function coloreClasse(classe) {
  if (typeof classe !== 'string' || !classe) return null;
  const c = classe.toLowerCase();
  return CLASSI.find((x) => x.match.some((m) => c.includes(m))) || null;
}

export function dettagliIncantesimo(nome) {
  const db = datiIncantesimo(nome) || {};
  const desc = db.desc || spiegaIncantesimo(nome) || '';
  if (!desc && !db.scuola && !db.tempo) return null;
  let tempo = db.tempo || 'AZ';
  if (/reazione/i.test(desc) || /reaz/i.test(tempo)) tempo = 'REAZ';
  else if (/azione bonus/i.test(desc) || /bonus/i.test(tempo)) tempo = 'AZ BONUS';
  let gittata = db.gittata || '';
  if (!gittata) {
    const mG = desc.match(/gittata\s*(\d+(?:[.,]\d+)?)\s*m/i);
    const mR = desc.match(/raggio\s*(\d+(?:[.,]\d+)?)\s*m/i);
    const mC = desc.match(/cono\s*(?:di\s*)?(\d+(?:[.,]\d+)?)\s*m/i);
    if (mG) gittata = `${mG[1]}m`;
    else if (/tocc|contatto/i.test(desc)) gittata = 'contatto';
    else if (/personale|te stesso|su di te|intorno a te/i.test(desc)) gittata = 'personale';
    else if (mR) gittata = `raggio ${mR[1]}m`;
    else if (mC) gittata = `cono ${mC[1]}m`;
  }
  const note = [/\brituale\b/i.test(desc) && 'Rituale', /concentrazione/i.test(desc) && 'Conc.'].filter(Boolean).join(', ');
  return {
    tempo,
    gittata,
    note,
    scuola: db.scuola || '',
    area: db.area || '',
    danno: db.danno || '',
    tipoDanno: db.tipoDanno || '',
  };
}

/** Calcola il moltiplicatore di dadi per i trucchetti offensivi 5e al salire di livello (5, 11, 17). */
export function moltiplicatoreTrucchetto(livello = 1) {
  const liv = Math.max(1, Math.min(20, Number(livello) || 1));
  if (liv >= 17) return 4;
  if (liv >= 11) return 3;
  if (liv >= 5) return 2;
  return 1;
}

/** Scala la formula di danno di un trucchetto 5e in base al livello del personaggio. */
export function scalaDannoTrucchetto(danno, livello = 1, nome = '') {
  if (!danno || typeof danno !== 'string') return danno;
  const n = String(nome || '').toLowerCase().trim();
  // Randello Incantato (Shillelagh) usa sempre 1d8 fisso
  if (n.includes('randello incantato') || n.includes('shillelagh') || n.includes('bastone incantato')) {
    return danno;
  }
  const mult = moltiplicatoreTrucchetto(livello);
  const match = danno.trim().match(/^(\d+)?d(\d+)(.*)$/i);
  if (!match) return danno;
  const facce = match[2];
  const resto = match[3] || '';
  return `${mult}d${facce}${resto}`;
}

/**
 * Un incantesimo va mostrato nella tabella "Combattimento" solo se richiede
 * un tiro per colpire o un tiro salvezza — una cura non è un attacco, non ha
 * senso mostrarla con un bonus di attacco finto. `isTS` distingue i due casi:
 * true → mostra la CD dell'incantesimo, false → mostra il bonus di attacco.
 *
 * datiIncantesimo() non riporta la descrizione (per non duplicare il testo),
 * quindi per riconoscere "tiro salvezza" nel testo serve spiegaIncantesimo().
 */
export function classificaIncantesimoCombattimento(s) {
  const db = datiIncantesimo(s?.nome) || {};
  const tipoDanno = s?.tipoDanno || db.tipoDanno || '';
  if (tipoDanno === 'Guarigione') return { mostraInCombattimento: false, isTS: false };
  const d = dettagliIncantesimo(s?.nome) || {};
  const desc = (s?.note || '') + ' ' + (spiegaIncantesimo(s?.nome) || '');
  const danno = s?.danno || d.danno || '';
  const area = s?.area || d.area || '';
  const mostraInCombattimento = Boolean(danno || area || /attacco magico|tiro per colpire|ts \w+|tiro salvezza|danni/i.test(desc));
  const isTS = /ts (\w+)|tiro salvezza/i.test(desc);
  return { mostraInCombattimento, isTS };
}

export function pesoStimato(nome) {
  if (!nome) return 0;
  if (PESI_OGGETTI[nome] != null) return PESI_OGGETTI[nome];
  const n = nome.trim().toLowerCase();
  for (const k of Object.keys(PESI_OGGETTI)) {
    const kk = k.toLowerCase();
    if (n.includes(kk) || kk.includes(n)) return PESI_OGGETTI[k];
  }
  return 0;
}

export function pesoArmatura(armatura) {
  if (!armatura || armatura.tipo === 'nessuna') return armatura?.scudo ? PESI_OGGETTI['Scudo'] : 0;
  let p = pesoStimato(armatura.nome);
  if (!p) p = PESO_ARMATURA_TIPO[armatura.tipo] || 0;
  if (armatura.scudo) p += PESI_OGGETTI['Scudo'];
  return p;
}

/** Contenuto standard 5e dei pacchetti di dotazione e contenitori comuni */
export const CONTENUTO_DOTAZIONI_5E = {
  'dotazione da avventuriero': [
    { id: 'sub-zaino', nome: 'Zaino', qta: 1, peso: 2.3, icona: '🎒' },
    { id: 'sub-sacco-pelo', nome: 'Sacco a pelo', qta: 1, peso: 3.2, icona: '⛺' },
    { id: 'sub-gavetta', nome: 'Gavetta e borraccia', qta: 1, peso: 2.7, icona: '🥣' },
    { id: 'sub-acciarino', nome: 'Acciarino ed esca', qta: 1, peso: 0.5, icona: '🪔' },
    { id: 'sub-torce', nome: 'Torce', qta: 10, peso: 0.5, icona: '🕯️' },
    { id: 'sub-razioni', nome: 'Razioni giornaliere', qta: 10, peso: 0.9, icona: '🥩' },
    { id: 'sub-corda', nome: 'Corda di canapa (15m)', qta: 1, peso: 4.5, icona: '🪢' },
  ],
  'dotazione da esploratore': [
    { id: 'sub-zaino', nome: 'Zaino', qta: 1, peso: 2.3, icona: '🎒' },
    { id: 'sub-sacco-pelo', nome: 'Sacco a pelo', qta: 1, peso: 3.2, icona: '⛺' },
    { id: 'sub-gavetta', nome: 'Gavetta e borraccia', qta: 1, peso: 2.7, icona: '🥣' },
    { id: 'sub-acciarino', nome: 'Acciarino ed esca', qta: 1, peso: 0.5, icona: '🪔' },
    { id: 'sub-torce', nome: 'Torce', qta: 10, peso: 0.5, icona: '🕯️' },
    { id: 'sub-razioni', nome: 'Razioni giornaliere', qta: 10, peso: 0.9, icona: '🥩' },
    { id: 'sub-corda', nome: 'Corda di canapa (15m)', qta: 1, peso: 4.5, icona: '🪢' },
  ],
  'dotazione da studioso': [
    { id: 'sub-zaino', nome: 'Zaino', qta: 1, peso: 2.3, icona: '🎒' },
    { id: 'sub-libro', nome: 'Libro di studio', qta: 1, peso: 2.3, icona: '📖' },
    { id: 'sub-inchiostro', nome: "Boccetta d'inchiostro e penna", qta: 1, peso: 0.1, icona: '✒️' },
    { id: 'sub-pergamena', nome: 'Fogli di pergamena', qta: 10, peso: 0.1, icona: '📜' },
    { id: 'sub-sabbia', nome: 'Sacchetto di sabbia', qta: 1, peso: 0.5, icona: '⏳' },
    { id: 'sub-coltello', nome: 'Coltellino multiuso', qta: 1, peso: 0.2, icona: '🔪' },
  ],
  'dotazione da scassinatore': [
    { id: 'sub-zaino', nome: 'Zaino', qta: 1, peso: 2.3, icona: '🎒' },
    { id: 'sub-biglie', nome: 'Biglie di metallo (1.000)', qta: 1, peso: 0.9, icona: '⚪' },
    { id: 'sub-spago', nome: 'Spago e campanella', qta: 1, peso: 0.2, icona: '🔔' },
    { id: 'sub-candele', nome: 'Candele', qta: 5, peso: 0.1, icona: '🕯️' },
    { id: 'sub-piede-porco', nome: 'Piede di porco', qta: 1, peso: 2.3, icona: '🔨' },
    { id: 'sub-martello-chiodi', nome: 'Martello e 10 chiodi da roccia', qta: 1, peso: 2.7, icona: '⚒️' },
    { id: 'sub-lanterna', nome: 'Lanterna schermabile e 2 ampolle d’olio', qta: 1, peso: 2.7, icona: '🏮' },
    { id: 'sub-razioni', nome: 'Razioni giornaliere', qta: 5, peso: 0.9, icona: '🥩' },
    { id: 'sub-acciarino', nome: 'Acciarino ed esca', qta: 1, peso: 0.5, icona: '🪔' },
    { id: 'sub-borraccia', nome: 'Borraccia', qta: 1, peso: 2.3, icona: '🍶' },
    { id: 'sub-corda', nome: 'Corda di canapa (15m)', qta: 1, peso: 4.5, icona: '🪢' },
  ],
  'dotazione da sacerdote': [
    { id: 'sub-zaino', nome: 'Zaino', qta: 1, peso: 2.3, icona: '🎒' },
    { id: 'sub-coperta', nome: 'Coperta di lana', qta: 1, peso: 1.4, icona: '🛌' },
    { id: 'sub-candele', nome: 'Candele', qta: 10, peso: 0.1, icona: '🕯️' },
    { id: 'sub-acciarino', nome: 'Acciarino ed esca', qta: 1, peso: 0.5, icona: '🪔' },
    { id: 'sub-elemosina', nome: 'Cassetta delle elemosine', qta: 1, peso: 1.0, icona: '📦' },
    { id: 'sub-incenso', nome: 'Incenso e turibolo', qta: 2, peso: 1.0, icona: '💨' },
    { id: 'sub-paramenti', nome: 'Paramenti sacerdotali', qta: 1, peso: 1.8, icona: '👘' },
    { id: 'sub-razioni', nome: 'Razioni giornaliere', qta: 2, peso: 0.9, icona: '🥩' },
    { id: 'sub-borraccia', nome: 'Borraccia', qta: 1, peso: 2.3, icona: '🍶' },
  ],
  'dotazione da intrattenitore': [
    { id: 'sub-zaino', nome: 'Zaino', qta: 1, peso: 2.3, icona: '🎒' },
    { id: 'sub-sacco-pelo', nome: 'Sacco a pelo', qta: 1, peso: 3.2, icona: '⛺' },
    { id: 'sub-costumi', nome: 'Costumi di scena (x2)', qta: 2, peso: 1.8, icona: '🎭' },
    { id: 'sub-candele', nome: 'Candele', qta: 5, peso: 0.1, icona: '🕯️' },
    { id: 'sub-trucco', nome: 'Kit per il trucco', qta: 1, peso: 1.0, icona: '🎨' },
    { id: 'sub-razioni', nome: 'Razioni giornaliere', qta: 5, peso: 0.9, icona: '🥩' },
    { id: 'sub-borraccia', nome: 'Borraccia', qta: 1, peso: 2.3, icona: '🍶' },
  ],
  'dotazione da diplomatico': [
    { id: 'sub-cassa', nome: 'Cassa di legno', qta: 1, peso: 11.3, icona: '🧰' },
    { id: 'sub-astucci', nome: 'Astucci per mappe (x2)', qta: 2, peso: 0.5, icona: '🗺️' },
    { id: 'sub-abiti', nome: 'Abiti eleganti', qta: 1, peso: 2.7, icona: '👔' },
    { id: 'sub-inchiostro', nome: "Boccetta d'inchiostro e penna", qta: 1, peso: 0.1, icona: '✒️' },
    { id: 'sub-lampada', nome: 'Lampada e 2 ampolle d’olio', qta: 1, peso: 1.4, icona: '🪔' },
    { id: 'sub-pergamena', nome: 'Fogli di pergamena', qta: 5, peso: 0.1, icona: '📜' },
    { id: 'sub-profumo', nome: 'Fiala di profumo', qta: 1, peso: 0.1, icona: '🌸' },
    { id: 'sub-ceralacca', nome: 'Ceralacca e sigillo', qta: 1, peso: 0.1, icona: '🔖' },
  ],
  'dotazione da sotterraneo': [
    { id: 'sub-zaino', nome: 'Zaino', qta: 1, peso: 2.3, icona: '🎒' },
    { id: 'sub-piede-porco', nome: 'Piede di porco', qta: 1, peso: 2.3, icona: '🔨' },
    { id: 'sub-martello', nome: 'Martello e 10 chiodi da roccia', qta: 1, peso: 2.7, icona: '⚒️' },
    { id: 'sub-torce', nome: 'Torce', qta: 10, peso: 0.5, icona: '🕯️' },
    { id: 'sub-acciarino', nome: 'Acciarino ed esca', qta: 1, peso: 0.5, icona: '🪔' },
    { id: 'sub-razioni', nome: 'Razioni giornaliere', qta: 10, peso: 0.9, icona: '🥩' },
    { id: 'sub-borraccia', nome: 'Borraccia', qta: 1, peso: 2.3, icona: '🍶' },
    { id: 'sub-corda', nome: 'Corda di canapa (15m)', qta: 1, peso: 4.5, icona: '🪢' },
  ],
  'dotazione da dungeoneer': [
    { id: 'sub-zaino', nome: 'Zaino', qta: 1, peso: 2.3, icona: '🎒' },
    { id: 'sub-piede-porco', nome: 'Piede di porco', qta: 1, peso: 2.3, icona: '🔨' },
    { id: 'sub-martello', nome: 'Martello e 10 chiodi da roccia', qta: 1, peso: 2.7, icona: '⚒️' },
    { id: 'sub-torce', nome: 'Torce', qta: 10, peso: 0.5, icona: '🕯️' },
    { id: 'sub-acciarino', nome: 'Acciarino ed esca', qta: 1, peso: 0.5, icona: '🪔' },
    { id: 'sub-razioni', nome: 'Razioni giornaliere', qta: 10, peso: 0.9, icona: '🥩' },
    { id: 'sub-borraccia', nome: 'Borraccia', qta: 1, peso: 2.3, icona: '🍶' },
    { id: 'sub-corda', nome: 'Corda di canapa (15m)', qta: 1, peso: 4.5, icona: '🪢' },
  ],
  'borsa da erborista': [
    { id: 'sub-marsupio', nome: 'Marsupio da erborista', qta: 1, peso: 0.5, icona: '🌿' },
    { id: 'sub-cesoie', nome: 'Cesoie per erbe', qta: 1, peso: 0.3, icona: '✂️' },
    { id: 'sub-mortaio', nome: 'Mortaio e pestello', qta: 1, peso: 0.5, icona: '🥣' },
    { id: 'sub-fiale', nome: 'Fiale di vetro vuote (x5)', qta: 5, peso: 0.1, icona: '🧪' },
  ],
  'borsa del guaritore': [
    { id: 'sub-bende', nome: 'Bende sterili e stecche', qta: 10, peso: 0.1, icona: '🩹' },
    { id: 'sub-unguenti', nome: 'Unguenti medicamentosi', qta: 1, peso: 0.3, icona: '🧴' },
  ],
  'kit del guaritore': [
    { id: 'sub-bende', nome: 'Bende sterili e stecche', qta: 10, peso: 0.1, icona: '🩹' },
    { id: 'sub-unguenti', nome: 'Unguenti medicamentosi', qta: 1, peso: 0.3, icona: '🧴' },
  ],
  'kit da travestimento': [
    { id: 'sub-trucco', nome: 'Cosmetici e parrucche', qta: 1, peso: 1.0, icona: '🎭' },
    { id: 'sub-abiti', nome: 'Abiti di ricambio e accessori', qta: 1, peso: 0.5, icona: '👒' },
  ],
  'kit da falsario': [
    { id: 'sub-pergamena', nome: 'Pergamene speciali e inchiostri', qta: 1, peso: 0.8, icona: '📜' },
    { id: 'sub-sigilli', nome: 'Sigilli e ceralacca', qta: 1, peso: 0.5, icona: '🔖' },
  ],
  'arnesi da scasso': [
    { id: 'sub-grimaldelli', nome: 'Grimaldelli di precisione', qta: 1, peso: 0.3, icona: '🗝️' },
    { id: 'sub-lima', nome: 'Piccola lima e cesoia', qta: 1, peso: 0.2, icona: '🔧' },
  ]
};

export function trovaContenutoDotazione(nome) {
  if (!nome) return null;
  const n = String(nome).trim().toLowerCase();
  for (const [k, v] of Object.entries(CONTENUTO_DOTAZIONI_5E)) {
    if (n.includes(k) || k.includes(n)) return v;
  }
  return null;
}

export function eContenitore(item) {
  if (!item) return false;
  if (Array.isArray(item.contenuto) && item.contenuto.length > 0) return true;
  return Boolean(trovaContenutoDotazione(item.nome));
}

export function ottieniContenutoItem(item) {
  if (!item) return [];
  if (Array.isArray(item.contenuto) && item.contenuto.length > 0) return item.contenuto;
  const def = trovaContenutoDotazione(item.nome);
  return def ? def.map((x, i) => ({ ...x, id: x.id || `sub-${i}-${Date.now()}` })) : [];
}

/**
 * Trucchetti e incantesimi iniziali per un incantatore creato a livello alto.
 * Senza questi un Mago di 12° nascerebbe con gli slot pieni e la lista vuota.
 * Gli incantesimi vengono distribuiti sui livelli seguendo il numero di slot
 * disponibili, così la lista somiglia a quella di un personaggio davvero
 * giocato: tanti di basso livello, pochi di quelli alti.
 */
export function incantesimiInizialiPerLivello(classe, livello, versione, caratteristiche, sottoclasse) {
  const chiave = chiaveClasse(classe);
  const terzo = sottoclasseTerzoIncantatore(classe, sottoclasse);
  const liste = terzo ? listeIncantesimiTerzoCaster(terzo, versione) : INCANTESIMI_CLASSE[chiave];
  if (!liste) return null;
  const finta = { classe, sottoclasse, livello, incantatore: { caratteristica: terzo ? 'intelligenza' : (CARATT_INCANTATORE[chiave] || '') }, caratteristiche };
  const nTruc = trucchettiMax(classe, livello, sottoclasse) || 0;
  const nInc = incantesimiMaxAuto(finta, versione) || 0;
  const voce = (nome, liv, i) => ({
    id: `auto-inc-${liv}-${i}`,
    ...(dettagliIncantesimo(nome) || {}),
    livello: liv,
    nome,
    preparato: true,
  });

  const trucchetti = (liste[0] || []).slice(0, nTruc).map((n, i) => voce(n, 0, i));

  // Livello massimo di incantesimo lanciabile, entro i dati disponibili.
  const slot = slotDaClasseLivello(classe, livello, sottoclasse) || {};
  let maxLiv = 0;
  for (const k of Object.keys(slot)) {
    if ((slot[k]?.totale || 0) > 0 && liste[k]) maxLiv = Math.max(maxLiv, Number(k));
  }
  const incantesimi = [];
  if (maxLiv > 0 && nInc > 0) {
    const presi = {};
    // Prima passata: al massimo tanti incantesimi quanti sono gli slot di quel
    // livello. È la proporzione che rende la lista credibile, invece che tutta
    // di 1° livello. Seconda passata (senza quel tetto): completa la quota se
    // gli incantesimi di livello alto in archivio non bastano.
    for (const conTetto of [true, false]) {
      let aggiunto = true;
      while (incantesimi.length < nInc && aggiunto) {
        aggiunto = false;
        for (let liv = 1; liv <= maxLiv && incantesimi.length < nInc; liv += 1) {
          const lista = liste[liv] || [];
          const quanti = presi[liv] || 0;
          if (quanti >= lista.length) continue;
          if (conTetto && quanti >= (slot[liv]?.totale || 0)) continue;
          incantesimi.push(voce(lista[quanti], liv, quanti));
          presi[liv] = quanti + 1;
          aggiunto = true;
        }
      }
    }
  }
  return { trucchetti, incantesimi };
}

/** Competenze concesse dalla specie (anche per sottorazze come "Elfo dei
 *  Boschi", per corrispondenza di sottostringa): { numero, lista } o null. */
function competenzeSpecieDi(specie) {
  if (!specie) return null;
  const s = String(specie).toLowerCase();
  const chiavi = Object.keys(COMPETENZE_SPECIE);
  const esatta = chiavi.find((x) => x.toLowerCase() === s);
  const chiave = esatta || [...chiavi].sort((a, b) => b.length - a.length).find((x) => s.includes(x.toLowerCase()));
  if (!chiave) return null;
  const dati = COMPETENZE_SPECIE[chiave];
  const lista = dati.lista === 'tutte' ? ABILITA.map((a) => a.key) : dati.lista;
  return { numero: dati.numero, lista };
}

/**
 * Controlli "leggeri" su una scheda: cose che vale la pena ricontrollare a
 * mano, non correzioni automatiche. Solo i Tiri Salvezza e le competenze
 * fisse del background sono segnalati come "certi" (per regola non hanno
 * eccezioni: un talento può solo aggiungerne, mai far mancare quelli dovuti).
 * Il resto delle abilità è un suggerimento, perché talenti, multiclasse e
 * oggetti magici possono spiegare competenze "in più" che qui non si vedono.
 * Ogni voce ha un id stabile, comodo per farla ignorare in modo permanente.
 */
export function controlliScheda(scheda) {
  const risultati = [];
  if (!scheda) return risultati;

  const classeKey = chiaveClasse(scheda.classe);
  const abilita = scheda.abilita || {};
  const tiriSalvezza = scheda.tiriSalvezza || {};

  // --- Tiri salvezza: solo la classe principale li concede, sempre. ---
  const tsAttesi = (classeKey && TS_CLASSE[classeKey]) || [];
  for (const { key, label } of CARATTERISTICHE) {
    if (tsAttesi.includes(key) && !tiriSalvezza[key]) {
      risultati.push({
        id: `ts-${key}`,
        tipo: 'ts',
        targetKey: key,
        gravita: 'certo',
        testo: `${scheda.classe || 'La classe'}: manca la competenza nel Tiro Salvezza di ${label}.`,
        correggibile: true,
      });
    }
  }

  // --- Competenze fisse del background: sempre concesse, nessuna scelta. ---
  const bgLista = BACKGROUND_COMPETENZE[scheda.background] || [];
  for (const chiave of bgLista) {
    const def = ABILITA.find((a) => a.key === chiave);
    if (def && !(abilita[chiave] > 0)) {
      risultati.push({
        id: `bg-${chiave}`,
        tipo: 'abilita',
        targetKey: chiave,
        gravita: 'certo',
        testo: `${scheda.background}: manca la competenza in ${def.label}.`,
        correggibile: true,
      });
    }
  }

  // --- Abilità e Budget: quante sono spiegabili da razza + classe + multiclasse + background ---
  const raceInfo = competenzeSpecieDi(scheda.specie);
  const classeDati = classeKey && COMPETENZE_CLASSE[classeKey];
  const classeInfo = classeDati
    ? { numero: classeDati.numero, lista: classeDati.lista === 'tutte' ? ABILITA.map((a) => a.key) : classeDati.lista }
    : null;

  // Competenze multiclasse ufficiali (Manuale del Giocatore 5e):
  // - Ladro: 1 abilità dalla lista del ladro
  // - Bardo: 1 abilità a scelta tra tutte
  // - Ranger: 1 abilità dalla lista del ranger
  let bonusAbilitaMulti = 0;
  const multiListe = [];
  if (Array.isArray(scheda.multiclasse)) {
    for (const m of scheda.multiclasse) {
      const mk = chiaveClasse(m.classe);
      if (mk === 'ladro') {
        bonusAbilitaMulti += 1;
        multiListe.push(...(COMPETENZE_CLASSE.ladro.lista || []));
      } else if (mk === 'bardo') {
        bonusAbilitaMulti += 1;
        multiListe.push(...ABILITA.map((a) => a.key));
      } else if (mk === 'ranger') {
        bonusAbilitaMulti += 1;
        multiListe.push(...(COMPETENZE_CLASSE.ranger.lista || []));
      }
    }
  }

  const unione = new Set([...(raceInfo?.lista || []), ...(classeInfo?.lista || []), ...multiListe, ...bgLista]);
  const budget = (raceInfo?.numero || 0) + (classeInfo?.numero || 0) + bonusAbilitaMulti + bgLista.length;

  const segnate = ABILITA.filter((a) => (abilita[a.key] || 0) > 0);
  for (const a of segnate.filter((a) => !unione.has(a.key))) {
    risultati.push({
      id: `fonte-${a.key}`,
      tipo: 'rimuovi_abilita',
      targetKey: a.key,
      gravita: 'da_controllare',
      testo: `${a.label}: nessuna fonte automatica (né razza, né classe, né background). Se non deriva da un talento, un oggetto o una concessione del DM, controllala.`,
      correggibile: true,
    });
  }

  const segnateSpiegabili = segnate.filter((a) => unione.has(a.key)).length;
  if (budget > 0 && segnateSpiegabili > budget) {
    risultati.push({
      id: 'budget-abilita',
      tipo: 'budget_abilita',
      gravita: 'da_controllare',
      testo: `Hai ${segnateSpiegabili} competenze segnate tra quelle spiegabili da razza (${raceInfo?.numero || 0}), classe (${classeInfo?.numero || 0})${bonusAbilitaMulti ? `, multiclasse (${bonusAbilitaMulti})` : ''} e background (${bgLista.length}), che insieme ne concederebbero ${budget}. Se non hai talenti che ne spiegano altre, controlla quali tenere.`,
      correggibile: true,
      budget,
      bgLista,
      unione: Array.from(unione),
    });
  }

  // --- Verifica Bonus Competenza rispetto al Livello Totale ---
  if (scheda.classe && scheda.bonusCompetenza != null && Number(scheda.bonusCompetenza) > 0) {
    const livTotale = (scheda.livello || 1) + (Array.isArray(scheda.multiclasse) ? scheda.multiclasse.reduce((s, m) => s + (Number(m.livello) || 0), 0) : 0);
    const bonusAtteso = bonusCompetenzaDaLivello(livTotale);
    if (Number(scheda.bonusCompetenza) !== bonusAtteso) {
      risultati.push({
        id: 'bonus-competenza',
        gravita: 'certo',
        testo: `Bonus Competenza: la scheda ha ${conSegno(scheda.bonusCompetenza)}, ma per un personaggio di livello totale ${livTotale} deve essere ${conSegno(bonusAtteso)}.`,
        correggibile: true,
        tipo: 'bonus_competenza',
        targetVal: bonusAtteso,
      });
    }
  }

  // --- Verifica Incantesimi Preparati / Conosciuti ---
  if (scheda.classe && Array.isArray(scheda.incantesimiLista)) {
    const maxInc = incantesimiMaxAuto(scheda, scheda.versione || '2024');
    const nIncanti = scheda.incantesimiLista.filter((s) => s.livello > 0 && !s.bonus).length;
    if (maxInc != null && nIncanti > maxInc) {
      risultati.push({
        id: 'budget-incantesimi',
        gravita: 'da_controllare',
        testo: `Incantesimi: hai ${nIncanti} incantesimi preparati/conosciuti (1° liv+), ma le regole per ${scheda.classe} al livello ${scheda.livello || 1} ne prevedono ${maxInc}.`,
      });
    }

    // Trucchetti noti
    const maxTruc = trucchettiMax(scheda.classe, scheda.livello || 1, scheda.sottoclasse);
    const nTruc = scheda.incantesimiLista.filter((s) => s.livello === 0 && !s.bonus).length;
    if (maxTruc != null && nTruc > maxTruc) {
      risultati.push({
        id: 'budget-trucchetti',
        gravita: 'da_controllare',
        testo: `Trucchetti: hai ${nTruc} trucchetti conosciuti, ma le regole per ${scheda.classe} al livello ${scheda.livello || 1} ne prevedono ${maxTruc}.`,
      });
    }

    // Incantesimi di livello superiore al massimo slot posseduto
    if (scheda.slotIncantesimo) {
      const slot = scheda.slotIncantesimo;
      const maxSlotLivello = Math.max(0, ...Object.keys(slot).filter((k) => (slot[k]?.totale || 0) > 0).map(Number));
      if (maxSlotLivello > 0) {
        for (const inc of scheda.incantesimiLista) {
          if (inc.livello > maxSlotLivello && !inc.bonus) {
            risultati.push({
              id: `incantesimo-troppo-alto-${inc.nome}`,
              gravita: 'da_controllare',
              testo: `Incantesimi: "${inc.nome}" è di ${inc.livello}° livello, ma la scheda dispone di slot fino al ${maxSlotLivello}° livello.`,
            });
          }
        }
      }
    }

    // Incantesimi duplicati
    const visti = new Set();
    for (const inc of scheda.incantesimiLista) {
      const nomeN = String(inc.nome || '').trim().toLowerCase();
      if (nomeN && visti.has(nomeN)) {
        risultati.push({
          id: `incantesimo-duplicato-${nomeN}`,
          gravita: 'da_controllare',
          testo: `Incantesimi: "${inc.nome}" è inserito più di una volta nella lista incantesimi.`,
        });
      }
      if (nomeN) visti.add(nomeN);
    }
  }

  // --- Caratteristica da Incantatore ---
  const carAttesa = caratteristicaIncantatoreEffettiva(scheda.classe, scheda.sottoclasse);
  if (carAttesa && scheda.incantatore?.caratteristica && scheda.incantatore.caratteristica !== carAttesa) {
    const nomeAttesa = CARATTERISTICHE.find((c) => c.key === carAttesa)?.label || carAttesa;
    const nomeAttuale = CARATTERISTICHE.find((c) => c.key === scheda.incantatore.caratteristica)?.label || scheda.incantatore.caratteristica;
    risultati.push({
      id: 'caratteristica-incantatore',
      gravita: 'certo',
      testo: `Incantatore: la caratteristica magica di ${scheda.classe} è ${nomeAttesa}, mentre sulla scheda è impostata su ${nomeAttuale}.`,
      correggibile: true,
      tipo: 'caratteristica_incantatore',
      targetVal: carAttesa,
    });
  }

  // --- Punti Ferita Massimi ---
  if (scheda.pfMax != null && Number(scheda.pfMax) <= 0) {
    risultati.push({
      id: 'pf-max-invalido',
      gravita: 'certo',
      testo: `Punti Ferita: i PF massimi (${scheda.pfMax}) devono essere maggiori di 0.`,
    });
  }

  // --- Sintonia Oggetti Magici (massimo 3) ---
  if (Array.isArray(scheda.sintonia) && scheda.sintonia.filter(Boolean).length > 3) {
    risultati.push({
      id: 'sintonia-max',
      gravita: 'certo',
      testo: `Sintonia: hai ${scheda.sintonia.filter(Boolean).length} oggetti sintonizzati. Il limite massimo in D&D 5e è di 3 oggetti contemporaneamente.`,
    });
  }

  // --- Livello Minimo Sottoclasse ---
  if (scheda.classe && scheda.sottoclasse) {
    const livMin = sottoclasseLivPer(scheda.classe, scheda.versione || '2024');
    const livPg = Number(scheda.livello) || 1;
    if (livMin && livPg < livMin) {
      risultati.push({
        id: 'sottoclasse-livello-insufficiente',
        gravita: 'certo',
        testo: `Sottoclasse: "${scheda.sottoclasse}" è impostata al livello ${livPg}, ma per ${scheda.classe} (${scheda.versione === '2014' ? '5.0' : '5.5'}) si sblocca al ${livMin}° livello.`,
      });
    }
  }

  // --- Punteggi Caratteristiche (range legale 1 - 30) ---
  for (const { key, label } of CARATTERISTICHE) {
    const v = Number(scheda.caratteristiche?.[key]);
    if (v != null && !isNaN(v) && v > 0) {
      if (v < 1 || v > 30) {
        risultati.push({
          id: `caratteristica-range-${key}`,
          gravita: 'certo',
          testo: `Caratteristiche: il punteggio di ${label} (${v}) è fuori dai limiti di D&D (1 - 30).`,
        });
      }
    }
  }

  // --- Competenza nell'Armatura e Scudo Indossati ---
  if (scheda.armatura?.tipo && scheda.armatura.tipo !== 'nessuna' && scheda.armatura.tipo !== 'manuale') {
    const tipo = scheda.armatura.tipo;
    const add = scheda.addestramento?.armature || {};
    if (add[tipo] === false) {
      risultati.push({
        id: `armatura-senza-competenza-${tipo}`,
        gravita: 'da_controllare',
        testo: `Armatura: indossi un'armatura ${tipo} senza avere la competenza segnata in Addestramento. In D&D 5e questo impone svantaggio alle prove di FOR/DES e impedisce il lancio di incantesimi.`,
      });
    }
  }
  if (scheda.armatura?.scudo) {
    const add = scheda.addestramento?.armature || {};
    if (add.scudi === false) {
      risultati.push({
        id: 'scudo-senza-competenza',
        gravita: 'da_controllare',
        testo: `Scudo: impugni uno scudo senza avere la competenza segnata in Addestramento.`,
      });
    }
  }

  return risultati;
}

/**
 * Risorse di classe dopo un riposo. Nel modello `attuali` sono gli usi ANCORA
 * DISPONIBILI (una risorsa nasce con attuali = max e il pulsante "−" spende),
 * quindi un riposo le riporta al massimo: non le azzera.
 * `tipo` è 'lungo' (ricarica tutto ciò che ha un reset) o 'breve' (solo le
 * risorse che si ricaricano con il riposo breve).
 */
export function risorseDopoRiposo(risorse, tipo) {
  return (Array.isArray(risorse) ? risorse : []).map((r) => {
    if (!r || !r.reset) return r;
    if (tipo === 'breve' && r.reset !== 'breve') return r;
    const max = Math.max(0, Number(r.max) || 0);
    return { ...r, attuali: max };
  });
}

/**
 * Fonte di Magia (Stregone): costo in Punti Stregoneria per creare uno slot.
 * Stessa tabella nella 5.0 e nella 5.5; oltre il 5° livello non si può.
 */
export const COSTO_SLOT_IN_PUNTI = { 1: 2, 2: 3, 3: 5, 4: 6, 5: 7 };

/** Livelli di slot che la Fonte di Magia può creare, dal più economico. */
export const LIVELLI_CONVERTIBILI = [1, 2, 3, 4, 5];

function slotDi(slotIncantesimo, livello) {
  const v = (slotIncantesimo || {})[livello] || (slotIncantesimo || {})[String(livello)];
  return { totale: Math.max(0, Number(v?.totale) || 0), spesi: Math.max(0, Number(v?.spesi) || 0) };
}

/**
 * Spende Punti Stregoneria per recuperare uno slot già speso di quel livello.
 * Modelliamo il recupero di uno slot speso (non uno slot in più): il totale
 * degli slot dipende da classe e livello, quindi aumentarlo resterebbe anche
 * dopo il riposo lungo, che azzera solo gli slot spesi.
 * Ritorna { ok: false, motivo } oppure { ok: true, slotIncantesimo, punti }.
 */
export function puntiVersoSlot(slotIncantesimo, punti, livello) {
  const costo = COSTO_SLOT_IN_PUNTI[livello];
  if (!costo) return { ok: false, motivo: 'La Fonte di Magia crea slot solo fino al 5° livello.' };
  const disponibili = Math.max(0, Number(punti) || 0);
  if (disponibili < costo) return { ok: false, motivo: `Servono ${costo} Punti Stregoneria, ne hai ${disponibili}.` };
  const s = slotDi(slotIncantesimo, livello);
  if (s.totale === 0) return { ok: false, motivo: `Non hai slot di ${livello}° livello sulla scheda.` };
  if (s.spesi === 0) return { ok: false, motivo: `Hai già tutti gli slot di ${livello}° livello disponibili.` };
  return {
    ok: true,
    punti: disponibili - costo,
    slotIncantesimo: { ...slotIncantesimo, [livello]: { ...s, spesi: s.spesi - 1 } },
  };
}

/**
 * Spende uno slot disponibile per ottenere Punti Stregoneria pari al suo livello.
 * I punti non possono superare il massimo della riserva.
 */
export function slotVersoPunti(slotIncantesimo, punti, puntiMax, livello) {
  const liv = Number(livello) || 0;
  if (liv < 1) return { ok: false, motivo: 'Livello di slot non valido.' };
  const s = slotDi(slotIncantesimo, liv);
  const disponibili = s.totale - s.spesi;
  if (disponibili <= 0) return { ok: false, motivo: `Non hai slot di ${liv}° livello disponibili.` };
  const attuali = Math.max(0, Number(punti) || 0);
  const max = Math.max(0, Number(puntiMax) || 0);
  if (attuali >= max) return { ok: false, motivo: 'La riserva di Punti Stregoneria è già piena.' };
  return {
    ok: true,
    punti: Math.min(max, attuali + liv),
    slotIncantesimo: { ...slotIncantesimo, [liv]: { ...s, spesi: s.spesi + 1 } },
  };
}

/**
 * Riepilogo degli effetti meccanici delle condizioni attive. Restituisce una
 * riga per ogni effetto in gioco, con l'elenco delle condizioni che lo causano
 * (così si capisce da dove arriva lo svantaggio, e cosa resta se ne togli una).
 * Ordine stabile: quello di ETICHETTE_EFFETTI, non quello di inserimento.
 */
export function riepilogoCondizioni(condizioni) {
  const attive = (Array.isArray(condizioni) ? condizioni : []).filter((c) => EFFETTI_CONDIZIONI[c]);
  const righe = [];
  for (const flag of Object.keys(ETICHETTE_EFFETTI)) {
    const da = attive.filter((c) => EFFETTI_CONDIZIONI[c][flag]);
    if (da.length) righe.push({ flag, da });
  }
  return righe;
}
