const admin = require('firebase-admin');
const { sendOrderStatusChangeEmail } = require('../services/emailService');

/**
 * Order Status Change Handler
 * Triggered when an order status is updated in Firestore
 * Sends email notification to customer about status change
 */
module.exports = async (change, context) => {
    try {
        const orderId = context.params.orderId;
        const beforeData = change.before.data();
        const afterData = change.after.data();

        // Only proceed if status actually changed
        if (beforeData.status === afterData.status) {
            return null;
        }

        // Skip if order was just created (status is set for first time)
        if (!beforeData.status && afterData.status) {
            // This is the initial status, not a change
            return null;
        }

        // Check if customer email exists
        if (!afterData.customer?.email) {
            console.log(`No email found for order ${orderId}, skipping status change email`);
            return null;
        }

        // Get store info for email
        const storeDoc = await admin.firestore()
            .collection('store_settings')
            .doc('store_info')
            .get();

        const storeInfo = storeDoc.exists ? storeDoc.data() : {};

        // Send order status change email
        await sendOrderStatusChangeEmail({
            to: afterData.customer.email,
            customerName: afterData.customer.name,
            orderId: afterData.orderId,
            previousStatus: beforeData.status || 'pending',
            newStatus: afterData.status,
            storeName: storeInfo.name || 'Our Store'
        });

        console.log(`Order status change email sent for order ${orderId}: ${beforeData.status} -> ${afterData.status}`);
        return null;
    } catch (error) {
        console.error('Error sending order status change email:', error);
        // Don't throw error - we don't want to fail the status update
        return null;
    }
};

