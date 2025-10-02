# Production Checklist

This checklist outlines the necessary steps to configure the application for a production environment.

## 1. Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables:

```
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
CSRF_TRUSTED_ORIGINS=https://your-domain.com,https://www.your-domain.com
DATABASE_URL=postgres://user:password@host:port/dbname
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_SSL_REDIRECT=True
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_BUSINESS_SHORT_CODE=your-mpesa-business-short-code
MPESA_PASSKEY=your-mpesa-passkey
MPESA_CALLBACK_URL=https://your-domain.com/mpesa-callback/
MPESA_SANDBOX=False
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_SANDBOX=False
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GOOGLE_MAPS_JS_API_KEY=your-google-maps-js-api-key
```

## 2. Database

Ensure that you are using a production-ready database like PostgreSQL. The `DATABASE_URL` environment variable should be set to the connection string of your database.

## 3. Static Files

Run the following command to collect static files:

```
python manage.py collectstatic
```

## 4. Gunicorn

Use a production-ready web server like Gunicorn to run the application.

```
gunicorn youth_green_jobs_backend.wsgi:application
```

## 5. HTTPS

Configure your web server to use HTTPS. Make sure that you have a valid SSL certificate.
