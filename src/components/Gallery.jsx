import React from 'react';
import './Gallery.css';
import { fetchGalleryImages, fetchGalleryVideos, fetchHomeGalleryImages } from '../lib/databaseUtils';


const Gallery = ({ storageKey = 'galleryImages', title = 'Our Gallery', showPhotosTitle = true }) => {
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [selectedVideo, setSelectedVideo] = React.useState(null);
    const [galleryImages, setGalleryImages] = React.useState([]);
    const [galleryVideos, setGalleryVideos] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const loadGalleryData = React.useCallback(async () => {
        setLoading(true);

        try {
            if (storageKey === 'galleryImages') {
                // Fetch main gallery images and videos from Supabase
                const [imagesResult, videosResult] = await Promise.all([
                    fetchGalleryImages(),
                    fetchGalleryVideos()
                ]);

                if (imagesResult.success) {
                    setGalleryImages(imagesResult.data || []);
                }

                if (videosResult.success) {
                    setGalleryVideos(videosResult.data || []);
                }
            } else if (storageKey === 'homeGalleryImages') {
                // Fetch home gallery images from Supabase
                const result = await fetchHomeGalleryImages();

                if (result.success) {
                    setGalleryImages(result.data || []);
                }
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
            setGalleryImages([]);
        } finally {
            setLoading(false);
        }
    }, [storageKey]);

    React.useEffect(() => {
        loadGalleryData();

        // Listen for updates from Admin Dashboard
        const handleGalleryUpdate = () => {
            loadGalleryData();
        };

        window.addEventListener('galleryUpdated', handleGalleryUpdate);

        return () => {
            window.removeEventListener('galleryUpdated', handleGalleryUpdate);
        };
    }, [loadGalleryData]);

    const openLightbox = (image) => {
        setSelectedImage(image);
        document.body.style.overflow = 'hidden';
    };

    const openVideoLightbox = (video) => {
        setSelectedVideo(video);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        setSelectedVideo(null);
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

                {galleryVideos.length > 0 && (
                    <div className="video-section">
                        <div className="section-subtitle">Videos</div>
                        <div className="gallery-grid video-grid">
                            {galleryVideos.map((video, index) => (
                                <VideoCard key={video.id || index} video={video} onPlay={() => openVideoLightbox(video)} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {(selectedImage || selectedVideo) && (
                <div className="lightbox" onClick={closeLightbox}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
                        {selectedImage ? (
                            <img src={selectedImage.url || selectedImage.src} alt={selectedImage.alt} />
                        ) : (
                            <video
                                src={selectedVideo.url || selectedVideo.src}
                                controls
                                autoPlay
                                style={{ maxWidth: '100%', maxHeight: '90vh', boxShadow: '0 5px 25px rgba(0,0,0,0.5)' }}
                            ></video>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

const VideoCard = ({ video, onPlay }) => {
    return (
        <div className="modern-video-card" onClick={onPlay}>
            <video
                src={video.url || video.src}
                preload="metadata"
                className="video-thumbnail"
            ></video>
            <div className="video-overlay">
                <div className="play-button">
                    <div className="play-icon"></div>
                </div>
            </div>
        </div>
    );
};

export default Gallery;
