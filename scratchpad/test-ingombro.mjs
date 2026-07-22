import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage();
const scheda = {
  nome: 'Test Ingombro', classe: 'Guerriero', livello: 1,
  caratteristiche: { forza: 10, destrezza: 10, costituzione: 10, intelligenza: 10, saggezza: 10, carisma: 10 },
  armatura: { nome: 'Cotta di maglia', tipo: 'pesante', base: 16, scudo: true, bonus: 0 },
  attacchi: [{ id: 1, nome: 'Spada lunga', bonus: 3, danno: '1d8+1', tipoDanno: 'Tagliente', note: '' },
             { id: 2, nome: 'Pugnale', bonus: 3, danno: '1d4+1', tipoDanno: 'Perforante', note: '' }],
  inventario: [{ id: 'i1', nome: 'Zaino', qta: 1, peso: 2.5, equip: false, categoria: '' }],
};
await p.goto('http://localhost:4173/tavolo-dei-dadi/', { waitUntil: 'networkidle' });
await p.evaluate((s) => localStorage.setItem('scheda-interattiva:v1', JSON.stringify({ attivo: 'pg1', personaggi: { pg1: s } })), scheda);
await p.reload({ waitUntil: 'networkidle' });
// Force-open all details so the equip section content renders
await p.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
await p.waitForTimeout(400);
const body = await p.innerText('body');
const all = [...body.matchAll(/[\d.]+\s*\/\s*\d+\s*kg/g)].map(x=>x[0]);
console.log('KG MATCHES:', all);
await b.close();
