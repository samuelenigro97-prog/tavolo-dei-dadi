// Sezione Equipaggiamento: filtri in una riga, le due "Tutti" (vista/tipo)
// hanno icone diverse per non sembrare duplicate.
import { test, expect } from '@playwright/test';
import { apriScheda, scrollaA } from './helpers.js';

test.describe('Equipaggiamento', () => {
  test.beforeEach(async ({ page }) => {
    await apriScheda(page);
    await scrollaA(page, 'h3', 'Equipaggiamento');
  });

  test('la vista (Indossati/Zaino) e il tipo (Armi/Pozioni...) hanno bottoni "Tutti" con icone diverse', async ({ page }) => {
    await expect(page.getByRole('button', { name: '📍 Tutti' })).toBeVisible();
    await expect(page.getByRole('button', { name: /🗂️ Tutti i tipi/ })).toBeVisible();
  });

  test('tutti i filtri e la ricerca stanno sulla stessa riga', async ({ page }) => {
    const ricerca = page.getByPlaceholder(/Cerca nell'inventario/);
    const tutti = page.getByRole('button', { name: '📍 Tutti' });
    const [rRicerca, rTutti] = await Promise.all([ricerca.boundingBox(), tutti.boundingBox()]);
    expect(rRicerca).not.toBeNull();
    expect(rTutti).not.toBeNull();
    // Su schermo desktop devono stare alla stessa altezza (± piccola tolleranza).
    expect(Math.abs(rRicerca.y - rTutti.y)).toBeLessThan(10);
  });

  test('un oggetto senza contenitore/effetto/utilizzi attivi mostra solo "⋯" e cestino, non 4 icone', async ({ page }) => {
    const riga = page.locator('tr.inventario-riga').filter({ hasText: 'Antitossina' });
    await expect(riga.getByRole('button', { name: '⋯' })).toBeVisible();
    await expect(riga.getByText('🎒')).toHaveCount(0);
    await expect(riga.getByText('✨')).toHaveCount(0);

    await riga.getByRole('button', { name: '⋯' }).click();
    await expect(riga.getByText('🎒')).toBeVisible();
    await expect(riga.getByText('✨')).toBeVisible();
    await expect(riga.getByText('⚡')).toBeVisible();
  });

  test('un oggetto con un effetto già attivo mostra sempre le 4 icone', async ({ page }) => {
    const riga = page.locator('tr.inventario-riga').filter({ hasText: 'Perla del Potere' });
    await expect(riga.getByRole('button', { name: '⋯' })).toHaveCount(0);
    await expect(riga.getByText('🎒')).toBeVisible();
    await expect(riga.getByText('✨')).toBeVisible();
    await expect(riga.getByText('⚡')).toBeVisible();
  });
});
