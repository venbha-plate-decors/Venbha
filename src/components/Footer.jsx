import React from 'react';
import './Footer.css';

import { Link } from 'react-router-dom';
import logo from '../assets/venbha_logo.png';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="container">
                <div className="footer-content">

                    <div className="footer-column branding-column">
                        <img src={logo} alt="Venbha Plate Decors" className="footer-logo" />
                        <p className="footer-tagline">Making your special moments unforgettable.</p>
                    </div>

                    <div className="footer-column">
                        <h3>Contact Us</h3>
                        <p className="footer-text">
                            <span role="img" aria-label="phone">📞</span> +91 97876 17717
                        </p>
                        <div className="social-links">
                            <a
                                href="https://www.instagram.com/venbha_plate_decor_returngift/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-icon"
                                aria-label="Instagram"
                            >
                                {/* Instagram Icon SVG */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>
                            <a
                                href="https://www.facebook.com/venbapetals/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-icon"
                                aria-label="Facebook"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h3>Quick Links</h3>
                        <p className="footer-text"><Link to="/" className="footer-link">Home</Link></p>
                        <p className="footer-text"><Link to="/collections" className="footer-link">Collections</Link></p>
                        <p className="footer-text"><Link to="/about" className="footer-link">About Us</Link></p>
                        <p className="footer-text"><Link to="/blogs" className="footer-link">Blogs</Link></p>
                    </div>

                    <div className="footer-column">
                        <h3>Our Address</h3>
                        <p className="footer-text">
                            <span role="img" aria-label="location">📍</span> 15, Nehru Street, Velampalayam,<br />
                            Tiruppur, A.Thirumuruganpoondi,<br />
                            A Thirumuruganpoondi, Velampalayam,<br />
                            Nehru Street, Annur,<br />
                            Avanashi-641653, Tamil Nadu
                        </p>
                    </div>

                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Venbha Plate Decors. All rights reserved.</p>
                    <p className="powered-by">
                        Powered by <a href="https://kanavu.org" target="_blank" rel="noopener noreferrer">Kanavu Startup Village</a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
