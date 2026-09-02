// Calcoli derivati dalla scheda: CA da equipaggiamento, competenza armature,
// bonus abilità e tiri salvezza. Gira con `node --test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { caTotale, competenteInArmatura, bonusAbilita, bonusTiroSalvezza, punteggioCaratteristica, formattaNomePg, bonusCopertura } from '../src/rules/scheda.js';
import { ABILITA, CARATTERISTICHE } from '../src/data/caratteristiche.js';
import { spiegaIncantesimo } from '../src/data/spiegazioni.js';
import { tiraDanni, parseEspressioneDado } from '../src/rules/dadi.js';

// Scheda minima di prova: DES 16 (+3), FOR 8 (-1), bonus competenza +3.
function schedaBase(patch = {}) {
  return {
    caratteristiche: { forza: 8, destrezza: 16, costituzione: 14, intelligenza: 12, saggezza: 10, carisma: 18 },
    bonusCompetenza: 3,
    abilita: {},
    tiriSalvezza: {},
    addestramento: { armature: {} },
    armatura: { tipo: 'nessuna' },
    ca: 0,
    ...patch,
  };
}

// ========================= CA =========================

test('caTotale: senza armatura = 10 + DES', () => {
  assert.equal(caTotale(schedaBase()), 13); // 10 + 3
});

test('caTotale: armatura leggera = base + DES intero', () => {
  const s = schedaBase({ armatura: { tipo: 'leggera', base: 12 } });
  assert.equal(caTotale(s), 15); // 12 + 3
});

test('caTotale: armatura media = base + DES limitato a +2', () => {
  const s = schedaBase({ armatura: { tipo: 'media', base: 14 } });
  assert.equal(caTotale(s), 16); // 14 + min(3,2)
});

test('caTotale: armatura media con DES bassa usa la DES reale', () => {
  const s = schedaBase({ caratteristiche: { ...schedaBase().caratteristiche, destrezza: 12 }, armatura: { tipo: 'media', base: 14 } });
  assert.equal(caTotale(s), 15); // 14 + min(1,2)
});

test('caTotale: armatura pesante ignora la DES', () => {
  const s = schedaBase({ armatura: { tipo: 'pesante', base: 18 } });
  assert.equal(caTotale(s), 18);
});

test('caTotale: scudo +2 e bonus magico si sommano', () => {
  const s = schedaBase({ armatura: { tipo: 'pesante', base: 18, scudo: true, bonus: 1 } });
  assert.equal(caTotale(s), 21); // 18 + 2 + 1
});

test('caTotale: modalità manuale usa il valore scritto a mano', () => {
  const s = schedaBase({ armatura: { tipo: 'manuale' }, ca: 17 });
  assert.equal(caTotale(s), 17);
});

test('caTotale: manuale + scudo somma comunque lo scudo', () => {
  const s = schedaBase({ armatura: { tipo: 'manuale', scudo: true }, ca: 15 });
  assert.equal(caTotale(s), 17);
});

test('copertura 5e: modifica dinamicamente CA e TS Destrezza (bonusCopertura, caTotale, bonusTiroSalvezza)', () => {
  // Base: Cuoio (11) + DES 16 (+3) = 14 CA, TS Destrezza (competente) = +3 mod + 3 comp = +6
  const pg = schedaBase({
    armatura: { tipo: 'leggera', base: 11 },
    tiriSalvezza: { destrezza: true, costituzione: true },
    copertura: 'nessuna',
  });

  // 1. Nessuna copertura
  assert.equal(caTotale(pg), 14);
  assert.equal(bonusTiroSalvezza(pg, 'destrezza'), 6);
  assert.equal(bonusTiroSalvezza(pg, 'costituzione'), 5); // +2 mod + 3 comp

  // 2. Mezza Copertura (+2 CA, +2 TS Des)
  pg.copertura = 'mezza';
  assert.equal(bonusCopertura(pg).ca, 2);
  assert.equal(bonusCopertura(pg).tsDes, 2);
  assert.equal(caTotale(pg), 16); // 14 + 2
  assert.equal(bonusTiroSalvezza(pg, 'destrezza'), 8); // 6 + 2
  assert.equal(bonusTiroSalvezza(pg, 'costituzione'), 5); // invariato

  // 3. Tre Quarti (+5 CA, +5 TS Des)
  pg.copertura = 'tre_quarti';
  assert.equal(bonusCopertura(pg).ca, 5);
  assert.equal(bonusCopertura(pg).tsDes, 5);
  assert.equal(caTotale(pg), 19); // 14 + 5
  assert.equal(bonusTiroSalvezza(pg, 'destrezza'), 11); // 6 + 5

  // 4. Totale (totale = true)
  pg.copertura = 'totale';
  assert.equal(bonusCopertura(pg).totale, true);
});


