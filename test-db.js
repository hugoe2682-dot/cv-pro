const { config } = require('dotenv');
config();
const { prisma } = require('./src/lib/prisma');

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
