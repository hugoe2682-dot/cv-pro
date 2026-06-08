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

const TARGET_EMAIL = "hugoe2682@gmail.com";

async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
    if (!user) {
      console.error(`❌ Utilisateur non trouvé: ${TARGET_EMAIL}`);
      process.exit(1);
    }
    console.log(`✅ Utilisateur trouvé: ${user.name || user.email} (rôle actuel: ${user.role})`);

    const updated = await prisma.user.update({
      where: { email: TARGET_EMAIL },
      data: { role: "manager" },
    });
    console.log(`🎉 Rôle mis à jour → ${updated.role}`);
  } catch (err) {
    console.error("Erreur:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
