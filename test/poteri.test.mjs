// Regole pure dei Poteri personalizzati (homebrew): modificatori su
// velocità/CA/iniziativa/PF massimi e sincronizzazione bidirezionale dei
// contatori con `scheda.risorse` (reset 'manuale').
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  BERSAGLI_MODIFICATORE_POTERE,
  BERSAGLIO_LIBERO,
  nuovoPotere,
  normalizzaPotere,
  normalizzaPoteri,
  idRisorsaContatore,
  modificatoriPoteriAttivi,
  bonusPotereBersaglio,
  valoreContatore,
  sincronizzaRisorsePoteri,
} from '../src/rules/poteri.js';
import { risorseDopoRiposo, calcolaMovimentoESalti } from '../src/rules/regole.js';
import { caTotale, iniziativaTotale, pfMassimiEffettivi } from '../src/rules/scheda.js';

function potereDebito(overrides = {}) {
  return {
    id: 'potere-patrono',
    nome: 'Potere del Patrono',
    descrizione: 'Vedo le Anime e i Fili Dorati...',
    attivo: true,
    contatori: [{ nome: 'Debito', attuali: 5, max: null }],
    modificatori: [{ bersaglio: 'velocita', valore: 3, fonte: 'Maschera' }],
    ...overrides,
  };
}

test('normalizzaPotere: riempie i campi mancanti senza far esplodere nulla', () => {
  assert.equal(normalizzaPotere(null), null);
  const p = normalizzaPotere({ nome: 'Prova' });
  assert.equal(p.attivo, true);
  assert.deepEqual(p.contatori, []);
  assert.deepEqual(p.modificatori, []);
  assert.ok(p.id);
});

test('normalizzaPotere: scarta modificatori con bersaglio sconosciuto', () => {
  const p = normalizzaPotere({ nome: 'X', modificatori: [{ bersaglio: 'inventato', valore: 99 }, { bersaglio: 'ca', valore: 1 }] });
  assert.deepEqual(p.modificatori, [{ bersaglio: 'ca', bersaglioLibero: '', valore: 1, fonte: '' }]);
});

test('normalizzaPotere: accetta un bersaglio libero (homebrew) con etichetta scritta a mano', () => {
  const p = normalizzaPotere({ nome: 'X', modificatori: [{ bersaglio: BERSAGLIO_LIBERO, bersaglioLibero: 'Vantaggio ai TS Carisma', valore: 1, fonte: 'Patto' }] });
  assert.deepEqual(p.modificatori, [{ bersaglio: BERSAGLIO_LIBERO, bersaglioLibero: 'Vantaggio ai TS Carisma', valore: 1, fonte: 'Patto' }]);
});

test('bonusPotereBersaglio: somma solo i poteri attivi', () => {
  const scheda = { poteri: [potereDebito(), potereDebito({ id: 'p2', attivo: false, modificatori: [{ bersaglio: 'velocita', valore: 100, fonte: 'X' }] })] };
  assert.equal(bonusPotereBersaglio(scheda, 'velocita'), 3);
  assert.equal(bonusPotereBersaglio(scheda, 'ca'), 0);
});

test('modificatoriPoteriAttivi: usa il nome del potere come fonte se non specificata', () => {
  const scheda = { poteri: [potereDebito({ modificatori: [{ bersaglio: 'ca', valore: 1, fonte: '' }] })] };
  const mods = modificatoriPoteriAttivi(scheda);
  assert.equal(mods[0].fonte, 'Potere del Patrono');
});

test('iniziativaTotale: somma il modificatore Destrezza e il bonus dei poteri', () => {
  const scheda = { caratteristiche: { destrezza: 14 }, poteri: [potereDebito({ modificatori: [{ bersaglio: 'iniziativa', valore: 2, fonte: 'Riflessi' }] })] };
  assert.equal(iniziativaTotale(scheda), 2 + 2); // mod DES 14 = +2, + bonus potere 2
});

test('pfMassimiEffettivi: somma il bonus PF massimi dei poteri', () => {
  const scheda = { pfMax: 20, poteri: [potereDebito({ modificatori: [{ bersaglio: 'pf_massimi', valore: 5, fonte: 'Resilienza' }] })] };
  assert.equal(pfMassimiEffettivi(scheda), 25);
});

test('caTotale: include il bonus CA dei poteri insieme a quello degli oggetti', () => {
  const scheda = {
    armatura: { tipo: 'nessuna' },
    caratteristiche: { destrezza: 14 },
    poteri: [potereDebito({ modificatori: [{ bersaglio: 'ca', valore: 1, fonte: 'Scudo Fatato' }] })],
  };
  assert.equal(caTotale(scheda), 10 + 2 + 1); // base 10 + DES +2 + potere +1
});

test('calcolaMovimentoESalti: la velocità base include il bonus dei poteri', () => {
  const senzaPotere = calcolaMovimentoESalti({ velocita: 9, caratteristiche: { forza: 10 } });
  const conPotere = calcolaMovimentoESalti({ velocita: 9, caratteristiche: { forza: 10 }, poteri: [potereDebito()] });
  assert.equal(senzaPotere.velBase, 9);
  assert.equal(conPotere.velBase, 12); // 9 + 3m dalla Maschera
});

