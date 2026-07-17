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

## Deploy in 4 passi

```bash
cd worker

# 1) accedi a Cloudflare (apre il browser)
npx wrangler login

# 2) imposta la chiave API come segreto (te la chiede e la nasconde)
npx wrangler secret put ANTHROPIC_API_KEY

# 3) pubblica il Worker
npx wrangler deploy
```

Al termine Wrangler stampa l'URL pubblico, tipo:

```
https://tavolo-dei-dadi-transcribe.TUONOME.workers.dev
```

**4)** Copia quell'URL e incollalo nell'app: sezione *Importa / esporta scheda*
→ *⚙️ Configura import da PDF (IA)*. Fatto: ora il pulsante **🤖 Importa da PDF**
funziona.

## Consiglio di sicurezza
Chi conosce l'URL del Worker può usarlo e consumare la tua quota API. Per
limitarlo al solo tuo sito, in `wrangler.toml` scommenta `ALLOW_ORIGIN` con
l'indirizzo del tuo sito (es. `https://TUOUTENTE.github.io`) e rifai
`npx wrangler deploy`. In ogni caso, non condividere l'URL del Worker.

## In locale (sviluppo)
In `npm run dev` l'app usa il server Express (`server/index.js`) via il proxy
`/api`: basta un file `.env` con `ANTHROPIC_API_KEY=...`. Il Worker serve solo
per l'uso **online**.
