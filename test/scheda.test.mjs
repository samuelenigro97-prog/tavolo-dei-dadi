// Calcoli derivati dalla scheda: CA da equipaggiamento, competenza armature,
// bonus abilità e tiri salvezza. Gira con `node --test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { caTotale, competenteInArmatura, bonusAbilita, bonusTiroSalvezza, punteggioCaratteristica, formattaNomePg } from '../src/rules/scheda.js';
import { ABILITA, CARATTERISTICHE } from '../src/data/caratteristiche.js';

// Scheda minima di prova: DES 16 (+3), FOR 8 (-1), bonus competenza +3.
function schedaBase(patch = {}) {
  return {
    caratteristiche: { forza: 8, destrezza: 16, costituzione: 14, intelligenza: 12, saggezza: 10, carisma: 18 },
    bonusCompetenza: 3,
    abilita: {},
    tiriSalvezza: {},
    addestramento: { armature: {} },
    armatura: { tipo: 'nessuna' },
    ca: 0,
    ...patch,
  };
}

// ========================= CA =========================

test('caTotale: senza armatura = 10 + DES', () => {
  assert.equal(caTotale(schedaBase()), 13); // 10 + 3
});

test('caTotale: armatura leggera = base + DES intero', () => {
  const s = schedaBase({ armatura: { tipo: 'leggera', base: 12 } });
  assert.equal(caTotale(s), 15); // 12 + 3
});

test('caTotale: armatura media = base + DES limitato a +2', () => {
  const s = schedaBase({ armatura: { tipo: 'media', base: 14 } });
  assert.equal(caTotale(s), 16); // 14 + min(3,2)
});

test('caTotale: armatura media con DES bassa usa la DES reale', () => {
  const s = schedaBase({ caratteristiche: { ...schedaBase().caratteristiche, destrezza: 12 }, armatura: { tipo: 'media', base: 14 } });
  assert.equal(caTotale(s), 15); // 14 + min(1,2)
});

test('caTotale: armatura pesante ignora la DES', () => {
  const s = schedaBase({ armatura: { tipo: 'pesante', base: 18 } });
  assert.equal(caTotale(s), 18);
});

test('caTotale: scudo +2 e bonus magico si sommano', () => {
  const s = schedaBase({ armatura: { tipo: 'pesante', base: 18, scudo: true, bonus: 1 } });
  assert.equal(caTotale(s), 21); // 18 + 2 + 1
});

test('caTotale: modalità manuale usa il valore scritto a mano', () => {
  const s = schedaBase({ armatura: { tipo: 'manuale' }, ca: 17 });
  assert.equal(caTotale(s), 17);
});

test('caTotale: manuale + scudo somma comunque lo scudo', () => {
  const s = schedaBase({ armatura: { tipo: 'manuale', scudo: true }, ca: 15 });
  assert.equal(caTotale(s), 17);
});

// ========================= Competenza armature =========================

test('competenteInArmatura: manuale e nessuna sempre concesse', () => {
  const s = schedaBase();
  assert.equal(competenteInArmatura(s, 'manuale'), true);
  assert.equal(competenteInArmatura(s, 'nessuna'), true);
});

test('competenteInArmatura: leggera/media/pesante seguono l addestramento', () => {
  const s = schedaBase({ addestramento: { armature: { leggera: true } } });
  assert.equal(competenteInArmatura(s, 'leggera'), true);
  assert.equal(competenteInArmatura(s, 'media'), false);
  assert.equal(competenteInArmatura(s, 'pesante'), false);
});

test('competenteInArmatura: scheda senza addestramento non esplode', () => {
  const s = schedaBase({ addestramento: undefined });
  assert.equal(competenteInArmatura(s, 'pesante'), false);
});

// ========================= Abilità =========================

test('bonusAbilita: non competente = solo modificatore', () => {
  // Furtività dipende da Destrezza (+3)
  assert.equal(bonusAbilita(schedaBase(), 'furtivita'), 3);
});

test('bonusAbilita: competente aggiunge il bonus di competenza', () => {
  const s = schedaBase({ abilita: { furtivita: 1 } });
  assert.equal(bonusAbilita(s, 'furtivita'), 6); // 3 + 3
});

test('bonusAbilita: livello 2 (competenza di classe) vale come ×1', () => {
  const s = schedaBase({ abilita: { furtivita: 2 } });
  assert.equal(bonusAbilita(s, 'furtivita'), 6);
});

test('bonusAbilita: livello 3 (Maestria/Expertise) raddoppia la competenza', () => {
  // Ladro/Bardo: doppia competenza sulle abilità già competenti.
  const s = schedaBase({ abilita: { furtivita: 3 } });
  assert.equal(bonusAbilita(s, 'furtivita'), 9); // 3 (mod) + 2×3 (competenza raddoppiata)
});

test('bonusAbilita: abilità inesistente = 0', () => {
  assert.equal(bonusAbilita(schedaBase(), 'nonEsiste'), 0);
});

test('bonusAbilita: ogni abilità nota si calcola senza errori', () => {
  const s = schedaBase();
  for (const a of ABILITA) {
    const v = bonusAbilita(s, a.key);
    assert.equal(Number.isFinite(v), true, `abilità ${a.key} non numerica`);
  }
});

// ========================= Tiri salvezza =========================

