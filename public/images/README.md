# Images Folder

Use this folder for logos, product photos, and other static images that you reference by path.

## First-class options

1. **Admin Image URL** — paste `/images/product.jpg` or any `https://…` URL in Products / Settings.
2. **Admin Upload** — upload in the admin panel (Firebase Storage, auto-compressed). Storage must be enabled for this path.

## Required files in this folder

### Logo
- **File**: `logo.png`
- **Recommended size**: 200x80px (or similar aspect ratio)
- **Purpose**: Default header logo until you upload or paste a custom URL

### Placeholder
- **File**: `placeholder.png`
- **Purpose**: Shown when product images fail to load

### Product Images
- **Format**: JPG, PNG, WebP, or SVG
- **Recommended size**: 800x800px (square)
- **Naming**: Descriptive names (e.g. `product-tshirt-blue.jpg`)

## How to add files here (browser-only)

1. Open `public/images/` in GitHub
2. Click **Add file** → **Upload files**
3. Commit
4. In admin, choose **Image URL** and enter `/images/your-file.jpg`

## Example paths

- `/images/logo.png`
- `/images/product-1.jpg`
- `/images/banner-about.jpg`
