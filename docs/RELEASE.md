# Release manuale — Tavolo dei Dadi

In attesa di poter automatizzare via GitHub Actions, usa questa checklist.

## Artifact da pubblicare
- build PWA: contenuto di `dist/` compresso come `tavolo-dei-dadi-dist.zip`
- opzionale: screenshot mobile/desktop della versione

## Checklist
1. `npm ci`
2. `npm test`
3. `npm run build`
4. Se è una release visibile, verifica che `APP_VERSION` sia stato alzato.
5. Verifica l'app deployata: https://samuelenigro97-prog.github.io/tavolo-dei-dadi/
6. Crea tag semver, es. `v2.89.0`.
7. Crea la GitHub Release dal tag e carica `tavolo-dei-dadi-dist.zip`.
8. Nel corpo release copia la sezione corrispondente da `CHANGELOG.md`.

## Da automatizzare
Quando il token/integrazione avrà scope `workflow`, creare `.github/workflows/release.yml` con trigger su tag `v*`, test, build PWA, zip di `dist/` e pubblicazione release.
