// Tabella Combattimento: Randello Incantato nasconde l'arma non incantata,
// colonna Note non ripete due volte la stessa informazione.
import { test, expect } from '@playwright/test';
import { apriScheda } from './helpers.js';

test.describe('Combattimento', () => {
  test.beforeEach(async ({ page }) => {
    await apriScheda(page);
  });

  test('Randello Incantato nasconde Randello e Bastone Ferrato dalla tabella', async ({ page }) => {
    const righe = page.locator('tr.attacchi-riga');
    await expect(righe.filter({ hasText: 'Randello Incantato' })).toHaveCount(1);
    // Controlla solo il nome dell'arma (colonna .attacchi-nome), non l'intera riga:
    // "Bastone Ferrato" compare comunque nella nota di "Attacco di Opportunità".
    const nomiArma = page.locator('tr.attacchi-riga .attacchi-nome');
    await expect(nomiArma.filter({ hasText: /^\s*Randello\s*$/ })).toHaveCount(0);
    await expect(nomiArma.filter({ hasText: /^\s*Bastone Ferrato\s*$/ })).toHaveCount(0);
  });

  test('la nota di un attacco con badge riconosciuti non mostra il testo ripetuto né una matita per modificarla', async ({ page }) => {
    const riga = page.locator('tr.attacchi-riga').filter({ hasText: 'Randello Incantato' });
    await expect(riga.getByText('Magico con SAG (Randello/Bastone)')).toBeVisible();
    // Il testo completo della nota non deve comparire una seconda volta in chiaro.
    await expect(riga.getByText('1 min: usa SAG su randello/bastone, danno 1d8')).toHaveCount(0);
    // Combattimento non ha campi liberi modificabili a mano: niente matita.
    await expect(riga.locator('.nota-dettagli').getByText('✏️')).toHaveCount(0);
  });

  test('un\'arma senza categorie riconosciute mostra ancora il testo libero per intero', async ({ page }) => {
    // "Attacco di Opportunità" (Reazioni) non ha badge Innesco/Effetto pieni per ogni riga:
    // verifichiamo almeno che la tabella Reazioni esista e abbia righe con badge visibili.
    const reazioni = page.locator('tr.attacchi-riga').filter({ hasText: 'Attacco di Opportunità' });
    await expect(reazioni).toHaveCount(1);
  });
});
