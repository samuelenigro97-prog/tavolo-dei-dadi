// Altre regole che cambiano fra 5.0 (PHB 2014) e 5.5 (PHB 2024): condizioni,
// Colpo Accurato, testi inglesi degli incantesimi, incantesimi senza tiro per
// colpire, tabelle delle sottoclassi e Sensi Primordiali del Ranger 5.0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { effettiCondizione } from '../src/data/condizioni.js';
import { riepilogoCondizioni, dannoTrucchettoScalato, dannoExtraColpoAccurato, classificaIncantesimoCombattimento, incantesimoSenzaTiroPerColpire } from '../src/rules/regole.js';
import { spiegaIncantesimo, spiegaPrivilegio, setEdizioneAttuale } from '../src/data/spiegazioni.js';
import { EN_VARIANTI_INCANTESIMI } from '../src/data/spiegazioni.en.js';
import { VARIANTI_EDIZIONE_INCANTESIMI } from '../src/data/incantesimi.js';
import { setLinguaAttuale } from '../src/i18n.js';
import { tabellaPrivilegiSottoclasse } from '../src/data/dati5e.js';

const righe = (tab) => Object.values(tab || {}).join('\n');

test('condizioni: Afferrato 5.5 dà svantaggio contro altri bersagli, 5.0 no', () => {
  assert.ok(effettiCondizione('Afferrato', '2024').svantaggioAttacchiAltri);
  assert.ok(!effettiCondizione('Afferrato', '2014').svantaggioAttacchiAltri);
  assert.ok(effettiCondizione('Afferrato', '2014').velocitaZero);
});

test('condizioni: Incapacitato 5.5 toglie le azioni bonus e dà svantaggio all’iniziativa', () => {
  const v24 = effettiCondizione('Incapacitato', '2024');
  const v14 = effettiCondizione('Incapacitato', '2014');
  assert.ok(v24.nienteAzioneBonus && v24.svantaggioIniziativa);
  assert.ok(!v14.nienteAzioneBonus && !v14.svantaggioIniziativa);
  // Le condizioni che includono Incapacitato ereditano gli effetti 5.5.
  assert.ok(effettiCondizione('Paralizzato', '2024').nienteAzioneBonus);
  assert.ok(!effettiCondizione('Paralizzato', '2014').nienteAzioneBonus);
});

test('condizioni: Invisibile 5.5 dà vantaggio all’iniziativa; Stordito 5.5 può muoversi', () => {
  assert.ok(effettiCondizione('Invisibile', '2024').vantaggioIniziativa);
  assert.ok(!effettiCondizione('Invisibile', '2014').vantaggioIniziativa);
  assert.ok(effettiCondizione('Invisibile', '2014').vantaggioAttacchi);
  assert.ok(effettiCondizione('Stordito', '2014').velocitaZero);
  assert.ok(!effettiCondizione('Stordito', '2024').velocitaZero);
});

test('condizioni: riepilogo per edizione e testo diverso nella 5.5', () => {
  const r24 = riepilogoCondizioni(['Afferrato'], '2024').map((r) => r.flag);
  const r14 = riepilogoCondizioni(['Afferrato'], '2014').map((r) => r.flag);
  assert.ok(r24.includes('svantaggioAttacchiAltri'));
  assert.ok(!r14.includes('svantaggioAttacchiAltri'));
  assert.notEqual(effettiCondizione('Incapacitato', '2014').it, effettiCondizione('Incapacitato', '2024').it);
  assert.equal(effettiCondizione('Inesistente', '2024'), null);
});

test('Colpo Accurato 5.5: nessun danno extra ai livelli 1-4, poi 1d6/2d6/3d6', () => {
  assert.equal(dannoExtraColpoAccurato(1, '2024'), '');
  assert.equal(dannoExtraColpoAccurato(4, '2024'), '');
  assert.equal(dannoExtraColpoAccurato(5, '2024'), '1d6');
  assert.equal(dannoExtraColpoAccurato(11, '2024'), '2d6');
  assert.equal(dannoExtraColpoAccurato(17, '2024'), '3d6');
  assert.equal(dannoExtraColpoAccurato(17, '2014'), '');
  assert.equal(dannoTrucchettoScalato('Colpo Accurato', '1d6', { livello: 3, versione: '2024' }), '');
  assert.equal(dannoTrucchettoScalato('Colpo Accurato', '1d6', { livello: 5, versione: '2024' }), '1d6');
  // Gli altri trucchetti scalano come prima.
  assert.equal(dannoTrucchettoScalato('Fiotto Acido', '1d6', { livello: 5, versione: '2024' }), '2d6');
});

