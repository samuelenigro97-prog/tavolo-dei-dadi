// Traduzioni inglesi delle descrizioni lunghe.
//
// Le CHIAVI restano in italiano: sono i nomi salvati nella scheda del
// personaggio (che non cambiano con la lingua). Qui c'è solo il testo mostrato
// quando l'interfaccia è in inglese; le voci non ancora tradotte ricadono
// automaticamente sull'italiano.

export const EN_METAMAGIA = {
  'Incantesimo Accurato': "*Cost: 1 Sorcery Point.*\nWhen you cast a spell that forces other creatures to make a saving throw or that makes an attack roll, you can shield your allies. Choose a number of creatures up to your Charisma modifier (minimum 1): those creatures automatically succeed on the saving throw and take no damage where they would normally take half, and the spell's attack rolls automatically miss those targets.",
  'Incantesimo Ammaliante': "*Cost: 1 Sorcery Point.*\nWhen you cast an Enchantment or Illusion spell, you can spend 1 point so the target creature has no idea that you were the one who charmed it or influenced its mind.",
  'Incantesimo Celato': "*Cost: 1 Sorcery Point.*\nThe spell is cast without any Verbal, Somatic or Material component (unless the Material component is consumed or has a specific gold-piece cost listed in the spell's description). Perfect for casting unnoticed, or while bound or silenced.",
  'Incantesimo Empio': '*Cost: 1 Sorcery Point.*\nWhen you cast a spell that deals damage, you can change the damage type to necrotic, psychic or radiant, drawing on celestial or chthonic forces.',
  'Incantesimo Esteso': "*Cost: 1 Sorcery Point.*\nWhen you cast a spell with a duration of 1 minute or longer, you can spend 1 Sorcery Point to double its duration, up to a maximum of 24 hours. (If the spell requires concentration, you also gain Advantage on Constitution saving throws to maintain it.)",
  'Incantesimo Gemello': '*Cost: 1 Sorcery Point, or points equal to the spell level.*\n- **Modern option:** when you cast a spell that can target additional creatures at higher slot levels (e.g. *Charm Person*, *Hold Person*), you can spend 1 point to raise the effective slot level by 1 without spending a higher slot.\n- **Classic option:** if a spell targets only one creature and has no range of self, spend points equal to the slot level to target a second creature within range.',
  'Incantesimo Persistente': '*Cost: 3 Sorcery Points.*\nWhen you cast a spell that forces a creature to make a saving throw to resist its effects, you can spend 3 Sorcery Points to impose **Disadvantage** on its first saving throw made against the spell.',
  'Incantesimo Potenziato': "*Cost: 1 Sorcery Point.*\nWhen you roll damage for a spell, you can spend 1 Sorcery Point to reroll a number of damage dice up to your Charisma modifier (minimum one die). You must use the new rolls. You can use *Empowered Spell* even if you have already used another Metamagic option on the same casting.",
  'Incantesimo Preciso': "*Cost: 1 Sorcery Point.*\nWhen you cast a spell that forces other creatures to make a saving throw, you can protect some of them from the spell's full force. Spend 1 Sorcery Point and choose a number of creatures up to your Charisma modifier (minimum one). The chosen creatures automatically succeed on their saving throws against the spell and take no damage where they would normally take half on a success. You can use this option alongside another Metamagic option.",
  'Incantesimo Prolungato': '*Cost: 1 Sorcery Point.*\nWhen you cast a spell with a range of at least 1.5 m, you can double its range. If the spell has a range of touch, you can make the range 9 m instead.',
  'Incantesimo Rapido': '*Cost: 2 Sorcery Points.*\nWhen you cast a spell with a casting time of 1 action, you can spend 2 Sorcery Points to change the casting time to **1 bonus action** for that casting.',
  'Incantesimo Sottile': "*Cost: 1 Sorcery Point.*\nThe spell is cast without any Verbal, Somatic or Material component (unless the Material component is consumed or has a specific gold-piece cost listed in the spell's description).",
  'Incantesimo Trasmutato': '*Cost: 1 Sorcery Point.*\nWhen you cast a spell that deals acid, cold, fire, lightning, poison or thunder damage, you can spend 1 Sorcery Point to change that damage type to another one from that list.',
};