// ========================= Competenza armature =========================

test('competenteInArmatura: manuale e nessuna sempre concesse', () => {
  const s = schedaBase();
  assert.equal(competenteInArmatura(s, 'manuale'), true);
  assert.equal(competenteInArmatura(s, 'nessuna'), true);
});

test('competenteInArmatura: leggera/media/pesante seguono l addestramento', () => {
  const s = schedaBase({ addestramento: { armature: { leggera: true } } });
  assert.equal(competenteInArmatura(s, 'leggera'), true);
  assert.equal(competenteInArmatura(s, 'media'), false);
  assert.equal(competenteInArmatura(s, 'pesante'), false);
});

test('competenteInArmatura: scheda senza addestramento non esplode', () => {
  const s = schedaBase({ addestramento: undefined });
  assert.equal(competenteInArmatura(s, 'pesante'), false);
});

// ========================= Abilità =========================

test('bonusAbilita: non competente = solo modificatore', () => {
  // Furtività dipende da Destrezza (+3)
  assert.equal(bonusAbilita(schedaBase(), 'furtivita'), 3);
});

test('bonusAbilita: competente aggiunge il bonus di competenza', () => {
  const s = schedaBase({ abilita: { furtivita: 1 } });
  assert.equal(bonusAbilita(s, 'furtivita'), 6); // 3 + 3
});

test('bonusAbilita: livello 2 (competenza di classe) vale come ×1', () => {
  const s = schedaBase({ abilita: { furtivita: 2 } });
  assert.equal(bonusAbilita(s, 'furtivita'), 6);
});

test('bonusAbilita: livello 3 (Maestria/Expertise) raddoppia la competenza', () => {
  // Ladro/Bardo: doppia competenza sulle abilità già competenti.
  const s = schedaBase({ abilita: { furtivita: 3 } });
  assert.equal(bonusAbilita(s, 'furtivita'), 9); // 3 (mod) + 2×3 (competenza raddoppiata)
});

test('bonusAbilita: abilità inesistente = 0', () => {
  assert.equal(bonusAbilita(schedaBase(), 'nonEsiste'), 0);
});

test('bonusAbilita: ogni abilità nota si calcola senza errori', () => {
  const s = schedaBase();
  for (const a of ABILITA) {
    const v = bonusAbilita(s, a.key);
    assert.equal(Number.isFinite(v), true, `abilità ${a.key} non numerica`);
  }
});

// ========================= Tiri salvezza =========================

test('bonusTiroSalvezza: senza competenza = solo modificatore', () => {
  assert.equal(bonusTiroSalvezza(schedaBase(), 'destrezza'), 3);
  assert.equal(bonusTiroSalvezza(schedaBase(), 'forza'), -1);
});

test('bonusTiroSalvezza: con competenza aggiunge il bonus', () => {
  const s = schedaBase({ tiriSalvezza: { destrezza: true } });
  assert.equal(bonusTiroSalvezza(s, 'destrezza'), 6);
});

test('oggetti: Mantello della Protezione aggiunge 1 a CA e TS solo se indossato e sintonizzato', () => {
  const mantello = { nome: 'Mantello della Protezione', equip: true, richiedeSintonia: true, effettoMeccanico: 'classe_armatura_tiri_salvezza_1' };
  const nonSintonizzato = schedaBase({ inventario: [mantello] });
  assert.equal(caTotale(nonSintonizzato), 13);
  assert.equal(bonusTiroSalvezza(nonSintonizzato, 'destrezza'), 3);
  const attivo = { ...nonSintonizzato, sintonia: ['Mantello della Protezione'] };
  assert.equal(caTotale(attivo), 14);
  assert.equal(bonusTiroSalvezza(attivo, 'destrezza'), 4);
});

test('oggetti: Guanti del Potere Orchesco impostano Forza a 19 senza abbassare valori superiori', () => {
  const guanti = { nome: 'Guanti del Potere Orchesco', equip: true, richiedeSintonia: true, effettoMeccanico: 'forza_impostata_19' };
  const attivo = schedaBase({ inventario: [guanti], sintonia: ['Guanti del Potere Orchesco'] });
  assert.equal(punteggioCaratteristica(attivo, 'forza'), 19);
  assert.equal(bonusTiroSalvezza(attivo, 'forza'), 4);
  assert.equal(punteggioCaratteristica({ ...attivo, caratteristiche: { ...attivo.caratteristiche, forza: 20 } }, 'forza'), 20);
});

