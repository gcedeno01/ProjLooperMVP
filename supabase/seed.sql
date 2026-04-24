-- Project Looper MVP demo seed
-- Run after schema.sql in the Supabase SQL editor.

create extension if not exists "pgcrypto";
create extension if not exists "pgjwt";

do $$
begin
  if not exists (select 1 from auth.users where email = 'avery@example.com') then
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      '11111111-1111-1111-1111-111111111111',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'avery@example.com',
      crypt('demo123', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Avery Chen"}',
      timezone('utc', now()),
      timezone('utc', now())
    );
  end if;

  if not exists (select 1 from auth.users where email = 'jordan@example.com') then
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      '22222222-2222-2222-2222-222222222222',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'jordan@example.com',
      crypt('demo123', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Jordan Rivera"}',
      timezone('utc', now()),
      timezone('utc', now())
    );
  end if;

  if not exists (select 1 from auth.users where email = 'mika@example.com') then
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      '33333333-3333-3333-3333-333333333333',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'mika@example.com',
      crypt('demo123', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Mika Park"}',
      timezone('utc', now()),
      timezone('utc', now())
    );
  end if;
end $$;

insert into public.profiles (id, email, name, bio, skills, interests)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'avery@example.com',
    'Avery Chen',
    'Product-minded builder who likes playful MVPs, lightweight tools, and portfolio projects with clear momentum.',
    array['React', 'UI Design', 'Product Strategy'],
    array['Creative tools', 'Collaboration', 'Music']
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'jordan@example.com',
    'Jordan Rivera',
    'Frontend engineer and illustrator looking for creative groups with a clear direction and room to experiment.',
    array['JavaScript', 'Illustration', 'Branding'],
    array['Portfolio work', 'Storytelling', 'Design systems']
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'mika@example.com',
    'Mika Park',
    'Motion-focused designer who likes turning shared ideas into visuals people can actually ship.',
    array['Motion Design', 'Art Direction', 'Creative Ops'],
    array['Side projects', 'Visual systems', 'Community builds']
  )
on conflict (id) do update
set
  email = excluded.email,
  name = excluded.name,
  bio = excluded.bio,
  skills = excluded.skills,
  interests = excluded.interests;

insert into public.projects (
  id,
  owner_id,
  title,
  description,
  skills_needed,
  category,
  category_label,
  category_icon,
  team_size_mode,
  team_size_value,
  duration_type,
  duration_value,
  repository_url,
  project_url,
  cover_image,
  status,
  created_at
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Open Studio Poster Set',
    'A collaborative poster series for a fictional gallery season, built for portfolio use and public sharing.',
    array['Illustration', 'Art Direction', 'Layout Design'],
    'design',
    'Design / Art',
    'design',
    'fixed',
    3,
    'fixed',
    '3 weeks',
    '',
    'https://example.com/open-studio-poster-set',
    '',
    'open',
    '2026-04-05T15:00:00Z'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Pixel Dungeon Build Tracker',
    'A tiny shared tool for tracking prototype milestones, bugs, and playtest notes for a pixel-art dungeon crawler.',
    array['Frontend', 'Game UI', 'JavaScript'],
    'dev',
    'Dev / Coding',
    'dev',
    'fixed',
    4,
    'open',
    null,
    'https://github.com/example/pixel-dungeon-build-tracker',
    '',
    '',
    'active',
    '2026-04-03T18:00:00Z'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '22222222-2222-2222-2222-222222222222',
    'Creator Stories Editorial Pack',
    'A shared editorial project collecting short interviews and polished profile writeups from independent creators.',
    array['Writing', 'Editing', 'Interviewing'],
    'writing',
    'Writing / Content',
    'writing',
    'fixed',
    4,
    'fixed',
    '4 weeks',
    '',
    'https://example.com/creator-stories-editorial-pack',
    '',
    'open',
    '2026-04-07T12:00:00Z'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    'Neighborhood Fix-It Guide',
    'A practical community-built guide for neighbors sharing repair tips, trusted resources, and small fixes that actually help.',
    array['Research', 'Writing', 'Community Outreach'],
    'general',
    'General',
    'general',
    'unlimited',
    null,
    'open',
    null,
    '',
    'https://example.com/neighborhood-fix-it-guide',
    '',
    'active',
    '2026-04-01T16:00:00Z'
  )
on conflict (id) do update
set
  owner_id = excluded.owner_id,
  title = excluded.title,
  description = excluded.description,
  skills_needed = excluded.skills_needed,
  category = excluded.category,
  category_label = excluded.category_label,
  category_icon = excluded.category_icon,
  team_size_mode = excluded.team_size_mode,
  team_size_value = excluded.team_size_value,
  duration_type = excluded.duration_type,
  duration_value = excluded.duration_value,
  repository_url = excluded.repository_url,
  project_url = excluded.project_url,
  cover_image = excluded.cover_image,
  status = excluded.status;

