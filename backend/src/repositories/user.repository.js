import { ObjectId } from 'mongodb';
import { getDb, isDbConnected } from '../db/mongo.js';

// Repository layer owns all driver access. No business logic here.
export async function findUserByUsername(username) {
  if (!isDbConnected()) return null;
  const db = getDb();
  const user = await db.collection('users').findOne({ username });
  return user;
}

export async function findUserById(id) {
  if (!isDbConnected() || !ObjectId.isValid(id)) return null;
  const db = getDb();
  return db.collection('users').findOne({ _id: new ObjectId(id) });
}

export async function createUser({ username, displayName, role, status, passwordHash }) {
  if (!isDbConnected()) return null;
  const db = getDb();
  const now = new Date();
  const doc = {
    username,
    displayName,
    role,
    status,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection('users').insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function findCashiers() {
  if (!isDbConnected()) return [];
  const db = getDb();
  const cursor = db
    .collection('users')
    .find({ role: 'CASHIER' })
    .sort({ createdAt: -1 });
  return cursor.toArray();
}

export async function ensureUserIndexes() {
  if (!isDbConnected()) return;
  const db = getDb();
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
  await db.collection('users').createIndex({ role: 1, status: 1 });
}

export async function updateUserById(id, patch) {
  if (!isDbConnected() || !ObjectId.isValid(id)) return null;
  const db = getDb();
  const update = { ...patch, updatedAt: new Date() };
  const result = await db
    .collection('users')
    .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: update }, { returnDocument: 'after' });
  // mongodb v6 returns the document directly; older shape returns { value }.
  if (result && typeof result === 'object' && 'value' in result) return result.value;
  return result;
}