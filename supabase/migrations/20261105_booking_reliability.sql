-- Run after 20261027_security.sql. Fails atomically if legacy active duplicates exist.
begin;
lock table public.bookings, public.rooms, public.profiles in share row exclusive mode;
-- Refuse to hide pre-existing overbooking. Resolve it manually before installation.
do $$ begin
 if exists (
   select 1 from public.bookings a join public.rooms r on r.id=a.room_id
   where a.status='confirmed' and a.check_out > (now() at time zone 'Asia/Bishkek')::date
   and (select count(*) from public.bookings b where b.room_id=a.room_id and b.status='confirmed'
        and b.check_in <= greatest(a.check_in,(now() at time zone 'Asia/Bishkek')::date)
        and b.check_out > greatest(a.check_in,(now() at time zone 'Asia/Bishkek')::date)) > r.inventory_count
 ) then raise exception 'LEGACY_INVENTORY_CONFLICT'; end if;
end $$;
alter table public.rooms add column if not exists booking_revision bigint not null default 0;
alter table public.profiles add column if not exists booking_revision bigint not null default 0;
alter table public.bookings add column if not exists request_key uuid;
create unique index if not exists bookings_request_key on public.bookings(user_id, request_key) where request_key is not null;
-- A second room for the same guest/stay must be arranged with the hotel, not a duplicate click.
create unique index if not exists bookings_active_stay on public.bookings(user_id, room_id, check_in, check_out)
 where status in ('pending', 'confirmed') and user_id is not null;

create or replace function public.hotel_available_units(p_room integer, p_in date, p_out date)
returns integer language sql stable security definer set search_path = '' as $$
 select greatest(0, r.inventory_count - coalesce((
   select max(occupied) from (
     select count(b.id)::integer occupied
     from generate_series(p_in::timestamp, (p_out - 1)::timestamp, interval '1 day') d
     left join public.bookings b on b.room_id = r.id and b.status = 'confirmed'
       and b.check_in <= d::date and b.check_out > d::date
     group by d
   ) nights
 ),0)) from public.rooms r where r.id = p_room and r.is_active;
$$;
revoke all on function public.hotel_available_units(integer,date,date) from public, anon, authenticated;

-- The row WRITE, not just a lock, also protects repeatable-read snapshots:
-- concurrent callers must see the latest inventory or fail with serialization_failure.
create or replace function public.validate_hotel_booking()
returns trigger language plpgsql security definer set search_path = '' as $$
declare r public.rooms; available integer; hotel_today date := (now() at time zone 'Asia/Bishkek')::date;
begin
  if tg_op = 'UPDATE' then
    if new.user_id is null and old.user_id is not null
      and (to_jsonb(new) - 'user_id' - 'nights') = (to_jsonb(old) - 'user_id' - 'nights') then return new; end if;
    if (to_jsonb(new) - 'status' - 'nights') is distinct from (to_jsonb(old) - 'status' - 'nights') then raise exception 'BOOKING_IMMUTABLE'; end if;
    if new.status is not distinct from old.status then return new; end if;
    if new.status is null or old.status in ('cancelled','completed') or new.status = 'pending' then raise exception 'INVALID_STATUS'; end if;
    if new.status = 'completed' and (old.status <> 'confirmed' or new.check_out > hotel_today) then raise exception 'INVALID_STATUS'; end if;
  end if;
  update public.rooms set booking_revision = booking_revision + 1 where id = new.room_id returning * into r;
  if not found then raise exception 'ROOM_UNAVAILABLE'; end if;
  if tg_op = 'INSERT' or new.status = 'confirmed' then
    if r.is_active is not true then raise exception 'ROOM_UNAVAILABLE'; end if;
    if new.check_in is null or new.check_out is null or new.check_in < hotel_today
      or new.check_out <= new.check_in or new.check_out - new.check_in > 90 then raise exception 'INVALID_DATES'; end if;
    if new.guests_count is null or new.guests_count < 1 or new.guests_count > r.capacity then raise exception 'INVALID_GUESTS'; end if;
    select public.hotel_available_units(new.room_id,new.check_in,new.check_out) into available;
    if coalesce(available,0) < 1 then raise exception 'ROOM_UNAVAILABLE'; end if;
  end if;
  if tg_op = 'INSERT' then
    if new.user_id is null or new.guest_name is null or length(trim(new.guest_name)) not between 2 and 120
      or new.guest_email is null or length(new.guest_email) > 254 or new.guest_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      or length(coalesce(new.guest_phone,'')) > 40 or length(coalesce(new.notes,'')) > 1000 then raise exception 'INVALID_CONTACT'; end if;
    new.status := 'pending';
    new.total_price_kgs := r.price_kgs * (new.check_out - new.check_in);
  end if;
  return new;
end $$;

