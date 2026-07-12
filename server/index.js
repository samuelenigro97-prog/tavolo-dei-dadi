import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const PORT = process.env.PORT || 3001;

// Schema di trascrizione della scheda. Il campo "danno" degli attacchi è una
// espressione di dado 5e (NdM±K, anche più termini sommati, es. "1d10+1d6+2").
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
  "pfMax": number,
  "dadiVita": "string — es. \\"4d6\\"",
  "velocita": number,
  "taglia": "string — es. \\"Media\\"",
  "bonusCompetenza": number,
  "caratteristiche": {
    "forza": number, "destrezza": number, "costituzione": number,
    "intelligenza": number, "saggezza": number, "carisma": number
  },
  "tiriSalvezza": {
    "forza": boolean, "destrezza": boolean, "costituzione": boolean,
    "intelligenza": boolean, "saggezza": boolean, "carisma": boolean
  },
  "abilita": {
    "acrobazia": 0 | 1 | 2, "addestrareAnimali": 0 | 1 | 2, "arcano": 0 | 1 | 2,
    "atletica": 0 | 1 | 2, "furtivita": 0 | 1 | 2, "indagare": 0 | 1 | 2,
    "inganno": 0 | 1 | 2, "intimidire": 0 | 1 | 2, "intrattenere": 0 | 1 | 2,
    "intuizione": 0 | 1 | 2, "medicina": 0 | 1 | 2, "natura": 0 | 1 | 2,
    "percezione": 0 | 1 | 2, "persuasione": 0 | 1 | 2, "rapiditaDiMano": 0 | 1 | 2,
    "religione": 0 | 1 | 2, "sopravvivenza": 0 | 1 | 2, "storia": 0 | 1 | 2
  },
  "attacchi": [
    {
      "nome": "string",
      "bonus": number,
      "danno": "string — espressione di dado tipo \\"2d6+3\\", \\"1d8\\" o \\"1d10+1d6+2\\"; stringa vuota se non indicato",
      "tipoDanno": "string — es. \\"Perforante\\"",
      "note": "string"
    }
  ],
  "incantatore": { "caratteristica": "forza|destrezza|costituzione|intelligenza|saggezza|carisma oppure stringa vuota se non incantatore" }
}

Regole:
- Le caratteristiche sono i punteggi (1-30), non i modificatori.
- "tiriSalvezza": true solo se il personaggio è COMPETENTE nel tiro salvezza
  (pallino pieno sulla scheda).
- "abilita": 0 = nessuna competenza (pallino vuoto), 1 = competenza (pallino
  pieno), 2 = maestria/expertise (doppio pallino o bonus doppio).
- "bonus" è il bonus per colpire dell'attacco; le voci senza bonus e danno
  (es. un focus arcano) vanno omesse dagli attacchi.
- Se un dato non è presente nel PDF, usa un valore ragionevole di default
  (caratteristiche 10, livello 1, attacchi [], competenze false/0).`;

const app = express();
app.use(cors());
app.use(express.json({ limit: '40mb' }));

app.post('/api/transcribe', async (req, res) => {
  const { pdfBase64 } = req.body || {};
  if (!pdfBase64 || typeof pdfBase64 !== 'string') {
    return res.status(400).json({ error: 'Campo pdfBase64 mancante' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY non configurata sul server (vedi .env.example)',
    });
  }

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    });

    const testo = message.content.find((b) => b.type === 'text')?.text ?? '';
    const inizio = testo.indexOf('{');
    const fine = testo.lastIndexOf('}');
    if (inizio === -1 || fine === -1) {
      return res.status(502).json({ error: 'Risposta del modello non in formato JSON' });
    }
    res.json(JSON.parse(testo.slice(inizio, fine + 1)));
  } catch (err) {
    console.error('Trascrizione fallita:', err);
    res.status(500).json({ error: `Trascrizione fallita: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server Tavolo dei Dadi in ascolto su http://localhost:${PORT}`);
});
