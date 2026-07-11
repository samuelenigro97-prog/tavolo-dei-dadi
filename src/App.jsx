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
    maxWidth: 860,
    margin: '0 auto',
    padding: '28px 0 12px',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: 34,
    letterSpacing: 2,
    color: C.goldLight,
    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
  },
  subtitle: { margin: '6px 0 0', color: C.inkDim, fontStyle: 'italic', fontSize: 15 },
  tabs: {
    maxWidth: 860,
    margin: '18px auto 22px',
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
  },
  tab: (active) => ({
    padding: '10px 26px',
    fontSize: 17,
    fontFamily: 'inherit',
    cursor: 'pointer',
    color: active ? C.bg : C.ink,
    background: active ? C.gold : C.panelLight,
    border: `1px solid ${active ? C.goldLight : C.border}`,
    borderRadius: 8,
    fontWeight: active ? 'bold' : 'normal',
  }),
  main: { maxWidth: 860, margin: '0 auto' },
  panel: {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: 20,
    marginBottom: 18,
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
  },
  panelTitle: {
    margin: '0 0 14px',
    fontSize: 20,
    color: C.goldLight,
    borderBottom: `1px solid ${C.border}`,
    paddingBottom: 8,
  },
  label: { display: 'block', fontSize: 13, color: C.inkDim, marginBottom: 4 },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 10px',
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.ink,
    fontFamily: 'inherit',
    fontSize: 15,
  },
  inputError: { borderColor: C.red },
  row: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 },
  button: {
    padding: '9px 18px',
    background: C.panelLight,
    border: `1px solid ${C.gold}`,
    borderRadius: 8,
    color: C.goldLight,
    fontFamily: 'inherit',
    fontSize: 15,
    cursor: 'pointer',
  },
  buttonPrimary: {
    padding: '10px 22px',
    background: C.gold,
    border: `1px solid ${C.goldLight}`,
    borderRadius: 8,
    color: C.bg,
    fontFamily: 'inherit',
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  buttonDanger: {
    padding: '6px 12px',
    background: 'transparent',
    border: `1px solid ${C.red}`,
    borderRadius: 6,
    color: C.red,
    fontFamily: 'inherit',
    fontSize: 13,
    cursor: 'pointer',
  },
  d20: (rolling, crit, fumble) => ({
    width: 120,
    height: 120,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 44,
    fontWeight: 'bold',
    color: crit ? C.goldLight : fumble ? C.red : C.ink,
    background: `linear-gradient(145deg, ${C.panelLight}, ${C.panel})`,
    border: `3px solid ${crit ? C.goldLight : fumble ? C.red : C.gold}`,
    clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
    animation: rolling ? 'd20-spin 0.5s linear infinite' : 'd20-settle 0.35s ease-out',
    userSelect: 'none',
  }),
  rollResult: { textAlign: 'center', marginTop: 14 },
  bigTotal: { fontSize: 30, color: C.goldLight, margin: '4px 0' },
  badge: (color) => ({
    display: 'inline-block',
    padding: '3px 12px',
    borderRadius: 12,
    border: `1px solid ${color}`,
    color,
    fontSize: 14,
    letterSpacing: 1,
    marginTop: 6,
  }),
  detail: { color: C.inkDim, fontSize: 14, marginTop: 6 },
  attackList: { display: 'flex', flexDirection: 'column', gap: 10 },
  attackRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: '10px 14px',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: 10,
  },
  statBox: {
    textAlign: 'center',
    background: C.panelLight,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: '10px 6px',
  },
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

// ---------------------------------------------------------------------------
// Persistenza su localStorage — NON MODIFICARE loadState/saveState
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'tavolo-dei-dadi:scheda:v1';

function schedaVuota() {
  return {
    nome: 'Avventuriero senza nome',
    classe: '',
    livello: 1,
    ca: 10,
    pfMax: 10,
    bonusCompetenza: 2,
    caratteristiche: {
      forza: 10,
      destrezza: 10,
      costituzione: 10,
      intelligenza: 10,
      saggezza: 10,
      carisma: 10,
    },
    attacchi: [{ id: 1, nome: 'Spada lunga', bonus: 5, danno: '1d8+3' }],
  };
}

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