// ========================= Coerenza tabelle =========================

test('tabelle: 6 caratteristiche e 18 abilità, tutte collegate correttamente', () => {
  assert.equal(CARATTERISTICHE.length, 6);
  assert.equal(ABILITA.length, 18);
  const chiavi = new Set(CARATTERISTICHE.map((c) => c.key));
  for (const a of ABILITA) {
    assert.equal(chiavi.has(a.car), true, `abilità ${a.key} punta a caratteristica sconosciuta: ${a.car}`);
  }
  // nessuna chiave duplicata
  assert.equal(new Set(ABILITA.map((a) => a.key)).size, 18);
});

test('formattaNomePg: forza maiuscole all inizio di ogni parola e token', () => {
  assert.equal(formattaNomePg('kairon'), 'Kairon');
  assert.equal(formattaNomePg('mago varis'), 'Mago Varis');
  assert.equal(formattaNomePg('vaelion (val) leafwhisper'), 'Vaelion (Val) Leafwhisper');
  assert.equal(formattaNomePg('frost'), 'Frost');
  assert.equal(formattaNomePg('Elevorn DeVille'), 'Elevorn DeVille');
  assert.equal(formattaNomePg('flyora delle acque nere'), 'Flyora Delle Acque Nere');
  assert.equal(formattaNomePg(''), '');
  assert.equal(formattaNomePg(null), '');
});

// ========================= Vaelion Leafwhisper =========================

test('Vaelion: CA con Corazza Legnoferro (media 14) + DES 15 (+2) + Mantello (+1) = 17', () => {
  const vaelion = {
    nome: 'Vaelion (Val) Leafwhisper',
    classe: 'Druido',
    sottoclasse: 'Circolo del Pastore',
    livello: 10,
    bonusCompetenza: 4,
    caratteristiche: { forza: 4, destrezza: 15, costituzione: 14, intelligenza: 10, saggezza: 20, carisma: 12 },
    armatura: { nome: 'Corazza a Piastre in Legnoferro', tipo: 'media', base: 14, scudo: false, bonus: 0 },
    tiriSalvezza: { forza: false, destrezza: false, costituzione: false, intelligenza: true, saggezza: true, carisma: false },
    inventario: [
      { id: 'inv-1', nome: 'Corazza a Piastre in Legnoferro', equip: true, categoria: 'Armatura' },
      { id: 'inv-2', nome: 'Mantello della Protezione', equip: true, effettoMeccanico: 'classe_armatura_tiri_salvezza_1', richiedeSintonia: true },
      { id: 'inv-3', nome: 'Guanti del Potere Orchesco', equip: true, effettoMeccanico: 'forza_impostata_19', richiedeSintonia: true },
    ],
    sintonia: ['Mantello della Protezione', 'Guanti del Potere Orchesco'],
    addestramento: { armature: { leggera: true, media: true, pesante: false, scudi: true } },
    abilita: { medicina: 1, natura: 2, percezione: 2, religione: 1, addestrareAnimali: 2 },
  };

  assert.equal(caTotale(vaelion), 17); // 14 + min(2,2) + 1 mantello
  assert.equal(bonusTiroSalvezza(vaelion, 'saggezza'), 10); // +5 SAG + 4 comp + 1 mantello
  assert.equal(punteggioCaratteristica(vaelion, 'forza'), 19); // 19 da guanti
  assert.equal(bonusAbilita(vaelion, 'percezione'), 9); // +5 SAG + 4 comp
  assert.equal(competenteInArmatura(vaelion, 'media'), true);
});

// ========================= Wendell Cedric Thistletune =========================

