// Suite di regole 5e — verifica i calcoli puri (dadi, modificatori, slot, incantesimi).
// Nessuna dipendenza esterna: gira con `node --test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  modificatore, conSegno, parseEspressioneDado, facceDadoVita, esprDadiVita, gruppiDadoVita,
  bonusCompetenzaDaLivello, tiraDanni, tiraD20, capacitaCarico,
} from '../src/rules/dadi.js';

import {
  coloreClasse, chiaveClasse, slotDaClasseLivello, livelloIncantatoreCombinato,
  slotMulticlasse, asiAlLivello, privilegiClasseLivello, privilegiClasseFinoA,
  sottoclasseLivPer, trucchettiMax, incantesimiMaxAuto, caratteristicaIncantatoreEffettiva,
  classificaIncantesimoCombattimento, sottoclasseTerzoIncantatore, incantesimiTerzoCasterLivello,
  controlliScheda, risorseDopoRiposo, COSTO_SLOT_IN_PUNTI, puntiVersoSlot, slotVersoPunti,
  riepilogoCondizioni, maxInvocazioniWarlock, maxInfusioniNote, maxOggettiInfusi,
  classePreparaIncantesimi, calcolaPfCompagno, parseAzioniCompagno, dettagliEsperienza,
  analizzaPozione, calcolaMovimentoESalti,
} from '../src/rules/regole.js';
import { EFFETTI_CONDIZIONI, ETICHETTE_EFFETTI } from '../src/data/condizioni.js';
import { CONDIZIONI_5E, PE_PER_LIVELLO } from '../src/data/dati5e.js';
import { spiegaPrivilegio, spiegaInvocazione, spiegaInfusione, INVOCAZIONI_5E, INFUSIONI_ARTEFICE_5E } from '../src/data/spiegazioni.js';

// --- Helper: sostituisce Math.random con una coda di valori deterministici ---
function conRandom(valori, fn) {
  const originale = Math.random;
  let i = 0;
  Math.random = () => (i < valori.length ? valori[i++] : 0);
  try { return fn(); } finally { Math.random = originale; }
}

// ========================= dadi.js =========================

test('modificatore: tabella caratteristiche 5e', () => {
  assert.equal(modificatore(10), 0);
  assert.equal(modificatore(11), 0);
  assert.equal(modificatore(8), -1);
  assert.equal(modificatore(20), 5);
  assert.equal(modificatore(1), -5);
  assert.equal(modificatore(15), 2);
  assert.equal(modificatore(30), 10);
});

test('modificatore: input non valido -> 0', () => {
  assert.equal(modificatore('ciao'), 0);
  assert.equal(modificatore(undefined), 0);
  assert.equal(modificatore(NaN), 0);
});

test('conSegno: prefisso corretto', () => {
  assert.equal(conSegno(3), '+3');
  assert.equal(conSegno(0), '+0');
  assert.equal(conSegno(-2), '-2');
});

test('parseEspressioneDado: espressioni valide', () => {
  const a = parseEspressioneDado('1d8+2');
  assert.deepEqual(a.termini, [
    { tipo: 'dado', quantita: 1, facce: 8, segno: 1 },
    { tipo: 'fisso', valore: 2, segno: 1 },
  ]);
  const b = parseEspressioneDado('2d6');
  assert.equal(b.termini.length, 1);
  assert.equal(b.termini[0].facce, 6);
  assert.equal(b.termini[0].quantita, 2);
  // termini multipli con segni
  const c = parseEspressioneDado('1d8+2-1d4');
  assert.equal(c.termini.length, 3);
  assert.equal(c.termini[2].segno, -1);
  assert.equal(c.termini[2].tipo, 'dado');
});

test('parseEspressioneDado: spazi e maiuscole tollerati', () => {
  const a = parseEspressioneDado('  2D6 + 3 ');
  assert.equal(a.termini[0].facce, 6);
  assert.equal(a.termini[1].valore, 3);
});

test('parseEspressioneDado: espressioni non valide -> null', () => {
  assert.equal(parseEspressioneDado(''), null);
  assert.equal(parseEspressioneDado('ciao'), null);
  assert.equal(parseEspressioneDado('5'), null);        // nessun dado
  assert.equal(parseEspressioneDado('1d1'), null);      // facce < 2
  assert.equal(parseEspressioneDado('0d6'), null);      // quantita < 1
  assert.equal(parseEspressioneDado(42), null);         // non stringa
  assert.equal(parseEspressioneDado('1d6*2'), null);    // carattere illegale
});

test('facceDadoVita / esprDadiVita', () => {
  assert.equal(facceDadoVita('1d10'), 10);
  assert.equal(facceDadoVita('nessun dado'), 8); // default
  assert.equal(esprDadiVita(5, 8), '5d8');
  assert.equal(esprDadiVita(0, 6), '1d6');   // livello minimo 1
  assert.equal(esprDadiVita(3.9, 12), '3d12');
});

test('gruppiDadoVita: singola classe e multiclasse (stesso dado unito, diverso in righe separate)', () => {
  assert.deepEqual(gruppiDadoVita('5d8'), [{ facce: 8, quantita: 5 }]);
  assert.deepEqual(gruppiDadoVita('3d10 + 2d8'), [{ facce: 10, quantita: 3 }, { facce: 8, quantita: 2 }]);
  assert.deepEqual(gruppiDadoVita('4d8'), [{ facce: 8, quantita: 4 }]); // due classi d8 fuse in un solo gruppo a monte
  assert.deepEqual(gruppiDadoVita('nessun dado'), [{ facce: 8, quantita: 1 }]); // default
});

test('bonusCompetenzaDaLivello: soglie ufficiali', () => {
  assert.equal(bonusCompetenzaDaLivello(1), 2);
  assert.equal(bonusCompetenzaDaLivello(4), 2);
  assert.equal(bonusCompetenzaDaLivello(5), 3);
  assert.equal(bonusCompetenzaDaLivello(8), 3);
  assert.equal(bonusCompetenzaDaLivello(9), 4);
  assert.equal(bonusCompetenzaDaLivello(13), 5);
  assert.equal(bonusCompetenzaDaLivello(17), 6);
  assert.equal(bonusCompetenzaDaLivello(20), 6);
});

test('tiraDanni: somma dadi + fisso, non critico', () => {
  const p = parseEspressioneDado('2d6+3');
  // Math.random 0 -> ogni d6 vale 1
  const r = conRandom([0, 0], () => tiraDanni(p, false));
  assert.equal(r.totale, 1 + 1 + 3);
});

