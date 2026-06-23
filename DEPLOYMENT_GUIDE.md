# Subscription Billing System — Deployment Guide

A beginner-friendly, production-ready deployment guide for the Subscription Billing & Customer Management System.

---

## Project Overview

| Layer | Technology |
|---|---|
| **Frontend** | React 18 (Create React App) |
| **Backend** | Node.js + Express 4 |
| **Database** | MySQL 8 (compatible with Neon PostgreSQL via mysql2) |
| **Auth** | JWT + bcryptjs |
| **Database Driver** | mysql2 (raw SQL) |
| **Deployment** | Frontend → Vercel, Backend → Render, Database → Neon |

### Build Process

```bash
# Backend — no build needed (Node.js runtime)
cd backend
npm install

# Frontend — produces static files in frontend/build/
cd frontend
npm install
npm run build
```

---

## Step 1: Push Project to GitHub

### 1.1 Create a repository on GitHub

1. Go to https://github.com/new
2. Name it `subscription-billing-system` (or any name you prefer)
3. Do NOT initialize with README, .gitignore, or license
4. Click **Create repository**

### 1.2 Push your local code

```bash
# If you haven't initialized git yet
git init

# Add all files (ensure .env is NOT committed — .gitignore already handles this)
git add .
git commit -m "Initial commit for deployment"

# Link to your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/subscription-billing-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

> Your code is now on GitHub. Proceed to deploy each service.

---

## Step 2: Deploy PostgreSQL on Neon

We use **Neon** because it offers a free serverless PostgreSQL tier that's MySQL-compatible via the `mysql2` driver.

### 2.1 Create a Neon Account

1. Go to https://neon.tech
2. Click **Sign Up** (use GitHub or email)
3. Verify your email address

### 2.2 Create a Project

> Screenshot: Neon Dashboard — Create Project

1. Click **Create a project**
2. Name: `subscription-billing`
3. Region: Choose the closest to your users (e.g., `US East (N. Virginia)`)
4. PostgreSQL version: 16 (default)
5. Click **Create project**

### 2.3 Get Your Connection String

> Screenshot: Neon Connection Details

1. After creation, you'll see the **Connection Details** panel
2. Copy the **Pooled connection string** — it looks like:
   ```
   postgres://username:password@us-east-1.aws.neon.tech/subscription_billing?sslmode=require
   ```
3. Save this string — you'll use it to configure your backend

### 2.4 SSL Requirements

Neon requires SSL connections. The `DB_SSL=true` option in your `.env` enables this.

### 2.5 Create Tables (via Backend)

Since this project uses MySQL-flavored SQL, you need to adapt the schema slightly for Neon:

```bash
# Option 1: Using the backend seed
# Create a temporary script or use a GUI like TablePlus / DBeaver
```

> **Note:** The `setup.sql` file uses MySQL syntax. For Neon (PostgreSQL), you'll need to convert:
> - `INT AUTO_INCREMENT` → `SERIAL`
> - `ENUM` → `CHECK` constraints or `VARCHAR`
> - `DECIMAL(10,2)` → `NUMERIC(10,2)`
> - `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` → `TIMESTAMPTZ DEFAULT NOW()`
> - `ON UPDATE CURRENT_TIMESTAMP` → handled via trigger

For ease, run the existing seed flow initially to confirm connectivity, then adapt the schema.

---

## Step 3: Deploy Backend on Render

### 3.1 Create a Web Service

> Screenshot: Render Dashboard — New Web Service

1. Log in at https://render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub account
4. Select the `subscription-billing-system` repository

### 3.2 Configure the Web Service

| Setting | Value |
|---|---|
| **Name** | `subscription-billing-api` |
| **Region** | Choose the closest to your Neon database |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | Free |

> Screenshot: Render Settings

### 3.3 Set Environment Variables

In the **Environment Variables** section, add:

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Sets production mode |
| `PORT` | `10000` | Render sets this automatically; you can leave `5000` as fallback |
| `DB_HOST` | `us-east-1.aws.neon.tech` | Your Neon host (from connection string) |
| `DB_PORT` | `5432` | PostgreSQL default port |
| `DB_USER` | `your_neon_user` | From your Neon connection string |
| `DB_PASSWORD` | `your_neon_password` | From your Neon connection string |
| `DB_NAME` | `subscription_billing` | Database name |
| `DB_SSL` | `true` | Required for Neon |
| `JWT_SECRET` | *(random 64-char hex)* | Generate via: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `24h` | Token expiry |
| `CORS_ORIGIN` | `https://your-app.vercel.app` | Your frontend URL (replace after deploying frontend) |

### 3.4 Health Check

Render will automatically call `GET /api/health` (added to your server). This confirms the service is running.

### 3.5 Auto-Deploy

Render auto-deploys when you push to the connected branch. To trigger a manual deploy:

1. Go to your Render dashboard
2. Click **Manual Deploy** → **Deploy latest commit**

### 3.6 Verify

After deployment, visit: `https://subscription-billing-api.onrender.com/api/health`

