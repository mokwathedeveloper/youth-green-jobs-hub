# Eco Products API Documentation

## Overview

The Eco Products API provides comprehensive marketplace functionality for the Youth Green Jobs & Waste Recycling Hub. It enables SME vendors to manage their eco-friendly products and allows youth to browse, purchase, and track orders using credits earned from waste collection activities.

## Base URL

```
http://localhost:8000/api/v1/products/
```

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Product Categories

#### List Categories
```http
GET /categories/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Eco-Friendly Bags",
    "description": "Reusable and biodegradable bags",
    "parent": null,
    "children": [
      {
        "id": "uuid",
        "name": "Shopping Bags",
        "description": "Reusable shopping bags"
      }
    ],
    "product_count": 15,
    "created_at": "2025-09-18T20:00:00Z"
  }
]
```

#### Create Category
```http
POST /categories/
```

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description",
  "parent": "parent_category_uuid"
}
```

### SME Vendors

#### List Vendors
```http
GET /vendors/
```

**Query Parameters:**
- `county`: Filter by county
- `verified`: Filter by verification status (true/false)
- `eco_certified`: Filter by eco certification (true/false)

**Response:**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/v1/products/vendors/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "business_name": "Green Solutions Kenya",
      "business_registration_number": "BRS123456",
      "county": "Kisumu",
      "sub_county": "Kisumu Central",
      "phone_number": "+254712345678",
      "email": "info@greensolutions.co.ke",
      "is_verified": true,
      "is_eco_certified": true,
      "eco_credentials": "Kenya Bureau of Standards certified",
      "product_count": 12,
      "average_rating": 4.5,
      "created_at": "2025-09-18T20:00:00Z"
    }
  ]
}
```

#### Get Vendor Details
```http
GET /vendors/{vendor_id}/
```

#### Register as Vendor
```http
POST /vendors/
```

**Request Body:**
```json
{
  "business_name": "My Eco Business",
  "business_registration_number": "BRS789012",
  "county": "Kisumu",
  "sub_county": "Kisumu Central",
  "address": "123 Green Street, Kisumu",
  "phone_number": "+254712345678",
  "email": "contact@myecobusiness.co.ke",
  "website": "https://myecobusiness.co.ke",
  "description": "We create sustainable products",
  "eco_credentials": "Certified by Kenya Association of Manufacturers"
}
```

### Products

#### List Products
```http
GET /products/
```

**Query Parameters:**
- `q`: Search query
- `category`: Category UUID
- `vendor`: Vendor UUID
- `county`: Filter by vendor county
- `min_price`: Minimum price
- `max_price`: Maximum price
- `eco_friendly`: Filter eco-friendly products (true/false)
- `in_stock`: Filter in-stock products (true/false)
- `ordering`: Sort by (price, -price, created_at, -created_at, name, -name)
- `page`: Page number
- `page_size`: Items per page (default: 12)

