import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { ProductService } from '../services/api';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const rowVariants = {
  initial: { opacity: 0, x: -20 },
  animate: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

const emptyProduct = { name: '', description: '', price: '', quantity: '', category: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await ProductService.getAll();
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products. Is Product Service running on port 8081?');
    } finally {
      setLoading(false);
    }
  };

  // Open modal for CREATE
  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setShowModal(true);
  };

  // Open modal for EDIT
  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      quantity: product.quantity,
      category: product.category || '',
    });
    setShowModal(true);
  };

  // SAVE (Create or Update)
  const handleSave = async () => {
    if (!form.name || !form.price || !form.quantity) {
      toast.warning('Please fill in Name, Price, and Quantity');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        category: form.category || 'General',
      };

      if (editingProduct) {
        // UPDATE
        await ProductService.update(editingProduct.id, payload);
        toast.success(`✅ "${form.name}" updated successfully`);
      } else {
        // CREATE
        await ProductService.create(payload);
        toast.success(`✅ "${form.name}" created successfully`);
      }

      setShowModal(false);
      loadProducts();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.fieldErrors
        ? JSON.stringify(err.response.data.fieldErrors)
        : 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const handleDelete = async (product) => {
    try {
      await ProductService.delete(product.id);
      toast.success(`🗑️ "${product.name}" deleted`);
      setShowDeleteConfirm(null);
      loadProducts();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <motion.div {...pageVariants}>
        <div className="spinner-container">
          <div className="spinner" />
          <p>Loading products...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="page-header">
        <h2>Products</h2>
        <p>Manage your product inventory — connected to Product Service (port 8081)</p>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 14, alignSelf: 'center' }}>
          {products.length} product{products.length !== 1 ? 's' : ''} found
        </span>
        <motion.button
          className="btn btn-primary"
          onClick={openCreateModal}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <HiOutlinePlus /> Add Product
        </motion.button>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-body">
          {products.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {products.map((product, i) => (
                    <motion.tr
                      key={product.id}
                      variants={rowVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      custom={i}
                      layout
                    >
                      <td style={{ color: 'var(--text-muted)' }}>#{product.id}</td>
                      <td style={{ fontWeight: 600 }}>{product.name}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.description || '-'}
                      </td>
                      <td>
                        <span className="badge badge-category">{product.category}</span>
                      </td>
                      <td style={{ color: 'var(--secondary-light)', fontWeight: 600 }}>
                        ${product.price?.toFixed(2)}
                      </td>
                      <td>
                        <span style={{
                          color: product.quantity < 10 ? 'var(--danger)' : 'var(--text)',
                          fontWeight: 600,
                        }}>
                          {product.quantity}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <motion.button
                            className="btn btn-secondary btn-icon"
                            onClick={() => openEditModal(product)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Edit"
                          >
                            <HiOutlinePencilSquare />
                          </motion.button>
                          <motion.button
                            className="btn btn-danger btn-icon"
                            onClick={() => setShowDeleteConfirm(product)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete"
                          >
                            <HiOutlineTrash />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h4>No products found</h4>
              <p>Click "Add Product" to create your first product</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== CREATE / EDIT MODAL ===== */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  <HiOutlineXMark />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. iPhone 15 Pro"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="e.g. Apple iPhone 15 Pro 256GB"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input
                      className="form-control"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="999.99"
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      className="form-control"
                      name="quantity"
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="50"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="">Select category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Books">Books</option>
                    <option value="Home">Home</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <motion.button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              className="modal"
              style={{ maxWidth: 420 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>🗑️ Delete Product</h3>
                <button className="modal-close" onClick={() => setShowDeleteConfirm(null)}>
                  <HiOutlineXMark />
                </button>
              </div>
              <div className="modal-body">
                <p className="confirm-text">
                  Are you sure you want to delete <strong>"{showDeleteConfirm.name}"</strong>?
                  <br />This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                  Cancel
                </button>
                <motion.button
                  className="btn btn-danger"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ background: 'var(--danger)', color: 'white' }}
                >
                  <HiOutlineTrash /> Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
