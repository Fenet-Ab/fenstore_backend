#!/bin/bash

# Script to create an admin user for FenStore

echo "=== Create Admin User for FenStore ==="
echo ""

# Prompt for admin details
read -p "Enter admin name: " ADMIN_NAME
read -p "Enter admin email: " ADMIN_EMAIL
read -sp "Enter admin password: " ADMIN_PASSWORD
echo ""

# Create admin user
echo ""
echo "Creating admin user..."

RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$ADMIN_NAME\",
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"role\": \"ADMIN\"
  }")

echo "Response: $RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q "id"; then
    echo "✅ Admin user created successfully!"
    echo ""
    echo "You can now login with:"
    echo "  Email: $ADMIN_EMAIL"
    echo "  Password: (the password you entered)"
    echo ""
    echo "Next steps:"
    echo "  1. Go to http://localhost:3000/login"
    echo "  2. Login with the credentials above"
    echo "  3. Navigate to http://localhost:3000/Admin"
else
    echo "❌ Failed to create admin user"
    echo "Please check if:"
    echo "  - The backend is running"
    echo "  - The email is not already registered"
    echo "  - The database is connected"
fi

echo ""
echo "=== Script Complete ===" 
