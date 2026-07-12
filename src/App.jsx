import { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Palette e stili
// ---------------------------------------------------------------------------

// Palette "taverna": legno scuro, pergamena, oro e rosso drago.
const C = {
  bg: '#1b1410',
  panel: '#251b13',
  panelLight: '#31241a',
  border: '#46331f',
  ink: '#ecdfc3',
  inkDim: '#a8946e',
  gold: '#c9a227',
  goldLight: '#eaca6b',
  red: '#b03a2e',
  redDark: '#7c261d',
  green: '#5f8f4e',
};

const styles = {
  app: {
    minHeight: '100vh',
    background: `radial-gradient(ellipse at top, #2a1f16 0%, ${C.bg} 60%)`,
    color: C.ink,
    fontFamily: "Georgia, 'Times New Roman', serif",
    padding: '0 16px 48px',
  },
  header: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '22px 0 6px',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: 30,
    letterSpacing: 2,
    color: C.goldLight,
    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
  },
  hint: { margin: '6px 0 0', color: C.inkDim, fontStyle: 'italic', fontSize: 14 },
  main: { maxWidth: 1080, margin: '0 auto' },
  panel: {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
  },
  panelTitle: {
    margin: '0 0 10px',
    fontSize: 17,
    color: C.goldLight,
    borderBottom: `1px solid ${C.border}`,
    paddingBottom: 6,
    letterSpacing: 1,
  },
  // Barra del tiro (sticky in alto)
  rollBar: {
    position: 'sticky',
    top: 8,
    zIndex: 10,
    background: `linear-gradient(180deg, ${C.panelLight}, ${C.panel})`,
    border: `1px solid ${C.gold}`,
    borderRadius: 12,
    padding: '10px 16px',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    boxShadow: '0 6px 18px rgba(0,0,0,0.55)',
    minHeight: 64,
  },
  d20: (rolling, crit, fumble) => ({
    width: 64,
    height: 64,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    color: crit ? C.goldLight : fumble ? C.red : C.ink,
    background: `linear-gradient(145deg, ${C.panelLight}, ${C.bg})`,
    border: `2px solid ${crit ? C.goldLight : fumble ? C.red : C.gold}`,
    clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
    animation: rolling ? 'd20-spin 0.5s linear infinite' : 'd20-settle 0.35s ease-out',
    userSelect: 'none',
  }),
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
    border: `1px solid ${C.gold}`,
    borderRadius: 8,
    color: C.goldLight,
    fontFamily: 'inherit',
    fontSize: 14,
    cursor: 'pointer',
  },
  buttonPrimary: {
    padding: '8px 18px',
    background: C.gold,
    border: `1px solid ${C.goldLight}`,
    borderRadius: 8,
    color: C.bg,
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
  modeButton: (active) => ({
    padding: '5px 12px',
    background: active ? C.gold : 'transparent',
    border: `1px solid ${active ? C.goldLight : C.border}`,
    borderRadius: 6,
    color: active ? C.bg : C.inkDim,
    fontFamily: 'inherit',
    fontSize: 13,
    cursor: 'pointer',
  }),
  // Layout scheda
  sheetGrid: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, alignItems: 'start' },
  vitalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(108px, 1fr))',
    gap: 10,
  },
  vitalBox: {
    textAlign: 'center',
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: '8px 6px',
  },
  vitalLabel: {
    fontSize: 11,
    color: C.inkDim,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  vitalValue: { fontSize: 21, color: C.goldLight },
  abilityBlock: {
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: '10px 12px',
    marginBottom: 12,
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
    color: C.goldLight,
    cursor: 'pointer',
    padding: '0 8px',
    borderRadius: 8,
  },
  skillRow: (rollable) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '3px 4px',
    borderRadius: 6,
    cursor: rollable ? 'pointer' : 'default',
    fontSize: 14,
  }),
  dot: (livello) => ({
    width: 13,
    height: 13,
    flexShrink: 0,
    borderRadius: '50%',
    border: `2px solid ${livello > 0 ? C.goldLight : C.inkDim}`,
    background: livello === 2 ? C.goldLight : livello === 1 ? C.gold : 'transparent',
    cursor: 'pointer',
  }),
  editable: {
    borderBottom: `1px dashed ${C.inkDim}`,
    cursor: 'text',
    minWidth: 24,
    display: 'inline-block',
  },
  inlineInput: {
    background: C.bg,
    border: `1px solid ${C.gold}`,
    borderRadius: 4,
    color: C.ink,
    fontFamily: 'inherit',
    fontSize: 'inherit',
    padding: '1px 4px',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left',
    color: C.inkDim,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    padding: '4px 8px',
    borderBottom: `1px solid ${C.border}`,
  },
  td: { padding: '6px 8px', borderBottom: `1px solid ${C.border}` },
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

const KEYFRAMES = `
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
`;

// ---------------------------------------------------------------------------
// Regole D&D 5e e parser delle espressioni di dado
// ---------------------------------------------------------------------------

const CARATTERISTICHE = [
  { key: 'forza', label: 'Forza', abbr: 'FOR' },
  { key: 'destrezza', label: 'Destrezza', abbr: 'DES' },
  { key: 'costituzione', label: 'Costituzione', abbr: 'COS' },
  { key: 'intelligenza', label: 'Intelligenza', abbr: 'INT' },
  { key: 'saggezza', label: 'Saggezza', abbr: 'SAG' },
  { key: 'carisma', label: 'Carisma', abbr: 'CAR' },
];

