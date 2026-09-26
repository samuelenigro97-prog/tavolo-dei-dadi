// Protezione dai conflitti di sincronizzazione (v4.40.0).
// Riproduce anche lo scenario reale del 26/09/2026: un dispositivo rimasto
// indietro ha rimandato online un roster vecchio (16:06-16:07), annullando le
// correzioni delle 15:49 e ricreando/cancellando personaggi.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  improntaRoster, remotoCambiato, decidiSync, riepilogoConflitto,
  leggiBaseSync, salvaBaseSync, revisioneGist,
} from '../src/utils/conflittiSync.js';
import worker from '../worker/transcribe-worker.js';
import { salvaSync } from '../src/utils/sync.js';

const clona = (x) => JSON.parse(JSON.stringify(x));

// Roster "del mattino": com'era prima delle correzioni delle 15:49.
const rosterMattino = {
  attivo: 'vaelion',
  personaggi: {
    vaelion: { nome: 'Vaelion', abilita: { arcano: 2 }, pfMax: 40 },
    wendell: { nome: 'Wendell', allineamento: 'Buono Caotico' },
    flyora: { nome: 'Flyora', tratti: '2014' },
    elevorn: { nome: 'Elevorn' },
    frost: { nome: 'Frost' },
  },
};
// Roster delle 15:49: correzioni su tre PG, due PG eliminati.
function rosterCorretto() {
  const r = clona(rosterMattino);
  r.personaggi.vaelion.abilita.arcano = 0;
  r.personaggi.wendell.allineamento = 'Caotico Buono';
  r.personaggi.flyora.tratti = '2024';
  delete r.personaggi.elevorn;
  delete r.personaggi.frost;
  return r;
}

/** Storage finto (come localStorage). */
class StorageFinto {
  constructor() { this.m = new Map(); }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); }
}

/**
 * Gist finto + dispositivi che seguono lo STESSO flusso dell'app:
 * leggi online → decidiSync → invia / carica / conflitto.
 */
class GistFinto {
  constructor() { this.n = 0; this.dato = null; this.rev = ''; this.scritture = 0; }
  leggi() { return this.dato ? { rev: this.rev, ts: this.dato._updatedAt, roster: clona(this.dato.roster) } : null; }
  scrivi(roster, ts) { this.n++; this.scritture++; this.rev = `rev-${this.n}`; this.dato = { roster: clona(roster), _updatedAt: ts }; return this.rev; }
}
class Dispositivo {
  constructor(nome) { this.nome = nome; this.roster = null; this.base = null; this.conflitto = null; }
  /** Stesso comportamento di salvaSuCloud() (senza "forza"). */
  sincronizza(gist, ora) {
    if (this.conflitto) return 'in-pausa';
    const remoto = gist.leggi();
    const d = decidiSync({ base: this.base, remoto, locale: this.roster });
    if (d.azione === 'invia') {
      const rev = gist.scrivi(this.roster, ora);
      this.base = { rev, ts: ora, hash: improntaRoster(this.roster) };
    } else if (d.azione === 'carica') {
      this.roster = clona(remoto.roster);
      this.base = { rev: remoto.rev, ts: remoto.ts, hash: improntaRoster(remoto.roster) };
    } else if (d.azione === 'allineato') {
      this.base = { rev: remoto.rev, ts: remoto.ts, hash: improntaRoster(this.roster) };
    } else if (d.azione === 'conflitto') {
      this.conflitto = { remoto };
    }
    return d.azione;
  }
  /** "Mantieni la mia versione" (dopo la conferma). */
  mantieniMia(gist, ora) {
    this.conflitto = null;
    const rev = gist.scrivi(this.roster, ora);
    this.base = { rev, ts: ora, hash: improntaRoster(this.roster) };
  }
  /** "Carica la versione online". */
  caricaOnline() {
    const { remoto } = this.conflitto;
    this.conflitto = null;
    this.roster = clona(remoto.roster);
    this.base = { rev: remoto.rev, ts: remoto.ts, hash: improntaRoster(remoto.roster) };
  }
}

