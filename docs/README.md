# 📚 Youth Green Jobs Hub - Documentation Index

Welcome to the comprehensive documentation for the Youth Green Jobs & Waste Recycling Hub platform.

## 📋 Quick Navigation

### 🚀 Getting Started
- [Main README](../README.md) - Project overview and quick start
- [Development Setup](development/DEVELOPMENT_SETUP.md) - Complete development environment setup
- [Technical Architecture](../TECHNICAL_ARCHITECTURE.md) - System architecture overview
- [Codebase Index](../CODEBASE_INDEX.md) - Detailed codebase structure and organization

### 🛠️ Development
- **Setup & Configuration**
  - [Backend Django Setup](development/setup-backend-django.md)
  - [Frontend React TypeScript Setup](development/setup-frontend-react-ts.md)
  - [Configuration Guide](development/configuration-guide.md)
  - [Configuration Migration Guide](development/configuration-migration-guide.md)

- **Development Workflow**
  - [Pull Request Guidelines](development/PULL_REQUEST.md)
  - [Testing Guide](development/TESTING_GUIDE.md)

### 🌐 API Documentation
- **Core APIs**
  - [API Reference](api/API_REFERENCE.md) - Complete API documentation
  - [Authentication API](api/api-authentication.md)
  - [Waste Collection API](api/waste-collection-api.md)
  - [Eco Products API](api/eco-products-api.md)
  - [Analytics API](api/analytics-api.md)

- **Integration**
  - [Payment Gateway Setup](api/PAYMENT_GATEWAY_SETUP.md)

### 🚀 Deployment
- **Production Deployment**
  - [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md) - Main deployment guide
  - [Production Setup](deployment/PRODUCTION_SETUP.md)
  - [Production Ready Checklist](deployment/PRODUCTION_READY.md)
  - [Production First Setup](deployment/PRODUCTION_FIRST_SETUP.md)

- **Platform-Specific Deployment**
  - [Render Deployment Guide](deployment/RENDER_DEPLOYMENT_GUIDE.md)
  - [Heroku Deployment](deployment/heroku_deployment.md)
  - [Vercel Deployment](deployment/vercel_deployment.md)

- **Deployment Checklists**
  - [Deployment Checklist](deployment/DEPLOYMENT_CHECKLIST.md)
  - [Complete Deployment Checklist](deployment/COMPLETE_DEPLOYMENT_CHECKLIST.md)

### 📖 User & Admin Guides
- **Technical Guides**
  - [Analytics Technical Guide](guides/analytics-technical.md)
  - [Eco Products Technical Guide](guides/eco-products-technical.md)
  - [Frontend Authentication](guides/frontend-authentication.md)
  - [Frontend SDG Card UI](guides/frontend-sdg-card-ui.md)

- **Admin Guides**
  - [Analytics Admin Guide](guides/analytics-admin-guide.md)
  - [Eco Products User Guide](guides/eco-products-user-guide.md)

- **Business & Planning**
  - [Business Requirements Checklist](guides/BUSINESS_REQUIREMENTS_CHECKLIST.md)
  - [30 Day Action Plan](guides/30_DAY_ACTION_PLAN.md)

## 🏗️ Documentation Structure

```
docs/
├── README.md                    # This index file
├── api/                        # API documentation
│   ├── API_REFERENCE.md
│   ├── api-authentication.md
│   ├── analytics-api.md
│   ├── eco-products-api.md
│   ├── waste-collection-api.md
│   └── PAYMENT_GATEWAY_SETUP.md
├── deployment/                 # Deployment guides
│   ├── DEPLOYMENT_GUIDE.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── COMPLETE_DEPLOYMENT_CHECKLIST.md
│   ├── PRODUCTION_SETUP.md
│   ├── PRODUCTION_READY.md
│   ├── PRODUCTION_FIRST_SETUP.md
│   ├── RENDER_DEPLOYMENT_GUIDE.md
│   ├── heroku_deployment.md
│   └── vercel_deployment.md
├── development/               # Development guides
│   ├── DEVELOPMENT_SETUP.md
│   ├── TESTING_GUIDE.md
│   ├── PULL_REQUEST.md
│   ├── setup-backend-django.md
│   ├── setup-frontend-react-ts.md
│   ├── configuration-guide.md
│   └── configuration-migration-guide.md
└── guides/                   # User and admin guides
    ├── analytics-admin-guide.md
    ├── analytics-technical.md
    ├── eco-products-technical.md
    ├── eco-products-user-guide.md
    ├── frontend-authentication.md
    ├── frontend-sdg-card-ui.md
    ├── BUSINESS_REQUIREMENTS_CHECKLIST.md
    └── 30_DAY_ACTION_PLAN.md
```

## 🔍 Finding What You Need

### For Developers
1. **New to the project?** Start with [Development Setup](development/DEVELOPMENT_SETUP.md)
2. **Working on APIs?** Check [API Reference](api/API_REFERENCE.md)
3. **Frontend development?** See [Frontend guides](development/setup-frontend-react-ts.md)
4. **Backend development?** See [Backend guides](development/setup-backend-django.md)

### For DevOps/Deployment
1. **First deployment?** Follow [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md)
2. **Platform-specific?** Check the relevant deployment guide in `deployment/`
3. **Production checklist?** Use [Complete Deployment Checklist](deployment/COMPLETE_DEPLOYMENT_CHECKLIST.md)

### For Product/Business
1. **Requirements?** See [Business Requirements Checklist](guides/BUSINESS_REQUIREMENTS_CHECKLIST.md)
2. **Planning?** Check [30 Day Action Plan](guides/30_DAY_ACTION_PLAN.md)
3. **User guides?** Browse the `guides/` directory

## 📝 Contributing to Documentation

When adding or updating documentation:

1. **Follow the structure** - Place files in the appropriate subdirectory
2. **Update this index** - Add new documents to the relevant section
3. **Use clear titles** - Make documents easy to find and understand
4. **Cross-reference** - Link to related documents when helpful
5. **Keep it current** - Update docs when code changes

## 🆘 Need Help?

If you can't find what you're looking for:

1. Check the [Main README](../README.md) for basic information
2. Look at the [Technical Architecture](../TECHNICAL_ARCHITECTURE.md) for system overview
3. Browse the [Codebase Index](../CODEBASE_INDEX.md) for code organization
4. Contact the development team for additional support

---

**Last Updated:** 2025-09-22  
**Version:** 1.0.0
