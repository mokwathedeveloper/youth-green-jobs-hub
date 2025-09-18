# Eco Products Technical Documentation

## Architecture Overview

The Eco Products system is built using a modern full-stack architecture with Django REST Framework backend and React TypeScript frontend, designed for scalability, maintainability, and performance.

### Technology Stack

#### Backend
- **Django 5.2.6**: Web framework with ORM and admin interface
- **Django REST Framework**: API development with serializers and viewsets
- **PostgreSQL**: Primary database for data persistence
- **Redis**: Caching and session storage
- **Celery**: Asynchronous task processing
- **JWT Authentication**: Secure token-based authentication
- **Django Filters**: Advanced API filtering capabilities
- **Pillow**: Image processing for product photos

#### Frontend
- **React 19.1.1**: Modern UI library with hooks and context
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router 7.9.1**: Client-side routing
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation and type inference
- **Axios**: HTTP client for API communication
- **React Query**: Server state management and caching
- **Lucide React**: Icon library

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Django)      │◄──►│   (PostgreSQL)  │
│   Port: 5173    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │     Redis       │              │
         │              │   (Caching)     │              │
         │              │   Port: 6379    │              │
         │              └─────────────────┘              │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Static    │    │     Celery      │    │   File Storage  │
│   (Media Files) │    │   (Background   │    │   (Media)       │
│                 │    │    Tasks)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Backend Implementation

### Django Apps Structure

```
youth_green_jobs_backend/
├── authentication/          # User authentication and profiles
├── waste/                  # Waste collection system
├── products/               # Eco products marketplace
├── youth_green_jobs_backend/  # Main project settings
└── manage.py
```

### Products App Models

#### Core Models

