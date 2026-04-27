import fs from "fs";
import path from "path";
import pool, { connectDb } from "@config/db";

async function runMigrations(): Promise<void> {
  await connectDb();

  const dir = __dirname;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  const client = await pool.connect();
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), "utf8");
      console.log(`Applying ${file}...`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("COMMIT");
        console.log(`  ok`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }
  } finally {
    client.release();
  }
}

runMigrations()
  .then(() => {
    console.log("Migrations complete.");
    return pool.end();
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    pool.end().finally(() => process.exit(1));
  });
