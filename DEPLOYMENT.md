# Sahaay AI Deployment Guide

This repository contains a full-stack emergency financial protection platform:
- **Frontend**: Next.js 14 App Router (Tailwind CSS, Lucide, Framer Motion) in `/frontend`
- **Backend**: FastAPI Python application with asynchronous multi-agents & SQLite/PostgreSQL in `/backend`

Your code is live on GitHub at:
`https://github.com/vishesh1916/sahaay---AI-recovery-agent-`

---

## Option 1: The Recommended 2-Step Cloud Deployment (Free Tier)

### Step 1: Deploy the Backend (Render) — 2 Minutes
1. Go to [https://dashboard.render.com](https://dashboard.render.com) and log in with your GitHub account.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select your repository: **`vishesh1916/sahaay---AI-recovery-agent-`**.
4. Configure the service settings:
   - **Name**: `sahaay-ai-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://sahaay-ai-backend.onrender.com`).
   - You can verify it by opening `https://sahaay-ai-backend.onrender.com/health` in your browser.

---

### Step 2: Deploy the Frontend (Vercel) — 1 Minute
1. Go to [https://vercel.com/new](https://vercel.com/new) and log in with GitHub.
2. Find and click **Import** next to **`vishesh1916/sahaay---AI-recovery-agent-`**.
3. In the configuration screen:
   - **Root Directory**: Click **Edit** and select **`frontend`** (Important!).
   - **Framework Preset**: Next.js (automatically detected).
   - Expand **Environment Variables** and add:
     - **Name**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://sahaay-ai-backend.onrender.com` (your backend URL from Step 1 without trailing slash).
4. Click **Deploy**.
5. Vercel will build and assign you a live HTTPS domain (e.g., `https://sahaay-ai-recovery-agent.vercel.app`)!

---

## Option 2: 1-Click Railway Deployment
If you prefer Railway:
1. Go to [railway.app](https://railway.app) and create a project from your GitHub repo.
2. Railway detects the `Procfile` and will spin up the backend service automatically.
3. Add a second service from the same repo pointing to `/frontend` for the Next.js UI.
