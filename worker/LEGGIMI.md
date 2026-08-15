# Import da PDF con l'IA — Cloudflare Worker

Questo piccolo servizio riceve un PDF di scheda D&D 5e e restituisce il JSON del
personaggio, così l'app può importarlo (pulsante **🤖 Importa da PDF (IA)**).
Serve perché un sito statico (GitHub Pages) non può tenere al sicuro una chiave
API: la chiave vive qui, nel Worker.

È gratuito per un uso personale (piano free di Cloudflare Workers).

## Cosa ti serve
- Un account [Cloudflare](https://dash.cloudflare.com/sign-up) (gratis).
- Una **chiave API Anthropic** (da <https://console.anthropic.com/>).
- Node.js installato (per il comando `npx wrangler`).

## Opzione A — dal sito Cloudflare (senza terminale, consigliata)

1. Vai su <https://dash.cloudflare.com> → **Workers & Pages** → **Create** →
   **Create Worker**. Dai un nome (es. `tavolo-dei-dadi-transcribe`) → **Deploy**.
2. **Edit code**: cancella il codice di esempio, incolla tutto il contenuto di
   `worker/transcribe-worker.js` (questo file del progetto) → **Deploy**.
3. **Settings → Variables and Secrets → Add**:
   - tipo **Secret**, nome `ANTHROPIC_API_KEY`, valore = la tua chiave API. Salva.
   - (opzionale) tipo **Text**, nome `ALLOW_ORIGIN`, valore
     `https://TUOUTENTE.github.io` per limitarlo al tuo sito.
4. In alto trovi l'URL del Worker (es.
   `https://tavolo-dei-dadi-transcribe.TUONOME.workers.dev`). Copialo.
5. Nell'app: sezione *Importa / esporta scheda* → *⚙️ Configura import da PDF (IA)*
   → incolla l'URL. Fatto: il pulsante **🤖 Importa da PDF** ora funziona.

## Opzione B — da terminale (wrangler)

```bash
cd worker
npx wrangler login                       # 1) accedi (apre il browser)
npx wrangler secret put ANTHROPIC_API_KEY # 2) incolla la chiave API (nascosta)
npx wrangler deploy                       # 3) pubblica
```

Wrangler stampa l'URL pubblico: copialo e incollalo nell'app come al punto 5.

## Consiglio di sicurezza
Chi conosce l'URL del Worker può usarlo e consumare la tua quota API. Per
limitarlo al solo tuo sito, in `wrangler.toml` scommenta `ALLOW_ORIGIN` con
l'indirizzo del tuo sito (es. `https://TUOUTENTE.github.io`) e rifai
`npx wrangler deploy`. In ogni caso, non condividere l'URL del Worker.

## In locale (sviluppo)
In `npm run dev` l'app usa il server Express (`server/index.js`) via il proxy
`/api`: basta un file `.env` con `ANTHROPIC_API_KEY=...`. Il Worker serve solo
per l'uso **online**.

---

# Archivio DM — vedere le schede create dagli utenti

Lo **stesso Worker** offre anche un archivio delle schede (endpoint `/pg`), utile
per avere personaggi veri su cui lavorare. Funziona così:

- l'app deposita da sola una copia della scheda ~10 secondi dopo l'ultima
  modifica (**senza immagini**: né ritratto né mappa);
- l'elenco è leggibile **solo con la chiave DM**, che vive nel Worker come
  segreto e non è nel sito. Senza quella chiave nessuno vede niente.

## Attivazione (una volta sola)

```bash
cd worker
npx wrangler kv namespace create SCHEDE   # 1) crea l'archivio: stampa un id
```

2. In `wrangler.toml` togli il commento al blocco `[[kv_namespaces]]` e incolla
   l'`id` appena stampato.

```bash
npx wrangler secret put DM_KEY            # 3) scegli la TUA password da DM
npx wrangler deploy                       # 4) pubblica
```

5. Dì all'app dov'è l'archivio: crea in cima al progetto un file `.env` con

   ```
   VITE_ARCHIVIO_PG_URL=https://IL-TUO-WORKER.workers.dev
   ```

   Per il sito online la stessa variabile va aggiunta al passo di build in
   `.github/workflows/deploy.yml` (`env:` del comando `npm run build`).
   **Se la variabile è vuota, l'intera funzione resta spenta.**

## Come si consulta
Nell'app: **🏠 Menu → 🗂 Archivio DM** → inserisci la chiave DM. Vedi l'elenco
(nome, classe, livello, quando è stato aggiornato, da quale dispositivo) e con
**Apri** carichi la scheda tra i tuoi personaggi per studiarla.

## Nota su privacy e dati
Il sito è pubblico: chi lo usa deposita la propria scheda senza accorgersene.
Sono dati di gioco (nome del personaggio, classe, note), non dati personali, e
le immagini non vengono mai inviate — ma è comunque corretto **scriverlo nella
guida dell'app** se il sito resta aperto a tutti. Per cancellare una scheda:

```bash
curl -X DELETE "https://IL-TUO-WORKER.workers.dev/pg/<id>?key=LA_TUA_CHIAVE"
```

---

# Stanze temporanee — condivisione senza account

Lo stesso Worker espone anche:

- `POST /room` con `{ "scheda": { ... } }`: crea uno snapshot immutabile;
- `GET /room/<CODICE>`: legge lo snapshot tramite il codice pubblico.

La stanza dura 24 ore. Il record resta al massimo un'ora aggiuntiva soltanto
per poter rispondere chiaramente “stanza scaduta”, poi KV lo elimina. Il Worker
genera codici casuali non sequenziali da 10 caratteri (circa 50 bit), rimuove
ritratto e mappa, limita il JSON a 128 KB e valida struttura e valori principali.
Non esistono endpoint per aggiornare una stanza: chi vuole condividere una
versione nuova crea un nuovo codice.

La funzione riusa il binding KV `SCHEDE`, con chiavi `room:` separate da `pg:`.
Non richiede nuovi segreti. Per attivarla nell'app imposta durante la build:

```text
VITE_STANZE_URL=https://IL-TUO-WORKER.workers.dev
```

Se `VITE_STANZE_URL` manca, l'app prova `VITE_ARCHIVIO_PG_URL`; se mancano
entrambi mostra un errore locale e continua a funzionare normalmente.

Per la protezione da abuso è consigliato il binding Rate Limiting nativo di
Cloudflare indicato (commentato) in `wrangler.toml`. Richiede Wrangler 4.36 o
successivo e un `namespace_id` numerico scelto nell'account. In sua assenza è
attivo un fallback KV best-effort di 10 richieste/minuto per identificatore IP
hashato. Nessun IP viene memorizzato in chiaro.

Il backup Gist resta disponibile come funzione separata per gli utenti che lo
avevano già configurato. Le stanze non leggono né richiedono il relativo token.
