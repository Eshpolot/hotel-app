import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import GuestGuide from '../components/GuestGuide';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import GalleryStrip from '../components/GalleryStrip';
import Features from '../components/Features';
import Rooms from '../components/Rooms';
import WhyUs from '../components/WhyUs';
import Experiences from '../components/Experiences';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

interface SearchDates {
  checkIn: string;
  checkOut: string;
  guests: string;
}

export default function Home() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  const [searchDates, setSearchDates] = useState<SearchDates>({ checkIn: '', checkOut: '', guests: '' });

  const handleSearch = (checkIn: string, checkOut: string, guests: string) => {
    setSearchDates({ checkIn, checkOut, guests });
    document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Hero
        onBookClick={() => scrollTo('rooms')}
        onExploreClick={() => scrollTo('features')}
      />
      <SearchBar onSearch={handleSearch} />
      <GalleryStrip />
      <Features />
      <Rooms searchCheckIn={searchDates.checkIn} searchCheckOut={searchDates.checkOut} searchGuests={searchDates.guests} />
      <WhyUs />
      <Experiences />
      <GuestGuide />
      <Testimonials />
      <CTA />
      <Contact />
      <Footer onNavClick={scrollTo} />
    </>
  );
}
