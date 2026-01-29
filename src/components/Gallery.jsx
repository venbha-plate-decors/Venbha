import React from 'react';
import './Gallery.css';
import { fetchGalleryImages, fetchHomeGalleryImages } from '../lib/databaseUtils';

const Gallery = ({ storageKey = 'galleryImages', title = 'Our Gallery', showPhotosTitle = true }) => {
    const [selectedItem, setSelectedItem] = React.useState(null);
    const [galleryImages, setGalleryImages] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const loadGalleryData = React.useCallback(async () => {
        setLoading(true);

        try {
            if (storageKey === 'galleryImages') {
                const imagesResult = await fetchGalleryImages();
                if (imagesResult.success) setGalleryImages(imagesResult.data || []);

            } else if (storageKey === 'homeGalleryImages') {
                const result = await fetchHomeGalleryImages();
                if (result.success) setGalleryImages(result.data || []);
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
        } finally {
            setLoading(false);
        }
    }, [storageKey]);

    React.useEffect(() => {
        loadGalleryData();
        const handleGalleryUpdate = () => loadGalleryData();
        window.addEventListener('galleryUpdated', handleGalleryUpdate);
        return () => window.removeEventListener('galleryUpdated', handleGalleryUpdate);
    }, [loadGalleryData]);

    const openLightbox = (item) => {
        setSelectedItem(item);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedItem(null);
        document.body.style.overflow = 'auto';
    };

    if (loading) {
        return (
            <section className="gallery-section">
                <div className="container">
                    <h2>{title}</h2>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Loading gallery...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="gallery-section">
            <div className="container">
                <h2>{title}</h2>
                {showPhotosTitle && galleryImages.length > 0 && <div className="section-subtitle">Photos</div>}
                <div className="gallery-grid">
                    {galleryImages.map((image, index) => (
                        <div key={image.id || index} className="gallery-item" onClick={() => openLightbox(image)}>
                            <img src={image.url || image.src} alt={image.alt || 'Gallery Image'} loading="lazy" />
                            <div className="gallery-overlay">
                                <span>View</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {selectedItem && (
                <div className="lightbox" onClick={closeLightbox}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={closeLightbox}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        <div className="lightbox-image-wrapper">
                            {selectedItem.type === 'video' ? (
                                <video
                                    src={selectedItem.url}
                                    controls
                                    autoPlay
                                    playsInline
                                    preload="metadata"
                                    crossOrigin="anonymous"
                                    className="lightbox-video"
                                    style={{ maxHeight: '80vh', maxWidth: '100%' }}
                                />
                            ) : (
                                <img src={selectedItem.url || selectedItem.src} alt={selectedItem.alt} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Gallery;
