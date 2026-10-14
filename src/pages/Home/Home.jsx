import { useLanguage } from '../../context/LanguageContext';
import Navbar from '../../components/Navbar/Navbar';

// 🆕 Hero component (صورة 2 - بعد الناف بار)
import Hero from '../../components/Hero/Hero';

// باقي الأقسام (محفوظة كما هي)
import ThreeWorlds from '../../components/ThreeWorlds/ThreeWorlds';
import TemplatesCarousel from '../../components/TemplatesCarousel/TemplatesCarousel';

// 🆕 Connected component (صورة 1)
import Connected from '../../components/Connected/Connected';

import FeaturesRSVP from '../../components/FeaturesRSVP/FeaturesRSVP';
import Testimonials from '../../components/Testimonials/Testimonials';
import Footer from '../../components/Footer/Footer';
import './Home.css';
import bandImg from "../../assets/mm.png";

import ScrollRevealBand, { CURATED_BANDS } from '../../components/ScrollRevealBand/ScrollRevealBand';

/** Landing page composition (SEO: single H1 in hero). */
export default function Home() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      <main id="main">
        {/* 🆕 Hero - صورة 2 (القسم الجديد بعد الناف بار) */}
        <Hero />

        {/* Three Worlds - الباقات */}
        <ThreeWorlds />

        {/* Templates Carousel */}
        <TemplatesCarousel />

        {/* 🆕 Connected - صورة 1 (القسم الجديد "حدث واحد متصل") */}
        <Connected />

        {/* Features & RSVP */}
        <FeaturesRSVP />

        {/* Testimonials */}
        <ScrollRevealBand />


      <Testimonials />      </main>
      <Footer />
    </>
  );
}