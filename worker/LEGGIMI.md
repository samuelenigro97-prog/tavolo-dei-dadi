# Worker IA — Import PDF + Illustrazioni — Cloudflare Worker

Questo piccolo servizio fa due cose, sullo stesso URL:

1. **Import da PDF**: riceve un PDF di scheda D&D 5e e restituisce il JSON del
   personaggio (pulsante **🤖 Importa da PDF (IA)**). Usa **Anthropic**.
2. **Illustrazioni fantasy**: genera il **ritratto dell'eroe** (da classe +
   specie, pulsante **✨ Ritratto IA**) e gli **sfondi ambientazione**. Usa
   **OpenAI** (modello `gpt-image-1`).

Serve perché un sito statico (GitHub Pages) non può tenere al sicuro una chiave
API: la chiave vive qui, nel Worker.

È gratuito per un uso personale (piano free di Cloudflare Workers); paghi solo
il consumo delle API.

## Chi paga cosa (importante)
- **Import da PDF → Anthropic**: usa la chiave `ANTHROPIC_API_KEY` del Worker,
  quindi il consumo è a carico di **te** che possiedi il Worker.
- **Ritratto del PG → OpenAI**: **BYOK** ("bring your own key"). Ogni utente
  inserisce la **propria** chiave OpenAI nell'app (pulsante **✨ IA** in alto):
  resta sul suo dispositivo, viene inviata al Worker a ogni richiesta e usata
  solo per quella chiamata. Così **ogni utente paga il proprio consumo**, non tu.
  Il Worker **non** salva né registra la chiave. (Gli sfondi delle ambientazioni
  sono dipinti di pubblico dominio già inclusi: non usano l'IA.)

## Cosa ti serve
- Un account [Cloudflare](https://dash.cloudflare.com/sign-up) (gratis).
- Per i PDF: una **chiave API Anthropic** (<https://console.anthropic.com/>) da
  mettere come secret sul Worker.
- Per le immagini: **niente sul Worker** — ogni utente mette la sua chiave OpenAI
  nell'app. (Puoi opzionalmente impostare `OPENAI_API_KEY` sul Worker come
  ripiego, ma allora quelle immagini le paghi tu: sconsigliato se non sei solo tu.)
- Node.js installato (per il comando `npx wrangler`).

## Opzione A — dal sito Cloudflare (senza terminale, consigliata)

1. Vai su <https://dash.cloudflare.com> → **Workers & Pages** → **Create** →
   **Create Worker**. Dai un nome (es. `tavolo-dei-dadi-transcribe`) → **Deploy**.
2. **Edit code**: cancella il codice di esempio, incolla tutto il contenuto di
   `worker/transcribe-worker.js` (questo file del progetto) → **Deploy**.
3. **Settings → Variables and Secrets → Add**:
   - per i PDF: tipo **Secret**, nome `ANTHROPIC_API_KEY`, valore = la tua chiave.
   - per le immagini: **niente** (ogni utente mette la sua chiave nell'app).
     Solo se vuoi pagarle tu, aggiungi il Secret `OPENAI_API_KEY`.
   - (opzionale) tipo **Text**, nome `ALLOW_ORIGIN`, valore
     `https://TUOUTENTE.github.io` per limitarlo al tuo sito.
4. In alto trovi l'URL del Worker (es.
   `https://tavolo-dei-dadi-transcribe.TUONOME.workers.dev`). Copialo.
5. Nell'app: sezione *Importa / esporta scheda* → *⚙️ Configura import da PDF (IA)*
   → incolla l'URL. Fatto: il pulsante **🤖 Importa da PDF** ora funziona.

## Opzione B — da terminale (wrangler)

```bash
cd worker
npx wrangler login                        # 1) accedi (apre il browser)
npx wrangler secret put ANTHROPIC_API_KEY # 2) chiave PDF (le immagini NON servono qui)
npx wrangler deploy                       # 3) pubblica
# (facoltativo, solo se vuoi pagare tu le immagini: wrangler secret put OPENAI_API_KEY)
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
