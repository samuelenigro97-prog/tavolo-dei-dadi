import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const U='http://localhost:4173/tavolo-dei-dadi/';
for(const w of [430,390,360]){
  const p=await b.newPage();
  await p.setViewportSize({width:w,height:900});
  await p.goto(U,{waitUntil:'networkidle'});
  await p.waitForTimeout(300);
  const rows=await p.$$eval('.dado-btn',els=>{
    const info=els.map(e=>{const r=e.getBoundingClientRect();return {t:e.textContent.trim(),top:Math.round(r.top),w:Math.round(r.width)};});
    return info;
  });
  const tops=[...new Set(rows.map(r=>r.top))];
  console.log(`w=${w}: righe=${tops.length} (atteso 1), d100 top=${rows.find(r=>r.t==='d100')?.top}, larghezze=${rows.map(r=>r.w).join(',')}`);
  await p.close();
}
await b.close();
