# Quick Commerce Template

A simple, browser-only React + Firebase e-commerce template designed for non-coders. Set up your online store entirely through your browser - no terminal, no coding required!

## Quick Start Summary

**5 Simple Steps to Launch Your Store:**

1. **Create your repo**: Click "Use this template" → Create private repository
2. **Set up Firebase**: Create Firebase project, enable Firestore, Authentication, and Hosting
3. **Add secrets**: Copy 2 JSON configs to GitHub Secrets (use [JSON validator](https://jsonformatter.curiousconcept.com/))
4. **Create admin user**: Add your email/password in Firebase Console
5. **Deploy**: Run GitHub Actions workflow → Your store is live!

**Helpful Tools:**
- 🔧 [JSON Validator](https://jsonformatter.curiousconcept.com/) - Validate Firebase config
- 🖼️ [Image Compressor](https://tinyjpg.com/) - Compress product images
- 📸 [Image Host](https://imgbb.com/) - Quick image URLs

---

## 🔄 Receive Updates from the Template

This template is actively maintained with bug fixes, new features, and improvements! You can easily pull the latest updates into your repo with **one click** from your browser:

### How to Get Updates

1. **Go to your repository** on GitHub
2. Click on the **Actions** tab
3. Select **"Update from template"** workflow from the left sidebar
4. Click **"Run workflow"** → Select your branch (usually `main`) → Click **"Run workflow"**
5. Wait 1-2 minutes for the workflow to complete
6. A **Pull Request** will be automatically created with all the latest updates
7. **Review the PR** and click **"Merge"** to apply the updates

### What You Get

- ✨ New features and enhancements
- 🐛 Bug fixes and security patches
- 📚 Documentation improvements
- 🎨 UI/UX improvements
- ⚡ Performance optimizations

### Safety Features

- **Safe & non-destructive**: Updates are proposed as a Pull Request (no automatic changes to your live site)
- **Review before applying**: You can review all changes in the PR before merging
- **Your customizations are preserved**: The workflow tries to preserve your store name, branding, and custom files
- **Revertable**: You can always undo changes by reverting the merge

### Optional: Automatic Weekly Updates

By default, the workflow also runs **automatically every Monday** to check for updates. You can:
- **Disable automatic updates**: Edit `.github/workflows/update-from-template.yml` and remove the `schedule:` section
- **Enable auto-merge**: Add a secret `AUTO_MERGE_TEMPLATE_UPDATES` set to `true` in Settings → Secrets (⚠️ only if you're comfortable with automatic merges)

### Handling Conflicts

If you've customized files that the template also updated, you may see merge conflicts. Don't worry!

1. GitHub will mark the files with conflicts in the PR
2. Click **"Resolve conflicts"** in the PR
3. Keep your changes or accept the template updates for each conflict
4. Commit the resolution and merge

**Pro tip**: Keep your customizations in dedicated files (like `src/config/business.js` for store info) to minimize conflicts.

---

## Features

### Customer-Facing
- Product catalog with search functionality
- Shopping cart with real-time stock validation
- Mobile-responsive design with professional layout
- Order placement with customer info collection
- "Remember me" functionality for customer information
- WhatsApp integration for order tracking
- Out-of-stock badges and inventory tracking
- Discount pricing support with percentage badges
- Dynamic currency symbol support (₹, $, €, £, ¥, etc.)
- Decimal formatting for all prices
- Responsive cart modal with column-based layout

### Admin Panel
- Secure admin authentication
- Product management (CRUD operations)
- Order management with status tracking (Pending, Processing, Completed, Cancelled)
- Enhanced dashboard with order statistics and low stock alerts
- Store settings with tabbed interface:
  - **General**: Store name, logo URL, contact info, social media
  - **Appearance**: Theme templates (Professional, Vibrant, Minimal, Elegant, Modern)
  - **Pages**: About Us, Terms & Conditions, Privacy Policy
  - **SEO**: Meta title, description, keywords
  - **Pricing**: Currency symbol, tax percentage, shipping cost
- Settings tab persistence via URL parameters
- Logo URL configuration (local paths or external URLs)

### Developer-Friendly
- 100% browser-based setup
- Google Fonts integration (just specify font name)
- PR preview deployments for testing
- Multiple theme templates to choose from
- Mobile-first, responsive design
- Firebase hosting included
- Automatic CI/CD via GitHub Actions

## Browser-Only Setup Guide

### Prerequisites
- GitHub account (free)
- Firebase account (free)
- No local development environment needed!

### Helpful Tools
- **JSON Validator**: [jsonformatter.curiousconcept.com](https://jsonformatter.curiousconcept.com/) - Validate and format your Firebase config JSON
- **Image Compression**: [tinyjpg.com](https://tinyjpg.com/) - Compress product images for faster loading
- **Temporary Image Hosting**: [imgbb.com](https://imgbb.com/) - Upload product images and get direct URLs

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

#### C. Enable Hosting
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

You can customize your store in two ways:

### Option A: Through Admin Panel (Recommended)

1. Go to `https://YOUR-PROJECT-ID.web.app/admin`
2. Login with your admin credentials
3. Navigate to **"Settings"** tab

**General Tab**:
- Store name
- **Logo URL**: Enter `/images/logo.png` for local images or paste a direct URL (e.g., from imgbb.com)
- Phone and WhatsApp numbers
- Social media links (Facebook, Instagram, YouTube)

**Appearance Tab**:
- Choose from 5 theme templates:
  - Professional (Blue & Modern)
  - Vibrant (Purple & Energetic)
  - Minimal (Clean & Simple)
  - Elegant (Dark & Sophisticated)
  - Modern (Teal & Fresh)

**SEO Tab**:
- SEO Title (50-60 characters)
- SEO Description (150-160 characters)
- SEO Keywords (comma-separated)

**Pricing Tab**:
- Currency symbol (₹, $, €, £, ¥, د.إ, SR)
- Tax percentage (%)
- Shipping cost (flat rate)

**Pages Tab**:
- About Us content and image
- Terms & Conditions
- Privacy Policy

### Option B: Through Code (Advanced)

**Upload Your Logo**:
1. Compress your logo using [tinyjpg.com](https://tinyjpg.com/)
2. Go to `public/images/` folder in GitHub
3. Click "Add file" > "Upload files"
4. Upload your logo as `logo.png`
5. Or use Admin Panel > Settings > General > Logo URL to set it

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

**Add Product Images**:
- **Option 1**: Upload to `public/images/` and use paths like `/images/product-1.jpg`
- **Option 2**: Compress images with [tinyjpg.com](https://tinyjpg.com/), upload to [imgbb.com](https://imgbb.com/), and use the direct URL

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

### Dashboard

1. Go to `https://YOUR-PROJECT-ID.web.app/admin`
2. View real-time statistics:
   - Total Orders
   - Pending Orders (new orders)
   - Processing Orders (being fulfilled)
   - Completed Orders
   - Total Revenue (excludes cancelled orders)
   - Low Stock Alerts (products with less than 5 items)

### Adding Products

1. Go to admin panel > "Products" tab
2. Click "Add Product"
3. Fill in details:
   - **Title**: Product name
   - **Description**: Short description
   - **Price**: Regular price (in your selected currency)
   - **Discounted Price** (optional): Sale price - shows % OFF badge
   - **Image Path**: Choose one option:
     - Upload to `/public/images/` and use `/images/product-1.jpg`
     - Or compress with [tinyjpg.com](https://tinyjpg.com/), upload to [imgbb.com](https://imgbb.com/), paste direct URL
   - **Stock**: Available quantity (cart validates against this)
4. Click "Save"

**Tips**:
- Compress images before uploading for faster page loads
- Use descriptive file names
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
   - Logo URL (supports `/images/` paths or full URLs)
   - Contact information (phone, WhatsApp)
   - Social media links
3. **Appearance Tab**:
   - Select theme template
   - Click "Apply" and page will refresh with new theme
4. **Pages Tab**:
   - Customize About Us, Terms, Privacy Policy pages
   - Add images for pages (optional)
5. **SEO Tab**:
   - Set meta tags for better search engine visibility
6. **Pricing Tab**:
   - Select currency symbol (appears throughout the site)
   - Set tax percentage (automatically calculated in cart)
   - Set flat shipping cost (added to all orders)

**Note**: Settings tabs remember your last position via URL parameters

---

## Customer Shopping Experience

### Cart Features
- **Real-time stock validation**: Cart prevents adding more items than available in stock
- **Auto-open cart**: Cart modal opens automatically when products are added
- **Column layout**: Clean, vertical layout with right-aligned prices
- **Decimal formatting**: All prices show with 2 decimal places
- **Dynamic currency**: Prices display in your configured currency symbol
- **Live calculations**: Subtotal, tax, and shipping calculated in real-time

### Checkout Features
- **Customer information form**: Name, phone, address, PIN code
- **Form validation**: Ensures all required fields are filled
- **"Remember me" checkbox**: Saves customer info in browser (checked by default)
- **Clear saved info**: Customers can clear their saved information
- **Order summary**: Shows itemized breakdown with tax and shipping
- **WhatsApp integration**: After order placement, customers can message you directly

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

**Q: Can I use my own domain?**
A: Yes! Configure custom domain in Firebase Hosting settings

**Q: How much does it cost?**
A: Free for small stores (Firebase free tier). GitHub and Firebase both have generous free tiers.

**Q: Where should I upload product images?**
A: Three options:
1. Upload to `/public/images/` in your repository (recommended for permanent images)
2. Upload to [imgbb.com](https://imgbb.com/) for quick testing (get direct URLs)
3. Use any image hosting service that provides direct image URLs

**Q: Should I compress my images?**
A: Yes! Use [tinyjpg.com](https://tinyjpg.com/) to compress images before uploading. This makes your site load faster.

**Q: How do I validate my Firebase JSON config?**
A: Use [jsonformatter.curiousconcept.com](https://jsonformatter.curiousconcept.com/) to validate and format your JSON correctly.

**Q: Can I change the currency?**
A: Yes! Go to Admin Panel > Settings > Pricing tab and select your currency. It updates throughout the entire site.

**Q: What theme templates are available?**
A: Professional, Vibrant, Minimal, Elegant, and Modern. Change in Admin Panel > Settings > Appearance.

**Q: Can customers save their information?**
A: Yes! The "Remember this information" checkbox (checked by default) saves customer details in their browser.

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
