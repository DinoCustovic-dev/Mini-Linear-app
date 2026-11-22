-- ML-02: storage buckets and policies

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('attachments', 'attachments', false, 10485760, null),
  (
    'avatars',
    'avatars',
    true,
    2097152,
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- attachments (private) ---------------------------------------------------------
-- Any signed-in user can read and upload; only the uploader can replace or delete.
-- Files are served through signed URLs.

create policy "Authenticated users can read attachment files"
  on storage.objects for select to authenticated
  using (bucket_id = 'attachments');

create policy "Authenticated users can upload attachment files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'attachments');

create policy "Uploaders can update their attachment files"
  on storage.objects for update to authenticated
  using (bucket_id = 'attachments' and owner_id = (select auth.uid())::text)
  with check (bucket_id = 'attachments' and owner_id = (select auth.uid())::text);

create policy "Uploaders can delete their attachment files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'attachments' and owner_id = (select auth.uid())::text);

-- avatars (public) --------------------------------------------------------------
-- Public URLs work without a policy. Objects live under "{user_id}/..." and only
-- that user can write there. The select policy is needed for upsert.

create policy "Users can read their own avatar files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can upload their own avatar files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update their own avatar files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own avatar files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
