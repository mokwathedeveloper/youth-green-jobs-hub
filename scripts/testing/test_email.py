#!/usr/bin/env python3
"""
Email Configuration Test Script
Tests the Gmail SMTP configuration for Youth Green Jobs Hub
"""

import os
import sys
import django
from django.conf import settings
from django.core.mail import send_mail
from django.core.management.color import make_style

# Add the project directory to Python path
sys.path.append('/home/godfirst/Downloads/youth-green-jobs-hub')

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'youth_green_jobs_backend.settings')

# Setup Django
django.setup()

style = make_style()

def test_email_configuration():
    """Test email configuration"""
    print(style.SUCCESS("📧 Testing Email Configuration..."))
    print("=" * 60)
    
    try:
        # Get email settings
        email_host_user = settings.EMAIL_HOST_USER
        email_host = settings.EMAIL_HOST
        email_port = settings.EMAIL_PORT
        email_use_tls = settings.EMAIL_USE_TLS
        
        print(f"Email Host: {email_host}")
        print(f"Email Port: {email_port}")
        print(f"Email User: {email_host_user}")
        print(f"Use TLS: {email_use_tls}")
        
        # Check if credentials are set
        if not email_host_user or email_host_user == 'your-actual-email@gmail.com':
            print(style.ERROR("❌ EMAIL_HOST_USER not configured"))
            return False
            
        if not hasattr(settings, 'EMAIL_HOST_PASSWORD') or not settings.EMAIL_HOST_PASSWORD:
            print(style.ERROR("❌ EMAIL_HOST_PASSWORD not configured"))
            return False
            
        if settings.EMAIL_HOST_PASSWORD == 'your-16-character-app-password-here':
            print(style.ERROR("❌ EMAIL_HOST_PASSWORD still has placeholder value"))
            return False
        
        print(style.SUCCESS("✅ Email credentials configured"))
        
        # Test sending email
        print("\n" + style.SUCCESS("📤 Testing email sending..."))
        
        test_email = input("Enter email address to send test email to (or press Enter to skip): ").strip()
        
        if test_email:
            try:
                send_mail(
                    subject='Youth Green Jobs Hub - Email Test',
                    message='This is a test email from Youth Green Jobs Hub. Your email configuration is working correctly!',
                    from_email=email_host_user,
                    recipient_list=[test_email],
                    fail_silently=False,
                )
                print(style.SUCCESS(f"✅ Test email sent successfully to {test_email}"))
                return True
            except Exception as e:
                print(style.ERROR(f"❌ Failed to send test email: {str(e)}"))
                return False
        else:
            print(style.SUCCESS("✅ Email configuration appears correct (skipped sending test)"))
            return True
            
    except Exception as e:
        print(style.ERROR(f"❌ Email configuration error: {str(e)}"))
        return False

def main():
    """Main test function"""
    print(style.SUCCESS("🌱 Youth Green Jobs Hub - Email Configuration Test"))
    print("=" * 60)
    
    success = test_email_configuration()
    
    print("\n" + "=" * 60)
    if success:
        print(style.SUCCESS("🎉 Email configuration test passed!"))
        print(style.SUCCESS("💡 Your app can now send emails for:"))
        print("   - User registration confirmations")
        print("   - Password reset emails")
        print("   - Notification emails")
        print("   - Admin notifications")
    else:
        print(style.ERROR("⚠️  Email configuration needs attention."))
        print(style.ERROR("💡 Please check:"))
        print("   1. Gmail App Password is correctly set")
        print("   2. 2-Factor Authentication is enabled on Gmail")
        print("   3. EMAIL_HOST_USER and EMAIL_HOST_PASSWORD are correct")

if __name__ == "__main__":
    main()
