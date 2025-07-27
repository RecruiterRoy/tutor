# Backend Deployment Guide

## Quick Setup - Railway (Recommended)

### 1. Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `tutor` repository
5. Railway will auto-detect Node.js and deploy

### 2. Set Environment Variables in Railway
In your Railway project dashboard, go to Variables tab and add:
```
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=https://vfqdjpiyaabufpaofysz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcWRqcGl5YWFidWZwYW9meXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDkzMDEsImV4cCI6MjA2OTE4NTMwMX0.SVY1Kf7D1nbXssuxCnnHcvaDAIintOpCLfhxV6rHvjo
PORT=3000
```

### 3. Update Frontend Configuration
1. Copy your Railway app URL (e.g., `https://tutor-production-xxxx.up.railway.app`)
2. Update `js/config.js` line 8:
```javascript
apiBaseUrl: window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://YOUR_RAILWAY_URL_HERE',
```

### 4. Push to GitHub
```bash
git add .
git commit -m "Add backend deployment configuration"
git push origin main
```

## Alternative: Vercel Deployment

### 1. Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect and deploy

### 2. Set Environment Variables in Vercel
In your Vercel project dashboard, go to Settings → Environment Variables:
```
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=https://vfqdjpiyaabufpaofysz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcWRqcGl5YWFidWZwYW9meXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDkzMDEsImV4cCI6MjA2OTE4NTMwMX0.SVY1Kf7D1nbXssuxCnnHcvaDAIintOpCLfhxV6rHvjo
```