/** Normalizza i dati importati dal PDF nel modello della scheda. */
function normalizeImported(dati) {
  const base = schedaVuota();
  if (!dati || typeof dati !== 'object') return base;

  const car = { ...base.caratteristiche };
  for (const { key } of CARATTERISTICHE) {
    const v = Number(dati.caratteristiche?.[key]);
    if (Number.isFinite(v) && v >= 1 && v <= 30) car[key] = v;
  }

  const attacchi = Array.isArray(dati.attacchi)
    ? dati.attacchi
        .filter((a) => a && typeof a === 'object' && a.nome)
        .slice(0, 20)
        .map((a, i) => ({
          id: Date.now() + i,
          nome: String(a.nome),
          bonus: Number.isFinite(Number(a.bonus)) ? Number(a.bonus) : 0,
          danno: typeof a.danno === 'string' && parseEspressioneDado(a.danno) ? a.danno.trim() : '',
        }))
    : base.attacchi;

  return {
    nome: typeof dati.nome === 'string' && dati.nome ? dati.nome : base.nome,
    classe: typeof dati.classe === 'string' ? dati.classe : base.classe,
    livello: Number.isFinite(Number(dati.livello)) ? Number(dati.livello) : base.livello,
    ca: Number.isFinite(Number(dati.ca)) ? Number(dati.ca) : base.ca,
    pfMax: Number.isFinite(Number(dati.pfMax)) ? Number(dati.pfMax) : base.pfMax,
    bonusCompetenza: Number.isFinite(Number(dati.bonusCompetenza))
      ? Number(dati.bonusCompetenza)
      : base.bonusCompetenza,
    caratteristiche: car,
    attacchi: attacchi.length ? attacchi : base.attacchi,
  };
}

// ---------------------------------------------------------------------------
// Schermata di gioco
// ---------------------------------------------------------------------------

