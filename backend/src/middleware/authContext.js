import crypto from 'node:crypto';

// Foundation session store (in-memory for MVP 0).
// Production evolution would persist sessions; MVP 0 proves issuance/validation shape.
const sessions = new Map(); // tokenHash -> { userId, username, role, createdAt }

function getSecret() {
  return process.env.AUTH_SECRET || 'mvp0-dev-secret-change-me';
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

export function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  sessions.set(tokenHash, {
    userId: user.id,
    username: user.username,
    role: user.role,
    createdAt: new Date().toISOString(),
  });
  return token;
}

export function getSessionByToken(token) {
  if (!token) return null;
  return sessions.get(hashToken(token)) || null;
}

export function destroySession(token) {
  if (!token) return false;
  return sessions.delete(hashToken(token));
}

export function signPayload(value) {
  const secret = getSecret();
  return crypto.createHmac('sha256', secret).update(String(value)).digest('hex');
}

// Final contract: server-managed session + httpOnly cookie only.
// Cookie `gamehub_session` is the single source for the session token.
// No Authorization/Bearer support. Frontend never receives or manages tokens
// (the raw token is set as HttpOnly cookie on login and never returned in bodies).
export const SESSION_COOKIE = 'gamehub_session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

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

// Attach req.user from the server-managed session cookie. Never trust frontend role.
export function authContext(req, _res, next) {
  const token = getSessionToken(req);
  if (!token) {
    req.user = null;
    return next();
  }
  const session = getSessionByToken(token);
  req.user = session ? { id: session.userId, username: session.username, role: session.role } : null;
  return next();
}
