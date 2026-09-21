import { fail } from '../utils/errors.js';

// Centralized error handler — must not leak stack traces, DB internals, or secrets.
export function errorHandler(err, req, res, _next) {
  const status = err && err.status ? err.status : 500;
  const code = err && err.code ? err.code : 'INTERNAL_ERROR';
  const message = status === 500 ? 'Unexpected server error.' : err.message || 'Request failed.';
  const body = fail(code, message, err && err.details !== undefined ? err.details : undefined);
  res.status(status).json(body);
}

export function notFound(req, res) {
  res.status(404).json(fail('NOT_FOUND', 'Resource not found.'));
}
