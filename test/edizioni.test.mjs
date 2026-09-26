// Regole che cambiano fra 5.0 (PHB 2014) e 5.5 (PHB 2024): ogni PG deve
// usare quelle della propria edizione, senza mescolarle.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { datiIncantesimo, setEdizioneIncantesimi, valoreIncantesimoPerEdizione, VARIANTI_EDIZIONE_INCANTESIMI, INCANTESIMI_DB } from '../src/data/incantesimi.js';
import { spiegaIncantesimo, setEdizioneAttuale } from '../src/data/spiegazioni.js';
import { controlliScheda, dannoCuraConModificatore, tempoLancioIncantesimo, categoriaDaTempoLancio } from '../src/rules/regole.js';
import { effettiSfinimento, dadiVitaRecuperatiRiposoLungo } from '../src/rules/scheda.js';
import { SUBCLASS_PRIVILEGI, SUBCLASS_PRIVILEGI_2014 } from '../src/data/dati5e.js';

test('varianti per edizione: ogni incantesimo esiste nel database', () => {
  for (const nome of Object.keys(VARIANTI_EDIZIONE_INCANTESIMI)) assert.ok(INCANTESIMI_DB[nome], nome);
});

test('datiIncantesimo: cure 1d8/1d4/3d8 nella 5.0, 2d8/2d4/5d8 nella 5.5', () => {
  assert.equal(datiIncantesimo('Cura Ferite', '2014').danno, '1d8');
  assert.equal(datiIncantesimo('Cura Ferite', '2024').danno, '2d8');
  assert.equal(datiIncantesimo('Parola di Guarigione', '2014').danno, '1d4');
  assert.equal(datiIncantesimo('Parola di Guarigione', '2024').danno, '2d4');
  assert.equal(datiIncantesimo('Cura Ferite di Massa', '2014').danno, '3d8');
  assert.equal(datiIncantesimo('Cura Ferite di Massa', '2024').danno, '5d8');
});

test('datiIncantesimo: tempo, gittata, danno e concentrazione per edizione', () => {
  assert.equal(datiIncantesimo('Tocco Gelido', '2014').gittata, '36m');
  assert.equal(datiIncantesimo('Tocco Gelido', '2024').gittata, 'Tocco');
  assert.equal(datiIncantesimo('Tocco Gelido', '2024').danno, '1d10');
  assert.equal(datiIncantesimo('Produrre Fiamma', '2014').tempo, '1 Azione');
  assert.equal(datiIncantesimo('Produrre Fiamma', '2024').tempo, 'Azione Bonus');
  assert.equal(datiIncantesimo('Colpo Accurato', '2014').danno, '');
  assert.equal(datiIncantesimo('Arma Spirituale', '2014').conc, false);
  assert.equal(datiIncantesimo('Arma Spirituale', '2024').conc, true);
  assert.equal(datiIncantesimo('Marchio del Cacciatore', '2024').tipoDanno, 'Forza');
  assert.equal(datiIncantesimo('Interdizione alle Lame', '2014').conc, false);
  assert.equal(datiIncantesimo('Interdizione alle Lame', '2024').conc, true);
  // Guida: azione + concentrazione in ENTRAMBE le edizioni (cambia solo l'effetto).
  assert.equal(datiIncantesimo('Guida', '2014').tempo, '1 Azione');
  assert.equal(datiIncantesimo('Guida', '2024').tempo, '1 Azione');
});

test('datiIncantesimo senza versione segue l\'edizione impostata', () => {
  setEdizioneIncantesimi('2014');
  assert.equal(datiIncantesimo('Cura Ferite').danno, '1d8');
  setEdizioneIncantesimi('2024');
  assert.equal(datiIncantesimo('Cura Ferite').danno, '2d8');
});

test('setEdizioneAttuale sincronizza anche i dati degli incantesimi e il testo', () => {
  setEdizioneAttuale('2014');
  assert.equal(datiIncantesimo('Parola di Guarigione').danno, '1d4');
  assert.match(spiegaIncantesimo('Cura Ferite'), /1d8/);
  assert.match(spiegaIncantesimo('Guida'), /una volta/i);
  setEdizioneAttuale('2024');
  assert.match(spiegaIncantesimo('Cura Ferite'), /2d8/);
  assert.match(spiegaIncantesimo('Guida'), /abilità/i);
});

