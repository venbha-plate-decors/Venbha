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

const Gallery = () => {
    const [selectedImage, setSelectedImage] = React.useState(null);

    const images = [
        { src: gallery1, alt: "Decorated Plate 1" },
        { src: gallery2, alt: "Decorated Plate 2" },
        { src: gallery3, alt: "Decorated Plate 3" },
        { src: gallery4, alt: "Decorated Plate 4" },
        { src: gallery5, alt: "Decorated Plate 5" },
        { src: gallery6, alt: "Decorated Plate 6" },
        { src: gallery7, alt: "Decorated Plate 7" },
        { src: gallery8, alt: "Decorated Plate 8" },
        { src: gallery9, alt: "Decorated Plate 9" },
    ];

    const openLightbox = (image) => {
        setSelectedImage(image);
        document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    };

    return (
        <section className="gallery-section">
            <div className="container">
                <h2>Our Gallery</h2>
                <div className="gallery-grid">
                    {images.map((image, index) => (
                        <div key={index} className="gallery-item" onClick={() => openLightbox(image)}>
                            <img src={image.src} alt={image.alt} loading="lazy" />
                            <div className="gallery-overlay">
                                <span>View More</span>
                            </div>
                        </div>
                    ))}
                </div>
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