// Le 18 abilità 5e, ciascuna legata alla sua caratteristica.
const ABILITA = [
  { key: 'acrobazia', label: 'Acrobazia', car: 'destrezza' },
  { key: 'addestrareAnimali', label: 'Addestrare Animali', car: 'saggezza' },
  { key: 'arcano', label: 'Arcano', car: 'intelligenza' },
  { key: 'atletica', label: 'Atletica', car: 'forza' },
  { key: 'furtivita', label: 'Furtività', car: 'destrezza' },
  { key: 'indagare', label: 'Indagare', car: 'intelligenza' },
  { key: 'inganno', label: 'Inganno', car: 'carisma' },
  { key: 'intimidire', label: 'Intimidire', car: 'carisma' },
  { key: 'intrattenere', label: 'Intrattenere', car: 'carisma' },
  { key: 'intuizione', label: 'Intuizione', car: 'saggezza' },
  { key: 'medicina', label: 'Medicina', car: 'saggezza' },
  { key: 'natura', label: 'Natura', car: 'intelligenza' },
  { key: 'percezione', label: 'Percezione', car: 'saggezza' },
  { key: 'persuasione', label: 'Persuasione', car: 'carisma' },
  { key: 'rapiditaDiMano', label: 'Rapidità di Mano', car: 'destrezza' },
  { key: 'religione', label: 'Religione', car: 'intelligenza' },
  { key: 'sopravvivenza', label: 'Sopravvivenza', car: 'saggezza' },
  { key: 'storia', label: 'Storia', car: 'intelligenza' },
];

function modificatore(punteggio) {
  const p = Number(punteggio);
  if (!Number.isFinite(p)) return 0;
  return Math.floor((p - 10) / 2);
}

function conSegno(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

function tiraDado(facce) {
  return 1 + Math.floor(Math.random() * facce);
}

/**
 * Parser per espressioni di dado tipo "2d6+3", "1d8", "1d10+1d6+2", "d8-1".
 * Ritorna { termini: [{tipo:'dado', quantita, facce, segno} | {tipo:'fisso', valore, segno}] }
 * oppure null se l'espressione non è valida. Non lancia mai eccezioni.
 */
export function parseEspressioneDado(espressione) {
  if (typeof espressione !== 'string') return null;
  const pulita = espressione.toLowerCase().replace(/\s+/g, '');
  if (!pulita || /[^0-9d+\-]/.test(pulita)) return null;

  // Spezza in token con il proprio segno: "1d8+2-1d4" -> ["1d8", "+2", "-1d4"]
  const token = pulita.match(/[+-]?[^+-]+/g);
  if (!token || token.length > 20) return null;

  const termini = [];
  let dadiTotali = 0;
  for (const t of token) {
    const dado = t.match(/^([+-]?)(\d*)d(\d+)$/);
    if (dado) {
      const segno = dado[1] === '-' ? -1 : 1;
      const quantita = dado[2] === '' ? 1 : parseInt(dado[2], 10);
      const facce = parseInt(dado[3], 10);
      if (quantita < 1 || quantita > 100 || facce < 2 || facce > 1000) return null;
      dadiTotali += quantita;
      if (dadiTotali > 200) return null;
      termini.push({ tipo: 'dado', quantita, facce, segno });
      continue;
    }
    const fisso = t.match(/^([+-]?)(\d+)$/);
    if (fisso) {
      const segno = fisso[1] === '-' ? -1 : 1;
      termini.push({ tipo: 'fisso', valore: parseInt(fisso[2], 10), segno });
      continue;
    }
    return null;
  }
  if (!termini.some((t) => t.tipo === 'dado')) return null;
  return { termini };
}

/**
 * Tira un'espressione di danno già parsata.
 * Regola del critico 5e: con `critico` = true raddoppiano SOLO i dadi
 * (2d6+3 -> 4d6+3); il modificatore fisso resta invariato.
 */
export function tiraDanni(parsata, critico = false) {
  const dettagli = [];
  let totale = 0;
  for (const t of parsata.termini) {
    if (t.tipo === 'dado') {
      const quantita = t.quantita * (critico ? 2 : 1);
      const tiri = Array.from({ length: quantita }, () => tiraDado(t.facce));
      const somma = tiri.reduce((a, b) => a + b, 0);
      totale += t.segno * somma;
      dettagli.push(`${t.segno < 0 ? '-' : ''}${quantita}d${t.facce} [${tiri.join(', ')}]`);
    } else {
      totale += t.segno * t.valore;
      dettagli.push(`${t.segno < 0 ? '-' : '+'}${t.valore}`);
    }
  }
  return { totale: Math.max(0, totale), dettaglio: dettagli.join(' ') };
}

/** Tira il d20 nella modalità scelta: normale, vantaggio o svantaggio. */
function tiraD20(modalita) {
  const a = tiraDado(20);
  if (modalita === 'normale') return { naturale: a, dadi: [a] };
  const b = tiraDado(20);
  const naturale = modalita === 'vantaggio' ? Math.max(a, b) : Math.min(a, b);
  return { naturale, dadi: [a, b] };
}

// ---------------------------------------------------------------------------
// Modello della scheda
// ---------------------------------------------------------------------------

function schedaVuota() {
  return {
    nome: 'Avventuriero senza nome',
    background: '',
    classe: '',
    sottoclasse: '',
    specie: '',
    allineamento: '',
    livello: 1,
    ca: 10,
    pfMax: 10,
    pfAttuali: 10,
    pfTemp: 0,
    dadiVita: '1d8',
    velocita: 9,
    taglia: 'Media',
    bonusCompetenza: 2,
    ispirazione: false,
    tsMorte: { successi: 0, fallimenti: 0 },
    caratteristiche: {
      forza: 10,
      destrezza: 10,
      costituzione: 10,
      intelligenza: 10,
      saggezza: 10,
      carisma: 10,
    },
    // true = competente nel tiro salvezza
    tiriSalvezza: {
      forza: false,
      destrezza: false,
      costituzione: false,
      intelligenza: false,
      saggezza: false,
      carisma: false,
    },
    // 0 = nessuna competenza, 1 = competenza, 2 = maestria (expertise)
    abilita: Object.fromEntries(ABILITA.map((a) => [a.key, 0])),
    attacchi: [{ id: 1, nome: 'Spada lunga', bonus: 5, danno: '1d8+3', tipoDanno: 'Tagliente', note: '' }],
    incantatore: { caratteristica: '' }, // '' = non incantatore
  };
}

/** Bonus di un'abilità: mod caratteristica + competenza (1x o 2x per maestria). */
function bonusAbilita(scheda, abilita) {
  const def = ABILITA.find((a) => a.key === abilita);
  if (!def) return 0;
  const livComp = scheda.abilita[abilita] || 0;
  return modificatore(scheda.caratteristiche[def.car]) + livComp * scheda.bonusCompetenza;
}

/** Bonus di un tiro salvezza: mod caratteristica + eventuale competenza. */
function bonusTiroSalvezza(scheda, car) {
  return (
    modificatore(scheda.caratteristiche[car]) +
    (scheda.tiriSalvezza[car] ? scheda.bonusCompetenza : 0)
  );
}

// Esempio pronto all'uso: Flyora delle Acque Nere (scheda PDF di riferimento).
const ESEMPIO_FLYORA = {
  nome: 'Flyora delle Acque Nere',
  background: 'Eremita',
  classe: 'Stregone',
  sottoclasse: 'della Magia Selva',
  specie: 'Elfo Alto',
  allineamento: 'Neutrale',
  livello: 4,
  ca: 12,
  pfMax: 30,
  pfAttuali: 30,
  pfTemp: 0,
  dadiVita: '4d6',
  velocita: 9,
  taglia: 'Media',
  bonusCompetenza: 2,
  caratteristiche: { forza: 12, destrezza: 15, costituzione: 16, intelligenza: 14, saggezza: 15, carisma: 18 },
  tiriSalvezza: { forza: false, destrezza: false, costituzione: true, intelligenza: false, saggezza: false, carisma: true },
  abilita: {
    arcano: 1, religione: 1, intuizione: 1, medicina: 1, percezione: 1, sopravvivenza: 1, persuasione: 1,
  },
  attacchi: [
    { id: 1, nome: 'Spada', bonus: 4, danno: '1d6+2', tipoDanno: 'Perforante', note: 'Accurata, Leggera' },
    { id: 2, nome: 'Pugnale x2', bonus: 4, danno: '1d4+2', tipoDanno: 'Perforante', note: '6/18m Accurata, Leggera, Lancio' },
    { id: 3, nome: 'Bastone Ferrato (1 mano)', bonus: 3, danno: '1d6+1', tipoDanno: 'Contundente', note: 'Versatile' },
    { id: 4, nome: 'Bastone Ferrato (2 mani)', bonus: 3, danno: '1d8+1', tipoDanno: 'Contundente', note: 'Versatile' },
  ],
  incantatore: { caratteristica: 'carisma' },
};

// ---------------------------------------------------------------------------
// Persistenza su localStorage — NON MODIFICARE loadState/saveState
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'tavolo-dei-dadi:scheda:v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return schedaVuota();
    const parsed = JSON.parse(raw);
    return { ...schedaVuota(), ...parsed };
  } catch {
    return schedaVuota();
  }
}