insert into public.project_members (project_id, user_id, role, status, joined_at)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Owner', 'accepted', '2026-04-05T15:00:00Z'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Member', 'accepted', '2026-04-06T10:00:00Z'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Owner', 'accepted', '2026-04-03T18:00:00Z'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'Member', 'accepted', '2026-04-04T11:00:00Z'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Owner', 'accepted', '2026-04-07T12:00:00Z'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Owner', 'accepted', '2026-04-01T16:00:00Z'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Member', 'accepted', '2026-04-02T09:00:00Z'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Member', 'accepted', '2026-04-02T13:00:00Z')
on conflict (project_id, user_id) do update
set
  role = excluded.role,
  status = excluded.status,
  joined_at = excluded.joined_at;

insert into public.project_updates (project_id, author_id, title, content, image_url, link_url, created_at)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'First poster direction locked',
    'We landed on a bold type direction and now need one more illustrator to help finish the set.',
    '',
    '',
    '2026-04-09T14:30:00Z'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Prototype tracker is live',
    'The first playable tracker view is in place. We can now log bugs, milestone notes, and playtest feedback in one spot.',
    '',
    'https://github.com/example/pixel-dungeon-build-tracker',
    '2026-04-10T18:15:00Z'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '22222222-2222-2222-2222-222222222222',
    'Interview list drafted',
    'We have the first round of creator interviews lined up and need help shaping the final edit pass.',
    '',
    '',
    '2026-04-11T12:45:00Z'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '33333333-3333-3333-3333-333333333333',
    'Resource outline posted',
    'Shared the first repair categories so new members can jump in anywhere without waiting on a narrow scope.',
    '',
    'https://example.com/neighborhood-fix-it-guide',
    '2026-04-12T09:20:00Z'
  );

insert into public.project_chat_messages (project_id, author_id, content, created_at)
values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Dropped the first tracker pass. If anyone wants to shape the issue labels, jump in.',
    '2026-04-10T18:25:00Z'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    'I can help with the playtest summary layout tomorrow.',
    '2026-04-10T19:05:00Z'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'Shared a first pass of the repair categories. Happy to tighten the language next.',
    '2026-04-12T09:40:00Z'
  );

insert into public.community_members (community_key, user_id, joined_at)
values
  ('design', '22222222-2222-2222-2222-222222222222', '2026-04-04T10:00:00Z'),
  ('design', '33333333-3333-3333-3333-333333333333', '2026-04-05T10:00:00Z'),
  ('dev', '11111111-1111-1111-1111-111111111111', '2026-04-03T10:00:00Z'),
  ('dev', '33333333-3333-3333-3333-333333333333', '2026-04-06T10:00:00Z'),
  ('writing', '22222222-2222-2222-2222-222222222222', '2026-04-07T10:00:00Z'),
  ('general', '11111111-1111-1111-1111-111111111111', '2026-04-02T10:00:00Z'),
  ('general', '22222222-2222-2222-2222-222222222222', '2026-04-02T12:00:00Z'),
  ('general', '33333333-3333-3333-3333-333333333333', '2026-04-02T14:00:00Z')
on conflict (community_key, user_id) do update
set joined_at = excluded.joined_at;

insert into public.community_posts (community_key, author_id, content, created_at)
values
  (
    'design',
    '22222222-2222-2222-2222-222222222222',
    'Shared a fresh layout direction for collaborative poster sets. Curious who else is exploring bold typography right now.',
    '2026-04-09T17:20:00Z'
  ),
  (
    'design',
    '33333333-3333-3333-3333-333333333333',
    'Dropped a few reference boards for motion-heavy branding work. Happy to swap inspiration if you are building in this space.',
    '2026-04-08T21:10:00Z'
  ),
  (
    'dev',
    '11111111-1111-1111-1111-111111111111',
    'Shared a quick pattern for organizing MVP state without making the app feel rigid. It has been helpful for fast iteration.',
    '2026-04-08T18:45:00Z'
  ),
  (
    'dev',
    '33333333-3333-3333-3333-333333333333',
    'Anyone else building tiny tools for game prototypes? Keeping the UI intentionally scrappy is working well so far.',
    '2026-04-09T22:00:00Z'
  ),
  (
    'writing',
    '22222222-2222-2222-2222-222222222222',
    'Shared a simple editorial checklist for collaborative writing projects. It keeps handoffs much smoother.',
    '2026-04-08T15:15:00Z'
  ),
  (
    'general',
    '11111111-1111-1111-1111-111111111111',
    'Community resource projects seem to gain momentum fastest when the scope starts small.',
    '2026-04-09T14:25:00Z'
  ),
  (
    'general',
    '33333333-3333-3333-3333-333333333333',
    'Shared a lightweight framework for turning a broad civic idea into a project people can actually join.',
    '2026-04-08T17:50:00Z'
  );