test('Wendell: CA Cuoio Borchiato (12) + DES 16 (+3) = 15, Maestria Inganno/Persuasione = +10, TS Des/Car = +6/+7', async () => {
  const { WENDELL_JSON } = await import('../src/data/esempi.js');
  assert.equal(caTotale(WENDELL_JSON), 15);
  assert.equal(bonusTiroSalvezza(WENDELL_JSON, 'destrezza'), 6); // +3 DES + 3 comp
  assert.equal(bonusTiroSalvezza(WENDELL_JSON, 'carisma'), 7); // +4 CAR + 3 comp
  assert.equal(bonusAbilita(WENDELL_JSON, 'inganno'), 10); // +4 CAR + 6 maestria
  assert.equal(bonusAbilita(WENDELL_JSON, 'persuasione'), 10); // +4 CAR + 6 maestria
  assert.equal(bonusAbilita(WENDELL_JSON, 'intrattenere'), 7); // +4 CAR + 3 comp
  assert.equal(bonusAbilita(WENDELL_JSON, 'rapiditaDiMano'), 6); // +3 DES + 3 comp
  assert.equal(bonusAbilita(WENDELL_JSON, 'percezione'), 4); // +1 SAG + 3 comp
  assert.equal(WENDELL_JSON.incantesimiLista.length, 12); // 3 trucchetti + 9 incantesimi
});

// ========================= Lyrian Faenor "Mezzafaccia" =========================

test('Lyrian: Guerriero 4 / Warlock 1 (Totale 5, BC +3), CA 18, PF 36, Dadi Vita 4d10+1d8', async () => {
  const { LYRIAN_JSON } = await import('../src/data/esempi.js');
  assert.equal(LYRIAN_JSON.classe, 'Guerriero');
  assert.equal(LYRIAN_JSON.livello, 4);
  assert.equal(LYRIAN_JSON.multiclasse[0].classe, 'Warlock');
  assert.equal(LYRIAN_JSON.multiclasse[0].livello, 1);
  assert.equal(LYRIAN_JSON.bonusCompetenza, 3);
  assert.equal(caTotale(LYRIAN_JSON), 18); // 12 cuoio + 4 DES + 2 scudo
  assert.equal(LYRIAN_JSON.pfMax, 36);
  assert.equal(bonusTiroSalvezza(LYRIAN_JSON, 'forza'), 3); // 0 FOR + 3 comp
  assert.equal(bonusTiroSalvezza(LYRIAN_JSON, 'costituzione'), 5); // +2 COS + 3 comp
  assert.equal(bonusAbilita(LYRIAN_JSON, 'atletica'), 3); // 0 FOR + 3 comp
  assert.equal(bonusAbilita(LYRIAN_JSON, 'intimidire'), 6); // +3 CAR + 3 comp
  assert.equal(bonusAbilita(LYRIAN_JSON, 'percezione'), 4); // +1 SAG + 3 comp
  assert.equal(bonusAbilita(LYRIAN_JSON, 'sopravvivenza'), 4); // +1 SAG + 3 comp
  assert.equal(LYRIAN_JSON.slotIncantesimo[1].totale, 1);
  assert.equal(LYRIAN_JSON.incantesimiLista.length, 4);
});

test('spiegaIncantesimo: funziona per TUTTI gli incantesimi di tutte le classi (5.0, 5.5 e DB) in italiano e inglese', async () => {
  const { INCANTESIMI_CLASSE, INCANTESIMI_CLASSE_2014 } = await import('../src/data/dati5e.js');
  const { INCANTESIMI_DB } = await import('../src/data/incantesimi.js');
  const { setLinguaAttuale } = await import('../src/i18n.js');

  const allSpells = new Set();
  function addSpells(obj) {
    if (!obj) return;
    if (Array.isArray(obj)) {
      obj.forEach(s => typeof s === 'string' && allSpells.add(s));
    } else if (typeof obj === 'object') {
      Object.values(obj).forEach(v => addSpells(v));
    }
  }

  addSpells(INCANTESIMI_CLASSE);
  addSpells(INCANTESIMI_CLASSE_2014);
  Object.keys(INCANTESIMI_DB).forEach(s => allSpells.add(s));

  assert.ok(allSpells.size >= 280, `Attesi almeno 280 incantesimi, trovati ${allSpells.size}`);

  // Test in Italiano
  setLinguaAttuale('it');
  for (const s of allSpells) {
    const desc = spiegaIncantesimo(s);
    assert.ok(desc && desc.trim().length > 5, `Descrizione mancante o vuota in IT per: "${s}"`);
  }

  // Test in Inglese
  setLinguaAttuale('en');
  for (const s of allSpells) {
    const desc = spiegaIncantesimo(s);
    assert.ok(desc && desc.trim().length > 5, `Descrizione mancante o vuota in EN per: "${s}"`);
  }
  setLinguaAttuale('it');
});

