import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from '@mui/material';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { getAllAdmins, getAllUsers, promoteToAdmin, revokeAdmin } from '../../services/adminAccounts';
import { onAuthChange } from '../../services/auth';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import './AdminStyles.css';

function Admins() {
    const [admins, setAdmins] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            if (!user) {
                navigate('/admin');
            } else {
                loadData();
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [adminsData, usersData] = await Promise.all([
                getAllAdmins(),
                getAllUsers()
            ]);
            setAdmins(adminsData);
            setAllUsers(usersData);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePromoteToAdmin = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        try {
            await promoteToAdmin(newAdminEmail);
            await loadData();
            setShowPromoteModal(false);
            setNewAdminEmail('');
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleRevokeAdmin = async (email) => {
        if (!window.confirm(`Are you sure you want to revoke admin privileges for ${email}?`)) {
            return;
        }

        setProcessing(true);
        setError('');

        try {
            await revokeAdmin(email);
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const filteredAdmins = admins.filter(admin =>
        admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <AdminLayout>
                <LoadingSpinner size="large" message="Loading admin accounts..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            Admin Accounts
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage administrator access and permissions
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => setShowPromoteModal(true)}
                    >
                        Add Admin
                    </Button>
                </Box>

                {error && <ErrorMessage message={error} onRetry={loadData} />}

                <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Search size={20} color="var(--color-text-light)" />
                            <TextField
                                fullWidth
                                placeholder="Search by email..."
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
                                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAdmins.map((admin) => (
                                <TableRow key={admin.id} hover>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>
                                        {admin.createdAt
                                            ? new Date(admin.createdAt).toLocaleDateString()
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<Trash2 size={16} />}
                                            onClick={() => handleRevokeAdmin(admin.email)}
                                            disabled={processing}
                                        >
                                            Revoke
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredAdmins.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            {searchQuery ? 'No admins found matching your search.' : 'No admin accounts found.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Promote to Admin Modal */}
                <Dialog
                    open={showPromoteModal}
                    onClose={() => setShowPromoteModal(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>Add Admin User</Typography>
                        <IconButton size="small" onClick={() => setShowPromoteModal(false)}>
                            <X size={20} />
                        </IconButton>
                    </DialogTitle>
                    <form onSubmit={handlePromoteToAdmin}>
                        <DialogContent dividers>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={newAdminEmail}
                                onChange={(e) => setNewAdminEmail(e.target.value)}
                                required
                                placeholder="Enter admin email"
                                helperText="Add a new admin user by email address"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setShowPromoteModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={processing}
                            >
                                {processing ? 'Adding...' : 'Add Admin'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Box>
        </AdminLayout>
    );
}

export default Admins;
