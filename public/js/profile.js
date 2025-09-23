// Profile management
class ProfileManager {
  constructor() {
    this.init();
  }

  init() {
    if (!window.authManager?.requireAuth()) {
      return;
    }
    
    this.setupEventListeners();
    this.loadProfileData();
  }

  setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => this.switchTab(button.dataset.tab));
    });

    // Profile update form
    const profileForm = document.getElementById('profile-update-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    }
  }

  async loadProfileData() {
    try {
      // Load user profile
      const profileResponse = await AuthAPI.getProfile();
      if (profileResponse.success) {
        this.displayUserProfile(profileResponse.data.user);
      }

      // Load user listings
      const listingsResponse = await ListingsAPI.getUserListings();
      if (listingsResponse.success) {
        this.displayUserListings(listingsResponse.data.listings);
      }

      // Load user swaps
      const swapsResponse = await SwapsAPI.getAll();
      if (swapsResponse.success) {
        this.displayUserSwaps(swapsResponse.data.swaps);
      }

    } catch (error) {
      ApiUtils.handleError(error, 'Failed to load profile data');
    }
  }

  displayUserProfile(user) {
    // Update profile sidebar
    const profilePhoto = document.querySelector('.profile-photo');
    const username = document.querySelector('.username');
    const bio = document.querySelector('.bio');
    const userPoints = document.getElementById('user-points');

    if (profilePhoto) {
      profilePhoto.src = user.avatar_url || `https://via.placeholder.com/150x150?text=${user.full_name.charAt(0)}`;
      profilePhoto.alt = user.full_name;
    }

    if (username) {
      username.textContent = user.full_name;
    }

    if (bio) {
      bio.textContent = `Member since ${ApiUtils.formatDate(user.created_at)} • ${user.location}`;
    }

    if (userPoints) {
      userPoints.textContent = user.points || 0;
    }

    // Update any profile forms
    this.populateProfileForm(user);
  }

  populateProfileForm(user) {
    const form = document.getElementById('profile-update-form');
    if (!form) return;

    const fields = ['full_name', 'email', 'location', 'phone'];
    fields.forEach(field => {
      const input = form.querySelector(`[name="${field}"]`);
      if (input && user[field]) {
        input.value = user[field];
      }
    });
  }

  displayUserListings(listings) {
    const container = document.querySelector('#my-listings .listing-grid');
    if (!container) return;

    container.innerHTML = '';

    if (listings.length === 0) {
      container.innerHTML = '<p class="no-listings">You haven\'t created any listings yet.</p>';
      return;
    }

    listings.forEach(listing => {
      const listingElement = this.createUserListingElement(listing);
      container.appendChild(listingElement);
    });
  }

  createUserListingElement(listing) {
    const element = document.createElement('div');
    element.className = 'user-listing-card';
    
    const statusClass = `status-${listing.status.toLowerCase()}`;
    const imageUrl = listing.image_url || 'https://via.placeholder.com/200x150?text=' + encodeURIComponent(listing.title);
    
    element.innerHTML = `
      <div class="listing-image">
        <img src="${imageUrl}" alt="${listing.title}" onerror="this.src='https://via.placeholder.com/200x150?text=No+Image'">
        <div class="listing-status ${statusClass}">${listing.status}</div>
      </div>
      <div class="listing-content">
        <h4>${listing.title}</h4>
        <p>${listing.description.substring(0, 80)}${listing.description.length > 80 ? '...' : ''}</p>
        <div class="listing-meta">
          <span>${listing.category}</span>
          <span>${ApiUtils.formatDate(listing.created_at)}</span>
        </div>
        <div class="listing-actions">
          <button class="btn-edit" data-id="${listing.id}">Edit</button>
          <button class="btn-delete" data-id="${listing.id}">Delete</button>
          <a href="/details.html?id=${listing.id}" class="btn-view">View</a>
        </div>
      </div>
    `;

    // Add event listeners for actions
    const editBtn = element.querySelector('.btn-edit');
    const deleteBtn = element.querySelector('.btn-delete');

    editBtn.addEventListener('click', () => this.handleEditListing(listing.id));
    deleteBtn.addEventListener('click', () => this.handleDeleteListing(listing.id));

    return element;
  }

  displayUserSwaps(swaps) {
    const container = document.querySelector('#my-swaps .swap-list');
    if (!container) return;

    container.innerHTML = '';

    if (swaps.length === 0) {
      container.innerHTML = '<p class="no-swaps">You don\'t have any swaps yet.</p>';
      return;
    }

    swaps.forEach(swap => {
      const swapElement = this.createUserSwapElement(swap);
      container.appendChild(swapElement);
    });
  }

  createUserSwapElement(swap) {
    const element = document.createElement('div');
    element.className = 'list-item swap-item';
    
    const statusClass = `status-${swap.status.toLowerCase()}`;
    const isRequester = swap.requester.id === swap.requester_id; // This would need to be checked against current user
    const otherUser = isRequester ? swap.owner : swap.requester;
    const role = isRequester ? 'Requested' : 'Received request for';
    
    element.innerHTML = `
      <div class="swap-details">
        <div class="swap-title">
          <strong>${role}: ${swap.listing.title}</strong>
        </div>
        <div class="swap-meta">
          <span>With: ${otherUser.full_name}</span>
          <span>Offer: ${swap.offer_type} - ${swap.offer_details}</span>
          <span>Date: ${ApiUtils.formatDate(swap.created_at)}</span>
        </div>
        ${swap.message ? `<div class="swap-message">"${swap.message}"</div>` : ''}
      </div>
      <div class="swap-actions">
        <span class="swap-status ${statusClass}">${swap.status}</span>
        ${this.getSwapActionButtons(swap)}
      </div>
    `;

    return element;
  }

  getSwapActionButtons(swap) {
    const currentUserId = 'current-user-id'; // This would come from auth state
    let buttons = '';

    if (swap.status === 'pending') {
      if (swap.owner_id === currentUserId) {
        buttons = `
          <button class="btn-accept" data-swap-id="${swap.id}">Accept</button>
          <button class="btn-reject" data-swap-id="${swap.id}">Reject</button>
        `;
      } else {
        buttons = `<button class="btn-cancel" data-swap-id="${swap.id}">Cancel</button>`;
      }
    } else if (swap.status === 'accepted') {
      buttons = `<button class="btn-complete" data-swap-id="${swap.id}">Mark Complete</button>`;
    }

    return buttons;
  }

  switchTab(tabId) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
  }

  async handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const profileData = {
      full_name: formData.get('full_name'),
      location: formData.get('location'),
      phone: formData.get('phone')
    };

    try {
      const response = await AuthAPI.updateProfile(profileData);
      if (response.success) {
        ApiUtils.showNotification('Profile updated successfully!', 'success');
        this.displayUserProfile(response.data.user);
      }
    } catch (error) {
      ApiUtils.handleError(error, 'Failed to update profile');
    }
  }

  async handleEditListing(listingId) {
    // For now, redirect to edit page (would be implemented)
    ApiUtils.showNotification('Edit functionality coming soon!', 'info');
  }

  async handleDeleteListing(listingId) {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const response = await ListingsAPI.delete(listingId);
      if (response.success) {
        ApiUtils.showNotification('Listing deleted successfully!', 'success');
        this.loadProfileData(); // Reload to update the display
      }
    } catch (error) {
      ApiUtils.handleError(error, 'Failed to delete listing');
    }
  }

  async handleSwapAction(swapId, action) {
    try {
      const response = await SwapsAPI.updateStatus(swapId, action);
      if (response.success) {
        ApiUtils.showNotification(`Swap ${action} successfully!`, 'success');
        this.loadProfileData(); // Reload to update the display
      }
    } catch (error) {
      ApiUtils.handleError(error, `Failed to ${action} swap`);
    }
  }
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('profile.html')) {
    window.profileManager = new ProfileManager();
  }
});

// Export for use in other files
window.ProfileManager = ProfileManager;