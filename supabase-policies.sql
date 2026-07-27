-- Bucket adini kendi bucket isminle ayni tut.
-- Ornek bucket: wedding-media

insert into storage.buckets (id, name, public)
values ('wedding-media', 'wedding-media', false)
on conflict (id) do nothing;

create policy "Guests can upload wedding media"
on storage.objects
for insert
to anon
with check (bucket_id = 'wedding-media');
