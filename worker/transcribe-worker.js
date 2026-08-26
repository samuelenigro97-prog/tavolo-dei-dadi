/**
 * Cloudflare Worker di Tavolo dei Dadi. Tre funzioni, sullo stesso Worker:
 *
 *  1) POST /            → trascrizione di una scheda PDF in JSON (Anthropic).
 *  2) /pg               → ARCHIVIO DELLE SCHEDE (KV), per il DM:
 *       POST /pg            l'app deposita una copia della scheda (nessuna chiave)
 *       GET  /pg?key=…      elenco di tutte le schede      (solo con la chiave DM)
 *       GET  /pg/<id>?key=… una scheda completa            (solo con la chiave DM)
 *       DELETE /pg/<id>?key=…  cancella una scheda         (solo con la chiave DM)
 *       DELETE /pg (body {dispositivo,id})  un dispositivo cancella la PROPRIA
 *              copia depositata (nessuna chiave: stessa identità della POST)
 *  3) /room            → snapshot temporanei condivisi tramite codice (KV)
 *  4) /sync/<codice>   → sincronizzazione roster tra dispositivi senza token
 *       GET  /sync/<codice>  legge l'ultimo roster salvato con quel codice
 *       PUT  /sync/<codice>  salva/sovrascrive {roster, updatedAt} (180 giorni)
 *              il codice è generato SEMPRE lato client e fa da identità e da
 *              segreto insieme: nessun account, nessun token GitHub.
 *
 * Segreti/variabili (impostati con `wrangler secret put` o dal dashboard):
 *   - ANTHROPIC_API_KEY  (opzionale, fallback per PDF) la tua chiave API Anthropic.
 *                        Se manca, i PDF non sono trascrivibili, ma le immagini (JPG/PNG/WebP)
 *                        funzionano comunque gratis via Workers AI o Ollama.
 *   - DM_KEY             (per l'archivio) la password con cui TU leggi le schede.
 *                        Senza questa chiave l'elenco non è leggibile da nessuno.
 *   - ALLOW_ORIGIN       (opzionale) origine consentita per il CORS,
 *                        es. "https://TUOUTENTE.github.io". Default "*".
 *   - SCHEDE             (binding KV) l'archivio vero e proprio.
 *   - AI                 (binding Workers AI) per trascrizione immagini gratis (10k req/giorno).
 *                        Richiede [ai] binding="AI" in wrangler.toml. I modelli tentati in ordine:
 *                        gemma-4-26b, llama-4-scout, qwen3.8-27b, mistral-small-3.1-24b, llava-1.5-7b, llama-3.2-11b
 *                        (i primi 4 non hanno blocco EU 5016; llava 13b è rimosso 5007, il 7b resta).
 *   - OLLAMA_URL         (opzionale) URL del tuo server Ollama (es. https://ollama.tuodominio.com
 *                        o http://IP:11434). Se impostato, le immagini vengono trascritte via
 *                        Ollama (modello vision) come fallback/prima di Anthropic. Gratis e privato.
 *   - OLLAMA_MODEL       (opzionale) modello Ollama vision (default llava). Es. llava, qwen2-vl, llama3.2-vision.
 *   - WORKERS_AI_MODEL   (opzionale) forza un singolo modello Workers AI (es. @cf/google/gemma-4-26b-a4b-it).
 *   - ANTHROPIC_MODEL    (opzionale) modello Anthropic (default claude-opus-4-8, es. claude-sonnet-4-20250514).
 *
 * Deploy: vedi worker/LEGGIMI.md
 */

