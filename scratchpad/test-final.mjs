import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const U = 'http://localhost:4173/tavolo-dei-dadi/';

// T1: migrazione + ingombro (Flyora, forza 8 → cap 60)
const p1 = await b.newPage();
const flyora = { nome:'Flyora', classe:'Mago', livello:5, attacchi:[],
  armatura:{nome:'',tipo:'nessuna',base:11,scudo:false,bonus:0},
  caratteristiche:{forza:8,destrezza:14,costituzione:12,intelligenza:17,saggezza:10,carisma:10},
  incantatore:{caratteristica:'intelligenza'},
  equipaggiamento:'Libro degli incantesimi, Pugnale, Focus arcano, Zaino, Pozione di guarigione' };
await p1.goto(U,{waitUntil:'networkidle'});
await p1.evaluate((s)=>localStorage.setItem('scheda-interattiva:v1',JSON.stringify({attivo:'pg1',personaggi:{pg1:s}})),flyora);
await p1.reload({waitUntil:'networkidle'});
await p1.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
await p1.waitForTimeout(300);
const body=await p1.innerText('body');
const kg=[...body.matchAll(/[\d.]+\s*\/\s*\d+\s*kg/g)].map(x=>x[0]);
console.log('T1 ingombro Flyora:', kg[0], '(atteso 6.3 / 60 kg)');
const h3=await p1.$$eval('h3',els=>els.map(e=>e.textContent.trim()));
console.log('T2 banner:', JSON.stringify(h3.filter(x=>/trucchetti|incantesimi/i.test(x))));
console.log('T2 titolo Magia:', /magia/i.test(body)?'OK':'MANCA');
console.log('T-inv dropdown:', body.includes('Scegli dal menu')?'OK':'MANCA');
await p1.close();

// T3: spell lock (leveled select index 2)
async function lvlLocked(nLeveled){
  const p=await b.newPage();
  const spells=Array.from({length:nLeveled},(_,i)=>({id:'s'+i,livello:1,nome:'Inc '+i,tempo:'AZ',gittata:'',note:''}));
  const sc={nome:'T',classe:'Mago',livello:5,maxIncantesimi:3,maxTrucchetti:2,
    caratteristiche:{forza:8,destrezza:14,costituzione:12,intelligenza:17,saggezza:10,carisma:10},
    incantatore:{caratteristica:'intelligenza'},
    slotIncantesimo:{1:{totale:4,spesi:0}},incantesimiLista:spells};
  await p.goto(U,{waitUntil:'networkidle'});
  await p.evaluate((s)=>localStorage.setItem('scheda-interattiva:v1',JSON.stringify({attivo:'pg1',personaggi:{pg1:s}})),sc);
  await p.reload({waitUntil:'networkidle'});
  await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
  await p.waitForTimeout(300);
  const info=await p.$$eval('select.add-spell',els=>{const e=els.find(x=>/Incantesimo Liv|Massimo incantesimi/i.test(x.options[0]?.text||''));return e?e.disabled:null;});
  await p.close();return info;
}
console.log('T3 lock @3/3 (atteso true):', await lvlLocked(3));
console.log('T3 unlock @2/3 (atteso false):', await lvlLocked(2));

// T4: d100 width mobile
const p4=await b.newPage();
await p4.setViewportSize({width:390,height:800});
await p4.goto(U,{waitUntil:'networkidle'}); await p4.waitForTimeout(300);
const w=await p4.$$eval('.dado-btn',els=>{const d=els.find(e=>e.textContent.trim()==='d100');return d?d.getBoundingClientRect().width:null;});
console.log('T4 d100 mobile width:', w?.toFixed(0)+'px', w<140?'OK':'TROPPO LARGO');
await b.close();