test('testi inglesi degli incantesimi: seguono l’edizione del PG', () => {
  for (const nome of Object.keys(EN_VARIANTI_INCANTESIMI)) assert.ok(VARIANTI_EDIZIONE_INCANTESIMI[nome], nome);
  setLinguaAttuale('en');
  try {
    setEdizioneAttuale('2014');
    assert.match(spiegaIncantesimo('Cura Ferite'), /1d8/);
    assert.match(spiegaIncantesimo('Tocco Gelido'), /Ranged/);
    assert.match(spiegaIncantesimo('Colpo Accurato'), /advantage/);
    setEdizioneAttuale('2024');
    assert.match(spiegaIncantesimo('Cura Ferite'), /2d8/);
    assert.match(spiegaIncantesimo('Tocco Gelido'), /Melee/);
    assert.match(spiegaIncantesimo('Colpo Accurato'), /level 5/);
  } finally {
    setLinguaAttuale('it');
    setEdizioneAttuale('2024');
  }
  // In italiano restano i testi italiani.
  assert.match(spiegaIncantesimo('Cura Ferite'), /creatura che tocchi/);
});

test('Assorbire Elementi, Marchio del Cacciatore, Dardo Incantato: nessun tiro per colpire', () => {
  for (const nome of ['Assorbire Elementi', 'Marchio del Cacciatore', 'Dardo Incantato', '✨ Maledizione']) {
    assert.ok(incantesimoSenzaTiroPerColpire(nome), nome);
  }
  assert.ok(classificaIncantesimoCombattimento({ nome: 'Assorbire Elementi' }).senzaTiroPerColpire);
  assert.ok(!classificaIncantesimoCombattimento({ nome: 'Dardo di Fuoco' }).senzaTiroPerColpire);
  assert.ok(!classificaIncantesimoCombattimento({ nome: 'Colpo Accurato' }).senzaTiroPerColpire);
});

test('sottoclassi: tabelle miste separate fra 5.0 e 5.5', () => {
  const vita14 = tabellaPrivilegiSottoclasse('Dominio della Vita', '2014');
  const vita24 = tabellaPrivilegiSottoclasse('Dominio della Vita', '2024');
  assert.ok(vita14[1] && vita14[2] && vita14[8] && !vita14[3]);
  assert.match(vita14[1], /Incantesimi del Dominio/);
  assert.ok(vita24[3] && !vita24[1] && !vita24[2] && !vita24[8]);
  const fatato24 = tabellaPrivilegiSottoclasse('Patrono Signore Fatato', '2024');
  assert.ok(!fatato24[1] && fatato24[3]);
  assert.ok(!tabellaPrivilegiSottoclasse('Divinatore', '2014')[3]);
  // Sottoclassi solo 5.0 (legacy) usate nella 5.5: tabella invariata.
  assert.ok(tabellaPrivilegiSottoclasse('Necromante', '2024')[2]);
  // Privilegi diversi allo stesso livello.
  assert.match(righe(tabellaPrivilegiSottoclasse('Giuramento degli Antichi', '2014')), /Scacciare l’Infedele/);
  assert.doesNotMatch(righe(tabellaPrivilegiSottoclasse('Giuramento degli Antichi', '2024')), /Scacciare l’Infedele/);
  assert.match(righe(tabellaPrivilegiSottoclasse('Giuramento di Vendetta', '2014')), /Abiurare Nemico/);
  assert.equal(tabellaPrivilegiSottoclasse('Guerriero dell’Ombra', '2014')[17], 'Opportunista');
  assert.equal(tabellaPrivilegiSottoclasse('Guerriero dell’Ombra', '2024')[11], 'Passo d’Ombra Migliorato');
  assert.equal(tabellaPrivilegiSottoclasse('Guerriero della Mano Aperta', '2014')[11], 'Tranquillità');
  assert.equal(tabellaPrivilegiSottoclasse('Guerriero della Mano Aperta', '2024')[11], 'Passo Lesto');
  assert.match(tabellaPrivilegiSottoclasse('Collegio del Valore', '2014')[3], /Competenze Bonus/);
  assert.match(tabellaPrivilegiSottoclasse('Collegio del Valore', '2024')[3], /Addestramento Marziale/);
  assert.equal(tabellaPrivilegiSottoclasse('Inesistente', '2024'), null);
  assert.ok(spiegaPrivilegio('Abiurare Nemico'));
});

test('Ranger 5.0: Sensi Primordiali costa uno slot, niente contatore automatico', () => {
  const app = readFileSync(join(process.cwd(), 'src/App.jsx'), 'utf8');
  assert.doesNotMatch(app, /mk\('Sensi Primordiali'/);
  assert.match(spiegaPrivilegio('Sensi Primordiali'), /slot/);
});

test('public/Vaelion.json e public/Flyora.json (non usati) sono stati rimossi', () => {
  assert.ok(!existsSync(join(process.cwd(), 'public/Vaelion.json')));
  assert.ok(!existsSync(join(process.cwd(), 'public/Flyora.json')));
});
