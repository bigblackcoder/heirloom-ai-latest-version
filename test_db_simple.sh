#!/bin/bash

# Simplified test script for face database
echo "Testing basic face database functionality..."

# Test 1: API-based verification with database connection
echo "Test 1: API-based verification with database connection"
curl -X POST http://localhost:5000/api/verification/face \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "data:image/jpeg;base64,'$(base64 -w 0 sample_face.jpg)'", 
    "userId": 1,
    "saveToDb": true
  }' | jq .

# Sleep to ensure face is saved
sleep 1

# Test 2: API-based verification with database lookup for the same image
echo "Test 2: API-based verification with database lookup for the same image"
curl -X POST http://localhost:5000/api/verification/face \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "data:image/jpeg;base64,'$(base64 -w 0 sample_face.jpg)'", 
    "userId": 1,
    "saveToDb": false
  }' | jq .

echo "Basic face database test complete!"