// Centralized error + envelope helpers (MVP 0 foundation).
// Success: { success: true, data: {} }
// Error: { success: false, error: { code, message }, details?[] }

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status || 500;
    this.code = code || 'INTERNAL_ERROR';
    this.details = details;
  }
}

export function ok(data) {
  return { success: true, data: data ?? {} };
}

export function fail(code, message, details) {
  const body = { success: false, error: { code, message } };
  if (details !== undefined) body.details = details;
  return body;
}
