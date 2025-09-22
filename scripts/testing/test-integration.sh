#!/bin/bash

# Integration Test Script for Youth Green Jobs Hub
# Tests the communication between frontend and backend

echo "🚀 Starting Integration Tests for Youth Green Jobs Hub"
echo "============================================================"

# Configuration
BACKEND_URL="http://127.0.0.1:8000"
FRONTEND_URL="http://localhost:5173"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
BACKEND_HEALTH=0
FRONTEND_HEALTH=0
CORS_TEST=0
API_ENDPOINTS=0

echo ""
echo "🔍 Testing Backend Health..."

# Test Backend API Root
BACKEND_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/backend_response.json "$BACKEND_URL/api/v1/" 2>/dev/null)
BACKEND_STATUS="${BACKEND_RESPONSE: -3}"

if [ "$BACKEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Backend API Root: $BACKEND_STATUS OK${NC}"
    
    # Extract and display available endpoints
    if command -v jq &> /dev/null; then
        echo "📋 Available Endpoints:"
        jq -r '.endpoints | to_entries[] | "   - \(.key): \(.value)"' /tmp/backend_response.json 2>/dev/null || echo "   (Could not parse endpoints)"
    else
        echo "📋 Backend Response:"
        cat /tmp/backend_response.json | head -c 200
        echo "..."
    fi
    
    BACKEND_HEALTH=1
else
    echo -e "${RED}❌ Backend Health Check Failed: HTTP $BACKEND_STATUS${NC}"
fi

echo ""
echo "🔍 Testing Frontend Health..."

# Test Frontend Server
FRONTEND_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$FRONTEND_URL" 2>/dev/null)
FRONTEND_STATUS="${FRONTEND_RESPONSE: -3}"

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend Server: $FRONTEND_STATUS OK${NC}"
    FRONTEND_HEALTH=1
else
    echo -e "${RED}❌ Frontend Health Check Failed: HTTP $FRONTEND_STATUS${NC}"
fi

echo ""
echo "🔍 Testing CORS Configuration..."

# Test CORS with OPTIONS request
CORS_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/cors_response.txt \
    -X OPTIONS \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type,Authorization" \
    "$BACKEND_URL/api/v1/" 2>/dev/null)
CORS_STATUS="${CORS_RESPONSE: -3}"

if [ "$CORS_STATUS" = "200" ] || [ "$CORS_STATUS" = "204" ]; then
    echo -e "${GREEN}✅ CORS Preflight: $CORS_STATUS OK${NC}"
    CORS_TEST=1
else
    echo -e "${RED}❌ CORS Test Failed: HTTP $CORS_STATUS${NC}"
fi

echo ""
echo "🔍 Testing API Endpoints..."

# Test various API endpoints
declare -a endpoints=(
    "/api/v1/"
    "/api/v1/auth/register/"
    "/api/v1/waste/categories/"
    "/api/v1/products/categories/"
)

ENDPOINT_PASSED=0
ENDPOINT_TOTAL=${#endpoints[@]}

for endpoint in "${endpoints[@]}"; do
    RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$BACKEND_URL$endpoint" 2>/dev/null)
    STATUS="${RESPONSE: -3}"
    
    case $STATUS in
        200)
            echo -e "${GREEN}✅ $endpoint: $STATUS OK${NC}"
            ((ENDPOINT_PASSED++))
            ;;
        401)
            echo -e "${BLUE}🔐 $endpoint: $STATUS (Authentication Required - Expected)${NC}"
            ((ENDPOINT_PASSED++))
            ;;
        405)
            echo -e "${BLUE}📝 $endpoint: $STATUS (Method Not Allowed - Expected for POST endpoints)${NC}"
            ((ENDPOINT_PASSED++))
            ;;
        *)
            echo -e "${YELLOW}⚠️  $endpoint: $STATUS${NC}"
            ;;
    esac
done

if [ $ENDPOINT_PASSED -eq $ENDPOINT_TOTAL ]; then
    API_ENDPOINTS=1
fi

echo ""
echo "🔍 Testing Environment Configuration..."

# Test environment configuration
if [ $BACKEND_HEALTH -eq 1 ]; then
    echo -e "${GREEN}✅ Backend Configuration:${NC}"
    
    if command -v jq &> /dev/null; then
        echo "   - Platform: $(jq -r '.message' /tmp/backend_response.json 2>/dev/null || echo 'Unknown')"
        echo "   - Version: $(jq -r '.version' /tmp/backend_response.json 2>/dev/null || echo 'Unknown')"
        echo "   - Support Email: $(jq -r '.support.email' /tmp/backend_response.json 2>/dev/null || echo 'Unknown')"
    else
        echo "   - Configuration data available (install jq for detailed parsing)"
    fi
fi

# Test frontend configuration by checking if it serves the expected content
FRONTEND_CONTENT=$(curl -s "$FRONTEND_URL" 2>/dev/null | head -c 500)
if echo "$FRONTEND_CONTENT" | grep -q "Youth Green Jobs\|Vite\|React" 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend Configuration: Detected React/Vite application${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend Configuration: Could not detect application type${NC}"
fi

echo ""
echo "============================================================"
echo "📊 Integration Test Results:"
echo "============================================================"

# Display results
echo -n "BACKEND HEALTH    : "
if [ $BACKEND_HEALTH -eq 1 ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo -n "FRONTEND HEALTH   : "
if [ $FRONTEND_HEALTH -eq 1 ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo -n "CORS CONFIG       : "
if [ $CORS_TEST -eq 1 ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo -n "API ENDPOINTS     : "
if [ $API_ENDPOINTS -eq 1 ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

# Overall result
TOTAL_PASSED=$((BACKEND_HEALTH + FRONTEND_HEALTH + CORS_TEST + API_ENDPOINTS))

echo ""
if [ $TOTAL_PASSED -eq 4 ]; then
    echo -e "${GREEN}🎉 All integration tests passed! Frontend and Backend are communicating properly.${NC}"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Frontend is running on: $FRONTEND_URL"
    echo "   2. Backend API is running on: $BACKEND_URL/api/v1/"
    echo "   3. You can now test user registration, login, and other features"
    echo "   4. Check the browser console for any frontend errors"
    echo "   5. Try accessing the frontend in your browser"
else
    echo -e "${YELLOW}⚠️  Some tests failed ($TOTAL_PASSED/4 passed). Please check the configuration and try again.${NC}"
fi

echo ""
echo "============================================================"

# Cleanup
rm -f /tmp/backend_response.json /tmp/cors_response.txt

exit 0
