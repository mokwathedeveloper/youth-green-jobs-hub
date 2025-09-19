# 🚀 Development Setup - Youth Green Jobs Hub

## 📋 Quick Start Guide

This guide will get you up and running with the Youth Green Jobs & Waste Recycling Hub development environment in under 10 minutes.

## 🔧 Prerequisites

### Required Software
- **Python 3.11+** - Backend development
- **Node.js 18+** - Frontend development  
- **Git** - Version control
- **Code Editor** - VS Code recommended

### Optional (for production-like setup)
- **PostgreSQL** - Production database
- **Redis** - Caching (future enhancement)

## ⚡ Quick Setup (5 minutes)

### 1. Clone and Setup Environment
```bash
# Clone the repository
git clone https://github.com/mokwathedeveloper/youth-green-jobs-hub.git
cd youth-green-jobs-hub

# Environment files are already created (.env for backend, frontend/.env for frontend)
# They contain development-ready configurations
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Create logs directory
mkdir -p logs

# Run database migrations (uses SpatiaLite - no PostgreSQL setup needed)
python3 manage.py migrate

# Create a superuser (optional)
python3 manage.py createsuperuser

# Start the Django development server
python3 manage.py runserver
```

The backend will be available at: `http://localhost:8000`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## 🌐 Environment Configuration

### Backend Environment (`.env`)
The `.env` file is pre-configured for development with:
- **Database**: SpatiaLite (SQLite with GIS support)
- **Debug Mode**: Enabled
- **CORS**: Configured for frontend development servers
- **JWT**: 60-minute access tokens, 7-day refresh tokens
- **File Uploads**: Local media directory
- **Security**: Development-friendly settings

### Frontend Environment (`frontend/.env`)
The `frontend/.env` file is configured with:
- **API Base URL**: `http://localhost:8000`
- **Development Features**: Debug mode enabled
- **Geolocation**: Kisumu coordinates as default
- **File Uploads**: 10MB limit for development

## 🔍 Verification Steps

### Backend Verification
```bash
# Check Django configuration
python3 manage.py check

# Verify database setup
python3 manage.py showmigrations

# Test API endpoint
curl http://localhost:8000/api/v1/
```

Expected response:
```json
{
  "message": "Welcome to Youth Green Jobs & Waste Recycling Hub API",
  "version": "1.0.0",
  "endpoints": {
    "authentication": "/api/v1/auth/",
    "waste_management": "/api/v1/waste/",
    "eco_products": "/api/v1/products/",
    "analytics": "/api/v1/analytics/"
  }
}
```

### Frontend Verification
```bash
# Build the frontend (should complete without errors)
npm run build

# Run tests (optional)
npm test
```

## 📱 Available Features

### ✅ Working Features
1. **User Authentication**
   - Registration with role selection (Youth, SME, Admin)
   - JWT-based login/logout
   - Profile management

2. **Waste Collection System**
   - Waste report submission with photos
   - Collection points mapping
   - Credit tracking system

3. **Eco-Products Marketplace**
   - Product catalog browsing
   - SME vendor profiles
   - Shopping cart functionality

4. **Analytics Dashboard**
   - Platform metrics
   - Environmental impact tracking
   - County-based statistics

### 🎨 UI Components
- **shadcn/ui** design system
- **Responsive design** for mobile and desktop
- **SDG-themed colors** (Green #2E7D32, Blue #1976D2)
- **Interactive maps** with Leaflet
- **Charts and visualizations** with Recharts

## 🔧 Development Workflow

### Git Workflow (as per project requirements)
```bash
# Always pull latest changes before starting
git pull origin main
git fetch --all

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, then stage files individually
git add filename1.py
git add filename2.tsx

# Commit with detailed message
git commit -m "[Scope/Module]: Short summary

Detailed explanation of changes and impact."

# Push branch
git push origin feature/your-feature-name

# Create PR and merge to main
# Do NOT delete branch after merge
```

### Code Standards
- **Backend**: Follow Django best practices, use type hints
- **Frontend**: TypeScript strict mode, use shadcn/ui components only
- **API**: RESTful conventions, proper HTTP status codes
- **Documentation**: Update relevant docs/ files with each change

## 🧪 Testing

### Backend Testing
```bash
# Run Django tests
python3 manage.py test

# With coverage (install coverage first: pip install coverage)
coverage run --source='.' manage.py test
coverage report
```

### Frontend Testing
```bash
# Run Jest tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Production Deployment

For production deployment, refer to:
- **DEPLOYMENT_GUIDE.md** - Complete production setup
- **API_REFERENCE.md** - API documentation
- **TECHNICAL_ARCHITECTURE.md** - System architecture details

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Missing logs directory
mkdir -p logs

# Database issues
python3 manage.py migrate --run-syncdb

# Permission issues
chmod +x manage.py
```

#### Frontend Issues
```bash
# Dependency conflicts
npm install --legacy-peer-deps

# Build issues
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Port conflicts
# Change port in vite.config.ts or use: npm run dev -- --port 3001
```

### Environment Issues
- Ensure `.env` files exist in root and `frontend/` directories
- Check that `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Verify `VITE_API_BASE_URL` points to your backend server

## 📚 Additional Resources

- **CODEBASE_INDEX.md** - Complete project overview
- **API_REFERENCE.md** - Detailed API documentation
- **TESTING_GUIDE.md** - Comprehensive testing strategies
- **docs/** directory - Feature-specific documentation

## 🎯 Next Steps

1. **Explore the codebase** using the documentation
2. **Run the test suite** to ensure everything works
3. **Create a test user** and explore the features
4. **Check the admin interface** at `http://localhost:8000/admin/`
5. **Review the API** at `http://localhost:8000/api/v1/`

---

**Setup Status**: ✅ Ready for Development  
**Estimated Setup Time**: 5-10 minutes  
**Support**: Check GitHub Issues or documentation  
**Last Updated**: 2025-01-19
