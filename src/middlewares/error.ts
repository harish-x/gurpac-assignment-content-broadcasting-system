import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "@utils/errorhandler";

function getJwtErrorMessage(message: string): string {
  const errorMessages: { [key: string]: string } = {
    "invalid signature": "Authentication failed: Invalid token signature",
    "jwt malformed": "Authentication failed: Malformed token",
    "jwt expired": "Authentication failed: Token has expired",
    "invalid token": "Authentication failed: Invalid token",
    "No authorization token was found": "Authentication required: No token provided",
  };

  for (const [key, value] of Object.entries(errorMessages)) {
    if (message.toLowerCase().includes(key)) {
      return value;
    }
  }

  return "Authentication failed";
}

const errorMiddleware = (err: ErrorHandler, req: Request, res: Response, _next: NextFunction) => {
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }

  let message = err.message;

  if (err.name === "ValidationError" && err.errors) {
    message = Object.values(err.errors)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((v: any) => v.message)
      .join(", ");
    err = new ErrorHandler(message, StatusCodes.BAD_REQUEST, false);
  }

  if (err.name === "CastError" && err.path) {
    message = `Resource not found: ${err.path}`;
    err = new ErrorHandler(message, StatusCodes.BAD_REQUEST, false);
  }

  if (err.code === 11000 && err.keyValue) {
    message = `Duplicate key: ${Object.keys(err.keyValue)}`;
    err = new ErrorHandler(message, StatusCodes.BAD_REQUEST, false);
  }

  if (err.name === "JSONWebTokenError") {
    err = new ErrorHandler("Invalid token", StatusCodes.BAD_REQUEST, false);
  }

  if (err.message === "CSRF validation failed") {
    err = new ErrorHandler("CSRF validation failed", StatusCodes.BAD_REQUEST, false);
  }

  const pgErrorCode = String(err.code);

  if (
    err.name === "PgError" ||
    err.message?.includes("PostgreSQL") ||
    pgErrorCode === "23503" ||
    pgErrorCode === "23505" ||
    pgErrorCode === "23502"
  ) {
    const pgMessages: { [key: string]: string } = {
      "23503": "Foreign key constraint failed: referenced record does not exist",
      "23505": `Duplicate entry: ${Object.keys(err.keyValue || {}).join(", ")}`,
      "23502": "Field cannot be null",
      "22001": "String data too long for column",
      "42804": "Data type mismatch",
      "22003": "Numeric value out of range",
      "22007": "Invalid date/time format",
      "42501": "Permission denied",
      "08001": "Database connection failed",
      "08006": "Database connection failure",
    };

    for (const [key, value] of Object.entries(pgMessages)) {
      if (pgErrorCode === key) {
        message = value;
        break;
      }
    }

    if (!message) {
      message = "Database error occurred";
    }

    err = new ErrorHandler(message, StatusCodes.BAD_REQUEST, false);
  }

  if (err.name === "UnauthorizedError") {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: getJwtErrorMessage(err.message),
    });
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

export default errorMiddleware;
