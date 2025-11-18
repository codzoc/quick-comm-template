import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'products';

/**
 * Products Service
 * Handles all product-related database operations
 */

/**
 * Get all products
 * @returns {Promise<Array>}
 */
export async function getAllProducts() {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const products = [];
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to load products. Please try again.');
  }
}

/**
 * Get product by ID
 * @param {string} productId
 * @returns {Promise<Object>}
 */
export async function getProductById(productId) {
  try {
    const productRef = doc(db, COLLECTION_NAME, productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      return {
        id: productSnap.id,
        ...productSnap.data()
      };
    } else {
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to load product. Please try again.');
  }
}

/**
 * Create new product
 * @param {Object} productData
 * @returns {Promise<string>} Product ID
 */
export async function createProduct(productData) {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const newProduct = {
      ...productData,
      stock: parseInt(productData.stock) || 0,
      price: parseFloat(productData.price),
      discountedPrice: productData.discountedPrice
        ? parseFloat(productData.discountedPrice)
        : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(productsRef, newProduct);
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product. Please try again.');
  }
}

/**
 * Update existing product
 * @param {string} productId
 * @param {Object} updates
 * @returns {Promise<void>}
 */
export async function updateProduct(productId, updates) {
  try {
    const productRef = doc(db, COLLECTION_NAME, productId);
    const updatedData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Parse numeric fields
    if (updates.stock !== undefined) {
      updatedData.stock = parseInt(updates.stock) || 0;
    }
    if (updates.price !== undefined) {
      updatedData.price = parseFloat(updates.price);
    }
    if (updates.discountedPrice !== undefined) {
      updatedData.discountedPrice = updates.discountedPrice
        ? parseFloat(updates.discountedPrice)
        : null;
    }

    await updateDoc(productRef, updatedData);
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product. Please try again.');
  }
}

/**
 * Delete product
 * @param {string} productId
 * @returns {Promise<void>}
 */
export async function deleteProduct(productId) {
  try {
    const productRef = doc(db, COLLECTION_NAME, productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product. Please try again.');
  }
}

/**
 * Decrease product stock (for order placement)
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<void>}
 */
export async function decreaseStock(productId, quantity) {
  try {
    const productRef = doc(db, COLLECTION_NAME, productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      throw new Error('Product not found');
    }

    const currentStock = productSnap.data().stock || 0;
    const newStock = Math.max(0, currentStock - quantity);

    await updateDoc(productRef, {
      stock: newStock,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error decreasing stock:', error);
    throw new Error('Failed to update stock. Please try again.');
  }
}

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  decreaseStock
};
