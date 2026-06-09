CREATE DATABASE IF NOT EXISTS subscription_billing;
USE subscription_billing;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) DEFAULT NULL,
  company VARCHAR(255) DEFAULT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  monthly_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  yearly_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  features TEXT DEFAULT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  plan_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  renewal_date DATE DEFAULT NULL,
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  subscription_id INT NOT NULL,
  customer_id INT NOT NULL,
  plan_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_status ENUM('paid', 'unpaid') DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- Admin user is created by running: node backend/seed.js
-- Email: admin@example.com, Password: admin123

INSERT INTO customers (name, email, phone, company, status) VALUES
('Keshav Arora', 'keshav.arora@email.com', '8439920267', 'Keshav Enterprises', 'active'),
('Paarth Srivastava', 'paarth.srivastava@email.com', '8439920268', 'Srivastava Solutionsa', 'active'),
('Nikhil Singhal', 'nikhil.singhal@email.com', '8439920269', 'Nikhil Tech', 'active'),
('Hiranay Rao', 'hiranay.rao@email.com', '8439920270', 'Hiranay Media', 'inactive'),
('Sanaa Jain', 'sanaa.jain@email.com', '8439920271', 'Sanaa Associates', 'active');

INSERT INTO plans (name, description, monthly_price, yearly_price, features, status) VALUES
('Basic', 'Essential features for small businesses', 29.99, 299.99, 'Basic analytics,Email support,5 projects', 'active'),
('Standard', 'Best for growing teams', 59.99, 599.99, 'Advanced analytics,Priority email support,Unlimited projects,Team collaboration', 'active'),
('Premium', 'For large enterprises', 99.99, 999.99, 'All features,24/7 phone support,API access,Custom integrations,Dedicated manager', 'active');

INSERT INTO subscriptions (customer_id, plan_id, start_date, end_date, renewal_date, status) VALUES
(1, 2, '2026-01-01', '2026-12-31', '2026-12-01', 'active'),
(2, 3, '2026-02-01', '2027-01-31', '2027-01-01', 'active'),
(3, 1, '2026-03-01', '2026-08-31', '2026-08-01', 'active'),
(4, 2, '2025-06-01', '2026-05-31', '2026-05-01', 'expired'),
(5, 3, '2026-04-01', '2027-03-31', '2027-03-01', 'active');

INSERT INTO invoices (invoice_number, subscription_id, customer_id, plan_id, amount, tax, total_amount, invoice_date, due_date, payment_status) VALUES
('INV-2026-001', 1, 1, 2, 59.99, 9.60, 69.59, '2026-01-01', '2026-01-15', 'paid'),
('INV-2026-002', 2, 2, 3, 99.99, 16.00, 115.99, '2026-02-01', '2026-02-15', 'paid'),
('INV-2026-003', 3, 3, 1, 29.99, 4.80, 34.79, '2026-03-01', '2026-03-15', 'paid'),
('INV-2026-004', 4, 4, 2, 59.99, 9.60, 69.59, '2025-06-01', '2025-06-15', 'unpaid'),
('INV-2026-005', 5, 5, 3, 99.99, 16.00, 115.99, '2026-04-01', '2026-04-15', 'unpaid');
