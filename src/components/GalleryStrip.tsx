const images = [
  { src: '/images/tunduk.webp', alt: 'ALAY ART Hotel' },
  { src: '/images/interior.webp', alt: 'Interior' },
  { src: '/images/breakfast.webp', alt: 'Breakfast' },
  { src: '/images/deluxe.webp', alt: 'Deluxe Room' },
  { src: '/images/cuisine.webp', alt: 'National Cuisine' },
  { src: '/images/family.webp', alt: 'Comfort' },
  { src: '/images/suite.webp', alt: 'Design' },
  { src: '/images/lounge.webp', alt: 'Rest Zone' },
  { src: '/images/hotel.webp', alt: 'Hotel' },
];

export default function GalleryStrip() {
  const doubled = [...images, ...images];
  return (
    <div className="gallery-strip">
      <div className="gallery-track">
        {doubled.map((img, i) => (
          <img key={i} src={img.src} alt={img.alt} loading="lazy" />
        ))}
      </div>
    </div>
  );
}
