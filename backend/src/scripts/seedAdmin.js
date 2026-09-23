import crypto from 'node:crypto';
import { connectDb, isDbConfigured, closeDb } from '../db/mongo.js';
import { hashPassword } from '../utils/password.js';
import { createUser, findUserByUsername, ensureUserIndexes } from '../repositories/user.repository.js';
import { ensureAuthSessionIndexes } from '../repositories/authSession.repository.js';

// Controlled ADMIN bootstrap.
// Explicit operator/developer action only (run via `bun run --cwd backend seed:admin`).
// Never exposed through the public API. No plaintext passwords live in source:
// use SEED_ADMIN_PASSWORD to supply one, otherwise a random password is generated and printed once.

async function main() {
  if (!isDbConfigured()) {
    console.log('[seed-admin] MONGODB_URI not configured. Nothing seeded.');
    process.exit(1);
  }

  await connectDb();

  const username = (process.env.SEED_ADMIN_USERNAME || 'admin').trim();
  const displayName = (process.env.SEED_ADMIN_DISPLAY_NAME || 'System Administrator').trim();
  const providedPassword = process.env.SEED_ADMIN_PASSWORD;
  const password = providedPassword || crypto.randomBytes(12).toString('base64url');

  const existing = await findUserByUsername(username);
  if (existing) {
    console.log(`[seed-admin] ADMIN account "${username}" already exists; no changes made.`);
    await closeDb();
    process.exit(0);
  }

  const user = await createUser({
    username,
    displayName,
    role: 'ADMIN',
    status: 'ACTIVE',
    passwordHash: hashPassword(password),
  });

  await ensureUserIndexes();
  await ensureAuthSessionIndexes();

  console.log(`[seed-admin] ADMIN account created: ${user.username} (${user.role}).`);
  if (!providedPassword) {
    console.log(`[seed-admin] GENERATED PASSWORD (print once, store securely): ${password}`);
  } else {
    console.log('[seed-admin] Password taken from SEED_ADMIN_PASSWORD. It was not printed.');
  }

  await closeDb();
}

main().catch((err) => {
  console.error('[seed-admin] bootstrap failed:', err && err.message ? err.message : err);
  process.exit(1);
});