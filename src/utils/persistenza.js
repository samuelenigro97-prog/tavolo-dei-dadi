/** Dimensione UTF-8 reale di un testo, utile per diagnosticare la quota browser. */
export function byteUtf8(testo) {
  return new TextEncoder().encode(String(testo ?? '')).length;
}

/**
 * Salva JSON senza nascondere gli errori di quota/privacy del browser.
 * Restituisce sempre un esito, così l'interfaccia può avvisare l'utente.
 */
export function salvaJson(storage, chiave, valore) {
  const json = JSON.stringify(valore);
  const bytes = byteUtf8(json);
  try {
    storage.setItem(chiave, json);
    return { ok: true, bytes };
  } catch (errore) {
    return { ok: false, bytes, errore: errore?.name || 'StorageError' };
  }
}

/**
 * Gli snapshot sono copie di emergenza frequenti: duplicare al loro interno le
 * immagini base64 esaurirebbe rapidamente la quota del browser. Le immagini
 * restano nel roster principale, nel cloud e nel backup completo.
 */
export function rosterSenzaImmagini(roster) {
  const leggero = { attivo: roster?.attivo || '', personaggi: {} };
  for (const [id, scheda] of Object.entries(roster?.personaggi || {})) {
    const { ritratto, mappaCampagna, ...resto } = scheda || {};
    leggero.personaggi[id] = resto;
  }
  return leggero;
}

/** Riaggancia le immagini correnti ai PG omonimi quando si ripristina uno snapshot. */
export function riagganciaImmagini(rosterSnapshot, rosterCorrente) {
  const ripristinato = { ...rosterSnapshot, personaggi: {} };
  for (const [id, scheda] of Object.entries(rosterSnapshot?.personaggi || {})) {
    const corrente = rosterCorrente?.personaggi?.[id] || {};
    ripristinato.personaggi[id] = {
      ...scheda,
      ...(corrente.ritratto ? { ritratto: corrente.ritratto } : {}),
      ...(corrente.mappaCampagna ? { mappaCampagna: corrente.mappaCampagna } : {}),
    };
  }
  return ripristinato;
}

const DB_IMMAGINI = 'tavolo-dei-dadi-immagini';
const STORE_IMMAGINI = 'personaggi';
const TIMEOUT_INDEXED_DB_MS = 4000;

function apriDbImmagini() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB non disponibile'));
    const richiesta = indexedDB.open(DB_IMMAGINI, 1);
    let conclusa = false;
    const termina = (azione, valore) => {
      if (conclusa) return;
      conclusa = true;
      clearTimeout(timer);
      azione(valore);
    };
    const timer = setTimeout(
      () => termina(reject, new Error('IndexedDB non risponde')),
      TIMEOUT_INDEXED_DB_MS,
    );
    richiesta.onupgradeneeded = () => richiesta.result.createObjectStore(STORE_IMMAGINI);
    richiesta.onsuccess = () => termina(resolve, richiesta.result);
    richiesta.onerror = () => termina(reject, richiesta.error);
    richiesta.onblocked = () => termina(reject, new Error('IndexedDB bloccato'));
  });
}

/** Salva le immagini fuori dal localStorage, indicizzate per personaggio. */
export async function salvaImmaginiRoster(roster) {
  const db = await apriDbImmagini();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_IMMAGINI, 'readwrite');
    const store = tx.objectStore(STORE_IMMAGINI);
    for (const [id, scheda] of Object.entries(roster?.personaggi || {})) {
      if (scheda?.ritratto) store.put(scheda.ritratto, `${id}:ritratto`);
      if (scheda?.mappaCampagna) store.put(scheda.mappaCampagna, `${id}:mappaCampagna`);
    }
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

/** Recupera le immagini persistenti e le riaggancia al roster in memoria. */
export async function caricaImmaginiRoster(roster) {
  const db = await apriDbImmagini();
  const risultato = { ...roster, personaggi: { ...(roster?.personaggi || {}) } };
  await Promise.all(Object.entries(risultato.personaggi).map(async ([id, scheda]) => {
    const leggi = (chiave) => new Promise((resolve) => {
      const req = db.transaction(STORE_IMMAGINI, 'readonly').objectStore(STORE_IMMAGINI).get(chiave);
      req.onsuccess = () => resolve(req.result || '');
      req.onerror = () => resolve('');
    });
    const [ritratto, mappaCampagna] = await Promise.all([leggi(`${id}:ritratto`), leggi(`${id}:mappaCampagna`)]);
    risultato.personaggi[id] = {
      ...scheda,
      ...(scheda.ritratto || !ritratto ? {} : { ritratto }),
      ...(scheda.mappaCampagna || !mappaCampagna ? {} : { mappaCampagna }),
    };
  }));
  db.close();
  return risultato;
}

export async function rimuoviImmaginePersonaggio(id, campo) {
  const db = await apriDbImmagini();
  await new Promise((resolve) => {
    const tx = db.transaction(STORE_IMMAGINI, 'readwrite');
    tx.objectStore(STORE_IMMAGINI).delete(`${id}:${campo}`);
    tx.oncomplete = resolve;
    tx.onerror = resolve;
  });
  db.close();
}
