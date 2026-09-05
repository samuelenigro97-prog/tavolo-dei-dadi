// Oggetto `styles` (stili inline) e CSS globale dell'app.
// Estratto da App.jsx: nessuna logica, solo presentazione.
import { C, COLORE_DADO } from './tema.js';

export const styles = {
  ambientBg: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -1,
    pointerEvents: 'none',
    transform: 'translate3d(0, 0, 0)',
    WebkitTransform: 'translate3d(0, 0, 0)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    willChange: 'transform',
  },
  app: {
    minHeight: '100vh',
    background: 'transparent', // lo sfondo tematico vive nel layer fisso GPU
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
    boxShadow: 'var(--c-shadow-aura, 0 1px 3px rgba(60,50,30,0.06), 0 4px 12px rgba(60,50,30,0.04))',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  },
  panelTitle: {
    margin: '0 0 12px',
    fontSize: 15,
    color: C.ink,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    borderTop: 'none',
    borderBottom: 'none',
    paddingTop: 2,
    paddingBottom: 4,
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
  moduloCampo: { border: `1px solid ${C.border}`, borderRadius: 6, background: 'transparent', minHeight: 22, padding: '3px 6px', width: '100%', display: 'flex', alignItems: 'center', boxSizing: 'border-box' },
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
  // Barra del tiro (sticky in alto sotto la barra fissa)
  rollBar: {
    position: 'sticky',
    top: 'max(46px, calc(env(safe-area-inset-top) + 42px))',
    zIndex: 1100,
    background: 'linear-gradient(135deg, var(--c-panel, #24201d) 0%, var(--c-panel-light, #2e2824) 100%)',
    border: `1.5px solid ${C.gold}`,
    borderRadius: 10,
    padding: '8px 14px',
    marginBottom: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    boxShadow: '0 8px 24px -2px rgba(0,0,0,0.45), 0 0 14px rgba(212,175,55,0.22), inset 0 1px 1px rgba(255,255,255,0.12)',
    minHeight: 38,
    backdropFilter: 'blur(8px)',
  },
  dado: (rolling, crit, fumble, facce = 20) => {
    let clipPath = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'; // default d20 hexagon
    if (facce === 4) clipPath = 'polygon(50% 10%, 95% 90%, 5% 90%)'; // Triangle
    else if (facce === 6) clipPath = 'polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)'; // Square
    else if (facce === 8) clipPath = 'polygon(50% 5%, 95% 50%, 50% 95%, 5% 50%)'; // Diamond
    else if (facce === 10 || facce === 100) clipPath = 'polygon(50% 5%, 95% 35%, 50% 95%, 5% 35%)'; // Kite
    else if (facce === 12) clipPath = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'; // Dodecagon approximation (use hexagon for now)

    const bgDado = crit
      ? 'radial-gradient(circle at 35% 35%, #fff9db 0%, #ffd700 45%, #b8860b 85%, #7a5800 100%)'
      : fumble
      ? 'radial-gradient(circle at 35% 35%, #ffcdd2 0%, #e53935 50%, #880e4f 90%, #310000 100%)'
      : 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15) 0%, var(--c-panel-light, #2f2a24) 60%, var(--c-panel, #1f1b18) 100%)';

    const textDado = crit ? '#2a1a00' : fumble ? '#ffffff' : C.ink;
    const borderDado = crit ? '#ffd700' : fumble ? '#ff1744' : (COLORE_DADO[facce] || COLORE_DADO[20]);
    const glowDado = crit
      ? '0 0 16px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.4)'
      : fumble
      ? '0 0 16px rgba(255, 23, 68, 0.8), 0 0 28px rgba(183, 28, 28, 0.5)'
      : `0 0 8px ${COLORE_DADO[facce] || COLORE_DADO[20]}55`;

    return {
      width: 42,
      height: 42,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: facce === 20 ? 18 : 15,
      fontWeight: 'bold',
      color: textDado,
      background: bgDado,
      border: `2px solid ${borderDado}`,
      boxShadow: glowDado,
      clipPath,
      animation: rolling ? 'd20-spin 0.5s linear infinite' : 'd20-settle 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      userSelect: 'none',
      paddingTop: facce === 4 ? 6 : 0,
      fontVariantNumeric: 'tabular-nums',
      textShadow: crit ? '0 1px 0 rgba(255,255,255,0.6)' : fumble ? '0 1px 3px rgba(0,0,0,0.9)' : 'none',
      transform: (crit || fumble) && !rolling ? 'scale(1.1)' : 'none',
      transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
    };
  },
  badge: (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 9px',
    borderRadius: 12,
    border: `1px solid ${color}88`,
    color,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    marginLeft: 6,
    fontVariantNumeric: 'tabular-nums',
    background: `${color}18`,
    boxShadow: `0 0 8px ${color}33`,
    backdropFilter: 'blur(4px)',
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
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
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
    boxShadow: '0 2px 6px rgba(184, 134, 11, 0.25)',
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
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
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
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
    transition: 'all 0.12s ease',
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
    boxShadow: `0 2px 6px ${COLORE_DADO[facce]}40`,
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
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
    transition: 'all 0.15s ease',
  }),
  vitalBox: {
    textAlign: 'center',
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: '8px 8px 10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: 104,
    height: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(60,50,30,0.05)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  vitalLabel: {
    fontSize: 12,
    color: C.inkDim,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: 'center',
    width: '100%',
    margin: 0,
    marginBottom: 6,
    flexShrink: 0,
    userSelect: 'none',
    display: 'block',
  },
  vitalValue: {
    fontSize: 27,
    fontWeight: 800,
    color: C.ink,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    lineHeight: 1.15,
    flexWrap: 'wrap',
    width: '100%',
    fontVariantNumeric: 'tabular-nums',
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
    fontVariantNumeric: 'tabular-nums',
    transition: 'transform 0.1s ease, color 0.15s ease',
  },
  skillRow: (rollable) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '2px 4px',
    borderRadius: 6,
    cursor: rollable ? 'pointer' : 'default',
    fontSize: 14,
    transition: 'background-color 0.12s ease',
  }),
  dot: (livello) => ({
    width: 16,
    height: 16,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: livello === 3 ? 16 : livello === 2 ? 14 : 15,
    // competenza chiara a colpo d'occhio con bagliore arcano e rune cesellate:
    // oro = Maestria/Expertise (✦), azzurro = classe/razza (★), verde = competente (●), tenue = non competente (○).
    color: livello === 3 ? '#ffd700' : livello === 2 ? '#38bdf8' : livello === 1 ? '#4ade80' : C.inkDim,
    textShadow: livello === 3 ? '0 0 6px rgba(255, 215, 0, 0.75)' : livello === 2 ? '0 0 5px rgba(56, 189, 248, 0.65)' : livello === 1 ? '0 0 4px rgba(74, 222, 128, 0.55)' : 'none',
    filter: livello > 0 ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))' : 'none',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s ease, text-shadow 0.15s ease',
  }),
  editable: {
    borderBottom: `1px dashed ${C.inkDim}`,
    cursor: 'text',
    minWidth: 24,
    display: 'inline-block',
  },
  inlineInput: {
    background: C.panel,
    border: `1px solid ${C.border}`,
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
    fontVariantNumeric: 'tabular-nums',
  },
  td: { padding: '7px 8px', borderBottom: `1px solid ${C.border}`, verticalAlign: 'middle', fontVariantNumeric: 'tabular-nums' },
  pip: (attivo, colore) => ({
    width: 12,
    height: 12,
    display: 'inline-block',
    margin: '0 2px',
    borderRadius: 3,
    transform: 'rotate(45deg)',
    border: `2px solid ${colore}`,
    background: attivo ? colore : 'transparent',
    boxShadow: attivo ? `0 0 6px ${colore}88` : 'none',
    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
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
html {
  margin: 0;
  padding: 0;
  background: var(--c-bg, #f4f1ea);
  -webkit-text-size-adjust: 100%;
  max-width: 100vw;
  overflow-x: clip;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
body {
  margin: 0;
  padding: 0;
  background: transparent;
  max-width: 100vw;
  overflow-x: clip;
  -webkit-overflow-scrolling: touch;
}
#ambient-bg-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  transform: translate3d(0, 0, 0);
  -webkit-transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform;
}
/* box-sizing coerente: padding e bordi non allargano mai gli elementi
   (evita che i pannelli con width:100% sbordino a destra) */
*, *::before, *::after { box-sizing: border-box; }
/* touch: il doppio tap deve tirare il dado, non zoomare la pagina */
* {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Numeri tabulari per allineamento perfetto e zero layout shift */
.tabular-nums, input[type="number"], .badge, .pip, td[data-label="inv.qta"] {
  font-variant-numeric: tabular-nums;
  -moz-font-feature-settings: "tnum";
  -webkit-font-feature-settings: "tnum";
  font-feature-settings: "tnum";
}

/* Scrollbar personalizzate sottili a tema */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--c-border);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--c-gold);
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

/* Bottoni: interazione coerente ovunque (focus da tastiera, hover, pressione morbida). */
button {
  font-family: inherit;
  cursor: pointer;
  transition: filter 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.08s ease, box-shadow 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
}
button:focus-visible { outline: 2px solid var(--c-gold); outline-offset: 1px; }
button:not(:disabled):hover { filter: brightness(1.06); }
button:not(:disabled):active { transform: scale(0.97); }
button:disabled { cursor: not-allowed; opacity: 0.5; }

/* Transizione morbida sulle righe delle tabelle */
tbody tr {
  transition: background-color 0.12s ease;
}
tbody tr:hover {
  background-color: rgba(184, 134, 11, 0.04);
}
:root[data-tema="scuro"] tbody tr:hover {
  background-color: rgba(201, 162, 39, 0.06);
}
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
  border-top: none !important;
  border-bottom: none !important;
  padding-top: 4px;
  padding-bottom: 4px;
}
.sezione-titolo-sinistra { justify-self: start; display: inline-flex; align-items: center; gap: 6px; }
.sezione-titolo-testo { justify-self: center; text-align: center; }
.sezione-titolo-azioni { justify-self: end; display: inline-flex; align-items: center; gap: 6px; }

/* Sottosezioni interne con più nomi centrali: linea sopra il nome */
.sottosezione-titolo {
  border-top: 1.5px solid var(--c-gold-dark, #b8860b) !important;
  border-bottom: none !important;
  padding-top: 10px;
  padding-bottom: 4px;
}

/* ===================== TEMI & CORNICI DI CLASSE ===================== */
.sezione, .profilo-sezione {
  position: relative;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.25s ease;
  border-color: var(--c-border-glow-min, var(--c-border));
  box-shadow: 0 3px 12px -2px var(--c-aura-glow-1, rgba(60,50,30,0.04)),
              0 1px 3px rgba(0, 0, 0, 0.25);
}

.sezione-titolo-testo {
  justify-self: center;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
  letter-spacing: 2px;
  transition: text-shadow 0.3s ease;
}

.angolo-ornamento {
  position: absolute;
  width: 22px;
  height: 22px;
  pointer-events: none;
  background-size: contain;
  background-repeat: no-repeat;
  z-index: 2;
  opacity: 0.70;
  filter: drop-shadow(0 0 1.5px var(--c-aura-color, rgba(201, 162, 39, 0.25)));
  transition: opacity 0.3s ease, transform 0.3s ease, filter 0.3s ease;
}
.angolo-tl { top: 0; left: 0; }
.angolo-tr { top: 0; right: 0; }
.angolo-bl { bottom: 0; left: 0; }
.angolo-br { bottom: 0; right: 0; }

/* Reattività Hover & Focus luminoso (sobrio e morbido) */
.sezione:hover,
.profilo-sezione:hover {
  border-color: var(--c-border-glow-max, var(--c-gold)) !important;
  box-shadow: 0 4px 18px -2px var(--c-aura-glow-pulse-1, rgba(201, 162, 39, 0.12)),
              0 0 6px 1px var(--c-aura-glow-min, rgba(201, 162, 39, 0.08)),
              0 1px 4px rgba(0, 0, 0, 0.35) !important;
}

.sezione:hover .sezione-titolo-testo,
.profilo-sezione:hover .sezione-titolo-testo {
  text-shadow: 0 0 6px var(--c-aura-color, rgba(201,162,39,0.3)), 0 0 2px var(--c-title);
}

.sezione:hover .angolo-ornamento,
.profilo-sezione:hover .angolo-ornamento {
  opacity: 0.95;
  filter: drop-shadow(0 0 3px var(--c-aura-color, rgba(201, 162, 39, 0.45)));
  transform: scale(1.04);
}

/* Modalità Animazione: 1. Respiro Magico (Default) */
:root:not([data-animazioni="statico"]):not([data-animazioni="hover"]):not([data-animazioni="brillante"]) .sezione,
:root:not([data-animazioni="statico"]):not([data-animazioni="hover"]):not([data-animazioni="brillante"]) .profilo-sezione,
[data-animazioni="respiro"] .sezione,
[data-animazioni="respiro"] .profilo-sezione {
  animation: aura-respiro-magico 6.5s ease-in-out infinite alternate;
}

:root:not([data-animazioni="statico"]):not([data-animazioni="hover"]):not([data-animazioni="brillante"]) .angolo-ornamento,
[data-animazioni="respiro"] .angolo-ornamento {
  animation: angoli-respiro-magico 6.5s ease-in-out infinite alternate;
}

/* Modalità Animazione: 2. Luminescenza Intensa */
[data-animazioni="brillante"] .sezione,
[data-animazioni="brillante"] .profilo-sezione {
  animation: aura-brillante 4s ease-in-out infinite alternate !important;
}

[data-animazioni="brillante"] .angolo-ornamento {
  animation: angoli-brillante 4s ease-in-out infinite alternate !important;
}

/* Modalità Animazione: 3. Statica / Solo al tocco */
[data-animazioni="statico"] .sezione,
[data-animazioni="statico"] .profilo-sezione,
[data-animazioni="statico"] .angolo-ornamento,
[data-animazioni="hover"] .sezione,
[data-animazioni="hover"] .profilo-sezione,
[data-animazioni="hover"] .angolo-ornamento {
  animation: none !important;
}

/* Keyframes di Respiro & Pulsazione Luminosa Morbida */
@keyframes aura-respiro-magico {
  0% {
    box-shadow: 0 3px 12px -3px var(--c-aura-glow-1, rgba(60,50,30,0.03)),
                0 1px 3px rgba(0, 0, 0, 0.25);
    border-color: var(--c-border-glow-min, var(--c-border));
  }
  100% {
    box-shadow: 0 4px 18px -2px var(--c-aura-glow-pulse-1, rgba(201, 162, 39, 0.10)),
                0 0 6px 1px var(--c-aura-glow-min, rgba(201, 162, 39, 0.05)),
                0 1px 3px rgba(0, 0, 0, 0.30);
    border-color: var(--c-border-glow-max, var(--c-gold));
  }
}

@keyframes angoli-respiro-magico {
  0% {
    filter: drop-shadow(0 0 1px var(--c-aura-color, rgba(201, 162, 39, 0.20)));
    opacity: 0.68;
    transform: scale(1);
  }
  100% {
    filter: drop-shadow(0 0 3.5px var(--c-aura-color, rgba(201, 162, 39, 0.45)));
    opacity: 0.90;
    transform: scale(1.03);
  }
}

@keyframes aura-brillante {
  0% {
    box-shadow: 0 3px 14px -3px var(--c-aura-glow-pulse-1, rgba(201, 162, 39, 0.08)),
                0 1px 3px rgba(0, 0, 0, 0.25);
    border-color: var(--c-border-glow-min, var(--c-border));
  }
  100% {
    box-shadow: 0 5px 22px -2px var(--c-aura-glow-max, rgba(201, 162, 39, 0.16)),
                0 0 8px 1px var(--c-aura-glow-pulse-1, rgba(201, 162, 39, 0.08)),
                0 1px 3px rgba(0, 0, 0, 0.32);
    border-color: var(--c-border-glow-max, var(--c-gold));
  }
}

@keyframes angoli-brillante {
  0% {
    filter: drop-shadow(0 0 2px var(--c-aura-color, rgba(201, 162, 39, 0.30)));
    opacity: 0.75;
    transform: scale(1);
  }
  100% {
    filter: drop-shadow(0 0 4.5px var(--c-aura-color, rgba(201, 162, 39, 0.55)));
    opacity: 0.95;
    transform: scale(1.05);
  }
}

/* Animazione Ispirazione Attiva */
@keyframes ispirazione-magica {
  0% {
    box-shadow: 0 0 8px rgba(240, 196, 63, 0.55), 0 0 2px #f0c43f;
    border-color: #f0c43f;
  }
  100% {
    box-shadow: 0 0 18px rgba(240, 196, 63, 0.95), 0 0 28px rgba(255, 215, 0, 0.5), inset 0 0 8px rgba(240, 196, 63, 0.4);
    border-color: #fff3b0;
    transform: scale(1.03);
  }
}
.ispirazione-attiva-glow {
  animation: ispirazione-magica 2.2s ease-in-out infinite alternate !important;
}

/* Animazione Battito Cardiaco PF Critici */
@keyframes battito-cardiaco-critico {
  0%, 100% {
    box-shadow: inset 0 2px 5px rgba(0,0,0,0.8), 0 0 6px rgba(198, 40, 40, 0.4);
    border-color: #c62828;
  }
  50% {
    box-shadow: inset 0 2px 5px rgba(0,0,0,0.8), 0 0 18px 4px rgba(229, 57, 53, 0.85), 0 0 28px rgba(255, 23, 68, 0.45);
    border-color: #ff5252;
    transform: scale(1.015);
  }
}
.pf-barra-critica {
  animation: battito-cardiaco-critico 1.4s ease-in-out infinite alternate !important;
}

@media (prefers-reduced-motion: reduce) {
  .sezione, .profilo-sezione, .angolo-ornamento, .ispirazione-attiva-glow, .pf-barra-critica {
    animation: none !important;
  }
}

/* Default / Generico D&D Gold Corners */
.angolo-tl { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23c9a227' stroke-width='1.8'><path d='M3 3h14M3 3v14M3 3l8 8M7 3v6M3 7h6'/><circle cx='5' cy='5' r='1.8' fill='%23dcb84f'/></svg>"); }
.angolo-tr { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23c9a227' stroke-width='1.8'><path d='M25 3H11M25 3v14M25 3l-8 8M21 3v6M25 7h-6'/><circle cx='23' cy='5' r='1.8' fill='%23dcb84f'/></svg>"); }
.angolo-bl { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23c9a227' stroke-width='1.8'><path d='M3 25h14M3 25V11M3 25l8-8M7 25v-6M3 21h6'/><circle cx='5' cy='23' r='1.8' fill='%23dcb84f'/></svg>"); }
.angolo-br { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23c9a227' stroke-width='1.8'><path d='M25 25H11M25 25V11M25 25l-8-8M21 25v-6M25 21h-6'/><circle cx='23' cy='23' r='1.8' fill='%23dcb84f'/></svg>"); }

/* 1. Druido: Rami intrecciati, foglie, nodi silvestri 🌿 */
[data-classe="druido"] {
  --c-aura-color: #40916c;
  --c-aura-glow-1: rgba(46, 125, 50, 0.20);
  --c-aura-glow-2: rgba(27, 67, 50, 0.14);
  --c-aura-glow-pulse-1: rgba(46, 125, 50, 0.34);
  --c-aura-glow-pulse-2: rgba(27, 67, 50, 0.22);
  --c-aura-glow-min: rgba(64, 145, 108, 0.15);
  --c-aura-glow-max: rgba(64, 145, 108, 0.35);
  --c-border-glow-min: rgba(64, 145, 108, 0.45);
  --c-border-glow-max: rgba(82, 183, 136, 0.85);
}
[data-classe="druido"] .angolo-tl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%2340916c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 24C3 12 12 3 24 3M3 3c6 0 10 4 10 10M3 3c0 6 4 10 10 10'/><circle cx='18' cy='7' r='2' fill='%2352b788'/><circle cx='7' cy='18' r='2' fill='%2352b788'/></svg>");
}
[data-classe="druido"] .angolo-tr {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%2340916c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M25 24C25 12 16 3 4 3M25 3c-6 0-10 4-10 10M25 3c0 6-4 10-10 10'/><circle cx='10' cy='7' r='2' fill='%2352b788'/><circle cx='21' cy='18' r='2' fill='%2352b788'/></svg>");
}
[data-classe="druido"] .angolo-bl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%2340916c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 4C3 16 12 25 24 25M3 25c6 0 10-4 10-10M3 25c0-6 4-10 10-10'/><circle cx='18' cy='21' r='2' fill='%2352b788'/><circle cx='7' cy='10' r='2' fill='%2352b788'/></svg>");
}
[data-classe="druido"] .angolo-br {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%2340916c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M25 4C25 16 16 25 4 25M25 25c-6 0-10-4-10-10M25 25c0-6-4-10-10-10'/><circle cx='10' cy='21' r='2' fill='%2352b788'/><circle cx='21' cy='10' r='2' fill='%2352b788'/></svg>");
}
[data-classe="druido"] .sottosezione-titolo {
  border-top: 1.5px solid rgba(64, 145, 108, 0.7) !important;
}

/* 2. Mago: Rune arcanee, cerchi cosmici, stelle ✦ 🔮 */
[data-classe="mago"] {
  --c-aura-color: #9d4edd;
  --c-aura-glow-1: rgba(157, 78, 221, 0.22);
  --c-aura-glow-2: rgba(94, 96, 206, 0.15);
  --c-aura-glow-pulse-1: rgba(157, 78, 221, 0.38);
  --c-aura-glow-pulse-2: rgba(94, 96, 206, 0.25);
  --c-aura-glow-min: rgba(157, 78, 221, 0.16);
  --c-aura-glow-max: rgba(157, 78, 221, 0.40);
  --c-border-glow-min: rgba(157, 78, 221, 0.45);
  --c-border-glow-max: rgba(199, 125, 255, 0.85);
}
[data-classe="mago"] .angolo-tl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%239d4edd' stroke-width='1.8'><path d='M3 3h12M3 3v12M3 3l12 12M8 8l5-5M8 8l-5 5'/><circle cx='5' cy='5' r='2' fill='%239d4edd'/><circle cx='18' cy='3' r='1.2' fill='%234cc9f0'/><circle cx='3' cy='18' r='1.2' fill='%234cc9f0'/></svg>");
}
[data-classe="mago"] .angolo-tr {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%239d4edd' stroke-width='1.8'><path d='M25 3H13M25 3v12M25 3L13 15M20 8l-5-5M20 8l5 5'/><circle cx='23' cy='5' r='2' fill='%239d4edd'/><circle cx='10' cy='3' r='1.2' fill='%234cc9f0'/><circle cx='25' cy='18' r='1.2' fill='%234cc9f0'/></svg>");
}
[data-classe="mago"] .angolo-bl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%239d4edd' stroke-width='1.8'><path d='M3 25h12M3 25V13M3 25l12-12M8 20l5 5M8 20l-5-5'/><circle cx='5' cy='23' r='2' fill='%239d4edd'/><circle cx='18' cy='25' r='1.2' fill='%234cc9f0'/><circle cx='3' cy='10' r='1.2' fill='%234cc9f0'/></svg>");
}
[data-classe="mago"] .angolo-br {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%239d4edd' stroke-width='1.8'><path d='M25 25H13M25 25V13M25 25L13 13M20 20l-5 5M20 20l5-5'/><circle cx='23' cy='23' r='2' fill='%239d4edd'/><circle cx='10' cy='25' r='1.2' fill='%234cc9f0'/><circle cx='25' cy='10' r='1.2' fill='%234cc9f0'/></svg>");
}
[data-classe="mago"] .sottosezione-titolo {
  border-top: 1.5px solid rgba(157, 78, 221, 0.7) !important;
}

/* 3. Guerriero: Lame d'acciaio, borchie da scudo, ferro ⚔️ */
[data-classe="guerriero"] {
  --c-aura-color: #d98a5a;
  --c-aura-glow-1: rgba(140, 58, 43, 0.18);
  --c-aura-glow-2: rgba(90, 40, 30, 0.12);
  --c-aura-glow-pulse-1: rgba(140, 58, 43, 0.32);
  --c-aura-glow-pulse-2: rgba(90, 40, 30, 0.20);
  --c-aura-glow-min: rgba(140, 58, 43, 0.14);
  --c-aura-glow-max: rgba(140, 58, 43, 0.32);
  --c-border-glow-min: rgba(140, 58, 43, 0.45);
  --c-border-glow-max: rgba(217, 138, 90, 0.85);
}
[data-classe="guerriero"] .angolo-tl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='square'><path d='M3 3h16M3 3v16M3 3l14 14M8 3v5M3 8h5'/><rect x='4' y='4' width='4' height='4' fill='%23adb5bd'/></svg>");
}
[data-classe="guerriero"] .angolo-tr {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='square'><path d='M25 3H9M25 3v16M25 3L11 17M20 3v5M25 8h-5'/><rect x='20' y='4' width='4' height='4' fill='%23adb5bd'/></svg>");
}
[data-classe="guerriero"] .angolo-bl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='square'><path d='M3 25h16M3 25V9M3 25l14-14M8 25v-5M3 20h5'/><rect x='4' y='20' width='4' height='4' fill='%23adb5bd'/></svg>");
}
[data-classe="guerriero"] .angolo-br {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='square'><path d='M25 25H9M25 25V9M25 25L11 11M20 25v-5M25 20h-5'/><rect x='20' y='20' width='4' height='4' fill='%23adb5bd'/></svg>");
}
[data-classe="guerriero"] .sottosezione-titolo {
  border-top: 1.5px solid rgba(140, 58, 43, 0.7) !important;
}

