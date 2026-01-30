import React from 'react';
import { motion } from 'framer-motion';
import './Testimonials.css';
import testimonialImg1 from '../assets/testimonial1.jpg';
import testimonialImg2 from '../assets/testimonial2.jpg';
import testimonialImg3 from '../assets/testimonial3.jpg';

// Import images or use placeholders if they don't exist yet
// Ideally we would import them, but if they are not there, the build might fail or show error.
// For now, I'll use direct paths which vite can handle if in public, or imports if in assets.
// Let's assume we will put them in src/assets.
// To avoid build errors if files are missing, I will use try-catch or dynamic import?
// No, simpler: I'll use a placeholder service as fallback in the onError.

const testimonials = [
    {
        id: 1,
        name: 'Anitha Krishnan',
        role: 'Bride',
        image: testimonialImg1,
        text: "Venbha's designs transformed our wedding completely. The attention to detail in the seer thattu decoration was simply unmatched. Truly a dream come true!"
    },
    {
        id: 2,
        name: 'Karthik Raja',
        role: 'Happy Father',
        image: testimonialImg2,
        text: "Exceptional quality and service. They perfectly understood our traditional requirements and delivered a modern yet culturally rooted aesthetic. Highly recommended!"
    },
    {
        id: 3,
        name: 'Meera Sundaram',
        role: 'Event Planner',
        image: testimonialImg3,
        text: "From concept to execution, everything was seamless. The unique color combinations they suggested brought so much life to the event. Thank you, Venbha!"
    }
];

const Testimonials = () => {
    return (
        <div className="testimonials-section">
            <div className="container">
                <motion.h2
                    className="testimonials-heading"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    Love from our Clients
                </motion.h2>
                <div className="testimonials-grid">
                    {testimonials.map((item, index) => (
                        <motion.div
                            className="testimonial-card"
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10 }}
                        >
                            <div className="image-wrapper">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=D81B60&color=fff&size=200`;
                                    }}
                                />
                            </div>
                            <p className="testimonial-text">"{item.text}"</p>
                            <h3 className="testimonial-name">{item.name}</h3>
                            <span className="testimonial-role">{item.role}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Testimonials;
