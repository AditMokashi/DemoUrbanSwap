// Function to handle login state and update the navigation bar
function updateNavigation() {
    const mainNav = document.getElementById('main-nav');
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

    if (mainNav) {
        mainNav.innerHTML = '';
        const navLinks = [
            { text: 'Home', href: 'index.html' },
            { text: 'Urban Goods', href: 'urban-goods.html' },
            { text: 'Skills Exchange', href: 'skills-exchange.html' },
            { text: 'Community Hub', href: 'community-hub.html' },
        ];

        navLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;
            if (window.location.pathname.endsWith(link.href)) {
                a.classList.add('active');
            }
            mainNav.appendChild(a);
        });

        if (isLoggedIn) {
            const profileLink = document.createElement('a');
            profileLink.href = 'profile.html';
            profileLink.textContent = 'Profile';
            if (window.location.pathname.endsWith('profile.html')) {
                profileLink.classList.add('active');
            }
            mainNav.appendChild(profileLink);

            const postLink = document.createElement('a');
            postLink.href = 'post.html';
            postLink.textContent = 'Post Swap';
            if (window.location.pathname.endsWith('post.html')) {
                postLink.classList.add('active');
            }
            mainNav.appendChild(postLink);

            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.textContent = 'Log Out';
            logoutLink.addEventListener('click', () => {
                localStorage.removeItem('loggedIn');
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            });
            mainNav.appendChild(logoutLink);
        } else {
            const loginLink = document.createElement('a');
            loginLink.href = 'login.html';
            loginLink.textContent = 'Log In';
            if (window.location.pathname.endsWith('login.html')) {
                loginLink.classList.add('active');
            }
            mainNav.appendChild(loginLink);
        }
    }
}

// Listing Data (simulated database)
const listings = [
    // Urban Goods
    { id: 1, type: 'Urban Goods', title: 'Vintage Camera', description: 'A classic film camera in great condition.', location: 'Navi Mumbai', image: 'https://via.placeholder.com/400x200?text=Vintage+Camera', rating: 4.5, featured: true, value: '₹5000' },
    { id: 2, type: 'Urban Goods', title: 'Book Collection', description: 'Collection of sci-fi novels.', location: 'Mumbai', image: 'https://via.placeholder.com/400x200?text=Book+Collection', rating: 4.2, value: '₹1500' },
    { id: 3, type: 'Urban Goods', title: 'Gardening Tools', description: 'Complete set for a new garden.', location: 'Navi Mumbai', image: 'https://via.placeholder.com/400x200?text=Gardening+Tools', rating: 4.7, value: '₹2500' },
    
    // Skills Exchange
    { id: 4, type: 'Skills Exchange', title: 'Graphic Design', description: 'Custom logo and branding design.', location: 'Mumbai', image: 'https://via.placeholder.com/400x200?text=Graphic+Design', rating: 5.0, featured: true, value: 'Negotiable' },
    { id: 5, type: 'Skills Exchange', title: 'Pottery Workshop', description: 'A fun two-hour pottery workshop.', location: 'Navi Mumbai', image: 'https://via.placeholder.com/400x200?text=Pottery+Workshop', rating: 4.8, value: 'Negotiable' },
    { id: 6, type: 'Skills Exchange', title: 'Personal Training', description: 'One-on-one fitness coaching.', location: 'Mumbai', image: 'https://via.placeholder.com/400x200?text=Personal+Trainer', rating: 4.9, value: 'Negotiable' },
    
    // Community Hub
    { id: 7, type: 'Community Hub', title: 'Local Park Cleanup', description: 'Join us to clean up the local park. All volunteers welcome!', location: 'Navi Mumbai', image: 'https://via.placeholder.com/400x200?text=Park+Cleanup', value: 'Free' },
    { id: 8, type: 'Community Hub', title: 'Neighborhood Potluck', description: 'Bring a dish and meet your neighbors.', location: 'Mumbai', image: 'https://via.placeholder.com/400x200?text=Potluck', value: 'Free' },
];

// Function to create a listing card
function createCard(listing) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = listing.id;

    // Determine the color based on the new types
    let cardColor;
    if (listing.type === 'Urban Goods') {
        cardColor = 'var(--urban-goods-color)';
    } else if (listing.type === 'Skills Exchange') {
        cardColor = 'var(--skills-exchange-color)';
    } else if (listing.type === 'Community Hub') {
        cardColor = 'var(--community-hub-color)';
    }
    
    // Check for a value to display
    const valueHtml = listing.value ? `<span class="card-value">${listing.value}</span>` : '';

    card.innerHTML = `
        <img src="${listing.image}" alt="${listing.title}" class="card-image">
        <div class="card-content">
            <div>
                <h3 class="card-title">${listing.title}</h3>
                <p class="card-description">${listing.description}</p>
            </div>
            <div class="card-meta">
                <span>${listing.location}</span>
                ${valueHtml}
            </div>
            <a href="details.html?id=${listing.id}" class="swap-button" style="background-color: ${cardColor};">View Details</a>
        </div>
    `;
    return card;
}

// Function to render listings
function renderListings(type, container) {
    if (!container) return;
    container.innerHTML = '';
    
    const filteredListings = listings.filter(l => l.type === type);
    
    if (filteredListings.length === 0) {
        container.innerHTML = '<p class="no-listings">No listings found in this category.</p>';
    } else {
        filteredListings.forEach(listing => {
            container.appendChild(createCard(listing));
        });
    }
}

// Event listener for all page loads
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();

    // Check which page we are on and render the content
    const page = window.location.pathname.split('/').pop();
    
    if (page === 'urban-goods.html') {
        const container = document.getElementById('feed-container');
        renderListings('Urban Goods', container);
    } else if (page === 'skills-exchange.html') {
        const container = document.getElementById('feed-container');
        renderListings('Skills Exchange', container);
    } else if (page === 'community-hub.html') {
        const container = document.getElementById('feed-container');
        renderListings('Community Hub', container);
    } else if (page === 'index.html' || page === '') {
        // Renders all featured and all listings on the home page
        const feedContainer = document.getElementById('feed-container');
        const allListings = [...listings].sort(() => Math.random() - 0.5); // Shuffle for a dynamic feed
        renderListings('Urban Goods', feedContainer); // Example: just render goods on the home feed for now
        // Note: For a real app, you'd combine all categories here
    }
});