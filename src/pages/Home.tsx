import { useState } from 'react';
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
      <Rooms searchCheckIn={searchDates.checkIn} searchCheckOut={searchDates.checkOut} />
      <WhyUs />
      <Experiences />
      <Testimonials />
      <CTA />
      <Contact />
      <Footer onNavClick={scrollTo} />
    </>
  );
}
