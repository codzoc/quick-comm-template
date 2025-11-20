# Quick Commerce Template

A simple, browser-only React + Firebase e-commerce template designed for non-coders. Set up your online store entirely through your browser - no terminal, no coding required!

## Features

### Customer-Facing
- Product catalog with search functionality
- Shopping cart (session-based, in-memory)
- Mobile-responsive design
- Order placement with customer info collection
- WhatsApp integration for order tracking
- Out-of-stock badges and inventory tracking
- Discount pricing support

### Admin Panel
- Secure admin authentication
- Product management (CRUD operations)
- Order management with status tracking
- Inventory management
- Store settings (contact info, social media)
- Dashboard with statistics and low stock alerts

### Developer-Friendly
- 100% browser-based setup
- Google Fonts integration (just specify font name)
- PR preview deployments for testing
- Centralized theme configuration
- Mobile-first, responsive design
- Firebase hosting included

## Browser-Only Setup Guide

### Prerequisites
- GitHub account (free)
- Firebase account (free)
- No local development environment needed!

---

## Step 1: Fork This Repository

1. Click the "Fork" button at the top of this repository
2. This creates your own copy of the template

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

#### C. Enable Hosting
1. Go to "Build" > "Hosting"
2. Click "Get Started"
3. Follow the setup wizard (we'll deploy via GitHub Actions, so you can skip the CLI steps)

---

## Step 3: Configure GitHub Secrets

1. Go to your forked repository on GitHub
2. Click "Settings" tab
3. Go to "Secrets and variables" > "Actions"
4. Click "New repository secret" for each of the following:

### Required Secrets

You only need **2 secrets** for the entire setup:

| Secret Name | Value | Where to Find |
|------------|-------|---------------|
| `VITE_FIREBASE_CONFIG` | Your complete Firebase config as JSON | Firebase Config (see below) |
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON | See below |

### How to Set Up VITE_FIREBASE_CONFIG

1. In Firebase Console, click the gear icon ⚙️ > "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register your app with a nickname (if not already done)
5. Copy the Firebase configuration object
6. Format it as a **single-line JSON** and paste as the secret value:

```json
{"apiKey":"YOUR_API_KEY","authDomain":"your-project.firebaseapp.com","projectId":"your-project-id","storageBucket":"your-project.firebasestorage.app","messagingSenderId":"123456789","appId":"1:123456789:web:abcdef","measurementId":"G-XXXXXXXXXX"}
```

**Example:**
```json
{"apiKey":"AIzaSyA4P67skiUQu5MqHvN93cgHUKC63HS6zv8","authDomain":"snackspot-kochi.firebaseapp.com","projectId":"snackspot-kochi","storageBucket":"snackspot-kochi.firebasestorage.app","messagingSenderId":"1035236098674","appId":"1:1035236098674:web:ed56b3cc184aa8fa35b8eb","measurementId":"G-KBE2534FRQ"}
```

**Important**: Make sure to format the JSON correctly - all keys must be in quotes, and it should be valid JSON

### Get Firebase Service Account

1. In Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. **Important**: Grant proper permissions to the service account:
   - Click "Manage service account permissions"
   - Or go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam)
   - Find the service account (looks like `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`)
   - Ensure it has the **"Editor"** role and **"Firebase Rules Admin"** role
5. Open the JSON file in a text editor
6. Copy the **entire contents** of the file
7. Create a secret named `FIREBASE_SERVICE_ACCOUNT` and paste the entire JSON

**Note**: If you skip step 4, the deployment may fail with permission errors. You can always add permissions later if needed.

---

## Step 4: Create First Admin User

1. Go to Firebase Console > Authentication > Users
2. Click "Add user"
3. Enter email and password for your admin account
4. Click "Add user"
5. Save these credentials securely - you'll use them to login to `/admin`

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
   - Deploy to Firebase Hosting

**Note**: You don't need to create any local `.env` or `.firebaserc` files - the GitHub Actions workflow handles everything automatically from your secrets!

---

## Step 6: Customize Your Store

All customization can be done through GitHub's web interface:

