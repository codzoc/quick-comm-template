const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripeWebhook = require('./handlers/stripeWebhook');
const razorpayWebhook = require('./handlers/razorpayWebhook');
const orderConfirmation = require('./handlers/orderConfirmation');

// Initialize Firebase Admin
admin.initializeApp();

// Export Stripe webhook handler
exports.stripeWebhook = functions.https.onRequest(stripeWebhook);

// Export Razorpay webhook handler
exports.razorpayWebhook = functions.https.onRequest(razorpayWebhook);

// Export order confirmation trigger (sends email when new order is created)
exports.onOrderCreated = functions.firestore
    .document('orders/{orderId}')
    .onCreate(orderConfirmation);
