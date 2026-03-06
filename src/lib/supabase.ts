import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lwewgetpbfamgcstylwp.supabase.co';
const supabaseAnonKey = 'sb_publishable_q6jkRLt6IE1cc05DC7B9jg_bx4ymwIY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'guest' | 'admin';
  created_at: string;
}

export interface Room {
  id: number;
  type: 'standard' | 'deluxe' | 'family' | 'suite';
  name_ru: string;
  name_en: string;
  name_kg: string;
  description_ru: string | null;
  description_en: string | null;
  description_kg: string | null;
  price_kgs: number;
  capacity: number;
  image_url: string | null;
  amenities: string[];
  badge: string | null;
  badge_type: 'popular' | 'vip' | null;
  is_active: boolean;
}

export interface Booking {
  id: string;
  user_id: string;
  room_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  guests_count: number;
  nights: number;
  total_price_kgs: number | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
  room?: Room;
}