/* 4. Ladro: Pugnali nascosti, ombre, angoli acuti 🗡️ */
[data-classe="ladro"] {
  --c-aura-color: #6c757d;
  --c-aura-glow-1: rgba(35, 25, 55, 0.28);
  --c-aura-glow-2: rgba(15, 12, 25, 0.22);
  --c-aura-glow-pulse-1: rgba(45, 35, 70, 0.42);
  --c-aura-glow-pulse-2: rgba(25, 20, 40, 0.32);
  --c-aura-glow-min: rgba(73, 80, 87, 0.15);
  --c-aura-glow-max: rgba(73, 80, 87, 0.35);
  --c-border-glow-min: rgba(73, 80, 87, 0.45);
  --c-border-glow-max: rgba(160, 160, 160, 0.80);
}
[data-classe="ladro"] .angolo-tl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23495057' stroke-width='1.8' stroke-linecap='round'><path d='M3 18L3 3l15 0M3 3l16 16M6 6l4-2 2 4-4 2z' fill='rgba(73,80,87,0.3)'/></svg>");
}
[data-classe="ladro"] .angolo-tr {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23495057' stroke-width='1.8' stroke-linecap='round'><path d='M25 18L25 3l-15 0M25 3L9 19M22 6l-4-2-2 4 4 2z' fill='rgba(73,80,87,0.3)'/></svg>");
}
[data-classe="ladro"] .angolo-bl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23495057' stroke-width='1.8' stroke-linecap='round'><path d='M3 10L3 25l15 0M3 25l16-16M6 22l4 2 2-4-4-2z' fill='rgba(73,80,87,0.3)'/></svg>");
}
[data-classe="ladro"] .angolo-br {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23495057' stroke-width='1.8' stroke-linecap='round'><path d='M25 10L25 25l-15 0M25 25L9 9M22 22l-4 2-2-4 4-2z' fill='rgba(73,80,87,0.3)'/></svg>");
}
[data-classe="ladro"] .sottosezione-titolo {
  border-top: 1.5px solid rgba(52, 58, 64, 0.7) !important;
}

