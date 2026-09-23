import { ApiError } from '../utils/errors.js';
import { hashPassword } from '../utils/password.js';
import { ObjectId } from 'mongodb';
import {
  createUser,
  findUserByUsername,
  findCashiers,
  findUserById,
  updateUserById,
} from '../repositories/user.repository.js';
import { destroyAuthSessionsByUserId } from '../repositories/authSession.repository.js';

const ROLE_CASHIER = 'CASHIER';
const STATUS_ACTIVE = 'ACTIVE';

export function toPublicUser(user) {
  if (!user) return null;
  return {
    id: String(user._id),
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function validateCreateCashierInput({ username, password, displayName }) {
  const details = [];

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    details.push({ field: 'username', message: 'Username must be at least 3 characters.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    details.push({ field: 'password', message: 'Password must be at least 6 characters.' });
  }
  if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
    details.push({ field: 'displayName', message: 'Display name is required.' });
  }

  if (details.length > 0) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Invalid cashier input.', details);
  }
}

export async function createCashier({ username, password, displayName }) {
  validateCreateCashierInput({ username, password, displayName });
  const cleanUsername = username.trim();

  const existing = await findUserByUsername(cleanUsername);
  if (existing) {
    throw new ApiError(409, 'USERNAME_TAKEN', 'That username is already used.', [
      { field: 'username', message: 'Username is already taken.' },
    ]);
  }

  const user = await createUser({
    username: cleanUsername,
    displayName: displayName.trim(),
    role: ROLE_CASHIER,
    status: STATUS_ACTIVE,
    passwordHash: hashPassword(password),
  });

  return toPublicUser(user);
}

export async function listCashiers() {
  const users = await findCashiers();
  return users.map(toPublicUser);
}

const ALLOWED_STATUSES = ['ACTIVE', 'ARCHIVED'];

export async function updateCashier(id, patch = {}) {
  if (!id || !ObjectId.isValid(String(id))) {
    throw new ApiError(400, 'INVALID_ID', 'Invalid cashier id.');
  }
  const existing = await findUserById(String(id));
  if (!existing) {
    throw new ApiError(404, 'NOT_FOUND', 'Cashier account not found.');
  }
  if (existing.role !== 'CASHIER') {
    throw new ApiError(403, 'FORBIDDEN', 'Only cashier accounts can be modified here.');
  }

  const update = {};

  if (patch.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(patch.status)) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Invalid status.', [
        { field: 'status', message: 'Status must be ACTIVE or ARCHIVED.' },
      ]);
    }
    update.status = patch.status;
  }

  if (patch.password !== undefined) {
    if (typeof patch.password !== 'string' || patch.password.length < 6) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Invalid password.', [
        { field: 'password', message: 'Password must be at least 6 characters.' },
      ]);
    }
    update.passwordHash = hashPassword(patch.password);
  }

  if (patch.displayName !== undefined) {
    if (typeof patch.displayName !== 'string' || patch.displayName.trim().length === 0) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Invalid display name.', [
        { field: 'displayName', message: 'Display name is required.' },
      ]);
    }
    update.displayName = patch.displayName.trim();
  }

  if (patch.username !== undefined) {
    const clean = String(patch.username).trim();
    if (clean.length < 3) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Invalid username.', [
        { field: 'username', message: 'Username must be at least 3 characters.' },
      ]);
    }
    if (clean !== existing.username) {
      const taken = await findUserByUsername(clean);
      if (taken) {
        throw new ApiError(409, 'USERNAME_TAKEN', 'That username is already used.', [
          { field: 'username', message: 'Username is already taken.' },
        ]);
      }
      update.username = clean;
    }
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, 'INVALID_REQUEST', 'No updatable fields provided.');
  }

  const saved = await updateUserById(String(id), update);
  if (!saved) {
    throw new ApiError(404, 'NOT_FOUND', 'Cashier account not found.');
  }
  if (update.status === 'ARCHIVED') {
    await destroyAuthSessionsByUserId(saved._id).catch(() => {});
  }
  return toPublicUser(saved);
}