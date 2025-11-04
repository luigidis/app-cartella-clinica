import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client.ts";

const prisma = new PrismaClient();

async function main() {
  try {
    // Get optional search query from command line argument
    const searchQuery = process.argv[2];

    let pazienti;

    if (searchQuery) {
      // Search patients by nome, cognome, or codiceFiscale
      // Note: SQLite's LIKE operator is case-insensitive by default for ASCII characters
      pazienti = await prisma.paziente.findMany({
        where: {
          OR: [
            {
              nome: {
                contains: searchQuery
              }
            },
            {
              cognome: {
                contains: searchQuery
              }
            },
            {
              codiceFiscale: {
                contains: searchQuery
              }
            }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // Fetch all patients if no search query
      pazienti = await prisma.paziente.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    // Output the result as JSON
    console.log(JSON.stringify(pazienti));
  } catch (error) {
    console.error("Error fetching patients:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
