// Posizionamento delle nuvolette "Bonus dato da" (fonte di un bonus ai Tiri
// Salvezza o a un punteggio di caratteristica). Funzioni pure, così il
// comportamento su schermo stretto è verificabile dai test senza browser.

/**
 * Calcola la posizione della nuvoletta a partire dal rettangolo del pulsante
 * cliccato. Si ancora al bordo DESTRO invece di usare translateX(-100%): così
 * su uno schermo stretto la nuvoletta non può finire fuori dallo schermo, e
 * con un nome lungo il testo va a capo invece di sbordare. Se sotto non c'è
 * spazio (pulsante in fondo allo schermo) si apre verso l'alto.
 */
export function posizionePopover(r, vista = { innerWidth: 1024, innerHeight: 768 }) {
  const margine = 8;
  const destra = Math.max(margine, vista.innerWidth - r.right);
  // Header: sempre sotto (r.top < 80) per evitare salto sopra→sotto
  if (r.top < 80) return { destra, top: r.bottom + 4 };
  const spazioSotto = vista.innerHeight - r.bottom;
  return spazioSotto > 110
    ? { destra, top: r.bottom + 4 }
    : { destra, bottom: Math.max(margine, vista.innerHeight - r.top + 4) };
}

/** Traduce la posizione calcolata sopra in stili inline. */
export function stilePopover(p) {
  return {
    right: p.destra,
    ...(p.top != null ? { top: p.top } : { bottom: p.bottom }),
    maxWidth: 'calc(100vw - 16px)',
    minWidth: 150,
  };
}
