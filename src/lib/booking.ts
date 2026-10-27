import { differenceInCalendarDays, format, parseISO, addDays } from 'date-fns';
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bishkek', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const nextDay = (date: string) => format(addDays(parseISO(date || today()), 1), 'yyyy-MM-dd');
export const stayNights = (start: string, end: string) => differenceInCalendarDays(parseISO(end), parseISO(start));
export const isCalendarDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(parseISO(date).getTime());
export function validStay(start: string, end: string) {
  const nights = stayNights(start, end);
  return isCalendarDate(start) && isCalendarDate(end) && start >= today() && nights > 0 && nights <= 90;
}
