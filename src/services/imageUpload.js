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
      
      console.log('4. Admin check in Firestore (CLIENT-SIDE):');
      console.log('   - Email being checked:', userEmail);
      console.log('   - Firestore path: admins/' + userEmail);
      console.log('   - Document reference:', adminDocRef.path);
      
      const adminDoc = await getDoc(adminDocRef);
      
      console.log('4a. Firestore read result:', {
        documentExists: adminDoc.exists(),
        documentId: adminDoc.id,
        documentData: adminDoc.exists() ? adminDoc.data() : null,
        role: adminDoc.exists() ? adminDoc.data()?.role : 'N/A',
        roleType: adminDoc.exists() ? typeof adminDoc.data()?.role : 'N/A',
        isAdmin: adminDoc.exists() && adminDoc.data()?.role === 'admin',
        allFields: adminDoc.exists() ? Object.keys(adminDoc.data()) : []
      });

      if (!adminDoc.exists()) {
        console.error('❌ Admin document NOT FOUND in Firestore');
        console.error('   Expected document ID (exact match required):', userEmail);
        console.error('   Case-sensitive check: "' + userEmail + '"');
        console.error('   Action: Create document in Firestore admins collection');
        console.error('   - Collection: admins');
        console.error('   - Document ID: ' + userEmail + ' (exact email)');
        console.error('   - Fields: role: "admin" (string), email: "' + userEmail + '" (string)');
      } else {
        const docData = adminDoc.data();
        const roleValue = docData?.role;
        console.log('4b. Document found - verifying role:');
        console.log('   - Role value:', roleValue);
        console.log('   - Role type:', typeof roleValue);
        console.log('   - Role === "admin":', roleValue === 'admin');
        console.log('   - Role == "admin" (loose):', roleValue == 'admin');
        console.log('   - All document fields:', Object.keys(docData));
        console.log('   - Full document data:', JSON.stringify(docData, null, 2));
        
        if (roleValue !== 'admin') {
          console.error('❌ Admin document exists but role is not "admin"');
          console.error('   Current role value:', roleValue);
          console.error('   Current role type:', typeof roleValue);
          console.error('   Expected: "admin" (string)');
          console.error('   Action: Update role field to "admin" (string type)');
        } else {
          console.log('✅ Client-side admin check PASSED');
          console.log('   - Document exists: ✅');
          console.log('   - Role is "admin": ✅');
          console.log('   - This means the issue is likely in Storage rules');
          console.log('   - Storage rules need Storage service account to have Cloud Datastore User role');
          console.log('   - Storage service account is DIFFERENT from Firebase Admin SDK service account');
          console.log('   - Storage SA format: service-XXXXX@gs-project-accounts.iam.gserviceaccount.com');
        }
      }
    } catch (adminCheckError) {
      console.error('❌ Error checking admin status in Firestore:', adminCheckError);
      console.error('   Error details:', {
        message: adminCheckError.message,
        code: adminCheckError.code,
        stack: adminCheckError.stack
      });
    }

    console.log('5. Storage Rules Check (SERVER-SIDE):');
    console.log('   Storage rules will evaluate:');
    console.log('   - request.auth != null:', !!auth.currentUser);
    console.log('   - request.auth.token.email:', auth.currentUser?.email);
    console.log('   - request.auth.uid:', auth.currentUser?.uid);
    console.log('   - Firestore path Storage rules will check:');
    console.log('     /databases/(default)/documents/admins/' + userEmail);
    console.log('   - Storage rules function: isAdmin()');
    console.log('   - Storage rules need Storage service account to read Firestore');
    console.log('   - Storage SA must have: roles/datastore.user IAM role');
    console.log('   - Storage SA format: service-XXXXX@gs-project-accounts.iam.gserviceaccount.com');
    console.log('   - NOTE: This is DIFFERENT from Firebase Admin SDK service account!');
    console.log('');
    console.log('6. Attempting upload to Storage...');
    
    const storageRef = ref(storage, path);
    
    console.log('7. Storage reference created:', {
      fullPath: storageRef.fullPath,
      bucket: storageRef.bucket,
      name: storageRef.name,
      storageBucket: storage.app.options.storageBucket
    });

    console.log('8. Calling uploadBytes (this triggers Storage rules evaluation)...');
    console.log('   If this fails with 403, Storage rules could not verify admin status');
    console.log('   Common causes:');
    console.log('   1. Storage service account missing Cloud Datastore User role');
    console.log('   2. Email mismatch in Firestore (case-sensitive)');
    console.log('   3. Role field not exactly "admin" (string)');
    console.log('   4. Storage rules not deployed correctly');
    await uploadBytes(storageRef, file);
    console.log('✅ Upload successful! Storage rules passed.');
    
    const downloadURL = await getDownloadURL(storageRef);
    console.log('9. Download URL obtained:', downloadURL);
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
      console.error('❌❌❌ PERMISSION DENIED (403) - Detailed Analysis ❌❌❌');
      console.error('');
      console.error('CLIENT-SIDE CHECK (from logs above):');
      console.error('   - User authenticated: ✅ (we got this far)');
      console.error('   - Admin check in Firestore: Check logs above');
      console.error('');
      console.error('SERVER-SIDE CHECK (Storage Rules):');
      console.error('   - Storage rules evaluated: isAdmin() function');
      console.error('   - Storage rules check Firestore: /databases/(default)/documents/admins/' + userEmail);
      console.error('   - Storage rules FAILED to verify admin status');
      console.error('');
      console.error('MOST LIKELY CAUSES:');
      console.error('   1. Storage service account missing IAM role');
      console.error('      - Go to: https://console.cloud.google.com/iam-admin/iam?project=online-chayakkada');
      console.error('      - Find: service-XXXXX@gs-project-accounts.iam.gserviceaccount.com');
      console.error('      - Add role: Cloud Datastore User (roles/datastore.user)');
      console.error('      - NOTE: This is DIFFERENT from firebase-adminsdk service account!');
      console.error('');
      console.error('   2. Email mismatch in Firestore');
      console.error('      - Check Firestore admins collection');
      console.error('      - Document ID must be EXACTLY: ' + userEmail);
      console.error('      - Case-sensitive! "User@Email.com" ≠ "user@email.com"');
      console.error('');
      console.error('   3. Role field incorrect');
      console.error('      - Must be: role: "admin" (string, lowercase)');
      console.error('      - Not: "Admin", "ADMIN", or any other value');
      console.error('');
      console.error('   4. Storage rules not deployed');
      console.error('      - Check Firebase Console → Storage → Rules');
      console.error('      - Should match storage.rules file');
      console.error('      - Redeploy if needed: firebase deploy --only storage');
      console.error('');
      console.error('CURRENT USER INFO:');
      console.error('   - Email:', userEmail);
      console.error('   - UID:', auth.currentUser?.uid);
      console.error('   - Email verified:', auth.currentUser?.emailVerified);
      console.error('');
      throw new Error(`Permission denied (403). Check console for detailed analysis. Most likely: Storage service account needs Cloud Datastore User IAM role.`);
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

