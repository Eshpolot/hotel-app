import type { Room } from '../lib/supabase';
// Public catalogue verified against the hotel database on 2026-10-28.
// Display-only fallback: never use as proof of availability or a current quote.
export const roomSnapshot: Room[] = [
  {
    id: 1, type: 'standard', name_ru: 'Стандарт', name_en: 'Standard', name_kg: 'Стандарт',
    description_ru: 'Уютный номер с этно-декором, всем необходимым для комфортного проживания.',
    description_en: 'Cozy room with ethno decor and everything needed for comfortable stay.',
    description_kg: 'Этно-декор менен ыңгайлуу бөлмө.',
    price_kgs: 3500, capacity: 2, image_url: 'https://lh3.googleusercontent.com/d/1q3z2pxxllqb6mhLW4r_ImUyc3LTmRKZi',
    amenities: [], badge: 'Популярный', badge_type: 'popular', is_active: true
  },
  {
    id: 2, type: 'deluxe', name_ru: 'Делюкс', name_en: 'Deluxe', name_kg: 'Делюкс',
    description_ru: 'Просторный номер премиум-класса с панорамным видом и роскошной отделкой.',
    description_en: 'Spacious premium room with panoramic views and luxurious finishes.',
    description_kg: 'Панорамалык көрүнүшү бар кең бөлмө.',
    price_kgs: 6500, capacity: 2, image_url: 'https://lh3.googleusercontent.com/d/1rEbP9-tlr4FOmXmkJBz71ADc2m8kAr3w',
    amenities: [], badge: 'VIP', badge_type: 'vip', is_active: true
  },
  {
    id: 3, type: 'family', name_ru: 'Семейный', name_en: 'Family', name_kg: 'Үй-бүлөлүк',
    description_ru: 'Идеальный номер для семейного отдыха с двумя зонами и детскими удобствами.',
    description_en: 'Perfect room for family vacation with two zones and children amenities.',
    description_kg: 'Үй-бүлөлүк эс алуу үчүн идеалдуу бөлмө.',
    price_kgs: 5000, capacity: 4, image_url: 'https://lh3.googleusercontent.com/d/1g55aq5FEets7sv9aotVzJWp43OnfeBEp',
    amenities: [], badge: null, badge_type: null, is_active: true
  },
  {
    id: 4, type: 'suite', name_ru: 'Люкс', name_en: 'Suite', name_kg: 'Люкс',
    description_ru: 'Роскошный люкс с гостиной, спальней и потрясающим этническим интерьером.',
    description_en: 'Luxurious suite with living room, bedroom and stunning ethnic interior.',
    description_kg: 'Мейманкана жана уктоо бөлмөсү бар люкс.',
    price_kgs: 9500, capacity: 2, image_url: 'https://lh3.googleusercontent.com/d/1iYXmMtHFaf6gI87n932UnBZaCym_Nwy2',
    amenities: [], badge: 'VIP SUITE', badge_type: 'vip', is_active: true
  },
];

