import { ProviderError } from '@certforge/shared';

const DEFAULT_TIMEOUT_MS = 15_000;

export interface HttpJsonOptions {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
}

/**
 * Minimal fetch wrapper shared by every provider adapter. Centralizing this
 * keeps timeout handling, JSON parsing and error normalization consistent
 * without leaking provider-specific concerns into callers.
 */
export async function httpJson<T = unknown>(options: HttpJsonOptions): Promise<{ status: number; data: T }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(options.url, {
      method: options.method ?? 'GET',
      headers: {
        'content-type': 'application/json',
        ...options.headers,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let data: T;
    try {
      data = text.length > 0 ? (JSON.parse(text) as T) : (undefined as T);
    } catch {
      throw new ProviderError({
        message: 'Provider returned a non-JSON response.',
        details: { status: response.status },
      });
    }

    return { status: response.status, data };
  } catch (cause) {
    if (cause instanceof ProviderError) {
      throw cause;
    }
    const isAbort = cause instanceof Error && cause.name === 'AbortError';
    throw new ProviderError({
      message: isAbort ? 'Provider request timed out.' : 'Provider request failed.',
      cause,
    });
  } finally {
    clearTimeout(timeout);
  }
}
