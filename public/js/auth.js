// Authentication management
class AuthManager {
  constructor() {
    this.init();
  }

  init() {
    this.updateUI();
    this.setupEventListeners();
  }

  updateUI() {
    const isAuthenticated = AuthAPI.isAuthenticated();
    const navElements = document.querySelectorAll('[data-auth]');
    
    navElements.forEach(element => {
      const authType = element.dataset.auth;
      
      if (authType === 'required' && !isAuthenticated) {
        element.style.display = 'none';
      } else if (authType === 'guest' && isAuthenticated) {
        element.style.display = 'none';
      } else {
        element.style.display = '';
      }
    });

    // Update navigation
    this.updateNavigation();
  }

  updateNavigation() {
    const mainNav = document.getElementById('main-nav');
    if (!mainNav) return;

    const isAuthenticated = AuthAPI.isAuthenticated();
    mainNav.innerHTML = '';

    const navLinks = [
      { text: 'Home', href: '/index.html' },
      { text: 'Urban Goods', href: '/urban-goods.html' },
      { text: 'Skills Exchange', href: '/skills-exchange.html' },
      { text: 'Community Hub', href: '/community-hub.html' }
    ];

    navLinks.forEach(link => {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.text;
      if (window.location.pathname.endsWith(link.href.substring(1))) {
        a.classList.add('active');
      }
      mainNav.appendChild(a);
    });

    if (isAuthenticated) {
      // Add authenticated user links
      const profileLink = document.createElement('a');
      profileLink.href = '/profile.html';
      profileLink.textContent = 'Profile';
      if (window.location.pathname.endsWith('profile.html')) {
        profileLink.classList.add('active');
      }
      mainNav.appendChild(profileLink);

      const postLink = document.createElement('a');
      postLink.href = '/post.html';
      postLink.textContent = 'Post Swap';
      if (window.location.pathname.endsWith('post.html')) {
        postLink.classList.add('active');
      }
      mainNav.appendChild(postLink);

      const logoutLink = document.createElement('a');
      logoutLink.href = '#';
      logoutLink.textContent = 'Logout';
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
      mainNav.appendChild(logoutLink);
    } else {
      // Add guest links
      const loginLink = document.createElement('a');
      loginLink.href = '/login.html';
      loginLink.textContent = 'Login';
      if (window.location.pathname.endsWith('login.html')) {
        loginLink.classList.add('active');
      }
      mainNav.appendChild(loginLink);
    }
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Registration form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Modal forms
    const loginModalForm = document.getElementById('loginForm');
    if (loginModalForm) {
      loginModalForm.addEventListener('submit', (e) => this.handleModalLogin(e));
    }

    const signupModalForm = document.getElementById('signupForm');
    if (signupModalForm) {
      signupModalForm.addEventListener('submit', (e) => this.handleModalSignup(e));
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
      email: formData.get('email') || formData.get('username'), // Support both email and username fields
      password: formData.get('password')
    };

    try {
      const response = await AuthAPI.login(credentials);
      if (response.success) {
        ApiUtils.showNotification('Login successful!', 'success');
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1000);
      }
    } catch (error) {
      ApiUtils.handleError(error, 'Login failed');
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      email: formData.get('email'),
      password: formData.get('password'),
      full_name: formData.get('full_name'),
      location: formData.get('location'),
      phone: formData.get('phone')
    };

    try {
      const response = await AuthAPI.register(userData);
      if (response.success) {
        ApiUtils.showNotification('Registration successful!', 'success');
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1000);
      }
    } catch (error) {
      ApiUtils.handleError(error, 'Registration failed');
    }
  }

  async handleModalLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await AuthAPI.login({ email, password });
      if (response.success) {
        ApiUtils.showNotification('Welcome back!', 'success');
        this.closeModal('loginModal');
        this.updateUI();
      }
    } catch (error) {
      ApiUtils.handleError(error, 'Login failed');
    }
  }

  async handleModalSignup(e) {
    e.preventDefault();
    const userData = {
      full_name: document.getElementById('fullName').value,
      email: document.getElementById('signupEmail').value,
      password: document.getElementById('signupPassword').value,
      location: document.getElementById('location').value
    };

    try {
      const response = await AuthAPI.register(userData);
      if (response.success) {
        ApiUtils.showNotification('Welcome to UrbanSwap!', 'success');
        this.closeModal('signupModal');
        this.updateUI();
      }
    } catch (error) {
      ApiUtils.handleError(error, 'Registration failed');
    }
  }

  async logout() {
    try {
      await AuthAPI.logout();
      ApiUtils.showNotification('Logged out successfully', 'success');
      this.updateUI();
    } catch (error) {
      ApiUtils.handleError(error, 'Logout failed');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Check if user needs to be authenticated for current page
  requireAuth() {
    if (!AuthAPI.isAuthenticated()) {
      ApiUtils.showNotification('Please login to access this page', 'warning');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
      return false;
    }
    return true;
  }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
});

// Export for use in other files
window.AuthManager = AuthManager;