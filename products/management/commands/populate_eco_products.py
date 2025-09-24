from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import SMEVendor, ProductCategory, Product
from decimal import Decimal
import uuid

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate the database with sample eco-friendly products'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing products before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing products...')
            Product.objects.all().delete()
            ProductCategory.objects.all().delete()
            SMEVendor.objects.all().delete()

        # Create sample SME vendors
        self.stdout.write('Creating SME vendors...')
        vendors_data = [
            {
                'business_name': 'EcoLife Kenya',
                'description': 'Sustainable living products for modern Kenya',
                'business_type': 'limited_company',
                'county': 'Nairobi',
                'contact_phone': '+254712345678',
                'contact_email': 'info@ecolife.ke',
                'address': 'Westlands, Nairobi',
                'is_verified': True,
                'is_active': True,
            },
            {
                'business_name': 'Green Solutions Ltd',
                'description': 'Innovative eco-friendly solutions for businesses',
                'business_type': 'limited_company',
                'county': 'Mombasa',
                'contact_phone': '+254723456789',
                'contact_email': 'contact@greensolutions.co.ke',
                'address': 'Nyali, Mombasa',
                'is_verified': True,
                'is_active': True,
            },
            {
                'business_name': 'Bamboo Crafts Co.',
                'description': 'Handcrafted bamboo products from local artisans',
                'business_type': 'cooperative',
                'county': 'Kisumu',
                'contact_phone': '+254734567890',
                'contact_email': 'orders@bamboocrafts.ke',
                'address': 'Kondele, Kisumu',
                'is_verified': True,
                'is_active': True,
            },
        ]

        vendors = []
        for vendor_data in vendors_data:
            # Create user using raw SQL to include user_type
            from django.db import connection
            cursor = connection.cursor()

            # Check if user exists
            cursor.execute("SELECT id FROM authentication_user WHERE email = %s", [vendor_data['contact_email']])
            user_row = cursor.fetchone()

            if user_row:
                user = User.objects.get(id=user_row[0])
                created = False
            else:
                # Create user with raw SQL
                cursor.execute("""
                    INSERT INTO authentication_user
                    (username, first_name, email, is_active, county, employment_status,
                     preferred_language, receive_sms_notifications, receive_email_notifications,
                     is_verified, date_joined, last_activity, user_type, password, is_superuser,
                     last_name, is_staff)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), %s, %s, %s, %s, %s)
                    RETURNING id
                """, [
                    vendor_data['contact_email'].split('@')[0],  # username
                    vendor_data['business_name'].split()[0],  # first_name
                    vendor_data['contact_email'],  # email
                    True,  # is_active
                    vendor_data['county'],  # county
                    'self_employed',  # employment_status
                    'en',  # preferred_language
                    True,  # receive_sms_notifications
                    True,  # receive_email_notifications
                    False,  # is_verified
                    'sme',  # user_type
                    '',  # password (empty for now)
                    False,  # is_superuser
                    '',  # last_name
                    False,  # is_staff
                ])
                user_id = cursor.fetchone()[0]
                user = User.objects.get(id=user_id)
                created = True

            vendor, vendor_created = SMEVendor.objects.get_or_create(
                owner=user,
                defaults=vendor_data
            )
            vendors.append(vendor)
            if vendor_created:
                self.stdout.write(f'Created vendor: {vendor.business_name}')

        # Create product categories
        self.stdout.write('Creating product categories...')
        categories_data = [
            {'name': 'Eco Products', 'description': 'General eco-friendly products'},
            {'name': 'Stationery', 'description': 'Sustainable office and school supplies'},
            {'name': 'Electronics', 'description': 'Energy-efficient and solar-powered devices'},
            {'name': 'Personal Care', 'description': 'Natural and biodegradable personal care items'},
            {'name': 'Home & Garden', 'description': 'Sustainable home and gardening products'},
            {'name': 'Fashion', 'description': 'Eco-friendly clothing and accessories'},
            {'name': 'Food & Beverages', 'description': 'Organic and sustainable food products'},
        ]

        categories = []
        for cat_data in categories_data:
            # Generate slug from name
            slug = cat_data['name'].lower().replace(' ', '-').replace('&', 'and')
            category, created = ProductCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    **cat_data,
                    'slug': slug,
                    'is_active': True,
                }
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Create sample products
        self.stdout.write('Creating sample products...')
        products_data = [
            {
                'name': 'Eco-Friendly Water Bottle',
                'description': 'Reusable water bottle made from recycled materials. BPA-free and dishwasher safe.',
                'short_description': 'Reusable water bottle made from recycled materials',
                'price': Decimal('25.00'),
                'credit_price': Decimal('50.00'),
                'stock_quantity': 100,
                'category': 'Eco Products',
                'vendor': 'EcoLife Kenya',
                'eco_friendly_features': ['Recycled Materials', 'BPA-Free', 'Reusable'],
                'materials': 'Recycled Plastic',
                'recyclable': True,
                'biodegradable': False,
                'carbon_footprint_kg': Decimal('0.5'),
                'is_featured': True,
            },
            {
                'name': 'Recycled Paper Notebook',
                'description': 'Notebook made from 100% recycled paper with eco-friendly binding.',
                'short_description': 'Notebook made from 100% recycled paper',
                'price': Decimal('15.00'),
                'credit_price': Decimal('30.00'),
                'stock_quantity': 200,
                'category': 'Stationery',
                'vendor': 'Green Solutions Ltd',
                'eco_friendly_features': ['100% Recycled Paper', 'Eco-Friendly Binding'],
                'materials': 'Recycled Paper',
                'recyclable': True,
                'biodegradable': True,
                'carbon_footprint_kg': Decimal('0.2'),
                'is_featured': True,
            },
            {
                'name': 'Solar Power Bank',
                'description': 'Portable solar-powered charging device with 10,000mAh capacity.',
                'short_description': 'Portable solar-powered charging device',
                'price': Decimal('45.00'),
                'credit_price': Decimal('90.00'),
                'stock_quantity': 50,
                'category': 'Electronics',
                'vendor': 'Green Solutions Ltd',
                'eco_friendly_features': ['Solar Powered', 'Energy Efficient'],
                'materials': 'Recycled Plastic, Solar Cells',
                'recyclable': True,
                'biodegradable': False,
                'carbon_footprint_kg': Decimal('1.2'),
                'is_featured': True,
            },
            {
                'name': 'Bamboo Toothbrush Set',
                'description': 'Set of 4 biodegradable bamboo toothbrushes with soft bristles.',
                'short_description': 'Set of 4 biodegradable bamboo toothbrushes',
                'price': Decimal('12.00'),
                'credit_price': Decimal('25.00'),
                'stock_quantity': 150,
                'category': 'Personal Care',
                'vendor': 'Bamboo Crafts Co.',
                'eco_friendly_features': ['Biodegradable', 'Sustainable Bamboo'],
                'materials': 'Bamboo, Natural Bristles',
                'recyclable': False,
                'biodegradable': True,
                'carbon_footprint_kg': Decimal('0.1'),
                'is_featured': False,
            },
            {
                'name': 'Organic Cotton Tote Bag',
                'description': 'Durable tote bag made from 100% organic cotton. Perfect for shopping.',
                'short_description': 'Durable tote bag made from 100% organic cotton',
                'price': Decimal('18.00'),
                'credit_price': Decimal('35.00'),
                'stock_quantity': 80,
                'category': 'Fashion',
                'vendor': 'EcoLife Kenya',
                'eco_friendly_features': ['Organic Cotton', 'Reusable', 'Durable'],
                'materials': 'Organic Cotton',
                'recyclable': True,
                'biodegradable': True,
                'carbon_footprint_kg': Decimal('0.3'),
                'is_featured': False,
            },
            {
                'name': 'LED Solar Garden Light',
                'description': 'Solar-powered LED garden light with automatic on/off sensor.',
                'short_description': 'Solar-powered LED garden light',
                'price': Decimal('35.00'),
                'credit_price': Decimal('70.00'),
                'stock_quantity': 60,
                'category': 'Home & Garden',
                'vendor': 'Green Solutions Ltd',
                'eco_friendly_features': ['Solar Powered', 'LED Technology', 'Weather Resistant'],
                'materials': 'Recycled Plastic, LED, Solar Panel',
                'recyclable': True,
                'biodegradable': False,
                'carbon_footprint_kg': Decimal('0.8'),
                'is_featured': False,
            },
        ]

        for product_data in products_data:
            # Find the category and vendor
            category = next(c for c in categories if c.name == product_data['category'])
            vendor = next(v for v in vendors if v.business_name == product_data['vendor'])
            
            # Remove category and vendor from product_data
            product_data.pop('category')
            product_data.pop('vendor')
            
            # Generate slug
            slug = product_data['name'].lower().replace(' ', '-').replace('&', 'and')
            
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                vendor=vendor,
                defaults={
                    **product_data,
                    'slug': slug,
                    'category': category,
                    'sku': f'ECO-{uuid.uuid4().hex[:8].upper()}',
                    'is_active': True,
                }
            )
            
            if created:
                self.stdout.write(f'Created product: {product.name}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully populated database with {len(vendors)} vendors, '
                f'{len(categories)} categories, and {len(products_data)} products'
            )
        )
