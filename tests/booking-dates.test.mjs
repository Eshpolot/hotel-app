import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isCalendarDate, validStay, today, nextDay, stayNights } from '../src/lib/booking.ts';
test('calendar input rejects impossible and non-date URL values', () => {
  for (const date of ['', 'garbage', '2027-02-31', '2027-13-01', '2027-01-01T12:00:00']) assert.equal(isCalendarDate(date), false, date);
  assert.equal(isCalendarDate('2028-02-29'),true);
});
test('booking dates handle adjacent nights and 90-night maximum', () => {
  const start=today();
  assert.equal(validStay(start,nextDay(start)),true);
  assert.equal(stayNights(start,nextDay(start)),1);
  assert.equal(validStay(start,start),false);
  let end=start;
  for(let i=0;i<90;i++) end=nextDay(end);
  assert.equal(validStay(start,end),true);
  assert.equal(validStay(start,nextDay(end)),false);
  assert.equal(validStay('2020-01-01','2020-01-02'),false);
});