// Deve restare allineato allo schema di normalizeImported in src/App.jsx.
const PROMPT = `Sei un assistente che trascrive schede di personaggi di D&D 5a edizione.
Leggi l'immagine/PDF allegato (può essere Fantasy Grounds, D&D Beyond o scheda cartacea 5e) ed estrai i dati del personaggio.

COME LEGGERE FANTASY GROUNDS (MOLTO IMPORTANTE):
- Nella tab SKILLS:
  * Accanto al nome di ogni abilità c'è una STELLA a quattro punte a sinistra del nome.
  * Se la stella è GRIGIA / TRASPARENTE / SPENTA → l'abilità NON È COMPETENTE: imposta il valore a 0!
  * Se la stella è GIALLA / DORATA / ACCESA → COMPETENZA (imposta il valore a 1).
  * Se ci sono DUE STELLE DORATE affiancate (o stella doppia dorata) → MAESTRIA / EXPERTISE (imposta il valore a 2).
  * ATTENZIONE: In D&D 5e un personaggio ha tipicamente solo 4-6 abilità competenti in totale. NON impostare tutte le 18 abilità a 1! L'icona del d20 azzurro a destra è solo il tasto per tirare e non indica competenza.
- Nella tab MAIN:
  * In SAVES (Tiri Salvezza): solo le caratteristiche con la stella dorata accesa hanno competenza (tiriSalvezza: true). In D&D un personaggio ha solo i 2 TS della classe iniziale (es. Guerriero: Forza e Costituzione). Se la stella è grigia/spenta, imposta false.
  * In SENSES: "Darkvision 60" → "Scurovisione 18 m".
  * In CLASS & LEVEL: se multiclasse (es. "Fighter 1 / Ranger 6 / Rogue 3"), classe="Guerriero", livello=1, e multiclasse=[{"classe":"Ranger","livello":6},{"classe":"Ladro","livello":3}].
- Nelle tab ABILITIES / FEATS / TRAITS / POWERS:
  * Estrai tutti i privilegi di classe in "privilegi", i tratti razziali in "trattiSpecie", i talenti in "talenti", e le risorse con utilizzi limitati in "risorse".

Rispondi SOLO con un oggetto JSON valido, senza testo prima o dopo, con questo schema:
{
  "nome": "string (con iniziale Maiuscola per ogni parola, es. \\"Kairon\\", \\"Frost\\")",
  "background": "string",
  "classe": "string",
  "sottoclasse": "string",
  "multiclasse": [{ "classe": "string", "livello": number, "sottoclasse": "string" }],
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
- "tiriSalvezza": true solo se COMPETENTE (stella dorata accesa).
- "abilita": 0 = NESSUNA competenza (stella grigia), 1 = competenza (singola stella dorata), 2 = maestria (doppia stella dorata).
- "bonus" è il bonus per colpire; le voci senza bonus e danno (es. un focus) vanno omesse dagli attacchi.
- "multiclasse": [] se monoclasse, altrimenti le classi secondarie da CLASS & LEVEL (es. "Fighter 1 / Ranger 6 / Rogue 3" → classe Fighter livello 1, multiclasse [{"classe":"Ranger","livello":6},{"classe":"Rogue","livello":3}]).
- ATTENZIONE LIVELLO: "livello" è il livello della CLASSE PRINCIPALE, non il totale. Se la scheda mostra "Level 10" e "Fighter 1 / Ranger 6 / Rogue 3", allora livello=1 (totale 10), non 10. Se monoclassa con "Level 10", allora livello=10.
- LINGUA OBBLIGATORIA: tutti i campi testuali (background, classe, sottoclasse, specie, allineamento, lingue, sensi, taglia) DEVONO essere in ITALIANO canonico, anche se l'immagine è in inglese. Traduci: Soldier→Soldato, Hermit→Eremita, Fighter→Guerriero, Rogue→Ladro, Ranger→Ranger, Half-Elf→Mezzelfo, Wood Elf→Elfo dei Boschi, High Elf→Elfo Alto, Darkvision 60 ft→Scurovisione 18 m, Common/Elvish→Comune/Elfico, ecc.
- Se un dato non è presente, usa un default ragionevole (caratteristiche 10, livello 1, attacchi [], competenze false/0).`;

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dm-key',
  };
}

