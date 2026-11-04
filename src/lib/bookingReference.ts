/** Display the stored booking UUID, never the request key or a truncated ID. */
export function formatBookingReference(bookingId: string): string {
  return bookingId.toUpperCase();
}