**SMEVendor Model**
```python
class SMEVendor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    business_name = models.CharField(max_length=200)
    business_registration_number = models.CharField(max_length=50)
    county = models.CharField(max_length=50)
    sub_county = models.CharField(max_length=50)
    address = models.TextField()
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()
    website = models.URLField(blank=True, null=True)
    description = models.TextField()
    is_verified = models.BooleanField(default=False)
    is_eco_certified = models.BooleanField(default=False)
    eco_credentials = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Product Model**
```python
class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    vendor = models.ForeignKey(SMEVendor, on_delete=models.CASCADE)
    category = models.ForeignKey(ProductCategory, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    credit_price = models.DecimalField(max_digits=10, decimal_places=2)
    featured_image = models.ImageField(upload_to='products/')
    in_stock = models.BooleanField(default=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    eco_friendly_features = models.TextField()
    recyclable = models.BooleanField(default=True)
    biodegradable = models.BooleanField(default=False)
    carbon_footprint_kg = models.DecimalField(max_digits=8, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### API Views Architecture

#### ViewSet Pattern
```python
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('vendor', 'category')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'eco_friendly_features']
    ordering_fields = ['price', 'created_at', 'name']
    pagination_class = StandardResultsSetPagination
```

#### Custom Actions
```python
@action(detail=True, methods=['get'])
def recommendations(self, request, pk=None):
    """Get product recommendations"""
    product = self.get_object()
    similar_products = self.get_similar_products(product)
    vendor_products = self.get_vendor_products(product)
    category_products = self.get_category_products(product)
    
    return Response({
        'similar_products': ProductListSerializer(similar_products, many=True).data,
        'vendor_products': ProductListSerializer(vendor_products, many=True).data,
        'category_products': ProductListSerializer(category_products, many=True).data,
    })
```

### Serializers

#### Nested Serialization
```python
class ProductDetailSerializer(serializers.ModelSerializer):
    vendor = SMEVendorSerializer(read_only=True)
    category = ProductCategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'
    
    def get_average_rating(self, obj):
        return obj.reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    
    def get_review_count(self, obj):
        return obj.reviews.count()
```

### Database Optimization

#### Query Optimization
```python
# Efficient queryset with select_related and prefetch_related
products = Product.objects.select_related(
    'vendor', 'category', 'category__parent'
).prefetch_related(
    'images', 'reviews'
).filter(in_stock=True)

# Aggregation for statistics
stats = Product.objects.aggregate(
    total_products=Count('id'),
    avg_price=Avg('price'),
    total_vendors=Count('vendor', distinct=True)
)
```

#### Database Indexes
```python
class Meta:
    indexes = [
        models.Index(fields=['vendor', 'in_stock']),
        models.Index(fields=['category', 'price']),
        models.Index(fields=['created_at']),
        models.Index(fields=['price', 'credit_price']),
    ]
```

## Frontend Implementation

### Project Structure

```
frontend/src/
├── components/
│   ├── products/           # Product-specific components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   └── routing/           # Route guards and navigation
├── pages/
│   ├── products/          # Product pages
│   └── ...               # Other pages
├── services/
│   └── api.ts            # API client and endpoints
├── types/
│   ├── products.ts       # Product type definitions
│   └── ...              # Other type definitions
├── schemas/
│   ├── productSchemas.ts # Zod validation schemas
│   └── ...              # Other schemas
└── contexts/
    └── AuthContext.tsx   # Authentication context
```

### Component Architecture

#### Product Components
```typescript
// ProductCard.tsx - Reusable product display
interface ProductCardProps {
  product: ProductListItem;
  onAddToCart: (productId: string) => void;
  showVendor?: boolean;
  showCategory?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  showVendor = true,
  showCategory = true
}) => {
  // Component implementation
};
```

#### State Management
```typescript
// Using React Query for server state
const useProducts = (params: ProductSearchParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Local state with useState
const [filters, setFilters] = useState<ProductSearchParams>({});
const [currentPage, setCurrentPage] = useState(1);
```

### Type Safety

#### TypeScript Interfaces
```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  credit_price: string | null;
  vendor: SMEVendor;
  category: ProductCategory;
  featured_image: string | null;
  in_stock: boolean;
  stock_quantity: number;
  eco_friendly_features: string;
  recyclable: boolean;
  biodegradable: boolean;
  carbon_footprint_kg: string;
  average_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}
```

#### Zod Validation
```typescript
export const productSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().uuid().optional(),
  min_price: z.string().optional(),
  max_price: z.string().optional(),
  county: z.string().optional(),
  eco_friendly: z.boolean().optional(),
  in_stock: z.boolean().optional(),
  page: z.string().optional(),
  page_size: z.string().optional(),
  ordering: z.string().optional(),
});

export type ProductSearchParams = z.infer<typeof productSearchSchema>;
```

### API Integration

#### API Client Structure
```typescript
export const productsApi = {
  // Product catalog
  getProducts: async (params?: ProductSearchParams): Promise<ProductListResponse> => {
    const response = await apiClient.get('/products/products/', { params });
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/products/${id}/`);
    return response.data;
  },

  // Shopping cart
  getCart: async (): Promise<ShoppingCart> => {
    const response = await apiClient.get('/products/cart/');
    return response.data;
  },

  addToCart: async (data: CartAddData): Promise<CartItem> => {
    const response = await apiClient.post('/products/cart/add/', data);
    return response.data;
  },

  // Orders
  createOrder: async (data: OrderCreateData): Promise<Order> => {
    const response = await apiClient.post('/products/orders/', data);
    return response.data;
  },
};
```

#### Error Handling
```typescript
const handleApiError = (error: any): string => {
  if (error.response?.data) {
    const data = error.response.data;
    
    // Handle validation errors
    if (data.details && typeof data.details === 'object') {
      const firstError = Object.values(data.details)[0];
      return Array.isArray(firstError) ? firstError[0] : String(firstError);
    }
    
    // Handle general errors
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (data.error) return data.error;
  }
  
  return 'An unexpected error occurred. Please try again.';
};
```

## Performance Optimization

### Backend Optimization

#### Database Query Optimization
- **Select Related**: Reduce database queries with joins
- **Prefetch Related**: Optimize many-to-many and reverse foreign key queries
- **Database Indexes**: Strategic indexing for common query patterns
- **Query Aggregation**: Use database-level aggregations for statistics

#### Caching Strategy
```python
from django.core.cache import cache

def get_product_categories():
    cache_key = 'product_categories'
    categories = cache.get(cache_key)
    
    if categories is None:
        categories = ProductCategory.objects.select_related('parent').all()
        cache.set(cache_key, categories, 3600)  # Cache for 1 hour
    
    return categories
