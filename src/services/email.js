import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const EMAIL_SETTINGS_DOC = 'email_settings';

export const getEmailSettings = async () => {
    try {
        const docRef = doc(db, 'store_settings', EMAIL_SETTINGS_DOC);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Return default settings
            const defaultSettings = {
                smtp: {
                    user: '',
                    password: ''
                },
                storeName: ''
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
