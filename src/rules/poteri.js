// Poteri personalizzati: regole homebrew del tavolo (patti, benedizioni,
// maledizioni...) che non rientrano nelle classi/talenti ufficiali ma
// devono comunque contare sulla scheda. Funzioni pure, nessun React.
//
// Modello dati per personaggio (campo `poteri`, array, default []):
//   { id, nome, descrizione, attivo,
//     contatori: [{ nome, attuali, max }],       // max: null = nessun tetto
//     modificatori: [{ bersaglio, valore, fonte }] }
//
// Ogni contatore è collegato a una voce di `scheda.risorse` con reset
// 'manuale' (mai toccata da riposo breve/lungo, vedi risorseDopoRiposo):
// il collegamento è per id stabile (idRisorsaContatore), non per nome, così
// rinominare il contatore non rompe il legame. Il valore mostrato sulla
// scheda dei Poteri va SEMPRE letto dalla risorsa collegata quando esiste
// (vedi valoreContatore): così un +/- fatto da "Risorse di Classe" e uno
// fatto dalla scheda del Potere restano automaticamente allineati, senza
// dover toccare i molti punti del codice che già modificano `risorse`.

// Nota: questo file non importa nulla da scheda.js apposta (scheda.js importa
// bonusPotereBersaglio da qui per caTotale/iniziativaTotale/pfMassimiEffettivi:
// un import nell'altro verso creerebbe un ciclo tra i due moduli).

/** Bersagli supportati per i modificatori dei Poteri. */
export const BERSAGLI_MODIFICATORE_POTERE = [
  { chiave: 'velocita', label: 'Velocità', labelEn: 'Speed', unita: 'm' },
  { chiave: 'ca', label: 'CA', labelEn: 'AC', unita: '' },
  { chiave: 'iniziativa', label: 'Iniziativa', labelEn: 'Initiative', unita: '' },
  { chiave: 'pf_massimi', label: 'PF Massimi', labelEn: 'Max HP', unita: '' },
];

