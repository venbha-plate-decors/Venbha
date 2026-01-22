import React from 'react';
import { motion } from 'framer-motion';
import './AboutSection.css';
import aboutImage from '../assets/about_image.png';

import { Link } from 'react-router-dom';

const AboutSection = () => {
    return (
        <section className="about-section" id="about">
            <div className="container about-container">

                <motion.div
                    className="about-image-wrapper"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <img src={aboutImage} alt="Venbha Plate Decors Creations" className="about-img" loading="lazy" />
                </motion.div>

                <motion.div
                    className="about-content"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <span className="sub-title">About Us</span>
                    <h2 className="section-title">Adding Sparkle to Your Special Moments</h2>
                    <p className="about-text">
                        At Venbha Plate Decors, we specialize in creating exquisite plate decorations
                        for weddings, engagements, baby showers, and all your cherished celebrations.
                    </p>
                    <p className="about-text">
                        Our passion lies in blending traditional customs with contemporary designs
                        to deliver unique, handcrafted pieces that become the highlight of your event.
                    </p>

                    <div className="features-list">
                        <div className="feature-item">
                            <span className="feature-icon">✨</span> Custom Designs
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">💖</span> Handcrafted Love
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🌿</span> Eco-friendly Options
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🚚</span> On-time Delivery
                        </div>
                    </div>

                    <Link to="/about" className="read-more-btn">
                        Read More
                    </Link>
                </motion.div>

            </div>
        </section>
    );
};

export default AboutSection;
