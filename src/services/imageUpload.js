import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import imageCompression from 'browser-image-compression';

/**
 * Image Upload Service
 * Handles image compression, resizing, and upload to Firebase Storage
 */

/**
 * Compress and resize image
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxSizeMB - Maximum file size in MB (default: 1)
 * @returns {Promise<File>} Compressed image file
 */
async function compressImage(file, maxWidth, maxSizeMB = 1) {
  const options = {
    maxSizeMB: maxSizeMB,
    maxWidthOrHeight: maxWidth,
    useWebWorker: true,
    fileType: file.type
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image. Please try again.');
  }
}

/**
 * Upload image to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} path - Storage path (e.g., 'products/image.jpg')
 * @returns {Promise<string>} Download URL
 */
async function uploadImageToStorage(file, path) {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Provide more specific error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error('You do not have permission to upload images. Please make sure you are logged in as an admin.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload was canceled.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('An unknown error occurred. Please check your internet connection and try again.');
    } else if (error.message && error.message.includes('CORS')) {
      throw new Error('CORS error: Please make sure Firebase Storage rules are deployed. Run: firebase deploy --only storage');
    }
    
    throw new Error(error.message || 'Failed to upload image. Please try again.');
  }
}

/**
 * Upload product image (max width: 1024px)
 * @param {File} file - Image file
 * @param {string} productId - Product ID (optional, for new products use 'temp')
 * @returns {Promise<string>} Download URL
 */
export async function uploadProductImage(file, productId = 'temp') {
  try {
    // Compress to max 1024px width, max 1MB
    const compressedFile = await compressImage(file, 1024, 1);
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${productId}_${timestamp}_${compressedFile.name}`;
    const path = `products/${fileName}`;
    
    // Upload to Firebase Storage
    const downloadURL = await uploadImageToStorage(compressedFile, path);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error;
  }
}

/**
 * Upload multiple product images
 * @param {File[]} files - Array of image files
 * @param {string} productId - Product ID (optional, for new products use 'temp')
 * @returns {Promise<string[]>} Array of download URLs
 */
export async function uploadProductImages(files, productId = 'temp') {
  try {
    const uploadPromises = files.map((file, index) => {
      const timestamp = Date.now();
      const fileName = `${productId}_${index}_${timestamp}_${file.name}`;
      return compressImage(file, 1024, 1)
        .then(compressedFile => uploadImageToStorage(compressedFile, `products/${fileName}`));
    });
    
    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error) {
    console.error('Error uploading product images:', error);
    throw error;
  }
}

/**
 * Upload logo image (max width: 512px)
 * @param {File} file - Image file
 * @param {string} type - 'logo' or 'icon'
 * @returns {Promise<string>} Download URL
 */
export async function uploadLogoImage(file, type = 'logo') {
  try {
    // Compress to max 512px width, max 0.5MB
    const compressedFile = await compressImage(file, 512, 0.5);
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${type}_${timestamp}_${compressedFile.name}`;
    const path = `logos/${fileName}`;
    
    // Upload to Firebase Storage
    const downloadURL = await uploadImageToStorage(compressedFile, path);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading logo image:', error);
    throw error;
  }
}

/**
 * Upload static page image (max width: 1024px)
 * @param {File} file - Image file
 * @param {string} pageType - 'about', 'terms', or 'privacy'
 * @returns {Promise<string>} Download URL
 */
export async function uploadStaticPageImage(file, pageType) {
  try {
    // Compress to max 1024px width, max 1MB
    const compressedFile = await compressImage(file, 1024, 1);
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${pageType}_${timestamp}_${compressedFile.name}`;
    const path = `static-pages/${fileName}`;
    
    // Upload to Firebase Storage
    const downloadURL = await uploadImageToStorage(compressedFile, path);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading static page image:', error);
    throw error;
  }
}

/**
 * Delete image from Firebase Storage
 * @param {string} url - Download URL of the image to delete
 * @returns {Promise<void>}
 */
export async function deleteImage(url) {
  try {
    // Extract path from URL
    const urlObj = new URL(url);
    const path = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error - deletion is not critical
  }
}

export default {
  uploadProductImage,
  uploadProductImages,
  uploadLogoImage,
  uploadStaticPageImage,
  deleteImage
};