const T_MATTINO = Date.parse('2026-09-26T10:00:00+02:00');
const T_1549 = Date.parse('2026-09-26T15:49:00+02:00');
const T_1606 = Date.parse('2026-09-26T16:06:00+02:00');

function preparaScenario() {
  const gist = new GistFinto();
  const a = new Dispositivo('A');
  const b = new Dispositivo('B (vecchio)');
  a.roster = clona(rosterMattino);
  a.sincronizza(gist, T_MATTINO); // A crea la copia online del mattino
  b.roster = null;
  b.base = null;
  b.roster = clona(rosterMattino);
  assert.equal(b.sincronizza(gist, T_MATTINO + 1000), 'allineato'); // B la vede e resta indietro
  // 15:49: su A si correggono tre PG e se ne eliminano due.
  a.roster = rosterCorretto();
  assert.equal(a.sincronizza(gist, T_1549), 'invia');
  return { gist, a, b };
}

test('scenario 26/09: il dispositivo rimasto indietro SENZA modifiche carica le correzioni invece di sovrascriverle', () => {
  const { gist, b } = preparaScenario();
  const scrittePrima = gist.scritture;
  // 16:06: B torna attivo (avvio, ritorno sulla scheda o auto-salvataggio).
  assert.equal(b.sincronizza(gist, T_1606), 'carica');
  assert.equal(gist.scritture, scrittePrima, 'nessuna scrittura online');
  assert.deepEqual(gist.leggi().roster, rosterCorretto(), 'online restano le correzioni delle 15:49');
  assert.deepEqual(b.roster, rosterCorretto(), 'B ora ha le correzioni');
  assert.equal(b.roster.personaggi.elevorn, undefined);
  assert.equal(b.roster.personaggi.vaelion.abilita.arcano, 0);
  // Da qui in poi B lavora normalmente sulla versione giusta.
  b.roster.personaggi.vaelion.pfMax = 41;
  assert.equal(b.sincronizza(gist, T_1606 + 60000), 'invia');
  assert.equal(gist.leggi().roster.personaggi.vaelion.pfMax, 41);
  assert.equal(gist.leggi().roster.personaggi.wendell.allineamento, 'Caotico Buono');
});

test('scenario 26/09: il dispositivo rimasto indietro CON modifiche locali non invia: apre il conflitto', () => {
  const { gist, b } = preparaScenario();
  b.roster.personaggi.frost.pfMax = 12; // modifica fatta sul dispositivo vecchio
  const scrittePrima = gist.scritture;
  assert.equal(b.sincronizza(gist, T_1606), 'conflitto');
  assert.equal(gist.scritture, scrittePrima, 'nessuna scrittura online finché l’utente non sceglie');
  // Altri auto-salvataggi restano fermi finché il conflitto è aperto.
  b.roster.personaggi.frost.pfMax = 13;
  assert.equal(b.sincronizza(gist, T_1606 + 5000), 'in-pausa');
  assert.equal(gist.scritture, scrittePrima);
  assert.deepEqual(gist.leggi().roster, rosterCorretto());
  const r = riepilogoConflitto(b.roster, gist.leggi().roster);
  assert.deepEqual(r.soloQui.sort(), ['Elevorn', 'Frost']);
  assert.deepEqual(r.diversi.sort(), ['Flyora', 'Vaelion', 'Wendell']);
  assert.equal(r.nQui, 5);
  assert.equal(r.nOnline, 3);
});

test('conflitto → "Carica la versione online": online invariato, il dispositivo si riallinea', () => {
  const { gist, b } = preparaScenario();
  b.roster.personaggi.frost.pfMax = 12;
  b.sincronizza(gist, T_1606);
  b.caricaOnline();
  assert.deepEqual(b.roster, rosterCorretto());
  assert.equal(b.sincronizza(gist, T_1606 + 1000), 'niente');
});

