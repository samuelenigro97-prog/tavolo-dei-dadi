// Regole 5e che dipendono dai dati: classi, slot, incantesimi, pesi.
import { CLASSI, CLASSI_FULL_CASTER, CLASSI_MEZZO_CASTER, SLOT_FULL_CASTER, SLOT_MEZZO_CASTER,
  TRUCCHETTI_NOTI, INC_MAX_2024, INC_MAX_2014_NOTI, SOTTOCLASSE_LIV, SOTTOCLASSE_LIV_2014,
  PRIVILEGI_CLASSE_LIV, PRIVILEGI_CLASSE_LIV_2014, ASI_LIV, PESI_OGGETTI, PESO_ARMATURA_TIPO } from '../data/dati5e.js';
import { modificatore } from './dadi.js';
import { spiegaIncantesimo } from '../data/spiegazioni.js';

export function trucchettiMax(classe, livello) {
  const k = chiaveClasse(classe);
  const base = TRUCCHETTI_NOTI[k];
  if (!base) return null;
  const lv = Math.max(1, Math.floor(livello) || 1);
  return lv >= 10 ? base[2] : lv >= 4 ? base[1] : base[0];
}

export function incantesimiMaxAuto(scheda, versione = '2024') {
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

export function sottoclasseLivPer(versione) {
  return versione === '2014' ? SOTTOCLASSE_LIV_2014 : SOTTOCLASSE_LIV;
}

export function chiaveClasse(classe) {
  const c = coloreClasse(classe);
  return c ? c.match[0] : null;
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

export function asiAlLivello(classe, livello) {
  const k = chiaveClasse(classe);
  return ((k && ASI_LIV[k]) || ASI_LIV._default).includes(livello);
}

export function slotDaClasseLivello(classe, livello) {
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

export function livelloIncantatoreCombinato(classi) {
  let lv = 0;
  for (const { classe, livello } of classi) {
    const c = coloreClasse(classe);
    if (!c) continue;
    const k = c.match[0];
    if (CLASSI_FULL_CASTER.includes(k)) lv += Math.floor(livello) || 0;
    else if (CLASSI_MEZZO_CASTER.includes(k)) lv += Math.floor((Math.floor(livello) || 0) / 2);
  }
  return lv;
}

export function slotMulticlasse(classi) {
  const lv = livelloIncantatoreCombinato(classi);
  if (lv < 1) return null;
  const tabella = SLOT_FULL_CASTER[Math.min(20, lv)];
  if (!tabella) return null;
  const slot = {};
  for (let i = 1; i <= 9; i++) slot[i] = { totale: tabella[i - 1] || 0, spesi: 0 };
  return slot;
}

export function coloreClasse(classe) {
  if (typeof classe !== 'string' || !classe) return null;
  const c = classe.toLowerCase();
  return CLASSI.find((x) => x.match.some((m) => c.includes(m))) || null;
}

export function dettagliIncantesimo(nome) {
  const desc = spiegaIncantesimo(nome) || '';
  if (!desc) return null;
  let tempo = 'AZ';
  if (/reazione/i.test(desc)) tempo = 'REAZ';
  else if (/azione bonus/i.test(desc)) tempo = 'AZ BONUS';
  let gittata = '';
  const mG = desc.match(/gittata\s*(\d+(?:[.,]\d+)?)\s*m/i);
  const mR = desc.match(/raggio\s*(\d+(?:[.,]\d+)?)\s*m/i);
  const mC = desc.match(/cono\s*(?:di\s*)?(\d+(?:[.,]\d+)?)\s*m/i);
  if (mG) gittata = `${mG[1]}m`;
  else if (/tocc|contatto/i.test(desc)) gittata = 'contatto';
  else if (/personale|te stesso|su di te|intorno a te/i.test(desc)) gittata = 'personale';
  else if (mR) gittata = `raggio ${mR[1]}m`;
  else if (mC) gittata = `cono ${mC[1]}m`;
  const note = [/\brituale\b/i.test(desc) && 'Rituale', /concentrazione/i.test(desc) && 'Conc.'].filter(Boolean).join(', ');
  return { tempo, gittata, note };
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
