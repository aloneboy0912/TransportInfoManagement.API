#!/bin/bash

# Bash Script to Test Email Backend
# Usage: ./test-email.sh

API_URL="http://localhost:5000/api/email/send"

echo "========================================"
echo "Testing Email Backend"
echo "========================================"
echo "API URL: $API_URL"
echo ""

read -p "Enter recipient email (or press Enter to use configured sender): " TEST_EMAIL

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if [ -z "$TEST_EMAIL" ]; then
    echo "Using configured sender email..."
    BODY=$(cat <<EOF
{
  "subject": "Test Email from Bash - $TIMESTAMP",
  "message": "This is a test email sent from the backend API using Bash script.\n\nIf you received this email, your SendGrid configuration is working correctly!\n\nTest Details:\n- Time: $TIMESTAMP\n- Backend: http://localhost:5000\n- Method: Bash Script",
  "name": "Test User",
  "company": "Excell-On Services"
}
EOF
)
else
    BODY=$(cat <<EOF
{
  "to": "$TEST_EMAIL",
  "subject": "Test Email from Bash - $TIMESTAMP",
  "message": "This is a test email sent from the backend API using Bash script.\n\nIf you received this email, your SendGrid configuration is working correctly!\n\nTest Details:\n- Time: $TIMESTAMP\n- Backend: http://localhost:5000\n- Method: Bash Script",
  "name": "Test User",
  "company": "Excell-On Services"
}
EOF
)
fi

echo "Sending test email..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$BODY")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY_RESPONSE=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ SUCCESS!"
    echo ""
    echo "Response:"
    echo "$BODY_RESPONSE" | jq '.' 2>/dev/null || echo "$BODY_RESPONSE"
    echo ""
    echo "✅ Email sent successfully!"
    echo "📧 Check your inbox!"
else
    echo "❌ ERROR!"
    echo "HTTP Status: $HTTP_CODE"
    echo ""
    echo "Response:"
    echo "$BODY_RESPONSE" | jq '.' 2>/dev/null || echo "$BODY_RESPONSE"
    echo ""
    echo "💡 Troubleshooting:"
    echo "1. Make sure backend is running (dotnet run)"
    echo "2. Check SendGrid API key in appsettings.json"
    echo "3. Verify sender email in SendGrid dashboard"
    echo "4. Check backend console for detailed error messages"
fi

echo ""
echo "========================================"