// Dimensione massima di una scheda depositata (le immagini non vengono salvate,
// quindi 256 KB sono abbondanti e impediscono che qualcuno riempia l'archivio).
const MAX_SCHEDA_BYTES = 256 * 1024;
const MAX_STANZA_BYTES = 128 * 1024;
const DURATA_STANZA_SEC = 24 * 60 * 60;
const MAX_SYNC_BYTES = 4 * 1024 * 1024;
const DURATA_SYNC_SEC = 180 * 24 * 3600;
const DURATA_RECORD_SEC = 25 * 60 * 60; // un'ora per distinguere scaduta da inesistente
const ALFABETO_STANZA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/** Forza la prima lettera di ogni parola in maiuscolo. */
function formattaNome(str) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/(^|[\s\-(/'"])[a-zà-öø-ÿ]/gu, (m) => m.toUpperCase());
}

/** Toglie i campi pesanti (immagini) prima di archiviare. */
function alleggerisci(scheda) {
  if (!scheda || typeof scheda !== 'object') return {};
  const { ritratto, mappaCampagna, ...resto } = scheda;
  return resto;
}

function jsonSicuro(valore, profondita = 0, contatore = { nodi: 0 }) {
  if (profondita > 8 || ++contatore.nodi > 5000) return false;
  if (valore == null || ['string', 'number', 'boolean'].includes(typeof valore)) {
    return typeof valore !== 'number' || Number.isFinite(valore);
  }
  if (Array.isArray(valore)) return valore.length <= 500 && valore.every((v) => jsonSicuro(v, profondita + 1, contatore));
  if (typeof valore !== 'object' || Object.getPrototypeOf(valore) !== Object.prototype) return false;
  const chiavi = Object.keys(valore);
  if (chiavi.length > 500 || chiavi.some((k) => k.length > 80 || ['__proto__', 'prototype', 'constructor'].includes(k))) return false;
  return chiavi.every((k) => jsonSicuro(valore[k], profondita + 1, contatore));
}

/** Valida il sottoinsieme minimo e i limiti strutturali prima di scrivere nel KV. */
export function validaSchedaStanza(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || !jsonSicuro(input)) return null;
  const scheda = alleggerisci(input);
  const campiTesto = ['nome', 'classe', 'sottoclasse', 'specie', 'background', 'allineamento'];
  if (campiTesto.some((k) => scheda[k] != null && (typeof scheda[k] !== 'string' || scheda[k].length > 120))) return null;
  if (scheda.livello != null && (!Number.isInteger(scheda.livello) || scheda.livello < 1 || scheda.livello > 20)) return null;
  if (scheda.caratteristiche != null) {
    if (!scheda.caratteristiche || typeof scheda.caratteristiche !== 'object' || Array.isArray(scheda.caratteristiche)) return null;
    if (Object.values(scheda.caratteristiche).some((v) => !Number.isFinite(v) || v < 1 || v > 30)) return null;
  }
  const testo = JSON.stringify(scheda);
  return new TextEncoder().encode(testo).length <= MAX_STANZA_BYTES ? { scheda, testo } : null;
}

export function generaCodiceStanza() {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let codice = '';
  for (let i = 0; i < 10; i++) codice += ALFABETO_STANZA[bytes[i] & 31];
  return codice;
}

async function hashBreve(testo) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(testo));
  return [...new Uint8Array(digest).slice(0, 8)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function superaRateLimit(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'sconosciuto';
  if (env.ROOM_RATE_LIMITER?.limit) {
    const esito = await env.ROOM_RATE_LIMITER.limit({ key: ip });
    return esito?.success !== false;
  }
  // Fallback best-effort sul KV esistente; il binding Cloudflare nativo resta
  // consigliato in produzione perché è atomico e distribuito.
  const finestra = Math.floor(Date.now() / 60000);
  const key = `rate:room:${finestra}:${await hashBreve(ip)}`;
  const usi = Number(await env.SCHEDE.get(key)) || 0;
  if (usi >= 10) return false;
  await env.SCHEDE.put(key, String(usi + 1), { expirationTtl: 120 });
  return true;
}

/** Snapshot pubblico temporaneo. Nessuna operazione di aggiornamento o delete. */
export async function gestisciStanze(request, env, headers, percorso) {
  headers = { ...headers, 'Cache-Control': 'no-store' };
  if (!env.SCHEDE) {
    return new Response(JSON.stringify({ code: 'ROOM_SERVICE_UNAVAILABLE', error: 'Servizio stanza non configurato' }), { status: 503, headers });
  }
  if (!(await superaRateLimit(request, env))) {
    return new Response(JSON.stringify({ code: 'ROOM_RATE_LIMITED', error: 'Troppe richieste' }), { status: 429, headers: { ...headers, 'Retry-After': '60' } });
  }

  if (request.method === 'POST' && percorso === '/room') {
    const lunghezza = Number(request.headers.get('content-length')) || 0;
    if (lunghezza > MAX_STANZA_BYTES + 4096) {
      return new Response(JSON.stringify({ code: 'ROOM_TOO_LARGE', error: 'Scheda troppo grande' }), { status: 413, headers });
    }
    let corpo;
    try { corpo = await request.json(); } catch { corpo = null; }
    const valido = validaSchedaStanza(corpo?.scheda);
    if (!valido) {
      const status = corpo?.scheda && new TextEncoder().encode(JSON.stringify(corpo.scheda)).length > MAX_STANZA_BYTES ? 413 : 400;
      return new Response(JSON.stringify({ code: status === 413 ? 'ROOM_TOO_LARGE' : 'ROOM_INVALID_PAYLOAD', error: status === 413 ? 'Scheda troppo grande' : 'Scheda non valida' }), { status, headers });
    }
    let codice = '';
    for (let tentativo = 0; tentativo < 6; tentativo++) {
      const candidato = generaCodiceStanza();
      if (await env.SCHEDE.get(`room:${candidato}`) == null) { codice = candidato; break; }
    }
    if (!codice) return new Response(JSON.stringify({ code: 'ROOM_COLLISION', error: 'Impossibile generare un codice' }), { status: 503, headers });
    const creato = Date.now();
    const expiresAt = creato + DURATA_STANZA_SEC * 1000;
    await env.SCHEDE.put(`room:${codice}`, JSON.stringify({ version: 1, creato, expiresAt, scheda: valido.scheda }), { expirationTtl: DURATA_RECORD_SEC });
    return new Response(JSON.stringify({ code: codice, expiresAt }), { status: 201, headers });
  }

  const codice = percorso.startsWith('/room/') ? percorso.slice(6).toUpperCase() : '';
  if (request.method === 'GET' && /^[2-9A-HJ-NP-Z]{10}$/.test(codice)) {
    const testo = await env.SCHEDE.get(`room:${codice}`);
    if (testo == null) return new Response(JSON.stringify({ code: 'ROOM_NOT_FOUND', error: 'Stanza inesistente' }), { status: 404, headers });
    let record;
    try { record = JSON.parse(testo); } catch { record = null; }
    if (!record || record.expiresAt <= Date.now()) {
      return new Response(JSON.stringify({ code: 'ROOM_EXPIRED', error: 'Stanza scaduta' }), { status: 410, headers });
    }
    const valido = validaSchedaStanza(record.scheda);
    if (!valido) return new Response(JSON.stringify({ code: 'ROOM_INVALID_PAYLOAD', error: 'Contenuto stanza non valido' }), { status: 422, headers });
    return new Response(JSON.stringify({ scheda: valido.scheda, expiresAt: record.expiresAt }), { headers });
  }

  if (request.method === 'GET') return new Response(JSON.stringify({ code: 'ROOM_NOT_FOUND', error: 'Codice stanza non valido' }), { status: 404, headers });
  return new Response(JSON.stringify({ code: 'ROOM_METHOD_NOT_ALLOWED', error: 'Metodo non supportato' }), { status: 405, headers });
}

function codiceSyncValido(percorso) {
  const codice = percorso.startsWith('/sync/') ? decodeURIComponent(percorso.slice(6)).toUpperCase() : '';
  return /^[2-9A-HJ-NP-Z]{10}$/.test(codice) ? codice : '';
}

/** Sincronizzazione roster tra dispositivi senza account né token: il codice
 *  a 10 caratteri è generato SEMPRE lato client (mai dal server) e fa da
 *  identità e da segreto insieme, sullo stesso modello delle Stanze. */
export async function gestisciSync(request, env, headers, percorso) {
  headers = { ...headers, 'Cache-Control': 'no-store' };
  if (!env.SCHEDE) {
    return new Response(JSON.stringify({ error: 'SYNC_SERVICE_UNAVAILABLE', dettaglio: 'Servizio sync non configurato' }), { status: 500, headers });
  }
  if (!(await superaRateLimit(request, env))) {
    return new Response(JSON.stringify({ error: 'SYNC_RATE_LIMITED' }), { status: 429, headers: { ...headers, 'Retry-After': '60' } });
  }
  const codice = codiceSyncValido(percorso);
  if (!codice) {
    return new Response(JSON.stringify({ error: 'SYNC_INVALID_CODE' }), { status: 400, headers });
  }
  const chiave = `sync:${codice}`;

  if (request.method === 'PUT') {
    let corpo;
    try { corpo = await request.json(); } catch { corpo = null; }
    const roster = corpo?.roster;
    if (!roster || typeof roster !== 'object' || Array.isArray(roster) || !roster.personaggi || typeof roster.personaggi !== 'object') {
      return new Response(JSON.stringify({ error: 'SYNC_INVALID_PAYLOAD' }), { status: 400, headers });
    }
    const updatedAt = Number(corpo.updatedAt) || Date.now();
    const testo = JSON.stringify({ roster, updatedAt });
    if (new TextEncoder().encode(testo).length > MAX_SYNC_BYTES) {
      return new Response(JSON.stringify({ error: 'SYNC_TOO_LARGE' }), { status: 413, headers });
    }
    // Safety: non sovrascrivere un roster più grande con uno più piccolo se il timestamp non è più recente (evita cancellazioni accidentali)
    try {
      const esistente = await env.SCHEDE.get(chiave);
      if (esistente) {
        const esistenteDati = JSON.parse(esistente);
        const countEsistente = Object.keys(esistenteDati?.roster?.personaggi || {}).length;
        const countNuovo = Object.keys(roster?.personaggi || {}).length;
        const tsEsistente = Number(esistenteDati?.updatedAt) || 0;
        if (countNuovo < countEsistente && updatedAt <= tsEsistente) {
          return new Response(JSON.stringify({ error: 'SYNC_OUTDATED', dettaglio: `Roster più piccolo (${countNuovo} vs ${countEsistente}) con timestamp non più recente` }), { status: 409, headers });
        }
      }
    } catch {}
    await env.SCHEDE.put(chiave, testo, { expirationTtl: DURATA_SYNC_SEC });
    return new Response(JSON.stringify({ ok: true, updatedAt }), { status: 200, headers });
  }

  if (request.method === 'GET') {
    const testo = await env.SCHEDE.get(chiave);
    if (testo == null) return new Response(JSON.stringify({ error: 'SYNC_NOT_FOUND' }), { status: 404, headers });
    return new Response(testo, { status: 200, headers });
  }

  return new Response(JSON.stringify({ error: 'SYNC_METHOD_NOT_ALLOWED' }), { status: 405, headers });
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
    // I metadati alimentano l'elenco senza dover leggere ogni scheda intera:
    // il DM vede già l'essenziale a colpo d'occhio, senza aprire ogni scheda.
    const metadata = {
      nome: formattaNome(String(scheda.nome || '')).slice(0, 60),
      classe: String(scheda.classe || '').slice(0, 40),
      sottoclasse: String(scheda.sottoclasse || '').slice(0, 40),
      specie: String(scheda.specie || '').slice(0, 40),
      background: String(scheda.background || '').slice(0, 40),
      livello: Number(scheda.livello) || 1,
      pfMax: Number(scheda.pfMax) || 0,
      pfAttuali: Number(scheda.pfAttuali) || 0,
      dispositivo,
      aggiornato: new Date().toISOString(),
    };
    // TTL 180 giorni: le schede si aggiornano ad ogni modifica; i resti orfani
    // scadono da soli se la DELETE non arriva (cambio dispositivo, offline).
    await env.SCHEDE.put(chiave, testo, { metadata, expirationTtl: 15552000 });
    return new Response(JSON.stringify({ ok: true }), { headers });
  }

  // --- Auto-cancellazione (nessuna chiave richiesta): un dispositivo può
  // cancellare SOLO una copia depositata da se stesso (stessa identità usata
  // per il deposito POST), mai quelle di altri dispositivi. Serve a togliere
  // dall'Archivio DM i personaggi eliminati dal giocatore sul proprio device,
  // così il DM non continua a vederli come se fossero ancora attivi. */
  if (request.method === 'DELETE' && !id) {
    let corpo;
    try { corpo = await request.json(); } catch { corpo = null; }
    const dispositivo = String(corpo?.dispositivo || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    const idPg = String(corpo?.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    if (!dispositivo || !idPg) {
      return new Response(JSON.stringify({ error: 'Campi "dispositivo" e "id" obbligatori' }), { status: 400, headers });
    }
    await env.SCHEDE.delete(`pg:${dispositivo}:${idPg}`);
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
    let testo = await env.SCHEDE.get(id);
    if (testo == null && id.includes('%')) {
      try { testo = await env.SCHEDE.get(decodeURIComponent(id)); } catch {}
    }
    if (testo == null && !id.startsWith('pg:')) {
      testo = await env.SCHEDE.get(`pg:${id}`);
    }
    if (testo == null) return new Response(JSON.stringify({ error: 'Scheda non trovata' }), { status: 404, headers });
    return new Response(testo, { headers });
  }

  if (request.method === 'DELETE' && id) {
    await env.SCHEDE.delete(id);
    if (id.includes('%')) {
      try { await env.SCHEDE.delete(decodeURIComponent(id)); } catch {}
    }
    return new Response(JSON.stringify({ ok: true }), { headers });
  }

  return new Response(JSON.stringify({ error: 'Metodo non supportato su /pg' }), { status: 405, headers });
}

export default {
  async fetch(request, env) {
    const reqOrigin = request.headers.get('Origin') || '';
    const configuredOrigin = env.ALLOW_ORIGIN || '*';
    const allowOrigin = configuredOrigin === '*' || !reqOrigin ? configuredOrigin : (reqOrigin === configuredOrigin || reqOrigin.startsWith('http://localhost') || reqOrigin.startsWith('http://127.0.0.1') ? reqOrigin : configuredOrigin);
    const corsHeaders = cors(allowOrigin);
    const headers = { ...corsHeaders, 'Content-Type': 'application/json' };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    // Rotte KV (tutto il resto resta la trascrizione PDF).
    const percorso = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
    if (percorso === '/room' || percorso.startsWith('/room/')) {
      return gestisciStanze(request, env, headers, percorso);
    }
    if (percorso === '/pg' || percorso.startsWith('/pg/')) {
      return gestisciArchivio(request, env, headers, percorso);
    }
    if (percorso.startsWith('/sync/')) {
      return gestisciSync(request, env, headers, percorso);
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Usa POST con { fileBase64, mediaType } o { pdfBase64 }' }), { status: 405, headers });
    }

    let corpo;
    try { corpo = await request.json(); } catch {
      return new Response(JSON.stringify({ error: 'Corpo JSON non valido' }), { status: 400, headers });
    }
    // Supporta sia nuovo formato { fileBase64, mediaType } (immagini/JPG/PNG/PDF) sia legacy { pdfBase64 }
    const base64 = String(corpo?.fileBase64 || corpo?.imageBase64 || corpo?.pdfBase64 || '').trim();
    const mediaType = String(corpo?.mediaType || (corpo?.pdfBase64 ? 'application/pdf' : '')).toLowerCase();
    if (!base64) {
      return new Response(JSON.stringify({ error: 'Campo fileBase64 (o pdfBase64) mancante' }), { status: 400, headers });
    }
    const isImage = mediaType.startsWith('image/');
    let erroreWorkersPerFallback = '';

    // 1) Se è un'immagine e Workers AI è disponibile → gratis, zero chiavi (10k req/giorno)
    // Prova una cascata di modelli vision EU-friendly. Fallback a Ollama e poi ad Anthropic.
    // - @cf/google/gemma-4-26b-a4b-it e @cf/meta/llama-4-scout non richiedono "agree" EU-block (5016)
    // - @cf/llava-hf/llava-1.5-13b-hf è stato rimosso (5007), @cf/llava-hf/llava-1.5-7b-hf resta come ultimo.
    // - @cf/meta/llama-3.2-11b-vision-instruct resta come ultima risorsa con auto-agree.
    if (isImage && env.AI) {
      const modelliVision = [];
      if (env.WORKERS_AI_MODEL) modelliVision.push(String(env.WORKERS_AI_MODEL).trim());
      modelliVision.push(
        '@cf/google/gemma-4-26b-a4b-it',
        '@cf/meta/llama-4-scout-17b-16e-instruct',
        '@cf/qwen/qwen3.8-27b',
        '@cf/mistralai/mistral-small-3.1-24b-instruct',
        '@cf/llava-hf/llava-1.5-7b-hf',
        '@cf/meta/llama-3.2-11b-vision-instruct',
      );
      // dedup mantenendo ordine
      const visti = new Set();
      const candidati = modelliVision.filter((m) => m && !visti.has(m) && visti.add(m));
      let ultimoErrore = '';
      let rispostaWorkersOk = false;
      let schedaEstratta = null;
      for (const modello of candidati) {
        // Costruisci payload adatti al modello
        const tentativiPayload = [];
        const dataUrl = `data:${mediaType || 'image/jpeg'};base64,${base64}`;
        if (modello.includes('llava')) {
          try {
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            tentativiPayload.push({ prompt: PROMPT, image: Array.from(bytes), max_tokens: 8192 });
          } catch {}
          // fallback: base64 puro (alcune versioni lo accettano)
          tentativiPayload.push({ prompt: PROMPT, image: dataUrl, max_tokens: 8192 });
        } else {
          // Modelli Image-Text-to-Text moderni: messages con image_url (OpenAI-compatibile)
          tentativiPayload.push({
            messages: [
              { role: 'system', content: 'Sei un assistente che trascrive schede D&D 5e. Rispondi solo con JSON.' },
              {
                role: 'user', content: [
                  { type: 'text', text: PROMPT },
                  { type: 'image_url', image_url: { url: dataUrl } },
                ],
              },
            ],
            max_tokens: 8192,
          });
          // Variante stile tutorial Llama (messages + image separata)
          tentativiPayload.push({
            messages: [
              { role: 'system', content: 'Sei un assistente che trascrive schede D&D 5e.' },
              { role: 'user', content: PROMPT },
            ],
            image: dataUrl,
            max_tokens: 8192,
          });
        }
        let payloadOk = false;
        for (const payload of tentativiPayload) {
          try {
            const aiResult = await env.AI.run(modello, payload);
            let testo = '';
            if (typeof aiResult === 'string') testo = aiResult;
            else if (aiResult && typeof aiResult.response === 'string') testo = aiResult.response;
            else if (aiResult && typeof aiResult.description === 'string') testo = aiResult.description;
            else if (aiResult && typeof aiResult.answer === 'string') testo = aiResult.answer;
            else if (aiResult && aiResult.choices && aiResult.choices[0]?.message?.content) testo = String(aiResult.choices[0].message.content);
            else testo = JSON.stringify(aiResult);
            const inizio = testo.indexOf('{');
            const fine = testo.lastIndexOf('}');
            if (inizio === -1 || fine === -1) throw new Error('Risposta Workers AI non in formato JSON');
            const scheda = JSON.parse(testo.slice(inizio, fine + 1));
            schedaEstratta = scheda;
            payloadOk = true;
            rispostaWorkersOk = true;
            break;
          } catch (err) {
            const msg = String(err?.message || err);
            ultimoErrore = msg;
            const isAgree = msg.includes('5016') || msg.toLowerCase().includes('agree');
            const isMissing = msg.includes('5007') || msg.includes('No such model') || msg.includes('not found');
            const isUnsupportedImage = msg.toLowerCase().includes('image') && (msg.toLowerCase().includes('support') || msg.toLowerCase().includes('format') || msg.toLowerCase().includes('input') || msg.toLowerCase().includes('unsupported'));
            // Auto-agree per Llama 3.2: una tantum per account, poi riprova lo stesso payload
            if (isAgree && modello.includes('llama-3.2')) {
              try { await env.AI.run(modello, { prompt: 'agree' }); } catch {}
              try {
                const aiRetry = await env.AI.run(modello, payload);
                let testo2 = '';
                if (typeof aiRetry === 'string') testo2 = aiRetry;
                else if (aiRetry && typeof aiRetry.response === 'string') testo2 = aiRetry.response;
                else if (aiRetry && typeof aiRetry.description === 'string') testo2 = aiRetry.description;
                else testo2 = JSON.stringify(aiRetry);
                const ini = testo2.indexOf('{');
                const fin = testo2.lastIndexOf('}');
                if (ini !== -1 && fin !== -1) {
                  schedaEstratta = JSON.parse(testo2.slice(ini, fin + 1));
                  payloadOk = true;
                  rispostaWorkersOk = true;
                  break;
                }
              } catch (e2) { ultimoErrore = String(e2?.message || e2); }
              // se anche il retry fallisce, passa al prossimo modello
              break;
            }
            // errore payload-formato O immagine non supportata: prova il prossimo payload dello stesso modello
            if ((!isMissing && !isAgree && !isUnsupportedImage) && tentativiPayload.indexOf(payload) < tentativiPayload.length - 1) {
              continue;
            }
            // modello mancante, immagine non supportata, o errore definitivo per questo modello → passa al prossimo modello
            break;
          }
        }
        if (payloadOk) break;
        // Se l'errore è "model missing / agree", continua con il prossimo candidato EU-friendly
        // Se è altro errore ma non abbiamo altri candidati con fallback, si continua comunque
        const isModelError = ultimoErrore.includes('5007') || ultimoErrore.includes('5016') || ultimoErrore.includes('No such model') || ultimoErrore.toLowerCase().includes('agree');
        if (!isModelError && ultimoErrore && !ultimoErrore.includes('non in formato JSON')) {
          // errore non recuperabile (es. payload troppo grande) ma se abbiamo Ollama/Anthropic lasciamo fallback
          // altrimenti prova comunque il prossimo modello
        }
        // continua al prossimo modello
      }
      if (rispostaWorkersOk && schedaEstratta) {
        return new Response(JSON.stringify(schedaEstratta), { headers });
      }
      const msg = ultimoErrore || 'Workers AI non disponibile';
      erroreWorkersPerFallback = msg;
      const haFallback = !!(env.OLLAMA_URL || env.ANTHROPIC_API_KEY);
      if (!haFallback) {
        return new Response(JSON.stringify({ error: `Workers AI fallita: ${msg}. Tutti i modelli tentati hanno fallito (gemma-4 / llama-4-scout / qwen / mistral / llava-7b / llama-3.2). Il modello @cf/llava-hf/llava-1.5-13b-hf è stato rimosso (5007) e @cf/meta/llama-3.2-11b-vision-instruct richiede "agree" e ha blocco EU (5016). Configura OLLAMA_URL (es. http://tuo-server:11434) con modello llava/qwen2-vl, oppure imposta ANTHROPIC_API_KEY come fallback. Se vuoi forzare un modello specifico, imposta WORKERS_AI_MODEL.` }), { status: 500, headers });
      }
      // altrimenti lascia proseguire verso Ollama / Anthropic (non ritornare errore qui)
    }

    // 1b) Ollama locale (immagini) — se configurato, prova prima di Anthropic. Gratis e privato.
    // Configura nel Worker: wrangler secret put OLLAMA_URL (es. https://ollama.tuodominio.com o http://IP:11434)
    // e opzionalmente OLLAMA_MODEL (default llava). Richiede modello vision (llava, qwen2-vl, llama3.2-vision).
    if (isImage && env.OLLAMA_URL) {
      try {
        const ollamaUrl = String(env.OLLAMA_URL).trim().replace(/\/+$/, '');
        const ollamaModel = String(env.OLLAMA_MODEL || 'llava').trim() || 'llava';
        const r = await fetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            messages: [{ role: 'user', content: PROMPT, images: [base64] }],
            stream: false,
          }),
        });
        if (!r.ok) {
          const txt = await r.text().catch(() => '');
          throw new Error(`Ollama ${r.status}: ${txt.slice(0, 300)}`);
        }
        const j = await r.json();
        let testo = j.message?.content || j.response || '';
        if (!testo) testo = JSON.stringify(j);
        const inizio = testo.indexOf('{');
        const fine = testo.lastIndexOf('}');
        if (inizio === -1 || fine === -1) {
          return new Response(JSON.stringify({ error: 'Risposta Ollama non in formato JSON', raw: String(testo).slice(0, 600) }), { status: 502, headers });
        }
        const scheda = JSON.parse(testo.slice(inizio, fine + 1));
        return new Response(JSON.stringify(scheda), { headers });
      } catch (err) {
        // Se Anthropic è disponibile, lascia proseguire verso il fallback; altrimenti ritorna errore Ollama
        if (!env.ANTHROPIC_API_KEY) {
          return new Response(JSON.stringify({ error: `Ollama fallita: ${err.message}. Verifica OLLAMA_URL, modello (${String(env.OLLAMA_MODEL || 'llava')}) e che Ollama sia raggiungibile dal Worker.` }), { status: 500, headers });
        }
      }
    }

    // 2) Fallback Anthropic (PDF e immagini se Workers AI non c'è o è PDF)
    if (!env.ANTHROPIC_API_KEY) {
      const dettaglio = isImage && erroreWorkersPerFallback ? ` (Workers AI ha fallito: ${erroreWorkersPerFallback.slice(0, 200)})` : '';
      const suggerimento = isImage
        ? `Workers AI non disponibile${dettaglio}: aggiungi [ai] binding="AI" in wrangler.toml e fai deploy, oppure configura OLLAMA_URL o ANTHROPIC_API_KEY. Se usi già Workers AI, aggiorna il Worker (cascata gemma-4/llama-4/qwen/mistral/llava-7b gestisce 5007/5016).`
        : 'ANTHROPIC_API_KEY non configurata e Workers AI disponibile solo per immagini (usa JPG/PNG/WebP)';
      return new Response(JSON.stringify({ error: suggerimento }), { status: 500, headers });
    }
    try {
      const contentBlock = isImage
        ? { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: base64 } }
        : { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } };
      const anthropicModel = String(env.ANTHROPIC_MODEL || 'claude-opus-4-8').trim() || 'claude-opus-4-8';
      const risposta = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: anthropicModel,
          max_tokens: 8192,
          messages: [{
            role: 'user',
            content: [
              contentBlock,
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
      const scheda = JSON.parse(testo.slice(inizio, fine + 1));
      return new Response(JSON.stringify(scheda), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: `Trascrizione fallita: ${err.message}` }), { status: 500, headers });
    }
  },
};
