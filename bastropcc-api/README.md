# Bastrop County Conservative - CMS API

This is the Cloudflare Workers backend for the BastropCC CMS. It uses **Hono** for routing, **Cloudflare D1** for the SQLite database, and **Cloudflare KV** for session management.

## Project Structure
- `src/index.ts`: Main entry point mounting all routes.
- `src/routes/*`: Resource endpoints (Users, Blog, Events, Links, Voter Info, Public API).
- `src/middleware/auth.ts`: Authentication and JWT verification.
- `migrations/0001_initial.sql`: Initial D1 database schema.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate a JWT Secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. Create `.dev.vars` (DO NOT COMMIT):
   ```
   JWT_SECRET=your_generated_secret_here
   ```

4. Run Local Database Migrations:
   ```bash
   npx wrangler d1 migrations apply DB --local
   ```

5. Start the Dev Server:
   ```bash
   npm run dev
   ```

## Production Deployment

1. Create the D1 Database in Cloudflare:
   ```bash
   npx wrangler d1 create bastropcc-db
   ```
   *Update `wrangler.toml` with the output `database_id`.*

2. Create the KV Namespace in Cloudflare:
   ```bash
   npx wrangler kv:namespace create "SESSIONS"
   ```
   *Update `wrangler.toml` with the output `id`.*

3. Apply Migrations to Production:
   ```bash
   npx wrangler d1 migrations apply DB --remote
   ```

4. Set Production Secrets:
   ```bash
   npx wrangler secret put JWT_SECRET
   ```

5. Deploy the Worker:
   ```bash
   npm run deploy
   ```

## Initial Login
The database migration creates a default admin user:
- **Email:** `admin@bastropcc.com`
- **Password:** `ChangeMe2024!`
Please change this immediately upon first login.
