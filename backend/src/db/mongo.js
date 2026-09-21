import { MongoClient } from 'mongodb';

// MongoDB Atlas connection foundation (official driver only).
// No Mongoose / Prisma / ORM. No feature collections created in the project foundation.
let client = null;
let db = null;
let connected = false;

export function isDbConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export function isDbConnected() {
  return connected && db !== null;
}

export function getDb() {
  return db;
}

export async function connectDb() {
  if (!isDbConfigured()) {
    connected = false;
    return { connected: false, configured: false };
  }
  if (connected && db) return { connected: true, configured: true };
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(process.env.DB_NAME || 'gamehub');
  // Lightweight ping — does not create collections.
  await db.command({ ping: 1 });
  connected = true;
  return { connected: true, configured: true };
}

export async function checkDb() {
  if (!isDbConfigured()) return { configured: false, connected: false };
  try {
    if (!connected || !db) await connectDb();
    await db.command({ ping: 1 });
    return { configured: true, connected: true };
  } catch {
    return { configured: true, connected: false };
  }
}
