# Modifiche richieste — Scheda Interattiva / Tavolo dei Dadi

Progetto: app PWA **Scheda Interattiva** (`tavolo-dei-dadi`), React + Vite. La UI principale è in `src/App.jsx`, i temi in `src/ui/tema.js` e l'audio in `src/utils/audioAmbiente.js`. Il tema chiaro richiama un foglio; i colori sono gestiti tramite palette CSS. L'interfaccia è in italiano.

## Modifiche già applicate e da mantenere

### Menù armi in ordine alfabetico

In `src/App.jsx`, il `<select>` delle armi nel Combattimento e il datalist di autocompletamento `#wpn-presets` ordinano le armi di `ARMI_5E` con:

```js
[...ARMI_5E].sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
```

Non modificare l'ordine originale di `ARMI_5E` in `src/data/dati5e.js`: è raggruppato per categoria e documentato con commenti.

### Tema “⛰️ Montagna”

Aggiunto a `PRESET_COLORI` in `src/ui/tema.js` con:

- ID `montagna`;
- audio `montagna`;
- palette grigio-ardesia chiaro/scuro;
- sfondo a gradienti.

Aggiunto `montagna` all'insieme `AMB_NOTTE` in `src/App.jsx`, affinché di notte utilizzi `montagna-notte.jpg`.

### Moneta d'oro nell'Inventario

Nella sezione Equipaggiamento, la cella con l'emoji 🪙 è stata sostituita con una moneta CSS: cerchio con gradiente `radial-gradient(circle at 35% 30%, #ffdf73, #d9a93a 55%, #9a6a08)`, bordo `#b8860b` e simbolo `✦`.

È la riga “Monete d'oro (MO)”, sincronizzata con la sezione Monete.

### Audio dedicato al tema Montagna

Nuovi file in `public/audio/`:

- `montagna-giorno.mp3`: vento morbido, Freesound 459977, florianreichelt, CC0;
- `montagna-notte.mp3`: drone cupo, Freesound 500326, LulSayer, CC0.

In `src/utils/audioAmbiente.js`:

- `montagna` è incluso in `AMBIENTI_CON_FILE`;
- Montagna usa MP3 come gli altri ambienti, per la massima compatibilità tra browser;
- `AMBIENTI_FILE_NOTTE` contiene `montagna`;
- `ambienteFileUrl(id, notte)` seleziona il suffisso `-notte` quando `notte === true`.

I file sono accreditati in `public/audio/crediti.json` con le chiavi `montagna` e `montagna_notte`.

## Sfondi Montagna completati (v2.50.0)

Gli sfondi delle location hanno variante giorno/notte in:

- `public/ambientazioni/<id>.jpg`;
- `public/ambientazioni/<id>-notte.jpg`.

Il codice li applica automaticamente. Per il tema Montagna sono stati aggiunti:

- `public/ambientazioni/montagna.jpg`;
- `public/ambientazioni/montagna-notte.jpg`.
