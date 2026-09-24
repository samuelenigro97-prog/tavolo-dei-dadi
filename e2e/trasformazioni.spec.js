// Trasformazioni integrate: niente bottoni dedicati in Azioni, si aprono da
// dove si "spendono" davvero (risorsa in Risorse di Classe, riga incantesimo).
import { test, expect } from '@playwright/test';
import { apriScheda } from './helpers.js';

test.describe('Trasformazioni integrate', () => {
  test.beforeEach(async ({ page }) => {
    await apriScheda(page);
  });

  test('non esistono più i bottoni standalone "Forma Selvatica"/"Metamorfosi" disponibili', async ({ page }) => {
    await expect(page.getByText(/disponibili$/).filter({ hasText: 'Forma Selvatica' })).toHaveCount(0);
    await expect(page.getByText(/disponibili$/).filter({ hasText: 'Metamorfosi' })).toHaveCount(0);
  });

  test('cliccando "Forma Selvatica" in Risorse di Classe si apre il catalogo Bestie', async ({ page }) => {
    await page.getByRole('button', { name: 'Forma Selvatica', exact: true }).click();
    await expect(page.getByText(/Grado di Sfida Max/)).toBeVisible();
    await expect(page.getByText(/bestie utilizzabili/)).toBeVisible();
  });
});
