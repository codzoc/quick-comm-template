import { loadStripe } from '@stripe/stripe-js';

/**
 * Payment Gateway Service
 * Handles Stripe and Razorpay payment processing
 */

/**
 * Initialize Stripe Checkout
 * @param {Object} params - { publishableKey, orderId, amount, currency, customerEmail, successUrl, cancelUrl }
 * @returns {Promise<void>}
 */
export async function initiateStripePayment({
    publishableKey,
    orderId,
    amount,
    currency = 'INR',
    customerEmail,
    customerName,
    items,
    successUrl,
    cancelUrl
}) {
    try {
        const stripe = await loadStripe(publishableKey);

        if (!stripe) {
            throw new Error('Failed to load Stripe');
        }

        // Create checkout session via your backend/cloud function
        // For now, we'll redirect to Stripe Checkout with the order details
        // In production, you should create a checkout session via your backend

        const response = await fetch('YOUR_CLOUD_FUNCTION_URL/createStripeCheckout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderId,
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency.toLowerCase(),
                customerEmail,
                customerName,
                items,
                successUrl,
                cancelUrl
            })
        });

        const session = await response.json();

        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            throw new Error(result.error.message);
        }
    } catch (error) {
        console.error('Stripe payment error:', error);
        throw error;
    }
}

/**
 * Initialize Razorpay Payment
 * @param {Object} params - { keyId, orderId, amount, currency, customerEmail, customerName, customerPhone, onSuccess, onFailure }
 * @returns {Promise<void>}
 */
export async function initiateRazorpayPayment({
    keyId,
    orderId,
    storeName = 'Our Store',
    amount,
    currency = 'INR',
    customerEmail,
    customerName,
    customerPhone,
    onSuccess,
    onFailure
}) {
    return new Promise((resolve, reject) => {
        try {
            // Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                script.onload = () => {
                    openRazorpayCheckout();
                };
                script.onerror = () => {
                    reject(new Error('Failed to load Razorpay SDK'));
                };
                document.body.appendChild(script);
            } else {
                openRazorpayCheckout();
            }

            function openRazorpayCheckout() {
                const options = {
                    key: keyId,
                    amount: Math.round(amount * 100), // Convert to paise
                    currency: currency,
                    name: storeName,
                    description: `Order ${orderId}`,
                    order_id: orderId, // This MUST be the Razorpay Order ID (starting with order_)
                    prefill: {
                        name: customerName,
                        email: customerEmail,
                        contact: customerPhone
                    },
                    theme: {
                        color: '#667eea'
                    },
                    handler: function (response) {
                        // Payment successful
                        onSuccess({
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature
                        });
                        resolve(response);
                    },
                    modal: {
                        ondismiss: function () {
                            onFailure(new Error('Payment cancelled by user'));
                            reject(new Error('Payment cancelled'));
                        }
                    }
                };

                const rzp = new window.Razorpay(options);

                rzp.on('payment.failed', function (response) {
                    onFailure(new Error(response.error.description));
                    reject(new Error(response.error.description));
                });

                rzp.open();
            }
        } catch (error) {
            console.error('Razorpay payment error:', error);
            reject(error);
        }
    });
}

/**
 * Create Razorpay Order
 * Calls Cloud Function to create a Razorpay order
 */
export async function createRazorpayOrder(firestoreOrderId, amount, currency = 'INR') {
    try {
        // Construct the function URL
        // If running locally with emulators, this might need adjustment, but for deployed app:
        // const functionUrl = 'https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/createRazorpayOrder';

        // Dynamic URL based on environment could be better, but assuming standard Firebase setup
        // We'll try to determine the base URL or use a relative path if supported

        // Since we don't have the project ID handy in env vars usually in frontend without custom config,
        // we'll try to fetch it or use a relative path.
        // However, relative paths only work if hosted on Firebase Hosting with rewrites.
        // The user seems to be running locally (localhost:3000 possibly), so relative path won't work without proxy.
        // Assuming standard emulator or deployed function.

        // Let's try to infer project ID from current hostname if deployed, or use a placeholder the user needs to set?
        // Actually, we can check if we are in dev or prod.

        // FAST FIX: Use a hardcoded URL structure but we need the Project ID. 
        // I will assume for now we can use a relative path '/api/createRazorpayOrder' and add a proxy in vite config or user needs to add it.
        // OR better: use the firebase functions instance.

        // Let's try to find the project ID from .firebaserc

        // Using Firebase Hosting rewrite to avoid CORS and dynamic URL issues
        const response = await fetch('/api/razorpay/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderId: firestoreOrderId,
                amount: Math.round(amount * 100), // Convert to paise
                currency
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${errorText}`);
        }

        const data = await response.json();
        return data.razorpayOrderId;
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw error;
    }
}
