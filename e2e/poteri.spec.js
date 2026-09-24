// Sezione Poteri (dentro Privilegi, Tratti & Talenti): chiarimento "regole
// homebrew" nel titolo, bersaglio libero per i modificatori.
import { test, expect } from '@playwright/test';
import { apriScheda } from './helpers.js';

test.describe('Poteri', () => {
  test.beforeEach(async ({ page }) => {
    await apriScheda(page);
  });

  test('il titolo della sezione specifica "regole homebrew"', async ({ page }) => {
    await expect(page.getByText('✨ Poteri', { exact: false })).toBeVisible();
    await expect(page.getByText('(regole homebrew)')).toBeVisible();
  });

  test('l\'etichetta del bersaglio di un modificatore è visibile senza passare il mouse', async ({ page }) => {
    // Il PG di esempio ha un potere "Potere del Patrono" con un modificatore su Velocità.
    await expect(page.getByText(/Velocità \+\d+m/)).toBeVisible();
  });

  test('si può aggiungere un modificatore con bersaglio libero personalizzato', async ({ page }) => {
    await page.getByText('Potere del Patrono').click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /Aggiungi modificatore/ }).click();
    await page.waitForTimeout(150);

    const selectBersaglio = dialog.locator('select').last();
    await selectBersaglio.selectOption({ label: 'Altro (personalizzato)…' });

    const campoLibero = dialog.getByPlaceholder(/Su cosa agisce/);
    await expect(campoLibero).toBeVisible();
    await campoLibero.fill('Vantaggio ai TS Carisma');

    // Chiudi il modal e verifica che il chip mostri l'etichetta scritta a mano.
    await dialog.getByRole('button', { name: '✕' }).click();
    await expect(page.getByText(/Vantaggio ai TS Carisma/)).toBeVisible();
  });
});
