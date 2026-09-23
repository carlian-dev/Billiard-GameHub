import { describe, expect, test } from 'bun:test';
import { hashPassword, verifyPassword } from '../src/utils/password.js';

describe('hashPassword', () => {
  test('produces a scrypt-parameterized hash string', () => {
    const hash = hashPassword('my-secret');
    expect(hash).toMatch(/^scrypt:64:16384:8:1:([0-9a-f]{32}):([0-9a-f]{128})$/);
  });

  test('uses a fresh salt per call', () => {
    expect(hashPassword('same-password')).not.toBe(hashPassword('same-password'));
  });
});

describe('verifyPassword', () => {
  test('accepts the correct password', () => {
    const hash = hashPassword('RightPass1');
    expect(verifyPassword('RightPass1', hash)).toBe(true);
  });

  test('rejects a wrong password', () => {
    const hash = hashPassword('RightPass1');
    expect(verifyPassword('WrongPass1', hash)).toBe(false);
  });

  test('rejects malformed or missing stored values', () => {
    expect(verifyPassword('anything', 'not-a-hash')).toBe(false);
    expect(verifyPassword('anything', '')).toBe(false);
    expect(verifyPassword('anything', null)).toBe(false);
    expect(verifyPassword('anything', undefined)).toBe(false);
  });

  test('rejects empty input password', () => {
    const hash = hashPassword('RightPass1');
    expect(verifyPassword('', hash)).toBe(false);
  });
});