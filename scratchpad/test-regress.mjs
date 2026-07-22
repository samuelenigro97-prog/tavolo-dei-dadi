import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const U='http://localhost:4173/tavolo-dei-dadi/';
const p=await b.newPage();
const sc={nome:'Flyora',classe:'Mago',livello:5, attacchi:[{id:1,nome:'Pugnale',bonus:5,danno:'1d4+2',tipoDanno:'Perforante',note:''}],
 armatura:{nome:'Corazza di cuoio',tipo:'leggera',base:11,scudo:false,bonus:0},
 caratteristiche:{forza:8,destrezza:14,costituzione:12,intelligenza:17,saggezza:10,carisma:10},
 incantatore:{caratteristica:'intelligenza'},
 slotIncantesimo:{1:{totale:4,spesi:0},2:{totale:3,spesi:0}},
 equipaggiamento:'Zaino, Torcia, Razioni (1 giorno)',
 incantesimiLista:[{id:'a',livello:0,nome:'Mano magica',tempo:'AZ',gittata:'9m',note:''},{id:'b',livello:1,nome:'Dardo incantato',tempo:'AZ',gittata:'36m',note:''}]};
await p.goto(U,{waitUntil:'networkidle'});
await p.evaluate((s)=>localStorage.setItem('scheda-interattiva:v1',JSON.stringify({attivo:'pg1',personaggi:{pg1:s}})),sc);
await p.reload({waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
await p.waitForTimeout(400);
const body=await p.innerText('body');
const kg=[...body.matchAll(/[\d.]+\s*\/\s*\d+\s*kg/g)].map(x=>x[0]);
// Zaino2.5+Torcia0.5+Razioni1=4 inv + Pugnale0.5 arma + cuoio4.5 arm = 9.5
console.log('1) Ingombro (armi+armatura+inv):', kg[0]);
console.log('2) Sezione Magia:', /magia/i.test(body)?'OK':'X');
const h3=await p.$$eval('h3',e=>e.map(x=>x.textContent.trim()).filter(t=>/trucchetti|incantesimi/i.test(t)));
console.log('3) Banner Trucchetti/Incantesimi:', JSON.stringify(h3));
console.log('4) Toolbar aggiungi unica:', (await p.$$('select.add-spell')).length===1?'OK (1)':'X');
console.log('5) Dropdown inventario "Scegli dal menu":', body.includes('Scegli dal menu')?'OK':'X');
console.log('6) Concentrazione:', /concentrazione/i.test(body)?'OK':'X');
// d100 mobile
await p.setViewportSize({width:390,height:800}); await p.waitForTimeout(300);
const w=await p.$$eval('.dado-btn',els=>{const d=els.find(e=>e.textContent.trim()==='d100');return d?d.getBoundingClientRect().width:null;});
console.log('7) d100 mobile width:', w?.toFixed(0)+'px', w<140?'OK':'X');
await b.close();