test('generatore nomi fantasy: copre tutte le specie con decine di nomi e cognomi tipici e distinzione di genere', async () => {
  const { NOMI_SPECIE, NOMI_SPECIE_GENERE, COGNOMI_SPECIE, NOMI_GENERICI } = await import('../src/data/dati5e.js');
  assert.ok(NOMI_SPECIE.elfo.length >= 80);
  assert.ok(NOMI_SPECIE.nano.length >= 80);
  assert.ok(NOMI_SPECIE.umano.length >= 80);
  assert.ok(NOMI_SPECIE.halfling.length >= 60);
  assert.ok(NOMI_SPECIE.orco.length >= 60);
  assert.ok(NOMI_SPECIE.tiefling.length >= 50);
  assert.ok(NOMI_SPECIE.drago.length >= 50);
  assert.ok(NOMI_SPECIE.gnomo.length >= 60);
  assert.ok(NOMI_SPECIE_GENERE.elfo.maschio.length >= 40);
  assert.ok(NOMI_SPECIE_GENERE.elfo.femmina.length >= 40);
  assert.ok(NOMI_SPECIE_GENERE.umano.maschio.length >= 40);
  assert.ok(NOMI_SPECIE_GENERE.umano.femmina.length >= 35);
  assert.ok(NOMI_SPECIE_GENERE.nano.maschio.length >= 40);
  assert.ok(NOMI_SPECIE_GENERE.nano.femmina.length >= 35);
  assert.ok(COGNOMI_SPECIE.elfo.length >= 20);
  assert.ok(COGNOMI_SPECIE.nano.length >= 15);
  assert.ok(COGNOMI_SPECIE.umano.length >= 15);
  assert.ok(NOMI_GENERICI.length >= 25);
});

test('bestiario: tutte le bestie, famigli ed evocazioni hanno statistiche e velocità valide', async () => {
  const { BESTIE, FAMIGLI, EVOCAZIONI } = await import('../src/data/bestiario.js');
  assert.ok(BESTIE.length > 20);
  assert.ok(FAMIGLI.length > 8);
  assert.ok(EVOCAZIONI.length > 8);
  for (const c of [...BESTIE, ...FAMIGLI, ...EVOCAZIONI]) {
    assert.ok(c.nome, 'Nome presente');
    assert.ok(typeof c.ca === 'number' && c.ca > 0, `CA valida per ${c.nome}`);
    assert.ok(typeof c.pf === 'number' && c.pf > 0, `PF validi per ${c.nome}`);
    assert.ok(c.velocita, `Velocità presente per ${c.nome}`);
  }
});

test('tiraDanni: critico raddoppia i dadi ma non i modificatori fissi', () => {
  const parsata = parseEspressioneDado('1d8+3');
  assert.ok(parsata);
  const normale = tiraDanni(parsata, false);
  assert.ok(normale.totale >= 4 && normale.totale <= 11);
  assert.match(normale.dettaglio, /1d8/);

  const critico = tiraDanni(parsata, true);
  assert.ok(critico.totale >= 5 && critico.totale <= 19);
  assert.match(critico.dettaglio, /2d8/);
});

test('classificaIncantesimoCombattimento: Frusta di Spine e Morsa del Gelo riconosciuti come incantesimi offensivi', async () => {
  const { classificaIncantesimoCombattimento } = await import('../src/rules/regole.js');
  const sp1 = classificaIncantesimoCombattimento({ nome: 'Frusta di Spine' });
  assert.equal(sp1.mostraInCombattimento, true);
  assert.equal(sp1.isTS, false); // Attacco corpo a corpo magico

  const sp2 = classificaIncantesimoCombattimento({ nome: 'Morsa del Gelo' });
  assert.equal(sp2.mostraInCombattimento, true);
  assert.equal(sp2.isTS, true); // Tiro salvezza su Costituzione
});

test('formattaTitoloVoce: converte voci in MAIUSCOLO in Title Case preservando congiunzioni/preposizioni', async () => {
  const { formattaTitoloVoce } = await import('../src/rules/scheda.js');
  assert.equal(formattaTitoloVoce('LINGUA DEI BOSCHI'), 'Lingua dei Boschi');
  assert.equal(formattaTitoloVoce('RETAGGIO FATATO'), 'Retaggio Fatato');
  assert.equal(formattaTitoloVoce('MASCHERA DELLA SELVA'), 'Maschera della Selva');
  assert.equal(formattaTitoloVoce('TRANCE'), 'Trance');
});

