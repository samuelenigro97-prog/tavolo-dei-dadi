// Regole 5e che dipendono dai dati: classi, slot, incantesimi, pesi.
import { CLASSI, CLASSI_FULL_CASTER, CLASSI_MEZZO_CASTER, SLOT_FULL_CASTER, SLOT_MEZZO_CASTER,
  TRUCCHETTI_NOTI, INC_MAX_2024, INC_MAX_2014_NOTI, SOTTOCLASSE_LIV, SOTTOCLASSE_LIV_2014,
  PRIVILEGI_CLASSE_L1, PRIVILEGI_CLASSE_L1_2014, PRIVILEGI_CLASSE_LIV,
  PRIVILEGI_CLASSE_LIV_2014, ASI_LIV, PESI_OGGETTI, PESO_ARMATURA_TIPO,
  INCANTESIMI_CLASSE, CARATT_INCANTATORE, SOTTOCLASSE_TERZO_CASTER,
  SCUOLE_TERZO_CASTER_2014, SLOT_TERZO_CASTER, INC_MAX_TERZO, TRUCCHETTI_TERZO_CASTER,
  TS_CLASSE, COMPETENZE_CLASSE, COMPETENZE_SPECIE, BACKGROUND_COMPETENZE } from '../data/dati5e.js';
import { modificatore } from './dadi.js';
import { spiegaIncantesimo } from '../data/spiegazioni.js';
import { INCANTESIMI_DB, datiIncantesimo } from '../data/incantesimi.js';
import { ABILITA, CARATTERISTICHE } from '../data/caratteristiche.js';

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
  if (sottoclasseTerzoIncantatore(scheda?.classe, scheda?.sottoclasse)) return 'intelligenza';
  const salvata = scheda?.incantatore?.caratteristica;
  return ['forza', 'destrezza', 'costituzione', 'intelligenza', 'saggezza', 'carisma'].includes(salvata) ? salvata : '';
}

/** Classi che scelgono ogni giorno gli incantesimi preparati da una lista ampia. */
export function classePreparaIncantesimi(classe) {
  return ['mago', 'chierico', 'druido', 'paladino'].includes(chiaveClasse(classe));
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

export function slotDaClasseLivello(classe, livello, sottoclasse) {
  const lv = Math.max(1, Math.min(20, Math.floor(livello) || 1));
  let tabella = null;
  if (sottoclasseTerzoIncantatore(classe, sottoclasse)) {
    tabella = SLOT_TERZO_CASTER[lv];
  } else {
    const c = coloreClasse(classe);
    if (!c) return null;
    if (CLASSI_FULL_CASTER.includes(c.match[0])) tabella = SLOT_FULL_CASTER[lv];
    else if (CLASSI_MEZZO_CASTER.includes(c.match[0])) tabella = SLOT_MEZZO_CASTER[lv];
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
        gravita: 'certo',
        testo: `${scheda.classe || 'La classe'}: manca la competenza nel Tiro Salvezza di ${label}.`,
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
        gravita: 'certo',
        testo: `${scheda.background}: manca la competenza in ${def.label}.`,
      });
    }
  }

  // --- Abilità: quante sono spiegabili da razza+classe+background, e quali
  // non hanno nessuna fonte automatica. Solo suggerimenti. ---
  const raceInfo = competenzeSpecieDi(scheda.specie);
  const classeDati = classeKey && COMPETENZE_CLASSE[classeKey];
  const classeInfo = classeDati
    ? { numero: classeDati.numero, lista: classeDati.lista === 'tutte' ? ABILITA.map((a) => a.key) : classeDati.lista }
    : null;
  const unione = new Set([...(raceInfo?.lista || []), ...(classeInfo?.lista || []), ...bgLista]);
  const budget = (raceInfo?.numero || 0) + (classeInfo?.numero || 0) + bgLista.length;

  const segnate = ABILITA.filter((a) => (abilita[a.key] || 0) > 0);
  for (const a of segnate.filter((a) => !unione.has(a.key))) {
    risultati.push({
      id: `fonte-${a.key}`,
      gravita: 'da_controllare',
      testo: `${a.label}: nessuna fonte automatica (né razza, né classe, né background). Se non deriva da un talento, un oggetto o una concessione del DM, controllala.`,
    });
  }

  const segnateSpiegabili = segnate.filter((a) => unione.has(a.key)).length;
  if (budget > 0 && segnateSpiegabili > budget) {
    risultati.push({
      id: 'budget-abilita',
      gravita: 'da_controllare',
      testo: `Hai ${segnateSpiegabili} competenze segnate tra quelle spiegabili da razza (${raceInfo?.numero || 0}), classe (${classeInfo?.numero || 0}) e background (${bgLista.length}), che insieme ne concederebbero ${budget}. Se non hai talenti o multiclasse che ne spiegano altre, controlla quali tenere.`,
    });
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
