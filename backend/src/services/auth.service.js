import crypto from 'node:crypto';
import { ApiError } from '../utils/errors.js';
import { findUserByUsername } from '../repositories/user.repository.js';
import { createSession, destroySession } from '../middleware/authContext.js';

// MVP 0 auth foundation.
// - Securely hashes passwords (scrypt) for demo/foundation users.
// - Authenticates server-side; never trusts frontend-supplied role.
// - Establishes a server-side session token and identifies the user on later requests.
// DB lookup is attempted first; foundation demo users allow verification without feature data.

function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex');
}

function buildDemoUsers() {
  // Demo-only foundation credentials (overridable via env for local verification).
  // Real ADMIN/CASHIER provisioning belongs to later MVPs.
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD || 'Admin123!';
  const cashierPassword = process.env.DEMO_CASHIER_PASSWORD || 'Cashier123!';
  const salt = 'mvp0-foundation-salt';
  return [
    { id: 'demo-admin', username: 'admin', role: 'ADMIN', salt, hash: hashPassword(adminPassword, salt) },
    { id: 'demo-cashier', username: 'cashier', role: 'CASHIER', salt, hash: hashPassword(cashierPassword, salt) },
  ];
}

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

export async function login(username, password) {
  validateLoginInput(username, password);
  const cleanUsername = username.trim();

  // 1) Try repository (DB) user — shape: { _id/username/passwordHash/role }.
  const dbUser = await findUserByUsername(cleanUsername).catch(() => null);
  if (dbUser && dbUser.passwordHash) {
    const parts = String(dbUser.passwordHash).split(':');
    if (parts.length === 2) {
      const [salt, expected] = parts;
      const actual = hashPassword(password, salt);
      if (crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) {
        const user = { id: String(dbUser._id || dbUser.username), username: dbUser.username, role: dbUser.role };
        const token = createSession(user);
        return { user: { username: user.username, role: user.role }, token };
      }
    }
    throw new ApiError(401, 'UNAUTHENTICATED', 'Invalid username or password.');
  }

  // 2) Foundation demo users (no feature collections required).
  const demo = buildDemoUsers().find((u) => u.username === cleanUsername);
  if (!demo) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Invalid username or password.');
  }
  const actual = hashPassword(password, demo.salt);
  if (!crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(demo.hash))) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Invalid username or password.');
  }
  const user = { id: demo.id, username: demo.username, role: demo.role };
  const token = createSession(user);
  return { user: { username: user.username, role: user.role }, token };
}

export async function logout(token) {
  destroySession(token);
  return {};
}
