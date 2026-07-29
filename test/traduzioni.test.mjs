// Descrizioni lunghe in inglese: verifica che la lingua venga rispettata e che
// le voci non ancora tradotte ricadano sull'italiano (mai un buco).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { setLinguaAttuale } from '../src/i18n.js';
import { spiegaTratto, spiegaTalento, spiegaMetamagia, spiegaPrivilegio } from '../src/data/spiegazioni.js';
import { EN_TRATTI, EN_TALENTI, EN_METAMAGIA, EN_PRIVILEGI } from '../src/data/spiegazioni.en.js';

function conLingua(lang, fn) {
  setLinguaAttuale(lang);
  try { return fn(); } finally { setLinguaAttuale('it'); }
}

test('traduzioni: in italiano si ottiene il testo italiano', () => {
  const t = conLingua('it', () => spiegaTratto('Scurovisione'));
  assert.match(t, /vedi al buio/i);
});

test('traduzioni: in inglese si ottiene il testo inglese', () => {
  const t = conLingua('en', () => spiegaTratto('Scurovisione'));
  assert.match(t, /see in the dark/i);
  assert.doesNotMatch(t, /vedi al buio/i);
});

test('traduzioni: talenti e metamagia rispettano la lingua', () => {
  assert.match(conLingua('en', () => spiegaTalento('Robusto')), /Hit Point maximum/i);
  assert.match(conLingua('it', () => spiegaTalento('Robusto')), /Punti Ferita/i);
  assert.match(conLingua('en', () => spiegaMetamagia('Incantesimo Rapido')), /bonus action/i);
  assert.match(conLingua('it', () => spiegaMetamagia('Incantesimo Rapido')), /azione bonus/i);
});

test('traduzioni: la ricerca ignora maiuscole e parentesi', () => {
  assert.match(conLingua('en', () => spiegaTratto('scurovisione')), /see in the dark/i);
  assert.match(conLingua('en', () => spiegaTalento('Robusto (origine)')), /Hit Point maximum/i);
});

test('traduzioni: una voce non tradotta ricade sull italiano invece di sparire', () => {
  // "Aggiustare" è un incantesimo: non è fra i tratti tradotti.
  const senzaTraduzione = conLingua('en', () => spiegaTalento('Sentinella'));
  assert.ok(senzaTraduzione, 'la voce non deve sparire in inglese');
});

test('traduzioni: ogni chiave inglese esiste anche in italiano (niente orfane)', () => {
  // Una chiave inglese che non corrisponde a nessuna voce italiana non verrebbe
  // mai mostrata: segnala un refuso nel nome.
  for (const k of Object.keys(EN_TRATTI)) {
    assert.ok(conLingua('it', () => spiegaTratto(k)), `tratto inglese orfano: "${k}"`);
  }
  for (const k of Object.keys(EN_TALENTI)) {
    assert.ok(conLingua('it', () => spiegaTalento(k)), `talento inglese orfano: "${k}"`);
  }
  for (const k of Object.keys(EN_METAMAGIA)) {
    assert.ok(conLingua('it', () => spiegaMetamagia(k)), `metamagia inglese orfana: "${k}"`);
  }
  for (const k of Object.keys(EN_PRIVILEGI)) {
    assert.ok(conLingua('it', () => spiegaPrivilegio(k)), `privilegio inglese orfano: "${k}"`);
  }
});

test('traduzioni: nessun testo inglese è rimasto in italiano per sbaglio', () => {
  const spie = /\b(puoi|tuo|tua|della|degli|contro|quando|incantesimo|caratteristica)\b/i;
  const sospetti = [];
  for (const [k, v] of Object.entries({ ...EN_TRATTI, ...EN_TALENTI, ...EN_METAMAGIA, ...EN_PRIVILEGI })) {
    if (spie.test(v)) sospetti.push(k);
  }
  assert.deepEqual(sospetti, [], `testi ancora in italiano: ${sospetti.join(', ')}`);
});
