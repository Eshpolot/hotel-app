const images = [
  { src: 'https://lh3.googleusercontent.com/d/1Eyd68D5i2r5GZQrRgFSYcrubTIPAGS2h', alt: 'ALAY ART Hotel' },
  { src: 'https://lh3.googleusercontent.com/d/1kvIxu6MY2nkacUNzPOX2ZKdxt7jhimen', alt: 'Interior' },
  { src: 'https://lh3.googleusercontent.com/d/1dYEs4DzH67x0cEeAclXhF8P8FPbIWXaz', alt: 'Breakfast' },
  { src: 'https://lh3.googleusercontent.com/d/1rEbP9-tlr4FOmXmkJBz71ADc2m8kAr3w', alt: 'Deluxe Room' },
  { src: 'https://lh3.googleusercontent.com/d/13Xnkpvj4j6wzSM1dUTDt-Hif_FmUM5Mb', alt: 'National Cuisine' },
  { src: 'https://lh3.googleusercontent.com/d/1g55aq5FEets7sv9aotVzJWp43OnfeBEp', alt: 'Comfort' },
  { src: 'https://lh3.googleusercontent.com/d/1iYXmMtHFaf6gI87n932UnBZaCym_Nwy2', alt: 'Design' },
  { src: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&q=80', alt: 'Conference' },
  { src: 'https://lh3.googleusercontent.com/d/1wjwhqcqPHmMk_aFs3lj91c3zD7_ghJtc', alt: 'Rest Zone' },
  { src: 'https://lh3.googleusercontent.com/d/1ACiTO230XAOd20Fmh3Zp9iUYc5AtQJpa', alt: 'Hotel' },
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
