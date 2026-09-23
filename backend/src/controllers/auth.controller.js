import { ok } from '../utils/errors.js';
import { login, logout } from '../services/auth.service.js';
import { getSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '../middleware/authContext.js';

function buildSessionCookie(token, { clear = false } = {}) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  if (clear) {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
  }
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
}

export async function postLogin(req, res, next) {
  try {
    const { username, password } = req.body || {};
    const result = await login(username, password);
    res.setHeader('Set-Cookie', buildSessionCookie(result.token));
    res.status(200).json(ok({ user: result.user }));
  } catch (err) {
    next(err);
  }
}

export async function postLogout(req, res, next) {
  try {
    await logout(getSessionToken(req));
    res.setHeader('Set-Cookie', buildSessionCookie('', { clear: true }));
    res.status(200).json(ok({}));
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      return;
    }
    res.status(200).json(ok({ user: { id: req.user.id, username: req.user.username, displayName: req.user.displayName, role: req.user.role } }));
  } catch (err) {
    next(err);
  }
}
