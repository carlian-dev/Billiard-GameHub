import { ok } from '../utils/errors.js';
import { login, logout } from '../services/auth.service.js';
import { getSessionByToken } from '../middleware/authContext.js';

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer (.+)$/);
  return match ? match[1] : null;
}

export async function postLogin(req, res, next) {
  try {
    const { username, password } = req.body || {};
    const result = await login(username, password);
    res.status(200).json(ok(result));
  } catch (err) {
    next(err);
  }
}

export async function postLogout(req, res, next) {
  try {
    await logout(getBearerToken(req));
    res.status(200).json(ok({}));
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const token = getBearerToken(req);
    const session = token ? getSessionByToken(token) : null;
    if (!session) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      return;
    }
    res.status(200).json(ok({ username: session.username, role: session.role }));
  } catch (err) {
    next(err);
  }
}
