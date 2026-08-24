// Bestiario per la Forma Selvatica del Druido. Valori dalla SRD 5.1, con le
// velocità convertite in metri come nel resto della scheda (30 ft = 9 m).
// L'elenco è volutamente curato e non esaustivo: sono le bestie che al tavolo
// si usano davvero, coprendo i gradi di sfida che il Druido può assumere.

/** Velocità in metri. `terra` è sempre presente; le altre solo se la bestia ce l'ha. */
export const BESTIE = [
  {
    nome: 'Gufo', nomeEn: 'Owl', gs: '0', gsNum: 0,
    taglia: 'Minuscola', ca: 11, pf: 1, pfFormula: '1d4 − 1',
    velocita: { terra: 1.5, volo: 18 },
    car: { forza: 3, destrezza: 13, costituzione: 8, intelligenza: 2, saggezza: 12, carisma: 7 },
    abilita: 'Percezione +3, Furtività +3',
    sensi: 'Scurovisione 36 m · Percezione passiva 13',
    tratti: [
      'Volo radente: non provoca attacchi di opportunità quando vola fuori dalla portata di un nemico.',
      'Udito e vista acuti: vantaggio alle prove di Percezione basate su udito o vista.',
    ],
    azioni: ['Artigli: +3 al tiro per colpire, 1 danno tagliente.'],
    note: 'Fragilissimo in combattimento, ma è la forma migliore per esplorare e spiare.',
  },
  {
    nome: 'Ratto', nomeEn: 'Rat', gs: '0', gsNum: 0,
    taglia: 'Minuscola', ca: 10, pf: 1, pfFormula: '1d4 − 1',
    velocita: { terra: 6 },
    car: { forza: 2, destrezza: 11, costituzione: 9, intelligenza: 2, saggezza: 10, carisma: 4 },
    abilita: '—',
    sensi: 'Scurovisione 9 m · Percezione passiva 10',
    tratti: ['Olfatto acuto: vantaggio alle prove di Percezione basate sull’olfatto.'],
    azioni: ['Morso: +0 al tiro per colpire, 1 danno perforante.'],
    note: 'Utile solo per passare inosservato o infilarsi in spazi minuscoli.',
  },
  {
    nome: 'Mastino', nomeEn: 'Mastiff', gs: '1/8', gsNum: 0.125,
    taglia: 'Media', ca: 12, pf: 5, pfFormula: '1d8 + 1',
    velocita: { terra: 12 },
    car: { forza: 13, destrezza: 14, costituzione: 12, intelligenza: 3, saggezza: 12, carisma: 7 },
    abilita: 'Percezione +3',
    sensi: 'Percezione passiva 13',
    tratti: ['Udito e olfatto acuti: vantaggio alle prove di Percezione basate su udito o olfatto.'],
    azioni: ['Morso: +3 al tiro per colpire, 1d6+1 danni perforanti. Se il bersaglio è una creatura, deve superare un TS su Forza (CD 11) o cadere prono.'],
  },
  {
    nome: 'Lupo', nomeEn: 'Wolf', gs: '1/4', gsNum: 0.25,
    taglia: 'Media', ca: 13, pf: 11, pfFormula: '2d8 + 2',
    velocita: { terra: 12 },
    car: { forza: 12, destrezza: 15, costituzione: 12, intelligenza: 3, saggezza: 12, carisma: 6 },
    abilita: 'Percezione +3, Furtività +4',
    sensi: 'Percezione passiva 13',
    tratti: [
      'Udito e olfatto acuti: vantaggio alle prove di Percezione basate su udito o olfatto.',
      'Tattiche di branco: vantaggio al tiro per colpire se un alleato è entro 1,5 m dal bersaglio.',
    ],
    azioni: ['Morso: +4 al tiro per colpire, 2d4+2 danni perforanti. Se il bersaglio è una creatura, deve superare un TS su Forza (CD 11) o cadere prono.'],
    note: 'Con le Tattiche di branco è la forma più efficace del suo grado in mischia.',
  },
  {
    nome: 'Cinghiale', nomeEn: 'Boar', gs: '1/4', gsNum: 0.25,
    taglia: 'Media', ca: 11, pf: 11, pfFormula: '2d8 + 2',
    velocita: { terra: 12 },
    car: { forza: 13, destrezza: 11, costituzione: 12, intelligenza: 2, saggezza: 9, carisma: 5 },
    abilita: '—',
    sensi: 'Percezione passiva 9',
    tratti: [
      'Carica: se si muove di almeno 6 m in linea retta verso il bersaglio e lo colpisce con una zanna nello stesso turno, infligge 1d6 danni taglienti extra; con un TS su Forza (CD 11) fallito il bersaglio cade prono.',
      'Accanimento (ricarica dopo un riposo breve o lungo): se subisce 7 danni o meno che lo porterebbero a 0 PF, resta invece a 1 PF.',
    ],
    azioni: ['Zanna: +3 al tiro per colpire, 1d6+1 danni taglienti.'],
  },
  {
    nome: 'Pantera', nomeEn: 'Panther', gs: '1/4', gsNum: 0.25,
    taglia: 'Media', ca: 12, pf: 13, pfFormula: '3d8',
    velocita: { terra: 15, scalata: 12 },
    car: { forza: 14, destrezza: 15, costituzione: 10, intelligenza: 3, saggezza: 14, carisma: 7 },
    abilita: 'Percezione +4, Furtività +6',
    sensi: 'Percezione passiva 14',
    tratti: [
      'Olfatto acuto: vantaggio alle prove di Percezione basate sull’olfatto.',
      'Balzo: se si muove di almeno 6 m verso una creatura e la colpisce con un artiglio, questa deve superare un TS su Forza (CD 12) o cadere prona; se cade, la pantera può fare subito un attacco di morso come azione bonus.',
    ],
    azioni: [
      'Morso: +4 al tiro per colpire, 1d6+2 danni perforanti.',
      'Artiglio: +4 al tiro per colpire, 1d4+2 danni taglienti.',
    ],
    note: 'Furtività +6 e scalata: la forma migliore per muoversi non vista.',
  },
  {
    nome: 'Serpente costrittore', nomeEn: 'Constrictor Snake', gs: '1/4', gsNum: 0.25,
    taglia: 'Grande', ca: 12, pf: 13, pfFormula: '2d10 + 2',
    velocita: { terra: 9, nuoto: 9 },
    car: { forza: 15, destrezza: 14, costituzione: 12, intelligenza: 1, saggezza: 10, carisma: 3 },
    abilita: '—',
    sensi: 'Percezione cieca 3 m · Percezione passiva 10',
    tratti: [],
    azioni: [
      'Morso: +4 al tiro per colpire, 1d6+2 danni perforanti.',
      'Costrizione: +4 al tiro per colpire, 1d8+2 danni contundenti. Il bersaglio è afferrato (fuga CD 14) e trattenuto finché dura la presa.',
    ],
    note: 'Ha velocità di nuoto: dal 4° livello in poi è utile in acqua.',
  },
  {
    nome: 'Orso nero', nomeEn: 'Black Bear', gs: '1/2', gsNum: 0.5,
    taglia: 'Media', ca: 11, pf: 19, pfFormula: '3d8 + 6',
    velocita: { terra: 12, scalata: 9 },
    car: { forza: 15, destrezza: 10, costituzione: 14, intelligenza: 2, saggezza: 12, carisma: 7 },
    abilita: 'Percezione +3',
    sensi: 'Percezione passiva 13',
    tratti: ['Olfatto acuto: vantaggio alle prove di Percezione basate sull’olfatto.'],
    azioni: [
      'Attacco multiplo: un morso e un attacco di artigli.',
      'Morso: +3 al tiro per colpire, 1d6+2 danni perforanti.',
      'Artigli: +3 al tiro per colpire, 2d4+2 danni taglienti.',
    ],
  },
  {
    nome: 'Coccodrillo', nomeEn: 'Crocodile', gs: '1/2', gsNum: 0.5,
    taglia: 'Grande', ca: 12, pf: 19, pfFormula: '3d10 + 3',
    velocita: { terra: 6, nuoto: 9 },
    car: { forza: 15, destrezza: 10, costituzione: 13, intelligenza: 2, saggezza: 10, carisma: 5 },
    abilita: 'Furtività +2',
    sensi: 'Percezione passiva 10',
    tratti: ['Trattenere il respiro: può trattenere il respiro per 15 minuti.'],
    azioni: ['Morso: +4 al tiro per colpire, 1d10+2 danni perforanti. Il bersaglio è afferrato (fuga CD 12) e trattenuto finché dura la presa.'],
  },
  {
    nome: 'Orso bruno', nomeEn: 'Brown Bear', gs: '1', gsNum: 1,
    taglia: 'Grande', ca: 11, pf: 34, pfFormula: '4d10 + 12',
    velocita: { terra: 12, scalata: 9 },
    car: { forza: 19, destrezza: 10, costituzione: 16, intelligenza: 2, saggezza: 13, carisma: 7 },
    abilita: 'Percezione +3',
    sensi: 'Percezione passiva 13',
    tratti: ['Olfatto acuto: vantaggio alle prove di Percezione basate sull’olfatto.'],
    azioni: [
      'Attacco multiplo: un morso e un attacco di artigli.',
      'Morso: +5 al tiro per colpire, 1d8+4 danni perforanti.',
      'Artigli: +5 al tiro per colpire, 2d6+4 danni taglienti.',
    ],
    note: '34 PF e Forza 19: la scelta classica per incassare colpi in mischia.',
  },
  {
    nome: 'Lupo crudele', nomeEn: 'Dire Wolf', gs: '1', gsNum: 1,
    taglia: 'Grande', ca: 14, pf: 37, pfFormula: '5d10 + 10',
    velocita: { terra: 15 },
    car: { forza: 17, destrezza: 15, costituzione: 15, intelligenza: 3, saggezza: 12, carisma: 7 },
    abilita: 'Percezione +3, Furtività +4',
    sensi: 'Percezione passiva 13',
    tratti: [
      'Udito e olfatto acuti: vantaggio alle prove di Percezione basate su udito o olfatto.',
      'Tattiche di branco: vantaggio al tiro per colpire se un alleato è entro 1,5 m dal bersaglio.',
    ],
    azioni: ['Morso: +5 al tiro per colpire, 2d6+3 danni perforanti. Se il bersaglio è una creatura, deve superare un TS su Forza (CD 13) o cadere prono.'],
    note: 'Veloce, resistente e con Tattiche di branco: spesso la forma migliore al 8° livello.',
  },
  {
    nome: 'Ragno gigante', nomeEn: 'Giant Spider', gs: '1', gsNum: 1,
    taglia: 'Grande', ca: 14, pf: 26, pfFormula: '4d10 + 4',
    velocita: { terra: 9, scalata: 9 },
    car: { forza: 14, destrezza: 16, costituzione: 12, intelligenza: 2, saggezza: 11, carisma: 4 },
    abilita: 'Furtività +7',
    sensi: 'Scurovisione 18 m · Percezione cieca 3 m · Percezione passiva 10',
    tratti: [
      'Scalare ragnesco: può scalare superfici difficili, anche a testa in giù sui soffitti, senza prove di caratteristica.',
      'Percezione della ragnatela: conosce la posizione esatta di ogni creatura a contatto con la stessa ragnatela.',
      'Camminare sulle ragnatele: ignora le limitazioni di movimento causate dalle ragnatele.',
    ],
    azioni: [
      'Morso: +5 al tiro per colpire, 1d8+3 danni perforanti; TS su Costituzione CD 11 o 2d8 danni da veleno (metà con successo). Se i danni da veleno riducono il bersaglio a 0 PF, questi resta stabile ma paralizzato per 1 ora.',
      'Ragnatela (ricarica 5-6): gittata 9/18 m, TS su Destrezza CD 12 o restare trattenuto; si libera con una prova di Forza CD 12.',
    ],
  },
  {
    nome: 'Iena gigante', nomeEn: 'Giant Hyena', gs: '1', gsNum: 1,
    taglia: 'Grande', ca: 12, pf: 45, pfFormula: '6d10 + 12',
    velocita: { terra: 15 },
    car: { forza: 16, destrezza: 14, costituzione: 14, intelligenza: 2, saggezza: 12, carisma: 7 },
    abilita: 'Percezione +3',
    sensi: 'Percezione passiva 13',
    tratti: ['Furia omicida: quando riduce una creatura a 0 PF con un attacco in mischia nel proprio turno, può fare un attacco di morso come azione bonus.'],
    azioni: ['Morso: +5 al tiro per colpire, 2d6+3 danni perforanti.'],
    note: '45 PF: è la bestia di grado 1 con più punti ferita.',
  },
];

