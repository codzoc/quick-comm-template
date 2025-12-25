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
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Convert hex color to rgba string
 */
function hexToRgba(hex, alpha = 1) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse RGB values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Load and process email template
 */
function loadTemplate(templateName, data) {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders with actual data (escaped for security)
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        // Don't escape HTML content (itemsHtml, paymentStatus) or color values
        const isHtmlContent = key === 'itemsHtml' || key === 'paymentStatus';
        const isColorValue = key === 'primaryColor' || key === 'primaryHoverColor' || key === 'secondaryColor' || key === 'secondaryColorLight';
        const value = (isHtmlContent || isColorValue)
            ? (data[key] || '')
            : escapeHtml(data[key]);
        template = template.replace(regex, value);
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

        // Format items list (titles will be escaped by loadTemplate)
        const itemsHtml = orderDetails.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${escapeHtml(item.title)}</strong><br>
          <small>Quantity: ${item.quantity}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${escapeHtml(orderDetails.currencySymbol)}${item.subtotal.toFixed(2)}
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

        // Get theme colors (defaults if not provided)
        const themeColors = orderDetails.themeColors || {
            primary: '#667eea',
            primaryHover: '#764ba2',
            secondary: '#10B981'
        };

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
            storeName: orderDetails.storeName,
            primaryColor: themeColors.primary,
            primaryHoverColor: themeColors.primaryHover,
            secondaryColor: themeColors.secondary
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

        // Get store info for email
        const storeInfoDoc = await admin.firestore()
            .collection('storeInfo')
            .doc('contact')
            .get();

        const storeInfo = storeInfoDoc.exists ? storeInfoDoc.data() : {};
        const storeName = storeInfo.storeName || storeInfo.name || 'Our Store';

        // Get theme colors for email styling
        const themeDoc = await admin.firestore()
            .collection('settings')
            .doc('theme')
            .get();

        let themeColors = {
            primary: '#667eea',
            primaryHover: '#764ba2',
            secondary: '#10B981'
        };

        if (themeDoc.exists) {
            const themeData = themeDoc.data();
            // Handle template-based theme
            if (themeData.templateKey) {
                // If custom overrides exist, use them (they override template defaults)
                if (themeData.customOverrides?.colors) {
                    themeColors = {
                        primary: themeData.customOverrides.colors.primary || themeColors.primary,
                        primaryHover: themeData.customOverrides.colors.primaryHover || themeData.customOverrides.colors.primary || themeColors.primaryHover,
                        secondary: themeData.customOverrides.colors.secondary || themeColors.secondary
                    };
                }
                // Note: If no customOverrides, we use defaults. In a full implementation,
                // we could fetch the template colors, but defaults work fine for most cases.
            } else if (themeData.theme?.colors) {
                // Legacy theme format
                themeColors = {
                    primary: themeData.theme.colors.primary || themeColors.primary,
                    primaryHover: themeData.theme.colors.primaryHover || themeData.theme.colors.primary || themeColors.primaryHover,
                    secondary: themeData.theme.colors.secondary || themeColors.secondary
                };
            }
        }

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
            }),
            storeName: storeName,
            primaryColor: themeColors.primary,
            primaryHoverColor: themeColors.primaryHover,
            secondaryColor: themeColors.secondary,
            secondaryColorLight: hexToRgba(themeColors.secondary, 0.1)
        };

        const html = loadTemplate('paymentConfirmation', templateData);

        const mailOptions = {
            from: `"${storeName}" <${config.smtp.user}>`,
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
