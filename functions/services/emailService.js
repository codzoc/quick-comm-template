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
 * Returns SMTP credentials only (user, password)
 * Note: storeName is NOT stored here - use getStoreInfo() to get storeName from storeInfo/contact
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
 * Get store information from Firestore
 * Uses storeInfo/contact collection with storeName field
 */
async function getStoreInfo() {
    try {
        const storeInfoDoc = await admin.firestore()
            .collection('storeInfo')
            .doc('contact')
            .get();
        
        if (storeInfoDoc.exists) {
            const data = storeInfoDoc.data();
            const storeName = data.storeName;
            if (storeName) {
                return {
                    storeName: storeName,
                    currencySymbol: data.currencySymbol || '₹',
                    logoUrl: data.logoUrl || data.storeIcon || ''
                };
            }
        }

        // Return default if nothing found
        return {
            storeName: 'Our Store',
            currencySymbol: '₹',
            logoUrl: ''
        };
    } catch (error) {
        console.error('Error fetching store info:', error);
        return {
            storeName: 'Our Store',
            currencySymbol: '₹',
            logoUrl: ''
        };
    }
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

function isColorValue(value) {
    if (!value) return false;
    const normalized = String(value).trim();
    return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(normalized) || /^rgb(a?)\(/i.test(normalized);
}

function getItemDisplayImage(item) {
    if (item.images && item.images.length > 0) return item.images[0];
    if (item.imagePath) return item.imagePath;
    return '/images/placeholder.png';
}

function renderSelectedAttributesHtml(selectedAttributes = []) {
    if (!selectedAttributes || selectedAttributes.length === 0) return '';

    const parts = selectedAttributes.map((entry) => {
        const name = escapeHtml(entry.name || 'Option');
        const value = entry.value || '';

        if (isColorValue(value)) {
            return `<span style="display: inline-flex; align-items: center; gap: 4px; margin-right: 10px; margin-top: 3px;">
  <span>${name}:</span>
  <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 1px solid #d1d5db; background-color: ${escapeHtml(value)};"></span>
  <span>${escapeHtml(value)}</span>
</span>`;
        }

        return `<span style="display: inline-block; margin-right: 10px; margin-top: 3px;">${name}: ${escapeHtml(value)}</span>`;
    });

    return `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${parts.join('')}</div>`;
}

function renderStoreLogoHtml(logoUrl, storeName) {
    if (!logoUrl) return '';
    return `<div style="margin-bottom: 14px;">
  <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(storeName || 'Store logo')}" style="max-height: 46px; max-width: 170px; object-fit: contain; display: inline-block;" />
</div>`;
}

/**
 * Load partial template
 */
function loadPartial(partialName, data) {
    const partialPath = path.join(__dirname, '..', 'templates', 'partials', `${partialName}.html`);
    let partial = fs.readFileSync(partialPath, 'utf8');

    // Replace placeholders in partial
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        const htmlFields = ['itemsHtml', 'paymentStatus', 'newStatusBadge', 'statusMessage', 'storeLogoHtml'];
        const value = htmlFields.includes(key)
            ? (data[key] || '')
            : escapeHtml(String(data[key] || ''));
        partial = partial.replace(regex, value);
    });

    return partial;
}

/**
 * Load and process email template
 */
