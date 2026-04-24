# Project Looper Backend Migration

## Goal

Move Project Looper from a browser-only prototype to a real web app with:

- hosted auth
- a shared database
- deployable frontend
- a custom domain

## Current live stack target

- Frontend: current HTML/CSS/JS app served through Vite
- Backend/Auth/Database: Supabase
- Hosting: Vercel
- Domain: custom domain connected after first successful deployment

## Why this path fits the current MVP

- The app is already feature-complete enough to validate the concept.
- The current data model maps cleanly to relational tables.
- Supabase covers the two biggest missing pieces at once: authentication and Postgres.
- A static frontend can still talk to a hosted backend, so we do not need a full rewrite on day one.

## Current localStorage collections

- `users`
- `projects`
- `projectMembers`
- `joinRequests`
- `projectUpdates`
- `projectChats`

## Recommended production data model

- `profiles`
- `projects`
- `project_members`
- `join_requests`
- `project_updates`
- `project_chat_messages`

## Important architectural changes

### Auth

Do not store passwords in app data. Replace the current sign-up and login logic with Supabase Auth.

- `auth.users` handles authentication
- `public.profiles` stores display name, bio, skills, and interests

### Session state

Replace local `sessionUserId` persistence with the authenticated Supabase session.

### Reads/writes

Replace direct mutations of `appState.db` with async database calls:

- create profile
- update profile
- create project
- request to join project
- approve or decline join requests
- create project updates
- send chat messages

## Suggested rollout order

1. Set up Supabase project and run the SQL in `supabase/schema.sql`
2. Replace auth first
3. Replace profile reads/writes
4. Replace project creation and browse data
5. Replace join requests and approvals
6. Replace updates, chat, and community membership/feed reads
7. Remove localStorage fallback once the hosted flow is stable

## Domain and deployment flow

1. Deploy the frontend to a hosting provider
2. Verify the app works on the generated preview URL
3. Add your custom domain in the hosting dashboard
4. Point DNS from your registrar to the host
5. Add production environment variables
6. Test login, project creation, and profile updates on the real domain

## Environment variables

The frontend now expects:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Notes

- The current MVP is a strong prototype, but it is not yet multi-user in the real sense because data is stored in one browser.
- Moving to a hosted database is what makes friend reviews, shared accounts, and real collaboration possible.
- If we later want server-rendering, SEO, or more polished routing, we can migrate the frontend to Next.js after the backend is live.
