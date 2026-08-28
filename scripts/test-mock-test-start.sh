#!/bin/zsh
# Test script for /api/mock-test/start
#
# The endpoint requires an authenticated session (JWT cookie: bhasaguru.session-token).
# Without the cookie, the API correctly returns 401 {"success":false,"message":"Unauthorized"}.
#
# Usage:
#   1. Copy your session token from the browser:
#      DevTools -> Application -> Cookies -> http://localhost:3000 -> bhasaguru.session-token
#   2. Run:
#      ./scripts/test-mock-test-start.sh <testId> <session-token>
#
# Or export SESSION_TOKEN and run:
#   ./scripts/test-mock-test-start.sh <testId>

TEST_ID="${1:-cmtd8hiob0000dsijp41j11bc}"
SESSION_TOKEN="${2:-$SESSION_TOKEN}"
BASE_URL="${BASE_URL:-http://localhost:3000}"

if [ -z "$SESSION_TOKEN" ]; then
  echo "❌ No session token provided."
  echo ""
  echo "This API requires authentication. Get your token from the browser:"
  echo "  DevTools -> Application -> Cookies -> bhasaguru.session-token"
  echo ""
  echo "Usage: $0 <testId> <session-token>"
  echo "   or: SESSION_TOKEN=<token> $0 <testId>"
  exit 1
fi

echo "→ GET $BASE_URL/api/mock-test/start?testId=$TEST_ID (with session cookie)"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Cookie: bhasaguru.session-token=$SESSION_TOKEN" \
  "$BASE_URL/api/mock-test/start?testId=$TEST_ID")

HTTP_STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
  echo "$BODY" | jq -r '
    "Success: \(.success)",
    "Total questions: \(.data.totalQuestions)",
    "Test: \(.data.test.title // "n/a")",
    "--- First 3 questions ---",
    (.data.questions[:3][] | "  \(.type // "unknown"): \(.questionText[:60])")
  '
else
  echo "Response:"
  echo "$BODY" | jq .
  echo ""
  if [ "$HTTP_STATUS" = "401" ]; then
    echo "❌ 401 Unauthorized — the session token is missing, expired, or invalid."
    echo "   Re-copy the cookie value from your browser (you may need to log in again)."
  fi
fi