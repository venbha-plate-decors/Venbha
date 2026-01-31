import React from 'react';
import './Gallery.css';
import { fetchGalleryImages, fetchHomeGalleryImages, fetchGalleryVideos } from '../lib/databaseUtils';

const Gallery = ({ storageKey = 'galleryImages', title = 'Our Gallery', showPhotosTitle = true }) => {
    const [selectedItem, setSelectedItem] = React.useState(null);
    const [galleryImages, setGalleryImages] = React.useState([]);
    const [galleryVideos, setGalleryVideos] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const loadGalleryData = React.useCallback(async () => {
        setLoading(true);

        try {
            if (storageKey === 'galleryImages') {
                const imagesResult = await fetchGalleryImages();
                if (imagesResult.success) setGalleryImages(imagesResult.data || []);

                const videosResult = await fetchGalleryVideos();
                if (videosResult.success) setGalleryVideos(videosResult.data || []);

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

    const openLightbox = (item, type = 'image') => {
        setSelectedItem({ ...item, type });
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
                        <div key={image.id || index} className="gallery-item" onClick={() => openLightbox(image, 'image')}>
                            <img src={image.url || image.src} alt={image.alt || 'Gallery Image'} loading="lazy" />
                            <div className="gallery-overlay">
                                <span>View</span>
                            </div>
                        </div>
                    ))}
                </div>

                {galleryVideos.length > 0 && (
                    <>
                        <div className="section-subtitle" style={{ marginTop: '3rem' }}>Videos</div>
                        <div className="gallery-grid video-grid">
                            {galleryVideos.map((video, index) => (
                                <VideoThumbnail
                                    key={video.id || index}
                                    video={video}
                                    onClick={() => openLightbox(video, 'video')}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Lightbox */}
            {selectedItem && (
                <div className="lightbox" onClick={closeLightbox}>
                    <div className={`lightbox-content ${selectedItem.type === 'video' ? 'video-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
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
                                    style={{ maxHeight: '85vh', maxWidth: '100%', borderRadius: '4px' }}
                                >
                                    Your browser does not support the video tag.
                                </video>
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

const VideoThumbnail = ({ video, onClick }) => {
    return (
        <div
            onClick={onClick}
            style={{
                position: 'relative',
                borderRadius: '10px',
                overflow: 'hidden',
                background: '#000',
                aspectRatio: '16/9',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer'
            }}
        >
            <video
                src={video.url + '#t=0.5'} // Try to show the first frame
                preload="metadata"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block'
                }}
            />

            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.3)',
                transition: 'background 0.3s ease'
            }}
                className="video-overlay-hover"
            >
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 0 20px rgba(0,0,0,0.2)'
                }}>
                    <div style={{
                        width: 0,
                        height: 0,
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderLeft: '18px solid white',
                        marginLeft: '4px'
                    }} />
                </div>
            </div>
        </div>
    );
};

export default Gallery;
