#!/bin/bash
# Simple test for face database functionality

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Face Database Simple Test ===${NC}"

# Check if face_db directory exists
if [ ! -d "face_db" ]; then
  echo -e "${YELLOW}Creating face_db directory...${NC}"
  mkdir -p face_db
fi

# List current face database
echo -e "${YELLOW}Current face database:${NC}"
./server/list_face_db.py

# Add a test face if requested
if [ "$1" == "add" ]; then
  echo -e "${YELLOW}Adding a test face to the database...${NC}"
  ./server/add_test_face.py sample_face.jpg 1
fi

# Test finding a face by user ID
echo -e "${YELLOW}Testing face lookup by user ID...${NC}"
if ls face_db/*json > /dev/null 2>&1; then
  # Get user ID from the first face record
  USER_ID=$(grep -o '"user_id": "[^"]*"' face_db/*.json | head -1 | cut -d '"' -f 4)
  
  if [ -n "$USER_ID" ]; then
    echo -e "Looking for faces with user ID: ${USER_ID}"
    MATCHING_FACES=$(grep -l "\"user_id\": \"${USER_ID}\"" face_db/*.json | wc -l)
    if [ "$MATCHING_FACES" -gt 0 ]; then
      echo -e "${GREEN}Found ${MATCHING_FACES} face(s) for user ID: ${USER_ID}${NC}"
      grep -l "\"user_id\": \"${USER_ID}\"" face_db/*.json | xargs basename
    else
      echo -e "${RED}No faces found for user ID: ${USER_ID}${NC}"
    fi
  else
    echo -e "${RED}No user ID found in any face record${NC}"
  fi
else
  echo -e "${RED}No face records found in the database. Add face with './test_db_simple.sh add'${NC}"
fi

echo -e "${YELLOW}=== Test complete ===${NC}"