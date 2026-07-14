# 🚀 Migration Guide: Local to Internet (Free Tier)

This guide outlines how to move your **Smart Hostel System** from your local machine to the internet using top-tier free hosting platforms.

---

## 🛠 Required Cloud Stack (Recommended Free Tools)

| Component | Platform | Free Tier Benefits |
| :--- | :--- | :--- |
| **Database** | [Supabase](https://supabase.com) | Real-time PostgreSQL (Recommended for Prisma). |
| **Backend API** | [Render](https://render.com) | Easy Node.js/Express deployment. |
| **Frontend** | [Vercel](https://vercel.com) | Best for Next.js (Speed, edge caching, and SSL). |

---

## 🏗 Phase 1: Database Migration (SQLit → PostgreSQL)

SQLite is only for local development. For the internet, you need a networked database.

### 1. Update Schema
In `apps/api/prisma/schema.prisma`, change your datasource:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Connect to Supabase
1. Create a free account at [Supabase.com](https://supabase.com).
2. Start a new project.
3. In **Database Settings**, find your **Connection String (Transaction mode)**.
4. Update your local `.env` with the new URL:
   `DATABASE_URL="postgres://postgres:[YOUR_PASSWORD]@[DB_HOST]:6543/postgres"`

### 3. Initialize Cloud DB
Run this in your terminal:
```bash
npx prisma db push
```

---

## 🛰 Phase 2: Deploying the Backend (API) to Render

Render is excellent for hosting Node.js/Express backends.

1. Create a [Render](https://render.com) account.
2. Link your **GitHub repository**.
3. Create a **New > Web Service**.
4. **Settings**:
   - **Runtime**: Node.js
   - **Build Command**: `cd apps/api && npm install && npx prisma generate`
   - **Start Command**: `node apps/api/src/server.js`
5. **Environment Variables**: Add everything from your `.env` (DATABASE_URL, JWT_SECRET, PORT=8080).

---

## 🌐 Phase 3: Deploying the Frontend (UI) to Vercel

Vercel is the creator of Next.js and the fastest way to host it.

1. Connect your repo to [Vercel](https://vercel.com).
2. **Settings**:
   - **Root Directory**: `apps/web`
   - **Framework**: `Next.js`
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Use the URL from **Render** (e.g., `https://my-api.onrender.com/api/v1`)
4. **Deploy!**

---

## ⚠️ Important Production Checklist

> [!WARNING]
> **CORS Security**: You must update `apps/api/src/server.js` to allow requests from your new **Vercel domain**. Otherwise, you'll get 403 Forbidden errors.

> [!TIP]
> **Free Tier Sleep**: Render's free services "spin down" after 15 minutes of inactivity. The first person to visit your site in the morning might wait 30 seconds for the backend to start up. To avoid this, you can upgrade to their $7/mo plan later.

---

### Need help with a specific part?
I can generate the specific `.github/workflows` or server config changes if you're ready to proceed!
