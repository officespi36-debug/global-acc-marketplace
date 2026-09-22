const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('accglobal_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password, role) => request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, role }) }),
  demoLogin: (role) => request('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),
  getMe: () => request('/auth/me'),
  submitKYC: (details) => request('/auth/kyc', { method: 'POST', body: JSON.stringify(details) }),

  // Accounts
  getListings: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'All') query.append(k, v);
    });
    return request(`/accounts?${query.toString()}`);
  },
  getCategoriesSummary: () => request('/accounts/categories/summary'),
  getListingById: (id) => request(`/accounts/${id}`),
  createListing: (data) => request('/accounts', { method: 'POST', body: JSON.stringify(data) }),

  // Orders & Escrow
  createOrder: (listingId, paymentMethod) => request('/orders', { method: 'POST', body: JSON.stringify({ listingId, paymentMethod }) }),
  getMyOrders: () => request('/orders/my-orders'),
  getSellerSales: () => request('/orders/seller-sales'),
  confirmAndReleaseEscrow: (id) => request(`/orders/${id}/confirm`, { method: 'PUT' }),
  reportDispute: (id, reason, evidenceDescription) => request(`/orders/${id}/dispute`, { method: 'POST', body: JSON.stringify({ reason, evidenceDescription }) }),

  // Wallet
  getWallet: () => request('/wallet'),
  depositFunds: (amount, method) => request('/wallet/deposit', { method: 'POST', body: JSON.stringify({ amount, method }) }),
  withdrawFunds: (amount, payoutAddress, method) => request('/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount, payoutAddress, method }) }),

  // Reviews
  addReview: (orderId, rating, comment) => request('/reviews', { method: 'POST', body: JSON.stringify({ orderId, rating, comment }) }),
  getReviews: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reviews?${query}`);
  },

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getPendingListings: () => request('/admin/pending-listings'),
  updateListingStatus: (id, status) => request(`/admin/listings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getDisputes: () => request('/disputes'),
  resolveDispute: (id, resolution, adminDecision) => request(`/disputes/${id}/resolve`, { method: 'PUT', body: JSON.stringify({ resolution, adminDecision }) }),
  getUsers: () => request('/admin/users'),
  toggleBanUser: (id) => request(`/admin/users/${id}/ban`, { method: 'PUT' }),
  toggleVerifyKYC: (id, kycStatus) => request(`/admin/users/${id}/kyc`, { method: 'PUT', body: JSON.stringify({ kycStatus }) })
};
