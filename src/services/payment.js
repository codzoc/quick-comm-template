import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const PAYMENT_SETTINGS_DOC = 'payment_settings';

export const getPaymentSettings = async () => {
    try {
        const docRef = doc(db, 'store_settings', PAYMENT_SETTINGS_DOC);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Default settings
            const defaultSettings = {
                cod: {
                    enabled: true,
                    label: 'Cash on Delivery (COD)',
                    description: 'Pay with cash upon delivery.'
                },
                // Placeholder for future gateways
                stripe: {
                    enabled: false,
                    publishableKey: '',
                    secretKey: '' // Note: Secret keys should ideally be backend-only
                }
            };
            await setDoc(docRef, defaultSettings);
            return defaultSettings;
        }
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        throw error;
    }
};

export const updatePaymentSettings = async (settings) => {
    try {
        const docRef = doc(db, 'store_settings', PAYMENT_SETTINGS_DOC);
        await setDoc(docRef, settings, { merge: true });
        return true;
    } catch (error) {
        console.error('Error updating payment settings:', error);
        throw error;
    }
};
