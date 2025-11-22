# 🚀 Deployment Guide - VideoSafe AI

## Pre-Deployment Checklist

### ✅ Security Check
- [ ] All sensitive data in `.env` (not committed to Git)
- [ ] `.env.example` files created with placeholder values
- [ ] No hardcoded API keys or secrets in code
- [ ] `.gitignore` properly configured
- [ ] MongoDB connection string not exposed
- [ ] JWT_SECRET is strong and random

### ✅ Testing
- [ ] Backend server runs without errors
- [ ] Frontend builds successfully
- [ ] AI analysis working with Sightengine
- [ ] File uploads functional
- [ ] Authentication working (login/register)
- [ ] Video streaming functional

---

## Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend)

#### **Frontend - Vercel (Recommended)**

1. **Prepare for deployment:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Framework preset: Vite
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables:
     ```
     VITE_API_BASE=https://your-backend-url.onrender.com
     ```

#### **Backend - Render**

1. **Create `render.yaml` in project root:**
   ```yaml
   services:
     - type: web
       name: videosafe-backend
       env: node
       buildCommand: cd backend && npm install
       startCommand: cd backend && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 4000
         - key: MONGO_URI
           sync: false
         - key: JWT_SECRET
           sync: false
         - key: SIGHTENGINE_USER
           sync: false
         - key: SIGHTENGINE_SECRET
           sync: false
         - key: ADMIN_EMAIL
           value: admin@example.com
         - key: ADMIN_PASSWORD
           sync: false
         - key: FRONTEND_ORIGINS
           value: https://your-frontend.vercel.app
   ```

2. **Deploy to Render:**
   - Go to https://render.com
   - Connect GitHub repository
   - Environment variables: Add all from `.env`
   - Install FFmpeg: Add build script
     ```bash
     apt-get update && apt-get install -y ffmpeg
     ```

---

### Option 2: Railway (Full Stack)

1. **Connect Railway to GitHub:**
   - Go to https://railway.app
   - New Project → Deploy from GitHub

2. **Configure Services:**
   - Create two services: `backend` and `frontend`
   - Set root directory for each
   - Add environment variables from `.env.example`

3. **Install FFmpeg on Railway:**
   - Add to `Procfile` or use Nixpacks

---

### Option 3: DigitalOcean App Platform

1. **Create App:**
   - Go to https://cloud.digitalocean.com/apps
   - Create from GitHub

2. **Configure Components:**
   - **Backend**: Node.js service
   - **Frontend**: Static site

3. **Environment Variables:**
   - Add all from `.env.example`
   - Ensure FFmpeg is available in the build environment

---

## Environment Variables for Production

### Backend (.env)
```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/videosafe
JWT_SECRET=<STRONG_RANDOM_SECRET_64_CHARS>
SIGHTENGINE_USER=<your_user_id>
SIGHTENGINE_SECRET=<your_secret>
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<STRONG_PASSWORD>
FRONTEND_ORIGINS=https://yourdomain.com
UPLOAD_DIR=./uploads
```

### Frontend (.env)
```env
VITE_API_BASE=https://your-backend-api.com
```

---

## Post-Deployment Steps

### 1. Test Deployed Application
- [ ] Visit your frontend URL
- [ ] Register/login works
- [ ] Upload a test video
- [ ] Verify AI analysis runs
- [ ] Check video playback
- [ ] Test admin features

### 2. Monitor Sightengine Usage
- Check dashboard: https://sightengine.com/dashboard
- Monitor API calls vs. monthly limit (2,000 free)
- Set up alerts for quota usage

### 3. Database Backups
- Set up automated MongoDB Atlas backups
- Export collections periodically

### 4. SSL/HTTPS
- Ensure both frontend and backend use HTTPS
- Configure CORS properly for your domains

---

## Common Deployment Issues

### FFmpeg Not Found
**Solution:**
- Railway/Render: Add buildpack or install via apt-get
- Vercel: Not supported for backend (use different host)

### CORS Errors
**Solution:**
```javascript
// backend - Update FRONTEND_ORIGINS in .env
FRONTEND_ORIGINS=https://your-frontend.vercel.app,https://yourdomain.com
```

### MongoDB Connection Timeout
**Solution:**
- Whitelist deployment server IP in MongoDB Atlas
- For serverless: Use 0.0.0.0/0 (all IPs) - less secure but necessary

### File Uploads Failing
**Solution:**
- Check file size limits on hosting platform
- Ensure `/uploads` directory has write permissions
- Consider using cloud storage (S3, Cloudinary) for production

---

## Scaling Considerations

### For High Traffic:
1. **Use Cloud Storage:**
   - AWS S3 or Cloudinary for video files
   - Reduces server load and costs

2. **CDN for Frontend:**
   - Vercel includes CDN
   - Or use Cloudflare

3. **Database Optimization:**
   - MongoDB Atlas M10+ for production
   - Enable indexes on frequently queried fields

4. **API Rate Limits:**
   - Sightengine free tier: 2,000 calls/month
   - Upgrade plan if processing >333 videos/month

---

## Monitoring & Maintenance

### Recommended Tools:
- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Error Tracking:** Sentry, LogRocket
- **Analytics:** Google Analytics, Plausible

### Regular Tasks:
- Monitor Sightengine API usage
- Check MongoDB storage usage
- Review error logs weekly
- Update dependencies monthly

---

## Production Optimization

### Backend Performance:
```javascript
// Add compression
npm install compression
// In server.js:
const compression = require('compression');
app.use(compression());
```

### Frontend Build Optimization:
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
}
```

---

## Support & Troubleshooting

**Issues?** Check:
1. Server logs for specific errors
2. Network tab for failed API calls
3. MongoDB Atlas metrics
4. Sightengine API dashboard

**Need Help?**
- Email: ravishrk124@gmail.com
- GitHub Issues: (your-repo-url)

---

**Built by Ravish Kumar**
