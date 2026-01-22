import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import Gallery from '../components/Gallery';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';

const Home = () => {
    return (
        <>
            <Helmet>
                <title>Venbha Plate Decors | Best Seer Thattu Decoration</title>
                <meta name="description" content="Welcome to Venbha Plate Decors. We specialize in exquisite seer thattu decorations for weddings, engagements, and all your special occasions. Explore our collections today!" />
            </Helmet>
            <Hero />
            <AboutSection />
            <Gallery storageKey="homeGalleryImages" showPhotosTitle={false} />
            <Testimonials />
            <FAQ />
        </>
    );
};

export default Home;
