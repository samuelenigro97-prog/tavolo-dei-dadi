import re

# (italian_exact, key, english)
TITLES = [
  ("Valore personalizzato","tip.valore_pers","Custom value"),
  ("Apri: dettagli e modifica","tip.apri_dettagli","Open: details and edit"),
  ("Chiudi","tip.chiudi","Close"),
  ("Trascina per riordinare le sezioni","tip.trascina_sezioni","Drag to reorder sections"),
  ("Menu iniziale: nuovo personaggio, carica","tip.menu_iniziale","Start menu: new character, load"),
  ("Esporta la scheda come file JSON (backup o trasferimento)","tip.esporta","Export the sheet as a JSON file (backup or transfer)"),
  ("Importa una scheda da file JSON (crea un nuovo personaggio)","tip.importa","Import a sheet from a JSON file (creates a new character)"),
  ("Assistente al Passaggio di Livello","tip.levelup","Level-Up Assistant"),
  ("Rinomina il personaggio","tip.rinomina","Rename the character"),
  ("Nuovo personaggio","tip.nuovo_pg","New character"),
  ("Duplica il personaggio attivo","tip.duplica","Duplicate the active character"),
  ("Azzera i campi del personaggio attivo","tip.azzera","Reset the active character's fields"),
  ("Elimina il personaggio attivo","tip.elimina_pg","Delete the active character"),
  ("Click: carica l'immagine del personaggio","tip.carica_img","Click: upload the character image"),
  ("Rimuovi immagine","tip.rimuovi_img","Remove image"),
  ("Scegli la specie (imposta velocità, sensi, taglia, tratti e avatar)","tip.scegli_specie","Choose the species (sets speed, senses, size, traits and avatar)"),
  ("Scegli la taglia","tip.scegli_taglia","Choose the size"),
  ("Scegli l'allineamento","tip.scegli_allineamento","Choose the alignment"),
  ("Scegli un background (imposta le competenze nelle abilità)","tip.scegli_background","Choose a background (sets skill proficiencies)"),
  ("Scegli la classe (imposta TS, addestramento, incantatore, slot, dado vita e avatar)","tip.scegli_classe","Choose the class (sets saves, training, spellcasting, slots, hit die and avatar)"),
  ("Sottoclasse (imposta anche i privilegi di sottoclasse fino al tuo livello)","tip.scegli_sottoclasse","Subclass (also sets subclass features up to your level)"),
  ("CA calcolata da armatura, scudo e bonus","tip.ca_calcolata","AC computed from armor, shield and bonus"),
  ("Senza competenza: svantaggio a prove, TS e attacchi basati su Forza e Destrezza, e non puoi lanciare incantesimi.","tip.senza_comp_armatura","Not proficient: disadvantage on Strength/Dexterity checks, saves and attacks, and you can't cast spells."),
  ("Resistenze ai danni: scegli dalla tendina o scrivi","tip.resistenze","Damage resistances: pick from the menu or type"),
  ("Sensi: scegli dalla tendina o scrivi (es. Scurovisione 18 m)","tip.sensi","Senses: pick from the menu or type (e.g. Darkvision 18 m)"),
  ("1 click: modifica","tip.click_modifica","1 click: edit"),
  ("Diminuisci","tip.diminuisci","Decrease"),
  ("Aumenta","tip.aumenta","Increase"),
  ("Ispirazione: spendila per avere vantaggio a un tiro o ripetere un dado","tip.ispirazione","Inspiration: spend it to gain advantage on a roll or reroll a die"),
  ("Click per rimuovere","tip.click_rimuovi","Click to remove"),
  ("Aggiungi una condizione","tip.aggiungi_condizione","Add a condition"),
  ("Cosa governa questa caratteristica?","tip.cosa_governa","What does this ability govern?"),
  ("Punteggio di caratteristica (click per modificare)","tip.punteggio_car","Ability score (click to edit)"),
  ("Nome della risorsa","tip.nome_risorsa","Resource name"),
  ("Rimuovi la risorsa","tip.rimuovi_risorsa","Remove the resource"),
  ("Spendi","tip.spendi","Spend"),
  ("Recupera","tip.recupera","Recover"),
  ("Quando si ricarica","tip.quando_ricarica","When it recharges"),
  ("Panoramica ordinata dei privilegi di classe e sottoclasse per livello","tip.panoramica_priv","Ordered overview of class and subclass features by level"),
  ("Scegli un'arma standard: compila danno, tipo, proprietà e bonus","tip.scegli_arma","Choose a standard weapon: fills damage, type, properties and bonus"),
  ("Click per modificare · 🎲 per tirare i danni","tip.click_mod_danni","Click to edit · 🎲 to roll damage"),
  ("Slot totali del livello","tip.slot_totali","Total slots for the level"),
  ("Trucchetti conosciuti / massimo (modificabile).","tip.conteggio_trucchetti","Cantrips known / max (editable)."),
  ("Incantesimi (liv. 1+) noti o preparati / massimo (modificabile).","tip.conteggio_incantesimi","Spells (lvl 1+) known or prepared / max (editable)."),
  ("Cosa fa questo incantesimo?","tip.cosa_fa_inc","What does this spell do?"),
  ("Modifica","tip.modifica","Edit"),
  ("Elimina incantesimo","tip.elimina_inc","Delete spell"),
  ("Opzioni di Metamagia attive","tip.metamagia_attive","Active Metamagic options"),
]
PLACEHOLDERS = [
  ("Scrivi o scegli dalla lista…","ph.inc_nome","Type or pick from the list…"),
  ("Componenti, TS, concentrazione…","ph.inc_note","Components, saves, concentration…"),
  ("Nome del talento","ph.talento","Feat name"),
]

