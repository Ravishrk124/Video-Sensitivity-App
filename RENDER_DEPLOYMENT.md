# VideoSafe AI Backend - Render Deployment Guide

## 🚀 Quick Deploy to Render (FREE)

### Step 1: Create render.yaml
Already created in your project root! This tells Render how to deploy your backend.

### Step 2: Deploy on Render

1. **Go to**: https://render.com/
2. **Sign in** with your GitHub account
3. **Click**: "New +" → "Web Service"
4. **Connect repository**: `Ravishrk124/video-sensitivity-app`
5. **Configure**:
   - **Name**: `video-sensitivity-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Add Environment Variables

In Render dashboard, add these environment variables:

```
MONGO_URI=<YOUR_MONGODB_CONNECTION_STRING>
JWT_SECRET=<YOUR_SECRET_KEY>
HUGGINGFACE_API_KEY=
UPLOAD_DIR=./uploads
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<YOUR_ADMIN_PASSWORD>
NODE_ENV=production
PORT=4000
FRONTEND_ORIGINS=https://video-sensitivity-app.vercel.app
```

**⚠️ IMPORTANT**: Replace the placeholder values with your actual credentials from your local `.env` file.

### Step 4: Deploy!

Click "Create Web Service" - Render will:
- Install dependencies
- Start your backend
- Give you a URL like: `https://video-sensitivity-backend.onrender.com`

### Step 5: Update Frontend Environment Variable

In **Vercel Dashboard**:
1. Go to your project settings
2. **Environment Variables**
3. Add: `VITE_API_BASE` = `https://video-sensitivity-backend.onrender.com`
4. **Redeploy frontend**

---

## ⚡ Alternative: Quick Fix for Testing

If you just want to test quickly, you can temporarily:

1. **Change** `axiosClient.js` to auto-detect production
2. I can make this change for you!

Let me know which approach you prefer!
