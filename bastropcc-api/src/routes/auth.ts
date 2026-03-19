import { Hono, Context } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import * as bcrypt from 'bcryptjs';
import type { AppEnvironment } from '../types';
import { authMiddleware, rateLimitMiddleware } from '../middleware/auth';

const router = new Hono<AppEnvironment>();

// 1. PUBLIC: Login
router.post('/login', rateLimitMiddleware, async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password required', code: 'BAD_REQUEST' }, 400);
    }

    const { results } = await c.env.DB.prepare(
      'SELECT id, email, password_hash, name, role, is_active FROM users WHERE email = ?'
    ).bind(email).all();

    if (!results || results.length === 0) {
      await incrementRateLimit(c);
      return c.json({ success: false, error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }, 401);
    }

    const user = results[0] as unknown as any;

    if (user.is_active === 0) {
      return c.json({ success: false, error: 'Account deactivated', code: 'ACCOUNT_DEACTIVATED' }, 403);
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      await incrementRateLimit(c);
      return c.json({ success: false, error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }, 401);
    }

    // Success - clear rate limit
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    await c.env.SESSIONS.delete(`rate_limit_login_${ip}`);

    // Generate JWT (Expire in 8 hrs)
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 8; 
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp
    };

    const token = await sign(payload, c.env.JWT_SECRET);

    // Store session in KV
    await c.env.SESSIONS.put(token, user.id, { expirationTtl: 60 * 60 * 8 });

    // Update last_login
    await c.env.DB.prepare(
      'UPDATE users SET last_login = datetime("now") WHERE id = ?'
    ).bind(user.id).run();

    // Log Activity
    await logActivity(c, user.id, user.email, 'LOGIN', 'auth', null, 'User logged in successfully');

    // Set cookie
    setCookie(c, 'session_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/',
      maxAge: 60 * 60 * 8 // 8 hours
    });

    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, error: 'Server error', code: 'INTERNAL_ERROR' }, 500);
  }
});

// 2. PROTECTED: Logout
router.post('/logout', authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.split(' ')[1] || getCookieSafely(c, 'session_token');
  const user = c.get('user');

  if (token) {
    await c.env.SESSIONS.delete(token);
  }

  await logActivity(c, user.id, user.email, 'LOGOUT', 'auth', null, 'User logged out');
  
  deleteCookie(c, 'session_token', { path: '/' });
  return c.json({ success: true, message: 'Logged out successfully' });
});

// 3. PROTECTED: Get Current Auth Profile
router.get('/me', authMiddleware, (c) => {
  const user = c.get('user');
  return c.json({ success: true, data: user });
});

// 4. PROTECTED: Change Password
router.post('/change-password', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword || newPassword.length < 10) {
      return c.json({ success: false, error: 'Invalid input parameters or insecure new password', code: 'BAD_REQUEST' }, 400);
    }

    const { results } = await c.env.DB.prepare(
      'SELECT password_hash FROM users WHERE id = ?'
    ).bind(user.id).all();

    if (!results || results.length === 0) {
      return c.json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' }, 404);
    }

    const dbUser = results[0] as unknown as any;
    const isValid = await bcrypt.compare(currentPassword, dbUser.password_hash);

    if (!isValid) {
      return c.json({ success: false, error: 'Incorrect current password', code: 'INVALID_CREDENTIALS' }, 401);
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await c.env.DB.prepare(
      'UPDATE users SET password_hash = ? WHERE id = ?'
    ).bind(newHash, user.id).run();

    await logActivity(c, user.id, user.email, 'CHANGE_PASSWORD', 'auth', null, 'User changed their own password');

    return c.json({ success: true, message: 'Password updated successfully' });

  } catch (e) {
    return c.json({ success: false, error: 'Failed to update password', code: 'SERVER_ERROR' }, 500);
  }
});

// Utilities
function getCookieSafely(c: any, name: string) {
  try {
    return c.req.cookie(name) || '';
  } catch(e) { return ''; }
}

async function incrementRateLimit(c: any) {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  const key = `rate_limit_login_${ip}`;
  const attempts = c.get('rateLimitAttempts') as number;
  await c.env.SESSIONS.put(key, (attempts + 1).toString(), { expirationTtl: 60 });
}

export async function logActivity(
  c: Context<AppEnvironment>, 
  userId: string, 
  email: string, 
  action: string, 
  resourceType: string, 
  resourceId: string | null = null, 
  details: string | null = null
) {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  await c.env.DB.prepare(
    'INSERT INTO audit_log (user_id, user_email, action, resource_type, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(userId, email, action, resourceType, resourceId, details, ip).run();
}

export default router;
