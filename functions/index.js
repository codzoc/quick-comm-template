const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const stripeWebhookHandler = require('./handlers/stripeWebhook');
const razorpayWebhook = require('./handlers/razorpayWebhook');
const orderConfirmation = require('./handlers/orderConfirmation');

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app for Stripe webhook (needs raw body)
const stripeApp = express();
stripeApp.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
stripeApp.post('/', stripeWebhookHandler);

// Export Stripe webhook handler with raw body support
exports.stripeWebhook = functions.https.onRequest(stripeApp);

// Export Razorpay webhook handler
exports.razorpayWebhook = functions.https.onRequest(razorpayWebhook);

// Export order confirmation trigger (sends email when new order is created)
exports.onOrderCreated = functions.firestore
    .document('orders/{orderId}')
    .onCreate(orderConfirmation);
