import { Hono } from 'hono';
import type { AppEnvironment } from '../types';
import { authMiddleware, adminOnlyMiddleware } from '../middleware/auth';
import { logActivity } from './auth';

const router = new Hono<AppEnvironment>();

router.use('*', authMiddleware);

router.get('/', async (c) => {
  const status = c.req.query('status');
  const upcoming = c.req.query('upcoming') === 'true';
  
  let query = 'SELECT * FROM events';
  const conditions: string[] = [];
  const params: any[] = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (upcoming) {
    conditions.push('start_datetime >= datetime("now")');
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY start_datetime ASC';

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results });
});

router.get('/:id', async (c) => {
  const id = c.req.param('id');
  const { results } = await c.env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).all();
  
  if (!results || results.length === 0) return c.json({ success: false, error: 'Not found' }, 404);
  return c.json({ success: true, data: results[0] });
});

router.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { title, description, start_datetime, end_datetime, location, location_url, event_url, category, status, is_featured } = body;

  const validStatus = ['active', 'cancelled', 'past'].includes(status) ? status : 'active';

  const { results } = await c.env.DB.prepare(
    `INSERT INTO events (title, description, start_datetime, end_datetime, location, location_url, event_url, category, status, is_featured, created_by) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
  ).bind(title, description || null, start_datetime, end_datetime || null, location || null, location_url || null, event_url || null, category || 'general', validStatus, is_featured ? 1 : 0, user.id).all();

  const newId = results && results[0] ? (results[0] as any).id : null;
  await logActivity(c, user.id, user.email, 'CREATE_EVENT', 'events', newId, `Created event ${title}`);

  return c.json({ success: true, data: { id: newId }, message: 'Event created' });
});

router.put('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  const { title, description, start_datetime, end_datetime, location, location_url, event_url, category, status, is_featured } = body;

  const validStatus = ['active', 'cancelled', 'past'].includes(status) ? status : 'active';

  await c.env.DB.prepare(
    `UPDATE events SET title = ?, description = ?, start_datetime = ?, end_datetime = ?, location = ?, location_url = ?, event_url = ?, category = ?, status = ?, is_featured = ?, updated_at = datetime("now") WHERE id = ?`
  ).bind(title, description || null, start_datetime, end_datetime || null, location || null, location_url || null, event_url || null, category || 'general', validStatus, is_featured ? 1 : 0, id).run();

  await logActivity(c, user.id, user.email, 'UPDATE_EVENT', 'events', id, `Updated event ${title}`);
  return c.json({ success: true, message: 'Event updated' });
});

router.delete('/:id', adminOnlyMiddleware, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  await c.env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
  await logActivity(c, user.id, user.email, 'DELETE_EVENT', 'events', id, `Deleted event ${id}`);

  return c.json({ success: true, message: 'Event deleted' });
});

export default router;
