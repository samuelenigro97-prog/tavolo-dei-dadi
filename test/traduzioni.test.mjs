// Descrizioni lunghe in inglese: verifica che la lingua venga rispettata e che
// le voci non ancora tradotte ricadano sull'italiano (mai un buco).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RADICE_TEST = join(dirname(fileURLToPath(import.meta.url)), '..');

import { setLinguaAttuale, traduciDato } from '../src/i18n.js';
import { INCANTESIMI_NOMI } from '../src/data/spiegazioni.js';
import { spiegaTratto, spiegaTalento, spiegaMetamagia, spiegaPrivilegio, spiegaIncantesimo } from '../src/data/spiegazioni.js';
import { EN_TRATTI, EN_TALENTI, EN_METAMAGIA, EN_PRIVILEGI, EN_INCANTESIMI, EN_PRIVILEGI_CLASSE } from '../src/data/spiegazioni.en.js';

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

test('traduzioni: sottoclassi e scuole di magia rispettano la lingua', () => {
  conLingua('en', () => {
    assert.equal(traduciDato('Stregoneria della Magia Selvaggia'), 'Wild Magic Sorcery');
    assert.equal(traduciDato('Dominio dell’Inganno'), 'Trickery Domain');
    assert.equal(traduciDato('Invocazione'), 'Evocation');
    assert.equal(traduciDato('Necromanzia'), 'Necromancy');
  });
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
  for (const k of Object.keys(EN_INCANTESIMI)) {
    assert.ok(conLingua('it', () => spiegaIncantesimo(k)), `incantesimo inglese orfano: "${k}"`);
  }
});

test('traduzioni: tutti gli incantesimi noti hanno la versione inglese', () => {
  const senza = INCANTESIMI_NOMI.filter((n) => !EN_INCANTESIMI[n]);
  assert.deepEqual(senza, [], `incantesimi ancora senza traduzione: ${senza.join(', ')}`);
});

test('traduzioni: gli incantesimi rispettano la lingua', () => {
  assert.match(conLingua('en', () => spiegaIncantesimo('Palla di Fuoco')), /fire damage/i);
  assert.match(conLingua('it', () => spiegaIncantesimo('Palla di Fuoco')), /danni da fuoco/i);
});

test('traduzioni: ogni privilegio di classe ha la versione inglese', () => {
  // Le chiavi vengono dal file italiano: se se ne aggiunge una nuova senza
  // tradurla, questo test la segnala invece di lasciarla passare inosservata.
  const src = readFileSync(join(RADICE_TEST, 'src/data/spiegazioni.js'), 'utf8');
  const m = /SPIEG_PRIVILEGI\s*=\s*\{/.exec(src);
  let i = m.index + m[0].length, prof = 1;
  while (prof > 0 && i < src.length) {
    if (src[i] === '{') prof++;
    else if (src[i] === '}') prof--;
    i++;
  }
  const blocco = src.slice(m.index + m[0].length, i - 1);
  const chiavi = [...blocco.matchAll(/^ {2}'((?:[^'\\]|\\.)*)':/gm)].map((x) => x[1].replace(/\\'/g, "'"));
  const tradotte = new Set([...Object.keys(EN_PRIVILEGI_CLASSE), ...Object.keys(EN_PRIVILEGI)]);
  const senza = [...new Set(chiavi)].filter((k) => !tradotte.has(k));
  assert.deepEqual(senza, [], `privilegi senza traduzione inglese: ${senza.join(', ')}`);
});

test('traduzioni: nessun testo inglese è rimasto in italiano per sbaglio', () => {
  const spie = /\b(puoi|tuo|tua|della|degli|contro|quando|incantesimo|caratteristica)\b/i;
  const sospetti = [];
  for (const [k, v] of Object.entries({ ...EN_TRATTI, ...EN_TALENTI, ...EN_METAMAGIA, ...EN_PRIVILEGI, ...EN_INCANTESIMI, ...EN_PRIVILEGI_CLASSE })) {
    if (spie.test(v)) sospetti.push(k);
  }
  assert.deepEqual(sospetti, [], `testi ancora in italiano: ${sospetti.join(', ')}`);
});

test('traduzioni: condizioni, armi, armature e sottoclassi sono tradotte in inglese', async () => {
  const dati = await import('../src/data/dati5e.js');
  conLingua('en', () => {
    // Sottoclassi
    for (const [cls, subs] of Object.entries(dati.SOTTOCLASSI_5E || {})) {
      for (const sub of subs) {
        if (['Berserker', 'Samurai', 'Scout'].includes(sub)) continue;
        assert.notEqual(traduciDato(sub), sub, `Sottoclasse non tradotta: ${sub} (${cls})`);
      }
    }
    // Armi
    for (const w of (dati.ARMI_5E || [])) {
      assert.notEqual(traduciDato(w.nome), w.nome, `Arma non tradotta: ${w.nome}`);
    }
    // Condizioni
    for (const c of (dati.CONDIZIONI_5E || [])) {
      assert.notEqual(traduciDato(c), c, `Condizione non tradotta: ${c}`);
    }
    // Strumenti
    for (const s of (dati.STRUMENTI_5E || [])) {
      assert.notEqual(traduciDato(s), s, `Strumento non tradotto: ${s}`);
    }
  });
});

test('traduzioni: tutte le creature del bestiario, famigli ed evocazioni sono tradotte in inglese', async () => {
  const { BESTIE, FAMIGLI, EVOCAZIONI } = await import('../src/data/bestiario.js');
  conLingua('en', () => {
    for (const c of [...BESTIE, ...FAMIGLI, ...EVOCAZIONI]) {
      if (['Otyugh', 'Pony', 'Mammut', 'Sprite', 'Imp', 'Quasit', 'Gazer', 'Unicorno'].includes(c.nome)) continue;
      assert.notEqual(traduciDato(c.nome), c.nome, `Creatura non tradotta: ${c.nome}`);
    }
  });
});

test('traduzioni: parità completa tra dizionario italiano e inglese (0 chiavi mancanti)', async () => {
  const { DIZIONARIO } = await import('../src/i18n.js');
  const itKeys = Object.keys(DIZIONARIO.it);
  const enKeys = Object.keys(DIZIONARIO.en);
  
  const mancantiInEn = itKeys.filter((k) => !(k in DIZIONARIO.en));
  const mancantiInIt = enKeys.filter((k) => !(k in DIZIONARIO.it));
  
  assert.deepEqual(mancantiInEn, [], `Chiavi presenti in IT ma mancanti in EN: ${mancantiInEn.join(', ')}`);
  assert.deepEqual(mancantiInIt, [], `Chiavi presenti in EN ma mancanti in IT: ${mancantiInIt.join(', ')}`);
});
