#!/bin/bash

echo "=== Testing Heirloom Face Verification API ==="
echo "This test will verify the face verification API endpoint"
echo 

# Run the API test script
python3 server/test_face_verification.py

echo
echo "=== Test Complete ==="