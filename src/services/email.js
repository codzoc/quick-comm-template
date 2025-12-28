import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Email Settings Service
 * Handles Gmail SMTP configuration for transactional emails
 * 
 * Note: storeName is no longer stored here - it's retrieved from storeInfo/contact collection
 * when sending emails (handled in backend emailService.js)
 */

const EMAIL_SETTINGS_DOC = 'email_settings';

export const getEmailSettings = async () => {
    try {
        const docRef = doc(db, 'store_settings', EMAIL_SETTINGS_DOC);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Return default settings (storeName removed - use storeInfo.storeName instead)
            const defaultSettings = {
                smtp: {
                    user: '',
                    password: ''
                }
            };
            return defaultSettings;
        }
    } catch (error) {
        console.error('Error fetching email settings:', error);
        throw error;
    }
};

export const updateEmailSettings = async (settings) => {
    try {
        const docRef = doc(db, 'store_settings', EMAIL_SETTINGS_DOC);
        await setDoc(docRef, settings, { merge: true });
        return true;
    } catch (error) {
        console.error('Error updating email settings:', error);
        throw error;
    }
};