test('tabelleBackground: ogni background ha 8 tratti, 6 ideali, 6 legami e 6 difetti completi', async () => {
  const { TABELLE_BACKGROUND, datiTabelleBackground } = await import('../src/data/tabelleBackground.js');
  
  for (const [key, bg] of Object.entries(TABELLE_BACKGROUND)) {
    assert.equal(bg.tratti.length, 8, `Tratti d8 per ${key}`);
    assert.equal(bg.tratti_en.length, 8, `Tratti d8 (en) per ${key}`);
    assert.equal(bg.ideali.length, 6, `Ideali d6 per ${key}`);
    assert.equal(bg.ideali_en.length, 6, `Ideali d6 (en) per ${key}`);
    assert.equal(bg.legami.length, 6, `Legami d6 per ${key}`);
    assert.equal(bg.legami_en.length, 6, `Legami d6 (en) per ${key}`);
    assert.equal(bg.difetti.length, 6, `Difetti d6 per ${key}`);
    assert.equal(bg.difetti_en.length, 6, `Difetti d6 (en) per ${key}`);
  }

  const accIT = datiTabelleBackground('Accolito', 'it');
  assert.ok(accIT);
  assert.equal(accIT.tratti.length, 8);
  assert.match(accIT.tratti[0], /Venero un particolare eroe/);

  const accEN = datiTabelleBackground('Acolyte', 'en');
  assert.ok(accEN);
  assert.equal(accEN.tratti.length, 8);
  assert.match(accEN.tratti[0], /I idolize a particular hero/);

  // Alias
  const contadino = datiTabelleBackground('Contadino', 'it');
  assert.ok(contadino);
  assert.equal(contadino.chiave, 'eroe_popolare');

  const sapiente = datiTabelleBackground('Sapiente', 'it');
  assert.ok(sapiente);
  assert.equal(sapiente.chiave, 'saggio');
});

test('Forma Bestiale: sostituisce FOR, DES, COS e CA con le statistiche della bestia, preservando INT, SAG, CAR', () => {
  const druido = schedaBase({
    caratteristiche: { forza: 8, destrezza: 14, costituzione: 12, intelligenza: 10, saggezza: 18, carisma: 13 },
    armatura: { tipo: 'leggera', base: 11 }, // CA normale = 11 + 2 = 13
    formaBestiale: {
      attiva: true,
      nome: 'Orso bruno',
      ca: 11,
      pfMax: 34,
      pfAttuali: 34,
      car: { forza: 19, destrezza: 10, costituzione: 16 }
    }
  });

  // Caratteristiche fisiche della bestia (Regole 5e PHB)
  assert.equal(punteggioCaratteristica(druido, 'forza'), 19);
  assert.equal(punteggioCaratteristica(druido, 'destrezza'), 10);
  assert.equal(punteggioCaratteristica(druido, 'costituzione'), 16);

  // Caratteristiche mentali del druido conservate
  assert.equal(punteggioCaratteristica(druido, 'intelligenza'), 10);
  assert.equal(punteggioCaratteristica(druido, 'saggezza'), 18);
  assert.equal(punteggioCaratteristica(druido, 'carisma'), 13);

  // CA naturale della bestia
  assert.equal(caTotale(druido), 11);

  // Abilità e Tiri Salvezza in Forma Bestiale (Regole PHB 5e)
  druido.livello = 2;
  druido.bonusCompetenza = 2;
  druido.abilita = { percezione: 1 }; // Competente in percezione (+4 con SAG 18 = +4+2 = +6)
  druido.tiriSalvezza = { saggezza: true, intelligenza: true };

  // Atletica: FOR bestia 19 (+4) + no comp = +4
  assert.equal(bonusAbilita(druido, 'atletica'), 4);
  // Acrobazia: DES bestia 10 (+0) + no comp = +0
  assert.equal(bonusAbilita(druido, 'acrobazia'), 0);
  // Percezione: SAG druido 18 (+4) + comp (+2) = +6
  assert.equal(bonusAbilita(druido, 'percezione'), 6);

  // Gufo con competenze speciali della bestia: Percezione +3, Furtività +3
  druido.formaBestiale.abilita = 'Percezione +3, Furtività +3';
  // Furtività: Druido ha DES 10 (+0) e non è competente (+0), ma il Gufo ha +3 -> usa +3 della bestia!
  assert.equal(bonusAbilita(druido, 'furtivita'), 3);
  // Percezione: Il druido ha +6 (superiore al +3 del Gufo) -> usa il +6 del druido!
  assert.equal(bonusAbilita(druido, 'percezione'), 6);

  // TS: FOR (+4), DES (+0), COS (+3), SAG (+4+2 = +6)
  assert.equal(bonusTiroSalvezza(druido, 'forza'), 4);
  assert.equal(bonusTiroSalvezza(druido, 'destrezza'), 0);
  assert.equal(bonusTiroSalvezza(druido, 'costituzione'), 3);
  assert.equal(bonusTiroSalvezza(druido, 'saggezza'), 6);

  // Quando la forma bestiale si disattiva (ritorno a forma umanoide)
  druido.formaBestiale.attiva = false;
  assert.equal(punteggioCaratteristica(druido, 'forza'), 8);
  assert.equal(punteggioCaratteristica(druido, 'destrezza'), 14);
  assert.equal(punteggioCaratteristica(druido, 'costituzione'), 12);
  assert.equal(caTotale(druido), 13);
  assert.equal(bonusAbilita(druido, 'atletica'), -1); // FOR 8 (-1)
  assert.equal(bonusAbilita(druido, 'acrobazia'), 2); // DES 14 (+2)
  assert.equal(bonusAbilita(druido, 'furtivita'), 2); // DES 14 (+2)
});