test('tiraDanni: critico raddoppia solo i dadi', () => {
  const p = parseEspressioneDado('2d6+3');
  // 4 dadi (2 raddoppiati), tutti a 1
  const r = conRandom([0, 0, 0, 0], () => tiraDanni(p, true));
  assert.equal(r.totale, 4 + 3);
});

test('tiraDanni: totale non scende mai sotto 0', () => {
  const p = parseEspressioneDado('1d4-10');
  const r = conRandom([0], () => tiraDanni(p, false)); // d4=1 -> 1-10 = -9 -> 0
  assert.equal(r.totale, 0);
});

test('tiraD20: normale / vantaggio / svantaggio', () => {
  // Math.random 0.0 -> 1, 0.95 -> 20 (1 + floor(0.95*20)=1+19=20)
  const norm = conRandom([0.0], () => tiraD20('normale'));
  assert.equal(norm.naturale, 1);
  assert.equal(norm.dadi.length, 1);

  const van = conRandom([0.0, 0.95], () => tiraD20('vantaggio'));
  assert.equal(van.naturale, 20);
  assert.equal(van.dadi.length, 2);

  const svan = conRandom([0.0, 0.95], () => tiraD20('svantaggio'));
  assert.equal(svan.naturale, 1);
});

test('capacitaCarico: forza x 7.5, minimo 1', () => {
  assert.equal(capacitaCarico(15), 112.5);
  assert.equal(capacitaCarico(0), 75);      // 0 e' falsy -> fallback a 10 -> 75
  assert.equal(capacitaCarico(10), 75);
  assert.equal(capacitaCarico(-5), 1);      // negativo -> clamp a 1
});

// ========================= regole.js =========================

test('coloreClasse / chiaveClasse: match per sottostringa e lingua', () => {
  assert.equal(chiaveClasse('Mago'), 'mago');
  assert.equal(chiaveClasse('Wizard'), 'mago');            // inglese
  assert.equal(chiaveClasse('Guerriero (Campione)'), 'guerriero');
  assert.equal(chiaveClasse('paladino sacro'), 'paladino');
  assert.equal(coloreClasse('inesistente'), null);
  assert.equal(coloreClasse(''), null);
  assert.equal(coloreClasse(null), null);
});

test('slotDaClasseLivello: full caster (mago liv 5)', () => {
  const s = slotDaClasseLivello('Mago', 5);
  assert.equal(s[1].totale, 4);
  assert.equal(s[2].totale, 3);
  assert.equal(s[3].totale, 2);
  assert.equal(s[4].totale, 0);
  assert.equal(s[1].spesi, 0);
});

test('slotDaClasseLivello: mezzo caster (paladino liv 5)', () => {
  const s = slotDaClasseLivello('Paladino', 5);
  assert.equal(s[1].totale, 4);
  assert.equal(s[2].totale, 2);
  assert.equal(s[3].totale, 0);
});

test('slotDaClasseLivello: non incantatori -> null', () => {
  assert.equal(slotDaClasseLivello('Guerriero', 5), null);
  assert.equal(slotDaClasseLivello('Barbaro', 5), null);
  assert.equal(slotDaClasseLivello('Monaco', 5), null);
  assert.equal(slotDaClasseLivello('inesistente', 5), null);
});

test('slotDaClasseLivello: warlock magia del patto e arcanum mistico (liv 1, 5, 11, 20)', () => {
  const w1 = slotDaClasseLivello('Warlock', 1);
  assert.equal(w1[1].totale, 1);
  assert.equal(w1[2].totale, 0);

  const w5 = slotDaClasseLivello('Warlock', 5);
  assert.equal(w5[1].totale, 0);
  assert.equal(w5[2].totale, 0);
  assert.equal(w5[3].totale, 2);

  const w11 = slotDaClasseLivello('Warlock', 11);
  assert.equal(w11[5].totale, 3);
  assert.equal(w11[6].totale, 1); // Arcanum 6° liv

  const w20 = slotDaClasseLivello('Warlock', 20);
  assert.equal(w20[5].totale, 4); // 4 slot di 5° liv (ricarica riposo breve)
  assert.equal(w20[6].totale, 1); // Arcanum 6°
  assert.equal(w20[7].totale, 1); // Arcanum 7°
  assert.equal(w20[8].totale, 1); // Arcanum 8°
  assert.equal(w20[9].totale, 1); // Arcanum 9°
});

// ===================== Terzo incantatore (Cavaliere Mistico / Mistificatore Arcano) =====================

test('slotDaClasseLivello: guerriero/ladro SENZA la sottoclasse giusta restano non incantatori', () => {
  assert.equal(slotDaClasseLivello('Guerriero', 5, 'Campione'), null);
  assert.equal(slotDaClasseLivello('Ladro', 5, 'Assassino'), null);
  assert.equal(slotDaClasseLivello('Guerriero', 5), null); // nessuna sottoclasse indicata
});

test('slotDaClasseLivello: terzo incantatore, niente magia prima del 3° livello', () => {
  assert.equal(slotDaClasseLivello('Guerriero', 1, 'Cavaliere Mistico'), null);
  assert.equal(slotDaClasseLivello('Guerriero', 2, 'Cavaliere Mistico'), null);
  assert.equal(slotDaClasseLivello('Ladro', 2, 'Mistificatore Arcano'), null);
});

test('slotDaClasseLivello: terzo incantatore, progressione dal 3° al 19° livello', () => {
  const s3 = slotDaClasseLivello('Guerriero', 3, 'Cavaliere Mistico');
  assert.equal(s3[1].totale, 2);
  assert.equal(s3[2].totale, 0);
  const s7 = slotDaClasseLivello('Ladro', 7, 'Mistificatore Arcano');
  assert.equal(s7[1].totale, 4);
  assert.equal(s7[2].totale, 2);
  const s19 = slotDaClasseLivello('Guerriero', 19, 'Cavaliere Mistico');
  assert.deepEqual([s19[1].totale, s19[2].totale, s19[3].totale, s19[4].totale], [4, 3, 3, 1]);
});

test('trucchettiMax: terzo incantatore, 2/3 dal 3° livello, +1 dal 10°', () => {
  assert.equal(trucchettiMax('Guerriero', 2, 'Cavaliere Mistico'), null);
  assert.equal(trucchettiMax('Guerriero', 3, 'Cavaliere Mistico'), 2);
  assert.equal(trucchettiMax('Guerriero', 9, 'Cavaliere Mistico'), 2);
  assert.equal(trucchettiMax('Guerriero', 10, 'Cavaliere Mistico'), 3);
  assert.equal(trucchettiMax('Ladro', 3, 'Mistificatore Arcano'), 3);
  assert.equal(trucchettiMax('Ladro', 10, 'Mistificatore Arcano'), 4);
});

