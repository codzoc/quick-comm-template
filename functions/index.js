const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const stripeWebhookHandler = require('./handlers/stripeWebhook');
const razorpayWebhook = require('./handlers/razorpayWebhook');
const orderConfirmation = require('./handlers/orderConfirmation');
const orderStatusChange = require('./handlers/orderStatusChange');
const customerSignup = require('./handlers/customerSignup');

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

// Export order status change trigger (sends email when order status is updated)
exports.onOrderStatusChange = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(orderStatusChange);

// Export customer signup trigger (sends welcome email when new customer is created)
exports.onCustomerSignup = functions.firestore
    .document('customers/{customerId}')
    .onCreate(customerSignup);

// Export Razorpay order creation
exports.createRazorpayOrder = functions.https.onRequest(require('./handlers/createRazorpayOrder'));

// Export Refund Order function (Callable)
exports.refundOrder = functions.https.onCall(require('./handlers/refundOrder'));

// Export Warmup function (Callable)
exports.warmup = functions.https.onCall(require('./handlers/warmup'));
