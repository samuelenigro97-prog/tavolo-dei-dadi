// Migrazioni "storiche" per i personaggi predefiniti del tavolo (Vaelion,
// Wendell, Elevorn, Flyora, Lyrian). Erano prima sparse dentro il caricamento
// del roster in App.jsx: spostate qui, tali e quali, per essere più facili da
// trovare, leggere e testare separatamente dal resto del caricamento.
//
// NON è un meccanismo generico di "personaggio predefinito": riconosce questi
// nomi specifici (case-insensitive) — o il loro id di seed, es. 'pg-vaelion' —
// e corregge/completa i loro dati quando mancano o sono rimasti indietro
// rispetto a un aggiornamento delle regole o dell'equipaggiamento di partenza.
//
// ATTENZIONE per chi riprende in mano il codice: il riconoscimento primario è
// per NOME, non per id stabile (l'id da solo non basta, perché un vecchio
// re-import può avergli assegnato un id diverso da 'pg-vaelion'). Se qualcuno
// al tavolo crea un personaggio chiamato per l'appunto "Vaelion" o "Wendell",
// queste funzioni gli applicheranno le stesse correzioni pensate per
// l'originale (es. forzare la sottoclasse a Circolo del Pastore). È un limite
// noto, non ancora corretto: stringere la condizione a "solo id" richiede
// prima di verificare, sui dati salvati reali, che l'id del personaggio vero
// sia davvero rimasto stabile nel tempo — altrimenti si rischia di smettere
// di correggere proprio l'originale.

import { VAELION_JSON, WENDELL_JSON, ELEVORN_JSON, FLYORA_JSON, LYRIAN_JSON } from './esempi.js';

/** Assicura equipaggiamento e sintonia corretti per Mantello, Perla e Guanti di Vaelion. */
export function fixEquipaggiamentoVaelion(roster) {
  for (const k of Object.keys(roster.personaggi)) {
    const s = roster.personaggi[k];
    if (!s || !/vaelion/i.test(s.nome || '')) continue;
    if (Array.isArray(s.inventario)) {
      for (const o of s.inventario) {
        if (/mantello (?:della |di )?prot/i.test(o.nome || '')) {
          o.equip = true;
          o.richiedeSintonia = true;
          o.effettoMeccanico = 'classe_armatura_tiri_salvezza_1';
        } else if (/guanti/i.test(o.nome || '')) {
          o.equip = true;
          o.richiedeSintonia = true;
          o.effettoMeccanico = 'forza_impostata_19';
          if (/potere/i.test(o.nome || '')) o.nome = 'Guanti della Forza Orchesca';
        } else if (/perla del pot/i.test(o.nome || '')) {
          o.equip = true;
          o.richiedeSintonia = true;
        }
      }
    }
    const defaultSintoniaVaelion = ['Mantello della Protezione', 'Perla del Potere', 'Guanti della Forza Orchesca'];
    if (!Array.isArray(s.sintonia) || s.sintonia.length === 0) {
      s.sintonia = [...defaultSintoniaVaelion];
    } else {
      for (const voce of defaultSintoniaVaelion) {
        const normVoce = voce.toLowerCase();
        if (!s.sintonia.some((x) => String(x).toLowerCase().includes(normVoce.slice(0, 7)))) {
          if (s.sintonia.length < 3) s.sintonia.push(voce);
        }
      }
    }
  }
}

