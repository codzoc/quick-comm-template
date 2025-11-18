# 🚀 Quick Start - Your Store in 30 Minutes!

No coding needed. Just follow these simple steps.

---

## Step 1: Create GitHub Account (2 min)

1. Go to [github.com](https://github.com)
2. Click "Sign up"
3. Enter email, password, username
4. Verify your email

**Done!** ✅

---

## Step 2: Fork This Template (1 min)

1. Click the **"Fork"** button at the top of this page
2. Wait a few seconds
3. You now have your own copy!

**Done!** ✅

---

## Step 3: Create Firebase Project (5 min)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name (e.g., "my-awesome-store")
4. Click "Continue"
5. Disable Google Analytics (you don't need it)
6. Click "Create project"
7. Wait for setup to complete
8. Click "Continue"

**Done!** ✅

---

## Step 4: Enable Firebase Services (3 min)

### A. Enable Firestore Database
1. In left sidebar, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location closest to you
5. Click **"Enable"**

### B. Enable Authentication
1. In left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Click **"Email/Password"**
4. Toggle **"Enable"** on
5. Click **"Save"**

### C. Enable Hosting
1. In left sidebar, click **"Build"** → **"Hosting"**
2. Click **"Get started"**
3. Click "Next" → "Next" → "Finish" (we'll deploy via GitHub)

**Done!** ✅

---

## Step 5: Get Firebase Configuration (3 min)

1. Click the **⚙️ gear icon** (top left) → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click the **`</>`** icon (Web)
4. Enter nickname: "My Store"
5. Click **"Register app"**
6. **COPY** the configuration values shown:

```javascript
apiKey: "AIza..."
authDomain: "my-project.firebaseapp.com"
projectId: "my-project"
storageBucket: "my-project.appspot.com"
messagingSenderId: "1234567890"
appId: "1:1234567890:web:abcdef"
```

7. **IMPORTANT**: Also copy your **Project ID** (e.g., "my-project")

**Keep this info handy!** 📋

---

## Step 6: Get Firebase Service Account (3 min)

1. Still in Firebase → **Project Settings** → **"Service accounts"** tab
2. Click **"Generate new private key"**
3. Click **"Generate key"**
4. A JSON file downloads - **DON'T LOSE THIS!**
5. Open the JSON file with Notepad/TextEdit
6. **Copy the ENTIRE contents** (all the text)

**Save this JSON somewhere safe!** 📋

---

## Step 7: Add Secrets to GitHub (5 min)

1. Go to **YOUR** forked repository on GitHub
2. Click **"Settings"** tab (top menu)
3. Click **"Secrets and variables"** → **"Actions"** (left sidebar)
4. Click **"New repository secret"** button

Now add these **8 secrets** one by one:

| Secret Name | Where to Get Value |
|-------------|-------------------|
| `VITE_FIREBASE_API_KEY` | Copy from Firebase config → `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Copy from Firebase config → `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | Copy from Firebase config → `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Copy from Firebase config → `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Copy from Firebase config → `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | Copy from Firebase config → `appId` |
| `FIREBASE_PROJECT_ID` | **Same as** `VITE_FIREBASE_PROJECT_ID` |
| `FIREBASE_SERVICE_ACCOUNT` | Paste **entire JSON file contents** |

**For each secret:**
1. Click "New repository secret"
2. Name: Copy exact name from table above
3. Value: Paste the value
4. Click "Add secret"

**Done!** ✅

---

## Step 8: Pick Your Colors (2 min)

1. Go to [canva.com/colors/color-palette-generator](https://www.canva.com/colors/color-palette-generator/)
2. Upload your logo OR click a color palette you like
3. Canva will generate colors for you
4. **Copy the HEX codes** (e.g., `#3B82F6`, `#10B981`)

**Example:**
- Primary (main brand): `#3B82F6`
- Secondary (accents): `#10B981`

**Save these colors!** 🎨

---

## Step 9: Pick Your Font (1 min)

1. Go to [fonts.google.com](https://fonts.google.com)
2. Browse fonts and click one you like
3. **Just remember the name** (e.g., "Poppins", "Roboto", "Montserrat")

**Popular choices:**
- Poppins (modern, rounded)
- Roboto (clean, professional)
- Inter (tech, startup)
- Montserrat (elegant)
- Lato (friendly)

**Save the font name!** ✍️

---

## Step 10: Customize Your Theme (2 min)

1. In GitHub repo, go to **`src/config/theme.js`**
2. Click **✏️ pencil icon** (edit)
3. Change these lines:

```javascript
// Line 13 - Change font
fontFamily: 'Poppins',  // ← Put your Google Font name here

// Line 18 - Change primary color
primary: '#3B82F6',  // ← Put your primary color here

// Line 20 - Change secondary color
secondary: '#10B981',  // ← Put your secondary color here
```

4. Click **"Commit changes"**
5. Click **"Commit changes"** again

**Done!** ✅

---

## Step 11: Set Your Store Name (1 min)

1. Go to **`src/config/business.js`**
2. Click **✏️ pencil icon**
3. Change line 10:

```javascript
storeName: 'My Amazing Store',  // ← Put your store name
```

4. Click **"Commit changes"** → **"Commit changes"**

**Done!** ✅

---

## Step 12: Upload Your Logo (2 min)

1. Prepare your logo image (PNG or JPG, recommended 200x80px)
2. In GitHub, go to **`public/images/`** folder
3. Click **"Add file"** → **"Upload files"**
4. Drag your logo OR click "choose your files"
5. Name it exactly: **`logo.png`** (or `logo.jpg`)
6. Click **"Commit changes"**

**Done!** ✅

---

## Step 13: Deploy Firestore Rules (3 min)

**Option 1 - GitHub Codespaces (Easiest):**

1. Go to your GitHub repo
2. Click **"Code"** button → **"Codespaces"** tab
3. Click **"Create codespace on main"**
4. Wait for it to load (1-2 minutes)
5. In the terminal at bottom, run these commands:

```bash
npm install -g firebase-tools
firebase login --no-localhost
firebase deploy --only firestore
```

6. Follow the login prompts in browser
7. Close the codespace when done

**Option 2 - Using your computer (if you have terminal):**

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore
```

**Done!** ✅

---

## Step 14: Create Your Admin Account (2 min)

1. Go to Firebase Console → **Authentication** → **Users**
2. Click **"Add user"**
3. Enter your email (e.g., `admin@mystore.com`)
4. Enter a strong password
5. Click **"Add user"**
6. **SAVE THESE CREDENTIALS!** You'll use them to login

**Done!** ✅

---

## Step 15: Deploy Your Store! (1 min)

1. Go to your GitHub repo
2. Click **"Actions"** tab
3. You should see a workflow running (yellow dot)
4. Wait 2-3 minutes for it to complete
5. When done, you'll see a green checkmark ✅

**Your store is LIVE!** 🎉

---

## Step 16: Access Your Store

**Storefront (Customer view):**
- `https://YOUR-PROJECT-ID.web.app`

**Admin Panel:**
- `https://YOUR-PROJECT-ID.web.app/admin`
- Login with the email/password from Step 15

**Replace `YOUR-PROJECT-ID`** with your actual Firebase project ID!

---

## Next Steps

### Add Your First Product

1. Go to admin panel (`https://your-project.web.app/admin`)
2. Login with admin credentials
3. Click **"Products"** tab
4. Click **"Add Product"**
5. Fill in:
   - Title: "Blue T-Shirt"
   - Description: "Comfortable cotton t-shirt"
   - Price: 500
   - Image Path: `/images/placeholder.png` (use this for now)
   - Stock: 10
6. Click **"Save"**

### Upload Product Images

1. Go to **`public/images/`** in GitHub
2. Upload your product images
3. Edit product in admin panel
4. Change image path to `/images/your-product.jpg`

### Configure Store Settings

1. In admin panel, go to **"Settings"**
2. Add:
   - Phone number
   - WhatsApp number (for order support)
   - Facebook, Instagram, YouTube links
3. Write About Us, Terms, Privacy Policy
4. Click **"Save"**

---

## Testing Your Store

1. Open storefront in **Incognito/Private** browser window
2. Browse products
3. Add to cart
4. Fill checkout form
5. Place order
6. Check admin panel → Orders

**It works!** 🎊

---

## Making Changes

**Every time you edit a file in GitHub:**
1. Changes are saved
2. GitHub Actions runs automatically
3. Your store updates in 2-3 minutes!

**Test before going live:**
1. Create a new branch
2. Make changes
3. Create Pull Request
4. GitHub gives you a preview URL
5. Test it
6. Merge when ready

---

## Need Help?

- 📺 **Video Tutorial**: [youtube.com/@build.with.justin](https://youtube.com/@build.with.justin)
- 📖 **Full Documentation**: See [README.md](./README.md)
- 💬 **Questions**: Comment on YouTube videos

---

## Common Issues

### "Build failed" in GitHub Actions
- Check that all 8 secrets are added correctly
- Make sure secret names are EXACT (case-sensitive)

### "Can't login to admin"
- Verify you created admin user in Firebase Console
- Check email/password are correct

### "No products showing"
- Make sure you deployed Firestore rules (Step 14)
- Check you added products in admin panel

### "Images not loading"
- Ensure images are in `public/images/` folder
- Check image path starts with `/images/`

---

**🎉 Congratulations! Your store is ready!**

**Built with ❤️ by [@build.with.justin](https://youtube.com/@build.with.justin)**
