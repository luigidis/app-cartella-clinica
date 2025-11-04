# 🏥 App Cartella Clinica

**Sistema di Gestione Cartelle Cliniche Digitali**

Applicazione desktop per la gestione delle cartelle cliniche dei pazienti, sviluppata con tecnologie moderne e architettura ibrida.

## 📋 Descrizione

App Cartella Clinica è un'applicazione desktop cross-platform progettata per medici e strutture sanitarie che permette di:

- ✅ Registrare nuovi pazienti con tutti i dati anagrafici
- 🔍 Cercare e visualizzare pazienti per nome, cognome o codice fiscale
- 📝 Gestire diagnosi e note cliniche
- 💾 Archiviare i dati in un database locale SQLite
- 🖥️ Interfaccia utente moderna e responsive

L'applicazione è completamente offline e garantisce la privacy dei dati salvando tutto localmente.

---

## 🚀 Stack Tecnologico

### Frontend
- **React 19** - Framework UI moderno
- **TypeScript** - Type-safe development
- **Vite** - Build tool veloce e ottimizzato
- **CSS3** - Styling con design system medico

### Desktop Framework
- **Tauri v2** - Framework Rust per applicazioni desktop native
- **Rust** - Backend sicuro e performante

### Database
- **SQLite** - Database locale embedded
- **Prisma ORM** - Type-safe database access
- **Node.js scripts** - Bridge per operazioni database

### Architettura Ibrida
Il progetto utilizza un'architettura particolare:
1. **React Frontend** → chiama comandi Tauri via `@tauri-apps/api/core`
2. **Rust Backend** → riceve i comandi e spawna processi Node.js
3. **Node.js Scripts** → eseguono operazioni Prisma sul database SQLite
4. **Risultati** → ritornano attraverso Rust al frontend

> **Perché questa architettura?** Prisma non ha supporto nativo Rust, quindi il progetto fa da bridge tra Tauri/Rust e Prisma/Node.js tramite subprocess.

---

## 📦 Prerequisiti

Prima di iniziare, assicurati di avere installato:

