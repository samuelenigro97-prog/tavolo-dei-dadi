import { useState, useMemo, useEffect, useRef } from 'react';
import { t, traduciDato } from '../i18n.js';
import { C, COLORE_SCUOLA } from './tema.js';
import { styles } from './stili.js';
import { INCANTESIMI_DB } from '../data/incantesimi.js';
import { INCANTESIMI_XANATHAR } from '../dati/incantesimi-xanathar.js';
import { INCANTESIMI_TASHA } from '../dati/incantesimi-tasha.js';
import {
  ARMI_5E,
  ARMATURE_5E,
  STRUMENTI_5E,
  PESI_OGGETTI,
  TALENTI_FONTI,
  CONDIZIONI_5E,
  SPECIE_DATI,
  BACKGROUND_COMPETENZE,
  BACKGROUND_TALENTO_ORIGINE_2024,
  BACKGROUND_CARATT,
} from '../data/dati5e.js';
import { TALENTI_XANATHAR } from '../dati/talenti-xanathar.js';
import { TALENTI_TASHA } from '../dati/talenti-tasha.js';
import { EFFETTI_CONDIZIONI } from '../data/condizioni.js';
import { BESTIE, FAMIGLI, EVOCAZIONI, MOSTRI_5E } from '../data/bestiario.js';
import { GUIDA_ABILITA_5E } from '../data/guidaAbilita5e.js';
import { TABELLE_BACKGROUND } from '../data/tabelleBackground.js';
import {
  spiegaIncantesimo,
  spiegaPrivilegio,
  spiegaTalento,
  spiegaInvocazione,
  spiegaInfusione,
  spiegaMetamagia,
  spiegaTratto,
  setEdizioneAttuale,
  SPIEG_PRIVILEGI,
  SPIEG_TRATTI,
  INVOCAZIONI_5E,
  INFUSIONI_ARTEFICE_5E,
  METAMAGIA_5E,
} from '../data/spiegazioni.js';

