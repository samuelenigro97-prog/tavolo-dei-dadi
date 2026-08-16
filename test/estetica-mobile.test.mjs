import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const app = readFileSync(join(process.cwd(), 'src/App.jsx'), 'utf8');
const css = readFileSync(join(process.cwd(), 'src/ui/stili.js'), 'utf8');

test('estetica: la versione è parte del titolo e non è posizionata assolutamente', () => {
  assert.match(app, /className="app-version"/);
  assert.match(css, /\.app-version\s*\{/);
  const regola = css.match(/\.app-version\s*\{([^}]*)\}/)?.[1] || '';
  assert.doesNotMatch(regola, /position:\s*absolute/);
});

test('inventario mobile: usa schede responsive senza scorrimento orizzontale', () => {
  assert.match(app, /className="inventario-table"/);
  assert.match(app, /className="inventario-riga"/);
  assert.match(css, /\.inventario-wrap\s*\{\s*overflow-x:\s*visible/);
  assert.match(css, /\.inventario-table \.inventario-riga\s*\{[\s\S]*?display:\s*grid/);
});

test('magia mobile: la caratteristica da incantatore non invade il titolo', () => {
  assert.match(app, /className="sezione-magia"/);
  assert.match(app, /className="magia-caratteristica"/);
  assert.match(css, /\.sezione-magia > \.sezione-titolo\s*\{[\s\S]*?grid-template-rows:\s*auto auto/);
  assert.match(css, /\.sezione-magia \.sezione-titolo-azioni\s*\{[\s\S]*?grid-column:\s*1 \/ -1/);
});
