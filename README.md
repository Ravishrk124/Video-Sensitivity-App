# VideoSafe AI Dashboard - Setup & Run Guide

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create a `.env` file in the `backend` directory:

```env
PORT=4000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?appName=YourApp
JWT_SECRET=GENERATE_A_RANDOM_SECRET_KEY_HERE
HUGGINGFACE_API_KEY=
UPLOAD_DIR=./uploads
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourSecurePassword123
NODE_ENV=development
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Note:** To get a HuggingFace API key:
1. Sign up at https://huggingface.co
2. Go to Settings → Access Tokens
3. Create a new token with "Read" permission
4. Copy and paste into `HUGGINGFACE_API_KEY`

### 3. Start Backend Server
```bash
npm start
```

The backend will:
- Connect to MongoDB
- Seed default admin user (email from .env / password from .env)
- Start on `http://localhost:4000`

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE=http://localhost:4000
```

### 3. Start Frontend Dev Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## Default User Accounts

After the backend starts, these accounts are available:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | (from .env ADMIN_PASSWORD) | Admin |

You can create additional Editor and Viewer accounts via the registration form.

---

## Features Overview

### Admin Capabilities
- Upload and delete any video
- Access User Management panel at `/admin`
- Delete users (which also deletes their videos)
- Toggle manual review flags on any video

### Editor Capabilities
- Upload videos
- Delete own videos
- Toggle manual review flags on own videos

### Viewer Capabilities
- View all videos
- Play videos
- Read-only access

---

## AI Analysis

The system uses HuggingFace's `Falconsai/nsfw_image_detection` model to analyze videos:

1. Extracts 3 key frames from uploaded videos (start, middle, end)
2. Sends frames to HuggingFace API
3. Calculates average sensitivity score (0-100%)
4. Videos with score ≥50% are flagged as "Flagged"
5. Videos with score <50% are marked as "Safe"

**Without HuggingFace API Key:** The system will use mock/random scores for development.

---

## Technology Stack

**Backend:**
- Node.js + Express
- MongoDB (Mongoose)
- Socket.IO (Real-time updates)
- FFmpeg (Video processing)
- HuggingFace API (AI analysis)
- JWT (Authentication)

**Frontend:**
- React + Vite
- Tailwind CSS (Styling)
- React Router v6 (Routing)
- Axios (HTTP requests)
- Socket.IO Client (Real-time)
- Lucide React (Icons)

---

## Troubleshooting

### MongoDB Connection Issues
- Verify the `MONGO_URI` is correct
- Check network connectivity
- Ensure MongoDB Atlas allows connections from your IP

### FFmpeg Not Found
Install FFmpeg on your system:
- **macOS**: `brew install ffmpeg`
- **Ubuntu**: `sudo apt-get install ffmpeg`
- **Windows**: Download from https://ffmpeg.org/download.html

### Port Already in Use
Change the `PORT` in backend `.env` file and update `VITE_API_BASE` in frontend `.env` accordingly.

### CORS Errors
Ensure `FRONTEND_ORIGINS` in backend `.env` includes your frontend URL.

---

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper MongoDB connection string
4. Set up environment variables on your hosting platform
5. Ensure FFmpeg is installed on the server

### Frontend
1. Update `VITE_API_BASE` to your production backend URL
2. Build: `npm run build`
3. Deploy the `dist` folder to your hosting platform (Vercel, Netlify, etc.)

---

## Project Structure

```
/backend
  /src
    /config         # Database configuration
    /controllers    # Request handlers
    /middleware     # Auth, roles, upload
    /models         # MongoDB schemas
    /routes         # API routes
    /services       # AI & FFmpeg services
    /utils          # Video processor, seeding
    server.js       # Entry point

/frontend
  /src
    /components     # React components
      /Auth         # Login, Register
      /Dashboard    # Video cards, stats
      /Layout       # Header, Footer
      /Upload       # Dropzone
      /Admin        # User management
    /pages          # Home, AdminPanel
    /hooks          # useSocket
    App.jsx         # Main router
    index.css       # Tailwind styles
```

---

## Support

For questions or issues:
- Email: ravishrk124@gmail.com
- Review implementation plan in `/docs` (if available)

---

**Made by Ravish Kumar**
