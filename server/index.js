import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const PORT = process.env.PORT || 3001;

// Schema di trascrizione della scheda. Il campo "danno" degli attacchi è una
// espressione di dado 5e (NdM±K, anche più termini sommati, es. "1d10+1d6+2").
const PROMPT = `Sei un assistente che trascrive schede di personaggi di D&D 5a edizione.
Leggi il PDF allegato ed estrai i dati del personaggio.

Rispondi SOLO con un oggetto JSON valido, senza testo prima o dopo, con questo schema:
{
  "nome": "string",
  "classe": "string",
  "livello": number,
  "ca": number,
  "pfMax": number,
  "bonusCompetenza": number,
  "caratteristiche": {
    "forza": number, "destrezza": number, "costituzione": number,
    "intelligenza": number, "saggezza": number, "carisma": number
  },
  "attacchi": [
    {
      "nome": "string",
      "bonus": number,
      "danno": "string — espressione di dado tipo \\"2d6+3\\", \\"1d8\\" o \\"1d10+1d6+2\\"; stringa vuota se non indicato"
    }
  ]
}

Le caratteristiche sono i punteggi (1-30), non i modificatori. "bonus" è il bonus
per colpire dell'attacco. Se un dato non è presente nel PDF, usa un valore
ragionevole di default (caratteristiche 10, livello 1, attacchi []).`;

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
      max_tokens: 4096,
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
