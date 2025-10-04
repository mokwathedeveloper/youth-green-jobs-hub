from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import SMEVendor, ProductCategory, Product
from decimal import Decimal
import uuid

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate the database with sample products, vendors, and categories'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to populate products...'))

        # Create sample users for vendors
        users = []
        for i in range(1, 6):
            user, created = User.objects.get_or_create(
                username=f'vendor{i}',
                defaults={
                    'email': f'vendor{i}@example.com',
                    'first_name': f'Vendor{i}',
                    'last_name': 'User',
                    'user_type': 'sme',
                    'is_active': True,
                }
            )
            users.append(user)
            if created:
                self.stdout.write(f'Created user: {user.username}')

        # Create product categories
        categories_data = [
            {'name': 'Eco Products', 'description': 'Environmentally friendly products'},
            {'name': 'Stationery', 'description': 'Office and school supplies'},
            {'name': 'Electronics', 'description': 'Electronic devices and accessories'},
            {'name': 'Personal Care', 'description': 'Personal hygiene and care products'},
            {'name': 'Home & Garden', 'description': 'Home improvement and gardening items'},
        ]

        categories = []
        for cat_data in categories_data:
            category, created = ProductCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'slug': cat_data['name'].lower().replace(' ', '-').replace('&', 'and'),
                }
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Create SME vendors
        vendors_data = [
            {
                'business_name': 'Green Solutions Kenya',
                'business_type': 'limited_company',
                'description': 'Leading provider of eco-friendly products in Kenya',
                'county': 'Kisumu',
                'contact_phone': '+254700123456',
                'contact_email': 'info@greensolutions.ke',
                'address': 'Kisumu CBD, Kenya',
            },
            {
                'business_name': 'EcoTech Innovations',
                'business_type': 'partnership',
                'description': 'Technology solutions for environmental sustainability',
                'county': 'Nairobi',
                'contact_phone': '+254700234567',
                'contact_email': 'info@ecotech.ke',
                'address': 'Nairobi CBD, Kenya',
            },
            {
                'business_name': 'Sustainable Living Co.',
                'business_type': 'sole_proprietorship',
                'description': 'Promoting sustainable lifestyle through quality products',
                'county': 'Mombasa',
                'contact_phone': '+254700345678',
                'contact_email': 'info@sustainableliving.ke',
                'address': 'Mombasa CBD, Kenya',
            },
            {
                'business_name': 'Nature\'s Best',
                'business_type': 'cooperative',
                'description': 'Natural and organic products for healthy living',
                'county': 'Nakuru',
                'contact_phone': '+254700456789',
                'contact_email': 'info@naturesbest.ke',
                'address': 'Nakuru CBD, Kenya',
            },
            {
                'business_name': 'Clean Energy Solutions',
                'business_type': 'limited_company',
                'description': 'Renewable energy products and solutions',
                'county': 'Eldoret',
                'contact_phone': '+254700567890',
                'contact_email': 'info@cleanenergy.ke',
                'address': 'Eldoret CBD, Kenya',
            },
        ]

        vendors = []
        for i, vendor_data in enumerate(vendors_data):
            vendor, created = SMEVendor.objects.get_or_create(
                business_name=vendor_data['business_name'],
                defaults={
                    'owner': users[i],
                    'business_type': vendor_data['business_type'],
                    'description': vendor_data['description'],
                    'county': vendor_data['county'],
                    'contact_phone': vendor_data['contact_phone'],
                    'contact_email': vendor_data['contact_email'],
                    'address': vendor_data['address'],
                    'is_verified': True,
                    'is_active': True,
                }
            )
            vendors.append(vendor)
            if created:
                self.stdout.write(f'Created vendor: {vendor.business_name}')

        # Create sample products
        products_data = [
            {
                'name': 'Eco-Friendly Water Bottle',
                'description': 'Reusable water bottle made from recycled materials. BPA-free and dishwasher safe.',
                'short_description': 'Reusable water bottle made from recycled materials',
                'price': Decimal('25.00'),
                'credit_price': Decimal('50.00'),
                'stock_quantity': 100,
                'category': 0,  # Eco Products
                'vendor': 0,
                'recyclable': True,
                'biodegradable': False,
                'eco_friendly_features': 'Made from 100% recycled plastic, BPA-free',
                'materials': 'Recycled plastic',
                'is_featured': True,
            },
            {
                'name': 'Recycled Paper Notebook',
                'description': 'High-quality notebook made from 100% recycled paper. Perfect for students and professionals.',
                'short_description': 'Notebook made from 100% recycled paper',
                'price': Decimal('15.00'),
                'credit_price': Decimal('30.00'),
                'stock_quantity': 200,
                'category': 1,  # Stationery
                'vendor': 1,
                'recyclable': True,
                'biodegradable': True,
                'eco_friendly_features': '100% recycled paper, soy-based ink',
                'materials': 'Recycled paper, soy ink',
                'is_featured': True,
            },
            {
                'name': 'Solar Power Bank',
                'description': 'Portable solar-powered charging device with 10,000mAh capacity. Charges via solar panel or USB.',
                'short_description': 'Portable solar-powered charging device',
                'price': Decimal('45.00'),
                'credit_price': Decimal('90.00'),
                'stock_quantity': 50,
                'category': 2,  # Electronics
                'vendor': 2,
                'recyclable': True,
                'biodegradable': False,
                'eco_friendly_features': 'Solar charging, energy efficient',
                'materials': 'Aluminum, solar cells, lithium battery',
                'is_featured': True,
            },
            {
                'name': 'Bamboo Toothbrush Set',
                'description': 'Set of 4 biodegradable bamboo toothbrushes with soft bristles. Plastic-free packaging.',
                'short_description': 'Set of 4 biodegradable bamboo toothbrushes',
                'price': Decimal('12.00'),
                'credit_price': Decimal('25.00'),
                'stock_quantity': 150,
                'category': 3,  # Personal Care
                'vendor': 3,
                'recyclable': False,
                'biodegradable': True,
                'eco_friendly_features': 'Biodegradable bamboo, plastic-free packaging',
                'materials': 'Bamboo, natural bristles',
                'is_featured': False,
            },
            {
                'name': 'Organic Compost Bin',
                'description': 'Compact compost bin perfect for home use. Made from recycled materials with easy-turn design.',
                'short_description': 'Compact compost bin for home use',
                'price': Decimal('35.00'),
                'credit_price': Decimal('70.00'),
                'stock_quantity': 75,
                'category': 4,  # Home & Garden
                'vendor': 4,
                'recyclable': True,
                'biodegradable': False,
                'eco_friendly_features': 'Made from recycled plastic, promotes composting',
                'materials': 'Recycled plastic',
                'is_featured': False,
            },
            {
                'name': 'LED Solar Garden Lights',
                'description': 'Set of 6 solar-powered LED garden lights. Automatic on/off with dusk sensor.',
                'short_description': 'Solar-powered LED garden lights',
                'price': Decimal('28.00'),
                'credit_price': Decimal('55.00'),
                'stock_quantity': 80,
                'category': 4,  # Home & Garden
                'vendor': 0,
                'recyclable': True,
                'biodegradable': False,
                'eco_friendly_features': 'Solar powered, energy efficient LED',
                'materials': 'Stainless steel, solar cells, LED',
                'is_featured': True,
            },
        ]

        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults={
                    'description': product_data['description'],
                    'short_description': product_data['short_description'],
                    'slug': product_data['name'].lower().replace(' ', '-').replace("'", ''),
                    'price': product_data['price'],
                    'credit_price': product_data['credit_price'],
                    'stock_quantity': product_data['stock_quantity'],
                    'category': categories[product_data['category']],
                    'vendor': vendors[product_data['vendor']],
                    'recyclable': product_data['recyclable'],
                    'biodegradable': product_data['biodegradable'],
                    'eco_friendly_features': product_data['eco_friendly_features'],
                    'materials': product_data['materials'],
                    'is_featured': product_data['is_featured'],
                    'is_active': True,
                    'sku': f'SKU{uuid.uuid4().hex[:8].upper()}',
                }
            )
            if created:
                self.stdout.write(f'Created product: {product.name}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully populated database with:\n'
                f'- {len(categories)} categories\n'
                f'- {len(vendors)} vendors\n'
                f'- {len(products_data)} products'
            )
        )
