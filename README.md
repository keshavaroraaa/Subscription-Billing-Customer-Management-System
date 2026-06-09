# Subscription Billing & Customer Management System

A full-stack subscription billing and customer management system built with React, Node.js, Express, and MySQL.

## Project Overview

This system allows businesses to manage customers, subscription plans, and invoices through a single dashboard. It handles the complete subscription lifecycle from customer signup through plan assignment, billing, and payment tracking.

### Purpose

Build a functional subscription billing platform that demonstrates full-stack development skills including:
- REST API design with Express
- Relational database modeling with MySQL
- Single-page application development with React
- JWT-based authentication
- Responsive UI development

---

## Features

### Authentication
- Secure login with JWT tokens
- Protected routes for all authenticated pages
- Session persistence with localStorage

### Customer Management
- Add, edit, and view customer details
- Activate or deactivate customer accounts
- Search customers by name, email, or company
- Filter customers by status (active/inactive)

### Plan Management
- Create subscription plans with monthly and yearly pricing
- Edit existing plan details and pricing
- Delete plans (blocked if plan has active subscriptions)
- View plans sorted by price

### Subscription Management
- Assign a plan to a customer
- Upgrade to a higher-priced plan
- Downgrade to a lower-priced plan
- Cancel an active subscription
- Renew expired or cancelled subscriptions
- Automatic invoice generation on creation and renewal

### Invoice Management
- View complete invoice history with customer and plan details
- Filter invoices by payment status (paid/unpaid)
- Mark invoices as paid or unpaid
- Automatic tax calculation (16%)

### Dashboard
- Total customers count
- Active and expired subscription counts
- Current month revenue
- Pending payments count and amount
- Recent invoices list

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6 |
| Backend | Node.js, Express 4 |
| Database | MySQL 8 |
| Authentication | JWT (jsonwebtoken + bcryptjs) |
| Database Driver | mysql2 (raw SQL queries) |
| Styling | Plain CSS |

---

## Database Setup

### Prerequisites
- Node.js v16 or higher
- MySQL 8 or higher
- npm

### Steps

1. Create the database and tables:

```bash
mysql -u root -p < database/setup.sql
```

2. Run the seed script to create the admin user with a properly hashed password:

```bash
cd backend
npm install
node seed.js
```

The setup.sql file creates four tables (customers, plans, subscriptions, invoices) with proper foreign key relationships and includes sample data.

---

## Backend Setup

1. Navigate to the backend directory:

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

The server runs at `http://localhost:5000`.

---

## Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
npm install
```

2. Start the React development server:

```bash
npm start
```

The application runs at `http://localhost:3000`.

---

## Login Credentials

| Field | Value |
|---|---|
| Email | `admin@example.com` |
| Password | `admin123` |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate and receive JWT token |
| GET | `/api/auth/profile` | Get current user profile |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | List customers (query: `search`, `status`) |
| GET | `/api/customers/:id` | Get single customer |
| POST | `/api/customers` | Create a new customer |
| PUT | `/api/customers/:id` | Update customer details |
| PATCH | `/api/customers/:id/toggle-status` | Toggle active/inactive status |

### Plans
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/plans` | List all plans |
| GET | `/api/plans/:id` | Get single plan |
| POST | `/api/plans` | Create a new plan |
| PUT | `/api/plans/:id` | Update plan details |
| DELETE | `/api/plans/:id` | Delete a plan |

### Subscriptions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/subscriptions` | List subscriptions (query: `status`) |
| GET | `/api/subscriptions/:id` | Get single subscription |
| POST | `/api/subscriptions` | Create a new subscription |
| PUT | `/api/subscriptions/:id/upgrade` | Upgrade to a higher plan |
| PUT | `/api/subscriptions/:id/downgrade` | Downgrade to a lower plan |
| PUT | `/api/subscriptions/:id/cancel` | Cancel a subscription |
| PUT | `/api/subscriptions/:id/renew` | Renew a subscription |

### Invoices
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/invoices` | List invoices (query: `payment_status`) |
| GET | `/api/invoices/:id` | Get single invoice |
| PUT | `/api/invoices/:id/mark-paid` | Mark invoice as paid |
| PUT | `/api/invoices/:id/mark-unpaid` | Mark invoice as unpaid |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Get dashboard statistics |

---

## Project Structure

```
subscription-billing-system/
├── database/
│   └── setup.sql                          # Schema + seed data
├── backend/
│   ├── config/
│   │   └── db.js                          # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js              # Login, profile
│   │   ├── customerController.js          # CRUD + toggle status
│   │   ├── planController.js              # CRUD + delete protection
│   │   ├── subscriptionController.js      # Assign, upgrade, downgrade, cancel, renew
│   │   ├── invoiceController.js           # List, mark paid/unpaid
│   │   └── dashboardController.js         # Aggregate stats
│   ├── middleware/
│   │   └── auth.js                        # JWT verification
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── plans.js
│   │   ├── subscriptions.js
│   │   ├── invoices.js
│   │   └── dashboard.js
│   ├── .env
│   ├── package.json
│   ├── seed.js                            # Admin user creator
│   └── server.js                          # Entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── context/
│       │   └── AuthContext.js             # Auth state management
│       ├── components/
│       │   ├── Navbar.js                  # Top navigation bar
│       │   ├── ProtectedRoute.js          # Auth gate wrapper
│       │   └── Sidebar.js                 # Side navigation menu
│       ├── pages/
│       │   ├── Login.js                   # Login form
│       │   ├── Dashboard.js               # Statistics overview
│       │   ├── Customers.js               # Customer list with search
│       │   ├── CustomerForm.js            # Add/edit customer
│       │   ├── Plans.js                   # Plan list
│       │   ├── PlanForm.js                # Create/edit plan
│       │   ├── Subscriptions.js           # Subscription list with actions
│       │   ├── SubscriptionForm.js        # Assign plan to customer
│       │   └── Invoices.js                # Invoice list with payment actions
│       ├── styles/
│       │   ├── dashboard.css
│       │   ├── login.css
│       │   ├── navbar.css
│       │   └── sidebar.css
│       ├── App.js                         # Main app with routing
│       ├── App.css                        # Global styles
│       └── index.js                       # Entry point
└── postman/
    └── collection.json                    # API test collection
