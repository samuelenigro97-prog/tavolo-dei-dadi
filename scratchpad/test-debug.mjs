import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

// T1b: inventory weights after migration
const p1 = await b.newPage();
const flyora = {
  nome: 'Flyora', classe: 'Mago', livello: 5,
  caratteristiche: { forza: 8, destrezza: 14, costituzione: 12, intelligenza: 17, saggezza: 10, carisma: 10 },
  incantatore: { caratteristica: 'intelligenza' },
  attacchi: [],
  equipaggiamento: 'Libro degli incantesimi, Pugnale, Focus arcano, Zaino, Pozione di guarigione',
};
await p1.goto('http://localhost:4173/tavolo-dei-dadi/', { waitUntil: 'networkidle' });
await p1.evaluate((s) => localStorage.setItem('scheda-interattiva:v1', JSON.stringify({ attivo: 'pg1', personaggi: { pg1: s } })), flyora);
await p1.reload({ waitUntil: 'networkidle' });
await p1.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
await p1.waitForTimeout(300);
// find inventory table rows: name + peso
const rows = await p1.$$eval('table tr', trs => trs.map(tr => tr.innerText.replace(/\n/g,' | ')).filter(t=>/kg/i.test(t) || /libro|pugnale|focus|zaino|pozione/i.test(t)));
console.log('T1b inventory rows:'); rows.forEach(r=>console.log('   ', r));
const kg = [...(await p1.innerText('body')).matchAll(/[\d.]+\s*\/\s*\d+\s*kg/g)].map(x=>x[0]);
console.log('   ingombro totale:', kg[0]);
const magiaCI = /magia/i.test(await p1.innerText('body'));
console.log('T2 titolo Magia (case-insensitive):', magiaCI ? 'OK' : 'MANCA');
await p1.close();

// T3b: correct leveled select
async function leveledLocked(nLeveled, maxInc) {
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
  // select the normal add-spell for LEVEL 1: it's the first select whose option text mentions "1° Livello" or "Livello 1" add label
  const info = await p.$$eval('select.add-spell', els => els.map(e => ({ disabled: e.disabled, first: e.options[0]?.text || '' })));
  await p.close();
  return info;
}
console.log('T3b selects (3 incantesimi, max 3):');
(await leveledLocked(3,3)).forEach((s,i)=>console.log(`   [${i}] disabled=${s.disabled} first="${s.first}"`));
console.log('T3b selects (2 incantesimi, max 3):');
(await leveledLocked(2,3)).forEach((s,i)=>console.log(`   [${i}] disabled=${s.disabled} first="${s.first}"`));

await b.close();
