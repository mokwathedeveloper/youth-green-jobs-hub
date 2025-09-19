"""
Base payment provider interface
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from decimal import Decimal


class PaymentResult:
    """Result of a payment operation"""
    
    def __init__(
        self,
        success: bool,
        transaction_id: Optional[str] = None,
        external_id: Optional[str] = None,
        message: Optional[str] = None,
        data: Optional[Dict[str, Any]] = None
    ):
        self.success = success
        self.transaction_id = transaction_id
        self.external_id = external_id
        self.message = message
        self.data = data or {}


class BasePaymentProvider(ABC):
    """Base class for all payment providers"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.is_sandbox = config.get('is_sandbox', True)
    
    @abstractmethod
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
        """Initiate a payment transaction"""
        pass
    
    @abstractmethod
    def verify_payment(self, external_transaction_id: str) -> PaymentResult:
        """Verify payment status with provider"""
        pass
    
    @abstractmethod
    def process_webhook(self, webhook_data: Dict[str, Any]) -> PaymentResult:
        """Process webhook callback from provider"""
        pass
    
    @abstractmethod
    def refund_payment(
        self,
        external_transaction_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None
    ) -> PaymentResult:
        """Refund a payment"""
        pass
    
    def validate_amount(self, amount: Decimal, min_amount: Decimal, max_amount: Decimal) -> bool:
        """Validate transaction amount"""
        return min_amount <= amount <= max_amount
    
    def format_phone_number(self, phone: str, country_code: str = '254') -> str:
        """Format phone number for payment provider"""
        # Remove any non-digit characters
        phone = ''.join(filter(str.isdigit, phone))
        
        # Handle Kenyan phone numbers
        if phone.startswith('0'):
            phone = country_code + phone[1:]
        elif not phone.startswith(country_code):
            phone = country_code + phone
            
        return phone
    
    def get_callback_url(self, base_url: str, transaction_id: str) -> str:
        """Generate callback URL for transaction"""
        return f"{base_url}/api/v1/payments/webhook/{self.provider_name}/{transaction_id}/"
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Get provider name"""
        pass
