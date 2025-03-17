#!/bin/bash

# Test script for face database lookup functionality
echo "Testing face database functionality..."

# Step 1: Save a face to the database
echo "Step 1: Adding a face to the database..."
FACE_IMAGE="sample_face.jpg"
USER_ID=1

# First, make sure we have a sample face
if [ ! -f "$FACE_IMAGE" ]; then
  echo "  - No sample face found, downloading one..."
  python3 server/download_sample_face.py
fi

# Run Python directly to save the face
FACE_ID=$(python3 -c "
import sys
sys.path.append('server')
from face_verification import verify_face, save_face_to_db

# Save the face
face_id = save_face_to_db('$FACE_IMAGE', $USER_ID)
print(face_id)
")

echo "  - Added face with ID: $FACE_ID"

# Step 2: Test matching by verifying the same face
echo "Step 2: Testing face matching..."
MATCH_RESULT=$(python3 -c "
import sys, json
sys.path.append('server')
from face_verification import verify_face

# Verify the same face against the database
result = verify_face('$FACE_IMAGE', '$USER_ID', False)
print(json.dumps(result))
")

echo "  - Match result: $MATCH_RESULT"

# Step 3: Test with a slightly different image if available
echo "Step 3: Testing with alternate image..."
if [ -f "img2.jpg" ]; then
  ALT_RESULT=$(python3 -c "
  import sys, json
  sys.path.append('server')
  from face_verification import verify_face
  
  # Verify a different face against the database
  result = verify_face('img2.jpg', '$USER_ID', False)
  print(json.dumps(result))
  ")
  
  echo "  - Alternate image match result: $ALT_RESULT"
else 
  echo "  - No alternate test image available. Skipping..."
fi

echo "Face database test complete!"