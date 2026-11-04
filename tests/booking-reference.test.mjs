import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatBookingReference } from '../src/lib/bookingReference.ts';

test('booking reference preserves the complete stored UUID, consistently across reloads', () => {
  const id = 'abcd1234-5678-4abc-8def-123456789abc';
  const reference = formatBookingReference(id);
  assert.equal(reference, 'ABCD1234-5678-4ABC-8DEF-123456789ABC');
  assert.equal(reference.length,36);
  assert.equal(formatBookingReference(JSON.parse(JSON.stringify({id})).id), reference);
  assert.equal(formatBookingReference(reference), reference);
});
test('bookings with identical short prefixes remain distinguishable', () => {
  assert.notEqual(formatBookingReference('abcd1234-1111-4111-8111-111111111111'), formatBookingReference('abcd1234-2222-4222-8222-222222222222'));
});
