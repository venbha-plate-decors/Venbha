import React from 'react';
import './Gallery.css';
import gallery1 from '../assets/gallery_1.png';
import gallery2 from '../assets/gallery_2.png';
import gallery3 from '../assets/gallery_3.png';
import gallery4 from '../assets/gallery_4.png';
import gallery5 from '../assets/gallery_5.png';
import gallery6 from '../assets/gallery_6.png';
import gallery7 from '../assets/gallery_7.png';
import gallery8 from '../assets/gallery_8.png';
import gallery9 from '../assets/gallery_9.png';
import homeGallery1 from '../assets/home_gallery_1.jpg';
import homeGallery2 from '../assets/home_gallery_2.jpg';
import homeGallery3 from '../assets/home_gallery_3.jpg';
import homeGallery4 from '../assets/home_gallery_4.png';
import homeGallery5 from '../assets/home_gallery_5.png';
import homeGallery6 from '../assets/home_gallery_6.png';

const Gallery = ({ storageKey = 'galleryImages', title = 'Our Gallery', showPhotosTitle = true }) => {
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [galleryImages, setGalleryImages] = React.useState([]);
    const [galleryVideos, setGalleryVideos] = React.useState([]);

    const videoKey = storageKey.replace('Images', 'Videos');

    const defaultImages = [
        { id: 1, src: gallery1, alt: "Decorated Plate 1" },
        { id: 2, src: gallery2, alt: "Decorated Plate 2" },
        { id: 3, src: gallery3, alt: "Decorated Plate 3" },
        { id: 4, src: gallery4, alt: "Decorated Plate 4" },
        { id: 5, src: gallery5, alt: "Decorated Plate 5" },
        { id: 6, src: gallery6, alt: "Decorated Plate 6" },
    ];

    const defaultHomeImages = [
        { id: 1, src: homeGallery1, alt: "Engagement Ring Plate" },
        { id: 2, src: homeGallery2, alt: "Apple Basket Decor" },
        { id: 3, src: homeGallery3, alt: "Valaikaappu Bangles" },
        { id: 4, src: homeGallery4, alt: "Pomegranate Plate" },
        { id: 5, src: homeGallery5, alt: "Banana Plate Decor" },
        { id: 6, src: homeGallery6, alt: "Couple Doll Decor" },
    ];

    React.useEffect(() => {
        const storedImages = localStorage.getItem(storageKey);
        if (storedImages) {
            setGalleryImages(JSON.parse(storedImages));
        } else if (storageKey === 'galleryImages') {
            setGalleryImages(defaultImages);
            localStorage.setItem(storageKey, JSON.stringify(defaultImages));
        } else if (storageKey === 'homeGalleryImages') {
            setGalleryImages(defaultHomeImages);
            localStorage.setItem(storageKey, JSON.stringify(defaultHomeImages));
        }

        const storedVideos = localStorage.getItem(videoKey);
        if (storedVideos) {
            setGalleryVideos(JSON.parse(storedVideos));
        }

        // Listen for updates from Admin Dashboard
        const handleStorageChange = () => {
            const updatedImages = localStorage.getItem(storageKey);
            if (updatedImages) {
                setGalleryImages(JSON.parse(updatedImages));
            } else {
                setGalleryImages([]); // Clear if removed
            }

            const updatedVideos = localStorage.getItem(videoKey);
            if (updatedVideos) {
                setGalleryVideos(JSON.parse(updatedVideos));
            } else {
                setGalleryVideos([]);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('galleryUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('galleryUpdated', handleStorageChange);
        };
    }, [storageKey, videoKey]);

    const openLightbox = (image) => {
        setSelectedImage(image);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <section className="gallery-section">
            <div className="container">
                <h2>{title}</h2>
                {showPhotosTitle && galleryImages.length > 0 && <div className="section-subtitle">Photos</div>}
                <div className="gallery-grid">
                    {galleryImages.map((image, index) => (
                        <div key={image.id || index} className="gallery-item" onClick={() => openLightbox(image)}>
                            <img src={image.src} alt={image.alt || 'Gallery Image'} loading="lazy" />
                            <div className="gallery-overlay">
                                <span>View More</span>
                            </div>
                        </div>
                    ))}
                </div>

                {galleryVideos.length > 0 && (
                    <div className="video-section">
                        <div className="section-subtitle">Videos</div>
                        <div className="gallery-grid video-grid">
                            {galleryVideos.map((video, index) => (
                                <div key={video.id || index} className="gallery-item video-item">
                                    <video src={video.src} controls preload="metadata"></video>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedImage && (
                <div className="lightbox" onClick={closeLightbox}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
                        <img src={selectedImage.src} alt={selectedImage.alt} />
                    </div>
                </div>
            )}
        </section>
    );
};

export default Gallery;
