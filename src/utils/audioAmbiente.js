/**
 * audioAmbiente.js — Generatore di atmosfere e suoni ambientali per D&D (Web Audio API procedurale + Audio HTML5 Custom).
 * Funziona al 100% offline senza file esterni pesanti, generando rumori ambientali realistici (vento, pioggia, fiamme, mare, dungeon).
 */

export const AMBIENTI_AUDIO = [
  { id: 'spento', nome: '🔇 Silenzio', icona: '🔇', desc: 'Nessun suono di sottofondo' },
  { id: 'taverna', nome: '🍺 Taverna', icona: '🍺', desc: 'Focolare caldo e brusio da locanda' },
  { id: 'mercato', nome: '🏪 Mercato', icona: '🏪', desc: 'Brusio di folla e voci di venditori' },
  { id: 'citta', nome: '🏘️ Città', icona: '🏘️', desc: 'Vociare e vita di una città medievale' },
  { id: 'vento', nome: '🌬️ Vento', icona: '🌬️', desc: 'Vento e raffiche (castello, tundra, deserto)' },
  { id: 'dungeon', nome: '⛓️ Dungeon', icona: '⛓️', desc: 'Eco sotterraneo e gocce nelle cripte' },
  { id: 'foresta', nome: '🌲 Foresta', icona: '🌲', desc: 'Vento tra gli alberi e fruscii di foglie' },
  { id: 'notte', nome: '🌙 Notte', icona: '🌙', desc: 'Brezza notturna e grilli' },
  { id: 'mare', nome: '🌊 Mare / Costa', icona: '🌊', desc: 'Risacca e onde lente sulla spiaggia' },
  { id: 'pioggia', nome: '🌧️ Pioggia / Tempesta', icona: '🌧️', desc: 'Pioggia battente e tuoni lontani' },
  { id: 'fuoco', nome: '🔥 Accampamento', icona: '🔥', desc: 'Crepitio del fuoco da campo' },
  { id: 'arcano', nome: '🔮 Tempio / Magia', icona: '🔮', desc: 'Risonanza arcana e vibrazioni mistiche' },
  { id: 'custom', nome: '🔗 Audio personalizzato', icona: '🔗', desc: 'Riproduci un file o stream MP3 da URL' },
];

let audioCtx = null;
let activeNodes = [];
let htmlAudioElement = null;
let currentVolume = 0.5;
let ambienteAttivo = '';   // id dell'ambientazione in riproduzione (per il volume della base)
let intervalTimer = null;
let keepAliveEl = null; // <audio> near-silenzioso per l'override della modalità silenziosa iOS

// Amplificazione del sottofondo procedurale (di natura molto soffuso).
// Tenuta moderata: il limiter sul master evita comunque il clipping.
const MASTER_BOOST = 1.8;

// Ambientazioni con un vero loop registrato (MP3 CC0 in public/audio/).
// Per queste si usa un <audio> HTML reale (qualità vera + funziona meglio in
// modalità silenziosa iOS); la sintesi procedurale resta solo come fallback.
// Un file dedicato e DISTINTO per ogni ambientazione (id = id del preset).
const AMBIENTI_CON_FILE = new Set([
  'taverna', 'mercato', 'citta', 'dungeon', 'foresta', 'notte',
  'mare', 'tundra', 'tempesta', 'accampamento', 'deserto', 'tempio',
]);

// Alcune ambientazioni condividono la stessa base registrata ma la usano in modo
// diverso. La città riusa il brusio di folla del mercato: più basso (è un
// villaggio, non una piazza di mercato) e con sopra campane, fabbro e carretti.
const BASE_CONDIVISA = { citta: 'mercato' };

// Volume della base rispetto al volume dell'ambiente (1 = invariato).
const VOLUME_BASE = { citta: 0.55 };

function ambienteFileUrl(id) {
  if (!AMBIENTI_CON_FILE.has(id)) return null;
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
  return `${base}audio/${BASE_CONDIVISA[id] || id}.mp3`;
}

/** Fattore di volume della base per questa ambientazione. */
function fattoreVolumeBase(id) {
  return VOLUME_BASE[id] || 1;
}

/**
 * Costruisce un data URI WAV di puro silenzio (8-bit mono) della durata indicata.
 * Serve come sorgente "innocua" per l'elemento <audio> di keep-alive iOS.
 */
