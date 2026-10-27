import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
const guest = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const admin = '33333333-3333-4333-8333-333333333333';
async function asUser(id, sql) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${id}', false);`);
  try { return await db.query(sql); } finally { await db.exec('reset role'); }
}
const insert = (extra = '', values = '', start = 'current_date + 2', end = 'current_date + 4') => `insert into public.bookings(user_id,room_id,guest_name,guest_email,check_in,check_out,guests_count${extra}) values ('${guest}',1,'Test Guest','test@example.com',${start},${end},2${values}) returning *`;
before(async () => {
  await db.exec(`create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;`);
  await db.exec(readFileSync('supabase/schema.sql', 'utf8'));
  await db.exec(readFileSync('supabase/migrations/20261027_security.sql', 'utf8'));
  await db.exec(`insert into auth.users(id) values ('${guest}'),('${other}'),('${admin}'); update public.profiles set role='admin' where id='${admin}';`);
});
after(() => db.close());
test('guest cannot escalate their role or insert an admin profile', async () => {
  await assert.rejects(asUser(guest, `update public.profiles set role='admin' where id='${guest}'`), /permission denied/);
  await assert.rejects(asUser(guest, `insert into public.profiles(id,role) values('${guest}','admin')`), /permission denied/);
});
test('profiles are private, own contact details editable', async () => {
  const result = await asUser(guest, 'select * from public.profiles');
  assert.equal(result.rows.length, 1);
  await asUser(guest, `update public.profiles set full_name='Updated Guest' where id='${guest}'`);
  assert.equal((await asUser(admin, 'select * from public.profiles')).rows.length, 3);
});
test('price is server-calculated; guest cannot submit price or status', async () => {
  await assert.rejects(asUser(guest, insert(',total_price_kgs', ',1')), /permission denied/);
  await assert.rejects(asUser(guest, insert(',status', ",'confirmed'")), /permission denied/);
  const result = await asUser(guest, insert());
  assert.equal(result.rows[0].total_price_kgs, 7000);
  assert.equal(result.rows[0].status, 'pending');
});
test('invalid dates and capacity rejected by database', async () => {
  await assert.rejects(asUser(guest, insert('', '', 'current_date - 1', 'current_date + 1')), /INVALID_DATES/);
  await assert.rejects(asUser(guest, insert('', '', 'current_date + 2', 'current_date + 100')), /INVALID_DATES/);
  await assert.rejects(asUser(guest, insert().replace(',2) returning', ',9) returning')), /INVALID_GUESTS/);
});
test('bookings private and guests cannot self-confirm; cancellation persists', async () => {
  assert.equal((await asUser(other, 'select * from public.bookings')).rows.length, 0);
  await assert.rejects(asUser(guest, "update public.bookings set status='confirmed'"), /row-level security/);
  await asUser(guest, "update public.bookings set status='cancelled'");
  assert.equal((await asUser(guest, 'select status from public.bookings')).rows[0].status, 'cancelled');
});
test('hotel cannot overconfirm inventory; adjacent stays allowed', async () => {
  const a = (await asUser(guest, insert())).rows[0].id;
  const b = (await asUser(guest, insert())).rows[0].id;
  await asUser(admin, `update public.bookings set status='confirmed' where id='${a}'`);
  await assert.rejects(asUser(admin, `update public.bookings set status='confirmed' where id='${b}'`), /ROOM_UNAVAILABLE/);
  const c = (await asUser(guest, insert('', '', 'current_date + 4', 'current_date + 6'))).rows[0].id;
  await asUser(admin, `update public.bookings set status='confirmed' where id='${c}'`);
});
test('guest request limit enforced', async () => {
  await asUser(guest, insert());
  await assert.rejects(asUser(guest, insert()), /REQUEST_LIMIT/);
});