/** Migrazione Vaelion 5.0 (2014) & Circolo del Pastore. */
export function migrazioneRegoleVaelion(roster) {
  for (const k of Object.keys(roster.personaggi)) {
    const s = roster.personaggi[k];
    if (!s || !/vaelion/i.test(s.nome || '')) continue;
    if (s.versione === '2024') s.versione = '2014';
    if (s.sottoclasse === 'Circolo della Luna' || !s.sottoclasse) {
      s.sottoclasse = 'Circolo del Pastore';
    }
    if (Array.isArray(s.risorse)) {
      const idxForma = s.risorse.findIndex((r) => /forma selvatica/i.test(r.nome || ''));
      if (idxForma !== -1 && (s.risorse[idxForma].nome || '').includes('GS 3')) {
        s.risorse[idxForma].nome = 'Forma Selvatica (2/riposo breve, GS max 1, Nuotare/Volare)';
      }
      const hasTotem = s.risorse.some((r) => /totem spirituale/i.test(r.nome || ''));
      if (!hasTotem) {
        s.risorse.push({ nome: 'Totem Spirituale (Aura)', max: 1, attuali: 1, reset: 'Breve' });
      }
    }
    if (Array.isArray(s.incantesimiLista)) {
      // Rimuovi 'Folata' se presente nei trucchetti di Vaelion (i 4 canonici sono Randello Incantato, Frusta di Spine, Guida, Morsa del Gelo)
      s.incantesimiLista = s.incantesimiLista.filter((inc) => !(inc.livello === 0 && /^folata$/i.test(String(inc.nome || '').trim())));
    }
    if (s.maxTrucchetti === 5) s.maxTrucchetti = 0;
  }
}

/**
 * Auto-idratazione campi background e competenze per i cinque personaggi
 * predefiniti, uno alla volta (va chiamata dentro il loop che già itera su
 * `roster.personaggi`). Muta `s` in place, come le funzioni sopra.
 */
