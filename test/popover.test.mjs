import { test } from 'node:test';
import assert from 'node:assert/strict';
import { posizionePopover, stilePopover } from '../src/utils/popover.js';

const telefono = { innerWidth: 390, innerHeight: 844 };

test('popover: si ancora al bordo destro del pulsante', () => {
  const p = posizionePopover({ right: 300, bottom: 200, top: 180 }, telefono);
  assert.equal(p.destra, 90, '390 - 300');
  assert.equal(p.top, 204);
});

test('popover: su schermo stretto resta dentro, mai a filo del bordo', () => {
  // pulsante attaccato al bordo destro: la nuvoletta mantiene un margine
  const p = posizionePopover({ right: 390, bottom: 100, top: 80 }, telefono);
  assert.equal(p.destra, 8, 'margine minimo, non 0');
  // pulsante oltre il bordo (può capitare durante uno scroll orizzontale)
  const q = posizionePopover({ right: 500, bottom: 100, top: 80 }, telefono);
  assert.equal(q.destra, 8, 'mai un valore negativo che spinga fuori schermo');
});

test('popover: se sotto non c\'è spazio si apre verso l\'alto', () => {
  const inFondo = posizionePopover({ right: 300, bottom: 800, top: 780 }, telefono);
  assert.equal(inFondo.top, undefined);
  assert.equal(inFondo.bottom, 844 - 780 + 4, 'ancorato sopra il pulsante');
  const inAlto = posizionePopover({ right: 300, bottom: 200, top: 180 }, telefono);
  assert.equal(inAlto.bottom, undefined);
  assert.ok(inAlto.top > 0);
});

test('popover: gli stili non superano mai la larghezza dello schermo', () => {
  const s = stilePopover(posizionePopover({ right: 300, bottom: 200, top: 180 }, telefono));
  assert.equal(s.maxWidth, 'calc(100vw - 16px)');
  assert.equal(s.right, 90);
  assert.equal(s.top, 204);
  assert.equal(s.bottom, undefined, 'ancorato in alto: nessun bottom in conflitto');
  const sotto = stilePopover(posizionePopover({ right: 300, bottom: 800, top: 780 }, telefono));
  assert.equal(sotto.top, undefined, 'ancorato in basso: nessun top in conflitto');
  assert.ok(sotto.bottom > 0);
});
