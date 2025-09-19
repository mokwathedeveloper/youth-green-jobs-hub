"""
Management command to set up default payment providers
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from decimal import Decimal
from products.models import PaymentProvider


class Command(BaseCommand):
    help = 'Set up default payment providers'

    def handle(self, *args, **options):
        self.stdout.write('Setting up payment providers...')

        # M-Pesa Provider
        mpesa_config = {
            'consumer_key': getattr(settings, 'MPESA_CONSUMER_KEY', ''),
            'consumer_secret': getattr(settings, 'MPESA_CONSUMER_SECRET', ''),
            'business_short_code': getattr(settings, 'MPESA_BUSINESS_SHORT_CODE', '174379'),
            'passkey': getattr(settings, 'MPESA_PASSKEY', ''),
            'callback_url': getattr(settings, 'MPESA_CALLBACK_URL', ''),
            'is_sandbox': getattr(settings, 'MPESA_SANDBOX', True),
        }

        mpesa_provider, created = PaymentProvider.objects.get_or_create(
            name='mpesa',
            defaults={
                'display_name': 'M-Pesa',
                'is_active': True,
                'is_sandbox': mpesa_config['is_sandbox'],
                'configuration': mpesa_config,
                'supported_currencies': 'KES',
                'transaction_fee_percentage': Decimal('0.00'),  # M-Pesa charges are usually on customer
                'fixed_fee': Decimal('0.00'),
                'min_amount': Decimal('1.00'),
                'max_amount': Decimal('150000.00'),  # M-Pesa daily limit
            }
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS('✓ Created M-Pesa payment provider')
            )
        else:
            # Update configuration
            mpesa_provider.configuration = mpesa_config
            mpesa_provider.is_sandbox = mpesa_config['is_sandbox']
            mpesa_provider.save()
            self.stdout.write(
                self.style.SUCCESS('✓ Updated M-Pesa payment provider')
            )

        # Paystack Provider
        paystack_config = {
            'public_key': getattr(settings, 'PAYSTACK_PUBLIC_KEY', ''),
            'secret_key': getattr(settings, 'PAYSTACK_SECRET_KEY', ''),
            'is_sandbox': getattr(settings, 'PAYSTACK_SANDBOX', True),
        }

        paystack_provider, created = PaymentProvider.objects.get_or_create(
            name='paystack',
            defaults={
                'display_name': 'Paystack',
                'is_active': True,
                'is_sandbox': paystack_config['is_sandbox'],
                'configuration': paystack_config,
                'supported_currencies': 'KES,USD,GHS,NGN,ZAR',
                'transaction_fee_percentage': Decimal('3.90'),  # Paystack fee
                'fixed_fee': Decimal('0.00'),
                'min_amount': Decimal('1.00'),
                'max_amount': Decimal('1000000.00'),
            }
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS('✓ Created Paystack payment provider')
            )
        else:
            # Update configuration
            paystack_provider.configuration = paystack_config
            paystack_provider.is_sandbox = paystack_config['is_sandbox']
            paystack_provider.save()
            self.stdout.write(
                self.style.SUCCESS('✓ Updated Paystack payment provider')
            )

        # Bank Transfer Provider (manual)
        bank_transfer_provider, created = PaymentProvider.objects.get_or_create(
            name='bank_transfer',
            defaults={
                'display_name': 'Bank Transfer',
                'is_active': True,
                'is_sandbox': False,
                'configuration': {
                    'bank_name': 'Your Bank Name',
                    'account_number': 'Your Account Number',
                    'account_name': 'Your Account Name',
                    'swift_code': 'SWIFT CODE',
                },
                'supported_currencies': 'KES,USD',
                'transaction_fee_percentage': Decimal('0.00'),
                'fixed_fee': Decimal('0.00'),
                'min_amount': Decimal('100.00'),
                'max_amount': Decimal('10000000.00'),
            }
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS('✓ Created Bank Transfer payment provider')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('✓ Bank Transfer payment provider already exists')
            )

        # Cash on Delivery Provider
        cod_provider, created = PaymentProvider.objects.get_or_create(
            name='cash_on_delivery',
            defaults={
                'display_name': 'Cash on Delivery',
                'is_active': True,
                'is_sandbox': False,
                'configuration': {},
                'supported_currencies': 'KES',
                'transaction_fee_percentage': Decimal('0.00'),
                'fixed_fee': Decimal('0.00'),
                'min_amount': Decimal('1.00'),
                'max_amount': Decimal('50000.00'),
            }
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS('✓ Created Cash on Delivery payment provider')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('✓ Cash on Delivery payment provider already exists')
            )

        self.stdout.write(
            self.style.SUCCESS('\n🎉 Payment providers setup completed!')
        )
        self.stdout.write(
            'You can now configure payment credentials in your .env file and run this command again to update the providers.'
        )
