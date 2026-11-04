// Store only an opaque hash + UUID, never guest contact data. A lost response can
// be retried after a reload with exactly the same server-side idempotency key.
const memory = new Map<string, string>();
export async function bookingRequestKey(userId: string, payload: Record<string, unknown>) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
  const storageKey = `hotel-request:${userId}:${hash}`;
  let existing: string | null = memory.get(storageKey) || null;
  try { existing = sessionStorage.getItem(storageKey) || existing; } catch { /* storage may be disabled */ }
  const key = existing && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(existing) ? existing : crypto.randomUUID();
  memory.set(storageKey, key);
  try { sessionStorage.setItem(storageKey, key); } catch { /* in-memory retry still works */ }
  return { key, storageKey };
}
export function forgetBookingRequest(storageKey: string) {
  memory.delete(storageKey);
  try { sessionStorage.removeItem(storageKey); } catch { /* optional storage */ }
}
