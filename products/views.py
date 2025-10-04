from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count
from django.shortcuts import get_object_or_404
from decimal import Decimal

from .models import (
    SMEVendor, ProductCategory, Product, ProductImage,
    Order, OrderItem, ProductReview, ShoppingCart, CartItem
)
from .serializers import (
    SMEVendorListSerializer, SMEVendorDetailSerializer,
    ProductCategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductCreateUpdateSerializer, OrderListSerializer, OrderDetailSerializer,
    OrderCreateSerializer, ProductReviewSerializer, ProductReviewCreateSerializer,
    ShoppingCartSerializer, CartItemSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class SMEVendorListView(generics.ListAPIView):
    """
    List all verified SME vendors
    """
    queryset = SMEVendor.objects.filter(is_active=True, is_verified=True)
    serializer_class = SMEVendorListSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['county', 'business_type']
    search_fields = ['business_name', 'description', 'eco_certifications']
    ordering_fields = ['business_name', 'average_rating', 'total_sales', 'created_at']
    ordering = ['-average_rating', '-total_sales']


class SMEVendorDetailView(generics.RetrieveAPIView):
    """
    Retrieve detailed information about a specific SME vendor
    """
    queryset = SMEVendor.objects.filter(is_active=True, is_verified=True)
    serializer_class = SMEVendorDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'id'


class ProductCategoryListView(generics.ListAPIView):
    """
    List all active product categories
    """
    queryset = ProductCategory.objects.filter(is_active=True, parent=None)
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['sort_order', 'name']


class ProductListView(generics.ListAPIView):
    """
    List all active products with filtering and search
    """
    serializer_class = ProductListSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'vendor', 'recyclable', 'biodegradable']
    search_fields = ['name', 'description', 'tags', 'eco_friendly_features']
    ordering_fields = ['name', 'price', 'average_rating', 'total_sales', 'created_at']
    ordering = ['-is_featured', '-created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(
            is_active=True,
            vendor__is_active=True,
            vendor__is_verified=True
        ).select_related('vendor', 'category')

        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Filter by availability
        in_stock = self.request.query_params.get('in_stock')
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(
                Q(track_inventory=False) | Q(stock_quantity__gt=0)
            )

        # Filter by county
        county = self.request.query_params.get('county')
        if county:
            queryset = queryset.filter(vendor__county=county)

        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    """
    Retrieve detailed information about a specific product
    """
    serializer_class = ProductDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        return Product.objects.filter(
            is_active=True,
            vendor__is_active=True,
            vendor__is_verified=True
        ).select_related('vendor', 'category').prefetch_related('images')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        Product.objects.filter(id=instance.id).update(view_count=instance.view_count + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class FeaturedProductsView(generics.ListAPIView):
    """
    List featured products
    """
    serializer_class = ProductListSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Product.objects.filter(
            is_active=True,
            is_featured=True,
            vendor__is_active=True,
            vendor__is_verified=True
        ).select_related('vendor', 'category').order_by('-created_at')


class ProductsByVendorView(generics.ListAPIView):
    """
    List products by a specific vendor
    """
    serializer_class = ProductListSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        return Product.objects.filter(
            vendor_id=vendor_id,
            is_active=True,
            vendor__is_active=True,
            vendor__is_verified=True
        ).select_related('vendor', 'category')


class ProductsByCategoryView(generics.ListAPIView):
    """
    List products by category
    """
    serializer_class = ProductListSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['name', 'price', 'average_rating', 'created_at']
    ordering = ['-is_featured', '-created_at']

    def get_queryset(self):
        category_id = self.kwargs['category_id']
        return Product.objects.filter(
            category_id=category_id,
            is_active=True,
            vendor__is_active=True,
            vendor__is_verified=True
        ).select_related('vendor', 'category')


# Order Management Views
class OrderListView(generics.ListAPIView):
    """
    List user's orders
    """
    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_method']
    ordering_fields = ['created_at', 'total_amount']
    ordering = ['-created_at']

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).select_related('customer')


class OrderDetailView(generics.RetrieveAPIView):
    """
    Retrieve detailed order information
    """
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).prefetch_related('items__product')


