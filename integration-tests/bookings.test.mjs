import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import EmbeddedPostgres from 'embedded-postgres';
const dir=mkdtempSync(join(tmpdir(),'hotel-pg-'));
const server=new EmbeddedPostgres({databaseDir:dir,port:55439,user:'postgres',password:randomUUID(),persistent:false,autoRehydrateSymlinks:true,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:()=>{}});
let db;
const guest='11111111-1111-4111-8111-111111111111', other='22222222-2222-4222-8222-222222222222', admin='33333333-3333-4333-8333-333333333333';
const clients=[];
async function client(uid=guest, isolation='read committed') {
 const c=server.getPgClient(); await c.connect(); clients.push(c);
 await c.query(`begin isolation level ${isolation}; set local role authenticated`);
 await c.query("select set_config('request.jwt.claim.sub',$1,true)",[uid]);
 return c;
}
async function request(c,key=randomUUID(),room=1,start=2,end=4,price=3500) {
 return (await c.query(`select * from public.request_hotel_booking($1,$2,current_date+$3::integer,current_date+$4::integer,2,'Test Guest','guest@example.com',null,null,$5)`,[key,room,start,end,price])).rows[0];
}
async function create(uid=guest,start=2,end=4) {
 const c=await client(uid); const row=await request(c,randomUUID(),1,start,end); await c.query('commit'); return row;
}
async function blocked(pid) {
 const end=Date.now()+5000;
 while(Date.now()<end) {
  const r=await db.query("select wait_event_type from pg_stat_activity where pid=$1",[pid]);
  if(r.rows[0]?.wait_event_type==='Lock') return;
  await new Promise(resolve=>setTimeout(resolve,10));
 }
 throw new Error('Concurrent request never reached lock');
}
before(async()=>{
 await server.initialise(); await server.start(); db=server.getPgClient(); await db.connect();
 await db.query(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`);
 await db.query(readFileSync('supabase/schema.sql','utf8'));
 await db.query(readFileSync('supabase/migrations/20261105_booking_reliability.sql','utf8'));
 // Must be rerunnable without losing booking data.
 await db.query(readFileSync('supabase/migrations/20261105_booking_reliability.sql','utf8'));
 await db.query(`insert into auth.users(id) values('${guest}'),('${other}'),('${admin}'); update public.profiles set role='admin' where id='${admin}'`);
});
beforeEach(async()=>{
 for(const c of clients.splice(0)) { await c.query('rollback').catch(()=>{}); await c.end(); }
 await db.query('truncate public.bookings; update public.rooms set inventory_count=1,capacity=2,is_active=true,price_kgs=3500');
});
after(async()=>{for(const c of clients) await c.end().catch(()=>{}); await db?.end(); await server.stop(); rmSync(dir,{recursive:true,force:true});});
for(const isolation of ['read committed','repeatable read','serializable']) test(`two concurrent confirmations cannot oversell (${isolation})`,async()=>{
 const x=await create(guest),y=await create(other);
 const a=await client(admin,isolation),b=await client(admin,isolation);
 const pid=(await b.query('select pg_backend_pid() pid')).rows[0].pid;
 // Freeze the RR snapshot before the first booking is committed.
 await b.query('select count(*) from public.bookings');
 await a.query("update public.bookings set status='confirmed' where id=$1",[x.id]);
 const competing=b.query("update public.bookings set status='confirmed' where id=$1",[y.id]).then(()=>null,e=>e);
 await blocked(pid); await a.query('commit');
 const error=await competing;
 assert.ok(error); assert.ok(error.message.includes('ROOM_UNAVAILABLE') || error.code==='40001',error.message);
 await b.query('rollback');
 assert.equal(Number((await db.query("select count(*) n from public.bookings where status='confirmed'")).rows[0].n),1);
});
test('same request retried concurrently returns the original booking',async()=>{
 const key=randomUUID(),a=await client(),b=await client();
 const pid=(await b.query('select pg_backend_pid() pid')).rows[0].pid;
 const first=await request(a,key);
 const retry=request(b,key);
 await blocked(pid); await a.query('commit');
 assert.equal((await retry).id,first.id); await b.query('commit');
 assert.equal(Number((await db.query('select count(*) n from public.bookings')).rows[0].n),1);
});
test('different keys cannot duplicate an active stay',async()=>{
 await create(); const c=await client(); await assert.rejects(request(c),/DUPLICATE_BOOKING/);
});
test('two units permit two confirmations, not three; adjacent dates allowed',async()=>{
 await db.query('update public.rooms set inventory_count=2 where id=1');
 const x=await create(guest),y=await create(other),z=await create(admin);
 const c=await client(admin);
 for(const id of [x.id,y.id]) await c.query("update public.bookings set status='confirmed' where id=$1",[id]);
 await c.query('commit');
 const d=await client(admin); await assert.rejects(d.query("update public.bookings set status='confirmed' where id=$1",[z.id]),/ROOM_UNAVAILABLE/); await d.query('rollback');
 const adjacent=await create(guest,4,6); const e=await client(admin); await e.query("update public.bookings set status='confirmed' where id=$1",[adjacent.id]); await e.query('commit');
});
test('sold-out dates reject new requests; cancellation releases inventory',async()=>{
 const x=await create(); const a=await client(admin); await a.query("update public.bookings set status='confirmed' where id=$1",[x.id]); await a.query('commit');
 const b=await client(other); await assert.rejects(request(b),/ROOM_UNAVAILABLE/); await b.query('rollback');
 const c=await client(admin); await c.query("update public.bookings set status='cancelled' where id=$1",[x.id]); await c.query('commit');
 assert.equal((await create(other)).status,'pending');
});
test('stale quote requires consent; changed payload cannot reuse a key',async()=>{
 const a=await client(); await assert.rejects(request(a,randomUUID(),1,2,4,1),/PRICE_CHANGED/); await a.query('rollback');
 const key=randomUUID(),b=await client(); await request(b,key); await b.query('commit');
 const c=await client(); await assert.rejects(request(c,key,1,3,5),/REQUEST_KEY_REUSED/);
});
test('inventory cannot be reduced below confirmed stays',async()=>{
 await db.query('update public.rooms set inventory_count=2 where id=1');
 const x=await create(),y=await create(other),c=await client(admin);
 await c.query("update public.bookings set status='confirmed' where id=any($1::uuid[])",[[x.id,y.id]]); await c.query('commit');
 await assert.rejects(db.query('update public.rooms set inventory_count=1 where id=1'),/INVENTORY_BELOW_BOOKINGS/);
 await assert.rejects(db.query('update public.rooms set capacity=1 where id=1'),/CAPACITY_BELOW_BOOKINGS/);
});
test('guest cannot bypass RPC, read others, or confirm themselves',async()=>{
 const x=await create(); const a=await client(other);
 assert.equal((await a.query('select * from public.bookings')).rows.length,0);
 await assert.rejects(a.query("insert into public.bookings(room_id) values(1)"),/permission denied/); await a.query('rollback');
 const b=await client(); await assert.rejects(b.query("update public.bookings set status='confirmed' where id=$1",[x.id]),/row-level security/);
});
test('request limit counts new requests but not an idempotent retry',async()=>{
 let key,last;
 for(let i=0;i<5;i++){key=randomUUID();const c=await client();last=await request(c,key,1,2+i,3+i);await c.query('commit');}
 const c=await client();assert.equal((await request(c,key,1,6,7)).id,last.id);await c.query('commit');
 const d=await client();await assert.rejects(request(d,randomUUID(),1,10,11),/REQUEST_LIMIT/);
});
test('past pending stays cannot be confirmed and terminal stays cannot reopen',async()=>{
 // Seed a legacy past request without disabling the trigger globally.
 await db.query('alter table public.bookings disable trigger validate_hotel_booking');
 let id;
 try { id=(await db.query(`insert into public.bookings(user_id,room_id,guest_name,guest_email,check_in,check_out,status) values($1,1,'Legacy Guest','legacy@example.com',current_date-2,current_date-1,'pending') returning id`,[guest])).rows[0].id; }
 finally { await db.query('alter table public.bookings enable trigger validate_hotel_booking'); }
 const a=await client(admin); await assert.rejects(a.query("update public.bookings set status='confirmed' where id=$1",[id]),/INVALID_DATES/); await a.query('rollback');
 const b=await client(admin); await b.query("update public.bookings set status='cancelled' where id=$1",[id]); await b.query('commit');
 const c=await client(admin); await assert.rejects(c.query("update public.bookings set status='confirmed' where id=$1",[id]),/INVALID_STATUS/);
});
test('aggregate availability hides bookings and matches adjacent stays',async()=>{
 const x=await create(); const a=await client(admin); await a.query("update public.bookings set status='confirmed' where id=$1",[x.id]); await a.query('commit');
 await db.query('set role anon');
 try {
  assert.equal((await db.query('select public.check_hotel_availability(1,current_date+2,current_date+4) n')).rows[0].n,0);
  assert.equal((await db.query('select public.check_hotel_availability(1,current_date+4,current_date+5) n')).rows[0].n,1);
  await assert.rejects(db.query('select * from public.bookings'),/permission denied/);
 } finally { await db.query('reset role'); }
});
