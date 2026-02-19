#!/bin/bash

echo "=== FenStore Rating System Test ==="
echo ""

# Configuration
BASE_URL="http://localhost:5000/api/rating"
MATERIAL_ID="your-material-id-here"  # Replace with actual material ID
TOKEN="your-jwt-token-here"          # Replace with actual JWT token

echo "Testing Rating System Endpoints..."
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Get top rated materials (no auth required)
echo "1. Testing GET /rating/top (Top Rated Materials)"
echo "   Command: curl -s $BASE_URL/top?limit=5"
curl -s "$BASE_URL/top?limit=5" | jq '.' || echo "❌ Failed"
echo ""

# Test 2: Get material rating stats (no auth required)
echo "2. Testing GET /rating/material/:id/stats (Material Stats)"
echo "   Note: Replace MATERIAL_ID in the script"
# Uncomment when you have a material ID
# curl -s "$BASE_URL/material/$MATERIAL_ID/stats" | jq '.'
echo "   ⚠️  Skipped - Set MATERIAL_ID in script"
echo ""

# Test 3: Get all ratings for a material (no auth required)
echo "3. Testing GET /rating/material/:id (All Ratings)"
# Uncomment when you have a material ID
# curl -s "$BASE_URL/material/$MATERIAL_ID" | jq '.'
echo "   ⚠️  Skipped - Set MATERIAL_ID in script"
echo ""

# Test 4: Create/Update rating (auth required)
echo "4. Testing POST /rating/:id (Rate Material)"
echo "   Note: Requires JWT token"
# Uncomment when you have token and material ID
# curl -s -X POST "$BASE_URL/$MATERIAL_ID" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d '{"value": 5, "comment": "Test rating from script"}' | jq '.'
echo "   ⚠️  Skipped - Set TOKEN and MATERIAL_ID in script"
echo ""

# Test 5: Get user's rating for a material (auth required)
echo "5. Testing GET /rating/my/:id (My Rating for Material)"
# Uncomment when you have token and material ID
# curl -s "$BASE_URL/my/$MATERIAL_ID" \
#   -H "Authorization: Bearer $TOKEN" | jq '.'
echo "   ⚠️  Skipped - Set TOKEN and MATERIAL_ID in script"
echo ""

# Test 6: Get all user's ratings (auth required)
echo "6. Testing GET /rating/my (All My Ratings)"
# Uncomment when you have token
# curl -s "$BASE_URL/my" \
#   -H "Authorization: Bearer $TOKEN" | jq '.'
echo "   ⚠️  Skipped - Set TOKEN in script"
echo ""

echo "=== Test Complete ===" 
echo ""
echo "To run authenticated tests:"
echo "1. Login to your app and get a JWT token"
echo "2. Create/get a material ID from the database"
echo "3. Update TOKEN and MATERIAL_ID variables in this script"
echo "4. Uncomment the test commands you want to run"
echo ""
