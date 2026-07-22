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
await p.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
await p.waitForTimeout(300);
// all input values within any table (nome + peso live in inputs)
const inputs = await p.$$eval('table input', els => els.map(e => ({ type:e.type, val:e.value })));
console.log('table inputs:', JSON.stringify(inputs, null, 0));
await b.close();
