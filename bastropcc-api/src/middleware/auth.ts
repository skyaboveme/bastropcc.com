import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import type { AppEnvironment } from '../types';

export const authMiddleware = async (c: Context<AppEnvironment>, next: Next) => {
  try {
    // 1. Extract JWT from Authorization header or httpOnly cookie
    let token = '';
    const authHeader = c.req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = getCookie(c, 'session_token') || '';
    }

    if (!token) {
      return c.json({ success: false, error: 'Unauthorized', code: 'NO_TOKEN' }, 401);
    }

    // 2. Verify against JWT_SECRET
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
    if (!payload || !payload.sub) {
      return c.json({ success: false, error: 'Invalid token', code: 'INVALID_TOKEN' }, 401);
    }

    // 3. Check KV Session
    const sessionExists = await c.env.SESSIONS.get(token);
    if (!sessionExists) {
      return c.json({ success: false, error: 'Session expired', code: 'SESSION_EXPIRED' }, 401);
    }

    // 4. Check user is still active in DB
    const userId = payload.sub as string;
    const { results } = await c.env.DB.prepare(
      'SELECT id, email, name, role, is_active FROM users WHERE id = ?'
    ).bind(userId).all();

    if (!results || results.length === 0) {
      return c.json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' }, 401);
    }

    const dbUser = results[0] as unknown as any;
    
    if (dbUser.is_active === 0) {
      return c.json({ success: false, error: 'Account deactivated', code: 'ACCOUNT_DEACTIVATED' }, 403);
    }

    // 5. Attach user to context
    c.set('user', {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as 'admin' | 'editor',
      is_active: dbUser.is_active
    });

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ success: false, error: 'Authentication failed', code: 'AUTH_FAILED' }, 401);
  }
};

export const adminOnlyMiddleware = async (c: Context<AppEnvironment>, next: Next) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ success: false, error: 'Admin access required', code: 'FORBIDDEN' }, 403);
  }
  await next();
};

export const rateLimitMiddleware = async (c: Context<AppEnvironment>, next: Next) => {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  const key = `rate_limit_login_${ip}`;
  
  const attemptsStr = await c.env.SESSIONS.get(key);
  const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

  if (attempts >= 5) {
    return c.json({ success: false, error: 'Too many login attempts. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' }, 429);
  }

  // We log the attempt in the actual login handler if it fails, or clear it if it succeeds.
  // We pass the key downstream to the handler.
  c.set('rateLimitKey' as any, key);
  c.set('rateLimitAttempts' as any, attempts);

  await next();
};
