# MediCore — Smart Healthcare Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**MediCore** is an enterprise-grade, production-style, AI-powered Hospital Management Platform engineered for modern medical facilities, clinical research centers, and healthcare networks. Designed with a SaaS dashboard aesthetic, role-based security, automated operational analytics, and machine learning forecasting.

---

## 🏥 Key System Capabilities

- **Role-Based Access Control (8 Distinct Portals)**: Tailored workflows for Super Admins, Hospital Admins, Doctors, Receptionists, Nurses, Pharmacists, Lab Technicians, and Patients.
- **Predictive AI Intelligence Dashboard**: Operational Ridge regression models for 30-day appointment demand forecasting, revenue estimation, and automated pharmacy stockout alerts.
- **Smart Appointment Scheduling**: Conflict-prevention engine that detects overlapping consultation time slots and coordinates doctor availability.
- **Electronic Medical Records (EMR)**: Comprehensive clinical diagnoses, vital signs history, treatment plans, known allergies, and lab history.
- **Active Pharmacy Dispensary**: Multi-batch inventory tracking with automatic stock deduction, expiration tracking, and low-inventory triggers.
- **Laboratory Information System (LIS)**: Diagnostic test catalogs, technician result entry, critical value flags, and downloadable reports.
- **Bed & Ward Management**: Real-time bed occupancy tracking across Intensive Care Units (ICU), General Wards, and Pediatric Wings.
- **Integrated Billing & Invoicing**: Multi-department charge calculation (consultation, pharmacy, lab, bed days) with tax and payment settlement.
- **Security & Compliance Audit Trail**: Immutable logging of patient record reads, prescription issuance, and financial transactions.
- **Export Engine**: Instant RFC 4180 CSV and printable executive reports for patients, appointments, revenue, and inventory.

---

## 👥 User Roles & Seed Demo Credentials

MediCore comes pre-populated with synthetic clinical data and pre-configured accounts for all 8 roles:

| Role | Email | Password | Access & Workspace |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@medicore.io` | `Admin@123` | Full system control, role permissions, audit trails |
| **Hospital Admin** | `admin@medicore.io` | `Admin@123` | Executive dashboard, analytics, bed allocation, staff |
| **Doctor** | `doctor.smith@medicore.io` | `Doctor@123` | Doctor queue, patient vitals, diagnosis & prescriptions |
| **Receptionist** | `reception@medicore.io` | `Recep@123` | Patient intake, scheduling calendar, doctor directory |
| **Nurse** | `nurse.clara@medicore.io` | `Nurse@123` | Ward management, bed allocation, patient vitals |
| **Pharmacist** | `pharmacy@medicore.io` | `Pharm@123` | Medicine inventory, dispensing queue, batch tracking |
| **Lab Technician** | `lab@medicore.io` | `Lab@123` | Diagnostic tests, recording specimen results, reports |
| **Patient** | `patient.alice@medicore.io` | `Patient@123` | Patient portal, appointments, prescriptions, billing |

> **Interactive Role Switcher**: A quick role switcher is accessible directly in the top navigation bar to test all 8 portals without logging out!

---

## 🧠 AI Intelligence & Machine Learning Architecture

MediCore features an operational intelligence module powered by Python and Scikit-learn (with zero-setup native backend fallbacks):

1. **Appointment Demand Forecasting**:
   - Analyzes weekly and monthly consultation trends using Ridge regression.
   - Outputs 30-day forecast with confidence intervals and peak-hour heatmaps.
2. **Revenue Projection**:
   - Evaluates historical billing data, department-level yield, and seasonal trends.
3. **Medicine Inventory Shortage Prediction**:
   - Calculates daily consumption rates and warns of stockouts before medicines drop below safety margins.
4. **Automated Operational Summaries**:
   - Synthesizes bed occupancy, doctor utilization, and wait times into actionable administrative summaries.

*Note: All AI models are strictly operational and designed for administrative efficiency, not clinical diagnosis.*

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, Standalone build)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) primitives
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (Express.js in TypeScript)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only tokens and bcrypt password hashing
- **Security**: Rate limiting, Helmet, CORS protection, Zod validation, Audit logging
- **Storage Layer**: Dual-mode engine (PostgreSQL database + zero-dependency in-memory JSON fallback for immediate offline demos)

### AI Service
- **Environment**: Python 3.11
- **Libraries**: Pandas, Scikit-learn, NumPy, Flask

### DevOps & Containerization
- **Docker**: Multi-stage Dockerfiles (`Dockerfile.backend`, `Dockerfile.frontend`, `Dockerfile.ai`)
- **Orchestration**: `docker-compose.yml` for single-command full-stack provisioning

---

## 🚀 Quick Start Guide

### Option 1: Docker Compose (Fastest & Recommended)

Ensure Docker Desktop is running, then execute:

```bash
cd docker
docker-compose up -d --build
```

- **Frontend Dashboard**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:5000/api/v1`
- **AI Intelligence Service**: `http://localhost:8000`

---

### Option 2: Local Development

#### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/hospital-management.git
cd "Hospital Management"

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

#### 2. Configure Environment Variables
Copy `.env.example` to `.env` in `backend/` and `frontend/`:
```bash
cp backend/.env.example backend/.env
```

