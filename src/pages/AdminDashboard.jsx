import React, { useState, useEffect, useRef } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { DownloadIcon } from '@radix-ui/react-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { uploadImageToStorage, deleteImageFromStorage, uploadVideoToStorage } from '../lib/storageUtils';

// ... (existing code)


import { fetchGalleryImages, fetchHomeGalleryImages, addGalleryItem, deleteGalleryItem, addHomeGalleryImage, deleteHomeGalleryImage, updateGalleryOrder, updateHomeGalleryOrder, fetchCollections, addCollection, deleteCollection, updateCollection, fetchDesigns, addDesign, deleteDesign, updateDesign, fetchGalleryVideos, addGalleryVideo, deleteGalleryVideo, updateGalleryVideosOrder } from '../lib/databaseUtils';
import { fetchContactEntries, updateContactStatus, updateContactNotes, deleteContactEntry, updateContactWorkflowStatus } from '../lib/contactUtils';
import { fetchCollectionEntries, updateCollectionWorkflowStatus as updateColStatus, updateCollectionNotes as updateColNotes, deleteCollectionEntry as deleteColEntry, updateCollectionStatus } from '../lib/collectionUtils';
import './AdminDashboard.css';
import logo from '../assets/venbha_logo_circled.png';



// Custom Sortable Item for Hold-to-Drag on Mobile
const SortableGalleryItem = ({ item, children, className, ...props }) => {
    const dragControls = useDragControls();
    const timeoutRef = useRef(null);

    const handleTouchStart = (event) => {
        timeoutRef.current = setTimeout(() => {
            if (navigator.vibrate) navigator.vibrate(50);
            dragControls.start(event);
        }, 2000);
    };

    const cancelPress = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    return (
        <Reorder.Item
            value={item}
            dragListener={false}
            dragControls={dragControls}
            className={className}
            {...props}
            onMouseDown={(e) => dragControls.start(e)}
            onTouchStart={handleTouchStart}
            onTouchEnd={cancelPress}
            onTouchMove={cancelPress}
        >
            {children}
        </Reorder.Item>
    );
};


