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
    Button,
    Divider
} from '@mui/material';
import { Save, CreditCard, Mail } from 'lucide-react';
import { getPaymentSettings, updatePaymentSettings } from '../../services/payment';
import { getEmailSettings, updateEmailSettings } from '../../services/email';
import LoadingSpinner from '../../components/LoadingSpinner';

function PaymentSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [settings, setSettings] = useState({
        cod: { enabled: true, label: '', description: '' },
        stripe: { enabled: false, publishableKey: '', secretKey: '', webhookSecret: '' },
        razorpay: { enabled: false, keyId: '', keySecret: '', webhookSecret: '' }
    });
    const [emailSettings, setEmailSettings] = useState({
        smtp: { user: '', password: '' },
        storeName: ''
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const [paymentData, emailData] = await Promise.all([
                getPaymentSettings(),
                getEmailSettings()
            ]);
            setSettings(paymentData);
            setEmailSettings(emailData);
        } catch (err) {
            setError('Failed to load settings.');
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

    const handleEmailChange = (section, field, value) => {
        setEmailSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
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
            setSuccess('Settings saved successfully!');
        } catch (err) {
            setError('Failed to save settings.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // Check if at least one payment method is enabled
    const isAtLeastOneEnabled = settings.cod?.enabled || settings.stripe?.enabled || settings.razorpay?.enabled;

    if (loading) {
        return <LoadingSpinner size="large" message="Loading settings..." />;
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Payment & Email Settings
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure payment gateways and email notifications for your store.
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
                                    disabled={settings.cod?.enabled && !settings.stripe?.enabled && !settings.razorpay?.enabled}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body1">
                                        {settings.cod?.enabled ? "Enabled" : "Disabled"}
                                    </Typography>
                                    {settings.cod?.enabled && !settings.stripe?.enabled && !settings.razorpay?.enabled && (
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

                {/* Stripe */}
                <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CreditCard size={24} style={{ marginRight: '10px', color: '#635BFF' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Stripe
                            </Typography>
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.stripe?.enabled || false}
                                    onChange={(e) => handleChange('stripe', 'enabled', e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={settings.stripe?.enabled ? "Enabled" : "Disabled"}
                            sx={{ mb: 2 }}
                        />

                        {settings.stripe?.enabled && (
                            <Box sx={{ mt: 2, pl: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Publishable Key"
                                    value={settings.stripe?.publishableKey || ''}
                                    onChange={(e) => handleChange('stripe', 'publishableKey', e.target.value)}
                                    margin="normal"
                                    helperText="Starts with pk_test_ or pk_live_"
                                    placeholder="pk_test_..."
                                />
                                <TextField
                                    fullWidth
                                    label="Secret Key"
                                    value={settings.stripe?.secretKey || ''}
                                    onChange={(e) => handleChange('stripe', 'secretKey', e.target.value)}
                                    margin="normal"
                                    type="password"
                                    helperText="Starts with sk_test_ or sk_live_ (stored securely)"
                                    placeholder="sk_test_..."
                                />
                                <TextField
                                    fullWidth
                                    label="Webhook Secret"
                                    value={settings.stripe?.webhookSecret || ''}
                                    onChange={(e) => handleChange('stripe', 'webhookSecret', e.target.value)}
                                    margin="normal"
                                    type="password"
                                    helperText="Webhook signing secret from Stripe Dashboard"
                                    placeholder="whsec_..."
                                />
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    After deploying functions, add webhook URL in Stripe Dashboard:<br />
                                    <code>https://&lt;region&gt;-&lt;project-id&gt;.cloudfunctions.net/stripeWebhook</code>
                                </Alert>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Razorpay */}
                <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CreditCard size={24} style={{ marginRight: '10px', color: '#3395FF' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Razorpay
                            </Typography>
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.razorpay?.enabled || false}
                                    onChange={(e) => handleChange('razorpay', 'enabled', e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={settings.razorpay?.enabled ? "Enabled" : "Disabled"}
                            sx={{ mb: 2 }}
                        />

                        {settings.razorpay?.enabled && (
                            <Box sx={{ mt: 2, pl: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Key ID"
                                    value={settings.razorpay?.keyId || ''}
                                    onChange={(e) => handleChange('razorpay', 'keyId', e.target.value)}
                                    margin="normal"
                                    helperText="Starts with rzp_test_ or rzp_live_"
                                    placeholder="rzp_test_..."
                                />
                                <TextField
                                    fullWidth
                                    label="Key Secret"
                                    value={settings.razorpay?.keySecret || ''}
                                    onChange={(e) => handleChange('razorpay', 'keySecret', e.target.value)}
                                    margin="normal"
                                    type="password"
                                    helperText="Your Razorpay key secret (stored securely)"
                                />
                                <TextField
                                    fullWidth
                                    label="Webhook Secret"
                                    value={settings.razorpay?.webhookSecret || ''}
                                    onChange={(e) => handleChange('razorpay', 'webhookSecret', e.target.value)}
                                    margin="normal"
                                    type="password"
                                    helperText="Webhook secret from Razorpay Dashboard"
                                />
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    After deploying functions, add webhook URL in Razorpay Dashboard:<br />
                                    <code>https://&lt;region&gt;-&lt;project-id&gt;.cloudfunctions.net/razorpayWebhook</code>
                                </Alert>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {!isAtLeastOneEnabled && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        At least one payment method must be enabled.
                    </Alert>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Save size={20} />}
                    disabled={saving || !isAtLeastOneEnabled}
                    sx={{ mt: 2 }}
                >
                    {saving ? 'Saving...' : 'Save All Settings'}
                </Button>
            </form>
        </Box>
    );
}

export default PaymentSettings;
