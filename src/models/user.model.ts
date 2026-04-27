import { query } from "@config/db";
import { Role, User } from "@src/types/user";

export async function findByEmail(email: string): Promise<User | null> {
  const result = await query<User>(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [email.toLowerCase()]);
  return result.rows[0] ?? null;
}

export async function findById(id: number): Promise<User | null> {
  const result = await query<User>(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] ?? null;
}

export async function createUser(name: string, email: string, passwordHash: string, role: Role): Promise<User> {
  const result = await query<User>(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email.toLowerCase(), passwordHash, role],
  );
  return result.rows[0];
}
