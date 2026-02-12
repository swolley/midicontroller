# Estensione piano: versione server e mobile

Questo documento aggiunge al [piano MIDI/HTTP comunicator unificato] i punti su: **versione server** (stesso programma vs servizio, condivisione codice), e **versione per dispositivi mobile** (Electron/Tauri/Neutralino e oltre).

---

## 10. Versione server: stesso programma o servizio dedicato?

### Opzione A: Stesso programma, due “modalità”

L’app può essere **un solo codebase** eseguito in due modalità:

- **Modalità “client”** (browser o desktop): usa WebMIDI in locale e/o Http per il controllo remoto.
- **Modalità “server”** (sul PC con interfaccia MIDI collegata): oltre all’UI (opzionale), espone le API REST che ricevono le richieste HTTP e le inoltrano al WebMIDI locale.

**Vantaggi**: un solo repo, una sola codebase da mantenere; tipi e interfacce (es. `IOutputPort`, payload API) condivisi.  
**Realizzazione**: uno script/build “server” che avvia la stessa app Vue/Vite ma con un backend (Node/Express, Fastify, ecc.) in bundle o in un processo separato nello stesso progetto. In pratica: **stesso programma**, con un “entry point” server che monta le route API e (opzionale) serve la SPA; sul computer remoto lanci “la stessa app” in modalità server.

### Opzione B: Servizio separato

Un **servizio dedicato** (es. piccolo server Node/Go) che espone solo le API MIDI (control-change, program-change) e parla con WebMIDI (o con una libreria MIDI nativa su Node, es. `midi` npm). L’UI Vue resta solo client.

**Vantaggi**: il servizio è leggero, si può eseguire in background senza aprire il browser.  
**Svantaggi**: due progetti/codebase (o due cartelle nello stesso monorepo); la condivisione dei tipi va gestita (pacchetto condiviso o duplicazione).

### Raccomandazione

- **Condivisione codice**: ha senso soprattutto per **tipi e contratti** (payload API, `ChannelRange`, `MessageType`). La logica “invio MIDI” lato server è minima (ricevi JSON → chiami `output.sendControlChange` / `sendProgramChange`); puoi condividerla estraendo un modulo “midi-sender” usato sia dal client (HttpOutput che costruisce il JSON) sia dal server (che lo riceve e chiama WebMIDI).
- **Stesso programma vs servizio**:
  - Se vuoi **un solo eseguibile** sul PC remoto (apri l’app, scegli “modalità server”, nessun altro da installare) → **stesso programma** con entry server (Opzione A).
  - Se preferisci un **demone/servizio** che gira sempre in background e l’UI la apri solo dove serve → **servizio dedicato** (Opzione B); il codice condiviso può stare in un pacchetto (es. `packages/shared` in un monorepo).

**Come condividere il codice**

- **Monorepo** (es. con pnpm workspaces o npm workspaces):
  - `packages/shared`: tipi (`devices.d.ts`, payload API), eventuale codice puro (costanti, enum message type).
  - `packages/client`: app Vue attuale (consuma `@repo/shared`).
  - `packages/server`: server Express/Fastify che usa `@repo/shared` e (se Node) una libreria MIDI tipo `midi` o un bridge a WebMIDI (vedi sotto).
- **Stesso repo, due entry** (senza split pacchetti): cartella `server/` con il backend; import relativi ai tipi in `src/services/types/`. Build separata per “client” e “server” (es. `vite build` per client, `ts-node` o `vite-node` per server).

Su **Node** WebMIDI non è disponibile come in browser; per la versione server su PC dovrai usare una libreria Node per MIDI (es. `midi` npm) e un piccolo adapter che mappa le stesse “azioni” (control-change, program-change) ai messaggi MIDI nativi. Il **contratto** (payload HTTP) resta identico; solo l’implementazione dell’output cambia (browser WebMIDI vs Node `midi`).

---

## 11. Versione per dispositivi mobile

Hai considerato di impacchettare l’app in **Electron**, **Tauri** o **Neutralino** per desktop. Per i **dispositivi mobile** (smartphone/tablet) le opzioni sono diverse.

### Desktop: Electron / Tauri / Neutralino

- **Electron**: app desktop con Chromium; WebMIDI è supportato dove il runtime lo espone (es. su Windows/macOS con driver MIDI). Codice Vue riutilizzato al 100%.
- **Tauri**: shell nativa (Rust), webview di sistema; su alcune piattaforme la webview potrebbe non esporre WebMIDI (da verificare per ogni OS). Stesso frontend Vue.
- **Neutralino**: simile a Tauri (binario leggero, webview); stesso discorso su WebMIDI e supporto per piattaforma.

Per **solo desktop** puoi restare su uno di questi tre; la parte “comunicator” (Midi + Http) resta identica.

### Mobile (iOS / Android)

Su mobile **WebMIDI non è disponibile** nei browser standard (né in WebView tipici). Quindi:

- **Opzione 1 – Solo client HTTP**: sull’app mobile usi **solo il comunicator Http** (nessun Midi.init()). L’UI è la stessa; sul telefono non c’è MIDI locale, solo controllo remoto verso il server (sul PC con l’interfaccia MIDI). È la strada più semplice e **ha senso** con l’architettura attuale: stesso codice Vue, stesso `IComunicator`, sul mobile si passa solo `Http` con gli endpoint del server.
- **Opzione 2 – App nativa o ibrida con MIDI**: per usare MIDI su mobile (es. interfaccia USB OTG, o MIDI Bluetooth su Android) servirebbero plugin nativi (Capacitor, Cordova) o un’app nativa che espone un bridge a un WebView. Complessità maggiore; da considerare solo se davvero ti serve MIDI fisico sul telefono.

**Scelta di progetto**: la versione mobile è **solo client HTTP** (nessun MIDI locale). Stessa app Vue (o build con env “mobile”), stesso store/comunicator; all’init, su rilevamento mobile (o build target) non si chiama `Midi.init()`, solo `Http.init(config)` con l’URL del server. Nessun Electron/Tauri sul telefono: app come **PWA** o **Capacitor** (o simile) che carica la stessa SPA; l’unica differenza è la scelta del comunicator (solo Http) e magari un layout adattato al touch.

### Riepilogo

| Target        | Packaging              | MIDI locale     | Controllo remoto |
|---------------|------------------------|-----------------|------------------|
| Browser       | Nessuno                | WebMidi (se presente) | Http (opzionale) |
| Desktop (PC)  | Electron / Tauri / Neutralino | WebMidi         | Http (opzionale) |
| Server (PC con MIDI) | Stesso programma (entry server) o servizio Node | Node `midi` (o simile) | Espone API |
| Mobile        | PWA / Capacitor        | No              | Solo Http (obbligatorio) |

Per mobile, la modalità **solo Http** è la scelta obbligatoria di progetto (nessun MIDI locale).

Condivisione: **un solo codebase** (Vue + comunicator); variabili d’ambiente o build target decidono se abilitare Midi, Http o solo Http (mobile). La versione server può essere lo stesso programma con entry server o un servizio separato; la condivisione ha senso soprattutto per tipi e contratti API, e opzionalmente per un modulo “midi-sender” usato da client e server.
