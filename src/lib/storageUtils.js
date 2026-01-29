import { supabase } from './supabaseClient';

/**
 * Compress and optimize an image file
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, maxWidth = 1920, maxHeight = 1080, quality = 0.85) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
    });
};

/**
 * Upload an image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} bucket - Storage bucket name
 * @param {string} folder - Folder path within bucket
 * @returns {Promise<{success: boolean, url?: string, path?: string, error?: any}>}
 */
export const uploadImageToStorage = async (file, bucket = 'Gallery', folder = 'images') => {
    try {
        // Compress image before upload
        const compressedFile = await compressImage(file);

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, compressedFile, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'image/jpeg'
            });

        if (error) {
            console.error('Upload error:', error);
            return { success: false, error };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return {
            success: true,
            url: publicUrl,
            path: filePath
        };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error };
    }
};

/**
 * Delete an image from Supabase Storage
 * @param {string} filePath - Path to the file in storage
 * @param {string} bucket - Storage bucket name
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const deleteImageFromStorage = async (filePath, bucket = 'Gallery') => {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error('Delete error:', error);
            return { success: false, error };
        }

        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error };
    }
};

/**
 * Upload video to Supabase Storage (no compression)
 * @param {File} file - The video file to upload
 * @param {string} bucket - Storage bucket name
 * @param {string} folder - Folder path within bucket
 * @returns {Promise<{success: boolean, url?: string, path?: string, error?: any}>}
 */
export const uploadVideoToStorage = async (file, bucket = 'Gallery', folder = 'videos') => {
    try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        // Determine mime type
        let mimeType = file.type;
        if (!mimeType) {
            const ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'mp4') mimeType = 'video/mp4';
            if (ext === 'webm') mimeType = 'video/webm';
            if (ext === 'mov') mimeType = 'video/quicktime';
        }

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: mimeType || 'video/mp4' // Default fallback
            });

        if (error) {
            console.error('Upload error:', error);
            return { success: false, error };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return {
            success: true,
            url: publicUrl,
            path: filePath
        };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error };
    }
};


