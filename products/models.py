import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from decimal import Decimal

User = get_user_model()


class SMEVendor(models.Model):
    """
    SME (Small and Medium Enterprise) Vendor model
    Represents eco-friendly businesses selling products on the platform
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Business Information
    business_name = models.CharField(
        max_length=200,
        help_text=_("Official business name")
    )

    business_registration_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        help_text=_("Official business registration number")
    )

    business_type = models.CharField(
        max_length=50,
        choices=[
            ('sole_proprietorship', _('Sole Proprietorship')),
            ('partnership', _('Partnership')),
            ('limited_company', _('Limited Company')),
            ('cooperative', _('Cooperative')),
            ('ngo', _('NGO/Non-Profit')),
            ('other', _('Other')),
        ],
        help_text=_("Type of business entity")
    )

    description = models.TextField(
        help_text=_("Business description and mission")
    )

    # Contact Information
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_businesses',
        help_text=_("Primary business owner/contact person")
    )

    contact_email = models.EmailField(
        help_text=_("Business contact email")
    )

    contact_phone = models.CharField(
        max_length=15,
        help_text=_("Business contact phone number")
    )

    # Location Information
    address = models.TextField(
        help_text=_("Physical business address")
    )

    county = models.CharField(
        max_length=50,
        default='Kisumu',
        help_text=_("County where business is located")
    )

    sub_county = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text=_("Sub-county or ward")
    )

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        blank=True,
        null=True,
        help_text=_("Latitude coordinate for business location")
    )

    longitude = models.DecimalField(
        max_digits=11,
        decimal_places=8,
        blank=True,
        null=True,
        help_text=_("Longitude coordinate for business location")
    )

    # Business Details
    website = models.URLField(
        blank=True,
        null=True,
        help_text=_("Business website URL")
    )

    logo = models.ImageField(
        upload_to='vendor_logos/',
        blank=True,
        null=True,
        help_text=_("Business logo image")
    )

    # Verification and Status
    is_verified = models.BooleanField(
        default=False,
        help_text=_("Whether the business has been verified by platform administrators")
    )

    verification_document = models.FileField(
        upload_to='vendor_verification/',
        blank=True,
        null=True,
        help_text=_("Business registration or verification documents")
    )

    is_active = models.BooleanField(
        default=True,
        help_text=_("Whether the vendor is currently active on the platform")
    )

    # Eco-Credentials
    eco_certifications = models.TextField(
        blank=True,
        null=True,
        help_text=_("Environmental certifications and credentials (comma-separated)")
    )

    sustainability_practices = models.TextField(
        blank=True,
        null=True,
        help_text=_("Description of sustainable business practices")
    )

    # Performance Metrics
    total_sales = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Total sales amount in KSh")
    )

    total_orders = models.PositiveIntegerField(
        default=0,
        help_text=_("Total number of orders fulfilled")
    )

    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text=_("Average customer rating (0-5 stars)")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("SME Vendor")
        verbose_name_plural = _("SME Vendors")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.business_name} ({self.county})"

    @property
    def eco_certifications_list(self):
        """Return eco certifications as a list"""
        if self.eco_certifications:
            return [cert.strip() for cert in self.eco_certifications.split(',') if cert.strip()]
        return []


class ProductCategory(models.Model):
    """
    Product Category model for organizing eco-friendly products
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text=_("Category name")
    )

    slug = models.SlugField(
        max_length=100,
        unique=True,
        help_text=_("URL-friendly category identifier")
    )

    description = models.TextField(
        help_text=_("Category description")
    )

    icon = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text=_("Icon name for UI display (e.g., 'leaf', 'recycle')")
    )

    image = models.ImageField(
        upload_to='category_images/',
        blank=True,
        null=True,
        help_text=_("Category banner image")
    )

    # Hierarchy
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='subcategories',
        help_text=_("Parent category for hierarchical organization")
    )

    # Status
    is_active = models.BooleanField(
        default=True,
        help_text=_("Whether this category is active and visible")
    )

    # Ordering
    sort_order = models.PositiveIntegerField(
        default=0,
        help_text=_("Sort order for category display")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Product Category")
        verbose_name_plural = _("Product Categories")
        ordering = ['sort_order', 'name']

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name


class Product(models.Model):
    """
    Product model for eco-friendly products sold by SME vendors
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Basic Information
    name = models.CharField(
        max_length=200,
        help_text=_("Product name")
    )

    slug = models.SlugField(
        max_length=200,
        help_text=_("URL-friendly product identifier")
    )

    description = models.TextField(
        help_text=_("Detailed product description")
    )

    short_description = models.CharField(
        max_length=300,
        help_text=_("Brief product summary for listings")
    )

    # Vendor and Category
    vendor = models.ForeignKey(
        SMEVendor,
        on_delete=models.CASCADE,
        related_name='products',
        help_text=_("SME vendor selling this product")
    )

    category = models.ForeignKey(
        ProductCategory,
        on_delete=models.CASCADE,
        related_name='products',
        help_text=_("Product category")
    )

    # Pricing (in KSh)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text=_("Product price in Kenyan Shillings (KSh)")
    )

    credit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text=_("Price in platform credits (if purchasable with credits)")
    )

    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_("Discount percentage (0-100)")
    )

    # Inventory
    stock_quantity = models.PositiveIntegerField(
        default=0,
        help_text=_("Current stock quantity available")
    )

    low_stock_threshold = models.PositiveIntegerField(
        default=5,
        help_text=_("Threshold for low stock alerts")
    )

    track_inventory = models.BooleanField(
        default=True,
        help_text=_("Whether to track inventory for this product")
    )

    # Product Details
    sku = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        help_text=_("Stock Keeping Unit identifier")
    )

    weight_kg = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        blank=True,
        null=True,
        validators=[MinValueValidator(Decimal('0.001'))],
        help_text=_("Product weight in kilograms")
    )

    dimensions = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text=_("Product dimensions (L x W x H in cm)")
    )

    # Eco-Friendly Attributes
    eco_friendly_features = models.TextField(
        help_text=_("Environmental benefits and eco-friendly features")
    )

    materials = models.CharField(
        max_length=300,
        help_text=_("Materials used in product manufacturing")
    )

    recyclable = models.BooleanField(
        default=True,
        help_text=_("Whether the product is recyclable")
    )

    biodegradable = models.BooleanField(
        default=False,
        help_text=_("Whether the product is biodegradable")
    )

    carbon_footprint_kg = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        blank=True,
        null=True,
        help_text=_("Estimated carbon footprint in kg CO2")
    )

    # Images
    featured_image = models.ImageField(
        upload_to='product_images/',
        help_text=_("Main product image")
    )

    # Status and Visibility
    is_active = models.BooleanField(
        default=True,
        help_text=_("Whether the product is active and visible")
    )

    is_featured = models.BooleanField(
        default=False,
        help_text=_("Whether to feature this product prominently")
    )

    # SEO and Marketing
    meta_title = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text=_("SEO meta title")
    )

    meta_description = models.CharField(
        max_length=300,
        blank=True,
        null=True,
        help_text=_("SEO meta description")
    )

    tags = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text=_("Product tags for search and filtering (comma-separated)")
    )

    # Performance Metrics
    view_count = models.PositiveIntegerField(
        default=0,
        help_text=_("Number of times product has been viewed")
    )

    total_sales = models.PositiveIntegerField(
        default=0,
        help_text=_("Total number of units sold")
    )

    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text=_("Average customer rating (0-5 stars)")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Product")
        verbose_name_plural = _("Products")
        ordering = ['-created_at']
        unique_together = ['vendor', 'slug']

    def __str__(self):
        return f"{self.name} - {self.vendor.business_name}"

    @property
    def discounted_price(self):
        """Calculate discounted price"""
        if self.discount_percentage > 0:
            discount_amount = self.price * (self.discount_percentage / 100)
            return self.price - discount_amount
        return self.price

    @property
    def is_in_stock(self):
        """Check if product is in stock"""
        if not self.track_inventory:
            return True
        return self.stock_quantity > 0

    @property
    def is_low_stock(self):
        """Check if product is low in stock"""
        if not self.track_inventory:
            return False
        return self.stock_quantity <= self.low_stock_threshold

    @property
    def tags_list(self):
        """Return tags as a list"""
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
        return []


class ProductImage(models.Model):
    """
    Additional product images for gallery display
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        help_text=_("Product this image belongs to")
    )

    image = models.ImageField(
        upload_to='product_images/',
        help_text=_("Product image")
    )

    alt_text = models.CharField(
        max_length=200,
        help_text=_("Alternative text for accessibility")
    )

    sort_order = models.PositiveIntegerField(
        default=0,
        help_text=_("Sort order for image display")
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Product Image")
        verbose_name_plural = _("Product Images")
        ordering = ['sort_order', 'created_at']

    def __str__(self):
        return f"{self.product.name} - Image {self.sort_order}"


class Order(models.Model):
    """
    Order model for tracking product purchases
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Order Information
    order_number = models.CharField(
        max_length=20,
        unique=True,
        help_text=_("Unique order identifier")
    )

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders',
        help_text=_("Customer who placed the order")
    )

    # Order Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', _('Pending')),
            ('confirmed', _('Confirmed')),
            ('processing', _('Processing')),
            ('shipped', _('Shipped')),
            ('delivered', _('Delivered')),
            ('cancelled', _('Cancelled')),
            ('refunded', _('Refunded')),
        ],
        default='pending',
        help_text=_("Current order status")
    )

    # Payment Information
    payment_method = models.CharField(
        max_length=20,
        choices=[
            ('credits', _('Platform Credits')),
            ('mpesa', _('M-Pesa')),
            ('bank_transfer', _('Bank Transfer')),
            ('cash_on_delivery', _('Cash on Delivery')),
            ('mixed', _('Mixed Payment')),
        ],
        help_text=_("Payment method used")
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text=_("Total order amount in KSh")
    )

    credits_used = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Amount paid using platform credits")
    )

    cash_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Amount paid in cash/other methods")
    )

    # Delivery Information
    delivery_address = models.TextField(
        help_text=_("Delivery address")
    )

    delivery_county = models.CharField(
        max_length=50,
        help_text=_("Delivery county")
    )

    delivery_sub_county = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text=_("Delivery sub-county")
    )

    delivery_phone = models.CharField(
        max_length=15,
        help_text=_("Delivery contact phone")
    )

    delivery_instructions = models.TextField(
        blank=True,
        null=True,
        help_text=_("Special delivery instructions")
    )

    # Tracking
    tracking_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text=_("Shipping tracking number")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(blank=True, null=True)
    shipped_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)

    # Notes
    customer_notes = models.TextField(
        blank=True,
        null=True,
        help_text=_("Customer notes or special requests")
    )

    admin_notes = models.TextField(
        blank=True,
        null=True,
        help_text=_("Internal admin notes")
    )

    class Meta:
        verbose_name = _("Order")
        verbose_name_plural = _("Orders")
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_number} - {self.customer.get_full_name()}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate unique order number
            import random
            import string
            while True:
                order_number = 'YGJ' + ''.join(random.choices(string.digits, k=8))
                if not Order.objects.filter(order_number=order_number).exists():
                    self.order_number = order_number
                    break
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """
    Individual items within an order
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        help_text=_("Order this item belongs to")
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='order_items',
        help_text=_("Product being ordered")
    )

    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text=_("Quantity ordered")
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_("Price per unit at time of order")
    )

    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text=_("Total price for this item (quantity × unit_price)")
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Order Item")
        verbose_name_plural = _("Order Items")
        ordering = ['created_at']

    def __str__(self):
        return f"{self.product.name} × {self.quantity}"

    def save(self, *args, **kwargs):
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)


