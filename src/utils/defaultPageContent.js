/**
 * Default content for static pages
 * Provides standard ecommerce content that can be used as-is or edited
 */

export const getDefaultPageContent = (pageType) => {
  const defaults = {
    about: `<h1>About Us</h1>
<p>Welcome to our online store! We are committed to providing quality products and excellent customer service to all our valued customers.</p>

<h2>Our Mission</h2>
<p>Our mission is to deliver the best shopping experience by offering high-quality products, competitive prices, and exceptional customer service. We strive to make online shopping convenient, reliable, and enjoyable for everyone.</p>

<h2>Our Values</h2>
<ul>
  <li><strong>Quality First:</strong> We carefully select products that meet our high standards of quality and durability.</li>
  <li><strong>Customer Satisfaction:</strong> Your happiness is our priority. We go the extra mile to ensure you're satisfied with your purchase.</li>
  <li><strong>Fast Delivery:</strong> We understand the importance of timely delivery and work hard to get your orders to you as quickly as possible.</li>
  <li><strong>Excellent Support:</strong> Our customer support team is always ready to help you with any questions or concerns.</li>
</ul>

<h2>Why Choose Us?</h2>
<p>With years of experience in e-commerce, we have built a reputation for reliability, quality, and customer service. We continuously improve our services and product offerings to better serve you.</p>

<h2>Our Story</h2>
<p>Founded with a vision to make quality products accessible to everyone, we have grown from a small startup to a trusted online retailer. Our journey has been driven by our commitment to customer satisfaction and our passion for excellence.</p>

<p>Thank you for choosing us for your shopping needs!</p>`,

    terms: `<h1>Terms & Conditions</h1>
<p>Please read these terms and conditions carefully before using our website and placing an order.</p>

<h2>1. Introduction</h2>
<p>By accessing and using this website, you accept and agree to be bound by the terms and conditions outlined below. If you do not agree to these terms, please do not use our website.</p>

<h2>2. Use of Service</h2>
<p>You agree to use our service only for lawful purposes and in a way that does not infringe on the rights of others or restrict or inhibit anyone else's use and enjoyment of the website.</p>

<h2>3. Orders</h2>
<ul>
  <li>All orders are subject to product availability</li>
  <li>Prices are subject to change without prior notice</li>
  <li>We reserve the right to refuse or cancel any order at our discretion</li>
  <li>Order confirmation will be sent via email or SMS</li>
  <li>You are responsible for providing accurate delivery information</li>
</ul>

<h2>4. Payment</h2>
<p>Payment must be made at the time of order placement unless otherwise agreed. We accept various payment methods including credit/debit cards, UPI, net banking, and cash on delivery (where available). All payments are processed securely through our payment gateway partners.</p>

<h2>5. Delivery</h2>
<p>We strive to deliver products in a timely manner. Delivery times are estimates and not guaranteed. Delivery charges may apply based on your location. We are not responsible for delays caused by third-party delivery services, natural disasters, or circumstances beyond our control.</p>

<h2>6. Returns & Refunds</h2>
<p>Please refer to our Cancellation & Refund Policy for detailed information about returns and refunds. Each case will be evaluated individually based on our policies.</p>

<h2>7. Product Information</h2>
<p>We make every effort to display accurate product information, including descriptions, images, and prices. However, we do not warrant that product descriptions or other content on this site is accurate, complete, reliable, current, or error-free.</p>

<h2>8. Limitation of Liability</h2>
<p>We are not liable for any indirect, incidental, or consequential damages arising from the use of our service or products purchased through our website.</p>

<h2>9. Intellectual Property</h2>
<p>All content on this website, including text, graphics, logos, images, and software, is the property of our store and is protected by copyright and other intellectual property laws.</p>

<h2>10. Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on this page. Your continued use of the website constitutes acceptance of the modified terms.</p>

<h2>11. Contact Information</h2>
<p>For questions about these terms, please contact us through the information provided on our Contact Us page.</p>`,

    privacy: `<h1>Privacy Policy</h1>
<p>We respect your privacy and are committed to protecting your personal information. This privacy policy explains how we collect, use, and safeguard your information when you use our website.</p>

<h2>Information We Collect</h2>
<p>We collect the following information when you place an order or interact with our website:</p>
<ul>
  <li><strong>Personal Information:</strong> Name, phone number, email address</li>
  <li><strong>Delivery Information:</strong> Delivery address, PIN code, landmark</li>
  <li><strong>Payment Information:</strong> Payment method details (processed securely through payment gateways - we do not store your full card details)</li>
  <li><strong>Technical Information:</strong> IP address, browser type, device information, pages visited</li>
  <li><strong>Account Information:</strong> If you create an account, we store your login credentials securely</li>
</ul>

<h2>How We Use Your Information</h2>
<p>Your information is used solely for:</p>
<ul>
  <li>Processing and delivering your orders</li>
  <li>Communicating with you about your orders and account</li>
  <li>Improving our service and website functionality</li>
  <li>Sending promotional offers and updates (only with your consent)</li>
  <li>Complying with legal obligations</li>
  <li>Preventing fraud and ensuring security</li>
</ul>

<h2>Information Sharing</h2>
<p>We do not sell, trade, or rent your personal information to third parties. We may share your information only with:</p>
<ul>
  <li>Delivery partners for order fulfillment</li>
  <li>Payment processors for transaction processing</li>
  <li>Legal authorities when required by law</li>
  <li>Service providers who assist us in operating our website (under strict confidentiality agreements)</li>
</ul>

<h2>Data Security</h2>
<p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. This includes:</p>
<ul>
  <li>SSL encryption for data transmission</li>
  <li>Secure storage of sensitive information</li>
  <li>Regular security audits and updates</li>
  <li>Access controls and authentication</li>
</ul>
<p>However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

<h2>Your Rights</h2>
<p>You have the right to:</p>
<ul>
  <li>Access your personal information</li>
  <li>Request correction of inaccurate information</li>
  <li>Request deletion of your information</li>
  <li>Opt-out of marketing communications</li>
  <li>Withdraw consent for data processing</li>
</ul>

<h2>Cookies</h2>
<p>We use cookies to enhance your browsing experience and analyze website traffic. Cookies are small text files stored on your device. You can choose to disable cookies through your browser settings, though this may affect website functionality.</p>

<h2>Third-Party Links</h2>
<p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.</p>

<h2>Children's Privacy</h2>
<p>Our website is not intended for children under the age of 18. We do not knowingly collect personal information from children.</p>

<h2>Contact Information</h2>
<p>For privacy-related questions or to exercise your rights, please contact us through the information provided on our Contact Us page.</p>

<h2>Changes to Privacy Policy</h2>
<p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.</p>

<p><em>Last updated: ${new Date().toLocaleDateString()}</em></p>`,

    shipping: `<h1>Shipping Policy</h1>
<p>We are committed to delivering your orders safely and on time. Please review our shipping policy below.</p>

<h2>Shipping Areas</h2>
<p>We currently ship to locations within India. Shipping charges and delivery times may vary based on your location. We are continuously expanding our shipping network to serve more areas.</p>

<h2>Shipping Charges</h2>
<ul>
  <li>Shipping charges are calculated based on your delivery location and order weight</li>
  <li>Free shipping may be available for orders above a certain amount (check product pages for details)</li>
  <li>Exact shipping costs will be displayed at checkout before you confirm your order</li>
  <li>Additional charges may apply for remote locations or special handling requirements</li>
</ul>

<h2>Delivery Time</h2>
<p>Standard delivery times:</p>
<ul>
  <li><strong>Metro Cities:</strong> 3-5 business days</li>
  <li><strong>Other Cities:</strong> 5-7 business days</li>
  <li><strong>Tier 2/3 Cities:</strong> 7-10 business days</li>
  <li><strong>Remote Areas:</strong> 10-15 business days</li>
</ul>
<p><em>Note: Delivery times are estimates and may vary due to factors beyond our control, including weather conditions, holidays, natural disasters, and third-party delivery service delays. Business days exclude Sundays and public holidays.</em></p>

<h2>Order Processing</h2>
<p>Orders are typically processed within 1-2 business days after payment confirmation. Processing time may be longer during sale periods or high-demand seasons. You will receive an order confirmation email/SMS with tracking details once your order is shipped.</p>

<h2>Tracking Your Order</h2>
<p>Once your order is shipped, you will receive a tracking number via email or SMS. You can use this number to track your order's status on our website or the courier's website. Real-time tracking updates will be available once the package is in transit.</p>

<h2>Delivery Attempts</h2>
<p>Our delivery partners will make up to 2-3 attempts to deliver your order. If delivery is unsuccessful after all attempts, the package may be returned to us. Please ensure someone is available to receive the order at the delivery address during business hours.</p>

<h2>Delivery Instructions</h2>
<p>You can provide special delivery instructions during checkout, such as:</p>
<ul>
  <li>Preferred delivery time</li>
  <li>Leave at door/security/reception</li>
  <li>Call before delivery</li>
  <li>Alternative contact person</li>
</ul>
<p>We will try our best to accommodate these requests, though we cannot guarantee them.</p>

<h2>Damaged or Lost Packages</h2>
<p>If your package arrives damaged or is lost in transit, please contact us immediately within 48 hours of delivery (or expected delivery date). We will investigate and work to resolve the issue, which may include replacement or refund as appropriate. Please keep the original packaging and take photos of any damage.</p>

<h2>International Shipping</h2>
<p>Currently, we do not offer international shipping. We are working on expanding our shipping services to more locations. Please check back with us or contact our customer support for updates.</p>

<h2>Multiple Items in One Order</h2>
<p>If your order contains multiple items, they may be shipped separately depending on availability and warehouse location. You will receive separate tracking numbers for each shipment. Shipping charges will be calculated for the entire order.</p>

<h2>Contact Us</h2>
<p>For any shipping-related questions or concerns, please contact us through our Contact Us page or customer support. We're here to help!</p>`,

    cancellation: `<h1>Cancellation & Refund Policy</h1>
<p>We want you to be completely satisfied with your purchase. Please review our cancellation and refund policy below.</p>

<h2>Cancellation Policy</h2>
<h3>Order Cancellation by Customer</h3>
<ul>
  <li>You can cancel your order before it is shipped</li>
  <li>To cancel, contact us through our customer support or use the cancellation option in your order details</li>
  <li>Once an order is shipped, it cannot be cancelled, but you may return it as per our return policy</li>
  <li>Cancellation requests are processed within 24 hours</li>
  <li>Refund for cancelled orders will be processed within 5-7 business days</li>
</ul>

<h3>Order Cancellation by Store</h3>
<p>We reserve the right to cancel an order in the following circumstances:</p>
<ul>
  <li>Product is out of stock or unavailable</li>
  <li>Pricing error or technical glitch</li>
  <li>Fraudulent or suspicious activity detected</li>
  <li>Inability to deliver to the provided address</li>
  <li>Violation of terms and conditions</li>
</ul>
<p>If we cancel your order, you will receive a full refund within 5-7 business days. We will notify you via email or SMS about the cancellation and reason.</p>

<h2>Refund Policy</h2>
<h3>Eligibility for Refund</h3>
<p>You are eligible for a refund in the following cases:</p>
<ul>
  <li>Order cancelled before shipment</li>
  <li>Product received is damaged, defective, or not as described</li>
  <li>Wrong product received</li>
  <li>Product not received (after investigation confirms non-delivery)</li>
  <li>Returned product meets our return policy criteria</li>
  <li>Duplicate payment or overpayment</li>
</ul>

<h3>Refund Process</h3>
<ol>
  <li>Contact us to initiate a refund request within the specified time period</li>
  <li>We will review your request and may request photos, videos, or additional information</li>
  <li>Once approved, refund will be processed to your original payment method</li>
  <li>Refunds typically take 5-10 business days to reflect in your account (may vary by payment method)</li>
  <li>You will receive a confirmation email/SMS once the refund is processed</li>
</ol>

<h3>Refund Amount</h3>
<ul>
  <li>Full refund for cancelled orders (before shipment)</li>
  <li>Full refund for damaged/defective/wrong products</li>
  <li>Shipping charges are non-refundable unless the error is on our part</li>
  <li>For returns, refund amount depends on product condition and return policy</li>
  <li>Partial refunds may apply for products with minor issues or if the product has been used</li>
</ul>

<h2>Return Policy</h2>
<h3>Return Eligibility</h3>
<p>Products can be returned within 7 days of delivery if:</p>
<ul>
  <li>Product is unused, unopened, and in original packaging with all tags and accessories</li>
  <li>Product is damaged or defective</li>
  <li>Wrong product was delivered</li>
  <li>Product does not match the description or images on our website</li>
  <li>Product has manufacturing defects</li>
</ul>

<h3>Non-Returnable Items</h3>
<ul>
  <li>Perishable items (food, beverages, etc.)</li>
  <li>Personalized, custom-made, or monogrammed products</li>
  <li>Items damaged due to misuse, negligence, or normal wear and tear</li>
  <li>Items without original packaging, tags, or accessories</li>
  <li>Intimate or personal care items (unless defective)</li>
  <li>Items purchased during clearance or final sale</li>
</ul>

<h3>Return Process</h3>
<ol>
  <li>Contact us within 7 days of delivery to initiate a return</li>
  <li>Provide order number, product details, and reason for return</li>
  <li>We will review your request and provide return authorization</li>
  <li>We will arrange for pickup or provide return instructions</li>
  <li>Package the product securely in original packaging with all accessories</li>
  <li>Once we receive and verify the product, refund will be processed</li>
</ol>

<h3>Return Shipping</h3>
<p>Return shipping charges:</p>
<ul>
  <li>Free returns for damaged, defective, or wrong products</li>
  <li>Customer pays return shipping for change of mind or size exchanges</li>
  <li>Return shipping charges will be deducted from refund amount if applicable</li>
</ul>

<h2>Exchange Policy</h2>
<p>We currently do not offer direct exchanges. If you wish to exchange a product:</p>
<ol>
  <li>Return the original product as per our return policy</li>
  <li>Once return is processed, place a new order for the desired item</li>
  <li>We will process the refund for the returned item separately</li>
</ol>
<p><em>Note: For size exchanges of clothing items, please contact us and we may be able to arrange a direct exchange.</em></p>

<h2>Refund Timeline</h2>
<ul>
  <li><strong>Order Cancellation:</strong> 5-7 business days</li>
  <li><strong>Return Refund:</strong> 5-10 business days after product verification</li>
  <li><strong>Payment Method:</strong> Refund will be processed to the original payment method used</li>
  <li><strong>Bank Transfer:</strong> May take additional 2-3 business days</li>
</ul>

<h2>Contact Us</h2>
<p>For cancellation, refund, or return requests, please contact us through our Contact Us page or customer support. We aim to resolve all issues within 2-3 business days. Please have your order number ready when contacting us.</p>`,

    contact: `<h1>Contact Us</h1>
<p>We're here to help! Get in touch with us through any of the following methods.</p>

<h2>Store Information</h2>
<p>We are committed to providing excellent customer service and are available to assist you with any questions, concerns, or feedback. Our team is dedicated to ensuring your shopping experience is smooth and enjoyable.</p>

<h2>Contact Methods</h2>
<h3>Phone Support</h3>
<p>Call us during business hours for immediate assistance with your orders and inquiries. Our customer support team is ready to help you with:</p>
<ul>
  <li>Order placement and tracking</li>
  <li>Product information and recommendations</li>
  <li>Payment and billing queries</li>
  <li>Returns and refunds</li>
  <li>Technical support</li>
</ul>
<p><strong>Phone:</strong> [Your phone number will be displayed here]</p>

<h3>WhatsApp</h3>
<p>Message us on WhatsApp for quick responses to your queries. We respond to WhatsApp messages during business hours. This is a great way to get quick answers to your questions.</p>
<p><strong>WhatsApp:</strong> [Your WhatsApp number will be displayed here]</p>

<h3>Email</h3>
<p>Send us an email and we'll get back to you within 24-48 hours. For detailed inquiries or documentation, email is the best option.</p>
<p><strong>Email:</strong> [Your email will be displayed here]</p>
<p><em>Please include your order number (if applicable) in the subject line for faster response.</em></p>

<h2>Business Hours</h2>
<p><strong>Monday - Saturday:</strong> 9:00 AM - 8:00 PM<br>
<strong>Sunday:</strong> 10:00 AM - 6:00 PM</p>
<p><em>Note: Business hours may vary during holidays and festivals. We will notify customers of any changes through our website or social media.</em></p>

<h2>Response Time</h2>
<ul>
  <li><strong>Phone/WhatsApp:</strong> Immediate response during business hours</li>
  <li><strong>Email:</strong> Within 24-48 hours</li>
  <li><strong>Order-related queries:</strong> Priority support, typically within 2-4 hours</li>
  <li><strong>Urgent issues:</strong> Please call us for immediate assistance</li>
</ul>

<h2>What We Can Help With</h2>
<ul>
  <li>Order status and tracking</li>
  <li>Product information and recommendations</li>
  <li>Shipping and delivery queries</li>
  <li>Returns and refunds</li>
  <li>Payment issues and billing questions</li>
  <li>Account-related questions</li>
  <li>Website navigation and technical support</li>
  <li>General inquiries and feedback</li>
</ul>

<h2>Visit Us</h2>
<p>If you prefer to visit us in person, please check our store address and timings. We'd love to meet you! Please call ahead to confirm our availability and schedule an appointment if needed.</p>

<h2>Feedback</h2>
<p>We value your feedback! If you have suggestions, complaints, or compliments, please don't hesitate to reach out. Your input helps us improve our services and serve you better. We take all feedback seriously and use it to enhance your shopping experience.</p>

<h2>Social Media</h2>
<p>Follow us on social media for updates, new products, special offers, and behind-the-scenes content:</p>
<ul>
  <li><strong>Facebook:</strong> [Your Facebook page]</li>
  <li><strong>Instagram:</strong> [Your Instagram profile]</li>
  <li><strong>YouTube:</strong> [Your YouTube channel]</li>
</ul>
<p>You can also message us on social media, and we'll respond as quickly as possible.</p>

<h2>Frequently Asked Questions</h2>
<p>Before contacting us, you might find answers to common questions in our FAQ section or other policy pages (Shipping, Returns, etc.). However, if you still need assistance, we're always happy to help!</p>

<p>Thank you for choosing us. We look forward to serving you!</p>`
  };

  return defaults[pageType] || '';
};
