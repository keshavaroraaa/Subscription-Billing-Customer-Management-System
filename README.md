# Subscription Billing & Customer Management System

A full-stack subscription billing and customer management system built with React, Node.js, Express, and MySQL.

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm

### Database Setup

1. Create the database and tables:

```bash
mysql -u root -p < database/setup.sql
```

2. Run the seed script to create admin user:

```bash
cd backend
npm install
node seed.js
```

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
npm install
```

2. Configure environment variables in `.env`:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=subscription_billing
JWT_SECRET=subscription_billing_jwt_secret_key_2026
```

3. Start the backend server:

```bash
npm start
```

The server runs on `http://localhost:5000`.

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
npm install
```

2. Start the React app:

```bash
npm start
```

The app runs on `http://localhost:3000`.

## Default Login Credentials

- Email: `admin@example.com`
- Password: `admin123`

## Features

### Authentication
- Login with JWT authentication
- Protected routes

### Customer Management
- Add, edit, view customers
- Activate/Deactivate customers
- Search by name, email, company
- Filter by status

### Plan Management
- Create, edit, delete subscription plans
- Set monthly and yearly pricing
- Add features list

### Subscription Management
- Assign plans to customers
- Upgrade/Downgrade subscriptions
- Cancel and renew subscriptions
- Automatic invoice generation

### Invoice Management
- View invoice history
- Mark invoices as paid/unpaid
- PDF invoice generation and download

### Dashboard
- Total customers count
- Active/Expired subscriptions
- Monthly revenue
- Pending payments
- Recent invoices

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Customers
- `GET /api/customers` - List customers (query: search, status)
- `GET /api/customers/:id` - Get customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `PATCH /api/customers/:id/toggle-status` - Toggle status

### Plans
- `GET /api/plans` - List plans
- `GET /api/plans/:id` - Get plan
- `POST /api/plans` - Create plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

### Subscriptions
- `GET /api/subscriptions` - List subscriptions (query: status)
- `GET /api/subscriptions/:id` - Get subscription
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id/upgrade` - Upgrade
- `PUT /api/subscriptions/:id/downgrade` - Downgrade
- `PUT /api/subscriptions/:id/cancel` - Cancel
- `PUT /api/subscriptions/:id/renew` - Renew

### Invoices
- `GET /api/invoices` - List invoices (query: payment_status)
- `GET /api/invoices/:id` - Get invoice
- `PUT /api/invoices/:id/mark-paid` - Mark as paid
- `PUT /api/invoices/:id/mark-unpaid` - Mark as unpaid
- `GET /api/invoices/:id/pdf` - Download PDF invoice

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## Project Structure

```
subscription-billing-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── planController.js
│   │   ├── subscriptionController.js
│   │   ├── invoiceController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── plans.js
│   │   ├── subscriptions.js
│   │   ├── invoices.js
│   │   └── dashboard.js
│   ├── utils/
│   ├── .env
│   ├── package.json
│   ├── seed.js
│   └── server.js
├── database/
│   └── setup.sql
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── Sidebar.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── CustomerForm.js
│   │   │   ├── Customers.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Invoices.js
│   │   │   ├── Login.js
│   │   │   ├── PlanForm.js
│   │   │   ├── Plans.js
│   │   │   ├── SubscriptionForm.js
│   │   │   └── Subscriptions.js
│   │   ├── styles/
│   │   │   ├── dashboard.css
│   │   │   ├── login.css
│   │   │   ├── navbar.css
│   │   │   └── sidebar.css
│   │   ├── App.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── postman/
    └── collection.json
```
