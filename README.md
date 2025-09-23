# UrbanSwap - Community Marketplace Platform

A modern, full-stack community marketplace platform where neighbors can swap items, exchange skills, and participate in community events.

## 🚀 Features

### Frontend
- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Category-based Browsing**: Urban Goods, Skills Exchange, Community Hub
- **User Authentication**: Secure login/registration system
- **Real-time Search**: Dynamic filtering and search functionality
- **Responsive Design**: Mobile-first approach with desktop optimization

### Backend
- **RESTful API**: Express.js with proper error handling
- **Authentication**: JWT-based authentication system
- **Database**: Supabase PostgreSQL with Row Level Security
- **File Uploads**: Image upload with validation and storage
- **Security**: Helmet, CORS, rate limiting, input validation

### Database Schema
- **Users**: Profile management with points system
- **Listings**: Items, services, and community events
- **Swaps**: Request and transaction management
- **Security**: Row Level Security (RLS) policies

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive design with CSS Grid and Flexbox
- Modern animations and micro-interactions

### Backend
- Node.js with Express.js
- JWT for authentication
- Multer for file uploads
- Helmet for security headers
- Express Rate Limit for API protection

### Database
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Automated migrations

### Development Tools
- Nodemon for development
- Concurrently for running multiple processes
- Environment-based configuration

## 📁 Project Structure

```
urbanswap/
├── server/                 # Backend application
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Helper functions
│   ├── config/            # Configuration files
│   └── index.js           # Server entry point
├── public/                # Frontend files
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── images/            # Static images
│   └── pages/             # HTML pages
├── database/              # Database migrations
│   └── migrations/        # SQL migration files
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
└── README.md             # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd urbanswap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   CLIENT_URL=http://localhost:3001
   ```

4. **Set up Supabase Database**
   
   Run the migration files in your Supabase SQL editor:
   - `database/migrations/create_users_table.sql`
   - `database/migrations/create_listings_table.sql`
   - `database/migrations/create_swaps_table.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:3000`
   - Frontend server on `http://localhost:3001`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Listings Endpoints
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/featured` - Get featured listings
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing (protected)
- `PUT /api/listings/:id` - Update listing (protected)
- `DELETE /api/listings/:id` - Delete listing (protected)
- `GET /api/listings/user/my-listings` - Get user's listings (protected)

### Swaps Endpoints
- `GET /api/swaps` - Get user's swaps (protected)
- `GET /api/swaps/:id` - Get single swap (protected)
- `POST /api/swaps` - Create swap request (protected)
- `PUT /api/swaps/:id/status` - Update swap status (protected)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: File type and size validation
- **CORS Protection**: Configured for specific origins
- **Helmet Security**: Security headers for Express
- **Row Level Security**: Database-level access control

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Modern Animations**: Smooth transitions and micro-interactions
- **Dark Theme Support**: Modern color scheme
- **Loading States**: User feedback during API calls
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback system

## 🔧 Development Scripts

```bash
npm run dev        # Start both frontend and backend in development
npm run server     # Start only the backend server
npm run client     # Start only the frontend server
npm start          # Start production server
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to your preferred platform (Heroku, Railway, etc.)
3. Ensure database migrations are run

### Frontend Deployment
1. Update API endpoints in frontend code
2. Deploy static files to CDN or static hosting
3. Configure CORS for production domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@urbanswap.com or create an issue in the repository.

## 🎯 Roadmap

- [ ] Real-time messaging system
- [ ] Mobile app development
- [ ] Payment integration
- [ ] Advanced search with geolocation
- [ ] Social features and user ratings
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Multi-language support

---

Built with ❤️ for community-driven sharing economy