```

#### API Pagination
```python
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100
```

### Frontend Optimization

#### Code Splitting
```typescript
// Lazy loading for product pages
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/products/ProductDetailPage'));
const CheckoutPage = lazy(() => import('./pages/products/CheckoutPage'));
```

#### Image Optimization
```typescript
// Responsive images with lazy loading
<img
  src={product.featured_image || '/api/placeholder/300/300'}
  alt={product.name}
  className="w-full h-48 object-cover"
  loading="lazy"
  onError={(e) => {
    e.currentTarget.src = '/api/placeholder/300/300';
  }}
/>
```

#### React Query Optimization
```typescript
// Optimistic updates for cart operations
const addToCartMutation = useMutation({
  mutationFn: productsApi.addToCart,
  onMutate: async (newItem) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['cart'] });
    
    // Snapshot previous value
    const previousCart = queryClient.getQueryData(['cart']);
    
    // Optimistically update cart
    queryClient.setQueryData(['cart'], (old: ShoppingCart) => ({
      ...old,
      items: [...old.items, newItem],
      total_items: old.total_items + newItem.quantity,
    }));
    
    return { previousCart };
  },
  onError: (err, newItem, context) => {
    // Rollback on error
    queryClient.setQueryData(['cart'], context?.previousCart);
  },
  onSettled: () => {
    // Refetch cart data
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  },
});
```

## Security Implementation

### Backend Security

#### Authentication & Authorization
```python
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

class ProductViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsVendorOrReadOnly]
        return [permission() for permission in permission_classes]
```

#### Input Validation
```python
class ProductSerializer(serializers.ModelSerializer):
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be positive")
        return value
    
    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock quantity cannot be negative")
        return value
```

#### SQL Injection Prevention
- Django ORM automatically escapes SQL queries
- Parameterized queries for raw SQL
- Input sanitization in serializers

### Frontend Security

#### XSS Prevention
```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizeHTML = (html: string) => {
  return DOMPurify.sanitize(html);
};

// Safe rendering of user content
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(product.description) }} />
```

#### CSRF Protection
```typescript
// CSRF token handling
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  withCredentials: true,
  headers: {
    'X-CSRFToken': getCsrfToken(),
  },
});
```

## Testing Strategy

### Backend Testing

#### Unit Tests
```python
from django.test import TestCase
from rest_framework.test import APITestCase

class ProductModelTest(TestCase):
    def setUp(self):
        self.vendor = SMEVendor.objects.create(...)
        self.category = ProductCategory.objects.create(...)
    
    def test_product_creation(self):
        product = Product.objects.create(
            vendor=self.vendor,
            category=self.category,
            name="Test Product",
            price=100.00,
        )
        self.assertEqual(product.name, "Test Product")
        self.assertTrue(product.in_stock)

class ProductAPITest(APITestCase):
    def test_product_list(self):
        response = self.client.get('/api/v1/products/products/')
        self.assertEqual(response.status_code, 200)
```

#### Integration Tests
```python
class ProductIntegrationTest(APITestCase):
    def test_complete_purchase_flow(self):
        # Create product
        # Add to cart
        # Create order
        # Verify order creation
        pass
```

### Frontend Testing

#### Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: '100.00',
    // ... other properties
  };

  it('renders product information', () => {
    render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('KES 100')).toBeInTheDocument();
  });

  it('calls onAddToCart when button is clicked', () => {
    const mockAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith('1');
  });
});
```

## Deployment

### Production Configuration

#### Django Settings
```python
# settings/production.py
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT'),
    }
}

# Static and media files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

#### Frontend Build
```bash
# Production build
npm run build

# Build output
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── ...
```

### Docker Configuration

#### Backend Dockerfile
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "youth_green_jobs_backend.wsgi:application", "--bind", "0.0.0.0:8000"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

### Monitoring and Logging

#### Application Monitoring
- **Sentry**: Error tracking and performance monitoring
- **New Relic**: Application performance monitoring
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization

#### Logging Configuration
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

This technical documentation provides comprehensive coverage of the eco products system architecture, implementation details, and deployment considerations for developers working on the Youth Green Jobs & Waste Recycling Hub platform.