/** Famigli speciali / avanzati (Patto della Catena Warlock). */
export const FAMIGLI = [
  {
    nome: 'Pseudodrago (Famiglio)', nomeEn: 'Pseudodragon (Familiar)', tipo: 'Drago (Patto della Catena)',
    taglia: 'Minuscola', ca: 13, pf: 7, pfFormula: '2d4 + 2',
    velocita: { terra: 4.5, volo: 18 },
    car: { forza: 6, destrezza: 15, costituzione: 13, intelligenza: 10, saggezza: 12, carisma: 10 },
    abilita: 'Percezione +3, Furtività +4',
    sensi: 'Vista cieca 3 m · Scurovisione 18 m · Percezione passiva 13',
    tratti: [
      'Resistenza alla magia: vantaggio ai tiri salvezza contro incantesimi ed effetti magici.',
      'Sensi acuti: vantaggio alle prove di Percezione su vista, udito e olfatto.',
      'Telepatia: comunica telepaticamente con qualsiasi creatura entro 30 m che parli una lingua.',
    ],
    azioni: [
      'Morso: +4 al tiro per colpire, 1d4+2 danni perforanti.',
      'Pungiglione: +4 al tiro per colpire, 1d4+2 danni perforanti + TS Costituzione (CD 11) o avvelenato per 1 ora (se fallisce di 5+, cade privo di sensi).',
    ],
    note: 'Famiglio avanzato del Patto della Catena (Warlock).',
  },
  {
    nome: 'Imp (Famiglio)', nomeEn: 'Imp (Familiar)', tipo: 'Immondo (Diavolo)',
    taglia: 'Minuscola', ca: 13, pf: 10, pfFormula: '3d4 + 3',
    velocita: { terra: 6, volo: 12 },
    car: { forza: 6, destrezza: 17, costituzione: 13, intelligenza: 11, saggezza: 12, carisma: 14 },
    abilita: 'Inganno +4, Intuizione +3, Furtività +5',
    sensi: 'Vista del diavolo 36 m (vede anche nel buio magico) · Percezione passiva 11',
    tratti: [
      'Resistenza alla magia: vantaggio ai tiri salvezza contro la magia.',
      'Resistenze: freddo, danni contundenti/perforanti/taglienti da armi non argentate; Immunità al fuoco e veleno.',
      'Forma mutevole: può trasformarsi come azione in un topo, corvo o ragno.',
    ],
    azioni: [
      'Pungiglione: +5 al tiro per colpire, 1d4+3 danni perforanti + 3d6 danni da veleno (TS Costituzione CD 11 dimezza).',
      'Invisibilità: diventa invisibile finché non attacca o si concentra.',
    ],
    note: 'Famiglio diabolico estremamente resistente e invisibile a comando.',
  },
  {
    nome: 'Folletto Quasit (Famiglio)', nomeEn: 'Quasit (Familiar)', tipo: 'Immondo (Demone)',
    taglia: 'Minuscola', ca: 13, pf: 7, pfFormula: '3d4',
    velocita: { terra: 12 },
    car: { forza: 5, destrezza: 17, costituzione: 10, intelligenza: 7, saggezza: 10, carisma: 10 },
    abilita: 'Furtività +5',
    sensi: 'Scurovisione 36 m · Percezione passiva 10',
    tratti: [
      'Resistenza alla magia: vantaggio ai tiri salvezza contro incantesimi.',
      'Resistenze: freddo, fuoco, fulmine; immunità al veleno.',
      'Forma mutevole: può trasformarsi in pipistrello, millepiedi o rospo.',
    ],
    azioni: [
      'Artigli: +4 al tiro per colpire, 1d4+3 danni taglienti + TS Costituzione (CD 10) o 2d4 danni da veleno e avvelenato per 1 minuto.',
      'Spavento (1/Giorno): creatura entro 6 m deve superare TS Saggezza (CD 10) o essere spaventata per 1 minuto.',
      'Invisibilità: diventa invisibile a volontà.',
    ],
    note: 'Famiglio caotico con spavento magico e invisibilità.',
  },
];

