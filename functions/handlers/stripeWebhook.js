const admin = require('firebase-admin');
const Stripe = require('stripe');
const { sendPaymentConfirmationEmail, sendOrderConfirmationEmail } = require('../services/emailService');

/**
 * Stripe Webhook Handler
 * Handles Stripe webhook events for payment processing
 */
module.exports = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        // Get Stripe configuration from Firestore
        const settingsDoc = await admin.firestore()
            .collection('store_settings')
            .doc('payment_settings')
            .get();

        if (!settingsDoc.exists) {
            console.error('Payment settings not found');
            return res.status(400).send('Payment settings not configured');
        }

        const settings = settingsDoc.data();
        const stripeSecretKey = settings.stripe?.secretKey;
        const webhookSecret = settings.stripe?.webhookSecret;

        if (!stripeSecretKey || !webhookSecret) {
            console.error('Stripe not configured');
            return res.status(400).send('Stripe not configured');
        }

        const stripe = new Stripe(stripeSecretKey);

        // Verify webhook signature
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;

                // Get order ID from metadata
                const orderId = session.metadata.orderId;

                if (!orderId) {
                    console.error('Order ID not found in session metadata');
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
                    return res.json({ received: true, message: 'Already processed' });
                }

                // Update order in Firestore
                await orderRef.update({
                    paymentStatus: 'completed',
                    transactionId: session.payment_intent,
                    paymentDetails: {
                        stripeSessionId: session.id,
                        amount: session.amount_total / 100, // Convert from cents
                        currency: session.currency,
                        paymentMethod: session.payment_method_types[0],
                        customerEmail: session.customer_email
                    },
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // Send emails only if not already sent
                if (orderData.customer?.email) {
                    // Get store info for emails
                    const storeDoc = await admin.firestore()
                        .collection('store_settings')
                        .doc('store_info')
                        .get();

                    const storeInfo = storeDoc.exists ? storeDoc.data() : {};

                    // Send payment confirmation email
                    await sendPaymentConfirmationEmail({
                        to: orderData.customer.email,
                        orderId: orderData.orderId,
                        transactionId: session.payment_intent,
                        amount: session.amount_total / 100,
                        currency: session.currency.toUpperCase(),
                        paymentMethod: 'Stripe - ' + session.payment_method_types[0]
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
                        storeName: storeInfo.name || 'Our Store',
                        currencySymbol: storeInfo.currencySymbol || '₹'
                    });
                }

                console.log(`Payment completed for order ${orderId}`);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                const orderId = paymentIntent.metadata.orderId;

                if (orderId) {
                    await admin.firestore().collection('orders').doc(orderId).update({
                        paymentStatus: 'failed',
                        paymentDetails: {
                            error: paymentIntent.last_payment_error?.message || 'Payment failed'
                        },
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                    console.log(`Payment failed for order ${orderId}`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Error processing Stripe webhook:', error);
        res.status(500).send('Internal server error');
    }
};
