const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const cors = require('cors')({ origin: true });

/**
 * Create Razorpay Order
 * Creates a new order in Razorpay system
 */
module.exports = async (req, res) => {
    // Enable CORS
    return cors(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).send('Method Not Allowed');
            }

            const { amount, currency, orderId } = req.body;

            if (!amount || !orderId) {
                return res.status(400).send('Missing required parameters');
            }

            // Get Razorpay configuration from Firestore
            const settingsDoc = await admin.firestore()
                .collection('store_settings')
                .doc('payment_settings')
                .get();

            if (!settingsDoc.exists) {
                console.error('Payment settings not found');
                return res.status(500).send('Server configuration error');
            }

            const settings = settingsDoc.data();
            const keyId = settings.razorpay?.keyId;
            const keySecret = settings.razorpay?.keySecret;

            if (!keyId || !keySecret) {
                console.error('Razorpay keys not configured');
                return res.status(500).send('Payment gateway not configured');
            }

            // Initialize Razorpay
            const instance = new Razorpay({
                key_id: keyId,
                key_secret: keySecret
            });

            // Create order
            const options = {
                amount: amount, // Amount in smallest currency unit (paise)
                currency: currency || 'INR',
                receipt: orderId, // Our internal order ID
                notes: {
                    orderId: orderId
                }
            };

            const order = await instance.orders.create(options);

            res.status(200).json({
                success: true,
                razorpayOrderId: order.id,
                amount: order.amount,
                currency: order.currency
            });

        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
};