class ProductReview(models.Model):
    """
    Customer reviews and ratings for products
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews',
        help_text=_("Product being reviewed")
    )

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='product_reviews',
        help_text=_("Customer who wrote the review")
    )

    order_item = models.ForeignKey(
        OrderItem,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        help_text=_("Order item this review is for (ensures verified purchase)")
    )

    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text=_("Rating from 1 to 5 stars")
    )

    title = models.CharField(
        max_length=200,
        help_text=_("Review title")
    )

    comment = models.TextField(
        help_text=_("Detailed review comment")
    )

    # Review Status
    is_verified_purchase = models.BooleanField(
        default=False,
        help_text=_("Whether this review is from a verified purchase")
    )

    is_approved = models.BooleanField(
        default=True,
        help_text=_("Whether the review is approved for display")
    )

    # Helpfulness
    helpful_count = models.PositiveIntegerField(
        default=0,
        help_text=_("Number of users who found this review helpful")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Product Review")
        verbose_name_plural = _("Product Reviews")
        ordering = ['-created_at']
        unique_together = ['product', 'customer']  # One review per customer per product

    def __str__(self):
        return f"{self.product.name} - {self.rating}★ by {self.customer.get_full_name()}"


class ShoppingCart(models.Model):
    """
    Shopping cart for storing items before checkout
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    customer = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='shopping_cart',
        help_text=_("Customer who owns this cart")
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Shopping Cart")
        verbose_name_plural = _("Shopping Carts")

    def __str__(self):
        return f"Cart for {self.customer.get_full_name()}"

    @property
    def total_items(self):
        """Get total number of items in cart"""
        return sum(item.quantity for item in self.items.all())

    @property
    def total_amount(self):
        """Calculate total cart amount"""
        return sum(item.total_price for item in self.items.all())


class CartItem(models.Model):
    """
    Individual items in a shopping cart
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    cart = models.ForeignKey(
        ShoppingCart,
        on_delete=models.CASCADE,
        related_name='items',
        help_text=_("Shopping cart this item belongs to")
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        help_text=_("Product in the cart")
    )

    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text=_("Quantity of this product in cart")
    )

    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Cart Item")
        verbose_name_plural = _("Cart Items")
        unique_together = ['cart', 'product']  # One entry per product per cart
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.product.name} × {self.quantity}"

    @property
    def unit_price(self):
        """Get current product price"""
        return self.product.discounted_price

    @property
    def total_price(self):
        """Calculate total price for this cart item"""
        return self.unit_price * self.quantity
