import crypto from 'node:crypto';
import { findAuthSessionByTokenHash, touchAuthSession } from '../repositories/authSession.repository.js';
import { findUserById } from '../repositories/user.repository.js';

// Server-managed session + httpOnly cookie contract.
// Sessions persist in MongoDB `authSessions`; this middleware resolves the cookie token
// server-side and attaches the authenticated staff identity to the request.
// Cookie `gamehub_session` is the single source for the session token.
// No Authorization/Bearer support. Frontend never receives or manages tokens.
export const SESSION_COOKIE = 'gamehub_session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((part) => {
    const index = part.indexOf('=');
    if (index < 0) return;
    const key = part.slice(0, index).trim();
    const value = decodeURIComponent(part.slice(index + 1).trim());
    if (key) out[key] = value;
  });
  return out;
}

export function getSessionToken(req) {
  const cookies = parseCookies(req);
  return cookies[SESSION_COOKIE] || null;
}

// Attach req.user from the server-managed persisted session. Never trust frontend role.
export async function authContext(req, _res, next) {
  try {
    req.user = await resolveUser(req);
    return next();
  } catch (err) {
    return next(err);
  }
}

export async function resolveUser(req) {
  const token = getSessionToken(req);
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await findAuthSessionByTokenHash(tokenHash);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) return null;
  const user = await findUserById(session.userId);
  if (!user || user.status !== 'ACTIVE') return null;

  touchAuthSession(tokenHash).catch(() => {});
  return {
    id: String(user._id),
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
}