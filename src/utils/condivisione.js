// Condivisione di un personaggio tramite link.
//
// La scheda viene compressa (gzip) e codificata in base64url, poi messa
// nel FRAMMENTO dell'URL (#pg=…): il frammento non viene mai inviato al
// server, quindi il personaggio resta privato anche passando da GitHub Pages.
//
// Il ritratto è il punto delicato: gli avatar generati sono SVG leggeri
// (~1 KB) e viaggiano insieme alla scheda, mentre le FOTO caricate sono
// JPEG da decine di KB e renderebbero il link inutilizzabile. Quelle vengono
// escluse: chi apre il link vedrà l'avatar rigenerato da classe/specie/nome.

/** Oltre questa lunghezza il ritratto è una foto: troppo pesante per un link. */
export const LIMITE_RITRATTO = 3000;

/** Lunghezza massima consigliata per il payload (URL affidabili ovunque). */
export const LIMITE_PAYLOAD = 2000;

/** Vero se questo ritratto è abbastanza leggero da viaggiare nel link. */
export function ritrattoCondivisibile(ritratto) {
  if (!ritratto || typeof ritratto !== 'string') return false;
  return ritratto.length <= LIMITE_RITRATTO;
}

/**
 * Prepara la scheda da condividere: toglie ciò che non ha senso trasferire
 * (id interni) e la foto se troppo pesante.
 * Restituisce { scheda, ritrattoRimosso }.
 */
export function preparaPerCondivisione(scheda) {
  const copia = { ...(scheda || {}) };
  let ritrattoRimosso = false;
  if (copia.ritratto && !ritrattoCondivisibile(copia.ritratto)) {
    delete copia.ritratto;
    ritrattoRimosso = true;
  }
  return { scheda: copia, ritrattoRimosso };
}

// --- codifica binaria <-> testo ------------------------------------------

function byteInBase64url(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlInByte(testo) {
  const b64 = testo.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Comprime se il browser supporta CompressionStream, altrimenti passa oltre. */
async function comprimi(testo) {
  if (typeof CompressionStream === 'undefined') return null;
  try {
    const cs = new CompressionStream('gzip');
    const stream = new Blob([testo]).stream().pipeThrough(cs);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

async function decomprimi(bytes) {
  if (typeof DecompressionStream === 'undefined') return null;
  try {
    const ds = new DecompressionStream('gzip');
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    return await new Response(stream).text();
  } catch {
    return null;
  }
}

// I payload compressi iniziano con "z", quelli non compressi con "p": così
// chi legge sa cosa ha in mano anche se è stato creato da un browser diverso.
const TAG_COMPRESSO = 'z';
const TAG_PIANO = 'p';

/** Codifica una scheda nella stringa da mettere nel link. */
export async function codificaScheda(scheda) {
  const json = JSON.stringify(scheda);
  const compresso = await comprimi(json);
  if (compresso) return TAG_COMPRESSO + byteInBase64url(compresso);
  // Ripiego: base64url del JSON (link più lungo, ma funziona lo stesso).
  return TAG_PIANO + byteInBase64url(new TextEncoder().encode(json));
}

/** Decodifica la stringa del link. Restituisce la scheda, o null se illeggibile. */
export async function decodificaScheda(payload) {
  if (typeof payload !== 'string' || payload.length < 2) return null;
  const tag = payload[0];
  const corpo = payload.slice(1);
  try {
    const bytes = base64urlInByte(corpo);
    let json;
    if (tag === TAG_COMPRESSO) {
      json = await decomprimi(bytes);
      if (json == null) return null;
    } else if (tag === TAG_PIANO) {
      json = new TextDecoder().decode(bytes);
    } else {
      return null;
    }
    const dati = JSON.parse(json);
    return dati && typeof dati === 'object' ? dati : null;
  } catch {
    return null;
  }
}

/** Costruisce il link completo da condividere. */
export function costruisciLink(baseUrl, payload) {
  const pulito = String(baseUrl || '').split('#')[0];
  return `${pulito}#pg=${payload}`;
}

/** Estrae il payload da un URL (o null se non contiene un personaggio). */
export function payloadDaUrl(url) {
  const m = String(url || '').match(/#pg=([A-Za-z0-9\-_]+)/);
  return m ? m[1] : null;
}
