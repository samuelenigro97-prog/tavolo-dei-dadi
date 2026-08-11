import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byteUtf8, salvaJson, rosterSenzaImmagini, riagganciaImmagini } from '../src/utils/persistenza.js';

test('persistenza: misura correttamente il testo UTF-8', () => {
  assert.equal(byteUtf8('abc'), 3);
  assert.equal(byteUtf8('🗺️'), new TextEncoder().encode('🗺️').length);
});

test('persistenza: segnala il salvataggio riuscito', () => {
  const dati = new Map();
  const storage = { setItem: (k, v) => dati.set(k, v) };
  const esito = salvaJson(storage, 'pg', { nome: 'Eroe' });
  assert.equal(esito.ok, true);
  assert.equal(dati.get('pg'), '{"nome":"Eroe"}');
});

test('persistenza: non nasconde una quota esaurita', () => {
  const storage = { setItem: () => { throw new DOMException('pieno', 'QuotaExceededError'); } };
  const esito = salvaJson(storage, 'pg', { mappa: 'x'.repeat(100) });
  assert.equal(esito.ok, false);
  assert.equal(esito.errore, 'QuotaExceededError');
  assert.ok(esito.bytes > 100);
});

test('persistenza: gli snapshot non duplicano ritratto e mappa', () => {
  const roster = { attivo: 'pg-1', personaggi: { 'pg-1': {
    nome: 'Eroe', ritratto: 'data:image/jpeg;base64,FOTO',
    mappaCampagna: 'data:image/jpeg;base64,MAPPA', mappaMarker: { x: 20, y: 30 },
  } } };
  const leggero = rosterSenzaImmagini(roster);
  assert.equal(leggero.personaggi['pg-1'].ritratto, undefined);
  assert.equal(leggero.personaggi['pg-1'].mappaCampagna, undefined);
  assert.deepEqual(leggero.personaggi['pg-1'].mappaMarker, { x: 20, y: 30 });
});

test('persistenza: ripristinare uno snapshot conserva le immagini correnti del PG', () => {
  const snapshot = { attivo: 'pg-1', personaggi: { 'pg-1': { nome: 'Eroe prima' } } };
  const corrente = { attivo: 'pg-1', personaggi: { 'pg-1': {
    nome: 'Eroe adesso', ritratto: 'data:image/jpeg;base64,FOTO',
    mappaCampagna: 'data:image/jpeg;base64,MAPPA',
  } } };
  const ripristinato = riagganciaImmagini(snapshot, corrente);
  assert.equal(ripristinato.personaggi['pg-1'].nome, 'Eroe prima');
  assert.equal(ripristinato.personaggi['pg-1'].ritratto, corrente.personaggi['pg-1'].ritratto);
  assert.equal(ripristinato.personaggi['pg-1'].mappaCampagna, corrente.personaggi['pg-1'].mappaCampagna);
});
