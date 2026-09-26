// Personaggi forniti con il repo (src/data/esempi.js): statistiche, attacchi,
// incantesimi e tratti coerenti con le regole della loro edizione.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { FLYORA_JSON, ESEMPIO_GNOMO, VAELION_JSON, ELEVORN_JSON, WENDELL_JSON, LYRIAN_JSON } from '../src/data/esempi.js';
import { punteggioCaratteristica, caTotale } from '../src/rules/scheda.js';
import { slotDaClasseLivello, incantesimiMaxAuto, trucchettiMax } from '../src/rules/regole.js';
import { datiIncantesimo } from '../src/data/incantesimi.js';
import { SPECIE_DATI, SPECIE_DATI_2014 } from '../src/data/dati5e.js';

const mod = (v) => Math.floor((v - 10) / 2);
const livelliSpell = (pg) => (pg.incantesimiLista || []).filter((i) => i.livello >= 1 && !i.bonus);
const trucchetti = (pg) => (pg.incantesimiLista || []).filter((i) => i.livello === 0 && !i.bonus);
const slotTot = (pg) => Object.fromEntries(Object.entries(pg.slotIncantesimo).filter(([, v]) => v.totale).map(([k, v]) => [String(k), v.totale]));
const slotAttesi = (t) => Object.fromEntries(Object.entries(t).filter(([, v]) => (v?.totale ?? v) > 0).map(([k, v]) => [String(k), v?.totale ?? v]));

test('edizione esplicita per ogni personaggio d\'esempio', () => {
  assert.equal(FLYORA_JSON.versione, '2024');
  for (const pg of [ESEMPIO_GNOMO, VAELION_JSON, ELEVORN_JSON, WENDELL_JSON, LYRIAN_JSON]) assert.equal(pg.versione, '2014', pg.nome);
});

test('Vaelion (5.0): attacchi di Forza con i Guanti (FOR 19), Morsa del Gelo 2d6, preparati = SAG + livello', () => {
  assert.equal(punteggioCaratteristica(VAELION_JSON, 'forza'), 19);
  const att = Object.fromEntries(VAELION_JSON.attacchi.map((a) => [a.nome, a]));
  const forza = mod(19) + 4;
  assert.equal(att.Randello.bonus, forza);
  assert.equal(att.Randello.danno, '1d4+4');
  assert.equal(att['Bastone Ferrato'].bonus, forza);
  assert.equal(att['Randello Incantato'].bonus, 4 + mod(20));
  assert.equal(att['Morsa del Gelo'].danno, '2d6');
  assert.equal(livelliSpell(VAELION_JSON).length, mod(20) + 10);
  assert.equal(trucchetti(VAELION_JSON).length, 4);
  assert.deepEqual(slotTot(VAELION_JSON), slotAttesi(slotDaClasseLivello('Druido', 10)));
  assert.equal(caTotale(VAELION_JSON), 19);
  assert.match(VAELION_JSON.addestramento.armi, /randelli/);
});

test('Wendell (5.0): arco corto 1d6, 9 incantesimi conosciuti e 3 trucchetti al 6°', () => {
  assert.equal(WENDELL_JSON.attacchi[0].danno, '1d6+3');
  assert.equal(livelliSpell(WENDELL_JSON).length, incantesimiMaxAuto(WENDELL_JSON, '2014'));
  assert.equal(trucchetti(WENDELL_JSON).length, trucchettiMax('Bardo', 6));
  assert.deepEqual(slotTot(WENDELL_JSON), slotAttesi(slotDaClasseLivello('Bardo', 6)));
  // Manto di Ispirazione spende un uso di Ispirazione Bardica: niente contatore separato.
  assert.ok(!WENDELL_JSON.risorse.some((r) => /manto di ispirazione/i.test(r.nome)));
});

test('Flyora (5.5): tratti dell\'Elfo 2024, nessuna competenza con la spada corta, 7 incantesimi preparati al 4°', () => {
  assert.doesNotMatch(FLYORA_JSON.trattiSpecie, /Addestramento nelle Armi Elfiche|Trucchetto da Mago/);
  assert.match(FLYORA_JSON.trattiSpecie, /Lignaggio Elfico/);
  const spada = FLYORA_JSON.attacchi.find((a) => /spada/i.test(a.nome));
  assert.equal(spada.bonus, mod(15)); // niente competenza
  assert.equal(livelliSpell(FLYORA_JSON).length, 7);
  assert.deepEqual(slotTot(FLYORA_JSON), slotAttesi(slotDaClasseLivello('Stregone', 4)));
});

test('Lyrian (5.0): incantesimi del Warlock/Lama Iettatrice, giavellotto con la Forza', () => {
  const colpo = LYRIAN_JSON.incantesimiLista.find((i) => i.livello === 1 && i.nome !== 'Scudo');
  assert.equal(colpo.nome, 'Colpo Irato'); // Wrathful Smite: lista estesa della Lama Iettatrice
  assert.ok(datiIncantesimo(colpo.nome));
  const giav = LYRIAN_JSON.attacchi.find((a) => /giavellotto/i.test(a.nome));
  assert.equal(giav.bonus, mod(10) + 3);
});

test('Boddynock (5.0): +1 della Bacchetta della Guerra Magica ai tiri con incantesimo', () => {
  assert.equal(ESEMPIO_GNOMO.attacchi[0].bonus, mod(20) + 4 + 1);
  assert.deepEqual(slotTot(ESEMPIO_GNOMO), slotAttesi(slotDaClasseLivello('Mago', 10)));
});

test('Elevorn (5.0): privilegi di Ranger 6 / Ladro 3 completi', () => {
  for (const p of ['Lancio di Incantesimi', 'Attacco Extra', 'Maestria', 'Attacco Furtivo']) assert.match(ELEVORN_JSON.privilegi, new RegExp(p));
});

test('specie: velocità 5.0 di nani, gnomi e halfling (7,5 m)', () => {
  for (const k of ['Nano', 'Gnomo', 'Halfling', 'Gnomo delle Rocce']) assert.equal(SPECIE_DATI_2014[k].velocita, 7.5, k);
  assert.equal(SPECIE_DATI['Halfling Piedelesto'].velocita, 7.5);
  assert.equal(SPECIE_DATI.Halfling.velocita, 9);
  assert.doesNotMatch(SPECIE_DATI['Elfo Alto'].tratti, /Addestramento nelle Armi Elfiche/);
  assert.match(SPECIE_DATI_2014['Elfo Alto'].tratti, /Addestramento nelle Armi Elfiche/);
});
