import { config } from 'dotenv';
config();
import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Success! Connected to DB. Users count:", users.length);
    process.exit(0);
  } catch (err) {
    console.error("DB connection failed:");
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
