const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendPaymentConfirmationEmail } = require('../services/emailService');

/**
 * Razorpay Webhook Handler
 * Handles Razorpay webhook events for payment processing
 */
module.exports = async (req, res) => {
    try {
        // Get Razorpay configuration from Firestore
        const settingsDoc = await admin.firestore()
            .collection('store_settings')
            .doc('payment_settings')
            .get();

        if (!settingsDoc.exists) {
            console.error('Payment settings not found');
            return res.status(400).send('Payment settings not configured');
        }

        const settings = settingsDoc.data();
        const razorpayKeySecret = settings.razorpay?.keySecret;
        const webhookSecret = settings.razorpay?.webhookSecret;

        if (!razorpayKeySecret || !webhookSecret) {
            console.error('Razorpay not configured');
            return res.status(400).send('Razorpay not configured');
        }

        // Verify webhook signature
        const signature = req.headers['x-razorpay-signature'];
        const body = JSON.stringify(req.body);

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('Invalid webhook signature');
            return res.status(400).send('Invalid signature');
        }

        const event = req.body.event;
        const payload = req.body.payload.payment.entity;

        // Handle the event
        switch (event) {
            case 'payment.captured': {
                // Get order ID from notes
                const orderId = payload.notes?.orderId;

                if (!orderId) {
                    console.error('Order ID not found in payment notes');
                    return res.status(400).send('Order ID missing');
                }

                // Update order in Firestore
                const orderRef = admin.firestore().collection('orders').doc(orderId);
                await orderRef.update({
                    paymentStatus: 'completed',
                    transactionId: payload.id,
                    paymentDetails: {
                        razorpayPaymentId: payload.id,
                        razorpayOrderId: payload.order_id,
                        amount: payload.amount / 100, // Convert from paise
                        currency: payload.currency,
                        paymentMethod: payload.method,
                        customerEmail: payload.email
                    },
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // Get order data for email
                const orderDoc = await orderRef.get();
                const orderData = orderDoc.data();

                // Send payment confirmation email
                if (orderData.customer?.email) {
                    await sendPaymentConfirmationEmail({
                        to: orderData.customer.email,
                        orderId: orderData.orderId,
                        transactionId: payload.id,
                        amount: payload.amount / 100,
                        currency: payload.currency.toUpperCase(),
                        paymentMethod: 'Razorpay - ' + payload.method
                    });
                }

                console.log(`Payment captured for order ${orderId}`);
                break;
            }

            case 'payment.failed': {
                const orderId = payload.notes?.orderId;

                if (orderId) {
                    await admin.firestore().collection('orders').doc(orderId).update({
                        paymentStatus: 'failed',
                        paymentDetails: {
                            error: payload.error_description || 'Payment failed'
                        },
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                    console.log(`Payment failed for order ${orderId}`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type ${event}`);
        }

        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Error processing Razorpay webhook:', error);
        res.status(500).send('Internal server error');
    }
};