test('incantesimiMaxAuto: terzo incantatore segue la tabella "Spells Known" indipendentemente dalla versione', () => {
  const base = { classe: 'Guerriero', sottoclasse: 'Cavaliere Mistico' };
  assert.equal(incantesimiMaxAuto({ ...base, livello: 2 }, '2024'), null);
  assert.equal(incantesimiMaxAuto({ ...base, livello: 3 }, '2024'), 3);
  assert.equal(incantesimiMaxAuto({ ...base, livello: 3 }, '2014'), 3);
  assert.equal(incantesimiMaxAuto({ ...base, livello: 20 }, '2024'), 13);
  assert.equal(incantesimiMaxAuto({ classe: 'Ladro', sottoclasse: 'Mistificatore Arcano', livello: 13 }, '2024'), 9);
});

test('caratteristicaIncantatoreEffettiva: terzo incantatore usa Intelligenza solo con la sottoclasse giusta', () => {
  assert.equal(caratteristicaIncantatoreEffettiva({ classe: 'Guerriero', sottoclasse: 'Cavaliere Mistico' }), 'intelligenza');
  assert.equal(caratteristicaIncantatoreEffettiva({ classe: 'Ladro', sottoclasse: 'Mistificatore Arcano' }), 'intelligenza');
  assert.equal(caratteristicaIncantatoreEffettiva({ classe: 'Guerriero', sottoclasse: 'Campione' }), '');
  assert.equal(caratteristicaIncantatoreEffettiva({ classe: 'Ladro' }), '');
});

test('sottoclasseTerzoIncantatore: riconosce solo le due sottoclassi corrette', () => {
  assert.equal(sottoclasseTerzoIncantatore('Guerriero', 'Cavaliere Mistico'), 'guerriero');
  assert.equal(sottoclasseTerzoIncantatore('Ladro', 'Mistificatore Arcano'), 'ladro');
  assert.equal(sottoclasseTerzoIncantatore('Guerriero', 'Mistificatore Arcano'), null);
  assert.equal(sottoclasseTerzoIncantatore('Mago', 'Cavaliere Mistico'), null);
});

test('incantesimiTerzoCasterLivello: 5.0 limita alle due scuole, 5.5 apre tutta la lista del Mago', () => {
  const l1_2014 = incantesimiTerzoCasterLivello('Guerriero', 'Cavaliere Mistico', 1, '2014');
  assert.ok(l1_2014.length > 0);
  assert.ok(!l1_2014.includes('Sonno')); // Ammaliamento: non abiurazione/evocazione
  assert.ok(l1_2014.includes('Scudo')); // Abiurazione
  const l1_2024 = incantesimiTerzoCasterLivello('Guerriero', 'Cavaliere Mistico', 1, '2024');
  assert.ok(l1_2024.includes('Sonno')); // nella 5.5 nessuna restrizione di scuola
  // I trucchetti non hanno mai restrizione di scuola, nemmeno nella 5.0.
  const trucchetti_2014 = incantesimiTerzoCasterLivello('Guerriero', 'Cavaliere Mistico', 0, '2014');
  assert.deepEqual(trucchetti_2014, incantesimiTerzoCasterLivello('Guerriero', 'Cavaliere Mistico', 0, '2024'));
  // Ammaliamento/Illusione per il Mistificatore Arcano.
  const at_2014 = incantesimiTerzoCasterLivello('Ladro', 'Mistificatore Arcano', 1, '2014');
  assert.ok(at_2014.includes('Sonno')); // Ammaliamento
  assert.ok(!at_2014.includes('Scudo')); // Abiurazione: non ammaliamento/illusione
  // Nessuna sottoclasse -> nessun incantesimo.
  assert.deepEqual(incantesimiTerzoCasterLivello('Guerriero', 'Campione', 1, '2024'), []);
});

test('livelloIncantatoreCombinato: full pieno, mezzo dimezzato per difetto', () => {
  assert.equal(livelloIncantatoreCombinato([{ classe: 'Mago', livello: 5 }]), 5);
  assert.equal(livelloIncantatoreCombinato([{ classe: 'Paladino', livello: 5 }]), 2); // floor(5/2)
  assert.equal(livelloIncantatoreCombinato([
    { classe: 'Mago', livello: 3 }, { classe: 'Paladino', livello: 3 },
  ]), 3 + 1);
  assert.equal(livelloIncantatoreCombinato([{ classe: 'Guerriero', livello: 6 }]), 0);
});

test('slotMulticlasse: usa la tabella full sul livello combinato', () => {
  const s = slotMulticlasse([{ classe: 'Mago', livello: 3 }, { classe: 'Chierico', livello: 2 }]);
  // livello combinato 5 -> [4,3,2]
  assert.equal(s[1].totale, 4);
  assert.equal(s[2].totale, 3);
  assert.equal(s[3].totale, 2);
  assert.equal(slotMulticlasse([{ classe: 'Guerriero', livello: 4 }]), null);
});

test('asiAlLivello: guerriero ha ASI extra, default no', () => {
  assert.equal(asiAlLivello('Guerriero', 6), true);
  assert.equal(asiAlLivello('Mago', 6), false);
  assert.equal(asiAlLivello('Mago', 8), true);
  assert.equal(asiAlLivello('Ladro', 10), true);
});

test('privilegiClasseLivello: attacco furtivo del ladro ai livelli dispari', () => {
  const l1 = privilegiClasseLivello('Ladro', 1);
  assert.match(l1, /Attacco furtivo 1d6/);
  const l5 = privilegiClasseLivello('Ladro', 5);
  assert.match(l5, /Attacco furtivo 3d6/);
  // livello pari: nessun incremento di attacco furtivo
  const l4 = privilegiClasseLivello('Ladro', 4);
  assert.doesNotMatch(l4, /Attacco furtivo/);
});

test('creazione guidata: accumula privilegi fino al livello e rispetta la versione', () => {
  const barbaro2024 = privilegiClasseFinoA('Barbaro', 3, '2024');
  assert.match(barbaro2024, /Ira/);
  assert.match(barbaro2024, /Attacco irruento/);
  assert.match(barbaro2024, /Percezione del pericolo/);
  assert.match(barbaro2024, /Maestria/);
  const barbaro2014 = privilegiClasseFinoA('Barbaro', 3, '2014');
  assert.doesNotMatch(barbaro2014, /Maestria/);
});

