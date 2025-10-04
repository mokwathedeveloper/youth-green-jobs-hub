from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib import messages
from django.core.management import call_command
from django.http import HttpResponseRedirect
from .models import (
    SMEVendor, ProductCategory, Product, ProductImage,
    Order, OrderItem, ProductReview, ShoppingCart, CartItem
)


# ===== ADMIN ACTIONS FOR DATABASE INITIALIZATION =====

def populate_sample_data(modeladmin, request, queryset):
    """Admin action to populate the database with sample data"""
    try:
        # Import here to avoid circular imports
        from django.core.management import call_command
        from authentication.models import User

        # Check current state
        user_count = User.objects.count()
        product_count = Product.objects.count()
        category_count = ProductCategory.objects.count()
        vendor_count = SMEVendor.objects.count()

        messages.info(request, f"Before population: {user_count} users, {product_count} products, {category_count} categories, {vendor_count} vendors")

        # Run the populate command
        call_command('populate_products', verbosity=2)

        # Check new state
        new_user_count = User.objects.count()
        new_product_count = Product.objects.count()
        new_category_count = ProductCategory.objects.count()
        new_vendor_count = SMEVendor.objects.count()

        messages.success(request, f"✅ Database populated successfully!")
        messages.info(request, f"After population: {new_user_count} users, {new_product_count} products, {new_category_count} categories, {new_vendor_count} vendors")

    except Exception as e:
        messages.error(request, f"❌ Error populating database: {str(e)}")

populate_sample_data.short_description = "🌱 Populate database with sample data"

def clear_product_data(modeladmin, request, queryset):
    """Admin action to clear all product-related data"""
    try:
        # Clear in correct order to avoid foreign key constraints
        Product.objects.all().delete()
        SMEVendor.objects.all().delete()
        ProductCategory.objects.all().delete()

        messages.success(request, "✅ All product data cleared successfully!")
        messages.info(request, "You can now run 'Populate database with sample data' to add fresh data")

    except Exception as e:
        messages.error(request, f"❌ Error clearing data: {str(e)}")

clear_product_data.short_description = "🧹 Clear all product data"

def check_database_status(modeladmin, request, queryset):
    """Admin action to check current database status"""
    try:
        from authentication.models import User

        user_count = User.objects.count()
        product_count = Product.objects.count()
        category_count = ProductCategory.objects.count()
        vendor_count = SMEVendor.objects.count()
        order_count = Order.objects.count()

        messages.info(request, f"📊 Database Status:")
        messages.info(request, f"Users: {user_count}")
        messages.info(request, f"Products: {product_count}")
        messages.info(request, f"Categories: {category_count}")
        messages.info(request, f"Vendors: {vendor_count}")
        messages.info(request, f"Orders: {order_count}")

        if product_count == 0:
            messages.warning(request, "⚠️ No products found. Consider running 'Populate database with sample data'")
        else:
            messages.success(request, "✅ Database has data")

    except Exception as e:
        messages.error(request, f"❌ Error checking database: {str(e)}")

check_database_status.short_description = "📊 Check database status"


def fix_product_images(modeladmin, request, queryset):
    """Admin action to fix product images with placeholder URLs"""
    try:
        from products.models import Product
        from django.core.files.base import ContentFile
        import requests
        from io import BytesIO

        # Simple placeholder images using a reliable service
        placeholder_urls = [
            "https://via.placeholder.com/400x300/3498db/ffffff?text=Solar+Product",
            "https://via.placeholder.com/400x300/2ecc71/ffffff?text=Eco+Product",
            "https://via.placeholder.com/400x300/e74c3c/ffffff?text=Green+Product",
            "https://via.placeholder.com/400x300/f39c12/ffffff?text=Sustainable",
            "https://via.placeholder.com/400x300/9b59b6/ffffff?text=Recycled",
            "https://via.placeholder.com/400x300/1abc9c/ffffff?text=Organic"
        ]

        products = Product.objects.filter(featured_image__isnull=True) or Product.objects.filter(featured_image='')
        updated_count = 0

        for i, product in enumerate(products[:6]):  # Limit to 6 products
            try:
                # Download placeholder image
                url = placeholder_urls[i % len(placeholder_urls)]
                response = requests.get(url, timeout=10)

                if response.status_code == 200:
                    # Create filename
                    filename = f"{product.slug or 'product'}_{i+1}.png"

                    # Save image to product
                    product.featured_image.save(
                        filename,
                        ContentFile(response.content),
                        save=True
                    )
                    updated_count += 1

            except Exception as img_error:
                # If image download fails, just continue
                continue

        if updated_count > 0:
            messages.success(request, f"✅ Fixed images for {updated_count} products")
        else:
            messages.warning(request, "⚠️ No products needed image fixes or download failed")

    except Exception as e:
        messages.error(request, f"❌ Error fixing images: {str(e)}")

