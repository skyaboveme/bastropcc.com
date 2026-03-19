# Bastrop County Conservative - Admin UI

This is the React SPA frontend for the BastropCC Content Management System. It communicates exclusively with the `bastropcc-api` Cloudflare Worker.

## Tech Stack
- React 18
- React Router DOM v6
- Tailwind CSS
- Axios (HTTP Client)
- TipTap (Rich Text Editor)
- dnd-kit (Drag and Drop Sorting)
- Lucide React (Icons)

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Dev Server:
   ```bash
   npm run dev
   ```
   *Note: Ensure the API Worker (`bastropcc-api`) is running locally on port 8787 for local development requests to succeed.*

## Building and Deployment

This application is designed to be deployed to **Cloudflare Pages**. 

If deploying to a custom domain (e.g. `admin.bastropcc.com`):
1. Create a Cloudflare Pages project connected to this repository (or via direct upload).
2. Set the build command: `npm run build`
3. Set the output directory: `dist`
4. Define the Environment Variable `VITE_API_URL` pointing to your production Cloudflare Worker URL (e.g., `https://api.bastropcc.com/api/v1`).

### Integration with Existing Astro Site
If you prefer to host this under `https://bastropcc.pages.dev/admin`, you must configure Cloudflare routing or proxying to serve this bundled SPA at that path. Note that SPAs require rewrite rules to handle client-side routing (rewriting all `/admin/*` requests to `/admin/index.html`). A dedicated sub-domain (like `admin.bastropcc.com`) is generally cleaner for standalone React SPAs.
