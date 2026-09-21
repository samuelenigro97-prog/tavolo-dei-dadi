# Release — Tavolo dei Dadi

## Automazione CI/CD

Il workflow `.github/workflows/deploy.yml` automatizza test, build e deploy:
1. **Esecuzione test** — `npm test` (184 test su regole, persistenza, traduzioni, ecc.)
2. **Build** — `npm run build` compila la PWA su `dist/`
3. **Smoke test** — Playwright avvia `vite preview` e carica l'app in un browser reale; se la pagina lancia errori JS, il deploy blocca
4. **Deploy** — GitHub Pages pubblica il contenuto di `dist/`

Ogni push su `main` avvia il workflow; controllare i check su GitHub per stato e log.

## Verifica locale prima di pushare

Prima di fare commit e push su `main`:

1. `npm ci` — installa dipendenze esatte
2. `npm test` — verifica che i 184 test passino
3. `npm run build` — compila PWA
4. `node test/smoke.mjs` — carica l'app in browser reale e verifica che non lanci errori JS

Se tutto passa localmente, l'app è pronta per GitHub Pages.

## Incrementare la versione

Se la modifica è visibile (UI, regole, ambientazioni):
- Aggiorna `APP_VERSION` in `src/App.jsx`
- Aggiungi una riga a `CHANGELOG.md`

Per modifiche non visibili (refactor, fix interni), la versione resta uguale.

## Release manuale su GitHub (opzionale)

Se vuoi creare una release pubblica:
1. Crea un tag semver: `git tag v4.0.81 && git push origin v4.0.81`
2. Su GitHub, crea una Release dal tag
3. Nel corpo release, copia la sezione di `CHANGELOG.md`
4. Allega `.zip` di `dist/` se desideri (opzionale)
