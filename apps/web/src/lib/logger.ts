import { SENSITIVE_LOG_KEY_PATTERNS, type LogEntry, type LogSeverity } from '@certforge/shared';

function redactMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!metadata) return metadata;
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_LOG_KEY_PATTERNS.some((pattern) => lowerKey.includes(pattern));
    redacted[key] = isSensitive ? '[redacted]' : value;
  }
  return redacted;
}

function emit(severity: LogSeverity, module: string, event: string, metadata?: Record<string, unknown>, correlationId?: string): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    severity,
    event,
    module,
    correlationId,
    metadata: redactMetadata(metadata),
  };
  const line = JSON.stringify(entry);
  if (severity === 'error') {
    // eslint-disable-next-line no-console
    console.error(line);
  } else if (severity === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

/**
 * Structured logger with automatic redaction of any metadata key matching
 * a sensitive-key pattern (api keys, passwords, secrets, tokens...). Never
 * pass raw error objects that may contain provider request bodies directly
 * as metadata values - stringify only the safe fields you need.
 */
export function createLogger(module: string) {
  return {
    debug: (event: string, metadata?: Record<string, unknown>, correlationId?: string) =>
      emit('debug', module, event, metadata, correlationId),
    info: (event: string, metadata?: Record<string, unknown>, correlationId?: string) =>
      emit('info', module, event, metadata, correlationId),
    warn: (event: string, metadata?: Record<string, unknown>, correlationId?: string) =>
      emit('warn', module, event, metadata, correlationId),
    error: (event: string, metadata?: Record<string, unknown>, correlationId?: string) =>
      emit('error', module, event, metadata, correlationId),
  };
}