/* 5. Chierico: Raggi solari, croci sacre, aureola ☀️ 📿 */
[data-classe="chierico"] {
  --c-aura-color: #e09f3e;
  --c-aura-glow-1: rgba(224, 159, 62, 0.20);
  --c-aura-glow-2: rgba(168, 115, 0, 0.13);
  --c-aura-glow-pulse-1: rgba(224, 159, 62, 0.36);
  --c-aura-glow-pulse-2: rgba(168, 115, 0, 0.22);
  --c-aura-glow-min: rgba(224, 159, 62, 0.16);
  --c-aura-glow-max: rgba(224, 159, 62, 0.38);
  --c-border-glow-min: rgba(224, 159, 62, 0.50);
  --c-border-glow-max: rgba(255, 208, 74, 0.90);
}
[data-classe="chierico"] .angolo-tl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23e09f3e' stroke-width='2' stroke-linecap='round'><path d='M3 3h14M3 3v14M3 3l12 12M7 7a6 6 0 0 1 6-4M7 7a6 6 0 0 0-4 6'/><circle cx='8' cy='8' r='2' fill='%23fff3b0'/></svg>");
}
[data-classe="chierico"] .angolo-tr {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23e09f3e' stroke-width='2' stroke-linecap='round'><path d='M25 3H11M25 3v14M25 3L13 15M21 7a6 6 0 0 0-6-4M21 7a6 6 0 0 1 4 6'/><circle cx='20' cy='8' r='2' fill='%23fff3b0'/></svg>");
}
[data-classe="chierico"] .angolo-bl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23e09f3e' stroke-width='2' stroke-linecap='round'><path d='M3 25h14M3 25V11M3 25l12-12M7 21a6 6 0 0 0 6 4M7 21a6 6 0 0 1-4-6'/><circle cx='8' cy='20' r='2' fill='%23fff3b0'/></svg>");
}
[data-classe="chierico"] .angolo-br {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23e09f3e' stroke-width='2' stroke-linecap='round'><path d='M25 25H11M25 25V11M25 25L13 13M21 21a6 6 0 0 1-6 4M21 21a6 6 0 0 0 4-6'/><circle cx='20' cy='20' r='2' fill='%23fff3b0'/></svg>");
}
[data-classe="chierico"] .sottosezione-titolo {
  border-top: 1.5px solid rgba(224, 159, 62, 0.7) !important;
}

