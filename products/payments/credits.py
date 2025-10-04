"""
Credits payment provider - Internal payment using user credits
"""
from typing import Dict, Any, Optional
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.db import transaction

from .base import BasePaymentProvider, PaymentResult

User = get_user_model()


class CreditsProvider(BasePaymentProvider):
    """Credits payment provider for internal credit system"""
    
    @property
    def provider_name(self) -> str:
        return 'credits'
    
    def initiate_payment(
        self,
        amount: Decimal,
        currency: str,
        customer_phone: str,
        customer_email: str,
        order_id: str,
        callback_url: str,
        **kwargs
    ) -> PaymentResult:
        """Initiate credits payment"""
        try:
            # Get user from order
            from ..models import Order
            order = Order.objects.get(id=order_id)
            user = order.customer
            
            # Check if user has sufficient credits
            if user.credits < amount:
                return PaymentResult(
                    success=False,
                    message=f"Insufficient credits. Available: {user.credits}, Required: {amount}",
                    data={
                        'available_credits': float(user.credits),
                        'required_amount': float(amount),
                        'shortfall': float(amount - user.credits)
                    }
                )
            
            # Deduct credits from user account
            with transaction.atomic():
                user.credits -= amount
                user.save()
                
                # Create credit transaction record
                from waste_collection.simple_models import CreditTransaction
                CreditTransaction.objects.create(
                    user_profile=user.profile,
                    transaction_type='debit',
                    amount=amount,
                    description=f'Payment for order {order.order_number}',
                    source_type='order_payment',
                    source_id=order_id
                )
            
            return PaymentResult(
                success=True,
                external_id=f"credits_{order_id}",
                message="Credits payment successful",
                data={
                    'amount_paid': float(amount),
                    'remaining_credits': float(user.credits),
                    'payment_method': 'credits'
                }
            )
            
        except Order.DoesNotExist:
            return PaymentResult(
                success=False,
                message="Order not found"
            )
        except Exception as e:
            return PaymentResult(
                success=False,
                message=f"Credits payment failed: {str(e)}"
            )
    
    def verify_payment(self, external_transaction_id: str) -> PaymentResult:
        """Verify credits payment (always successful if transaction exists)"""
        try:
            # For credits, if the external_transaction_id exists, payment was successful
            if external_transaction_id.startswith('credits_'):
                order_id = external_transaction_id.replace('credits_', '')
                
                from ..models import Order
                order = Order.objects.get(id=order_id)
                
                return PaymentResult(
                    success=True,
                    external_id=external_transaction_id,
                    message="Credits payment verified",
                    data={
                        'order_id': order_id,
                        'order_number': order.order_number,
                        'payment_method': 'credits',
                        'status': 'completed'
                    }
                )
            else:
                return PaymentResult(
                    success=False,
                    message="Invalid credits transaction ID"
                )
                
        except Exception as e:
            return PaymentResult(
                success=False,
                message=f"Credits payment verification failed: {str(e)}"
            )
    
    def process_webhook(self, webhook_data: Dict[str, Any]) -> PaymentResult:
        """Process webhook (not applicable for credits)"""
        return PaymentResult(
            success=True,
            message="Credits payment does not use webhooks",
            data=webhook_data
        )
    
    def refund_payment(
        self,
        external_transaction_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None
    ) -> PaymentResult:
        """Refund credits payment"""
        try:
            if not external_transaction_id.startswith('credits_'):
                return PaymentResult(
                    success=False,
                    message="Invalid credits transaction ID"
                )
            
            order_id = external_transaction_id.replace('credits_', '')
            
            from ..models import Order
            order = Order.objects.get(id=order_id)
            user = order.customer
            
            # Determine refund amount
            refund_amount = amount if amount else order.total_amount
            
            # Add credits back to user account
            with transaction.atomic():
                user.credits += refund_amount
                user.save()
                
                # Create credit transaction record
                from waste_collection.simple_models import CreditTransaction
                CreditTransaction.objects.create(
                    user_profile=user.profile,
                    transaction_type='credit',
                    amount=refund_amount,
                    description=f'Refund for order {order.order_number}. Reason: {reason or "Refund requested"}',
                    source_type='order_refund',
                    source_id=order_id
                )
            
            return PaymentResult(
                success=True,
                external_id=f"refund_{external_transaction_id}",
                message="Credits refund successful",
                data={
                    'refund_amount': float(refund_amount),
                    'new_credits_balance': float(user.credits),
                    'reason': reason or "Refund requested"
                }
            )
            
        except Order.DoesNotExist:
            return PaymentResult(
                success=False,
                message="Order not found"
            )
        except Exception as e:
            return PaymentResult(
                success=False,
                message=f"Credits refund failed: {str(e)}"
            )
