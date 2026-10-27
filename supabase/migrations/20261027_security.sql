-- Apply AFTER schema.sql. Transactional and safe to re-run.
begin;
create or replace function public.is_hotel_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_hotel_admin() from public;
grant execute on function public.is_hotel_admin() to authenticated;
alter function public.handle_new_user() set search_path = public, pg_temp;

-- Remove all legacy policies, including any overly broad policies installed previously.
do $$ declare p record; begin
  for p in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in ('profiles','rooms','bookings') loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;
revoke all on public.profiles, public.rooms, public.bookings from anon, authenticated;
grant select on public.rooms to anon, authenticated;
grant select on public.profiles, public.bookings to authenticated;
grant update(full_name, phone, avatar_url) on public.profiles to authenticated;
grant insert(room_id, user_id, guest_name, guest_email, guest_phone, check_in, check_out, guests_count, notes) on public.bookings to authenticated;
grant update(status) on public.bookings to authenticated;
grant update on public.rooms to authenticated;

create policy profiles_read on public.profiles for select to authenticated
 using (id = auth.uid() or public.is_hotel_admin());
create policy profiles_edit on public.profiles for update to authenticated
 using (id = auth.uid()) with check (id = auth.uid());
create policy rooms_read on public.rooms for select to anon, authenticated using (is_active);
create policy rooms_admin on public.rooms for all to authenticated
 using (public.is_hotel_admin()) with check (public.is_hotel_admin());
create policy bookings_read on public.bookings for select to authenticated
 using (user_id = auth.uid() or public.is_hotel_admin());
create policy bookings_insert on public.bookings for insert to authenticated
 with check (user_id = auth.uid() and status = 'pending');
create policy bookings_cancel on public.bookings for update to authenticated
 using (user_id = auth.uid() and status = 'pending')
 with check (user_id = auth.uid() and status = 'cancelled');
create policy bookings_admin on public.bookings for update to authenticated
 using (public.is_hotel_admin()) with check (public.is_hotel_admin());

-- Rooms are categories. Set this to the actual number of physical units before launch.
alter table public.rooms add column if not exists inventory_count integer not null default 1 check (inventory_count > 0);
create or replace function public.validate_hotel_booking()
returns trigger language plpgsql security definer set search_path = '' as $$
declare r public.rooms; occupied integer;
begin
  select * into r from public.rooms where id = new.room_id for update;
  if not found then raise exception 'ROOM_UNAVAILABLE'; end if;
  if tg_op = 'INSERT' then
    if not r.is_active then raise exception 'ROOM_UNAVAILABLE'; end if;
    if new.check_in < (now() at time zone 'Asia/Bishkek')::date
      or new.check_out <= new.check_in or new.check_out - new.check_in > 90 then
      raise exception 'INVALID_DATES';
    end if;
    if new.guests_count is null or new.guests_count < 1 or new.guests_count > r.capacity then
      raise exception 'INVALID_GUESTS';
    end if;
    if length(trim(new.guest_name)) not between 2 and 120
      or length(new.guest_email) > 254 or new.guest_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      or length(coalesce(new.guest_phone,'')) > 40 or length(coalesce(new.notes,'')) > 1000 then
      raise exception 'INVALID_CONTACT';
    end if;
    -- Serializes requests from the same guest, including across room categories.
    perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
    if (select count(*) from public.bookings where user_id = new.user_id and created_at > now() - interval '1 hour') >= 5 then
      raise exception 'REQUEST_LIMIT';
    end if;
    new.status := 'pending';
    new.total_price_kgs := r.price_kgs * (new.check_out - new.check_in);
  elsif new.status is distinct from old.status then
    if old.status in ('cancelled','completed') then raise exception 'FINAL_STATUS'; end if;
    if new.status = 'pending' then raise exception 'INVALID_STATUS'; end if;
    if new.status = 'completed' and (old.status <> 'confirmed' or new.check_out > (now() at time zone 'Asia/Bishkek')::date) then
      raise exception 'INVALID_STATUS';
    end if;
  end if;
  if new.status = 'confirmed' then
    select coalesce(max(n),0) into occupied from (
      select count(b.id) n from generate_series(new.check_in::timestamp, (new.check_out - 1)::timestamp, interval '1 day') d
      left join public.bookings b on b.room_id = new.room_id and b.id <> new.id
        and b.status = 'confirmed' and b.check_in <= d::date and b.check_out > d::date
      group by d
    ) counts;
    if occupied >= r.inventory_count then raise exception 'ROOM_UNAVAILABLE'; end if;
  end if;
  return new;
end $$;
revoke all on function public.validate_hotel_booking() from public;
drop trigger if exists validate_hotel_booking on public.bookings;
create trigger validate_hotel_booking before insert or update on public.bookings
 for each row execute function public.validate_hotel_booking();
create index if not exists bookings_room_dates on public.bookings(room_id, check_in, check_out) where status = 'confirmed';
create index if not exists bookings_user_created on public.bookings(user_id, created_at);
commit;
