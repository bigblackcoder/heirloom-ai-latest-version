#!/bin/bash

echo "=== Testing DeepFace Face Verification ==="
echo "This test will compare two faces using DeepFace.verify"
echo 

# Run the face comparison test
python3 server/test_face_compare.py

echo
echo "=== Test Complete ==="