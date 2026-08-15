// Suite di regole 5e — verifica i calcoli puri (dadi, modificatori, slot, incantesimi).
// Nessuna dipendenza esterna: gira con `node --test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  modificatore, conSegno, parseEspressioneDado, facceDadoVita, esprDadiVita,
  bonusCompetenzaDaLivello, tiraDanni, tiraD20, capacitaCarico,
} from '../src/rules/dadi.js';

import {
  coloreClasse, chiaveClasse, slotDaClasseLivello, livelloIncantatoreCombinato,
  slotMulticlasse, asiAlLivello, privilegiClasseLivello, privilegiClasseFinoA,
  sottoclasseLivPer, trucchettiMax, incantesimiMaxAuto,
} from '../src/rules/regole.js';

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
  assert.equal(slotDaClasseLivello('Warlock', 5), null); // patto gestito a parte
  assert.equal(slotDaClasseLivello('inesistente', 5), null);
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
