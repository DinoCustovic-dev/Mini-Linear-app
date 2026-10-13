-- ML-02: enums, tables and indexes

create type public.ticket_status as enum ('todo', 'in_progress', 'in_review', 'done');
create type public.ticket_priority as enum ('low', 'medium', 'high', 'urgent');

-- One row per auth user, created by the on_auth_user_created trigger.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  key text not null,
  description text,
  -- Last ticket number handed out in this project; managed by assign_ticket_number().
  ticket_counter integer not null default 0,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_name_length check (char_length(btrim(name)) between 1 and 80),
  constraint projects_key_format check (key ~ '^[A-Z]{2,5}$'),
  constraint projects_key_key unique (key)
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  -- Per-project sequence (FT-1, FT-2...). The default is a placeholder that
  -- assign_ticket_number() always overwrites on insert.
  number integer not null default 0,
  title text not null,
  description text,
  status public.ticket_status not null default 'todo',
  priority public.ticket_priority not null default 'medium',
  assignee_id uuid references public.profiles (id) on delete set null,
  reporter_id uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickets_title_length check (char_length(btrim(title)) between 1 and 200),
  constraint tickets_number_positive check (number > 0),
  constraint tickets_project_number_key unique (project_id, number)
);

create index tickets_project_status_idx on public.tickets (project_id, status);
create index tickets_assignee_idx on public.tickets (assignee_id);
create index tickets_reporter_idx on public.tickets (reporter_id);

create table public.labels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#6b7280',
  created_at timestamptz not null default now(),
  constraint labels_name_length check (char_length(btrim(name)) between 1 and 40),
  constraint labels_name_key unique (name),
  constraint labels_color_format check (color ~ '^#[0-9a-fA-F]{6}$')
);

create table public.ticket_labels (
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  label_id uuid not null references public.labels (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (ticket_id, label_id)
);

create index ticket_labels_label_idx on public.ticket_labels (label_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_body_not_empty check (char_length(btrim(body)) > 0)
);

create index comments_ticket_created_idx on public.comments (ticket_id, created_at);
create index comments_author_idx on public.comments (author_id);

-- Metadata for files stored in the private "attachments" storage bucket.
create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  uploaded_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  constraint attachments_storage_path_key unique (storage_path),
  constraint attachments_size_non_negative check (size_bytes is null or size_bytes >= 0)
);

create index attachments_ticket_idx on public.attachments (ticket_id);
create index attachments_uploaded_by_idx on public.attachments (uploaded_by);

-- Append-only history, written by log_ticket_activity().
create table public.ticket_activity (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  old_value text,
  new_value text,
  created_at timestamptz not null default now(),
  constraint ticket_activity_action_check check (
    action in (
      'created',
      'title_changed',
      'description_changed',
      'status_changed',
      'priority_changed',
      'assignee_changed'
    )
  )
);

create index ticket_activity_ticket_created_idx on public.ticket_activity (ticket_id, created_at);
create index ticket_activity_actor_idx on public.ticket_activity (actor_id);
