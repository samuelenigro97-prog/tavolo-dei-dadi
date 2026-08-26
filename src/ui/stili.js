// Oggetto `styles` (stili inline) e CSS globale dell'app.
// Estratto da App.jsx: nessuna logica, solo presentazione.
import { C, COLORE_DADO } from './tema.js';

export const styles = {
  app: {
    minHeight: '100vh',
    background: 'transparent', // lo sfondo tematico è sul body (cambia con la classe)
    color: C.ink,
    fontFamily: "Georgia, 'Times New Roman', serif",
    paddingTop: 'max(8px, env(safe-area-inset-top))',
    paddingBottom: 'max(48px, env(safe-area-inset-bottom))',
    paddingLeft: 'max(14px, env(safe-area-inset-left))',
    paddingRight: 'max(14px, env(safe-area-inset-right))',
  },
  header: {
    maxWidth: 1080,
    margin: '0 auto 6px auto',
    padding: '12px 0 8px',
  },
  title: { margin: 0, fontSize: 21, letterSpacing: 1, color: 'var(--c-title)' },
  hint: { margin: '3px 0 0', color: C.inkDim, fontStyle: 'italic', fontSize: 12 },
  main: { maxWidth: 1080, margin: '0 auto' },
  panel: {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    boxSizing: 'border-box',
    boxShadow: '0 1px 4px rgba(60,50,30,0.08)',
  },
  panelTitle: {
    margin: '0 0 12px',
    fontSize: 15,
    color: C.ink,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    // filetto dorato sottile (più caldo e leggero della vecchia riga scura piena)
    borderBottom: `1.5px solid ${C.goldDark}`,
    paddingBottom: 6,
    letterSpacing: 2.5,
  },
  // campo in stile modulo: valore su riga con etichetta sotto
  moduloLabel: {
    fontSize: 9,
    color: C.inkDim,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  moduloCampo: { borderBottom: `1px solid ${C.border}`, minHeight: 18, paddingBottom: 0, width: '100%', display: 'flex', alignItems: 'center' },
  ritratto: {
    width: 132,
    height: 132,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    cursor: 'pointer',
    overflow: 'hidden',
    userSelect: 'none',
  },
  scudo: {
    width: 76,
    height: 84,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: C.panelLight,
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 62%, 50% 100%, 0% 62%)',
    border: `1px solid ${C.border}`,
  },
  // Barra del tiro (sticky in alto)
  rollBar: {
    position: 'sticky',
    top: 'max(4px, env(safe-area-inset-top))',
    zIndex: 10,
    background: C.panel,
    border: `1px solid ${C.gold}`,
    borderRadius: 8,
    padding: '6px 12px',
    marginBottom: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    boxShadow: '0 2px 8px rgba(60,50,30,0.15)',
    minHeight: 38,
  },
  dado: (rolling, crit, fumble, facce = 20) => {
    let clipPath = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'; // default d20 hexagon
    if (facce === 4) clipPath = 'polygon(50% 10%, 95% 90%, 5% 90%)'; // Triangle
    else if (facce === 6) clipPath = 'polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)'; // Square
    else if (facce === 8) clipPath = 'polygon(50% 5%, 95% 50%, 50% 95%, 5% 50%)'; // Diamond
    else if (facce === 10 || facce === 100) clipPath = 'polygon(50% 5%, 95% 35%, 50% 95%, 5% 35%)'; // Kite
    else if (facce === 12) clipPath = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'; // Dodecagon approximation (use hexagon for now)

    return {
      width: 38,
      height: 38,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: facce === 20 ? 16 : 14,
      fontWeight: 'bold',
      color: crit ? C.goldDark : fumble ? C.red : C.ink,
      background: C.panelLight,
      border: `2px solid ${crit ? C.gold : fumble ? C.red : (COLORE_DADO[facce] || COLORE_DADO[20])}`,
      clipPath,
      animation: rolling ? 'd20-spin 0.5s linear infinite' : 'd20-settle 0.35s ease-out',
      userSelect: 'none',
      paddingTop: facce === 4 ? 6 : 0,
    };
  },
  badge: (color) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    border: `1px solid ${color}`,
    color,
    fontSize: 13,
    letterSpacing: 1,
    marginLeft: 8,
  }),
  detail: { color: C.inkDim, fontSize: 13 },
  button: {
    padding: '7px 14px',
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    color: C.ink,
    fontFamily: 'inherit',
    fontSize: 14,
    cursor: 'pointer',
  },
  buttonPrimary: {
    padding: '8px 18px',
    background: C.gold,
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: 15,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  buttonDanger: {
    padding: '4px 10px',
    background: 'transparent',
    border: `1px solid ${C.red}`,
    borderRadius: 6,
    color: C.red,
    fontFamily: 'inherit',
    fontSize: 12,
    cursor: 'pointer',
  },
  buttonMini: {
    padding: '5px 9px',
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.ink,
    fontFamily: 'inherit',
    fontSize: 14,
    lineHeight: 1,
    cursor: 'pointer',
    flexShrink: 0,
  },
  buttonDado: (facce) => ({
    padding: '5px 10px',
    background: COLORE_DADO[facce],
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 'bold',
    cursor: 'pointer',
  }),
  modeButton: (active) => ({
    padding: '5px 12px',
    background: active ? C.ink : 'transparent',
    border: `1px solid ${active ? C.ink : C.border}`,
    borderRadius: 6,
    color: active ? C.bg : C.inkDim,
    fontFamily: 'inherit',
    fontSize: 13,
    cursor: 'pointer',
  }),
  vitalBox: {
    textAlign: 'center',
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 104,
    height: '100%',
    boxSizing: 'border-box',
    paddingTop: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  vitalLabel: {
    position: 'absolute',
    top: 7,
    left: 0,
    right: 0,
    fontSize: 11.5,
    color: C.inkDim,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: 700,
    lineHeight: 1.15,
    textAlign: 'center',
    width: '100%',
  },
  vitalValue: {
    fontSize: 25,
    fontWeight: 800,
    color: C.ink,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    lineHeight: 1.1,
    flexWrap: 'wrap',
    width: '100%',
  },
  abilityBlock: {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: '6px 10px',
    // niente marginBottom: la colonna usa già `gap`, altrimenti lo spazio
    // fra i blocchi risultava doppio e la colonna sforava in basso.
    boxShadow: '0 1px 4px rgba(60,50,30,0.08)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  abilityHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  abilityMod: {
    fontSize: 26,
    fontWeight: 'bold',
    color: C.goldDark,
    cursor: 'pointer',
    padding: '0 8px',
    borderRadius: 8,
  },
  skillRow: (rollable) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '2px 4px',
    borderRadius: 6,
    cursor: rollable ? 'pointer' : 'default',
    fontSize: 14,
  }),
  dot: (livello) => ({
    width: 15,
    height: 15,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    // competenza chiara a colpo d'occhio, con colori a tinta fissa (non legati
    // al tema/ambientazione attivo, altrimenti sotto certi preset finiscono per
    // assomigliarsi): verde = competente, blu = competenza di classe/razza,
    // oro = Maestria/Expertise (doppia competenza), anello tenue = non competente.
    color: livello === 3 ? '#d4af37' : livello === 2 ? '#3a7ca8' : livello === 1 ? '#3e9b4f' : C.inkDim,
    cursor: 'pointer',
    userSelect: 'none',
  }),
  editable: {
    borderBottom: `1px dashed ${C.inkDim}`,
    cursor: 'text',
    minWidth: 24,
    display: 'inline-block',
  },
  inlineInput: {
    background: C.panel,
    border: `1px solid ${C.gold}`,
    borderRadius: 6,
    color: C.ink,
    fontFamily: 'inherit',
    fontSize: 'inherit',
    padding: '1px 4px',
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.ink,
    fontFamily: 'inherit',
    fontSize: 14,
    padding: 8,
    resize: 'vertical',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left',
    color: C.inkDim,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    padding: '5px 8px',
    borderBottom: `1px solid ${C.border}`,
  },
  td: { padding: '7px 8px', borderBottom: `1px solid ${C.border}`, verticalAlign: 'middle' },
  pip: (attivo, colore) => ({
    width: 12,
    height: 12,
    display: 'inline-block',
    margin: '0 2px',
    borderRadius: 3,
    transform: 'rotate(45deg)',
    border: `2px solid ${colore}`,
    background: attivo ? colore : 'transparent',
    cursor: 'pointer',
  }),
};

