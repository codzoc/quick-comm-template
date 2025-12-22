const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

/**
 * Email Service
 * Handles sending transactional emails using Gmail SMTP
 */

/**
 * Get email configuration from Firestore
 */
async function getEmailConfig() {
    const settingsDoc = await admin.firestore()
        .collection('store_settings')
        .doc('email_settings')
        .get();

    if (!settingsDoc.exists) {
        throw new Error('Email settings not configured');
    }

    const settings = settingsDoc.data();

    if (!settings.smtp?.user || !settings.smtp?.password) {
        throw new Error('SMTP credentials not configured');
    }

    return settings;
}

/**
 * Create email transporter
 */
async function createTransporter() {
    const config = await getEmailConfig();

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.smtp.user,
            pass: config.smtp.password
        }
    });
}

/**
 * Load and process email template
 */
function loadTemplate(templateName, data) {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders with actual data
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, data[key] || '');
    });

    return template;
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmationEmail(orderDetails) {
    try {
        const transporter = await createTransporter();
        const config = await getEmailConfig();

        // Format items list
        const itemsHtml = orderDetails.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.title}</strong><br>
          <small>Quantity: ${item.quantity}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${orderDetails.currencySymbol}${item.subtotal.toFixed(2)}
        </td>
      </tr>
    `).join('');

        // Format payment method
        let paymentMethodText = 'Cash on Delivery';
        if (orderDetails.paymentMethod === 'stripe') {
            paymentMethodText = 'Credit/Debit Card (Stripe)';
        } else if (orderDetails.paymentMethod === 'razorpay') {
            paymentMethodText = 'Online Payment (Razorpay)';
        }

        // Format payment status
        const paymentStatusText = orderDetails.paymentStatus === 'completed'
            ? '<span style="color: #10B981;">Paid</span>'
            : '<span style="color: #F59E0B;">Pending</span>';

        const templateData = {
            customerName: orderDetails.customerName,
            orderId: orderDetails.orderId,
            orderDate: orderDetails.orderDate.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            itemsHtml: itemsHtml,
            subtotal: `${orderDetails.currencySymbol}${orderDetails.subtotal.toFixed(2)}`,
            tax: `${orderDetails.currencySymbol}${orderDetails.tax.toFixed(2)}`,
            shipping: `${orderDetails.currencySymbol}${orderDetails.shipping.toFixed(2)}`,
            total: `${orderDetails.currencySymbol}${orderDetails.total.toFixed(2)}`,
            paymentMethod: paymentMethodText,
            paymentStatus: paymentStatusText,
            shippingAddress: `${orderDetails.customer.address}, ${orderDetails.customer.pin}`,
            storeName: orderDetails.storeName
        };

        const html = loadTemplate('orderConfirmation', templateData);

        const mailOptions = {
            from: `"${orderDetails.storeName}" <${config.smtp.user}>`,
            to: orderDetails.to,
            subject: `Order Confirmation - ${orderDetails.orderId}`,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        throw error;
    }
}

/**
 * Send payment confirmation email
 */
async function sendPaymentConfirmationEmail(paymentDetails) {
    try {
        const transporter = await createTransporter();
        const config = await getEmailConfig();

        const templateData = {
            orderId: paymentDetails.orderId,
            transactionId: paymentDetails.transactionId,
            amount: `${paymentDetails.currency} ${paymentDetails.amount.toFixed(2)}`,
            paymentMethod: paymentDetails.paymentMethod,
            paymentDate: new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        const html = loadTemplate('paymentConfirmation', templateData);

        const mailOptions = {
            from: `"${config.storeName || 'Our Store'}" <${config.smtp.user}>`,
            to: paymentDetails.to,
            subject: `Payment Received - ${paymentDetails.orderId}`,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Payment confirmation email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending payment confirmation email:', error);
        throw error;
    }
}

module.exports = {
    sendOrderConfirmationEmail,
    sendPaymentConfirmationEmail
};
