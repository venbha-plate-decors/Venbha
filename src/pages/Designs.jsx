import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { fetchCollections } from '../lib/databaseUtils';
import './Designs.css';

const Designs = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCollections = async () => {
            const { success, data } = await fetchCollections();
            if (success) {
                setCollections(data);
            }
            setLoading(false);
        };

        window.scrollTo(0, 0);
        loadCollections();
    }, []);

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
                <title>Our Collections | Venbha Plate Decors</title>
                <meta name="description" content="Explore our exclusive collection of plate decoration themes, from traditional seer varisai to modern engagement hampers." />
            </Helmet>

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

            <div className="collections-grid-container">
                {loading ? (
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
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {collections.map((collection) => (
                            <motion.div
                                key={collection.id}
                                className="collection-card"
                                variants={cardVariants}
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
