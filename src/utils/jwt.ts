import jwt, { SignOptions } from "jsonwebtoken";
import Secrets from "@config/secrets";
import { AccessTokenPayload, RefreshTokenPayload } from "@src/types/user";

type AccessClaims = Omit<AccessTokenPayload, "type">;
type RefreshClaims = Omit<RefreshTokenPayload, "type">;

export function signAccessToken(claims: AccessClaims): string {
  const opts: SignOptions = { expiresIn: Secrets.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign({ ...claims, type: "access" }, Secrets.JWT_ACCESS_SECRET, opts);
}

export function signRefreshToken(claims: RefreshClaims): string {
  const opts: SignOptions = { expiresIn: Secrets.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign({ ...claims, type: "refresh" }, Secrets.JWT_REFRESH_SECRET, opts);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, Secrets.JWT_ACCESS_SECRET) as unknown as AccessTokenPayload;
  if (decoded.type !== "access") throw new Error("Wrong token type");
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, Secrets.JWT_REFRESH_SECRET) as unknown as RefreshTokenPayload;
  if (decoded.type !== "refresh") throw new Error("Wrong token type");
  return decoded;
}
