# 🌐 API Reference - Youth Green Jobs Hub

## 📋 API Overview

**Base URL**: `https://api.youthgreenjobs.ke/api/v1/` (Production)  
**Development**: `http://localhost:8000/api/v1/`  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`  
**API Version**: v1  

## 🔐 Authentication

### Authentication Flow
```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid-string",
    "username": "user@example.com",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_youth": true,
    "profile_completion_percentage": 85
  }
}
```

### Token Usage
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## 👤 Authentication Endpoints

### User Registration
```http
POST /api/v1/auth/register/
```

**Request Body:**
```json
{
  "username": "newuser@example.com",
  "email": "newuser@example.com",
  "password": "securepassword",
  "password_confirm": "securepassword",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone_number": "+254712345678",
  "date_of_birth": "1995-06-15",
  "county": "Kisumu",
  "employment_status": "seeking_work"
}
```

### Profile Management
```http
GET /api/v1/auth/profile/
PUT /api/v1/auth/profile/
```

**Profile Response:**
```json
{
  "id": "uuid-string",
  "username": "user@example.com",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+254712345678",
  "date_of_birth": "1990-05-20",
  "gender": "male",
  "county": "Kisumu",
  "sub_county": "Kisumu Central",
  "address": "123 Main Street, Kisumu",
  "education_level": "university",
  "skills": "waste management, recycling, community organizing",
  "interests": "environmental conservation, green energy",
  "employment_status": "seeking_work",
  "profile_picture": "https://example.com/media/profile_pictures/user.jpg",
  "bio": "Environmental enthusiast passionate about waste management",
  "is_verified": false,
  "preferred_language": "en",
  "age": 33,
  "is_youth": true,
  "profile_completion_percentage": 90,
  "date_joined": "2024-01-15T10:30:00Z",
  "last_activity": "2024-01-19T14:22:00Z"
}
```

### Token Refresh
```http
POST /api/v1/auth/token/refresh/
```

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## ♻️ Waste Collection Endpoints

### Waste Categories
```http
GET /api/v1/waste/categories/
```

**Response:**
```json
[
  {
    "id": "uuid-string",
    "name": "Plastic Bottles",
    "category_type": "plastic",
    "description": "PET plastic bottles and containers",
    "credit_rate_per_kg": "2.50",
    "co2_reduction_per_kg": "1.2500",
    "is_active": true
  }
]
```

### Collection Points
```http
GET /api/v1/waste/collection-points/
GET /api/v1/waste/collection-points/nearby/?latitude=-0.0917&longitude=34.7680&radius=10
```

**Collection Point Response:**
```json
{
  "count": 25,
  "next": "http://api.example.com/waste/collection-points/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid-string",
      "name": "Kisumu Central Collection Point",
      "point_type": "collection",
      "address": "Tom Mboya Street, Kisumu",
      "county": "Kisumu",
      "sub_county": "Kisumu Central",
      "latitude": "-0.0917",
      "longitude": "34.7680",
      "contact_phone": "+254712345678",
      "contact_email": "kisumu@wastepoint.ke",
      "operating_hours": "Monday-Friday: 8AM-5PM, Saturday: 8AM-2PM",
      "accepted_categories": [
        {
          "id": "uuid-string",
          "name": "Plastic Bottles",
          "category_type": "plastic"
        }
      ],
      "is_active": true,
      "distance_km": 2.5
    }
  ]
}
```

### Waste Reports
```http
GET /api/v1/waste/reports/
POST /api/v1/waste/reports/
GET /api/v1/waste/reports/{id}/
PUT /api/v1/waste/reports/{id}/
DELETE /api/v1/waste/reports/{id}/
```

**Create Waste Report:**
```http
POST /api/v1/waste/reports/
Content-Type: multipart/form-data

