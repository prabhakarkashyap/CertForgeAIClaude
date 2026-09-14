import { describe, expect, it } from 'vitest';
import { SecurityError } from '@certforge/shared';
import { decryptSecret, encryptSecret, fingerprintSecret, generateEncryptionKey, maskSecret } from '../src/security/encryption.js';

describe('encryption', () => {
  it('round-trips a secret through encrypt/decrypt with the same key', () => {
    const key = generateEncryptionKey();
    const plaintext = 'sk-ant-super-secret-value-1234';

    const encrypted = encryptSecret(plaintext, key);
    expect(encrypted).not.toContain(plaintext);
    expect(encrypted.startsWith('v1:')).toBe(true);

    const decrypted = decryptSecret(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it('produces different ciphertext for the same plaintext due to random IVs', () => {
    const key = generateEncryptionKey();
    const a = encryptSecret('same-value', key);
    const b = encryptSecret('same-value', key);
    expect(a).not.toBe(b);
  });

  it('fails to decrypt when the wrong key is used', () => {
    const key = generateEncryptionKey();
    const wrongKey = generateEncryptionKey();
    const encrypted = encryptSecret('sensitive-value', key);

    expect(() => decryptSecret(encrypted, wrongKey)).toThrow(SecurityError);
  });

  it('fails to decrypt a tampered payload', () => {
    const key = generateEncryptionKey();
    const encrypted = encryptSecret('sensitive-value', key);
    const tampered = encrypted.slice(0, -4) + 'AAAA';

    expect(() => decryptSecret(tampered, key)).toThrow(SecurityError);
  });

  it('rejects a master key that does not decode to 32 bytes', () => {
    expect(() => encryptSecret('value', Buffer.from('too-short').toString('base64'))).toThrow(SecurityError);
  });

  it('masks a secret to a short, non-reversible preview', () => {
    const masked = maskSecret('sk-ant-api03-abcdefghijklmnop');
    expect(masked).not.toContain('abcdefghijklmnop');
    expect(masked.endsWith('mnop')).toBe(true);
    expect(masked).toContain('...');
  });

  it('masks very short secrets without throwing', () => {
    expect(maskSecret('ab')).toBe('****');
  });

  it('produces a stable fingerprint for identical secrets and different for different secrets', () => {
    expect(fingerprintSecret('same-value')).toBe(fingerprintSecret('same-value'));
    expect(fingerprintSecret('value-a')).not.toBe(fingerprintSecret('value-b'));
  });
});
