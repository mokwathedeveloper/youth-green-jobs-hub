from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import ProductReview, Product, SMEVendor, Order, OrderItem
from django.db.models import Avg, Sum, Count

@receiver([post_save, post_delete], sender=ProductReview)
def update_product_average_rating(sender, instance, **kwargs):
    product = instance.product
    average_rating = ProductReview.objects.filter(product=product, is_approved=True).aggregate(Avg('rating'))['rating__avg'] or 0
    product.average_rating = average_rating
    product.save()

@receiver([post_save, post_delete], sender=ProductReview)
def update_vendor_average_rating(sender, instance, **kwargs):
    vendor = instance.product.vendor
    average_rating = Product.objects.filter(vendor=vendor, is_active=True).aggregate(Avg('average_rating'))['average_rating__avg'] or 0
    vendor.average_rating = average_rating
    vendor.save()

@receiver(post_save, sender=Order)
def update_vendor_sales(sender, instance, **kwargs):
    if instance.status == 'delivered':
        for item in instance.items.all():
            vendor = item.product.vendor
            vendor.total_sales = OrderItem.objects.filter(product__vendor=vendor, order__status='delivered').aggregate(Sum('total_price'))['total_price__sum'] or 0
            vendor.total_orders = Order.objects.filter(items__product__vendor=vendor, status='delivered').distinct().count()
            vendor.save()

@receiver(post_save, sender=OrderItem)
def update_product_sales(sender, instance, **kwargs):
    if instance.order.status == 'delivered':
        product = instance.product
        product.total_sales = OrderItem.objects.filter(product=product, order__status='delivered').aggregate(Sum('quantity'))['quantity__sum'] or 0
        product.save()
