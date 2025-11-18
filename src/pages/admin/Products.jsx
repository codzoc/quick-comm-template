import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut, onAuthChange } from '../../services/auth';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../services/products';
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
    imagePath: '/images/placeholder.png',
    stock: ''
  });
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
    setFormData({ title: '', description: '', price: '', discountedPrice: '', imagePath: '/images/placeholder.png', stock: '' });
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ ...product, discountedPrice: product.discountedPrice || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="admin-layout"><LoadingSpinner size="large" /></div>;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1>Products</h1>
        <nav className="admin-nav">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/products" className="active">Products</Link>
          <Link to="/admin/orders">Orders</Link>
          <Link to="/admin/settings">Settings</Link>
          <button onClick={() => signOut().then(() => navigate('/admin'))} className="logout-btn">Logout</button>
        </nav>
      </header>

      <main className="admin-content">
        <div className="page-header">
          <h2>Manage Products</h2>
          <div className="page-actions">
            <button onClick={handleAdd} className="btn-primary">Add Product</button>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={loadProducts} />}

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.title}</td>
                  <td>₹{product.discountedPrice || product.price}</td>
                  <td>{product.stock}</td>
                  <td className="table-actions">
                    <button onClick={() => handleEdit(product)} className="btn-icon">Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="btn-icon delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div className="form-row two-col">
                <div className="form-group">
                  <label>Price *</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Discounted Price</label>
                  <input type="number" value={formData.discountedPrice} onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })} />
                </div>
              </div>
              <div className="form-row two-col">
                <div className="form-group">
                  <label>Image Path *</label>
                  <input type="text" value={formData.imagePath} onChange={(e) => setFormData({ ...formData, imagePath: e.target.value })} required placeholder="/images/product.jpg" />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
