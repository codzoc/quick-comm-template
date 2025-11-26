import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'addresses';

/**
 * Address Management Service
 * Handles customer address CRUD operations
 */

/**
 * Get all addresses for a customer
 * @param {string} customerId
 * @returns {Promise<Array>}
 */
export async function getCustomerAddresses(customerId) {
    try {
        const addressesRef = collection(db, COLLECTION_NAME);
        const q = query(
            addressesRef,
            where('customerId', '==', customerId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const addresses = [];

        snapshot.forEach((doc) => {
            addresses.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return addresses;
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw new Error('Failed to load addresses. Please try again.');
    }
}

/**
 * Add new address
 * @param {string} customerId
 * @param {Object} addressData - {name, phone, address, pin, isDefault}
 * @returns {Promise<Object>} Created address with ID
 */
export async function addAddress(customerId, addressData) {
    try {
        // If this is set as default, unset other defaults first
        if (addressData.isDefault) {
            await unsetOtherDefaults(customerId);
        }

        const addressesRef = collection(db, COLLECTION_NAME);
        const newAddress = {
            customerId: customerId,
            name: addressData.name,
            phone: addressData.phone,
            address: addressData.address,
            pin: addressData.pin,
            isDefault: addressData.isDefault || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(addressesRef, newAddress);

        return {
            id: docRef.id,
            ...newAddress
        };
    } catch (error) {
        console.error('Error adding address:', error);
        throw new Error('Failed to add address. Please try again.');
    }
}

/**
 * Update existing address
 * @param {string} customerId
 * @param {string} addressId
 * @param {Object} addressData
 * @returns {Promise<void>}
 */
export async function updateAddress(customerId, addressId, addressData) {
    try {
        // If this is set as default, unset other defaults first
        if (addressData.isDefault) {
            await unsetOtherDefaults(customerId, addressId);
        }

        const addressRef = doc(db, COLLECTION_NAME, addressId);

        await updateDoc(addressRef, {
            ...addressData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating address:', error);
        throw new Error('Failed to update address. Please try again.');
    }
}

/**
 * Delete address
 * @param {string} addressId
 * @returns {Promise<void>}
 */
export async function deleteAddress(addressId) {
    try {
        const addressRef = doc(db, COLLECTION_NAME, addressId);
        await deleteDoc(addressRef);
    } catch (error) {
        console.error('Error deleting address:', error);
        throw new Error('Failed to delete address. Please try again.');
    }
}

/**
 * Set address as default
 * @param {string} customerId
 * @param {string} addressId
 * @returns {Promise<void>}
 */
export async function setDefaultAddress(customerId, addressId) {
    try {
        // Unset all other defaults
        await unsetOtherDefaults(customerId, addressId);

        // Set this address as default
        const addressRef = doc(db, COLLECTION_NAME, addressId);
        await updateDoc(addressRef, {
            isDefault: true,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error setting default address:', error);
        throw new Error('Failed to set default address. Please try again.');
    }
}

/**
 * Get default address for customer
 * @param {string} customerId
 * @returns {Promise<Object|null>}
 */
export async function getDefaultAddress(customerId) {
    try {
        const addressesRef = collection(db, COLLECTION_NAME);
        const q = query(
            addressesRef,
            where('customerId', '==', customerId),
            where('isDefault', '==', true)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching default address:', error);
        return null;
    }
}

/**
 * Helper: Unset default flag on all other addresses
 * @param {string} customerId
 * @param {string} excludeAddressId - Optional address ID to exclude
 */
async function unsetOtherDefaults(customerId, excludeAddressId = null) {
    try {
        const addressesRef = collection(db, COLLECTION_NAME);
        const q = query(
            addressesRef,
            where('customerId', '==', customerId),
            where('isDefault', '==', true)
        );

        const snapshot = await getDocs(q);

        const updates = [];
        snapshot.forEach((doc) => {
            if (doc.id !== excludeAddressId) {
                updates.push(
                    updateDoc(doc.ref, {
                        isDefault: false,
                        updatedAt: serverTimestamp()
                    })
                );
            }
        });

        await Promise.all(updates);
    } catch (error) {
        console.error('Error unsetting other defaults:', error);
        // Don't throw - this is a helper function
    }
}

export default {
    getCustomerAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress
};
