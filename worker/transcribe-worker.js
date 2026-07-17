/**
 * Cloudflare Worker: trascrizione di una scheda PDF di D&D 5e in JSON.
 *
 * Riceve  POST { pdfBase64 }  e risponde con il JSON del personaggio, nello
 * stesso schema usato da Tavolo dei Dadi (normalizeImported lo accetta).
 *
 * Segreti/variabili (impostati con `wrangler secret put` o dal dashboard):
 *   - ANTHROPIC_API_KEY  (obbligatorio) la tua chiave API Anthropic
 *   - ALLOW_ORIGIN       (opzionale)    origine consentita per il CORS,
 *                                       es. "https://TUOUTENTE.github.io".
 *                                       Default "*" (qualsiasi origine).
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOW_ORIGIN || '*';
    const headers = { ...cors(origin), 'Content-Type': 'application/json' };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });
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