test('bonusTiroSalvezza: senza competenza = solo modificatore', () => {
  assert.equal(bonusTiroSalvezza(schedaBase(), 'destrezza'), 3);
  assert.equal(bonusTiroSalvezza(schedaBase(), 'forza'), -1);
});

test('bonusTiroSalvezza: con competenza aggiunge il bonus', () => {
  const s = schedaBase({ tiriSalvezza: { destrezza: true } });
  assert.equal(bonusTiroSalvezza(s, 'destrezza'), 6);
});

test('oggetti: Mantello della Protezione aggiunge 1 a CA e TS solo se indossato e sintonizzato', () => {
  const mantello = { nome: 'Mantello della Protezione', equip: true, richiedeSintonia: true, effettoMeccanico: 'classe_armatura_tiri_salvezza_1' };
  const nonSintonizzato = schedaBase({ inventario: [mantello] });
  assert.equal(caTotale(nonSintonizzato), 13);
  assert.equal(bonusTiroSalvezza(nonSintonizzato, 'destrezza'), 3);
  const attivo = { ...nonSintonizzato, sintonia: ['Mantello della Protezione'] };
  assert.equal(caTotale(attivo), 14);
  assert.equal(bonusTiroSalvezza(attivo, 'destrezza'), 4);
});

test('oggetti: Guanti del Potere Orchesco impostano Forza a 19 senza abbassare valori superiori', () => {
  const guanti = { nome: 'Guanti del Potere Orchesco', equip: true, richiedeSintonia: true, effettoMeccanico: 'forza_impostata_19' };
  const attivo = schedaBase({ inventario: [guanti], sintonia: ['Guanti del Potere Orchesco'] });
  assert.equal(punteggioCaratteristica(attivo, 'forza'), 19);
  assert.equal(bonusTiroSalvezza(attivo, 'forza'), 4);
  assert.equal(punteggioCaratteristica({ ...attivo, caratteristiche: { ...attivo.caratteristiche, forza: 20 } }, 'forza'), 20);
});

// ========================= Coerenza tabelle =========================

test('tabelle: 6 caratteristiche e 18 abilità, tutte collegate correttamente', () => {
  assert.equal(CARATTERISTICHE.length, 6);
  assert.equal(ABILITA.length, 18);
  const chiavi = new Set(CARATTERISTICHE.map((c) => c.key));
  for (const a of ABILITA) {
    assert.equal(chiavi.has(a.car), true, `abilità ${a.key} punta a caratteristica sconosciuta: ${a.car}`);
  }
  // nessuna chiave duplicata
  assert.equal(new Set(ABILITA.map((a) => a.key)).size, 18);
});

test('formattaNomePg: forza maiuscole all inizio di ogni parola e token', () => {
  assert.equal(formattaNomePg('kairon'), 'Kairon');
  assert.equal(formattaNomePg('mago varis'), 'Mago Varis');
  assert.equal(formattaNomePg('vaelion (val) leafwhisper'), 'Vaelion (Val) Leafwhisper');
  assert.equal(formattaNomePg('frost'), 'Frost');
  assert.equal(formattaNomePg('Elevorn DeVille'), 'Elevorn DeVille');
  assert.equal(formattaNomePg('flyora delle acque nere'), 'Flyora Delle Acque Nere');
  assert.equal(formattaNomePg(''), '');
  assert.equal(formattaNomePg(null), '');
});

// ========================= Vaelion Leafwhisper =========================

test('Vaelion: CA con Corazza Legnoferro (media 14) + DES 15 (+2) + Mantello (+1) = 17', () => {
  const vaelion = {
    nome: 'Vaelion (Val) Leafwhisper',
    classe: 'Druido',
    sottoclasse: 'Circolo del Pastore',
    livello: 10,
    bonusCompetenza: 4,
    caratteristiche: { forza: 4, destrezza: 15, costituzione: 14, intelligenza: 10, saggezza: 20, carisma: 12 },
    armatura: { nome: 'Corazza a Piastre in Legnoferro', tipo: 'media', base: 14, scudo: false, bonus: 0 },
    tiriSalvezza: { forza: false, destrezza: false, costituzione: false, intelligenza: true, saggezza: true, carisma: false },
    inventario: [
      { id: 'inv-1', nome: 'Corazza a Piastre in Legnoferro', equip: true, categoria: 'Armatura' },
      { id: 'inv-2', nome: 'Mantello della Protezione', equip: true, effettoMeccanico: 'classe_armatura_tiri_salvezza_1', richiedeSintonia: true },
      { id: 'inv-3', nome: 'Guanti del Potere Orchesco', equip: true, effettoMeccanico: 'forza_impostata_19', richiedeSintonia: true },
    ],
    sintonia: ['Mantello della Protezione', 'Guanti del Potere Orchesco'],
    addestramento: { armature: { leggera: true, media: true, pesante: false, scudi: true } },
    abilita: { medicina: 1, natura: 2, percezione: 2, religione: 1, addestrareAnimali: 2 },
  };

  assert.equal(caTotale(vaelion), 17); // 14 + min(2,2) + 1 mantello
  assert.equal(bonusTiroSalvezza(vaelion, 'saggezza'), 10); // +5 SAG + 4 comp + 1 mantello
  assert.equal(punteggioCaratteristica(vaelion, 'forza'), 19); // 19 da guanti
  assert.equal(bonusAbilita(vaelion, 'percezione'), 9); // +5 SAG + 4 comp
  assert.equal(competenteInArmatura(vaelion, 'media'), true);
});

