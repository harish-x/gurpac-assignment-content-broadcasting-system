import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodType } from "zod";
import ErrorHandler from "@utils/errorhandler";

function buildMessage(issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>): string {
  return issues.map((i) => `${i.path.map((p) => String(p)).join(".")}: ${i.message}`).join("; ");
}

export const validateBody =
  <T>(schema: ZodType<T>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new ErrorHandler(buildMessage(parsed.error.issues), StatusCodes.BAD_REQUEST));
    }
    req.body = parsed.data;
    next();
  };

export const validateQuery =
  <T>(schema: ZodType<T>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return next(new ErrorHandler(buildMessage(parsed.error.issues), StatusCodes.BAD_REQUEST));
    }
    (req as unknown as { validatedQuery: T }).validatedQuery = parsed.data;
    next();
  };