### A. Change Store Name and Logo

1. Edit `src/config/business.js`:
   ```javascript
   storeName: 'Your Store Name',
   logoPath: '/images/your-logo.png'
   ```

### B. Upload Your Logo

1. Go to `public/images/` folder
2. Click "Add file" > "Upload files"
3. Upload your logo as `logo.png` (or update the path in business.js)
4. Commit changes

### C. Customize Theme (Colors & Font)

1. Edit `src/config/theme.js`:
   ```javascript
   fontFamily: 'Roboto', // Try: Poppins, Inter, Montserrat, Lato
   colors: {
     primary: '#3B82F6',  // Your brand color
     secondary: '#10B981',
     // ... etc
   }
   ```
2. The Google Font will load automatically!

### D. Add Product Images

1. Go to `public/images/`
2. Upload your product images
3. Use paths like `/images/product-1.jpg` when adding products in admin

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

---

## Managing Your Store

### Adding Products

1. Go to `https://YOUR-PROJECT-ID.web.app/admin`
2. Login with your admin credentials
3. Go to "Products" tab
4. Click "Add Product"
5. Fill in details:
   - Title
   - Description
   - Price
   - Discounted Price (optional)
   - Image Path (e.g., `/images/product-1.jpg`)
   - Stock quantity
6. Click "Save"

### Managing Orders

1. Go to admin panel > "Orders"
2. View all orders with customer details
3. Update order status:
   - Pending
   - Processing
   - Completed
   - Cancelled
4. Customers will see their order ID and can WhatsApp you

### Store Settings

1. Go to admin panel > "Settings"
2. Update:
   - Store name
   - Phone number
   - WhatsApp number (for customer support)
   - Social media links
   - About Us, Terms, Privacy pages

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
- You can validate your JSON at [jsonlint.com](https://jsonlint.com)

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

### Admin Login Not Working
- Verify you created an admin user in Firebase Console
- Check that Authentication is enabled in Firebase
- Make sure the initial deployment completed successfully
- Clear browser cache and try again

### Products Not Showing
- Verify Firestore rules were deployed (check GitHub Actions logs)
- Verify products are added in admin panel
- Check browser console for errors

### Images Not Loading
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

## Advanced Customization

### Add More Payment Methods
Currently supports cash on delivery. To add payment gateways:
1. Integrate Razorpay/Stripe in `src/pages/StoreFront.jsx`
2. Add payment gateway credentials to secrets
3. Update order creation logic

### Add Email Notifications
1. Use a service like EmailJS or SendGrid
2. Add email sending in order creation function
3. Configure email templates

### Enable Local Storage for Cart
Currently, cart is in-memory only. To persist:
1. Modify `src/context/CartContext.jsx`
2. Add localStorage save/load logic

---

## Project Structure

```
quick-comm-template/
├── public/
│   └── images/              # Store all images here
├── src/
│   ├── components/          # Reusable UI components
│   ├── config/             # Configuration files
│   │   ├── business.js     # Store name, logo
│   │   ├── firebase.js     # Firebase setup
│   │   └── theme.js        # Colors, fonts, spacing
│   ├── context/            # React context (cart state)
│   ├── pages/
│   │   ├── StoreFront.jsx  # Main customer page ⭐
│   │   └── admin/          # Admin panel pages
│   ├── services/           # Firebase operations
│   └── utils/              # Helper functions
├── .github/workflows/      # CI/CD automation
└── firestore.rules         # Database security
```

---

## Support

### Video Tutorials
- [Initial Setup](https://youtube.com/@build.with.justin)
- [Adding Products](https://youtube.com/@build.with.justin)
- [Managing Orders](https://youtube.com/@build.with.justin)

### Common Questions
- **Q: Can I use my own domain?**
  A: Yes! Configure in Firebase Hosting settings

- **Q: How much does it cost?**
  A: Free for small stores (Firebase free tier)

- **Q: Can I add more features?**
  A: Yes! Edit the code or ask AI to help

- **Q: How do I backup my data?**
  A: Export Firestore data from Firebase Console

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
