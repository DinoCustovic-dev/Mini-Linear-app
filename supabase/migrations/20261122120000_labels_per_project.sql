-- ML-15: labels belong to a project
--
-- In ML-02 labels were global (unique by name). The labels ticket says they
-- are per project, so every label now has a project_id and names are unique
-- inside a project. Existing labels are copied once for every project whose
-- tickets use them, and their ticket_labels rows are moved to the copies.
-- Global labels that no ticket uses are dropped.

alter table public.labels
  add column project_id uuid references public.projects (id) on delete cascade;

alter table public.labels drop constraint labels_name_key;

-- 1. One copy of each used label for every project that uses it.
insert into public.labels (name, color, project_id)
select distinct l.name, l.color, t.project_id
from public.labels l
join public.ticket_labels tl on tl.label_id = l.id
join public.tickets t on t.id = tl.ticket_id
where l.project_id is null;

-- 2. Point every ticket at the copy that belongs to its own project.
update public.ticket_labels tl
set label_id = scoped.id
from public.tickets t,
     public.labels global_label,
     public.labels scoped
where tl.ticket_id = t.id
  and global_label.id = tl.label_id
  and global_label.project_id is null
  and scoped.project_id = t.project_id
  and scoped.name = global_label.name;

-- 3. The global labels are no longer referenced.
delete from public.labels where project_id is null;

alter table public.labels alter column project_id set not null;
alter table public.labels
  add constraint labels_project_name_key unique (project_id, name);

-- Clients choose the project when creating a label, but never change it later.
grant insert (project_id) on public.labels to authenticated;

-- A ticket may only get labels of its own project. The primary key of
-- ticket_labels already stops the same label from being added twice.
drop policy "Authenticated users can add ticket labels" on public.ticket_labels;

create policy "Authenticated users can add labels of the ticket's project"
  on public.ticket_labels for insert to authenticated
  with check (
    exists (
      select 1
      from public.tickets t
      join public.labels l on l.project_id = t.project_id
      where t.id = ticket_labels.ticket_id
        and l.id = ticket_labels.label_id
    )
  );
