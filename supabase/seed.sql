-- Demo data: 3 users, 2 projects, 15 tickets, 5 labels, a few comments.
-- Safe to run more than once. Apply to the linked project with:
--   yarn db:push --include-seed
--
-- Demo logins (password for all: demo-password-123):
--   ana@example.com, marko@example.com, lejla@example.com

-- Users -----------------------------------------------------------------------
-- public.profiles rows are created by the on_auth_user_created trigger.
-- Token columns must be '' (not null) or sign-in fails.

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new
)
select
  '00000000-0000-0000-0000-000000000000',
  u.id::uuid,
  'authenticated',
  'authenticated',
  u.email,
  extensions.crypt('demo-password-123', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  jsonb_build_object('full_name', u.full_name),
  now(),
  now(),
  '',
  '',
  '',
  ''
from (
  values
    ('11111111-1111-4111-8111-111111111111', 'ana@example.com', 'Ana Kovač'),
    ('22222222-2222-4222-8222-222222222222', 'marko@example.com', 'Marko Petrović'),
    ('33333333-3333-4333-8333-333333333333', 'lejla@example.com', 'Lejla Hadžić')
) as u (id, email, full_name)
on conflict do nothing;

insert into auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  now(),
  now(),
  now()
from auth.users u
where u.id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333'
)
on conflict do nothing;

-- Projects --------------------------------------------------------------------

insert into public.projects (id, name, key, description, created_by)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Frontend Tasks',
    'FT',
    'Web app: board, ticket details and auth screens.',
    '11111111-1111-4111-8111-111111111111'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'Mobile App',
    'MOB',
    'React Native client for iOS and Android.',
    '22222222-2222-4222-8222-222222222222'
  )
on conflict do nothing;

-- Labels ----------------------------------------------------------------------

insert into public.labels (name, color)
values
  ('bug', '#ef4444'),
  ('feature', '#3b82f6'),
  ('design', '#a855f7'),
  ('tech-debt', '#f59e0b'),
  ('docs', '#10b981')
on conflict do nothing;

-- Tickets ---------------------------------------------------------------------
-- Numbers (FT-1..FT-9, MOB-1..MOB-6) are assigned by the tickets_assign_number
-- trigger in insert order. Skipped entirely if the demo projects have tickets.

insert into public.tickets (project_id, title, description, status, priority, assignee_id, reporter_id)
select
  p.id,
  t.title,
  t.description,
  t.status::public.ticket_status,
  t.priority::public.ticket_priority,
  t.assignee_id::uuid,
  t.reporter_id::uuid
from (
  values
    (1, 'FT', 'Set up project board layout', 'Columns for each status with a sticky header.', 'done', 'high', '11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111'),
    (2, 'FT', 'Drag and drop tickets between columns', 'Use dnd-kit; persist the new status on drop.', 'in_progress', 'high', '22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111'),
    (3, 'FT', 'Ticket detail page', 'Title, description (markdown), status, priority, assignee.', 'in_review', 'medium', '33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111'),
    (4, 'FT', 'Login form shows no error on wrong password', 'The request fails with 400 but the form stays silent.', 'todo', 'urgent', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333'),
    (5, 'FT', 'Markdown preview in comments', null, 'todo', 'low', null, '22222222-2222-4222-8222-222222222222'),
    (6, 'FT', 'Filter tickets by label and assignee', 'Filters should be reflected in the URL.', 'todo', 'medium', '22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111'),
    (7, 'FT', 'Upload attachments on a ticket', 'Private bucket, download through signed URLs.', 'in_progress', 'medium', '33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222'),
    (8, 'FT', 'Replace starter README', null, 'todo', 'low', null, '33333333-3333-4333-8333-333333333333'),
    (9, 'FT', 'Dark mode colors fail contrast check', 'Muted text on the board is below AA.', 'in_review', 'medium', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333'),
    (10, 'MOB', 'Bootstrap Expo project', null, 'done', 'high', '22222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222'),
    (11, 'MOB', 'Sign in with email and password', 'Reuse the Supabase auth flow from the web app.', 'in_progress', 'high', '22222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222'),
    (12, 'MOB', 'Ticket list screen', 'Grouped by status, pull to refresh.', 'todo', 'medium', '33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222'),
    (13, 'MOB', 'App crashes when opening a ticket offline', 'Unhandled network error on the detail screen.', 'todo', 'urgent', null, '11111111-1111-4111-8111-111111111111'),
    (14, 'MOB', 'Push notifications for assigned tickets', null, 'todo', 'low', null, '33333333-3333-4333-8333-333333333333'),
    (15, 'MOB', 'App icon and splash screen', 'Waiting on final assets from design.', 'in_review', 'low', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222')
) as t (ord, project_key, title, description, status, priority, assignee_id, reporter_id)
join public.projects p on p.key = t.project_key
where not exists (
  select 1
  from public.tickets existing
  join public.projects ep on ep.id = existing.project_id
  where ep.key in ('FT', 'MOB')
)
order by t.ord;

-- Ticket labels ---------------------------------------------------------------

insert into public.ticket_labels (ticket_id, label_id)
select t.id, l.id
from (
  values
    ('FT', 1, 'feature'),
    ('FT', 2, 'feature'),
    ('FT', 3, 'feature'),
    ('FT', 3, 'design'),
    ('FT', 4, 'bug'),
    ('FT', 5, 'feature'),
    ('FT', 6, 'feature'),
    ('FT', 7, 'feature'),
    ('FT', 8, 'docs'),
    ('FT', 9, 'bug'),
    ('FT', 9, 'design'),
    ('MOB', 1, 'tech-debt'),
    ('MOB', 2, 'feature'),
    ('MOB', 3, 'feature'),
    ('MOB', 4, 'bug'),
    ('MOB', 5, 'feature'),
    ('MOB', 6, 'design')
) as tl (project_key, number, label_name)
join public.projects p on p.key = tl.project_key
join public.tickets t on t.project_id = p.id and t.number = tl.number
join public.labels l on l.name = tl.label_name
on conflict do nothing;

-- Comments --------------------------------------------------------------------

insert into public.comments (id, ticket_id, author_id, body)
select c.id::uuid, t.id, c.author_id::uuid, c.body
from (
  values
    ('cccccccc-0000-4000-8000-000000000001', 'FT', 2, '33333333-3333-4333-8333-333333333333', 'Dragging works, but the card jumps back for a moment before the status saves.'),
    ('cccccccc-0000-4000-8000-000000000002', 'FT', 2, '22222222-2222-4222-8222-222222222222', 'Known issue. I am adding an optimistic update so it stays in place.'),
    ('cccccccc-0000-4000-8000-000000000003', 'FT', 4, '11111111-1111-4111-8111-111111111111', 'Reproduced. The error from Supabase is never passed to the form state.'),
    ('cccccccc-0000-4000-8000-000000000004', 'FT', 9, '33333333-3333-4333-8333-333333333333', 'Updated the muted token. Can someone check it on a real ticket list?'),
    ('cccccccc-0000-4000-8000-000000000005', 'MOB', 4, '22222222-2222-4222-8222-222222222222', 'Stack trace points to the fetch in the detail screen. No offline fallback yet.'),
    ('cccccccc-0000-4000-8000-000000000006', 'MOB', 6, '11111111-1111-4111-8111-111111111111', 'Assets are in. Icon is done, splash screen still needs the dark variant.')
) as c (id, project_key, number, author_id, body)
join public.projects p on p.key = c.project_key
join public.tickets t on t.project_id = p.id and t.number = c.number
on conflict do nothing;
