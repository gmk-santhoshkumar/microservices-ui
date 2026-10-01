import axios from 'axios';

// ==========================================
// Product Service API (Port 8081)
// Proxied via Vite → /api/products
// ==========================================

const productApi = axios.create({
  baseURL: '/api/products',
  headers: { 'Content-Type': 'application/json' },
});

export const ProductService = {
  // GET /api/products - Get all products
  getAll: () => productApi.get(''),

  // GET /api/products/{id} - Get product by ID
  getById: (id) => productApi.get(`/${id}`),

  // POST /api/products - Create a new product
  create: (product) => productApi.post('', product),

  // PUT /api/products/{id} - Update a product
  update: (id, product) => productApi.put(`/${id}`, product),

  // DELETE /api/products/{id} - Delete a product
  delete: (id) => productApi.delete(`/${id}`),

  // GET /api/products/category/{category} - Filter by category
  getByCategory: (category) => productApi.get(`/category/${category}`),

  // GET /api/products/search?keyword=xxx - Search by name
  search: (keyword) => productApi.get('/search', { params: { keyword } }),

  // PUT /api/products/{id}/reduce-quantity?quantity=n - Reduce stock
  reduceQuantity: (id, quantity) =>
    productApi.put(`/${id}/reduce-quantity`, null, { params: { quantity } }),
};

// ==========================================
// Order Service API (Port 8082)
// Proxied via Vite → /api/orders
// ==========================================

const orderApi = axios.create({
  baseURL: '/api/orders',
  headers: { 'Content-Type': 'application/json' },
});

export const OrderService = {
  // POST /api/orders/feign - Place order via Feign Client
  placeWithFeign: (order) => orderApi.post('/feign', order),

  // POST /api/orders/webclient - Place order via WebClient
  placeWithWebClient: (order) => orderApi.post('/webclient', order),

  // GET /api/orders - Get all orders
  getAll: () => orderApi.get(''),

  // GET /api/orders/{id} - Get order by ID
  getById: (id) => orderApi.get(`/${id}`),

  // PUT /api/orders/{id}/cancel - Cancel an order
  cancel: (id) => orderApi.put(`/${id}/cancel`),

  // DELETE /api/orders/{id} - Delete an order
  delete: (id) => orderApi.delete(`/${id}`),
};
