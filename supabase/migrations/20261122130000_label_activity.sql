-- ML-23: log label changes in the ticket activity feed
--
-- Created, title, description, status, priority and assignee changes were
-- already logged by tickets_log_activity (ML-02). Labels live in their own
-- table, so adding or removing one gets its own trigger.

alter table public.ticket_activity
  drop constraint ticket_activity_action_check;

alter table public.ticket_activity
  add constraint ticket_activity_action_check check (
    action in (
      'created',
      'title_changed',
      'description_changed',
      'status_changed',
      'priority_changed',
      'assignee_changed',
      'label_added',
      'label_removed'
    )
  );

create function public.log_ticket_label_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ticket_id uuid;
  v_label_id uuid;
  v_name text;
begin
  v_ticket_id := case when tg_op = 'INSERT' then new.ticket_id else old.ticket_id end;
  v_label_id := case when tg_op = 'INSERT' then new.label_id else old.label_id end;

  -- When a ticket or a label is deleted, the cascade removes its ticket_labels
  -- rows. There is nothing left to log against (or to name), so skip those.
  if not exists (select 1 from public.tickets where id = v_ticket_id) then
    return null;
  end if;

  select name into v_name from public.labels where id = v_label_id;
  if v_name is null then
    return null;
  end if;

  if tg_op = 'INSERT' then
    insert into public.ticket_activity (ticket_id, actor_id, action, new_value)
    values (v_ticket_id, auth.uid(), 'label_added', v_name);
  else
    insert into public.ticket_activity (ticket_id, actor_id, action, old_value)
    values (v_ticket_id, auth.uid(), 'label_removed', v_name);
  end if;

  return null;
end;
$$;

create trigger ticket_labels_log_activity
  after insert or delete on public.ticket_labels
  for each row execute function public.log_ticket_label_activity();

revoke execute on function public.log_ticket_label_activity() from public, anon, authenticated;
