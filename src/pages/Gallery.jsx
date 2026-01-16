import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import GalleryComponent from '../components/Gallery';
import './Gallery.css';

const Gallery = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="gallery-page">
            <Helmet>
                <title>Gallery | Our Latest Decoration Works | Venbha Plate Decors</title>
                <meta name="description" content="Browse our gallery of stunning plate decorations, engagement hampers, and wedding return gifts. See our artistry in action." />
            </Helmet>
            <header className="page-header">
                <h1 className="page-title">Our <span>Gallery</span></h1>
                <p className="page-subtitle">A glimpse into our world of elegance and creativity.</p>
            </header>

            <GalleryComponent />
        </div>
    );
};

export default Gallery;
