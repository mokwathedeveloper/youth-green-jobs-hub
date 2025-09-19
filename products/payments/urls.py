"""
Payment URLs
"""
from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Payment providers
    path('providers/', views.payment_providers, name='payment_providers'),
    
    # Payment operations
    path('initiate/', views.initiate_payment, name='initiate_payment'),
    path('verify/<str:transaction_id>/', views.verify_payment, name='verify_payment'),
    path('refund/<str:transaction_id>/', views.refund_payment, name='refund_payment'),
    
    # Payment history
    path('history/', views.payment_history, name='payment_history'),
    
    # Webhooks
    path('webhook/<str:provider_name>/<str:transaction_id>/', views.payment_webhook, name='payment_webhook'),
]
