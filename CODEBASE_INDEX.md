# 🌍 Youth Green Jobs & Waste Recycling Hub - Codebase Index

## 📋 Project Overview

**Project Name**: Youth Green Jobs & Waste Recycling Hub - Kisumu  
**Purpose**: Connecting youth with green jobs and eco-friendly opportunities through waste collection and marketplace  
**Tech Stack**: Django REST Framework + React TypeScript + PostgreSQL  
**Location**: Kisumu, Kenya  
**Target Users**: Youth (18-35), SME Vendors, Administrators  

## 🏗️ Architecture Overview

### Backend (Django REST Framework)
- **Framework**: Django 5.2.6 with Django REST Framework 3.16.1
- **Database**: PostgreSQL with PostGIS support (SpatiaLite for development)
- **Authentication**: JWT with djangorestframework-simplejwt
- **API Structure**: RESTful APIs with versioning (`/api/v1/`)

### Frontend (React TypeScript)
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.6
- **UI Library**: shadcn/ui components with Tailwind CSS 4.1.13
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM 7.9.1

## 📁 Directory Structure

```
youth-green-jobs-hub/
├── 🔧 Backend (Django)
│   ├── youth_green_jobs_backend/     # Main Django project
│   ├── authentication/               # User management & JWT auth
│   ├── waste_collection/            # Waste reporting & collection
│   ├── products/                    # Eco-products marketplace
│   ├── analytics/                   # Platform metrics & dashboards
│   ├── gamification/               # Credits & achievements
│   ├── partnerships/               # SME partnerships
│   ├── eco_products/              # Legacy eco-products (deprecated)
│   └── waste_management/          # Legacy waste management
│
├── 🎨 Frontend (React TypeScript)
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                # Route-based page components
│   │   ├── services/             # API service layer
│   │   ├── types/                # TypeScript type definitions
│   │   ├── contexts/             # React Context providers
│   │   ├── config/               # Configuration & constants
│   │   └── lib/                  # Utility functions
│   └── public/                   # Static assets
│
├── 📚 Documentation
│   └── docs/                     # Technical documentation
│
└── 🛠️ Configuration
    ├── requirements.txt          # Python dependencies
    ├── manage.py                # Django management script
    └── scripts/                 # Utility scripts
```

## 🔑 Core Models & Data Structure

### Authentication (`authentication/models.py`)
- **User**: Extended AbstractUser with youth-specific fields
  - Personal info: age, gender, location (county/sub-county)
  - Education: education_level, skills, interests
  - Employment: employment_status
  - Verification: is_verified, verification_document
  - Preferences: language, notifications

### Waste Collection (`waste_collection/models.py`)
- **WasteCategory**: Types of recyclable waste (plastic, paper, metal, etc.)
- **CollectionPoint**: Physical locations for waste drop-off/collection
- **WasteReport**: User-submitted waste reports with photos & location
- **CreditTransaction**: Credits earned from waste collection
- **CollectionEvent**: Community waste collection events

### Products (`products/models.py`)
- **SMEVendor**: Eco-friendly business profiles
- **Product**: Eco-friendly products in marketplace
- **ProductCategory**: Product categorization
- **Order**: Purchase orders and transactions
- **ShoppingCart**: User shopping cart management
- **ProductReview**: Product ratings and reviews
- **PaymentTransaction**: Payment processing (M-Pesa, Paystack)

### Analytics (`analytics/models.py`)
- **PlatformMetrics**: Daily aggregated platform statistics
- **UserEngagementMetrics**: User activity and engagement data
- **EnvironmentalImpactMetrics**: CO2 reduction and environmental impact
- **CountyMetrics**: Location-based performance metrics
- **SystemPerformanceMetrics**: Technical performance monitoring
- **DashboardAlert**: System alerts and notifications

## 🌐 API Endpoints Structure

### Base URL: `/api/v1/`

#### Authentication (`/auth/`)
- `POST /register/` - User registration
- `POST /login/` - User login
- `POST /logout/` - User logout
- `GET/PUT /profile/` - User profile management
- `POST /token/refresh/` - JWT token refresh

#### Waste Management (`/waste/`)
- `GET /categories/` - Waste categories
- `GET /collection-points/` - Collection points
- `GET /collection-points/nearby/` - Nearby collection points
- `GET/POST /reports/` - Waste reports
- `GET /credits/` - Credit transactions
- `GET/POST /events/` - Collection events

#### Products (`/products/`)
- `GET /products/` - Product catalog
- `GET /vendors/` - SME vendors
- `GET /categories/` - Product categories
- `GET/POST /cart/` - Shopping cart
- `GET/POST /orders/` - Order management
- `POST /payments/initiate/` - Payment processing

#### Analytics (`/analytics/`)
- `GET /platform-metrics/` - Platform statistics
- `GET /dashboard/summary/` - Dashboard summary
- `GET /environmental-impact/` - Environmental metrics
- `GET /county-metrics/` - Location-based metrics

## 🎨 Frontend Component Architecture

