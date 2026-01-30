import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCollections, fetchDesigns } from '../lib/databaseUtils';
import './Designs.css';

const Designs = () => {
    const { collectionSlug } = useParams();
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [collectionDesigns, setCollectionDesigns] = useState([]);
    const [loadingDesigns, setLoadingDesigns] = useState(false);

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
                                                onClick={() => window.open(design.image, '_blank')}
                                            />
                                        </div>
                                        <div className="design-info">
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
        </div>
    );
};

export default Designs;
