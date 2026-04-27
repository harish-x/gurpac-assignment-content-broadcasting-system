export type Role = "principal" | "teacher";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: Date;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: Date;
}

export interface AccessTokenPayload {
  sub: number;
  role: Role;
  email: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: number;
  family: string;
  jti: string;
  type: "refresh";
}
