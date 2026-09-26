// Protezione dai conflitti di sincronizzazione (v4.40.0), con il Gist di
// GitHub simulato. Scenario del 26/09/2026: un dispositivo con dati vecchi e
// modifiche locali si apre quando online c'è già una versione più recente.
// Prima veniva rimandato online il roster vecchio; ora l'app si ferma e chiede.
import { test, expect } from '@playwright/test';

const GIST_ID = 'gistfinto123';
const FILE = 'roster_tavolo_dei_dadi.json';

const rosterLocale = {
  attivo: 'pg-a',
  personaggi: {
    'pg-a': { nome: 'Vaelion', classe: 'Druido', livello: 5 },
    'pg-b': { nome: 'Frost', classe: 'Mago', livello: 3 },
  },
};
const rosterOnline = {
  attivo: 'pg-a',
  personaggi: {
    'pg-a': { nome: 'Vaelion', classe: 'Druido', livello: 6 },
    'pg-c': { nome: 'Wendell', classe: 'Ranger', livello: 5 },
  },
  _updatedAt: Date.parse('2026-09-26T15:49:00+02:00'),
};

async function preparaDispositivoVecchio(page) {
  const stato = { patch: [], rev: 'rev-1549', contenuto: JSON.stringify(rosterOnline) };
  await page.route('https://api.github.com/**', async (route) => {
    const req = route.request();
    if (req.method() === 'PATCH') {
      stato.patch.push(JSON.parse(req.postData() || '{}'));
      stato.contenuto = stato.patch.at(-1).files[FILE].content;
      stato.rev = `rev-${stato.patch.length}-nuova`;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: GIST_ID, files: { [FILE]: { content: stato.contenuto, truncated: false } }, history: [{ version: stato.rev }] }),
    });
  });
  await page.addInitScript(({ gist, locale }) => {
    if (sessionStorage.getItem('preparato')) return;
    sessionStorage.setItem('preparato', '1');
    localStorage.setItem('scheda-interattiva:guida-vista', '1');
    localStorage.setItem('scheda-interattiva:v1', JSON.stringify(locale));
    localStorage.setItem('scheda-interattiva:github-token', 'token-finto');
    localStorage.setItem('scheda-interattiva:gist-id', gist);
    localStorage.setItem('scheda-interattiva:auto-sync', 'on');
    // Ultima sincronizzazione di questo dispositivo: la mattina (rev vecchia),
    // e da allora qui ci sono modifiche (impronta diversa).
    localStorage.setItem('scheda-interattiva:sync-base', JSON.stringify({ rev: 'rev-mattina', ts: Date.parse('2026-09-26T10:00:00+02:00'), hash: 'impronta-vecchia' }));
  }, { gist: GIST_ID, locale: rosterLocale });
  return stato;
}

test('dispositivo con dati vecchi: all’avvio non sovrascrive, mostra il conflitto e carica la versione online', async ({ page }) => {
  const stato = await preparaDispositivoVecchio(page);
  await page.goto('/');
  const dialogo = page.getByTestId('conflitto-sync');
  await expect(dialogo).toBeVisible({ timeout: 10000 });
  await expect(dialogo).toContainText('Versione online più recente');
  await expect(dialogo).toContainText('Solo su questo dispositivo: Frost');
  await expect(dialogo).toContainText('Solo online: Wendell');
  await expect(dialogo).toContainText('Con modifiche diverse: Vaelion');
  // Anche dopo il debounce dell'auto-salvataggio non parte nessuna scrittura.
  await page.waitForTimeout(3500);
  expect(stato.patch).toHaveLength(0);

  await dialogo.getByRole('button', { name: 'Carica la versione online' }).click();
  await expect(dialogo).toBeHidden();
  const salvato = await page.evaluate(() => JSON.parse(localStorage.getItem('scheda-interattiva:v1')));
  expect(Object.values(salvato.personaggi).map((p) => p.nome).sort()).toEqual(['Vaelion', 'Wendell']);
  // La versione locale resta in Cronologia versioni.
  const snap = await page.evaluate(() => JSON.parse(localStorage.getItem('scheda-interattiva:snapshots') || '[]'));
  expect(snap.some((s) => Object.values(s.roster.personaggi).some((p) => p.nome === 'Frost'))).toBe(true);
  // Da qui in poi eventuali salvataggi partono dalla versione online: la
  // versione vecchia (con Frost, senza Wendell) non torna mai online.
  await page.waitForTimeout(3500);
  for (const p of stato.patch) {
    const nomi = Object.values(JSON.parse(p.files[FILE].content).personaggi).map((x) => x.nome).sort();
    expect(nomi).toEqual(['Vaelion', 'Wendell']);
  }
});

