// Componenti di presentazione riusabili (campi editabili, tendine, liste, sezioni).
// Estratti da App.jsx: ricevono tutto via props, non conoscono lo stato dell'app.
import { useEffect, useId, useRef, useState } from 'react';
import { t, traduciDato } from '../i18n';
import { C } from './tema.js';
import { styles } from './stili.js';

/** Ordine coerente per tutte le tendine testuali riusabili. */
function ordinaAlfabeticamente(opzioni, etichetta = traduciDato) {
  return [...opzioni].sort((a, b) => String(etichetta(a)).localeCompare(String(etichetta(b)), 'it', { sensitivity: 'base' }));
}

/**
 * Valore modificabile in linea. Un click apre l'editor; se `onRoll` è
 * definito, il click viene ritardato per distinguere il doppio click,
 * che invece lancia il tiro.
 */
export function Editable({ value, onChange, onRoll, tipo = 'testo', width, style, title }) {
  const [editing, setEditing] = useState(false);
  const [bozza, setBozza] = useState('');
  const [carica, setCarica] = useState(false);
  const timerRef = useRef(null);
  const holdRef = useRef(null);
  const caricato = useRef(false);
  const ignoraClick = useRef(false);

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    clearTimeout(holdRef.current);
  }, []);

  function apriEditor() {
    setBozza(String(value ?? ''));
    setEditing(true);
  }

  // tieni premuto → carica → rilascia → tiro (solo se l'elemento è tirabile)
  function pointerDown(e) {
    if (!onRoll || e.button > 0) return;
    caricato.current = false;
    clearTimeout(holdRef.current);
    holdRef.current = setTimeout(() => {
      caricato.current = true;
      setCarica(true);
      navigator.vibrate?.(12); // feedback aptico su mobile: il dado è "in mano"
    }, SOGLIA_CARICA_MS);
  }

  function pointerUp() {
    if (!onRoll) return;
    clearTimeout(holdRef.current);
    if (caricato.current) {
      caricato.current = false;
      setCarica(false);
      ignoraClick.current = true; // il click che segue non deve aprire l'editor
      clearTimeout(timerRef.current);
      onRoll();
    }
  }

  function pointerAnnulla() {
    clearTimeout(holdRef.current);
    caricato.current = false;
    setCarica(false);
  }

  function handleClick(e) {
    e.stopPropagation();
    if (ignoraClick.current) {
      ignoraClick.current = false;
      return;
    }
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
        onFocus={(e) => e.target.select()}
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
      className={[onRoll ? 'tirabile' : '', carica ? 'carica' : ''].filter(Boolean).join(' ') || undefined}
      style={{ ...styles.editable, ...style }}
      title={title || (onRoll ? '1 click: modifica · tieni premuto o doppio click: tira' : '1 click: modifica')}
      onSelectStart={onRoll ? (e) => e.preventDefault() : undefined}
      onPointerDown={onRoll ? pointerDown : undefined}
      onPointerUp={onRoll ? pointerUp : undefined}
      onPointerLeave={onRoll ? pointerAnnulla : undefined}
      onPointerCancel={onRoll ? pointerAnnulla : undefined}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {String(value ?? '') === '' ? '—' : String(value)}
    </span>
  );
}

/**
 * Elemento tirabile stile Fantasy Grounds: tieni premuto (il valore "si
 * carica" e trema), rilascia e il dado parte. Il doppio click resta come
 * scorciatoia. `as` permette di renderizzare un div (es. righe abilità).
 */
const SOGLIA_CARICA_MS = 280;

