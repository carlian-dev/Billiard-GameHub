import { getDb, isDbConnected } from '../db/mongo.js';

// Repository layer owns all driver access. No business logic here.
// Project foundation: lookup only; no collections created by this module.
export async function findUserByUsername(username) {
  if (!isDbConnected()) return null;
  const db = getDb();
  const user = await db.collection('users').findOne({ username });
  return user;
}
