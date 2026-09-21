import { createApp } from './app.js';
import { connectDb, isDbConfigured } from './db/mongo.js';

const PORT = Number(process.env.PORT || 3000);

async function boot() {
  if (isDbConfigured()) {
    try {
      await connectDb();
      console.log('[gamehub] MongoDB connected (foundation check, no collections created).');
    } catch (err) {
      console.log('[gamehub] MongoDB not reachable; continuing without DB for foundation verification.');
    }
  } else {
    console.log('[gamehub] MONGODB_URI not configured; continuing without DB.');
  }

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`[gamehub] backend listening on http://localhost:${PORT}`);
  });
}

boot().catch((err) => {
  console.error('[gamehub] fatal boot error');
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