export function Rollable({ onRoll, children, style, title, as: Tag = 'span' }) {
  const [carica, setCarica] = useState(false);
  const timerRef = useRef(null);
  const caricato = useRef(false);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function inizia(e) {
    if (e.button > 0) return;
    caricato.current = false;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      caricato.current = true;
      setCarica(true);
      navigator.vibrate?.(12); // feedback aptico su mobile: il dado è "in mano"
    }, SOGLIA_CARICA_MS);
  }

  function rilascia() {
    clearTimeout(timerRef.current);
    if (caricato.current) {
      caricato.current = false;
      setCarica(false);
      onRoll();
    }
  }

  function annulla() {
    clearTimeout(timerRef.current);
    caricato.current = false;
    setCarica(false);
  }

  return (
    <Tag
      className={carica ? 'tirabile carica' : 'tirabile'}
      style={{
        cursor: 'pointer',
        display: Tag === 'span' ? 'inline-block' : undefined,
        ...style,
      }}
      title={title || 'Tieni premuto e rilascia (o doppio click): tira'}
      onSelectStart={(e) => e.preventDefault()}
      onPointerDown={inizia}
      onPointerUp={rilascia}
      onPointerLeave={annulla}
      onPointerCancel={annulla}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onRoll();
      }}
    >
      {children}
    </Tag>
  );
}

/** Campo in stile modulo ufficiale: valore su riga, etichetta minuscola sotto. */
export function CampoModulo({ label, children, style, boxClassName }) {
  return (
    <div style={style}>
      <div className={boxClassName ? `campo-modulo-box ${boxClassName}` : 'campo-modulo-box'} style={styles.moduloCampo}>{children}</div>
      <div className="campo-modulo-label" style={styles.moduloLabel}>{label}</div>
    </div>
  );
}

/**
 * Campo di testo libero (elementi separati da virgola) con un menù a tendina
 * "＋" per aggiungere velocemente voci da una lista, senza perdere il testo.
 */
