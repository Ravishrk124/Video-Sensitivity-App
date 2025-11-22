#!/bin/bash

# ======================================
# VideoSafe AI - Quick Setup Script
# ======================================

echo "🎬 VideoSafe AI - Quick Setup"
echo "=============================="
echo ""

# Check if .env files exist
echo "📝 Checking environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found!"
    echo "📄 Creating from .env.example..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - PLEASE EDIT IT WITH YOUR CREDENTIALS!"
else
    echo "✅ backend/.env exists"
fi

# Frontend .env  
if [ ! -f "frontend/.env" ]; then
    echo "⚠️  frontend/.env not found!"
    echo "📄 Creating from .env.example..."
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "✅ frontend/.env exists"
fi

echo ""
echo "📦 Installing dependencies..."

# Backend dependencies
echo "  → Installing backend dependencies..."
cd backend
npm install
cd ..

# Frontend dependencies
echo "  → Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "⚙️  NEXT STEPS:"
echo "1. Edit backend/.env with your credentials:"
echo "   - MongoDB connection string"
echo "   - JWT secret key"
echo "   - Sightengine API credentials"
echo "   - Admin email/password"
echo ""
echo "2. Ensure FFmpeg is installed:"
echo "   - macOS: brew install ffmpeg"
echo "   - Ubuntu: sudo apt-get install ffmpeg"
echo ""
echo "3. Start the servers:"
echo "   - Backend:  cd backend && npm start"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "📚 For deployment instructions, see DEPLOYMENT.md"
echo ""
echo "🚀 Happy coding!"