test('creazione guidata: livelli sottoclasse distinti 2014/2024', () => {
  assert.equal(sottoclasseLivPer('2014').chierico[0], 1);
  assert.equal(sottoclasseLivPer('2024').chierico[0], 3);
  assert.equal(sottoclasseLivPer('2014').mago[0], 2);
  assert.equal(sottoclasseLivPer('2024').mago[0], 3);
});

test('trucchettiMax: numero per incantatori, null per non incantatori', () => {
  assert.equal(typeof trucchettiMax('Mago', 1), 'number');
  const t1 = trucchettiMax('Mago', 1);
  const t10 = trucchettiMax('Mago', 10);
  assert.ok(t10 >= t1); // non decresce col livello
  assert.equal(trucchettiMax('Guerriero', 5), null);
});

test('incantesimiMaxAuto: 2014 mago = mod + livello', () => {
  const scheda = {
    classe: 'Mago', livello: 3,
    incantatore: { caratteristica: 'intelligenza' },
    caratteristiche: { intelligenza: 16 }, // mod +3
  };
  assert.equal(incantesimiMaxAuto(scheda, '2014'), 6); // 3 + 3
  assert.equal(incantesimiMaxAuto({ classe: 'Guerriero', livello: 3 }, '2014'), null);
});

test('caratteristica da incantatore: la classe corregge un valore salvato errato', () => {
  assert.equal(caratteristicaIncantatoreEffettiva({ classe: 'Druido', incantatore: { caratteristica: 'carisma' } }), 'saggezza');
  assert.equal(caratteristicaIncantatoreEffettiva({ classe: 'Stregone', incantatore: { caratteristica: 'saggezza' } }), 'carisma');
  assert.equal(caratteristicaIncantatoreEffettiva({ classe: 'Guerriero', incantatore: { caratteristica: 'intelligenza' } }), 'intelligenza');
});

test('bonus di caratteristica dalla razza (2014): ogni voce punta a una specie reale', async () => {
  const { BONUS_CARATT_SPECIE_2014, SPECIE_DATI } = await import('../src/data/dati5e.js');
  const caratt = ['forza', 'destrezza', 'costituzione', 'intelligenza', 'saggezza', 'carisma'];
  for (const [specie, bonus] of Object.entries(BONUS_CARATT_SPECIE_2014)) {
    assert.ok(SPECIE_DATI[specie], `specie sconosciuta: ${specie}`);
    for (const [k, v] of Object.entries(bonus)) {
      if (k === 'sceltaExtra') { assert.ok(v >= 1 && v <= 2); continue; }
      assert.ok(caratt.includes(k), `caratteristica sconosciuta: ${k} (${specie})`);
      assert.ok(v === 1 || v === 2, `bonus fuori scala: ${k} +${v} (${specie})`);
    }
  }
  // Le classiche del Manuale del Giocatore 2014.
  assert.equal(BONUS_CARATT_SPECIE_2014.Nano.costituzione, 2);
  assert.equal(BONUS_CARATT_SPECIE_2014.Elfo.destrezza, 2);
  assert.equal(BONUS_CARATT_SPECIE_2014['Nano delle Montagne'].forza, 2);
  assert.equal(Object.keys(BONUS_CARATT_SPECIE_2014.Umano).length, 6);
});

test('ASI: livelli corretti per classe e conteggio fino a un livello dato', async () => {
  const { ASI_LIV } = await import('../src/data/dati5e.js');
  const fino = (liv, tab) => (tab || ASI_LIV._default).filter((l) => l <= liv).length;
  // Un Mago di 7° livello ha superato un solo ASI (il 4°): era il caso di Rowan.
  assert.equal(fino(7), 1);
  assert.equal(fino(3), 0);
  assert.equal(fino(8), 2);
  assert.equal(fino(20), 5);
  // Guerriero e Ladro ne hanno di più.
  assert.equal(fino(8, ASI_LIV.guerriero), 3); // 4, 6, 8
  assert.equal(fino(10, ASI_LIV.ladro), 3); // 4, 8, 10
});

test('creazione a livello alto: trucchetti e incantesimi coerenti con classe e slot', async () => {
  const { incantesimiInizialiPerLivello } = await import('../src/rules/regole.js');

  // Mago di 7° con Intelligenza 15: 4 trucchetti e 9 preparati (mod +2 + livello).
  const mago = incantesimiInizialiPerLivello('Mago', 7, '2014', { intelligenza: 15 });
  assert.equal(mago.trucchetti.length, 4);
  assert.equal(mago.incantesimi.length, 9);
  // La distribuzione segue gli slot 4/3/3/1: niente liste tutte di 1° livello.
  const perLivello = {};
  for (const i of mago.incantesimi) perLivello[i.livello] = (perLivello[i.livello] || 0) + 1;
  assert.deepEqual(perLivello, { 1: 3, 2: 3, 3: 2, 4: 1 });

  // Le voci arrivano complete, non solo col nome.
  const dardo = mago.trucchetti[0];
  assert.equal(dardo.livello, 0);
  assert.ok(dardo.nome);
  assert.ok(dardo.scuola, 'il trucchetto deve avere la scuola');
  assert.equal(dardo.preparato, true);

  // Il Paladino è un mezzo incantatore: nessun trucchetto, incantesimi sì.
  const pala = incantesimiInizialiPerLivello('Paladino', 9, '2014', { carisma: 14 });
  assert.equal(pala.trucchetti.length, 0);
  assert.equal(pala.incantesimi.length, 6); // mod +2 + metà livello (4)

  // Warlock di 20° livello: 4 trucchetti e 15 incantesimi noti (Pact Magic + Arcanum)
  const warlock20 = incantesimiInizialiPerLivello('Warlock', 20, '2024', { carisma: 20 });
  assert.equal(warlock20.trucchetti.length, 4);
  assert.equal(warlock20.incantesimi.length, 15);
  assert.ok(warlock20.incantesimi.some((i) => i.livello >= 5), 'Warlock di 20° deve avere incantesimi di livello alto');

  // Chi non lancia incantesimi non riceve nulla.
  assert.equal(incantesimiInizialiPerLivello('Guerriero', 10, '2024', { forza: 18 }), null);
});

test('catalogo preparabili: solo classi preparatrici, senza trucchetti e senza duplicati', async () => {
  const { classePreparaIncantesimi, catalogoIncantesimiPreparabili } = await import('../src/rules/regole.js');
  assert.equal(classePreparaIncantesimi('Mago'), true);
  assert.equal(classePreparaIncantesimi('Chierico'), true);
  assert.equal(classePreparaIncantesimi('Stregone'), false);
  assert.deepEqual(catalogoIncantesimiPreparabili('Stregone'), []);

  const catalogo = catalogoIncantesimiPreparabili('Mago');
  assert.ok(catalogo.length > 20);
  assert.ok(catalogo.every((s) => s.livello >= 1));
  assert.equal(new Set(catalogo.map((s) => `${s.livello}:${s.nome.toLowerCase()}`)).size, catalogo.length);
  assert.ok(catalogo.some((s) => s.nome === 'Dardo Incantato' && s.livello === 1));
});

