import express from 'express';
import routes from './routes/index.js';
import { authContext } from './middleware/authContext.js';
import { securityHeaders, cors } from './middleware/security.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.use(cors);
  app.use(express.json({ limit: '100kb' }));
  app.use(authContext);

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
