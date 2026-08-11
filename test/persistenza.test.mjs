import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byteUtf8, salvaJson } from '../src/utils/persistenza.js';

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
