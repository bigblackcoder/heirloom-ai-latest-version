#!/bin/bash
# Basic face verification test using the API's fallback basic detection

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Basic Face Verification Test ===${NC}"

# Make a direct call to detect face without full verification
echo -e "${YELLOW}Calling server API with basicDetection option...${NC}"

curl -s -X POST -H "Content-Type: application/json" \
  -d '{"useBasicDetection": true}' \
  http://localhost:5000/api/verification/face | jq

echo -e "${YELLOW}=== Test complete ===${NC}"

# Now let's check if our face database is working correctly
echo -e "${YELLOW}=== Database Integration Test ===${NC}"

# List the current face records
echo -e "${YELLOW}Current face database:${NC}"
./server/list_face_db.py

# Check if we can look up a user by ID
echo -e "${YELLOW}Testing user lookup in database...${NC}"
USER_ID=1

# First check if we have any records with this user ID
RECORDS=$(find face_db -name "*.json" -exec grep -l "\"user_id\": \"${USER_ID}\"" {} \; | wc -l)

if [ "$RECORDS" -gt 0 ]; then
  echo -e "${GREEN}Found ${RECORDS} face record(s) for user ID: ${USER_ID}${NC}"
  
  # Create a simplified API test for user matching
  echo -e "${YELLOW}Testing face matching for user ID: ${USER_ID}${NC}"
  
  # Make request without image data but with user ID to test the match logic
  curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"userId\": ${USER_ID}, \"useBasicDetection\": true, \"checkDbOnly\": true}" \
    http://localhost:5000/api/verification/face | jq
else
  echo -e "${RED}No face records found for user ID: ${USER_ID}${NC}"
  echo -e "Run './test_db_simple.sh add' to add a test face first."
fi

echo -e "${YELLOW}=== Test complete ===${NC}"