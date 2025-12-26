const admin = require('firebase-admin');
const { sendWelcomeEmail } = require('../services/emailService');

/**
 * Customer Signup Handler
 * Triggered when a new customer document is created in Firestore
 * Sends welcome email to new customer
 */
module.exports = async (snapshot, context) => {
    try {
        const customerData = snapshot.data();
        const customerId = context.params.customerId;

        // Check if email exists
        if (!customerData.email) {
            console.log(`No email found for customer ${customerId}, skipping welcome email`);
            return null;
        }

        // Only send welcome email if this is a new customer signup
        // Check if this is the first time the document is created
        const createdAt = customerData.createdAt?.toDate();
        const now = new Date();
        const timeDiff = now - createdAt;

        // Only send if document was created within the last 5 minutes (to avoid duplicates)
        if (timeDiff > 5 * 60 * 1000) {
            console.log(`Customer ${customerId} was created more than 5 minutes ago, skipping welcome email`);
            return null;
        }

        // Send welcome email
        await sendWelcomeEmail({
            email: customerData.email,
            name: customerData.name || 'Customer'
        });

        console.log(`Welcome email sent to customer ${customerId}`);
        return null;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't throw error - we don't want to fail the customer creation
        return null;
    }
};

