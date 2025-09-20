#!/bin/bash

# 🚀 Youth Green Jobs Hub - Render Deployment Script
# This script helps you deploy to Render.com

echo "🚀 Youth Green Jobs Hub - Render Deployment"
echo "============================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    echo ""
    echo "🔗 GitHub Repository Setup Required"
    echo "===================================="
    echo ""
    echo "You need to create a GitHub repository first:"
    echo "1. Go to https://github.com/"
    echo "2. Click 'New repository'"
    echo "3. Name: youth-green-jobs-hub"
    echo "4. Make it PUBLIC (required for Render free tier)"
    echo "5. Don't initialize with README (we have code already)"
    echo "6. Click 'Create repository'"
    echo ""
    read -p "Enter your GitHub username: " GITHUB_USERNAME
    read -p "Enter your repository name (default: youth-green-jobs-hub): " REPO_NAME
    REPO_NAME=${REPO_NAME:-youth-green-jobs-hub}
    
    echo ""
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
    echo "✅ GitHub remote added"
else
    echo "✅ GitHub remote already configured"
fi

# Commit any changes
echo ""
echo "📝 Committing latest changes..."
git add .
if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    git commit -m "Update for Render deployment - $(date)"
    echo "✅ Changes committed"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git branch -M main
if git push -u origin main; then
    echo "✅ Code pushed to GitHub successfully"
else
    echo "❌ Failed to push to GitHub"
    echo "   Make sure you've created the repository on GitHub"
    echo "   and have the correct permissions"
    exit 1
fi

echo ""
echo "🎉 Code Successfully Pushed to GitHub!"
echo "======================================"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://render.com/"
echo "2. Sign up/login with your GitHub account"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Connect your GitHub repository: $REPO_NAME"
echo "5. Use these settings:"
echo ""
echo "   Name: youth-green-jobs-api"
echo "   Environment: Python 3"
echo "   Build Command: ./build.sh"
echo "   Start Command: gunicorn youth_green_jobs_backend.wsgi:application"
echo ""
echo "6. Add Environment Variables:"
echo "   DJANGO_SETTINGS_MODULE=youth_green_jobs_backend.render_settings"
echo "   SECRET_KEY=your-secret-key-here"
echo "   EMAIL_HOST_USER=moffatmokwa12@gmail.com"
echo "   EMAIL_HOST_PASSWORD=submvqaqehrsafag"
echo "   MPESA_CONSUMER_KEY=Ke64cGWZwtUkTVxthjAAlBMifiOnS3zgwQLLoBVGRLHJs4kv"
echo "   MPESA_CONSUMER_SECRET=cAlHJM16AkWBIDnnOlAYQIqyG9FDmiBy4mAfXiOTAKfjPHlwAYIK7H72dMCocYLE"
echo "   MPESA_BUSINESS_SHORT_CODE=174379"
echo "   MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
echo "   MPESA_SANDBOX=True"
echo "   PAYSTACK_PUBLIC_KEY=pk_test_d915e01d46c506ba76e7b594e7c4aa0632754596"
echo "   PAYSTACK_SECRET_KEY=sk_test_b5881958a5fe756e92a31e141ed0a870b6accda5"
echo "   PAYSTACK_SANDBOX=True"
echo ""
echo "7. Create PostgreSQL Database:"
echo "   Click 'New +' → 'PostgreSQL'"
echo "   Name: youth-green-jobs-db"
echo "   Plan: Free"
echo ""
echo "8. Connect Database:"
echo "   Copy the Internal Database URL"
echo "   Add as environment variable: DATABASE_URL"
echo ""
echo "9. Deploy!"
echo "   Click 'Create Web Service'"
echo "   Wait 5-10 minutes for deployment"
echo ""
echo "🎯 Your app will be live at:"
echo "   https://youth-green-jobs-api.onrender.com/api/v1/"
echo ""
echo "📖 For detailed instructions, see: RENDER_DEPLOYMENT_GUIDE.md"
echo ""
echo "🚀 Happy deploying!"
