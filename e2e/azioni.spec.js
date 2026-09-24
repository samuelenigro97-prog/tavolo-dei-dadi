// Sezione Azioni: badge di turno sempre visibili, resto dietro "Altre opzioni".
import { test, expect } from '@playwright/test';
import { apriScheda } from './helpers.js';

test.describe('Sezione Azioni', () => {
  test.beforeEach(async ({ page }) => {
    await apriScheda(page);
  });

  test('Azione/Bonus/Reazione/Nuovo Turno sono sempre visibili', async ({ page }) => {
    // Stato di partenza (PG appena caricato): nessuna azione ancora usata, quindi tutti "🟢".
    await expect(page.getByRole('button', { name: '⚔️ Azione 🟢' })).toBeVisible();
    await expect(page.getByRole('button', { name: '⚡ Azione Bonus 🟢' })).toBeVisible();
    await expect(page.getByRole('button', { name: '🛡️ Reazione 🟢' })).toBeVisible();
    await expect(page.getByRole('button', { name: /🔄 Nuovo Turno/ })).toBeVisible();
  });

  test('Interazione Oggetto, Tattiche e Copertura sono dietro "Altre opzioni" (chiuso di default)', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Interazione Oggetto/ })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /^🛡️ Schiva$/ })).not.toBeVisible();

    await page.getByText(/Altre opzioni/).click();

    await expect(page.getByRole('button', { name: /Interazione Oggetto/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^🛡️ Schiva$/ })).toBeVisible();
    await expect(page.getByText(/Copertura:/)).toBeVisible();
  });

  test('il pallino dell\'Azione passa da verde a rosso al click', async ({ page }) => {
    const azione = page.getByRole('button', { name: /^⚔️ Azione/ });
    await expect(azione).toContainText('🟢');
    await azione.click();
    await expect(azione).toContainText('🔴');
  });
});
