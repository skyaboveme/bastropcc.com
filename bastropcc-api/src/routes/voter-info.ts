import { Hono } from 'hono';
import type { AppEnvironment } from '../types';
import { authMiddleware, adminOnlyMiddleware } from '../middleware/auth';
import { logActivity } from './auth';

const router = new Hono<AppEnvironment>();

router.use('*', authMiddleware);

router.get('/', async (c) => {
  const category = c.req.query('category');
  const status = c.req.query('status');
  
  let query = 'SELECT id, title, slug, category, status, sort_order, last_verified, created_at, updated_at FROM voter_info';
  const conditions: string[] = [];
  const params: any[] = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY sort_order ASC, created_at DESC';

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results });
});

router.get('/:id', async (c) => {
  const id = c.req.param('id');
  const { results } = await c.env.DB.prepare('SELECT * FROM voter_info WHERE id = ?').bind(id).all();
  
  if (!results || results.length === 0) return c.json({ success: false, error: 'Not found' }, 404);
  return c.json({ success: true, data: results[0] });
});

router.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { title, slug, content, category, status, sort_order, last_verified, external_source_url } = body;

  const validStatus = status === 'published' ? 'published' : 'draft';

  try {
    const { results } = await c.env.DB.prepare(
      `INSERT INTO voter_info (title, slug, content, category, status, sort_order, last_verified, external_source_url, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
    ).bind(title, slug, content, category || 'general', validStatus, sort_order || 0, last_verified || null, external_source_url || null, user.id).all();

    const newId = results && results[0] ? (results[0] as any).id : null;
    await logActivity(c, user.id, user.email, 'CREATE_VOTER_INFO', 'voter_info', newId, `Created voter info ${title}`);

    return c.json({ success: true, data: { id: newId }, message: 'Voter info created' });
  } catch (e: any) {
    if (e.message.includes('UNIQUE constraint failed')) {
      return c.json({ success: false, error: 'Slug must be unique', code: 'CONFLICT' }, 409);
    }
    return c.json({ success: false, error: 'Server error', code: 'SERVER_ERROR' }, 500);
  }
});

router.put('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  const { title, slug, content, category, status, sort_order, last_verified, external_source_url } = body;

  const validStatus = status === 'published' ? 'published' : 'draft';

  try {
    await c.env.DB.prepare(
      `UPDATE voter_info SET title = ?, slug = ?, content = ?, category = ?, status = ?, sort_order = ?, last_verified = ?, external_source_url = ?, updated_at = datetime("now") WHERE id = ?`
    ).bind(title, slug, content, category || 'general', validStatus, sort_order || 0, last_verified || null, external_source_url || null, id).run();

    await logActivity(c, user.id, user.email, 'UPDATE_VOTER_INFO', 'voter_info', id, `Updated voter info ${title}`);
    return c.json({ success: true, message: 'Voter info updated' });
  } catch (e: any) {
    if (e.message.includes('UNIQUE constraint failed')) {
      return c.json({ success: false, error: 'Slug must be unique', code: 'CONFLICT' }, 409);
    }
    return c.json({ success: false, error: 'Server error', code: 'SERVER_ERROR' }, 500);
  }
});

router.delete('/:id', adminOnlyMiddleware, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  await c.env.DB.prepare('DELETE FROM voter_info WHERE id = ?').bind(id).run();
  await logActivity(c, user.id, user.email, 'DELETE_VOTER_INFO', 'voter_info', id, `Deleted voter info ${id}`);

  return c.json({ success: true, message: 'Voter info deleted' });
});

export default router;
