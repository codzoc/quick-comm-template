import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Alert,
    FormControlLabel,
    Switch,
    TextField,
    Button
} from '@mui/material';
import { Save, CreditCard } from 'lucide-react';
import { getPaymentSettings, updatePaymentSettings } from '../../services/payment';
import LoadingSpinner from '../../components/LoadingSpinner';

function PaymentSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [settings, setSettings] = useState({
        cod: { enabled: true, label: '', description: '' },
        stripe: { enabled: false, publishableKey: '', secretKey: '' }
    });

    useEffect(() => {
        loadSettings();
    }, []);

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

    // Check if COD is the only enabled gateway
    const isCODOnlyOption = !settings.stripe?.enabled; // Add other gateways here in future

    if (loading) {
        return <LoadingSpinner size="large" message="Loading payment settings..." />;
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Payment Gateways
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure payment methods available to customers at checkout.
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
                                    disabled={isCODOnlyOption} // Disable if it's the only option
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body1">
                                        {settings.cod?.enabled ? "Enabled" : "Disabled"}
                                    </Typography>
                                    {isCODOnlyOption && (
                                        <Typography variant="caption" color="text.secondary">
                                            Cannot disable because no other payment method is enabled.
                                        </Typography>
                                    )}
                                </Box>
                            }
                            sx={{ mb: 2, alignItems: 'flex-start' }}
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
        </Box>
    );
}

export default PaymentSettings;