test('classificaIncantesimoCombattimento: una cura non è un attacco', () => {
  // Bug reale: Cura Ferite/Cura Ferite di Massa finivano nella tabella
  // Combattimento con un bonus di attacco finto, perché usano il campo
  // "danno" anche per i dadi di guarigione.
  const cura = classificaIncantesimoCombattimento({ nome: 'Cura Ferite', danno: '2d8', tipoDanno: 'Guarigione' });
  assert.equal(cura.mostraInCombattimento, false);
  const curaMassa = classificaIncantesimoCombattimento({ nome: 'Cura Ferite di Massa', danno: '3d8', tipoDanno: 'Guarigione' });
  assert.equal(curaMassa.mostraInCombattimento, false);
});

test('classificaIncantesimoCombattimento: un incantesimo a tiro salvezza mostra la CD, non un bonus finto', () => {
  // Bug reale: Intralciare (TS Forza) veniva etichettato "Attacco Magico" con
  // un bonus di attacco, perché datiIncantesimo() non riporta la descrizione
  // e isTS non trovava mai "tiro salvezza" nel testo.
  const r = classificaIncantesimoCombattimento({ nome: 'Intralciare' });
  assert.equal(r.mostraInCombattimento, true);
  assert.equal(r.isTS, true);
});

test('classificaIncantesimoCombattimento: un vero attacco magico resta un attacco', () => {
  const r = classificaIncantesimoCombattimento({ nome: 'Frusta di Spine', danno: '1d6', tipoDanno: 'Perforante' });
  assert.equal(r.mostraInCombattimento, true);
  assert.equal(r.isTS, false);
});

// ========================= controlliScheda =========================

test('controlliScheda: scheda vuota o assente -> nessun controllo', () => {
  assert.deepEqual(controlliScheda(null), []);
  assert.deepEqual(controlliScheda({}), []);
});

test('controlliScheda: caso reale, Druido con competenze incomplete e sballate', () => {
  // Caso reale trovato in sessione: Druido/Elfo dei Boschi/Eremita a cui
  // mancavano Religione (background) e il TS di Intelligenza (classe),
  // aveva Atletica senza nessuna fonte possibile, e 7 abilità segnate contro
  // un budget di 5 (razza 1 + classe 2 + background 2).
  const scheda = {
    classe: 'Druido', specie: 'Elfo dei Boschi', background: 'Eremita',
    abilita: { addestrareAnimali: 1, arcano: 1, atletica: 1, intuizione: 1, medicina: 1, natura: 1, percezione: 1, sopravvivenza: 1 },
    tiriSalvezza: { saggezza: true },
  };
  const trovati = controlliScheda(scheda).map((r) => r.id).sort();
  assert.deepEqual(trovati, ['bg-religione', 'budget-abilita', 'fonte-atletica', 'ts-intelligenza'].sort());
});

test('controlliScheda: la stessa scheda corretta non genera controlli', () => {
  const scheda = {
    classe: 'Druido', specie: 'Elfo dei Boschi', background: 'Eremita',
    abilita: { addestrareAnimali: 1, natura: 1, medicina: 1, religione: 1, percezione: 1 },
    tiriSalvezza: { saggezza: true, intelligenza: true },
  };
  assert.deepEqual(controlliScheda(scheda), []);
});

test('controlliScheda: TS mancante segnalato solo per la classe principale (il multiclasse non ne aggiunge)', () => {
  const scheda = {
    classe: 'Guerriero', specie: '', background: '',
    multiclasse: [{ classe: 'Mago', livello: 3 }],
    abilita: {},
    tiriSalvezza: { forza: true, costituzione: true },
  };
  assert.deepEqual(controlliScheda(scheda).filter((r) => r.gravita === 'certo'), []);
});

test('controlliScheda: nessuna competenza segnata su una scheda vuota di classe -> nessun avviso "in più"', () => {
  const scheda = { classe: 'Ladro', specie: '', background: '', abilita: {}, tiriSalvezza: {} };
  const trovati = controlliScheda(scheda);
  assert.ok(!trovati.some((r) => r.id === 'budget-abilita'));
  assert.ok(!trovati.some((r) => r.id.startsWith('fonte-')));
});

test('riposo lungo: le risorse di classe tornano al massimo, non a zero', () => {
  const risorse = [
    { id: 'auto-ira', nome: 'Ira', attuali: 0, max: 3, reset: 'lungo' },
    { id: 'auto-punti-stregoneria', nome: 'Punti Stregoneria', attuali: 2, max: 10, reset: 'lungo' },
    { id: 'auto-punti-ki', nome: 'Punti Ki', attuali: 1, max: 5, reset: 'breve' },
  ];
  const dopo = risorseDopoRiposo(risorse, 'lungo');
  assert.equal(dopo[0].attuali, 3);
  assert.equal(dopo[1].attuali, 10);
  assert.equal(dopo[2].attuali, 5, 'il riposo lungo ricarica anche le risorse "brevi"');
});

test('riposo breve: ricarica solo le risorse che si recuperano col riposo breve', () => {
  const risorse = [
    { id: 'auto-ira', nome: 'Ira', attuali: 0, max: 3, reset: 'lungo' },
    { id: 'auto-punti-ki', nome: 'Punti Ki', attuali: 1, max: 5, reset: 'breve' },
  ];
  const dopo = risorseDopoRiposo(risorse, 'breve');
  assert.equal(dopo[0].attuali, 0, 'una risorsa "lunga" non si ricarica col riposo breve');
  assert.equal(dopo[1].attuali, 5);
});

test('riposo: le risorse senza reset (usi una tantum) restano intatte', () => {
  const risorse = [{ id: 'mia', nome: 'Pozione unica', attuali: 0, max: 1, reset: '' }];
  assert.deepEqual(risorseDopoRiposo(risorse, 'lungo'), risorse);
  assert.deepEqual(risorseDopoRiposo(undefined, 'lungo'), []);
});

// --- Fonte di Magia: conversione slot <-> Punti Stregoneria ---
const slotBase = () => ({ 1: { totale: 4, spesi: 2 }, 2: { totale: 3, spesi: 0 }, 3: { totale: 3, spesi: 3 } });

