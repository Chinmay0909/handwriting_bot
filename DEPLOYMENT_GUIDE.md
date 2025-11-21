# 🚀 Deployment Guide - Render (Backend) + Vercel (Frontend)

This guide walks you through deploying your Custom Handwriting Font Generator with:
- **Backend** on Render.com (Docker with FontForge)
- **Frontend** on Vercel (Optimized for React/Vite)

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Render.com account (sign up free)
- ✅ Vercel account (sign up free)
- ✅ OpenRouter API key
- ✅ Code pushed to GitHub repository

---

## Part 1: Deploy Backend on Render 🔧

### Step 1: Push to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "Prepare for deployment"

# Push to GitHub
git push origin main
```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Get Started"**
3. Sign up with your **GitHub account**
4. Authorize Render to access your repositories

### Step 3: Deploy Backend

1. **Click "New +"** → **"Web Service"**

2. **Connect Repository:**
   - Select your repository from the list
   - Click **"Connect"**

3. **Configure Service:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `cgfont-backend` (or your choice) |
   | **Environment** | `Docker` |
   | **Region** | Choose closest to you |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Docker Command** | Leave empty (uses Dockerfile) |

4. **Select Plan:**
   - Choose **"Free"** plan
   - Note: Service will spin down after 15 min of inactivity

5. **Advanced Settings** (click to expand):
   - **Auto-Deploy**: Yes (enabled by default)

6. **Environment Variables** (click "Add Environment Variable"):

   Add these variables:

   ```
   OPENROUTER_API_KEY=your_actual_openrouter_api_key_here
   NODE_ENV=production
   PORT=3001
   ```

7. **Click "Create Web Service"**

### Step 4: Wait for Build

- First build takes **5-10 minutes** (installs FontForge)
- Watch the logs for progress
- Wait for **"Your service is live"** message

### Step 5: Copy Backend URL

Once deployed, you'll see a URL like:
```
https://cgfont-backend-xxxx.onrender.com
```

**IMPORTANT:** Copy this URL - you'll need it for frontend deployment!

---

## Part 2: Deploy Frontend on Vercel ⚡

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with your **GitHub account**
4. Authorize Vercel to access your repositories

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. **Import Git Repository:**
   - Find your repository in the list
   - Click **"Import"**

### Step 3: Configure Project

1. **Configure Project Settings:**

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | `Vite` (auto-detected) |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

2. **Environment Variables:**

   Click **"Environment Variables"** and add:

   ```
   VITE_API_URL=https://cgfont-backend-xxxx.onrender.com
   ```

   ⚠️ **Replace with your actual Render backend URL from Part 1, Step 5**

3. **Click "Deploy"**

### Step 4: Wait for Deployment

- Build takes **2-3 minutes**
- Vercel will show deployment progress
- Wait for **"Congratulations!"** message

### Step 5: Get Frontend URL

Once deployed, Vercel provides a URL like:
```
https://cgfont-xxxx.vercel.app
```

---

## Part 3: Connect Backend to Frontend 🔗

### Update Backend CORS

1. Go back to **Render dashboard**
2. Select your **cgfont-backend** service
3. Click **"Environment"** tab
4. Add new environment variable:

   ```
   FRONTEND_URL=https://cgfont-xxxx.vercel.app
   ```

   ⚠️ **Use your actual Vercel URL from Part 2, Step 5**

5. Click **"Save Changes"**
6. Service will automatically redeploy (takes ~2 minutes)

---

## Part 4: Test Your Deployment 🧪

### Test Backend

Visit your backend URL + `/api/health`:
```
https://cgfont-backend-xxxx.onrender.com/api/health
```

Should return:
```json
{"status":"ok"}
```

### Test Frontend

1. Visit your Vercel URL:
   ```
   https://cgfont-xxxx.vercel.app
   ```

2. Try all features:
   - ✅ Download template
   - ✅ Upload and generate font
   - ✅ Font Printer
   - ✅ Assignment Helper (with AI generation)

---

## 🎯 Environment Variables Summary

### Backend (Render)
```env
OPENROUTER_API_KEY=your_actual_openrouter_api_key
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://cgfont-xxxx.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_URL=https://cgfont-backend-xxxx.onrender.com
```

---

## 🔄 Updating Your Application

### Update Code

```bash
# Make your changes locally
git add .
git commit -m "Your update message"
git push origin main
```

### Automatic Deployment

Both platforms auto-deploy when you push to GitHub:
- **Render**: Backend rebuilds automatically (~5 min)
- **Vercel**: Frontend rebuilds automatically (~2 min)

### Manual Redeploy

**Render:**
1. Go to your service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

**Vercel:**
1. Go to your project dashboard
2. Click **"Deployments"** tab
3. Click **"..."** → **"Redeploy"**

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Service not responding
- **Check:** Logs in Render dashboard
- **Solution:** Service may be spinning down (free tier). First request takes 30-60 seconds to wake up

**Problem:** FontForge errors
- **Check:** Build logs for Python/FontForge errors
- **Solution:** Usually memory-related. May need to upgrade plan.

**Problem:** CORS errors
- **Check:** FRONTEND_URL environment variable is set correctly
- **Solution:** Update to exact Vercel URL (no trailing slash)

### Frontend Issues

**Problem:** Can't connect to backend
- **Check:** VITE_API_URL environment variable
- **Solution:** Ensure it points to your Render backend URL (no trailing slash)

**Problem:** Environment variables not updating
- **Solution:** Redeploy after changing environment variables in Vercel

**Problem:** Build fails
- **Check:** Build logs in Vercel dashboard
- **Solution:** Ensure all dependencies are in package.json

### OpenRouter API Issues

**Problem:** "API key not configured"
- **Check:** OPENROUTER_API_KEY is set in Render
- **Solution:** Add it in Render environment variables

**Problem:** Rate limiting errors
- **Check:** OpenRouter dashboard for usage
- **Solution:** Wait a few minutes or upgrade OpenRouter plan

---

## 💰 Cost Breakdown

### Free Tier (Both Platforms)

| Platform | Free Tier | Limitations |
|----------|-----------|-------------|
| **Render** | 750 hours/month | Service spins down after 15 min inactivity |
| **Vercel** | Unlimited | 100GB bandwidth/month |

**Total Monthly Cost:** $0 (with free tiers)

### Paid Plans (If Needed)

| Platform | Paid Plan | Benefits |
|----------|-----------|----------|
| **Render** | $7/month | No spin-down, more resources |
| **Vercel** | $20/month | Priority builds, analytics |

---

## 🎨 Custom Domain (Optional)

### Add Domain to Vercel

1. Go to Vercel project settings
2. Click **"Domains"**
3. Add your domain
4. Follow DNS configuration instructions

### Add Domain to Render

1. Go to Render service settings
2. Click **"Custom Domain"**
3. Add your domain
4. Update DNS with provided CNAME

---

## 📊 Monitoring

### Render Dashboard
- View logs in real-time
- Monitor memory/CPU usage
- Check deployment history

### Vercel Dashboard
- View deployment logs
- Monitor bandwidth usage
- Check performance metrics

---

## ✅ Deployment Checklist

### Before Deployment
- [ ] Code pushed to GitHub
- [ ] .env.example files present
- [ ] .gitignore excludes sensitive files
- [ ] OpenRouter API key ready

### Backend (Render)
- [ ] Service created
- [ ] Docker environment selected
- [ ] Root directory set to `backend`
- [ ] Environment variables added
- [ ] Build successful
- [ ] Health check passing

### Frontend (Vercel)
- [ ] Project imported
- [ ] Root directory set to `frontend`
- [ ] VITE_API_URL configured
- [ ] Build successful
- [ ] Website accessible

### Connection
- [ ] FRONTEND_URL added to Render
- [ ] Backend redeployed
- [ ] CORS working
- [ ] All features tested

---

## 🚀 Quick Commands Reference

```bash
# Git commands
git add .
git commit -m "Your message"
git push origin main

