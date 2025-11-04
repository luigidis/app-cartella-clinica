-- CreateTable
CREATE TABLE "Paziente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "dataNascita" DATETIME NOT NULL,
    "codiceFiscale" TEXT,
    "diagnosi" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Paziente_codiceFiscale_key" ON "Paziente"("codiceFiscale");