export function CampoConTendina({ value, opzioni, onChange, width, title, lookup, setInfo, formattaVoce }) {
  // Accetta sia il formato storico separato da virgole sia le voci su righe
  // distinte: ogni elemento viene comunque mostrato nel proprio riquadro.
  const attuali = value ? value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean) : [];
  const mostraVoce = (v) => formattaVoce ? formattaVoce(v) : traduciDato(v);
  const visualizzati = ordinaAlfabeticamente(attuali, mostraVoce);

  const aggiungi = (v) => {
    if (!v) return;
    if (attuali.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...attuali, v].join(', '));
  };

  const rimuovi = (v) => {
    onChange(attuali.filter(x => x !== v).join(', '));
  };

  // Stesso aspetto dei "quadratini" classici (ListaQuadratini), con la × per rimuovere.
  const chip = { background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', fontSize: 13, color: C.ink, display: 'inline-flex', alignItems: 'center', gap: 6 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minHeight: 24 }} title={title}>
      {visualizzati.map(t => {
        const sp = lookup && setInfo ? lookup(t) : null;
        return (
        <span key={t} title={sp || t} style={chip}>
          <span
            style={sp ? { cursor: 'help', textDecoration: 'underline dotted', textUnderlineOffset: 3 } : undefined}
            onClick={sp ? () => setInfo({ titolo: traduciDato(t), testo: sp }) : undefined}
          >{mostraVoce(t)}</span>
          <button
            style={{ background: 'transparent', border: 'none', color: '#c0392b', cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 0.8 }}
            onClick={() => rimuovi(t)}
            title={`Rimuovi ${t}`}
          >
            ×
          </button>
        </span>
        );
      })}
      <label style={{ ...chip, borderStyle: 'dashed', color: C.goldDark, cursor: 'pointer', position: 'relative', fontWeight: 700 }} title={t('common.aggiungi_lista')}>
        ➕
        <select
          value=""
          onChange={(e) => aggiungi(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
        >
          <option value="">{t('common.aggiungi')}…</option>
          {ordinaAlfabeticamente(opzioni).map((o) => (
            <option key={o} value={o}>{traduciDato(o)}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

/**
 * Menù a tendina con opzioni predefinite più "Altro…" per un valore libero.
 * Se il valore corrente non è tra le opzioni, mostra sotto un campo di testo
 * così i valori personalizzati/importati non vanno persi.
 */
export function CampoTendina({ value, opzioni, onChange, title, formattaOpzione }) {
  const std = Array.isArray(opzioni) ? opzioni.includes(value) : Object.values(opzioni).flat().includes(value);
  const etichetta = (opzione) => formattaOpzione ? formattaOpzione(opzione) : traduciDato(opzione);
  return (
    <>
      <select
        style={{
          background: 'transparent',
          border: 'none',
          color: C.ink,
          fontFamily: 'inherit',
          fontSize: 13,
          padding: '0 4px 0 0',
          width: '100%',
          outline: 'none',
          cursor: 'pointer',
        }}
        value={std ? value : value ? '__altro' : ''}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '__altro') onChange(std || !value ? 'Personalizzato' : value);
          else onChange(v);
        }}
        title={title}
      >
        <option value="" style={{ background: C.panel }}>{t("common.scegli")}</option>
        {Array.isArray(opzioni) ? ordinaAlfabeticamente(opzioni, etichetta).map((o) => (
          <option key={o} value={o} style={{ background: C.panel }}>{etichetta(o)}</option>
        )) : Object.entries(opzioni).map(([group, opts]) => (
          <optgroup key={group} label={traduciDato(group)} style={{ background: C.panel }}>
            {ordinaAlfabeticamente(opts, etichetta).map((o) => <option key={o} value={o} style={{ background: C.panel }}>{etichetta(o)}</option>)}
          </optgroup>
        ))}
        <option value="__altro" style={{ background: C.panel }}>{t("common.altro")}</option>
      </select>
      {!std && value !== '' && (
        <div style={{ marginTop: 2 }}>
          <Editable value={value} onChange={onChange} width={80} style={{ fontSize: 13, borderBottom: 'none' }} title={t('tip.valore_pers')} />
        </div>
      )}
    </>
  );
}

/** Area di testo per le sezioni descrittive della scheda. */
export function AreaTesto({ value, onChange, righe = 2, placeholder }) {
  const ref = useRef(null);
  // cresce con il contenuto: niente altezza fissa e niente spazio morto
  const adatta = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(() => adatta(ref.current), [value]);
  return (
    <textarea
      ref={ref}
      style={{ ...styles.textarea, resize: 'none', overflow: 'hidden' }}
      rows={righe}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        onChange(e.target.value);
        adatta(e.target);
      }}
    />
  );
}

/**
 * Elenco di "quadratini": ogni riga (di un testo separato da a-capo) è una
 * chip cliccabile. Il click apre un sottomenu con la spiegazione (se nota) e
 * i campi per modificare/eliminare la voce. In fondo un pulsante per aggiungere.
 * Il valore resta un unico testo con a-capo (nessun cambio al modello dati).
 */
export function ListaQuadratini({ value, onChange, lookup, placeholder, opzioni, onRoll, unicaRiga }) {
  const righe = String(value || '').split('\n').map((r) => r.trim()).filter(Boolean);
  const [edit, setEdit] = useState(null); // { index, valore }  (index -1 = nuova)
  const listId = useId();
  const salva = (nuove) => onChange(nuove.join('\n'));
  const conferma = () => {
    const v = (edit.valore || '').trim();
    const nuove = [...righe];
    if (edit.index === -1) { if (v) nuove.push(v); }
    else if (v) nuove[edit.index] = v;
    else nuove.splice(edit.index, 1);
    salva(nuove);
    setEdit(null);
  };
  const elimina = () => { salva(righe.filter((_, i) => i !== edit.index)); setEdit(null); };

  const estraiNomeVoce = (str) => {
    const s = String(str || '').trim();
    const idx = s.indexOf(':');
    if (idx > 0 && idx <= 40) {
      const nome = s.slice(0, idx).trim();
      const desc = s.slice(idx + 1).trim();
      if (desc) return { nome, desc };
    }
    const matchParen = s.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (matchParen && matchParen[1].trim().length <= 35) {
      return { nome: matchParen[1].trim(), desc: matchParen[2].trim() };
    }
    return { nome: s, desc: '' };
  };

  // Le opzioni possono arrivare come stringhe o come oggetti { nome, desc }.
  const listaOpzioni = (opzioni || [])
    .map((o) => (typeof o === 'string' ? { nome: o, desc: '' } : o))
    .sort((a, b) => String(a.nome).localeCompare(String(b.nome), 'it', { sensitivity: 'base' }));
  const chip = { background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', fontSize: 13, cursor: 'pointer', color: C.ink, whiteSpace: unicaRiga ? 'nowrap' : 'normal' };
  const spEdit = edit
    ? (lookup ? lookup(edit.valore) : null) || estraiNomeVoce(edit.valore).desc || null
    : null;
  return (
    <>
      <div style={{ display: 'flex', flexWrap: unicaRiga ? 'nowrap' : 'wrap', gap: 6, overflowX: unicaRiga ? 'auto' : 'visible', paddingBottom: unicaRiga ? 4 : 0 }}>
        {righe.length === 0 && <span style={{ ...styles.detail, fontStyle: 'italic' }}>{placeholder || 'Nessuna voce.'}</span>}
        {righe.map((r, i) => {
          const { nome, desc } = estraiNomeVoce(r);
          const sp = (lookup ? lookup(r) || lookup(nome) : null) || desc;
          const isMagiaSelvaggia = /magia selvaggia/i.test(nome) && onRoll;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: unicaRiga ? 0 : 1 }}>
              <button
                style={{ ...chip, borderRight: isMagiaSelvaggia ? 'none' : chip.border, borderTopRightRadius: isMagiaSelvaggia ? 0 : 8, borderBottomRightRadius: isMagiaSelvaggia ? 0 : 8 }}
                title={sp || t('tip.apri_dettagli')}
                onClick={() => setEdit({ index: i, valore: r })}
              >
                {nome}
              </button>
              {isMagiaSelvaggia && (
                <button
                  style={{ ...chip, background: C.gold, color: '#fff', borderLeft: '1px solid rgba(0,0,0,0.1)', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, paddingLeft: 6, paddingRight: 6 }}
                  title="Tira 1d100 (Impulso di Magia Selvaggia)"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRoll("Impulso di Magia Selvaggia", "1d100");
                  }}
                >
                  🎲
                </button>
              )}
            </div>
          );
        })}
        <button style={{ ...chip, borderStyle: 'dashed', color: C.goldDark, flexShrink: 0, fontWeight: 700 }} title={t('common.aggiungi_lista')} onClick={() => setEdit({ index: -1, valore: "" })}>➕</button>
      </div>
      {edit && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1004, padding: 16, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) setEdit(null); }}
        >
          <div style={{ ...styles.panel, maxWidth: 420, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong style={{ color: C.goldDark, fontSize: 16 }}>{edit.index === -1 ? 'Nuova voce' : 'Voce'}</strong>
              <button style={styles.buttonMini} onClick={() => setEdit(null)} title={t('tip.chiudi')}>✕</button>
            </div>
            {spEdit && (
              <div style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 14, lineHeight: 1.4, marginBottom: 8 }}>{spEdit}</div>
            )}
            {edit.index === -1 ? (
              // Voce NUOVA: si sceglie dal menu a tendina (se ci sono opzioni)
              // oppure si scrive a mano. Le opzioni possono essere semplici
              // stringhe o oggetti { nome, desc } (la desc appare nella tendina).
              <>
                {listaOpzioni.length > 0 && (
                  <select
                    autoFocus
                    style={{ ...styles.inlineInput, width: '100%', padding: '8px 10px', fontSize: 15, marginBottom: 8, boxSizing: 'border-box' }}
                    value={listaOpzioni.some((o) => o.nome === edit.valore) ? edit.valore : ''}
                    onChange={(e) => setEdit({ ...edit, valore: e.target.value })}
                  >
                    <option value="">— Scegli dalla lista —</option>
                    {listaOpzioni.map((o) => (
                      <option key={o.nome} value={o.nome}>{o.desc ? `${o.nome} — ${o.desc}` : o.nome}</option>
                    ))}
                  </select>
                )}
                <input
                  autoFocus={listaOpzioni.length === 0}
                  style={{ ...styles.inlineInput, width: '100%', padding: '8px 10px', fontSize: 15, boxSizing: 'border-box' }}
                  value={edit.valore}
                  placeholder={listaOpzioni.length > 0 ? '…oppure scrivi un nome libero' : 'Nome della voce'}
                  list={listaOpzioni.length > 0 ? listId : undefined}
                  onChange={(e) => setEdit({ ...edit, valore: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') conferma(); }}
                />
                {listaOpzioni.length > 0 && (
                  <datalist id={listId}>
                    {listaOpzioni.map((o) => <option key={o.nome} value={o.nome} />)}
                  </datalist>
                )}
              </>
            ) : (
              // Voce ESISTENTE: il nome non si modifica. Rinominandolo si perdeva
              // la spiegazione, che viene cercata proprio in base al nome.
              <div style={{ ...styles.inlineInput, width: '100%', padding: '8px 10px', fontSize: 15, borderColor: C.border, color: C.ink, boxSizing: 'border-box' }}>
                {edit.valore}
              </div>
            )}
            {/* Pulsanti a colonne uguali. */}
            <div style={{ display: 'grid', gridTemplateColumns: edit.index === -1 ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 8, marginTop: 14 }}>
              {edit.index !== -1 && <button style={{ ...styles.buttonDanger, width: '100%', padding: '8px 10px' }} onClick={elimina}>🗑 {t('modal.elimina')}</button>}
              {edit.index === -1
                ? <button style={{ ...styles.buttonPrimary, width: '100%' }} onClick={conferma}>{t('modal.salva')}</button>
                : <button style={{ ...styles.button, width: '100%' }} onClick={() => setEdit(null)}>{t('common.chiudi')}</button>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Pannello con titolo collassabile (details/summary nativo). Di default aperto;
 * cliccando il titolo si richiude per risparmiare spazio verticale.
 * Con `manigliaProps` mostra un segnalino ⠿ per trascinare e riordinare.
 */
export function Sezione({ titolo, children, aperto = true, onToggleAperto, manigliaProps, trascinando, style, innerRef, azioni, className = '' }) {
  return (
    <details
      ref={innerRef}
      open={aperto}
      onToggle={(e) => { const open = e.currentTarget.open; if (onToggleAperto && open !== aperto) onToggleAperto(open); }}
      style={{ ...styles.panel, opacity: trascinando ? 0.4 : 1, ...style }}
      className={`sezione ${className}`.trim()}
    >
      <summary className="sezione-titolo" style={{ ...styles.panelTitle, cursor: 'pointer', listStyle: 'none', marginBottom: 0, userSelect: 'none' }}>
        <span className="sezione-titolo-sinistra">
        {manigliaProps && (
          <span
            className="tirabile"
            title={t('tip.trascina_sezioni')}
            style={{ cursor: 'grab', color: C.inkDim, fontSize: 15, lineHeight: 1, touchAction: 'none' }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            {...manigliaProps}
          >
            ⠿
          </span>
        )}
        <span className="freccia">▾</span>
        </span>
        <span className="sezione-titolo-testo">{titolo}</span>
        {/* Comandi nella riga del titolo: il click non deve aprire/chiudere. */}
        <span
          className="sezione-titolo-azioni"
          onClick={azioni ? (e) => { e.preventDefault(); e.stopPropagation(); } : undefined}
        >{azioni}</span>
      </summary>
      <div style={{ marginTop: 10 }}>{children}</div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------


/**
 * Campo dell'anagrafica non più modificabile dopo la creazione (classe,
 * sottoclasse, background). Niente tendina e niente lucchetto: solo il
 * valore in grigio scuro, con la spiegazione nel tooltip.
 */
export function CampoBloccato({ valore, title }) {
  return (
    <div
      style={{ fontSize: 13, color: C.inkDim, padding: '2px 0', cursor: 'default', userSelect: 'none' }}
      title={title}
    >
      {valore}
    </div>
  );
}