/* 6. Paladino: Scudo sacro, purezza, bordi solenni 🛡️ */
[data-classe="paladino"] {
  --c-aura-color: #b8860b;
  --c-aura-glow-1: rgba(184, 134, 11, 0.20);
  --c-aura-glow-2: rgba(140, 100, 8, 0.14);
  --c-aura-glow-pulse-1: rgba(184, 134, 11, 0.36);
  --c-aura-glow-pulse-2: rgba(140, 100, 8, 0.24);
  --c-aura-glow-min: rgba(184, 134, 11, 0.16);
  --c-aura-glow-max: rgba(184, 134, 11, 0.38);
  --c-border-glow-min: rgba(184, 134, 11, 0.50);
  --c-border-glow-max: rgba(255, 215, 0, 0.90);
}
[data-classe="paladino"] .angolo-tl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23b8860b' stroke-width='2'><path d='M3 3h14M3 3v14M3 3l14 14M3 11l8-8M3 17l14-14'/><polygon points='4,4 10,4 4,10' fill='%23ffd700'/></svg>");
}
[data-classe="paladino"] .angolo-tr {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23b8860b' stroke-width='2'><path d='M25 3H11M25 3v14M25 3L11 17M25 11l-8-8M25 17L11 3'/><polygon points='24,4 18,4 24,10' fill='%23ffd700'/></svg>");
}
[data-classe="paladino"] .angolo-bl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23b8860b' stroke-width='2'><path d='M3 25h14M3 25V11M3 25L17 11M3 17l8 8M3 11l14 14'/><polygon points='4,24 10,24 4,18' fill='%23ffd700'/></svg>");
}
[data-classe="paladino"] .angolo-br {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23b8860b' stroke-width='2'><path d='M25 25H11M25 25V11M25 25L11 11M25 17l-8 8M25 11L11 25'/><polygon points='24,24 18,24 24,18' fill='%23ffd700'/></svg>");
}
[data-classe="paladino"] .sottosezione-titolo {
  border-top: 1.5px solid rgba(184, 134, 11, 0.7) !important;
}

