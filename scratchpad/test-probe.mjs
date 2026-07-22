import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage();
const flyora = {
  nome: 'Flyora', classe: 'Mago', livello: 5, attacchi: [],
  caratteristiche: { forza: 8, destrezza: 14, costituzione: 12, intelligenza: 17, saggezza: 10, carisma: 10 },
  incantatore: { caratteristica: 'intelligenza' },
  equipaggiamento: 'Libro degli incantesimi, Pugnale, Focus arcano, Zaino, Pozione di guarigione',
};
await p.goto('http://localhost:4173/tavolo-dei-dadi/', { waitUntil: 'networkidle' });
await p.evaluate((s) => localStorage.setItem('scheda-interattiva:v1', JSON.stringify({ attivo: 'pg1', personaggi: { pg1: s } })), flyora);
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(500);
// Force a save: toggle language or trigger an update. Read back LS.
const after = await p.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem('scheda-interattiva:v1'));
  const pg = raw.personaggi[raw.attivo];
  return { inventario: pg.inventario, equip: pg.equipaggiamento, maxInc: pg.maxIncantesimi };
});
console.log('AFTER LOAD (no edit):', JSON.stringify(after));
await b.close();