// Regole ufficiali 5e & 5.5 per combattimento, azioni, reazioni, riposi e ambiente
const REGOLE_5E = [
  {
    nome: 'Attaccare (Attack)',
    sottoTipo: 'Azione in Combattimento',
    descIt: "L'azione più comune in combattimento: effettui un attacco in mischia o a distanza con un'arma, a mani nude o con un incantesimo d'attacco. Con il privilegio Attacco Extra puoi compiere più attacchi con questa singola azione.",
    descEn: "The most common action in combat: make one melee or ranged attack with a weapon, unarmed strike, or spell attack. Extra Attack lets you attack multiple times with this action.",
  },
  {
    nome: 'Schivata (Dodge)',
    sottoTipo: 'Azione in Combattimento',
    descIt: "Fino all'inizio del tuo prossimo turno, qualsiasi tiro per colpire effettuato contro di te ha svantaggio se puoi vedere l'attaccante, e hai vantaggio ai tiri salvezza su Destrezza. Perdi questo beneficio se sei incapacitato o la tua velocità scende a 0.",
    descEn: "Until the start of your next turn, any attack roll made against you has disadvantage if you can see the attacker, and you make Dexterity saving throws with advantage. You lose this benefit if incapacitated or your speed drops to 0.",
  },
  {
    nome: 'Scatto (Dash)',
    sottoTipo: 'Azione in Combattimento',
    descIt: 'Ottieni movimento extra per il turno corrente pari alla tua velocità (inclusi modificatori attivi).',
    descEn: 'Gain extra movement for the current turn equal to your speed, after applying any active modifiers.',
  },
  {
    nome: 'Disimpegno (Disengage)',
    sottoTipo: 'Azione in Combattimento',
    descIt: 'Se compi l\'azione di Disimpegno, il tuo movimento per il resto del turno non provoca attacchi di opportunità dai nemici.',
    descEn: "If you take the Disengage action, your movement doesn't provoke opportunity attacks for the rest of the turn.",
  },
  {
    nome: 'Aiuto (Help)',
    sottoTipo: 'Azione in Combattimento',
    descIt: "Puoi prestare il tuo aiuto a un alleato: (1) Concedi vantaggio alla sua prossima prova di caratteristica per completare un'attività entro il tuo prossimo turno, oppure (2) Distrai un nemico entro 1,5 metri concedendo vantaggio al primo tiro per colpire di un alleato contro di esso.",
    descEn: "You can aid an ally: (1) Grant advantage on their next ability check before your next turn, or (2) Distract an enemy within 5 ft, granting advantage to an ally's first attack roll against it.",
  },
  {
    nome: 'Nascondersi (Hide)',
    sottoTipo: 'Azione in Combattimento',
    descIt: 'Effettui una prova di Destrezza (Furtività) per nasconderti dai nemici. Richiede una copertura pesante, oscurità totale o essere fuori dalla vista nemica. Nelle regole 2024 la CD di base è 15.',
    descEn: 'Make a Dexterity (Stealth) check to conceal yourself. Requires heavy cover, total darkness, or being unobserved. In 2024 rules, base DC is 15.',
  },
  {
    nome: 'Cercare (Search)',
    sottoTipo: 'Azione in Combattimento',
    descIt: 'Dedichi la tua attenzione a individuare qualcosa di nascosto o impercettibile, effettuando una prova di Saggezza (Percezione) o Intelligenza (Indagare) a discrezione del DM.',
    descEn: 'Devote your attention to finding something, making a Wisdom (Perception) check or an Intelligence (Investigation) check as determined by the DM.',
  },
  {
    nome: 'Preparare un\'Azione (Ready)',
    sottoTipo: 'Azione in Combattimento',
    descIt: "Prepari un'azione da compiere in risposta a un innesco specifico (trigger) usando la tua reazione prima dell'inizio del tuo prossimo turno. Se prepari un incantesimo, lo lanci subito e richiedi concentrazione fino al rilascio.",
    descEn: 'Wait for a particular circumstance before you act, choosing the action and the perceptible trigger to execute using your reaction before the start of your next turn. Readied spells require concentration.',
  },
  {
    nome: 'Utilizzare un Oggetto (Use an Object)',
    sottoTipo: 'Azione in Combattimento',
    descIt: "Interagisci con un secondo oggetto o meccanismo nel tuo turno (il primo è gratuito nel movimento/azione), oppure usi un oggetto speciale che richiede esplicitamente un'azione (come bere una pozione o attivare una trappola).",
    descEn: 'Interact with a second object on your turn, or use a special item that explicitly requires an action (such as drinking a potion or setting a trap).',
  },
  {
    nome: 'Lottare (Grapple)',
    sottoTipo: 'Manovra d\'Attacco',
    descIt: 'Con un attacco in mischia a mani libere afferri una creatura grande al massimo una taglia più di te. Nel 2014: Prova contrapposta di Atletica vs Atletica/Acrobazia. Nel 2024: Il bersaglio deve superare un TS Forza o Destrezza (CD 8 + mod. For + Competenza). La velocità della creatura afferrata diventa 0.',
    descEn: 'Use an attack to grab a creature no more than one size larger. In 2014: Opposed Athletics vs Athletics/Acrobatics. In 2024: Target must pass a Str/Dex saving throw (DC 8 + Str mod + PB). Target speed becomes 0.',
  },
  {
    nome: 'Spingere (Shove)',
    sottoTipo: 'Manovra d\'Attacco',
    descIt: 'Con un attacco in mischia tenti di far cadere una creatura prona o allontanarla di 1,5 metri. Nel 2014: Prova contrapposta Atletica vs Atletica/Acrobazia. Nel 2024: TS Forza o Destrezza del bersaglio.',
    descEn: 'Use an attack to knock a creature prone or shove it 5 feet away. In 2014: Opposed Athletics vs Athletics/Acrobatics. In 2024: Target makes a Str or Dex save.',
  },
  {
    nome: 'Combattere con Due Armi (Two-Weapon Fighting)',
    sottoTipo: 'Azione Bonus',
    descIt: "Quando compi l'azione di Attacco con un'arma da mischia Leggera in una mano, puoi usare un'azione bonus per attaccare con un'altra arma da mischia Leggera nell'altra mano (senza aggiungere il mod. di caratteristica ai danni del secondo attacco, a meno che non sia negativo).",
    descEn: 'When you take the Attack action with a Light melee weapon, you can use a bonus action to attack with a different Light melee weapon in your other hand (without adding ability modifier to damage unless negative).',
  },
  {
    nome: 'Attacco di Opportunità (Opportunity Attack)',
    sottoTipo: 'Reazione',
    descIt: "Quando una creatura ostile che puoi vedere esce dalla tua portata in mischia senza compiere l'azione di Disimpegno, puoi usare la tua reazione per effettuare 1 attacco in mischia con arma contro di essa immediatamente prima che esca.",
    descEn: 'When a hostile creature you can see moves out of your reach without Disengaging, you can use your reaction to make one melee attack against that creature right before it leaves.',
  },
  {
    nome: 'Copertura a Metà (+2 CA / TS Des)',
    sottoTipo: 'Regola Ambientale',
    descIt: "Un bersaglio gode di mezza copertura se un ostacolo (un muretto, una creatura o un albero) blocca almeno metà del suo corpo. Ottiene +2 alla CA e ai tiri salvezza su Destrezza contro attacchi e incantesimi dall'altro lato.",
    descEn: 'A target has half cover if an obstacle blocks at least half of its body. Gains +2 bonus to AC and Dexterity saving throws.',
  },
  {
    nome: 'Copertura a Tre Quarti (+5 CA / TS Des)',
    sottoTipo: 'Regola Ambientale',
    descIt: 'Un bersaglio gode di copertura a tre quarti se un ostacolo blocca circa tre quarti del suo corpo (una grata di ferro, una feritoia o un tronco massiccio). Ottiene +5 alla CA e ai tiri salvezza su Destrezza.',
    descEn: 'A target has three-quarters cover if an obstacle blocks about three-quarters of its body. Gains +5 bonus to AC and Dexterity saving throws.',
  },
  {
    nome: 'Copertura Totale',
    sottoTipo: 'Regola Ambientale',
    descIt: 'Un bersaglio gode di copertura totale se è completamente nascosto da un ostacolo. Non può essere bersagliato direttamente da attacchi o incantesimi mirati.',
    descEn: 'A target has total cover if it is completely concealed by an obstacle. Cannot be targeted directly by attacks or spells.',
  },
  {
    nome: 'Riposo Breve (Short Rest)',
    sottoTipo: 'Riposo & Guarigione',
    descIt: 'Un periodo di riposo di almeno 1 ora durante il quale il personaggio non fa nulla di faticoso tranne mangiare, bere e medicare le ferite. Può spendere uno o più Dadi Vita per curarsi: tira il dado e aggiunge il mod. Costituzione per ogni dado speso.',
    descEn: 'A period of downtime at least 1 hour long. Spend one or more Hit Dice to regain HP (Hit Die roll + Con modifier per die).',
  },
  {
    nome: 'Riposo Lungo (Long Rest)',
    sottoTipo: 'Riposo & Guarigione',
    descIt: 'Un periodo di riposo di almeno 8 ore (almeno 6 ore di sonno). Al termine recuperi tutti i PF persi, metà dei Dadi Vita massimi spesi (minimo 1), tutti gli slot incantesimo e le risorse di classe ricaricabili a riposo lungo.',
    descEn: 'A period of extended downtime at least 8 hours long (at least 6 hours of sleep). Regain all lost HP, half your max Hit Dice (min 1), all spell slots, and long-rest class features.',
  },
  {
    nome: 'Tiri Salvezza contro Morte (Death Saves)',
    sottoTipo: 'Salute & Sopravvivenza',
    descIt: 'A 0 PF all\'inizio di ogni turno tiri 1d20: 10 o più è 1 successo, 9 o meno è 1 fallimento. Con 3 successi ti stabilizzi; con 3 fallimenti muori. Un 20 naturale ti rianima con 1 PF; un 1 naturale conta come 2 fallimenti. Subire danni a 0 PF infligge 1 fallimento (2 se colpo critico).',
    descEn: 'At 0 HP at turn start, roll 1d20: 10+ is a success, 9 or lower is a failure. 3 successes stabilize; 3 failures result in death. Natural 20 restores 1 HP immediately; natural 1 counts as 2 failures. Taking damage at 0 HP causes 1 failure (2 for a critical hit).',
  },
  {
    nome: 'Morte Istantanea & Danni Massicci',
    sottoTipo: 'Salute & Sopravvivenza',
    descIt: 'Quando i danni ti portano a 0 PF e i danni residui superano o eguagliano i tuoi PF massimi, muori all\'istante senza effettuare tiri salvezza contro morte.',
    descEn: 'When damage reduces you to 0 HP and remaining damage equals or exceeds your hit point maximum, you die instantly.',
  },
  {
    nome: 'Ispirazione Eroica (Heroic Inspiration)',
    sottoTipo: 'Regola Chiave',
    descIt: 'Quando hai Ispirazione Eroica, puoi spenderla immediatamente dopo aver tirato qualsiasi d20 per ritirare il dado e usare il nuovo risultato (o nelle regole 2024 per tirare con Vantaggio).',
    descEn: 'When you have Heroic Inspiration, you can spend it to reroll any d20 roll (or roll with Advantage in 2024 rules).',
  },
  {
    nome: 'Terreno Difficile (Difficult Terrain)',
    sottoTipo: 'Regola Ambientale',
    descIt: 'Muoversi su terreno difficile (macerie, ghiaccio, palude, scale ripide o vegetazione fitta) costa il doppio del movimento normale: ogni metro percorso costa 2 metri di velocità.',
    descEn: 'Moving through difficult terrain (rubble, ice, swamp, steep stairs, dense undergrowth) costs 1 extra foot of speed for each foot moved.',
  },
  {
    nome: 'Caduta & Danni da Caduta',
    sottoTipo: 'Regola Ambientale',
    descIt: 'Una creatura subisce 1d6 danni contundenti per ogni 3 metri di caduta (fino a un massimo di 20d6) e cade prona all\'atterraggio a meno che non eviti tutti i danni.',
    descEn: 'A creature takes 1d6 bludgeoning damage for every 10 feet fallen (up to a max of 20d6) and lands prone unless it avoids taking damage from the fall.',
  },
  {
    nome: 'Soffocamento e Apnea',
    sottoTipo: 'Regola Ambientale',
    descIt: 'Una creatura può trattenere il respiro per 1 + modificatore di Costituzione minuti (minimo 30 secondi). Una volta esaurita l\'aria, sopravvive per round pari al suo modificatore di Costituzione (minimo 1 round), dopodiché scende a 0 PF e inizia a morire.',
    descEn: 'A creature can hold its breath for 1 + Con modifier minutes (min 30 sec). Out of breath, it survives for rounds equal to Con mod (min 1), then drops to 0 HP and begins dying.',
  },
  {
    nome: 'Maestria nelle Armi (Weapon Mastery - 2024)',
    sottoTipo: 'Regola Tattica 2024',
    descIt: 'Proprietà speciali delle armi nel manuale 2024:\n• Abbattere (Topple): Bersaglio fa TS Costituzione o cade prono.\n• Incalzare (Cleave): Attacco extra a una creatura adiacente per i soli dadi dell\'arma.\n• Intralciare (Slow): Riduce la velocità del bersaglio di 3 metri fino al prossimo turno.\n• Respingo (Push): Spinge il bersaglio fino a 3 metri di distanza senza TS.\n• Scalzare (Sap): Svantaggio al prossimo attacco del bersaglio prima del tuo turno.\n• Stoccata (Nick): L\'attacco con l\'arma secondaria fa parte dell\'azione di Attacco.\n• Vex: Vantaggio al tuo prossimo tiro per colpire contro lo stesso bersaglio.\n• Graze: Se manchi un attacco, infliggi comunque danni pari al mod. di caratteristica.',
    descEn: 'Special weapon properties in 2024 rules: Topple (save vs prone), Cleave (extra attack on adjacent foe), Slow (-10 ft speed), Push (push 10 ft), Sap (disadvantage on target next attack), Nick (extra light attack in attack action), Vex (advantage on next attack vs target), Graze (deal ability mod damage on miss).',
  },
];

