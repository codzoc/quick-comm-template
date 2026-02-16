import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip
} from '@mui/material';
import { Search, X, Eye } from 'lucide-react';
import { getAllCustomers } from '../../services/adminAccounts';
import { getCustomerOrders } from '../../services/orders';
import { onAuthChange } from '../../services/auth';
import { getStoreInfo } from '../../services/storeInfo';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import './AdminStyles.css';

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [storeInfo, setStoreInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            if (!user) {
                navigate('/admin');
            } else {
                loadCustomers();
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const [customersData, storeData] = await Promise.all([
                getAllCustomers(),
                getStoreInfo()
            ]);
            setCustomers(customersData);
            setStoreInfo(storeData);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadCustomerOrders = async (customerId) => {
        try {
            setLoadingOrders(true);
            const orders = await getCustomerOrders(customerId);
            setCustomerOrders(orders);
        } catch (err) {
            console.error('Error loading customer orders:', err);
            setCustomerOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleViewOrders = async (customer) => {
        setSelectedCustomer(customer);
        await loadCustomerOrders(customer.id);
    };

    const closeOrdersModal = () => {
        setSelectedCustomer(null);
        setCustomerOrders([]);
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery)
    );

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'success';
            case 'processing': return 'info';
            case 'shipped': return 'primary';
            case 'cancelled': return 'error';
            default: return 'warning';
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <LoadingSpinner size="large" message="Loading customers..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Box>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Customer Accounts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        View and manage customer accounts
                    </Typography>
                </Box>

                {error && <ErrorMessage message={error} onRetry={loadCustomers} />}

                <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Search size={20} color="var(--color-text-light)" />
                            <TextField
                                fullWidth
                                placeholder="Search by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                variant="standard"
                                InputProps={{ disableUnderline: true }}
                            />
                        </Box>
                    </CardContent>
                </Card>

                <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: 'var(--color-surface)' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Registered</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} hover>
                                    <TableCell sx={{ fontWeight: 500 }}>{customer.name}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell>
                                        {customer.createdAt
                                            ? new Date(customer.createdAt).toLocaleDateString()
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<Eye size={16} />}
                                            onClick={() => handleViewOrders(customer)}
                                        >
                                            View Orders
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            {searchQuery ? 'No customers found matching your search.' : 'No customer accounts found.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Customer Orders Modal */}
                <Dialog
                    open={!!selectedCustomer}
                    onClose={closeOrdersModal}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
                                Orders for {selectedCustomer?.name}
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary">
                                {selectedCustomer?.email}
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={closeOrdersModal}>
                            <X size={20} />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        {loadingOrders ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <LoadingSpinner size="medium" message="Loading orders..." />
                            </Box>
                        ) : customerOrders.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">
                                    No orders found for this customer.
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead sx={{ backgroundColor: 'var(--color-background)' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {customerOrders.map((order) => (
                                            <TableRow key={order.id} hover>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>
                                                    {order.orderId}
                                                </TableCell>
                                                <TableCell>
                                                    {order.createdAt
                                                        ? new Date(order.createdAt).toLocaleDateString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>{order.items?.length || 0}</TableCell>
                                                <TableCell>{storeInfo?.currencySymbol || '₹'}{order.total?.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={order.status}
                                                        color={getStatusColor(order.status)}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontWeight: 500, textTransform: 'capitalize' }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeOrdersModal}>Close</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </AdminLayout>
    );
}

export default Customers;
