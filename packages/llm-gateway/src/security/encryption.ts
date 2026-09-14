import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'node:crypto';
import { SecurityError } from '@certforge/shared';

/**
 * Authenticated encryption (AES-256-GCM) for provider API credentials.
 * Every secret is encrypted with a fresh random IV; the resulting payload
 * embeds a format version, IV and auth tag so keys can be rotated later
 * without breaking previously-stored values.
 *
 * Encoded format: "v1:<iv-base64>:<authTag-base64>:<ciphertext-base64>"
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;
const KEY_LENGTH_BYTES = 32;
const FORMAT_VERSION = 'v1';

export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH_BYTES).toString('base64');
}

function decodeKey(masterKeyBase64: string): Buffer {
  const key = Buffer.from(masterKeyBase64, 'base64');
  if (key.length !== KEY_LENGTH_BYTES) {
    throw new SecurityError({
      message: 'Application encryption key must decode to exactly 32 bytes.',
    });
  }
  return key;
}

export function encryptSecret(plaintext: string, masterKeyBase64: string): string {
  const key = decodeKey(masterKeyBase64);
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [FORMAT_VERSION, iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(
    ':',
  );
}

export function decryptSecret(payload: string, masterKeyBase64: string): string {
  const parts = payload.split(':');
  if (parts.length !== 4 || parts[0] !== FORMAT_VERSION) {
    throw new SecurityError({ message: 'Encrypted secret payload has an unrecognized format.' });
  }
  const [, ivB64, authTagB64, ciphertextB64] = parts;
  const key = decodeKey(masterKeyBase64);
  const iv = Buffer.from(ivB64 as string, 'base64');
  const authTag = Buffer.from(authTagB64 as string, 'base64');
  const ciphertext = Buffer.from(ciphertextB64 as string, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  try {
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString('utf8');
  } catch (cause) {
    throw new SecurityError({
      message: 'Failed to decrypt secret: payload may be corrupted or the encryption key has changed.',
      cause,
    });
  }
}

/** Returns a UI/log-safe preview such as "sk-...ab12". Never reversible. */
export function maskSecret(plaintext: string): string {
  if (plaintext.length <= 4) {
    return '****';
  }
  const prefix = plaintext.slice(0, Math.min(3, plaintext.length - 4));
  const suffix = plaintext.slice(-4);
  return `${prefix}...${suffix}`;
}

/** Stable, non-reversible fingerprint useful for de-duplicating identical keys without storing them. */
export function fingerprintSecret(plaintext: string): string {
  return createHash('sha256').update(plaintext, 'utf8').digest('hex').slice(0, 16);
}
