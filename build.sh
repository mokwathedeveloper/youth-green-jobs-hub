#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Create PostGIS extension if it doesn't exist
python manage.py shell -c "
from django.db import connection
with connection.cursor() as cursor:
    try:
        cursor.execute('CREATE EXTENSION IF NOT EXISTS postgis;')
        print('PostGIS extension created successfully')
    except Exception as e:
        print(f'PostGIS extension error (might already exist): {e}')
"