/* 7. Bardo: Volute liriche, curve melodiche, note 🎵 🪕 */
[data-classe="bardo"] {
  --c-aura-color: #b5179e;
  --c-aura-glow-1: rgba(181, 23, 158, 0.20);
  --c-aura-glow-2: rgba(114, 9, 183, 0.14);
  --c-aura-glow-pulse-1: rgba(181, 23, 158, 0.36);
  --c-aura-glow-pulse-2: rgba(114, 9, 183, 0.24);
  --c-aura-glow-min: rgba(181, 23, 158, 0.16);
  --c-aura-glow-max: rgba(181, 23, 158, 0.38);
  --c-border-glow-min: rgba(181, 23, 158, 0.45);
  --c-border-glow-max: rgba(247, 37, 133, 0.85);
}
[data-classe="bardo"] .angolo-tl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23b5179e' stroke-width='2' stroke-linecap='round'><path d='M3 21C3 9 9 3 21 3M3 13c0-6 4-10 10-10M3 3l14 14'/><circle cx='8' cy='8' r='2' fill='%23f72585'/></svg>");
}
[data-classe="bardo"] .angolo-tr {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23b5179e' stroke-width='2' stroke-linecap='round'><path d='M25 21C25 9 19 3 7 3M25 13c0-6-4-10-10-10M25 3L11 17'/><circle cx='20' cy='8' r='2' fill='%23f72585'/></svg>");
}
[data-classe="bardo"] .angolo-bl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23b5179e' stroke-width='2' stroke-linecap='round'><path d='M3 7C3 19 9 25 21 25M3 15c0 6 4 10 10 10M3 25L17 11'/><circle cx='8' cy='20' r='2' fill='%23f72585'/></svg>");
}
[data-classe="bardo"] .angolo-br {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23b5179e' stroke-width='2' stroke-linecap='round'><path d='M25 7C25 19 19 25 7 25M25 15c0 6-4 10-10 10M25 25L11 11'/><circle cx='20' cy='20' r='2' fill='%23f72585'/></svg>");
}
[data-classe="bardo"] .sottosezione-titolo {
  border-top: 1.5px solid rgba(181, 23, 158, 0.7) !important;
}

/* 8. Barbaro: Graffi selvaggi, zanne, asce primordiali 🪓 */
[data-classe="barbaro"] {
  --c-aura-color: #d00000;
  --c-aura-glow-1: rgba(208, 0, 0, 0.22);
  --c-aura-glow-2: rgba(157, 2, 8, 0.15);
  --c-aura-glow-pulse-1: rgba(208, 0, 0, 0.38);
  --c-aura-glow-pulse-2: rgba(157, 2, 8, 0.25);
  --c-aura-glow-min: rgba(208, 0, 0, 0.16);
  --c-aura-glow-max: rgba(208, 0, 0, 0.40);
  --c-border-glow-min: rgba(208, 0, 0, 0.45);
  --c-border-glow-max: rgba(255, 107, 94, 0.85);
}
[data-classe="barbaro"] .angolo-tl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23d00000' stroke-width='2.2' stroke-linecap='round'><path d='M3 3l14 6M3 3l6 14M3 3l18 18M7 3l4 12M3 7l12 4'/></svg>");
}
[data-classe="barbaro"] .angolo-tr {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23d00000' stroke-width='2.2' stroke-linecap='round'><path d='M25 3l-14 6M25 3l-6 14M25 3L7 21M21 3l-4 12M25 7l-12 4'/></svg>");
}
[data-classe="barbaro"] .angolo-bl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23d00000' stroke-width='2.2' stroke-linecap='round'><path d='M3 25l14-6M3 25l6-14M3 25L21 7M7 25l4-12M3 21l12-4'/></svg>");
}
[data-classe="barbaro"] .angolo-br {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23d00000' stroke-width='2.2' stroke-linecap='round'><path d='M25 25l-14-6M25 25l-6-14M25 25L7 7M21 25l-4-12M25 21l-12-4'/></svg>");
}
[data-classe="barbaro"] .sottosezione-titolo {
  border-top: 1.5px solid rgba(208, 0, 0, 0.7) !important;
}

/* 9. Ranger: Nodi da cacciatore e frecce intagliate 🏹 */
[data-classe="ranger"] {
  --c-aura-color: #2b9348;
  --c-aura-glow-1: rgba(43, 147, 72, 0.20);
  --c-aura-glow-2: rgba(0, 114, 0, 0.13);
  --c-aura-glow-pulse-1: rgba(43, 147, 72, 0.35);
  --c-aura-glow-pulse-2: rgba(0, 114, 0, 0.22);
  --c-aura-glow-min: rgba(43, 147, 72, 0.15);
  --c-aura-glow-max: rgba(43, 147, 72, 0.35);
  --c-border-glow-min: rgba(43, 147, 72, 0.45);
  --c-border-glow-max: rgba(122, 183, 79, 0.85);
}
[data-classe="ranger"] .angolo-tl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%232b9348' stroke-width='2' stroke-linecap='round'><path d='M3 3h12M3 3v12M3 3l14 14M7 13l6-6'/></svg>");
}
[data-classe="ranger"] .angolo-tr {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%232b9348' stroke-width='2' stroke-linecap='round'><path d='M25 3H13M25 3v12M25 3L11 17M21 13l-6-6'/></svg>");
}
[data-classe="ranger"] .angolo-bl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%232b9348' stroke-width='2' stroke-linecap='round'><path d='M3 25h12M3 25V13M3 25L17 11M7 15l6 6'/></svg>");
}
[data-classe="ranger"] .angolo-br {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%232b9348' stroke-width='2' stroke-linecap='round'><path d='M25 25H13M25 25V13M25 25L11 11M21 15l-6 6'/></svg>");
}
[data-classe="ranger"] .sottosezione-titolo {
  border-top: 1.5px solid rgba(43, 147, 72, 0.7) !important;
}

