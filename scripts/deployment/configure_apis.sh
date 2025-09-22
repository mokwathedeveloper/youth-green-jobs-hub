#!/bin/bash

# 🔧 Youth Green Jobs Hub - API Configuration Script
# This script helps you configure payment gateways and Google Maps API

echo "🔧 Youth Green Jobs Hub - API Configuration"
echo "============================================"

# Check if Heroku CLI is available
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first."
    exit 1
fi

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Not logged in to Heroku. Please run 'heroku login' first."
    exit 1
fi

echo "✅ Heroku CLI ready"
echo ""

# Get app name
read -p "Enter your Heroku app name (default: youth-green-jobs-api): " APP_NAME
APP_NAME=${APP_NAME:-youth-green-jobs-api}

echo "ℹ️  Configuring app: $APP_NAME"
echo ""

# Configuration menu
echo "🔧 What would you like to configure?"
echo "1. M-Pesa (Sandbox for testing)"
echo "2. M-Pesa (Production)"
echo "3. Paystack (Test mode)"
echo "4. Paystack (Live mode)"
echo "5. Google Maps API"
echo "6. All APIs (Sandbox/Test mode)"
echo "7. View current configuration"
echo ""

read -p "Choose option (1-7): " OPTION

case $OPTION in
    1)
        echo "🇰🇪 Configuring M-Pesa Sandbox..."
        echo ""
        echo "📋 You need M-Pesa sandbox credentials from https://developer.safaricom.co.ke/"
        echo ""
        
        read -p "Enter M-Pesa Consumer Key: " MPESA_KEY
        read -p "Enter M-Pesa Consumer Secret: " MPESA_SECRET
        read -p "Enter Business Short Code (default: 174379): " SHORT_CODE
        SHORT_CODE=${SHORT_CODE:-174379}
        read -p "Enter Passkey (default: sandbox passkey): " PASSKEY
        PASSKEY=${PASSKEY:-bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919}
        
        heroku config:set MPESA_CONSUMER_KEY="$MPESA_KEY" -a $APP_NAME
        heroku config:set MPESA_CONSUMER_SECRET="$MPESA_SECRET" -a $APP_NAME
        heroku config:set MPESA_BUSINESS_SHORT_CODE="$SHORT_CODE" -a $APP_NAME
        heroku config:set MPESA_PASSKEY="$PASSKEY" -a $APP_NAME
        heroku config:set MPESA_SANDBOX="True" -a $APP_NAME
        
        echo "✅ M-Pesa Sandbox configured!"
        ;;
        
    2)
        echo "🇰🇪 Configuring M-Pesa Production..."
        echo ""
        echo "📋 You need M-Pesa production credentials from Safaricom"
        echo ""
        
        read -p "Enter M-Pesa Consumer Key: " MPESA_KEY
        read -p "Enter M-Pesa Consumer Secret: " MPESA_SECRET
        read -p "Enter Business Short Code: " SHORT_CODE
        read -p "Enter Passkey: " PASSKEY
        
        heroku config:set MPESA_CONSUMER_KEY="$MPESA_KEY" -a $APP_NAME
        heroku config:set MPESA_CONSUMER_SECRET="$MPESA_SECRET" -a $APP_NAME
        heroku config:set MPESA_BUSINESS_SHORT_CODE="$SHORT_CODE" -a $APP_NAME
        heroku config:set MPESA_PASSKEY="$PASSKEY" -a $APP_NAME
        heroku config:set MPESA_SANDBOX="False" -a $APP_NAME
        
        echo "✅ M-Pesa Production configured!"
        ;;
        
    3)
        echo "💳 Configuring Paystack Test Mode..."
        echo ""
        echo "📋 You need Paystack test API keys from https://paystack.com/"
        echo ""
        
        read -p "Enter Paystack Test Public Key (pk_test_...): " PAYSTACK_PUBLIC
        read -p "Enter Paystack Test Secret Key (sk_test_...): " PAYSTACK_SECRET
        
        heroku config:set PAYSTACK_PUBLIC_KEY="$PAYSTACK_PUBLIC" -a $APP_NAME
        heroku config:set PAYSTACK_SECRET_KEY="$PAYSTACK_SECRET" -a $APP_NAME
        heroku config:set PAYSTACK_SANDBOX="True" -a $APP_NAME
        
        echo "✅ Paystack Test Mode configured!"
        ;;
        
    4)
        echo "💳 Configuring Paystack Live Mode..."
        echo ""
        echo "📋 You need Paystack live API keys from https://paystack.com/"
        echo ""
        
        read -p "Enter Paystack Live Public Key (pk_live_...): " PAYSTACK_PUBLIC
        read -p "Enter Paystack Live Secret Key (sk_live_...): " PAYSTACK_SECRET
        
        heroku config:set PAYSTACK_PUBLIC_KEY="$PAYSTACK_PUBLIC" -a $APP_NAME
        heroku config:set PAYSTACK_SECRET_KEY="$PAYSTACK_SECRET" -a $APP_NAME
        heroku config:set PAYSTACK_SANDBOX="False" -a $APP_NAME
        
        echo "✅ Paystack Live Mode configured!"
        ;;
        
    5)
        echo "🗺️ Configuring Google Maps API..."
        echo ""
        echo "📋 You need Google Maps API keys from https://console.cloud.google.com/"
        echo ""
        
        read -p "Enter Google Maps API Key (server-side): " MAPS_API_KEY
        read -p "Enter Google Maps JavaScript API Key (frontend): " MAPS_JS_KEY
        
        heroku config:set GOOGLE_MAPS_API_KEY="$MAPS_API_KEY" -a $APP_NAME
        heroku config:set GOOGLE_MAPS_JS_API_KEY="$MAPS_JS_KEY" -a $APP_NAME
        
        echo "✅ Google Maps API configured!"
        ;;
        
    6)
        echo "🚀 Configuring All APIs (Test/Sandbox Mode)..."
        echo ""
        echo "This will configure M-Pesa Sandbox, Paystack Test, and Google Maps"
        echo ""
        
        # M-Pesa Sandbox
        echo "🇰🇪 M-Pesa Sandbox Configuration:"
        read -p "Enter M-Pesa Consumer Key: " MPESA_KEY
        read -p "Enter M-Pesa Consumer Secret: " MPESA_SECRET
        
        heroku config:set MPESA_CONSUMER_KEY="$MPESA_KEY" -a $APP_NAME
        heroku config:set MPESA_CONSUMER_SECRET="$MPESA_SECRET" -a $APP_NAME
        heroku config:set MPESA_BUSINESS_SHORT_CODE="174379" -a $APP_NAME
        heroku config:set MPESA_PASSKEY="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" -a $APP_NAME
        heroku config:set MPESA_SANDBOX="True" -a $APP_NAME
        
        echo ""
        
        # Paystack Test
        echo "💳 Paystack Test Configuration:"
        read -p "Enter Paystack Test Public Key: " PAYSTACK_PUBLIC
        read -p "Enter Paystack Test Secret Key: " PAYSTACK_SECRET
        
        heroku config:set PAYSTACK_PUBLIC_KEY="$PAYSTACK_PUBLIC" -a $APP_NAME
        heroku config:set PAYSTACK_SECRET_KEY="$PAYSTACK_SECRET" -a $APP_NAME
        heroku config:set PAYSTACK_SANDBOX="True" -a $APP_NAME
        
        echo ""
        
        # Google Maps
        echo "🗺️ Google Maps Configuration:"
        read -p "Enter Google Maps API Key: " MAPS_API_KEY
        read -p "Enter Google Maps JavaScript API Key: " MAPS_JS_KEY
        
        heroku config:set GOOGLE_MAPS_API_KEY="$MAPS_API_KEY" -a $APP_NAME
        heroku config:set GOOGLE_MAPS_JS_API_KEY="$MAPS_JS_KEY" -a $APP_NAME
        
        echo "✅ All APIs configured in test/sandbox mode!"
        ;;
        
    7)
        echo "📋 Current Configuration for $APP_NAME:"
        echo ""
        heroku config -a $APP_NAME | grep -E "(MPESA|PAYSTACK|GOOGLE_MAPS)"
        ;;
        
    *)
        echo "❌ Invalid option. Please choose 1-7."
        exit 1
        ;;
esac

echo ""
echo "🎯 Configuration complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test your payment gateways"
echo "2. Test Google Maps integration"
echo "3. Deploy your frontend to Vercel"
echo ""
echo "📖 For detailed setup guides, see:"
echo "   - PAYMENT_GATEWAY_SETUP.md"
echo "   - COMPLETE_DEPLOYMENT_CHECKLIST.md"
echo ""
echo "🚀 Your Youth Green Jobs Hub is ready!"
