from django.urls import path, include
from . import views

app_name = 'products'

urlpatterns = [
    # Vendor endpoints
    path('vendors/', views.SMEVendorListView.as_view(), name='vendor-list'),
    path('vendors/<uuid:id>/', views.SMEVendorDetailView.as_view(), name='vendor-detail'),
    
    # Category endpoints
    path('categories/', views.ProductCategoryListView.as_view(), name='category-list'),
    
    # Product endpoints
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('products/<uuid:id>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('products/featured/', views.FeaturedProductsView.as_view(), name='featured-products'),
    path('products/vendor/<uuid:vendor_id>/', views.ProductsByVendorView.as_view(), name='products-by-vendor'),
    path('products/category/<uuid:category_id>/', views.ProductsByCategoryView.as_view(), name='products-by-category'),
    
    # Search and recommendations
    path('search/', views.search_products, name='search-products'),
    path('products/<uuid:product_id>/recommendations/', views.product_recommendations, name='product-recommendations'),
    
    # Order endpoints
    path('orders/', views.OrderListView.as_view(), name='order-list'),
    path('orders/<uuid:id>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('orders/create/', views.OrderCreateView.as_view(), name='order-create'),
    
    # Shopping cart endpoints
    path('cart/', views.ShoppingCartView.as_view(), name='shopping-cart'),
    path('cart/add/', views.add_to_cart, name='add-to-cart'),
    path('cart/items/<uuid:item_id>/update/', views.update_cart_item, name='update-cart-item'),
    path('cart/items/<uuid:item_id>/remove/', views.remove_from_cart, name='remove-from-cart'),
    path('cart/clear/', views.clear_cart, name='clear-cart'),
    
    # Review endpoints
    path('products/<uuid:product_id>/reviews/', views.ProductReviewListView.as_view(), name='product-reviews'),
    path('reviews/create/', views.ProductReviewCreateView.as_view(), name='create-review'),
    path('reviews/<uuid:review_id>/helpful/', views.mark_review_helpful, name='mark-review-helpful'),
    
    # Dashboard and statistics
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),

    # Payment endpoints
    path('payments/', include('products.payments.urls')),
]
