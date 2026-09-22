// Cataloghi e limiti di GS per Forma Bestiale e Metamorfosi. Gira con `node --test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BESTIE, bestieDisponibili, limitiFormaSelvatica, limitiMetamorfosi, creatureDisponibiliMetamorfosi } from '../src/data/bestiario.js';

test('BESTIE: nessun duplicato, ogni voce ha le sei caratteristiche e i campi base', () => {
  const nomi = new Set();
  for (const b of BESTIE) {
    assert.ok(!nomi.has(b.nome), `Nome duplicato nel catalogo: ${b.nome}`);
    nomi.add(b.nome);
    for (const car of ['forza', 'destrezza', 'costituzione', 'intelligenza', 'saggezza', 'carisma']) {
      assert.equal(typeof b.car[car], 'number', `${b.nome}: manca ${car}`);
    }
    assert.equal(typeof b.ca, 'number');
    assert.equal(typeof b.pf, 'number');
    assert.equal(typeof b.gsNum, 'number');
    assert.ok(b.velocita && typeof b.velocita.terra === 'number');
  }
});

test('bestieDisponibili: ordina dal GS più basso al più alto', () => {
  const disp = bestieDisponibili(20, 'Circolo della Luna');
  for (let i = 1; i < disp.length; i++) {
    assert.ok(disp[i].gsNum >= disp[i - 1].gsNum, `Ordine errato tra ${disp[i - 1].nome} e ${disp[i].nome}`);
  }
});

test('limitiMetamorfosi: GS massimo pari al livello del personaggio, senza limiti di nuoto/volo', () => {
  assert.equal(limitiMetamorfosi(1).gsMax, 1);
  assert.equal(limitiMetamorfosi(7).gsMax, 7);
  assert.equal(limitiMetamorfosi(20).gsMax, 20);
  assert.equal('nuoto' in limitiMetamorfosi(5), false);
  assert.equal('volo' in limitiMetamorfosi(5), false);
});

test('creatureDisponibiliMetamorfosi: include creature GS più alto della tabella Forma Selvatica (Gorilla Gigante, Tirannosauro)', () => {
  const liv7 = creatureDisponibiliMetamorfosi(7);
  assert.ok(liv7.some((c) => c.nome === 'Gorilla gigante'), 'Gorilla gigante dovrebbe comparire al livello 7');
  assert.ok(!liv7.some((c) => c.nome === 'Tirannosauro rex'), 'Tirannosauro rex (GS 8) non dovrebbe comparire al livello 7');

  const liv8 = creatureDisponibiliMetamorfosi(8);
  assert.ok(liv8.some((c) => c.nome === 'Tirannosauro rex'));

  // Ordine crescente per GS.
  for (let i = 1; i < liv8.length; i++) {
    assert.ok(liv8[i].gsNum >= liv8[i - 1].gsNum);
  }

  // Nessun filtro di nuoto/volo: creature acquatiche/volanti disponibili anche a basso livello.
  const liv1 = creatureDisponibiliMetamorfosi(1);
  assert.ok(liv1.some((c) => c.velocita.volo), 'Al livello 1 dovrebbe essere disponibile almeno una creatura volante GS ≤ 1 (es. Gufo, Falco)');
});

test('Gorilla gigante e Tirannosauro rex hanno un blocco statistiche completo', () => {
  const gorilla = BESTIE.find((b) => b.nome === 'Gorilla gigante');
  assert.ok(gorilla);
  assert.equal(gorilla.gsNum, 7);
  assert.equal(gorilla.car.intelligenza, 7);

  const trex = BESTIE.find((b) => b.nome === 'Tirannosauro rex');
  assert.ok(trex);
  assert.equal(trex.gsNum, 8);
  assert.equal(trex.taglia, 'Enorme');
});
