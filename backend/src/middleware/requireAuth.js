import { ApiError } from '../utils/errors.js';

// Backend is the source of truth for roles. Frontend roles are never trusted;
// req.user is set server-side by authContext from the session store.
export function requireAuth(req, _res, next) {
  if (!req.user) {
    return next(new ApiError(401, 'UNAUTHENTICATED', 'Authentication required.'));
  }
  return next();
}

export function requireRole(...allowed) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'UNAUTHENTICATED', 'Authentication required.'));
    }
    if (!allowed.includes(req.user.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'Insufficient permissions.'));
    }
    return next();
  };
}