/** Evocazioni & Creature Spiritiche comuni (Evoca Elementale, Destriero Fantomatico, Guardiano Spirituale...). */
export const EVOCAZIONI = [
  {
    nome: 'Elementale del Fuoco', nomeEn: 'Fire Elemental', tipo: 'Elementale (Evocazione)',
    taglia: 'Grande', ca: 13, pf: 102, pfFormula: '12d10 + 36',
    velocita: { terra: 15 },
    car: { forza: 10, destrezza: 17, costituzione: 16, intelligenza: 6, saggezza: 10, carisma: 7 },
    abilita: '—',
    sensi: 'Scurovisione 18 m · Percezione passiva 10',
    tratti: [
      'Forma di fuoco: può muoversi attraverso uno spazio stretto fino a 2,5 cm. Entrare nello spazio di una creatura le infligge 1d10 danni da fuoco.',
      'Illuminazione: emette luce intensa per 9 m e fioca per altri 9 m.',
      'Suscettibilità all’acqua: per ogni 1,5 m percorsi in acqua subisce 1 danno da freddo.',
    ],
    azioni: [
      'Attacco multiplo: due attacchi di tocco.',
      'Tocco: +6 al tiro per colpire, 2d6+3 danni da fuoco; il bersaglio prende fuoco (1d10 a inizio turno finché non spende un’azione per spegnersi).',
    ],
    note: 'Evocato con l’incantesimo Evoca Elementale (5° livello).',
  },
  {
    nome: 'Spirito Guardiano Celato', nomeEn: 'Spirit Guardian', tipo: 'Celestiale / Fatato / Immondo',
    taglia: 'Media', ca: 15, pf: 40, pfFormula: '—',
    velocita: { terra: 9, volo: 9 },
    car: { forza: 16, destrezza: 14, costituzione: 14, intelligenza: 10, saggezza: 14, carisma: 10 },
    abilita: 'Percezione +5',
    sensi: 'Scurovisione 18 m · Percezione passiva 15',
    tratti: [
      'Aura spirituale: dimezza la velocità dei nemici entro 4,5 m.',
      'Danno radioso/necrotico: quando un nemico entra nell’area per la prima volta subisce 3d8 danni (TS Saggezza dimezza).',
    ],
    azioni: ['Colpo Spirituale: +6 al tiro per colpire, 2d8+3 danni radiosi o necrotici.'],
    note: 'Invocato tramite Spiriti Guardiani (Chierico 3° livello).',
  },
];

