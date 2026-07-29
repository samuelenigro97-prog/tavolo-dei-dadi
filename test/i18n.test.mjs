// Coerenza delle traduzioni: ogni chiave usata nel codice deve esistere in
// italiano E in inglese, altrimenti l'interfaccia mostra la chiave grezza
// (es. "combat.aggiungi_ph" al posto di "Nome arma…").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RADICE = join(dirname(fileURLToPath(import.meta.url)), '..');
const i18n = readFileSync(join(RADICE, 'src/i18n.js'), 'utf8');

/** Chiavi definite nel blocco di una lingua del DIZIONARIO. */
function chiaviDi(lingua) {
  const m = new RegExp(`\\b${lingua}\\s*:\\s*\\{`).exec(i18n);
  assert.ok(m, `blocco lingua "${lingua}" non trovato in i18n.js`);
  let i = m.index + m[0].length, profondita = 1;
  while (profondita > 0 && i < i18n.length) {
    if (i18n[i] === '{') profondita++;
    else if (i18n[i] === '}') profondita--;
    i++;
  }
  const blocco = i18n.slice(m.index + m[0].length, i);
  return new Set([...blocco.matchAll(/'([a-zA-Z0-9_.]+)'\s*:/g)].map((x) => x[1]));
}

/** Chiavi passate a t('...') nei sorgenti dell'interfaccia. */
function chiaviUsate() {
  const usate = new Set();
  for (const f of ['src/App.jsx', 'src/ui/componenti.jsx']) {
    const src = readFileSync(join(RADICE, f), 'utf8');
    for (const m of src.matchAll(/t\(\s*['"]([a-zA-Z0-9_.]+)['"]/g)) usate.add(m[1]);
  }
  return usate;
}

// Chiavi composte a runtime (es. t('armor.' + tipo)): il prefisso da solo non
// è una chiave reale, quindi va escluso dal controllo.
const PREFISSI_DINAMICI = new Set(['armor.', 'attr.', 'skill.', 'spieg.', 'inv.stato_']);
// Falsi positivi della regex (frammenti dentro altre espressioni).
const NON_CHIAVI = new Set(['...', '2d', 'a', 'agg', 'canvas']);

const IT = chiaviDi('it');
const EN = chiaviDi('en');
const USATE = [...chiaviUsate()].filter((k) => !PREFISSI_DINAMICI.has(k) && !NON_CHIAVI.has(k));

test('i18n: il dizionario italiano non è vuoto', () => {
  assert.ok(IT.size > 100, `troppe poche chiavi italiane: ${IT.size}`);
});

test('i18n: ogni chiave usata nel codice esiste in italiano', () => {
  const mancanti = USATE.filter((k) => !IT.has(k));
  assert.deepEqual(mancanti, [], `chiavi senza traduzione italiana (mostrerebbero il testo grezzo): ${mancanti.join(', ')}`);
});

test('i18n: ogni chiave usata nel codice esiste in inglese', () => {
  const mancanti = USATE.filter((k) => !EN.has(k));
  assert.deepEqual(mancanti, [], `chiavi senza traduzione inglese: ${mancanti.join(', ')}`);
});

test('i18n: italiano e inglese hanno esattamente le stesse chiavi', () => {
  const soloIt = [...IT].filter((k) => !EN.has(k));
  const soloEn = [...EN].filter((k) => !IT.has(k));
  assert.deepEqual(soloIt, [], `presenti solo in italiano: ${soloIt.join(', ')}`);
  assert.deepEqual(soloEn, [], `presenti solo in inglese: ${soloEn.join(', ')}`);
});

test('i18n: nessuna etichetta finisce con ":" (i due punti li mette il layout)', () => {
  // Evita il bug "Dado::" / "Slot::": se la traduzione contiene già i due punti
  // e il JSX ne aggiunge un altro, se ne vedono due.
  const conDuePunti = [...i18n.matchAll(/'([a-zA-Z0-9_.]+)':\s*'([^']*:)'/g)].map((m) => m[1]);
  const app = readFileSync(join(RADICE, 'src/App.jsx'), 'utf8');
  const doppie = conDuePunti.filter((k) => new RegExp(`t\\(['"]${k.replace(/\./g, '\\.')}['"]\\)\\}\\s*:`).test(app));
  assert.deepEqual(doppie, [], `queste chiavi producono due volte i due punti: ${doppie.join(', ')}`);
});
