import { doc, setDoc } from 'firebase/firestore';
import { db } from './config/firebase.js';

const seedAdmin = async () => {
    try {
        await setDoc(doc(db, 'admins', 'admin@example.com'), {
            email: 'admin@example.com',
            role: 'admin',
            createdAt: new Date()
        });
        console.log('Admin seeded successfully');
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

seedAdmin();