export const EN_TALENTI = {
  'Incantatore da Guerra': '*Prerequisite: the ability to cast at least one spell.*\n\n- Advantage on Constitution saving throws to maintain Concentration.\n- You can perform the somatic components of spells even with weapons or a shield in one or both hands.\n- You can cast a spell as an Opportunity Attack instead of making a melee attack.',
  'Guaritore': '*You are a skilled medic, able to close wounds and revive the fallen quickly and effectively.*\n\n- **Stabilise and Revive:** when you use a healer’s kit to stabilise a dying creature, that creature immediately regains 1 Hit Point.\n- **Battle Medicine:** as an action, you can use a healer’s kit to heal a creature for **1d6 + 4 HP** plus a number of HP equal to its maximum Hit Dice (or spend one of the target’s Hit Dice plus its Constitution modifier and your proficiency bonus). A creature cannot regain HP this way more than once per short or long rest.\n- **Improved Healing:** when you cast a healing spell or use a kit, you can reroll 1s on the healing dice.',
  'Robusto': '*Your body is exceptionally hardy.*\n\n- Your Hit Point maximum increases by an amount equal to twice your level when you gain this feat.\n- Every time you gain a level afterwards, your Hit Point maximum increases by an additional 2 points.',
  'Fortunato': '*You have an inexplicable luck that protects you.*\n\n- You have 3 luck points.\n- When you make an attack roll, an ability check or a saving throw, you can spend one point to roll an additional d20 and choose which one to use.\n- You can also spend a point when an attack is made against you, to force that roll to be rerolled.',
  'Vigile': '*You are always on the lookout for danger.*\n\n- You gain a +5 bonus to Initiative.\n- You cannot be surprised while you are conscious.\n- Hidden creatures do not gain advantage on attack rolls against you.',
  'Attaccante Selvaggio': 'Once per turn you can reroll the damage dice of a melee attack.',
  'Tiratore Scelto': 'Ignore cover and long-range penalties, no disadvantage at range; optional extra damage.',
  'Grande Maestro d’Armi': 'Boosted damage with heavy weapons and a bonus attack after a critical hit or a kill.',
  'Maestro delle Armi': 'You are proficient with, and more effective using, more weapon types.',
  'Sentinella': 'You stop those you hit with opportunity attacks and protect nearby allies.',
  'Osservatore': 'Bonus to Perception and Investigation; you can read lips.',
  'Mobile': 'Increased speed and no opportunity attacks from creatures you attack in melee.',
  'Iniziato alla Magia': 'You learn two cantrips and one 1st-level spell from a class.',
  'Attore': 'Bonus to Deception and Performance; you can mimic voices and sounds.',
  'Resiliente': 'You gain proficiency in one saving throw and +1 to the related ability.',
  'Esperto di Abilità': 'Proficiency (or expertise) in skills/tools of your choice.',
  'Combattente con Due Armi': 'Bonus to AC while fighting with two weapons, and you can wield non-light ones.',
  'Cuoco': 'You prepare food that heals and grants temporary hit points.',
  'Padrone delle Armature Pesanti': 'Proficiency with heavy armour and +1 Constitution.',
  'Maestro di Scudo': 'You use your shield to shove and to protect yourself better from area effects.',
};

export const EN_TRATTI = {
  // Sensi
  'Scurovisione': 'You can see in the dark within a certain distance (in black and white); in total darkness you see as if in dim light.',
  'Percezione cieca': 'You sense your surroundings without seeing, within a short distance.',
  'Percezione tremorsensitiva': 'You sense creatures and objects in contact with the ground through vibrations.',
  'Vista vera': 'You see through normal and magical darkness, see invisible creatures and true forms (illusions, shapechangers).',
  // Elfo
  'Trance': 'You do not sleep: 4 hours of alert meditation count as an 8-hour long rest.',
  'Retaggio Fatato': 'Advantage on saving throws against being charmed; magic cannot put you to sleep.',
  'Retaggio fatato': 'Advantage on saving throws against being charmed; magic cannot put you to sleep.',
  'Sensi Acuti': 'Proficiency in one skill of your choice among Insight, Perception or Survival.',
  'Sensi acuti': 'Proficiency in one skill of your choice among Insight, Perception or Survival.',
  // Gnomo
  'Astuzia gnomesca': 'Advantage on Intelligence, Wisdom and Charisma saving throws against magic.',
  // Nano
  'Robustezza nanica': 'Increased maximum HP (+1 per level) thanks to dwarven resilience.',
  'Scalpellino': "Proficiency with mason's tools; you can recognise the origin of stonework.",
  'Resistenza al veleno': 'Advantage on saving throws against poison, and resistance to poison damage.',
  // Halfling
  'Coraggioso': 'Advantage on saving throws against being frightened.',
  'Agilità halfling': 'You can move through the space of creatures larger than you.',
  'Fortuna': 'When you roll a 1 on the d20 for an attack, a check or a saving throw, you can reroll the die.',
  'Furtività naturale': 'You can try to hide even when obscured only by a creature larger than you.',
  // Aasimar
  'Resistenza celestiale': 'Resistance to necrotic and radiant damage.',
  'Mani guaritrici': 'You can heal HP equal to your level, once per long rest.',
  'Portatore di luce': 'You know the Light cantrip.',
  // Dragonide
  'Arma a soffio': 'You can replace an attack with an elemental breath that hits an area.',
  'Resistenza al danno': 'You have resistance to a damage type tied to your lineage.',
  'Antenati draconici': 'Your dragon type determines your breath damage and your resistance.',
  // Goliath
  'Retaggio dei giganti': 'You gain a benefit tied to a type of giant.',
  'Corporatura potente': 'You count as one size larger for carrying capacity and grappling.',
  // Orco
  'Scatto adrenalinico': 'As a bonus action you can Dash and gain temporary HP.',
  'Resistenza implacabile': 'When you would drop to 0 HP, you drop to 1 instead (once per long rest).',
  // Tiefling
  'Presenza ultraterrena': 'You know the Thaumaturgy cantrip.',
  // Umano (2024)
  'Pieno di risorse': 'You gain Inspiration after every long rest.',
  'Abile': 'Proficiency in one skill of your choice.',
  'Versatile': 'You gain one origin feat of your choice.',
};

// Privilegi di classe (categoria diversa dai tratti di specie).
export const EN_PRIVILEGI = {
  'Linguaggio druidico': 'You know the secret language of druids. Those who know it can leave hidden messages and decipher them.',
  'Druidico': 'You know the secret language of druids. You can leave or find messages hidden in nature.',
  'Lingua del sole e della luna': 'You understand and can make yourself understood in any language.',
};
