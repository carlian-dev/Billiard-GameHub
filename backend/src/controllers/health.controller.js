import { ok } from '../utils/errors.js';
import { checkDb, isDbConfigured } from '../db/mongo.js';

export async function getHealth(req, res, next) {
  try {
    const db = await checkDb();
    res.status(200).json(
      ok({
        status: 'ok',
        service: 'gamehub-backend',
        mvp: 'MVP 0 foundation',
        uptimeSeconds: Math.floor(process.uptime()),
        db: {
          configured: db.configured ?? isDbConfigured(),
          connected: db.connected,
        },
      })
    );
  } catch (err) {
    return next(err);
  }
}
