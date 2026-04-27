import "dotenv/config";

class Secrets {
  public readonly PORT: number;
  public readonly NODE_ENV: string;

  public readonly POSTGRES_USER: string;
  public readonly POSTGRES_PASSWORD: string;
  public readonly POSTGRES_DB: string;
  public readonly POSTGRES_PORT: number;
  public readonly POSTGRES_HOST: string;

  public readonly JWT_ACCESS_SECRET: string;
  public readonly JWT_ACCESS_EXPIRES_IN: string;
  public readonly JWT_REFRESH_SECRET: string;
  public readonly JWT_REFRESH_EXPIRES_IN: string;
  public readonly REFRESH_TTL_DAYS: number;

  public readonly COOKIE_DOMAIN: string;
  public readonly COOKIE_SECURE: boolean;

  public readonly AWS_ACCESS_KEY_ID: string;
  public readonly AWS_SECRET_ACCESS_KEY: string;
  public readonly AWS_REGION: string;
  public readonly S3_BUCKET_NAME: string;

  constructor() {
    this.PORT = Number(process.env.PORT) || 8080;
    this.NODE_ENV = process.env.NODE_ENV || "development";

    this.POSTGRES_USER = process.env.POSTGRES_USER || "";
    this.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || "";
    this.POSTGRES_DB = process.env.POSTGRES_DB || "";
    this.POSTGRES_PORT = Number(process.env.POSTGRES_PORT) || 5432;
    this.POSTGRES_HOST = process.env.POSTGRES_HOST || "";

    this.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "";
    this.JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";
    this.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    this.REFRESH_TTL_DAYS = Number(process.env.REFRESH_TTL_DAYS) || 7;

    this.COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "";
    this.COOKIE_SECURE = (process.env.COOKIE_SECURE || "false").toLowerCase() === "true";

    this.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
    this.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
    this.AWS_REGION = process.env.AWS_REGION || "";
    this.S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";

    if (!this.JWT_ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET (or JWT_SECRET) must be set");
    if (!this.JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET must be set");
    if (this.JWT_ACCESS_SECRET === this.JWT_REFRESH_SECRET) {
      throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ");
    }
  }
}

export default new Secrets();
