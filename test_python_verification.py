#!/usr/bin/env python3
import requests
import base64
import json

# Read a test image
with open('deepface/tests/dataset/img1.jpg', 'rb') as f:
    image_data = base64.b64encode(f.read()).decode('utf-8')

# Prepare the request
payload = {
    "image": f"data:image/jpeg;base64,{image_data}",
    "useBasicDetection": False,
    "saveToDb": True,
    "userId": "test_user"
}

# Test the Python verification service
response = requests.post(
    'http://localhost:8000/api/verification/face',
    json=payload,
    headers={'Content-Type': 'application/json'}
)

print("Status Code:", response.status_code)
print("Response:", json.dumps(response.json(), indent=2))