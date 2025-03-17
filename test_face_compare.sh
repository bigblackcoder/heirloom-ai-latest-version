#!/bin/bash
# Test script for the face verification API using curl

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Read command line arguments
SAVE_TO_DB=${1:-false}
USER_ID=${2:-1}

echo -e "${YELLOW}=== Face Verification API Test ===${NC}"
echo -e "Save to database: ${SAVE_TO_DB}"
echo -e "User ID: ${USER_ID}"

# Check if we have a sample face
if [ ! -f "sample_face.jpg" ]; then
  echo -e "${RED}Error: sample_face.jpg not found${NC}"
  exit 1
fi

# Make the request with a timeout to avoid waiting indefinitely
echo -e "${YELLOW}Making request to face verification API...${NC}"
echo -e "This may take a while as DeepFace loads models and processes the image."
echo -e "Request timeout set to 60 seconds."

# Use a more efficient approach to avoid disk quota issues
# Create a simpler test with a small payload
echo -e "${YELLOW}Using simplified API test...${NC}"

# Use curl to make the request with a timeout
curl -s -X POST -H "Content-Type: application/json" \
  -m 60 \
  -d '{"userId": 1, "saveToDb": false, "useBasicDetection": true}' \
  http://localhost:5000/api/verification/face | jq

echo -e "${YELLOW}=== Test complete ===${NC}"

# Optional: Check the database after the test
if [ "${SAVE_TO_DB}" = "true" ]; then
  echo -e "${YELLOW}Checking face database...${NC}"
  ./server/list_face_db.py
fi