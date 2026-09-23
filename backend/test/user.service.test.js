import { describe, expect, test } from 'bun:test';
import { validateCreateCashierInput, toPublicUser } from '../src/services/user.service.js';
import { ApiError } from '../src/utils/errors.js';

function capture(fn) {
  try {
    fn();
    return null;
  } catch (err) {
    return err;
  }
}

describe('validateCreateCashierInput', () => {
  test('accepts valid input', () => {
    const err = capture(() =>
      validateCreateCashierInput({ username: 'cashier01', password: 'pass123', displayName: 'Cashier 01' })
    );
    expect(err).toBeNull();
  });

  test('rejects missing username', () => {
    const err = capture(() =>
      validateCreateCashierInput({ username: '', password: 'pass123', displayName: 'Cashier 01' })
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(422);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details.some((d) => d.field === 'username')).toBe(true);
  });

  test('rejects short password', () => {
    const err = capture(() =>
      validateCreateCashierInput({ username: 'cashier01', password: '123', displayName: 'Cashier 01' })
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(422);
    expect(err.details.some((d) => d.field === 'password')).toBe(true);
  });

  test('rejects missing display name', () => {
    const err = capture(() =>
      validateCreateCashierInput({ username: 'cashier01', password: 'pass123', displayName: '   ' })
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(err.details.some((d) => d.field === 'displayName')).toBe(true);
  });

  test('collects multiple field errors', () => {
    const err = capture(() =>
      validateCreateCashierInput({ username: '', password: '', displayName: '' })
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(err.details.length).toBe(3);
  });
});

describe('toPublicUser', () => {
  test('serializes a user document without passwordHash', () => {
    const user = toPublicUser({
      _id: { toString: () => '64bit-hex-id' },
      username: 'cashier01',
      displayName: 'Cashier 01',
      role: 'CASHIER',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      passwordHash: 'scrypt…:salt:hash',
    });
    expect(user).not.toHaveProperty('passwordHash');
    expect(user.id).toBe('64bit-hex-id');
    expect(user.role).toBe('CASHIER');
  });

  test('returns null when given no user', () => {
    expect(toPublicUser(null)).toBeNull();
  });
});