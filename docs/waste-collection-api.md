# Waste Collection API Documentation

## Overview

The Waste Collection API is a comprehensive system for managing waste reporting, collection tracking, and credit management for the Youth Green Jobs & Waste Recycling Hub. This API enables youth to report waste, track collections, earn credits, and participate in community cleanup events.

## Base URL

```
http://localhost:8000/api/v1/waste/
```

## Authentication

All endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Models Overview

### WasteCategory
Defines types of waste that can be collected with associated credit rates and environmental impact.

**Fields:**
- `id` (UUID): Unique identifier
- `name` (string): Category name (e.g., "Plastic Bottles")
- `category_type` (string): Type classification (plastic, paper, metal, glass, organic, electronic, textile, hazardous, other)
- `description` (text): Detailed description
- `credit_rate_per_kg` (decimal): Credits earned per kilogram
- `co2_reduction_per_kg` (decimal): CO2 reduction in kg per kilogram collected
- `is_active` (boolean): Whether category is active
- `created_at`, `updated_at` (datetime): Timestamps

### CollectionPoint
Physical locations where waste can be dropped off or collected.

**Fields:**
- `id` (UUID): Unique identifier
- `name` (string): Point name
- `point_type` (string): Type (drop_off, collection, recycling_center, community_center)
- `address` (text): Full address
- `county`, `sub_county` (string): Location details
- `latitude`, `longitude` (decimal): GPS coordinates
- `contact_phone`, `contact_email` (string): Contact information
- `operating_hours` (text): Operating schedule
- `accepted_categories` (M2M): Accepted waste categories
- `is_active` (boolean): Whether point is active

### WasteReport
Reports of waste found or collected by users.

**Fields:**
- `id` (UUID): Unique identifier
- `reporter` (FK): User who reported the waste
- `title` (string): Report title
- `description` (text): Detailed description
- `category` (FK): Waste category
- `status` (string): Current status (reported, verified, collected, processed, cancelled)
- `priority` (string): Priority level (low, medium, high, urgent)
- `estimated_weight_kg` (decimal): Estimated weight
- `actual_weight_kg` (decimal): Actual weight collected
- `location_description` (text): Location details
- `county`, `sub_county` (string): Location
- `latitude`, `longitude` (decimal): GPS coordinates
- `photo` (image): Photo of waste
- `collection_point` (FK): Associated collection point
- `verified_by`, `collected_by` (FK): Staff members
- `verified_at`, `collected_at` (datetime): Process timestamps
- `notes` (text): Additional notes

**Calculated Properties:**
- `estimated_credits`: Estimated weight × category credit rate
- `actual_credits`: Actual weight × category credit rate
- `estimated_co2_reduction`: Estimated environmental impact
- `actual_co2_reduction`: Actual environmental impact

### CreditTransaction
Tracks credit transactions for users.

**Fields:**
- `id` (UUID): Unique identifier
- `user` (FK): User account
- `transaction_type` (string): Type (earned, spent, bonus, penalty, adjustment)
- `amount` (decimal): Credit amount
- `waste_report` (FK): Related waste report (if applicable)
- `description` (string): Transaction description
- `reference_id` (string): External reference
- `processed_by` (FK): Staff member who processed
- `created_at` (datetime): Transaction timestamp

### CollectionEvent
Organized waste collection events.

**Fields:**
- `id` (UUID): Unique identifier
- `title` (string): Event title
- `description` (text): Event description
- `event_type` (string): Type (community_cleanup, school_program, beach_cleanup, market_cleanup, special_drive)
- `organizer` (FK): Event organizer
- `location` (text): Event location
- `county`, `sub_county` (string): Location details
- `start_date`, `end_date` (datetime): Event schedule
- `max_participants` (integer): Maximum participants
- `participants` (M2M): Event participants
- `target_categories` (M2M): Target waste categories
- `bonus_multiplier` (decimal): Credit bonus multiplier
- `status` (string): Event status (planned, active, completed, cancelled)
- `total_weight_collected` (decimal): Total weight collected
- `total_credits_awarded` (decimal): Total credits awarded

## API Endpoints

### Waste Categories

