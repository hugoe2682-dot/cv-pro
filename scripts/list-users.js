require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { neonConfig } = require("@neondatabase/serverless");

try {
  const ws = require("ws");
  neonConfig.webSocketConstructor = ws;
} catch (e) {
  neonConfig.webSocketConstructor = globalThis.WebSocket;
}

const DIRECT_URL =
  "postgresql://neondb_owner:npg_dhGJqy0SIb8x@ep-twilight-moon-amckmhn5.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

const adapter = new PrismaNeon({ connectionString: DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    console.log(`\n📋 ${users.length} utilisateur(s) trouvé(s):\n`);
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. Email: ${u.email}`);
      console.log(`     Nom: ${u.name || "(vide)"}`);
      console.log(`     Rôle: ${u.role}`);
      console.log(`     Créé le: ${u.createdAt}`);
      console.log(`     ID: ${u.id}\n`);
    });
  } catch (err) {
    console.error("Erreur:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
