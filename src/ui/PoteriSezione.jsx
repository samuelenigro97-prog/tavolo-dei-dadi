// Sottosezione "Poteri": regole personalizzate del tavolo (patti, benedizioni,
// maledizioni...) dentro "Privilegi, Tratti & Talenti". Una scheda per potere
// con chip per contatori e modificatori; clic sulla scheda apre i dettagli
// (modifica, eliminazione, riordino). Vedi src/rules/poteri.js per il modello
// dati e la sincronizzazione con `scheda.risorse`.
import { useState } from 'react';
import { t } from '../i18n.js';
import { C } from './tema.js';
import { styles } from './stili.js';
import { Editable, AreaTesto } from './componenti.jsx';
import { conSegno } from '../rules/dadi.js';
import {
  BERSAGLI_MODIFICATORE_POTERE,
  BERSAGLIO_LIBERO,
  nuovoPotere,
  nuovoContatore,
  nuovoModificatore,
  normalizzaPoteri,
  valoreContatore,
  sincronizzaRisorsePoteri,
  modificatoriPoteriAttivi,
} from '../rules/poteri.js';

function unitaBersaglio(chiave) {
  return BERSAGLI_MODIFICATORE_POTERE.find((b) => b.chiave === chiave)?.unita || '';
}
// Per un bersaglio libero (homebrew, non in elenco) l'etichetta è il testo scritto
// a mano nel modificatore stesso, non una voce fissa: va passata da chi chiama.
function labelBersaglio(chiave, lingua, bersaglioLibero) {
  if (chiave === BERSAGLIO_LIBERO) return bersaglioLibero || (lingua === 'en' ? 'Other' : 'Altro');
  const b = BERSAGLI_MODIFICATORE_POTERE.find((x) => x.chiave === chiave);
  return b ? (lingua === 'en' ? b.labelEn : b.label) : chiave;
}

/**
 * Badge da affiancare a un valore della scheda (velocità, CA, iniziativa,
 * PF massimi) quando un Potere attivo lo modifica: mostra il totale del
 * bonus e, al passaggio del mouse, la fonte di ciascun contributo — così
 * il bonus "si somma... mostrando la fonte" anche fuori dalla scheda del
 * potere. Restituisce null se nessun potere tocca quel bersaglio.
 */
export function BadgePotere({ scheda, bersaglio, unita }) {
  const mods = modificatoriPoteriAttivi(scheda).filter((m) => m.bersaglio === bersaglio);
  if (!mods.length) return null;
  const tot = mods.reduce((s, m) => s + (Number(m.valore) || 0), 0);
  if (!tot) return null;
  const u = unita ?? unitaBersaglio(bersaglio);
  const fonti = mods.map((m) => `${conSegno(Number(m.valore) || 0)}${u} (${m.fonte})`).join(', ');
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, color: C.goldDark, marginLeft: 4 }} title={fonti}>
      {conSegno(tot)}{u}
    </span>
  );
}

const chipStile = {
  background: 'rgba(0,0,0,0.04)',
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: '3px 8px',
  fontSize: 11.5,
  color: C.ink,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  whiteSpace: 'nowrap',
};

