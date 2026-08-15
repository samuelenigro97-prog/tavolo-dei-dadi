import { preparaPerCondivisione } from './condivisione.js';

export const MAX_STANZA_BYTES = 128 * 1024;
export const DURATA_STANZA_ORE = 24;

export function normalizzaCodiceStanza(codice) {
  return String(codice || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
}

export function formattaCodiceStanza(codice) {
  const pulito = normalizzaCodiceStanza(codice);
  return pulito.length > 5 ? `${pulito.slice(0, 5)}-${pulito.slice(5)}` : pulito;
}

function endpoint(baseUrl, percorso) {
  const base = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(base)) throw new Error('ROOM_SERVICE_UNAVAILABLE');
  return `${base}${percorso}`;
}

async function leggiRisposta(res) {
  let dati = null;
  try { dati = await res.json(); } catch { /* risposta non JSON */ }
  if (!res.ok) throw new Error(dati?.code || (res.status === 413 ? 'ROOM_TOO_LARGE' : 'ROOM_SERVICE_UNAVAILABLE'));
  return dati;
}

/** Crea uno snapshot immutabile; non usa né legge token GitHub. */
export async function creaStanza(baseUrl, scheda, fetchImpl = fetch) {
  const { scheda: leggera } = preparaPerCondivisione(scheda);
  delete leggera.mappaCampagna;
  const body = JSON.stringify({ scheda: leggera });
  if (new TextEncoder().encode(body).length > MAX_STANZA_BYTES) throw new Error('ROOM_TOO_LARGE');
  const res = await fetchImpl(endpoint(baseUrl, '/room'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
  });
  const dati = await leggiRisposta(res);
  const code = normalizzaCodiceStanza(dati?.code);
  if (code.length !== 10 || !Number.isFinite(dati?.expiresAt)) throw new Error('ROOM_INVALID_PAYLOAD');
  return { code, expiresAt: dati.expiresAt };
}

export async function apriStanza(baseUrl, codice, fetchImpl = fetch) {
  const pulito = normalizzaCodiceStanza(codice);
  if (pulito.length !== 10) throw new Error('ROOM_NOT_FOUND');
  const res = await fetchImpl(endpoint(baseUrl, `/room/${encodeURIComponent(pulito)}`), { method: 'GET' });
  const dati = await leggiRisposta(res);
  if (!dati?.scheda || typeof dati.scheda !== 'object' || Array.isArray(dati.scheda) || !Number.isFinite(dati.expiresAt)) throw new Error('ROOM_INVALID_PAYLOAD');
  return { scheda: dati.scheda, expiresAt: dati.expiresAt };
}
