# FIRST TOUCH — Production Deployment Guide

## Quick Deploy Options

### Option 1: Railway (Recommended — Easiest)

1. **Create account** at [railway.app](https://railway.app)
2. **Connect GitHub** repo
3. **Add PostgreSQL** plugin (free tier available)
4. **Deploy backend:**
   - Root Directory: `backend`
   - Railway auto-detects `railway.json`
   - Add environment variables (see below)
5. **Deploy frontend:**
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: (static — use Railway's static hosting or Vercel)

### Option 2: Render

1. **Create account** at [render.com](https://render.com)
2. **Connect GitHub** repo
3. Render auto-detects `render.yaml` and creates:
   - PostgreSQL database (free tier)
   - Backend web service
   - Frontend static site
4. **Add environment variables** in Render dashboard

### Option 3: Docker Compose (VPS/DigitalOcean)

```bash
cd backend
cp .env.example .env
# Edit .env with your production values
docker-compose up -d
```

---

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/firsttouch` |
| `JWT_SECRET` | Random 32+ char string | `a7b3c9d2e4f6...` |
| `JWT_REFRESH_SECRET` | Random 32+ char string | `x8y2z5w1v3...` |
| `FRONTEND_URL` | Your frontend domain | `https://firsttouch.bh` |
| `CLOUDINARY_CLOUD_NAME` | From cloudinary.com dashboard | `dxyz123` |
| `CLOUDINARY_API_KEY` | From cloudinary.com dashboard | `123456789` |
| `CLOUDINARY_API_SECRET` | From cloudinary.com dashboard | `abc_xyz_123` |
| `SMTP_USER` | Email for sending notifications | `noreply@firsttouch.bh` |
| `SMTP_PASS` | Email app password | `your-app-password` |

---

## Setup Cloudinary (Free — File Storage)

1. Go to [cloudinary.com](https://cloudinary.com) and create free account
2. From Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
3. Add these to your environment variables
4. Free tier: 25GB storage, 25GB bandwidth/month

---

## Database Setup

After deploying, run migrations:

```bash
# Railway/Render: runs automatically via build command
# Manual:
cd backend
npx prisma migrate deploy

# Seed demo data (optional):
node prisma/seed.js
```

---

## Frontend Production Build

```bash
cd frontend
npm install
npm run build
# Output: frontend/dist/
```

The frontend auto-detects the API URL:
- **localhost** → `http://localhost:5000/api`
- **production** → same origin `/api` (backend serves frontend)

---

## Architecture

```
Production Setup:
┌─────────────────┐     ┌──────────────┐     ┌────────────┐
│  Frontend (CDN)  │────▶│  Backend API  │────▶│ PostgreSQL │
│  Vercel/Render   │     │  Railway/Render│    │  (managed) │
└─────────────────┘     └──────┬───────┘     └────────────┘
                               │
                        ┌──────▼───────┐
                        │  Cloudinary   │
                        │  (files/img)  │
                        └──────────────┘
```

---

## Post-Deploy Checklist

- [ ] Database migrations applied
- [ ] Seed data loaded (if needed)
- [ ] Cloudinary configured and tested
- [ ] Email sending works (SMTP)
- [ ] CORS allows frontend domain
- [ ] JWT secrets are unique and strong
- [ ] HTTPS enabled (auto on Railway/Render)
- [ ] Health check: `GET /api/health` returns 200
