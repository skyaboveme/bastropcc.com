import { Hono } from 'hono';
import type { AppEnvironment } from '../types';
import { authMiddleware, adminOnlyMiddleware } from '../middleware/auth';
import { logActivity } from './auth';

const router = new Hono<AppEnvironment>();

router.use('*', authMiddleware);

router.get('/', async (c) => {
  const category = c.req.query('category');
  const isActive = c.req.query('is_active');
  
  let query = 'SELECT * FROM links';
  const conditions: string[] = [];
  const params: any[] = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (isActive === 'true') {
    conditions.push('is_active = 1');
  } else if (isActive === 'false') {
    conditions.push('is_active = 0');
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY sort_order ASC, created_at DESC';

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results });
});

router.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { title, url, description, category, icon, sort_order, is_active, opens_new_tab } = body;

  const { results } = await c.env.DB.prepare(
    `INSERT INTO links (title, url, description, category, icon, sort_order, is_active, opens_new_tab, created_by) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
  ).bind(title, url, description || null, category || 'general', icon || null, sort_order || 0, is_active === false ? 0 : 1, opens_new_tab === false ? 0 : 1, user.id).all();

  const newId = results && results[0] ? (results[0] as any).id : null;
  await logActivity(c, user.id, user.email, 'CREATE_LINK', 'links', newId, `Created link ${title}`);

  return c.json({ success: true, data: { id: newId }, message: 'Link created' });
});

router.put('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  const { title, url, description, category, icon, sort_order, is_active, opens_new_tab } = body;

  await c.env.DB.prepare(
    `UPDATE links SET title = ?, url = ?, description = ?, category = ?, icon = ?, sort_order = ?, is_active = ?, opens_new_tab = ?, updated_at = datetime("now") WHERE id = ?`
  ).bind(title, url, description || null, category || 'general', icon || null, sort_order || 0, is_active === false ? 0 : 1, opens_new_tab === false ? 0 : 1, id).run();

  await logActivity(c, user.id, user.email, 'UPDATE_LINK', 'links', id, `Updated link ${title}`);
  return c.json({ success: true, message: 'Link updated' });
});

router.delete('/:id', adminOnlyMiddleware, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  await c.env.DB.prepare('DELETE FROM links WHERE id = ?').bind(id).run();
  await logActivity(c, user.id, user.email, 'DELETE_LINK', 'links', id, `Deleted link ${id}`);

  return c.json({ success: true, message: 'Link deleted' });
});

router.post('/reorder', async (c) => {
  const user = c.get('user');
  const { updates } = await c.req.json(); // Expected: [{ id: 'link_id', sort_order: 1 }, ...]

  if (!Array.isArray(updates)) return c.json({ success: false, error: 'Invalid input' }, 400);

  // Use a batch transaction for efficiency
  const statements = updates.map(update => 
    c.env.DB.prepare('UPDATE links SET sort_order = ? WHERE id = ?').bind(update.sort_order, update.id)
  );

  await c.env.DB.batch(statements);
  await logActivity(c, user.id, user.email, 'REORDER_LINKS', 'links', null, `Reordered ${updates.length} links`);

  return c.json({ success: true, message: 'Links reordered' });
});

export default router;
