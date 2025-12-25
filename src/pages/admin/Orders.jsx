import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { Eye, Edit, MessageCircle, X } from 'lucide-react';
import { onAuthChange } from '../../services/auth';
import { getAllOrders, updateOrderStatus, refundOrder } from '../../services/orders';
import { getStoreInfo } from '../../services/storeInfo';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import './AdminStyles.css';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialog, setStatusDialog] = useState({ open: false, order: null, newStatus: '' });
  const [whatsappDialog, setWhatsappDialog] = useState({ open: false, order: null, message: '' });
  const [refundLoading, setRefundLoading] = useState(false); // New state for refund
  const [storeInfo, setStoreInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) navigate('/admin');
      else loadOrders();
    });
    return () => unsubscribe();
  }, [navigate, filter]);

  const loadOrders = async () => {
    try {
      const [ordersData, storeData] = await Promise.all([
        getAllOrders(filter || null),
        getStoreInfo()
      ]);
      setOrders(ordersData);
      setStoreInfo(storeData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      paid: 'info', // 'paid' uses info color (blue)
      completed: 'success',
      cancelled: 'error',
      refunded: 'default' // 'refunded' uses default (grey)
    };
    return colors[status] || 'default';
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleStatusChangeRequest = (order) => {
    setStatusDialog({
      open: true,
      order: order,
      newStatus: order.status
    });
  };

  const handleStatusDialogClose = () => {
    setStatusDialog({ open: false, order: null, newStatus: '' });
  };

  const confirmStatusChange = async () => {
    if (!statusDialog.order || statusDialog.newStatus === statusDialog.order.status) {
      handleStatusDialogClose();
      return;
    }

    try {
      await updateOrderStatus(statusDialog.order.id, statusDialog.newStatus);
      await loadOrders();

      // Ask if user wants to send WhatsApp notification
      if (storeInfo?.whatsapp && statusDialog.order.customer.phone) {
        prepareWhatsAppMessage(statusDialog.order, statusDialog.newStatus);
      }

      handleStatusDialogClose();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRefund = async (order) => {
    if (!window.confirm(`Are you sure you want to refund this order (ID: ${order.orderId})? This action cannot be undone.`)) {
      return;
    }

    setRefundLoading(true);
    try {
      const result = await refundOrder(order.id);
      if (result.success) {
        alert('Refund processed successfully!');
        await loadOrders();
        // Close details if open
        if (selectedOrder?.id === order.id) {
          setSelectedOrder(null);
        }
      }
    } catch (error) {
      alert(`Refund failed: ${error.message}`);
    } finally {
      setRefundLoading(false);
    }
  };

  const prepareWhatsAppMessage = (order, newStatus) => {
    const statusMessages = {
      pending: 'Your order is pending confirmation',
      processing: 'Your order is being processed and will be delivered soon',
      paid: 'Payment received! Your order is being processed',
      completed: 'Your order has been completed and delivered',
      cancelled: 'Your order has been cancelled',
      refunded: 'Your order has been refunded'
    };

    const currencySymbol = storeInfo?.currencySymbol || '₹';
    const itemsList = order.items.map(item =>
      `${item.quantity}x ${item.title} - ${currencySymbol}${item.subtotal?.toFixed(2) || item.subtotal}`
    ).join('\n');

    // Build breakdown if available
    let breakdownText = '';
    if (order.subtotal !== undefined) {
      breakdownText = `\n*Order Breakdown:*\nSubtotal: ${currencySymbol}${order.subtotal.toFixed(2)}`;
      if (order.tax > 0) {
        breakdownText += `\nTax: ${currencySymbol}${order.tax.toFixed(2)}`;
      }
      if (order.shipping > 0) {
        breakdownText += `\nShipping: ${currencySymbol}${order.shipping.toFixed(2)}`;
      }
      breakdownText += '\n';
    }

    const message = `Hello ${order.customer.name},

Your order status has been updated!

*Order ID:* ${order.orderId}
*Status:* ${statusMessages[newStatus]}

*Order Items:*
${itemsList}
${breakdownText}
*Total Amount:* ${currencySymbol}${order.total?.toFixed(2) || order.total}

${order.customer.address ? `*Delivery Address:*\n${order.customer.address}, ${order.customer.pin}` : ''}

Thank you for shopping with us!
- ${storeInfo.storeName || 'Quick Commerce'}`;

    setWhatsappDialog({
      open: true,
      order: order,
      message: message
    });
  };

  const sendWhatsAppMessage = () => {
    if (!whatsappDialog.order) return;

    const phone = whatsappDialog.order.customer.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappDialog.message)}`;
    window.open(url, '_blank');
    setWhatsappDialog({ open: false, order: null, message: '' });
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="large" message="Loading orders..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Manage Orders
          </Typography>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filter}
              label="Filter by Status"
              onChange={(e) => setFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="">All Orders</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && <ErrorMessage message={error} onRetry={loadOrders} />}

        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'var(--color-surface)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {order.orderId}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.customer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.customer.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {storeInfo?.currencySymbol || '₹'}{order.total?.toFixed(2) || '0.00'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                      sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {order.createdAt?.toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewDetails(order)}
                        title="View Details"
                      >
                        <Eye size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleStatusChangeRequest(order)}
                        title="Update Status"
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* View Details Dialog */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box component="span" sx={{ typography: 'h6', fontWeight: 600 }}>
            Order Details
          </Box>
          <IconButton size="small" onClick={() => setSelectedOrder(null)}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              {/* Order Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Order Information
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Order ID:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                      {selectedOrder.orderId}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Date:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {selectedOrder.createdAt?.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Status:</strong>
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={selectedOrder.status}
                        color={getStatusColor(selectedOrder.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Total Amount:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {storeInfo?.currencySymbol || '₹'}{selectedOrder.total?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Customer Details */}
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Customer Details
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Name:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {selectedOrder.customer.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Phone:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {selectedOrder.customer.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Delivery Address:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {selectedOrder.customer.address}
                      <br />
                      PIN: {selectedOrder.customer.pin}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Payment Details */}
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Payment Information
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Method:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, textTransform: 'capitalize' }}>
                      {selectedOrder.paymentGateway === 'cod' ? 'Cash on Delivery' : selectedOrder.paymentGateway}
                    </Typography>
                  </Grid>
                  {selectedOrder.paymentDetails?.transactionId && (
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Transaction ID:</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                        {selectedOrder.paymentDetails.transactionId}
                      </Typography>
                    </Grid>
                  )}
                  {selectedOrder.transactionId && !selectedOrder.paymentDetails?.transactionId && (
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Transaction ID:</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                        {selectedOrder.transactionId}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Payment Status:</strong>
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={selectedOrder.paymentStatus || 'pending'}
                        size="small"
                        color={selectedOrder.paymentStatus === 'paid' || selectedOrder.paymentStatus === 'completed' ? 'success' : selectedOrder.paymentStatus === 'refunded' ? 'default' : 'warning'}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Order Items */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Order Items
                </Typography>
                <TableContainer sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: 'var(--color-surface)' }}>
                      <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box
                              component="img"
                              src={item.imagePath || '/images/placeholder.png'}
                              alt={item.title}
                              sx={{
                                width: 50,
                                height: 50,
                                objectFit: 'cover',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.title}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {item.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {storeInfo?.currencySymbol || '₹'}{item.price?.toFixed(2) || '0.00'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {storeInfo?.currencySymbol || '₹'}{item.subtotal?.toFixed(2) || '0.00'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Breakdown Section */}
                      {selectedOrder.subtotal !== undefined && (
                        <>
                          <TableRow>
                            <TableCell colSpan={4} align="right">
                              <Typography variant="body2">
                                Subtotal:
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {storeInfo?.currencySymbol || '₹'}{selectedOrder.subtotal?.toFixed(2) || '0.00'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          {selectedOrder.tax > 0 && (
                            <TableRow>
                              <TableCell colSpan={4} align="right">
                                <Typography variant="body2">
                                  Tax:
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {storeInfo?.currencySymbol || '₹'}{selectedOrder.tax?.toFixed(2) || '0.00'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                          {selectedOrder.shipping > 0 && (
                            <TableRow>
                              <TableCell colSpan={4} align="right">
                                <Typography variant="body2">
                                  Shipping:
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {storeInfo?.currencySymbol || '₹'}{selectedOrder.shipping?.toFixed(2) || '0.00'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      )}
                      <TableRow>
                        <TableCell colSpan={4} align="right">
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Total:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {storeInfo?.currencySymbol || '₹'}{selectedOrder.total?.toFixed(2) || '0.00'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedOrder && (selectedOrder.status === 'paid' || selectedOrder.status === 'completed' || selectedOrder.paymentStatus === 'paid') && selectedOrder.status !== 'refunded' && selectedOrder.paymentGateway !== 'cod' && (
            <Button
              onClick={() => handleRefund(selectedOrder)}
              color="error"
              variant="outlined"
              disabled={refundLoading}
            >
              {refundLoading ? 'Processing...' : 'Refund Order'}
            </Button>
          )}
          {selectedOrder && (selectedOrder.paymentGateway === 'cod') && selectedOrder.status === 'completed' && (
            <Button
              onClick={() => handleRefund(selectedOrder)}
              color="error"
              variant="outlined"
              disabled={refundLoading}
            >
              Mark Refunded
            </Button>
          )}
          <Button onClick={() => setSelectedOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={statusDialog.open}
        onClose={handleStatusDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          {statusDialog.order && (
            <Box sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Update status for order <strong>{statusDialog.order.orderId}</strong>
              </Alert>
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={statusDialog.newStatus}
                  label="New Status"
                  onChange={(e) => setStatusDialog({ ...statusDialog, newStatus: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusDialogClose}>Cancel</Button>
          <Button
            onClick={confirmStatusChange}
            variant="contained"
            disabled={!statusDialog.newStatus || statusDialog.newStatus === statusDialog.order?.status}
          >
            Confirm Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* WhatsApp Message Dialog */}
      <Dialog
        open={whatsappDialog.open}
        onClose={() => setWhatsappDialog({ open: false, order: null, message: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MessageCircle size={24} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Send WhatsApp Notification
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Order status updated successfully!
            </Alert>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Edit the message below before sending to the customer:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={whatsappDialog.message}
              onChange={(e) => setWhatsappDialog({ ...whatsappDialog, message: e.target.value })}
              sx={{ mt: 2 }}
              placeholder="Enter your message..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWhatsappDialog({ open: false, order: null, message: '' })}>
            Skip
          </Button>
          <Button
            onClick={sendWhatsAppMessage}
            variant="contained"
            startIcon={<MessageCircle size={18} />}
            disabled={!whatsappDialog.message.trim()}
          >
            Send WhatsApp Message
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default AdminOrders;