const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, signOut, updatePassword } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { tab, subParam } = useParams();
    let activeTab = tab || 'dashboard';
    if (tab === 'collections' && subParam) {
        activeTab = 'collection-designs';
    }

    const setActiveTab = (newTab) => {
        navigate(`/admin_dashboard/${newTab}`);
    };



    // Initialize/Sync activeTab with localStorage
    useEffect(() => {
        if (!tab) {
            const saved = localStorage.getItem('adminActiveTab');
            if (saved && saved !== 'dashboard') {
                navigate(`/admin_dashboard/${saved}`, { replace: true });
            }
        } else {
            localStorage.setItem('adminActiveTab', tab);
        }
    }, [tab, navigate]);

    // Gallery State
    const [galleryImages, setGalleryImages] = useState([]);
    const [homeGalleryImages, setHomeGalleryImages] = useState([]);
    const [galleryVideos, setGalleryVideos] = useState([]); // Add this line
    const [galleryTab, setGalleryTab] = useState('photos');
    const [collections, setCollections] = useState([]);
    const [collectionForm, setCollectionForm] = useState({ name: '', image: null });
    const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);

    // Designs State
    const [selectedCollection, setSelectedCollection] = useState(() => {
        try {
            const saved = localStorage.getItem('adminSelectedCollection');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            return null;
        }
    });

    useEffect(() => {
        if (selectedCollection) {
            localStorage.setItem('adminSelectedCollection', JSON.stringify(selectedCollection));
        } else {
            localStorage.removeItem('adminSelectedCollection');
        }
    }, [selectedCollection]);
    const [designs, setDesigns] = useState([]);
    const [designForm, setDesignForm] = useState({ name: '', image: null, plate_count: '' });
    const [isSubmittingDesign, setIsSubmittingDesign] = useState(false);
    // Edit Design Modal State
    const [editDesignModal, setEditDesignModal] = useState({
        isOpen: false,
        id: null,
        name: '',
        plate_count: '',
        image: null,
        currentImage: '',
        storagePath: ''
    });



    // Refs
    const collectionImageInputRef = useRef(null);

    // Edit Collection Modal State
    const [editCollectionModal, setEditCollectionModal] = useState({
        isOpen: false,
        id: null,
        name: '',
        image: null,
        currentImage: '',
        storagePath: ''
    });

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
    const [collectionEntries, setCollectionEntries] = useState([]);

    // Notes Modal State
    const [notesModal, setNotesModal] = useState({
        isOpen: false,
        mode: 'edit', // 'edit' or 'view'
        entryId: null,
        notes: '',
        type: 'contact'
    });

    // Export Modal State
    const [showExportModal, setShowExportModal] = useState(false);

    const openNotesModal = (entry, mode, type = 'contact') => {
        setNotesModal({
            isOpen: true,
            mode: mode,
            entryId: entry.id,
            notes: entry.notes || '',
            type: type
        });
    };

    // Edit Collection Handlers
    const openEditCollectionModal = (collection) => {
        setEditCollectionModal({
            isOpen: true,
            id: collection.id,
            name: collection.name,
            image: null, // New image file if changing
            currentImage: collection.image,
            storagePath: collection.storage_path
        });
    };

    const closeEditCollectionModal = () => {
        setEditCollectionModal({
            isOpen: false,
            id: null,
            name: '',
            image: null,
            currentImage: '',
            storagePath: ''
        });
    };

    const handleUpdateCollection = async (e) => {
        e.preventDefault();
        setIsSubmittingCollection(true);
        setPopupMessage('Updating collection...');
        setShowPopup(true);

        try {
            let updates = { name: editCollectionModal.name };
            let newStoragePath = editCollectionModal.storagePath;

            if (editCollectionModal.image) {
                // User wants to change image
                // 1. Delete old image
                if (editCollectionModal.storagePath) {
                    await deleteImageFromStorage(editCollectionModal.storagePath);
                }

                // 2. Upload new image
                const uploadResult = await uploadImageToStorage(editCollectionModal.image, 'Gallery', 'collections');
                if (!uploadResult.success) throw new Error('Image upload failed');

                updates.image = uploadResult.url;
                updates.storage_path = uploadResult.path;
            }

            // 3. Update DB
            const result = await updateCollection(editCollectionModal.id, updates);

            if (result.success) {
                // Update local state
                setCollections(collections.map(c => c.id === editCollectionModal.id ? result.data : c));
                setPopupMessage('Collection updated successfully!');
                setTimeout(() => setShowPopup(false), 2000);
                closeEditCollectionModal();
            } else {
                throw new Error(result.error.message || 'Update failed');
            }
        } catch (error) {
            console.error(error);
            setPopupMessage('Failed to update collection.');
            setTimeout(() => setShowPopup(false), 2000);
        } finally {
            setIsSubmittingCollection(false);
        }
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
        let result;
        if (notesModal.type === 'collection') {
            result = await updateColNotes(notesModal.entryId, notesModal.notes);
            if (result.success) {
                setCollectionEntries(prev => prev.map(entry =>
                    entry.id === notesModal.entryId ? { ...entry, notes: notesModal.notes } : entry
                ));
            }
        } else {
            result = await updateContactNotes(notesModal.entryId, notesModal.notes);
            if (result.success) {
                setContactEntries(prev => prev.map(entry =>
                    entry.id === notesModal.entryId ? { ...entry, notes: notesModal.notes } : entry
                ));
            }
        }

        if (result.success) {
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

    const handleDeleteCollectionEntry = (id) => {
        setDeleteItem({ id, handler: 'collection_enquiry' });
        setShowDeleteConfirm(true);
    };


    const handleWorkflowStatusChange = async (id, newStatus) => {
        // Allow empty string (Select option) to update database to NULL
        const result = await updateContactWorkflowStatus(id, newStatus === '' ? null : newStatus);

        if (result.success) {
            setContactEntries(prev => prev.map(entry =>
                entry.id === id ? { ...entry, workflow_status: newStatus } : entry
            ));
            setPopupMessage('Status updated successfully!');
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 2000);
        } else {
            setPopupMessage('Failed to update status');
            setShowPopup(true);
        }
    };

    const handleCollectionWorkflowStatusChange = async (id, newStatus) => {
        const result = await updateColStatus(id, newStatus === '' ? null : newStatus);

        if (result.success) {
            setCollectionEntries(prev => prev.map(entry =>
                entry.id === id ? { ...entry, workflow_status: newStatus } : entry
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
        loadCollectionEntries();

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




            // Load home gallery images
            const homeResult = await fetchHomeGalleryImages();
            if (homeResult.success) {
                setHomeGalleryImages(homeResult.data);
            }

            // Load gallery videos
            const videosResult = await fetchGalleryVideos();
            if (videosResult.success) {
                setGalleryVideos(videosResult.data);
            }

            // Load collections
            const collectionsResult = await fetchCollections();
            if (collectionsResult.success) {
                setCollections(collectionsResult.data);
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

    const loadCollectionEntries = async () => {
        try {
            const result = await fetchCollectionEntries();
            if (result.success) {
                setCollectionEntries(result.data);
            }
        } catch (error) {
            console.error('Error loading collection entries:', error);
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

    const markAllCollectionAsRead = async () => {
        try {
            const newEntries = collectionEntries.filter(entry => entry.status === 'new');
            for (const entry of newEntries) {
                await updateCollectionStatus(entry.id, 'read');
            }
            if (newEntries.length > 0) {
                await loadCollectionEntries();
            }
        } catch (error) {
            console.error('Error marking collection entries as read:', error);
        }
    };

    // Mark collection entries as read when viewing Collection Inquiries
    useEffect(() => {
        if (activeTab === 'collection-inquiries' && collectionEntries.length > 0) {
            markAllCollectionAsRead();
        }
    }, [activeTab, collectionEntries]);

    const handleNotificationClick = () => {
        const hasNewContact = contactEntries.some(entry => entry.status === 'new');
        const hasNewCollection = collectionEntries.some(entry => entry.status === 'new');

        if (hasNewContact) {
            setActiveTab('contact-inquiries');
        } else if (hasNewCollection) {
            setActiveTab('collection-inquiries');
        } else {
            setActiveTab('contact-inquiries'); // Default
        }
    };



    // Collection Handlers
    const handleCollectionImageChange = (e) => {
        if (e.target.files[0]) {
            setCollectionForm({ ...collectionForm, image: e.target.files[0] });
        }
    };

    const handleAddCollection = async (e) => {
        e.preventDefault();
        if (!collectionForm.name || !collectionForm.image) {
            setPopupMessage('Please fill all fields');
            setShowPopup(true);
            return;
        }

        setIsSubmittingCollection(true);
        setPopupMessage('Adding collection...');
        setShowPopup(true);

        try {
            const uploadResult = await uploadImageToStorage(collectionForm.image, 'Gallery', 'collections');
            if (!uploadResult.success) {
                throw new Error('Image upload failed');
            }

            const addResult = await addCollection({
                name: collectionForm.name,
                image: uploadResult.url,
                storage_path: uploadResult.path
            });

            if (addResult.success) {
                setCollections([addResult.data, ...collections]);
                setCollectionForm({ name: '', image: null });
                if (collectionImageInputRef.current) {
                    collectionImageInputRef.current.value = '';
                }
                setPopupMessage('Collection added successfully!');
                setTimeout(() => setShowPopup(false), 2000);
            } else {
                // Cleanup uploaded image
                await deleteImageFromStorage(uploadResult.path);
                throw new Error(addResult.error.message || 'Database error');
            }
        } catch (error) {
            console.error(error);
            setPopupMessage('Failed to add collection.');
        } finally {
            setIsSubmittingCollection(false);
        }
    };

    const handleDeleteCollection = (id, storagePath) => {
        setDeleteItem({ id, storagePath, handler: 'collection' });
        setShowDeleteConfirm(true);
    };

    // Design Handlers
    const handleViewDesigns = (collection) => {
        navigate(`/admin_dashboard/collections/${encodeURIComponent(collection.name)}`);
    };


    const loadCollectionDesigns = async (collectionId) => {
        try {
            const result = await fetchDesigns(collectionId);
            if (result.success) {
                setDesigns(result.data);
            }
        } catch (error) {
            console.error('Error loading designs:', error);
        }
    };

    // Ensure designs are loaded when selectedCollection changes and we are in the detail view
    useEffect(() => {
        if (activeTab === 'collection-designs' && selectedCollection) {
            loadCollectionDesigns(selectedCollection.id);
        }
    }, [selectedCollection, activeTab]);

    const handleAddDesign = async (e) => {
        e.preventDefault();
        if (!designForm.name || !designForm.image || !designForm.plate_count || !selectedCollection) {
            setPopupMessage('Please fill all fields.');
            setShowPopup(true);
            return;
        }

        setIsSubmittingDesign(true);
        setPopupMessage('Adding design plate...');
        setShowPopup(true);

        try {
            // Upload image
            const uploadResult = await uploadImageToStorage(designForm.image, 'Gallery', 'designs');
            if (!uploadResult.success) throw new Error('Image upload failed');

            // Add to DB
            const addResult = await addDesign({
                collection_id: selectedCollection.id,
                name: designForm.name,
                image: uploadResult.url,
                storage_path: uploadResult.path,
                plate_count: designForm.plate_count // Pass as string
            });

            if (!addResult.success) {
                await deleteImageFromStorage(uploadResult.path);
                throw new Error(addResult.error.message || 'Database error');
            }

            // Reload designs from DB to ensure persistence
            await loadCollectionDesigns(selectedCollection.id);
            setDesignForm({ name: '', image: null, plate_count: '' });

            // Reset file input
            const fileInput = document.getElementById('design-image-input');
            if (fileInput) fileInput.value = '';

            setPopupMessage('Design plate added successfully!');
            setTimeout(() => setShowPopup(false), 2000);
        } catch (error) {
            console.error(error);
            setPopupMessage(error.message || 'Failed to add design.');
        } finally {
            setIsSubmittingDesign(false);
        }
    };

    const handleDeleteDesign = (id, storagePath) => {
        setDeleteItem({ id, storagePath, handler: 'design' });
        setShowDeleteConfirm(true);
    };

    const openEditDesignModal = (design) => {
        setEditDesignModal({
            isOpen: true,
            id: design.id,
            name: design.name,
            plate_count: design.plate_count,
            image: null,
            currentImage: design.image,
            storagePath: design.storage_path
        });
    };

    const closeEditDesignModal = () => {
        setEditDesignModal({
            isOpen: false,
            id: null,
            name: '',
            plate_count: '',
            image: null,
            currentImage: '',
            storagePath: ''
        });
    };

    const handleUpdateDesign = async (e) => {
        e.preventDefault();
        setIsSubmittingDesign(true);
        setPopupMessage('Updating design...');
        setShowPopup(true);

        try {
            let updates = {
                name: editDesignModal.name,
                plate_count: editDesignModal.plate_count // Pass as string, DB must be Text
            };

            if (editDesignModal.image) {
                // User wants to change image
                // 1. Delete old image
                if (editDesignModal.storagePath) {
                    await deleteImageFromStorage(editDesignModal.storagePath);
                }

                // 2. Upload new image
                const uploadResult = await uploadImageToStorage(editDesignModal.image, 'Gallery', 'designs');
                if (!uploadResult.success) throw new Error('Image upload failed');

                updates.image = uploadResult.url;
                updates.storage_path = uploadResult.path;
            }

            // 3. Update DB
            const result = await updateDesign(editDesignModal.id, updates);

            if (result.success) {
                // Update local state
                setDesigns(designs.map(d => d.id === editDesignModal.id ? result.data : d));
                setPopupMessage('Design updated successfully!');
                setTimeout(() => setShowPopup(false), 2000);
                closeEditDesignModal();
            } else {
                throw new Error(result.error.message || 'Update failed');
            }
        } catch (error) {
            console.error(error);
            setPopupMessage(error.message || 'Failed to update design.');
            setTimeout(() => setShowPopup(false), 2000);
        } finally {
            setIsSubmittingDesign(false);
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
            const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

            for (const file of files) {
                if (file.size > MAX_IMAGE_SIZE) {
                    throw new Error(`Image "${file.name}" is too large. Maximum size is 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                }
            }

            const uploadPromises = files.map(async (file) => {
                let uploadResult;

                // Upload and compress image
                uploadResult = await uploadImageToStorage(file);

                if (!uploadResult.success) {
                    throw new Error(uploadResult.error.message || 'Upload failed');
                }

                // Add to database
                const dbResult = await addGalleryItem({
                    url: uploadResult.url,
                    storage_path: uploadResult.path,
                    type: 'image',
                    alt: 'Gallery Image'
                });

                if (!dbResult.success) {
                    // If database insert fails, delete the uploaded file
                    await deleteImageFromStorage(uploadResult.path);
                    throw new Error(dbResult.error.message || 'Database error');
                }

                return dbResult.data;
            });

            const newItems = await Promise.all(uploadPromises);
            setGalleryImages([...newItems, ...galleryImages]);
            window.dispatchEvent(new Event('galleryUpdated'));

            setPopupMessage(`Successfully uploaded ${files.length} photo(s)!`);
            setTimeout(() => setShowPopup(false), 2000);
            fileInput.value = ''; // Reset input
        } catch (error) {
            console.error("Upload error:", error);
            setPopupMessage(`Error: ${error.message || 'Failed to upload media'}`);
        }
    };

    const handleDeleteMedia = (id, type, storagePath) => {
        setDeleteItem({ id, type, storagePath, handler: 'media' });
        setShowDeleteConfirm(true);
    };

    const handleAddVideo = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('video-upload');
        const files = Array.from(fileInput.files);

        if (files.length === 0) return;

        setPopupMessage('Uploading videos... Please wait.');
        setShowPopup(true);

        try {
            // Validate file sizes (e.g. 50MB limit for videos)
            const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

            for (const file of files) {
                if (file.size > MAX_VIDEO_SIZE) {
                    throw new Error(`Video "${file.name}" is too large. Maximum size is 50MB.`);
                }
            }

            const uploadPromises = files.map(async (file) => {
                // Upload video
                const uploadResult = await uploadVideoToStorage(file, 'Gallery', 'videos');

                if (!uploadResult.success) {
                    throw new Error(uploadResult.error.message || 'Upload failed');
                }

                // Add to database
                const dbResult = await addGalleryVideo({
                    url: uploadResult.url,
                    storage_path: uploadResult.path
                });

                if (!dbResult.success) {
                    await deleteImageFromStorage(uploadResult.path, 'Gallery'); // Reuse delete function as it works for any file path handle
                    throw new Error(dbResult.error.message || 'Database error');
                }

                return dbResult.data;
            });

            const newItems = await Promise.all(uploadPromises);
            setGalleryVideos([...newItems, ...galleryVideos]);
            window.dispatchEvent(new Event('galleryUpdated'));

            setPopupMessage(`Successfully uploaded ${files.length} video(s)!`);
            setTimeout(() => setShowPopup(false), 2000);
            fileInput.value = '';
        } catch (error) {
            console.error("Upload error:", error);
            setPopupMessage(`Error: ${error.message || 'Failed to upload videos'}`);
        }
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;

        try {
            if (deleteItem.handler === 'media') {
                if (deleteItem.type === 'video') {
                    // Delete video
                    const dbResult = await deleteGalleryVideo(deleteItem.id);
                    if (!dbResult.success) throw new Error('Failed to delete from database');

                    if (deleteItem.storagePath) {
                        await deleteImageFromStorage(deleteItem.storagePath);
                    }

                    setGalleryVideos(galleryVideos.filter(vid => vid.id !== deleteItem.id));
                    setPopupMessage('Video deleted successfully!');
                } else {
                    // Delete image
                    const dbResult = await deleteGalleryItem(deleteItem.id);

                    if (!dbResult.success) {
                        throw new Error('Failed to delete from database');
                    }

                    // Delete from storage
                    if (deleteItem.storagePath) {
                        await deleteImageFromStorage(deleteItem.storagePath);
                    }

                    // Update state
                    setGalleryImages(galleryImages.filter(img => img.id !== deleteItem.id));
                    setPopupMessage('Item deleted successfully!');
                }

                window.dispatchEvent(new Event('galleryUpdated'));
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
            } else if (deleteItem.handler === 'collection') {
                // Delete from database
                const dbResult = await deleteCollection(deleteItem.id);

                if (!dbResult.success) {
                    throw new Error('Failed to delete from database');
                }

                // Delete from storage
                if (deleteItem.storagePath) {
                    await deleteImageFromStorage(deleteItem.storagePath);
                }

                // Update state
                setCollections(collections.filter(c => c.id !== deleteItem.id));
                setPopupMessage('Collection deleted successfully!');
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
            } else if (deleteItem.handler === 'collection_enquiry') {
                const result = await deleteColEntry(deleteItem.id);

                if (result.success) {
                    setCollectionEntries(prev => prev.filter(entry => entry.id !== deleteItem.id));
                    setPopupMessage('Collection entry deleted successfully!');
                    setShowPopup(true);
                    setTimeout(() => setShowPopup(false), 2000);
                } else {
                    throw new Error('Failed to delete collection entry');
                }
            } else if (deleteItem.handler === 'design') {
                const dbResult = await deleteDesign(deleteItem.id);
                if (!dbResult.success) throw new Error('Failed to delete from database');

                if (deleteItem.storagePath) {
                    await deleteImageFromStorage(deleteItem.storagePath);
                }

                setDesigns(designs.filter(d => d.id !== deleteItem.id));
                setPopupMessage('Design deleted successfully!');
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 2000);
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

    const handleMoveItem = (index, direction, listType) => {
        let items = [];
        let setItems = null;
        let updateDb = null;

        if (listType === 'image') {
            items = [...galleryImages];
            setItems = setGalleryImages;
            updateDb = updateGalleryOrder;

        } else if (listType === 'home') {
            items = [...homeGalleryImages];
            setItems = setHomeGalleryImages;
            updateDb = updateHomeGalleryOrder;
        } else if (listType === 'video') {
            items = [...galleryVideos];
            setItems = setGalleryVideos;
            updateDb = updateGalleryVideosOrder;
        }

        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= items.length) return;

        // Swap
        [items[index], items[newIndex]] = [items[newIndex], items[index]];

        setItems(items);
        updateDb(items);
    };

    const handleDeleteHomeImage = (id, storagePath) => {
        setDeleteItem({ id, storagePath, handler: 'home' });
        setShowDeleteConfirm(true);
    };



    const handleDownload = async (src, filename) => {
        try {
            setPopupMessage('Downloading...');
            setShowPopup(true);

            const response = await fetch(src);
            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setTimeout(() => setShowPopup(false), 1000);
        } catch (error) {
            console.error('Download failed:', error);
            setPopupMessage('Download failed. Opening in new tab...');
            setTimeout(() => setShowPopup(false), 2000);

            // Fallback
            window.open(src, '_blank');
        }
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



    const renderContactInquiries = () => {
        const filteredEntries = contactEntries.filter(entry => !entry.message || !entry.message.startsWith('[Collection Enquiry]'));
        return (
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
                        <div className="notification-bell" onClick={handleNotificationClick} title="New Enquiries">
                            <span className="bell-icon">🔔</span>
                            {(contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length) > 0 && (
                                <span className="notification-badge">
                                    {contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length}
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
                        <table className="contact-enquiries-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th>Message</th>
                                    <th>Date</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((entry) => (
                                    <tr key={entry.id}>
                                        <td data-label="Name">{entry.name}</td>
                                        <td data-label="Contact">
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '500' }}>{entry.phone}</span>
                                                <span style={{ fontSize: '0.85rem', color: '#666' }}>{entry.email}</span>
                                            </div>
                                        </td>
                                        <td data-label="Message">{entry.message}</td>
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
                                                        onClick={() => openNotesModal(entry, 'view', 'contact')}
                                                        title="View Notes"
                                                    >
                                                        👁️
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="action-btn edit-notes-btn"
                                                        onClick={() => openNotesModal(entry, 'edit', 'contact')}
                                                        title="Add Notes"
                                                    >
                                                        ✏️
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td data-label="Actions">
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
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
                                {filteredEntries.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center' }}>No enquiries found.</td>
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
    };

    const renderCollectionInquiries = () => {
        const filteredEntries = collectionEntries;
        return (
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
                            <h1>Collection Enquiries</h1>
                            <p>View and manage enquiries from the collections page.</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <div className="notification-bell" onClick={handleNotificationClick} title="New Enquiries">
                            <span className="bell-icon">🔔</span>
                            {(contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length) > 0 && (
                                <span className="notification-badge">
                                    {contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length}
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
                                    <th>Contact</th>
                                    <th>Design Info</th>
                                    <th>Message</th>
                                    <th>Date</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((entry) => (
                                    <tr key={entry.id}>
                                        <td data-label="Name">{entry.name}</td>
                                        <td data-label="Contact">
                                            <div className="cell-content">
                                                <div style={{ fontWeight: '500' }}>{entry.phone}</div>
                                                <div style={{ fontSize: '0.85em', color: '#666' }}>{entry.email}</div>
                                            </div>
                                        </td>
                                        <td data-label="Design Info">
                                            <div className="cell-content">
                                                <div style={{ fontWeight: 'bold', color: '#be185d' }}>{entry.design_name}</div>
                                                {entry.selected_sets && <div style={{ fontSize: '0.9em' }}>Sets: {entry.selected_sets}</div>}
                                                {entry.event_date && <div style={{ fontSize: '0.9em', color: '#666' }}>Event: {new Date(entry.event_date).toLocaleDateString('en-IN')}</div>}
                                            </div>
                                        </td>
                                        <td data-label="Message">{entry.message}</td>
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
                                                        onClick={() => openNotesModal(entry, 'view', 'collection')}
                                                        title="View Notes"
                                                    >
                                                        👁️
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="action-btn edit-notes-btn"
                                                        onClick={() => openNotesModal(entry, 'edit', 'collection')}
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
                                                    onClick={() => handleDeleteCollectionEntry(entry.id)}
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
                                                onChange={(e) => handleCollectionWorkflowStatusChange(entry.id, e.target.value)}
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
                                {filteredEntries.length === 0 && (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center' }}>No collection enquiries found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Export Modal */}
                {
                    showExportModal && (
                        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
                            <motion.div
                                className="modal-content export-modal"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="modal-header">
                                    <h2>Export Collection Enquiries</h2>
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
                    )
                }
            </motion.div >
        );
    };

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

    // -- RESTORED RENDER FUNCTIONS --
    const renderDashboardContent = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="dashboard-overview"
        >
            <div className="dashboard-header">
                <div className="header-left">
                    <button className="menu-toggle-btn" onClick={toggleSidebar}>☰</button>
                    <div className="header-title">
                        <h1>Dashboard Overview</h1>
                    </div>
                </div>
                <div className="header-actions">
                    <div className="notification-bell" onClick={handleNotificationClick} title="New Enquiries">
                        <span className="bell-icon">🔔</span>
                        {(contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length) > 0 && (
                            <span className="notification-badge">
                                {contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length}
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
            <div className="stats-grid">
                <div className="stat-card" onClick={() => setActiveTab('contact-inquiries')}>
                    <div className="stat-info">
                        <h3>Contact Enquiries</h3>
                        <p className="stat-value">{contactEntries.filter(e => !e.message || !e.message.startsWith('[Collection Enquiry]')).length}</p>
                    </div>
                    <button className="view-more-btn">View More →</button>
                </div>

                <div className="stat-card" onClick={() => setActiveTab('collection-inquiries')}>
                    <div className="stat-info">
                        <h3>Collection Enquiries</h3>
                        <p className="stat-value">{collectionEntries.length}</p>
                    </div>
                    <button className="view-more-btn">View More →</button>
                </div>
            </div>
        </motion.div>
    );

    const renderCollectionsContent = () => {
        const moveCollection = (index, direction) => {
            if (direction === 'up' && index === 0) return;
            if (direction === 'down' && index === collections.length - 1) return;

            const newCollections = [...collections];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;

            // Swap
            [newCollections[index], newCollections[targetIndex]] = [newCollections[targetIndex], newCollections[index]];

            setCollections(newCollections);
            // TODO: Call backend update API if available
        };

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="gallery-manager">
                <div className="dashboard-header">
                    <div className="header-left">
                        <button className="menu-toggle-btn" onClick={toggleSidebar}>☰</button>
                        <div className="header-title"><h1>Collections</h1></div>
                    </div>
                    <div className="header-actions">
                        <div className="notification-bell" onClick={handleNotificationClick} title="New Enquiries">
                            <span className="bell-icon">🔔</span>
                            {(contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length) > 0 && (
                                <span className="notification-badge">
                                    {contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length}
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
                    <h3>Add New Collection</h3>
                    <form onSubmit={handleAddCollection} className="add-image-form">
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" value={collectionForm.name} onChange={e => setCollectionForm({ ...collectionForm, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Image</label>
                            <input id="collection-image-input" type="file" accept="image/*" onChange={handleCollectionImageChange} ref={collectionImageInputRef} required />
                        </div>
                        <button type="submit" className="btn-primary" disabled={isSubmittingCollection}>Add Collection</button>
                    </form>
                </div>
                <div className="admin-gallery-grid">
                    {collections.map((col, index) => (
                        <div key={col.id} className="admin-gallery-item collection-card">
                            <div className="reorder-arrows-top-left">
                                <button
                                    className="btn-arrow"
                                    onClick={() => moveCollection(index, 'up')}
                                    disabled={index === 0}
                                    title="Move Left"
                                >
                                    ←
                                </button>
                                <button
                                    className="btn-arrow"
                                    onClick={() => moveCollection(index, 'down')}
                                    disabled={index === collections.length - 1}
                                    title="Move Right"
                                >
                                    →
                                </button>
                            </div>
                            <img src={col.image} alt={col.name} />
                            <div className="collection-overlay-center">
                                <button className="btn-add-designs" onClick={() => handleViewDesigns(col)}><span>+</span> Add Designs</button>
                            </div>
                            <div className="item-actions">
                                <div className="collection-name-text">{col.name}</div>
                                <div className="collection-action-btns">
                                    <button className="btn-edit" onClick={() => openEditCollectionModal(col)}>✏️</button>
                                    <button className="btn-delete" onClick={() => handleDeleteCollection(col.id, col.storage_path)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {editCollectionModal.isOpen && (
                    <div className="popup-overlay" onClick={closeEditCollectionModal}>
                        <motion.div className="popup-content" onClick={e => e.stopPropagation()}>
                            <div className="popup-header"><h3>Edit Collection</h3><button className="close-popup-btn" onClick={closeEditCollectionModal}>×</button></div>
                            <div className="popup-body">
                                <form onSubmit={handleUpdateCollection} id="edit-collection-form" className="popup-form">
                                    <div className="popup-form-group">
                                        <label className="popup-label">Name</label>
                                        <input
                                            type="text"
                                            className="popup-input"
                                            value={editCollectionModal.name}
                                            onChange={e => setEditCollectionModal({ ...editCollectionModal, name: e.target.value })}
                                            required
                                            placeholder="Collection Name"
                                        />
                                    </div>
                                    <div className="popup-form-group">
                                        <label className="popup-label">Update Image</label>
                                        <input
                                            type="file"
                                            className="popup-file-input"
                                            onChange={e => setEditCollectionModal({ ...editCollectionModal, image: e.target.files[0] })}
                                            accept="image/*"
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="popup-footer">
                                <button type="submit" form="edit-collection-form" className="popup-btn-primary">Update</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        );
    };

    const renderCollectionDesignsContent = () => {
        if (!selectedCollection) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    Loading collection designs...
                </div>
            );
        }

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="gallery-manager">
                <div className="dashboard-header">
                    <div className="header-left">
                        <button className="menu-toggle-btn" onClick={toggleSidebar}>☰</button>
                        <div className="header-title">
                            <button style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginRight: '10px' }} onClick={() => setActiveTab('collections')}>Collections &gt;</button>
                            <h1>{selectedCollection.name} Designs</h1>
                        </div>
                    </div>
                    <div className="header-actions">
                        <div className="notification-bell" onClick={handleNotificationClick} title="New Enquiries">
                            <span className="bell-icon">🔔</span>
                            {(contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length) > 0 && (
                                <span className="notification-badge">
                                    {contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length}
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
                    <h3>Add Design Plate</h3>
                    <form onSubmit={handleAddDesign} className="add-image-form">
                        <div className="form-group"><label>Name</label><input type="text" value={designForm.name} onChange={e => setDesignForm({ ...designForm, name: e.target.value })} required /></div>
                        <div className="form-group"><label>Set Count (e.g. 5, 7)</label><input type="text" value={designForm.plate_count} onChange={e => setDesignForm({ ...designForm, plate_count: e.target.value })} required /></div>
                        <div className="form-group"><label>Image</label><input id="design-image-input" type="file" accept="image/*" onChange={e => setDesignForm({ ...designForm, image: e.target.files[0] })} required /></div>
                        <button type="submit" className="btn-primary" disabled={isSubmittingDesign}>Add</button>
                    </form>
                </div>
                <div className="admin-gallery-grid">
                    {designs.map(d => (
                        <div key={d.id} className="admin-gallery-item collection-card">
                            <img src={d.image} alt={d.name} />
                            <div className="design-item-actions">
                                <div className="design-info-text">
                                    <strong>{d.name}</strong>
                                    <div className="set-count-badge">{d.plate_count} sets</div>
                                </div>
                                <div className="action-buttons-row">
                                    <button className="btn-edit" onClick={() => openEditDesignModal(d)} title="Edit">✏️</button>
                                    <button className="btn-delete" onClick={() => handleDeleteDesign(d.id, d.storage_path)} title="Delete">🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {
                    editDesignModal.isOpen && (
                        <div className="popup-overlay" onClick={closeEditDesignModal}>
                            <motion.div className="popup-content" onClick={e => e.stopPropagation()}>
                                <div className="popup-header"><h3>Edit Design Plate</h3><button className="close-popup-btn" onClick={closeEditDesignModal}>×</button></div>
                                <div className="popup-body">
                                    <form onSubmit={handleUpdateDesign} id="edit-design-form" className="popup-form">
                                        <div className="popup-form-group">
                                            <label className="popup-label">Name</label>
                                            <input
                                                type="text"
                                                className="popup-input"
                                                value={editDesignModal.name}
                                                onChange={e => setEditDesignModal({ ...editDesignModal, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="popup-form-group">
                                            <label className="popup-label">Set Count (e.g. 5, 7)</label>
                                            <input
                                                type="text"
                                                className="popup-input"
                                                value={editDesignModal.plate_count}
                                                onChange={e => setEditDesignModal({ ...editDesignModal, plate_count: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="popup-form-group">
                                            <label className="popup-label">Update Image</label>
                                            <input
                                                type="file"
                                                className="popup-file-input"
                                                onChange={e => setEditDesignModal({ ...editDesignModal, image: e.target.files[0] })}
                                                accept="image/*"
                                            />
                                            <p className="help-text">Leave empty to keep current image</p>
                                        </div>
                                    </form>
                                </div>
                                <div className="popup-footer">
                                    <button type="submit" form="edit-design-form" className="popup-btn-primary" disabled={isSubmittingDesign}>
                                        {isSubmittingDesign ? 'Updating...' : 'Update Design'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </motion.div >
        );
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
                    <div className="notification-bell" onClick={handleNotificationClick} title="New Enquiries">
                        <span className="bell-icon">🔔</span>
                        {(contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length) > 0 && (
                            <span className="notification-badge">
                                {contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length}
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

            {/* Sub-tabs for Gallery */}
            <div className="tab-navigation" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button
                    className={`tab-btn ${galleryTab === 'photos' ? 'active' : ''}`}
                    onClick={() => setGalleryTab('photos')}
                    style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', border: 'none', background: galleryTab === 'photos' ? '#c2185b' : '#eee', color: galleryTab === 'photos' ? 'white' : 'black' }}
                >
                    Photos
                </button>
                <button
                    className={`tab-btn ${galleryTab === 'videos' ? 'active' : ''}`}
                    onClick={() => setGalleryTab('videos')}
                    style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', border: 'none', background: galleryTab === 'videos' ? '#c2185b' : '#eee', color: galleryTab === 'videos' ? 'white' : 'black' }}
                >
                    Videos
                </button>
            </div>

            {/* Photos Section */}
            {galleryTab === 'photos' && (
                <>
                    <div className="admin-card add-image-section">
                        <h3>Add New Photos</h3>
                        <form onSubmit={handleAddMedia} className="add-image-form">
                            <div className="form-group">
                                <label>Upload Photos (Multiple allowed)</label>
                                <input
                                    id="media-upload"
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
                        {galleryImages.map((img, index) => (
                            <SortableGalleryItem
                                key={img.id}
                                item={img}
                                className="admin-gallery-item"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileDrag={{ scale: 1.1, zIndex: 10, cursor: 'grabbing' }}
                            >
                                <img src={img.url || img.src} alt="Gallery" />
                                <div className="item-actions">
                                    <button
                                        className="btn-move"
                                        title="Move Backward"
                                        onClick={(e) => { e.stopPropagation(); handleMoveItem(index, -1, 'image'); }}
                                        disabled={index === 0}
                                        style={{ opacity: index === 0 ? 0.5 : 1, cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                                    >
                                        ←
                                    </button>
                                    <button
                                        className="btn-move"
                                        title="Move Forward"
                                        onClick={(e) => { e.stopPropagation(); handleMoveItem(index, 1, 'image'); }}
                                        disabled={index === galleryImages.length - 1}
                                        style={{ opacity: index === galleryImages.length - 1 ? 0.5 : 1, cursor: index === galleryImages.length - 1 ? 'not-allowed' : 'pointer' }}
                                    >
                                        →
                                    </button>
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
                                <div className="mobile-reorder-controls">
                                    <button
                                        type="button"
                                        className="mobile-reorder-btn"
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        onClick={(e) => { e.stopPropagation(); handleMoveItem(index, -1, 'image'); }}
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        className="mobile-reorder-btn"
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        onClick={(e) => { e.stopPropagation(); handleMoveItem(index, 1, 'image'); }}
                                    >
                                        ↓
                                    </button>
                                </div>
                            </SortableGalleryItem>
                        ))}
                        {galleryImages.length === 0 && (
                            <p className="no-images">No photos in gallery.</p>
                        )}
                    </Reorder.Group>

                </>
            )}

            {/* Videos Section */}
            {galleryTab === 'videos' && (
                <>
                    <div className="admin-card add-image-section">
                        <h3>Add New Videos</h3>
                        <form onSubmit={handleAddVideo} className="add-image-form">
                            <div className="form-group">
                                <label>Upload Videos (Multiple allowed, Max 50MB each)</label>
                                <input
                                    id="video-upload"
                                    type="file"
                                    accept="video/*"
                                    multiple
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary">
                                Add Videos
                            </button>
                        </form>
                    </div>

                    <div className="media-section-header">
                        <h3>Videos ({galleryVideos.length})</h3>
                    </div>
                    <div className="admin-gallery-grid">
                        {galleryVideos.map((video, index) => (
                            <div key={video.id} className="admin-gallery-item video-card">
                                <video
                                    src={video.url}
                                    controls
                                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
                                />
                                <div className="item-actions video-controls">
                                    <button
                                        className="video-btn-move"
                                        title="Move Backward"
                                        onClick={(e) => { e.stopPropagation(); handleMoveItem(index, -1, 'video'); }}
                                        disabled={index === 0}
                                    >
                                        ←
                                    </button>
                                    <button
                                        className="video-btn-move"
                                        title="Move Forward"
                                        onClick={(e) => { e.stopPropagation(); handleMoveItem(index, 1, 'video'); }}
                                        disabled={index === galleryVideos.length - 1}
                                    >
                                        →
                                    </button>
                                    <button
                                        className="video-btn-delete"
                                        onClick={() => handleDeleteMedia(video.id, 'video', video.storage_path)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {galleryVideos.length === 0 && (
                        <p className="no-images">No videos in gallery.</p>
                    )}
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
                    <div className="notification-bell" onClick={handleNotificationClick} title="New Enquiries">
                        <span className="bell-icon">🔔</span>
                        {(contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length) > 0 && (
                            <span className="notification-badge">
                                {contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length}
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
                    <div className="notification-bell" onClick={handleNotificationClick} title="New Enquiries">
                        <span className="bell-icon">🔔</span>
                        {(contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length) > 0 && (
                            <span className="notification-badge">
                                {contactEntries.filter(entry => entry.status === 'new').length + collectionEntries.filter(entry => entry.status === 'new').length}
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
                {homeGalleryImages.map((img, index) => (
                    <SortableGalleryItem
                        key={img.id}
                        item={img}
                        className="admin-gallery-item"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileDrag={{ scale: 1.1, zIndex: 10, cursor: 'grabbing' }}
                    >
                        <img src={img.url || img.src} alt="Gallery" />
                        <div className="item-actions">
                            <button
                                className="btn-move"
                                title="Move Backward"
                                onClick={(e) => { e.stopPropagation(); handleMoveItem(index, -1, 'home'); }}
                                disabled={index === 0}
                                style={{ opacity: index === 0 ? 0.5 : 1, cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                            >
                                ←
                            </button>
                            <button
                                className="btn-move"
                                title="Move Forward"
                                onClick={(e) => { e.stopPropagation(); handleMoveItem(index, 1, 'home'); }}
                                disabled={index === homeGalleryImages.length - 1}
                                style={{ opacity: index === homeGalleryImages.length - 1 ? 0.5 : 1, cursor: index === homeGalleryImages.length - 1 ? 'not-allowed' : 'pointer' }}
                            >
                                →
                            </button>
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
                        <div className="mobile-reorder-controls">
                            <button
                                type="button"
                                className="mobile-reorder-btn"
                                onPointerDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); handleMoveItem(index, -1, 'home'); }}
                            >
                                ↑
                            </button>
                            <button
                                type="button"
                                className="mobile-reorder-btn"
                                onPointerDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); handleMoveItem(index, 1, 'home'); }}
                            >
                                ↓
                            </button>
                        </div>
                    </SortableGalleryItem>
                ))}
                {homeGalleryImages.length === 0 && (
                    <p className="no-images">No photos in homepage gallery.</p>
                )}
            </Reorder.Group>
        </motion.div>
    );

    // Sync selectedCollection from URL param (Moved to bottom to ensure handlers are defined)
    useEffect(() => {
        if (tab === 'collections' && subParam && collections.length > 0) {
            try {
                const decodedName = decodeURIComponent(subParam);
                const target = collections.find(c => c.name === decodedName);
                if (target) {
                    if (!selectedCollection || selectedCollection.id !== target.id) {
                        setSelectedCollection(target);
                    }
                }
            } catch (e) {
                console.error("URL Parameter Error:", e);
            }
        }
    }, [tab, subParam, collections, selectedCollection]);

    return (
        <div className={`admin-dashboard ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Helmet>
                <title>Admin Dashboard | Venbha Plate Decors</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header-mobile">
                    <div className="sidebar-brand">
                        <img src={logo} alt="Venbha Admin" className="sidebar-logo" />
                    </div>
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
                {activeTab === 'collection-inquiries' && renderCollectionInquiries()}
                {activeTab === 'gallery' && renderGalleryContent()}
                {activeTab === 'home-gallery' && renderHomeGalleryContent()}
                {activeTab === 'collections' && renderCollectionsContent()}
                {activeTab === 'collection-designs' && renderCollectionDesignsContent()}
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
