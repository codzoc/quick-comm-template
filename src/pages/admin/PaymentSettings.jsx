import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Alert,
    FormControlLabel,
    Switch,
    TextField,
    Button,
    Divider
} from '@mui/material';
import { Save, CreditCard } from 'lucide-react';
import { onAuthChange } from '../../services/auth';
import { getPaymentSettings, updatePaymentSettings } from '../../services/payment';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import './AdminStyles.css';

function PaymentSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [settings, setSettings] = useState({
        cod: { enabled: true, label: '', description: '' },
        stripe: { enabled: false, publishableKey: '', secretKey: '' }
    });
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            if (!user) navigate('/admin');
            else loadSettings();
        });
        return () => unsubscribe();
    }, [navigate]);

    const loadSettings = async () => {
        try {
            const data = await getPaymentSettings();
            setSettings(data);
        } catch (err) {
            setError('Failed to load payment settings.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (gateway, field, value) => {
        setSettings(prev => ({
            ...prev,
            [gateway]: {
                ...prev[gateway],
                [field]: value
            }
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await updatePaymentSettings(settings);
            setSuccess('Payment settings saved successfully!');
        } catch (err) {
            setError('Failed to save settings.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <LoadingSpinner size="large" message="Loading payment settings..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Payment Settings
            </Typography>

            {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

            <form onSubmit={handleSave}>
                {/* Cash on Delivery */}
                <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CreditCard size={24} style={{ marginRight: '10px', color: '#10B981' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Cash on Delivery (COD)
                            </Typography>
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.cod?.enabled || false}
                                    onChange={(e) => handleChange('cod', 'enabled', e.target.checked)}
                                    color="success"
                                />
                            }
                            label={settings.cod?.enabled ? "Enabled" : "Disabled"}
                            sx={{ mb: 2 }}
                        />

                        {settings.cod?.enabled && (
                            <Box sx={{ mt: 2, pl: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Display Label"
                                    value={settings.cod?.label || ''}
                                    onChange={(e) => handleChange('cod', 'label', e.target.value)}
                                    margin="normal"
                                    helperText="What the customer sees at checkout (e.g., 'Cash on Delivery')"
                                />
                                <TextField
                                    fullWidth
                                    label="Description"
                                    value={settings.cod?.description || ''}
                                    onChange={(e) => handleChange('cod', 'description', e.target.value)}
                                    margin="normal"
                                    multiline
                                    rows={2}
                                    helperText="Short description shown to the customer"
                                />
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Future Gateways (Placeholder) */}
                <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', opacity: 0.7 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CreditCard size={24} style={{ marginRight: '10px', color: '#6366F1' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Stripe / Online Payment (Coming Soon)
                            </Typography>
                        </Box>
                        <Alert severity="info">
                            Online payment integration is currently in development.
                        </Alert>
                    </CardContent>
                </Card>

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Save size={20} />}
                    disabled={saving}
                    sx={{ mt: 2 }}
                >
                    {saving ? 'Saving...' : 'Save Payment Settings'}
                </Button>
            </form>
        </AdminLayout>
    );
}

export default PaymentSettings;