/** Una scheda compatta per potere: titolo, chip di contatori/modificatori, descrizione. */
function PotereCard({ potere, scheda, indice, totale, onApri, lingua }) {
  const [sceltaEffetto, setSceltaEffetto] = useState(false);
  return (
    <div
      onClick={() => onApri(potere.id)}
      style={{
        background: C.panelLight,
        border: `1px solid ${potere.attivo ? C.border : C.inkDim}`,
        borderRadius: 8,
        padding: '10px 12px',
        cursor: 'pointer',
        opacity: potere.attivo ? 1 : 0.6,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        transition: 'border-color 0.15s ease',
      }}
      title={lingua === 'en' ? 'Click for details, edit, delete or reorder' : 'Clicca per dettagli, modifica, eliminazione o riordino'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <strong style={{ fontSize: 13, color: C.ink }}>
          {potere.nome || (lingua === 'en' ? 'Unnamed power' : 'Potere senza nome')}
        </strong>
        {!potere.attivo && (
          <span style={{ fontSize: 10, fontWeight: 700, color: C.inkDim, border: `1px solid ${C.border}`, borderRadius: 6, padding: '1px 6px' }}>
            {lingua === 'en' ? 'OFF' : 'DISATTIVATO'}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
        {potere.contatori.map((c, i) => {
          const { attuali, max } = valoreContatore(scheda, potere.id, i, c);
          return (
            <span key={i} style={chipStile} onClick={(e) => e.stopPropagation()} title={c.nome}>
              {c.nome || (lingua === 'en' ? 'Counter' : 'Contatore')}{' '}
              <Editable
                value={attuali}
                tipo="numero"
                width={26}
                style={{ fontSize: 11.5, fontWeight: 700 }}
                onChange={(v) => onApri(potere.id, { tipo: 'contatore', indice: i, patch: { attuali: v } })}
              />
              {max != null ? ` / ${max}` : ' (?)'}
            </span>
          );
        })}
        {potere.modificatori.map((m, i) => (
          <span key={i} style={{ ...chipStile, borderColor: C.goldDark, color: C.goldDark, fontWeight: 700 }} title={m.fonte || potere.nome}>
            {labelBersaglio(m.bersaglio, lingua, m.bersaglioLibero)} {conSegno(Number(m.valore) || 0)}{unitaBersaglio(m.bersaglio)} ({m.fonte || potere.nome})
          </span>
        ))}
        {sceltaEffetto ? (
          <span style={{ display: 'inline-flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              style={{ ...styles.buttonMini, fontSize: 11 }}
              onClick={() => { onApri(potere.id, { tipo: 'aggiungi-contatore' }); setSceltaEffetto(false); }}
            >
              ➕ {lingua === 'en' ? 'Counter' : 'Contatore'}
            </button>
            <button
              type="button"
              style={{ ...styles.buttonMini, fontSize: 11 }}
              onClick={() => { onApri(potere.id, { tipo: 'aggiungi-modificatore' }); setSceltaEffetto(false); }}
            >
              ➕ {lingua === 'en' ? 'Modifier' : 'Modificatore'}
            </button>
          </span>
        ) : (
          <button
            type="button"
            style={{ ...chipStile, borderStyle: 'dashed', color: C.goldDark, cursor: 'pointer', fontWeight: 700 }}
            onClick={(e) => { e.stopPropagation(); setSceltaEffetto(true); }}
            title={lingua === 'en' ? 'Add an effect (counter or modifier)' : 'Aggiungi un effetto (contatore o modificatore)'}
          >
            ➕ {lingua === 'en' ? 'Add…' : 'Aggiungi…'}
          </button>
        )}
      </div>

      {potere.descrizione && (
        <div style={{ ...styles.detail, fontSize: 12, whiteSpace: 'pre-wrap' }}>{potere.descrizione}</div>
      )}
    </div>
  );
}

/** Modale di dettaglio/modifica per un singolo potere: campi, contatori, modificatori, elimina, riordina. */
function PotereModal({ potere, indice, totale, onChiudi, onAggiorna, onElimina, onSposta, lingua }) {
  const setCampo = (patch) => onAggiorna(potere.id, patch);
  const setContatore = (i, patch) => setCampo({ contatori: potere.contatori.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });
  const rimuoviContatore = (i) => setCampo({ contatori: potere.contatori.filter((_, idx) => idx !== i) });
  const aggiungiContatore = () => setCampo({ contatori: [...potere.contatori, nuovoContatore({ nome: lingua === 'en' ? 'New counter' : 'Nuovo contatore' })] });
  const setModificatore = (i, patch) => setCampo({ modificatori: potere.modificatori.map((m, idx) => (idx === i ? { ...m, ...patch } : m)) });
  const rimuoviModificatore = (i) => setCampo({ modificatori: potere.modificatori.filter((_, idx) => idx !== i) });
  const aggiungiModificatore = () => setCampo({ modificatori: [...potere.modificatori, nuovoModificatore()] });

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 2500,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onChiudi(); }}
    >
      <div style={{ ...styles.panel, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <input
            value={potere.nome}
            onChange={(e) => setCampo({ nome: e.target.value })}
            placeholder={lingua === 'en' ? 'Power name' : 'Nome del potere'}
            style={{ ...styles.inlineInput, flex: 1, fontSize: 14, fontWeight: 700, padding: '6px 8px' }}
          />
          <button type="button" style={styles.buttonMini} onClick={onChiudi} title={lingua === 'en' ? 'Close' : 'Chiudi'}>✕</button>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 12, cursor: 'pointer' }}>
          <input type="checkbox" checked={potere.attivo} onChange={(e) => setCampo({ attivo: e.target.checked })} />
          {lingua === 'en' ? 'Active (inactive: modifiers stop applying and counters keep their value but are hidden from resources)' : 'Attivo (disattivato: i modificatori smettono di applicarsi e i contatori restano con il loro valore ma spariscono da Risorse)'}
        </label>

        <div style={{ marginBottom: 10 }}>
          <div style={{ ...styles.detail, fontWeight: 700, marginBottom: 4 }}>{lingua === 'en' ? 'Description' : 'Descrizione'}</div>
          <AreaTesto value={potere.descrizione} onChange={(v) => setCampo({ descrizione: v })} placeholder={lingua === 'en' ? 'What this power does…' : 'Cosa fa questo potere…'} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ ...styles.detail, fontWeight: 700, marginBottom: 4 }}>{lingua === 'en' ? 'Counters' : 'Contatori'}</div>
          {potere.contatori.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
              <input
                value={c.nome}
                onChange={(e) => setContatore(i, { nome: e.target.value })}
                placeholder={lingua === 'en' ? 'Name (e.g. Debt)' : 'Nome (es. Debito)'}
                style={{ ...styles.inlineInput, flex: 1, fontSize: 12, padding: '4px 6px' }}
              />
              <input
                type="number"
                value={c.attuali}
                onChange={(e) => setContatore(i, { attuali: Number(e.target.value) || 0 })}
                title={lingua === 'en' ? 'Current' : 'Attuali'}
                style={{ ...styles.inlineInput, width: 56, fontSize: 12, padding: '4px 6px', textAlign: 'center' }}
              />
              <span style={{ fontSize: 11, color: C.inkDim }}>/</span>
              <input
                type="number"
                value={c.max === null ? '' : c.max}
                onChange={(e) => setContatore(i, { max: e.target.value === '' ? null : Number(e.target.value) })}
                placeholder="∞"
                title={lingua === 'en' ? 'Maximum (empty = no cap)' : 'Massimo (vuoto = nessun tetto)'}
                style={{ ...styles.inlineInput, width: 56, fontSize: 12, padding: '4px 6px', textAlign: 'center' }}
              />
              <button type="button" style={{ ...styles.buttonMini, color: C.red }} onClick={() => rimuoviContatore(i)} title={lingua === 'en' ? 'Remove' : 'Rimuovi'}>🗑</button>
            </div>
          ))}
          <button type="button" style={{ ...styles.buttonMini, borderStyle: 'dashed' }} onClick={aggiungiContatore}>
            ➕ {lingua === 'en' ? 'Add counter' : 'Aggiungi contatore'}
          </button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ ...styles.detail, fontWeight: 700, marginBottom: 4 }}>{lingua === 'en' ? 'Modifiers' : 'Modificatori'}</div>
          {potere.modificatori.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
              <select
                value={m.bersaglio}
                onChange={(e) => setModificatore(i, { bersaglio: e.target.value })}
                style={{ ...styles.inlineInput, fontSize: 12, padding: '4px 6px' }}
              >
                {BERSAGLI_MODIFICATORE_POTERE.map((b) => (
                  <option key={b.chiave} value={b.chiave}>{lingua === 'en' ? b.labelEn : b.label}</option>
                ))}
                <option value={BERSAGLIO_LIBERO}>{lingua === 'en' ? 'Other (custom)…' : 'Altro (personalizzato)…'}</option>
              </select>
              {m.bersaglio === BERSAGLIO_LIBERO && (
                <input
                  value={m.bersaglioLibero}
                  onChange={(e) => setModificatore(i, { bersaglioLibero: e.target.value })}
                  placeholder={lingua === 'en' ? 'What does it affect? (e.g. Advantage on CHA saves)' : 'Su cosa agisce? (es. Vantaggio ai TS Carisma)'}
                  style={{ ...styles.inlineInput, flex: 1, minWidth: 120, fontSize: 12, padding: '4px 6px' }}
                />
              )}
              <input
                type="number"
                value={m.valore}
                onChange={(e) => setModificatore(i, { valore: Number(e.target.value) || 0 })}
                title={lingua === 'en' ? 'Numeric value (use 0 or 1 for a yes/no effect, e.g. Advantage)' : 'Valore numerico (usa 0 o 1 per un effetto sì/no, es. Vantaggio)'}
                style={{ ...styles.inlineInput, width: 56, fontSize: 12, padding: '4px 6px', textAlign: 'center' }}
              />
              <input
                value={m.fonte}
                onChange={(e) => setModificatore(i, { fonte: e.target.value })}
                placeholder={lingua === 'en' ? 'Source (e.g. Mask)' : 'Fonte (es. Maschera)'}
                style={{ ...styles.inlineInput, flex: 1, minWidth: 90, fontSize: 12, padding: '4px 6px' }}
              />
              <button type="button" style={{ ...styles.buttonMini, color: C.red }} onClick={() => rimuoviModificatore(i)} title={lingua === 'en' ? 'Remove' : 'Rimuovi'}>🗑</button>
            </div>
          ))}
          <button type="button" style={{ ...styles.buttonMini, borderStyle: 'dashed' }} onClick={aggiungiModificatore}>
            ➕ {lingua === 'en' ? 'Add modifier' : 'Aggiungi modificatore'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" style={styles.buttonMini} disabled={indice === 0} onClick={() => onSposta(potere.id, -1)} title={lingua === 'en' ? 'Move up' : 'Sposta su'}>▲</button>
            <button type="button" style={styles.buttonMini} disabled={indice === totale - 1} onClick={() => onSposta(potere.id, 1)} title={lingua === 'en' ? 'Move down' : 'Sposta giù'}>▼</button>
          </div>
          <button
            type="button"
            style={{ ...styles.buttonMini, color: C.red, borderColor: C.red }}
            onClick={() => { if (window.confirm(lingua === 'en' ? 'Delete this power? Its counters and modifiers will disappear from the sheet too.' : 'Eliminare questo potere? Spariscono dalla scheda anche i suoi contatori e modificatori.')) onElimina(potere.id); }}
          >
            🗑 {lingua === 'en' ? 'Delete power' : 'Elimina potere'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Sezione "Poteri": elenco di schede + pulsante per aggiungerne una nuova.
 * `scheda`/`aggiorna` sono le stesse props usate in tutto il resto della UI.
 */
export function SezionePoteri({ scheda, aggiorna, lingua = 'it' }) {
  const [potereApertoId, setPotereApertoId] = useState(null);
  const poteri = normalizzaPoteri(scheda?.poteri);
  const potereAperto = poteri.find((p) => p.id === potereApertoId) || null;

  function salvaPoteri(nuoviPoteri) {
    aggiorna({ poteri: nuoviPoteri, risorse: sincronizzaRisorsePoteri(nuoviPoteri, scheda.risorse) });
  }

  function aggiungiPotere() {
    const nuovo = nuovoPotere({ nome: lingua === 'en' ? 'New power' : 'Nuovo potere' });
    salvaPoteri([...poteri, nuovo]);
    setPotereApertoId(nuovo.id);
  }

  function aggiornaPotere(id, patch) {
    salvaPoteri(poteri.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function eliminaPotere(id) {
    salvaPoteri(poteri.filter((p) => p.id !== id));
    setPotereApertoId(null);
  }

  function spostaPotere(id, direzione) {
    const lista = [...poteri];
    const idx = lista.findIndex((p) => p.id === id);
    const nuovoIdx = idx + direzione;
    if (idx < 0 || nuovoIdx < 0 || nuovoIdx >= lista.length) return;
    [lista[idx], lista[nuovoIdx]] = [lista[nuovoIdx], lista[idx]];
    salvaPoteri(lista);
  }

  // Dalla card arrivano sia "apri il potere" (nessuna azione) sia scorciatoie
  // rapide (contatore modificato inline, o "aggiungi subito un effetto").
  function gestisciAzioneCard(id, azione) {
    if (!azione) { setPotereApertoId(id); return; }
    const p = poteri.find((x) => x.id === id);
    if (!p) return;
    if (azione.tipo === 'contatore') {
      aggiornaPotere(id, { contatori: p.contatori.map((c, idx) => (idx === azione.indice ? { ...c, ...azione.patch } : c)) });
      return;
    }
    if (azione.tipo === 'aggiungi-contatore') {
      aggiornaPotere(id, { contatori: [...p.contatori, nuovoContatore({ nome: lingua === 'en' ? 'New counter' : 'Nuovo contatore' })] });
      setPotereApertoId(id);
      return;
    }
    if (azione.tipo === 'aggiungi-modificatore') {
      aggiornaPotere(id, { modificatori: [...p.modificatori, nuovoModificatore()] });
      setPotereApertoId(id);
    }
  }

  return (
    <div style={{ background: C.panelLight, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(28px, 1fr) auto minmax(28px, 1fr)', alignItems: 'center', columnGap: 6, marginBottom: 8 }}>
        <div />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.goldDark, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }} title={lingua === 'en' ? 'For rules invented at the table (not in the official books): pacts, blessings, curses, magic items with custom effects...' : 'Per le regole inventate al tavolo (non nei manuali ufficiali): patti, benedizioni, maledizioni, oggetti magici con effetti custom...'}>
          ✨ {lingua === 'en' ? 'Powers' : 'Poteri'} <span style={{ textTransform: 'none', fontWeight: 500, letterSpacing: 'normal', color: C.inkDim, fontSize: 11 }}>({lingua === 'en' ? 'homebrew rules' : 'regole homebrew'})</span>
        </div>
        <button type="button" style={{ ...styles.buttonMini, borderStyle: 'dashed', justifySelf: 'end' }} onClick={aggiungiPotere}>
          ➕ {lingua === 'en' ? 'Add power' : 'Aggiungi potere'}
        </button>
      </div>

      {poteri.length === 0 ? (
        <div style={{ ...styles.detail, fontSize: 12, textAlign: 'center', padding: '10px 0' }}>
          {lingua === 'en' ? 'No custom powers yet.' : 'Nessun potere personalizzato per ora.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {poteri.map((p, i) => (
            <PotereCard key={p.id} potere={p} scheda={scheda} indice={i} totale={poteri.length} onApri={gestisciAzioneCard} lingua={lingua} />
          ))}
        </div>
      )}

      {potereAperto && (
        <PotereModal
          potere={potereAperto}
          indice={poteri.findIndex((p) => p.id === potereAperto.id)}
          totale={poteri.length}
          onChiudi={() => setPotereApertoId(null)}
          onAggiorna={aggiornaPotere}
          onElimina={eliminaPotere}
          onSposta={spostaPotere}
          lingua={lingua}
        />
      )}
    </div>
  );
}
