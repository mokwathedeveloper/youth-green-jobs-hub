#!/bin/bash

# Youth Green Jobs Hub - Build Script
# This script builds both frontend and backend for production

set -e  # Exit on any error

echo "🚀 Building Youth Green Jobs Hub"
echo "================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "manage.py" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Build Frontend
print_status "Building Frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

# Run frontend build
print_status "Running frontend build..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend build completed successfully!"
    
    # Show build output info
    if [ -f "dist/index.html" ]; then
        print_status "Build artifacts created in frontend/dist/"
        ls -la dist/
    fi
else
    print_error "Frontend build failed!"
    exit 1
fi

# Go back to project root
cd ..

# Build Backend
print_status "Building Backend..."

# Check if virtual environment exists
if [ ! -d "venv_working" ]; then
    print_warning "Virtual environment not found. Please create it first:"
    print_warning "python -m venv venv_working"
    print_warning "source venv_working/bin/activate"
    print_warning "pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment and run backend build tasks
print_status "Activating virtual environment..."
source venv_working/bin/activate

print_status "Collecting static files..."
python manage.py collectstatic --noinput

print_status "Running Django system check..."
python manage.py check

if [ $? -eq 0 ]; then
    print_success "Backend build completed successfully!"
    print_status "Static files collected in staticfiles/"
else
    print_error "Backend build failed!"
    exit 1
fi

# Summary
echo ""
echo "🎉 BUILD SUMMARY"
echo "================"
print_success "✅ Frontend: Production build created in frontend/dist/"
print_success "✅ Backend: Static files collected, system check passed"
echo ""
print_status "📦 Build artifacts ready for deployment:"
print_status "   - Frontend: frontend/dist/ (ready for Vercel)"
print_status "   - Backend: staticfiles/ (ready for Render)"
echo ""
print_status "🚀 To deploy:"
print_status "   - Frontend deploys automatically on git push (Vercel)"
print_status "   - Backend deploys automatically on git push (Render)"
echo ""
print_success "Build completed successfully! 🎉"
