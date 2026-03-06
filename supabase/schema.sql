-- ============================================
-- ALAY ART Hotel — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  avatar_url text,
  role text check (role in ('guest', 'admin')) default 'guest',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. AUTO-CREATE PROFILE TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null)
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. ROOMS TABLE
create table if not exists public.rooms (
  id serial primary key,
  type text check (type in ('standard', 'deluxe', 'family', 'suite')) not null,
  name_ru text not null,
  name_en text not null,
  name_kg text not null,
  description_ru text,
  description_en text,
  description_kg text,
  price_kgs integer not null,
  capacity integer default 2,
  image_url text,
  amenities jsonb default '[]',
  badge text,
  badge_type text check (badge_type in ('popular', 'vip')),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4. SEED ROOMS (only if table is empty)
insert into public.rooms (type, name_ru, name_en, name_kg, description_ru, description_en, description_kg, price_kgs, capacity, badge, badge_type, image_url)
select * from (values
  ('standard'::text, 'Стандарт', 'Standard', 'Стандарт',
   'Уютный номер с этно-декором, всем необходимым для комфортного проживания.',
   'Cozy room with ethno decor and everything needed for comfortable stay.',
   'Этно-декор менен ыңгайлуу бөлмө.',
   3500, 2, 'Популярный', 'popular',
   'https://lh3.googleusercontent.com/d/1q3z2pxxllqb6mhLW4r_ImUyc3LTmRKZi'),
  ('deluxe'::text, 'Делюкс', 'Deluxe', 'Делюкс',
   'Просторный номер премиум-класса с панорамным видом и роскошной отделкой.',
   'Spacious premium room with panoramic views and luxurious finishes.',
   'Панорамалык көрүнүшү бар кең бөлмө.',
   6500, 2, 'VIP', 'vip',
   'https://lh3.googleusercontent.com/d/1rEbP9-tlr4FOmXmkJBz71ADc2m8kAr3w'),
  ('family'::text, 'Семейный', 'Family', 'Үй-бүлөлүк',
   'Идеальный номер для семейного отдыха с двумя зонами и детскими удобствами.',
   'Perfect room for family vacation with two zones and children amenities.',
   'Үй-бүлөлүк эс алуу үчүн идеалдуу бөлмө.',
   5000, 4, null, null,
   'https://lh3.googleusercontent.com/d/1g55aq5FEets7sv9aotVzJWp43OnfeBEp'),
  ('suite'::text, 'Люкс', 'Suite', 'Люкс',
   'Роскошный люкс с гостиной, спальней и потрясающим этническим интерьером.',
   'Luxurious suite with living room, bedroom and stunning ethnic interior.',
   'Мейманкана жана уктоо бөлмөсү бар люкс.',
   9500, 2, 'VIP SUITE', 'vip',
   'https://lh3.googleusercontent.com/d/1iYXmMtHFaf6gI87n932UnBZaCym_Nwy2')
) as new_rooms
where not exists (select 1 from public.rooms limit 1);

-- 5. BOOKINGS TABLE
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  room_id integer references public.rooms on delete restrict,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  check_in date not null,
  check_out date not null,
  guests_count integer default 1 check (guests_count >= 1),
  total_price_kgs integer,
  status text check (status in ('pending','confirmed','cancelled','completed')) default 'pending',
  notes text,
  created_at timestamptz default now(),
  constraint valid_dates check (check_out > check_in)
);

-- Add nights as computed column (if not exists)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'bookings' and column_name = 'nights'
  ) then
    alter table public.bookings add column nights integer generated always as (check_out - check_in) stored;
  end if;
end $$;

-- 6. ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Public profiles viewable" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Rooms are public" on public.rooms;
drop policy if exists "Users view own bookings" on public.bookings;
drop policy if exists "Users create bookings" on public.bookings;
drop policy if exists "Users cancel own bookings" on public.bookings;
drop policy if exists "Admins full access bookings" on public.bookings;
drop policy if exists "Admins manage rooms" on public.rooms;

-- Profiles policies
create policy "Public profiles viewable" on public.profiles
  for select using (true);

create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Rooms policies (public read)
create policy "Rooms are public" on public.rooms
  for select using (is_active = true);

create policy "Admins manage rooms" on public.rooms
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Bookings policies
create policy "Users view own bookings" on public.bookings
  for select using (auth.uid() = user_id);

create policy "Users create bookings" on public.bookings
  for insert with check (auth.uid() = user_id);

create policy "Users cancel own bookings" on public.bookings
  for update using (auth.uid() = user_id and status = 'pending');

create policy "Admins full access bookings" on public.bookings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 7. MAKE YOURSELF ADMIN (replace with your email)
-- UPDATE public.profiles SET role = 'admin' WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'your@email.com'
-- );

-- ============================================
-- SETUP COMPLETE!
-- Next steps:
-- 1. Enable Google OAuth in Supabase Auth > Providers
-- 2. Add redirect URL: https://lwewgetpbfamgcstylwp.supabase.co/auth/v1/callback
-- 3. Run the UPDATE above to make yourself admin
-- ============================================
