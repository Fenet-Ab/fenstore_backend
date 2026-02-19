#!/bin/bash

# Test script to verify backend API endpoints

echo "=== FenStore Backend API Test ==="
echo ""

# Test 1: Check if backend is running
echo "1. Testing if backend is running on port 5000..."
if lsof -i :5000 | grep -q LISTEN; then
    echo "   ✅ Backend is running on port 5000"
else
    echo "   ❌ Backend is NOT running on port 5000"
    exit 1
fi

echo ""

# Test 2: Test health/basic endpoint
echo "2. Testing basic API connectivity..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api)
if [ "$RESPONSE" -eq 404 ] || [ "$RESPONSE" -eq 200 ]; then
    echo "   ✅ API is responding (HTTP $RESPONSE)"
else
    echo "   ⚠️  API returned HTTP $RESPONSE"
fi

echo ""

# Test 3: Test admin endpoint without auth
echo "3. Testing admin endpoint without authentication..."
RESPONSE=$(curl -s http://localhost:5000/api/order/admin/all)
echo "   Response: $RESPONSE"

echo ""

# Test 4: Check if you need to login
echo "4. Next steps:"
echo "   - If you see '403 Forbidden' or 'Unauthorized', you need to:"
echo "     a) Login to your application"
echo "     b) Make sure you're logged in as an ADMIN user"
echo "     c) Check that your JWT token is valid"
echo ""
echo "   - To test with authentication, you need a valid JWT token"
echo ""

echo "=== Test Complete ===" 