function silenzioWavDataUri(durataSec = 1) {
  const sampleRate = 8000;
  const numSamples = Math.max(1, Math.floor(sampleRate * durataSec));
  const dataSize = numSamples; // 8-bit mono → 1 byte per campione
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const scrivi = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  scrivi(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); scrivi(8, 'WAVE');
  scrivi(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true); view.setUint16(34, 8, true);
  scrivi(36, 'data'); view.setUint32(40, dataSize, true);
  for (let i = 0; i < numSamples; i++) view.setUint8(44 + i, 128); // 128 = silenzio in 8-bit
  const bytes = new Uint8Array(buffer);
  let binario = '';
  for (let i = 0; i < bytes.length; i++) binario += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(binario);
}

/**
 * Trucco iOS: iOS zittisce la Web Audio quando l'interruttore Silenzioso è attivo.
 * Tenendo in loop un elemento <audio> HTML (non muto) avviato durante un gesto
 * utente, la sessione audio passa alla categoria "playback", che IGNORA il tasto
 * Silenzioso — così anche il sottofondo generato torna udibile. Best-effort:
 * dipende dalla versione di iOS, ma è la tecnica standard (usata da Howler/Tone).
 */
function attivaOverrideSilenzioso() {
  try {
    if (!keepAliveEl) {
      keepAliveEl = new Audio(silenzioWavDataUri(1));
      keepAliveEl.loop = true;
      keepAliveEl.setAttribute('playsinline', '');
      keepAliveEl.setAttribute('webkit-playsinline', '');
      keepAliveEl.volume = 0.02; // quasi-silenzioso ma NON muto (serve per l'override)
    }
    const p = keepAliveEl.play();
    if (p && p.catch) p.catch(() => { /* ignorato: senza gesto valido non parte */ });
  } catch { /* ignorato */ }
}

// --- Effetti sonori "one-shot" da file (colpo d'arma, incantesimo) ---
// Caricati e decodificati una volta in AudioBuffer per una riproduzione
// ISTANTANEA (niente ritardo) e di qualità (file reali, non sintesi).
const SFX_FILES = {
  sword: 'sfx-sword.mp3', magic: 'sfx-magic.mp3',
  // Overlay per la città medievale (si sovrappongono alla base: campane, fabbro, carretti)
  campana: 'sfx-campana.mp3', fabbro: 'sfx-fabbro.mp3', carretto: 'sfx-carretto.mp3',
  // Overlay per il dungeon/caverna: gocce d'acqua, versi in lontananza, eco/rombo
  goccia: 'sfx-goccia.mp3', verso: 'sfx-verso.mp3', eco: 'sfx-eco.mp3',
};
const sfxBuffers = {};
let sfxPrecaricati = false;

function baseUrl() {
  return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
}

/** Scarica e decodifica gli effetti sonori (una sola volta). Va invocata su un gesto utente. */
export function precaricaSfx() {
  if (sfxPrecaricati) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  sfxPrecaricati = true;
  const base = baseUrl();
  Object.entries(SFX_FILES).forEach(([nome, file]) => {
    if (sfxBuffers[nome]) return;
    fetch(`${base}audio/${file}`)
      .then((r) => r.arrayBuffer())
      .then((arr) => ctx.decodeAudioData(arr))
      .then((buf) => { sfxBuffers[nome] = buf; })
      .catch(() => { /* riproverà al prossimo giro */ });
  });
}

/** Riproduce all'istante un effetto (buffer già decodificato). Ritorna false se non pronto. */
function playSfx(nome, volume = 0.5) {
  const ctx = getAudioContext();
  precaricaSfx();
  if (!ctx || ctx.state !== 'running' || !sfxBuffers[nome]) return false;
  const src = ctx.createBufferSource();
  src.buffer = sfxBuffers[nome];
  const g = ctx.createGain();
  g.gain.value = Math.max(0, Math.min(1, Number(volume) || 0.5));
  src.connect(g);
  g.connect(ctx.destination);
  src.start();
  return true;
}

/**
 * Inizializza il contesto Web Audio in modo sicuro (richiede interazione utente).
 */
