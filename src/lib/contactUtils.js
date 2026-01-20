import { supabase } from './supabaseClient';

/**
 * Fetch all contact entries from database
 * @returns {Promise<{success: boolean, data?: array, error?: any}>}
 */
export const fetchContactEntries = async () => {
    try {
        const { data, error } = await supabase
            .from('contact_entries')
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
 * Add a new contact entry to database and send email notification
 * @param {object} entryData - {name, email, phone, message}
 * @returns {Promise<{success: boolean, data?: object, error?: any}>}
 */
export const addContactEntry = async (entryData) => {
    try {
        console.log('Attempting to insert contact entry:', entryData);

        // Insert into database
        const { data, error } = await supabase
            .from('contact_entries')
            .insert([
                {
                    name: entryData.name,
                    email: entryData.email,
                    phone: entryData.phone,
                    message: entryData.message,
                    status: 'new'
                }
            ])
            .select();

        if (error) {
            console.error('Supabase insert error:', error);
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return { success: false, error };
        }

        console.log('Successfully inserted into database:', data);

        // Send email notification using Formsubmit.co
        try {
            const emailData = new FormData();
            emailData.append('_subject', `New Contact Form Submission from ${entryData.name}`);
            emailData.append('name', entryData.name);
            emailData.append('email', entryData.email);
            emailData.append('phone', entryData.phone);
            emailData.append('message', entryData.message);
            emailData.append('_template', 'table'); // Use table template for better formatting
            emailData.append('_captcha', 'false'); // Disable captcha for seamless experience

            const emailResponse = await fetch('https://formsubmit.co/kvsnavee@gmail.com', {
                method: 'POST',
                body: emailData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const emailResult = await emailResponse.json();

            if (!emailResponse.ok) {
                console.warn('Email notification failed:', emailResult);
                // Don't fail the whole operation if email fails
            } else {
                console.log('Email notification sent successfully via Formsubmit.co');
            }
        } catch (emailError) {
            console.warn('Email notification error:', emailError);
            // Don't fail the whole operation if email fails
        }

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Unexpected error in addContactEntry:', error);
        return { success: false, error };
    }
};

/**
 * Update contact entry status
 * @param {string} id - Entry ID
 * @param {string} status - New status ('new', 'read', 'replied')
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const updateContactStatus = async (id, status) => {
    try {
        const { error } = await supabase
            .from('contact_entries')
            .update({ status })
            .eq('id', id);

        if (error) {
            console.error('Update error:', error);
            return { success: false, error };
        }

        return { success: true };
    } catch (error) {
        console.error('Update error:', error);
        return { success: false, error };
    }
};

/**
 * Update contact entry notes
 * @param {string} id - Entry ID
 * @param {string} notes - Notes text
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const updateContactNotes = async (id, notes) => {
    try {
        const { error } = await supabase
            .from('contact_entries')
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
 * Update contact entry workflow status
 * @param {string} id - Entry ID
 * @param {string} workflowStatus - New workflow status
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const updateContactWorkflowStatus = async (id, workflowStatus) => {
    try {
        const { error } = await supabase
            .from('contact_entries')
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
 * Delete a contact entry
 * @param {string} id - Entry ID
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const deleteContactEntry = async (id) => {
    try {
        const { error } = await supabase
            .from('contact_entries')
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
