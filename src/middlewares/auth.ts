import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ErrorHandler from "@utils/errorhandler";
import { verifyAccessToken } from "@utils/jwt";
import { Role } from "@src/types/user";
import { REFRESH_COOKIE } from "@utils/cookies";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ErrorHandler("Authentication required", StatusCodes.UNAUTHORIZED));
  }
  const token = header.slice(7).trim();
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return next(new ErrorHandler("Invalid or expired token", StatusCodes.UNAUTHORIZED));
  }
}

export function requireRole(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ErrorHandler("Authentication required", StatusCodes.UNAUTHORIZED));
    }
    if (!allowed.includes(req.user.role)) {
      return next(new ErrorHandler("Forbidden: insufficient permissions", StatusCodes.FORBIDDEN));
    }
    next();
  };
}

export function requireRefreshCookie(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    return next(new ErrorHandler("Missing refresh token", StatusCodes.UNAUTHORIZED));
  }
  next();
}
