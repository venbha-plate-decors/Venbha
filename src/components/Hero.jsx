import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Hero.css';
import heroVideo from '../assets/hero_video.mp4';

import heroBanner from '../assets/hero_banner.jpg';

const Hero = () => {
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.3, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 50, damping: 15 }
        }
    };

    return (
        <section className="hero-section" id="home">
            {/* Full Background Video */}
            <video
                className="hero-bg-video"
                autoPlay
                loop
                muted
                playsInline
                onLoadedData={() => setIsVideoLoaded(true)}
                poster={heroBanner}
            >
                <source src={heroVideo} type="video/mp4" />
            </video>

            {/* Fallback/Loading Image Overlay */}
            <motion.img
                src={heroBanner}
                className="hero-bg-video"
                aria-hidden="true"
                initial={{ opacity: 1 }}
                animate={{ opacity: isVideoLoaded ? 0 : 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ zIndex: 0, objectFit: 'cover' }}
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="hero-overlay"></div>

            <div className="container hero-content">
                <motion.div
                    className="hero-text"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.h1 className="hero-title" variants={itemVariants}>
                        Venbha <br />
                        <span>Plate Decors</span>
                    </motion.h1>

                    <motion.p className="hero-description" variants={itemVariants}>
                        Experience the fusion of tradition and modern aesthetics.
                        Venbha Plate Decors brings your vision to life with
                        unmatched elegance and creativity for your most cherished moments.
                    </motion.p>

                    <motion.div className="cta-group" variants={itemVariants}>
                        <Link to="/collections" className="cta-button">
                            Explore Collections
                        </Link>
                        <Link to="/contact" className="cta-button secondary">
                            Get in Touch
                        </Link>
                    </motion.div>
                </motion.div>

                {/* No right-side media column needed as video is background */}
            </div>
        </section>
    );
};

export default Hero;
