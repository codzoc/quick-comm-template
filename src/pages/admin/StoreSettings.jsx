import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import { Save, Upload, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { onAuthChange } from '../../services/auth';
import { getStoreInfo, updateStoreInfo, getAllStaticPages, updateStaticPage } from '../../services/storeInfo';
import { getEmailSettings, updateEmailSettings } from '../../services/email';
import { getCurrentTemplate, updateThemeTemplate } from '../../services/theme';
import { getThemeTemplateOptions } from '../../config/themeTemplates';
import { uploadLogoImage, uploadStaticPageImage } from '../../services/imageUpload';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ThemeCustomizer from '../../components/ThemeCustomizer';
import PaymentSettings from './PaymentSettings';
import './AdminStyles.css';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function AdminStoreSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  // Initialize tab from URL params, default to 0
  const initialTab = parseInt(searchParams.get('tab') || '0', 10);
  const [tabValue, setTabValue] = useState(initialTab);

  const [storeInfo, setStoreInfo] = useState({
    storeName: '',
    logoUrl: '/images/logo.png',
    storeIcon: '',
    phone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    youtube: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    currencySymbol: '₹',
    taxPercentage: 0,
    shippingCost: 0,
    productsHeading: 'Our Products'
  });

  const [emailSettings, setEmailSettings] = useState({
    smtp: { user: '', password: '' }
    // Note: storeName is stored in storeInfo/contact, not in email settings
  });

  const [staticPages, setStaticPages] = useState({
    about: { content: '', imagePath: '' },
    terms: { content: '', imagePath: '' },
    privacy: { content: '', imagePath: '' }
  });

  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingPageImage, setUploadingPageImage] = useState({});
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
      const [info, pages, currentTemplate, emailData] = await Promise.all([
        getStoreInfo(),
        getAllStaticPages(),
        getCurrentTemplate(),
        getEmailSettings()
      ]);
      setStoreInfo(info);
      setStaticPages(pages);
      setSelectedTemplate(currentTemplate);
      if (emailData) {
        setEmailSettings(prev => ({ ...prev, ...emailData }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchParams({ tab: newValue.toString() });
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  // General Tab Handlers
  const handleSaveStoreInfo = async (e) => {
    e.preventDefault();
    try {
      await Promise.all([
        updateStoreInfo(storeInfo),
        updateEmailSettings(emailSettings)
      ]);
      showSuccess('Store information and email settings saved successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStoreInfoChange = (field, value) => {
    setStoreInfo({ ...storeInfo, [field]: value });
  };

  const handleLogoUpload = async (e, type = 'logo') => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (type === 'logo') {
        setUploadingLogo(true);
      } else {
        setUploadingIcon(true);
      }

      const url = await uploadLogoImage(file, type);
      handleStoreInfoChange(type === 'logo' ? 'logoUrl' : 'storeIcon', url);
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else {
        setUploadingIcon(false);
      }
      e.target.value = ''; // Reset input
    }
  };

  const handleStaticPageImageUpload = async (e, pageType) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingPageImage({ ...uploadingPageImage, [pageType]: true });
      const url = await uploadStaticPageImage(file, pageType);
      handlePageContentChange(pageType, 'imagePath', url);
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploadingPageImage({ ...uploadingPageImage, [pageType]: false });
      e.target.value = ''; // Reset input
    }
  };

  // Appearance Tab Handlers
  const handleSaveTheme = async () => {
    try {
      await updateThemeTemplate(selectedTemplate);
      showSuccess('Theme template saved! Refreshing page...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      alert(err.message);
    }
  };

  // Pages Tab Handlers
  const handleSaveStaticPage = async (pageType) => {
    try {
      await updateStaticPage(pageType, staticPages[pageType]);
      showSuccess(`${pageType.charAt(0).toUpperCase() + pageType.slice(1)} page saved successfully!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePageContentChange = (pageType, field, value) => {
    setStaticPages({
      ...staticPages,
      [pageType]: {
        ...staticPages[pageType],
        [field]: value
      }
    });
  };

  // SEO Tab Handlers
  const handleSaveSEO = async (e) => {
    e.preventDefault();
    try {
      await updateStoreInfo({
        seoTitle: storeInfo.seoTitle,
        seoDescription: storeInfo.seoDescription,
        seoKeywords: storeInfo.seoKeywords
      });
      showSuccess('SEO settings saved successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="large" message="Loading settings..." />
      </AdminLayout>
    );
  }

  const themeOptions = getThemeTemplateOptions();

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Store Settings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
            <Tab label="General" />
            <Tab label="Appearance" />
            <Tab label="Pages" />
            <Tab label="SEO" />
            <Tab label="Pricing" />
            <Tab label="Payment" />
          </Tabs>
        </Box>

        {/* Tab 1: General */}
        <TabPanel value={tabValue} index={0}>
          <CardContent>
            <form onSubmit={handleSaveStoreInfo}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Store Information
              </Typography>

              <TextField
                fullWidth
                label="Store Name"
                value={storeInfo.storeName || ''}
                onChange={(e) => handleStoreInfoChange('storeName', e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Products Section Title"
                value={storeInfo.productsHeading || 'Our Products'}
                onChange={(e) => handleStoreInfoChange('productsHeading', e.target.value)}
                margin="normal"
                helperText="Title displayed above the products grid on the home page"
                placeholder="Our Products"
              />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Logo Image
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Full logo image with store name. Max width: 512px, auto-compressed.
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'logo')}
                  style={{ display: 'none' }}
                  id="logo-upload"
                  disabled={uploadingLogo}
                />
                <label htmlFor="logo-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<Upload size={18} />}
                    disabled={uploadingLogo}
                    sx={{ mb: 1 }}
                  >
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                </label>
                {storeInfo.logoUrl && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      component="img"
                      src={storeInfo.logoUrl}
                      alt="Logo preview"
                      sx={{
                        maxHeight: 100,
                        maxWidth: 300,
                        objectFit: 'contain',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 1
                      }}
                      onError={(e) => {
                        e.target.src = '/images/placeholder.png';
                      }}
                    />
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      startIcon={<X size={16} />}
                      onClick={() => handleStoreInfoChange('logoUrl', '')}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Store Icon
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Square icon/logo for favicon and header. Max width: 512px, auto-compressed.
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'icon')}
                  style={{ display: 'none' }}
                  id="icon-upload"
                  disabled={uploadingIcon}
                />
                <label htmlFor="icon-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<Upload size={18} />}
                    disabled={uploadingIcon}
                    sx={{ mb: 1 }}
                  >
                    {uploadingIcon ? 'Uploading...' : 'Upload Icon'}
                  </Button>
                </label>
                {storeInfo.storeIcon && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      component="img"
                      src={storeInfo.storeIcon}
                      alt="Icon preview"
                      sx={{
                        width: 64,
                        height: 64,
                        objectFit: 'contain',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 1
                      }}
                      onError={(e) => {
                        e.target.src = '/images/placeholder.png';
                      }}
                    />
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      startIcon={<X size={16} />}
                      onClick={() => handleStoreInfoChange('storeIcon', '')}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Contact Information
              </Typography>

              <TextField
                fullWidth
                label="Phone Number"
                value={storeInfo.phone || ''}
                onChange={(e) => handleStoreInfoChange('phone', e.target.value)}
                margin="normal"
                placeholder="+91 1234567890"
              />

              <TextField
                fullWidth
                label="WhatsApp Number"
                value={storeInfo.whatsapp || ''}
                onChange={(e) => handleStoreInfoChange('whatsapp', e.target.value)}
                margin="normal"
                placeholder="+91 1234567890"
              />

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Social Media
              </Typography>

              <TextField
                fullWidth
                label="Facebook URL"
                value={storeInfo.facebook || ''}
                onChange={(e) => handleStoreInfoChange('facebook', e.target.value)}
                margin="normal"
                placeholder="https://facebook.com/yourpage"
              />

              <TextField
                fullWidth
                label="Instagram URL"
                value={storeInfo.instagram || ''}
                onChange={(e) => handleStoreInfoChange('instagram', e.target.value)}
                margin="normal"
                placeholder="https://instagram.com/yourprofile"
              />

              <TextField
                fullWidth
                label="YouTube URL"
                value={storeInfo.youtube || ''}
                onChange={(e) => handleStoreInfoChange('youtube', e.target.value)}
                margin="normal"
                placeholder="https://youtube.com/@yourchannel"
              />

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Email Configuration (Gmail SMTP)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure Gmail SMTP for sending order and payment confirmation emails.
              </Typography>

              <TextField
                fullWidth
                label="Gmail Address"
                value={emailSettings.smtp?.user || ''}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp: { ...prev.smtp, user: e.target.value } }))}
                margin="normal"
                type="email"
                placeholder="yourstore@gmail.com"
              />

              <TextField
                fullWidth
                label="Gmail App Password"
                value={emailSettings.smtp?.password || ''}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp: { ...prev.smtp, password: e.target.value } }))}
                margin="normal"
                type="password"
                helperText="Gmail app-specific password (not your regular password)"
              />

              <Alert severity="warning" sx={{ mt: 2 }}>
                <strong>Important:</strong> You must create an App Password in your Google Account settings.
                Regular Gmail passwords won't work. Visit: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">Google App Passwords</a>
              </Alert>

              <Button
                type="submit"
                variant="contained"
                startIcon={<Save size={18} />}
                sx={{ mt: 3 }}
              >
                Save All Settings
              </Button>
            </form>
          </CardContent>
        </TabPanel>

        {/* Tab 2: Appearance */}
        <TabPanel value={tabValue} index={1}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Theme Template
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose a pre-designed theme template for your store. Each template includes a complete design system with colors, spacing, shadows, and typography.
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Theme Template</InputLabel>
              <Select
                value={selectedTemplate}
                label="Select Theme Template"
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                {themeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {option.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {themeOptions.find(opt => opt.value === selectedTemplate) && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Selected: {themeOptions.find(opt => opt.value === selectedTemplate).label}</strong><br />
                  {themeOptions.find(opt => opt.value === selectedTemplate).description}
                </Typography>
              </Alert>
            )}

            {selectedTemplate !== 'custom' && (
              <Button
                variant="contained"
                startIcon={<Save size={18} />}
                onClick={handleSaveTheme}
              >
                Apply Theme Template
              </Button>
            )}

            {/* Show Theme Customizer for Custom theme */}
            {selectedTemplate === 'custom' && (
              <ThemeCustomizer
                onSave={() => {
                  showSuccess('Custom theme saved! Refreshing page...');
                  setTimeout(() => window.location.reload(), 1500);
                }}
              />
            )}
          </CardContent>
        </TabPanel>

        {/* Tab 3: Pages */}
        <TabPanel value={tabValue} index={2}>
          <CardContent>
            {/* About Page */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              About Page
            </Typography>

            <div style={{ marginBottom: '16px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                About Page Content
              </Typography>
              <ReactQuill
                theme="snow"
                value={staticPages.about?.content || ''}
                onChange={(value) => handlePageContentChange('about', 'content', value)}
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </div>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                About Page Image
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleStaticPageImageUpload(e, 'about')}
                style={{ display: 'none' }}
                id="about-image-upload"
                disabled={uploadingPageImage.about}
              />
              <label htmlFor="about-image-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<Upload size={18} />}
                  disabled={uploadingPageImage.about}
                  sx={{ mb: 1 }}
                >
                  {uploadingPageImage.about ? 'Uploading...' : 'Upload Image'}
                </Button>
              </label>
              {staticPages.about?.imagePath && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    component="img"
                    src={staticPages.about.imagePath}
                    alt="About page preview"
                    sx={{
                      maxHeight: 200,
                      maxWidth: 300,
                      objectFit: 'contain',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1
                    }}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.png';
                    }}
                  />
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    startIcon={<X size={16} />}
                    onClick={() => handlePageContentChange('about', 'imagePath', '')}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>

            <Button
              variant="contained"
              startIcon={<Save size={18} />}
              onClick={() => handleSaveStaticPage('about')}
              sx={{ mt: 2, mb: 4 }}
            >
              Save About Page
            </Button>

            <Divider sx={{ my: 3 }} />

            {/* Terms Page */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Terms & Conditions Page
            </Typography>

            <div style={{ marginBottom: '16px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Terms Content
              </Typography>
              <ReactQuill
                theme="snow"
                value={staticPages.terms?.content || ''}
                onChange={(value) => handlePageContentChange('terms', 'content', value)}
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </div>

            <Button
              variant="contained"
              startIcon={<Save size={18} />}
              onClick={() => handleSaveStaticPage('terms')}
              sx={{ mt: 2, mb: 4 }}
            >
              Save Terms Page
            </Button>

            <Divider sx={{ my: 3 }} />

            {/* Privacy Page */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Privacy Policy Page
            </Typography>

            <div style={{ marginBottom: '16px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Privacy Content
              </Typography>
              <ReactQuill
                theme="snow"
                value={staticPages.privacy?.content || ''}
                onChange={(value) => handlePageContentChange('privacy', 'content', value)}
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </div>

            <Button
              variant="contained"
              startIcon={<Save size={18} />}
              onClick={() => handleSaveStaticPage('privacy')}
              sx={{ mt: 2 }}
            >
              Save Privacy Page
            </Button>
          </CardContent>
        </TabPanel>

        {/* Tab 4: SEO */}
        <TabPanel value={tabValue} index={3}>
          <CardContent>
            <form onSubmit={handleSaveSEO}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                SEO Settings
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Optimize your store for search engines. These settings will appear in search results and social media shares.
              </Typography>

              <TextField
                fullWidth
                label="SEO Title"
                value={storeInfo.seoTitle || ''}
                onChange={(e) => handleStoreInfoChange('seoTitle', e.target.value)}
                margin="normal"
                helperText={`${(storeInfo.seoTitle || '').length}/60 characters (recommended: 50-60)`}
                inputProps={{ maxLength: 60 }}
              />

              <TextField
                fullWidth
                label="SEO Description"
                value={storeInfo.seoDescription || ''}
                onChange={(e) => handleStoreInfoChange('seoDescription', e.target.value)}
                margin="normal"
                multiline
                rows={3}
                helperText={`${(storeInfo.seoDescription || '').length}/160 characters (recommended: 150-160)`}
                inputProps={{ maxLength: 160 }}
              />

              <TextField
                fullWidth
                label="SEO Keywords"
                value={storeInfo.seoKeywords || ''}
                onChange={(e) => handleStoreInfoChange('seoKeywords', e.target.value)}
                margin="normal"
                helperText="Comma-separated keywords (e.g., ecommerce, online store, shopping)"
              />

              <Button
                type="submit"
                variant="contained"
                startIcon={<Save size={18} />}
                sx={{ mt: 3 }}
              >
                Save SEO Settings
              </Button>
            </form>
          </CardContent>
        </TabPanel>

        {/* Tab 5: Pricing */}
        <TabPanel value={tabValue} index={4}>
          <CardContent>
            <form onSubmit={handleSaveStoreInfo}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Pricing & Currency
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure currency, tax, and shipping costs. Tax and shipping will be added to cart total if set.
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Currency Symbol</InputLabel>
                <Select
                  value={storeInfo.currencySymbol || '₹'}
                  onChange={(e) => handleStoreInfoChange('currencySymbol', e.target.value)}
                  label="Currency Symbol"
                >
                  <MenuItem value="₹">₹ (Indian Rupee)</MenuItem>
                  <MenuItem value="$">$ (US Dollar)</MenuItem>
                  <MenuItem value="€">€ (Euro)</MenuItem>
                  <MenuItem value="£">£ (British Pound)</MenuItem>
                  <MenuItem value="¥">¥ (Japanese Yen)</MenuItem>
                  <MenuItem value="د.إ">د.إ (UAE Dirham)</MenuItem>
                  <MenuItem value="SR">SR (Saudi Riyal)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Tax Percentage (%)"
                type="number"
                value={storeInfo.taxPercentage || 0}
                onChange={(e) => handleStoreInfoChange('taxPercentage', parseFloat(e.target.value) || 0)}
                margin="normal"
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                helperText="Tax percentage to be added to cart total (0 = no tax)"
              />

              <TextField
                fullWidth
                label="Shipping Cost"
                type="number"
                value={storeInfo.shippingCost || 0}
                onChange={(e) => handleStoreInfoChange('shippingCost', parseFloat(e.target.value) || 0)}
                margin="normal"
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Flat shipping cost to be added to all orders (0 = free shipping)"
              />

              <Button
                type="submit"
                variant="contained"
                startIcon={<Save size={18} />}
                sx={{ mt: 3 }}
              >
                Save Pricing Settings
              </Button>
            </form>
          </CardContent>
        </TabPanel>

        {/* Tab 6: Payment */}
        <TabPanel value={tabValue} index={5}>
          <CardContent>
            <PaymentSettings />
          </CardContent>
        </TabPanel>
      </Card>
    </AdminLayout>
  );
}

export default AdminStoreSettings;
