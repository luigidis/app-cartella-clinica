# 📚 App Cartella Clinica - Documentazione API

Documentazione completa di tutte le funzioni, comandi e componenti implementati nell'applicazione.

---

## 📑 Indice

1. [Tauri Commands (Rust Backend)](#tauri-commands-rust-backend)
2. [Database Bridge Functions (Rust)](#database-bridge-functions-rust)
3. [Node.js Scripts (Prisma Operations)](#nodejs-scripts-prisma-operations)
4. [React Components](#react-components)
5. [Database Schema](#database-schema)
6. [Type Definitions](#type-definitions)

---

## 🦀 Tauri Commands (Rust Backend)

I comandi Tauri sono esposti al frontend e possono essere invocati tramite `invoke()`.

### `create_patient`

Crea un nuovo paziente nel database.

**File**: `src-tauri/src/pazienti/mod.rs:16-18`

**Signature**:
```rust
#[tauri::command]
pub fn create_patient(data: PazienteInput) -> Result<String, String>
```

**Parametri**:
- `data: PazienteInput` - Dati del paziente da inserire

**Struttura `PazienteInput`**:
```rust
{
    nome: String,              // Nome del paziente (obbligatorio)
    cognome: String,           // Cognome del paziente (obbligatorio)
    data_nascita: String,      // Data di nascita in formato ISO (obbligatorio)
    codice_fiscale: Option<String>,  // Codice fiscale (opzionale)
    diagnosi: Option<String>,        // Diagnosi medica (opzionale)
    note: Option<String>             // Note aggiuntive (opzionale)
}
```

**Ritorna**:
- `Ok(String)` - JSON del paziente creato con ID generato
- `Err(String)` - Messaggio di errore in caso di fallimento

**Esempio chiamata da frontend**:
```typescript
import { invoke } from "@tauri-apps/api/core";

const result = await invoke("create_patient", {
  data: {
    nome: "Mario",
    cognome: "Rossi",
    data_nascita: "1980-05-15",
    codice_fiscale: "RSSMRA80E15H501Z",
    diagnosi: "Influenza",
    note: "Paziente allergico alla penicillina"
  }
});
```

**Comportamento**:
1. Riceve i dati dal frontend
2. Li serializza in JSON
3. Spawna un processo Node.js eseguendo `createPatient.js`
4. Passa i dati come argomento della CLI
5. Il processo Node.js usa Prisma per inserire nel database
6. Ritorna il risultato al frontend

---

### `get_pazienti`

Recupera tutti i pazienti dal database, ordinati per data di creazione (più recenti prima).

**File**: `src-tauri/src/pazienti/mod.rs:21-23`

**Signature**:
```rust
#[tauri::command]
pub fn get_pazienti() -> Result<Vec<serde_json::Value>, String>
```

**Parametri**: Nessuno

**Ritorna**:
- `Ok(Vec<serde_json::Value>)` - Array di pazienti in formato JSON
- `Err(String)` - Messaggio di errore in caso di fallimento

**Esempio chiamata da frontend**:
```typescript
import { invoke } from "@tauri-apps/api/core";

const patients = await invoke<Patient[]>("get_pazienti");
console.log(patients); // Array di tutti i pazienti
```

**Comportamento**:
1. Spawna processo Node.js eseguendo `getPatient.js` senza argomenti
2. Il processo Node.js usa Prisma per recuperare tutti i pazienti
3. Ritorna l'array completo ordinato per `createdAt DESC`

---

### `search_patient`

Cerca pazienti nel database per nome, cognome o codice fiscale (case-insensitive).

**File**: `src-tauri/src/pazienti/mod.rs:26-28`

**Signature**:
```rust
#[tauri::command]
pub fn search_patient(query: String) -> Result<Vec<serde_json::Value>, String>
```

**Parametri**:
- `query: String` - Stringa di ricerca (cerca in nome, cognome, codiceFiscale)

**Ritorna**:
- `Ok(Vec<serde_json::Value>)` - Array di pazienti che matchano la query
- `Err(String)` - Messaggio di errore in caso di fallimento

**Esempio chiamata da frontend**:
```typescript
import { invoke } from "@tauri-apps/api/core";

// Cerca per nome
const results = await invoke<Patient[]>("search_patient", {
  query: "Mario"
});

// Cerca per cognome
const results2 = await invoke<Patient[]>("search_patient", {
  query: "Rossi"
});

// Cerca per codice fiscale
const results3 = await invoke<Patient[]>("search_patient", {
  query: "RSSMRA80"
});
```

**Comportamento**:
1. Riceve la query di ricerca dal frontend
2. Spawna processo Node.js eseguendo `getPatient.js <query>`
3. Il processo Node.js usa Prisma con operatore `OR` per cercare in:
   - `nome` (contains query)
   - `cognome` (contains query)
   - `codiceFiscale` (contains query)
4. La ricerca è case-insensitive su SQLite (LIKE default)
5. Ritorna array di risultati ordinato per `createdAt DESC`

---

## 🔗 Database Bridge Functions (Rust)

Funzioni Rust che fanno da bridge tra i comandi Tauri e gli script Node.js.

### `create_patient`

**File**: `src-tauri/src/pazienti/db.rs:5-32`

**Signature**:
```rust
pub fn create_patient(p: PazienteInput) -> Result<String, String>
```

**Descrizione**:
Serializza i dati del paziente in JSON e spawna un processo Node.js per eseguire l'inserimento nel database.

**Processo**:
1. Serializza `PazienteInput` in JSON string
2. Ottiene la directory corrente
3. Costruisce il path a `api/createPatient.js`
4. Esegue: `node ./api/createPatient.js '<json>'`
5. Cattura stdout/stderr
6. Ritorna stdout se successo, errore se fallisce

**Gestione errori**:
- Errore di serializzazione JSON
- Errore nel trovare la directory corrente
- Errore nell'esecuzione del comando Node.js
- Errore ritornato dallo script Node.js (exit code != 0)

---

### `get_pazienti`

**File**: `src-tauri/src/pazienti/db.rs:34-55`

**Signature**:
```rust
pub fn get_pazienti() -> Result<Vec<serde_json::Value>, String>
```

**Descrizione**:
Spawna processo Node.js per recuperare tutti i pazienti e deserializza il risultato.

**Processo**:
1. Ottiene la directory corrente
2. Costruisce il path a `api/getPatient.js`
3. Esegue: `node ./api/getPatient.js` (senza argomenti)
4. Cattura stdout
5. Deserializza JSON in `Vec<serde_json::Value>`
6. Ritorna il vettore di pazienti

**Gestione errori**:
- Errore nel trovare la directory corrente
- Errore nell'esecuzione del comando Node.js
- Errore di parsing JSON

---

### `search_patient`

**File**: `src-tauri/src/pazienti/db.rs:57-79`

**Signature**:
```rust
pub fn search_patient(query: String) -> Result<Vec<serde_json::Value>, String>
```

**Descrizione**:
Spawna processo Node.js passando la query di ricerca come argomento CLI.

**Processo**:
1. Ottiene la directory corrente
2. Costruisce il path a `api/getPatient.js`
3. Esegue: `node ./api/getPatient.js "<query>"`
4. Cattura stdout
5. Deserializza JSON in `Vec<serde_json::Value>`
6. Ritorna il vettore di pazienti filtrato

**Gestione errori**:
- Errore nel trovare la directory corrente
- Errore nell'esecuzione del comando Node.js
- Errore di parsing JSON

---

## 📜 Node.js Scripts (Prisma Operations)

Script Node.js che eseguono operazioni sul database tramite Prisma ORM.

### `createPatient.js`

**File**: `src-tauri/api/createPatient.js`

**Descrizione**:
Script per creare un nuovo paziente nel database SQLite.

**Funzione `main()`**:
```javascript
async function main() {
  try {
    // Parse JSON data from CLI argument
    const data = JSON.parse(process.argv[2]);

    // Create new patient record
    const nuovo = await prisma.paziente.create({
      data: {
        nome: data.nome,
        cognome: data.cognome,
        dataNascita: new Date(data.data_nascita),
        codiceFiscale: data.codice_fiscale || null,
        diagnosi: data.diagnosi || null,
        note: data.note || null,
      },
    });

    // Output result as JSON
    console.log(JSON.stringify(nuovo));
  } catch (error) {
    console.error("Error creating patient:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
```

**Input**: `process.argv[2]` - JSON string con dati paziente

**Output**: JSON del paziente creato (stdout)

**Trasformazioni**:
- `data_nascita` (string) → `dataNascita` (DateTime)
- Campi opzionali → `null` se vuoti

**Gestione errori**:
- Errore di parsing JSON
- Errore di validazione Prisma
- Vincoli database (es. codice fiscale duplicato)
- Exit code 1 in caso di errore

---

### `getPatient.js`

**File**: `src-tauri/api/getPatient.js`

**Descrizione**:
Script multiuso per recuperare o cercare pazienti nel database.

**Funzione `main()`**:
```javascript
async function main() {
  try {
    // Get optional search query from command line
    const searchQuery = process.argv[2];

    let pazienti;

    if (searchQuery) {
      // SEARCH MODE: Search patients by nome, cognome, or codiceFiscale
      pazienti = await prisma.paziente.findMany({
        where: {
          OR: [
            { nome: { contains: searchQuery } },
            { cognome: { contains: searchQuery } },
            { codiceFiscale: { contains: searchQuery } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // LIST MODE: Fetch all patients
      pazienti = await prisma.paziente.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }

    // Output result as JSON
    console.log(JSON.stringify(pazienti));
  } catch (error) {
    console.error("Error fetching patients:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
```

**Modalità operative**:

1. **LIST MODE** (senza argomenti):
   - Input: Nessuno
   - Comportamento: Recupera tutti i pazienti
   - Output: Array completo di pazienti

2. **SEARCH MODE** (con argomento):
   - Input: `process.argv[2]` - Query di ricerca
   - Comportamento: Cerca in nome, cognome, codiceFiscale
   - Output: Array di pazienti che matchano

**Query Prisma**:
```javascript
{
  where: {
    OR: [
      { nome: { contains: searchQuery } },      // Cerca nel nome
      { cognome: { contains: searchQuery } },   // Cerca nel cognome
      { codiceFiscale: { contains: searchQuery } } // Cerca nel CF
    ]
  },
  orderBy: { createdAt: 'desc' }
}
```

**Note importanti**:
- ⚠️ **NON usa** `mode: 'insensitive'` perché SQLite non lo supporta
- La ricerca è comunque case-insensitive grazie a `LIKE` di SQLite
- Ordinamento sempre per data di creazione (più recenti prima)

**Gestione errori**:
- Errore di connessione database
- Errore di query Prisma
- Exit code 1 in caso di errore

---

## ⚛️ React Components

### `App`

**File**: `src/App.tsx`

**Descrizione**:
Componente principale dell'applicazione. Gestisce il layout, l'header e il modal per aggiungere pazienti.

**State**:
```typescript
const [showAddPatient, setShowAddPatient] = useState(false);
```

**Struttura**:
```tsx
<div className="app">
  <header className="app-header">
    <h1>Cartella Clinica</h1>
    <p>CriDp Medical Records</p>
  </header>

  <main className="main-content">
    <GetPatient />                    {/* Sezione ricerca */}
    <button onClick={...}>            {/* Pulsante nuovo paziente */}
      Nuovo Paziente
    </button>
  </main>

  {showAddPatient && (
    <div className="modal-overlay">   {/* Modal */}
      <AggiungiPaziente />
    </div>
  )}
</div>
```

**Funzioni**:
- Gestisce apertura/chiusura modal
- Coordina componenti figli
- Fornisce layout globale

---

### `AggiungiPaziente` (CreatePatient)

**File**: `src/components/patient/create-patient.tsx`

**Descrizione**:
Form per creare un nuovo paziente. Gestisce input, validazione e chiamata al backend.

**Props**: Nessuna

**State**:
```typescript
const [form, setForm] = useState({
  nome: "",
  cognome: "",
  data_nascita: "",
  codice_fiscale: "",
  diagnosi: "",
  note: ""
});
```

**Funzioni**:

#### `handleChange`
```typescript
const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.currentTarget;
  setForm(prev => ({ ...prev, [name]: value }));
};
```
**Descrizione**: Aggiorna lo state del form quando l'utente modifica un campo.

**Parametri**:
- `e` - Event del change

**Comportamento**: Update dello state usando spread operator

---

#### `salva`
```typescript
const salva = async () => {
  try {
    const res = await core.invoke("create_patient", { data: form });
    console.log("Paziente creato:", res);
    alert("Paziente salvato!");
  } catch (err) {
    console.error("Errore nel salvataggio:", err);
  }
};
```

**Descrizione**: Salva il paziente chiamando il comando Tauri `create_patient`.

**Comportamento**:
1. Invoca comando Tauri con dati del form
2. Mostra alert di successo
3. Log della risposta in console
4. Gestisce errori con try/catch

**Validazione**:
- Campi obbligatori: `nome`, `cognome`, `data_nascita`
- Validazione HTML5 con attributo `required`

**Campi del form**:
| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `nome` | text | Sì | Nome del paziente |
| `cognome` | text | Sì | Cognome del paziente |
| `data_nascita` | date | Sì | Data di nascita |
| `codice_fiscale` | text | No | Codice fiscale italiano |
| `diagnosi` | textarea | No | Diagnosi medica |
| `note` | textarea | No | Note aggiuntive |

---

### `GetPatient`

**File**: `src/components/patient/get-patients.tsx`

**Descrizione**:
Componente per cercare e visualizzare pazienti. Include form di ricerca e tabella risultati.

**Props**: Nessuna

**State**:
```typescript
const [searchQuery, setSearchQuery] = useState("");
const [patients, setPatients] = useState<Patient[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Interface `Patient`**:
```typescript
interface Patient {
  id: number;
  nome: string;
  cognome: string;
  dataNascita: string;
  codiceFiscale: string | null;
  diagnosi: string | null;
  note: string | null;
  createdAt: string;
}
```

**Funzioni**:

#### `handleSearch`
```typescript
const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const result = await invoke<Patient[]>("search_patient", {
      query: searchQuery,
    });
    setPatients(result);
  } catch (err) {
    setError(err as string);
    console.error("Errore nella ricerca:", err);
  } finally {
    setLoading(false);
  }
};
```

**Descrizione**: Gestisce la ricerca pazienti quando l'utente sottomette il form.

**Parametri**:
- `e: React.FormEvent` - Event del submit

**Comportamento**:
1. Previene il reload della pagina
2. Imposta stato loading
3. Reset errori precedenti
4. Invoca comando `search_patient` con query
5. Aggiorna lista pazienti con risultati
6. Gestisce errori e aggiorna stato error
7. Reset loading state al termine

**Stati UI**:
- **Loading**: Mostra "Ricerca..." sul pulsante
- **Error**: Mostra messaggio di errore rosso
- **No Results**: Mostra "Nessun paziente trovato"
- **Results**: Mostra tabella con pazienti

**Tabella risultati**:
- Layout: CSS Grid (5 colonne)
- Colonne: Nome, Cognome, Data Nascita, Codice Fiscale, Diagnosi
- Hover effect: Sfondo azzurro + zoom leggero
- Responsive: Su mobile diventa card verticale

---

## 🗄️ Database Schema

### Modello `Paziente`

**File**: `prisma/schema.prisma`

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

**Campi**:

| Campo | Tipo | Nullable | Default | Vincoli | Descrizione |
|-------|------|----------|---------|---------|-------------|
| `id` | Int | No | autoincrement | Primary Key | ID univoco paziente |
| `nome` | String | No | - | - | Nome del paziente |
| `cognome` | String | No | - | - | Cognome del paziente |
| `dataNascita` | DateTime | No | - | - | Data di nascita |
| `codiceFiscale` | String | Sì | null | Unique | Codice fiscale italiano |
| `diagnosi` | String | Sì | null | - | Diagnosi medica |
| `note` | String | Sì | null | - | Note cliniche |
| `createdAt` | DateTime | No | now() | - | Timestamp creazione record |

**Indici**:
- Primary Key su `id`
- Unique constraint su `codiceFiscale`

**Relazioni**: Nessuna (modello standalone)

---

## 🔤 Type Definitions

### TypeScript Types (Frontend)

```typescript
// Patient interface
interface Patient {
  id: number;
  nome: string;
  cognome: string;
  dataNascita: string;        // ISO date string
  codiceFiscale: string | null;
  diagnosi: string | null;
  note: string | null;
  createdAt: string;          // ISO datetime string
}

// Patient form data
interface PatientFormData {
  nome: string;
  cognome: string;
  data_nascita: string;       // YYYY-MM-DD format
  codice_fiscale: string;
  diagnosi: string;
  note: string;
}
```

### Rust Types (Backend)

```rust
// Patient input from frontend
#[derive(Serialize, Deserialize, Debug)]
pub struct PazienteInput {
    pub nome: String,
    pub cognome: String,
    pub data_nascita: String,
    pub codice_fiscale: Option<String>,
    pub diagnosi: Option<String>,
    pub note: Option<String>,
}
```

### Prisma Types (Database)

Generati automaticamente in `src/generated/prisma/`:

```typescript
export type Paziente = {
  id: number
  nome: string
  cognome: string
  dataNascita: Date
  codiceFiscale: string | null
  diagnosi: string | null
  note: string | null
  createdAt: Date
}
```

---

## 🔄 Data Flow Completo

### Esempio: Ricerca Paziente

```
┌──────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                           │
│    User types "Mario" and clicks "Cerca"                 │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 2. REACT COMPONENT (get-patients.tsx)                     │
│    handleSearch() called                                 │
│    - setLoading(true)                                    │
│    - invoke("search_patient", { query: "Mario" })        │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 3. TAURI IPC BRIDGE                                      │
│    Message sent to Rust backend                          │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 4. RUST COMMAND (mod.rs)                                 │
│    search_patient(query: "Mario")                        │
│    - Calls db::search_patient("Mario")                   │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 5. RUST DB BRIDGE (db.rs)                                │
│    search_patient(query: "Mario")                        │
│    - Command::new("node")                                │
│    - .arg("./api/getPatient.js")                         │
│    - .arg("Mario")                                       │
│    - .output()                                           │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 6. NODE.JS SCRIPT (getPatient.js)                        │
│    main() function                                       │
│    - searchQuery = process.argv[2] // "Mario"            │
│    - prisma.paziente.findMany({                          │
│        where: {                                          │
│          OR: [                                           │
│            { nome: { contains: "Mario" } },              │
│            { cognome: { contains: "Mario" } },           │
│            { codiceFiscale: { contains: "Mario" } }      │
│          ]                                               │
│        }                                                 │
│      })                                                  │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 7. PRISMA ORM                                            │
│    Generates SQL query:                                  │
│    SELECT * FROM Paziente                                │
│    WHERE nome LIKE '%Mario%'                             │
│       OR cognome LIKE '%Mario%'                          │
│       OR codiceFiscale LIKE '%Mario%'                    │
│    ORDER BY createdAt DESC                               │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 8. SQLITE DATABASE                                       │
│    Executes query and returns rows                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 9. PRISMA SERIALIZATION                                  │
│    Converts database rows to JSON                        │
│    console.log(JSON.stringify(pazienti))                 │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 10. RUST CAPTURES STDOUT                                 │
│     Parses JSON string to Vec<serde_json::Value>         │
│     Returns Ok(vec) or Err(error_message)                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 11. TAURI IPC RESPONSE                                   │
│     Sends result back to frontend                        │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 12. REACT COMPONENT RECEIVES DATA                        │
│     setPatients(result)                                  │
│     setLoading(false)                                    │
│     Renders table with results                           │
└──────────────────────────────────────────────────────────┘
```

---

## 📝 Note Importanti

### SQLite Limitations

⚠️ **SQLite non supporta `mode: 'insensitive'` in Prisma**

```javascript
// ❌ NON FUNZIONA con SQLite
{ nome: { contains: query, mode: 'insensitive' } }

// ✅ FUNZIONA - case-insensitive di default
{ nome: { contains: query } }
```

### Error Handling

Tutte le funzioni implementano error handling a 3 livelli:

1. **Rust**: Cattura errori di spawn processo e parsing
2. **Node.js**: Try/catch con exit code e stderr
3. **React**: Try/catch con state management per UI

### Performance

- Ricerche con `contains` su SQLite sono efficienti per dataset piccoli/medi
- Per dataset grandi, considerare Full-Text Search (FTS5)
- Indice su `codiceFiscale` per lookup veloci

---

## 🔧 Estensione API

### Come aggiungere un nuovo comando

1. **Definisci struct in Rust** (`mod.rs`):
```rust
#[tauri::command]
pub fn delete_patient(id: i32) -> Result<String, String> {
    db::delete_patient(id)
}
```

2. **Implementa bridge function** (`db.rs`):
```rust
pub fn delete_patient(id: i32) -> Result<String, String> {
    let script_path = current_dir()?.join("api").join("deletePatient.js");
    let output = Command::new("node")
        .arg(&script_path)
        .arg(id.to_string())
        .output()?;
    // ...
}
```

3. **Crea script Node.js** (`api/deletePatient.js`):
```javascript
const patientId = parseInt(process.argv[2]);
await prisma.paziente.delete({ where: { id: patientId } });
```

4. **Registra comando** (`lib.rs`):
```rust
.invoke_handler(tauri::generate_handler![
    // ... existing commands
    pazienti::delete_patient
])
```

5. **Chiama da frontend**:
```typescript
await invoke("delete_patient", { id: 123 });
```

---

**Documentazione generata**: 2025-01-04
**Versione applicazione**: 0.1.0
**Autore**: Luigi