**Response:**
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/v1/products/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "name": "Eco-Friendly Water Bottle",
      "description": "Reusable stainless steel water bottle",
      "price": "1500.00",
      "credit_price": "150.00",
      "vendor": {
        "id": "uuid",
        "business_name": "Green Solutions Kenya",
        "county": "Kisumu",
        "is_verified": true
      },
      "category": {
        "id": "uuid",
        "name": "Drinkware"
      },
      "featured_image": "http://localhost:8000/media/products/bottle.jpg",
      "in_stock": true,
      "stock_quantity": 25,
      "eco_friendly_features": "Made from recycled materials",
      "recyclable": true,
      "biodegradable": false,
      "carbon_footprint_kg": "0.5",
      "average_rating": 4.2,
      "review_count": 8,
      "created_at": "2025-09-18T20:00:00Z"
    }
  ]
}
```

#### Get Product Details
```http
GET /products/{product_id}/
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Eco-Friendly Water Bottle",
  "description": "Premium reusable stainless steel water bottle with insulation",
  "price": "1500.00",
  "credit_price": "150.00",
  "vendor": {
    "id": "uuid",
    "business_name": "Green Solutions Kenya",
    "county": "Kisumu",
    "phone_number": "+254712345678",
    "is_verified": true,
    "is_eco_certified": true
  },
  "category": {
    "id": "uuid",
    "name": "Drinkware",
    "parent": {
      "id": "uuid",
      "name": "Kitchen & Dining"
    }
  },
  "images": [
    {
      "id": "uuid",
      "image": "http://localhost:8000/media/products/bottle1.jpg",
      "alt_text": "Front view of water bottle",
      "is_featured": true
    }
  ],
  "in_stock": true,
  "stock_quantity": 25,
  "low_stock_threshold": 5,
  "eco_friendly_features": "Made from 100% recycled stainless steel",
  "recyclable": true,
  "biodegradable": false,
  "carbon_footprint_kg": "0.5",
  "sustainability_score": 85,
  "certifications": ["Kenya Bureau of Standards", "ISO 14001"],
  "average_rating": 4.2,
  "review_count": 8,
  "created_at": "2025-09-18T20:00:00Z",
  "updated_at": "2025-09-18T20:00:00Z"
}
```

#### Create Product (Vendor Only)
```http
POST /products/
```

**Request Body:**
```json
{
  "name": "New Eco Product",
  "description": "Product description",
  "price": "2000.00",
  "credit_price": "200.00",
  "category": "category_uuid",
  "stock_quantity": 50,
  "low_stock_threshold": 10,
  "eco_friendly_features": "Made from sustainable materials",
  "recyclable": true,
  "biodegradable": false,
  "carbon_footprint_kg": "1.2"
}
```

### Product Recommendations

#### Get Product Recommendations
```http
GET /products/{product_id}/recommendations/
```

**Response:**
```json
{
  "similar_products": [
    {
      "id": "uuid",
      "name": "Similar Product",
      "price": "1200.00",
      "featured_image": "http://localhost:8000/media/products/similar.jpg"
    }
  ],
  "vendor_products": [
    {
      "id": "uuid",
      "name": "Another Product from Same Vendor",
      "price": "1800.00",
      "featured_image": "http://localhost:8000/media/products/vendor.jpg"
    }
  ],
  "category_products": [
    {
      "id": "uuid",
      "name": "Product in Same Category",
      "price": "1600.00",
      "featured_image": "http://localhost:8000/media/products/category.jpg"
    }
  ]
}
```

### Shopping Cart

#### Get Cart
```http
GET /cart/
```

**Response:**
```json
{
  "id": "uuid",
  "items": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Eco-Friendly Water Bottle",
        "featured_image": "http://localhost:8000/media/products/bottle.jpg"
      },
      "quantity": 2,
      "unit_price": "1500.00",
      "total_price": "3000.00"
    }
  ],
  "total_items": 2,
  "total_amount": "3000.00",
  "created_at": "2025-09-18T20:00:00Z",
  "updated_at": "2025-09-18T20:00:00Z"
}
```

#### Add to Cart
```http
POST /cart/add/
```

**Request Body:**
```json
{
  "product_id": "product_uuid",
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /cart/items/{item_id}/
```

**Request Body:**
```json
{
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /cart/items/{item_id}/
```

#### Clear Cart
```http
DELETE /cart/clear/
```

### Orders

#### List Orders
```http
GET /orders/
```

**Query Parameters:**
- `status`: Filter by status (pending, confirmed, shipped, delivered, cancelled)
- `payment_method`: Filter by payment method
- `date_from`: Filter orders from date (YYYY-MM-DD)
- `date_to`: Filter orders to date (YYYY-MM-DD)

#### Create Order
```http
POST /orders/
```

**Request Body:**
```json
{
  "items": [
    {
      "product_id": "product_uuid",
      "quantity": 2
    }
  ],
  "delivery_county": "Kisumu",
  "delivery_sub_county": "Kisumu Central",
  "delivery_address": "123 Main Street, Kisumu",
  "delivery_phone": "+254712345678",
  "delivery_instructions": "Call when you arrive",
  "payment_method": "credits",
  "customer_notes": "Please handle with care"
}
```

#### Get Order Details
```http
GET /orders/{order_id}/
```

### Product Reviews

#### List Product Reviews
```http
GET /products/{product_id}/reviews/
```

#### Create Review
```http
POST /products/{product_id}/reviews/
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent product! Highly recommended.",
  "verified_purchase": true
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "field_name": ["This field is required."]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred."
}
```

## Rate Limiting

API requests are limited to:
- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated users

## Pagination

List endpoints use cursor-based pagination:
- `count`: Total number of items
- `next`: URL for next page
- `previous`: URL for previous page
- `results`: Array of items

Default page size is 12 items. Maximum page size is 100.

## Filtering and Search

### Search
Use the `q` parameter for full-text search across product names and descriptions.

### Filtering
Multiple filters can be combined. All filters use AND logic.

### Ordering
Use the `ordering` parameter with field names. Prefix with `-` for descending order.

Examples:
- `ordering=price` (ascending price)
- `ordering=-created_at` (newest first)
- `ordering=name,-price` (name ascending, then price descending)
