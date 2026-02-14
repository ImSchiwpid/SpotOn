# 🚗 SPOT-ON - Shared Parking Platform

A full-stack MERN web application for shared parking space management with real-time updates, payment integration, and geolocation features.

## 🎯 Features

### Core Functionality
- ✅ **User Authentication** - Email/Password and Google OAuth
- ✅ **Parking Spot Management** - Add, edit, delete parking spots
- ✅ **Real-time Search** - Dynamic map-based search with filters
- ✅ **Booking System** - Complete booking flow with payment
- ✅ **Payment Integration** - Razorpay payment gateway
- ✅ **Email Notifications** - SendGrid email service
- ✅ **Wallet System** - Track earnings from parking rentals
- ✅ **Car Management** - Add and manage vehicles
- ✅ **Admin Dashboard** - Analytics and user management
- ✅ **Real-time Updates** - Socket.io for live slot updates
- ✅ **Image Upload** - Cloudinary integration

## 🛠 Tech Stack

### Backend
- **Framework**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + Passport (Google OAuth)
- **Payment**: Razorpay
- **Email**: SendGrid
- **Storage**: Cloudinary
- **Real-time**: Socket.io
- **Security**: bcrypt, express-validator, rate-limit

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **State Management**: React Hooks + Context API
- **Maps**: React-Leaflet
- **Animations**: Framer Motion
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Real-time**: Socket.io Client

## 📁 Project Structure

```
spot-on-parking/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── database.js
│   │   └── passport.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── parkingController.js
│   │   ├── bookingController.js
│   │   ├── carController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── User.js
│   │   ├── ParkingSpot.js
│   │   ├── Booking.js
│   │   ├── Car.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── parkingRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── carRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── sendEmail.js
│   │   └── jwtToken.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Razorpay account (test mode)
- SendGrid account
- Cloudinary account
- Google OAuth credentials (optional)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file** (copy from .env.example)
```bash
cp .env.example .env
```

4. **Configure environment variables in .env**
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spoton

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@spoton.com
SENDGRID_FROM_NAME=SPOT-ON Parking

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Session
SESSION_SECRET=your_session_secret
```

5. **Start backend server**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxx
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. **Start frontend dev server**
```bash
npm start
```

App will run on `http://localhost:3000`

## 📋 Service Configuration

### 1. MongoDB Atlas Setup
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Add database user
4. Whitelist IP (0.0.0.0/0 for development)
5. Get connection string and add to .env

### 2. Razorpay Setup
1. Create account at https://razorpay.com
2. Navigate to Settings > API Keys
3. Generate Test Keys
4. Add Key ID and Secret to .env

### 3. SendGrid Setup
1. Create account at https://sendgrid.com
2. Navigate to Settings > API Keys
3. Create API Key with Full Access
4. Verify sender email
5. Add API Key to .env

### 4. Cloudinary Setup
1. Create account at https://cloudinary.com
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Add to .env

### 5. Google OAuth Setup (Optional)
1. Go to Google Cloud Console
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Copy Client ID and Secret to .env

## 🔑 Test Credentials

### Admin Account
```
Email: admin@spoton.com
Password: admin123
```

### Regular User
```
Email: user@test.com
Password: user123
```

### Razorpay Test Card
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date
```

## 📡 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/profile` - Update profile
- PUT `/api/auth/password` - Update password
- GET `/api/auth/google` - Google OAuth
- GET `/api/auth/google/callback` - OAuth callback

### Parking Spots
- GET `/api/parking` - Get all parking spots (with filters)
- GET `/api/parking/cities` - Get available cities
- GET `/api/parking/:id` - Get single parking spot
- POST `/api/parking` - Create parking spot (Protected)
- PUT `/api/parking/:id` - Update parking spot (Protected)
- DELETE `/api/parking/:id` - Delete parking spot (Protected)
- GET `/api/parking/my/spots` - Get my parking spots (Protected)

### Bookings
- POST `/api/bookings` - Create booking (Protected)
- POST `/api/bookings/verify-payment` - Verify payment (Protected)
- GET `/api/bookings/my` - Get my bookings (Protected)
- GET `/api/bookings/:id` - Get booking details (Protected)
- PUT `/api/bookings/:id/cancel` - Cancel booking (Protected)
- GET `/api/bookings` - Get all bookings (Admin)

### Cars
- GET `/api/cars` - Get my cars (Protected)
- POST `/api/cars` - Add car (Protected)
- GET `/api/cars/:id` - Get car details (Protected)
- PUT `/api/cars/:id` - Update car (Protected)
- DELETE `/api/cars/:id` - Delete car (Protected)
- PUT `/api/cars/:id/default` - Set default car (Protected)

### Admin
- GET `/api/admin/dashboard` - Get dashboard stats (Admin)
- GET `/api/admin/users` - Get all users (Admin)
- PUT `/api/admin/users/:id` - Update user (Admin)
- DELETE `/api/admin/users/:id` - Delete user (Admin)
- PUT `/api/admin/parking/:id/approve` - Approve parking (Admin)
- GET `/api/admin/transactions` - Get transactions (Admin)
- GET `/api/admin/pending` - Get pending approvals (Admin)

## 🔒 Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt (12 rounds)
- Input validation with express-validator
- Rate limiting on all routes
- CORS configuration
- SQL injection prevention (MongoDB)
- XSS protection
- Secure payment verification (HMAC SHA256)

## 🌐 Deployment

### Backend (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add all environment variables
5. Deploy

### Frontend (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory
3. Run `vercel`
4. Follow prompts
5. Add environment variables in Vercel dashboard

### Database (MongoDB Atlas)
- Already cloud-hosted
- Just update connection string in production .env

## 📊 Features Workflow

### 1. Booking Flow
1. User searches for parking by city/location
2. Map displays available spots
3. User clicks on marker → Detail panel opens
4. User clicks "Book Now"
5. Selects dates, duration, car
6. Creates booking → Razorpay order generated
7. User completes payment
8. Backend verifies payment signature
9. Booking confirmed
10. Slots decreased
11. Owner wallet credited
12. Confirmation email sent
13. Socket.io emits slot update
14. All connected clients receive update

### 2. Real-time Updates
- Socket.io connected on app load
- Listens for `slotUpdated` events
- When booking confirmed/cancelled:
  - Server emits event with parking ID and new slot count
  - All clients update markers and UI
  - No page refresh needed

### 3. Wallet System
- Owner adds parking spot
- User books and pays
- Payment verified
- Amount credited to owner wallet
- Transaction recorded
- Admin can view all transactions

## 🐛 Common Issues

### Backend won't start
- Check MongoDB connection string
- Ensure all env variables are set
- Check port 5000 is not in use

### Frontend can't connect to backend
- Check REACT_APP_API_URL in .env
- Ensure CORS is configured
- Check backend is running

### Payment fails
- Verify Razorpay keys are correct
- Use test card details
- Check signature verification logic

### Emails not sending
- Verify SendGrid API key
- Verify sender email
- Check spam folder

## 📝 License

MIT License - feel free to use for learning and projects

## 👥 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@spoton.com

## 🎉 Acknowledgments

- React Team
- MongoDB
- Razorpay
- SendGrid
- Cloudinary
- Leaflet
- Socket.io

---

**Built with ❤️ using MERN Stack**
