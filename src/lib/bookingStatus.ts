type Status = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export function allowedBookingStatuses(status: Status, checkOut: string, hotelToday: string): Status[] {
  if (status === 'pending') return ['pending', 'confirmed', 'cancelled'];
  if (status === 'confirmed') return checkOut <= hotelToday ? ['confirmed', 'completed', 'cancelled'] : ['confirmed', 'cancelled'];
  return [status];
}
