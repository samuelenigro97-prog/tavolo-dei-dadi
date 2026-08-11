# Continua qui — lavoro rimasto su Tavolo dei Dadi

Stato al **v2.60.0** (aggiornato dopo il consolidamento di persistenza, PWA e audio).
App: https://samuelenigro97-prog.github.io/tavolo-dei-dadi/

> ⚠️ Si lavora anche con **Antigravity** in parallelo su questo repo: prima di ogni
> push fare `git fetch` e, se il remote si è mosso, `git pull --rebase`. Evitare che
> due strumenti tocchino `src/App.jsx` contemporaneamente.

## Novità dopo la 2.24.0

- **2.25.0** — Riordino sezioni finalmente unico: le sezioni erano in tre container
  separati (il `order` CSS non poteva spostarle tra i gruppi). Ora i wrapper usano
  `display:contents`, quindi tutte le sezioni sono nello stesso contesto flex di
  `.griglia-scheda` e il trascinamento vale per tutte insieme. Talenti torna sopra
  Addestramento come da `ORDINE_SEZIONI_DEFAULT`. Incantesimi: nella riga azioni il
  tiro **Colpire** viene sempre prima dei **danni**.
- **2.26.0** — Ritratto ridimensionato per finire alla linea di Costituzione
  (`.profilo-ritratto` a `grid-row: 1 / 3`). Sezione **Addestramento** spostata dal
  corpo scheda alla colonna destra del Profilo, sotto il ritratto. Badge versione
  (5.5/5.0) portato a filo destro del selettore, prima della freccina.
- **2.27.0** — Sezione **Risorse di classe** spostata sotto l'Addestramento nella
  colonna destra del Profilo (wrapper `.profilo-extra`, vedi `src/ui/stili.js`).
  Ordine colonna destra: ritratto → Addestramento → Risorse di classe. Entrambe
  non sono più sezioni riordinabili del corpo (tolte da `ORDINE_SEZIONI_DEFAULT`).

## Come si lavora su questo progetto

- `npm test` → **67 test** (regole 5e, scheda, i18n, traduzioni, condivisione). Devono restare verdi.
- `node test/smoke.mjs` → apre l'app in un browser vero e fallisce se va in schermata bianca.
  Serve `BASE_PATH=/tavolo-dei-dadi/` e, in locale, `SMOKE_CHROMIUM=/opt/pw-browsers/chromium`.
- La CI (`.github/workflows/deploy.yml`) esegue test + smoke **prima** di build e deploy:
  se falliscono, l'app non viene pubblicata.
- Ogni modifica visibile: alzare `APP_VERSION` in `src/App.jsx`, poi commit + push su `main`.
- I test i18n bloccano il deploy se una scritta manca in italiano o in inglese.

---

## 1. Griglia unica del Profilo ✅ FATTO (v2.24.0)

**Risolto in v2.24.0.** Caratteristiche (sinistra) e riquadri vitali (centro) ora
vivono nella **stessa griglia con righe condivise** grazie a `grid-template-rows: subgrid`
(vedi `.profilo-caratteristiche` / `.profilo-main` in `src/ui/stili.js`). I riquadri
vitali sono stati raggruppati in cinque "righe" (anagrafica, Punti Ferita, difesa,
salvezza, stato) dentro `.profilo-main`; a sinistra Destrezza+Costituzione sono
impilate in `.car-coppia` così la coppia si allinea ai Punti Ferita. Rimosso l'uso di
`order` nei box (l'ordine è ora dato dal DOM). Verifica: su desktop 1400×1000 i top/bottom
di ogni caratteristica coincidono al pixel col gruppo vitali corrispondente; sotto 820px
la sezione torna a colonna singola (dati → caratteristiche → ritratto).

<details><summary>Contesto originale della richiesta</summary>

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

</details>

---

## 2. Panoramiche e tratti ✅ FATTO

Classe e sottoclasse hanno panoramiche per livello. I tratti della specie sono
presenti nella loro sezione e sono cliccabili per leggerne la spiegazione; non
serve una progressione 1→20 perché le specie base non avanzano per livello.

---

## 3. Voci realmente aperte della roadmap

**Regole 5e non automatizzate**
- Punti Stregoneria: il tracker esiste; manca la conversione slot ↔ punti
- Tiri Salvezza contro Morte: il tiro guidato compare a 0 PF; manca l'eventuale
  sincronizzazione automatica avanzata col combat tracker
- Forma Selvatica / famigli / evocazioni con statblock
- Condizioni con effetti meccanici applicati ai tiri

**Funzionalità**
- Statblock pronti di mostri/PNG da inserire nel Combat tracker (il tracker è fatto)
- QR code per la condivisione (il link sta in ~1150 caratteri, entrerebbe: serve un
  generatore scritto a mano, ~300 righe, perché la CSP blocca le librerie esterne)
- Stampa / esporta PDF, diario di sessione

**Qualità del codice**
- `App.jsx` è sceso da 7058 a ~5800 righe, ma la funzione `App()` resta ~4700 righe:
  lo stato è tutto intrecciato, spezzarla richiede context o prop-drilling
- Nessun ESLint/Prettier configurato

**Traduzione**
- Fatta: 186 incantesimi, tutti i privilegi di classe, 31 tratti, 20 talenti, 13 metamagie
- Manca: **nomi** di sottoclassi e scuole di magia (le descrizioni sono tradotte)

---

## 4. Audio

Gli eventi di Città, Dungeon e Montagna usano intervalli casuali e non ripetono
subito lo stesso effetto. I grilli notturni non hanno più una cadenza fissa. Il
muto ferma base, effetti e timer ed è ricordato dopo il riavvio; sottofondo ed
effetti hanno volumi separati. La resa finale va comunque controllata a orecchio.

Volumi degli effetti pareggiati a mano in `GUADAGNO_SFX` (`src/utils/audioAmbiente.js`).

---

## 5. Da riverificare a occhio (non testabile in automatico)

- Il ritratto ora viene salvato a 1280px invece di 512: **le foto caricate prima
  vanno ricaricate** per vedere il miglioramento.
- Resa dell'ambiente "città" (brusio + carretti + fabbro + campane).
