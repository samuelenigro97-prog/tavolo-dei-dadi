/**
 * Cloudflare Worker di Tavolo dei Dadi. Due funzioni, sullo stesso Worker:
 *
 *  1) POST /            → trascrizione di una scheda PDF in JSON (Anthropic).
 *  2) /pg               → ARCHIVIO DELLE SCHEDE (KV), per il DM:
 *       POST /pg            l'app deposita una copia della scheda (nessuna chiave)
 *       GET  /pg?key=…      elenco di tutte le schede      (solo con la chiave DM)
 *       GET  /pg/<id>?key=… una scheda completa            (solo con la chiave DM)
 *       DELETE /pg/<id>?key=…  cancella una scheda         (solo con la chiave DM)
 *
 * Segreti/variabili (impostati con `wrangler secret put` o dal dashboard):
 *   - ANTHROPIC_API_KEY  (per la trascrizione PDF) la tua chiave API Anthropic
 *   - DM_KEY             (per l'archivio) la password con cui TU leggi le schede.
 *                        Senza questa chiave l'elenco non è leggibile da nessuno.
 *   - ALLOW_ORIGIN       (opzionale) origine consentita per il CORS,
 *                        es. "https://TUOUTENTE.github.io". Default "*".
 *   - SCHEDE             (binding KV) l'archivio vero e proprio.
 *
 * Deploy: vedi worker/LEGGIMI.md
 */