test('sincronizzaRisorsePoteri: crea una risorsa "manuale" per ogni contatore di un potere attivo', () => {
  const risorse = sincronizzaRisorsePoteri([potereDebito()], []);
  assert.equal(risorse.length, 1);
  assert.equal(risorse[0].id, idRisorsaContatore('potere-patrono', 0));
  assert.equal(risorse[0].nome, 'Debito');
  assert.equal(risorse[0].attuali, 5);
  assert.equal(risorse[0].max, null);
  assert.equal(risorse[0].reset, 'manuale');
});

test('sincronizzaRisorsePoteri: preserva gli attuali già modificati da Risorse di Classe', () => {
  const id = idRisorsaContatore('potere-patrono', 0);
  const risorseEsistenti = [{ id, nome: 'Debito', attuali: 8, max: null, reset: 'manuale' }];
  const risorse = sincronizzaRisorsePoteri([potereDebito()], risorseEsistenti);
  assert.equal(risorse[0].attuali, 8, 'un +/- fatto altrove non deve tornare indietro al valore del potere');
});

test('sincronizzaRisorsePoteri: rimuove la risorsa se il potere viene disattivato', () => {
  const id = idRisorsaContatore('potere-patrono', 0);
  const risorseEsistenti = [{ id, nome: 'Debito', attuali: 8, max: null, reset: 'manuale' }];
  const risorse = sincronizzaRisorsePoteri([potereDebito({ attivo: false })], risorseEsistenti);
  assert.equal(risorse.length, 0);
});

test('sincronizzaRisorsePoteri: rimuove la risorsa se il potere viene eliminato', () => {
  const id = idRisorsaContatore('potere-patrono', 0);
  const risorseEsistenti = [{ id, nome: 'Debito', attuali: 8, max: null, reset: 'manuale' }];
  const risorse = sincronizzaRisorsePoteri([], risorseEsistenti);
  assert.equal(risorse.length, 0);
});

test('sincronizzaRisorsePoteri: non tocca le risorse normali non legate a un potere', () => {
  const altra = { id: 'ira', nome: 'Ira', attuali: 2, max: 3, reset: 'lungo' };
  const risorse = sincronizzaRisorsePoteri([potereDebito()], [altra]);
  assert.ok(risorse.some((r) => r.id === 'ira' && r.attuali === 2));
});

test('valoreContatore: legge dalla risorsa collegata quando esiste', () => {
  const scheda = { risorse: [{ id: idRisorsaContatore('potere-patrono', 0), nome: 'Debito', attuali: 7, max: null, reset: 'manuale' }] };
  const v = valoreContatore(scheda, 'potere-patrono', 0, { attuali: 5, max: null });
  assert.equal(v.attuali, 7, 'la risorsa collegata vince sul valore scritto nel potere');
});

test('valoreContatore: ricade sul contatore del potere se la risorsa non esiste ancora', () => {
  const v = valoreContatore({ risorse: [] }, 'potere-patrono', 0, { attuali: 5, max: null });
  assert.equal(v.attuali, 5);
});

test('risorseDopoRiposo: un riposo lungo NON tocca una risorsa con reset manuale', () => {
  const risorse = [{ id: 'x', nome: 'Debito', attuali: 3, max: null, reset: 'manuale' }];
  const dopo = risorseDopoRiposo(risorse, 'lungo');
  assert.equal(dopo[0].attuali, 3, 'il debito narrativo non deve azzerarsi/ripristinarsi da solo');
});

test('risorseDopoRiposo: un riposo lungo continua a ricaricare le risorse normali', () => {
  const risorse = [{ id: 'ira', nome: 'Ira', attuali: 0, max: 3, reset: 'lungo' }, { id: 'y', nome: 'Azione Scaltra usi', attuali: 0, max: 1, reset: 'breve' }];
  const dopo = risorseDopoRiposo(risorse, 'lungo');
  assert.equal(dopo[0].attuali, 3);
  assert.equal(dopo[1].attuali, 1, 'il riposo lungo copre anche il recupero di un riposo breve');
});

test('BERSAGLI_MODIFICATORE_POTERE copre almeno velocità, CA, iniziativa, PF massimi', () => {
  const chiavi = BERSAGLI_MODIFICATORE_POTERE.map((b) => b.chiave);
  for (const attesa of ['velocita', 'ca', 'iniziativa', 'pf_massimi']) {
    assert.ok(chiavi.includes(attesa), `manca il bersaglio ${attesa}`);
  }
});

test('normalizzaPoteri: ignora voci non valide senza far crashare il resto', () => {
  assert.deepEqual(normalizzaPoteri(null), []);
  assert.deepEqual(normalizzaPoteri([null, undefined, potereDebito()]).length, 1);
});

test('nuovoPotere: produce una struttura pronta all\'uso con id univoco', () => {
  const a = nuovoPotere({ nome: 'A' });
  const b = nuovoPotere({ nome: 'B' });
  assert.notEqual(a.id, b.id);
  assert.equal(a.attivo, true);
});
