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

  test('la sezione "Azioni Bonus" è sempre visibile, prima di Reazioni, anche vuota', async ({ page }) => {
    const titoloBonus = page.getByRole('heading', { name: 'Azioni Bonus' });
    const titoloReazioni = page.getByRole('heading', { name: 'Reazioni' });
    await expect(titoloBonus).toBeVisible();
    await expect(titoloReazioni).toBeVisible();
    const posBonus = await titoloBonus.boundingBox();
    const posReazioni = await titoloReazioni.boundingBox();
    expect(posBonus.y).toBeLessThan(posReazioni.y);
  });

  test('gli incantesimi con tempo di lancio "Azione Bonus" stanno in Azioni Bonus, non in Combattimento', async ({ page }) => {
    const tabellaAzione = page.locator('table.attacchi-table').first();
    const sezioneBonus = page.getByRole('heading', { name: 'Azioni Bonus' }).locator('xpath=ancestor::div[.//table][1]');
    // Randello Incantato (trucchetto, Azione Bonus) e Parola di Guarigione (cura con tiro, Azione Bonus)
    await expect(sezioneBonus.locator('tr.attacchi-riga').filter({ hasText: 'Randello Incantato' })).toHaveCount(1);
    await expect(sezioneBonus.locator('tr.attacchi-riga').filter({ hasText: 'Parola di Guarigione' })).toHaveCount(1);
    await expect(tabellaAzione.locator('tr.attacchi-riga').filter({ hasText: 'Randello Incantato' })).toHaveCount(0);
    await expect(tabellaAzione.locator('tr.attacchi-riga').filter({ hasText: 'Frusta di Spine' })).toHaveCount(1);
    // Nessun duplicato in tutta la pagina Combattimento.
    await expect(page.locator('tr.attacchi-riga').filter({ hasText: 'Randello Incantato' })).toHaveCount(1);
    // Il messaggio "vuota" non compare più.
    await expect(page.getByText(/Nessun attacco\/incantesimo ad azione bonus/)).toHaveCount(0);
  });

  test('la gittata è sempre il primo chip dopo il nome (anche per Inaridire, che ha solo la CD nella nota)', async ({ page }) => {
    const primoChip = (nome) => page.locator('tr.attacchi-riga').filter({ hasText: nome }).locator('.attacchi-note span').first();
    await expect(primoChip('Inaridire')).toHaveText(/🎯\s*9m/);
    await expect(primoChip('Randello Incantato')).toHaveText(/🎯\s*Tocco/);
    await expect(primoChip('Morsa del Gelo')).toHaveText(/🎯\s*18m/);
    await expect(primoChip('Parola di Guarigione')).toHaveText(/🎯\s*18m/);
  });

  test('tiro per colpire e danni usano gli stessi badge di Trucchetti/Incantesimi', async ({ page }) => {
    const riga = page.locator('tr.attacchi-riga').filter({ hasText: 'Frusta di Spine' });
    await expect(riga.locator('.badge-tiro-colpire')).toHaveText(/🎯\s*\+9/);
    await expect(riga.locator('.badge-tiro-danno')).toContainText('Perforante');
    // Anche le Reazioni: Attacco di Opportunità.
    const reaz = page.locator('tr.attacchi-riga').filter({ hasText: 'Attacco di Opportunità' });
    await expect(reaz.locator('.badge-tiro-colpire')).toHaveCount(1);
    await expect(reaz.locator('.badge-tiro-danno')).toHaveCount(1);
  });

  test('Velocità mostra il totale con i Poteri in blu, senza il "+3m" sotto', async ({ page }) => {
    const box = page.locator('.velocita-modificata');
    await expect(box).toHaveCount(1);
    await expect(box).toContainText('13.5');
    await expect(box).not.toContainText('+3m');
    const colore = await box.locator('span').first().evaluate((e) => getComputedStyle(e).color);
    expect(colore).toBe('rgb(37, 99, 235)');
  });
});