function getAudioContext() {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Sblocca l'audio: crea/riprende l'AudioContext in modo sincrono durante un
 * gesto utente (click). Le policy autoplay del browser bloccano l'audio finché
 * non c'è un'interazione: va chiamata dentro l'onClick del controllo ambientazione.
 */
export function sbloccaAudio() {
  // Override della modalità silenziosa iOS (va avviato dentro il gesto utente).
  attivaOverrideSilenzioso();
  const ctx = getAudioContext();
  if (!ctx) return ctx;
  if (ctx.state === 'suspended') ctx.resume();
  // Blip di conferma udibile: sblocca davvero l'audio su iOS (dev'essere
  // avviato DENTRO il gesto utente) e dà un riscontro immediato "audio attivo".
  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.exponentialRampToValueAtTime(990, t + 0.12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  } catch { /* ignored */ }
  return ctx;
}

/**
 * Ferma qualsiasi suono o loop attivo.
 */
export function fermaAmbiente() {
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }
  activeNodes.forEach(node => {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch { /* ignored */ }
  });
  activeNodes = [];

  if (htmlAudioElement) {
    try {
      htmlAudioElement.pause();
      htmlAudioElement.src = '';
    } catch { /* ignored */ }
    htmlAudioElement = null;
  }
}

/**
 * Imposta il volume globale del sottofondo (da 0.0 a 1.0).
 */
export function setVolumeAmbiente(val) {
  currentVolume = Math.max(0, Math.min(1, Number(val) || 0));
  activeNodes.forEach(node => {
    if (node._isMasterGain && node.gain) {
      node.gain.setTargetAtTime(currentVolume * MASTER_BOOST, (audioCtx ? audioCtx.currentTime : 0), 0.1);
    }
  });
  if (htmlAudioElement) {
    htmlAudioElement.volume = currentVolume * fattoreVolumeBase(ambienteAttivo);
  }
}

/**
 * Genera un buffer di rumore bianco o rosa/marrone.
 */
function createNoiseBuffer(ctx, type = 'pink', duration = 4) {
  const sampleRate = ctx.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const output = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else if (type === 'brown') {
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      // Guadagno contenuto per restare entro ±1 (evita clipping nel buffer stesso).
      output[i] = Math.max(-1, Math.min(1, lastOut * 3.5));
    }
  }
  return buffer;
}

/**
 * Avvia il tema sonoro prescelto.
 */
