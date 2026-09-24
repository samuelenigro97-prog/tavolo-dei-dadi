// Helper condivisi dai test e2e: aprire la scheda partendo da zero (localStorage
// pulito, quindi carica il PG di esempio "Vaelion") e chiudere i modal iniziali
// (Benvenuto + Menu) che altrimenti coprono tutto il resto della pagina.
export async function apriScheda(page) {
  await page.goto('/');
  await page.waitForTimeout(600);
  const benvenuto = page.getByText('Ho capito, cominciamo');
  if (await benvenuto.count()) {
    await benvenuto.click();
    await page.waitForTimeout(200);
  }
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
  }
  // Click fuori da eventuali modal residui (il Menu Iniziale non si chiude
  // sempre con Escape se il focus è finito altrove).
  await page.mouse.click(20, 300);
  await page.waitForTimeout(200);
}

/** Scrolla l'elemento che contiene `testo` (case-insensitive) fino al centro dello schermo. */
export async function scrollaA(page, selettore, testo) {
  await page.evaluate(({ selettore, testo }) => {
    const re = new RegExp(testo, 'i');
    const el = Array.from(document.querySelectorAll(selettore)).find((e) => re.test(e.textContent));
    el?.scrollIntoView({ block: 'center' });
  }, { selettore, testo });
  await page.waitForTimeout(150);
}
