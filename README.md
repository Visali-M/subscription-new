📊 SubTracker — Subscription Management App
A full-stack MERN application to track, manage, and pay for all your recurring subscriptions in one place.

🚀 Features
🔐 User Authentication — Register, Login with JWT
➕ Add Subscriptions — Smart cascading dropdowns (Category → Service → Plan)
✏️ Edit & Delete — Full CRUD for subscriptions
💳 Razorpay Payments — Pay subscriptions directly from the dashboard
📊 Analytics — Spending by category, monthly trends, distribution charts
🔔 Renewal Alerts — Get notified when a subscription is due
⏰ Cron Job — Daily automated renewal reminders
👤 Profile Management — Update name, email, password
⚙️ Settings — Notification preferences, currency, danger zone
🛠️ Tech Stack
Frontend
Technology	Purpose
React 18	UI Framework
React Router v6	Page Routing
Axios	API Requests
DM Sans + DM Mono	Typography
Chart.js (SVG)	Data Visualizations
Razorpay SDK	Payment Integration
Backend
Technology	Purpose
Node.js + Express	REST API Server
MongoDB + Mongoose	Database
JWT	Authentication
bcryptjs	Password Hashing
Razorpay	Payment Gateway
node-cron	Scheduled Jobs
📁 Project Structure
subscription-tracker/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Profile
│   │   └── subscriptionController.js  # CRUD operations
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT protection
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Subscription.js       # Subscription schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── subscriptionRoutes.js # /api/subscriptions
│   │   └── paymentRoutes.js      # /api/payment
│   ├── utils/
│   │   └── cronJob.js            # Renewal reminders
│   ├── .env                      # Environment variables
│   ├── server.js                 # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html            # Razorpay script included
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatsCards.jsx
│   │   │   ├── SubscriptionChart.jsx
│   │   │   ├── MonthlyExpenseChart.jsx
│   │   │   └── PaymentButton.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AddSubscription.jsx
│   │   │   ├── EditSubscription.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios instance
│   │   ├── App.js
│   │   └── App.css               # Global design tokens
│   ├── .env                      # Environment variables
│   └── package.json
│
├── .gitignore
└── README.md
⚙️ Installation & Setup
Prerequisites
Node.js v16+
MongoDB (local or Atlas)
Razorpay account (free test account)
1. Clone the repository
git clone https://github.com/yourusername/subscription-tracker.git
cd subscription-tracker
2. Backend Setup
cd backend
npm install
Create backend/.env:

PORT=5000
MONGO_URI=mongodb://localhost:27017/subscription-tracker
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
CLIENT_URL=http://localhost:3000
Start the backend:

npm run dev
Server runs on http://localhost:5000

3. Frontend Setup
cd frontend
npm install
Create frontend/.env:

REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY=rzp_test_XXXXXXXXXXXXXXXX
Start the frontend:

npm start
App runs on http://localhost:3000

🔑 Getting Razorpay Keys
Go to https://dashboard.razorpay.com
Sign up / Login
Go to Settings → API Keys
Click Generate Test Key
Copy Key ID → paste in both .env files
Copy Key Secret → paste in backend/.env only
📡 API Endpoints
Auth
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
GET	/api/auth/profile	Get user profile
PUT	/api/auth/profile	Update user profile
Subscriptions
Method	Endpoint	Description
GET	/api/subscriptions	Get all subscriptions
POST	/api/subscriptions	Create subscription
GET	/api/subscriptions/:id	Get single subscription
PUT	/api/subscriptions/:id	Update subscription
DELETE	/api/subscriptions/:id	Delete subscription
Payments
Method	Endpoint	Description
POST	/api/payment/order	Create Razorpay order
POST	/api/payment/verify	Verify payment signature
🔒 Environment Variables
Variable	Location	Description
MONGO_URI	backend	MongoDB connection string
JWT_SECRET	backend	Secret key for JWT tokens
RAZORPAY_KEY_ID	backend + frontend	Razorpay public key
RAZORPAY_KEY_SECRET	backend only	Razorpay secret key
REACT_APP_API_URL	frontend	Backend API base URL
👨‍💻 Developer
Visali

Full Stack MERN Application
Built with React + Node.js + MongoDB + Razorpay
📄 License
This project is for educational purposes.
