import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { DownloadIcon } from '@radix-ui/react-icons';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Gallery State
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryVideos, setGalleryVideos] = useState([]);
    const [homeGalleryImages, setHomeGalleryImages] = useState([]);
    const [uploadType, setUploadType] = useState('image'); // 'image' or 'video'

    const [isGalleryHovered, setIsGalleryHovered] = useState(false);

    // Profile State
    const [adminProfile, setAdminProfile] = useState({
        name: 'Admin User',
        image: null
    });

    // Password State
    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    // Custom Popup State
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');

    const closePopup = () => setShowPopup(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        // Load gallery images from LocalStorage on mount
        const storedImages = localStorage.getItem('galleryImages');
        if (storedImages) {
            setGalleryImages(JSON.parse(storedImages));
        }

        // Load gallery videos
        const storedVideos = localStorage.getItem('galleryVideos');
        if (storedVideos) {
            setGalleryVideos(JSON.parse(storedVideos));
        }

        // Load home gallery images
        const storedHomeImages = localStorage.getItem('homeGalleryImages');
        if (storedHomeImages) {
            setHomeGalleryImages(JSON.parse(storedHomeImages));
        }

        // Load profile from LocalStorage
        const storedProfile = localStorage.getItem('adminProfile');
        if (storedProfile) {
            setAdminProfile(JSON.parse(storedProfile));
        }
    }, []);

    const handleAddMedia = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('media-upload');
        const files = Array.from(fileInput.files);

        if (files.length === 0) return;

        const readFile = (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        id: Date.now() + Math.random(),
                        src: reader.result,
                        type: uploadType
                    });
                };
                reader.readAsDataURL(file);
            });
        };

        const newItems = await Promise.all(files.map(readFile));

        try {
            if (uploadType === 'image') {
                const updatedImages = [...newItems, ...galleryImages];
                localStorage.setItem('galleryImages', JSON.stringify(updatedImages));
                setGalleryImages(updatedImages);
            } else {
                const updatedVideos = [...newItems, ...galleryVideos];
                localStorage.setItem('galleryVideos', JSON.stringify(updatedVideos));
                setGalleryVideos(updatedVideos);
            }

            window.dispatchEvent(new Event('galleryUpdated'));
            // Reset input
            fileInput.value = '';
        } catch (error) {
            console.error("Storage error:", error);
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                setPopupMessage("Storage limit exceeded! The videos/photos are too large to save locally. Please try smaller files or fewer items.");
                setShowPopup(true);
            } else {
                setPopupMessage("An error occurred while saving the media.");
                setShowPopup(true);
            }
        }
    };

    const handleDeleteMedia = (id, type) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            if (type === 'image') {
                const updatedImages = galleryImages.filter(img => img.id !== id);
                setGalleryImages(updatedImages);
                localStorage.setItem('galleryImages', JSON.stringify(updatedImages));
            } else {
                const updatedVideos = galleryVideos.filter(vid => vid.id !== id);
                setGalleryVideos(updatedVideos);
                localStorage.setItem('galleryVideos', JSON.stringify(updatedVideos));
            }
            window.dispatchEvent(new Event('galleryUpdated'));
        }
    };

    // Home Gallery Handlers
    const handleAddHomeImage = async (e) => {
        e.preventDefault();

        if (homeGalleryImages.length >= 6) {
            setPopupMessage("Maximum img upload is 6. If you like to upload img please delete old img to start upload");
            setShowPopup(true);
            return;
        }

        const fileInput = document.getElementById('home-image-upload');
        const files = Array.from(fileInput.files);

        if (files.length === 0) return;

        const readFile = (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        id: Date.now() + Math.random(),
                        src: reader.result,
                        alt: 'Home Gallery Image'
                    });
                };
                reader.readAsDataURL(file);
            });
        };

        const newItems = await Promise.all(files.map(readFile));

        try {
            const updatedImages = [...newItems, ...homeGalleryImages];
            localStorage.setItem('homeGalleryImages', JSON.stringify(updatedImages));
            setHomeGalleryImages(updatedImages);

            window.dispatchEvent(new Event('galleryUpdated'));
            fileInput.value = '';
        } catch (error) {
            console.error("Storage error:", error);
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                setPopupMessage("Storage limit exceeded! Files are too large.");
                setShowPopup(true);
            } else {
                setPopupMessage("An error occurred while saving.");
                setShowPopup(true);
            }
        }
    };

    const handleDeleteHomeImage = (id) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            const updatedImages = homeGalleryImages.filter(img => img.id !== id);
            setHomeGalleryImages(updatedImages);
            localStorage.setItem('homeGalleryImages', JSON.stringify(updatedImages));
            window.dispatchEvent(new Event('galleryUpdated'));
        }
    };

    const handleDownload = (src, filename) => {
        const link = document.createElement('a');
        link.href = src;
        link.download = filename || 'image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500;
                    const MAX_HEIGHT = 500;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

                    const newProfile = { ...adminProfile, image: dataUrl };
                    setAdminProfile(newProfile);
                    localStorage.setItem('adminProfile', JSON.stringify(newProfile));
                };
            };
        }
    };

    const handleRemoveProfileImage = () => {
        if (window.confirm("Are you sure you want to remove the profile photo?")) {
            const newProfile = { ...adminProfile, image: null };
            setAdminProfile(newProfile);
            localStorage.setItem('adminProfile', JSON.stringify(newProfile));
        }
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPopupMessage("Passwords do not match!");
            setShowPopup(true);
            return;
        }
        setPopupMessage("Password change functionality will be integrated with the database in the future.");
        setShowPopup(true);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    const renderDashboardContent = () => (
        <>
            <motion.div
                className="dashboard-header"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="header-left">
                    <button className="menu-toggle-btn" onClick={toggleSidebar}>
                        ☰
                    </button>
                    <div className="header-title">
                        <h1>Dashboard Overview</h1>
                        <p>Welcome back, Admin! Here's what's happening today.</p>
                    </div>
                </div>
                <div className="header-actions">
                    <div className="admin-profile">
                        {adminProfile.image ? (
                            <img src={adminProfile.image} alt="Admin" className="admin-avatar-img" />
                        ) : (
                            <div className="admin-avatar">AD</div>
                        )}
                        <span className="admin-name">{adminProfile.name}</span>
                    </div>
                </div>
            </motion.div>


        </>
    );

    // Drag and Drop Refs
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const handleDragStart = (e, position) => {
        dragItem.current = position;
    };

    const handleDragEnter = (e, position) => {
        dragOverItem.current = position;
    };

    const handleDragEnd = (e) => {
        const copyListItems = [...galleryImages];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);

        dragItem.current = null;
        dragOverItem.current = null;

        setGalleryImages(copyListItems);
        localStorage.setItem('galleryImages', JSON.stringify(copyListItems));
        window.dispatchEvent(new Event('galleryUpdated'));
    };

    const handleHomeDragEnd = (e) => {
        const copyListItems = [...homeGalleryImages];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);

        dragItem.current = null;
        dragOverItem.current = null;

        setHomeGalleryImages(copyListItems);
        localStorage.setItem('homeGalleryImages', JSON.stringify(copyListItems));
        window.dispatchEvent(new Event('galleryUpdated'));
    };

    const renderGalleryContent = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="gallery-manager"
        >
            <div className="dashboard-header">
                <div className="header-left">
                    <button className="menu-toggle-btn" onClick={toggleSidebar}>
                        ☰
                    </button>
                    <div className="header-title">
                        <h1>Gallery Management</h1>
                        <p>Manage photos and videos for your gallery.</p>
                    </div>
                </div>
            </div>

            <div className="admin-card add-image-section">
                <h3>Add New Media</h3>

                <div className="upload-type-selector">
                    <button
                        className={`type-btn ${uploadType === 'image' ? 'active' : ''}`}
                        onClick={() => setUploadType('image')}
                    >
                        📸 Photo
                    </button>
                    <button
                        className={`type-btn ${uploadType === 'video' ? 'active' : ''}`}
                        onClick={() => setUploadType('video')}
                    >
                        🎥 Video
                    </button>
                </div>

                <form onSubmit={handleAddMedia} className="add-image-form">
                    <div className="form-group">
                        <label>Upload {uploadType === 'image' ? 'Photos' : 'Videos'} from Device (Multiple allowed)</label>
                        <input
                            id="media-upload"
                            type="file"
                            accept={uploadType === 'image' ? "image/*" : "video/*"}
                            multiple
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary">
                        Add {uploadType === 'image' ? 'Photos' : 'Videos'}
                    </button>
                </form>
            </div>

            {uploadType === 'image' && (
                <>
                    <div className="media-section-header">
                        <h3>Photos ({galleryImages.length})</h3>
                    </div>
                    <div className="admin-gallery-grid">
                        {galleryImages.map((img, index) => (
                            <motion.div
                                layout
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                key={img.id}
                                className="admin-gallery-item"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileDrag={{ scale: 1.1, zIndex: 10 }}
                            >
                                <img src={img.src} alt="Gallery" />
                                <div className="item-actions">
                                    <button
                                        className="btn-download"
                                        title="Download"
                                        onClick={() => handleDownload(img.src, `gallery-${img.id}.png`)}
                                    >
                                        <DownloadIcon width={18} height={18} />
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteMedia(img.id, 'image')}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                        {galleryImages.length === 0 && (
                            <p className="no-images">No photos in gallery.</p>
                        )}
                    </div>
                </>
            )}

            {uploadType === 'video' && (
                <>
                    <div className="media-section-header video-header">
                        <h3>Videos ({galleryVideos.length})</h3>
                    </div>
                    <div className="admin-gallery-grid">
                        {galleryVideos.map((vid) => (
                            <motion.div
                                key={vid.id}
                                className="admin-gallery-item"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <video src={vid.src} controls className="admin-video-preview" />
                                <div className="item-actions">
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteMedia(vid.id, 'video')}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                        {galleryVideos.length === 0 && (
                            <p className="no-images">No videos in gallery.</p>
                        )}
                    </div>
                </>
            )}
        </motion.div>
    );

    const renderSettingsContent = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="settings-manager"
        >
            <div className="dashboard-header">
                <div className="header-left">
                    <button className="menu-toggle-btn" onClick={toggleSidebar}>
                        ☰
                    </button>
                    <div className="header-title">
                        <h1>Settings</h1>
                        <p>Manage your profile and security preferences.</p>
                    </div>
                </div>
            </div>

            <div className="settings-grid">
                <div className="admin-card settings-card">
                    <h3>Profile Settings</h3>
                    <div className="profile-upload-section">
                        <div className="current-avatar">
                            {adminProfile.image ? (
                                <img src={adminProfile.image} alt="Profile" />
                            ) : (
                                <div className="avatar-placeholder">AD</div>
                            )}
                        </div>
                        <div className="upload-controls">
                            <label className="btn-secondary">
                                Change Profile Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfileImageChange}
                                    hidden
                                />
                            </label>
                            {adminProfile.image && (
                                <button
                                    className="btn-remove-photo"
                                    onClick={handleRemoveProfileImage}
                                >
                                    Remove Photo
                                </button>
                            )}
                            <p className="help-text">Recommended: Square JPG, PNG</p>
                        </div>
                    </div>
                </div>

                <div className="admin-card settings-card">
                    <h3>Security</h3>
                    <form onSubmit={handlePasswordChange} className="settings-form">
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary">Change Password</button>
                    </form>
                </div>
            </div>
        </motion.div>
    );

    const renderHomeGalleryContent = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="gallery-manager"
        >
            <div className="dashboard-header">
                <div className="header-left">
                    <button className="menu-toggle-btn" onClick={toggleSidebar}>
                        ☰
                    </button>
                    <div className="header-title">
                        <h1>Homepage Gallery Management</h1>
                        <p>Manage images displayed on the home page gallery section.</p>
                    </div>
                </div>
            </div>

            <div className="admin-card add-image-section">
                <h3>Add New Images</h3>
                <form onSubmit={handleAddHomeImage} className="add-image-form">
                    <div className="form-group">
                        <label>Upload Photos from Device (Multiple allowed)</label>
                        <input
                            id="home-image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary">
                        Add Photos
                    </button>
                </form>
            </div>

            <div className="media-section-header">
                <h3>Homepage Photos ({homeGalleryImages.length})</h3>
            </div>

            <div className="admin-gallery-grid">
                {homeGalleryImages.map((img, index) => (
                    <motion.div
                        layout
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleHomeDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        key={img.id}
                        className="admin-gallery-item"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileDrag={{ scale: 1.1, zIndex: 10 }}
                    >
                        <img src={img.src} alt="Gallery" />
                        <div className="item-actions">
                            <button
                                className="btn-download"
                                title="Download"
                                onClick={() => handleDownload(img.src, `home-gallery-${img.id}.png`)}
                            >
                                <DownloadIcon width={18} height={18} />
                            </button>
                            <button
                                className="btn-delete"
                                onClick={() => handleDeleteHomeImage(img.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                ))}
                {homeGalleryImages.length === 0 && (
                    <p className="no-images">No photos in homepage gallery.</p>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className={`admin-dashboard ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Helmet>
                <title>Admin Dashboard | Venbha Plate Decors</title>
            </Helmet>

            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header-mobile">
                    <div className="sidebar-brand">VENBHA ADMIN</div>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>×</button>
                </div>
                <nav className="sidebar-nav">
                    <a
                        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                    >
                        <span className="nav-icon">📊</span> Dashboard
                    </a>

                    <div
                        className="nav-item-container"
                        onMouseEnter={() => setIsGalleryHovered(true)}
                        onMouseLeave={() => setIsGalleryHovered(false)}
                    >
                        <a
                            className={`nav-item ${activeTab === 'gallery' || activeTab === 'home-gallery' ? 'active' : ''}`}
                            onClick={() => setIsGalleryHovered(!isGalleryHovered)}
                        >
                            <span className="nav-icon">🖼️</span> Gallery
                            <span className="dropdown-arrow" style={{ marginLeft: 'auto', fontSize: '0.8em' }}>
                                {isGalleryHovered ? '▼' : '▶'}
                            </span>
                        </a>
                        {isGalleryHovered && (
                            <div className="sub-menu">
                                <a
                                    className={`sub-nav-item ${activeTab === 'gallery' ? 'active' : ''}`}
                                    onClick={() => { setActiveTab('gallery'); setIsSidebarOpen(false); }}
                                >
                                    Gallery Page
                                </a>
                                <a
                                    className={`sub-nav-item ${activeTab === 'home-gallery' ? 'active' : ''}`}
                                    onClick={() => { setActiveTab('home-gallery'); setIsSidebarOpen(false); }}
                                >
                                    Homepage Gallery
                                </a>
                            </div>
                        )}
                    </div>

                    <a
                        className={`nav-item ${activeTab === 'collections' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('collections'); setIsSidebarOpen(false); }}
                    >
                        <span className="nav-icon">📂</span> Collections
                    </a>
                    <a
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                    >
                        <span className="nav-icon">⚙️</span> Settings
                    </a>
                </nav>
            </aside>

            <main className="dashboard-main">
                {activeTab === 'dashboard' && renderDashboardContent()}
                {activeTab === 'gallery' && renderGalleryContent()}
                {activeTab === 'home-gallery' && renderHomeGalleryContent()}
                {activeTab === 'collections' && <div className="placeholder-tab">Collections Management Coming Soon</div>}
                {activeTab === 'settings' && renderSettingsContent()}
            </main>

            {/* Custom Popup Modal */}
            {showPopup && (
                <div className="popup-overlay" onClick={closePopup}>
                    <motion.div
                        className="popup-content"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <div className="popup-header">
                            <h3>Notification</h3>
                            <button className="close-popup-btn" onClick={closePopup}>×</button>
                        </div>
                        <div className="popup-body">
                            <p>{popupMessage}</p>
                        </div>
                        <div className="popup-footer">
                            <button className="popup-btn-primary" onClick={closePopup}>OK</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
