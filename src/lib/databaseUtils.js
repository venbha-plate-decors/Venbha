import { supabase } from './supabaseClient';

/**
 * Fetch all gallery images from database
 * @returns {Promise<{success: boolean, data?: array, error?: any}>}
 */
export const fetchGalleryImages = async () => {
    try {
        const { data, error } = await supabase
            .from('gallery_images')
            .select('*')
            .eq('type', 'image')
            .order('display_order', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch error:', error);
            return { success: false, error };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Fetch error:', error);
        return { success: false, error };
    }
};

/**
 * Fetch all gallery videos from database
 * @returns {Promise<{success: boolean, data?: array, error?: any}>}
 */
export const fetchGalleryVideos = async () => {
    try {
        const { data, error } = await supabase
            .from('gallery_images')
            .select('*')
            .eq('type', 'video')
            .order('display_order', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch error:', error);
            return { success: false, error };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Fetch error:', error);
        return { success: false, error };
    }
};

/**
 * Add a new gallery item to database
 * @param {object} itemData - {url, storage_path, type, alt}
 * @returns {Promise<{success: boolean, data?: object, error?: any}>}
 */
export const addGalleryItem = async (itemData) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('gallery_images')
            .insert([
                {
                    url: itemData.url,
                    storage_path: itemData.storage_path,
                    type: itemData.type,
                    alt: itemData.alt || 'Gallery Image',
                    user_id: user?.id
                }
            ])
            .select();

        if (error) {
            console.error('Insert error:', error);
            return { success: false, error };
        }

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Insert error:', error);
        return { success: false, error };
    }
};

/**
 * Delete a gallery item from database
 * @param {string} id - Item ID
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const deleteGalleryItem = async (id) => {
    try {
        const { error } = await supabase
            .from('gallery_images')
            .delete()
            .eq('id', id);

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
 * Fetch home gallery images from database
 * @returns {Promise<{success: boolean, data?: array, error?: any}>}
 */
export const fetchHomeGalleryImages = async () => {
    try {
        const { data, error } = await supabase
            .from('home_gallery_images')
            .select('*')
            .order('display_order', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(6);

        if (error) {
            console.error('Fetch error:', error);
            return { success: false, error };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Fetch error:', error);
        return { success: false, error };
    }
};

/**
 * Add a new home gallery image to database
 * @param {object} itemData - {url, storage_path, alt}
 * @returns {Promise<{success: boolean, data?: object, error?: any}>}
 */
export const addHomeGalleryImage = async (itemData) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('home_gallery_images')
            .insert([
                {
                    url: itemData.url,
                    storage_path: itemData.storage_path,
                    alt: itemData.alt || 'Home Gallery Image',
                    user_id: user?.id
                }
            ])
            .select();

        if (error) {
            console.error('Insert error:', error);
            return { success: false, error };
        }

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Insert error:', error);
        return { success: false, error };
    }
};

/**
 * Delete a home gallery image from database
 * @param {string} id - Item ID
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const deleteHomeGalleryImage = async (id) => {
    try {
        const { error } = await supabase
            .from('home_gallery_images')
            .delete()
            .eq('id', id);

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
 * Update display order for gallery images
 * @param {Array} items - Array of {id, display_order}
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const updateGalleryOrder = async (items) => {
    try {
        const updates = items.map((item, index) =>
            supabase
                .from('gallery_images')
                .update({ display_order: items.length - index })
                .eq('id', item.id)
        );

        await Promise.all(updates);
        return { success: true };
    } catch (error) {
        console.error('Update order error:', error);
        return { success: false, error };
    }
};

/**
 * Update display order for home gallery images
 * @param {Array} items - Array of {id, display_order}
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const updateHomeGalleryOrder = async (items) => {
    try {
        const updates = items.map((item, index) =>
            supabase
                .from('home_gallery_images')
                .update({ display_order: items.length - index })
                .eq('id', item.id)
        );

        await Promise.all(updates);
        return { success: true };
    } catch (error) {
        console.error('Update order error:', error);
        return { success: false, error };
    }
};
