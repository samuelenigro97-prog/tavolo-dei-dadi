// Sezione Incantesimi: slot leggibili accanto al livello, "Preparati" sceso
// nell'intestazione del 1° Livello, niente più bottone "Scegli in Level Up".
import { test, expect } from '@playwright/test';
import { apriScheda } from './helpers.js';

test.describe('Incantesimi', () => {
  test.beforeEach(async ({ page }) => {
    await apriScheda(page);
  });

  test('il 1° Livello mostra la frazione degli slot accanto al titolo', async ({ page }) => {
    // Il testo è "1° Livello" nel DOM (l'aspetto MAIUSCOLO è solo CSS text-transform).
    // .last() perché locator('div').filter({hasText}) include anche tutti gli antenati
    // (in document order arrivano prima): l'ultimo è il div più specifico, la riga stessa.
    const riga1liv = page.locator('div').filter({ hasText: /1° Livello/ }).last();
    await expect(riga1liv).toBeVisible();
    await expect(riga1liv.getByText(/^\d+\/\d+$/)).toBeVisible();
  });

  test('"Preparati" compare nell\'intestazione del 1° Livello, non più in quella di Incantesimi', async ({ page }) => {
    const titoloIncantesimi = page.locator('h3', { hasText: 'Incantesimi' });
    await expect(titoloIncantesimi).toBeVisible();
    await expect(page.getByText(/Preparati:/)).toBeVisible();
    // Il div più specifico che contiene SIA il titolo del livello SIA "Preparati" è
    // la riga di intestazione stessa (il cluster sinistro interno non contiene "Preparati").
    const rigaLivello1 = page.locator('div').filter({ hasText: /1° Livello/ }).filter({ hasText: /Preparati/ }).last();
    await expect(rigaLivello1.getByText(/Preparati:/)).toBeVisible();
  });

  test('non esiste più il bottone "Scegli in Level Up" sotto i Trucchetti', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Scegli in Level Up/ })).toHaveCount(0);
  });

  test('cliccando il bottone Metamorfosi sulla riga dell\'incantesimo si apre il catalogo', async ({ page }) => {
    const bottone = page.getByRole('button', { name: /^🔮 Metamorfosi$/ });
    if (await bottone.count() === 0) test.skip(true, 'Il PG di esempio non ha Metamorfosi in lista');
    await bottone.first().click();
    await expect(page.getByText(/Grado di Sfida Max/)).toBeVisible();
  });
});
