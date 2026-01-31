import { supabase } from './supabaseClient';

/**
 * Fetch all collection enquiry entries from database
 * @returns {Promise<{success: boolean, data?: array, error?: any}>}
 */
export const fetchCollectionEntries = async () => {
    try {
        const { data, error } = await supabase
            .from('collection_enquiries')
            .select('*')
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
 * Add a new collection enquiry entry to database and send email notification
 * @param {object} entryData - {name, email, phone, message, design_name, selected_sets}
 * @returns {Promise<{success: boolean, data?: object, error?: any}>}
 */
export const addCollectionEntry = async (entryData) => {
    try {
        console.log('Attempting to insert collection entry:', entryData);

        // Insert into database
        const { data, error } = await supabase
            .from('collection_enquiries')
            .insert([
                {
                    name: entryData.name,
                    email: entryData.email,
                    phone: entryData.phone,
                    message: entryData.message,
                    design_name: entryData.design_name,
                    selected_sets: entryData.selected_sets,
                    status: 'new'
                }
            ])
            .select();

        if (error) {
            console.error('Supabase insert error:', error);
            return { success: false, error };
        }

        console.log('Successfully inserted into database:', data);

        // Send email notification using Formsubmit.co
        try {
            const emailData = new FormData();
            emailData.append('_subject', `New Collection Enquiry for ${entryData.design_name} from ${entryData.name}`);
            emailData.append('name', entryData.name);
            emailData.append('email', entryData.email);
            emailData.append('phone', entryData.phone);
            emailData.append('design_name', entryData.design_name);
            emailData.append('selected_sets', entryData.selected_sets || 'N/A');
            emailData.append('message', entryData.message);
            emailData.append('_template', 'table');
            emailData.append('_captcha', 'false');

            const emailResponse = await fetch('https://formsubmit.co/kvsnavee@gmail.com', {
                method: 'POST',
                body: emailData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!emailResponse.ok) {
                console.warn('Email notification failed');
            } else {
                console.log('Email notification sent successfully via Formsubmit.co');
            }
        } catch (emailError) {
            console.warn('Email notification error:', emailError);
        }

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Unexpected error in addCollectionEntry:', error);
        return { success: false, error };
    }
};

/**
 * Update collection entry notes
 * @param {string} id - Entry ID
 * @param {string} notes - Notes text
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const updateCollectionNotes = async (id, notes) => {
    try {
        const { error } = await supabase
            .from('collection_enquiries')
            .update({ notes })
            .eq('id', id);

        if (error) {
            console.error('Update notes error:', error);
            return { success: false, error };
        }

        return { success: true };
    } catch (error) {
        console.error('Update notes error:', error);
        return { success: false, error };
    }
};

/**
 * Update collection entry workflow status
 * @param {string} id - Entry ID
 * @param {string} workflowStatus - New workflow status
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const updateCollectionWorkflowStatus = async (id, workflowStatus) => {
    try {
        const { error } = await supabase
            .from('collection_enquiries')
            .update({ workflow_status: workflowStatus })
            .eq('id', id);

        if (error) {
            console.error('Update workflow status error:', error);
            return { success: false, error };
        }

        return { success: true };
    } catch (error) {
        console.error('Update workflow status error:', error);
        return { success: false, error };
    }
};

/**
 * Update collection entry status (e.g. 'read', 'new')
 * @param {string} id - Entry ID
 * @param {string} status - New status
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const updateCollectionStatus = async (id, status) => {
    try {
        const { error } = await supabase
            .from('collection_enquiries')
            .update({ status: status })
            .eq('id', id);

        if (error) {
            console.error('Update status error:', error);
            return { success: false, error };
        }

        return { success: true };
    } catch (error) {
        console.error('Update status error:', error);
        return { success: false, error };
    }
};

/**
 * Delete a collection entry
 * @param {string} id - Entry ID
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const deleteCollectionEntry = async (id) => {
    try {
        const { error } = await supabase
            .from('collection_enquiries')
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
