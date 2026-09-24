#!/bin/bash
set -euo pipefail

# Create temporary directory structure
TMP_DIR=$(mktemp -d)
PUBLIC_HTML_DIR="$TMP_DIR/public_html"
mkdir -p "$PUBLIC_HTML_DIR"

# Copy subscribe.php to temp location
cp public_html/subscribe.php "$PUBLIC_HTML_DIR/subscribe.php"

# Start PHP server in background - serve from public_html directory
CID=$(docker run --rm -d --user "$(id -u):$(id -g)" -p 18080:8080 -v "$TMP_DIR:/srv" -w /srv php:8.3-cli php -S 0.0.0.0:8080 -t /srv/public_html)

# Function to clean up
cleanup() {
    if [[ -n "${CID:-}" ]]; then
        docker kill "$CID" > /dev/null 2>&1 || true
    fi
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# Wait for server to start
for i in {1..30}; do
    if [[ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:18080/subscribe.php || true)" != "000" ]]; then
        break
    fi
    sleep 0.5
done

# Test 1: GET request should return 405
echo "Test 1: GET request should return 405"
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:18080/subscribe.php)
if [[ "$STATUS_CODE" -eq 405 ]]; then
    echo "PASS: GET returned 405"
else
    echo "FAIL: GET returned $STATUS_CODE, expected 405"
    exit 1
fi

# Test 2: Valid email should return 200 and write to subscribers.txt
echo "Test 2: Valid email should return 200 and write to subscribers.txt"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" -X POST -d '{"email":"test@example.com"}' http://localhost:18080/subscribe.php)
STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
JSON_RESPONSE=$(echo "$RESPONSE" | head -n-1)

if [[ "$STATUS_CODE" -eq 200 ]]; then
    echo "PASS: Valid email returned 200"
else
    echo "FAIL: Valid email returned $STATUS_CODE, expected 200"
    echo "Response: $JSON_RESPONSE"
    exit 1
fi

# Check if email was written to file
if [[ -f "$TMP_DIR/subscribers.txt" ]] && grep -q "test@example.com" "$TMP_DIR/subscribers.txt"; then
    echo "PASS: Email written to subscribers.txt"
else
    echo "FAIL: Email not written to subscribers.txt"
    exit 1
fi

# Test 3: Same email again (different case) should return 200 and still have one line
echo "Test 3: Same email again (different case) should return 200 and still have one line"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" -X POST -d '{"email":"TEST@EXAMPLE.COM"}' http://localhost:18080/subscribe.php)
STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
JSON_RESPONSE=$(echo "$RESPONSE" | head -n-1)

if [[ "$STATUS_CODE" -eq 200 ]]; then
    echo "PASS: Duplicate email (different case) returned 200"
else
    echo "FAIL: Duplicate email returned $STATUS_CODE, expected 200"
    echo "Response: $JSON_RESPONSE"
    exit 1
fi

# Check that there's still only one line in the file
LINE_COUNT=$(wc -l < "$TMP_DIR/subscribers.txt")
if [[ "$LINE_COUNT" -eq 1 ]]; then
    echo "PASS: Still only one line in subscribers.txt (no duplicates)"
else
    echo "FAIL: Found $LINE_COUNT lines in subscribers.txt, expected 1"
    exit 1
fi

# Test 4: Invalid JSON should return 400
echo "Test 4: Invalid JSON should return 400"
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -X POST -d '{invalid json}' http://localhost:18080/subscribe.php)
if [[ "$STATUS_CODE" -eq 400 ]]; then
    echo "PASS: Invalid JSON returned 400"
else
    echo "FAIL: Invalid JSON returned $STATUS_CODE, expected 400"
    exit 1
fi

# Test 5: Email array instead of string should return 400
echo "Test 5: Email array instead of string should return 400"
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -X POST -d '{"email":["x"]}' http://localhost:18080/subscribe.php)
if [[ "$STATUS_CODE" -eq 400 ]]; then
    echo "PASS: Email array returned 400"
else
    echo "FAIL: Email array returned $STATUS_CODE, expected 400"
    exit 1
fi

# Test 6: Address with control character should return 400
echo "Test 6: Address with control character should return 400"
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -X POST -d '{"email":"test\r@example.com"}' http://localhost:18080/subscribe.php)
if [[ "$STATUS_CODE" -eq 400 ]]; then
    echo "PASS: Email with control character returned 400"
else
    echo "FAIL: Email with control character returned $STATUS_CODE, expected 400"
    exit 1
fi

# Test 7: Address with escaped newline in quoted local part should return 400
echo "Test 7: Address with escaped newline in quoted local part should return 400"
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -X POST -d '{"email":"\"a\\\nb\"@example.com"}' http://localhost:18080/subscribe.php)
if [[ "$STATUS_CODE" -eq 400 ]]; then
    echo "PASS: Email with escaped newline in quoted local part returned 400"
else
    echo "FAIL: Email with escaped newline returned $STATUS_CODE, expected 400"
    exit 1
fi

# Test 8: Legacy migration
echo "Test 8: Legacy migration"
# Clean up previous files
rm -f "$TMP_DIR/subscribers.txt"
# Create legacy file in public_html
touch "$PUBLIC_HTML_DIR/subscribers.txt"
echo "old@example.com" > "$PUBLIC_HTML_DIR/subscribers.txt"

# Subscribe with a new email
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" -X POST -d '{"email":"new@example.com"}' http://localhost:18080/subscribe.php)
STATUS_CODE=$(echo "$RESPONSE" | tail -n1)

if [[ "$STATUS_CODE" -eq 200 ]]; then
    echo "PASS: Subscription after migration returned 200"
else
    echo "FAIL: Subscription after migration returned $STATUS_CODE, expected 200"
    exit 1
fi

# Check that file was moved and new line appended
if [[ -f "$TMP_DIR/subscribers.txt" ]] && grep -q "old@example.com" "$TMP_DIR/subscribers.txt" && grep -q "new@example.com" "$TMP_DIR/subscribers.txt"; then
    echo "PASS: Legacy file was moved and new email added"
else
    echo "FAIL: Legacy file was not properly migrated"
    echo "Contents of $TMP_DIR/subscribers.txt:"
    cat "$TMP_DIR/subscribers.txt" || echo "File does not exist"
    exit 1
fi

echo "All tests passed!"