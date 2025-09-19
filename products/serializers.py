from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    SMEVendor, ProductCategory, Product, ProductImage,
    Order, OrderItem, ProductReview, ShoppingCart, CartItem,
    PaymentProvider, PaymentTransaction
)

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user information for nested serialization"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class SMEVendorListSerializer(serializers.ModelSerializer):
    """Serializer for SME vendor list view"""
    owner = UserBasicSerializer(read_only=True)
    eco_certifications_list = serializers.ReadOnlyField()
    
    class Meta:
        model = SMEVendor
        fields = [
            'id', 'business_name', 'business_type', 'description',
            'owner', 'county', 'sub_county', 'logo', 'is_verified',
            'eco_certifications_list', 'average_rating', 'total_sales',
            'created_at'
        ]


class SMEVendorDetailSerializer(serializers.ModelSerializer):
    """Detailed SME vendor serializer"""
    owner = UserBasicSerializer(read_only=True)
    eco_certifications_list = serializers.ReadOnlyField()
    
    class Meta:
        model = SMEVendor
        fields = [
            'id', 'business_name', 'business_registration_number', 'business_type',
            'description', 'owner', 'contact_email', 'contact_phone',
            'address', 'county', 'sub_county', 'latitude', 'longitude',
            'website', 'logo', 'is_verified', 'eco_certifications_list',
            'sustainability_practices', 'average_rating', 'total_sales',
            'total_orders', 'created_at', 'updated_at'
        ]


class ProductCategorySerializer(serializers.ModelSerializer):
    """Product category serializer with hierarchy support"""
    subcategories = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductCategory
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 'image',
            'parent', 'subcategories', 'product_count', 'is_active',
            'sort_order', 'created_at'
        ]
    
    def get_subcategories(self, obj):
        if obj.subcategories.exists():
            return ProductCategorySerializer(
                obj.subcategories.filter(is_active=True), 
                many=True, 
                context=self.context
            ).data
        return []
    
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    """Product image serializer"""
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'sort_order']


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for product list view"""
    vendor = SMEVendorListSerializer(read_only=True)
    category = ProductCategorySerializer(read_only=True)
    discounted_price = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    tags_list = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'vendor', 'category',
            'price', 'credit_price', 'discount_percentage', 'discounted_price',
            'featured_image', 'is_in_stock', 'is_featured', 'average_rating',
            'total_sales', 'tags_list', 'created_at'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """Detailed product serializer"""
    vendor = SMEVendorDetailSerializer(read_only=True)
    category = ProductCategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    discounted_price = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    tags_list = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'vendor', 'category', 'price', 'credit_price', 'discount_percentage',
            'discounted_price', 'stock_quantity', 'is_in_stock', 'is_low_stock',
            'sku', 'weight_kg', 'dimensions', 'eco_friendly_features',
            'materials', 'recyclable', 'biodegradable', 'carbon_footprint_kg',
            'featured_image', 'images', 'is_featured', 'meta_title',
            'meta_description', 'tags_list', 'view_count', 'total_sales',
            'average_rating', 'created_at', 'updated_at'
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    """Order item serializer"""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_id', 'quantity', 
            'unit_price', 'total_price'
        ]


class OrderListSerializer(serializers.ModelSerializer):
    """Order list serializer"""
    customer = UserBasicSerializer(read_only=True)
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'status', 'payment_method',
            'total_amount', 'credits_used', 'item_count', 'created_at'
        ]
    
    def get_item_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    """Detailed order serializer"""
    customer = UserBasicSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'status', 'payment_method',
            'total_amount', 'credits_used', 'cash_amount', 'items',
            'delivery_address', 'delivery_county', 'delivery_sub_county',
            'delivery_phone', 'delivery_instructions', 'tracking_number',
            'customer_notes', 'created_at', 'updated_at', 'confirmed_at',
            'shipped_at', 'delivered_at'
        ]


class ProductReviewSerializer(serializers.ModelSerializer):
    """Product review serializer"""
    customer = UserBasicSerializer(read_only=True)
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = ProductReview
        fields = [
            'id', 'product', 'customer', 'rating', 'title', 'comment',
            'is_verified_purchase', 'helpful_count', 'created_at'
        ]


class CartItemSerializer(serializers.ModelSerializer):
    """Shopping cart item serializer"""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)
    unit_price = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_id', 'quantity', 
            'unit_price', 'total_price', 'added_at', 'updated_at'
        ]


class ShoppingCartSerializer(serializers.ModelSerializer):
    """Shopping cart serializer"""
    customer = UserBasicSerializer(read_only=True)
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    total_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = ShoppingCart
        fields = [
            'id', 'customer', 'items', 'total_items', 
            'total_amount', 'created_at', 'updated_at'
        ]


# Create/Update Serializers
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating products"""
    class Meta:
        model = Product
        fields = [
            'name', 'slug', 'description', 'short_description', 'category',
            'price', 'credit_price', 'discount_percentage', 'stock_quantity',
            'low_stock_threshold', 'track_inventory', 'sku', 'weight_kg',
            'dimensions', 'eco_friendly_features', 'materials', 'recyclable',
            'biodegradable', 'carbon_footprint_kg', 'featured_image',
            'is_active', 'is_featured', 'meta_title', 'meta_description', 'tags'
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = [
            'payment_method', 'delivery_address', 'delivery_county',
            'delivery_sub_county', 'delivery_phone', 'delivery_instructions',
            'customer_notes', 'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        return order


class ProductReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating product reviews"""
    class Meta:
        model = ProductReview
        fields = ['product', 'rating', 'title', 'comment']


# Payment Serializers
class PaymentProviderSerializer(serializers.ModelSerializer):
    """Payment provider serializer"""
    supported_currencies_list = serializers.ReadOnlyField()

    class Meta:
        model = PaymentProvider
        fields = [
            'id', 'name', 'display_name', 'is_active', 'supported_currencies_list',
            'min_amount', 'max_amount', 'transaction_fee_percentage', 'fixed_fee'
        ]


class PaymentTransactionSerializer(serializers.ModelSerializer):
    """Payment transaction serializer"""
    provider = PaymentProviderSerializer(read_only=True)
    order = OrderListSerializer(read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'transaction_id', 'external_transaction_id', 'order', 'provider',
            'amount', 'currency', 'fee_amount', 'status', 'customer_phone',
            'customer_email', 'initiated_at', 'completed_at', 'expires_at',
            'failure_reason', 'retry_count', 'max_retries'
        ]


class PaymentInitiateSerializer(serializers.Serializer):
    """Serializer for payment initiation"""
    order_id = serializers.UUIDField()
    provider = serializers.CharField(max_length=50)
    customer_phone = serializers.CharField(max_length=15)
    customer_email = serializers.EmailField(required=False)


class PaymentRefundSerializer(serializers.Serializer):
    """Serializer for payment refund"""
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    reason = serializers.CharField(max_length=500, required=False)
