import crypto from 'node:crypto';
import { ApiError } from '../utils/errors.js';
import { verifyPassword } from '../utils/password.js';
import { findUserByUsername } from '../repositories/user.repository.js';
import { hashToken, SESSION_MAX_AGE_SECONDS } from '../middleware/authContext.js';
import { createAuthSession, destroyAuthSessionByTokenHash } from '../repositories/authSession.repository.js';

const SESSION_DAYS = 7;

function validateLoginInput(username, password) {
  const details = [];
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    details.push({ field: 'username', message: 'Username is required.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    details.push({ field: 'password', message: 'Password is required.' });
  }
  if (details.length > 0) {
    throw new ApiError(400, 'INVALID_CREDENTIALS', 'Invalid login input.', details);
  }
}

function toPublicUser(user) {
  return {
    id: String(user._id || user.id),
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
}

export async function login(username, password) {
  validateLoginInput(username, password);
  const cleanUsername = username.trim();

  const user = await findUserByUsername(cleanUsername);
  if (!user || user.status !== 'ACTIVE' || !verifyPassword(password, user.passwordHash)) {
    // Generic failure: do not reveal whether the account exists, is archived, or the password was wrong.
    throw new ApiError(401, 'UNAUTHENTICATED', 'Invalid username or password.');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  await createAuthSession({
    tokenHash: hashToken(token),
    userId: user._id,
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000),
  });

  return { user: toPublicUser(user), token };
}

export async function logout(token) {
  if (token) {
    await destroyAuthSessionByTokenHash(hashToken(token));
  }
  return {};
}

export { SESSION_MAX_AGE_SECONDS, toPublicUser };