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

        // Skip order confirmation email for online payment orders
        // They will receive payment confirmation email from webhook instead
        // Only send order confirmation for COD orders or if payment is already completed
        const isOnlinePayment = orderData.paymentMethod === 'stripe' || orderData.paymentMethod === 'razorpay';
        const isPaymentPending = orderData.paymentStatus === 'pending' || orderData.paymentStatus === 'processing';
        
        // For online payments that are still pending, skip order confirmation
        // They'll get payment confirmation email when payment completes
        if (isOnlinePayment && isPaymentPending) {
            console.log(`Skipping order confirmation email for online payment order ${orderId}. Payment confirmation will be sent when payment completes.`);
            return null;
        }

        // Get store info for email
        const storeInfoDoc = await admin.firestore()
            .collection('storeInfo')
            .doc('contact')
            .get();

        const storeInfo = storeInfoDoc.exists ? storeInfoDoc.data() : {};

        // Get theme colors for email styling
        const themeDoc = await admin.firestore()
            .collection('settings')
            .doc('theme')
            .get();

        let themeColors = {
            primary: '#667eea',
            primaryHover: '#764ba2',
            secondary: '#10B981'
        };

        if (themeDoc.exists) {
            const themeData = themeDoc.data();
            // Handle template-based theme
            if (themeData.templateKey) {
                // If custom overrides exist, use them (they override template defaults)
                if (themeData.customOverrides?.colors) {
                    themeColors = {
                        primary: themeData.customOverrides.colors.primary || themeColors.primary,
                        primaryHover: themeData.customOverrides.colors.primaryHover || themeData.customOverrides.colors.primary || themeColors.primaryHover,
                        secondary: themeData.customOverrides.colors.secondary || themeColors.secondary
                    };
                }
                // Note: If no customOverrides, we use defaults. In a full implementation,
                // we could fetch the template colors, but defaults work fine for most cases.
            } else if (themeData.theme?.colors) {
                // Legacy theme format
                themeColors = {
                    primary: themeData.theme.colors.primary || themeColors.primary,
                    primaryHover: themeData.theme.colors.primaryHover || themeData.theme.colors.primary || themeColors.primaryHover,
                    secondary: themeData.theme.colors.secondary || themeColors.secondary
                };
            }
        }

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
            storeName: storeInfo.storeName || storeInfo.name || 'Our Store',
            currencySymbol: storeInfo.currencySymbol || '₹',
            themeColors: themeColors
        });

        console.log(`Order confirmation email sent for order ${orderId}`);
        return null;
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        // Don't throw error - we don't want to fail the order creation
        return null;
    }
};
