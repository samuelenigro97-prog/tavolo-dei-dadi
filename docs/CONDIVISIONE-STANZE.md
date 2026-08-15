# Condivisione tramite stanza

## Decisione

La prima versione usa uno **snapshot immutabile** della singola scheda. Il
proprietario crea una stanza e comunica il codice; chi lo inserisce importa una
copia locale. Per condividere modifiche successive si genera un nuovo codice.

Non è stata aggiunta una chiave privata di aggiornamento: richiederebbe gestione
e recupero della credenziale, controlli di concorrenza e una superficie di
scrittura aggiuntiva. Lo snapshot soddisfa il flusso richiesto con meno rischi.

## Sicurezza e ciclo di vita

- codice generato dal Worker con casualità crittografica, 10 simboli da un
  alfabeto di 32 caratteri (circa 50 bit);
- controllo collisioni prima della scrittura, con massimo 6 tentativi;
- durata pubblica 24 ore e cancellazione automatica KV entro 25 ore;
- payload massimo 128 KB, senza ritratto e mappa;
- validazione di profondità, numero di nodi, tipi, livello, caratteristiche e
  campi testuali sia prima della scrittura sia dopo la lettura;
- rate limiter Cloudflare nativo opzionale, fallback KV best-effort;
- nessun token o segreto nel client.

## Compatibilità

La condivisione `#pg=...` tramite link resta invariata e continua a non usare
server. Il backup Gist resta disponibile per chi lo ha già configurato, ma non
fa parte delle stanze. Se il Worker è offline o non configurato, soltanto la
funzione stanza è indisponibile: schede locali, link, import ed export restano
operativi.
