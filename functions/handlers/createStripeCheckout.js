const admin = require('firebase-admin');
const Stripe = require('stripe');

/**
 * Create a Stripe Checkout Session from Firestore payment settings.
 */
module.exports = async (req, res) => {
    try {
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'POST');
            res.set('Access-Control-Allow-Headers', 'Content-Type');
            return res.status(204).send('');
        }

        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        if (req.body && req.body.warmup) {
            return res.status(200).json({ message: 'Warmed up' });
        }

        const {
            orderId,
            amount,
            currency,
            customerEmail,
            customerName,
            items,
            successUrl,
            cancelUrl
        } = req.body || {};

        if (!orderId || !amount) {
            return res.status(400).json({ success: false, error: 'Missing required parameters' });
        }

        const settingsDoc = await admin.firestore()
            .collection('store_settings')
            .doc('payment_settings')
            .get();

        if (!settingsDoc.exists) {
            return res.status(500).json({ success: false, error: 'Payment settings not found' });
        }

        const secretKey = settingsDoc.data()?.stripe?.secretKey;
        if (!secretKey) {
            return res.status(500).json({ success: false, error: 'Stripe is not configured' });
        }

        const stripe = new Stripe(secretKey);
        const origin = req.headers.origin || '';
        const lineItems = Array.isArray(items) && items.length > 0
            ? items.map((item) => ({
                quantity: item.quantity || 1,
                price_data: {
                    currency: (currency || 'inr').toLowerCase(),
                    unit_amount: Math.round(Number(item.amount || item.price || 0)),
                    product_data: {
                        name: item.name || item.title || 'Item'
                    }
                }
            }))
            : [{
                quantity: 1,
                price_data: {
                    currency: (currency || 'inr').toLowerCase(),
                    unit_amount: Math.round(Number(amount)),
                    product_data: {
                        name: `Order ${orderId}`
                    }
                }
            }];

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            customer_email: customerEmail || undefined,
            client_reference_id: orderId,
            metadata: {
                orderId,
                customerName: customerName || ''
            },
            line_items: lineItems,
            success_url: successUrl || `${origin}/?checkout=success&orderId=${orderId}`,
            cancel_url: cancelUrl || `${origin}/?checkout=cancel`
        });

        res.set('Access-Control-Allow-Origin', '*');
        return res.status(200).json({
            success: true,
            id: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Error creating Stripe checkout session:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
