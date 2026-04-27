import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import * as UserModel from "@models/user.model";
import * as RefreshModel from "@models/refresh_token.model";
import { hashPassword, comparePassword } from "@utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@utils/jwt";
import { sha256, randomTokenBase64Url } from "@utils/hash";
import ErrorHandler from "@utils/errorhandler";
import Secrets from "@config/secrets";
import { PublicUser, Role, User } from "@src/types/user";

export interface AuthBundle {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  refreshTtlMs: number;
}

function toPublic(u: User): PublicUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    created_at: u.created_at,
  };
}

function refreshTtlMs(): number {
  return Secrets.REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;
}

async function issueRefreshRow(userId: number, familyId: string, parentId: number | null, ua?: string, ip?: string) {
  const jti = uuidv4();
  const refreshToken = signRefreshToken({ sub: userId, family: familyId, jti });
  const expiresAt = new Date(Date.now() + refreshTtlMs());
  const row = await RefreshModel.insert({
    userId,
    tokenHash: sha256(refreshToken),
    familyId,
    parentId,
    expiresAt,
    userAgent: ua ?? null,
    ip: ip ?? null,
  });
  return { refreshToken, row };
}

async function buildBundle(user: User, ua?: string, ip?: string): Promise<AuthBundle> {
  const familyId = uuidv4();
  const { refreshToken } = await issueRefreshRow(user.id, familyId, null, ua, ip);
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const csrfToken = randomTokenBase64Url(32);
  return {
    user: toPublic(user),
    accessToken,
    refreshToken,
    csrfToken,
    refreshTtlMs: refreshTtlMs(),
  };
}

export async function register(name: string, email: string, password: string, role: Role, ua?: string, ip?: string): Promise<AuthBundle> {
  const existing = await UserModel.findByEmail(email);
  if (existing) {
    throw new ErrorHandler("Email already registered", StatusCodes.CONFLICT);
  }
  const hash = await hashPassword(password);
  const user = await UserModel.createUser(name, email, hash, role);
  return buildBundle(user, ua, ip);
}

export async function login(email: string, password: string, ua?: string, ip?: string): Promise<AuthBundle> {
  const user = await UserModel.findByEmail(email);
  if (!user) throw new ErrorHandler("Invalid credentials", StatusCodes.UNAUTHORIZED);
  const ok = await comparePassword(password, user.password_hash);
  if (!ok) throw new ErrorHandler("Invalid credentials", StatusCodes.UNAUTHORIZED);
  return buildBundle(user, ua, ip);
}

export async function me(userId: number): Promise<PublicUser> {
  const user = await UserModel.findById(userId);
  if (!user) throw new ErrorHandler("User not found", StatusCodes.NOT_FOUND);
  return toPublic(user);
}

export async function refresh(rawToken: string, ua?: string, ip?: string): Promise<AuthBundle> {
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw new ErrorHandler("Invalid refresh token", StatusCodes.UNAUTHORIZED);
  }

  const tokenHash = sha256(rawToken);
  const row = await RefreshModel.findByHash(tokenHash);
  if (!row) {
    await RefreshModel.revokeFamily(payload.family);
    throw new ErrorHandler("Refresh token not recognised", StatusCodes.UNAUTHORIZED);
  }
  if (row.revoked_at) {
    await RefreshModel.revokeFamily(row.family_id);
    throw new ErrorHandler("Refresh token reuse detected", StatusCodes.UNAUTHORIZED);
  }
  if (row.expires_at.getTime() < Date.now()) {
    await RefreshModel.revokeById(row.id);
    throw new ErrorHandler("Refresh token expired", StatusCodes.UNAUTHORIZED);
  }

  const user = await UserModel.findById(row.user_id);
  if (!user) {
    await RefreshModel.revokeFamily(row.family_id);
    throw new ErrorHandler("User no longer exists", StatusCodes.UNAUTHORIZED);
  }

  await RefreshModel.revokeById(row.id);
  const { refreshToken } = await issueRefreshRow(user.id, row.family_id, row.id, ua, ip);
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const csrfToken = randomTokenBase64Url(32);

  return {
    user: toPublic(user),
    accessToken,
    refreshToken,
    csrfToken,
    refreshTtlMs: refreshTtlMs(),
  };
}

export async function logout(rawToken: string | undefined): Promise<void> {
  if (!rawToken) return;
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    return;
  }
  const tokenHash = sha256(rawToken);
  const row = await RefreshModel.findByHash(tokenHash);
  if (row) {
    await RefreshModel.revokeFamily(row.family_id);
    return;
  }
  await RefreshModel.revokeFamily(payload.family);
}
