// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Token management
const TokenManager = {
  get: () => localStorage.getItem('urbanswap_token'),
  set: (token) => localStorage.setItem('urbanswap_token', token),
  remove: () => localStorage.removeItem('urbanswap_token'),
  isValid: () => {
    const token = TokenManager.get();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
};

// HTTP Client
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = TokenManager.get();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (token && TokenManager.isValid()) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  async uploadFile(endpoint, formData) {
    const token = TokenManager.get();
    const config = {
      method: 'POST',
      body: formData
    };

    if (token && TokenManager.isValid()) {
      config.headers = {
        Authorization: `Bearer ${token}`
      };
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  }
}

// API Service
const api = new ApiClient();

// Auth API
const AuthAPI = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.success && response.data.token) {
      TokenManager.set(response.data.token);
    }
    return response;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.success && response.data.token) {
      TokenManager.set(response.data.token);
    }
    return response;
  },

  async logout() {
    TokenManager.remove();
    window.location.href = '/';
  },

  async getProfile() {
    return api.get('/auth/profile');
  },

  async updateProfile(profileData) {
    return api.put('/auth/profile', profileData);
  },

  isAuthenticated() {
    return TokenManager.isValid();
  }
};

// Listings API
const ListingsAPI = {
  async getAll(filters = {}) {
    return api.get('/listings', filters);
  },

  async getById(id) {
    return api.get(`/listings/${id}`);
  },

  async getFeatured(limit = 6) {
    return api.get('/listings/featured', { limit });
  },

  async getUserListings() {
    return api.get('/listings/user/my-listings');
  },

  async create(listingData) {
    if (listingData instanceof FormData) {
      return api.uploadFile('/listings', listingData);
    }
    return api.post('/listings', listingData);
  },

  async update(id, listingData) {
    if (listingData instanceof FormData) {
      return api.uploadFile(`/listings/${id}`, listingData);
    }
    return api.put(`/listings/${id}`, listingData);
  },

  async delete(id) {
    return api.delete(`/listings/${id}`);
  }
};

// Swaps API
const SwapsAPI = {
  async getAll() {
    return api.get('/swaps');
  },

  async getById(id) {
    return api.get(`/swaps/${id}`);
  },

  async create(swapData) {
    return api.post('/swaps', swapData);
  },

  async updateStatus(id, status) {
    return api.put(`/swaps/${id}/status`, { status });
  }
};

// Utility functions
const ApiUtils = {
  handleError(error, defaultMessage = 'An error occurred') {
    console.error('API Error:', error);
    
    if (error.message.includes('token') || error.message.includes('unauthorized')) {
      TokenManager.remove();
      window.location.href = '/login.html';
      return;
    }
    
    const message = error.message || defaultMessage;
    this.showNotification(message, 'error');
  },

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '10000',
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });

    // Set background color based on type
    const colors = {
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  },

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  formatPrice(price) {
    if (!price) return 'Negotiable';
    if (price.toLowerCase().includes('free')) return 'Free';
    if (!price.includes('₹')) return `₹${price}`;
    return price;
  }
};

// Export for use in other files
window.AuthAPI = AuthAPI;
window.ListingsAPI = ListingsAPI;
window.SwapsAPI = SwapsAPI;
window.ApiUtils = ApiUtils;
window.TokenManager = TokenManager;