import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { HiOutlineMagnifyingGlass, HiOutlineFunnel } from 'react-icons/hi2';
import { ProductService } from '../services/api';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
};

const categories = ['Electronics', 'Clothing', 'Footwear', 'Books', 'Home', 'General'];

export default function Search() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Search by keyword
  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast.warning('Enter a keyword to search');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await ProductService.search(keyword.trim());
      setResults(res.data);
      if (res.data.length === 0) {
        toast.info(`No products found for "${keyword}"`);
      }
    } catch (err) {
      toast.error('Search failed. Is Product Service running?');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter by category
  const handleCategoryFilter = async (cat) => {
    setCategory(cat);
    setKeyword('');
    setLoading(true);
    setSearched(true);
    try {
      const res = await ProductService.getByCategory(cat);
      setResults(res.data);
      if (res.data.length === 0) {
        toast.info(`No products in category "${cat}"`);
      }
    } catch (err) {
      toast.error('Filter failed. Is Product Service running?');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="page-header">
        <h2>Search Products</h2>
        <p>Search by name or filter by category — connected to Product Service (port 8081)</p>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-input-wrapper" style={{ maxWidth: 500 }}>
          <span className="search-icon"><HiOutlineMagnifyingGlass /></span>
          <input
            type="text"
            placeholder="Search products by name..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
        <motion.button
          className="btn btn-primary"
          onClick={handleSearch}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <HiOutlineMagnifyingGlass /> Search
        </motion.button>
      </div>

      {/* Category Filter Chips */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <HiOutlineFunnel style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            Filter by Category
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <motion.button
              key={cat}
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleCategoryFilter(cat)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat}
            </motion.button>
          ))}
          {category && (
            <motion.button
              className="btn btn-sm btn-danger"
              onClick={() => { setCategory(''); setResults([]); setSearched(false); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Filter
            </motion.button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="spinner-container" style={{ padding: 40 }}>
          <div className="spinner" />
          <p>Searching...</p>
        </div>
      )}

      {/* Results Grid */}
      {!loading && searched && (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
            {results.length} result{results.length !== 1 ? 's' : ''} found
            {keyword && ` for "${keyword}"`}
            {category && ` in ${category}`}
          </p>

          {results.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}>
              <AnimatePresence>
                {results.map((product, i) => (
                  <motion.div
                    key={product.id}
                    className="card"
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    custom={i}
                    whileHover={{ y: -6, boxShadow: '0 10px 30px rgba(99, 102, 241, 0.15)' }}
                    style={{ cursor: 'default' }}
                  >
                    <div style={{ padding: 24 }}>
                      {/* Category badge */}
                      <span className="badge badge-category" style={{ marginBottom: 12, display: 'inline-block' }}>
                        {product.category}
                      </span>

                      {/* Product Name */}
                      <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                        {product.name}
                      </h4>

                      {/* Description */}
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, minHeight: 38 }}>
                        {product.description || 'No description'}
                      </p>

                      {/* Price and Stock */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: 'var(--secondary-light)',
                        }}>
                          ${product.price?.toFixed(2)}
                        </span>
                        <span style={{
                          fontSize: 13,
                          color: product.quantity < 10 ? 'var(--danger)' : 'var(--text-muted)',
                          fontWeight: 600,
                        }}>
                          {product.quantity < 10 ? '⚠️ ' : ''}
                          {product.quantity} in stock
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h4>No results found</h4>
              <p>Try a different keyword or category</p>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!loading && !searched && (
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <div className="empty-icon" style={{ fontSize: 64 }}>🔍</div>
          <h4 style={{ fontSize: 18 }}>Search for products</h4>
          <p>Enter a keyword or select a category to find products</p>
        </div>
      )}
    </motion.div>
  );
}
