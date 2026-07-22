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
// Locate the equip section by ⚖️ marker, print its container text (thead+tbody)
const secText = await p.evaluate(() => {
  const el = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /Ingombro/i.test(e.textContent));
  let sec = el; for (let i=0;i<8 && sec;i++) sec = sec.parentElement;
  return sec ? sec.innerText.slice(0, 600) : 'NO SECTION';
});
console.log('EQUIP SECTION TEXT:\n', secText);
// count kg occurrences in tds (peso cells show "X kg")
const kgCells = await p.$$eval('td', tds => tds.map(t=>t.innerText).filter(x=>/kg$/.test(x.trim())));
console.log('PESO CELLS:', JSON.stringify(kgCells));
await b.close();