test('conflitto → "Mantieni la mia" (confermato): sovrascrive solo per scelta esplicita', () => {
  const { gist, b } = preparaScenario();
  b.roster.personaggi.frost.pfMax = 12;
  b.sincronizza(gist, T_1606);
  b.mantieniMia(gist, T_1606 + 2000);
  assert.equal(gist.leggi().roster.personaggi.frost.pfMax, 12);
  assert.equal(b.conflitto, null);
});

test('dispositivo aggiornato da una versione vecchia (base solo con timestamp, niente impronta): chiede invece di sovrascrivere', () => {
  const { gist } = preparaScenario();
  const storage = new StorageFinto();
  storage.setItem('scheda-interattiva:sync-ts', String(T_MATTINO)); // unica traccia lasciata dalla v4.39
  const base = leggiBaseSync(storage, 'scheda-interattiva:sync-base', 'scheda-interattiva:sync-ts');
  assert.deepEqual(base, { rev: '', ts: T_MATTINO, hash: '' });
  const d = decidiSync({ base, remoto: gist.leggi(), locale: clona(rosterMattino) });
  assert.equal(d.azione, 'conflitto');
  // …ma se il contenuto è già identico non disturba.
  assert.equal(decidiSync({ base, remoto: gist.leggi(), locale: rosterCorretto() }).azione, 'allineato');
});

test('modifica fatta DIRETTAMENTE sul Gist (senza cambiare _updatedAt) viene comunque rilevata tramite la revisione', () => {
  const base = { rev: 'rev-1', ts: T_1549, hash: improntaRoster(rosterCorretto()) };
  const remoto = { rev: 'rev-2', ts: T_1549, roster: rosterMattino };
  assert.equal(remotoCambiato(base, remoto), true);
  assert.equal(decidiSync({ base, remoto, locale: rosterCorretto() }).azione, 'carica');
});

test('decidiSync: casi base', () => {
  const r = rosterCorretto();
  const h = improntaRoster(r);
  // Nessuna copia online: si crea.
  assert.equal(decidiSync({ base: null, remoto: null, locale: r }).azione, 'invia');
  // Online invariato, locale invariato: niente da fare (nessuna revisione inutile).
  assert.equal(decidiSync({ base: { rev: 'x', ts: 1, hash: h }, remoto: { rev: 'x', ts: 1, roster: r }, locale: r }).azione, 'niente');
  // Online invariato, locale modificato: si invia.
  const mod = clona(r); mod.personaggi.vaelion.pfMax = 99;
  assert.equal(decidiSync({ base: { rev: 'x', ts: 1, hash: h }, remoto: { rev: 'x', ts: 1, roster: r }, locale: mod }).azione, 'invia');
  // Copia online vuota: non c'è nulla da proteggere.
  assert.equal(decidiSync({ base: null, remoto: { rev: 'y', ts: 2, roster: { personaggi: {} } }, locale: r }).azione, 'invia');
  // Dispositivo nuovo (nessuna base) con una copia online esistente e diversa: chiede.
  assert.equal(decidiSync({ base: null, remoto: { rev: 'y', ts: 2, roster: rosterMattino }, locale: r }).azione, 'conflitto');
});

test('remotoCambiato usa il timestamp come versione (anche con orologi sfasati)', () => {
  assert.equal(remotoCambiato({ ts: 100 }, { ts: 100 }), false);
  assert.equal(remotoCambiato({ ts: 100 }, { ts: 200 }), true);
  assert.equal(remotoCambiato({ ts: 100 }, { ts: 50 }), true, 'un altro dispositivo con l’orologio indietro');
  assert.equal(remotoCambiato({}, { ts: 50 }), true);
  assert.equal(remotoCambiato({ ts: 1 }, null), false);
});

test('improntaRoster ignora immagini, ordine delle chiavi e metadati; cambia con i dati', () => {
  const a = { attivo: 'p', personaggi: { p: { nome: 'A', pf: 3, ritratto: 'data:image/png;base64,xx' } } };
  const b = { personaggi: { p: { pf: 3, nome: 'A' } }, attivo: 'p', _updatedAt: 123 };
  assert.equal(improntaRoster(a), improntaRoster(b));
  assert.notEqual(improntaRoster(a), improntaRoster({ attivo: 'p', personaggi: { p: { nome: 'A', pf: 4 } } }));
});

