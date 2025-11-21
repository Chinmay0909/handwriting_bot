# ⚡ Quick Deployment Reference

## 🎯 One-Page Cheat Sheet

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

### Step 2: Deploy Backend (Render)

1. **Go to:** [render.com](https://render.com) → Sign in with GitHub
2. **Click:** "New +" → "Web Service"
3. **Settings:**
   - Repository: Your repo
   - Environment: **Docker**
   - Root Directory: **backend**
   - Plan: **Free**
4. **Environment Variables:**
   ```
   OPENROUTER_API_KEY=your_key_here
   NODE_ENV=production
   PORT=3001
   ```
5. **Click:** "Create Web Service"
6. **Wait:** ~5-10 minutes for first build
7. **Copy URL:** `https://cgfont-backend-xxxx.onrender.com`

---

### Step 3: Deploy Frontend (Vercel)

1. **Go to:** [vercel.com](https://vercel.com) → Sign in with GitHub
2. **Click:** "Add New..." → "Project"
3. **Settings:**
   - Repository: Your repo
   - Framework: **Vite** (auto-detected)
   - Root Directory: **frontend**
4. **Environment Variables:**
   ```
   VITE_API_URL=https://cgfont-backend-xxxx.onrender.com
   ```
   ⚠️ Use your Render URL from Step 2
5. **Click:** "Deploy"
6. **Wait:** ~2-3 minutes
7. **Copy URL:** `https://cgfont-xxxx.vercel.app`

---

### Step 4: Connect Them

1. **Go back to Render** → Your backend service
2. **Click:** "Environment" tab
3. **Add variable:**
   ```
   FRONTEND_URL=https://cgfont-xxxx.vercel.app
   ```
   ⚠️ Use your Vercel URL from Step 3
4. **Click:** "Save Changes"
5. **Wait:** ~2 minutes for redeploy

---

### ✅ Done!

**Your app is live at:**
- Frontend: `https://cgfont-xxxx.vercel.app`
- Backend: `https://cgfont-backend-xxxx.onrender.com`

**Test health:** Visit `https://cgfont-backend-xxxx.onrender.com/api/health`

---

## 🔧 Environment Variables Summary

| Platform | Variable | Value |
|----------|----------|-------|
| **Render** | `OPENROUTER_API_KEY` | Your OpenRouter API key |
| **Render** | `NODE_ENV` | `production` |
| **Render** | `PORT` | `3001` |
| **Render** | `FRONTEND_URL` | Your Vercel URL |
| **Vercel** | `VITE_API_URL` | Your Render backend URL |

---

## 🚨 Common Issues

### Backend won't start
- Check logs in Render dashboard
- First request takes 30-60s (service wakes up)

### Frontend can't connect
- Verify `VITE_API_URL` has correct backend URL
- No trailing slash in URLs

### CORS errors
- Check `FRONTEND_URL` is set in Render
- Must be exact Vercel URL

---

## 🔄 To Update

```bash
git add .
git commit -m "Update"
git push origin main
```

Both platforms auto-deploy on push!

---

**Full guide:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
