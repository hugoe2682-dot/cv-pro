const { Pool, neonConfig } = require("@neondatabase/serverless");
neonConfig.webSocketConstructor = globalThis.WebSocket;

const connectionString = "postgresql://neondb_owner:npg_dhGJqy0SIb8x@ep-twilight-moon-amckmhn5.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

console.log("Starting raw query test...");
const pool = new Pool({ connectionString });
pool.query("SELECT 1")
  .then(res => {
    console.log("Direct Query Success:", res.rows);
    process.exit(0);
  })
  .catch(err => {
    console.error("Direct Query Error:", err);
    process.exit(1);
  });
