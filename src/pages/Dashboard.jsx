import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCube, HiOutlineShoppingCart, HiOutlineCurrencyDollar, HiOutlineArchiveBox } from 'react-icons/hi2';
import { ProductService, OrderService } from '../services/api';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, orderRes] = await Promise.allSettled([
        ProductService.getAll(),
        OrderService.getAll(),
      ]);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data);
      if (orderRes.status === 'fulfilled') setOrders(orderRes.value.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders
    .filter((o) => o.orderStatus === 'PLACED')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0);

  const stats = [
    { label: 'Total Products', value: products.length, icon: <HiOutlineCube />, color: 'purple' },
    { label: 'Total Orders', value: orders.length, icon: <HiOutlineShoppingCart />, color: 'green' },
    { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: <HiOutlineCurrencyDollar />, color: 'amber' },
    { label: 'Total Stock', value: totalStock, icon: <HiOutlineArchiveBox />, color: 'red' },
  ];

  if (loading) {
    return (
      <motion.div {...pageVariants}>
        <div className="spinner-container">
          <div className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your microservices</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="stat-card"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            custom={i}
            whileHover={{ scale: 1.03 }}
          >
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Products */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ marginBottom: 24 }}
      >
        <div className="card-header">
          <h3>📦 Products Inventory</h3>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {products.length} items
          </span>
        </div>
        <div className="card-body">
          {products.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><span className="badge badge-category">{p.category}</span></td>
                    <td style={{ color: 'var(--secondary-light)', fontWeight: 600 }}>
                      ${p.price?.toFixed(2)}
                    </td>
                    <td>{p.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h4>No products yet</h4>
              <p>Start Product Service on port 8081</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="card-header">
          <h3>🛒 Recent Orders</h3>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {orders.length} orders
          </span>
        </div>
        <div className="card-body">
          {orders.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.orderId}>
                    <td>#{o.orderId}</td>
                    <td style={{ fontWeight: 600 }}>{o.productName}</td>
                    <td>{o.quantity}</td>
                    <td style={{ color: 'var(--secondary-light)', fontWeight: 600 }}>
                      ${o.totalPrice?.toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge badge-${o.orderStatus?.toLowerCase()}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h4>No orders yet</h4>
              <p>Place an order from the Orders page</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