### Component Organization
```
components/
├── ui/                    # shadcn/ui base components
│   ├── button.tsx        # Button component
│   ├── card.tsx          # Card component
│   ├── Input.tsx         # Form input component
│   └── SDGCard.tsx       # SDG-themed card component
│
├── auth/                 # Authentication components
│   ├── LoginForm.tsx     # User login form
│   ├── RegisterForm.tsx  # User registration form
│   └── ProfileForm.tsx   # Profile management form
│
├── waste/                # Waste management components
│   ├── WasteReportForm.tsx      # Waste report submission
│   ├── WasteReportsList.tsx     # Waste reports listing
│   ├── CollectionPointsMap.tsx  # Interactive map
│   └── WasteDashboard.tsx       # Waste collection dashboard
│
├── products/             # Marketplace components
│   ├── ProductCard.tsx   # Product display card
│   ├── ProductList.tsx   # Product catalog
│   ├── ShoppingCart.tsx  # Shopping cart
│   └── PaymentModal.tsx  # Payment processing
│
├── analytics/            # Analytics & dashboard components
│   ├── KPICard.tsx       # Key performance indicators
│   ├── ChartCard.tsx     # Data visualization
│   └── SystemHealthCard.tsx # System health monitoring
│
└── layout/               # Layout components
    ├── Navbar.tsx        # Navigation bar
    ├── Footer.tsx        # Page footer
    ├── DashboardLayout.tsx # Dashboard layout
    └── PublicLayout.tsx   # Public pages layout
```

## 🔧 Configuration & Environment

### Backend Configuration (`youth_green_jobs_backend/settings.py`)
- **Database**: Supports PostgreSQL (production) and SpatiaLite (development)
- **Authentication**: JWT with configurable token lifetimes
- **CORS**: Configured for frontend development servers
- **File Uploads**: Organized by type (waste_reports/, products/, etc.)
- **Security**: Comprehensive security headers and HTTPS support
- **Logging**: File and console logging configuration

### Frontend Configuration
- **API Base URL**: Configurable via environment variables
- **Build**: Vite with TypeScript compilation
- **Testing**: Jest with React Testing Library
- **Styling**: Tailwind CSS 4.x with shadcn/ui components

## 📊 Key Features Implemented

### ✅ Completed Features
1. **User Authentication & Profiles**
   - JWT-based authentication
   - Role-based access (Youth, SME, Admin)
   - Profile management with verification

2. **Waste Collection System**
   - Waste report submission with photos
   - Collection points mapping
   - Credit system for waste collection
   - Community collection events

3. **Eco-Products Marketplace**
   - SME vendor registration
   - Product catalog with categories
   - Shopping cart and order management
   - Payment integration (M-Pesa, Paystack)

4. **Analytics Dashboard**
   - Platform-wide metrics
   - Environmental impact tracking
   - County-based performance metrics
   - Real-time system health monitoring

5. **UI/UX Implementation**
   - shadcn/ui design system
   - Responsive design for mobile/desktop
   - SDG-themed color palette
   - Interactive maps and charts

## 🚀 Deployment Configuration

### Backend Deployment
- **Production**: Configured for Heroku deployment
- **Database**: PostgreSQL with PostGIS extension
- **Static Files**: WhiteNoise for static file serving
- **WSGI**: Gunicorn application server

### Frontend Deployment
- **Production**: Configured for Vercel deployment
- **Build**: Optimized Vite production build
- **Environment**: Configurable API endpoints

## 📚 Documentation Status

### Completed Documentation
- `docs/setup-backend-django.md` - Backend setup guide
- `docs/setup-frontend-react-ts.md` - Frontend setup guide
- `docs/api-authentication.md` - Authentication API documentation
- `docs/waste-collection-api.md` - Waste collection API documentation
- `docs/eco-products-api.md` - Products API documentation
- `docs/analytics-api.md` - Analytics API documentation
- `docs/frontend-authentication.md` - Frontend auth implementation
- `docs/frontend-sdg-card-ui.md` - UI component documentation

## 🔄 Git Workflow & Branches

### Active Branches
- `main` - Production-ready code
- `setup-backend-django` - Backend infrastructure
- `setup-frontend-react-ts` - Frontend infrastructure
- `backend-authentication-api` - Authentication system
- `backend-waste-collection` - Waste collection features
- `backend-eco-products` - Marketplace features
- `frontend-authentication-ui` - Frontend auth UI
- `frontend-waste-collection` - Waste collection UI
- `frontend-sdg-card-ui` - UI components
- `monitoring-analytics` - Analytics dashboard

### Recent Activity
- Latest commit: Complete shadcn/ui implementation
- Status: All branches merged to main, working tree clean
- Focus: UI/UX improvements and TypeScript error resolution

## 🎯 Next Steps & Roadmap

### Immediate Priorities
1. **Testing Implementation**
   - Unit tests for backend models and APIs
   - Frontend component testing
   - Integration testing

2. **Performance Optimization**
   - Database query optimization
   - Frontend bundle optimization
   - Image optimization and CDN setup

3. **Production Deployment**
   - Heroku backend deployment
   - Vercel frontend deployment
   - Environment configuration

### Future Enhancements
1. **Mobile App Development**
2. **Advanced Analytics & Reporting**
3. **Multi-language Support**
4. **Advanced Payment Features**
5. **Community Features & Social Integration**

---

**Last Updated**: 2025-01-19  
**Codebase Status**: ✅ MVP Complete, Ready for Testing & Deployment  
**Total Files**: 200+ files across backend and frontend  
**Lines of Code**: ~15,000+ lines (estimated)