test('Fonte di Magia: i costi seguono la tabella 5e', () => {
  assert.deepEqual(COSTO_SLOT_IN_PUNTI, { 1: 2, 2: 3, 3: 5, 4: 6, 5: 7 });
});

test('punti -> slot: spende i punti e recupera uno slot speso', () => {
  const r = puntiVersoSlot(slotBase(), 6, 3);
  assert.equal(r.ok, true);
  assert.equal(r.punti, 1, '6 punti - 5 per uno slot di 3°');
  assert.equal(r.slotIncantesimo[3].spesi, 2, 'uno slot speso in meno');
  assert.equal(r.slotIncantesimo[3].totale, 3, 'il totale non cambia mai');
});

test('punti -> slot: rifiuta senza punti a sufficienza, senza slot spesi, o oltre il 5°', () => {
  assert.equal(puntiVersoSlot(slotBase(), 4, 3).ok, false, 'servono 5 punti');
  assert.equal(puntiVersoSlot(slotBase(), 9, 2).ok, false, 'slot di 2° tutti disponibili');
  assert.equal(puntiVersoSlot(slotBase(), 20, 6).ok, false, 'la Fonte di Magia arriva al 5°');
  assert.equal(puntiVersoSlot({ 1: { totale: 0, spesi: 0 } }, 9, 1).ok, false, 'nessuno slot di quel livello');
  for (const esito of [puntiVersoSlot(slotBase(), 4, 3), puntiVersoSlot(slotBase(), 20, 6)]) {
    assert.equal(typeof esito.motivo, 'string');
    assert.ok(esito.motivo.length > 0);
  }
});

test('slot -> punti: spende uno slot disponibile e dà punti pari al livello', () => {
  const r = slotVersoPunti(slotBase(), 1, 10, 2);
  assert.equal(r.ok, true);
  assert.equal(r.punti, 3, '1 + 2 (livello dello slot)');
  assert.equal(r.slotIncantesimo[2].spesi, 1);
});

test('slot -> punti: non supera il massimo e rifiuta se non ci sono slot liberi', () => {
  assert.equal(slotVersoPunti(slotBase(), 9, 10, 2).punti, 10, 'si ferma al massimo');
  assert.equal(slotVersoPunti(slotBase(), 10, 10, 2).ok, false, 'riserva già piena');
  assert.equal(slotVersoPunti(slotBase(), 0, 10, 3).ok, false, 'slot di 3° tutti spesi');
});

test('conversione: il giro completo è in perdita, non è una macchina per fare punti', () => {
  // Uno slot di 1° dà 1 punto, ma ricrearlo ne costa 2: il giro non si chiude.
  const a = slotVersoPunti(slotBase(), 0, 10, 1);
  assert.equal(a.ok, true);
  assert.equal(a.punti, 1);
  const b = puntiVersoSlot(a.slotIncantesimo, a.punti, 1);
  assert.equal(b.ok, false, 'con 1 solo punto non si ricompra lo slot appena bruciato');

  // Con punti a sufficienza il giro si chiude e i TOTALI restano intatti:
  // cambia solo quanti slot risultano spesi.
  const c = puntiVersoSlot(a.slotIncantesimo, 5, 1);
  assert.equal(c.ok, true);
  assert.deepEqual(c.slotIncantesimo[1], slotBase()[1], 'gli slot tornano come prima');
  assert.equal(c.punti, 3, '5 punti - 2 per lo slot di 1°');
});

// --- Effetti meccanici delle condizioni ---
test('condizioni: raggruppa gli effetti e dice quali condizioni li causano', () => {
  const righe = riepilogoCondizioni(['Avvelenato', 'Prono']);
  const svant = righe.find((r) => r.flag === 'svantaggioAttacchi');
  assert.deepEqual(svant.da, ['Avvelenato', 'Prono'], 'entrambe danno svantaggio ai tiri per colpire');
  const prove = righe.find((r) => r.flag === 'svantaggioProve');
  assert.deepEqual(prove.da, ['Avvelenato'], 'solo Avvelenato tocca le prove');
  const contro = righe.find((r) => r.flag === 'vantaggioControDiTe');
  assert.deepEqual(contro.da, ['Prono']);
});

test('condizioni: nessuna condizione (o nomi ignoti) non produce effetti', () => {
  assert.deepEqual(riepilogoCondizioni([]), []);
  assert.deepEqual(riepilogoCondizioni(undefined), []);
  assert.deepEqual(riepilogoCondizioni(['Innamorato', 'Bagnato']), []);
});

test('condizioni: Paralizzato accumula tutti i suoi effetti', () => {
  const flag = riepilogoCondizioni(['Paralizzato']).map((r) => r.flag);
  for (const atteso of ['incapacitato', 'vantaggioControDiTe', 'fallisciTsForzaDes', 'criticoRavvicinato']) {
    assert.ok(flag.includes(atteso), `manca ${atteso}`);
  }
});

test('condizioni: ogni condizione della scheda ha testo in entrambe le lingue', () => {
  for (const [nome, e] of Object.entries(EFFETTI_CONDIZIONI)) {
    assert.equal(typeof e.it, 'string', `${nome}: manca l'italiano`);
    assert.equal(typeof e.en, 'string', `${nome}: manca l'inglese`);
    assert.ok(e.it.length > 10 && e.en.length > 10, `${nome}: testo troppo corto`);
  }
  for (const [flag, e] of Object.entries(ETICHETTE_EFFETTI)) {
    assert.ok(e.it && e.en, `etichetta ${flag} incompleta`);
  }
});

test('condizioni: ogni voce dell\'elenco CONDIZIONI_5E ha i suoi effetti', () => {
  const senzaEffetti = CONDIZIONI_5E.filter((c) => !EFFETTI_CONDIZIONI[c]);
  assert.deepEqual(senzaEffetti, [], 'condizioni selezionabili ma senza spiegazione meccanica');
});

test('spiegazioni risorse e privilegi di classe: tutte le risorse hanno nuvoletta informativa', () => {
  const risorseVerifica = [
    'Ira', 'Ira Implacabile', 'Ispirazione Bardica', 'Ispirazione Superiore', 'Parole Taglienti',
    'Punti Ki', 'Punti Focus', 'Palmo Tremante', 'Integrità del Corpo',
    'Punti Stregoneria', 'Stregoneria Innata', 'Ripristino dell’Equilibrio',
    'Recupero Arcano', 'Portento',
    'Recuperare Energie', 'Azione Impetuosa', 'Indomito',
    'Forma Selvatica', 'Ausilio dalla Terra',
    'Incanalare Divinità', 'Intervento Divino',
    'Imposizione delle Mani', 'Senso del Divino',
    'Marchio del Cacciatore', 'Sensi Primordiali', 'Nemico Prescelto',
    'Colpo di Fortuna',
    'Contatto Mistico', 'Maestro Occulto', 'Slot del Patto',
  ];

  for (const r of risorseVerifica) {
    const sp = spiegaPrivilegio(r);
    assert.ok(sp, `Manca spiegazione/nuvoletta per la risorsa: ${r}`);
    assert.ok(typeof sp === 'string' && sp.length >= 20, `Spiegazione troppo breve per ${r}`);
  }
});

