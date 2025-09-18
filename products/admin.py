from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    SMEVendor, ProductCategory, Product, ProductImage,
    Order, OrderItem, ProductReview, ShoppingCart, CartItem
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'alt_text', 'sort_order')


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('total_price',)
    fields = ('product', 'quantity', 'unit_price', 'total_price')


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('total_price',)
    fields = ('product', 'quantity', 'unit_price', 'total_price')


@admin.register(SMEVendor)
class SMEVendorAdmin(admin.ModelAdmin):
    list_display = (
        'business_name', 'owner', 'county', 'business_type',
        'is_verified', 'is_active', 'total_sales', 'average_rating'
    )
    list_filter = (
        'business_type', 'county', 'is_verified', 'is_active', 'created_at'
    )
    search_fields = (
        'business_name', 'owner__username', 'owner__email',
        'contact_email', 'description'
    )
    readonly_fields = ('total_sales', 'total_orders', 'average_rating', 'created_at', 'updated_at')

    fieldsets = (
        ('Business Information', {
            'fields': (
                'business_name', 'business_registration_number', 'business_type',
                'description', 'owner'
            )
        }),
        ('Contact Information', {
            'fields': ('contact_email', 'contact_phone', 'website')
        }),
        ('Location', {
            'fields': (
                'address', 'county', 'sub_county', 'latitude', 'longitude'
            )
        }),
        ('Branding', {
            'fields': ('logo',)
        }),
        ('Verification & Status', {
            'fields': (
                'is_verified', 'verification_document', 'is_active'
            )
        }),
        ('Eco-Credentials', {
            'fields': ('eco_certifications', 'sustainability_practices')
        }),
        ('Performance Metrics', {
            'fields': ('total_sales', 'total_orders', 'average_rating'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('owner')


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'is_active', 'sort_order', 'product_count')
    list_filter = ('is_active', 'parent', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('sort_order', 'name')

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'parent')
        }),
        ('Display', {
            'fields': ('icon', 'image', 'sort_order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    readonly_fields = ('created_at', 'updated_at')

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'vendor', 'category', 'price', 'credit_price',
        'stock_quantity', 'is_active', 'is_featured', 'total_sales'
    )
    list_filter = (
        'category', 'vendor', 'is_active', 'is_featured',
        'recyclable', 'biodegradable', 'created_at'
    )
    search_fields = (
        'name', 'description', 'sku', 'vendor__business_name',
        'category__name', 'tags'
    )
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = (
        'view_count', 'total_sales', 'average_rating',
        'discounted_price', 'is_in_stock', 'is_low_stock',
        'created_at', 'updated_at'
    )
    inlines = [ProductImageInline]

    fieldsets = (
        ('Basic Information', {
            'fields': (
                'name', 'slug', 'description', 'short_description',
                'vendor', 'category'
            )
        }),
        ('Pricing', {
            'fields': (
                'price', 'credit_price', 'discount_percentage', 'discounted_price'
            )
        }),
        ('Inventory', {
            'fields': (
                'stock_quantity', 'low_stock_threshold', 'track_inventory',
                'is_in_stock', 'is_low_stock'
            )
        }),
        ('Product Details', {
            'fields': ('sku', 'weight_kg', 'dimensions')
        }),
        ('Eco-Friendly Attributes', {
            'fields': (
                'eco_friendly_features', 'materials', 'recyclable',
                'biodegradable', 'carbon_footprint_kg'
            )
        }),
        ('Media', {
            'fields': ('featured_image',)
        }),
        ('Status & Visibility', {
            'fields': ('is_active', 'is_featured')
        }),
        ('SEO & Marketing', {
            'fields': ('meta_title', 'meta_description', 'tags'),
            'classes': ('collapse',)
        }),
        ('Performance Metrics', {
            'fields': ('view_count', 'total_sales', 'average_rating'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('vendor', 'category')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number', 'customer', 'status', 'payment_method',
        'total_amount', 'credits_used', 'created_at'
    )
    list_filter = (
        'status', 'payment_method', 'delivery_county', 'created_at'
    )
    search_fields = (
        'order_number', 'customer__username', 'customer__email',
        'delivery_address', 'tracking_number'
    )
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    inlines = [OrderItemInline]

    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'customer', 'status')
        }),
        ('Payment', {
            'fields': (
                'payment_method', 'total_amount', 'credits_used', 'cash_amount'
            )
        }),
        ('Delivery Information', {
            'fields': (
                'delivery_address', 'delivery_county', 'delivery_sub_county',
                'delivery_phone', 'delivery_instructions'
            )
        }),
        ('Tracking', {
            'fields': ('tracking_number',)
        }),
        ('Timestamps', {
            'fields': (
                'created_at', 'updated_at', 'confirmed_at',
                'shipped_at', 'delivered_at'
            ),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('customer_notes', 'admin_notes'),
            'classes': ('collapse',)
        })
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('customer')


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = (
        'product', 'customer', 'rating', 'title',
        'is_verified_purchase', 'is_approved', 'created_at'
    )
    list_filter = (
        'rating', 'is_verified_purchase', 'is_approved', 'created_at'
    )
    search_fields = (
        'product__name', 'customer__username', 'title', 'comment'
    )
    readonly_fields = ('helpful_count', 'created_at', 'updated_at')

    fieldsets = (
        ('Review Information', {
            'fields': ('product', 'customer', 'order_item', 'rating')
        }),
        ('Review Content', {
            'fields': ('title', 'comment')
        }),
        ('Status', {
            'fields': ('is_verified_purchase', 'is_approved')
        }),
        ('Metrics', {
            'fields': ('helpful_count',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product', 'customer')


@admin.register(ShoppingCart)
class ShoppingCartAdmin(admin.ModelAdmin):
    list_display = ('customer', 'total_items', 'total_amount', 'updated_at')
    search_fields = ('customer__username', 'customer__email')
    readonly_fields = ('total_items', 'total_amount', 'created_at', 'updated_at')
    inlines = [CartItemInline]

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('customer')


# Register remaining models with basic admin
admin.site.register(ProductImage)
admin.site.register(OrderItem)
admin.site.register(CartItem)
