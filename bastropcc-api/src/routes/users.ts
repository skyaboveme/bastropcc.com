import { Hono } from 'hono';
import * as bcrypt from 'bcryptjs';
import type { AppEnvironment } from '../types';
import { authMiddleware, adminOnlyMiddleware } from '../middleware/auth';
import { logActivity } from './auth';

const router = new Hono<AppEnvironment>();

router.use('*', authMiddleware, adminOnlyMiddleware);

function generateTempPassword() {
  const adjs = ['swift', 'brave', 'calm', 'bright', 'sharp', 'proud'];
  const nouns = ['eagle', 'bear', 'wolf', 'lion', 'hawk', 'fox'];
  const adj = adjs[Math.floor(Math.random() * adjs.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}-${noun}-${num}`;
}

router.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, email, name, role, is_active, created_at, last_login FROM users ORDER BY created_at DESC'
  ).all();
  return c.json({ success: true, data: results });
});

router.post('/', async (c) => {
  const user = c.get('user');
  const { email, name, role } = await c.req.json();

  if (!email || !name || !['admin', 'editor'].includes(role)) {
    return c.json({ success: false, error: 'Invalid input', code: 'BAD_REQUEST' }, 400);
  }

  const tempPassword = generateTempPassword();
  const hash = await bcrypt.hash(tempPassword, 12);

  try {
    await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
    ).bind(email, hash, name, role).run();

    await logActivity(c, user.id, user.email, 'CREATE_USER', 'user', email, `Created user ${email} with role ${role}`);

    return c.json({ 
      success: true, 
      message: 'User created', 
      tempPassword 
    });
  } catch (e: any) {
    if (e.message.includes('UNIQUE constraint failed')) {
      return c.json({ success: false, error: 'Email already exists', code: 'CONFLICT' }, 409);
    }
    return c.json({ success: false, error: 'Server error', code: 'SERVER_ERROR' }, 500);
  }
});

router.put('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const { name, role, is_active } = await c.req.json();

  if (id === user.id && role !== 'admin') {
    return c.json({ success: false, error: 'Cannot demote yourself', code: 'FORBIDDEN' }, 403);
  }

  await c.env.DB.prepare(
    'UPDATE users SET name = ?, role = ?, is_active = ? WHERE id = ?'
  ).bind(name, role, is_active, id).run();

  await logActivity(c, user.id, user.email, 'UPDATE_USER', 'user', id, `Updated user ${id}`);

  return c.json({ success: true, message: 'User updated' });
});

router.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (id === user.id) {
    return c.json({ success: false, error: 'Cannot deactivate yourself', code: 'FORBIDDEN' }, 403);
  }

  await c.env.DB.prepare(
    'UPDATE users SET is_active = 0 WHERE id = ?'
  ).bind(id).run();

  // Expire sessions
  await c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id).run();

  await logActivity(c, user.id, user.email, 'DEACTIVATE_USER', 'user', id, `Deactivated user ${id}`);

  return c.json({ success: true, message: 'User deactivated' });
});

router.post('/:id/reset-password', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  
  const tempPassword = generateTempPassword();
  const hash = await bcrypt.hash(tempPassword, 12);

  await c.env.DB.prepare(
    'UPDATE users SET password_hash = ? WHERE id = ?'
  ).bind(hash, id).run();

  // Expire existing sessions to force relogin
  await c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id).run();

  await logActivity(c, user.id, user.email, 'RESET_USER_PASSWORD', 'user', id, `Reset password for user ${id}`);

  return c.json({ success: true, message: 'Password reset', tempPassword });
});

export default router;
