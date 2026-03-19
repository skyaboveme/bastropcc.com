import { Hono } from 'hono';
import type { AppEnvironment } from '../types';
import { authMiddleware, adminOnlyMiddleware } from '../middleware/auth';
import { logActivity } from './auth';

const router = new Hono<AppEnvironment>();

router.use('*', authMiddleware);

router.get('/', async (c) => {
  const status = c.req.query('status');
  let query = 'SELECT id, title, slug, status, author_name, published_at, created_at, updated_at FROM blog_posts';
  const params: any[] = [];

  if (status === 'draft' || status === 'published') {
    query += ' WHERE status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results });
});

router.get('/:id', async (c) => {
  const id = c.req.param('id');
  const { results } = await c.env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(id).all();
  
  if (!results || results.length === 0) {
    return c.json({ success: false, error: 'Not found', code: 'NOT_FOUND' }, 404);
  }
  
  const post = results[0] as any;
  if(typeof post.tags === 'string') {
    try { post.tags = JSON.parse(post.tags); } catch(e) {}
  }
  return c.json({ success: true, data: post });
});

router.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { title, slug, excerpt, content, status, featured_image_url, tags } = body;

  const validStatus = status === 'published' ? 'published' : 'draft';
  const publishedAt = validStatus === 'published' ? new Date().toISOString() : null;
  const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : '[]';

  try {
    const { results } = await c.env.DB.prepare(
      `INSERT INTO blog_posts (title, slug, excerpt, content, status, author_id, author_name, featured_image_url, tags, published_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
    ).bind(title, slug, excerpt || null, content, validStatus, user.id, user.name, featured_image_url || null, tagsStr, publishedAt).all();

    const newId = results && results[0] ? (results[0] as any).id : null;
    await logActivity(c, user.id, user.email, 'CREATE_BLOG', 'blog_posts', newId, `Created blog post ${title}`);

    return c.json({ success: true, data: { id: newId }, message: 'Post created' });
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
  const { title, slug, excerpt, content, status, featured_image_url, tags } = await c.req.json();

  // Author check or admin
  const { results } = await c.env.DB.prepare('SELECT author_id, status FROM blog_posts WHERE id = ?').bind(id).all();
  if (!results || results.length === 0) return c.json({ success: false, error: 'Not found', code: 'NOT_FOUND' }, 404);
  
  const post = results[0] as any;
  if (post.author_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, error: 'Permission denied', code: 'FORBIDDEN' }, 403);
  }

  const validStatus = status === 'published' ? 'published' : 'draft';
  let publishedAtQuery = '';
  const params: any[] = [title, slug, excerpt || null, content, validStatus, featured_image_url || null, JSON.stringify(tags || []), id];

  if (validStatus === 'published' && post.status === 'draft') {
    publishedAtQuery = ', published_at = datetime("now")';
  }

  try {
    await c.env.DB.prepare(
      `UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, content = ?, status = ?, featured_image_url = ?, tags = ?, updated_at = datetime("now")${publishedAtQuery} WHERE id = ?`
    ).bind(...params).run();

    await logActivity(c, user.id, user.email, 'UPDATE_BLOG', 'blog_posts', id, `Updated blog post ${title}`);
    return c.json({ success: true, message: 'Post updated' });
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

  await c.env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(id).run();
  await logActivity(c, user.id, user.email, 'DELETE_BLOG', 'blog_posts', id, `Deleted blog post ${id}`);

  return c.json({ success: true, message: 'Post deleted' });
});

router.post('/:id/publish', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await c.env.DB.prepare('UPDATE blog_posts SET status = "published", published_at = coalesce(published_at, datetime("now")), updated_at = datetime("now") WHERE id = ?').bind(id).run();
  await logActivity(c, user.id, user.email, 'PUBLISH_BLOG', 'blog_posts', id, `Published blog post ${id}`);
  return c.json({ success: true, message: 'Post published' });
});

router.post('/:id/unpublish', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await c.env.DB.prepare('UPDATE blog_posts SET status = "draft", updated_at = datetime("now") WHERE id = ?').bind(id).run();
  await logActivity(c, user.id, user.email, 'UNPUBLISH_BLOG', 'blog_posts', id, `Unpublished blog post ${id}`);
  return c.json({ success: true, message: 'Post unpublished' });
});

export default router;