#### 3. Database Setup (Prisma & PostgreSQL)
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

#### 4. Run Development Servers
```bash
# Terminal 1: Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Frontend Dashboard (Port 3000)
npm run dev:frontend

# Terminal 3: (Optional) Python AI Service (Port 8000)
npm run dev:ai
```

Open your browser at **`http://localhost:3000`** to access the dashboard.

---

## 🧪 Automated Testing

MediCore includes a native, zero-dependency test suite testing authentication, RBAC, appointment conflict detection, inventory depletion, billing calculations, and regression forecasting:

```bash
npm test
```

Or run directly with Node 18+:
```bash
node --test backend/test/system.test.js
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user & issue JWT | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Authenticated |
| `GET` | `/api/v1/patients` | Search & list patients | All Staff |
| `POST` | `/api/v1/patients` | Register new patient profile | Admin, Receptionist |
| `GET` | `/api/v1/doctors` | List doctors & availability | All Staff |
| `POST` | `/api/v1/appointments` | Book appointment with conflict check | Patient, Receptionist, Admin |
| `POST` | `/api/v1/prescriptions` | Create prescription & deduct stock | Doctor |
| `GET` | `/api/v1/pharmacy/medicines` | Query pharmacy stock & expiry | Pharmacist, Admin |
| `POST` | `/api/v1/pharmacy/dispense` | Dispense medication & update stock | Pharmacist |
| `GET` | `/api/v1/billing/invoices` | List invoices and settlements | Billing, Admin, Patient |
| `POST` | `/api/v1/billing/invoices` | Generate new patient bill | Billing, Admin |
| `GET` | `/api/v1/beds` | Bed occupancy by ward & ICU status | Nurse, Admin |
| `POST` | `/api/v1/beds/admit` | Admit patient to specific bed | Nurse, Admin |
| `GET` | `/api/v1/ai/forecast/demand` | 30-day appointment forecast | Admin |
| `GET` | `/api/v1/reports/export/csv` | Download RFC 4180 CSV export | Admin, Doctor |
| `GET` | `/api/v1/audit-logs` | HIPAA security & compliance audit logs | Super Admin |

---

## 📂 Project Structure

```
Hospital Management/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # 22 Normalized models with indexes & cascades
│   │   └── seed.ts                  # Synthetic seed dataset with bcrypt passwords
│   ├── src/
│   │   ├── config/                  # Environment & security configuration
│   │   ├── controllers/             # Auth, Patient, Doctor, Appointment, AI, etc.
│   │   ├── middleware/              # JWT, RBAC, Rate Limiting, Error Handler
│   │   ├── routes/                  # Express API route modules
│   │   ├── services/                # StoreService data access layer & Prisma client
│   │   ├── utils/                   # Password hashing, JWT sign/verify
│   │   ├── validators/              # Zod input validation schemas
│   │   └── server.ts                # Express application entrypoint
│   └── test/
│       └── system.test.js           # Automated test suite (15 unit/integration tests)
├── frontend/
│   ├── app/
│   │   ├── (auth)/login/            # Secure login page with demo role buttons
│   │   ├── ai-intelligence/         # AI Operational Intelligence & ML Forecasting
│   │   ├── dashboard/
│   │   │   ├── admin/               # Executive dashboard, KPIs, reports, audit logs
│   │   │   ├── doctor/              # Clinical workspace, prescriptions, queue
│   │   │   ├── receptionist/        # Patient intake & appointment booking
│   │   │   ├── nurse/               # Ward management & patient vitals
│   │   │   ├── pharmacy/            # Medicine inventory & dispensary
│   │   │   ├── laboratory/          # Diagnostic tests & result entry
│   │   │   ├── billing/             # Invoices, charges, payment settlements
│   │   │   ├── beds/                # Bed occupancy & admissions
│   │   │   ├── staff/               # Staff directory & department shifts
│   │   │   └── patient/             # Patient self-service portal
│   │   └── globals.css              # Tailwind CSS styles & SaaS tokens
│   ├── components/
│   │   ├── charts/                  # Recharts KPI widgets, revenue, bed occupancy
│   │   ├── layout/                  # Sidebar, Navbar (1-click role switcher), Layout
│   │   └── ui/                      # Button, Card, Badge, Input, Table, Dialog
├── ai-engine/
│   ├── app.py                       # Flask ML prediction microservice
│   ├── requirements.txt             # Scikit-learn, Pandas, NumPy
│   └── training/
│       └── demand_model.py          # Ridge regression training pipeline
├── docker/
│   ├── Dockerfile.backend           # Multi-stage production Node builder
│   ├── Dockerfile.frontend          # Next.js standalone container
│   ├── Dockerfile.ai                # Python slim container
│   └── docker-compose.yml           # Multi-service stack orchestration
├── DEPLOYMENT.md                    # Cloud deployment & Nginx SSL guide
├── package.json                     # Monorepo workspace configuration
└── README.md                        # Master documentation
```

---

## 📄 License & Attribution

Developed for final-year engineering capstone demonstrations, software developer portfolios, and technical interviews. Distributed under the MIT License.