// 6 Caratteristiche Base D&D 5e
const CARATTERISTICHE_5E = [
  {
    nome: 'Forza (STR)',
    sottoTipo: 'Caratteristica Base',
    car: 'forza',
    descIt: "Misura la potenza fisica, l'atletismo e la forza muscolare. Governa i tiri per colpire e i danni in mischia, l'abilità Atletica, la capacità di carico (Forza × 7,5 kg / 15 lb), il sollevamento massimo (Forza × 15 kg / 30 lb), e i salti in lungo/alto.",
    descEn: 'Measures bodily power, athletic training, and physical force. Governs melee attacks and damage, Athletics skill, carrying capacity (Str × 15 lbs), max push/drag/lift (Str × 30 lbs), and jumping distance.',
  },
  {
    nome: 'Destrezza (DEX)',
    sottoTipo: 'Caratteristica Base',
    car: 'destrezza',
    descIt: "Misura l'agilità, i riflessi, la coordinazione e l'equilibrio. Governa la Classe Armatura (CA), il bonus di Iniziativa, i tiri per colpire e i danni a distanza/accuratezza (Finesse), e le abilità Acrobazia, Furtività e Rapidità di Mano.",
    descEn: 'Measures agility, reflexes, coordination, and balance. Governs Armor Class (AC), Initiative bonus, ranged/finesse weapon attack and damage rolls, and Acrobatics, Stealth, and Sleight of Hand skills.',
  },
  {
    nome: 'Costituzione (CON)',
    sottoTipo: 'Caratteristica Base',
    car: 'costituzione',
    descIt: 'Misura la salute, la resistenza fisica, la vitalità e la tempra. Determina i Punti Ferita massimi (+mod. COS a ogni livello), i tiri salvezza su Costituzione per mantenere la Concentrazione sugli incantesimi, la resistenza a veleni, tossine e fatica.',
    descEn: 'Measures health, stamina, and vital force. Determines max Hit Points (+Con mod per level), Concentration saving throws on spells, and endurance against poison, environmental hazards, and exhaustion.',
  },
  {
    nome: 'Intelligenza (INT)',
    sottoTipo: 'Caratteristica Base',
    car: 'intelligenza',
    descIt: "Misura l'acume mentale, la memoria, la logica e la capacità di deduzione. È la caratteristica da incantatore per Maghi e Artefici. Governa le abilità Arcano, Storia, Indagare, Natura e Religione.",
    descEn: 'Measures mental acuity, information recall, and analytical skill. Spellcasting ability for Wizards and Artificers. Governs Arcana, History, Investigation, Nature, and Religion skills.',
  },
  {
    nome: 'Saggezza (WIS)',
    sottoTipo: 'Caratteristica Base',
    car: 'saggezza',
    descIt: "Misura la sintonia con l'ambiente circostante, l'intuizione, la consapevolezza e la forza di volontà spirituale. È la caratteristica da incantatore per Chierici, Druidi e Ranger. Governa la Percezione passiva e le abilità Addestrare Animali, Intuizione, Medicina, Percezione e Sopravvivenza.",
    descEn: 'Measures awareness, intuition, and spiritual resolve. Spellcasting ability for Clerics, Druids, and Rangers. Governs passive Perception, and Animal Handling, Insight, Medicine, Perception, and Survival skills.',
  },
  {
    nome: 'Carisma (CHA)',
    sottoTipo: 'Caratteristica Base',
    car: 'carisma',
    descIt: "Misura la forza di personalità, l'eloquenza, il magnetismo, la capacità di persuasione e la potenza magica innata. È la caratteristica da incantatore per Bardi, Paladini, Stregoni e Warlock. Governa le abilità Inganno, Intimidire, Intrattenere e Persuasione.",
    descEn: 'Measures force of personality, eloquence, leadership, and innate magical power. Spellcasting ability for Bards, Paladins, Sorcerers, and Warlocks. Governs Deception, Intimidation, Performance, and Persuasion skills.',
  },
];