export function avviaAmbiente(id, volume = 0.5, urlCustom = '') {
  fermaAmbiente();
  currentVolume = Math.max(0, Math.min(1, Number(volume) || 0));
  ambienteAttivo = id || '';

  if (!id || id === 'spento') {
    // Silenzio: rilascia anche l'override iOS così il telefono torna normale.
    if (keepAliveEl) { try { keepAliveEl.pause(); } catch { /* ignorato */ } }
    return;
  }

  if (id === 'custom') {
    if (!urlCustom) return;
    htmlAudioElement = new Audio(urlCustom);
    htmlAudioElement.loop = true;
    htmlAudioElement.volume = currentVolume;
    htmlAudioElement.setAttribute('playsinline', '');
    htmlAudioElement.play().catch(err => {
      console.warn("Impossibile riprodurre l'URL custom:", err);
    });
    return;
  }

  // Loop registrato reale (MP3 CC0): riproduzione via <audio> HTML.
  const fileUrl = ambienteFileUrl(id);
  if (fileUrl) {
    htmlAudioElement = new Audio(fileUrl);
    htmlAudioElement.loop = true;
    htmlAudioElement.volume = currentVolume * fattoreVolumeBase(id);
    htmlAudioElement.setAttribute('playsinline', '');
    htmlAudioElement.setAttribute('webkit-playsinline', '');
    htmlAudioElement.play().catch(err => {
      console.warn('Impossibile riprodurre il loop ambientale:', err);
    });
    // Città medievale: sopra la base di folla si sentono ogni tanto campane,
    // il fabbro che batte sull'incudine e i carretti che passano.
    if (id === 'citta') {
      precaricaSfx();
      // Cadenza fitta e volumi bassi: i suoni del villaggio si mescolano al
      // brusio invece di sentirsi come effetti isolati e staccati.
      intervalTimer = setInterval(() => {
        const ctx = getAudioContext();
        if (!ctx || ctx.state !== 'running' || (typeof document !== 'undefined' && document.hidden)) return;
        const r = Math.random();
        if (r < 0.42) playSfx('carretto', currentVolume * 0.34);      // carretti: spesso
        else if (r < 0.8) playSfx('fabbro', currentVolume * 0.32);     // fabbro: spesso
        else if (r < 0.94) playSfx('campana', currentVolume * 0.22);   // campane: rare e lontane
      }, 3500);
    }
    // Dungeon/caverna: sopra il drone di base, gocce d'acqua frequenti e, più di
    // rado, versi di creature in lontananza e cupi rombi d'eco.
    if (id === 'dungeon') {
      precaricaSfx();
      intervalTimer = setInterval(() => {
        const ctx = getAudioContext();
        if (!ctx || ctx.state !== 'running' || (typeof document !== 'undefined' && document.hidden)) return;
        const r = Math.random();
        if (r < 0.55) playSfx('goccia', currentVolume * 0.6);        // gocce: spesso
        else if (r < 0.8) playSfx('eco', currentVolume * 0.45);       // rombo/eco: a volte
        else playSfx('verso', currentVolume * 0.4);                   // verso lontano: raro
      }, 5000);
    }
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  // Boost moderato: i generatori procedurali sono soffusi, ma senza esagerare
  // per non distorcere. Un limiter a valle evita il clipping ("suono glitchato").
  masterGain.gain.setValueAtTime(currentVolume * MASTER_BOOST, ctx.currentTime);
  // Limiter/compressore sul master: schiaccia i picchi ed elimina il clipping.
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.setValueAtTime(-6, ctx.currentTime);
  limiter.knee.setValueAtTime(6, ctx.currentTime);
  limiter.ratio.setValueAtTime(12, ctx.currentTime);
  limiter.attack.setValueAtTime(0.003, ctx.currentTime);
  limiter.release.setValueAtTime(0.25, ctx.currentTime);
  masterGain.connect(limiter);
  limiter.connect(ctx.destination);
  masterGain._isMasterGain = true;
  activeNodes.push(masterGain, limiter);

  if (id === 'pioggia') {
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 'pink', 5);
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    const gain = ctx.createGain();
    gain.gain.value = 0.8;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start();
    activeNodes.push(noise, filter, gain);

    intervalTimer = setInterval(() => {
      if (Math.random() < 0.4 && ctx.state === 'running') {
        const tGain = ctx.createGain();
        const tFilter = ctx.createBiquadFilter();
        tFilter.type = 'lowpass';
        tFilter.frequency.value = 150 + Math.random() * 100;
        const tNoise = ctx.createBufferSource();
        tNoise.buffer = createNoiseBuffer(ctx, 'brown', 3);
        tGain.gain.setValueAtTime(0.01, ctx.currentTime);
        tGain.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 0.3);
        tGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.8);
        tNoise.connect(tFilter);
        tFilter.connect(tGain);
        tGain.connect(masterGain);
        tNoise.start();
        activeNodes.push(tNoise, tFilter, tGain);
      }
    }, 4000);
  }
  else if (id === 'taverna' || id === 'fuoco') {
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 'brown', 6);
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = id === 'taverna' ? 'lowpass' : 'bandpass';
    filter.frequency.value = id === 'taverna' ? 450 : 700;
    const gain = ctx.createGain();
    gain.gain.value = id === 'taverna' ? 0.9 : 0.7;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start();
    activeNodes.push(noise, filter, gain);

    intervalTimer = setInterval(() => {
      if (Math.random() < 0.7 && ctx.state === 'running') {
        const popOsc = ctx.createBufferSource();
        popOsc.buffer = createNoiseBuffer(ctx, 'white', 0.1);
        const popFilter = ctx.createBiquadFilter();
        popFilter.type = 'highpass';
        popFilter.frequency.value = 1200;
        const popGain = ctx.createGain();
        popGain.gain.setValueAtTime(0.2 * Math.random(), ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        popOsc.connect(popFilter);
        popFilter.connect(popGain);
        popGain.connect(masterGain);
        popOsc.start();
      }
    }, 600);
  }
  else if (id === 'foresta') {
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 'pink', 6);
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 1.2;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.value = 0.7;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start();
    lfo.start();
    activeNodes.push(noise, filter, lfo, lfoGain, gain);
  }
  else if (id === 'dungeon') {
    const drone = ctx.createOscillator();
    drone.type = 'sawtooth';
    drone.frequency.value = 55;
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 120;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.5;
    drone.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(masterGain);
    drone.start();
    activeNodes.push(drone, droneFilter, droneGain);

    intervalTimer = setInterval(() => {
      if (Math.random() < 0.5 && ctx.state === 'running') {
        const drop = ctx.createOscillator();
        drop.type = 'sine';
        const freq = 800 + Math.random() * 600;
        drop.frequency.setValueAtTime(freq, ctx.currentTime);
        drop.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.05);
        const dropGain = ctx.createGain();
        dropGain.gain.setValueAtTime(0.15, ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        drop.connect(dropGain);
        dropGain.connect(masterGain);
        drop.start();
        drop.stop(ctx.currentTime + 0.25);
      }
    }, 3000);
  }
  else if (id === 'mare') {
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 'pink', 8);
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 450;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.value = 0.8;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start();
    lfo.start();
    activeNodes.push(noise, filter, lfo, lfoGain, gain);
  }
  else if (id === 'arcano') {
    const freqs = [110, 164.81, 220, 329.63];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.15 / freqs.length;
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      activeNodes.push(osc, oscGain);
    });
  }
  else if (id === 'mercato' || id === 'citta') {
    // Brusio di folla di un mercato/città: murmure di fondo + voci sparse.
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 'brown', 6);
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.value = 0.75;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start();
    activeNodes.push(noise, filter, gain);

    intervalTimer = setInterval(() => {
      if (Math.random() < 0.6 && ctx.state === 'running') {
        const voce = ctx.createOscillator();
        voce.type = 'sawtooth';
        const f = 180 + Math.random() * 260;
        voce.frequency.setValueAtTime(f, ctx.currentTime);
        voce.frequency.linearRampToValueAtTime(f * (0.85 + Math.random() * 0.3), ctx.currentTime + 0.3);
        const vFilter = ctx.createBiquadFilter();
        vFilter.type = 'bandpass';
        vFilter.frequency.value = 500 + Math.random() * 400;
        const vGain = ctx.createGain();
        vGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        vGain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.08);
        vGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        voce.connect(vFilter);
        vFilter.connect(vGain);
        vGain.connect(masterGain);
        voce.start();
        voce.stop(ctx.currentTime + 0.45);
      }
    }, 700);
  }
  else if (id === 'vento') {
    // Vento (castello ventoso, tundra, deserto): rumore filtrato con raffiche.
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 'pink', 8);
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 0.7;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 350;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.value = 0.2;
    // Raffiche: seconda LFO che modula il volume.
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.06;
    const lfo2Gain = ctx.createGain();
    lfo2Gain.gain.value = 0.5;
    lfo2.connect(lfo2Gain);
    lfo2Gain.connect(gain.gain);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start();
    lfo.start();
    lfo2.start();
    activeNodes.push(noise, filter, lfo, lfoGain, lfo2, lfo2Gain, gain);
  }
  else if (id === 'notte') {
    // Notte all'aperto: brezza tenue + grilli che friniscono a intermittenza.
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 'pink', 8);
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start();
    activeNodes.push(noise, filter, gain);

    intervalTimer = setInterval(() => {
      if (Math.random() < 0.7 && ctx.state === 'running') {
        const chirps = 2 + Math.floor(Math.random() * 4);
        const base = ctx.currentTime;
        for (let i = 0; i < chirps; i++) {
          const cr = ctx.createOscillator();
          cr.type = 'square';
          cr.frequency.value = 4200 + Math.random() * 400;
          const crGain = ctx.createGain();
          const at = base + i * 0.09;
          crGain.gain.setValueAtTime(0.0001, at);
          crGain.gain.exponentialRampToValueAtTime(0.04, at + 0.01);
          crGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
          cr.connect(crGain);
          crGain.connect(masterGain);
          cr.start(at);
          cr.stop(at + 0.06);
        }
      }
    }, 2500);
  }
}