```

---

## Module Documentation

### Authentication Module

**Purpose**: Secure access to the system so that only authorized users can manage customers, plans, subscriptions, and invoices.

**How it works**: The user submits their email and password via the login form. The backend verifies credentials against the database using bcrypt password comparison. On success, a JWT token is issued containing the user's ID, email, and name, signed with a server-side secret. The frontend stores this token in localStorage and sends it as a Bearer token in the Authorization header of all subsequent API requests. The backend middleware verifies the token on every protected route before allowing access.

**Why this approach**: JWT was chosen because it is stateless (no server-side session storage needed), works well with REST APIs, and is the standard approach for SPA authentication. localStorage provides persistence across page refreshes without requiring cookies.

### Customer Management Module

**Purpose**: Maintain a directory of customers with their contact information and account status.

**How it works**: The customers table stores name, email, phone, company, and status. The API supports full CRUD operations plus a toggle-status endpoint. The frontend provides a search input that queries across name, email, and company fields simultaneously. A status dropdown filter narrows results to active or inactive customers.

**Why this approach**: Search and filter are implemented on the server side using SQL LIKE queries rather than client-side filtering, which scales better with larger datasets. The toggle-status pattern reduces the number of API endpoints needed.

### Plan Management Module

**Purpose**: Define subscription plans with different pricing tiers and feature sets.

**How it works**: Plans are stored with a name, description, monthly and yearly prices, features (comma-separated text), and status. The API enforces that plans with active subscriptions cannot be deleted, preventing data integrity issues. The frontend displays features as a formatted list.

**Why this approach**: Features are stored as comma-separated text rather than a separate table because they are simple text descriptions that don't need individual database rows. The delete protection prevents orphaned subscription records.

### Subscription Management Module

**Purpose**: Track which customers have which plans and manage the subscription lifecycle.

**How it works**: When a subscription is created, the backend calculates the end date based on the billing cycle (monthly or yearly), generates an invoice automatically, and sets a renewal date 30 days before expiry. The upgrade and downgrade endpoints validate that the new plan has a higher or lower price respectively. Cancel sets the status to 'cancelled' without deleting data. Renew extends the end date by one year and generates a new invoice.

**Why this approach**: Automatic invoice generation on subscription creation and renewal ensures billing accuracy without manual intervention. Price validation on upgrade/downgrade prevents logical errors. The renewal date system gives advance notice of upcoming renewals.

### Invoice Management Module

**Purpose**: Track payments and generate billing records.

**How it works**: Invoices are created automatically by the subscription controller when subscriptions are created or renewed. Each invoice includes the plan amount, 16% tax, and a due date 15 days from invoice date. Users can manually toggle payment status between paid and unpaid.

**Why this approach**: Automatic invoice generation reduces manual data entry. The tax calculation is straightforward and configurable. Manual payment status toggling allows for real-world scenarios where payments are received outside the system.

### Dashboard Module

**Purpose**: Provide a quick overview of key business metrics.

**How it works**: A single API endpoint aggregates data from all four tables: customer count, subscription counts grouped by status, monthly revenue from paid invoices, pending payment count and total amount, and the five most recent invoices.

**Why this approach**: A single dashboard endpoint reduces frontend complexity and network requests. The aggregation happens in the database layer using SQL aggregate functions, which is efficient. Monthly revenue is calculated from the current month's paid invoices.

---

## Security Considerations

- Passwords are hashed using bcrypt with a salt round of 10
- JWT tokens have a 24-hour expiration
- All API routes except login require authentication via JWT middleware
- The JWT secret should be changed from the default in production
- MySQL credentials in .env are for local development only
- Input validation is performed on both the frontend and backend

---

## Screenshots

(Screenshots can be added here by taking screen captures of each page and inserting them with the following format:)

```
![Dashboard](screenshots/dashboard.png)
![Customers](screenshots/customers.png)
![Plans](screenshots/plans.png)
![Subscriptions](screenshots/subscriptions.png)
![Invoices](screenshots/invoices.png)
```

---

## Postman Collection

A Postman collection with all API endpoints is available at `postman/collection.json`. Import it into Postman to test the API. The collection includes:

- An environment variable `{{token}}` that is automatically set after login
- Pre-configured request bodies for POST and PUT requests
- Organized folders matching the API modules

To use:
1. Import the collection into Postman
2. Run the "Login" request first to authenticate
3. The token variable is automatically stored for subsequent requests
