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
import { Save } from 'lucide-react';
import { onAuthChange } from '../../services/auth';
import { getStoreInfo, updateStoreInfo, getAllStaticPages, updateStaticPage } from '../../services/storeInfo';
import { getCurrentTemplate, updateThemeTemplate } from '../../services/theme';
import { getThemeTemplateOptions } from '../../config/themeTemplates';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
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
    shippingCost: 0
  });

  const [staticPages, setStaticPages] = useState({
    about: { content: '', imagePath: '' },
    terms: { content: '', imagePath: '' },
    privacy: { content: '', imagePath: '' }
  });

  const [selectedTemplate, setSelectedTemplate] = useState('professional');
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
      const [info, pages, currentTemplate] = await Promise.all([
        getStoreInfo(),
        getAllStaticPages(),
        getCurrentTemplate()
      ]);
      setStoreInfo(info);
      setStaticPages(pages);
      setSelectedTemplate(currentTemplate);
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
      await updateStoreInfo(storeInfo);
      showSuccess('Store information saved successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStoreInfoChange = (field, value) => {
    setStoreInfo({ ...storeInfo, [field]: value });
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
                label="Logo URL"
                value={storeInfo.logoUrl || ''}
                onChange={(e) => handleStoreInfoChange('logoUrl', e.target.value)}
                margin="normal"
                placeholder="/images/logo.png or https://example.com/logo.png"
                helperText="Path to your logo (e.g., /images/logo.png) or full URL"
              />

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

              <Button
                type="submit"
                variant="contained"
                startIcon={<Save size={18} />}
                sx={{ mt: 3 }}
              >
                Save Store Information
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

            <Button
              variant="contained"
              startIcon={<Save size={18} />}
              onClick={handleSaveTheme}
            >
              Apply Theme Template
            </Button>
          </CardContent>
        </TabPanel>

        {/* Tab 3: Pages */}
        <TabPanel value={tabValue} index={2}>
          <CardContent>
            {/* About Page */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              About Page
            </Typography>

            <TextField
              fullWidth
              label="About Page Content"
              value={staticPages.about?.content || ''}
              onChange={(e) => handlePageContentChange('about', 'content', e.target.value)}
              multiline
              rows={6}
              margin="normal"
            />

            <TextField
              fullWidth
              label="About Page Image Path"
              value={staticPages.about?.imagePath || ''}
              onChange={(e) => handlePageContentChange('about', 'imagePath', e.target.value)}
              margin="normal"
              placeholder="/images/about.jpg"
            />

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

            <TextField
              fullWidth
              label="Terms Content"
              value={staticPages.terms?.content || ''}
              onChange={(e) => handlePageContentChange('terms', 'content', e.target.value)}
              multiline
              rows={6}
              margin="normal"
            />

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

            <TextField
              fullWidth
              label="Privacy Content"
              value={staticPages.privacy?.content || ''}
              onChange={(e) => handlePageContentChange('privacy', 'content', e.target.value)}
              multiline
              rows={6}
              margin="normal"
            />

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
      </Card>
    </AdminLayout>
  );
}

export default AdminStoreSettings;
