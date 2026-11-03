# MediCore - Production Deployment & Operations Guide

This guide describes how to configure, deploy, secure, and maintain the **MediCore AI-Powered Hospital Management System** across local development, Dockerized containers, and production cloud environments (AWS, GCP, DigitalOcean, or on-premise VPS).

---

## 🏗️ System Architecture

MediCore runs as a modern, decoupled micro-monorepo:

```
                  ┌─────────────────────────────────────────┐
                  │          Client Browser / UI            │
                  │   Next.js 14 App Router + Tailwind CSS  │
                  │               Port 3000                 │
                  └────────────────────┬────────────────────┘
                                       │ HTTP / REST APIs
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │           Backend API Gateway           │
                  │       Node.js + Express + TypeScript    │
                  │               Port 5000                 │
                  └─────────┬─────────────────────┬─────────┘
                            │                     │ Internal RPC / REST
       SQL / Prisma ORM     │                     ▼
                            │         ┌───────────────────────┐
                            │         │     AI Engine (ML)    │
                            │         │ Python + Scikit-learn │
                            │         │       Port 8000       │
                            ▼         └───────────────────────┘
            ┌───────────────────────────────┐
            │      PostgreSQL Database      │
            │          Port 5432            │
            └───────────────────────────────┘
```

---

## 1. Prerequisites

Before deploying MediCore, ensure the following are installed:
- **Node.js**: `v20.x` or `v22.x+` (tested on Node `v24.12.0`)
- **npm**: `v10.x+` or `pnpm`
- **Python**: `3.10+` (optional for local if utilizing backend native fallback algorithms; required for custom model re-training)
- **Docker & Docker Compose**: `v24+` (for containerized deployments)
- **PostgreSQL**: `v15+` or `v16+`

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env` in the `backend/` and `frontend/` directories:

### Backend (`backend/.env`):
```ini
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/medicore_db?schema=public
JWT_SECRET=medicore_super_secure_jwt_secret_key_2026_xyz987
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500
```

### Frontend (`frontend/.env.local`):
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
PORT=3000
```

---

## 3. Fast-Track Local Development

### Step 1: Install Dependencies
```bash
# Root
npm install

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### Step 2: Database Migration & Seeding
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

### Step 3: Run the Complete System
Open three terminal windows (or run root concurrent scripts):
```bash
# Terminal 1 - Express Backend
npm run dev:backend

# Terminal 2 - Next.js Frontend
npm run dev:frontend

# Terminal 3 (Optional) - Python AI Engine
npm run dev:ai
```

Visit **`http://localhost:3000`** in your browser.

---

## 4. Docker & Docker Compose Deployment (Recommended for Cloud)

MediCore includes production-ready multi-stage Dockerfiles that optimize container size, cache layers, and provide isolated runtime security.

### Start the Full Stack with a Single Command:
```bash
cd docker
docker-compose up -d --build
```

### Container Status Check:
```bash
docker-compose ps
```

| Container | Service | Internal Port | Exposed Port | Status |
| :--- | :--- | :--- | :--- | :--- |
| `medicore_postgres` | PostgreSQL 16 | 5432 | 5432 | Healthy |
| `medicore_backend` | Express REST API | 5000 | 5000 | Healthy |
| `medicore_ai` | Python ML Flask Service | 8000 | 8000 | Healthy |
| `medicore_frontend` | Next.js Standalone App | 3000 | 3000 | Healthy |

### View Container Logs:
```bash
docker-compose logs -f backend
docker-compose logs -f ai_engine
```

### Stop Containers:
```bash
docker-compose down
```

---

## 5. Automated Testing & Quality Assurance

Run the native test suite to verify role-based permissions, appointment conflict logic, pharmacy stock deduction, billing calculations, and regression forecast models:

```bash
# Run tests directly
npm test
# Or from backend directory:
node --test backend/test/system.test.js
```

### Expected Output:
```
▶ MediCore System Architecture & Modules Test Suite
  ✔ 1. Role-Based Access Control (RBAC) Security Matrix
  ✔ 2. Appointment Scheduling & Conflict Prevention
  ✔ 3. Pharmacy Stock & Inventory Depletion
  ✔ 4. Billing & Financial Invoice Calculation
  ✔ 5. AI Operational Demand & Revenue Forecasting
  ✔ 6. Report Export & CSV Encoding RFC 4180
✔ MediCore System Architecture & Modules Test Suite
ℹ tests 15
ℹ pass 15
ℹ fail 0
```

---

## 6. Nginx Reverse Proxy & SSL (HTTPS) Setup

For production servers (Ubuntu / Debian), configure Nginx to terminate SSL and route frontend and API traffic:

```nginx
server {
    listen 80;
    server_name medicore.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name medicore.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/medicore.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/medicore.yourdomain.com/privkey.pem;

    # Next.js Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Express Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header Host $host;
    }
}
```

---

## 7. Security Hardening Checklist

- [x] **Password Hashing**: Strong bcrypt salt rounds ($10+$) used on all user records.
- [x] **Rate Limiting**: IP-based rate limiting enabled (`100` reqs / 15 mins for general APIs, strict `5` reqs / 15 mins on auth login).
- [x] **Strict RBAC**: Every clinical, billing, and inventory endpoint enforces role-level authorization middleware.
- [x] **Sanitization & Validation**: All inputs validated using Zod schemas before reaching the database.
- [x] **Audit Trail**: High-risk actions (patient medical record access, pharmacy dispensation, billing invoices) generate persistent audit log entries.
- [x] **CORS Isolation**: Cross-Origin Resource Sharing restricted to verified frontend domains.