#### List Waste Categories
```http
GET /api/v1/waste/categories/
```

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": "902a62bf-d7c9-4721-bd08-3e13dc980ed0",
      "name": "Plastic Bottles",
      "category_type": "plastic",
      "description": "PET plastic bottles and containers",
      "credit_rate_per_kg": "5.00",
      "co2_reduction_per_kg": "2.5000",
      "is_active": true,
      "created_at": "2025-09-18T16:42:53.684154+03:00",
      "updated_at": "2025-09-18T16:42:53.684272+03:00"
    }
  ]
}
```

### Collection Points

#### List Collection Points
```http
GET /api/v1/waste/collection-points/
```

**Query Parameters:**
- `county` (string): Filter by county
- `sub_county` (string): Filter by sub-county
- `point_type` (string): Filter by point type

#### Get Collection Point Details
```http
GET /api/v1/waste/collection-points/{id}/
```

#### Find Nearby Collection Points
```http
GET /api/v1/waste/collection-points/nearby/
```

**Query Parameters:**
- `latitude` (float): User's latitude
- `longitude` (float): User's longitude
- `radius` (float): Search radius in kilometers (default: 10)

**Response:**
```json
{
  "collection_points": [
    {
      "id": "78d124df-f63a-470e-8c75-62eaf7fe24fd",
      "name": "Kisumu Central Collection Point",
      "distance_km": 0.0,
      "accepted_categories": [...]
    }
  ],
  "total_found": 1,
  "search_radius_km": 5.0
}
```

### Waste Reports

#### List User's Waste Reports
```http
GET /api/v1/waste/reports/
```

**Query Parameters:**
- `status` (string): Filter by status
- `category` (string): Filter by category name
- `county` (string): Filter by county

#### Create Waste Report
```http
POST /api/v1/waste/reports/
```

**Request Body:**
```json
{
  "title": "Plastic bottles at Kisumu Market",
  "description": "Found a large pile of plastic bottles behind the market stalls",
  "category_id": "902a62bf-d7c9-4721-bd08-3e13dc980ed0",
  "estimated_weight_kg": "15.50",
  "location_description": "Behind the main market stalls, near the drainage area",
  "county": "Kisumu",
  "sub_county": "Kisumu Central",
  "latitude": "-0.0918",
  "longitude": "34.7681",
  "priority": "medium",
  "collection_point_id": "78d124df-f63a-470e-8c75-62eaf7fe24fd"
}
```

#### Get Waste Report Details
```http
GET /api/v1/waste/reports/{id}/
```

#### Update Waste Report (Staff Only)
```http
PUT /api/v1/waste/reports/{id}/
PATCH /api/v1/waste/reports/{id}/
```

**Request Body (Staff Update):**
```json
{
  "status": "collected",
  "actual_weight_kg": "14.20",
  "notes": "Collected successfully, slightly less than estimated"
}
```

### Credit Transactions

#### List User's Credit Transactions
```http
GET /api/v1/waste/credits/
```

**Query Parameters:**
- `transaction_type` (string): Filter by transaction type

### Collection Events

#### List Collection Events
```http
GET /api/v1/waste/events/
```

**Query Parameters:**
- `status` (string): Filter by status
- `county` (string): Filter by county
- `event_type` (string): Filter by event type

#### Create Collection Event
```http
POST /api/v1/waste/events/
```

**Request Body:**
```json
{
  "title": "Kisumu Beach Cleanup",
  "description": "Community cleanup event at Kisumu beach",
  "event_type": "beach_cleanup",
  "location": "Kisumu Beach, Dunga area",
  "county": "Kisumu",
  "sub_county": "Kisumu Central",
  "start_date": "2025-10-15T08:00:00+03:00",
  "end_date": "2025-10-15T16:00:00+03:00",
  "max_participants": 50,
  "target_category_ids": ["902a62bf-d7c9-4721-bd08-3e13dc980ed0"],
  "bonus_multiplier": "1.50"
}
```

#### Get Event Details
```http
GET /api/v1/waste/events/{id}/
```

#### Join Collection Event
```http
POST /api/v1/waste/events/{id}/join/
```

#### Leave Collection Event
```http
DELETE /api/v1/waste/events/{id}/leave/
```

### Dashboard Statistics

#### Get User Dashboard Stats
```http
GET /api/v1/waste/dashboard/stats/
```

**Response:**
```json
{
  "reports": {
    "total_reports": 1,
    "verified_reports": 0,
    "collected_reports": 0,
    "total_estimated_weight_kg": 15.5,
    "total_actual_weight_kg": 0.0
  },
  "credits": {
    "current_balance": 0.0,
    "total_earned": 0.0,
    "total_spent": 0.0,
    "total_bonus": 0.0
  },
  "events": {
    "events_joined": 0,
    "total_weight_collected_kg": 0.0,
    "total_credits_earned": 0.0
  },
  "environmental_impact": {
    "total_co2_reduction_kg": 0.0
  }
}
```

## Business Logic & Workflows

### Waste Report Workflow

1. **Reported**: User creates a waste report with estimated weight and location
2. **Verified**: Staff member verifies the report and may update details
3. **Collected**: Waste is collected, actual weight is recorded, credits are awarded
4. **Processed**: Waste has been processed at recycling facility
5. **Cancelled**: Report was cancelled (invalid, duplicate, etc.)

### Credit System

#### Credit Earning
- Credits are earned when waste is actually collected (status = 'collected')
- Formula: `actual_weight_kg × category.credit_rate_per_kg`
- Automatic `CreditTransaction` record is created
- Event participation can include bonus multipliers

#### Credit Spending
- Credits can be spent on eco-products (future feature)
- Spending creates negative credit transactions
- Balance = Total Earned + Bonuses - Total Spent

### Environmental Impact Tracking

#### CO2 Reduction Calculation
- Formula: `actual_weight_kg × category.co2_reduction_per_kg`
- Tracked per waste report and aggregated for user dashboard
- Provides measurable environmental impact metrics

### Event Management

#### Event Participation
- Users can join active events within participant limits
- Participation tracked through `EventParticipation` model
- Individual weight and credits tracked per participant
- Bonus multipliers applied to event-related collections

#### Event Status Workflow
1. **Planned**: Event is scheduled but not yet active
2. **Active**: Event is currently running, users can join
3. **Completed**: Event finished, final statistics calculated
4. **Cancelled**: Event was cancelled

### Location Services

#### Collection Point Discovery
- GPS-based search for nearby collection points
- Distance calculation using basic Haversine approximation
- Filtered by accepted waste categories
- Sorted by distance from user location

#### Geographic Organization
- County and sub-county based organization
- Supports Kisumu County with sub-county divisions
- Extensible to other counties in Kenya

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Invalid latitude, longitude, or radius parameters"
}
```

