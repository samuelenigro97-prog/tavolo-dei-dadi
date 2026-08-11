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
