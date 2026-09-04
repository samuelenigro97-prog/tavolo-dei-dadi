import { useState, useMemo, useEffect, useRef } from 'react';
import { t, traduciDato } from '../i18n.js';
import { C } from './tema.js';
import { styles } from './stili.js';
import { INCANTESIMI_DB } from '../data/incantesimi.js';
import { INCANTESIMI_XANATHAR } from '../dati/incantesimi-xanathar.js';
import { ARMI_5E, ARMATURE_5E, STRUMENTI_5E, PESI_OGGETTI, TALENTI_FONTI, CONDIZIONI_5E } from '../data/dati5e.js';
import { TALENTI_XANATHAR } from '../dati/talenti-xanathar.js';
import { TALENTI_TASHA } from '../dati/talenti-tasha.js';
import { EFFETTI_CONDIZIONI } from '../data/condizioni.js';
import { BESTIE, FAMIGLI, EVOCAZIONI, MOSTRI_5E } from '../data/bestiario.js';
import { spiegaIncantesimo, spiegaPrivilegio, spiegaTalento, spiegaInvocazione, spiegaInfusione, INVOCAZIONI_5E, INFUSIONI_ARTEFICE_5E } from '../data/spiegazioni.js';


export function CompendioModal({
  aperto,
  onChiudi,
  lingua = 'it',
  onAggiungiIncantesimo,
  onAggiungiInventario,
  onAggiungiAttacco,
  onApplicaCondizione,
  onAggiungiTalento,
}) {
  const [testoCerca, setTestoCerca] = useState('');
  const [categoria, setCategoria] = useState('tutti'); // tutti | incantesimi | equip | condizioni | talenti | bestiario
  const [dettaglioSelezionato, setDettaglioSelezionato] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (aperto) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTestoCerca('');
      setDettaglioSelezionato(null);
    }
  }, [aperto]);

  // Database unificato memoizzato
  const vociCompendio = useMemo(() => {
    const elenco = [];

    // 1. Incantesimi
    const tuttiInc = { ...INCANTESIMI_DB, ...INCANTESIMI_XANATHAR, ...INCANTESIMI_TASHA };
    for (const [nome, d] of Object.entries(tuttiInc)) {
      const desc = d.desc || spiegaIncantesimo(nome) || '';
      elenco.push({
        id: `inc-${nome}`,
        tipo: 'incantesimo',
        nome,
        livello: d.livello ?? 0,
        scuola: d.scuola || '',
        classi: d.classi || [],
        tempo: d.tempo || '',
        gittata: d.gittata || '',
        durata: d.durata || '',
        conc: !!d.conc,
        rituale: !!d.rituale,
        danno: d.danno || '',
        tipoDanno: d.tipoDanno || '',
        desc,
        raw: d,
      });
    }

    // 2. Armi
    for (const w of (ARMI_5E || [])) {
      elenco.push({
        id: `arma-${w.nome}`,
        tipo: 'equip',
        sottoTipo: 'Arma',
        nome: w.nome,
        danno: w.danno || '',
        tipoDanno: w.tipoDanno || '',
        peso: w.peso || 1,
        prezzo: w.prezzo || '',
        note: w.note || '',
        desc: `${w.danno ? `Danno: ${w.danno} ${w.tipoDanno || ''}. ` : ''}${w.note ? `Proprietà: ${w.note}` : ''}`,
        raw: w,
      });
    }

    // 3. Armature
    for (const a of (ARMATURE_5E || [])) {
      const nomeArm = Array.isArray(a.match) ? a.match[0] : (a.nome || 'Armatura');
      elenco.push({
        id: `armatura-${nomeArm}`,
        tipo: 'equip',
        sottoTipo: 'Armatura',
        nome: nomeArm.charAt(0).toUpperCase() + nomeArm.slice(1),
        tipoArmatura: a.tipo || 'leggera',
        caBase: a.base || 10,
        peso: a.peso || 5,
        desc: `Armatura ${a.tipo || ''} (CA base ${a.base || 10}).`,
        raw: a,
      });
    }

    // 4. Oggetti & Pozioni & Attrezzi
    for (const [nomeOgg, pesoOgg] of Object.entries(PESI_OGGETTI || {})) {
      const isPoz = /pozione|filtro|elisir|potion/i.test(nomeOgg);
      elenco.push({
        id: `ogg-${nomeOgg}`,
        tipo: 'equip',
        sottoTipo: isPoz ? 'Pozione' : 'Oggetto',
        nome: nomeOgg,
        peso: pesoOgg || 0.5,
        desc: isPoz ? 'Pozione o consumabile magico (peso: ' + pesoOgg + ' kg).' : 'Oggetto o strumento d’avventura (peso: ' + pesoOgg + ' kg).',
        raw: { nome: nomeOgg, peso: pesoOgg },
      });
    }
    for (const nomeStr of (STRUMENTI_5E || [])) {
      if (!PESI_OGGETTI[nomeStr]) {
        elenco.push({
          id: `att-${nomeStr}`,
          tipo: 'equip',
          sottoTipo: 'Strumento',
          nome: nomeStr,
          peso: 1,
          desc: 'Set di strumenti da lavoro, artigianato o gioco.',
          raw: { nome: nomeStr, peso: 1 },
        });
      }
    }


    // 5. Condizioni
    for (const c of (CONDIZIONI_5E || [])) {
      const eff = EFFETTI_CONDIZIONI[c] || [];
      const desc = eff.join(' · ');
      elenco.push({
        id: `cond-${c}`,
        tipo: 'condizione',
        nome: c,
        desc: desc || 'Condizione 5e che influenza azioni e movimenti.',
        effetti: eff,
        raw: c,
      });
    }

    // 6. Talenti & Invocazioni & Infusioni
    const talentiMap = new Map();
    for (const nomeTal of Object.keys(TALENTI_FONTI || {})) {
      talentiMap.set(nomeTal.toLowerCase(), {
        nome: nomeTal,
        requisiti: '',
        desc: spiegaTalento(nomeTal) || '',
      });
    }
    for (const t of (TALENTI_XANATHAR || [])) {
      talentiMap.set(t.nome.toLowerCase(), {
        nome: t.nome,
        requisiti: t.prerequisito || '',
        desc: t.desc || spiegaTalento(t.nome) || '',
      });
    }
    for (const t of (TALENTI_TASHA || [])) {
      talentiMap.set(t.nome.toLowerCase(), {
        nome: t.nome,
        requisiti: t.prerequisito || '',
        desc: t.desc || spiegaTalento(t.nome) || '',
      });
    }
    for (const t of talentiMap.values()) {
      elenco.push({
        id: `tal-${t.nome}`,
        tipo: 'talento',
        sottoTipo: 'Talento',
        nome: t.nome,
        requisiti: t.requisiti || '',
        desc: t.desc,
        raw: t,
      });
    }

    for (const nomeInv of (INVOCAZIONI_5E || [])) {
      const desc = spiegaInvocazione(nomeInv) || '';
      elenco.push({
        id: `invoc-${nomeInv}`,
        tipo: 'talento',
        sottoTipo: 'Invocazione Occulta',
        nome: nomeInv,
        requisiti: 'Warlock',
        desc,
        raw: { nome: nomeInv, desc },
      });
    }
    for (const nomeInf of (INFUSIONI_ARTEFICE_5E || [])) {
      const desc = spiegaInfusione(nomeInf) || '';
      elenco.push({
        id: `infus-${nomeInf}`,
        tipo: 'talento',
        sottoTipo: 'Infusione dell’Artefice',
        nome: nomeInf,
        requisiti: 'Artefice',
        desc,
        raw: { nome: nomeInf, desc },
      });
    }


    // 7. Bestiario
    const tutteCreature = [...(BESTIE || []), ...(FAMIGLI || []), ...(EVOCAZIONI || []), ...(MOSTRI_5E || [])];
    const nomiVisti = new Set();
    for (const b of tutteCreature) {
      if (!b?.nome || nomiVisti.has(b.nome.toLowerCase())) continue;
      nomiVisti.add(b.nome.toLowerCase());
      elenco.push({
        id: `bestia-${b.nome}`,
        tipo: 'bestiario',
        nome: b.nome,
        gs: b.gs != null ? b.gs : '—',
        ca: b.ca || 10,
        pf: b.pf || 10,
        vel: b.vel || '9m',
        taglia: b.taglia || 'Media',
        tipoCreatura: b.tipo || 'Bestia',
        desc: `GS ${b.gs != null ? b.gs : '—'} · CA ${b.ca || 10} · PF ${b.pf || 10} · Vel ${b.vel || '9m'}`,
        raw: b,
      });
    }

    return elenco;
  }, []);

  // Filtro di ricerca
  const risultati = useMemo(() => {
    const q = testoCerca.trim().toLowerCase();
    return vociCompendio.filter((v) => {
      if (categoria !== 'tutti' && v.tipo !== categoria) return false;
      if (!q) return true;
      const matchNome = v.nome.toLowerCase().includes(q) || traduciDato(v.nome).toLowerCase().includes(q);
      const matchDesc = v.desc && v.desc.toLowerCase().includes(q);
      const matchSotto = v.sottoTipo && v.sottoTipo.toLowerCase().includes(q);
      const matchScuola = v.scuola && (v.scuola.toLowerCase().includes(q) || traduciDato(v.scuola).toLowerCase().includes(q));
      return matchNome || matchDesc || matchSotto || matchScuola;
    });
  }, [vociCompendio, testoCerca, categoria]);

  if (!aperto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compendio-titolo"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2600,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onChiudi();
      }}
    >
      <div
        style={{
          ...styles.panel,
          width: '100%',
          maxWidth: 780,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
          borderTop: `2px solid ${C.goldDark}`,
          padding: 0,
          overflow: 'hidden',
          borderRadius: 12,
        }}
      >
        {/* Intestazione */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🔍</span>
            <div>
              <h3 id="compendio-titolo" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.ink }}>
                {t('compendio.titolo')}
              </h3>
              <div style={{ fontSize: 11, color: C.inkDim }}>
                {lingua === 'en' ? 'Quick 5e database lookup (Cmd+K / Ctrl+K)' : 'Database rapido di regole, incantesimi e oggetti 5e (Cmd+K / Ctrl+K)'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onChiudi}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 20,
              color: C.inkDim,
              cursor: 'pointer',
              padding: '4px 8px',
              lineHeight: 1,
            }}
            title={t('modal.chiudi')}
          >
            ✕
          </button>
        </div>

        {/* Barra di ricerca + Filtri */}
        <div style={{ padding: '12px 18px 8px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <input
              ref={inputRef}
              type="text"
              value={testoCerca}
              onChange={(e) => setTestoCerca(e.target.value)}
              placeholder={t('compendio.cerca_ph')}
              style={{
                width: '100%',
                padding: '10px 36px 10px 14px',
                fontSize: 14,
                borderRadius: 8,
                border: `1.5px solid ${C.goldDark}`,
                background: C.bgInput || '#fff',
                color: C.ink,
                outline: 'none',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onChiudi();
              }}
            />
            {testoCerca && (
              <button
                type="button"
                onClick={() => setTestoCerca('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: C.inkDim,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Categorie Tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { id: 'tutti', label: t('compendio.tutti'), icon: '🌟' },
              { id: 'incantesimo', label: t('compendio.incantesimi'), icon: '✨' },
              { id: 'equip', label: t('compendio.equipaggiamento'), icon: '⚔️' },
              { id: 'condizione', label: t('compendio.condizioni'), icon: '🩸' },
              { id: 'talento', label: t('compendio.talenti'), icon: '⭐' },
              { id: 'bestiario', label: t('compendio.bestiario'), icon: '🐾' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoria(cat.id)}
                style={{
                  ...styles.buttonMini,
                  padding: '5px 10px',
                  fontSize: 11.5,
                  borderRadius: 6,
                  fontWeight: categoria === cat.id ? 700 : 500,
                  background: categoria === cat.id ? C.goldDark : 'rgba(0,0,0,0.03)',
                  color: categoria === cat.id ? '#fff' : C.inkDim,
                  borderColor: categoria === cat.id ? C.goldDark : C.border,
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista Risultati + Pannello Dettaglio */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Colonna Sinistra: Elenco */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              borderRight: dettaglioSelezionato ? `1px solid ${C.border}` : 'none',
              padding: '8px 12px',
            }}
          >
            {risultati.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: C.inkDim, fontSize: 13 }}>
                {t('compendio.nessun_risultato')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {risultati.slice(0, 100).map((v) => {
                  const isSel = dettaglioSelezionato?.id === v.id;
                  let icona = '📜';
                  if (v.tipo === 'incantesimo') icona = v.livello === 0 ? '✨' : '🪄';
                  else if (v.tipo === 'equip') icona = v.sottoTipo === 'Arma' ? '⚔️' : v.sottoTipo === 'Armatura' ? '🛡️' : v.sottoTipo === 'Pozione' ? '🧪' : '🎒';
                  else if (v.tipo === 'condizione') icona = '🩸';
                  else if (v.tipo === 'talento') icona = '⭐';
                  else if (v.tipo === 'bestiario') icona = '🐾';

                  return (
                    <div
                      key={v.id}
                      onClick={() => setDettaglioSelezionato(v)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        background: isSel ? 'rgba(201,162,39,0.15)' : 'transparent',
                        border: `1px solid ${isSel ? C.goldDark : 'transparent'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSel) e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSel) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13 }}>{icona}</span>
                          <strong style={{ fontSize: 13, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {traduciDato(v.nome)}
                          </strong>
                          {v.livello != null && v.tipo === 'incantesimo' && (
                            <span style={{ fontSize: 10, color: C.inkDim, background: 'rgba(0,0,0,0.05)', padding: '1px 5px', borderRadius: 4 }}>
                              {v.livello === 0 ? (lingua === 'en' ? 'Cantrip' : 'Trucchetto') : `${v.livello}° liv`}
                            </span>
                          )}
                          {v.sottoTipo && (
                            <span style={{ fontSize: 10, color: C.inkDim, background: 'rgba(0,0,0,0.05)', padding: '1px 5px', borderRadius: 4 }}>
                              {v.sottoTipo}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: C.inkDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                          {v.desc}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: C.goldDark }}>›</span>
                    </div>
                  );
                })}
                {risultati.length > 100 && (
                  <div style={{ padding: '8px', textAlign: 'center', fontSize: 11, color: C.inkDim }}>
                    {lingua === 'en' ? `Showing first 100 of ${risultati.length} results. Type to narrow search.` : `Mostrati i primi 100 di ${risultati.length} risultati. Affina la ricerca.`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Colonna Destra: Dettagli e Azioni Rapide */}
          {dettaglioSelezionato && (
            <div
              style={{
                flex: 1.2,
                overflowY: 'auto',
                padding: '16px 20px',
                background: 'rgba(0,0,0,0.015)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.goldDark }}>
                    {traduciDato(dettaglioSelezionato.nome)}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setDettaglioSelezionato(null)}
                    style={{ background: 'none', border: 'none', color: C.inkDim, cursor: 'pointer', fontSize: 13 }}
                  >
                    ✕
                  </button>
                </div>
                {dettaglioSelezionato.tipo === 'incantesimo' && (
                  <div style={{ fontSize: 11.5, color: C.inkDim, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span>🔮 {traduciDato(dettaglioSelezionato.scuola || 'Magia')}</span>
                    <span>⏱ {traduciDato(dettaglioSelezionato.tempo || '1 Azione')}</span>
                    <span>🎯 {dettaglioSelezionato.gittata || 'Tocco'}</span>
                    {dettaglioSelezionato.conc && <span>⏳ {lingua === 'en' ? 'Concentration' : 'Concentrazione'}</span>}
                    {dettaglioSelezionato.rituale && <span>📜 {lingua === 'en' ? 'Ritual' : 'Rituale'}</span>}
                  </div>
                )}
              </div>

              {/* Descrizione completa */}
              <div
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: C.ink,
                  whiteSpace: 'pre-wrap',
                  background: 'rgba(0,0,0,0.02)',
                  padding: '12px',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  flex: 1,
                  overflowY: 'auto',
                }}
              >
                {dettaglioSelezionato.desc || (lingua === 'en' ? 'No detailed description available.' : 'Nessuna descrizione dettagliata disponibile.')}
              </div>

              {/* Bottoni di Azione */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 6 }}>
                {dettaglioSelezionato.tipo === 'incantesimo' && onAggiungiIncantesimo && (
                  <button
                    type="button"
                    style={{
                      ...styles.buttonPrimary,
                      padding: '6px 12px',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onClick={() => {
                      onAggiungiIncantesimo(dettaglioSelezionato);
                      onChiudi();
                    }}
                  >
                    ✨ {t('compendio.aggiungi_grimorio')}
                  </button>
                )}

                {dettaglioSelezionato.tipo === 'equip' && onAggiungiInventario && (
                  <button
                    type="button"
                    style={{
                      ...styles.buttonPrimary,
                      padding: '6px 12px',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onClick={() => {
                      onAggiungiInventario(dettaglioSelezionato);
                      onChiudi();
                    }}
                  >
                    🎒 {t('compendio.aggiungi_inventario')}
                  </button>
                )}

                {dettaglioSelezionato.sottoTipo === 'Arma' && onAggiungiAttacco && (
                  <button
                    type="button"
                    style={{
                      ...styles.buttonSecondary,
                      padding: '6px 12px',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onClick={() => {
                      onAggiungiAttacco(dettaglioSelezionato.raw || dettaglioSelezionato);
                      onChiudi();
                    }}
                  >
                    ⚔️ {t('compendio.aggiungi_attacchi')}
                  </button>
                )}

                {dettaglioSelezionato.tipo === 'condizione' && onApplicaCondizione && (
                  <button
                    type="button"
                    style={{
                      ...styles.buttonPrimary,
                      padding: '6px 12px',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onClick={() => {
                      onApplicaCondizione(dettaglioSelezionato.nome);
                      onChiudi();
                    }}
                  >
                    🩸 {t('compendio.applica_condizione')}
                  </button>
                )}

                {dettaglioSelezionato.tipo === 'talento' && onAggiungiTalento && (
                  <button
                    type="button"
                    style={{
                      ...styles.buttonPrimary,
                      padding: '6px 12px',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onClick={() => {
                      onAggiungiTalento(dettaglioSelezionato);
                      onChiudi();
                    }}
                  >
                    ⭐ {t('compendio.aggiungi_talento')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
