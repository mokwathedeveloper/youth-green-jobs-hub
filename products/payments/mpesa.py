"""
M-Pesa payment provider implementation
"""
import requests
import base64
import json
from datetime import datetime
from typing import Dict, Any, Optional
from decimal import Decimal
from django.conf import settings
from django.utils import timezone

from .base import BasePaymentProvider, PaymentResult


class MpesaProvider(BasePaymentProvider):
    """M-Pesa STK Push payment provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.consumer_key = config.get('consumer_key')
        self.consumer_secret = config.get('consumer_secret')
        self.business_short_code = config.get('business_short_code')
        self.passkey = config.get('passkey')
        self.callback_url = config.get('callback_url')
        
        # API URLs
        if self.is_sandbox:
            self.base_url = 'https://sandbox.safaricom.co.ke'
        else:
            self.base_url = 'https://api.safaricom.co.ke'
    
    @property
    def provider_name(self) -> str:
        return 'mpesa'
    
    def get_access_token(self) -> Optional[str]:
        """Get OAuth access token from M-Pesa API"""
        try:
            url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
            
            # Create basic auth header
            credentials = f"{self.consumer_key}:{self.consumer_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded_credentials}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            return data.get('access_token')
            
        except Exception as e:
            return None
    
    def generate_password(self) -> tuple[str, str]:
        """Generate password and timestamp for STK push"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password_string = f"{self.business_short_code}{self.passkey}{timestamp}"
        password = base64.b64encode(password_string.encode()).decode()
        return password, timestamp
    
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
        """Initiate M-Pesa STK Push payment"""
        try:
            access_token = self.get_access_token()
            if not access_token:
                return PaymentResult(
                    success=False,
                    message="Failed to get M-Pesa access token"
                )
            
            # Format phone number
            phone = self.format_phone_number(customer_phone)
            
            # Generate password and timestamp
            password, timestamp = self.generate_password()
            
            # Prepare STK push request
            url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'BusinessShortCode': self.business_short_code,
                'Password': password,
                'Timestamp': timestamp,
                'TransactionType': 'CustomerPayBillOnline',
                'Amount': int(amount),  # M-Pesa expects integer
                'PartyA': phone,
                'PartyB': self.business_short_code,
                'PhoneNumber': phone,
                'CallBackURL': callback_url,
                'AccountReference': order_id,
                'TransactionDesc': f'Payment for order {order_id}'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('ResponseCode') == '0':
                return PaymentResult(
                    success=True,
                    external_id=data.get('CheckoutRequestID'),
                    message=data.get('ResponseDescription', 'Payment initiated successfully'),
                    data=data
                )
            else:
                return PaymentResult(
                    success=False,
                    message=data.get('ResponseDescription', 'Payment initiation failed'),
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
        """Verify M-Pesa payment status"""
        try:
            access_token = self.get_access_token()
            if not access_token:
                return PaymentResult(
                    success=False,
                    message="Failed to get M-Pesa access token"
                )
            
            # Generate password and timestamp
            password, timestamp = self.generate_password()
            
            url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'BusinessShortCode': self.business_short_code,
                'Password': password,
                'Timestamp': timestamp,
                'CheckoutRequestID': external_transaction_id
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('ResponseCode') == '0':
                result_code = data.get('ResultCode')
                if result_code == '0':
                    return PaymentResult(
                        success=True,
                        external_id=external_transaction_id,
                        message='Payment completed successfully',
                        data=data
                    )
                else:
                    return PaymentResult(
                        success=False,
                        message=data.get('ResultDesc', 'Payment failed'),
                        data=data
                    )
            else:
                return PaymentResult(
                    success=False,
                    message=data.get('ResponseDescription', 'Payment verification failed'),
                    data=data
                )
                
        except Exception as e:
            return PaymentResult(
                success=False,
                message=f"Payment verification error: {str(e)}"
            )
    
    def process_webhook(self, webhook_data: Dict[str, Any]) -> PaymentResult:
        """Process M-Pesa callback webhook"""
        try:
            body = webhook_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            
            result_code = stk_callback.get('ResultCode')
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            
            if result_code == 0:
                # Payment successful
                callback_metadata = stk_callback.get('CallbackMetadata', {})
                items = callback_metadata.get('Item', [])
                
                # Extract payment details
                payment_data = {}
                for item in items:
                    name = item.get('Name')
                    value = item.get('Value')
                    if name:
                        payment_data[name] = value
                
                return PaymentResult(
                    success=True,
                    external_id=checkout_request_id,
                    message='Payment completed successfully',
                    data={
                        'mpesa_receipt_number': payment_data.get('MpesaReceiptNumber'),
                        'transaction_date': payment_data.get('TransactionDate'),
                        'phone_number': payment_data.get('PhoneNumber'),
                        'amount': payment_data.get('Amount'),
                        'raw_callback': webhook_data
                    }
                )
            else:
                # Payment failed
                return PaymentResult(
                    success=False,
                    external_id=checkout_request_id,
                    message=stk_callback.get('ResultDesc', 'Payment failed'),
                    data={'raw_callback': webhook_data}
                )
                
        except Exception as e:
            return PaymentResult(
                success=False,
                message=f"Webhook processing error: {str(e)}",
                data={'raw_callback': webhook_data}
            )
    
    def refund_payment(
        self,
        external_transaction_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None
    ) -> PaymentResult:
        """M-Pesa refund (reversal) - Note: Limited availability"""
        # M-Pesa reversals are complex and require special permissions
        # This is a placeholder implementation
        return PaymentResult(
            success=False,
            message="M-Pesa refunds require manual processing through Safaricom"
        )
