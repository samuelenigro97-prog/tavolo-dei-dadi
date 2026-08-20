// Effetti meccanici delle condizioni 5e (uguali nella 5.0 e nella 5.5 salvo
// dettagli minori). Ogni voce ha il testo per esteso nelle due lingue e alcuni
// FLAG strutturati: servono al riepilogo automatico ("hai svantaggio ai tiri
// per colpire perché sei Avvelenato e Prono"), non solo a mostrare una nota.
//
// Flag disponibili:
//   svantaggioAttacchi   – i TUOI tiri per colpire hanno svantaggio
//   vantaggioControDiTe  – chi attacca TE ha vantaggio
//   svantaggioControDiTe – chi attacca TE ha svantaggio
//   svantaggioProve      – svantaggio alle prove di caratteristica
//   velocitaZero         – velocità ridotta a 0
//   incapacitato         – niente azioni né reazioni
//   fallisciTsForzaDes   – fallisci automaticamente i TS su Forza e Destrezza
//   criticoRavvicinato   – i colpi entro 1,5 m contro di te sono critici

export const EFFETTI_CONDIZIONI = {
  'Accecato': {
    it: 'Non vedi e fallisci ogni prova che richieda la vista. I tuoi tiri per colpire hanno svantaggio, quelli contro di te hanno vantaggio.',
    en: "You can't see and fail any check requiring sight. Your attack rolls have disadvantage, attacks against you have advantage.",
    svantaggioAttacchi: true, vantaggioControDiTe: true,
  },
  'Affascinato': {
    it: 'Non puoi attaccare chi ti ha affascinato né bersagliarlo con effetti dannosi. Chi ti ha affascinato ha vantaggio alle prove per interagire socialmente con te.',
    en: "You can't attack the charmer or target them with harmful effects. The charmer has advantage on social checks with you.",
  },
  'Afferrato': {
    it: 'La tua velocità diventa 0 e non puoi beneficiare di bonus alla velocità.',
    en: 'Your speed becomes 0 and you gain no benefit from speed bonuses.',
    velocitaZero: true,
  },
  'Assordato': {
    it: 'Non senti e fallisci ogni prova che richieda l’udito.',
    en: "You can't hear and fail any check requiring hearing.",
  },
  'Avvelenato': {
    it: 'Svantaggio ai tiri per colpire e alle prove di caratteristica.',
    en: 'Disadvantage on attack rolls and ability checks.',
    svantaggioAttacchi: true, svantaggioProve: true,
  },
  'Incapacitato': {
    it: 'Non puoi compiere azioni né reazioni.',
    en: "You can't take actions or reactions.",
    incapacitato: true,
  },
  'Invisibile': {
    it: 'Non sei visibile senza magia o sensi speciali: per nasconderti conti come pesantemente oscurato. I tuoi tiri per colpire hanno vantaggio, quelli contro di te svantaggio.',
    en: 'You are unseen without magic or a special sense; you count as heavily obscured for hiding. Your attack rolls have advantage, attacks against you have disadvantage.',
    svantaggioControDiTe: true,
  },
  'Paralizzato': {
    it: 'Sei incapacitato, non puoi muoverti né parlare. Fallisci i tiri salvezza su Forza e Destrezza. Gli attacchi contro di te hanno vantaggio e ogni colpo entro 1,5 m è un critico.',
    en: 'You are incapacitated and can\'t move or speak. You fail Strength and Dexterity saves. Attacks against you have advantage, and any hit within 5 ft is a critical.',
    incapacitato: true, vantaggioControDiTe: true, fallisciTsForzaDes: true, criticoRavvicinato: true,
  },
  'Pietrificato': {
    it: 'Sei trasformato in sostanza solida, incapacitato, inconsapevole di ciò che ti circonda. Fallisci i tiri salvezza su Forza e Destrezza, gli attacchi contro di te hanno vantaggio. Hai resistenza a tutti i danni e sei immune a veleno e malattia.',
    en: 'You are turned to solid substance, incapacitated and unaware of your surroundings. You fail Strength and Dexterity saves, attacks against you have advantage. You have resistance to all damage and are immune to poison and disease.',
    incapacitato: true, vantaggioControDiTe: true, fallisciTsForzaDes: true,
  },
  'Privo di sensi': {
    it: 'Sei incapacitato e inconsapevole, lasci cadere ciò che tieni e cadi prono. Fallisci i tiri salvezza su Forza e Destrezza, gli attacchi contro di te hanno vantaggio e ogni colpo entro 1,5 m è un critico.',
    en: 'You are incapacitated and unaware, drop what you are holding and fall prone. You fail Strength and Dexterity saves, attacks against you have advantage, and any hit within 5 ft is a critical.',
    incapacitato: true, vantaggioControDiTe: true, fallisciTsForzaDes: true, criticoRavvicinato: true,
  },
  'Prono': {
    it: 'Puoi muoverti solo strisciando. I tuoi tiri per colpire hanno svantaggio; gli attacchi contro di te hanno vantaggio entro 1,5 m, svantaggio se più lontani.',
    en: 'You can only crawl. Your attack rolls have disadvantage; attacks against you have advantage within 5 ft, disadvantage from farther away.',
    svantaggioAttacchi: true, vantaggioControDiTe: true,
  },
  'Spaventato': {
    it: 'Svantaggio alle prove di caratteristica e ai tiri per colpire finché la fonte della paura è nella tua linea di vista. Non puoi avvicinarti volontariamente alla fonte.',
    en: 'Disadvantage on ability checks and attack rolls while the source of fear is in line of sight. You can\'t willingly move closer to the source.',
    svantaggioAttacchi: true, svantaggioProve: true,
  },
  'Stordito': {
    it: 'Sei incapacitato, non puoi muoverti e parli a fatica. Fallisci i tiri salvezza su Forza e Destrezza, gli attacchi contro di te hanno vantaggio.',
    en: 'You are incapacitated, can\'t move, and can speak only falteringly. You fail Strength and Dexterity saves, attacks against you have advantage.',
    incapacitato: true, vantaggioControDiTe: true, fallisciTsForzaDes: true,
  },
  'Trattenuto': {
    it: 'La tua velocità è 0. I tuoi tiri per colpire hanno svantaggio, quelli contro di te vantaggio, e hai svantaggio ai tiri salvezza su Destrezza.',
    en: 'Your speed is 0. Your attack rolls have disadvantage, attacks against you have advantage, and you have disadvantage on Dexterity saves.',
    velocitaZero: true, svantaggioAttacchi: true, vantaggioControDiTe: true,
  },
};

/** Etichette del riepilogo: flag → frase breve, nelle due lingue. */
export const ETICHETTE_EFFETTI = {
  svantaggioAttacchi: { it: 'Svantaggio ai tuoi tiri per colpire', en: 'Disadvantage on your attack rolls' },
  svantaggioProve: { it: 'Svantaggio alle prove di caratteristica', en: 'Disadvantage on ability checks' },
  vantaggioControDiTe: { it: 'Chi ti attacca ha vantaggio', en: 'Attackers have advantage against you' },
  svantaggioControDiTe: { it: 'Chi ti attacca ha svantaggio', en: 'Attackers have disadvantage against you' },
  velocitaZero: { it: 'Velocità ridotta a 0', en: 'Speed reduced to 0' },
  incapacitato: { it: 'Nessuna azione né reazione', en: 'No actions or reactions' },
  fallisciTsForzaDes: { it: 'Fallisci i TS su Forza e Destrezza', en: 'You fail Strength and Dexterity saves' },
  criticoRavvicinato: { it: 'I colpi entro 1,5 m contro di te sono critici', en: 'Hits within 5 ft against you are criticals' },
};
