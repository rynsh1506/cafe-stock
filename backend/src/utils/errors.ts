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
    codeOrMessage = "FORBIDDEN",
    maybeMessage?: string,
  ): AppError {
    const code = maybeMessage ? codeOrMessage : "FORBIDDEN";
    const message = maybeMessage ?? codeOrMessage;
    return new AppError(403, code, message);
  }

  static notFound(
    codeOrMessage = "RESOURCE_NOT_FOUND",
    maybeMessage?: string,
  ): AppError {
    const code = maybeMessage ? codeOrMessage : "RESOURCE_NOT_FOUND";
    const message = maybeMessage ?? codeOrMessage;
    return new AppError(404, code, message);
  }

  static unprocessable(codeOrMessage: string, maybeMessage?: string): AppError {
    const code = maybeMessage ? codeOrMessage : "UNPROCESSABLE_ENTITY";
    const message = maybeMessage ?? codeOrMessage;
    return new AppError(422, code, message);
  }
}