/* 10. Stregone: Mana grezzo e fulmini elementali ⚡ */
[data-classe="stregone"] {
  --c-aura-color: #f72585;
  --c-aura-glow-1: rgba(247, 37, 133, 0.22);
  --c-aura-glow-2: rgba(181, 23, 158, 0.15);
  --c-aura-glow-pulse-1: rgba(247, 37, 133, 0.38);
  --c-aura-glow-pulse-2: rgba(181, 23, 158, 0.25);
  --c-aura-glow-min: rgba(247, 37, 133, 0.16);
  --c-aura-glow-max: rgba(247, 37, 133, 0.40);
  --c-border-glow-min: rgba(247, 37, 133, 0.45);
  --c-border-glow-max: rgba(247, 37, 133, 0.85);
}
[data-classe="stregone"] .angolo-tl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23f72585' stroke-width='2' stroke-linecap='round'><path d='M3 3l10 0-5 7 7 0-10 9'/></svg>");
}
[data-classe="stregone"] .angolo-tr {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23f72585' stroke-width='2' stroke-linecap='round'><path d='M25 3l-10 0 5 7-7 0 10 9'/></svg>");
}
[data-classe="stregone"] .angolo-bl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23f72585' stroke-width='2' stroke-linecap='round'><path d='M3 25l10 0-5-7 7 0-10-9'/></svg>");
}
[data-classe="stregone"] .angolo-br {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23f72585' stroke-width='2' stroke-linecap='round'><path d='M25 25l-10 0 5-7-7 0 10-9'/></svg>");
}
[data-classe="stregone"] .sottosezione-titolo {
  border-top: 1.5px solid rgba(247, 37, 133, 0.7) !important;
}

/* 11. Warlock: Spire eldritch, occhi occulti e abisso 👁️ */
[data-classe="warlock"] {
  --c-aura-color: #7209b7;
  --c-aura-glow-1: rgba(114, 9, 183, 0.25);
  --c-aura-glow-2: rgba(58, 12, 163, 0.18);
  --c-aura-glow-pulse-1: rgba(114, 9, 183, 0.42);
  --c-aura-glow-pulse-2: rgba(58, 12, 163, 0.28);
  --c-aura-glow-min: rgba(114, 9, 183, 0.18);
  --c-aura-glow-max: rgba(114, 9, 183, 0.42);
  --c-border-glow-min: rgba(114, 9, 183, 0.50);
  --c-border-glow-max: rgba(138, 74, 158, 0.88);
}
[data-classe="warlock"] .angolo-tl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%237209b7' stroke-width='2'><path d='M3 3c7 0 12 5 12 12M3 3c0 7 5 12 12 12'/><circle cx='8' cy='8' r='2.2' fill='%234361ee'/></svg>");
}
[data-classe="warlock"] .angolo-tr {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%237209b7' stroke-width='2'><path d='M25 3c-7 0-12 5-12 12M25 3c0 7-5 12-12 12'/><circle cx='20' cy='8' r='2.2' fill='%234361ee'/></svg>");
}
[data-classe="warlock"] .angolo-bl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%237209b7' stroke-width='2'><path d='M3 25c7 0 12-5 12-12M3 25c0-7 5-12 12-12'/><circle cx='8' cy='20' r='2.2' fill='%234361ee'/></svg>");
}
[data-classe="warlock"] .angolo-br {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%237209b7' stroke-width='2'><path d='M25 25c-7 0-12-5-12-12M25 25c0-7-5-12-12-12'/><circle cx='20' cy='20' r='2.2' fill='%234361ee'/></svg>");
}
[data-classe="warlock"] .sottosezione-titolo {
  border-top: 1.5px solid rgba(114, 9, 183, 0.7) !important;
}

/* 12. Monaco: Cerchio Zen (Enso) e giada ☯️ */
[data-classe="monaco"] {
  --c-aura-color: #c48a1a;
  --c-aura-glow-1: rgba(196, 138, 26, 0.18);
  --c-aura-glow-2: rgba(140, 95, 15, 0.12);
  --c-aura-glow-pulse-1: rgba(196, 138, 26, 0.32);
  --c-aura-glow-pulse-2: rgba(140, 95, 15, 0.20);
  --c-aura-glow-min: rgba(196, 138, 26, 0.15);
  --c-aura-glow-max: rgba(196, 138, 26, 0.35);
  --c-border-glow-min: rgba(196, 138, 26, 0.45);
  --c-border-glow-max: rgba(255, 232, 163, 0.85);
}
[data-classe="monaco"] .angolo-tl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%2338b000' stroke-width='2.2' stroke-linecap='round'><path d='M3 15A12 12 0 0 1 15 3'/><circle cx='11' cy='11' r='2.5' fill='%2370e000'/></svg>");
}
[data-classe="monaco"] .angolo-tr {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%2338b000' stroke-width='2.2' stroke-linecap='round'><path d='M25 15A12 12 0 0 0 15 3'/><circle cx='17' cy='11' r='2.5' fill='%2370e000'/></svg>");
}
[data-classe="monaco"] .angolo-bl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%2338b000' stroke-width='2.2' stroke-linecap='round'><path d='M3 13A12 12 0 0 0 15 25'/><circle cx='11' cy='17' r='2.5' fill='%2370e000'/></svg>");
}
[data-classe="monaco"] .angolo-br {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%2338b000' stroke-width='2.2' stroke-linecap='round'><path d='M25 13A12 12 0 0 1 15 25'/><circle cx='17' cy='17' r='2.5' fill='%2370e000'/></svg>");
}
[data-classe="monaco"] .sottosezione-titolo {
  border-top: 1.5px solid rgba(196, 138, 26, 0.7) !important;
}

/* 13. Artefice: Ingranaggi di bronzo e ottone ⚙️ */
[data-classe="artefice"] {
  --c-aura-color: #b5651d;
  --c-aura-glow-1: rgba(181, 101, 29, 0.20);
  --c-aura-glow-2: rgba(130, 70, 20, 0.13);
  --c-aura-glow-pulse-1: rgba(181, 101, 29, 0.35);
  --c-aura-glow-pulse-2: rgba(130, 70, 20, 0.22);
  --c-aura-glow-min: rgba(181, 101, 29, 0.15);
  --c-aura-glow-max: rgba(181, 101, 29, 0.35);
  --c-border-glow-min: rgba(181, 101, 29, 0.45);
  --c-border-glow-max: rgba(212, 160, 106, 0.85);
}
[data-classe="artefice"] .angolo-tl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23b5651d' stroke-width='2'><rect x='3' y='3' width='12' height='12' rx='2' fill='rgba(181,101,29,0.15)'/><circle cx='9' cy='9' r='2.5' fill='%23d4a373'/></svg>");
}
[data-classe="artefice"] .angolo-tr {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23b5651d' stroke-width='2'><rect x='13' y='3' width='12' height='12' rx='2' fill='rgba(181,101,29,0.15)'/><circle cx='19' cy='9' r='2.5' fill='%23d4a373'/></svg>");
}
[data-classe="artefice"] .angolo-bl {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23b5651d' stroke-width='2'><rect x='3' y='13' width='12' height='12' rx='2' fill='rgba(181,101,29,0.15)'/><circle cx='9' cy='19' r='2.5' fill='%23d4a373'/></svg>");
}
[data-classe="artefice"] .angolo-br {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23b5651d' stroke-width='2'><rect x='13' y='13' width='12' height='12' rx='2' fill='rgba(181,101,29,0.15)'/><circle cx='19' cy='19' r='2.5' fill='%23d4a373'/></svg>");
}
[data-classe="artefice"] .sottosezione-titolo {
  border-top: 1.5px solid rgba(181, 101, 29, 0.7) !important;
}

