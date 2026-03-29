# FIRST TOUCH - Construction Project Management Platform

## Project Overview
A comprehensive construction project management platform connecting **Owners**, **Contractors**, **Inspectors**, and **Real Estate Developers**.

## Workflow Reference
See [PROMPT_WORKFLOW.md](./PROMPT_WORKFLOW.md) for the complete prompt workflow documentation including all user journeys, API endpoints, and data models.

## Tech Stack
- **Frontend**: React 19 + Vite 7 (single App.jsx SPA)
- **Backend**: Node.js + Express 4 + Prisma 6 (SQLite dev / PostgreSQL prod)
- **Real-time**: Socket.io
- **Auth**: JWT + Refresh Tokens + bcrypt

## Project Structure
```
├── CLAUDE.md                  ← This file (project reference)
├── PROMPT_WORKFLOW.md         ← Complete workflow documentation
├── backend/
│   ├── src/
│   │   ├── server.js          ← Express app entry point
│   │   ├── routes/
│   │   │   ├── auth.js        ← /api/auth/*
│   │   │   ├── projects.js    ← /api/projects/*
│   │   │   ├── compounds.js   ← /api/compounds/* (Developer feature)
│   │   │   ├── dashboard.js   ← /api/dashboard
│   │   │   ├── wallet.js      ← /api/wallet/*
│   │   │   ├── notifications.js
│   │   │   ├── financing.js
│   │   │   ├── contractors.js
│   │   │   ├── inspectors.js
│   │   │   ├── achievements.js
│   │   │   ├── comments.js    ← /api/items/*/comments
│   │   │   └── admin.js       ← /api/admin/*
│   │   ├── middleware/
│   │   │   ├── auth.js        ← JWT verification + role check
│   │   │   ├── upload.js      ← Multer file upload
│   │   │   └── validate.js    ← Zod schema validation
│   │   ├── services/
│   │   │   ├── email.js       ← Nodemailer
│   │   │   └── notification.js ← Socket.io notifications
│   │   └── utils/
│   │       ├── logger.js      ← Winston logging
│   │       └── validators.js  ← Zod schemas
│   ├── prisma/
│   │   ├── schema.prisma      ← Database schema (all models)
│   │   └── seed.js            ← Development seed data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            ← Main SPA (all components)
│   │   └── main.jsx
│   └── package.json
└── package.json               ← Root (mammoth, pdf-parse)
```

## User Roles
| Role | Arabic | Description |
|------|--------|-------------|
| `owner` | مالك المشروع | Creates projects, approves work, manages payments |
| `contractor` | مقاول | Bids on projects, executes construction work |
| `inspector` | مفتش | Inspects and approves/rejects work quality |
| `developer` | مطور عقاري | Manages compounds with multiple units (villas) |
| `admin` | مشرف النظام | Platform administration |

## Key Commands
```bash
# Backend
cd backend && npm run dev          # Start backend server (port 5000)
cd backend && npm run setup        # Full setup (install + prisma + seed)
cd backend && npm run db:push      # Push schema changes to DB
cd backend && npm run db:studio    # Open Prisma Studio

# Frontend
cd frontend && npm run dev         # Start frontend (port 5173)
cd frontend && npm run build       # Production build
```

## Database Models
### Existing Models
User, RefreshToken, Project, Stage, SubStage, ChecklistItem, ItemFile, Wallet, Transaction, Quotation, InspectorApplication, Notification, ProjectImage, FinancingApplication, ContractorEarning, ProjectRating, ItemComment, BankRequest

### New Models (Developer/Compound Feature)
Compound, CompoundUnit, CompoundSupervisor, MaterialTracking, QualityIssue, CompoundPayment

## API Routes Overview
| Route | File | Description |
|-------|------|-------------|
| `/api/auth/*` | auth.js | Registration, login, tokens |
| `/api/projects/*` | projects.js | Project CRUD, stages, checklist |
| `/api/compounds/*` | compounds.js | **Compound management (Developer)** |
| `/api/dashboard` | dashboard.js | Role-based statistics |
| `/api/wallet/*` | wallet.js | Balance, deposits, transactions |
| `/api/notifications/*` | notifications.js | User notifications |
| `/api/financing/*` | financing.js | Financing applications |
| `/api/contractors/*` | contractors.js | Contractor listings |
| `/api/inspectors/*` | inspectors.js | Inspector listings |
| `/api/achievements/*` | achievements.js | Completed projects gallery |
| `/api/items/*/comments` | comments.js | Item comments |
| `/api/admin/*` | admin.js | Platform admin |

## Conventions
- Bilingual fields: `nameAr` / `nameEn`, `titleAr` / `titleEn`
- Database column mapping: camelCase → snake_case via `@map()`
- All API responses use Arabic error messages
- JWT auth middleware required on protected routes
- File uploads go to `./uploads/` directory
