import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Admin Accounts Service
 * Handles admin and customer account management
 */

/**
 * Get all admin users
 * @returns {Promise<Array>}
 */
export async function getAllAdmins() {
    try {
        const adminsRef = collection(db, 'admins');
        const snapshot = await getDocs(adminsRef);
        const admins = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.role === 'admin') {
                admins.push({
                    id: doc.id, // This is the email
                    email: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate()
                });
            }
        });

        // Sort by createdAt descending
        admins.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return b.createdAt - a.createdAt;
        });

        return admins;
    } catch (error) {
        console.error('Error fetching admins:', error);
        throw new Error('Failed to load admin accounts. Please try again.');
    }
}

/**
 * Get all users (customers for reference)
 * @returns {Promise<Array>}
 */
export async function getAllUsers() {
    try {
        const customersRef = collection(db, 'customers');
        const q = query(customersRef, orderBy('createdAt', 'desc'));

        const snapshot = await getDocs(q);
        const users = [];

        snapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            });
        });

        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to load users. Please try again.');
    }
}

/**
 * Add admin user
 * @param {string} email - The email address to add as admin
 * @returns {Promise<void>}
 */
export async function promoteToAdmin(email) {
    try {
        // Document ID is the email itself
        const adminRef = doc(db, 'admins', email);

        // Check if admin already exists
        const adminDoc = await getDoc(adminRef);

        if (adminDoc.exists()) {
            throw new Error('This email is already registered as an admin.');
        }

        // Create admin document
        await setDoc(adminRef, {
            role: 'admin',
            email: email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error adding admin:', error);
        if (error.message.includes('already registered')) {
            throw error;
        }
        throw new Error('Failed to add admin user. Please try again.');
    }
}

/**
 * Revoke admin privileges (delete from admins collection)
 * @param {string} email - The admin email to remove
 * @returns {Promise<void>}
 */
export async function revokeAdmin(email) {
    try {
        const adminRef = doc(db, 'admins', email);
        await deleteDoc(adminRef);
    } catch (error) {
        console.error('Error revoking admin:', error);
        throw new Error('Failed to revoke admin privileges. Please try again.');
    }
}

/**
 * Get all customers
 * @returns {Promise<Array>}
 */
export async function getAllCustomers() {
    try {
        const customersRef = collection(db, 'customers');
        const q = query(customersRef, orderBy('createdAt', 'desc'));

        const snapshot = await getDocs(q);
        const customers = [];

        snapshot.forEach((doc) => {
            customers.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            });
        });

        return customers;
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw new Error('Failed to load customers. Please try again.');
    }
}

/**
 * Get customer by email
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export async function getCustomerByEmail(email) {
    try {
        const customersRef = collection(db, 'customers');
        const q = query(customersRef, where('email', '==', email));

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
        console.error('Error fetching customer by email:', error);
        return null;
    }
}

export default {
    getAllAdmins,
    getAllUsers,
    promoteToAdmin,
    revokeAdmin,
    getAllCustomers,
    getCustomerByEmail
};
