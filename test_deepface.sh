#!/bin/bash

echo "=== Heirloom Identity Verification Testing Suite ==="
echo "This script will set up the testing environment for face verification"
echo 

# Download sample face image
echo "Step 1: Download sample face for testing"
python3 server/download_sample_face.py

# Run basic face detection test
echo 
echo "Step 2: Run basic face verification test"
python3 server/test_basic_verify.py

echo
echo "=== Setup Complete ==="
echo "You can now test the face verification API endpoint"