class OrderCreateView(generics.CreateAPIView):
    """
    Create a new order from shopping cart or direct purchase
    """
    serializer_class = OrderCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Calculate totals and validate inventory
        items_data = serializer.validated_data['items']
        total_amount = Decimal('0.00')

        for item_data in items_data:
            product = get_object_or_404(Product, id=item_data['product_id'])

            # Check inventory
            if product.track_inventory and product.stock_quantity < item_data['quantity']:
                raise serializers.ValidationError(
                    f"Insufficient stock for {product.name}. Available: {product.stock_quantity}"
                )

            # Set unit price and calculate total
            item_data['unit_price'] = product.discounted_price
            item_data['total_price'] = item_data['unit_price'] * item_data['quantity']
            total_amount += item_data['total_price']

        # Create order
        order = serializer.save(
            customer=self.request.user,
            total_amount=total_amount
        )

        # Update inventory
        for item in order.items.all():
            if item.product.track_inventory:
                Product.objects.filter(id=item.product.id).update(
                    stock_quantity=item.product.stock_quantity - item.quantity,
                    total_sales=item.product.total_sales + item.quantity
                )

        # Clear shopping cart if order was created from cart
        if self.request.data.get('clear_cart', False):
            cart, created = ShoppingCart.objects.get_or_create(customer=self.request.user)
            cart.items.all().delete()


