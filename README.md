# Quick Commerce Template

A simple, browser-only React + Firebase e-commerce template designed for non-coders. Set up your online store entirely through your browser - no terminal, no coding required!

## Quick Start Summary

**5 Simple Steps to Launch Your Store:**

1. **Create your repo**: Click "Use this template" → Create private repository
2. **Set up Firebase**: Create Firebase project, enable Firestore, Authentication, and Hosting
3. **Add secrets**: Copy 2 JSON configs to GitHub Secrets (use [JSON validator](https://jsonformatter.curiousconcept.com/))
4. **Create admin user**: Add your email/password in Firebase Console + Firestore admins collection
5. **Deploy**: Run GitHub Actions workflow → Your store is live!

**Helpful Tools:**
- 🔧 [JSON Validator](https://jsonformatter.curiousconcept.com/) - Validate Firebase config
- 🖼️ Built-in image upload with automatic compression and optimization

---

## 🔄 Receive Updates from the Template

This template is actively maintained with bug fixes, new features, and improvements! Your store **automatically updates** every week, or you can trigger updates manually with one click.

### One-Time Setup (Required for PR Creation)

For the workflow to create Pull Requests when conflicts occur, you need to enable one setting:

1. Go to your repository **Settings** tab
2. Click **Actions** → **General** in the left sidebar
3. Scroll down to **"Workflow permissions"**
4. Check the box: ☑️ **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

**Why?** GitHub blocks Actions from creating PRs by default for security. This one-time setting allows the update workflow to create PRs when conflicts need manual resolution.

### Automatic Updates (Default)

Your store automatically checks for updates **every Monday at 9 AM UTC** and applies them to your `main` branch. No action needed!

### Manual Updates (On-Demand)

Want to update immediately? Here's how:

1. **Go to your repository** on GitHub
2. Click on the **Actions** tab
3. Select **"Update from template"** workflow from the left sidebar
4. Click **"Run workflow"** → Click **"Run workflow"** button
5. Wait 1-2 minutes - **your main branch is updated automatically!**

That's it! Your store is now running the latest version.

### What You Get

- ✨ New features and enhancements
- 🐛 Bug fixes and security patches
- 📚 Documentation improvements
- 🎨 UI/UX improvements
- ⚡ Performance optimizations

### How It Works

The workflow intelligently handles updates in two ways:

**✅ If there are NO conflicts:**
1. Fetches the latest changes from the template
2. Automatically merges them into your `main` branch
3. Pushes the updates - **your site deploys automatically!**

**⚠️ If there ARE conflicts:**
1. Creates a Pull Request with the updates
2. Shows exactly which files have conflicts
3. You resolve conflicts in GitHub's web editor (no terminal needed!)
4. Merge the PR when done

**Either way, you're covered!** 🎉

### What If There Are Conflicts?

Don't worry - this is easy to fix in your browser!

When conflicts occur, the workflow automatically creates a PR. Then you:

1. **Open the Pull Request** (you'll get a notification)
2. Click the **"Resolve conflicts"** button
3. **Edit each file** - GitHub shows you exactly what's conflicting:
   ```
   <<<<<<< Your current code
   Your code here
   =======
   Template's new code
   >>>>>>> Template code
   ```
4. **Keep what you want** - delete the conflict markers and unwanted code
5. Click **"Mark as resolved"** for each file
6. Click **"Commit merge"**
7. **Merge the PR** - done!

**No terminal, no git commands, all in your browser!** 🎉

### Disable Automatic Updates

Prefer manual control?

1. Edit `.github/workflows/update-from-template.yml`
2. Remove or comment out the `schedule:` section (lines 12-13)
3. Commit the change

Now updates only happen when you manually trigger the workflow.

**Pro tip**: Keep your customizations in dedicated files (like `src/config/business.js` for store info) to minimize conflicts.

---

## ✨ Recent Updates

### Image Upload & Management (New!)
- **Built-in image upload** - No external hosting needed! Upload directly to Firebase Storage
- **Automatic compression & resizing**:
  - Product images: Max 1024px width, auto-compressed
  - Logo images: Max 512px width, auto-compressed
- **Multiple images per product** - Upload several images, first one is main display
- **Image gallery slider** - Customers can click product images to view all images in a full-screen slider
- **Clean file naming** - Images named as `{productId}_1.jpg`, `{productId}_2.jpg`, etc.
- **Logo upload** - Upload store logo and icon directly (height-based display)
- **Static page images** - Upload images for About, Terms, Privacy pages

All images are automatically optimized for fast loading and stored securely in Firebase Storage. The system handles compression, resizing, and file management automatically.

---

## Features

### Customer-Facing
- **Product catalog** with real-time search functionality
- **Product image gallery** - click any product image to view multiple images in a full-screen slider
- **Shopping cart** with real-time stock validation
- **Customer accounts** with login/signup
  - Save multiple delivery addresses
  - View order history with status tracking
  - Update profile information
  - Secure authentication with email/password
- **Guest checkout** option (checkout without creating account)
- **Optional account creation** during checkout
- Mobile-responsive design with professional layout
- Order placement with customer info collection
- WhatsApp integration for order tracking
- Out-of-stock badges and inventory tracking
- Discount pricing support with percentage badges
- Dynamic currency symbol support (₹, $, €, £, ¥, د.إ, SR)
- Decimal formatting for all prices
- Responsive cart modal with column-based layout
- Static pages: About Us, Terms & Conditions, Privacy Policy

### Admin Panel
- **Secure admin authentication** with role-based access control
- **Admin accounts management**: Add/remove admin users by email
- **Customer management**: View all customer accounts and order history
- **Product management** (CRUD operations)
  - **Multiple images per product** with automatic compression and resizing
  - **Image upload** directly to Firebase Storage (no external hosting needed)
  - **Automatic image optimization**: Products max 1024px width, auto-compressed
  - **Image gallery slider** - customers can view all product images in a popup
- **Order management** with status tracking (Pending, Processing, Completed, Cancelled)
- Enhanced dashboard with order statistics and low stock alerts
- **Store settings** with tabbed interface:
  - **General**: Store name, **logo upload**, **store icon upload**, contact info, social media
  - **Appearance**: Theme templates (Professional, Vibrant, Minimal, Elegant, Modern)
  - **Pages**: WYSIWYG editor for About, Terms, Privacy pages with **image upload**
  - **SEO**: Meta title, description, keywords
  - **Pricing**: Currency symbol, tax percentage, shipping cost
  - **Payment**: Configure payment methods (COD, Stripe, Razorpay) and email notifications
- Settings tab persistence via URL parameters
- **Built-in image upload** with automatic compression (logos max 512px width)

### Security & Authentication
- **Role-based access control**: Separate admin and customer sessions
- **Protected routes**: Unauthorized users redirected to appropriate login
- **Secure authentication**: Firebase Auth with email/password
- **Session management**: LocalStorage-based session tracking
- **Admin verification**: Firestore-based admin role verification
- **Customer data protection**: Customers can only access their own data

### Developer-Friendly
- 100% browser-based setup
- Google Fonts integration (just specify font name)
- PR preview deployments for testing
- Multiple theme templates to choose from
- WYSIWYG editor (ReactQuill) for static pages
- Mobile-first, responsive design
- Firebase hosting included
- Automatic CI/CD via GitHub Actions
- React Router for navigation
- Material-UI components for admin panel

## Browser-Only Setup Guide

### Prerequisites
- GitHub account (free)
- Firebase account (free)
- No local development environment needed!

### Helpful Tools
- **JSON Validator**: [jsonformatter.curiousconcept.com](https://jsonformatter.curiousconcept.com/) - Validate and format your Firebase config JSON
- **Built-in Image Upload**: All images are automatically compressed and optimized when uploaded through the admin panel

---

## Step 1: Create Your Repository from Template

1. Click the green "Use this template" button at the top of this repository
2. Select "Create a new repository"
3. Choose a name for your store (e.g., `my-online-store`)
4. Select "Private" for repository visibility (recommended)
5. Click "Create repository from template"
6. This creates your own private copy of the template

---

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., `my-store`)
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Enable Firebase Services

#### A. Enable Firestore Database ⚠️ **REQUIRED**
1. In Firebase Console, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Select "Start in production mode" (don't worry, we'll deploy custom rules via GitHub Actions)
4. Choose a location closest to your customers
5. Click "Enable"
6. Wait for the database to be created (this takes 1-2 minutes)

**Important**: This step enables the Firestore API and creates the database. Without this, the GitHub Actions deployment will fail with permission errors. The security rules you see in the console will be automatically replaced when you deploy via GitHub Actions.

#### B. Enable Authentication
1. Go to "Build" > "Authentication"
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Click "Save"

#### C. Enable Storage ⚠️ **REQUIRED for Image Uploads**
1. Go to "Build" > "Storage"
2. Click "Get Started"
3. Click "Next" through the setup wizard
4. Choose "Start in production mode" (security rules will be deployed via GitHub Actions)
5. Choose a location (same as Firestore recommended)
6. Click "Done"

**Important**: 
- Storage is required for uploading product images, logos, and other assets
- The security rules will be automatically deployed via GitHub Actions
- Storage rules currently allow any authenticated user to upload (admin panel access is protected separately by Firestore rules)
- For stricter security, you can grant the Storage service account "Cloud Datastore User" IAM role and update rules to use admin-only access (see troubleshooting section)

#### D. Enable Hosting
1. Go to "Build" > "Hosting"
2. Click "Get Started"
3. Follow the setup wizard (we'll deploy via GitHub Actions, so you can skip the CLI steps)

---

## Step 3: Configure GitHub Secrets

1. Go to your new repository on GitHub
2. Click "Settings" tab
3. Go to "Secrets and variables" > "Actions"
4. Click "New repository secret" for each of the following:

### Required Secrets

You only need **2 secrets** for the entire setup:

| Secret Name | Value | Where to Find |
|------------|-------|---------------|
| `VITE_FIREBASE_CONFIG` | Your complete Firebase config as compact JSON | Firebase Config (see below) |
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON | See below |

### How to Set Up VITE_FIREBASE_CONFIG

1. In Firebase Console, click the gear icon ⚙️ > "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register your app with a nickname (if not already done)
5. Copy the Firebase configuration object
6. **Validate and format the JSON**:
   - Go to [jsonformatter.curiousconcept.com](https://jsonformatter.curiousconcept.com/)
   - Paste your Firebase config
   - Click "Process" to validate
   - Copy the compact (single-line) output
7. Paste the validated JSON as the secret value:

```json
{"apiKey":"YOUR_API_KEY","authDomain":"your-project.firebaseapp.com","projectId":"your-project-id","storageBucket":"your-project.firebasestorage.app","messagingSenderId":"123456789","appId":"1:123456789:web:abcdef","measurementId":"G-XXXXXXXXXX"}
```

**Example:**
```json
{"apiKey":"AIzaSyA4P67skiUQu5MqHvN93cgHUKC63HS6zv8","authDomain":"snackspot-kochi.firebaseapp.com","projectId":"snackspot-kochi","storageBucket":"snackspot-kochi.firebasestorage.app","messagingSenderId":"1035236098674","appId":"1:1035236098674:web:ed56b3cc184aa8fa35b8eb","measurementId":"G-KBE2534FRQ"}
```

**Important**: The JSON must be valid RFC 8259 format - all keys in quotes, no trailing commas, compact single-line. Use the JSON validator to ensure it's correct!

### Get Firebase Service Account

1. In Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. **Important**: Grant proper permissions to the service account:
   - Click "Manage service account permissions"
   - Or go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam)
   - Find the service account (looks like `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`)
   - Click the pencil icon to edit
   - Ensure it has these roles:
     - **"Editor"** - General Firebase access
     - **"Firebase Rules Admin"** - Deploy Firestore rules
     - **"Cloud Datastore Index Admin"** - Deploy Firestore indexes
     - **"Cloud Functions Admin"** - Deploy payment webhooks (required for Stripe/Razorpay)
     - **"Service Usage Consumer"** - API access checks
   - Click "Save"
5. **Storage Service Account IAM Role** (Optional - for stricter security):
   - Storage rules currently work without this (allows any authenticated user)
   - For admin-only uploads, grant the Storage service account "Cloud Datastore User" role:
     - Go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam)
     - Click "GRANT ACCESS" and add: `service-XXXXX@gs-project-accounts.iam.gserviceaccount.com`
     - Add role: **"Cloud Datastore User"** (`roles/datastore.user`)
     - Then update `storage.rules` to use `isAdmin()` instead of `request.auth != null`
   - **Note**: GitHub Actions will automatically grant this role on deployments if needed
6. Open the JSON file in a text editor
7. Copy the **entire contents** of the file
8. Create a secret named `FIREBASE_SERVICE_ACCOUNT` and paste the entire JSON

**Note**: If you skip step 4 or 5, the deployment may fail with permission errors. You can always add permissions later if needed.

---

## Step 4: Create First Admin User

**Important**: This template uses role-based authentication to separate admin and customer sessions. You need to create both a Firebase Auth user AND add them to the admins collection.

### Part A: Create Admin in Firebase Authentication

1. Go to Firebase Console > Authentication > Users
2. Click "Add user"
3. Enter email and password for your admin account
4. Click "Add user"
5. **Copy the email address you just created** (you'll need it in Part B)

### Part B: Add Admin to Admins Collection

1. Go to Firebase Console > Firestore Database
2. Click "Start collection"
3. Collection ID: `admins`
4. Document ID: Enter the **exact email address** from Part A (e.g., `admin@yourstore.com`)
5. Add field:
   - Field: `role`
   - Type: `string`
   - Value: `admin`
6. Add field:
   - Field: `email`
   - Type: `string`
   - Value: Same email address
7. Click "Save"

**Why both steps?**
- Firebase Authentication handles login credentials
- The `admins` collection determines who can access the admin panel
- This separation ensures customers can't accidentally access admin features

**Save your admin credentials securely** - you'll use them to login at `https://YOUR-PROJECT-ID.web.app/admin`

---

## Step 5: Initial Deployment (Triggers Automatic Setup)

The first deployment will automatically set up everything you need:

1. In your forked repository, go to the "Actions" tab
2. Click "Enable GitHub Actions" if prompted
3. Click on "Firebase Deploy" workflow
4. Click "Run workflow" > "Run workflow" on the main branch
5. Wait for the deployment to complete (2-3 minutes)
6. This will automatically:
   - Parse your `VITE_FIREBASE_CONFIG` secret
   - Generate `.env` file with all Firebase environment variables
   - Generate `.firebaserc` file with your project ID
   - Build your site
   - Deploy Firestore security rules
   - Deploy Firestore indexes
   - Deploy Storage security rules
   - Deploy Cloud Functions
   - Deploy to Firebase Hosting

**Note**: You don't need to create any local `.env` or `.firebaserc` files - the GitHub Actions workflow handles everything automatically from your secrets!

---

## Step 6: Customize Your Store

You can customize your store in two ways:

### Option A: Through Admin Panel (Recommended)

1. Go to `https://YOUR-PROJECT-ID.web.app/admin`
2. Login with your admin credentials
3. Navigate to **"Settings"** tab

**General Tab**:
- Store name
- **Logo Upload**: Upload your logo image directly (auto-compressed to max 512px width)
- **Store Icon Upload**: Upload square icon/logo for favicon and header (auto-compressed to max 512px width)
- Phone and WhatsApp numbers
- Social media links (Facebook, Instagram, YouTube)

**Appearance Tab**:
- Choose from 5 theme templates:
  - Professional (Blue & Modern)
  - Vibrant (Purple & Energetic)
  - Minimal (Clean & Simple)
  - Elegant (Dark & Sophisticated)
  - Modern (Teal & Fresh)

**Pages Tab**:
- Use the **WYSIWYG editor** to format content with:
  - Bold, italic, underline text
  - Headings (H1, H2, H3)
  - Bulleted and numbered lists
  - Links
  - Text colors
- Edit About Us, Terms & Conditions, Privacy Policy
- **Upload images** for pages (auto-compressed to max 1024px width)

**SEO Tab**:
- SEO Title (50-60 characters)
- SEO Description (150-160 characters)
- SEO Keywords (comma-separated)

**Pricing Tab**:
- Currency symbol (₹, $, €, £, ¥, د.إ, SR)
- Tax percentage (%)
- Shipping cost (flat rate)

**Payment Tab**:
- Configure Cash on Delivery (COD)
- Enable/disable payment methods

### Option B: Through Code (Advanced)

**Customize Theme Manually**:
1. Edit `src/config/theme.js` in GitHub:
   ```javascript
   fontFamily: 'Roboto', // Try: Poppins, Inter, Montserrat, Lato
   colors: {
     primary: '#3B82F6',  // Your brand color
     secondary: '#10B981',
     // ... etc
   }
   ```
2. The Google Font will load automatically!

**Note**: For images (logos, products), use the Admin Panel upload feature instead of manual file uploads. Images are automatically compressed and optimized.

---

## Step 7: Test with PR Preview

1. Create a new branch in GitHub (click "main" dropdown > type new branch name)
2. Make a small change (e.g., edit store name)
3. Create a Pull Request to `main`
4. GitHub Actions will automatically:
   - Build your site
   - Deploy to a preview URL
   - Comment on the PR with the preview link
5. Test your changes on the preview URL
6. If everything looks good, merge the PR

---

## Step 8: Access Your Live Store

After merging to `main`, GitHub Actions will deploy to production:

- **Storefront**: `https://YOUR-PROJECT-ID.web.app`
- **Admin Panel**: `https://YOUR-PROJECT-ID.web.app/admin`
- **Customer Login**: `https://YOUR-PROJECT-ID.web.app/login`
- **Customer Account**: `https://YOUR-PROJECT-ID.web.app/account`

---

## Managing Your Store

### Admin Panel Access

**Login at**: `https://YOUR-PROJECT-ID.web.app/admin`

**Important Security Notes**:
- Admin login is separate from customer login
- Only users added to the `admins` collection can access admin panel
- Attempting to login with a customer account will show an error
- Admin accounts cannot checkout as customers (different login pages)

### Dashboard

1. Go to `https://YOUR-PROJECT-ID.web.app/admin`
2. View real-time statistics:
   - Total Orders
   - Pending Orders (new orders)
   - Processing Orders (being fulfilled)
   - Completed Orders
   - Total Revenue (excludes cancelled orders)
   - Low Stock Alerts (products with less than 5 items)

### Managing Admin Accounts

1. Go to admin panel > "Admins" tab
2. **Add New Admin**:
   - Click "Add Admin"
   - Enter the email address
   - Click "Add Admin"
   - **Important**: The user must already have a Firebase Auth account (created in Firebase Console > Authentication)
3. **Revoke Admin Access**:
   - Click "Revoke" next to any admin
   - Confirm the action
   - User can still login as customer but loses admin access
4. **Search Admins**: Use search bar to filter by email

**Note**: You can only add admins who have already created Firebase Auth accounts. The email must match exactly.

### Managing Customers

1. Go to admin panel > "Customers" tab
2. View all registered customer accounts
3. See customer information:
   - Name, email, phone
   - Number of orders placed
   - Account creation date
4. Search customers by name or email
5. Click on a customer to view their complete order history

### Adding Products

1. Go to admin panel > "Products" tab
2. Click "Add Product"
3. Fill in details:
   - **Title**: Product name
   - **Description**: Short description
   - **Price**: Regular price (in your selected currency)
   - **Discounted Price** (optional): Sale price - shows % OFF badge
   - **Product Images**: 
     - Click "Upload Images" to select one or more images
     - Images are automatically compressed and resized (max 1024px width)
     - First image is the main display image
     - Additional images appear in a gallery slider when customers click the product image
     - Preview images before saving
   - **Stock**: Available quantity (cart validates against this)
   - **SEO Tags** (optional): Comma-separated keywords for search
4. Click "Save"

**Tips**:
- Upload multiple images per product for better customer experience
- Images are automatically optimized - no manual compression needed
- First image is used as the main product image
- Keep stock updated to prevent overselling

### Managing Orders

1. Go to admin panel > "Orders" tab
2. View all orders with:
   - Order ID
   - Customer name, phone, address
   - Ordered items with quantities
   - Total amount (with tax and shipping if configured)
   - Order status
   - Order date/time
3. Update order status:
   - **Pending**: New orders awaiting confirmation
   - **Processing**: Order confirmed, being prepared
   - **Completed**: Order delivered/fulfilled
   - **Cancelled**: Order cancelled
4. Dashboard automatically updates with status counts
5. Customers can WhatsApp you with their Order ID for tracking

### Store Settings

1. Go to admin panel > "Settings" tab
2. **General Tab**:
   - Store name (appears in header and page title)
   - **Logo Upload**: Upload your full logo image (auto-compressed to max 512px width)
   - **Store Icon Upload**: Upload square icon/logo for favicon and header (auto-compressed to max 512px width)
   - Contact information (phone, WhatsApp)
   - Social media links (Facebook, Instagram, YouTube)
3. **Appearance Tab**:
   - Select theme template (Professional, Vibrant, Minimal, Elegant, Modern)
   - Click "Apply Theme Template" and page will refresh with new theme
4. **Pages Tab**:
   - **WYSIWYG Editor** for rich text formatting
   - Customize About Us, Terms, Privacy Policy pages
   - **Upload images** for pages (auto-compressed to max 1024px width)
   - Supports: bold, italic, headings, lists, links, colors
5. **SEO Tab**:
   - SEO Title (50-60 characters recommended)
   - SEO Description (150-160 characters recommended)
   - SEO Keywords (comma-separated)
6. **Pricing Tab**:
   - Select currency symbol (₹, $, €, £, ¥, د.إ, SR)
   - Set tax percentage (automatically calculated in cart)
   - Set flat shipping cost (added to all orders)
7. **Payment Tab**:
   - Configure Cash on Delivery (COD)
   - Set up Stripe for credit/debit card payments
   - Set up Razorpay for UPI/cards/netbanking
   - Configure Gmail SMTP for email notifications

**Note**: Settings tabs remember your last position via URL parameters

---

## Customer Shopping Experience

### Customer Accounts
- **Login/Signup**: Customers can create accounts with email/password at `/login`
- **Account Dashboard** at `/account`:
  - **My Addresses**: Save multiple delivery addresses
  - **My Orders**: View complete order history with status
  - **My Profile**: Update name and phone number
- **Saved Addresses**: One-click checkout with saved addresses
- **Set Default Address**: Mark frequently used address as default
- **Guest Checkout**: Option to checkout without creating account
- **Create Account During Checkout**: Optional checkbox to create account while placing order
- **Secure Authentication**: Role-based access ensures customers can't access admin panel

### Cart Features
- **Real-time stock validation**: Cart prevents adding more items than available in stock
- **Auto-open cart**: Cart modal opens automatically when products are added
- **Column layout**: Clean, vertical layout with right-aligned prices
- **Decimal formatting**: All prices show with 2 decimal places
- **Dynamic currency**: Prices display in your configured currency symbol
- **Live calculations**: Subtotal, tax, and shipping calculated in real-time

### Checkout Features
- **Flexible Checkout Options**:
  - Checkout as guest
  - Login to use saved addresses
  - Create account during checkout (optional)
- **Customer information form**: Name, phone, email (required), address, PIN code
- **Email required**: All orders require email for confirmation and updates
- **Form validation**: Ensures all required fields are filled correctly
- **Order summary**: Shows itemized breakdown with tax and shipping
- **Payment method selection**: Choose from COD, Stripe, or Razorpay
- **Email notifications**: Automatic order and payment confirmation emails
- **WhatsApp integration**: After order placement, customers can message you with Order ID

### Product Browsing
- **Search functionality**: Real-time search across product titles and descriptions
- **Stock indicators**: "Out of Stock" badges and "Only X left" warnings
- **Discount badges**: Automatic percentage OFF calculation
- **Responsive images**: Optimized for all screen sizes
- **Placeholder handling**: Graceful fallback for missing images

---

## Customizing the Storefront

The main customer-facing page is in `src/pages/StoreFront.jsx`. This file is designed to be easily edited:

1. Find the file in GitHub
2. Click the pencil icon to edit
3. Modify text, layout, or functionality
4. Commit changes
5. Create a PR to test changes

---

## Troubleshooting

### Build Fails in GitHub Actions
- Check that both secrets are set correctly:
  - `VITE_FIREBASE_CONFIG` must be valid JSON (all keys in quotes)
  - `FIREBASE_SERVICE_ACCOUNT` must contain the complete service account JSON
- Verify the service account has proper permissions in Firebase Console
- Check the error logs in Actions tab for specific errors

### Invalid JSON Error
If you see "parse error" or "Invalid JSON" in the Actions logs:
- Make sure `VITE_FIREBASE_CONFIG` is formatted as a single-line JSON
- All keys must be in double quotes: `"apiKey"`, `"authDomain"`, etc.
- No trailing commas
- The JSON must be valid RFC 8259 format
- **Validate your JSON** at [jsonformatter.curiousconcept.com](https://jsonformatter.curiousconcept.com/)
  1. Paste your Firebase config
  2. Click "Process"
  3. Copy the validated compact output
  4. Update your GitHub secret with the corrected JSON

### Firestore Rules Deployment Fails

**Error: "Permission denied to get service [firestore.googleapis.com]"**

This usually means one of two things:

**Solution 1: Create Firestore Database First (Most Common)**
1. Go to Firebase Console > "Build" > "Firestore Database"
2. If you see "Create database", click it and follow the setup
3. Wait for the database to be created
4. Re-run the GitHub Actions workflow

This step enables the Firestore API automatically and is required before deploying rules.

**Solution 2: Add Service Account Permissions**

If you already created the Firestore database and still see this error, your service account needs additional permissions. Fix it by:

1. Go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam)
2. Select your Firebase project from the dropdown at the top
3. Find the service account (looks like `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`)
4. Click the pencil icon to edit
5. Click "ADD ANOTHER ROLE" and add each of these roles:
   - **Editor** (gives broad access - easiest option)
   - **Firebase Rules Admin** (required for deploying Firestore rules)
   - **Cloud Datastore Index Admin** (required for deploying indexes)
   - **Service Usage Consumer** (for API checks)
6. Click "Save"
7. Re-run the GitHub Actions workflow

**Note**: If you only have "Editor" role and still see permission errors, you may need to explicitly add "Firebase Rules Admin" as well.

**Alternative: Generate a new service account with proper permissions**
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Manage service account permissions"
3. Create a new service account or select existing one
4. Assign the "Editor" role (or the specific roles listed above)
5. Generate a new private key
6. Update the `FIREBASE_SERVICE_ACCOUNT` secret in GitHub with the new JSON

**Error: "The caller does not have permission" (firebaserules.googleapis.com)**

This means you need to add the "Firebase Rules Admin" role specifically:

1. Go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam)
2. Find your service account
3. Click the pencil icon to edit
4. Click "ADD ANOTHER ROLE"
5. Search for and select **"Firebase Rules Admin"**
6. Click "Save"
7. Re-run the workflow

**Other common issues:**
- Ensure `FIREBASE_SERVICE_ACCOUNT` secret contains the complete JSON file
- Check that `firestore.rules` and `firestore.indexes.json` files exist in the repository

### Cloud Functions Deployment Fails

**Error: "Missing required permission cloudfunctions.functions.setIamPolicy"**

This error occurs when deploying Firebase Cloud Functions (for payment webhooks and email notifications). The service account needs additional permissions to deploy HTTPS functions.

**Solution: Add Cloud Functions Admin Role**

1. Go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam)
2. Select your Firebase project from the dropdown at the top
3. Find the service account (looks like `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`)
4. Click the pencil icon (✏️) to edit
5. Click **"ADD ANOTHER ROLE"**
6. Search for and select **"Cloud Functions Admin"**
7. Click **"Save"**
8. Re-run the GitHub Actions workflow

**Alternative: Use Owner Role (Not Recommended for Production)**

If you continue to have permission issues, you can temporarily use the Owner role:
1. Follow steps 1-4 above
2. Add the **"Owner"** role instead
3. This gives full access but should only be used for testing

**Required Roles Summary**

For full functionality, you need to configure roles for **two service accounts**:

#### 1. Firebase Service Account (for deployments)
The service account used in `FIREBASE_SERVICE_ACCOUNT` secret needs:
- ✅ **Editor** - General Firebase access
- ✅ **Firebase Rules Admin** - Deploy Firestore rules
- ✅ **Cloud Datastore Index Admin** - Deploy Firestore indexes
- ✅ **Cloud Functions Admin** - Deploy Cloud Functions (for payments)
- ✅ **Service Usage Consumer** - API access checks

#### 2. Storage Service Account (for image uploads)
**Current Implementation**: Storage rules allow any authenticated user to upload. This is secure because:
- Only admins can access the admin panel (protected by Firestore rules)
- Regular customers cannot access upload functionality
- Admin panel UI is the only place where uploads happen

**Optional - Stricter Security**: If you want admin-only uploads at the Storage rules level:
- Grant Storage service account: **Cloud Datastore User** (`roles/datastore.user`) IAM role
- Update `storage.rules` to use `isAdmin()` function instead of `request.auth != null`
- GitHub Actions will automatically grant the IAM role on deployments if needed

---

### Admin Login Not Working

**Error: "Access denied. This account is not authorized as an admin"**
- This means the email exists in Firebase Auth but NOT in the `admins` collection
- Solution: Add the email to Firestore `admins` collection (see Step 4, Part B)

**Error: "This is an admin account. Please use the admin login at /admin"**
- This means you're trying to login as customer with an admin account
- Solution: Go to `/admin` to login with admin credentials

**Other issues:**
- Verify you created BOTH Firebase Auth user AND added to `admins` collection
- Check that the email in `admins` collection matches Firebase Auth exactly
- Check that the document ID in `admins` collection is the email address
- Ensure the `role` field is set to `admin` (string type)
- Check that Authentication is enabled in Firebase
- Make sure the initial deployment completed successfully
- Clear browser cache and try again

### Customer Can't Create Account

**Error: "This email is registered as an admin account"**
- Admin emails cannot be used to create customer accounts
- This is intentional for security - admin and customer sessions are separate
- Use a different email for customer account

### Products Not Showing
- Verify Firestore rules were deployed (check GitHub Actions logs)
- Verify products are added in admin panel
- Check browser console for errors

### Images Not Loading / Upload Permission Denied

**Error: "403 Forbidden" or "storage/unauthorized" when uploading images**

This usually means you're not authenticated. Fix it by:

1. **Verify You're Logged In**:
   - Make sure you're logged in to the admin panel
   - Check browser console for authentication errors
   - Try logging out and logging back in

2. **Verify Storage Rules Are Deployed**:
   - Go to Firebase Console → Storage → Rules tab
   - Should match your `storage.rules` file
   - Current rules allow any authenticated user to upload
   - If different, redeploy via GitHub Actions

3. **Check Browser Console**:
   - Open browser console (F12) when uploading
   - Look for detailed error messages
   - Check if authentication is working

4. **If Using Admin-Only Rules** (if you modified `storage.rules` to use `isAdmin()`):
   - Grant Storage service account: **Cloud Datastore User** IAM role
   - Go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam)
   - Click "GRANT ACCESS" and add: `service-XXXXX@gs-project-accounts.iam.gserviceaccount.com`
   - Add role: **"Cloud Datastore User"** (`roles/datastore.user`)
   - Wait 30-60 seconds for IAM propagation

**Other image issues**:
- If using built-in upload feature:
  - Ensure Firebase Storage is enabled in Firebase Console
  - Verify Storage rules are deployed (check GitHub Actions logs)
  - Make sure you're logged in as admin when uploading
  - Check browser console for detailed error messages
- For legacy image paths:
  - Ensure images are uploaded to `public/images/`
  - Check image paths start with `/images/`
  - Verify image files are properly named

---

## Editing Without AI

This template is designed for non-coders, but some common edits:

### Change Header Text
File: `src/components/Header.jsx`

### Change Footer Links
File: `src/components/Footer.jsx`

### Modify Product Card Layout
File: `src/components/ProductCard.jsx`

### Update Checkout Form Fields
File: `src/pages/StoreFront.jsx` (search for "customerInfo")

---

## How Automatic Deployment Works

The GitHub Actions workflow automatically handles all Firebase deployments:

### On Every Push to Main
1. Parses your `VITE_FIREBASE_CONFIG` secret and generates `.env` and `.firebaserc` files
2. Builds your React app with all configuration
3. Deploys Firestore security rules from [firestore.rules](firestore.rules)
4. Deploys Firestore indexes from [firestore.indexes.json](firestore.indexes.json)
5. Deploys the built site to Firebase Hosting (production)

### On Every Pull Request
1. Parses your `VITE_FIREBASE_CONFIG` secret and generates configuration files
2. Builds your React app
3. Deploys Firestore rules and indexes to your project
4. Creates a preview deployment URL
5. Comments the preview URL on the PR

**Benefits**:
- Only 2 secrets required for complete setup
- No local setup or CLI tools required
- No need to manually create `.env` or `.firebaserc` files
- Firestore rules stay in sync with your code
- Test everything (including database rules) in PR previews
- Automatic rollback by reverting commits
- Easy to copy Firebase config - just paste the JSON object as-is

### Modifying Firestore Rules

If you need to change database security rules:
1. Edit [firestore.rules](firestore.rules) in GitHub's web interface
2. Commit to a new branch and create a PR
3. Test with the preview deployment
4. Merge to automatically deploy to production

---

## Payment Gateway Integration

This template supports multiple payment gateways: **Cash on Delivery (COD)**, **Stripe**, and **Razorpay**. All payment methods can be configured through the admin panel.

### Supported Payment Methods

1. **Cash on Delivery (COD)** - Default, no setup required
2. **Stripe** - Credit/Debit cards, international payments
3. **Razorpay** - UPI, Cards, Netbanking, Wallets (India-focused)

### Email Notifications

All orders automatically send email confirmations to customers. Email is now **required** during checkout.

---

### Setting Up Payment Gateways

#### Step 1: Configure Email Notifications (Required)

Email notifications are sent for order confirmations and payment confirmations using Gmail SMTP.

1. **Create a Gmail App Password**:
   - Go to your Google Account: [myaccount.google.com](https://myaccount.google.com)
   - Navigate to **Security** → **2-Step Verification** (enable if not already)
   - Scroll down to **App passwords**
   - Click **Select app** → Choose **Mail**
   - Click **Select device** → Choose **Other** → Enter "Store Notifications"
   - Click **Generate**
   - **Copy the 16-character password** (you'll need this in the admin panel)

2. **Configure in Admin Panel**:
   - Go to Admin Panel → **Settings** → **Payment** tab
   - Scroll to **Email Configuration** section
   - Enter your **Store Name** (appears in email sender)
   - Enter your **Gmail Address**
   - Paste the **App Password** (16 characters, no spaces)
   - Click **Save All Settings**

**Important**: Regular Gmail passwords won't work - you MUST use an App Password!

---

#### Step 2: Configure Cash on Delivery (COD)

COD is enabled by default and requires no additional setup.

1. Go to Admin Panel → **Settings** → **Payment** tab
2. Under **Cash on Delivery (COD)**:
   - Toggle to enable/disable
   - Set **Display Label** (e.g., "Cash on Delivery")
   - Set **Description** (e.g., "Pay with cash upon delivery")
3. Click **Save All Settings**

**Note**: At least one payment method must be enabled. You cannot disable COD if no other payment method is active.

---

#### Step 3: Configure Stripe (Optional)

Stripe enables credit/debit card payments globally.

##### A. Get Stripe API Keys

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
4. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
5. Keep these keys handy for the admin panel

##### B. Configure in Admin Panel

1. Go to Admin Panel → **Settings** → **Payment** tab
2. Under **Stripe**:
   - Toggle **Enabled** to ON
   - Paste **Publishable Key**
   - Paste **Secret Key**
   - Leave **Webhook Secret** empty for now (we'll add it after deploying functions)
3. Click **Save All Settings**

##### C. Deploy Firebase Functions

After saving Stripe settings, deploy your Firebase Functions:

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click **Firebase Deploy** workflow
4. Click **Run workflow** → **Run workflow**
5. Wait for deployment to complete (3-5 minutes)

##### D. Set Up Stripe Webhook

1. After functions are deployed, get your webhook URL:
   - Format: `https://[REGION]-[PROJECT-ID].cloudfunctions.net/stripeWebhook`
   - Example: `https://us-central1-my-store.cloudfunctions.net/stripeWebhook`
   - Find your region and project ID in Firebase Console

2. Add webhook in Stripe Dashboard:
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Paste your webhook URL
   - Select events to listen for:
     - `checkout.session.completed`
     - `payment_intent.payment_failed`
   - Click **Add endpoint**

3. Copy the **Webhook signing secret** (starts with `whsec_`)

4. Update admin panel:
   - Go to Admin Panel → **Settings** → **Payment** tab
   - Under Stripe, paste the **Webhook Secret**
   - Click **Save All Settings**

**Done!** Stripe is now active on your checkout page.

---

#### Step 4: Configure Razorpay (Optional)

Razorpay is ideal for Indian businesses, supporting UPI, cards, netbanking, and wallets.

##### A. Get Razorpay API Keys

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Go to **Settings** → **API Keys**
3. Generate keys if not already created
4. Copy your **Key ID** (starts with `rzp_test_` or `rzp_live_`)
5. Copy your **Key Secret**
6. Keep these keys handy for the admin panel

##### B. Configure in Admin Panel

1. Go to Admin Panel → **Settings** → **Payment** tab
2. Under **Razorpay**:
   - Toggle **Enabled** to ON
   - Paste **Key ID**
   - Paste **Key Secret**
   - Leave **Webhook Secret** empty for now
3. Click **Save All Settings**

##### C. Deploy Firebase Functions

If you haven't already deployed functions for Stripe:

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click **Firebase Deploy** workflow
4. Click **Run workflow** → **Run workflow**
5. Wait for deployment to complete (3-5 minutes)

##### D. Set Up Razorpay Webhook

1. After functions are deployed, get your webhook URL:
   - Format: `https://[REGION]-[PROJECT-ID].cloudfunctions.net/razorpayWebhook`
   - Example: `https://us-central1-my-store.cloudfunctions.net/razorpayWebhook`

2. Add webhook in Razorpay Dashboard:
   - Go to **Settings** → **Webhooks**
   - Click **Create Webhook**
   - Paste your webhook URL
   - Select events:
     - `payment.captured`
     - `payment.failed`
   - Enter a **Secret** (create a random string, e.g., `my_webhook_secret_123`)
   - Click **Create Webhook**

3. Copy the **Secret** you just created

4. Update admin panel:
   - Go to Admin Panel → **Settings** → **Payment** tab
   - Under Razorpay, paste the **Webhook Secret**
   - Click **Save All Settings**

**Done!** Razorpay is now active on your checkout page.

---

### How Payment Flows Work

#### Cash on Delivery (COD)
1. Customer selects COD at checkout
2. Order is created with status "Pending"
3. Customer receives order confirmation email
4. Admin fulfills order and updates status

#### Stripe
1. Customer selects "Credit/Debit Card (Stripe)" at checkout
2. Customer is redirected to Stripe Checkout page
3. Customer enters card details and completes payment
4. Stripe webhook notifies your system
5. Order status updates to "Completed"
6. Customer receives payment confirmation email

#### Razorpay
1. Customer selects "UPI / Cards / Netbanking (Razorpay)" at checkout
2. Razorpay popup opens with payment options
3. Customer completes payment (UPI, card, netbanking, wallet)
4. Razorpay webhook notifies your system
5. Order status updates to "Completed"
6. Customer receives payment confirmation email

---

### Testing Payment Gateways

#### Test Stripe Payments

Use Stripe's test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date and any CVC

#### Test Razorpay Payments

In test mode, Razorpay provides test payment options:
- Use test UPI IDs
- Use test card numbers provided in Razorpay dashboard
- All test payments will be marked as successful

**Important**: Always test in test mode before going live!

---

### Going Live with Payments

#### Stripe
1. Complete Stripe account verification
2. Switch from test keys to live keys in admin panel
3. Update webhook to use live mode
4. Test with a real card (small amount)

#### Razorpay
1. Complete KYC verification in Razorpay
2. Switch from test keys to live keys in admin panel
3. Update webhook secret if changed
4. Test with a real payment (small amount)

---

### Troubleshooting Payment Issues

#### Emails Not Sending
- Verify Gmail App Password is correct (16 characters, no spaces)
- Check that 2-Step Verification is enabled on your Google Account
- Try generating a new App Password
- Check Firebase Functions logs for errors

#### Stripe Payments Failing
- Verify publishable and secret keys are correct
- Check webhook secret matches Stripe dashboard
- Ensure webhook URL is correct (check Firebase Functions URL)
- Check Stripe dashboard for error logs
- Verify Firebase Functions are deployed successfully

#### Razorpay Payments Failing
- Verify Key ID and Key Secret are correct
- Check webhook secret matches Razorpay dashboard
- Ensure webhook URL is correct
- Check Razorpay dashboard for error logs
- Verify Firebase Functions are deployed successfully

#### Order Status Not Updating
- Check Firebase Functions logs in Firebase Console
- Verify webhook secrets are correct
- Ensure webhooks are active in payment gateway dashboards
- Check that webhook URLs are accessible (not blocked by firewall)

---

### Email Templates

Email templates are automatically included in the Firebase Functions. They include:

1. **Order Confirmation Email**:
   - Sent when any order is placed
   - Includes order ID, items, total, payment method
   - Sent to customer's email address

2. **Payment Confirmation Email**:
   - Sent when online payment is successful
   - Includes transaction ID, amount, payment method
   - Sent after Stripe/Razorpay payment completes

**Customizing Email Templates**:
- Email templates are in `functions/templates/`
- Edit `orderConfirmation.html` for order emails
- Edit `paymentConfirmation.html` for payment emails
- Commit changes and redeploy functions

---

### Firebase Functions Deployment

Payment processing requires Firebase Cloud Functions. The deployment is automatic via GitHub Actions:

**What Gets Deployed**:
- Stripe webhook handler (`stripeWebhook`)
- Razorpay webhook handler (`razorpayWebhook`)
- Order confirmation email trigger (`onOrderCreated`)

**Deployment Steps**:
1. Functions are automatically deployed when you push to `main` branch
2. Or manually trigger via GitHub Actions → Firebase Deploy workflow
3. Functions appear in Firebase Console → Functions tab

**Monitoring Functions**:
- View logs in Firebase Console → Functions → Logs
- Check for errors or webhook processing issues
- Monitor email sending status

---

### Security Best Practices

1. **Never commit API keys** to your repository
   - All keys are stored in Firestore via admin panel
   - Secret keys are stored securely in Firebase

2. **Use webhook secrets**
   - Always configure webhook secrets
   - This prevents unauthorized webhook calls

3. **Test in test mode first**
   - Use test API keys during development
   - Switch to live keys only after thorough testing

4. **Monitor transactions**
   - Regularly check payment gateway dashboards
   - Review Firebase Functions logs
   - Monitor order statuses in admin panel

5. **Keep functions updated**
   - Functions deploy automatically with your code
   - Review deployment logs for any errors

---

## Project Structure

```
quick-comm-template/
├── public/
│   └── images/              # Store all images here
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.jsx       # Site header
│   │   ├── Footer.jsx       # Site footer
│   │   ├── ProductCard.jsx  # Product display
│   │   └── ProtectedRoute.jsx # Route guards
│   ├── config/             # Configuration files
│   │   ├── business.js     # Store name, logo
│   │   ├── firebase.js     # Firebase setup
│   │   └── theme.js        # Colors, fonts, spacing
│   ├── context/            # React context (cart state)
│   ├── pages/
│   │   ├── StoreFront.jsx  # Main customer page ⭐
│   │   ├── CustomerAuth.jsx # Customer login/signup
│   │   ├── CustomerAccount.jsx # Customer account page
│   │   ├── StaticPage.jsx  # About/Terms/Privacy pages
│   │   └── admin/          # Admin panel pages
│   │       ├── Login.jsx   # Admin login
│   │       ├── Dashboard.jsx # Admin dashboard
│   │       ├── Products.jsx # Product management
│   │       ├── Orders.jsx  # Order management
│   │       ├── Customers.jsx # Customer management
│   │       ├── Admins.jsx  # Admin management
│   │       ├── StoreSettings.jsx # Store settings
│   │       └── PaymentSettings.jsx # Payment config
│   ├── services/           # Firebase operations
│   │   ├── auth.js         # Admin authentication
│   │   ├── customerAuth.js # Customer authentication
│   │   ├── products.js     # Product CRUD
│   │   ├── orders.js       # Order management
│   │   ├── payment.js      # Payment settings
│   │   ├── email.js        # Email settings
│   │   ├── paymentGateway.js # Stripe/Razorpay integration
│   │   ├── adminAccounts.js # Admin/customer management
│   │   └── storeInfo.js    # Store settings
│   └── utils/              # Helper functions
├── functions/              # Firebase Cloud Functions
│   ├── index.js            # Functions entry point
│   ├── package.json        # Functions dependencies
│   ├── handlers/           # Webhook handlers
│   │   ├── stripeWebhook.js # Stripe payment processing
│   │   ├── razorpayWebhook.js # Razorpay payment processing
│   │   └── orderConfirmation.js # Order email trigger
│   ├── services/
│   │   └── emailService.js # Email sending service
│   └── templates/          # Email templates
│       ├── orderConfirmation.html
│       └── paymentConfirmation.html
├── .github/workflows/      # CI/CD automation
├── firestore.rules         # Database security rules
└── firestore.indexes.json  # Database indexes
```

---

## Support

### Video Tutorials
- [Initial Setup](https://youtube.com/@build.with.justin)
- [Adding Products](https://youtube.com/@build.with.justin)
- [Managing Orders](https://youtube.com/@build.with.justin)

### Common Questions

**Q: What's the difference between admin and customer login?**
A: This template uses role-based authentication:
- **Admin login** (`/admin`): For store owners/managers to manage products, orders, settings
- **Customer login** (`/login`): For shoppers to save addresses and view order history
- These are completely separate - admin accounts can't checkout as customers and vice versa

**Q: How do I add more admin users?**
A: Two options:
1. **Via Admin Panel** (Recommended): Go to Admin Panel > Admins tab > Add Admin
2. **Via Firestore Console**: Add document to `admins` collection with email as document ID
- **Important**: The email must already exist in Firebase Authentication

**Q: Can customers place orders without creating an account?**
A: Yes! Guest checkout is available. Customers can optionally create an account during checkout to save their information.

**Q: Can I use my own domain?**
A: Yes! Configure custom domain in Firebase Hosting settings

**Q: How much does it cost?**
A: Free for small stores (Firebase free tier). GitHub and Firebase both have generous free tiers.

**Q: Where should I upload product images?**
A: Use the built-in image upload feature in the admin panel (recommended):
- Click "Upload Images" when adding/editing products
- Images are automatically compressed and resized (max 1024px width)
- Multiple images per product supported - first image is main, others appear in gallery slider
- Images are stored in Firebase Storage - no external hosting needed
- Legacy option: Upload to `/public/images/` and use paths like `/images/product.jpg` (still supported)

**Q: Should I compress my images?**
A: Images are automatically compressed and optimized when uploaded through the admin panel. Product images are resized to max 1024px width, and logos to max 512px width. No manual compression needed!

**Q: How do I validate my Firebase JSON config?**
A: Use [jsonformatter.curiousconcept.com](https://jsonformatter.curiousconcept.com/) to validate and format your JSON correctly.

**Q: Can I change the currency?**
A: Yes! Go to Admin Panel > Settings > Pricing tab and select your currency. It updates throughout the entire site.

**Q: What theme templates are available?**
A: Professional, Vibrant, Minimal, Elegant, and Modern. Change in Admin Panel > Settings > Appearance.

**Q: Can customers save their information?**
A: Yes! Customers have two options:
1. **Create an account**: Save multiple addresses, view order history, and checkout faster
2. **Guest checkout**: Quick checkout without creating an account (can optionally create account during checkout)

**Q: Can I add more features?**
A: Yes! Edit the code directly in GitHub or ask AI to help customize

**Q: How do I backup my data?**
A: Export Firestore data from Firebase Console > Firestore Database > Import/Export

---

## Attribution

This template was created by **[@build.with.justin](https://youtube.com/@build.with.justin)** (Codzoc Technolabs).

**Required Attribution**: If you use this project, please include a link to @build.with.justin:
- Instagram: [build.with.justin](https://instagram.com/build.with.justin)
- YouTube: [@build.with.justin](https://youtube.com/@build.with.justin)

---

## License

MIT License - Free to use for personal and commercial projects with attribution.

---

## Need Help?

- 📺 Watch setup videos: [YouTube Channel](https://youtube.com/@build.with.justin)
- 📸 Follow on Instagram: [@build.with.justin](https://instagram.com/build.with.justin)
- 💬 Ask questions in the video comments

---

**Happy Selling! 🛍️**
