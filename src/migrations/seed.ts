/**
 * Creates the initial principal account.
 * Run once after migrations: npx ts-node -r tsconfig-paths/register src/migrations/seed.ts
 *
 * Credentials are read from env vars so they never appear in source code:
 *   SEED_PRINCIPAL_EMAIL=principal@school.edu
 *   SEED_PRINCIPAL_PASSWORD=StrongPassword123
 *   SEED_PRINCIPAL_NAME="School Principal"
 */
import "dotenv/config";
import pool, { connectDb } from "@config/db";
import bcrypt from "bcryptjs";

async function seed() {
  const email = process.env.SEED_PRINCIPAL_EMAIL;
  const password = process.env.SEED_PRINCIPAL_PASSWORD;
  const name = process.env.SEED_PRINCIPAL_NAME ?? "Principal";

  if (!email || !password) {
    console.error("Set SEED_PRINCIPAL_EMAIL and SEED_PRINCIPAL_PASSWORD in your .env before running seed.");
    process.exit(1);
  }

  await connectDb();
  const client = await pool.connect();
  try {
    const existing = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if ((existing.rowCount ?? 0) > 0) {
      console.log(`Principal account already exists for ${email}. Skipping.`);
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    await client.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'principal')`,
      [name, email, hash],
    );
    console.log(`Principal account created: ${email}`);
  } finally {
    client.release();
  }
}

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error("Seed failed:", err);
    pool.end().finally(() => process.exit(1));
  });