test('conflitto: "Mantieni la mia versione" chiede conferma e solo dopo sovrascrive online', async ({ page }) => {
  const stato = await preparaDispositivoVecchio(page);
  await page.goto('/');
  const dialogo = page.getByTestId('conflitto-sync');
  await expect(dialogo).toBeVisible({ timeout: 10000 });
  await dialogo.getByRole('button', { name: 'Mantieni la mia versione…' }).click();
  await expect(dialogo.getByRole('alert')).toContainText('La versione online verrà sostituita');
  expect(stato.patch).toHaveLength(0);
  await dialogo.getByRole('button', { name: 'Sovrascrivi la versione online' }).click();
  await expect(dialogo).toBeHidden();
  await expect.poll(() => stato.patch.length, { timeout: 8000 }).toBe(1);
  const inviato = JSON.parse(stato.patch[0].files[FILE].content);
  expect(Object.values(inviato.personaggi).map((p) => p.nome).sort()).toEqual(['Frost', 'Vaelion']);
});

test('conflitto: "Decidi più tardi" lascia la sincronizzazione in pausa (nessuna scrittura, neanche al ritorno della connessione)', async ({ page }) => {
  const stato = await preparaDispositivoVecchio(page);
  await page.goto('/');
  const dialogo = page.getByTestId('conflitto-sync');
  await expect(dialogo).toBeVisible({ timeout: 10000 });
  await dialogo.getByRole('button', { name: 'Decidi più tardi' }).click();
  await expect(dialogo).toBeHidden();
  // Il pannello Backup e sincronizzazione segnala la pausa e permette di riaprire la scelta.
  await page.waitForTimeout(3500);
  expect(stato.patch).toHaveLength(0);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await page.waitForTimeout(3500);
  expect(stato.patch).toHaveLength(0);
});

test('codice di sincronizzazione: stesso controllo, nessun PUT finché l’utente non sceglie', async ({ page }) => {
  const put = [];
  await page.route('**/sync/23456ABCDE', async (route) => {
    const req = route.request();
    if (req.method() === 'PUT') {
      put.push(JSON.parse(req.postData() || '{}'));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, updatedAt: put.at(-1).updatedAt }) });
      return;
    }
    const { _updatedAt, ...roster } = rosterOnline;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ roster, updatedAt: _updatedAt }) });
  });
  await page.addInitScript(({ locale }) => {
    if (sessionStorage.getItem('preparato')) return;
    sessionStorage.setItem('preparato', '1');
    localStorage.setItem('scheda-interattiva:guida-vista', '1');
    localStorage.setItem('scheda-interattiva:v1', JSON.stringify(locale));
    localStorage.setItem('scheda-interattiva:codice-sync', '23456ABCDE');
    localStorage.setItem('scheda-interattiva:auto-sync-codice', 'on');
    // Come lascia i dati la v4.39: solo il timestamp dell'ultima sincronizzazione.
    localStorage.setItem('scheda-interattiva:sync-codice-ts', String(Date.parse('2026-09-26T10:00:00+02:00')));
  }, { locale: rosterLocale });
  await page.goto('/');
  const dialogo = page.getByTestId('conflitto-sync');
  await expect(dialogo).toBeVisible({ timeout: 10000 });
  await expect(dialogo).toContainText('Codice di sincronizzazione');
  await page.waitForTimeout(3500);
  expect(put).toHaveLength(0);
  await dialogo.getByRole('button', { name: 'Mantieni la mia versione…' }).click();
  await dialogo.getByRole('button', { name: 'Sovrascrivi la versione online' }).click();
  await expect.poll(() => put.length, { timeout: 8000 }).toBe(1);
  // Il client dichiara la versione da cui parte: il Worker può rifiutare se cambia ancora.
  expect(put[0].baseUpdatedAt).toBe(rosterOnline._updatedAt);
});
