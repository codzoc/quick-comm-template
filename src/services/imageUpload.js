import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
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
 * Check if user is authenticated and get current user
 * @returns {Promise<{authenticated: boolean, user: any}>}
 */
function checkAuth() {
  return new Promise((resolve) => {
    // Check current user first (synchronous)
    const currentUser = auth.currentUser;
    if (currentUser) {
      resolve({ authenticated: true, user: currentUser });
      return;
    }
    
    // If no current user, wait for auth state change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve({ authenticated: !!user, user });
    });
    
    // Timeout after 2 seconds
    setTimeout(() => {
      unsubscribe();
      resolve({ authenticated: false, user: null });
    }, 2000);
  });
}

/**
 * Upload image to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} path - Storage path (e.g., 'products/image.jpg')
 * @returns {Promise<string>} Download URL
 */
async function uploadImageToStorage(file, path) {
  try {
    // Verify user is authenticated before uploading
    const authState = await checkAuth();
    if (!authState.authenticated || !authState.user) {
      console.error('Upload failed: User not authenticated', {
        currentUser: auth.currentUser,
        authState
      });
      throw new Error('You must be logged in to upload images. Please log in as an admin and try again.');
    }

    console.log('Uploading image with authenticated user:', {
      email: authState.user.email,
      uid: authState.user.uid,
      path,
      tokenEmail: authState.user.email, // This should match Firestore document ID exactly
      note: 'Make sure this email exactly matches (case-sensitive) the document ID in Firestore admins collection'
    });

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      serverResponse: error.serverResponse,
      currentUser: auth.currentUser?.email || 'Not authenticated'
    });
    
    // Provide more specific error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error('You do not have permission to upload images. Please make sure: 1) You are logged in as an admin, 2) Your email is in the admins collection in Firestore, 3) Storage rules are deployed.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload was canceled.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('An unknown error occurred. Please check your internet connection and try again.');
    } else if (error.message && (error.message.includes('CORS') || error.message.includes('preflight') || error.message.includes('XMLHttpRequest'))) {
      const userEmail = auth.currentUser?.email || 'Not logged in';
      throw new Error(`CORS error detected. This usually means: 1) You are not authenticated (current: ${userEmail}), 2) Storage rules are not deployed, or 3) Your email is not in the admins collection. Please log out and log back in as admin, then verify your email is in Firestore admins collection.`);
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