# Shopping Cart Views
class ShoppingCartView(generics.RetrieveAPIView):
    """
    Retrieve user's shopping cart
    """
    serializer_class = ShoppingCartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, created = ShoppingCart.objects.get_or_create(customer=self.request.user)
        return cart


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """
    Add a product to shopping cart
    """
    # Debug logging
    print(f"🛒 Add to cart request from user: {request.user}")
    print(f"🛒 Request data: {request.data}")

    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)

    if not product_id:
        print("❌ No product_id provided")
        return Response(
            {'error': 'Product ID is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        product = Product.objects.get(
            id=product_id,
            is_active=True,
            vendor__is_active=True,
            vendor__is_verified=True
        )
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Check inventory
    if product.track_inventory and product.stock_quantity < quantity:
        return Response(
            {'error': f'Insufficient stock. Available: {product.stock_quantity}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get or create cart
    cart, created = ShoppingCart.objects.get_or_create(customer=request.user)

    # Add or update cart item
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': quantity}
    )

    if not created:
        # Update existing item
        new_quantity = cart_item.quantity + quantity
        if product.track_inventory and product.stock_quantity < new_quantity:
            return Response(
                {'error': f'Cannot add more items. Available: {product.stock_quantity}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        cart_item.quantity = new_quantity
        cart_item.save()

    serializer = CartItemSerializer(cart_item)
    print(f"✅ Successfully added to cart: {cart_item}")
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    """
    Update cart item quantity
    """
    quantity = request.data.get('quantity', 1)

    try:
        cart_item = CartItem.objects.get(
            id=item_id,
            cart__customer=request.user
        )
    except CartItem.DoesNotExist:
        return Response(
            {'error': 'Cart item not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if quantity <= 0:
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # Check inventory
    product = cart_item.product
    if product.track_inventory and product.stock_quantity < quantity:
        return Response(
            {'error': f'Insufficient stock. Available: {product.stock_quantity}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    cart_item.quantity = quantity
    cart_item.save()

    serializer = CartItemSerializer(cart_item)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    """
    Remove item from shopping cart
    """
    try:
        cart_item = CartItem.objects.get(
            id=item_id,
            cart__customer=request.user
        )
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except CartItem.DoesNotExist:
        return Response(
            {'error': 'Cart item not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    """
    Clear all items from shopping cart
    """
    cart, created = ShoppingCart.objects.get_or_create(customer=request.user)
    cart.items.all().delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# Product Review Views
class ProductReviewListView(generics.ListAPIView):
    """
    List reviews for a specific product
    """
    serializer_class = ProductReviewSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['rating', 'helpful_count', 'created_at']
    ordering = ['-helpful_count', '-created_at']

    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return ProductReview.objects.filter(
            product_id=product_id,
            is_approved=True
        ).select_related('customer', 'product')


class ProductReviewCreateView(generics.CreateAPIView):
    """
    Create a product review
    """
    serializer_class = ProductReviewCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        product = serializer.validated_data['product']

        # Check if user has purchased this product
        has_purchased = OrderItem.objects.filter(
            order__customer=self.request.user,
            product=product,
            order__status__in=['delivered', 'completed']
        ).exists()

        serializer.save(
            customer=self.request.user,
            is_verified_purchase=has_purchased
        )

        # Update product average rating
        avg_rating = ProductReview.objects.filter(
            product=product,
            is_approved=True
        ).aggregate(avg_rating=Avg('rating'))['avg_rating']

        if avg_rating:
            Product.objects.filter(id=product.id).update(average_rating=avg_rating)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_review_helpful(request, review_id):
    """
    Mark a review as helpful
    """
    try:
        review = ProductReview.objects.get(id=review_id, is_approved=True)
        review.helpful_count += 1
        review.save()
        return Response({'helpful_count': review.helpful_count})
    except ProductReview.DoesNotExist:
        return Response(
            {'error': 'Review not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
def search_products(request):
    """
    Advanced product search with multiple filters
    """
    query = request.GET.get('q', '')
    category = request.GET.get('category')
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    county = request.GET.get('county')
    eco_friendly = request.GET.get('eco_friendly')

    queryset = Product.objects.filter(
        is_active=True,
        vendor__is_active=True,
        vendor__is_verified=True
    ).select_related('vendor', 'category')

    # Text search
    if query:
        queryset = queryset.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(tags__icontains=query) |
            Q(eco_friendly_features__icontains=query) |
            Q(vendor__business_name__icontains=query)
        )

    # Category filter
    if category:
        queryset = queryset.filter(category_id=category)

    # Price range filter
    if min_price:
        queryset = queryset.filter(price__gte=min_price)
    if max_price:
        queryset = queryset.filter(price__lte=max_price)

    # Location filter
    if county:
        queryset = queryset.filter(vendor__county=county)

    # Eco-friendly filter
    if eco_friendly and eco_friendly.lower() == 'true':
        queryset = queryset.filter(
            Q(recyclable=True) | Q(biodegradable=True)
        )

    # Paginate results
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(queryset, request)

    if page is not None:
        serializer = ProductListSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    serializer = ProductListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def product_recommendations(request, product_id):
    """
    Get product recommendations based on category and vendor
    """
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get similar products from same category
    similar_products = Product.objects.filter(
        category=product.category,
        is_active=True,
        vendor__is_active=True,
        vendor__is_verified=True
    ).exclude(id=product.id).select_related('vendor', 'category')[:6]

    # Get other products from same vendor
    vendor_products = Product.objects.filter(
        vendor=product.vendor,
        is_active=True
    ).exclude(id=product.id).select_related('vendor', 'category')[:4]

    serializer_similar = ProductListSerializer(similar_products, many=True, context={'request': request})
    serializer_vendor = ProductListSerializer(vendor_products, many=True, context={'request': request})

    return Response({
        'similar_products': serializer_similar.data,
        'vendor_products': serializer_vendor.data
    })


@api_view(['GET'])
def dashboard_stats(request):
    """
    Get dashboard statistics for products
    """
    stats = {
        'total_products': Product.objects.filter(is_active=True).count(),
        'total_vendors': SMEVendor.objects.filter(is_active=True, is_verified=True).count(),
        'total_categories': ProductCategory.objects.filter(is_active=True).count(),
        'featured_products': Product.objects.filter(is_active=True, is_featured=True).count(),
    }

    if request.user.is_authenticated:
        stats.update({
            'user_orders': Order.objects.filter(customer=request.user).count(),
            'cart_items': CartItem.objects.filter(cart__customer=request.user).count(),
        })

    return Response(stats)


# Product Review Views
class ProductReviewListView(generics.ListAPIView):
    """
    List reviews for a specific product
    """
    serializer_class = ProductReviewSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['rating', 'helpful_count', 'created_at']
    ordering = ['-helpful_count', '-created_at']

    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return ProductReview.objects.filter(
            product_id=product_id,
            is_approved=True
        ).select_related('customer', 'product')


class ProductReviewCreateView(generics.CreateAPIView):
    """
    Create a product review
    """
    serializer_class = ProductReviewCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        product = serializer.validated_data['product']

        # Check if user has purchased this product
        has_purchased = OrderItem.objects.filter(
            order__customer=self.request.user,
            product=product,
            order__status__in=['delivered', 'completed']
        ).exists()

        serializer.save(
            customer=self.request.user,
            is_verified_purchase=has_purchased
        )

        # Update product average rating
        avg_rating = ProductReview.objects.filter(
            product=product,
            is_approved=True
        ).aggregate(avg_rating=Avg('rating'))['avg_rating']

        if avg_rating:
            Product.objects.filter(id=product.id).update(average_rating=avg_rating)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_review_helpful(request, review_id):
    """
    Mark a review as helpful
    """
    try:
        review = ProductReview.objects.get(id=review_id, is_approved=True)
        review.helpful_count += 1
        review.save()
        return Response({'helpful_count': review.helpful_count})
    except ProductReview.DoesNotExist:
        return Response(
            {'error': 'Review not found'},
            status=status.HTTP_404_NOT_FOUND
        )


# Search and Discovery Views
@api_view(['GET'])
def search_products(request):
    """
    Advanced product search with multiple filters
    """
    query = request.GET.get('q', '')
    category = request.GET.get('category')
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    county = request.GET.get('county')
    eco_friendly = request.GET.get('eco_friendly')

    queryset = Product.objects.filter(
        is_active=True,
        vendor__is_active=True,
        vendor__is_verified=True
    ).select_related('vendor', 'category')

    # Text search
    if query:
        queryset = queryset.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(tags__icontains=query) |
            Q(eco_friendly_features__icontains=query) |
            Q(vendor__business_name__icontains=query)
        )

    # Category filter
    if category:
        queryset = queryset.filter(category_id=category)

    # Price range filter
    if min_price:
        queryset = queryset.filter(price__gte=min_price)
    if max_price:
        queryset = queryset.filter(price__lte=max_price)

    # Location filter
    if county:
        queryset = queryset.filter(vendor__county=county)

    # Eco-friendly filter
    if eco_friendly and eco_friendly.lower() == 'true':
        queryset = queryset.filter(
            Q(recyclable=True) | Q(biodegradable=True)
        )

    # Paginate results
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(queryset, request)

    if page is not None:
        serializer = ProductListSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    serializer = ProductListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def product_recommendations(request, product_id):
    """
    Get product recommendations based on category and vendor
    """
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get similar products from same category
    similar_products = Product.objects.filter(
        category=product.category,
        is_active=True,
        vendor__is_active=True,
        vendor__is_verified=True
    ).exclude(id=product.id).select_related('vendor', 'category')[:6]

    # Get other products from same vendor
    vendor_products = Product.objects.filter(
        vendor=product.vendor,
        is_active=True
    ).exclude(id=product.id).select_related('vendor', 'category')[:4]

    serializer_similar = ProductListSerializer(similar_products, many=True, context={'request': request})
    serializer_vendor = ProductListSerializer(vendor_products, many=True, context={'request': request})

    return Response({
        'similar_products': serializer_similar.data,
        'vendor_products': serializer_vendor.data
    })


@api_view(['GET'])
def dashboard_stats(request):
    """
    Get dashboard statistics for products
    """
    stats = {
        'total_products': Product.objects.filter(is_active=True).count(),
        'total_vendors': SMEVendor.objects.filter(is_active=True, is_verified=True).count(),
        'total_categories': ProductCategory.objects.filter(is_active=True).count(),
        'featured_products': Product.objects.filter(is_active=True, is_featured=True).count(),
    }

    if request.user.is_authenticated:
        stats.update({
            'user_orders': Order.objects.filter(customer=request.user).count(),
            'cart_items': CartItem.objects.filter(cart__customer=request.user).count(),
        })

    return Response(stats)