create or replace function public.guard_hotel_inventory()
returns trigger language plpgsql security definer set search_path = '' as $$
declare peak integer; hotel_today date := (now() at time zone 'Asia/Bishkek')::date;
begin
  if new.inventory_count is null or new.inventory_count < 1 or new.capacity is null or new.capacity < 1
    or new.price_kgs is null or new.price_kgs < 1 or new.price_kgs > 1000000 then raise exception 'INVALID_ROOM'; end if;
  -- Peaks occur on check-in dates (or today for an ongoing stay).
  select coalesce(max(n),0) into peak from (
    select count(b.id) n from (
      select distinct greatest(check_in,hotel_today) d from public.bookings
       where room_id = old.id and status = 'confirmed' and check_out > hotel_today
    ) days join public.bookings b on b.room_id = old.id and b.status = 'confirmed' and b.check_in <= days.d and b.check_out > days.d
    group by days.d
  ) counts;
  if new.inventory_count < peak then raise exception 'INVENTORY_BELOW_BOOKINGS'; end if;
  if exists(select 1 from public.bookings where room_id=old.id and status='confirmed' and check_out>hotel_today and guests_count>new.capacity) then raise exception 'CAPACITY_BELOW_BOOKINGS'; end if;
  return new;
end $$;
revoke all on function public.guard_hotel_inventory() from public;
drop trigger if exists guard_hotel_inventory on public.rooms;
create trigger guard_hotel_inventory before update of inventory_count, capacity, price_kgs on public.rooms
 for each row execute function public.guard_hotel_inventory();

-- Only this authenticated RPC can create client requests. It owns identity/price/status.
revoke insert on public.bookings from authenticated;
revoke insert(room_id,user_id,guest_name,guest_email,guest_phone,check_in,check_out,guests_count,notes) on public.bookings from authenticated;
create or replace function public.request_hotel_booking(
 p_request_key uuid, p_room_id integer, p_check_in date, p_check_out date, p_guests integer,
 p_name text, p_email text, p_phone text, p_notes text, p_expected_price integer
) returns public.bookings language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); existing public.bookings; result public.bookings; r public.rooms;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_request_key is null then raise exception 'INVALID_REQUEST'; end if;
  -- Serialize requests of the SAME user, even across categories, at every isolation level.
  update public.profiles set booking_revision = booking_revision + 1 where id=uid;
  if not found then raise exception 'PROFILE_UNAVAILABLE'; end if;
  select * into existing from public.bookings where user_id=uid and request_key=p_request_key;
  if found then
    if existing.room_id is distinct from p_room_id or existing.check_in is distinct from p_check_in
      or existing.check_out is distinct from p_check_out or existing.guests_count is distinct from p_guests
      or existing.guest_name is distinct from trim(p_name) or existing.guest_email is distinct from trim(p_email)
      or existing.guest_phone is distinct from nullif(trim(p_phone),'') or existing.notes is distinct from nullif(trim(p_notes),'')
    then raise exception 'REQUEST_KEY_REUSED'; end if;
    return existing;
  end if;
  if exists(select 1 from public.bookings where user_id=uid and room_id=p_room_id and check_in=p_check_in and check_out=p_check_out and status in ('pending','confirmed')) then raise exception 'DUPLICATE_BOOKING'; end if;
  if (select count(*) from public.bookings where user_id=uid and created_at>now()-interval '1 hour') >= 5 then raise exception 'REQUEST_LIMIT'; end if;
  -- Lock the quoted tariff until the insert trigger computes the total.
  select * into r from public.rooms where id=p_room_id for update;
  if not found or r.is_active is not true then raise exception 'ROOM_UNAVAILABLE'; end if;
  if p_expected_price is distinct from r.price_kgs then raise exception 'PRICE_CHANGED'; end if;
  insert into public.bookings(user_id,room_id,guest_name,guest_email,guest_phone,notes,check_in,check_out,guests_count,request_key)
   values(uid,p_room_id,trim(p_name),trim(p_email),nullif(trim(p_phone),''),nullif(trim(p_notes),''),p_check_in,p_check_out,p_guests,p_request_key)
   returning * into result;
  return result;
end $$;
revoke all on function public.request_hotel_booking(uuid,integer,date,date,integer,text,text,text,text,integer) from public, anon;
grant execute on function public.request_hotel_booking(uuid,integer,date,date,integer,text,text,text,text,integer) to authenticated;

-- Aggregate availability only: no guest names, dates of other stays, or booking IDs.
create or replace function public.check_hotel_availability(p_room_id integer, p_check_in date, p_check_out date)
returns integer language plpgsql stable security definer set search_path = '' as $$
begin
 if p_check_in is null or p_check_out is null or p_check_in < (now() at time zone 'Asia/Bishkek')::date
   or p_check_out <= p_check_in or p_check_out-p_check_in > 90 then raise exception 'INVALID_DATES'; end if;
 return coalesce(public.hotel_available_units(p_room_id,p_check_in,p_check_out),0);
end $$;
revoke all on function public.check_hotel_availability(integer,date,date) from public;
grant execute on function public.check_hotel_availability(integer,date,date) to anon, authenticated;
notify pgrst, 'reload schema';
commit;
