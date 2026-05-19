import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";

// In Node.js environment (local development), shim WebSocket using native or library constructor
if (typeof window === "undefined") {
  if (globalThis.WebSocket) {
    neonConfig.webSocketConstructor = globalThis.WebSocket;
  } else {
    try {
      const ws = require("ws");
      neonConfig.webSocketConstructor = ws;
    } catch (e) {
      console.warn("Could not load ws package for Neon WebSocket client:", e);
    }
  }
}

let connectionString = process.env.DATABASE_URL!;
if (connectionString && !connectionString.includes("sslmode=")) {
  connectionString += connectionString.includes("?") ? "&sslmode=require" : "?sslmode=require";
}

const adapter = new PrismaNeon({
  connectionString,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
