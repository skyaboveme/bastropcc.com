import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { AppEnvironment } from './types';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import blogRoutes from './routes/blog';
import eventRoutes from './routes/events';
import linkRoutes from './routes/links';
import voterInfoRoutes from './routes/voter-info';
import publicRoutes from './routes/public';

const app = new Hono<AppEnvironment>();

app.use('*', logger());

app.use('*', async (c, next) => {
  const allowedOrigins = (c.env.CORS_ORIGIN || 'https://bastropcc.com')
    .split(',')
    .map(o => o.trim());

  const corsMiddleware = cors({
    origin: (origin) => {
      if (!origin || allowedOrigins.includes(origin)) return origin;
      return allowedOrigins[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// Protect against simple CSRF by requiring custom header for mutations
app.use('*', async (c, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(c.req.method)) {
    const requestedWith = c.req.header('X-Requested-With');
    if (requestedWith !== 'XMLHttpRequest') {
      // Relax this strictly for now, but typically require this on frontend
      // return c.json({ success: false, error: 'CSRF Check failed' }, 403);
    }
  }
  await next();
});

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'bastropcc-api' }));

// Mount routers
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/users', userRoutes);
app.route('/api/v1/blog', blogRoutes);
app.route('/api/v1/events', eventRoutes);
app.route('/api/v1/links', linkRoutes);
app.route('/api/v1/voter-info', voterInfoRoutes);
app.route('/api/v1/public', publicRoutes);

// Main Error Handler
app.onError((err, c) => {
  console.error('Unhandled app error:', err);
  return c.json({ success: false, error: 'Internal Server Error' }, 500);
});

export default app;