// Deve restare allineato allo schema di normalizeImported in src/App.jsx.
const PROMPT = `Sei un assistente che trascrive schede di personaggi di D&D 5a edizione.
Leggi il PDF allegato ed estrai i dati del personaggio (le pagine oltre la
scheda vera e propria, come le carte incantesimo, vanno ignorate).

Rispondi SOLO con un oggetto JSON valido, senza testo prima o dopo, con questo schema:
{
  "nome": "string",
  "background": "string",
  "classe": "string",
  "sottoclasse": "string",
  "specie": "string",
  "allineamento": "string",
  "livello": number,
  "ca": number,
  "armatura": { "nome": "string", "tipo": "manuale|nessuna|leggera|media|pesante", "base": number, "scudo": boolean, "bonus": number },
  "pfMax": number,
  "dadiVita": "string — es. \\"4d6\\"",
  "velocita": number,
  "taglia": "string — es. \\"Media\\"",
  "bonusCompetenza": number,
  "caratteristiche": { "forza": number, "destrezza": number, "costituzione": number, "intelligenza": number, "saggezza": number, "carisma": number },
  "tiriSalvezza": { "forza": boolean, "destrezza": boolean, "costituzione": boolean, "intelligenza": boolean, "saggezza": boolean, "carisma": boolean },
  "abilita": {
    "acrobazia": 0, "addestrareAnimali": 0, "arcano": 0, "atletica": 0, "furtivita": 0, "indagare": 0,
    "inganno": 0, "intimidire": 0, "intrattenere": 0, "intuizione": 0, "medicina": 0, "natura": 0,
    "percezione": 0, "persuasione": 0, "rapiditaDiMano": 0, "religione": 0, "sopravvivenza": 0, "storia": 0
  },
  "attacchi": [ { "nome": "string", "bonus": number, "danno": "string — es. \\"2d6+3\\"; vuoto se assente", "tipoDanno": "string", "note": "string" } ],
  "incantatore": { "caratteristica": "forza|destrezza|costituzione|intelligenza|saggezza|carisma oppure vuoto se non incantatore" },
  "slotIncantesimo": { "1": number, "2": number, "3": number, "4": number, "5": number, "6": number, "7": number, "8": number, "9": number },
  "incantesimiLista": [ { "livello": number, "nome": "string", "tempo": "string", "gittata": "string", "note": "string" } ],
  "privilegi": "string — privilegi/capacità di CLASSE in testo semplice",
  "trattiSpecie": "string — tratti della SPECIE, separati dai privilegi di classe",
  "talenti": "string",
  "equipaggiamento": "string",
  "sintonia": "string",
  "lingue": "string — es. \\"Comune, Elfico\\"",
  "aspetto": "string",
  "note": "string — storia e tratti caratteriali",
  "resistenze": "string — resistenze ai danni, vuoto se assenti",
  "sensi": "string — es. \\"Scurovisione 18 m\\", vuoto se assenti",
  "sfinimento": number,
  "concentrazione": "string",
  "risorse": [ { "nome": "string", "attuali": number, "max": number, "reset": "breve|lungo o vuoto" } ],
  "addestramento": { "armature": { "leggera": boolean, "media": boolean, "pesante": boolean, "scudi": boolean }, "armi": "string", "strumenti": "string" },
  "denari": { "mr": number, "ma": number, "me": number, "mo": number, "mp": number }
}

Regole:
- Le caratteristiche sono i punteggi (1-30), non i modificatori.
- "tiriSalvezza": true solo se COMPETENTE (pallino pieno).
- "abilita": 0 = nessuna competenza, 1 = competenza (pallino pieno), 2 = maestria.
- "bonus" è il bonus per colpire; le voci senza bonus e danno (es. un focus) vanno omesse dagli attacchi.
- Se un dato non è presente, usa un default ragionevole (caratteristiche 10, livello 1, attacchi [], competenze false/0).`;

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Dimensione massima di una scheda depositata (le immagini non vengono salvate,
// quindi 256 KB sono abbondanti e impediscono che qualcuno riempia l'archivio).
const MAX_SCHEDA_BYTES = 256 * 1024;

/** Toglie i campi pesanti (immagini) prima di archiviare. */
function alleggerisci(scheda) {
  if (!scheda || typeof scheda !== 'object') return {};
  const { ritratto, mappaCampagna, ...resto } = scheda;
  return resto;
}

/**
 * Archivio schede su KV.
 * Le scritture sono libere (l'app deposita da sola), le LETTURE richiedono la
 * chiave DM: così le schede degli altri le vedi solo tu.
 */
async function gestisciArchivio(request, env, headers, percorso) {
  if (!env.SCHEDE) {
    return new Response(JSON.stringify({ error: 'Archivio non configurato: manca il binding KV "SCHEDE"' }), { status: 500, headers });
  }
  const url = new URL(request.url);
  const id = percorso.startsWith('/pg/') ? decodeURIComponent(percorso.slice(4)) : '';

  // --- Deposito di una scheda (nessuna chiave richiesta) ---
  if (request.method === 'POST') {
    let corpo;
    try { corpo = await request.json(); } catch { corpo = null; }
    if (!corpo || typeof corpo !== 'object') {
      return new Response(JSON.stringify({ error: 'Corpo JSON non valido' }), { status: 400, headers });
    }
    const dispositivo = String(corpo.dispositivo || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    const idPg = String(corpo.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    if (!dispositivo || !idPg) {
      return new Response(JSON.stringify({ error: 'Campi "dispositivo" e "id" obbligatori' }), { status: 400, headers });
    }
    const scheda = alleggerisci(corpo.scheda);
    const testo = JSON.stringify(scheda);
    if (testo.length > MAX_SCHEDA_BYTES) {
      return new Response(JSON.stringify({ error: 'Scheda troppo grande' }), { status: 413, headers });
    }
    const chiave = `pg:${dispositivo}:${idPg}`;
    // I metadati alimentano l'elenco senza dover leggere ogni scheda intera.
    const metadata = {
      nome: String(scheda.nome || '').slice(0, 60),
      classe: String(scheda.classe || '').slice(0, 40),
      livello: Number(scheda.livello) || 1,
      dispositivo,
      aggiornato: new Date().toISOString(),
    };
    await env.SCHEDE.put(chiave, testo, { metadata });
    return new Response(JSON.stringify({ ok: true }), { headers });
  }

  // --- Da qui in poi serve la chiave DM ---
  const chiaveDm = url.searchParams.get('key') || request.headers.get('x-dm-key') || '';
  if (!env.DM_KEY || chiaveDm !== env.DM_KEY) {
    return new Response(JSON.stringify({ error: 'Chiave DM non valida' }), { status: 401, headers });
  }

  if (request.method === 'GET' && !id) {
    const elenco = [];
    let cursor;
    do {
      const pagina = await env.SCHEDE.list({ prefix: 'pg:', cursor, limit: 1000 });
      for (const k of pagina.keys) elenco.push({ id: k.name, ...(k.metadata || {}) });
      cursor = pagina.list_complete ? null : pagina.cursor;
    } while (cursor);
    elenco.sort((a, b) => String(b.aggiornato || '').localeCompare(String(a.aggiornato || '')));
    return new Response(JSON.stringify({ totale: elenco.length, schede: elenco }), { headers });
  }

  if (request.method === 'GET' && id) {
    const testo = await env.SCHEDE.get(id);
    if (testo == null) return new Response(JSON.stringify({ error: 'Scheda non trovata' }), { status: 404, headers });
    return new Response(testo, { headers });
  }

  if (request.method === 'DELETE' && id) {
    await env.SCHEDE.delete(id);
    return new Response(JSON.stringify({ ok: true }), { headers });
  }

  return new Response(JSON.stringify({ error: 'Metodo non supportato su /pg' }), { status: 405, headers });
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOW_ORIGIN || '*';
    const headers = { ...cors(origin), 'Content-Type': 'application/json' };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });

    // Rotta dell'archivio schede (tutto il resto resta la trascrizione PDF).
    const percorso = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
    if (percorso === '/pg' || percorso.startsWith('/pg/')) {
      return gestisciArchivio(request, env, headers, percorso);
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Usa POST con { pdfBase64 }' }), { status: 405, headers });
    }
    if (!env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY non configurata sul Worker' }), { status: 500, headers });
    }

    let pdfBase64;
    try {
      ({ pdfBase64 } = await request.json());
    } catch {
      return new Response(JSON.stringify({ error: 'Corpo JSON non valido' }), { status: 400, headers });
    }
    if (!pdfBase64 || typeof pdfBase64 !== 'string') {
      return new Response(JSON.stringify({ error: 'Campo pdfBase64 mancante' }), { status: 400, headers });
    }

    try {
      const risposta = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-8',
          max_tokens: 8192,
          messages: [{
            role: 'user',
            content: [
              { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
              { type: 'text', text: PROMPT },
            ],
          }],
        }),
      });

      if (!risposta.ok) {
        const dettaglio = await risposta.text();
        return new Response(JSON.stringify({ error: `Anthropic ${risposta.status}: ${dettaglio.slice(0, 300)}` }), { status: 502, headers });
      }

      const dati = await risposta.json();
      const testo = (dati.content || []).find((b) => b.type === 'text')?.text ?? '';
      const inizio = testo.indexOf('{');
      const fine = testo.lastIndexOf('}');
      if (inizio === -1 || fine === -1) {
        return new Response(JSON.stringify({ error: 'Risposta del modello non in formato JSON' }), { status: 502, headers });
      }
      // valida che sia JSON prima di rimandarlo
      const scheda = JSON.parse(testo.slice(inizio, fine + 1));
      return new Response(JSON.stringify(scheda), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: `Trascrizione fallita: ${err.message}` }), { status: 500, headers });
    }
  },
};