test('valoreIncantesimoPerEdizione: un valore dell\'altra edizione salvato nella voce non vince', () => {
  // PG 5.0 con "Cura Ferite 2d8" salvato dal vecchio database: mostra 1d8.
  assert.equal(valoreIncantesimoPerEdizione({ nome: 'Cura Ferite', danno: '2d8' }, 'danno', '2014'), '1d8');
  assert.equal(valoreIncantesimoPerEdizione({ nome: 'Parola di Guarigione', danno: '2d4' }, 'danno', '2014'), '1d4');
  // Un valore personalizzato (diverso da entrambe le edizioni) resta.
  assert.equal(valoreIncantesimoPerEdizione({ nome: 'Cura Ferite', danno: '3d8' }, 'danno', '2014'), '3d8');
  // Stesso valore della propria edizione: invariato.
  assert.equal(valoreIncantesimoPerEdizione({ nome: 'Cura Ferite', danno: '2d8' }, 'danno', '2024'), '2d8');
  // Incantesimi senza varianti: il valore salvato vince sempre.
  assert.equal(valoreIncantesimoPerEdizione({ nome: 'Inaridire', danno: '8d8' }, 'danno', '2014'), '8d8');
  // Senza valore salvato: quello dell'edizione.
  assert.equal(valoreIncantesimoPerEdizione({ nome: 'Produrre Fiamma' }, 'tempo', '2024'), 'Azione Bonus');
});

test('tempoLancioIncantesimo: Produrre Fiamma è azione bonus solo nella 5.5', () => {
  setEdizioneIncantesimi('2014');
  assert.equal(categoriaDaTempoLancio(tempoLancioIncantesimo('Produrre Fiamma', { tempo: '1 Azione' })), 'Azione');
  setEdizioneIncantesimi('2024');
  assert.equal(categoriaDaTempoLancio(tempoLancioIncantesimo('Produrre Fiamma', { tempo: '1 Azione' })), 'Bonus');
});

test('dannoCuraConModificatore: le cure sommano il mod. da incantatore', () => {
  assert.equal(dannoCuraConModificatore('Parola di Guarigione', '1d4', 5), '1d4+5');
  assert.equal(dannoCuraConModificatore('Cura Ferite', '2d8', -1), '2d8-1');
  assert.equal(dannoCuraConModificatore('Cura Ferite', '1d8+3', 5), '1d8+3');
  assert.equal(dannoCuraConModificatore('Cura Ferite', '1d8', 0), '1d8');
  assert.equal(dannoCuraConModificatore('Guarigione', '70', 5), '70');
});

test('sfinimento: senza versione vale la 2024 come nel resto della scheda', () => {
  const eff = effettiSfinimento({ sfinimento: 2 });
  assert.equal(eff.penalitaD20, 4);
  assert.equal(eff.svantaggioProve, false);
  const eff14 = effettiSfinimento({ versione: '2014', sfinimento: 2 });
  assert.equal(eff14.penalitaD20, 0);
  assert.equal(eff14.velocitaDimezzata, true);
});

test('riposo lungo: metà dei Dadi Vita nella 5.0, tutti nella 5.5', () => {
  assert.equal(dadiVitaRecuperatiRiposoLungo(10, '2014'), 5);
  assert.equal(dadiVitaRecuperatiRiposoLungo(1, '2014'), 1);
  assert.equal(dadiVitaRecuperatiRiposoLungo(10, '2024'), 10);
  assert.equal(dadiVitaRecuperatiRiposoLungo(7), 7);
});

test('controlliScheda: sottoclasse prima del livello di sblocco dell\'edizione', () => {
  const base = { nome: 'X', classe: 'Druido', sottoclasse: 'Circolo della Luna', caratteristiche: { forza: 10, destrezza: 10, costituzione: 10, intelligenza: 10, saggezza: 10, carisma: 10 } };
  const id = 'sottoclasse-livello-insufficiente';
  // Druido: 2° livello nella 5.0, 3° nella 5.5.
  assert.ok(!controlliScheda({ ...base, livello: 2, versione: '2014' }).some((r) => r.id === id));
  assert.ok(controlliScheda({ ...base, livello: 2, versione: '2024' }).some((r) => r.id === id));
  assert.ok(controlliScheda({ ...base, livello: 1, versione: '2014' }).some((r) => r.id === id));
});

test('privilegi di sottoclasse 5.0: il Campione non ha "Guerriero Eroico"', () => {
  const liv10 = (t) => Object.entries(t).filter(([l]) => Number(l) <= 10).map(([, v]) => v).join('\n');
  assert.match(liv10(SUBCLASS_PRIVILEGI.Campione), /Guerriero Eroico/);
  assert.doesNotMatch(liv10(SUBCLASS_PRIVILEGI_2014.Campione), /Guerriero Eroico/);
  assert.match(liv10(SUBCLASS_PRIVILEGI_2014.Campione), /Stile di Combattimento Aggiuntivo/);
  assert.doesNotMatch(Object.values(SUBCLASS_PRIVILEGI_2014['Stregoneria della Magia Selvaggia']).join('\n'), /Impulsi Domati/);
});
