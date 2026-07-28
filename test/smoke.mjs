// Smoke test anti-crash: costruisce l'app, la serve e la carica in un browser
// reale. Se la pagina lancia un errore JS (schermata bianca), il processo esce
// con codice != 0 e in CI blocca il deploy. Nessun assert sulle regole qui:
// serve solo a garantire che l'app parta senza esplodere.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RADICE = join(dirname(fileURLToPath(import.meta.url)), '..');

// Playwright: dal progetto (CI, devDependency) o dall'installazione globale (dev container).
async function getChromium() {
  try { return (await import('playwright')).chromium; } catch {}
  try { return (await import('/opt/node22/lib/node_modules/playwright/index.mjs')).chromium; } catch {}
  throw new Error('Playwright non disponibile: `npm i -D playwright` e `npx playwright install chromium`.');
}

// Avvia `vite preview` (bin locale, niente wrapper npx) e ricava l'URL dallo stdout.
function avviaPreview() {
  return new Promise((resolve, reject) => {
    const bin = join(RADICE, 'node_modules', 'vite', 'bin', 'vite.js');
    const proc = spawn(process.execPath, [bin, 'preview', '--port', '4173', '--strictPort'], {
      cwd: RADICE, env: process.env, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    const timer = setTimeout(() => { proc.kill('SIGKILL'); reject(new Error('preview non partito entro 30s')); }, 30000);
    const onData = (buf) => {
      const m = buf.toString().match(/https?:\/\/localhost:\d+\/\S*/);
      if (m) { clearTimeout(timer); resolve({ proc, url: m[0].replace(/\/+$/, '') + '/' }); }
    };
    proc.stdout.on('data', onData);
    proc.stderr.on('data', (b) => { stderr += b.toString(); onData(b); });
    proc.on('error', (e) => { clearTimeout(timer); reject(e); });
    proc.on('exit', (code) => { clearTimeout(timer); reject(new Error(`preview uscito (code ${code}). stderr: ${stderr.trim() || '(vuoto)'}`)); });
  });
}

const roster = {
  attivo: 'pg1',
  personaggi: {
    pg1: {
      nome: 'Flyora', classe: 'Stregone', livello: 4, versione: '2024',
      caratteristiche: { forza: 8, destrezza: 14, costituzione: 13, intelligenza: 10, saggezza: 12, carisma: 17 },
      incantatore: { caratteristica: 'carisma' }, incantesimiLista: [], slotIncantesimo: {}, bonusCompetenza: 2,
    },
    pg2: {
      nome: 'Thordak', classe: 'Guerriero', livello: 3, versione: '2024',
      caratteristiche: { forza: 16, destrezza: 12, costituzione: 14, intelligenza: 10, saggezza: 11, carisma: 9 },
      incantatore: { caratteristica: '' }, incantesimiLista: [], slotIncantesimo: {}, bonusCompetenza: 2,
    },
  },
};

let proc, browser;
const errori = [];
try {
  const chromium = await getChromium();
  const preview = await avviaPreview();
  proc = preview.proc;

  browser = await chromium.launch({ executablePath: process.env.SMOKE_CHROMIUM || undefined });
  const page = await browser.newPage();
  page.on('pageerror', (e) => errori.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errori.push('console: ' + m.text()); });

  // Precarica due personaggi cosi' l'app renderizza la scheda completa (piu' superficie = piu' crash possibili).
  await page.addInitScript((r) => localStorage.setItem('scheda-interattiva:v1', JSON.stringify(r)), roster);
  await page.goto(preview.url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // L'app e' viva se ha reso qualcosa oltre al div vuoto.
  const testo = await page.evaluate(() => document.body.innerText || '');
  if (testo.trim().length < 20) errori.push('render vuoto: la pagina non ha prodotto contenuto');
  if (!testo.includes('Flyora')) errori.push('render incompleto: personaggio attivo non mostrato');

  await browser.close(); browser = null;
  proc.kill(); proc = null;

  if (errori.length) {
    console.error('SMOKE FALLITO — ' + errori.length + ' problema/i:');
    errori.forEach((e) => console.error('  - ' + e));
    process.exit(1);
  }
  console.log('SMOKE OK: app caricata senza errori, scheda personaggio renderizzata.');
  process.exit(0);
} catch (e) {
  console.error('SMOKE FALLITO (eccezione):', e.message);
  if (browser) await browser.close().catch(() => {});
  if (proc) proc.kill();
  process.exit(1);
}