test('warlock: progressione e spiegazioni Invocazioni Occulte (Eldritch Invocations)', () => {
  // Progressione 2014
  assert.equal(maxInvocazioniWarlock(1, '2014'), 0);
  assert.equal(maxInvocazioniWarlock(2, '2014'), 2);
  assert.equal(maxInvocazioniWarlock(4, '2014'), 2);
  assert.equal(maxInvocazioniWarlock(5, '2014'), 3);
  assert.equal(maxInvocazioniWarlock(7, '2014'), 4);
  assert.equal(maxInvocazioniWarlock(9, '2014'), 5);
  assert.equal(maxInvocazioniWarlock(12, '2014'), 6);
  assert.equal(maxInvocazioniWarlock(15, '2014'), 7);
  assert.equal(maxInvocazioniWarlock(18, '2014'), 8);
  assert.equal(maxInvocazioniWarlock(20, '2014'), 8);

  // Progressione 2024
  assert.equal(maxInvocazioniWarlock(1, '2024'), 1);
  assert.equal(maxInvocazioniWarlock(2, '2024'), 2);
  assert.equal(maxInvocazioniWarlock(20, '2024'), 8);

  // Spiegazioni
  assert.ok(INVOCAZIONI_5E.length >= 20, 'elenco invocazioni nutrito');
  for (const inv of INVOCAZIONI_5E) {
    const sp = spiegaInvocazione(inv);
    assert.ok(sp, `Manca spiegazione per invocazione: ${inv}`);
    assert.ok(typeof sp === 'string' && sp.length >= 25, `Spiegazione troppo breve per invocazione: ${inv}`);
  }
});

test('artefice: progressione slot, incantesimi preparati e infusioni (Artificer Infusions)', () => {
  // Dado vita e caratteristiche
  const schedaArt = {
    classe: 'Artefice',
    livello: 5,
    caratteristiche: { intelligenza: 16 },
  };
  assert.equal(caratteristicaIncantatoreEffettiva(schedaArt), 'intelligenza');
  assert.equal(classePreparaIncantesimi('Artefice'), true);
  // Incantesimi preparati: lv/2 (2) + modInt (+3) = 5
  assert.equal(incantesimiMaxAuto(schedaArt), 5);
  assert.equal(trucchettiMax('Artefice', 1), 2);
  assert.equal(trucchettiMax('Artefice', 10), 3);
  assert.equal(trucchettiMax('Artefice', 14), 4);

  // Slot incantesimo (Half caster rounding UP)
  const slotLiv1 = slotDaClasseLivello('Artefice', 1);
  assert.equal(slotLiv1[1].totale, 2, 'Artefice al liv 1 ha 2 slot di 1°');
  const slotLiv5 = slotDaClasseLivello('Artefice', 5);
  assert.equal(slotLiv5[1].totale, 4, 'Artefice al liv 5 ha 4 slot di 1°');
  assert.equal(slotLiv5[2].totale, 2, 'Artefice al liv 5 ha 2 slot di 2°');

  // Infusioni note e attive
  assert.equal(maxInfusioniNote(1), 0);
  assert.equal(maxInfusioniNote(2), 4);
  assert.equal(maxInfusioniNote(6), 6);
  assert.equal(maxInfusioniNote(10), 8);
  assert.equal(maxInfusioniNote(14), 10);
  assert.equal(maxInfusioniNote(18), 12);

  assert.equal(maxOggettiInfusi(1), 0);
  assert.equal(maxOggettiInfusi(2), 2);
  assert.equal(maxOggettiInfusi(6), 3);
  assert.equal(maxOggettiInfusi(10), 4);
  assert.equal(maxOggettiInfusi(14), 5);
  assert.equal(maxOggettiInfusi(18), 6);

  // Spiegazioni infusioni
  assert.ok(INFUSIONI_ARTEFICE_5E.length >= 15, 'elenco infusioni nutrito');
  for (const inf of INFUSIONI_ARTEFICE_5E) {
    const sp = spiegaInfusione(inf);
    assert.ok(sp, `Manca spiegazione per infusione: ${inf}`);
    assert.ok(typeof sp === 'string' && sp.length >= 25, `Spiegazione troppo breve per infusione: ${inf}`);
  }
});

test('compagni e famigli: auto-scaling PF e parsing attacchi (Companion & Pet Tracker)', () => {
  const pgRanger = { classe: 'Ranger', livello: 6, caratteristiche: { intelligenza: 10, saggezza: 16 } };
  const bestiaTerra = { nome: 'Bestia della Terra', pfFormula: '5 + 5 × Livello Ranger', ca: 13 };
  assert.equal(calcolaPfCompagno(bestiaTerra, pgRanger), 35, '5 + 5 * 6 = 35 PF');

  const pgArtificiere = { classe: 'Artefice', livello: 4, caratteristiche: { intelligenza: 16 } };
  const omuncolo = { nome: 'Servitore Omuncolo', pfFormula: '1 + Mod INT + 5 × Livello Artificiere', ca: 13 };
  assert.equal(calcolaPfCompagno(omuncolo, pgArtificiere), 24, '1 + 3 + 5 * 4 = 24 PF');

  const difensoreAcciaio = { nome: 'Difensore d’Acciaio', pfFormula: '2 + Mod INT + 5 × Livello Artificiere', ca: 15 };
  assert.equal(calcolaPfCompagno(difensoreAcciaio, pgArtificiere), 25, '2 + 3 + 5 * 4 = 25 PF');

  // Creatura fissa
  const gufo = { nome: 'Gufo', pf: 1, pfFormula: '1d4 - 1' };
  assert.equal(calcolaPfCompagno(gufo, pgRanger), 1);

  // Parsing azioni
  const azioniTest = [
    'Morso: +4 al tiro per colpire, 1d4+2 danni perforanti.',
    'Pungiglione: +5 al tiro per colpire, 1d4+3 danni perforanti + 3d6 veleno.',
    'Colpo di Forza: tiro per colpire dell’Artificiere, 1d4 + bonus danni da forza.',
  ];
  const parsed = parseAzioniCompagno(azioniTest);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0].nome, 'Morso');
  assert.equal(parsed[0].bonusAttacco, 4);
  assert.equal(parsed[0].danno, '1d4+2');
  assert.equal(parsed[0].tipoDanno, 'perforanti');

  assert.equal(parsed[1].nome, 'Pungiglione');
  assert.equal(parsed[1].bonusAttacco, 5);
  assert.equal(parsed[1].danno, '1d4+3');
});

