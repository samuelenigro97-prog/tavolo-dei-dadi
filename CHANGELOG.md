# Changelog

Formato ispirato a [Keep a Changelog](https://keepachangelog.com/it/1.1.0/).

## [Unreleased]

### Aggiunto
- Licenza MIT (`LICENSE.md`).
- Template GitHub per bug report, feature request e pull request.
- Note di sviluppo spostate in `docs/`.
- Runbook release manuale in `docs/RELEASE.md`.

### Modificato
- Il menu "Ambientazione" diventa "Luogo", non mostra più il preset tecnico "Classica" e attenua il bagliore del tema giorno.
- Rimossa dalla repository la cartella `scratchpad/` già ignorata da `.gitignore`.

### Da automatizzare quando il permesso `workflow` sarà attivo
- Workflow `test.yml` separato da deploy.
- Generazione changelog da commit/PR.
- Release GitHub con artifact build PWA (`dist`).
