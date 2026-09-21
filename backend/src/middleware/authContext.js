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

// Attach req.user from Authorization: Bearer <token>. Never trust frontend role.
export function authContext(req, _res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer (.+)$/);
  if (!match) {
    req.user = null;
    return next();
  }
  const session = getSessionByToken(match[1]);
  req.user = session ? { id: session.userId, username: session.username, role: session.role } : null;
  return next();
}