test('punti esperienza (XP Tracker): calcolo soglie, percentuali e level up', () => {
  assert.equal(PE_PER_LIVELLO[1], 0);
  assert.equal(PE_PER_LIVELLO[2], 300);
  assert.equal(PE_PER_LIVELLO[3], 900);
  assert.equal(PE_PER_LIVELLO[5], 6500);
  assert.equal(PE_PER_LIVELLO[20], 355000);

  // Livello 1 con 0 PE: 0% di 300
  const d0 = dettagliEsperienza(0, 1);
  assert.equal(d0.percentuale, 0);
  assert.equal(d0.puoSalire, false);
  assert.equal(d0.peMancanti, 300);
  assert.equal(d0.livelloTeorico, 1);

  // Livello 1 con 150 PE: 50%
  const d150 = dettagliEsperienza(150, 1);
  assert.equal(d150.percentuale, 50);
  assert.equal(d150.puoSalire, false);
  assert.equal(d150.peMancanti, 150);

  // Livello 1 con 300 PE: 100%, puoSalire = true
  const d300 = dettagliEsperienza(300, 1);
  assert.equal(d300.percentuale, 100);
  assert.equal(d300.puoSalire, true);
  assert.equal(d300.peMancanti, 0);
  assert.equal(d300.livelloTeorico, 2);

  // Livello 3 con 1800 PE (soglia liv 3 = 900, liv 4 = 2700, delta = 1800. Guadagnati = 900 -> 50%)
  const d1800 = dettagliEsperienza(1800, 3);
  assert.equal(d1800.percentuale, 50);
  assert.equal(d1800.puoSalire, false);
  assert.equal(d1800.peMancanti, 900);

  // Livello 20 (Max)
  const dMax = dettagliEsperienza(400000, 20);
  assert.equal(dMax.percentuale, 100);
  assert.equal(dMax.puoSalire, false);
  assert.equal(dMax.livelloTeorico, 20);
});

test('pozioni e consumabili (analizzaPozione): formule di cura e integrazione effetti 5e', () => {
  // 1. Guarigione
  assert.equal(analizzaPozione('Pozione di Guarigione').formula, '2d4+2');
  assert.equal(analizzaPozione('Potion of Healing').formula, '2d4+2');
  assert.equal(analizzaPozione('Pozione di Guarigione Maggiore').formula, '4d4+4');
  assert.equal(analizzaPozione('Potion of Greater Healing').formula, '4d4+4');
  assert.equal(analizzaPozione('Pozione di Guarigione Superiore').formula, '8d4+8');
  assert.equal(analizzaPozione('Potion of Superior Healing').formula, '8d4+8');
  assert.equal(analizzaPozione('Pozione di Guarigione Suprema').formula, '10d4+20');
  assert.equal(analizzaPozione('Potion of Supreme Healing').formula, '10d4+20');

  // 2. Buff e PF Temp
  const eroismo = analizzaPozione('Pozione di Eroismo');
  assert.equal(eroismo.tipo, 'buff');
  assert.equal(eroismo.pfTemp, 10);

  const invis = analizzaPozione('Pozione di Invisibilità');
  assert.equal(invis.tipo, 'buff');
  assert.deepEqual(invis.aggiungiCondizioni, ['Invisibile']);

  const giganteFuoco = analizzaPozione('Pozione della Forza del Gigante del Fuoco');
  assert.equal(giganteFuoco.forzaTarget, 25);

  const giganteTempesta = analizzaPozione('Potion of Storm Giant Strength');
  assert.equal(giganteTempesta.forzaTarget, 29);

  // 3. Rimozione condizioni e stati
  const elisir = analizzaPozione('Elisir di Salute');
  assert.equal(elisir.tipo, 'cura_stato');
  assert.ok(elisir.rimuoviCondizioni.includes('Avvelenato'));
  assert.ok(elisir.rimuoviCondizioni.includes('Paralizzato'));

  const antitossina = analizzaPozione('Antitossina');
  assert.ok(antitossina.rimuoviCondizioni.includes('Avvelenato'));

  const vitalita = analizzaPozione('Pozione di Vitalità');
  assert.equal(vitalita.rimuoviSfinimento, true);
});

test('calcolo movimento, salti e capacità fisiche 5e (calcolaMovimentoESalti)', () => {
  const pgGuerriero = {
    velocita: 9,
    caratteristiche: { forza: 16, destrezza: 14, costituzione: 14, intelligenza: 10, saggezza: 12, carisma: 8 },
    taglia: 'Media',
  };

  const m = calcolaMovimentoESalti(pgGuerriero);
  assert.equal(m.velBase, 9);
  assert.equal(m.scatto, 18);
  assert.equal(m.scalata, 4.5);
  assert.equal(m.nuoto, 4.5);
  assert.equal(m.strisciata, 4.5);

  // Salto in lungo (FOR 16 -> 16 * 0.3 = 4.8 m; da fermo = 2.4 m)
  assert.equal(m.saltoLungoRincorsa, 4.8);
  assert.equal(m.saltoLungoFermo, 2.4);

  // Salto in alto (Mod FOR +3 -> 3 + 3 = 6 ft -> 6 * 0.3 = 1.8 m; da fermo = 0.9 m)
  assert.equal(m.saltoAltoRincorsa, 1.8);
  assert.equal(m.saltoAltoFermo, 0.9);

  // Sollevamento e trascinamento (FOR 16 * 15 = 240 kg; FOR 16 * 30 = 480 kg)
  assert.equal(m.sollevamentoKg, 240);
  assert.equal(m.spintaKg, 480);
  assert.equal(m.haCorporaturaPossente, false);

  // Goliath / Corporatura Possente (raddoppia capacità)
  const pgGoliath = {
    velocita: 9,
    caratteristiche: { forza: 18 },
    razza: 'Goliath',
    taglia: 'Media',
  };
  const mg = calcolaMovimentoESalti(pgGoliath);
  assert.equal(mg.haCorporaturaPossente, true);
  assert.equal(mg.sollevamentoKg, 18 * 15 * 2); // 540 kg
  assert.equal(mg.spintaKg, 18 * 30 * 2); // 1080 kg
});