function PlayTab({ scheda }) {
  const [faccia, setFaccia] = useState(20);
  const [rolling, setRolling] = useState(false);
  const [tiro, setTiro] = useState(null); // { etichetta, naturale, bonus, totale, attacco }
  const [danni, setDanni] = useState(null); // { totale, dettaglio, critico }
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function lanciaD20(etichetta, bonus, attacco = null) {
    clearInterval(intervalRef.current);
    setDanni(null);
    setTiro(null);
    setRolling(true);
    intervalRef.current = setInterval(() => setFaccia(tiraDado(20)), 70);

    const naturale = tiraDado(20);
    setTimeout(() => {
      clearInterval(intervalRef.current);
      setFaccia(naturale);
      setRolling(false);
      setTiro({ etichetta, naturale, bonus, totale: naturale + bonus, attacco });
    }, 850);
  }

  function lanciaDanni() {
    if (!tiro?.attacco) return;
    const parsata = parseEspressioneDado(tiro.attacco.danno);
    if (!parsata) {
      setDanni({ errore: 'Espressione di danno non valida' });
      return;
    }
    const critico = tiro.naturale === 20;
    setDanni({ ...tiraDanni(parsata, critico), critico });
  }

  const critico = tiro?.naturale === 20;
  const fallimento = tiro?.naturale === 1;
  const dannoAttacco = tiro?.attacco?.danno?.trim() || '';
  const dannoValido = dannoAttacco && parseEspressioneDado(dannoAttacco);

  return (
    <div>
      <section style={styles.panel}>
        <h2 style={styles.panelTitle}>Il dado è tratto</h2>
        <div style={styles.d20(rolling, !rolling && critico, !rolling && fallimento)}>{faccia}</div>

        {tiro && !rolling && (
          <div style={styles.rollResult}>
            <div style={{ color: C.inkDim }}>{tiro.etichetta}</div>
            <div style={styles.bigTotal}>
              {tiro.naturale} {conSegno(tiro.bonus)} = {tiro.totale}
            </div>
            {critico && <span style={styles.badge(C.goldLight)}>⚔ CRITICO! 20 naturale</span>}
            {fallimento && <span style={styles.badge(C.red)}>💀 Fallimento critico</span>}

            {tiro.attacco && (
              <div style={{ marginTop: 14 }}>
                {dannoValido ? (
                  <button style={styles.buttonPrimary} onClick={lanciaDanni}>
                    🗡 Tira danni ({dannoAttacco}{critico ? ', dadi raddoppiati' : ''})
                  </button>
                ) : (
                  <div style={styles.detail}>
                    {dannoAttacco
                      ? 'Espressione di danno non valida: correggila nella scheda.'
                      : 'Nessun danno impostato per questo attacco (vedi scheda).'}
                  </div>
                )}
              </div>
            )}

            {danni && (
              <div style={{ marginTop: 12 }}>
                {danni.errore ? (
                  <div style={{ color: C.red }}>{danni.errore}</div>
                ) : (
                  <>
                    <div style={{ fontSize: 26, color: C.red }}>
                      💥 {danni.totale} danni{danni.critico ? ' (critico!)' : ''}
                    </div>
                    <div style={styles.detail}>{danni.dettaglio} = {danni.totale}</div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <section style={styles.panel}>
        <h2 style={styles.panelTitle}>Attacchi</h2>
        {scheda.attacchi.length === 0 && (
          <div style={styles.detail}>Nessun attacco: aggiungine uno nella scheda.</div>
        )}
        <div style={styles.attackList}>
          {scheda.attacchi.map((a) => (
            <div key={a.id} style={styles.attackRow}>
              <div style={{ flex: 1 }}>
                <strong>{a.nome}</strong>
                <div style={styles.detail}>
                  Per colpire {conSegno(a.bonus)}
                  {a.danno ? ` · Danno ${a.danno}` : ' · Danno non impostato'}
                </div>
              </div>
              <button
                style={styles.button}
                disabled={rolling}
                onClick={() => lanciaD20(`Attacco: ${a.nome}`, a.bonus, a)}
              >
                🎲 Attacca
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.panel}>
        <h2 style={styles.panelTitle}>Prove di caratteristica</h2>
        <div style={styles.statGrid}>
          {CARATTERISTICHE.map(({ key, abbr }) => {
            const mod = modificatore(scheda.caratteristiche[key]);
            return (
              <div key={key} style={styles.statBox}>
                <div style={{ color: C.inkDim, fontSize: 13 }}>{abbr}</div>
                <div style={{ fontSize: 22, color: C.goldLight }}>{conSegno(mod)}</div>
                <button
                  style={{ ...styles.button, padding: '4px 10px', fontSize: 13, marginTop: 6 }}
                  disabled={rolling}
                  onClick={() => lanciaD20(`Prova di ${abbr}`, mod)}
                >
                  Tira
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scheda del personaggio
// ---------------------------------------------------------------------------

function SheetTab({ scheda, setScheda }) {
  const [importInCorso, setImportInCorso] = useState(false);
  const [erroreImport, setErroreImport] = useState('');
  const fileRef = useRef(null);

  function campo(nome, valore) {
    setScheda({ ...scheda, [nome]: valore });
  }

  function campoNumero(nome, valore) {
    const n = Number(valore);
    campo(nome, Number.isFinite(n) ? n : 0);
  }

  function aggiornaCaratteristica(key, valore) {
    const n = Number(valore);
    setScheda({
      ...scheda,
      caratteristiche: { ...scheda.caratteristiche, [key]: Number.isFinite(n) ? n : 10 },
    });
  }

  function aggiornaAttacco(id, patch) {
    setScheda({
      ...scheda,
      attacchi: scheda.attacchi.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  }

  function aggiungiAttacco() {
    setScheda({
      ...scheda,
      attacchi: [...scheda.attacchi, { id: Date.now(), nome: 'Nuovo attacco', bonus: 0, danno: '' }],
    });
  }

  function rimuoviAttacco(id) {
    setScheda({ ...scheda, attacchi: scheda.attacchi.filter((a) => a.id !== id) });
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
      setErroreImport(err.message || "Import fallito");
    } finally {
      setImportInCorso(false);
    }
  }

  return (
    <div>
      <section style={styles.panel}>
        <h2 style={styles.panelTitle}>Chi sei, avventuriero?</h2>
        <div style={styles.row}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={styles.label}>Nome</label>
            <input style={styles.input} value={scheda.nome} onChange={(e) => campo('nome', e.target.value)} />
          </div>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={styles.label}>Classe</label>
            <input style={styles.input} value={scheda.classe} onChange={(e) => campo('classe', e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 80 }}>
            <label style={styles.label}>Livello</label>
            <input style={styles.input} type="number" min="1" max="20" value={scheda.livello} onChange={(e) => campoNumero('livello', e.target.value)} />
          </div>
        </div>
        <div style={styles.row}>
          <div style={{ flex: 1, minWidth: 80 }}>
            <label style={styles.label}>Classe Armatura</label>
            <input style={styles.input} type="number" value={scheda.ca} onChange={(e) => campoNumero('ca', e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 80 }}>
            <label style={styles.label}>PF massimi</label>
            <input style={styles.input} type="number" value={scheda.pfMax} onChange={(e) => campoNumero('pfMax', e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 80 }}>
            <label style={styles.label}>Bonus competenza</label>
            <input style={styles.input} type="number" value={scheda.bonusCompetenza} onChange={(e) => campoNumero('bonusCompetenza', e.target.value)} />
          </div>
        </div>
      </section>

      <section style={styles.panel}>
        <h2 style={styles.panelTitle}>Caratteristiche</h2>
        <div style={styles.statGrid}>
          {CARATTERISTICHE.map(({ key, label }) => (
            <div key={key} style={styles.statBox}>
              <label style={styles.label}>{label}</label>
              <input
                style={{ ...styles.input, textAlign: 'center' }}
                type="number"
                min="1"
                max="30"
                value={scheda.caratteristiche[key]}
                onChange={(e) => aggiornaCaratteristica(key, e.target.value)}
              />
              <div style={{ color: C.goldLight, marginTop: 4 }}>
                {conSegno(modificatore(scheda.caratteristiche[key]))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.panel}>
        <h2 style={styles.panelTitle}>Attacchi</h2>
        <div style={styles.attackList}>
          {scheda.attacchi.map((a) => {
            const dannoNonValido = a.danno.trim() !== '' && !parseEspressioneDado(a.danno);
            return (
              <div key={a.id} style={{ ...styles.attackRow, alignItems: 'flex-end' }}>
                <div style={{ flex: 2, minWidth: 140 }}>
                  <label style={styles.label}>Nome</label>
                  <input style={styles.input} value={a.nome} onChange={(e) => aggiornaAttacco(a.id, { nome: e.target.value })} />
                </div>
                <div style={{ width: 100 }}>
                  <label style={styles.label}>Per colpire</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={a.bonus}
                    onChange={(e) => aggiornaAttacco(a.id, { bonus: Number(e.target.value) || 0 })}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 130 }}>
                  <label style={styles.label}>Danno (es. 2d6+3)</label>
                  <input
                    style={{ ...styles.input, ...(dannoNonValido ? styles.inputError : {}) }}
                    placeholder="es. 1d8+3"
                    value={a.danno}
                    onChange={(e) => aggiornaAttacco(a.id, { danno: e.target.value })}
                  />
                  {dannoNonValido && (
                    <div style={{ color: C.red, fontSize: 12, marginTop: 3 }}>Espressione non valida</div>
                  )}
                </div>
                <button style={styles.buttonDanger} onClick={() => rimuoviAttacco(a.id)}>
                  Rimuovi
                </button>
              </div>
            );
          })}
        </div>
        <button style={{ ...styles.button, marginTop: 12 }} onClick={aggiungiAttacco}>
          + Aggiungi attacco
        </button>
      </section>

      <section style={styles.panel}>
        <h2 style={styles.panelTitle}>Importa da PDF</h2>
        <p style={styles.detail}>
          Carica la scheda del personaggio in PDF: verrà trascritta automaticamente
          (serve il server con la chiave API configurata).
        </p>
        <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={importaPdf} />
        <button
          style={styles.buttonPrimary}
          disabled={importInCorso}
          onClick={() => fileRef.current?.click()}
        >
          {importInCorso ? 'Trascrizione in corso…' : '📜 Importa scheda PDF'}
        </button>
        {erroreImport && <div style={{ color: C.red, marginTop: 8 }}>{erroreImport}</div>}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [scheda, setScheda] = useState(loadState);
  const [tab, setTab] = useState('gioco');

  useEffect(() => {
    saveState(scheda);
  }, [scheda]);

  return (
    <div style={styles.app}>
      <style>{KEYFRAMES}</style>
      <header style={styles.header}>
        <h1 style={styles.title}>⚄ Tavolo dei Dadi ⚄</h1>
        <p style={styles.subtitle}>
          {scheda.nome}
          {scheda.classe ? ` — ${scheda.classe} liv. ${scheda.livello}` : ''}
        </p>
      </header>

      <nav style={styles.tabs}>
        <button style={styles.tab(tab === 'gioco')} onClick={() => setTab('gioco')}>
          🎲 Gioco
        </button>
        <button style={styles.tab(tab === 'scheda')} onClick={() => setTab('scheda')}>
          📜 Scheda
        </button>
      </nav>

      <main style={styles.main}>
        {tab === 'gioco' ? (
          <PlayTab scheda={scheda} />
        ) : (
          <SheetTab scheda={scheda} setScheda={setScheda} />
        )}
      </main>
    </div>
  );
}
