import React, { useState, useEffect, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { DownloadIcon } from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { uploadImageToStorage, uploadVideoToStorage, deleteImageFromStorage } from '../lib/storageUtils';
import { fetchGalleryImages, fetchGalleryVideos, fetchHomeGalleryImages, addGalleryItem, deleteGalleryItem, addHomeGalleryImage, deleteHomeGalleryImage, updateGalleryOrder, updateHomeGalleryOrder } from '../lib/databaseUtils';
import { fetchContactEntries, updateContactStatus, updateContactNotes, deleteContactEntry, updateContactWorkflowStatus } from '../lib/contactUtils';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, signOut, updatePassword } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Initialize activeTab from localStorage or default to 'dashboard'
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('adminActiveTab') || 'dashboard';
    });

    // Save activeTab to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('adminActiveTab', activeTab);
    }, [activeTab]);

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

    // Delete Confirmation Popup State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);

    const closePopup = () => setShowPopup(false);

    // Contact Entries State
    const [contactEntries, setContactEntries] = useState([]);

    // Notes Modal State
    const [notesModal, setNotesModal] = useState({
        isOpen: false,
        mode: 'edit', // 'edit' or 'view'
        entryId: null,
        notes: ''
    });

    // Export Modal State
    const [showExportModal, setShowExportModal] = useState(false);

    const openNotesModal = (entry, mode) => {
        setNotesModal({
            isOpen: true,
            mode: mode,
            entryId: entry.id,
            notes: entry.notes || ''
        });
    };

    const closeNotesModal = () => {
        setNotesModal({
            isOpen: false,
            mode: 'edit',
            entryId: null,
            notes: ''
        });
    };

    const handleNotesChange = (value) => {
        setNotesModal(prev => ({
            ...prev,
            notes: value
        }));
    };

    const handleSaveNotes = async () => {
        const result = await updateContactNotes(notesModal.entryId, notesModal.notes);

        if (result.success) {
            // Update local state
            setContactEntries(prev => prev.map(entry =>
                entry.id === notesModal.entryId ? { ...entry, notes: notesModal.notes } : entry
            ));
            setPopupMessage('Notes saved successfully!');
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 2000);
            closeNotesModal();
        } else {
            setPopupMessage('Failed to save notes');
            setShowPopup(true);
        }
    };

    const handleDeleteContact = (id) => {
        setDeleteItem({ id, handler: 'contact' });
        setShowDeleteConfirm(true);
    };


    const handleWorkflowStatusChange = async (id, newStatus) => {
        // Allow empty string (Select option) to update database to NULL
        const result = await updateContactWorkflowStatus(id, newStatus === '' ? null : newStatus);

        if (result.success) {
            // Update local state
            setContactEntries(prev => prev.map(entry =>
                entry.id === id ? { ...entry, workflow_status: newStatus === '' ? null : newStatus } : entry
            ));
            setPopupMessage('Status updated successfully!');
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 2000);
        } else {
            setPopupMessage('Failed to update status');
            setShowPopup(true);
        }
    };

    // Export Functions
    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Phone', 'Message', 'Date', 'Notes', 'Status'];
        const csvData = contactEntries.map(entry => [
            entry.name,
            entry.email,
            entry.phone,
            entry.message,
            new Date(entry.created_at).toLocaleString('en-IN'),
            entry.notes || '',
            entry.workflow_status || 'Not Set'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        downloadFile(csvContent, 'contact-enquiries.csv', 'text/csv');
        setShowExportModal(false);
        setPopupMessage('Exported to CSV successfully!');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000);
    };

    const exportToExcel = () => {
        const data = contactEntries.map(entry => ({
            'Name': entry.name,
            'Email': entry.email,
            'Phone': entry.phone,
            'Message': entry.message,
            'Date': new Date(entry.created_at).toLocaleString('en-IN'),
            'Notes': entry.notes || '',
            'Status': entry.workflow_status || 'Not Set'
        }));

        // Convert to CSV format (Excel can open CSV files)
        const headers = Object.keys(data[0] || {});
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${String(row[header]).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        downloadFile(csvContent, 'contact-enquiries.xlsx', 'application/vnd.ms-excel');
        setShowExportModal(false);
        setPopupMessage('Exported to Excel successfully!');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000);
    };

    const exportToJSON = () => {
        const data = contactEntries.map(entry => ({
            name: entry.name,
            email: entry.email,
            phone: entry.phone,
            message: entry.message,
            date: new Date(entry.created_at).toISOString(),
            notes: entry.notes || '',
            status: entry.workflow_status || 'Not Set'
        }));

        const jsonContent = JSON.stringify(data, null, 2);
        downloadFile(jsonContent, 'contact-enquiries.json', 'application/json');
        setShowExportModal(false);
        setPopupMessage('Exported to JSON successfully!');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000);
    };

    const downloadFile = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };



    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        // Load gallery data from Supabase on mount
        loadGalleryData();

        // Load contact entries from Supabase
        loadContactEntries();

        // Load profile from LocalStorage
        const storedProfile = localStorage.getItem('adminProfile');
        if (storedProfile) {
            setAdminProfile(JSON.parse(storedProfile));
        }
    }, []);

    // Mark messages as read when viewing Contact Inquiries
    useEffect(() => {
        if (activeTab === 'contact-inquiries' && contactEntries.length > 0) {
            markAllAsRead();
        }
    }, [activeTab]);

    const loadGalleryData = async () => {
        try {
            // Load gallery images
            const imagesResult = await fetchGalleryImages();
            if (imagesResult.success) {
                setGalleryImages(imagesResult.data);
            }

            // Load gallery videos
            const videosResult = await fetchGalleryVideos();
            if (videosResult.success) {
                setGalleryVideos(videosResult.data);
            }

            // Load home gallery images
            const homeResult = await fetchHomeGalleryImages();
            if (homeResult.success) {
                setHomeGalleryImages(homeResult.data);
            }
        } catch (error) {
            console.error('Error loading gallery data:', error);
        }
    };


    const loadContactEntries = async () => {
        try {
            const result = await fetchContactEntries();
            if (result.success) {
                setContactEntries(result.data);
            }
        } catch (error) {
            console.error('Error loading contact entries:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            // Get all new entries
            const newEntries = contactEntries.filter(entry => entry.status === 'new');

            // Update each to 'read' status
            for (const entry of newEntries) {
                await updateContactStatus(entry.id, 'read');
            }

            // Reload contact entries to update the UI
            await loadContactEntries();
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };


    const handleAddMedia = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('media-upload');
        const files = Array.from(fileInput.files);

        if (files.length === 0) return;

        setPopupMessage('Uploading and optimizing... Please wait.');
        setShowPopup(true);

        try {
            // Validate file sizes
            const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB in bytes
            const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

            for (const file of files) {
                if (uploadType === 'video') {
                    if (file.size > MAX_VIDEO_SIZE) {
                        throw new Error(`Video "${file.name}" is too large. Maximum size is 50MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                    }
                } else if (uploadType === 'image') {
                    if (file.size > MAX_IMAGE_SIZE) {
                        throw new Error(`Image "${file.name}" is too large. Maximum size is 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                    }
                }
            }

            const uploadPromises = files.map(async (file) => {
                let uploadResult;

                if (uploadType === 'image') {
                    // Upload and compress image
                    uploadResult = await uploadImageToStorage(file);
                } else {
                    // Upload video (no compression)
                    uploadResult = await uploadVideoToStorage(file);
                }

                if (!uploadResult.success) {
                    throw new Error(uploadResult.error.message || 'Upload failed');
                }

                // Add to database
                const dbResult = await addGalleryItem({
                    url: uploadResult.url,
                    storage_path: uploadResult.path,
                    type: uploadType,
                    alt: `Gallery ${uploadType}`
                });

                if (!dbResult.success) {
                    // If database insert fails, delete the uploaded file
                    await deleteImageFromStorage(uploadResult.path);
                    throw new Error(dbResult.error.message || 'Database error');
                }

                return dbResult.data;
            });

            const newItems = await Promise.all(uploadPromises);

            // Update state
            if (uploadType === 'image') {
                setGalleryImages([...newItems, ...galleryImages]);
            } else {
                setGalleryVideos([...newItems, ...galleryVideos]);
            }

            window.dispatchEvent(new Event('galleryUpdated'));
            fileInput.value = '';

            setPopupMessage(`Successfully uploaded ${files.length} ${uploadType}(s)!`);
            setTimeout(() => setShowPopup(false), 2000);
        } catch (error) {
            console.error("Upload error:", error);
            setPopupMessage(`Error: ${error.message || 'Failed to upload media'}`);
        }
    };

    const handleDeleteMedia = (id, type, storagePath) => {
        setDeleteItem({ id, type, storagePath, handler: 'media' });
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;

        try {
            if (deleteItem.handler === 'media') {
                // Delete from database
                const dbResult = await deleteGalleryItem(deleteItem.id);

                if (!dbResult.success) {
                    throw new Error('Failed to delete from database');
                }

                // Delete from storage
                if (deleteItem.storagePath) {
                    await deleteImageFromStorage(deleteItem.storagePath);
                }

                // Update state
                if (deleteItem.type === 'image') {
                    setGalleryImages(galleryImages.filter(img => img.id !== deleteItem.id));
                } else {
                    setGalleryVideos(galleryVideos.filter(vid => vid.id !== deleteItem.id));
                }

                window.dispatchEvent(new Event('galleryUpdated'));
                setPopupMessage('Item deleted successfully!');
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 2000);
            } else if (deleteItem.handler === 'home') {
                // Delete from database
                const dbResult = await deleteHomeGalleryImage(deleteItem.id);

                if (!dbResult.success) {
                    throw new Error('Failed to delete from database');
                }

                // Delete from storage
                if (deleteItem.storagePath) {
                    await deleteImageFromStorage(deleteItem.storagePath);
                }

                // Update state
                setHomeGalleryImages(homeGalleryImages.filter(img => img.id !== deleteItem.id));
                window.dispatchEvent(new Event('galleryUpdated'));

                setPopupMessage('Image deleted successfully!');
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 2000);
            } else if (deleteItem.handler === 'contact') {
                const result = await deleteContactEntry(deleteItem.id);

                if (result.success) {
                    setContactEntries(prev => prev.filter(entry => entry.id !== deleteItem.id));
                    setPopupMessage('Contact entry deleted successfully!');
                    setShowPopup(true);
                    setTimeout(() => setShowPopup(false), 2000);
                } else {
                    throw new Error('Failed to delete contact entry');
                }
            }
        } catch (error) {
            console.error('Delete error:', error);
            setPopupMessage('Error deleting item. Please try again.');
            setShowPopup(true);
        } finally {
            setShowDeleteConfirm(false);
            setDeleteItem(null);
        }
    };

    // Home Gallery Handlers
    const handleAddHomeImage = async (e) => {
        e.preventDefault();

        // Check current count from database
        const currentResult = await fetchHomeGalleryImages();
        const currentCount = currentResult.success ? currentResult.data.length : homeGalleryImages.length;

        if (currentCount >= 6) {
            setPopupMessage("Maximum images is 6 only. Please delete any existing image to upload new ones.");
            setShowPopup(true);
            return;
        }

        const fileInput = document.getElementById('home-image-upload');
        const files = Array.from(fileInput.files);

        if (files.length === 0) return;

        // Check if uploading these files would exceed the limit
        if (currentCount + files.length > 6) {
            setPopupMessage(`You can only upload ${6 - currentCount} more image(s). Maximum is 6 images total.`);
            setShowPopup(true);
            return;
        }

        setPopupMessage('Uploading and optimizing... Please wait.');
        setShowPopup(true);

        try {
            const uploadPromises = files.map(async (file) => {
                // Upload and compress image
                const uploadResult = await uploadImageToStorage(file, 'Gallery', 'home_images');

                if (!uploadResult.success) {
                    throw new Error(uploadResult.error.message || 'Upload failed');
                }

                // Add to database
                const dbResult = await addHomeGalleryImage({
                    url: uploadResult.url,
                    storage_path: uploadResult.path,
                    alt: 'Home Gallery Image'
                });

                if (!dbResult.success) {
                    // If database insert fails, delete the uploaded file
                    await deleteImageFromStorage(uploadResult.path);
                    throw new Error(dbResult.error.message || 'Database error');
                }

                return dbResult.data;
            });

            const newItems = await Promise.all(uploadPromises);
            setHomeGalleryImages([...newItems, ...homeGalleryImages]);

            window.dispatchEvent(new Event('galleryUpdated'));
            fileInput.value = '';

            setPopupMessage(`Successfully uploaded ${files.length} image(s)!`);
            setTimeout(() => setShowPopup(false), 2000);
        } catch (error) {
            console.error("Upload error:", error);
            setPopupMessage(`Error: ${error.message || 'Failed to upload images'}`);
        }
    };

    const handleDeleteHomeImage = (id, storagePath) => {
        setDeleteItem({ id, storagePath, handler: 'home' });
        setShowDeleteConfirm(true);
    };

    const handleDownload = (src, filename) => {
        const link = document.createElement('a');
        link.href = src;
        link.download = filename || 'image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Delete old image from storage if it exists (and is not base64)
                if (adminProfile.storagePath) {
                    await deleteImageFromStorage(adminProfile.storagePath, 'Gallery');
                }

                setPopupMessage('Uploading profile image...');
                setShowPopup(true);

                // Upload new image to 'profile_pics' folder
                const result = await uploadImageToStorage(file, 'Gallery', 'profile_pics');

                if (result.success) {
                    const newProfile = {
                        ...adminProfile,
                        image: result.url,
                        storagePath: result.path
                    };
                    setAdminProfile(newProfile);
                    localStorage.setItem('adminProfile', JSON.stringify(newProfile));

                    setPopupMessage('Profile updated successfully!');
                    setTimeout(() => setShowPopup(false), 2000);
                } else {
                    setPopupMessage('Failed to upload image');
                    setTimeout(() => setShowPopup(false), 2000);
                }
            } catch (error) {
                console.error("Profile upload error:", error);
                setPopupMessage("Error updating profile");
                setTimeout(() => setShowPopup(false), 2000);
            }
        }
    };

    const handleRemoveProfileImage = async () => {
        if (window.confirm("Are you sure you want to remove the profile photo?")) {
            try {
                if (adminProfile.storagePath) {
                    await deleteImageFromStorage(adminProfile.storagePath, 'Gallery');
                }

                const newProfile = { ...adminProfile, image: null, storagePath: null };
                setAdminProfile(newProfile);
                localStorage.setItem('adminProfile', JSON.stringify(newProfile));

                setPopupMessage('Profile photo removed');
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 2000);
            } catch (error) {
                console.error("Error removing profile photo:", error);
                setPopupMessage("Failed to remove photo");
                setShowPopup(true);
            }
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPopupMessage("Passwords do not match!");
            setShowPopup(true);
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPopupMessage("Password must be at least 6 characters long.");
            setShowPopup(true);
            return;
        }

        try {
            const { error } = await updatePassword(passwordForm.newPassword);

            if (error) {
                setPopupMessage(`Error updating password: ${error.message}`);
            } else {
                setPopupMessage("Password updated successfully!");
                setPasswordForm({ newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            setPopupMessage("An error occurred while updating password.");
        }

        setShowPopup(true);
    };

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            const { error } = await signOut();
            if (!error) {
                navigate('/admin_login');
            } else {
                setPopupMessage('Error logging out. Please try again.');
                setShowPopup(true);
            }
        }
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
                    <div className="notification-bell" onClick={() => setActiveTab('contact-inquiries')} title="Contact Enquiries">
                        <span className="bell-icon">🔔</span>
                        {contactEntries.filter(entry => entry.status === 'new').length > 0 && (
                            <span className="notification-badge">
                                {contactEntries.filter(entry => entry.status === 'new').length}
                            </span>
                        )}
                    </div>
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

            {/* Dashboard Cards Grid */}
            <motion.div
                className="stats-grid"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.div className="stat-card" variants={itemVariants}>
                    <div className="stat-info">
                        <h3>Contact Enquiries</h3>
                        <p className="stat-value">{contactEntries.length}</p>
                        <span className="stat-change">Messages</span>
                        <button
                            className="btn-primary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', marginTop: '10px', height: 'auto' }}
                            onClick={() => setActiveTab('contact-inquiries')}
                        >
                            View
                        </button>
                    </div>
                    <div className="stat-icon users">✉️</div>
                </motion.div>
            </motion.div>
        </>
    );

    const renderContactInquiries = () => (
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
                        <h1>Contact Enquiries</h1>
                        <p>View and manage messages from the contact form.</p>
                    </div>
                </div>
                <div className="header-actions">
                    <div className="notification-bell" onClick={() => setActiveTab('contact-inquiries')} title="Contact Enquiries">
                        <span className="bell-icon">🔔</span>
                        {contactEntries.filter(entry => entry.status === 'new').length > 0 && (
                            <span className="notification-badge">
                                {contactEntries.filter(entry => entry.status === 'new').length}
                            </span>
                        )}
                    </div>
                    <div className="admin-profile">
                        {adminProfile.image ? (
                            <img src={adminProfile.image} alt="Admin" className="admin-avatar-img" />
                        ) : (
                            <div className="admin-avatar">AD</div>
                        )}
                        <span className="admin-name">{adminProfile.name}</span>
                    </div>
                </div>
            </div>

            <motion.div
                className="recent-orders"
                variants={itemVariants}
                initial="hidden"
                animate="show"
            >
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Message</th>
                                <th>Date</th>
                                <th>Notes</th>
                                <th>Actions</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contactEntries.map((entry) => (
                                <tr key={entry.id}>
                                    <td data-label="Name">{entry.name}</td>
                                    <td data-label="Email">{entry.email}</td>
                                    <td data-label="Phone">{entry.phone}</td>
                                    <td data-label="Message" style={{ maxWidth: '300px', whiteSpace: 'normal' }}>{entry.message}</td>
                                    <td data-label="Date">{new Date(entry.created_at).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</td>
                                    <td data-label="Notes">
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            {entry.notes ? (
                                                <button
                                                    className="action-btn view-notes-btn"
                                                    onClick={() => openNotesModal(entry, 'view')}
                                                    title="View Notes"
                                                >
                                                    👁️
                                                </button>
                                            ) : (
                                                <button
                                                    className="action-btn edit-notes-btn"
                                                    onClick={() => openNotesModal(entry, 'edit')}
                                                    title="Add Notes"
                                                >
                                                    ✏️
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td data-label="Actions">
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <a
                                                href={`tel:${entry.phone}`}
                                                className="action-btn call-btn"
                                                title="Call"
                                            >
                                                📞
                                            </a>
                                            <a
                                                href={`mailto:${entry.email}`}
                                                className="action-btn email-btn"
                                                title="Send Email"
                                            >
                                                ✉️
                                            </a>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDeleteContact(entry.id)}
                                                title="Delete"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </td>
                                    <td data-label="Status">
                                        <select
                                            className="status-dropdown"
                                            value={entry.workflow_status || ''}
                                            onChange={(e) => handleWorkflowStatusChange(entry.id, e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            <option value="need_to_call">Need to call</option>
                                            <option value="need_to_share_pictures">Need to Share the pictures</option>
                                            <option value="waiting_for_confirmation">Waiting for confirmation</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {contactEntries.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center' }}>No enquiries found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Export Modal */}
            {showExportModal && (
                <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
                    <motion.div
                        className="modal-content export-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="modal-header">
                            <h2>Export Contact Enquiries</h2>
                            <button className="modal-close" onClick={() => setShowExportModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                                Choose your preferred export format:
                            </p>
                            <div className="export-options">
                                <button className="export-option-btn excel-btn" onClick={exportToExcel}>
                                    <span className="export-icon">📊</span>
                                    <span className="export-label">Excel (.xlsx)</span>
                                    <span className="export-desc">Best for spreadsheet analysis</span>
                                </button>
                                <button className="export-option-btn csv-btn" onClick={exportToCSV}>
                                    <span className="export-icon">📄</span>
                                    <span className="export-label">CSV (.csv)</span>
                                    <span className="export-desc">Universal format</span>
                                </button>
                                <button className="export-option-btn json-btn" onClick={exportToJSON}>
                                    <span className="export-icon">🔧</span>
                                    <span className="export-label">JSON (.json)</span>
                                    <span className="export-desc">For developers</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
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

    const handleDragEnd = async (e) => {
        const copyListItems = [...galleryImages];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);

        dragItem.current = null;
        dragOverItem.current = null;

        setGalleryImages(copyListItems);

        // Save new order to database
        await updateGalleryOrder(copyListItems);

        window.dispatchEvent(new Event('galleryUpdated'));
    };

    const handleHomeDragEnd = async (e) => {
        const copyListItems = [...homeGalleryImages];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);

        dragItem.current = null;
        dragOverItem.current = null;

        setHomeGalleryImages(copyListItems);

        // Save new order to database
        await updateHomeGalleryOrder(copyListItems);

        window.dispatchEvent(new Event('galleryUpdated'));
    };

    const handleVideoDragEnd = async (e) => {
        const copyListItems = [...galleryVideos];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);

        dragItem.current = null;
        dragOverItem.current = null;

        setGalleryVideos(copyListItems);

        // Save new order to database
        await updateGalleryOrder(copyListItems);

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
                <div className="header-actions">
                    <div className="notification-bell" onClick={() => setActiveTab('contact-inquiries')} title="Contact Enquiries">
                        <span className="bell-icon">🔔</span>
                        {contactEntries.filter(entry => entry.status === 'new').length > 0 && (
                            <span className="notification-badge">
                                {contactEntries.filter(entry => entry.status === 'new').length}
                            </span>
                        )}
                    </div>
                    <div className="admin-profile">
                        {adminProfile.image ? (
                            <img src={adminProfile.image} alt="Admin" className="admin-avatar-img" />
                        ) : (
                            <div className="admin-avatar">AD</div>
                        )}
                        <span className="admin-name">{adminProfile.name}</span>
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
                    <Reorder.Group
                        axis="y"
                        values={galleryImages}
                        onReorder={(newOrder) => {
                            setGalleryImages(newOrder);
                            updateGalleryOrder(newOrder);
                        }}
                        className="admin-gallery-grid"
                        style={{ listStyle: 'none', padding: 0 }}
                    >
                        {galleryImages.map((img) => (
                            <Reorder.Item
                                key={img.id}
                                value={img}
                                className="admin-gallery-item"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileDrag={{ scale: 1.1, zIndex: 10, cursor: 'grabbing' }}
                            >
                                <img src={img.url || img.src} alt="Gallery" />
                                <div className="item-actions">
                                    <button
                                        className="btn-download"
                                        title="Download"
                                        onClick={() => handleDownload(img.url || img.src, `gallery-${img.id}.png`)}
                                    >
                                        <DownloadIcon width={18} height={18} />
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteMedia(img.id, 'image', img.storage_path)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Reorder.Item>
                        ))}
                        {galleryImages.length === 0 && (
                            <p className="no-images">No photos in gallery.</p>
                        )}
                    </Reorder.Group>
                </>
            )}

            {uploadType === 'video' && (
                <>
                    <div className="media-section-header video-header">
                        <h3>Videos ({galleryVideos.length})</h3>
                    </div>
                    <Reorder.Group
                        axis="y"
                        values={galleryVideos}
                        onReorder={(newOrder) => {
                            setGalleryVideos(newOrder);
                            // Assuming similar update function for videos or generic one?
                            // Based on imports, only updateGalleryOrder exists (implies shared table or I need to check)
                            // Step 683 showed `fetchGalleryVideos`. Step 680 `databaseUtils` implies separate queries but maybe shared table?
                            // Line 8 in import snippet: `updateGalleryOrder` is imported. `updateHomeGalleryOrder`.
                            // Let's assume updateGalleryOrder handles arbitrary list of IDs if table schema is shared.
                            // Step 680: updateGalleryOrder updates 'gallery_images'. Type 'video' is in same table.
                            updateGalleryOrder(newOrder);
                        }}
                        className="admin-gallery-grid"
                        style={{ listStyle: 'none', padding: 0 }}
                    >
                        {galleryVideos.map((vid) => (
                            <Reorder.Item
                                key={vid.id}
                                value={vid}
                                className="admin-gallery-item"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileDrag={{ scale: 1.1, zIndex: 10, cursor: 'grabbing' }}
                            >
                                <video src={vid.url || vid.src} controls className="admin-video-preview" />
                                <div className="item-actions">
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteMedia(vid.id, 'video', vid.storage_path)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Reorder.Item>
                        ))}
                        {galleryVideos.length === 0 && (
                            <p className="no-images">No videos in gallery.</p>
                        )}
                    </Reorder.Group>
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
                <div className="header-actions">
                    <div className="notification-bell" onClick={() => setActiveTab('contact-inquiries')} title="Contact Enquiries">
                        <span className="bell-icon">🔔</span>
                        {contactEntries.filter(entry => entry.status === 'new').length > 0 && (
                            <span className="notification-badge">
                                {contactEntries.filter(entry => entry.status === 'new').length}
                            </span>
                        )}
                    </div>
                    <div className="admin-profile">
                        {adminProfile.image ? (
                            <img src={adminProfile.image} alt="Admin" className="admin-avatar-img" />
                        ) : (
                            <div className="admin-avatar">AD</div>
                        )}
                        <span className="admin-name">{adminProfile.name}</span>
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
                <div className="header-actions">
                    <div className="notification-bell" onClick={() => setActiveTab('contact-inquiries')} title="Contact Enquiries">
                        <span className="bell-icon">🔔</span>
                        {contactEntries.filter(entry => entry.status === 'new').length > 0 && (
                            <span className="notification-badge">
                                {contactEntries.filter(entry => entry.status === 'new').length}
                            </span>
                        )}
                    </div>
                    <div className="admin-profile">
                        {adminProfile.image ? (
                            <img src={adminProfile.image} alt="Admin" className="admin-avatar-img" />
                        ) : (
                            <div className="admin-avatar">AD</div>
                        )}
                        <span className="admin-name">{adminProfile.name}</span>
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

            <Reorder.Group
                axis="y"
                values={homeGalleryImages}
                onReorder={(newOrder) => {
                    setHomeGalleryImages(newOrder);
                    updateHomeGalleryOrder(newOrder);
                }}
                className="admin-gallery-grid"
                style={{ listStyle: 'none', padding: 0 }}
            >
                {homeGalleryImages.map((img) => (
                    <Reorder.Item
                        key={img.id}
                        value={img}
                        className="admin-gallery-item"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileDrag={{ scale: 1.1, zIndex: 10, cursor: 'grabbing' }}
                    >
                        <img src={img.url || img.src} alt="Gallery" />
                        <div className="item-actions">
                            <button
                                className="btn-download"
                                title="Download"
                                onClick={() => handleDownload(img.url || img.src, `home-gallery-${img.id}.png`)}
                            >
                                <DownloadIcon width={18} height={18} />
                            </button>
                            <button
                                className="btn-delete"
                                onClick={() => handleDeleteHomeImage(img.id, img.storage_path)}
                            >
                                Delete
                            </button>
                        </div>
                    </Reorder.Item>
                ))}
                {homeGalleryImages.length === 0 && (
                    <p className="no-images">No photos in homepage gallery.</p>
                )}
            </Reorder.Group>
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
                    <a
                        className="nav-item logout-btn"
                        onClick={handleLogout}
                        style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}
                    >
                        <span className="nav-icon">🚪</span> Logout
                    </a>
                </nav>
            </aside>

            <main className="dashboard-main">
                {activeTab === 'dashboard' && renderDashboardContent()}
                {activeTab === 'contact-inquiries' && renderContactInquiries()}
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

            {/* Delete Confirmation Popup */}
            {showDeleteConfirm && (
                <div className="popup-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <motion.div
                        className="popup-content delete-confirm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="popup-header">
                            <h3>⚠️ Confirm Delete</h3>
                        </div>
                        <div className="popup-body">
                            {deleteItem?.handler === 'contact' ? (
                                <p>Are you sure you want to delete this Message?</p>
                            ) : (
                                <>
                                    <p>Are you sure you want to delete this item?</p>
                                    <p className="warning-text">This action cannot be undone.</p>
                                </>
                            )}
                        </div>
                        <div className="popup-footer">
                            <button
                                className="popup-btn-secondary"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="popup-btn-danger"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Notes Modal */}
            {
                notesModal.isOpen && (
                    <div className="popup-overlay" onClick={closeNotesModal}>
                        <motion.div
                            className="popup-content notes-modal"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="popup-header">
                                <h3>{notesModal.mode === 'edit' ? '✏️ Edit Notes' : '👁️ View Notes'}</h3>
                                <button className="close-popup-btn" onClick={closeNotesModal}>×</button>
                            </div>
                            <div className="popup-body">
                                {notesModal.mode === 'edit' ? (
                                    <textarea
                                        className="notes-modal-textarea"
                                        placeholder="Add your notes here..."
                                        value={notesModal.notes}
                                        onChange={(e) => handleNotesChange(e.target.value)}
                                        rows="6"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="notes-view-content">
                                        {notesModal.notes || 'No notes available'}
                                    </div>
                                )}
                            </div>
                            <div className="popup-footer">
                                {notesModal.mode === 'edit' ? (
                                    <>
                                        <button className="popup-btn-secondary" onClick={closeNotesModal}>
                                            Cancel
                                        </button>
                                        <button className="popup-btn-primary" onClick={handleSaveNotes}>
                                            Save Notes
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="popup-btn-secondary"
                                            onClick={() => setNotesModal(prev => ({ ...prev, mode: 'edit' }))}
                                        >
                                            Edit
                                        </button>
                                        <button className="popup-btn-primary" onClick={closeNotesModal}>
                                            Close
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminDashboard;