app = open('src/App.jsx', encoding='utf-8').read()
i18n = open('src/i18n.js', encoding='utf-8').read()

# Fix literal-braces bug
app = app.replace('title="{t(\'menu.pg_casuale_tooltip\')}"', "title={t('menu.pg_casuale_tooltip')}")

def esc(s): return s.replace('\\','\\\\')

it_lines=[]; en_lines=[]
seen=set()
missing=[]
for ita,key,eng in TITLES:
    old = f'title="{ita}"'
    new = f"title={{t('{key}')}}"
    if old in app:
        app = app.replace(old, new)
    else:
        missing.append(('TITLE',ita))
    if key not in seen:
        it_lines.append(f"    '{key}': {repr_it(ita) if False else ''}")
        seen.add(key)

# build i18n insert strings (dedup keys)
seen=set(); itbuf=[]; enbuf=[]
for ita,key,eng in TITLES+PLACEHOLDERS:
    if key in seen: continue
    seen.add(key)
    def q(s): return "'"+s.replace("\\","\\\\").replace("'","\\'")+"'"
    itbuf.append(f"    {q(key)}: {q(ita)},")
    enbuf.append(f"    {q(key)}: {q(eng)},")

for ita,key,eng in PLACEHOLDERS:
    old=f'placeholder="{ita}"'; new=f"placeholder={{t('{key}')}}"
    if old in app: app=app.replace(old,new)
    else: missing.append(('PH',ita))

# insert into i18n: before IT end (line '  },' at boundary) and EN end ('  }' before '};')
lines=i18n.split('\n')
# find IT end: first '  },' after 'it: {'
it_start=next(i for i,l in enumerate(lines) if l.strip()=='it: {')
it_end=next(i for i in range(it_start,len(lines)) if lines[i]=='  },')
en_start=next(i for i in range(it_end,len(lines)) if lines[i].strip()=='en: {')
en_end=next(i for i in range(en_start,len(lines)) if lines[i]=='  }')
# insert EN first (higher index) to not shift IT index
lines[en_end:en_end]=enbuf
lines[it_end:it_end]=itbuf
i18n='\n'.join(lines)

open('src/App.jsx','w',encoding='utf-8').write(app)
open('src/i18n.js','w',encoding='utf-8').write(i18n)
print("inserted IT keys:",len(itbuf),"EN keys:",len(enbuf))
print("missing (not found in app):")
for t,s in missing: print("  ",t,repr(s))
