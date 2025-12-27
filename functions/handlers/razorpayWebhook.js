const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendPaymentConfirmationEmail, sendOrderConfirmationEmail, getStoreInfo } = require('../services/emailService');

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
                const orderId = payload.notes?.orderId;

                if (!orderId) {
                    console.error('Order ID not found in payment notes');
                    return res.status(400).send('Order ID missing');
                }

                // Get current order data to check if payment was already processed
                const orderRef = admin.firestore().collection('orders').doc(orderId);
                const orderDoc = await orderRef.get();
                
                if (!orderDoc.exists) {
                    console.error(`Order ${orderId} not found`);
                    return res.status(404).send('Order not found');
                }

                const orderData = orderDoc.data();
                
                // Check if payment was already processed (idempotency check)
                // This prevents duplicate emails when webhooks are retried
                const isAlreadyProcessed = orderData.paymentStatus === 'completed' || 
                                         orderData.paymentStatus === 'paid';
                
                if (isAlreadyProcessed) {
                    console.log(`Payment already processed for order ${orderId}, skipping duplicate processing`);
                    return res.json({ status: 'ok', message: 'Already processed' });
                }

                // Update order in Firestore
                await orderRef.update({
                    status: 'paid', // Changing status to 'paid' as requested
                    paymentStatus: 'paid', // Changing paymentStatus to 'paid' as requested
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

                // Send emails only if not already sent
                if (orderData.customer?.email) {
                    // Get store info for emails
                    const storeInfo = await getStoreInfo();

                    // Send payment confirmation email
                    await sendPaymentConfirmationEmail({
                        to: orderData.customer.email,
                        orderId: orderData.orderId,
                        transactionId: payload.id,
                        amount: payload.amount / 100,
                        currency: payload.currency.toUpperCase(),
                        paymentMethod: 'Razorpay - ' + payload.method
                    });

                    // Send order confirmation email (since payment is now complete)
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
                        paymentStatus: 'completed',
                        storeName: storeInfo.storeName,
                        currencySymbol: storeInfo.currencySymbol
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
