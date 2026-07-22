import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const U='http://localhost:4173/tavolo-dei-dadi/';
const p=await b.newPage();
const sc={nome:'Mago',classe:'Mago',livello:5,maxTrucchetti:2,
 caratteristiche:{forza:8,destrezza:14,costituzione:12,intelligenza:17,saggezza:10,carisma:10},
 incantatore:{caratteristica:'intelligenza'},
 slotIncantesimo:{1:{totale:4,spesi:0},2:{totale:3,spesi:0},3:{totale:2,spesi:0}},
 incantesimiLista:[{id:'a',livello:0,nome:'Mano magica',tempo:'AZ',gittata:'9m',note:''}]};
await p.goto(U,{waitUntil:'networkidle'});
await p.evaluate((s)=>localStorage.setItem('scheda-interattiva:v1',JSON.stringify({attivo:'pg1',personaggi:{pg1:s}})),sc);
await p.reload({waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
await p.waitForTimeout(300);

function invState(page){return page.evaluate(()=>{const r=JSON.parse(localStorage.getItem('scheda-interattiva:v1'));return r.personaggi[r.attivo].incantesimiLista.map(s=>({liv:s.livello,nome:s.nome,bonus:!!s.bonus}));});}

// livello select + spell select are the first two selects in the toolbar
const selects = await p.$$('select.add-spell');
console.log('add-spell selects count (atteso 1 - toolbar unica):', selects.length);

// 1) scegli livello 1 e aggiungi un incantesimo suggerito
await p.selectOption('div select:near(:text("Aggiungi"))', {label:'1° Livello'}).catch(()=>{});
// più robusto: seleziona il livello dal primo select del blocco aggiungi
const levelSel = await p.$$('select');
// trova il select che ha opzione "Trucchetto"
let livSelHandle=null;
for(const s of levelSel){const opts=await s.$$eval('option',o=>o.map(x=>x.textContent));if(opts.some(t=>/Trucchetto/.test(t))&&opts.some(t=>/1° Livello|1° livello/i.test(t))){livSelHandle=s;break;}}
await livSelHandle.selectOption({label:'1° Livello'});
await p.waitForTimeout(200);
// ora il select add-spell offre suggerimenti liv 1: scegli il primo suggerito reale
const addSel=(await p.$$('select.add-spell'))[0];
const opts1=await addSel.$$eval('option',o=>o.map(x=>({v:x.value,t:x.textContent,d:x.disabled})));
const primo=opts1.find(o=>o.v && o.v!=='__manuale__' && !o.d);
console.log('primo suggerito liv1:', primo?.t);
await addSel.selectOption(primo.v);
await p.waitForTimeout(300);
let st=await invState(p);
console.log('dopo add liv1:', JSON.stringify(st.filter(x=>x.liv===1)));

// 2) aggiungi come BONUS: spunta checkbox e aggiungi altro
await p.check('input[type=checkbox]:near(:text("bonus"))').catch(async()=>{
  const cbs=await p.$$('input[type=checkbox]');
  // il checkbox bonus è vicino al testo ✦; prendi l'ultimo nel blocco aggiungi
  for(const cb of cbs){const lab=await cb.evaluateHandle(e=>e.closest('label')?.textContent||'');const txt=await lab.jsonValue();if(/bonus/i.test(txt)){await cb.check();break;}}
});
await p.waitForTimeout(200);
const addSel2=(await p.$$('select.add-spell'))[0];
const opts2=await addSel2.$$eval('option',o=>o.map(x=>({v:x.value,t:x.textContent,d:x.disabled})));
const secondo=opts2.find(o=>o.v && o.v!=='__manuale__' && !o.d);
if(secondo){await addSel2.selectOption(secondo.v);await p.waitForTimeout(300);}
st=await invState(p);
console.log('bonus aggiunti:', JSON.stringify(st.filter(x=>x.bonus)));

// 3) livelli vuoti non mostrati: conteggio banner e h4
const h3=await p.$$eval('h3',e=>e.map(x=>x.textContent.trim()).filter(t=>/trucchetti|incantesimi/i.test(t)));
const h4=await p.$$eval('h4',e=>e.map(x=>x.textContent.trim().split('\n')[0]));
console.log('banner h3:',JSON.stringify(h3));
console.log('livelli mostrati h4:',JSON.stringify(h4.filter(t=>/livello/i.test(t))));
await b.close();
