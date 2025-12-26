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
  Grid
} from '@mui/material';
import { Edit, Trash2, Plus, X, Upload, Trash } from 'lucide-react';
import { onAuthChange } from '../../services/auth';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../services/products';
import { uploadProductImages, deleteImage } from '../../services/imageUpload';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import './AdminStyles.css';

function AdminProducts() {
  const [products, setProducts] = useState([]);
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
    tags: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) navigate('/admin');
      else loadProducts();
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      discountedPrice: '',
      images: [],
      imagePath: '',
      stock: '',
      tags: ''
    });
    setImageFiles([]);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    // Support both new format (images array) and legacy (imagePath)
    const images = product.images || (product.imagePath ? [product.imagePath] : []);
    setFormData({
      ...product,
      images: images,
      imagePath: product.imagePath || '',
      discountedPrice: product.discountedPrice || '',
      tags: product.tags || ''
    });
    setImageFiles([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadingImages(true);
    try {
      let finalFormData = { ...formData };
      let productId = editingProduct?.id;
      
      // For new products, create product first to get the ID, then upload images
      if (!editingProduct) {
        // Create product without images first to get the product ID
        const tempFormData = { ...finalFormData };
        tempFormData.images = [];
        tempFormData.imagePath = '';
        productId = await createProduct(tempFormData);
        console.log('Created product with ID:', productId);
      }
      
      // Upload new images if any (now we have the real product ID)
      if (imageFiles.length > 0) {
        const uploadProductId = productId || 'temp';
        console.log('Uploading images with product ID:', uploadProductId);
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
                        {product.discountedPrice ? (
                          <>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ₹{product.discountedPrice}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ textDecoration: 'line-through' }}
                            >
                              ₹{product.price}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ₹{product.price}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {product.stock}
                      </Typography>
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
                  required
                  placeholder="0"
                  inputProps={{ min: 0 }}
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
            <Button type="submit" variant="contained" disabled={uploadingImages}>
              {uploadingImages ? 'Uploading Images...' : editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AdminLayout>
  );
}

export default AdminProducts;
