import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineNoSymbol,
  HiOutlineTrash,
} from 'react-icons/hi2';
import { ProductService, OrderService } from '../services/api';

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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [clientType, setClientType] = useState('feign'); // 'feign' or 'webclient'
  const [form, setForm] = useState({ productId: '', quantity: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [orderRes, prodRes] = await Promise.allSettled([
        OrderService.getAll(),
        ProductService.getAll(),
      ]);
      if (orderRes.status === 'fulfilled') setOrders(orderRes.value.data);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // PLACE ORDER
  const handlePlaceOrder = async () => {
    if (!form.productId || !form.quantity) {
      toast.warning('Please select a product and enter quantity');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        productId: parseInt(form.productId),
        quantity: parseInt(form.quantity),
      };

      let res;
      if (clientType === 'feign') {
        res = await OrderService.placeWithFeign(payload);
        toast.success(`✅ Order placed via Feign Client! ID: #${res.data.orderId}`);
      } else {
        res = await OrderService.placeWithWebClient(payload);
        toast.success(`✅ Order placed via WebClient! ID: #${res.data.orderId}`);
      }

      setShowModal(false);
      setForm({ productId: '', quantity: '' });
      loadData(); // Refresh both orders and products (stock changed)
    } catch (err) {
      const msg = err.response?.data?.message || 'Order failed. Is Product Service running?';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // CANCEL ORDER
  const handleCancel = async (order) => {
    try {
      await OrderService.cancel(order.orderId);
      toast.success(`❌ Order #${order.orderId} cancelled`);
      loadData();
    } catch (err) {
      toast.error('Cancel failed');
    }
  };

  // DELETE ORDER
  const handleDelete = async (order) => {
    try {
      await OrderService.delete(order.orderId);
      toast.success(`🗑️ Order #${order.orderId} deleted`);
      setShowDeleteConfirm(null);
      loadData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <motion.div {...pageVariants}>
        <div className="spinner-container">
          <div className="spinner" />
          <p>Loading orders...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="page-header">
        <h2>Orders</h2>
        <p>Place and manage orders — connected to Order Service (port 8082)</p>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 14, alignSelf: 'center' }}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} found
        </span>
        <motion.button
          className="btn btn-success"
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <HiOutlinePlus /> Place Order
        </motion.button>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-body">
          {orders.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {orders.map((order, i) => (
                    <motion.tr
                      key={order.orderId}
                      variants={rowVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      custom={i}
                      layout
                    >
                      <td style={{ color: 'var(--text-muted)' }}>#{order.orderId}</td>
                      <td style={{ fontWeight: 600 }}>{order.productName}</td>
                      <td>{order.quantity}</td>
                      <td style={{ color: 'var(--secondary-light)', fontWeight: 600 }}>
                        ${order.totalPrice?.toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge badge-${order.orderStatus?.toLowerCase()}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleString()
                          : '-'}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {order.orderStatus === 'PLACED' && (
                            <motion.button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleCancel(order)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="Cancel Order"
                            >
                              <HiOutlineNoSymbol /> Cancel
                            </motion.button>
                          )}
                          <motion.button
                            className="btn btn-danger btn-icon"
                            onClick={() => setShowDeleteConfirm(order)}
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
              <div className="empty-icon">🛒</div>
              <h4>No orders yet</h4>
              <p>Click "Place Order" to create your first order</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== PLACE ORDER MODAL ===== */}
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
                <h3>🛒 Place New Order</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  <HiOutlineXMark />
                </button>
              </div>

              <div className="modal-body">
                {/* Client Type Toggle */}
                <div className="form-group">
                  <label>Inter-Service Communication Method</label>
                  <div className="client-toggle">
                    <button
                      className={clientType === 'feign' ? 'active' : ''}
                      onClick={() => setClientType('feign')}
                    >
                      ⚡ Feign Client
                    </button>
                    <button
                      className={clientType === 'webclient' ? 'active' : ''}
                      onClick={() => setClientType('webclient')}
                    >
                      🌐 WebClient
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {clientType === 'feign'
                      ? 'Feign: Declarative REST client — simple interface-based calls'
                      : 'WebClient: Programmatic reactive HTTP client — flexible & non-blocking'}
                  </p>
                </div>

                {/* Product Selection */}
                <div className="form-group">
                  <label>Select Product *</label>
                  <select
                    className="form-control"
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  >
                    <option value="">-- Choose a product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ${p.price?.toFixed(2)} (Stock: {p.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    className="form-control"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="Enter quantity"
                  />
                </div>

                {/* Order Summary */}
                {form.productId && form.quantity && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 16,
                      marginTop: 8,
                    }}
                  >
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      Order Summary
                    </p>
                    {(() => {
                      const prod = products.find((p) => p.id === parseInt(form.productId));
                      if (!prod) return null;
                      const total = prod.price * parseInt(form.quantity);
                      return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600 }}>
                            {prod.name} × {form.quantity}
                          </span>
                          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--secondary-light)' }}>
                            ${total.toFixed(2)}
                          </span>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <motion.button
                  className="btn btn-success"
                  onClick={handlePlaceOrder}
                  disabled={saving}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {saving
                    ? 'Placing...'
                    : clientType === 'feign'
                    ? '⚡ Place via Feign'
                    : '🌐 Place via WebClient'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DELETE CONFIRMATION ===== */}
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
                <h3>🗑️ Delete Order</h3>
                <button className="modal-close" onClick={() => setShowDeleteConfirm(null)}>
                  <HiOutlineXMark />
                </button>
              </div>
              <div className="modal-body">
                <p className="confirm-text">
                  Delete <strong>Order #{showDeleteConfirm.orderId}</strong> for{' '}
                  <strong>{showDeleteConfirm.productName}</strong>?
                  <br />This cannot be undone.
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
