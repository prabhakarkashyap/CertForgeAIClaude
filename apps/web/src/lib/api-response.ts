import { NextResponse } from 'next/server';
import { toSafeErrorResponse } from '@certforge/shared';
import { createLogger } from './logger.js';

const logger = createLogger('api');

/**
 * Wraps a route handler so every unexpected error is logged server-side
 * (with secrets redacted) and only a safe, generic message ever reaches the
 * client - never a raw stack trace.
 */
export function withApiErrorHandling<Args extends unknown[], T>(handler: (...args: Args) => Promise<T>) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      const data = await handler(...args);
      return NextResponse.json({ ok: true, data });
    } catch (error) {
      const safe = toSafeErrorResponse(error);
      logger.error('api_error', { category: safe.category, message: safe.message });
      const status = safe.category === 'not_found' ? 404 : safe.category === 'validation' ? 400 : 500;
      return NextResponse.json({ ok: false, error: safe }, { status });
    }
  };
}
