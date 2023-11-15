export class AppError extends Error {
  constructor(message: string, public code: number) {
    super(message);
  }
}

export class TokenError extends AppError {
  constructor(message: string) {
    super(message, 401);
    this.name = "TokenError";
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 401);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class BadDataError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "BadDataError";
  }
}

export class InternalError extends AppError {
  constructor(message: string) {
    super(message, 500);
    this.name = "InternalError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class BuildError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "BuildError";
  }
}
