import { getDb, isDbConnected } from '../db/mongo.js';

// Persistent server-managed authentication sessions (authSessions collection).
// Raw session tokens are never stored; only their SHA-256 hash is used as lookup key.
// Safe no-DB behavior: every method resolves to null/undefined when the DB is not connected.

function collection() {
  return getDb().collection('authSessions');
}

export async function createAuthSession({ tokenHash, userId, expiresAt, createdAt }) {
  if (!isDbConnected()) return null;
  const doc = {
    tokenHash,
    userId,
    createdAt,
    expiresAt,
    lastActivityAt: createdAt,
  };
  const result = await collection().insertOne(doc);
  return result.insertedId;
}

export async function findAuthSessionByTokenHash(tokenHash) {
  if (!isDbConnected()) return null;
  return collection().findOne({ tokenHash });
}

export async function destroyAuthSessionByTokenHash(tokenHash) {
  if (!isDbConnected()) return false;
  const result = await collection().deleteOne({ tokenHash });
  return result.deletedCount > 0;
}

export async function destroyAuthSessionsByUserId(userId) {
  if (!isDbConnected()) return false;
  const result = await collection().deleteMany({ userId });
  return result.deletedCount > 0;
}

export async function touchAuthSession(tokenHash) {
  if (!isDbConnected()) return false;
  const result = await collection().updateOne(
    { tokenHash },
    { $set: { lastActivityAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

export async function ensureAuthSessionIndexes() {
  if (!isDbConnected()) return;
  await collection().createIndex({ tokenHash: 1 }, { unique: true });
  await collection().createIndex({ userId: 1 });
  await collection().createIndex({ expiresAt: 1 });
}