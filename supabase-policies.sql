-- Nesrin & Emrah — Supabase kurulumu
-- Yeni projede Supabase Dashboard > SQL Editor icinde bu dosyanin tamamini calistir.
-- Guvenlik ilkesi: misafirler yalnizca EKLEME yapabilir; okuma/silme yalnizca
-- panelden (service role) mumkundur. Boylece yuklenen fotograflar ve katilim
-- yanitlari disariya acik olmaz.

-- ---------------------------------------------------------------
-- 1) FOTOGRAF / VIDEO DEPOSU
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('wedding-media', 'wedding-media', false)
on conflict (id) do nothing;

-- Misafir yalnizca bu bucket'a dosya birakabilir.
drop policy if exists "Guests can upload wedding media" on storage.objects;
create policy "Guests can upload wedding media"
on storage.objects
for insert
to anon
with check (bucket_id = 'wedding-media');

-- Bilerek select/update/delete politikasi tanimlanmadi:
-- misafirler baskalarinin dosyalarini listeleyemez, indiremez, silemez.

-- ---------------------------------------------------------------
-- 2) KATILIM (RSVP) TABLOSU
-- ---------------------------------------------------------------
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  attendance text not null,
  guest_count integer,
  constraint rsvps_full_name_len
    check (char_length(btrim(full_name)) between 2 and 100),
  constraint rsvps_attendance_valid
    check (attendance in ('Evet', 'Hayır')),
  -- Katilacaksa kisi sayisi zorunlu, katilmiyorsa bos olmali
  constraint rsvps_guest_count_valid check (
    (attendance = 'Evet' and guest_count between 1 and 10)
    or (attendance = 'Hayır' and guest_count is null)
  )
);

alter table public.rsvps enable row level security;

drop policy if exists "Guests can submit rsvp" on public.rsvps;
create policy "Guests can submit rsvp"
on public.rsvps
for insert
to anon
with check (true);

-- Okuma politikasi yok: yanitlari yalnizca siz panelden gorursunuz.

-- ---------------------------------------------------------------
-- 3) YUKLEME NOTLARI (kim, hangi dosyayi, hangi notla yukledi)
-- ---------------------------------------------------------------
create table if not exists public.guest_uploads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  guest_name text,
  message text,
  file_path text not null,
  constraint guest_uploads_name_len
    check (char_length(btrim(coalesce(guest_name, ''))) <= 80),
  constraint guest_uploads_message_len
    check (char_length(btrim(coalesce(message, ''))) <= 240)
);

alter table public.guest_uploads enable row level security;

drop policy if exists "Guests can record upload" on public.guest_uploads;
create policy "Guests can record upload"
on public.guest_uploads
for insert
to anon
with check (true);

-- ---------------------------------------------------------------
-- Yanitlari gormek icin (SQL Editor):
--   select created_at, full_name, attendance, guest_count
--     from public.rsvps order by created_at desc;
--   select created_at, guest_name, message, file_path
--     from public.guest_uploads order by created_at desc;
-- ---------------------------------------------------------------