test('Forma Bestiale: genera avatar SVG e icone coerenti per ogni animale', async () => {
  const { iconaBestia, generaAvatarBestia } = await import('../src/ritratti.js');
  
  assert.equal(iconaBestia('Orso bruno'), '🐻');
  assert.equal(iconaBestia('Lupo crudele'), '🐺');
  assert.equal(iconaBestia('Aquila gigante'), '🦅');
  assert.equal(iconaBestia('Squalo cacciatore'), '🦈');
  assert.equal(iconaBestia('Serpente velenoso'), '🐍');
  assert.equal(iconaBestia('Ragno gigante'), '🕷️');
  assert.equal(iconaBestia('Scorpione gigante'), '🦂');

  const svgOrso = generaAvatarBestia({ nome: 'Orso bruno', gs: 1 });
  assert.ok(svgOrso.startsWith('data:image/svg+xml,'));
  assert.ok(svgOrso.includes('ORSO%20BRUNO'));
  assert.ok(svgOrso.includes('GS%201'));
});

test('Taglia 5e: calcolo taglia effettiva con Forma Bestiale, Ingrandire e Ridurre', async () => {
  const { tagliaEffettiva, MOLTIPLICATORI_TAGLIA, SPAZIO_TAGLIA_5E, LOTTA_MAX_TAGLIA_5E } = await import('../src/rules/scheda.js');
  
  const pg = { taglia: 'Media', condizioni: [], effettoTaglia: null, formaBestiale: { attiva: false } };
  assert.equal(tagliaEffettiva(pg), 'Media');
  assert.equal(MOLTIPLICATORI_TAGLIA[tagliaEffettiva(pg)], 1);

  // Ingrandire / Enlarge (+1 taglia)
  pg.effettoTaglia = 'ingrandito';
  assert.equal(tagliaEffettiva(pg), 'Grande');
  assert.equal(MOLTIPLICATORI_TAGLIA[tagliaEffettiva(pg)], 2);
  assert.equal(SPAZIO_TAGLIA_5E[tagliaEffettiva(pg)], '3 m × 3 m (4 quadretti)');
  assert.equal(LOTTA_MAX_TAGLIA_5E[tagliaEffettiva(pg)], 'Enorme');

  // Ridurre / Reduce (-1 taglia)
  pg.effettoTaglia = 'ridotto';
  assert.equal(tagliaEffettiva(pg), 'Piccola');
  assert.equal(MOLTIPLICATORI_TAGLIA[tagliaEffettiva(pg)], 1);

  // Forma Bestiale sovrascrive con la taglia della bestia (es. Alce gigante = Enorme)
  pg.formaBestiale = { attiva: true, taglia: 'Enorme' };
  assert.equal(tagliaEffettiva(pg), 'Enorme');
  assert.equal(MOLTIPLICATORI_TAGLIA[tagliaEffettiva(pg)], 4);
});

