// Effetti meccanici delle condizioni 5e. Ogni voce ha il testo per esteso
// nelle due lingue e alcuni
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
//   vantaggioAttacchi    – i TUOI tiri per colpire hanno vantaggio
//   svantaggioAttacchiAltri – svantaggio ai tiri per colpire contro chiunque
//                          non sia chi ti afferra (Afferrato, 5.5)
//   nienteAzioneBonus    – niente azioni bonus (Incapacitato, 5.5)
//   interrompeConcentrazione – la concentrazione si interrompe
//   vantaggioIniziativa / svantaggioIniziativa – al tiro di iniziativa
//
// Differenze fra edizioni: una voce può avere '2014' e/o '2024' con i campi
// (testo e flag) da sovrapporre per quell'edizione; effettiCondizione() li
// applica. Fonti: PHB 2014 Appendice A, PHB 2024 Glossario delle regole.

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
    '2024': {
      it: 'La tua velocità è 0 e non può aumentare. Hai svantaggio ai tiri per colpire contro chiunque non sia chi ti afferra. Chi ti afferra può trascinarti o trasportarti quando si muove (ogni metro gli costa 1 metro extra, salvo tu sia Minuscolo o più piccolo di due taglie).',
      en: "Your speed is 0 and can't increase. You have disadvantage on attack rolls against any target other than the grappler. The grappler can drag or carry you when it moves (each foot costs it 1 extra foot unless you are Tiny or two or more sizes smaller).",
      svantaggioAttacchiAltri: true,
    },
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
    it: 'Non puoi compiere azioni né reazioni. La concentrazione si interrompe.',
    en: "You can't take actions or reactions. Your concentration is broken.",
    incapacitato: true, interrompeConcentrazione: true,
    '2024': {
      it: 'Non puoi compiere azioni, azioni bonus né reazioni. La concentrazione si interrompe. Non puoi parlare. Se sei Incapacitato quando tiri l’iniziativa, hai svantaggio al tiro.',
      en: "You can't take any action, bonus action, or reaction. Your concentration is broken. You can't speak. If you're incapacitated when you roll initiative, you have disadvantage on the roll.",
      nienteAzioneBonus: true, svantaggioIniziativa: true,
    },
  },
  'Invisibile': {
    it: 'Non sei visibile senza magia o sensi speciali: per nasconderti conti come pesantemente oscurato. I tuoi tiri per colpire hanno vantaggio, quelli contro di te svantaggio.',
    en: 'You are unseen without magic or a special sense; you count as heavily obscured for hiding. Your attack rolls have advantage, attacks against you have disadvantage.',
    svantaggioControDiTe: true, vantaggioAttacchi: true,
    '2024': {
      it: 'Se sei Invisibile quando tiri l’iniziativa, hai vantaggio al tiro. Non sei influenzato da effetti che richiedono di vederti, a meno che chi li crea possa vederti (anche l’equipaggiamento che porti è nascosto). I tuoi tiri per colpire hanno vantaggio, quelli contro di te svantaggio, tranne contro chi riesce a vederti.',
      en: "If you're invisible when you roll initiative, you have advantage on the roll. You aren't affected by any effect that requires its target to be seen unless its creator can somehow see you (your equipment is concealed too). Your attack rolls have advantage and attacks against you have disadvantage, except against a creature that can see you.",
      vantaggioIniziativa: true,
    },
  },
  'Paralizzato': {
    it: 'Sei incapacitato, non puoi muoverti né parlare. Fallisci i tiri salvezza su Forza e Destrezza. Gli attacchi contro di te hanno vantaggio e ogni colpo entro 1,5 m è un critico.',
    en: 'You are incapacitated and can\'t move or speak. You fail Strength and Dexterity saves. Attacks against you have advantage, and any hit within 5 ft is a critical.',
    incapacitato: true, vantaggioControDiTe: true, fallisciTsForzaDes: true, criticoRavvicinato: true, velocitaZero: true, interrompeConcentrazione: true,
  },
  'Pietrificato': {
    it: 'Sei trasformato in sostanza solida, incapacitato, inconsapevole di ciò che ti circonda. Fallisci i tiri salvezza su Forza e Destrezza, gli attacchi contro di te hanno vantaggio. Hai resistenza a tutti i danni e sei immune a veleno e malattia.',
    en: 'You are turned to solid substance, incapacitated and unaware of your surroundings. You fail Strength and Dexterity saves, attacks against you have advantage. You have resistance to all damage and are immune to poison and disease.',
    incapacitato: true, vantaggioControDiTe: true, fallisciTsForzaDes: true, velocitaZero: true, interrompeConcentrazione: true,
    '2024': {
      it: 'Sei trasformato in una sostanza inanimata (il peso aumenta di dieci volte e non invecchi), sei Incapacitato e la tua velocità è 0. Fallisci i tiri salvezza su Forza e Destrezza, gli attacchi contro di te hanno vantaggio. Hai resistenza a tutti i danni e immunità alla condizione Avvelenato.',
      en: "You are transformed into a solid inanimate substance (your weight increases tenfold and you cease aging), you are incapacitated and your speed is 0. You fail Strength and Dexterity saves, attacks against you have advantage. You have resistance to all damage and immunity to the Poisoned condition.",
    },
  },
  'Privo di sensi': {
    it: 'Sei incapacitato e inconsapevole, lasci cadere ciò che tieni e cadi prono. Fallisci i tiri salvezza su Forza e Destrezza, gli attacchi contro di te hanno vantaggio e ogni colpo entro 1,5 m è un critico.',
    en: 'You are incapacitated and unaware, drop what you are holding and fall prone. You fail Strength and Dexterity saves, attacks against you have advantage, and any hit within 5 ft is a critical.',
    incapacitato: true, vantaggioControDiTe: true, fallisciTsForzaDes: true, criticoRavvicinato: true, velocitaZero: true, interrompeConcentrazione: true,
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
    incapacitato: true, vantaggioControDiTe: true, fallisciTsForzaDes: true, velocitaZero: true, interrompeConcentrazione: true,
    // 5.5: Stordito non blocca più il movimento (solo Incapacitato + TS + vantaggio contro).
    '2024': {
      it: 'Sei Incapacitato (niente azioni, azioni bonus né reazioni, non puoi parlare). Fallisci i tiri salvezza su Forza e Destrezza, gli attacchi contro di te hanno vantaggio. Puoi ancora muoverti.',
      en: "You are incapacitated (no actions, bonus actions or reactions, and you can't speak). You fail Strength and Dexterity saves, attacks against you have advantage. You can still move.",
      velocitaZero: false, nienteAzioneBonus: true, svantaggioIniziativa: true,
    },
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
  svantaggioAttacchiAltri: { it: 'Svantaggio ai tiri per colpire contro chi non ti afferra', en: 'Disadvantage on attacks against targets other than the grappler' },
  vantaggioAttacchi: { it: 'Vantaggio ai tuoi tiri per colpire', en: 'Advantage on your attack rolls' },
  svantaggioProve: { it: 'Svantaggio alle prove di caratteristica', en: 'Disadvantage on ability checks' },
  vantaggioControDiTe: { it: 'Chi ti attacca ha vantaggio', en: 'Attackers have advantage against you' },
  svantaggioControDiTe: { it: 'Chi ti attacca ha svantaggio', en: 'Attackers have disadvantage against you' },
  velocitaZero: { it: 'Velocità ridotta a 0', en: 'Speed reduced to 0' },
  incapacitato: { it: 'Nessuna azione né reazione', en: 'No actions or reactions' },
  nienteAzioneBonus: { it: 'Nessuna azione bonus', en: 'No bonus actions' },
  interrompeConcentrazione: { it: 'La concentrazione si interrompe', en: 'Concentration is broken' },
  vantaggioIniziativa: { it: 'Vantaggio al tiro di iniziativa', en: 'Advantage on initiative' },
  svantaggioIniziativa: { it: 'Svantaggio al tiro di iniziativa', en: 'Disadvantage on initiative' },
  fallisciTsForzaDes: { it: 'Fallisci i TS su Forza e Destrezza', en: 'You fail Strength and Dexterity saves' },
  criticoRavvicinato: { it: 'I colpi entro 1,5 m contro di te sono critici', en: 'Hits within 5 ft against you are criticals' },
};

// Condizioni che includono Incapacitato: nella 5.5 ne ereditano anche i nuovi
// effetti (niente azioni bonus, svantaggio all'iniziativa).
const INCLUDONO_INCAPACITATO = ['Paralizzato', 'Pietrificato', 'Privo di sensi', 'Stordito'];

/**
 * Effetti di una condizione per l'edizione ('2014' = 5.0, '2024' = 5.5,
 * default 2024): voce base + campi dell'edizione. null se sconosciuta.
 */
export function effettiCondizione(nome, versione = '2024') {
  const base = EFFETTI_CONDIZIONI[nome];
  if (!base) return null;
  const ed = String(versione) === '2014' ? '2014' : '2024';
  const { '2014': v14, '2024': v24, ...comuni } = base;
  const eff = { ...comuni, ...((ed === '2014' ? v14 : v24) || {}) };
  if (ed === '2024' && INCLUDONO_INCAPACITATO.includes(nome)) {
    eff.nienteAzioneBonus = true;
    eff.svantaggioIniziativa = true;
  }
  return eff;
}
