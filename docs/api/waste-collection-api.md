# Waste Collection System Documentation

## Overview

The Waste Collection System is a comprehensive solution for the Youth Green Jobs & Waste Recycling Hub that enables youth to report waste, track collections, earn credits, and participate in community cleanup events. This system consists of both backend APIs and frontend user interfaces.

## Table of Contents

1. [Backend API Documentation](#backend-api-documentation)
2. [Frontend UI Documentation](#frontend-ui-documentation)
3. [User Flows](#user-flows)
4. [Component Architecture](#component-architecture)
5. [Integration Guide](#integration-guide)

---

# Backend API Documentation

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

---

# Frontend UI Documentation

## Overview

The Frontend Waste Collection UI provides a comprehensive user interface for the waste collection system, built with React 18.3.1, TypeScript, and Tailwind CSS. The UI includes components for waste reporting, collection point discovery, event management, and credit tracking.

## Technology Stack

- **React 18.3.1** with TypeScript for type safety
- **React Router DOM 7.9.1** for client-side routing
- **React Hook Form 7.62.0** with Zod validation
- **Tailwind CSS 4.x** for responsive design
- **React Leaflet** for interactive maps
- **Recharts** for data visualization
- **React Dropzone** for file uploads
- **React Query (@tanstack/react-query)** for server state management
- **Axios 1.12.2** for API communication
- **Date-fns** for date formatting
- **Lucide React** for modern icons

## Component Architecture

### Core Components

#### 1. WasteDashboard
**Location:** `frontend/src/components/waste/WasteDashboard.tsx`

**Purpose:** Main dashboard showing waste collection statistics and overview

**Features:**
- Key performance indicators (KPIs) with trend analysis
- Interactive charts for waste reports, credits, and environmental impact
- Monthly trends with multi-axis line charts
- Responsive design with mobile-first approach

**Props:**
```typescript
interface WasteDashboardProps {
  userId?: string; // If provided, shows personal dashboard
}
```

**Usage:**
```tsx
<WasteDashboard userId={user?.id?.toString()} />
```

#### 2. WasteReportForm
**Location:** `frontend/src/components/waste/WasteReportForm.tsx`

**Purpose:** Form for creating new waste reports with photo upload and GPS integration

**Features:**
- Comprehensive form validation with Zod schemas
- Photo upload with drag-and-drop support
- GPS location integration with automatic nearby collection point discovery
- Real-time category loading and validation
- Form state management with React Hook Form

**Props:**
```typescript
interface WasteReportFormProps {
  onSuccess?: (reportId: string) => void;
  onCancel?: () => void;
}
```

#### 3. WasteReportsList
**Location:** `frontend/src/components/waste/WasteReportsList.tsx`

**Purpose:** Paginated list of waste reports with filtering and search

**Features:**
- Advanced filtering by status, category, county, and date range
- Real-time search functionality
- Status and priority badge system with color coding
- Pagination with configurable page sizes
- Responsive design with mobile optimization

**Props:**
```typescript
interface WasteReportsListProps {
  onViewReport?: (reportId: string) => void;
  userId?: string; // If provided, shows only reports from this user
  showFilters?: boolean;
}
```

#### 4. WasteReportDetail
**Location:** `frontend/src/components/waste/WasteReportDetail.tsx`

**Purpose:** Detailed view of individual waste reports

**Features:**
- Complete report information with timeline tracking
- Photo display and location information
- Status progression visualization
- Environmental impact calculations
- Reporter and staff information display

#### 5. CollectionPointsMap
**Location:** `frontend/src/components/waste/CollectionPointsMap.tsx`

**Purpose:** Interactive map showing collection points with filtering

**Features:**
- Interactive Leaflet map with custom markers
- Real-time location services integration
- Collection point filtering and search functionality
- Custom icon system based on point types
- Popup information with contact details and directions

**Props:**
```typescript
interface CollectionPointsMapProps {
  height?: string;
  onPointSelect?: (point: CollectionPoint) => void;
  selectedPointId?: string;
  showFilters?: boolean;
}
```

#### 6. CollectionPointsList
**Location:** `frontend/src/components/waste/CollectionPointsList.tsx`

**Purpose:** List view of collection points with search and filtering

**Features:**
- Comprehensive search functionality
- Distance calculation and sorting
- Contact information and operating hours
- Accepted categories display
- Integration with Google Maps for directions

#### 7. CollectionEventsList
**Location:** `frontend/src/components/waste/CollectionEventsList.tsx`

**Purpose:** List of collection events with participation management

**Features:**
- Event filtering by status, type, and date
- Join/leave event functionality
- Participant count and capacity tracking
- Event status indicators and bonus multipliers
- Pagination with advanced filtering

#### 8. CollectionEventDetail
**Location:** `frontend/src/components/waste/CollectionEventDetail.tsx`

**Purpose:** Detailed view of collection events

**Features:**
- Complete event information and participant list
- Event results for completed events
- Organizer information and contact details
- Target categories and bonus multipliers
- Real-time participation management

#### 9. CreditTransactions
**Location:** `frontend/src/components/waste/CreditTransactions.tsx`

**Purpose:** Credit transaction history and balance management

**Features:**
- Transaction history with filtering and pagination
- Credit balance display with gradient styling
- Transaction type icons and color coding
- Export functionality preparation
- Monthly transaction summaries

## Page Components

### 1. WasteDashboardPage
**Location:** `frontend/src/pages/WasteDashboardPage.tsx`
**Route:** `/dashboard/waste`

Main waste collection dashboard page that wraps the WasteDashboard component.

### 2. WasteReportsPage
**Location:** `frontend/src/pages/WasteReportsPage.tsx`
**Route:** `/dashboard/waste/reports`

Manages waste report views with state for list, create, and detail modes.

### 3. CollectionPointsPage
**Location:** `frontend/src/pages/CollectionPointsPage.tsx`
**Route:** `/dashboard/waste/collection-points`

Collection points page with toggle between map and list views.

### 4. CollectionEventsPage
**Location:** `frontend/src/pages/CollectionEventsPage.tsx`
**Route:** `/dashboard/waste/events`

Collection events page with list and detail view management.

### 5. CreditTransactionsPage
**Location:** `frontend/src/pages/CreditTransactionsPage.tsx`
**Route:** `/dashboard/waste/credits`

Credit transactions page wrapping the CreditTransactions component.

## Type Definitions

### Core Types
**Location:** `frontend/src/types/waste.ts`

```typescript
// Waste Categories
interface WasteCategory {
  id: string;
  name: string;
  category_type: string;
  description: string;
  credit_rate_per_kg: string;
  co2_reduction_per_kg: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Collection Points
interface CollectionPoint {
  id: string;
  name: string;
  point_type: string;
  address: string;
  county: string;
  sub_county: string;
  latitude?: string;
  longitude?: string;
  contact_phone: string;
  contact_email: string;
  operating_hours: string;
  accepted_categories: WasteCategory[];
  is_active: boolean;
  distance_km?: number;
}

// Waste Reports
interface WasteReport {
  id: string;
  reporter: User;
  title: string;
  description: string;
  category: WasteCategory;
  status: string;
  priority: string;
  estimated_weight_kg: string;
  actual_weight_kg?: string;
  location_description: string;
  county: string;
  sub_county: string;
  latitude?: string;
  longitude?: string;
  photo?: string;
  collection_point?: CollectionPoint;
  verified_by?: User;
  collected_by?: User;
  verified_at?: string;
  collected_at?: string;
  notes?: string;
  estimated_credits: string;
  actual_credits?: string;
  estimated_co2_reduction: string;
  actual_co2_reduction?: string;
  created_at: string;
  updated_at: string;
}

// Collection Events
interface CollectionEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  organizer: User;
  location: string;
  county: string;
  sub_county: string;
  start_date: string;
  end_date: string;
  max_participants?: number;
  participant_count: number;
  target_categories: WasteCategory[];
  bonus_multiplier: string;
  status: string;
  total_weight_collected?: string;
  total_credits_awarded?: string;
  created_at: string;
  updated_at: string;
}

// Credit Transactions
interface CreditTransaction {
  id: string;
  user: User;
  transaction_type: string;
  amount: string;
  waste_report?: WasteReport;
  description: string;
  reference_id?: string;
  processed_by?: User;
  created_at: string;
}
```

## Validation Schemas

### Zod Schemas
**Location:** `frontend/src/schemas/wasteSchemas.ts`

```typescript
// Waste Report Form Schema
export const wasteReportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category_id: z.string().uuid('Please select a valid waste category'),
  estimated_weight_kg: z.number().min(0.01, 'Weight must be at least 0.01 kg'),
  location_description: z.string().min(5, 'Location description is required'),
  county: z.string().min(1, 'County is required'),
  sub_county: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    message: 'Please select a valid priority level'
  }),
  collection_point_id: z.string().uuid().optional(),
  photo: z.any().optional()
});

// Collection Event Form Schema
export const collectionEventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  event_type: z.enum([
    'community_cleanup',
    'school_program',
    'beach_cleanup',
    'market_cleanup',
    'special_drive'
  ], {
    message: 'Please select a valid event type'
  }),
  location: z.string().min(5, 'Location is required'),
  county: z.string().min(1, 'County is required'),
  sub_county: z.string().optional(),
  start_date: z.string().datetime('Please select a valid start date and time'),
  end_date: z.string().datetime('Please select a valid end date and time'),
  max_participants: z.number().min(1, 'Must allow at least 1 participant').optional(),
  target_category_ids: z.array(z.string().uuid()).min(1, 'Select at least one waste category'),
  bonus_multiplier: z.number().min(1, 'Bonus multiplier must be at least 1.0').max(5, 'Bonus multiplier cannot exceed 5.0')
});
```

## API Service Layer

### Waste API Service
**Location:** `frontend/src/services/api.ts`

The API service provides a comprehensive interface for all waste collection endpoints:

```typescript
export const wasteApi = {
  // Waste Categories
  getWasteCategories: async (): Promise<WasteCategory[]> => { ... },

  // Collection Points
  getCollectionPoints: async (params?: CollectionPointFilters): Promise<CollectionPointListResponse> => { ... },
  getNearbyCollectionPoints: async (latitude: number, longitude: number, radius?: number): Promise<NearbyCollectionPointsResponse> => { ... },

  // Waste Reports
  getWasteReports: async (params?: WasteReportFilters): Promise<WasteReportListResponse> => { ... },
  createWasteReport: async (data: WasteReportFormData): Promise<WasteReport> => { ... },
  getWasteReportById: async (id: string): Promise<WasteReport> => { ... },

  // Collection Events
  getCollectionEvents: async (params?: CollectionEventFilters): Promise<CollectionEventListResponse> => { ... },
  getCollectionEventById: async (id: string): Promise<CollectionEventDetailType> => { ... },
  joinCollectionEvent: async (eventId: string): Promise<void> => { ... },
  leaveCollectionEvent: async (eventId: string): Promise<void> => { ... },

  // Credit Transactions
  getCreditTransactions: async (params?: CreditTransactionFilters): Promise<CreditTransactionListResponse> => { ... },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => { ... },

  // Location Services
  getCurrentLocation: async (): Promise<MapLocation> => { ... }
};
```

## Routing Configuration

### App Router Setup
**Location:** `frontend/src/App.tsx`

```tsx
// Protected Routes (require authentication)
<Route path="/dashboard" element={
  <AuthGuard>
    <DashboardLayout />
  </AuthGuard>
}>
  <Route index element={<DashboardPage />} />
  <Route path="profile" element={<ProfileForm />} />

  {/* Waste Collection Routes */}
  <Route path="waste" element={<WasteDashboardPage />} />
  <Route path="waste/reports" element={<WasteReportsPage />} />
  <Route path="waste/collection-points" element={<CollectionPointsPage />} />
  <Route path="waste/events" element={<CollectionEventsPage />} />
  <Route path="waste/credits" element={<CreditTransactionsPage />} />
</Route>
```

### Navigation Integration
**Location:** `frontend/src/components/layout/DashboardLayout.tsx`

The dashboard layout includes a collapsible waste collection submenu:

```tsx
const wasteNavigation = [
  { name: 'Overview', href: '/dashboard/waste', icon: BarChart3 },
  { name: 'My Reports', href: '/dashboard/waste/reports', icon: Package },
  { name: 'Collection Points', href: '/dashboard/waste/collection-points', icon: MapPin },
  { name: 'Events', href: '/dashboard/waste/events', icon: Calendar },
  { name: 'Credits', href: '/dashboard/waste/credits', icon: Coins },
];
```

---

# User Flows

## 1. Waste Reporting Flow

### Step 1: Access Waste Reports
1. User navigates to `/dashboard/waste/reports`
2. System displays list of user's existing reports
3. User clicks "Report Waste" button

### Step 2: Create Waste Report
1. System displays `WasteReportForm` component
2. User fills out required fields:
   - Title and description
   - Waste category selection
   - Estimated weight
   - Location description
   - Priority level
3. User optionally:
   - Uploads photo using drag-and-drop
   - Uses GPS to get current location
   - Selects nearby collection point
4. User submits form

### Step 3: Form Validation & Submission
1. System validates form using Zod schema
2. If valid, creates FormData with photo
3. API call to `POST /api/v1/waste/reports/`
4. On success, redirects to report detail view
5. On error, displays validation messages

### Step 4: View Report Details
1. System displays `WasteReportDetail` component
2. User can view complete report information
3. User can track status changes over time

## 2. Collection Point Discovery Flow

### Step 1: Access Collection Points
1. User navigates to `/dashboard/waste/collection-points`
2. System displays map view by default

### Step 2: Find Nearby Points
1. User clicks "Find Nearby" button
2. System requests geolocation permission
3. API call to `/api/v1/waste/collection-points/nearby/`
4. System displays points on map with distance

### Step 3: View Point Details
1. User clicks on map marker or list item
2. System displays point information popup
3. User can get directions via Google Maps
4. User can view accepted waste categories

### Step 4: Switch Views
1. User can toggle between map and list views
2. Both views maintain selected point state
3. Filtering and search work in both views

## 3. Event Participation Flow

### Step 1: Browse Events
1. User navigates to `/dashboard/waste/events`
2. System displays list of available events
3. User can filter by status, type, or date

### Step 2: View Event Details
1. User clicks "View Details" on an event
2. System displays `CollectionEventDetail` component
3. User sees event information, participants, and organizer

### Step 3: Join Event
1. User clicks "Join Event" button
2. System validates participation eligibility
3. API call to `POST /api/v1/waste/events/{id}/join/`
4. System updates participant count
5. User receives confirmation

### Step 4: Event Participation
1. During event, user reports waste with event context
2. System applies bonus multiplier to credits
3. User's participation is tracked individually

## 4. Credit Management Flow

### Step 1: View Credit Balance
1. User navigates to `/dashboard/waste/credits`
2. System displays current balance and recent transactions
3. User can see credit earning history

### Step 2: Track Credit Sources
1. User views transaction details
2. System shows waste reports that earned credits
3. User can see bonus credits from events

### Step 3: Monitor Progress
1. User views dashboard statistics
2. System shows total credits earned over time
3. User can track environmental impact

---

# Component Architecture

## State Management

### Local Component State
- Form state managed with React Hook Form
- UI state (loading, errors, modals) with useState
- Component-specific filters and pagination

### Server State Management
- API data cached with React Query
- Automatic background refetching
- Optimistic updates for user actions
- Error handling and retry logic

### Global State
- Authentication state via AuthContext
- User preferences and settings
- Navigation state in DashboardLayout

## Error Handling

### Form Validation
```typescript
// Zod schema validation with custom error messages
const { formState: { errors } } = useForm({
  resolver: zodResolver(wasteReportSchema)
});

// Display field-specific errors
{errors.title && (
  <p className="text-red-600 text-sm">{errors.title.message}</p>
)}
```

### API Error Handling
```typescript
// Centralized error handling in API service
try {
  const response = await apiClient.post('/waste/reports/', data);
  return response.data;
} catch (error) {
  if (error.response?.status === 400) {
    throw new Error('Validation failed');
  }
  throw new Error('Failed to create waste report');
}
```

### User Feedback
- Toast notifications for success/error states
- Loading spinners during API calls
- Graceful error boundaries for component failures
- Retry mechanisms for failed operations

## Performance Optimizations

### Code Splitting
```typescript
// Lazy load waste collection pages
const WasteDashboardPage = lazy(() => import('./pages/WasteDashboardPage'));
const WasteReportsPage = lazy(() => import('./pages/WasteReportsPage'));
```

### Image Optimization
- Photo compression before upload
- Progressive image loading
- Responsive image sizing
- Lazy loading for image galleries

### Data Fetching
- Pagination for large datasets
- Debounced search inputs
- Cached API responses
- Background data synchronization

## Accessibility Features

### Keyboard Navigation
- Full keyboard support for all interactive elements
- Focus management in modals and forms
- Skip links for screen readers

### Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Alt text for images
- Status announcements for dynamic content

### Visual Accessibility
- High contrast color schemes
- Scalable text and UI elements
- Clear focus indicators
- Color-blind friendly design

---

# Integration Guide

## Setup and Installation

### Prerequisites
```bash
# Node.js 18.19+ (Vite requires 20.19+ for optimal performance)
node --version

# Package manager
npm --version
```

### Installation Steps
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install waste collection specific dependencies
npm install @tanstack/react-query recharts react-dropzone leaflet react-leaflet @types/leaflet date-fns clsx

# Start development server
npm run dev
```

### Environment Configuration
```bash
# Create .env file
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Backend Integration

### API Client Configuration
```typescript
// Configure axios instance with authentication
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Add authentication interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Error Handling Integration
```typescript
// Global error handler for API responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Testing Integration

### Component Testing
```typescript
// Example test for WasteReportForm
import { render, screen, fireEvent } from '@testing-library/react';
import { WasteReportForm } from './WasteReportForm';

test('validates required fields', async () => {
  render(<WasteReportForm />);

  fireEvent.click(screen.getByText('Submit Report'));

  expect(await screen.findByText('Title must be at least 5 characters')).toBeInTheDocument();
});
```

### API Integration Testing
```typescript
// Mock API responses for testing
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/v1/waste/categories/', (req, res, ctx) => {
    return res(ctx.json({ results: mockCategories }));
  })
);
```

## Deployment Configuration

### Build Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          maps: ['leaflet', 'react-leaflet'],
          charts: ['recharts'],
        },
      },
    },
  },
});
```

### Production Environment
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to static hosting
npm run deploy
```

## Monitoring and Analytics

### Error Tracking
```typescript
// Integrate with error tracking service
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: import.meta.env.MODE,
});
```

### Performance Monitoring
```typescript
// Track user interactions
const trackWasteReport = (reportId: string) => {
  analytics.track('Waste Report Created', {
    reportId,
    timestamp: new Date().toISOString(),
  });
};
```

## Security Considerations

### Input Sanitization
- All user inputs validated with Zod schemas
- File upload restrictions (type, size)
- XSS prevention with proper escaping

### Authentication Security
- JWT tokens stored securely
- Automatic token refresh
- Secure logout with token invalidation

### Data Privacy
- User data isolation
- Secure file upload handling
- GDPR compliance considerations

## Maintenance and Updates

### Dependency Management
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
```

### Code Quality
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test
```

This comprehensive documentation provides everything needed to understand, implement, and maintain the waste collection system's frontend UI components and integration with the backend API.
