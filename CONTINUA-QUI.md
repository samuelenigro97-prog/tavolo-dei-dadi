# Continua qui — lavoro rimasto su Tavolo dei Dadi

Stato al **v2.23.0** (tutto committato e pubblicato su GitHub Pages).
App: https://samuelenigro97-prog.github.io/tavolo-dei-dadi/

## Come si lavora su questo progetto

- `npm test` → **67 test** (regole 5e, scheda, i18n, traduzioni, condivisione). Devono restare verdi.
- `node test/smoke.mjs` → apre l'app in un browser vero e fallisce se va in schermata bianca.
  Serve `BASE_PATH=/tavolo-dei-dadi/` e, in locale, `SMOKE_CHROMIUM=/opt/pw-browsers/chromium`.
- La CI (`.github/workflows/deploy.yml`) esegue test + smoke **prima** di build e deploy:
  se falliscono, l'app non viene pubblicata.
- Ogni modifica visibile: alzare `APP_VERSION` in `src/App.jsx`, poi commit + push su `main`.
- I test i18n bloccano il deploy se una scritta manca in italiano o in inglese.

---

## 1. Griglia unica del Profilo (la richiesta principale rimasta)

**Obiettivo:** allineare riga per riga i blocchi caratteristica (colonna sinistra)
con i riquadri vitali (colonna centrale).

Corrispondenze chieste:

| Sinistra | Destra |
|---|---|
| Forza | anagrafica (specie/taglia/allineamento…) |
| Destrezza + Costituzione | Punti Ferita |
| Intelligenza | Classe Armatura → Percezione Passiva |
| Saggezza | TS Morte → Sfinimento |
| Carisma | Condizioni + Ispirazione |

**Misure reali già rilevate** (viewport 1400×1000, personaggio di livello 5):

```
DESTRA (colonna "main")          SINISTRA (blocchi caratteristica, dopo il fix 2.22.0)
anagrafica        250 → 334      FORZA          250 → 338
Punti Ferita      344 → 547      DESTREZZA      346 → 474
CA / Riposo       547 → 666      COSTITUZIONE   482 → 550
Bonus/Iniz/Vel/PP 666 → 762      INTELLIGENZA   558 → 726
TSMorte/Res/Vis/Sf 762 → 881     SAGGEZZA       734 → 902
Condizioni/Isp    881 → 955      CARISMA        910 → 1058
```

**Cosa è già stato fatto:** le due colonne partono e finiscono insieme (stesso top e
stesso bottom); corretta una spaziatura doppia (`gap` + `marginBottom` insieme) che
faceva sforare la colonna sinistra.

**Perché non basta il CSS:** le due colonne sono griglie *indipendenti*, nessuna può
leggere le altezze dell'altra. Serve metterle **nella stessa griglia con righe condivise**.

**Punti di intervento:**
- `src/App.jsx` ~riga 4241: `.profilo-griglia` (`gridTemplateAreas: '"car main ritratto"'`)
- `src/App.jsx` ~riga 4305: colonna `main`
- `src/App.jsx` ~riga 4758: colonna `.profilo-caratteristiche`
- `src/ui/stili.js`: `.vitali` usa `order` per disporre i riquadri → va ripensato se si
  spostano i riquadri come righe della griglia principale.

**Attenzione:** su mobile (`max-width: 820px`) la griglia diventa una colonna sola
(`"main" "car" "ritratto"`): la nuova struttura deve continuare a funzionare lì.

---

## 2. Panoramica privilegi → estendere alla specie

Il pulsante **📖 Panoramica privilegi per livello** (dentro *Privilegi di Classe*,
`src/App.jsx` ~riga 2961) mostra già i livelli 1→20 con quelli futuri in grigio e
cliccabili per leggere cosa fanno. **Copre solo classe e sottoclasse**: manca la specie.

---

## 3. Voci ancora aperte della roadmap (issue #1)

La issue è **disallineata**: risultano ancora da fare cose già completate
(traduzione contenuti lunghi, Undo, onboarding, test). Andrebbe aggiornata.

**Regole 5e non automatizzate**
- Punti Stregoneria / Metamagia: manca il tracker con conversione slot ↔ punti
- Risorse di classe (Ki, Furia, Ispirazione): la sezione esiste ma è **manuale**
- Tiri Salvezza contro Morte automatici a 0 PF
- Capacità di carico per taglia (moltiplicatori, spinta/trascina, salto)
- Forma Selvatica / famigli / evocazioni con statblock
- Condizioni con effetti meccanici applicati ai tiri

**Funzionalità**
- Combat tracker con statblock di mostri/PNG
- Ricerca incantesimi con filtri (livello/scuola/classe/rituale) — oggi non c'è nessun filtro
- Preparazione incantesimi giornaliera
- QR code per la condivisione (il link sta in ~1150 caratteri, entrerebbe: serve un
  generatore scritto a mano, ~300 righe, perché la CSP blocca le librerie esterne)
- Stampa / esporta PDF, diario di sessione

**Qualità del codice**
- `App.jsx` è sceso da 7058 a ~5800 righe, ma la funzione `App()` resta ~4700 righe:
  lo stato è tutto intrecciato, spezzarla richiede context o prop-drilling
- Nessun ESLint/Prettier configurato
- Accessibilità (aria-label sui tiri, focus, contrasto)

**Traduzione**
- Fatta: 186 incantesimi, tutti i privilegi di classe, 31 tratti, 20 talenti, 13 metamagie
- Manca: **nomi** di sottoclassi e scuole di magia (le descrizioni sono tradotte)

---

## 4. Limite noto sull'audio

L'ambiente di sviluppo **non può ascoltare l'audio** (niente ffmpeg/decoder): si può
verificare che il file giusto venga caricato e che gli effetti partano, ma non come
suonano. Due file sono già stati sostituiti dopo una segnalazione dell'utente
(una voce umana dentro `foresta.mp3`, e `citta.mp3` che era una registrazione di
città moderna). Se emergono altri suoni fuori posto, vanno sostituiti a orecchio.

Volumi degli effetti pareggiati a mano in `GUADAGNO_SFX` (`src/utils/audioAmbiente.js`).

---

## 5. Da riverificare a occhio (non testabile in automatico)

- Il ritratto ora viene salvato a 1280px invece di 512: **le foto caricate prima
  vanno ricaricate** per vedere il miglioramento.
- Resa dell'ambiente "città" (brusio + carretti + fabbro + campane).
