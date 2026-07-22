import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

// --- Test 1: migrazione inventario da equipaggiamento testuale (Flyora-like) ---
const p1 = await b.newPage();
const flyora = {
  nome: 'Flyora', classe: 'Mago', livello: 5,
  caratteristiche: { forza: 8, destrezza: 14, costituzione: 12, intelligenza: 17, saggezza: 10, carisma: 10 },
  incantatore: { caratteristica: 'intelligenza' },
  equipaggiamento: 'Libro degli incantesimi, Pugnale, Focus arcano, Zaino, Pozione di guarigione',
  // NOTA: nessun campo inventario → deve migrare dal testo
};
await p1.goto('http://localhost:4173/tavolo-dei-dadi/', { waitUntil: 'networkidle' });
await p1.evaluate((s) => localStorage.setItem('scheda-interattiva:v1', JSON.stringify({ attivo: 'pg1', personaggi: { pg1: s } })), flyora);
await p1.reload({ waitUntil: 'networkidle' });
await p1.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
await p1.waitForTimeout(300);
const body1 = await p1.innerText('body');
const invItems = ['Libro degli incantesimi', 'Pugnale', 'Focus arcano', 'Zaino', 'Pozione di guarigione'];
console.log('T1 migrazione inventario:');
for (const it of invItems) console.log('   ', it, body1.includes(it) ? 'OK' : 'MANCA');
const kg1 = [...body1.matchAll(/[\d.]+\s*\/\s*\d+\s*kg/g)].map(x=>x[0]);
console.log('   ingombro:', kg1[0] || 'n/d');
// dropdown "Scegli dal menu" presente?
console.log('   dropdown scegli-menu:', body1.includes('Scegli dal menu') ? 'OK' : 'MANCA');

// --- Test 2: sezione Magia + banner Trucchetti/Incantesimi ---
console.log('T2 rinomina magia:');
console.log('   titolo "Magia":', /\bMagia\b/.test(body1) ? 'OK' : 'MANCA');
// banner: cerca "Trucchetti" e "Incantesimi" come intestazioni h3
const h3s = await p1.$$eval('h3', els => els.map(e => e.textContent.trim()));
console.log('   h3 headings:', JSON.stringify(h3s.filter(x=>/trucchetti|incantesimi/i.test(x))));

// --- Test 3: blocco incantesimi con max fissato ---
// 3 incantesimi liv>0, max fissato a 3 → select disabilitato; con 2 → abilitato
async function spellLocked(nLeveled, maxInc) {
  const p = await b.newPage();
  const spells = Array.from({length:nLeveled},(_,i)=>({id:'s'+i, livello:1, nome:'Incantesimo '+i, tempo:'AZ', gittata:'', note:''}));
  const sc = { nome:'Test', classe:'Mago', livello:5, maxIncantesimi:maxInc, maxTrucchetti:2,
    caratteristiche:{forza:8,destrezza:14,costituzione:12,intelligenza:17,saggezza:10,carisma:10},
    incantatore:{caratteristica:'intelligenza'},
    slotIncantesimo:{1:{totale:4,spesi:0},2:{totale:3,spesi:0},3:{totale:2,spesi:0}},
    incantesimiLista:spells };
  await p.goto('http://localhost:4173/tavolo-dei-dadi/', { waitUntil:'networkidle' });
  await p.evaluate((s)=>localStorage.setItem('scheda-interattiva:v1', JSON.stringify({attivo:'pg1',personaggi:{pg1:s}})), sc);
  await p.reload({ waitUntil:'networkidle' });
  await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
  await p.waitForTimeout(300);
  // il primo select.add-spell (livello 1, normale) disabled?
  const dis = await p.$$eval('select.add-spell', els => els.length ? els[0].disabled : null);
  await p.close();
  return dis;
}
console.log('T3 lock incantesimi (max fissato 3):');
console.log('   con 3 incantesimi → select disabled:', await spellLocked(3,3), '(atteso true)');
console.log('   con 2 incantesimi → select disabled:', await spellLocked(2,3), '(atteso false)');

// --- Test 4: d100 non è barra a piena larghezza (mobile) ---
const p4 = await b.newPage();
await p4.setViewportSize({ width: 390, height: 800 });
await p4.goto('http://localhost:4173/tavolo-dei-dadi/', { waitUntil:'networkidle' });
await p4.waitForTimeout(300);
const d100box = await p4.$$eval('.dado-btn', els => {
  const d = els.find(e => e.textContent.trim() === 'd100');
  return d ? d.getBoundingClientRect().width : null;
});
console.log('T4 d100 larghezza mobile:', d100box ? d100box.toFixed(0)+'px' : 'n/d', d100box && d100box < 140 ? 'OK (normale)' : 'TROPPO LARGO');

await b.close();