test('leggiBaseSync / salvaBaseSync: andata e ritorno, e aggiornano anche il vecchio timestamp', () => {
  const s = new StorageFinto();
  salvaBaseSync(s, 'b', { rev: 'r9', ts: 42, hash: 'h' }, 'ts');
  assert.deepEqual(leggiBaseSync(s, 'b', 'ts'), { rev: 'r9', ts: 42, hash: 'h' });
  assert.equal(s.getItem('ts'), '42');
  s.setItem('b', '{rotto');
  assert.deepEqual(leggiBaseSync(s, 'b', 'ts'), { rev: '', ts: 42, hash: '' });
});

test('revisioneGist legge la revisione dalla risposta di GitHub', () => {
  assert.equal(revisioneGist({ history: [{ version: 'abc' }], updated_at: 'x' }), 'abc');
  assert.equal(revisioneGist({ updated_at: '2026-09-26T14:06:00Z' }), '2026-09-26T14:06:00Z');
  assert.equal(revisioneGist(null), '');
});

// --- Worker: controllo di concorrenza lato server (codice di sincronizzazione) ---
class KvFinto {
  constructor() { this.dati = new Map(); }
  async get(k) { return this.dati.get(k) ?? null; }
  async put(k, v) { this.dati.set(k, v); }
}
const codice = '23456ABCDE';
function envFinto() { return { SCHEDE: new KvFinto(), ROOM_RATE_LIMITER: { limit: async () => ({ success: true }) } }; }
function put(env, corpo) {
  return worker.fetch(new Request(`https://w.example/sync/${codice}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.9' }, body: JSON.stringify(corpo) }), env);
}

test('worker sync: baseUpdatedAt diverso dal salvato → 409 SYNC_CONFLICT, dato online intatto', async () => {
  const env = envFinto();
  assert.equal((await put(env, { roster: rosterCorretto(), updatedAt: T_1549 })).status, 200);
  const res = await put(env, { roster: rosterMattino, updatedAt: T_1606, baseUpdatedAt: T_MATTINO });
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'SYNC_CONFLICT');
  const salvato = JSON.parse(await env.SCHEDE.get(`sync:${codice}`));
  assert.deepEqual(salvato.roster, rosterCorretto());
  // Con la base giusta la scrittura passa.
  assert.equal((await put(env, { roster: rosterMattino, updatedAt: T_1606, baseUpdatedAt: T_1549 })).status, 200);
});

test('worker sync: senza baseUpdatedAt (app vecchie) il comportamento resta quello di prima', async () => {
  const env = envFinto();
  assert.equal((await put(env, { roster: rosterCorretto(), updatedAt: T_1549 })).status, 200);
  assert.equal((await put(env, { roster: rosterCorretto(), updatedAt: T_1606 })).status, 200);
});

test('salvaSync invia baseUpdatedAt e traduce il 409 in SYNC_CONFLICT', async () => {
  let corpoInviato = null;
  const fetchFinto = async (_url, init) => {
    corpoInviato = JSON.parse(init.body);
    return new Response(JSON.stringify({ error: 'SYNC_CONFLICT', updatedAt: 5 }), { status: 409 });
  };
  await assert.rejects(salvaSync('https://w.example', codice, rosterCorretto(), 10, fetchFinto, { baseUpdatedAt: 4 }), /SYNC_CONFLICT/);
  assert.equal(corpoInviato.baseUpdatedAt, 4);
  const fetchOk = async (_url, init) => { corpoInviato = JSON.parse(init.body); return new Response(JSON.stringify({ ok: true, updatedAt: 10 }), { status: 200 }); };
  await salvaSync('https://w.example', codice, rosterCorretto(), 10, fetchOk);
  assert.equal('baseUpdatedAt' in corpoInviato, false);
});
