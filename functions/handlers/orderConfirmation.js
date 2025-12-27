const admin = require('firebase-admin');
const { sendOrderConfirmationEmail, sendStoreOwnerNotificationEmail, getStoreInfo } = require('../services/emailService');

/**
 * Order Confirmation Handler
 * Triggered when a new order is created in Firestore
 * Sends order confirmation email to customer (only for COD)
 * Sends notification email to store owner for all orders
 * 
 * Note: For Razorpay/Stripe, order confirmation is sent after payment via webhooks
 */
module.exports = async (snapshot, context) => {
    try {
        const orderData = snapshot.data();
        const orderId = context.params.orderId;

        // Get store info for email
        const storeInfo = await getStoreInfo();

        // Only send order confirmation email for COD orders
        // For Razorpay/Stripe, email will be sent after payment is confirmed via webhook
        const isCOD = orderData.paymentMethod === 'cod' || orderData.paymentGateway === 'cod';
        
        if (isCOD && orderData.customer?.email) {
            // Send order confirmation email to customer for COD orders
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
                storeName: storeInfo.storeName,
                currencySymbol: storeInfo.currencySymbol
            });
            console.log(`Order confirmation email sent for COD order ${orderId}`);
        } else if (!isCOD) {
            console.log(`Skipping order confirmation email for order ${orderId} - will be sent after payment confirmation`);
        }

        // Always send notification to store owner for new orders
        await sendStoreOwnerNotificationEmail({
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
            storeName: storeInfo.storeName,
            currencySymbol: storeInfo.currencySymbol
        });
        console.log(`Store owner notification sent for order ${orderId}`);

        return null;
    } catch (error) {
        console.error('Error sending order emails:', error);
        // Don't throw error - we don't want to fail the order creation
        return null;
    }
};
