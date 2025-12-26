const admin = require('firebase-admin');
const { sendOrderConfirmationEmail } = require('../services/emailService');

/**
 * Order Confirmation Handler
 * Triggered when a new order is created in Firestore
 * Sends order confirmation email to customer
 */
module.exports = async (snapshot, context) => {
    try {
        const orderData = snapshot.data();
        const orderId = context.params.orderId;

        // Check if customer email exists
        if (!orderData.customer?.email) {
            console.log(`No email found for order ${orderId}, skipping email notification`);
            return null;
        }

        // Get store info for email
        const storeDoc = await admin.firestore()
            .collection('store_settings')
            .doc('store_info')
            .get();

        const storeInfo = storeDoc.exists ? storeDoc.data() : {};

        // Send order confirmation email
        await sendOrderConfirmationEmail({
            to: orderData.customer.email,
            customerName: orderData.customer.name,
            orderId: orderData.orderId,
            orderDate: orderData.createdAt?.toDate() || new Date(),
            items: orderData.items,
            customer: orderData.customer,
            subtotal: orderData.subtotal,
            tax: orderData.tax,
            shipping: orderData.shipping,
            total: orderData.total,
            paymentMethod: orderData.paymentMethod,
            paymentStatus: orderData.paymentStatus,
            storeName: storeInfo.name || 'Our Store',
            currencySymbol: storeInfo.currencySymbol || '₹'
        });

        console.log(`Order confirmation email sent for order ${orderId}`);
        return null;
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        // Don't throw error - we don't want to fail the order creation
        return null;
    }
};