function loadTemplate(templateName, data) {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf8');

    // Load header and footer partials if they exist in the template
    if (template.includes('{{header}}')) {
        const headerData = {
            emailTitle: data.emailTitle || 'Email',
            headerTitle: data.headerTitle || '',
            headerSubtitle: data.headerSubtitle || '',
            headerGradientStart: data.headerGradientStart || '#667eea',
            headerGradientEnd: data.headerGradientEnd || '#764ba2',
            storeLogoHtml: data.storeLogoHtml || ''
        };
        template = template.replace('{{header}}', loadPartial('header', headerData));
    }

    if (template.includes('{{footer}}')) {
        const footerData = {
            footerMessage: data.footerMessage || 'If you have any questions, please don\'t hesitate to contact us.',
            storeName: data.storeName || 'Our Store'
        };
        template = template.replace('{{footer}}', loadPartial('footer', footerData));
    }

    // Replace placeholders with actual data (escaped for security)
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        // Don't escape HTML content (itemsHtml, paymentStatus, newStatusBadge, statusMessage)
        const htmlFields = ['itemsHtml', 'paymentStatus', 'newStatusBadge', 'statusMessage', 'storeLogoHtml'];
        const value = htmlFields.includes(key)
            ? (data[key] || '')
            : escapeHtml(String(data[key] || ''));
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
        
        // Always fetch latest store info so logo and branding stay current.
        const liveStoreInfo = await getStoreInfo();
        const storeInfo = {
            ...liveStoreInfo,
            storeName: orderDetails.storeName || liveStoreInfo.storeName,
            currencySymbol: orderDetails.currencySymbol || liveStoreInfo.currencySymbol
        };

        // Format items list (titles will be escaped by loadTemplate)
        const itemsHtml = orderDetails.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="width: 46px; vertical-align: top; padding-right: 8px;">
                <img src="${escapeHtml(getItemDisplayImage(item))}" alt="${escapeHtml(item.title)}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb;" />
              </td>
              <td style="vertical-align: top;">
                <strong>${escapeHtml(item.title)}</strong><br>
                ${renderSelectedAttributesHtml(item.selectedAttributes)}
                <small style="color: #6b7280;">Quantity: ${item.quantity}</small>
              </td>
            </tr>
          </table>
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

        const templateData = {
            // Header data
            emailTitle: `Order Confirmation - ${orderDetails.orderId}`,
            headerTitle: 'Order Confirmed!',
            headerSubtitle: 'Thank you for your order',
            headerGradientStart: '#667eea',
            headerGradientEnd: '#764ba2',
            storeLogoHtml: renderStoreLogoHtml(storeInfo.logoUrl, storeInfo.storeName),
            // Footer data
            footerMessage: 'If you have any questions about your order, please don\'t hesitate to contact us.',
            // Content data
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
            storeName: storeInfo.storeName
        };

        const html = loadTemplate('orderConfirmation', templateData);

        const mailOptions = {
            from: `"${storeInfo.storeName}" <${config.smtp.user}>`,
            to: orderDetails.to,
            subject: `Order Confirmation - ${orderDetails.orderId} - ${storeInfo.storeName}`,
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

        // Get store info
        const storeInfo = await getStoreInfo();

        const templateData = {
            // Header data
            emailTitle: `Payment Received - ${paymentDetails.orderId}`,
            headerTitle: 'Payment Received!',
            headerSubtitle: 'Your payment has been successfully processed',
            headerGradientStart: '#10B981',
            headerGradientEnd: '#059669',
            // Footer data
            footerMessage: 'Thank you for your purchase! If you have any questions, please contact our support team.',
            storeName: storeInfo.storeName,
            // Content data
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
            from: `"${storeInfo.storeName}" <${config.smtp.user}>`,
            to: paymentDetails.to,
            subject: `Payment Received - ${paymentDetails.orderId} - ${storeInfo.storeName}`,
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

/**
 * Send welcome email to new customer
 */
async function sendWelcomeEmail(customerDetails) {
    try {
        const transporter = await createTransporter();
        const config = await getEmailConfig();

        // Get store info
        const storeInfo = await getStoreInfo();
        const storeName = storeInfo.storeName;
        
        // Try to get website URL from store settings
        const storeSettingsDoc = await admin.firestore()
            .collection('store_settings')
            .doc('store_info')
            .get();
        const storeSettings = storeSettingsDoc.exists ? storeSettingsDoc.data() : {};
        const storeUrl = storeSettings.website || 'https://yourstore.com';

        const templateData = {
            // Header data
            emailTitle: `Welcome to ${storeName}!`,
            headerTitle: `Welcome to ${storeName}!`,
            headerSubtitle: 'We\'re excited to have you',
            headerGradientStart: '#667eea',
            headerGradientEnd: '#764ba2',
            // Footer data
            footerMessage: 'If you have any questions, feel free to reach out to us. We\'re here to help!',
            storeName: storeName,
            // Content data
            customerName: customerDetails.name,
            storeUrl: storeUrl
        };

        const html = loadTemplate('welcome', templateData);

        const mailOptions = {
            from: `"${storeName}" <${config.smtp.user}>`,
            to: customerDetails.email,
            subject: `Welcome to ${storeName}!`,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
}

/**
 * Send order status change email
 */
async function sendOrderStatusChangeEmail(statusDetails) {
    try {
        const transporter = await createTransporter();
        const config = await getEmailConfig();

        // Get store info
        const storeInfo = await getStoreInfo();

        // Format status badge
        const statusColors = {
            'pending': { color: '#F59E0B', text: 'Pending' },
            'processing': { color: '#3B82F6', text: 'Processing' },
            'completed': { color: '#10B981', text: 'Completed' },
            'cancelled': { color: '#EF4444', text: 'Cancelled' },
            'paid': { color: '#10B981', text: 'Paid' },
            'refunded': { color: '#6B7280', text: 'Refunded' }
        };

        const statusInfo = statusColors[statusDetails.newStatus] || { color: '#6B7280', text: statusDetails.newStatus };
        const newStatusBadge = `<span style="color: ${statusInfo.color}; font-weight: 600; font-size: 16px;">${statusInfo.text}</span>`;

        // Status messages
        const statusMessages = {
            'pending': 'Your order is pending and will be processed soon.',
            'processing': 'Great news! Your order is now being processed and prepared for shipment.',
            'completed': 'Your order has been completed and delivered. Thank you for your purchase!',
            'cancelled': 'Your order has been cancelled. If you have any questions, please contact us.',
            'paid': 'Your payment has been confirmed. Your order is now being processed.',
            'refunded': 'Your order has been refunded. The refund will be processed according to your payment method.'
        };

        const statusMessage = statusMessages[statusDetails.newStatus] || 'Your order status has been updated.';

        const templateData = {
            // Header data
            emailTitle: `Order Status Update - ${statusDetails.orderId}`,
            headerTitle: 'Order Status Update',
            headerSubtitle: 'Your order status has been updated',
            headerGradientStart: '#667eea',
            headerGradientEnd: '#764ba2',
            // Footer data
            footerMessage: 'If you have any questions about your order, please don\'t hesitate to contact us.',
            storeName: storeInfo.storeName,
            // Content data
            customerName: statusDetails.customerName,
            orderId: statusDetails.orderId,
            previousStatus: statusDetails.previousStatus || 'N/A',
            newStatusBadge: newStatusBadge,
            statusMessage: statusMessage
        };

        const html = loadTemplate('orderStatusChange', templateData);

        const mailOptions = {
            from: `"${storeInfo.storeName}" <${config.smtp.user}>`,
            to: statusDetails.to,
            subject: `Order Status Update - ${statusDetails.orderId} - ${storeInfo.storeName}`,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order status change email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending order status change email:', error);
        throw error;
    }
}

/**
 * Send store owner notification email for new orders
 */
async function sendStoreOwnerNotificationEmail(orderDetails) {
    try {
        const transporter = await createTransporter();
        const config = await getEmailConfig();

        // Always fetch latest store info so logo and branding stay current.
        const liveStoreInfo = await getStoreInfo();
        const storeInfo = {
            ...liveStoreInfo,
            storeName: orderDetails.storeName || liveStoreInfo.storeName,
            currencySymbol: orderDetails.currencySymbol || liveStoreInfo.currencySymbol
        };

        // Get store owner email from settings
        const emailSettingsDoc = await admin.firestore()
            .collection('store_settings')
            .doc('email_settings')
            .get();

        const emailSettings = emailSettingsDoc.exists ? emailSettingsDoc.data() : {};
        const storeOwnerEmail = emailSettings.storeOwnerEmail || config.smtp.user;

        // Format items list
        const itemsHtml = orderDetails.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="width: 46px; vertical-align: top; padding-right: 8px;">
                <img src="${escapeHtml(getItemDisplayImage(item))}" alt="${escapeHtml(item.title)}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb;" />
              </td>
              <td style="vertical-align: top;">
                <strong>${escapeHtml(item.title)}</strong><br>
                ${renderSelectedAttributesHtml(item.selectedAttributes)}
                <small style="color: #6b7280;">Quantity: ${item.quantity}</small>
              </td>
            </tr>
          </table>
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
        const paymentStatusText = orderDetails.paymentStatus === 'completed' || orderDetails.paymentStatus === 'paid'
            ? '<span style="color: #10B981;">Paid</span>'
            : '<span style="color: #F59E0B;">Pending</span>';

        const templateData = {
            // Header data
            emailTitle: `New Order Received - ${orderDetails.orderId}`,
            headerTitle: 'New Order Received!',
            headerSubtitle: 'You have a new order to process',
            headerGradientStart: '#F59E0B',
            headerGradientEnd: '#D97706',
            storeLogoHtml: renderStoreLogoHtml(storeInfo.logoUrl, storeInfo.storeName),
            // Footer data
            footerMessage: 'Please log in to your admin panel to process this order.',
            storeName: orderDetails.storeName,
            // Content data
            orderId: orderDetails.orderId,
            orderDate: orderDetails.orderDate.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            customerName: orderDetails.customer.name || 'N/A',
            customerEmail: orderDetails.customer.email || 'N/A',
            customerPhone: orderDetails.customer.phone || 'N/A',
            itemsHtml: itemsHtml,
            subtotal: `${orderDetails.currencySymbol}${orderDetails.subtotal.toFixed(2)}`,
            tax: `${orderDetails.currencySymbol}${orderDetails.tax.toFixed(2)}`,
            shipping: `${orderDetails.currencySymbol}${orderDetails.shipping.toFixed(2)}`,
            total: `${orderDetails.currencySymbol}${orderDetails.total.toFixed(2)}`,
            paymentMethod: paymentMethodText,
            paymentStatus: paymentStatusText,
            shippingAddress: `${orderDetails.customer.address}, ${orderDetails.customer.pin}`,
            storeName: storeInfo.storeName
        };

        const html = loadTemplate('storeOwnerNotification', templateData);

        const mailOptions = {
            from: `"${storeInfo.storeName}" <${config.smtp.user}>`,
            to: storeOwnerEmail,
            subject: `New Order Received - ${orderDetails.orderId}`,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Store owner notification email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending store owner notification email:', error);
        throw error;
    }
}

module.exports = {
    sendOrderConfirmationEmail,
    sendPaymentConfirmationEmail,
    sendWelcomeEmail,
    sendOrderStatusChangeEmail,
    sendStoreOwnerNotificationEmail,
    getStoreInfo
};