function saveState(scheda) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scheda));
  } catch {
    // storage pieno o non disponibile: ignora
  }
}

// ---------------------------------------------------------------------------
// Import PDF — NON MODIFICARE la logica di transcribePdf
// ---------------------------------------------------------------------------

async function transcribePdf(file) {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Lettura del file fallita'));
    reader.readAsDataURL(file);
  });

  const risposta = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfBase64: base64 }),
  });
  if (!risposta.ok) {
    const errore = await risposta.json().catch(() => ({}));
    throw new Error(errore.error || `Errore del server (${risposta.status})`);
  }
  return risposta.json();
}

/** Normalizza i dati importati dal PDF (o dall'esempio) nel modello della scheda. */
function normalizeImported(dati) {
  const base = schedaVuota();
  if (!dati || typeof dati !== 'object') return base;

  const num = (v, fallback) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
  const str = (v, fallback = '') => (typeof v === 'string' ? v : fallback);

  const car = { ...base.caratteristiche };
  for (const { key } of CARATTERISTICHE) {
    const v = Number(dati.caratteristiche?.[key]);
    if (Number.isFinite(v) && v >= 1 && v <= 30) car[key] = v;
  }

  const ts = { ...base.tiriSalvezza };
  for (const { key } of CARATTERISTICHE) {
    ts[key] = Boolean(dati.tiriSalvezza?.[key]);
  }

  const abilita = { ...base.abilita };
  for (const { key } of ABILITA) {
    const v = dati.abilita?.[key];
    abilita[key] = v === 2 ? 2 : v === 1 || v === true ? 1 : 0;
  }

  const attacchi = Array.isArray(dati.attacchi)
    ? dati.attacchi
        .filter((a) => a && typeof a === 'object' && a.nome)
        .slice(0, 20)
        .map((a, i) => ({
          id: Date.now() + i,
          nome: String(a.nome),
          bonus: num(a.bonus, 0),
          danno: typeof a.danno === 'string' && parseEspressioneDado(a.danno) ? a.danno.trim() : '',
          tipoDanno: str(a.tipoDanno),
          note: str(a.note),
        }))
    : base.attacchi;

  const carIncantatore = CARATTERISTICHE.some((c) => c.key === dati.incantatore?.caratteristica)
    ? dati.incantatore.caratteristica
    : '';

  const clampTs = (v) => Math.max(0, Math.min(3, num(v, 0)));
  const pfMax = num(dati.pfMax, base.pfMax);
  return {
    ...base,
    pfTemp: num(dati.pfTemp, 0),
    ispirazione: Boolean(dati.ispirazione),
    tsMorte: {
      successi: clampTs(dati.tsMorte?.successi),
      fallimenti: clampTs(dati.tsMorte?.fallimenti),
    },
    nome: str(dati.nome, base.nome) || base.nome,
    background: str(dati.background),
    classe: str(dati.classe),
    sottoclasse: str(dati.sottoclasse),
    specie: str(dati.specie),
    allineamento: str(dati.allineamento),
    livello: num(dati.livello, base.livello),
    ca: num(dati.ca, base.ca),
    pfMax,
    pfAttuali: num(dati.pfAttuali, pfMax),
    dadiVita: typeof dati.dadiVita === 'string' && parseEspressioneDado(dati.dadiVita) ? dati.dadiVita : base.dadiVita,
    velocita: num(dati.velocita, base.velocita),
    taglia: str(dati.taglia, base.taglia) || base.taglia,
    bonusCompetenza: num(dati.bonusCompetenza, base.bonusCompetenza),
    caratteristiche: car,
    tiriSalvezza: ts,
    abilita,
    attacchi: attacchi.length ? attacchi : base.attacchi,
    incantatore: { caratteristica: carIncantatore },
  };
}

