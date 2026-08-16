import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const pagina = readFileSync(join(process.cwd(), 'public/ripristino.html'), 'utf8');

test('ripristino PWA: elimina worker e cache ma non i dati dei personaggi', () => {
  assert.match(pagina, /registrazione\.unregister\(\)/);
  assert.match(pagina, /caches\.delete\(nome\)/);
  assert.doesNotMatch(pagina, /localStorage\.clear|indexedDB\.deleteDatabase/);
});

test('ripristino PWA: prosegue anche se Safari lascia una pulizia pendente', () => {
  assert.match(pagina, /Promise\.race/);
  assert.match(pagina, /setTimeout\(resolve, 5000\)/);
  assert.match(pagina, /location\.replace/);
});
