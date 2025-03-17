#!/bin/bash

echo "=== Testing Basic Face Detection ==="
echo "This test will perform basic face detection without DeepFace"
echo 

# Run the basic face detection test
python3 server/test_basic_verify.py

echo
echo "=== Test Complete ==="