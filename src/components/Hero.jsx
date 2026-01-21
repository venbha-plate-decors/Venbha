import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Hero.css';
import heroVideo from '../assets/hero_video.mp4';

const Hero = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        // Ensure video plays after component mounts
        if (videoRef.current) {
            // Ensure video is muted before playing
            videoRef.current.muted = true;
            videoRef.current.play().catch(error => {
                console.log('Video autoplay failed:', error);
            });
        }
    }, []);

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
                ref={videoRef}
                className="hero-bg-video"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
            >
                <source src={heroVideo} type="video/mp4" />
            </video>

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
