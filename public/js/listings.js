// Listings management
class ListingsManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadPageContent();
  }

  setupEventListeners() {
    // Post listing form
    const postForm = document.getElementById('post-form');
    if (postForm) {
      postForm.addEventListener('submit', (e) => this.handleCreateListing(e));
    }

    // Search and filter functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => this.handleCategoryFilter(e.target.value));
    }
  }

  async loadPageContent() {
    const path = window.location.pathname;
    
    try {
      if (path.includes('urban-goods.html')) {
        await this.loadListings({ category: 'Urban Goods' });
      } else if (path.includes('skills-exchange.html')) {
        await this.loadListings({ category: 'Skills Exchange' });
      } else if (path.includes('community-hub.html')) {
        await this.loadListings({ category: 'Community Hub' });
      } else if (path.includes('details.html')) {
        await this.loadListingDetails();
      } else if (path.includes('index.html') || path === '/') {
        await this.loadFeaturedListings();
      }
    } catch (error) {
      console.error('Error loading page content:', error);
    }
  }

  async loadListings(filters = {}) {
    try {
      const response = await ListingsAPI.getAll(filters);
      const container = document.getElementById('feed-container');
      
      if (!container) return;

      if (response.success && response.data.listings.length > 0) {
        container.innerHTML = '';
        response.data.listings.forEach(listing => {
          container.appendChild(this.createListingCard(listing));
        });
      } else {
        container.innerHTML = '<p class="no-listings">No listings found in this category.</p>';
      }
    } catch (error) {
      ApiUtils.handleError(error, 'Failed to load listings');
    }
  }

  async loadFeaturedListings() {
    try {
      const response = await ListingsAPI.getFeatured(6);
      const container = document.getElementById('featured-listings');
      
      if (!container) return;

      if (response.success && response.data.listings.length > 0) {
        container.innerHTML = '';
        response.data.listings.forEach(listing => {
          container.appendChild(this.createListingCard(listing));
        });
      }
    } catch (error) {
      console.error('Error loading featured listings:', error);
    }
  }

  async loadListingDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('id');
    
    if (!listingId) {
      window.location.href = '/index.html';
      return;
    }

    try {
      const response = await ListingsAPI.getById(listingId);
      const container = document.getElementById('listing-details-container');
      
      if (!container) return;

      if (response.success) {
        container.innerHTML = this.createListingDetailsHTML(response.data.listing);
        this.setupListingDetailsEvents(response.data.listing);
      } else {
        container.innerHTML = '<p>Listing not found.</p>';
      }
    } catch (error) {
      ApiUtils.handleError(error, 'Failed to load listing details');
    }
  }

  createListingCard(listing) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = listing.id;

    const categoryColors = {
      'Urban Goods': '#3498db',
      'Skills Exchange': '#e74c3c',
      'Community Hub': '#f1c40f'
    };

    const cardColor = categoryColors[listing.category] || '#3498db';
    const imageUrl = listing.image_url || 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(listing.title);
    const price = ApiUtils.formatPrice(listing.price);

    card.innerHTML = `
      <img src="${imageUrl}" alt="${listing.title}" class="card-image" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
      <div class="card-content">
        <div>
          <h3 class="card-title">${listing.title}</h3>
          <p class="card-description">${listing.description.substring(0, 100)}${listing.description.length > 100 ? '...' : ''}</p>
        </div>
        <div class="card-meta">
          <span>${listing.location}</span>
          <span class="card-price">${price}</span>
        </div>
        <a href="/details.html?id=${listing.id}" class="swap-button" style="background-color: ${cardColor};">View Details</a>
      </div>
    `;

    return card;
  }

  createListingDetailsHTML(listing) {
    const imageUrl = listing.image_url || 'https://via.placeholder.com/800x600?text=' + encodeURIComponent(listing.title);
    const price = ApiUtils.formatPrice(listing.price);
    const ownerPhoto = listing.users?.avatar_url || 'https://via.placeholder.com/100x100?text=' + (listing.users?.full_name?.charAt(0) || 'U');

    return `
      <img src="${imageUrl}" alt="${listing.title}" class="listing-image" onerror="this.src='https://via.placeholder.com/800x600?text=No+Image'">
      <div class="details-content">
        <h1 class="details-title">${listing.title}</h1>
        <p class="details-category-location">
          <span>${listing.category}</span> | <span>${listing.location}</span>
        </p>
        <div class="details-price">
          <strong>Price: ${price}</strong>
        </div>
        <p class="details-description">${listing.description}</p>
        ${listing.swap_preferences ? `<div class="swap-preferences"><strong>Swap Preferences:</strong> ${listing.swap_preferences}</div>` : ''}
        <div class="owner-profile">
          <img src="${ownerPhoto}" alt="${listing.users?.full_name}" class="owner-photo">
          <div>
            <strong>Owner:</strong> <span class="owner-name">${listing.users?.full_name}</span>
            <div class="owner-location">${listing.users?.location}</div>
          </div>
        </div>
        <div class="action-buttons">
          <button class="action-button request-swap-btn" data-listing-id="${listing.id}">Request Swap</button>
          <button class="action-button message-owner-btn" data-owner-id="${listing.user_id}">Message Owner</button>
        </div>
      </div>
    `;
  }

  setupListingDetailsEvents(listing) {
    const requestSwapBtn = document.querySelector('.request-swap-btn');
    const messageOwnerBtn = document.querySelector('.message-owner-btn');

    if (requestSwapBtn) {
      requestSwapBtn.addEventListener('click', () => this.handleSwapRequest(listing));
    }

    if (messageOwnerBtn) {
      messageOwnerBtn.addEventListener('click', () => this.handleMessageOwner(listing));
    }
  }

  async handleCreateListing(e) {
    e.preventDefault();
    
    if (!AuthAPI.isAuthenticated()) {
      ApiUtils.showNotification('Please login to create a listing', 'warning');
      return;
    }

    const formData = new FormData(e.target);
    
    try {
      const response = await ListingsAPI.create(formData);
      if (response.success) {
        ApiUtils.showNotification('Listing created successfully!', 'success');
        e.target.reset();
        setTimeout(() => {
          window.location.href = '/profile.html';
        }, 1500);
      }
    } catch (error) {
      ApiUtils.handleError(error, 'Failed to create listing');
    }
  }

  async handleSwapRequest(listing) {
    if (!AuthAPI.isAuthenticated()) {
      ApiUtils.showNotification('Please login to request a swap', 'warning');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
      return;
    }

    // Create a simple modal for swap request
    const modal = this.createSwapRequestModal(listing);
    document.body.appendChild(modal);
  }

  createSwapRequestModal(listing) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
      <div class="modal-content">
        <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
        <h2>Request Swap</h2>
        <p>Send a swap request for: <strong>${listing.title}</strong></p>
        <form id="swap-request-form">
          <div class="form-group">
            <label for="offer-type">What are you offering?</label>
            <select id="offer-type" name="offer_type" required>
              <option value="">Select offer type</option>
              <option value="item">Item</option>
              <option value="service">Service</option>
              <option value="money">Money</option>
              <option value="experience">Experience</option>
            </select>
          </div>
          <div class="form-group">
            <label for="offer-details">Offer Details</label>
            <textarea id="offer-details" name="offer_details" rows="3" placeholder="Describe what you're offering..." required></textarea>
          </div>
          <div class="form-group">
            <label for="swap-message">Message (Optional)</label>
            <textarea id="swap-message" name="message" rows="3" placeholder="Add a personal message..."></textarea>
          </div>
          <div class="modal-buttons">
            <button type="submit" class="modal-btn btn-primary">Send Request</button>
            <button type="button" class="modal-btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;

    const form = modal.querySelector('#swap-request-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const swapData = {
        listing_id: listing.id,
        offer_type: formData.get('offer_type'),
        offer_details: formData.get('offer_details'),
        message: formData.get('message')
      };

      try {
        const response = await SwapsAPI.create(swapData);
        if (response.success) {
          ApiUtils.showNotification('Swap request sent successfully!', 'success');
          modal.remove();
        }
      } catch (error) {
        ApiUtils.handleError(error, 'Failed to send swap request');
      }
    });

    return modal;
  }

  handleMessageOwner(listing) {
    if (!AuthAPI.isAuthenticated()) {
      ApiUtils.showNotification('Please login to message the owner', 'warning');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
      return;
    }

    // For now, show a simple alert. In a real app, this would open a messaging interface
    ApiUtils.showNotification('Messaging feature coming soon!', 'info');
  }

  async handleSearch(query) {
    if (query.length < 2) {
      this.loadPageContent();
      return;
    }

    try {
      const response = await ListingsAPI.getAll({ search: query });
      const container = document.getElementById('feed-container');
      
      if (!container) return;

      if (response.success && response.data.listings.length > 0) {
        container.innerHTML = '';
        response.data.listings.forEach(listing => {
          container.appendChild(this.createListingCard(listing));
        });
      } else {
        container.innerHTML = '<p class="no-listings">No listings found matching your search.</p>';
      }
    } catch (error) {
      ApiUtils.handleError(error, 'Search failed');
    }
  }

  async handleCategoryFilter(category) {
    const filters = category ? { category } : {};
    await this.loadListings(filters);
  }
}

// Initialize listings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.listingsManager = new ListingsManager();
});

// Export for use in other files
window.ListingsManager = ListingsManager;