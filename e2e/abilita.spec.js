// Abilità: niente più tasto ℹ️ separato, il click sul nome apre la guida.
import { test, expect } from '@playwright/test';
import { apriScheda } from './helpers.js';

test.describe('Abilità', () => {
  test.beforeEach(async ({ page }) => {
    await apriScheda(page);
  });

  test('non esiste più il bottone ℹ️ accanto alle abilità', async ({ page }) => {
    const infoBtns = page.getByRole('button', { name: 'ℹ️' });
    await expect(infoBtns).toHaveCount(0);
  });

  test('cliccare sul nome di un\'abilità apre la guida (CD di riferimento)', async ({ page }) => {
    await page.locator('.skill-nome', { hasText: 'Percezione' }).click();
    await expect(page.getByText('Classi di Difficoltà Ufficiali (CD)')).toBeVisible();
  });
});
