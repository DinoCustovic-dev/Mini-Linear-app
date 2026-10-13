-- ML-02: functions and triggers

-- updated_at -----------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Column list keeps ticket_counter bumps from touching projects.updated_at.
create trigger projects_set_updated_at
  before update of name, key, description on public.projects
  for each row execute function public.set_updated_at();

create trigger tickets_set_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- Signup -> profile -----------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Per-project ticket numbers ----------------------------------------------------

-- The UPDATE takes a row lock on the project, so concurrent inserts into the
-- same project queue up and never receive the same number.
create function public.assign_ticket_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.projects
  set ticket_counter = ticket_counter + 1
  where id = new.project_id
  returning ticket_counter into new.number;

  if not found then
    raise exception 'project % does not exist', new.project_id
      using errcode = 'foreign_key_violation';
  end if;

  return new;
end;
$$;

create trigger tickets_assign_number
  before insert on public.tickets
  for each row execute function public.assign_ticket_number();

-- Ticket activity log -----------------------------------------------------------

create function public.log_ticket_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
begin
  if tg_op = 'INSERT' then
    insert into public.ticket_activity (ticket_id, actor_id, action)
    values (new.id, coalesce(v_actor, new.reporter_id), 'created');
    return new;
  end if;

  if new.title is distinct from old.title then
    insert into public.ticket_activity (ticket_id, actor_id, action, old_value, new_value)
    values (new.id, v_actor, 'title_changed', old.title, new.title);
  end if;

  -- Descriptions can be long, so only the fact of the change is recorded.
  if new.description is distinct from old.description then
    insert into public.ticket_activity (ticket_id, actor_id, action)
    values (new.id, v_actor, 'description_changed');
  end if;

  if new.status is distinct from old.status then
    insert into public.ticket_activity (ticket_id, actor_id, action, old_value, new_value)
    values (new.id, v_actor, 'status_changed', old.status::text, new.status::text);
  end if;

  if new.priority is distinct from old.priority then
    insert into public.ticket_activity (ticket_id, actor_id, action, old_value, new_value)
    values (new.id, v_actor, 'priority_changed', old.priority::text, new.priority::text);
  end if;

  if new.assignee_id is distinct from old.assignee_id then
    insert into public.ticket_activity (ticket_id, actor_id, action, old_value, new_value)
    values (new.id, v_actor, 'assignee_changed', old.assignee_id::text, new.assignee_id::text);
  end if;

  return new;
end;
$$;

create trigger tickets_log_activity
  after insert or update on public.tickets
  for each row execute function public.log_ticket_activity();

-- Trigger functions are never called directly; keep them off the Data API.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.assign_ticket_number() from public, anon, authenticated;
revoke execute on function public.log_ticket_activity() from public, anon, authenticated;
