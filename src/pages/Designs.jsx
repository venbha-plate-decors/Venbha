import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCollections, fetchDesigns } from '../lib/databaseUtils';

import { addCollectionEntry } from '../lib/collectionUtils';
import './Designs.css';

const Designs = () => {
    const { collectionSlug } = useParams();
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [collectionDesigns, setCollectionDesigns] = useState([]);
    const [loadingDesigns, setLoadingDesigns] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [inquiryModal, setInquiryModal] = useState({ isOpen: false, design: null });
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '', selectedSet: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const slugify = (text) => {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    };

    // Load all collections initially
    useEffect(() => {
        const loadCollections = async () => {
            const { success, data } = await fetchCollections();
            if (success) {
                setCollections(data);
                // If slug is present in URL, find and set selected collection
                if (collectionSlug) {
                    const collection = data.find(c => slugify(c.name) === collectionSlug);
                    if (collection) {
                        fetchCollectionDesigns(collection);
                    }
                }
            }
            setLoading(false);
        };

        window.scrollTo(0, 0);
        loadCollections();
    }, []); // Run once on mount

    // Handle URL param changes
    useEffect(() => {
        if (!loading && collections.length > 0) {
            if (collectionSlug) {
                // We have a slug, try to match it
                const slugToMatch = collectionSlug.toLowerCase();
                const collection = collections.find(c => slugify(c.name) === slugToMatch);

                if (collection) {
                    if (collection.id !== selectedCollection?.id) {
                        fetchCollectionDesigns(collection);
                    }
                } else {
                    // Slug didn't match any collection, maybe redirect or just show list?
                    // For now, reset to list view
                    setSelectedCollection(null);
                }
            } else {
                // No slug in URL, strictly ensure we are in list view
                if (selectedCollection) {
                    setSelectedCollection(null);
                    setCollectionDesigns([]);
                }
            }
        } else if (collections.length > 0 && !collectionSlug && selectedCollection) {
            // Edge case: collections loaded, no slug, but selectedCollection persists
            setSelectedCollection(null);
        }
    }, [collectionSlug, collections, loading]);

    const fetchCollectionDesigns = async (collection) => {
        setSelectedCollection(collection);
        setLoadingDesigns(true);
        try {
            const { success, data } = await fetchDesigns(collection.id);
            if (success) {
                setCollectionDesigns(data);
            }
        } catch (error) {
            console.error("Error fetching designs:", error);
        } finally {
            setLoadingDesigns(false);
        }
    };

    const handleCollectionClick = (collection) => {
        navigate(`/collections/${slugify(collection.name)}`);
    };

    const handleOpenInquiry = (design) => {
        setInquiryModal({ isOpen: true, design });

        setFormData(prev => ({
            ...prev,
            selectedSet: '',
            message: `I am interested in the design "${design.name}". Please share more details.`
        }));
    };

    const handleCloseInquiry = () => {
        setInquiryModal({ isOpen: false, design: null });
        setFormData({ name: '', phone: '', email: '', message: '', selectedSet: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitInquiry = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            alert('Please fill in your name and phone number.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await addCollectionEntry({
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                message: formData.message,
                design_name: inquiryModal.design.name,
                selected_sets: formData.selectedSet || ''
            });

            if (result.success) {
                setShowSuccess(true);
                // Auto close after 3 seconds or let user close it
                setTimeout(() => {
                    setShowSuccess(false);
                    handleCloseInquiry();
                }, 3000);
            } else {
                alert('Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error(error);
            alert('Error submitting form.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <div className="designs-page">
            <Helmet>
                <title>{selectedCollection ? `${selectedCollection.name} Designs` : 'Our Collections'} | Venbha Plate Decors</title>
                <meta name="description" content="Explore our exclusive collection of plate decoration themes, from traditional seer varisai to modern engagement hampers." />
            </Helmet>

            {!selectedCollection && (
                <header className="page-header">
                    <motion.h1
                        className="page-title"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Our <span>Collections</span>
                    </motion.h1>
                    <motion.p
                        className="page-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        Discover our handpicked themes designed to make every occasion magical.
                    </motion.p>
                </header>
            )}

            <div className="collections-grid-container">
                {selectedCollection ? (
                    <motion.div
                        className="designs-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >

                        <div className="designs-header">
                            <h2>{selectedCollection.name}</h2>
                            <p>Explore our exclusive {selectedCollection.name} designs</p>
                        </div>

                        {loadingDesigns ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Loading designs...</p>
                            </div>
                        ) : collectionDesigns.length === 0 ? (
                            <div className="no-collections">
                                <p>No designs added to this collection yet.</p>
                            </div>
                        ) : (
                            <div className="designs-grid">
                                {collectionDesigns.map((design, index) => (
                                    <motion.div
                                        key={design.id}
                                        className="design-card"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="design-image-wrapper">
                                            <img
                                                src={design.image}
                                                alt={design.name}
                                                className="design-img"
                                                onClick={() => handleOpenInquiry(design)}
                                            />
                                            <button
                                                className="zoom-icon-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImage(design.image);
                                                }}
                                                title="Zoom Image"
                                            >
                                                🔍
                                            </button>
                                        </div>
                                        <div className="design-info" onClick={() => handleOpenInquiry(design)} style={{ cursor: 'pointer' }}>
                                            <h3>{design.name}</h3>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading collections...</p>
                    </div>
                ) : collections.length === 0 ? (
                    <motion.div
                        className="no-collections"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p>No collections added yet. Check back soon!</p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="collections-grid"
                    >
                        {collections.map((collection) => (
                            <motion.div
                                key={collection.id}
                                className="collection-card"
                                variants={cardVariants}
                                onClick={() => handleCollectionClick(collection)}
                            >
                                <div className="card-image-container">
                                    <img
                                        src={collection.image}
                                        alt={collection.name}
                                        className="collection-img"
                                        loading="lazy"
                                    />
                                    <div className="card-overlay">
                                        <h3 className="collection-title">{collection.name}</h3>
                                        <div className="explore-btn">
                                            <span>Explore Designs</span>
                                            <span>→</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
                    <motion.div
                        className="lightbox-content"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="lightbox-close" onClick={() => setSelectedImage(null)}>×</button>
                        <img src={selectedImage} alt="Full View" className="lightbox-img" />
                    </motion.div>
                </div>
            )}
            {/* Inquiry Modal */}
            {inquiryModal.isOpen && (
                <div className="lightbox-overlay" onClick={handleCloseInquiry}>
                    <motion.div
                        className="inquiry-modal-content"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="modal-close-btn" onClick={handleCloseInquiry}>×</button>
                        <div className="inquiry-form-header">
                            <h2>Enquire Now</h2>
                            <p>Interested in <strong>{inquiryModal.design?.name}</strong>?</p>

                            <p style={{ marginTop: '10px' }}>Fill the form below to get a quote.</p>
                        </div>
                        <form onSubmit={handleSubmitInquiry}>
                            <div className="inquiry-form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div className="inquiry-form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Your Phone Number"
                                    required
                                />
                            </div>
                            <div className="inquiry-form-group">
                                <label>Email (Optional)</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Your Email"
                                />
                            </div>

                            {inquiryModal.design?.plate_count && (
                                <div className="inquiry-form-group">
                                    <label>Number of Sets</label>
                                    <select
                                        name="selectedSet"
                                        value={formData.selectedSet}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', background: '#f9f9f9' }}
                                    >
                                        <option value="">Select Sets</option>
                                        {String(inquiryModal.design.plate_count).split(',').map((opt, idx) => (
                                            <option key={idx} value={opt.trim()}>{opt.trim()} Sets</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="inquiry-form-group">
                                <label>Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Any specific requirements?"
                                    rows="3"
                                ></textarea>
                            </div>
                            <button type="submit" className="btn-submit-inquiry" disabled={isSubmitting}>
                                {isSubmitting ? 'Sending...' : 'Send Enquiry'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
                <div className="lightbox-overlay" style={{ background: 'rgba(0,0,0,0.85)' }}>
                    <motion.div
                        className="success-modal"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        style={{
                            background: 'white',
                            padding: '40px',
                            borderRadius: '20px',
                            textAlign: 'center',
                            maxWidth: '400px',
                            width: '90%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ type: 'spring', duration: 0.8 }}
                            style={{
                                width: '80px',
                                height: '80px',
                                background: '#10B981', // Success Green
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '40px',
                                color: 'white',
                                boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            ✓
                        </motion.div>
                        <div>
                            <h2 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '24px' }}>Thank You!</h2>
                            <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                                We have received your enquiry. <br /> Our team will contact you shortly!
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Designs;
