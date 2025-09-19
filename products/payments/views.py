"""
Payment API views
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json

from ..models import Order, PaymentTransaction, PaymentProvider
from .service import PaymentService


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_providers(request):
    """Get available payment providers"""
    providers = PaymentService.get_available_providers()
    return Response({
        'providers': providers
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    """Initiate payment for an order"""
    try:
        data = request.data
        order_id = data.get('order_id')
        provider_name = data.get('provider')
        customer_phone = data.get('customer_phone')
        customer_email = data.get('customer_email', request.user.email)
        
        # Validate required fields
        if not all([order_id, provider_name, customer_phone]):
            return Response({
                'error': 'Missing required fields: order_id, provider, customer_phone'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get order
        order = get_object_or_404(Order, id=order_id, customer=request.user)
        
        if order.status != 'pending':
            return Response({
                'error': 'Order is not in pending status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate callback URL
        callback_url = f"{settings.SITE_URL}/api/v1/payments/webhook/{provider_name}/{order_id}/"
        
        # Initiate payment
        result = PaymentService.initiate_payment(
            order=order,
            provider_name=provider_name,
            customer_phone=customer_phone,
            customer_email=customer_email,
            callback_url=callback_url
        )
        
        if result.success:
            return Response({
                'success': True,
                'message': result.message,
                'transaction_id': result.transaction_id,
                'external_id': result.external_id,
                'data': result.data
            })
        else:
            return Response({
                'success': False,
                'message': result.message,
                'data': result.data
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': f'Payment initiation failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_payment(request, transaction_id):
    """Verify payment status"""
    try:
        # Check if user owns the transaction
        transaction = get_object_or_404(
            PaymentTransaction,
            transaction_id=transaction_id,
            order__customer=request.user
        )
        
        result = PaymentService.verify_payment(transaction_id)
        
        return Response({
            'success': result.success,
            'message': result.message,
            'status': transaction.status,
            'data': result.data
        })
        
    except Exception as e:
        return Response({
            'error': f'Payment verification failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
@api_view(['POST'])
@permission_classes([AllowAny])
def payment_webhook(request, provider_name, transaction_id):
    """Handle payment webhook callbacks"""
    try:
        # Parse webhook data
        if request.content_type == 'application/json':
            webhook_data = json.loads(request.body)
        else:
            webhook_data = dict(request.POST)
        
        # Process webhook
        result = PaymentService.process_webhook(
            provider_name=provider_name,
            transaction_id=transaction_id,
            webhook_data=webhook_data
        )
        
        if result.success:
            return Response({
                'success': True,
                'message': 'Webhook processed successfully'
            })
        else:
            return Response({
                'success': False,
                'message': result.message
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': f'Webhook processing failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refund_payment(request, transaction_id):
    """Refund a payment (admin only)"""
    if not request.user.is_staff:
        return Response({
            'error': 'Permission denied'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        data = request.data
        amount = data.get('amount')  # Optional partial refund
        reason = data.get('reason', 'Refund requested')
        
        result = PaymentService.refund_payment(
            transaction_id=transaction_id,
            amount=amount,
            reason=reason
        )
        
        if result.success:
            return Response({
                'success': True,
                'message': result.message,
                'data': result.data
            })
        else:
            return Response({
                'success': False,
                'message': result.message
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': f'Refund failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_history(request):
    """Get user's payment history"""
    try:
        transactions = PaymentTransaction.objects.filter(
            order__customer=request.user
        ).select_related('order', 'provider').order_by('-initiated_at')
        
        # Paginate results
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = 20
        result_page = paginator.paginate_queryset(transactions, request)
        
        transaction_data = []
        for transaction in result_page:
            transaction_data.append({
                'transaction_id': transaction.transaction_id,
                'external_id': transaction.external_transaction_id,
                'order_id': str(transaction.order.id),
                'order_number': transaction.order.order_number,
                'provider': transaction.provider.display_name,
                'amount': float(transaction.amount),
                'currency': transaction.currency,
                'status': transaction.status,
                'initiated_at': transaction.initiated_at,
                'completed_at': transaction.completed_at,
            })
        
        return paginator.get_paginated_response(transaction_data)
        
    except Exception as e:
        return Response({
            'error': f'Failed to get payment history: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
