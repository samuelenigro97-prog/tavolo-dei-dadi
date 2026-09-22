// Effetti meccanici del livello di Sfinimento (0–6): flat -2/velocità nel 2024,
// soglie condizionali (svantaggio, velocità dimezzata/zero, PF dimezzati) nel 2014.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { effettiSfinimento, pfMassimiEffettivi } from '../src/rules/scheda.js';
import { calcolaMovimentoESalti } from '../src/rules/regole.js';
import { modalitaEffettiva } from '../src/rules/dadi.js';

function scheda(overrides = {}) {
  return {
    versione: '2014',
    sfinimento: 0,
    velocita: 9,
    pfMax: 40,
    caratteristiche: { forza: 10 },
    taglia: 'Media',
    ...overrides,
  };
}

test('effettiSfinimento: 2024 è una penalità piatta per livello, nessuna soglia condizionale', () => {
  const eff = effettiSfinimento(scheda({ versione: '2024', sfinimento: 3 }));
  assert.equal(eff.penalitaD20, 6);
  assert.equal(eff.penalitaVelocita, 4.5);
  assert.equal(eff.svantaggioProve, false);
  assert.equal(eff.svantaggioAttacchiSalvezza, false);
  assert.equal(eff.pfDimezzati, false);
  assert.equal(eff.morto, false);
});

test('effettiSfinimento: 2014 è cumulativo per soglie (1 prove, 3 attacchi/salvezze, 4 PF, 5 velocità 0)', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4, 5, 6].map((liv) => {
      const eff = effettiSfinimento(scheda({ sfinimento: liv }));
      return {
        svantaggioProve: eff.svantaggioProve,
        svantaggioAttacchiSalvezza: eff.svantaggioAttacchiSalvezza,
        velocitaDimezzata: eff.velocitaDimezzata,
        velocitaZero: eff.velocitaZero,
        pfDimezzati: eff.pfDimezzati,
        morto: eff.morto,
      };
    }),
    [
      { svantaggioProve: false, svantaggioAttacchiSalvezza: false, velocitaDimezzata: false, velocitaZero: false, pfDimezzati: false, morto: false },
      { svantaggioProve: true, svantaggioAttacchiSalvezza: false, velocitaDimezzata: false, velocitaZero: false, pfDimezzati: false, morto: false },
      { svantaggioProve: true, svantaggioAttacchiSalvezza: false, velocitaDimezzata: true, velocitaZero: false, pfDimezzati: false, morto: false },
      { svantaggioProve: true, svantaggioAttacchiSalvezza: true, velocitaDimezzata: true, velocitaZero: false, pfDimezzati: false, morto: false },
      { svantaggioProve: true, svantaggioAttacchiSalvezza: true, velocitaDimezzata: true, velocitaZero: false, pfDimezzati: true, morto: false },
      { svantaggioProve: true, svantaggioAttacchiSalvezza: true, velocitaDimezzata: false, velocitaZero: true, pfDimezzati: true, morto: false },
      { svantaggioProve: true, svantaggioAttacchiSalvezza: true, velocitaDimezzata: false, velocitaZero: true, pfDimezzati: true, morto: true },
    ],
  );
});

test('effettiSfinimento: il livello è sempre bloccato tra 0 e 6', () => {
  assert.equal(effettiSfinimento(scheda({ sfinimento: -3 })).livello, 0);
  assert.equal(effettiSfinimento(scheda({ sfinimento: 99 })).livello, 6);
});

test('pfMassimiEffettivi: dimezza i PF massimi solo dal livello 4 in su nel 2014', () => {
  assert.equal(pfMassimiEffettivi(scheda({ pfMax: 40, sfinimento: 3 })), 40);
  assert.equal(pfMassimiEffettivi(scheda({ pfMax: 40, sfinimento: 4 })), 20);
  assert.equal(pfMassimiEffettivi(scheda({ pfMax: 41, sfinimento: 4 })), 20); // floor(41/2)
});

test('pfMassimiEffettivi: nel 2024 i PF massimi non vengono mai dimezzati dallo Sfinimento', () => {
  assert.equal(pfMassimiEffettivi(scheda({ versione: '2024', pfMax: 40, sfinimento: 6 })), 40);
});

test('calcolaMovimentoESalti: 2014 dimezza la velocità dal livello 2, la azzera dal livello 5', () => {
  assert.equal(calcolaMovimentoESalti(scheda({ velocita: 9, sfinimento: 0 })).velBase, 9);
  assert.equal(calcolaMovimentoESalti(scheda({ velocita: 9, sfinimento: 1 })).velBase, 9);
  assert.equal(calcolaMovimentoESalti(scheda({ velocita: 9, sfinimento: 2 })).velBase, 4.5);
  assert.equal(calcolaMovimentoESalti(scheda({ velocita: 9, sfinimento: 5 })).velBase, 0);
});

test('calcolaMovimentoESalti: 2024 riduce la velocità di 1,5m per livello', () => {
  assert.equal(calcolaMovimentoESalti(scheda({ versione: '2024', velocita: 9, sfinimento: 2 })).velBase, 6);
  assert.equal(calcolaMovimentoESalti(scheda({ versione: '2024', velocita: 9, sfinimento: 6 })).velBase, 0); // 9 - 9 = 0, mai negativa
});

test('modalitaEffettiva: uno svantaggio forzato vince sul normale ma si annulla con un vantaggio manuale', () => {
  assert.equal(modalitaEffettiva('normale', false), 'normale');
  assert.equal(modalitaEffettiva('normale', true), 'svantaggio');
  assert.equal(modalitaEffettiva('svantaggio', true), 'svantaggio');
  assert.equal(modalitaEffettiva('vantaggio', true), 'normale'); // vantaggio + svantaggio = normale (regola 5e)
  assert.equal(modalitaEffettiva('vantaggio', false), 'vantaggio');
});