/**
 * Riproduce brevi effetti sonori procedurali per eventi di gioco (tiri di dado, critici, fallimenti, cure, incantesimi).
 * @param {string} tipo - 'tiro' | 'critico' | 'fallimento' | 'cura' | 'magia'
 * @param {number} volume - da 0.0 a 1.0
 */
export function eseguiEffettoSonoro(tipo, volume = 0.5) {
  // Tiro = colpo d'arma (spada); magia = incantesimo. File reali, riproduzione
  // istantanea via AudioBuffer (niente più il vecchio suono di dadi sintetico).
  if (tipo === 'tiro' || tipo === 'arma') { playSfx('sword', volume); return; }
  if (tipo === 'magia') { playSfx('magic', volume); return; }

  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const v = Math.max(0, Math.min(1, Number(volume) || 0.5));

  if (tipo === 'critico') {
    const note = [523.25, 659.25, 783.99, 1046.50];
    note.forEach((freq, idx) => {
      const delay = idx * 0.08;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.4 * v, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.4);
    });
  }
  else if (tipo === 'fallimento') {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6 * v, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }
  else if (tipo === 'cura' || tipo === 'magia') {
    const note = [1318.51, 1567.98, 2093.00];
    note.forEach((freq, idx) => {
      const delay = idx * 0.07;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.25 * v, ctx.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.35);
    });
  }
}

