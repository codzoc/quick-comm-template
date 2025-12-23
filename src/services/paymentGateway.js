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
                    order_id: orderId, // This should be created via Razorpay API
                    prefill: {
                        name: customerName,
                        email: customerEmail,
                        contact: customerPhone
                    },
                    notes: {
                        orderId: orderId
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
 * Create Razorpay Order (should be called from backend)
 * This is a placeholder - actual implementation should be in Cloud Functions
 */
export async function createRazorpayOrder(orderId, amount, currency = 'INR') {
    // This should call your Cloud Function to create a Razorpay order
    // For now, returning a mock response
    try {
        const response = await fetch('YOUR_CLOUD_FUNCTION_URL/createRazorpayOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderId,
                amount: Math.round(amount * 100),
                currency
            })
        });

        const data = await response.json();
        return data.razorpayOrderId;
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw error;
    }
}
