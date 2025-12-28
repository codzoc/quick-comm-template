import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import { generateOrderId } from '../utils/orderIdGenerator';
import { decreaseStock } from './products';

const COLLECTION_NAME = 'orders';

/**
 * Orders Service
 * Handles all order-related database operations
 */

/**
 * Create new order
 * @param {Object} orderData - {items, customer: {name, phone, address, pin}, total, subtotal, tax, shipping, customerId (optional)}
 * @returns {Promise<Object>} Order with ID
 */
export async function createOrder(orderData) {
  try {
    // Check if email is provided and find matching customer (outside transaction)
    let linkedCustomerId = orderData.customerId || null;
    if (!linkedCustomerId && orderData.customer.email) {
      const customersRef = collection(db, 'customers');
      const emailQuery = query(customersRef, where('email', '==', orderData.customer.email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        linkedCustomerId = emailSnapshot.docs[0].id;
      }
    }

    // Run as transaction to ensure stock is updated atomically with order creation
    const result = await runTransaction(db, async (transaction) => {
      // Read all product data first and validate stock availability
      const productData = new Map();

      for (const item of orderData.items) {
        const productRef = doc(db, 'products', item.product.id);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`Product ${item.product.title} not found`);
        }

        const currentStock = productSnap.data().stock || 0;
        if (currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.product.title}. Only ${currentStock} available.`
          );
        }

        // Store product data for later use
        productData.set(item.product.id, {
          ref: productRef,
          currentStock: currentStock
        });
      }

      // Create order document reference (generate ID)
      const ordersRef = collection(db, COLLECTION_NAME);
      const orderRef = doc(ordersRef);
      
      const newOrder = {
        orderId: generateOrderId(),
        items: orderData.items.map((item) => {
          // Support both new format (images array) and legacy (imagePath)
          const productImage = (item.product.images && item.product.images.length > 0) 
            ? item.product.images[0] 
            : (item.product.imagePath || '/images/placeholder.png');
          return {
            productId: item.product.id,
            title: item.product.title,
            price: item.product.discountedPrice || item.product.price,
            quantity: item.quantity,
            imagePath: productImage, // Store first image for backward compatibility
            images: item.product.images || (item.product.imagePath ? [item.product.imagePath] : []),
            subtotal:
              (item.product.discountedPrice || item.product.price) * item.quantity
          };
        }),
        customer: orderData.customer,
        customerId: linkedCustomerId, // Link to customer account if found
        status: 'pending',
        subtotal: orderData.subtotal || 0,
        tax: orderData.tax || 0,
        shipping: orderData.shipping || 0,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod || 'cod',
        paymentStatus: orderData.paymentStatus || 'pending',
        paymentGateway: orderData.paymentGateway || orderData.paymentMethod || 'cod',
        transactionId: orderData.transactionId || null,
        paymentDetails: orderData.paymentDetails || {},
        createdAt: serverTimestamp()
      };

      // Create order document in transaction
      transaction.set(orderRef, newOrder);

      // Decrease stock for each product using previously read data
      for (const item of orderData.items) {
        const { ref: productRef, currentStock } = productData.get(item.product.id);
        const newStock = Math.max(0, currentStock - item.quantity);

        transaction.update(productRef, {
          stock: newStock,
          updatedAt: serverTimestamp()
        });
      }

      return { id: orderRef.id, ...newOrder };
    });

    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error(error.message || 'Failed to place order. Please try again.');
  }
}

/**
 * Get all orders
 * @param {string} statusFilter - Optional status filter
 * @returns {Promise<Array>}
 */
export async function getAllOrders(statusFilter = null) {
  try {
    const ordersRef = collection(db, COLLECTION_NAME);
    let q;

    if (statusFilter) {
      q = query(
        ordersRef,
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(ordersRef, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);

    const orders = [];
    snapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to Date
        createdAt: doc.data().createdAt?.toDate()
      });
    });

    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to load orders. Please try again.');
  }
}

/**
 * Get order by ID
 * @param {string} orderId
 * @returns {Promise<Object>}
 */
export async function getOrderById(orderId) {
  try {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      return {
        id: orderSnap.id,
        ...orderSnap.data(),
        createdAt: orderSnap.data().createdAt?.toDate()
      };
    } else {
      throw new Error('Order not found');
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    throw new Error('Failed to load order. Please try again.');
  }
}

export async function updateOrderStatus(orderId, newStatus) {
  const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'paid', 'refunded']; // Added paid & refunded

  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid order status');
  }

  try {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status. Please try again.');
  }
}

/**
 * Refund Order (Calls Cloud Function)
 * @param {string} orderId
 * @returns {Promise<Object>}
 */
export async function refundOrder(orderId) {
  try {
    const refundFn = httpsCallable(functions, 'refundOrder');
    const result = await refundFn({ orderId });
    return result.data;
  } catch (error) {
    console.error('Error refunding order:', error);
    throw new Error(error.message || 'Refund failed');
  }
}

/**
 * Get order statistics
 * @returns {Promise<Object>} Stats object
 */
export async function getOrderStats() {
  try {
    const ordersRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(ordersRef);

    let totalOrders = 0;
    let pendingOrders = 0;
    let paidOrders = 0;
    let processingOrders = 0;
    let completedOrders = 0;
    let refundedOrders = 0;
    let cancelledOrders = 0;
    let totalRevenue = 0;
    let onlineRevenue = 0;
    let codRevenue = 0;

    snapshot.forEach((doc) => {
      const order = doc.data();
      totalOrders++;

      switch (order.status) {
        case 'pending':
          pendingOrders++;
          break;
        case 'paid':
          paidOrders++;
          break;
        case 'processing':
          processingOrders++;
          break;
        case 'completed':
          completedOrders++;
          break;
        case 'refunded':
          refundedOrders++;
          break;
        case 'cancelled':
          cancelledOrders++;
          break;
      }

      // Calculate revenue (exclude cancelled and refunded)
      if (order.status !== 'cancelled' && order.status !== 'refunded') {
        const amount = order.total || 0;
        totalRevenue += amount;

        if (order.paymentGateway === 'cod') {
          codRevenue += amount;
        } else {
          onlineRevenue += amount;
        }
      }
    });

    return {
      totalOrders,
      pendingOrders,
      paidOrders,
      processingOrders,
      completedOrders,
      refundedOrders,
      cancelledOrders,
      totalRevenue,
      onlineRevenue,
      codRevenue
    };
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      paidOrders: 0,
      processingOrders: 0,
      completedOrders: 0,
      refundedOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      onlineRevenue: 0,
      codRevenue: 0
    };
  }
}

/**
 * Get orders for a specific customer
 * @param {string} customerId
 * @returns {Promise<Array>}
 */
export async function getCustomerOrders(customerId) {
  try {
    const ordersRef = collection(db, COLLECTION_NAME);
    const q = query(
      ordersRef,
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const orders = [];

    snapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      });
    });

    return orders;
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    throw new Error('Failed to load your orders. Please try again.');
  }
}

export default {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  getCustomerOrders
};
