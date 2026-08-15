import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { gestisciStanze } from '../worker/transcribe-worker.js';
import { creaStanza, apriStanza, normalizzaCodiceStanza } from '../src/utils/stanze.js';
import { costruisciLink, payloadDaUrl } from '../src/utils/condivisione.js';

class KvFinto {
  constructor() { this.dati = new Map(); this.puts = []; this.gets = 0; }
  async get(k) { this.gets++; return this.dati.get(k) ?? null; }
  async put(k, v, opzioni) { this.dati.set(k, v); this.puts.push({ k, v, opzioni }); }
}

const headers = { 'Content-Type': 'application/json' };
const scheda = { nome: 'Lyra', classe: 'Mago', livello: 4, caratteristiche: { intelligenza: 16 } };

function req(path, init = {}) {
  return new Request(`https://worker.example${path}`, { headers: { ...headers, 'cf-connecting-ip': '203.0.113.8', ...(init.headers || {}) }, ...init });
}

test('stanze: creazione e apertura di uno snapshot', async () => {
  const kv = new KvFinto();
  const env = { SCHEDE: kv, ROOM_RATE_LIMITER: { limit: async () => ({ success: true }) } };
  const creata = await worker.fetch(req('/room', { method: 'POST', body: JSON.stringify({ scheda }) }), env);
  assert.equal(creata.status, 201);
  const info = await creata.json();
  assert.match(info.code, /^[2-9A-HJ-NP-Z]{10}$/);
  const aperta = await worker.fetch(req(`/room/${info.code}`), env);
  assert.equal(aperta.status, 200);
  assert.deepEqual((await aperta.json()).scheda, scheda);
  assert.equal(kv.puts.find((p) => p.k.startsWith('room:')).opzioni.expirationTtl, 25 * 60 * 60);
});

test('stanze: codice errato e stanza scaduta hanno errori distinti', async () => {
  const kv = new KvFinto();
  const env = { SCHEDE: kv, ROOM_RATE_LIMITER: { limit: async () => ({ success: true }) } };
  assert.equal((await gestisciStanze(req('/room/2222222222'), env, headers, '/room/2222222222')).status, 404);
  kv.dati.set('room:3333333333', JSON.stringify({ expiresAt: Date.now() - 1, scheda }));
  const scaduta = await gestisciStanze(req('/room/3333333333'), env, headers, '/room/3333333333');
  assert.equal(scaduta.status, 410);
  assert.equal((await scaduta.json()).code, 'ROOM_EXPIRED');
});

test('stanze: payload troppo grande o non valido viene rifiutato', async () => {
  const env = { SCHEDE: new KvFinto(), ROOM_RATE_LIMITER: { limit: async () => ({ success: true }) } };
  const invalida = await worker.fetch(req('/room', { method: 'POST', body: JSON.stringify({ scheda: { livello: 99 } }) }), env);
  assert.equal(invalida.status, 400);
  const grande = await worker.fetch(req('/room', { method: 'POST', body: JSON.stringify({ scheda: { nome: 'x', note: 'a'.repeat(140 * 1024) } }) }), env);
  assert.equal(grande.status, 413);
});

test('stanze: una collisione ritenta prima di scrivere', async () => {
  const kv = new KvFinto();
  const originale = kv.get.bind(kv);
  let controlliRoom = 0;
  kv.get = async (k) => k.startsWith('room:') && controlliRoom++ === 0 ? 'occupata' : originale(k);
  const env = { SCHEDE: kv, ROOM_RATE_LIMITER: { limit: async () => ({ success: true }) } };
  const res = await worker.fetch(req('/room', { method: 'POST', body: JSON.stringify({ scheda }) }), env);
  assert.equal(res.status, 201);
  assert.ok(controlliRoom >= 2);
});

test('stanze: KV mancante rende il servizio non disponibile', async () => {
  const res = await worker.fetch(req('/room', { method: 'POST', body: JSON.stringify({ scheda }) }), {});
  assert.equal(res.status, 503);
  assert.equal((await res.json()).code, 'ROOM_SERVICE_UNAVAILABLE');
});

test('stanze: il rate limiter Cloudflare blocca con 429', async () => {
  const env = { SCHEDE: new KvFinto(), ROOM_RATE_LIMITER: { limit: async () => ({ success: false }) } };
  const res = await worker.fetch(req('/room/2222222222'), env);
  assert.equal(res.status, 429);
  assert.equal(res.headers.get('retry-after'), '60');
  assert.equal((await res.json()).code, 'ROOM_RATE_LIMITED');
});

test('stanze client: crea e apre senza alcun token GitHub', async () => {
  const chiamate = [];
  const fakeFetch = async (url, init) => {
    chiamate.push({ url, init });
    return url.endsWith('/room')
      ? new Response(JSON.stringify({ code: '23456ABCDE', expiresAt: Date.now() + 1000 }), { status: 201, headers })
      : new Response(JSON.stringify({ scheda, expiresAt: Date.now() + 1000 }), { status: 200, headers });
  };
  const creata = await creaStanza('https://worker.example', { ...scheda, ritratto: 'data:image/jpeg;base64,' + 'x'.repeat(4000) }, fakeFetch);
  assert.equal(creata.code, '23456ABCDE');
  assert.doesNotMatch(chiamate[0].init.body, /github|token|ritratto/i);
  assert.deepEqual((await apriStanza('https://worker.example', '23456-abcde', fakeFetch)).scheda, scheda);
  assert.equal(normalizzaCodiceStanza('23456-abcde'), '23456ABCDE');
});

test('stanze: la condivisione tramite link resta compatibile', () => {
  const link = costruisciLink('https://app.example/#altro', 'zABC-123_xyz');
  assert.equal(payloadDaUrl(link), 'zABC-123_xyz');
});
