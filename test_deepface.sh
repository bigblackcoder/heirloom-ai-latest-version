#!/bin/bash

echo "=== DeepFace Integration Test ==="
echo "Step 1: Downloading sample face image..."
python3 server/download_sample_face.py

echo ""
echo "Step 2: Running face verification test..."
python3 server/test_face_verification.py

echo ""
echo "=== Test Complete ==="