function idCasuale(prefisso) {
  return `${prefisso}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function nuovoPotere(dati = {}) {
  return {
    id: idCasuale('potere'),
    nome: '',
    descrizione: '',
    attivo: true,
    contatori: [],
    modificatori: [],
    ...dati,
  };
}

export function nuovoContatore(dati = {}) {
  return { nome: '', attuali: 0, max: null, ...dati };
}

export function nuovoModificatore(dati = {}) {
  return { bersaglio: BERSAGLI_MODIFICATORE_POTERE[0].chiave, valore: 0, fonte: '', ...dati };
}

/** Difende da dati mancanti/malformati (schede vecchie, import parziali). */
export function normalizzaPotere(p) {
  if (!p || typeof p !== 'object') return null;
  return {
    id: p.id || idCasuale('potere'),
    nome: String(p.nome || ''),
    descrizione: String(p.descrizione || ''),
    attivo: p.attivo !== false,
    contatori: Array.isArray(p.contatori)
      ? p.contatori.map((c) => ({
          nome: String(c?.nome || ''),
          attuali: Number(c?.attuali) || 0,
          max: (c?.max === null || c?.max === undefined || c?.max === '') ? null : Number(c.max),
        }))
      : [],
    modificatori: Array.isArray(p.modificatori)
      ? p.modificatori
          .filter((m) => m && BERSAGLI_MODIFICATORE_POTERE.some((b) => b.chiave === m.bersaglio))
          .map((m) => ({ bersaglio: m.bersaglio, valore: Number(m.valore) || 0, fonte: String(m.fonte || '') }))
      : [],
  };
}

export function normalizzaPoteri(lista) {
  if (!Array.isArray(lista)) return [];
  return lista.map(normalizzaPotere).filter(Boolean);
}

/** Id stabile della risorsa collegata a un contatore: sopravvive a rinomine del contatore. */
export function idRisorsaContatore(potereId, indiceContatore) {
  return `potere-${potereId}-${indiceContatore}`;
}

/** Tutti i modificatori dei Poteri ATTIVI (non disattivati), appiattiti con la fonte. */
export function modificatoriPoteriAttivi(scheda) {
  return normalizzaPoteri(scheda?.poteri)
    .filter((p) => p.attivo)
    .flatMap((p) => p.modificatori.map((m) => ({ ...m, fonte: m.fonte || p.nome || '' })));
}

/** Somma dei modificatori attivi per un bersaglio (es. 'ca', 'velocita', 'iniziativa', 'pf_massimi'). */
export function bonusPotereBersaglio(scheda, bersaglio) {
  return modificatoriPoteriAttivi(scheda)
    .filter((m) => m.bersaglio === bersaglio)
    .reduce((tot, m) => tot + (Number(m.valore) || 0), 0);
}

// iniziativaTotale e pfMassimiEffettivi vivono in scheda.js: usano
// punteggioCaratteristica, che è definita lì (vedi nota in cima al file).

/**
 * Valore attuale/massimo "vero" di un contatore: se esiste già una risorsa
 * collegata in `scheda.risorse`, i suoi numeri vincono (sono la fonte più
 * recente, es. dopo un +/- fatto da Risorse di Classe); altrimenti si usano
 * quelli scritti sul contatore stesso (prima sincronizzazione, o export che
 * ha perso le risorse).
 */
export function valoreContatore(scheda, potereId, indiceContatore, contatore) {
  const idRis = idRisorsaContatore(potereId, indiceContatore);
  const risorsa = (Array.isArray(scheda?.risorse) ? scheda.risorse : []).find((r) => r?.id === idRis);
  if (risorsa) return { attuali: Number(risorsa.attuali) || 0, max: risorsa.max === null || risorsa.max === undefined ? null : Number(risorsa.max) };
  return { attuali: Number(contatore?.attuali) || 0, max: contatore?.max === null || contatore?.max === undefined ? null : Number(contatore.max) };
}

/**
 * Ricalcola `scheda.risorse` in base ai Poteri correnti: aggiunge/aggiorna
 * (nome, max, reset: 'manuale') la risorsa collegata a ogni contatore di ogni
 * potere ATTIVO, preservandone gli `attuali` se la risorsa esiste già
 * (rispetta le modifiche fatte da Risorse di Classe); rimuove le risorse
 * collegate a poteri disattivati/eliminati o a contatori non più presenti,
 * cosi' un potere spento o cancellato smette di comparire ovunque.
 * Va chiamata insieme a ogni `aggiorna({ poteri: ... })`, nello stesso patch.
 */
export function sincronizzaRisorsePoteri(poteri, risorseAttuali) {
  const risorseBase = Array.isArray(risorseAttuali) ? risorseAttuali : [];
  const listaPoteri = normalizzaPoteri(poteri);
  const mappaEsistenti = new Map(risorseBase.map((r) => [r?.id, r]));

  const risorsePoteri = [];
  for (const p of listaPoteri) {
    if (!p.attivo) continue;
    p.contatori.forEach((c, i) => {
      const id = idRisorsaContatore(p.id, i);
      const esistente = mappaEsistenti.get(id);
      risorsePoteri.push({
        id,
        nome: c.nome || p.nome || 'Potere',
        max: c.max,
        attuali: esistente ? Number(esistente.attuali) || 0 : (Number(c.attuali) || 0),
        reset: 'manuale',
      });
    });
  }

  // Le risorse "normali" (non legate a un potere) restano intatte; quelle
  // legate a un potere che non esiste più (o è stato disattivato/il
  // contatore rimosso) vengono tolte, sostituite dall'elenco appena
  // ricostruito (`risorsePoteri`) che riflette solo i poteri attivi correnti.
  const risorseNonPotere = risorseBase.filter((r) => !String(r?.id || '').startsWith('potere-'));
  return [...risorseNonPotere, ...risorsePoteri];
}
