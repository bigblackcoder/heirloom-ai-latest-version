#!/bin/bash

# Basic face verification test using simple detection mode
# This avoids the heavyweight DeepFace processing for quicker testing

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Basic Face Verification API Test ===${NC}"

# Test image path
SAMPLE_IMAGE="sample_face.jpg"

# Check if we have a sample image
if [ ! -f "$SAMPLE_IMAGE" ]; then
  echo -e "${RED}Error: Sample image not found at $SAMPLE_IMAGE${NC}"
  echo "Downloading a sample image..."
  curl -s "https://source.unsplash.com/random/300x300/?face" -o "$SAMPLE_IMAGE"
  
  if [ ! -f "$SAMPLE_IMAGE" ]; then
    echo -e "${RED}Failed to download sample image. Exiting.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Sample image downloaded successfully.${NC}"
fi

# Convert image to base64
echo -e "${YELLOW}Converting image to base64...${NC}"
BASE64_IMAGE=$(base64 -w 0 "$SAMPLE_IMAGE")

# Create a temporary file to store the JSON request
TEMP_JSON=$(mktemp)

# Write the JSON data to the temporary file
echo '{
  "image": "data:image/jpeg;base64,'"$BASE64_IMAGE"'",
  "useBasicDetection": true
}' > "$TEMP_JSON"

# Make the API call with basic detection mode
echo -e "${YELLOW}Making API request with basic detection mode...${NC}"
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  --data @"$TEMP_JSON" \
  http://localhost:5000/api/verification/face)

# Remove the temporary file
rm "$TEMP_JSON"

# Display the response
echo -e "${YELLOW}API Response:${NC}"
echo "$RESPONSE" | jq .

# Check if the verification was successful
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}Face verification successful!${NC}"
  
  # Check if we have a face ID
  FACE_ID=$(echo "$RESPONSE" | jq -r '.face_id // empty')
  if [ -n "$FACE_ID" ]; then
    echo -e "${GREEN}Face ID: $FACE_ID${NC}"
  fi
  
  # Display confidence score
  CONFIDENCE=$(echo "$RESPONSE" | jq -r '.confidence // 0')
  echo -e "${GREEN}Confidence: $CONFIDENCE%${NC}"
else
  MESSAGE=$(echo "$RESPONSE" | jq -r '.message')
  echo -e "${RED}Face verification failed: $MESSAGE${NC}"
fi

echo -e "${YELLOW}=== Test complete ===${NC}"