// ---------------------------------------------------------------------------
// Componenti di editing inline (1 click = modifica, doppio click = tiro)
// ---------------------------------------------------------------------------

/**
 * Valore modificabile in linea. Un click apre l'editor; se `onRoll` è
 * definito, il click viene ritardato per distinguere il doppio click,
 * che invece lancia il tiro.
 */
function Editable({ value, onChange, onRoll, tipo = 'testo', width, style, title }) {
  const [editing, setEditing] = useState(false);
  const [bozza, setBozza] = useState('');
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function apriEditor() {
    setBozza(String(value ?? ''));
    setEditing(true);
  }

  function handleClick(e) {
    e.stopPropagation();
    if (!onRoll) return apriEditor();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(apriEditor, 260);
  }

  function handleDoubleClick(e) {
    e.stopPropagation();
    if (!onRoll) return;
    clearTimeout(timerRef.current);
    onRoll();
  }

  function commit() {
    setEditing(false);
    if (tipo === 'numero') {
      const n = Number(bozza);
      onChange(Number.isFinite(n) ? n : 0);
    } else {
      onChange(bozza);
    }
  }

  if (editing) {
    return (
      <input
        style={{ ...styles.inlineInput, width: width || 70 }}
        autoFocus
        type={tipo === 'numero' ? 'number' : 'text'}
        value={bozza}
        onChange={(e) => setBozza(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
      />
    );
  }

  return (
    <span
      style={{ ...styles.editable, ...style }}
      title={title || (onRoll ? '1 click: modifica · doppio click: tira' : '1 click: modifica')}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {String(value ?? '') === '' ? '—' : String(value)}
    </span>
  );
}

/** Elemento solo-tiro: doppio click per tirare (il click singolo non fa nulla). */
function Rollable({ onRoll, children, style, title }) {
  return (
    <span
      style={{ cursor: 'pointer', ...style }}
      title={title || 'Doppio click: tira'}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onRoll();
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [scheda, setScheda] = useState(loadState);
  const [modalita, setModalita] = useState('normale'); // normale | vantaggio | svantaggio
  const [rolling, setRolling] = useState(false);
  const [faccia, setFaccia] = useState(20);
  const [tiro, setTiro] = useState(null);
  const [danni, setDanni] = useState(null);
  const [importInCorso, setImportInCorso] = useState(false);
  const [erroreImport, setErroreImport] = useState('');
  const [espressioneLibera, setEspressioneLibera] = useState('');
  const [erroreEspressione, setErroreEspressione] = useState(false);
  const intervalRef = useRef(null);
  const fileRef = useRef(null);
  const jsonRef = useRef(null);

  useEffect(() => {
    saveState(scheda);
  }, [scheda]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function aggiorna(patch) {
    setScheda((s) => ({ ...s, ...patch }));
  }

  /** Tiro di d20 generico con animazione. `extra` finisce nello stato del tiro. */
  function lanciaD20(etichetta, bonus, extra = {}) {
    clearInterval(intervalRef.current);
    setDanni(null);
    setTiro(null);
    setRolling(true);
    intervalRef.current = setInterval(() => setFaccia(tiraDado(20)), 70);

    const { naturale, dadi } = tiraD20(modalita);
    setTimeout(() => {
      clearInterval(intervalRef.current);
      setFaccia(naturale);
      setRolling(false);
      setTiro({ etichetta, naturale, dadi, bonus, totale: naturale + bonus, modalita, ...extra });
    }, 850);
  }

  /** Tiro di danni diretto (senza tiro per colpire): mai critico. */
  function lanciaDanniDiretti(etichetta, espressione) {
    const parsata = parseEspressioneDado(espressione);
    if (!parsata) return;
    clearInterval(intervalRef.current);
    setTiro(null);
    setDanni({ etichetta, ...tiraDanni(parsata, false), critico: false });
  }

  /** Danni dell'attacco corrente (dal tiro per colpire in corso). */
  function lanciaDanniAttacco() {
    if (!tiro?.attacco) return;
    const parsata = parseEspressioneDado(tiro.attacco.danno);
    if (!parsata) return;
    const critico = tiro.naturale === 20;
    setDanni({ etichetta: `Danni: ${tiro.attacco.nome}`, ...tiraDanni(parsata, critico), critico });
  }

  /** Tiro salvezza contro morte: regole 5e complete. */
  function tiroSalvezzaMorte() {
    clearInterval(intervalRef.current);
    setDanni(null);
    setTiro(null);
    setRolling(true);
    intervalRef.current = setInterval(() => setFaccia(tiraDado(20)), 70);

    const { naturale, dadi } = tiraD20(modalita);
    setTimeout(() => {
      clearInterval(intervalRef.current);
      setFaccia(naturale);
      setRolling(false);
      let esito;
      setScheda((s) => {
        let { successi, fallimenti } = s.tsMorte;
        if (naturale === 20) {
          esito = '20 naturale: torni a 1 PF!';
          return { ...s, pfAttuali: 1, tsMorte: { successi: 0, fallimenti: 0 } };
        }
        if (naturale === 1) {
          fallimenti = Math.min(3, fallimenti + 2);
          esito = '1 naturale: due fallimenti!';
        } else if (naturale >= 10) {
          successi = Math.min(3, successi + 1);
          esito = 'Successo';
        } else {
          fallimenti = Math.min(3, fallimenti + 1);
          esito = 'Fallimento';
        }
        if (successi >= 3) esito = 'Terzo successo: sei stabile!';
        if (fallimenti >= 3) esito = 'Terzo fallimento: sei morto.';
        return { ...s, tsMorte: { successi, fallimenti } };
      });
      setTiro({
        etichetta: 'TS contro morte',
        naturale,
        dadi,
        bonus: 0,
        totale: naturale,
        modalita,
        esito,
      });
    }, 850);
  }

  /** Tira un dado vita (1 dado del tipo indicato + mod COS). */
  function tiraDadoVita() {
    const parsata = parseEspressioneDado(scheda.dadiVita);
    const facce = parsata?.termini.find((t) => t.tipo === 'dado')?.facce;
    if (!facce) return;
    const dado = tiraDado(facce);
    const mod = modificatore(scheda.caratteristiche.costituzione);
    setTiro(null);
    setDanni({
      etichetta: 'Dado vita (guarigione)',
      totale: Math.max(0, dado + mod),
      dettaglio: `1d${facce} [${dado}] ${conSegno(mod)}`,
      critico: false,
      guarigione: true,
    });
  }

  /** Tiro libero di un singolo dado (il d20 passa dal tiro animato). */
  function tiroLibero(facce) {
    if (facce === 20) return lanciaD20('Tiro libero d20', 0);
    const valore = tiraDado(facce);
    clearInterval(intervalRef.current);
    setTiro(null);
    setDanni({ etichetta: 'Tiro libero', totale: valore, dettaglio: `1d${facce} [${valore}]`, libero: true });
  }

  /** Tiro libero di un'espressione qualsiasi (es. "3d6+2"). */
  function tiroEspressione() {
    const parsata = parseEspressioneDado(espressioneLibera);
    if (!parsata) {
      setErroreEspressione(true);
      return;
    }
    setErroreEspressione(false);
    clearInterval(intervalRef.current);
    setTiro(null);
    setDanni({
      etichetta: `Tiro libero: ${espressioneLibera.trim()}`,
      ...tiraDanni(parsata, false),
      libero: true,
    });
  }

  /** Scarica la scheda corrente come file JSON. */
  function esportaJson() {
    const nomeFile = (scheda.nome || 'scheda')
      .toLowerCase()
      .replace(/[^a-z0-9àèéìòù]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'scheda';
    const blob = new Blob([JSON.stringify(scheda, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomeFile}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Carica una scheda da file JSON (esportato dall'app o compatibile). */
  async function importaJson(evento) {
    const file = evento.target.files?.[0];
    evento.target.value = '';
    if (!file) return;
    setErroreImport('');
    try {
      const dati = JSON.parse(await file.text());
      setScheda(normalizeImported(dati));
    } catch {
      setErroreImport('File JSON non valido: usa un file esportato da Tavolo dei Dadi.');
    }
  }

  async function importaPdf(evento) {
    const file = evento.target.files?.[0];
    evento.target.value = '';
    if (!file) return;
    setErroreImport('');
    setImportInCorso(true);
    try {
      const dati = await transcribePdf(file);
      setScheda(normalizeImported(dati));
    } catch (err) {
      setErroreImport(err.message || 'Import fallito');
    } finally {
      setImportInCorso(false);
    }
  }

  const critico = tiro?.naturale === 20;
  const fallimento = tiro?.naturale === 1;
  const dannoAttaccoValido = tiro?.attacco && parseEspressioneDado(tiro.attacco.danno || '');
  const percezionePassiva = 10 + bonusAbilita(scheda, 'percezione');
  const modIncantatore = scheda.incantatore.caratteristica
    ? modificatore(scheda.caratteristiche[scheda.incantatore.caratteristica])
    : null;

  return (
    <div style={styles.app}>
      <style>{KEYFRAMES}</style>
      <header style={styles.header}>
        <h1 style={styles.title}>⚄ Tavolo dei Dadi ⚄</h1>
        <p style={styles.hint}>1 click per modificare · doppio click per tirare il dado</p>
      </header>

      <main style={styles.main}>
        {/* Barra del tiro */}
        <div style={styles.rollBar}>
          <div style={styles.d20(rolling, !rolling && critico, !rolling && fallimento)}>{faccia}</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            {tiro && !rolling ? (
              <>
                <div style={styles.detail}>
                  {tiro.etichetta}
                  {tiro.dadi.length > 1 && ` · ${tiro.modalita} [${tiro.dadi.join(', ')}] → ${tiro.naturale}`}
                </div>
                <div style={{ fontSize: 22, color: C.goldLight }}>
                  {tiro.naturale} {tiro.bonus !== 0 && `${conSegno(tiro.bonus)} `}= {tiro.totale}
                  {critico && <span style={styles.badge(C.goldLight)}>⚔ CRITICO!</span>}
                  {fallimento && <span style={styles.badge(C.red)}>💀 Fallimento critico</span>}
                  {tiro.esito && <span style={styles.badge(C.goldLight)}>{tiro.esito}</span>}
                </div>
                {tiro.attacco && (
                  dannoAttaccoValido ? (
                    <button style={{ ...styles.buttonPrimary, marginTop: 6 }} onClick={lanciaDanniAttacco}>
                      🗡 Tira danni ({tiro.attacco.danno}{critico ? ', dadi raddoppiati' : ''})
                    </button>
                  ) : (
                    <div style={styles.detail}>Danno non impostato o non valido per questo attacco.</div>
                  )
                )}
              </>
            ) : !rolling && !danni ? (
              <div style={styles.detail}>
                Doppio click su caratteristiche, tiri salvezza, abilità, attacchi, iniziativa…
                e il dado rotola qui.
              </div>
            ) : null}
            {danni && (
              <div style={{ marginTop: tiro ? 6 : 0 }}>
                <div style={{ fontSize: 20, color: danni.libero ? C.goldLight : danni.guarigione ? C.green : C.red }}>
                  {danni.libero ? '🎲' : danni.guarigione ? '✚' : '💥'} {danni.totale}
                  {danni.libero ? '' : danni.guarigione ? ' PF recuperati' : ' danni'}
                  {danni.critico ? ' (critico!)' : ''}
                </div>
                <div style={styles.detail}>
                  {danni.etichetta} · {danni.dettaglio} = {danni.totale}
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['normale', 'vantaggio', 'svantaggio'].map((m) => (
              <button key={m} style={styles.modeButton(modalita === m)} onClick={() => setModalita(m)}>
                {m === 'normale' ? 'Normale' : m === 'vantaggio' ? 'Vantaggio' : 'Svantaggio'}
              </button>
            ))}
          </div>
        </div>

        {/* Dado libero */}
        <section style={{ ...styles.panel, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '10px 16px' }}>
          <span style={{ ...styles.detail, marginRight: 4 }}>Dado libero:</span>
          {[4, 6, 8, 10, 12, 20, 100].map((facce) => (
            <button key={facce} style={styles.button} onClick={() => tiroLibero(facce)}>
              d{facce}
            </button>
          ))}
          <span style={{ flex: 1 }} />
          <input
            style={{
              ...styles.inlineInput,
              width: 110,
              padding: '6px 8px',
              ...(erroreEspressione ? { borderColor: C.red } : {}),
            }}
            placeholder="es. 3d6+2"
            value={espressioneLibera}
            onChange={(e) => {
              setEspressioneLibera(e.target.value);
              setErroreEspressione(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && tiroEspressione()}
          />
          <button style={styles.button} onClick={tiroEspressione}>
            Tira
          </button>
          {erroreEspressione && <span style={{ color: C.red, fontSize: 13 }}>Espressione non valida</span>}
        </section>

        {/* Intestazione scheda */}
        <section style={styles.panel}>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'baseline' }}>
            <div style={{ fontSize: 24, color: C.goldLight }}>
              <Editable value={scheda.nome} onChange={(v) => aggiorna({ nome: v })} width={260} />
            </div>
            <div style={styles.detail}>
              <Editable value={scheda.classe} onChange={(v) => aggiorna({ classe: v })} width={110} />{' '}
              <Editable value={scheda.sottoclasse} onChange={(v) => aggiorna({ sottoclasse: v })} width={130} />
              {' · liv. '}
              <Editable value={scheda.livello} tipo="numero" onChange={(v) => aggiorna({ livello: v })} width={40} />
            </div>
            <div style={styles.detail}>
              <Editable value={scheda.specie} onChange={(v) => aggiorna({ specie: v })} width={100} />
              {' · '}
              <Editable value={scheda.background} onChange={(v) => aggiorna({ background: v })} width={100} />
              {' · '}
              <Editable value={scheda.allineamento} onChange={(v) => aggiorna({ allineamento: v })} width={90} />
            </div>
          </div>
        </section>

        {/* Vitals */}
        <section style={styles.panel}>
          <div style={styles.vitalsGrid}>
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Classe Armatura</div>
              <div style={styles.vitalValue}>
                <Editable value={scheda.ca} tipo="numero" onChange={(v) => aggiorna({ ca: v })} width={46} />
              </div>
            </div>
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Punti Ferita</div>
              <div style={styles.vitalValue}>
                <Editable value={scheda.pfAttuali} tipo="numero" onChange={(v) => aggiorna({ pfAttuali: v })} width={44} />
                <span style={{ color: C.inkDim, fontSize: 15 }}>
                  {' / '}
                  <Editable value={scheda.pfMax} tipo="numero" onChange={(v) => aggiorna({ pfMax: v })} width={44} />
                </span>
              </div>
              <div style={styles.detail}>
                temp: <Editable value={scheda.pfTemp} tipo="numero" onChange={(v) => aggiorna({ pfTemp: v })} width={36} />
              </div>
            </div>
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Dadi Vita</div>
              <div style={styles.vitalValue}>
                <Editable
                  value={scheda.dadiVita}
                  onChange={(v) => aggiorna({ dadiVita: v })}
                  onRoll={tiraDadoVita}
                  width={56}
                />
              </div>
              <div style={styles.detail}>doppio click: guarigione</div>
            </div>
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>
                <Rollable onRoll={tiroSalvezzaMorte} title="Doppio click: TS contro morte">
                  TS Morte 🎲
                </Rollable>
              </div>
              <div>
                {[1, 2, 3].map((i) => (
                  <span
                    key={`s${i}`}
                    style={styles.pip(scheda.tsMorte.successi >= i, C.green)}
                    title={`Successi: ${scheda.tsMorte.successi}`}
                    onClick={() =>
                      aggiorna({
                        tsMorte: {
                          ...scheda.tsMorte,
                          successi: scheda.tsMorte.successi >= i ? i - 1 : i,
                        },
                      })
                    }
                  />
                ))}
                <span style={{ margin: '0 4px', color: C.inkDim }}>·</span>
                {[1, 2, 3].map((i) => (
                  <span
                    key={`f${i}`}
                    style={styles.pip(scheda.tsMorte.fallimenti >= i, C.red)}
                    title={`Fallimenti: ${scheda.tsMorte.fallimenti}`}
                    onClick={() =>
                      aggiorna({
                        tsMorte: {
                          ...scheda.tsMorte,
                          fallimenti: scheda.tsMorte.fallimenti >= i ? i - 1 : i,
                        },
                      })
                    }
                  />
                ))}
              </div>
            </div>
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Bonus Competenza</div>
              <div style={styles.vitalValue}>
                <Editable
                  value={scheda.bonusCompetenza}
                  tipo="numero"
                  onChange={(v) => aggiorna({ bonusCompetenza: v })}
                  width={40}
                />
              </div>
            </div>
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Iniziativa</div>
              <div style={styles.vitalValue}>
                <Rollable
                  onRoll={() =>
                    lanciaD20('Iniziativa', modificatore(scheda.caratteristiche.destrezza))
                  }
                >
                  {conSegno(modificatore(scheda.caratteristiche.destrezza))} 🎲
                </Rollable>
              </div>
            </div>
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Velocità</div>
              <div style={styles.vitalValue}>
                <Editable value={scheda.velocita} tipo="numero" onChange={(v) => aggiorna({ velocita: v })} width={40} />
                <span style={{ fontSize: 13, color: C.inkDim }}> m</span>
              </div>
            </div>
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Taglia</div>
              <div style={styles.vitalValue}>
                <Editable value={scheda.taglia} onChange={(v) => aggiorna({ taglia: v })} width={70} />
              </div>
            </div>
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Percezione Passiva</div>
              <div style={styles.vitalValue}>{percezionePassiva}</div>
            </div>
            <div style={styles.vitalBox}>
              <div style={styles.vitalLabel}>Ispirazione</div>
              <div
                style={{ ...styles.vitalValue, cursor: 'pointer' }}
                title="Click per attivare/disattivare"
                onClick={() => aggiorna({ ispirazione: !scheda.ispirazione })}
              >
                {scheda.ispirazione ? '★' : '☆'}
              </div>
            </div>
          </div>
        </section>

        {/* Corpo scheda: caratteristiche a sinistra, resto a destra */}
        <div style={styles.sheetGrid}>
          <div>
            {CARATTERISTICHE.map(({ key, label, abbr }) => {
              const mod = modificatore(scheda.caratteristiche[key]);
              const bonusTS = bonusTiroSalvezza(scheda, key);
              const abilitaDellaCar = ABILITA.filter((a) => a.car === key);
              return (
                <div key={key} style={styles.abilityBlock}>
                  <div style={styles.abilityHead}>
                    <div>
                      <div style={{ fontSize: 13, color: C.inkDim, letterSpacing: 1 }}>{label.toUpperCase()}</div>
                      <div style={styles.detail}>
                        punteggio{' '}
                        <Editable
                          value={scheda.caratteristiche[key]}
                          tipo="numero"
                          width={40}
                          onChange={(v) =>
                            aggiorna({ caratteristiche: { ...scheda.caratteristiche, [key]: v } })
                          }
                        />
                      </div>
                    </div>
                    <Rollable
                      onRoll={() => lanciaD20(`Prova di ${label}`, mod)}
                      style={styles.abilityMod}
                      title={`Doppio click: prova di ${label}`}
                    >
                      {conSegno(mod)}
                    </Rollable>
                  </div>

                  <div
                    style={styles.skillRow(true)}
                    title={`Doppio click: tiro salvezza di ${label} · click sul pallino: competenza`}
                    onDoubleClick={() => lanciaD20(`Tiro salvezza: ${label}`, bonusTS)}
                  >
                    <span
                      style={styles.dot(scheda.tiriSalvezza[key] ? 1 : 0)}
                      onClick={(e) => {
                        e.stopPropagation();
                        aggiorna({ tiriSalvezza: { ...scheda.tiriSalvezza, [key]: !scheda.tiriSalvezza[key] } });
                      }}
                    />
                    <strong style={{ width: 32 }}>{conSegno(bonusTS)}</strong>
                    <em>Tiro salvezza</em>
                  </div>

                  {abilitaDellaCar.map((a) => {
                    const bonus = bonusAbilita(scheda, a.key);
                    const liv = scheda.abilita[a.key] || 0;
                    return (
                      <div
                        key={a.key}
                        style={styles.skillRow(true)}
                        title={`Doppio click: prova di ${a.label} · click sul pallino: competenza/maestria`}
                        onDoubleClick={() => lanciaD20(`${a.label} (${abbr})`, bonus)}
                      >
                        <span
                          style={styles.dot(liv)}
                          onClick={(e) => {
                            e.stopPropagation();
                            aggiorna({ abilita: { ...scheda.abilita, [a.key]: (liv + 1) % 3 } });
                          }}
                        />
                        <strong style={{ width: 32 }}>{conSegno(bonus)}</strong>
                        <span>
                          {a.label}
                          {liv === 2 && <span style={{ color: C.goldLight }}> ✶</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div>
            {/* Armi e attacchi */}
            <section style={styles.panel}>
              <h2 style={styles.panelTitle}>Armi e trucchetti da combattimento</h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nome</th>
                    <th style={styles.th}>Bonus att.</th>
                    <th style={styles.th}>Danno e tipo</th>
                    <th style={styles.th}>Note</th>
                    <th style={styles.th} />
                  </tr>
                </thead>
                <tbody>
                  {scheda.attacchi.map((a) => {
                    const aggiornaAttacco = (patch) =>
                      aggiorna({
                        attacchi: scheda.attacchi.map((x) => (x.id === a.id ? { ...x, ...patch } : x)),
                      });
                    const dannoValido = a.danno.trim() === '' || parseEspressioneDado(a.danno);
                    return (
                      <tr key={a.id}>
                        <td style={styles.td}>
                          <Editable
                            value={a.nome}
                            width={150}
                            onChange={(v) => aggiornaAttacco({ nome: v })}
                            onRoll={() => lanciaD20(`Attacco: ${a.nome}`, a.bonus, { attacco: a })}
                          />
                        </td>
                        <td style={styles.td}>
                          <Editable
                            value={conSegno(a.bonus)}
                            width={44}
                            onChange={(v) => aggiornaAttacco({ bonus: Number(String(v).replace('+', '')) || 0 })}
                            onRoll={() => lanciaD20(`Attacco: ${a.nome}`, a.bonus, { attacco: a })}
                          />
                        </td>
                        <td style={{ ...styles.td, color: dannoValido ? undefined : C.red }}>
                          <Editable
                            value={a.danno}
                            width={80}
                            onChange={(v) => aggiornaAttacco({ danno: v })}
                            onRoll={
                              parseEspressioneDado(a.danno)
                                ? () => lanciaDanniDiretti(`Danni: ${a.nome}`, a.danno)
                                : undefined
                            }
                            title="1 click: modifica · doppio click: tira solo i danni"
                          />{' '}
                          <Editable value={a.tipoDanno} width={90} onChange={(v) => aggiornaAttacco({ tipoDanno: v })} />
                        </td>
                        <td style={styles.td}>
                          <Editable value={a.note} width={130} onChange={(v) => aggiornaAttacco({ note: v })} />
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button
                            style={styles.buttonDanger}
                            onClick={() => aggiorna({ attacchi: scheda.attacchi.filter((x) => x.id !== a.id) })}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  style={styles.button}
                  onClick={() =>
                    aggiorna({
                      attacchi: [
                        ...scheda.attacchi,
                        { id: Date.now(), nome: 'Nuovo attacco', bonus: 0, danno: '', tipoDanno: '', note: '' },
                      ],
                    })
                  }
                >
                  + Aggiungi
                </button>
                <span style={styles.detail}>
                  Doppio click sul nome o sul bonus: tiro per colpire · sul danno: solo danni.
                </span>
              </div>
            </section>

            {/* Incantesimi */}
            <section style={styles.panel}>
              <h2 style={styles.panelTitle}>Incantesimi</h2>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={styles.detail}>
                  Caratteristica da incantatore:{' '}
                  <select
                    style={{ ...styles.inlineInput, padding: '4px 6px' }}
                    value={scheda.incantatore.caratteristica}
                    onChange={(e) => aggiorna({ incantatore: { caratteristica: e.target.value } })}
                  >
                    <option value="">— non incantatore —</option>
                    {CARATTERISTICHE.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                {modIncantatore !== null && (
                  <>
                    <div style={styles.vitalBox}>
                      <div style={styles.vitalLabel}>Modificatore</div>
                      <div style={styles.vitalValue}>{conSegno(modIncantatore)}</div>
                    </div>
                    <div style={styles.vitalBox}>
                      <div style={styles.vitalLabel}>CD Incantesimi</div>
                      <div style={styles.vitalValue}>{8 + scheda.bonusCompetenza + modIncantatore}</div>
                    </div>
                    <div style={styles.vitalBox}>
                      <div style={styles.vitalLabel}>Attacco Incantesimo</div>
                      <div style={styles.vitalValue}>
                        <Rollable
                          onRoll={() =>
                            lanciaD20('Attacco con incantesimo', scheda.bonusCompetenza + modIncantatore)
                          }
                        >
                          {conSegno(scheda.bonusCompetenza + modIncantatore)} 🎲
                        </Rollable>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Import / export */}
            <section style={styles.panel}>
              <h2 style={styles.panelTitle}>Importa / esporta scheda</h2>
              <p style={styles.detail}>
                Importa da PDF (trascrizione automatica: serve il server con la chiave API),
                oppure salva e ricarica la scheda come file JSON per portarla su un altro
                dispositivo o tenerne una copia.
              </p>
              <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={importaPdf} />
              <input ref={jsonRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={importaJson} />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button style={styles.buttonPrimary} disabled={importInCorso} onClick={() => fileRef.current?.click()}>
                  {importInCorso ? 'Trascrizione in corso…' : '📜 Importa scheda PDF'}
                </button>
                <button style={styles.button} onClick={esportaJson}>
                  💾 Esporta JSON
                </button>
                <button style={styles.button} onClick={() => jsonRef.current?.click()}>
                  📂 Importa JSON
                </button>
                <button
                  style={styles.button}
                  onClick={() => setScheda(normalizeImported(ESEMPIO_FLYORA))}
                  title="Carica la scheda di esempio (Flyora delle Acque Nere)"
                >
                  ✨ Carica esempio: Flyora
                </button>
                <button
                  style={styles.buttonDanger}
                  onClick={() => window.confirm('Ripartire da una scheda vuota?') && setScheda(schedaVuota())}
                >
                  Nuova scheda vuota
                </button>
              </div>
              {erroreImport && <div style={{ color: C.red, marginTop: 8 }}>{erroreImport}</div>}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