export function autoIdratazionePersonaggioPredefinito(s, id) {
  if (/vaelion/i.test(s.nome) || id === 'pg-vaelion') {
    if (!s.note && VAELION_JSON.note) s.note = VAELION_JSON.note;
    if (!s.trattiCaratteriali && VAELION_JSON.trattiCaratteriali) s.trattiCaratteriali = VAELION_JSON.trattiCaratteriali;
    if (!s.ideali && VAELION_JSON.ideali) s.ideali = VAELION_JSON.ideali;
    if (!s.legami && VAELION_JSON.legami) s.legami = VAELION_JSON.legami;
    if (!s.difetti && VAELION_JSON.difetti) s.difetti = VAELION_JSON.difetti;
    if (!s.nemici && VAELION_JSON.nemici) s.nemici = VAELION_JSON.nemici;
    if (!s.sensi && VAELION_JSON.sensi) s.sensi = VAELION_JSON.sensi;
    if (s.abilita) {
      if (s.abilita.addestrareAnimali === 1) s.abilita.addestrareAnimali = 2;
      if (s.abilita.natura === 1) s.abilita.natura = 2;
      if (s.abilita.percezione === 1) s.abilita.percezione = 2;
    }
    if (s.trattiSpecie && (!s.trattiSpecie.includes('Sensi Acuti') || s.trattiSpecie.includes('Vedi nella penombra') || /scurovisione/i.test(s.trattiSpecie)) && VAELION_JSON.trattiSpecie) {
      s.trattiSpecie = VAELION_JSON.trattiSpecie;
    }
    if (s.privilegi && (s.privilegi.includes('PRIVILEGI DI CLASSE') || !s.privilegi.includes('Druidico')) && VAELION_JSON.privilegi) {
      s.privilegi = VAELION_JSON.privilegi;
      s.privilegiSottoclasse = VAELION_JSON.privilegiSottoclasse;
    }
    if (s.addestramento && (!s.addestramento.armi || !s.addestramento.armi.includes('scimitarre')) && VAELION_JSON.addestramento) {
      s.addestramento = { ...s.addestramento, armi: VAELION_JSON.addestramento.armi };
    }
    if (Array.isArray(s.attacchi) && !s.attacchi.some((a) => /randello incantato|shillelagh/i.test(a.nome))) {
      s.attacchi = VAELION_JSON.attacchi;
    }
    if (Array.isArray(s.incantesimiLista)) {
      const haRandello = s.incantesimiLista.some((x) => /randello incantato|shillelagh/i.test(x.nome));
      if (!haRandello) {
        s.incantesimiLista.unshift({ id: "vi-00", nome: "Randello Incantato", livello: 0, preparato: true, tempo: "Azione Bonus", gittata: "Tocco", note: "1 min: usa SAG su randello/bastone, danno 1d8" });
      }
    }
  } else if (/wendell/i.test(s.nome) || id === 'pg-wendell') {
    if (!s.note && WENDELL_JSON.note) s.note = WENDELL_JSON.note;
    if (!s.trattiCaratteriali && WENDELL_JSON.trattiCaratteriali) s.trattiCaratteriali = WENDELL_JSON.trattiCaratteriali;
    if (!s.ideali && WENDELL_JSON.ideali) s.ideali = WENDELL_JSON.ideali;
    if (!s.legami && WENDELL_JSON.legami) s.legami = WENDELL_JSON.legami;
    if (!s.difetti && WENDELL_JSON.difetti) s.difetti = WENDELL_JSON.difetti;
    if (!s.nemici && WENDELL_JSON.nemici) s.nemici = WENDELL_JSON.nemici;
    if (s.privilegi && s.privilegi.includes('PRIVILEGI DI CLASSE') && WENDELL_JSON.privilegi) {
      s.privilegi = WENDELL_JSON.privilegi;
      s.privilegiSottoclasse = WENDELL_JSON.privilegiSottoclasse;
    }
    if (s.trattiSpecie && (s.trattiSpecie.includes('Fortunato:') || /scurovisione/i.test(s.trattiSpecie)) && WENDELL_JSON.trattiSpecie) {
      s.trattiSpecie = WENDELL_JSON.trattiSpecie;
    }
    if (s.abilita) {
      if (s.abilita.intrattenere === 1) s.abilita.intrattenere = 2;
      if (s.abilita.percezione === 1) s.abilita.percezione = 2;
    }
  } else if (/elevorn/i.test(s.nome) || id === 'pg-elevorn') {
    if (!s.note && ELEVORN_JSON.note) s.note = ELEVORN_JSON.note;
    if (!s.trattiCaratteriali && ELEVORN_JSON.trattiCaratteriali) s.trattiCaratteriali = ELEVORN_JSON.trattiCaratteriali;
    if (!s.ideali && ELEVORN_JSON.ideali) s.ideali = ELEVORN_JSON.ideali;
    if (!s.legami && ELEVORN_JSON.legami) s.legami = ELEVORN_JSON.legami;
    if (!s.difetti && ELEVORN_JSON.difetti) s.difetti = ELEVORN_JSON.difetti;
    if (!s.nemici && ELEVORN_JSON.nemici) s.nemici = ELEVORN_JSON.nemici;
    if (s.privilegi && s.privilegi.includes('MULTICLASSE:') && ELEVORN_JSON.privilegi) {
      s.privilegi = ELEVORN_JSON.privilegi;
    }
    if (s.trattiSpecie && (s.trattiSpecie.includes('Retaggio Fatato:') || /scurovisione/i.test(s.trattiSpecie)) && ELEVORN_JSON.trattiSpecie) {
      s.trattiSpecie = ELEVORN_JSON.trattiSpecie;
    }
    if (s.abilita) {
      if (s.abilita.atletica === 1) s.abilita.atletica = 2;
      if (s.abilita.intuizione === 1) s.abilita.intuizione = 2;
      if (s.abilita.percezione === 1) s.abilita.percezione = 2;
      if (s.abilita.sopravvivenza === 1) s.abilita.sopravvivenza = 2;
    }
  } else if (/flyora/i.test(s.nome) || id === 'pg-flyora') {
    if (s.trattiSpecie && /scurovisione/i.test(s.trattiSpecie) && FLYORA_JSON.trattiSpecie) {
      s.trattiSpecie = FLYORA_JSON.trattiSpecie;
    }
    if (!s.sensi && FLYORA_JSON.sensi) s.sensi = FLYORA_JSON.sensi;
  } else if (/lyrian/i.test(s.nome) || id === 'pg-lyrian') {
    if (s.privilegi && s.privilegi.includes('PRIVILEGI GUERRIERO') && LYRIAN_JSON.privilegi) {
      s.privilegi = LYRIAN_JSON.privilegi;
    }
    if (s.trattiSpecie && /scurovisione/i.test(s.trattiSpecie) && LYRIAN_JSON.trattiSpecie) {
      s.trattiSpecie = LYRIAN_JSON.trattiSpecie;
    }
    if (s.abilita) {
      if (s.abilita.intimidire === 1) s.abilita.intimidire = 2;
      if (s.abilita.percezione === 1) s.abilita.percezione = 2;
    }
  }
}
