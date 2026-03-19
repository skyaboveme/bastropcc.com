import { Hono } from 'hono';
import type { AppEnvironment } from '../types';

// These routes do NOT use authMiddleware
const router = new Hono<AppEnvironment>();

// Public Blog Posts (Published Only)
router.get('/blog', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, title, slug, excerpt, content, author_name, featured_image_url, tags, published_at FROM blog_posts WHERE status = "published" ORDER BY published_at DESC'
  ).all();

  const formattedResults = results?.map((post: any) => {
    let parsedTags = [];
    try { parsedTags = JSON.parse(post.tags); } catch(e) {}
    return { ...post, tags: parsedTags };
  });

  return c.json({ success: true, data: formattedResults });
});

// Single Public Blog Post
router.get('/blog/:slug', async (c) => {
  const slug = c.req.param('slug');
  const { results } = await c.env.DB.prepare(
    'SELECT id, title, slug, excerpt, content, author_name, featured_image_url, tags, published_at FROM blog_posts WHERE status = "published" AND slug = ?'
  ).bind(slug).all();

  if (!results || results.length === 0) return c.json({ success: false, error: 'Not found' }, 404);

  const post = results[0] as any;
  try { post.tags = JSON.parse(post.tags); } catch(e) { post.tags = []; }

  return c.json({ success: true, data: post });
});

// Public Events (Active and Upcoming)
router.get('/events', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, title, description, start_datetime, end_datetime, location, location_url, event_url, category, is_featured 
     FROM events 
     WHERE status = 'active' AND start_datetime >= datetime("now") 
     ORDER BY start_datetime ASC`
  ).all();

  return c.json({ success: true, data: (results || []) });
});

// Public Links (Active Only)
router.get('/links', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, title, url, description, category, icon, opens_new_tab, sort_order FROM links WHERE is_active = 1 ORDER BY sort_order ASC'
  ).all();

  return c.json({ success: true, data: (results || []) });
});

// Public Voter Info (Published Only)
router.get('/voter-info', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, title, slug, content, category, sort_order, last_verified, external_source_url FROM voter_info WHERE status = "published" ORDER BY sort_order ASC'
  ).all();

  return c.json({ success: true, data: (results || []) });
});

export default router;
