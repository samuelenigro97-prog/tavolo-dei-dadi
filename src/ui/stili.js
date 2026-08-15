// Oggetto `styles` (stili inline) e CSS globale dell'app.
// Estratto da App.jsx: nessuna logica, solo presentazione.
import { C, COLORE_DADO } from './tema.js';

export const styles = {
  app: {
    minHeight: '100vh',
    background: 'transparent', // lo sfondo tematico è sul body (cambia con la classe)
    color: C.ink,
    fontFamily: "Georgia, 'Times New Roman', serif",
    padding: '0 16px 48px',
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
    top: 4,
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
    padding: '8px 6px',
    display: 'flex',
    flexDirection: 'column',
    // Nome ancorato in alto (assoluto); il contenuto (valore ecc.) è centrato
    // verticalmente, così i valori dei vari riquadri sono allineati fra loro
    // (simmetria) anche quando qualche riquadro ha righe extra.
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
    paddingTop: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  vitalLabel: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    fontSize: 13,
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
    // competenza chiara a colpo d'occhio: verde pieno = competente, oro = maestria,
    // anello tenue = non competente (così non sembrano tutte "accese")
    color: livello === 2 ? '#d4af37' : livello === 1 ? C.green : C.inkDim,
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
html, body { margin: 0; padding: 0; background: ${C.bg}; }
/* box-sizing coerente: padding e bordi non allargano mai gli elementi
   (evita che i pannelli con width:100% sbordino a destra) */
*, *::before, *::after { box-sizing: border-box; }
/* touch: il doppio tap deve tirare il dado, non zoomare la pagina */
* { touch-action: manipulation; }

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
   centrale) vivono nella STESSA griglia con righe condivise (subgrid), così
   ogni caratteristica si allinea riga per riga al gruppo di vitali corrispondente
   (Forza↔anagrafica, Des+Cos↔Punti Ferita, Int↔difesa, Sag↔salvezza, Car↔stato).
   Il ritratto occupa la colonna destra per tutta l'altezza. */
.profilo-griglia {
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr) 210px;
  grid-template-rows: repeat(5, auto);
  column-gap: 14px;
  row-gap: 10px;
  align-items: start;
}
/* Le due colonne si estendono su tutte e 5 le righe e ne ereditano le linee
   con subgrid: è questo che tiene allineate le righe fra sinistra e centro. */
