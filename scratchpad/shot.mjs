import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const U='http://localhost:4173/tavolo-dei-dadi/';
// Caster con trucchetti + incantesimi vari livelli
const spells=[
 {id:'c1',livello:0,nome:'Prestidigitazione',tempo:'AZ',gittata:'3m',note:''},
 {id:'c2',livello:0,nome:'Mano magica',tempo:'AZ',gittata:'9m',note:''},
 {id:'c3',livello:0,nome:'Raggio di gelo',tempo:'AZ',gittata:'18m',note:''},
 {id:'l1',livello:1,nome:'Dardo incantato',tempo:'AZ',gittata:'36m',note:''},
 {id:'l1b',livello:1,nome:'Scudo',tempo:'REAZ',gittata:'personale',note:''},
 {id:'l2',livello:2,nome:'Passo velato',tempo:'AZ BONUS',gittata:'personale',note:'',bonus:true},
 {id:'l3',livello:3,nome:'Palla di fuoco',tempo:'AZ',gittata:'45m',note:'Conc.'},
];
const sc={nome:'Flyora',classe:'Mago',livello:5,
 caratteristiche:{forza:8,destrezza:14,costituzione:12,intelligenza:17,saggezza:10,carisma:10},
 incantatore:{caratteristica:'intelligenza'},
 slotIncantesimo:{1:{totale:4,spesi:1},2:{totale:3,spesi:0},3:{totale:2,spesi:0}},
 incantesimiLista:spells};
async function shot(w,name){
 const p=await b.newPage();
 await p.setViewportSize({width:w,height:1000});
 await p.goto(U,{waitUntil:'networkidle'});
 await p.evaluate((s)=>localStorage.setItem('scheda-interattiva:v1',JSON.stringify({attivo:'pg1',personaggi:{pg1:s}})),sc);
 await p.reload({waitUntil:'networkidle'});
 await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
 await p.waitForTimeout(400);
 // scroll to Magia section
 const h=await p.$$('summary, h2, h3');
 for(const el of h){const t=(await el.innerText()).toLowerCase(); if(t.includes('magia')){await el.scrollIntoViewIfNeeded();break;}}
 // find the Magia <details> and screenshot it
 const handle=await p.evaluateHandle(()=>{
   const secs=[...document.querySelectorAll('details, section')];
   return secs.find(s=>/magia/i.test(s.querySelector('summary,h2,h3')?.textContent||''))||document.body;
 });
 const el=handle.asElement();
 await el.screenshot({path:`/home/user/tavolo-dei-dadi/scratchpad/magia-${name}.png`});
 await p.close();
}
await shot(1100,'desktop');
await shot(390,'mobile');
await b.close();
console.log('done');
