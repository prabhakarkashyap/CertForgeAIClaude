/**
 * Standardized application error hierarchy. Every error carries a safe,
 * user-facing `message` and an optional `details` bag for server-side
 * logging that MUST NOT include secrets (API keys, passwords, encryption
 * material). See docs/architecture/architecture-overview.md#error-handling.
 */
export type AppErrorCategory =
  | 'validation'
  | 'configuration'
  | 'provider'
  | 'database'
  | 'certification_pack'
  | 'generation'
  | 'security'
  | 'not_found';

export interface AppErrorOptions {
  message: string;
  details?: Record<string, unknown>;
  cause?: unknown;
}

export class AppError extends Error {
  readonly category: AppErrorCategory;
  readonly details: Record<string, unknown> | undefined;

  constructor(category: AppErrorCategory, options: AppErrorOptions) {
    super(options.message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.category = category;
    this.details = options.details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(options: AppErrorOptions) {
    super('validation', options);
  }
}

export class ConfigurationError extends AppError {
  constructor(options: AppErrorOptions) {
    super('configuration', options);
  }
}

export class ProviderError extends AppError {
  constructor(options: AppErrorOptions) {
    super('provider', options);
  }
}

export class DatabaseError extends AppError {
  constructor(options: AppErrorOptions) {
    super('database', options);
  }
}

export class CertificationPackError extends AppError {
  constructor(options: AppErrorOptions) {
    super('certification_pack', options);
  }
}

export class GenerationError extends AppError {
  constructor(options: AppErrorOptions) {
    super('generation', options);
  }
}

export class SecurityError extends AppError {
  constructor(options: AppErrorOptions) {
    super('security', options);
  }
}

export class NotFoundError extends AppError {
  constructor(options: AppErrorOptions) {
    super('not_found', options);
  }
}

/** Narrow an unknown error into a safe {message, category} pair for API responses. */
export function toSafeErrorResponse(error: unknown): { message: string; category: AppErrorCategory } {
  if (error instanceof AppError) {
    return { message: error.message, category: error.category };
  }
  return { message: 'An unexpected error occurred.', category: 'configuration' };
}
