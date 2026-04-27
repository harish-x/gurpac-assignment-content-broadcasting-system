import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ErrorHandler from "@utils/errorhandler";
import { CSRF_COOKIE } from "@utils/cookies";

export function csrfGuard(req: Request, _res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.header("x-xsrf");

  if (!cookieToken || !headerToken) {
    return next(new ErrorHandler("CSRF validation failed", StatusCodes.FORBIDDEN));
  }
  if (cookieToken !== headerToken) {
    return next(new ErrorHandler("CSRF validation failed", StatusCodes.FORBIDDEN));
  }
  next();
}
