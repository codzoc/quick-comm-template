import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const PAYMENT_SETTINGS_DOC = 'payment_settings';

export const getPaymentSettings = async () => {
    try {
        const docRef = doc(db, 'store_settings', PAYMENT_SETTINGS_DOC);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Return default settings without writing (guests don't have write permission)
            const defaultSettings = {
                cod: {
                    enabled: true,
                    label: 'Cash on Delivery (COD)',
                    description: 'Pay with cash upon delivery.'
                },
                stripe: {
                    enabled: false,
                    publishableKey: '',
                    secretKey: '',
                    webhookSecret: ''
                },
                razorpay: {
                    enabled: false,
                    keyId: '',
                    keySecret: '',
                    webhookSecret: ''
                }
            };
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
