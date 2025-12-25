const admin = require('firebase-admin');
const Razorpay = require('razorpay');

/**
 * Refund Order
 * Process a refund for a given order
 */
module.exports = async (data, context) => {
    // Check if user is authenticated (and ideally if admin)
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }

    // In a real app, verify admin claims here
    // const token = context.auth.token;
    // if (!token.admin) throw new functions.https.HttpsError('permission-denied', 'Admin access required');

    const { orderId, warmup } = data;

    // Warmup check
    if (warmup) {
        return { message: 'Warmed up' };
    }

    if (!orderId) {
        throw new functions.https.HttpsError('invalid-argument', 'Order ID is required');
    }

    try {
        const orderRef = admin.firestore().collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Order not found');
        }

        const order = orderDoc.data();

        // Check if already refunded
        if (order.status === 'refunded' || order.paymentStatus === 'refunded') {
            throw new functions.https.HttpsError('failed-precondition', 'Order already refunded');
        }

        // Only process refund if payment was via Razorpay
        if (order.paymentGateway === 'razorpay' && order.paymentDetails?.razorpayPaymentId) {
            // Get Razorpay settings
            const settingsDoc = await admin.firestore()
                .collection('store_settings')
                .doc('payment_settings')
                .get();

            const settings = settingsDoc.data();
            const keyId = settings.razorpay?.keyId;
            const keySecret = settings.razorpay?.keySecret;

            if (!keyId || !keySecret) {
                throw new functions.https.HttpsError('failed-precondition', 'Razorpay not configured');
            }

            const razorpay = new Razorpay({
                key_id: keyId,
                key_secret: keySecret
            });

            // Process refund
            const refund = await razorpay.payments.refund(order.paymentDetails.razorpayPaymentId, {
                speed: 'normal'
            });

            // Update order status
            await orderRef.update({
                status: 'refunded', // Update status to Refunded as requested
                paymentStatus: 'refunded',
                refundId: refund.id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, refundId: refund.id };
        } else if (order.paymentGateway === 'cod') {
            // Manual refund logic for COD (just update status)
            await orderRef.update({
                status: 'refunded',
                paymentStatus: 'refunded',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, message: 'Marked as refunded (COD)' };
        } else {
            throw new functions.https.HttpsError('failed-precondition', 'Refund not supported for this payment method or missing payment details');
        }

    } catch (error) {
        console.error('Refund error:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Refund failed');
    }
};
