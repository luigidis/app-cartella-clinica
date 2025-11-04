import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client.ts";

const prisma = new PrismaClient();

async function main() {
  try {
    // Fetch all patients
    const pazienti = await prisma.paziente.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

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
