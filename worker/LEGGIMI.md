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
