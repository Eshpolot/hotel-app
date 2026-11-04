import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingRequestKey,forgetBookingRequest } from '../src/lib/bookingRequest.ts';
import { allowedBookingStatuses } from '../src/lib/bookingStatus.ts';
import { bookingError } from '../src/lib/bookingErrors.ts';
const store=new Map();
globalThis.sessionStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
test('identical retry gets same UUID, without storing personal data',async()=>{
 const payload={name:'Guest Example',email:'secret@example.com',dates:'2027-01-01'};
 const a=await bookingRequestKey('user-a',payload), b=await bookingRequestKey('user-a',payload);
 assert.equal(a.key,b.key);
 assert.notEqual((await bookingRequestKey('user-b',payload)).key,a.key);
 assert.notEqual((await bookingRequestKey('user-a',{...payload,dates:'2027-01-02'})).key,a.key);
 assert.ok(!JSON.stringify([...store]).includes('secret@example.com'));
 forgetBookingRequest(a.storageKey);
 assert.notEqual((await bookingRequestKey('user-a',payload)).key,a.key);
});
test('terminal bookings cannot be reopened, completion only after departure',()=>{
 assert.deepEqual(allowedBookingStatuses('cancelled','2026-01-01','2026-01-02'),['cancelled']);
 assert.deepEqual(allowedBookingStatuses('completed','2026-01-01','2026-01-02'),['completed']);
 assert.ok(!allowedBookingStatuses('confirmed','2027-01-01','2026-01-02').includes('completed'));
 assert.ok(allowedBookingStatuses('confirmed','2026-01-02','2026-01-02').includes('completed'));
 assert.ok(!allowedBookingStatuses('pending','2026-01-02','2026-01-02').includes('completed'));
});
test('known booking failures have useful translated messages',()=>{
 assert.match(bookingError({message:'ROOM_UNAVAILABLE'},'ru'),/свободных/);
 assert.match(bookingError({message:'DUPLICATE_BOOKING'},'en'),/already/);
 assert.match(bookingError({message:'PRICE_CHANGED'},'kg'),/Баа/);
});