You should see:
```json
{ "status": "ok", "timestamp": "2026-06-23T..." }
```

---

## Step 4: Deploy Frontend on Vercel

### 4.1 Import Repository

> Screenshot: Vercel Import Repository

1. Go to https://vercel.com
2. Click **Add New...** → **Project**
3. Import the `subscription-billing-system` GitHub repository
4. Select the repository

### 4.2 Configure the Project

| Setting | Value |
|---|---|
| **Framework Preset** | Create React App (auto-detected) |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (auto-detected) |
| **Output Directory** | `build` (auto-detected) |
| **Node Version** | 18.x or higher |

### 4.3 Environment Variables

Add the following environment variable:

| Key | Value |
|---|---|
| `REACT_APP_API_URL` | `https://subscription-billing-api.onrender.com` |

> **Important:** Vercel requires environment variables to be set **before** the first build. If you see `undefined` API calls, you may need to redeploy after adding variables.

### 4.4 Deploy

> Screenshot: Vercel Deploy Button

1. Click **Deploy**
2. Wait for the build to complete (1–3 minutes)
3. Vercel provides a URL like: `https://subscription-billing-system.vercel.app`

### 4.5 Redeploy After Changes

To redeploy after pushing changes to GitHub:

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

Vercel auto-deploys from the `main` branch.

---

## Step 5: Connect Frontend to Backend

### 5.1 Which file contains the API URL?

**`frontend/src/api/config.js`** — this single file controls the API base URL.

```js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### 5.2 What should change?

In **development**:
- `REACT_APP_API_URL` in `frontend/.env` → `http://localhost:5000`

In **production** (Vercel):
- Environment variable `REACT_APP_API_URL` → `https://subscription-billing-api.onrender.com`

### 5.3 How to switch

**For local dev**: Nothing changes — `.env` already has `http://localhost:5000`.

**For production**: Vercel injects the environment variable at build time. No code change needed.

### 5.4 Update CORS on Backend

After deploying the frontend to Vercel, update the `CORS_ORIGIN` environment variable on Render:

```
CORS_ORIGIN=https://subscription-billing-system.vercel.app
```

This ensures only your frontend can call your API.

---

## Step 6: Database Migration

This project does **not use an ORM** (no Prisma, Sequelize, Drizzle, or TypeORM). It uses raw SQL queries via the `mysql2` driver.

### 6.1 Schema File

The database schema is in `database/setup.sql`.

### 6.2 Migration Commands

Because there is no ORM, you have two options:

#### Option A: Run setup.sql directly (MySQL)

```bash
# If using MySQL locally
mysql -h your-neon-host -P 5432 -u your-user -p subscription_billing < database/setup.sql
```

#### Option B: Adapt for Neon (PostgreSQL)

Neon runs PostgreSQL, which has different syntax. You'll need to convert:

| MySQL | PostgreSQL |
|---|---|
| `INT AUTO_INCREMENT` | `SERIAL` |
| `ENUM('a','b')` | `VARCHAR(20) CHECK (value IN ('a','b'))` |
| `DECIMAL(10,2)` | `NUMERIC(10,2)` |
| `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | `TIMESTAMPTZ DEFAULT NOW()` |
| `` `backtick quotes` `` | `"double quotes"` or no quotes |

#### Option C: Manual via GUI

Use a PostgreSQL GUI like:
- **TablePlus** (free)
- **DBeaver** (free)
- **pgAdmin** (free)

Connect to Neon and execute the adapted SQL.

### 6.3 Seed Data

After the schema is created, run:

```bash
cd backend
npm install
node seed.js
```

> This creates the admin user: `admin@example.com` / `admin123`

---

## Step 7: Production Checklist

- [ ] **HTTPS** — Enabled by default on Vercel and Render
- [ ] **Environment variables** — All set on both Vercel and Render
- [ ] **CORS** — `CORS_ORIGIN` set to your frontend domain on Render
- [ ] **JWT** — Secret changed to a strong random value (not the default)
- [ ] **Database** — Connected and migrated (tables exist)
- [ ] **Build success** — `npm run build` completes without errors
- [ ] **API working** — `GET /api/health` returns `200 OK`
- [ ] **Frontend working** — App loads without console errors
- [ ] **Login working** — Can log in with `admin@example.com` / `admin123`
- [ ] **Images** — All static assets load (logos, icons)
- [ ] **Error handling** — 404s and 500s show user-friendly messages
- [ ] **Seed data** — Run `node seed.js` to create admin user

---

## Step 8: Troubleshooting

### CORS Error

**Error:** `No 'Access-Control-Allow-Origin' header is present`

**Fix:**
1. Verify `CORS_ORIGIN` on Render includes your exact frontend URL (no trailing slash)
2. Check for typo: `https://` not `http://`
3. Redeploy the backend on Render

### Build Failed (Frontend)

**Error:** `Build failed with errors`

**Fix:**
1. Check Vercel build logs for specific error
2. Ensure `REACT_APP_API_URL` is set in Vercel environment variables
3. Run `npm run build` locally to see errors

