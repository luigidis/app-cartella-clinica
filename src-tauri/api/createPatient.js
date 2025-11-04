import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client.ts";

const prisma = new PrismaClient();

async function main() {
  try {
    // Get JSON data from command line argument
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

    // Output the result as JSON
    console.log(JSON.stringify(nuovo));
  } catch (error) {
    console.error("Error creating patient:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