export const GLOBAL_CSS = `
:root {
  --c-bg: #f4f1ea; --c-panel: #ffffff; --c-panel-light: #f7f4ee;
  --c-border: #ddd5c6; --c-ink: #2b2620; --c-ink-dim: #8d8272;
  --c-gold: #b8860b; --c-gold-dark: #8a6508; --c-red: #b03a2e;
  --c-green: #3e7d32; --c-title: #9e2b25;
}
:root[data-tema="scuro"] {
  --c-bg: #171310; --c-panel: #211b16; --c-panel-light: #2a231c;
  --c-border: #46392b; --c-ink: #e9dfcd; --c-ink-dim: #a0937f;
  --c-gold: #c9a227; --c-gold-dark: #dcb84f; --c-red: #d0685a;
  --c-green: #7fb069; --c-title: #de8f88;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-tema="chiaro"]) {
    --c-bg: #171310; --c-panel: #211b16; --c-panel-light: #2a231c;
    --c-border: #46392b; --c-ink: #e9dfcd; --c-ink-dim: #a0937f;
    --c-gold: #c9a227; --c-gold-dark: #dcb84f; --c-red: #d0685a;
    --c-green: #7fb069; --c-title: #de8f88;
  }
}
html, body {
  margin: 0;
  padding: 0;
  background: ${C.bg};
  -webkit-text-size-adjust: 100%;
}
body {
  -webkit-overflow-scrolling: touch;
}
/* box-sizing coerente: padding e bordi non allargano mai gli elementi
   (evita che i pannelli con width:100% sbordino a destra) */
*, *::before, *::after { box-sizing: border-box; }
/* touch: il doppio tap deve tirare il dado, non zoomare la pagina */
* {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* ===================== SISTEMA GRAFICO UNIFICATO =====================
   Regole di base condivise da TUTTE le sezioni, così menu a tendina, campi e
   bottoni hanno lo stesso aspetto e le stesse interazioni ovunque. */
:root { --raggio-s: 6px; --raggio-m: 8px; --raggio-l: 10px; }

/* Campi modulo (tendine, input, aree di testo): stessa famiglia, stesse
   transizioni e stesso anello di focus dorato in ogni sezione. */
select, input[type="text"], input[type="number"], input[type="search"],
input[type="url"], input[type="tel"], input:not([type]), textarea {
  font-family: inherit;
  color: var(--c-ink);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
select:hover, input:hover, textarea:hover { border-color: var(--c-gold); }
select:focus-visible, input:focus-visible, textarea:focus-visible {
  outline: 2px solid var(--c-gold);
  outline-offset: 1px;
}

/* Menu a tendina: freccia personalizzata IDENTICA su ogni browser e sistema
   operativo (iOS/Safari/Chrome hanno frecce native diverse: qui le uniformiamo).
   !important per prevalere anche sugli sfondi impostati inline sui singoli select. */
select {
  appearance: none !important;
  -webkit-appearance: none !important;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1.5l5 5 5-5' fill='none' stroke='%23998f7a' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/></svg>") !important;
  background-repeat: no-repeat !important;
  background-position: right 9px center !important;
  padding-right: 28px !important;
  cursor: pointer;
}

/* Bottoni: interazione coerente ovunque (focus da tastiera, hover, pressione).
   Non tocchiamo i colori scelti inline: aggiungiamo solo il comportamento. */
button { font-family: inherit; cursor: pointer; transition: filter 0.12s ease, transform 0.05s ease; }
button:focus-visible { outline: 2px solid var(--c-gold); outline-offset: 1px; }
button:not(:disabled):hover { filter: brightness(1.07); }
button:not(:disabled):active { transform: translateY(1px); }
button:disabled { cursor: not-allowed; opacity: 0.55; }
/* ==================================================================== */
/* sezioni collassabili: niente marcatore nativo, freccia che ruota */
.sezione > summary::-webkit-details-marker { display: none; }
.sezione .freccia { display: inline-block; transition: transform 0.15s; font-size: 11px; color: var(--c-ink-dim); }
.sezione:not([open]) .freccia { transform: rotate(-90deg); }
.sezione-titolo {
  display: grid !important;
  grid-template-columns: minmax(28px, 1fr) auto minmax(28px, 1fr);
  align-items: center;
  column-gap: 6px;
}
.sezione-titolo-sinistra { justify-self: start; display: inline-flex; align-items: center; gap: 6px; }
.sezione-titolo-testo { justify-self: center; text-align: center; }
.sezione-titolo-azioni { justify-self: end; display: inline-flex; align-items: center; gap: 6px; }
/* Corpo scheda: le sezioni ora sono a PIENA LARGHEZZA, impilate in verticale.
   L'ordine è controllato con 'order' (Combattimento/Magia prima, poi il resto). */
.griglia-scheda {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.griglia-scheda > * { min-width: 0; }
/* Blocco "Privilegi & Talenti" sotto la Magia: i due box privilegi affiancati,
   Talenti sotto. Su schermi stretti tornano in colonna singola. */
.privilegi-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: stretch; }
.privilegi-duo > * { min-width: 0; }
.privilegi-talenti > .sezione, .privilegi-duo > .sezione { margin-bottom: 0 !important; }
@media (max-width: 720px) { .privilegi-duo { grid-template-columns: 1fr; } }
/* Profilo: caratteristiche (colonna sinistra) e riquadri vitali (colonna
   centrale) vivono nella STESSA griglia. */
.profilo-griglia {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 310px;
  column-gap: 14px;
  row-gap: 12px;
  align-items: stretch;
}
.profilo-col-sinistra {
  grid-column: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.profilo-main {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  height: 100%;
}
.profilo-caratteristiche {
  grid-column: 3;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  height: 100%;
}

/* Tier 1: Sinistra (Ritratto con altezza fissa perfetta a filo Punti Vita), Centro (Anagrafica + Punti Vita), Destra (Forza + Des + Cos) */
.ritratto-tier-1 {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.ritratto-box {
  width: 100%;
  height: 250px;
  min-height: 250px;
  max-height: 250px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ritratto-box img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ritratto-toggle {
  width: 100%; margin: 0 0 6px; padding: 5px 8px; border: 1px solid var(--c-border);
  border-radius: 7px; background: var(--c-panel-light); color: var(--c-title);
  font: 700 12px Georgia, serif; letter-spacing: 1px; text-align: left; cursor: pointer;
}

.pm-tier-1 {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
}
.pm-anagrafica, .pm-pf, .pm-gruppo { min-width: 0; }
.pm-anagrafica { display: flex; flex-direction: column; }
.pm-anagrafica > .campi-anagrafica { flex: 1 1 auto; align-content: space-between; }
.pm-pf { display: flex; flex-direction: column; flex: 1 1 auto; }
.pm-pf > * { width: 100%; flex: 1 1 auto; }

.car-col-fisiche, .car-col-mentali { display: contents; }

.car-tier-1 {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  height: 100%;
}
.car-tier-1 > .blocco-car {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6px 12px;
  min-width: 0;
}
.car-tier-1 > .blocco-car:nth-child(2) {
  flex: 1.3 1 auto;
}
.car-tier-1 > .blocco-car:not(:nth-child(2)) {
  flex: 1 1 auto;
}

/* Tier 2: Competenze, CA/Riposo/Vitali, Intelligenza/Saggezza */
.competenze-tier-2 {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.pm-tier-2 {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.pm-gruppo { display: flex; flex-direction: column; flex: 1 1 auto; }
.pm-gruppo > .vitali { flex: 1 1 auto; height: 100%; }

.car-tier-2 {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  height: 100%;
}
.car-tier-2 > .blocco-car {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6px 12px;
  min-width: 0;
  flex: 1 1 auto;
}

/* Tier 3: Risorse, 3 Box Vitali, Carisma */
.risorse-tier-3 {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.pm-tier-3 {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.car-tier-3 {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  height: 100%;
}
.car-tier-3 > .blocco-car {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6px 12px;
  min-width: 0;
  flex: 1 1 auto;
}

.profilo-col-sinistra .sezione { margin-bottom: 0 !important; }
.profilo-col-sinistra .sezione > summary { font-size: 11.5px !important; letter-spacing: 0.7px !important; white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis; }
.profilo-griglia {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(340px, 1fr) minmax(180px, 310px);
  column-gap: 12px;
  row-gap: 12px;
  align-items: stretch;
}
@media (max-width: 1100px) and (min-width: 840px) {
  .profilo-griglia {
    grid-template-columns: minmax(190px, 240px) minmax(300px, 1fr) minmax(150px, 220px);
    column-gap: 10px;
    row-gap: 10px;
  }
}
@media (max-width: 839px) and (min-width: 660px) {
  .profilo-griglia {
    grid-template-columns: minmax(170px, 210px) minmax(260px, 1fr) minmax(130px, 180px);
    column-gap: 8px;
    row-gap: 8px;
  }
}
@media (max-width: 780px) {
  /* Layout Mobile: ordine esatto richiesto (Nome -> Immagine -> Sesso/Razza/Taglia -> PF -> Quadretti CA/Riposo -> Caratteristiche -> Competenze -> Risorse) */
  .profilo-griglia {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 12px !important;
  }
  .profilo-col-sinistra {
    display: contents !important;
  }
  .profilo-main {
    display: contents !important;
  }
  .pm-tier-1 {
    display: contents !important;
  }
  .pm-anagrafica {
    display: contents !important;
  }

  /* 1. Nome del PG (con selettore) */
  .profilo-nome-box {
    order: 1 !important;
    width: 100% !important;
  }
  /* 2. Immagine / Ritratto sotto il nome */
  .profilo-ritratto-box {
    order: 2 !important;
    width: 100% !important;
  }
  /* 3. Sezione Anagrafica (Sesso, Razza/Specie, Taglia, Allineamento, Background, Classe, Sottoclasse, PE, Multiclasse) */
  .profilo-anagrafica-campi {
    order: 3 !important;
    width: 100% !important;
  }
  /* 4. Sezione Punti Ferita (Barra vita, PF temp, Danni/Cura, Dadi vita, TS Morte) */
  .profilo-pf-box {
    order: 4 !important;
    width: 100% !important;
  }
  /* 5. Altri quadretti vitali (CA, Riposo, Velocità, Iniziativa, Bonus Comp, Sfinimento, Visione, Condizioni, ecc.) */
  .profilo-vitali-box,
  .pm-vitali-container,
  .pm-tier-2,
  .pm-tier-3 {
    order: 5 !important;
    width: 100% !important;
  }
  /* 6. Punteggi Caratteristica (FOR, DES, COS a SX | INT, SAG, CAR a DX) */
  .profilo-caratteristiche-box {
    order: 6 !important;
    width: 100% !important;
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
    align-items: start !important;
  }
  .car-col-fisiche {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    width: 100% !important;
  }
  .car-col-mentali {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    width: 100% !important;
  }
  .car-col-fisiche .car-tier-1,
  .car-col-mentali .car-tier-2,
  .car-col-mentali .car-tier-3 {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    width: 100% !important;
    height: auto !important;
  }
  .car-col-fisiche .blocco-car,
  .car-col-mentali .blocco-car {
    width: 100% !important;
    box-sizing: border-box !important;
  }
  /* 7. Competenze (Armature, Armi, Strumenti, Lingue) */
  .profilo-competenze-box {
    order: 7 !important;
    width: 100% !important;
  }
  /* 8. Risorse di classe */
  .profilo-risorse-box {
    order: 8 !important;
    width: 100% !important;
  }

  .ritratto-box { min-height: 240px; height: 240px; }
  .car-coppia { gap: 8px; }
}
.vitali { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: 1fr; gap: 8px; align-items: stretch; }
/* 4 riquadri vitali separati (Visione, Perc. Passiva, Resistenze, Condizioni) identici alla riga sopra */
.vitali-sezioni-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: 1fr; gap: 8px; align-items: stretch; width: 100%; }
.vitali-sezioni-4 > * { min-width: 0; }
@media (max-width: 768px) {
  .vitali-sezioni-4 { grid-template-columns: repeat(2, 1fr); }
}
/* consente ai riquadri di stringersi sotto la larghezza del contenuto (niente overflow) */
.vitali > *, .vitali-sezioni-4 > * { min-width: 0; }
.vitali > * > *, .vitali-sezioni-4 > * > * { min-width: 0; }
/* Fascia dettagli incantesimo: scorre in orizzontale su una riga; scrollbar sottile. */
.spell-chips { scrollbar-width: thin; }
.spell-chips::-webkit-scrollbar { height: 5px; }
.spell-chips::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 3px; }
/* i campi anagrafica (con le tendine): font piccolo, padding compatto, allineati in basso */
.campi-anagrafica > * { min-width: 0; display: flex; flex-direction: column; justify-content: flex-end; }
.campi-anagrafica select { max-width: 100%; font-size: 11px !important; padding: 1px 15px 1px 3px !important; height: 20px; line-height: 1.2; background-position: right 3px center !important; background-size: 8px !important; }
.campi-anagrafica .campo-modulo-box { padding: 0 4px !important; min-height: 28px !important; height: 28px; display: flex; align-items: center; overflow: hidden; }
.campi-anagrafica .campo-modulo-label { font-size: 9px !important; margin-top: 2px; }
/* Sottoclasse con più classi (multiclasse): una riga per classe, l'altezza fissa
    da campo singolo taglierebbe via le righe in più. */
.campi-anagrafica .campo-modulo-box.sottoclasse-multi { height: auto !important; align-items: flex-start !important; overflow: visible !important; padding-top: 2px !important; padding-bottom: 2px !important; }
/* Classe con multiclasse (triclasse): "Guerriero + Ranger + Ladro" è lungo e andrebbe troncato */
.campi-anagrafica .campo-modulo-box.classe-multi { height: auto !important; min-height: 28px !important; overflow: visible !important; padding-top: 2px !important; padding-bottom: 2px !important; align-items: flex-start !important; }
.campi-anagrafica .campo-modulo-box.classe-multi div { white-space: normal !important; word-break: break-word; line-height: 1.3; }
.selettore-personaggio {
  width: 100%;
  margin: 0 0 8px 0 !important;
}
/* testata: titolo centrato in alto, i due gruppi di pulsanti sotto (ciascuno una
   griglia ordinata). Su desktop MOLTO largo i pulsanti passano in colonna a
   sinistra (vedi @media min-width:1440px), lasciando spazio verticale in cima. */
.app-header { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.app-header-title {
  text-align: center; white-space: nowrap; margin: 0;
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
}
.app-header-title-desktop { display: inline; }
.app-header-title-mobile { display: none; }
/* Il titolo sta sopra la FOTO dell'ambientazione, non sopra un pannello: una
   sola ombra da 1px non bastava e il testo spariva sui punti scuri della foto
   (tronchi, rocce). Un alone del colore del pannello, ripetuto su più raggi,
   stacca le lettere da qualunque sfondo in entrambi i temi. */
.app-header-nome {
  padding: 3px 14px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--c-panel) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-border) 65%, transparent);
  text-shadow: 0 1px 0 color-mix(in srgb, var(--c-panel) 70%, transparent);
}
.app-version {
  display: inline-flex; align-items: center; justify-content: center; min-height: 22px;
  padding: 3px 9px;
  border: 1px solid color-mix(in srgb, var(--c-border) 75%, transparent);
  border-radius: 999px; background: color-mix(in srgb, var(--c-panel) 82%, transparent);
  color: var(--c-ink-dim); font: 600 12px/1 Georgia, serif; letter-spacing: .35px;
}
/* Tutti i tasti su UNA riga sotto il titolo: i gruppi si sciolgono con
   display:contents, così i bottoni sono figli diretti della riga. */
.app-header-side {
  display: flex; flex-wrap: wrap; gap: 6px;
  justify-content: center; align-items: stretch; width: 100%;
}
.app-header-side .app-header-group,
.app-header-side .app-header-language,
.app-header-side .game-actions-dock { display: contents; }
.app-header-side .app-header-group > button,
.app-header-side .game-actions-btn {
  flex: 1 1 0; min-width: 92px; width: auto; max-width: none; min-height: 32px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
/* Freccia per ridurre il ritratto: dentro l'immagine, in alto a sinistra. */
.ritratto-collassa {
  position: absolute; top: 6px; left: 6px; z-index: 2;
  width: 24px; height: 24px; padding: 0; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  border-radius: 6px; cursor: pointer;
  border: 1px solid var(--c-gold-dark);
  background: rgba(0,0,0,0.45); color: #fff; font-size: 13px;
}
.ritratto-collassa:hover { background: rgba(0,0,0,0.65); }
.app-header-group { display: grid; gap: 6px; min-width: 0; align-content: start; }
.app-header-group:first-of-type { grid-template-columns: repeat(3, minmax(0, 1fr)); width: 100%; max-width: 380px; }
.app-header-language { grid-template-columns: 1fr; width: 100%; max-width: 100px; }
.app-header-group > button {
  width: 100%; display: inline-flex; align-items: center; justify-content: center;
  gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  background: var(--c-panel-light) !important; color: var(--c-ink) !important;
  border-color: var(--c-gold-dark) !important;
  border-radius: 8px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.09);
  transition: filter .15s ease, transform .1s ease, box-shadow .15s ease;
}
/* schermata di caricamento dal cloud: nuvola che pulsa e barra che scorre */
.cloud-spinner { animation: cloud-bob 1.4s ease-in-out infinite; }
@keyframes cloud-bob { 0%,100% { transform: translateY(0); opacity: 0.85; } 50% { transform: translateY(-8px); opacity: 1; } }
.cloud-bar { width: 40%; animation: cloud-slide 1.1s ease-in-out infinite; }
@keyframes cloud-slide { 0% { margin-left: -40%; } 100% { margin-left: 100%; } }
.app-header-group { flex: 0 0 auto; }
.game-actions-dock {
  width: 100%; max-width: 380px;
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px;
}
.game-actions-btn {
  width: 100%; min-width: 0;
  min-height: 32px; padding: 5px 12px;
  border: 1px solid var(--c-gold-dark); background: var(--c-panel-light);
  color: var(--c-ink); font-family: inherit; font-size: 13px; font-weight: normal;
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.09);
  transition: filter .15s ease, transform .1s ease, box-shadow .15s ease;
}
.game-actions-btn:hover { filter: brightness(1.08); }
.app-header-group > button:not(:disabled):active,
.game-actions-btn:not(:disabled):active { box-shadow: inset 0 1px 3px rgba(0,0,0,.2); }
.game-action-combat-short { display: none; }
.ts-morte-box { align-items: center; }
.ts-morte-controlli {
  display: grid; gap: 5px; width: max-content; margin: 2px auto 0;
  font-size: 11px;
}
.ts-morte-riga {
  display: grid; grid-template-columns: 14px repeat(3, 15px);
  align-items: center; justify-items: center; column-gap: 5px;
}
.ts-morte-riga input[type="checkbox"] {
  width: 14px; height: 14px; margin: 0;
}
.ts-morte-reset { display: block !important; margin: 5px auto 0 !important; }
@media (max-width: 780px) {
  .app-header-title-desktop { display: none !important; }
  .app-header-title-mobile { display: inline !important; font-weight: 800; }
  .spell-filters { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .spell-filters > input:first-child { grid-column: 1 / -1; }
  /* schermo medio: titolo centrato in prima riga, poi i due gruppi di bottoni
     allineati sulle due righe successive ciascuno a piena larghezza */
  .app-header { display: flex; flex-direction: column; align-items: stretch; }
  .app-header-title { order: -1; text-align: center; margin-bottom: 4px !important; }
  .app-header-group:first-of-type,
  .app-header-language { max-width: none !important; width: 100% !important; justify-self: stretch !important; }
  .app-header-group:first-of-type { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .app-header-language { grid-template-columns: 1fr; max-width: 100px !important; align-self: center; }
}
@media (max-width: 560px) {
  /* Magia: il selettore della caratteristica non condivide più la riga del
     titolo. Prima la griglia a tre colonne lo faceva sovrapporre a “Magia”. */
  .sezione-magia > .sezione-titolo {
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-rows: auto auto;
  }
  .sezione-magia .sezione-titolo-sinistra { grid-column: 1; grid-row: 1; }
  .sezione-magia .sezione-titolo-testo { grid-column: 2; grid-row: 1; justify-self: center; }
  .sezione-magia .sezione-titolo-azioni {
    grid-column: 1 / -1; grid-row: 2; justify-self: stretch; width: 100%;
  }
  .magia-caratteristica { justify-content: space-between; width: 100%; }
  .magia-caratteristica select { flex: 1 1 150px; min-width: 0; max-width: 210px; }
  /* su schermi stretti: titolo su una riga sopra, poi ciascun gruppo di pulsanti
     su una propria riga a piena larghezza, centrata e ordinata */
  .app-header { display: flex; flex-direction: column; align-items: stretch; }
  .app-header-title { grid-column: auto; justify-self: auto; order: -1; margin-bottom: 6px !important; }
  /* Telefono: tutti i tasti in alto in una sola riga compatta da 7 pulsanti, solo icone. */
  .app-header-side {
    display: grid; grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px; align-items: stretch; width: 100%;
  }
  .app-header-side .app-header-group,
  .app-header-side .app-header-language,
  .app-header-side .game-actions-dock { display: contents; }
  .app-header-side .header-label { display: none; }
  .app-header-side .app-header-group > button,
  .app-header-side .game-actions-btn {
    width: 100%; min-width: 0 !important; max-width: none; box-sizing: border-box;
    min-height: 32px; padding: 4px 1px !important; font-size: 16px !important;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .app-shell { padding-left: 8px !important; padding-right: 8px !important; overflow-x: clip; }
  .game-action-combat-full { display: none; }
  .game-action-combat-short { display: inline; }
  /* dadi: pulsanti compatti e leggibili su telefono in riga singola */
  .dadi-riga { justify-content: space-between; flex-wrap: wrap !important; gap: 4px !important; }
  .dadi-riga .dado-btn { flex: 0 0 auto; min-width: 28px !important; width: 28px !important; height: 28px !important; padding: 0 !important; text-align: center; }
  .dadi-riga .dadi-espressione { flex: 1 1 90px !important; max-width: none !important; margin-left: 0 !important; }
  /* modalità di tiro: riga intera a 4 colonne uguali a tutta larghezza */
  .dadi-riga .dadi-modi {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    flex: 1 1 100% !important;
    width: 100% !important;
    max-width: 100% !important;
    margin-left: 0 !important;
    gap: 4px !important;
    box-sizing: border-box !important;
  }
  .dadi-riga .dadi-modi button {
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    padding: 6px 2px !important;
    text-align: center !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }
  /* tabelle incantesimi più compatte sul telefono: celle strette così i
     tasti azione (✎ 🗑) restano visibili senza scorrere in orizzontale */
  .spell-table { font-size: 12px; }
  .spell-table th, .spell-table td { padding: 5px 4px !important; }
  .spell-row { flex-wrap: wrap !important; min-width: 0; }
  .spell-row > button:first-child { max-width: calc(100% - 88px); overflow: hidden; text-overflow: ellipsis; }
  .spell-row .spell-chips { order: 5; flex: 1 1 100% !important; width: 100%; }
  .spell-rolls { order: 3; margin-left: auto; max-width: 100%; }
  .spell-actions { order: 4; }
  /* nomi lunghi (es. "Prestidigitazione") vanno a capo invece di allargare
     la tabella e spingere i tasti azione fuori schermo */
  .spell-table td:first-child button { white-space: normal !important; overflow-wrap: anywhere; }
  /* monete: su telefono 5 colonne sarebbero illeggibili, si passa a 3 */
  .griglia-monete { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  /* tabella attacchi: su mobile ogni arma/azione diventa una scheda comoda con i pulsanti dado ben visibili */
  .attacchi-table, .attacchi-table tbody { display: block; width: 100%; }
  .attacchi-table thead { display: none; }
  .attacchi-table .attacchi-riga {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 6px 10px;
    margin: 0 0 10px;
    padding: 10px 12px;
    border: 1px solid var(--c-border);
    border-radius: 9px;
    background: color-mix(in srgb, var(--c-panel-light) 88%, transparent);
    box-shadow: 0 1px 4px rgba(0,0,0,.08);
  }
  .attacchi-table .attacchi-riga > td {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: 2px 0 !important;
    border: 0 !important;
  }
  .attacchi-table .attacchi-riga > .attacchi-nome {
    grid-column: 1;
    grid-row: 1;
    font-weight: 700;
  }
  .attacchi-table .attacchi-riga > .attacchi-azioni {
    grid-column: 2;
    grid-row: 1;
    justify-content: flex-end;
  }
  .attacchi-table .attacchi-riga > .attacchi-bonus {
    grid-column: 1;
    grid-row: 2;
    justify-content: flex-start;
  }
  .attacchi-table .attacchi-riga > .attacchi-danno {
    grid-column: 2;
    grid-row: 2;
    justify-content: flex-start;
  }
  .attacchi-table .attacchi-riga > .attacchi-note {
    grid-column: 1 / -1;
    grid-row: 3;
    width: 100%;
    padding-top: 4px !important;
    border-top: 1px dashed var(--c-border) !important;
  }
  .attacchi-table .attacchi-riga > td:not(.attacchi-nome):not(.attacchi-azioni)::before {
    content: attr(data-label);
    margin-right: 6px;
    color: var(--c-ink-dim);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .4px;
  }
  /* Inventario: sul telefono ogni oggetto diventa una scheda leggibile. Non si
     perde alcuna colonna e non serve trascinare lateralmente la tabella. */
  .inventario-wrap { overflow-x: visible !important; }
  .inventario-table, .inventario-table tbody { display: block; width: 100%; }
  .inventario-table thead { display: none; }
  .inventario-table .inventario-riga {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) auto;
    align-items: center; gap: 3px 8px;
    margin: 0 0 8px; padding: 8px;
    border: 1px solid var(--c-border); border-radius: 9px;
    background: color-mix(in srgb, var(--c-panel-light) 84%, transparent);
    box-shadow: 0 1px 3px rgba(0,0,0,.1);
  }
  .inventario-table .inventario-riga > td {
    display: flex; align-items: center; min-width: 0;
    padding: 3px 2px !important; border: 0 !important;
  }
  .inventario-table .inventario-riga > td:nth-child(1) { grid-column: 1; grid-row: 1; justify-content: center; }
  .inventario-table .inventario-riga > td:nth-child(2) { grid-column: 2 / 4; grid-row: 1; font-weight: 700; }
  .inventario-table .inventario-riga > td:nth-child(2) > * { max-width: 100%; }
  .inventario-table .inventario-riga > td:nth-child(3) { grid-column: 1; grid-row: 2; justify-content: center; }
  .inventario-table .inventario-riga > td:nth-child(4) { grid-column: 2; grid-row: 2; justify-content: flex-start; }
  .inventario-table .inventario-riga > td:nth-child(5) { grid-column: 3; grid-row: 2; justify-content: flex-end; }
  .inventario-table .inventario-riga > .inventario-azioni {
    grid-column: 1 / -1; grid-row: 3; justify-content: flex-end;
    padding-top: 6px !important; border-top: 1px solid var(--c-border) !important;
  }
  .inventario-table .inventario-riga > td:nth-child(n+3):not(.inventario-azioni)::before {
    content: attr(data-label); margin-right: 4px; color: var(--c-ink-dim);
    font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px;
  }
  .inventario-table .inventario-riga > .inventario-azioni button { min-width: 32px; min-height: 30px; }
  .inventario-table tr:not(.inventario-riga) { display: block; margin: -8px 0 8px; }
  .inventario-table tr:not(.inventario-riga) td[colspan] { display: block; width: auto; padding: 8px !important; }
}
@media (max-width: 820px) {
  .griglia-scheda { grid-template-columns: 1fr; }
  .selettore-personaggio { width: 100%; }
}
@media (max-width: 560px) {
  .selettore-personaggio {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
    width: 100% !important;
    padding: 8px !important;
  }
  .selettore-personaggio > div:first-of-type {
    width: 100% !important;
    flex: 1 1 100% !important;
  }
  .selettore-personaggio-azioni {
    display: flex !important;
    width: 100% !important;
    justify-content: center !important;
    gap: 6px !important;
    align-items: center !important;
    flex-wrap: wrap !important;
  }
  .selettore-personaggio-azioni button {
    flex: 0 0 36px !important;
    width: 36px !important;
    min-width: 36px !important;
    max-width: 36px !important;
    height: 36px !important;
    min-height: 36px !important;
    max-height: 36px !important;
    padding: 0 !important;
    font-size: 16px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 8px !important;
  }
  .selettore-divisore {
    display: inline-block !important;
    width: 1px !important;
    height: 22px !important;
    margin: 0 2px !important;
    background: var(--c-gold-dark, #b8860b) !important;
    opacity: 0.5 !important;
  }
  .anagrafica > div:last-child > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
  /* su telefono i riquadri anagrafica e vitali passano a 2 colonne (leggibili,
     niente 5 colonne schiacciate); le altezze non sono più forzate uguali */
  .campi-anagrafica { grid-template-columns: repeat(2, 1fr) !important; }
  .vitali { grid-template-columns: repeat(2, 1fr) !important; grid-auto-rows: auto !important; }
  /* niente riquadri a doppia colonna su mobile: griglia 2×N perfettamente uniforme */
  .vitali > * { grid-column: auto !important; }
}
/* su mobile i campi con font < 16px fanno zoomare iOS al focus */
@media (max-width: 820px) {
  input, select, textarea { font-size: 16px !important; }
}
@keyframes d20-spin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.12); }
  100% { transform: rotate(360deg) scale(1); }
}
@keyframes d20-settle {
  0% { transform: scale(1.25); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
/* elementi tirabili: tenendo premuto NON deve partire la selezione del testo
   (React non aggiunge i prefissi, Safari iOS/Mac richiede -webkit-user-select) */
.tirabile {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}
/* elemento "in carica" mentre tieni premuto: trema come un dado in mano */
.carica { animation: carica-dado 0.4s ease-in-out infinite; color: ${C.goldDark} !important; }
@keyframes carica-dado {
  0% { transform: rotate(-4deg) scale(1.08); }
  50% { transform: rotate(4deg) scale(1.14); }
  100% { transform: rotate(-4deg) scale(1.08); }
}
/* pulsante "Aggiorna" quando c'è una nuova versione: lampeggia di verde */
.aggiorna-pronto {
  animation: aggiorna-lampeggia 1.1s ease-in-out infinite;
  font-weight: bold;
}
@keyframes aggiorna-lampeggia {
  0%, 100% { background: transparent; border-color: #2e8b57; color: #2e8b57; box-shadow: 0 0 0 rgba(46,139,87,0); }
  50% { background: #2e8b57; border-color: #2e8b57; color: #fff; box-shadow: 0 0 12px 2px rgba(46,139,87,0.75); }
}

/* Pulsante Notifiche lampeggiante con colore Oro/Ambra coordinato con Cloud e Versione D&D */
.btn-notifiche-lampeggia {
  animation: notifiche-oro-lampeggia 1.6s ease-in-out infinite !important;
  color: var(--c-gold-dark, #c07718) !important;
  border-color: var(--c-gold-dark, #c07718) !important;
}
@keyframes notifiche-oro-lampeggia {
  0%, 100% {
    border-color: var(--c-gold-dark, #c07718);
    box-shadow: 0 0 0 0 rgba(192, 119, 24, 0);
  }
  50% {
    border-color: var(--c-gold, #f0c43f);
    box-shadow: 0 0 10px 2px rgba(240, 196, 63, 0.65);
    background: rgba(240, 196, 63, 0.12);
  }
}
@media (prefers-reduced-motion: reduce) {
  .btn-notifiche-lampeggia { animation: none !important; }
}

/* Puntino di notifica sul pulsante Avvisi: lampeggia finché c'è qualcosa da
   vedere (promemoria di backup, controlli sulla scheda, novità non lette). */
.avvisi-pallino {
  /* In linea dentro il pulsante e non in posizione assoluta fuori dal bordo:
     i pulsanti dell'intestazione hanno overflow:hidden per l'ellissi, quindi
     un pallino sporgente veniva tagliato a metà. */
  min-width: 16px; height: 16px; padding: 0 4px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 999px; flex-shrink: 0;
  background: var(--c-gold-dark, #c07718); color: #fff;
  font: 700 10px/1 Georgia, serif;
  animation: avvisi-lampeggia 1.4s ease-in-out infinite;
}
@keyframes avvisi-lampeggia {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(192, 119, 24, 0.6); }
  50% { transform: scale(1.15); box-shadow: 0 0 0 5px rgba(192, 119, 24, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .avvisi-pallino { animation: none; }
}

/* Nuvoletta / Tooltip Globale al passaggio del cursore */
.nuvoletta-tooltip {
  position: fixed;
  z-index: 999999;
  pointer-events: none;
  background: var(--c-panel-light, #261c14);
  color: var(--c-title, #f6efe2);
  border: 1.5px solid var(--c-gold-dark, #c07718);
  box-shadow: 0 6px 20px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.3);
  border-radius: 8px;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
  max-width: 320px;
  white-space: pre-wrap;
  text-align: center;
  user-select: none;
  animation: nuvoletta-anim 0.12s cubic-bezier(0.16, 1, 0.3, 1);
}
:root[data-tema="chiaro"] .nuvoletta-tooltip {
  background: #fcf6eb;
  color: #2b1f13;
  box-shadow: 0 6px 20px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08);
}
@keyframes nuvoletta-anim {
  from { opacity: 0; transform: translate(-50%, -85%) scale(0.95); }
  to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
}

/* Nuvoletta "Bonus dato da": tooltip INVERTITO rispetto al tema, così
   risalta sempre. Un fondo scuro su tema scuro spariva contro lo sfondo
   della pagina (contrasto 1.02) proprio quando la nuvoletta cadeva nello
   spazio fra due riquadri: sembrava trasparente. */
.popover-fonte {
  background: #241c12;
  color: #f6efe2;
  border: 1px solid #241c12;
  box-shadow: 0 8px 22px rgba(0,0,0,0.45);
}
.popover-fonte .popover-titolo { color: #cbbfa6; }
:root[data-tema="scuro"] .popover-fonte {
  background: #f3ead9;
  color: #241c12;
  border-color: #f3ead9;
  box-shadow: 0 8px 22px rgba(0,0,0,0.75);
}
:root[data-tema="scuro"] .popover-fonte .popover-titolo { color: #6b5c42; }

/* ------------------------------------------------------------------ */
/* STAMPA / PDF                                                        */
/* "Stampa" del browser (o "Salva come PDF") produce la sola scheda:   */
/* via comandi interattivi, sfondi scenografici e tema scuro, che su   */
/* carta sprecherebbero inchiostro e renderebbero il testo illeggibile. */
@media print {
  /* Sempre fondo bianco e testo nero, anche se a schermo è notte.
     Le variabili sono impostate inline su :root da App.jsx (style.setProperty),
     quindi qui serve !important: un foglio di stile non batte uno stile inline. */
  :root, :root[data-tema="scuro"], :root[data-tema="chiaro"] {
    --c-bg: #ffffff !important; --c-panel: #ffffff !important; --c-panel-light: #fbfbfb !important;
    --c-border: #888888 !important; --c-ink: #000000 !important; --c-ink-dim: #333333 !important;
    --c-gold: #4a3900 !important; --c-gold-dark: #2a2000 !important; --c-title: #000000 !important;
    --c-green: #1a6b2a !important; --c-red: #8b0000 !important;
  }
  html, body {
    background: #fff !important;
    color: #000 !important;
    font-size: 11pt !important;
    line-height: 1.35 !important;
  }
  /* Gli sfondi a tema vivono su pseudo-elementi del body: via anche quelli. */
  body::before, body::after { display: none !important; }
  .app-shell { padding: 0 !important; max-width: 100% !important; }

  /* Comandi, barre, dock, modali e overlay non hanno senso su carta. */
  .no-stampa,
  .app-header,
  .app-header-side,
  .dadi-riga,
  .barra-tiro,
  .cloud-bar,
  .game-actions-dock,
  .app-version,
  .inventario-azioni,
  .col-azioni,
  .add-spell,
  .ts-morte-reset,
  .inc-prep-toggle,
  .tag-rapidi-diario,
  button:not(.stampa-inclusa) { display: none !important; }

  /* Impaginazione pulita: nessun pannello spezzato a metà */
  .scheda-sezione,
  .blocco-car,
  .blocco-sezione,
  .inventario-wrap,
  .inventario-riga,
  .privilegi-duo,
  .inc-livello-box,
  .attacco-card {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    box-shadow: none !important;
  }

  .profilo-card {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    margin-bottom: 12px !important;
  }

  .app-shell * {
    box-shadow: none !important;
    text-shadow: none !important;
  }

  /* Tabelle nitide con bordi chiari */
  table {
    border-collapse: collapse !important;
    width: 100% !important;
  }
  th, td {
    border-color: #999 !important;
    padding: 3px 6px !important;
  }

  /* I campi editabili, su carta, sono testo normale e non caselle. */
  input, select, textarea {
    border: none !important;
    background: transparent !important;
    color: #000 !important;
    -webkit-appearance: none;
    appearance: none;
    padding: 0 !important;
  }

  @page {
    size: A4 portrait;
    margin: 10mm 12mm;
  }
}
`;
