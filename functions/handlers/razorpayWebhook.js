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

        // Use timing-safe comparison to prevent timing attacks
        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );

        if (!isValid) {
            console.error('Invalid webhook signature');
            return res.status(400).send('Invalid signature');
        }

        const event = req.body.event;
        const payload = req.body.payload.payment.entity;

        // Handle the event
        switch (event) {
            case 'payment.captured': {
                // Get order ID from notes
                // The orderId in notes is the Firestore document ID (set when creating Razorpay order)
                const orderId = payload.notes?.orderId;

                if (!orderId) {
                    console.error('Order ID not found in payment notes. Payment:', payload.id);
                    return res.status(400).send('Order ID missing from payment notes');
                }

                // Verify payment status - payment.captured should only fire for successful payments
                // But we'll double-check the status field
                if (payload.status !== 'captured' && payload.status !== 'authorized') {
                    console.log(`Payment not successful for order ${orderId}. Status: ${payload.status}`);
                    // Update order status to failed
                    const orderRef = admin.firestore().collection('orders').doc(orderId);
                    const orderDoc = await orderRef.get();
                    if (orderDoc.exists) {
                        await orderRef.update({
                            paymentStatus: 'failed',
                            paymentDetails: {
                                error: `Payment status: ${payload.status}`,
                                razorpayPaymentId: payload.id
                            },
                            updatedAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                    }
                    // Do NOT send confirmation email for failed payments
                    return res.json({ status: 'ok' });
                }

                // Update order in Firestore using the document ID
                const orderRef = admin.firestore().collection('orders').doc(orderId);
                const orderDoc = await orderRef.get();

                if (!orderDoc.exists) {
                    console.error(`Order document ${orderId} not found in Firestore`);
                    return res.status(404).send('Order not found');
                }

                await orderRef.update({
                    status: 'paid',
                    paymentStatus: 'paid',
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

                // Get updated order data for email
                const orderData = orderDoc.data();

                // Send payment confirmation email ONLY if payment was successful
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

                console.log(`Payment captured successfully for order ${orderId}`);
                break;
            }

            case 'payment.failed': {
                // Get order ID from notes
                const orderId = payload.notes?.orderId;

                if (orderId) {
                    const orderRef = admin.firestore().collection('orders').doc(orderId);
                    const orderDoc = await orderRef.get();

                    if (orderDoc.exists) {
                        await orderRef.update({
                            paymentStatus: 'failed',
                            paymentDetails: {
                                error: payload.error_description || 'Payment failed'
                            },
                            updatedAt: admin.firestore.FieldValue.serverTimestamp()
                        });

                        console.log(`Payment failed for order ${orderId}`);
                    } else {
                        console.warn(`Order document ${orderId} not found for failed payment`);
                    }
                } else {
                    console.warn('Order ID not found in payment.failed event');
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
