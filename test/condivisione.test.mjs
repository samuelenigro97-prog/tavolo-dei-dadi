// Condivisione via link: andata e ritorno della scheda, gestione del ritratto
// e dimensione del link (deve restare usabile).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  codificaScheda, decodificaScheda, preparaPerCondivisione, ritrattoCondivisibile,
  costruisciLink, payloadDaUrl, LIMITE_PAYLOAD,
} from '../src/utils/condivisione.js';

function schedaPiena(extra = {}) {
  return {
    nome: 'Flyora delle Acque Nere', classe: 'Stregone', sottoclasse: 'Stirpe Draconica',
    specie: 'Tiefling', background: 'Artigiano', livello: 8, versione: '2024',
    caratteristiche: { forza: 8, destrezza: 14, costituzione: 13, intelligenza: 10, saggezza: 12, carisma: 19 },
    abilita: { arcano: 1, inganno: 2, persuasione: 1 },
    tiriSalvezza: { costituzione: true, carisma: true },
    incantatore: { caratteristica: 'carisma' }, bonusCompetenza: 3,
    attacchi: Array.from({ length: 4 }, (_, i) => ({ id: 'a' + i, nome: 'Arma ' + i, bonus: 6, danno: '1d8+3', tipoDanno: 'Perforante', note: 'Accurata, Leggera', categoria: 'Azione' })),
    incantesimiLista: Array.from({ length: 20 }, (_, i) => ({ id: 's' + i, livello: i % 5, nome: 'Incantesimo numero ' + i, tempo: 'AZ', gittata: '18m', scuola: 'Evocazione', danno: '2d8', tipoDanno: 'Fuoco', note: 'V S M', preparato: true })),
    inventario: Array.from({ length: 15 }, (_, i) => ({ id: 'i' + i, nome: 'Oggetto ' + i, qta: 1, peso: 2 })),
    denari: { mr: 50, ma: 20, me: 0, mo: 120, mp: 3 },
    ...extra,
  };
}

test('condivisione: la scheda torna identica dopo andata e ritorno', async () => {
  const s = schedaPiena();
  const payload = await codificaScheda(s);
  const tornata = await decodificaScheda(payload);
  assert.deepEqual(tornata, s);
});

test('condivisione: il link di una scheda piena resta di dimensione usabile', async () => {
  const payload = await codificaScheda(schedaPiena());
  assert.ok(payload.length < LIMITE_PAYLOAD,
    `payload troppo lungo per un link affidabile: ${payload.length} caratteri`);
});

test('condivisione: un avatar generato (SVG leggero) viaggia col link', () => {
  const svg = 'data:image/svg+xml;base64,' + 'A'.repeat(800);
  assert.equal(ritrattoCondivisibile(svg), true);
  const { scheda, ritrattoRimosso } = preparaPerCondivisione(schedaPiena({ ritratto: svg }));
  assert.equal(ritrattoRimosso, false);
  assert.equal(scheda.ritratto, svg);
});

test('condivisione: una foto caricata viene esclusa e la cosa è segnalata', () => {
  const foto = 'data:image/jpeg;base64,' + 'A'.repeat(60000);
  assert.equal(ritrattoCondivisibile(foto), false);
  const { scheda, ritrattoRimosso } = preparaPerCondivisione(schedaPiena({ ritratto: foto }));
  assert.equal(ritrattoRimosso, true);
  assert.equal('ritratto' in scheda, false, 'la foto non deve finire nel link');
});

test('condivisione: con avatar il link resta comunque usabile', async () => {
  const svg = 'data:image/svg+xml;base64,' + 'A'.repeat(800);
  const { scheda } = preparaPerCondivisione(schedaPiena({ ritratto: svg }));
  const payload = await codificaScheda(scheda);
  assert.ok(payload.length < LIMITE_PAYLOAD, `payload con avatar: ${payload.length} caratteri`);
});

test('condivisione: preparaPerCondivisione non modifica la scheda originale', () => {
  const originale = schedaPiena({ ritratto: 'data:image/jpeg;base64,' + 'A'.repeat(60000) });
  const copiaPrima = JSON.stringify(originale);
  preparaPerCondivisione(originale);
  assert.equal(JSON.stringify(originale), copiaPrima, 'la scheda di partenza non va toccata');
});

test('condivisione: link costruito e payload riletto dall URL', () => {
  const link = costruisciLink('https://esempio.it/app/', 'zABC-123_xyz');
  assert.equal(link, 'https://esempio.it/app/#pg=zABC-123_xyz');
  assert.equal(payloadDaUrl(link), 'zABC-123_xyz');
  // un frammento preesistente non deve duplicarsi
  assert.equal(costruisciLink('https://esempio.it/app/#altro', 'zX'), 'https://esempio.it/app/#pg=zX');
});

test('condivisione: un URL senza personaggio non produce payload', () => {
  assert.equal(payloadDaUrl('https://esempio.it/app/'), null);
  assert.equal(payloadDaUrl('https://esempio.it/app/#impostazioni'), null);
  assert.equal(payloadDaUrl(''), null);
  assert.equal(payloadDaUrl(null), null);
});

test('condivisione: un payload corrotto non fa esplodere nulla', async () => {
  assert.equal(await decodificaScheda('zNONVALIDO!!!'), null);
  assert.equal(await decodificaScheda('x123'), null);   // tag sconosciuto
  assert.equal(await decodificaScheda(''), null);
  assert.equal(await decodificaScheda(null), null);
  assert.equal(await decodificaScheda('p' + Buffer.from('non json').toString('base64url')), null);
});

test('condivisione: il formato non compresso è comunque leggibile', async () => {
  // Simula un browser senza CompressionStream: il payload "p" deve funzionare.
  const s = { nome: 'Prova', livello: 3 };
  const piano = 'p' + Buffer.from(JSON.stringify(s)).toString('base64url');
  assert.deepEqual(await decodificaScheda(piano), s);
});
