import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import './About.css';
import aboutStory from '../assets/about_story.png';
import aboutMission from '../assets/about_mission.png';

const About = () => {
    // Scroll to top on component mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="about-page">
            <Helmet>
                <title>About Us | Venbha Plate Decors - Creating Memories</title>
                <meta name="description" content="Learn more about Venbha Plate Decors. We blend tradition with creativity to craft stunning plate decorations for your most cherished moments." />
            </Helmet>
            <header className="page-header">
                <h1 className="page-title">About <span>Venbha</span></h1>
                <p className="page-subtitle">Where tradition meets creativity in every plate.</p>
            </header>

            <section className="story-section">
                <div className="container story-content">
                    <div className="story-image-container">
                        <img src={aboutMission} alt="Crafting decorations" className="story-img" />
                    </div>
                    <div className="story-text-container">
                        <h2 className="section-title">Our Story</h2>
                        <p className="story-text">
                            At <strong>Venbha Plate Decors</strong>, we believe every special moment deserves a touch of elegance. What began as a heartfelt passion for arranging <strong>traditional
                                aarthi plates</strong> for family gatherings has grown into a premier service dedicated to adding sparkle to your most cherished occasions.
                        </p>
                        <p className="story-text">
                            From the vibrant colors of a <strong>Valaikaappu (Baby Shower)</strong> to the grandeur of <strong>wedding seer varisai</strong>, we specialize in
                            handcrafting customized plate decorations that reflect your unique style. Our team of skilled artisans pours love and creativity into every piece, ensuring your
                            return gifts and ceremonial hampers are not just items, but lasting memories.
                        </p>
                    </div>
                </div>
            </section>



            <section className="why-choose-us">
                <div className="container">
                    <h2 className="section-title">Why Choose Us?</h2>

                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <span className="benefit-icon animate-bounce">🎨</span>
                            <h3 className="benefit-title">Customized Artistry</h3>
                            <p className="benefit-text">
                                We don't just decorate; we create personalized art. Whether it's a traditional theme or a modern aesthetic, our <strong>customized tray layouts</strong> are tailored to your event's specific vibe.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <span className="benefit-icon animate-pulse">💎</span>
                            <h3 className="benefit-title">Premium Quality</h3>
                            <p className="benefit-text">
                                We treat your events like our own. Using only high-quality materials, fresh florals, and intricate accessories, we ensure every <strong>engagement hamper</strong> and plate looks luxurious.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <span className="benefit-icon animate-spin-slow">🤝</span>
                            <h3 className="benefit-title">Stress-Free Experience</h3>
                            <p className="benefit-text">
                                Planning an event is hard work. We handle the entire <strong>plate decoration process</strong>—from concept to delivery—so you can focus on celebrating with your loved ones.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <span className="benefit-icon animate-float">🕒</span>
                            <h3 className="benefit-title">On-Time Delivery</h3>
                            <p className="benefit-text">
                                We value your time. Count on us for prompt setup and reliable delivery, ensuring your <strong>wedding return gifts</strong> are ready well before the big day begins.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <span className="benefit-icon animate-pulse">💰</span>
                            <h3 className="benefit-title">Affordable Elegance</h3>
                            <p className="benefit-text">
                                Experience premium aesthetics without the premium price tag. We offer competitive pricing for all budgets, making <strong>luxury plate decor</strong> accessible to everyone.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <span className="benefit-icon animate-bounce">✨</span>
                            <h3 className="benefit-title">Unique Themes</h3>
                            <p className="benefit-text">
                                From classic gold and red to contemporary pastels, we curate unique themes for every occasion, including <strong>puberty ceremonies</strong>, housewarmings, and corporate events.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="vision-mission-section">
                <div className="container">
                    <h2 className="section-title">Our Vision & Mission</h2>
                    <div className="vm-grid">
                        <div className="vm-card">
                            <div className="vm-icon-wrapper">
                                <span className="vm-icon animate-float">🚀</span>
                            </div>
                            <h3 className="vm-title">Our Mission</h3>
                            <p className="vm-text">
                                To transform the traditional art of <strong>seer varisai</strong> and gift giving by providing stunning, ready-to-display plate decorations.
                                We aim to seamlessly blend cultural heritage with modern design, leaving your guests in awe at every celebration.
                            </p>
                        </div>

                        <div className="vm-card">
                            <div className="vm-icon-wrapper">
                                <span className="vm-icon animate-pulse">👁️</span>
                            </div>
                            <h3 className="vm-title">Our Vision</h3>
                            <p className="vm-text">
                                To be the leading plate decor service in the region, recognized for our artistic excellence,
                                commitment to quality, and ability to turn ordinary plates into extraordinary memories.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
