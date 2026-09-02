import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './lib/env.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import partnersRoutes from './routes/partners.js';
import programRoutes from './routes/program.js';
import financeRoutes from './routes/finance.js';
import operationsRoutes from './routes/operations.js';
import settingsRoutes from './routes/settings.js';
import auditRoutes from './routes/audit.js';
import accessRoutes from './routes/access.js';
import { AppError } from './lib/errors.js';
import { startHeartbeatScheduler } from './services/heartbeatService.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/api', publicRoutes);
app.use('/api/admin/access', accessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/partners', partnersRoutes);
app.use('/api/admin/program', programRoutes);
app.use('/api/admin/finance', financeRoutes);
app.use('/api/admin/operations', operationsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/v1/admin/settings', settingsRoutes);
app.use('/api/admin/audit', auditRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  const error = err instanceof AppError ? err : new AppError('Server error.', 500);
  res.status(error.statusCode).json({
    message: error.message,
    statusCode: error.statusCode,
  });
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

const stopHeartbeatScheduler = await startHeartbeatScheduler();
const server = app.listen(env.PORT, () => {
  console.log(`Backend listening on http://localhost:${env.PORT}`);
});

const shutdown = () => {
  stopHeartbeatScheduler();
  server.close(() => process.exit(0));
};
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
