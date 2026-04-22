import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../core/auth/password.js';
import { AppError, UnauthorizedError, NotFoundError } from '../core/errors.js';

describe('password hashing', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('s3cret-password');
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(hash, 's3cret-password')).toBe(true);
    expect(await verifyPassword(hash, 'wrong-password')).toBe(false);
  });

  it('produces a different hash for the same password each time (salt is random)', async () => {
    const a = await hashPassword('same-password');
    const b = await hashPassword('same-password');
    expect(a).not.toEqual(b);
  });
});

describe('AppError hierarchy', () => {
  it('UnauthorizedError reports 401', () => {
    const err = new UnauthorizedError();
    expect(err).toBeInstanceOf(AppError);
    expect(err.status).toBe(401);
    expect(err.title).toBe('Unauthorized');
  });

  it('NotFoundError reports 404 with custom detail', () => {
    const err = new NotFoundError('Account 42 not found');
    expect(err.status).toBe(404);
    expect(err.detail).toBe('Account 42 not found');
  });
});
