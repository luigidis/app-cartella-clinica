# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a medical records management application ("cartella clinica" = clinical records) built with:
- **Frontend**: React 19 + TypeScript + Vite
- **Desktop Framework**: Tauri v2 (Rust backend)
- **Database**: SQLite via Prisma ORM
- **Architecture**: Hybrid approach where Rust backend shells out to Node.js scripts for database operations

## Build & Development Commands

### Development
```bash
npm run tauri dev
```
This starts both the Vite dev server (port 1420) and the Tauri application window.

### Building
```bash
npm run build        # Builds frontend only (TypeScript + Vite)
npm run tauri build  # Builds complete Tauri application (frontend + Rust backend)
```

### Preview
```bash
npm run preview      # Preview production build locally
```

## Database Management

### Prisma Setup
The project uses Prisma with a custom configuration in `prisma.config.ts`. The database is SQLite located at `prisma/dev.db`.

**Important**: Prisma client is generated to `src/generated/prisma/` (not the default location).

### Common Prisma Commands
```bash
npx prisma migrate dev     # Create and apply new migration
npx prisma migrate deploy  # Apply pending migrations
npx prisma studio          # Open database GUI
npx prisma generate        # Regenerate Prisma client
```

### Database Location
- Schema: `prisma/schema.prisma`
- Database file: `prisma/dev.db`
- Migrations: `prisma/migrations/`
- Generated client: `src/generated/prisma/`

## Architecture

### Hybrid Backend Approach
The application uses an unusual but functional hybrid architecture:

1. **React Frontend** (`src/`) calls Tauri commands via `@tauri-apps/api/core`
2. **Rust Backend** (`src-tauri/src/`) receives commands and spawns Node.js processes
3. **Node.js Scripts** (`src-tauri/api/*.js`) execute Prisma database operations
4. **Results** flow back through Rust to the frontend

**Why this approach?** Prisma doesn't have native Rust support, so the project bridges Tauri/Rust with Prisma/Node.js via subprocess calls.

### Key Files

**Frontend:**
- `src/App.tsx` - Main application component
- `src/pazienti.tsx` - Patient management form component
- `src/generated/prisma/` - Generated Prisma client for TypeScript

**Rust Backend:**
- `src-tauri/src/lib.rs` - Tauri application entry point with command registration
- `src-tauri/src/pazienti/mod.rs` - Patient command definitions
- `src-tauri/src/pazienti/db.rs` - Database interface that shells out to Node.js
- `src-tauri/src/main.rs` - Minimal main function that calls lib::run()

**Node.js Scripts:**
- `src-tauri/api/createPatient.js` - Creates new patient records
- `src-tauri/api/pazienti.js` - Patient retrieval operations

**Database:**
- `prisma/schema.prisma` - Database schema with Paziente model
- `prisma.config.ts` - Prisma configuration (custom location)

### Tauri Commands Flow

Example: Creating a patient
1. User submits form in `src/pazienti.tsx`
2. Frontend calls `core.invoke("create_patient", { data: form })`
3. Rust command in `src-tauri/src/pazienti/mod.rs` receives the call
4. Rust executes: `node ./src-tauri/api/createPaziente.js <json_data>`
5. Node.js script uses Prisma to insert into database
6. Result flows back through Rust to frontend

### Data Model

**Paziente (Patient) Table:**
- `id` - Auto-incrementing primary key
- `nome` - First name
- `cognome` - Last name
- `dataNascita` - Date of birth
- `codiceFiscale` - Italian tax code (unique, optional)
- `diagnosi` - Diagnosis (optional)
- `note` - Notes (optional)
- `createdAt` - Record creation timestamp

### Adding New Features

**To add a new Tauri command:**
1. Define the command in `src-tauri/src/pazienti/mod.rs` (or create new module)
2. Create corresponding Node.js script in `src-tauri/api/` if database access is needed
3. Register the command in `src-tauri/src/lib.rs` invoke_handler
4. Call from frontend using `@tauri-apps/api/core.invoke()`

**To modify the database:**
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <description>`
3. Run `npx prisma generate` to update TypeScript types
4. Update relevant Node.js scripts in `src-tauri/api/`
5. Update Rust types in `src-tauri/src/pazienti/mod.rs`

## Configuration

- **Vite dev server**: Port 1420 (strict port required by Tauri)
- **HMR**: Port 1421
- **Tauri config**: `src-tauri/tauri.conf.json`
- **Window size**: 800x600 (default)
- **TypeScript**: Strict mode enabled
