# Bastrop County Conservatives (BCC) Website

Welcome to the new digital home of the Bastrop County Conservatives. This repository contains the source code for [bastropcc.com](https://bastropcc.com), built for high performance, accessibility, and conversion using Astro.

## Tech Stack
- **Framework:** Astro 4.x
- **Styling:** Tailwind CSS 3.x
- **Icons:** Astro Icon (`lucide` and `heroicons`)
- **Content:** Astro Content Collections (MDX & JSON)
- **Deployment target:** Cloudflare Pages (Static Output)

## Project Structure
- `src/components/`: Reusable UI elements (Buttons, Cards) and Layout pieces (Header, Footer, SEO).
- `src/layouts/`: Base HTML shells for the application.
- `src/pages/`: Astro routing. Each `.astro` file here becomes a route.
- `src/content/`: Collections for strictly typed data:
  - `/blog/`: Markdown (`.md`) files for blog posts.
  - `/events/`: JSON files for upcoming/past events.
  - `/videos/`: JSON files for YouTube embeds.
- `public/`: Static assets (images, standard `robots.txt`, logic `llms.txt`).

## Local Development Execution

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The site will be available at `http://localhost:4321`.

3. **Build for production:**
   ```bash
   npm run build
   ```
   This generates static files into the `dist/` directory.

4. **Preview the production build:**
   ```bash
   npm run preview
   ```

## Content Management (Adding Content)

### Adding an Event
Create a new JSON file inside `src/content/events/` (e.g., `august-meeting.json`):
```json
{
  "title": "August General Meeting",
  "date": "2025-08-10",
  "time": "6:00 PM - 8:00 PM",
  "location": "Casa Chapala, Bastrop",
  "description": "Join us for our monthly gathering.",
  "link": "/membership"
}
```

### Adding a Blog Post
Create a new Markdown file inside `src/content/blog/` (e.g., `my-post.md`):
```md
---
title: "Post Title"
description: "A short description."
pubDate: 2025-08-15
author: "Author Name"
---
Your markdown content here.
```

### Adding a Video
Create a new JSON file inside `src/content/videos/` (e.g., `new-video.json`):
```json
{
  "date": "2025-08-10",
  "speaker": "Speaker Name",
  "location": "Casa Chapala",
  "youtubeId": "XXXXXXXXX",
  "title": "Meeting with Speaker"
}
```

## Deployment to Cloudflare Pages

This site is configured for static output (`output: 'static'` in `astro.config.mjs`) and is heavily optimized for edge deployment.

**Automated Deployment (GitHub Integration):**
1. Connect this repository to a new Cloudflare Pages project.
2. Production Branch: `main`
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Root directory: `/` (or leave blank)

**Manual Deployment (Wrangler CLI):**
```bash
npm run build
npx wrangler pages deploy dist --project-name bastropcc
```
