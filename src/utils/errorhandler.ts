class ErrorHandler extends Error {
  public statusCode: number;
  public success: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public errors?: any;
  public path?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public keyValue?: Record<string, any>;
  public code?: number;

  constructor(message: string, statusCode: number = 500, success = false) {
    super(message);
    this.statusCode = statusCode;
    this.success = success;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
