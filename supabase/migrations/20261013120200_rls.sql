-- ML-02: grants and row level security
--
-- Model: every signed-in user can read everything. Projects, tickets and labels
-- are collaborative. Comments and attachments can only be changed or removed by
-- their author. Anonymous users have no access.

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tickets enable row level security;
alter table public.labels enable row level security;
alter table public.ticket_labels enable row level security;
alter table public.comments enable row level security;
alter table public.attachments enable row level security;
alter table public.ticket_activity enable row level security;

-- Grants ----------------------------------------------------------------------
-- Explicit so the result does not depend on the project's "auto expose" setting.
-- Writes are column-scoped: server-managed columns (number, ticket_counter,
-- reporter_id, author_id, uploaded_by, timestamps) cannot be set by clients.
-- A new client-writable column needs a grant here.

revoke all on table
  public.profiles,
  public.projects,
  public.tickets,
  public.labels,
  public.ticket_labels,
  public.comments,
  public.attachments,
  public.ticket_activity
from anon, authenticated;

grant all on table
  public.profiles,
  public.projects,
  public.tickets,
  public.labels,
  public.ticket_labels,
  public.comments,
  public.attachments,
  public.ticket_activity
to service_role;

grant select on table
  public.profiles,
  public.projects,
  public.tickets,
  public.labels,
  public.ticket_labels,
  public.comments,
  public.attachments,
  public.ticket_activity
to authenticated;

grant update (full_name, avatar_url) on public.profiles to authenticated;

grant insert (name, key, description) on public.projects to authenticated;
grant update (name, key, description) on public.projects to authenticated;
grant delete on public.projects to authenticated;

grant insert (project_id, title, description, status, priority, assignee_id)
  on public.tickets to authenticated;
grant update (title, description, status, priority, assignee_id)
  on public.tickets to authenticated;
grant delete on public.tickets to authenticated;

grant insert (name, color) on public.labels to authenticated;
grant update (name, color) on public.labels to authenticated;
grant delete on public.labels to authenticated;

grant insert (ticket_id, label_id) on public.ticket_labels to authenticated;
grant delete on public.ticket_labels to authenticated;

grant insert (ticket_id, body) on public.comments to authenticated;
grant update (body) on public.comments to authenticated;
grant delete on public.comments to authenticated;

grant insert (ticket_id, storage_path, file_name, mime_type, size_bytes)
  on public.attachments to authenticated;
grant update (file_name) on public.attachments to authenticated;
grant delete on public.attachments to authenticated;

-- profiles --------------------------------------------------------------------

create policy "Authenticated users can read profiles"
  on public.profiles for select to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- projects --------------------------------------------------------------------

create policy "Authenticated users can read projects"
  on public.projects for select to authenticated
  using (true);

create policy "Authenticated users can create projects"
  on public.projects for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy "Authenticated users can update projects"
  on public.projects for update to authenticated
  using (true)
  with check (true);

-- Deleting a project cascades to all of its tickets, so only its creator may.
create policy "Creators can delete their projects"
  on public.projects for delete to authenticated
  using (created_by = (select auth.uid()));

-- tickets ---------------------------------------------------------------------

create policy "Authenticated users can read tickets"
  on public.tickets for select to authenticated
  using (true);

create policy "Authenticated users can create tickets"
  on public.tickets for insert to authenticated
  with check (reporter_id = (select auth.uid()));

create policy "Authenticated users can update tickets"
  on public.tickets for update to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete tickets"
  on public.tickets for delete to authenticated
  using (true);

-- labels ----------------------------------------------------------------------

create policy "Authenticated users can read labels"
  on public.labels for select to authenticated
  using (true);

create policy "Authenticated users can create labels"
  on public.labels for insert to authenticated
  with check (true);

create policy "Authenticated users can update labels"
  on public.labels for update to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete labels"
  on public.labels for delete to authenticated
  using (true);

-- ticket_labels ---------------------------------------------------------------

create policy "Authenticated users can read ticket labels"
  on public.ticket_labels for select to authenticated
  using (true);

create policy "Authenticated users can add ticket labels"
  on public.ticket_labels for insert to authenticated
  with check (true);

create policy "Authenticated users can remove ticket labels"
  on public.ticket_labels for delete to authenticated
  using (true);

-- comments --------------------------------------------------------------------

create policy "Authenticated users can read comments"
  on public.comments for select to authenticated
  using (true);

create policy "Users can create their own comments"
  on public.comments for insert to authenticated
  with check (author_id = (select auth.uid()));

create policy "Authors can update their comments"
  on public.comments for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

create policy "Authors can delete their comments"
  on public.comments for delete to authenticated
  using (author_id = (select auth.uid()));

-- attachments -----------------------------------------------------------------

create policy "Authenticated users can read attachments"
  on public.attachments for select to authenticated
  using (true);

create policy "Users can create their own attachments"
  on public.attachments for insert to authenticated
  with check (uploaded_by = (select auth.uid()));

create policy "Uploaders can update their attachments"
  on public.attachments for update to authenticated
  using (uploaded_by = (select auth.uid()))
  with check (uploaded_by = (select auth.uid()));

create policy "Uploaders can delete their attachments"
  on public.attachments for delete to authenticated
  using (uploaded_by = (select auth.uid()));

-- ticket_activity (read-only for clients; written by log_ticket_activity) ------

create policy "Authenticated users can read ticket activity"
  on public.ticket_activity for select to authenticated
  using (true);
