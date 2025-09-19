"""
Paystack payment provider implementation
"""
import requests
import json
from typing import Dict, Any, Optional
from decimal import Decimal
from django.conf import settings

from .base import BasePaymentProvider, PaymentResult


class PaystackProvider(BasePaymentProvider):
    """Paystack payment provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.secret_key = config.get('secret_key')
        self.public_key = config.get('public_key')
        
        # API URLs
        if self.is_sandbox:
            self.base_url = 'https://api.paystack.co'
        else:
            self.base_url = 'https://api.paystack.co'
    
    @property
    def provider_name(self) -> str:
        return 'paystack'
    
    def get_headers(self) -> Dict[str, str]:
        """Get API headers with authorization"""
        return {
            'Authorization': f'Bearer {self.secret_key}',
            'Content-Type': 'application/json'
        }
    
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
        """Initialize Paystack transaction"""
        try:
            url = f"{self.base_url}/transaction/initialize"
            
            # Convert amount to kobo (smallest currency unit)
            amount_kobo = int(amount * 100)
            
            payload = {
                'email': customer_email,
                'amount': amount_kobo,
                'currency': currency.upper(),
                'reference': order_id,
                'callback_url': callback_url,
                'metadata': {
                    'order_id': order_id,
                    'customer_phone': customer_phone,
                    'custom_fields': [
                        {
                            'display_name': 'Order ID',
                            'variable_name': 'order_id',
                            'value': order_id
                        }
                    ]
                },
                'channels': ['card', 'bank', 'ussd', 'qr', 'mobile_money']
            }
            
            response = requests.post(
                url,
                json=payload,
                headers=self.get_headers(),
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status'):
                transaction_data = data.get('data', {})
                return PaymentResult(
                    success=True,
                    external_id=transaction_data.get('reference'),
                    message='Payment initialized successfully',
                    data={
                        'authorization_url': transaction_data.get('authorization_url'),
                        'access_code': transaction_data.get('access_code'),
                        'reference': transaction_data.get('reference'),
                        'raw_response': data
                    }
                )
            else:
                return PaymentResult(
                    success=False,
                    message=data.get('message', 'Payment initialization failed'),
                    data=data
                )
                
        except requests.RequestException as e:
            return PaymentResult(
                success=False,
                message=f"Network error: {str(e)}"
            )
        except Exception as e:
            return PaymentResult(
                success=False,
                message=f"Unexpected error: {str(e)}"
            )
    
    def verify_payment(self, external_transaction_id: str) -> PaymentResult:
        """Verify Paystack transaction"""
        try:
            url = f"{self.base_url}/transaction/verify/{external_transaction_id}"
            
            response = requests.get(
                url,
                headers=self.get_headers(),
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status'):
                transaction_data = data.get('data', {})
                status = transaction_data.get('status')
                
                if status == 'success':
                    return PaymentResult(
                        success=True,
                        external_id=external_transaction_id,
                        message='Payment completed successfully',
                        data={
                            'amount': transaction_data.get('amount', 0) / 100,  # Convert from kobo
                            'currency': transaction_data.get('currency'),
                            'paid_at': transaction_data.get('paid_at'),
                            'channel': transaction_data.get('channel'),
                            'reference': transaction_data.get('reference'),
                            'gateway_response': transaction_data.get('gateway_response'),
                            'raw_response': data
                        }
                    )
                else:
                    return PaymentResult(
                        success=False,
                        external_id=external_transaction_id,
                        message=f"Payment {status}",
                        data=data
                    )
            else:
                return PaymentResult(
                    success=False,
                    message=data.get('message', 'Payment verification failed'),
                    data=data
                )
                
        except requests.RequestException as e:
            return PaymentResult(
                success=False,
                message=f"Network error: {str(e)}"
            )
        except Exception as e:
            return PaymentResult(
                success=False,
                message=f"Verification error: {str(e)}"
            )
    
    def process_webhook(self, webhook_data: Dict[str, Any]) -> PaymentResult:
        """Process Paystack webhook"""
        try:
            event = webhook_data.get('event')
            data = webhook_data.get('data', {})
            
            if event == 'charge.success':
                return PaymentResult(
                    success=True,
                    external_id=data.get('reference'),
                    message='Payment completed successfully',
                    data={
                        'amount': data.get('amount', 0) / 100,  # Convert from kobo
                        'currency': data.get('currency'),
                        'paid_at': data.get('paid_at'),
                        'channel': data.get('channel'),
                        'reference': data.get('reference'),
                        'gateway_response': data.get('gateway_response'),
                        'customer': data.get('customer', {}),
                        'raw_webhook': webhook_data
                    }
                )
            elif event in ['charge.failed', 'charge.cancelled']:
                return PaymentResult(
                    success=False,
                    external_id=data.get('reference'),
                    message=f"Payment {event.split('.')[1]}",
                    data={'raw_webhook': webhook_data}
                )
            else:
                return PaymentResult(
                    success=False,
                    message=f"Unhandled webhook event: {event}",
                    data={'raw_webhook': webhook_data}
                )
                
        except Exception as e:
            return PaymentResult(
                success=False,
                message=f"Webhook processing error: {str(e)}",
                data={'raw_webhook': webhook_data}
            )
    
    def refund_payment(
        self,
        external_transaction_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None
    ) -> PaymentResult:
        """Refund Paystack transaction"""
        try:
            url = f"{self.base_url}/refund"
            
            payload = {
                'transaction': external_transaction_id,
            }
            
            if amount:
                # Convert to kobo
                payload['amount'] = int(amount * 100)
            
            if reason:
                payload['customer_note'] = reason
                payload['merchant_note'] = reason
            
            response = requests.post(
                url,
                json=payload,
                headers=self.get_headers(),
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status'):
                refund_data = data.get('data', {})
                return PaymentResult(
                    success=True,
                    external_id=refund_data.get('transaction', {}).get('reference'),
                    message='Refund processed successfully',
                    data={
                        'refund_id': refund_data.get('id'),
                        'amount': refund_data.get('amount', 0) / 100,
                        'currency': refund_data.get('currency'),
                        'status': refund_data.get('status'),
                        'raw_response': data
                    }
                )
            else:
                return PaymentResult(
                    success=False,
                    message=data.get('message', 'Refund failed'),
                    data=data
                )
                
        except requests.RequestException as e:
            return PaymentResult(
                success=False,
                message=f"Network error: {str(e)}"
            )
        except Exception as e:
            return PaymentResult(
                success=False,
                message=f"Refund error: {str(e)}"
            )