fix_product_images.short_description = "🖼️ Fix product images with placeholders"


def populate_all_sections(modeladmin, request, queryset):
    """Admin action to populate ALL sections with sample data"""
    try:
        from django.core.management import call_command
        from authentication.models import User
        from products.models import Product, ProductCategory, SMEVendor, Order, OrderItem, ProductReview
        from waste_collection.simple_models import WasteReport, CollectionEvent, CreditTransaction
        from django.contrib.auth.models import Group
        from decimal import Decimal
        from datetime import datetime, timedelta
        import random

        # Get current counts
        before_counts = {
            'users': User.objects.count(),
            'products': Product.objects.count(),
            'orders': Order.objects.count(),
            'reviews': ProductReview.objects.count(),
            'waste_reports': WasteReport.objects.count(),
            'collection_events': CollectionEvent.objects.count(),
            'credit_transactions': CreditTransaction.objects.count()
        }

        # 1. Populate products first
        call_command('populate_products', verbosity=1)

        # 2. Create sample orders
        users = User.objects.all()[:3]
        products = Product.objects.all()[:3]

        if users and products:
            for i, user in enumerate(users):
                order = Order.objects.create(
                    user=user,
                    total_amount=Decimal('50.00') + (i * 10),
                    status='completed',
                    shipping_address=f"Address {i+1}, Nairobi"
                )

                # Add order items
                for j, product in enumerate(products[:2]):
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=j + 1,
                        price=product.price
                    )

        # 3. Create sample reviews
        if users and products:
            for user in users:
                for product in products[:2]:
                    ProductReview.objects.get_or_create(
                        user=user,
                        product=product,
                        defaults={
                            'rating': random.randint(4, 5),
                            'comment': f"Great product! Very satisfied with {product.name}.",
                            'is_verified_purchase': True
                        }
                    )

        # 4. Create sample waste reports
        if users:
            for i, user in enumerate(users):
                WasteReport.objects.get_or_create(
                    reporter=user,
                    defaults={
                        'title': f'Waste Report {i+1}',
                        'description': f'Found waste at location {i+1}',
                        'location_description': f'Near market area {i+1}',
                        'estimated_quantity': Decimal('5.5') + i,
                        'status': 'reported'
                    }
                )

        # Get final counts
        after_counts = {
            'users': User.objects.count(),
            'products': Product.objects.count(),
            'orders': Order.objects.count(),
            'reviews': ProductReview.objects.count(),
            'waste_reports': WasteReport.objects.count(),
            'collection_events': CollectionEvent.objects.count(),
            'credit_transactions': CreditTransaction.objects.count()
        }

        messages.success(request, "🎉 ALL SECTIONS POPULATED SUCCESSFULLY!")
        messages.info(request, f"Before: {before_counts}")
        messages.info(request, f"After: {after_counts}")

    except Exception as e:
        messages.error(request, f"❌ Error populating all sections: {str(e)}")

populate_all_sections.short_description = "🚀 Populate ALL sections with sample data"


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
    actions = [populate_sample_data, clear_product_data, check_database_status, fix_product_images, populate_all_sections]

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
    actions = [populate_sample_data, clear_product_data, check_database_status, fix_product_images, populate_all_sections]

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
