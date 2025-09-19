"""
Payment service manager
"""
from typing import Dict, Any, Optional
from decimal import Decimal
from django.conf import settings
from django.core.exceptions import ValidationError

from ..models import PaymentProvider, PaymentTransaction, Order
from .base import BasePaymentProvider, PaymentResult
from .mpesa import MpesaProvider
from .paystack import PaystackProvider


class PaymentService:
    """Central payment service manager"""
    
    PROVIDERS = {
        'mpesa': MpesaProvider,
        'paystack': PaystackProvider,
    }
    
    @classmethod
    def get_provider(cls, provider_name: str) -> Optional[BasePaymentProvider]:
        """Get payment provider instance"""
        try:
            provider_config = PaymentProvider.objects.get(
                name=provider_name,
                is_active=True
            )
            
            provider_class = cls.PROVIDERS.get(provider_name)
            if not provider_class:
                raise ValueError(f"Unsupported payment provider: {provider_name}")
            
            config = provider_config.configuration.copy()
            config['is_sandbox'] = provider_config.is_sandbox
            
            return provider_class(config)
            
        except PaymentProvider.DoesNotExist:
            return None
    
    @classmethod
    def get_available_providers(cls) -> list:
        """Get list of available payment providers"""
        return list(PaymentProvider.objects.filter(is_active=True).values(
            'name', 'display_name', 'min_amount', 'max_amount'
        ))
    
    @classmethod
    def initiate_payment(
        cls,
        order: Order,
        provider_name: str,
        customer_phone: str,
        customer_email: str,
        callback_url: str,
        **kwargs
    ) -> PaymentResult:
        """Initiate payment for an order"""
        try:
            # Get payment provider
            provider = cls.get_provider(provider_name)
            if not provider:
                return PaymentResult(
                    success=False,
                    message=f"Payment provider '{provider_name}' not available"
                )
            
            # Get provider configuration
            provider_config = PaymentProvider.objects.get(
                name=provider_name,
                is_active=True
            )
            
            # Validate amount
            if not provider.validate_amount(
                order.total_amount,
                provider_config.min_amount,
                provider_config.max_amount
            ):
                return PaymentResult(
                    success=False,
                    message=f"Amount must be between {provider_config.min_amount} and {provider_config.max_amount}"
                )
            
            # Create payment transaction record
            transaction = PaymentTransaction.objects.create(
                order=order,
                provider=provider_config,
                amount=order.total_amount,
                currency='KES',
                fee_amount=provider_config.calculate_fee(order.total_amount),
                customer_phone=customer_phone,
                customer_email=customer_email,
                status='pending'
            )
            
            # Initiate payment with provider
            result = provider.initiate_payment(
                amount=order.total_amount,
                currency='KES',
                customer_phone=customer_phone,
                customer_email=customer_email,
                order_id=str(order.id),
                callback_url=callback_url,
                **kwargs
            )
            
            # Update transaction with result
            if result.success:
                transaction.external_transaction_id = result.external_id
                transaction.status = 'processing'
                transaction.provider_data = result.data
            else:
                transaction.status = 'failed'
                transaction.failure_reason = result.message
                transaction.provider_data = result.data
            
            transaction.save()
            
            # Add transaction ID to result
            result.transaction_id = transaction.transaction_id
            
            return result
            
        except Exception as e:
            return PaymentResult(
                success=False,
                message=f"Payment initiation error: {str(e)}"
            )
    
    @classmethod
    def verify_payment(cls, transaction_id: str) -> PaymentResult:
        """Verify payment status"""
        try:
            transaction = PaymentTransaction.objects.get(
                transaction_id=transaction_id
            )
            
            provider = cls.get_provider(transaction.provider.name)
            if not provider:
                return PaymentResult(
                    success=False,
                    message="Payment provider not available"
                )
            
            # Verify with provider
            result = provider.verify_payment(transaction.external_transaction_id)
            
            # Update transaction status
            if result.success:
                transaction.mark_completed(
                    external_id=result.external_id,
                    provider_data=result.data
                )
                
                # Update order status
                order = transaction.order
                if order.status == 'pending':
                    order.status = 'confirmed'
                    order.save()
            else:
                transaction.mark_failed(
                    reason=result.message,
                    provider_data=result.data
                )
            
            return result
            
        except PaymentTransaction.DoesNotExist:
            return PaymentResult(
                success=False,
                message="Transaction not found"
            )
        except Exception as e:
            return PaymentResult(
                success=False,
                message=f"Payment verification error: {str(e)}"
            )
    
    @classmethod
    def process_webhook(
        cls,
        provider_name: str,
        transaction_id: str,
        webhook_data: Dict[str, Any]
    ) -> PaymentResult:
        """Process payment webhook"""
        try:
            transaction = PaymentTransaction.objects.get(
                transaction_id=transaction_id
            )
            
            provider = cls.get_provider(provider_name)
            if not provider:
                return PaymentResult(
                    success=False,
                    message="Payment provider not available"
                )
            
            # Process webhook
            result = provider.process_webhook(webhook_data)
            
            # Update transaction
            transaction.webhook_data = webhook_data
            
            if result.success:
                transaction.mark_completed(
                    external_id=result.external_id,
                    provider_data=result.data
                )
                
                # Update order status
                order = transaction.order
                if order.status == 'pending':
                    order.status = 'confirmed'
                    order.save()
            else:
                transaction.mark_failed(
                    reason=result.message,
                    provider_data=result.data
                )
            
            return result
            
        except PaymentTransaction.DoesNotExist:
            return PaymentResult(
                success=False,
                message="Transaction not found"
            )
        except Exception as e:
            return PaymentResult(
                success=False,
                message=f"Webhook processing error: {str(e)}"
            )
    
    @classmethod
    def refund_payment(
        cls,
        transaction_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None
    ) -> PaymentResult:
        """Refund a payment"""
        try:
            transaction = PaymentTransaction.objects.get(
                transaction_id=transaction_id,
                status='completed'
            )
            
            provider = cls.get_provider(transaction.provider.name)
            if not provider:
                return PaymentResult(
                    success=False,
                    message="Payment provider not available"
                )
            
            # Process refund
            result = provider.refund_payment(
                external_transaction_id=transaction.external_transaction_id,
                amount=amount,
                reason=reason
            )
            
            # Update transaction if refund successful
            if result.success:
                transaction.status = 'refunded'
                transaction.provider_data.update(result.data)
                transaction.save()
                
                # Update order status
                order = transaction.order
                order.status = 'refunded'
                order.save()
            
            return result
            
        except PaymentTransaction.DoesNotExist:
            return PaymentResult(
                success=False,
                message="Transaction not found or not completed"
            )
        except Exception as e:
            return PaymentResult(
                success=False,
                message=f"Refund error: {str(e)}"
            )
