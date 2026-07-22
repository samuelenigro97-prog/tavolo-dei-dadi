              <div style={{ overflowX: 'auto' }}>
                {(() => {
                const bannerStyle = { ...styles.panelTitle, fontSize: 15, marginTop: 14, marginBottom: 8, borderBottom: `2px solid ${C.border}`, paddingBottom: 4 };
                const q = filtroIncantesimo.trim().toLowerCase();
                const match = (s) => !q || (s.nome || '').toLowerCase().includes(q);
                const haTrucchetti = scheda.incantesimiLista.some((s) => s.livello === 0 && match(s));
                const haIncantesimi = scheda.incantesimiLista.some((s) => s.livello >= 1 && match(s));
                const renderLivello = (liv) => {
                  const spells = scheda.incantesimiLista.filter((s) => s.livello === liv && match(s));
                  if (spells.length === 0) return null; // mostra solo i livelli con incantesimi
                  const countLiv = scheda.incantesimiLista.filter((x) => x.livello === liv).length;
                  const conteggio = liv === 0 ? (maxTrucchetti != null ? `${countLiv}/${maxTrucchetti}` : `${countLiv}`) : `${countLiv}`;
                  return (
                    <div key={liv} style={{ marginBottom: 14 }}>
                      <h4 style={{ fontSize: 12, color: C.inkDim, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${C.border}`, paddingBottom: 2, marginBottom: 6, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span>{liv === 0 ? t('spell.trucchetti_liv0') : t('spell.n_livello', { n: liv })}</span>
                        <span style={{ color: (liv === 0 && trucchettiPieno) ? C.goldDark : C.inkDim, fontWeight: 700 }}>{conteggio}</span>
                      </h4>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>{t('spell.col_nome')}</th>
                            <th style={styles.th}>{t('spell.col_tempo')}</th>
                            <th style={styles.th}>{t('spell.col_gittata')}</th>
                            <th style={styles.th}>{t('spell.col_note')}</th>
                            <th style={styles.th} />
                          </tr>
                        </thead>
                        <tbody>
                          {spells.map((s) => {
                            const eff = spiegaIncantesimo(s.nome);
                            return (
                              <tr key={s.id}>
                                <td style={styles.td}>
                                  <button
                                    style={{ background: 'transparent', border: 'none', color: C.ink, fontWeight: 600, cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: 14, textDecoration: 'underline dotted', textUnderlineOffset: 3 }}
                                    title="Cosa fa questo incantesimo?"
                                    onClick={() => setInfo({ titolo: `${s.nome || 'Incantesimo'}${s.livello === 0 ? ' · Trucchetto' : ` · ${s.livello}° livello`}`, testo: eff || 'Nessuna descrizione disponibile per questo incantesimo. Aprilo con ✎ per aggiungere delle note.' })}
                                  >
                                    {s.nome || t('menu.senza_nome')}
                                  </button>
                                  {s.bonus && (
                                    <span
                                      title={t('spell.bonus_badge_tooltip')}
                                      style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: C.goldDark, border: `1px solid ${C.goldDark}`, borderRadius: 6, padding: '0 4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                      onClick={() => aggiorna({ incantesimiLista: scheda.incantesimiLista.map((x) => (x.id === s.id ? { ...x, bonus: false } : x)) })}
                                    >✦ {t('spell.bonus_badge')}</span>
                                  )}
                                </td>
                                <td style={{ ...styles.td, color: C.inkDim }}>{s.tempo}</td>
                                <td style={{ ...styles.td, color: C.inkDim }}>{s.gittata}</td>
                                <td style={{ ...styles.td, color: C.inkDim }}>{s.note}</td>
                                <td style={{ ...styles.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                  <button style={styles.buttonMini} title="Modifica" onClick={() => setDettaglioInc(s.id)}>✎</button>{' '}
                                  <button style={{ ...styles.buttonMini, color: C.red }} title="Elimina incantesimo" onClick={() => aggiorna({ incantesimiLista: scheda.incantesimiLista.filter((x) => x.id !== s.id) })}>🗑</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                };
                if (!haTrucchetti && !haIncantesimi) {
                  return <p style={{ ...styles.detail, textAlign: 'center', padding: '12px 0', opacity: 0.8 }}>{q ? t('spell.nessun_risultato') : t('spell.vuoto')}</p>;
                }
                return (
                  <>
                    {haTrucchetti && <h3 style={bannerStyle}>{t('spell.trucchetti')}</h3>}
                    {renderLivello(0)}
                    {haIncantesimi && <h3 style={bannerStyle}>{t('spell.incantesimi')}</h3>}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((liv) => renderLivello(liv))}
                  </>
                );
                })()}
              </div>
