import { AccessTokenPayload, RefreshTokenPayload } from "./user";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      refresh?: {
        payload: RefreshTokenPayload;
        rawToken: string;
        rowId: number;
      };
    }
  }
}

export {};
