require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { neonConfig } = require("@neondatabase/serverless");

neonConfig.webSocketConstructor = globalThis.WebSocket;

console.log("Starting Prisma direct query test (Prisma 7 Factory)...");
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

prisma.user.findMany()
  .then(users => {
    console.log("Prisma Direct Success! Users count:", users.length);
    process.exit(0);
  })
  .catch(err => {
    console.error("Prisma Direct Error:", err);
    process.exit(1);
  });
