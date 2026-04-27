import { NextFunction, Request, Response } from "express";
import { error } from "@utils/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const catchAsyncErrror = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch((err: Error) => {
    error(`Error: ${err.message} - ${req.method} ${req.originalUrl}`, err.stack);
    next(err);
  });
};

export default catchAsyncErrror;
