import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Edit, Trash2, Plus, X, Upload, Trash } from 'lucide-react';
import { onAuthChange } from '../../services/auth';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../services/products';
import { uploadProductImages } from '../../services/imageUpload';
import { getStoreInfo } from '../../services/storeInfo';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import './AdminStyles.css';

function AdminProducts() {
  const DEFAULT_CONFIGURATION_ATTRIBUTES = [{ id: 'color', name: 'Color', type: 'color' }];
  const createConfigurationRow = (index = 0, existingValues = {}) => ({
    id: `cfg_${Date.now()}_${index}`,
    values: { color: '', ...existingValues },
    image: '',
    price: '',
    discountedPrice: '',
    stock: ''
  });

  const normalizeConfigurations = (rows = [], attributes = DEFAULT_CONFIGURATION_ATTRIBUTES) => {
    return rows.map((row, index) => {
      const values = {};
      attributes.forEach((attr) => {
        if (attr.type === 'color') {
          values[attr.id] = row.values?.[attr.id] || '';
        } else {
          values[attr.id] = row.values?.[attr.id] || '';
        }
      });

      return {
        id: row.id || `cfg_${Date.now()}_${index}`,
        values,
        image: row.image || '',
        price: row.price ?? '',
        discountedPrice: row.discountedPrice ?? '',
        stock: row.stock ?? ''
      };
    });
  };

  const [products, setProducts] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountedPrice: '',
    images: [], // Array of image URLs
    imagePath: '', // Legacy support
    stock: '',
    tags: '',
    hasConfigurations: false,
    configurationAttributes: DEFAULT_CONFIGURATION_ATTRIBUTES,
    configurations: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [configurationImageFiles, setConfigurationImageFiles] = useState({});
  const [configurationImagePreviews, setConfigurationImagePreviews] = useState({});
  const [showAttributeDialog, setShowAttributeDialog] = useState(false);
  const [attributeDraft, setAttributeDraft] = useState({ name: '' });
  const [uploadingImages, setUploadingImages] = useState(false);
  const navigate = useNavigate();

  const resetAttributeDialog = () => {
    setAttributeDraft({ name: '' });
    setShowAttributeDialog(false);
  };

  const clearConfigurationImagePreviews = (previews) => {
    Object.values(previews).forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
  };

  useEffect(() => {
    return () => {
      clearConfigurationImagePreviews(configurationImagePreviews);
    };
  }, [configurationImagePreviews]);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) navigate('/admin');
      else loadProducts();
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      const [data, storeData] = await Promise.all([
        getAllProducts(),
        getStoreInfo()
      ]);
      setProducts(data);
      setStoreInfo(storeData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    clearConfigurationImagePreviews(configurationImagePreviews);
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      discountedPrice: '',
      images: [],
      imagePath: '',
      stock: '',
      tags: '',
      hasConfigurations: false,
      configurationAttributes: DEFAULT_CONFIGURATION_ATTRIBUTES,
      configurations: []
    });
    setImageFiles([]);
    setConfigurationImageFiles({});
    setConfigurationImagePreviews({});
    setShowModal(true);
  };

  const handleEdit = (product) => {
    clearConfigurationImagePreviews(configurationImagePreviews);
    setEditingProduct(product);
    // Support both new format (images array) and legacy (imagePath)
    const images = product.images || (product.imagePath ? [product.imagePath] : []);
    const hasConfigurations = Boolean(product.hasConfigurations && Array.isArray(product.configurations) && product.configurations.length > 0);
    const configurationAttributes = (product.configurationAttributes && product.configurationAttributes.length > 0)
      ? product.configurationAttributes
      : DEFAULT_CONFIGURATION_ATTRIBUTES;
    const configurations = hasConfigurations
      ? normalizeConfigurations(product.configurations, configurationAttributes)
      : [];

    setFormData({
      ...product,
      images: images,
      imagePath: product.imagePath || '',
      discountedPrice: product.discountedPrice || '',
      tags: product.tags || '',
      hasConfigurations,
      configurationAttributes,
      configurations
    });
    setImageFiles([]);
    setConfigurationImageFiles({});
    setConfigurationImagePreviews({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This action cannot be undone.')) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleHasConfigurationsToggle = (enabled) => {
    setFormData((prev) => {
      if (!enabled) {
        return {
          ...prev,
          hasConfigurations: false,
          configurationAttributes: DEFAULT_CONFIGURATION_ATTRIBUTES,
          configurations: []
        };
      }

      const attributes = prev.configurationAttributes?.length > 0
        ? prev.configurationAttributes
        : DEFAULT_CONFIGURATION_ATTRIBUTES;
      const configs = prev.configurations?.length > 0
        ? normalizeConfigurations(prev.configurations, attributes)
        : [createConfigurationRow(0)];

      return {
        ...prev,
        hasConfigurations: true,
        configurationAttributes: attributes,
        configurations: configs
      };
    });
  };

  const handleAddConfigurationRow = () => {
    setFormData((prev) => ({
      ...prev,
      configurations: [...prev.configurations, createConfigurationRow(prev.configurations.length)]
    }));
  };

  const handleRemoveConfigurationRow = (rowId) => {
    setFormData((prev) => ({
      ...prev,
      configurations: prev.configurations.filter((row) => row.id !== rowId)
    }));
    setConfigurationImageFiles((prev) => {
      const updated = { ...prev };
      delete updated[rowId];
      return updated;
    });
    setConfigurationImagePreviews((prev) => {
      const updated = { ...prev };
      if (updated[rowId]) URL.revokeObjectURL(updated[rowId]);
      delete updated[rowId];
      return updated;
    });
  };

  const handleAddAttribute = () => {
    setShowAttributeDialog(true);
  };

  const saveNewAttribute = () => {
    const name = attributeDraft.name.trim();
    const type = 'text';
    if (!name) {
      alert('Attribute name is required.');
      return;
    }

    const baseId = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `attr_${Date.now()}`;
    const attributeId = `${baseId}_${Date.now()}`;

    setFormData((prev) => {
      const exists = prev.configurationAttributes.some((attr) => attr.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        alert('An attribute with this name already exists.');
        return prev;
      }

      const updatedAttributes = [...prev.configurationAttributes, { id: attributeId, name, type }];
      const updatedConfigurations = prev.configurations.map((row) => ({
        ...row,
        values: {
          ...row.values,
          [attributeId]: ''
        }
      }));

      return {
        ...prev,
        configurationAttributes: updatedAttributes,
        configurations: updatedConfigurations
      };
    });

    resetAttributeDialog();
  };

  const getConfigurationSignature = (row, attributes) => {
    return attributes
      .map((attribute) => {
        const rawValue = row.values?.[attribute.id];
        if (rawValue === null || rawValue === undefined) return '';
        return String(rawValue).trim().toLowerCase();
      })
      .join('||');
  };

  const findDuplicateConfigurationRowIds = (rows, attributes) => {
    const signatureToRowIds = rows.reduce((acc, row) => {
      const signature = getConfigurationSignature(row, attributes);
      if (!signature) return acc;
      if (!acc[signature]) acc[signature] = [];
      acc[signature].push(row.id);
      return acc;
    }, {});

    return Object.values(signatureToRowIds)
      .filter((ids) => ids.length > 1)
      .flat();
  };

  const handleConfigurationValueChange = (rowId, attrId, value) => {
    setFormData((prev) => ({
      ...prev,
      configurations: prev.configurations.map((row) => (
        row.id === rowId
          ? { ...row, values: { ...row.values, [attrId]: value } }
          : row
      ))
    }));
  };

  const handleConfigurationFieldChange = (rowId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      configurations: prev.configurations.map((row) => (
        row.id === rowId ? { ...row, [field]: value } : row
      ))
    }));
  };

  const handleConfigurationImageChange = (rowId, file) => {
    if (!file) return;
    setConfigurationImageFiles((prev) => ({ ...prev, [rowId]: file }));
    setConfigurationImagePreviews((prev) => {
      const updated = { ...prev };
      if (updated[rowId]) {
        URL.revokeObjectURL(updated[rowId]);
      }
      updated[rowId] = URL.createObjectURL(file);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadingImages(true);
    try {
      let finalFormData = { ...formData };
      let productId = editingProduct?.id;

      if (finalFormData.hasConfigurations) {
        if (!finalFormData.configurations || finalFormData.configurations.length === 0) {
          throw new Error('Please add at least one configuration row.');
        }

        const duplicateRowIds = findDuplicateConfigurationRowIds(
          finalFormData.configurations,
          finalFormData.configurationAttributes || []
        );
        if (duplicateRowIds.length > 0) {
          throw new Error('Duplicate configuration combinations found. Please make each configuration unique.');
        }

        const normalized = finalFormData.configurations.map((row) => {
          const price = parseFloat(row.price);
          if (Number.isNaN(price)) {
            throw new Error('Each configuration must have a valid price.');
          }
          const discounted = row.discountedPrice !== '' && row.discountedPrice !== null && row.discountedPrice !== undefined
            ? parseFloat(row.discountedPrice)
            : null;
          const stock = parseInt(row.stock, 10);
          if (Number.isNaN(stock)) {
            throw new Error('Each configuration must have a valid stock.');
          }

          return {
            id: row.id,
            values: row.values || {},
            image: row.image || '',
            price,
            discountedPrice: Number.isNaN(discounted) ? null : discounted,
            stock
          };
        });

        const totalStock = normalized.reduce((sum, row) => sum + (row.stock || 0), 0);
        const minBasePrice = normalized.reduce((min, row) => Math.min(min, row.price), Number.POSITIVE_INFINITY);
        const discountedRows = normalized.filter((row) => row.discountedPrice !== null && row.discountedPrice < row.price);
        const minDiscountedPrice = discountedRows.length > 0
          ? discountedRows.reduce((min, row) => Math.min(min, row.discountedPrice), Number.POSITIVE_INFINITY)
          : null;

        finalFormData = {
          ...finalFormData,
          price: Number.isFinite(minBasePrice) ? minBasePrice : 0,
          discountedPrice: Number.isFinite(minDiscountedPrice) ? minDiscountedPrice : null,
          stock: totalStock,
          configurations: normalized
        };
      } else {
        finalFormData.hasConfigurations = false;
        finalFormData.configurationAttributes = [];
        finalFormData.configurations = [];
      }
      
      // For new products, create product first to get the ID, then upload images
      if (!editingProduct) {
        // Create product without images first to get the product ID
        const tempFormData = { ...finalFormData };
        tempFormData.images = [];
        tempFormData.imagePath = '';
        productId = await createProduct(tempFormData);
      }
      
      // Upload new images if any (now we have the real product ID)
      if (imageFiles.length > 0) {
        const uploadProductId = productId || 'temp';
        const uploadedUrls = await uploadProductImages(imageFiles, uploadProductId);
        
        // Merge with existing images
        const existingImages = formData.images || [];
        finalFormData.images = [...existingImages, ...uploadedUrls];
        
        // Set imagePath for backward compatibility (use first image)
        if (finalFormData.images.length > 0) {
          finalFormData.imagePath = finalFormData.images[0];
        }
      } else if (finalFormData.images.length > 0) {
        // Ensure imagePath is set for backward compatibility
        finalFormData.imagePath = finalFormData.images[0];
      }

      if (finalFormData.hasConfigurations && finalFormData.configurations.length > 0) {
        const uploadTasks = Object.entries(configurationImageFiles).map(async ([rowId, file]) => {
          if (!file) return;
          const [uploadedImage] = await uploadProductImages([file], `${productId}_cfg_${rowId}`);
          finalFormData.configurations = finalFormData.configurations.map((row) => (
            row.id === rowId ? { ...row, image: uploadedImage } : row
          ));
        });
        await Promise.all(uploadTasks);
      }
      
      // Remove imageFiles from formData before saving
      delete finalFormData.imageFiles;
      
      if (editingProduct) {
        // Update existing product with new images
        await updateProduct(editingProduct.id, finalFormData);
      } else {
        // Update the newly created product with images
        await updateProduct(productId, finalFormData);
      }
      
      setShowModal(false);
      setImageFiles([]);
      setConfigurationImageFiles({});
      clearConfigurationImagePreviews(configurationImagePreviews);
      setConfigurationImagePreviews({});
      loadProducts();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      alert(err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'error' };
    if (stock < 5) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);
    e.target.value = ''; // Reset input
  };

  const removeImageFile = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const removeUploadedImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages, imagePath: newImages[0] || '' });
  };

  // Get display image (first image from array or legacy imagePath)
  const getDisplayImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return product.imagePath || '/images/placeholder.png';
  };

  const getProductPriceSummary = (product) => {
    if (product.hasConfigurations && Array.isArray(product.configurations) && product.configurations.length > 0) {
      const prices = product.configurations.map((row) => row.discountedPrice || row.price).filter((value) => typeof value === 'number');
      if (prices.length > 0) {
        return { label: `From ${storeInfo?.currencySymbol || '₹'}${Math.min(...prices)}`, isRange: true };
      }
    }
    return { label: `${storeInfo?.currencySymbol || '₹'}${product.discountedPrice || product.price}`, isRange: false };
  };

  const duplicateConfigurationRowIds = findDuplicateConfigurationRowIds(
    formData.configurations || [],
    formData.configurationAttributes || []
  );

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="large" message="Loading products..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Manage Products
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={handleAdd}
          >
            Add Product
          </Button>
        </Box>

        {error && <ErrorMessage message={error} onRetry={loadProducts} />}

        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'var(--color-surface)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                const priceSummary = getProductPriceSummary(product);
                return (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Box
                        component="img"
                        src={getDisplayImage(product)}
                        alt={product.title}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                        onError={(e) => {
                          e.target.src = '/images/placeholder.png';
                        }}
                      />
                      {(product.images && product.images.length > 1) && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          +{product.images.length - 1} more
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {product.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {product.description?.substring(0, 60)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {product.hasConfigurations ? (
                          <>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {priceSummary.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.configurations?.length || 0} configurations
                            </Typography>
                          </>
                        ) : product.discountedPrice ? (
                          <>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {storeInfo?.currencySymbol || '₹'}{product.discountedPrice}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ textDecoration: 'line-through' }}
                            >
                              {storeInfo?.currencySymbol || '₹'}{product.price}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {storeInfo?.currencySymbol || '₹'}{product.price}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {product.stock}
                      </Typography>
                      {product.hasConfigurations && (
                        <Typography variant="caption" color="text.secondary">
                          Combined stock
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={stockStatus.label}
                        color={stockStatus.color}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(product)}
                          title="Edit Product"
                        >
                          <Edit size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(product.id)}
                          title="Delete Product"
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No products found. Click "Add Product" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
            {editingProduct ? 'Edit Product' : 'Add Product'}
          </Typography>
          <IconButton size="small" onClick={() => setShowModal(false)}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter product name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  multiline
                  rows={3}
                  placeholder="Enter product description"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={formData.hasConfigurations}
                      onChange={(e) => handleHasConfigurationsToggle(e.target.checked)}
                    />
                  )}
                  label="Does this product have configurations?"
                />
              </Grid>
              {!formData.hasConfigurations ? (
                <>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="0"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Discounted Price (Optional)"
                      type="number"
                      value={formData.discountedPrice}
                      onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                      placeholder="0"
                      inputProps={{ min: 0, step: 0.01 }}
                      helperText="Leave empty if no discount"
                    />
                  </Grid>
                </>
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Product Configurations
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" size="small" onClick={handleAddAttribute}>
                          Add Attribute
                        </Button>
                        <Button variant="contained" size="small" onClick={handleAddConfigurationRow}>
                          Add Configuration
                        </Button>
                      </Box>
                    </Box>
                    {duplicateConfigurationRowIds.length > 0 && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1.5 }}>
                        Duplicate configuration combinations found. Each row must have a unique attribute combination.
                      </Typography>
                    )}
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {formData.configurationAttributes.map((attribute) => (
                              <TableCell key={attribute.id}>{attribute.name}</TableCell>
                            ))}
                            <TableCell>Image</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Discounted Price</TableCell>
                            <TableCell>Stock</TableCell>
                            <TableCell align="center">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formData.configurations.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={formData.configurationAttributes.length + 5} align="center">
                                Add a configuration row to begin.
                              </TableCell>
                            </TableRow>
                          )}
                          {formData.configurations.map((row) => (
                            <TableRow
                              key={row.id}
                              sx={duplicateConfigurationRowIds.includes(row.id) ? { backgroundColor: 'rgba(211, 47, 47, 0.06)' } : {}}
                            >
                              {formData.configurationAttributes.map((attribute) => (
                                <TableCell key={`${row.id}_${attribute.id}`}>
                                  {attribute.type === 'color' ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <input
                                        type="color"
                                        value={row.values?.[attribute.id] || '#ffffff'}
                                        onChange={(e) => handleConfigurationValueChange(row.id, attribute.id, e.target.value)}
                                        style={{
                                          width: 30,
                                          height: 30,
                                          borderRadius: '50%',
                                          border: '1px solid #d0d0d0',
                                          padding: 0,
                                          overflow: 'hidden',
                                          cursor: 'pointer',
                                          background: 'transparent',
                                          opacity: row.values?.[attribute.id] ? 1 : 0.35
                                        }}
                                      />
                                      <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => handleConfigurationValueChange(row.id, attribute.id, '')}
                                        sx={{ minWidth: 0, px: 0.5 }}
                                      >
                                        Clear
                                      </Button>
                                    </Box>
                                  ) : (
                                    <TextField
                                      size="small"
                                      type={attribute.type === 'number' ? 'number' : 'text'}
                                      value={row.values?.[attribute.id] || ''}
                                      onChange={(e) => handleConfigurationValueChange(row.id, attribute.id, e.target.value)}
                                      placeholder={attribute.name}
                                    />
                                  )}
                                </TableCell>
                              ))}
                              <TableCell>
                                <input
                                  id={`config-image-${row.id}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleConfigurationImageChange(row.id, e.target.files?.[0])}
                                  style={{ display: 'none' }}
                                />
                                <label htmlFor={`config-image-${row.id}`}>
                                  <Button
                                    component="span"
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Upload size={14} />}
                                  >
                                    Upload
                                  </Button>
                                </label>
                                {(configurationImagePreviews[row.id] || row.image) && (
                                  <Box
                                    component="img"
                                    src={configurationImagePreviews[row.id] || row.image}
                                    alt="Configuration preview"
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 1,
                                      objectFit: 'cover',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      mt: 0.75
                                    }}
                                    onError={(e) => {
                                      e.target.src = '/images/placeholder.png';
                                    }}
                                  />
                                )}
                                {(row.image || configurationImageFiles[row.id]) && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {configurationImageFiles[row.id] ? 'New image selected' : 'Image uploaded'}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={row.price}
                                  onChange={(e) => handleConfigurationFieldChange(row.id, 'price', e.target.value)}
                                  inputProps={{ min: 0, step: 0.01 }}
                                  required
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={row.discountedPrice}
                                  onChange={(e) => handleConfigurationFieldChange(row.id, 'discountedPrice', e.target.value)}
                                  inputProps={{ min: 0, step: 0.01 }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={row.stock}
                                  onChange={(e) => handleConfigurationFieldChange(row.id, 'stock', e.target.value)}
                                  inputProps={{ min: 0 }}
                                  required
                                />
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveConfigurationRow(row.id)}
                                  disabled={formData.configurations.length <= 1}
                                >
                                  <Trash size={16} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Product Images *
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Upload one or more images. First image will be the main display image. Max width: 1024px, auto-compressed.
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFilesChange}
                  style={{ display: 'none' }}
                  id="product-image-upload"
                />
                <label htmlFor="product-image-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<Upload size={18} />}
                    sx={{ mb: 2 }}
                  >
                    Upload Images
                  </Button>
                </label>
                
                {/* Preview uploaded images */}
                {formData.images && formData.images.length > 0 && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Uploaded Images:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.images.map((url, index) => (
                        <Box key={index} sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={url}
                            alt={`Product image ${index + 1}`}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                            onError={(e) => {
                              e.target.src = '/images/placeholder.png';
                            }}
                          />
                          {index === 0 && (
                            <Chip
                              label="Main"
                              size="small"
                              color="primary"
                              sx={{
                                position: 'absolute',
                                top: -8,
                                left: -8,
                                fontSize: '10px',
                                height: '20px'
                              }}
                            />
                          )}
                          <IconButton
                            size="small"
                            onClick={() => removeUploadedImage(index)}
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              backgroundColor: 'error.main',
                              color: 'white',
                              width: 24,
                              height: 24,
                              '&:hover': {
                                backgroundColor: 'error.dark'
                              }
                            }}
                          >
                            <X size={14} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Preview new image files to upload */}
                {imageFiles.length > 0 && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      New Images to Upload:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {imageFiles.map((file, index) => (
                        <Box key={index} sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeImageFile(index)}
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              backgroundColor: 'error.main',
                              color: 'white',
                              width: 24,
                              height: 24,
                              '&:hover': {
                                backgroundColor: 'error.dark'
                              }
                            }}
                          >
                            <X size={14} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                
                {(!formData.images || formData.images.length === 0) && imageFiles.length === 0 && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    At least one image is required
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required={!formData.hasConfigurations}
                  placeholder="0"
                  inputProps={{ min: 0 }}
                  helperText={formData.hasConfigurations ? 'Auto-calculated from all configurations' : ''}
                  disabled={formData.hasConfigurations}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SEO Tags/Keywords (Optional)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="electronics, smartphone, gadgets, best deals"
                  helperText="Comma-separated keywords for search optimization"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={uploadingImages || (formData.hasConfigurations && duplicateConfigurationRowIds.length > 0)}
            >
              {uploadingImages ? 'Uploading Images...' : editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={showAttributeDialog} onClose={resetAttributeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Add Configuration Attribute</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Attribute Name"
            value={attributeDraft.name}
            onChange={(e) => setAttributeDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Size"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={resetAttributeDialog}>Cancel</Button>
          <Button onClick={saveNewAttribute} variant="contained">Add Attribute</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default AdminProducts;