test('Forma Bestiale: parsing attacchi e azioni delle bestie per tiri dadi', async () => {
  const { parseAzioneBestia } = await import('../src/rules/scheda.js');

  const morsoRospo = parseAzioneBestia('Morso: +4 al tiro per colpire, 1d10+2 danni perforanti + 1d10 veleno; afferra il bersaglio (CD 13).');
  assert.equal(morsoRospo.nome, 'Morso');
  assert.equal(morsoRospo.bonus, 4);
  assert.equal(morsoRospo.danno, '1d10+2');
  assert.equal(morsoRospo.cd, 13);

  const inghiottire = parseAzioneBestia('Inghiottire: inghiotte una creatura Media o più piccola. 3d6 danni da acido a turno.');
  assert.equal(inghiottire.nome, 'Inghiottire');
  assert.equal(inghiottire.bonus, null);
  assert.equal(inghiottire.danno, '3d6');

  const artigliGatto = parseAzioneBestia('Artigli: +0 al tiro per colpire, 1 danno tagliente.');
  assert.equal(artigliGatto.nome, 'Artigli');
  assert.equal(artigliGatto.bonus, 0);
  assert.equal(artigliGatto.danno, '1');
});


test('Level Up: dettagli progressione e multiclasse 5e', async () => {
  const { dettagliProgressioneLivello, MULTICLASSE_REQUISITI_5E, MULTICLASSE_COMPETENZE_5E } = await import('../src/rules/regole.js');

  // Ladro da liv 2 a liv 3: Attacco furtivo aumenta a 2d6
  const progLadro = dettagliProgressioneLivello('Ladro', 2, 3);
  assert.ok(progLadro.some((p) => p.nome === 'Attacco Furtivo' && p.desc.includes('2d6')));

  // Guerriero da liv 4 a liv 5: Attacco Extra
  const progGuerriero = dettagliProgressioneLivello('Guerriero', 4, 5);
  assert.ok(progGuerriero.some((p) => p.nome === 'Attacco Extra'));

  // Paladino da liv 1 a liv 2: Punizione Divina e Imposizione delle mani
  const progPala = dettagliProgressioneLivello('Paladino', 1, 2);
  assert.ok(progPala.some((p) => p.nome === 'Imposizione delle Mani' && p.desc.includes('10 PF')));
  assert.ok(progPala.some((p) => p.nome === 'Punizione Divina'));

  // Requisiti e competenze multiclasse
  assert.equal(MULTICLASSE_REQUISITI_5E.guerriero, 'FOR 13 o DES 13');
  assert.equal(MULTICLASSE_REQUISITI_5E.paladino, 'FOR 13 e CAR 13');
  assert.ok(MULTICLASSE_COMPETENZE_5E.ladro.armature.leggera);
  assert.ok(MULTICLASSE_COMPETENZE_5E.ladro.strumenti.includes('scasso'));
});

test('Trucchetti: moltiplicatore e scaling automatico dei danni con il livello 5e', async () => {
  const { moltiplicatoreTrucchetto, scalaDannoTrucchetto } = await import('../src/rules/regole.js');

  // Moltiplicatori di dadi: 1 al liv 1-4, 2 al liv 5-10, 3 al liv 11-16, 4 al liv 17-20
  assert.equal(moltiplicatoreTrucchetto(1), 1);
  assert.equal(moltiplicatoreTrucchetto(4), 1);
  assert.equal(moltiplicatoreTrucchetto(5), 2);
  assert.equal(moltiplicatoreTrucchetto(10), 2);
  assert.equal(moltiplicatoreTrucchetto(11), 3);
  assert.equal(moltiplicatoreTrucchetto(16), 3);
  assert.equal(moltiplicatoreTrucchetto(17), 4);
  assert.equal(moltiplicatoreTrucchetto(20), 4);

  // Dardo di Fuoco: 1d10 -> 2d10 -> 3d10 -> 4d10
  assert.equal(scalaDannoTrucchetto('1d10', 1, 'Dardo di Fuoco'), '1d10');
  assert.equal(scalaDannoTrucchetto('1d10', 5, 'Dardo di Fuoco'), '2d10');
  assert.equal(scalaDannoTrucchetto('1d10', 11, 'Dardo di Fuoco'), '3d10');
  assert.equal(scalaDannoTrucchetto('1d10', 17, 'Dardo di Fuoco'), '4d10');

  // Frusta di Spine: 1d6 -> 2d6
  assert.equal(scalaDannoTrucchetto('1d6', 5, 'Frusta di Spine'), '2d6');

  // Morsa del Gelo: 1d8 -> 2d8
  assert.equal(scalaDannoTrucchetto('1d8', 8, 'Morsa del Gelo'), '2d8');

  // Randello Incantato (Shillelagh): non scala il numero di dadi (resta 1d8)
  assert.equal(scalaDannoTrucchetto('1d8+5', 10, 'Randello Incantato'), '1d8+5');
  assert.equal(scalaDannoTrucchetto('1d8', 20, 'Shillelagh'), '1d8');
});



