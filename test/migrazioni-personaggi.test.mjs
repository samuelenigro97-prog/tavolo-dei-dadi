// Verifica che le migrazioni dei personaggi predefiniti (estratte da
// App.jsx in src/data/migrazioniPersonaggi.js) si comportino esattamente
// come prima dell'estrazione: nessuna modifica di comportamento, solo di
// collocazione del codice. Copre anche il caso limite che ha dato lo
// spunto per l'estrazione — un personaggio semplicemente chiamato come
// uno dei cinque predefiniti riceve comunque le stesse correzioni.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  fixEquipaggiamentoVaelion,
  migrazioneRegoleVaelion,
  autoIdratazionePersonaggioPredefinito,
} from '../src/data/migrazioniPersonaggi.js';

function personaggioBase(overrides = {}) {
  return {
    nome: 'Vaelion',
    classe: 'Druido',
    versione: '2024',
    sottoclasse: 'Circolo della Luna',
    inventario: [],
    risorse: [],
    incantesimiLista: [],
    maxTrucchetti: 5,
    ...overrides,
  };
}

test('fixEquipaggiamentoVaelion: equipaggia e imposta la sintonia per Mantello/Perla/Guanti', () => {
  const s = personaggioBase({
    inventario: [
      { nome: 'Mantello della Protezione' },
      { nome: 'Guanti del Potere' },
      { nome: 'Perla del Potere' },
    ],
  });
  const roster = { personaggi: { pg1: s } };
  fixEquipaggiamentoVaelion(roster);

  assert.equal(s.inventario[0].equip, true);
  assert.equal(s.inventario[0].effettoMeccanico, 'classe_armatura_tiri_salvezza_1');
  assert.equal(s.inventario[1].nome, 'Guanti della Forza Orchesca'); // rinominati
  assert.equal(s.inventario[1].effettoMeccanico, 'forza_impostata_19');
  assert.equal(s.inventario[2].equip, true);
  assert.deepEqual(s.sintonia, ['Mantello della Protezione', 'Perla del Potere', 'Guanti della Forza Orchesca']);
});

test('fixEquipaggiamentoVaelion: non tocca personaggi con un altro nome', () => {
  const s = personaggioBase({ nome: 'Flyora', inventario: [{ nome: 'Mantello della Protezione' }] });
  const roster = { personaggi: { pg1: s } };
  fixEquipaggiamentoVaelion(roster);
  assert.equal(s.inventario[0].equip, undefined);
});

test('migrazioneRegoleVaelion: forza 2014 e Circolo del Pastore, aggiunge Totem Spirituale', () => {
  const s = personaggioBase();
  const roster = { personaggi: { pg1: s } };
  migrazioneRegoleVaelion(roster);

  assert.equal(s.versione, '2014');
  assert.equal(s.sottoclasse, 'Circolo del Pastore');
  assert.ok(s.risorse.some((r) => /totem spirituale/i.test(r.nome)));
  assert.equal(s.maxTrucchetti, 0);
});

test('migrazioneRegoleVaelion: rimuove Folata dai trucchetti', () => {
  const s = personaggioBase({
    incantesimiLista: [{ nome: 'Folata', livello: 0 }, { nome: 'Guida', livello: 0 }],
  });
  const roster = { personaggi: { pg1: s } };
  migrazioneRegoleVaelion(roster);
  assert.deepEqual(s.incantesimiLista.map((i) => i.nome), ['Guida']);
});

test('migrazioneRegoleVaelion: rispetta una sottoclasse già diversa da Circolo della Luna', () => {
  const s = personaggioBase({ sottoclasse: 'Circolo del Pastore' });
  const roster = { personaggi: { pg1: s } };
  migrazioneRegoleVaelion(roster);
  assert.equal(s.sottoclasse, 'Circolo del Pastore'); // non tocca una scelta già corretta
});

test('autoIdratazionePersonaggioPredefinito: riempie i campi mancanti di Vaelion dal seed', () => {
  const s = personaggioBase({ note: '', trattiCaratteriali: '', abilita: { natura: 1 } });
  autoIdratazionePersonaggioPredefinito(s, 'pg-vaelion');
  assert.ok(s.note, 'la nota dovrebbe essere popolata dal seed');
  assert.ok(s.trattiCaratteriali, 'i tratti caratteriali dovrebbero essere popolati dal seed');
  assert.equal(s.abilita.natura, 2, 'un punteggio a 1 (addestrato senza stella) diventa 2 (con la stella)');
});

test('autoIdratazionePersonaggioPredefinito: riconosce anche Wendell, non solo Vaelion', () => {
  const s = personaggioBase({ nome: 'Wendell', classe: 'Bardo', note: '' });
  autoIdratazionePersonaggioPredefinito(s, 'pg-wendell');
  assert.ok(s.note, 'la nota di Wendell dovrebbe essere popolata dal proprio seed');
});

test('autoIdratazionePersonaggioPredefinito: un personaggio con un nome qualunque non viene toccato', () => {
  const s = personaggioBase({ nome: 'Zork il Ladro', note: '' });
  autoIdratazionePersonaggioPredefinito(s, 'pg-qualunque');
  assert.equal(s.note, '', 'nessun nome noto -> nessuna delle cinque migrazioni si applica');
});

test('autoIdratazionePersonaggioPredefinito: NOTA — il riconoscimento è per nome, non solo per id', () => {
  // Documenta il limite noto (vedi commento in cima al modulo): un
  // personaggio semplicemente chiamato "Vaelion" con un id qualunque
  // riceve comunque le correzioni pensate per l'originale.
  const s = personaggioBase({ nome: 'Vaelion', note: '' });
  autoIdratazionePersonaggioPredefinito(s, 'pg-un-id-qualsiasi-non-il-seed');
  assert.ok(s.note, 'il nome da solo basta a far scattare la migrazione');
});