.profilo-caratteristiche {
  grid-column: 1;
  grid-row: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: subgrid;
  min-width: 0;
}
.profilo-main {
  grid-column: 2;
  grid-row: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: subgrid;
  min-width: 0;
}
.profilo-ritratto {
  grid-column: 3;
  /* Righe 1-2 soltanto: l'immagine parte dal bordo di Forza e finisce alla
     linea di Costituzione (simmetrica ai primi due blocchi caratteristica). */
  grid-row: 1 / 3;
  align-self: stretch;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
/* Il box immagine riempie l'altezza disponibile (righe 1-2) senza forzarne la
   crescita; su mobile, dove non c'è la griglia, gli diamo un'altezza minima. */
.ritratto-box { min-height: 0; }
.ritratto-toggle {
  width: 100%; margin: 0 0 6px; padding: 5px 8px; border: 1px solid var(--c-border);
  border-radius: 7px; background: var(--c-panel-light); color: var(--c-title);
  font: 700 12px Georgia, serif; letter-spacing: 1px; text-align: left; cursor: pointer;
}
/* Addestramento + Risorse riempiono lo spazio vuoto sotto il ritratto (colonna
   destra, righe 3-5 = Intelligenza→Carisma). align-self:start → restano in alto e
   non forzano l'altezza delle righe (così le caratteristiche restano allineate). */
.profilo-extra { grid-column: 3; grid-row: 3 / -1; align-self: stretch; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
/* Ritratto ridotto: Addestramento/Risorse salgono e usano tutta la colonna,
   altrimenti resterebbe un buco (le righe le detta la colonna caratteristiche). */
.profilo-griglia.senza-ritratto .profilo-ritratto { grid-row: 1 / 2; align-self: start; }
.profilo-griglia.senza-ritratto .profilo-extra { grid-row: 2 / -1; }
.profilo-extra > .sezione { margin-bottom: 0 !important; }
/* l'ultima sezione aperta (Risorse) cresce per riempire lo spazio rimanente
   sotto; da chiusa resta alta quanto il suo titolo. */
.profilo-extra > .sezione[open]:last-child { flex: 1 1 auto; }
/* colonna stretta (~210px): titolo sezione più piccolo e meno spaziato, così
   "ADDESTRAMENTO" non sborda; se serve va a capo invece di tagliarsi. */
.profilo-extra .sezione > summary { font-size: 12.5px !important; letter-spacing: 1px !important; overflow-wrap: anywhere; }
.profilo-caratteristiche > .blocco-car { margin-bottom: 0 !important; }
/* Destrezza + Costituzione impilate in un'unica riga condivisa (i Punti Ferita) */
.car-coppia { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
/* i gruppi di vitali riempiono la larghezza della loro riga */
.pm-anagrafica, .pm-pf, .pm-gruppo { min-width: 0; }
/* Anagrafica alta quanto il riquadro Forza (riga 1): la prima riga di campi
   (Specie/Taglia/Allineamento) resta in alto e la seconda (Background/Classe/
   Sottoclasse) va in fondo, così Specie è allineata all'inizio di Forza e
   Background alla sua base. */
.pm-anagrafica { display: flex; flex-direction: column; }
.pm-anagrafica > .campi-anagrafica { flex: 1 1 auto; align-content: space-between; }
/* Punti Ferita: la riga 2 è alta quanto Destrezza+Costituzione impilate a
   sinistra; il riquadro PF cresce per riempire tutta quell'altezza (niente più
   spazio vuoto sotto) e resta allineato col resto della griglia. */
.pm-pf { display: flex; flex-direction: column; }
.pm-pf > * { width: 100%; flex: 1 1 auto; }
@media (max-width: 820px) {
  /* Sotto 820px la sezione si impila: prima i dati centrali, poi le
     caratteristiche, infine il ritratto. Niente subgrid: torna tutto a colonna. */
  .profilo-griglia { display: flex; flex-direction: column; align-items: stretch; gap: 12px; }
  .profilo-main { order: 1; display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .profilo-caratteristiche { order: 2; display: flex; flex-direction: column; gap: 8px; width: 100%; }
  .profilo-ritratto { order: 3; width: 100%; }
  .profilo-extra { order: 4; width: 100%; }
  .profilo-caratteristiche > *, .car-coppia, .car-coppia > * { width: 100%; box-sizing: border-box; }
  .ritratto-box { min-height: 300px; }
  .car-coppia { gap: 8px; }
}
/* riquadri vitali: 5 colonne fisse → riga 1: CA | PF(x2) | Riposo | TsMorte ; riga 2: BonusComp | Iniziativa | Velocità | PercPass */
/* grid-auto-rows: auto → ogni riga è alta quanto il suo contenuto (niente più
   spazi vuoti: prima "1fr" forzava tutte le righe all'altezza della più alta).
   align-items: stretch tiene comunque uniformi i riquadri della STESSA riga. */
/* grid-auto-rows: 1fr → tutte le righe di riquadri hanno la stessa altezza
   (es. Classe Armatura/Riposo alti quanto Bonus comp./Iniziativa/Velocità sotto). */
.vitali { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: 1fr; gap: 8px; align-items: stretch; }
/* consente ai riquadri di stringersi sotto la larghezza del contenuto (niente overflow) */
.vitali > * { min-width: 0; }
.vitali > * > * { min-width: 0; }
/* Fascia dettagli incantesimo: scorre in orizzontale su una riga; scrollbar sottile. */
.spell-chips { scrollbar-width: thin; }
.spell-chips::-webkit-scrollbar { height: 5px; }
.spell-chips::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 3px; }
/* i campi anagrafica (con le tendine): font piccolo, padding compatto, allineati in basso */
.campi-anagrafica > * { min-width: 0; display: flex; flex-direction: column; justify-content: flex-end; }
.campi-anagrafica select { max-width: 100%; font-size: 11px !important; padding: 1px 15px 1px 3px !important; height: 20px; line-height: 1.2; background-position: right 3px center !important; background-size: 8px !important; }
.campi-anagrafica .campo-modulo-box { padding: 0 4px !important; min-height: 28px !important; height: 28px; display: flex; align-items: center; overflow: hidden; }
.campi-anagrafica .campo-modulo-label { font-size: 9px !important; margin-top: 2px; }
.selettore-personaggio {
  width: 100%;
  margin: 0 0 8px 0 !important;
}
/* testata: titolo centrato in alto, i due gruppi di pulsanti sotto (ciascuno una
   griglia ordinata). Su desktop MOLTO largo i pulsanti passano in colonna a
   sinistra (vedi @media min-width:1440px), lasciando spazio verticale in cima. */
.app-header { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.app-header-title { text-align: center; white-space: nowrap; margin: 0; }
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
  box-shadow: 0 1px 4px rgba(0,0,0,0.16);
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
  min-height: 30px; padding: 5px 12px; border-radius: 6px;
  border: 1px solid var(--c-gold-dark); background: var(--c-panel-light);
  color: var(--c-ink); font-family: inherit; font-size: 13px; font-weight: normal;
  text-align: center; white-space: nowrap; cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.16);
}
.game-actions-btn:hover { filter: brightness(1.08); }
.game-action-combat-short { display: none; }
@media (max-width: 780px) {
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
  /* su schermi stretti: titolo su una riga sopra, poi ciascun gruppo di pulsanti
     su una propria riga a piena larghezza, centrata e ordinata */
  .app-header { display: flex; flex-direction: column; align-items: stretch; }
  .app-header-title { grid-column: auto; justify-self: auto; order: -1; margin-bottom: 6px !important; }
  /* Telefono: tutti i tasti (comandi + funzioni di gioco) in un'unica barra in
     alto che si dispone su due file. "display: contents" scioglie i gruppi così
     i bottoni scorrono uno dopo l'altro da sinistra a destra. */
  .app-header-side {
    display: grid; grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 5px; align-items: stretch;
  }
  .app-header-side .app-header-group,
  .app-header-side .app-header-language,
  .app-header-side .game-actions-dock { display: contents; }
  .app-header-group:first-of-type .header-label { display: none; }
  .app-header-side .app-header-group > button {
    width: 100%; max-width: none;
    min-height: 34px; padding: 4px 6px !important; font-size: 18px !important;
  }
  .app-shell { padding-left: 8px !important; padding-right: 8px !important; overflow-x: clip; }
  /* Le tre funzioni di gioco occupano due colonne ciascuna: seconda fila piena. */
  .app-header-side .game-actions-btn {
    grid-column: span 2; width: 100%; min-width: 0; max-width: none;
    min-height: 34px; padding: 4px 3px; text-align: center; font-size: 11px;
    overflow: hidden; text-overflow: ellipsis;
  }
  .game-action-combat-full { display: none; }
  .game-action-combat-short { display: inline; }
  /* dadi: pulsanti compatti e leggibili su telefono in riga singola */
  .dadi-riga { justify-content: space-between; flex-wrap: wrap !important; gap: 4px !important; }
  .dadi-riga .dado-btn { flex: 0 0 auto; min-width: 28px !important; width: 28px !important; height: 28px !important; padding: 0 !important; text-align: center; }
  .dadi-riga .dadi-espressione { flex: 1 1 90px !important; max-width: none !important; margin-left: 0 !important; }
  /* modalità di tiro: riga intera a 4 colonne uguali, testo rimpicciolito
     quanto basta perché "Svantaggio" e "Cronologia" stiano su una sola riga */
  .dadi-riga .dadi-modi { flex: 1 1 100%; margin-left: 0 !important; gap: 4px !important; }
  .dadi-riga .dadi-modi button { font-size: 11px !important; padding: 5px 2px !important; }
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
  /* tabella attacchi: celle più compatte e colonna azioni ancorata a destra,
     così la × per eliminare resta cliccabile senza scorrere lo schermo */
  .attacchi-table { font-size: 12px; }
  .attacchi-table th, .attacchi-table td { padding: 5px 4px !important; }
  .attacchi-table .col-azioni {
    position: sticky; right: 0;
    background: var(--c-panel);
    box-shadow: -6px 0 6px -5px rgba(0,0,0,0.35);
  }
}
@media (max-width: 820px) {
  .griglia-scheda { grid-template-columns: 1fr; }
  .selettore-personaggio { width: 100%; }
}
@media (max-width: 560px) {
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
`;