#### 401 Unauthorized
```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid"
}
```

#### 403 Forbidden
```json
{
  "error": "Only staff members can update waste reports"
}
```

#### 404 Not Found
```json
{
  "detail": "Not found."
}
```

#### 400 Validation Error
```json
{
  "category_id": ["Invalid or inactive waste category."],
  "estimated_weight_kg": ["Ensure this value is greater than or equal to 0.01."]
}
```

## Permissions & Security

### User Permissions
- **Regular Users**: Can create and view their own waste reports
- **Staff Users**: Can update any waste report, verify collections, process credits
- **Admin Users**: Full access to all features and admin interface

### Data Security
- UUID primary keys prevent enumeration attacks
- JWT authentication with token expiration
- User isolation (users only see their own data unless staff)
- Input validation and sanitization
- Proper error handling without information leakage

## Performance Considerations

### Database Optimization
- Proper indexing on frequently queried fields
- Select/prefetch related objects to avoid N+1 queries
- Pagination for list endpoints
- Efficient aggregation queries for dashboard statistics

### Caching Opportunities
- Waste categories (rarely change)
- Collection points (relatively static)
- User dashboard statistics (can be cached with TTL)

## Integration Examples

### Frontend Integration
```javascript
// Create waste report
const createWasteReport = async (reportData) => {
  const response = await fetch('/api/v1/waste/reports/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(reportData)
  });
  return response.json();
};

// Get user dashboard stats
const getDashboardStats = async () => {
  const response = await fetch('/api/v1/waste/dashboard/stats/', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
};
```

### Mobile App Integration
```javascript
// Find nearby collection points
const findNearbyPoints = async (latitude, longitude, radius = 10) => {
  const url = `/api/v1/waste/collection-points/nearby/?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
};
```

## Testing

### Test Data Setup
```python
# Create test waste categories
python manage.py shell -c "
from waste_collection.models import WasteCategory
from decimal import Decimal

WasteCategory.objects.create(
    name='Plastic Bottles',
    category_type='plastic',
    credit_rate_per_kg=Decimal('5.00'),
    co2_reduction_per_kg=Decimal('2.5000'),
    description='PET plastic bottles and containers'
)
"
```

### API Testing Examples
```bash
# Test authentication
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password"}'

# Test waste report creation
curl -X POST http://localhost:8000/api/v1/waste/reports/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title": "Test Report", "category_id": "<uuid>", ...}'
```

## Future Enhancements

### Planned Features
1. **Image Recognition**: AI-powered waste category detection from photos
2. **Route Optimization**: Optimal collection routes for staff
3. **Gamification**: Leaderboards, achievements, challenges
4. **Social Features**: Team competitions, community challenges
5. **Advanced Analytics**: Predictive modeling, trend analysis
6. **Mobile Notifications**: Real-time updates on collections
7. **Payment Integration**: Credit-to-cash conversion
8. **Marketplace Integration**: Spend credits on eco-products