/* Disattivazione bordi speciali */
[data-classe="nessuna"] .angolo-ornamento {
  display: none !important;
}
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

/* Tier 1: Sinistra (Ritratto con proporzione verticale rettangolare 3:4), Centro (Anagrafica + Punti Vita), Destra (Forza + Des + Cos) */
.ritratto-tier-1 {
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
}
.ritratto-box {
  width: 100%;
  aspect-ratio: 3 / 4;
  height: auto;
  min-height: 280px;
  max-height: 380px;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(212, 175, 55, 0.3);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease, border-color 0.25s ease;
}
.ritratto-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55), 0 0 16px var(--c-aura-color, rgba(201, 162, 39, 0.35)), inset 0 0 0 1px rgba(212, 175, 55, 0.6);
}
.ritratto-box::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  box-shadow: inset 0 0 22px rgba(0, 0, 0, 0.65), inset 0 -38px 28px -10px rgba(0, 0, 0, 0.75);
  pointer-events: none;
  z-index: 1;
  transition: opacity 0.25s ease;
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
.selettore-riga-1, .selettore-riga-2 { display: contents; }
.selettore-divisore {
  display: inline-block;
  width: 1.5px;
  height: 22px;
  background: var(--c-border);
  opacity: 0.6;
  margin: 0 2px;
  flex-shrink: 0;
  align-self: center;
  border-radius: 1px;
}

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
  /* 2. Immagine / Ritratto sotto il nome (rettangolare verso il basso) */
  .profilo-ritratto-box {
    order: 2 !important;
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
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
    max-width: 100% !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
    gap: 6px !important;
    align-items: start !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }
  .car-col-fisiche,
  .car-col-mentali {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
  }
  .car-col-fisiche .car-tier-1,
  .car-col-mentali .car-tier-2,
  .car-col-mentali .car-tier-3 {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
  }
  .car-col-fisiche .blocco-car,
  .car-col-mentali .blocco-car {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    padding: 5px 6px !important;
    box-sizing: border-box !important;
  }
  .car-col-fisiche .blocco-car > div:first-of-type,
  .car-col-mentali .blocco-car > div:first-of-type {
    gap: 4px !important;
  }
  .car-header-label {
    font-size: 11.5px !important;
    letter-spacing: 0px !important;
  }
  .blocco-car div[role="button"] {
    font-size: 12.5px !important;
    gap: 5px !important;
  }
  .blocco-car .skill-nome {
    font-size: 11.5px !important;
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

  .ritratto-box { width: 100% !important; max-width: 290px !important; aspect-ratio: 3 / 4 !important; height: auto !important; min-height: 350px !important; max-height: 420px !important; border-radius: 14px !important; margin: 0 auto !important; }
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
/* i campi anagrafica (con le tendine): font uniforme, padding compatto, allineati in basso */
.campi-anagrafica > * { min-width: 0; display: flex; flex-direction: column; justify-content: flex-end; }
.campi-anagrafica select { max-width: 100%; font-size: 12px !important; font-family: inherit !important; font-weight: 600 !important; color: var(--c-ink) !important; padding: 1px 13px 1px 1px !important; height: 100% !important; line-height: 1.2; background-position: right 1px center !important; background-size: 7px !important; }
.campi-anagrafica .campo-modulo-box { padding: 0 1px !important; min-height: 26px !important; height: 26px; display: flex; align-items: center; overflow: hidden; font-size: 12px; font-weight: 600 !important; color: var(--c-ink) !important; font-family: inherit !important; }
.campi-anagrafica .campo-modulo-box * { font-size: inherit; font-family: inherit; font-weight: 600; }
.campi-anagrafica .campo-modulo-box.testo-compatto, .campi-anagrafica .campo-modulo-box.testo-compatto * { font-size: 10.5px !important; letter-spacing: -0.2px; }
.campi-anagrafica .campo-modulo-label { font-size: 8.5px !important; margin-top: 2px; font-weight: 700 !important; letter-spacing: 0.25px !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* Sottoclasse con più classi (multiclasse): una riga per classe, l'altezza fissa
    da campo singolo taglierebbe via le righe in più. */
.campi-anagrafica .campo-modulo-box.sottoclasse-multi { height: auto !important; align-items: flex-start !important; overflow: visible !important; padding-top: 2px !important; padding-bottom: 2px !important; }
/* Classe con multiclasse (triclasse): "Guerriero + Ranger + Ladro" è lungo e andrebbe troncato */
.campi-anagrafica .campo-modulo-box.classe-multi { height: auto !important; min-height: 26px !important; overflow: visible !important; padding-top: 2px !important; padding-bottom: 2px !important; align-items: flex-start !important; }
.campi-anagrafica .campo-modulo-box.classe-multi div { white-space: normal !important; word-break: break-word; line-height: 1.3; }
.selettore-personaggio {
  width: 100%;
  margin: 0 0 8px 0 !important;
}
.barra-superiore-fissa {
  position: sticky !important;
  top: 0 !important;
  z-index: 1200 !important;
  backdrop-filter: blur(14px) saturate(140%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(140%) !important;
  background: color-mix(in srgb, var(--c-panel) 95%, transparent) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.16), 0 1px 4px rgba(0, 0, 0, 0.08) !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 12px !important;
  border-bottom-right-radius: 0 !important;
  border-bottom-left-radius: 12px !important;
  margin-top: 0 !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  scrollbar-width: none;
}
.barra-superiore-fissa::-webkit-scrollbar {
  display: none;
}
.barra-superiore-fissa .selettore-personaggio-azioni {
  flex-wrap: nowrap !important;
  white-space: nowrap !important;
}
.barra-tiro {
  position: sticky !important;
  top: 48px !important;
  z-index: 1100 !important;
  backdrop-filter: blur(14px) saturate(140%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(140%) !important;
  background: color-mix(in srgb, var(--c-panel) 96%, transparent) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
  animation: apparizioneDolce 0.2s cubic-bezier(0.2, 0.9, 0.3, 1) !important;
}
@media (max-width: 768px) {
  .barra-tiro {
    top: 42px !important;
  }
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
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0 4px;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: var(--c-ink-dim); font: 600 12px/1 Georgia, serif; letter-spacing: .35px;
}
/* Simboli di sfondo ed emoji opachi nei riquadri vitali e caratteristiche */
.sfondo-vit-emoji {
  position: absolute;
  right: -2px;
  bottom: -8px;
  font-size: 52px;
  line-height: 1;
  pointer-events: none;
  user-select: none;
  transform: rotate(-8deg);
  opacity: 0.24;
  filter: grayscale(10%);
  transition: opacity 0.2s ease, filter 0.2s ease;
}
[data-tema="chiaro"] .sfondo-vit-emoji {
  opacity: 0.32 !important;
  filter: grayscale(0%) saturate(1.15) !important;
}
[data-tema="scuro"] .sfondo-vit-emoji {
  opacity: 0.18 !important;
  filter: grayscale(15%) !important;
}
.sfondo-car-emoji {
  position: absolute;
  right: 2px;
  bottom: -4px;
  font-size: 66px;
  line-height: 1;
  pointer-events: none;
  user-select: none;
  transform: rotate(-8deg);
  opacity: 0.22;
  filter: grayscale(10%);
  transition: opacity 0.2s ease, filter 0.2s ease;
}
[data-tema="chiaro"] .sfondo-car-emoji {
  opacity: 0.30 !important;
  filter: grayscale(0%) saturate(1.15) !important;
}
[data-tema="scuro"] .sfondo-car-emoji {
  opacity: 0.18 !important;
  filter: grayscale(15%) !important;
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
  /* Inventario: sul telefono ogni oggetto diventa una scheda leggibile e ordinata */
  .inventario-wrap { overflow-x: visible !important; }
  .inventario-table, .inventario-table tbody { display: block; width: 100%; }
  .inventario-table thead { display: none; }
  .inventario-table .inventario-riga {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) auto auto;
    align-items: center; gap: 6px 10px;
    margin: 0 0 8px; padding: 10px 12px;
    border: 1px solid var(--c-border); border-radius: 9px;
    background: color-mix(in srgb, var(--c-panel-light) 84%, transparent);
    box-shadow: 0 1px 3px rgba(0,0,0,.1);
  }
  .inventario-table .inventario-riga > td {
    display: flex; align-items: center; min-width: 0;
    padding: 2px 0 !important; border: 0 !important;
  }
  .inventario-table .inventario-riga > td:nth-child(1) { grid-column: 1; grid-row: 1; justify-content: center; }
  .inventario-table .inventario-riga > td:nth-child(2) { grid-column: 2 / -1; grid-row: 1; font-weight: 700; }
  .inventario-table .inventario-riga > td:nth-child(2) > * { max-width: 100%; }
  .inventario-table .inventario-riga > td:nth-child(3) { grid-column: 1 / 3; grid-row: 2; justify-content: flex-start; }
  .inventario-table .inventario-riga > td:nth-child(4) { grid-column: 3; grid-row: 2; justify-content: center; }
  .inventario-table .inventario-riga > td:nth-child(5) { grid-column: 4; grid-row: 2; justify-content: flex-end; }
  .inventario-table .inventario-riga > .inventario-azioni {
    grid-column: 1 / -1; grid-row: 3; justify-content: flex-end; gap: 6px;
    padding-top: 6px !important; border-top: 1px solid var(--c-border) !important;
  }
  .inventario-table .inventario-riga > td:nth-child(n+3):not(.inventario-azioni)::before {
    content: attr(data-label); margin-right: 5px; color: var(--c-ink-dim);
    font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px;
    flex-shrink: 0;
  }
  .inventario-table .inventario-riga > .inventario-azioni button { min-width: 34px; min-height: 30px; }
  .inventario-table tr:not(.inventario-riga) { display: block; margin: -8px 0 8px; }
  .inventario-table tr:not(.inventario-riga) td[colspan] { display: block; width: auto; padding: 8px 12px !important; }
}
.selettore-personaggio-desktop {
  display: flex !important;
}
.selettore-personaggio-mobile {
  display: none !important;
}

@media (max-width: 820px) {
  .griglia-scheda { grid-template-columns: 1fr; }
  .selettore-personaggio { width: 100%; }
}
@media (max-width: 680px) {
  .selettore-personaggio-desktop {
    display: none !important;
  }
  .selettore-personaggio-mobile {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    width: 100% !important;
    box-sizing: border-box !important;
    gap: 4px !important;
  }
  .barra-superiore-fissa {
    padding: 3px 6px !important;
    margin-bottom: 6px !important;
    overflow: hidden !important;
    border-top-left-radius: 0 !important;
    border-top-right-radius: 10px !important;
    border-bottom-right-radius: 0 !important;
    border-bottom-left-radius: 10px !important;
    min-height: 36px !important;
    box-sizing: border-box !important;
  }
  .anagrafica > div:last-child > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
  .anagrafica > div:last-child > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
  /* su telefono i riquadri anagrafica e vitali passano a 2 colonne (leggibili,
     niente 5 colonne schiacciate); le altezze non sono più forzate uguali */
  .campi-anagrafica { grid-template-columns: repeat(2, 1fr) !important; gap: 8px 10px !important; }
  .campi-anagrafica .campo-modulo-box { min-height: 32px !important; height: auto !important; overflow: visible !important; }
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

/* Pulsante Notifiche lampeggiante e scintillante con colore Oro/Ambra */
.btn-notifiche-lampeggia {
  animation: notifiche-oro-lampeggia 1.5s ease-in-out infinite !important;
  color: var(--c-gold-dark, #c07718) !important;
  border-color: var(--c-gold, #e5a50a) !important;
  position: relative;
}
.btn-notifiche-lampeggia .icona-campanello,
.btn-notifiche-lampeggia > span:first-child {
  display: inline-block;
  animation: campanello-drin 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 5px rgba(255, 200, 50, 0.9));
}
@keyframes campanello-drin {
  0%, 60%, 100% { transform: rotate(0deg) scale(1); }
  10% { transform: rotate(-14deg) scale(1.15); }
  20% { transform: rotate(14deg) scale(1.15); }
  30% { transform: rotate(-10deg) scale(1.1); }
  40% { transform: rotate(10deg) scale(1.1); }
  50% { transform: rotate(0deg) scale(1); }
}
@keyframes notifiche-oro-lampeggia {
  0%, 100% {
    border-color: var(--c-gold-dark, #c07718);
    box-shadow: 0 0 0 0 rgba(229, 165, 10, 0);
  }
  50% {
    border-color: #ffd700;
    box-shadow: 0 0 14px 3px rgba(255, 215, 0, 0.75), 0 0 22px 6px rgba(240, 196, 63, 0.45);
    background: rgba(255, 215, 0, 0.18);
  }
}
@media (prefers-reduced-motion: reduce) {
  .btn-notifiche-lampeggia,
  .btn-notifiche-lampeggia .icona-campanello,
  .btn-notifiche-lampeggia > span:first-child { animation: none !important; }
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

/* Feedback visivo Incantesimi: Mancanti (Verde) / In Eccesso (Rosso) */
.incantesimo-in-eccesso {
  border: 1.5px solid #ef4444 !important;
  background: rgba(239, 68, 68, 0.09) !important;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.25) !important;
  animation: pulsazione-rossa 2s ease-in-out infinite;
}
.incantesimo-mancante-controllo {
  border: 1.5px solid #2e9d4d !important;
  background: rgba(46, 157, 77, 0.12) !important;
  box-shadow: 0 0 8px rgba(46, 157, 77, 0.3) !important;
  animation: pulsazione-verde 2s ease-in-out infinite;
}
@keyframes pulsazione-verde {
  0%, 100% { box-shadow: 0 0 0 0 rgba(46, 157, 77, 0.4); border-color: #2e9d4d; }
  50% { box-shadow: 0 0 0 4px rgba(46, 157, 77, 0.12); border-color: #3bb85d; }
}
@keyframes pulsazione-rossa {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); border-color: #ef4444; }
  50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12); border-color: #f87171; }
}
@media (prefers-reduced-motion: reduce) {
  .incantesimo-in-eccesso, .incantesimo-mancante-controllo { animation: none; }
}

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
