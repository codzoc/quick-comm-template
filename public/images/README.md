# Images Folder

This folder contains all product images, logos, and other static images for your store.

## Required Images

### Logo
- **File**: `logo.png`
- **Recommended size**: 200x80px (or similar aspect ratio)
- **Purpose**: Displayed in header

### Product Images
- **Format**: JPG or PNG
- **Recommended size**: 800x800px (square, 1:1 aspect ratio)
- **Naming**: Use descriptive names (e.g., `product-tshirt-blue.jpg`)

### Placeholder
- **File**: `placeholder.png`
- **Purpose**: Shown when product images fail to load

## How to Add Images

### Via GitHub Web Interface (Browser-Only Method)
1. Go to your repository on GitHub
2. Navigate to `public/images/`
3. Click "Add file" > "Upload files"
4. Drag and drop your images
5. Click "Commit changes"

### Supported Formats
- PNG (recommended for logos with transparency)
- JPG/JPEG (recommended for product photos)
- WebP (modern, smaller file sizes)
- SVG (for icons and simple graphics)

## Image Optimization Tips

1. **Compress images** before uploading to reduce file size
   - Use tools like TinyPNG, Squoosh, or ImageOptim
   - Target: < 200KB per product image

2. **Use square aspect ratio** for product images (1:1)
   - Ensures consistent display in product grid

3. **Use descriptive filenames**
   - Good: `laptop-dell-xps-13.jpg`
   - Bad: `IMG_1234.jpg`

## Example Image Paths

When adding products in admin panel, use paths like:
- `/images/logo.png`
- `/images/product-1.jpg`
- `/images/tshirt-red.jpg`
- `/images/banner-about.jpg`

## Current Images

After setup, your images folder should contain:
- `logo.png` - Your store logo
- `placeholder.png` - Default placeholder image
- `product-*.jpg` - Your product images
- `banner-*.jpg` - Any banner images for static pages (optional)