# Test backend locally
cd backend
npm start

# Test frontend locally
cd frontend
npm run dev

# Build frontend locally
cd frontend
npm run build

# Test with Docker locally
docker-compose up --build
```

---

## 📞 Support Resources

### Documentation
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [FontForge](https://fontforge.org/docs/)

### Issues
- Report bugs: [GitHub Issues](https://github.com/your-username/cgfont/issues)

---

## 🎉 Success!

Your Custom Handwriting Font Generator is now live at:
- **Frontend:** `https://cgfont-xxxx.vercel.app`
- **Backend:** `https://cgfont-backend-xxxx.onrender.com`

Share your deployment and start creating beautiful handwriting fonts! ✨

---

## 📝 Summary of Architecture

```
┌─────────────────────────────────────────────┐
│                                             │
│  User Browser                               │
│  https://cgfont-xxxx.vercel.app            │
│                                             │
└──────────────────┬──────────────────────────┘
                   │
                   │ API Requests
                   ▼
┌─────────────────────────────────────────────┐
│                                             │
│  Vercel (Frontend)                          │
│  - React + Vite                             │
│  - Static hosting                           │
│  - CDN distributed                          │
│                                             │
└──────────────────┬──────────────────────────┘
                   │
                   │ VITE_API_URL
                   ▼
┌─────────────────────────────────────────────┐
│                                             │
│  Render (Backend)                           │
│  https://cgfont-backend-xxxx.onrender.com  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Docker Container                   │   │
│  │  - Node.js + Express                │   │
│  │  - Python 3 + FontForge             │   │
│  │  - Sharp (image processing)         │   │
│  │  - Potrace (vectorization)          │   │
│  └─────────────────────────────────────┘   │
│                                             │
└──────────────────┬──────────────────────────┘
                   │
                   │ OpenRouter API
                   ▼
┌─────────────────────────────────────────────┐
│                                             │
│  OpenRouter AI API                          │
│  - Content generation                       │
│  - Assignment helper                        │
│                                             │
└─────────────────────────────────────────────┘
```

**Enjoy your deployed application!** 🎊