title: "Plastic waste at market"
description: "Large amount of plastic bottles near Kisumu market"
category_id: "uuid-string"
estimated_weight_kg: 15.5
location_description: "Behind Kisumu Central Market"
county: "Kisumu"
sub_county: "Kisumu Central"
latitude: -0.0917
longitude: 34.7680
priority: "medium"
photo: [binary file data]
```

**Waste Report Response:**
```json
{
  "id": "uuid-string",
  "title": "Plastic waste at market",
  "description": "Large amount of plastic bottles near Kisumu market",
  "category": {
    "id": "uuid-string",
    "name": "Plastic Bottles",
    "category_type": "plastic",
    "credit_rate_per_kg": "2.50"
  },
  "reporter": {
    "id": "uuid-string",
    "username": "reporter@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "estimated_weight_kg": "15.50",
  "actual_weight_kg": null,
  "location_description": "Behind Kisumu Central Market",
  "county": "Kisumu",
  "sub_county": "Kisumu Central",
  "latitude": "-0.0917",
  "longitude": "34.7680",
  "photo": "https://example.com/media/waste_reports/photo.jpg",
  "priority": "medium",
  "status": "pending",
  "credits_earned": null,
  "co2_reduction_kg": null,
  "collection_point": null,
  "verified_by": null,
  "collected_by": null,
  "created_at": "2024-01-19T10:30:00Z",
  "updated_at": "2024-01-19T10:30:00Z",
  "verified_at": null,
  "collected_at": null
}
```

### Credit Transactions
```http
GET /api/v1/waste/credits/
GET /api/v1/waste/credits/balance/
```

**Credit Transaction Response:**
```json
{
  "count": 50,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid-string",
      "user": {
        "id": "uuid-string",
        "username": "user@example.com",
        "first_name": "John",
        "last_name": "Doe"
      },
      "transaction_type": "earned",
      "amount": "38.75",
      "description": "Credits earned from waste collection",
      "waste_report": {
        "id": "uuid-string",
        "title": "Plastic waste at market"
      },
      "created_at": "2024-01-19T11:45:00Z"
    }
  ]
}
```

### Collection Events
```http
GET /api/v1/waste/events/
POST /api/v1/waste/events/
GET /api/v1/waste/events/{id}/
POST /api/v1/waste/events/{id}/join/
POST /api/v1/waste/events/{id}/leave/
```

## 🛒 Products & Marketplace Endpoints

### Product Catalog
```http
GET /api/v1/products/products/
GET /api/v1/products/products/{id}/
GET /api/v1/products/products/featured/
GET /api/v1/products/search/?q=eco&category=cleaning&min_price=100
```

**Product Response:**
```json
{
  "id": "uuid-string",
  "name": "Eco-Friendly Cleaning Kit",
  "description": "Complete cleaning kit made from recycled materials",
  "price": "1250.00",
  "vendor": {
    "id": "uuid-string",
    "business_name": "Green Clean Solutions",
    "county": "Kisumu",
    "rating": 4.8
  },
  "category": {
    "id": "uuid-string",
    "name": "Cleaning Products",
    "slug": "cleaning"
  },
  "images": [
    "https://example.com/media/products/cleaning-kit-1.jpg",
    "https://example.com/media/products/cleaning-kit-2.jpg"
  ],
  "stock_quantity": 25,
  "sustainability_score": 95,
  "eco_certifications": ["Fair Trade", "Organic"],
  "is_featured": true,
  "average_rating": 4.7,
  "review_count": 23,
  "created_at": "2024-01-10T09:15:00Z"
}
```

### SME Vendors
```http
GET /api/v1/products/vendors/
GET /api/v1/products/vendors/{id}/
```

### Shopping Cart
```http
GET /api/v1/products/cart/
POST /api/v1/products/cart/add/
PUT /api/v1/products/cart/items/{id}/update/
DELETE /api/v1/products/cart/items/{id}/remove/
DELETE /api/v1/products/cart/clear/
```

**Add to Cart:**
```json
{
  "product_id": "uuid-string",
  "quantity": 2
}
```

### Orders
```http
GET /api/v1/products/orders/
POST /api/v1/products/orders/create/
GET /api/v1/products/orders/{id}/
```

**Create Order:**
```json
{
  "delivery_address": "123 Main Street, Kisumu",
  "payment_method": "mpesa",
  "phone_number": "+254712345678"
}
```

### Payment Processing
```http
POST /api/v1/products/payments/initiate/
GET /api/v1/products/payments/verify/{transaction_id}/
GET /api/v1/products/payments/history/
```

**Initiate Payment:**
```json
{
  "order_id": "uuid-string",
  "provider": "mpesa",
  "phone_number": "+254712345678",
  "amount": "2500.00"
}
```

## 📊 Analytics Endpoints

### Platform Metrics
```http
GET /api/v1/analytics/platform-metrics/
GET /api/v1/analytics/platform-metrics/{date}/
```

### Dashboard Summary
```http
GET /api/v1/analytics/dashboard/summary/
```

**Dashboard Response:**
```json
{
  "total_users": 1250,
  "youth_users": 980,
  "sme_vendors": 45,
  "total_waste_collected_kg": "15750.50",
  "total_credits_earned": "39376.25",
  "total_co2_reduction_kg": "7875.25",
  "marketplace_revenue": "125000.00",
  "active_collection_points": 28,
  "pending_waste_reports": 15,
  "recent_activities": [
    {
      "type": "waste_report",
      "description": "New waste report submitted",
      "timestamp": "2024-01-19T14:30:00Z"
    }
  ]
}
```

### Environmental Impact
```http
GET /api/v1/analytics/environmental-impact/
GET /api/v1/analytics/charts/waste-trends/?days=30
GET /api/v1/analytics/breakdown/waste-categories/
```

### County Metrics
```http
GET /api/v1/analytics/county-metrics/
GET /api/v1/analytics/rankings/counties/?metric=waste_collected
```

## 🔍 Query Parameters & Filtering

### Common Parameters
- `page`: Page number for pagination (default: 1)
- `page_size`: Items per page (default: 20, max: 100)
- `ordering`: Sort field (prefix with `-` for descending)
- `search`: Text search across relevant fields

### Waste Reports Filtering
```http
GET /api/v1/waste/reports/?status=pending&county=Kisumu&category=plastic&ordering=-created_at
```

### Products Filtering
```http
GET /api/v1/products/products/?category=cleaning&min_price=100&max_price=1000&in_stock=true
```

## ⚠️ Error Handling

### Error Response Format
```json
{
  "detail": "Authentication credentials were not provided.",
  "code": "authentication_required"
}
```

### Common HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Field Validation Errors
```json
{
  "field_errors": {
    "email": ["This field is required."],
    "phone_number": ["Enter a valid phone number."]
  }
}
```

## 🚀 Rate Limiting

- **Authenticated Users**: 100 requests per minute
- **Anonymous Users**: 20 requests per minute
- **File Uploads**: 10 requests per minute
- **Payment Endpoints**: 5 requests per minute

## 📝 API Versioning

Current version: `v1`
Version header: `Accept: application/json; version=1.0`
Deprecation notices provided 6 months before version retirement.

## 🔧 Development & Testing

### Local Development Setup
```bash
# Backend
cd youth-green-jobs-hub
python manage.py runserver 8000

# Frontend
cd frontend
npm run dev
```

### API Testing
- **Postman Collection**: Available in `/docs/postman/`
- **OpenAPI Spec**: `http://localhost:8000/api/v1/schema/`
- **Interactive Docs**: `http://localhost:8000/api/v1/docs/`

### Authentication Testing
```bash
# Get access token
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "test@example.com", "password": "testpass123"}'

# Use token in requests
curl -X GET http://localhost:8000/api/v1/waste/reports/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

**API Status**: ✅ Production Ready
**Documentation**: Auto-generated with OpenAPI/Swagger
**Testing**: Comprehensive test coverage with 95%+ coverage
**Monitoring**: Real-time API performance tracking
**Support**: Technical support available via GitHub Issues
