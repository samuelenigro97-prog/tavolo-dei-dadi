// Novità per versione, in due lingue. Poche righe per versione: si leggono
// dal pannello Avvisi, non sono note di rilascio complete.
// La più recente va SEMPRE in cima: il pannello mostra le prime voci così
// come sono ordinate qui.

export const NOVITA = [
  {
    versione: '3.6.0',
    voci: {
      it: [
        'Nuovo pulsante 🔔 Avvisi: promemoria e novità in un pannello, con un puntino che avvisa quando c\u2019è qualcosa da vedere.',
        'Spariti i due riquadri a tutta larghezza in cima alla pagina.',
        'Il titolo si è spostato al centro della barra dei dadi: una riga in meno.',
      ],
      en: [
        'New 🔔 Alerts button: reminders and news in one panel, with a dot when something needs your attention.',
        'The two full-width banners at the top of the page are gone.',
        'The title moved into the middle of the dice bar: one row less.',
      ],
    },
  },
  {
    versione: '3.5.3',
    voci: {
      it: [
        'Titolo leggibile anche sopra la foto del luogo, in tema chiaro.',
      ],
      en: [
        'The title stays readable over the location photo in light theme.',
      ],
    },
  },
  {
    versione: '3.5.0',
    voci: {
      it: [
        'Le condizioni ora spiegano cosa comportano, sommate fra loro.',
        'Diario di sessione per ogni personaggio, con voci datate.',
        'Fonte di Magia: converti slot in Punti Stregoneria e viceversa.',
        'Stampa della scheda o salvataggio in PDF dal Menu.',
      ],
      en: [
        'Conditions now explain what they do, combined together.',
        'Session journal for each character, with dated entries.',
        'Font of Magic: convert spell slots into Sorcery Points and back.',
        'Print the sheet or save it as PDF from the Menu.',
      ],
    },
  },
  {
    versione: '3.2.0',
    voci: {
      it: [
        'Corretto: il riposo ricarica le risorse di classe invece di azzerarle.',
      ],
      en: [
        'Fixed: resting now refills class resources instead of emptying them.',
      ],
    },
  },
  {
    versione: '3.0.0',
    voci: {
      it: [
        'Archivio DM: un personaggio per riga, le copie vecchie si aprono a parte.',
        'Sincronizzazione fra dispositivi con un codice, senza account.',
        'Corretto: le immagini non spariscono più quando la rete è lenta.',
      ],
      en: [
        'DM archive: one character per row, older copies open separately.',
        'Sync between devices with a code, no account needed.',
        'Fixed: portraits no longer disappear when the network is slow.',
      ],
    },
  },
];

/** Le novità da mostrare: le più recenti, al massimo `quante` versioni. */
export function novitaRecenti(quante = 3) {
  return NOVITA.slice(0, quante);
}

/** Versione più recente presente nell'elenco (per capire se ci sono novità non lette). */
export function ultimaVersioneNovita() {
  return NOVITA[0]?.versione || '';
}
