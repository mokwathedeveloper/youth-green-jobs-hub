#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Starting Youth Green Jobs Hub Build Process"

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create PostGIS extension if it doesn't exist
echo "🗄️ Setting up PostGIS extension..."
python manage.py shell -c "
from django.db import connection
with connection.cursor() as cursor:
    try:
        cursor.execute('CREATE EXTENSION IF NOT EXISTS postgis;')
        print('✅ PostGIS extension created successfully')
    except Exception as e:
        print(f'⚠️ PostGIS extension error (might already exist): {e}')
"

# Run migrations
echo "🔄 Running database migrations..."
echo "📋 Checking migration status..."
python manage.py showmigrations

echo "🔄 Running migrations with verbose output..."
python manage.py migrate --verbosity=2 || {
    echo "❌ Migration failed! Trying to create tables manually..."
    python manage.py migrate --run-syncdb --verbosity=2
}

echo "✅ Migration status after running migrations:"
python manage.py showmigrations

echo "🔍 Checking if authentication_user table exists..."
python manage.py shell -c "
from django.db import connection
cursor = connection.cursor()
try:
    cursor.execute(\"SELECT 1 FROM authentication_user LIMIT 1\")
    print('✅ authentication_user table exists')
except Exception as e:
    print(f'❌ authentication_user table missing: {e}')
    print('🔧 Attempting to create tables...')
    from django.core.management import execute_from_command_line
    execute_from_command_line(['manage.py', 'migrate', '--run-syncdb'])
"

# Create superuser if it doesn't exist
echo "👨‍💼 Creating superuser account..."
python manage.py shell -c "
from authentication.models import User
import os
print(f'🔍 Checking for existing admin user...')
admin_user = User.objects.filter(username='admin').first()
if admin_user:
    print(f'✅ Admin user exists: {admin_user.username} ({admin_user.email})')
    print(f'   Is staff: {admin_user.is_staff}')
    print(f'   Is superuser: {admin_user.is_superuser}')
    print(f'   Is active: {admin_user.is_active}')
else:
    print('🔧 Creating new admin user...')
    try:
        admin_user = User.objects.create_superuser(
            username='admin',
            email='moffatmokwa12@gmail.com',
            password='YouthGreenJobs2024!',
            first_name='Admin',
            last_name='User',
            phone_number='+254700000000',
            county='Nairobi',
            user_type='youth'
        )
        print(f'✅ Superuser created successfully: {admin_user.username}')
        print(f'   Email: {admin_user.email}')
        print(f'   Is staff: {admin_user.is_staff}')
        print(f'   Is superuser: {admin_user.is_superuser}')
    except Exception as e:
        print(f'❌ Superuser creation error: {e}')
        import traceback
        traceback.print_exc()
"

# Also try creating via management command as backup
echo "🔄 Backup superuser creation method..."
echo \"from authentication.models import User; User.objects.filter(username='admin').exists() and print('Admin exists') or User.objects.create_superuser('admin', 'moffatmokwa12@gmail.com', 'YouthGreenJobs2024!', first_name='Admin', last_name='User', phone_number='+254700000000', county='Nairobi', user_type='youth')\" | python manage.py shell || echo "Backup method failed"

# Create staticfiles directory if it doesn't exist
echo "📁 Preparing static files directory..."
mkdir -p staticfiles

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --no-input --clear

# Populate sample data
echo "🌱 Populating sample products data..."
echo "🔍 Checking current database state..."
python manage.py shell -c "
from products.models import Product, ProductCategory, SMEVendor
from authentication.models import User
print(f'Before population - Users: {User.objects.count()}, Products: {Product.objects.count()}, Categories: {ProductCategory.objects.count()}, Vendors: {SMEVendor.objects.count()}')
"

echo "🌱 Running populate_products command..."
python manage.py populate_products --verbosity=2 || {
    echo "⚠️ Sample data population failed, trying to clear and repopulate..."
    python manage.py shell -c "
from products.models import Product, ProductCategory, SMEVendor
print('🧹 Clearing existing product data...')
Product.objects.all().delete()
ProductCategory.objects.all().delete()
SMEVendor.objects.all().delete()
print('✅ Product data cleared')
"
    python manage.py populate_products --verbosity=2
}

# Verify database setup
echo "🧪 Verifying database setup..."
python manage.py shell -c "
from authentication.models import User
from products.models import Product, ProductCategory, SMEVendor
print(f'✅ Database working - Users: {User.objects.count()}')
print(f'✅ Products: {Product.objects.count()}')
print(f'✅ Categories: {ProductCategory.objects.count()}')
print(f'✅ Vendors: {SMEVendor.objects.count()}')
"

echo "🎉 Build completed successfully!"
echo "📊 Final verification - $(date)"
echo "🔗 API Endpoint: https://youth-green-jobs-hub.onrender.com/api/v1/products/products/"
