import os

out_dir = '/Users/samuele/.gemini/antigravity/scratch/tavolo-dei-dadi/src/dati/'

artefice_js = """export const ARTEFICE = {
  nome: 'Artefice',
  dado_vita: 'd8',
  tiri_salvezza: ['Costituzione', 'Intelligenza'],
  competenze: {
    armature: ['Armature leggere', 'Armature medie', 'Scudi'],
    armi: ['Armi semplici'],
    strumenti: ['Strumenti da ladro', 'Strumenti da inventore', 'Uno strumento da artigiano a scelta'],
    abilita: ['Scegli due abilità tra Arcano, Indagare, Medicina, Natura, Percezione, Rapidità di Mano e Storia']
  },
  privilegi: {
    1: [{nome: 'Magia', desc: 'Puoi lanciare incantesimi.'}, {nome: 'Rattoppo Magico', desc: 'Crei oggetti magici temporanei.'}],
    2: [{nome: 'Infondere Oggetti', desc: 'Infondi magia negli oggetti.'}],
    3: [{nome: 'Specialista Artefice', desc: 'Scegli la sottoclasse.'}, {nome: 'Strumento Adeguato', desc: 'Crei strumenti dal nulla.'}],
    4: [{nome: 'Incremento dei Punteggi di Caratteristica', desc: '+2 a una o due abilità o un talento.'}],
    5: [{nome: 'Privilegio di Specializzazione', desc: 'Nuovo privilegio.'}],
    6: [{nome: 'Competenza negli Strumenti', desc: 'Raddoppi bonus competenza per strumenti.'}],
    7: [{nome: 'Lampo di Genio', desc: 'Aggiungi Intelligenza ai tiri salvezza o prove.'}],
    9: [{nome: 'Privilegio di Specializzazione', desc: 'Nuovo privilegio.'}],
    10: [{nome: 'Adepto degli Oggetti Magici', desc: 'Puoi sintonizzarti a 4 oggetti.'}],
    11: [{nome: 'Oggetto Conserva Incantesimo', desc: 'Immagazzini un incantesimo in un oggetto.'}],
    14: [{nome: 'Erudito degli Oggetti Magici', desc: 'Sintonizzazione a 5 oggetti, ignori requisiti di razza/classe/livello.'}],
    15: [{nome: 'Privilegio di Specializzazione', desc: 'Nuovo privilegio.'}],
    18: [{nome: 'Maestro degli Oggetti Magici', desc: 'Sintonizzazione a 6 oggetti.'}],
    20: [{nome: 'Anima dell\\'Artefice', desc: '+1 tiri salvezza per ogni oggetto sintonizzato e, se scendi a 0 PF, puoi far finire un\\'infusione per rimanere a 1 PF.'}]
  },
  sottoclassi: {
    'Alchimista': {
      3: [{nome: 'Competenza negli Strumenti', desc: 'Ottieni competenza con scorte da alchimista.'}, {nome: 'Incantesimi da Alchimista', desc: 'Parola Guaritrice, Raggio di Assideramento, ecc.'}, {nome: 'Elisir Sperimentale', desc: 'Crei elisir con effetti casuali al riposo lungo.'}],
      5: [{nome: 'Sapiente Alchemico', desc: 'Aggiungi Intelligenza ai danni di incantesimi o alle cure.'}],
      9: [{nome: 'Reagenti Ricostituenti', desc: 'Gli elisir donano PF temporanei e puoi lanciare Ristorare Inferiore gratis.'}],
      15: [{nome: 'Maestria Chimica', desc: 'Resistenza a danni da acido e veleno, immune a condizione avvelenato. Puoi lanciare Guarigione o Ristorare Superiore.'}]
    },
    'Fabbro da Battaglia': {
      3: [{nome: 'Competenza negli Strumenti', desc: 'Competenza con strumenti da fabbro.'}, {nome: 'Incantesimi da Fabbro', desc: 'Eroismo, Scudo, ecc.'}, {nome: 'Pronto alla Battaglia', desc: 'Usi Intelligenza per attaccare e danni con armi magiche.'}, {nome: 'Difensore d\\'Acciaio', desc: 'Ottieni un compagno costrutto robotico che combatte con te.'}],
      5: [{nome: 'Attacco Extra', desc: 'Puoi attaccare due volte con l\\'azione di Attacco.'}],
      9: [{nome: 'Sbalzo Arcano', desc: 'Aggiungi 2d6 danni a un attacco o curi 2d6 PF a un alleato.'}],
      15: [{nome: 'Difensore Migliorato', desc: 'Il difensore riceve bonus alla CA e danni di Sbalzo Arcano aumentano a 4d6.'}]
    },
    'Artigliere': {
      3: [{nome: 'Competenza negli Strumenti', desc: 'Competenza con strumenti da intagliatore.'}, {nome: 'Incantesimi da Artigliere', desc: 'Scudo, Onda Tonante, ecc.'}, {nome: 'Cannone Occulto', desc: 'Crei un piccolo cannone (Lanciafiamme, Balista o Protettore).'}],
      5: [{nome: 'Arma da Fuoco Arcana', desc: 'Usi bacchetta o bastone per lanciare incantesimi aggiungendo 1d8 danni.'}],
      9: [{nome: 'Cannone Esplosivo', desc: 'Cannone fa 1d8 danni extra. Puoi farlo esplodere.'}],
      15: [{nome: 'Posizione Fortificata', desc: 'Puoi avere 2 cannoni attivi e forniscono mezza copertura.'}]
    },
    'Armaiolo': {
      3: [{nome: 'Competenza negli Strumenti', desc: 'Competenza con strumenti da fabbro per armature.'}, {nome: 'Incantesimi da Armaiolo', desc: 'Dardo Incantato, Nube di Nebbia, ecc.'}, {nome: 'Armatura Arcana', desc: 'Trasformi un\\'armatura in magica, espande le tue capacità e ingloba armi speciali.'}, {nome: 'Modello di Armatura', desc: 'Scegli assetto Guardiano (mischia) o Infiltratore (distanza, furtività).'}],
      5: [{nome: 'Attacco Extra', desc: 'Puoi attaccare due volte.'}],
      9: [{nome: 'Modifiche per Armatura', desc: 'L\\'armatura conta come parti separate (torso, elmo, ecc.) ai fini delle infusioni (infusioni massime +2).'}],
      15: [{nome: 'Armatura Perfezionata', desc: 'I modelli di armatura ricevono potenziamenti specifici (attrazione per guardiano, danni extra per infiltratore).'}],
    }
  },
  infusioni: [
    {nome: 'Arma Radiosa', desc: 'L\\'arma emette luce e ha +1 attacco/danni. Può accecare come reazione.'},
    {nome: 'Arma Ripetente', desc: 'L\\'arma magica +1 genera automaticamente le proprie munizioni e ignora la proprietà ricarica.'},
    {nome: 'Armatura della Forza Magica', desc: 'Armatura magica. Permette di usare reazione per evitare di essere spinti o cadere.'},
    {nome: 'Colpo Potenziato', desc: '+1 tiro per colpire e danni arma.'},
    {nome: 'Difesa Potenziata', desc: '+1 CA per armatura o scudo.'},
    {nome: 'Focalizzatore Arcano Potenziato', desc: '+1 tiri incantesimo e ignora mezza copertura.'},
    {nome: 'Mente Acuta', desc: 'Oggetto magico dà vantaggio in prove per mantenere concentrazione.'},
    {nome: 'Protesi Magica', desc: 'Crea un arto artificiale funzionante.'},
    {nome: 'Replicare Oggetto Magico', desc: 'Puoi replicare uno specifico oggetto magico dalla tabella delle regole.'},
    {nome: 'Ritorno dell\\'Arma', desc: 'Arma con proprietà lancio ottiene +1 e ritorna in mano subito dopo l\\'attacco.'}
  ],
  incantesimi: {
    trucchetti: ['Fiamma Creata', 'Guida', 'Lama Booming', 'Lama di Fiamma Verde', 'Luce', 'Mano Magica', 'Messaggio', 'Prestidigitazione', 'Raggio di Gelo', 'Rattoppo', 'Resistenza', 'Scossa', 'Sferzata Spinale', 'Spruzzo Velenoso', 'Trucco della Corda'],
    livello_1: ['Allarme', 'Assorbire Elementi', 'Caduta Morbida', 'Camuffare Se Stesso', 'Cura Ferite', 'Falso Vita', 'Identificare', 'Individuazione della Magia', 'Passo Veloce', 'Purificare Cibo e Bevande', 'Santuario', 'Scattare', 'Saltare', 'Unto'],
    // Livelli successivi
  }
};
"""
with open(os.path.join(out_dir, 'artefice.js'), 'w') as f:
    f.write(artefice_js)
