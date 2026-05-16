import { config } from 'dotenv';
config();
import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Success! Connected to DB. Users count:", users.length);
  } catch (err) {
    console.error("DB connection failed:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
