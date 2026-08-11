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
