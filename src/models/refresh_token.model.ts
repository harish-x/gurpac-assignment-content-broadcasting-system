import { query } from "@config/db";

export interface RefreshTokenRow {
  id: number;
  user_id: number;
  token_hash: string;
  family_id: string;
  parent_id: number | null;
  expires_at: Date;
  revoked_at: Date | null;
  user_agent: string | null;
  ip: string | null;
  created_at: Date;
}

export async function insert(params: {
  userId: number;
  tokenHash: string;
  familyId: string;
  parentId: number | null;
  expiresAt: Date;
  userAgent?: string | null;
  ip?: string | null;
}): Promise<RefreshTokenRow> {
  const result = await query<RefreshTokenRow>(
    `INSERT INTO refresh_tokens
       (user_id, token_hash, family_id, parent_id, expires_at, user_agent, ip)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [params.userId, params.tokenHash, params.familyId, params.parentId, params.expiresAt, params.userAgent ?? null, params.ip ?? null],
  );
  return result.rows[0];
}

export async function findByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
  const result = await query<RefreshTokenRow>(`SELECT * FROM refresh_tokens WHERE token_hash = $1 LIMIT 1`, [tokenHash]);
  return result.rows[0] ?? null;
}

export async function revokeById(id: number): Promise<void> {
  await query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL`, [id]);
}

export async function revokeFamily(familyId: string): Promise<void> {
  await query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = $1 AND revoked_at IS NULL`, [familyId]);
}

export async function revokeAllForUser(userId: number): Promise<void> {
  await query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`, [userId]);
}
