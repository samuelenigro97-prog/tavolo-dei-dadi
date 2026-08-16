import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const app = readFileSync(join(process.cwd(), 'src/App.jsx'), 'utf8');

test('aggiornamento PWA: non combina il reload del worker con location.replace', () => {
  assert.match(app, /await updateServiceWorker\(true\)/);
  assert.doesNotMatch(app, /window\.location\.replace\(/);
});

test('aggiornamento PWA: una nuova versione non forza un reload da un effect', () => {
  assert.doesNotMatch(
    app,
    /useEffect\(\(\) => \{[\s\S]{0,800}if \(nuovaVersione[\s\S]{0,800}forzaAggiornamento\(\)/,
  );
});
