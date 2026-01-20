import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { addContactEntry } from '../lib/contactUtils';
import './Contact.css';

const Contact = () => {
    const location = useLocation();
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    useEffect(() => {
        window.scrollTo(0, 0);

        // Check for success query param
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('success')) {
            setShowSuccess(true);
            // Optional: Remove query param from URL without refresh
            window.history.replaceState({}, '', '/contact');
        }
    }, [location]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await addContactEntry(formData);

            if (result.success) {
                setShowSuccess(true);
                setFormData({ name: '', email: '', phone: '', message: '' });
            } else {
                alert('Failed to send message. Please try again or contact us directly.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <div className="contact-page">
            <Helmet>
                <title>Contact Us | Venbha Plate Decors</title>
                <meta name="description" content="Get in touch with Venbha Plate Decors for bookings, inquiries, or customized plate decoration services. We are here to make your event special." />
            </Helmet>
            <motion.header
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="page-title">Get in <span>Touch</span></h1>
                <p className="page-subtitle">
                    Ready to turn your event into a visual masterpiece? We'd love to hear from you!
                    Reach out to us for bookings, inquiries, or just to say hello.
                </p>
            </motion.header>

            <motion.div
                className="contact-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Contact Information */}
                <motion.div className="contact-info" variants={itemVariants}>
                    <div className="info-item">
                        <div className="info-icon">📞</div>
                        <div className="info-details">
                            <h3>Phone</h3>
                            <p>
                                <a href="tel:+919787617717">+91 97876 17717</a>
                            </p>
                            <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '5px' }}>
                                Mon - Sat, 9am - 9pm
                            </p>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-icon">✉️</div>
                        <div className="info-details">
                            <h3>Email</h3>
                            <p>
                                <a href="mailto:contact@venbhaplatedecors.com">contact@venbhaplatedecors.com</a>
                            </p>
                            <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '5px' }}>
                                We reply within 24 hours
                            </p>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-icon">📍</div>
                        <div className="info-details">
                            <h3>Studio Address</h3>
                            <p>
                                15, Nehru Street, Velampalayam,<br />
                                Tiruppur, A.Thirumuruganpoondi,<br />
                                Avanashi-641653, Tamil Nadu
                            </p>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-icon">✨</div>
                        <div className="info-details">
                            <h3>Follow Us</h3>
                            <p>
                                <a href="https://www.instagram.com/venbha_plate_decor_returngift/" target="_blank" rel="noopener noreferrer">
                                    @venbha_plate_decor_returngift
                                </a>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Form */}
                {/* Contact Form */}
                <motion.div className="contact-form-wrapper" variants={itemVariants}>
                    <AnimatePresence mode="wait">
                        {showSuccess ? (
                            <motion.div
                                className="success-message-inline"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="success-icon">🎉</div>
                                <h2>Thank You!</h2>
                                <p>We've received your message and will get back to you shortly.</p>
                                <motion.button
                                    onClick={() => setShowSuccess(false)}
                                    className="submit-btn"
                                    style={{ width: 'auto', padding: '12px 30px', marginTop: '20px' }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Send Another Message
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="contact-form"
                                className="contact-form"
                                onSubmit={handleSubmit}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        className="form-input"
                                        placeholder="e.g. Priyadharshini"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone" className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        id="phone"
                                        className="form-input"
                                        placeholder="Your 10-digit mobile number"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className="form-input"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message" className="form-label">Message & Requirements</label>
                                    <textarea
                                        name="message"
                                        id="message"
                                        className="form-textarea"
                                        placeholder="Tell us about your event, theme, and date..."
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                    ></textarea>
                                </div>

                                <motion.button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Contact;