- **Node.js** (v18 o superiore) - [Download](https://nodejs.org/)
- **Rust** (ultima stable) - [Install](https://www.rust-lang.org/tools/install)
- **npm** o **pnpm** - Package manager
- **Git** - Version control

### Verifica installazioni

```bash
node --version   # v18+
npm --version    # 9+
cargo --version  # 1.70+
```

---

## 🛠️ Installazione e Setup

### 1. Clona la Repository

```bash
git clone https://github.com/tuousername/app-cartella-clinica.git
cd app-cartella-clinica
```

### 2. Installa le Dipendenze

```bash
npm install
```

Questo installerà tutte le dipendenze necessarie:
- React e dipendenze frontend
- Tauri CLI
- Prisma ORM
- TypeScript e tooling

### 3. Configura il Database

#### 3.1 Crea il file `.env`

Crea un file `.env` nella root del progetto:

```bash
# .env
DATABASE_URL="file:./prisma/dev.db"
```

#### 3.2 Genera il Prisma Client

```bash
npx prisma generate
```

Questo genererà il client TypeScript in `src/generated/prisma/`.

#### 3.3 Esegui le Migrations

```bash
npx prisma migrate dev
```

Questo creerà il database SQLite e applicherà lo schema iniziale.

### 4. Verifica Setup (Opzionale)

Apri Prisma Studio per verificare il database:

```bash
npx prisma studio
```

---

## 🚦 Avvio dell'Applicazione

### Modalità Sviluppo

Avvia l'app in development mode con hot-reload:

```bash
npm run tauri dev
```

Questo comando:
- Avvia il server Vite sulla porta `1420`
- Compila il backend Rust
- Apre la finestra Tauri con l'app

### Build di Produzione

Crea un eseguibile per il sistema operativo corrente:

```bash
npm run tauri build
```

L'eseguibile sarà generato in `src-tauri/target/release/bundle/`.

### Solo Frontend (Preview)

Per testare solo il frontend senza Tauri:

```bash
npm run build
npm run preview
```

---

## 📁 Struttura del Progetto

```
app-cartella-clinica/
│
├── src/                          # Frontend React
│   ├── components/
│   │   └── patient/
│   │       ├── get-patient.tsx   # Componente ricerca pazienti
│   │       └── get-patient.css   # Stili isolati
│   ├── generated/
│   │   └── prisma/               # Prisma client generato
│   ├── App.tsx                   # Componente principale
│   ├── App.css                   # Stili globali
│   └── main.tsx                  # Entry point React
│
├── src-tauri/                    # Backend Rust + Tauri
│   ├── src/
│   │   ├── pazienti/
│   │   │   ├── mod.rs            # Comandi Tauri per pazienti
│   │   │   └── db.rs             # Bridge Node.js <-> Rust
│   │   ├── lib.rs                # Entry point Tauri
│   │   └── main.rs               # Main Rust
│   ├── api/                      # Scripts Node.js per database
│   │   ├── createPatient.js      # Crea paziente
│   │   └── getPatient.js         # Cerca/ottieni pazienti
│   └── tauri.conf.json           # Configurazione Tauri
│
├── prisma/
│   ├── schema.prisma             # Schema database
│   ├── migrations/               # Migration history
│   └── dev.db                    # Database SQLite (ignorato da git)
│
├── package.json                  # Dipendenze npm
├── tsconfig.json                 # Config TypeScript
├── vite.config.ts                # Config Vite
└── README.md                     # Questo file
```

---

## 🎯 Comandi Disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia solo server Vite (no Tauri) |
| `npm run tauri dev` | Avvia app Tauri in dev mode |
| `npm run build` | Build frontend React |
| `npm run tauri build` | Build completo (frontend + Tauri bundle) |
| `npm run preview` | Preview build di produzione |
| `npx prisma migrate dev` | Crea nuova migration |
| `npx prisma generate` | Rigenera Prisma client |
| `npx prisma studio` | Apri GUI database |

---

## 🗄️ Database Schema

### Modello `Paziente`

```prisma
model Paziente {
  id            Int      @id @default(autoincrement())
  nome          String
  cognome       String
  dataNascita   DateTime
  codiceFiscale String?  @unique
  diagnosi      String?
  note          String?
  createdAt     DateTime @default(now())
}
```

### Operazioni Disponibili

- **Crea Paziente** - `create_patient`
- **Ottieni Tutti** - `get_pazienti`
- **Cerca Paziente** - `search_patient` (nome/cognome/CF)

---

## 🏗️ Architettura e Flusso Dati

### Esempio: Ricerca Paziente

```
┌─────────────────┐
│  React Frontend │
│  (TypeScript)   │
└────────┬────────┘
         │ invoke("search_patient", { query })
         ▼
┌─────────────────┐
│  Rust Backend   │
│  (Tauri)        │
└────────┬────────┘
         │ spawn Node.js process
         ▼
┌─────────────────┐
│  Node.js Script │
│  (Prisma ORM)   │
└────────┬────────┘
         │ SQL Query
         ▼
┌─────────────────┐
│  SQLite DB      │
│  (prisma/dev.db)│
└─────────────────┘
```

### Aggiungere Nuove Features

1. **Aggiorna Schema**: Modifica `prisma/schema.prisma`
2. **Migrazione**: `npx prisma migrate dev --name nome_feature`
3. **Script Node.js**: Crea in `src-tauri/api/`
4. **Comando Rust**: Aggiungi in `src-tauri/src/pazienti/`
5. **Registra**: Aggiungi in `src-tauri/src/lib.rs`
6. **Frontend**: Chiama con `invoke()`

---

## 🎨 Features Implementate

### ✅ Gestione Pazienti
- Creazione nuovi pazienti con form validato
- Ricerca avanzata per nome, cognome, codice fiscale
- Visualizzazione in tabella responsive
- Dark mode automatico

### 🎨 Design
- Palette colori medica (blu #2563eb)
- Interfaccia pulita e professionale
- Responsive mobile-first
- Animazioni smooth e transizioni

### 🔒 Privacy e Sicurezza
- Tutti i dati salvati localmente
- Nessuna connessione internet richiesta
- Database SQLite embedded
- Validazione input lato client e server

---

## 🐛 Troubleshooting

### Prisma Client non trovato
```bash
npx prisma generate
```

### Database non creato
```bash
npx prisma migrate dev
```

### Port 1420 già in uso
```bash
# Cambia porta in vite.config.ts e tauri.conf.json
```

### Errori di build Rust
```bash
cargo clean
npm run tauri build
```

---

## 🤝 Contribuire

Contributi, issues e feature requests sono benvenuti!

1. Fork il progetto
2. Crea il tuo Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al Branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

---

## 📝 Roadmap

- [ ] Export dati in PDF
- [ ] Backup automatico database
- [ ] Storico modifiche paziente
- [ ] Gestione appuntamenti
- [ ] Stampa ricette mediche
- [ ] Multi-utente con autenticazione
- [ ] Sincronizzazione cloud opzionale

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

---

## 👨‍💻 Autore

**Luigi**

Per domande o supporto, apri un'issue su GitHub.

---

## 🙏 Ringraziamenti

- [Tauri](https://tauri.app/) - Framework desktop
- [React](https://react.dev/) - UI library
- [Prisma](https://www.prisma.io/) - ORM
- [Vite](https://vitejs.dev/) - Build tool

---

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

---

**Made with ❤️ for the medical community**