/**
 * Limiti della Forma Selvatica (regole 2014). Il Druido "standard" segue la
 * tabella Forme Bestiali; il Circolo della Luna ignora la colonna del grado di
 * sfida ma resta soggetto agli stessi limiti di movimento.
 * Restituisce { gsMax, volo, nuoto } dove volo/nuoto dicono se sono ammessi.
 */
export function limitiFormaSelvatica(livello, sottoclasse = '') {
  const L = Math.max(1, Number(livello) || 1);
  if (L < 2) return null; // la Forma Selvatica arriva al 2° livello
  const luna = /luna|moon/i.test(sottoclasse);
  const gsMax = luna
    ? (L >= 6 ? Math.floor(L / 3) : 1)
    : (L >= 8 ? 1 : L >= 4 ? 0.5 : 0.25);
  return { gsMax, nuoto: L >= 4, volo: L >= 8 };
}

/** Bestie che il Druido può assumere al livello indicato, dalla più forte. */
export function bestieDisponibili(livello, sottoclasse = '', bestie = BESTIE) {
  const limiti = limitiFormaSelvatica(livello, sottoclasse);
  if (!limiti) return [];
  return bestie
    .filter((b) => b.gsNum <= limiti.gsMax)
    .filter((b) => (b.velocita.volo ? limiti.volo : true))
    .filter((b) => (b.velocita.nuoto ? limiti.nuoto : true))
    .sort((a, b) => b.gsNum - a.gsNum || a.nome.localeCompare(b.nome, 'it'));
}
