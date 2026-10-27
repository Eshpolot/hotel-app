import hotelImages from '../data/hotelImages.json';
import type { Room } from './supabase';
export const roomPhoto = (room: Room) => (hotelImages as Record<string, string>)[room.image_url || ''] || room.image_url || '/room-placeholder.svg';