### Build Failed (Backend)

**Error:** `npm install failed` or `node server.js` error

**Fix:**
1. Verify `Root Directory = backend` in Render settings
2. Check that `package.json` exists in the root directory specified
3. Ensure Node version is 16+ (Render default is 18)

### DATABASE_URL Invalid

**Error:** `ECONNREFUSED` or `connect ECONNREFUSED` or authentication failed

**Fix:**
1. Copy the connection string from Neon again — make sure it's the **pooled** connection
2. Verify each component: host, port, user, password, database name
3. Ensure `DB_SSL=true` is set
4. Check that Neon's IP allowlist doesn't block Render (Neon allows all connections by default)

### Neon Connection Refused

**Error:** `Connection timed out` or `could not connect to server`

**Fix:**
1. Ensure your Neon project is active (wake up from sleep)
2. Check if Neon's compute is paused (free tier auto-pauses after 5 minutes of inactivity)
3. Use the **pooled** connection string (not the direct one)

### Render Sleeping

**Error:** First request takes 30+ seconds or times out

**Fix:**
1. Free Render instances sleep after 15 minutes of inactivity
2. This is normal — the first request will wake it up (may take 30s)
3. Consider a **cron job** (e.g., UptimeRobot) to ping `https://your-api.onrender.com/api/health` every 10 minutes
4. Or upgrade to Render's paid plan ($7/month) for no sleeping

### Vercel Build Failed

**Error:** `The build command timed out` or `Missing output directory`

**Fix:**
1. Ensure **Root Directory** is set to `frontend`
2. Ensure **Output Directory** is set to `build`
3. Check that `@latest` versions of dependencies are installed

### Missing Environment Variables

**Error:** `undefined` values in the app or API calls failing

**Fix:**
1. Check **all** env vars on both Vercel and Render
2. On Vercel: add `REACT_APP_API_URL`
3. On Render: add all DB_* vars, JWT_SECRET, CORS_ORIGIN
4. **Redeploy** after adding env vars (they're baked in at build time for frontend)

### 404 Error

**Error:** `Cannot GET /some-path` or page not found

**Fix:**
1. Backend: Ensure the route exists in your Express app
2. Frontend (Vercel): Add a `vercel.json` rewrites rule:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
   (Create React App normally handles this, but if SPA routing fails, add this file in the `frontend` directory)

### 500 Error

**Error:** `Internal Server Error`

**Fix:**
1. Check backend logs on Render dashboard
2. Common cause: database query failure (wrong column names, missing tables)
3. Verify the migration ran successfully
4. Check that the seed script ran (`node seed.js`)

### API Not Reachable

**Error:** `Failed to fetch` or `net::ERR_CONNECTION_REFUSED`

**Fix:**
1. Verify `REACT_APP_API_URL` on Vercel is correct
2. Verify the backend is running: visit `https://your-api.onrender.com/api/health`
3. Check that CORS allows your frontend domain
4. Ensure no ad-blocker or browser extension is blocking requests

---

## Step 9: Deployment Architecture

```
                        User's Browser
                             |
                             ▼
                     ┌─────────────────┐
                     │    Vercel CDN    │
                     │  (Frontend SPA)  │
                     │  React App       │
                     └────────┬────────┘
                              │  HTTPS
                              │  https://your-app.vercel.app
                              ▼
                     ┌─────────────────┐
                     │  Render Web      │
                     │  Service         │
                     │  (Backend API)   │
                     │  Express/Node.js │
                     └────────┬────────┘
                              │  SSL
                              │  postgresql://...
                              ▼
                     ┌─────────────────┐
                     │  Neon PostgreSQL │
                     │  (Database)      │
                     │  Serverless      │
                     └─────────────────┘
```

### Request Flow

1. **User opens** `https://your-app.vercel.app` in their browser
2. **Vercel** serves the built React app (static HTML/CSS/JS)
3. **React app** loads and makes API calls to `https://your-api.onrender.com/api/...`
4. **Render** receives the request, validates JWT token (if needed)
5. **Express** queries **Neon PostgreSQL** via `mysql2` driver
6. **Neon** returns the data, Express formats the response
7. **JSON response** flows back through Render → Vercel → Browser
8. **React** renders the data in the UI

---

## Step 10: Final URLs

| Service | URL |
|---|---|
| **Frontend** | `https://subscription-billing-system.vercel.app` |
| **Backend** | `https://subscription-billing-api.onrender.com` |
| **Health Check** | `https://subscription-billing-api.onrender.com/api/health` |
| **Database** | `postgresql://user:pass@us-east-1.aws.neon.tech/subscription_billing?sslmode=require` |

---

## Quick Commands Reference

```bash
# Local development
cd backend && npm install && npm run dev    # Backend on :5000
cd frontend && npm install && npm start    # Frontend on :3000

# Production build
cd frontend && npm run build               # Outputs to frontend/build/

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Run seed (creates admin user)
cd backend && node seed.js

# Git push to trigger deploy
git add .
git commit -m "Update"
git push origin main
```
