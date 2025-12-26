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
  console.log('=== IMAGE UPLOAD DEBUG START ===');
  
  try {
    // Check current auth state
    const currentUser = auth.currentUser;
    console.log('1. Current auth state:', {
      isAuthenticated: !!currentUser,
      email: currentUser?.email || 'null',
      uid: currentUser?.uid || 'null',
      emailVerified: currentUser?.emailVerified || false
    });

    // Verify user is authenticated before uploading
    const authState = await checkAuth();
    console.log('2. Auth check result:', {
      authenticated: authState.authenticated,
      userEmail: authState.user?.email || 'null',
      userUid: authState.user?.uid || 'null'
    });

    if (!authState.authenticated || !authState.user) {
      console.error('❌ Upload failed: User not authenticated', {
        currentUser: auth.currentUser,
        authState
      });
      throw new Error('You must be logged in to upload images. Please log in as an admin and try again.');
    }

    const userEmail = authState.user.email;
    console.log('3. Upload details:', {
      userEmail: userEmail,
      userUid: authState.user.uid,
      filePath: path,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      warning: 'Email must EXACTLY match (case-sensitive) Firestore admins document ID'
    });

    // Check admin status via Firestore (for debugging)
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      const adminDocRef = doc(db, 'admins', userEmail);
      const adminDoc = await getDoc(adminDocRef);
      
      console.log('4. Admin check in Firestore:', {
        emailBeingChecked: userEmail,
        documentExists: adminDoc.exists(),
        documentData: adminDoc.exists() ? adminDoc.data() : null,
        role: adminDoc.exists() ? adminDoc.data()?.role : 'N/A',
        isAdmin: adminDoc.exists() && adminDoc.data()?.role === 'admin'
      });

      if (!adminDoc.exists()) {
        console.error('❌ Admin document NOT FOUND in Firestore');
        console.error('   Expected document ID:', userEmail);
        console.error('   Action: Create document in Firestore admins collection with this exact email as document ID');
      } else if (adminDoc.data()?.role !== 'admin') {
        console.error('❌ Admin document exists but role is not "admin"');
        console.error('   Current role:', adminDoc.data()?.role);
        console.error('   Action: Update role field to "admin"');
      } else {
        console.log('✅ Admin check passed - user is admin');
      }
    } catch (adminCheckError) {
      console.warn('⚠️ Could not verify admin status in Firestore:', adminCheckError);
    }

    console.log('5. Attempting upload to Storage...');
    console.log('   Storage rules will check:');
    console.log('   - request.auth != null:', !!auth.currentUser);
    console.log('   - request.auth.token.email:', auth.currentUser?.email);
    console.log('   - Firestore path: /databases/(default)/documents/admins/' + userEmail);
    console.log('   - Expected role: "admin"');
    
    const storageRef = ref(storage, path);
    
    console.log('6. Storage reference created:', {
      fullPath: storageRef.fullPath,
      bucket: storageRef.bucket,
      name: storageRef.name
    });

    console.log('7. Calling uploadBytes...');
    await uploadBytes(storageRef, file);
    console.log('✅ Upload successful!');
    
    const downloadURL = await getDownloadURL(storageRef);
    console.log('7. Download URL obtained:', downloadURL);
    console.log('=== IMAGE UPLOAD DEBUG END (SUCCESS) ===');
    
    return downloadURL;
  } catch (error) {
    console.error('=== IMAGE UPLOAD DEBUG END (ERROR) ===');
    console.error('Error uploading image:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      serverResponse: error.serverResponse,
      stack: error.stack,
      currentUser: auth.currentUser?.email || 'Not authenticated',
      currentUserUid: auth.currentUser?.uid || 'Not authenticated'
    });
    
    // Provide more specific error messages
    if (error.code === 'storage/unauthorized' || error.code === 403) {
      const userEmail = auth.currentUser?.email || 'Not logged in';
      console.error('❌ Permission denied. Debugging info:');
      console.error('   - User email:', userEmail);
      console.error('   - Check Firestore admins collection for document with ID:', userEmail);
      console.error('   - Document must have role: "admin"');
      console.error('   - Email must match EXACTLY (case-sensitive)');
      throw new Error(`Permission denied. You are logged in as ${userEmail}. Please verify: 1) This email exists in Firestore admins collection (as document ID), 2) The document has role: "admin", 3) Email matches exactly (case-sensitive).`);
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
    
    // Get file extension
    const getFileExtension = (filename) => {
      return filename.split('.').pop().toLowerCase() || 'jpg';
    };
    
    // Use product ID with _1 for single image
    const extension = getFileExtension(compressedFile.name);
    const fileName = `${productId}_1.${extension}`;
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
    // Get file extension from first file
    const getFileExtension = (filename) => {
      return filename.split('.').pop().toLowerCase() || 'jpg';
    };
    
    const uploadPromises = files.map((file, index) => {
      const extension = getFileExtension(file.name);
      // Use product ID with _1, _2, _3 etc for cleaner naming
      const fileName = `${productId}_${index + 1}.${extension}`;
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

