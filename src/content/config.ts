import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default('BCC Contributor'),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
  }),
});

const eventsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    date: z.string(), // ISO date string YYYY-MM-DD
    time: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string(),
    description: z.string(),
    link: z.string().optional(),
    org: z.string().optional(),
    type: z.enum(['political', 'community']).optional(),
    featured: z.boolean().optional(),
  }),
});

const videosCollection = defineCollection({
  type: 'data',
  schema: z.object({
    date: z.string(),
    speaker: z.string(),
    location: z.string(),
    youtubeId: z.string(),
    title: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  events: eventsCollection,
  videos: videosCollection,
};