export function CompendioModal({
  aperto,
  onChiudi,
  lingua = 'it',
  versione = '2024',
  onAggiungiIncantesimo,
  onAggiungiInventario,
  onAggiungiAttacco,
  onApplicaCondizione,
  onAggiungiTalento,
}) {
  const [testoCerca, setTestoCerca] = useState('');
  const [categoria, setCategoria] = useState('tutti');
  const [dettaglioSelezionato, setDettaglioSelezionato] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (aperto) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTestoCerca('');
      setDettaglioSelezionato(null);
    }
  }, [aperto]);

  // Database unificato memoizzato in base all'edizione (5.0 vs 5.5)
  const is2024 = String(versione) !== '2014';
  const vociCompendio = useMemo(() => {
    setEdizioneAttuale(versione);
    const elenco = [];

    // 1. Incantesimi
    const incMap = new Map();
    for (const [nome, d] of Object.entries(INCANTESIMI_DB || {})) {
      incMap.set(nome.toLowerCase(), { nome, ...d });
    }
    for (const inc of (INCANTESIMI_XANATHAR || [])) {
      if (inc && inc.nome) {
        incMap.set(inc.nome.toLowerCase(), { ...inc });
      }
    }
    for (const inc of (INCANTESIMI_TASHA || [])) {
      if (inc && inc.nome) {
        incMap.set(inc.nome.toLowerCase(), { ...inc });
      }
    }
    for (const d of incMap.values()) {
      const nome = d.nome;
      const desc = d.desc || spiegaIncantesimo(nome) || '';
      elenco.push({
        id: `inc-${nome}`,
        tipo: 'incantesimo',
        nome,
        livello: d.livello ?? 0,
        scuola: d.scuola || '',
        classi: d.classi || [],
        tempo: d.tempo || '',
        gittata: d.gittata || '',
        durata: d.durata || '',
        conc: !!d.conc,
        rituale: !!d.rituale,
        danno: d.danno || '',
        tipoDanno: d.tipoDanno || '',
        desc,
        raw: d,
      });
    }

    // 2. Armi (con Maestrie per 5.5 / senza Maestrie per 5.0)
    for (const w of (ARMI_5E || [])) {
      const descArma = is2024
        ? `${w.danno ? `Danno: ${w.danno} ${w.tipoDanno || ''}. ` : ''}${w.note ? `Proprietà: ${w.note}. ` : ''}${w.maestria ? `Maestria: ${w.maestria}` : ''}`.trim()
        : `${w.danno ? `Danno: ${w.danno} ${w.tipoDanno || ''}. ` : ''}${w.note ? `Proprietà: ${w.note}` : ''}`.trim();
      const rawArma = is2024 ? w : { ...w, maestria: undefined };
      elenco.push({
        id: `arma-${w.nome}`,
        tipo: 'equip',
        sottoTipo: 'Arma',
        nome: w.nome,
        danno: w.danno || '',
        tipoDanno: w.tipoDanno || '',
        peso: w.peso || 1,
        prezzo: w.prezzo || '',
        note: is2024 && w.maestria ? (w.note ? `${w.note}, Maestria (${w.maestria})` : `Maestria (${w.maestria})`) : (w.note || ''),
        desc: descArma,
        raw: rawArma,
      });
    }

    // 3. Armature
    for (const a of (ARMATURE_5E || [])) {
      const nomeArm = Array.isArray(a.match) ? a.match[0] : (a.nome || 'Armatura');
      elenco.push({
        id: `armatura-${nomeArm}`,
        tipo: 'equip',
        sottoTipo: 'Armatura',
        nome: nomeArm.charAt(0).toUpperCase() + nomeArm.slice(1),
        tipoArmatura: a.tipo || 'leggera',
        caBase: a.base || 10,
        peso: a.peso || 5,
        desc: `Armatura ${a.tipo || ''} (CA base ${a.base || 10}).`,
        raw: a,
      });
    }

    // 4. Oggetti & Pozioni & Attrezzi
    for (const [nomeOgg, pesoOgg] of Object.entries(PESI_OGGETTI || {})) {
      const isPoz = /pozione|filtro|elisir|potion/i.test(nomeOgg);
      elenco.push({
        id: `ogg-${nomeOgg}`,
        tipo: 'equip',
        sottoTipo: isPoz ? 'Pozione' : 'Oggetto',
        nome: nomeOgg,
        peso: pesoOgg || 0.5,
        desc: isPoz ? `Pozione o consumabile magico (peso: ${pesoOgg} kg).` : `Oggetto o strumento d’avventura (peso: ${pesoOgg} kg).`,
        raw: { nome: nomeOgg, peso: pesoOgg },
      });
    }
    for (const nomeStr of (STRUMENTI_5E || [])) {
      if (!PESI_OGGETTI[nomeStr]) {
        elenco.push({
          id: `att-${nomeStr}`,
          tipo: 'equip',
          sottoTipo: 'Strumento',
          nome: nomeStr,
          peso: 1,
          desc: 'Set di strumenti da lavoro, artigianato o gioco.',
          raw: { nome: nomeStr, peso: 1 },
        });
      }
    }

    // 5. Privilegi di Classe
    const privVisti = new Set();
    for (const nomePriv of Object.keys(SPIEG_PRIVILEGI || {})) {
      const norm = nomePriv.trim().toLowerCase();
      if (privVisti.has(norm)) continue;
      privVisti.add(norm);
      const desc = spiegaPrivilegio(nomePriv) || SPIEG_PRIVILEGI[nomePriv];
      elenco.push({
        id: `priv-${nomePriv}`,
        tipo: 'privilegio',
        sottoTipo: 'Privilegio di Classe',
        nome: nomePriv,
        desc: desc || '',
        raw: { nome: nomePriv, desc },
      });
    }

    // 6. Talenti, Metamagia, Invocazioni, Infusioni
    const talentiMap = new Map();
    for (const [nomeTal, fonte] of Object.entries(TALENTI_FONTI || {})) {
      if (!is2024) {
        if (/^dono\s+del/i.test(nomeTal)) continue;
        if (['musico', 'artigiano', 'guida spirituale', 'attaccabrighe'].includes(nomeTal.toLowerCase())) continue;
      }
      talentiMap.set(nomeTal.toLowerCase(), {
        nome: nomeTal,
        requisiti: fonte === 'phb2024' ? (is2024 ? 'D&D 2024' : '') : '',
        desc: spiegaTalento(nomeTal) || '',
      });
    }
    for (const t of (TALENTI_XANATHAR || [])) {
      talentiMap.set(t.nome.toLowerCase(), {
        nome: t.nome,
        requisiti: t.prerequisito || '',
        desc: t.desc || spiegaTalento(t.nome) || '',
      });
    }
    for (const t of (TALENTI_TASHA || [])) {
      talentiMap.set(t.nome.toLowerCase(), {
        nome: t.nome,
        requisiti: t.prerequisito || '',
        desc: t.desc || spiegaTalento(t.nome) || '',
      });
    }
    for (const t of talentiMap.values()) {
      elenco.push({
        id: `tal-${t.nome}`,
        tipo: 'talento',
        sottoTipo: 'Talento',
        nome: t.nome,
        requisiti: t.requisiti || '',
        desc: t.desc,
        raw: t,
      });
    }

    for (const nomeMeta of (METAMAGIA_5E || [])) {
      const desc = spiegaMetamagia(nomeMeta) || '';
      elenco.push({
        id: `meta-${nomeMeta}`,
        tipo: 'talento',
        sottoTipo: 'Metamagia',
        nome: nomeMeta,
        requisiti: 'Stregone (Punti Stregoneria)',
        desc,
        raw: { nome: nomeMeta, desc },
      });
    }

    for (const nomeInv of (INVOCAZIONI_5E || [])) {
      const desc = spiegaInvocazione(nomeInv) || '';
      elenco.push({
        id: `invoc-${nomeInv}`,
        tipo: 'talento',
        sottoTipo: 'Invocazione Occulta',
        nome: nomeInv,
        requisiti: 'Warlock',
        desc,
        raw: { nome: nomeInv, desc },
      });
    }

    for (const nomeInf of (INFUSIONI_ARTEFICE_5E || [])) {
      const desc = spiegaInfusione(nomeInf) || '';
      elenco.push({
        id: `infus-${nomeInf}`,
        tipo: 'talento',
        sottoTipo: 'Infusione dell’Artefice',
        nome: nomeInf,
        requisiti: 'Artefice',
        desc,
        raw: { nome: nomeInf, desc },
      });
    }

    // 7. Regole & Azioni di Combattimento
    for (const r of REGOLE_5E) {
      elenco.push({
        id: `regola-${r.nome}`,
        tipo: 'regola',
        sottoTipo: r.sottoTipo,
        nome: r.nome,
        desc: lingua === 'en' ? (r.descEn || r.descIt) : (r.descIt || r.descEn),
        raw: r,
      });
    }

    // 8. Condizioni
    for (const c of (CONDIZIONI_5E || [])) {
      const effObj = EFFETTI_CONDIZIONI[c];
      const desc = typeof effObj === 'string'
        ? effObj
        : (effObj?.[lingua] || effObj?.it || (Array.isArray(effObj) ? effObj.join(' · ') : ''));
      elenco.push({
        id: `cond-${c}`,
        tipo: 'condizione',
        nome: c,
        desc: desc || 'Condizione 5e che influenza azioni e movimenti.',
        effetti: effObj,
        raw: c,
      });
    }

    // 9. Bestiario
    const tutteCreature = [...(BESTIE || []), ...(FAMIGLI || []), ...(EVOCAZIONI || []), ...(MOSTRI_5E || [])];
    const nomiVisti = new Set();
    for (const b of tutteCreature) {
      if (!b?.nome || nomiVisti.has(b.nome.toLowerCase())) continue;
      nomiVisti.add(b.nome.toLowerCase());
      elenco.push({
        id: `bestia-${b.nome}`,
        tipo: 'bestiario',
        nome: b.nome,
        gs: b.gs != null ? b.gs : '—',
        ca: b.ca || 10,
        pf: b.pf || 10,
        vel: b.vel || '9m',
        taglia: b.taglia || 'Media',
        tipoCreatura: b.tipo || 'Bestia',
        desc: `GS ${b.gs != null ? b.gs : '—'} · CA ${b.ca || 10} · PF ${b.pf || 10} · Vel ${b.vel || '9m'}`,
        raw: b,
      });
    }

    // 10. Specie & Tratti di Specie
    for (const [nomeSpecie, sp] of Object.entries(SPECIE_DATI || {})) {
      let desc = `Velocità: ${sp.velocita} m · Taglia: ${sp.taglia}`;
      if (sp.sensi) desc += ` · Sensi: ${sp.sensi}`;
      if (sp.tratti) desc += `\n\n🧬 Tratti:\n${sp.tratti}`;

      elenco.push({
        id: `specie-${nomeSpecie}`,
        tipo: 'specie',
        sottoTipo: 'Specie',
        nome: nomeSpecie,
        desc,
        raw: sp,
      });
    }
    const trattiVisti = new Set();
    for (const nomeTratto of Object.keys(SPIEG_TRATTI || {})) {
      const norm = nomeTratto.trim().toLowerCase();
      if (trattiVisti.has(norm)) continue;
      trattiVisti.add(norm);
      const spiegazione = spiegaTratto(nomeTratto) || SPIEG_TRATTI[nomeTratto];
      elenco.push({
        id: `tratto-${nomeTratto}`,
        tipo: 'specie',
        sottoTipo: 'Tratto di Specie',
        nome: nomeTratto,
        desc: spiegazione || '',
        raw: { nome: nomeTratto, desc: spiegazione },
      });
    }

    // 11. Background
    for (const [chiaveBg, bgObj] of Object.entries(TABELLE_BACKGROUND || {})) {
      const nomeBg = (lingua === 'en' && bgObj.nome_en) ? bgObj.nome_en : (bgObj.nome || chiaveBg);
      const comp = BACKGROUND_COMPETENZE[chiaveBg] || BACKGROUND_COMPETENZE[nomeBg.toLowerCase()] || {};
      const caratt = BACKGROUND_CARATT[chiaveBg] || BACKGROUND_CARATT[nomeBg.toLowerCase()];
      const talentoOrigine = BACKGROUND_TALENTO_ORIGINE_2024[chiaveBg] || BACKGROUND_TALENTO_ORIGINE_2024[nomeBg.toLowerCase()];

      let desc = '';
      if (comp.abilita && comp.abilita.length > 0) {
        desc += `Abilità: ${comp.abilita.join(', ')}. `;
      }
      if (comp.strumenti && comp.strumenti.length > 0) {
        desc += `Strumenti: ${comp.strumenti.join(', ')}. `;
      }
      if (comp.linguaggi && comp.linguaggi.length > 0) {
        desc += `Linguaggi: ${comp.linguaggi.join(', ')}. `;
      }
      if (talentoOrigine) {
        desc += `Talento di Origine (2024): ${talentoOrigine}. `;
      }
      if (caratt) {
        desc += `Caratteristiche consigliate: ${caratt}. `;
      }

      let descCompleta = desc.trim();
      const trattiList = lingua === 'en' && bgObj.tratti_en ? bgObj.tratti_en : bgObj.tratti;
      const idealiList = lingua === 'en' && bgObj.ideali_en ? bgObj.ideali_en : bgObj.ideali;
      const legamiList = lingua === 'en' && bgObj.legami_en ? bgObj.legami_en : bgObj.legami;
      const difettiList = lingua === 'en' && bgObj.difetti_en ? bgObj.difetti_en : bgObj.difetti;

      if (trattiList && trattiList.length > 0) {
        descCompleta += `\n\n📜 ${lingua === 'en' ? 'Personality Traits' : 'Tratti Caratteriali Suggeriti'}:\n` + trattiList.map((tItem, idx) => `${idx + 1}. ${tItem}`).join('\n');
      }
      if (idealiList && idealiList.length > 0) {
        descCompleta += `\n\n✨ ${lingua === 'en' ? 'Ideals' : 'Ideali'}:\n` + idealiList.map((tItem, idx) => `${idx + 1}. ${tItem}`).join('\n');
      }
      if (legamiList && legamiList.length > 0) {
        descCompleta += `\n\n🔗 ${lingua === 'en' ? 'Bonds' : 'Legami'}:\n` + legamiList.map((tItem, idx) => `${idx + 1}. ${tItem}`).join('\n');
      }
      if (difettiList && difettiList.length > 0) {
        descCompleta += `\n\n⚠️ ${lingua === 'en' ? 'Flaws' : 'Difetti'}:\n` + difettiList.map((tItem, idx) => `${idx + 1}. ${tItem}`).join('\n');
      }

      elenco.push({
        id: `bg-${chiaveBg}`,
        tipo: 'background',
        sottoTipo: 'Background',
        nome: nomeBg,
        desc: descCompleta,
        raw: bgObj,
      });
    }

    // 12. Abilità & Caratteristiche Base
    for (const car of CARATTERISTICHE_5E) {
      elenco.push({
        id: `car-${car.car}`,
        tipo: 'abilita',
        sottoTipo: car.sottoTipo,
        car: car.car,
        nome: car.nome,
        desc: lingua === 'en' ? (car.descEn || car.descIt) : (car.descIt || car.descEn),
        raw: car,
      });
    }

    for (const [chiaveAb, abObj] of Object.entries(GUIDA_ABILITA_5E || {})) {
      const nomeAb = (lingua === 'en' ? abObj.nomeEn : abObj.nomeIt) || abObj.nomeIt || chiaveAb;
      const descAb = (lingua === 'en' ? abObj.descrizioneEn : abObj.descrizioneIt) || abObj.descrizioneIt || '';

      let descCompleta = descAb;
      if (abObj.esempiCd && abObj.esempiCd.length > 0) {
        descCompleta += `\n\n🎯 ${lingua === 'en' ? 'DC Difficulty Reference' : 'Tabelle CD di Riferimento'}:\n` + abObj.esempiCd.map((cd) =>
          `• CD ${cd.cd} (${lingua === 'en' ? cd.diffEn : cd.diffIt}): ${lingua === 'en' ? cd.esEn : cd.esIt}`
        ).join('\n');
      }
      if (abObj.sinergieStrumenti && abObj.sinergieStrumenti.length > 0) {
        descCompleta += `\n\n⚒️ ${lingua === 'en' ? 'Tool Synergies (Advantage)' : 'Sinergie con Strumenti (Vantaggio)'}:\n` + abObj.sinergieStrumenti.map((s) =>
          `• ${s.strumento}: ${lingua === 'en' ? s.beneficioEn : s.beneficioIt}`
        ).join('\n');
      }

      elenco.push({
        id: `ab-${chiaveAb}`,
        tipo: 'abilita',
        sottoTipo: `Abilità (${(abObj.car || '').toUpperCase()})`,
        car: abObj.car,
        nome: nomeAb,
        desc: descCompleta,
        raw: abObj,
      });
    }

    return elenco;
  }, [versione, is2024, lingua]);

  // Filtro di ricerca
  const risultati = useMemo(() => {
    const q = testoCerca.trim().toLowerCase();
    return vociCompendio.filter((v) => {
      if (categoria !== 'tutti' && v.tipo !== categoria) return false;
      if (!q) return true;
      const matchNome = v.nome.toLowerCase().includes(q) || traduciDato(v.nome).toLowerCase().includes(q);
      const matchDesc = v.desc && v.desc.toLowerCase().includes(q);
      const matchSotto = v.sottoTipo && v.sottoTipo.toLowerCase().includes(q);
      const matchScuola = v.scuola && (v.scuola.toLowerCase().includes(q) || traduciDato(v.scuola).toLowerCase().includes(q));
      return matchNome || matchDesc || matchSotto || matchScuola;
    });
  }, [vociCompendio, testoCerca, categoria]);

  if (!aperto) return null;

  const CATEGORIE_TABS = [
    { id: 'tutti', label: t('compendio.tutti'), icon: '🌟' },
    { id: 'incantesimo', label: t('compendio.incantesimi'), icon: '✨' },
    { id: 'equip', label: t('compendio.equipaggiamento'), icon: '⚔️' },
    { id: 'privilegio', label: t('compendio.privilegi'), icon: '🛡️' },
    { id: 'talento', label: t('compendio.talenti'), icon: '⭐' },
    { id: 'regola', label: t('compendio.regole'), icon: '📜' },
    { id: 'condizione', label: t('compendio.condizioni'), icon: '🩸' },
    { id: 'bestiario', label: t('compendio.bestiario'), icon: '🐾' },
    { id: 'specie', label: t('compendio.specie'), icon: '🧬' },
    { id: 'background', label: t('compendio.background'), icon: '🎒' },
    { id: 'abilita', label: t('compendio.abilita'), icon: '🎯' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compendio-titolo"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2600,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onChiudi();
      }}
    >
      <div
        style={{
          ...styles.panel,
          width: '100%',
          maxWidth: 820,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
          borderTop: `2px solid ${C.goldDark}`,
          padding: 0,
          overflow: 'hidden',
          borderRadius: 12,
        }}
      >
        {/* Intestazione */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🔍</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 id="compendio-titolo" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.ink }}>
                  {t('compendio.titolo')}
                </h3>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: '1px 7px',
                    borderRadius: 6,
                    background: String(versione) === '2014' ? 'rgba(184,134,11,0.14)' : 'rgba(46,139,87,0.14)',
                    color: String(versione) === '2014' ? C.goldDark : '#2e8b57',
                    border: `1px solid ${String(versione) === '2014' ? C.goldDark : '#2e8b57'}`,
                  }}
                >
                  {String(versione) === '2014' ? '📖 D&D 5.0 (2014)' : '⚔️ D&D 5.5 (2024)'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: C.inkDim, marginTop: 1 }}>
                {lingua === 'en'
                  ? `Quick rules & database lookup for D&D ${String(versione) === '2014' ? '5.0' : '5.5'} (Cmd+K / Ctrl+K)`
                  : `Ricerca rapida e compendio per D&D ${String(versione) === '2014' ? '5.0' : '5.5'} (Cmd+K / Ctrl+K)`}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onChiudi}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 20,
              color: C.inkDim,
              cursor: 'pointer',
              padding: '4px 8px',
              lineHeight: 1,
            }}
            title={t('modal.chiudi')}
          >
            ✕
          </button>
        </div>

        {/* Barra di ricerca + Filtri */}
        <div style={{ padding: '12px 18px 8px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <input
              ref={inputRef}
              type="text"
              value={testoCerca}
              onChange={(e) => setTestoCerca(e.target.value)}
              placeholder={t('compendio.cerca_ph')}
              style={{
                width: '100%',
                padding: '10px 36px 10px 14px',
                fontSize: 14,
                borderRadius: 8,
                border: `1.5px solid ${C.goldDark}`,
                background: C.bgInput || '#fff',
                color: C.ink,
                outline: 'none',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onChiudi();
              }}
            />
            {testoCerca && (
              <button
                type="button"
                onClick={() => setTestoCerca('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: C.inkDim,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Categorie Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'nowrap',
              overflowX: 'auto',
              paddingBottom: 6,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {CATEGORIE_TABS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoria(cat.id)}
                style={{
                  ...styles.buttonMini,
                  padding: '5px 10px',
                  fontSize: 11.5,
                  borderRadius: 6,
                  fontWeight: categoria === cat.id ? 700 : 500,
                  background: categoria === cat.id ? C.goldDark : 'rgba(0,0,0,0.03)',
                  color: categoria === cat.id ? '#fff' : C.inkDim,
                  borderColor: categoria === cat.id ? C.goldDark : C.border,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista Risultati + Pannello Dettaglio */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Colonna Sinistra: Elenco */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              borderRight: dettaglioSelezionato ? `1px solid ${C.border}` : 'none',
              padding: '8px 12px',
            }}
          >
            {risultati.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: C.inkDim, fontSize: 13 }}>
                {t('compendio.nessun_risultato')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {risultati.slice(0, 100).map((v) => {
                  const isSel = dettaglioSelezionato?.id === v.id;
                  let icona = '📜';
                  if (v.tipo === 'incantesimo') icona = v.livello === 0 ? '✨' : '🪄';
                  else if (v.tipo === 'equip') icona = v.sottoTipo === 'Arma' ? '⚔️' : v.sottoTipo === 'Armatura' ? '🛡️' : v.sottoTipo === 'Pozione' ? '🧪' : v.sottoTipo === 'Strumento' ? '⚒️' : '🎒';
                  else if (v.tipo === 'privilegio') icona = '🛡️';
                  else if (v.tipo === 'talento') icona = v.sottoTipo === 'Invocazione Occulta' ? '👁️' : v.sottoTipo === 'Infusione dell’Artefice' ? '⚙️' : v.sottoTipo === 'Metamagia' ? '🔮' : '⭐';
                  else if (v.tipo === 'regola') icona = '📜';
                  else if (v.tipo === 'condizione') icona = '🩸';
                  else if (v.tipo === 'bestiario') icona = '🐾';
                  else if (v.tipo === 'specie') icona = v.sottoTipo === 'Specie' ? '🧬' : '✨';
                  else if (v.tipo === 'background') icona = '🎒';
                  else if (v.tipo === 'abilita') icona = v.sottoTipo === 'Caratteristica Base' ? '💪' : '🎯';

                  return (
                    <div
                      key={v.id}
                      onClick={() => setDettaglioSelezionato(v)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        background: isSel ? 'rgba(201,162,39,0.15)' : 'transparent',
                        border: `1px solid ${isSel ? C.goldDark : 'transparent'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSel) e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSel) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13 }}>{icona}</span>
                          <strong style={{ fontSize: 13, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {traduciDato(v.nome)}
                          </strong>
                          {v.livello != null && v.tipo === 'incantesimo' && (
                            <span style={{ fontSize: 10, color: C.inkDim, background: 'rgba(0,0,0,0.05)', padding: '1px 5px', borderRadius: 4 }}>
                              {v.livello === 0 ? (lingua === 'en' ? 'Cantrip' : 'Trucchetto') : `${v.livello}° liv`}
                            </span>
                          )}
                          {v.sottoTipo && (
                            <span style={{ fontSize: 10, color: C.inkDim, background: 'rgba(0,0,0,0.05)', padding: '1px 5px', borderRadius: 4 }}>
                              {v.sottoTipo}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: C.inkDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                          {v.desc ? v.desc.split('\n')[0] : ''}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: C.goldDark }}>›</span>
                    </div>
                  );
                })}
                {risultati.length > 100 && (
                  <div style={{ padding: '8px', textAlign: 'center', fontSize: 11, color: C.inkDim }}>
                    {lingua === 'en' ? `Showing first 100 of ${risultati.length} results. Type to narrow search.` : `Mostrati i primi 100 di ${risultati.length} risultati. Affina la ricerca.`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Colonna Destra: Dettagli e Azioni Rapide */}
          {dettaglioSelezionato && (
            <div
              style={{
                flex: 1.2,
                overflowY: 'auto',
                padding: '16px 20px',
                background: 'rgba(0,0,0,0.015)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.goldDark }}>
                    {traduciDato(dettaglioSelezionato.nome)}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setDettaglioSelezionato(null)}
                    style={{ background: 'none', border: 'none', color: C.inkDim, cursor: 'pointer', fontSize: 13 }}
                  >
                    ✕
                  </button>
                </div>

                {dettaglioSelezionato.sottoTipo && (
                  <div style={{ fontSize: 11, color: C.inkDim, marginBottom: 4, fontWeight: 600 }}>
                    {dettaglioSelezionato.sottoTipo}
                    {dettaglioSelezionato.requisiti && ` · ${dettaglioSelezionato.requisiti}`}
                  </div>
                )}

                {dettaglioSelezionato.tipo === 'incantesimo' && (
                  <div style={{ fontSize: 11.5, color: C.inkDim, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {dettaglioSelezionato.scuola && (
                      <span
                        style={{
                          color: COLORE_SCUOLA[dettaglioSelezionato.scuola.toLowerCase()] || C.goldDark,
                          border: `1px solid ${COLORE_SCUOLA[dettaglioSelezionato.scuola.toLowerCase()] || C.goldDark}66`,
                          background: `${COLORE_SCUOLA[dettaglioSelezionato.scuola.toLowerCase()] || C.goldDark}18`,
                          borderRadius: 5,
                          padding: '1px 6px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        🔮 {traduciDato(dettaglioSelezionato.scuola)}
                      </span>
                    )}
                    <span>⏱ {traduciDato(dettaglioSelezionato.tempo || '1 Azione')}</span>
                    <span>🎯 {dettaglioSelezionato.gittata || 'Tocco'}</span>
                    {dettaglioSelezionato.conc && <span>⏳ {lingua === 'en' ? 'Concentration' : 'Concentrazione'}</span>}
                    {dettaglioSelezionato.rituale && <span>📜 {lingua === 'en' ? 'Ritual' : 'Rituale'}</span>}
                  </div>
                )}
              </div>

              {/* Descrizione completa */}
              <div
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: C.ink,
                  whiteSpace: 'pre-wrap',
                  background: 'rgba(0,0,0,0.02)',
                  padding: '12px',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  flex: 1,
                  overflowY: 'auto',
                }}
              >
                {dettaglioSelezionato.desc || (lingua === 'en' ? 'No detailed description available.' : 'Nessuna descrizione dettagliata disponibile.')}
              </div>

              {/* Bottoni di Azione */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 6 }}>
                {dettaglioSelezionato.tipo === 'incantesimo' && onAggiungiIncantesimo && (
                  <button
                    type="button"
                    style={{
                      ...styles.buttonPrimary,
                      padding: '6px 12px',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onClick={() => {
                      onAggiungiIncantesimo(dettaglioSelezionato);
                      onChiudi();
                    }}
                  >
                    ✨ {t('compendio.aggiungi_grimorio')}
                  </button>
                )}

                {dettaglioSelezionato.tipo === 'equip' && onAggiungiInventario && (
                  <button
                    type="button"
                    style={{
                      ...styles.buttonPrimary,
                      padding: '6px 12px',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onClick={() => {
                      onAggiungiInventario(dettaglioSelezionato);
                      onChiudi();
                    }}
                  >
                    🎒 {t('compendio.aggiungi_inventario')}
                  </button>
                )}

                {dettaglioSelezionato.sottoTipo === 'Arma' && onAggiungiAttacco && (
                  <button
                    type="button"
                    style={{
                      ...styles.buttonSecondary,
                      padding: '6px 12px',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onClick={() => {
                      onAggiungiAttacco(dettaglioSelezionato.raw || dettaglioSelezionato);
                      onChiudi();
                    }}
                  >
                    ⚔️ {t('compendio.aggiungi_attacchi')}
                  </button>
                )}

                {dettaglioSelezionato.tipo === 'condizione' && onApplicaCondizione && (
                  <button
                    type="button"
                    style={{
                      ...styles.buttonPrimary,
                      padding: '6px 12px',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onClick={() => {
                      onApplicaCondizione(dettaglioSelezionato.nome);
                      onChiudi();
                    }}
                  >
                    🩸 {t('compendio.applica_condizione')}
                  </button>
                )}

                {dettaglioSelezionato.tipo === 'talento' && onAggiungiTalento && (
                  <button
                    type="button"
                    style={{
                      ...styles.buttonPrimary,
                      padding: '6px 12px',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onClick={() => {
                      onAggiungiTalento(dettaglioSelezionato);
                      onChiudi();
                    }}
                  >
                    ⭐ {t('compendio.aggiungi_talento')}
                  </button>
                )}

                {dettaglioSelezionato.tipo === 'privilegio' && onAggiungiTalento && (
                  <button
                    type="button"
                    style={{
                      ...styles.buttonPrimary,
                      padding: '6px 12px',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onClick={() => {
                      onAggiungiTalento({
                        nome: dettaglioSelezionato.nome,
                        desc: dettaglioSelezionato.desc,
                        tipo: 'privilegio',
                        sottoTipo: dettaglioSelezionato.sottoTipo,
                      });
                      onChiudi();
                    }}
                  >
                    🛡️ {t('compendio.aggiungi_scheda')}
                  </button>
                )}

                {dettaglioSelezionato.tipo === 'specie' && dettaglioSelezionato.sottoTipo === 'Tratto di Specie' && onAggiungiTalento && (
                  <button
                    type="button"
                    style={{
                      ...styles.buttonPrimary,
                      padding: '6px 12px',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onClick={() => {
                      onAggiungiTalento({
                        nome: dettaglioSelezionato.nome,
                        desc: dettaglioSelezionato.desc,
                        tipo: 'tratto',
                        sottoTipo: dettaglioSelezionato.sottoTipo,
                      });
                      onChiudi();
                    }}
                  >
                    🧬 {t('compendio.aggiungi_scheda')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
