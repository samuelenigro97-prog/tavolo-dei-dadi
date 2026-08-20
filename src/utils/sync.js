// Sincronizzazione del roster tra dispositivi SENZA token GitHub: un codice a
// 10 caratteri (generato qui, mai dal server) fa da identità e da segreto sul
// Worker (rotta /sync, vedi worker/transcribe-worker.js). Stesso alfabeto e
// stesso formato delle Stanze, così è familiare a chi le ha già usate.
import { normalizzaCodiceStanza, formattaCodiceStanza } from './stanze.js';

export { normalizzaCodiceStanza as normalizzaCodiceSync, formattaCodiceStanza as formattaCodiceSync };

const ALFABETO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/** Genera un codice casuale lato client (nessuna chiamata al Worker: il
 *  codice stesso è il segreto, quindi non deve mai transitare "vuoto"). */
export function generaCodiceSync() {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let codice = '';
  for (let i = 0; i < 10; i++) codice += ALFABETO[bytes[i] & 31];
  return codice;
}

function endpoint(baseUrl, percorso) {
  const base = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(base)) throw new Error('SYNC_SERVICE_UNAVAILABLE');
  return `${base}${percorso}`;
}

async function leggiRisposta(res) {
  let dati = null;
  try { dati = await res.json(); } catch { /* risposta non JSON */ }
  if (!res.ok) {
    if (res.status === 404) throw new Error('SYNC_NOT_FOUND');
    if (res.status === 413) throw new Error('SYNC_TOO_LARGE');
    if (res.status === 429) throw new Error('SYNC_RATE_LIMITED');
    throw new Error(dati?.error || 'SYNC_SERVICE_UNAVAILABLE');
  }
  return dati;
}

/** Salva (o sovrascrive) il roster sotto il codice indicato. */
export async function salvaSync(baseUrl, codice, roster, updatedAt, fetchImpl = fetch) {
  const pulito = normalizzaCodiceStanza(codice);
  if (pulito.length !== 10) throw new Error('SYNC_INVALID_CODE');
  const res = await fetchImpl(endpoint(baseUrl, `/sync/${encodeURIComponent(pulito)}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roster, updatedAt }),
  });
  const dati = await leggiRisposta(res);
  return { updatedAt: dati?.updatedAt ?? updatedAt };
}

/** Recupera il roster salvato con quel codice. */
export async function caricaSync(baseUrl, codice, fetchImpl = fetch) {
  const pulito = normalizzaCodiceStanza(codice);
  if (pulito.length !== 10) throw new Error('SYNC_INVALID_CODE');
  const res = await fetchImpl(endpoint(baseUrl, `/sync/${encodeURIComponent(pulito)}`), { method: 'GET' });
  const dati = await leggiRisposta(res);
  if (!dati?.roster || typeof dati.roster !== 'object' || Array.isArray(dati.roster)) throw new Error('SYNC_INVALID_PAYLOAD');
  return { roster: dati.roster, updatedAt: Number(dati.updatedAt) || 0 };
}

/** Messaggio utente in italiano per i codici di errore sopra. */
export function messaggioErroreSync(codice) {
  switch (codice) {
    case 'SYNC_NOT_FOUND': return 'Nessun roster salvato con questo codice: controlla di averlo scritto giusto, oppure creane uno nuovo.';
    case 'SYNC_TOO_LARGE': return 'Il roster è troppo grande per la sincronizzazione (limite 4 MB, immagini comprese).';
    case 'SYNC_RATE_LIMITED': return 'Troppe richieste in poco tempo: riprova tra un minuto.';
    case 'SYNC_INVALID_CODE': return 'Codice non valido: deve avere 10 caratteri.';
    case 'SYNC_INVALID_PAYLOAD': return 'Dati ricevuti dal server non validi.';
    case 'SYNC_SERVICE_UNAVAILABLE': return 'Servizio di sincronizzazione non raggiungibile: configura il Worker o riprova più tardi.';
    default: return 'Errore imprevisto durante la sincronizzazione.';
  }
}
