import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence } from 'framer-motion';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Search from './pages/Search';

function App() {
  const location = useLocation();

  return (
    <>
      {/* Animated background blobs */}
      <div className="app-bg" />

      <div className="app-layout">
        {/* ===== SIDEBAR ===== */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">⚡</div>
            <div>
              <h1>MicroHub</h1>
              <span>Service Dashboard</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-label">Main</div>

            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon"><HiOutlineHome /></span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon"><HiOutlineCube /></span>
              <span>Products</span>
            </NavLink>

            <NavLink
              to="/orders"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon"><HiOutlineShoppingCart /></span>
              <span>Orders</span>
            </NavLink>

            <div className="nav-section-label">Tools</div>

            <NavLink
              to="/search"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon"><HiOutlineMagnifyingGlass /></span>
              <span>Search</span>
            </NavLink>
          </nav>

          {/* Service status indicators */}
          <div className="sidebar-status">
            <p>
              <span className="status-dot online" />
              <span>Product Service :8081</span>
            </p>
            <p style={{ marginTop: 6 }}>
              <span className="status-dot online" />
              <span>Order Service :8082</span>
            </p>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/search" element={<Search />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="dark"
        toastStyle={{ background: '#1e293b', border: '1px solid #334155' }}
      />
    </>
  );
}

export default App;
