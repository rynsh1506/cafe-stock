export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }

  static badRequest(code: string, message: string): AppError {
    return new AppError(400, code, message);
  }

  static unauthorized(
    message = "Authentication is required to access this resource",
  ): AppError {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static forbidden(
    message = "You do not have permission to perform this action",
  ): AppError {
    return new AppError(403, "FORBIDDEN", message);
  }

  static notFound(code: string, message: string): AppError {
    return new AppError(404, code, message);
  }

  static unprocessable(code: string, message: string): AppError {
    return new AppError(422, code, message);
  }
}
