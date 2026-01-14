import React, { useEffect } from 'react';
import GalleryComponent from '../components/Gallery';
import './Gallery.css';

const Gallery = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="gallery-page">
            <header className="page-header">
                <h1 className="page-title">Our <span>Gallery</span></h1>
                <p className="page-subtitle">A glimpse into our world of elegance and creativity.</p>
            </header>

            <GalleryComponent />
        </div>
    );
};

export default Gallery;
