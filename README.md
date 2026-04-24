# Project Looper MVP

Project Looper is a lightweight MVP for finding collaborators, starting passion projects, joining active groups, and sharing progress as you build.

## Current stack

- Frontend: vanilla HTML, CSS, and JavaScript
- Build/dev server: Vite
- Auth + database: Supabase
- Hosting target: Vercel

## Live features wired to Supabase

- Sign up
- Log in
- Log out
- Current user session
- Profiles
- Projects
- Project memberships via `Join group`
- Project updates
- Project chat reads/writes
- Community memberships
- Community feed reads

The app still keeps a lightweight local fallback for parts of the old MVP that have not been migrated yet, but the main auth, project, chat, and community membership flows now expect Supabase when the environment variables are present.

## Environment variables

Create a local `.env` file from `.env.example` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Supabase setup

1. Create a new Supabase project.
2. Run [supabase/schema.sql](C:/Users/giann/OneDrive/Documents/CODEX/PROJECT%20LOOPER%20MVP/supabase/schema.sql).
3. Run [supabase/seed.sql](C:/Users/giann/OneDrive/Documents/CODEX/PROJECT%20LOOPER%20MVP/supabase/seed.sql).
4. Copy the project URL and anon key into your `.env`.

## Local development

1. `npm install`
2. `npm run dev`

## Production build

1. `npm run build`
2. Deploy the repo to Vercel
3. Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values in the Vercel project settings

The included [vercel.json](C:/Users/giann/OneDrive/Documents/CODEX/PROJECT%20LOOPER%20MVP/vercel.json) keeps client-side routes like `/home` and `/project/:id` working on refresh.

## Demo accounts from the seed SQL

- `avery@example.com` / `demo123`
- `jordan@example.com` / `demo123`
- `mika@example.com` / `demo123`

## Files to know

- App logic: [app.js](C:/Users/giann/OneDrive/Documents/CODEX/PROJECT%20LOOPER%20MVP/app.js)
- Styles: [styles.css](C:/Users/giann/OneDrive/Documents/CODEX/PROJECT%20LOOPER%20MVP/styles.css)
- Supabase schema: [supabase/schema.sql](C:/Users/giann/OneDrive/Documents/CODEX/PROJECT%20LOOPER%20MVP/supabase/schema.sql)
- Supabase seed data: [supabase/seed.sql](C:/Users/giann/OneDrive/Documents/CODEX/PROJECT%20LOOPER%20MVP/supabase/seed.sql)
- Migration notes: [docs/backend-migration.md](C:/Users/giann/OneDrive/Documents/CODEX/PROJECT%20LOOPER%20MVP/docs/backend-migration.md)
