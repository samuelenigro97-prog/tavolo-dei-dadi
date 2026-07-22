import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p=await b.newPage();
await p.goto('http://localhost:4173/tavolo-dei-dadi/',{waitUntil:'networkidle'});
await p.evaluate(()=>localStorage.setItem('scheda-interattiva:lingua','en'));
await p.reload({waitUntil:'networkidle'});
await p.waitForTimeout(400);
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
await p.waitForTimeout(300);
// check some title attributes are English now
const titles=await p.$$eval('[title]',els=>els.map(e=>e.getAttribute('title')));
const italianLeft=titles.filter(t=>/\b(Scegli|Rimuovi|Elimina|Aggiungi|Modifica|Chiudi|Duplica|Azzera)\b/.test(t));
const englishFound=titles.filter(t=>/\b(Choose|Remove|Delete|Add|Edit|Close|Duplicate|Reset)\b/.test(t));
console.log('title EN trovati:', englishFound.length);
console.log('title IT rimasti:', italianLeft.length);
console.log('esempi IT rimasti:', [...new Set(italianLeft)].slice(0,12));
await b.close();
