export type LogSeverity = 'debug' | 'info' | 'warn' | 'error';

/** Structured log entry shape emitted by the shared logger (see logger.ts consumers). */
export interface LogEntry {
  timestamp: string;
  severity: LogSeverity;
  event: string;
  module: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Keys that must never appear in log metadata. Enforced defensively by the
 * logger implementation in apps/web/src/lib/logger.ts, which redacts any
 * metadata key matching these (case-insensitive substrings).
 */
export const SENSITIVE_LOG_KEY_PATTERNS = [
  'apikey',
  'api_key',
  'password',
  'secret',
  'token',
  'authorization',
  'encryptionkey',
  'encryption_key',
] as const;
